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
