// const fs = require('fs');
// const path = require('path');
import fs from 'fs';
import path from 'path';
// const fight = require('./md5-api.ts').fight;
import { fight } from './md5-api.ts';

// 从文件的 ./input.txt 中读取输入
// 然后丢给 md5.js

async function main() {
  const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');
  const result = await fight(input);
  console.log(result);
}

main();
