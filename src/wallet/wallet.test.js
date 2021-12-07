const Wallet = require("./wallet");

describe("Wallet", () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it("has a `balance`", () => {
        expect(wallet).toHaveProperty("balance");
    });

    it("has a `publicKey`", () => {
        expect(wallet).toHaveProperty("publicKey");
    });

    it("has a balance", () => {});
});
