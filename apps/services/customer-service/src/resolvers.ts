import { GraphQLError } from 'graphql';
import { CustomerModel, PlanModel, TicketModel } from './models';
import { pubsub, TICKET_UPDATED } from './pubsub';
import { updateProfileInputSchema, createTicketInputSchema } from './validation';
import type { ICustomer } from './models';

// DateTime scalar — serializes Date to ISO string
const DateTimeScalar = {
  __serialize(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    throw new GraphQLError('DateTime must be a Date or ISO string');
  },
  __parseValue(value: unknown): Date {
    if (typeof value === 'string') return new Date(value);
    throw new GraphQLError('DateTime must be an ISO 8601 string');
  },
  __parseLiteral(ast: { kind: string; value?: string }): Date {
    if (ast.kind === 'StringValue' && ast.value) return new Date(ast.value);
    throw new GraphQLError('DateTime must be an ISO 8601 string');
  },
};

/** Generate next ticket ID */
async function nextTicketId(): Promise<string> {
  const count = await TicketModel.countDocuments();
  return `TKT-${String(count + 1).padStart(4, '0')}`;
}

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    customer: async (_: unknown, args: { customerId: string }) => {
      return CustomerModel.findOne({ customerId: args.customerId });
    },

    plans: async (_: unknown, args: { tier?: string | undefined }) => {
      const filter: Record<string, unknown> = { isActive: true };
      if (args.tier) filter['tier'] = args.tier;
      return PlanModel.find(filter);
    },

    plan: async (_: unknown, args: { planCode: string }) => {
      return PlanModel.findOne({ planCode: args.planCode });
    },

    tickets: async (_: unknown, args: { customerId: string; status?: string | undefined }) => {
      const filter: Record<string, unknown> = {
        customerId: args.customerId,
      };
      if (args.status) filter['status'] = args.status;
      return TicketModel.find(filter).sort({ createdAt: -1 });
    },

    ticket: async (_: unknown, args: { ticketId: string }) => {
      return TicketModel.findOne({ ticketId: args.ticketId });
    },
  },

  Mutation: {
    updateCustomerProfile: async (_: unknown, args: { input: Record<string, unknown> }) => {
      const parsed = updateProfileInputSchema.parse(args.input);
      const { customerId, ...updates } = parsed;

      // Build update object, handling nested address
      const updateObj: Record<string, unknown> = {};
      if (updates.firstName) updateObj['firstName'] = updates.firstName;
      if (updates.lastName) updateObj['lastName'] = updates.lastName;
      if (updates.phone) updateObj['phone'] = updates.phone;
      if (updates.address) {
        for (const [key, value] of Object.entries(updates.address)) {
          if (value !== undefined) {
            updateObj[`address.${key}`] = value;
          }
        }
      }

      const customer = await CustomerModel.findOneAndUpdate(
        { customerId },
        { $set: updateObj },
        { new: true },
      );
      if (!customer) {
        throw new GraphQLError(`Customer ${customerId} not found`);
      }
      return customer;
    },

    changePlan: async (_: unknown, args: { customerId: string; planCode: string }) => {
      const customer = await CustomerModel.findOne({
        customerId: args.customerId,
      });
      if (!customer) {
        throw new GraphQLError(`Customer ${args.customerId} not found`);
      }

      const previousPlan = await PlanModel.findById(customer.activePlanId);
      const newPlan = await PlanModel.findOne({ planCode: args.planCode });
      if (!newPlan) {
        throw new GraphQLError(`Plan ${args.planCode} not found`);
      }

      customer.activePlanId = newPlan._id as unknown as typeof customer.activePlanId;
      await customer.save();

      return {
        success: true,
        customer,
        previousPlan: previousPlan ?? newPlan,
        newPlan,
        effectiveDate: new Date(),
      };
    },

    createTicket: async (_: unknown, args: { input: Record<string, unknown> }) => {
      const parsed = createTicketInputSchema.parse(args.input);
      const ticketId = await nextTicketId();

      const ticket = await TicketModel.create({
        ticketId,
        customerId: parsed.customerId,
        category: parsed.category,
        subject: parsed.subject,
        priority: parsed.priority,
        status: 'OPEN',
        messages: [
          {
            sender: 'CUSTOMER',
            senderName: 'Customer',
            content: parsed.description,
            timestamp: new Date(),
          },
        ],
      });

      pubsub.publish(TICKET_UPDATED, { ticketUpdated: ticket });
      return ticket;
    },

    addTicketMessage: async (_: unknown, args: { ticketId: string; content: string }) => {
      const ticket = await TicketModel.findOneAndUpdate(
        { ticketId: args.ticketId },
        {
          $push: {
            messages: {
              sender: 'AGENT',
              senderName: 'Support Agent',
              content: args.content,
              timestamp: new Date(),
            },
          },
          $set: { status: 'IN_PROGRESS' },
        },
        { new: true },
      );

      if (!ticket) {
        throw new GraphQLError(`Ticket ${args.ticketId} not found`);
      }

      pubsub.publish(TICKET_UPDATED, { ticketUpdated: ticket });
      return ticket;
    },
  },

  Subscription: {
    ticketUpdated: {
      subscribe: (_: unknown, args: { customerId: string }) => {
        return {
          [Symbol.asyncIterator]() {
            const iterator = pubsub.asyncIterator<{ ticketUpdated: unknown }>(TICKET_UPDATED);
            // Filter by customerId
            return {
              async next() {
                while (true) {
                  const result = await iterator.next();
                  if (result.done) return result;
                  const ticket = (result.value as Record<string, Record<string, unknown>>)[
                    'ticketUpdated'
                  ];
                  if (ticket && ticket['customerId'] === args.customerId) {
                    return result;
                  }
                }
              },
              return:
                iterator.return?.bind(iterator) ??
                (async () => ({ value: undefined, done: true as const })),
              throw:
                iterator.throw?.bind(iterator) ??
                (async (e: unknown) => {
                  throw e;
                }),
              [Symbol.asyncIterator]() {
                return this;
              },
            };
          },
        };
      },
    },
  },

  // Federation entity resolvers
  Customer: {
    __resolveReference: async (reference: { customerId: string }) => {
      return CustomerModel.findOne({ customerId: reference.customerId });
    },
    activePlan: async (parent: ICustomer) => {
      if (!parent.activePlanId) return null;
      return PlanModel.findById(parent.activePlanId);
    },
  },

  Plan: {
    __resolveReference: async (reference: { planCode: string }) => {
      return PlanModel.findOne({ planCode: reference.planCode });
    },
  },

  Ticket: {
    customer: async (parent: { customerId: string }) => {
      return CustomerModel.findOne({ customerId: parent.customerId });
    },
  },
};
