const EC = require("elliptic").ec;

// secp256k1 is the implementation of elliptic curve algos that bitcoin uses
const ec = new EC("secp256k1");

module.exports = { ec };
