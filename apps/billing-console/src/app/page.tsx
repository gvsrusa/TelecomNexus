'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

const CUSTOMER_ID = 'CUST-0001';

const GET_BILLING_OVERVIEW = gql`
  query GetBillingOverview($customerId: ID!) {
    customer(customerId: $customerId) {
      customerId
      invoices {
        invoiceNumber
        status
        totalAmount
      }
      payments {
        paymentId
        amount
        status
      }
      autoPayEnabled
    }
    currentUsage(customerId: $customerId) {
      totalDataMB
      totalVoiceMinutes
      totalSMS
    }
  }
`;

export default function BillingHome() {
  const { data, loading } = useQuery(GET_BILLING_OVERVIEW, {
    variables: { customerId: CUSTOMER_ID },
  });
  const invoices = data?.customer?.invoices ?? [];
  const payments = data?.customer?.payments ?? [];
  const usage = data?.currentUsage;
  const totalOwed = invoices
    .filter((i: { status: string }) => i.status === 'DUE' || i.status === 'OVERDUE')
    .reduce((s: number, i: { totalAmount: number }) => s + i.totalAmount, 0);

  return (
    <div>
      <h3 className="fw-bold mb-4">Billing Console</h3>
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="border-start border-danger border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Amount Due</small>
              <h4 className="text-danger">${loading ? '...' : totalOwed.toFixed(2)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-start border-primary border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Invoices</small>
              <h4>{loading ? '...' : invoices.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-start border-success border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Payments</small>
              <h4>{loading ? '...' : payments.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-start border-info border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Data Used</small>
              <h4>{loading ? '...' : `${((usage?.totalDataMB ?? 0) / 1024).toFixed(1)} GB`}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3">
        {[
          {
            href: '/invoices',
            icon: '\u{1F4C4}',
            label: 'Invoices',
            desc: 'View and pay invoices',
          },
          {
            href: '/usage',
            icon: '\u{1F4CA}',
            label: 'Usage Analytics',
            desc: 'Track data, voice, and SMS usage',
          },
          {
            href: '/payments',
            icon: '\u{1F4B0}',
            label: 'Payment History',
            desc: 'View past payments and receipts',
          },
        ].map((a) => (
          <Col key={a.href} md={4}>
            <Link href={a.href} className="text-decoration-none">
              <Card className="h-100" style={{ cursor: 'pointer' }}>
                <Card.Body className="text-center py-4">
                  <div style={{ fontSize: '2.5rem' }}>{a.icon}</div>
                  <h5 className="mt-2">{a.label}</h5>
                  <small className="text-muted">{a.desc}</small>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
