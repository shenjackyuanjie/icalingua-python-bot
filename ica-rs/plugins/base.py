from typing import TYPE_CHECKING, TypeVar
import platform
import PIL.Image
import io

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient
    from ica_typing import TailchatReciveMessage, TailchatClient
else:
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")
    TailchatReciveMessage = TypeVar("TailchatReciveMessage")
    TailchatClient = TypeVar("TailchatClient")

def on_ica_message(msg: IcaNewMessage, client: IcaClient) -> None:
    if not (msg.is_from_self or msg.is_reply):
        if msg.content == "/bot":
            reply = msg.reply_with(f"ica-async-rs({client.version})-sync-py {client.ica_version}")
            client.send_message(reply)


def on_tailchat_message(msg: TailchatReciveMessage, client: TailchatClient) -> None:
    # if not (msg.is_from_self or msg.is_reply):
    if not (msg.is_reply):
        if msg.content == "/bot":
            reply = msg.reply_with(f"tailchat-async-rs({client.version})-sync-py {client.tailchat_version}")
            client.send_message(reply)
        elif msg.content == "/image":
            image = PIL.Image.new("RGB", (100, 100), (255, 255, 255))
            img_cache = io.BytesIO()
            image.save(img_cache, format="JPEG")
            raw_img = img_cache.getvalue()
            img_cache.close()
            reply = msg.reply_with("Here is an image")
            reply.set_img(raw_img, "just_img.png")
            client.send_message(reply)
