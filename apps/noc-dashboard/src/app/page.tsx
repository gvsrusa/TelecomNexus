'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import Link from 'next/link';

const GET_NOC_OVERVIEW = gql`
  query GetNOCOverview {
    devices(limit: 100) {
      deviceId
      status
      type
    }
    alertsSummary {
      critical
      major
      minor
      info
      total
    }
  }
`;

export default function NOCHome() {
  const { data, loading } = useQuery(GET_NOC_OVERVIEW);
  const devices = data?.devices ?? [];
  const summary = data?.alertsSummary;
  const operational = devices.filter((d: { status: string }) => d.status === 'OPERATIONAL').length;
  const degraded = devices.filter((d: { status: string }) => d.status === 'DEGRADED').length;
  const down = devices.filter((d: { status: string }) => d.status === 'DOWN').length;

  return (
    <div>
      <h3 className="fw-bold mb-4">Network Operations Center</h3>
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h2 className="text-success">{loading ? '...' : operational}</h2>
              <Badge bg="success">Operational</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h2 className="text-warning">{loading ? '...' : degraded}</h2>
              <Badge bg="warning">Degraded</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h2 className="text-danger">{loading ? '...' : down}</h2>
              <Badge bg="danger">Down</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h2>{loading ? '...' : (summary?.total ?? 0)}</h2>
              <Badge bg="dark">Active Alerts</Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3">
        {[
          {
            href: '/topology',
            icon: '\u{1F310}',
            label: 'Network Topology',
            desc: 'Interactive network map with device status',
          },
          {
            href: '/telemetry',
            icon: '\u{1F4C8}',
            label: 'Telemetry',
            desc: 'Real-time device metrics and charts',
          },
          {
            href: '/alerts',
            icon: '\u{1F514}',
            label: 'Alerts',
            desc: 'Monitor and manage network alerts',
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
