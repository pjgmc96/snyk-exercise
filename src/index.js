const fs = require("fs");
const axios = require("axios");
const async = require("async");

function readFile(path) {
  return fs.readFileSync(path, "utf-8").split("\n");
}

async function makeRequest(url) {
  try {
    const { status } = await axios.get(url, { timeout: 3000 });

    return status;
  } catch (error) {
    if (error.response) {
      return error.response.status;
    }

    return -1;
  }
}

async function processOne({ url, domain, endpoint }, results) {
  const statusCode = await makeRequest(url);

  if (!results.has(domain)) {
    results.set(domain, { statusCodes: new Map(), validPaths: [] });
  }

  const domainResults = results.get(domain);

  const statusCodeCount = domainResults.statusCodes.get(statusCode) || 0;
  domainResults.statusCodes.set(statusCode, statusCodeCount + 1);

  if (statusCode === 200) {
    domainResults.validPaths.push(endpoint);
  }
}

async function processMany(pathInfo) {
  const domains = readFile(pathInfo.domains);
  const endpoints = readFile(pathInfo.endpoints);

  let queue = [];
  domains.forEach((domain) => {
    endpoints.forEach((endpoint) => {
      queue.push({ url: `${domain}${endpoint}`, domain, endpoint });
    });
  });

  const results = new Map();

  const q = async.queue(async (task, callback) => {
    await processOne(task, results);
    callback();
  }, 4);

  queue.forEach((task) => q.push(task));

  q.drain(() => {
    results.forEach((domainResults, domain) => {
      console.log(`\nResults for ${domain}:`);

      console.log("  Status codes:");
      domainResults.statusCodes.forEach((count, statusCode) => {
        console.log(`    ${statusCode}: ${count}`);
      });

      console.log(`  Valid paths:`);
      domainResults.validPaths.forEach((validPath) => {
        console.log(`    ${domain}${validPath}`);
      });
    });

    console.log("\nSummary:");
    console.log(`  Total domains tested: ${domains.length}`);
    console.log(`  Total paths tested: ${domains.length * endpoints.length}`);
  });
}

function main() {
  processMany({
    domains: "../data/domains.txt",
    endpoints: "../data/endpoints.txt",
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  makeRequest,
  processMany,
  processOne,
};
