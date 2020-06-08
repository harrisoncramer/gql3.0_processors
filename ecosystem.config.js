require("dotenv").config({ path: `./envs/.env.production` });
const path = require("path");

let hosts = process.env.HOSTS.split(",");
let hostsBashArgs = process.env.HOSTS.replace(/,/g, " "); // Pass as args to bash script

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME,
      args: ["--color"],
      interpreter: process.env.NODE_PATH, // Local installation of node
      cwd: path.resolve(process.env.PROJECT_PATH, "current"), // Where post-deploy runs
      script: "dist/index.js", // Webpacked server file
      instances: process.env.INSTANCES || 0,
      exec_mode: "cluster",
      env: {
        ...process.env,
      },
    },
  ],
  deploy: {
    production: {
      user: "harrison",
      host: hosts,
      key: "~/.ssh/id_rsa2",
      ref: "origin/master",
      repo: process.env.GIT_REPO,
      path: process.env.PROJECT_PATH,
      /// Install Linux dependencies
      "pre-setup":
        "sudo apt install gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm1",
      "pre-deploy-local": `./deployEnvs.sh ${process.env.PROJECT_PATH} ${hostsBashArgs}`,
      "post-deploy": `source ~/.zshrc && \
       yarn install --ignore-engines && \
       yarn prod:build && \
       yarn prod:serve`,
    },
  },
};
