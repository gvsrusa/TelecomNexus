import { describe, it, expect } from 'vitest';
import { updateProfileInputSchema, createTicketInputSchema } from '../validation';

describe('updateProfileInputSchema', () => {
  it('accepts valid input with customerId only', () => {
    const result = updateProfileInputSchema.safeParse({
      customerId: 'CUST-0001',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid input with all fields', () => {
    const result = updateProfileInputSchema.safeParse({
      customerId: 'CUST-0001',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-0100',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing customerId', () => {
    const result = updateProfileInputSchema.safeParse({
      firstName: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty customerId', () => {
    const result = updateProfileInputSchema.safeParse({
      customerId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty firstName', () => {
    const result = updateProfileInputSchema.safeParse({
      customerId: 'CUST-0001',
      firstName: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createTicketInputSchema', () => {
  it('accepts valid ticket input', () => {
    const result = createTicketInputSchema.safeParse({
      customerId: 'CUST-0001',
      category: 'BILLING',
      subject: 'Payment issue',
      priority: 'HIGH',
      description: 'Cannot process payment',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = createTicketInputSchema.safeParse({
      customerId: 'CUST-0001',
      category: 'INVALID',
      subject: 'Test',
      priority: 'LOW',
      description: 'Test desc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = createTicketInputSchema.safeParse({
      customerId: 'CUST-0001',
      category: 'BILLING',
      subject: 'Test',
      priority: 'SUPER_HIGH',
      description: 'Test desc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing subject', () => {
    const result = createTicketInputSchema.safeParse({
      customerId: 'CUST-0001',
      category: 'BILLING',
      priority: 'LOW',
      description: 'Test desc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = createTicketInputSchema.safeParse({
      customerId: 'CUST-0001',
      category: 'BILLING',
      subject: 'Test',
      priority: 'LOW',
      description: '',
    });
    expect(result.success).toBe(false);
  });
});
