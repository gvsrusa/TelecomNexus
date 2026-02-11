/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export enum AccountStatus {
  Active = 'ACTIVE',
  Closed = 'CLOSED',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED'
}

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
  zip: Scalars['String']['output'];
};

export type AddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  zip?: InputMaybe<Scalars['String']['input']>;
};

export type Alert = {
  __typename?: 'Alert';
  alertId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  device: NetworkDevice;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export enum AlertSeverity {
  Critical = 'CRITICAL',
  Info = 'INFO',
  Major = 'MAJOR',
  Minor = 'MINOR'
}

export enum AlertStatus {
  Acknowledged = 'ACKNOWLEDGED',
  Active = 'ACTIVE',
  Resolved = 'RESOLVED'
}

export type AlertsSummary = {
  __typename?: 'AlertsSummary';
  critical: Scalars['Int']['output'];
  info: Scalars['Int']['output'];
  major: Scalars['Int']['output'];
  minor: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type BillingPeriod = {
  __typename?: 'BillingPeriod';
  end: Scalars['DateTime']['output'];
  start: Scalars['DateTime']['output'];
};

export type CdrConnection = {
  __typename?: 'CDRConnection';
  edges: Array<CdrEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CdrEdge = {
  __typename?: 'CDREdge';
  cursor: Scalars['String']['output'];
  node: CallDetailRecord;
};

export type CallDetailRecord = {
  __typename?: 'CallDetailRecord';
  callId: Scalars['ID']['output'];
  callType: CallType;
  durationSeconds: Scalars['Int']['output'];
  fromNumber: Scalars['String']['output'];
  status: CallStatus;
  timestamp: Scalars['DateTime']['output'];
  toNumber: Scalars['String']['output'];
};

export enum CallStatus {
  Completed = 'COMPLETED',
  Dropped = 'DROPPED',
  Missed = 'MISSED'
}

export enum CallType {
  Video = 'VIDEO',
  Voice = 'VOICE',
  Voip = 'VOIP'
}

export type CreateTicketInput = {
  category: TicketCategory;
  description: Scalars['String']['input'];
  priority: TicketPriority;
  subject: Scalars['String']['input'];
};

export type Customer = {
  __typename?: 'Customer';
  accountStatus: AccountStatus;
  activePlan: Plan;
  address: Address;
  autoPayEnabled: Scalars['Boolean']['output'];
  callHistory: CdrConnection;
  createdAt: Scalars['DateTime']['output'];
  currentUsage: UsageSummary;
  customerId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  invoices: Array<Invoice>;
  lastName: Scalars['String']['output'];
  payments: Array<Payment>;
  phone: Scalars['String']['output'];
  usageByDay: Array<DailyUsage>;
};


export type CustomerCallHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  month: Scalars['String']['input'];
};


export type CustomerInvoicesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<InvoiceStatus>;
};


export type CustomerPaymentsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type CustomerUsageByDayArgs = {
  month: Scalars['String']['input'];
};

export type DailyUsage = {
  __typename?: 'DailyUsage';
  dataUsedMB: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  smsCount: Scalars['Int']['output'];
  voiceUsedSeconds: Scalars['Int']['output'];
};

export type DeviceMetadata = {
  __typename?: 'DeviceMetadata';
  firmwareVersion: Scalars['String']['output'];
  installDate: Scalars['DateTime']['output'];
  manufacturer: Scalars['String']['output'];
  model: Scalars['String']['output'];
};

export enum DeviceStatus {
  Degraded = 'DEGRADED',
  Down = 'DOWN',
  Maintenance = 'MAINTENANCE',
  Operational = 'OPERATIONAL'
}

export enum DeviceType {
  BaseStation = 'BASE_STATION',
  FiberNode = 'FIBER_NODE',
  Router = 'ROUTER',
  Switch = 'SWITCH',
  Tower = 'TOWER'
}

export type GeoLocation = {
  __typename?: 'GeoLocation';
  address: Scalars['String']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  region: Scalars['String']['output'];
};

export enum Granularity {
  Day = 'DAY',
  FiveMinutes = 'FIVE_MINUTES',
  Hour = 'HOUR',
  Minute = 'MINUTE'
}

export type Invoice = {
  __typename?: 'Invoice';
  billingPeriod: BillingPeriod;
  currency: Scalars['String']['output'];
  dueDate: Scalars['DateTime']['output'];
  invoiceNumber: Scalars['String']['output'];
  lineItems: Array<LineItem>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  status: InvoiceStatus;
  totalAmount: Scalars['Float']['output'];
};

export enum InvoiceStatus {
  Draft = 'DRAFT',
  Due = 'DUE',
  Overdue = 'OVERDUE',
  Paid = 'PAID'
}

export type LineItem = {
  __typename?: 'LineItem';
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acknowledgeAlert: Alert;
  addTicketMessage: Ticket;
  changePlan: PlanChangeResult;
  createTicket: Ticket;
  payInvoice: PaymentResult;
  resolveAlert: Alert;
  toggleAutoPay: Customer;
  updateCustomerProfile: Customer;
};


export type MutationAcknowledgeAlertArgs = {
  alertId: Scalars['ID']['input'];
};


export type MutationAddTicketMessageArgs = {
  content: Scalars['String']['input'];
  ticketId: Scalars['ID']['input'];
};


export type MutationChangePlanArgs = {
  customerId: Scalars['ID']['input'];
  planCode: Scalars['String']['input'];
};


export type MutationCreateTicketArgs = {
  input: CreateTicketInput;
};


export type MutationPayInvoiceArgs = {
  idempotencyKey: Scalars['String']['input'];
  invoiceNumber: Scalars['String']['input'];
  method: PaymentMethod;
};


export type MutationResolveAlertArgs = {
  alertId: Scalars['ID']['input'];
  resolution: Scalars['String']['input'];
};


export type MutationToggleAutoPayArgs = {
  customerId: Scalars['ID']['input'];
  enabled: Scalars['Boolean']['input'];
};


export type MutationUpdateCustomerProfileArgs = {
  input: UpdateProfileInput;
};

export type NetworkDevice = {
  __typename?: 'NetworkDevice';
  configXml?: Maybe<Scalars['String']['output']>;
  connectedDevices: Array<NetworkDevice>;
  deviceId: Scalars['ID']['output'];
  location: GeoLocation;
  metadata: DeviceMetadata;
  name: Scalars['String']['output'];
  status: DeviceStatus;
  type: DeviceType;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  invoiceNumber: Scalars['String']['output'];
  method: PaymentMethod;
  paymentId: Scalars['String']['output'];
  processedAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  transactionRef: Scalars['String']['output'];
};

export enum PaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  CreditCard = 'CREDIT_CARD',
  DigitalWallet = 'DIGITAL_WALLET'
}

