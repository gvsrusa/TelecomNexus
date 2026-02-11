import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text with underscores replaced by spaces', () => {
    render(<StatusBadge status="IN_PROGRESS" variant="ticket" />);
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('maps account ACTIVE to success variant', () => {
    const { container } = render(<StatusBadge status="ACTIVE" variant="account" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-success');
  });

  it('maps ticket OPEN to primary variant', () => {
    const { container } = render(<StatusBadge status="OPEN" variant="ticket" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-primary');
  });

  it('maps alert CRITICAL to danger variant', () => {
    const { container } = render(<StatusBadge status="CRITICAL" variant="alert" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-danger');
  });

  it('maps invoice PAID to success variant', () => {
    const { container } = render(<StatusBadge status="PAID" variant="invoice" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-success');
  });

  it('maps invoice OVERDUE to danger variant', () => {
    const { container } = render(<StatusBadge status="OVERDUE" variant="invoice" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-danger');
  });

  it('maps device OPERATIONAL to success variant', () => {
    const { container } = render(<StatusBadge status="OPERATIONAL" variant="device" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-success');
  });

  it('defaults to secondary for unknown status', () => {
    const { container } = render(<StatusBadge status="UNKNOWN" variant="account" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('bg-secondary');
  });
});
