import randomUser from "random-useragent";

import { getLinksAndData } from "../internals";
import { logger } from "../../loggers/winston";
import { setPageBlockers, setPageScripts } from "../../setup/config";
import { asyncForEach } from "../../../util";

export default async (browser, job) => {
  // Setup initial list of links
  let baseLink = job.phaseOne.baseLink;
  let allLinks = job.phaseOne.range.map((x) =>
    baseLink.replace("SUBSTITUTE", x)
  );

  let results = [];

  await asyncForEach(allLinks, async (link) => {
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

    console.log(job.phaseTwo);

    let dataWithLinks;
    // Go to link and get all sub-links
    try {
      dataWithLinks = await getLinksAndData({
        page,
        selectors: job.phaseTwo,
      });
    } catch (err) {
      logger.error("Could not get links. ", err);
      throw err;
    }

    console.log(dataWithLinks);

    // Close each page
    try {
      let pages = await browser.pages();
      await Promise.all(pages.map(async (page) => await page.close()));
    } catch (err) {
      logger.error("Could not close pages. ", err);
      throw err;
    }

    console.log(`Finished with page ${link}`);

    // Add the pageData to the results array
    results.push(...dataWithLinks);
  });

  return results;
};