export type PaymentResult = {
  __typename?: 'PaymentResult';
  errorMessage?: Maybe<Scalars['String']['output']>;
  payment?: Maybe<Payment>;
  success: Scalars['Boolean']['output'];
};

export type Plan = {
  __typename?: 'Plan';
  currency: Scalars['String']['output'];
  description: Scalars['String']['output'];
  features: PlanFeatures;
  monthlyPrice: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  planCode: Scalars['String']['output'];
  tier: PlanTier;
};

export type PlanChangeResult = {
  __typename?: 'PlanChangeResult';
  customer: Customer;
  effectiveDate: Scalars['DateTime']['output'];
  newPlan: Plan;
  previousPlan: Plan;
  success: Scalars['Boolean']['output'];
};

export type PlanFeatures = {
  __typename?: 'PlanFeatures';
  dataLimitGB?: Maybe<Scalars['Float']['output']>;
  fiveGAccess: Scalars['Boolean']['output'];
  hotspotGB: Scalars['Float']['output'];
  internationalRoaming: Scalars['Boolean']['output'];
  smsCount?: Maybe<Scalars['Float']['output']>;
  voiceMinutes?: Maybe<Scalars['Float']['output']>;
};

export enum PlanTier {
  Basic = 'BASIC',
  Enterprise = 'ENTERPRISE',
  Premium = 'PREMIUM',
  Standard = 'STANDARD'
}

