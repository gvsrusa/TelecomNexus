'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';

const CUSTOMER_ID = 'CUST-0001';

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
          amount
          quantity
        }
        totalAmount
        status
        dueDate
        paidDate
      }
    }
  }
`;

const PAY_INVOICE = gql`
  mutation PayInvoice($input: PayInvoiceInput!) {
    payInvoice(input: $input) {
      success
      message
      payment {
        paymentId
        amount
        status
      }
    }
  }
`;

interface Invoice {
  invoiceNumber: string;
  billingPeriod: { start: string; end: string };
  lineItems: { description: string; amount: number; quantity: number }[];
  totalAmount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

export default function InvoicesPage() {
  const { data, loading, refetch } = useQuery(GET_INVOICES, {
    variables: { customerId: CUSTOMER_ID },
  });
  const [payInvoice] = useMutation(PAY_INVOICE);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [method, setMethod] = useState('CREDIT_CARD');
  const invoices: Invoice[] = data?.customer?.invoices ?? [];

  const statusColor = (s: string) => {
    switch (s) {
      case 'PAID':
        return 'success';
      case 'DUE':
        return 'warning';
      case 'OVERDUE':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handlePay = async () => {
    if (!selected) return;
    await payInvoice({
      variables: {
        input: {
          customerId: CUSTOMER_ID,
          invoiceNumber: selected.invoiceNumber,
          amount: selected.totalAmount,
          method,
          idempotencyKey: `pay-${selected.invoiceNumber}-${Date.now()}`,
        },
      },
    });
    setShowPay(false);
    setSelected(null);
    refetch();
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Invoices</h3>
      <Row className="g-2 mb-4">
        {[
          { l: 'Total', c: invoices.length, b: 'primary' },
          { l: 'Paid', c: invoices.filter((i) => i.status === 'PAID').length, b: 'success' },
          { l: 'Due', c: invoices.filter((i) => i.status === 'DUE').length, b: 'warning' },
          { l: 'Overdue', c: invoices.filter((i) => i.status === 'OVERDUE').length, b: 'danger' },
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
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.invoiceNumber}>
                    <td className="fw-bold">{inv.invoiceNumber}</td>
                    <td>${inv.totalAmount.toFixed(2)}</td>
                    <td>
                      <Badge bg={statusColor(inv.status)}>{inv.status}</Badge>
                    </td>
                    <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setSelected(inv);
                          setShowPay(false);
                        }}
                      >
                        View
                      </Button>
                      {(inv.status === 'DUE' || inv.status === 'OVERDUE') && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelected(inv);
                            setShowPay(true);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
      {/* Detail Modal */}
      <Modal show={!!selected && !showPay} onHide={() => setSelected(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Invoice {selected?.invoiceNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <div className="d-flex justify-content-between mb-3">
                <span>
                  {new Date(selected.billingPeriod?.start).toLocaleDateString()} -{' '}
                  {new Date(selected.billingPeriod?.end).toLocaleDateString()}
                </span>
                <Badge bg={statusColor(selected.status)}>{selected.status}</Badge>
              </div>
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lineItems?.map((li, i) => (
                    <tr key={i}>
                      <td>{li.description}</td>
                      <td className="text-end">{li.quantity}</td>
                      <td className="text-end">${li.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td colSpan={2}>Total</td>
                    <td className="text-end">${selected.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
      {/* Pay Modal */}
      <Modal show={showPay} onHide={() => setShowPay(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="text-center mb-3">
              <h3>${selected.totalAmount.toFixed(2)}</h3>
              <small className="text-muted">{selected.invoiceNumber}</small>
            </div>
          )}
          <Form.Group>
            {['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'].map((m) => (
              <Form.Check
                key={m}
                type="radio"
                label={m.replace(/_/g, ' ')}
                name="method"
                value={m}
                checked={method === m}
                onChange={(e) => setMethod(e.target.value)}
                className="mb-2"
              />
            ))}
          </Form.Group>
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
