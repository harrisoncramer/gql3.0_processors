import { logger } from "../loggers/winston";
import { getLinks, filterRows } from "./shared";
import { setPageScripts } from "../setup/config";

export const hfac = async (page, data, time) => {
  try {
    await page.goto(data.link);
  } catch (err) {
    logger.error("Could not connect to page. ", err);
    throw err;
  }

  let links;

  try {
    await setPageScripts(page);
  } catch (err) {
    logger.error("Could not set page scripts. ", err);
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

  return links;
};
