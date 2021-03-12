const fs = require("fs");
const fsPromises = require("fs/promises");
const debug = require("debug");

const TIMEOUT = 60 * 1000;
const cache = {};
const loggers = {};
let lastUpdatedAt = null;

exports.registerAndPoll = (name, dependencyCheckFn, networkCallFn) => {
  const CACHE_FILEPATH = `./tmp/${name}_cache.json`;
  cache[name] = {};
  if (!loggers[name]) {
    loggers[name] = debug(`price-poller:${name}-api-poller`);
  }
  const log = loggers[name];

  if (fs.existsSync(CACHE_FILEPATH)) {
    cache[name].data = JSON.parse(fs.readFileSync(CACHE_FILEPATH, "utf8"));
  } else {
    fs.writeFileSync(CACHE_FILEPATH, JSON.stringify({}));
  }
  cache[name].lastUpdatedAt = fs.statSync(CACHE_FILEPATH).mtime.toISOString();

  function run() {
    if (!dependencyCheckFn(cache.prices.data)) {
      console.warn(
        `skipping updating ${name} poll due to missing coingecko prices.`
      );
      return setTimeout(run, TIMEOUT);
    }

    networkCallFn()
      .then((data) => {
        cache[name].data = data;
        log(`writing ${name} information to disk`);
        return fsPromises.writeFile(
          CACHE_FILEPATH,
          JSON.stringify(cache[name].data)
        );
      })
      .then(() => {
        cache[name].lastUpdatedAt = new Date().toISOString();
        log(`updated ${name}:`, cache[name].lastUpdatedAt);
      })
      .catch(function (error) {
        console.error(`Error polling/writing ${name}.`, error);
      })
      .finally(() => {
        setTimeout(run, TIMEOUT);
      });
  }
  console.log(`Started ${name} polling. Last updated at: `, lastUpdatedAt);
  run();
};

exports.getAll = () => cache;
