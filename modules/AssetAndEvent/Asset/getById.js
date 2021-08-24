const start = require ("./mainConfig");

async function getById(uniqueId,assetId,createdBy) {

if (start.web3.eth.net.isListening())
{
  if(uniqueId){
    uniqueId = start.web3.utils.keccak256(uniqueId);
  const result = await start.Asset.getPastEvents("Asset", {
    filter: { uniqueIdHash: uniqueId },
    fromBlock: 0,
  })
  return(result);
}
if (assetId){
  const result = await start.Asset.getPastEvents("Asset", {
    filter: { assetId: assetId },
    fromBlock: 0,
  })
  return(result);
}
if (createdBy){
  const result = await start.Asset.getPastEvents("Asset", {
    filter: { createdBy: createdBy },
    fromBlock: 0,
  })
  return(result);
}
  
}else {
  return("something went wrong")
  }
}
module.exports = {getById};