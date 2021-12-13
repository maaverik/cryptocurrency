const Transaction = require("../transaction");

class TransactionPool {
    // collect transactions to be put on a new mined block
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    getExistingTransaction({ inputAddress }) {
        // this is to keep on updating a transaction created by a wallet instead of overwriting it
        const transactions = Object.values(this.transactionMap);
        return transactions.find(
            (transaction) => transaction.input.address === inputAddress
        );
    }

    validTransactions() {
        return Object.values(this.transactionMap).filter((transaction) =>
            Transaction.isValidTransaction(transaction)
        );
    }

    clear() {
        // this is what miners call after a block is mined
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }) {
        // clear transactions from pool that are already in a given blockchain, this is what peers call
        // skipping genesis block
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;
