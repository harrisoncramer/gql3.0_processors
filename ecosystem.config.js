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
      "pre-setup": "source ~/.zshrc",
      "pre-deploy-local": `./deployEnvs.sh ${process.env.PROJECT_PATH} ${hostsBashArgs}`,
      "post-deploy": `source ~/.zshrc && \
       yarn install --ignore-engines && \
       yarn prod:build && \
       yarn prod:serve`,
    },
  },
};
