const TransactionPool = require("./transaction-pool");
const Wallet = require("../wallet");
const Transaction = require("../transaction");
const Blockchain = require("../blockchain");

describe("TransactionPool", () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            amount: 50,
            recipient: "dummy",
        });
    });

    describe("setTransaction()", () => {
        it("adds a transaction", () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(
                transaction
            );
        });
    });

    describe("setMap()", () => {
        it("sets the transaction pool", () => {
            const newTransactionPool = new TransactionPool();
            const newTransaction = new Transaction({
                senderWallet,
                amount: 50,
                recipient: "dummy",
            });
            newTransactionPool.setTransaction(newTransaction);

            transactionPool.setMap(newTransactionPool.transactionMap);
            expect(transactionPool.transactionMap).toBe(
                newTransactionPool.transactionMap
            );
        });
    });

    describe("getExistingTransaction()", () => {
        it("returns an existing transaction given an input address", () => {
            transactionPool.setTransaction(transaction);
            expect(
                transactionPool.getExistingTransaction({
                    inputAddress: senderWallet.publicKey,
                })
            ).toBe(transaction);
        });
    });

    describe("validTransactions()", () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;

            validTransactions = [];
            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: "dummy",
                    amount: 10,
                });

                if (i % 3 === 0) {
                    // mess up amount
                    transaction.input.amount = 99999;
                } else if (i % 3 === 1) {
                    // mess up signature
                    transaction.input.signature = new Wallet().sign("fake");
                } else {
                    validTransactions.push(transaction);
                }
                transactionPool.setTransaction(transaction);
            }
        });

        it("returns valid transactions", () => {
            expect(transactionPool.validTransactions()).toEqual(
                validTransactions
            );
        });

        it("logs errors for invalid transactions", () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe("clear()", () => {
        it("clears all transactions in the pool", () => {
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe("clearBlockchainTransactions()", () => {
        it("clears existing transactions in the pool that are in the blockchain", () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: "fake",
                    amount: 10,
                });
                transactionPool.setTransaction(transaction);

                if (i % 2 === 0) {
                    blockchain.addBlock({ data: [transaction] });
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }

                transactionPool.clearBlockchainTransactions({
                    chain: blockchain.chain,
                });
                expect(transactionPool.transactionMap).toEqual(
                    expectedTransactionMap
                );
            }
        });
    });
});
