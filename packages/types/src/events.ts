import type { CustomerId, TicketId } from './branded';
import type { TicketStatus } from './enums';

export type TicketEvent =
  | { type: 'CREATED'; ticketId: TicketId; customerId: CustomerId; timestamp: Date }
  | { type: 'ASSIGNED'; ticketId: TicketId; agentId: string; timestamp: Date }
  | {
      type: 'MESSAGE_ADDED';
      ticketId: TicketId;
      sender: 'CUSTOMER' | 'AGENT';
      timestamp: Date;
    }
  | {
      type: 'STATUS_CHANGED';
      ticketId: TicketId;
      from: TicketStatus;
      to: TicketStatus;
      timestamp: Date;
    }
  | { type: 'RESOLVED'; ticketId: TicketId; resolution: string; timestamp: Date };
