// import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: `./envs/.${process.env.NODE_ENV}.env` });

import Bull from "bull";
import { setupPuppeteer } from "./setup";
import { logger } from "./loggers/winston";
import { pickScraper } from "./scrapers";

const server = async () => {
  try {
    var { browser, page } = await setupPuppeteer({ type: "tor" });
  } catch (err) {
    logger.error("Could not setup browser.");
    throw err;
  }

  try {
    var myQueue = new Bull("myQueue", {
      redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
      },
    });
    logger.info("Connected to queue from job producer.");
  } catch (err) {
    logger.error("Could not connect to queue.");
    throw err;
  }

  myQueue.process(async (job) => {
    try {
      let data = job.data;
      logger.info(`Running ${job.id} for ${data.collection}`);
      const scraper = pickScraper(data);
      let results = await scraper(page, data, job.timestamp);
      logger.info(`Completed ${job.id} for ${data.collection}`);
      return results; // Return the results to the Redis cache.
    } catch (err) {
      logger.error(`Job ${job.id} could not be processed. `, err);
      throw err;
    }
  });
};

server()
  .then(() => {
    logger.info("Processor successfully set up.");
  })
  .catch((err) => {
    logger.error("There was an error", err);
    process.exit(1);
  });
