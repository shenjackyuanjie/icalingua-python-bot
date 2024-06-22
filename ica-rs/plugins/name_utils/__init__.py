import io

sklname = [
    "火球术",
    "冰冻术",
    "雷击术",
    "地裂术",
    "吸血攻击",
    "投毒",
    "连击",
    "会心一击",
    "瘟疫",
    "生命之轮",
    "狂暴术",
    "魅惑",
    "加速术",
    "减速术",
    "诅咒",
    "治愈魔法",
    "苏生术",
    "净化",
    "铁壁",
    "蓄力",
    "聚气",
    "潜行",
    "血祭",
    "分身",
    "幻术",
    "防御",
    "守护",
    "伤害反弹",
    "护身符",
    "护盾",
    "反击",
    "吞噬",
    "召唤亡灵",
    "垂死抗争",
    "隐匿",
    "sklvoid1",
    "sklvoid2",
    "sklvoid3",
    "sklvoid4",
    "sklvoid5",
]

prop_names = [
    "HP",
    "攻",
    "防",
    "速",
    "敏",
    "魔",
    "抗",
    "智",
    "八围",
]


class Player:
    def __init__(self) -> None:
        self.name = ""
        self.team = ""
        self.val = [i for i in range(0, 256)]
        self.name_base = [0] * 128
        self.name_str = [0] * 256
        self.team_str = [0] * 256
        self.name_len = 0
        self.team_len = 0
        self.name_prop = [0] * 8
        self.skl_id = [i for i in range(0, 40)]
        self.skl_freq = [0] * 40

    def load(self, raw_name: str):
        if raw_name == "":
            print("错误：输入不能为空。")
            return False
        if raw_name.count("@") > 1:
            print("错误：无法分割名字与战队名，请检查输入。")
            return False
        name_lst = list(raw_name.rpartition("@"))
        if len(name_lst[0]) > 256 or len(name_lst[2]) > 256:
            print("错误：名字或战队名长度过大。")
            return False
        if name_lst[1] == "@":
            if name_lst[2] == "":
                name_lst[2] = name_lst[0]
        else:
            name_lst[0] = name_lst[2]
        name_bytes = name_lst[0].encode(encoding="utf-8")
        team_bytes = name_lst[2].encode(encoding="utf-8")
        self.name = name_lst[0]
        self.team = name_lst[2]
        self.name_len = len(name_bytes)
        self.team_len = len(team_bytes)
        for i in range(self.name_len):
            self.name_str[i + 1] = name_bytes[i]
        for i in range(self.team_len):
            self.team_str[i + 1] = team_bytes[i]
        self.name_len += 1
        self.team_len += 1

        s = 0
        for i in range(256):
            s += self.team_str[i % self.team_len] + self.val[i]
            s %= 256
            self.val[i], self.val[s] = self.val[s], self.val[i]

        for i in range(2):
            s = 0
            for j in range(256):
                s += self.name_str[j % self.name_len] + self.val[j]
                s %= 256
                self.val[j], self.val[s] = self.val[s], self.val[j]
        s = 0
        for i in range(256):
            m = ((self.val[i] * 181) + 160) % 256
            if m >= 89 and m < 217:
                self.name_base[s] = m & 63
                s += 1

        propcnt = 0
        r = self.name_base[0:32]
        for i in range(10, 31, 3):
            r[i : i + 3] = sorted(r[i : i + 3])
            self.name_prop[propcnt] = r[i + 1]
            propcnt += 1
        r[0:10] = sorted(r[0:10])
        self.name_prop[propcnt] = 154
        propcnt += 1
        for i in range(3, 7):
            self.name_prop[propcnt - 1] += r[i]
        for i in range(7):
            self.name_prop[i] += 36

        self.skl_id = list(range(0, 40))
        self.skl_freq = [0] * 40
        a = b = 0
        randbase = []
        randbase[:] = self.val[:]

        def randgen():
            def m():
                nonlocal a, b, randbase
                a = (a + 1) % 256
                b = (b + randbase[a]) % 256
                randbase[a], randbase[b] = randbase[b], randbase[a]
                return randbase[(randbase[a] + randbase[b]) & 255]

            return ((m() << 8) | m()) % 40

        s = 0
        for i in range(2):
            for j in range(40):
                rand = randgen()
                s = (s + rand + self.skl_id[j]) % 40
                self.skl_id[j], self.skl_id[s] = self.skl_id[s], self.skl_id[j]
        last = -1
        j = 0
        for i in range(64, 128, 4):
            p = (
                min(
                    self.name_base[i],
                    self.name_base[i + 1],
                    self.name_base[i + 2],
                    self.name_base[i + 3],
                )
                % 256
            )
            if p > 10 and self.skl_id[j] < 35:
                self.skl_freq[j] = p - 10
                if self.skl_id[j] < 25:
                    last = j
            j += 1
        if last != -1:
            self.skl_freq[last] *= 2
        if self.skl_freq[14] > 0 and last != 14:
            self.skl_freq[14] += min(
                self.name_base[60], self.name_base[61], self.skl_freq[14]
            )
        if self.skl_freq[15] > 0 and last != 15:
            self.skl_freq[15] += min(
                self.name_base[62], self.name_base[63], self.skl_freq[15]
            )
        return True

    def display(self) -> str:
        cache = io.StringIO()
        cache.write(f"{self.name}@{self.team}|")
        full = sum(self.name_prop[0:7]) + round(self.name_prop[7] / 3)
        datas = [self.name_prop[7], *self.name_prop[0:7], full]
        cache.write(
            "|".join(
                [f"{prop_names[index]}:{value}" for index, value in enumerate(datas)]
            )
        )
        cache.write("\n")
        cache.write(
            "|".join(
                [
                    f"{sklname[self.skl_id[index]]}:{self.skl_freq[index]}"
                    for index, value in sorted(
                        enumerate(self.skl_freq), key=lambda x: x[1], reverse=True
                    )
                    if value > 0
                ]
            )
        )
        return cache.getvalue()
