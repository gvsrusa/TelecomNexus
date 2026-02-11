import gql from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  scalar DateTime

  type Query {
    customer(customerId: ID!): Customer
    plans(tier: PlanTier): [Plan!]!
    plan(planCode: String!): Plan
    tickets(customerId: ID!, status: TicketStatus): [Ticket!]!
    ticket(ticketId: ID!): Ticket
  }

  type Mutation {
    updateCustomerProfile(input: UpdateProfileInput!): Customer!
    changePlan(customerId: ID!, planCode: String!): PlanChangeResult!
    createTicket(input: CreateTicketInput!): Ticket!
    addTicketMessage(ticketId: ID!, content: String!): Ticket!
  }

  type Subscription {
    ticketUpdated(customerId: ID!): Ticket!
  }

  type Customer @key(fields: "customerId") {
    customerId: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    address: Address!
    activePlan: Plan!
    accountStatus: AccountStatus!
    autoPayEnabled: Boolean! @shareable
    createdAt: DateTime!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }

  type Plan @key(fields: "planCode") {
    planCode: String!
    name: String!
    description: String!
    monthlyPrice: Float!
    currency: String!
    features: PlanFeatures!
    tier: PlanTier!
  }

  type PlanFeatures {
    dataLimitGB: Float
    voiceMinutes: Float
    smsCount: Float
    hotspotGB: Float!
    internationalRoaming: Boolean!
    fiveGAccess: Boolean!
  }

  type Ticket {
    ticketId: ID!
    customer: Customer!
    category: TicketCategory!
    subject: String!
    status: TicketStatus!
    priority: TicketPriority!
    messages: [TicketMessage!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TicketMessage {
    sender: String!
    senderName: String!
    content: String!
    timestamp: DateTime!
  }

  type PlanChangeResult {
    success: Boolean!
    customer: Customer!
    previousPlan: Plan!
    newPlan: Plan!
    effectiveDate: DateTime!
  }

  input UpdateProfileInput {
    customerId: ID!
    firstName: String
    lastName: String
    phone: String
    address: AddressInput
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zip: String
    country: String
  }

  input CreateTicketInput {
    customerId: ID!
    category: TicketCategory!
    subject: String!
    priority: TicketPriority!
    description: String!
  }

  enum AccountStatus {
    ACTIVE
    SUSPENDED
    PENDING
    CLOSED
  }

  enum PlanTier {
    BASIC
    STANDARD
    PREMIUM
    ENTERPRISE
  }

  enum TicketStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
    CLOSED
  }

  enum TicketCategory {
    BILLING
    NETWORK
    DEVICE
    PLAN
    OTHER
  }

  enum TicketPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }
`;
