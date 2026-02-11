import { z } from 'zod';

export const addressInputSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export const updateProfileInputSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  address: addressInputSchema.optional(),
});

export const createTicketInputSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  category: z.enum(['BILLING', 'NETWORK', 'DEVICE', 'PLAN', 'OTHER']),
  subject: z.string().min(1, 'subject is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(1, 'description is required'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
export type CreateTicketInput = z.infer<typeof createTicketInputSchema>;
