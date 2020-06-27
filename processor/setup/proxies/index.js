import cheerio from "cheerio";
import { requestPromiseRetry } from "../../../util";
import { logger } from "../../loggers/winston";

export const getAllProxyData = async () => {
  let proxies = [];
  let res = await requestPromiseRetry("https://sslproxies.org/", 10);
  const $ = cheerio.load(res);
  $("table")
    .first()
    .find("td:nth-child(1)")
    .each(() => proxies.push({})); // Setup objects.
  $("table")
    .first()
    .find("td:nth-child(1)")
    .each((i, val) => (proxies[i].ip = $(val).text())); // Add ips.
  $("table")
    .first()
    .find("td:nth-child(2)")
    .each((i, val) => (proxies[i].port = $(val).text())); // Add ports.
  $("table")
    .first()
    .find("td:nth-child(3)")
    .each((i, val) => (proxies[i].code = $(val).text())); // Add Codes.

  //proxies = proxies.filter((x, i) => x.code === "US");
  return proxies;
};

export const getProxies = async () => {
  try {
    logger.info("Getting proxies...");
    let proxies = await getAllProxyData();
    let promises = proxies.map(async (x) =>
      requestPromiseRetry(
        "https://cloture.app",
        1,
        `http://${x.ip}:${x.port}`,
        "giveProxy"
      )
    );
    let results = await Promise.allSettled(promises);
    let filtered = results
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
    return filtered;
  } catch (err) {
    console.log("Could not get proxies.");
    throw err;
  }
};
