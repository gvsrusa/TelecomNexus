'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const GET_DASHBOARD = gql`
  query GetDashboard($customerId: ID!) {
    customer(customerId: $customerId) {
      customerId
      firstName
      lastName
      accountStatus
      activePlan {
        name
        monthlyPrice
        features {
          dataLimitGB
          voiceMinutes
          smsCount
        }
      }
    }
    devices {
      deviceId
      status
    }
  }
`;

export default function DashboardPage() {
  const { customerId, customerName } = useAuth();
  const { data, loading } = useQuery(GET_DASHBOARD, {
    variables: { customerId },
  });

  const customer = data?.customer;
  const devices = data?.devices ?? [];
  const operational = devices.filter((d: { status: string }) => d.status === 'OPERATIONAL').length;
  const degraded = devices.filter((d: { status: string }) => d.status === 'DEGRADED').length;
  const down = devices.filter((d: { status: string }) => d.status === 'DOWN').length;

  return (
    <div>
      {/* Hero */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Welcome back, {loading ? '...' : (customer?.firstName ?? customerName)}
        </h2>
        <p className="text-muted">Here is your TelecomNexus overview</p>
      </div>

      {/* Quick Stats */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <Card className="stat-card card-hover border-start border-primary border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Current Plan</small>
                  <h4 className="mb-0 mt-1">
                    {loading ? '...' : (customer?.activePlan?.name ?? 'N/A')}
                  </h4>
                </div>
                <span style={{ fontSize: '2rem', opacity: 0.3 }}>{'\u{1F4CB}'}</span>
              </div>
              {customer?.activePlan && (
                <Badge bg="primary" className="mt-2">
                  ${customer.activePlan.monthlyPrice}/mo
                </Badge>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="stat-card card-hover border-start border-success border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Data Quota</small>
                  <h4 className="mb-0 mt-1">
                    {loading ? '...' : `${customer?.activePlan?.features?.dataLimitGB ?? 0} GB`}
                  </h4>
                </div>
                <span style={{ fontSize: '2rem', opacity: 0.3 }}>{'\u{1F4F6}'}</span>
              </div>
              <ProgressBar now={65} variant="success" className="mt-2" style={{ height: 6 }} />
              <small className="text-muted">65% used this cycle</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="stat-card card-hover border-start border-warning border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Network Health</small>
                  <h4 className="mb-0 mt-1">
                    {loading ? '...' : `${operational}/${devices.length}`}
                  </h4>
                </div>
                <span style={{ fontSize: '2rem', opacity: 0.3 }}>{'\u{1F4E1}'}</span>
              </div>
              <div className="d-flex gap-2 mt-2">
                <Badge bg="success">{operational} Up</Badge>
                <Badge bg="warning">{degraded} Deg</Badge>
                <Badge bg="danger">{down} Down</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="stat-card card-hover border-start border-info border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Account Status</small>
                  <h4 className="mb-0 mt-1">
                    {loading ? '...' : (customer?.accountStatus ?? 'N/A')}
                  </h4>
                </div>
                <span style={{ fontSize: '2rem', opacity: 0.3 }}>{'\u{2705}'}</span>
              </div>
              <Badge
                bg={customer?.accountStatus === 'ACTIVE' ? 'success' : 'warning'}
                className="mt-2"
              >
                {customer?.accountStatus ?? '...'}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <h5 className="fw-bold mb-3">Quick Actions</h5>
      <Row className="g-3 mb-4">
        {[
          { href: '/billing/invoices', icon: '\u{1F4B3}', label: 'Pay Bill', color: '#0066CC' },
          { href: '/customer/plans', icon: '\u{1F504}', label: 'Change Plan', color: '#6C63FF' },
          { href: '/customer/tickets', icon: '\u{1F4E9}', label: 'Open Ticket', color: '#28A745' },
          { href: '/billing/usage', icon: '\u{1F4CA}', label: 'View Usage', color: '#17A2B8' },
          { href: '/noc/topology', icon: '\u{1F310}', label: 'Network Map', color: '#FFC107' },
          { href: '/noc/alerts', icon: '\u{1F514}', label: 'View Alerts', color: '#DC3545' },
        ].map((action) => (
          <Col key={action.href} xs={6} md={4} lg={2}>
            <Link href={action.href} className="text-decoration-none">
              <Card className="card-hover text-center" style={{ cursor: 'pointer' }}>
                <Card.Body className="py-3">
                  <div style={{ fontSize: '2rem' }}>{action.icon}</div>
                  <small className="fw-semibold">{action.label}</small>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Network Overview (mini) */}
      <h5 className="fw-bold mb-3">Network at a Glance</h5>
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="text-center border-end">
              <h2 className="text-success mb-0">{operational}</h2>
              <small className="text-muted">Operational</small>
            </Col>
            <Col md={4} className="text-center border-end">
              <h2 className="text-warning mb-0">{degraded}</h2>
              <small className="text-muted">Degraded</small>
            </Col>
            <Col md={4} className="text-center">
              <h2 className="text-danger mb-0">{down}</h2>
              <small className="text-muted">Down</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}
