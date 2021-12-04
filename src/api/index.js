const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("../blockchain");
const PubSub = require("../pubsub");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => {
    // wait for a second for client to connect to redis
    pubsub.broadcastChain();
}, 1000);

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain);
});

app.post("/api/block", (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect("/api/blocks");
});

const DEFAULT_PORT = 5000;
let PEER_PORT;

// eslint-disable-next-line no-undef
if (process.env.GENERATE_PEER_PORT === "true") {
    // this env variable is set in package.json dev peer script
    // this is to run multiple instances on same machine without PORT sharing issues
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`App listening on localhost:${PORT}`);
});
