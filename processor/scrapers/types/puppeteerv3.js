import randomUser from "random-useragent";

import { getLinksAndDatav2, getPageText } from "../internals";
import { logger } from "../../loggers/winston";
import { setPageBlockers, setPageScripts } from "../../setup/config";

export default async (browser, data) => {
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

  let dataWithLinks;
  try {
    dataWithLinks = await getLinksAndDatav2({
      page,
      selectors: data.selectors.layerOne,
    });
  } catch (err) {
    logger.error("Could not get links. ", err);
    throw err;
  }

  try {
    dataWithLinks = await Promise.all(
      dataWithLinks.map(async (datum) => {
        let page = await browser.newPage();
        await setPageBlockers(page);
        await page.goto(datum.link);
        await setPageScripts(page);
        let text = await getPageText(page, data.selectors.layerOne);
        return { ...datum, text };
      })
    );
  } catch (err) {
    logger.error("Could not get page text. ", err);
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

  return dataWithLinks;
};
