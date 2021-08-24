const Web3 = require('web3');
const config = require('./config/LiveConfig.json');
// Initialization
let compiled = require(`./build/${process.argv[2]}.json`);
const bytecode = compiled.bytecode;
const abi = compiled.abi;
const privKey = config["WEB3_NODEPRIVATEKEY"];
const address = config["account_Address"];
const web3 = new Web3(config["WEB3_RPC"]);
// Deploy contract
const deploy = async () => {
   console.log('Attempting to deploy from account:', address);
const AssetEvent = new web3.eth.Contract(abi);
const AssetEventTx = AssetEvent.deploy({
      data: bytecode,
      arguments: [5],
   });
const createTransaction = await web3.eth.accounts.signTransaction(
      {
         from: address,
         data: AssetEventTx.encodeABI(),
         gas: '6721975',
      },
      privKey
   );
const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
   );
   console.log('Contract deployed at address', createReceipt.contractAddress, createReceipt);
};
deploy();