import puppeteerv1 from "./types/puppeteerv1";
import puppeteerv2 from "./types/puppeteerv2";
import puppeteerv4 from "./types/puppeteerv4";
import puppeteerv5 from "./types/puppeteerv5";

export const pickScraper = (type) =>
  ((type) => {
    switch (type) {
      case "puppeteerv1" || "puppeteerv1.1":
        return puppeteerv1;
      case "puppeteerv2":
        return puppeteerv2;
      case "puppeteerv4":
        return puppeteerv4;
      case "puppeteerv5":
        return puppeteerv5;
      default:
        throw new Error("That routine doesn't exist!");
    }
  })(type);
