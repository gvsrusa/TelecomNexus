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
import { connectCassandra } from './cassandra';
import { DeviceModel } from './models';
import { generateAlertRssFeed } from './lib/rss';
import { generateSampleDeviceConfig } from './lib/device-config';
import { getAlerts } from './cassandra';

const PORT = Number(process.env.PORT ?? 4002);
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/telecom_nexus';

async function main(): Promise<void> {
  // Connect to databases
  await mongoose.connect(MONGO_URI);
  console.log('[network-service] Connected to MongoDB');

  try {
    await connectCassandra();
  } catch (err) {
    console.warn('[network-service] Cassandra connection failed (will retry on queries):', err);
  }

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
      service: 'network-service',
      uptime: process.uptime(),
    });
  });

  // REST: RSS feed of alerts
  app.get('/api/alerts/rss', async (_req, res) => {
    try {
      const alerts = await getAlerts({});
      const rssAlerts = alerts.slice(0, 50).map((a) => ({
        alertId: a.alertId,
        deviceId: a.deviceId,
        severity: a.severity,
        title: a.title,
        description: a.description,
        timestamp: a.timestamp,
      }));
      const xml = generateAlertRssFeed(rssAlerts);
      res.type('application/rss+xml').send(xml);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // REST: Device config XML
  app.get('/api/devices/:deviceId/config.xml', async (req, res) => {
    try {
      const device = await DeviceModel.findOne({
        deviceId: req.params['deviceId'],
      });
      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      // If device has stored config XML, return it; otherwise generate sample
      if (device.configXml) {
        res.type('application/xml').send(device.configXml);
      } else {
        const xml = generateSampleDeviceConfig(device);
        res.type('application/xml').send(xml);
      }
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`[network-service] GraphQL ready at http://localhost:${PORT}/graphql`);
    console.log(`[network-service] Subscriptions at ws://localhost:${PORT}/graphql`);
    console.log(`[network-service] Health check at http://localhost:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error('[network-service] Failed to start:', err);
  process.exit(1);
});
