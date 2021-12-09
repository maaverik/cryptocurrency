const { v4: uuidv4 } = require("uuid");
const { verifySignature } = require("../utils");

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuidv4();
        this.outputMap = this.createOutputMap({
            senderWallet,
            recipient,
            amount,
        });
        this.input = this.createInput({
            senderWallet,
            outputMap: this.outputMap,
        });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        // contains info about transaction amounts of sender and recipient
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        // sign outputMap contents with senderWallet
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap),
        };
    }

    static validTransaction(transaction) {
        const { input, outputMap } = transaction;
        const { address, amount, signature } = input;

        // sum of values in outputMap should equal input's amount
        const outputTotal = Object.values(outputMap).reduce(
            (accumulatedTotal, amount) => accumulatedTotal + amount
        );
        if (amount != outputTotal) {
            console.error(`Invalid transaction from address ${address}`);
            return false;
        }

        // validate signature
        if (
            !verifySignature({ publicKey: address, data: outputMap, signature })
        ) {
            console.error(`Invalid signature from address ${address}`);
            return false;
        }

        return true;
    }

    update({ senderWallet, recipient, amount }) {
        this.outputMap[recipient] = amount;
        this.outputMap[senderWallet.publicKey] -= amount;

        // re-sign the input
        this.input = this.createInput({
            senderWallet,
            outputMap: this.outputMap,
        });
    }
}

module.exports = Transaction;
