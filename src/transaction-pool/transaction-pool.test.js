const TransactionPool = require("./transaction-pool");
const Wallet = require("../wallet");
const Transaction = require("../transaction");

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
});
