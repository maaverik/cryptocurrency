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
});
