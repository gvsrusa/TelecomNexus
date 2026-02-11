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

  // Rate limiting (200 requests per minute per IP)
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use(limiter);

  // CORS
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

main().catch((err) => {
  console.error('[gateway] Failed to start:', err);
  process.exit(1);
});
