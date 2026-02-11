import { cassandraClient } from './client';

export interface CDRRow {
  callId: string;
  customerId: string;
  timestamp: Date;
  fromNumber: string;
  toNumber: string;
  durationSeconds: number;
  callType: string;
  status: string;
}

export interface CDRConnection {
  edges: { node: CDRRow; cursor: string }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

/**
 * Get CDRs for a customer in a given month with cursor-based pagination.
 */
export async function getCDRs(
  customerId: string,
  month: string,
  first: number = 20,
  after?: string | undefined,
): Promise<CDRConnection> {
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as cnt FROM cdr_by_customer
    WHERE customer_id = ? AND month = ?
  `;
  const countResult = await cassandraClient.execute(countQuery, [customerId, month], {
    prepare: true,
  });
  const totalCount = Number(countResult.rows[0]?.['cnt'] ?? 0);

  // Get CDRs
  let query = `
    SELECT customer_id, month, timestamp, call_id, call_type,
           duration_seconds, status, from_number, to_number
    FROM cdr_by_customer
    WHERE customer_id = ? AND month = ?
  `;
  const params: unknown[] = [customerId, month];

  // Apply cursor (cursor is base64-encoded timestamp)
  if (after) {
    const cursorTimestamp = new Date(Buffer.from(after, 'base64').toString('utf-8'));
    query += ` AND timestamp < ?`;
    params.push(cursorTimestamp);
  }

  query += ` LIMIT ?`;
  params.push(first + 1); // Fetch one extra to determine hasNextPage

  const result = await cassandraClient.execute(query, params, {
    prepare: true,
  });

  const hasNextPage = result.rows.length > first;
  const rows = result.rows.slice(0, first);

  const edges = rows.map((row) => {
    const node: CDRRow = {
      callId: String(row['call_id']),
      customerId: String(row['customer_id']),
      timestamp: row['timestamp'] as Date,
      fromNumber: String(row['from_number']),
      toNumber: String(row['to_number']),
      durationSeconds: Number(row['duration_seconds']),
      callType: String(row['call_type']),
      status: String(row['status']),
    };
    const cursor = Buffer.from(node.timestamp.toISOString()).toString('base64');
    return { node, cursor };
  });

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
    },
    totalCount,
  };
}
