// import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: `./envs/.${process.env.NODE_ENV}.env` });

import Bull from "bull";
import { setupPuppeteer } from "./setup";
import { logger } from "./loggers/winston";
import { pickScraper } from "./scrapers";

const setup = async () => {
  try {
    var { browser, page } = await setupPuppeteer({ type: null });
  } catch (err) {
    logger.error("Could not setup browser.");
    throw err;
  }

  try {
    var queue = new Bull("myQueue", {
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

  return { queue, browser, page };
};

setup()
  .then(({ queue, browser }) => {
    logger.info("Processor successfully set up.");

    queue.process("*", async (job) => {
      try {
        const scraper = pickScraper(job.data.type);
        logger.info(
          `Running ${job.id} of type ${job.data.type} for ${job.data.name}`
        );
        const results = await scraper(browser, job.data, job.timestamp);

        logger.info(`Completed ${job.id} for ${job.data.collection}`);

        // Return the data and the job's data to the listener for parsing
        return {
          data: results,
          meta: job.data,
        };
      } catch (err) {
        let oldPages = await browser.pages();
        await Promise.all(
          oldPages.map(async (page, i) => i > 0 && (await page.close()))
        );
        logger.error(`Job ${job.id} could not be processed. `, err);
      }
    });
  })
  .catch((err) => {
    logger.error("There was an error with the processor. ", err);
    process.exit(1);
  });
