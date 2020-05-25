import { logger } from "../loggers/winston";
import { getPageData, getLinks, openNewPages } from "./shared";
import { setPageScripts } from "../setup/config";

export const hfac = async (browser, page, data, time) => {
  try {
    await page.goto(data.link);
  } catch (err) {
    logger.error("Could not connect to page. ", err);
    throw err;
  }

  let links;
  let pages;
  let pageData;

  try {
    await setPageScripts(page);
  } catch (err) {
    logger.error("Could not set page scripts. ", err);
    throw err;
  }

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
    });
    console.log(pageData);
  } catch (err) {
    logger.error("Could not get pageData. ".err);
    throw err;
  }

  return links;
};
