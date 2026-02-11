'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CUSTOMER_ID = 'CUST-0001';

const GET_USAGE = gql`
  query GetUsage($customerId: ID!, $month: String!) {
    customer(customerId: $customerId) {
      customerId
      currentUsage {
        dataUsedGB
        voiceUsedMinutes
        smsCount
      }
      usageByDay(month: $month) {
        date
        dataUsedMB
        voiceUsedSeconds
        smsCount
      }
      activePlan {
        features {
          dataLimitGB
          voiceMinutes
          smsCount
        }
      }
    }
  }
`;

export default function UsagePage() {
  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  );
  const { data, loading } = useQuery(GET_USAGE, { variables: { customerId: CUSTOMER_ID, month } });

  const usage = data?.customer?.currentUsage;
  const daily = data?.customer?.usageByDay ?? [];
  const plan = data?.customer?.activePlan;
  const dataLimitGB = plan?.features?.dataLimitGB ?? 50;

  const chartData = daily.map(
    (d: { date: string; dataUsedMB: number; voiceUsedSeconds: number; smsCount: number }) => ({
      date: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      data: Math.round(d.dataUsedMB),
      voice: Math.round(d.voiceUsedSeconds / 60),
      sms: d.smsCount,
    }),
  );

  const dataUsedGB = usage?.dataUsedGB ?? 0;
  const dataPct = Math.min(100, (dataUsedGB / dataLimitGB) * 100);
  const voicePct = Math.min(
    100,
    ((usage?.voiceUsedMinutes ?? 0) / (plan?.features?.voiceMinutes ?? 1000)) * 100,
  );
  const smsPct = Math.min(100, ((usage?.smsCount ?? 0) / (plan?.features?.smsCount ?? 5000)) * 100);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString([], { year: 'numeric', month: 'long' }),
    };
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Usage Analytics</h3>
        <Form.Select
          size="sm"
          style={{ maxWidth: 200 }}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Form.Select>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            {[
              {
                label: 'Data',
                used: `${dataUsedGB.toFixed(1)} GB`,
                limit: `${dataLimitGB} GB`,
                pct: dataPct,
                color: '#0066CC',
              },
              {
                label: 'Voice',
                used: `${usage?.voiceUsedMinutes ?? 0} min`,
                limit: `${plan?.features?.voiceMinutes ?? 0} min`,
                pct: voicePct,
                color: '#6C63FF',
              },
              {
                label: 'SMS',
                used: `${usage?.smsCount ?? 0}`,
                limit: `${plan?.features?.smsCount ?? 0}`,
                pct: smsPct,
                color: '#28A745',
              },
            ].map((u) => (
              <Col key={u.label} md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e9ecef" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={u.color}
                        strokeWidth="8"
                        strokeDasharray={`${(u.pct / 100) * 264} 264`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="16"
                        fontWeight="bold"
                        fill={u.color}
                      >
                        {Math.round(u.pct)}%
                      </text>
                    </svg>
                    <h6 className="mt-2 mb-0">{u.label}</h6>
                    <div className="fw-bold">
                      {u.used} <small className="text-muted">of {u.limit}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3">Daily Data Usage (MB)</h6>
              {chartData.length === 0 ? (
                <p className="text-muted text-center py-4">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <ReferenceLine
                      y={(dataLimitGB * 1024) / 30}
                      stroke="#DC3545"
                      strokeDasharray="5 5"
                      label={{ value: 'Avg Limit', fill: '#DC3545', fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="data"
                      stroke="#0066CC"
                      fill="#0066CC"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
