import time
import json
import random
import asyncio
import argparse
import traceback

from typing import Dict, List, Tuple, Any

import socketio
from colorama import Fore
from nacl.signing import SigningKey

from lib_not_dr.loggers import config

from data_struct import SendMessage, ReplyMessage, get_config, BotConfig, BotStatus
from main import BOTCONFIG, _version_
from router import route

logger = config.get_logger("icalingua")

sio: socketio.AsyncClient = socketio.AsyncClient()


@sio.on("connect")  # type: ignore
def connect():
    logger.info(f"{Fore.GREEN}icalingua 已连接")


@sio.on("requireAuth")  # type: ignore
async def require_auth(salt: str, versions: Dict[str, str]):
    logger.info(f"{Fore.BLUE}versions: {versions}\n{type(salt)}|{salt=}")
    # 准备数据
    sign = SigningKey(bytes.fromhex(BOTCONFIG.private_key))
    signature = sign.sign(bytes.fromhex(salt))

    # 发送数据
    await sio.emit("auth", signature.signature)
    logger.info(f"{Fore.BLUE}send auth emit")


# @sio.on('requireAuth')
# def require_auth(*data: Dict[str, Any]):
#     logger.info(f"{Fore.BLUE}requireAuth: {data}")


@sio.on("auth")  # type: ignore
def auth(data: Dict[str, Any]):
    logger.info(f"auth: {data}")


@sio.on("authFailed")  # type: ignore
async def auth_failed():
    logger.info(f"{Fore.RED}authFailed")
    await sio.disconnect()


@sio.on("authSucceed")  # type: ignore
def auth_succeed():
    logger.info(f"{Fore.GREEN}authSucceed")


@sio.on("connect_error")  # type: ignore
def connect_error(*args, **kwargs):
    logger.info(f"连接错误 {args}, {kwargs}")


@sio.on("updateRoom")  # type: ignore
def update_room(data: Dict[str, Any]):
    logger.info(f"{Fore.CYAN}update_room: {data}")


@sio.on("addMessage")  # type: ignore
async def add_message(data: Dict[str, Any]):
    logger.info(f"{Fore.MAGENTA}add_message: {data}")

    is_self = data["message"]["senderId"] == BOTCONFIG.self_id

    if not is_self:
        await route(data, sio)


@sio.on("deleteMessage")  # type: ignore
def delete_message(message_id: str):
    logger.info(f"{Fore.MAGENTA}delete_message: {message_id}")


@sio.on("setMessages")  # type: ignore
def set_messages(data: Dict[str, Any]):
    logger.info(
        f"{Fore.YELLOW}set_messages: {data}\nmessage_len: {len(data['messages'])}"
    )


async def notice_startup(room_list: List[int]):
    for notice_room in BOTCONFIG.notice_room:
        if notice_room in room_list:
            notice_message = SendMessage(
                content=f"ica bot v{_version_}", room_id=notice_room
            )
            await sio.emit("sendMessage", notice_message.to_json())
            BotStatus.inited = True
            logger.info("inited", tag="notice room")
        else:
            logger.warn(f"未找到通知房间: {notice_room}", tag="notice room")
        await asyncio.sleep(random.randint(2, 5))


@sio.on("setAllRooms")  # type: ignore
async def set_all_rooms(rooms: List[Dict[str, Any]]):
    BotStatus.running = True
    room_list: List[int] = [room.get("roomId") for room in rooms]  # type: ignore
    if not BotStatus.inited:
        logger.info("initing...", tag="setAllRooms")
        logger.debug(f"room_list: {room_list}", tag="setAllRooms")
        if BOTCONFIG.notice_start:
            await notice_startup(room_list)
    if room_list != BotStatus.rooms:
        logger.info(f"{Fore.YELLOW}set_all_rooms: {rooms}\nlen: {len(rooms)}\n")
        BotStatus.rooms = room_list
        logger.info(f"更新房间: {room_list}", tag="setAllRooms")


@sio.on("setAllChatGroups")  # type: ignore
def set_all_chat_groups(groups: List[Dict[str, Any]]):
    logger.info(f"{Fore.YELLOW}set_all_chat_groups: {groups}\nlen: {len(groups)}\n")


@sio.on("notify")  # type: ignore
def notify(data: List[Tuple[str, Any]]):
    logger.info(f"notify: {data}")


@sio.on("closeLoading")  # type: ignore
def close_loading(_):
    logger.info(f"{Fore.GREEN}close_loading")


@sio.on("onlineData")  # type: ignore
def online_data(data: Dict[str, Any]):
    logger.info(f"{Fore.GREEN}online_data: {data}")


@sio.on("*")  # type: ignore
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


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt")
    except Exception:
        logger.error(traceback.format_exc())
