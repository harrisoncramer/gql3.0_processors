import basic from "./types/basic";

export const pickScraper = (data) =>
  ((collection) => {
    switch (collection) {
      case "hfac":
        return basic;
    }
  })(data.collection);
