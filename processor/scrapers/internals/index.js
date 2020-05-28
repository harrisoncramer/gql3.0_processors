/* eslint-disable */
// Many of these functions are passed into the page context

import { setPageBlockers, setPageScripts } from "../../setup/config";

export const getLinks = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    let links = rows.map((x) => getLink(x));
    return links.filter((x, i) => i + 1 <= selectors.depth); // Only return pages w/in depth range, prevents overfetching w/ puppeteer
  }, selectors);

export const getLinksAndData = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    return rows
      .filter((x, i) => i + 1 <= selectors.depth)
      .map((x) => {
        let link = getLink(x);
        let title = getLinkText(x);
        let location = getFromText(x, selectors.location);
        let date = getFromText(x, selectors.date);
        let time = getNthInstanceOfText(x, selectors.time, 1);
        return { link, title, location, date, time };
      });
  }, selectors);

export const getAdditionalData = ({ pages, selectors }) =>
  Promise.all(
    pages.map(async (page) => {
      return page.evaluate((selectors) => {
        debugger;
      });
    })
  );

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
