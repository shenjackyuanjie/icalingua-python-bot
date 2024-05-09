import time
import traceback
import subprocess

from pathlib import Path

from typing import TYPE_CHECKING, TypeVar

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient, ConfigData

    CONFIG_DATA: ConfigData
else:
    CONFIG_DATA = None  # type: ignore
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

_version_ = "0.3.0"

COMMAND = "/namerena"

def on_ica_message(msg: IcaNewMessage, client: IcaClient) -> None:
    if not msg.content.startswith("/namerena"):
        return
    if msg.content.find("\n") == -1:
        client.send_message(
            msg.reply_with(
                f"请使用 {COMMAND} 命令，然后换行输入名字，例如：\n{COMMAND}\n张三\n李四\n王五\n"
            )
        )
        return
    # 去掉 /name
    names = msg.content[len(COMMAND) :]
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
        runner_path = root_path / "md5" / "runs.ts"
        input_path = root_path / "md5" / "input.txt"
        result = subprocess.run(
            ["npm", "x", "tsx", runner_path.absolute(), input_path.absolute()],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        # 获取结果
        out_result = result.stdout.decode("utf-8")
        err_result = result.stderr.decode("utf-8")
        # 发送结果
        end_time = time.time()
        reply = msg.reply_with(
            f"{out_result}{err_result}\n耗时:{end_time - start_time:.2f}s\n版本:{_version_}"
        )
        client.send_message(reply)
    except Exception as e:
        # 发送错误
        reply = msg.reply_with(f"发生错误：{e}\n{traceback.format_exc()}")
        client.send_message(reply)
