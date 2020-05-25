export const hfac = async (page, data) => {
  await page.goto(data.link);
  return { data: "OK" };
};
