const Web3 = require("web3");
const config = require("../../../config/config");
const transaction = require("../../transaction/transactions.js");
const referenceBack = require("../../Refsearching/RefSearching");

const Event_artifact = require(config.eventPath);
const contractAddressEvent = config.eventContractAddress;

const web3 = new Web3(config.web3Rpc);
const Event = new web3.eth.Contract(
  Event_artifact.abi,
  contractAddressEvent
);

  module.exports = { Event,web3,transaction,contractAddressEvent ,referenceBack};

  
