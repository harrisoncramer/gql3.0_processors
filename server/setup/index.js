// import path from "path";
import { logger } from "../loggers/winston";

import puppeteer from "puppeteer-extra";
import randomUser from "random-useragent";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import { getProxy } from "./proxies";

const { getRandom } = require("../../util");

export const setupPuppeteer = async ({ type }) => {
  // Set initial variables
  const isProduction = process.env.NODE_ENV === "production";
  let proxy = null;
  const args = ["--no-sandbox"];

  const isTor = type === "tor";
  const isProxy = type === "proxy";

  if (!isTor && !isProxy) {
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
  } else {
    let proxies = await getProxy();
    let proxyIndex = getRandom(0, proxies.length - 1)();
    let proxyData = proxies[proxyIndex];
    proxy = `http://${proxyData.ip}:${proxyData.port}`;
  }

  args.push(`--proxy-server=${proxy}`);

  /// Initialize Browser
  const browser = await puppeteer.launch({
    headless: isProduction || process.env.IS_HEADLESS,
    devtools: !isProduction,
    args,
  });

  browser.on("disconnected", () => {
    logger.info("Browser was disconnected.");
  });

  ///// Page setup
  const page = (await browser.pages())[0];
  page.on("error", (err) => {
    logger.error("Page error. ", err);
  });
  let userAgentString = randomUser.getRandom();
  await page.setUserAgent(userAgentString);
  page.setDefaultNavigationTimeout(0); // May be required to lengthen this in order to get more reliable data...

  //// Confirm page is working
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

  return { browser, page };
};
