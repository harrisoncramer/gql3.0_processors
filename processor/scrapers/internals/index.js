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
        let time;
        // Only if time selector is present
        if (selectors.time) {
          time = getNthInstanceOfText(
            x,
            selectors.time.selector,
            selectors.time.instance
          );
        }
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
        let location = getFromText(x, selectors.location);
        return { link, title, date, time, location };
      });
  }, selectors);

export const getLinksAndDataV4Unlimited = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = Array.from(document.querySelectorAll(selectors.hearings));
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
        let location = getFromText(x, selectors.location);
        return { link, title, date, time, location };
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
        /// Should have labels option.
        let location = getNextTextFromDocument(selectors.location);
        let date = null;
        let time = null;
        date = selectors.date.label
          ? getNextTextFromDocument(selectors.date.value)
          : getTextFromDocument(selectors.date.value);

        if (selectors.time) {
          time = selectors.time.label
            ? getNextTextFromDocument(selectors.time.value)
            : getTextFromDocument(selectors.time.value);
        }
        if (selectors.splitDate) {
          // If data includes splitDate...
          time = date.split(selectors.splitDate)[1];
          date = date.split(selectors.splitDate)[0];
        }
        let link = document.URL;
        return {
          title,
          date,
          time,
          location,
          link,
        };
      }, selectors);
    })
  );

export const getPageDataWithJQuery = async ({ pages, selectors }) =>
  Promise.all(
    pages.map(async (page) => {
      return page.evaluate((selectors) => {
        let title = getTextFromDocument(selectors.title);
        // This complicated function turns the location, date, and time into an array
        let info = $(selectors.jquerySelector)
          .contents()[1]
          .textContent.split("\n")
          .map((x) => x.trim())
          .filter((x) => x !== "" && x !== "@" && x !== "0");
        let location =
          selectors.locationIndex === null
            ? null
            : info[selectors.locationIndex];
        let date =
          selectors.dateIndex === null ? null : info[selectors.dateIndex];
        let time =
          selectors.timeIndex === null ? null : info[selectors.timeIndex];
        let link = document.URL;
        return {
          title,
          date,
          time,
          location,
          link,
        };
      }, selectors);
    })
  );
