import randomUser from "random-useragent";

import { getLinksAndDatav2, getPageText } from "../internals";
import { logger } from "../../loggers/winston";
import { setPageBlockers, setPageScripts } from "../../setup/config";
import { asyncForEach, wait } from "../../../util";

export default async (browser, job) => {
  // Setup initial list of links
  let link = job.phaseOne.link;
  let allLinks = job.phaseOne.range.map((x) => link.replace("SUBSTITUTE", x));

  let results = [];

  await asyncForEach(allLinks, async (link) => {
    // If needed, wait...
    if (job.nice) {
      logger.info(`Being nice for ${job.nice / 1000} seconds...`);
      await wait(job.nice);
    }

    // Create new page
    let page;
    try {
      page = await browser.newPage();
      await page.goto(link);
      await setPageBlockers(page);
      await setPageScripts(page);
      let userAgentString = randomUser.getRandom();
      await page.setUserAgent(userAgentString);
    } catch (err) {
      logger.error("Could not navigate to inital page. ", err);
      throw err;
    }

    let dataWithLinks; // Go to link and get all sub-links
    try {
      dataWithLinks = await getLinksAndDatav2({
        page,
        selectors: job.phaseTwo,
      });
    } catch (err) {
      logger.error("Could not get links. ", err);
      throw err;
    }

    // Get the text from each page
    try {
      dataWithLinks = await Promise.all(
        dataWithLinks.map(async (datum) => {
          let page = await browser.newPage();
          await setPageBlockers(page);
          await page.goto(datum.link);
          await setPageScripts(page);
          let text = await getPageText(page);
          return { ...datum, text };
        })
      );
    } catch (err) {
      logger.error("Could not get page text. ", err);
    }

    // Close each page
    try {
      let pages = await browser.pages();
      await Promise.all(pages.map(async (page) => await page.close()));
    } catch (err) {
      logger.error("Could not close pages. ", err);
      throw err;
    }

    // Add the pageData to the results array
    results.push(...dataWithLinks);
  });

  return results;
};
