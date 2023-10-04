import time
import random
import asyncio
import traceback

from typing import Dict, List, Tuple, Any, Optional, Union, Literal

import rtoml
import socketio
from colorama import Fore, Style
from nacl.signing import SigningKey
from lib_not_dr.types import Options


def get_config() -> Tuple[str, str, int]:
    with open('config.toml', 'r', encoding='utf-8') as f:
        config = rtoml.load(f)
    return config['host'], config['private_key'], config['self_id']


HOST, KEY, SELF_ID = get_config()


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


sio = socketio.AsyncClient()


@sio.on('connect')
def connect():
    print(f'{Fore.GREEN}icalingua 已连接{Style.RESET_ALL}')


@sio.on('requireAuth')
async def require_auth(salt: str, versions: Dict[str, str]):
    print(f"{Fore.BLUE}versions: {versions}{Style.RESET_ALL}")
    # 准备数据
    sign = SigningKey(bytes.fromhex(KEY))
    signature = sign.sign(bytes.fromhex(salt))
    await sio.emit('auth', signature.signature)
    print(f"{Fore.BLUE}send auth emit{Style.RESET_ALL}")


@sio.on('auth')
def auth(data: Dict[str, Any]):
    print(f"auth: {data}")


@sio.on('authFailed')
async def auth_failed():
    print(f"{Fore.RED}authFailed{Style.RESET_ALL}")
    await sio.disconnect()


@sio.on('authSucceed')
def auth_succeed():
    print(f"{Fore.GREEN}authSucceed{Style.RESET_ALL}")


@sio.on('connect_error')
def connect_error(*args, **kwargs):
    print(f"连接错误 {args}, {kwargs}")


@sio.on('updateRoom')
def update_room(data: Dict[str, Any]):
    print(f"{Fore.CYAN}update_room: {data}{Style.RESET_ALL}")


async def safe_eval(code: str) -> str:
    try:
        # code = code.replace('help', '坏东西！\n')
        # code = code.replace('bytes', '坏东西！\n')
        # code = code.replace('encode', '坏东西！\n')
        # code = code.replace('decode', '坏东西！\n')
        # code = code.replace('compile', '屑的！\n')
        # code = code.replace('globals', '拿不到！\n')
        code = code.replace('os', '坏东西！\n')
        code = code.replace('sys', '坏东西！\n')
        # code = code.replace('input', '坏东西！\n')
        # code = code.replace('__', '啊哈！\n')
        # code = code.replace('import', '很坏！\n')
        code = code.replace(' kill', '别跑！\n')
        code = code.replace(' rm ', '别跑！\n')
        code = code.replace('exit', '好坏！\n')
        code = code.replace('eval', '啊哈！\n')
        code = code.replace('exec', '抓住！\n')
        start_time = time.time()
        try:
            import os
            import math
            import decimal
            global_val = {'time':       time,
                          'math':       math,
                          'decimal':    decimal,
                          'random':     random,
                          '__import__': '<built-in function __import__>',
                          'globals':    '也别惦记你那个 globals 了',
                          'compile':    '想得美',
                          'help':       '虽然但是 help 也不行',
                          'exit':       '不许 exit',
                          'input':      '你想干嘛',
                          'return':     '别惦记你那个 return 了',
                          'getattr':    '<built-in function getattr>',
                          'setattr':    '<built-in function setattr>'}
            os.system = '不许'
            result = str(eval(code, global_val, {}))
            limit = 500
            if len(result) > limit:
                result = result[:limit]
        except:
            result = traceback.format_exc()
        end_time = time.time()
        result = result.replace(KEY, '***')
        result = result.replace(HOST, '***')

        print(f"{Fore.MAGENTA}safe_eval: {result}{Style.RESET_ALL}")

        if result == '6' or result == 6:
            result = '他确实等于 6'

        result = f'{code}\neval result:\n{result}\n耗时: {end_time - start_time} s'
        return result
    except:
        error = traceback.format_exc()
        result = f'error:\n{error}'
        return result


