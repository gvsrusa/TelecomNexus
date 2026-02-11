'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge, ProgressBar, Breadcrumb, ListGroup } from 'react-bootstrap';
import { useAuth } from '@/lib/auth-context';

const GET_CUSTOMER = gql`
  query GetCustomer($customerId: ID!) {
    customer(customerId: $customerId) {
      customerId
      firstName
      lastName
      email
      phone
      accountStatus
      address {
        street
        city
        state
        zip
        country
      }
      activePlan {
        planCode
        name
        tier
        monthlyPrice
        features {
          dataLimitGB
          voiceMinutes
          smsCount
          internationalRoaming
          fiveGAccess
          hotspotGB
        }
      }
      createdAt
    }
  }
`;

export default function AccountPage() {
  const { customerId } = useAuth();
  const { data, loading, error } = useQuery(GET_CUSTOMER, {
    variables: { customerId },
  });

  if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

  const customer = data?.customer;
  const plan = customer?.activePlan;

  return (
    <div>
      <Breadcrumb className="mb-2">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/customer/account">Customer</Breadcrumb.Item>
        <Breadcrumb.Item active>Account</Breadcrumb.Item>
      </Breadcrumb>
      <h3 className="fw-bold mb-4">Account Dashboard</h3>

      {loading ? (
        <Row className="g-3">
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} md={6} lg={3}>
              <Card>
                <Card.Body className="placeholder-glow">
                  <span className="placeholder col-8" />
                  <br />
                  <span className="placeholder col-6" />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : customer ? (
        <>
          {/* Profile Card */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col xs="auto">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: 64, height: 64, fontSize: '1.5rem' }}
                  >
                    {customer.firstName?.[0]}
                    {customer.lastName?.[0]}
                  </div>
                </Col>
                <Col>
                  <h4 className="mb-1">
                    {customer.firstName} {customer.lastName}
                  </h4>
                  <div className="text-muted">{customer.email}</div>
                  <div className="text-muted">{customer.phone}</div>
                </Col>
                <Col xs="auto">
                  <Badge
                    bg={
                      customer.accountStatus === 'ACTIVE'
                        ? 'success'
                        : customer.accountStatus === 'SUSPENDED'
                          ? 'warning'
                          : 'info'
                    }
                    className="px-3 py-2"
                  >
                    {customer.accountStatus}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Stats Row */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <small className="text-muted text-uppercase">Plan</small>
                  <h5 className="mt-1 mb-0">{plan?.name ?? 'N/A'}</h5>
                  <Badge bg="primary" className="mt-1">
                    {plan?.tier}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <small className="text-muted text-uppercase">Monthly Cost</small>
                  <h5 className="mt-1 mb-0">${plan?.monthlyPrice ?? 0}</h5>
                  <small className="text-muted">per month</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <small className="text-muted text-uppercase">Data</small>
                  <h5 className="mt-1 mb-0">{plan?.features?.dataLimitGB ?? 0} GB</h5>
                  <ProgressBar now={65} variant="success" style={{ height: 6 }} className="mt-2" />
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <small className="text-muted text-uppercase">Voice</small>
                  <h5 className="mt-1 mb-0">{plan?.features?.voiceMinutes ?? 0} min</h5>
                  <ProgressBar now={42} variant="info" style={{ height: 6 }} className="mt-2" />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Plan Details & Address */}
          <Row className="g-3">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent fw-bold">Plan Features</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Data</span>
                      <strong>{plan?.features?.dataLimitGB} GB</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Voice Minutes</span>
                      <strong>{plan?.features?.voiceMinutes}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>SMS</span>
                      <strong>{plan?.features?.smsCount}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>5G Access</span>
                      <Badge bg={plan?.features?.fiveGAccess ? 'success' : 'secondary'}>
                        {plan?.features?.fiveGAccess ? 'Yes' : 'No'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Int&apos;l Roaming</span>
                      <Badge bg={plan?.features?.internationalRoaming ? 'success' : 'secondary'}>
                        {plan?.features?.internationalRoaming ? 'Yes' : 'No'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Hotspot Data</span>
                      <strong>{plan?.features?.hotspotGB ?? 0} GB</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent fw-bold">Address</Card.Header>
                <Card.Body>
                  {customer.address ? (
                    <div>
                      <p className="mb-1">{customer.address.street}</p>
                      <p className="mb-1">
                        {customer.address.city}, {customer.address.state} {customer.address.zip}
                      </p>
                      <p className="mb-0">{customer.address.country}</p>
                    </div>
                  ) : (
                    <p className="text-muted">No address on file</p>
                  )}
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mt-3">
                <Card.Header className="bg-transparent fw-bold">Account Info</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Customer ID</span>
                      <code>{customer.customerId}</code>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Member Since</span>
                      <span>
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <div className="alert alert-warning">Customer not found</div>
      )}
    </div>
  );
}
