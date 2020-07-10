import puppeteerv1 from "./types/puppeteerv1";
import puppeteerv2 from "./types/puppeteerv2";
import puppeteerv3 from "./types/puppeteerv3";
import puppeteerv4 from "./types/puppeteerv4";
import puppeteerv5 from "./types/puppeteerv5";
import puppeteerv6 from "./types/puppeteerv6";
import unlimitedv1 from "./types/unlimitedv1";
import unlimitedv2 from "./types/unlimitedv2";
import unlimitedv3 from "./types/unlimitedv3";
import unlimitedv4 from "./types/unlimitedv4";
import unlimitedv5 from "./types/unlimitedv5";
import unlimitedv6 from "./types/unlimitedv6";

export const pickScraper = (type) =>
  ((type) => {
    switch (type) {
      case "puppeteerv1" || "puppeteerv1.1":
        return puppeteerv1;
      case "puppeteerv2":
        return puppeteerv2;
      case "puppeteerv3":
        return puppeteerv3;
      case "puppeteerv4":
        return puppeteerv4;
      case "puppeteerv5":
        return puppeteerv5;
      case "puppeteerv6":
        return puppeteerv6;
      case "unlimitedv1":
        return unlimitedv1;
      case "unlimitedv2":
        return unlimitedv2;
      case "unlimitedv3":
        return unlimitedv3;
      case "unlimitedv4":
        return unlimitedv4;
      case "unlimitedv5":
        return unlimitedv5;
      case "unlimitedv6":
        return unlimitedv6;
      default:
        throw new Error("That routine doesn't exist!");
    }
  })(type);
