import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the models
vi.mock('../models', () => ({
  InvoiceModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
  },
  PaymentModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

// Mock cassandra functions
vi.mock('../cassandra', () => ({
  getCDRs: vi.fn(),
  getDailyUsage: vi.fn(),
  getCurrentUsage: vi.fn(),
}));

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    connection: {
      db: {
        collection: vi.fn().mockReturnValue({
          findOne: vi.fn(),
          updateOne: vi.fn(),
        }),
      },
    },
  },
}));

import { resolvers } from '../resolvers';
import { InvoiceModel, PaymentModel } from '../models';

const mockedInvoiceModel = vi.mocked(InvoiceModel);
const mockedPaymentModel = vi.mocked(PaymentModel);

describe('Billing Service Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query.invoice', () => {
    it('returns an invoice by invoiceNumber', async () => {
      const mockInvoice = {
        invoiceNumber: 'INV-2026-0001',
        totalAmount: 99.99,
      };
      mockedInvoiceModel.findOne.mockResolvedValue(mockInvoice as never);

      const result = await resolvers.Query.invoice(null, {
        invoiceNumber: 'INV-2026-0001',
      });
      expect(result).toEqual(mockInvoice);
    });

    it('returns null for non-existent invoice', async () => {
      mockedInvoiceModel.findOne.mockResolvedValue(null as never);

      const result = await resolvers.Query.invoice(null, {
        invoiceNumber: 'INV-9999',
      });
      expect(result).toBeNull();
    });
  });

  describe('Mutation.payInvoice', () => {
    it('processes payment for valid invoice', async () => {
      const mockInvoice = {
        _id: 'inv1',
        invoiceNumber: 'INV-2026-0001',
        customerId: 'CUST-0001',
        totalAmount: 99.99,
        status: 'DUE',
        save: vi.fn().mockResolvedValue(undefined),
      };
      const mockPayment = {
        paymentId: 'PAY-000001',
        customerId: 'CUST-0001',
        invoiceId: 'inv1',
        amount: 99.99,
        method: 'CREDIT_CARD',
        status: 'SUCCESS',
        transactionRef: 'idem-key-1',
        processedAt: new Date(),
      };

      mockedInvoiceModel.findOne.mockResolvedValue(mockInvoice as never);
      mockedPaymentModel.countDocuments.mockResolvedValue(0 as never);
      mockedPaymentModel.create.mockResolvedValue(mockPayment as never);

      const result = await resolvers.Mutation.payInvoice(null, {
        invoiceNumber: 'INV-2026-0001',
        method: 'CREDIT_CARD',
        idempotencyKey: 'idem-key-1',
      });

      expect(result.success).toBe(true);
      expect(result.payment).toBeTruthy();
      expect(mockInvoice.save).toHaveBeenCalled();
    });

    it('returns error for non-existent invoice', async () => {
      mockedInvoiceModel.findOne.mockResolvedValue(null as never);

      const result = await resolvers.Mutation.payInvoice(null, {
        invoiceNumber: 'INV-9999',
        method: 'CREDIT_CARD',
        idempotencyKey: 'idem-new-key',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('not found');
    });

    it('returns error for already paid invoice', async () => {
      const mockInvoice = {
        invoiceNumber: 'INV-2026-0001',
        status: 'PAID',
      };
      mockedInvoiceModel.findOne.mockResolvedValue(mockInvoice as never);

      const result = await resolvers.Mutation.payInvoice(null, {
        invoiceNumber: 'INV-2026-0001',
        method: 'CREDIT_CARD',
        idempotencyKey: 'idem-another-key',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('already paid');
    });

    it('rejects invalid method via Zod', async () => {
      await expect(
        resolvers.Mutation.payInvoice(null, {
          invoiceNumber: 'INV-2026-0001',
          method: 'CASH',
          idempotencyKey: 'idem-bad-method',
        }),
      ).rejects.toThrow();
    });

    it('rejects empty invoiceNumber via Zod', async () => {
      await expect(
        resolvers.Mutation.payInvoice(null, {
          invoiceNumber: '',
          method: 'CREDIT_CARD',
          idempotencyKey: 'idem-empty-inv',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Customer.invoices', () => {
    it('fetches invoices for a customer', async () => {
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockedInvoiceModel.find.mockReturnValue(mockQuery as never);

      await resolvers.Customer.invoices({ customerId: 'CUST-0001' }, { limit: 5 });

      expect(mockedInvoiceModel.find).toHaveBeenCalledWith({
        customerId: 'CUST-0001',
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('Customer.__resolveReference', () => {
    it('returns object with customerId', async () => {
      const result = await resolvers.Customer.__resolveReference({
        customerId: 'CUST-0001',
      });
      expect(result).toEqual({ customerId: 'CUST-0001' });
    });
  });

  describe('DateTime scalar', () => {
    it('serializes Date to ISO string', () => {
      const date = new Date('2026-01-15T10:30:00.000Z');
      expect(resolvers.DateTime.__serialize(date)).toBe('2026-01-15T10:30:00.000Z');
    });

    it('serializes string passthrough', () => {
      expect(resolvers.DateTime.__serialize('2026-01-15')).toBe('2026-01-15');
    });

    it('throws for invalid types', () => {
      expect(() => resolvers.DateTime.__serialize(42)).toThrow();
    });

    it('parses string to Date', () => {
      const result = resolvers.DateTime.__parseValue('2026-01-15T10:30:00.000Z');
      expect(result).toBeInstanceOf(Date);
    });
  });
});
