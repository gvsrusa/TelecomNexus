import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { GraphQLError, type ASTVisitor, type ValidationContext } from 'graphql';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import http from 'http';

const PORT = Number(process.env.PORT ?? 4000);

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL ?? 'http://localhost:4001/graphql';
const NETWORK_SERVICE_URL = process.env.NETWORK_SERVICE_URL ?? 'http://localhost:4002/graphql';
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL ?? 'http://localhost:4003/graphql';

// Wait for all subgraphs to be reachable before starting the gateway
async function waitForSubgraphs(urls: string[], maxRetries = 30, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const healthUrl = url.replace('/graphql', '/health');
        const res = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) });
        if (!res.ok) throw new Error(`${healthUrl} returned ${res.status}`);
      }),
    );
    const allReady = results.every((r) => r.status === 'fulfilled');
    if (allReady) {
      console.log(`[gateway] All subgraphs reachable (attempt ${attempt})`);
      return;
    }
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? urls[i] : null))
      .filter(Boolean);
    console.log(
      `[gateway] Waiting for subgraphs (attempt ${attempt}/${maxRetries}): ${failed.join(', ')}`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error('Subgraphs did not become available in time');
}

// Depth-limiting validation rule
function depthLimitRule(maxDepth: number) {
  return function DepthLimit(context: ValidationContext): ASTVisitor {
    function checkDepth(
      node: { selectionSet?: { selections: readonly unknown[] } },
      currentDepth: number,
    ): void {
      if (currentDepth > maxDepth) {
        context.reportError(
          new GraphQLError(
            `Query depth of ${currentDepth} exceeds maximum allowed depth of ${maxDepth}`,
          ),
        );
        return;
      }
      if (node.selectionSet) {
        for (const selection of node.selectionSet.selections) {
          checkDepth(
            selection as { selectionSet?: { selections: readonly unknown[] } },
            currentDepth + 1,
          );
        }
      }
    }

    return {
      OperationDefinition(node) {
        checkDepth(node, 0);
      },
    };
  };
}

async function main(): Promise<void> {
  // Wait for subgraphs to be healthy before composing
  await waitForSubgraphs([CUSTOMER_SERVICE_URL, NETWORK_SERVICE_URL, BILLING_SERVICE_URL]);

  // Create Apollo Gateway with IntrospectAndCompose
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'customer', url: CUSTOMER_SERVICE_URL },
        { name: 'network', url: NETWORK_SERVICE_URL },
        { name: 'billing', url: BILLING_SERVICE_URL },
      ],
    }),
  });

  // Express app + HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Apollo Server with gateway
  const server = new ApolloServer({
    gateway,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    validationRules: [depthLimitRule(7)],
  });
  await server.start();

  // CORS — must come BEFORE rate limiter so preflight responses include CORS headers
  app.use(
    cors({
      origin: [
        'http://localhost:3000', // Shell app
        'http://localhost:3001', // Customer portal
        'http://localhost:3002', // NOC dashboard
        'http://localhost:3003', // Billing console
      ],
      credentials: true,
    }) as express.RequestHandler,
  );

  // Rate limiting (1000 requests per minute per IP — generous for dev/demo)
  // Skip preflight OPTIONS requests so CORS is never blocked
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use(limiter);

  app.use(express.json());

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Pass through any authorization headers
        return {
          headers: req.headers,
        };
      },
    }) as unknown as express.RequestHandler,
  );

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'gateway',
      uptime: process.uptime(),
      subgraphs: ['customer', 'network', 'billing'],
    });
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`[gateway] Apollo Gateway ready at http://localhost:${PORT}/graphql`);
    console.log(`[gateway] Health check at http://localhost:${PORT}/health`);
  });
}

// Retry main with exponential backoff (useful when subgraphs restart with schema changes)
async function startWithRetry(maxRetries = 5, baseDelayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await main();
      return; // success
    } catch (err) {
      console.error(`[gateway] Start attempt ${attempt}/${maxRetries} failed:`, err);
      if (attempt === maxRetries) {
        console.error('[gateway] All retries exhausted, exiting.');
        process.exit(1);
      }
      const delay = baseDelayMs * attempt;
      console.log(`[gateway] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

startWithRetry();
