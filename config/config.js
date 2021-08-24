module.exports = Object.freeze({
  web3Rpc: process.env.WEB3_RPC || 'http://localhost:8545',
  nodePrivateKey: process.env.WEB3_NODE_PRIVATEKEY || '',
  nodeAddressKey: process.env.WEB3_NODE_ADDRESS_KEY || '',
  PoolContractAddress: process.env.CONTRACT_BUNDLE_ADDRESS || '0xbEBFe210A4F19671Eac7587b72a24bA3C5674923',
  PoolPath: process.env.ASSET_AND_EVENT_PATH || "../../build/pool",
  GasFee: process.env.GAS_FEE || "400000"
});