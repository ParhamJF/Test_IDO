const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const web3_connect = require("./modules/route.js");
const jsonfile = require("./jsonfile.json");
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// parse application/json
app.use(bodyParser.json());

/* ======================API get all accounts ==============*/
app.get("/api/account/AllAccounts", (req, res) => {
  
  const result = web3_connect.accountManagerAndWallet.accountManager.getAllAccounts()
  result.then(function (result) {
    res.send(result)
  });
});
//----------------------------------get account balance ------------
// get account balance in ether
app.get("/api/wallet/balance", (req, res) => {
  var accountPublicKey = req.body.accountPublicKey;
    var result = web3_connect.accountManagerAndWallet.wallet.getAccountBalance(accountPublicKey);
    result.then(function (result) {  
    res.send(result)});
});

// get transaction number
app.get("/api/transaction/count", (req, res) => {
        var address = req.body.address;
        var result = web3_connect.transaction.getTransactionCount.getTransactionCount(
          address
        );
        result.then(function (result) { 
        res.send(result);
        });
});

// get Tx Hash
app.get("/api/transaction/getByHash", (req, res) => {
  
        transactionHash = req.body.transactionHash;
        var result = web3_connect.transaction.transactionById.getTransactionByHash(transactionHash);
        result.then(function (result) {
          res.send(result);
        });
});
//------------------ send coin
app.post("/api/wallet/sendCoin", (req, res) => {
      var addressFrom = req.body.addressFrom;
      var addressTo = req.body.addressTo;
      let amount = req.body.amount;
      var result = web3_connect.accountManagerAndWallet.wallet.transferCoin(addressFrom ,addressTo,amount);
      result.then(function (result) {
        res.send(result);
      });
  })

// ------------------------------------ Assets API ---------------------------------------------

// ======================== add Asset ========================
app.post("/api/asset/add", (req, res) => {
      let sender = req.body.sender;
      let createdBy = req.body.createdBy;
      let assetId = req.body.assetId;
      let uniqueId = req.body.uniqueId;
      let eventType = req.body.eventType;
      let name = req.body.name;
      let typeOfRequest = req.body.typeOfRequest;
      let packagingID = req.body.packagingID;
      let assetType = req.body.assetType;
      let creationTimestamp = req.body.creationTimestamp;
      let assetIdRef = req.body.assetIdRef;
      let extraField = req.body.extraField;
      const result = web3_connect.Asset.addAsset.add(
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
      );
      result.then(function (result) {
        res.send(result);
      });
});
// ========================  get Assets info by Id ========================
app.get("/api/asset/getById", (req, res) => {
      let uniqueId = req.body.uniqueId;
      let assetId = req.body.assetId;
      let createdBy = req.body.createdBy;
      const result = web3_connect.Asset.getAssetById.getById(uniqueId,assetId,createdBy);
      result.then(function (result) {
        res.send(result);
      });
});
// ========================  get all Assets  ========================
app.get("/api/asset/getAll", (req, res) => {
      const result = web3_connect.Asset.getAllAsset.getAll();
      result.then(function (result) {
        res.send(result);
      });
});
//*****************************************************************************
//********************************* Event structure ***************************
//*****************************************************************************
// ======================== add Event ========================
app.post("/api/event/add", (req, res) => {
    let sender = req.body.sender;
    let createdBy = req.body.createdBy;
    let assetId = req.body.assetId;
    let uniqueId = req.body.uniqueId;
    let eventType = req.body.eventType;
    let eventId = req.body.eventId;
    let name = req.body.name;
    let typeOfRequest = req.body.typeOfRequest;
    let creationTimestamp = req.body.creationTimestamp;
    let assetIdRef = req.body.assetIdRef;
    let extraField = req.body.extraField;
    const result = web3_connect.Event.addEvent.add(
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
    );
    result.then(function (result) {
      res.send(result);
    });
});
//========================  get Event info by Id ========================
app.get("/api/event/getById", (req, res) => {
      let uniqueId = req.body.uniqueId;
      let assetId = req.body.assetId;
      let createdBy = req.body.createdBy;
      const result = web3_connect.Event.getEventById.getById(uniqueId,assetId,createdBy);
      result.then(function (result) {
        res.send(result);
      });
});
// ========================  get all event ========================
app.get("/api/event/getAll", (req, res) => {
      const result = web3_connect.Event.getAllEvent.getAll();
      result.then(function (result) {
        res.send(result);
      });
});
//*****************************************************************************
//********************************* Asset And Event structure ***************************
//*****************************************************************************
// ======================== add Asset and Event ========================
app.post("/api/assetAndEvent/add", (req, res) => {
    let sender = req.body.sender;
    let createdBy = req.body.createdBy;
    let assetId = req.body.assetId;
    let uniqueId = req.body.uniqueId;
    let eventType = req.body.eventType;
    let eventId = req.body.eventId;
    let name = req.body.name;
    let typeOfRequest = req.body.typeOfRequest;
    let creationTimestamp = req.body.creationTimestamp;
    let assetIdRef = req.body.assetIdRef;
    let extraField = req.body.extraField;
    const result = web3_connect.AssetAndEvent.AddAssetAndEvent.Add(
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
    );
    result.then(function (result) {
      res.send(result);
    });
});
//========================  get AssetAndEvents info by Id ========================
app.get("/api/assetAndEvent/getById", (req, res) => {
      let uniqueId = req.body.uniqueId;
      let assetId = req.body.assetId;
      let createdBy = req.body.createdBy;
      const result =
        web3_connect.AssetAndEvent.getAssetAndEvent.getById(uniqueId,assetId,createdBy);
      result.then(function (result) {
        res.send(result);
      });
});

// ========================  get all AssetAndEvent ========================
app.get("/api/assetAndEvent/getAll", (req, res) => {
      const result = web3_connect.AssetAndEvent.getAllAssetAndEvent.getAll();
      result.then(function (result) {
        res.send(result);
      });
});

//*****************************************************************************
//********************************* Bundle structure Full ***************************
//*****************************************************************************
//add bundle
app.post("/api/bundle/add", (req, res) => {
  let sender = req.body.sender;
  let bundleId = req.body.bundleId;
  let date = req.body.date;
  let data = JSON.stringify(jsonfile);
  let createdBy = req.body.createdBy;
  let extraField = req.body.extraField;
    const result = web3_connect.bundle.addBundle.add(
      sender,
      createdBy,
      bundleId,
      date,
      data,
      extraField
    );
    result.then(function (result) {
      res.send(result);
    });
});
//=========================== get all bundle ================================
app.get("/api/bundle/getAll", (req, res) => {
      const data = web3_connect.bundle.getAllBundle.getAll();
      data.then(function (result) {
        res.send(result);
      });
});
// ========================  get bundle by id ========================
app.get("/api/asset/getBundleByBundleId", (req, res) => {
      let bundleId = req.body.bundleId;
      let sender = req.body.sender;
      let createdBy = req.body.createdBy;
      const data = web3_connect.bundle.getBundleById.getById(sender,createdBy,bundleId);
      data.then(function (result) {
        res.send(result);
      });
});
// ------------------------------------ API Settings -----------------------------
app.listen(port, () => {
  console.log("Express Listening at http://localhost:" + port);
});
