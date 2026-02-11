'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Form, ListGroup } from 'react-bootstrap';

const CUSTOMER_ID = 'CUST-0001';

const GET_PAYMENTS = gql`
  query GetPayments($customerId: ID!) {
    customer(customerId: $customerId) {
      customerId
      autoPayEnabled
      payments {
        paymentId
        amount
        method
        status
        transactionRef
        processedAt
        invoiceNumber
      }
    }
  }
`;

const TOGGLE_AUTOPAY = gql`
  mutation ToggleAutoPay($customerId: ID!, $enabled: Boolean!) {
    toggleAutoPay(customerId: $customerId, enabled: $enabled) {
      customerId
      autoPayEnabled
    }
  }
`;

interface Payment {
  paymentId: string;
  amount: number;
  method: string;
  status: string;
  transactionRef: string;
  processedAt: string;
  invoiceNumber: string;
}

export default function PaymentsPage() {
  const { data, loading, refetch } = useQuery(GET_PAYMENTS, {
    variables: { customerId: CUSTOMER_ID },
  });
  const [toggleAutoPay] = useMutation(TOGGLE_AUTOPAY);
  const payments: Payment[] = data?.customer?.payments ?? [];
  const autoPayEnabled = data?.customer?.autoPayEnabled ?? false;

  const methodIcon = (m: string) => {
    switch (m) {
      case 'CREDIT_CARD':
        return '\u{1F4B3}';
      case 'BANK_TRANSFER':
        return '\u{1F3E6}';
      case 'DIGITAL_WALLET':
        return '\u{1F4F1}';
      default:
        return '\u{1F4B0}';
    }
  };
  const statusColor = (s: string) => {
    switch (s) {
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const grouped = payments.reduce<Record<string, Payment[]>>((acc, p) => {
    const key = new Date(p.processedAt).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const totalPaid = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h3 className="fw-bold mb-4">Payment History</h3>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <small className="text-muted text-uppercase">Total Paid</small>
              <h3 className="text-success">${totalPaid.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0">Auto-Pay</h6>
                <small className="text-muted">Auto charge on due date</small>
              </div>
              <Form.Check
                type="switch"
                checked={autoPayEnabled}
                onChange={async () => {
                  await toggleAutoPay({
                    variables: { customerId: CUSTOMER_ID, enabled: !autoPayEnabled },
                  });
                  refetch();
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between px-0 py-1">
                  <small>Completed</small>
                  <Badge bg="success">
                    {payments.filter((p) => p.status === 'SUCCESS').length}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0 py-1">
                  <small>Pending</small>
                  <Badge bg="warning">
                    {payments.filter((p) => p.status === 'PENDING').length}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0 py-1">
                  <small>Failed</small>
                  <Badge bg="danger">{payments.filter((p) => p.status === 'FAILED').length}</Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="mb-4">
            <h6 className="text-muted fw-bold mb-3">{label}</h6>
            {items.map((p) => (
              <Card key={p.paymentId} className="mb-2 border-0 shadow-sm">
                <Card.Body className="py-2">
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <span style={{ fontSize: '1.5rem' }}>{methodIcon(p.method)}</span>
                    </Col>
                    <Col>
                      <div className="fw-bold">{p.method.replace(/_/g, ' ')}</div>
                      <small className="text-muted">
                        {new Date(p.processedAt).toLocaleDateString()} &middot; {p.transactionRef}
                      </small>
                    </Col>
                    <Col xs="auto" className="text-end">
                      <div className="fw-bold">${p.amount.toFixed(2)}</div>
                      <Badge bg={statusColor(p.status)}>{p.status}</Badge>
                    </Col>
                    <Col xs="auto">
                      {p.status === 'SUCCESS' && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          href={`http://localhost:4003/api/receipts/${p.paymentId}.xml`}
                          target="_blank"
                        >
                          XML
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
