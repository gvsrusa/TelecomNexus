'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';

const CUSTOMER_ID = 'CUST-0001';

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
          fiveGAccess
          internationalRoaming
          hotspotGB
        }
      }
      createdAt
    }
  }
`;

export default function AccountPage() {
  const { data, loading, error } = useQuery(GET_CUSTOMER, {
    variables: { customerId: CUSTOMER_ID },
  });
  if (error) return <div className="alert alert-danger">Error: {error.message}</div>;
  const customer = data?.customer;
  const plan = customer?.activePlan;

  return (
    <div>
      <h3 className="fw-bold mb-4">Account Dashboard</h3>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : customer ? (
        <>
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
                  <div className="text-muted">
                    {customer.email} &middot; {customer.phone}
                  </div>
                </Col>
                <Col xs="auto">
                  <Badge
                    bg={customer.accountStatus === 'ACTIVE' ? 'success' : 'warning'}
                    className="px-3 py-2"
                  >
                    {customer.accountStatus}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Row className="g-3">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent fw-bold">Plan: {plan?.name}</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Data</span>
                      <strong>{plan?.features?.dataLimitGB} GB</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Voice</span>
                      <strong>{plan?.features?.voiceMinutes} min</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>SMS</span>
                      <strong>{plan?.features?.smsCount}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>5G</span>
                      <Badge bg={plan?.features?.fiveGAccess ? 'success' : 'secondary'}>
                        {plan?.features?.fiveGAccess ? 'Yes' : 'No'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Price</span>
                      <strong>${plan?.monthlyPrice}/mo</strong>
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
                      <p className="mb-0">
                        {customer.address.city}, {customer.address.state} {customer.address.zip}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted">No address on file</p>
                  )}
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
