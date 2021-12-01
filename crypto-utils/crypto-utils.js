const cryptoUtils = require("crypto");

const cryptoHash = (...inputs) => {
    const hash = cryptoUtils.createHash("sha256");
    hash.update(inputs.sort().join("_"));
    return hash.digest("hex");
};

module.exports = { cryptoHash };
