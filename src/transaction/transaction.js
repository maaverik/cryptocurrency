const { v4: uuidv4 } = require("uuid");

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuidv4();
        this.outputMap = this.createOutputMap({
            senderWallet,
            recipient,
            amount,
        });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        // contains info about transaction amounts of sender and recipient
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }
}

module.exports = Transaction;
