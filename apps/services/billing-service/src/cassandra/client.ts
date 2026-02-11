import cassandra from 'cassandra-driver';

const CASSANDRA_CONTACT_POINTS = (process.env.CASSANDRA_CONTACT_POINTS ?? 'localhost').split(',');
const CASSANDRA_DATACENTER = process.env.CASSANDRA_DATACENTER ?? 'datacenter1';
const CASSANDRA_KEYSPACE = process.env.CASSANDRA_KEYSPACE ?? 'telecom_telemetry';

export const cassandraClient = new cassandra.Client({
  contactPoints: CASSANDRA_CONTACT_POINTS,
  localDataCenter: CASSANDRA_DATACENTER,
  keyspace: CASSANDRA_KEYSPACE,
});

export async function connectCassandra(): Promise<void> {
  await cassandraClient.connect();
  console.log('[billing-service] Connected to Cassandra');
}

export { cassandra };
