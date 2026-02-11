/**
 * Domain enums matching PRD §6.1 and §6.2
 */

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED';

export type PlanTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketCategory = 'BILLING' | 'NETWORK' | 'DEVICE' | 'PLAN' | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InvoiceStatus = 'DRAFT' | 'DUE' | 'PAID' | 'OVERDUE';

export type LineItemCategory = 'BASE_PLAN' | 'ADDON' | 'TAX' | 'DISCOUNT' | 'OVERAGE';

export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export type DeviceType = 'TOWER' | 'SWITCH' | 'ROUTER' | 'BASE_STATION' | 'FIBER_NODE';

export type DeviceStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';

export type AlertSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type CallType = 'VOICE' | 'VIDEO' | 'VOIP';

export type CallStatus = 'COMPLETED' | 'MISSED' | 'DROPPED';

export type Granularity = 'MINUTE' | 'FIVE_MINUTES' | 'HOUR' | 'DAY';
