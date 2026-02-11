import type { Customer } from '@telecom-nexus/types';
import { create } from 'xmlbuilder2';
import { DOMParser } from '@xmldom/xmldom';

export function exportCustomersToXml(customers: Customer[]): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('customers');

  for (const c of customers) {
    doc.ele('customer')
      .ele('customerId').txt(String(c.customerId)).up()
      .ele('firstName').txt(c.firstName).up()
      .ele('lastName').txt(c.lastName).up()
      .ele('email').txt(c.email).up()
      .ele('phone').txt(c.phone).up()
      .ele('address')
      .ele('street').txt(c.address.street).up()
      .ele('city').txt(c.address.city).up()
      .ele('state').txt(c.address.state).up()
      .ele('zip').txt(c.address.zip).up()
      .ele('country').txt(c.address.country).up()
      .up()
      .up();
  }

  return doc.end({ prettyPrint: true });
}

export function parseCustomersFromXml(xml: string): Customer[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const customers: Customer[] = [];
  const nodes = doc.getElementsByTagName('customer');

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n) continue;
    const getText = (tag: string) => n.getElementsByTagName(tag)[0]?.textContent ?? '';

    customers.push({
      customerId: getText('customerId') as Customer['customerId'],
      firstName: getText('firstName'),
      lastName: getText('lastName'),
      email: getText('email'),
      phone: getText('phone'),
      address: {
        street: getText('street'),
        city: getText('city'),
        state: getText('state'),
        zip: getText('zip'),
        country: getText('country'),
      },
      activePlanId: null as unknown,
      accountStatus: 'ACTIVE',
      autoPayEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return customers;
}
