import cheerio from "cheerio";
import { requestPromiseRetry } from "../../../util";

export const getProxy = async () => {
  let proxies = [];
  let res = await requestPromiseRetry("https://sslproxies.org/", 10);
  const $ = cheerio.load(res);
  $("table")
    .first()
    .find("td:nth-child(1)")
    .each((_) => proxies.push({})); // Setup objects.
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

  proxies = proxies.filter((x, i) => x.code === "US");

  return proxies;
};
