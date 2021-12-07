const { STARTING_BALANCE } = require("../config");
const { ec } = require("../utils");

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        const keyPair = ec.genKeyPair();
        // acts as address for transactions and to verify transactions
        this.publicKey = keyPair.getPublic().encode("hex");
    }
}

module.exports = Wallet;
