const Blockchain = require("./blockchain");
const Block = require("./block");

describe("Blockchain", () => {
    const blockchain = new Blockchain();

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
});
