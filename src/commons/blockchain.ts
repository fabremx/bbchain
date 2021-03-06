import { Transaction } from "./transaction";
import { Block } from "./block";
import { MY_WALLET_ADDRESS } from "../constants/shared";
import cloneDeep from "lodash.clonedeep";

export class Blockchain {
  public blockchain: Block[] = [];
  difficulty: number = 3;
  pendingTransactions: Transaction[] = [];
  miningReward: number = 100;

  constructor() {
    this.blockchain.push(this.getGenesisBlock());
  }

  getGenesisBlock(): Block {
    const timestamp = 0;
    const genesisData = [new Transaction("bbCoin", MY_WALLET_ADDRESS, 1000)];
    const previousHash = "0";

    return new Block(timestamp, genesisData, previousHash);
  }

  getLatestBlock(): Block {
    return this.blockchain[this.blockchain.length - 1];
  }

  addTransaction(transaction: Transaction): void {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }

    if (transaction.amount <= 0) {
      throw new Error("Transaction amount should be higher than 0");
    }

    if (
      this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount
    ) {
      throw new Error("Not enough balance");
    }

    console.log("\nAdd transaction in pending transaction...\n");
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(miningRewardAddress: string) {
    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);

    // Create temporary chain with new block and check if we remplace the current one by the new one
    const newBlockchain = cloneDeep(this.blockchain);
    newBlockchain.push(block);
    this.blockchain = this.replaceChain(newBlockchain);

    // Reset the pending transactions and send the mining reward
    // this.pendingTransactions = [
    //   new Transaction("bbCoin", miningRewardAddress, this.miningReward)
    // ];
    this.pendingTransactions = [];
  }

  isNewBlockValid(previousBlock: Block, newBlock: Block): Boolean {
    if (previousBlock.hash !== newBlock.previousHash) {
      console.error("Block Invalid: invalid previous hash");
      return false;
    } else if (newBlock.hash !== newBlock.calculateHash()) {
      console.error("Block Invalid: invalid hash");
      return false;
    }

    return true;
  }

  isBlockchainValid(blockchain: Block[]): Boolean {
    if (
      JSON.stringify(blockchain[0]) !== JSON.stringify(this.getGenesisBlock())
    ) {
      console.error("Blockchain Invalid: invalid genesis block");
      return false;
    }

    for (let index = 1; index < blockchain.length; index++) {
      if (
        index !== blockchain.length - 1 &&
        !this.isNewBlockValid(blockchain[index], blockchain[index + 1])
      ) {
        console.error("Blockchain Invalid: invalid block", blockchain[index]);
        return false;
      }
    }

    console.log("Blockchain valid");
    return true;
  }

  replaceChain(newBlockchain: Block[]): Block[] {
    if (
      this.isBlockchainValid(newBlockchain) &&
      newBlockchain.length > this.blockchain.length
    ) {
      console.log("Replace blockchain with the new one");
      return newBlockchain;
    }

    console.log("Keep actual blockchain");
    return this.blockchain;
  }

  getBalanceOfAddress(walletAddress: string): number {
    let balance = 0;

    for (const block of this.blockchain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === walletAddress) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === walletAddress) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  getAllTransactionsForWallet(walletAddress: string): Transaction[] {
    const transactions = [];

    for (const block of this.blockchain) {
      for (const transaction of block.transactions) {
        if (
          transaction.fromAddress === walletAddress ||
          transaction.toAddress === walletAddress
        ) {
          transactions.push(transaction);
        }
      }
    }

    return transactions;
  }
}

export default new Blockchain();
