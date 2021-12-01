const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../crypto-utils");

class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    // factory
    static genesis() {
        // first block of a new blockchain
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        // return a new block based on a previous one
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0,
            timestamp;

        let hash = "1".repeat(difficulty); // dummy value
        while (hash.substring(0, difficulty) != "0".repeat(difficulty)) {
            nonce++;
            timestamp = Date.now();
            difficulty = this.adjustDifficulty({
                block: lastBlock,
                newBlockTimestamp: timestamp,
            });
            hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
        }

        return new this({
            timestamp,
            lastHash,
            data,
            hash,
            difficulty,
            nonce,
        });
    }

    static adjustDifficulty({ block, newBlockTimestamp }) {
        // return new difficulty for the new block based on time taken to mine it
        const { difficulty } = block;
        if (difficulty <= 1) {
            return 1;
        }
        if (newBlockTimestamp - block.timestamp > MINE_RATE) {
            return difficulty - 1;
        }
        return difficulty + 1;
    }
}

module.exports = Block;
