import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No tickets" description="You have no open tickets" />);
    expect(screen.getByText('No tickets')).toBeInTheDocument();
    expect(screen.getByText('You have no open tickets')).toBeInTheDocument();
  });

  it('renders optional icon', () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">X</span>}
        title="Empty"
        description="Nothing here"
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        actionLabel="Add Item"
        onAction={onAction}
      />,
    );
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('does not render action button without onAction', () => {
    render(<EmptyState title="Empty" description="Nothing here" actionLabel="Add Item" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
