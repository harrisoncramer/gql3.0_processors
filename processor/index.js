// import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: `./envs/.env.${process.env.NODE_ENV}` });

import Bull from "bull";
import { setupPuppeteer } from "./setup";
import { logger } from "./loggers/winston";
import { pickScraper } from "./scrapers";

const setup = async () => {
  try {
    var { browser, page } = await setupPuppeteer({
      type: process.env.PUPPETEER_TYPE,
    });
  } catch (err) {
    logger.error("Could not setup browser. ", err);
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
    logger.error("Could not connect to queue. ", err);
    throw err;
  }

  return { queue, browser, page };
};

setup()
  .then(({ queue, browser }) => {
    logger.info("Processor successfully set up.");

    queue.process("*", async (x) => {
      let job = x.data;
      try {
        const scraper = pickScraper(job.type);
        logger.info(`Running ${x.id} of type ${job.type} for ${job.name}`);
        const results = await scraper(browser, job, job.timestamp);

        logger.info(`Completed ${x.id} for ${job.collection}`);

        // Return the data and the job's meta-information to the listener for parsing
        return {
          data: results,
          meta: job,
        };
      } catch (err) {
        let oldPages = await browser.pages();
        await Promise.all(
          oldPages.map(async (page, i) => i > 0 && (await page.close()))
        );
        logger.error(`Job ${x.id} could not be processed. `, err);
      }
    });
  })
  .catch((err) => {
    logger.error("There was an error with the processor. ", err);
    process.exit(1);
  });
