'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Badge, Button, Tab, Tabs, Modal, ListGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

const GET_PLANS_AND_CUSTOMER = gql`
  query GetPlansAndCustomer($customerId: ID!) {
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
        internationalRoaming
        fiveGAccess
        hotspotData
      }
    }
    customer(customerId: $customerId) {
      customerId
      activePlan {
        planCode
        name
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
    internationalRoaming: boolean;
    fiveGAccess: boolean;
    hotspotData: number;
  };
}

export default function PlansPage() {
  const { customerId } = useAuth();
  const { addToast } = useToast();
  const { data, loading } = useQuery(GET_PLANS_AND_CUSTOMER, { variables: { customerId } });
  const [changePlan] = useMutation(CHANGE_PLAN);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTier, setActiveTier] = useState('all');

  const plans: Plan[] = data?.plans ?? [];
  const currentPlanCode = data?.customer?.activePlan?.planCode;

  const tiers = ['all', ...Array.from(new Set(plans.map((p) => p.tier)))];
  const filteredPlans = activeTier === 'all' ? plans : plans.filter((p) => p.tier === activeTier);

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    try {
      await changePlan({
        variables: { customerId, planCode: selectedPlan.planCode },
        refetchQueries: ['GetPlansAndCustomer', 'GetDashboard'],
      });
      addToast({
        title: 'Plan Changed',
        body: `Switched to ${selectedPlan.name}`,
        variant: 'success',
      });
      setShowConfirm(false);
      setSelectedPlan(null);
    } catch (err) {
      addToast({
        title: 'Plan Change Failed',
        body: err instanceof Error ? err.message : 'Unknown error',
        variant: 'danger',
      });
    }
  };

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'secondary';
      case 'STANDARD':
        return 'primary';
      case 'PREMIUM':
        return 'warning';
      case 'ENTERPRISE':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Plan Management</h3>

      <Tabs activeKey={activeTier} onSelect={(k) => setActiveTier(k ?? 'all')} className="mb-4">
        {tiers.map((tier) => (
          <Tab key={tier} eventKey={tier} title={tier === 'all' ? 'All Plans' : tier}>
            {/* Tab content rendered below */}
          </Tab>
        ))}
      </Tabs>

      {loading ? (
        <Row className="g-3">
          {[1, 2, 3].map((i) => (
            <Col key={i} md={6} lg={4}>
              <Card>
                <Card.Body className="placeholder-glow">
                  <span className="placeholder col-8" />
                  <br />
                  <span className="placeholder col-6" />
                  <br />
                  <span className="placeholder col-10" />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="g-3">
          {filteredPlans.map((plan) => {
            const isCurrent = plan.planCode === currentPlanCode;
            return (
              <Col key={plan.planCode} md={6} lg={4}>
                <Card className={`h-100 card-hover ${isCurrent ? 'border-primary border-2' : ''}`}>
                  {isCurrent && (
                    <div className="bg-primary text-white text-center py-1 small fw-bold">
                      Your Current Plan
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0">{plan.name}</h5>
                      <Badge bg={tierColor(plan.tier)}>{plan.tier}</Badge>
                    </div>
                    <div className="mb-3">
                      <span className="display-6 fw-bold">${plan.monthlyPrice}</span>
                      <span className="text-muted">/mo</span>
                    </div>
                    <ListGroup variant="flush" className="mb-3 flex-grow-1">
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.dataLimitGB} GB Data</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.voiceMinutes} Voice Minutes</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.smsLimit} SMS</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.fiveGAccess ? '\u2705' : '\u274C'} 5G Access</small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>
                          {plan.features.internationalRoaming ? '\u2705' : '\u274C'} Int&apos;l
                          Roaming
                        </small>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-1 border-0">
                        <small>{plan.features.hotspotData} GB Hotspot</small>
                      </ListGroup.Item>
                    </ListGroup>
                    <Button
                      variant={isCurrent ? 'outline-primary' : 'primary'}
                      disabled={isCurrent || !plan.isActive}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowConfirm(true);
                      }}
                      className="w-100"
                    >
                      {isCurrent ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Plan Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlan && (
            <div>
              <p>
                Are you sure you want to switch to <strong>{selectedPlan.name}</strong>?
              </p>
              <Card className="bg-light">
                <Card.Body>
                  <Row>
                    <Col>
                      <small className="text-muted">New Plan</small>
                      <h6>{selectedPlan.name}</h6>
                    </Col>
                    <Col className="text-end">
                      <small className="text-muted">Monthly Cost</small>
                      <h6>${selectedPlan.monthlyPrice}/mo</h6>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
