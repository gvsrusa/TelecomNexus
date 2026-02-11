'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Offcanvas, ListGroup, Form } from 'react-bootstrap';
import { useState } from 'react';

const GET_DEVICES = gql`
  query GetDevices {
    devices {
      deviceId
      name
      type
      status
      location {
        lat
        lng
        address
        region
      }
      metadata {
        manufacturer
        model
        firmwareVersion
        installDate
      }
      connectedDevices {
        deviceId
      }
    }
  }
`;

interface Device {
  deviceId: string;
  name: string;
  type: string;
  status: string;
  location: { lat: number; lng: number; address: string; region: string };
  metadata: { manufacturer: string; model: string; firmwareVersion: string; installDate: string };
  connectedDevices: { deviceId: string }[];
}

export default function TopologyPage() {
  const { data, loading } = useQuery(GET_DEVICES, { pollInterval: 30000 });
  const [selected, setSelected] = useState<Device | null>(null);
  const [regionFilter, setRegionFilter] = useState('ALL');
  const devices: Device[] = data?.devices ?? [];
  const regions = [
    'ALL',
    ...Array.from(new Set(devices.map((d) => d.location?.region).filter(Boolean))),
  ];
  const filtered =
    regionFilter === 'ALL' ? devices : devices.filter((d) => d.location?.region === regionFilter);

  const statusBg = (s: string) => {
    switch (s) {
      case 'OPERATIONAL':
        return 'success';
      case 'DEGRADED':
        return 'warning';
      case 'DOWN':
        return 'danger';
      case 'MAINTENANCE':
        return 'info';
      default:
        return 'secondary';
    }
  };
  const typeIcon = (t: string) => {
    switch (t) {
      case 'TOWER':
        return '\u{1F4F6}';
      case 'ROUTER':
        return '\u{1F4E6}';
      case 'SWITCH':
        return '\u{1F501}';
      case 'BASE_STATION':
        return '\u{1F4E1}';
      default:
        return '\u{1F534}';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Network Topology</h3>
        <Form.Select
          size="sm"
          style={{ maxWidth: 160 }}
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r === 'ALL' ? 'All Regions' : r}
            </option>
          ))}
        </Form.Select>
      </div>
      <Row className="g-2 mb-3">
        {['OPERATIONAL', 'DEGRADED', 'DOWN', 'MAINTENANCE'].map((s) => (
          <Col key={s} xs={6} md={3}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body className="py-2">
                <h4 className="mb-0">{filtered.filter((d) => d.status === s).length}</h4>
                <Badge bg={statusBg(s)}>{s}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Row className="g-2">
          {filtered.map((d) => (
            <Col key={d.deviceId} xs={12} sm={6} lg={4} xl={3}>
              <Card className="h-100" style={{ cursor: 'pointer' }} onClick={() => setSelected(d)}>
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <span className="me-1">{typeIcon(d.type)}</span>
                      <strong>{d.name}</strong>
                    </div>
                    <Badge bg={statusBg(d.status)}>{d.status}</Badge>
                  </div>
                  <small className="text-muted">
                    {d.type} &middot; {d.location?.region} &middot;{' '}
                    {d.connectedDevices?.length ?? 0} connections
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <Offcanvas show={!!selected} onHide={() => setSelected(null)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selected?.name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selected && (
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>ID</span>
                <code>{selected.deviceId}</code>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Type</span>
                <span>{selected.type}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Status</span>
                <Badge bg={statusBg(selected.status)}>{selected.status}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Region</span>
                <span>{selected.location?.region}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Firmware</span>
                <span>{selected.metadata?.firmwareVersion}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Manufacturer</span>
                <span>{selected.metadata?.manufacturer}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Connections</span>
                <span>{selected.connectedDevices?.length ?? 0}</span>
              </ListGroup.Item>
            </ListGroup>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
