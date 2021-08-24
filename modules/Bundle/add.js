const start = require ("./mainConfig");

async function add(
  sender,
  createdBy,
  bundleId,
  date,
  data,
  extraField
) {
  var createdByIsAddress = start.web3.utils.isAddress(createdBy);
  if (createdByIsAddress == true) {
if (start.web3.eth.net.isListening())
{
    sender = start.web3.eth.accounts.privateKeyToAccount(sender)
        const encoded = start.bundle.methods
          .AddBundle(
            createdBy,
            bundleId,
            date,
            data,
            extraField
          )
          .encodeABI();
        const result = await start.transaction.createTransaction(
          createdBy,
          start.contractAddressBundle,
          encoded,
          sender.privateKey);
            return(result) ;
  } else {
    return("is createdBy id address correct : " + createdByIsAddress);
  }
}else {
  return("something went wrong")
  }
}

  module.exports = { add };