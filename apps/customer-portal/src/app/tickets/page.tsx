'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Badge, Button, Form, Modal, ListGroup } from 'react-bootstrap';
import { useState } from 'react';

const CUSTOMER_ID = 'CUST-0001';

const GET_TICKETS = gql`
  query GetTickets($customerId: ID!) {
    tickets(customerId: $customerId) {
      ticketId
      subject
      category
      status
      priority
      createdAt
      messages {
        sender
        body
        timestamp
      }
    }
  }
`;

const CREATE_TICKET = gql`
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      ticketId
      subject
      status
    }
  }
`;

interface Ticket {
  ticketId: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  messages: { sender: string; body: string; timestamp: string }[];
}

export default function TicketsPage() {
  const { data, loading, refetch } = useQuery(GET_TICKETS, {
    variables: { customerId: CUSTOMER_ID },
  });
  const [createTicket] = useMutation(CREATE_TICKET);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('BILLING');
  const [message, setMessage] = useState('');

  const tickets: Ticket[] = data?.tickets ?? [];

  const handleCreate = async () => {
    await createTicket({
      variables: { input: { customerId: CUSTOMER_ID, subject, category, message } },
    });
    setShowCreate(false);
    setSubject('');
    setMessage('');
    refetch();
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Support Tickets</h3>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          + New Ticket
        </Button>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>No tickets found</Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {tickets.map((t) => (
            <ListGroup.Item
              key={t.ticketId}
              action
              onClick={() => setSelected(t)}
              className="d-flex justify-content-between"
            >
              <div>
                <div className="fw-bold">{t.subject}</div>
                <small className="text-muted">
                  {t.ticketId} &middot; {t.category}
                </small>
              </div>
              <div className="text-end">
                <Badge bg={statusColor(t.status)}>{t.status.replace(/_/g, ' ')}</Badge>
                <br />
                <small className="text-muted">{new Date(t.createdAt).toLocaleDateString()}</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      {/* Detail Modal */}
      <Modal show={!!selected} onHide={() => setSelected(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selected?.ticketId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <h5>{selected.subject}</h5>
              <div className="d-flex gap-2 mb-3">
                <Badge bg={statusColor(selected.status)}>{selected.status}</Badge>
                <Badge bg="light" text="dark">
                  {selected.category}
                </Badge>
              </div>
              <h6>Conversation</h6>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {selected.messages?.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 p-2 rounded ${msg.sender === 'CUSTOMER' ? 'bg-primary bg-opacity-10 ms-4' : 'bg-secondary bg-opacity-10 me-4'}`}
                  >
                    <small className="fw-bold">{msg.sender === 'CUSTOMER' ? 'You' : 'Agent'}</small>
                    <p className="mb-0 small">{msg.body}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="BILLING">Billing</option>
              <option value="TECHNICAL">Technical</option>
              <option value="NETWORK">Network</option>
              <option value="ACCOUNT">Account</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!subject || !message}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
