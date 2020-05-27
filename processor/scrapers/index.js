import basic from "./types/basic";

export const pickScraper = (type) =>
  ((type) => {
    switch (type) {
      case "puppeteerv1":
        return basic;
    }
  })(type);
