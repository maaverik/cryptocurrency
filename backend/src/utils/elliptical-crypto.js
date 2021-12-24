const EC = require("elliptic").ec;
const { cryptoHash } = require("./crypto-utils");

// secp256k1 is the implementation of elliptic curve algos that bitcoin uses
const ec = new EC("secp256k1");

const verifySignature = ({ publicKey, data, signature }) => {
    // verify signature to check if the underlying data is correct
    const key = ec.keyFromPublic(publicKey, "hex");
    return key.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature };
