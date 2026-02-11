import type { CustomerId, PaymentId } from '../branded';
import type { PaymentMethod, PaymentStatus } from '../enums';

export interface Payment {
  _id?: unknown;
  paymentId: PaymentId;
  customerId: CustomerId;
  invoiceId: unknown;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  processedAt: Date;
}
