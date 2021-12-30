const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./transaction-pool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transaction-miner");

const isDevelopment = process.env.ENV === "development";
const app = express();

app.use(bodyParser.json());
app.use(cors());
// serve frontend from express
app.use(express.static(path.join(__dirname, "../frontend/build")));

const DEFAULT_PORT = 5100;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const REDIS_URL = isDevelopment
    ? "redis://127.0.0.1:6379" // default local address
    : "redis://:pe48c48b4fa9b515aabff9fe1d4917ed945ac17bdcd0b553922ab7c48d29e9c3d@ec2-54-144-31-38.compute-1.amazonaws.com:29489"; // heroku redis add on

console.log(REDIS_URL);

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const wallet = new Wallet();
const transactionMiner = new TransactionMiner({
    blockchain,
    transactionPool,
    wallet,
    pubsub,
});

if (isDevelopment) {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();

    const generateWalletTransaction = ({ wallet, recipient, amount }) => {
        const transaction = wallet.createTransaction({
            recipient,
            amount,
            chain: blockchain.chain,
        });
        transactionPool.setTransaction(transaction);
    };

    const walletAction = () =>
        generateWalletTransaction({
            wallet,
            recipient: wallet1.publicKey,
            amount: 10,
        });

    const wallet1Action = () =>
        generateWalletTransaction({
            wallet: wallet1,
            recipient: wallet2.publicKey,
            amount: 15,
        });

    const wallet2Action = () =>
        generateWalletTransaction({
            wallet: wallet,
            recipient: wallet1.publicKey,
            amount: 20,
        });

    for (let i = 0; i < 10; i++) {
        if (i % 3 == 1) {
            walletAction();
            wallet1Action();
        } else if (i % 3 == 2) {
            walletAction();
            wallet2Action();
        } else {
            wallet1Action();
            wallet2Action();
        }

        transactionMiner.mineTransactions();
    }
}

// get current blocks in chain
app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain);
});

// mine a new block on chain with given data
app.post("/api/block", (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect("/api/blocks");
});

// make a transaction
app.post("/api/transaction", (req, res) => {
    const { amount, recipient } = req.body;
    let transaction = transactionPool.getExistingTransaction({
        inputAddress: wallet.publicKey,
    });
    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain,
            });
        }
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message });
    }

    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);

    res.json({ type: "success", transaction });
});

// get the transaction map of all pending transactions in the pool
app.get("/api/transaction-pool-map", (req, res) => {
    res.json(transactionPool.transactionMap);
});

// mine a block for pending transactions
app.get("/api/mine-transactions", (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect("/api/blocks");
});

// get wallet balance and public address
app.get("/api/wallet", (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address,
        }),
    });
});

// serve frontend HTML for each peer
app.get("*", (req, res) => {
    // eslint-disable-next-line no-undef
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// sync new peer with existing root peer to get longest valid chain
const syncChains = async () => {
    const response = await axios
        .get(`${ROOT_NODE_ADDRESS}/api/blocks`)
        .catch((err) => {
            console.error(`GET /blocks failed due to ${err}`);
            return;
        });
    if (response.status == 200) {
        const longestChain = response.data;

        console.log("Replacing chain on a sync with", longestChain);
        blockchain.replaceChain(longestChain);
    } else {
        console.error(`GET /blocks returned status ${response.status}`);
    }
};

const syncTransactions = async () => {
    const response = await axios
        .get(`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`)
        .catch((err) => {
            console.error(`GET /transaction-pool-map failed due to ${err}`);
            return;
        });
    if (response.status == 200) {
        const transactionPoolMap = response.data;

        console.log(
            "Replacing transaction pool map on a sync with",
            transactionPoolMap
        );
        transactionPool.setMap(transactionPoolMap);
    } else {
        console.error(
            `GET /transaction-pool-map returned status ${response.status}`
        );
    }
};

const syncWithRootState = async () => {
    syncChains();
    syncTransactions();
};

let PEER_PORT;

// eslint-disable-next-line no-undef
if (process.env.GENERATE_PEER_PORT === "true") {
    // this env variable is set in package.json dev peer script
    // this is to run multiple instances on same machine without PORT sharing issues
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`App listening on localhost:${PORT}`);
    if (PORT !== DEFAULT_PORT) {
        // don't run on root instance, since it tries to sync with itself
        syncWithRootState();
    }
});
