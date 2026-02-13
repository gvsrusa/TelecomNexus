import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import mongoose from 'mongoose';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import { CustomerModel } from './models';
import { parseCustomersFromXml, exportCustomersToXml } from './lib/customer-xml';

const PORT = Number(process.env.PORT ?? 4001);
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/telecom_nexus';

async function main(): Promise<void> {
  // Connect to MongoDB
  await mongoose.connect(MONGO_URI);
  console.log('[customer-service] Connected to MongoDB');

  // Build federated schema
  const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  // Express app + HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // WebSocket server for GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks -- graphql-ws useServer is not a React hook
  const serverCleanup = useServer({ schema }, wsServer);

  // Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async () => ({}),
    }) as unknown as express.RequestHandler,
  );

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'customer-service',
      uptime: process.uptime(),
    });
  });

  // REST: Import customers from XML
  app.post(
    '/api/import/customers',
    express.text({ type: ['application/xml', 'text/xml'] }),
    async (req, res) => {
      try {
        const customers = parseCustomersFromXml(req.body as string);
        let imported = 0;
        for (const c of customers) {
          await CustomerModel.updateOne(
            { customerId: c.customerId },
            { $set: c },
            { upsert: true },
          );
          imported++;
        }
        res.json({ imported });
      } catch (err) {
        res.status(400).json({ error: String(err) });
      }
    },
  );

  // REST: Export customers as XML
  app.get('/api/export/customers', async (_req, res) => {
    try {
      const customers = await CustomerModel.find({}).lean();
      const xml = exportCustomersToXml(customers as Parameters<typeof exportCustomersToXml>[0]);
      res.type('application/xml').send(xml);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`[customer-service] GraphQL ready at http://localhost:${PORT}/graphql`);
    console.log(`[customer-service] Subscriptions at ws://localhost:${PORT}/graphql`);
    console.log(`[customer-service] Health check at http://localhost:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error('[customer-service] Failed to start:', err);
  process.exit(1);
});
