from typing import List, Optional, Union, Literal, Tuple

import qtoml
from lib_not_dr.types import Options


class AtElement(Options):
    text: str
    id: Union[int, Literal['all']] = 'all'


class ReplyMessage(Options):
    id: str
    username: str = ''
    content: str = ''
    files: list = []

    def to_json(self) -> dict:
        return {
            '_id':      self.id,
            'username': self.username,
            'content':  self.content,
            'files':    self.files
        }


class Message(Options):
    content: str
    room_id: Optional[int] = None
    room: Optional[int] = None  # room id 和 room 二选一  ( 实际上直接填 room id 就行了 )
    file: None = None  # TODO: 上传文件
    reply_to: Optional[ReplyMessage] = None  # 源码 给了一个 any TODO: 回复消息
    b64_img: Optional[str] = None  # TODO: 发送图片
    at: Optional[List[AtElement]] = []  # TODO: @某人
    sticker: Optional[None] = None  # TODO: 发送表情
    message_type: Optional[str] = None  # TODO: 消息类型

    def to_json(self) -> dict:
        return {
            'content':      self.content,
            'roomId':       self.room_id,
            'room':         self.room,
            'file':         self.file,
            'replyMessage': self.reply_to.to_json() if self.reply_to else None,
            'b64img':       self.b64_img,
            'at':           self.at,
            'sticker':      self.sticker,
            'messageType':  self.message_type
        }


class BotConfig(Options):
    name = 'icalingua bot config'
    # _check_filled = True
    host: str
    private_key: str
    self_id: int
    notice_room: List[int]
    notice_start: bool = False
    
    def init(self, **kwargs) -> None:
        if self.notice_room is None:
            self.notice_start = False


def get_config(config_path: str = 'config.toml') -> BotConfig:
    with open(config_path, 'r', encoding='utf-8') as f:
        config = qtoml.decoder.load(f)
    return BotConfig(**config)


class BotStatus(Options):
    inited: bool = False
    running: bool = False
    rooms: List[int] = []
