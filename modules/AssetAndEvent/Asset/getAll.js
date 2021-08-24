const start = require ("./mainConfig");
const Web3 = require("web3");

async function getAll() {
  console.log("**** GET all Assets ****");
  if (start.web3.eth.net.isListening())
  {
  const data = await start.Asset.getPastEvents("Asset", {
    fromBlock: 0,
  });
  return(data);
}else {
  return("something wrong")
}
}

  module.exports = {getAll};