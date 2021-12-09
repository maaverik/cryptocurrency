const { cryptoHash } = require("./crypto-utils");

describe("cryptoHash()", () => {
    const sha = {
        input: "48aed2374cea5f3bbbee1c8742439be758dcc1e999e0e3f0e03c1ee80e3565a0",
    };

    it("generates a valid SHA-256 hashed output", () => {
        expect(cryptoHash("input")).toEqual(sha["input"]);
    });

    it("produces the same hash even when same arguments are in a different order", () => {
        expect(cryptoHash("a", "b", "c")).toEqual(cryptoHash("b", "c", "a"));
    });

    it("produces a unique hash when proprties have changes on an input object", () => {
        const dummy = {};
        const originalHash = cryptoHash(dummy);
        dummy["a"] = 5;
        expect(cryptoHash(dummy)).not.toEqual(originalHash);
    });
});
