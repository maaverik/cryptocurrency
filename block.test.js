const Block = require("./block");

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
});
