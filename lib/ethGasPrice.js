const axios = require("axios");
const fs = require("fs");
const fsPromises = require("fs/promises");
const coingecko = require("./coingecko");
const log = require("debug")("price-poller:eth-gas-price");

const ETH_GAS_PRICE_FILEPATH = "./eth_gas_price.json";
const TIMEOUT = 60 * 1000;

let ethGasPrice = {};
if (fs.existsSync(ETH_GAS_PRICE_FILEPATH)) {
  ethGasPrice = JSON.parse(fs.readFileSync(ETH_GAS_PRICE_FILEPATH, "utf8"));
} else {
  fs.writeFileSync(ETH_GAS_PRICE_FILEPATH, JSON.stringify(ethGasPrice));
}
let lastUpdatedAt = fs.statSync(ETH_GAS_PRICE_FILEPATH).mtime.toISOString();

function calculateEthTransferGasFee(gwei) {
  return (gwei / 10) * 0.000000001 * coingecko.prices.ETH * 21000;
}

function calculateEthContractTransferGasFee(gwei) {
  return (gwei / 10) * 0.000000001 * coingecko.prices.ETH * 220000;
}

function updateEthGasPrices() {
  if (!coingecko.prices || !coingecko.prices.ETH) {
    console.warn(
      "skipping updating eth gas price poll due to missing coingecko prices."
    );
    return setTimeout(updateEthGasPrices, TIMEOUT);
  }

  axios
    .get("https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json", {
      params: { "api-key": process.env.ETHGASSTATION_API_KEY },
    })
    .then(function (response) {
      // calculation taken from: https://forum.storj.io/t/ethereum-transaction-fee-calculator/8071
      ethGasPrice.fast = calculateEthTransferGasFee(response.data.fast);
      ethGasPrice.fastest = calculateEthTransferGasFee(response.data.fastest);
      ethGasPrice.average = calculateEthTransferGasFee(response.data.average);
      ethGasPrice.slow = calculateEthTransferGasFee(response.data.safeLow);
      ethGasPrice.fastGwei = response.data.fast / 10;
      ethGasPrice.fastestGwei = response.data.fastest / 10;
      ethGasPrice.averageGwei = response.data.average / 10;
      ethGasPrice.slowGwei = response.data.slow / 10;

      log("writing new eth gas information to disk");
      return fsPromises
        .writeFile(ETH_GAS_PRICE_FILEPATH, JSON.stringify(ethGasPrice))
        .then(() => {
          lastUpdatedAt = new Date().toISOString();
          log("updated eth gas price:", response.data.fast, lastUpdatedAt);
        })
        .catch((error) => {
          console.error("Error writing eth gas price to disk.", error);
        });
    })
    .catch(function (error) {
      console.error("Failed to query for eth gas prices.", error);
    })
    .finally(() => {
      setTimeout(updateEthGasPrices, TIMEOUT);
    });
}

setTimeout(updateEthGasPrices, TIMEOUT);
console.log("Started eth gas price polling. Last updated at: ", lastUpdatedAt);

module.exports.lastUpdatedAt = lastUpdatedAt;
module.exports.prices = ethGasPrice;
