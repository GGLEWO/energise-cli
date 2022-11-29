/*
 * @Author: guanyaoming guanyaoming@linklogis.com
 * @Date: 2022-11-10 19:48:01
 * @LastEditors: guanym 1195817329@qq.com
 * @LastEditTime: 2022-11-29 20:49:34
 * @FilePath: \energise-cli\src\create.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const templateRepos = require("../templates.json");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

async function main() {
  let templateRepoNames = Object.keys(templateRepos);
  let tagetTempUrl = null;

  let answers = await inquirer.prompt([
    {
      type: "list",
      name: "tagetTempName",
      message: "请选择仓库模板",
      choices: templateRepoNames,
    },
  ]);
  tagetTempUrl = templateRepos[answers.tagetTempName][url];

  inquirer
    .prompt([
      {
        name: "name",
        message: "请输入项目名称",
        validate: function (val) {
          if (val) {
            return true;
          }
          return "请输入项目名称";
        },
      },
      { name: "description", message: "请输入项目描述" },
      { name: "author", message: "请输入作者" },
    ])
    .then((answers) => {
      const spinner = ora("项目模板下载中...");
      spinner.start();
      download(
        `direct:${tagetTempUrl}`,
        answers.name,
        { clone: true },
        (err) => {
          if (err) {
            spinner.fail();
            chalk.red(`项目生成失败：${err}`);
            return;
          }
          spinner.succeed();
          const packagePath = path.join(
            path.resolve("./"),
            `/${answers.name}/package.json`
          );
          const content = JSON.stringify(require(packagePath), "", "\t");
          const template = Handlebars.compile(content);
          const result = template(answers);
          fs.writeFileSync(packagePath, result);
        }
      );
    });
}

main();
