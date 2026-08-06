const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const NODE_NAME = process.env.NODE_NAME || "node";
const PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

class Blockchain {

    constructor() {
        this.chain = [];
        this.pendingMessages = [];
        this.difficulty = "00";
        this.createGenesisBlock();
    }

    createGenesisBlock() {

        const genesis = Object.freeze({
            index: 0,
            timestamp: 1720000000,
            messages: [],
            proof: 100,
            previousHash: "0"
        });

        this.chain.push(genesis);

    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    hash(block) {

        const data = {

            index: block.index,
            timestamp: block.timestamp,
            messages: block.messages,
            proof: block.proof,
            previousHash: block.previousHash

        };

        return crypto
            .createHash("sha256")
            .update(JSON.stringify(data))
            .digest("hex");

    }

    proofOfWork(lastProof) {
        let proof = 0;

        while (true) {
            const hash = crypto
                .createHash("sha256")
                .update(lastProof.toString() + proof.toString())
                .digest("hex");

            if (hash.startsWith(this.difficulty))
                return proof;

            proof++;
        }
    }

    addMessage(message) {
        this.pendingMessages.push({
            message
        });
    }

    mineBlock() {

        if (this.pendingMessages.length === 0)
            return null;

        const lastBlock = this.getLastBlock();

        const proof = this.proofOfWork(lastBlock.proof);

        const newBlock = {
            index: this.chain.length,
            timestamp: Date.now(),
            messages: [...this.pendingMessages],
            proof: proof,
            previousHash: this.hash(lastBlock)
        };

        newBlock.hash = this.hash(newBlock);

        this.pendingMessages = [];

        this.chain.push(newBlock);
        console.log(
            `[${NODE_NAME}] Block #${newBlock.index} mined`
        );

        return newBlock;
    }

    isValidChain(chain) {

        if (JSON.stringify(chain[0]) !== JSON.stringify(this.chain[0]))
            return false;

        for (let i = 1; i < chain.length; i++) {

            const current = chain[i];
            const previous = chain[i - 1];

            // Check block numbering
            if (current.index !== previous.index + 1)
                return false;

            // Check previous hash linkage
            if (current.previousHash !== this.hash(previous))
                return false;

            // Verify stored block hash
            if (current.hash !== this.hash(current))
                return false;

            // Verify proof of work
            const hash = crypto
                .createHash("sha256")
                .update(previous.proof.toString() + current.proof.toString())
                .digest("hex");

            if (!hash.startsWith(this.difficulty))
                return false;
        }

        return true;
    }

}

const blockchain = new Blockchain();

async function broadcastChain() {

    for (const peer of PEERS) {

        try {

        await axios.post(
            `${peer}/sync`,
            {
                chain: blockchain.chain
            },
            {
                timeout: 3000
            }
        );

            console.log(`[${NODE_NAME}] Chain synchronized with ${peer}`);

        } catch (err) {

         console.log(`[${NODE_NAME}] Could not reach ${peer}`);

        }

    }

}

app.post("/message", (req, res) => {

  const message = req.body?.message; 

    if (!message) {
        return res.status(400).json({
            error: "Message required"
        });
    }

    blockchain.addMessage(message);

    res.json({
        status: "Message added",
        pending: blockchain.pendingMessages.length
    });

});

app.post("/mine", async (req, res) => {

    const block = blockchain.mineBlock();

    if (!block) {

        return res.status(400).json({
            error: "No pending messages"
        });

    }

    // Immediately synchronize all peers
    await broadcastChain();

    res.json({
        status: "Block mined",
        block
    });

});

app.get("/chain", (req, res) => {

    res.json(blockchain.chain);

});

app.post("/sync", (req, res) => {

    const incomingChain = req.body.chain;

    if (!incomingChain) {

        return res.status(400).json({
            error: "Chain missing"
        });

    }

    if (incomingChain.length === blockchain.chain.length) {

        return res.json({
            status: "Already Up To Date"
        });

    }

    if (
        incomingChain.length > blockchain.chain.length &&
        blockchain.isValidChain(incomingChain)
    ) {

        blockchain.chain = incomingChain;

        return res.json({
            status: "Chain Updated"
        });

    }

    res.json({
        status: "Ignored"
    });

});

app.get("/", (req, res) => {

    res.json({
        node: NODE_NAME,
        peers: PEERS,
        blocks: blockchain.chain.length,
        pending: blockchain.pendingMessages.length
    });

});

app.listen(PORT, () => {

    console.log(`${NODE_NAME} running on port ${PORT}`);

});