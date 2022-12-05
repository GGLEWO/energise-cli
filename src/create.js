/*
 * @Author: guanyaoming guanyaoming@linklogis.com
 * @Date: 2022-11-10 19:48:01
 * @LastEditors: guanyaoming guanyaoming@linklogis.com
 * @LastEditTime: 2022-12-05 17:06:10
 * @FilePath: \energise-cli\src\create.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const templateRepos = require("../templates.json");
const utils = require("./utils");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");
const path = require("path");
const Handlebars = require("handlebars");
const fse = require("fs-extra");

const handleInitProject = function (answers, targetTemp) {
  // 处理 package.json 文件
  const packagePath = path.join(
    path.resolve("./"),
    `/${answers.name}/package.json`
  );
  const content = JSON.stringify(require(packagePath), "", "\t");
  const template = Handlebars.compile(content);
  const result = template(answers);
  fse.outputFile(packagePath, result);

  const choicedMoudleLabel = answers.moduleArr.map((e) => e?.label);

  // 处理路由文件
  const routerPath = path.join(
    path.resolve("./"),
    `/${answers.name}/src/router/routes.js`
  );
  let routerContent = require(routerPath);
  const optionsRoutes = routerContent.optionsRoutes
    .map((e) => {
      if (choicedMoudleLabel.includes(e.name)) return e;
    })
    .filter((v) => v);
  fse.writeFile(
    routerPath,
    `exports.optionsRoutes = ${JSON.stringify(optionsRoutes, "", "\t")}`
  );

  // 处理 views 文件夹
  const targetPath = path.join(path.resolve("./"), `/${answers.name}`);
  const targetTempModule = targetTemp.moduleArr;
  /**
   * @description: 需要删除的目录
   * @return {*}
   */
  let needDelDirList = targetTempModule.filter(
    (e) => !choicedMoudleLabel.includes(e.value.label)
  );
  needDelDirList.forEach((val) => {
    utils.removeDir(`${targetPath}${val.value.filePath}`);
  });
};

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
  const targetTemp = templateRepos[answers.tagetTempName];
  inquirer
    .prompt([
      {
        name: "name",
        message: "请输入项目名称",
        validate: function (val) {
          if (!/^[a-z0-9-~][a-z0-9-._~]*$/.test(val)) {
            return "/^[a-z0-9-~][a-z0-9-._~]*$/ 请按该规则创建项目名称";
          }
          if (val) {
            return true;
          }

          return "请输入项目名称";
        },
      },
      { name: "description", message: "请输入项目描述" },
      { name: "author", message: "请输入作者" },
      {
        name: "moduleArr",
        message: "请选择需要的菜单模块",
        type: "checkbox",
        choices: targetTemp.moduleArr,
      },
    ])
    .then((answers) => {
      console.log(answers, "answers");
      const spinner = ora("项目模板下载中...");
      spinner.start();
      download(
        `direct:${targetTemp.url}#master-tem`,
        answers.name,
        { clone: true },
        (err) => {
          if (err) {
            chalk.red(`项目生成失败：${err}`);
            spinner.fail();
            return;
          }
          spinner.succeed();
          handleInitProject(answers, targetTemp);
        }
      );
    });
}

main();
