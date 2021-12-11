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
        const transactions = Object.values(this.transactionMap);
        return transactions.find(
            (transaction) => transaction.input.address === inputAddress
        );
    }
}

module.exports = TransactionPool;
