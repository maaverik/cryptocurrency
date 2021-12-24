// Generic blockchain stuff ->

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

// Cryptocurrency specific stuff

// giving some balance to everyone to start the economy
const STARTING_BALANCE = 1000;

// reward for miners should not be from any particular wallet, so adding a specific address to differentiate it
const REWARD_INPUT = {
    address: "***authorised-rewarder***",
};

// miners get this amount as reward
const MINING_REWARD = 50;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD,
};
