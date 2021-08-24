const { Transaction } = require("ethereumjs-tx");
const Web3 = require("web3");
const config = require("../../config/config.js");

const web3 = new Web3(config.web3Rpc);
const gasFee = config.GasFee;

// ---------------------------------- Transaction structure -------------------------
async function createTransaction(
    createdBy,
    contractAddress,
    encoded,
    sender
  ) {
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: createdBy,
        to: contractAddress,
        contractAddress: contractAddress,
        data: encoded,
        gas: gasFee,
      },
      sender 
    );
    const Receipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
    );
    return(Receipt);
  }

  module.exports = {createTransaction };