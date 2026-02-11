import type { CustomerId, TicketId } from '../branded';
import type { TicketCategory, TicketPriority, TicketStatus } from '../enums';

export interface TicketMessage {
  sender: 'CUSTOMER' | 'AGENT';
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface Ticket {
  _id?: unknown;
  ticketId: TicketId;
  customerId: CustomerId;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}
