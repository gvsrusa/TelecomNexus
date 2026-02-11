import { z } from 'zod';

export const payInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'invoiceNumber is required'),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET']),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
});

export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>;