@sio.on('addMessage')
async def add_message(data: Dict[str, Any]):
    print(f"{Fore.MAGENTA}add_message: {data}{Style.RESET_ALL}")

    is_self = data['message']['senderId'] == SELF_ID
    sender_name = data['message']['username']
    sender_id = data['message']['senderId']
    content = data['message']['content']
    room_id = data['roomId']

    if not is_self:
        if data.get('message').get('content') == '/bot':
            message = Message(content='icalingua bot test',
                              room_id=data['roomId'])
            await sio.emit('sendMessage', message.to_json())
        elif data.get('message').get('content').startswith('=='):

            evals: str = data.get('message').get('content')[2:]
            try:
                result = await asyncio.wait_for(safe_eval(evals), 5)
            except asyncio.TimeoutError:
                result = f'{evals}\n超时'
            reply = ReplyMessage(id=data['message']['_id'])
            message = Message(content=result,
                              reply_to=reply,
                              room_id=room_id)

            await asyncio.sleep(0.5)
            await sio.emit('sendMessage', message.to_json())
        elif data['message']['content'] == 'jrrp':
            randomer = random.Random(f'{sender_id}-{data["message"]["date"]}-jrrp')
            result = randomer.randint(0, 50) + randomer.randint(0, 50)
            print(f'{sender_name} 今日人品值为 {result}')
            reply = ReplyMessage(id=data['message']['_id'])
            message = Message(content=f'{sender_name} 今日人品值为 {result}',
                              reply_to=reply,
                              room_id=room_id)
            await asyncio.sleep(0.5)
            await sio.emit('sendMessage', message.to_json())
        # 如果只包括一个或多个 6
        # elif data['message']['content'].replace(' ', '') in ('6', '666', '六', '3+3', '5+1', '4+2', '2+4', '1+5'):
        #     reply = ReplyMessage(id=data['message']['_id'])
        #     message = Message(content='你 6 nm 呢',
        #                       reply_to=reply,
        #                       room_id=room_id)
        #     await asyncio.sleep(0.5)
        #     await sio.emit('sendMessage', message.to_json())


@sio.on('deleteMessage')
def delete_message(message_id: str):
    print(f"{Fore.MAGENTA}delete_message: {message_id}{Style.RESET_ALL}")


@sio.on('setMessages')
def set_messages(data: Dict[str, Any]):
    print(f"{Fore.YELLOW}set_messages: {data}\nmessage_len: {len(data['messages'])}{Style.RESET_ALL}")


@sio.on('setAllRooms')
def set_all_rooms(rooms: List[Dict[str, Any]]):
    print(f"{Fore.YELLOW}set_all_rooms: {rooms}\nlen: {len(rooms)}\n{Style.RESET_ALL}")


@sio.on('setAllChatGroups')
def set_all_chat_groups(groups: List[Dict[str, Any]]):
    print(f"{Fore.YELLOW}set_all_chat_groups: {groups}\nlen: {len(groups)}\n{Style.RESET_ALL}")


@sio.on('notify')
def notify(data: List[Tuple[str, Any]]):
    print(f"notify: {data}")


@sio.on('closeLoading')
def close_loading(_):
    print(f"{Fore.GREEN}close_loading{Style.RESET_ALL}")


@sio.on('onlineData')
def online_data(data: Dict[str, Any]):
    print(f"{Fore.GREEN}online_data: {data}{Style.RESET_ALL}")


@sio.on('*')
def catch_all(event, data):
    print(f"{Fore.RED}catch_all: {event}|{data}{Style.RESET_ALL}")


async def main():
    await sio.connect(HOST)

    await sio.emit('requireAuth', ('', {'version': '', 'protocolVersion': ''}))
    await asyncio.sleep(2)

    await sio.wait()


if __name__ == '__main__':
    asyncio.run(main())
