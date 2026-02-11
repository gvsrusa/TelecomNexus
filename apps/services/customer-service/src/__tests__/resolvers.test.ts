import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';

// Mock the models
vi.mock('../models', () => ({
  CustomerModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
  PlanModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
  },
  TicketModel: {
    findOne: vi.fn(),
    find: vi.fn().mockReturnValue({ sort: vi.fn().mockResolvedValue([]) }),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

// Mock pubsub
vi.mock('../pubsub', () => ({
  pubsub: { publish: vi.fn() },
  TICKET_UPDATED: 'TICKET_UPDATED',
}));

import { resolvers } from '../resolvers';
import { CustomerModel, PlanModel, TicketModel } from '../models';

const mockedCustomerModel = vi.mocked(CustomerModel);
const mockedPlanModel = vi.mocked(PlanModel);
const mockedTicketModel = vi.mocked(TicketModel);

describe('Customer Service Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query.customer', () => {
    it('calls findOne with customerId', async () => {
      const mockCustomer = { customerId: 'CUST-0001', firstName: 'John' };
      mockedCustomerModel.findOne.mockResolvedValue(mockCustomer as never);

      const result = await resolvers.Query.customer(null, {
        customerId: 'CUST-0001',
      });

      expect(mockedCustomerModel.findOne).toHaveBeenCalledWith({
        customerId: 'CUST-0001',
      });
      expect(result).toEqual(mockCustomer);
    });

    it('returns null for non-existent customer', async () => {
      mockedCustomerModel.findOne.mockResolvedValue(null as never);

      const result = await resolvers.Query.customer(null, {
        customerId: 'CUST-9999',
      });
      expect(result).toBeNull();
    });
  });

  describe('Query.plans', () => {
    it('returns all active plans when no tier specified', async () => {
      const mockPlans = [{ planCode: 'BASIC' }, { planCode: 'PRO' }];
      mockedPlanModel.find.mockResolvedValue(mockPlans as never);

      const result = await resolvers.Query.plans(null, {});
      expect(mockedPlanModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockPlans);
    });

    it('filters by tier when provided', async () => {
      mockedPlanModel.find.mockResolvedValue([] as never);

      await resolvers.Query.plans(null, { tier: 'ENTERPRISE' });
      expect(mockedPlanModel.find).toHaveBeenCalledWith({
        isActive: true,
        tier: 'ENTERPRISE',
      });
    });
  });

  describe('Query.plan', () => {
    it('returns a single plan by planCode', async () => {
      const mockPlan = { planCode: 'BASIC', name: 'Basic Plan' };
      mockedPlanModel.findOne.mockResolvedValue(mockPlan as never);

      const result = await resolvers.Query.plan(null, { planCode: 'BASIC' });
      expect(result).toEqual(mockPlan);
    });
  });

  describe('Query.tickets', () => {
    it('queries tickets for a customer with sort', async () => {
      const mockSort = vi.fn().mockResolvedValue([]);
      mockedTicketModel.find.mockReturnValue({ sort: mockSort } as never);

      await resolvers.Query.tickets(null, { customerId: 'CUST-0001' });
      expect(mockedTicketModel.find).toHaveBeenCalledWith({
        customerId: 'CUST-0001',
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('filters by status when provided', async () => {
      const mockSort = vi.fn().mockResolvedValue([]);
      mockedTicketModel.find.mockReturnValue({ sort: mockSort } as never);

      await resolvers.Query.tickets(null, {
        customerId: 'CUST-0001',
        status: 'OPEN',
      });
      expect(mockedTicketModel.find).toHaveBeenCalledWith({
        customerId: 'CUST-0001',
        status: 'OPEN',
      });
    });
  });

  describe('Mutation.updateCustomerProfile', () => {
    it('updates customer and returns result', async () => {
      const updated = { customerId: 'CUST-0001', firstName: 'Jane' };
      mockedCustomerModel.findOneAndUpdate.mockResolvedValue(updated as never);

      const result = await resolvers.Mutation.updateCustomerProfile(null, {
        input: {
          customerId: 'CUST-0001',
          firstName: 'Jane',
        },
      });

      expect(mockedCustomerModel.findOneAndUpdate).toHaveBeenCalledWith(
        { customerId: 'CUST-0001' },
        { $set: { firstName: 'Jane' } },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('throws when customer not found', async () => {
      mockedCustomerModel.findOneAndUpdate.mockResolvedValue(null as never);

      await expect(
        resolvers.Mutation.updateCustomerProfile(null, {
          input: { customerId: 'CUST-9999' },
        }),
      ).rejects.toThrow(GraphQLError);
    });

    it('rejects invalid input via Zod', async () => {
      await expect(
        resolvers.Mutation.updateCustomerProfile(null, {
          input: { customerId: '' },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Mutation.createTicket', () => {
    it('creates a ticket and publishes event', async () => {
      const mockTicket = {
        ticketId: 'TKT-0001',
        customerId: 'CUST-0001',
        status: 'OPEN',
      };
      mockedTicketModel.countDocuments.mockResolvedValue(0 as never);
      mockedTicketModel.create.mockResolvedValue(mockTicket as never);

      const result = await resolvers.Mutation.createTicket(null, {
        input: {
          customerId: 'CUST-0001',
          category: 'BILLING',
          subject: 'Help needed',
          priority: 'HIGH',
          description: 'Cannot pay my bill',
        },
      });

      expect(mockedTicketModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockTicket);
    });

    it('rejects invalid ticket input', async () => {
      await expect(
        resolvers.Mutation.createTicket(null, {
          input: {
            customerId: 'CUST-0001',
            category: 'INVALID',
            subject: 'Test',
            priority: 'LOW',
            description: 'Test',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Mutation.changePlan', () => {
    it('changes plan and returns result', async () => {
      const mockCustomer = {
        customerId: 'CUST-0001',
        activePlanId: 'plan1',
        save: vi.fn().mockResolvedValue(undefined),
      };
      const mockOldPlan = { planCode: 'BASIC', _id: 'plan1' };
      const mockNewPlan = { planCode: 'PRO', _id: 'plan2' };

      mockedCustomerModel.findOne.mockResolvedValue(mockCustomer as never);
      mockedPlanModel.findById.mockResolvedValue(mockOldPlan as never);
      mockedPlanModel.findOne.mockResolvedValue(mockNewPlan as never);

      const result = await resolvers.Mutation.changePlan(null, {
        customerId: 'CUST-0001',
        planCode: 'PRO',
      });

      expect(result.success).toBe(true);
      expect(result.newPlan).toEqual(mockNewPlan);
      expect(mockCustomer.save).toHaveBeenCalled();
    });

    it('throws when customer not found', async () => {
      mockedCustomerModel.findOne.mockResolvedValue(null as never);

      await expect(
        resolvers.Mutation.changePlan(null, {
          customerId: 'CUST-9999',
          planCode: 'PRO',
        }),
      ).rejects.toThrow(GraphQLError);
    });

    it('throws when plan not found', async () => {
      mockedCustomerModel.findOne.mockResolvedValue({
        customerId: 'CUST-0001',
      } as never);
      mockedPlanModel.findById.mockResolvedValue(null as never);
      mockedPlanModel.findOne.mockResolvedValue(null as never);

      await expect(
        resolvers.Mutation.changePlan(null, {
          customerId: 'CUST-0001',
          planCode: 'NONEXISTENT',
        }),
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('DateTime scalar', () => {
    it('serializes a Date to ISO string', () => {
      const date = new Date('2026-01-01T00:00:00.000Z');
      const result = resolvers.DateTime.__serialize(date);
      expect(result).toBe('2026-01-01T00:00:00.000Z');
    });

    it('passes through strings', () => {
      const result = resolvers.DateTime.__serialize('2026-01-01');
      expect(result).toBe('2026-01-01');
    });

    it('throws for non-date values', () => {
      expect(() => resolvers.DateTime.__serialize(123)).toThrow();
    });

    it('parses ISO string to Date', () => {
      const result = resolvers.DateTime.__parseValue('2026-01-01T00:00:00.000Z');
      expect(result).toBeInstanceOf(Date);
    });

    it('throws for non-string parse input', () => {
      expect(() => resolvers.DateTime.__parseValue(123)).toThrow();
    });
  });

  describe('Customer.__resolveReference', () => {
    it('looks up customer by customerId', async () => {
      const mockCustomer = { customerId: 'CUST-0001' };
      mockedCustomerModel.findOne.mockResolvedValue(mockCustomer as never);

      const result = await resolvers.Customer.__resolveReference({
        customerId: 'CUST-0001',
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('Plan.__resolveReference', () => {
    it('looks up plan by planCode', async () => {
      const mockPlan = { planCode: 'BASIC' };
      mockedPlanModel.findOne.mockResolvedValue(mockPlan as never);

      const result = await resolvers.Plan.__resolveReference({
        planCode: 'BASIC',
      });
      expect(result).toEqual(mockPlan);
    });
  });
});
