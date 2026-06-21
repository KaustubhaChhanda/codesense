// modules
const express = require("express");

// controllers
const handleAlert = require("../controllers/webhook.controller");

const router = express.Router();

router.post("/", handleAlert);

module.exports = router;
