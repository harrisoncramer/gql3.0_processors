import puppeteerv1 from "./types/puppeteerv1";
import puppeteerv2 from "./types/puppeteerv2";
import puppeteerv3 from "./types/puppeteerv3";

export const pickScraper = (type) =>
  ((type) => {
    switch (type) {
      case "puppeteerv1":
        return puppeteerv1;
      case "puppeteerv2":
        return puppeteerv2;
      case "puppeteerv3":
        return puppeteerv3;
    }
  })(type);
