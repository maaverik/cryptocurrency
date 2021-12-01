const Block = require("./block");
const { GENESIS_DATA } = require("../config");
const { cryptoHash } = require("../crypto-utils");

describe("Block", () => {
    const timestamp = "02/02/20";
    const hash = "hash";
    const data = ["data"];
    const lastHash = "lastHash";
    const nonce = 1;
    const difficulty = 5;

    const block = new Block({
        timestamp,
        hash,
        data,
        lastHash,
        nonce,
        difficulty,
    });

    it("has all required properties", () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
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

    describe("mineblock()", () => {
        const lastBlock = Block.genesis();
        const data = "new data";
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it("returns a Block instance", () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it("sets the `lastHash` property to the `hash` property of the lastBlock", () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it("sets the `hash` property equal to the SHA hash of other properties", () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    lastBlock.hash,
                    data,
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty
                )
            );
        });

        it("sets the correct data", () => {
            expect(minedBlock.data).toEqual(data);
        });

        it("sets a timestamp", () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it("sets a `hash` that matches the diffculty criteria", () => {
            // check proof of work
            const hashSubstring = minedBlock.hash.substring(
                0,
                minedBlock.difficulty
            );
            expect(hashSubstring).toEqual("0".repeat(minedBlock.difficulty));
        });
    });
});
