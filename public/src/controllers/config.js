const express = require("express");
const config = require("../../../src/utilities/config");
const server = express.Router();

server.get("/", (req, res) => {
    let val = config.get();
    res.status(val !== undefined ? 200 : 404).send(val);
});

server.get("/:key", (req, res) => {
    let val = config.get(req.params.key);
    res.status(val !== undefined ? 200 : 404).send(val);
});

server.post("/", (req, res) => {
    let val = Object.keys(req.body).every((key) => config.upsert(key, req.body[key]));
    res.status(val ? 201 : 500).send();
});

module.exports = server;
