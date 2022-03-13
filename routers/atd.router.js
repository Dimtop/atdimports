const { Router } = require('express');
var express = require('express')
var router = express.Router();

const atdController = require("../controllers/atd.controller");

router.get("/products",atdController.getProducts)
router.get("/products/wc",atdController.updatePrices)
router.post("/products/wc/updatePrices",atdController.updatePrices)

module.exports = router;