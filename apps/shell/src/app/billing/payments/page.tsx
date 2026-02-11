'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Form, ListGroup } from 'react-bootstrap';
import { useAuth } from '@/lib/auth-context';

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
        processedDate
        invoiceId
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
  processedDate: string;
  invoiceId: string;
}

export default function PaymentsPage() {
  const { customerId } = useAuth();
  const { data, loading, refetch } = useQuery(GET_PAYMENTS, { variables: { customerId } });
  const [toggleAutoPay] = useMutation(TOGGLE_AUTOPAY);

  const payments: Payment[] = data?.customer?.payments ?? [];
  const autoPayEnabled: boolean = data?.customer?.autoPayEnabled ?? false;

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
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const handleAutoPayToggle = async () => {
    await toggleAutoPay({
      variables: { customerId, enabled: !autoPayEnabled },
    });
    refetch();
  };

  // Group payments by month
  const groupedPayments = payments.reduce<Record<string, Payment[]>>((acc, p) => {
    const date = new Date(p.processedDate);
    const key = date.toLocaleDateString([], { year: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h3 className="fw-bold mb-4">Payment History</h3>

      <Row className="g-3 mb-4">
        {/* Summary */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <small className="text-muted text-uppercase">Total Paid</small>
              <h3 className="text-success">${totalPaid.toFixed(2)}</h3>
              <small className="text-muted">{payments.length} payments</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Auto-Pay Card */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Auto-Pay</h6>
                  <small className="text-muted">Automatic payment on due date</small>
                </div>
                <Form.Check
                  type="switch"
                  checked={autoPayEnabled}
                  onChange={handleAutoPayToggle}
                  id="autopay-switch"
                />
              </div>
              <Badge bg={autoPayEnabled ? 'success' : 'secondary'} className="mt-2">
                {autoPayEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between px-0 py-1">
                  <small>Completed</small>
                  <Badge bg="success">
                    {payments.filter((p) => p.status === 'COMPLETED').length}
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

      {/* Payment Timeline */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">No payments found</p>
          </Card.Body>
        </Card>
      ) : (
        Object.entries(groupedPayments).map(([monthLabel, monthPayments]) => (
          <div key={monthLabel} className="mb-4">
            <h6 className="text-muted fw-bold mb-3">{monthLabel}</h6>
            {monthPayments.map((payment) => (
              <Card key={payment.paymentId} className="mb-2 border-0 shadow-sm card-hover">
                <Card.Body className="py-3">
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor:
                            payment.status === 'COMPLETED' ? '#28A74520' : '#FFC10720',
                          fontSize: '1.2rem',
                        }}
                      >
                        {methodIcon(payment.method)}
                      </div>
                    </Col>
                    <Col>
                      <div className="fw-bold">{payment.method.replace(/_/g, ' ')}</div>
                      <small className="text-muted">
                        {new Date(payment.processedDate).toLocaleDateString()} &middot;{' '}
                        {payment.transactionRef}
                      </small>
                    </Col>
                    <Col xs="auto" className="text-end">
                      <div className="fw-bold">${payment.amount.toFixed(2)}</div>
                      <Badge bg={statusColor(payment.status)}>{payment.status}</Badge>
                    </Col>
                    <Col xs="auto">
                      {payment.status === 'COMPLETED' && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          href={`http://localhost:4003/api/receipts/${payment.paymentId}.xml`}
                          target="_blank"
                        >
                          Receipt
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
