
import time
import random
import asyncio
import argparse
import traceback
    
from typing import Dict, List, Tuple, Any

# import qtoml
import socketio
from colorama import Fore
from nacl.signing import SigningKey
# from lib_not_dr.types import Options
from lib_not_dr.loggers import config

from data_struct import AtElement, Message, ReplyMessage, get_config, BotConfig, BotStatus

_version_ = "0.2.1"

logger = config.get_logger('icalingua')

BOTCONFIG: BotConfig = get_config()

if __name__ == '__main__':
    # --debug
    # --config=config.toml
    # -n --no-notice
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--debug', action='store_true')
    parser.add_argument('-n', '--no-notice', action='store_true')
    parser.add_argument('-c', '--config', type=str)
    args = parser.parse_args()
    if args.debug:
        logger.global_level = 0
    if args.config:
        # global BOTCONFIG
        BOTCONFIG: BotConfig = get_config(args.config)
    if args.no_notice:
        BOTCONFIG.notice_start = False

BotStatus = BotStatus()

sio: socketio.AsyncClient = socketio.AsyncClient()


@sio.on('connect')  # type: ignore
def connect():
    logger.info(f'{Fore.GREEN}icalingua 已连接')


@sio.on('requireAuth')  # type: ignore
async def require_auth(salt: str, versions: Dict[str, str]):
    logger.info(f"{Fore.BLUE}versions: {versions}\n{type(salt)}|{salt=}")
    # 准备数据
    sign = SigningKey(bytes.fromhex(BOTCONFIG.private_key))
    signature = sign.sign(bytes.fromhex(salt))
    
    # 发送数据
    await sio.emit('auth', signature.signature)
    logger.info(f"{Fore.BLUE}send auth emit")

# @sio.on('requireAuth')
# def require_auth(*data: Dict[str, Any]):
#     logger.info(f"{Fore.BLUE}requireAuth: {data}")


@sio.on('auth')  # type: ignore
def auth(data: Dict[str, Any]):
    logger.info(f"auth: {data}")


@sio.on('authFailed')  # type: ignore
async def auth_failed():
    logger.info(f"{Fore.RED}authFailed")
    await sio.disconnect()


@sio.on('authSucceed')  # type: ignore
def auth_succeed():
    logger.info(f"{Fore.GREEN}authSucceed")


@sio.on('connect_error')  # type: ignore
def connect_error(*args, **kwargs):
    logger.info(f"连接错误 {args}, {kwargs}")


@sio.on('updateRoom')  # type: ignore
def update_room(data: Dict[str, Any]):
    logger.info(f"{Fore.CYAN}update_room: {data}")


def safe_eval(code: str) -> str:
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
        result = result.replace(BOTCONFIG.private_key, '***')
        result = result.replace(BOTCONFIG.host, '***')

        logger.info(f"{Fore.MAGENTA}safe_eval: {result}")

        if result == '6' or result == 6:
            result = '他确实等于 6'

        result = f'{code}\neval result:\n{result}\n耗时: {end_time - start_time} s'
        return result
    except:
        error = traceback.format_exc()
        result = f'error:\n{error}'
        return result


