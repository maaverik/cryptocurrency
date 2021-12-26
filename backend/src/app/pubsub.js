const redis = require("redis");

const CHANNELS = {
    TEST: "TEST",
    BLOCKCHAIN: "BLOCKCHAIN",
    TRANSACTION: "TRANSACTION",
};

class PubSub {
    // every instance can act as both publisher and subscriber
    constructor({ blockchain, transactionPool, redisUrl }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient(redisUrl);
        this.subscriber = this.publisher.duplicate();

        this.init_subscriptions();
    }

    init_subscriptions() {
        for (let ch of Object.values(CHANNELS)) {
            this.subscriber.subscribe(ch);
        }

        this.subscriber.on("message", (channel, message) =>
            this.handleMessage(channel, message)
        );
    }

    handleMessage(channel, message) {
        console.log(`Received ${message} on channel ${channel}`);

        const parsedMessage = JSON.parse(message);
        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                // clean up any mined transactions from local pool instance while replacing chain
                this.blockchain.replaceChain(parsedMessage, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage,
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    publish({ channel, message }) {
        // while publishing, we don't want to receive the message on the same instance,
        // so unsubscribe first, then publish, the nsubscribe again
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastChain() {
        // triggers replace chain in other instances of the blockchain
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain),
        });
    }

    broadcastTransaction(transaction) {
        // triggers replace chain in other instances of the blockchain
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction),
        });
    }
}

module.exports = PubSub;
