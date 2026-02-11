'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Form, ListGroup } from 'react-bootstrap';
import { useState } from 'react';

const GET_ALERTS = gql`
  query GetAlerts($deviceId: ID) {
    alertsSummary {
      critical
      major
      minor
      info
      total
    }
    alerts(deviceId: $deviceId) {
      alertId
      device {
        deviceId
        name
      }
      severity
      status
      title
      description
      timestamp
    }
    devices {
      deviceId
      name
    }
  }
`;

const ACK = gql`
  mutation Ack($alertId: ID!) {
    acknowledgeAlert(alertId: $alertId) {
      alertId
      status
    }
  }
`;
const RESOLVE = gql`
  mutation Resolve($alertId: ID!, $resolution: String!) {
    resolveAlert(alertId: $alertId, resolution: $resolution) {
      alertId
      status
    }
  }
`;

interface Alert {
  alertId: string;
  device: { deviceId: string; name: string };
  severity: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function AlertsPage() {
  const [deviceFilter, setDeviceFilter] = useState('');
  const [sevFilter, setSevFilter] = useState('ALL');
  const [selected, setSelected] = useState<Alert | null>(null);
  const { data, loading, refetch } = useQuery(GET_ALERTS, {
    variables: { deviceId: deviceFilter || undefined },
    pollInterval: 10000,
  });
  const [ack] = useMutation(ACK);
  const [resolve] = useMutation(RESOLVE);

  const alerts: Alert[] = data?.alerts ?? [];
  const summary = data?.alertsSummary;
  const filtered = sevFilter === 'ALL' ? alerts : alerts.filter((a) => a.severity === sevFilter);

  const sevColor = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'danger';
      case 'MAJOR':
        return 'warning';
      case 'MINOR':
        return 'info';
      default:
        return 'secondary';
    }
  };
  const statColor = (s: string) => {
    switch (s) {
      case 'ACTIVE':
        return 'danger';
      case 'ACKNOWLEDGED':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Alerts</h3>
      {summary && (
        <Row className="g-2 mb-4">
          {[
            { l: 'Critical', c: summary.critical, b: 'danger' },
            { l: 'Major', c: summary.major, b: 'warning' },
            { l: 'Minor', c: summary.minor, b: 'info' },
            { l: 'Total', c: summary.total, b: 'dark' },
          ].map((s) => (
            <Col key={s.l} xs={6} md={3}>
              <Card className="text-center border-0 shadow-sm">
                <Card.Body className="py-2">
                  <h3 className="mb-0">{s.c}</h3>
                  <Badge bg={s.b}>{s.l}</Badge>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <div className="d-flex gap-2 mb-3">
        <Form.Select
          size="sm"
          style={{ maxWidth: 200 }}
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
        >
          <option value="">All Devices</option>
          {(data?.devices ?? []).map((d: { deviceId: string; name: string }) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.name}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          size="sm"
          style={{ maxWidth: 150 }}
          value={sevFilter}
          onChange={(e) => setSevFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="CRITICAL">Critical</option>
          <option value="MAJOR">Major</option>
          <option value="MINOR">Minor</option>
        </Form.Select>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Row className="g-3">
          <Col lg={selected ? 7 : 12}>
            <ListGroup>
              {filtered.map((a) => (
                <ListGroup.Item
                  key={a.alertId}
                  action
                  active={selected?.alertId === a.alertId}
                  onClick={() => setSelected(a)}
                  className={
                    a.severity === 'CRITICAL' && a.status === 'ACTIVE'
                      ? 'border-start border-danger border-3'
                      : ''
                  }
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="d-flex gap-1 mb-1">
                        <Badge bg={sevColor(a.severity)}>{a.severity}</Badge>
                        <Badge bg={statColor(a.status)}>{a.status}</Badge>
                      </div>
                      <div className="fw-bold">{a.title}</div>
                      <small className="text-muted">{a.device?.deviceId}</small>
                    </div>
                    <small className="text-muted text-nowrap">
                      {new Date(a.timestamp).toLocaleString()}
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          {selected && (
            <Col lg={5}>
              <Card className="sticky-top border-0 shadow-sm" style={{ top: 20 }}>
                <Card.Header className="bg-transparent d-flex justify-content-between">
                  <strong>Detail</strong>
                  <Button variant="link" size="sm" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </Card.Header>
                <Card.Body>
                  <h5>{selected.title}</h5>
                  <div className="d-flex gap-2 mb-3">
                    <Badge bg={sevColor(selected.severity)}>{selected.severity}</Badge>
                    <Badge bg={statColor(selected.status)}>{selected.status}</Badge>
                  </div>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>ID</span>
                      <code>{selected.alertId}</code>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Device</span>
                      <span>{selected.device?.name ?? selected.device?.deviceId}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Description</span>
                      <span>{selected.description}</span>
                    </ListGroup.Item>
                  </ListGroup>
                  <div className="d-flex gap-2">
                    {selected.status === 'ACTIVE' && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={async () => {
                          await ack({ variables: { alertId: selected.alertId } });
                          refetch();
                        }}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {selected.status !== 'RESOLVED' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={async () => {
                          await resolve({
                            variables: {
                              alertId: selected.alertId,
                              resolution: 'Resolved by operator',
                            },
                          });
                          refetch();
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}
