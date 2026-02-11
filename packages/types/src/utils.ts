import type {
  AlertId,
  CustomerId,
  DeviceId,
  InvoiceNumber,
  PaymentId,
  PlanCode,
  TicketId,
} from './branded';

/**
 * Exhaustive switch helper for discriminated unions.
 * Ensures all cases are handled at compile time.
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}

export function createCustomerId(s: string): CustomerId {
  return s as CustomerId;
}

export function createDeviceId(s: string): DeviceId {
  return s as DeviceId;
}

export function createTicketId(s: string): TicketId {
  return s as TicketId;
}

export function createInvoiceNumber(s: string): InvoiceNumber {
  return s as InvoiceNumber;
}

export function createPaymentId(s: string): PaymentId {
  return s as PaymentId;
}

export function createPlanCode(s: string): PlanCode {
  return s as PlanCode;
}

export function createAlertId(s: string): AlertId {
  return s as AlertId;
}

export type InvoiceNumberFormat = `INV-${string}`;
