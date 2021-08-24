const Web3 = require("web3");
const config = require("../../config/config.js");
const transaction = require("../transaction/transactions.js");
const referenceBack = require("../Refsearching/RefSearching");

const bundle_artifact = require(config.bundlePath);
const contractAddressBundle = config.bundleContractAddress;

const web3 = new Web3(config.web3Rpc);
const bundle = new web3.eth.Contract(
  bundle_artifact.abi,
  contractAddressBundle
);

  module.exports = { bundle,web3,transaction,contractAddressBundle ,referenceBack};

  
