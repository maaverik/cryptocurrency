const Block = require("../block/block");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../transaction");
const { cryptoHash } = require("../utils");
const Wallet = require("../wallet");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        // mine a new block and add to the current chain
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data,
        });
        this.chain.push(newBlock);
    }

    static isValidChain(chain) {
        // check if given chain satisfies lastHash reference equality
        const genesis = JSON.stringify(Block.genesis());
        // not strict equality check, only check equality of property values
        if (JSON.stringify(chain[0]) !== genesis) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const realLastHash = chain[i - 1].hash;
            const lastDifficulty = chain[i - 1].difficulty;
            const { data, timestamp, hash, lastHash, nonce, difficulty } =
                chain[i];
            if (lastHash !== realLastHash) {
                return false;
            }

            if (Math.abs(lastDifficulty - difficulty) > 1) {
                // difficulty jumps
                return false;
            }

            const validHash = cryptoHash(
                timestamp,
                data,
                lastHash,
                nonce,
                difficulty
            );
            if (hash !== validHash) {
                return false;
            }
        }

        return true;
    }

    replaceChain(newChain, onSuccess) {
        // replace existing chain with new one if new one is longer and valid
        if (newChain.length <= this.chain.length) {
            console.error("The new chain is not longer than the exisitng one");
            return;
        }

        if (!Blockchain.isValidChain(newChain)) {
            console.error("The new chain is invalid");
            return;
        }

        if (onSuccess) {
            onSuccess();
        }

        console.log("Replacing chain with", newChain);
        this.chain = newChain;
    }

    isValidTransactionData({ chain }) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            let rewardTransactionCount = 0;
            const transactionsSeen = new Set();

            for (let transaction of block.data) {
                if (transactionsSeen.has(transaction)) {
                    console.error("Duplicate transactions found in a block");
                    return false;
                } else {
                    transactionsSeen.add(transaction);
                }

                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount++;

                    if (rewardTransactionCount > 1) {
                        console.error("Too many rewards present in block");
                        return false;
                    }

                    // get the reward amount value which is the only value in the reward's output map
                    if (
                        Object.values(transaction.outputMap)[0] !==
                        MINING_REWARD
                    ) {
                        console.error("Miner reward is invalid");
                        return false;
                    }
                } else {
                    if (!Transaction.isValidTransaction(transaction)) {
                        console.error("Found an invalid transaction");
                        return false;
                    }

                    // use the local chain to calculate balance based on historical transactions
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address,
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error("Invalid input amount");
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

module.exports = Blockchain;
