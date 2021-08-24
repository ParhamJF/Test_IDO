const start = require ("./mainConfig");

async function getById(uniqueId,assetId,createdBy) {

if (start.web3.eth.net.isListening())
{
  if(uniqueId){
    uniqueId = start.web3.utils.keccak256(uniqueId);
  const result = await start.AssetAndEvent.getPastEvents("AssetAndEvent", {
    filter: { uniqueIdHash: uniqueId },
    fromBlock: 0,
  })
  return(result);
}
if (assetId){
  const result = await start.AssetAndEvent.getPastEvents("AssetAndEvent", {
    filter: { assetId: assetId },
    fromBlock: 0,
  })
  return(result);
}
if (createdBy){
  const result = await start.AssetAndEvent.getPastEvents("AssetAndEvent", {
    filter: { createdBy: createdBy },
    fromBlock: 0,
  })
  return(result);
}
}else {
  return("something wrong")
  }
}

  module.exports = {getById};
