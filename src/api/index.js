const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const Blockchain = require("../blockchain");
const PubSub = require("../pubsub");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 5000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

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
    if (PORT !== DEFAULT_PORT) {
        // don't run on root instance, since it tries to sync with itself
        syncChains();
    }
});
