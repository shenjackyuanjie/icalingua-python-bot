from typing import Optional
from lib_not_dr.types import Options


class SocketData(Options):
    name = 'SocketData'

    def init(self, **kwargs) -> bool:
        self.from_json(kwargs)
        return False

    def from_json(self, data: dict):
        ...

    def to_json(self) -> dict:
        return self.option()


class Message(SocketData):
    name = 'icalingua socket message'

    # 消息 id
    message_id: str
    # 发送者 id
    sender_id: int
    # 发送者昵称
    sender_name: str
    # 消息内容
    content: str

    # 消息时间戳
    # 13:32:46
    time_stamp: str
    # 消息日期
    # 2023/10/05
    date: str
    # unix 时间戳
    # 1633395166
    unix_time_stamp: int

    # 发送者身份
    role: str
    # 发送者群昵称/备注
    title: str
    # 匿名 id
    anonymous_id: Optional[int] = None
    # 是否匿名
    is_anonymous: bool = False
    # 啊 ?
    bubble_id: int
    # 啊 ?
    sub_id: int

    file: Optional[dict] = None
    files: Optional[list] = None


class AddMessage(SocketData):
    name = 'icalingua socket add message event'

    room_id: int