@sio.on('addMessage')  # type: ignore
async def add_message(data: Dict[str, Any]):
    logger.info(f"{Fore.MAGENTA}add_message: {data}")

    is_self = data['message']['senderId'] == BOTCONFIG.self_id
    sender_name = data['message']['username']
    sender_id = data['message']['senderId']
    content = data['message']['content']
    room_id = data['roomId']

    if not is_self:
        if content == '/bot':
            message = Message(content='icalingua bot test',
                              room_id=data['roomId'])
            await sio.emit('sendMessage', message.to_json())
        elif content.startswith('=='):

            evals: str = content[2:]

            # quene = multiprocessing.Queue()
            # def run(quene, evals):
            #     go = safe_eval(evals)
            #     quene.put(go)
            # process = multiprocessing.Process(target=run, args=(quene, evals))
            # process.start()
            # process.join(1)
            # if quene.empty():
            #     result = '超时'
            # else:
            #     result = quene.get()
            whitelist = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '.', '+', '-', '*', '/', '(', ')', '<',
                         '>', '=']
            evals = evals.replace('**', '')
            express = ''
            for text in evals:
                if text in whitelist:
                    express += text
            if express == '':
                result = '你在干嘛'
            else:
                result = str(eval(express))

            reply = ReplyMessage(id=data['message']['_id'])
            message = Message(content=result,
                              reply_to=reply,
                              room_id=room_id)

            await asyncio.sleep(random.random() * 2)
            await sio.emit('sendMessage', message.to_json())
        elif content == '!!jrrp':
            randomer = random.Random(f'{sender_id}-{data["message"]["date"]}-jrrp-{_version_}')
            result = randomer.randint(0, 50) + randomer.randint(0, 50)
            logger.info(f'{sender_name} 今日人品值为 {result}')
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


@sio.on('deleteMessage')  # type: ignore
def delete_message(message_id: str):
    logger.info(f"{Fore.MAGENTA}delete_message: {message_id}")


@sio.on('setMessages')  # type: ignore
def set_messages(data: Dict[str, Any]):
    logger.info(f"{Fore.YELLOW}set_messages: {data}\nmessage_len: {len(data['messages'])}")


async def notice_startup(room_list: List[int]):
    for notice_room in BOTCONFIG.notice_room:
        if notice_room in room_list:
            notice_message = Message(content=f'ica bot v{_version_}', room_id=notice_room)
            await sio.emit('sendMessage', notice_message.to_json())
            BotStatus.inited = True
            logger.info("inited", tag='notice room')
        else:
            logger.warn(f"未找到通知房间: {notice_room}", tag='notice room')
        await asyncio.sleep(random.randint(2, 5))


@sio.on('setAllRooms')  # type: ignore
async def set_all_rooms(rooms: List[Dict[str, Any]]):
    BotStatus.running = True
    room_list: List[int] = [room.get('roomId') for room in rooms]  # type: ignore
    if not BotStatus.inited:
        logger.info("initing...", tag='setAllRooms')
        logger.debug(f"room_list: {room_list}", tag='setAllRooms')
        if BOTCONFIG.notice_start:
            await notice_startup(room_list)
    if room_list != BotStatus.rooms:
        logger.info(f"{Fore.YELLOW}set_all_rooms: {rooms}\nlen: {len(rooms)}\n")
        BotStatus.rooms = room_list
        logger.info(f"更新房间: {room_list}", tag='setAllRooms')


@sio.on('setAllChatGroups')  # type: ignore
def set_all_chat_groups(groups: List[Dict[str, Any]]):
    logger.info(f"{Fore.YELLOW}set_all_chat_groups: {groups}\nlen: {len(groups)}\n")


@sio.on('notify')  # type: ignore
def notify(data: List[Tuple[str, Any]]):
    logger.info(f"notify: {data}")


@sio.on('closeLoading')  # type: ignore
def close_loading(_):
    logger.info(f"{Fore.GREEN}close_loading")


@sio.on('onlineData')  # type: ignore
def online_data(data: Dict[str, Any]):
    logger.info(f"{Fore.GREEN}online_data: {data}")


@sio.on('*')  # type: ignore
def catch_all(event, data):
    logger.info(f"{Fore.RED}catch_all: {event}|{data}")



async def main():
    """
    while True:
        await self.eio.wait()
        await self.sleep(1)  # give the reconnect task time to start up
        if not self._reconnect_task:
            break
        await self._reconnect_task
        if self.eio.state != 'connected':
            break
    """
    await sio.connect(BOTCONFIG.host)
    await sio.wait()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt")
    except Exception:
        logger.error(traceback.format_exc())

