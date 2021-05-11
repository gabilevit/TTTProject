const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const { request } = require("http");

app.listen(1902, () =>{
    console.log("Server is up");
});