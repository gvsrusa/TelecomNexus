/**
 * Branded types for domain identifiers.
 * Prevents accidental assignment of CustomerId to DeviceId, etc.
 */

export type CustomerId = string & { readonly __brand: 'CustomerId' };
export type DeviceId = string & { readonly __brand: 'DeviceId' };
export type TicketId = string & { readonly __brand: 'TicketId' };
export type InvoiceNumber = string & { readonly __brand: 'InvoiceNumber' };
export type PaymentId = string & { readonly __brand: 'PaymentId' };
export type PlanCode = string & { readonly __brand: 'PlanCode' };
export type AlertId = string & { readonly __brand: 'AlertId' };
