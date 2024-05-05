const _version_ = "0.1.0";

// let name_input = "!test!\n\natest\n\ntest2";
// let name_input = "!test!\n\nthis_is_a";
// let name_input = "!test!\n!\n\nthis_is_a";
let name_input = "";
// let name_input = `
// '9tEUG@LuoTianyi
// t2W%(s@LuoTianyi
// mTWD1soR原创@LuoTianyi

// 天依 VEfVDZVpD@candle
// 凶镬9aY5DnWAq@candle
// Raven qPu%yV$O@candle

// seed:自生自灭 #1@!`;

const assets_data = {
    lang: null,
    gAd: null,
};

const run_env = {
    from_code: typeof window === "undefined",
    is_node: typeof Bun === "undefined",
    is_bun: typeof Bun !== "undefined",
    cli_args: [],
};

/**
 * 为啥我写 JavaScript 也开始写上 logger 了 (恼)
 */
const logger = {
    // 是否启用 logger
    enable: true,
    // 显示等级
    //
    level: 30,
    // 是否显示 trace 信息
    show_trace: function () {
        return this.level <= 10 && this.enable;
    },
    // 是否显示 debug 信息
    show_debug: function () {
        return this.level <= 20 && this.enable;
    },
    // 是否显示 info 信息
    show_info: function () {
        return this.level <= 30 && this.enable;
    },
    // 是否显示 warn 信息
    show_warn: function () {
        return this.level <= 40 && this.enable;
    },
    /**
     * 在控制台输出一条 trace 信息
     * @param  {...any} msg
     */
    trace: function (...msg) {
        if (this.show_trace()) {
            // 上个色
            console.log("\x1b[35m", ...msg, "\x1b[0m");
        }
    },
    /**
     * 在控制台输出一条 debug 信息
     * @param  {...any} msg
     */
    debug: function (...msg) {
        if (this.show_debug()) {
            // 上个色
            console.log("\x1b[32m", ...msg, "\x1b[0m");
        }
    },
    /**
     * 在控制台输出一条 info 信息
     * @param  {...any} msg
     */
    info: function (...msg) {
        if (this.show_info()) {
            console.log(...msg);
        }
    },
    /**
     * 在控制台输出一条 warn 信息
     * @param  {...any} msg
     */
    warn: function (...msg) {
        if (this.show_warn()) {
            // 上个色
            console.log("\x1b[31mwarn: ", ...msg, "\x1b[0m");
        }
    },
};

/**
 *
 * @param {T.RunUpdate} update
 * @returns {message: string, source_plr: string, target_plr: string, affect: string}
 */
function fmt_RunUpdate(update) {
    const message = update.d;
    let source_plr = "none";
    if (update.e !== null && update.e.a !== null) {
        source_plr = update.e.a;
    }
    let target_plr = update.f;
    if (target_plr !== null && target_plr.a !== null) {
        target_plr = target_plr.a;
    } else {
        target_plr = "none";
    }
    let affect = update.x;
    if (affect !== null && affect.a !== null) {
        affect = affect.a;
    } else {
        affect = "none";
    }
    return {
        message: message,
        source_plr: source_plr,
        target_plr: target_plr,
        affect: affect,
    };
}

if (run_env.from_code) {
    // console.log("正在运行 md5.js 作为单独的脚本");
    // console.log("版本号: " + _version_);

    const fs = require("fs");
    const path = require("path");
    const EventEmitter = require("events");
    const finish_trigger = new EventEmitter();
    global.finish_trigger = finish_trigger;
    
    // 读取 input.txt
    // 从当前脚本的相对路径读取
    const input_path = path.join(__dirname, "input.txt");
    // 从 cli 参数里读取
    // const input_path = run_env.cli_args[2];
    logger.debug("input_path", input_path);
    const input_data = fs.readFileSync(input_path, "utf-8");
    name_input = input_data;

    // 把 cli 参数传进来
    run_env.cli_args = process.argv;

    // 整一套虚拟的window和document
    // 但说实话十分生草

    // list of elements
    const stored_elements = [];

    global.window = {
        sessionStorage: () => { },
        localStorage: () => { },
    };

    class fake_class_list {
        constructor() {
            this.datas = [];
        }
        add(data) {
            this.datas.push(data);
        }
        contains(data) {
            return this.datas.includes(data);
        }
        item(index) {
            if (index >= this.datas.length) {
                const stack = new Error().stack;
                logger.warn("fake_class_list.item", stack);
                return null;
            }
            return this.datas[index];
        }
    }

    class fake_element {
        constructor(tag) {
            this.childList = [];
            this.tag = tag;
            this.width = 0;
            this.height = 0;
            this.style = {};
            this.classList = new fake_class_list();
            this.styleSheets = ["something"];
            this.length = 0;
            this.innerHTML = "";
            // 把自己加到列表里
            stored_elements.push(this);
        }
        querySelector(tag) {
            // 搜索一下有没有这个元素
            for (let i = 0; i < this.childList.length; i++) {
                if (this.childList[i].tag === tag) {
                    return this.childList[i];
                }
            }
        }
        appendChild(element) {
            this.childList.push(element);
        }
        addEventListener() { }
    }

    global.document = {
        createElement: (tag) => {
            // return fake_element.fake_init(tag);
            return new fake_element(tag);
        },
        createTextNode: (data) => {
            const node = new fake_element("text");
            node.innerHTML = data;
            return node;
        },
        querySelector: (tag) => {
            // 搜索一下有没有这个元素
            logger.debug("querySelector", tag);
            for (let i = 0; i < stored_elements.length; i++) {
                if (stored_elements[i].tag === tag) {
                    return stored_elements[i];
                }
            }
        },
        body: new fake_element("body"),
        styleSheets: [
            {
                some: "thing",
            },
        ],
    };

    document.createElement(".plist");
    document.createElement(".pbody");
    // logger.debug(stored_elements)

    global.self = global.window;

    // 读取文件
    const assets_path = path.join(__dirname, "assets");

    // 加载 zh.json
    const lang_path = path.join(assets_path, "zh.json");
    const lang_data = fs.readFileSync(lang_path, "utf-8");
    assets_data.lang = lang_data;

    // 加载 gAd.md
    const gAd_path = path.join(assets_path, "gAd.md");
    const gAd_data = fs.readFileSync(gAd_path, "utf-8");
    assets_data.gAd = gAd_data;
}

// console.log("run env", run_env);

let why_ns = 0;

function copyProperties(a, b) {
    var s = Object.keys(a);
    for (var r = 0; r < s.length; r++) {
        var q = s[r];
        b[q] = a[q];
    }
}

function mixinProperties(from, to) {
    var s = Object.keys(from);
    for (var r = 0; r < s.length; r++) {
        var q = s[r];
        if (!to.hasOwnProperty(q)) to[q] = from[q];
    }
}

function inherit(cls, sup) {
    cls.prototype.constructor = cls;
    cls.prototype["$i" + cls.name] = cls;
    if (sup != null) {
        cls.prototype.__proto__ = sup.prototype;
        return;
    }
}

function inheritMany(sup, classes) {
    for (var s = 0; s < classes.length; s++) inherit(classes[s], sup);
}

function mixin(cls, mixin) {
    mixinProperties(mixin.prototype, cls.prototype);
    cls.prototype.constructor = cls;
}

function lazyOld(holder, name, getterName, initializer) {
    var uninitializedSentinel = holder;
    holder[name] = uninitializedSentinel;
    holder[getterName] = () => {
        holder[getterName] = () => {
            H.throwCyclicInit(name);
        };
        var result;
        var sentinelInProgress = initializer;
        try {
            if (holder[name] === uninitializedSentinel) {
                result = holder[name] = sentinelInProgress;
                result = holder[name] = initializer();
            } else result = holder[name];
        } finally {
            if (result === sentinelInProgress) holder[name] = null;
            holder[getterName] = function () {
                return this[name];
            };
        }
        return result;
    };
}

function lazy(holder, name, getterName, initializer) {
    var uninitializedSentinel = holder;
    holder[name] = uninitializedSentinel;
    holder[getterName] = () => {
        if (holder[name] === uninitializedSentinel) holder[name] = initializer();
        holder[getterName] = function () {
            return this[name];
        };
        return holder[name];
    };
}

function lazyFinal(holder, name, getterName, initializer) {
    var uninitializedSentinel = holder;
    holder[name] = uninitializedSentinel;
    holder[getterName] = () => {
        if (holder[name] === uninitializedSentinel) {
            var value = initializer();
            if (holder[name] !== uninitializedSentinel)
                H.throwLateInitializationError(name);
            holder[name] = value;
        }
        holder[getterName] = function () {
            return this[name];
        };
        return holder[name];
    };
}

function makeConstList(list) {
    list.immutable$list = Array;
    list.fixed$length = Array;
    return list;
}

var y = 0;

function instanceTearOffGetter(a, b) {
    var s = b.fs[0];
    if (a)
        return new Function(
            "parameters, createTearOffClass, cache",
            "return function tearOff_" +
            s +
            y++ +
            "(receiver) {" +
            "if (cache === null) cache = createTearOffClass(parameters);" +
            "return new cache(receiver, this);" +
            "}",
        )(b, H.mx, null);
    else
        return new Function(
            "parameters, createTearOffClass, cache",
            "return function tearOff_" +
            s +
            y++ +
            "() {" +
            "if (cache === null) cache = createTearOffClass(parameters);" +
            "return new cache(this, null);" +
            "}",
        )(b, H.mx, null);
}

function staticTearOffGetter(a) {
    var s = null;
    return () => {
        if (s === null) s = H.mx(a).prototype;
        return s;
    };
}
var x = 0;

function tearOffParameters(a, b, c, d, e, f, g, h, i, j) {
    if (typeof h == "number") h += x;
    return {
        co: a,
        iS: b,
        iI: c,
        rC: d,
        dV: e,
        cs: f,
        fs: g,
        fT: h,
        aI: i || 0,
        nDA: j,
    };
}

function installStaticTearOff(a, b, c, d, e, f, g, h) {
    var s = tearOffParameters(a, true, false, c, d, e, f, g, h, false);
    var r = staticTearOffGetter(s);
    a[b] = r;
}

function installInstanceTearOff(a, b, c, d, e, f, g, h, i, j) {
    c = !!c;
    var s = tearOffParameters(a, false, c, d, e, f, g, h, i, !!j);
    var r = instanceTearOffGetter(c, s);
    a[b] = r;
}

function setOrUpdateInterceptorsByTag(a) {
    var s = init.interceptorsByTag;
    if (!s) {
        init.interceptorsByTag = a;
        return;
    }
    copyProperties(a, s);
}

function setOrUpdateLeafTags(a) {
    var s = init.leafTags;
    if (!s) {
        init.leafTags = a;
        return;
    }
    copyProperties(a, s);
}

function updateTypes(a) {
    var s = init.types;
    var r = s.length;
    s.push.apply(s, a);
    return r;
}

function updateHolder(a, b) {
    copyProperties(b, a);
    return a;
}
var hunkHelpers = (() => {
    var s = (a, b, c, d, e) => (f, g, h, i) =>
        installInstanceTearOff(f, g, a, b, c, d, [h], i, e, false),
        r = (a, b, c, d) => (e, f, g, h) =>
            installStaticTearOff(e, f, a, b, c, [g], h, d);
    return {
        inherit: inherit,
        inheritMany: inheritMany,
        mixin: mixin,
        installStaticTearOff: installStaticTearOff,
        installInstanceTearOff: installInstanceTearOff,
        _instance_0u: s(0, 0, null, ["$0"], 0),
        _instance_1u: s(0, 1, null, ["$1"], 0),
        _instance_2u: s(0, 2, null, ["$2"], 0),
        _instance_0i: s(1, 0, null, ["$0"], 0),
        _instance_1i: s(1, 1, null, ["$1"], 0),
        _instance_2i: s(1, 2, null, ["$2"], 0),
        _static_0: r(0, null, ["$0"], 0),
        _static_1: r(1, null, ["$1"], 0),
        _static_2: r(2, null, ["$2"], 0),
        makeConstList: makeConstList,
        lazy: lazy,
        lazyFinal: lazyFinal,
        lazyOld: lazyOld,
        updateHolder: updateHolder,
        updateTypes: updateTypes,
        setOrUpdateInterceptorsByTag: setOrUpdateInterceptorsByTag,
        setOrUpdateLeafTags: setOrUpdateLeafTags,
    };
})();

var A = {
    eR(a) {
        var s = window.localStorage,
            r = LangData.eQ("i");
        s.setItem(r, a);
        s = $.nx();
        r = s.b;
        if (r >= 4) H.throw_expression(s.ee());
        if ((r & 1) !== 0) s.cc(a);
        else if ((r & 3) === 0) s.en().j(0, new P.er(a));
    },
    vo(a) {
        var s = $.nx();
        s.toString;
        new P.cM(s, H._instanceType(s).i("cM<1>")).f4(a);
        return;
    },
};
var C = {};

var Sgls = {
    o6(a) {
        var s, r, q;
        if ($.k8.J(0, a)) return $.k8.h(0, a);
        s = $.e_;
        $.e_ = s + 1;
        r = "icon_" + s;
        $.k8.m(0, a, r);
        q = Sgls.tt(a).toDataURL("image/png", null);
        $.mg.m(0, a, q);
        t.w
            .a(C.v.gbl(document.styleSheets))
            .insertRule(
                "div." + r + ' { background-image:url("' + H.as_string(q) + '"); }',
                $.e_ - 1,
            );
        return r;
    },
    tw() {
        $.rW.aw(0, new Sgls.k7());
    },
    tv(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f = W.j4();
        f.width = 128;
        f.height = 128;
        f.getContext("2d").drawImage($.md, 0, 0);
        s = J.cm(P.my(f.getContext("2d").getImageData(0, 0, 128, 128)));
        for (r = t.i, q = 0; q < 38; ++q) {
            p = C.JsInt.V(q, 8) * 64 + C.JsInt.ag(q, 8) * 8192;
            o = H.b([], r);
            for (n = 0; n < 16; ++n)
                for (m = n * 512, l = 0; l < 16; ++l) {
                    k = p + l * 4 + m;
                    j = s[k];
                    if (j > s[k + 1]) o.push(j);
                    else o.push(0);
                }
            $.dZ.push(o);
        }
        for (q = 0; q < 8; ++q) {
            p = q * 64 + 57344;
            i = H.b([], r);
            h = H.b([], r);
            for (n = 0; n < 16; ++n)
                for (m = n * 512, l = 0; l < 16; ++l) {
                    k = p + l * 4 + m;
                    j = s[k];
                    g = k + 1;
                    if (j > s[g]) i.push(j);
                    else i.push(0);
                    j = s[g];
                    if (j > s[k + 2]) h.push(255 - j);
                    else h.push(255);
                }
            $.me.push(i);
            $.o5.push(h);
        }
        $.nt().bM(0, "");
    },
    tt(a) {
        var s,
            r,
            q = new LangData.SuperRC4();
        q.bd(LangData.fZ(a), 2);
        s = q.c;
        s.toString;
        r = H._arrayInstanceType(s).i("y<1,l*>");
        return Sgls.ts(
            P.List_List_of(new H.y(s, new Sgls.k5(), r), true, r.i("M.E")),
        );
    },
    ts(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f = C.d.V(a[0], $.me.length),
            e = t.i,
            d = H.b([], e);
        d.push(C.d.V(a[1], $.dZ.length));
        s = a[2];
        r = $.dZ.length;
        q = C.d.V(s, r);
        if (q === d[0]) {
            q = C.d.V(a[3], r);
            p = 4;
        } else p = 3;
        d.push(q);
        o = p + 1;
        if (a[p] < 4) {
            p = o + 1;
            d.push(C.d.V(a[o], $.dZ.length));
            o = p + 1;
            if (a[p] < 64) {
                p = o + 1;
                d.push(C.d.V(a[o], $.dZ.length));
            } else p = o;
        } else p = o;
        n = $.nu().getContext("2d");
        o = p + 1;
        m = C.d.V(a[p], $.d7() - 6);
        l = $.mf[m];
        s = l[0];
        r = l[1];
        k = l[2];
        n.toString;
        n.fillStyle = "rgba(" + s + ", " + r + ", " + k + ", 1)";
        n.fillRect(1, 1, 14, 14);
        j = H.b([], e);
        i = new Sgls.k6(j, m, d);
        for (p = o, h = 0; h < d.length; ++h) {
            o = p + 1;
            g = C.d.V(a[p], $.d7());
            for (p = o; !i.$1(g); p = o) {
                o = p + 1;
                g = C.d.V(a[p], $.d7());
            }
            j.push(g);
            Sgls.o4(n, $.dZ[d[h]], $.mf[g]);
        }
        Sgls.tu(n, f);
        return $.nu();
    },
    o4(a, b, c) {
        var s, r, q, p, o;
        for (s = 0, r = 0, q = 0; q < 16; ++q)
            for (p = 0; p < 16; ++p) {
                o = r + 3;
                if (b[s] > 0) {
                    J.cm($.d8())[r] = c[0];
                    J.cm($.d8())[r + 1] = c[1];
                    J.cm($.d8())[r + 2] = c[2];
                    J.cm($.d8())[o] = b[s];
                } else J.cm($.d8())[o] = 0;
                ++s;
                r += 4;
            }
        o = $.lS().getContext("2d");
        (o && C.k).dw(o, $.d8(), 0, 0);
        a.drawImage($.lS(), 0, 0);
    },
    tu(a, b) {
        var s, r, q, p;
        Sgls.o4(a, $.me[b], H.b([64, 64, 64], t.i));
        s = P.my(a.getImageData(0, 0, 16, 16));
        r = $.o5[b];
        for (q = J.bv(s), p = 0; p < 256; ++p) q.gck(s)[p * 4 + 3] = r[p];
        C.k.dw(a, s, 0, 0);
    },
    k7: function k7() { },
    k4: function k4() { },
    k5: function k5() { },
    k6: function k6(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    },
    MList: function c(a) {
        this.a = 0;
        this.c = this.b = null;
        this.$ti = a;
    },
    a_: function a_(a, b, c) {
        this.a = a;
        this.b = null;
        this.c = b;
        this.$ti = c;
    },
    MEntry: function n() { },
};
var H = {
    m8: function m8() { },
    ls(a, b, c) {
        if (a == null) throw H.wrap_expression(new H.dO(b, c.i("dO<0>")));
        return a;
    },
    t5(a, b, c, d) {
        if (t.gw.b(a)) return new H.dr(a, b, c.i("@<0>").aL(d).i("dr<1,2>"));
        return new H.c6(a, b, c.i("@<0>").aL(d).i("c6<1,2>"));
    },
    fu() {
        return new P.bJ("No element");
    },
    rY() {
        return new P.bJ("Too many elements");
    },
    tJ(a, b) {
        // H.hL(a, 0, J.aw(a) - 1, b)
        H.hL(a, 0, a.length - 1, b);
    },
    hL(a, b, c, d) {
        if (c - b <= 32) H.ej(a, b, c, d);
        else H.ei(a, b, c, d);
    },
    ej(a, b, c, d) {
        var s, r, q, p, o;
        for (s = b + 1, r = J.a3(a); s <= c; ++s) {
            q = r.h(a, s);
            p = s;
            while (true) {
                if (!(p > b && d.$2(r.h(a, p - 1), q) > 0)) break;
                o = p - 1;
                r.m(a, p, r.h(a, o));
                p = o;
            }
            r.m(a, p, q);
        }
    },
    ei(a3, a4, a5, a6) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i = C.JsInt.ag(a5 - a4 + 1, 6),
            h = a4 + i,
            g = a5 - i,
            f = C.JsInt.ag(a4 + a5, 2),
            e = f - i,
            d = f + i,
            c = J.a3(a3),
            b = c.h(a3, h),
            a = c.h(a3, e),
            a0 = c.h(a3, f),
            a1 = c.h(a3, d),
            a2 = c.h(a3, g);
        if (a6.$2(b, a) > 0) {
            s = a;
            a = b;
            b = s;
        }
        if (a6.$2(a1, a2) > 0) {
            s = a2;
            a2 = a1;
            a1 = s;
        }
        if (a6.$2(b, a0) > 0) {
            s = a0;
            a0 = b;
            b = s;
        }
        if (a6.$2(a, a0) > 0) {
            s = a0;
            a0 = a;
            a = s;
        }
        if (a6.$2(b, a1) > 0) {
            s = a1;
            a1 = b;
            b = s;
        }
        if (a6.$2(a0, a1) > 0) {
            s = a1;
            a1 = a0;
            a0 = s;
        }
        if (a6.$2(a, a2) > 0) {
            s = a2;
            a2 = a;
            a = s;
        }
        if (a6.$2(a, a0) > 0) {
            s = a0;
            a0 = a;
            a = s;
        }
        if (a6.$2(a1, a2) > 0) {
            s = a2;
            a2 = a1;
            a1 = s;
        }
        c.m(a3, h, b);
        c.m(a3, f, a0);
        c.m(a3, g, a2);
        c.m(a3, e, c.h(a3, a4));
        c.m(a3, d, c.h(a3, a5));
        r = a4 + 1;
        q = a5 - 1;
        // if (J.Y(a6.$2(a, a1), 0)) {
        if (a6.$2(a, a1) === 0) {
            for (p = r; p <= q; ++p) {
                o = c.h(a3, p);
                n = a6.$2(o, a);
                if (n === 0) continue;
                if (n < 0) {
                    if (p !== r) {
                        c.m(a3, p, c.h(a3, r));
                        c.m(a3, r, o);
                    }
                    ++r;
                } else
                    while (true) {
                        n = a6.$2(c.h(a3, q), a);
                        if (n > 0) {
                            --q;
                            continue;
                        } else {
                            m = q - 1;
                            if (n < 0) {
                                c.m(a3, p, c.h(a3, r));
                                l = r + 1;
                                c.m(a3, r, c.h(a3, q));
                                c.m(a3, q, o);
                                q = m;
                                r = l;
                                break;
                            } else {
                                c.m(a3, p, c.h(a3, q));
                                c.m(a3, q, o);
                                q = m;
                                break;
                            }
                        }
                    }
            }
            k = true;
        } else {
            for (p = r; p <= q; ++p) {
                o = c.h(a3, p);
                if (a6.$2(o, a) < 0) {
                    if (p !== r) {
                        c.m(a3, p, c.h(a3, r));
                        c.m(a3, r, o);
                    }
                    ++r;
                } else if (a6.$2(o, a1) > 0)
                    while (true)
                        if (a6.$2(c.h(a3, q), a1) > 0) {
                            --q;
                            if (q < p) break;
                            continue;
                        } else {
                            m = q - 1;
                            if (a6.$2(c.h(a3, q), a) < 0) {
                                c.m(a3, p, c.h(a3, r));
                                l = r + 1;
                                c.m(a3, r, c.h(a3, q));
                                c.m(a3, q, o);
                                r = l;
                            } else {
                                c.m(a3, p, c.h(a3, q));
                                c.m(a3, q, o);
                            }
                            q = m;
                            break;
                        }
            }
            k = false;
        }
        j = r - 1;
        c.m(a3, a4, c.h(a3, j));
        c.m(a3, j, a);
        j = q + 1;
        c.m(a3, a5, c.h(a3, j));
        c.m(a3, j, a1);
        H.hL(a3, a4, r - 2, a6);
        H.hL(a3, q + 2, a5, a6);
        if (k) return;
        if (r < h && q > g) {
            // for (; J.Y(a6.$2(c.h(a3, r), a), 0);) {
            while (a6.$2(c.h(a3, r), a) === 0) {
                ++r;
            }
            // for (; J.Y(a6.$2(c.h(a3, q), a1), 0);) {
            while (a6.$2(c.h(a3, q), a1) === 0) {
                --q;
            }
            for (p = r; p <= q; ++p) {
                o = c.h(a3, p);
                if (a6.$2(o, a) === 0) {
                    if (p !== r) {
                        c.m(a3, p, c.h(a3, r));
                        c.m(a3, r, o);
                    }
                    ++r;
                } else if (a6.$2(o, a1) === 0)
                    while (true)
                        if (a6.$2(c.h(a3, q), a1) === 0) {
                            --q;
                            if (q < p) break;
                            continue;
                        } else {
                            m = q - 1;
                            if (a6.$2(c.h(a3, q), a) < 0) {
                                c.m(a3, p, c.h(a3, r));
                                l = r + 1;
                                c.m(a3, r, c.h(a3, q));
                                c.m(a3, q, o);
                                r = l;
                            } else {
                                c.m(a3, p, c.h(a3, q));
                                c.m(a3, q, o);
                            }
                            q = m;
                            break;
                        }
            }
            H.hL(a3, r, q, a6);
        } else H.hL(a3, r, q, a6);
    },
    fz: function fz(a) {
        this.a = a;
    },
    ff: function ff(a) {
        this.a = a;
    },
    dO: function dO(a, b) {
        this.a = a;
        this.$ti = b;
    },
    A: function A() { },
    M: function M() { },
    cv: function cv(a, b) {
        this.a = a;
        this.b = b;
        this.c = 0;
        this.d = null;
    },
    c6: function c6(a, b, c) {
        this.a = a;
        this.b = b;
        this.$ti = c;
    },
    dr: function dr(a, b, c) {
        this.a = a;
        this.b = b;
        this.$ti = c;
    },
    fB: function fB(a, b) {
        this.a = null;
        this.b = a;
        this.c = b;
    },
    y: function y(a, b, c) {
        this.a = a;
        this.b = b;
        this.$ti = c;
    },
    cf: function cf(a, b, c) {
        this.a = a;
        this.b = b;
        this.$ti = c;
    },
    hX: function hX(a, b) {
        this.a = a;
        this.b = b;
    },
    du: function du() { },
    hV: function hV() { },
    cJ: function cJ() { },
    a9: function a9(a, b) {
        this.a = a;
        this.$ti = b;
    },
    oP(a) {
        var s,
            r = init.mangledGlobalNames[a];
        if (r != null) return r;
        s = "minified:" + a;
        return s;
    },
    oG(a, b) {
        var s;
        if (b != null) {
            s = b.x;
            if (s != null) return s;
        }
        return t.aU.b(a);
    },
    as_string(a) {
        var res;
        if (typeof a == "string") {
            return a;
        }
        if (typeof a == "number") {
            if (a !== 0) {
                return "" + a;
            }
        } else if (true === a) {
            return "true";
        } else if (false === a) {
            return "false";
        } else if (a == null) {
            return "null";
        }
        res = J.b4(a);
        if (typeof res != "string") throw H.wrap_expression(H.R(a));
        return res;
    },
    Primitives_objectHashCode(a) {
        var s = a.$identityHash;
        if (s == null) {
            s = (Math.random() * 0x3fffffff) | 0;
            a.$identityHash = s;
        }
        return s;
    },
    tk(a, b) {
        var s, r;
        if (typeof a != "string") H.throw_expression(H.R(a));
        s = /^\s*[+-]?((0x[a-f0-9]+)|(\d+)|([a-z0-9]+))\s*$/i.exec(a);
        if (s == null) return null;
        r = s[3];
        if (r != null) return Number.parseInt(a, 10);
        if (s[2] != null) return Number.parseInt(a, 16);
        return null;
    },
    jZ(a) {
        return H.tc(a);
    },
    tc(a) {
        var s, r, q, p;
        if (a instanceof P.Object) return H._rtiToString(H.instanceType(a), null);
        if (J.cV(a) === C.J || t.bI.b(a)) {
            s = C.p(a);
            r = s !== "Object" && s !== "";
            if (r) return s;
            q = a.constructor;
            if (typeof q == "function") {
                p = q.name;
                if (typeof p == "string") r = p !== "Object" && p !== "";
                else r = false;
                if (r) return p;
            }
        }
        return H._rtiToString(H.instanceType(a), null);
    },
    nY(a) {
        var s,
            r,
            q,
            p,
            o = a.length;
        if (o <= 500) return String.fromCharCode.apply(null, a);
        for (s = "", r = 0; r < o; r = q) {
            q = r + 500;
            p = q < o ? q : o;
            s += String.fromCharCode.apply(null, a.slice(r, p));
        }
        return s;
    },
    tl(a) {
        var s,
            r,
            q,
            p = H.b([], t.dC);
        for (
            s = a.length, r = 0;
            r < a.length;
            a.length === s || (0, H.F)(a), ++r
        ) {
            q = a[r];
            if (!H.aP(q)) throw H.wrap_expression(H.R(q));
            if (q <= 65535) p.push(q);
            else if (q <= 1114111) {
                p.push(55296 + (C.JsInt.am(q - 65536, 10) & 1023));
                p.push(56320 + (q & 1023));
            } else throw H.wrap_expression(H.R(q));
        }
        return H.nY(p);
    },
    nZ(a) {
        var s, r, q;
        for (s = a.length, r = 0; r < s; ++r) {
            q = a[r];
            if (!H.aP(q)) throw H.wrap_expression(H.R(q));
            if (q < 0) throw H.wrap_expression(H.R(q));
            if (q > 65535) return H.tl(a);
        }
        return H.nY(a);
    },
    tm(a, b, c) {
        var s, r, q, p;
        if (c <= 500 && b === 0 && c === a.length)
            return String.fromCharCode.apply(null, a);
        for (s = b, r = ""; s < c; s = q) {
            q = s + 500;
            p = q < c ? q : c;
            r += String.fromCharCode.apply(null, a.subarray(s, p));
        }
        return r;
    },
    char_code_to_char(a) {
        // unicodeToChar
        var s;
        if (a <= 65535) return String.fromCharCode(a);
        if (a <= 1114111) {
            s = a - 65536;
            return String.fromCharCode(
                (C.JsInt.am(s, 10) | 55296) >>> 0,
                (s & 1023) | 56320,
            );
        }
        throw H.wrap_expression(P.a8(a, 0, 1114111, null, null));
    },
    aG(a) {
        if (a.date === void 0) a.date = new Date(a.a);
        return a.date;
    },
    tj(a) {
        return a.b ? H.aG(a).getUTCFullYear() + 0 : H.aG(a).getFullYear() + 0;
    },
    th(a) {
        return a.b ? H.aG(a).getUTCMonth() + 1 : H.aG(a).getMonth() + 1;
    },
    td(a) {
        return a.b ? H.aG(a).getUTCDate() + 0 : H.aG(a).getDate() + 0;
    },
    te(a) {
        return a.b ? H.aG(a).getUTCHours() + 0 : H.aG(a).getHours() + 0;
    },
    tg(a) {
        return a.b ? H.aG(a).getUTCMinutes() + 0 : H.aG(a).getMinutes() + 0;
    },
    ti(a) {
        return a.b ? H.aG(a).getUTCSeconds() + 0 : H.aG(a).getSeconds() + 0;
    },
    tf(a) {
        return a.b
            ? H.aG(a).getUTCMilliseconds() + 0
            : H.aG(a).getMilliseconds() + 0;
    },
    bQ(a, b) {
        var s,
            r = "index";
        if (!H.aP(b)) return new P.aS(true, b, r, null);
        // s = J.aw(a)
        s = a.length;
        if (b < 0 || b >= s) return P.ft(b, a, r, null, s);
        return P.k0(b, r);
    },
    uP(a, b, c) {
        if (a > c) return P.a8(a, 0, c, "start", null);
        if (b != null) if (b < a || b > c) return P.a8(b, a, c, "end", null);
        return new P.aS(true, b, "end", null);
    },
    R(a) {
        return new P.aS(true, a, null, null);
    },
    ar(a) {
        if (typeof a != "number") throw H.wrap_expression(H.R(a));
        return a;
    },
    wrap_expression(a) {
        var s, r;
        if (a == null) a = new P.fL();
        s = new Error();
        s.dartException = a;
        r = H.vn;
        if ("defineProperty" in Object) {
            Object.defineProperty(s, "message", {
                get: r,
            });
            s.name = "";
        } else s.toString = r;
        return s;
    },
    vn() {
        return J.b4(this.dartException);
    },
    throw_expression(a) {
        throw H.wrap_expression(a);
    },
    F(a) {
        throw H.wrap_expression(P.aK(a));
    },
    br(a) {
        var s, r, q, p, o, n;
        a = H.quoteStringForRegExp(a.replace(String({}), "$receiver$"));
        s = a.match(/\\\$[a-zA-Z]+\\\$/g);
        if (s == null) s = H.b([], t.s);
        r = s.indexOf("\\$arguments\\$");
        q = s.indexOf("\\$argumentsExpr\\$");
        p = s.indexOf("\\$expr\\$");
        o = s.indexOf("\\$method\\$");
        n = s.indexOf("\\$receiver\\$");
        return new H.kh(
            a
                .replace(/\\\$arguments\\\$/g, "((?:x|[^x])*)")
                .replace(/\\\$argumentsExpr\\\$/g, "((?:x|[^x])*)")
                .replace(/\\\$expr\\\$/g, "((?:x|[^x])*)")
                .replace(/\\\$method\\\$/g, "((?:x|[^x])*)")
                .replace(/\\\$receiver\\\$/g, "((?:x|[^x])*)"),
            r,
            q,
            p,
            o,
            n,
        );
    },
    ki(a) {
        return (($expr$) => {
            var $argumentsExpr$ = "$arguments$";
            try {
                $expr$.$method$($argumentsExpr$);
            } catch (s) {
                return s.message;
            }
        })(a);
    },
    o8(a) {
        return (($expr$) => {
            try {
                $expr$.$method$;
            } catch (s) {
                return s.message;
            }
        })(a);
    },
    JsNoSuchMethodError(a, b) {
        var s = b == null,
            r = s ? null : b.method;
        return new H.JsNoSuchMethodError(a, r, s ? null : b.receiver);
    },
    unwrap_Exception(ex) {
        if (ex == null) return new H.NullThrownFromJavaScriptException(ex);
        if (ex instanceof H.ExceptionAndStackTrace)
            return H.saveStackTrace(ex, ex.a);
        if (typeof ex !== "object") return ex;
        if ("dartException" in ex) return H.saveStackTrace(ex, ex.dartException);
        return H._unwrapNonDartException(ex);
    },
    saveStackTrace(ex, err) {
        if (t.u.b(err)) if (err.$thrownJsError == null) err.$thrownJsError = ex;
        return err;
    },
    _unwrapNonDartException(ex) {
        var message,
            number,
            is_error_code,
            t1,
            nsme,
            not_closure,
            null_call,
            null_literal_call,
            undef_call,
            undef_literal_call,
            null_property,
            undef_property,
            undef_literal_property,
            match,
            e = null;
        if (!("message" in ex)) return ex;
        message = ex.message;
        if ("number" in ex && typeof ex.number == "number") {
            number = ex.number;
            is_error_code = number & 65535;
            if ((C.JsInt.am(number, 16) & 8191) === 10)
                switch (is_error_code) {
                    case 438:
                        return H.saveStackTrace(
                            ex,
                            H.JsNoSuchMethodError(
                                H.as_string(message) + " (Error " + is_error_code + ")",
                                e,
                            ),
                        );
                    case 445:
                    case 5007:
                        t1 = H.as_string(message) + " (Error " + is_error_code + ")";
                        return H.saveStackTrace(ex, new H.NullError(t1, e));
                }
        }
        if (ex instanceof TypeError) {
            nsme = $.r7();
            not_closure = $.r8();
            null_call = $.r9();
            null_literal_call = $.ra();
            undef_call = $.rd();
            undef_literal_call = $.re();
            null_property = $.rc();
            $.rb();
            undef_property = $.rg();
            undef_literal_property = $.rf();
            match = nsme.aH(message);
            if (match != null)
                return H.saveStackTrace(ex, H.JsNoSuchMethodError(message, match));
            else {
                match = not_closure.aH(message);
                if (match != null) {
                    match.method = "call";
                    return H.saveStackTrace(ex, H.JsNoSuchMethodError(message, match));
                } else {
                    match = null_call.aH(message);
                    if (match == null) {
                        match = null_literal_call.aH(message);
                        if (match == null) {
                            match = undef_call.aH(message);
                            if (match == null) {
                                match = undef_literal_call.aH(message);
                                if (match == null) {
                                    match = null_property.aH(message);
                                    if (match == null) {
                                        match = null_literal_call.aH(message);
                                        if (match == null) {
                                            match = undef_property.aH(message);
                                            if (match == null) {
                                                match = undef_literal_property.aH(message);
                                                t1 = match != null;
                                            } else t1 = true;
                                        } else t1 = true;
                                    } else t1 = true;
                                } else t1 = true;
                            } else t1 = true;
                        } else t1 = true;
                    } else t1 = true;
                    if (t1) {
                        return H.saveStackTrace(
                            ex,
                            new H.NullError(message, match == null ? e : match.method),
                        );
                    }
                }
            }
            return H.saveStackTrace(
                ex,
                new H.hU(typeof message == "string" ? message : ""),
            );
        }
        if (ex instanceof RangeError) {
            if (typeof message == "string" && message.indexOf("call stack") !== -1)
                return new P.el();
            message = ((b) => {
                try {
                    return String(b);
                } catch (d) { }
                return null;
            })(ex);
            return H.saveStackTrace(
                ex,
                new P.aS(
                    false,
                    e,
                    e,
                    typeof message == "string"
                        ? message.replace(/^RangeError:\s*/, "")
                        : message,
                ),
            );
        }
        if (typeof InternalError == "function" && ex instanceof InternalError)
            if (typeof message == "string" && message === "too much recursion")
                return new P.el();
        return ex;
    },
    getTraceFromException(a) {
        var s;
        if (a instanceof H.ExceptionAndStackTrace) return a.b;
        if (a == null) return new H.eE(a);
        s = a.$cachedTrace;
        if (s != null) return s;
        return (a.$cachedTrace = new H.eE(a));
    },
    vd(a) {
        if (a == null || typeof a != "object") return J.lZ(a);
        else return H.Primitives_objectHashCode(a);
    },
    uQ(a, b) {
        var s,
            r,
            q,
            p = a.length;
        for (s = 0; s < p; s = q) {
            r = s + 1;
            q = r + 1;
            b.m(0, a[s], a[r]);
        }
        return b;
    },
    invokeClosure(closure, numberOfArguments, arg1, arg2, arg3, arg4) {
        switch (numberOfArguments) {
            case 0:
                return closure.$0();
            case 1:
                return closure.$1(arg1);
            case 2:
                return closure.$2(arg1, arg2);
            case 3:
                return closure.$3(arg1, arg2, arg3);
            case 4:
                return closure.$4(arg1, arg2, arg3, arg4);
        }
        throw H.wrap_expression(
            new P.kG("Unsupported number of arguments for wrapped closure"),
        );
    },
    // MARK: convert_dart_closure_to_js_md5
    // convertDartClosureToJS
    convert_dart_closure_to_js_md5(closure, arity) {
        var func;
        if (closure == null) return null;
        func = closure.$identity;
        // if (!!s) return s
        if (func) return func;
        func = (
            (closure_, arity_, invoker) => (arg1, arg2, arg3, arg4) =>
                invoker(closure_, arity_, arg1, arg2, arg3, arg4)
        )(closure, arity, H.invokeClosure);
        closure.$identity = func;
        return func;
    },
    Closure_fromTearOff(a2) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i = a2.co,
            h = a2.iS,
            g = a2.iI,
            f = a2.nDA,
            e = a2.aI,
            d = a2.fs,
            c = a2.cs,
            b = d[0],
            a = c[0],
            a0 = i[b],
            a1 = a2.fT;
        a1.toString;
        s = h
            ? Object.create(new H.StaticClosure().constructor.prototype)
            : Object.create(new H.BoundClosure(null, null).constructor.prototype);
        s.$initialize = s.constructor;
        if (h)
            r = function static_tear_off() {
                this.$initialize();
            };
        else {
            q = $.bk;
            $.bk = q + 1;
            q = new Function("a,b" + q, "this.$initialize(a,b" + q + ")");
            r = q;
        }
        s.constructor = r;
        r.prototype = s;
        s.$_name = b;
        s.$_target = a0;
        q = !h;
        if (q) p = H.Closure_forwardCallTo(b, a0, g, f);
        else {
            s.$static_name = b;
            p = a0;
        }
        s.$S = H.Closure__computeSignatureFunctionNewRti(a1, h, g);
        s[a] = p;
        for (o = p, n = 1; n < d.length; ++n) {
            m = d[n];
            if (typeof m == "string") {
                l = i[m];
                k = m;
                m = l;
            } else k = "";
            j = c[n];
            if (j != null) {
                if (q) m = H.Closure_forwardCallTo(k, m, g, f);
                s[j] = m;
            }
            if (n === e) o = m;
        }
        s.$C = o;
        s.$R = a2.rC;
        s.$D = a2.dV;
        return r;
    },
    Closure__computeSignatureFunctionNewRti(a, b, c) {
        if (typeof a == "number") return a;
        if (typeof a == "string") {
            if (b)
                throw H.wrap_expression(
                    "Cannot compute signature for static tearoff.",
                );
            return ((d, e) =>
                function () {
                    return e(this, d);
                })(a, H.rF);
        }
        throw H.wrap_expression("Error in functionType of tearoff");
    },
    Closure_cspForwardCall(arity, is_super_call, stub_name, func) {
        var get_self = H.BoundClosure_selfOf;
        switch (is_super_call ? -1 : arity) {
            case 0:
                return ((e, f) =>
                    function () {
                        return f(this)[e]();
                    })(stub_name, get_self);
            case 1:
                return ((e, f) =>
                    function (g) {
                        return f(this)[e](g);
                    })(stub_name, get_self);
            case 2:
                return ((e, f) =>
                    function (g, h) {
                        return f(this)[e](g, h);
                    })(stub_name, get_self);
            case 3:
                return ((e, f) =>
                    function (g, h, i) {
                        return f(this)[e](g, h, i);
                    })(stub_name, get_self);
            case 4:
                return ((e, f) =>
                    function (g, h, i, j) {
                        return f(this)[e](g, h, i, j);
                    })(stub_name, get_self);
            case 5:
                return ((e, f) =>
                    function (g, h, i, j, k) {
                        return f(this)[e](g, h, i, j, k);
                    })(stub_name, get_self);
            default:
                return ((e, f) =>
                    function () {
                        return e.apply(f(this), arguments);
                    })(func, get_self);
        }
    },
    Closure_forwardCallTo(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n = "receiver";
        if (c) return H.Closure_forwardInterceptedCallTo(a, b, d);
        s = b.length;
        r = d || s >= 27;
        if (r) return H.Closure_cspForwardCall(s, d, a, b);
        if (s === 0) {
            r = $.bk;
            $.bk = r + 1;
            q = "self" + H.as_string(r);
            r = "return function(){var " + q + " = this.";
            p = $.dh;
            return new Function(
                r +
                (p == null ? ($.dh = H.BoundClosure_selfFieldName(n)) : p) +
                ";return " +
                q +
                "." +
                H.as_string(a) +
                "();}",
            )();
        }
        o = "abcdefghijklmnopqrstuvwxyz".split("").splice(0, s).join(",");
        r = $.bk;
        $.bk = r + 1;
        o += H.as_string(r);
        r = "return function(" + o + "){return this.";
        p = $.dh;
        return new Function(
            r +
            (p == null ? ($.dh = H.BoundClosure_selfFieldName(n)) : p) +
            "." +
            H.as_string(a) +
            "(" +
            o +
            ");}",
        )();
    },
    Closure_cspForwardInterceptedCall(arity, is_super_call, name, func) {
        var get_self = H.BoundClosure_selfOf,
            get_receiver = H.BoundClosure_receiverOf;
        switch (is_super_call ? -1 : arity) {
            case 0:
                throw H.wrap_expression(
                    new H.RuntimeError("Intercepted function with no arguments."),
                );
            case 1:
                return ((e, f, g) =>
                    function () {
                        return f(this)[e](g(this));
                    })(name, get_receiver, get_self);
            case 2:
                return ((e, f, g) =>
                    function (h) {
                        return f(this)[e](g(this), h);
                    })(name, get_receiver, get_self);
            case 3:
                return ((e, f, g) =>
                    function (h, i) {
                        return f(this)[e](g(this), h, i);
                    })(name, get_receiver, get_self);
            case 4:
                return ((e, f, g) =>
                    function (h, i, j) {
                        return f(this)[e](g(this), h, i, j);
                    })(name, get_receiver, get_self);
            case 5:
                return ((e, f, g) =>
                    function (h, i, j, k) {
                        return f(this)[e](g(this), h, i, j, k);
                    })(name, get_receiver, get_self);
            case 6:
                return ((e, f, g) =>
                    function (h, i, j, k, l) {
                        return f(this)[e](g(this), h, i, j, k, l);
                    })(name, get_receiver, get_self);
            default:
                return ((e, f, g) =>
                    function () {
                        var q = [g(this)];
                        Array.prototype.push.apply(q, arguments);
                        return e.apply(f(this), q);
                    })(func, get_receiver, get_self);
        }
    },
    Closure_forwardInterceptedCallTo(a, b, c) {
        var stub_name,
            arity,
            looked_up_func,
            t1,
            t2,
            args = $.nE;
        if (args == null)
            args = $.nE = H.BoundClosure_selfFieldName("interceptor");
        stub_name = $.dh;
        if (stub_name == null)
            stub_name = $.dh = H.BoundClosure_selfFieldName("receiver");
        arity = b.length;
        looked_up_func = c || arity >= 28;
        if (looked_up_func)
            return H.Closure_cspForwardInterceptedCall(arity, c, a, b);
        if (arity === 1) {
            looked_up_func =
                "return function(){return this." +
                args +
                "." +
                H.as_string(a) +
                "(this." +
                stub_name +
                ");";
            t1 = $.bk;
            $.bk = t1 + 1;
            return new Function(looked_up_func + H.as_string(t1) + "}")();
        }
        t2 = "abcdefghijklmnopqrstuvwxyz"
            .split("")
            .splice(0, arity - 1)
            .join(",");
        looked_up_func =
            "return function(" +
            t2 +
            "){return this." +
            args +
            "." +
            H.as_string(a) +
            "(this." +
            stub_name +
            ", " +
            t2 +
            ");";
        t1 = $.bk;
        $.bk = t1 + 1;
        return new Function(looked_up_func + H.as_string(t1) + "}")();
    },
    mx(a) {
        // 理论上不能改, 但是似乎可以
        // 上面是因为这玩意在普通版里是用来拼接的, 但是这里似乎没用于拼接
        return H.Closure_fromTearOff(a);
    },
    rF(a, b) {
        // BoundClosure_evalRecipe
        // or
        // BoundClosure_evalRecipeIntercepted
        return H._Universe_evalInEnvironment(
            init.typeUniverse,
            H.instanceType(a.a),
            b,
        );
    },
    BoundClosure_selfOf(a) {
        return a.a;
    },
    BoundClosure_receiverOf(a) {
        return a.b;
    },
    BoundClosure_selfFieldName(a) {
        var s,
            r,
            q,
            p = new H.BoundClosure("receiver", "interceptor"),
            o = J.nL(Object.getOwnPropertyNames(p));
        for (s = o.length, r = 0; r < s; ++r) {
            q = o[r];
            if (p[q] === a) return q;
        }
        throw H.wrap_expression(P.bz("Field name " + a + " not found.", null));
    },
    throwCyclicInit(a) {
        throw H.wrap_expression(new P.CyclicInitializationError(a));
    },
    getIsolateAffinityTag(a) {
        return init.getIsolateTag(a);
    },
    defineProperty(a, b, c) {
        // 笑死, 根本没人用
        Object.defineProperty(a, b, {
            value: c,
            enumerable: false,
            writable: true,
            configurable: true,
        });
    },
    lookupAndCacheInterceptor(obj) {
        var s,
            r,
            q,
            p,
            o,
            n = $.oB.$1(obj),
            m = $.lt[n];
        if (m != null) {
            Object.defineProperty(obj, init.dispatchPropertyName, {
                value: m,
                enumerable: false,
                writable: true,
                configurable: true,
            });
            return m.i;
        }
        s = $.ly[n];
        if (s != null) return s;
        r = init.interceptorsByTag[n];
        if (r == null) {
            q = $.ov.$2(obj, n);
            if (q != null) {
                m = $.lt[q];
                if (m != null) {
                    Object.defineProperty(obj, init.dispatchPropertyName, {
                        value: m,
                        enumerable: false,
                        writable: true,
                        configurable: true,
                    });
                    return m.i;
                }
                s = $.ly[q];
                if (s != null) return s;
                r = init.interceptorsByTag[q];
                n = q;
            }
        }
        if (r == null) return null;
        s = r.prototype;
        p = n[0];
        if (p === "!") {
            m = H.makeLeafDispatchRecord(s);
            $.lt[n] = m;
            Object.defineProperty(obj, init.dispatchPropertyName, {
                value: m,
                enumerable: false,
                writable: true,
                configurable: true,
            });
            return m.i;
        }
        if (p === "~") {
            $.ly[n] = s;
            return s;
        }
        if (p === "-") {
            o = H.makeLeafDispatchRecord(s);
            Object.defineProperty(
                Object.getPrototypeOf(obj),
                init.dispatchPropertyName,
                {
                    value: o,
                    enumerable: false,
                    writable: true,
                    configurable: true,
                },
            );
            return o.i;
        }
        if (p === "+") return H.patchInteriorProto(obj, s);
        if (p === "*") throw H.wrap_expression(P.hT(n));
        if (init.leafTags[n] === true) {
            o = H.makeLeafDispatchRecord(s);
            Object.defineProperty(
                Object.getPrototypeOf(obj),
                init.dispatchPropertyName,
                {
                    value: o,
                    enumerable: false,
                    writable: true,
                    configurable: true,
                },
            );
            return o.i;
        } else return H.patchInteriorProto(obj, s);
    },
    patchInteriorProto(a, b) {
        var s = Object.getPrototypeOf(a);
        Object.defineProperty(s, init.dispatchPropertyName, {
            value: J.makeDispatchRecord(b, s, null, null),
            enumerable: false,
            writable: true,
            configurable: true,
        });
        return b;
    },
    makeLeafDispatchRecord(a) {
        return J.makeDispatchRecord(a, false, null, !!a.$iag);
    },
    makeDefaultDispatchRecord(a, b, c) {
        var s = b.prototype;
        if (init.leafTags[a] === true) return H.makeLeafDispatchRecord(s);
        else return J.makeDispatchRecord(s, c, null, null);
    },
    initNativeDispatch() {
        if (true === $.mA) return;
        $.mA = true;
        if (!run_env.from_code) {
            H.initNativeDispatchContinue();
        }
    },
    initNativeDispatchContinue() {
        var s, r, q, p, o, n, m, l;
        $.lt = Object.create(null);
        $.ly = Object.create(null);
        H.initHooks();
        s = init.interceptorsByTag;
        r = Object.getOwnPropertyNames(s);
        // 检测是否在网页内运行
        if (typeof window != "undefined") {
            window;
            q = () => { };
            for (p = 0; p < r.length; ++p) {
                o = r[p];
                n = $.oL.$1(o);
                if (n != null) {
                    m = H.makeDefaultDispatchRecord(o, s[o], n);
                    if (m != null) {
                        Object.defineProperty(n, init.dispatchPropertyName, {
                            value: m,
                            enumerable: false,
                            writable: true,
                            configurable: true,
                        });
                        q.prototype = n;
                    }
                }
            }
        }
        for (p = 0; p < r.length; ++p) {
            o = r[p];
            if (/^[A-Za-z_]/.test(o)) {
                l = s[o];
                s["!" + o] = l;
                s["~" + o] = l;
                s["-" + o] = l;
                s["+" + o] = l;
                s["*" + o] = l;
            }
        }
    },
    initHooks() {
        var p,
            o,
            n,
            m = C.w();

        p = m.getTag;
        o = m.getUnknownTag;
        n = m.prototypeForTag;
        $.oB = new H.lv(p);
        $.ov = new H.lw(o);
        $.oL = new H.lx(n);
    },
    // 笑死了, 我把所有调用删掉了(在之前的commit)
    // applyHooksTransformer(transformer, hooks) {
    //     return transformer(hooks) || hooks
    // },
    JSSyntaxRegExp_makeNative(
        source,
        multiline,
        case_sensitive,
        unicode,
        dot_all,
        global,
    ) {
        var s = multiline ? "m" : "",
            r = case_sensitive ? "" : "i",
            q = unicode ? "u" : "",
            p = dot_all ? "s" : "",
            o = global ? "g" : "",
            regex_xp = ((source, modifiers) => {
                try {
                    return new RegExp(source, modifiers);
                } catch (e) {
                    return e;
                }
            })(source, s + r + q + p + o);
        if (regex_xp instanceof RegExp) return regex_xp;
        throw H.wrap_expression(
            P.FormatException(
                "Illegal RegExp pattern (" + String(regex_xp) + ")",
                source,
                null,
            ),
        );
    },
    iF(a, b, c) {
        var s;
        if (typeof b == "string") return a.indexOf(b, c) >= 0;
        else {
            s = J.lU(b, C.String.ay(a, c));
            s = s.gbv(s);
            return !s;
        }
    },
    oz(a) {
        if (a.indexOf("$", 0) >= 0) return a.replace(/\$/g, "$$$$");
        return a;
    },
    vk(a, b, c, d) {
        var s = b.d_(a, d);
        if (s == null) return a;
        return H.mG(a, s.b.index, s.gbh(), c);
    },
    quoteStringForRegExp(a) {
        if (/[[\]{}()*+?.\\^$|]/.test(a))
            return a.replace(/[[\]{}()*+?.\\^$|]/g, "\\$&");
        return a;
    },
    mF(a, b, c) {
        var s = H.vj(a, b, c);
        return s;
    },
    vj(a, b, c) {
        var s, r, q, p;
        if (b === "") {
            if (a === "") return c;
            s = a.length;
            for (r = c, q = 0; q < s; ++q) r = r + a[q] + c;
            return r.charCodeAt(0) == 0 ? r : r;
        }
        p = a.indexOf(b, 0);
        if (p < 0) return a;
        if (a.length < 500 || c.indexOf("$", 0) >= 0) return a.split(b).join(c);
        return a.replace(new RegExp(H.quoteStringForRegExp(b), "g"), H.oz(c));
    },
    mv(a) {
        return a;
    },
    oO(a, b, c, d) {
        var s, r, q, p;
        if (typeof b == "string") return H.vi(a, b, c, H.uv());
        if (!t.eh.b(b))
            throw H.wrap_expression(P.da(b, "pattern", "is not a Pattern"));
        for (s = J.lU(b, a), s = s.ga0(s), r = 0, q = ""; s.u();) {
            p = s.gC();
            q =
                q +
                H.as_string(H.mv(C.String.af(a, r, p.gbc(p)))) +
                H.as_string(c.$1(p));
            r = p.gbh();
        }
        s = q + H.as_string(H.mv(C.String.ay(a, r)));
        return s.charCodeAt(0) == 0 ? s : s;
    },
    vh(a, b, c) {
        var s,
            r,
            q = a.length,
            p = H.as_string(c.$1(""));
        for (s = 0; s < q;) {
            p += H.as_string(b.$1(new H.bK(s, "")));
            if ((C.String.a8(a, s) & 4294966272) === 55296 && q > s + 1)
                if ((C.String.a8(a, s + 1) & 4294966272) === 56320) {
                    r = s + 2;
                    p += H.as_string(c.$1(C.String.af(a, s, r)));
                    s = r;
                    continue;
                }
            p += H.as_string(c.$1(a[s]));
            ++s;
        }
        p = p + H.as_string(b.$1(new H.bK(s, ""))) + H.as_string(c.$1(""));
        return p.charCodeAt(0) == 0 ? p : p;
    },
    vi(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o = b.length;
        if (o === 0) return H.vh(a, c, d);
        s = a.length;
        for (r = 0, q = ""; r < s;) {
            p = a.indexOf(b, r);
            if (p === -1) break;
            q =
                q +
                H.as_string(d.$1(C.String.af(a, r, p))) +
                H.as_string(c.$1(new H.bK(p, b)));
            r = p + o;
        }
        q += H.as_string(d.$1(C.String.ay(a, r)));
        return q.charCodeAt(0) == 0 ? q : q;
    },
    iG(a, b, c, d) {
        var s, r, q, p, o, n;
        if (typeof b == "string") {
            s = a.indexOf(b, d);
            if (s < 0) return a;
            return H.mG(a, s, s + b.length, c);
        }
        if (b instanceof H.JSSyntaxRegExp)
            return d === 0 ? a.replace(b.b, H.oz(c)) : H.vk(a, b, c, d);
        if (b == null) H.throw_expression(H.R(b));
        r = J.rt(b, a, d);
        q = r.ga0(r);
        if (!q.u()) return a;
        p = q.gC();
        r = p.gbc(p);
        o = p.gbh();
        n = P.cE(r, o, a.length);
        return H.mG(a, r, n, c);
    },
    mG(a, b, c, d) {
        var s = a.substring(0, b),
            r = a.substring(c);
        return s + d + r;
    },
    kh: function kh(a, b, c, d, e, f) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    },
    NullError: function dP(a, b) {
        this.a = a;
        this.b = b;
    },
    JsNoSuchMethodError: function fx(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    },
    hU: function hU(a) {
        this.a = a;
    },
    NullThrownFromJavaScriptException: function jR(a) {
        this.a = a;
    },
    ExceptionAndStackTrace: function dt(a, b) {
        this.a = a;
        this.b = b;
    },
    eE: function eE(a) {
        this.a = a;
        this.b = null;
    },
    c_: function c_() { },
    j5: function j5() { },
    j6: function j6() { },
    TearOffClosure: function kg() { },
    StaticClosure: function kc() { },
    BoundClosure: function dg(a, b) {
        this.a = a;
        this.b = b;
    },
    RuntimeError: function h3(a) {
        this.a = a;
    },
    JsLinkedHashMap: function aT(a) {
        this.a = 0;
        this.f = this.e = this.d = this.c = this.b = null;
        this.r = 0;
        this.$ti = a;
    },
    JsLinkedHashMap_values_closure: function jH(a) {
        this.a = a;
    },
    jK: function jK(a, b) {
        this.a = a;
        this.b = b;
        this.d = this.c = null;
    },
    dC: function dC(a, b) {
        this.a = a;
        this.$ti = b;
    },
    fA: function fA(a, b) {
        this.a = a;
        this.b = b;
        this.d = this.c = null;
    },
    lv: function lv(a) {
        this.a = a;
    },
    lw: function lw(a) {
        this.a = a;
    },
    lx: function lx(a) {
        this.a = a;
    },
    JSSyntaxRegExp: function ct(a, b) {
        this.a = a;
        this.b = b;
        this.d = this.c = null;
    },
    ew: function ew(a) {
        this.b = a;
    },
    hZ: function hZ(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    },
    kz: function kz(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = null;
    },
    bK: function bK(a, b) {
        this.a = a;
        this.c = b;
    },
    ip: function ip(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    },
    l3: function l3(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = null;
    },
    mq(a, b, c) {
        if (!H.aP(b))
            throw H.wrap_expression(
                P.bz("Invalid view offsetInBytes " + H.as_string(b), null),
            );
    },
    on(a) {
        return a;
    },
    fJ(a, b, c) {
        var s;
        H.mq(a, b, c);
        s = new Uint8Array(a, b);
        return s;
    },
    _checkValidIndex(index, list, len) {
        if (index >>> 0 !== index || index >= len)
            throw H.wrap_expression(H.bQ(list, index));
    },
    ug(a, b, c) {
        var s;
        if (!(a >>> 0 !== a)) s = b >>> 0 !== b || a > b || b > c;
        else s = true;
        if (s) throw H.wrap_expression(H.uP(a, b, c));
        return b;
    },
    dJ: function dJ() { },
    ab: function ab() { },
    NativeTypedArray: function cw() { },
    NativeTypedArrayOfDouble: function c9() { },
    NativeTypedArrayOfInt: function dK() { },
    fE: function fE() { },
    fF: function fF() { },
    fG: function fG() { },
    fH: function fH() { },
    fI: function fI() { },
    dL: function dL() { },
    cx: function cx() { },
    _NativeTypedArrayOfDouble_NativeTypedArray_ListMixin: function ey() { },
    _NativeTypedArrayOfDouble_NativeTypedArray_ListMixin_FixedLengthListMixin:
        function ez() { },
    _NativeTypedArrayOfInt_NativeTypedArray_ListMixin: function eA() { },
    _NativeTypedArrayOfInt_NativeTypedArray_ListMixin_FixedLengthListMixin:
        function eB() { },
    Rti__getQuestionFromStar(a, b) {
        var s = b.c;
        return s == null
            ? (b.c = H._Universe__lookupQuestionRti(a, b.z, true))
            : s;
    },
    Rti__getFutureFromFutureOr(a, b) {
        var s = b.c;
        return s == null
            ? (b.c = H._Universe__lookupInterfaceRti(a, "bl", [b.z]))
            : s;
    },
    Rti__isUnionOfFunctionType(a) {
        var s = a.y;
        if (s === 6 || s === 7 || s === 8)
            return H.Rti__isUnionOfFunctionType(a.z);
        return s === 11 || s === 12;
    },
    Rti__getCanonicalRecipe(a) {
        return a.cy;
    },
    findType(a) {
        return H._Universe_addErasedTypes(init.typeUniverse, a, false);
    },
    _substitute(a, b, a0, a1) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d,
            c = b.y;
        switch (c) {
            case 5:
            case 1:
            case 2:
            case 3:
            case 4:
                return b;
            case 6:
                s = b.z;
                r = H._substitute(a, s, a0, a1);
                if (r === s) return b;
                return H._Universe__lookupStarRti(a, r, true);
            case 7:
                s = b.z;
                r = H._substitute(a, s, a0, a1);
                if (r === s) return b;
                return H._Universe__lookupQuestionRti(a, r, true);
            case 8:
                s = b.z;
                r = H._substitute(a, s, a0, a1);
                if (r === s) return b;
                return H._Universe__lookupFutureOrRti(a, r, true);
            case 9:
                q = b.Q;
                p = H._substituteArray(a, q, a0, a1);
                if (p === q) return b;
                return H._Universe__lookupInterfaceRti(a, b.z, p);
            case 10:
                o = b.z;
                n = H._substitute(a, o, a0, a1);
                m = b.Q;
                l = H._substituteArray(a, m, a0, a1);
                if (n === o && l === m) return b;
                return H._Universe__lookupBindingRti(a, n, l);
            case 11:
                k = b.z;
                j = H._substitute(a, k, a0, a1);
                i = b.Q;
                h = H._substituteFunctionParameters(a, i, a0, a1);
                if (j === k && h === i) return b;
                return H._Universe__lookupFunctionRti(a, j, h);
            case 12:
                g = b.Q;
                a1 += g.length;
                f = H._substituteArray(a, g, a0, a1);
                o = b.z;
                n = H._substitute(a, o, a0, a1);
                if (f === g && n === o) return b;
                return H._Universe__lookupGenericFunctionRti(a, n, f, true);
            case 13:
                e = b.z;
                if (e < a1) return b;
                d = a0[e - a1];
                if (d == null) return b;
                return d;
            default:
                throw H.wrap_expression(
                    P.iP("Attempted to substitute unexpected RTI kind " + c),
                );
        }
    },
    _substituteArray(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o = b.length,
            n = H.ld(o);
        for (s = false, r = 0; r < o; ++r) {
            q = b[r];
            p = H._substitute(a, q, c, d);
            if (p !== q) s = true;
            n[r] = p;
        }
        return s ? n : b;
    },
    _substituteNamed(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = b.length,
            l = H.ld(m);
        for (s = false, r = 0; r < m; r += 3) {
            q = b[r];
            p = b[r + 1];
            o = b[r + 2];
            n = H._substitute(a, o, c, d);
            if (n !== o) s = true;
            l.splice(r, 3, q, p, n);
        }
        return s ? l : b;
    },
    _substituteFunctionParameters(a, b, c, d) {
        var s,
            r = b.a,
            q = H._substituteArray(a, r, c, d),
            p = b.b,
            o = H._substituteArray(a, p, c, d),
            n = b.c,
            m = H._substituteNamed(a, n, c, d);
        if (q === r && o === p && m === n) return b;
        s = new H.ib();
        s.a = q;
        s.b = o;
        s.c = m;
        return s;
    },
    b(a, b) {
        a[init.arrayRti] = b;
        return a;
    },
    closureFunctionType(a) {
        var s = a.$S;
        if (s != null) {
            if (typeof s == "number") return H.uU(s);
            return a.$S();
        }
        return null;
    },
    instanceOrFunctionType(a, b) {
        var s;
        if (H.Rti__isUnionOfFunctionType(b))
            if (a instanceof H.c_) {
                s = H.closureFunctionType(a);
                if (s != null) return s;
            }
        return H.instanceType(a);
    },
    instanceType(a) {
        var s;
        if (a instanceof P.Object) {
            s = a.$ti;
            return s != null ? s : H._instanceTypeFromConstructor(a);
        }
        if (Array.isArray(a)) return H._arrayInstanceType(a);
        return H._instanceTypeFromConstructor(J.cV(a));
    },
    _arrayInstanceType(a) {
        var s = a[init.arrayRti],
            r = t.gn;
        if (s == null) return r;
        if (s.constructor !== r.constructor) return r;
        return s;
    },
    _instanceType(a) {
        var s = a.$ti;
        return s != null ? s : H._instanceTypeFromConstructor(a);
    },
    _instanceTypeFromConstructor(a) {
        var s = a.constructor,
            r = s.$ccache;
        if (r != null) return r;
        return H._instanceTypeFromConstructorMiss(a, s);
    },
    _instanceTypeFromConstructorMiss(a, b) {
        var s = a instanceof H.c_ ? a.__proto__.__proto__.constructor : b,
            r = H.u9(init.typeUniverse, s.name);
        b.$ccache = r;
        return r;
    },
    uU(a) {
        var s,
            r = init.types,
            q = r[a];
        if (typeof q == "string") {
            s = H._Universe_addErasedTypes(init.typeUniverse, q, false);
            r[a] = s;
            return s;
        }
        return q;
    },
    mz(a) {
        var s,
            r,
            q,
            p = a.x;
        if (p != null) return p;
        s = a.cy;
        r = s.replace(/\*/g, "");
        if (r === s) return (a.x = new H.iu(a));
        q = H._Universe_addErasedTypes(init.typeUniverse, r, true);
        p = q.x;
        return (a.x = p == null ? (q.x = new H.iu(q)) : p);
    },
    vp(a) {
        return H.mz(H._Universe_addErasedTypes(init.typeUniverse, a, false));
    },
    ul(a) {
        var s,
            r,
            q,
            o = t.K;
        if (this === o) return H.cQ(this, a, H.uq);
        if (!H.isStrongTopType(this))
            if (!(this === t.c)) o = this === o;
            else o = true;
        else o = true;
        if (o) return H.cQ(this, a, H.ut);
        o = this.y;
        s = o === 6 ? this.z : this;
        if (s === t.ci) r = H.aP;
        else if (s === t.gR || s === t.di) r = H.up;
        else if (s === t.N) r = H.ur;
        else r = s === t.y ? H.lm : null;
        if (r != null) return H.cQ(this, a, r);
        if (s.y === 9) {
            q = s.z;
            if (s.Q.every(H.v0)) {
                this.r = "$i" + q;
                if (q === "w") return H.cQ(this, a, H.uo);
                return H.cQ(this, a, H.us);
            }
        } else if (o === 7) return H.cQ(this, a, H.uj);
        return H.cQ(this, a, H.uh);
    },
    cQ(a, b, c) {
        a.b = c;
        return a.b(b);
    },
    _installSpecializedAsCheck(a) {
        var s, r;
        if (!H.isStrongTopType(this)) {
            if (!(this === t.c)) {
                s = this === t.K;
            } else {
                s = true;
            }
        } else {
            s = true;
        }
        if (s) {
            r = H.ue;
        } else {
            if (this === t.K) {
                r = H.ud;
            } else {
                r = H._generalNullableAsCheckImplementation;
            }
        }
        this.a = r;
        return this.a(a);
    },
    ln(a) {
        var t1,
            r = a.y;
        if (!H.isStrongTopType(a))
            if (!(a === t.c))
                if (!(a === t.aw))
                    if (r !== 7) t1 = (r === 8 && H.ln(a.z)) || a === t.P || a === t.T;
                    else t1 = true;
                else t1 = true;
            else t1 = true;
        else t1 = true;
        return t1;
    },
    uh(a) {
        if (a == null) return H.ln(this);
        return H._isSubtype(
            init.typeUniverse,
            H.instanceOrFunctionType(a, this),
            null,
            this,
            null,
        );
    },
    uj(a) {
        if (a == null) return true;
        return this.z.b(a);
    },
    us(a) {
        var s;
        if (a == null) return H.ln(this);
        s = this.r;
        if (a instanceof P.Object) return !!a[s];
        return !!J.cV(a)[s];
    },
    uo(a) {
        var s;
        if (a == null) return H.ln(this);
        if (typeof a != "object") return false;
        if (Array.isArray(a)) return true;
        s = this.r;
        if (a instanceof P.Object) return !!a[s];
        return !!J.cV(a)[s];
    },
    Au(a) {
        if (a == null) return a;
        else if (this.b(a)) return a;
        H._failedAsCheck(a, this);
    },
    _generalNullableAsCheckImplementation(a) {
        if (a == null) return a;
        // set run time info
        else if (this.b(a)) return a;
        // console.log("faild nullable as check", a, s)
        const stack = new Error().stack;
        // console.log(stack)
        H._failedAsCheck(a, this);
    },
    _failedAsCheck(a, b) {
        throw H.wrap_expression(
            H.u_(
                H._Error_compose(
                    a,
                    H.instanceOrFunctionType(a, b),
                    H._rtiToString(b, null),
                ),
            ),
        );
    },
    _Error_compose(a, b, c) {
        var s = P.jh(a),
            r = H._rtiToString(b == null ? H.instanceType(a) : b, null);
        return (
            s +
            ": type '" +
            H.as_string(r) +
            "' is not a subtype of type '" +
            H.as_string(c) +
            "'"
        );
    },
    u_(a) {
        return new H.eI("TypeError: " + a);
    },
    aC(a, b) {
        return new H.eI("TypeError: " + H._Error_compose(a, null, b));
    },
    uq(a) {
        return a != null;
    },
    ud(a) {
        return a;
    },
    ut(a) {
        return true;
    },
    ue(a) {
        return a;
    },
    lm(a) {
        return true === a || false === a;
    },
    Ag(a) {
        if (true === a) return true;
        if (false === a) return false;
        throw H.wrap_expression(H.aC(a, "bool"));
    },
    Ai(a) {
        if (true === a) return true;
        if (false === a) return false;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "bool"));
    },
    Ah(a) {
        if (true === a) return true;
        if (false === a) return false;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "bool?"));
    },
    Aj(a) {
        if (typeof a == "number") return a;
        throw H.wrap_expression(H.aC(a, "double"));
    },
    Al(a) {
        if (typeof a == "number") return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "double"));
    },
    Ak(a) {
        if (typeof a == "number") return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "double?"));
    },
    aP(a) {
        return typeof a == "number" && Math.floor(a) === a;
    },
    Am(a) {
        if (typeof a == "number" && Math.floor(a) === a) return a;
        throw H.wrap_expression(H.aC(a, "int"));
    },
    Ao(a) {
        if (typeof a == "number" && Math.floor(a) === a) return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "int"));
    },
    An(a) {
        if (typeof a == "number" && Math.floor(a) === a) return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "int?"));
    },
    up(a) {
        return typeof a == "number";
    },
    Ap(a) {
        if (typeof a == "number") return a;
        throw H.wrap_expression(H.aC(a, "num"));
    },
    Ar(a) {
        if (typeof a == "number") return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "num"));
    },
    Aq(a) {
        if (typeof a == "number") return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "num?"));
    },
    ur(a) {
        return typeof a == "string";
    },
    As(a) {
        if (typeof a == "string") return a;
        throw H.wrap_expression(H.aC(a, "String"));
    },
    lg(a) {
        if (typeof a == "string") return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "String"));
    },
    At(a) {
        if (typeof a == "string") return a;
        if (a == null) return a;
        throw H.wrap_expression(H.aC(a, "String?"));
    },
    uB(a, b) {
        var s, r, q;
        for (s = "", r = "", q = 0; q < a.length; ++q, r = ", ")
            s += C.String.B(r, H._rtiToString(a[q], b));
        return s;
    },
    op(a4, a5, a6) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d,
            c,
            b,
            a,
            a0,
            a1,
            a2,
            a3 = ", ";
        if (a6 != null) {
            s = a6.length;
            if (a5 == null) {
                a5 = H.b([], t.s);
                r = null;
            } else r = a5.length;
            q = a5.length;
            for (p = s; p > 0; --p) a5.push("T" + (q + p));
            for (
                o = t.cK, n = t.c, m = t.K, l = "<", k = "", p = 0;
                p < s;
                ++p, k = a3
            ) {
                l = C.String.B(l + k, a5[a5.length - 1 - p]);
                j = a6[p];
                i = j.y;
                if (!(i === 2 || i === 3 || i === 4 || i === 5 || j === o))
                    if (!(j === n)) h = j === m;
                    else h = true;
                else h = true;
                if (!h) l += C.String.B(" extends ", H._rtiToString(j, a5));
            }
            l += ">";
        } else {
            l = "";
            r = null;
        }
        o = a4.z;
        g = a4.Q;
        f = g.a;
        e = f.length;
        d = g.b;
        c = d.length;
        b = g.c;
        a = b.length;
        a0 = H._rtiToString(o, a5);
        for (a1 = "", a2 = "", p = 0; p < e; ++p, a2 = a3)
            a1 += C.String.B(a2, H._rtiToString(f[p], a5));
        if (c > 0) {
            a1 += a2 + "[";
            for (a2 = "", p = 0; p < c; ++p, a2 = a3)
                a1 += C.String.B(a2, H._rtiToString(d[p], a5));
            a1 += "]";
        }
        if (a > 0) {
            a1 += a2 + "{";
            for (a2 = "", p = 0; p < a; p += 3, a2 = a3) {
                a1 += a2;
                if (b[p + 1]) a1 += "required ";
                a1 += J.iN(H._rtiToString(b[p + 2], a5), " ") + b[p];
            }
            a1 += "}";
        }
        if (r != null) {
            a5.toString;
            a5.length = r;
        }
        return l + "(" + a1 + ") => " + H.as_string(a0);
    },
    _rtiToString(a, b) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = a.y;
        if (m === 5) return "erased";
        if (m === 2) return "dynamic";
        if (m === 3) return "void";
        if (m === 1) return "Never";
        if (m === 4) return "any";
        if (m === 6) {
            s = H._rtiToString(a.z, b);
            return s;
        }
        if (m === 7) {
            r = a.z;
            s = H._rtiToString(r, b);
            q = r.y;
            return J.iN(q === 11 || q === 12 ? C.String.B("(", s) + ")" : s, "?");
        }
        if (m === 8)
            return "FutureOr<" + H.as_string(H._rtiToString(a.z, b)) + ">";
        if (m === 9) {
            p = H.uG(a.z);
            o = a.Q;
            return o.length > 0 ? p + ("<" + H.uB(o, b) + ">") : p;
        }
        if (m === 11) return H.op(a, b, null);
        if (m === 12) return H.op(a.z, b, a.Q);
        if (m === 13) {
            b.toString;
            n = a.z;
            return b[b.length - 1 - n];
        }
        return "?";
    },
    uG(a) {
        var s,
            r = init.mangledGlobalNames[a];
        if (r != null) return r;
        s = "minified:" + a;
        return s;
    },
    ua(a, b) {
        var s = a.tR[b];
        while (typeof s == "string") s = a.tR[s];
        return s;
    },
    u9(universe, b) {
        var s,
            r,
            q,
            p,
            o,
            n = universe.eT,
            m = n[b];
        if (m == null) return H._Universe_addErasedTypes(universe, b, false);
        else if (typeof m == "number") {
            s = m;
            r = H._Universe__lookupTerminalRti(universe, 5, "#");
            q = H.ld(s);
            for (p = 0; p < s; ++p) q[p] = r;
            o = H._Universe__lookupInterfaceRti(universe, b, q);
            n[b] = o;
            return o;
        } else return m;
    },
    _Universe_addRules(universe, b) {
        return H.ol(universe.tR, b);
    },
    _Universe_addErasedTypes(universe, b) {
        return H.ol(universe.eT, b);
    },
    _Universe_addErasedTypes(universe, b, c) {
        var s,
            r = universe.eC,
            q = r.get(b);
        if (q != null) return q;
        s = H._Parser_parse(H.oe(universe, null, b, c));
        r.set(b, s);
        return s;
    },
    _Universe_evalInEnvironment(universe, b, c) {
        var s,
            r,
            q = b.ch;
        if (q == null) q = b.ch = new Map();
        s = q.get(c);
        if (s != null) return s;
        r = H._Parser_parse(H.oe(universe, b, c, true));
        q.set(c, r);
        return r;
    },
    _Universe_bind(universe, b, c) {
        var s,
            r,
            q,
            p = b.cx;
        if (p == null) p = b.cx = new Map();
        s = c.cy;
        r = p.get(s);
        if (r != null) return r;
        q = H._Universe__lookupBindingRti(universe, b, c.y === 10 ? c.Q : [c]);
        p.set(s, q);
        return q;
    },
    _Universe__installTypeTests(a, b) {
        b.a = H._installSpecializedAsCheck;
        b.b = H.ul;
        return b;
    },
    _Universe__lookupTerminalRti(a, b, c) {
        var s,
            r,
            q = a.eC.get(c);
        if (q != null) return q;
        s = new H.Rti(null, null);
        s.y = b;
        s.cy = c;
        r = H._Universe__installTypeTests(a, s);
        a.eC.set(c, r);
        return r;
    },
    _Universe__lookupStarRti(a, b, c) {
        var s,
            r = b.cy + "*",
            q = a.eC.get(r);
        if (q != null) return q;
        s = H.u4(a, b, r, c);
        a.eC.set(r, s);
        return s;
    },
    u4(a, b, c, d) {
        var s, r, q;
        if (d) {
            s = b.y;
            if (!H.isStrongTopType(b))
                r = b === t.P || b === t.T || s === 7 || s === 6;
            else r = true;
            if (r) return b;
        }
        q = new H.Rti(null, null);
        q.y = 6;
        q.z = b;
        q.cy = c;
        return H._Universe__installTypeTests(a, q);
    },
    _Universe__lookupQuestionRti(a, b, c) {
        var s,
            r = b.cy + "?",
            q = a.eC.get(r);
        if (q != null) return q;
        s = H.u3(a, b, r, c);
        a.eC.set(r, s);
        return s;
    },
    u3(a, b, c, d) {
        var s, r, q, p;
        if (d) {
            s = b.y;
            if (!H.isStrongTopType(b))
                if (!(b === t.P || b === t.T))
                    if (s !== 7) r = s === 8 && H.lz(b.z);
                    else r = true;
                else r = true;
            else r = true;
            if (r) return b;
            else if (s === 1 || b === t.aw) return t.P;
            else if (s === 6) {
                q = b.z;
                if (q.y === 8 && H.lz(q.z)) return q;
                else return H.Rti__getQuestionFromStar(a, b);
            }
        }
        p = new H.Rti(null, null);
        p.y = 7;
        p.z = b;
        p.cy = c;
        return H._Universe__installTypeTests(a, p);
    },
    _Universe__lookupFutureOrRti(a, b, c) {
        var s,
            r = b.cy + "/",
            q = a.eC.get(r);
        if (q != null) return q;
        s = H.u1(a, b, r, c);
        a.eC.set(r, s);
        return s;
    },
    u1(a, b, c, d) {
        var s, r, q;
        if (d) {
            s = b.y;
            if (!H.isStrongTopType(b))
                if (!(b === t.c)) r = b === t.K;
                else r = true;
            else r = true;
            if (r || b === t.K) return b;
            else if (s === 1) return H._Universe__lookupInterfaceRti(a, "bl", [b]);
            else if (b === t.P || b === t.T) return t.bG;
        }
        q = new H.Rti(null, null);
        q.y = 8;
        q.z = b;
        q.cy = c;
        return H._Universe__installTypeTests(a, q);
    },
    _Universe__lookupGenericFunctionParameterRti(a, b) {
        var s,
            r,
            q = "" + b + "^",
            p = a.eC.get(q);
        if (p != null) return p;
        s = new H.Rti(null, null);
        s.y = 13;
        s.z = b;
        s.cy = q;
        r = H._Universe__installTypeTests(a, s);
        a.eC.set(q, r);
        return r;
    },
    iv(a) {
        var s,
            r,
            q,
            p = a.length;
        for (s = "", r = "", q = 0; q < p; ++q, r = ",") s += r + a[q].cy;
        return s;
    },
    u0(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = a.length;
        for (s = "", r = "", q = 0; q < m; q += 3, r = ",") {
            p = a[q];
            o = a[q + 1] ? "!" : ":";
            n = a[q + 2].cy;
            s += r + p + o + n;
        }
        return s;
    },
    _Universe__lookupInterfaceRti(a, b, c) {
        var s,
            r,
            q,
            p = b;
        if (c.length > 0) p += "<" + H.iv(c) + ">";
        s = a.eC.get(p);
        if (s != null) return s;
        r = new H.Rti(null, null);
        r.y = 9;
        r.z = b;
        r.Q = c;
        if (c.length > 0) r.c = c[0];
        r.cy = p;
        q = H._Universe__installTypeTests(a, r);
        a.eC.set(p, q);
        return q;
    },
    _Universe__lookupBindingRti(a, b, c) {
        var s, r, q, p, o, n;
        if (b.y === 10) {
            s = b.z;
            r = b.Q.concat(c);
        } else {
            r = c;
            s = b;
        }
        q = s.cy + (";<" + H.iv(r) + ">");
        p = a.eC.get(q);
        if (p != null) return p;
        o = new H.Rti(null, null);
        o.y = 10;
        o.z = s;
        o.Q = r;
        o.cy = q;
        n = H._Universe__installTypeTests(a, o);
        a.eC.set(q, n);
        return n;
    },
    _Universe__lookupFunctionRti(a, b, c) {
        var s,
            r,
            q,
            p,
            o,
            n = b.cy,
            m = c.a,
            l = m.length,
            k = c.b,
            j = k.length,
            i = c.c,
            h = i.length,
            g = "(" + H.iv(m);
        if (j > 0) {
            s = l > 0 ? "," : "";
            r = H.iv(k);
            g += s + "[" + r + "]";
        }
        if (h > 0) {
            s = l > 0 ? "," : "";
            r = H.u0(i);
            g += s + "{" + r + "}";
        }
        q = n + (g + ")");
        p = a.eC.get(q);
        if (p != null) return p;
        o = new H.Rti(null, null);
        o.y = 11;
        o.z = b;
        o.Q = c;
        o.cy = q;
        r = H._Universe__installTypeTests(a, o);
        a.eC.set(q, r);
        return r;
    },
    _Universe__lookupGenericFunctionRti(a, b, c, d) {
        var s,
            r = b.cy + ("<" + H.iv(c) + ">"),
            q = a.eC.get(r);
        if (q != null) return q;
        s = H.u2(a, b, c, r, d);
        a.eC.set(r, s);
        return s;
    },
    u2(a, b, c, d, e) {
        var s, r, q, p, o, n, m, l;
        if (e) {
            s = c.length;
            r = H.ld(s);
            for (q = 0, p = 0; p < s; ++p) {
                o = c[p];
                if (o.y === 1) {
                    r[p] = o;
                    ++q;
                }
            }
            if (q > 0) {
                n = H._substitute(a, b, r, 0);
                m = H._substituteArray(a, c, r, 0);
                return H._Universe__lookupGenericFunctionRti(a, n, m, c !== m);
            }
        }
        l = new H.Rti(null, null);
        l.y = 12;
        l.z = b;
        l.Q = c;
        l.cy = d;
        return H._Universe__installTypeTests(a, l);
    },
    oe(a, b, c, d) {
        return {
            u: a,
            e: b,
            r: c,
            s: [],
            p: 0,
            n: d,
        };
    },
    _Parser_parse(a) {
        var s,
            r,
            q,
            t3,
            array,
            head,
            m,
            l,
            k,
            j,
            i,
            h,
            g = a.r,
            f = a.s;
        for (s = g.length, r = 0; r < s;) {
            q = g.charCodeAt(r);
            if (q >= 48 && q <= 57) r = H._Parser_handleDigit(r + 1, q, g, f);
            else if (((((q | 32) >>> 0) - 97) & 65535) < 26 || q === 95 || q === 36)
                r = H._Parser_handleIdentifier(a, r, g, f, false);
            else if (q === 46) r = H._Parser_handleIdentifier(a, r, g, f, true);
            else {
                ++r;
                switch (q) {
                    case 44:
                        break;
                    case 58:
                        f.push(false);
                        break;
                    case 33:
                        f.push(true);
                        break;
                    case 59:
                        f.push(H._Parser_toType(a.u, a.e, f.pop()));
                        break;
                    case 94:
                        f.push(
                            H._Universe__lookupGenericFunctionParameterRti(a.u, f.pop()),
                        );
                        break;
                    case 35:
                        f.push(H._Universe__lookupTerminalRti(a.u, 5, "#"));
                        break;
                    case 64:
                        f.push(H._Universe__lookupTerminalRti(a.u, 2, "@"));
                        break;
                    case 126:
                        f.push(H._Universe__lookupTerminalRti(a.u, 3, "~"));
                        break;
                    case 60:
                        f.push(a.p);
                        a.p = f.length;
                        break;
                    case 62:
                        t3 = a.u;
                        array = f.splice(a.p);
                        H._Parser_toTypes(a.u, a.e, array);
                        a.p = f.pop();
                        head = f.pop();
                        if (typeof head == "string")
                            f.push(H._Universe__lookupInterfaceRti(t3, head, array));
                        else {
                            m = H._Parser_toType(t3, a.e, head);
                            switch (m.y) {
                                case 11:
                                    f.push(
                                        H._Universe__lookupGenericFunctionRti(t3, m, array, a.n),
                                    );
                                    break;
                                default:
                                    f.push(H._Universe__lookupBindingRti(t3, m, array));
                                    break;
                            }
                        }
                        break;
                    case 38:
                        H._Parser_handleExtendedOperations(a, f);
                        break;
                    case 42:
                        l = a.u;
                        f.push(
                            H._Universe__lookupStarRti(
                                l,
                                H._Parser_toType(l, a.e, f.pop()),
                                a.n,
                            ),
                        );
                        break;
                    case 63:
                        l = a.u;
                        f.push(
                            H._Universe__lookupQuestionRti(
                                l,
                                H._Parser_toType(l, a.e, f.pop()),
                                a.n,
                            ),
                        );
                        break;
                    case 47:
                        l = a.u;
                        f.push(
                            H._Universe__lookupFutureOrRti(
                                l,
                                H._Parser_toType(l, a.e, f.pop()),
                                a.n,
                            ),
                        );
                        break;
                    case 40:
                        f.push(a.p);
                        a.p = f.length;
                        break;
                    case 41:
                        t3 = a.u;
                        k = new H.ib();
                        j = t3.sEA;
                        i = t3.sEA;
                        head = f.pop();
                        if (typeof head == "number")
                            switch (head) {
                                case -1:
                                    j = f.pop();
                                    break;
                                case -2:
                                    i = f.pop();
                                    break;
                                default:
                                    f.push(head);
                                    break;
                            }
                        else f.push(head);
                        array = f.splice(a.p);
                        H._Parser_toTypes(a.u, a.e, array);
                        a.p = f.pop();
                        k.a = array;
                        k.b = j;
                        k.c = i;
                        f.push(
                            H._Universe__lookupFunctionRti(
                                t3,
                                H._Parser_toType(t3, a.e, f.pop()),
                                k,
                            ),
                        );
                        break;
                    case 91:
                        f.push(a.p);
                        a.p = f.length;
                        break;
                    case 93:
                        array = f.splice(a.p);
                        H._Parser_toTypes(a.u, a.e, array);
                        a.p = f.pop();
                        f.push(array);
                        f.push(-1);
                        break;
                    case 123:
                        f.push(a.p);
                        a.p = f.length;
                        break;
                    case 125:
                        array = f.splice(a.p);
                        H._Parser_toTypesNamed(a.u, a.e, array);
                        a.p = f.pop();
                        f.push(array);
                        f.push(-2);
                        break;
                    default:
                        throw "Bad character " + q;
                }
            }
        }
        h = f.pop();
        return H._Parser_toType(a.u, a.e, h);
    },
    _Parser_handleDigit(a, b, c, d) {
        var s,
            r,
            q = b - 48;
        for (s = c.length; a < s; ++a) {
            r = c.charCodeAt(a);
            if (!(r >= 48 && r <= 57)) break;
            q = q * 10 + (r - 48);
        }
        d.push(q);
        return a;
    },
    _Parser_handleIdentifier(parser, start, source, stack, has_period) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = start + 1;
        for (s = source.length; m < s; ++m) {
            r = source.charCodeAt(m);
            if (r === 46) {
                if (has_period) break;
                has_period = true;
            } else {
                if (!(((((r | 32) >>> 0) - 97) & 65535) < 26 || r === 95 || r === 36))
                    q = r >= 48 && r <= 57;
                else q = true;
                if (!q) break;
            }
        }
        p = source.substring(start, m);
        if (has_period) {
            s = parser.u;
            o = parser.e;
            if (o.y === 10) o = o.z;
            n = H.ua(s, o.z)[p];
            if (n == null)
                H.throw_expression(
                    'No "' + p + '" in "' + H.Rti__getCanonicalRecipe(o) + '"',
                );
            stack.push(H._Universe_evalInEnvironment(s, o, n));
        } else stack.push(p);
        return m;
    },
    _Parser_handleExtendedOperations(a, stack) {
        var s = stack.pop();
        if (0 === s) {
            stack.push(H._Universe__lookupTerminalRti(a.u, 1, "0&"));
            return;
        }
        if (1 === s) {
            stack.push(H._Universe__lookupTerminalRti(a.u, 4, "1&"));
            return;
        }
        throw H.wrap_expression(
            P.iP("Unexpected extended operation " + H.as_string(s)),
        );
    },
    _Parser_toType(a, b, c) {
        if (typeof c == "string")
            return H._Universe__lookupInterfaceRti(a, c, a.sEA);
        else if (typeof c == "number") return H._Parser_indexToType(a, b, c);
        else return c;
    },
    _Parser_toTypes(a, b, c) {
        var s,
            r = c.length;
        for (s = 0; s < r; ++s) c[s] = H._Parser_toType(a, b, c[s]);
    },
    _Parser_toTypesNamed(a, b, c) {
        var s,
            r = c.length;
        for (s = 2; s < r; s += 3) c[s] = H._Parser_toType(a, b, c[s]);
    },
    _Parser_indexToType(a, b, c) {
        var s,
            r,
            q = b.y;
        if (q === 10) {
            if (c === 0) return b.z;
            s = b.Q;
            r = s.length;
            if (c <= r) return s[c - 1];
            c -= r;
            b = b.z;
            q = b.y;
        } else if (c === 0) return b;
        if (q !== 9)
            throw H.wrap_expression(P.iP("Indexed base must be an interface type"));
        s = b.Q;
        if (c <= s.length) return s[c - 1];
        throw H.wrap_expression(P.iP("Bad index " + c + " for " + b.k(0)));
    },
    _isSubtype(a, b, c, d, e) {
        var s, r, q, p, o, n, m, l, k, j;
        if (b === d) return true;
        if (!H.isStrongTopType(d))
            if (!(d === t.c)) s = d === t.K;
            else s = true;
        else s = true;
        if (s) return true;
        r = b.y;
        if (r === 4) return true;
        if (H.isStrongTopType(b)) return false;
        if (b.y !== 1) s = b === t.P || b === t.T;
        else s = true;
        if (s) return true;
        q = r === 13;
        if (q) if (H._isSubtype(a, c[b.z], c, d, e)) return true;
        p = d.y;
        if (r === 6) return H._isSubtype(a, b.z, c, d, e);
        if (p === 6) {
            s = d.z;
            return H._isSubtype(a, b, c, s, e);
        }
        if (r === 8) {
            if (!H._isSubtype(a, b.z, c, d, e)) return false;
            return H._isSubtype(a, H.Rti__getFutureFromFutureOr(a, b), c, d, e);
        }
        if (r === 7) {
            s = H._isSubtype(a, b.z, c, d, e);
            return s;
        }
        if (p === 8) {
            if (H._isSubtype(a, b, c, d.z, e)) return true;
            return H._isSubtype(a, b, c, H.Rti__getFutureFromFutureOr(a, d), e);
        }
        if (p === 7) {
            s = H._isSubtype(a, b, c, d.z, e);
            return s;
        }
        if (q) return false;
        s = r !== 11;
        if ((!s || r === 12) && d === t.Z) return true;
        if (p === 12) {
            if (b === t.O) return true;
            if (r !== 12) return false;
            o = b.Q;
            n = d.Q;
            m = o.length;
            if (m !== n.length) return false;
            c = c == null ? o : o.concat(c);
            e = e == null ? n : n.concat(e);
            for (l = 0; l < m; ++l) {
                k = o[l];
                j = n[l];
                if (!H._isSubtype(a, k, c, j, e) || !H._isSubtype(a, j, e, k, c))
                    return false;
            }
            return H._isFunctionSubtype(a, b.z, c, d.z, e);
        }
        if (p === 11) {
            if (b === t.O) return true;
            if (s) return false;
            return H._isFunctionSubtype(a, b, c, d, e);
        }
        if (r === 9) {
            if (p !== 9) return false;
            return H._isFunctionSubtype(a, b, c, d, e);
        }
        return false;
    },
    _isFunctionSubtype(a2, a3, a4, a5, a6) {
        var s, r, q, p, o, n, m, l, k, j, i, h, g, f, e, d, c, b, a, a0, a1;
        if (!H._isSubtype(a2, a3.z, a4, a5.z, a6)) return false;
        s = a3.Q;
        r = a5.Q;
        q = s.a;
        p = r.a;
        o = q.length;
        n = p.length;
        if (o > n) return false;
        m = n - o;
        l = s.b;
        k = r.b;
        j = l.length;
        i = k.length;
        if (o + j < n + i) return false;
        for (h = 0; h < o; ++h) {
            g = q[h];
            if (!H._isSubtype(a2, p[h], a6, g, a4)) return false;
        }
        for (h = 0; h < m; ++h) {
            g = l[h];
            if (!H._isSubtype(a2, p[o + h], a6, g, a4)) return false;
        }
        for (h = 0; h < i; ++h) {
            g = l[m + h];
            if (!H._isSubtype(a2, k[h], a6, g, a4)) return false;
        }
        f = s.c;
        e = r.c;
        d = f.length;
        c = e.length;
        for (b = 0, a = 0; a < c; a += 3) {
            a0 = e[a];
            while (true) {
                if (b >= d) return false;
                a1 = f[b];
                b += 3;
                if (a0 < a1) return false;
                if (a1 < a0) continue;
                g = f[b - 1];
                if (!H._isSubtype(a2, e[a + 2], a6, g, a4)) return false;
                break;
            }
        }
        return true;
    },
    _isFunctionSubtype(a, b, c, d, e) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l = b.z,
            k = d.z;
        while (l !== k) {
            s = a.tR[l];
            if (s == null) return false;
            if (typeof s == "string") {
                l = s;
                continue;
            }
            r = s[k];
            if (r == null) return false;
            q = r.length;
            p = q > 0 ? new Array(q) : init.typeUniverse.sEA;
            for (o = 0; o < q; ++o)
                p[o] = H._Universe_evalInEnvironment(a, b, r[o]);
            return H.om(a, p, null, c, d.Q, e);
        }
        n = b.Q;
        m = d.Q;
        return H.om(a, n, null, c, m, e);
    },
    om(a, b, c, d, e, f) {
        var s,
            r,
            q,
            p = b.length;
        for (s = 0; s < p; ++s) {
            r = b[s];
            q = e[s];
            if (!H._isSubtype(a, r, d, q, f)) return false;
        }
        return true;
    },
    lz(a) {
        var s,
            r = a.y;
        if (!(a === t.P || a === t.T))
            if (!H.isStrongTopType(a))
                if (r !== 7)
                    if (!(r === 6 && H.lz(a.z))) s = r === 8 && H.lz(a.z);
                    else s = true;
                else s = true;
            else s = true;
        else s = true;
        return s;
    },
    v0(a) {
        var s;
        if (!H.isStrongTopType(a))
            if (!(a === t.c)) s = a === t.K;
            else s = true;
        else s = true;
        return s;
    },
    isStrongTopType(a) {
        var kind = a.y;
        // t.cK nullable_Object
        return kind === 2 || kind === 3 || kind === 4 || kind === 5 || a === t.cK;
    },
    ol(a, b) {
        var s,
            r,
            q = Object.keys(b),
            p = q.length;
        for (s = 0; s < p; ++s) {
            r = q[s];
            a[r] = b[r];
        }
    },
    ld(a) {
        return a > 0 ? new Array(a) : init.typeUniverse.sEA;
    },
    Rti: function Rti(a, b) {
        this.a = a;
        this.b = b;
        this.x = this.r = this.c = null;
        this.y = 0;
        this.cy = this.cx = this.ch = this.Q = this.z = null;
    },
    ib: function ib() {
        this.c = this.b = this.a = null;
    },
    iu: function iu(a) {
        this.a = a;
    },
    i9: function i9() { },
    eI: function eI(a) {
        this.a = a;
    },
    ve(a) {
        if (typeof dartPrint == "function") {
            dartPrint(a);
            return;
        }
        if (typeof console == "object" && typeof console.log != "undefined") {
            console.log(a);
            return;
        }
        if (typeof window == "object") return;
        if (typeof print == "function") {
            print(a);
            return;
        }
        throw "Unable to print message: " + String(a);
    },
    throwLateInitializationError(a) {
        return H.throw_expression(
            new H.fz(
                "Field '" +
                H.as_string(a) +
                "' has been assigned during initialization.",
            ),
        );
    },
},
    J = {
        makeDispatchRecord(a, b, c, d) {
            return {
                i: a,
                p: b,
                e: c,
                x: d,
            };
        },
        getNativeInterceptor(a) {
            var proto,
                r,
                q,
                interceptor,
                o,
                n = a[init.dispatchPropertyName];
            if (n == null)
                if ($.mA == null) {
                    H.initNativeDispatch();
                    n = a[init.dispatchPropertyName];
                }
            if (n != null) {
                proto = n.p;
                if (false === proto) return n.i;
                if (true === proto) return a;
                r = Object.getPrototypeOf(a);
                if (proto === r) return n.i;
                if (n.e === r)
                    throw H.wrap_expression(
                        P.hT("Return interceptor for " + H.as_string(proto(a, n))),
                    );
            }
            q = a.constructor;
            if (q == null) interceptor = null;
            else {
                o = $.kU;
                if (o == null) o = $.kU = init.getIsolateTag("_$dart_js");
                interceptor = q[o];
            }
            if (interceptor != null) return interceptor;

            // interceptor = H.lookupAndCacheInterceptor(a)
            // if (interceptor != null) return interceptor

            if (typeof a == "function") return C.JavaScriptFunction;
            proto = Object.getPrototypeOf(a);
            if (proto == null) return C.PlainJavaScriptObject;
            if (proto === Object.prototype) return C.PlainJavaScriptObject;
            if (typeof q == "function") {
                o = $.kU;
                if (o == null) o = $.kU = init.getIsolateTag("_$dart_js");
                Object.defineProperty(q, o, {
                    value: C.UnknownJavaScriptObject,
                    enumerable: false,
                    writable: true,
                    configurable: true,
                });
                return C.UnknownJavaScriptObject;
            }
            return C.UnknownJavaScriptObject;
        },
        rZ(a, b) {
            if (!H.aP(a))
                throw H.wrap_expression(P.da(a, "length", "is not an integer"));
            if (a < 0 || a > 4294967295)
                throw H.wrap_expression(P.a8(a, 0, 4294967295, "length", null));
            return J.t0(new Array(a), b);
        },
        t_(a, b) {
            if (!H.aP(a) || a < 0)
                throw H.wrap_expression(
                    P.bz(
                        "Length must be a non-negative integer: " + H.as_string(a),
                        null,
                    ),
                );
            return H.b(new Array(a), b.i("E<0>"));
        },
        t0(a, b) {
            return J.nL(H.b(a, b.i("E<0>")));
        },
        nL(a) {
            a.fixed$length = Array;
            return a;
        },
        t1(a, b) {
            return J.lV(a, b);
        },
        check_str_legeal(a) {
            if (a < 256)
                switch (a) {
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 32:
                    case 133:
                    case 160:
                        return true;
                    default:
                        return false;
                }
            switch (a) {
                case 5760:
                case 8192:
                case 8193:
                case 8194:
                case 8195:
                case 8196:
                case 8197:
                case 8198:
                case 8199:
                case 8200:
                case 8201:
                case 8202:
                case 8232:
                case 8233:
                case 8239:
                case 8287:
                case 12288:
                case 65279:
                    return true;
                default:
                    return false;
            }
        },
        check_from_start(a, b) {
            var s, r;
            for (s = a.length; b < s;) {
                r = C.String.a8(a, b);
                if (r !== 32 && r !== 13 && !J.check_str_legeal(r)) break;
                ++b;
            }
            return b;
        },
        check_from_end(a, b) {
            var s, r;
            for (; b > 0; b = s) {
                s = b - 1;
                r = C.String.aQ(a, s);
                if (r !== 32 && r !== 13 && !J.check_str_legeal(r)) break;
            }
            return b;
        },
        cV(a) {
            if (typeof a == "number") {
                if (Math.floor(a) == a) return J.JsInt.prototype;
                return J.jF.prototype;
            }
            if (typeof a == "string") return J.JsString.prototype;
            if (a == null) return J.cs.prototype;
            if (typeof a == "boolean") return J.fw.prototype;
            if (a.constructor == Array) return J.JsArray.prototype;
            if (typeof a != "object") {
                if (typeof a == "function") return J.JavaScriptFunction.prototype;
                return a;
            }
            if (a instanceof P.Object) return a;
            return J.getNativeInterceptor(a);
        },
        a3(a) {
            if (typeof a == "string") return J.JsString.prototype;
            if (a == null) return a;
            if (a.constructor == Array) return J.JsArray.prototype;
            if (typeof a != "object") {
                if (typeof a == "function") return J.JavaScriptFunction.prototype;
                return a;
            }
            if (a instanceof P.Object) return a;
            return J.getNativeInterceptor(a);
        },
        cW(a) {
            if (a == null) return a;
            if (a.constructor == Array) return J.JsArray.prototype;
            if (typeof a != "object") {
                if (typeof a == "function") return J.JavaScriptFunction.prototype;
                return a;
            }
            if (a instanceof P.Object) return a;
            return J.getNativeInterceptor(a);
        },
        oA(a) {
            if (typeof a == "number") return J.JsNumber.prototype;
            if (typeof a == "string") return J.JsString.prototype;
            if (a == null) return a;
            if (!(a instanceof P.Object)) return J.UnknownJavaScriptObject.prototype;
            return a;
        },
        aQ(a) {
            if (typeof a == "string") return J.JsString.prototype;
            if (a == null) return a;
            if (!(a instanceof P.Object)) return J.UnknownJavaScriptObject.prototype;
            return a;
        },
        uR(a) {
            if (a == null) return J.cs.prototype;
            if (!(a instanceof P.Object)) return J.UnknownJavaScriptObject.prototype;
            return a;
        },
        bv(a) {
            if (a == null) return a;
            if (typeof a != "object") {
                if (typeof a == "function") return J.JavaScriptFunction.prototype;
                return a;
            }
            if (a instanceof P.Object) return a;
            return J.getNativeInterceptor(a);
        },
        uS(a) {
            if (a == null) return a;
            if (!(a instanceof P.Object)) return J.UnknownJavaScriptObject.prototype;
            return a;
        },
        iN(a, b) {
            if (typeof a == "number" && typeof b == "number") return a + b;
            return J.oA(a).B(a, b);
        },
        Y(a, b) {
            if (a == null) return b == null;
            if (typeof a != "object") return b != null && a === b;
            return J.cV(a).aW(a, b);
        },
        J(a, b) {
            if (typeof b === "number")
                if (
                    a.constructor == Array ||
                    typeof a == "string" ||
                    H.oG(a, a[init.dispatchPropertyName])
                )
                    if (b >>> 0 === b && b < a.length) return a[b];
            return J.a3(a).h(a, b);
        },
        lT(a, b, c) {
            if (typeof b === "number")
                if (
                    (a.constructor == Array || H.oG(a, a[init.dispatchPropertyName])) &&
                    !a.immutable$list &&
                    b >>> 0 === b &&
                    b < a.length
                )
                    return (a[b] = c);
            return J.cW(a).m(a, b, c);
        },
        rr(a, b) {
            return J.cW(a).a5(a, b);
        },
        rs(a, b, c, d) {
            // add_event_listener
            return J.bv(a).eF(a, b, c, d);
        },
        lU(a, b) {
            return J.aQ(a).de(a, b);
        },
        rt(a, b, c) {
            return J.aQ(a).bK(a, b, c);
        },
        ny(a, b) {
            return J.aQ(a).aQ(a, b);
        },
        lV(a, b) {
            return J.oA(a).bg(a, b);
        },
        lW(a, b) {
            return J.a3(a).w(a, b);
        },
        lX(a, b, c) {
            return J.a3(a).dh(a, b, c);
        },
        iO(a, b, c, d) {
            return J.bv(a).eQ(a, b, c, d);
        },
        ru(a, b) {
            return J.cW(a).ai(a, b);
        },
        nz(a, b) {
            return J.aQ(a).cl(a, b);
        },
        bj(a, b, c, d, e) {
            return J.bv(a).eR(a, b, c, d, e);
        },
        lY(a, b) {
            return J.cW(a).aw(a, b);
        },
        rv(a) {
            return J.bv(a).geH(a);
        },
        cm(a) {
            return J.bv(a).gck(a);
        },
        lZ(a) {
            return J.cV(a).gak(a);
        },
        by(a) {
            return J.cW(a).ga0(a);
        },
        aw(a) {
            return J.a3(a).gp(a);
        },
        m_(a, b) {
            return J.a3(a).aT(a, b);
        },
        rw(a, b, c) {
            return J.aQ(a).dq(a, b, c);
        },
        m0(a, b, c) {
            return J.bv(a).dt(a, b, c);
        },
        nA(a) {
            return J.cW(a).fq(a);
        },
        rx(a) {
            return J.bv(a).fv(a);
        },
        ry(a, b) {
            // set a length -> b
            return J.a3(a).sp(a, b);
        },
        m1(a, b) {
            return J.aQ(a).bA(a, b);
        },
        rz(a, b, c) {
            // call a.step()
            return J.uS(a).dN(a, b, c);
        },
        nB(a, b) {
            return J.aQ(a).ay(a, b);
        },
        rA(a, b, c) {
            return J.aQ(a).af(a, b, c);
        },
        rB(a) {
            return J.aQ(a).fN(a);
        },
        b4(a) {
            return J.cV(a).k(a);
        },
        rC(a, b, c, d, e, f, g) {
            return J.bv(a).fO(a, b, c, d, e, f, g);
        },
        rD(a) {
            // return J.aQ(a).trim_name(a)
            J.JsString.prototype.trim_name(a);
        },
        Interceptor: function af() { },
        fw: function fw() { },
        cs: function cs() { },
        bE: function bE() { },
        PlainJavaScriptObject: function fO() { },
        UnknownJavaScriptObject: function bs() { },
        JavaScriptFunction: function bn() { },
        JsArray: function E(a) {
            this.$ti = a;
        },
        JsUnmodifiableArray: function jG(a) {
            this.$ti = a;
        },
        db: function db(a, b) {
            this.a = a;
            this.b = b;
            this.c = 0;
            this.d = null;
        },
        JsNumber: function dA() { },
        JsInt: function dz() { },
        jF: function jF() { },
        JsString: function bD() { },
    },
    L = {
        ProfileWinChance: function iR(a, b, c, d, e, f, g) {
            this.a = a;
            this.b = b;
            this.c = 1000;
            this.d = 33554431;
            this.e = c;
            this.f = d;
            this.r = e;
            this.x = f;
            this.z = this.y = 0;
            this.Q = null;
            this.ch = g;
        },
        iS: function iS() { },
        iT: function iT() { },
        iU: function iU(a) {
            this.a = a;
        },
    },
    LangData = {
        eQ(a) {
            var s, r, q, p, o, n;
            a.toString;
            s = new H.ff(a);
            s = new H.cv(s, s.gp(s));
            r = 7;
            q = 5;
            p = 3;
            o = 1;
            while (s.u()) {
                n = s.d;
                r = C.JsInt.V((r + n + o) * 17, 52);
                q = C.JsInt.V((q + n * r) * 23, 52);
                p = C.JsInt.V((p + n + q) * 47, 52);
                o = C.JsInt.V((o + n * p) * 13, 52);
            }
            r = r < 26 ? r + 65 : r + 71;
            q = q < 26 ? q + 65 : q + 71;
            p = p < 26 ? p + 65 : p + 71;
            return P.mh(H.b([r, q, p, o < 26 ? o + 65 : o + 71], t.i), 0, null);
        },
        j(a, b) {
            // let result = C.e.bt(0, X.f4(a, b))
            const result = C.T_kk.ab(X.f4(a, b));
            logger.debug("O.j", a, b, result);
            return result;
        },
        get_lang(a) {
            var s = $.od.h(0, a);
            logger.debug("O.d", a, s);
            if (s == null) return "";
            return s;
        },
        load_lang(a) {
            J.lY(a, new LangData.lA());
        },
        lA: function lA() { },
        fZ(a) {
            var s = H.b([0], t.i);
            C.Array.a5(s, C.e.gaB().ab(a));
            return s;
        },
        SuperRC4: function b9() {
            this.b = this.a = 0;
            this.c = null;
        },
        k_: function k_(a, b) {
            this.a = a;
            this.b = b;
        },
        oC(a) {
            var s,
                r,
                q = "deepmess.com";
            if (a) {
                s = new Y.RC4();
                s.bd(C.e.gaB().ab(q), 2);
                s.di(H.b([32, 46, 189, 177, 148, 32], t.i));
                return s;
            } else {
                r = new Y.RC4();
                r.bd(C.e.gaB().ab(q), 1);
                return r;
            }
        },
    },
    P = {
        _AsyncRun__initializeScheduleImmediate() {
            var s,
                r,
                q = {};
            if (self.scheduleImmediate != null) {
                return P.uK();
            }
            if (self.MutationObserver != null && self.document != null) {
                s = self.document.createElement("div");
                r = self.document.createElement("span");
                q.a = null;
                new self.MutationObserver(
                    H.convert_dart_closure_to_js_md5(new P.kB(q), 1),
                ).observe(s, {
                    childList: true,
                });
                return new P._AsyncRun__initializeScheduleImmediate_closure(q, s, r);
            } else if (self.setImmediate != null) {
                // _AsyncRun__scheduleImmediateWithSetImmediate
                return P.uL();
            }
            // _AsyncRun__scheduleImmediateWithTimer
            return P.uM();
        },
        _AsyncRun__scheduleImmediateJsOverride(a) {
            self.scheduleImmediate(H.convert_dart_closure_to_js_md5(new P.kC(a), 0));
        },
        _AsyncRun__scheduleImmediateWithSetImmediate(a) {
            self.setImmediate(H.convert_dart_closure_to_js_md5(new P.kD(a), 0));
        },
        _AsyncRun__scheduleImmediateWithTimer(a) {
            P.Timer__createTimer(C.I, a);
        },
        Timer__createTimer(a, b) {
            var s = C.JsInt.ag(a.a, 1000);
            return P.Timerimpl(s < 0 ? 0 : s, b);
        },
        Timerimpl(a, b) {
            var s = new P._TimerImpl();
            s.e8(a, b);
            return s;
        },
        _makeAsyncAwaitCompleter(a) {
            return new P.i_(new P._Future($.P, a.i("U<0>")), a.i("i_<0>"));
        },
        _asyncStartSync(a, b) {
            a.$2(0, null);
            // a(0, null)
            b.b = true;
            return b.a;
        },
        _asyncAwait(a, b) {
            P._awaitOnObject(a, b);
        },
        _asyncReturn(a, b) {
            b.bM(0, a);
        },
        async_rethrow(a, b) {
            b.cj(H.unwrap_Exception(a), H.getTraceFromException(a));
        },
        _awaitOnObject(object, body_function) {
            var s,
                future,
                q = new P._awaitOnObject_closure(body_function),
                p = new P._awaitOnObject_closure0(body_function);
            if (object instanceof P._Future) object.d7(q, p, t.z);
            else {
                s = t.z;
                if (t.h.b(object)) object.cz(q, p, s);
                else {
                    future = new P._Future($.P, t.eI);
                    future.a = 8;
                    future.c = object;
                    future.d7(q, p, s);
                }
            }
        },
        _wrapJsFunctionForAsync(func) {
            var protected_func = ((fn, error_) => (error_code, async_result) => {
                while (true)
                    try {
                        if (run_env.from_code) {
                            // console.log("O._wrapJsFunctionForAsync", error_code, async_result)
                        }
                        fn(error_code, async_result);
                        break;
                    } catch (error) {
                        console.error(error.stack);
                        async_result = error;
                        error_code = error_;
                    }
            })(func, 1);
            return $.P.ct(new P._wrapJsFunctionForAsync_closure(protected_func));
        },
        async_error(a, b) {
            var s = H.ls(a, "error", t.K);
            return new P.f3(s, b == null ? P.AsyncError_defaultStackTrace(a) : b);
        },
        AsyncError_defaultStackTrace(a) {
            var s;
            if (t.u.b(a)) {
                s = a.gbz();
                if (s != null) return s;
            }
            return C.G;
        },
        future_future_delayed(a, b) {
            var s = new P._Future($.P, b.i("U<0>"));
            P.Timer_Timer(a, new P.jp(null, s, b));
            return s;
        },
        rM(a) {
            return new P.cg(new P._Future($.P, a.i("U<0>")), a.i("cg<0>"));
        },
        _Future__chainCoreFuture(a, b) {
            var s, r;
            while (((s = a.a), (s & 4) !== 0)) a = a.c;
            if ((s & 24) !== 0) {
                r = b.bI();
                b.c1(a);
                P._Future__propagateToListeners(b, r);
            } else {
                r = b.c;
                b.a = (b.a & 1) | 4;
                b.c = a;
                a.d3(r);
            }
        },
        _Future__propagateToListeners(a, b) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f = {},
                t1 = (f.a = a);
            for (s = t.h; true;) {
                r = {};
                q = t1.a;
                p = (q & 16) === 0;
                o = !p;
                if (b == null) {
                    if (o && (q & 1) === 0) {
                        t1 = t1.c;
                        P._rootHandleUncaughtError(t1.a, t1.b);
                    }
                    return;
                }
                r.a = b;
                n = b.a;
                for (t1 = b; n != null; t1 = n, n = m) {
                    t1.a = null;
                    P._Future__propagateToListeners(f.a, t1);
                    r.a = n;
                    m = n.a;
                }
                q = f.a;
                l = q.c;
                r.b = o;
                r.c = l;
                if (p) {
                    k = t1.c;
                    k = (k & 1) !== 0 || (k & 15) === 8;
                } else k = true;
                if (k) {
                    j = t1.b.b;
                    if (o) {
                        q = q.b === j;
                        q = !(q || q);
                    } else q = false;
                    if (q) {
                        P._rootHandleUncaughtError(l.a, l.b);
                        return;
                    }
                    i = $.P;
                    if (i !== j) $.P = j;
                    else i = null;
                    t1 = t1.c;
                    if ((t1 & 15) === 8)
                        new P._Future__propagateToListeners_handleWhenCompleteCallback(
                            r,
                            f,
                            o,
                        ).$0();
                    else if (p) {
                        if ((t1 & 1) !== 0)
                            new P._Future__propagateToListeners_handleValueCallback(
                                r,
                                l,
                            ).$0();
                    } else if ((t1 & 2) !== 0)
                        new P._Future__propagateToListeners_handleError(f, r).$0();
                    if (i != null) $.P = i;
                    t1 = r.c;
                    if (s.b(t1)) {
                        q = r.a.$ti;
                        q = q.i("bl<2>").b(t1) || !q.Q[1].b(t1);
                    } else q = false;
                    if (q) {
                        h = r.a.b;
                        if (t1 instanceof P._Future)
                            if ((t1.a & 24) !== 0) {
                                g = h.c;
                                h.c = null;
                                b = h.bJ(g);
                                h.a = (t1.a & 30) | (h.a & 1);
                                h.c = t1.c;
                                f.a = t1;
                                continue;
                            } else P._Future__chainCoreFuture(t1, h);
                        else h.cV(t1);
                        return;
                    }
                }
                h = r.a.b;
                g = h.c;
                h.c = null;
                b = h.bJ(g);
                t1 = r.b;
                q = r.c;
                if (!t1) {
                    h.a = 8;
                    h.c = q;
                } else {
                    h.a = (h.a & 1) | 16;
                    h.c = q;
                }
                f.a = h;
                t1 = h;
            }
        },
        _registerErrorHandler(a, b) {
            if (t.C.b(a)) return b.ct(a);
            if (t.J.b(a)) return a;
            throw H.wrap_expression(P.da(a, "onError", u.c));
        },
        _microtaskLoop() {
            var s, r;
            for (s = $.cR; s != null; s = $.cR) {
                $.eO = null;
                r = s.b;
                $.cR = r;
                if (r == null) $.eN = null;
                s.a.$0();
            }
        },
        _startMicrotaskLoop() {
            $.ms = true;
            try {
                P._microtaskLoop();
            } finally {
                $.eO = null;
                $.ms = false;
                if ($.cR != null) $.nw().$1(P.ow());
            }
        },
        _scheduleAsyncCallback(a) {
            var s = new P.i0(a),
                r = $.eN;
            if (r == null) {
                $.cR = $.eN = s;
                if (!$.ms) {
                    $.nw().$1(P.ow());
                }
            } else $.eN = r.b = s;
        },
        _schedulePriorityAsyncCallback(a) {
            var s,
                r,
                q,
                p = $.cR;
            if (p == null) {
                P._scheduleAsyncCallback(a);
                $.eO = $.eN;
                return;
            }
            s = new P.i0(a);
            r = $.eO;
            if (r == null) {
                s.b = p;
                $.cR = $.eO = s;
            } else {
                q = r.b;
                s.b = q;
                $.eO = r.b = s;
                if (q == null) $.eN = s;
            }
        },
        scheduleMicrotask(a) {
            var s = null,
                r = $.P;
            if (C.f === r) {
                P.cS(s, s, C.f, a);
                return;
            }
            P.cS(s, s, r, r.cf(a));
        },
        StreamIterator_StreamIterator(a) {
            H.ls(a, "stream", t.K);
            return new P.io();
        },
        mu(a) {
            // what?
            return;
        },
        tS(a, b) {
            if (b == null) b = P.uN();
            if (t.da.b(b)) return a.ct(b);
            if (t.aX.b(b)) return b;
            throw H.wrap_expression(
                P.bz(
                    "handleError callback must take either an Object (the error), or both an Object (the error) and a StackTrace.",
                    null,
                ),
            );
        },
        ux(a, b) {
            P._rootHandleUncaughtError(a, b);
        },
        Timer_Timer(a, b) {
            var s = $.P;
            if (s === C.f) return P.Timer__createTimer(a, b);
            return P.Timer__createTimer(a, s.cf(b));
        },
        _rootHandleUncaughtError(a, b) {
            P._schedulePriorityAsyncCallback(new P.lo(a, b));
        },
        os(a, b, c, d) {
            var s,
                r = $.P;
            if (r === c) return d.$0();
            $.P = c;
            s = r;
            try {
                r = d.$0();
                return r;
            } finally {
                $.P = s;
            }
        },
        _rootRun(a, b, c, d, e) {
            var s,
                r = $.P;
            if (r === c) return d.$1(e);
            $.P = c;
            s = r;
            try {
                r = d.$1(e);
                return r;
            } finally {
                $.P = s;
            }
        },
        _rootRunUnary(a, b, c, d, e, f) {
            var s,
                r = $.P;
            if (r === c) return d.$2(e, f);
            $.P = c;
            s = r;
            try {
                r = d.$2(e, f);
                return r;
            } finally {
                $.P = s;
            }
        },
        cS(a, b, c, d) {
            if (C.f !== c) d = c.cf(d);
            P._scheduleAsyncCallback(d);
        },
        kB: function kB(a) {
            this.a = a;
        },
        _AsyncRun__initializeScheduleImmediate_closure: function kA(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        kC: function kC(a) {
            this.a = a;
        },
        kD: function kD(a) {
            this.a = a;
        },
        _TimerImpl: function l8() { },
        _TimerImpl_internalCallback: function l9(a, b) {
            this.a = a;
            this.b = b;
        },
        i_: function i_(a, b) {
            this.a = a;
            this.b = false;
            this.$ti = b;
        },
        _awaitOnObject_closure: function lh(a) {
            this.a = a;
        },
        _awaitOnObject_closure0: function li(a) {
            this.a = a;
        },
        _wrapJsFunctionForAsync_closure: function lr(a) {
            this.a = a;
        },
        f3: function f3(a, b) {
            this.a = a;
            this.b = b;
        },
        jp: function jp(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        i4: function i4() { },
        cg: function cg(a, b) {
            this.a = a;
            this.$ti = b;
        },
        _FutureListener: function cN(a, b, c, d, e) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.d = c;
            this.e = d;
            this.$ti = e;
        },
        _Future: function U(a, b) {
            this.a = 0;
            this.b = a;
            this.c = null;
            this.$ti = b;
        },
        kH: function kH(a, b) {
            this.a = a;
            this.b = b;
        },
        kO: function kO(a, b) {
            this.a = a;
            this.b = b;
        },
        kK: function kK(a) {
            this.a = a;
        },
        kL: function kL(a) {
            this.a = a;
        },
        kM: function kM(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        kJ: function kJ(a, b) {
            this.a = a;
            this.b = b;
        },
        kN: function kN(a, b) {
            this.a = a;
            this.b = b;
        },
        kI: function kI(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        _Future__propagateToListeners_handleWhenCompleteCallback: function kR(
            a,
            b,
            c,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        _Future__propagateToListeners_handleWhenCompleteCallback_closure:
            function kS(a) {
                this.a = a;
            },
        _Future__propagateToListeners_handleValueCallback: function kQ(a, b) {
            this.a = a;
            this.b = b;
        },
        _Future__propagateToListeners_handleError: function kP(a, b) {
            this.a = a;
            this.b = b;
        },
        i0: function i0(a) {
            this.a = a;
            this.b = null;
        },
        em: function em() { },
        ke: function ke(a, b) {
            this.a = a;
            this.b = b;
        },
        kf: function kf(a, b) {
            this.a = a;
            this.b = b;
        },
        hO: function hO() { },
        hP: function hP() { },
        im: function im() { },
        l2: function l2(a) {
            this.a = a;
        },
        i1: function i1() { },
        cK: function cK(a, b, c, d) {
            this.a = null;
            this.b = 0;
            this.d = a;
            this.e = b;
            this.f = c;
            this.$ti = d;
        },
        cM: function cM(a, b) {
            this.a = a;
            this.$ti = b;
        },
        i5: function i5(a, b, c, d) {
            this.x = a;
            this.a = b;
            this.d = c;
            this.e = d;
            this.r = null;
        },
        i3: function i3() { },
        eF: function eF() { },
        i7: function i7() { },
        er: function er(a) {
            this.b = a;
            this.a = null;
        },
        ii: function ii() { },
        kW: function kW(a, b) {
            this.a = a;
            this.b = b;
        },
        eG: function eG() {
            this.c = this.b = null;
            this.a = 0;
        },
        io: function io() { },
        lf: function lf() { },
        lo: function lo(a, b) {
            this.a = a;
            this.b = b;
        },
        _RootZone: function kX() { },
        kY: function kY(a, b) {
            this.a = a;
            this.b = b;
        },
        _RootZone_bindCallback_closure: function kZ(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        create_meta_map(a, b) {
            return new H.JsLinkedHashMap(a.i("@<0>").aL(b).i("aT<1,2>"));
        },
        create_StringInt_map(a, b, c) {
            // Map<String, int>
            return H.uQ(a, new H.JsLinkedHashMap(b.i("@<0>").aL(c).i("aT<1,2>")));
        },
        cu(a, b) {
            return new H.JsLinkedHashMap(a.i("@<0>").aL(b).i("aT<1,2>"));
        },
        c5(a) {
            return new P.eu(a.i("eu<0>"));
        },
        ml() {
            var s = Object.create(null);
            s["<non-identifier-key>"] = s;
            delete s["<non-identifier-key>"];
            return s;
        },
        rX(a, b, c) {
            var s, r;
            if (P.mt(a)) {
                if (b === "(" && c === ")") return "(...)";
                return b + "..." + c;
            }
            s = H.b([], t.s);
            $.ch.push(a);
            try {
                P.uu(a, s);
            } finally {
                $.ch.pop();
            }
            r = P.o7(b, s, ", ") + c;
            return r.charCodeAt(0) == 0 ? r : r;
        },
        IterableBase_iterableToFullString(a, b, c) {
            var s, r;
            if (P.mt(a)) return b + "..." + c;
            s = new P.cH(b);
            $.ch.push(a);
            try {
                r = s;
                r.a = P.o7(r.a, a, ", ");
            } finally {
                $.ch.pop();
            }
            s.a += c;
            r = s.a;
            return r.charCodeAt(0) == 0 ? r : r;
        },
        mt(a) {
            var s, r;
            for (s = $.ch.length, r = 0; r < s; ++r) if (a === $.ch[r]) return true;
            return false;
        },
        uu(a, b) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l = a.ga0(a),
                k = 0,
                j = 0;
            while (true) {
                if (!(k < 80 || j < 3)) break;
                if (!l.u()) return;
                s = H.as_string(l.gC());
                b.push(s);
                k += s.length + 2;
                ++j;
            }
            if (!l.u()) {
                if (j <= 5) return;
                r = b.pop();
                q = b.pop();
            } else {
                p = l.gC();
                ++j;
                if (!l.u()) {
                    if (j <= 4) {
                        b.push(H.as_string(p));
                        return;
                    }
                    r = H.as_string(p);
                    q = b.pop();
                    k += r.length + 2;
                } else {
                    o = l.gC();
                    ++j;
                    for (; l.u(); p = o, o = n) {
                        n = l.gC();
                        ++j;
                        if (j > 100) {
                            while (true) {
                                if (!(k > 75 && j > 3)) break;
                                k -= b.pop().length + 2;
                                --j;
                            }
                            b.push("...");
                            return;
                        }
                    }
                    q = H.as_string(p);
                    r = H.as_string(o);
                    k += r.length + q.length + 4;
                }
            }
            if (j > b.length + 2) {
                k += 5;
                m = "...";
            } else m = null;
            while (true) {
                if (!(k > 80 && b.length > 3)) break;
                k -= b.pop().length + 2;
                if (m == null) {
                    k += 5;
                    m = "...";
                }
            }
            if (m != null) b.push(m);
            b.push(q);
            b.push(r);
        },
        nQ(a, b) {
            var s,
                r,
                q = P.c5(b);
            for (
                s = a.length, r = 0;
                r < a.length;
                a.length === s || (0, H.F)(a), ++r
            )
                q.j(0, b.a(a[r]));
            return q;
        },
        nR(a) {
            var s,
                r = {};
            if (P.mt(a)) return "{...}";
            s = new P.cH("");
            try {
                $.ch.push(a);
                s.a += "{";
                r.a = true;
                J.lY(a, new P.jM(r, s));
                s.a += "}";
            } finally {
                $.ch.pop();
            }
            r = s.a;
            return r.charCodeAt(0) == 0 ? r : r;
        },
        eu: function eu(a) {
            this.a = 0;
            this.f = this.e = this.d = this.c = this.b = null;
            this.r = 0;
            this.$ti = a;
        },
        kV: function kV(a) {
            this.a = a;
            this.c = this.b = null;
        },
        ie: function ie(a, b) {
            this.a = a;
            this.b = b;
            this.d = this.c = null;
        },
        dy: function dy() { },
        dE: function dE() { },
        z: function z() { },
        dG: function dG() { },
        jM: function jM(a, b) {
            this.a = a;
            this.b = b;
        },
        aU: function aU() { },
        dY: function dY() { },
        eC: function eC() { },
        ev: function ev() { },
        eM: function eM() { },
        uy(a, b) {
            var s,
                r,
                q,
                p = null;
            try {
                p = JSON.parse(a);
            } catch (r) {
                s = H.unwrap_Exception(r);
                q = P.FormatException(String(s), null, null);
                throw H.wrap_expression(q);
            }
            q = P.lk(p);
            return q;
        },
        lk(a) {
            var s;
            if (a == null) return null;
            if (typeof a != "object") return a;
            if (Object.getPrototypeOf(a) !== Array.prototype)
                return new P.ic(a, Object.create(null));
            for (s = 0; s < a.length; ++s) a[s] = P.lk(a[s]);
            return a;
        },
        tL(a, b, c, d) {
            var s, r;
            if (b instanceof Uint8Array) {
                s = b;
                d = s.length;
                if (d - c < 15) return null;
                r = P.tM(a, s, c, d);
                if (r != null && a) if (r.indexOf("\ufffd") >= 0) return null;
                return r;
            }
            return null;
        },
        tM(a, b, c, d) {
            var s = a ? $.ri() : $.rh();
            if (s == null) return null;
            if (0 === c && d === b.length) return P.o9(s, b);
            return P.o9(s, b.subarray(c, P.cE(c, d, b.length)));
        },
        o9(a, b) {
            var s, r;
            try {
                s = a.decode(b);
                return s;
            } catch (r) {
                H.unwrap_Exception(r);
            }
            return null;
        },
        uc(a) {
            switch (a) {
                case 65:
                    return "Missing extension byte";
                case 67:
                    return "Unexpected extension byte";
                case 69:
                    return "Invalid UTF-8 byte";
                case 71:
                    return "Overlong encoding";
                case 73:
                    return "Out of unicode range";
                case 75:
                    return "Encoded surrogate";
                case 77:
                    return "Unfinished UTF-8 octet sequence";
                default:
                    return "";
            }
        },
        ub(a, b, c) {
            var s,
                r,
                q = c - b,
                p = new Uint8Array(q);
            for (s = 0; s < q; ++s) {
                r = a[b + s];
                p[s] = (r & 4294967040) >>> 0 !== 0 ? 255 : r;
            }
            return p;
        },
        ic: function ic(a, b) {
            this.a = a;
            this.b = b;
            this.c = null;
        },
        id: function id(a) {
            this.a = a;
        },
        km: function km() { },
        kl: function kl() { },
        fg: function fg() { },
        fi: function fi() { },
        jg: function jg() { },
        js: function js() { },
        jr: function jr() { },
        jI: function jI() { },
        jJ: function jJ(a) {
            this.a = a;
        },
        kj: function kj() { },
        kn: function kn() { },
        lc: function lc(a) {
            this.b = 0;
            this.c = a;
        },
        kk: function kk(a) {
            this.a = a;
        },
        lb: function lb(a) {
            this.a = a;
            this.b = 16;
            this.c = 0;
        },
        oF(a) {
            var s = H.tk(a, null);
            if (s != null) return s;
            throw H.wrap_expression(P.FormatException(a, null, null));
        },
        Error__objectToString(a) {
            if (a instanceof H.c_) return a.k(0);
            return "Instance of '" + H.as_string(H.jZ(a)) + "'";
        },
        aL(a, b, c, d) {
            var s,
                r = c ? J.t_(a, d) : J.rZ(a, d);
            if (a !== 0 && b != null) for (s = 0; s < r.length; ++s) r[s] = b;
            return r;
        },
        List_List_of(a, b, c) {
            var s = P.List_List__of(a, c);
            return s;
        },
        List_List__of(a, b) {
            var s, r;
            if (Array.isArray(a)) return H.b(a.slice(0), b.i("E<0>")); // JSArray<0>
            s = H.b([], b.i("E<0>"));
            for (r = J.by(a); r.u();) s.push(r.gC());
            return s;
        },
        mh(a, b, c) {
            var s, r;
            if (Array.isArray(a)) {
                s = a;
                r = s.length;
                c = P.cE(b, c, r);
                return H.nZ(b > 0 || c < r ? s.slice(b, c) : s);
            }
            if (t.bm.b(a)) return H.tm(a, b, P.cE(b, c, a.length));
            return P.tK(a, b, c);
        },
        tK(a, b, c) {
            var s,
                r,
                q,
                p,
                o = null;
            if (b < 0) throw H.wrap_expression(P.a8(b, 0, a.length, o, o));
            s = c == null;
            if (!s && c < b) throw H.wrap_expression(P.a8(c, b, a.length, o, o));
            r = J.by(a);
            for (q = 0; q < b; ++q)
                if (!r.u()) throw H.wrap_expression(P.a8(b, 0, q, o, o));
            p = [];
            if (s) while (r.u()) p.push(r.gC());
            else
                for (q = b; q < c; ++q) {
                    if (!r.u()) throw H.wrap_expression(P.a8(c, b, q, o, o));
                    p.push(r.gC());
                }
            return H.nZ(p);
        },
        RegExp_RegExp(a) {
            return new H.JSSyntaxRegExp(
                a,
                H.JSSyntaxRegExp_makeNative(a, false, true, false, false, false),
            );
        },
        o7(a, b, c) {
            var s = J.by(b);
            if (!s.u()) return a;
            if (c.length === 0) {
                do a += H.as_string(s.gC());
                while (s.u());
            } else {
                a += H.as_string(s.gC());
                while (s.u()) a = a + c + H.as_string(s.gC());
            }
            return a;
        },
        rN(a) {
            var s = Math.abs(a),
                r = a < 0 ? "-" : "";
            if (s >= 1000) return "" + a;
            if (s >= 100) return r + "0" + s;
            if (s >= 10) return r + "00" + s;
            return r + "000" + s;
        },
        rO(a) {
            if (a >= 100) return "" + a;
            if (a >= 10) return "0" + a;
            return "00" + a;
        },
        fk(a) {
            if (a >= 10) return "" + a;
            return "0" + a;
        },
        duration_milsec_sec(millsec, sec) {
            // a: milliseconds
            // b: seconds
            return new P.Duration(1e6 * sec + 1000 * millsec);
        },
        jh(a) {
            if (typeof a == "number" || H.lm(a) || a == null) return J.b4(a);
            if (typeof a == "string") return JSON.stringify(a);
            return P.Error__objectToString(a);
        },
        iP(a) {
            return new P.f2(a);
        },
        bz(a, b) {
            return new P.aS(false, null, b, a);
        },
        da(a, b, c) {
            return new P.aS(true, a, b, c);
        },
        tn(a) {
            var s = null;
            return new P.cD(s, s, false, s, s, a);
        },
        k0(a, b) {
            return new P.cD(null, null, true, a, b, "Value not in range");
        },
        a8(a, b, c, d, e) {
            return new P.cD(b, c, true, a, d, "Invalid value");
        },
        tp(a, b, c, d) {
            if (a < b || a > c) throw H.wrap_expression(P.a8(a, b, c, d, null));
            return a;
        },
        cE(a, b, c) {
            if (0 > a || a > c) throw H.wrap_expression(P.a8(a, 0, c, "start", null));
            if (b != null) {
                if (a > b || b > c) throw H.wrap_expression(P.a8(b, a, c, "end", null));
                return b;
            }
            return c;
        },
        to(a, b) {
            if (a < 0) throw H.wrap_expression(P.a8(a, 0, null, b, null));
            return a;
        },
        ft(a, b, c, d, e) {
            var s = e == null ? J.aw(b) : e;
            return new P.fs(s, true, a, c, "Index out of range");
        },
        UnsupportError(a) {
            return new P.hW(a);
        },
        hT(a) {
            return new P.hS(a);
        },
        cd(a) {
            return new P.bJ(a);
        },
        aK(a) {
            return new P.fh(a);
        },
        FormatException(a, b, c) {
            return new P.jm(a, b, c);
        },
        dq: function dq(a, b) {
            this.a = a;
            this.b = b;
        },
        Duration: function c1(a) {
            this.a = a;
        },
        Duration_toString_sixDigits: function jc() { },
        Duration_toString_twoDigits: function jd() { },
        O: function O() { },
        f2: function f2(a) {
            this.a = a;
        },
        bc: function bc() { },
        fL: function fL() { },
        aS: function aS(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        },
        cD: function cD(a, b, c, d, e, f) {
            this.e = a;
            this.f = b;
            this.a = c;
            this.b = d;
            this.c = e;
            this.d = f;
        },
        fs: function fs(a, b, c, d, e) {
            this.f = a;
            this.a = b;
            this.b = c;
            this.c = d;
            this.d = e;
        },
        hW: function hW(a) {
            this.a = a;
        },
        hS: function hS(a) {
            this.a = a;
        },
        bJ: function bJ(a) {
            this.a = a;
        },
        fh: function fh(a) {
            this.a = a;
        },
        fM: function fM() { },
        el: function el() { },
        CyclicInitializationError: function fj(a) {
            this.a = a;
        },
        kG: function kG(a) {
            this.a = a;
        },
        jm: function jm(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        L: function L() { },
        fv: function fv() { },
        N: function N() { },
        Object: function H() { },
        iq: function iq() { },
        cH: function cH(a) {
            this.a = a;
        },
        my(a) {
            var s;
            if (t.I.b(a)) {
                s = J.cm(a);
                if (s.constructor === Array)
                    if (typeof CanvasPixelArray !== "undefined") {
                        s.constructor = CanvasPixelArray;
                        s.BYTES_PER_ELEMENT = 1;
                    }
                return a;
            }
            return new P.eJ(a.data, a.height, a.width);
        },
        uO(a) {
            if (a instanceof P.eJ)
                return {
                    data: a.a,
                    height: a.b,
                    width: a.c,
                };
            return a;
        },
        m3() {
            return window.navigator.userAgent;
        },
        _StructuredClone: function l4() { },
        l5: function l5(a, b) {
            this.a = a;
            this.b = b;
        },
        l6: function l6(a, b) {
            this.a = a;
            this.b = b;
        },
        kw: function kw() { },
        ky: function ky(a, b) {
            this.a = a;
            this.b = b;
        },
        eJ: function eJ(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        _StructuredCloneDart2Js: function ir(a, b) {
            this.a = a;
            this.b = b;
        },
        kx: function kx(a, b) {
            this.a = a;
            this.b = b;
            this.c = false;
        },
        vf(a, b) {
            var s = new P._Future($.P, b.i("U<0>")),
                r = new P.cg(s, b.i("cg<0>"));
            a.then(
                H.convert_dart_closure_to_js_md5(new P.lE(r), 1),
                H.convert_dart_closure_to_js_md5(new P.lF(r), 1),
            );
            return s;
        },
        jQ: function jQ(a) {
            this.a = a;
        },
        lE: function lE(a) {
            this.a = a;
        },
        lF: function lF(a) {
            this.a = a;
        },
        o_() {
            return C.F;
        },
        kT: function kT() { },
        cF: function cF() { },
        p: function p() { },
    },
    S = {
        fK: function fK() { },
    },
    T = {
        ty(a, b, c, d, e) {
            // SklAbsorb 的 onDamage (static)
            // static void onDamage(Plr caster, Plr target, int dmg, R r, RunUpdates updates) {
            var s,
                r,
                q,
                p = 0;
            if (c > p && !(a.fx <= p)) {
                s = C.JsInt.P(c + 1, $.t());
                p = a.fy;
                r = a.fx;
                q = p - r;
                if (s > q) s = q;
                a.fx = r + s;
                // [1]回复体力[2]点
                p = LangData.get_lang("imin");
                r = new T.HPlr(r);
                r.a = a.e;
                r.d = a.fx;
                e.a.push(
                    T.RunUpdate_init(p, a, r, new T.HRecover(s), null, s, 1000, 100),
                );
            }
        },
        nC(a) {
            var s = new T.BerserkState(1, 0);
            s.r = a;
            return s;
        },
        tA(a, b, c, d, e) {
            var s,
                r = 0;
            if (c > r && !(b.fx <= r)) {
                if (b.a7($.aJ(), d)) return;
                s = t.aJ.a(b.r2.h(0, $.aJ()));
                if (s == null) {
                    s = T.nC(b);
                    s.aP(0);
                    e.a.push(
                        T.RunUpdate_init(
                            C.String.B(LangData.get_lang("jIRA"), $.nc()),
                            a,
                            b,
                            null,
                            null,
                            $.a6(),
                            1000,
                            100,
                        ),
                    );
                } else s.fr = s.fr + 1;
                if (a.r2.J(0, $.a7())) s.fr = s.fr + 1;
            }
        },
        CharmState_init(a, b) {
            var s = new T.CharmState(a, b, 1);
            s.y = new T.PostActionImpl(s);
            return s;
        },
        getMinionName(plr) {
            var s, r, q;
            for (s = t.fM; s.b(plr);) plr = plr.gap();
            s = plr.r2;
            r = t.f5.a(s.h(0, $.na()));
            if (r == null) {
                r = new T.MinionCount(0);
                s.m(0, $.na(), r);
            }
            s = H.as_string(plr.a) + "?";
            q = r.b;
            r.b = q + 1;
            return s + H.as_string(q) + "@" + H.as_string(plr.b);
        },
        init_PlrClone(owner) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f = owner.a,
                e = owner.b,
                d = owner.c,
                c = owner.d,
                b = 0,
                a = $.T(),
                a0 = H.b([], t.q),
                a1 = H.b([], t.H),
                a2 = P.create_meta_map(t.X, t.W),
                a3 = new Sgls.MList(t.n);
            a3.c = a3;
            a3.b = a3;
            s = new Sgls.MList(t.p);
            s.c = s;
            s.b = s;
            r = new Sgls.MList(t.g);
            r.c = r;
            r.b = r;
            q = new Sgls.MList(t.G);
            q.c = q;
            q.b = q;
            p = new Sgls.MList(t._);
            p.c = p;
            p.b = p;
            o = new Sgls.MList(t.e);
            o.c = o;
            o.b = o;
            n = new Sgls.MList(t.k);
            n.c = n;
            n.b = n;
            m = new Sgls.MList(t.l);
            m.c = m;
            m.b = m;
            l = new Sgls.MList(t.m);
            l.c = l;
            l.b = l;
            k = t.i;
            j = H.b([], k);
            i = H.b([], k);
            h = H.b([], k);
            k = H.b([], k);
            g = 0;
            g = new T.PlrClone(
                f,
                e,
                d,
                c,
                b,
                a,
                a0,
                a1,
                a2,
                a3,
                s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                j,
                i,
                h,
                k,
                g,
                g,
                g,
                $.W(),
                g,
            );
            g.a1(f, e, d, c);
            g.cm = owner;
            g.e = T.getMinionName(
                owner instanceof T.PlrClone ? (g.a6 = owner.a6) : (g.a6 = owner),
            );
            f = owner.t;
            f = H.b(f.slice(0), H._arrayInstanceType(f));
            g.t = f;
            return g;
        },
        tC(a, b, c, d, e) {
            var s,
                r = 0;
            if (c > r && !(b.fx <= r)) {
                if (b.a7($.bh(), d)) return;
                r = b.r2;
                s = t.dK.a(r.h(0, $.bh()));
                if (s == null) {
                    s = new T.CurseState(a, b, $.pK(), $.t());
                    s.y = new T.UpdateStateImpl(s);
                    r.m(0, $.bh(), s);
                    b.y2.j(0, s);
                    b.rx.j(0, s.y);
                    b.F();
                } else {
                    s.z = s.z + $.Z();
                    s.Q = s.Q + 1;
                }
                if (r.h(0, $.a7()) != null) {
                    s.z = s.z + $.Z();
                    s.Q = s.Q + 1;
                }
                e.a.push(
                    T.RunUpdate_init(
                        C.String.B(LangData.get_lang("spfN"), $.qx()),
                        a,
                        b,
                        null,
                        null,
                        $.a6(),
                        1000,
                        100,
                    ),
                );
            }
        },
        tD(a, b, c, d, e) {
            var s, r, q, p, o;
            if (c > 0) {
                s = b.r2;
                r = s.gad(s);
                q = P.List_List_of(r, true, H._instanceType(r).i("L.E"));
                C.Array.aJ(q);
                for (
                    r = q.length, p = 0;
                    p < q.length;
                    q.length === r || (0, H.F)(q), ++p
                ) {
                    o = s.h(0, q[p]);
                    if (o.gT() > 0) o.K(a, e);
                }
                s = b.go;
                r = $.au();
                if (s > r) b.go = s - r;
                else {
                    r = $.at();
                    if (s > r) b.go = 0;
                    else b.go = s - r;
                }
            }
        },
        tE(a, b, c, d, e) {
            var s,
                r = 0;
            if (c > r && !(b.fx <= r)) {
                if (b.a7($.eY(), d)) return;
                r = b.r2;
                s = t.a.a(r.h(0, $.eY()));
                if (s == null) {
                    s = new T.FireState($.ao());
                    r.m(0, $.eY(), s);
                }
                s.b = s.b + $.b0();
            }
        },
        tF(a, b, c, d, e) {
            var ica_state,
                r = 0;
            if (c > r && !(b.fx <= r)) {
                if (b.a7($.bS(), d)) return;
                r = b.r2;
                ica_state = t.ck.a(r.h(0, $.bS()));
                if (ica_state == null) {
                    ica_state = new T.IceState(b, $.cX());
                    ica_state.x = new T.PreStepImpl(ica_state);
                    r.m(0, $.bS(), ica_state);
                    b.rx.j(0, ica_state);
                    b.ry.j(0, ica_state.x);
                    b.F();
                } else ica_state.y = ica_state.y + $.cX();

                // iceState.frozenStep += 2048;
                if (a.r2.J(0, $.a7())) ica_state.y = ica_state.y + $.bx();
                // sklIceHit
                // [1]被[冰冻]了
                r = T.RunUpdate_init(
                    C.String.B(LangData.get_lang("HBga"), $.qF()),
                    a,
                    b,
                    null,
                    null,
                    $.bg(),
                    1000,
                    100,
                );
                e.a.push(r);
            }
        },
        tI(a, b, c, d, e) {
            var s, r;
            if (c > $.C() && !(b.fx <= 0)) {
                if (b.a7($.bT(), d)) return;
                s = b.r2;
                r = t.ax.a(s.h(0, $.bT()));
                if (r == null) {
                    r = new T.PoisonState(a, b, $.C());
                    r.y = T.getAt(a, true, d) * $.eV();
                    s.m(0, $.bT(), r);
                    b.x2.j(0, r);
                } else {
                    r.y = r.y + T.getAt(a, true, d) * $.eV();
                    r.z = $.C();
                    r.r = a;
                }
                e.a.push(
                    T.RunUpdate_init(
                        C.String.B(LangData.get_lang("Okln"), $.qH()),
                        a,
                        b,
                        null,
                        null,
                        $.a6(),
                        1000,
                        100,
                    ),
                );
            }
        },
        getAt(a, b, c) {
            var s,
                r,
                q,
                p,
                o = b ? a.dx : a.ch,
                n = t.i,
                m = H.b([c.n() & 127, c.n() & 127, c.n() & 127, o + $.au(), o], n);
            C.Array.aJ(m);
            s = m[$.t()];
            m = c.n();
            r = $.au();
            q = c.n();
            p = $.au();
            n = H.b([(m & 63) + r, (q & 63) + p, o + p], n);
            C.Array.aJ(n);
            return s * n[1] * a.id;
        },
        d9(a, b, c) {
            if (b) return a.dy + $.au();
            return a.cx + $.au();
        },
        bW(a, b, c) {
            var s = $.eW() + b - a,
                r = $.ap();
            if (s < r) s = r;
            if (s > $.au()) s = C.JsInt.P(s, $.C()) + $.aI();
            return c.n() <= s;
        },
        rateHiHp(a) {
            var s = a.fx;
            if (s < $.as()) return $.pz();
            if (s > $.mR()) return $.py();
            return s;
        },
        choose_boss(name, clan_name, fgt, weapon_name) {
            // MARK: WTF 什么鬼这么长
            var team_name,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f,
                e,
                d,
                c,
                b,
                a,
                a0,
                a1,
                a2,
                a3 = null;
            if (clan_name == $.nk()) {
                team_name = 0;
                r = $.T();
                q = H.b([], t.q);
                p = H.b([], t.H);
                o = P.create_meta_map(t.X, t.W);
                n = new Sgls.MList(t.n);
                n.c = n;
                n.b = n;
                m = new Sgls.MList(t.p);
                m.c = m;
                m.b = m;
                l = new Sgls.MList(t.g);
                l.c = l;
                l.b = l;
                k = new Sgls.MList(t.G);
                k.c = k;
                k.b = k;
                j = new Sgls.MList(t._);
                j.c = j;
                j.b = j;
                i = new Sgls.MList(t.e);
                i.c = i;
                i.b = i;
                h = new Sgls.MList(t.k);
                h.c = h;
                h.b = h;
                g = new Sgls.MList(t.l);
                g.c = g;
                g.b = g;
                f = new Sgls.MList(t.m);
                f.c = f;
                f.b = f;
                e = t.i;
                d = H.b([], e);
                c = H.b([], e);
                b = H.b([], e);
                e = H.b([], e);
                a = 0;
                a = new T.PlrBossTest(
                    name,
                    clan_name,
                    name,
                    a3,
                    team_name,
                    r,
                    q,
                    p,
                    o,
                    n,
                    m,
                    l,
                    k,
                    j,
                    i,
                    h,
                    g,
                    f,
                    d,
                    c,
                    b,
                    e,
                    a,
                    a,
                    a,
                    $.W(),
                    a,
                );
                a.a1(name, clan_name, name, a3);
                a.e4(name, clan_name, fgt);
                return a;
            }
            // MARK: BOSS INIT(上面也是)
            // \u0003
            if (clan_name == $.qR()) {
                team_name = 0;
                r = $.T();
                q = H.b([], t.q);
                p = H.b([], t.H);
                o = P.create_meta_map(t.X, t.W);
                n = new Sgls.MList(t.n);
                n.c = n;
                n.b = n;
                m = new Sgls.MList(t.p);
                m.c = m;
                m.b = m;
                l = new Sgls.MList(t.g);
                l.c = l;
                l.b = l;
                k = new Sgls.MList(t.G);
                k.c = k;
                k.b = k;
                j = new Sgls.MList(t._);
                j.c = j;
                j.b = j;
                i = new Sgls.MList(t.e);
                i.c = i;
                i.b = i;
                h = new Sgls.MList(t.k);
                h.c = h;
                h.b = h;
                g = new Sgls.MList(t.l);
                g.c = g;
                g.b = g;
                f = new Sgls.MList(t.m);
                f.c = f;
                f.b = f;
                e = t.i;
                d = H.b([], e);
                c = H.b([], e);
                b = H.b([], e);
                e = H.b([], e);
                a = 0;
                a = new T.PlrBossTest2(
                    name,
                    clan_name,
                    name,
                    a3,
                    team_name,
                    r,
                    q,
                    p,
                    o,
                    n,
                    m,
                    l,
                    k,
                    j,
                    i,
                    h,
                    g,
                    f,
                    d,
                    c,
                    b,
                    e,
                    a,
                    a,
                    a,
                    $.W(),
                    a,
                );
                a.a1(name, clan_name, name, a3);
                a.e5(name, clan_name);
                return a;
            }
            // MARK: 强评?
            // cl -> !
            team_name = $.cl();
            if (clan_name == team_name) {
                if (name == $.lQ()) {
                    r = 0;
                    q = H.as_string(name) + H.as_string($.aD());
                    p = 0;
                    o = $.T();
                    n = H.b([], t.q);
                    m = H.b([], t.H);
                    l = P.create_meta_map(t.X, t.W);
                    k = new Sgls.MList(t.n);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.p);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.g);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t.G);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t._);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.e);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.k);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.l);
                    d.c = d;
                    d.b = d;
                    c = new Sgls.MList(t.m);
                    c.c = c;
                    c.b = c;
                    b = t.i;
                    a = H.b([], b);
                    a0 = H.b([], b);
                    a1 = H.b([], b);
                    b = H.b([], b);
                    a2 = 0;
                    a2 = new T.PlrBossMario(
                        r,
                        name,
                        team_name,
                        q,
                        a3,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        c,
                        a,
                        a0,
                        a1,
                        b,
                        a2,
                        a2,
                        a2,
                        $.W(),
                        a2,
                    );
                    a2.a1(name, team_name, q, a3);
                    a2.av(name, team_name);
                    return a2;
                }
                if (name == $.qP()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossSonic(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                if (name == $.qo()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossMosquito(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                if (name == $.qY()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossYuri(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                // slime
                if (name == $.qO()) return T.init_BossSlime(name, team_name);
                if (name == $.qh()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossIkaruga(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                if (name == $.qb()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossConan(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                if (name == $.q9()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossAokiji(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                if (name == $.d5()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossLazy(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                // covid
                if (name == $.ck()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossCovid(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                if (name == $.qL()) {
                    r = H.as_string(name) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBossSaitama(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    a1.av(name, team_name);
                    return a1;
                }
                r = $.ni();
                // seed:
                if (J.m1(name, r)) {
                    // startwith seed:
                    r = H.as_string(r) + H.as_string($.aD());
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrSeed(
                        name,
                        team_name,
                        r,
                        a3,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, r, a3);
                    r = a1.r = C.String.ay(name, $.X());
                    team_name = $.C();
                    $.vq =
                        r.length > team_name && C.String.a8(r, team_name) === $.q0()
                            ? $.pE()
                            : $.mS();
                    return a1;
                }
                // boosted
                if ($.nr().J(0, name)) {
                    team_name = $.cl();
                    r = $.nr().h(0, name);
                    q = 0;
                    p = $.T();
                    o = H.b([], t.q);
                    n = H.b([], t.H);
                    m = P.create_meta_map(t.X, t.W);
                    l = new Sgls.MList(t.n);
                    l.c = l;
                    l.b = l;
                    k = new Sgls.MList(t.p);
                    k.c = k;
                    k.b = k;
                    j = new Sgls.MList(t.g);
                    j.c = j;
                    j.b = j;
                    i = new Sgls.MList(t.G);
                    i.c = i;
                    i.b = i;
                    h = new Sgls.MList(t._);
                    h.c = h;
                    h.b = h;
                    g = new Sgls.MList(t.e);
                    g.c = g;
                    g.b = g;
                    f = new Sgls.MList(t.k);
                    f.c = f;
                    f.b = f;
                    e = new Sgls.MList(t.l);
                    e.c = e;
                    e.b = e;
                    d = new Sgls.MList(t.m);
                    d.c = d;
                    d.b = d;
                    c = t.i;
                    b = H.b([], c);
                    a = H.b([], c);
                    a0 = H.b([], c);
                    c = H.b([], c);
                    a1 = 0;
                    a1 = new T.PlrBoost(
                        r,
                        name,
                        team_name,
                        name,
                        weapon_name,
                        q,
                        p,
                        o,
                        n,
                        m,
                        l,
                        k,
                        j,
                        i,
                        h,
                        g,
                        f,
                        e,
                        d,
                        b,
                        a,
                        a0,
                        c,
                        a1,
                        a1,
                        a1,
                        $.W(),
                        a1,
                    );
                    a1.a1(name, team_name, name, weapon_name);
                    a1.e1(name, team_name, r, weapon_name);
                    return a1;
                }
                team_name = $.cl();
                r = 0;
                q = $.T();
                p = H.b([], t.q);
                o = H.b([], t.H);
                n = P.create_meta_map(t.X, t.W);
                m = new Sgls.MList(t.n);
                m.c = m;
                m.b = m;
                l = new Sgls.MList(t.p);
                l.c = l;
                l.b = l;
                k = new Sgls.MList(t.g);
                k.c = k;
                k.b = k;
                j = new Sgls.MList(t.G);
                j.c = j;
                j.b = j;
                i = new Sgls.MList(t._);
                i.c = i;
                i.b = i;
                h = new Sgls.MList(t.e);
                h.c = h;
                h.b = h;
                g = new Sgls.MList(t.k);
                g.c = g;
                g.b = g;
                f = new Sgls.MList(t.l);
                f.c = f;
                f.b = f;
                e = new Sgls.MList(t.m);
                e.c = e;
                e.b = e;
                d = t.i;
                c = H.b([], d);
                b = H.b([], d);
                a = H.b([], d);
                d = H.b([], d);
                a0 = 0;
                a0 = new T.PlrEx(
                    name,
                    team_name,
                    name,
                    weapon_name,
                    r,
                    q,
                    p,
                    o,
                    n,
                    m,
                    l,
                    k,
                    j,
                    i,
                    h,
                    g,
                    f,
                    e,
                    c,
                    b,
                    a,
                    d,
                    a0,
                    a0,
                    a0,
                    $.W(),
                    a0,
                );
                a0.a1(name, team_name, name, weapon_name);
                a0.e2(name, team_name, name, weapon_name);
                return a0;
            }
            return T.init_plr(name, clan_name, a3, weapon_name);
        },
        oq(a) {
            var s = a.d;
            if (s != null) s = C.String.cl(s, $.qm()) || C.String.cl(s, $.qn());
            else s = false;
            return s;
        },
        j7(a, b, c, d, e) {
            // Plr caster, Plr target, int mutation, R r, RunUpdates updates
            var s,
                r,
                q,
                p,
                o,
                n = b.r2,
                m = t.cu,
                l = m.a(n.h(0, $.ck()));
            if (l != null) s = l.b && !l.c.w(0, c);
            else s = true;
            if (s) {
                s = 0;
                r = new T.CovidState(a, b, s, c, s);
                r.k1 = new T.PostActionImpl(r);
                r.k2 = new T.PreActionImpl(r);
                m = m.a(n.h(0, $.ck()));
                r.id = m;
                s = r.go;
                if (m != null) m.c.j(0, s);
                else {
                    m = P.c5(t.B);
                    q = new T.CovidMeta(m);
                    m.j(0, s);
                    r.id = q;
                    n.m(0, $.ck(), q);
                }
                b.x2.j(0, r.k1);
                b.x1.j(0, r.k2);
                b.F();
                // sklCovidHit
                // [1]感染了[新冠病毒]
                e.a.push(
                    T.RunUpdate_init(
                        LangData.get_lang("toAn"),
                        a,
                        b,
                        null,
                        null,
                        0,
                        1000,
                        100,
                    ),
                );
                for (
                    n = a.y.a.e, m = n.length, p = 0;
                    p < n.length;
                    n.length === m || (0, H.F)(n), ++p
                ) {
                    o = n[p];
                    // if (J.Y(o, b)) {
                    if (o === b) {
                        // p.spsum += 2048
                        o.l = o.l + $.bx();
                    } else {
                        // p.spsum -= 256
                        o.l = o.l - $.eX();
                    }
                }
                return true;
            }
            return false;
        },
        tB(a, b, c, d, e) {
            if (b.r2.h(0, $.ck()) == null && (d.n() & 63) + 1 < c)
                T.j7(a, b, $.bg(), d, e);
        },
        LazyState_init(a, b) {
            var s = new T.LazyState(a, b, 0);
            s.fy = new T.PostActionImpl(s);
            s.go = new T.UpdateStateImpl(s);
            s.id = new T.PreActionImpl(s);
            return s;
        },
        beLazy(a, b, c) {
            var s,
                r = null,
                q = 1000,
                p = b.n();
            if (p < $.b1()) {
                s = c.a;
                s.push(
                    T.RunUpdate_init(LangData.get_lang("yZbn"), a, r, r, r, 0, q, 100),
                );
            } else if (p < $.ci()) {
                s = c.a;
                s.push(
                    T.RunUpdate_init(LangData.get_lang("PdCA"), a, r, r, r, 0, q, 100),
                );
            } else if (p < $.mJ()) {
                s = c.a;
                s.push(
                    T.RunUpdate_init(LangData.get_lang("gjTN"), a, r, r, r, 0, q, 100),
                );
            } else if (p < $.pc()) {
                s = c.a;
                s.push(
                    T.RunUpdate_init(LangData.get_lang("xraA"), a, r, r, r, 0, q, 100),
                );
            } else {
                s = c.a;
                if (p < $.pp())
                    s.push(
                        T.RunUpdate_init(LangData.get_lang("OBXn"), a, r, r, r, 0, q, 100),
                    );
                else
                    s.push(
                        T.RunUpdate_init(LangData.get_lang("fNKA"), a, r, r, r, 0, q, 100),
                    );
            }
            s.push(
                T.RunUpdate_init(LangData.get_lang("hXqA"), a, r, r, r, 0, q, 100),
            );
        },
        tG(a, b, c, d, e) {
            if (t.r.a(b.r2.h(0, $.d5())) == null && !(b instanceof T.PlrBossLazy)) {
                T.LazyState_init(a, b).aP(0);
                e.a.push(
                    T.RunUpdate_init(
                        LangData.get_lang("JnTA"),
                        a,
                        b,
                        null,
                        null,
                        0,
                        1000,
                        100,
                    ),
                );
            }
        },
        tH(a, b) {
            var s = new T.SklMarioReraise(b, 0);
            s.r = a;
            return s;
        },
        init_BossSlime(a2, a3) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f = 0,
                e = H.as_string(a2) + H.as_string($.aD()),
                d = 0,
                c = $.T(),
                b = H.b([], t.q),
                a = H.b([], t.H),
                a0 = P.create_meta_map(t.X, t.W),
                a1 = new Sgls.MList(t.n);
            a1.c = a1;
            a1.b = a1;
            s = new Sgls.MList(t.p);
            s.c = s;
            s.b = s;
            r = new Sgls.MList(t.g);
            r.c = r;
            r.b = r;
            q = new Sgls.MList(t.G);
            q.c = q;
            q.b = q;
            p = new Sgls.MList(t._);
            p.c = p;
            p.b = p;
            o = new Sgls.MList(t.e);
            o.c = o;
            o.b = o;
            n = new Sgls.MList(t.k);
            n.c = n;
            n.b = n;
            m = new Sgls.MList(t.l);
            m.c = m;
            m.b = m;
            l = new Sgls.MList(t.m);
            l.c = l;
            l.b = l;
            k = t.i;
            j = H.b([], k);
            i = H.b([], k);
            h = H.b([], k);
            k = H.b([], k);
            g = 0;
            g = new T.PlrBossSlime(
                f,
                a2,
                a3,
                e,
                null,
                d,
                c,
                b,
                a,
                a0,
                a1,
                s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                j,
                i,
                h,
                k,
                g,
                g,
                g,
                $.W(),
                g,
            );
            g.a1(a2, a3, e, null);
            g.av(a2, a3);
            return g;
        },
        init_BossSlime2(a2, a3, a4) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f = 0,
                e = H.as_string(a3) + H.as_string($.aD()),
                d = 0,
                c = $.T(),
                b = H.b([], t.q),
                a = H.b([], t.H),
                a0 = P.create_meta_map(t.X, t.W),
                a1 = new Sgls.MList(t.n);
            a1.c = a1;
            a1.b = a1;
            s = new Sgls.MList(t.p);
            s.c = s;
            s.b = s;
            r = new Sgls.MList(t.g);
            r.c = r;
            r.b = r;
            q = new Sgls.MList(t.G);
            q.c = q;
            q.b = q;
            p = new Sgls.MList(t._);
            p.c = p;
            p.b = p;
            o = new Sgls.MList(t.e);
            o.c = o;
            o.b = o;
            n = new Sgls.MList(t.k);
            n.c = n;
            n.b = n;
            m = new Sgls.MList(t.l);
            m.c = m;
            m.b = m;
            l = new Sgls.MList(t.m);
            l.c = l;
            l.b = l;
            k = t.i;
            j = H.b([], k);
            i = H.b([], k);
            h = H.b([], k);
            k = H.b([], k);
            g = 0;
            g = new T.BossSlime2(
                a2,
                f,
                a3,
                a4,
                e,
                null,
                d,
                c,
                b,
                a,
                a0,
                a1,
                s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                j,
                i,
                h,
                k,
                g,
                g,
                g,
                $.W(),
                g,
            );
            g.a1(a3, a4, e, null);
            g.av(a3, a4);
            g.e = T.getMinionName(a2);
            g.eV();
            return g;
        },
        parse_names(a) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f,
                e = null,
                d = t.E,
                c = H.b([], d),
                b = C.String.cK(a, $.r_());
            for (s = 0; s < b.length; ++s) {
                r = b[s];
                q = $.r0();
                r.toString;
                r = H.iG(r, q, " ", 0);
                q = $.nq();
                b[s] = H.iG(r, q, "", 0);
            }
            // for (; J.Y(C.Array.gbl(b), "");) {
            while (C.Array.gbl(b) === "") {
                b.pop();
                if (b.length === 0) return H.b([], d);
            }
            p = C.Array.w(b, "") && true;
            d = t.t;
            o = H.b([], d);
            for (s = 0, r = t.V, q = !p, n = e; s < b.length; ++s) {
                m = b[s];
                if (m === "") {
                    if (o.length !== 0) c.push(o);
                    o = H.b([], d);
                    n = e;
                    continue;
                }
                if (q) {
                    if (o.length !== 0) c.push(o);
                    o = H.b([], d);
                }
                // if includes "+"
                // weapon
                l = $.lO();
                m.toString;
                // if (l == null) H.throw_expression(H.R(l))
                // if (H.iF(m, l, 0)) {
                if (m.includes("+")) {
                    k = C.String.aT(m, $.lO());
                    // j = C.String.dF(C.String.ay(m, k + 1))
                    j = C.String.trim_name(C.String.ay(m, k + 1));
                    l = C.String.af(m, 0, k);
                    i = $.nq();
                    m = H.iG(l, i, "", 0);
                } else {
                    j = e;
                }
                // console.log("weapon: " + j)
                l = $.n3();
                if (l == null) H.throw_expression(H.R(l));
                if (H.iF(m, l, 0)) {
                    h = C.String.cK(m, $.n3());
                    if (J.m1(h[0], " ")) {
                        l = 0;
                        h[l] = J.nB(h[l], 1);
                    }
                    if (!J.Y(h[1], "")) {
                        l = h[1];
                        i = $.n5();
                        l.toString;
                        if (i == null) H.throw_expression(H.R(i));
                        g = J.a3(l);
                        f = g.gp(l);
                        if (0 > f) H.throw_expression(P.a8(0, 0, g.gp(l), e, e));
                        l = H.iF(l, i, 0);
                    } else l = true;
                    if (l) o.push(H.b([h[0], null, j], r));
                    else o.push(H.b([h[0], h[1], j], r));
                } else if (C.String.bA(m, " ")) {
                    o.push(H.b([C.String.ay(m, 1), n, j], r));
                } else {
                    if (s + 1 < b.length) {
                        l = $.n5();
                        if (l == null) H.throw_expression(H.R(l));
                        l = !H.iF(m, l, 0) && J.m1(b[s + 1], " ");
                    } else l = false;
                    if (l) n = m;
                    else {
                        o.push(H.b([m, null, j], r));
                        n = e;
                    }
                }
            }
            if (o.length !== 0) c.push(o);
            return c;
        },
        // Engine start!
        start_main(target) {
            var async_goto = 0,
                async_completer = P._makeAsyncAwaitCompleter(t.eF),
                result,
                p,
                o,
                n,
                m,
                runner,
                k,
                j,
                i,
                h;
            var $async$c2 = P._wrapJsFunctionForAsync(
                (async_error_code, async_result) => {
                    if (async_error_code === 1)
                        return P.async_rethrow(async_result, async_completer);
                    while (true)
                        switch (async_goto) {
                            case 0:
                                k = t.eV;
                                j = H.b([], k);
                                i = t.L;
                                h = H.b([], i);
                                k = H.b([], k);
                                i = H.b([], i);
                                p = H.b([], t.gr);
                                o = 0;
                                n = 1;
                                m = -n;
                                // run here?
                                runner = new T.Engine(
                                    j,
                                    h,
                                    k,
                                    i,
                                    new H.JsLinkedHashMap(t.d5),
                                    target,
                                    p,
                                    o,
                                    m,
                                    m,
                                    new Float64Array(n),
                                );
                                async_goto = 3;
                                return P._asyncAwait(runner.bD(), $async$c2);
                            case 3:
                                result = runner;
                                async_goto = 1;
                            // break
                            case 1:
                                return P._asyncReturn(result, async_completer);
                        }
                },
            );
            return P._asyncStartSync($async$c2, async_completer);
        },
        DummyRunUpdates_init(a, b) {
            // T.v4
            var s = a.e,
                r = 0;
            return T.DummyRunUpdates(s[r], b.e[r]);
        },
        RunUpdate_init(message, caster, c, d, e, f, delay0, delay1) {
            // logger.debug("RunUpdate_init", message, H.as_string(caster), H.as_string(c), H.as_string(d))
            var s = new T.RunUpdate(f, 0, 0, message, caster, c, e, d);
            // var s = new T.aX(f, delay0, delay1, message, caster, c, e, d)
            // s.aK(message, caster, c, d, e, f, delay0, delay1)
            s.aK(message, caster, c, d, e, f, 0, 0);
            return s;
        },
        RunUpdateCancel_init(a, b, c) {
            var s = null,
                r = new T.RunUpdateCancel(0, 1000, 500, a, b, c, s, s);
            r.aK(a, b, c, s, s, 0, 1000, 500);
            return r;
        },
        mw() {
            var s, r, q, p;
            if ($.lj == null) {
                $.lj = P.c5(t.B);
                s = -1;
                for (r = 0; (q = $.ox), (p = q.length), r < p; ++r) {
                    s += C.String.a8(q, r) - $.b2();
                    $.lj.j(0, C.JsInt.V(s * $.pF(), $.pn()) + $.p9() + p);
                }
            }
            return $.lj;
        },
        lC(a) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f,
                e = {},
                d = 0,
                c = H.b([d, d, d, d, d, d], t.i),
                b = 0;
            e.a = -$.t(); // -2
            e.b = -1;
            e.c = b;
            s = new T.lD(e, c);
            for (d = a.length, r = b; r < d; ++r) {
                q = C.String.a8(a, r);
                if (q < $.d_()) {
                    if (q === $.at()) {
                        // 32
                        ++b;
                        continue;
                    }
                    if (q !== $.mW()) p = q >= $.aI() && q <= $.pO();
                    else p = true;
                    if (p) s.$1(0);
                    else if (q >= $.q6() && q <= $.p5()) s.$1(1);
                    else if (q >= $.pT() && q <= $.q3()) s.$1($.t());
                    else s.$1($.B());
                } else if (T.mw().w(0, q)) s.$1($.C());
                else {
                    p = $.X();
                    o = c[p];
                    if (o > 0) c[p] = o + 1;
                    s.$1(p);
                }
            }
            d = $.t();
            if (b > d) {
                p = 0;
                c[p] = c[p] + b;
            }
            n = e.a;
            m = 0;
            if (n < m) {
                e.a = m;
                n = m;
            }
            p = e.c;
            o = $.av();
            if (p > o) {
                l = $.C();
                o = p - o;
                c[l] = c[l] + o;
                l = $.B();
                c[l] = c[l] + o;
                n += o * d;
            }
            if (n > m) {
                d = $.B();
                c[d] = c[d] + 1;
                for (k = $.X(); k >= m; --k) {
                    d = c[k];
                    if (d > m) {
                        c[k] = d + e.a;
                        break;
                    }
                }
                d = $.B();
                c[d] = c[d] - 1;
                for (r = m; r < $.a4(); ++r) {
                    d = c[r];
                    if (d > m)
                        if (d >= n) {
                            c[r] = d - n;
                            break;
                        } else {
                            n -= d;
                            c[r] = m;
                        }
                }
            }
            d = $.C();
            p = c[d];
            o = 1;
            if (p == o) {
                p = $.X();
                c[p] = c[p] + o;
                c[d] = m;
            }
            d = $.pa();
            p = c[m];
            H.ar(d);
            H.ar(p);
            p = Math.pow(d, p);
            d = $.pB(); // 32
            o = c[1];
            H.ar(d); // 检查是否为 number
            H.ar(o);
            o = Math.pow(d, o);
            d = $.pS();
            l = c[$.t()];
            H.ar(d);
            H.ar(l);
            l = Math.pow(d, l);
            d = $.ps();
            j = c[$.B()];
            H.ar(d);
            H.ar(j);
            j = Math.pow(d, j);
            d = $.pm();
            i = c[$.C()];
            H.ar(d);
            H.ar(i);
            i = Math.pow(d, i);
            d = $.W();
            h = c[$.X()];
            H.ar(d);
            H.ar(h);
            g = Math.log(p * o * l * j * i * Math.pow(d, h));
            if (g > $.aI()) {
                f = $.n1();
                if (g > f) g = f;
                g = g * $.b0() + $.eW();
            } else if (g < $.eW()) g = g * $.b0() + $.cY();
            g -= $.at();
            if (g > 0) return g / ($.rp() - T.mw().a);
            else {
                d = $.rq();
                if (g < -d) return (g + d) / ($.pD() + d - T.mw().a);
            }
            return $.ao(); // 0
        },
        DummyRunUpdates(a, b) {
            var s = a.Q - b.Q;
            if (s !== 0) return s;
            return J.lV(a.e, b.e);
        },
        init_plr(name, clan_name, fgt, weapon) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                f = 0,
                e = $.T(),
                d = H.b([], t.q),
                c = H.b([], t.H),
                b = P.create_meta_map(t.X, t.W),
                a = new Sgls.MList(t.n);
            a.c = a;
            a.b = a;
            s = new Sgls.MList(t.p);
            s.c = s;
            s.b = s;
            r = new Sgls.MList(t.g);
            r.c = r;
            r.b = r;
            q = new Sgls.MList(t.G);
            q.c = q;
            q.b = q;
            p = new Sgls.MList(t._);
            p.c = p;
            p.b = p;
            o = new Sgls.MList(t.e);
            o.c = o;
            o.b = o;
            n = new Sgls.MList(t.k);
            n.c = n;
            n.b = n;
            m = new Sgls.MList(t.l);
            m.c = m;
            m.b = m;
            l = new Sgls.MList(t.m);
            l.c = l;
            l.b = l;
            k = t.i;
            j = H.b([], k);
            i = H.b([], k);
            h = H.b([], k);
            k = H.b([], k);
            const plr = new T.Plr(
                name,
                clan_name,
                fgt,
                weapon,
                f,
                e,
                d,
                c,
                b,
                a,
                s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                j,
                i,
                h,
                k,
                0,
                0,
                0,
                $.W(),
                0,
            );
            plr.a1(name, clan_name, fgt, weapon);
            return plr;
        },
        t6(a, b) {
            return J.lV(b.b, a.b);
        },
        tx(a, b, c, d, e) { },
        tz(a, b, c, d, e) { },
        SklAttack_init(a) {
            var s = new T.SklAttack(0);
            s.r = a;
            return s;
        },
        SklSimpleAttack_init(a) {
            var s = new T.SklSimpleAttack(0);
            s.r = a;
            return s;
        },
        NoWeapon(a, b) {
            var s = new T.NoWeapon(a, b, P.aL($.av(), 0, false, t.B));
            s.a = a;
            return s;
        },
        Weapon_factory(a, b) {
            var s = new T.Weapon(a, b, P.aL($.av(), 0, false, t.B));
            s.a = a;
            return s;
        },
        SklAbsorb: function e1(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklAccumulate: function h5(a, b) {
            this.fr = null;
            this.fx = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        SklAssassinate: function h7(a) {
            this.fy = this.fx = this.fr = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        BerserkState: function dd(a, b) {
            this.fr = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        SklBerserk: function h9(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklCharge: function ha(a, b) {
            this.fx = this.fr = null;
            this.fy = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        CharmState: function dj(a, b, c) {
            this.r = a;
            this.x = b;
            this.y = null;
            this.z = c;
            this.c = this.b = this.a = null;
        },
        SklCharm: function e3(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        MinionCount: function dI(a) {
            this.b = a;
        },
        PlrClone: function PlrClone(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.cm = this.a6 = null;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklClone: function e4(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklCloneCallback: function k9() { },
        SklCritical: function e5(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        CurseState: function dn(a, b, c, d) {
            this.r = a;
            this.x = b;
            this.y = null;
            this.z = c;
            this.Q = d;
            this.c = this.b = this.a = null;
        },
        SklCurse: function hf(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklDisperse: function hh(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklExchange: function hi(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        FireState: function c3(a) {
            this.b = a;
        },
        SklFire: function cc(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        sklHalf: function e7(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        HasteState: function dw(a, b, c) {
            this.x = a;
            this.y = null;
            this.z = b;
            this.Q = c;
            this.c = this.b = this.a = null;
        },
        SklHaste: function hk(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklHeal: function e8(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklHealCallback: function ka(a) {
            this.a = a;
        },
        IceState: function dx(a, b) {
            this.r = a;
            this.x = null;
            this.y = b;
            this.c = this.b = this.a = null;
        },
        SklIce: function e9(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklIron: function ho(a, b, c) {
            this.fy = this.fx = this.fr = null;
            this.go = a;
            this.id = b;
            this.e = false;
            this.f = c;
            this.c = this.b = this.a = this.r = null;
        },
        PoisonState: function dS(a, b, c) {
            this.r = a;
            this.x = b;
            this.y = null;
            this.z = c;
            this.c = this.b = this.a = null;
        },
        SklPoison: function ht(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklQuake: function hv(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklRapid: function ec(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklRevive: function hx(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklPossess: function hu(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrShadow: function fS(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a6 = this.aj = null;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklShadow: function hB(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SlowState: function eh(a, b) {
            this.x = a;
            this.y = null;
            this.z = b;
            this.c = this.b = this.a = null;
        },
        SklSlow: function hG(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklExplode: function hj(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrSummon: function fT(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.bi = this.aj = null;
            this.aR = false;
            this.a6 = null;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklSummon: function hx(a) {
            this.fr = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklThunder: function hu(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossAokiji: function f5(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklAokijiDefend: function h6(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklAokijiIceAge: function e2(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBoost: function fP(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
        ) {
            this.a6 = a;
            this.a = b;
            this.b = c;
            this.c = d;
            this.d = e;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = f;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = g;
            this.k1 = h;
            this.k3 = this.k2 = null;
            this.k4 = i;
            this.r1 = null;
            this.r2 = j;
            this.rx = k;
            this.ry = l;
            this.x1 = m;
            this.x2 = n;
            this.y1 = o;
            this.y2 = p;
            this.G = q;
            this.L = r;
            this.S = s;
            this.A = false;
            this.q = a0;
            this.X = null;
            this.E = a1;
            this.t = a2;
            this.a2 = a3;
            this.M = a4;
            this.N = a5;
            this.Y = a6;
            this.H = a7;
            this.l = a8;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrBossTest: function fU(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrBossTest2: function fV(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrEx: function fQ(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrBoss: function cz() { },
        PlrBossConan: function f6(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklConan: function hb(a, b, c) {
            this.fr = a;
            this.fx = b;
            this.e = false;
            this.f = c;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossCovid: function f7(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        CovidMeta: function dk(a) {
            this.b = false;
            this.c = a;
        },
        CovidState: function dl(a, b, c, d, e) {
            this.fr = a;
            this.fx = b;
            this.fy = c;
            this.go = d;
            this.k2 = this.k1 = this.id = null;
            this.e = false;
            this.f = e;
            this.c = this.b = this.a = this.r = null;
        },
        SklCovidDefend: function he(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklCovidAttack: function hd(a, b) {
            this.fr = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossIkaruga: function f8(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklIkarugaDefend: function hn(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklIkarugaAttack: function hm(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossLazy: function de(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        LazyState: function dB(a, b, c) {
            this.fr = a;
            this.fx = b;
            this.id = this.go = this.fy = null;
            this.e = false;
            this.f = c;
            this.c = this.b = this.a = this.r = null;
        },
        SklLazyDefend: function hq(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklLazyAttack: function hp(a, b, c) {
            this.fr = a;
            this.fx = b;
            this.e = false;
            this.f = c;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossMario: function df(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
        ) {
            this.aC = a;
            this.aR = this.bi = this.aj = null;
            this.a = b;
            this.b = c;
            this.c = d;
            this.d = e;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = f;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = g;
            this.k1 = h;
            this.k3 = this.k2 = null;
            this.k4 = i;
            this.r1 = null;
            this.r2 = j;
            this.rx = k;
            this.ry = l;
            this.x1 = m;
            this.x2 = n;
            this.y1 = o;
            this.y2 = p;
            this.G = q;
            this.L = r;
            this.S = s;
            this.A = false;
            this.q = a0;
            this.X = null;
            this.E = a1;
            this.t = a2;
            this.a2 = a3;
            this.M = a4;
            this.N = a5;
            this.Y = a6;
            this.H = a7;
            this.l = a8;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklMarioGet: function hr(a, b) {
            this.fr = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        SklMarioReraise: function ea(a, b) {
            this.Q = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossMosquito: function f9(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrBossSaitama: function fa(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklSaitama: function hA(a, b, c, d, e) {
            this.fr = a;
            this.fx = b;
            this.fy = c;
            this.go = d;
            this.id = null;
            this.e = false;
            this.f = e;
            this.c = this.b = this.a = this.r = null;
        },
        PlrSeed_: function PlrSeed_() { },
        PlrSeed: function PlrSeed(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrBossSlime: function PlrBossSlime(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
        ) {
            this.aC = a;
            this.a = b;
            this.b = c;
            this.c = d;
            this.d = e;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = f;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = g;
            this.k1 = h;
            this.k3 = this.k2 = null;
            this.k4 = i;
            this.r1 = null;
            this.r2 = j;
            this.rx = k;
            this.ry = l;
            this.x1 = m;
            this.x2 = n;
            this.y1 = o;
            this.y2 = p;
            this.G = q;
            this.L = r;
            this.S = s;
            this.A = false;
            this.q = a0;
            this.X = null;
            this.E = a1;
            this.t = a2;
            this.a2 = a3;
            this.M = a4;
            this.N = a5;
            this.Y = a6;
            this.H = a7;
            this.l = a8;
            this.a_ = this.Z = false;
            this.I = null;
        },
        BossSlime2: function BossSlime2(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
            a9,
        ) {
            this.dk = a;
            this.aC = b;
            this.a = c;
            this.b = d;
            this.c = e;
            this.d = f;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = g;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = h;
            this.k1 = i;
            this.k3 = this.k2 = null;
            this.k4 = j;
            this.r1 = null;
            this.r2 = k;
            this.rx = l;
            this.ry = m;
            this.x1 = n;
            this.x2 = o;
            this.y1 = p;
            this.y2 = q;
            this.G = r;
            this.L = s;
            this.S = a0;
            this.A = false;
            this.q = a1;
            this.X = null;
            this.E = a2;
            this.t = a3;
            this.a2 = a4;
            this.M = a5;
            this.N = a6;
            this.Y = a7;
            this.H = a8;
            this.l = a9;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklSlimeSpawnState: function hF() { },
        SklSlimeSpawn: function ef(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrBossSonic: function fc(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        PlrBossYuri: function fd(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        SklYuriControl: function eg(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        Engine: function Engine(a, b, c, d, e, f, g, h, i, j, k) {
            this.a = a;
            this.b = null;
            this.c = b;
            this.d = c;
            this.e = d;
            this.f = null;
            // 可从 this.gbu 获取

            this.r = e;
            this.x = f;
            this.z = g;
            this.Q = h;
            this.ch = i;
            this.cx = false;
            this.cy = null;
            this.db = j;
            this.dx = k;
        },
        jk: function jk() { },
        jj: function jj() { },
        jl: function jl(a) {
            this.a = a;
        },
        ji: function ji(a) {
            this.a = a;
        },
        Grp: function b7(a, b, c, d, e) {
            this.a = a;
            this.b = null;
            this.c = b;
            this.d = c;
            this.e = d;
            this.f = e;
        },
        IPlr: function fr() { },
        NPlr: function bF() {
            this.a = null;
        },
        HPlr: function V(a) {
            this.b = null;
            this.c = a;
            this.a = this.d = null;
        },
        MPlr: function dF() {
            this.a = this.c = this.b = null;
        },
        DPlr: function dp() {
            this.a = null;
        },
        HDamage: function bB(a) {
            this.a = a;
        },
        HRecover: function bm(a) {
            this.a = a;
        },
        RunUpdate: function aX(a, b, c, d, e, f, g, h) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.r = g;
            this.x = h;
        },
        RunUpdateCancel: function h2(a, b, c, d, e, f, g, h) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.r = g;
            this.x = h;
        },
        RunUpdateWin: function dX(a, b, c, d, e, f, g, h) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.r = g;
            this.x = h;
        },
        aq: function aq(a, b) {
            this.a = a;
            this.b = b;
        },
        lD: function lD(a, b) {
            this.a = a;
            this.b = b;
        },
        Minion: function aM() { },
        Plr: function u(
            name,
            clan_name,
            fgt,
            weapon,
            e,
            f,
            skills,
            actions,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            q,
            r,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a = name;
            this.b = clan_name;
            this.c = fgt;
            this.d = weapon;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = skills;
            this.k3 = this.k2 = null;
            this.k4 = actions;
            this.weapon = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = q;
            this.S = r;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        jX: function jX() { },
        BoostPassive: function BoostPassive() { }, // boostPassive
        jY: function jY() { },
        IMeta: function x() { },
        UpdateStateEntry: function aZ() { },
        PreStepEntry: function cB() { },
        PreDefendEntry: function bH() { },
        PostDefendEntry: function aB() { },
        PostDamageEntry: function ah() { },
        PreActionEntry: function aV() { },
        PostActionEntry: function bq() { },
        aF: function aF() { },
        UpdateStateImpl: function UpdateStateImpl(a) {
            this.x = a;
            this.c = this.b = this.a = null;
        },
        PreStepImpl: function fY(a) {
            this.x = a;
            this.c = this.b = this.a = null;
        },
        PostDefendImpl: function PostDefendImpl(a, b) {
            this.r = a;
            this.x = b;
            this.c = this.b = this.a = null;
        },
        PostDamageImpl: function cA(a) {
            this.x = a;
            this.c = this.b = this.a = null;
        },
        PreActionImpl: function ca(a) {
            this.x = a;
            this.c = this.b = this.a = null;
        },
        PostActionImpl: function b8(a) {
            this.x = a;
            this.c = this.b = this.a = null;
        },
        cp: function cp(a) {
            this.x = a;
            this.c = this.b = this.a = null;
        },
        bG: function bG(a, b) {
            this.a = a;
            this.b = b;
        },
        Skill: function Skill() { },
        ActionSkill: function b5() { },
        SklAttack: function h8(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklSimpleAttack: function hD(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklCounter: function SklCounter(a) {
            this.Q = false;
            this.cx = this.ch = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklDefend: function SklDefend(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklHide: function SklHide(a) {
            this.ch = this.Q = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        MergeState: function fC() { },
        SklMerge: function SklMerge(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        ProtectStat: function dV(a, b) {
            this.r = a;
            this.x = b;
            this.c = this.b = this.a = null;
        },
        SklProtect: function SklProtect(a) {
            this.Q = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklReflect: function SklReflect(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklReraise: function SklReraise(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        ShieldStat_: function e0(a, b) {
            this.r = a;
            this.x = b;
            this.c = this.b = this.a = null;
        },
        SklShield: function SklShield(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SklUpgrade: function SklUpgrade(a) {
            this.Q = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        SkillVoid: function SkillVoid(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        PlrZombie: function fX(
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
            i,
            j,
            k,
            l,
            m,
            n,
            o,
            p,
            dies,
            kills,
            s,
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
        ) {
            this.a6 = this.aj = null;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.z = this.y = this.x = this.r = this.f = this.e = null;
            this.Q = e;
            this.go =
                this.fy =
                this.fx =
                this.fr =
                this.dy =
                this.dx =
                this.db =
                this.cy =
                this.cx =
                this.ch =
                null;
            this.id = f;
            this.k1 = g;
            this.k3 = this.k2 = null;
            this.k4 = h;
            this.r1 = null;
            this.r2 = i;
            this.rx = j;
            this.ry = k;
            this.x1 = l;
            this.x2 = m;
            this.y1 = n;
            this.y2 = o;
            this.G = p;
            this.L = dies;
            this.S = kills;
            this.A = false;
            this.q = s;
            this.X = null;
            this.E = a0;
            this.t = a1;
            this.a2 = a2;
            this.M = a3;
            this.N = a4;
            this.Y = a5;
            this.H = a6;
            this.l = a7;
            this.a_ = this.Z = false;
            this.I = null;
        },
        ZombieState: function hY() { },
        SklZombie: function SklZombie(a) {
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        BossWeapon: function j2(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        SklDeathNote: function hg(a) {
            this.fx = this.fr = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        WeaponDeathNote: function eo(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        DummyChargeMeta: function fl() { },
        GuiYue: function jq(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        NoWeapon: function jN(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        RinickModifier: function k1(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        k3: function k3() { },
        RinickModifierPreAction: function h0(a) {
            this.r = a;
            this.c = this.b = this.a = null;
        },
        k2: function k2(a) {
            this.a = a;
        },
        RinickModifierUpdateState: function RinickModifierUpdateState() {
            this.c = this.b = this.a = null;
        },
        SklRinickModifierClone: function SklRinickModifierClone(a, b) {
            this.fr = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        hy: function hy(a, b) {
            this.Q = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        SklS11: function hz(a, b) {
            this.fr = a;
            this.e = false;
            this.f = b;
            this.c = this.b = this.a = this.r = null;
        },
        kb: function kb() { },
        WeaponS11: function ep(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        Weapon: function Weapon(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        kq: function kq() { },
        kr: function kr() { },
        ks: function ks() { },
        kt: function kt() { },
        ku: function ku() { },
        ko: function ko() { },
        kp: function kp() { },
        hc: function hc(a) {
            this.Q = false;
            this.cx = this.ch = null;
            this.e = false;
            this.f = a;
            this.c = this.b = this.a = this.r = null;
        },
        kv: function kv(a, b, c) {
            this.a = null;
            this.b = a;
            this.c = b;
            this.f = this.e = this.d = null;
            this.r = c;
        },
        ij: function ij() { },
        ShieldStat: function ik() { },
    },
    V = {
        // 评分
        // 普评/强评
        ProfileMain: function iV(a, b, c, d, e, f, g) {
            this.a = a;
            this.b = b;
            this.c = false;
            this.d = 1000;
            this.e = 33554431;
            this.f = c;
            this.r = d;
            this.x = null;
            this.y = e;
            this.z = f;
            this.ch = this.Q = 0;
            this.cx = null;
            this.cy = g;
        },
        j_: function j_(a, b) {
            this.a = a;
            this.b = b;
        },
        j0: function j0() { },
        j1: function j1(a) {
            this.a = a;
        },
    },
    W = {
        j4() {
            var s = document.createElement("canvas");
            return s;
        },
        rP(a, b, c) {
            var s,
                doc_body = document.body;
            doc_body.toString;
            s = C.BodyElement.aA(doc_body, a, b, c);
            s.toString;
            doc_body = new H.cf(new W.az(s), new W.jf(), t.ac.i("cf<z.E>"));
            return t.R.a(doc_body.gba(doc_body));
        },
        ds(a) {
            var s,
                r,
                q = "element tag unavailable";
            try {
                s = J.bv(a);
                if (typeof s.gdD(a) == "string") q = s.gdD(a);
            } catch (r) {
                H.unwrap_Exception(r);
            }
            return q;
        },
        nK() {
            var s = document.createElement("img");
            return s;
        },
        es(a, b, c, d) {
            // 设置 event listener
            var s = W.uJ(new W.kF(c), t.aD);
            if (s != null) {
                J.rs(a, b, s, false);
            }
            return new W.ia(a, b, s, false);
        },
        oc(a) {
            var s = document.createElement("a"),
                r = new W.l_(s, window.location);
            r = new W.cP(r);
            r.e6(a);
            return r;
        },
        tT(a, b, c, d) {
            return true;
        },
        tU(a, b, c, d) {
            var s,
                r = d.a,
                q = r.a;
            q.href = c;
            s = q.hostname;
            r = r.b;
            if (!(s == r.hostname && q.port == r.port && q.protocol == r.protocol))
                if (s === "")
                    if (q.port === "") {
                        r = q.protocol;
                        r = r === ":" || r === "";
                    } else r = false;
                else r = false;
            else r = true;
            return r;
        },
        oh() {
            var s = t.N,
                r = P.nQ(C.r, s),
                q = H.b(["TEMPLATE"], t.s);
            s = new W.it(r, P.c5(s), P.c5(s), P.c5(s), null);
            s.e7(null, new H.y(C.r, new W.l7(), t.fj), q, null);
            return s;
        },
        ll(a) {
            return W.oa(a);
        },
        oa(a) {
            if (a === window) return a;
            else return new W.kE(a);
        },
        uJ(a, b) {
            var s = $.P;
            if (s === C.f) return a;
            return s.eI(a, b);
        },
        HtmlElement: function HtmlElement() { },
        AnchorElement: function AnchorElement() { },
        AreaElement: function AreaElement() { },
        BaseElement: function BaseElement() { },
        Blob: function Blob() { },
        BodyElement: function BodyElement() { },
        CanvasElement: function CanvasElement() { },
        CanvasRenderingContext2D: function CanvasRenderingContext2D() { },
        b6: function b6() { },
        co: function co() { },
        j8: function j8() { },
        dm: function dm() { },
        c0: function c0() { },
        ja: function ja() { },
        jb: function jb() { },
        Element: function Element() { },
        jf: function jf() { },
        o: function o() { },
        fn: function fn() { },
        File: function cq() { },
        fp: function fp() { },
        c4: function c4() { },
        jL: function jL() { },
        c8: function c8() { },
        dH: function dH() { },
        bp: function bp() { },
        az: function az(a) {
            this.a = a;
        },
        v: function v() { },
        dM: function dM() { },
        dQ: function dQ() { },
        h4: function h4() { },
        ek: function ek() { },
        hN: function hN() { },
        kd: function kd(a) {
            this.a = a;
        },
        bb: function bb() { },
        ce: function ce() { },
        en: function en() { },
        hQ: function hQ() { },
        hR: function hR() { },
        cI: function cI() { },
        aY: function aY() { },
        eq: function eq() { },
        cL: function cL() { },
        ex: function ex() { },
        eH: function eH() { },
        i2: function i2() { },
        i8: function i8(a) {
            this.a = a;
        },
        m5: function m5(a, b) {
            this.a = a;
            this.$ti = b;
        },
        ia: function ia(a, b, c, d) {
            this.b = a;
            this.c = b;
            this.d = c;
            this.e = d;
        },
        kF: function kF(a) {
            this.a = a;
        },
        cP: function cP(a) {
            this.a = a;
        },
        cr: function cr() { },
        dN: function dN(a) {
            this.a = a;
        },
        jP: function jP(a) {
            this.a = a;
        },
        jO: function jO(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        },
        eD: function eD() { },
        l0: function l0() { },
        l1: function l1() { },
        it: function it(a, b, c, d, e) {
            this.e = a;
            this.a = b;
            this.b = c;
            this.c = d;
            this.d = e;
        },
        l7: function l7() { },
        is: function is() { },
        dv: function dv(a, b) {
            this.a = a;
            this.b = b;
            this.c = -1;
            this.d = null;
        },
        kE: function kE(a) {
            this.a = a;
        },
        l_: function l_(a, b) {
            this.a = a;
            this.b = b;
        },
        ix: function ix(a) {
            this.a = a;
            this.b = 0;
        },
        le: function le(a) {
            this.a = a;
        },
        i6: function i6() { },
        ig: function ig() { },
        ih: function ih() { },
        il: function il() { },
        iy: function iy() { },
        iz: function iz() { },
        iA: function iA() { },
        iB: function iB() { },
    },
    X = {
        dc(a) {
            // 似乎是什么算号方法?
            var s,
                r,
                q,
                p,
                o,
                n,
                m = a.length,
                l = P.aL(C.d.R((m * 8) / 6.5), 0, true, t.B);
            for (s = 0, r = 0, q = 0, p = 0, o = 0; o < m; ++o) {
                s = (s | C.JsInt.bX((a[o] & 255) ^ 0, r)) >>> 0;
                r += 8;
                if (r > 13) {
                    q = s & 8191;
                    if (q > 456) {
                        s = s >>> 13;
                        r -= 13;
                    } else {
                        q = s & 16383;
                        s = s >>> 14;
                        r -= 14;
                    }
                    n = p + 1;
                    // l[p] = J.J($.iM(), C.JsInt.V(q, 93))
                    l[p] = $.iM()[C.JsInt.V(q, 93)];
                    p = n + 1;
                    // l[n] = J.J($.iM(), q / 93 | 0)
                    l[n] = $.iM()[(q / 93) | 0];
                }
            }
            if (r > 0) {
                n = p + 1;
                // l[p] = J.J($.iM(), C.JsInt.V(s, 93))
                l[p] = $.iM()[C.JsInt.V(s, 93)];
                if (r > 7 || s > 92) {
                    p = n + 1;
                    // l[n] = J.J($.iM(), s / 93 | 0)
                    l[n] = $.iM()[(s / 93) | 0];
                } else {
                    p = n;
                }
            }
            C.Array.sp(l, p);
            return P.mh(l, 0, null);
        },
        f4(a, b) {
            var s,
                r,
                q,
                p,
                o,
                n,
                m,
                l,
                k,
                j = a.length,
                i = P.aL(C.d.R((j * 7) / 8), 0, true, t.B);
            for (s = J.aQ(a), r = 0, q = 0, p = -1, o = 0, n = 0; n < j; ++n) {
                m = s.a8(a, n);
                if (m > 126) continue;
                // l = J.J($.oS(), m)
                l = $.oS()[m];
                if (l === 93) {
                    continue;
                }
                if (p === -1) {
                    p = l;
                } else {
                    p += l * 93;
                    r |= C.JsInt.bX(p, q);
                    q += (p & 8191) > 456 ? 13 : 14;
                    do {
                        k = o + 1;
                        i[o] = (r & 255) ^ b;
                        r = r >>> 8;
                        q -= 8;
                        if (q > 7) {
                            o = k;
                            continue;
                        } else break;
                    } while (true);
                    o = k;
                    p = -1;
                }
            }
            if (p !== -1) {
                k = o + 1;
                i[o] = ((r | C.JsInt.bX(p, q)) ^ b) >>> 0;
                o = k;
            }
            C.Array.sp(i, o);
            return i;
        },
        k(a, b) {
            var s,
                r,
                q = new Uint8Array(H.on(X.f4(a, b))).buffer;
            H.mq(q, 0, null);
            s = q.byteLength;
            r = C.JsInt.ag(s - 0, 4);
            const result = new Uint32Array(q, 0, r)[1];
            // return new Uint32Array(q, 0, r)[1]
            // if (run_env.from_code) {
            //     console.log("X.k", a, b, result)
            // }
            logger.debug("X.k", a, b, result);
            return result;
        },
        D(a, b) {
            var s,
                r,
                q = new Uint8Array(H.on(X.f4(a, b))).buffer;
            H.mq(q, 0, null);
            s = q.byteLength;
            r = C.JsInt.ag(s - 0, 4);
            const result = new Float32Array(q, 0, r)[1];
            // return new Float32Array(q, 0, r)[1]
            // if (run_env.from_code) {
            //     console.log("X.D", a, b, result)
            // }
            logger.debug("X.D", a, b, result);
            return result;
        },
        je: function je() { },
        j9: function j9() { },
        ProfileFind: function iW(a, b) {
            this.a = a;
            this.b = -1;
            this.c = 33554431;
            this.e = 0;
            this.f = null;
            this.r = b;
        },
        iX: function iX() { },
        iY: function iY(a) {
            this.a = a;
        },
        iZ: function iZ(a) {
            this.a = a;
        },
    };
var Y = {
    RC4: function dW() {
        this.b = this.a = 0;
        this.c = null;
    },
};

Y.RC4.prototype = {
    bd(a, b) {
        // init
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l = new Array(256);
        l.fixed$length = Array;
        l = this.c = H.b(l, t.i);
        for (s = 0; s < 256; ++s) l[s] = s;
        r = a.length;
        for (q = 0; q < b; ++q)
            for (p = 0, o = 0; o < 256; ++o) {
                n = a[C.JsInt.V(o, r)];
                m = l[o];
                p = (p + m + n) & 255;
                l[o] = l[p];
                l[p] = m;
            }
        this.a = this.b = 0;
    },
    bO(a) {
        // xorBytes
        var s,
            r,
            q,
            p,
            o,
            m = a.length;
        for (s = 0; s < m; ++s) {
            r = this.a = (this.a + 1) & 255;
            q = this.b;
            p = this.c;
            o = p[r];
            q = this.b = (q + o) & 255;
            p[r] = p[q];
            p[q] = o;
            a[s] = (a[s] ^ p[(p[r] + p[q]) & 255]) >>> 0;
            this.b = (q + a[s]) & 255;
        }
    },
    di(a) {
        // decryptBytes
        var s,
            r,
            q,
            p,
            o,
            n,
            l = a.length;
        for (s = 0; s < l; ++s) {
            r = this.a = (this.a + 1) & 255;
            q = this.b;
            p = this.c;
            o = p[r];
            q = this.b = (q + o) & 255;
            p[r] = p[q];
            p[q] = o;
            n = a[s];
            a[s] = (n ^ p[(p[r] + p[q]) & 255]) >>> 0;
            this.b = (q + n) & 255;
        }
    },
    n() {
        // nextByte
        // next byte from ShadowR
        var r = (this.a = (this.a + 1) & 255),
            q = this.b,
            p = this.c,
            o = p[r];
        q = this.b = (q + o) & 255;
        p[r] = p[q];
        p[q] = o;
        return p[(p[r] + p[q]) & 255];
    },
};
var HtmlRenderer = {
    add_span(a) {
        var s = document.createElement("span");
        s.classList.add(a);
        return s;
    },
    add_div(a) {
        var s = document.createElement("div");
        s.classList.add(a);
        return s;
    },
    add_p(a) {
        var s = document.createElement("p");
        s.classList.add(a);
        return s;
    },
    static_init() {
        var async_goto = 0,
            r = P._makeAsyncAwaitCompleter(t.z),
            q,
            p;
        var $async$jv = P._wrapJsFunctionForAsync((a, b) => {
            if (a === 1) return P.async_rethrow(b, r);
            while (true)
                switch (async_goto) {
                    case 0:
                        if (run_env.from_code) {
                            // 直接忽略这里的 wait
                            async_goto = 2;
                        } else {
                            Sgls.tw();
                            q = W.nK();
                            $.md = q;
                            W.es(q, "load", Sgls.vg(), false);
                            $.md.src =
                                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAgMAAAC+UIlYAAAADFBMVEX/AAD/AP8A/wD///8SU+EWAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwaCg0BGtaVrQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAADHUlEQVRYw+2WPY6jMBTHLejhMNOu4BRkpTTp5xIgzQGmilKmSjFUkbZFCpp6tN3mHGikpAK8/r/nZwhxMlllViOtFsWxsX/2+7SNKj941E7r/lr5Q6BNuW5iqqtv3xLlBtKW67jpd3XY75SyAF4wAwMAwpqLAVgEADuDANOu4iahCQ7AIAaUSrBalbYEDCI+BESPiyJk0KukmCnlzMybHHVXLD4M9w35oIJC6R4FbVm6UNw2QB0UoQcIawGaoIg9QNwI0AZF6gHSVgAdFNoDmH4BXp88gOl7FeD92QOYvvcTYDBvAAE5ET4AYpySPgCKOjO9gDHVOcoLGGc5V3sB424XLC9gAvYZ+WAT1Joa0KahxEWWx/0AkKntAJhBQANApjYEcDZhx+kB2JKpdTQA2GEjoGLzEidCN0kVW4BmKCilegGedRttU0RTgBpKhQ544iC+DkADpWIHFJwGwQCY5SFGACwPMU5JUtAoKkDFZicjoI5gqjOTze5HAOeFA2r0hWOAM+tiLCQ3z2LxGedDnVSjnNwqFU3OKDho6KDTltu049SuhYtT3os4Bu0BKjuOrTCFdjPaOERHVinMxip0HsixPPKLYvmKTxS5M0aeVWxBnWzjJqrCOhks4B3nAAwCOgNEBJaXg4vFWBGiJBSUg4sVFSWtmc5UAGyqNdM6CsvKwWWdZR01cfXI3dbVk2BNA/Yp+WCX5TSPxncFiZAXB5ivALIGXwM+ALcuANQ/Ht5+ngHbsI4AoK7eHpKrK5zcmxd18FkhLicdrgGkw00ioOhVJcfA2Eynw6UVnA5j4CYzT4J1fz5cGnDfD38RkM+DLwTc7f/VwLXb/37g/nz4D/yTwEuWPWbmKTN6ynI5K7P5JkNZZtlMLbWe5Vp3m1x35jdfLg6zfL/q8l/fu4XWB7XW+ghgpQHoPTrzwwJtKoo6TGPNHUcZcIA0FlwfLgLTIitfBES3rwROlLQvh8VkkDyJP+PFPZy0niyPmly90XoON6/sLDuhWx8WRwrWS949IlAIGIK1ybs5grXer44U7pKjXdKfCTe9I9zzzew3hQ1VpfX/zmMAAAAASUVORK5CYII=";
                            async_goto = 2;
                            // 等待这个 callback 被调用
                            return P._asyncAwait($.nt().a, $async$jv);
                        }
                    case 2:
                        if (run_env.from_code) {
                            logger.debug("loading gAd data");
                            LangData.load_lang(t.cF.a(C.C.bt(0, assets_data.lang)));
                            // LangData.v1(assets_data.lang)
                            // LangData.load_lang(assets_data.lang)
                        } else {
                            p = window.sessionStorage.getItem(LangData.eQ("ll"));
                            if (typeof p == "string") {
                                LangData.load_lang(t.cF.a(C.C.bt(0, p)));
                            }
                        }
                        return P._asyncReturn(null, r);
                }
        });
        return P._asyncStartSync($async$jv, r);
    },
    outer_main(engine) {
        var s = document;

        const plist = s.querySelector(".plist");
        const pbody = s.querySelector(".pbody");

        s = new HtmlRenderer.inner_render(plist, pbody, engine, $.ro().ax(256));
        s.e0(engine);
        logger.debug("finish html.outer_main");
        return s;
    },
    aA(a, b, c, d, e, f) {
        var s = a.measureText(b);
        if (f && s.width < e) c += C.d.ag(e - s.width, 2);
        a.fillText(b, c, d + 15, e);
        return s.width;
    },
    ju(a, b, c, d) {
        $.bU().src = $.mg.h(0, b.fy);
        a.drawImage($.bU(), c + 4, d + 6);
        HtmlRenderer.aA(a, b.dx, c + 24, d + 5, 90, false);
    },
    rV(a, b) {
        logger.debug("reaching html.rV");
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h = "#000000",
            g = "#EEEEEE",
            f = W.j4(),
            e = 1;
        if (a.length + b.length <= 128) e = 2;
        f.width = 320 * e;
        f.height = ((a.length + b.length) * 26 + 88) * e + 24;
        s = f.getContext("2d");
        s.imageSmoothingEnabled = false;
        s.fillStyle = "white";
        J.bj(s, 0, 0, f.width, f.height);
        if (!J.Y(e, 1)) J.rC(s, e, 0, 0, e, 0, 0);
        q = document.body;
        q.toString;
        s.font = window.getComputedStyle(q, "").font;
        s.fillStyle = h;
        HtmlRenderer.aA(
            s,
            "\u21dc\u3000" + LangData.get_lang("CeaN") + "\u3000\u21dd",
            0,
            4,
            320,
            true,
        );
        r = 26;
        s.fillStyle = "#FAFAFA";
        J.bj(s, 0, r, 320, 32);
        s.fillStyle = g;
        J.bj(s, 0, r, 320, 2);
        s.fillStyle = h;
        p = HtmlRenderer.aA(s, LangData.get_lang("ePya"), 0, r + 8, 114, true);
        HtmlRenderer.aA(s, LangData.get_lang("AoUA"), 114, r + 8, 46, true);
        HtmlRenderer.aA(s, LangData.get_lang("aXIa"), 160, r + 8, 46, true);
        HtmlRenderer.aA(s, LangData.get_lang("MdQa"), 206, r + 8, 114, true);
        $.bU().src =
            "data:image/gif;base64,R0lGODlhFAAUALMAAAAAAP///98AJDsBRb3L09fi6NHf5ur2/JbFU63abcPuhcLthc/1mf///wAAAAAAACH5BAEAAA0ALAAAAAAUABQAAASCsMk5x6A4y6Gu/pyCXMJUaqGiJELbtCc1MOqiwnhl7aq675WAUGgIDYaBQ7FxTA4OyuIRengalr+fL2thWnrgcKLLLFS53ALh0nxWoe64mi1s1++BwZyJt+fre3p/g356axuEfQEFA4cbjIp5c44beowFl2sEax4yjY2aoZ0ZaEAUEQA7";
        q = $.bU();
        o = C.d.ag(114 - p, 2) - 24;
        J.iO(s, q, o, r + 6);
        q = $.bU();
        n = C.d.ag(114 + p, 2) + 4;
        J.iO(s, q, n, r + 6);
        r += 32;
        for (
            q = a.length, m = 0;
            m < a.length;
            a.length === q || (0, H.F)(a), ++m
        ) {
            l = a[m];
            s.fillStyle = g;
            J.bj(s, 0, r, 320, 2);
            s.fillStyle = "#ddddd0";
            J.bj(s, 22, r + 4, C.d.aI(l.z.offsetWidth), 2);
            s.fillStyle = "#4c4";
            J.bj(s, 22, r + 4, C.d.R(l.go / 4), 2);
            s.fillStyle = h;
            HtmlRenderer.ju(s, l, 0, r);
            HtmlRenderer.aA(s, C.JsInt.k(l.c), 114, r + 5, 46, true);
            HtmlRenderer.aA(s, C.JsInt.k(l.d), 160, r + 5, 46, true);
            k = l.e;
            if (k != null) HtmlRenderer.ju(s, $.ay.h(0, k), 206, r);
            r += 26;
        }
        s.fillStyle = "#FAFAFA";
        J.bj(s, 0, r, 320, 32);
        s.fillStyle = g;
        J.bj(s, 0, r, 320, 2);
        s.fillStyle = h;
        HtmlRenderer.aA(s, LangData.get_lang("eFKN"), 0, r + 8, 114, true);
        HtmlRenderer.aA(s, LangData.get_lang("AoUA"), 114, r + 8, 46, true);
        HtmlRenderer.aA(s, LangData.get_lang("aXIa"), 160, r + 8, 46, true);
        HtmlRenderer.aA(s, LangData.get_lang("MdQa"), 206, r + 8, 114, true);
        $.bU().src =
            "data:image/gif;base64,R0lGODlhFAAUAMQAAAAAAP///98AJDsBRd3y/vv+/4m4RpbFU6LPYqLOYqLPY6PPY6HNYq3abazYbbfgfcPuhc/1mdL1n9/9td78td36tHqpNYi3Q4i2Q4azQ5/JYZzEYMPqiv39/f///wAAACH5BAEAAB4ALAAAAAAUABQAAAWOoCeO4zCQaCoO0Km+LHScwlirMQQ1Qu/1N9IgoisCj6hhZFLcHYOryLKp4/mE0gmT6nStJBXKlru7eAcSMrXRcLHS6iLbcjLZ7cX73RPrEAhqfgR0fBASHQWAZIiDdQgNHZGBBR1mK5CSi5FnGpSKa5EEXnyeXGyeKaEOegMIoSkEfgMJCwkKDAYDsQQjIQA7";
        J.iO(s, $.bU(), o, r + 6);
        J.iO(s, $.bU(), n, r + 6);
        r += 32;
        for (
            q = b.length, m = 0;
            m < b.length;
            b.length === q || (0, H.F)(b), ++m
        ) {
            j = b[m];
            s.fillStyle = g;
            J.bj(s, 0, r, 320, 2);
            s.fillStyle = h;
            HtmlRenderer.ju(s, j, 0, r);
            HtmlRenderer.aA(s, C.JsInt.k(j.c), 114, r + 5, 46, true);
            HtmlRenderer.aA(s, C.JsInt.k(j.d), 160, r + 5, 46, true);
            o = j.e;
            if (o != null) HtmlRenderer.ju(s, $.ay.h(0, o), 206, r);
            r += 26;
        }
        s.fillStyle = "#F8F8F8";
        J.bj(s, 0, r, 320, 2);
        try {
            J.rx(s);
            r *= e;
            s.fillStyle = "#888888";
            HtmlRenderer.aA(s, $.qp(), 0, r + 2, 140, false);
        } catch (i) {
            H.unwrap_Exception(i);
        }
        return f;
    },
    rU(a, b) {
        var s = a.c,
            r = b.c;
        if (s === r) return a.cx - b.cx;
        return r - s;
    },
    t9(a) {
        var s = J.m_(a, "+");
        if (s > -1)
            return (
                C.String.af(a, 0, s) +
                '<span class="small">' +
                C.String.ay(a, s) +
                "</span>"
            );
        return a;
    },
    t7(a, b, c) {
        var s = HtmlRenderer.add_div("plr_list"),
            r = HtmlRenderer.add_div("sgl"),
            q = HtmlRenderer.add_div("name"),
            p = HtmlRenderer.add_div("maxhp"),
            o = HtmlRenderer.add_div("oldhp"),
            n = HtmlRenderer.add_div("hp"),
            m = $.jU + 1;
        $.jU = m;
        m = new HtmlRenderer.PlrView(a, s, r, q, p, o, n, m);
        m.cP(a, b, c, {});
        return m;
    },
    t8(a, b, c) {
        var s = HtmlRenderer.add_div("plr_list"),
            r = HtmlRenderer.add_div("sgl"),
            q = HtmlRenderer.add_div("name"),
            p = HtmlRenderer.add_div("maxhp"),
            o = HtmlRenderer.add_div("oldhp"),
            n = HtmlRenderer.add_div("hp"),
            m = $.jU + 1;
        $.jU = m;
        m = new HtmlRenderer.fW(a, s, r, q, p, o, n, m);
        m.cP(a, b, false, {});
        return m;
    },
    _updateToHtml(a) {
        var s,
            span_element,
            q,
            p,
            o,
            max_hp_element,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f = a.a;
        if (f > 0 && a.e != null) $.ay.h(0, a.e.gb2()).dc(f);
        s = H.b([], t.j);
        span_element = HtmlRenderer.add_span("u");
        C.R.by(
            span_element,
            H.oO(
                a.d,
                $.rm(),
                new HtmlRenderer.lq(new HtmlRenderer._renderItem(s, a), a),
                null,
            ),
            $.bV(),
        );
        for (
            f = s.length, q = t.A, p = 0;
            p < s.length;
            s.length === f || (0, H.F)(s), ++p
        ) {
            o = s[p];
            if (o instanceof T.HPlr) {
                max_hp_element = q.a(
                    span_element.querySelector("." + H.as_string(o.b) + " > .maxhp"),
                );
                m = o.c;
                if (m >= o.d) {
                    l = document;
                    k = l.createElement("div");
                    k.classList.add("oldhp");
                    j = k.style;
                    m = "" + C.d.R(m / 4) + "px";
                    j.width = m;
                    i = l.createElement("div");
                    i.classList.add("hp");
                    m = i.style;
                    l = "" + C.d.R(o.d / 4) + "px";
                    m.width = l;
                    max_hp_element.appendChild(k);
                    max_hp_element.appendChild(i);
                } else {
                    l = document;
                    h = l.createElement("div");
                    h.classList.add("healhp");
                    j = h.style;
                    g = "" + C.d.R(o.d / 4) + "px";
                    j.width = g;
                    i = l.createElement("div");
                    i.classList.add("hp");
                    l = i.style;
                    m = "" + C.d.R(m / 4) + "px";
                    l.width = m;
                    max_hp_element.appendChild(h);
                    max_hp_element.appendChild(i);
                }
            } else if (o instanceof T.DPlr) {
                q.a(span_element.querySelector(".name")).classList.add("namedie");
            }
        }
        return span_element;
    },
    // MARK: html render init
    inner_render: function inner_render(plist, pbody, profiler, randomer) {
        this.a = plist;
        this.b = pbody;
        this.c = profiler; // 输入的 profiler
        this.d = null;
        this.f = this.e = false;
        this.r = 3;
        this.x = randomer;
        this.y = 2;
        this.Q = this.z = null;
        this.ch = 0;
        this.cx = null;
        this.cy = true;
        this.db = null;
        this.dx = true;
    },
    jx: function jx(a) {
        this.a = a;
    },
    jy: function jy() { },
    jw: function jw() { },
    jA: function jA(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    },
    addPlrToTable: function jz(a) {
        this.a = a;
    },
    jB: function jB() { },
    jC: function jC() { },
    jD: function jD(a) {
        this.a = a;
    },
    send_win_data: function jE(a, b, c, d, e) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
    },
    PlrGroup: function jT(a) {
        this.a = a;
        this.b = null;
    },
    PlrView: function ax(a, b, c, d, e, f, g, h) {
        this.a = a;
        this.b = null;
        this.d = this.c = 0;
        this.e = null;
        this.f = b;
        this.r = null;
        this.x = c;
        this.y = d;
        this.z = e;
        this.Q = f;
        this.ch = g;
        this.cx = h;
        this.fy = this.fx = this.fr = this.dy = this.dx = this.db = this.cy = null;
        this.go = 0;
    },
    jV: function jV(a, b) {
        this.a = a;
        this.b = b;
    },
    fW: function fW(a, b, c, d, e, f, g, h) {
        this.a = a;
        this.b = null;
        this.d = this.c = 0;
        this.e = null;
        this.f = b;
        this.r = null;
        this.x = c;
        this.y = d;
        this.z = e;
        this.Q = f;
        this.ch = g;
        this.cx = h;
        this.fy = this.fx = this.fr = this.dy = this.dx = this.db = this.cy = null;
        this.go = 0;
    },
    _renderItem: function lp(a, b) {
        this.a = a;
        this.b = b;
    },
    lq: function lq(a, b) {
        this.a = a;
        this.b = b;
    },
};
var w = [A, C, Sgls, H, J, L, LangData, P, S, T, V, W, X, Y, HtmlRenderer];

var $ = {};

H.m8.prototype = {};
J.Interceptor.prototype = {
    aW(a, b) {
        return a === b;
    },
    gak(a) {
        return H.Primitives_objectHashCode(a);
    },
    k(a) {
        return "Instance of '" + H.as_string(H.jZ(a)) + "'";
    },
};
J.fw.prototype = {
    k(a) {
        return String(a);
    },
    gak(a) {
        return a ? 519018 : 218159;
    },
    $iac: 1,
};
J.cs.prototype = {
    aW(a, b) {
        return null == b;
    },
    k(a) {
        return "null";
    },
    gak(a) {
        return 0;
    },
    gcw(a) {
        return C.S;
    },
    $iN: 1,
};
J.bE.prototype = {
    gak(a) {
        return 0;
    },
    k(a) {
        return String(a);
    },
    $inM: 1,
};
J.PlainJavaScriptObject.prototype = {};
J.UnknownJavaScriptObject.prototype = {};
J.JavaScriptFunction.prototype = {
    k(a) {
        var s = a[$.oR()];
        if (s == null) return this.dQ(a);
        return "JavaScript function for " + H.as_string(J.b4(s));
    },
};
J.JsArray.prototype = {
    j(a, b) {
        if (!!a.fixed$length) H.throw_expression(P.UnsupportError("add"));
        a.push(b);
    },
    cu(a, b) {
        var s;
        if (!!a.fixed$length) H.throw_expression(P.UnsupportError("removeAt"));
        s = a.length;
        if (b >= s) throw H.wrap_expression(P.k0(b, null));
        return a.splice(b, 1)[0];
    },
    co(a, b, c) {
        if (!!a.fixed$length) H.throw_expression(P.UnsupportError("insert"));
        if (b < 0 || b > a.length) throw H.wrap_expression(P.k0(b, null));
        a.splice(b, 0, c);
    },
    U(a, b) {
        var s;
        if (!!a.fixed$length) H.throw_expression(P.UnsupportError("remove"));
        for (s = 0; s < a.length; ++s)
            if (J.Y(a[s], b)) {
                a.splice(s, 1);
                return true;
            }
        return false;
    },
    // push all elements of b to a
    a5(a, b) {
        var s, r;
        if (a.fixed$length) H.throw_expression(P.UnsupportError("addAll"));
        if (Array.isArray(b)) {
            this.ea(a, b);
            return;
        }
        for (s = b.length, r = 0; r < b.length; b.length === s || (0, H.F)(b), ++r)
            a.push(b[r]);
    },
    // push all elements of b to a
    ea(a, b) {
        var s,
            r = b.length;
        if (r === 0) return;
        if (a === b) throw H.wrap_expression(P.aK(a));
        for (s = 0; s < r; ++s) a.push(b[s]);
    },
    f5(a, b, c) {
        return new H.y(a, b, H._arrayInstanceType(a).i("@<1>").aL(c).i("y<1,2>"));
    },
    aV(a, b) {
        var s,
            r = P.aL(a.length, "", false, t.N);
        for (s = 0; s < a.length; ++s) r[s] = H.as_string(a[s]);
        return r.join(b);
    },
    dz(a, b) {
        var s,
            r,
            q = a.length;
        if (q === 0) throw H.wrap_expression(H.fu());
        s = a[0];
        for (r = 1; r < q; ++r) {
            s = b.$2(s, a[r]);
            if (q !== a.length) throw H.wrap_expression(P.aK(a));
        }
        return s;
    },
    dl(a, b) {
        var s,
            r,
            q = a.length;
        for (s = 0; s < q; ++s) {
            r = a[s];
            if (b.$1(r)) return r;
            if (a.length !== q) throw H.wrap_expression(P.aK(a));
        }
        throw H.wrap_expression(H.fu());
    },
    ai(a, b) {
        return a[b];
    },
    al(a, b, c) {
        var s;
        if (b == null) H.throw_expression(H.R(b));
        if (!H.aP(b)) throw H.wrap_expression(H.R(b));
        s = a.length;
        if (b > s) throw H.wrap_expression(P.a8(b, 0, s, "start", null));
        if (c == null) c = s;
        else if (c < b || c > s)
            throw H.wrap_expression(P.a8(c, b, s, "end", null));
        if (b === c) return H.b([], H._arrayInstanceType(a));
        return H.b(a.slice(b, c), H._arrayInstanceType(a));
    },
    cL(a, b) {
        return this.al(a, b, null);
    },
    geT(a) {
        if (a.length > 0) return a[0];
        throw H.wrap_expression(H.fu());
    },
    gbl(a) {
        var s = a.length;
        if (s > 0) return a[s - 1];
        throw H.wrap_expression(H.fu());
    },
    df(a, b) {
        var s,
            r = a.length;
        for (s = 0; s < r; ++s) {
            if (b.$1(a[s])) return true;
            if (a.length !== r) throw H.wrap_expression(P.aK(a));
        }
        return false;
    },
    bb(a, b) {
        if (!!a.immutable$list) H.throw_expression(P.UnsupportError("sort"));
        H.tJ(a, b == null ? J.bO() : b);
    },
    aJ(a) {
        return this.bb(a, null);
    },
    aT(a, b) {
        var s,
            r = a.length;
        if (0 >= r) return -1;
        for (s = 0; s < r; ++s) if (J.Y(a[s], b)) return s;
        return -1;
    },
    w(a, b) {
        var s;
        for (s = 0; s < a.length; ++s)
            // if (J.Y(a[s], b)) return true
            if (a[s] === b) {
                return true;
            }
        return false;
    },
    k(a) {
        return P.IterableBase_iterableToFullString(a, "[", "]");
    },
    ga0(a) {
        return new J.db(a, a.length);
    },
    gak(a) {
        return H.Primitives_objectHashCode(a);
    },
    gp(a) {
        return a.length;
    },
    sp(a, b) {
        if (a.fixed$length) {
            H.throw_expression(P.UnsupportError("set length"));
        }
        if (!H.aP(b)) throw H.wrap_expression(P.da(b, "newLength", null));
        a.length = b;
    },
    h(a, b) {
        if (!H.aP(b)) throw H.wrap_expression(H.bQ(a, b));
        if (b >= a.length || b < 0) throw H.wrap_expression(H.bQ(a, b));
        return a[b];
    },
    m(a, b, c) {
        if (a.immutable$list) H.throw_expression(P.UnsupportError("indexed set"));
        if (!H.aP(b)) throw H.wrap_expression(H.bQ(a, b));
        if (b >= a.length || b < 0) throw H.wrap_expression(H.bQ(a, b));
        a[b] = c;
    },
    $iA: 1,
    $iw: 1,
};
J.JsUnmodifiableArray.prototype = {};
J.db.prototype = {
    gC() {
        return this.d;
    },
    u() {
        var s,
            q = this.a,
            p = q.length;
        if (this.b !== p) throw H.wrap_expression(H.F(q));
        s = this.c;
        if (s >= p) {
            this.d = null;
            return false;
        }
        this.d = q[s];
        this.c = s + 1;
        return true;
    },
};
J.JsNumber.prototype = {
    bg(a, b) {
        var s;
        if (typeof b != "number") throw H.wrap_expression(H.R(b));
        if (a < b) return -1;
        else if (a > b) return 1;
        else if (a === b) {
            if (a === 0) {
                s = this.gcp(b);
                if (this.gcp(a) === s) return 0;
                if (this.gcp(a)) return -1;
                return 1;
            }
            return 0;
        } else if (isNaN(a)) {
            if (isNaN(b)) return 0;
            return 1;
        } else return -1;
    },
    gcp(a) {
        return a === 0 ? 1 / a < 0 : a < 0;
    },
    R(a) {
        var s, r;
        if (a >= 0) {
            if (a <= 2147483647) {
                s = a | 0;
                return a === s ? s : s + 1;
            }
        } else if (a >= -2147483648) return a | 0;
        r = Math.ceil(a);
        if (isFinite(r)) return r;
        throw H.wrap_expression(P.UnsupportError("" + a + ".ceil()"));
    },
    eW(a) {
        var s, r;
        if (a >= 0) {
            if (a <= 2147483647) return a | 0;
        } else if (a >= -2147483648) {
            s = a | 0;
            return a === s ? s : s - 1;
        }
        r = Math.floor(a);
        if (isFinite(r)) return r;
        throw H.wrap_expression(P.UnsupportError("" + a + ".floor()"));
    },
    aI(a) {
        if (a > 0) {
            if (a !== 1 / 0) return Math.round(a);
        } else if (a > -1 / 0) return 0 - Math.round(0 - a);
        throw H.wrap_expression(P.UnsupportError("" + a + ".round()"));
    },
    k(a) {
        if (a === 0 && 1 / a < 0) return "-0.0";
        else return "" + a;
    },
    gak(a) {
        var s,
            r,
            q,
            p,
            o = a | 0;
        if (a === o) return o & 536870911;
        s = Math.abs(a);
        r = (Math.log(s) / 0.6931471805599453) | 0;
        q = Math.pow(2, r);
        p = s < 1 ? s / q : q / s;
        return (
            ((((p * 9007199254740992) | 0) + ((p * 3542243181176521) | 0)) * 599197 +
                r * 1259) &
            536870911
        );
    },
    V(a, b) {
        var s;
        if (typeof b != "number") throw H.wrap_expression(H.R(b));
        s = a % b;
        if (s === 0) return 0;
        if (s > 0) return s;
        if (b < 0) return s - b;
        else return s + b;
    },
    P(a, b) {
        if (typeof b != "number") throw H.wrap_expression(H.R(b));
        if ((a | 0) === a) if (b >= 1 || b < -1) return (a / b) | 0;
        return this.d6(a, b);
    },
    ag(a, b) {
        return (a | 0) === a ? (a / b) | 0 : this.d6(a, b);
    },
    d6(a, b) {
        var s = a / b;
        if (s >= -2147483648 && s <= 2147483647) return s | 0;
        if (s > 0) {
            if (s !== 1 / 0) return Math.floor(s);
        } else if (s > -1 / 0) return Math.ceil(s);
        throw H.wrap_expression(
            P.UnsupportError(
                "Result of truncating division is " +
                H.as_string(s) +
                ": " +
                H.as_string(a) +
                " ~/ " +
                b,
            ),
        );
    },
    bX(a, b) {
        if (typeof b != "number") throw H.wrap_expression(H.R(b));
        if (b < 0) throw H.wrap_expression(H.R(b));
        return b > 31 ? 0 : (a << b) >>> 0;
    },
    ez(a, b) {
        return b > 31 ? 0 : (a << b) >>> 0;
    },
    am(a, b) {
        var s;
        if (a > 0) s = this.d5(a, b);
        else {
            s = b > 31 ? 31 : b;
            s = (a >> s) >>> 0;
        }
        return s;
    },
    d5(a, b) {
        return b > 31 ? 0 : a >>> b;
    },
};
J.JsInt.prototype = {
    $il: 1,
};
J.jF.prototype = {};
J.JsString.prototype = {
    aQ(a, b) {
        if (!H.aP(b)) throw H.wrap_expression(H.bQ(a, b));
        if (b < 0) throw H.wrap_expression(H.bQ(a, b));
        if (b >= a.length) H.throw_expression(H.bQ(a, b));
        return a.charCodeAt(b);
    },
    a8(a, b) {
        if (b >= a.length) throw H.wrap_expression(H.bQ(a, b));
        return a.charCodeAt(b);
    },
    bK(a, b, c) {
        var s = b.length;
        if (c > s) throw H.wrap_expression(P.a8(c, 0, s, null, null));
        return new H.ip(b, a, c);
    },
    de(a, b) {
        return this.bK(a, b, 0);
    },
    dq(a, b, c) {
        var s,
            r,
            q = null,
            p = b.length;
        if (c > p) throw H.wrap_expression(P.a8(c, 0, p, q, q));
        s = a.length;
        if (c + s > p) return q;
        for (r = 0; r < s; ++r) if (this.a8(b, c + r) !== this.a8(a, r)) return q;
        return new H.bK(c, a);
    },
    B(a, b) {
        if (typeof b != "string") throw H.wrap_expression(P.da(b, null, null));
        return a + b;
    },
    cl(a, b) {
        var s, r;
        if (typeof b != "string") H.throw_expression(H.R(b));
        s = b.length;
        r = a.length;
        if (s > r) return false;
        return b === this.ay(a, r - s);
    },
    fu(a, b, c) {
        P.tp(0, 0, a.length, "startIndex");
        return H.iG(a, b, c, 0);
    },
    cK(a, b) {
        if (b == null) H.throw_expression(H.R(b));
        if (typeof b == "string") return H.b(a.split(b), t.s);
        else if (b instanceof H.JSSyntaxRegExp && b.gep().exec("").length - 2 === 0)
            return H.b(a.split(b.b), t.s);
        else return this.ek(a, b);
    },
    ek(a, b) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = H.b([], t.s);
        for (s = J.lU(b, a), s = s.ga0(s), r = 0, q = 1; s.u();) {
            p = s.gC();
            o = p.gbc(p);
            n = p.gbh();
            q = n - o;
            if (q === 0 && r === o) continue;
            m.push(this.af(a, r, o));
            r = n;
        }
        if (r < a.length || q > 0) m.push(this.ay(a, r));
        return m;
    },
    bA(a, b) {
        // a start with b
        var s;
        if (typeof b == "string") {
            s = b.length;
            if (s > a.length) return false;
            return b === a.substring(0, s);
        }
        return J.rw(b, a, 0) != null;
    },
    af(a, b, c) {
        if (!H.aP(b)) H.throw_expression(H.R(b));
        return a.substring(b, P.cE(b, c, a.length));
    },
    ay(a, b) {
        return this.af(a, b, null);
    },
    fN(a) {
        return a.toLowerCase();
    },
    trim_name(a) {
        // trim unicode 133(\n)
        var s,
            r,
            q,
            p = a.trim(),
            o = p.length;
        if (o === 0) return p;
        if (this.a8(p, 0) === 133) {
            s = J.check_from_start(p, 1);
            if (s === o) return "";
        } else s = 0;
        r = o - 1;
        q = this.aQ(p, r) === 133 ? J.check_from_end(p, r) : o;
        if (s === 0 && q === o) return p;
        return p.substring(s, q);
    },
    cG(a, b) {
        var s, r;
        if (0 >= b) return "";
        if (b === 1 || a.length === 0) return a;
        if (b !== b >>> 0) throw H.wrap_expression(C.D);
        for (s = a, r = ""; true;) {
            if ((b & 1) === 1) r = s + r;
            b = b >>> 1;
            if (b === 0) break;
            s += s;
        }
        return r;
    },
    fh(a, b, c) {
        var s = b - a.length;
        if (s <= 0) return a;
        return this.cG(c, s) + a;
    },
    aT(a, b) {
        var s, r, q;
        if (b == null) H.throw_expression(H.R(b));
        s = a.length;
        if (typeof b == "string") return a.indexOf(b, 0);
        for (r = J.aQ(b), q = 0; q <= s; ++q) if (r.dq(b, a, q) != null) return q;
        return -1;
    },
    dh(a, b, c) {
        var s;
        if (b == null) H.throw_expression(H.R(b));
        s = a.length;
        if (c > s) throw H.wrap_expression(P.a8(c, 0, s, null, null));
        return H.iF(a, b, c);
    },
    w(a, b) {
        return this.dh(a, b, 0);
    },
    bg(a, b) {
        var s;
        if (typeof b != "string") throw H.wrap_expression(H.R(b));
        if (a === b) s = 0;
        else s = a < b ? -1 : 1;
        return s;
    },
    k(a) {
        return a;
    },
    gak(a) {
        var s, r, q;
        for (s = a.length, r = 0, q = 0; q < s; ++q) {
            r = (r + a.charCodeAt(q)) & 536870911;
            r = (r + ((r & 524287) << 10)) & 536870911;
            r ^= r >> 6;
        }
        r = (r + ((r & 67108863) << 3)) & 536870911;
        r ^= r >> 11;
        return (r + ((r & 16383) << 15)) & 536870911;
    },
    gp(a) {
        return a.length;
    },
    $ifN: 1,
    $im: 1,
};
H.fz.prototype = {
    k(a) {
        var s = "LateInitializationError: " + this.a;
        return s;
    },
};
H.ff.prototype = {
    gp(a) {
        return this.a.length;
    },
    h(a, b) {
        return C.String.aQ(this.a, b);
    },
};
H.dO.prototype = {
    k(a) {
        return (
            "Null is not a valid value for the parameter '" +
            this.a +
            "' of type '" +
            H.mz(this.$ti.c).k(0) +
            "'"
        );
    },
    $ibc: 1,
};
H.A.prototype = {};
H.M.prototype = {
    ga0(a) {
        return new H.cv(this, this.gp(this));
    },
    aV(a, b) {
        var s,
            r,
            q,
            o = this.gp(this);
        if (b.length !== 0) {
            if (o === 0) return "";
            s = H.as_string(this.ai(0, 0));
            if (o !== this.gp(this)) throw H.wrap_expression(P.aK(this));
            for (r = s, q = 1; q < o; ++q) {
                r = r + b + H.as_string(this.ai(0, q));
                if (o !== this.gp(this)) throw H.wrap_expression(P.aK(this));
            }
            return r.charCodeAt(0) == 0 ? r : r;
        } else {
            for (q = 0, r = ""; q < o; ++q) {
                r += H.as_string(this.ai(0, q));
                if (o !== this.gp(this)) throw H.wrap_expression(P.aK(this));
            }
            return r.charCodeAt(0) == 0 ? r : r;
        }
    },
    f3(a) {
        return this.aV(a, "");
    },
    bV(a, b) {
        return this.dP(0, b);
    },
    fM(a, b) {
        return P.List_List_of(this, true, H._instanceType(this).i("M.E"));
    },
    fL(a) {
        return this.fM(a, true);
    },
};
H.cv.prototype = {
    gC() {
        return this.d;
    },
    u() {
        var s,
            q = this.a,
            p = J.a3(q),
            o = p.gp(q);
        if (this.b !== o) throw H.wrap_expression(P.aK(q));
        s = this.c;
        if (s >= o) {
            this.d = null;
            return false;
        }
        this.d = p.ai(q, s);
        ++this.c;
        return true;
    },
};
H.c6.prototype = {
    ga0(a) {
        return new H.fB(J.by(this.a), this.b);
    },
    gp(a) {
        return J.aw(this.a);
    },
};
H.dr.prototype = {
    $iA: 1,
};
H.fB.prototype = {
    u() {
        var r = this.b;
        if (r.u()) {
            this.a = this.c.$1(r.gC());
            return true;
        }
        this.a = null;
        return false;
    },
    gC() {
        return this.a;
    },
};
H.y.prototype = {
    gp(a) {
        return J.aw(this.a);
    },
    ai(a, b) {
        return this.b.$1(J.ru(this.a, b));
    },
};
H.cf.prototype = {
    ga0(a) {
        return new H.hX(J.by(this.a), this.b);
    },
};
H.hX.prototype = {
    u() {
        var s, r;
        for (s = this.a, r = this.b; s.u();) if (r.$1(s.gC())) return true;
        return false;
    },
    gC() {
        return this.a.gC();
    },
};
H.du.prototype = {
    sp(a, b) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot change the length of a fixed-length list"),
        );
    },
};
H.hV.prototype = {
    m(a, b, c) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot modify an unmodifiable list"),
        );
    },
    sp(a, b) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot change the length of an unmodifiable list"),
        );
    },
};
H.cJ.prototype = {};
H.a9.prototype = {
    gp(a) {
        return J.aw(this.a);
    },
    ai(a, b) {
        var s = this.a,
            r = J.a3(s);
        return r.ai(s, r.gp(s) - 1 - b);
    },
};
H.kh.prototype = {
    aH(a) {
        var s,
            r,
            p = new RegExp(this.a).exec(a);
        if (p == null) return null;
        s = Object.create(null);
        r = this.b;
        if (r !== -1) s.arguments = p[r + 1];
        r = this.c;
        if (r !== -1) s.argumentsExpr = p[r + 1];
        r = this.d;
        if (r !== -1) s.expr = p[r + 1];
        r = this.e;
        if (r !== -1) s.method = p[r + 1];
        r = this.f;
        if (r !== -1) s.receiver = p[r + 1];
        return s;
    },
};
H.NullError.prototype = {
    k(a) {
        var s = this.b;
        if (s == null) return "NoSuchMethodError: " + H.as_string(this.a);
        return "NoSuchMethodError: method not found: '" + s + "' on null";
    },
};
H.JsNoSuchMethodError.prototype = {
    k(a) {
        var s,
            q = "NoSuchMethodError: method not found: '",
            p = this.b;
        if (p == null) return "NoSuchMethodError: " + H.as_string(this.a);
        s = this.c;
        if (s == null) return q + p + "' (" + H.as_string(this.a) + ")";
        return q + p + "' on '" + s + "' (" + H.as_string(this.a) + ")";
    },
};
H.hU.prototype = {
    k(a) {
        var s = this.a;
        return s.length === 0 ? "Error" : "Error: " + s;
    },
};
H.NullThrownFromJavaScriptException.prototype = {
    k(a) {
        return (
            "Throw of null ('" +
            (this.a === null ? "null" : "undefined") +
            "' from JavaScript)"
        );
    },
};
H.ExceptionAndStackTrace.prototype = {};
H.eE.prototype = {
    k(a) {
        var s,
            r = this.b;
        if (r != null) return r;
        r = this.a;
        s = r !== null && typeof r === "object" ? r.stack : null;
        return (this.b = s == null ? "" : s);
    },
    $iba: 1,
};
H.c_.prototype = {
    k(a) {
        var s = this.constructor,
            r = s == null ? null : s.name;
        return "Closure '" + H.oP(r == null ? "unknown" : r) + "'";
    },
    gfR() {
        return this;
    },
    $C: "$1",
    $R: 1,
    $D: null,
};
H.j5.prototype = {
    $C: "$0",
    $R: 0,
};
H.j6.prototype = {
    $C: "$2",
    $R: 2,
};
H.TearOffClosure.prototype = {};
H.StaticClosure.prototype = {
    k(a) {
        var s = this.$static_name;
        if (s == null) return "Closure of unknown static method";
        return "Closure '" + H.oP(s) + "'";
    },
};
H.BoundClosure.prototype = {
    aW(a, b) {
        if (b == null) return false;
        if (this === b) return true;
        if (!(b instanceof H.BoundClosure)) return false;
        return this.$_target === b.$_target && this.a === b.a;
    },
    gak(a) {
        return (H.vd(this.a) ^ H.Primitives_objectHashCode(this.$_target)) >>> 0;
    },
    k(a) {
        return (
            "Closure '" +
            H.as_string(this.$_name) +
            "' of " +
            ("Instance of '" + H.as_string(H.jZ(this.a)) + "'")
        );
    },
};
H.RuntimeError.prototype = {
    k(a) {
        return "RuntimeError: " + this.a;
    },
};
H.JsLinkedHashMap.prototype = {
    gp(a) {
        return this.a;
    },
    gbv(a) {
        return this.a === 0;
    },
    gad(a) {
        return new H.dC(this, H._instanceType(this).i("dC<1>"));
    },
    gfP(a) {
        var r = H._instanceType(this);
        return H.t5(
            this.gad(this),
            new H.JsLinkedHashMap_values_closure(this),
            r.c,
            r.Q[1],
        );
    },
    J(a, b) {
        var s, r;
        if (typeof b == "string") {
            s = this.b;
            if (s == null) return false;
            return this.ei(s, b);
        } else {
            r = this.f_(b);
            return r;
        }
    },
    f_(a) {
        var r = this.d;
        if (r == null) return false;
        return this.bR(this.bG(r, this.bQ(a)), a) >= 0;
    },
    h(a, b) {
        var s,
            r,
            q,
            p,
            n = null;
        if (typeof b == "string") {
            s = this.b;
            if (s == null) return n;
            r = this.bp(s, b);
            q = r == null ? n : r.b;
            return q;
        } else if (typeof b == "number" && (b & 0x3ffffff) === b) {
            p = this.c;
            if (p == null) return n;
            r = this.bp(p, b);
            q = r == null ? n : r.b;
            return q;
        } else return this.f0(b);
    },
    f0(a) {
        var s,
            r,
            p = this.d;
        if (p == null) return null;
        s = this.bG(p, this.bQ(a));
        r = this.bR(s, a);
        if (r < 0) return null;
        return s[r].b;
    },
    m(a, b, c) {
        var s, r;
        if (typeof b == "string") {
            s = this.b;
            this.cQ(s == null ? (this.b = this._newHashTable()) : s, b, c);
        } else if (typeof b == "number" && (b & 0x3ffffff) === b) {
            r = this.c;
            this.cQ(r == null ? (this.c = this._newHashTable()) : r, b, c);
        } else this.f2(b, c);
    },
    f2(a, b) {
        var s,
            r,
            q,
            o = this.d;
        if (o == null) o = this.d = this._newHashTable();
        s = this.bQ(a);
        r = this.bG(o, s);
        if (r == null) this.cd(o, s, [this.c_(a, b)]);
        else {
            q = this.bR(r, a);
            if (q >= 0) r[q].b = b;
            else r.push(this.c_(a, b));
        }
    },
    U(a, b) {
        var s;
        if (typeof b == "string") return this.eu(this.b, b);
        else {
            s = this.f1(b);
            return s;
        }
    },
    f1(a) {
        var s,
            r,
            q,
            p,
            n = this.d;
        if (n == null) return null;
        s = this.bQ(a);
        r = this.bG(n, s);
        q = this.bR(r, a);
        if (q < 0) return null;
        p = r.splice(q, 1)[0];
        this.d9(p);
        if (r.length === 0) this.c4(n, s);
        return p.b;
    },
    ah(a) {
        if (this.a > 0) {
            this.b = this.c = this.d = this.e = this.f = null;
            this.a = 0;
            this.c9();
        }
    },
    aw(a, b) {
        var r = this.e,
            q = this.r;
        while (r != null) {
            // 频率输出 call
            b.$2(r.a, r.b);
            if (q !== this.r) {
                throw H.wrap_expression(P.aK(this));
            }
            r = r.c;
        }
    },
    cQ(a, b, c) {
        var s = this.bp(a, b);
        if (s == null) this.cd(a, b, this.c_(b, c));
        else s.b = c;
    },
    eu(a, b) {
        var s;
        if (a == null) return null;
        s = this.bp(a, b);
        if (s == null) return null;
        this.d9(s);
        this.c4(a, b);
        return s.b;
    },
    c9() {
        this.r = (this.r + 1) & 67108863;
    },
    c_(a, b) {
        var s,
            q = new H.jK(a, b);
        if (this.e == null) this.e = this.f = q;
        else {
            s = this.f;
            s.toString;
            q.d = s;
            this.f = s.c = q;
        }
        ++this.a;
        this.c9();
        return q;
    },
    d9(a) {
        var r = a.d,
            q = a.c;
        if (r == null) this.e = q;
        else r.c = q;
        if (q == null) this.f = r;
        else q.d = r;
        --this.a;
        this.c9();
    },
    bQ(a) {
        return J.lZ(a) & 0x3ffffff;
    },
    bR(a, b) {
        var s, r;
        if (a == null) return -1;
        s = a.length;
        for (r = 0; r < s; ++r) if (J.Y(a[r].a, b)) return r;
        return -1;
    },
    k(a) {
        return P.nR(this);
    },
    bp(a, b) {
        return a[b];
    },
    bG(a, b) {
        return a[b];
    },
    cd(a, b, c) {
        a[b] = c;
    },
    c4(a, b) {
        delete a[b];
    },
    ei(a, b) {
        return this.bp(a, b) != null;
    },
    _newHashTable() {
        var s = "<non-identifier-key>",
            r = Object.create(null);
        this.cd(r, s, r);
        this.c4(r, s);
        return r;
    },
};
H.JsLinkedHashMap_values_closure.prototype = {
    $1(a) {
        return this.a.h(0, a);
    },
    $S() {
        return H._instanceType(this.a).i("2(1)");
    },
};
H.jK.prototype = {};
H.dC.prototype = {
    gp(a) {
        return this.a.a;
    },
    ga0(a) {
        var s = this.a,
            r = new H.fA(s, s.r);
        r.c = s.e;
        return r;
    },
};
H.fA.prototype = {
    gC() {
        return this.d;
    },
    u() {
        var s,
            q = this.a;
        if (this.b !== q.r) throw H.wrap_expression(P.aK(q));
        s = this.c;
        if (s == null) {
            this.d = null;
            return false;
        } else {
            this.d = s.a;
            this.c = s.c;
            return true;
        }
    },
};
H.lv.prototype = {
    $1(a) {
        return this.a(a);
    },
    $S: 28,
};
H.lw.prototype = {
    $2(a, b) {
        return this.a(a, b);
    },
    $S: 48,
};
H.lx.prototype = {
    $1(a) {
        return this.a(a);
    },
    $S: 58,
};
H.JSSyntaxRegExp.prototype = {
    k(a) {
        return "RegExp/" + this.a + "/" + this.b.flags;
    },
    geq() {
        var r = this.c;
        if (r != null) return r;
        r = this.b;
        return (this.c = H.JSSyntaxRegExp_makeNative(
            this.a,
            r.multiline,
            !r.ignoreCase,
            r.unicode,
            r.dotAll,
            true,
        ));
    },
    gep() {
        var r = this.d;
        if (r != null) return r;
        r = this.b;
        return (this.d = H.JSSyntaxRegExp_makeNative(
            this.a + "|()",
            r.multiline,
            !r.ignoreCase,
            r.unicode,
            r.dotAll,
            true,
        ));
    },
    eU(a) {
        var s;
        if (typeof a != "string") H.throw_expression(H.R(a));
        s = this.b.exec(a);
        if (s == null) return null;
        return new H.ew(s);
    },
    bK(a, b, c) {
        var s = b.length;
        if (c > s) throw H.wrap_expression(P.a8(c, 0, s, null, null));
        return new H.hZ(this, b, c);
    },
    de(a, b) {
        return this.bK(a, b, 0);
    },
    d_(a, b) {
        var s,
            r = this.geq();
        r.lastIndex = b;
        s = r.exec(a);
        if (s == null) return null;
        return new H.ew(s);
    },
    $ifN: 1,
    $io0: 1,
};
H.ew.prototype = {
    gbc(a) {
        return this.b.index;
    },
    gbh() {
        var s = this.b;
        return s.index + s[0].length;
    },
    cF(a) {
        return this.b[a];
    },
    $ic7: 1,
};
H.hZ.prototype = {
    ga0(a) {
        return new H.kz(this.a, this.b, this.c);
    },
};
H.kz.prototype = {
    gC() {
        return this.d;
    },
    u() {
        var s,
            r,
            q,
            p,
            o,
            m = this.b;
        if (m == null) return false;
        s = this.c;
        r = m.length;
        if (s <= r) {
            q = this.a;
            p = q.d_(m, s);
            if (p != null) {
                this.d = p;
                o = p.gbh();
                if (p.b.index === o) {
                    if (q.b.unicode) {
                        s = this.c;
                        q = s + 1;
                        if (q < r) {
                            s = C.String.aQ(m, s);
                            if (s >= 55296 && s <= 56319) {
                                s = C.String.aQ(m, q);
                                s = s >= 56320 && s <= 57343;
                            } else s = false;
                        } else s = false;
                    } else s = false;
                    o = (s ? o + 1 : o) + 1;
                }
                this.c = o;
                return true;
            }
        }
        this.b = this.d = null;
        return false;
    },
};
H.bK.prototype = {
    gbh() {
        return this.a + this.c.length;
    },
    cF(a) {
        if (a !== 0) throw H.wrap_expression(P.k0(a, null));
        return this.c;
    },
    $ic7: 1,
    gbc(a) {
        return this.a;
    },
};
H.ip.prototype = {
    ga0(a) {
        return new H.l3(this.a, this.b, this.c);
    },
};
H.l3.prototype = {
    u() {
        var s,
            r,
            p = this.c,
            o = this.b,
            n = o.length,
            m = this.a,
            l = m.length;
        if (p + n > l) {
            this.d = null;
            return false;
        }
        s = m.indexOf(o, p);
        if (s < 0) {
            this.c = l + 1;
            this.d = null;
            return false;
        }
        r = s + n;
        this.d = new H.bK(s, o);
        this.c = r === this.c ? r + 1 : r;
        return true;
    },
    gC() {
        var s = this.d;
        s.toString;
        return s;
    },
};
H.dJ.prototype = {
    $idJ: 1,
};
H.ab.prototype = {
    $iab: 1,
};
H.NativeTypedArray.prototype = {
    gp(a) {
        return a.length;
    },
    $iag: 1,
};
H.NativeTypedArrayOfDouble.prototype = {
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
    m(a, b, c) {
        H._checkValidIndex(b, a, a.length);
        a[b] = c;
    },
    $iA: 1,
    $iw: 1,
};
H.NativeTypedArrayOfInt.prototype = {
    m(a, b, c) {
        H._checkValidIndex(b, a, a.length);
        a[b] = c;
    },
    $iA: 1,
    $iw: 1,
};
H.fE.prototype = {
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
};
H.fF.prototype = {
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
};
H.fG.prototype = {
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
};
H.fH.prototype = {
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
};
H.fI.prototype = {
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
};
H.dL.prototype = {
    gp(a) {
        return a.length;
    },
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
};
H.cx.prototype = {
    gp(a) {
        return a.length;
    },
    h(a, b) {
        H._checkValidIndex(b, a, a.length);
        return a[b];
    },
    $icx: 1,
};
H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin.prototype = {};
H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin_FixedLengthListMixin.prototype =
    {};
H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin.prototype = {};
H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin_FixedLengthListMixin.prototype =
    {};
H.Rti.prototype = {
    i(a) {
        return H._Universe_evalInEnvironment(init.typeUniverse, this, a);
    },
    aL(a) {
        return H._Universe_bind(init.typeUniverse, this, a);
    },
};
H.ib.prototype = {};
H.iu.prototype = {
    k(a) {
        return H._rtiToString(this.a, null);
    },
};
H.i9.prototype = {
    k(a) {
        return this.a;
    },
};
H.eI.prototype = {
    $ibc: 1,
};
P.kB.prototype = {
    $1(a) {
        var s = this.a,
            r = s.a;
        s.a = null;
        r.$0();
    },
    $S: 22,
};
P._AsyncRun__initializeScheduleImmediate_closure.prototype = {
    $1(callback) {
        var t1, t2;
        this.a.a = callback;
        t1 = this.b;
        t2 = this.c;
        t1.firstChild ? t1.removeChild(t2) : t1.appendChild(t2);
    },
    $S: 27,
};
P.kC.prototype = {
    $0() {
        this.a.$0();
    },
    $S: 18,
};
P.kD.prototype = {
    $0() {
        this.a.$0();
    },
    $S: 18,
};
P._TimerImpl.prototype = {
    e8(a, b) {
        if (run_env.from_code) {
            b.$0();
            // setTimeout(H.convert_dart_closure_to_js_md5(new P.kC(b), 0), 0)
            // setTimeout
        } else {
            if (self.setTimeout != null) {
                self.setTimeout(
                    H.convert_dart_closure_to_js_md5(
                        new P._TimerImpl_internalCallback(this, b),
                        0,
                    ),
                    0,
                );
                // b.$0() // 草,这下…… 6
            } else {
                throw H.wrap_expression(P.UnsupportError("`setTimeout()` not found."));
            }
        }
    },
};
P._TimerImpl_internalCallback.prototype = {
    $0() {
        this.b.$0();
    },
    $S: 0,
};
P.i_.prototype = {
    bM(a, b) {
        var s;
        if (!this.b) this.a.cS(b);
        else {
            s = this.a;
            if (this.$ti.i("bl<1>").b(b)) s.cW(b);
            else s.c2(b);
        }
    },
    cj(a, b) {
        var s;
        if (b == null) {
            b = P.AsyncError_defaultStackTrace(a);
        }
        s = this.a;
        if (this.b) s.be(a, b);
        else s.cT(a, b);
    },
};
P._awaitOnObject_closure.prototype = {
    $1(a) {
        return this.a.$2(0, a);
    },
    $S: 5,
};
P._awaitOnObject_closure0.prototype = {
    $2(a, b) {
        this.a.$2(1, new H.ExceptionAndStackTrace(a, b));
    },
    $S: 60,
};
P._wrapJsFunctionForAsync_closure.prototype = {
    $2(a, b) {
        this.a(a, b);
    },
    $S: 61,
};
P.f3.prototype = {
    k(a) {
        return H.as_string(this.a);
    },
    $iO: 1,
    gbz() {
        return this.b;
    },
};
P.jp.prototype = {
    $0() {
        this.b.cY(null);
    },
    $S: 0,
};
P.i4.prototype = {
    cj(a, b) {
        var s;
        H.ls(a, "error", t.K);
        s = this.a;
        if ((s.a & 30) !== 0)
            throw H.wrap_expression(P.cd("Future already completed"));
        if (b == null) b = P.AsyncError_defaultStackTrace(a);
        s.cT(a, b);
    },
    dg(a) {
        return this.cj(a, null);
    },
};
P.cg.prototype = {
    bM(a, b) {
        var s = this.a;
        if ((s.a & 30) !== 0)
            throw H.wrap_expression(P.cd("Future already completed"));
        s.cS(b);
    },
};
P._FutureListener.prototype = {
    f6(a) {
        if ((this.c & 15) !== 6) return true;
        return this.b.b.cv(this.d, a.a);
    },
    eZ(a) {
        var s,
            error_callback = this.e,
            q = null,
            t4 = this.b.b;
        if (t.C.b(error_callback)) q = t4.fC(error_callback, a.a, a.b);
        else q = t4.cv(error_callback, a.a);
        try {
            t4 = q;
            return t4;
        } catch (s) {
            if (t.eK.b(H.unwrap_Exception(s))) {
                if ((this.c & 1) !== 0)
                    throw H.wrap_expression(
                        P.bz(
                            "The error handler of Future.then must return a value of the returned future's type",
                            "onError",
                        ),
                    );
                throw H.wrap_expression(
                    P.bz(
                        "The error handler of Future.catchError must return a value of the future's type",
                        "onError",
                    ),
                );
            } else throw s;
        }
    },
};
P._Future.prototype = {
    cz(a, b, c) {
        var s,
            r,
            q = $.P;
        if (q === C.f) {
            if (b != null && !t.C.b(b) && !t.J.b(b))
                throw H.wrap_expression(P.da(b, "onError", u.c));
        } else if (b != null) b = P._registerErrorHandler(b, q);
        s = new P._Future(q, c.i("U<0>"));
        r = b == null ? 1 : 3;
        this.c0(
            new P._FutureListener(s, r, a, b, this.$ti.i("@<1>").aL(c).i("cN<1,2>")),
        );
        return s;
    },
    fI(a, b) {
        return this.cz(a, null, b);
    },
    d7(a, b, c) {
        var s = new P._Future($.P, c.i("U<0>"));
        this.c0(
            new P._FutureListener(s, 19, a, b, this.$ti.i("@<1>").aL(c).i("cN<1,2>")),
        );
        return s;
    },
    ex(a) {
        this.a = (this.a & 1) | 16;
        this.c = a;
    },
    c1(a) {
        this.a = (a.a & 30) | (this.a & 1);
        this.c = a.c;
    },
    c0(a) {
        var r = this.a;
        if (r <= 3) {
            a.a = this.c;
            this.c = a;
        } else {
            if ((r & 4) !== 0) {
                r = this.c;
                if ((r.a & 24) === 0) {
                    r.c0(a);
                    return;
                }
                this.c1(r);
            }
            P.cS(null, null, this.b, new P.kH(this, a));
        }
    },
    d3(a) {
        var s,
            r,
            q,
            p,
            o,
            m = {};
        m.a = a;
        if (a == null) return;
        s = this.a;
        if (s <= 3) {
            r = this.c;
            this.c = a;
            if (r != null) {
                q = a.a;
                for (p = a; q != null; p = q, q = o) o = q.a;
                p.a = r;
            }
        } else {
            if ((s & 4) !== 0) {
                s = this.c;
                if ((s.a & 24) === 0) {
                    s.d3(a);
                    return;
                }
                this.c1(s);
            }
            m.a = this.bJ(a);
            P.cS(null, null, this.b, new P.kO(m, this));
        }
    },
    bI() {
        var s = this.c;
        this.c = null;
        return this.bJ(s);
    },
    bJ(a) {
        var current, prev, next;
        for (
            current = a, prev = null;
            current != null;
            prev = current, current = next
        ) {
            next = current.a;
            current.a = prev;
        }
        return prev;
    },
    cV(a) {
        var s, r, q;
        this.a ^= 2;
        try {
            a.cz(new P.kK(this), new P.kL(this), t.P);
        } catch (q) {
            s = H.unwrap_Exception(q);
            r = H.getTraceFromException(q);
            P.scheduleMicrotask(new P.kM(this, s, r));
        }
    },
    // 动画帧调用?
    cY(a) {
        var r = this.bI();
        this.a = 8;
        this.c = a;
        P._Future__propagateToListeners(this, r);
    },
    c2(a) {
        var r = this.bI();
        this.a = 8;
        this.c = a;
        P._Future__propagateToListeners(this, r);
    },
    be(a, b) {
        var s = this.bI();
        this.ex(P.async_error(a, b));
        P._Future__propagateToListeners(this, s);
    },
    cS(a) {
        if (this.$ti.i("bl<1>").b(a)) {
            this.cW(a);
            return;
        }
        this.ed(a);
    },
    ed(a) {
        this.a ^= 2;
        P.cS(null, null, this.b, new P.kJ(this, a));
    },
    cW(a) {
        if (this.$ti.b(a)) {
            if ((a.a & 16) !== 0) {
                this.a ^= 2;
                P.cS(null, null, this.b, new P.kN(this, a));
            } else P._Future__chainCoreFuture(a, this);
            return;
        }
        this._chainForeignFuture(a);
    },
    cT(a, b) {
        this.a ^= 2;
        P.cS(null, null, this.b, new P.kI(this, a, b));
    },
    $ibl: 1,
};
P.kH.prototype = {
    $0() {
        P._Future__propagateToListeners(this.a, this.b);
    },
    $S: 0,
};
P.kO.prototype = {
    $0() {
        P._Future__propagateToListeners(this.b, this.a.a);
    },
    $S: 0,
};
P.kK.prototype = {
    $1(a) {
        var s,
            r,
            q,
            p = this.a;
        p.a ^= 2;
        try {
            p.c2(p.$ti.c.a(a));
        } catch (q) {
            s = H.unwrap_Exception(q);
            r = H.getTraceFromException(q);
            p.be(s, r);
        }
    },
    $S: 22,
};
P.kL.prototype = {
    $2(a, b) {
        this.a.be(a, b);
    },
    $S: 32,
};
P.kM.prototype = {
    $0() {
        this.a.be(this.b, this.c);
    },
    $S: 0,
};
P.kJ.prototype = {
    $0() {
        this.a.c2(this.b);
    },
    $S: 0,
};
P.kN.prototype = {
    $0() {
        P._Future__chainCoreFuture(this.b, this.a);
    },
    $S: 0,
};
P.kI.prototype = {
    $0() {
        this.a.be(this.b, this.c);
    },
    $S: 0,
};
P._Future__propagateToListeners_handleWhenCompleteCallback.prototype = {
    $0() {
        var s,
            r,
            q,
            p,
            o,
            n,
            l = null;
        try {
            q = this.a.a;
            l = q.b.b.fA(q.d);
        } catch (p) {
            s = H.unwrap_Exception(p);
            r = H.getTraceFromException(p);
            if (this.c) {
                q = this.b.a.c.a;
                o = s;
                o = q == null ? o == null : q === o;
                q = o;
            } else q = false;
            o = this.a;
            if (q) o.c = this.b.a.c;
            else o.c = P.async_error(s, r);
            o.b = true;
            return;
        }
        if (l instanceof P._Future && (l.a & 24) !== 0) {
            if ((l.a & 16) !== 0) {
                q = this.a;
                q.c = l.c;
                q.b = true;
            }
            return;
        }
        if (t.h.b(l)) {
            n = this.b.a;
            q = this.a;
            q.c = l.fI(
                new P._Future__propagateToListeners_handleWhenCompleteCallback_closure(
                    n,
                ),
                t.z,
            );
            q.b = false;
        }
    },
    $S: 0,
};
P._Future__propagateToListeners_handleWhenCompleteCallback_closure.prototype = {
    $1(a) {
        return this.a;
    },
    $S: 52,
};
P._Future__propagateToListeners_handleValueCallback.prototype = {
    $0() {
        var e, s, t1, t2, exception;
        try {
            t1 = this.a;
            t2 = t1.a;
            t1.c = t2.b.b.cv(t2.d, this.b);
        } catch (exception) {
            e = H.unwrap_Exception(exception);
            s = H.getTraceFromException(exception);
            t1 = this.a;
            t1.c = P.async_error(e, s);
            t1.b = true;
        }
    },
    $S: 0,
};
P._Future__propagateToListeners_handleError.prototype = {
    $0() {
        var s, r, q, p, o, n, m, l;
        try {
            s = this.a.a.c;
            p = this.b;
            if (p.a.f6(s) && p.a.e != null) {
                p.c = p.a.eZ(s);
                p.b = false;
            }
        } catch (o) {
            r = H.unwrap_Exception(o);
            q = H.getTraceFromException(o);
            p = this.a.a.c;
            n = p.a;
            m = r;
            l = this.b;
            if (n == null ? m == null : n === m) l.c = p;
            else l.c = P.async_error(r, q);
            l.b = true;
        }
    },
    $S: 0,
};
P.i0.prototype = {};
P.em.prototype = {
    gp(a) {
        var s = {},
            r = new P._Future($.P, t.fJ);
        s.a = 0;
        this.dn(new P.ke(s, this), true, new P.kf(s, r), r.geg());
        return r;
    },
};
P.ke.prototype = {
    $1(a) {
        ++this.a.a;
    },
    $S() {
        return H._instanceType(this.b).i("~(1)");
    },
};
P.kf.prototype = {
    $0() {
        this.b.cY(this.a.a);
    },
    $S: 0,
};
P.hO.prototype = {};
P.hP.prototype = {};
P.im.prototype = {
    ger() {
        if ((this.b & 8) === 0) return this.a;
        return this.a.gcC();
    },
    en() {
        var s;
        if ((this.b & 8) === 0) {
            s = this.a;
            return s == null ? (this.a = new P.eG()) : s;
        }
        s = this.a.gcC();
        return s;
    },
    geB() {
        var s = this.a;
        return (this.b & 8) !== 0 ? s.gcC() : s;
    },
    ee() {
        if ((this.b & 4) !== 0) return new P.bJ("Cannot add event after closing");
        return new P.bJ("Cannot add event while adding a stream");
    },
    eA(a, b, c, d) {
        var s, r, q, p, o;
        if ((this.b & 3) !== 0)
            throw H.wrap_expression(P.cd("Stream has already been listened to."));
        s = $.P;
        r = d ? 1 : 0;
        P.tS(s, b);
        q = new P.i5(this, a, s, r);
        p = this.ger();
        s = this.b |= 1;
        if ((s & 8) !== 0) {
            o = this.a;
            o.scC(q);
            o.fw();
        } else this.a = q;
        q.ey(p);
        s = q.e;
        q.e = s | 32;
        new P.l2(this).$0();
        q.e &= 4294967263;
        q.cX((s & 4) !== 0);
        return q;
    },
};
P.l2.prototype = {
    $0() {
        // do nothing
        P.mu(this.a.d);
    },
    $S: 0,
};
P.i1.prototype = {
    cc(a) {
        this.geB().ec(new P.er(a));
    },
};
P.cK.prototype = {};
P.cM.prototype = {
    gak(a) {
        return (H.Primitives_objectHashCode(this.a) ^ 892482866) >>> 0;
    },
    aW(a, b) {
        if (b == null) return false;
        if (this === b) return true;
        return b instanceof P.cM && b.a === this.a;
    },
};
P.i5.prototype = {
    d1() {
        var s = this.x;
        if ((s.b & 8) !== 0) s.a.fS(0);
        P.mu(s.e);
    },
    d2() {
        var s = this.x;
        if ((s.b & 8) !== 0) s.a.fw();
        P.mu(s.f);
    },
};
P.i3.prototype = {
    ey(a) {
        if (a == null) return;
        this.r = a;
        if (a.c != null) {
            this.e |= 64;
            a.bW(this);
        }
    },
    d1() { },
    d2() { },
    ec(a) {
        var s,
            q = this.r;
        if (q == null) q = new P.eG();
        this.r = q;
        q.j(0, a);
        s = this.e;
        if ((s & 64) === 0) {
            s |= 64;
            this.e = s;
            if (s < 128) q.bW(this);
        }
    },
    cc(a) {
        var r = this.e;
        this.e = r | 32;
        this.d.dC(this.a, a);
        this.e &= 4294967263;
        this.cX((r & 4) !== 0);
    },
    cX(a) {
        var s,
            r,
            p = this.e;
        if ((p & 64) !== 0 && this.r.c == null) {
            p = this.e = p & 4294967231;
            if ((p & 4) !== 0)
                if (p < 128) {
                    s = this.r;
                    s = s == null ? null : s.c == null;
                    s = s !== false;
                } else {
                    s = false;
                }
            else {
                s = false;
            }
            if (s) {
                p &= 4294967291;
                this.e = p;
            }
        }
        for (; true; a = r) {
            if ((p & 8) !== 0) {
                this.r = null;
                return;
            }
            r = (p & 4) !== 0;
            if (a === r) break;
            this.e = p ^ 32;
            if (r) this.d1();
            else this.d2();
            p = this.e &= 4294967263;
        }
        if ((p & 64) !== 0 && p < 128) {
            this.r.bW(this);
        }
    },
};
P.eF.prototype = {
    dn(a, b, c, d) {
        return this.a.eA(a, d, c, b === true);
    },
    f4(a) {
        return this.dn(a, null, null, null);
    },
};
P.i7.prototype = {};
P.er.prototype = {};
P.ii.prototype = {
    bW(a) {
        var r = this.a;
        if (r === 1) return;
        if (r >= 1) {
            this.a = 1;
            return;
        }
        P.scheduleMicrotask(new P.kW(this, a));
        this.a = 1;
    },
};
P.kW.prototype = {
    $0() {
        var s,
            r,
            q = this.a,
            p = q.a;
        q.a = 0;
        if (p === 3) return;
        s = q.b;
        r = s.a;
        q.b = r;
        if (r == null) q.c = null;
        this.b.cc(s.b);
    },
    $S: 0,
};
P.eG.prototype = {
    j(a, b) {
        var r = this.c;
        if (r == null) this.b = this.c = b;
        else this.c = r.a = b;
    },
};
P.io.prototype = {};
P.lf.prototype = {};
P.lo.prototype = {
    $0() {
        var s = H.wrap_expression(this.a);
        s.stack = J.b4(this.b);
        throw s;
    },
    $S: 0,
};
P._RootZone.prototype = {
    fE(a) {
        var s, r, q;
        try {
            if (C.f === $.P) {
                a.$0();
                return;
            }
            P.os(null, null, this, a);
        } catch (q) {
            s = H.unwrap_Exception(q);
            r = H.getTraceFromException(q);
            P._rootHandleUncaughtError(s, r);
        }
    },
    fG(a, b) {
        var s, r, q;
        try {
            if (C.f === $.P) {
                a.$1(b);
                return;
            }
            P._rootRun(null, null, this, a, b);
        } catch (q) {
            s = H.unwrap_Exception(q);
            r = H.getTraceFromException(q);
            P._rootHandleUncaughtError(s, r);
        }
    },
    dC(a, b) {
        return this.fG(a, b, t.z);
    },
    cf(a) {
        return new P.kY(this, a);
    },
    eI(a, b) {
        return new P._RootZone_bindCallback_closure(this, a, b);
    },
    fB(a) {
        if ($.P === C.f) return a.$0();
        return P.os(null, null, this, a);
    },
    fA(a) {
        return this.fB(a, t.z);
    },
    fF(a, b) {
        if ($.P === C.f) return a.$1(b);
        return P._rootRun(null, null, this, a, b);
    },
    cv(a, b) {
        return this.fF(a, b, t.z, t.z);
    },
    fD(a, b, c) {
        if ($.P === C.f) return a.$2(b, c);
        return P._rootRunUnary(null, null, this, a, b, c);
    },
    fC(a, b, c) {
        return this.fD(a, b, c, t.z, t.z, t.z);
    },
    fp(a) {
        return a;
    },
    ct(a) {
        return this.fp(a, t.z, t.z, t.z);
    },
};
P.kY.prototype = {
    $0() {
        return this.a.fE(this.b);
    },
    $S: 0,
};
P._RootZone_bindCallback_closure.prototype = {
    $1(a) {
        return this.a.dC(this.b, a);
    },
    $S() {
        return this.c.i("~(0)");
    },
};
P.eu.prototype = {
    ga0(a) {
        var s = new P.ie(this, this.r);
        s.c = this.e;
        return s;
    },
    gp(a) {
        return this.a;
    },
    w(a, b) {
        var s, r;
        if (typeof b == "string" && b !== "__proto__") {
            s = this.b;
            if (s == null) return false;
            return s[b] != null;
        } else if (typeof b == "number" && (b & 1073741823) === b) {
            r = this.c;
            if (r == null) return false;
            return r[b] != null;
        } else return this.eh(b);
    },
    eh(a) {
        var s = this.d;
        if (s == null) return false;
        return this.d0(s[this.cZ(a)], a) >= 0;
    },
    j(a, b) {
        var s, r;
        if (typeof b == "string" && b !== "__proto__") {
            s = this.b;
            return this.cR(s == null ? (this.b = P.ml()) : s, b);
        } else if (typeof b == "number" && (b & 1073741823) === b) {
            r = this.c;
            return this.cR(r == null ? (this.c = P.ml()) : r, b);
        } else return this.e9(b);
    },
    e9(a) {
        var s,
            r,
            p = this.d;
        if (p == null) p = this.d = P.ml();
        s = this.cZ(a);
        r = p[s];
        if (r == null) p[s] = [this.cb(a)];
        else {
            if (this.d0(r, a) >= 0) return false;
            r.push(this.cb(a));
        }
        return true;
    },
    cR(a, b) {
        if (a[b] != null) return false;
        a[b] = this.cb(b);
        return true;
    },
    ef() {
        this.r = (this.r + 1) & 1073741823;
    },
    cb(a) {
        var s,
            q = new P.kV(a);
        if (this.e == null) this.e = this.f = q;
        else {
            s = this.f;
            s.toString;
            q.c = s;
            this.f = s.b = q;
        }
        ++this.a;
        this.ef();
        return q;
    },
    cZ(a) {
        return J.lZ(a) & 1073741823;
    },
    d0(a, b) {
        var s, r;
        if (a == null) return -1;
        s = a.length;
        for (r = 0; r < s; ++r)
            // if (J.Y(a[r].a, b)) return r
            if (a[r].a === b) return r;
        return -1;
    },
};
P.kV.prototype = {};
P.ie.prototype = {
    gC() {
        return this.d;
    },
    u() {
        var r = this.c,
            q = this.a;
        if (this.b !== q.r) throw H.wrap_expression(P.aK(q));
        else if (r == null) {
            this.d = null;
            return false;
        } else {
            this.d = r.a;
            this.c = r.b;
            return true;
        }
    },
};
P.dy.prototype = {};
P.dE.prototype = {
    $iA: 1,
    $iw: 1,
};
P.z.prototype = {
    ga0(a) {
        return new H.cv(a, this.gp(a));
    },
    ai(a, b) {
        return this.h(a, b);
    },
    k(a) {
        return P.IterableBase_iterableToFullString(a, "[", "]");
    },
};
P.dG.prototype = {};
P.jM.prototype = {
    $2(a, b) {
        var s,
            r = this.a;
        if (!r.a) this.b.a += ", ";
        r.a = false;
        r = this.b;
        s = r.a += H.as_string(a);
        r.a = s + ": ";
        r.a += H.as_string(b);
    },
    $S: 51,
};
P.aU.prototype = {
    aw(a, b) {
        var s, r;
        for (s = J.by(this.gad(a)); s.u();) {
            r = s.gC();
            b.$2(r, this.h(a, r));
        }
    },
    gp(a) {
        return J.aw(this.gad(a));
    },
    k(a) {
        return P.nR(a);
    },
    $ibo: 1,
};
P.dY.prototype = {
    a5(a, b) {
        var s;
        for (s = J.by(b); s.u();) this.j(0, s.gC());
    },
    k(a) {
        return P.IterableBase_iterableToFullString(this, "{", "}");
    },
};
P.eC.prototype = {
    $iA: 1,
};
P.ev.prototype = {};
P.eM.prototype = {};
P.ic.prototype = {
    h(a, b) {
        var s,
            r = this.b;
        if (r == null) return this.c.h(0, b);
        else if (typeof b != "string") return null;
        else {
            s = r[b];
            return typeof s == "undefined" ? this.es(b) : s;
        }
    },
    gp(a) {
        var s;
        if (this.b == null) {
            s = this.c;
            s = s.gp(s);
        } else s = this.bF().length;
        return s;
    },
    gad(a) {
        var s;
        if (this.b == null) {
            s = this.c;
            return s.gad(s);
        }
        return new P.id(this);
    },
    aw(a, b) {
        var s, r, q, p;
        if (this.b == null) return this.c.aw(0, b);
        s = this.bF();
        for (r = 0; r < s.length; ++r) {
            q = s[r];
            p = this.b[q];
            if (typeof p == "undefined") {
                p = P.lk(this.a[q]);
                this.b[q] = p;
            }
            b.$2(q, p);
            if (s !== this.c) throw H.wrap_expression(P.aK(this));
        }
    },
    bF() {
        var s = this.c;
        if (s == null) s = this.c = H.b(Object.keys(this.a), t.s);
        return s;
    },
    es(a) {
        var s;
        if (!Object.prototype.hasOwnProperty.call(this.a, a)) return null;
        s = P.lk(this.a[a]);
        return (this.b[a] = s);
    },
};
P.id.prototype = {
    gp(a) {
        var s = this.a;
        return s.gp(s);
    },
    ai(a, b) {
        var s = this.a;
        return s.b == null ? s.gad(s).ai(0, b) : s.bF()[b];
    },
    ga0(a) {
        var s = this.a;
        if (s.b == null) {
            s = s.gad(s);
            s = s.ga0(s);
        } else {
            s = s.bF();
            s = new J.db(s, s.length);
        }
        return s;
    },
};
P.km.prototype = {
    $0() {
        var s, r;
        try {
            s = new TextDecoder("utf-8", {
                fatal: true,
            });
            return s;
        } catch (r) {
            H.unwrap_Exception(r);
        }
        return null;
    },
    $S: 11,
};
P.kl.prototype = {
    $0() {
        var s, r;
        try {
            s = new TextDecoder("utf-8", {
                fatal: false,
            });
            return s;
        } catch (r) {
            H.unwrap_Exception(r);
        }
        return null;
    },
    $S: 11,
};
P.fg.prototype = {};
P.fi.prototype = {};
P.jg.prototype = {};
P.js.prototype = {
    k(a) {
        return "unknown";
    },
};
P.jr.prototype = {
    ab(a) {
        var s = this.ej(a, 0, a.length);
        return s == null ? a : s;
    },
    ej(a, b, c) {
        var s, r, q, p;
        for (s = b, r = null; s < c; ++s) {
            switch (a[s]) {
                case "&":
                    q = "&amp;";
                    break;
                case '"':
                    q = "&quot;";
                    break;
                case "'":
                    q = "&#39;";
                    break;
                case "<":
                    q = "&lt;";
                    break;
                case ">":
                    q = "&gt;";
                    break;
                case "/":
                    q = "&#47;";
                    break;
                default:
                    q = null;
            }
            if (q != null) {
                if (r == null) r = new P.cH("");
                if (s > b) r.a += C.String.af(a, b, s);
                r.a += q;
                b = s + 1;
            }
        }
        if (r == null) return null;
        if (c > b) r.a += J.rA(a, b, c);
        p = r.a;
        return p.charCodeAt(0) == 0 ? p : p;
    },
};
P.jI.prototype = {
    bt(a, b) {
        var s = P.uy(b, this.geP().a);
        return s;
    },
    geP() {
        return C.L;
    },
};
P.jJ.prototype = {};
P.kj.prototype = {
    bt(a, b) {
        return C.T_kk.ab(b);
    },
    gaB() {
        return C.E;
    },
};
P.kn.prototype = {
    ab(a) {
        var s,
            r,
            q,
            p = P.cE(0, null, a.length),
            o = p - 0;
        if (o === 0) return new Uint8Array(0);
        s = o * 3;
        r = new Uint8Array(s);
        q = new P.lc(r);
        if (q.eo(a, 0, p) !== p) {
            J.ny(a, p - 1);
            q.ce();
        }
        return new Uint8Array(r.subarray(0, H.ug(0, q.b, s)));
    },
};
P.lc.prototype = {
    ce() {
        var r = this.c,
            q = this.b,
            p = (this.b = q + 1);
        r[q] = 239;
        q = this.b = p + 1;
        r[p] = 191;
        this.b = q + 1;
        r[q] = 189;
    },
    eD(a, b) {
        var s, r, q, p;
        if ((b & 64512) === 56320) {
            s = (65536 + ((a & 1023) << 10)) | (b & 1023);
            r = this.c;
            q = this.b;
            p = this.b = q + 1;
            r[q] = (s >>> 18) | 240;
            q = this.b = p + 1;
            r[p] = ((s >>> 12) & 63) | 128;
            p = this.b = q + 1;
            r[q] = ((s >>> 6) & 63) | 128;
            this.b = p + 1;
            r[p] = (s & 63) | 128;
            return true;
        } else {
            this.ce();
            return false;
        }
    },
    eo(a, b, c) {
        var s, r, q, p, o, n, m;
        if (b !== c && (C.String.aQ(a, c - 1) & 64512) === 55296) --c;
        for (s = this.c, r = s.length, q = b; q < c; ++q) {
            p = C.String.a8(a, q);
            if (p <= 127) {
                o = this.b;
                if (o >= r) break;
                this.b = o + 1;
                s[o] = p;
            } else {
                o = p & 64512;
                if (o === 55296) {
                    if (this.b + 4 > r) break;
                    n = q + 1;
                    if (this.eD(p, C.String.a8(a, n))) q = n;
                } else if (o === 56320) {
                    if (this.b + 3 > r) break;
                    this.ce();
                } else if (p <= 2047) {
                    o = this.b;
                    m = o + 1;
                    if (m >= r) break;
                    this.b = m;
                    s[o] = (p >>> 6) | 192;
                    this.b = m + 1;
                    s[m] = (p & 63) | 128;
                } else {
                    o = this.b;
                    if (o + 2 >= r) break;
                    m = this.b = o + 1;
                    s[o] = (p >>> 12) | 224;
                    o = this.b = m + 1;
                    s[m] = ((p >>> 6) & 63) | 128;
                    this.b = o + 1;
                    s[o] = (p & 63) | 128;
                }
            }
        }
        return q;
    },
};
P.kk.prototype = {
    ab(a) {
        var s = this.a,
            r = P.tL(s, a, 0, null);
        if (r != null) return r;
        return new P.lb(s).eK(a, 0, null, true);
    },
};
P.lb.prototype = {
    eK(a, b, c, d) {
        var s,
            r,
            q,
            p,
            n = P.cE(b, c, a.length);
        if (b === n) return "";
        s = P.ub(a, b, n);
        r = this.c3(s, 0, n - b, true);
        q = this.b;
        if ((q & 1) !== 0) {
            p = P.uc(q);
            this.b = 0;
            throw H.wrap_expression(P.FormatException(p, a, b + this.c));
        }
        return r;
    },
    c3(a, b, c, d) {
        var s, r;
        if (c - b > 1000) {
            s = C.JsInt.ag(b + c, 2);
            r = this.c3(a, b, s, false);
            if ((this.b & 1) !== 0) return r;
            return r + this.c3(a, s, c, d);
        }
        return this.eO(a, b, c, d);
    },
    eO(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = 65533,
            j = this.b,
            i = this.c,
            str_holder = new P.cH(""),
            g = b + 1,
            f = a[b];
        $label0$0: for (s = this.a; true;) {
            for (; true; g = p) {
                r =
                    C.String.a8(
                        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFFFFFFFFFFFFFFFFGGGGGGGGGGGGGGGGHHHHHHHHHHHHHHHHHHHHHHHHHHHIHHHJEEBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBKCCCCCCCCCCCCDCLONNNMEEEEEEEEEEE",
                        f,
                    ) & 31;
                i = j <= 32 ? f & (61694 >>> r) : ((f & 63) | (i << 6)) >>> 0;
                j = C.String.a8(
                    " \x000:XECCCCCN:lDb \x000:XECCCCCNvlDb \x000:XECCCCCN:lDb AAAAA\x00\x00\x00\x00\x00AAAAA00000AAAAA:::::AAAAAGG000AAAAA00KKKAAAAAG::::AAAAA:IIIIAAAAA000\x800AAAAA\x00\x00\x00\x00 AAAAA",
                    j + r,
                );
                if (j === 0) {
                    str_holder.a += H.char_code_to_char(i);
                    if (g === c) break $label0$0;
                    break;
                } else if ((j & 1) !== 0) {
                    if (s)
                        switch (j) {
                            case 69:
                            case 67:
                                str_holder.a += H.char_code_to_char(k);
                                break;
                            case 65:
                                str_holder.a += H.char_code_to_char(k);
                                --g;
                                break;
                            default:
                                q = str_holder.a += H.char_code_to_char(k);
                                str_holder.a = q + H.char_code_to_char(k);
                                break;
                        }
                    else {
                        this.b = j;
                        this.c = g - 1;
                        return "";
                    }
                    j = 0;
                }
                if (g === c) break $label0$0;
                p = g + 1;
                f = a[g];
            }
            p = g + 1;
            f = a[g];
            if (f < 128) {
                while (true) {
                    if (!(p < c)) {
                        o = c;
                        break;
                    }
                    n = p + 1;
                    f = a[p];
                    if (f >= 128) {
                        o = n - 1;
                        p = n;
                        break;
                    }
                    p = n;
                }
                if (o - g < 20)
                    for (m = g; m < o; ++m) str_holder.a += H.char_code_to_char(a[m]);
                else str_holder.a += P.mh(a, g, o);
                if (o === c) break;
                g = p;
            } else g = p;
        }
        if (d && j > 32)
            if (s) str_holder.a += H.char_code_to_char(k);
            else {
                this.b = 77;
                this.c = c;
                return "";
            }
        this.b = j;
        this.c = i;
        s = str_holder.a;
        // return s.charCodeAt(0) == 0 ? s : s
        // console.log("P.lb" + s)
        return s;
    },
};
P.dq.prototype = {
    aW(a, b) {
        if (b == null) return false;
        return b instanceof P.dq && this.a === b.a && this.b === b.b;
    },
    bg(a, b) {
        return C.JsInt.bg(this.a, b.a);
    },
    gak(a) {
        var s = this.a;
        return (s ^ C.JsInt.am(s, 30)) & 1073741823;
    },
    k(a) {
        var r = P.rN(H.tj(this)),
            q = P.fk(H.th(this)),
            p = P.fk(H.td(this)),
            o = P.fk(H.te(this)),
            n = P.fk(H.tg(this)),
            m = P.fk(H.ti(this)),
            l = P.rO(H.tf(this));
        if (this.b)
            return (
                r + "-" + q + "-" + p + " " + o + ":" + n + ":" + m + "." + l + "Z"
            );
        else return r + "-" + q + "-" + p + " " + o + ":" + n + ":" + m + "." + l;
    },
};
P.Duration.prototype = {
    aW(a, b) {
        if (b == null) return false;
        return b instanceof P.Duration && this.a === b.a;
    },
    gak(a) {
        return C.JsInt.gak(this.a);
    },
    bg(a, b) {
        return C.JsInt.bg(this.a, b.a);
    },
    k(a) {
        var s,
            r,
            q,
            p = new P.Duration_toString_twoDigits(),
            o = this.a;
        if (o < 0) return "-" + new P.Duration(0 - o).k(0);
        s = p.$1(C.JsInt.ag(o, 6e7) % 60);
        r = p.$1(C.JsInt.ag(o, 1e6) % 60);
        q = new P.Duration_toString_sixDigits().$1(o % 1e6);
        return (
            "" +
            C.JsInt.ag(o, 36e8) +
            ":" +
            H.as_string(s) +
            ":" +
            H.as_string(r) +
            "." +
            H.as_string(q)
        );
    },
};
P.Duration_toString_sixDigits.prototype = {
    $1(a) {
        if (a >= 1e5) return "" + a;
        if (a >= 1e4) return "0" + a;
        if (a >= 1000) return "00" + a;
        if (a >= 100) return "000" + a;
        if (a >= 10) return "0000" + a;
        return "00000" + a;
    },
    $S: 12,
};
P.Duration_toString_twoDigits.prototype = {
    $1(a) {
        if (a >= 10) return "" + a;
        return "0" + a;
    },
    $S: 12,
};
P.O.prototype = {
    gbz() {
        return H.getTraceFromException(this.$thrownJsError);
    },
};
P.f2.prototype = {
    k(a) {
        var s = this.a;
        if (s != null) return "Assertion failed: " + P.jh(s);
        return "Assertion failed";
    },
};
P.bc.prototype = {};
P.fL.prototype = {
    k(a) {
        return "Throw of null.";
    },
};
P.aS.prototype = {
    gc7() {
        return "Invalid argument" + (!this.a ? "(s)" : "");
    },
    gc6() {
        return "";
    },
    k(a) {
        var s,
            r,
            p = this.c,
            o = p == null ? "" : " (" + p + ")",
            n = this.d,
            m = n == null ? "" : ": " + n,
            l = this.gc7() + o + m;
        if (!this.a) return l;
        s = this.gc6();
        r = P.jh(this.b);
        return l + s + ": " + r;
    },
};
P.cD.prototype = {
    gc7() {
        return "RangeError";
    },
    gc6() {
        var s,
            r = this.e,
            q = this.f;
        if (r == null)
            s = q != null ? ": Not less than or equal to " + H.as_string(q) : "";
        else if (q == null) s = ": Not greater than or equal to " + H.as_string(r);
        else if (q > r)
            s = ": Not in inclusive range " + H.as_string(r) + ".." + H.as_string(q);
        else
            s =
                q < r
                    ? ": Valid value range is empty"
                    : ": Only valid value is " + H.as_string(r);
        return s;
    },
};
P.fs.prototype = {
    gc7() {
        return "RangeError";
    },
    gc6() {
        if (this.b < 0) return ": index must not be negative";
        var s = this.f;
        if (s === 0) return ": no indices are valid";
        return ": index should be less than " + H.as_string(s);
    },
    gp(a) {
        return this.f;
    },
};
P.hW.prototype = {
    k(a) {
        return "Unsupported operation: " + this.a;
    },
};
P.hS.prototype = {
    k(a) {
        var s = this.a;
        return s != null ? "UnimplementedError: " + s : "UnimplementedError";
    },
};
P.bJ.prototype = {
    k(a) {
        return "Bad state: " + this.a;
    },
};
P.fh.prototype = {
    k(a) {
        var s = this.a;
        if (s == null) return "Concurrent modification during iteration.";
        return "Concurrent modification during iteration: " + P.jh(s) + ".";
    },
};
P.fM.prototype = {
    k(a) {
        return "Out of Memory";
    },
    gbz() {
        return null;
    },
    $iO: 1,
};
P.el.prototype = {
    k(a) {
        return "Stack Overflow";
    },
    gbz() {
        return null;
    },
    $iO: 1,
};
P.CyclicInitializationError.prototype = {
    k(a) {
        var s = this.a;
        return s == null
            ? "Reading static variable during its initialization"
            : "Reading static variable '" + s + "' during its initialization";
    },
};
P.kG.prototype = {
    k(a) {
        return "Exception: " + this.a;
    },
};
P.jm.prototype = {
    k(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g = this.a,
            f =
                g != null && "" !== g
                    ? "FormatException: " + H.as_string(g)
                    : "FormatException",
            e = this.c,
            d = this.b;
        if (typeof d == "string") {
            if (e != null) s = e < 0 || e > d.length;
            else s = false;
            if (s) e = null;
            if (e == null) {
                if (d.length > 78) d = C.String.af(d, 0, 75) + "...";
                return f + "\n" + d;
            }
            for (r = 1, q = 0, p = false, o = 0; o < e; ++o) {
                n = C.String.a8(d, o);
                if (n === 10) {
                    if (q !== o || !p) ++r;
                    q = o + 1;
                    p = false;
                } else if (n === 13) {
                    ++r;
                    q = o + 1;
                    p = true;
                }
            }
            f =
                r > 1
                    ? f + (" (at line " + r + ", character " + (e - q + 1) + ")\n")
                    : f + (" (at character " + (e + 1) + ")\n");
            m = d.length;
            for (o = e; o < m; ++o) {
                n = C.String.aQ(d, o);
                if (n === 10 || n === 13) {
                    m = o;
                    break;
                }
            }
            if (m - q > 78)
                if (e - q < 75) {
                    l = q + 75;
                    k = q;
                    j = "";
                    i = "...";
                } else {
                    if (m - e < 75) {
                        k = m - 75;
                        l = m;
                        i = "";
                    } else {
                        k = e - 36;
                        l = e + 36;
                        i = "...";
                    }
                    j = "...";
                }
            else {
                l = m;
                k = q;
                j = "";
                i = "";
            }
            h = C.String.af(d, k, l);
            return f + j + h + i + "\n" + C.String.cG(" ", e - k + j.length) + "^\n";
        } else return e != null ? f + (" (at offset " + H.as_string(e) + ")") : f;
    },
};
P.L.prototype = {
    bV(a, b) {
        return new H.cf(this, b, H._instanceType(this).i("cf<L.E>"));
    },
    gp(a) {
        var s,
            r = this.ga0(this);
        for (s = 0; r.u();) ++s;
        return s;
    },
    gbv(a) {
        return !this.ga0(this).u();
    },
    gba(a) {
        var s,
            r = this.ga0(this);
        if (!r.u()) throw H.wrap_expression(H.fu());
        s = r.gC();
        if (r.u()) throw H.wrap_expression(H.rY());
        return s;
    },
    ai(a, b) {
        var s, r, q;
        P.to(b, "index");
        for (s = this.ga0(this), r = 0; s.u();) {
            q = s.gC();
            if (b === r) return q;
            ++r;
        }
        throw H.wrap_expression(P.ft(b, this, "index", null, r));
    },
    k(a) {
        return P.rX(this, "(", ")");
    },
};
P.fv.prototype = {};
P.N.prototype = {
    gak(a) {
        return P.Object.prototype.gak.call(this, this);
    },
    k(a) {
        return "null";
    },
};
P.Object.prototype = {
    $iH: 1,
    aW(a, b) {
        return this === b;
    },
    gak(a) {
        return H.Primitives_objectHashCode(this);
    },
    k(a) {
        return "Instance of '" + H.as_string(H.jZ(this)) + "'";
    },
    gcw(a) {
        var s = this instanceof H.c_ ? H.closureFunctionType(this) : null;
        return H.mz(s == null ? H.instanceType(this) : s);
    },
    toString() {
        return this.k(this);
    },
};
P.iq.prototype = {
    k(a) {
        return "";
    },
    $iba: 1,
};
P.cH.prototype = {
    gp(a) {
        return this.a.length;
    },
    k(a) {
        var s = this.a;
        return s.charCodeAt(0) == 0 ? s : s;
    },
};
W.HtmlElement.prototype = {};
W.AnchorElement.prototype = {
    k(a) {
        return String(a);
    },
};
W.AreaElement.prototype = {
    k(a) {
        return String(a);
    },
};
W.BaseElement.prototype = {
    $icn: 1,
};
W.Blob.prototype = {
    $ibX: 1,
};
W.BodyElement.prototype = {
    $ibY: 1,
};
W.CanvasElement.prototype = {
    geJ(a) {
        return a.getContext("2d");
    },
};
W.CanvasRenderingContext2D.prototype = {
    eN(a, b, c) {
        var s = P.my(a.createImageData(b, c));
        return s;
    },
    eR(a, b, c, d, e) {
        return a.fillRect(b, c, d, e);
    },
    dw(a, b, c, d) {
        a.putImageData(P.uO(b), c, d);
        return;
    },
    fv(a) {
        return a.resetTransform();
    },
    fO(a, b, c, d, e, f, g) {
        return a.transform(b, c, d, e, f, g);
    },
    eQ(a, b, c, d) {
        return a.drawImage(b, c, d);
    },
};
W.b6.prototype = {
    gp(a) {
        return a.length;
    },
};
W.co.prototype = {
    cU(a, b) {
        var s = $.oQ(),
            r = s[b];
        if (typeof r == "string") return r;
        r = this.eC(a, b);
        s[b] = r;
        return r;
    },
    eC(a, b) {
        var s;
        if (
            b
                .replace(/^-ms-/, "ms-")
                .replace(/-([\da-z])/gi, (c, d) => d.toUpperCase()) in a
        )
            return b;
        s = $.oT() + b;
        if (s in a) return s;
        return b;
    },
    d4(a, b, c, d) {
        a.setProperty(b, c, d);
    },
    gp(a) {
        return a.length;
    },
};
W.j8.prototype = {};
W.dm.prototype = {
    $idm: 1,
};
W.c0.prototype = {
    $ic0: 1,
};
W.ja.prototype = {
    k(a) {
        return String(a);
    },
};
W.jb.prototype = {
    gp(a) {
        return a.length;
    },
};
W.Element.prototype = {
    geH(a) {
        return new W.i8(a);
    },
    k(a) {
        return a.localName;
    },
    bk(a, b, c, d, e) {
        var s,
            r = this.aA(a, c, d, e);
        switch (b.toLowerCase()) {
            case "beforebegin":
                a.parentNode.insertBefore(r, a);
                break;
            case "afterbegin":
                s = a.childNodes;
                a.insertBefore(r, s.length > 0 ? s[0] : null);
                break;
            case "beforeend":
                a.appendChild(r);
                break;
            case "afterend":
                s = a.parentNode;
                s.toString;
                s.insertBefore(r, a.nextSibling);
                break;
            default:
                H.throw_expression(P.bz("Invalid position " + b, null));
        }
    },
    aA(a, b, c, d) {
        var s, r, q, p;
        if (c == null) {
            if (d == null) {
                s = $.nJ;
                if (s == null) {
                    s = H.b([], t.x);
                    r = new W.dN(s);
                    s.push(W.oc(null));
                    s.push(W.oh());
                    $.nJ = r;
                    d = r;
                } else d = s;
            }
            s = $.nI;
            if (s == null) {
                s = new W.ix(d);
                $.nI = s;
                c = s;
            } else {
                s.a = d;
                c = s;
            }
        } else if (d != null)
            throw H.wrap_expression(
                P.bz("validator can only be passed if treeSanitizer is null", null),
            );
        if ($.bA == null) {
            s = document;
            r = s.implementation.createHTMLDocument("");
            $.bA = r;
            $.m4 = r.createRange();
            r = $.bA.createElement("base");
            t.cR.a(r);
            s = s.baseURI;
            s.toString;
            r.href = s;
            $.bA.head.appendChild(r);
        }
        s = $.bA;
        if (s.body == null) {
            r = s.createElement("body");
            s.body = t.b.a(r);
        }
        s = $.bA;
        if (t.b.b(a)) {
            s = s.body;
            s.toString;
            q = s;
        } else {
            s.toString;
            q = s.createElement(a.tagName);
            $.bA.body.appendChild(q);
        }
        if (
            "createContextualFragment" in window.Range.prototype &&
            !C.Array.w(C.O, a.tagName)
        ) {
            $.m4.selectNodeContents(q);
            s = $.m4;
            s.toString;
            p = s.createContextualFragment(b == null ? "null" : b);
        } else {
            q.innerHTML = b;
            p = $.bA.createDocumentFragment();
            while (((s = q.firstChild), s != null)) p.appendChild(s);
        }
        if (q !== $.bA.body) J.nA(q);
        c.cH(p);
        document.adoptNode(p);
        return p;
    },
    eM(a, b, c) {
        return this.aA(a, b, c, null);
    },
    by(a, b, c) {
        a.textContent = null;
        a.appendChild(this.aA(a, b, null, c));
    },
    cJ(a, b) {
        return this.by(a, b, null);
    },
    gdD(a) {
        return a.tagName;
    },
    $iQ: 1,
};
W.jf.prototype = {
    $1(a) {
        return t.R.b(a);
    },
    $S: 47,
};
W.o.prototype = {
    $io: 1,
};
W.fn.prototype = {
    eF(receiver, type, listener, options) {
        if (listener != null) {
            this.add_event_listener(receiver, type, listener, false);
        }
    },
    add_event_listener(receiver, type, listener, options) {
        // console.log("md5.js add event listener type:", type, "receiver:", receiver, "listener:", listener, options)
        // console.log("receiver == window", receiver == window)
        // var stack = new Error().stack
        // console.log(stack)
        receiver.addEventListener(
            type,
            H.convert_dart_closure_to_js_md5(listener, 1),
            false,
        );
        // return receiver.addEventListener(type, listener, false)
    },
};
W.File.prototype = {
    $icq: 1,
};
W.fp.prototype = {
    gp(a) {
        return a.length;
    },
};
W.c4.prototype = {
    gck(a) {
        return a.data;
    },
    $ic4: 1,
};
W.jL.prototype = {
    k(a) {
        return String(a);
    },
};
W.c8.prototype = {
    $ic8: 1,
};
W.dH.prototype = {
    $idH: 1,
};
W.bp.prototype = {
    $ibp: 1,
};
W.az.prototype = {
    gba(a) {
        var s = this.a,
            r = s.childNodes.length;
        if (r === 0) throw H.wrap_expression(P.cd("No elements"));
        if (r > 1) throw H.wrap_expression(P.cd("More than one element"));
        s = s.firstChild;
        s.toString;
        return s;
    },
    a5(a, b) {
        var s,
            r,
            q,
            p = b.a,
            o = this.a;
        if (p !== o)
            for (s = p.childNodes.length, r = 0; r < s; ++r) {
                q = p.firstChild;
                q.toString;
                o.appendChild(q);
            }
        return;
    },
    m(a, b, c) {
        var s = this.a;
        s.replaceChild(c, s.childNodes[b]);
    },
    ga0(a) {
        var s = this.a.childNodes;
        return new W.dv(s, s.length);
    },
    gp(a) {
        return this.a.childNodes.length;
    },
    sp(a, b) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot set length on immutable List."),
        );
    },
    h(a, b) {
        return this.a.childNodes[b];
    },
};
W.v.prototype = {
    fq(a) {
        var s = a.parentNode;
        if (s != null) s.removeChild(a);
    },
    k(a) {
        var s = a.nodeValue;
        return s == null ? this.dO(a) : s;
    },
    $iv: 1,
};
W.dM.prototype = {
    gp(a) {
        return a.length;
    },
    h(a, b) {
        if (b >>> 0 !== b || b >= a.length)
            throw H.wrap_expression(P.ft(b, a, null, null, null));
        return a[b];
    },
    m(a, b, c) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot assign element of immutable List."),
        );
    },
    sp(a, b) {
        throw H.wrap_expression(P.UnsupportError("Cannot resize immutable List."));
    },
    ai(a, b) {
        return a[b];
    },
    $iA: 1,
    $iag: 1,
    $iw: 1,
};
W.dQ.prototype = {};
W.h4.prototype = {
    gp(a) {
        return a.length;
    },
};
W.ek.prototype = {};
W.hN.prototype = {
    h(a, b) {
        return a.getItem(H.lg(b));
    },
    aw(a, b) {
        var s, r, q;
        for (s = 0; true; ++s) {
            r = a.key(s);
            if (r == null) return;
            q = a.getItem(r);
            q.toString;
            b.$2(r, q);
        }
    },
    gad(a) {
        var s = H.b([], t.s);
        this.aw(a, new W.kd(s));
        return s;
    },
    gp(a) {
        return a.length;
    },
    $ibo: 1,
};
W.kd.prototype = {
    $2(a, b) {
        return this.a.push(a);
    },
    $S: 41,
};
W.bb.prototype = {
    $ibb: 1,
};
W.ce.prototype = {};
W.en.prototype = {
    aA(a, b, c, d) {
        var s, r;
        if ("createContextualFragment" in window.Range.prototype)
            return this.bY(a, b, c, d);
        s = W.rP("<table>" + H.as_string(b) + "</table>", c, d);
        r = document.createDocumentFragment();
        r.toString;
        s.toString;
        new W.az(r).a5(0, new W.az(s));
        return r;
    },
};
W.hQ.prototype = {
    aA(a, b, c, d) {
        var s, r, q, p;
        if ("createContextualFragment" in window.Range.prototype)
            return this.bY(a, b, c, d);
        s = document;
        r = s.createDocumentFragment();
        s = C.u.aA(s.createElement("table"), b, c, d);
        s.toString;
        s = new W.az(s);
        q = s.gba(s);
        q.toString;
        s = new W.az(q);
        p = s.gba(s);
        r.toString;
        p.toString;
        new W.az(r).a5(0, new W.az(p));
        return r;
    },
};
W.hR.prototype = {
    aA(a, b, c, d) {
        var s, r, q;
        if ("createContextualFragment" in window.Range.prototype)
            return this.bY(a, b, c, d);
        s = document;
        r = s.createDocumentFragment();
        s = C.u.aA(s.createElement("table"), b, c, d);
        s.toString;
        s = new W.az(s);
        q = s.gba(s);
        r.toString;
        q.toString;
        new W.az(r).a5(0, new W.az(q));
        return r;
    },
};
W.cI.prototype = {
    $icI: 1,
};
W.aY.prototype = {};
W.eq.prototype = {
    fg(a, b, c) {
        var s = W.oa(a.open(b, c));
        return s;
    },
    dt(a, b, c) {
        a.postMessage(new P._StructuredCloneDart2Js([], []).aO(b), c);
        return;
    },
};
W.cL.prototype = {
    $icL: 1,
};
W.ex.prototype = {
    gp(a) {
        return a.length;
    },
    h(a, b) {
        if (b >>> 0 !== b || b >= a.length)
            throw H.wrap_expression(P.ft(b, a, null, null, null));
        return a[b];
    },
    m(a, b, c) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot assign element of immutable List."),
        );
    },
    sp(a, b) {
        throw H.wrap_expression(P.UnsupportError("Cannot resize immutable List."));
    },
    ai(a, b) {
        return a[b];
    },
    $iA: 1,
    $iag: 1,
    $iw: 1,
};
W.eH.prototype = {
    gp(a) {
        return a.length;
    },
    h(a, b) {
        if (b >>> 0 !== b || b >= a.length)
            throw H.wrap_expression(P.ft(b, a, null, null, null));
        return a[b];
    },
    m(a, b, c) {
        throw H.wrap_expression(
            P.UnsupportError("Cannot assign element of immutable List."),
        );
    },
    sp(a, b) {
        throw H.wrap_expression(P.UnsupportError("Cannot resize immutable List."));
    },
    gbl(a) {
        var s = a.length;
        if (s > 0) return a[s - 1];
        throw H.wrap_expression(P.cd("No elements"));
    },
    ai(a, b) {
        return a[b];
    },
    $iA: 1,
    $iag: 1,
    $iw: 1,
};
W.i2.prototype = {
    aw(a, b) {
        var s, r, q, p, o;
        for (
            s = this.gad(this), r = s.length, q = this.a, p = 0;
            p < s.length;
            s.length === r || (0, H.F)(s), ++p
        ) {
            o = s[p];
            b.$2(o, q.getAttribute(o));
        }
    },
    gad(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = this.a.attributes;
        m.toString;
        s = H.b([], t.s);
        for (r = m.length, q = t.h9, p = 0; p < r; ++p) {
            o = q.a(m[p]);
            if (o.namespaceURI == null) {
                n = o.name;
                n.toString;
                s.push(n);
            }
        }
        return s;
    },
};
W.i8.prototype = {
    h(a, b) {
        return this.a.getAttribute(H.lg(b));
    },
    gp(a) {
        return this.gad(this).length;
    },
};
W.m5.prototype = {};
W.ia.prototype = {};
W.kF.prototype = {
    $1(a) {
        return this.a.$1(a);
    },
    $S: 39,
};
W.cP.prototype = {
    e6(a) {
        var s;
        if ($.et.gbv($.et)) {
            for (s = 0; s < 262; ++s) $.et.m(0, C.M[s], W.uV());
            for (s = 0; s < 12; ++s) $.et.m(0, C.l[s], W.uW());
        }
    },
    b_(a) {
        return $.rl().w(0, W.ds(a));
    },
    aM(a, b, c) {
        var s = $.et.h(0, H.as_string(W.ds(a)) + "::" + b);
        if (s == null) s = $.et.h(0, "*::" + b);
        if (s == null) return false;
        return s.$4(a, b, c, this);
    },
    $iaN: 1,
};
W.cr.prototype = {
    ga0(a) {
        return new W.dv(a, this.gp(a));
    },
};
W.dN.prototype = {
    b_(a) {
        return C.Array.df(this.a, new W.jP(a));
    },
    aM(a, b, c) {
        return C.Array.df(this.a, new W.jO(a, b, c));
    },
    $iaN: 1,
};
W.jP.prototype = {
    $1(a) {
        return a.b_(this.a);
    },
    $S: 13,
};
W.jO.prototype = {
    $1(a) {
        return a.aM(this.a, this.b, this.c);
    },
    $S: 13,
};
W.eD.prototype = {
    e7(a, b, c, d) {
        var s, r, q;
        this.a.a5(0, c);
        s = b.bV(0, new W.l0());
        r = b.bV(0, new W.l1());
        this.b.a5(0, s);
        q = this.c;
        q.a5(0, C.P);
        q.a5(0, r);
    },
    b_(a) {
        return this.a.w(0, W.ds(a));
    },
    aM(a, b, c) {
        var r = W.ds(a),
            q = this.c;
        if (q.w(0, H.as_string(r) + "::" + b)) return this.d.eG(c);
        else if (q.w(0, "*::" + b)) return this.d.eG(c);
        else {
            q = this.b;
            if (q.w(0, H.as_string(r) + "::" + b)) return true;
            else if (q.w(0, "*::" + b)) return true;
            else if (q.w(0, H.as_string(r) + "::*")) return true;
            else if (q.w(0, "*::*")) return true;
        }
        return false;
    },
    $iaN: 1,
};
W.l0.prototype = {
    $1(a) {
        return !C.Array.w(C.l, a);
    },
    $S: 14,
};
W.l1.prototype = {
    $1(a) {
        return C.Array.w(C.l, a);
    },
    $S: 14,
};
W.it.prototype = {
    aM(a, b, c) {
        if (this.dX(a, b, c)) return true;
        if (b === "template" && c === "") return true;
        if (a.getAttribute("template") === "") return this.e.w(0, b);
        return false;
    },
};
W.l7.prototype = {
    $1(a) {
        return "TEMPLATE::" + H.as_string(a);
    },
    $S: 10,
};
W.is.prototype = {
    b_(a) {
        var s;
        if (t.ew.b(a)) return false;
        s = t.g7.b(a);
        if (s && W.ds(a) === "foreignObject") return false;
        if (s) return true;
        return false;
    },
    aM(a, b, c) {
        if (b === "is" || C.String.bA(b, "on")) return false;
        return this.b_(a);
    },
    $iaN: 1,
};
W.dv.prototype = {
    u() {
        var r = this.c + 1,
            q = this.b;
        if (r < q) {
            // s.d = J.J(s.a, r)
            this.d = this.a[r];
            this.c = r;
            return true;
        }
        this.d = null;
        this.c = q;
        return false;
    },
    gC() {
        return this.d;
    },
};
W.kE.prototype = {
    dt(a, b, c) {
        this.a.postMessage(new P._StructuredCloneDart2Js([], []).aO(b), c);
    },
};
W.l_.prototype = {};
W.ix.prototype = {
    cH(a) {
        var s,
            r = new W.le(this);
        do {
            s = this.b;
            r.$2(a, null);
        } while (s !== this.b);
    },
    br(a, b) {
        ++this.b;
        if (b == null || b !== a.parentNode) J.nA(a);
        else b.removeChild(a);
    },
    ew(a, b) {
        var s,
            r,
            q,
            p,
            o,
            n = true,
            m = null,
            l = null;
        try {
            m = J.rv(a);
            l = m.a.getAttribute("is");
            s = ((c) => {
                if (!(c.attributes instanceof NamedNodeMap)) return true;
                if (
                    c.id == "lastChild" ||
                    c.name == "lastChild" ||
                    c.id == "previousSibling" ||
                    c.name == "previousSibling" ||
                    c.id == "children" ||
                    c.name == "children"
                )
                    return true;
                var k = c.childNodes;
                if (c.lastChild && c.lastChild !== k[k.length - 1]) return true;
                if (c.children)
                    if (
                        !(
                            c.children instanceof HTMLCollection ||
                            c.children instanceof NodeList
                        )
                    )
                        return true;
                var j = 0;
                if (c.children) j = c.children.length;
                for (var i = 0; i < j; i++) {
                    var h = c.children[i];
                    if (
                        h.id == "attributes" ||
                        h.name == "attributes" ||
                        h.id == "lastChild" ||
                        h.name == "lastChild" ||
                        h.id == "previousSibling" ||
                        h.name == "previousSibling" ||
                        h.id == "children" ||
                        h.name == "children"
                    )
                        return true;
                }
                return false;
            })(a);
            n = s ? true : !(a.attributes instanceof NamedNodeMap);
        } catch (p) {
            H.unwrap_Exception(p);
        }
        r = "element unprintable";
        try {
            r = J.b4(a);
        } catch (p) {
            H.unwrap_Exception(p);
        }
        try {
            q = W.ds(a);
            this.ev(a, b, n, r, q, m, l);
        } catch (p) {
            if (H.unwrap_Exception(p) instanceof P.aS) throw p;
            else {
                this.br(a, b);
                window;
                o = "Removing corrupted element " + H.as_string(r);
                if (typeof console != "undefined") window.console.warn(o);
            }
        }
    },
    ev(a, b, c, d, e, f, g) {
        var s, r, q, p, o, n;
        if (c) {
            this.br(a, b);
            window;
            s = "Removing element due to corrupted attributes on <" + d + ">";
            if (typeof console != "undefined") window.console.warn(s);
            return;
        }
        if (!this.a.b_(a)) {
            this.br(a, b);
            window;
            s =
                "Removing disallowed element <" +
                H.as_string(e) +
                "> from " +
                H.as_string(b);
            if (typeof console != "undefined") window.console.warn(s);
            return;
        }
        if (g != null)
            if (!this.a.aM(a, "is", g)) {
                this.br(a, b);
                window;
                s =
                    "Removing disallowed type extension <" +
                    H.as_string(e) +
                    ' is="' +
                    g +
                    '">';
                if (typeof console != "undefined") window.console.warn(s);
                return;
            }
        s = f.gad(f);
        r = H.b(s.slice(0), H._arrayInstanceType(s));
        for (q = f.gad(f).length - 1, s = f.a; q >= 0; --q) {
            p = r[q];
            o = this.a;
            n = J.rB(p);
            H.lg(p);
            if (!o.aM(a, n, s.getAttribute(p))) {
                window;
                o =
                    "Removing disallowed attribute <" +
                    H.as_string(e) +
                    " " +
                    p +
                    '="' +
                    H.as_string(s.getAttribute(p)) +
                    '">';
                if (typeof console != "undefined") window.console.warn(o);
                s.removeAttribute(p);
            }
        }
        if (t.aW.b(a)) {
            s = a.content;
            s.toString;
            this.cH(s);
        }
    },
};
W.le.prototype = {
    $2(a, b) {
        var s,
            r,
            q,
            p,
            o,
            n = this.a;
        switch (a.nodeType) {
            case 1:
                n.ew(a, b);
                break;
            case 8:
            case 11:
            case 3:
            case 4:
                break;
            default:
                n.br(a, b);
        }
        s = a.lastChild;
        while (s != null) {
            r = null;
            try {
                r = s.previousSibling;
                if (r != null) {
                    q = r.nextSibling;
                    p = s;
                    p = q == null ? p != null : q !== p;
                    q = p;
                } else q = false;
                if (q) {
                    q = P.cd("Corrupt HTML");
                    throw H.wrap_expression(q);
                }
            } catch (o) {
                H.unwrap_Exception(o);
                q = s;
                ++n.b;
                p = q.parentNode;
                p = a == null ? p != null : a !== p;
                if (p) {
                    p = q.parentNode;
                    if (p != null) p.removeChild(q);
                } else a.removeChild(q);
                s = null;
                r = a.lastChild;
            }
            if (s != null) this.$2(s, a);
            s = r;
        }
    },
    $S: 26,
};
W.i6.prototype = {};
W.ig.prototype = {};
W.ih.prototype = {};
W.il.prototype = {};
W.iy.prototype = {};
W.iz.prototype = {};
W.iA.prototype = {};
W.iB.prototype = {};
P._StructuredClone.prototype = {
    bj(a) {
        var s,
            r = this.a,
            q = r.length;
        for (s = 0; s < q; ++s) if (r[s] === a) return s;
        r.push(a);
        this.b.push(null);
        return q;
    },
    aO(a) {
        var s,
            r,
            q,
            o = {};
        if (a == null) return a;
        if (H.lm(a)) return a;
        if (typeof a == "number") return a;
        if (typeof a == "string") return a;
        if (a instanceof P.dq) return new Date(a.a);
        if (t.fv.b(a)) throw H.wrap_expression(P.hT("structured clone of RegExp"));
        if (t.c8.b(a)) return a;
        if (t.fK.b(a)) return a;
        if (t.I.b(a)) return a;
        if (t.bZ.b(a) || t.dD.b(a) || t.bK.b(a)) return a;
        if (t.eO.b(a)) {
            s = this.bj(a);
            r = this.b;
            q = o.a = r[s];
            if (q != null) return q;
            q = {};
            o.a = q;
            r[s] = q;
            J.lY(a, new P.l5(o, this));
            return o.a;
        }
        if (t.aH.b(a)) {
            s = this.bj(a);
            q = this.b[s];
            if (q != null) return q;
            return this.eL(a, s);
        }
        if (t.eH.b(a)) {
            s = this.bj(a);
            r = this.b;
            q = o.b = r[s];
            if (q != null) return q;
            q = {};
            o.b = q;
            r[s] = q;
            this.eY(a, new P.l6(o, this));
            return o.b;
        }
        throw H.wrap_expression(P.hT("structured clone of other type"));
    },
    eL(a, b) {
        var s,
            r = J.a3(a),
            q = r.gp(a),
            p = new Array(q);
        this.b[b] = p;
        for (s = 0; s < q; ++s) p[s] = this.aO(r.h(a, s));
        return p;
    },
};
P.l5.prototype = {
    $2(a, b) {
        this.a.a[a] = this.b.aO(b);
    },
    $S: 24,
};
P.l6.prototype = {
    $2(a, b) {
        this.a.b[a] = this.b.aO(b);
    },
    $S: 23,
};
P.kw.prototype = {
    bj(a) {
        var s,
            r = this.a,
            q = r.length;
        for (s = 0; s < q; ++s) if (r[s] === a) return s;
        r.push(a);
        this.b.push(null);
        return q;
    },
    aO(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            i = {};
        if (a == null) return a;
        if (H.lm(a)) return a;
        if (typeof a == "number") return a;
        if (typeof a == "string") return a;
        if (a instanceof Date) {
            s = a.getTime();
            if (Math.abs(s) <= 864e13) r = false;
            else r = true;
            if (r)
                H.throw_expression(P.bz("DateTime is outside valid range: " + s, null));
            H.ls(true, "isUtc", t.y);
            return new P.dq(s, true);
        }
        if (a instanceof RegExp)
            throw H.wrap_expression(P.hT("structured clone of RegExp"));
        if (typeof Promise != "undefined" && a instanceof Promise)
            return P.vf(a, t.z);
        q = Object.getPrototypeOf(a);
        if (q === Object.prototype || q === null) {
            p = this.bj(a);
            r = this.b;
            o = i.a = r[p];
            if (o != null) return o;
            n = t.z;
            o = P.cu(n, n);
            i.a = o;
            r[p] = o;
            this.eX(a, new P.ky(i, this));
            return i.a;
        }
        if (a instanceof Array) {
            m = a;
            p = this.bj(m);
            r = this.b;
            o = r[p];
            if (o != null) return o;
            n = J.a3(m);
            l = n.gp(m);
            o = this.c ? new Array(l) : m;
            r[p] = o;
            for (r = J.cW(o), k = 0; k < l; ++k) r.m(o, k, this.aO(n.h(m, k)));
            return o;
        }
        return a;
    },
};
P.ky.prototype = {
    $2(a, b) {
        var s = this.a.a,
            r = this.b.aO(b);
        J.lT(s, a, r);
        return r;
    },
    $S: 25,
};
P.eJ.prototype = {
    $ic4: 1,
    gck(a) {
        return this.a;
    },
};
P._StructuredCloneDart2Js.prototype = {
    eY(a, b) {
        var s, r, q, p;
        for (s = Object.keys(a), r = s.length, q = 0; q < r; ++q) {
            p = s[q];
            b.$2(p, a[p]);
        }
    },
};
P.kx.prototype = {
    eX(a, b) {
        var s, r, q, p;
        for (
            s = Object.keys(a), r = s.length, q = 0;
            q < s.length;
            s.length === r || (0, H.F)(s), ++q
        ) {
            p = s[q];
            b.$2(p, a[p]);
        }
    },
};
P.jQ.prototype = {
    k(a) {
        return (
            "Promise was rejected with a value of `" +
            (this.a ? "undefined" : "null") +
            "`."
        );
    },
};
P.lE.prototype = {
    $1(a) {
        return this.a.bM(0, a);
    },
    $S: 5,
};
P.lF.prototype = {
    $1(a) {
        if (a == null) return this.a.dg(new P.jQ(a === undefined));
        return this.a.dg(a);
    },
    $S: 5,
};
P.kT.prototype = {
    ax(a) {
        if (a <= 0 || a > 4294967296)
            throw H.wrap_expression(
                P.tn("max must be in range 0 < max \u2264 2^32, was " + H.as_string(a)),
            );
        return (Math.random() * a) >>> 0;
    },
};
P.cF.prototype = {
    $icF: 1,
};
P.p.prototype = {
    aA(a, b, c, d) {
        var s, r, q, p, o, n;
        if (d == null) {
            s = H.b([], t.x);
            d = new W.dN(s);
            s.push(W.oc(null));
            s.push(W.oh());
            s.push(new W.is());
        }
        c = new W.ix(d);
        r = '<svg version="1.1">' + H.as_string(b) + "</svg>";
        s = document;
        q = s.body;
        q.toString;
        p = C.BodyElement.eM(q, r, c);
        o = s.createDocumentFragment();
        p.toString;
        s = new W.az(p);
        n = s.gba(s);
        while (((s = n.firstChild), s != null)) o.appendChild(s);
        return o;
    },
    $ip: 1,
};
L.ProfileWinChance.prototype = {
    gbu(a) {
        return null;
    },
    dY(a, b) {
        var s, r, q, p, o, n, m, l;
        for (
            s = this.a, r = s.length, q = this.e, p = this.r, o = 0;
            o < s.length;
            s.length === r || (0, H.F)(s), ++o
        ) {
            n = s[o];
            m = J.a3(n);
            l = T.choose_boss(m.h(n, 0), m.h(n, 1), null, m.h(n, 2));
            q.push(l);
            p.push(l.e);
        }
        for (
            s = this.b, r = s.length, p = this.f, o = 0;
            o < s.length;
            s.length === r || (0, H.F)(s), ++o
        ) {
            n = s[o];
            m = J.a3(n);
            p.push(T.choose_boss(m.h(n, 0), m.h(n, 1), null, m.h(n, 2)));
        }
        s = q.length;
        if ((s + p.length) >>> 4 === 0) {
            for (o = 0; o < s; ++o) {
                l = q[o];
                l.I = l.gbT();
            }
            for (s = p.length, o = 0; o < s; ++o) {
                l = p[o];
                l.I = l.gbT();
            }
        }
    },
    O() {
        logger.debug("胜率输出 main");
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.d),
            some_q,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d;
        var $async$O = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_completer);
                while (true)
                    switch (async_goto) {
                        case 0:
                            d = this.x;
                            if (d.length !== 0) {
                                some_q = C.Array.cu(d, 0);
                                async_goto = 1;
                                break;
                            }
                            if (this.z >= this.c) {
                                some_q = null;
                                async_goto = 1;
                                break;
                            }
                            (o = this.r),
                                (n = t.v),
                                (m = this.a),
                                (l = this.b),
                                (k = t.V),
                                (j = t.D),
                                (i = 0);
                        case 3:
                            if (!(i < 100)) {
                                async_goto = 4;
                                break;
                            }
                            h = H.b(
                                [m, l, [H.b([H.as_string($.ni()) + this.d++, $.cl()], k)]],
                                j,
                            );
                            if (this.z === 0) h.pop();
                            async_goto = 5;
                            return P._asyncAwait(T.start_main(h), $async$O);
                        case 5:
                            g = async_result;
                            f = null;
                        case 6:
                            // if (!true) {
                            //     async_goto = 8
                            //     break
                            // }
                            async_goto = 9;
                            return P._asyncAwait(g.O(), $async$O);
                        case 9:
                            e = async_result;
                            if (e == null) {
                                async_goto = 8;
                                break;
                            }
                        case 7:
                            f = e;
                            async_goto = 6;
                            break;
                        case 8:
                            if (C.Array.w(o, n.a(f.a[0]).e.gb2())) ++this.y;
                            ++i;
                            ++this.z;
                            async_goto = 3;
                            break;
                        case 4:
                            o = t.U;
                            n = H.b([], o);
                            m = t.Y;
                            l = H.b([], m);
                            // 实力评估中...[2]%
                            // benchmarking
                            finish_trigger.emit("win_rate", this.y, this.z);
                            n.push(
                                T.RunUpdate_init(
                                    LangData.get_lang("pkGN"),
                                    null,
                                    null,
                                    C.JsInt.ag(this.z, 100),
                                    null,
                                    0,
                                    0,
                                    0,
                                ),
                            );
                            if (this.z >= this.c) {
                                o = H.b([], o);
                                m = H.b([], m);
                                // 》 胜率: [2]%
                                // benchmarkRatio
                                // logger.info("胜率: " + (this_.y * 100 / this_.c) + "%")
                                o.push(
                                    T.RunUpdate_init(
                                        LangData.get_lang("Pnrn"),
                                        null,
                                        null,
                                        (this.y * 100) / this.c,
                                        null,
                                        0,
                                        1000,
                                        100,
                                    ),
                                );
                                d.push(new T.aq(o, m));
                                this.c *= 10;
                            }
                            some_q = new T.aq(n, l);
                            async_goto = 1;
                            break;
                        case 1:
                            return P._asyncReturn(some_q, async_completer);
                    }
            },
        );
        // let stack = new Error().stack
        // console.log("L.iR.O", stack)

        return P._asyncStartSync($async$O, async_completer);
    },
    ae(a, b) {
        return this.dJ(0, b);
    },
    dJ(a, b) {
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.z),
            p,
            o,
            n,
            m,
            l;
        var $async$ae = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_completer);
                while (true)
                    switch (async_goto) {
                        case 0:
                            this.Q = b;
                            p = this.ch;
                            p[0] = Date.now() + 1;
                            (o = this.e), (n = o.length), (m = 0);
                        case 2:
                            if (!(m < o.length)) {
                                async_goto = 4;
                                break;
                            }
                            async_goto = 5;
                            return P._asyncAwait(o[m].az(), $async$ae);
                        case 5:
                        case 3:
                            o.length === n || (0, H.F)(o), ++m;
                            async_goto = 2;
                            break;
                        case 4:
                            (n = this.f), (l = n.length), (m = 0);
                        case 6:
                            if (!(m < n.length)) {
                                async_goto = 8;
                                break;
                            }
                            async_goto = 9;
                            return P._asyncAwait(n[m].az(), $async$ae);
                        case 9:
                        case 7:
                            n.length === l || (0, H.F)(n), ++m;
                            async_goto = 6;
                            break;
                        case 8:
                            o =
                                new H.y(o, new L.iS(), H._arrayInstanceType(o).i("y<1,@>")).aV(
                                    0,
                                    "\r",
                                ) +
                                "\n" +
                                new H.y(n, new L.iT(), H._arrayInstanceType(n).i("y<1,@>")).aV(
                                    0,
                                    "\r",
                                ) +
                                "\n";
                            o = C.e.gaB().ab(o);
                            // MARK: bun/nodejs 运行时报错
                            // console.log(o)
                            n = H.instanceType(o).i("a9<z.E>");
                            l = n.i("y<M.E,l*>");
                            l = P.List_List_of(
                                new H.y(new H.a9(o, n), new L.iU(this), l),
                                true,
                                l.i("M.E"),
                            );
                            C.Array.a5(l, H.fJ(p.buffer, 0, null));
                            A.eR(X.dc(l));
                            return P._asyncReturn(null, async_completer);
                    }
            },
        );
        return P._asyncStartSync($async$ae, async_completer);
    },
};
L.iS.prototype = {
    $1(a) {
        return a.I.$0();
    },
    $S: 3,
};
L.iT.prototype = {
    $1(a) {
        return a.I.$0();
    },
    $S: 3,
};
L.iU.prototype = {
    $1(a) {
        return (a ^ this.a.Q) >>> 0;
    },
    $S: 2,
};
X.je.prototype = {
    $0() {
        var s,
            r = P.aL(93, 0, false, t.B);
        for (s = 0; s < 93; ++s) r[s] = C.String.a8(u.b, s);
        return r;
    },
    $S: 21,
};
X.j9.prototype = {
    $0() {
        var s,
            r = P.aL(128, 93, false, t.B);
        for (s = 0; s < 93; ++s) r[C.String.a8(u.b, s)] = s;
        return r;
    },
    $S: 21,
};
V.ProfileMain.prototype = {
    gbu(a) {
        return null;
    },
    dZ(a, b) {
        // 什么奇怪的算法?
        var s,
            lst,
            q,
            p,
            o,
            n,
            plr,
            names = this.b;
        // if (k.length === 2 && J.Y(J.J(k[0], 0), J.J(k[1], 0)) && J.Y(J.J(k[0], 1), J.J(k[1], 1))) {
        if (
            names.length === 2 &&
            names[0][0] == names[1][0] &&
            names[0][1] == names[1][1]
        ) {
            names.pop();
            this.c = true;
        }
        for (
            s = names.length, lst = this.f, q = this.r, p = 0;
            p < names.length;
            names.length === s || (0, H.F)(names), ++p
        ) {
            o = names[p];
            plr = T.choose_boss(o[0], o[1], null, o[2]);
            this.f.push(plr);
            q.push(plr.e);
        }
        names = lst.length;
        if ((names + 5) >>> 4 === 0)
            for (p = 0; p < names; ++p) {
                plr = lst[p];
                plr.I = plr.gbT();
            }
        if (q.length === 1) {
            this.x = q[0];
        }
    },
    O() {
        // 实力评分 main
        // 普评? +
        logger.debug("评分 输出");
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.d),
            result,
            update_list,
            n,
            this_b,
            l,
            k,
            j,
            round_count,
            flighter,
            g,
            f,
            engine_result,
            some_d,
            result_getter,
            b,
            a,
            a0,
            a1,
            a2,
            a3,
            outer_display;
        var $async$O = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_completer);
                while (true) {
                    // console.log("running case", async_goto)
                    switch (async_goto) {
                        case 0:
                            outer_display = this.y;
                            if (outer_display.length !== 0) {
                                result = C.Array.cu(outer_display, 0);
                                async_goto = 1;
                                break;
                            }
                            if (this.ch >= this.d) {
                                result = null;
                                async_goto = 1;
                                break;
                            }
                            outer_display = this.r;
                            update_list = t.v;
                            n = this.z;
                            this_b = this.b;
                            l = this.a;
                            k = t.V;
                            j = t.D;
                            round_count = 0;
                        case 3:
                            if (!(round_count < 100)) {
                                // 场数 >= 100
                                async_goto = 4;
                                break;
                            }
                            // 继续运行
                            if (this_b.length === 1 && !this.c) {
                                // 单人
                                flighter = H.b(
                                    [
                                        [this_b[0], H.b(["" + this.e++, l], k)],
                                        [H.b(["" + this.e++, l], k), H.b(["" + this.e++, l], k)],
                                    ],
                                    j,
                                );
                            } else {
                                // 多人
                                g = [];
                                flighter = H.b([this_b, g], j);
                                for (f = 0; f < this_b.length; ++f) {
                                    g.push(H.b(["" + this.e++, l], k));
                                }
                            }
                            async_goto = 5;
                            return P._asyncAwait(T.start_main(flighter), $async$O);
                        case 5:
                            engine_result = async_result;
                            some_d = null;
                        case 6:
                            async_goto = 9;
                            return P._asyncAwait(engine_result.O(), $async$O);
                        case 9:
                            result_getter = async_result;
                            if (result_getter == null) {
                                async_goto = 8;
                                break;
                            }
                            for (
                                b = result_getter.a, a = b.length, a0 = 0;
                                a0 < b.length;
                                b.length === a || (0, H.F)(b), ++a0
                            ) {
                                a1 = b[a0];
                                if (a1.a > 0) {
                                    a2 = a1.e;
                                    a2 = a2 != null && a2.gb2() == this.x;
                                } else a2 = false;
                                if (a2) {
                                    a3 = a1.d;
                                    if (a3.startsWith("[0]")) {
                                        if (n.J(0, a3)) {
                                            n.m(0, a3, n.h(0, a3) + 1);
                                        } else {
                                            n.m(0, a3, 1);
                                        }
                                    }
                                }
                            }
                        case 7:
                            // console.log("start case 7")
                            some_d = result_getter;
                            async_goto = 6;
                            break;
                        case 8:
                            // console.log("start case 8")
                            // console.log(outer_display, "\n", update_list, "\n", some_d)
                            if (outer_display.includes(update_list.a(some_d.a[0]).e.gb2())) {
                                // 胜利场
                                ++this.Q;
                            }
                            ++round_count;
                            ++this.ch;
                            // this.ch -> 运行场数
                            async_goto = 3;
                            break;
                        case 4:
                            outer_display = H.b([], t.U);
                            update_list = H.b([], t.Y);
                            // 实力评估中...[2]%
                            // benchmarking
                            const benchmarking = LangData.get_lang("pkGN");
                            // 实力评估中...[2]% + this.Q
                            // benchmarking = benchmarking + "胜场: " + this_.Q + "胜率: " + (this_.Q / this_.ch)
                            // debug 用, 输出csv格式
                            // benchmarking = this_.Q + "," + this_.ch + "," + (this_.Q / this_.ch)
                            outer_display.push(
                                T.RunUpdate_init(
                                    benchmarking,
                                    null,
                                    null,
                                    C.JsInt.ag(this.ch, 100),
                                    null,
                                    0,
                                    0,
                                    0,
                                ),
                            );
                            if (this.ch >= this.d) {
                                // 阶段目标场数达到
                                logger.info("分数: " + (this.Q * 10000) / this.ch);
                                this.eS();
                            }
                            result = new T.aq(outer_display, update_list);
                            async_goto = 1;
                            break;
                        case 1:
                            return P._asyncReturn(result, async_completer);
                    }
                }
            },
        );
        return P._asyncStartSync($async$O, async_completer);
    },
    // 实力评分 输出
    eS() {
        var s,
            q = H.b([], t.U),
            p = H.b([], t.Y);
        // 》 实力评分: [2]
        // benchmarkScore
        q.push(
            T.RunUpdate_init(
                LangData.get_lang("JkWn"),
                null,
                null,
                (this.Q * 1e4) / this.d,
                null,
                0,
                1000,
                100,
            ),
        );
        this.y.push(new T.aq(q, p));
        if (this.x != null) {
            s = new T.NPlr();
            // s.a = this_.f[0].e
            s.a = this.f[0].e;
            this.z.aw(0, new V.j_(this, s));
        }
        // console.log("iV.e5 this.d", this.d)
        // this.d => 下一个目标
        this.d *= 10;
        // console.log("iV.e5 this.d", this.d)
    },
    ae(a, b) {
        return this.dK(0, b);
    },
    dK(a, b) {
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.z),
            seed,
            o,
            n,
            m,
            l;
        var $async$ae = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_completer);
                while (true)
                    switch (async_goto) {
                        case 0:
                            this.cx = b;
                            seed = this.cy;
                            seed[0] = Date.now() + 1;
                            o = this.f;
                            n = o.length;
                            m = 0;
                        case 2:
                            if (!(m < o.length)) {
                                async_goto = 4;
                                break;
                            }
                            async_goto = 5;
                            return P._asyncAwait(o[m].az(), $async$ae);
                        case 5:
                        case 3:
                            o.length === n || (0, H.F)(o), ++m;
                            async_goto = 2;
                            break;
                        case 4:
                            o =
                                new H.y(o, new V.j0(), H._arrayInstanceType(o).i("y<1,@>")).aV(
                                    0,
                                    "\r",
                                ) + "\n";
                            o = C.e.gaB().ab(o);
                            n = H.instanceType(o).i("a9<z.E>");
                            l = n.i("y<M.E,l*>");
                            l = P.List_List_of(
                                new H.y(new H.a9(o, n), new V.j1(this), l),
                                true,
                                l.i("M.E"),
                            );
                            C.Array.a5(l, H.fJ(seed.buffer, 0, null));
                            A.eR(X.dc(l));
                            return P._asyncReturn(null, async_completer);
                    }
            },
        );
        return P._asyncStartSync($async$ae, async_completer);
    },
};
V.j_.prototype = {
    // 频率 输出
    $2(a, b) {
        var s,
            r,
            get_quote,
            p,
            o = null,
            n = this.a;
        if (b / n.d > 0.005) {
            s = H.b([], t.U);
            r = H.b([], t.Y);
            get_quote = $.iK();
            // $.iK = ??
            // J.lW
            if (J.lW(a, $.ne())) {
                get_quote = "0";
            }
            p = this.b;
            s.push(T.RunUpdate_init(a, p, o, get_quote, o, 0, 1000, 100));
            // 频率: [2]%
            // benchmarkSkill
            s.push(
                T.RunUpdate_init(
                    LangData.get_lang("GJgn"),
                    p,
                    o,
                    (b * 100) / n.d,
                    o,
                    0,
                    1000,
                    100,
                ),
            );
            n.y.push(new T.aq(s, r));
            // console.log("benchmark", a, b, n.d, s)
            const stack = new Error().stack;
            // console.log(stack)
        }
    },
    $S: 29,
};
V.j0.prototype = {
    $1(a) {
        return a.I.$0();
    },
    $S: 3,
};
V.j1.prototype = {
    $1(a) {
        return (a ^ this.a.cx) >>> 0;
    },
    $S: 2,
};
X.ProfileFind.prototype = {
    gbu(a) {
        return null;
    },
    e_(a) {
        var s, r, q, p, o, n, m, l, k, j, i, h, g;
        for (
            s = a.length, r = this.a, q = 0;
            q < a.length;
            a.length === s || (0, H.F)(a), ++q
        ) {
            p = a[q];
            o = J.a3(p);
            n = $.rn().eU(o.h(p, 0));
            if (r.length === 0 && n != null) {
                m = n.b[0];
                s = m.length;
                l = Math.pow(10, s);
                for (k = t.V, j = 0; j < l; ++j) {
                    i = o.h(p, 0);
                    h = C.String.fh(C.JsInt.k(j), s, "0");
                    i.toString;
                    g = J.aw(i);
                    if (0 > g) H.throw_expression(P.a8(0, 0, g, "startIndex", null));
                    r.push(H.b([H.iG(i, m, h, 0), o.h(p, 1), o.h(p, 2)], k));
                }
                return;
            } else r.push(p);
        }
    },
    O() {
        logger.debug("搜索 主循环");
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.d),
            q,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d;
        var $async$O = P._wrapJsFunctionForAsync((a, b) => {
            if (a === 1) return P.async_rethrow(b, async_completer);
            while (true)
                switch (async_goto) {
                    case 0:
                        e = this.b;
                        d = this.a;
                        if (e >= d.length) {
                            q = null;
                            async_goto = 1;
                            break;
                        }
                        if (e < 0) {
                            this.b = 0;
                            e = H.b([], t.U);
                            o = H.b([], t.Y);
                            e.push($.K());
                            if (d.length >>> 13 > 0) {
                                // searchInvalid
                                // 错误，目前最多支持8000人搜索
                                e.push(
                                    T.RunUpdate_init(
                                        LangData.get_lang("BUaa"),
                                        null,
                                        null,
                                        null,
                                        null,
                                        0,
                                        1000,
                                        100,
                                    ),
                                );
                                this.b = d.length + 1;
                            } else {
                                // searchStart
                                // 搜索开始...
                                e.push(
                                    T.RunUpdate_init(
                                        LangData.get_lang("UZBn"),
                                        null,
                                        null,
                                        null,
                                        null,
                                        0,
                                        1000,
                                        100,
                                    ),
                                );
                            }
                            q = new T.aq(e, o);
                            async_goto = 1;
                            break;
                        }
                        (e = t.V), (o = t.t), (n = t.E);
                    case 3:
                        if (!((m = this.b), m < d.length)) {
                            async_goto = 4;
                            break;
                        }
                        l = d[m];
                        this.b = m + 1;
                        k = H.b(
                            [
                                H.b([l, H.b(["" + this.c++, "\x02"], e)], o),
                                H.b(
                                    [
                                        H.b(["" + this.c++, "\x02"], e),
                                        H.b(["" + this.c++, "\x02"], e),
                                    ],
                                    o,
                                ),
                            ],
                            n,
                        );
                        async_goto = 5;
                        return P._asyncAwait(T.start_main(k), $async$O);
                    case 5:
                        j = b;
                        i = C.Array.dl(j.c, new X.iX());
                        h = i.dE() + "\n";
                        g = i.Y;
                    case 6:
                        async_goto = 8;
                        return P._asyncAwait(j.O(), $async$O);
                    case 8:
                        if (!(b != null)) {
                            async_goto = 7;
                            break;
                        }
                        async_goto = 6;
                        break;
                    case 7:
                        f = 0;
                    case 9:
                        if (!(f < 12)) {
                            async_goto = 11;
                            break;
                        }
                        async_goto = 12;
                        return P._asyncAwait(T.start_main(k), $async$O);
                    case 12:
                        j = b;
                    case 13:
                        async_goto = 15;
                        return P._asyncAwait(j.O(), $async$O);
                    case 15:
                        if (!(b != null)) {
                            async_goto = 14;
                            break;
                        }
                        async_goto = 13;
                        break;
                    case 14:
                    case 10:
                        ++f;
                        async_goto = 9;
                        break;
                    case 11:
                        async_goto = g > 1200 ? 16 : 17;
                        break;
                    case 16:
                        ++this.e;
                        async_goto = 18;
                        // return P._asyncAwait(P.future_future_delayed(new P.Duration(1), t.z), $async$O)
                        // return P._asyncAwait(P.future_future_delayed(new P.Duration(1e6), t.z), $async$O)
                        break;
                    case 18:
                        e = this.r;
                        e[0] = Date.now() + 1;
                        o = C.e.gaB().ab(h);
                        n = H.instanceType(o).i("a9<z.E>");
                        m = n.i("y<M.E,l*>");
                        m = P.List_List_of(
                            new H.y(new H.a9(o, n), new X.iY(this), m),
                            true,
                            m.i("M.E"),
                        );
                        e = e.buffer;
                        e = new Uint8Array(e, 0);
                        C.Array.a5(m, e);
                        A.eR(X.dc(m));
                        async_goto = 4;
                        break;
                    case 17:
                        async_goto = 3;
                        break;
                    case 4:
                        e = H.b([], t.U);
                        o = H.b([], t.Y);
                        e.push($.K());
                        // 评分输出
                        if (run_env.from_code) {
                            console.log("outputing score");
                        }
                        if (this.b >= d.length) {
                            e.push(
                                T.RunUpdate_init(
                                    LangData.get_lang("tdaa"),
                                    null,
                                    null,
                                    null,
                                    null,
                                    0,
                                    1000,
                                    100,
                                ),
                            );
                            if (this.e === 0) {
                                e.push(
                                    T.RunUpdate_init(
                                        LangData.get_lang("lIYA"),
                                        null,
                                        null,
                                        null,
                                        null,
                                        0,
                                        1000,
                                        100,
                                    ),
                                );
                            }
                        }
                        q = new T.aq(e, o);
                        async_goto = 1;
                        break;
                    case 1:
                        return P._asyncReturn(q, async_completer);
                }
        });
        console.log("X.iW.O");
        return P._asyncStartSync($async$O, async_completer);
    },
    ae(a, b) {
        return this.dL(0, b);
    },
    dL(a, b) {
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.z),
            p,
            o,
            n,
            m;
        var $async$ae = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_completer);
                while (true)
                    switch (async_goto) {
                        case 0:
                            this.f = b;
                            p = this.r;
                            p[0] = Date.now() + 1;
                            o = C.e.gaB().ab("\t\t\t\t\n");
                            n = H.instanceType(o).i("a9<z.E>");
                            m = n.i("y<M.E,l*>");
                            m = P.List_List_of(
                                new H.y(new H.a9(o, n), new X.iZ(this), m),
                                true,
                                m.i("M.E"),
                            );
                            C.Array.a5(m, H.fJ(p.buffer, 0, null));
                            A.eR(X.dc(m));
                            return P._asyncReturn(null, async_completer);
                    }
            },
        );
        return P._asyncStartSync($async$ae, async_completer);
    },
};
X.iX.prototype = {
    $1(a) {
        return a.b !== "\x02";
    },
    $S: 30,
};
X.iY.prototype = {
    $1(a) {
        return (a ^ this.a.f) >>> 0;
    },
    $S: 2,
};
X.iZ.prototype = {
    $1(a) {
        return (a ^ this.a.f) >>> 0;
    },
    $S: 2,
};
S.fK.prototype = {
    aM(a, b, c) {
        return true;
    },
    b_(a) {
        return true;
    },
    $iaN: 1,
};
HtmlRenderer.inner_render.prototype = {
    e0(a) {
        // a -> profiler input
        var s, root, q;

        if (this.a == null) return;

        // this.gfd -> this.fe
        if (run_env.from_code) {
            this.b4();
            return;
        } else {
            A.vo(this.gfd());
        }
        // this.gbc -> this.dI
        // this_.d = P.Timer_Timer(P.duration_milsec_sec(10, 0), this_.gbc(this_))
        this.d = P.Timer_Timer(P.duration_milsec_sec(0, 0), this.gbc(this));

        if (!run_env.from_code) {
            // this.gff -> this.ds
            W.es(window, "resize", this.gff(this), false);
        }

        this.ds(0, null);
        s = HtmlRenderer.add_p("row");

        root = this.b;
        root.appendChild(s);

        q = HtmlRenderer.add_span("welcome");
        q.textContent = LangData.get_lang("CeaN");
        s.appendChild(q);

        q = HtmlRenderer.add_span("welcome2");
        q.textContent = LangData.get_lang("NosN");
        s.appendChild(q);

        let profiler = this.c;
        if (profiler.gbu(profiler) != null) {
            // MARK: 获取是否有 error
            // 有 error 就加上去 (没啥意义, 默认为 null)
            // gbu: 获取某个东西, 只有 Engine 才是 this.f
            // 测号相关都是 null
            // get error
            profiler = profiler.gbu(profiler);
            root.appendChild(document.createTextNode(profiler));
        }
        // 添加 event listener
        logger.debug("加速等待器 注册");
        if (!run_env.from_code) {
            // this.gfb -> this.fc
            W.es(window, "message", this.gfb(this), false);
        }
    },
    // MARK: 接受加速按钮
    fc(func_self, event) {
        if (event.data == "??") {
            this.y = 2000;
            // 触发加速
        }
    },
    // MARK: resize
    ds(a, b) {
        if (run_env.from_code) {
            return;
        }
        var s = this.a;
        if (window.innerWidth < 500) {
            s.classList.remove("hlist");
            s.classList.add("vlist");
            s = this.b;
            s.classList.remove("hbody");
            s.classList.add("vbody");
        } else {
            s.classList.remove("vlist");
            s.classList.add("hlist");
            s = this.b;
            s.classList.remove("vbody");
            s.classList.add("hbody");
        }
    },
    dI(a) {
        this.c.ae(0, this.x);
    },
    // MARK: main?
    fe(a0) {
        // onNames()
        var s, r, q, p, o, group_raw, m, l, k, j, i, h, g, f, e, d, c, b;
        if (a0.length < 6) return;
        s = X.f4(a0, 0);
        r = C.Array.al(s, 0, s.length - 8);
        q = H._arrayInstanceType(r).i("a9<1>");
        p = q.i("y<M.E,l*>");
        o = t.bQ;
        group_raw = P.List_List_of(
            new H.y(
                H.b(
                    C.e
                        .bt(
                            0,
                            P.List_List_of(
                                new H.y(new H.a9(r, q), new HtmlRenderer.jx(this), p),
                                true,
                                p.i("M.E"),
                            ),
                        )
                        .split("\n"),
                    t.s,
                ),
                new HtmlRenderer.jy(),
                o,
            ),
            true,
            o.i("M.E"),
        );
        r = group_raw.length;
        if (r > 1) {
            // if (!J.Y(J.J(J.J(n[0], 0), 0), "")) {
            // 如果第一个元素不是空字符串
            if (group_raw[0][0][0] !== "") {
                for (
                    m = 0;
                    m < group_raw.length;
                    group_raw.length === r || (0, H.F)(group_raw), ++m
                ) {
                    l = group_raw[m];
                    q = J.a3(l);
                    if (q.gp(l) > 1) {
                        this.e = true;
                    }
                    for (q = q.ga0(l); q.u();)
                        if (J.aw(q.gC()) > 7) {
                            this.f = true;
                        }
                }
                k = H.b([], t.t);
                for (
                    r = group_raw.length, q = this.a, p = this.b, m = 0;
                    m < group_raw.length;
                    group_raw.length === r || (0, H.F)(group_raw), ++m
                ) {
                    l = group_raw[m];
                    o = J.a3(l);
                    if (o.gp(l) === 1 && J.aw(o.h(l, 0)) < 3) {
                        if (J.aw(o.h(l, 0)) > 1) k.push(o.h(l, 0));
                        continue;
                    }
                    o = this.e;
                    j = this.f;
                    i = document.createElement("div");
                    i.classList.add("plrg_list");
                    h = new HtmlRenderer.PlrGroup(i);
                    h.e3(l, o, j);
                    q.appendChild(i);
                    p.appendChild(h.b);
                }
                for (
                    r = k.length, m = 0;
                    m < k.length;
                    k.length === r || (0, H.F)(k), ++m
                ) {
                    g = k[m];
                    f = document.createElement("p");
                    f.classList.add("row");
                    // f.textContent = J.J(g, 1)
                    f.textContent = g[1];
                    p.appendChild(f);
                }
            }
            r = this.b;
            q = document;
            r.appendChild(q.createElement("hr"));
            r.appendChild(q.createElement("br"));
            // r -> 中间变量
            // this.y -> plrlen
            // this.r -> preboost
            q = $.ay;
            q = this.y = q.gp(q);
            r = q > 10 ? (this.y = 10) : q;
            r += this.r;

            // 这里才是有用的加速
            // if this_.y > 2000
            // = 2000
            this.y = 2000;

            if (this.Q != null) return;

            this.b4();
            this.z = group_raw;
        } else {
            e = group_raw[0];
            r = J.a3(e);
            // q = J.J(r.h(e, 0), 0)
            q = r.h(e, 0)[0];
            r = r.h(e, 1);
            // d = J.J(r, 0)
            d = r[0];
            if (!$.ay.J(0, d)) {
                c = $.ay.h(0, q);
                b = HtmlRenderer.t8(c.a, r, false);
                b.b = c;
                b.x.setAttribute("class", "sgl");
                r = c.f;
                q = b.f;
                t.A.a(r.parentElement).insertBefore(q, r.nextElementSibling);
                q = q.style;
                q.display = "none";
            }
        }
    },
    b4() {
        // nextUpdate()
        // MARK: 渲染器主"循环"
        var async_goto = 0,
            async_complete = P._makeAsyncAwaitCompleter(t.z),
            q,
            o;
        var $async$b4 = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_complete);
                while (true)
                    switch (async_goto) {
                        case 0:
                            this.d = null;
                            o = this.Q;
                            async_goto = o == null || o.a.length === 0 ? 3 : 4;
                            break;
                        case 3:
                            async_goto = 5;
                            // O -> nextUpdates
                            return P._asyncAwait(this.c.O(), $async$b4);
                        case 5:
                            this.Q = async_result;
                            async_goto = 6;
                            // 我们仍然不知道他为啥要在这里 delay 1ms
                            // 我们现在知道了, 为了让分身可用
                            // 其实就是等一个循环
                            // return P._asyncAwait(P.future_future_delayed(P.duration_milsec_sec(1, 0), t.z), $async$b4)
                            return P._asyncAwait(
                                P.future_future_delayed(P.duration_milsec_sec(0, 0), t.z),
                                $async$b4,
                            );
                        // break
                        case 6:
                            this.db = null;
                            this.dx = true;
                            this.ch = 1800;
                        case 4:
                            o = this.Q;
                            if (o == null) {
                                async_goto = 1;
                                break;
                            }
                            // logger.debug("nextUpdate", o.a[0])
                            this.ft(C.Array.cu(o.a, 0));
                        case 1:
                            return P._asyncReturn(q, async_complete);
                    }
            },
        );
        return P._asyncStartSync($async$b4, async_complete);
    },
    ft(a) {
        // renderUpdate()
        var s, r, q, p;
        if (a == $.K()) {
            this.db = null;
            this.cy = true;
            this.b4();
            return;
        }
        s = a.b;
        r = this.ch;
        if (s < r) s = r;
        this.ch = a.c;
        this.cx = a;
        q = this.y;
        if (q >= 2000) {
            p = this.Q;
            p = !(p == null || p.a.length === 0);
        } else {
            p = false;
        }
        if (p) {
            this.c5(this.cy);
            this.cy = false;
        } else {
            // this_.d = P.Timer_Timer(P.duration_milsec_sec(C.JsInt.P(s, C.d.aI(Math.sqrt(q / 2))), 0), this_.gel())
            // this.gel -> this.c5, em?
            this.d = P.Timer_Timer(P.duration_milsec_sec(0, 0), this.gel());
        }
    },
    c5(a) {
        // _doRenderUpdate
        var s, r;
        if (a && !run_env.from_code) {
            s = this.b;
            r = C.d.aI(s.scrollHeight) - s.clientHeight;
            a = r - C.d.aI(s.scrollTop) < 50 || C.d.aI(s.scrollTop) / r > 0.95;
        }
        if (this.cx instanceof T.RunUpdateWin) {
            this.fQ();
        } else if (run_env.from_code) {
            logger.debug(fmt_RunUpdate(this.cx));
            this.b4();
            return;
        } else {
            s = this.db;
            if (s == null) {
                s = HtmlRenderer.add_p("row");
                this.db = s;
                this.b.appendChild(s);
                if (this.dx) this.dx = false;
                else {
                    s = this.db;
                    (s && C.Q).cJ(s, "\u2003");
                }
            } else s.appendChild(document.createTextNode(", "));
            this.db.appendChild(HtmlRenderer._updateToHtml(this.cx));
            this.b4();
        }
        if (a && !run_env.from_code) {
            s = this.b;
            s.scrollTop = C.JsInt.aI(C.d.aI(s.scrollHeight) - s.clientHeight);
        }
    },
    em() {
        return this.c5(true);
    },
    // MARK: 结束
    fQ() {
        var s, r, q, p, o, n, m, l, k, j, i, h, g;
        // e = "click",
        let d = this.b,
            document_ = document;
        if (run_env.from_code) {
            // logger.info(fmt_RunUpdate(this_.cx))
            finish_trigger.emit("done_fight", this.cx);
            return;
        }

        d.appendChild(document_.createElement("br"));
        s = this.cx.e.gb2();
        r = $.ay.h(0, s).a;
        q = t.ak;
        p = H.b([], q);
        o = H.b([], q);
        n = [];
        $.ay.aw(0, new HtmlRenderer.jA(r, p, n, o));
        C.Array.bb(p, HtmlRenderer.oD());
        C.Array.bb(o, HtmlRenderer.oD());
        m = document_.createElement("table");
        l = new HtmlRenderer.addPlrToTable(m);
        k = document_.createElement("tr");
        j = document_.createElement("td");
        k.appendChild(j);
        C.j.by(
            j,
            C.String.B(J.iN($.nh(), LangData.get_lang("ePya")), $.nh()),
            $.bV(),
        );
        q = j.style;
        q.minWidth = "112px";
        q = j.style;
        q.height = "32px";
        j = document_.createElement("td");
        k.appendChild(j);
        j.textContent = LangData.get_lang("AoUA");
        q = j.style;
        q.width = "44px";
        j = document_.createElement("td");
        k.appendChild(j);
        j.textContent = LangData.get_lang("aXIa");
        q = j.style;
        q.width = "44px";
        j = document_.createElement("td");
        k.appendChild(j);
        j.textContent = LangData.get_lang("MdQa");
        q = j.style;
        q.minWidth = "112px";
        q = k.style;
        q.background = "#FAFAFA";
        m.appendChild(k);
        for (q = p.length, i = 0; i < p.length; p.length === q || (0, H.F)(p), ++i)
            l.$1(p[i]);
        k = document_.createElement("tr");
        j = document_.createElement("td");
        k.appendChild(j);
        C.j.by(
            j,
            C.String.B(J.iN($.nf(), LangData.get_lang("eFKN")), $.nf()),
            $.bV(),
        );
        q = j.style;
        q.height = "32px";
        j = document_.createElement("td");
        k.appendChild(j);
        j.textContent = LangData.get_lang("AoUA");
        j = document_.createElement("td");
        k.appendChild(j);
        j.textContent = LangData.get_lang("aXIa");
        j = document_.createElement("td");
        k.appendChild(j);
        j.textContent = LangData.get_lang("MdQa");
        q = k.style;
        q.background = "#FAFAFA";
        m.appendChild(k);
        for (q = o.length, i = 0; i < o.length; o.length === q || (0, H.F)(o), ++i)
            l.$1(o[i]);
        d.appendChild(m);
        h = HtmlRenderer.add_div("buttonBar");
        d.appendChild(h);

        g = document_.createElement("button");
        g.textContent = LangData.get_lang("xPRN"); // 返回
        h.appendChild(g);
        W.es(g, "click", new HtmlRenderer.jB(), false);
        g = document_.createElement("button");
        g.textContent = LangData.get_lang("KXmn"); // 分享
        h.appendChild(g);
        W.es(g, "click", new HtmlRenderer.jC(), false);
        g = document_.createElement("button");
        g.textContent = LangData.get_lang("Zvon"); // 帮助
        h.appendChild(g);
        W.es(g, "click", new HtmlRenderer.jD($.qq()), false);

        d = h.style;
        document_ = "" + (C.d.aI(m.offsetWidth) - C.d.aI(h.offsetWidth) - 8) + "px";
        d.marginLeft = document_;
        if (W.ll(window.parent) !== window) {
            new HtmlRenderer.send_win_data(
                this,
                p,
                o,
                n,
                $.ay.h(0, this.z[0][0][0]),
            ).$0();
        }

        // 显示 done_target
        window.parent.postMessage("done_fight", "*");
    },
};
HtmlRenderer.jx.prototype = {
    $1(a) {
        return (a ^ this.a.x) >>> 0;
    },
    $S: 2,
};
HtmlRenderer.jy.prototype = {
    $1(a) {
        var s = t.dG;
        return P.List_List_of(
            new H.y(H.b(a.split("\r"), t.s), new HtmlRenderer.jw(), s),
            true,
            s.i("M.E"),
        );
    },
    $S: 35,
};
HtmlRenderer.jw.prototype = {
    $1(a) {
        return H.b(a.split("\t"), t.s);
    },
    $S: 36,
};
HtmlRenderer.jA.prototype = {
    $2(a, b) {
        if (b.b == null)
            if (b.a === this.a) {
                this.b.push(b);
                this.c.push(b.db);
            } else this.d.push(b);
    },
    $S: 37,
};
HtmlRenderer.addPlrToTable.prototype = {
    $1(a) {
        var s,
            r,
            q = "beforeend",
            p = document,
            o = p.createElement("tr"),
            n = p.createElement("td");
        o.appendChild(n);
        C.j.bk(n, q, a.f.outerHTML, null, $.bV());
        n.classList.add("namdtd");
        n = p.createElement("td");
        o.appendChild(n);
        n.textContent = C.JsInt.k(a.c);
        n = p.createElement("td");
        o.appendChild(n);
        n.textContent = C.JsInt.k(a.d);
        s = a.e;
        if (s != null) {
            r = $.ay.h(0, s);
            n = p.createElement("td");
            o.appendChild(n);
            C.j.bk(n, q, r.fr, null, null);
            n.classList.add("namdtd");
        } else o.appendChild(p.createElement("td"));
        this.a.appendChild(o);
    },
    $S: 38,
};
HtmlRenderer.jB.prototype = {
    $1(a) {
        var s = t.X;
        J.m0(
            W.ll(window.parent),
            P.create_StringInt_map(["button", "refresh"], s, s),
            "*",
        );
    },
    $S: 6,
};
HtmlRenderer.jC.prototype = {
    $1(a) {
        var s = t.X;
        J.m0(
            W.ll(window.parent),
            P.create_StringInt_map(["button", "share"], s, s),
            "*",
        );
    },
    $S: 6,
};
HtmlRenderer.jD.prototype = {
    $1(a) {
        C.U.fg(window, this.a, "_blank");
    },
    $S: 6,
};
HtmlRenderer.send_win_data.prototype = {
    $0() {
        var s = 0,
            r = P._makeAsyncAwaitCompleter(t.P),
            p,
            win_data,
            n;
        var $async$$0 = P._wrapJsFunctionForAsync((a, b) => {
            if (a === 1) return P.async_rethrow(b, r);
            while (true)
                switch (s) {
                    case 0:
                        n = t.z;
                        s = 2;
                        // return P._asyncAwait(P.future_future_delayed(P.duration_milsec_sec(1, 0), n), $async$$0)
                        return P._asyncAwait(
                            P.future_future_delayed(P.duration_milsec_sec(0, 0), n),
                            $async$$0,
                        );
                    // break
                    case 2:
                        p = HtmlRenderer.rV(this.b, this.c);
                        win_data = P.create_StringInt_map(
                            [
                                "winners",
                                this.d,
                                "all",
                                this.a.z,
                                "pic",
                                p.toDataURL("image/png", null),
                                "firstKill",
                                this.e.e,
                            ],
                            n,
                            n,
                        );
                        // send win_data to parent
                        J.m0(W.ll(window.parent), win_data, "*");
                        // if (from_node) {
                        //     // 怎么着输出一下 win_data
                        // }
                        return P._asyncReturn(null, r);
                }
        });
        return P._asyncStartSync($async$$0, r);
    },
    $S: 40,
};
HtmlRenderer.PlrGroup.prototype = {
    e3(a, b, c) {
        var s, r, q, p;
        if (b || c) this.b = HtmlRenderer.add_div("plrg_body_gouped");
        else this.b = HtmlRenderer.add_div("plrg_body");
        for (s = J.by(a), r = this.a; s.u();) {
            q = s.gC();
            if (J.aw(q) < 2) return;
            p = HtmlRenderer.t7(this, q, c);
            r.appendChild(p.f);
            this.b.appendChild(p.r);
        }
    },
};
HtmlRenderer.PlrView.prototype = {
    da() {
        var s = this.b;
        if (s != null) s.da();
        else ++this.d;
    },
    dc(a) {
        var s = this.b;
        if (s != null) s.dc(a);
        else this.c = this.c + a;
    },
    cP(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            h = null,
            g = '<div class="plr_body ',
            f = '<div class="name"> ',
            e = "beforeend";
        this.cy = "pid" + this.cx;
        if (c) this.r = HtmlRenderer.add_div("plr1");
        else this.r = HtmlRenderer.add_div("plr0");
        s = J.a3(b);
        this.db = s.h(b, 0);
        this.dx = s.h(b, 1);
        $.ay.m(0, this.db, this);
        this.fy = s.h(b, 2);
        this.dy = s.h(b, 3);
        r = this.y;
        if (c) r.textContent = " " + H.as_string(this.db) + " ";
        else r.textContent = " " + H.as_string(this.dx) + " ";
        r = this.x;
        r.toString;
        q = Sgls.o6(this.fy);
        r.classList.add(q);
        if (J.nz(this.fy, $.aD()))
            this.y.textContent = " " + H.as_string(this.dx) + " ";
        p = s.h(b, 4);
        o = J.m_(p, "+");
        if (o > -1) {
            r = this.go = P.oF(C.String.af(p, 0, o));
            p = C.String.ay(p, o);
        } else {
            r = this.go = P.oF(s.h(b, 4));
            p = h;
        }
        n = "" + C.d.R(r / 4) + "px";
        r = this.z;
        q = r.style;
        q.width = n;
        q = this.r;
        q.appendChild(this.x);
        q.appendChild(this.y);
        m = J.m_(this.dy, "+");
        if (m > -1) {
            q = this.r;
            l = HtmlRenderer.add_span("small");
            l.textContent = J.nB(this.dy, m);
            q.appendChild(l);
            this.r.appendChild(document.createTextNode(" "));
        }
        this.fr =
            g +
            this.cy +
            '">' +
            H.as_string(this.x.outerHTML) +
            f +
            C.o.ab(this.dx) +
            " </div></div>";
        this.fx =
            g +
            this.cy +
            '">' +
            H.as_string(this.x.outerHTML) +
            f +
            C.o.ab(this.dx) +
            ' </div><div class="maxhp" style="width: ' +
            n +
            '" /></div>';
        if (c) {
            k = HtmlRenderer.add_div("detail");
            q = this.r;
            l = LangData.get_lang("BxJN") + (" " + H.as_string(this.go));
            j = document;
            q.appendChild(j.createTextNode(l));
            if (p != null) {
                q = this.r;
                l = HtmlRenderer.add_span("small");
                l.textContent = p;
                q.appendChild(l);
            }
            this.r.appendChild(k);
            this.r.appendChild(j.createElement("br"));
            d.a = 5;
            C.h.cJ(
                k,
                H.oO(LangData.get_lang("ezfN"), "[]", new HtmlRenderer.jV(d, b), h),
            );
            // if (!J.Y(s.h(b, 12), "")) {
            if (s.h(b, 12) !== "") {
                switch (s.h(b, 12)) {
                    case "2":
                        C.h.bk(k, e, C.String.B(" ", $.qC()), h, $.bV());
                        break;
                    case "1":
                        C.h.bk(k, e, C.String.B(" ", $.qB()), h, $.bV());
                        break;
                    case "0":
                        C.h.bk(k, e, C.String.B(" ", $.qA()), h, $.bV());
                        break;
                    default:
                        C.h.bk(k, e, C.String.B(" ", $.qv()), h, $.bV());
                }
            }
        }
        s = t.A;
        this.x = s.a(this.x.cloneNode(true));
        s = s.a(this.y.cloneNode(true));
        this.y = s;
        s.textContent = " " + H.as_string(this.dx) + " ";
        s = this.f;
        s.appendChild(this.x);
        s.appendChild(this.y);
        r.appendChild(this.Q);
        r.appendChild(this.ch);
        s.appendChild(r);
        this.bU(this.go);
    },
    bU(a) {
        var s, r, q;
        this.go = a;
        s = "" + C.d.R(a / 4) + "px";
        r = this.Q.style;
        r.width = s;
        r = this.ch.style;
        r.width = s;
        r = this.f;
        if (a <= 0) {
            r = r.style;
            r.toString;
            C.i.d4(r, C.i.cU(r, "opacity"), "0.5", "");
        } else {
            q = r.style;
            q.toString;
            C.i.d4(q, C.i.cU(q, "opacity"), "", "");
            r = r.style;
            r.display = "";
        }
    },
};
HtmlRenderer.jV.prototype = {
    $1(a) {
        // return HtmlRenderer.t9(J.J(this.b, this.a.a++))
        return HtmlRenderer.t9(this.b[this.a.a++]);
    },
    $S: 17,
};
HtmlRenderer.fW.prototype = {};
HtmlRenderer._renderItem.prototype = {
    $1(a) {
        // _renderItem
        var s, r, q;
        if (a instanceof T.NPlr) return $.ay.h(0, a.a).fr;
        if (a instanceof T.HPlr) {
            s = $.ay.h(0, a.a);
            s.bU(a.d);
            a.b = s.cy;
            this.a.push(a);
            return s.fx;
        }
        if (a instanceof T.DPlr) {
            s = $.ay.h(0, a.a);
            r = this.b.e;
            if (r != null) {
                r = r.gb2();
                s.e = r;
                q = $.ay;
                s.toString;
                q.h(0, r).da();
            }
            s.bU(0);
            this.a.push(a);
            return s.fr;
        }
        if (a instanceof T.MPlr) {
            s = $.ay.h(0, a.a);
            s.bU(a.b);
            r = "" + C.d.R(a.c / 4) + "px";
            q = s.z.style;
            q.width = r;
            s.fx =
                '<div class="plr_body ' +
                s.cy +
                '"><div class="sgl ' +
                H.as_string(Sgls.o6(s.fy)) +
                '"></div>' +
                H.as_string(s.y.outerHTML) +
                '<div class="maxhp" style="width: ' +
                r +
                '" /></div>';
            return s.fr;
        }
        if (a instanceof T.HDamage)
            return '<div class="damage">' + H.as_string(a.a) + "</div>";
        if (a instanceof T.HRecover)
            return '<div class="recover">' + H.as_string(a.a) + "</div>";
        return J.b4(a);
    },
    $S: 42,
};
HtmlRenderer.lq.prototype = {
    $1(a) {
        var s,
            q = a.cF(0);
        if (q === "[0]") return this.a.$1(this.b.e);
        else if (q === "[1]") return this.a.$1(this.b.f);
        else if (q === "[2]") return this.a.$1(this.b.x);
        else {
            s = J.aQ(q);
            if (this.b instanceof T.RunUpdateCancel)
                return '<span class="sctext">' + s.af(q, 1, q.length - 1) + "</span>";
            else return '<span class="stext">' + s.af(q, 1, q.length - 1) + "</span>";
        }
    },
    $S: 17,
};
Sgls.k7.prototype = {
    $2(a, b) {
        var s,
            r,
            q = "data:image/gif;base64," + H.as_string(b),
            p = $.e_;
        $.e_ = p + 1;
        s = "icon_" + p;
        r = H.as_string(a) + "@!";
        $.k8.m(0, r, s);
        $.mg.m(0, r, q);
        if (!run_env.from_code) {
            t.w
                .a(C.v.gbl(document.styleSheets))
                .insertRule(
                    "div." + s + ' { background-image:url("' + q + '"); }',
                    $.e_ - 1,
                );
        }
    },
    $S: 65,
};
Sgls.k4.prototype = {
    $0() {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h = new Array($.d7());
        h.fixed$length = Array;
        s = H.b(h, t.gt);
        for (h = t.he, r = 0; (q = $.d7()), r < q; ++r) {
            q = new Array(q);
            q.fixed$length = Array;
            q = H.b(q, h);
            s[r] = q;
            q[r] = 0;
        }
        for (r = 1; r < $.d7(); ++r)
            for (p = 0; p < r; ++p) {
                h = $.mf;
                q = h[r];
                o = q[0];
                h = h[p];
                n = h[0];
                m = (o - n) * 0.3;
                l = (q[1] - h[1]) * 0.4;
                k = (q[2] - h[2]) * 0.25;
                j = o * 0.15 + o * 0.25 + o * 0.1 - (n * 0.15 + n * 0.25 + n * 0.1);
                i = Math.sqrt(m * m + l * l + k * k + j * j);
                J.lT(s[p], r, i);
                J.lT(s[r], p, i);
            }
        return s;
    },
    $S: 44,
};
Sgls.k5.prototype = {
    $1(a) {
        return (((a ^ 6) >>> 0) * 99 + 218) & 255;
    },
    $S: 2,
};
Sgls.k6.prototype = {
    $1(a) {
        var s,
            r,
            q,
            o = this.a;
        if (o.length > 0)
            if (a === this.b) {
                s = this.c;
                s = s[0] !== s[1];
            } else s = false;
        else s = false;
        if (s) return true;
        // if (J.J(J.J($.nv(), a), p.b) < 90)
        if ($.nv()[a][this.b] < 90) {
            return false;
        }
        for (s = o.length, r = 0; r < s; ++r) if (o[r] === a) return true;
        for (r = 0; r < o.length; o.length === s || (0, H.F)(o), ++r) {
            q = o[r];
            // if (J.J(J.J($.nv(), a), q) < 90) {
            if ($.nv()[a][q] < 90) {
                return false;
            }
        }
        return true;
    },
    $S: 45,
};
LangData.lA.prototype = {
    $2(a, b) {
        if (typeof b == "string" && !C.String.w(b, "<") && !C.String.w(b, ">"))
            $.od.m(0, LangData.eQ(H.lg(a)), b);
    },
    $S: 23,
};
Sgls.MList.prototype = {
    j(a, b) {
        var s, r, q;
        if (b.a === this) return;
        if (b.ga4() === 1 / 0 || this.b === this) {
            this.bH(this.c, b);
            return;
        }
        s = b.ga4();
        r = t.gl;
        if (r.a(this.c).ga4() <= s) {
            this.bH(this.c, b);
            return;
        }
        q = r.a(this.b);
        while (true) {
            if (q.ga4() > s) {
                this.bH(q.c, b);
                return;
            }
            q = r.a(q.b);
        }
        this.bH(this.c, b);
    },
    U(a, b) {
        if (b.a !== this) return false;
        this.d8(b);
        return true;
    },
    ga0(a) {
        return new Sgls.a_(this, this.b, this.$ti.i("a_<1*>"));
    },
    gp(a) {
        return this.a;
    },
    ah(a) {
        var s,
            r,
            p = this.b;
        for (s = this.$ti.i("1*"); p !== this; p = r) {
            s.a(p);
            r = p.gaE();
            p.sc8(null);
            p.sbq(null);
            p.saE(null);
        }
        this.c = this;
        this.b = this;
        this.a = 0;
    },
    gbv(a) {
        return this.a === 0;
    },
    bH(a, b) {
        var s;
        if (b.a != null)
            throw H.wrap_expression(P.cd("MEntry is already in a MList"));
        b.a = this;
        s = a.gaE();
        s.sbq(b);
        b.c = a;
        b.b = s;
        a.saE(b);
        ++this.a;
    },
    d8(a) {
        a.b.sbq(a.c);
        a.c.saE(a.b);
        --this.a;
        a.a = null;
    },
    gaE() {
        return this.b;
    },
    saE(a) {
        return (this.b = a);
    },
    sbq(a) {
        return (this.c = a);
    },
};
Sgls.a_.prototype = {
    gC() {
        return this.b;
    },
    u() {
        var r = this.c;
        if (r === this.a) {
            this.b = null;
            return false;
        }
        this.$ti.i("1*").a(r);
        this.b = r;
        this.c = r.gaE();
        if (this.b.gc8() == null) return this.u();
        return true;
    },
};
Sgls.MEntry.prototype = {
    // MARK: sortId
    ga4() {
        return 1e4; // 10000
    },
    D() {
        var s = this.a;
        if (s != null) s.d8(this);
    },
    gc8() {
        return this.a;
    },
    gaE() {
        return this.b;
    },
    sc8(a) {
        return (this.a = a);
    },
    saE(a) {
        return (this.b = a);
    },
    sbq(a) {
        return (this.c = a);
    },
};
T.SklAbsorb.prototype = {
    au(a, b) {
        var s;
        if (b) {
            s = this.r;
            if (s.fy - s.fx < $.at()) return false;
        }
        return this.aX(a, b);
    },
    v(a, b, c, d) {
        var s = a[0].a,
            r = T.getAt(this.r, true, c),
            q = $.ph();
        // sklAbsorb
        // [0]发起[吸血攻击]
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("FfpA"),
                this.r,
                s,
                null,
                null,
                1,
                1000,
                100,
            ),
        );
        s.a3(r * q, true, this.r, T.v6(), c, d);
    },
};
T.SklAccumulate.prototype = {
    au(a, b) {
        var s;
        if (this.fr.a != null) return false;
        if (b) {
            s = this.r;
            if (s.fx < $.cZ()) return false;
            if (s.r2.h(0, $.lN()) != null) return false;
        }
        return this.aX(a, b);
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var r = null,
            q = LangData.get_lang("zEuN"),
            p = this.r,
            o = d.a;
        o.push(T.RunUpdate_init(q, p, p, r, r, 1, 1000, 100));
        this.r.rx.j(0, this.fr);
        this.r.r2.m(0, $.lN(), this);
        if (this.r.r2.J(0, $.a7())) {
            this.fx = this.fx + 1;
            q = this.r;
            q.l = q.l + $.pM();
        }
        this.r.F();
        q = this.r;
        q.l = q.l + $.lM();
        q = C.String.B(LangData.get_lang("gIKN"), $.qu());
        p = this.r;
        o.push(T.RunUpdate_init(q, p, p, r, r, 0, 1000, 100));
    },
    ar(a) {
        a.id = a.id * this.fx;
    },
    gT() {
        return 1;
    },
    K(a, b) {
        var s;
        this.fr.D();
        this.r.r2.U(0, $.lN());
        this.r.F();
        if (a != null) {
            s = b.a;
            s.push($.K());
            s.push(T.RunUpdateCancel_init(LangData.get_lang("xrNA"), a, this.r));
        }
        this.fx = $.pi();
    },
    $ix: 1,
};
T.SklAssassinate.prototype = {
    au(a, b) {
        if (b && this.r.r2.J(0, $.bT())) return false;
        return this.aX(a, b);
    },
    as(a, b) {
        if (b) return a.fx > $.eU();
        return true;
    },
    a9(a, b, c) {
        return this.bx(a, b, c, true);
    },
    aa(a, b, c) {
        if (this.fy != null) return H.b([], t.F);
        return this.dU(0, b, c);
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            o = null,
            n = this.fy;
        if (n == null) {
            this.fy = a[0].a;
            d.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("RmAN"),
                    this.r,
                    this.fy,
                    o,
                    o,
                    1,
                    1000,
                    100,
                ),
            );
            this.r.x1.j(0, this.fr);
            n = this.r;
            n.l = n.l + n.dx * $.B();
            n = n.r2.J(0, $.a7());
            s = this.r;
            if (n) s.l = s.l + $.p8();
            else s.G.j(0, this.fx);
        } else {
            this.ah(0);
            if (n.fx > 0) {
                s = d.a;
                s.push(
                    T.RunUpdate_init(
                        LangData.get_lang("iLaN"),
                        this.r,
                        n,
                        o,
                        o,
                        1,
                        1000,
                        100,
                    ),
                );
                r = T.getAt(this.r, true, c);
                q = T.getAt(this.r, true, c);
                if (q > r) r = q;
                q = T.getAt(this.r, true, c);
                if (q > r) r = q;
                if (n.a7($.d2(), c)) {
                    // dodge (通用回避)
                    // [0][回避]了攻击
                    s.push(
                        T.RunUpdate_init(
                            LangData.get_lang("BtqN"),
                            n,
                            this.r,
                            o,
                            o,
                            0,
                            1000,
                            100,
                        ),
                    );
                    return;
                }
                n.bN(r * $.mZ(), true, this.r, T.ad(), c, d);
            }
        }
    },
    aD(a, b, c, d) {
        // postDamage
        var s = d.a;
        s.push($.K());
        // sklAssassinateFailed
        // [0]的[潜行]被识破
        s.push(T.RunUpdateCancel_init(LangData.get_lang("kMgn"), this.r, this.fy));
        this.ah(0);
    },
    aN(a, b, c, d) {
        var s = this.fy;
        if (s != null && s.fx > 0) return this;
        else this.ah(0);
        return null;
    },
    ah(a) {
        this.fy = null;
        this.fx.D();
        this.fr.D();
    },
};
T.BerserkState.prototype = {
    gT() {
        return -1;
    },
    b9(a) {
        return a.b5(this.r.y.a.e);
    },
    a9(a, b, c) {
        return c.gbo() * a.H;
    },
    aN(a, b, c, d) {
        return this;
    },
    aP(a) {
        this.r.r2.m(0, $.aJ(), this);
        this.r.x1.j(0, this);
    },
    K(a, b) {
        var s;
        this.D();
        this.r.r2.U(0, $.aJ());
        if (this.r.fx > 0) {
            s = b.a;
            s.push($.K());
            // sklBerserkEnd
            // [1]从[狂暴]中解除
            s.push(T.RunUpdateCancel_init(LangData.get_lang("cHVa"), a, this.r));
        }
    },
    v(a, b, c, d) {
        var s, r, q;
        this.fr = this.fr - 1;
        s = a[0].a;
        r = T.getAt(this.r, false, c);
        q = $.eV();
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("UeAn"),
                this.r,
                s,
                null,
                null,
                0,
                1000,
                100,
            ),
        );
        s.a3(r * q, false, this.r, T.ad(), c, d);
        if (this.fr == 0) this.K(null, d);
    },
    $ix: 1,
    $iaV: 1,
};
T.SklBerserk.prototype = {
    as(a, b) {
        if (b) {
            if (a.r2.h(0, $.aJ()) != null) return false;
            return !(a instanceof T.Minion);
        }
        return true;
    },
    a9(a, b, c) {
        var s = this.bC(a, b, c),
            r = a.r2;
        return r.h(0, $.aJ()) != null || r.h(0, $.aE()) != null ? s / $.eV() : s;
    },
    v(a, b, c, d) {
        var s = a[0].a,
            r = T.getAt(this.r, true, c);
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("wnjN"),
                this.r,
                s,
                null,
                null,
                1,
                1000,
                100,
            ),
        );
        s.a3(r, true, this.r, T.v7(), c, d);
    },
};
T.SklCharge.prototype = {
    au(a, b) {
        if (this.r.r2.J(0, $.a7())) return false;
        if (b) if (this.r.fx < $.ci()) return false;
        return this.aX(a, b);
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var r = LangData.get_lang("yUxA"),
            q = this.r;
        d.a.push(T.RunUpdate_init(r, q, q, null, null, 1, 1000, 100));
        this.fy = this.fy + $.t();
        this.r.x2.j(0, this.fx);
        this.r.rx.j(0, this.fr);
        this.r.r2.m(0, $.a7(), this);
        this.r.F();
        q = this.r;
        q.go = q.go + $.at();
    },
    at(a, b) {
        var s = this.fy - 1;
        this.fy = s;
        if (s <= 0) this.K(null, b);
    },
    ar(a) {
        a.id = a.id * $.B();
    },
    gT() {
        return 1;
    },
    K(a, b) {
        var s;
        this.fx.D();
        this.fr.D();
        this.r.r2.U(0, $.a7());
        this.r.F();
        if (a != null) {
            s = b.a;
            s.push($.K());
            s.push(T.RunUpdateCancel_init(LangData.get_lang("WNcn"), a, this.r));
        }
    },
    $ix: 1,
};
T.CharmState.prototype = {
    gT() {
        return -1;
    },
    ar(a) {
        this.x.z = this.r;
    },
    at(a, b) {
        var s = this.z - 1;
        this.z = s;
        if (s === 0) this.K(null, b);
    },
    aP(a) {
        var r = this.x;
        r.r2.m(0, $.aE(), this);
        r.rx.j(0, this);
        r.x2.j(0, this.y);
        r.F();
    },
    K(a, b) {
        var s, r;
        this.D();
        s = this.x;
        s.r2.U(0, $.aE());
        this.y.D();
        s.F();
        if (s.fx > 0) {
            r = b.a;
            r.push($.K());
            r.push(T.RunUpdateCancel_init(LangData.get_lang("EsXa"), a, s));
        }
    },
    $ix: 1,
};
T.SklCharm.prototype = {
    as(a, b) {
        var s;
        if (b) {
            s = a.r2;
            if (s.J(0, $.aE()) && t.o.a(s.h(0, $.aE())).z > 1) return false;
        }
        return true;
    },
    a9(a, b, c) {
        var s = this.bZ(a, b, c, true),
            r = a.r2;
        return r.h(0, $.aE()) != null || r.h(0, $.aJ()) != null ? s / $.t() : s;
    },
    v(a, b, c, d) {
        var s,
            charm_state,
            p = null,
            o = a[0].a,
            n = d.a;
        // sklCharm
        // [0]使用[魅惑]
        n.push(
            T.RunUpdate_init(
                LangData.get_lang("UUan"),
                this.r,
                o,
                p,
                p,
                1,
                1000,
                100,
            ),
        );
        if (!o.a7($.aE(), c))
            s = o.fx > 0 && !o.A && T.bW(this.r.dx, o.db + o.dy, c);
        else s = true;
        if (s) {
            // dodge (通用回避)
            // [0][回避]了攻击
            n.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    o,
                    this.r,
                    p,
                    p,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return;
        }
        charm_state = t.o.a(o.r2.h(0, $.aE()));
        if (charm_state == null) {
            charm_state = T.CharmState_init(this.r.z, o);
            charm_state.aP(0);
        } else {
            s = this.r.z;
            if (s != charm_state.r) charm_state.r = s;
            else charm_state.z = charm_state.z + 1;
        }
        if (this.r.r2.J(0, $.a7())) charm_state.z = charm_state.z + $.B();
        // sklCharmHit
        // [1]被[魅惑]了
        n.push(
            T.RunUpdate_init(
                C.String.B(LangData.get_lang("yjhn"), $.nd()),
                this.r,
                o,
                p,
                p,
                $.cZ(),
                1000,
                100,
            ),
        );
    },
};
T.MinionCount.prototype = {
    gT() {
        return 0;
    },
};
T.PlrClone.prototype = {
    gap() {
        return this.a6;
    },
    bs() {
        var s,
            r,
            q,
            p,
            o = this.k1,
            n = o.length,
            m = this.cm;
        if (n === m.k1.length)
            for (s = 0; s < n; ++s) {
                r = o[s];
                q = r.f;
                p = m.k1[s].f;
                if (q > p) r.f = p;
            }
        this.dR();
    },
    aU() {
        var s = this.cm.q;
        s = H.b(s.slice(0), H._arrayInstanceType(s));
        this.q = s;
        this.ci();
    },
    bf() {
        var s = T.lC(this.a6.a),
            r = T.lC(this.b),
            q = $.a4(); // 6
        this.x = Math.max(H.ar(s), r - q);
    },
    $ibC: 1,
};
T.SklClone.prototype = {
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            j = null;
        this.f = C.d.R((this.f * ((c.n() & 63) + $.au())) / $.cj());
        if (!this.r.r2.J(0, $.a7())) {
            s = this.r.q;
            for (r = 0; (q = $.ap()), r < q; ++r) s[r] = C.d.R(s[r] * $.p1());
            s[q] = C.d.R(s[q] * $.b0());
            q = this.r;
            q.fx = C.d.R(q.fx * $.b0());
            this.r.ci();
            this.r.F();
        }
        p = T.init_PlrClone(this.r);
        p.y = this.r.y;
        p.az();
        p.l = c.n() * $.C() + $.eX();
        q = this.r;
        p.fx = q.fx;
        if (q.fx + q.dx < c.n()) {
            q = this.f;
            o = 1;
            this.f = C.JsInt.am(q, o) + o;
        }
        q = C.Array.dl(p.k1, new T.SklCloneCallback());
        if (q != null) q.f = C.d.R(Math.sqrt(H.ar(this.f)));
        // sklClone
        // [0]使用[分身]
        q = LangData.get_lang("yWWn");
        o = new T.MPlr();
        o.cO(this.r);
        n = d.a;
        n.push(T.RunUpdate_init(q, o, this.r, j, j, $.a6(), 1000, 100));
        this.r.y.aZ(p);
        // sklCloned
        // 出现一个新的[1]
        o = LangData.get_lang("pKQn");
        q = this.r;
        m = p.fx;
        l = new T.HPlr(m);
        l.a = p.e;
        l.d = m;
        n.push(T.RunUpdate_init(o, q, l, j, j, 0, 1000, 100));
    },
};
T.SklCloneCallback.prototype = {
    $1(a) {
        return a instanceof T.SklClone;
    },
    $S: 46,
};
T.SklCritical.prototype = {
    v(a, b, c, d) {
        var r = a[0].a,
            q = T.getAt(this.r, false, c) * $.pf(),
            p = T.getAt(this.r, false, c) * $.eV();
        if (p > q) q = p;
        p = T.getAt(this.r, false, c) * $.pg();
        if (p > q) q = p;
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("mFkn"),
                this.r,
                r,
                null,
                null,
                1,
                1000,
                100,
            ),
        );
        r.a3(q, false, this.r, T.ad(), c, d);
    },
};
T.CurseState.prototype = {
    gT() {
        return -1;
    },
    aq(a, b, c, d, e) {
        if (a > 0 && (d.n() & 63) < this.z) {
            // sklCurseDamage
            // [诅咒]使伤害加倍
            e.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("wTSa"),
                    this.r,
                    this.x,
                    null,
                    null,
                    0,
                    1000,
                    100,
                ),
            );
            a *= this.Q;
        }
        return a;
    },
    ar(a) {
        a.N = a.N * $.C();
    },
    K(a, b) {
        var s, r;
        this.D();
        s = this.x;
        s.r2.U(0, $.bh());
        s.rx.U(0, this.y);
        s.F();
        if (s.fx > 0) {
            r = b.a;
            r.push($.K());
            // sklCurseEnd
            // [1]从[诅咒]中解除
            r.push(T.RunUpdateCancel_init(LangData.get_lang("yULA"), a, s));
        }
    },
    $ix: 1,
};
T.SklCurse.prototype = {
    as(a, b) {
        var s;
        if (b) {
            if (!(a.fx < $.b3())) {
                s = a.r2;
                s = s.J(0, $.bh()) && t.dK.a(s.h(0, $.bh())).z > $.at();
            } else s = true;
            if (s) return false;
        }
        return true;
    },
    a9(a, b, c) {
        var s = this.bC(a, b, c);
        return a.r2.h(0, $.bh()) != null ? s / $.t() : s;
    },
    // act
    v(a, b, c, d) {
        var s = a[0].a;
        const atp = T.getAt(this.r, true, c);
        // sklCurse
        // [0]使用[诅咒]
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("AqCN"),
                this.r,
                s,
                null,
                null,
                1,
                1000,
                100,
            ),
        );

        s.a3(atp, true, this.r, T.v9(), c, d);
        // target.attacked(atp, true, owner, onDamage, r, updates);
    },
};
T.SklDisperse.prototype = {
    a9(a, b, c) {
        var s = this.bC(a, b, c);
        return b && a instanceof T.Minion && a.fx > $.ci() ? s * $.t() : s;
    },
    v(a, b, c, d) {
        var r = null,
            q = "Dt.shield",
            p = a[0].a,
            o = T.getAt(this.r, true, c),
            n = d.a;
        // sklDisperse [0]使用[净化]
        n.push(
            T.RunUpdate_init(
                LangData.get_lang("cDPa"),
                this.r,
                p,
                r,
                r,
                $.as(),
                1000,
                100,
            ),
        );
        if (p.a7($.lP(), c)) {
            // dodge (通用回避)
            // [0][回避]了攻击
            n.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    p,
                    this.r,
                    r,
                    r,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return;
        }
        n = p.r2;
        if (n.J(0, q)) n.h(0, q).K(this.r, d);
        if (n.J(0, "Dt.iron")) n.h(0, "Dt.iron").K(this.r, d);
        if (p instanceof T.Minion) p.bN(o * $.pw(), true, this.r, T.oI(), c, d);
        else p.bN(o, true, this.r, T.oI(), c, d);
    },
};
T.SklExchange.prototype = {
    as(a, b) {
        if (b) return a.fx - this.r.fx > $.at();
        return a.fx > this.r.fx;
    },
    a9(a, b, c) {
        var s = this.bZ(a, b, c, true);
        return b ? s * a.fx : s;
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = null;
        this.f = C.JsInt.P(this.f + 1, $.t());
        s = a[0].a;
        r = d.a;
        r.push(
            T.RunUpdate_init(
                LangData.get_lang("fcfa"),
                this.r,
                s,
                k,
                k,
                1,
                1000,
                100,
            ),
        );
        if (!s.a7($.d3(), c))
            q =
                s.fx > 0 &&
                !s.A &&
                !this.r.r2.J(0, $.a7()) &&
                T.bW(this.r.dx, s.dy + s.cx + s.db, c);
        else q = true;
        if (q) {
            // dodge (通用回避)
            // [0][回避]了攻击
            r.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    s,
                    this.r,
                    k,
                    k,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return;
        }
        if (this.r.r2.J(0, $.a7())) {
            q = this.r;
            q.l = q.l + s.l;
            s.l = 0;
        }
        q = this.r;
        p = q.fx;
        o = s.fx;
        q.fx = o;
        s.fx = p;
        n = q.fx;
        m = q.fy;
        if (n > m) q.fx = m;
        q = C.String.B(LangData.get_lang("RQta"), $.qD());
        n = this.r;
        m = new T.HPlr(p);
        m.a = n.e;
        m.d = n.fx;
        n = new T.HPlr(o);
        n.a = s.e;
        n.d = s.fx;
        r.push(T.RunUpdate_init(q, m, n, k, k, (o - p) * $.t(), 1000, 100));
        s.cr(o - s.fx, o, this.r, c, d);
    },
};
T.FireState.prototype = {
    gT() {
        return -1;
    },
};
T.SklFire.prototype = {
    v(a, b, c, d) {
        var s,
            r,
            q,
            p = a[0].a,
            o = t.a.a(p.r2.h(0, $.eY()));
        if (o == null) o = new T.FireState($.ao());
        s = T.getAt(this.r, true, c);
        r = $.mM();
        q = o.b;
        // sklFire
        // [0]使用[火球术]
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("mAoA"),
                this.r,
                p,
                null,
                null,
                1,
                1000,
                100,
            ),
        );
        p.a3(s * (r + q), true, this.r, T.oJ(), c, d);
        // target.attacked(atp, true, owner, onFire, r, updates);
    },
};
T.sklHalf.prototype = {
    as(a, b) {
        var s;
        if (b) {
            s = a.fx;
            return s > $.eU() && s < $.lM();
        }
        return true;
    },
    a9(a, b, c) {
        return this.bx(a, b, c, true) * a.fx;
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            h = null,
            g = a[0].a,
            f = d.a;
        f.push(
            T.RunUpdate_init(
                LangData.get_lang("lSVA"),
                this.r,
                g,
                h,
                h,
                1,
                1000,
                100,
            ),
        );
        s = this.r.fr + C.JsInt.P($.pG() - g.fx, $.B());
        r = 0;
        if (s < r) s = r;
        if (!g.a7($.eZ(), c))
            q =
                g.fx > 0 && !g.A && !this.r.r2.J(0, $.a7()) && T.bW(s, g.dy + g.db, c);
        else q = true;
        if (q) {
            // dodge (通用回避)
            // [0][回避]了攻击
            f.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    g,
                    this.r,
                    h,
                    h,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return;
        }
        p = g.fx;
        q = this.r;
        o = q.dx;
        n = g.dy;
        m = $.t();
        l = C.JsInt.P(o - C.JsInt.P(n, m), m) + $.pL();
        if (q.r2.J(0, $.a7())) l = this.r.dx + $.b1();
        k = $.q7();
        if (l > k) l = k;
        q = g.fx;
        o = $.ci();
        o = C.d.R((q * (o - l)) / o);
        g.fx = o;
        j = p - o;
        o = LangData.get_lang("Hxra");
        q = this.r;
        n = new T.HPlr(p);
        n.a = g.e;
        n.d = g.fx;
        f.push(T.RunUpdate_init(o, q, n, new T.HDamage(l), h, j, 1000, 100));
        if (j > 0) g.cr(j, p, this.r, c, d);
    },
};
T.HasteState.prototype = {
    gT() {
        return 1;
    },
    ar(a) {
        var s = this.x;
        s.cy = s.cy * this.z;
    },
    at(a, b) {
        var s = this.Q - 1;
        this.Q = s;
        if (s === 0) this.K(null, b);
    },
    K(a, b) {
        var s, r;
        this.D();
        s = this.x;
        s.r2.U(0, $.d4());
        this.y.D();
        s.F();
        if (s.fx > 0) {
            r = b.a;
            r.push($.K());
            // sklHasteEnd
            // [1]从[疾走]中解除
            r.push(T.RunUpdateCancel_init(LangData.get_lang("wlqa"), a, s));
        }
    },
    $ix: 1,
};
T.SklHaste.prototype = {
    b9(a) {
        return a.b5(this.r.z.f);
    },
    as(a, b) {
        var s;
        if (b) {
            if (a.fx < $.a6()) return false;
            s = a.r2;
            if (
                s.h(0, $.d4()) != null &&
                (t.e_.a(s.h(0, $.d4())).Q + 1) * $.a6() > a.fx
            )
                return false;
            return !(a instanceof T.Minion);
        }
        return true;
    },
    a9(a, b, c) {
        var s;
        if (b) {
            s = T.rateHiHp(a) * a.M;
            return a.r2.h(0, $.d4()) != null ? s / $.C() : s;
        }
        return c.gbo();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            o = null,
            n = a[0].a,
            m = d.a;
        m.push(
            T.RunUpdate_init(
                LangData.get_lang("pHka"),
                this.r,
                n,
                o,
                o,
                $.a6(),
                1000,
                100,
            ),
        );
        s = this.r;
        s.l = s.l + s.cy;
        s = n.r2;
        r = t.e_.a(s.h(0, $.d4()));
        if (r == null) {
            r = new T.HasteState(n, $.t(), $.B());
            r.y = new T.PostActionImpl(r);
            s.m(0, $.d4(), r);
            n.rx.j(0, r);
            n.x2.j(0, r.y);
            n.F();
        } else r.Q = r.Q + $.t();
        if (this.r.r2.J(0, $.a7())) {
            s = r.z;
            q = $.t();
            r.z = s + q;
            r.Q = r.Q + q;
        }
        m.push(
            T.RunUpdate_init(
                C.String.B(LangData.get_lang("DDWN"), $.qE()),
                this.r,
                n,
                o,
                o,
                0,
                1000,
                100,
            ),
        );
    },
};
T.SklHeal.prototype = {
    b9(a) {
        return a.b5(this.r.z.f);
    },
    as(a, b) {
        if (b) return a.fx + $.b3() < a.fy;
        return a.fx < a.fy;
    },
    a9(a, b, c) {
        var s = {};
        if (b) {
            s.a = a.fy - a.fx;
            a.r2.aw(0, new T.SklHealCallback(s));
            return (s.a = s.a * a.M);
        }
        return c.gbo();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = this.f;
        if (k > $.av()) this.f = k - 1;
        s = a[0].a;
        r = C.d.R(T.getAt(this.r, true, c) / $.pQ());
        q = s.fy - s.fx;
        if (r > q) r = q;
        k = d.a;
        // sklHeal
        // [0]使用[治愈魔法]
        k.push(
            T.RunUpdate_init(
                LangData.get_lang("Yiea"),
                this.r,
                s,
                null,
                null,
                r,
                1000,
                100,
            ),
        );
        p = s.fx;
        s.fx = p + r;
        // recover
        // [1]回复体力[2]点
        o = LangData.get_lang("imin");
        n = this.r;
        m = new T.HPlr(p);
        m.a = s.e;
        m.d = s.fx;
        k.push(T.RunUpdate_init(o, n, m, new T.HRecover(r), null, 0, 1000, 100));
        s.bL(this.r, d);
    },
};
T.SklHealCallback.prototype = {
    $2(a, b) {
        var s;
        if (b.gT() < 0) {
            s = this.a;
            s.a = s.a + $.au();
        }
    },
    $S: 16,
};
T.IceState.prototype = {
    gT() {
        return -1;
    },
    ar(a) {
        a.A = true;
    },
    fo(a, b, c) {
        var s,
            q = 0;
        if (a > q) {
            s = this.y;
            if (s > q) {
                this.y = s - a;
                return q;
            } else if (a + this.r.l >= $.bx()) {
                this.K(null, c);
                return 0;
            }
        }
        return a;
    },
    K(a, b) {
        var s, r;
        this.D();
        s = this.r;
        s.r2.U(0, $.bS());
        this.x.D();
        s.F();
        if (s.fx > 0) {
            r = b.a;
            r.push($.K());
            r.push(T.RunUpdateCancel_init(LangData.get_lang("aQYN"), a, s));
        }
    },
    $ix: 1,
};
T.SklIce.prototype = {
    a9(a, b, c) {
        var s = this.bC(a, b, c);
        return a.r2.h(0, $.bS()) != null ? s / $.t() : s;
    },
    v(a, b, c, d) {
        var s = a[0].a,
            r = T.getAt(this.r, true, c),
            q = $.p0();
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("yMvn"),
                this.r,
                s,
                null,
                null,
                1,
                1000,
                100,
            ),
        );
        s.a3(r * q, true, this.r, T.mE(), c, d);
    },
};
T.SklIron.prototype = {
    ga4() {
        return $.pJ();
    },
    au(a, b) {
        if (this.fr.a != null) return false;
        return this.aX(a, b);
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var r = null,
            q = LangData.get_lang("syPN"),
            p = this.r,
            o = d.a;
        o.push(T.RunUpdate_init(q, p, p, r, r, $.a6(), 1000, 100));
        this.r.y2.j(0, this.fr);
        this.r.x2.j(0, this.fx);
        this.r.rx.j(0, this.fy);
        this.r.r2.m(0, $.n7(), this);
        this.r.F();
        this.id = $.B();
        p = $.p3();
        q = this.r;
        this.go = p + q.dx;
        if (q.r2.J(0, $.a7())) {
            q = this.id;
            p = $.C();
            this.id = q + p;
            this.go = this.go + ($.pq() + this.r.dx * p);
        }
        q = this.r;
        q.l = q.l - $.eX();
        q = C.String.B(LangData.get_lang("RCnN"), $.qG());
        p = this.r;
        o.push(T.RunUpdate_init(q, p, p, r, r, 0, 1000, 100));
    },
    aq(a, b, c, d, e) {
        var s = 0;
        if (a > s) {
            s = this.go;
            if (a <= s) {
                a = 1;
                this.go = s - (a - a);
            } else {
                a -= s;
                this.K(b, e);
            }
            return a;
        }
        return s;
    },
    at(a, b) {
        var r = this.id - 1;
        this.id = r;
        if (r === 0) {
            this.K(null, b);
            r = this.r;
            r.l = r.l - $.d_();
        }
    },
    ar(a) {
        var s = this.r;
        s.H = s.H * $.pe();
    },
    gT() {
        return this.id;
    },
    K(a, b) {
        var s, r, q;
        this.fr.D();
        this.fx.D();
        this.fy.D();
        this.r.r2.U(0, $.n7());
        this.r.F();
        s = b.a;
        if (a != null) {
            s.push($.K());
            s.push(T.RunUpdateCancel_init(LangData.get_lang("qomn"), a, this.r));
        } else {
            s.push($.K());
            r = LangData.get_lang("GGuN");
            q = this.r;
            s.push(T.RunUpdateCancel_init(r, q, q));
        }
        this.go = this.id = 0;
    },
    $ix: 1,
};
T.PoisonState.prototype = {
    gT() {
        return -1;
    },
    at(a, b) {
        var s,
            r,
            q,
            p,
            o,
            m = this.x;
        if (m.fx > 0) {
            s = this.y;
            r = 1;
            q = this.z;
            p = (s * (r + (q - r) * $.oX())) / q;
            this.y = s - p;
            o = C.d.R(p / (m.dx + $.au()));
            // sklPoisonDamage
            // [1][毒性发作]
            b.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("nEWa"),
                    this.r,
                    m,
                    null,
                    null,
                    0,
                    1000,
                    100,
                ),
            );
            m.aF(o, this.r, T.ad(), a, b);
            m = this.z - 1;
            this.z = m;
            if (m === 0) this.K(null, b);
        }
    },
    K(a, b) {
        var s,
            r = this.x;
        r.r2.U(0, $.bT());
        this.D();
        if (r.fx > 0) {
            s = b.a;
            s.push($.K());
            // sklPoisonEnd
            // [1]从[中毒]中解除
            s.push(T.RunUpdateCancel_init(LangData.get_lang("hIga"), a, r));
        }
    },
    $ix: 1,
};
T.SklPoison.prototype = {
    v(a, b, c, d) {
        var s = a[0].a,
            r = T.getAt(this.r, true, c);
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("efnA"),
                this.r,
                s,
                null,
                null,
                1,
                1000,
                100,
            ),
        );
        s.a3(r, true, this.r, T.vb(), c, d);
    },
};
T.SklQuake.prototype = {
    gb7() {
        return $.X();
    },
    gb8() {
        return $.a4();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n = c.n() < 128 ? $.X() : $.C(),
            m = t.j,
            l = H.b([], m),
            k = 0;
        while (true) {
            if (!(k < n && k < a.length)) break;
            l.push(a[k].a);
            ++k;
        }
        s = LangData.get_lang("QQLa");
        r = this.r;
        m = H.b(l.slice(0), m);
        q = d.a;
        q.push(T.RunUpdate_init(s, r, null, null, m, 1, 1000, 100));
        for (k = 0; k < l.length; ++k) {
            m = T.getAt(this.r, true, c);
            s = $.px();
            r = l.length;
            p = $.p_();
            o = l[k];
            if (o.fx > 0) {
                q.push($.K());
                o.a3((m * s) / (r + p), true, this.r, T.ad(), c, d);
            }
        }
    },
};
T.SklRapid.prototype = {
    gb7() {
        return $.B();
    },
    gb8() {
        return $.X();
    },
    v(a, a0, a1, a2) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            f = null,
            e = 1000,
            d = a1.n() < 128 ? $.B() : $.t(),
            c = a.length,
            b = $.B();
        if (c > b) a = (a && C.Array).al(a, 0, b);
        for (c = a.length, s = 0; s < c; ++s) a[s].b = $.ao();
        r = 0;
        for (c = a2.a, q = r; q < d; ++q) {
            b = this.r;
            p = b.fx;
            o = 0;
            if (!(p > o && !b.A)) return;
            n = a[r];
            p = n.a;
            if (p.fx <= o) q -= $.b0();
            else {
                b = T.getAt(b, false, a1);
                o = $.mI();
                m = n.b;
                l = $.oY();
                n.b = m + 1;
                if (q === 0) {
                    k = LangData.get_lang("yGEA");
                    j = this.r;
                    i = new T.RunUpdate(0, e, 100, k, j, p, f, f);
                    i.aK(k, j, p, f, f, 0, e, 100);
                    c.push(i);
                } else {
                    k = LangData.get_lang("dRsa");
                    j = this.r;
                    i = 1;
                    h = new T.RunUpdate(i, e, 100, k, j, p, f, f);
                    h.aK(k, j, p, f, f, i, e, 100);
                    c.push(h);
                }
                if (p.a3(b * (o - m * l), false, this.r, T.ad(), a1, a2) <= 0) return;
                c.push($.K());
            }
            r = C.JsInt.V(r + (a1.n() & 3), a.length);
        }
    },
};
T.SklRevive.prototype = {
    b9(a) {
        return a.b5(this.r.z.e);
    },
    as(a, b) {
        return a.fx <= 0 && !(a instanceof T.Minion) && !a.r2.J(0, $.iJ());
    },
    a9(a, b, c) {
        var s;
        if (b) {
            s = a.M;
            s.toString;
            return s;
        }
        return c.gbo();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = null;
        this.f = C.JsInt.P(this.f + 1, $.t());
        s = a[0].a;
        r = C.d.R(T.getAt(this.r, true, c) / $.pZ());
        q = s.fy;
        if (r > q) r = q;
        p = d.a;
        p.push(
            T.RunUpdate_init(
                LangData.get_lang("FXSa"),
                this.r,
                s,
                k,
                k,
                1,
                1000,
                100,
            ),
        );
        p.push(
            T.RunUpdate_init(
                C.String.B(LangData.get_lang("rFJa"), $.ng()),
                this.r,
                s,
                k,
                k,
                r + $.a6(),
                1000,
                100,
            ),
        );
        s.fx = r;
        o = s.y;
        if (!C.Array.w(o.f, s)) {
            n = o.a;
            if (!C.Array.w(n.c, s)) C.Array.j(n.c, s);
            n = n.e;
            if (!C.Array.w(n, s)) {
                m = o.f;
                if (m.length > 0) C.Array.co(n, C.Array.aT(n, C.Array.gbl(m)) + 1, s);
                else n.push(s);
            }
            C.Array.j(o.f, s);
        }
        o = LangData.get_lang("imin");
        n = this.r;
        m = new T.HPlr(0);
        m.a = s.e;
        m.d = s.fx;
        p.push(T.RunUpdate_init(o, n, m, new T.HRecover(r), k, 0, 1000, 100));
    },
};
T.SklPossess.prototype = {
    ao(a, b) {
        this.r = a;
        this.f = C.JsInt.P(b, $.t()) + $.mU();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            o = null,
            n = a[0].a,
            m = d.a;
        // sklPossess
        // [0]使用[附体]
        m.push(
            T.RunUpdate_init(
                LangData.get_lang("dxVA"),
                this.r,
                n,
                o,
                o,
                0,
                1000,
                100,
            ),
        );
        if (!n.a7($.aJ(), c)) s = n.fx > 0 && !n.A && T.bW(this.r.dx, n.dy, c);
        else s = true;
        if (s) {
            // dodge (通用回避)
            // [0][回避]了攻击
            m.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    n,
                    this.r,
                    o,
                    o,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return;
        }
        r = t.aJ.a(n.r2.h(0, $.aJ()));
        if (r == null) {
            r = T.nC(n);
            r.fr = $.C();
            r.aP(0);
        } else r.fr = r.fr + $.C();
        // sklBerserkHit
        // [1]进入[狂暴]状态
        m.push(
            T.RunUpdate_init(
                C.String.B(LangData.get_lang("jIRA"), $.nc()),
                this.r,
                n,
                o,
                o,
                0,
                1000,
                100,
            ),
        );
        m = this.r;
        q = m.fx;
        m.fx = 0;
        m.bm(q, o, c, d);
    },
};
T.PlrShadow.prototype = {
    gap() {
        return this.aj.r;
    },
    ac() {
        this.k3 = T.SklAttack_init(this);
        this.k1.push(new T.SklPossess(0));
    },
    aU() {
        var s, r;
        this.bB();
        s = this.q;
        r = $.ap();
        s[r] = C.d.P(s[r], $.t());
    },
};
T.SklShadow.prototype = {
    au(a, b) {
        if (b) if (this.r.fx < $.b3()) return false;
        return this.aX(a, b);
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },

    v(a7, a8, a9, b0) {
        var s,
            shadow_name,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d,
            c,
            b,
            a,
            a0,
            a1,
            a2,
            a3,
            a4,
            a6 = null;
        this.f = C.d.R(this.f * $.mI());
        s = b0.a;
        s.push(
            T.RunUpdate_init(
                LangData.get_lang("USvA"),
                this.r,
                a6,
                a6,
                a6,
                $.a6(),
                1000,
                100,
            ),
        );
        shadow_name = H.as_string(this.r.a) + "?" + H.as_string($.qM());
        // r = name + "?" + "shadow"
        // console.log("T.hB.v", shadow_name, a5.r.a, H.e($.qM()))
        q = this.r;
        p = q.b;
        q = q.c;
        o = 0;
        n = $.T();
        m = H.b([], t.q);
        l = H.b([], t.H);
        k = P.create_meta_map(t.X, t.W);
        j = new Sgls.MList(t.n);
        j.c = j;
        j.b = j;
        i = new Sgls.MList(t.p);
        i.c = i;
        i.b = i;
        h = new Sgls.MList(t.g);
        h.c = h;
        h.b = h;
        g = new Sgls.MList(t.G);
        g.c = g;
        g.b = g;
        f = new Sgls.MList(t._);
        f.c = f;
        f.b = f;
        e = new Sgls.MList(t.e);
        e.c = e;
        e.b = e;
        d = new Sgls.MList(t.k);
        d.c = d;
        d.b = d;
        c = new Sgls.MList(t.l);
        c.c = c;
        c.b = c;
        b = new Sgls.MList(t.m);
        b.c = b;
        b.b = b;
        a = t.i;
        a0 = H.b([], a);
        a1 = H.b([], a);
        a2 = H.b([], a);
        a = H.b([], a);
        a3 = 0;
        a4 = new T.PlrShadow(
            shadow_name,
            p,
            q,
            a6,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d,
            c,
            b,
            a0,
            a1,
            a2,
            a,
            a3,
            a3,
            a3,
            $.W(),
            a3,
        );
        a4.a1(shadow_name, p, q, a6);
        a4.a6 = new T.cp(a4);
        a4.aj = this;
        a4.e = T.getMinionName(this.r);
        a4.r = LangData.get_lang("VdSN");
        q = this.r;
        a4.y = q.y;
        q.L.j(0, a4.a6);
        a4.az();
        if (this.r.r2.J(0, $.a7())) a4.l = $.bx();
        else a4.l = -$.bx();
        this.r.y.aZ(a4);
        shadow_name = LangData.get_lang("wHun");
        q = this.r;
        p = a4.fx;
        o = new T.HPlr(p);
        o.a = a4.e;
        o.d = p;
        s.push(T.RunUpdate_init(shadow_name, q, o, a6, a6, 0, 1000, 100));
    },
};
T.SlowState.prototype = {
    gT() {
        return -1;
    },
    ar(a) {
        var s = this.x;
        s.cy = C.JsInt.P(s.cy, $.t());
    },
    at(a, b) {
        var s = this.z - 1;
        this.z = s;
        if (s === 0) this.K(null, b);
    },
    K(a, b) {
        var s, r;
        this.D();
        s = this.x;
        s.r2.U(0, $.bi());
        this.y.D();
        s.F();
        if (s.fx > 0) {
            r = b.a;
            r.push($.K());
            // sklSlowEnd
            // [1]从[迟缓]中解除
            r.push(T.RunUpdateCancel_init(LangData.get_lang("EJLN"), a, s));
        }
    },
    $ix: 1,
};
T.SklSlow.prototype = {
    as(a, b) {
        var s;
        if (b) {
            if (!(a.fx < $.b3())) {
                s = a.r2;
                s = s.J(0, $.bi()) && t.S.a(s.h(0, $.bi())).z > 1;
            } else s = true;
            if (s) return false;
        }
        return true;
    },
    a9(a, b, c) {
        var s = this.bZ(a, b, c, true);
        return a.r2.h(0, $.bi()) != null ? s / $.t() : s;
    },
    v(a, b, c, d) {
        var s,
            r,
            p = null,
            o = a[0].a,
            n = d.a;
        n.push(
            T.RunUpdate_init(
                LangData.get_lang("hdla"),
                this.r,
                o,
                p,
                p,
                1,
                1000,
                100,
            ),
        );
        if (!o.a7($.bi(), c)) s = o.fx > 0 && !o.A && T.bW(this.r.dx, o.dy, c);
        else s = true;
        if (s) {
            // dodge (通用回避)
            // [0][回避]了攻击
            n.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    o,
                    this.r,
                    p,
                    p,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return;
        }
        o.l = o.l - (o.cy + $.au());
        s = o.r2;
        r = t.S.a(s.h(0, $.bi()));
        if (r == null) {
            r = new T.SlowState(o, $.t());
            r.y = new T.PostActionImpl(r);
            s.m(0, $.bi(), r);
            o.rx.j(0, r);
            o.x2.j(0, r.y);
            o.F();
        } else r.z = r.z + $.t();
        if (this.r.r2.J(0, $.a7())) r.z = r.z + $.C();
        n.push(
            T.RunUpdate_init(
                C.String.B(LangData.get_lang("YNva"), $.qJ()),
                this.r,
                o,
                p,
                p,
                $.a6(),
                1000,
                100,
            ),
        );
    },
};
T.SklExplode.prototype = {
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            m = a[0].a,
            l = t.a.a(m.r2.h(0, $.eY()));
        if (l == null) l = new T.FireState($.ao());
        s = T.getAt(this.r, true, c);
        r = $.mZ();
        q = l.b;
        // sklExplode
        // [0]使用[自爆]
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("Ycen"),
                this.r,
                m,
                null,
                null,
                0,
                1000,
                100,
            ),
        );
        p = this.r;
        o = p.fx;
        p.fx = 0;
        m.a3(s * (r + q), true, p, T.oJ(), c, d);
        this.r.bm(o, null, c, d);
    },
};
T.PlrSummon.prototype = {
    gap() {
        return this.aj.r;
    },
    aU() {
        var s, r, q, p;
        this.bB();
        s = this.q;
        r = $.ap();
        s[r] = C.d.P(s[r], $.B());
        r = 0;
        s[r] = r;
        q = 1;
        p = this.aj.r.q;
        s[q] = p[q];
        s[$.C()] = r;
        r = $.X();
        s[r] = p[r];
    },
    ac() {
        this.k3 = T.SklAttack_init(this);
        var s = this.k1;
        s.push(new T.SklFire(0));
        s.push(new T.SklFire(0));
        s.push(new T.SklExplode(0));
    },
    bP() {
        var s;
        this.dS();
        s = this.bi;
        if (s == null) s = this.bi = new T.PostDamageImpl(this);
        this.G.j(0, s);
    },
    aD(a, b, c, d) {
        this.aR = true;
        this.aj.r.aF(C.JsInt.P(a, $.t()), b, T.ad(), c, d);
        this.aR = false;
    },
    b1(a, b, c, d) {
        var r = this.fx,
            q = 0;
        if (r > q) {
            this.fx = q;
            if (!this.aR) this.bm(r, null, c, d);
        }
        this.a6.D();
        return false;
    },
};
T.SklSummon.prototype = {
    au(a, b) {
        var s;
        if (b) if (this.r.fx < $.b3()) return false;
        s = this.fr;
        return (s == null || s.fx <= 0) && this.aX(a, b);
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a6, a7, a8, a9) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            d,
            c,
            b,
            a,
            a0,
            a1,
            summoned_plr,
            a4 = null,
            a5 = a9.a;
        // sklSummon
        // [0]使用[血祭]
        a5.push(
            T.RunUpdate_init(
                LangData.get_lang("sCza"),
                this.r,
                a4,
                a4,
                a4,
                $.a6(),
                1000,
                100,
            ),
        );
        s = this.fr;
        if (s == null) {
            s = H.as_string(this.r.a) + "?" + H.as_string($.qQ());
            r = this.r;
            q = r.b;
            r = r.c;
            p = 0;
            o = $.T();
            n = H.b([], t.q);
            m = H.b([], t.H);
            l = P.create_meta_map(t.X, t.W);
            k = new Sgls.MList(t.n);
            k.c = k;
            k.b = k;
            j = new Sgls.MList(t.p);
            j.c = j;
            j.b = j;
            i = new Sgls.MList(t.g);
            i.c = i;
            i.b = i;
            h = new Sgls.MList(t.G);
            h.c = h;
            h.b = h;
            g = new Sgls.MList(t._);
            g.c = g;
            g.b = g;
            f = new Sgls.MList(t.e);
            f.c = f;
            f.b = f;
            e = new Sgls.MList(t.k);
            e.c = e;
            e.b = e;
            d = new Sgls.MList(t.l);
            d.c = d;
            d.b = d;
            c = new Sgls.MList(t.m);
            c.c = c;
            c.b = c;
            b = t.i;
            a = H.b([], b);
            a0 = H.b([], b);
            a1 = H.b([], b);
            b = H.b([], b);
            summoned_plr = new T.PlrSummon(
                s,
                q,
                r,
                a4,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f,
                e,
                d,
                c,
                a,
                a0,
                a1,
                b,
                0,
                0,
                0,
                $.W(),
                0,
            );
            summoned_plr.a1(s, q, r, a4);
            summoned_plr.a6 = new T.cp(summoned_plr);
            summoned_plr.aj = this;
            summoned_plr.e = T.getMinionName(this.r);
            this.fr = summoned_plr;
            // sklSummonName
            // 使魔
            summoned_plr.r = LangData.get_lang("DxYn");
            summoned_plr = this.fr;
            summoned_plr.y = this.r.y;
            summoned_plr.az();
        } else {
            s.bP();
            s.bs();
            s.cn();
        }
        this.r.L.j(0, this.fr.a6);
        // this_.fr.l = a8.n() * $.C()
        this.fr.l = a8.n() * 4;
        if (this.r.r2.J(0, $.a7())) {
            this.fr.bi.D();
            this.fr.l = $.bx();
        }
        this.r.y.aZ(this.fr);
        // sklSummoned
        s = LangData.get_lang("qhOn"); // 召唤出[1]
        r = this.r;
        q = this.fr;
        p = q.fx;
        o = new T.HPlr(p);
        o.a = q.e;
        o.d = p;
        a5.push(T.RunUpdate_init(s, r, o, a4, a4, 0, 1000, 100));
    },
};
T.SklThunder.prototype = {
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            j = null,
            i = 1000,
            h = a[0].a,
            updates = d.a;
        updates.push(
            T.RunUpdate_init(LangData.get_lang("hyoA"), this.r, h, j, j, 1, i, 100),
        );
        s = $.B() + (c.n() & 3);
        r = $.ci() + this.r.db;
        for (q = 0, p = q, o = false; q < s; ++q) {
            n = this.r;
            if (n.fx > p && !n.A && h.fx > p) {
                updates.push($.K());
                if (h.fx > 0 && !h.A && T.bW(r, h.dy + h.db, c)) {
                    if (o) {
                        // sklThunderEnd
                        // [0][回避]了攻击(雷击)
                        p = LangData.get_lang("EORN");
                        n = this.r;
                        m = new T.RunUpdate(0, i, 100, p, h, n, j, j);
                        m.aK(p, h, n, j, j, 0, i, 100);
                        updates.push(m);
                    } else {
                        // dodge (通用回避)
                        // [0][回避]了攻击
                        p = LangData.get_lang("BtqN");
                        n = this.r;
                        m = new T.RunUpdate(0, i, 100, p, h, n, j, j);
                        m.aK(p, h, n, j, j, 0, i, 100);
                        updates.push(m);
                    }
                    return;
                }
                r -= $.Z();
                p = T.getAt(this.r, true, c);
                n = $.oZ();
                l = updates.length;
                m = this.r;
                m = h.aF(
                    h.aq(C.d.R((p * n) / T.d9(h, true, c)), m, T.ad(), c, d),
                    m,
                    T.ad(),
                    c,
                    d,
                );
                n = 0;
                if (m > n) o = true;
                updates[l].b = $.mR();
                p = n;
            }
        }
    },
};
T.PlrBossAokiji.prototype = {
    gan() {
        var s = $.bg();
        return H.b([s, $.lI(), s, $.Z(), $.lK(), $.C(), s, $.q5()], t.i);
    },
    ac() {
        var s, r;
        this.k3 = T.SklAttack_init(this);
        s = this.k1;
        s.push(new T.SklAokijiDefend(0));
        r = new T.SklAokijiIceAge(0);
        r.f = $.pW();
        s.push(r);
        r = new T.SklIce(0);
        r.f = $.b3();
        s.push(r);
    },
};
T.SklAokijiDefend.prototype = {
    aq(a, b, c, d, e) {
        // if (a > 0 && J.Y(c, T.mE())) {
        if (a > 0 && c === T.mE()) {
            // sklAokijiDefend
            // [0][吸收]所有冰冻伤害
            e.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("HwtN"),
                    this.r,
                    null,
                    null,
                    null,
                    a,
                    1000,
                    100,
                ),
            );
            return -a;
        }
        // return a > 0 && J.Y(c, T.oH()) ? 0 : a
        return a > 0 && c === T.oH() ? 0 : a;
    },
    W() {
        this.r.y2.j(0, this);
    },
    $iaB: 1,
};
T.SklAokijiIceAge.prototype = {
    gb7() {
        return $.X();
    },
    gb8() {
        return $.a4();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = t.j,
            l = H.b([], m);
        for (s = 0; s < a.length; ++s) l.push(a[s].a);
        // sklAokijiIceAge
        // [0]使用[冰河时代]
        r = LangData.get_lang("PRrA");
        q = this.r;
        m = H.b(l.slice(0), m);
        p = d.a;
        p.push(T.RunUpdate_init(r, q, null, null, m, 1, 1000, 100));
        o = (T.getAt(this.r, true, c) * $.mQ()) / (l.length + $.b0());
        for (s = 0; s < l.length; ++s) {
            n = l[s];
            if (n.fx > 0) {
                p.push($.K());
                n.a3(o, true, this.r, T.mE(), c, d);
            }
        }
    },
};
T.PlrBoost.prototype = {
    e1(a, b, c, d) {
        var s, r, q, p;
        for (s = $.a4(), r = this.a6; s < $.b1(); ++s) {
            q = this.t;
            p = (q[s] | $.at()) >>> 0;
            q[s] = p;
            q[s] = p + r;
        }
        for (s = $.p6(); s < $.aR(); ++s) {
            q = this.t;
            q[s] = q[s] + r;
        }
        for (s = $.mO(); s < $.iI(); ++s) {
            q = this.t;
            q[s] = q[s] + r;
        }
        for (s = $.au(); s < $.d_(); ++s) {
            q = this.t;
            p = (q[s] | $.aR()) >>> 0;
            q[s] = p;
            q[s] = p + r;
        }
    },
    a7(a, b) {
        return (b.n() & 127) < this.a6;
    },
};
T.PlrBossTest.prototype = {
    e4(a, b, c) {
        var s, r, q;
        for (s = 0; s < $.b1(); ++s) {
            r = this.t;
            q = r[s];
            if (q < $.cY()) r[s] = $.b2() - q;
        }
    },
    bf() {
        // this.x = $.ao()
        this.x = 0;
    },
};
T.PlrBossTest2.prototype = {
    e5(a, b) {
        var s, r, q;
        for (s = 0; s < $.b1(); ++s) {
            r = this.t;
            q = r[s];
            if (q < $.at()) r[s] = $.b2() - q;
        }
    },
    bf() {
        // this.x = $.ao()
        this.x = 0;
    },
};
T.PlrEx.prototype = {
    e2(a, b, c, d) {
        var s, r, q, p, o;
        for (s = $.a4(); (r = $.b1()), s < r; ++s) {
            q = this.t;
            p = q[s];
            o = $.mV();
            if (p < o) q[s] = ((p & $.eT()) >>> 0) + o;
        }
        for (s = r; s < $.d_(); ++s) {
            q = this.t;
            p = q[s];
            if (p < $.aR()) q[s] = p + $.at();
        }
        q = H.b([], t.i);
        C.Array.a5(q, this.t);
        this.E = q;
    },
    cA(a) { },
    bf() {
        this.x = $.ao();
    },
};
T.PlrBoss.prototype = {
    av(a, b) {
        LangData.get_lang(LangData.eQ(H.as_string($.n4()) + H.as_string(a)));
        this.r = LangData.get_lang(
            LangData.eQ(H.as_string($.n4()) + H.as_string(a)),
        );
    },
    gan() {
        return null;
    },
    aU() {
        var s, r;
        this.bB();
        if (this.gan() != null)
            for (s = 0; (r = this.q), s < r.length; ++s) r[s] = r[s] + this.gan()[s];
    },
    dm(a, b) {
        var s, r, q;
        for (s = 0, r = this.k1; s < r.length; ++s) {
            q = r[s];
            q.ao(this, q.f);
        }
    },
    bs() {
        var s, r, q, p;
        for (s = 0, r = this.k1, q = this.k4; s < r.length; ++s) {
            p = r[s];
            if (p instanceof T.ActionSkill) q.push(p);
        }
        for (s = 0; s < r.length; ++s) r[s].W();
    },
    cE() {
        // getScoreStr()
        // return $.iK()
        return "??";
    },
    gaS() {
        // List get immunedx => [];
        return [];
    },
    gaG() {
        // List<String> get immuned => [Dt.assassinate, Dt.charm, Dt.berserk, Dt.half, Dt.curse,  Dt.exchange, Dt.slow, Dt.ice];
        return H.b(
            [$.d2(), $.aE(), $.aJ(), $.eZ(), $.bh(), $.d3(), $.bi(), $.bS()],
            t.V,
        );
    },
    a7(a, b) {
        // bool immune(String key, R r) {
        if (C.Array.w(this.gaS(), a)) return b.n() < 240;
        if (C.Array.w(this.gaG(), a)) return b.n() < 192;
        return b.n() < 84;
    },
};
T.PlrBossConan.prototype = {
    gan() {
        var s = 0;
        return H.b([s, $.aI(), -$.mT(), $.as(), s, $.mV(), $.lI(), $.po()], t.i);
    },
    gaS() {
        return H.b([$.aE()], t.V);
    },
    ac() {
        var s = new T.SklConan(this, -1, 0);
        s.r = this;
        this.k3 = s;
    },
};
T.SklConan.prototype = {
    gb7() {
        return $.B();
    },
    gb8() {
        return $.C();
    },
    as(a, b) {
        return !(a instanceof T.Minion);
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            l = null,
            k = 1000;
        while (a == null) a = this.aa(0, true, c);
        s = a[0].a;
        r = this.fx;
        q = 1;
        if (r === -q && a.length === q) {
            this.fx = q;
            r = d.a;
            // sklConanKillUnknown
            // [0]在一间密室中发现了一具无名尸体
            r.push(
                T.RunUpdate_init(LangData.get_lang("uMZa"), this.r, l, l, l, 0, k, 100),
            );
            r.push($.K());
        }
        r = this.fx;
        q = 0;
        if (r > q) {
            this.fx = r - 1;
            // [0]正在进行推理
            // sklConanThinking
            d.a.push(
                T.RunUpdate_init(LangData.get_lang("Gikn"), this.r, l, l, l, 0, k, 100),
            );
            return;
        }
        p = s.fx;
        s.fx = q;
        o = a.length;
        n = 1;
        r = o === n && r === q;
        q = d.a;
        if (r) {
            // sklConanThinkingFinish
            // [0]推理完毕
            q.push(
                T.RunUpdate_init(LangData.get_lang("dEsa"), this.r, l, l, l, 0, k, 100),
            );
            // sklConanThinkingFinish2
            // 真相只有一个
            q.push(
                T.RunUpdate_init(
                    LangData.get_lang("RmQa"),
                    this.r,
                    l,
                    l,
                    l,
                    l,
                    $.eS(),
                    $.lH(),
                ),
            );
            // sklConanThinkingFinish3
            // 凶手就是你
            q.push(
                T.RunUpdate_init(LangData.get_lang("imLn"), this.r, l, l, l, 0, k, 100),
            );
            // sklConanKillLast
            // [1]
            r = LangData.get_lang("woia");
            o = this.r;
            n = new T.HPlr(p);
            n.a = s.e;
            n.d = s.fx;
            q.push(
                T.RunUpdate_init(r, o, n, new T.HDamage(p), l, p + $.b3(), k, 100),
            );
        } else {
            this.fx = n;
            r = LangData.get_lang("MtDN");
            o = this.r;
            n = new T.HPlr(p);
            n.a = s.e;
            n.d = s.fx;
            q.push(
                T.RunUpdate_init(r, o, n, new T.HDamage(p), l, p + $.b3(), k, 100),
            );
        }
        s.bm(p, this.r, c, d);
        r = this.r;
        q = r.l + s.y.f.length * $.eS();
        r.l = q;
        o = $.lJ();
        if (q > o) r.l = o;
    },
};
T.PlrBossCovid.prototype = {
    gan() {
        var s = $.Z(),
            r = $.n2(),
            q = 0,
            p = $.cY();
        return H.b([s, r, q, p, q, p, q, $.a6()], t.i);
    },
    gaG() {
        return H.b([$.aE(), $.aJ(), $.d3()], t.V);
    },
    ac() {
        var s = 0;
        this.k3 = new T.SklCovidAttack(this, s);
        this.k1.push(new T.SklCovidDefend(s));
    },
};
T.CovidMeta.prototype = {
    gT() {
        return 0;
    },
    K(a, b) { },
    $ix: 1,
};
T.CovidState.prototype = {
    at(a, b) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = this.fx;
        if (k.fx > 0 && this.fy > 1) {
            s = C.d.R((T.getAt(k, true, a) + this.go * $.b3()) / T.d9(k, true, a));
            r = this.fr;
            q = b.a;
            // sklCovidDamage
            // [1][肺炎]发作
            q.push(
                T.RunUpdate_init(
                    LangData.get_lang("VZaN"),
                    r,
                    k,
                    null,
                    null,
                    0,
                    1000,
                    100,
                ),
            );
            p = k.aF(s, r, T.ad(), a, b);
            o = 0;
            if (p > o && r.fx > o) {
                o = 1;
                n = C.JsInt.am(s, o);
                m = r.fx;
                if (m >= r.fy) n = C.JsInt.d5(n, $.t()) + o;
                if (n > p) n = p;
                r.fx = m + n;
                // recover
                // [1]回复体力[2]点
                o = LangData.get_lang("imin");
                m = new T.HPlr(m);
                m.a = r.e;
                m.d = r.fx;
                q.push(
                    T.RunUpdate_init(o, r, m, new T.HRecover(n), null, 0, 1000, 100),
                );
            }
        }
        if (this.fy > $.a4()) {
            this.D();
            this.id.b = true;
            this.k1.D();
            this.k2.D();
            k.F();
        }
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            j = null,
            i = 1000;
        if (this.fy == 0 || c.n() > this.fx.fr) {
            this.fy = this.fy + (c.n() & 3);
            for (s = 0, r = this.fx, q = this.fr, p = t.cu; s < $.X(); ++s) {
                o = c.b5(q.y.a.e);
                if (o !== r && o != q) {
                    n = p.a(o.r2.h(0, $.ck()));
                    if (n != null) {
                        m = this.go;
                        m = !n.c.w(0, m);
                    } else m = true;
                    if (m) {
                        if (o.y == r.y) this.fH(o, c, d);
                        else {
                            l = T.getAt(r, false, c);
                            // sklAttack
                            // [0]发起攻击
                            p = LangData.get_lang("EYAn");
                            m = new T.RunUpdate(0, i, 100, p, r, o, j, j);
                            m.aK(p, r, o, j, j, 0, i, 100);
                            d.a.push(m);
                            o.a3(l, false, q, this.gf9(), c, d);
                        }
                        return;
                    }
                }
            }
        }
        r = this.fy + (c.n() & 3);
        this.fy = r;
        q = this.fr;
        p = this.fx;
        m = d.a;
        if (r > $.t())
            m.push(
                T.RunUpdate_init(LangData.get_lang("Ojba"), q, p, j, j, 0, i, 100),
            );
        else
            m.push(
                T.RunUpdate_init(LangData.get_lang("JBrN"), q, p, j, j, 0, i, 100),
            );
    },
    fH(a, b, c) {
        var s,
            r = null,
            q = this.fx,
            p = c.a;
        p.push(
            T.RunUpdate_init(LangData.get_lang("UFQa"), q, a, r, r, 0, 1000, 100),
        );
        s = a.fr;
        s = T.oq(a) ? s + $.pd() : C.JsInt.am(s, 1);
        if (b.n() < s) {
            p.push(
                T.RunUpdate_init(LangData.get_lang("kloA"), q, a, r, r, 0, 1000, 100),
            );
            return false;
        } else return T.j7(this.fr, a, this.go, b, c);
    },
    fa(a, b, c, d, e) {
        T.j7(this.fr, b, this.go, d, e);
    },
    aN(a, b, c, d) {
        var s;
        if (c.n() < 64) {
            s = c.n() & 127;
            this.go = s;
            this.id.c.j(0, s);
        }
        return this;
    },
    gap() {
        return this.fr;
    },
};
T.SklCovidDefend.prototype = {
    W() {
        this.r.G.j(0, this);
    },
    aD(a, b, c, d) {
        if (b.r2.h(0, $.ck()) == null) {
            if (T.oq(b) && c.n() < 192) return;
            T.j7(this.r, b, $.bg(), c, d);
        }
    },
    $iah: 1,
};
T.SklCovidAttack.prototype = {
    v(a, b, c, d) {
        var s = a[0].a,
            r = this.fr,
            q = T.getAt(r, false, c);
        // sklAttack
        // [0]发起攻击
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("EYAn"),
                r,
                s,
                null,
                null,
                0,
                1000,
                100,
            ),
        );
        s.a3(q, false, r, T.v8(), c, d);
    },
    gap() {
        return this.fr;
    },
};
T.PlrBossIkaruga.prototype = {
    gan() {
        return H.b(
            [$.aI(), $.iI(), $.mN(), $.mW(), $.Z(), $.mL(), $.mT(), $.mJ()],
            t.i,
        );
    },
    gaG() {
        return H.b([$.d2(), $.eZ(), $.d3(), $.bT(), $.bi(), $.bS()], t.V);
    },
    a7(a, b) {
        if (a == $.bh()) return false;
        return this.cM(a, b);
    },
    ac() {
        var s, r;
        this.k3 = T.SklAttack_init(this);
        s = this.k1;
        s.push(new T.SklIkarugaDefend(0));
        r = new T.SklIkarugaAttack(0);
        r.f = $.aI();
        s.push(r);
    },
};
T.SklIkarugaDefend.prototype = {
    ga4() {
        return $.pk();
    },
    aq(a, b, c, d, e) {
        var s;
        if (a > 0) {
            s = 1;
            s = (a & s) >>> 0 === s;
        } else s = false;
        if (s) {
            // sklIkarugaDefend
            // [0][吸收]所有奇数伤害
            e.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("iOkN"),
                    this.r,
                    null,
                    null,
                    null,
                    a,
                    1000,
                    100,
                ),
            );
            return -a;
        }
        return a;
    },
    W() {
        this.r.y2.j(0, this);
    },
    $iaB: 1,
};
T.SklIkarugaAttack.prototype = {
    gb7() {
        return $.X();
    },
    gb8() {
        return $.a4();
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = t.j,
            l = H.b([], m);
        for (s = 0; s < a.length; ++s) l.push(a[s].a);
        // sklIkarugaAttack
        // [0]使用[能量释放]
        r = LangData.get_lang("UeNa");
        q = this.r;
        m = H.b(l.slice(0), m);
        p = d.a;
        p.push(T.RunUpdate_init(r, q, null, null, m, 1, 1000, 100));
        o = (T.getAt(this.r, true, c) * $.mQ()) / (l.length + $.b0());
        for (s = 0; s < l.length; ++s) {
            n = l[s];
            if (n.fx > 0) {
                p.push($.K());
                m = this.r;
                n.aF(
                    n.aq(C.d.R(o / T.d9(n, true, c)), m, T.ad(), c, d),
                    m,
                    T.ad(),
                    c,
                    d,
                );
            }
        }
    },
};
T.PlrBossLazy.prototype = {
    gan() {
        var s = 0;
        return H.b([s, $.q2(), $.Z(), -$.as(), s, $.b1(), s, $.cZ()], t.i);
    },
    gaG() {
        return H.b([$.d2(), $.eZ(), $.bh(), $.d3()], t.V);
    },
    ac() {
        var s = $.T(),
            r = 0;
        this.k3 = new T.SklLazyAttack(this, s, r);
        this.k1.push(new T.SklLazyDefend(r));
    },
};
T.LazyState.prototype = {
    gT() {
        return 0;
    },
    ar(a) {
        var s = this.fx;
        s.cy = C.JsInt.P(s.cy, $.t());
    },
    at(a, b) {
        var s,
            r,
            q = this.fx;
        if (q.fx > 0) {
            s = this.fr;
            r = C.d.R(T.getAt(s, true, a) / T.d9(q, true, a));
            // sklLazyDamage
            // [1][懒癌]发作
            b.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("sPnN"),
                    s,
                    q,
                    null,
                    null,
                    0,
                    1000,
                    100,
                ),
            );
            q.aF(r, s, T.ad(), a, b);
        }
    },
    aP(a) {
        var r = this.fx;
        r.r2.m(0, $.d5(), this);
        r.rx.j(0, this.go);
        r.x2.j(0, this.fy);
        r.x1.j(0, this.id);
        r.F();
    },
    K(a, b) {
        var s;
        this.D();
        s = this.fx;
        s.r2.U(0, $.d5());
        this.fy.D();
        this.id.D();
        this.go.D();
        s.F();
    },
    v(a, b, c, d) {
        T.beLazy(this.fx, c, d);
    },
    aN(a, b, c, d) {
        if (c.n() < 128) return this;
        return a;
    },
    $ix: 1,
    gap() {
        return this.fr;
    },
};
T.SklLazyDefend.prototype = {
    W() {
        this.r.G.j(0, this);
    },
    aD(a, b, c, d) {
        if (t.r.a(b.r2.h(0, $.d5())) == null) {
            T.LazyState_init(this.r, b).aP(0);
            // sklLazyHit
            // [1]感染了[懒癌]
            d.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("JnTA"),
                    this.r,
                    b,
                    null,
                    null,
                    0,
                    1000,
                    100,
                ),
            );
        }
    },
    $iah: 1,
};
T.SklLazyAttack.prototype = {
    v(a, b, c, d) {
        var s,
            r,
            q,
            o = a[0].a;
        if (t.r.a(o.r2.h(0, $.d5())) != null && c.n() < 128) {
            T.beLazy(this.fr, c, d);
            this.fx = this.fx + $.b0();
            return;
        }
        s = this.fr;
        r = T.getAt(s, false, c);
        q = this.fx;
        // sklAttack
        // [0]发起攻击
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("EYAn"),
                s,
                o,
                null,
                null,
                0,
                1000,
                100,
            ),
        );
        if (o.a3(r * q, false, s, T.va(), c, d) > 0) this.fx = $.T();
    },
    gap() {
        return this.fr;
    },
};
T.PlrBossMario.prototype = {
    gan() {
        return H.b(
            [0, $.lL(), $.d1(), $.mX(), $.iI(), $.iH(), $.eT(), $.n0()],
            t.i,
        );
    },
    F() {
        this.dT();
        if (this.aC > 0) this.id = this.id * $.mM();
    },
    gaS() {
        return [];
    },
    gaG() {
        return H.b([$.d2()], t.V);
    },
    a7(a, b) {
        if (a == $.lP()) return false;
        return this.cM(a, b);
    },
    ac() {
        var s, r;
        this.k3 = T.SklSimpleAttack_init(this);
        s = 0;
        this.aj = new T.SklFire(s);
        s = new T.SklMarioGet(this, s);
        s.r = this;
        s.f = $.b2();
        this.bi = s;
        r = this.k1;
        r.push(s);
        r.push(this.aj);
        s = T.tH(this, $.B());
        this.aR = s;
        r.push(s);
    },
};
T.SklMarioGet.prototype = {
    gT() {
        return 1;
    },
    ao(a, b) { },
    au(a, b) {
        var s = this.fr,
            r = s.aC,
            q = $.t();
        if (r >= q) {
            if (s.aR.Q >= q) return false;
            return a.n() < $.ap();
        }
        return a.n() < 128;
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var s,
            r,
            p = null,
            o = 1000,
            n = this.fr;
        n.r2.m(0, $.lQ(), this);
        s = n.aC = n.aC + 1;
        if (s === 1) {
            s = d.a;
            s.push(
                T.RunUpdate_init(LangData.get_lang("iRhA"), this.r, p, p, p, 0, o, 100),
            );
            n.F();
            s.push(
                T.RunUpdate_init(LangData.get_lang("zqHn"), this.r, p, p, p, 0, o, 100),
            );
        } else {
            r = d.a;
            if (s === $.t()) {
                r.push(
                    T.RunUpdate_init(
                        LangData.get_lang("LJOA"),
                        this.r,
                        p,
                        p,
                        p,
                        0,
                        o,
                        100,
                    ),
                );
                n.aj.f = $.cZ();
                r.push(
                    T.RunUpdate_init(
                        LangData.get_lang("cZhN"),
                        this.r,
                        p,
                        p,
                        p,
                        0,
                        o,
                        100,
                    ),
                );
            } else {
                r.push(
                    T.RunUpdate_init(
                        LangData.get_lang("ovXA"),
                        this.r,
                        p,
                        p,
                        p,
                        0,
                        o,
                        100,
                    ),
                );
                s = n.aR;
                s.Q = s.Q + 1;
                r.push(
                    T.RunUpdate_init(
                        LangData.get_lang("FshN"),
                        this.r,
                        p,
                        n.aR.Q,
                        p,
                        0,
                        o,
                        100,
                    ),
                );
            }
        }
        n.l = n.l + $.lH();
    },
    K(a, b) {
        var s = this.fr;
        s.r2.U(0, $.lQ());
        s.aC = s.aj.f = 0;
        s.F();
    },
    $ix: 1,
};
T.SklMarioReraise.prototype = {
    ga4() {
        return $.lG();
    },
    ao(a, b) { },
    b1(a, b, c, d) {
        var s,
            r,
            p = null,
            o = this.Q - 1;
        this.Q = o;
        if (o > 0) {
            this.r.bL(p, d);
            this.dA(0, d);
            o = LangData.get_lang("IUIN");
            s = this.r;
            r = new T.HPlr(0);
            r.a = s.e;
            r.d = s.fx;
            r = T.RunUpdate_init(o, r, p, p, p, 0, 1000, 100);
            r.b = $.lJ();
            o = d.a;
            o.push(r);
            o.push(
                T.RunUpdate_init(
                    LangData.get_lang("FshN"),
                    this.r,
                    p,
                    this.Q,
                    p,
                    0,
                    1000,
                    100,
                ),
            );
            this.dd(c, d);
            return true;
        }
        return false;
    },
    dA(a, b) {
        var s = this.r;
        s.fx = s.fy;
        t.ch.a(s).bi.K(null, b);
    },
    dd(a, b) { },
    W() {
        this.r.L.j(0, this);
    },
    $iaF: 1,
};
T.PlrBossMosquito.prototype = {
    gan() {
        return H.b(
            [-$.B(), $.eW(), $.pv(), $.pY(), $.X(), $.ap(), $.cY(), -$.lK()],
            t.i,
        );
    },
    gaS() {
        return H.b([$.d2(), $.lP()], t.V);
    },
    gaG() {
        return H.b([$.aJ(), $.aE()], t.V);
    },
    ac() {
        this.k3 = T.SklSimpleAttack_init(this);
        var s = new T.SklAbsorb(0);
        s.f = $.ci();
        this.k1.push(s);
    },
};
T.PlrBossSaitama.prototype = {
    gan() {
        return H.b(
            [$.pX(), $.pI(), $.n0(), $.q_(), $.pV(), $.pU(), 0, $.q1()],
            t.i,
        );
    },
    gaS() {
        return H.b([$.eZ(), $.d3()], t.V);
    },
    gaG() {
        return H.b([$.aJ(), $.bi(), $.bS()], t.V);
    },
    ac() {
        var s = 0,
            r = t.cr;
        r = new T.SklSaitama(s, s, P.c5(r), P.c5(r), 0);
        r.id = new T.PostDefendImpl(1 / 0, r);
        this.k3 = r;
        this.k1.push(r);
    },
};
T.SklSaitama.prototype = {
    W() {
        this.r.y2.j(0, this.id);
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            n = null;
        if (this.fx / (this.fy.a + this.go.a / $.B() + 1) > $.mP()) {
            s = d.a;
            s.push(
                T.RunUpdate_init(
                    LangData.get_lang("dlfA"),
                    this.r,
                    n,
                    n,
                    n,
                    n,
                    $.eS(),
                    $.lH(),
                ),
            );
            s.push($.K());
            s.push(
                T.RunUpdate_init(
                    LangData.get_lang("tHLa"),
                    this.r,
                    n,
                    n,
                    n,
                    0,
                    1000,
                    100,
                ),
            );
            s = this.r;
            s.y.dj(s);
            return;
        }
        s = this.fr;
        if (s < $.Z()) {
            this.fr = s + 1;
            return;
        }
        r = a[0].a;
        s = T.getAt(this.r, false, c);
        q = $.cY();
        // sklAttack
        // [0]发起攻击
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("EYAn"),
                this.r,
                r,
                n,
                n,
                0,
                1000,
                100,
            ),
        );
        r.a3(s * q, false, this.r, T.ad(), c, d);
        for (s = this.r.y.a.e, q = s.length, p = 0; p < q; ++p) s[p].l = 0;
        this.r.l = $.pb();
    },
    aq(a, b, c, d, e) {
        var r = this.fy;
        if (t.fM.b(b)) {
            r.j(0, b.gap());
            this.go.j(0, b);
        } else r.j(0, b);
        this.fx = this.fx + a;
        return C.JsInt.P(a, $.ci());
    },
};
T.PlrSeed_.prototype = {};
T.PlrSeed.prototype = {};
T.PlrBossSlime.prototype = {
    gan() {
        var s = $.a4(),
            r = $.mN();
        return H.b([s, r, $.X(), $.mL(), $.lL(), r, $.cY(), $.n_()], t.i);
    },
    gaS() {
        return H.b([], t.V);
    },
    gaG() {
        return H.b([$.bT()], t.V);
    },
    ac() {
        this.k3 = T.SklSimpleAttack_init(this);
        this.k1.push(new T.SklSlimeSpawn(0));
    },
};
T.BossSlime2.prototype = {
    gan() {
        return null;
    },
    eV() {
        var s, r, q;
        if (this.aC == 1) {
            for (s = 0; (r = $.Z()), s < r; ++s) this.t[s] = $.aR();
            for (s = r; s < $.b1(); ++s) {
                q = this.t;
                q[s] = (q[s] | $.aR()) >>> 0;
            }
        } else {
            for (s = 0; (r = $.Z()), s < r; ++s) this.t[s] = -$.X();
            for (s = r; s < $.b1(); ++s) {
                q = this.t;
                q[s] = (q[s] | $.at()) >>> 0;
            }
        }
    },
    a7(a, b) {
        return false;
    },
    ac() {
        // createSkills()
        var s, r;
        this.aC = this.dk.aC + 1;
        this.k3 = T.SklAttack_init(this);
        s = this.k1;
        if (this.aC == 1) s.push(new T.SklSlimeSpawn(0));
        else {
            r = new T.sklHalf(0);
            r.f = $.at();
            s.push(r);
            r = new T.SklHeal(0);
            r.f = $.at();
            s.push(r);
        }
    },
    $ibC: 1,
    gap() {
        return this.dk;
    },
};
T.SklSlimeSpawnState.prototype = {
    gT() {
        return 0;
    },
};
T.SklSlimeSpawn.prototype = {
    ga4() {
        return $.ao(); // return 0
    },
    b1(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = null;
        this.r.r2.m(0, $.iJ(), new T.SklSlimeSpawnState());
        s = d.a;
        s.push($.K());
        // sklSlimeSpawn
        // [0][分裂]
        s.push(
            T.RunUpdate_init(
                LangData.get_lang("BJOA"),
                this.r,
                k,
                k,
                k,
                0,
                1000,
                100,
            ),
        );
        r = t.b8;
        q = r.a(this.r);
        p = T.init_BossSlime2(q, q.a, q.b);
        p.y = this.r.y;
        p.az();
        p.l = c.n() * $.C();
        this.r.y.aZ(p);
        r = r.a(this.r);
        o = T.init_BossSlime2(r, r.a, r.b);
        o.y = this.r.y;
        o.az();
        o.l = c.n() * $.C();
        this.r.y.aZ(o);
        // sklSlimeSpawned
        // 分成了[0] 和  [1]
        r = LangData.get_lang("eHVA");
        q = p.fx;
        n = new T.HPlr(q);
        n.a = p.e;
        n.d = q;
        q = o.fx;
        m = new T.HPlr(q);
        m.a = o.e;
        m.d = q;
        s.push(T.RunUpdate_init(r, n, m, k, k, 0, 1000, 100));
        return false;
    },
    W() {
        this.r.L.j(0, this);
    },
    $iaF: 1,
};
T.PlrBossSonic.prototype = {
    gan() {
        var s = $.Z(),
            r = $.a4(),
            q = $.eS(),
            p = 0;
        return H.b([s, -r, q, p, s, -$.eT(), r, p], t.i);
    },
    gaS() {
        return H.b([], t.V);
    },
    gaG() {
        return H.b([$.bT()], t.V);
    },
    ac() {
        var s, r;
        this.k3 = T.SklSimpleAttack_init(this);
        s = this.k1;
        r = new T.SklRapid(0);
        r.f = $.aI();
        s.push(r);
        r = new T.SklCritical(0);
        r.f = $.aI();
        s.push(r);
        r = new T.SklCounter(0);
        r.f = $.aI();
        s.push(r);
    },
};
T.PlrBossYuri.prototype = {
    gan() {
        return H.b(
            [$.pt(), $.d1(), $.mX(), $.n2(), $.bg(), $.X(), $.at(), $.eW()],
            t.i,
        );
    },
    gaS() {
        return H.b([], t.V);
    },
    gaG() {
        return H.b([], t.V);
    },
    ac() {
        var s, r;
        this.k3 = T.SklSimpleAttack_init(this);
        s = this.k1;
        r = new T.SklYuriControl(0);
        r.f = $.eX();
        s.push(r);
        r = new T.SklDefend(0);
        r.f = $.aI();
        s.push(r);
        r = new T.SklReflect(0);
        r.f = $.aI();
        s.push(r);
    },
};
T.SklYuriControl.prototype = {
    as(a, b) {
        var s = a.y,
            r = this.r;
        return s != r.z && a !== r && !a.r2.J(0, $.aE());
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o = null,
            n = a[0].a,
            m = d.a;
        // sklYuriControl
        // [0]使用[心灵控制]
        m.push(
            T.RunUpdate_init(
                LangData.get_lang("wneN"),
                this.r,
                n,
                o,
                o,
                1,
                1000,
                100,
            ),
        );
        s = n.y.c.length;
        r = $.B();
        if (s < r) s = r;
        q = t.o.a(n.r2.h(0, $.aE()));
        p = this.r;
        if (q == null) {
            q = T.CharmState_init(p.z, n);
            q.z = s;
            q.aP(0);
        } else {
            q.r = p.z;
            q.z = q.z + s;
        }
        // sklCharmHit
        // [1]被[魅惑]了
        m.push(
            T.RunUpdate_init(
                C.String.B(LangData.get_lang("yjhn"), $.nd()),
                this.r,
                n,
                o,
                o,
                $.cZ(),
                1000,
                100,
            ),
        );
    },
};
T.Engine.prototype = {
    bD() {
        logger.debug("看起来到 main 了");
        // 我盯上你了
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.z),
            q,
            o,
            n,
            m,
            name2p,
            k,
            j,
            i,
            h,
            g,
            f,
            runner,
            d,
            c,
            b,
            is_boss,
            a0,
            weapon_name,
            player,
            a3,
            a4,
            a5,
            a6,
            sorted_names,
            sorted_hash_names,
            sorted_hash,
            b0,
            b1,
            b2,
            seed_names;
        var $async$bD = P._wrapJsFunctionForAsync(
            (async_error_code, async_result) => {
                if (async_error_code === 1)
                    return P.async_rethrow(async_result, async_completer);
                while (true)
                    switch (async_goto) {
                        case 0:
                            seed_names = H.b([], t.V);
                            for (
                                o = this.x,
                                n = o.length,
                                m = t.eG,
                                name2p = this.r,
                                k = this.z,
                                j = t.L,
                                i = this.a,
                                h = 0;
                                h < o.length;
                                o.length === n || (0, H.F)(o), ++h
                            ) {
                                g = o[h];
                                f = H.b([], j);
                                runner = new T.Grp(this, f, H.b([], j), H.b([], j), H.b([], j));
                                for (d = (g && C.Array).ga0(g); d.u();) {
                                    c = d.gC();
                                    if (!(c instanceof T.Plr))
                                        if (m.b(c) && J.aw(c) >= $.t()) {
                                            b = J.a3(c);
                                            b.h(c, 0);
                                            b.h(c, 1);
                                            is_boss = b.gp(c);
                                            a0 = $.t();
                                            weapon_name = is_boss > a0 ? b.h(c, a0) : null;
                                            if (typeof b.h(c, 1) == "string") {
                                                is_boss = J.aw(b.h(c, 1));
                                                a0 = 1;
                                                is_boss =
                                                    is_boss === a0 && J.ny(b.h(c, a0), 0) < $.pC();
                                            } else is_boss = false;
                                            if (is_boss) {
                                                player = T.choose_boss(
                                                    b.h(c, 0),
                                                    b.h(c, 1),
                                                    this,
                                                    weapon_name,
                                                );
                                            } else {
                                                player = T.init_plr(
                                                    b.h(c, 0),
                                                    b.h(c, 1),
                                                    runner.b,
                                                    weapon_name,
                                                );
                                            }
                                            // a2 = a ? T.init_boss(b.h(c, 0), b.h(c, 1), this_, a1) : T.init_plr(b.h(c, 0), b.h(c, 1), e.b, a1)
                                            if (player instanceof T.PlrSeed_) {
                                                // PlrSeed
                                                seed_names.push(player.e);
                                                k.push(player);
                                                continue;
                                            }
                                            if (name2p.J(0, player.e)) {
                                                // if name2p.containsKey(p.idName)
                                                continue;
                                            }
                                            if (runner.b == null) runner.b = player.c;
                                            player.y = runner;
                                            f.push(player);
                                            name2p.m(0, player.e, player);
                                        }
                                }
                                // group.initPlayers.length != 0
                                if (f.length !== 0) {
                                    i.push(runner);
                                    a3 = f.length;
                                    for (a4 = 0; a4 < a3; ++a4) {
                                        player = f[a4];
                                        for (a5 = a4 + 1; a5 < a3; ++a5) {
                                            a6 = f[a5];
                                            if (player.b == a6.b) {
                                                player.cA(a6.E);
                                                a6.cA(player.E);
                                            }
                                        }
                                    }
                                }
                            }
                            this.Q = i.length;
                            if (C.JsInt.am(name2p.gp(name2p), $.Z()) > 0) {
                                // errorMaxPlayer
                                // 错误，目前最多支持1000人PK
                                this.f = LangData.get_lang("CefA");
                                async_goto = 1;
                                break;
                            }
                            if (name2p.gp(name2p) < $.t()) {
                                // errorMinPlayer
                                // 错误，请至少输入两行名字
                                this.f = LangData.get_lang("MAda");
                                async_goto = 1;
                                break;
                            }

                            o = name2p.gad(name2p);
                            sorted_names = P.List_List_of(
                                o,
                                true,
                                H._instanceType(o).i("L.E"),
                            );
                            C.Array.aJ(sorted_names);
                            // sort_names = name2p.keys.toList()
                            // sort_names.sort()

                            if (seed_names.length !== 0) {
                                sorted_hash_names = H.b(
                                    sorted_names.slice(0),
                                    H._arrayInstanceType(sorted_names),
                                );
                                C.Array.a5(sorted_hash_names, seed_names);
                                C.Array.aJ(sorted_hash_names);
                                // = sorted_names.toList()
                                // addAll(seed_names)
                                // sort()
                            } else {
                                sorted_hash_names = sorted_names;
                            }

                            o = C.Array.aV(sorted_hash_names, "\r");
                            sorted_hash = C.e.gaB().ab(o);

                            this.b = new LangData.SuperRC4();
                            this.b.bd(sorted_hash, 1); // init 1
                            this.b.bO(sorted_hash); // xor bytes once

                            o = sorted_names.length;
                            h = 0;
                        case 3:
                            if (!(h < sorted_names.length)) {
                                async_goto = 5;
                                break;
                            }
                            b0 = sorted_names[h];
                            // async_goto = 6
                            name2p.h(0, b0).az();
                            // 说明:
                            // 这里的 await 实际上是没意义的
                            // 因为 .cg 实际上只是 .az 的 async 包装
                            // 这里又直接 await 了，实际上是多余的
                            // 所以直接去掉这个分支, 同时直接调用 .az
                            //     return P._asyncAwait(name2p.h(0, b0).cg(), $async$bD)
                            // case 6:
                            n = name2p.h(0, b0);
                            m = this.b; // rc4_holder
                            // name2p[name].sortInt = r.rFFFFFF;
                            n.Q = ((m.n() << 16) | (m.n() << 8) | m.n()) >>> 0;
                        case 4:
                            sorted_names.length === o || (0, H.F)(sorted_names), ++h;
                            async_goto = 3;
                            break;
                        case 5:
                            for (
                                o = i.length, h = 0;
                                h < i.length;
                                i.length === o || (0, H.F)(i), ++h
                            ) {
                                runner = i[h];
                                n = runner.c;
                                m = H._arrayInstanceType(n);
                                k = H.b(n.slice(0), m);
                                runner.d = k;
                                n = H.b(n.slice(0), m);
                                // if (n.immutable$list)
                                //     H.throw_expression(P.UnsupportError("sort"))
                                m = n.length - 1;
                                if (m - 0 <= 32) H.ej(n, 0, m, T.mD());
                                else H.ei(n, 0, m, T.mD());
                                runner.e = n;
                                n = H.b(n.slice(0), H._arrayInstanceType(n));
                                runner.f = n;
                            }
                            o = name2p.gfP(name2p);
                            o = P.List_List_of(o, true, H._instanceType(o).i("L.E"));
                            C.Array.bb(o, T.mD());
                            this.c = o;
                            if (C.JsInt.am(name2p.gp(name2p) + $.X(), $.C()) === 0)
                                for (o = this.c, n = o.length, h = 0; h < n; ++h) {
                                    player = o[h];
                                    player.I = player.gbT();
                                }
                            o = H.b(i.slice(0), H._arrayInstanceType(i));
                            // T.DummyRunUpdates_init
                            C.Array.bb(o, T.v4());
                            this.d = o;
                            for (
                                n = o.length, m = t.i, name2p = this.e, h = 0;
                                h < o.length;
                                o.length === n || (0, H.F)(o), ++h
                            ) {
                                b1 = o[h];
                                for (
                                    k = b1.f, j = k.length, b2 = 0;
                                    b2 < k.length;
                                    k.length === j || (0, H.F)(k), ++b2
                                ) {
                                    player = k[b2];
                                    i = this.b;
                                    f = player.e;
                                    i.bO(C.e.gaB().ab(f));
                                }
                                this.b.bO(H.b([0], m));
                                C.Array.a5(name2p, b1.f);
                            }
                            for (
                                o = this.c, n = o.length, h = 0;
                                h < o.length;
                                o.length === n || (0, H.F)(o), ++h
                            )
                                o[h].l = this.b.n();
                        case 1:
                            return P._asyncReturn(q, async_completer);
                    }
            },
        );
        return P._asyncStartSync($async$bD, async_completer);
    },
    bE() {
        why_ns = 0;
    },
    fz(a, b) {
        // void round(RunUpdates updates) {
        var s,
            q = this.ch,
            p = 1,
            players = this.c;
        p = C.JsInt.V(q + p, players.length);
        this.ch = p;

        // players[roundPos].step(r, updates);
        J.rz(players[p], this.b, b);

        for (q = t.Y; (p = b.b), p.length !== 0;) {
            b.b = H.b([], q);
            for (
                players = p.length, s = 0;
                s < p.length;
                p.length === players || (0, H.F)(p), ++s
            )
                p[s].$2(this.b, b);
        }
    },
    O() {
        // 运行时?
        // logger.debug("运行 主循环")
        var async_goto = 0,
            async_completer = P._makeAsyncAwaitCompleter(t.d),
            result_,
            p = [],
            rc4,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f;
        var $async$O = P._wrapJsFunctionForAsync((a, b) => {
            if (a === 1) return P.async_rethrow(b, async_completer);
            while (true)
                $async$outer: switch (async_goto) {
                    case 0:
                        if (this.cx) {
                            result_ = null;
                            async_goto = 1;
                            break;
                        }
                        rc4 = new T.aq(H.b([], t.U), H.b([], t.Y));
                        k = this.cy;
                        async_goto = k != null ? 3 : 4;
                        break;
                    case 3:
                        k = k.c[0];
                        // win
                        // [2]获得胜利
                        j = LangData.get_lang("eTpN");
                        logger.debug("getting win from T.fo.O");
                        i = 0;
                        h = $.lJ();
                        g = new T.RunUpdateWin(i, h, 100, j, k, null, null, null);
                        g.aK(j, k, null, null, null, i, h, 100);
                        rc4.a.push(g);
                        this.cx = true;
                        async_goto = 5;
                        // return P._asyncAwait(this_.bE(), $async$O)
                        why_ns = 0;
                    // $.mc = 0 // 来自bE()
                    case 5:
                        result_ = rc4;
                        async_goto = 1;
                    // break
                    case 4:
                        try {
                            while (this.cy == null) {
                                // round
                                this.fz(0, rc4);
                                if (rc4.a.length !== 0) {
                                    result_ = rc4;
                                    async_goto = 1;
                                    break $async$outer;
                                }
                            }
                        } catch (e) {
                            // 报出错误
                            logger.debug("来自 round() 的报错, 在意料之内, 可以忽略\n", e);
                            // m = H.unwrap_Exception(e)
                            // l = H.getTraceFromException(e)
                        }
                        if (rc4.a.length !== 0) {
                            // updates.updates.isNotEmpty
                            result_ = rc4;
                            async_goto = 1;
                            // return updates
                            break;
                        }
                        result_ = null;
                        async_goto = 1;
                        break;
                    case 1:
                        return P._asyncReturn(result_, async_completer);
                }
        });
        return P._asyncStartSync($async$O, async_completer);
    },
    ae(a, b) {
        if (run_env.from_code) {
            // 这里已经在外面跑过了
            return null;
        }
        return this.dM(0, b);
    },
    dM(a, b) {
        // start(int tt) async {
        // var async_goto = 0,
        //     async_completer = P._makeAsyncAwaitCompleter(t.z),
        //     this_ = this,
        //     p, o, n, m, l, k, j
        // var $async$ae = P._wrapJsFunctionForAsync(function (c, d) {
        //     if (c === 1) return P.async_rethrow(d, async_completer)
        //     while (true) switch (async_goto) {
        //         case 0:
        //             this_.db = b
        //             p = Date.now()
        //             o = $.bx()
        //             n = this_.dx
        //             n[0] = p + o
        //             o = this_.a
        //             m = new H.y(o, new T.jk(), H._arrayInstanceType(o).i("y<1,m*>")).aV(0, "\n")
        //             p = this_.z
        //             o = p.length
        //             if (o !== 0)
        //                 for (l = 0; l < p.length; p.length === o || (0, H.F)(p), ++l) {
        //                     k = p[l]
        //                     m += "\n" + H.as_string(k.e) + "\t" + H.as_string(k.a)
        //                 }
        //             p = C.e.gaB().ab(m)
        //             o = H.instanceType(p).i("a9<z.E>")
        //             j = o.i("y<M.E,l*>")
        //             j = P.List_List_of(new H.y(new H.a9(p, o), new T.jl(this_), j), true, j.i("M.E"))
        //             C.Array.a5(j, H.fJ(n.buffer, 0, null))
        //             A.eR(X.dc(j))
        //             return P.async_return(null, async_completer)
        //     }
        // })
        // return P._asyncStartSync($async$ae, async_completer)
        let p, o, n, m, l, k, j;
        this.db = b;
        p = Date.now();
        o = $.bx();
        n = this.dx;
        n[0] = p + o;
        o = this.a;
        m = new H.y(o, new T.jk(), H._arrayInstanceType(o).i("y<1,m*>")).aV(
            0,
            "\n",
        );
        p = this.z;
        o = p.length;
        if (o !== 0)
            for (l = 0; l < p.length; p.length === o || (0, H.F)(p), ++l) {
                k = p[l];
                m += "\n" + H.as_string(k.e) + "\t" + H.as_string(k.a);
            }
        p = C.e.gaB().ab(m);
        o = H.instanceType(p).i("a9<z.E>");
        j = o.i("y<M.E,l*>");
        j = P.List_List_of(
            new H.y(new H.a9(p, o), new T.jl(this), j),
            true,
            j.i("M.E"),
        );
        C.Array.a5(j, H.fJ(n.buffer, 0, null));
        A.eR(X.dc(j));
    },
    cq(a, b) {
        return this.f7(a, b);
    },
    f7(a, b) {
        var async_goto = 0,
            r = P._makeAsyncAwaitCompleter(t.z),
            p,
            o,
            n;
        var $async$cq = P._wrapJsFunctionForAsync((c, d) => {
            if (c === 1) return P.async_rethrow(d, r);
            while (true)
                switch (async_goto) {
                    case 0:
                        n = H.as_string(a.gap().e) + "\r" + H.as_string(a.I.$0());
                        n = C.e.gaB().ab(n);
                        p = H.instanceType(n).i("a9<z.E>");
                        o = p.i("y<M.E,l*>");
                        o = P.List_List_of(
                            new H.y(new H.a9(n, p), new T.ji(this), o),
                            true,
                            o.i("M.E"),
                        );
                        C.Array.a5(o, H.fJ(this.dx.buffer, 0, null));
                        A.eR(X.dc(o));
                        return P._asyncReturn(null, r);
                }
        });
        return P._asyncStartSync($async$cq, r);
    },
    gbu(a) {
        return this.f;
    },
};
T.jk.prototype = {
    $1(a) {
        var s = a.d;
        return new H.y(s, new T.jj(), H._arrayInstanceType(s).i("y<1,@>")).aV(
            0,
            "\r",
        );
    },
    $S: 49,
};
T.jj.prototype = {
    $1(a) {
        return a.I.$0();
    },
    $S: 3,
};
T.jl.prototype = {
    $1(a) {
        return (a ^ this.a.db) >>> 0;
    },
    $S: 2,
};
T.ji.prototype = {
    $1(a) {
        return (a ^ this.a.db) >>> 0;
    },
    $S: 2,
};
T.Grp.prototype = {
    aZ(a) {
        var s,
            r,
            p = this.a;
        if (!C.Array.w(p.c, a)) {
            // $.mc = $.ns() - 1
            why_ns -= 1;
            C.Array.j(p.c, a);
        }
        s = p.e;
        if (!C.Array.w(s, a)) {
            r = this.f;
            if (r.length > 0) C.Array.co(s, C.Array.aT(s, C.Array.gbl(r)) + 1, a);
            else s.push(a);
            if (p.db > -1) p.cq(a, this);
        }
        if (!this.e.includes(a)) this.e.push(a);
        if (!this.d.includes(a)) this.d.push(a);
        if (!this.f.includes(a)) this.f.push(a);
    },
    dj(a) {
        var s, r, q, p;
        C.Array.U(this.f, a);
        s = this.a;
        r = s.e;
        C.Array.U(r, a);
        if (s.ch <= C.Array.aT(s.c, a)) --s.ch;
        C.Array.U(s.c, a);
        q = this.f.length;
        p = 0;
        if (q === p) {
            s.Q = s.Q - 1;
            q = r[p].y;
            if (q.f.length === r.length) {
                s.cy = q;
                H.throw_expression(q);
            }
        }
    },
    k(a) {
        return "[" + H.as_string(this.c[0].r) + "]";
    },
};
T.IPlr.prototype = {
    k(a) {
        return this.a;
    },
    gb2() {
        return this.a;
    },
};
T.NPlr.prototype = {};
T.HPlr.prototype = {};
T.MPlr.prototype = {
    cO(a) {
        this.a = a.e;
        this.b = a.fx;
        this.c = a.fy;
    },
};
T.DPlr.prototype = {};
T.HDamage.prototype = {
    k(a) {
        return J.b4(this.a);
    },
};
T.HRecover.prototype = {
    k(a) {
        return J.b4(this.a);
    },
};
T.RunUpdate.prototype = {
    aK(a, b, c, d, e, f, g, h) {
        var s,
            r,
            q,
            tmp = this.e;
        // caster
        if (tmp instanceof T.Plr) {
            s = new T.NPlr();
            s.a = tmp.e;
            this.e = s;
        }
        // target
        tmp = this.f;
        if (tmp instanceof T.Plr) {
            s = new T.NPlr();
            s.a = tmp.e;
            this.f = s;
        }
        // param
        tmp = this.x;
        if (tmp instanceof T.Plr) {
            s = new T.NPlr();
            s.a = tmp.e;
            this.x = s;
        }
        // targets2
        tmp = this.r;
        if (tmp != null)
            for (r = 0; r < tmp.length; ++r) {
                s = tmp[r];
                if (s instanceof T.Plr) {
                    q = new T.NPlr();
                    q.a = s.e;
                    tmp[r] = q;
                }
            }
    },
    // to string
    k(a) {
        var r = this.d,
            q = this.e;
        if (q != null) {
            q = q.k(0);
            if (typeof q != "string") H.throw_expression(H.R(q));
            r = H.mF(r, "[Dn.n0]", q);
        }
        q = this.f;
        if (q != null) {
            q = q.k(0);
            if (typeof q != "string") H.throw_expression(H.R(q));
            r = H.mF(r, "[Dn.n1]", q);
        }
        q = this.x;
        if (q != null) {
            q = J.b4(q);
            if (typeof q != "string") H.throw_expression(H.R(q));
            r = H.mF(r, "[Dn.n2]", q);
        }
        return r;
    },
};
T.RunUpdateCancel.prototype = {};
T.RunUpdateWin.prototype = {};
T.aq.prototype = {
    k(a) {
        // return H.e(this.a)
        // console.log(a, this.a, H.e(this.a))
        return H.as_string(this.a);
    },
};
T.lD.prototype = {
    $1(a) {
        var s,
            r = this.a;
        r.c = r.c + 1;
        s = this.b;
        s[a] = s[a] + 1;
        if (a != r.b) {
            r.a = r.a + 1;
            r.b = a;
        }
    },
    $S: 50,
};
T.Minion.prototype = {
    b1(a, b, c, d) {
        var r = this.fx,
            q = 0;
        if (r > q) {
            this.fx = q;
            this.bm(r, null, c, d);
        }
        this.a6.D();
        return false;
    },
    cD() {
        // minionDie
        // [1]消失了
        return LangData.get_lang("Kcon");
    },
    bf() {
        this.x = $.ao();
    },
    $ibC: 1,
};
T.Plr.prototype = {
    a7(a, b) {
        return false;
    },
    bw(a) {
        var s, r, q;
        if (this.fx <= 0 || this.A) return false;
        s = a.n();
        r = ((((s & 15) + 1) * ((C.JsInt.am(s, 4) & 15) + 1)) >>> 5) + 1;
        q = this.go;
        if (q >= r) {
            this.go = q - r;
            return true;
        }
        return false;
    },
    a1(a, b, c, d) {
        // Plr 构造函数
        // 名字字符输入的处理在此
        var name, team, q, p, o, n, m, l, k, j, i;

        this.I = this.gfJ();
        name = this.r = this.a; // 名字第一部分
        team = this.b; // @ 号以后的东西

        if (team != null && team !== "" && team !== name) {
            // 有战队情况下构造名字
            team = this.e = H.as_string(name) + "@" + H.as_string(this.b);
        } else {
            this.e = this.b = name;
            team = name;
        }

        this.f = team;
        q = this.d; // + 号以后的东西
        if (q != null && q !== "") {
            // MARK: DIY part
            if (q.startsWith("diy")) {
                this.diy = q.slice(3);
            } else {
                this.f = H.as_string(team) + "+" + H.as_string(q);

                // 武器列表
                team = $.rj();
                console.log("$.rj()", $.rj());
                if (team.J(0, q)) {
                    p = team.h(0, q).$2(q, this);
                } else if (J.nz(q, $.cl())) {
                    p = new T.BossWeapon(q, this, P.aL($.av(), 0, false, t.B));
                    p.a = q;
                    p.a = C.String.af(q, 0, q.length - 1);
                } else {
                    p = T.Weapon_factory(q, this);
                }

                o = new LangData.SuperRC4();
                o.bd(LangData.fZ(p.a), $.t());
                p.b3(o);
                this.weapon = p;
            }
        }

        if (J.lW(name, " ")) {
            this.r = name.split(" ")[0];
        }
        if (this.c == null) {
            this.c = this.b;
        }
        team = new LangData.SuperRC4();

        team.bd(LangData.fZ(this.b), 1);
        this.X = team;
        // q = $.ns()
        // $.mc = q + 1
        q = why_ns;
        why_ns += 1;

        q = C.JsInt.P(Math.abs(q), $.bx());
        n = 0;
        if (q > n) {
            q = team.c;
            m = q[n];
            l = 1;
            q[n] = q[l];
            q[l] = m;
        }
        team.dB(0, LangData.fZ(name), $.t());
        for (name = this.X.c, name.length, team = this.a2, k = 0; k < 256; ++k) {
            j = name[k];
            i = ((j * $.nW + $.nV) & $.mP()) >>> 0;
            if (i >= $.mb && i < $.r2()) {
                C.Array.j(this.t, ((i + $.r3() * $.r4().ax($.eX())) & $.b2()) >>> 0);
            } else team.push(j);
        }
        name = this.t;
        name = H.b(name.slice(0), H._arrayInstanceType(name));
        this.E = name;
        this.ac(); // createSkills, 对this.k1直接操作，顺序固定
        this.k2 = this.X.dH(this.k1, t.c5);
        // rc4.next
    },
    bf() {
        // 检查名字长度
        var s,
            q = this.a, // name
            p = q.length; // name.length
        // > 80
        if (p > $.b3()) throw H.wrap_expression(p);
        p = this.b.length;
        // > 64
        if (p > $.au()) throw H.wrap_expression(p);
        q = T.lC(q); // name
        p = T.lC(this.b); // team
        s = $.a4(); // 6
        this.x = Math.max(H.ar(q), p - s);
        logger.debug(
            "name",
            this.a,
            "team",
            this.b,
            "x(final)",
            this.x,
            "p(team)",
            p,
            "q(name)",
            q,
        );
    },
    b0(a, b) {
        // 这又是啥
        return C.d.aI(a * ($.T() - this.x / b));
    },
    cA(a) {
        //upgrade
        /// upgrade leader from team member
        var s;
        if (a.length === this.t.length) {
            for (s = $.ap(); s < this.t.length; ++s)
                // if (J.Y(a[s - 1], r.E[s]) && a[s] > r.t[s]) {
                if (a[s - 1] === this.E[s] && a[s] > this.t[s]) {
                    this.t[s] = a[s];
                }
            if (this.a == this.b)
                for (s = $.X(); s < this.t.length; ++s)
                    // if (J.Y(a[s - $.t()], r.E[s]) && a[s] > r.t[s]) {
                    if (a[s - $.t()] === this.E[s] && a[s] > this.t[s]) {
                        this.t[s] = a[s];
                    }
        }
    },
    cg() {
        // buildAsync wrapper
        var s = 0,
            r = P._makeAsyncAwaitCompleter(t.z);
        var $async$cg = P._wrapJsFunctionForAsync((a, b) => {
            if (a === 1) return P.async_rethrow(b, r);
            while (true)
                switch (s) {
                    case 0:
                        this.az();
                        return P._asyncReturn(null, r);
                }
        });
        return P._asyncStartSync($async$cg, r);
    },
    az() {
        // buildAsync inner
        var weapon, diy;

        // 检查名字长度
        this.bf();

        weapon = this.weapon;
        if (weapon != null) weapon.bn(); // preUpgrade

        this.aU(); // initRawAttr
        this.bP(); // initLists

        // DIY自定义属性
        diy = this.diy;
        if (diy != null) {
            try {
                var tmparr = diy.split("]");
                var attrs = JSON.parse(tmparr[0] + "]");
                if (tmparr[1].startsWith("{")) var diyskills = JSON.parse(tmparr[1]);
                if (attrs.length != 8) throw new Error("八围要有八个元素");
            } catch (error) {
                console.error(error);
                alert("DIY捏人格式错误, 请检查");
            }
            if (attrs) {
                for (var i = 0; i < 7; i++) {
                    attrs[i] -= 36; // 为当前项减去36
                }
                this.q = attrs;
            }
            if (diyskills) {
                this.diy_skills(diyskills);
            } else this.dm(C.Array.cL(this.t, 64), C.Array.cL(this.E, 64)); // initSkills
        } else {
            this.dm(C.Array.cL(this.t, $.au()), C.Array.cL(this.E, $.au())); // initSkills
        }

        weapon = this.weapon;
        if (weapon != null) weapon.cs();
        this.bs(); // addSkillsToProc
        this.cn(); // initValues
    },
    aU() {
        // initRawAttr
        var s, r, q, p;
        for (s = $.Z(); s < 31; s += $.B()) {
            r = this.q;
            q = C.Array.al(this.t, s, s + $.B());
            if (!!q.immutable$list) H.throw_expression(P.UnsupportError("sort"));
            p = q.length - 1;
            if (p - 0 <= 32) H.ej(q, 0, p, J.bO());
            else H.ei(q, 0, p, J.bO());
            C.Array.j(r, q[1]);
        }
        r = this.q;

        q = C.Array.al(this.t, 0, $.Z());
        C.Array.aJ(q);

        C.Array.j(r, C.Array.dz(C.Array.al(q, $.B(), $.ap()), new T.jX()) + $.mK());
        // 至此，属性初始化完毕，this_.q就是八围 但前7围要+36才是面板属性！！！
        // test
        //this_.q = [-36, 0, 0, 0, -36, 0, 0, 100]
    },
    bP() {
        C.Array.sp(this.k4, 0);
        this.r2.ah(0);
        this.rx.ah(0);
        this.ry.ah(0);
        this.x1.ah(0);
        this.x2.ah(0);
        this.y1.ah(0);
        this.y2.ah(0);
        this.G.ah(0); // postdamages
        this.L.ah(0); // dies
        this.S.ah(0); // kills
    },
    ac() {
        // create skills
        // createSkills()
        var skills, r, q;
        this.k3 = T.SklAttack_init(this);
        skills = this.k1;
        skills.push(new T.SklFire(0)); // 0
        skills.push(new T.SklIce(0)); // 1
        skills.push(new T.SklThunder(0)); // 2
        skills.push(new T.SklQuake(0)); // 3
        skills.push(new T.SklAbsorb(0)); // 4
        skills.push(new T.SklPoison(0)); // 5
        skills.push(new T.SklRapid(0)); // 6
        skills.push(new T.SklCritical(0)); // 7
        skills.push(new T.sklHalf(0)); // 8
        skills.push(new T.SklExchange(0)); // 9
        skills.push(new T.SklBerserk(0)); // 10
        skills.push(new T.SklCharm(0)); // 11
        skills.push(new T.SklHaste(0)); // 12
        skills.push(new T.SklSlow(0)); // 13
        skills.push(new T.SklCurse(0)); // 14
        skills.push(new T.SklHeal(0)); // 15
        skills.push(new T.SklRevive(0)); // 16
        skills.push(new T.SklDisperse(0)); // 17

        r = 0;
        r = new T.SklIron(r, r, r);
        q = new T.PostDefendImpl(1 / 0, r);
        r.fr = q;
        r.fx = new T.PostActionImpl(r);
        r.fy = new T.UpdateStateImpl(r);
        q.r = $.lG();
        skills.push(r); // 18

        r = 0;
        r = new T.SklCharge(r, r);
        r.fr = new T.UpdateStateImpl(r);
        r.fx = new T.PostActionImpl(r);
        skills.push(r); // 19

        r = new T.SklAccumulate($.pj(), 0);
        r.fr = new T.UpdateStateImpl(r);
        skills.push(r); // 20

        r = new T.SklAssassinate(0);
        r.fr = new T.PreActionImpl(r);
        r.fx = new T.PostDamageImpl(r);
        skills.push(r); // 21

        skills.push(new T.SklSummon(0)); // 22
        skills.push(new T.SklClone(0)); // 23
        skills.push(new T.SklShadow(0)); // 24
        skills.push(new T.SklDefend(0)); // 25
        skills.push(new T.SklProtect(0)); // 26
        skills.push(new T.SklReflect(0)); // 27
        skills.push(new T.SklReraise(0)); // 28
        skills.push(new T.SklShield(0)); // 29
        skills.push(new T.SklCounter(0)); // 30
        skills.push(new T.SklMerge(0)); // 31
        skills.push(new T.SklZombie(0)); // 32

        r = new T.SklUpgrade(0);
        r.Q = new T.UpdateStateImpl(r);
        skills.push(r); // 33

        r = new T.SklHide(0);
        r.ch = new T.UpdateStateImpl(r);
        r.Q = new T.PreActionImpl(r);
        skills.push(r); // 34

        skills.push(new T.SkillVoid(0));
        skills.push(new T.SkillVoid(0));
        skills.push(new T.SkillVoid(0));
        skills.push(new T.SkillVoid(0));
        skills.push(new T.SkillVoid(0));
    },
    diy_skills(diyskills) {
        try {
            // MARK: 自定义技能
            var sortedSkills = this.k2;
            // 初始化技能
            for (var n = 0; n < this.k2.length; n++) this.k2[n].ao(this, 0);
            // 遍历diyskills字典的键
            var keys = Object.keys(diyskills);
            for (var k = 0; k < keys.length; k++) {
                // 遍历skills数组中的对象
                var key = keys[k];
                for (var i = 0; i < sortedSkills.length; i++) {
                    if (
                        sortedSkills[i].constructor.name.toLowerCase() == key.toLowerCase()
                    ) {
                        sortedSkills[i].f = diyskills[key];
                        // skills[i].ao(this, this.f)

                        if (i != k) {
                            // 把技能的顺序排一下
                            [sortedSkills[i], sortedSkills[k]] = [
                                sortedSkills[k],
                                sortedSkills[i],
                            ];
                        }
                        break;
                    }
                }
            }
        } catch (error) {
            console.log("error diy");
            console.error(error);
        }
    },
    dm(list, original) {
        // initSkills
        var skill,
            sortedSkills,
            q,
            p,
            n = 0,
            m = 0;
        // src中被移除的计算技能部分
        while (true) {
            if (!(n < $.aR() && n < this.k2.length)) break;
            skill = this.k2[n];
            sortedSkills = C.Array.al(list, m, m + $.C());
            if (!!sortedSkills.immutable$list)
                H.throw_expression(P.UnsupportError("sort"));
            q = sortedSkills.length - 1;
            if (q - 0 <= 32) H.ej(sortedSkills, 0, q, J.bO());
            else H.ei(sortedSkills, 0, q, J.bO());
            p = sortedSkills[0] - 10;
            skill.ao(this, p);
            sortedSkills = 0;
            if (p > sortedSkills) {
                sortedSkills = C.Array.al(original, m, m + $.C());
                if (!!sortedSkills.immutable$list)
                    H.throw_expression(P.UnsupportError("sort"));
                q = sortedSkills.length - 1;
                if (q - 0 <= 32) H.ej(sortedSkills, 0, q, J.bO());
                else H.ei(sortedSkills, 0, q, J.bO());
                q = 0;
                if (sortedSkills[q] - 10 <= q) skill.e = true;
            }
            ++n;
            m += $.C(); // 4
        }
        // console.log("this_.k2:",this_.k2)
        for (; (sortedSkills = this.k2), n < sortedSkills.length; ++n)
            sortedSkills[n].ao(this, 0);
        // sorted skills是this.k2,
    },
    bs() {
        // addSkillsToProc
        var s, actions, sortedSkills, skl, o, act, boostPassive;
        for (
            s = 0, actions = this.k4;
            (sortedSkills = this.k2), s < sortedSkills.length;
            ++s
        ) {
            skl = sortedSkills[s];
            if (skl.f > 0 && skl instanceof T.ActionSkill) actions.push(skl);
        }
        if (this.diy == undefined) {
            if (actions.length > 0)
                for (s = actions.length - 1; s >= 0; --s) {
                    act = actions[s];
                    if (!act.e) {
                        // !act.boosted
                        act.f = act.f * 2;
                        act.e = true;
                        break;
                    }
                }
        }
        boostPassive = new T.BoostPassive();
        var skills = this.k2;
        if (skills.length >= $.aR()) {
            skills = skills[$.p7()];
            sortedSkills = this.t;
            boostPassive.boostPassive(
                skills,
                sortedSkills[$.a6()],
                sortedSkills[$.pR()],
            );
            sortedSkills = this.k2[$.eT()];
            skills = this.t;
            boostPassive.boostPassive(sortedSkills, skills[$.n_()], skills[$.b2()]);
        }
        for (s = 0, skills = this.k1; s < skills.length; ++s) {
            skl = skills[s];
            if (skl.f > 0) skl.W();
        }
    },
    cn() {
        // initValues
        this.F();
        this.fx = this.fy;
        this.go = C.JsInt.P(this.fr, $.t());
    },
    F() {
        /*  void updateStates() {
          atk = attr[0];
          def = attr[1];
          spd = attr[2] + 160;
          agl = attr[3];
          mag = attr[4];
          mdf = attr[5];
          itl = attr[6];
          maxhp = attr[7];

          calcAttrSum();

          allyGroup = group;
          atboost = 1.0;

          frozen = false;

          for (UpdateStateEntry ude in updatestates) {
            ude.updateState(this);
          }
        }
        */
        var s;
        this.ch = this.b0(this.q[0], $.cj());
        this.cx = this.b0(this.q[1], $.cj());
        this.cy = this.b0(this.q[2], $.cj()) + 160;
        this.db = this.b0(this.q[3], $.cj());
        this.dx = this.b0(this.q[4], $.cj());
        this.dy = this.b0(this.q[5], $.cj());
        this.fr = this.b0(this.q[6], $.n1());
        this.fy = this.q[7];

        this.ci();
        this.z = this.y;
        this.id = $.T();
        this.A = false;
        for (s = this.rx, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")); s.u();) {
            s.b.ar(this);
        }
    },
    ci() {
        // calcAttrSum
        var attr_sum,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            h = (this.M = 0);
        for (attr_sum = h; h < 7; ++h) {
            attr_sum += this.q[h];
            this.M = attr_sum;
        }
        q = this.q;
        p = q[0];
        o = q[1];
        n = $.t();
        m = q[n];
        l = q[$.C()];
        k = q[$.X()];
        j = $.B();
        this.N = (p - o + m + l - k) * n + q[j] + q[$.a4()];
        this.Y = attr_sum * j + q[r];
        this.H = $.W();
    },
    dN(a, b, c) {
        // void step(R r, RunUpdates updates) {
        var s, r, q;
        if (this.fx <= 0) return;
        s = this.cy * (b.n() & 3);
        r = this.ry;
        if (!r.gbv(r))
            for (r = new Sgls.a_(r, r.b, r.$ti.i("a_<1*>")); r.u();)
                s = r.b.x.fo(s, b, c);
        r = this.l = this.l + s;
        q = $.bx();
        if (r > q) {
            this.l = r - q;
            this.eE(0, b, c);
        }
    },
    eE(a, b, c) {
        // void action(R r, RunUpdates updates) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            k = null,
            smart = (b.n() & 63) < this.fr;
        0;
        // preAction
        s = this.fn(smart, b, c);
        if (this.A) return;
        if (s == null) {
            r = (b.n() & 15) + $.av();
            if (this.go >= r) {
                for (
                    q = this.k4, p = q.length, o = k, n = 0;
                    n < q.length;
                    q.length === p || (0, H.F)(q), ++n
                ) {
                    m = q[n];
                    if (!m.au(b, smart)) continue;
                    o = m.aa(0, smart, b);
                    if (o == null) continue;
                    s = m;
                    break;
                }
                this.go = this.go - r;
            } else o = k;
        } else o = k;
        if (s == null) s = this.k3;
        // skl.act(targets, smart, r, updates);
        s.v(o == null ? s.aa(0, smart, b) : o, smart, b, c);
        if ((b.n() & 127) < this.fr + $.au()) this.go = this.go + $.aR();
        this.at(b, c);
        if (this.Z) this.bL(k, c);
    },
    bL(a, b) {
        var s, r, q, p, o;
        if (this.a_) {
            this.Z = true;
            return;
        }
        this.Z = false;
        for (
            s = this.r2,
            r = s.gad(s),
            r = P.List_List_of(r, true, H._instanceType(r).i("L.E")),
            C.Array.aJ(r),
            q = r.length,
            p = 0;
            p < r.length;
            r.length === q || (0, H.F)(r), ++p
        ) {
            o = r[p];
            if (s.h(0, o).gT() < 0) {
                s.h(0, o).K(a, b);
                s.U(0, o);
            }
        }
    },
    fn(smart, r, updates) {
        // ActionSkl preAction(bool smart, R r, RunUpdates updates) {
        var s, skl;
        for (
            s = this.x1, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")), skl = null;
            s.u();
        ) {
            skl = s.b.aN(skl, smart, r, updates);
        }
        return skl;
    },
    at(a, b) {
        var s;
        this.a_ = true;
        b.a.push($.K());
        for (s = this.x2, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")); s.u();)
            s.b.at(a, b);
        this.a_ = false;
    },
    du(a, b, c, d, e, f) {
        var s, r;
        for (s = this.y1, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")); s.u();) {
            a = s.b.dv(a, b, c, this, d, e, f);
            r = $.ao();
            if (a == r) return r;
        }
        return a;
    },
    aq(a, b, c, d, e) {
        var s;
        for (s = this.y2, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")); s.u();)
            a = s.b.aq(a, b, c, d, e);
        return a;
    },
    a3(a, b, c, d, e, f) {
        var s, r, q;
        a = this.du(a, b, c, d, e, f);
        if (a == $.ao()) return 0;
        s = this.db;
        if (b) {
            r = this.dy + s;
            q = c.dx + c.db;
        } else {
            r = this.cx + s;
            q = c.ch + c.db;
        }
        if (this.fx > 0 && !this.A && T.bW(q, r, e)) {
            // dodge (通用回避)
            // [0][回避]了攻击
            f.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("BtqN"),
                    this,
                    c,
                    null,
                    null,
                    $.as(),
                    1000,
                    100,
                ),
            );
            return 0;
        }
        return this.bN(a, b, c, d, e, f);
    },
    bN(a, b, c, d, e, f) {
        return this.aF(
            this.aq(C.d.R(a / T.d9(this, b, e)), c, d, e, f),
            c,
            d,
            e,
            f,
        );
    },
    aF(a, b, c, d, e) {
        var s, r, q, p, o;
        if (a < 0) {
            s = this.fx;
            r = s - a;
            this.fx = r;
            q = this.fy;
            if (r > q) this.fx = q;
            r = LangData.get_lang("imin");
            q = new T.HPlr(s);
            q.a = this.e;
            q.d = this.fx;
            e.a.push(
                T.RunUpdate_init(r, b, q, new T.HRecover(-a), null, 0, 1000, 100),
            );
            return 0;
        }
        p = LangData.get_lang("kZsn");
        r = 0;
        if (a === r) {
            e.a.push(
                T.RunUpdate_init(
                    C.String.B(C.String.fu(p, "1", "0"), $.ne()),
                    this,
                    this,
                    new T.HDamage(0),
                    null,
                    10,
                    1000,
                    100,
                ),
            );
            return 0;
        }
        s = this.fx;
        q = s - a;
        this.fx = q;
        if (q <= r) this.fx = r;
        if (a >= $.eU()) p = C.String.B(p, $.qz());
        else if (a >= $.cZ()) p = C.String.B(p, $.qy());
        r = new T.HPlr(s);
        r.a = this.e;
        r.d = this.fx;
        o = T.RunUpdate_init(p, b, r, new T.HDamage(a), null, a, 1000, 100);
        if (a > $.pr()) o.b = $.d0();
        else o.b = $.eS() + a * $.t();
        e.a.push(o);
        c.$5(b, this, a, d, e);
        return this.cr(a, s, b, d, e);
    },
    cr(a, b, c, d, e) {
        var s;
        for (s = this.G, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")); s.u();)
            s.b.aD(a, c, d, e);
        if (this.fx <= 0) {
            this.bm(b, c, d, e);
            return b;
        } else return a;
    },
    cD() {
        return LangData.get_lang("avqN");
    },
    bm(a, b, c, d) {
        var s,
            r,
            p = d.a;
        p.push($.K());
        s = this.cD();
        r = new T.DPlr();
        r.a = this.e;
        p.push(T.RunUpdate_init(s, b, r, null, null, $.b1(), 1000, 100));
        for (p = this.L, p = new Sgls.a_(p, p.b, p.$ti.i("a_<1*>")); p.u();)
            if (p.b.b1(a, b, c, d)) break;
        if (this.fx > 0) return;
        this.y.dj(this);
        if (b != null && b.fx > 0) b.bS(this, c, d);
    },
    bS(a, b, c) {
        // kill()
        var s;
        for (s = this.S, s = new Sgls.a_(s, s.b, s.$ti.i("a_<1*>")); s.u();)
            if (s.b.bS(a, b, c)) break;
    },
    k(a) {
        return "[" + H.as_string(this.r) + "]";
    },
    fK() {
        return (
            H.as_string(this.e) +
            "\t" +
            H.as_string(this.r) +
            "\t" +
            H.as_string(this.c) +
            "\t" +
            H.as_string(this.f) +
            "\t" +
            H.as_string(this.fy)
        );
    },
    cE() {
        // 1200 here
        var s,
            r = this.Y,
            q = $.p4();
        if (r > q) {
            s = C.JsInt.P(r - q, $.a6());
            r = $.t();
            if (s > r) return C.JsInt.k(r);
            else return C.JsInt.k(s);
        }
        return "";
    },
    dE() {
        var s,
            r,
            q,
            p,
            n = H.b([], t.V);
        if (this instanceof T.PlrBoss) n = C.N;
        else {
            s = H.b([], t.i);
            for (r = 10; r < $.d1(); r += $.B()) {
                q = C.Array.al(this.E, r, r + $.B());
                if (!!q.immutable$list) H.throw_expression(P.UnsupportError("sort"));
                p = q.length - 1;
                if (p - 0 <= 32) H.ej(q, 0, p, J.bO());
                else H.ei(q, 0, p, J.bO());
                s.push(q[1]);
            }
            q = C.Array.al(this.E, 0, 10);
            C.Array.aJ(q);
            s.push(C.Array.dz(C.Array.al(q, $.B(), $.ap()), new T.jY()) + $.mK());
            for (r = 0; r < s.length; ++r)
                if (this.q[r] > s[r])
                    n.push(H.as_string($.lO()) + H.as_string(this.q[r] - s[r]));
                else n.push("");
        }
        return (
            H.as_string(this.e) +
            "\t" +
            H.as_string(this.r) +
            "\t" +
            H.as_string(this.c) +
            "\t" +
            H.as_string(this.f) +
            "\t" +
            H.as_string(this.fy) +
            n[$.ap()] +
            "\t" +
            H.as_string(this.aY(this.q[0])) +
            n[0] +
            "\t" +
            H.as_string(this.aY(this.q[1])) +
            n[1] +
            "\t" +
            H.as_string(this.aY(this.q[$.t()])) +
            n[$.t()] +
            "\t" +
            H.as_string(this.aY(this.q[$.B()])) +
            n[$.B()] +
            "\t" +
            H.as_string(this.aY(this.q[$.C()])) +
            n[$.C()] +
            "\t" +
            H.as_string(this.aY(this.q[$.X()])) +
            n[$.X()] +
            "\t" +
            H.as_string(this.aY(this.q[$.a4()])) +
            n[$.a4()] +
            "\t" +
            H.as_string(this.cE())
        );
    },
    aY(a) {
        var s = $.mU();
        if (a > $.q4()) {
            return $.iK(); // ??
        }
        return C.JsInt.k(a + s);
    },
    gb2() {
        return this.e;
    },
};
T.jX.prototype = {
    $2(a, b) {
        return a + b;
    },
    $S: 15,
};
T.BoostPassive.prototype = {
    boostPassive(a, b, c) {
        var s = a.f;
        if (s > 0 && !a.e) {
            a.f = s + Math.min(Math.min(H.ar(b), H.ar(c)), s);
            a.e = true;
        }
    },
    $S: 53,
};
T.jY.prototype = {
    $2(a, b) {
        return a + b;
    },
    $S: 15,
};
T.IMeta.prototype = {
    K(a, b) { },
};
T.UpdateStateEntry.prototype = {};
T.PreStepEntry.prototype = {};
T.PreDefendEntry.prototype = {};
T.PostDefendEntry.prototype = {};
T.PostDamageEntry.prototype = {};
T.PreActionEntry.prototype = {};
T.PostActionEntry.prototype = {};
T.aF.prototype = {};
T.UpdateStateImpl.prototype = {
    ar(a) {
        this.x.ar(a);
    },
    ga4() {
        return 1 / 0;
    },
};
T.PreStepImpl.prototype = {
    ga4() {
        return 1 / 0;
    },
};
T.PostDefendImpl.prototype = {
    aq(a, b, c, d, e) {
        return this.x.aq(a, b, c, d, e);
    },
    ga4() {
        return this.r;
    },
};
T.PostDamageImpl.prototype = {
    aD(a, b, c, d) {
        return this.x.aD(a, b, c, d);
    },
    ga4() {
        return 1 / 0;
    },
};
T.PreActionImpl.prototype = {
    aN(a, b, c, d) {
        return this.x.aN(a, b, c, d);
    },
    ga4() {
        return 1 / 0;
    },
};
T.PostActionImpl.prototype = {
    at(a, b) {
        return this.x.at(a, b);
    },
    ga4() {
        return 1 / 0;
    },
};
T.cp.prototype = {
    b1(a, b, c, d) {
        this.x.b1(a, b, c, d);
        return false;
    },
    ga4() {
        return 1 / 0;
    },
};
T.bG.prototype = {};
T.Skill.prototype = {
    ao(a, b) {
        var s;
        this.r = a;
        s = 0;
        if (b > s) this.f = b;
        else this.f = s;
    },
    W() { },
    b9(a) {
        var s = this.gap().z;
        return a.fm(s.a.e, s.f);
    },
    as(a, b) {
        return true;
    },
    a9(a, b, c) {
        return this.bx(a, b, c, false);
    },
    bx(a, b, c, d) {
        if (b)
            if (this.gap().y.a.Q > $.t()) return T.rateHiHp(a) * a.y.f.length * a.H;
            else if (d) return T.rateHiHp(a) * a.M * a.H;
            else return (1 / T.rateHiHp(a)) * a.N * a.H;
        return c.gbo() + a.H;
    },
    gb7() {
        return $.t();
    },
    gb8() {
        return $.B();
    },
    aa(a, b, c) {
        var s,
            r,
            q,
            p,
            n = b ? this.gb8() : this.gb7(),
            m = H.b([], t.L),
            l = 0,
            k = -n;
        while (true) {
            if (!(l <= n && k <= n)) break;
            c$0: {
                s = this.b9(c);
                if (s == null) return null;
                if (!this.as(s, b)) {
                    ++k;
                    break c$0;
                }
                if (!C.Array.w(m, s)) {
                    m.push(s);
                    if (m.length >= n) break;
                } else ++l;
            }
        }
        if (m.length === 0) return null;
        r = H.b([], t.F);
        for (
            q = m.length, p = 0;
            p < m.length;
            m.length === q || (0, H.F)(m), ++p
        ) {
            s = m[p];
            r.push(new T.bG(s, this.a9(s, b, c)));
        }
        C.Array.bb(r, T.v5());
        return r;
    },
    gap() {
        return this.r;
    },
};
T.ActionSkill.prototype = {
    au(a, b) {
        // prob
        // this.level
        return (a.n() & 127) < this.f;
    },
};
T.SklAttack.prototype = {
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            n = null,
            m = a[0].a;
        if (b) {
            s = this.r;
            s = s.dx > s.ch;
        } else s = false;
        if (s) {
            s = this.r;
            r = C.JsInt.am(s.dx - s.ch, $.t());
            q = s.go;
            if (q >= r) {
                s.go = q - r;
                p = T.getAt(s, true, c);
                // sklAttack
                // [0]发起攻击
                d.a.push(
                    T.RunUpdate_init(
                        LangData.get_lang("VQhA"),
                        this.r,
                        m,
                        n,
                        n,
                        0,
                        1000,
                        100,
                    ),
                );
                m.a3(p, true, this.r, T.ad(), c, d);
                return;
            }
        }
        p = T.getAt(this.r, false, c);
        // sklAttack
        // [0]发起攻击
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("EYAn"),
                this.r,
                m,
                n,
                n,
                0,
                1000,
                100,
            ),
        );
        m.a3(p, false, this.r, T.oH(), c, d);
    },
};
T.SklSimpleAttack.prototype = {
    v(a, b, c, d) {
        var s = a[0].a,
            r = T.getAt(this.r, false, c);
        // sklAttack
        // [0]发起攻击
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("EYAn"),
                this.r,
                s,
                null,
                null,
                0,
                1000,
                100,
            ),
        );
        s.a3(r, false, this.r, T.ad(), c, d);
    },
};
T.SklCounter.prototype = {
    W() {
        this.r.G.j(0, this);
    },
    aD(a, b, c, d) {
        if (b.y == this.r.z && (c.n() & 63) < this.r.fr) return;
        if (this.ch === d) {
            if (this.Q && b != this.cx) if ((c.n() & 127) < this.f) this.cx = b;
        } else {
            this.ch = d;
            if (c.n() < this.f) {
                this.cx = b;
                this.Q = true;
                d.b.push(this.gdr());
            }
        }
    },
    f8(a, b) {
        var s, r, q;
        this.Q = false;
        this.ch = null;
        if (this.cx.fx > 0 && this.r.bw(a)) {
            s = T.getAt(this.r, false, a);
            r = $.K();
            q = b.a;
            q.push(r);
            q.push(
                T.RunUpdate_init(
                    C.String.B(LangData.get_lang("VgaN"), $.qw()),
                    this.r,
                    this.cx,
                    null,
                    null,
                    1,
                    1000,
                    100,
                ),
            );
            this.cx.a3(s, false, this.r, T.ad(), a, b);
        }
    },
    $iah: 1,
};
T.SklDefend.prototype = {
    ga4() {
        return $.pl();
    },
    aq(a, b, c, d, e) {
        if (d.n() < this.f && this.r.bw(d)) {
            e.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("NIMn"),
                    this.r,
                    b,
                    null,
                    null,
                    $.bg(),
                    1000,
                    100,
                ),
            );
            return C.JsInt.P(a, $.t());
        }
        return a;
    },
    W() {
        this.r.y2.j(0, this);
    },
    $iaB: 1,
};
T.SklHide.prototype = {
    W() {
        this.r.G.j(0, this);
        this.r.x1.j(0, this.Q);
    },
    aD(a, b, c, d) {
        var r = this.f,
            q = 0;
        if (r <= q || this.ch.a != null) return;
        r = this.r;
        if (r.fx > q && !r.A && r.z.f.length > 1 && (c.n() & 63) < this.f) {
            this.r.rx.j(0, this.ch);
            this.r.F();
            r = LangData.get_lang("oIIa");
            q = this.r;
            d.a.push(T.RunUpdate_init(r, q, q, null, null, $.Z(), 1000, 100));
        }
    },
    aN(a, b, c, d) {
        var s = this.ch;
        if (s.a != null) {
            s.D();
            this.r.F();
        }
    },
    ar(a) {
        var s,
            r,
            q,
            p = this.r;
        p.H = p.H / $.Z();
        s = this.f;
        r = $.b2();
        if (s > r) {
            q = s - r;
            p.db = p.db + q;
            p.cx = p.cx + q;
            p.dy = p.dy + q;
        }
    },
    $iah: 1,
};
T.MergeState.prototype = {
    gT() {
        return 0;
    },
};
T.SklMerge.prototype = {
    W() {
        this.r.S.j(0, this);
    },
    bS(a, b, c) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            j = null;
        if ((b.n() & 63) < this.f) {
            for (s = 0, r = this.r.q, q = r.length, p = a.q, o = false; s < q; ++s) {
                n = p[s];
                if (n > r[s]) {
                    r[s] = n;
                    o = true;
                }
            }
            s = 0;
            r = a.k1;
            while (true) {
                q = this.r.k1;
                if (!(s < q.length && s < r.length)) break;
                m = q[s];
                l = r[s];
                q = J.uR(m);
                if (q.gcw(m) !== q.gcw(m)) break;
                q = l.f;
                p = m.f;
                if (q > p) {
                    if (p === 0) {
                        m.f = q;
                        if (m instanceof T.ActionSkill) this.r.k4.push(m);
                        m.W();
                    } else m.f = q;
                    o = true;
                }
                ++s;
            }
            r = a.go;
            q = this.r;
            if (r > q.go) {
                q.go = r;
                a.go = 0;
            }
            r = a.l;
            p = q.l;
            if (r > p) {
                q.l = p + r;
                a.l = 0;
            }
            if (o) {
                a.r2.m(0, $.iJ(), new T.MergeState());
                this.r.F();
                r = c.a;
                r.push($.K());
                r.push(
                    T.RunUpdate_init(
                        LangData.get_lang("yGkN"),
                        this.r,
                        a,
                        j,
                        j,
                        $.a6(),
                        $.d0(),
                        100,
                    ),
                );
                q = LangData.get_lang("PGSN");
                p = new T.MPlr();
                p.cO(this.r);
                r.push(T.RunUpdate_init(q, p, a, j, j, 0, 1000, 100));
                return true;
            }
        }
        return false;
    },
    $ify: 1,
};
T.ProtectStat.prototype = {
    gT() {
        return 0;
    },
    dG(a) {
        var s, r, q, p, o;
        for (s = this.x, r = this.r, q = r.r2; s.length !== 0;) {
            p = a.b5(s);
            if (p.r.z == r.y && (a.n() & 127) < p.f && p.r.bw(a)) {
                p.cI(a);
                return p;
            } else {
                C.Array.U(s, p);
                if (s.length === 0) {
                    o = this.a;
                    if (o != null) {
                        this.b.sbq(this.c);
                        this.c.saE(this.b);
                        --o.a;
                        this.a = null;
                    }
                    q.U(0, $.d6());
                }
                p.Q = null;
            }
        }
        return null;
    },
    fs(a) {
        var s = this.x;
        C.Array.U(s, a);
        if (s.length === 0) {
            this.D();
            this.r.r2.U(0, $.d6());
        }
    },
    dv(a, b, c, d, e, f, g) {
        var s,
            r,
            q,
            p = this.dG(f);
        if (p != null) {
            s = p.r;
            // sklProtect
            // [0][守护][1]
            g.a.push(
                T.RunUpdate_init(
                    LangData.get_lang("JzmA"),
                    s,
                    d,
                    null,
                    null,
                    $.bg(),
                    1000,
                    100,
                ),
            );
            a = s.du(a, b, c, e, f, g);
            r = $.ao();
            if (a == r) return r;
            q = T.d9(s, b, f);
            s.aF(s.aq(C.d.eW((a * $.b0()) / q), c, e, f, g), c, e, f, g);
            return $.ao();
        }
        return a;
    },
};
T.SklProtect.prototype = {
    b9(a) {
        var s = this.r;
        return a.fk(s.z.f, s);
    },
    as(a, b) {
        return !(a instanceof T.Minion);
    },
    a9(a, b, c) {
        var s, r;
        if (b) {
            s = 1;
            r = t.Q.a(a.r2.h(0, $.d6()));
            if (r != null) s = r.x.length + 1;
            return ((1 / T.rateHiHp(a)) * a.N) / s;
        }
        return c.gbo();
    },
    cI(a) {
        var s,
            r,
            p = this.aa(0, (a.n() & 127) < this.r.fr, a),
            o = p != null ? p[0].a : null,
            n = this.Q;
        if (n == o) return;
        if (n != null) {
            s = t.Q.a(n.r2.h(0, $.d6()));
            if (s != null) s.fs(this);
        }
        this.Q = o;
        if (o != null) {
            n = o.r2;
            r = t.Q.a(n.h(0, $.d6()));
            if (r == null) {
                r = new T.ProtectStat(o, H.b([], t.gN));
                n.m(0, $.d6(), r);
                o.y1.j(0, r);
            }
            r.x.push(this);
        }
    },
    at(a, b) {
        this.cI(a);
        return false;
    },
    W() {
        this.r.x2.j(0, this);
    },
    $ibq: 1,
};
T.SklReflect.prototype = {
    dv(a, b, c, d, e, f, g) {
        var s, r;
        if (c.fx <= 0) return a;
        if (f.n() < this.f && f.n() < 128 && this.r.bw(f)) {
            s = T.getAt(this.r, true, f) * $.b0();
            if (s > a) s = a;
            g.a.push(
                T.RunUpdate_init(
                    C.String.B(LangData.get_lang("lnNA"), $.qI()),
                    this.r,
                    c,
                    null,
                    null,
                    $.as(),
                    $.d0(),
                    100,
                ),
            );
            c.a3(s, true, this.r, e, f, g);
            r = this.r;
            r.l = r.l - $.mY();
            return $.ao();
        }
        return a;
    },
    W() {
        this.r.y1.j(0, this);
    },
    $ibH: 1,
};
T.SklReraise.prototype = {
    ga4() {
        return $.lG();
    },
    b1(a, b, c, d) {
        var s,
            r,
            q,
            o = c.n(),
            n = this.f;
        if ((o & 127) < n) {
            this.f = C.JsInt.P(n + 1, $.t());
            o = C.String.B(LangData.get_lang("DWRn"), $.ng());
            n = this.r;
            s = d.a;
            s.push(T.RunUpdate_init(o, n, n, null, null, $.b3(), $.d0(), 100));
            this.r.fx = (c.n() & 15) + 1;
            n = LangData.get_lang("imin");
            o = this.r;
            r = new T.HPlr(0);
            r.a = o.e;
            q = o.fx;
            r.d = q;
            s.push(T.RunUpdate_init(n, o, r, new T.HRecover(q), null, 0, 1000, 100));
            return true;
        }
        return false;
    },
    W() {
        this.r.L.j(0, this);
    },
    $iaF: 1,
};
T.ShieldStat_.prototype = {
    ga4() {
        return $.pP();
    },
    gT() {
        var s = this.x,
            r = 0;
        if (s > r) return 1;
        return r;
    },
    aq(a, b, c, d, e) {
        var s = this.x,
            r = 0;
        if (s == r) return a;
        if (a > s) {
            this.x = r;
            a -= r;
        } else {
            this.x = s - a;
            a = r;
        }
        return a;
    },
    K(a, b) {
        this.D();
        this.r.r2.U(0, $.lR());
    },
};
T.SklShield.prototype = {
    aN(a, b, c, d) {
        var s, r, q;
        if (this.f > 0) {
            s = t.eb.a(this.r.r2.h(0, $.lR()));
            if (s == null) {
                r = this.r;
                s = new T.ShieldStat_(r, 0);
                r.r2.m(0, $.lR(), s);
                this.r.y2.j(0, s);
            }
            r = this.f;
            q = s.x;
            if (r >= q) s.x = q + (c.ax(1 + C.JsInt.P(r * $.B(), $.C())) + 1);
        }
        return a;
    },
    W() {
        this.r.x1.j(0, this);
    },
    $iaV: 1,
};
T.SklUpgrade.prototype = {
    W() {
        this.r.G.j(0, this);
    },
    aD(a, b, c, d) {
        var s,
            r,
            p = null,
            o = this.f,
            n = 0;
        if (o <= n || this.Q.a != null) return;
        s = $.aR();
        r = $.b2();
        if (o > r) s += o - r;
        o = this.r.fx;
        if (o > n && o < s + (c.n() & 63) && (c.n() & 63) < this.f) {
            this.r.r2.m(0, $.nl(), this);
            this.r.rx.j(0, this.Q);
            this.r.F();
            o = d.a;
            o.push($.K());
            n = LangData.get_lang("TRcn");
            r = this.r;
            o.push(T.RunUpdate_init(n, r, r, p, p, $.a6(), $.d0(), 100));
            r = C.String.B(LangData.get_lang("iTtn"), $.qK());
            n = this.r;
            o.push(T.RunUpdate_init(r, n, n, p, p, 0, 1000, 100));
            n = this.r;
            n.l = n.l + $.lM();
        }
    },
    gT() {
        return 1;
    },
    K(a, b) {
        var s;
        this.r.r2.U(0, $.nl());
        this.Q.D();
        this.r.F();
        if (this.r.fx > 0) {
            s = b.a;
            s.push($.K());
            s.push(T.RunUpdateCancel_init(LangData.get_lang("Ebza"), a, this.r));
        }
    },
    ar(a) {
        var s = this.r,
            r = s.ch,
            q = $.lI();
        s.ch = r + q;
        s.cx = s.cx + q;
        s.db = s.db + q;
        s.dx = s.dx + q;
        s.dy = s.dy + q;
        q = s.cy;
        r = $.as();
        s.cy = q + r;
        s.fr = s.fr + r;
    },
    $ix: 1,
    $iah: 1,
};
T.SkillVoid.prototype = {
    ao(a, b) {
        this.r = a;
        this.f = 0;
    },
    au(a, b) {
        return false;
    },
    aa(a, b, c) {
        return null;
    },
    v(a, b, c, d) {
        return;
    },
};
T.PlrZombie.prototype = {
    gap() {
        return this.aj.r;
    },
    ac() {
        this.k3 = T.SklAttack_init(this);
    },
    aU() {
        var s, r;
        this.bB();
        s = this.q;
        r = 0;
        s[r] = r;
        s[$.a4()] = r;
        r = $.ap();
        s[r] = C.d.P(s[r], $.t());
    },
};
T.ZombieState.prototype = {
    gT() {
        return 0;
    },
};
T.SklZombie.prototype = {
    W() {
        this.r.S.j(0, this);
    },
    bS(a6, a7, a8) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            f,
            e,
            dies,
            kills,
            b,
            a,
            a0,
            a1,
            a2,
            a3,
            a5 = null;
        if (!(a6 instanceof T.Minion) && (a7.n() & 63) < this.f && this.r.bw(a7)) {
            a6.r2.m(0, $.iJ(), new T.ZombieState());
            s = H.as_string(this.r.a) + "?" + H.as_string($.qZ());
            r = this.r;
            q = r.b;
            r = r.c;
            p = 0;
            o = $.T();
            n = H.b([], t.q);
            m = H.b([], t.H);
            l = P.create_meta_map(t.X, t.W);
            k = new Sgls.MList(t.n);
            k.c = k;
            k.b = k;
            j = new Sgls.MList(t.p);
            j.c = j;
            j.b = j;
            i = new Sgls.MList(t.g);
            i.c = i;
            i.b = i;
            h = new Sgls.MList(t.G);
            h.c = h;
            h.b = h;
            g = new Sgls.MList(t._);
            g.c = g;
            g.b = g;
            f = new Sgls.MList(t.e);
            f.c = f;
            f.b = f;
            e = new Sgls.MList(t.k);
            e.c = e;
            e.b = e;
            dies = new Sgls.MList(t.l);
            dies.c = dies;
            dies.b = dies;
            kills = new Sgls.MList(t.m);
            kills.c = kills;
            kills.b = kills;
            b = t.i;
            a = H.b([], b);
            a0 = H.b([], b);
            a1 = H.b([], b);
            b = H.b([], b);
            a2 = 0;
            a3 = new T.PlrZombie(
                s,
                q,
                r,
                a5,
                p,
                o,
                n,
                m,
                l,
                k,
                j,
                i,
                h,
                g,
                f,
                e,
                dies,
                kills,
                a,
                a0,
                a1,
                b,
                a2,
                a2,
                a2,
                $.W(),
                a2,
            );
            a3.a1(s, q, r, a5);
            a3.a6 = new T.cp(a3);
            a3.aj = this;
            a3.e = T.getMinionName(this.r);
            // sklZombieName
            // 丧尸
            a3.r = LangData.get_lang("KYSn");
            r = this.r;
            a3.y = r.y;
            r.L.j(0, a3.a6);
            a3.az();
            a3.l = a7.n() * $.C();
            this.r.y.aZ(a3);
            r = a8.a;
            r.push($.K());
            // sklZombie
            // [0][召唤亡灵]
            r.push(
                T.RunUpdate_init(
                    LangData.get_lang("apma"),
                    this.r,
                    a6,
                    a5,
                    a5,
                    $.a6(),
                    $.d0(),
                    100,
                ),
            );
            // sklZombied
            // [2]变成了[1]
            q = LangData.get_lang("kXba");
            s = this.r;
            a2 = a3.fx;
            b = new T.HPlr(a2);
            b.a = a3.e;
            b.d = a2;
            r.push(T.RunUpdate_init(q, s, b, a6, H.b([a6], t.j), 0, 1000, 100));
            return true;
        }
        return false;
    },
    $ify: 1,
};
T.BossWeapon.prototype = {
    b3(a) {
        a.dB(0, LangData.fZ(this.c.e), $.t());
        this.cN(a);
    },
    cB(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k = c[d],
            j = a[d],
            i = d + 1,
            h = c[i];
        i = a[i];
        s = d + $.t();
        r = c[s];
        s = a[s];
        for (q = 0, p = q; p < $.B(); ++p) {
            o = d + p;
            n = c[o];
            m = b[o];
            l = n - m;
            if (l > q) b[o] = m + l;
            else {
                n = $.at();
                if (m < n) b[o] = m + n;
            }
        }
        return Math.abs(k - j) + Math.abs(h - i) + Math.abs(r - s);
    },
    bn() {
        var r = this.c;
        this.cB(r.E, r.t, this.d, $.ap());
        this.dW();
    },
};
T.SklDeathNote.prototype = {
    au(a, b) {
        var s = this.fx;
        if (s != null && s.fx > 0)
            if (b) return s.y != this.r.y;
            else return a.n() < 128;
        return false;
    },
    W() {
        this.r.G.j(0, this.fr);
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var s, r, q;
        d.a.push(
            T.RunUpdate_init(
                LangData.get_lang("NbSn"),
                this.r,
                this.fx,
                null,
                null,
                $.as(),
                1000,
                100,
            ),
        );
        s = this.fx;
        s.aF(s.fx, this.r, T.ad(), c, d);
        s = this.r;
        s.cy = s.cy - $.cX();
        r = s.go;
        q = 0;
        if (r > q) s.go = q;
        this.fx = null;
    },
    aD(a, b, c, d) {
        var s;
        if (a > 0) {
            s = this.r;
            s = b != s && T.bW(b.fr + b.dy, s.fr + s.dx, c);
        } else s = false;
        if (s) this.fx = b;
    },
};
T.WeaponDeathNote.prototype = {
    b6() {
        var s,
            r = new T.SklDeathNote(0);
        r.e = true;
        r.fr = new T.PostDamageImpl(r);
        s = this.c;
        r.ao(s, 1);
        s.k1.push(r);
        s = s.k2;
        (s && C.Array).j(s, r);
    },
};
T.DummyChargeMeta.prototype = {
    gT() {
        return 0;
    },
    K(a, b) { },
    $ix: 1,
};
T.GuiYue.prototype = {
    b3(a) { },
    bn() { },
    b6() {
        this.c.r2.m(0, $.a7(), new T.DummyChargeMeta());
    },
};
T.NoWeapon.prototype = {
    b3(a) { },
    bn() { },
    b6() { },
};
T.RinickModifier.prototype = {
    cs() {
        var s,
            r = this.c,
            q = r.q,
            p = H._arrayInstanceType(q).i("y<1,l*>");
        p = this.r = P.List_List_of(new H.y(q, new T.k3(), p), true, p.i("M.E"));
        r = r.q;
        q = $.ap();
        r = r[q];
        s = $.r5();
        if (r < s) p[q] = s - r;
        else p[q] = 0;
        this.dV();
    },
    b6() {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l = this.c;
        l.rx.j(0, new T.RinickModifierUpdateState());
        // Rinick
        if (l.e != $.iL()) {
            for (
                l = l.k2, s = l.length, r = 0;
                r < l.length;
                l.length === s || (0, H.F)(l), ++r
            ) {
                q = l[r];
                p = q.f;
                if (p == 0) {
                    q.f = $.C();
                    q.W();
                } else q.f = C.JsInt.ez(p, 1);
            }
            return;
        }
        lst = [0, 2, 15, 18, 27, 28, 32, 37, 38];
        // for (s = [0, $.t(), $.eT(), $.iH(), $.pu(), $.iI(), $.at(), $.pH(), $.lL()], r = 0; r < 9; ++r) {
        for (s = lst, r = 0; r < 9; ++r) {
            o = s[r];
            q = l.k2[o];
            if (q.f == 0) {
                q.f = $.av();
                q.W();
            } else H.ve(J.b4(o));
        }
        for (
            s = l.k2, p = s.length, r = 0;
            r < s.length;
            s.length === p || (0, H.F)(s), ++r
        ) {
            q = s[r];
            if (!(q instanceof T.ActionSkill)) {
                n = q.f;
                if (n == 0) {
                    q.f = $.aR();
                    q.W();
                } else q.f = n + $.aR();
            }
        }
        m = new T.SklAokijiIceAge(0);
        m.ao(l, $.as());
        s = l.k1;
        s.push(m);
        p = l.k2;
        (p && C.Array).j(p, m);
        m = new T.SklYuriControl(0);
        m.ao(l, $.Z());
        s.push(m);
        p = l.k2;
        (p && C.Array).j(p, m);
        m = new T.hy($.t(), 0);
        m.r = l;
        $.av();
        s.push(m);
        s = l.k2;
        (s && C.Array).j(s, m);
        m.r.L.j(0, m);
        l.x1.j(0, new T.RinickModifierPreAction(l));
    },
};
T.k3.prototype = {
    $1(a) {
        return $.b2() - a;
    },
    $S: 2,
};
T.RinickModifierPreAction.prototype = {
    ga4() {
        return $.ao();
    },
    aN(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o = {};
        o.a = false;
        s = this.r;
        s.r2.aw(0, new T.k2(o));
        if (o.a) {
            o = d.a;
            r = o.length;
            s.bL(s, d);
            if (o.length !== r) {
                // weaponRModifierUse
                // [0]使用[属性修改器]
                C.Array.co(
                    o,
                    r,
                    T.RunUpdate_init(
                        LangData.get_lang("UeyA"),
                        s,
                        null,
                        null,
                        null,
                        $.a6(),
                        1000,
                        100,
                    ),
                );
                o.push($.K());
            }
        }
        o = s.y;
        q = o.a.e.length;
        o = o.f.length;
        p = C.JsInt.am(q - o, 1) - o;
        o = 0;
        if (p > o) {
            q = new T.SklRinickModifierClone(p, o);
            q.ao(s, o);
            return q;
        }
        return a;
    },
};
T.k2.prototype = {
    $2(a, b) {
        if (b.gT() < 0) this.a.a = true;
    },
    $S: 16,
};
T.RinickModifierUpdateState.prototype = {
    ga4() {
        return $.ao();
    },
    ar(a) {
        var s = a.q,
            r = 0,
            q = s[r],
            p = $.b2();
        if (q < p) {
            s[r] = p;
            a.ch = p;
        }
        r = 1;
        if (s[r] < p) {
            s[r] = p;
            a.cx = p;
        }
        r = $.t();
        if (s[r] < p) {
            s[r] = p;
            a.cy = p + $.eU();
        }
        r = $.B();
        if (s[r] < p) {
            s[r] = p;
            a.db = p;
        }
        r = $.C();
        if (s[r] < p) {
            s[r] = p;
            a.dx = p;
        }
        r = $.X();
        if (s[r] < p) {
            s[r] = p;
            a.dy = p;
        }
        r = $.a4();
        if (s[r] < p) {
            s[r] = p;
            a.fr = p;
        }
    },
};
T.SklRinickModifierClone.prototype = {
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            j = null;
        this.r.l = c.n() * $.C() + $.cX();
        s = d.a;
        // weaponRModifierUse
        // [0]使用[属性修改器]
        s.push(
            T.RunUpdate_init(
                LangData.get_lang("UeyA"),
                this.r,
                j,
                j,
                j,
                $.a6(),
                1000,
                100,
            ),
        );
        for (r = 0, q = this.fr; r < q; ++r) {
            p = T.init_PlrClone(this.r);
            p.y = this.r.y;
            p.az();
            p.l = c.n() * $.C() + $.cX();
            this.r.y.aZ(p);
            s.push($.K());
            // sklCloned
            // 出现一个新的[1]
            o = LangData.get_lang("pKQn");
            n = this.r;
            m = p.fx;
            l = new T.HPlr(m);
            l.a = p.e;
            l.d = m;
            m = new T.RunUpdate(0, 1000, 100, o, n, l, j, j);
            m.aK(o, n, l, j, j, 0, 1000, 100);
            s.push(m);
        }
    },
};
T.hy.prototype = {
    dA(a, b) {
        C.Array.sp(this.r.q, 0);
        this.r.aU();
        this.r.cn();
    },
    dd(a, b) {
        var s,
            r,
            q = this.r.y,
            p = q.a.e.length;
        q = q.f.length;
        s = C.JsInt.am(p - q, 1) - q;
        if (s > 0) {
            b.a.push($.K());
            r = new T.SklRinickModifierClone(s, 0);
            r.ao(this.r, 1);
            r.v(H.b([], t.F), true, a, b);
        }
    },
};
T.SklS11.prototype = {
    au(a, b) {
        if (this.f == 0) return false;
        return (a.n() & 63) + this.f > this.r.fr;
    },
    aa(a, b, c) {
        return H.b([], t.F);
    },
    v(a, b, c, d) {
        var s,
            r,
            q,
            p,
            n = null,
            m = 1000,
            l = d.a;
        l.push(
            T.RunUpdate_init(LangData.get_lang("Rdya"), this.r, n, n, n, 0, m, 100),
        );
        if (c.n() < 64) {
            l.push(
                T.RunUpdate_init(LangData.get_lang("ibDN"), this.r, n, n, n, 0, m, 100),
            );
            this.fr = this.fr - 1;
        } else {
            s = c.ax($.ap());
            r = (c.n() & 31) + $.a4();
            q = this.r;
            p = q.q;
            p[s] = p[s] + r;
            q.F();
            l.push(
                T.RunUpdate_init(
                    "[" + H.as_string($.r6()[s]) + "]" + LangData.get_lang("zbya"),
                    this.r,
                    n,
                    r,
                    n,
                    0,
                    m,
                    100,
                ),
            );
        }
        q = this.r;
        q.l = q.l + $.cX();
        q = this.fr - (c.n() & 3);
        this.fr = q;
        if (q <= 0) {
            l.push(
                T.RunUpdate_init(LangData.get_lang("ToLa"), this.r, n, n, n, 0, m, 100),
            );
            if (this.f < $.as()) {
                l.push(
                    T.RunUpdate_init(
                        LangData.get_lang("BcJa"),
                        this.r,
                        n,
                        n,
                        n,
                        0,
                        m,
                        100,
                    ),
                );
                this.f = 0;
            } else {
                l.push(
                    T.RunUpdate_init(
                        LangData.get_lang("kHPN"),
                        this.r,
                        n,
                        n,
                        n,
                        0,
                        m,
                        100,
                    ),
                );
                this.f = 1;
            }
            this.r.aF((c.n() & 31) + $.aR(), this.r, T.ad(), c, d);
        }
    },
};
T.kb.prototype = {
    $1(a) {
        return J.rD(a);
    },
    $S: 55,
};
T.WeaponS11.prototype = {
    b3(a) {
        var s, r;
        this.cN(a);
        s = $.p2();
        r = 0;
        this.r = H.b([s, r, s, r, r, r, r, r], t.i);
    },
    b6() {
        var s = this.c,
            r = s.k2,
            q = new T.SklS11($.B(), 0);
        q.e = true;
        q.ao(s, $.d1());
        (r && C.Array).j(r, q);
    },
};
T.Weapon.prototype = {
    b3(a) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m,
            l,
            k,
            j,
            i,
            h,
            g,
            e = a.c;
        e.toString;
        s = H._arrayInstanceType(e).i("y<1,l*>");
        this.d = P.List_List_of(new H.y(e, new T.ko(), s), true, s.i("M.E"));
        this.e = a.ax($.bg());
        r = a.ax($.av());
        e = $.a4();
        s = this.d;
        q = s && C.Array;
        if (r === e) {
            p = q.al(s, $.bg(), $.aI());
        } else {
            e = q.al(s, $.bg(), $.aI());
            s = H._arrayInstanceType(e).i("y<1,l*>");
            p = P.List_List_of(new H.y(e, new T.kp(), s), true, s.i("M.E"));
            p[r] = $.iH();
        }
        o = 0;
        for (e = p.length, n = o, m = n, l = 0; l < e; ++l) {
            k = p[l];
            if (k > o) {
                ++n;
                m += k;
            }
        }
        m *= $.B();
        e = this.d;
        j = (e && C.Array).al(e, o, $.av());
        C.Array.aJ(j);
        i = j[1] + j[$.C()] + n;
        for (k = 0, h = i; (e = $.ap()), k < e; ++k) {
            g = C.d.P(i * p[k], m);
            h -= g * $.B();
            this.r[k] = g;
        }
        if (p[e] > 0) this.r[e] = h;
    },
    cB(a, b, c, d) {
        var s,
            r,
            q,
            p,
            o,
            n,
            m = c[d] - a[d],
            l = 1,
            k = d + l,
            j = c[k] - a[k];
        k = $.t();
        s = d + k;
        r = c[s] - a[s];
        s = 0;
        if (m > s && j > s && r > s) {
            q = d + C.JsInt.V(m + j + r + $.q8(), $.B());
            p = c[q];
            o = b[q];
            n = C.d.P(p - o, k) + l;
            if (n > s) b[q] = o + n;
        }
        return Math.abs(m) + Math.abs(j) + Math.abs(r);
    },
    bn() {
        // preUpgrade
        var s,
            r,
            q,
            o = 0;
        for (s = $.Z(), r = this.c; s < $.d1(); s += $.B()) {
            o += this.cB(r.E, r.t, this.d, s);
        }
        r = C.JsInt.P($.mY() - o, $.a4());
        this.f = r;
        q = 0;
        if (r < q) {
            this.f = q;
        }
    },
    cs() {
        // postUpgrade
        var s, r, q;
        for (s = 0, r = this.c; s < $.av(); ++s) {
            q = r.q;
            q[s] = q[s] + this.r[s];
        }
        this.b6();
    },
    b6() {
        // upgradeSkill
        var s = this.c.k1[this.e],
            r = s.f;
        if (r == 0) s.e = true;
        s.f = r + this.f;
    },
};
T.kq.prototype = {
    $2(a, b) {
        var s = new T.WeaponS11(a, b, P.aL($.av(), 0, false, t.B));
        s.a = a;
        return s;
    },
    $S: 56,
};
T.kr.prototype = {
    $2(a, b) {
        var s = new T.WeaponDeathNote(a, b, P.aL($.av(), 0, false, t.B));
        s.a = a;
        return s;
    },
    $S: 57,
};
T.ks.prototype = {
    $2(a, b) {
        var s;
        // Rinick
        if (b.b == $.iL()) {
            s = new T.RinickModifier(a, b, P.aL($.av(), 0, false, t.B));
            s.a = a;
            return s;
        } else return T.NoWeapon(a, b);
    },
    $S: 7,
};
T.kt.prototype = {
    $2(a, b) {
        var s;
        if (C.Array.w($.r1(), b.b)) {
            s = new T.GuiYue(a, b, P.aL($.av(), 0, false, t.B));
            s.a = a;
            return s;
        } else return T.NoWeapon(a, b);
    },
    $S: 7,
};
T.ku.prototype = {
    $2(a, b) {
        var s;
        if (C.Array.w($.rk(), b.b)) {
            s = new T.kv(a, b, P.aL($.av(), 0, false, t.B));
            s.a = a;
            return s;
        } else return T.NoWeapon(a, b);
    },
    $S: 7,
};
T.ko.prototype = {
    $1(a) {
        return (a & $.b2()) >>> 0;
    },
    $S: 2,
};
T.kp.prototype = {
    $1(a) {
        if (a > $.pN()) return a - $.b1();
        return 0;
    },
    $S: 2,
};
T.hc.prototype = {
    aD(a, b, c, d) {
        if (b.y == this.r.z) return;
        if (this.ch === d) {
            if (this.Q && b != this.cx) this.cx = b;
        } else {
            this.ch = d;
            this.cx = b;
            this.Q = true;
            d.b.push(this.gdr());
        }
    },
};
T.kv.prototype = {
    b3(a) { },
    bn() { },
    b6() {
        var s = new T.hc(0),
            r = this.c;
        s.ao(r, 1);
        r.k1.push(s);
    },
};
T.ij.prototype = {};
T.ShieldStat.prototype = {};

LangData.SuperRC4.prototype = {
    // MARK: RC4 init
    dB(a, b, c) {
        // init rc4
        var s,
            r,
            q,
            p,
            o,
            n,
            m = b.length;
        for (s = this.c, r = 0; r < c; ++r)
            for (q = 0, p = 0; p < 256; ++p) {
                o = b[C.JsInt.V(p, m)];
                n = s[p];
                q = (q + n + o) & 255;
                s[p] = s[q];
                s[q] = n;
            }
        this.a = this.b = 0;
    },
    dH(a, b) {
        // sortList
        var s,
            r,
            q,
            p,
            o,
            n,
            m = a.length;
        if (m <= 1) return a;
        s = H.b([], t.i);
        C.Array.sp(s, m);
        for (r = 0; r < m; ++r) s[r] = r;
        for (q = 0, r = 0; r < 2; ++r)
            for (p = 0; p < m; ++p) {
                o = this.ax(m);
                n = s[p];
                q = C.JsInt.V(q + n + o, m);
                s[p] = s[q];
                s[q] = n;
            }
        m = t.fh.aL(b.i("0*")).i("y<1,2>");
        // return X.map((e) => list[e]).toList();
        return P.List_List_of(
            new H.y(s, new LangData.k_(a, b), m),
            true,
            m.i("M.E"),
        );
    },
    fi(a) {
        // pick<T>
        var s = a.length;
        if (s === 1) return a[0];
        else if (s > 1) return a[this.ax(s)];
        return null;
    },
    b5(a) {
        return this.fi(a, t.z);
    },
    fj(a, b) {
        // pickSkip<T>
        var s,
            r,
            q = a.length;
        if (q === 1) {
            // if (!J.Y(a[0], b)) return a[0]
            if (a[0] !== b) return a[0];
        } else if (q > 1) {
            s = C.Array.aT(a, b);
            if (s < 0) return a[this.ax(a.length)];
            r = this.ax(a.length - 1);
            return a[r >= s ? r + 1 : r];
        }
        return null;
    },
    fk(a, b) {
        return this.fj(a, b, t.z);
    },
    fl(a, b) {
        // pickSkipRange<TT>
        var first,
            skip_len,
            q,
            n,
            len = b.length;
        if (len === 0) return this.b5(a);
        first = C.Array.geT(b); // first
        skip_len = b.length;
        if (a.length > skip_len) {
            q = C.Array.aT(a, first);
            n = this.ax(a.length - skip_len);
            return a[n >= q ? n + skip_len : n];
        }
        return null;
    },
    fm(a, b) {
        return this.fl(a, b, t.z);
    },
    gbo() {
        // rFFFF
        return ((this.n() << 8) | this.n()) >>> 0;
    },
    ax(a) {
        // nextInt
        var n, round;
        if (a === 0) return 0;
        n = this.n();
        round = a;
        do {
            n = ((n << 8) | this.n()) >>> 0;
            if (n >= a) n = C.JsInt.V(n, a);
            round = C.JsInt.am(round, 8);
        } while (round !== 0);
        return n;
    },
};
LangData.k_.prototype = {
    $1(a) {
        return this.a[a];
    },
    $S() {
        return this.b.i("0*(l*)");
    },
};

(function aliases() {
    // MARK: 类型别名
    var s = J.Interceptor.prototype;
    s.dO = s.k;

    s = J.bE.prototype;
    s.dQ = s.k;

    s = P.L.prototype;
    s.dP = s.bV;

    s = W.Element.prototype;
    s.bY = s.aA;

    s = W.eD.prototype;
    s.dX = s.aM;

    s = T.PlrBoss.prototype;
    s.cM = s.a7;

    s = T.Plr.prototype;
    s.bB = s.aU;
    s.dS = s.bP;
    s.dR = s.bs;
    s.dT = s.F;

    s = T.Skill.prototype;
    s.bC = s.a9;
    s.bZ = s.bx;
    s.dU = s.aa;

    s = T.ActionSkill.prototype;
    s.aX = s.au;

    s = T.Weapon.prototype;
    s.cN = s.b3;
    s.dW = s.bn;
    s.dV = s.cs;
})();
(function installTearOffs() {
    // MARK: 静态实例
    var static_2 = hunkHelpers._static_2,
        static_1 = hunkHelpers._static_1,
        static_0 = hunkHelpers._static_0,
        instance_2u = hunkHelpers._instance_2u,
        install_static_tearoff = hunkHelpers.installStaticTearOff,
        instance_1i = hunkHelpers._instance_1i,
        instance_0i = hunkHelpers._instance_0i,
        instance_1u = hunkHelpers._instance_1u,
        install_instance_tear_off = hunkHelpers.installInstanceTearOff,
        instance_0u = hunkHelpers._instance_0u;
    static_2(J, "bO", "t1", 59);
    static_1(H, "uv", "mv", 10);

    static_1(P, "uK", "_AsyncRun__scheduleImmediateJsOverride", 4);
    static_1(P, "uL", "_AsyncRun__scheduleImmediateWithSetImmediate", 4);
    static_1(P, "uM", "_AsyncRun__scheduleImmediateWithTimer", 4);
    static_0(P, "ow", "_startMicrotaskLoop", 0);
    static_2(P, "uN", "ux", 9);
    instance_2u(P._Future.prototype, "geg", "be", 9);

    install_static_tearoff(W, "uV", 4, null, ["$4"], ["tT"], 20, 0);
    install_static_tearoff(W, "uW", 4, null, ["$4"], ["tU"], 20, 0);
    static_2(HtmlRenderer, "oD", "rU", 62);

    let html_holder = HtmlRenderer.inner_render.prototype;
    instance_1i(html_holder, "gfb", "fc", 31);
    instance_1i(html_holder, "gff", "ds", 8);
    instance_0i(html_holder, "gbc", "dI", 0);
    instance_1u(html_holder, "gfd", "fe", 33);
    install_instance_tear_off(
        html_holder,
        "gel",
        0,
        0,
        null,
        ["$1", "$0"],
        ["c5", "em"],
        34,
        0,
        0,
    );
    instance_0u((html_holder = T.Plr.prototype), "gfJ", "fK", 19);
    instance_0u(html_holder, "gbT", "dE", 19);

    static_1(Sgls, "vg", "tv", 8);
    install_static_tearoff(T, "v6", 5, null, ["$5"], ["ty"], 1, 0);
    install_static_tearoff(T, "v7", 5, null, ["$5"], ["tA"], 1, 0);
    install_static_tearoff(T, "v9", 5, null, ["$5"], ["tC"], 1, 0);
    install_static_tearoff(T, "oI", 5, null, ["$5"], ["tD"], 1, 0);
    install_static_tearoff(T, "oJ", 5, null, ["$5"], ["tE"], 1, 0);
    install_static_tearoff(T, "mE", 5, null, ["$5"], ["tF"], 1, 0);
    install_static_tearoff(T, "vb", 5, null, ["$5"], ["tI"], 1, 0);
    install_static_tearoff(T, "v8", 5, null, ["$5"], ["tB"], 1, 0);
    install_static_tearoff(T, "va", 5, null, ["$5"], ["tG"], 1, 0);
    static_2(T, "v4", "DummyRunUpdates_init", 63);
    static_2(T, "mD", "DummyRunUpdates", 64);
    static_2(T, "v5", "t6", 43);
    install_static_tearoff(T, "ad", 5, null, ["$5"], ["tx"], 1, 0);
    install_static_tearoff(T, "oH", 5, null, ["$5"], ["tz"], 1, 0);
    install_instance_tear_off(
        T.CovidState.prototype,
        "gf9",
        0,
        5,
        null,
        ["$5"],
        ["fa"],
        1,
        0,
        0,
    );
    instance_2u(T.SklCounter.prototype, "gdr", "f8", 54);
})();
(function inheritance() {
    // MARK: 继承链
    var mixin = hunkHelpers.mixin,
        inherit = hunkHelpers.inherit,
        inherit_many = hunkHelpers.inheritMany;
    inherit(P.Object, null);
    inherit_many(P.Object, [
        H.m8,
        J.Interceptor,
        J.db,
        P.O,
        P.ev,
        P.L,
        H.cv,
        P.fv,
        H.du,
        H.hV,
        H.kh,
        H.NullThrownFromJavaScriptException,
        H.ExceptionAndStackTrace,
        H.eE,
        H.c_,
        P.aU,
        H.jK,
        H.fA,
        H.JSSyntaxRegExp,
        H.ew,
        H.kz,
        H.bK,
        H.l3,
        H.Rti,
        H.ib,
        H.iu,
        P._TimerImpl,
        P.i_,
        P.f3,
        P.i4,
        P._FutureListener,
        P._Future,
        P.i0,
        P.em,
        P.hO,
        P.hP,
        P.im,
        P.i1,
        P.i3,
        P.i7,
        P.ii,
        P.io,
        P.lf,
        P.eM,
        P.kV,
        P.ie,
        P.z,
        P.dY,
        P.fg,
        P.js,
        P.lc,
        P.lb,
        P.dq,
        P.Duration,
        P.fM,
        P.el,
        P.kG,
        P.jm,
        P.N,
        P.iq,
        P.cH,
        W.j8,
        W.m5,
        W.cP,
        W.cr,
        W.dN,
        W.eD,
        W.is,
        W.dv,
        W.kE,
        W.l_,
        W.ix,
        P._StructuredClone,
        P.kw,
        P.eJ,
        P.jQ,
        P.kT,
        Y.RC4,
        L.ProfileWinChance,
        V.ProfileMain,
        X.ProfileFind,
        S.fK,
        HtmlRenderer.inner_render,
        HtmlRenderer.PlrGroup,
        HtmlRenderer.PlrView,
        Sgls.a_,
        Sgls.MEntry,
        T.IMeta,
        T.Plr,
        T.CovidMeta,
        T.Engine,
        T.Grp,
        T.IPlr,
        T.HDamage,
        T.HRecover,
        T.RunUpdate,
        T.aq,
        T.bG,
        T.Weapon,
        T.DummyChargeMeta,
    ]);
    inherit_many(J.Interceptor, [
        J.fw,
        J.cs,
        J.bE,
        J.JsArray,
        J.JsNumber,
        J.JsString,
        H.dJ,
        H.ab,
        W.fn,
        W.Blob,
        W.CanvasRenderingContext2D,
        W.i6,
        W.bb,
        W.ja,
        W.jb,
        W.o,
        W.c4,
        W.jL,
        W.ig,
        W.il,
        W.iy,
        W.iA,
    ]);
    inherit_many(J.bE, [
        J.PlainJavaScriptObject,
        J.UnknownJavaScriptObject,
        J.JavaScriptFunction,
    ]);
    inherit(J.JsUnmodifiableArray, J.JsArray);
    inherit_many(J.JsNumber, [J.JsInt, J.jF]);
    inherit_many(P.O, [
        H.fz,
        H.dO,
        P.bc,
        H.JsNoSuchMethodError,
        H.hU,
        H.RuntimeError,
        H.i9,
        P.f2,
        P.fL,
        P.aS,
        P.hW,
        P.hS,
        P.bJ,
        P.fh,
        P.CyclicInitializationError,
    ]);
    inherit(P.dE, P.ev);
    inherit_many(P.dE, [H.cJ, W.az]);
    inherit(H.ff, H.cJ);
    inherit_many(P.L, [H.A, H.c6, H.cf, P.dy, H.ip, Sgls.MList]);
    inherit_many(H.A, [H.M, H.dC]);
    inherit(H.dr, H.c6);
    inherit_many(P.fv, [H.fB, H.hX]);
    inherit_many(H.M, [H.y, H.a9, P.id]);
    inherit(H.NullError, P.bc);
    inherit_many(H.c_, [
        H.j5,
        H.j6,
        H.TearOffClosure,
        H.JsLinkedHashMap_values_closure,
        H.lv,
        H.lx,
        P.kB,
        P._AsyncRun__initializeScheduleImmediate_closure,
        P._awaitOnObject_closure,
        P.kK,
        P._Future__propagateToListeners_handleWhenCompleteCallback_closure,
        P.ke,
        P._RootZone_bindCallback_closure,
        P.Duration_toString_sixDigits,
        P.Duration_toString_twoDigits,
        W.jf,
        W.kF,
        W.jP,
        W.jO,
        W.l0,
        W.l1,
        W.l7,
        P.lE,
        P.lF,
        L.iS,
        L.iT,
        L.iU,
        V.j0,
        V.j1,
        X.iX,
        X.iY,
        X.iZ,
        HtmlRenderer.jx,
        HtmlRenderer.jy,
        HtmlRenderer.jw,
        HtmlRenderer.addPlrToTable,
        HtmlRenderer.jB,
        HtmlRenderer.jC,
        HtmlRenderer.jD,
        HtmlRenderer.jV,
        HtmlRenderer._renderItem,
        HtmlRenderer.lq,
        Sgls.k5,
        Sgls.k6,
        T.SklCloneCallback,
        T.jk,
        T.jj,
        T.jl,
        T.ji,
        T.lD,
        T.BoostPassive,
        T.k3,
        T.kb,
        T.ko,
        T.kp,
        LangData.k_,
    ]);
    inherit_many(H.TearOffClosure, [H.StaticClosure, H.BoundClosure]);
    inherit(P.dG, P.aU);
    inherit_many(P.dG, [H.JsLinkedHashMap, P.ic, W.i2]);
    inherit_many(H.j6, [
        H.lw,
        P._awaitOnObject_closure0,
        P._wrapJsFunctionForAsync_closure,
        P.kL,
        P.jM,
        W.kd,
        W.le,
        P.l5,
        P.l6,
        P.ky,
        V.j_,
        HtmlRenderer.jA,
        Sgls.k7,
        LangData.lA,
        T.SklHealCallback,
        T.jX,
        T.jY,
        T.k2,
        T.kq,
        T.kr,
        T.ks,
        T.kt,
        T.ku,
    ]);
    inherit(H.hZ, P.dy);
    inherit(H.NativeTypedArray, H.ab);
    inherit_many(H.NativeTypedArray, [
        H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin,
        H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin,
    ]);
    inherit(
        H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin_FixedLengthListMixin,
        H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin,
    );
    inherit(
        H.NativeTypedArrayOfDouble,
        H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin_FixedLengthListMixin,
    );
    inherit(
        H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin_FixedLengthListMixin,
        H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin,
    );
    inherit(
        H.NativeTypedArrayOfInt,
        H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin_FixedLengthListMixin,
    );
    inherit_many(H.NativeTypedArrayOfInt, [
        H.fE,
        H.fF,
        H.fG,
        H.fH,
        H.fI,
        H.dL,
        H.cx,
    ]);
    inherit(H.eI, H.i9);
    inherit_many(H.j5, [
        P.kC,
        P.kD,
        P._TimerImpl_internalCallback,
        P.jp,
        P.kH,
        P.kO,
        P.kM,
        P.kJ,
        P.kN,
        P.kI,
        P._Future__propagateToListeners_handleWhenCompleteCallback,
        P._Future__propagateToListeners_handleValueCallback,
        P._Future__propagateToListeners_handleError,
        P.kf,
        P.l2,
        P.kW,
        P.lo,
        P.kY,
        P.km,
        P.kl,
        X.je,
        X.j9,
        HtmlRenderer.send_win_data,
        Sgls.k4,
    ]);
    inherit(P.cg, P.i4);
    inherit(P.cK, P.im);
    inherit(P.eF, P.em);
    inherit(P.cM, P.eF);
    inherit(P.i5, P.i3);
    inherit(P.er, P.i7);
    inherit(P.eG, P.ii);
    inherit(P._RootZone, P.lf);
    inherit(P.eC, P.eM);
    inherit(P.eu, P.eC);
    inherit(P.fi, P.hP);
    inherit_many(P.fg, [P.jg, P.jI]);
    inherit_many(P.fi, [P.jr, P.jJ, P.kn, P.kk]);
    inherit(P.kj, P.jg);
    inherit_many(P.aS, [P.cD, P.fs]);
    inherit_many(W.fn, [W.v, W.dH, W.eq]);
    inherit_many(W.v, [W.Element, W.b6, W.cL]);
    inherit_many(W.Element, [W.HtmlElement, P.p]);
    inherit_many(W.HtmlElement, [
        W.AnchorElement,
        W.AreaElement,
        W.BaseElement,
        W.BodyElement,
        W.CanvasElement,
        W.c0,
        W.fp,
        W.dQ,
        W.h4,
        W.ek,
        W.ce,
        W.en,
        W.hQ,
        W.hR,
        W.cI,
    ]);
    inherit(W.co, W.i6);
    inherit(W.dm, W.bb);
    inherit(W.File, W.Blob);
    inherit_many(W.o, [W.c8, W.aY]);
    inherit(W.bp, W.aY);
    inherit(W.ih, W.ig);
    inherit(W.dM, W.ih);
    inherit(W.hN, W.il);
    inherit(W.iz, W.iy);
    inherit(W.ex, W.iz);
    inherit(W.iB, W.iA);
    inherit(W.eH, W.iB);
    inherit(W.i8, W.i2);
    inherit(W.ia, P.hO);
    inherit(W.it, W.eD);
    inherit(P._StructuredCloneDart2Js, P._StructuredClone);
    inherit(P.kx, P.kw);
    inherit(P.cF, P.p);
    inherit(HtmlRenderer.fW, HtmlRenderer.PlrView);
    inherit_many(Sgls.MEntry, [
        T.Skill,
        T.UpdateStateEntry,
        T.PostDefendEntry,
        T.PostActionEntry,
        T.PreStepEntry,
        T.PreDefendEntry,
        T.PostDamageEntry,
        T.PreActionEntry,
        T.aF,
    ]);
    inherit_many(T.Skill, [
        T.ActionSkill,
        T.SklAokijiDefend,
        T.SklCovidDefend,
        T.SklIkarugaDefend,
        T.SklLazyDefend,
        T.SklMarioReraise,
        T.SklSlimeSpawn,
        T.SklCounter,
        T.SklDefend,
        T.SklHide,
        T.SklMerge,
        T.SklProtect,
        T.SklReflect,
        T.SklReraise,
        T.SklShield,
        T.SklUpgrade,
        T.SklZombie,
    ]);
    inherit_many(T.ActionSkill, [
        T.SklAbsorb,
        T.SklAccumulate,
        T.SklAssassinate,
        T.BerserkState,
        T.SklBerserk,
        T.SklCharge,
        T.SklCharm,
        T.SklClone,
        T.SklCritical,
        T.SklCurse,
        T.SklDisperse,
        T.SklExchange,
        T.SklFire,
        T.sklHalf,
        T.SklHaste,
        T.SklHeal,
        T.SklIce,
        T.SklIron,
        T.SklPoison,
        T.SklQuake,
        T.SklRapid,
        T.SklRevive,
        T.SklPossess,
        T.SklShadow,
        T.SklSlow,
        T.SklExplode,
        T.SklSummon,
        T.SklThunder,
        T.SklAokijiIceAge,
        T.SklConan,
        T.CovidState,
        T.SklCovidAttack,
        T.SklIkarugaAttack,
        T.LazyState,
        T.SklLazyAttack,
        T.SklMarioGet,
        T.SklSaitama,
        T.SklAttack,
        T.SklSimpleAttack,
        T.SkillVoid,
        T.SklDeathNote,
        T.SklRinickModifierClone,
        T.SklS11,
    ]);
    inherit_many(T.UpdateStateEntry, [
        T.CharmState,
        T.HasteState,
        T.IceState,
        T.SlowState,
        T.UpdateStateImpl,
        T.RinickModifierUpdateState,
    ]);
    inherit_many(T.IMeta, [
        T.MinionCount,
        T.FireState,
        T.SklSlimeSpawnState,
        T.MergeState,
        T.ZombieState,
    ]);
    inherit_many(T.Plr, [
        T.PlrClone,
        T.Minion,
        T.PlrBoss,
        T.PlrBoost,
        T.PlrBossTest,
        T.PlrBossTest2,
        T.PlrEx,
        T.PlrSeed_,
    ]);
    inherit_many(T.PostDefendEntry, [
        T.CurseState,
        T.PostDefendImpl,
        T.ShieldStat,
    ]);
    inherit_many(T.PostActionEntry, [T.PoisonState, T.PostActionImpl]);
    inherit_many(T.Minion, [T.PlrShadow, T.PlrSummon, T.PlrZombie]);
    inherit_many(T.PlrBoss, [
        T.PlrBossAokiji,
        T.PlrBossConan,
        T.PlrBossCovid,
        T.PlrBossIkaruga,
        T.PlrBossLazy,
        T.PlrBossMario,
        T.PlrBossMosquito,
        T.PlrBossSaitama,
        T.PlrBossSlime,
        T.PlrBossSonic,
        T.PlrBossYuri,
    ]);
    inherit(T.PlrSeed, T.PlrSeed_);
    inherit(T.BossSlime2, T.PlrBossSlime);
    inherit(T.SklYuriControl, T.SklCharm);
    inherit_many(T.IPlr, [T.NPlr, T.HPlr, T.MPlr, T.DPlr]);
    inherit_many(T.RunUpdate, [T.RunUpdateCancel, T.RunUpdateWin]);
    inherit(T.PreStepImpl, T.PreStepEntry);
    inherit(T.PostDamageImpl, T.PostDamageEntry);
    inherit_many(T.PreActionEntry, [T.PreActionImpl, T.RinickModifierPreAction]);
    inherit(T.cp, T.aF);
    inherit(T.ij, T.PreDefendEntry);
    inherit(T.ProtectStat, T.ij);
    inherit(T.ShieldStat_, T.ShieldStat);
    inherit_many(T.Weapon, [
        T.BossWeapon,
        T.WeaponDeathNote,
        T.GuiYue,
        T.NoWeapon,
        T.RinickModifier,
        T.WeaponS11,
        T.kv,
    ]);
    inherit(T.hy, T.SklMarioReraise);
    inherit(T.hc, T.SklCounter);
    inherit(LangData.SuperRC4, Y.RC4);

    mixin(H.cJ, H.hV);
    mixin(H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin, P.z);
    mixin(
        H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin_FixedLengthListMixin,
        H.du,
    );
    mixin(H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin, P.z);
    mixin(
        H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin_FixedLengthListMixin,
        H.du,
    );
    mixin(P.cK, P.i1);
    mixin(P.ev, P.z);
    mixin(P.eM, P.dY);
    mixin(W.i6, W.j8);
    mixin(W.ig, P.z);
    mixin(W.ih, W.cr);
    mixin(W.il, P.aU);
    mixin(W.iy, P.z);
    mixin(W.iz, W.cr);
    mixin(W.iA, P.z);
    mixin(W.iB, W.cr);
    mixin(T.ij, T.IMeta);
    mixin(T.ShieldStat, T.IMeta);
})();
var init = {
    typeUniverse: {
        eC: new Map(),
        tR: {},
        eT: {},
        tPV: {},
        sEA: [],
    },
    mangledGlobalNames: {
        l: "int",
        bu: "double",
        vc: "num",
        m: "String",
        ac: "bool",
        N: "Null",
        w: "List",
    },
    mangledNames: {},
    types: [
        "~()",
        "~(u*,u*,l*,b9*,aq*)",
        "l*(l*)",
        "@(u*)",
        "~(~())",
        "~(@)",
        "N(o*)",
        "bL*(m*,u*)",
        "~(o*)",
        "~(H,ba)",
        "m(m)",
        "@()",
        "m(l)",
        "ac(aN)",
        "ac(m)",
        "l*(l*,l*)",
        "N(m*,x*)",
        "m*(c7*)",
        "N()",
        "m*()",
        "ac(Q,m,m,cP)",
        "w<l*>*()",
        "N(@)",
        "N(@,@)",
        "~(@,@)",
        "@(@,@)",
        "~(v,v?)",
        "N(~())",
        "@(@)",
        "N(m*,l*)",
        "ac*(u*)",
        "~(c8*)",
        "N(H,ba)",
        "~(m*)",
        "~([ac*])",
        "w<w<m*>*>*(m*)",
        "w<m*>*(m*)",
        "N(m*,ax*)",
        "~(ax*)",
        "~(o)",
        "bl<N>*()",
        "~(m,m)",
        "m*(H*)",
        "l*(bG*,bG*)",
        "w<w<bu*>*>*()",
        "ac*(l*)",
        "ac*(q*)",
        "ac(v)",
        "@(@,m)",
        "m*(b7*)",
        "~(l*)",
        "~(H?,H?)",
        "U<@>(@)",
        "~(q*,l*,l*)",
        "~(b9*,aq*)",
        "m*(m*)",
        "ep*(m*,u*)",
        "eo*(m*,u*)",
        "@(m)",
        "l(@,@)",
        "N(@,ba)",
        "~(l,@)",
        "l*(ax*,ax*)",
        "l*(b7*,b7*)",
        "l*(u*,u*)",
        "N(m*,m*)",
    ],
    interceptorsByTag: null,
    leafTags: null,
    arrayRti: Symbol("$ti"),
};
H._Universe_addRules(
    init.typeUniverse,
    JSON.parse(
        '{"fO":"bE","bs":"bE","bn":"bE","vt":"o","zC":"o","vs":"p","zG":"p","vu":"r","zK":"r","zI":"v","xZ":"v","zP":"bp","vw":"aY","vv":"b6","A_":"b6","zM":"c9","zL":"ab","fw":{"ac":[]},"cs":{"N":[]},"bE":{"nM":[]},"E":{"w":["1"],"A":["1"]},"jG":{"E":["1"],"w":["1"],"A":["1"]},"dz":{"l":[]},"bD":{"m":[],"fN":[]},"fz":{"O":[]},"ff":{"z":["l"],"w":["l"],"A":["l"],"z.E":"l"},"dO":{"bc":[],"O":[]},"A":{"L":["1"]},"M":{"A":["1"],"L":["1"]},"c6":{"L":["2"],"L.E":"2"},"dr":{"c6":["1","2"],"A":["2"],"L":["2"],"L.E":"2"},"y":{"M":["2"],"A":["2"],"L":["2"],"L.E":"2","M.E":"2"},"cf":{"L":["1"],"L.E":"1"},"cJ":{"z":["1"],"w":["1"],"A":["1"]},"a9":{"M":["1"],"A":["1"],"L":["1"],"L.E":"1","M.E":"1"},"dP":{"bc":[],"O":[]},"fx":{"O":[]},"hU":{"O":[]},"eE":{"ba":[]},"h3":{"O":[]},"aT":{"aU":["1","2"],"bo":["1","2"]},"dC":{"A":["1"],"L":["1"],"L.E":"1"},"ct":{"o0":[],"fN":[]},"ew":{"c7":[]},"hZ":{"L":["o1"],"L.E":"o1"},"bK":{"c7":[]},"ip":{"L":["c7"],"L.E":"c7"},"cw":{"ag":["1"],"ab":[]},"c9":{"z":["bu"],"ag":["bu"],"w":["bu"],"ab":[],"A":["bu"],"z.E":"bu"},"dK":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"]},"fE":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"fF":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"fG":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"fH":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"fI":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"dL":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"cx":{"z":["l"],"ag":["l"],"w":["l"],"ab":[],"A":["l"],"z.E":"l"},"i9":{"O":[]},"eI":{"bc":[],"O":[]},"U":{"bl":["1"]},"f3":{"O":[]},"cg":{"i4":["1"]},"cK":{"im":["1"]},"cM":{"em":["1"]},"eF":{"em":["1"]},"eu":{"dY":["1"],"A":["1"]},"dy":{"L":["1"]},"dE":{"z":["1"],"w":["1"],"A":["1"]},"dG":{"aU":["1","2"],"bo":["1","2"]},"aU":{"bo":["1","2"]},"eC":{"dY":["1"],"A":["1"]},"ic":{"aU":["m","@"],"bo":["m","@"]},"id":{"M":["m"],"A":["m"],"L":["m"],"L.E":"m","M.E":"m"},"w":{"A":["1"]},"o1":{"c7":[]},"m":{"fN":[]},"f2":{"O":[]},"bc":{"O":[]},"fL":{"O":[]},"aS":{"O":[]},"cD":{"O":[]},"fs":{"O":[]},"hW":{"O":[]},"hS":{"O":[]},"bJ":{"O":[]},"fh":{"O":[]},"fM":{"O":[]},"el":{"O":[]},"fj":{"O":[]},"iq":{"ba":[]},"Q":{"v":[]},"c8":{"o":[]},"bp":{"o":[]},"cP":{"aN":[]},"r":{"Q":[],"v":[]},"f0":{"Q":[],"v":[]},"f1":{"Q":[],"v":[]},"cn":{"Q":[],"v":[]},"bY":{"Q":[],"v":[]},"di":{"Q":[],"v":[]},"b6":{"v":[]},"c0":{"Q":[],"v":[]},"cq":{"bX":[]},"fp":{"Q":[],"v":[]},"az":{"z":["v"],"w":["v"],"A":["v"],"z.E":"v"},"dM":{"z":["v"],"w":["v"],"ag":["v"],"A":["v"],"z.E":"v"},"dQ":{"Q":[],"v":[]},"h4":{"Q":[],"v":[]},"ek":{"Q":[],"v":[]},"hN":{"aU":["m","m"],"bo":["m","m"]},"ce":{"Q":[],"v":[]},"en":{"Q":[],"v":[]},"hQ":{"Q":[],"v":[]},"hR":{"Q":[],"v":[]},"cI":{"Q":[],"v":[]},"aY":{"o":[]},"cL":{"v":[]},"ex":{"z":["v"],"w":["v"],"ag":["v"],"A":["v"],"z.E":"v"},"eH":{"z":["bb"],"w":["bb"],"ag":["bb"],"A":["bb"],"z.E":"bb"},"i2":{"aU":["m","m"],"bo":["m","m"]},"i8":{"aU":["m","m"],"bo":["m","m"]},"dN":{"aN":[]},"eD":{"aN":[]},"it":{"aN":[]},"is":{"aN":[]},"eJ":{"c4":[]},"cF":{"p":[],"Q":[],"v":[]},"p":{"Q":[],"v":[]},"fK":{"aN":[]},"fW":{"ax":[]},"c":{"L":["1*"],"L.E":"1*"},"cy":{"u":[]},"aZ":{"n":["@"]},"cB":{"n":["@"]},"bH":{"n":["@"]},"aB":{"n":["@"]},"ah":{"n":["@"]},"aV":{"n":["@"]},"bq":{"n":["@"]},"aF":{"n":["@"]},"fy":{"n":["@"]},"q":{"n":["@"]},"b5":{"q":[],"n":["@"]},"eb":{"q":[],"bq":[],"n":["@"]},"e1":{"q":[],"n":["@"]},"h5":{"q":[],"n":["@"],"x":[]},"h7":{"q":[],"n":["@"]},"dd":{"q":[],"aV":[],"n":["@"],"x":[]},"h9":{"q":[],"n":["@"]},"ha":{"q":[],"n":["@"],"x":[]},"dj":{"aZ":[],"n":["@"],"x":[]},"e3":{"q":[],"n":["@"]},"dI":{"x":[]},"dR":{"bC":[],"u":[]},"e4":{"q":[],"n":["@"]},"e5":{"q":[],"n":["@"]},"dn":{"aB":[],"n":["@"],"x":[]},"hf":{"q":[],"n":["@"]},"hh":{"q":[],"n":["@"]},"hi":{"q":[],"n":["@"]},"c3":{"x":[]},"cc":{"q":[],"n":["@"]},"e7":{"q":[],"n":["@"]},"dw":{"aZ":[],"n":["@"],"x":[]},"hk":{"q":[],"n":["@"]},"e8":{"q":[],"n":["@"]},"dx":{"aZ":[],"n":["@"],"x":[]},"e9":{"q":[],"n":["@"]},"ho":{"q":[],"n":["@"],"x":[]},"dS":{"bq":[],"n":["@"],"x":[]},"ht":{"q":[],"n":["@"]},"hv":{"q":[],"n":["@"]},"ec":{"q":[],"n":["@"]},"hx":{"q":[],"n":["@"]},"hu":{"q":[],"n":["@"]},"fS":{"bC":[],"u":[]},"hB":{"q":[],"n":["@"]},"eh":{"aZ":[],"n":["@"],"x":[]},"hG":{"q":[],"n":["@"]},"hj":{"q":[],"n":["@"]},"fT":{"bC":[],"u":[]},"hH":{"q":[],"n":["@"]},"hI":{"q":[],"n":["@"]},"f5":{"u":[]},"h6":{"q":[],"aB":[],"n":["@"]},"e2":{"q":[],"n":["@"]},"fP":{"u":[]},"fU":{"u":[]},"fV":{"u":[]},"fQ":{"u":[]},"cz":{"u":[]},"f6":{"u":[]},"hb":{"q":[],"n":["@"]},"f7":{"u":[]},"dk":{"x":[]},"dl":{"q":[],"n":["@"]},"he":{"q":[],"ah":[],"n":["@"]},"hd":{"q":[],"n":["@"]},"f8":{"u":[]},"hn":{"q":[],"aB":[],"n":["@"]},"hm":{"q":[],"n":["@"]},"de":{"u":[]},"dB":{"q":[],"n":["@"],"x":[]},"hq":{"q":[],"ah":[],"n":["@"]},"hp":{"q":[],"n":["@"]},"df":{"u":[]},"hr":{"q":[],"n":["@"],"x":[]},"ea":{"q":[],"aF":[],"n":["@"]},"f9":{"u":[]},"fa":{"u":[]},"hA":{"q":[],"n":["@"]},"fR":{"u":[]},"bZ":{"u":[]},"fb":{"bZ":[],"bC":[],"u":[]},"hF":{"x":[]},"ef":{"q":[],"aF":[],"n":["@"]},"fc":{"u":[]},"fd":{"u":[]},"eg":{"q":[],"n":["@"]},"aM":{"bC":[],"u":[]},"bd":{"aZ":[],"n":["@"]},"fY":{"cB":[],"n":["@"]},"dT":{"aB":[],"n":["@"]},"cA":{"ah":[],"n":["@"]},"ca":{"aV":[],"n":["@"]},"b8":{"bq":[],"n":["@"]},"cp":{"aF":[],"n":["@"]},"h8":{"q":[],"n":["@"]},"hD":{"q":[],"n":["@"]},"cb":{"q":[],"ah":[],"n":["@"]},"e6":{"q":[],"aB":[],"n":["@"]},"hl":{"q":[],"ah":[],"n":["@"]},"fC":{"x":[]},"hs":{"q":[],"fy":[],"n":["@"]},"dV":{"bH":[],"n":["@"],"x":[]},"ed":{"q":[],"bH":[],"n":["@"]},"hw":{"q":[],"aF":[],"n":["@"]},"e0":{"aB":[],"n":["@"],"x":[]},"hC":{"q":[],"aV":[],"n":["@"]},"hJ":{"q":[],"ah":[],"n":["@"],"x":[]},"bI":{"q":[],"n":["@"]},"fX":{"bC":[],"u":[]},"hY":{"x":[]},"hK":{"q":[],"fy":[],"n":["@"]},"hg":{"q":[],"n":["@"]},"fl":{"x":[]},"h0":{"aV":[],"n":["@"]},"h1":{"aZ":[],"n":["@"]},"ee":{"q":[],"n":["@"]},"hy":{"q":[],"aF":[],"n":["@"]},"hz":{"q":[],"n":["@"]},"hc":{"q":[],"ah":[],"n":["@"]}}',
    ),
);
H._Universe_addErasedTypes(
    init.typeUniverse,
    JSON.parse(
        '{"db":1,"A":1,"cv":1,"fB":2,"hX":1,"du":1,"hV":1,"cJ":1,"fA":1,"cw":1,"hO":1,"hP":2,"i1":1,"i5":1,"i3":1,"eF":1,"i7":1,"er":1,"ii":1,"eG":1,"io":1,"ie":1,"dy":1,"dE":1,"dG":2,"eC":1,"ev":1,"eM":1,"fg":2,"fi":2,"fv":1,"ia":1,"cr":1,"dv":1,"n":1}',
    ),
);
var u = {
    b: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&'()*+,-./:;<=>?@[]^_`{|}~ ",
    c: "Error handler must accept one Object or one Object and a StackTrace as arguments, and return a value of the returned future's type",
};
var t = (function rtii() {
    var find_type = H.findType;
    return {
        fh: find_type("@<l*>"),
        cR: find_type("cn"),
        fK: find_type("bX"),
        b: find_type("bY"),
        gw: find_type("A<@>"),
        R: find_type("Q"),
        u: find_type("O"),
        aD: find_type("o"),
        c8: find_type("cq"),
        Z: find_type("rS"),
        h: find_type("bl<@>"),
        I: find_type("c4"),
        x: find_type("E<aN>"),
        s: find_type("E<m>"),
        gn: find_type("E<@>"),
        dC: find_type("E<l>"),
        H: find_type("E<b5*>"),
        Y: find_type("E<rS*>"),
        eV: find_type("E<b7*>"),
        j: find_type("E<fr*>"),
        D: find_type("E<w<@>*>"),
        E: find_type("E<w<w<m*>*>*>"),
        t: find_type("E<w<m*>*>"),
        gt: find_type("E<w<bu*>*>"),
        f: find_type("E<w<l*>*>"),
        gr: find_type("E<cy*>"),
        L: find_type("E<u*>"),
        F: find_type("E<bG*>"),
        ak: find_type("E<ax*>"),
        U: find_type("E<aX*>"),
        M: find_type("E<aq*>"),
        q: find_type("E<q*>"),
        gN: find_type("E<eb*>"),
        V: find_type("E<m*>"),
        he: find_type("E<bu*>"),
        i: find_type("E<l*>"),
        T: find_type("cs"),
        eH: find_type("nM"),
        O: find_type("bn"),
        aU: find_type("ag<@>"),
        d5: find_type("aT<m*,u*>"),
        aH: find_type("w<@>"),
        l: find_type("c<aF*>"), // MList<DieEntry>
        m: find_type("c<fy*>"), // MList<KillEntry>
        G: find_type("c<bq*>"),
        k: find_type("c<ah*>"),
        e: find_type("c<aB*>"),
        g: find_type("c<aV*>"),
        _: find_type("c<bH*>"),
        p: find_type("c<cB*>"),
        n: find_type("c<aZ*>"),
        eO: find_type("bo<@,@>"),
        bQ: find_type("y<m,w<w<m*>*>*>"),
        dG: find_type("y<m,w<m*>*>"),
        fj: find_type("y<m*,m>"),
        bK: find_type("dH"),
        bZ: find_type("dJ"),
        dD: find_type("ab"),
        bm: find_type("cx"),
        P: find_type("N"),
        K: find_type("H"),
        eh: find_type("fN"),
        fv: find_type("o0"),
        bJ: find_type("a9<m>"),
        ew: find_type("cF"),
        N: find_type("m"),
        g7: find_type("p"),
        aW: find_type("cI"),
        eK: find_type("bc"),
        bI: find_type("bs"),
        h9: find_type("cL"),
        ac: find_type("az"),
        eI: find_type("U<@>"),
        fJ: find_type("U<l>"),
        y: find_type("ac"),
        gR: find_type("bu"),
        z: find_type("@"),
        J: find_type("@(H)"),
        C: find_type("@(H,ba)"),
        ci: find_type("l"),
        aJ: find_type("dd*"),
        ch: find_type("df*"),
        b8: find_type("bZ*"),
        o: find_type("dj*"),
        cu: find_type("dk*"),
        w: find_type("dm*"),
        dK: find_type("dn*"),
        A: find_type("c0*"),
        eF: find_type("fo*"),
        a: find_type("c3*"),
        e_: find_type("dw*"),
        fM: find_type("bC*"),
        W: find_type("x*"),
        ck: find_type("dx*"),
        r: find_type("dB*"),
        eG: find_type("w<m*>*"),
        gl: find_type("n<@>*"),
        cF: find_type("bo<@,@>*"),
        f5: find_type("dI*"),
        aw: find_type("0&*"),
        c: find_type("H*"),
        cr: find_type("u*"),
        ax: find_type("dS*"),
        Q: find_type("dV*"),
        v: find_type("dX*"),
        d: find_type("aq*"),
        eb: find_type("e0*"),
        c5: find_type("q*"),
        S: find_type("eh*"),
        X: find_type("m*"), // String
        B: find_type("l*"), // int
        bG: find_type("bl<N>?"),
        cK: find_type("H?"),
        di: find_type("vc"),
        aX: find_type("~(H)"),
        da: find_type("~(H,ba)"),
    };
})();
(function constants() {
    var make_const_list = hunkHelpers.makeConstList;
    C.BodyElement = W.BodyElement.prototype;
    C.H = W.CanvasElement.prototype;
    C.k = W.CanvasRenderingContext2D.prototype;
    C.i = W.co.prototype;
    C.h = W.c0.prototype;
    C.J = J.Interceptor.prototype;
    C.Array = J.JsArray.prototype;
    C.JsInt = J.JsInt.prototype;
    C.d = J.JsNumber.prototype;
    C.String = J.JsString.prototype;
    C.JavaScriptFunction = J.JavaScriptFunction.prototype;
    C.Q = W.dQ.prototype;
    C.PlainJavaScriptObject = J.PlainJavaScriptObject.prototype;
    C.R = W.ek.prototype;
    C.j = W.ce.prototype;
    C.u = W.en.prototype;
    C.UnknownJavaScriptObject = J.UnknownJavaScriptObject.prototype;
    C.U = W.eq.prototype;
    C.v = W.eH.prototype;
    C.V = new P.js();
    C.o = new P.jr();

    C.w = () => {
        var toStringFunction = Object.prototype.toString;

        function getTag(o) {
            var s = toStringFunction.call(o);
            return s.substring(8, s.length - 1);
        }

        function getUnknownTag(object, tag) {
            if (/^HTML[A-Z].*Element$/.test(tag)) {
                var name = toStringFunction.call(object);
                if (name == "[object Object]") return null;
                return "HTMLElement";
            }
        }

        function prototypeForTag(tag) {
            if (typeof window == "undefined") return null;
            if (typeof window[tag] == "undefined") return null;
            var constructor = window[tag];
            if (typeof constructor != "function") return null;
            return constructor.prototype;
        }

        function discriminator(tag) {
            return null;
        }
        var isBrowser = typeof navigator == "object";
        return {
            getTag: getTag,
            getUnknownTag: getUnknownTag,
            prototypeForTag: prototypeForTag,
            discriminator: discriminator,
        };
    };

    C.C = new P.jI();
    C.D = new P.fM();
    C.e = new P.kj();
    C.E = new P.kn();
    C.F = new P.kT();
    C.f = new P._RootZone();
    C.G = new P.iq();
    C.I = new P.Duration(0);
    C.L = new P.jJ(null);
    C.M = H.b(
        make_const_list([
            "*::class",
            "*::dir",
            "*::draggable",
            "*::hidden",
            "*::id",
            "*::inert",
            "*::itemprop",
            "*::itemref",
            "*::itemscope",
            "*::lang",
            "*::spellcheck",
            "*::title",
            "*::translate",
            "A::accesskey",
            "A::coords",
            "A::hreflang",
            "A::name",
            "A::shape",
            "A::tabindex",
            "A::target",
            "A::type",
            "AREA::accesskey",
            "AREA::alt",
            "AREA::coords",
            "AREA::nohref",
            "AREA::shape",
            "AREA::tabindex",
            "AREA::target",
            "AUDIO::controls",
            "AUDIO::loop",
            "AUDIO::mediagroup",
            "AUDIO::muted",
            "AUDIO::preload",
            "BDO::dir",
            "BODY::alink",
            "BODY::bgcolor",
            "BODY::link",
            "BODY::text",
            "BODY::vlink",
            "BR::clear",
            "BUTTON::accesskey",
            "BUTTON::disabled",
            "BUTTON::name",
            "BUTTON::tabindex",
            "BUTTON::type",
            "BUTTON::value",
            "CANVAS::height",
            "CANVAS::width",
            "CAPTION::align",
            "COL::align",
            "COL::char",
            "COL::charoff",
            "COL::span",
            "COL::valign",
            "COL::width",
            "COLGROUP::align",
            "COLGROUP::char",
            "COLGROUP::charoff",
            "COLGROUP::span",
            "COLGROUP::valign",
            "COLGROUP::width",
            "COMMAND::checked",
            "COMMAND::command",
            "COMMAND::disabled",
            "COMMAND::label",
            "COMMAND::radiogroup",
            "COMMAND::type",
            "DATA::value",
            "DEL::datetime",
            "DETAILS::open",
            "DIR::compact",
            "DIV::align",
            "DL::compact",
            "FIELDSET::disabled",
            "FONT::color",
            "FONT::face",
            "FONT::size",
            "FORM::accept",
            "FORM::autocomplete",
            "FORM::enctype",
            "FORM::method",
            "FORM::name",
            "FORM::novalidate",
            "FORM::target",
            "FRAME::name",
            "H1::align",
            "H2::align",
            "H3::align",
            "H4::align",
            "H5::align",
            "H6::align",
            "HR::align",
            "HR::noshade",
            "HR::size",
            "HR::width",
            "HTML::version",
            "IFRAME::align",
            "IFRAME::frameborder",
            "IFRAME::height",
            "IFRAME::marginheight",
            "IFRAME::marginwidth",
            "IFRAME::width",
            "IMG::align",
            "IMG::alt",
            "IMG::border",
            "IMG::height",
            "IMG::hspace",
            "IMG::ismap",
            "IMG::name",
            "IMG::usemap",
            "IMG::vspace",
            "IMG::width",
            "INPUT::accept",
            "INPUT::accesskey",
            "INPUT::align",
            "INPUT::alt",
            "INPUT::autocomplete",
            "INPUT::autofocus",
            "INPUT::checked",
            "INPUT::disabled",
            "INPUT::inputmode",
            "INPUT::ismap",
            "INPUT::list",
            "INPUT::max",
            "INPUT::maxlength",
            "INPUT::min",
            "INPUT::multiple",
            "INPUT::name",
            "INPUT::placeholder",
            "INPUT::readonly",
            "INPUT::required",
            "INPUT::size",
            "INPUT::step",
            "INPUT::tabindex",
            "INPUT::type",
            "INPUT::usemap",
            "INPUT::value",
            "INS::datetime",
            "KEYGEN::disabled",
            "KEYGEN::keytype",
            "KEYGEN::name",
            "LABEL::accesskey",
            "LABEL::for",
            "LEGEND::accesskey",
            "LEGEND::align",
            "LI::type",
            "LI::value",
            "LINK::sizes",
            "MAP::name",
            "MENU::compact",
            "MENU::label",
            "MENU::type",
            "METER::high",
            "METER::low",
            "METER::max",
            "METER::min",
            "METER::value",
            "OBJECT::typemustmatch",
            "OL::compact",
            "OL::reversed",
            "OL::start",
            "OL::type",
            "OPTGROUP::disabled",
            "OPTGROUP::label",
            "OPTION::disabled",
            "OPTION::label",
            "OPTION::selected",
            "OPTION::value",
            "OUTPUT::for",
            "OUTPUT::name",
            "P::align",
            "PRE::width",
            "PROGRESS::max",
            "PROGRESS::min",
            "PROGRESS::value",
            "SELECT::autocomplete",
            "SELECT::disabled",
            "SELECT::multiple",
            "SELECT::name",
            "SELECT::required",
            "SELECT::size",
            "SELECT::tabindex",
            "SOURCE::type",
            "TABLE::align",
            "TABLE::bgcolor",
            "TABLE::border",
            "TABLE::cellpadding",
            "TABLE::cellspacing",
            "TABLE::frame",
            "TABLE::rules",
            "TABLE::summary",
            "TABLE::width",
            "TBODY::align",
            "TBODY::char",
            "TBODY::charoff",
            "TBODY::valign",
            "TD::abbr",
            "TD::align",
            "TD::axis",
            "TD::bgcolor",
            "TD::char",
            "TD::charoff",
            "TD::colspan",
            "TD::headers",
            "TD::height",
            "TD::nowrap",
            "TD::rowspan",
            "TD::scope",
            "TD::valign",
            "TD::width",
            "TEXTAREA::accesskey",
            "TEXTAREA::autocomplete",
            "TEXTAREA::cols",
            "TEXTAREA::disabled",
            "TEXTAREA::inputmode",
            "TEXTAREA::name",
            "TEXTAREA::placeholder",
            "TEXTAREA::readonly",
            "TEXTAREA::required",
            "TEXTAREA::rows",
            "TEXTAREA::tabindex",
            "TEXTAREA::wrap",
            "TFOOT::align",
            "TFOOT::char",
            "TFOOT::charoff",
            "TFOOT::valign",
            "TH::abbr",
            "TH::align",
            "TH::axis",
            "TH::bgcolor",
            "TH::char",
            "TH::charoff",
            "TH::colspan",
            "TH::headers",
            "TH::height",
            "TH::nowrap",
            "TH::rowspan",
            "TH::scope",
            "TH::valign",
            "TH::width",
            "THEAD::align",
            "THEAD::char",
            "THEAD::charoff",
            "THEAD::valign",
            "TR::align",
            "TR::bgcolor",
            "TR::char",
            "TR::charoff",
            "TR::valign",
            "TRACK::default",
            "TRACK::kind",
            "TRACK::label",
            "TRACK::srclang",
            "UL::compact",
            "UL::type",
            "VIDEO::controls",
            "VIDEO::height",
            "VIDEO::loop",
            "VIDEO::mediagroup",
            "VIDEO::muted",
            "VIDEO::preload",
            "VIDEO::width",
        ]),
        t.V,
    );
    C.N = H.b(make_const_list(["", "", "", "", "", "", "", "", "", ""]), t.V);
    C.O = H.b(
        make_const_list([
            "HEAD",
            "AREA",
            "BASE",
            "BASEFONT",
            "BR",
            "COL",
            "COLGROUP",
            "EMBED",
            "FRAME",
            "FRAMESET",
            "HR",
            "IMAGE",
            "IMG",
            "INPUT",
            "ISINDEX",
            "LINK",
            "META",
            "PARAM",
            "SOURCE",
            "STYLE",
            "TITLE",
            "WBR",
        ]),
        t.V,
    );
    C.P = H.b(make_const_list([]), t.V);
    C.r = H.b(make_const_list(["bind", "if", "ref", "repeat", "syntax"]), t.V);
    C.l = H.b(
        make_const_list([
            "A::href",
            "AREA::href",
            "BLOCKQUOTE::cite",
            "BODY::background",
            "COMMAND::icon",
            "DEL::cite",
            "FORM::action",
            "IMG::src",
            "INPUT::src",
            "INS::cite",
            "Q::cite",
            "VIDEO::poster",
        ]),
        t.V,
    );
    C.S = H.vp("N");
    C.T_kk = new P.kk(false);
})();
(function staticFields() {
    $.kU = null;
    $.bk = 0;
    $.dh = null;
    $.nE = null;
    $.oB = null;
    $.ov = null;
    $.oL = null;
    $.lt = null;
    $.ly = null;
    $.mA = null;
    $.cR = null;
    $.eN = null;
    $.eO = null;
    $.ms = false;
    $.P = C.f;
    $.ch = H.b([], H.findType("E<H>"));
    $.bA = null;
    $.m4 = null;
    $.nJ = null;
    $.nI = null;
    $.et = P.cu(t.N, t.Z);
    $.jU = 0;
    // PlrView plv = PlrView.dict[update.caster.idName];
    // $.ay -> plv
    $.ay = P.cu(t.X, H.findType("ax*"));
    $.rW = (() => {
        var s = t.X;
        return P.create_StringInt_map(
            [
                "aokiji",
                "R0lGODlhEAAQAMIDAAAAAEB2/4Kl/////////////////////yH5BAEKAAQALAAAAAAQABAAAANISLrQsJC1MVwkLgSqLW6bQFFi4ACjIGxDoI7gqHFsO9UsXgFuPXIr0Or3691kHGSMxuRMSMPWi3IK/UqeTM7UuDio3YskDEkAADs=",
                "conan",
                "R0lGODlhEAAQAMIAAAAAANAYISpXyf///wAAAAAAAAAAAAAAACH5BAEKAAQALAAAAAAQABAAAANISATczkqBQasFcQlrBV6MsHGiEzQj5TEnELzM5cIsbdLLC+/6N/O/E6j3IP5ilVqrBUgNVi6HyDltSJoiVekTCU23me4DEkkAADs=",
                "covid",
                "R0lGODlhEAAQAIIAMf/GAOpK/f///wAAAP///wAAAAAAAAAAACH5BAEAAAQALAAAAAAQABAAAgNKSLrTvZC4AeqIqgEttoNU1wSOx1BBmoabNJGDGpjURlqBAJf6ba+WWgwmy3kcRYFO6AKolMuJBCAqmjIUJKd12moemNrxgnF9IgkAOw==",
                "ikaruga",
                "R0lGODlhEAAQAMIEAAAAAAcHB7MABFuV/////////////////yH5BAEKAAcALAAAAAAQABAAAANKeLrRsZA1Qlw8jmoCGgzaMAiC9iiTOFBk6WGUypLUk4pbW00EvhG0XWz1C2Z8o9kO1uuNSqUKCqR60l5MZ1AqAf0skczudJliFwkAOw==",
                "lazy",
                "R0lGODlhEAAQAMICAAAAAAgICP+3t/////+3t/+3t/+3t/+3tyH5BAEKAAQALAAAAAAQABAAAANPSLpM8K9JMCqQDoIwwp3VQG1fBnFeWFKW6GnL1rFi87raSQQcvXEhHkeQGwqOncBxKeAxj07io6kkQZXPKJM3YCa7yySwIhwnd5qAokhIAAA7",
                "mario",
                "R0lGODlhEAAQAIEAMQAAANgoAPz8/AAAACH5BAEAAAAALAAAAAAQABAAAQJBhD2px6AhRFgshRvvHCdJGH1CgoDhKXEWqLHboH2tvEItpq3ZvXvnfPIphooI0YgcLXyjpLKDQnE6g6hxSiVSAAUAOw==",
                "mosquito",
                "R0lGODlhEAAQAKECAAAAAP8AAP///////yH5BAEKAAMALAAAAAAQABAAAAJB3ICpaCnxRIRKoAkpsJu/AHpch4DgxR0kcK6GKrGB+zrylrzH2OL62or9SKcYYIgr5mq82eXI5AQtw1gxhVwwDAUAOw==",
                "saitama",
                "R0lGODlhEAAQAMIGAAAAAAgICGxsbP/AmP/PV/////jIUfjIUSH5BAEKAAcALAAAAAAQABAAAANKeLrRsZC1MVw8juraYNhUIVYSGIodZprPtG7ZC8YyFxSC8OZFAIi4nJAnAhgLx2DxZwQQCMZn7hmFOp/YKZZa3Xqth6bR1xADDgkAOw==",
                "seed",
                "R0lGODlhEAAQAMIDAAAAAG9tbUCy5////////////////////yH5BAEKAAQALAAAAAAQABAAAANFSLrQsJC1MVwkjuraVN6gA4CDIJCNSW5BkJon2LZpAMdzMLiAYN85HQ/28wWHpmJrN3sRjUya4xm0YJzNTmTKe1wkWkgCADs=",
                "slime",
                "R0lGODlhEAAQAMIEAAABAFaSRV6qSLn9qgAAAAAAAAAAAAAAACH5BAEKAAQALAAAAAAQABAAAANCSKrQvpA4QcWDrWoLsB5bxwDVYApB2jClaaaqRMIuCk92CuYBR8G9DSUjLBI3wMpRQzvhis4OqVUbjopKkczBvSQAADs=",
                "sonic",
                "R0lGODlhEAAQAMIDAAgICOgSJh9O/////////////////////yH5BAEKAAQALAAAAAAQABAAAANBSLrQsJA1IVwkjuraINDDsFUSFYZbh5knqj2T0LpUBp4jN9JpnJuc1S8UIGE+uUBRJRQonzXP5LlkSpCWy/URSQAAOw==",
                "yuri",
                "R0lGODlhEAAQAKEDAAAAAN4H28asxv///yH5BAEKAAMALAAAAAAQABAAAAI+hI85EB3s4DNBiFcvs3NjvmlL9WkesEDnKI7fw8Lpi6roMJ42jh8NNeEJVb+bsFc0HIfB5ZFhdPIO0mf0WAAAOw==",
            ],
            s,
            s,
        );
    })();
    $.mg = (() => {
        var s = t.X;
        return P.cu(s, s);
    })();
    $.k8 = (() => {
        var s = t.X;
        return P.cu(s, s);
    })();
    $.e_ = 0;
    $.mf = (() => {
        var s = t.i;
        return H.b(
            [
                H.b([255, 255, 255], s),
                H.b([255, 255, 255], s),
                H.b([0, 0, 0], s),
                H.b([0, 180, 0], s),
                H.b([0, 255, 0], s),
                H.b([255, 0, 0], s),
                H.b([255, 192, 0], s),
                H.b([255, 255, 0], s),
                H.b([0, 224, 128], s),
                H.b([255, 0, 128], s),
                H.b([255, 108, 0], s),
                H.b([0, 108, 255], s),
                H.b([0, 192, 255], s),
                H.b([0, 255, 255], s),
                H.b([128, 120, 255], s),
                H.b([128, 224, 255], s),
                H.b([255, 0, 255], s),
                H.b([40, 40, 255], s),
                H.b([128, 0, 255], s),
                H.b([0, 144, 0], s),
                H.b([144, 0, 0], s),
            ],
            t.f,
        );
    })();
    $.md = null;
    $.dZ = H.b([], t.f);
    $.me = H.b([], t.f);
    $.o5 = H.b([], t.f);
    $.od = (() => {
        var s = t.X;
        return P.cu(s, s);
    })();
    $.ox = "";
    $.lj = null;
    $.mb = 0;
    $.nV = 0;
    $.nW = 0;
})();
(function lazyInitializers() {
    var lazy_final = hunkHelpers.lazyFinal,
        lazy_old = hunkHelpers.lazyOld;
    lazy_final($, "vy", "oR", () =>
        H.getIsolateAffinityTag("_$dart_dartClosure"),
    );
    lazy_final($, "A0", "r7", () =>
        H.br(
            H.ki({
                toString: () => "$receiver$",
            }),
        ),
    );
    lazy_final($, "A1", "r8", () =>
        H.br(
            H.ki({
                $method$: null,
                toString: () => "$receiver$",
            }),
        ),
    );
    lazy_final($, "A2", "r9", () => H.br(H.ki(null)));
    lazy_final($, "A3", "ra", () =>
        H.br(
            (() => {
                var $argumentsExpr$ = "$arguments$";
                try {
                    null.$method$($argumentsExpr$);
                } catch (q) {
                    return q.message;
                }
            })(),
        ),
    );
    lazy_final($, "A6", "rd", () => H.br(H.ki(void 0)));
    lazy_final($, "A7", "re", () =>
        H.br(
            (() => {
                var $argumentsExpr$ = "$arguments$";
                try {
                    (void 0).$method$($argumentsExpr$);
                } catch (q) {
                    return q.message;
                }
            })(),
        ),
    );
    lazy_final($, "A5", "rc", () => H.br(H.o8(null)));
    lazy_final($, "A4", "rb", () =>
        H.br(
            (() => {
                try {
                    null.$method$;
                } catch (q) {
                    return q.message;
                }
            })(),
        ),
    );
    lazy_final($, "A9", "rg", () => H.br(H.o8(void 0)));
    lazy_final($, "A8", "rf", () =>
        H.br(
            (() => {
                try {
                    (void 0).$method$;
                } catch (q) {
                    return q.message;
                }
            })(),
        ),
    );
    lazy_final($, "Ae", "nw", () => P._AsyncRun__initializeScheduleImmediate());
    lazy_final($, "Aa", "rh", () => new P.km().$0());
    lazy_final($, "Ab", "ri", () => new P.kl().$0());
    lazy_final($, "vx", "oQ", () => ({}));
    lazy_final($, "Af", "rl", () =>
        P.nQ(
            [
                "A",
                "ABBR",
                "ACRONYM",
                "ADDRESS",
                "AREA",
                "ARTICLE",
                "ASIDE",
                "AUDIO",
                "B",
                "BDI",
                "BDO",
                "BIG",
                "BLOCKQUOTE",
                "BR",
                "BUTTON",
                "CANVAS",
                "CAPTION",
                "CENTER",
                "CITE",
                "CODE",
                "COL",
                "COLGROUP",
                "COMMAND",
                "DATA",
                "DATALIST",
                "DD",
                "DEL",
                "DETAILS",
                "DFN",
                "DIR",
                "DIV",
                "DL",
                "DT",
                "EM",
                "FIELDSET",
                "FIGCAPTION",
                "FIGURE",
                "FONT",
                "FOOTER",
                "FORM",
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
                "HEADER",
                "HGROUP",
                "HR",
                "I",
                "IFRAME",
                "IMG",
                "INPUT",
                "INS",
                "KBD",
                "LABEL",
                "LEGEND",
                "LI",
                "MAP",
                "MARK",
                "MENU",
                "METER",
                "NAV",
                "NOBR",
                "OL",
                "OPTGROUP",
                "OPTION",
                "OUTPUT",
                "P",
                "PRE",
                "PROGRESS",
                "Q",
                "S",
                "SAMP",
                "SECTION",
                "SELECT",
                "SMALL",
                "SOURCE",
                "SPAN",
                "STRIKE",
                "STRONG",
                "SUB",
                "SUMMARY",
                "SUP",
                "TABLE",
                "TBODY",
                "TD",
                "TEXTAREA",
                "TFOOT",
                "TH",
                "THEAD",
                "TIME",
                "TR",
                "TRACK",
                "TT",
                "U",
                "UL",
                "VAR",
                "VIDEO",
                "WBR",
            ],
            t.N,
        ),
    );
    lazy_final($, "vD", "mH", () => J.lX(P.m3(), "Opera", 0));
    lazy_final($, "vC", "oV", () => !$.mH() && J.lX(P.m3(), "Trident/", 0));
    lazy_final($, "vB", "oU", () => J.lX(P.m3(), "Firefox", 0));
    lazy_final($, "vA", "oT", () => "-" + $.oW() + "-");
    lazy_final($, "vE", "oW", () => {
        if ($.oU()) var q = "moz";
        else if ($.oV()) q = "ms";
        else q = $.mH() ? "o" : "webkit";
        return q;
    });
    lazy_old($, "zB", "iM", () => new X.je().$0());
    lazy_old($, "vz", "oS", () => new X.j9().$0());
    lazy_old($, "Ay", "rn", () => P.RegExp_RegExp("\\?\\?\\?"));
    lazy_old($, "Ax", "bV", () => new S.fK());
    lazy_old($, "zJ", "bU", () => W.nK());
    lazy_old($, "Av", "rm", () => P.RegExp_RegExp("\\[.*?\\]"));
    lazy_old($, "zT", "d7", () => 21);
    lazy_old($, "zV", "nv", () => new Sgls.k4().$0());
    lazy_old($, "zS", "nt", () => P.rM(t.X));
    lazy_old($, "zU", "nu", () => {
        var q = W.j4();
        q.width = 16;
        q.height = 16;
        return q;
    });
    lazy_old($, "zW", "lS", () => {
        var q = W.j4();
        q.width = 16;
        q.height = 16;
        return q;
    });
    lazy_old($, "zX", "d8", () => {
        var q = $.lS();
        q = (q && C.H).geJ(q);
        return (q && C.k).eN(q, 16, 16);
    });
    lazy_old($, "Az", "ro", () => P.o_());
    // MARK: 字符串反混淆
    lazy_old($, "yg", "cl", () => {
        // return LangData.j("bB", 89)
        return "!";
    });
    lazy_old($, "y0", "lO", () => {
        // return LangData.j("YA", 51)
        return "+";
    });
    lazy_old($, "y3", "n3", () => {
        // return LangData.j("CA", 66)
        return "@";
    });
    lazy_old($, "y4", "aD", () => {
        // return LangData.j("{[A", 63)
        return "@!";
    });
    lazy_old($, "ya", "n5", () => {
        // return LangData.j("DA", 57)
        return ":";
    });
    lazy_old($, "yh", "qc", () => {
        // return LangData.j("l1C~5RJB", 71)
        return "!test!";
    });
    lazy_old($, "zm", "nk", () => {
        // return LangData.j("lA", 39)
        return "\u0002";
    });
    lazy_old($, "zn", "qR", () => {
        // return LangData.j("iA", 33)
        return "\u0003";
    });
    lazy_old($, "yN", "iK", () => {
        // return O.j("=+A", 37)
        return "??";
    });
    lazy_old($, "y2", "d2", () => {
        // return LangData.j("+R/Iv*Y(WVEu;E", 21)
        return "assassinate";
    });
    lazy_old($, "yi", "d3", () => {
        // return LangData.j("<R;2&`|zWV", 30)
        return "exchange";
    });
    lazy_old($, "ym", "eZ", () => {
        // return LangData.j("U|,?M", 1)
        return "half";
    });
    lazy_old($, "y7", "a7", () => {
        // return LangData.j("@k%.*'GC", 5)
        return "charge";
    });
    lazy_old($, "yk", "eY", () => {
        // return LangData.j("K[WvM", 87)
        return "fire";
    });
    lazy_old($, "yr", "bS", () => {
        // return LangData.j("OZFE", 74)
        return "ice";
    });
    lazy_old($, "y_", "lN", () => {
        // return LangData.j("w1{fb_W(wTt-B", 16)
        return "accumulate";
    });
    lazy_old($, "yK", "bT", () => {
        // return LangData.j("PGOv0X*A", 77)
        return "piston";
    });
    lazy_old($, "y5", "aJ", () => LangData.j("xQrBQ}JLA", 99));
    lazy_old($, "y8", "aE", () => LangData.j("h)T*jpA", 81));
    lazy_old($, "ye", "bh", () => LangData.j("ayfH8tA", 39));
    lazy_old($, "yt", "n7", () => LangData.j("c6sZK", 71));
    lazy_old($, "zj", "bi", () => LangData.j("EaS1c", 5));
    lazy_old($, "yo", "d4", () => LangData.j("9s|Y@jA", 81));
    lazy_old($, "yc", "iJ", () => LangData.j("V_%Fz%}cF", 48));
    lazy_old($, "zg", "lR", () => {
        // return LangData.j("LGI)Za A", 74)
        return "shield";
    });
    lazy_old($, "yL", "d6", () => LangData.j("r9sG{s5|C", 36));
    lazy_old($, "zo", "nl", () => LangData.j("Z430:)1HG", 4));
    lazy_old($, "yf", "lP", () => LangData.j("e'teI>NNCU", 17));
    lazy_old($, "zA", "qZ", () => LangData.j("CXmc>1nB", 39));
    lazy_old($, "ze", "qM", () => {
        // return LangData.j("qnQymy)B", 38)
        return "shadow";
    });
    lazy_old($, "zl", "qQ", () => LangData.j("WG/z.8^B", 55));
    lazy_old($, "yE", "na", () => {
        // return LangData.j("EMzI&'T=]Q:wUF", 13)
        return "minionCount";
    });
    lazy_old($, "y6", "n4", () => {
        // return LangData.j("1m3tkgG&,{P", 97)
        return "bossName_";
    });
    lazy_old($, "yB", "lQ", () => {
        // return LangData.j("6ct2H)A", 11)
        return "mario";
    });
    lazy_old($, "zk", "qP", () => {
        // return LangData.j("`I|YpgA", 76)
        return "sonic";
    });
    lazy_old($, "yF", "qo", () => {
        // return LangData.j("$v&,:z_4~N", 62)
        return "mosquito";
    });
    lazy_old($, "zz", "qY", () => {
        // return LangData.j("jh&DG", 89)
        return "yuri";
    });
    lazy_old($, "zi", "qO", () => {
        // return LangData.j("~vBK@@A", 29)
        return "slime";
    });
    lazy_old($, "ys", "qh", () => {
        // return LangData.j("MWSWRPJLA", 99)
        return "ikaruga";
    });
    lazy_old($, "yb", "qb", () => {
        // return LangData.j("()9--8A", 54)
        return "conan";
    });
    lazy_old($, "y1", "q9", () => {
        // return LangData.j(" &~zX$CC", 55)
        return "aokiji";
    });
    lazy_old($, "yy", "d5", () => {
        // return LangData.j(":[+0Z", 31)
        return "lazy";
    });
    lazy_old($, "yd", "ck", () => {
        // return LangData.j("jtK1|]A", 31)
        return "covid";
    });
    lazy_old($, "zc", "qL", () => {
        // return LangData.j("ki9e8.M(G", 13)
        return "saitama";
    });
    lazy_old($, "yP", "iL", () => {
        // return LangData.j("5,G0b3[B", 51)
        return "Rinick";
    });
    lazy_old($, "yw", "n8", () => LangData.j("<2g5xSgD", 9));
    lazy_old($, "yx", "qk", () => LangData.j("&N8l5JCD", 30));
    lazy_old($, "yn", "n6", () => LangData.j("xKHh?e,D", 53));
    lazy_old($, "yA", "n9", () => LangData.j("]Kp3u~>B", 31));
    lazy_old($, "zx", "no", () => LangData.j(")a/8n!RE", 83));
    lazy_old($, "zs", "nm", () => LangData.j("{MxpF,@rO?LB", 82));
    lazy_old($, "yM", "nb", () => LangData.j("nS)Vs$[ M^3", 86));
    lazy_old($, "y9", "qa", () => LangData.j("lbb@`TID", 19));
    lazy_old($, "zu", "nn", () => LangData.j("`:W7Ze/ON.S+HIW", 22));
    lazy_old($, "zv", "qW", () => LangData.j("&%v5AaC/]<&>Z^X0#B", 58));
    lazy_old($, "zy", "np", () => LangData.j("_?d>JT-C", 37));
    lazy_old($, "yu", "qi", () => LangData.j("udp%0&+$r>dB", 94));
    lazy_old($, "zh", "nj", () => LangData.j("vx;rs", 50));
    lazy_old($, "yI", "qr", () => LangData.j("7YF", 48));
    lazy_old($, "yJ", "qs", () => LangData.j("KYXO", 32));
    lazy_old($, "zr", "qU", () => LangData.j("2V~6yfHkOb>", 49));
    lazy_old($, "yq", "qg", () => LangData.j("oz%!U'YF", 73));
    lazy_old($, "yv", "qj", () => LangData.j("b@U>k|&P@hk", 0));
    lazy_old($, "yO", "qt", () => LangData.j("ihMZ}G'RC", 77));
    lazy_old($, "zw", "qX", () => LangData.j("[w9L]M/>Ge/", 38));
    lazy_old($, "yp", "qf", () => LangData.j("@9Y.X", 51));
    lazy_old($, "zf", "qN", () => LangData.j("?%#<WpDE", 10));
    lazy_old($, "yj", "qd", () => LangData.j(",VV7pFUD", 15));
    lazy_old($, "zq", "qT", () => LangData.j("lzG^ex`E", 72));
    lazy_old($, "zt", "qV", () => LangData.j("*s]_EKXQ}W", 26));
    lazy_old($, "yz", "ql", () => LangData.j("<'L]+.]lLrYB", 65));
    lazy_old($, "zp", "qS", () => LangData.j("U`-Rl!IF", 73));
    lazy_old($, "yl", "qe", () => LangData.j("?hEGt00!>5nL[OI", 41));
    lazy_old($, "zd", "ni", () => {
        // return LangData.j("tU`0/mA", 2)
        return "seed:";
    });
    lazy_old($, "yC", "qm", () => {
        // return LangData.j(";kC;Z", 12)
        return "dio";
    });
    lazy_old($, "yD", "qn", () => LangData.j("Ox2j(}6B", 62));
    lazy_old($, "zb", "nh", () => {
        // return LangData.j("[uA.6OlzvO7Io;KYC<#H!O04nL9lDiKDyXAl?D", 53)
        return '<div class="smile s_win"></div>';
    });
    lazy_old($, "z5", "nf", () => {
        // return LangData.j("yW+04ekCs/(`M<^%pzOPaP!1g.9`f=6Iowx7KqyA", 12)
        return '<div class="smile s_lose"></div>';
    });
    lazy_old($, "yZ", "qA", () => {
        // return LangData.j("k/#av`/R%K.8Z7cPJ9pwz`{AF+bl~3A#IuZEVK'4QE", 95)
        return '<div class="smile s_elite1"></div>';
    });
    lazy_old($, "z_", "qB", () => {
        // return LangData.j("v$CbW=5[7IUs)PPLW,sxa=*&f1P>)'phAl2JRm,c,S", 83)
        return '<div class="smile s_elite2"></div>';
    });
    lazy_old($, "z0", "qC", () => {
        // return LangData.j("teGc0KOSrNDn<3!fVR;xwKG}r,gwB5]wrX:A]M-i)A", 47)
        return '<div class="smile s_elite3"></div>';
    });
    lazy_old($, "yS", "qv", () => {
        // return LangData.j("~6[*>;8,bI~u#l=L&&YF];/;,IMvuigm*[3EuNSB", 81)
        return '<div class="smile s_boss"></div>';
    });
    lazy_old($, "yW", "ne", () => {
        // return LangData.j("HOa,^Auk1x84LRKOnLivoA,^CvRYpI$Y&JxtF7P", 33)
        return '<div class="smile s_dmg0"></div>';
    });
    lazy_old($, "yX", "qy", () => {
        // return LangData.j("r;.1;m!Y`$*76X[kFwDg?m<on%f`.X:NNRQ)s^v=4G", 24)
        return '<div class="smile s_dmg120"></div>';
    });
    lazy_old($, "yY", "qz", () => {
        // return LangData.j("|Y`+RJRHLN.p,;hg%L5FNJDN7MKOXiBKr0vtWyC!eD", 45)
        return '<div class="smile s_dmg160"></div>';
    });
    lazy_old($, "yQ", "qu", () => {
        // return LangData.j("4TmcbC~p%FZ3OG+Nv~jBrzk7&MBPvE-'xObSK3%KlTmcRUA", 35)
        return '<div class="s_accumulate s_win"></div>';
    });
    lazy_old($, "yR", "nc", () => {
        // return LangData.j("j||XsipWY) l7j11O!(Mqi^.bZXl$Gh1z0YF~kMkhwe", 68)
        return '<div class="smile s_berserk"></div>';
    });
    lazy_old($, "yT", "nd", () => {
        // return LangData.j("[IwfNb&!5RS,05|n#na1Jbyuc9[0Gb?M`.w)|/~zD", 7)
        return '<div class="smile s_charm"></div>';
    });
    lazy_old($, "yV", "qx", () => {
        // return LangData.j("ai[u(+{WLzw?FbpUW~44<j{#'ZHo<,YST,twmLV9D", 72)
        return '<div class="smile s_curse"></div>';
    });
    lazy_old($, "z1", "qD", () => {
        // return LangData.j("m^Jd-SooyPlLaL/Ysyzz;S1Xa8kh4Zid1[SY;Ez^Jd8D", 59)
        return '<div class="smile s_exchange"></div>';
    });
    lazy_old($, "z2", "qE", () => {
        // return LangData.j("gM2vT&:&)xr*lb#RYZ:ZP&#[`yi*b5+ho<2JdcW<H", 64)
        return '<div class="smile s_haste"></div>';
    });
    lazy_old($, "z3", "qF", () => {
        // return LangData.j("U4|wQ;P'v0hw&aSMs)SbU;f[=1U-}*cln4|w./A", 80)
        return '<div class="smile s_ice"></div>';
    });
    lazy_old($, "z4", "qG", () => {
        // return LangData.j("j||XsipWY) l7j11O!(Mqi^.^v(d`hFV;7p4YRdB", 68)
        return '<div class="smile s_iron"></div>';
    });
    lazy_old($, "z6", "qH", () => {
        // return LangData.j("yW+04ekCs/(`M<^%pzOPaP!1*:+)XT_QG)Jj;j9,fE", 12)
        return '<div class="smile s_poison"></div>';
    });
    lazy_old($, "z8", "ng", () => {
        // return LangData.j("_vW+4>&y~Iv0z?VN#;^E8>?3&Gow5j0Q0fK1Ei/RoS", 85)
        return '<div class="smile s_revive"></div>';
    });
    lazy_old($, "z9", "qJ", () => {
        // return LangData.j("SWAyuI%B&,6%p;k8VH,Nd %*JE53*T,AxA#v{MB", 44)
        return '<div class="smile s_slow"></div>';
    });
    lazy_old($, "yU", "qw", () => {
        // return LangData.j("Gc[I~fhNT#6]XuGrfUx.`fSI=!'?Pa~kiiRw<W:o&UY", 14)
        return '<div class="smile s_counter"></div>';
    });
    lazy_old($, "z7", "qI", () => {
        // return LangData.j(">)z*M_<GhK0#T? P13VEIrAGEEjU3&ibv`7H'#?+@iM", 93)
        return '<div class="smile s_reflect"></div>';
    });
    lazy_old($, "za", "qK", () => {
        // return LangData.j("4TmcbC~p%FZ3OG+NROs)LBB[)kvXjGQy?A8^J'Kzl-B", 35)
        return '<div class="smile s_upgrade"></div>';
    });
    lazy_old($, "yG", "qp", () => {
        // return O.j("H<|dA6D5:4]j*v#HA'XH>zwoSP", 57)
        return "deepmess.com/namerena";
    });
    lazy_old($, "yH", "qq", () => {
        // return O.j("0fc/5.@{T*a]T^#TU9!P(q*yRaP@yG*Vp>'aEnltB", 31)
        return "https://deepmess.com/zh/namerena/";
    });
    lazy_old($, "zN", "nr", () => {
        // return P.dD([LangData.j("JIi6cgXO*d_", 22), $.iH(), LangData.j("Fmi6Vr!~c@]4ElFk,dC", 55), $.mO(), LangData.j("OeQh>Rep f~;YzR^Y%E", 16), $.lK()], t.X, t.B)
        /*  static Map<String, int> boosted = {
            b('田一人'):18,
            b('云剑狄卡敢'):25,
            b('云剑穸跄祇'):35
          };*/
        return P.create_StringInt_map(
            ["田一人", 18, "云剑狄卡敢", 25, "云剑穸跄祇", 35],
            t.X,
            t.B,
        );
    });
    lazy_old($, "zE", "r0", () => P.RegExp_RegExp("^\\s+[:@]*\\s*"));
    lazy_old($, "zF", "nq", () => P.RegExp_RegExp("\\s+$"));
    lazy_old($, "zD", "r_", () => P.RegExp_RegExp("\\r?\\n"));
    // MARK: 空 RunUpdate (newline)
    lazy_old($, "zR", "K", () => {
        var q = null;
        return T.RunUpdate_init("\n", q, q, q, q, 0, 1000, 100);
    });
    lazy_old($, "vq", "rp", () => $.mS());
    lazy_old($, "vr", "rq", () => $.C());
    // MARK: 数字反混淆
    lazy_old($, "wX", "at", () => {
        // return X.k("vF:G*ee&GC", 12)
        return 32;
    });
    lazy_old($, "vF", "a", () => {
        // return X.k("IIq4zN_QaD", 19)
        return 0;
    });
    lazy_old($, "vP", "i", () => {
        // return X.k("P1JU9kNX~I", 52)
        return 1;
    });
    lazy_old($, "wr", "t", () => {
        // return X.k("Oi}Eh'8SJR", 99)
        return 2;
    });
    lazy_old($, "wn", "ph", () => X.D("od`D$R=0SJ", 85));
    lazy_old($, "vY", "cZ", () => X.k("5>pu'qyiIM", 70));
    lazy_old($, "xq", "pM", () => X.k("_a3=L4dckG", 37));
    lazy_old($, "xe", "lM", () => X.k("p,,c!10-FQ", 93));
    lazy_old($, "wq", "pj", () => {
        // return X.D("qCDXr5,MXA", 61)
        return 1.7000000476837158;
    });
    lazy_old($, "wp", "pi", () => X.D("Lo=*]5Lg#G", 25));
    lazy_old($, "w9", "eU", () => X.k("uo2[vY3QwA", 3));
    lazy_old($, "wQ", "B", () => X.k("Cv.c@Ovh.D", 22));
    lazy_old($, "wa", "p8", () => X.k("o8#!>[]y<J", 57));
    lazy_old($, "xn", "mZ", () => X.D(" 2[vLvtX:A", 68));
    lazy_old($, "wl", "eV", () => X.D("6Ce~JmtqSF", 71));
    lazy_old($, "xu", "a6", () => X.k("&xM6z,hd#O", 85));
    lazy_old($, "vR", "ci", () => X.k("WxPb+b%'LN", 76));
    lazy_old($, "ws", "as", () => X.k("*:%S'eXt!J", 56));
    lazy_old($, "xt", "a4", () => {
        // return X.k("`8fQ/CxFQA", 2)
        return 6;
    });
    lazy_old($, "xA", "au", () => {
        // return X.k("[kT:g-|3XH", 42)
        return 64;
    });
    lazy_old($, "w1", "cj", () => X.D("`H)#qK]@HN", 15));
    lazy_old($, "xG", "ap", () => X.k("j1 6(jNX~I", 52));
    lazy_old($, "vO", "p1", () => {
        // return X.D("%>;B.O6'DA", 63)
        return 0.7799999713897705;
    });
    lazy_old($, "vK", "b0", () => X.D("KvLG}E$m7J", 7));
    lazy_old($, "xc", "C", () => {
        // return X.k("T,tQQy%'LN", 76)
        return 4;
    });
    lazy_old($, "wH", "eX", () => {
        // return X.k("$YcaZZ:WUG", 36)
        return 256;
    });
    lazy_old($, "wk", "pf", () => X.D("NS 98:}]PR", 92));
    lazy_old($, "wm", "pg", () => X.D("pa+s[!w!iR", 91));
    lazy_old($, "xh", "pK", () => X.k("KW3YIK.WUG", 36));
    lazy_old($, "xN", "b3", () => {
        // return X.k("}:|quIE(@P", 92)
        return 80;
    });
    lazy_old($, "vQ", "Z", () => {
        // return X.k("F]CU/7E(@P", 92)
        return 10;
    });
    lazy_old($, "wN", "pw", () => X.D("4S|&JW$AZI", 32));
    lazy_old($, "vG", "ao", () => {
        // return X.D("G*Oej(8SJR", 99)
        return 0;
    });
    lazy_old($, "wo", "mM", () => X.D("15uE1}!JpC", 7));
    lazy_old($, "x8", "pG", () => X.k(",c 1O:RhDB", 6));
    lazy_old($, "xk", "pL", () => X.k("O[u;0UIM7I", 50));
    lazy_old($, "xp", "b1", () => X.k("wuf,zOjn(G", 39));
    lazy_old($, "xX", "q7", () => X.k("F lu;X_QaD", 38));
    lazy_old($, "xM", "av", () => X.k("3u,161Bd^L", 69));
    lazy_old($, "xw", "pQ", () => X.D("v_v-8FUs/M", 8));
    lazy_old($, "vT", "cX", () => X.k("@Ii!xsrBxF", 64));
    lazy_old($, "ww", "bx", () => {
        // return X.k("27>.]$_<VQ", 94)
        return 2048;
    });
    lazy_old($, "xd", "bg", () => X.k("5+yzR?1-FQ", 93));
    lazy_old($, "vM", "p0", () => X.D("u<0ts= S_V", 64));
    lazy_old($, "xf", "pJ", () => X.D("%xD:GhI4QU", 48));
    lazy_old($, "vU", "lG", () => {
        // return X.D("'00dRlSitU", 54)
        return 10;
    });
    lazy_old($, "vW", "p3", () => X.k("`aa.s&j;mC", 14));
    lazy_old($, "wD", "pq", () => X.k("y{5]U4S1PH", 83));
    lazy_old($, "w0", "d_", () => {
        // return X.k("?`C3ou}R1L", 67)
        return 128;
    });
    lazy_old($, "wj", "pe", () => X.D("ThP:gnU]RI", 16));
    lazy_old($, "vH", "oX", () => X.D("+9[Q]5LgfG", 25));
    lazy_old($, "xo", "X", () => X.k("BW1,-W.WUG", 36));
    lazy_old($, "wO", "px", () => X.D("6+S>Rm<-VA", 65));
    lazy_old($, "vL", "p_", () => X.D("Y?&-AHv0II", 16));
    lazy_old($, "vN", "mI", () => X.D("dV~?xZecyE", 37));
    lazy_old($, "vI", "oY", () => X.D("R<[dAHv0^H", 16));
    lazy_old($, "xK", "pZ", () => X.D("Pb8apiJXjT", 50));
    lazy_old($, "x7", "mU", () => X.k("+O2YYGy,+H", 45));
    lazy_old($, "vJ", "oZ", () => X.D("xF s,sTeiD", 45));
    lazy_old($, "wS", "mR", () => X.k("<1<l6S%nuJ", 55));
    lazy_old($, "wC", "eW", () => X.k("(R5/YDj;mC", 28));
    lazy_old($, "xl", "aI", () => X.k(")>]w@n)xzB", 9));
    lazy_old($, "wV", "pz", () => X.D("hgirj(8S{F", 99));
    lazy_old($, "wU", "py", () => X.D("Bg(8GhGi[T", 48));
    lazy_old($, "wR", "lI", () => X.k("uEp>@P0sNE", 48));
    lazy_old($, "x4", "lK", () => {
        // return X.k("BcQuPEPOSD", 37)
        return 35;
    });
    lazy_old($, "xV", "q5", () => X.k("_qlY:A@~RE", 97));
    lazy_old($, "xH", "pW", () => X.k("U>JaC))L?F", 34));
    lazy_old($, "wP", "mQ", () => X.D("a(vr5Q0sQP", 24));
    lazy_old($, "w2", "p6", () => X.k("j-Da]5rziP", 89));
    lazy_old($, "w8", "aR", () => X.k("o.qW!KX[gF", 31));
    lazy_old($, "wE", "mO", () => {
        // return X.k("#U<=KBe&GC", 24)
        return 25;
    });
    lazy_old($, "wL", "iI", () => X.k("s4Ff$Io{jB", 16));
    lazy_old($, "vX", "cY", () => X.k("l@(lK%,MPO", 82));
    lazy_old($, "xz", "b2", () => X.k("Q9p3NSeckG", 37));
    lazy_old($, "xg", "mV", () => X.k("cP|R0-|R1L", 67));
    lazy_old($, "w4", "eT", () => X.k("ji|Q32jBxF", 64));
    lazy_old($, "we", "iH", () => {
        // return X.k("6GYapjUG%F", 33)
        return 18;
    });
    lazy_old($, "x1", "mT", () => X.k("'Y_#*mIydE", 25));
    lazy_old($, "wA", "po", () => X.k("Vi~q&TZ3'B", 10));
    lazy_old($, "vS", "eS", () => X.k("L@p[XtryHH", 41));
    lazy_old($, "wt", "lH", () => X.k("EyW}d_Bc6D", 42));
    lazy_old($, "wT", "lJ", () => X.k("9 bo->vyHH", 82));
    lazy_old($, "xS", "n2", () => X.k("CYe ;WIfsG", 75));
    lazy_old($, "wh", "pd", () => X.k("pPr4b;M|NE", 48));
    lazy_old($, "wz", "mN", () => X.k("75%]B3 4yP", 90));
    lazy_old($, "xi", "mW", () => X.k("?B72]Go)^E", 57));
    lazy_old($, "wf", "mL", () => X.k("'o:uEW5R/I", 51));
    lazy_old($, "w5", "mJ", () => X.k(")J](DyK=VQ", 94));
    lazy_old($, "wu", "pk", () => X.D("i]3&hT~B-H", 28));
    lazy_old($, "xR", "q2", () => X.k("x7KOo1~b6D", 21));
    lazy_old($, "wg", "pc", () => X.k(",7Wg$o8b>A", 5));
    lazy_old($, "wB", "pp", () => X.k("sy_Q{nF(@P", 92));
    lazy_old($, "wi", "T", () => {
        // return X.D("xPJ>uk!c<B", 53)
        return 1;
    });
    lazy_old($, "xa", "lL", () => X.k("F(#M*C?F`C", 34));
    lazy_old($, "wW", "d1", () => X.k("p&kJ 5Q!{M", 75));
    lazy_old($, "xj", "mX", () => X.k("^M0K:>w!&P", 91));
    lazy_old($, "xF", "n0", () => X.k("ISp/mK84,M", 74));
    lazy_old($, "wM", "pv", () => X.k("GiA5WP.8[B", 11));
    lazy_old($, "xJ", "pY", () => X.k("EK3xBLQz4M", 73));
    lazy_old($, "xI", "pX", () => X.k("Eh~/5KGoYM", 71));
    lazy_old($, "xb", "pI", () => X.k("sL|G/'Bd^L", 69));
    lazy_old($, "xL", "q_", () => X.k(">uy0Rt=+WC", 13));
    lazy_old($, "xE", "pV", () => X.k("y&D50SrziP", 89));
    lazy_old($, "xD", "pU", () => X.k("3M:L}N@i=O", 86));
    lazy_old($, "xQ", "q1", () => X.k("~bL%3?)L?F", 34));
    lazy_old($, "wG", "mP", () => X.k("[V-z)3H<`H", 46));
    lazy_old($, "wd", "pb", () => X.k(",r=TU*tMlL", 66));
    lazy_old($, "xP", "q0", () => X.k("0X)=.x6uSP", 88));
    lazy_old($, "x5", "pE", () => X.k("w~Ou?!0.eC", 27));
    lazy_old($, "wZ", "mS", () => {
        // return X.k("dG|*}T{.AF", 29)
        return 32768;
    });
    lazy_old($, "xy", "n_", () => X.k("*,uU([GoYM", 71));
    lazy_old($, "wJ", "pt", () => X.k(")~>SOZS1PH", 83));
    lazy_old($, "x2", "pC", () => X.k(">Lk@cu3H*Q", 97));
    lazy_old($, "x6", "pF", () => {
        // return X.k("|@?Of-toCP", 87)
        return 3517;
    });
    lazy_old($, "wy", "pn", () => {
        // return X.k("v8kF:K:=`H", 46)
        return 20897;
    });
    lazy_old($, "wb", "p9", () => {
        // return X.k("AL&(*/#5BK", 58)
        return 16468;
    });
    lazy_old($, "xs", "pO", () => {
        // return X.k("rO!p(83H*Q", 97)
        return 57;
    });
    lazy_old($, "xW", "q6", () => {
        // return X.k("!%REZf|.IF", 59)
        return 97;
    });
    lazy_old($, "w_", "p5", () => X.k("ssdUZ-o{jB", 16));
    lazy_old($, "xC", "pT", () => X.k("3=FRq0=+WC", 13));
    lazy_old($, "xT", "q3", () => X.k(">(E4.I@i=O", 86));
    lazy_old($, "wc", "pa", () => X.D("q;}N|c|3wS", 42));
    lazy_old($, "x0", "pB", () => {
        // return X.D("}2ZxxZec)R", 37)
        return 32;
    });
    lazy_old($, "xB", "pS", () => X.D("'%s.<Y.W9R", 36));
    lazy_old($, "wI", "ps", () => {
        // return X.D("Ot`&?l'nHU", 55)
        return 256;
    });
    lazy_old($, "wx", "pm", () => {
        // return X.D(";lV$g3/|;B", 80)
        return 2048;
    });
    lazy_old($, "x_", "W", () => {
        // return X.D("2(:ub1V-+B", 77)
        return 32768;
    });
    lazy_old($, "xO", "n1", () => X.D("Jn|940%'0C", 76));
    lazy_old($, "x3", "pD", () => X.k("AQI,4l~@gF", 31));
    lazy_old($, "w7", "mK", () => X.k(")pwk@R3QwA", 3));
    lazy_old($, "vV", "p2", () => X.k("<hZu12tX)L", 68));
    lazy_old($, "w3", "p7", () => X.k("jZ>0V$cSfO", 83));
    lazy_old($, "wK", "pu", () => X.k("C<7,}Y`[?K", 63));
    lazy_old($, "xx", "pR", () => {
        // return X.k("=mymvqAAAA", 0)
        return 61;
    });
    lazy_old($, "wF", "pr", () => X.k("OsofdmW-bN", 77));
    lazy_old($, "w6", "d0", () => X.k("_lv_}:$R/I", 51));
    lazy_old($, "vZ", "p4", () => X.k("@:On3OXckG", 37));
    lazy_old($, "xU", "q4", () => X.k("0iPS=<oyHH", 41));
    lazy_old($, "wv", "pl", () => X.D("WT)~pf:~hB", 91));
    lazy_old($, "xm", "mY", () => {
        // return X.k("T)Ok_x`s]G", 40)
        return 480;
    });
    lazy_old($, "xv", "pP", () => X.D("wrWW R:IqQ", 26));
    lazy_old($, "wY", "pA", () => X.k("]F8Q`2,8[B", 11));
    lazy_old($, "x9", "pH", () => X.k("^@!Hqw8SJR", 99));
    lazy_old($, "xr", "pN", () => X.k("09zY7g53tE", 26));
    lazy_old($, "xY", "q8", () => X.k("}-?M/~zGrI", 98));
    lazy_old($, "zO", "r4", () => P.o_());
    // lazy_old($, "mc", "ns", function () {
    //     // return 0
    //     return 0
    // })
    lazy_old($, "ta", "r2", () => $.mb + $.d_());
    lazy_old($, "tb", "r3", () => 0);
    lazy_old($, "zH", "r1", () => {
        // return H.b([$.iL(), $.n8(), $.qk(), $.n6(), $.n9(), $.no(), $.nm(), $.nb(), $.qa(), $.nn(), $.qW(), $.np(), $.qi(), $.nj(), $.qr(), $.qs(), $.qU()], t.V)
        return H.b(
            [
                "Rinick",
                "库瓒",
                "庫瓒",
                "涵虚",
                "霛雲",
                "云剑",
                "新纪元",
                "琪拉拉",
                "纯菜",
                "学车中学",
                "学🚗🀄学",
                "昀澤",
                "锦依卫",
                "Σσ",
                "Ø",
                "∅",
                "斜眼笑",
            ],
            t.V,
        );
    });
    lazy_old($, "zQ", "r5", () => $.pA());
    lazy_old($, "zY", "r6", () =>
        C.Array.f5(
            H.b(LangData.get_lang("ezfN").split("[]"), t.s),
            new T.kb(),
            t.X,
        ).fL(0),
    );
    lazy_old($, "Ac", "rj", () => {
        // 武器那一堆
        // return P.dD([LangData.j("e%XTi8O%`kSB", 94), new T.kq(), LangData.j("yz*^A*wx}^-:r`d", 95), new T.kr(), LangData.j("^dYkSp{^[&&o2d0:E2E", 59), new T.ks(), LangData.j("~47]&y= +_5ji7P", 85), new T.kt(), LangData.j("l+&iUIpO;.M(}FX", 23), new T.ku()], t.X, H.find_type("bL*(m*,u*)*"))
        return P.create_StringInt_map(
            [
                "剁手刀",
                new T.kq(),
                "死亡笔记",
                new T.kr(),
                "属性修改器",
                new T.ks(),
                "桂月奖杯",
                new T.kt(),
                "玄月奖杯",
                new T.ku(),
            ],
            t.X,
            H.findType("bL*(m*,u*)*"),
        );
    });
    lazy_old($, "Ad", "rk", () => {
        // return H.b([$.iL(), $.n8(), $.n6(), $.n9(), $.no(), $.nm(), $.nb(), $.nn(), $.np(), $.nj(), $.qg(), $.qj(), $.qt(), $.qX(), $.qf(), $.qN(), $.qd(), $.qT(), $.qV(), $.ql(), $.qS(), $.qe()], t.V)
        return H.b(
            [
                "Rinick",
                "库瓒",
                "涵虚",
                "霛雲",
                "云剑",
                "新纪元",
                "琪拉拉",
                "学车中学",
                "昀澤",
                "Σσ",
                "滑稽",
                "坤灵剑",
                "RailGun",
                "巡洋舰",
                "Hell",
                "佘山",
                "房刚",
                "五班",
                "XJ联队",
                "乐正绫",
                "文哥",
                "geometrydash",
            ],
            t.V,
        );
    });
    lazy_old(
        $,
        "AA",
        "nx",
        () => new P.cK(null, null, null, H.findType("cK<m*>")),
    );
})();
// MARK: Native support
(function nativeSupport() {
    !(() => {
        init.getIsolateTag = (a) => "___dart_" + a + init.isolateTag;
        var r = "___dart_isolate_tags_";
        var q = Object[r] || (Object[r] = Object.create(null));
        var p = "_ZxYxX";
        for (var o = 0; ; o++) {
            var n = p + "_" + o + "_";
            if (!(n in q)) {
                q[n] = 1;
                init.isolateTag = n;
                break;
            }
        }
        init.dispatchPropertyName = init.getIsolateTag("dispatch_record");
    })();
    hunkHelpers.setOrUpdateInterceptorsByTag({
        DOMError: J.Interceptor,
        DOMImplementation: J.Interceptor,
        MediaError: J.Interceptor,
        Navigator: J.Interceptor,
        NavigatorConcurrentHardware: J.Interceptor,
        NavigatorUserMediaError: J.Interceptor,
        OverconstrainedError: J.Interceptor,
        PositionError: J.Interceptor,
        GeolocationPositionError: J.Interceptor,
        Range: J.Interceptor,
        TextMetrics: J.Interceptor,
        SQLError: J.Interceptor,
        ArrayBuffer: H.dJ,
        DataView: H.ab,
        ArrayBufferView: H.ab,
        Float32Array: H.NativeTypedArrayOfDouble,
        Float64Array: H.NativeTypedArrayOfDouble,
        Int16Array: H.fE,
        Int32Array: H.fF,
        Int8Array: H.fG,
        Uint16Array: H.fH,
        Uint32Array: H.fI,
        Uint8ClampedArray: H.dL,
        CanvasPixelArray: H.dL,
        Uint8Array: H.cx,
        HTMLAudioElement: W.HtmlElement,
        HTMLBRElement: W.HtmlElement,
        HTMLButtonElement: W.HtmlElement,
        HTMLContentElement: W.HtmlElement,
        HTMLDListElement: W.HtmlElement,
        HTMLDataElement: W.HtmlElement,
        HTMLDataListElement: W.HtmlElement,
        HTMLDetailsElement: W.HtmlElement,
        HTMLDialogElement: W.HtmlElement,
        HTMLEmbedElement: W.HtmlElement,
        HTMLFieldSetElement: W.HtmlElement,
        HTMLHRElement: W.HtmlElement,
        HTMLHeadElement: W.HtmlElement,
        HTMLHeadingElement: W.HtmlElement,
        HTMLHtmlElement: W.HtmlElement,
        HTMLIFrameElement: W.HtmlElement,
        HTMLImageElement: W.HtmlElement,
        HTMLInputElement: W.HtmlElement,
        HTMLLIElement: W.HtmlElement,
        HTMLLabelElement: W.HtmlElement,
        HTMLLegendElement: W.HtmlElement,
        HTMLLinkElement: W.HtmlElement,
        HTMLMapElement: W.HtmlElement,
        HTMLMediaElement: W.HtmlElement,
        HTMLMenuElement: W.HtmlElement,
        HTMLMetaElement: W.HtmlElement,
        HTMLMeterElement: W.HtmlElement,
        HTMLModElement: W.HtmlElement,
        HTMLOListElement: W.HtmlElement,
        HTMLObjectElement: W.HtmlElement,
        HTMLOptGroupElement: W.HtmlElement,
        HTMLOptionElement: W.HtmlElement,
        HTMLOutputElement: W.HtmlElement,
        HTMLParamElement: W.HtmlElement,
        HTMLPictureElement: W.HtmlElement,
        HTMLPreElement: W.HtmlElement,
        HTMLProgressElement: W.HtmlElement,
        HTMLQuoteElement: W.HtmlElement,
        HTMLScriptElement: W.HtmlElement,
        HTMLShadowElement: W.HtmlElement,
        HTMLSlotElement: W.HtmlElement,
        HTMLSourceElement: W.HtmlElement,
        HTMLStyleElement: W.HtmlElement,
        HTMLTableCaptionElement: W.HtmlElement,
        HTMLTableColElement: W.HtmlElement,
        HTMLTextAreaElement: W.HtmlElement,
        HTMLTimeElement: W.HtmlElement,
        HTMLTitleElement: W.HtmlElement,
        HTMLTrackElement: W.HtmlElement,
        HTMLUListElement: W.HtmlElement,
        HTMLUnknownElement: W.HtmlElement,
        HTMLVideoElement: W.HtmlElement,
        HTMLDirectoryElement: W.HtmlElement,
        HTMLFontElement: W.HtmlElement,
        HTMLFrameElement: W.HtmlElement,
        HTMLFrameSetElement: W.HtmlElement,
        HTMLMarqueeElement: W.HtmlElement,
        HTMLElement: W.HtmlElement,
        HTMLAnchorElement: W.AnchorElement,
        HTMLAreaElement: W.AreaElement,
        HTMLBaseElement: W.BaseElement,
        Blob: W.Blob,
        HTMLBodyElement: W.BodyElement,
        HTMLCanvasElement: W.CanvasElement,
        CanvasRenderingContext2D: W.CanvasRenderingContext2D,
        CDATASection: W.b6,
        CharacterData: W.b6,
        Comment: W.b6,
        ProcessingInstruction: W.b6,
        Text: W.b6,
        CSSStyleDeclaration: W.co,
        MSStyleCSSProperties: W.co,
        CSS2Properties: W.co,
        CSSStyleSheet: W.dm,
        HTMLDivElement: W.c0,
        DOMException: W.ja,
        DOMTokenList: W.jb,
        Element: W.Element,
        AbortPaymentEvent: W.o,
        AnimationEvent: W.o,
        AnimationPlaybackEvent: W.o,
        ApplicationCacheErrorEvent: W.o,
        BackgroundFetchClickEvent: W.o,
        BackgroundFetchEvent: W.o,
        BackgroundFetchFailEvent: W.o,
        BackgroundFetchedEvent: W.o,
        BeforeInstallPromptEvent: W.o,
        BeforeUnloadEvent: W.o,
        BlobEvent: W.o,
        CanMakePaymentEvent: W.o,
        ClipboardEvent: W.o,
        CloseEvent: W.o,
        CustomEvent: W.o,
        DeviceMotionEvent: W.o,
        DeviceOrientationEvent: W.o,
        ErrorEvent: W.o,
        ExtendableEvent: W.o,
        ExtendableMessageEvent: W.o,
        FetchEvent: W.o,
        FontFaceSetLoadEvent: W.o,
        ForeignFetchEvent: W.o,
        GamepadEvent: W.o,
        HashChangeEvent: W.o,
        InstallEvent: W.o,
        MediaEncryptedEvent: W.o,
        MediaKeyMessageEvent: W.o,
        MediaQueryListEvent: W.o,
        MediaStreamEvent: W.o,
        MediaStreamTrackEvent: W.o,
        MIDIConnectionEvent: W.o,
        MIDIMessageEvent: W.o,
        MutationEvent: W.o,
        NotificationEvent: W.o,
        PageTransitionEvent: W.o,
        PaymentRequestEvent: W.o,
        PaymentRequestUpdateEvent: W.o,
        PopStateEvent: W.o,
        PresentationConnectionAvailableEvent: W.o,
        PresentationConnectionCloseEvent: W.o,
        ProgressEvent: W.o,
        PromiseRejectionEvent: W.o,
        PushEvent: W.o,
        RTCDataChannelEvent: W.o,
        RTCDTMFToneChangeEvent: W.o,
        RTCPeerConnectionIceEvent: W.o,
        RTCTrackEvent: W.o,
        SecurityPolicyViolationEvent: W.o,
        SensorErrorEvent: W.o,
        SpeechRecognitionError: W.o,
        SpeechRecognitionEvent: W.o,
        SpeechSynthesisEvent: W.o,
        StorageEvent: W.o,
        SyncEvent: W.o,
        TrackEvent: W.o,
        TransitionEvent: W.o,
        WebKitTransitionEvent: W.o,
        VRDeviceEvent: W.o,
        VRDisplayEvent: W.o,
        VRSessionEvent: W.o,
        MojoInterfaceRequestEvent: W.o,
        ResourceProgressEvent: W.o,
        USBConnectionEvent: W.o,
        IDBVersionChangeEvent: W.o,
        AudioProcessingEvent: W.o,
        OfflineAudioCompletionEvent: W.o,
        WebGLContextEvent: W.o,
        Event: W.o,
        InputEvent: W.o,
        SubmitEvent: W.o,
        EventTarget: W.fn,
        File: W.File,
        HTMLFormElement: W.fp,
        ImageData: W.c4,
        Location: W.jL,
        MessageEvent: W.c8,
        MessagePort: W.dH,
        MouseEvent: W.bp,
        DragEvent: W.bp,
        PointerEvent: W.bp,
        WheelEvent: W.bp,
        Document: W.v,
        DocumentFragment: W.v,
        HTMLDocument: W.v,
        ShadowRoot: W.v,
        XMLDocument: W.v,
        DocumentType: W.v,
        Node: W.v,
        NodeList: W.dM,
        RadioNodeList: W.dM,
        HTMLParagraphElement: W.dQ,
        HTMLSelectElement: W.h4,
        HTMLSpanElement: W.ek,
        Storage: W.hN,
        StyleSheet: W.bb,
        HTMLTableCellElement: W.ce,
        HTMLTableDataCellElement: W.ce,
        HTMLTableHeaderCellElement: W.ce,
        HTMLTableElement: W.en,
        HTMLTableRowElement: W.hQ,
        HTMLTableSectionElement: W.hR,
        HTMLTemplateElement: W.cI,
        CompositionEvent: W.aY,
        FocusEvent: W.aY,
        KeyboardEvent: W.aY,
        TextEvent: W.aY,
        TouchEvent: W.aY,
        UIEvent: W.aY,
        Window: W.eq,
        DOMWindow: W.eq,
        Attr: W.cL,
        NamedNodeMap: W.ex,
        MozNamedAttrMap: W.ex,
        StyleSheetList: W.eH,
        SVGScriptElement: P.cF,
        SVGAElement: P.p,
        SVGAnimateElement: P.p,
        SVGAnimateMotionElement: P.p,
        SVGAnimateTransformElement: P.p,
        SVGAnimationElement: P.p,
        SVGCircleElement: P.p,
        SVGClipPathElement: P.p,
        SVGDefsElement: P.p,
        SVGDescElement: P.p,
        SVGDiscardElement: P.p,
        SVGEllipseElement: P.p,
        SVGFEBlendElement: P.p,
        SVGFEColorMatrixElement: P.p,
        SVGFEComponentTransferElement: P.p,
        SVGFECompositeElement: P.p,
        SVGFEConvolveMatrixElement: P.p,
        SVGFEDiffuseLightingElement: P.p,
        SVGFEDisplacementMapElement: P.p,
        SVGFEDistantLightElement: P.p,
        SVGFEFloodElement: P.p,
        SVGFEFuncAElement: P.p,
        SVGFEFuncBElement: P.p,
        SVGFEFuncGElement: P.p,
        SVGFEFuncRElement: P.p,
        SVGFEGaussianBlurElement: P.p,
        SVGFEImageElement: P.p,
        SVGFEMergeElement: P.p,
        SVGFEMergeNodeElement: P.p,
        SVGFEMorphologyElement: P.p,
        SVGFEOffsetElement: P.p,
        SVGFEPointLightElement: P.p,
        SVGFESpecularLightingElement: P.p,
        SVGFESpotLightElement: P.p,
        SVGFETileElement: P.p,
        SVGFETurbulenceElement: P.p,
        SVGFilterElement: P.p,
        SVGForeignObjectElement: P.p,
        SVGGElement: P.p,
        SVGGeometryElement: P.p,
        SVGGraphicsElement: P.p,
        SVGImageElement: P.p,
        SVGLineElement: P.p,
        SVGLinearGradientElement: P.p,
        SVGMarkerElement: P.p,
        SVGMaskElement: P.p,
        SVGMetadataElement: P.p,
        SVGPathElement: P.p,
        SVGPatternElement: P.p,
        SVGPolygonElement: P.p,
        SVGPolylineElement: P.p,
        SVGRadialGradientElement: P.p,
        SVGRectElement: P.p,
        SVGSetElement: P.p,
        SVGStopElement: P.p,
        SVGStyleElement: P.p,
        SVGSVGElement: P.p,
        SVGSwitchElement: P.p,
        SVGSymbolElement: P.p,
        SVGTSpanElement: P.p,
        SVGTextContentElement: P.p,
        SVGTextElement: P.p,
        SVGTextPathElement: P.p,
        SVGTextPositioningElement: P.p,
        SVGTitleElement: P.p,
        SVGUseElement: P.p,
        SVGViewElement: P.p,
        SVGGradientElement: P.p,
        SVGComponentTransferFunctionElement: P.p,
        SVGFEDropShadowElement: P.p,
        SVGMPathElement: P.p,
        SVGElement: P.p,
    });
    hunkHelpers.setOrUpdateLeafTags({
        DOMError: true,
        DOMImplementation: true,
        MediaError: true,
        Navigator: true,
        NavigatorConcurrentHardware: true,
        NavigatorUserMediaError: true,
        OverconstrainedError: true,
        PositionError: true,
        GeolocationPositionError: true,
        Range: true,
        TextMetrics: true,
        SQLError: true,
        ArrayBuffer: true,
        DataView: true,
        ArrayBufferView: false,
        Float32Array: true,
        Float64Array: true,
        Int16Array: true,
        Int32Array: true,
        Int8Array: true,
        Uint16Array: true,
        Uint32Array: true,
        Uint8ClampedArray: true,
        CanvasPixelArray: true,
        Uint8Array: false,
        HTMLAudioElement: true,
        HTMLBRElement: true,
        HTMLButtonElement: true,
        HTMLContentElement: true,
        HTMLDListElement: true,
        HTMLDataElement: true,
        HTMLDataListElement: true,
        HTMLDetailsElement: true,
        HTMLDialogElement: true,
        HTMLEmbedElement: true,
        HTMLFieldSetElement: true,
        HTMLHRElement: true,
        HTMLHeadElement: true,
        HTMLHeadingElement: true,
        HTMLHtmlElement: true,
        HTMLIFrameElement: true,
        HTMLImageElement: true,
        HTMLInputElement: true,
        HTMLLIElement: true,
        HTMLLabelElement: true,
        HTMLLegendElement: true,
        HTMLLinkElement: true,
        HTMLMapElement: true,
        HTMLMediaElement: true,
        HTMLMenuElement: true,
        HTMLMetaElement: true,
        HTMLMeterElement: true,
        HTMLModElement: true,
        HTMLOListElement: true,
        HTMLObjectElement: true,
        HTMLOptGroupElement: true,
        HTMLOptionElement: true,
        HTMLOutputElement: true,
        HTMLParamElement: true,
        HTMLPictureElement: true,
        HTMLPreElement: true,
        HTMLProgressElement: true,
        HTMLQuoteElement: true,
        HTMLScriptElement: true,
        HTMLShadowElement: true,
        HTMLSlotElement: true,
        HTMLSourceElement: true,
        HTMLStyleElement: true,
        HTMLTableCaptionElement: true,
        HTMLTableColElement: true,
        HTMLTextAreaElement: true,
        HTMLTimeElement: true,
        HTMLTitleElement: true,
        HTMLTrackElement: true,
        HTMLUListElement: true,
        HTMLUnknownElement: true,
        HTMLVideoElement: true,
        HTMLDirectoryElement: true,
        HTMLFontElement: true,
        HTMLFrameElement: true,
        HTMLFrameSetElement: true,
        HTMLMarqueeElement: true,
        HTMLElement: false,
        HTMLAnchorElement: true,
        HTMLAreaElement: true,
        HTMLBaseElement: true,
        Blob: false,
        HTMLBodyElement: true,
        HTMLCanvasElement: true,
        CanvasRenderingContext2D: true,
        CDATASection: true,
        CharacterData: true,
        Comment: true,
        ProcessingInstruction: true,
        Text: true,
        CSSStyleDeclaration: true,
        MSStyleCSSProperties: true,
        CSS2Properties: true,
        CSSStyleSheet: true,
        HTMLDivElement: true,
        DOMException: true,
        DOMTokenList: true,
        Element: false,
        AbortPaymentEvent: true,
        AnimationEvent: true,
        AnimationPlaybackEvent: true,
        ApplicationCacheErrorEvent: true,
        BackgroundFetchClickEvent: true,
        BackgroundFetchEvent: true,
        BackgroundFetchFailEvent: true,
        BackgroundFetchedEvent: true,
        BeforeInstallPromptEvent: true,
        BeforeUnloadEvent: true,
        BlobEvent: true,
        CanMakePaymentEvent: true,
        ClipboardEvent: true,
        CloseEvent: true,
        CustomEvent: true,
        DeviceMotionEvent: true,
        DeviceOrientationEvent: true,
        ErrorEvent: true,
        ExtendableEvent: true,
        ExtendableMessageEvent: true,
        FetchEvent: true,
        FontFaceSetLoadEvent: true,
        ForeignFetchEvent: true,
        GamepadEvent: true,
        HashChangeEvent: true,
        InstallEvent: true,
        MediaEncryptedEvent: true,
        MediaKeyMessageEvent: true,
        MediaQueryListEvent: true,
        MediaStreamEvent: true,
        MediaStreamTrackEvent: true,
        MIDIConnectionEvent: true,
        MIDIMessageEvent: true,
        MutationEvent: true,
        NotificationEvent: true,
        PageTransitionEvent: true,
        PaymentRequestEvent: true,
        PaymentRequestUpdateEvent: true,
        PopStateEvent: true,
        PresentationConnectionAvailableEvent: true,
        PresentationConnectionCloseEvent: true,
        ProgressEvent: true,
        PromiseRejectionEvent: true,
        PushEvent: true,
        RTCDataChannelEvent: true,
        RTCDTMFToneChangeEvent: true,
        RTCPeerConnectionIceEvent: true,
        RTCTrackEvent: true,
        SecurityPolicyViolationEvent: true,
        SensorErrorEvent: true,
        SpeechRecognitionError: true,
        SpeechRecognitionEvent: true,
        SpeechSynthesisEvent: true,
        StorageEvent: true,
        SyncEvent: true,
        TrackEvent: true,
        TransitionEvent: true,
        WebKitTransitionEvent: true,
        VRDeviceEvent: true,
        VRDisplayEvent: true,
        VRSessionEvent: true,
        MojoInterfaceRequestEvent: true,
        ResourceProgressEvent: true,
        USBConnectionEvent: true,
        IDBVersionChangeEvent: true,
        AudioProcessingEvent: true,
        OfflineAudioCompletionEvent: true,
        WebGLContextEvent: true,
        Event: false,
        InputEvent: false,
        SubmitEvent: false,
        EventTarget: false,
        File: true,
        HTMLFormElement: true,
        ImageData: true,
        Location: true,
        MessageEvent: true,
        MessagePort: true,
        MouseEvent: true,
        DragEvent: true,
        PointerEvent: true,
        WheelEvent: true,
        Document: true,
        DocumentFragment: true,
        HTMLDocument: true,
        ShadowRoot: true,
        XMLDocument: true,
        DocumentType: true,
        Node: false,
        NodeList: true,
        RadioNodeList: true,
        HTMLParagraphElement: true,
        HTMLSelectElement: true,
        HTMLSpanElement: true,
        Storage: true,
        StyleSheet: false,
        HTMLTableCellElement: true,
        HTMLTableDataCellElement: true,
        HTMLTableHeaderCellElement: true,
        HTMLTableElement: true,
        HTMLTableRowElement: true,
        HTMLTableSectionElement: true,
        HTMLTemplateElement: true,
        CompositionEvent: true,
        FocusEvent: true,
        KeyboardEvent: true,
        TextEvent: true,
        TouchEvent: true,
        UIEvent: false,
        Window: true,
        DOMWindow: true,
        Attr: true,
        NamedNodeMap: true,
        MozNamedAttrMap: true,
        StyleSheetList: true,
        SVGScriptElement: true,
        SVGAElement: true,
        SVGAnimateElement: true,
        SVGAnimateMotionElement: true,
        SVGAnimateTransformElement: true,
        SVGAnimationElement: true,
        SVGCircleElement: true,
        SVGClipPathElement: true,
        SVGDefsElement: true,
        SVGDescElement: true,
        SVGDiscardElement: true,
        SVGEllipseElement: true,
        SVGFEBlendElement: true,
        SVGFEColorMatrixElement: true,
        SVGFEComponentTransferElement: true,
        SVGFECompositeElement: true,
        SVGFEConvolveMatrixElement: true,
        SVGFEDiffuseLightingElement: true,
        SVGFEDisplacementMapElement: true,
        SVGFEDistantLightElement: true,
        SVGFEFloodElement: true,
        SVGFEFuncAElement: true,
        SVGFEFuncBElement: true,
        SVGFEFuncGElement: true,
        SVGFEFuncRElement: true,
        SVGFEGaussianBlurElement: true,
        SVGFEImageElement: true,
        SVGFEMergeElement: true,
        SVGFEMergeNodeElement: true,
        SVGFEMorphologyElement: true,
        SVGFEOffsetElement: true,
        SVGFEPointLightElement: true,
        SVGFESpecularLightingElement: true,
        SVGFESpotLightElement: true,
        SVGFETileElement: true,
        SVGFETurbulenceElement: true,
        SVGFilterElement: true,
        SVGForeignObjectElement: true,
        SVGGElement: true,
        SVGGeometryElement: true,
        SVGGraphicsElement: true,
        SVGImageElement: true,
        SVGLineElement: true,
        SVGLinearGradientElement: true,
        SVGMarkerElement: true,
        SVGMaskElement: true,
        SVGMetadataElement: true,
        SVGPathElement: true,
        SVGPatternElement: true,
        SVGPolygonElement: true,
        SVGPolylineElement: true,
        SVGRadialGradientElement: true,
        SVGRectElement: true,
        SVGSetElement: true,
        SVGStopElement: true,
        SVGStyleElement: true,
        SVGSVGElement: true,
        SVGSwitchElement: true,
        SVGSymbolElement: true,
        SVGTSpanElement: true,
        SVGTextContentElement: true,
        SVGTextElement: true,
        SVGTextPathElement: true,
        SVGTextPositioningElement: true,
        SVGTitleElement: true,
        SVGUseElement: true,
        SVGViewElement: true,
        SVGGradientElement: true,
        SVGComponentTransferFunctionElement: true,
        SVGFEDropShadowElement: true,
        SVGMPathElement: true,
        SVGElement: false,
    });
    H.NativeTypedArray.$nativeSuperclassTag = "ArrayBufferView";
    H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin.$nativeSuperclassTag =
        "ArrayBufferView";
    H._NativeTypedArrayOfDouble_NativeTypedArray_ListMixin_FixedLengthListMixin.$nativeSuperclassTag =
        "ArrayBufferView";
    H.NativeTypedArrayOfDouble.$nativeSuperclassTag = "ArrayBufferView";
    H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin.$nativeSuperclassTag =
        "ArrayBufferView";
    H._NativeTypedArrayOfInt_NativeTypedArray_ListMixin_FixedLengthListMixin.$nativeSuperclassTag =
        "ArrayBufferView";
    H.NativeTypedArrayOfInt.$nativeSuperclassTag = "ArrayBufferView";
})();
Function.prototype.$2 = function (a, b) {
    return this(a, b);
};
Function.prototype.$1 = function (a) {
    return this(a);
};
Function.prototype.$0 = function () {
    return this();
};
Function.prototype.$3 = function (a, b, c) {
    return this(a, b, c);
};
Function.prototype.$4 = function (a, b, c, d) {
    return this(a, b, c, d);
};
Function.prototype.$1$1 = function (a) {
    return this(a);
};
Function.prototype.$5 = function (a, b, c, d, e) {
    return this(a, b, c, d, e);
};
Function.prototype.$7 = function (a, b, c, d, e, f, g) {
    return this(a, b, c, d, e, f, g);
};
Function.prototype.$6 = function (a, b, c, d, e, f) {
    return this(a, b, c, d, e, f);
};

function main(input_name) {
    var async_goto = 0,
        async_completer = P._makeAsyncAwaitCompleter(t.z),
        q,
        switch_to = 2,
        async_result_1,
        n = [],
        m,
        l,
        rc4_holder,
        j,
        raw_names,
        h,
        profiler,
        f,
        e,
        d,
        c,
        b,
        a,
        a0_getter,
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        team_1,
        team_2,
        b0;
    var $async$iE = P._wrapJsFunctionForAsync((error_code, async_result) => {
        if (error_code === 1) {
            async_result_1 = async_result;
            async_goto = switch_to;
        }
        while (true)
            switch (async_goto) {
                case 0:
                    team_1 = LangData.oC(true).c;
                    team_2 = team_1[$.B()];
                    $.mb = team_2;
                    $.ta = team_2 + $.d_();
                    $.nV = team_1[$.C()];
                    $.nW = team_1[$.X()];
                    $.tb = team_1[$.a4()];

                    if (run_env.from_code) {
                        $.ox = assets_data.gAd;
                    } else {
                        // a2 = window.localStorage.getItem(LanData.j("T|a`4tFX30f3:o_Vx]na4ki/|ye&j=D", 15))
                        a2 = window.localStorage.getItem("go​ogle_experiment_mod1");
                        // console.log("a2", a2)
                        if (a2 != null) {
                            $.ox = new H.a9(H.b(a2.split(""), t.s), t.bJ).f3(0);
                        }
                    }

                    async_goto = 3;
                    return P._asyncAwait(HtmlRenderer.static_init(), $async$iE);
                case 3:
                    // MARK: 名字输入位置
                    // 战斗框输入位置
                    // 这里请输入一个被混淆过的名字
                    switch_to = 5;

                    if (run_env.from_code) {
                        raw_names = input_name;
                        // console.log("----------\n" + raw_names, "\n----------");
                    } else {
                        m = window.sessionStorage.getItem(LangData.eQ("k"));
                        l = X.f4(m, 0);
                        rc4_holder = LangData.oC(false);
                        const type_tmp = t.i;
                        j = H.b([], type_tmp);
                        // MARK: 这里会被替换成某个 随机? 255 长度数组
                        // 然后把这个随机数组的所有内容 push 到 j 里去
                        J.rr(j, H.b([1, 3, 0, 9], type_tmp));

                        rc4_holder.bO(j); // update 他
                        rc4_holder.di(l);
                        raw_names = C.e.bt(0, l);
                    }

                    // 或者直接在这里输入一个原始字符串
                    h = T.parse_names(raw_names);

                    // if (J.Y(J.J(J.J(h, 0)[0], 0), $.qc())) {
                    // if ($.qc() === h[0][0][0]) {
                    //     $.vr = 6;
                    //     // if (J.aw(h) === 2)
                    //     if (h.length === 2) {
                    //         // if (J.J(h, 1).length > 10 || J.lW(J.J(J.J(h, 1)[0], 0), O.j("S,AF", 5))) {
                    //         // LangData.j("S,AF", 5) -> ???
                    //         if (h[1].length > 10 || J.lW(h[1][0][0], LangData.j("S,AF", 5))) {
                    //             logger.info("官方搜号");
                    //             team_1 = h[1];
                    //             team_2 = H.b([], t.t);

                    //             profiler = new X.ProfileFind(team_2, new Float64Array(1));
                    //             d.e_(team_1);

                    //             f = HtmlRenderer.outer_main(profiler);

                    //             f.r = 2000;
                    //             async_goto = 1;
                    //             break;
                    //         } else {
                    //             logger.info("官方测号-评分");

                    //             e = $.nk();
                    //             // if (J.J(h, 0).length === 2 && J.Y(J.J(J.J(h, 0)[1], 0), $.cl())) {
                    //             if (h[0].length === 2 && h[0][1][0] === $.cl()) {
                    //                 team_1 = h[1];
                    //                 e = $.cl();
                    //             }
                    //             team_1 = h[1];
                    //             team_2 = e;
                    //             a3 = H.b([], t.L);
                    //             a4 = H.b([], t.V);
                    //             a5 = H.b([], t.M);

                    //             profiler = new V.ProfileMain(
                    //                 team_2,
                    //                 team_1,
                    //                 a3,
                    //                 a4,
                    //                 a5,
                    //                 P.cu(t.X, t.B),
                    //                 new Float64Array(1),
                    //             );
                    //             profiler.dZ(team_1, team_2);
                    //             profiler.d = 1000;

                    //             c = HtmlRenderer.outer_main(profiler);

                    //             c.r = 2000;
                    //             async_goto = 1;
                    //             break;
                    //         }
                    //     } else if (h.length === 3) {
                    //         logger.info("官方测号-胜率");

                    //         team_1 = h[1];
                    //         team_2 = h[2];
                    //         a3 = t.L;
                    //         a4 = H.b([], a3);
                    //         a3 = H.b([], a3);
                    //         a5 = H.b([], t.V);
                    //         a6 = H.b([], t.M);

                    //         profiler = new L.ProfileWinChance(
                    //             team_1,
                    //             team_2,
                    //             a4,
                    //             a3,
                    //             a5,
                    //             a6,
                    //             new Float64Array(1),
                    //         );
                    //         profiler.dY(team_1, team_2);
                    //         profiler.c = 1000;

                    //         a = HtmlRenderer.outer_main(profiler);

                    //         a.r = 2000;
                    //         async_goto = 1;
                    //         break;
                    //     }
                    // }
                    // logger.info("对战");
                    async_goto = 8;
                    return P._asyncAwait(T.start_main(h), $async$iE);
                case 8:
                    HtmlRenderer.outer_main(async_result);
                    switch_to = 2;
                    async_goto = 7;
                    break;
                case 5:
                    switch_to = 4;
                    b0 = async_result_1;
                    a1 = H.unwrap_Exception(b0);
                    H.getTraceFromException(b0);
                    async_goto = 7;
                    break;
                case 4:
                    async_goto = 2;
                    break;
                case 7:
                case 1:
                    return P._asyncReturn(q, async_completer);
                case 2:
                    return P.async_rethrow(async_result_1, async_completer);
            }
    });
    return P._asyncStartSync($async$iE, async_completer);
}

if (run_env.from_code) {
    const win_data = [];
    finish_trigger.once("done_fight", (data) => {
        // logger.info(fmt_RunUpdate(data));
        let data = fmt_RunUpdate(data);
        // 只输出赢家
        logger.info("赢家(也有可能是之一): " + data.source_plr);
    });
    finish_trigger.on("win_rate", (...data) => {
        logger.info(...data);
    });
    main(name_input);
} else {
    main(name_input);
}
// logger.info("反混淆", LangData.j("HOa,^Auk1x84LRKOnLivoA,^CvRYpI$Y&JxtF7P", 33));

/**
 * 主接口
 */
const runner = {
    fight: async (names) => {
        await new Promise((resolve, reject) => {
            main(name_input);
            // 使用 await 关键字等待 Promise
            finish_trigger.once("done_fight", (data) => {
                resolve(fmt_RunUpdate(data)); // 解析Promise
            });
        });
    },
};

// export default runner;
