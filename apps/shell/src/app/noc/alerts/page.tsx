'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Form, ListGroup, Breadcrumb } from 'react-bootstrap';
import { useState } from 'react';
import { useToast } from '@/lib/toast-context';

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

const ACKNOWLEDGE_ALERT = gql`
  mutation AcknowledgeAlert($alertId: ID!) {
    acknowledgeAlert(alertId: $alertId) {
      alertId
      status
    }
  }
`;

const RESOLVE_ALERT = gql`
  mutation ResolveAlert($alertId: ID!, $resolution: String!) {
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
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { addToast } = useToast();
  const { data, loading, refetch } = useQuery(GET_ALERTS, {
    variables: { deviceId: deviceFilter || undefined },
    pollInterval: 10000,
  });
  const [acknowledgeAlert] = useMutation(ACKNOWLEDGE_ALERT);
  const [resolveAlert] = useMutation(RESOLVE_ALERT);

  const alerts: Alert[] = data?.alerts ?? [];
  const summary = data?.alertsSummary;
  const devices = data?.devices ?? [];

  const filtered =
    severityFilter === 'ALL' ? alerts : alerts.filter((a) => a.severity === severityFilter);

  const severityColor = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'danger';
      case 'MAJOR':
        return 'warning';
      case 'MINOR':
        return 'info';
      case 'INFO':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const statusColor = (s: string) => {
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

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert({ variables: { alertId } });
      addToast({ title: 'Alert Acknowledged', body: `Alert ${alertId}`, variant: 'info' });
      refetch();
    } catch (err) {
      addToast({
        title: 'Failed',
        body: err instanceof Error ? err.message : 'Error',
        variant: 'danger',
      });
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert({ variables: { alertId, resolution: 'Resolved by operator' } });
      addToast({ title: 'Alert Resolved', body: `Alert ${alertId}`, variant: 'success' });
      refetch();
    } catch (err) {
      addToast({
        title: 'Failed',
        body: err instanceof Error ? err.message : 'Error',
        variant: 'danger',
      });
    }
  };

  return (
    <div>
      <Breadcrumb className="mb-2">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/noc/topology">NOC</Breadcrumb.Item>
        <Breadcrumb.Item active>Alerts</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Alerts</h3>
        <Button
          variant="outline-secondary"
          size="sm"
          href="http://localhost:4002/api/alerts/rss"
          target="_blank"
        >
          RSS Feed
        </Button>
      </div>

      {/* Summary Banner */}
      {summary && (
        <Row className="g-2 mb-4" aria-live="polite" aria-label="Alert summary counts">
          {[
            { label: 'Critical', count: summary.critical, color: 'danger' },
            { label: 'Major', count: summary.major, color: 'warning' },
            { label: 'Minor', count: summary.minor, color: 'info' },
            { label: 'Info', count: summary.info, color: 'secondary' },
            { label: 'Total', count: summary.total, color: 'dark' },
          ].map((s) => (
            <Col key={s.label} xs={6} md>
              <Card className={`text-center border-0 shadow-sm`}>
                <Card.Body className="py-2">
                  <h3 className="mb-0">{s.count}</h3>
                  <Badge bg={s.color}>{s.label}</Badge>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        <Form.Select
          size="sm"
          style={{ maxWidth: 200 }}
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
        >
          <option value="">All Devices</option>
          {devices.map((d: { deviceId: string; name: string }) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.name}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          size="sm"
          style={{ maxWidth: 150 }}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="MAJOR">Major</option>
          <option value="MINOR">Minor</option>
          <option value="INFO">Info</option>
        </Form.Select>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Row className="g-3">
          {/* Alert List */}
          <Col lg={selectedAlert ? 7 : 12}>
            {filtered.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <p className="text-muted mb-0">No alerts found</p>
                </Card.Body>
              </Card>
            ) : (
              <ListGroup>
                {filtered.map((alert) => (
                  <ListGroup.Item
                    key={alert.alertId}
                    action
                    active={selectedAlert?.alertId === alert.alertId}
                    onClick={() => setSelectedAlert(alert)}
                    className={`${alert.severity === 'CRITICAL' && alert.status === 'ACTIVE' ? 'border-start border-danger border-3 pulse-danger' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex gap-2 mb-1">
                          <Badge bg={severityColor(alert.severity)}>{alert.severity}</Badge>
                          <Badge bg={statusColor(alert.status)}>{alert.status}</Badge>
                        </div>
                        <div className="fw-bold">{alert.title}</div>
                        <small className="text-muted">
                          {alert.device?.deviceId} &middot; {alert.description}
                        </small>
                      </div>
                      <small className="text-muted text-nowrap ms-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>

          {/* Alert Detail */}
          {selectedAlert && (
            <Col lg={5}>
              <Card className="sticky-top border-0 shadow-sm" style={{ top: 20 }}>
                <Card.Header className="bg-transparent d-flex justify-content-between">
                  <strong>Alert Detail</strong>
                  <Button variant="link" size="sm" onClick={() => setSelectedAlert(null)}>
                    Close
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex gap-2 mb-3">
                    <Badge bg={severityColor(selectedAlert.severity)}>
                      {selectedAlert.severity}
                    </Badge>
                    <Badge bg={statusColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                  </div>
                  <h5>{selectedAlert.title}</h5>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Alert ID</span>
                      <code>{selectedAlert.alertId}</code>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Device</span>
                      <span>{selectedAlert.device?.name ?? selectedAlert.device?.deviceId}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Description</span>
                      <span>{selectedAlert.description}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Time</span>
                      <span>{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                    </ListGroup.Item>
                  </ListGroup>

                  {/* Status Timeline */}
                  <h6 className="mb-2">Lifecycle</h6>
                  <div className="d-flex mb-3">
                    {['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((step, i) => {
                      const steps = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];
                      const currentIdx = steps.indexOf(selectedAlert.status);
                      const isActive = i <= currentIdx;
                      return (
                        <div key={step} className="flex-fill text-center">
                          <div
                            className={`rounded-circle mx-auto mb-1 ${isActive ? 'bg-primary' : 'bg-secondary bg-opacity-25'}`}
                            style={{ width: 20, height: 20 }}
                          />
                          <small
                            className={isActive ? 'fw-bold' : 'text-muted'}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {step}
                          </small>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    {selectedAlert.status === 'ACTIVE' && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleAcknowledge(selectedAlert.alertId)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {(selectedAlert.status === 'ACTIVE' ||
                      selectedAlert.status === 'ACKNOWLEDGED') && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleResolve(selectedAlert.alertId)}
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
