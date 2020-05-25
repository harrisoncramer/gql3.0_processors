import { hfac } from "./guts";

export const pickScraper = (data) =>
  ((collection) => {
    switch (collection) {
      case "hfac":
        return hfac;
    }
  })(data.collection);
