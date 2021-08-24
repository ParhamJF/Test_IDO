const start = require ("./mainConfig");

async function getAll() {

if (start.web3.eth.net.isListening())
{
const data = await start.AssetAndEvent.getPastEvents("AssetAndEvent", {
    fromBlock: 0,
  });
  return(data);
}else {
return("something went wrong")
}
  
}

  module.exports = {getAll};