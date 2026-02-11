#!/bin/bash
# Cassandra initialization wrapper - retries until Cassandra is ready
# Cassandra takes 30-60s to start; built-in init is less reliable than MongoDB's
# Run: docker compose run --rm cassandra-init
# Or from host after cassandra is up: ./docker/cassandra-init/init.sh
#   (requires cqlsh installed locally, or use the docker run method)

set -e
CQLSH="${CQLSH:-cqlsh}"
HOST="${CASSANDRA_HOST:-cassandra}"
PORT="${CASSANDRA_PORT:-9042}"
SCRIPT_DIR="${SCRIPT_DIR:-/scripts}"
MAX_ATTEMPTS=30
ATTEMPT=0

echo "Waiting for Cassandra at $HOST:$PORT to be ready..."

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if $CQLSH -e "DESCRIBE KEYSPACES" "$HOST" "$PORT" 2>/dev/null; then
    echo "Cassandra is ready. Running schema..."
    for f in "$SCRIPT_DIR"/*.cql; do
      [ -f "$f" ] && $CQLSH -f "$f" "$HOST" "$PORT" && echo "Executed: $f"
    done
    echo "Cassandra initialization complete."
    exit 0
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS - Cassandra not ready, retrying in 5s..."
  sleep 5
done

echo "Cassandra did not become ready in time."
exit 1
