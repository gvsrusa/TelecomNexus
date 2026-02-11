import type { CustomerId } from '../branded';
import type { AccountStatus } from '../enums';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Customer {
  _id?: unknown;
  customerId: CustomerId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  activePlanId: unknown;
  accountStatus: AccountStatus;
  autoPayEnabled: boolean;
  defaultPaymentMethod?: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  createdAt: Date;
  updatedAt: Date;
}
