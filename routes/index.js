const express = require("express");
const router = express.Router();
const coingecko = require("../lib/coingecko");
const ethGas = require("../lib/ethGasPrice");

router.get("/prices", function (req, res, next) {
  const body = {
    coingeckoPrice: {
      lastUpdatedAt: coingecko.lastUpdatedAt,
      prices: coingecko.prices,
    },
    ethGasPrice: {
      fast: ethGas.prices.fast,
      lastUpdatedAt: ethGas.lastUpdatedAt,
    },
  };
  res.json(body);
});

module.exports = router;
