class Block {
    constructor({ timestamp, lastHash, hash, data }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }
}

const block = new Block({
    timestamp: "02/02/20",
    hash: "hash",
    data: "data",
    lastHash: "lastHash",
});
console.log(block);

module.exports = Block;
