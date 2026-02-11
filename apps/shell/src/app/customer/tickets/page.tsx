'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Form, Tab, Tabs, Modal, ListGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

const GET_TICKETS = gql`
  query GetTickets($customerId: ID!) {
    tickets(customerId: $customerId) {
      ticketId
      subject
      category
      status
      priority
      createdAt
      updatedAt
      messages {
        sender
        senderName
        content
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
  updatedAt: string;
  messages: { sender: string; senderName: string; content: string; timestamp: string }[];
}

export default function TicketsPage() {
  const { customerId } = useAuth();
  const { addToast } = useToast();
  const { data, loading, refetch } = useQuery(GET_TICKETS, { variables: { customerId } });
  const [createTicket] = useMutation(CREATE_TICKET);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('BILLING');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const tickets: Ticket[] = data?.tickets ?? [];
  const filtered =
    statusFilter === 'ALL' ? tickets : tickets.filter((t) => t.status === statusFilter);

  const handleCreate = async () => {
    try {
      await createTicket({
        variables: {
          input: { customerId, subject, category, priority, description },
        },
      });
      addToast({
        title: 'Ticket Created',
        body: `"${subject}" submitted successfully`,
        variant: 'success',
      });
      setShowCreate(false);
      setSubject('');
      setCategory('BILLING');
      setPriority('MEDIUM');
      setDescription('');
      refetch();
    } catch (err) {
      addToast({
        title: 'Ticket Creation Failed',
        body: err instanceof Error ? err.message : 'Unknown error',
        variant: 'danger',
      });
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const statusSteps = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Support Tickets</h3>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          + New Ticket
        </Button>
      </div>

      <Tabs activeKey={statusFilter} onSelect={(k) => setStatusFilter(k ?? 'ALL')} className="mb-4">
        <Tab eventKey="ALL" title={`All (${tickets.length})`} />
        <Tab
          eventKey="OPEN"
          title={`Open (${tickets.filter((t) => t.status === 'OPEN').length})`}
        />
        <Tab
          eventKey="IN_PROGRESS"
          title={`In Progress (${tickets.filter((t) => t.status === 'IN_PROGRESS').length})`}
        />
        <Tab
          eventKey="RESOLVED"
          title={`Resolved (${tickets.filter((t) => t.status === 'RESOLVED').length})`}
        />
        <Tab
          eventKey="CLOSED"
          title={`Closed (${tickets.filter((t) => t.status === 'CLOSED').length})`}
        />
      </Tabs>

      {loading ? (
        <div className="placeholder-glow">
          {[1, 2, 3].map((i) => (
            <div key={i} className="placeholder col-12 mb-2" style={{ height: 60 }} />
          ))}
        </div>
      ) : (
        <Row className="g-3">
          <Col lg={selectedTicket ? 6 : 12}>
            {filtered.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <p className="text-muted mb-0">No tickets found</p>
                </Card.Body>
              </Card>
            ) : (
              <ListGroup>
                {filtered.map((ticket) => (
                  <ListGroup.Item
                    key={ticket.ticketId}
                    action
                    active={selectedTicket?.ticketId === ticket.ticketId}
                    onClick={() => setSelectedTicket(ticket)}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div>
                      <div className="fw-bold">{ticket.subject}</div>
                      <small className="text-muted">
                        {ticket.ticketId} &middot; {ticket.category}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge bg={statusColor(ticket.status)} className="mb-1">
                        {ticket.status.replace(/_/g, ' ')}
                      </Badge>
                      <br />
                      <Badge bg={priorityColor(ticket.priority)} className="opacity-75">
                        {ticket.priority}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>

          {selectedTicket && (
            <Col lg={6}>
              <Card className="sticky-top" style={{ top: 20 }}>
                <Card.Header className="bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{selectedTicket.ticketId}</strong>
                    <Button variant="link" size="sm" onClick={() => setSelectedTicket(null)}>
                      Close
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <h5>{selectedTicket.subject}</h5>
                  <div className="d-flex gap-2 mb-3">
                    <Badge bg={statusColor(selectedTicket.status)}>
                      {selectedTicket.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge bg={priorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge bg="light" text="dark">
                      {selectedTicket.category}
                    </Badge>
                  </div>

                  {/* Status stepper */}
                  <div className="d-flex mb-4">
                    {statusSteps.map((step, i) => {
                      const currentIdx = statusSteps.indexOf(selectedTicket.status);
                      const isActive = i <= currentIdx;
                      return (
                        <div key={step} className="flex-fill text-center">
                          <div
                            className={`rounded-circle mx-auto mb-1 ${isActive ? 'bg-primary' : 'bg-secondary bg-opacity-25'}`}
                            style={{ width: 24, height: 24 }}
                          />
                          <small
                            className={isActive ? 'fw-bold' : 'text-muted'}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {step.replace(/_/g, ' ')}
                          </small>
                        </div>
                      );
                    })}
                  </div>

                  {/* Messages */}
                  <h6 className="mb-3">Conversation</h6>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {selectedTicket.messages?.map((msg, i) => (
                      <div
                        key={i}
                        className={`mb-2 p-2 rounded ${
                          msg.sender === 'CUSTOMER'
                            ? 'bg-primary bg-opacity-10 ms-4'
                            : 'bg-secondary bg-opacity-10 me-4'
                        }`}
                      >
                        <small className="fw-bold">
                          {msg.sender === 'CUSTOMER' ? 'You' : 'Agent'}
                        </small>
                        <p className="mb-1 small">{msg.content}</p>
                        <small className="text-muted">
                          {new Date(msg.timestamp).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Create Ticket Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Open New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="BILLING">Billing</option>
                <option value="NETWORK">Network</option>
                <option value="DEVICE">Device</option>
                <option value="PLAN">Plan</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in detail..."
                required
              />
              <Form.Text className="text-muted">{description.length}/1000 characters</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!subject || !description}>
            Submit Ticket
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
