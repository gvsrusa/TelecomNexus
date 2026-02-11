import mongoose, { Schema } from 'mongoose';

export interface ITicketMessage {
  sender: 'CUSTOMER' | 'AGENT';
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface ITicket {
  ticketId: string;
  customerId: string;
  category: 'BILLING' | 'NETWORK' | 'DEVICE' | 'PLAN' | 'OTHER';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    sender: { type: String, enum: ['CUSTOMER', 'AGENT'], required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['BILLING', 'NETWORK', 'DEVICE', 'PLAN', 'OTHER'],
      required: true,
    },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    messages: [ticketMessageSchema],
  },
  { timestamps: true },
);

export const TicketModel = mongoose.model<ITicket>('Ticket', ticketSchema);
