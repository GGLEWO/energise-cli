/*
 * @Author: guanyaoming guanyaoming@linklogis.com
 * @Date: 2022-11-10 17:38:25
 * @LastEditors: guanyaoming guanyaoming@linklogis.com
 * @LastEditTime: 2022-12-06 11:00:13
 * @FilePath: \energise-cli\bin\www.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
