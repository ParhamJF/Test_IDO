const Web3 = require("web3");
const config = require("../../config/config.js");

const web3 = new Web3(config.web3Rpc);

async function getTransactionCount(accountPublicKey){
    console.log("**** GET transaction number ****");
    if (web3.eth.net.isListening())
  {
        var transactionCount = await web3.eth.getTransactionCount(
          accountPublicKey
        );
        return (`
          success: true,
          accounts: ${accountPublicKey},
          Number Of Transaction: ${transactionCount},`)
       
    }else {
        return("something wrong")
      }
}
module.exports = {getTransactionCount}