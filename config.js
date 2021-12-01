const INITIAL_DIFFICULTY = 3;

// this is the first block in the chain with random hardcoded values
const GENESIS_DATA = {
    timestamp: "01/01/70",
    hash: "hash",
    data: [],
    lastHash: "___",
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
};

module.exports = { GENESIS_DATA };
