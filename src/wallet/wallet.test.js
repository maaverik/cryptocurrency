const Wallet = require("./wallet");
const { verifySignature } = require("../utils");
const Transaction = require("../transaction");
const Blockchain = require("../blockchain");
const { STARTING_BALANCE } = require("../config");

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

    describe("signing data", () => {
        const data = "dummy";

        it("verifies a signature", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data),
                })
            ).toBe(true);
        });

        it("doesn't verify invalid signature", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data),
                })
            ).toBe(false);
        });
    });

    describe("createTransaction()", () => {
        describe("and the amount exceeds the balance", () => {
            it("throws an error", () => {
                expect(() =>
                    wallet.createTransaction({
                        amount: 999999,
                        recipient: "fake address",
                    })
                ).toThrow("Amount exceeds balance");
            });
        });

        describe("and the amount is valid", () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 10;
                recipient = "address1";
                transaction = wallet.createTransaction({ amount, recipient });
            });

            it("creates an instance of `Transaction`", () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it("transaction input matches the wallet", () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it("outputs the right amount to the recipient", () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        describe("and a chain is passed", () => {
            it("called `calculateBalance()`", () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: "fake",
                    amount: 10,
                    chain: new Blockchain().chain,
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                // restore stubbed function for subsequent tests
                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe("calculateBalance()", () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe("there are no outputs for the wallet", () => {
            it("returns the starting balance", () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey,
                    })
                ).toEqual(STARTING_BALANCE);
            });
        });

        describe("there are outputs for the wallet", () => {
            let transaction1, transaction2;

            beforeEach(() => {
                transaction1 = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50,
                });

                transaction2 = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 70,
                });

                blockchain.addBlock({ data: [transaction1, transaction2] });
            });

            it("adds the sum of all outputs to the wallet balance", () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey,
                    })
                ).toEqual(
                    STARTING_BALANCE +
                        transaction1.outputMap[wallet.publicKey] +
                        transaction2.outputMap[wallet.publicKey]
                );
            });

            describe("and the wallet has made a transaction", () => {
                let transaction;

                beforeEach(() => {
                    transaction = wallet.createTransaction({
                        amount: 40,
                        recipient: "fake",
                    });
                    blockchain.addBlock({ data: [transaction] });
                });

                it("returns the output amount of the recent transaction", () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey,
                        })
                    ).toEqual(transaction.outputMap[wallet.publicKey]);
                });

                describe("and there are more outputs", () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        transaction = wallet.createTransaction({
                            amount: 50,
                            recipient: "fake-again",
                        });
                        sameBlockTransaction = Transaction.rewardTransaction({
                            minerWallet: wallet,
                        });
                        blockchain.addBlock({
                            data: [transaction, sameBlockTransaction],
                        });

                        // current wallet is the recipient
                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 30,
                        });
                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    it("including output amounts from sending money, receiving a mining reward and receiving money in balance", () => {
                        expect(
                            Wallet.calculateBalance({
                                address: wallet.publicKey,
                                chain: blockchain.chain,
                            })
                        ).toEqual(
                            transaction.outputMap[wallet.publicKey] +
                                sameBlockTransaction.outputMap[
                                    wallet.publicKey
                                ] +
                                nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    });
                });
            });
        });
    });
});
