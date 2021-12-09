const cryptoUtils = require("crypto");

const cryptoHash = (...inputs) => {
    const hash = cryptoUtils.createHash("sha256");
    // stringify to get different hashes for same objects on modifying properties
    inputs = inputs.map((input) => JSON.stringify(input));
    hash.update(inputs.sort().join("_"));
    return hash.digest("hex");
};

module.exports = { cryptoHash };
