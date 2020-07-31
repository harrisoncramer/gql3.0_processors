import randomUser from "random-useragent";

import { getPageData, getLinks, openNewPages } from "../internals";
import { logger } from "../../loggers/winston";
import { setPageBlockers, setPageScripts } from "../../setup/config";
import { asyncForEach, wait } from "../../../util";

export default async (browser, job) => {
  // Setup initial list of links
  let link = job.phaseOne.link;
  let allLinks;
  if (job.phaseOne.range) {
    allLinks = job.phaseOne.range.map((x) => link.replace("SUBSTITUTE", x));
  } else {
    // If there isn't a range, just use the only link supplied
    allLinks = [job.phaseOne.link];
  }

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
      let userAgentString = randomUser.getRandom();
      await page.setUserAgent(userAgentString);
    } catch (err) {
      logger.error("Could not navigate to inital page. ", err);
      throw err;
    }

    // Go to link and get all sub-links
    let links;
    try {
      await page.goto(link);
      await setPageBlockers(page);
      await setPageScripts(page);
      links = await getLinks({
        page,
        selectors: job.phaseTwo,
      });
    } catch (err) {
      logger.error(`Could not get links for link ${link}: `, err);
    }

    // Create a new page for each link
    let pages;
    try {
      pages = await openNewPages(browser, links);
    } catch (err) {
      logger.error("Could not navigate to pages. ", err);
      throw err;
    }

    // For each page, get the data
    let pageData;
    try {
      pageData = await getPageData({
        pages,
        selectors: job.phaseThree,
      });
    } catch (err) {
      logger.error("Could not get pageData. ".err);
      throw err;
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
    results.push(...pageData);
  });
  console.log(results.length);

  return results;
};
