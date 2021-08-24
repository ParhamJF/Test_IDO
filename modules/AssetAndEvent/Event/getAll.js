const start = require ("./mainConfig");

async function getAll() {

if (start.web3.eth.net.isListening())
{
const data = await start.Event.getPastEvents("Event", {
    fromBlock: 0,
  });
  return(data);
}else {
return("somthing wrong")
}
  
}

  module.exports = {getAll};