const Web3 = require("web3");
const config = require("../../config/config.js");

const web3 = new Web3(config.web3Rpc);

async function getAccountBalance(address){
    console.log("**** GET account balance ether ****");
    var answer = web3.utils.fromWei(await web3.eth.getBalance(address), "ether");
    console.log(web3.eth.accounts.wallet)
    const result = `
        success  : True,
        accounts : ${address},
        balance  : ${answer}  ether `
      return (result);
}

async function transferCoin(addressFrom ,addressTo,amount){
  console.log("**** sendCoin ****");
  var value = web3.utils.fromWei(amount, "ether");
  const result = web3.eth.sendTransaction({
    to: addressTo,
    from: addressFrom,
    value: value,
  });
  return(result
  )
}

module.exports = {getAccountBalance,transferCoin };