const redis = require("redis");

const CHANNELS = {
    TEST: "TEST",
    BLOCKCHAIN: "BLOCKCHAIN"
};

class PubSub {
    // every instance can act as both publisher and subscriber
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
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

        if (channel === CHANNELS.BLOCKCHAIN) {
            const newChain = JSON.parse(message);
            this.blockchain.replaceChain(newChain);
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
            message: JSON.stringify(this.blockchain.chain)
        });
    }
}

module.exports = PubSub;
