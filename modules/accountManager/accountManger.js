const Web3 = require("web3");
const config = require("../../config/config.js");
const transaction = require("../transaction/transactions");

const web3 = new Web3(config.web3Rpc);


//=========== account manager ================
async function getAllAccounts() {
    if(web3.eth.net.isListening()) {
      console.log("**** GET all Accounts ****");
      const answer = await web3.eth.getAccounts();
      const result = `
      success  : True,
      accounts : ${answer}`
        return(result);
    }else{
      return("Something went wrong");
    }
    
  }

  module.exports = {getAllAccounts };