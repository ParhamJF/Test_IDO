async function getBackwardReferenceAssets(refID) {
    const refAssets = [];
  
    if (refID && refID.length > 0) {
      for (let i = 0; i < refID.length; i++) {
        let refAsset;
        // In backwards we check for each element in map if it exists or not
        refAsset = await meta.getPastEvents("AssetByEvent", {
          filter: { assetId: refID[i] },
          fromBlock: 0,
        });
        if (refAsset[0]) {
          //refAssetIds =  refID[i].returnValues.assetIdRef
          let refAssetIds = refAsset.map((ele) => ele.returnValues.refAssetIds);
          //const refIDs = refAsset[0].refID.length > 0 ? refAsset[0].refID[0].map(ref => (ref.assetId ? ref.assetId : ref)) : [];
          const refChildAssets = await this.getBackwardReferenceAssets(
            refAssetIds
          );
          refAsset[0].asset.backwardReferenceAssets = refChildAssets;
          refAssets.push(refAsset[0].asset);
        }
        return refChildAssets;
      }
    }
  }
  module.exports = {getBackwardReferenceAssets };