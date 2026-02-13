import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import { connectCassandra } from './cassandra';
import { InvoiceModel, PaymentModel } from './models';
import { generatePaymentReceipt } from './lib/receipt';

const PORT = Number(process.env.PORT ?? 4003);
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/telecom_nexus';

async function main(): Promise<void> {
  // Connect to databases
  await mongoose.connect(MONGO_URI);
  console.log('[billing-service] Connected to MongoDB');

  try {
    await connectCassandra();
  } catch (err) {
    console.warn('[billing-service] Cassandra connection failed (will retry on queries):', err);
  }

  // Build federated schema
  const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  // Express app + HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Apollo Server (no subscriptions needed for billing service)
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
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
      service: 'billing-service',
      uptime: process.uptime(),
    });
  });

  // REST: XML payment receipt
  app.get('/api/receipts/:paymentId.xml', async (req, res) => {
    try {
      const payment = await PaymentModel.findOne({
        paymentId: req.params['paymentId'],
      });
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      const invoice = await InvoiceModel.findById(payment.invoiceId);
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      // Get customer from the customers collection
      const customerCollection = mongoose.connection.db?.collection('customers');
      const customer = await customerCollection?.findOne({
        customerId: payment.customerId,
      });
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      const xml = generatePaymentReceipt(
        {
          paymentId: payment.paymentId,
          amount: payment.amount,
          method: payment.method,
          transactionRef: payment.transactionRef,
          processedAt: payment.processedAt,
        },
        {
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
        },
        {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
        },
      );
      res.type('application/xml').send(xml);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`[billing-service] GraphQL ready at http://localhost:${PORT}/graphql`);
    console.log(`[billing-service] Health check at http://localhost:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error('[billing-service] Failed to start:', err);
  process.exit(1);
});
