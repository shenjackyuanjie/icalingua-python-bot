import time
import traceback
import subprocess

from typing import TYPE_CHECKING, TypeVar

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient, ConfigData
    CONFIG_DATA: ConfigData
else:
    CONFIG_DATA = None # type: ignore
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

_version_ = "0.0.1"

def on_ica_message(msg: IcaNewMessage, client: IcaClient) -> None:
    if not msg.content.startswith("/name"):
        return
    if msg.content.find("\n") == -1:
        client.send_message(msg.reply_with("请使用 /name 命令，然后换行输入名字，例如：\n/name\n张三\n李四\n王五\n"))
        return
    # 去掉 /name
    names = msg.content.split("/name")[1]

    start_time = time.time()
    # 开始 try
    try:
        # 内容写入到 ./md5/input.txt
        with open("./md5/input.txt", "w") as f:
            f.write(names)
        # 执行 node md5.js
        result = subprocess.run(["node", "md5/md5.js"], stdout=subprocess.PIPE)
        # 获取结果
        result = result.stdout.decode("utf-8")
        # 发送结果
        end_time = time.time()
        reply = msg.reply_with(f"{result}\n耗时:{end_time - start_time:.2f}s\n版本:{_version_}")
        client.send_message(reply)
    except Exception as e:
        # 发送错误
        reply = msg.reply_with(f"发生错误：{e}\n{traceback.format_exc()}")
        client.send_message(reply)