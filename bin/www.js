#!/usr/bin/env node
const program = require("commander");
const version = require("../package.json").version;

// 定义当前版本
program.version(version, "-v, --version");

// 定义使用方法
program
  .command("create")
  .description("energise-cli创建一个新的模板项目")
  .action(() => {
    require("../src/create");
  });

program
  .command("list")
  .description("可用模板列表")
  .action(() => {
    require("../src/list");
  });

// 必须，用于解析用户命令输入内容
program.parse(process.argv);
if (!program.args.length) {
  program.help();
}
