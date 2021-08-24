const Web3 = require("web3");
const config = require("../../../config/config");
const transaction = require("../../transaction/transactions.js");
const referenceBack = require("../../Refsearching/RefSearching");

const Asset_artifact = require(config.assetPath);
const contractAddressAsset = config.assetContractAddress;

const web3 = new Web3(config.web3Rpc);
const Asset = new web3.eth.Contract(
  Asset_artifact.abi,
  contractAddressAsset
);
  module.exports = { Asset,web3,transaction,config,contractAddressAsset,referenceBack};