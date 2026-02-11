import { describe, it, expect } from 'vitest';
import { payInvoiceSchema } from '../validation';

describe('payInvoiceSchema', () => {
  it('accepts valid payment input', () => {
    const result = payInvoiceSchema.safeParse({
      invoiceNumber: 'INV-2026-0001',
      method: 'CREDIT_CARD',
      idempotencyKey: 'key-123',
    });
    expect(result.success).toBe(true);
  });

  it('accepts BANK_TRANSFER method', () => {
    const result = payInvoiceSchema.safeParse({
      invoiceNumber: 'INV-2026-0001',
      method: 'BANK_TRANSFER',
      idempotencyKey: 'key-456',
    });
    expect(result.success).toBe(true);
  });

  it('accepts DIGITAL_WALLET method', () => {
    const result = payInvoiceSchema.safeParse({
      invoiceNumber: 'INV-2026-0001',
      method: 'DIGITAL_WALLET',
      idempotencyKey: 'key-789',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid payment method', () => {
    const result = payInvoiceSchema.safeParse({
      invoiceNumber: 'INV-2026-0001',
      method: 'CASH',
      idempotencyKey: 'key-bad',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing invoiceNumber', () => {
    const result = payInvoiceSchema.safeParse({
      method: 'CREDIT_CARD',
      idempotencyKey: 'key-no-inv',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty invoiceNumber', () => {
    const result = payInvoiceSchema.safeParse({
      invoiceNumber: '',
      method: 'CREDIT_CARD',
      idempotencyKey: 'key-empty',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing idempotencyKey', () => {
    const result = payInvoiceSchema.safeParse({
      invoiceNumber: 'INV-2026-0001',
      method: 'CREDIT_CARD',
    });
    expect(result.success).toBe(false);
  });
});
