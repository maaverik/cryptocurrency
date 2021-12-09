const Transaction = require("./transaction");
const Wallet = require("../wallet");
const { verifySignature } = require("../utils");

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

    it("has an `outputMap`", () => {
        expect(transaction).toHaveProperty("outputMap");
    });

    it("has an `input`", () => {
        expect(transaction).toHaveProperty("input");
    });

    describe("outputMap", () => {
        it("outputs the amount to the recipient", () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it("outputs the remaining balance to the `senderWallet`", () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
                senderWallet.balance - amount
            );
        });
    });

    describe("input", () => {
        it("has a `timestamp`", () => {
            expect(transaction.input).toHaveProperty("timestamp");
        });

        it("sets the amount to the senderWallet's balance", () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it("sets the `address` to the senderWallet's publicKey for verification by other users", () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it("signs the input", () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature,
                })
            ).toBe(true);
        });
    });

    describe("validTransaction()", () => {
        let errorMock;
        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
        });

        describe("when the transaction is valid", () => {
            it("returns true", () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });

        describe("when the transaction is invalid", () => {
            describe("because the outputMap value is invalid", () => {
                it("returns false and logs an error", () => {
                    transaction.outputMap[senderWallet.publicKey] = 10000000;
                    expect(Transaction.validTransaction(transaction)).toBe(
                        false
                    );
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("because the input signature is invalid", () => {
                it("returns false and logs an error", () => {
                    transaction.input.signature = new Wallet().sign(
                        "fake data"
                    );
                    expect(Transaction.validTransaction(transaction)).toBe(
                        false
                    );
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });

    describe("update()", () => {
        let originalSignature, originalSenderOutput, newRecipient, newAmount;

        beforeEach(() => {
            originalSignature = transaction.input.signature;
            originalSenderOutput =
                transaction.outputMap[senderWallet.publicKey];
            newRecipient = "new address";
            newAmount = 20;

            transaction.update({
                senderWallet,
                recipient: newRecipient,
                amount: newAmount,
            });
        });

        it("outputs the right amount to the new recipient", () => {
            expect(transaction.outputMap[newRecipient]).toEqual(newAmount);
        });

        it("subtracts the amount from the original sender output amount", () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
                originalSenderOutput - newAmount
            );
        });

        it("maintains a total output that still matches the input amount", () => {
            const totalOutput = Object.values(transaction.outputMap).reduce(
                (total, amount) => total + amount
            );
            expect(totalOutput).toEqual(transaction.input.amount);
        });

        it("re-signs the transaction", () => {
            expect(transaction.input.signature).not.toEqual(originalSignature);
        });
    });
});
