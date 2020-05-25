import randomUser from "random-useragent";

import { getPageData, getLinks, openNewPages } from "../internals";
import { logger } from "../../loggers/winston";
import { setPageBlockers, setPageScripts } from "../../setup/config";

export default async (browser, data, time) => {
  let page;

  try {
    page = await browser.newPage();
    let userAgentString = randomUser.getRandom();
    await page.setUserAgent(userAgentString);
    await setPageBlockers(page);
    await page.goto(data.link);
    await setPageScripts(page);
  } catch (err) {
    logger.error("Could not navigate to inital page. ", err);
    throw err;
  }

  let links;
  let pages;
  let pageData;

  try {
    links = await getLinks({
      page,
      selectors: data.selectors.layerOne,
      time,
    });
  } catch (err) {
    logger.error("Could not get links. ", err);
    throw err;
  }

  try {
    pages = await openNewPages(browser, links);
  } catch (err) {
    logger.error("Could not navigate to pages. ", err);
    throw err;
  }

  try {
    pageData = await getPageData({
      pages,
      selectors: data.selectors.layerTwo,
    });
  } catch (err) {
    logger.error("Could not get pageData. ".err);
    throw err;
  }

  try {
    let pages = await browser.pages();
    await Promise.all(
      pages.map(async (page, i) => i > 0 && (await page.close()))
    );
  } catch (err) {
    logger.error("Could not close pages. ", err);
    throw err;
  }

  return pageData;
};
