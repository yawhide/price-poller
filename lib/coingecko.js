const axios = require("axios");
const apiPoller = require("./api-poller");

const COIN_MAPPING = {
  bitcoin: "BTC",
  ethereum: "ETH",
  tether: "USDT",
  polkadot: "DOT",
  ripple: "XRP",
  litecoin: "LTC",
  "bitcoin-cash": "BCH",
  cardano: "ADA",
  chainlink: "LINK",
  stellar: "XLM",
  binancecoin: "BNB",
  "usd-coin": "USDC",
  monero: "XMR",
  eos: "EOS",
  "crypto-com-chain": "EOS",
};
const COIN_GECKO_IDS_PARAM = Object.keys(COIN_MAPPING).join(",");

const name = "prices";
function dependencyCheckFn(prices) {
  return true;
}
function networkCallFn() {
  return axios
    .get("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids: COIN_GECKO_IDS_PARAM,
        vs_currencies: "cad",
        include_last_updated_at: true,
      },
    })
    .then(function (response) {
      const prices = {};
      Object.keys(response.data).forEach((coinID) => {
        prices[COIN_MAPPING[coinID]] = response.data[coinID].cad;
      });
      return prices;
    });
}

apiPoller.registerAndPoll(name, dependencyCheckFn, networkCallFn);
