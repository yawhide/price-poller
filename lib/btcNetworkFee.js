const axios = require("axios");
const apiPoller = require("./api-poller");

const name = "btcFee";
function dependencyCheckFn(prices) {
  return prices && prices.BTC;
}
function networkCallFn() {
  return axios
    .get("https://mempool.space/api/v1/fees/recommended")
    .then(function (response) {
      const btcFees = {};
      ["fastestFee", "halfHourFee", "hourFee"].forEach((speed) => {
        btcFees[speed] = {
          satoshis: response.data[speed],
        };
      });
      return btcFees;
    });
}

apiPoller.registerAndPoll(name, dependencyCheckFn, networkCallFn);
