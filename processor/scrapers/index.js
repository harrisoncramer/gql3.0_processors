import puppeteerv1 from "./types/puppeteerv1";
import puppeteerv2 from "./types/puppeteerv2";

export const pickScraper = (type) =>
  ((type) => {
    switch (type) {
      case "puppeteerv1":
        return puppeteerv1;
      case "puppeteerv2":
        return puppeteerv2;
    }
  })(type);
