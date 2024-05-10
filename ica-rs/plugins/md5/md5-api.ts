const md5_module = require("./md5.js");
// import * as md5_module from "./md5.js";

/**
 * 对战结果的数据结构
 * 其实只有 source_plr 是有用的, 是赢家之一
 */
type FightResult = {
	message: string;
	source_plr: string;
	target_plr: string;
	affect: string | number;
};

/**
 * 每一行具体的胜率结果
 */
type WinRate = {
	round: number;
	win_count: number;
};

/**
 * 胜率的数据结构
 */
type WinRateResult = {
	win_count: number;
	raw_data: WinRate[];
};

/**
 * 用于接收胜率的回调函数
 * 返回一个 bool, true 表示继续, false 表示停止
 */
type WinRateCallback = (run_round: number, win_count: number) => boolean;

/**
 * 分数的数据结构
 */
type Score = {
	round: number;
	score: number;
};

/**
 * 分数的数据结构
 */
type ScoreResult = {
	score: number;
	raw_data: Score[];
};

/**
 * 用于接收分数的回调函数
 * 返回一个 bool, true 表示继续, false 表示停止
 */
type ScoreCallback = (run_round: number, score: number) => boolean;

/**
 *
 * @param names 原始的输入框输入
 * @returns 对战结果
 */
async function fight(names: string): Promise<FightResult> {
	// 检查一下输入是否合法
	// 比如里面有没有 !test!
	if (names.indexOf("!test!") !== -1) {
		throw new Error("你怎么在对战输入里加 !test!(恼)\n${names}");
	}
	return await md5_module.fight(names);
}

/**
 * 对于胜率/评分的输入检查
 * @param names
 * @returns
 */
function test_check(names: string): boolean {
	const have_test = names.trim().startsWith("!test!");

	return have_test;
}

/**
 * 测量胜率
 * @param names 原始的输入框输入
 * @param round 战斗的回合数
 * @returns 胜率结果
 */
async function win_rate(names: string, round: number): Promise<WinRateResult> {
	// 检查 round 是否合法
	if (round <= 0) {
		throw new Error("round 必须大于 0");
	}
	if (!test_check(names)) {
		throw new Error("你怎么在胜率输入里丢了 !test!(恼)\n${names}");
	}
	return await md5_module.win_rate(names, round);
}

/**
 *
 * @param names 原始的输入框输入
 * @param callback 用于接收胜率的回调函数
 * @returns 胜率结果
 */
async function win_rate_callback(
	names: string,
	callback: WinRateCallback,
): Promise<WinRateResult> {
	if (!test_check(names)) {
		throw new Error("你怎么在胜率输入里丢了 !test!(恼)\n${names}");
	}
	return await md5_module.win_rate_callback(names, callback);
}

async function score(names: string, round: number): Promise<ScoreResult> {
	// 检查 round 是否合法
	if (round <= 0) {
		throw new Error("round 必须大于 0");
	}
	if (!test_check(names)) {
		throw new Error("你怎么在分数输入里丢了 !test!(恼)\n${names}");
	}
	return await md5_module.score(names, round);
}

async function score_callback(
	names: string,
	callback: ScoreCallback,
): Promise<ScoreResult> {
	if (!test_check(names)) {
		throw new Error("你怎么在分数输入里加 !test!(恼)\n${names}");
	}
	return await md5_module.score_callback(names, callback);
}

async function run_any(names: string, round: number): Promise<FightResult | WinRateResult | ScoreResult> {
	return await md5_module.run_any(names, round);
}

const out_limit: number = 1000;

async function wrap_any(names: string, round: number): Promise<string> {
	const result = await run_any(names, round);
	if ('message' in result) {
		// 对战结果
		return `赢家:|${result.source_plr}|`;
	} else if ('win_count' in result) {
		// 胜率结果
		const win_rate = result.win_count * 100 / round;
		let win_rate_str = win_rate.toFixed(4);
		let output_str = `最终胜率:|${win_rate_str}%|(${round}轮)`;
		// 每 500 轮, 输出一次
		if (round > out_limit) {
			// 把所有要找的数据拿出来
			let output_datas: WinRate[] = [];
			result.raw_data.forEach((data, index) => {
				if (data.round % out_limit === 0) {
					output_datas.push(data);
				}
			});
			output_datas.forEach((data, index) => {
				const win_rate = data.win_count * 100 / data.round;
				output_str += `\n${win_rate.toFixed(2)}%(${data.round})`;
			});
		}
		return output_str;
	// } else if ('score' in result) {
	} else {
		// 分数结果其实还是个胜率, 不过需要 * 100
		const win_rate = (result.score * 10000 / round).toFixed(2);
		let output_str = `分数:|${win_rate}|(${round}轮)`;
		if (round > out_limit) {
			// 把所有要找的数据拿出来
			let output_datas: Score[] = [];
			result.raw_data.forEach((data, index) => {
				if (data.round % out_limit === 0) {
					output_datas.push(data);
				}
			});
			output_datas.forEach((data, index) => {
				const win_rate = (data.score / data.round * 10000).toFixed(2);
				output_str += `\n${win_rate}(${data.round})`;
			});
		}
		return output_str;
	}
}

async function main() {
	// 从相对位置导入内容
	const fs = require("fs");
	const path = require("path");

	const names = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
	// const result = await fight(names);
	// const result = await md5_module.run_any(names, 50000);
	// console.log(`赢家:|${result.source_plr}|`);
	const start_time = Date.now();
	const result = await wrap_any(names, 10000);
	const end_time = Date.now();
	console.log(result);
	console.log(`Node.js 耗时: ${end_time - start_time} ms`);
}

main();
