'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import Link from 'next/link';

const CUSTOMER_ID = 'CUST-0001';

const GET_CUSTOMER_OVERVIEW = gql`
  query GetCustomerOverview($customerId: ID!) {
    customer(customerId: $customerId) {
      customerId
      firstName
      lastName
      accountStatus
      activePlan {
        planCode
        name
        monthlyPrice
        features {
          dataLimitGB
          voiceMinutes
        }
      }
    }
  }
`;

export default function CustomerHome() {
  const { data, loading } = useQuery(GET_CUSTOMER_OVERVIEW, {
    variables: { customerId: CUSTOMER_ID },
  });
  const customer = data?.customer;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        Welcome, {loading ? '...' : `${customer?.firstName} ${customer?.lastName}`}
      </h3>
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="border-start border-primary border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Plan</small>
              <h5 className="mt-1">{loading ? '...' : customer?.activePlan?.name}</h5>
              <Badge bg="primary">${customer?.activePlan?.monthlyPrice}/mo</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-start border-success border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Data</small>
              <h5 className="mt-1">{customer?.activePlan?.features?.dataLimitGB ?? 0} GB</h5>
              <ProgressBar now={65} variant="success" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-start border-info border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Status</small>
              <h5 className="mt-1">{loading ? '...' : customer?.accountStatus}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-start border-warning border-4 h-100">
            <Card.Body>
              <small className="text-muted text-uppercase">Voice</small>
              <h5 className="mt-1">{customer?.activePlan?.features?.voiceMinutes ?? 0} min</h5>
              <ProgressBar now={42} variant="info" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3">
        {[
          {
            href: '/account',
            icon: '\u{1F3E0}',
            label: 'Account Details',
            desc: 'View profile, address, and plan details',
          },
          {
            href: '/plans',
            icon: '\u{1F4CB}',
            label: 'Manage Plans',
            desc: 'Compare and switch plans',
          },
          {
            href: '/tickets',
            icon: '\u{1F3AB}',
            label: 'Support Tickets',
            desc: 'Open or track support tickets',
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
