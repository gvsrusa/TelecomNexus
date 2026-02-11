import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { InvoiceModel, PaymentModel } from './models';
import { getCDRs, getDailyUsage, getCurrentUsage } from './cassandra';
import { payInvoiceSchema } from './validation';

// DateTime scalar
const DateTimeScalar = {
  __serialize(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    throw new GraphQLError('DateTime must be a Date or ISO string');
  },
  __parseValue(value: unknown): Date {
    if (typeof value === 'string') return new Date(value);
    throw new GraphQLError('DateTime must be an ISO 8601 string');
  },
  __parseLiteral(ast: { kind: string; value?: string }): Date {
    if (ast.kind === 'StringValue' && ast.value) return new Date(ast.value);
    throw new GraphQLError('DateTime must be an ISO 8601 string');
  },
};

// Track idempotency keys to prevent duplicate payments
const processedIdempotencyKeys = new Set<string>();

/** Generate next payment ID */
async function nextPaymentId(): Promise<string> {
  const count = await PaymentModel.countDocuments();
  return `PAY-${String(count + 1).padStart(6, '0')}`;
}

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    invoice: async (_: unknown, args: { invoiceNumber: string }) => {
      return InvoiceModel.findOne({ invoiceNumber: args.invoiceNumber });
    },
  },

  Mutation: {
    payInvoice: async (
      _: unknown,
      args: {
        invoiceNumber: string;
        method: string;
        idempotencyKey: string;
      },
    ) => {
      const parsed = payInvoiceSchema.parse(args);

      // Idempotency check
      if (processedIdempotencyKeys.has(parsed.idempotencyKey)) {
        const existingPayment = await PaymentModel.findOne({
          transactionRef: parsed.idempotencyKey,
        });
        if (existingPayment) {
          const invoice = await InvoiceModel.findById(existingPayment.invoiceId);
          return {
            success: true,
            payment: {
              paymentId: existingPayment.paymentId,
              invoiceNumber: invoice?.invoiceNumber ?? parsed.invoiceNumber,
              amount: existingPayment.amount,
              method: existingPayment.method,
              status: existingPayment.status,
              transactionRef: existingPayment.transactionRef,
              processedAt: existingPayment.processedAt,
            },
            errorMessage: null,
          };
        }
      }

      const invoice = await InvoiceModel.findOne({
        invoiceNumber: parsed.invoiceNumber,
      });
      if (!invoice) {
        return {
          success: false,
          payment: null,
          errorMessage: `Invoice ${parsed.invoiceNumber} not found`,
        };
      }

      if (invoice.status === 'PAID') {
        return {
          success: false,
          payment: null,
          errorMessage: `Invoice ${parsed.invoiceNumber} is already paid`,
        };
      }

      // Create payment
      const paymentId = await nextPaymentId();
      const payment = await PaymentModel.create({
        paymentId,
        customerId: invoice.customerId,
        invoiceId: invoice._id,
        amount: invoice.totalAmount,
        method: parsed.method,
        status: 'SUCCESS',
        transactionRef: parsed.idempotencyKey,
        processedAt: new Date(),
      });

      // Update invoice status
      invoice.status = 'PAID';
      invoice.paidAt = new Date();
      await invoice.save();

      processedIdempotencyKeys.add(parsed.idempotencyKey);

      return {
        success: true,
        payment: {
          paymentId: payment.paymentId,
          invoiceNumber: invoice.invoiceNumber,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionRef: payment.transactionRef,
          processedAt: payment.processedAt,
        },
        errorMessage: null,
      };
    },

    toggleAutoPay: async (_: unknown, args: { customerId: string; enabled: boolean }) => {
      // Update autoPayEnabled in customers collection
      // Since this is the billing subgraph, we need to update through mongoose
      // We access the Customer collection directly
      const customerCollection = mongoose.connection.db?.collection('customers');
      if (!customerCollection) {
        throw new GraphQLError('Database not available');
      }

      await customerCollection.updateOne(
        { customerId: args.customerId },
        { $set: { autoPayEnabled: args.enabled } },
      );

      return { customerId: args.customerId, autoPayEnabled: args.enabled };
    },
  },

  // Federation: Extend Customer entity from customer-service
  Customer: {
    __resolveReference: async (reference: { customerId: string }) => {
      // Return just the customerId — other fields come from customer-service
      return { customerId: reference.customerId };
    },

    invoices: async (
      parent: { customerId: string },
      args: { status?: string | undefined; limit?: number | undefined },
    ) => {
      const filter: Record<string, unknown> = {
        customerId: parent.customerId,
      };
      if (args.status) filter['status'] = args.status;

      let query = InvoiceModel.find(filter).sort({ createdAt: -1 });
      if (args.limit) query = query.limit(args.limit);
      return query;
    },

    payments: async (parent: { customerId: string }, args: { limit?: number | undefined }) => {
      let query = PaymentModel.find({ customerId: parent.customerId }).sort({
        processedAt: -1,
      });
      if (args.limit) query = query.limit(args.limit);

      const payments = await query;
      // Map to include invoiceNumber
      return Promise.all(
        payments.map(async (p) => {
          const invoice = await InvoiceModel.findById(p.invoiceId);
          return {
            paymentId: p.paymentId,
            invoiceNumber: invoice?.invoiceNumber ?? 'N/A',
            amount: p.amount,
            method: p.method,
            status: p.status,
            transactionRef: p.transactionRef,
            processedAt: p.processedAt,
          };
        }),
      );
    },

    currentUsage: async (parent: { customerId: string }) => {
      try {
        const usage = await getCurrentUsage(parent.customerId);
        return {
          ...usage,
          dataLimitGB: null,
          voiceLimitMinutes: null,
          smsLimit: null,
        };
      } catch {
        // Return empty usage if Cassandra is unavailable
        return {
          dataUsedGB: 0,
          dataLimitGB: null,
          voiceUsedMinutes: 0,
          voiceLimitMinutes: null,
          smsCount: 0,
          smsLimit: null,
          billingCycleStart: new Date(),
          billingCycleEnd: new Date(),
        };
      }
    },

    usageByDay: async (parent: { customerId: string }, args: { month: string }) => {
      try {
        return getDailyUsage(parent.customerId, args.month);
      } catch {
        return [];
      }
    },

    callHistory: async (
      parent: { customerId: string },
      args: {
        month: string;
        first?: number | undefined;
        after?: string | undefined;
      },
    ) => {
      try {
        return getCDRs(parent.customerId, args.month, args.first ?? 20, args.after ?? undefined);
      } catch {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        };
      }
    },

    autoPayEnabled: async (parent: {
      customerId: string;
      autoPayEnabled?: boolean | undefined;
    }) => {
      if (parent.autoPayEnabled !== undefined) return parent.autoPayEnabled;
      // Look up from customers collection
      const customerCollection = mongoose.connection.db?.collection('customers');
      if (!customerCollection) return false;
      const customer = await customerCollection.findOne({
        customerId: parent.customerId,
      });
      return customer?.['autoPayEnabled'] ?? false;
    },
  },
};
