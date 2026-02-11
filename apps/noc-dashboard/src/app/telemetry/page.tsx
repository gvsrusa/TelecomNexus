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
  query GetTelemetry($deviceId: ID!, $timeRange: TimeRangeInput!) {
    telemetry(deviceId: $deviceId, timeRange: $timeRange) {
      timestamp
      cpuLoad
      memoryUsage
      bandwidthMbps
      packetLossPercent
      temperatureCelsius
    }
  }
`;

const GET_DEVICES = gql`
  query GetDeviceList {
    devices(limit: 100) {
      deviceId
      name
    }
  }
`;

type TimeRange = '1h' | '6h' | '24h' | '7d';

function getTimeRange(range: TimeRange) {
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
  const [device, setDevice] = useState('DEV-001');
  const [range, setRange] = useState<TimeRange>('24h');
  const { data: dd } = useQuery(GET_DEVICES);
  const { data: td, loading } = useQuery(GET_TELEMETRY, {
    variables: { deviceId: device, timeRange: getTimeRange(range) },
    pollInterval: 10000,
  });

  const readings = td?.telemetry ?? [];
  const chartData = readings.map(
    (r: {
      timestamp: string;
      cpuLoad: number;
      memoryUsage: number;
      bandwidthMbps: number;
      packetLossPercent: number;
    }) => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: r.cpuLoad,
      memory: r.memoryUsage,
      bandwidth: r.bandwidthMbps,
      packetLoss: r.packetLossPercent,
    }),
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h3 className="fw-bold mb-0">Telemetry</h3>
        <div className="d-flex gap-2">
          <Form.Select
            size="sm"
            style={{ maxWidth: 200 }}
            value={device}
            onChange={(e) => setDevice(e.target.value)}
          >
            {(dd?.devices ?? []).map((d: { deviceId: string; name: string }) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.name}
              </option>
            ))}
          </Form.Select>
          <ButtonGroup size="sm">
            {(['1h', '6h', '24h', '7d'] as TimeRange[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'primary' : 'outline-primary'}
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
      {loading && readings.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Row className="g-3">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">CPU Load (%)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
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
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Memory (%)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
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
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Bandwidth (Mbps)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
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
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Packet Loss (%)</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
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
