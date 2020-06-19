import puppeteer from "puppeteer";

import { logger } from "../loggers/winston";
import { getProxy } from "./proxies";
const { getRandom } = require("../../util");

export const setupPuppeteer = async ({ type }) => {
  // Set initial variables
  const isProduction = process.env.NODE_ENV === "production";
  let proxy = null;
  const args = ["--no-sandbox", "--unlimited-storage"];

  const isTor = type === "tor";
  const isProxy = type === "proxy";

  if (!isTor && !isProxy && process.env.NODE_ENV === "production") {
    throw new Error(
      "Incorrect type passed to puppeteer, should be 'tor' or 'proxy', provided " +
        type
    );
  }

  // Determine tor/proxy for browser
  if (isTor) {
    let ports = process.env.TOR_PORTS.split(",");
    let portIndex = getRandom(0, ports.length - 1)();
    let port = isProduction ? ports[portIndex] : "9050";
    proxy = `socks5://127.0.0.1:` + port;
  }

  if (isProxy) {
    let proxies = await getProxy();
    let proxyIndex = getRandom(0, proxies.length - 1)();
    let proxyData = proxies[proxyIndex];
    proxy = `http://${proxyData.ip}:${proxyData.port}`;
  }

  if (isProxy || isTor) {
    args.push(`--proxy-server=${proxy}`);
  }

  /// Initialize Browser
  const browser = await puppeteer.launch({
    headless: isProduction || process.env.IS_HEADLESS,
    defaultViewport: null,
    devtools: !isProduction,
    args,
  });

  browser.on("disconnected", () => {
    logger.info("Browser was disconnected.");
  });

  ///// Page setup
  const page = (await browser.pages())[0];
  if (isTor) {
    await page.goto("https://check.torproject.org/");
    const isUsingTor = await page.$eval("body", (el) =>
      el.innerHTML.includes(
        "Congratulations. This browser is configured to use Tor"
      )
    );
    if (!isUsingTor) {
      logger.error(`Browser is not using Tor. Exiting...`);
      return await browser.close();
    }
  }

  logger.info(`Configured through site on ${proxy}`);

  return { browser };
};
