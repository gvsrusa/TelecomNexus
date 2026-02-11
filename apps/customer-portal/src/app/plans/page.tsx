'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, ListGroup, Modal } from 'react-bootstrap';
import { useState } from 'react';

const CUSTOMER_ID = 'CUST-0001';

const GET_PLANS = gql`
  query GetPlans($customerId: ID!) {
    plans {
      planCode
      name
      tier
      monthlyPrice
      isActive
      features {
        dataLimitGB
        voiceMinutes
        smsLimit
        fiveGAccess
        internationalRoaming
        hotspotData
      }
    }
    customer(customerId: $customerId) {
      customerId
      activePlan {
        planCode
      }
    }
  }
`;

const CHANGE_PLAN = gql`
  mutation ChangePlan($customerId: ID!, $planCode: String!) {
    changePlan(customerId: $customerId, newPlanCode: $planCode) {
      success
      message
    }
  }
`;

interface Plan {
  planCode: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  isActive: boolean;
  features: {
    dataLimitGB: number;
    voiceMinutes: number;
    smsLimit: number;
    fiveGAccess: boolean;
    internationalRoaming: boolean;
    hotspotData: number;
  };
}

export default function PlansPage() {
  const { data, loading } = useQuery(GET_PLANS, { variables: { customerId: CUSTOMER_ID } });
  const [changePlan] = useMutation(CHANGE_PLAN);
  const [selected, setSelected] = useState<Plan | null>(null);
  const plans: Plan[] = data?.plans ?? [];
  const currentCode = data?.customer?.activePlan?.planCode;

  const handleConfirm = async () => {
    if (!selected) return;
    await changePlan({
      variables: { customerId: CUSTOMER_ID, planCode: selected.planCode },
      refetchQueries: ['GetPlans'],
    });
    setSelected(null);
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Plan Management</h3>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <Row className="g-3">
          {plans.map((plan) => {
            const isCurrent = plan.planCode === currentCode;
            return (
              <Col key={plan.planCode} md={6} lg={4}>
                <Card className={`h-100 ${isCurrent ? 'border-primary border-2' : ''}`}>
                  {isCurrent && (
                    <div className="bg-primary text-white text-center py-1 small fw-bold">
                      Current Plan
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between mb-2">
                      <h5 className="fw-bold mb-0">{plan.name}</h5>
                      <Badge bg="info">{plan.tier}</Badge>
                    </div>
                    <h3>
                      ${plan.monthlyPrice}
                      <small className="text-muted fs-6">/mo</small>
                    </h3>
                    <ListGroup variant="flush" className="flex-grow-1 mb-3">
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.dataLimitGB} GB Data</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.voiceMinutes} Voice Min</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.smsLimit} SMS</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.fiveGAccess ? '\u2705' : '\u274C'} 5G</small>
                      </ListGroup.Item>
                    </ListGroup>
                    <Button
                      variant={isCurrent ? 'outline-primary' : 'primary'}
                      disabled={isCurrent}
                      onClick={() => setSelected(plan)}
                      className="w-100"
                    >
                      {isCurrent ? 'Current' : 'Select'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Plan Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Switch to <strong>{selected?.name}</strong> at ${selected?.monthlyPrice}/mo?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
