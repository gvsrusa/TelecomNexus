import mongoose, { Schema } from 'mongoose';

export interface IPayment {
  paymentId: string;
  customerId: string;
  invoiceId: mongoose.Types.ObjectId;
  amount: number;
  method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  transactionRef: string;
  processedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  paymentId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'],
    required: true,
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'],
    default: 'PENDING',
  },
  transactionRef: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

export const PaymentModel = mongoose.model<IPayment>('Payment', paymentSchema);
