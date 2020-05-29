/* eslint-disable */
// Many of these functions are passed into the page context

import { setPageBlockers, setPageScripts } from "../../setup/config";

export const getLinks = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    let links = rows.map((x) => getLink(x));
    return links.filter((x, i) => i + 1 <= selectors.depth && x); // Only return pages w/in depth range, prevents overfetching w/ puppeteer (and where x !== null)
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
        if (selectors.splitDate) {
          // If data includes splitDate...
          time = date.split(selectors.splitDate)[1];
          date = date.split(selectors.splitDate)[0];
        }
        return { link, title, location, date, time };
      });
  }, selectors);

export const getLinksAndDataV2 = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    return rows
      .filter((x, i) => i + 1 <= selectors.depth)
      .map((x) => {
        let link = getLink(x);
        let title = getLinkText(x);
        let date = getNextMatch(x, selectors.date).replace("|", "").trim();
        let time = getNextMatch(x, selectors.time).trim();
        return { link, title, date, time };
      });
  }, selectors);

export const getLinksAndDataV3 = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    return rows
      .filter((x, i) => i + 1 <= selectors.depth)
      .map((x) => {
        let link = getLink(x);
        let title = getLinkText(x);
        let date = getNextMatch(x, selectors.date).replace("|", "").trim();
        let time = getNextMatch(x, selectors.time).trim();
        return { link, title, date, time };
      });
  }, selectors);

export const getLinksAndDataV4 = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = Array.from(
      document
        .querySelectorAll(selectors.upcomingHearings)[0]
        .querySelectorAll(selectors.hearings)
    );
    return rows
      .filter((x, i) => i + 1 <= selectors.depth)
      .map((x) => {
        let link = getLink(x);
        let title = getLinkText(x);
        let dateAndTimeInfo = getFromText(x, selectors.dateTime)
          .split("-")
          .map((x) => x.trim());
        let date = dateAndTimeInfo[0];
        let time = dateAndTimeInfo[1];
        let location = getFromText(x, selectors.location).trim();
        return { link, title, date, time };
      });
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
        let date = selectors.label
          ? getNextTextFromDocument(selectors.date)
          : getTextFromDocument(selectors.date);
        let time = selectors.label
          ? getNextTextFromDocument(selectors.time)
          : getTextFromDocument(selectors.time);
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
