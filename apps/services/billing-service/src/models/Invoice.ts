import mongoose, { Schema } from 'mongoose';

export interface ILineItem {
  description: string;
  category: 'BASE_PLAN' | 'ADDON' | 'TAX' | 'DISCOUNT' | 'OVERAGE';
  amount: number;
}

export interface IInvoice {
  invoiceNumber: string;
  customerId: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  lineItems: ILineItem[];
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'DUE' | 'PAID' | 'OVERDUE';
  dueDate: Date;
  paidAt?: Date | undefined;
  createdAt: Date;
}

const lineItemSchema = new Schema<ILineItem>(
  {
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['BASE_PLAN', 'ADDON', 'TAX', 'DISCOUNT', 'OVERAGE'],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  billingPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  lineItems: [lineItemSchema],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['DRAFT', 'DUE', 'PAID', 'OVERDUE'],
    default: 'DUE',
  },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);
