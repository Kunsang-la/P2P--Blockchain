#!/bin/bash

set -e

echo "=== 1. Starting 3-Node Cluster ==="
docker-compose up --build -d

echo "Waiting for containers to start..."
sleep 5

echo "=== 2. Submitting Message to Node 1 ==="
curl -s -X POST http://localhost:3001/message \
    -H "Content-Type: application/json" \
    -d '{"message":"Assignment Verification Test"}' > /dev/null

echo "Message submitted."

echo "=== 3. Mining Block on Node 1 ==="
curl -s -X POST http://localhost:3001/mine > /dev/null

echo "Waiting for propagation..."
sleep 2

echo "=== 4. Checking Data Propagation on Node 3 ==="

NODE3_CHAIN=$(curl -s http://localhost:3003/chain)

if echo "$NODE3_CHAIN" | grep -q "Assignment Verification Test"; then
    echo "SUCCESS: Block successfully propagated from Node 1 to Node 3"
else
    echo "FAILED: Node 3 did not receive the updated block."
    echo
    echo "Node 3 Chain:"
    echo "$NODE3_CHAIN"
    docker-compose down
    exit 1
fi

echo "=== 5. Tearing Down Cluster ==="
docker-compose down

echo "All tests passed successfully."