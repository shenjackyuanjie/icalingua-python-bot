var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var md5_module = require("./md5.js");
/**
 *
 * @param names 原始的输入框输入
 * @returns 对战结果
 */
function fight(names) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 检查一下输入是否合法
                    // 比如里面有没有 !test!
                    if (names.indexOf("!test!") !== -1) {
                        throw new Error("你怎么在对战输入里加 !test!(恼)\n${names}");
                    }
                    return [4 /*yield*/, md5_module.fight(names)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * 对于胜率/评分的输入检查
 * @param names
 * @returns
 */
function test_check(names) {
    var have_test = names.trim().startsWith("!test!");
    return have_test;
}
/**
 * 测量胜率
 * @param names 原始的输入框输入
 * @param round 战斗的回合数
 * @returns 胜率结果
 */
function win_rate(names, round) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 检查 round 是否合法
                    if (round <= 0) {
                        throw new Error("round 必须大于 0");
                    }
                    if (!test_check(names)) {
                        throw new Error("你怎么在胜率输入里丢了 !test!(恼)\n${names}");
                    }
                    return [4 /*yield*/, md5_module.win_rate(names, round)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 *
 * @param names 原始的输入框输入
 * @param callback 用于接收胜率的回调函数
 * @returns 胜率结果
 */
function win_rate_callback(names, callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!test_check(names)) {
                        throw new Error("你怎么在胜率输入里丢了 !test!(恼)\n${names}");
                    }
                    return [4 /*yield*/, md5_module.win_rate_callback(names, callback)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function score(names, round) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 检查 round 是否合法
                    if (round <= 0) {
                        throw new Error("round 必须大于 0");
                    }
                    if (!test_check(names)) {
                        throw new Error("你怎么在分数输入里丢了 !test!(恼)\n${names}");
                    }
                    return [4 /*yield*/, md5_module.score(names, round)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function score_callback(names, callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!test_check(names)) {
                        throw new Error("你怎么在分数输入里加 !test!(恼)\n${names}");
                    }
                    return [4 /*yield*/, md5_module.score_callback(names, callback)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function run_any(names, round) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, md5_module.run_any(names, round)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function wrap_any(names, round) {
    return __awaiter(this, void 0, void 0, function () {
        var result, win_rate_1, win_rate_str, output_str_1, output_datas_1, win_rate_2, output_str_2, output_datas_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, run_any(names, round)];
                case 1:
                    result = _a.sent();
                    if ('message' in result) {
                        // 对战结果
                        return [2 /*return*/, "\u8D62\u5BB6:|".concat(result.source_plr, "|")];
                    }
                    else if ('win_count' in result) {
                        win_rate_1 = result.win_count / round;
                        win_rate_str = win_rate_1.toFixed(4);
                        output_str_1 = "\u6700\u7EC8\u80DC\u7387:|".concat(win_rate_str, "|(").concat(round, "\u8F6E)");
                        // 每 500 轮, 输出一次
                        if (round > 500) {
                            output_datas_1 = [];
                            result.raw_data.forEach(function (data, index) {
                                if (data.round === 0) {
                                    output_datas_1.push(data);
                                }
                            });
                            output_datas_1.forEach(function (data, index) {
                                var win_rate = data.win_count / data.round;
                                output_str_1 += "\n".concat(win_rate.toFixed(2), "%(").concat(data.round, ")");
                            });
                        }
                        return [2 /*return*/, output_str_1];
                        // } else if ('score' in result) {
                    }
                    else {
                        win_rate_2 = (result.score * 10000 / round).toFixed(2);
                        output_str_2 = "\u5206\u6570:|".concat(win_rate_2, "|(").concat(round, "\u8F6E)");
                        if (round > 500) {
                            output_datas_2 = [];
                            result.raw_data.forEach(function (data, index) {
                                if (data.round % 500 === 0) {
                                    output_datas_2.push(data);
                                }
                            });
                            output_datas_2.forEach(function (data, index) {
                                var win_rate = (data.score / data.round * 10000).toFixed(2);
                                output_str_2 += "\n".concat(win_rate, "(").concat(data.round, ")");
                            });
                        }
                        return [2 /*return*/, output_str_2];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, path, names, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = require("fs");
                    path = require("path");
                    names = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf-8");
                    return [4 /*yield*/, wrap_any(names, 10000)];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
main();
