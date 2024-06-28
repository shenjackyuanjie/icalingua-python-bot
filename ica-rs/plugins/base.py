import io
import psutil
import platform
from typing import TYPE_CHECKING, TypeVar
from PIL import (Image, ImageDraw, ImageFont)

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient
    from ica_typing import TailchatReciveMessage, TailchatClient
else:
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")
    TailchatReciveMessage = TypeVar("TailchatReciveMessage")
    TailchatClient = TypeVar("TailchatClient")


# 生成一张本地信息图
def local_env_info() -> str:
    cache = io.StringIO()
    # 参考 DR 的 (crash report)
    cache.write(f"系统: {platform.platform()}\n")
    # 处理器
    try:
        cache.write("|".join([f"{x}%" for x in psutil.cpu_percent(interval=1, percpu=True)]))
        cache.write("\n")
    except OSError:
        cache.write("CPU: 未知\n")
    # Python 版本信息
    cache.write(f"{platform.python_implementation()}: {platform.python_version()}-{platform.python_branch()}({platform.python_compiler()})\n")
    # 内存信息
    try:
        memory = psutil.virtual_memory()
        cache.write(f"内存: {memory.free / 1024 / 1024 / 1024:.3f}GB/{memory.total / 1024 / 1024 / 1024:.3f}GB\n")
    except OSError:
        cache.write("内存: 未知\n")
    return cache.getvalue()

def local_env_image() -> bytes:
    img = Image.new("RGB", (800, 140), (255, 255, 255))
    # 往图片上写入一些信息
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("./SMILEYSANS-OBLIQUE.TTF", size=25)
    draw.text((10, 10), local_env_info(), fill=(0, 0, 0), font=font)
    img_cache = io.BytesIO()
    img.save(img_cache, format="PNG")
    raw_img = img_cache.getvalue()
    img_cache.close()
    return raw_img

def on_ica_message(msg: IcaNewMessage, client: IcaClient) -> None:
    if not (msg.is_from_self or msg.is_reply):
        if msg.content == "/bot":
            reply = msg.reply_with(f"ica-async-rs({client.version})-sync-py {client.ica_version}")
            client.send_message(reply)
        elif msg.content == "/bot-sys":
            datas = local_env_info()
            reply = msg.reply_with(datas)
            reply.set_img(local_env_image(), "image/png", False)
            client.send_message(reply)


def on_tailchat_message(msg: TailchatReciveMessage, client: TailchatClient) -> None:
    if not (msg.is_reply or msg.is_from_self):
        if msg.content == "/bot":
            reply = msg.reply_with(f"tailchat-async-rs({client.version})-sync-py {client.tailchat_version}")
            client.send_message(reply)
        elif msg.content == "/bot-sys":
            datas = local_env_info()
            reply = msg.reply_with(datas)
            reply.set_img(local_env_image(), "just_img.png")
            client.send_message(reply)
