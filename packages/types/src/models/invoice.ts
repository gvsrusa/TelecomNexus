import type { CustomerId, InvoiceNumber } from '../branded';
import type { InvoiceStatus, LineItemCategory } from '../enums';

export interface BillingPeriod {
  start: Date;
  end: Date;
}

export interface LineItem {
  description: string;
  category: LineItemCategory;
  amount: number;
}

export interface Invoice {
  _id?: unknown;
  invoiceNumber: InvoiceNumber;
  customerId: CustomerId;
  billingPeriod: BillingPeriod;
  lineItems: LineItem[];
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  createdAt?: Date;
}
