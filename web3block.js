const Web3 = require("web3");
const config = require("./config/config.js");

const web3 = new Web3(config.web3Rpc);

async function gaslimit(){
    // web3.eth.getGasPrice().then(console.log);
    // web3().then(console.log);
    // web3.eth.getTransaction('0xe1f386b3b59520f349872d38d4d62b0d91f7006273265fa312641eb0b10d5363').then(console.log);
    console.log(web3.eth.accounts.privateKeyToAccount('0xad71855d5d6202a666d1dad6f8ed7f35282769384139f54a9b5816d444da3042'));
}


gaslimit();