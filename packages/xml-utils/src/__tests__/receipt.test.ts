import { describe, it, expect } from 'vitest';
import { generatePaymentReceipt } from '../receipt';
import type { Payment, Invoice, Customer } from '@telecom-nexus/types';

describe('generatePaymentReceipt', () => {
  const customer = {
    customerId: 'CUST-0001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-0100',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      country: 'US',
    },
    activePlanId: null,
    accountStatus: 'ACTIVE',
    autoPayEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Customer;

  const invoice = {
    invoiceNumber: 'INV-2026-0001',
    customerId: 'CUST-0001',
    totalAmount: 99.99,
    status: 'PAID',
    billingPeriod: { start: new Date(), end: new Date() },
    lineItems: [],
    dueDate: new Date(),
  } as unknown as Invoice;

  const payment = {
    paymentId: 'PAY-000001',
    customerId: 'CUST-0001',
    invoiceId: 'inv1',
    amount: 99.99,
    method: 'CREDIT_CARD',
    status: 'SUCCESS',
    transactionRef: 'ref-123',
    processedAt: new Date('2026-01-15T10:30:00.000Z'),
  } as unknown as Payment;

  it('generates valid XML receipt', () => {
    const xml = generatePaymentReceipt(payment, invoice, customer);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<receipt>');
  });

  it('includes company name', () => {
    const xml = generatePaymentReceipt(payment, invoice, customer);
    expect(xml).toContain('<name>TelecomNexus</name>');
  });

  it('includes customer details', () => {
    const xml = generatePaymentReceipt(payment, invoice, customer);
    expect(xml).toContain('<name>John Doe</name>');
    expect(xml).toContain('<email>john@example.com</email>');
  });

  it('includes invoice number and total', () => {
    const xml = generatePaymentReceipt(payment, invoice, customer);
    expect(xml).toContain('<number>INV-2026-0001</number>');
    expect(xml).toContain('<total>99.99</total>');
  });

  it('includes payment details', () => {
    const xml = generatePaymentReceipt(payment, invoice, customer);
    expect(xml).toContain('<id>PAY-000001</id>');
    expect(xml).toContain('<amount>99.99</amount>');
    expect(xml).toContain('<method>CREDIT_CARD</method>');
    expect(xml).toContain('<reference>ref-123</reference>');
  });

  it('includes payment date in ISO format', () => {
    const xml = generatePaymentReceipt(payment, invoice, customer);
    expect(xml).toContain('<date>2026-01-15T10:30:00.000Z</date>');
  });
});
