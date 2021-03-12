const cors = require("cors");
const express = require("express");
const router = express.Router();
const apiPoller = require("../lib/api-poller");

router.get("/prices", cors(), function (req, res, next) {
  const data = apiPoller.getAll();
  const body = {
    cryptocurrencies: {
      lastUpdatedAt: data.prices.lastUpdatedAt,
      prices: data.prices.data,
    },
    networkFees: {
      ETH: {
        ...data.ethFee.data,
        // ...ethGas.prices(),
        lastUpdatedAt: data.ethFee.lastUpdatedAt,
      },
      BTC: {
        ...data.btcFee.data,
        // ...btc.prices(),
        lastUpdatedAt: data.btcFee.lastUpdatedAt,
      },
    },
  };
  res.json(body);
});

module.exports = router;
