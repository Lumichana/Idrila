const express = require("express");
const server = express.Router();

server.all("/ready", (req, res) => {
    res.send(global.path.appConfig);
});

module.exports = server;
