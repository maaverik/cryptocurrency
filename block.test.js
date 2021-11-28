const Block = require("./block");
const { GENESIS_DATA } = require("./config");

describe("Block", () => {
    const timestamp = "02/02/20";
    const hash = "hash";
    const data = ["data"];
    const lastHash = "lastHash";

    const block = new Block({ timestamp, hash, data, lastHash });

    it("has the timestamp, data, hash, and lastHash properties", () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.lastHash).toEqual(lastHash);
    });

    describe("genesis()", () => {
        const genesisBlock = Block.genesis();

        it("returns a Block instance", () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it("returns the configured genesis data", () => {
            expect(genesisBlock).toEqual(GENESIS_DATA); // JS compares key-value pairs b/w object and instance
        });
    });
});
