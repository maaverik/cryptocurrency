const Blockchain = require("./blockchain");
const Block = require("../block");

describe("Blockchain", () => {
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
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
        });
    });

    describe("replaceChain()", () => {
        let newBlockchain, oldChain, errorMock, logMock;

        beforeEach(() => {
            newBlockchain = new Blockchain();
            oldChain = blockchain.chain;

            // stub out console messages during tests
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
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
            beforeEach(() => {
                newBlockchain.addBlock({ data: "abc" });
                newBlockchain.addBlock({ data: "def" });
                newBlockchain.addBlock({ data: "ghi" });
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

                it("logs a successs message", () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});
