const Blockchain = require("./blockchain");
const Block = require("../block");
const { cryptoHash } = require("../utils");
const Wallet = require("../wallet");
const Transaction = require("../transaction");
const { STARTING_BALANCE } = require("../config");

describe("Blockchain", () => {
    let blockchain, newBlockchain, errorMock;

    beforeEach(() => {
        newBlockchain = new Blockchain();
        blockchain = new Blockchain();

        errorMock = jest.fn();
        global.console.error = errorMock;
    });

    it("contains a `chain` property that's an array", () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it("starts with the genesis block", () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it("adds a new block to the chain with right data", () => {
        const data = "dummy data";
        blockchain.addBlock({ data });
        const lastIndex = blockchain.chain.length - 1;
        expect(blockchain.chain[lastIndex].data).toEqual(data);
    });

    describe("isValidChain()", () => {
        describe("when the chain doesn't start with the genesis block", () => {
            it("returns false", () => {
                blockchain.chain[0] = { data: "fake" };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe("when the chain has multiple blocks and starts with the genesis block", () => {
            beforeEach(() => {
                blockchain.addBlock({ data: "abc" });
                blockchain.addBlock({ data: "def" });
                blockchain.addBlock({ data: "ghi" });
            });

            describe("and a lastHash value is incorrect", () => {
                it("returns false", () => {
                    blockchain.chain[2].lastHash = "fake";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        false
                    );
                });
            });

            describe("the chain has a block with an invalid field", () => {
                it("returns false", () => {
                    blockchain.chain[2].data = "fake";
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        false
                    );
                });
            });

            describe("and all blocks are valid", () => {
                it("returns true", () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        true
                    );
                });
            });

            describe("when the chain has a block with a jumped difficulty", () => {
                it("returns false", () => {
                    const lastIndex = blockchain.chain.length - 1;
                    const lastBlock = blockchain.chain[lastIndex];
                    const data = "fake";
                    const timestamp = Date.now();
                    const nonce = 0;
                    const lastHash = lastBlock.hash;
                    const difficulty = lastBlock.difficulty - 5; // jumped difficulty
                    const hash = cryptoHash(
                        timestamp,
                        data,
                        lastHash,
                        difficulty,
                        nonce
                    );

                    const invalidBlock = new Block({
                        timestamp,
                        data,
                        lastHash,
                        hash,
                        difficulty,
                        nonce,
                    });
                    blockchain.chain.push(invalidBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        false
                    );
                });
            });
        });
    });

    describe("replaceChain()", () => {
        let oldChain, logMock;

        beforeEach(() => {
            oldChain = blockchain.chain;

            // stub out console messages during tests
            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe("when the new chain is not longer", () => {
            beforeEach(() => {
                newBlockchain.chain[0] = { data: "new chain" };
                blockchain.replaceChain(newBlockchain.chain);
            });

            it("does not replace the old chain", () => {
                // modify new chain since right now, old and new chains match
                expect(blockchain.chain).toEqual(oldChain);
            });

            it("logs an error", () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("when the new chain is longer", () => {
            let wallet, rewardTransaction;
            beforeEach(() => {
                wallet = new Wallet();
                rewardTransaction = Transaction.rewardTransaction({
                    minerWallet: wallet,
                });

                const goodOutputMap = {
                    [wallet.publicKey]: STARTING_BALANCE - 10,
                    fooRecipient: 10,
                };

                const goodTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(goodOutputMap),
                    },
                    outputMap: goodOutputMap,
                };

                newBlockchain.addBlock({
                    data: [goodTransaction, rewardTransaction],
                });

                const goodOutputMap2 = {
                    [wallet.publicKey]: STARTING_BALANCE - 10,
                    fooRecipient: 10,
                };
                const goodTransaction2 = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(goodOutputMap2),
                    },
                    outputMap: goodOutputMap2,
                };
                newBlockchain.addBlock({
                    data: [goodTransaction2, rewardTransaction],
                });
            });

            describe("when the new chain is invalid", () => {
                beforeEach(() => {
                    newBlockchain.chain[2].hash = "fake hash";
                    blockchain.replaceChain(newBlockchain.chain);
                });

                it("does not replace the old chain", () => {
                    expect(blockchain.chain).toEqual(oldChain);
                });

                it("logs an error", () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("when the new chain is valid", () => {
                beforeEach(() => {
                    blockchain.replaceChain(newBlockchain.chain);
                });

                it("does replace the old chain", () => {
                    expect(blockchain.chain).toEqual(newBlockchain.chain);
                });

                it("logs a success message", () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });

    describe("isValidTransactionData()", () => {
        let wallet, transaction, rewardTransaction;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({
                recipient: "fake",
                amount: 50,
            });
            rewardTransaction = Transaction.rewardTransaction({
                minerWallet: wallet,
            });
        });

        describe("and the transaction data is valid", () => {
            it("returns true", () => {
                // using a new chain to test against since the current chain's history is used to validate the new one
                newBlockchain.addBlock({
                    data: [transaction, rewardTransaction],
                });
                expect(
                    blockchain.isValidTransactionData({
                        chain: newBlockchain.chain,
                    })
                ).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe("and the transaction data has multiple rewards", () => {
            it("returns false and logs an error", () => {
                newBlockchain.addBlock({
                    data: [transaction, rewardTransaction, rewardTransaction],
                });
                expect(
                    blockchain.isValidTransactionData({
                        chain: newBlockchain.chain,
                    })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and the transaction data has at least one malformed output map", () => {
            describe("and the transaction is not a reward transaction", () => {
                it("returns false and logs an error", () => {
                    transaction.outputMap[wallet.publicKey] = 100000;
                    newBlockchain.addBlock({
                        data: [transaction, rewardTransaction],
                    });
                    expect(
                        blockchain.isValidTransactionData({
                            chain: newBlockchain.chain,
                        })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("and the transaction is a reward transaction", () => {
                it("returns false and logs an error", () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 100000;
                    newBlockchain.addBlock({
                        data: [transaction, rewardTransaction],
                    });
                    expect(
                        blockchain.isValidTransactionData({
                            chain: newBlockchain.chain,
                        })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe("and the transaction data has at least one malformed input", () => {
            it("returns false and logs an error", () => {
                // this represents a transaction created by an attacker
                wallet.balance = 10000;
                const invalidOutputMap = {
                    [wallet.publicKey]: 9000,
                    fakeRecipient: 1000,
                };
                const invalidTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(invalidOutputMap),
                    },
                    outputMap: invalidOutputMap,
                };
                newBlockchain.addBlock({
                    data: [invalidTransaction, rewardTransaction],
                });
                expect(
                    blockchain.isValidTransactionData({
                        chain: newBlockchain.chain,
                    })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and the transaction data has been included multiple times in a block", () => {
            it("returns false and logs an error", () => {
                newBlockchain.addBlock({
                    data: [
                        transaction,
                        transaction,
                        transaction,
                        rewardTransaction,
                    ],
                });
                expect(
                    blockchain.isValidTransactionData({
                        chain: newBlockchain.chain,
                    })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});
