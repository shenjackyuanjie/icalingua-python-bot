import io
import sys
import time
import traceback
import subprocess

from pathlib import Path

from typing import TYPE_CHECKING, TypeVar

if str(Path(__file__).parent.absolute()) not in sys.path:
    sys.path.append(str(Path(__file__).parent.absolute()))

import name_utils

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient, ConfigData, ReciveMessage, TailchatReciveMessage

    CONFIG_DATA: ConfigData
else:
    CONFIG_DATA = None  # type: ignore
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")
    ReciveMessage = TypeVar("ReciveMessage")
    TailchatReciveMessage = TypeVar("TailchatReciveMessage")


_version_ = "0.5.0"

EVAL_PREFIX = "/namerena"
CONVERT_PREFIX = "/namer-peek"

def convert_name(msg: ReciveMessage, client) -> None:
    # 也是多行
    if msg.content.find("\n") == -1:
        client.send_message(
            msg.reply_with(
                f"请使用 {CONVERT_PREFIX} 命令，然后换行输入名字，例如：\n{CONVERT_PREFIX}\n张三\n李四\n王五\n"
            )
        )
        return
    # 去掉 prefix
    names = msg.content[len(CONVERT_PREFIX) :]
    # 去掉第一个 \n
    names = names[names.find("\n") + 1 :]
    cache = io.StringIO()
    raw_players = [x for x in names.split("\n") if x != ""]
    players = [name_utils.Player() for _ in raw_players]
    for i, player in enumerate(players):
        if not player.load(raw_players[i]):
            cache.write(f"{i+1} {raw_players[i]} 无法解析\n")
            raw_players[i] = ""
    for i, player in enumerate(players):
        if raw_players[i] == "":
            continue
        cache.write(player.display())
        cache.write("\n")
    reply = msg.reply_with(f"{cache.getvalue()}版本:{_version_}")
    client.send_message(reply)


def eval_fight(msg: ReciveMessage, client) -> None:
    if msg.content.find("\n") == -1:
        client.send_message(
            msg.reply_with(
                f"请使用 {EVAL_PREFIX} 命令，然后换行输入名字，例如：\n{EVAL_PREFIX}\n张三\n李四\n王五\n"
            )
        )
        return
    # 去掉 prefix
    names = msg.content[len(EVAL_PREFIX) :]
    # 去掉第一个 \n
    names = names[names.find("\n") + 1 :]

    start_time = time.time()
    # 开始 try
    try:
        # 内容写入到 ./md5/input.txt
        # 路径是插件文件的相对路径
        root_path = Path(__file__).parent
        with open(root_path / "md5" / "input.txt", "w") as f:
            f.write(names)
        # 执行 node md5.js
        runner_path = root_path / "md5" / "md5-api.js"
        # input_path = root_path / "md5" / "input.txt"
        result = subprocess.run(
            ["node", runner_path.absolute()],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        # 获取结果
        out_result = result.stdout.decode("utf-8")
        err_result = result.stderr.decode("utf-8")
        # 发送结果
        end_time = time.time()
        reply = msg.reply_with(
            f"{out_result}{err_result}外部耗时:{end_time - start_time:.2f}s\n版本:{_version_}"
        )
        client.send_message(reply)
    except Exception as e:
        # 发送错误
        reply = msg.reply_with(f"发生错误：{e}\n{traceback.format_exc()}")
        client.send_message(reply)

def dispatch_msg(msg: ReciveMessage, client) -> None:
    if msg.is_reply or msg.is_from_self:
        return
    if msg.content.startswith(EVAL_PREFIX):
        eval_fight(msg, client)
    elif msg.content.startswith(CONVERT_PREFIX):
        convert_name(msg, client)


def on_ica_message(msg: IcaNewMessage, client: IcaClient) -> None:
    dispatch_msg(msg, client) # type: ignore


def on_tailchat_message(msg: TailchatReciveMessage, client) -> None:
    dispatch_msg(msg, client) # type: ignore