export type Query = {
  __typename?: 'Query';
  alerts: Array<Alert>;
  alertsSummary: AlertsSummary;
  customer?: Maybe<Customer>;
  device?: Maybe<NetworkDevice>;
  devices: Array<NetworkDevice>;
  invoice?: Maybe<Invoice>;
  plan?: Maybe<Plan>;
  plans: Array<Plan>;
  telemetry: Array<TelemetryReading>;
  ticket?: Maybe<Ticket>;
  tickets: Array<Ticket>;
};


export type QueryAlertsArgs = {
  deviceId?: InputMaybe<Scalars['ID']['input']>;
  severity?: InputMaybe<AlertSeverity>;
  status?: InputMaybe<AlertStatus>;
};


export type QueryCustomerArgs = {
  customerId: Scalars['ID']['input'];
};


export type QueryDeviceArgs = {
  deviceId: Scalars['ID']['input'];
};


export type QueryDevicesArgs = {
  region?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<DeviceStatus>;
};


export type QueryInvoiceArgs = {
  invoiceNumber: Scalars['String']['input'];
};


export type QueryPlanArgs = {
  planCode: Scalars['String']['input'];
};


export type QueryPlansArgs = {
  tier?: InputMaybe<PlanTier>;
};


export type QueryTelemetryArgs = {
  deviceId: Scalars['ID']['input'];
  timeRange: TimeRange;
};


export type QueryTicketArgs = {
  ticketId: Scalars['ID']['input'];
};


export type QueryTicketsArgs = {
  customerId: Scalars['ID']['input'];
  status?: InputMaybe<TicketStatus>;
};

export type Subscription = {
  __typename?: 'Subscription';
  newAlert: Alert;
  telemetryUpdate: TelemetryReading;
  ticketUpdated: Ticket;
};


