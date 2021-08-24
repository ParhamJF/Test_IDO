const Web3 = require("web3");
const config = require("../../../config/config");
const transaction = require("../../transaction/transactions.js");
const referenceBack = require("../../Refsearching/RefSearching");

const AssetAndEvent_artifact = require(config.assetAndEventPath);
const contractAddressAssetAndEvent = config.assetAndEventContractAddress;

const web3 = new Web3(config.web3Rpc);
const AssetAndEvent = new web3.eth.Contract(
  AssetAndEvent_artifact.abi,
  contractAddressAssetAndEvent
);

  module.exports = { AssetAndEvent,web3,transaction,contractAddressAssetAndEvent ,referenceBack};

  
