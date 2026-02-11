import mongoose, { Schema } from 'mongoose';

export interface ICustomer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  activePlanId: mongoose.Types.ObjectId;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED';
  autoPayEnabled: boolean;
  defaultPaymentMethod?: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    activePlanId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'PENDING', 'CLOSED'],
      default: 'ACTIVE',
    },
    autoPayEnabled: { type: Boolean, default: false },
    defaultPaymentMethod: {
      type: String,
      enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'],
    },
  },
  { timestamps: true },
);

export const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);
