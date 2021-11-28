const { GENESIS_DATA } = require("./config");

class Block {
    constructor({ timestamp, lastHash, hash, data }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    // factory
    static genesis() {
        // first block of a new blockchain
        return new this(GENESIS_DATA);
    }
}

module.exports = Block;
