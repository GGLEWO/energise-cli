/*
 * @Author: guanyaoming
 * @Date: 2022-11-30 16:04:29
 * @LastEditors: guanyaoming guanyaoming@linklogis.com
 * @LastEditTime: 2024-01-10 20:11:07
 * @FilePath: \energise-cli\src\utils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const axios = require("axios");
const fsExtra = require("fs-extra");
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

async function downloadFile(fileUrl, outputPath) {
  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    console.log("请求成功", outputPath);
    if (outputPath) {
      await fsExtra.outputFile(outputPath, response.data);
    }
    return response.data;
  } catch (e) {
    console.error(`请求失败！ ${fileUrl} + ${e.message}`);
    return `文件下载失败 + ${fileUrl} + ${e.message}`;
  }
}

async function downloadFolder(repo, folderPath, localPath) {
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${folderPath}`;
  const response = await axios.get(apiUrl);
  const files = response.data;

  for (const file of files) {
    const filePath = path.join(localPath, file.path.replace(folderPath, ""));
    if (file.type === "file") {
      await downloadFile(file.download_url, filePath);
    } else if (file.type === "dir") {
      await downloadFolder(repo, file.path, filePath);
    }
  }
  return true;
}

module.exports = {
  removeDir,
  downloadFolder,
  downloadFile,
};
