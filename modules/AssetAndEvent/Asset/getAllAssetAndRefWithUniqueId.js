const start = require ("./mainConfig");

async function getAssetByEventWithEventsFull (uniqueId) {

if (start.web3.eth.net.isListening())
{
const result = await start.Asset.getPastEvents("Asset", {
    filter: { uniqueId: uniqueId },
    fromBlock: 0,
  });
  return (result);
}else {
return("something wrong")
}
 } 

  module.exports = {getAssetByEventWithEventsFull};