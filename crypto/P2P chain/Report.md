# Decentralized Message Logging Blockchain using Docker

## Submitted By

**Name:** Kunsang Lama

**Roll No:** 250420000008

**Course:** MCA

**Subject:** Modern cryptography and Blockchain

---

# Objective

To design and implement a lightweight, decentralized blockchain system for message logging using Docker containers. The system eliminates a single point of failure by allowing every node to maintain its own copy of the blockchain ledger while synchronizing newly mined blocks across peer nodes.

---

# Functional Requirements

The implemented blockchain satisfies the following requirements:

- Three blockchain nodes running independently
- Each node executes inside its own Docker container
- Communication over a dedicated Docker bridge network
- REST API for blockchain operations
- SHA-256 Proof of Work
- Genesis block initialization
- Longest valid chain consensus
- Automatic synchronization between peer nodes

---

# Project Structure

```text
P2P chain/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
└── test.sh
```

---

# Technologies Used

| Technology | Purpose |
|------------|---------|
| Node.js | Backend Runtime |
| Express.js | REST API |
| Docker | Containerization |
| Docker Compose | Multi-container deployment |
| SHA-256 | Hashing Algorithm |
| Axios | Peer Communication |

---

# System Architecture

```
                blockchain-net

        +----------------------+
        |      Node 1          |
        |   localhost:3001     |
        +----------------------+
             ▲             ▲
             │             │
             │             │
+----------------------+   +----------------------+
|      Node 2          |   |      Node 3          |
|   localhost:3002     |   |   localhost:3003     |
+----------------------+   +----------------------+
```

Each node maintains:

- Local Blockchain Ledger
- Pending Message Pool
- Proof-of-Work Miner
- REST API Server

---

# Docker Configuration

Three containers are created using Docker Compose.

| Container | Host Port | Internal Port |
|-----------|-----------|---------------|
| node1 | 3001 | 3000 |
| node2 | 3002 | 3000 |
| node3 | 3003 | 3000 |

Network

```
blockchain-net
```

---

# Blockchain Data Structure

Each block contains

```json
{
    "index": 1,
    "timestamp": 1720000000,
    "messages": [
        {
            "message": "Hello Blockchain"
        }
    ],
    "proof": 45381,
    "previousHash": "...",
    "hash": "..."
}
```

---

# Genesis Block

All nodes initialize with the same Genesis Block.

```json
{
    "index":0,
    "timestamp":1720000000,
    "messages":[],
    "proof":100,
    "previousHash":"0"
}
```

This ensures every node starts from an identical blockchain state.

---

# Proof of Work

Mining uses SHA-256 hashing.

Difficulty:

```
Hash must begin with

00
```

Algorithm

```
proof = 0

repeat

hash = SHA256(lastProof + proof)

until hash starts with "00"
```

---

# Consensus Mechanism

The blockchain uses the **Longest Valid Chain Rule**.

When a node receives a blockchain from another peer:

1. Verify Genesis Block
2. Verify Block Index
3. Verify Previous Hash
4. Verify Block Hash
5. Verify Proof of Work

If the received chain is valid and longer than the local chain, it replaces the local blockchain.

---

# REST API

## POST /message

Adds a new message to the pending transaction pool.

Example

```json
{
    "message":"Hello Blockchain"
}
```

---

## POST /mine

- Executes Proof of Work
- Creates a new block
- Clears pending messages
- Broadcasts updated chain to peers

---

## POST /sync

Receives a blockchain from another peer.

If the chain is valid and longer, it replaces the local chain.

---

## GET /chain

Returns the complete blockchain ledger.

---

# Message Flow

```
Client

↓

POST /message

↓

Pending Pool

↓

POST /mine

↓

Proof of Work

↓

New Block Created

↓

Broadcast Chain

↓

Node 2 Updated

↓

Node 3 Updated
```

---

# Improvements Implemented

The following improvements were added beyond the basic requirements:

- Stored SHA-256 hash inside each block
- Stronger chain validation
- Block index verification
- Immutable Genesis Block
- Automatic peer synchronization
- Axios timeout handling
- Safe JSON request validation
- Improved console logging
- Pending message cloning before mining

---

# Advantages

- No single point of failure
- Decentralized ledger
- Automatic synchronization
- Simple consensus mechanism
- Docker-based deployment
- Lightweight implementation
- Easy scalability

---

# Test Procedure

### Start Cluster

```bash
docker compose up --build -d
```

---

### Submit Message

```bash
curl -X POST http://localhost:3001/message \
-H "Content-Type: application/json" \
-d '{"message":"Assignment Verification Test"}'
```

---

### Mine Block

```bash
curl -X POST http://localhost:3001/mine
```

---

### Verify Synchronization

```bash
curl http://localhost:3003/chain
```

Expected Result

```
Message should appear in Node 3 blockchain.
```

---

# Automated Testing

The provided `test.sh` script automatically performs the following:

1. Starts all three Docker containers.
2. Sends a message to Node 1.
3. Mines a new block.
4. Verifies synchronization on Node 3.
5. Stops and removes all containers.

Successful output:

```
SUCCESS: Block successfully propagated from Node 1 to Node 3

All tests passed successfully.
```

---

# Results

The decentralized blockchain was successfully implemented and tested.

The system:

- Successfully accepts user messages.
- Mines blocks using SHA-256 Proof of Work.
- Maintains independent blockchain copies.
- Synchronizes mined blocks automatically.
- Achieves decentralized consensus using the longest valid chain.
- Passes the automated verification script without manual intervention.

---

# Conclusion

A lightweight decentralized blockchain for message logging was successfully designed and implemented using Node.js, Express, and Docker. The system demonstrates the core principles of blockchain technology, including distributed ledgers, Proof of Work, consensus, and peer-to-peer synchronization. The implementation satisfies all functional requirements while remaining simple, scalable, and suitable for educational purposes.

---

