'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Form, ButtonGroup, Button } from 'react-bootstrap';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const GET_TELEMETRY = gql`
  query GetTelemetry($deviceId: ID!, $timeRange: TimeRange!) {
    telemetry(deviceId: $deviceId, timeRange: $timeRange) {
      timestamp
      cpuPercent
      memoryPercent
      bandwidthMbps
      packetLossPercent
      temperatureCelsius
    }
  }
`;

const GET_DEVICES = gql`
  query GetTelemetryDevices {
    devices {
      deviceId
      name
      status
    }
  }
`;

interface TelemetryPoint {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  bandwidthMbps: number;
  packetLossPercent: number;
  temperatureCelsius: number;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

function getTimeRange(range: TimeRange): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  switch (range) {
    case '1h':
      start.setHours(end.getHours() - 1);
      break;
    case '6h':
      start.setHours(end.getHours() - 6);
      break;
    case '24h':
      start.setDate(end.getDate() - 1);
      break;
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function TelemetryPage() {
  const [selectedDevice, setSelectedDevice] = useState('DEV-001');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const { data: devicesData } = useQuery(GET_DEVICES);
  const { data: telemetryData, loading } = useQuery(GET_TELEMETRY, {
    variables: {
      deviceId: selectedDevice,
      timeRange: getTimeRange(timeRange),
    },
    pollInterval: 10000,
  });

  const devices = devicesData?.devices ?? [];
  const readings: TelemetryPoint[] = telemetryData?.telemetry ?? [];

  // Format for charts
  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: r.cpuPercent,
    memory: r.memoryPercent,
    bandwidth: r.bandwidthMbps,
    packetLoss: r.packetLossPercent,
    temperature: r.temperatureCelsius,
  }));

  // Get latest values
  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h3 className="fw-bold mb-0">Telemetry</h3>
        <div className="d-flex align-items-center gap-2">
          <Form.Select
            size="sm"
            style={{ maxWidth: 200 }}
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            {devices.map((d: { deviceId: string; name: string }) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.name} ({d.deviceId})
              </option>
            ))}
          </Form.Select>
          <ButtonGroup size="sm">
            {(['1h', '6h', '24h', '7d'] as TimeRange[]).map((r) => (
              <Button
                key={r}
                variant={timeRange === r ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange(r)}
              >
                {r}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>

      {/* Current Values */}
      {latest && (
        <Row className="g-3 mb-4">
          {[
            { label: 'CPU Load', value: `${latest.cpuPercent.toFixed(1)}%`, color: '#0066CC' },
            { label: 'Memory', value: `${latest.memoryPercent.toFixed(1)}%`, color: '#6C63FF' },
            {
              label: 'Bandwidth',
              value: `${latest.bandwidthMbps.toFixed(0)} Mbps`,
              color: '#28A745',
            },
            {
              label: 'Packet Loss',
              value: `${latest.packetLossPercent.toFixed(2)}%`,
              color: '#DC3545',
            },
            {
              label: 'Temperature',
              value: `${latest.temperatureCelsius.toFixed(1)}\u00B0C`,
              color: '#FFC107',
            },
          ].map((m) => (
            <Col key={m.label} xs={6} md>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="py-2">
                  <small className="text-muted">{m.label}</small>
                  <h4 className="mb-0" style={{ color: m.color }}>
                    {m.value}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {loading && readings.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Row className="g-3">
          {/* CPU Load */}
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">CPU Load (%)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#0066CC"
                      fill="#0066CC"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Memory Usage */}
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Memory Usage (%)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stroke="#6C63FF"
                      fill="#6C63FF"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Bandwidth */}
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Bandwidth (Mbps)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="bandwidth"
                      stroke="#28A745"
                      fill="#28A745"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Packet Loss */}
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Packet Loss (%)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="packetLoss" stroke="#DC3545" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
