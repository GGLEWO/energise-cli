const fse = require("fs-extra");
const templateRepos = require("../templates.json");
const utils = require("./utils");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");
const path = require("path");
const Handlebars = require("handlebars");

async function main() {
  const routerPath = path.join(path.resolve("./"), `routes.js`);
  let routerContent = require(routerPath);
  console.log(routerContent, "routerContent");
  const optionsRoutes = routerContent.optionsRoutes;
  fse.outputFile(routerPath, optionsRoutes);
}

main();
