import { describe, it, expect } from 'vitest';
import { exportCustomersToXml, parseCustomersFromXml } from '../customer-xml';
import type { Customer } from '@telecom-nexus/types';

describe('Customer XML import/export', () => {
  const customers: Customer[] = [
    {
      customerId: 'CUST-0001' as Customer['customerId'],
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0100',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
      },
      activePlanId: null as unknown,
      accountStatus: 'ACTIVE' as Customer['accountStatus'],
      autoPayEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      customerId: 'CUST-0002' as Customer['customerId'],
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-0200',
      address: {
        street: '456 Oak Ave',
        city: 'Denver',
        state: 'CO',
        zip: '80201',
        country: 'US',
      },
      activePlanId: null as unknown,
      accountStatus: 'ACTIVE' as Customer['accountStatus'],
      autoPayEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('exportCustomersToXml', () => {
    it('generates valid XML with customers root element', () => {
      const xml = exportCustomersToXml(customers);
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<customers>');
    });

    it('includes all customer records', () => {
      const xml = exportCustomersToXml(customers);
      expect(xml).toContain('<customerId>CUST-0001</customerId>');
      expect(xml).toContain('<customerId>CUST-0002</customerId>');
    });

    it('includes address fields', () => {
      const xml = exportCustomersToXml(customers);
      expect(xml).toContain('<street>123 Main St</street>');
      expect(xml).toContain('<city>Springfield</city>');
      expect(xml).toContain('<zip>62701</zip>');
    });

    it('handles empty customer array', () => {
      const xml = exportCustomersToXml([]);
      expect(xml).toContain('<customers/>');
    });
  });

  describe('parseCustomersFromXml', () => {
    it('parses exported XML back to customer objects', () => {
      const xml = exportCustomersToXml(customers);
      const parsed = parseCustomersFromXml(xml);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.customerId).toBe('CUST-0001');
      expect(parsed[1]?.customerId).toBe('CUST-0002');
    });

    it('preserves customer names', () => {
      const xml = exportCustomersToXml(customers);
      const parsed = parseCustomersFromXml(xml);
      expect(parsed[0]?.firstName).toBe('John');
      expect(parsed[0]?.lastName).toBe('Doe');
      expect(parsed[1]?.firstName).toBe('Jane');
      expect(parsed[1]?.lastName).toBe('Smith');
    });

    it('preserves address data', () => {
      const xml = exportCustomersToXml(customers);
      const parsed = parseCustomersFromXml(xml);
      expect(parsed[0]?.address.street).toBe('123 Main St');
      expect(parsed[0]?.address.city).toBe('Springfield');
      expect(parsed[0]?.address.state).toBe('IL');
    });

    it('roundtrips all customer data', () => {
      const xml = exportCustomersToXml(customers);
      const parsed = parseCustomersFromXml(xml);
      for (let i = 0; i < customers.length; i++) {
        const orig = customers[i]!;
        const back = parsed[i]!;
        expect(back.customerId).toBe(orig.customerId);
        expect(back.firstName).toBe(orig.firstName);
        expect(back.lastName).toBe(orig.lastName);
        expect(back.email).toBe(orig.email);
        expect(back.phone).toBe(orig.phone);
        expect(back.address).toEqual(orig.address);
      }
    });
  });
});
