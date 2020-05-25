export const getLinks = async ({ page, selectors }) =>
  page.evaluate((selectors) => {
    let rows = makeArrayFromDocument(selectors.rows);
    let links = rowsFilteredByTime.map((x) => getLink(x));
    return links;
  }, selectors);
