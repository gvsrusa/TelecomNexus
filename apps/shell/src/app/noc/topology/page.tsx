'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Offcanvas, ListGroup, Form } from 'react-bootstrap';
import { useState, useRef, useEffect, useCallback } from 'react';

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

const STATUS_COLORS: Record<string, string> = {
  OPERATIONAL: '#28A745',
  DEGRADED: '#FFC107',
  DOWN: '#DC3545',
  MAINTENANCE: '#17A2B8',
};

const DEVICE_ICONS: Record<string, string> = {
  TOWER: '\u{1F4F6}',
  ROUTER: '\u{1F4E6}',
  SWITCH: '\u{1F501}',
  BASE_STATION: '\u{1F4E1}',
  FIBER_NODE: '\u{1F534}',
};

export default function TopologyPage() {
  const { data, loading } = useQuery(GET_DEVICES, { pollInterval: 30000 });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [regionFilter, setRegionFilter] = useState('ALL');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const devices: Device[] = data?.devices ?? [];
  const regions = [
    'ALL',
    ...Array.from(new Set(devices.map((d) => d.location?.region).filter(Boolean))),
  ];
  const filtered =
    regionFilter === 'ALL' ? devices : devices.filter((d) => d.location?.region === regionFilter);

  // Simple force-directed topology canvas rendering
  const drawTopology = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || filtered.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Assign positions using simple grid layout with jitter
    const nodePositions = new Map<string, { x: number; y: number }>();
    const cols = Math.ceil(Math.sqrt(filtered.length));
    const cellW = canvas.width / (cols + 1);
    const cellH = canvas.height / (Math.ceil(filtered.length / cols) + 1);

    filtered.forEach((device, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.random() - 0.5) * cellW * 0.3;
      const jitterY = (Math.random() - 0.5) * cellH * 0.3;
      nodePositions.set(device.deviceId, {
        x: (col + 1) * cellW + jitterX,
        y: (row + 1) * cellH + jitterY,
      });
    });

    // Clear
    ctx.fillStyle = '#1a1d21';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    filtered.forEach((device) => {
      const pos = nodePositions.get(device.deviceId);
      if (!pos) return;
      (device.connectedDevices ?? []).forEach((conn) => {
        const connPos = nodePositions.get(conn.deviceId);
        if (!connPos) return;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(connPos.x, connPos.y);
        ctx.strokeStyle =
          device.status === 'DOWN'
            ? '#DC3545'
            : device.status === 'DEGRADED'
              ? '#FFC107'
              : '#28A74555';
        ctx.lineWidth = device.status === 'DOWN' ? 2 : 1;
        if (device.status === 'DEGRADED') ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
      });
    });

    // Draw nodes
    filtered.forEach((device) => {
      const pos = nodePositions.get(device.deviceId);
      if (!pos) return;
      const color = STATUS_COLORS[device.status] ?? '#888';
      const radius = device.type === 'TOWER' ? 18 : 14;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ccc';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(device.name.substring(0, 12), pos.x, pos.y + radius + 14);
    });
  }, [filtered]);

  useEffect(() => {
    drawTopology();
  }, [drawTopology]);

  // Handle canvas click to select device
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Simple hit test
      const cols = Math.ceil(Math.sqrt(filtered.length));
      const cellW = canvas.width / (cols + 1);
      const cellH = canvas.height / (Math.ceil(filtered.length / cols) + 1);

      for (const device of filtered) {
        const i = filtered.indexOf(device);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const nodeX = (col + 1) * cellW;
        const nodeY = (row + 1) * cellH;
        const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
        if (dist < 20) {
          setSelectedDevice(device);
          return;
        }
      }
    },
    [filtered],
  );

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Network Topology</h3>
        <div className="d-flex align-items-center gap-2">
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
          {/* Legend */}
          <div className="d-none d-md-flex gap-2">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="d-flex align-items-center gap-1">
                <div
                  style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }}
                />
                <small>{status}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <Row className="g-2 mb-3">
        {['OPERATIONAL', 'DEGRADED', 'DOWN', 'MAINTENANCE'].map((s) => (
          <Col key={s} xs={6} md={3}>
            <Card className={`text-center border-0 shadow-sm`}>
              <Card.Body className="py-2">
                <h4 className="mb-0">{filtered.filter((d) => d.status === s).length}</h4>
                <Badge bg={statusBg(s)}>{s}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Canvas Topology */}
      <Card className="mb-3 border-0 shadow-sm" style={{ backgroundColor: '#1a1d21' }}>
        <Card.Body className="p-0">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: 500 }}
            >
              <div className="spinner-border text-light" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{ width: '100%', height: 500, cursor: 'pointer' }}
            />
          )}
        </Card.Body>
      </Card>

      {/* Device List (below canvas) */}
      <h5 className="fw-bold mb-3">Device List</h5>
      <Row className="g-2">
        {filtered.map((device) => (
          <Col key={device.deviceId} xs={12} sm={6} lg={4} xl={3}>
            <Card
              className="card-hover h-100"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedDevice(device)}
            >
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="me-1">{DEVICE_ICONS[device.type] ?? '\u{1F4BB}'}</span>
                    <strong>{device.name}</strong>
                  </div>
                  <Badge bg={statusBg(device.status)}>{device.status}</Badge>
                </div>
                <small className="text-muted">
                  {device.type} &middot; {device.location?.region}
                </small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Detail Offcanvas */}
      <Offcanvas show={!!selectedDevice} onHide={() => setSelectedDevice(null)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selectedDevice?.name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedDevice && (
            <>
              <Badge bg={statusBg(selectedDevice.status)} className="mb-3">
                {selectedDevice.status}
              </Badge>
              <ListGroup variant="flush" className="mb-3">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Device ID</span>
                  <code>{selectedDevice.deviceId}</code>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Type</span>
                  <span>{selectedDevice.type}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Region</span>
                  <span>{selectedDevice.location?.region}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Firmware</span>
                  <span>{selectedDevice.metadata?.firmwareVersion}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Manufacturer</span>
                  <span>{selectedDevice.metadata?.manufacturer}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Model</span>
                  <span>{selectedDevice.metadata?.model}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Connections</span>
                  <span>{selectedDevice.connectedDevices?.length ?? 0} devices</span>
                </ListGroup.Item>
              </ListGroup>
              <h6>Connected Devices</h6>
              <div className="d-flex flex-wrap gap-1">
                {selectedDevice.connectedDevices?.map((conn) => (
                  <Badge key={conn.deviceId} bg="light" text="dark">
                    {conn.deviceId}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
