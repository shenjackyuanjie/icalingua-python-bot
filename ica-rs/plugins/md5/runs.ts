const fs = require('fs');
const path = require('path');

import { fight } from "./md5-api";

// 从文件的 ./input.txt 中读取输入
// 然后丢给 md5.js

async function main() {
  const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');
  const result = await fight(input);
  console.log(result);
}

main();
