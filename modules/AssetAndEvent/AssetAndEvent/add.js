const start = require("./mainConfig");

async function Add(
  sender,
  createdBy,
  assetId,
  uniqueId,
  eventType,
  name,
  typeOfRequest,
  eventId,
  creationTimestamp,
  assetIdRef,
  extraField
) { 

if (start.web3.eth.net.isListening())
{
  var createdByIsAddress = start.web3.utils.isAddress(createdBy);
  var assetIdIsAddress = start.web3.utils.isAddress(assetId);
      if (createdByIsAddress == true) {
        if (assetIdIsAddress == true) {
        sender = start.web3.eth.accounts.privateKeyToAccount(sender);
        const encoded = start.AssetAndEvent.methods
          .AddAssetAndEvent(
            createdBy,
            assetId,
            uniqueId,
            eventType,
            name,
            typeOfRequest,
            eventId,
            creationTimestamp,
            assetIdRef,
            extraField
          )
          .encodeABI();
        const result = await start.transaction.createTransaction(
          createdBy,
          start.contractAddressAssetAndEvent,
          encoded,
          sender.privateKey
        );
        return result;
        }else{
          sender = start.web3.eth.accounts.privateKeyToAccount(sender);
          assetId = start.web3.utils.padLeft(0x0, 40);
        const encoded = start.AssetAndEvent.methods
          .AddAssetAndEvent(
            createdBy,
            assetId,
            uniqueId,
            eventType,
            name,
            typeOfRequest,
            eventId,
            creationTimestamp,
            assetIdRef,
            extraField
          )
          .encodeABI();
        const result = await start.transaction.createTransaction(
          createdBy,
          start.contractAddressAssetAndEvent,
          encoded,
          sender.privateKey
        );
        return result;
        }
      } else {
        return "is CreatedBy id address correct : " + createdByIsAddress;
      }
}else {
  return("something went wrong")
  }
}

module.exports = { Add };
