import Blockchain from "./blockchain";
import sha256 from "crypto-js/sha256";
import { Block } from "./block";

const MOCKED_TIMESTAMP = 2020;
jest.spyOn(console, "error").mockImplementation();
jest.spyOn(console, "log").mockImplementation();
jest
  .spyOn(Date.prototype, "getTime")
  .mockImplementation(() => MOCKED_TIMESTAMP);

describe("Blockchain Class", () => {
  it("should initial the blockchain with the correct genesis block when blockchain is instenciate", () => {
    // Then
    const expectedResult = new Block(
      0,
      "0",
      1465154705,
      "Genesis block",
      sha256(0 + "0" + 1465154705 + "Genesis block").toString()
    );
    expect(Blockchain.blockchain).toEqual([expectedResult]);
  });

  describe("calculateHash", () => {
    it("should call sha256 method with all block param", () => {
      // Given
      const index = 1;
      const previousHash = "previousHash";
      const timestamp = 0;
      const data = "data";

      // When
      const result = Blockchain.calculateHash(
        index,
        previousHash,
        timestamp,
        data
      );

      // Then
      // TODO: expect sha256 method
      expect(typeof result).toBe("string");
    });
  });

  describe("getLatestBlock", () => {
    it("should return null when blockchain is empty", () => {
      // Given
      const genesisBlock = new Block(
        25,
        "0",
        0,
        "not genesis data",
        "not genesis hash"
      );

      const firstBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const firstBlock = new Block(2, "hash", 0, "data", firstBlockHash);

      Blockchain.blockchain = [genesisBlock, firstBlock];

      // When
      const block = Blockchain.getLatestBlock();

      // Then
      expect(block).toEqual(firstBlock);
    });
  });

  describe("generateNextBlock", () => {
    it("should generate the next with the info of the previous block", () => {
      // Given
      Blockchain.blockchain = [];
      const previousBlock = new Block(
        0,
        "0",
        0,
        "genesis data",
        sha256(0 + "0" + 0 + "genesis data").toString()
      );

      Blockchain.getLatestBlock = jest
        .fn()
        .mockImplementation(() => previousBlock);

      const newBlockData = "this is data of the new block";

      // When
      const newBlock = Blockchain.generateNextBlock(newBlockData);

      // Then
      const expectedBlockHash = sha256(
        1 + previousBlock.hash + MOCKED_TIMESTAMP + newBlockData
      ).toString();

      const expectedBlock = new Block(
        1,
        previousBlock.hash,
        MOCKED_TIMESTAMP,
        newBlockData,
        expectedBlockHash
      );

      expect(newBlock).toEqual(expectedBlock);
    });
  });

  describe("isNewBlockValid", () => {
    it("should return false when the previousHash does not match with the hash of the previous block", () => {
      // Given
      const previousBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const previousBlock = new Block(2, "hash", 0, "data", previousBlockHash);

      const newBlockHash = sha256(
        3 + "not matching hash" + 0 + "data"
      ).toString();
      const newBlock = new Block(
        3,
        "not matching hash",
        0,
        "data",
        newBlockHash
      );

      // When
      const isValid = Blockchain.isNewBlockValid(previousBlock, newBlock);

      // Then
      expect(isValid).toBe(false);
    });

    it("should return false when the index of the new Block is inferior or equal to the index of the previous block", () => {
      // Given
      const previousBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const previousBlock = new Block(2, "hash", 0, "data", previousBlockHash);

      const newBlockHash = sha256(
        1 + previousBlockHash + 0 + "data"
      ).toString();
      const newBlock = new Block(1, previousBlockHash, 0, "data", newBlockHash);

      // When
      const isValid = Blockchain.isNewBlockValid(previousBlock, newBlock);

      // Then
      expect(isValid).toBe(false);
    });

    it("should return false when the index of the new Block is not the next number after the previous block index", () => {
      // Given
      const previousBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const previousBlock = new Block(2, "hash", 0, "data", previousBlockHash);

      const newBlockHash = sha256(
        4 + previousBlockHash + 0 + "data"
      ).toString();
      const newBlock = new Block(4, previousBlockHash, 0, "data", newBlockHash);

      // When
      const isValid = Blockchain.isNewBlockValid(previousBlock, newBlock);

      // Then
      expect(isValid).toBe(false);
    });

    it("should return false when the hash of the new block not match with the hash verification", () => {
      // Given
      const previousBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const previousBlock = new Block(2, "hash", 0, "data", previousBlockHash);

      const newBlockHash = "wrong hash";
      const newBlock = new Block(3, previousBlockHash, 0, "data", newBlockHash);

      // When
      const isValid = Blockchain.isNewBlockValid(previousBlock, newBlock);

      // Then
      expect(isValid).toBe(false);
    });

    it("should return true when new block match the three rules", () => {
      // Given
      const previousBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const previousBlock = new Block(2, "hash", 0, "data", previousBlockHash);

      const newBlockHash = sha256(
        3 + previousBlockHash + 0 + "data"
      ).toString();
      const newBlock = new Block(3, previousBlockHash, 0, "data", newBlockHash);

      // When
      const isValid = Blockchain.isNewBlockValid(previousBlock, newBlock);

      // Then
      expect(isValid).toBe(true);
    });
  });

  describe("isBlockchainValid", () => {
    it("should return false when first block does not match with the genesis block", () => {
      // Given
      const genesisBlock = new Block(
        25,
        "0",
        0,
        "not genesis data",
        "not genesis hash"
      );

      const firstBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const firstBlock = new Block(2, "hash", 0, "data", firstBlockHash);

      const secondBlockHash = sha256(
        3 + firstBlockHash + 0 + "data"
      ).toString();
      const secondBlock = new Block(
        3,
        firstBlockHash,
        0,
        "data",
        secondBlockHash
      );

      const blockchain = [genesisBlock, firstBlock, secondBlock];

      // When
      const isValid = Blockchain.isBlockchainValid(blockchain);

      // Then
      expect(isValid).toBe(false);
    });

    it("should return false when one of blockchain block is invalid", () => {
      // Given
      const genesisBlock = Blockchain.getGenesisBlock();

      const firstBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const firstBlock = new Block(2, "hash", 0, "data", firstBlockHash);

      const invalidSecondBlock = new Block(3, "hash", 0, "data", "hash");

      const blockchain = [genesisBlock, firstBlock, invalidSecondBlock];

      // When
      const isValid = Blockchain.isBlockchainValid(blockchain);

      // Then
      expect(isValid).toBe(false);
    });

    it("should return true when all blacks are valid", () => {
      // Given
      const genesisBlock = Blockchain.getGenesisBlock();

      const firstBlockHash = sha256(1 + "hash" + 0 + "data").toString();
      const firstBlock = new Block(1, "hash", 0, "data", firstBlockHash);

      const secondBlockHash = sha256(
        2 + firstBlockHash + 0 + "data"
      ).toString();
      const secondBlock = new Block(
        2,
        firstBlockHash,
        0,
        "data",
        secondBlockHash
      );

      const thridBlockHash = sha256(
        3 + secondBlockHash + 0 + "data"
      ).toString();
      const thridBlock = new Block(
        3,
        secondBlockHash,
        0,
        "data",
        thridBlockHash
      );

      const blockchain = [genesisBlock, firstBlock, secondBlock, thridBlock];

      // When
      const isValid = Blockchain.isBlockchainValid(blockchain);

      // Then
      expect(isValid).toBe(true);
    });
  });

  describe("Replace chain", () => {
    const genesisBlock = Blockchain.getGenesisBlock();

    const firstBlockHash = sha256(
      1 + genesisBlock.hash + 0 + "data"
    ).toString();
    const firstBlock = new Block(
      1,
      genesisBlock.hash,
      0,
      "data",
      firstBlockHash
    );

    it("should return the current chain when the new chain is valid BUT have an inferior length to the current one", () => {
      // Given
      Blockchain.blockchain = [genesisBlock, firstBlock];
      const newBlockchain = [genesisBlock];

      // When
      const blockchain = Blockchain.replaceChain(newBlockchain);

      // Then
      expect(blockchain).toEqual(Blockchain.blockchain);
    });

    it("should return the current chain when the new chain has length superior to the current chain BUT is not valid", () => {
      // Given
      const invalidSecondBlockHash = sha256(2 + "hash" + 0 + "data").toString();
      const invalidSecondBlock = new Block(
        2,
        "hash",
        0,
        "data",
        invalidSecondBlockHash
      );
      Blockchain.blockchain = [genesisBlock, firstBlock];
      const newBlockchain = [...Blockchain.blockchain, invalidSecondBlock];

      // When
      const blockchain = Blockchain.replaceChain(newBlockchain);

      // Then
      expect(blockchain).toEqual(Blockchain.blockchain);
    });

    it("should return the new chain when its valid and have length suprerior to the current one", () => {
      // Given
      const secondBlockHash = sha256(
        2 + firstBlockHash + 0 + "data"
      ).toString();
      const secondBlock = new Block(
        2,
        firstBlockHash,
        0,
        "data",
        secondBlockHash
      );
      Blockchain.blockchain = [genesisBlock, firstBlock];
      const newBlockchain = [...Blockchain.blockchain, secondBlock];

      // When
      const blockchain = Blockchain.replaceChain(newBlockchain);

      // Then
      expect(blockchain).toEqual(newBlockchain);
    });
  });
});
