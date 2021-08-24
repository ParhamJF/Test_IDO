const Web3 = require("web3");
const config = require("../../config/config.js");

const web3 = new Web3(config.web3Rpc);

async function getTransactionByHash(transactionHash){
    console.log("**** GET hash of transaction ****");
    if (web3.eth.net.isListening())
  {
        var transactionHashed = await web3.eth.getTransaction(
            transactionHash
        );
        return (transactionHashed)
       
    }else {
        return("something wrong")
      }
}
module.exports = {getTransactionByHash}