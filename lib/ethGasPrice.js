const axios = require("axios");
const apiPoller = require("./api-poller");

const name = "ethFee";
function dependencyCheckFn(prices) {
  return prices && prices.ETH;
}
function networkCallFn() {
  return axios
    .get("https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json", {
      params: { "api-key": process.env.ETHGASSTATION_API_KEY },
    })
    .then(function (response) {
      const ethGasPrices = {};
      ["fastest", "fast", "average", "safeLow"].forEach((speed) => {
        ethGasPrices[speed] = {
          rawgwei: response.data[speed],
          gwei: response.data[speed] / 10,
        };
      });
      return ethGasPrices;
    });
}

apiPoller.registerAndPoll(name, dependencyCheckFn, networkCallFn);
