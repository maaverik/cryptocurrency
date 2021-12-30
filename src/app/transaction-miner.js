const Transaction = require("../transaction");

class TransactionMiner {
    constructor({ blockchain, wallet, transactionPool, pubsub }) {
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.transactionPool = transactionPool;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // get valid transactions from the pool
        const validTransactions = this.transactionPool.validTransactions();

        // generate miner's reward
        // this also makes data to be mined unique for all miners so that getting right nonce for POW becomes truly randomized
        const reward = Transaction.rewardTransaction({
            minerWallet: this.wallet,
        });
        validTransactions.push(reward);

        // add a block consisting of these transactions to the blockchain
        this.blockchain.addBlock({ data: validTransactions });

        // broadcast the updated blockchain
        this.pubsub.broadcastChain();

        //clear the pool
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;
