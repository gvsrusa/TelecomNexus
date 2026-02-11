import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, type ColumnDef } from '../DataTable/DataTable';

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
}

const columns: ColumnDef<TestRow>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id' },
  { id: 'name', header: 'Name', accessorKey: 'name' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <span data-testid={`status-${row.id}`}>{row.status}</span>,
  },
];

const data: TestRow[] = [
  { id: '1', name: 'Alice', status: 'ACTIVE' },
  { id: '2', name: 'Bob', status: 'INACTIVE' },
  { id: '3', name: 'Carol', status: 'ACTIVE' },
];

describe('DataTable', () => {
  it('renders table headers', () => {
    render(<DataTable columns={columns} data={data} />);
    // Headers appear once in the <thead>
    const headers = screen.getAllByText('ID');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1);
  });

  it('renders data rows using accessorKey', () => {
    render(<DataTable columns={columns} data={data} />);
    // Content renders in both table and card views
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Carol').length).toBeGreaterThanOrEqual(1);
  });

  it('uses custom cell renderer', () => {
    render(<DataTable columns={columns} data={data} />);
    // There are two status-1 elements (table + card), check at least one
    const statusEls = screen.getAllByTestId('status-1');
    expect(statusEls.length).toBeGreaterThanOrEqual(1);
    expect(statusEls[0]).toHaveTextContent('ACTIVE');
  });

  it('calls onRowClick when table row is clicked', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={data} onRowClick={onRowClick} />,
    );
    // Get the first <tr> in <tbody>
    const firstRow = container.querySelector('tbody tr');
    if (firstRow) fireEvent.click(firstRow);
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('handles keyboard navigation on rows', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={data} onRowClick={onRowClick} />,
    );
    const firstRow = container.querySelector('tbody tr');
    if (firstRow) {
      fireEvent.keyDown(firstRow, { key: 'Enter' });
      expect(onRowClick).toHaveBeenCalledWith(data[0]);
    }
  });

  it('adds role=button and tabIndex to interactive rows', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={data} onRowClick={onRowClick} />,
    );
    const firstRow = container.querySelector('tbody tr');
    expect(firstRow).toHaveAttribute('role', 'button');
    expect(firstRow).toHaveAttribute('tabindex', '0');
  });

  it('renders empty table without errors', () => {
    const { container } = render(<DataTable columns={columns} data={[]} />);
    const tbody = container.querySelector('tbody');
    expect(tbody?.children.length).toBe(0);
  });
});
