from typing import TYPE_CHECKING, TypeVar

if TYPE_CHECKING:
    from ica_typing import NewMessage, IcaClient
else:
    NewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

def on_message(msg: NewMessage, client: IcaClient) -> None:
    if not (msg.is_from_self or msg.is_reply):
        if msg.content == "/bot":
            reply = msg.reply_with(f"ica-async-rs({client.version})-sync-py {client.ica_version}")
            client.send_message(reply)
