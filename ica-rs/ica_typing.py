# Python 兼容版本 3.8+

from typing import Optional


class IcaStatus:
    @property
    def login(self) -> bool:
        ...
    @property
    def online(self) -> bool:
        ...
    @property
    def self_id(self) -> Optional[bool]:
        ...
    @property
    def nick_name(self) -> Optional[str]:
        ...
    @property
    def ica_version(self) -> Optional[str]:
        ...
    @property
    def os_info(self) -> Optional[str]:
        ...
    @property
    def resident_set_size(self) -> Optional[str]:
        ...
    @property
    def head_used(self) -> Optional[str]:
        ...
    @property
    def load_average(self) -> Optional[str]:
        ...


class ReplyMessage:
    ...


class SendMessage:
    ...


class NewMessage:
    def reply_with(self, message: str) -> SendMessage:
        ...
    def __str__(self) -> str:
        ...
    @property
    def content(self) -> str:
        ...
    @property
    def sender_id(self) -> int:
        ...
    @property
    def is_from_self(self) -> bool:
        ...
    @property
    def is_reply(self) -> bool:
        ...


class IcaClient:
    @staticmethod
    async def send_message_a(client: "IcaClient", message: SendMessage) -> bool:
        """
        仅作占位
        (因为目前来说, rust调用 Python端没法启动一个异步运行时
        所以只能 tokio::task::block_in_place 转换成同步调用)
        """
    def send_message(self, message: SendMessage) -> bool:
        ...
    def debug(self, message: str) -> None:
        ...
    def info(self, message: str) -> None:
        ...
    def warn(self, message: str) -> None:
        ...


def on_message(msg: NewMessage, client: IcaClient) -> None:
    ...
