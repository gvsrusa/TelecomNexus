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

export type AccountStatus =
  | 'ACTIVE'
  | 'CLOSED'
  | 'PENDING'
  | 'SUSPENDED';

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

export type AlertSeverity =
  | 'CRITICAL'
  | 'INFO'
  | 'MAJOR'
  | 'MINOR';

export type AlertStatus =
  | 'ACKNOWLEDGED'
  | 'ACTIVE'
  | 'RESOLVED';

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

export type CallStatus =
  | 'COMPLETED'
  | 'DROPPED'
  | 'MISSED';

export type CallType =
  | 'VIDEO'
  | 'VOICE'
  | 'VOIP';

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

export type DeviceStatus =
  | 'DEGRADED'
  | 'DOWN'
  | 'MAINTENANCE'
  | 'OPERATIONAL';

export type DeviceType =
  | 'BASE_STATION'
  | 'FIBER_NODE'
  | 'ROUTER'
  | 'SWITCH'
  | 'TOWER';

export type GeoLocation = {
  __typename?: 'GeoLocation';
  address: Scalars['String']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  region: Scalars['String']['output'];
};

export type Granularity =
  | 'DAY'
  | 'FIVE_MINUTES'
  | 'HOUR'
  | 'MINUTE';

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

export type InvoiceStatus =
  | 'DRAFT'
  | 'DUE'
  | 'OVERDUE'
  | 'PAID';

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

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DIGITAL_WALLET';

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

export type PlanTier =
  | 'BASIC'
  | 'ENTERPRISE'
  | 'PREMIUM'
  | 'STANDARD';

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

export type TicketCategory =
  | 'BILLING'
  | 'DEVICE'
  | 'NETWORK'
  | 'OTHER'
  | 'PLAN';

export type TicketMessage = {
  __typename?: 'TicketMessage';
  content: Scalars['String']['output'];
  sender: Scalars['String']['output'];
  senderName: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
};

export type TicketPriority =
  | 'CRITICAL'
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type TicketStatus =
  | 'CLOSED'
  | 'IN_PROGRESS'
  | 'OPEN'
  | 'RESOLVED';

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
