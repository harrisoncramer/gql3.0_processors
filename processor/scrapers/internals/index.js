/* eslint-disable */
// Many of these functions are passed into the page context

import { setPageBlockers, setPageScripts } from "../../setup/config";

export const getLinks = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    let links = rows.map((x) => getLink(x));
    return links;
  }, selectors);

export const openNewPages = async (browser, links) => {
  let pages = await Promise.all(links.map(() => browser.newPage()));
  await Promise.all(
    pages.map(async (page, i) => {
      await setPageBlockers(page);
      await page.goto(links[i]);
      await setPageScripts(page);
      return page;
    })
  );
  return pages;
};

export const getPageData = async ({ pages, selectors }) =>
  Promise.all(
    pages.map(async (page) => {
      return page.evaluate((selectors) => {
        let title = getTextFromDocument(selectors.title);
        let date = getTextFromDocument(selectors.date);
        let time = getTextFromDocument(selectors.time);
        let location = getNextTextFromDocument(selectors.location).replaceAll([
          "House Office Building, Washington, DC 20515",
          " House Office Building",
        ]);
        let witnesses = makeArrayFromDocument(selectors.witnesses)
          .map((x) => clean(x.textContent))
          .filter((x) => x !== "");
        return {
          title,
          date,
          time,
          location,
          witnesses,
        };
      }, selectors);
    })
  );
