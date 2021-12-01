const Block = require("../block/block");
const { cryptoHash } = require("../crypto-utils");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data,
        });
        this.chain.push(newBlock);
    }

    static isValidChain(chain) {
        const genesis = JSON.stringify(Block.genesis());
        // not strict equality check, only check equality of property values
        if (JSON.stringify(chain[0]) !== genesis) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const realLastHash = chain[i - 1].hash;
            const { data, timestamp, hash, lastHash } = chain[i];
            if (lastHash !== realLastHash) {
                return false;
            }

            const validHash = cryptoHash(timestamp, data, lastHash);
            if (hash !== validHash) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;
