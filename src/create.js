const esprima = require("esprima");
const estraverse = require("estraverse");
const templateRepos = require("../templates.json");
const { downloadFolder, downloadFile } = require("./utils");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");
const path = require("path");
const Handlebars = require("handlebars");
const fse = require("fs");
const axios = require("axios");

async function main() {
  let templateRepoNames = Object.keys(templateRepos);
  let answers = await inquirer.prompt([
    {
      type: "list",
      name: "tagetTempName",
      message: "请选择模板类型",
      choices: templateRepoNames,
    },
  ]);
  const typeContent = templateRepos[answers.tagetTempName];
  switch (answers.tagetTempName) {
    case "project":
      handleProjectCase(typeContent);
      break;

    case "module":
      handleModuleCase(typeContent);
      break;
    case "snippet":
      handleSnippetCase(typeContent);
  }

  function handleProjectCase(typeContent) {
    const handleInitProject = function (answers) {
      // 处理 package.json 文件，更换模板内容
      const packagePath = path.join(
        path.resolve("./"),
        `/${answers.name}/package.json`
      );
      const content = JSON.stringify(require(packagePath), "", "\t");
      const template = Handlebars.compile(content);
      const result = template(answers);
      fse.writeFile(packagePath, result, (err) => {
        if (err) {
          return console.error(err);
        }
      });
    };
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
          name: "option",
          message: "请选择项目模板",
          type: "list",
          choices: typeContent.option,
        },
      ])
      .then((answers) => {
        console.log(answers, answers.option, "answers");
        const spinner = ora("项目模板下载中...");
        spinner.start();
        download(
          `direct:${answers.option}#master`,
          answers.name,
          { clone: true },
          (err) => {
            if (err) {
              chalk.red(`项目生成失败：${err}`);
              spinner.fail();
              return;
            }
            spinner.succeed();
            handleInitProject(answers, typeContent);
          }
        );
      });
  }

  async function handleModuleCase(typeContent) {
    inquirer
      .prompt([
        {
          name: "option",
          message: "请选择引入模块",
          type: "list",
          choices: typeContent.option,
        },
        { name: "outputPath", message: "请输入目标路径" },
      ])
      .then(async (answers) => {
        console.log(answers, answers.option, "answers");
        const spinner = ora("模块文件下载中...");
        spinner.start();
        try {
          await downloadFolder(
            answers.option[0],
            answers.option[1],
            answers.outputPath
          );
          spinner.succeed();
        } catch (e) {
          chalk.red(`项目生成失败：${err}`);
          spinner.fail();
        }
      });
  }

  async function handleModuleCase(typeContent) {
    inquirer
      .prompt([
        {
          name: "option",
          message: "请选择引入模块",
          type: "list",
          choices: typeContent.option,
        },
        { name: "outputPath", message: "请输入目标路径" },
      ])
      .then(async (answers) => {
        console.log(answers, answers.option, "answers");
        const spinner = ora("模块文件下载中...");
        spinner.start();
        try {
          await downloadFolder(
            answers.option[0],
            answers.option[1],
            answers.outputPath
          );
          spinner.succeed();
        } catch (e) {
          chalk.red(`模块文件下载失败：${err}`);
          spinner.fail();
        }
      });
  }

  async function handleSnippetCase(typeContent) {
    inquirer
      .prompt([
        {
          name: "option",
          message: "请选择代码片段",
          type: "list",
          choices: typeContent.option,
        },
      ])
      .then(async (answers) => {
        console.log(answers, answers.option, "answers");
        const spinner = ora("代码片段下载中...");
        spinner.start();
        try {
          let response = await axios.get(
            `https://api.github.com/repos/${answers.option[0]}/contents/${answers.option[1]}`
          );
          let downContent = await downloadFile(response.data.download_url);
          let fileContent = Buffer.from(downContent).toString("utf-8");
          let resultContent = null;
          console.log(
            fileContent,
            answers.option[2].functionName,
            "fileContent"
          );
          // 解析代码
          const ast = esprima.parseModule(fileContent, { range: true });
          estraverse.traverse(ast, {
            enter: function (node) {
              if (
                node.type === "FunctionDeclaration" &&
                node.id.name === answers.option[2].functionName
              ) {
                resultContent = fileContent.substring(
                  node.range[0],
                  node.range[1]
                );
                return estraverse.VisitorOption.Break; // 找到后中断遍历
              }
            },
          });
          console.log(resultContent, "resultContent 结果");
          (async () => {
            const clipboardy = await import('clipboardy');
            clipboardy.default.writeSync(resultContent);
          })();
          chalk.green(`${answers.option[2].functionName} 函数已经复制到剪切板`);
          spinner.succeed();
        } catch (e) {
          chalk.red(`代码片段下载失败：${e.message}`);
          spinner.fail();
        }
      });
  }
}

main();
