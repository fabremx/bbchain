import HttpServer from "../commons/httpServer";
import NodeServer from "../node/nodeServer";
import Blockchain from "../commons/blockchain";
import { Transaction } from "../commons/transaction";
import Message from "../commons/message";
import { NEW_TRANSACTION_MESSAGE } from "../constants/messageTypes";

declare var process: {
  env: {
    HTTP_PORT: number;
  };
};

class NodeHttpServer extends HttpServer {
  constructor() {
    super(process.env.HTTP_PORT || 3001);
    this.setNodeRoutes();
  }

  setNodeRoutes(): void {
    this.server.get("/infos", (req, res) => {
      const nodeInfo = {
        clients: NodeServer.getClientNodesURL(),
        servers: NodeServer.getServerNodesRL(),
        blockchain: Blockchain.blockchain,
        pendingTransactions: Blockchain.pendingTransactions
      };

      res.status(200).send(JSON.stringify(nodeInfo));
    });

    this.server.get("/blockchain", (req, res) => {
      res.status(200).send(JSON.stringify(Blockchain.blockchain));
    });

    this.server.get("/wallet/:walletId", (req, res) => {
      const walletId = req.params.walletId;
      const amountWAllet = Blockchain.getBalanceOfAddress(walletId);

      res.status(200).send(JSON.stringify(amountWAllet));
    });

    this.server.post("/addTransaction", (req, res) => {
      const transaction = new Transaction(
        req.body.transaction.fromAddress,
        req.body.transaction.toAddress,
        req.body.transaction.amount
      );
      console.log(`Recieve new transaction`, transaction);

      const newTransactionMessage = new Message(
        NEW_TRANSACTION_MESSAGE,
        transaction
      );

      console.log(
        `Broadcast to other nodes the transaction...`,
        newTransactionMessage
      );
      NodeServer.handleMessageReceived(newTransactionMessage);
      NodeServer.broadcast(newTransactionMessage);
      res.send();
    });
  }
}

export default new NodeHttpServer().server;