export type SubscriptionNewAlertArgs = {
  region?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionTelemetryUpdateArgs = {
  deviceId: Scalars['ID']['input'];
};


export type SubscriptionTicketUpdatedArgs = {
  customerId: Scalars['ID']['input'];
};

export type TelemetryReading = {
  __typename?: 'TelemetryReading';
  bandwidthMbps: Scalars['Float']['output'];
  cpuPercent: Scalars['Float']['output'];
  deviceId: Scalars['ID']['output'];
  memoryPercent: Scalars['Float']['output'];
  packetLossPercent: Scalars['Float']['output'];
  temperatureCelsius: Scalars['Float']['output'];
  timestamp: Scalars['DateTime']['output'];
};

export type Ticket = {
  __typename?: 'Ticket';
  category: TicketCategory;
  createdAt: Scalars['DateTime']['output'];
  customer: Customer;
  messages: Array<TicketMessage>;
  priority: TicketPriority;
  status: TicketStatus;
  subject: Scalars['String']['output'];
  ticketId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum TicketCategory {
  Billing = 'BILLING',
  Device = 'DEVICE',
  Network = 'NETWORK',
  Other = 'OTHER',
  Plan = 'PLAN'
}

export type TicketMessage = {
  __typename?: 'TicketMessage';
  content: Scalars['String']['output'];
  sender: Scalars['String']['output'];
  senderName: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
};

export enum TicketPriority {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export enum TicketStatus {
  Closed = 'CLOSED',
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

export type TimeRange = {
  end: Scalars['DateTime']['input'];
  granularity?: InputMaybe<Granularity>;
  start: Scalars['DateTime']['input'];
};

export type UpdateProfileInput = {
  address?: InputMaybe<AddressInput>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UsageSummary = {
  __typename?: 'UsageSummary';
  billingCycleEnd: Scalars['DateTime']['output'];
  billingCycleStart: Scalars['DateTime']['output'];
  dataLimitGB?: Maybe<Scalars['Float']['output']>;
  dataUsedGB: Scalars['Float']['output'];
  smsCount: Scalars['Int']['output'];
  smsLimit?: Maybe<Scalars['Int']['output']>;
  voiceLimitMinutes?: Maybe<Scalars['Int']['output']>;
  voiceUsedMinutes: Scalars['Int']['output'];
};

export type AlertFieldsFragment = { __typename?: 'Alert', alertId: string, severity: AlertSeverity, title: string, description: string, status: AlertStatus, timestamp: any, resolvedAt?: any | null };

export type CustomerFieldsFragment = { __typename?: 'Customer', customerId: string, firstName: string, lastName: string, email: string, phone: string, accountStatus: AccountStatus, createdAt: any, address: { __typename?: 'Address', street: string, city: string, state: string, zip: string, country: string } };

export type DeviceFieldsFragment = { __typename?: 'NetworkDevice', deviceId: string, type: DeviceType, name: string, status: DeviceStatus, configXml?: string | null, location: { __typename?: 'GeoLocation', lat: number, lng: number, address: string, region: string }, metadata: { __typename?: 'DeviceMetadata', manufacturer: string, model: string, firmwareVersion: string, installDate: any } };

export type InvoiceFieldsFragment = { __typename?: 'Invoice', invoiceNumber: string, totalAmount: number, currency: string, status: InvoiceStatus, dueDate: any, paidAt?: any | null, billingPeriod: { __typename?: 'BillingPeriod', start: any, end: any }, lineItems: Array<{ __typename?: 'LineItem', description: string, category: string, amount: number }> };

export type PlanFieldsFragment = { __typename?: 'Plan', planCode: string, name: string, description: string, monthlyPrice: number, currency: string, tier: PlanTier, features: { __typename?: 'PlanFeatures', dataLimitGB?: number | null, voiceMinutes?: number | null, smsCount?: number | null, hotspotGB: number, internationalRoaming: boolean, fiveGAccess: boolean } };

export type TelemetryFieldsFragment = { __typename?: 'TelemetryReading', deviceId: string, timestamp: any, cpuPercent: number, memoryPercent: number, bandwidthMbps: number, packetLossPercent: number, temperatureCelsius: number };

export type TicketFieldsFragment = { __typename?: 'Ticket', ticketId: string, category: TicketCategory, subject: string, status: TicketStatus, priority: TicketPriority, createdAt: any, updatedAt: any, messages: Array<{ __typename?: 'TicketMessage', sender: string, senderName: string, content: string, timestamp: any }> };

export type PayInvoiceMutationVariables = Exact<{
  invoiceNumber: Scalars['String']['input'];
  method: PaymentMethod;
  idempotencyKey: Scalars['String']['input'];
}>;


export type PayInvoiceMutation = { __typename?: 'Mutation', payInvoice: { __typename?: 'PaymentResult', success: boolean, errorMessage?: string | null, payment?: { __typename?: 'Payment', paymentId: string, amount: number, status: string } | null } };

export type ToggleAutoPayMutationVariables = Exact<{
  customerId: Scalars['ID']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type ToggleAutoPayMutation = { __typename?: 'Mutation', toggleAutoPay: { __typename?: 'Customer', customerId: string, autoPayEnabled: boolean } };

export type GetInvoiceQueryVariables = Exact<{
  invoiceNumber: Scalars['String']['input'];
}>;


export type GetInvoiceQuery = { __typename?: 'Query', invoice?: { __typename?: 'Invoice', invoiceNumber: string, totalAmount: number, currency: string, status: InvoiceStatus, dueDate: any, paidAt?: any | null, billingPeriod: { __typename?: 'BillingPeriod', start: any, end: any }, lineItems: Array<{ __typename?: 'LineItem', description: string, category: string, amount: number }> } | null };

export type GetInvoicesQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
  status?: InputMaybe<InvoiceStatus>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetInvoicesQuery = { __typename?: 'Query', customer?: { __typename?: 'Customer', customerId: string, invoices: Array<{ __typename?: 'Invoice', invoiceNumber: string, totalAmount: number, currency: string, status: InvoiceStatus, dueDate: any, paidAt?: any | null, billingPeriod: { __typename?: 'BillingPeriod', start: any, end: any }, lineItems: Array<{ __typename?: 'LineItem', description: string, category: string, amount: number }> }> } | null };

export type ChangePlanMutationVariables = Exact<{
  customerId: Scalars['ID']['input'];
  planCode: Scalars['String']['input'];
}>;


export type ChangePlanMutation = { __typename?: 'Mutation', changePlan: { __typename?: 'PlanChangeResult', success: boolean, customer: { __typename?: 'Customer', customerId: string, activePlan: { __typename?: 'Plan', planCode: string } } } };

export type CreateTicketMutationVariables = Exact<{
  input: CreateTicketInput;
}>;


export type CreateTicketMutation = { __typename?: 'Mutation', createTicket: { __typename?: 'Ticket', ticketId: string, status: TicketStatus } };

export type AddTicketMessageMutationVariables = Exact<{
  ticketId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type AddTicketMessageMutation = { __typename?: 'Mutation', addTicketMessage: { __typename?: 'Ticket', ticketId: string, messages: Array<{ __typename?: 'TicketMessage', content: string, timestamp: any }> } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateCustomerProfile: { __typename?: 'Customer', customerId: string, firstName: string, lastName: string } };

export type GetCustomerQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
}>;


export type GetCustomerQuery = { __typename?: 'Query', customer?: { __typename?: 'Customer', customerId: string, firstName: string, lastName: string, email: string, phone: string, accountStatus: AccountStatus, createdAt: any, activePlan: { __typename?: 'Plan', planCode: string, name: string, description: string, monthlyPrice: number, currency: string, tier: PlanTier, features: { __typename?: 'PlanFeatures', dataLimitGB?: number | null, voiceMinutes?: number | null, smsCount?: number | null, hotspotGB: number, internationalRoaming: boolean, fiveGAccess: boolean } }, address: { __typename?: 'Address', street: string, city: string, state: string, zip: string, country: string } } | null };

export type GetPlansQueryVariables = Exact<{
  tier?: InputMaybe<PlanTier>;
}>;


export type GetPlansQuery = { __typename?: 'Query', plans: Array<{ __typename?: 'Plan', planCode: string, name: string, description: string, monthlyPrice: number, currency: string, tier: PlanTier, features: { __typename?: 'PlanFeatures', dataLimitGB?: number | null, voiceMinutes?: number | null, smsCount?: number | null, hotspotGB: number, internationalRoaming: boolean, fiveGAccess: boolean } }> };

export type GetTicketsQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
  status?: InputMaybe<TicketStatus>;
}>;


export type GetTicketsQuery = { __typename?: 'Query', tickets: Array<{ __typename?: 'Ticket', ticketId: string, category: TicketCategory, subject: string, status: TicketStatus, priority: TicketPriority, createdAt: any, updatedAt: any, messages: Array<{ __typename?: 'TicketMessage', sender: string, senderName: string, content: string, timestamp: any }> }> };

export type GetTicketQueryVariables = Exact<{
  ticketId: Scalars['ID']['input'];
}>;


export type GetTicketQuery = { __typename?: 'Query', ticket?: { __typename?: 'Ticket', ticketId: string, category: TicketCategory, subject: string, status: TicketStatus, priority: TicketPriority, createdAt: any, updatedAt: any, customer: { __typename?: 'Customer', customerId: string, firstName: string, lastName: string }, messages: Array<{ __typename?: 'TicketMessage', sender: string, senderName: string, content: string, timestamp: any }> } | null };

export type AcknowledgeAlertMutationVariables = Exact<{
  alertId: Scalars['ID']['input'];
}>;


export type AcknowledgeAlertMutation = { __typename?: 'Mutation', acknowledgeAlert: { __typename?: 'Alert', alertId: string, status: AlertStatus } };

export type ResolveAlertMutationVariables = Exact<{
  alertId: Scalars['ID']['input'];
  resolution: Scalars['String']['input'];
}>;


export type ResolveAlertMutation = { __typename?: 'Mutation', resolveAlert: { __typename?: 'Alert', alertId: string, status: AlertStatus } };

export type GetDevicesQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<DeviceStatus>;
}>;


export type GetDevicesQuery = { __typename?: 'Query', devices: Array<{ __typename?: 'NetworkDevice', deviceId: string, type: DeviceType, name: string, status: DeviceStatus, configXml?: string | null, location: { __typename?: 'GeoLocation', lat: number, lng: number, address: string, region: string }, metadata: { __typename?: 'DeviceMetadata', manufacturer: string, model: string, firmwareVersion: string, installDate: any } }> };

export type GetDeviceQueryVariables = Exact<{
  deviceId: Scalars['ID']['input'];
}>;


export type GetDeviceQuery = { __typename?: 'Query', device?: { __typename?: 'NetworkDevice', deviceId: string, type: DeviceType, name: string, status: DeviceStatus, configXml?: string | null, connectedDevices: Array<{ __typename?: 'NetworkDevice', deviceId: string, name: string, status: DeviceStatus }>, location: { __typename?: 'GeoLocation', lat: number, lng: number, address: string, region: string }, metadata: { __typename?: 'DeviceMetadata', manufacturer: string, model: string, firmwareVersion: string, installDate: any } } | null };

export type GetTelemetryQueryVariables = Exact<{
  deviceId: Scalars['ID']['input'];
  timeRange: TimeRange;
}>;


export type GetTelemetryQuery = { __typename?: 'Query', telemetry: Array<{ __typename?: 'TelemetryReading', deviceId: string, timestamp: any, cpuPercent: number, memoryPercent: number, bandwidthMbps: number, packetLossPercent: number, temperatureCelsius: number }> };

export type GetAlertsQueryVariables = Exact<{
  deviceId?: InputMaybe<Scalars['ID']['input']>;
  severity?: InputMaybe<AlertSeverity>;
  status?: InputMaybe<AlertStatus>;
}>;


export type GetAlertsQuery = { __typename?: 'Query', alerts: Array<{ __typename?: 'Alert', alertId: string, severity: AlertSeverity, title: string, description: string, status: AlertStatus, timestamp: any, resolvedAt?: any | null, device: { __typename?: 'NetworkDevice', deviceId: string, name: string } }> };

export type GetAlertsSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAlertsSummaryQuery = { __typename?: 'Query', alertsSummary: { __typename?: 'AlertsSummary', critical: number, major: number, minor: number, info: number, total: number } };

export type OnTicketUpdatedSubscriptionVariables = Exact<{
  customerId: Scalars['ID']['input'];
}>;


export type OnTicketUpdatedSubscription = { __typename?: 'Subscription', ticketUpdated: { __typename?: 'Ticket', ticketId: string, status: TicketStatus, messages: Array<{ __typename?: 'TicketMessage', content: string, timestamp: any }> } };

export type OnNewAlertSubscriptionVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
}>;


export type OnNewAlertSubscription = { __typename?: 'Subscription', newAlert: { __typename?: 'Alert', alertId: string, severity: AlertSeverity, title: string, timestamp: any } };

export type OnTelemetryUpdateSubscriptionVariables = Exact<{
  deviceId: Scalars['ID']['input'];
}>;


export type OnTelemetryUpdateSubscription = { __typename?: 'Subscription', telemetryUpdate: { __typename?: 'TelemetryReading', deviceId: string, timestamp: any, cpuPercent: number, bandwidthMbps: number } };

export const AlertFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AlertFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Alert"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertId"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]} as unknown as DocumentNode<AlertFieldsFragment, unknown>;
export const CustomerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Customer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accountStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CustomerFieldsFragment, unknown>;
export const DeviceFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DeviceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NetworkDevice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"region"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"firmwareVersion"}},{"kind":"Field","name":{"kind":"Name","value":"installDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"configXml"}}]}}]} as unknown as DocumentNode<DeviceFieldsFragment, unknown>;
export const InvoiceFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InvoiceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invoice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoiceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"billingPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}}]} as unknown as DocumentNode<InvoiceFieldsFragment, unknown>;
export const PlanFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Plan"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"planCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataLimitGB"}},{"kind":"Field","name":{"kind":"Name","value":"voiceMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"smsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hotspotGB"}},{"kind":"Field","name":{"kind":"Name","value":"internationalRoaming"}},{"kind":"Field","name":{"kind":"Name","value":"fiveGAccess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tier"}}]}}]} as unknown as DocumentNode<PlanFieldsFragment, unknown>;
export const TelemetryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TelemetryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TelemetryReading"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"cpuPercent"}},{"kind":"Field","name":{"kind":"Name","value":"memoryPercent"}},{"kind":"Field","name":{"kind":"Name","value":"bandwidthMbps"}},{"kind":"Field","name":{"kind":"Name","value":"packetLossPercent"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureCelsius"}}]}}]} as unknown as DocumentNode<TelemetryFieldsFragment, unknown>;
export const TicketFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Ticket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sender"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<TicketFieldsFragment, unknown>;
export const PayInvoiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PayInvoice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invoiceNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"method"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethod"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payInvoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"invoiceNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invoiceNumber"}}},{"kind":"Argument","name":{"kind":"Name","value":"method"},"value":{"kind":"Variable","name":{"kind":"Name","value":"method"}}},{"kind":"Argument","name":{"kind":"Name","value":"idempotencyKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}}]}}]}}]} as unknown as DocumentNode<PayInvoiceMutation, PayInvoiceMutationVariables>;
export const ToggleAutoPayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleAutoPay"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleAutoPay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"enabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"autoPayEnabled"}}]}}]}}]} as unknown as DocumentNode<ToggleAutoPayMutation, ToggleAutoPayMutationVariables>;
export const GetInvoiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInvoice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invoiceNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"invoiceNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invoiceNumber"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InvoiceFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InvoiceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invoice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoiceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"billingPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}}]} as unknown as DocumentNode<GetInvoiceQuery, GetInvoiceQueryVariables>;
export const GetInvoicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInvoices"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InvoiceStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"invoices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InvoiceFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InvoiceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invoice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoiceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"billingPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}}]} as unknown as DocumentNode<GetInvoicesQuery, GetInvoicesQueryVariables>;
export const ChangePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"planCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"planCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"planCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"activePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"planCode"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChangePlanMutation, ChangePlanMutationVariables>;
export const CreateTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTicketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateTicketMutation, CreateTicketMutationVariables>;
export const AddTicketMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddTicketMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTicketMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ticketId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]} as unknown as DocumentNode<AddTicketMessageMutation, AddTicketMessageMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomerProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const GetCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerFields"}},{"kind":"Field","name":{"kind":"Name","value":"activePlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Customer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accountStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Plan"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"planCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataLimitGB"}},{"kind":"Field","name":{"kind":"Name","value":"voiceMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"smsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hotspotGB"}},{"kind":"Field","name":{"kind":"Name","value":"internationalRoaming"}},{"kind":"Field","name":{"kind":"Name","value":"fiveGAccess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tier"}}]}}]} as unknown as DocumentNode<GetCustomerQuery, GetCustomerQueryVariables>;
export const GetPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPlans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tier"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PlanTier"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tier"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tier"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlanFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlanFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Plan"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"planCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataLimitGB"}},{"kind":"Field","name":{"kind":"Name","value":"voiceMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"smsCount"}},{"kind":"Field","name":{"kind":"Name","value":"hotspotGB"}},{"kind":"Field","name":{"kind":"Name","value":"internationalRoaming"}},{"kind":"Field","name":{"kind":"Name","value":"fiveGAccess"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tier"}}]}}]} as unknown as DocumentNode<GetPlansQuery, GetPlansQueryVariables>;
export const GetTicketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTickets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tickets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TicketFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Ticket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sender"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetTicketsQuery, GetTicketsQueryVariables>;
export const GetTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ticketId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticketId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TicketFields"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TicketFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Ticket"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sender"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetTicketQuery, GetTicketQueryVariables>;
export const AcknowledgeAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcknowledgeAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alertId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acknowledgeAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"alertId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alertId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AcknowledgeAlertMutation, AcknowledgeAlertMutationVariables>;
export const ResolveAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alertId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resolution"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"alertId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alertId"}}},{"kind":"Argument","name":{"kind":"Name","value":"resolution"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resolution"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ResolveAlertMutation, ResolveAlertMutationVariables>;
export const GetDevicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDevices"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DeviceStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"devices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DeviceFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DeviceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NetworkDevice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"region"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"firmwareVersion"}},{"kind":"Field","name":{"kind":"Name","value":"installDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"configXml"}}]}}]} as unknown as DocumentNode<GetDevicesQuery, GetDevicesQueryVariables>;
export const GetDeviceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDevice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"device"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"deviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DeviceFields"}},{"kind":"Field","name":{"kind":"Name","value":"connectedDevices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DeviceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NetworkDevice"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"region"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"firmwareVersion"}},{"kind":"Field","name":{"kind":"Name","value":"installDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"configXml"}}]}}]} as unknown as DocumentNode<GetDeviceQuery, GetDeviceQueryVariables>;
export const GetTelemetryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTelemetry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRange"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"telemetry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"deviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TelemetryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TelemetryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TelemetryReading"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"cpuPercent"}},{"kind":"Field","name":{"kind":"Name","value":"memoryPercent"}},{"kind":"Field","name":{"kind":"Name","value":"bandwidthMbps"}},{"kind":"Field","name":{"kind":"Name","value":"packetLossPercent"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureCelsius"}}]}}]} as unknown as DocumentNode<GetTelemetryQuery, GetTelemetryQueryVariables>;
export const GetAlertsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAlerts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"severity"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlertSeverity"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AlertStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alerts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"deviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"severity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"severity"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AlertFields"}},{"kind":"Field","name":{"kind":"Name","value":"device"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AlertFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Alert"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertId"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]} as unknown as DocumentNode<GetAlertsQuery, GetAlertsQueryVariables>;
export const GetAlertsSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAlertsSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertsSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"critical"}},{"kind":"Field","name":{"kind":"Name","value":"major"}},{"kind":"Field","name":{"kind":"Name","value":"minor"}},{"kind":"Field","name":{"kind":"Name","value":"info"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetAlertsSummaryQuery, GetAlertsSummaryQueryVariables>;
export const OnTicketUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnTicketUpdated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketUpdated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticketId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]} as unknown as DocumentNode<OnTicketUpdatedSubscription, OnTicketUpdatedSubscriptionVariables>;
export const OnNewAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnNewAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertId"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<OnNewAlertSubscription, OnNewAlertSubscriptionVariables>;
export const OnTelemetryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnTelemetryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"telemetryUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"deviceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deviceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceId"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"cpuPercent"}},{"kind":"Field","name":{"kind":"Name","value":"bandwidthMbps"}}]}}]}}]} as unknown as DocumentNode<OnTelemetryUpdateSubscription, OnTelemetryUpdateSubscriptionVariables>;