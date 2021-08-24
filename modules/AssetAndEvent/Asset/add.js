const start = require ("./mainConfig");

async function add(
   sender,
        createdBy,
          assetId,
          uniqueId,
         eventType,
         name,
         typeOfRequest,
         packagingID,
         assetType,
         creationTimestamp,
        assetIdRef,
        extraField
) {
if (start.web3.eth.net.isListening())
{
  var createdByIsAddress = start.web3.utils.isAddress(createdBy);
  var assetIdIsAddress = start.web3.utils.isAddress(assetId);
      if (createdByIsAddress == true){
       if (assetIdIsAddress == true ) {
        sender = start.web3.eth.accounts.privateKeyToAccount(sender);
        const encoded = start.Asset.methods
          .AddAsset(
            createdBy,
          assetId,
          uniqueId,
         eventType,
         name,
         typeOfRequest,
         packagingID,
         assetType,
         creationTimestamp,
        assetIdRef,
        extraField
          )
          .encodeABI();
          
        const result = await start.transaction.createTransaction(
          createdBy,
          start.contractAddressAsset,
          encoded,
          sender.privateKey)
          return result;
        } else {
          sender = start.web3.eth.accounts.privateKeyToAccount(sender);
          assetId = start.web3.utils.padLeft(0x0, 40);
        const encoded = start.Asset.methods
          .AddAsset(
            createdBy,
          assetId,
          uniqueId,
         eventType,
         name,
         typeOfRequest,
         packagingID,
         assetType,
         creationTimestamp,
        assetIdRef,
        extraField
          )
          .encodeABI();
          
        const result = await start.transaction.createTransaction(
          createdBy,
          start.contractAddressAsset,
          encoded,
          sender.privateKey)
          return result;
        }
      } else {
        return("is CreatedBy id address correct : " + createdByIsAddress);
      }
}else {
  return("something wrong")
  }
}

  module.exports = { add };