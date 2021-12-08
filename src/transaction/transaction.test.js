const Transaction = require("./transaction");
const Wallet = require("../wallet");

describe("transaction", () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = "dummy-recipient-public-key";
        amount = 50; // less than 1000 which is what recipient has by default, so valid
        transaction = new Transaction({ senderWallet, recipient, amount });
    });

    it("has an `id`", () => {
        expect(transaction).toHaveProperty("id");
    });

    describe("outputMap", () => {
        it("has an `outputMap`", () => {
            expect(transaction).toHaveProperty("outputMap");
        });

        it("outputs the amount to the recipient", () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it("outputs the remaining balance to the `senderWallet`", () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
                senderWallet.balance - amount
            );
        });
    });
});
