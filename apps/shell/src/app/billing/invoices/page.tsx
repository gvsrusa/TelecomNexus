'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Table, Modal, Form, ListGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

const GET_INVOICES = gql`
  query GetInvoices($customerId: ID!) {
    customer(customerId: $customerId) {
      customerId
      invoices {
        invoiceNumber
        billingPeriod {
          start
          end
        }
        lineItems {
          description
          category
          amount
        }
        totalAmount
        status
        dueDate
        paidAt
      }
    }
  }
`;

const PAY_INVOICE = gql`
  mutation PayInvoice($invoiceNumber: String!, $method: PaymentMethod!, $idempotencyKey: String!) {
    payInvoice(invoiceNumber: $invoiceNumber, method: $method, idempotencyKey: $idempotencyKey) {
      success
      errorMessage
      payment {
        paymentId
        amount
        status
      }
    }
  }
`;

interface LineItem {
  description: string;
  category: string;
  amount: number;
}

interface Invoice {
  invoiceNumber: string;
  billingPeriod: { start: string; end: string };
  lineItems: LineItem[];
  totalAmount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
}

export default function InvoicesPage() {
  const { customerId } = useAuth();
  const { addToast } = useToast();
  const { data, loading, refetch } = useQuery(GET_INVOICES, { variables: { customerId } });
  const [payInvoice] = useMutation(PAY_INVOICE);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const invoices: Invoice[] = data?.customer?.invoices ?? [];

  const statusColor = (s: string) => {
    switch (s) {
      case 'PAID':
        return 'success';
      case 'DUE':
        return 'warning';
      case 'OVERDUE':
        return 'danger';
      case 'DRAFT':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handlePay = async () => {
    if (!selectedInvoice) return;
    try {
      await payInvoice({
        variables: {
          invoiceNumber: selectedInvoice.invoiceNumber,
          method: paymentMethod,
          idempotencyKey: `pay-${selectedInvoice.invoiceNumber}-${Date.now()}`,
        },
      });
      addToast({
        title: 'Payment Successful',
        body: `$${selectedInvoice.totalAmount.toFixed(2)} paid for ${selectedInvoice.invoiceNumber}`,
        variant: 'success',
      });
      setShowPay(false);
      setSelectedInvoice(null);
      refetch();
    } catch (err) {
      addToast({
        title: 'Payment Failed',
        body: err instanceof Error ? err.message : 'Unknown error',
        variant: 'danger',
      });
    }
  };

  const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;

  return (
    <div>
      <h3 className="fw-bold mb-4">Invoice Management</h3>

      {/* Overdue Warning */}
      {overdueCount > 0 && (
        <div className="alert alert-danger d-flex align-items-center mb-4">
          <span className="me-2" style={{ fontSize: '1.2rem' }}>
            {'\u26A0\uFE0F'}
          </span>
          <span>
            You have <strong>{overdueCount}</strong> overdue invoice{overdueCount > 1 ? 's' : ''}.
            Please make a payment to avoid service disruption.
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total Invoices', count: invoices.length, bg: 'primary' },
          {
            label: 'Paid',
            count: invoices.filter((i) => i.status === 'PAID').length,
            bg: 'success',
          },
          { label: 'Due', count: invoices.filter((i) => i.status === 'DUE').length, bg: 'warning' },
          { label: 'Overdue', count: overdueCount, bg: 'danger' },
        ].map((s) => (
          <Col key={s.label} xs={6} md={3}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2">
                <h3 className="mb-0">{s.count}</h3>
                <Badge bg={s.bg}>{s.label}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : invoices.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">No invoices found</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Invoice #</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceNumber}>
                    <td className="fw-bold">{invoice.invoiceNumber}</td>
                    <td>
                      <small>
                        {new Date(invoice.billingPeriod?.start).toLocaleDateString()} -{' '}
                        {new Date(invoice.billingPeriod?.end).toLocaleDateString()}
                      </small>
                    </td>
                    <td className="fw-bold">${invoice.totalAmount.toFixed(2)}</td>
                    <td>
                      <Badge bg={statusColor(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          View
                        </Button>
                        {(invoice.status === 'DUE' || invoice.status === 'OVERDUE') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPay(true);
                            }}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* Invoice Detail Modal */}
      <Modal
        show={!!selectedInvoice && !showPay}
        onHide={() => setSelectedInvoice(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Invoice {selectedInvoice?.invoiceNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <h6 className="text-muted mb-0">Billing Period</h6>
                  <span>
                    {new Date(selectedInvoice.billingPeriod?.start).toLocaleDateString()} -{' '}
                    {new Date(selectedInvoice.billingPeriod?.end).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  bg={statusColor(selectedInvoice.status)}
                  className="align-self-start px-3 py-2"
                >
                  {selectedInvoice.status}
                </Badge>
              </div>

              {/* Status Timeline */}
              <div className="d-flex mb-4">
                {['DRAFT', 'DUE', 'PAID'].map((step, i) => {
                  const steps = ['DRAFT', 'DUE', 'PAID'];
                  const isOverdue = selectedInvoice.status === 'OVERDUE';
                  const currentIdx = isOverdue ? 1 : steps.indexOf(selectedInvoice.status);
                  const isActive = i <= currentIdx;
                  return (
                    <div key={step} className="flex-fill text-center">
                      <div
                        className={`rounded-circle mx-auto mb-1 ${
                          isActive
                            ? isOverdue && i === 1
                              ? 'bg-danger'
                              : 'bg-primary'
                            : 'bg-secondary bg-opacity-25'
                        }`}
                        style={{ width: 20, height: 20 }}
                      />
                      <small
                        className={isActive ? 'fw-bold' : 'text-muted'}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {isOverdue && i === 1 ? 'OVERDUE' : step}
                      </small>
                    </div>
                  );
                })}
              </div>

              <Table size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.lineItems?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td>{item.category}</td>
                      <td className="text-end">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td colSpan={2}>Total</td>
                    <td className="text-end">${selectedInvoice.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>

              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Due Date</span>
                  <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                </ListGroup.Item>
                {selectedInvoice.paidAt && (
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span>Paid Date</span>
                    <span>{new Date(selectedInvoice.paidAt).toLocaleDateString()}</span>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Pay Modal */}
      <Modal show={showPay} onHide={() => setShowPay(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div>
              <div className="text-center mb-4">
                <h3 className="mb-0">${selectedInvoice.totalAmount.toFixed(2)}</h3>
                <small className="text-muted">Invoice {selectedInvoice.invoiceNumber}</small>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Payment Method</Form.Label>
                {['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'].map((method) => (
                  <Form.Check
                    key={method}
                    type="radio"
                    label={method.replace(/_/g, ' ')}
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-2"
                  />
                ))}
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPay(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePay}>
            Confirm Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
