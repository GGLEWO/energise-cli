/*
 * @Author: guanyaoming
 * @Date: 2022-11-30 16:04:29
 * @LastEditors: guanyaoming
 * @LastEditTime: 2022-11-30 16:19:30
 * @FilePath: \energise-cli\src\utils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const fs = require("fs");
const path = require("path");
const removeDir = function (dir) {
  let files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath);
    if (stat.isDirectory()) {
      //如果是文件夹就递归下去
      removeDir(newPath);
    } else {
      //删除文件
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
};

module.exports.removeDir = removeDir;
