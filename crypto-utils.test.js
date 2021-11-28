const { cryptoHash } = require("./crypto-utils");

describe("cryptoHash()", () => {
    const sha = {
        input: "c96c6d5be8d08a12e7b5cdc1b207fa6b2430974c86803d8891675e76fd992c20",
    };

    it("generates a valid SHA-256 hashed output", () => {
        expect(cryptoHash("input")).toEqual(sha["input"]);
    });

    it("produces the same hash even when same arguments are in a different order", () => {
        expect(cryptoHash("a", "b", "c")).toEqual(cryptoHash("b", "c", "a"));
    });
});
