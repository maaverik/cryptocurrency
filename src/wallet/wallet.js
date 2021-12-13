const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../utils");
const Transaction = require("../transaction");

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();
        // acts as address for transactions and to verify transactions
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    sign(data) {
        // mark data with a wallet's unique signature
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey,
            });
        }

        if (amount > this.balance) {
            throw new Error("Amount exceeds balance");
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }) {
        let outputTotal = 0;
        let hasConductedTransaction = false;

        // skipping genesis block
        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i];
            for (let transaction of block.data) {
                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }
                const output = transaction.outputMap[address];
                if (output) {
                    outputTotal += output;
                }
            }

            if (hasConductedTransaction) {
                // transactions so far have been taken into account, so don't count again
                return outputTotal;
            }
        }
        return STARTING_BALANCE + outputTotal;
    }
}

module.exports = Wallet;
