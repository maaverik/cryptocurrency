const MINE_RATE = 1000; // optimal time taken to mine new block, in milliseconds

const INITIAL_DIFFICULTY = 3;

// this is the first block in the chain with random hardcoded values
const GENESIS_DATA = {
    timestamp: 50000,
    hash: "000fff",
    data: [],
    lastHash: "ff0ff",
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
};

module.exports = { GENESIS_DATA, MINE_RATE };
