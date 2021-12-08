const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../utils");

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
}

module.exports = Wallet;
