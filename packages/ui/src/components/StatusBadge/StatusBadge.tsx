import { Badge } from 'react-bootstrap';

type Variant = 'account' | 'ticket' | 'alert' | 'invoice' | 'device';

const variantMap: Record<Variant, Record<string, string>> = {
  account: {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    PENDING: 'info',
    CLOSED: 'secondary',
  },
  ticket: {
    OPEN: 'primary',
    IN_PROGRESS: 'info',
    RESOLVED: 'success',
    CLOSED: 'secondary',
  },
  alert: {
    CRITICAL: 'danger',
    MAJOR: 'warning',
    MINOR: 'info',
    INFO: 'secondary',
  },
  invoice: {
    DRAFT: 'secondary',
    DUE: 'warning',
    PAID: 'success',
    OVERDUE: 'danger',
  },
  device: {
    OPERATIONAL: 'success',
    DEGRADED: 'warning',
    DOWN: 'danger',
    MAINTENANCE: 'info',
  },
};

export interface StatusBadgeProps {
  status: string;
  variant: Variant;
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const map = variantMap[variant];
  const bsVariant = (map?.[status] ?? 'secondary') as
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';

  return <Badge bg={bsVariant}>{status.replace(/_/g, ' ')}</Badge>;
}
