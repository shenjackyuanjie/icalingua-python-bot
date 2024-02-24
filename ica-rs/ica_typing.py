# Python 兼容版本 3.8+

from typing import Optional, Callable

"""
pub type RoomId = i64;
pub type UserId = i64;
pub type MessageId = String;
"""

RoomId = int
UserId = int
MessageId = str


class IcaStatus:
    @property
    def login(self) -> bool:
        ...
    @property
    def online(self) -> bool:
        ...
    @property
    def self_id(self) -> Optional[UserId]:
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
    @property
    def content(self) -> str:
        ...
    @content.setter
    def content(self, value: str) -> None:
        ...
    def with_content(self, content: str) -> "SendMessage":
        """
        为了链式调用, 返回自身
        """
        self.content = content
        return self


class NewMessage:
    def reply_with(self, message: str) -> SendMessage:
        ...
    def __str__(self) -> str:
        ...
    @property
    def id(self) -> MessageId:
        ...
    @property
    def content(self) -> str:
        ...
    @property
    def sender_id(self) -> UserId:
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
        仅作占位, 不能使用
        (因为目前来说, rust调用 Python端没法启动一个异步运行时
        所以只能 tokio::task::block_in_place 转换成同步调用)
        """
    def send_message(self, message: SendMessage) -> bool:
        ...
    
    @property
    def status() -> IcaStatus:
        ...
    
    def debug(self, message: str) -> None:
        """向日志中输出调试信息"""
    def info(self, message: str) -> None:
        """向日志中输出信息"""
    def warn(self, message: str) -> None:
        """向日志中输出警告信息"""


on_load = Callable[[IcaClient], None]
# def on_load(client: IcaClient) -> None:
#     ...

on_message = Callable[[NewMessage, IcaClient], None]
# def on_message(msg: NewMessage, client: IcaClient) -> None:
#     ...

on_delete_message = Callable[[MessageId, IcaClient], None]
# def on_delete_message(msg_id: MessageId, client: IcaClient) -> None:
#     ...
