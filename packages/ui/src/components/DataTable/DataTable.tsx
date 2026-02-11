import { Table, Card } from 'react-bootstrap';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortable?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  const renderCell = (row: T, col: ColumnDef<T>) => {
    if (col.cell) return col.cell(row);
    if (col.accessorKey) {
      const val = row[col.accessorKey];
      return String(val ?? '');
    }
    return null;
  };

  return (
    <div className="table-responsive d-none d-md-block">
      <Table striped hover responsive>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.id}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((col) => (
                <td key={col.id}>{renderCell(row, col)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-md-none">
        {data.map((row, i) => (
          <Card key={i} className="mb-2" onClick={() => onRowClick?.(row)}>
            <Card.Body>
              {columns.map((col) => (
                <div key={col.id}>
                  <small className="text-muted">{col.header}:</small>{' '}
                  {renderCell(row, col)}
                </div>
              ))}
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}
