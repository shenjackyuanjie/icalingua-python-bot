# Python 兼容版本 3.8+

from typing import Callable, Tuple, NewType, TYPE_CHECKING, TypeVar, Optional

"""
ica.rs
pub type RoomId = i64;
pub type UserId = i64;
pub type MessageId = String;
"""
class IcaType:
    RoomId = NewType('RoomId', int)
    UserId = NewType('UserId', int)
    MessageId = NewType('MessageId', str)

"""
tailchat.rs
pub type GroupId = String;
pub type ConverseId = String;
pub type UserId = String;
pub type MessageId = String;
"""
class TailchatType:
    GroupId = NewType('GroupId', str)
    ConverseId = NewType('ConverseId', str)
    UserId = NewType('UserId', str)
    MessageId = NewType('MessageId', str)

class IcaStatus:
    """
    ica状态信息
    此类并不存储信息, 所有方法都是实时获取
    """
    @property
    def qq_login(self) -> bool:
        ...
    @property
    def online(self) -> bool:
        ...
    @property
    def self_id(self) -> IcaType.UserId:
        ...
    @property
    def nick_name(self) -> str:
        ...
    @property
    def ica_version(self) -> str:
        ...
    @property
    def os_info(self) -> str:
        ...
    @property
    def resident_set_size(self) -> str:
        ...
    @property
    def head_used(self) -> str:
        ...
    @property
    def load(self) -> str:
        ...


class IcaReplyMessage:
    ...


class IcaSendMessage:
    @property
    def content(self) -> str:
        ...
    @content.setter
    def content(self, value: str) -> None:
        ...
    def with_content(self, content: str) -> "IcaSendMessage":
        """
        为了链式调用, 返回自身
        """
        self.content = content
        return self
    def set_img(self, file: bytes, file_type: str, as_sticker: bool):
        """
        设置消息的图片
        @param file: 图片文件 (实际上是 vec<u8>)
        @param file_type: 图片类型 (MIME) (image/png; image/jpeg)
        @param as_sticker: 是否作为贴纸发送
        """


class IcaDeleteMessage:
    def __str__(self) -> str:
        ...


class IcaNewMessage:
    """
    Icalingua 接收到新消息
    """
    def reply_with(self, message: str) -> IcaSendMessage:
        """回复这条消息"""
        ...
    def as_deleted(self) -> IcaDeleteMessage:
        ...
    def __str__(self) -> str:
        ...
    @property
    def id(self) -> IcaType.MessageId:
        ...
    @property
    def content(self) -> str:
        ...
    @property
    def sender_id(self) -> IcaType.UserId:
        ...
    @property
    def is_from_self(self) -> bool:
        ...
    @property
    def is_reply(self) -> bool:
        ...
    @property
    def is_room_msg(self) -> bool:
        """是否是群聊消息"""
        ...
    @property
    def is_chat_msg(self) -> bool:
        """是否是私聊消息"""
        ...
    @property
    def room_id(self) -> IcaType.RoomId:
        """
        如果是群聊消息, 返回 (-群号)
        如果是私聊消息, 返回 对面qq
        """
        ...


class IcaClient:
    """
    Icalingua 的客户端
    """
    # @staticmethod
    # async def send_message_a(client: "IcaClient", message: SendMessage) -> bool:
    #     """
    #     仅作占位, 不能使用
    #     (因为目前来说, rust调用 Python端没法启动一个异步运行时
    #     所以只能 tokio::task::block_in_place 转换成同步调用)
    #     """
    def send_message(self, message: IcaSendMessage) -> bool:
        ...
    def send_and_warn(self, message: IcaSendMessage) -> bool:
        """发送消息, 并在日志中输出警告信息"""
        self.warn(message.content)
        return self.send_message(message)
    def delete_message(self, message: IcaDeleteMessage) -> bool:
        ...

    @property
    def status(self) -> IcaStatus:
        ...
    @property
    def version(self) -> str:
        ...
    @property
    def ica_version(self) -> str:
        """shenbot ica 的版本号"""
        ...
    def debug(self, message: str) -> None:
        """向日志中输出调试信息"""
        ...
    def info(self, message: str) -> None:
        """向日志中输出信息"""
        ...
    def warn(self, message: str) -> None:
        """向日志中输出警告信息"""
        ...


class TailchatReciveMessage:
    """
    Tailchat 接收到的新消息
    """
    @property
    def id(self) -> TailchatType.MessageId:
        ...
    @property
    def content(self) -> str:
        ...
    @property
    def sender_id(self) -> TailchatType.UserId:
        ...
    @property
    def is_from_self(self) -> bool:
        ...
    @property
    def is_reply(self) -> bool:
        ...
    @property
    def group_id(self) -> Optional[TailchatType.GroupId]:
        ...
    @property
    def converse_id(self) -> TailchatType.ConverseId:
        ...
    def reply_with(self, message: str) -> "TailchatSendingMessage":
        """回复这条消息"""
        ...
    def as_reply(self, message: str) -> "TailchatSendingMessage":
        """回复这条消息"""
        ...


class TailchatSendingMessage:
    """
    Tailchat 将要发送的信息
    """
    @property
    def content(self) -> str:
        ...
    @content.setter
    def content(self, value: str) -> None:
        ...
    @property
    def group_id(self) -> Optional[TailchatType.GroupId]:
        ...
    @group_id.setter
    def group_id(self, value: Optional[TailchatType.GroupId]) -> None:
        ...
    @property
    def converse_id(self) -> TailchatType.ConverseId:
        ...
    @converse_id.setter
    def converse_id(self, value: TailchatType.ConverseId) -> None:
        ...
    def with_content(self, content: str) -> "TailchatSendingMessage":
        """
        为了链式调用, 返回自身
        """
        self.content = content
        return self
    # def set_img(self, file: bytes, file_type: str, as_sticker: bool):
    #     """
    #     设置消息的图片
    #     @param file: 图片文件 (实际上是 vec<u8>)
    #     @param file_type: 图片类型 (MIME) (image/png; image/jpeg)
    #     @param as_sticker: 是否作为贴纸发送
    #     """


class TailchatClient:
    """
    Tailchat 的客户端
    """
    def send_message(self, message: TailchatSendingMessage) -> bool:
        ...
    def send_and_warn(self, message: TailchatSendingMessage) -> bool:
        """发送消息, 并在日志中输出警告信息"""
        self.warn(message.content)
        return self.send_message(message)
    @property
    def version(self) -> str:
        ...
    @property
    def tailchat_version(self) -> str:
        """tailchat 的版本号"""
        ...
    def debug(self, message: str) -> None:
        """向日志中输出调试信息"""
    def info(self, message: str) -> None:
        """向日志中输出信息"""
    def warn(self, message: str) -> None:
        """向日志中输出警告信息"""


class ConfigData:
    def __getitem__(self, key: str):
        ...
    def have_key(self, key: str) -> bool:
        ...


on_load = Callable[[IcaClient], None]
# def on_load(client: IcaClient) -> None:
#     ...

on_ica_message = Callable[[IcaNewMessage, IcaClient], None]
# def on_message(msg: NewMessage, client: IcaClient) -> None:
#     ...

on_ica_delete_message = Callable[[IcaType.MessageId, IcaClient], None]
# def on_delete_message(msg_id: MessageId, client: IcaClient) -> None:
#     ...

on_tailchat_message = Callable[[TailchatClient, TailchatReciveMessage], None]
# def on_tailchat_message(client: TailchatClient, msg: TailchatReciveMessage) -> None:
#     ...

on_config = Callable[[None], Tuple[str, str]]

CONFIG_DATA: ConfigData = ConfigData()
