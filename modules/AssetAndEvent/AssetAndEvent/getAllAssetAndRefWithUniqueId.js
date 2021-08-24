const start = require ("./mainConfig");

async function getAssetByEventWithEvents(uniqueId) {

if (start.web3.eth.net.isListening())
{
  const result = await start.AssetAndEvent.getPastEvents("AssetAndEvent", {
    filter: { uniqueId: uniqueId },
    fromBlock: 0,
  });
  /// we get all history of first asset by unique id  /// as array list ///-----> result

  //const totalResult = [];
  for (let i = 0; i < result.length; i++) {
    const { refChildAssets } = await start.refSearching.getBackwardReferenceAssets([
      result[i].returnValues.assetIdRef,
    ]);
    //updatedMap = updatedMap1;
    refAsset[i].forwardReferenceAssets = refChildAssets;
    refAssets.push(refAsset[i]);
    // let assetIdRef = result[i].returnValues.assetIdRef;
    // if (assetIdRef !==  null && assetIdRef !== web3.utils.padLeft(0x0, 40) ){
    /*const refResult = await meta.getPastEvents("AssetByEvent", {
        filter: { assetId: assetIdRef },
        fromBlock: 0, 
        }
      );*/
    totalResult.push(refResult);
    // }else{
    // totalResult.push("there is no relative asset for this thi asset find")
    // }
  }
  return(totalResult);
}else {
  return("something went wrong")
  }
}


  module.exports = {getAssetByEventWithEvents};