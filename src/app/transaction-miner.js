class TransactionMiner {
    constructor({ blockchain, wallet, transactionPool, pubsub }) {
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.transactionPool = transactionPool;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // get valid transactions from the pool
        // generate miner's reward
        // add a block consisting of these transactions to the blockchain
        // broadcast the updated blockchain
        //clear the pool
    }
}

module.exports = TransactionMiner;
