const start = require ("./mainConfig");


  async function getById(sender,createdBy,bundleId) {

if (start.web3.eth.net.isListening())
{
    if(sender){
    const result = await start.bundle.getPastEvents("Bundle", {
      filter: { sender: sender },
      fromBlock: 0,
    })
    return(result);
  }
  if (bundleId){
    const result = await start.bundle.getPastEvents("Bundle", {
      filter: { bundleId: bundleId },
      fromBlock: 0,
    })
    return(result);
  }
  if (createdBy){
    const result = await start.bundle.getPastEvents("Bundle", {
      filter: { createdBy: createdBy },
      fromBlock: 0,
    })
    return(result);
  }

}else {
  return("somthing wrong")
  }

}


  module.exports = {getById};
