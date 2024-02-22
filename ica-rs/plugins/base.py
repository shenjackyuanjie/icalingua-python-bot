from typing import TYPE_CHECKING, TypeVar

if TYPE_CHECKING:
    from ica_typing import NewMessage, IcaClient
else:
    NewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

_version_ = "1.0.0"

def on_message(msg: NewMessage, client: IcaClient) -> None:
    if not msg.is_from_self:
        if msg.content == "/bot-rs-py":
            reply = msg.reply_with(f"ica-async-rs-sync-py {_version_}")
            client.send_message(reply)
