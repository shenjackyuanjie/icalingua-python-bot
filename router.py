import random
import asyncio

from lib_not_dr.loggers import config

from plugins.safe_eval import safe_eval
from plugins.bmcl import bmcl
from plugins.yw import yw

logger = config.get_logger("router")

async def route(content, sio):
    if content == "/bot":
        message = reply_msg.to_content(f"icalingua bot pong v{_version_}")
        await sio.emit("sendMessage", message.to_json())
    elif content.startswith("=="):
        evals: str = content[2:]

        result = safe_eval(evals)
        # whitelist = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '.', '+', '-', '*', '/', '(', ')', '<',
        #              '>', '=']
        # evals = evals.replace('**', '')
        # express = ''
        # for text in evals:
        #     if text in whitelist:
        #         express += text
        # if express == '':
        #     result = '你在干嘛'
        # else:
        #     result = str(eval(express))
        message = reply_msg.to_content(result)

        await asyncio.sleep(random.random() * 2)
        await sio.emit("sendMessage", message.to_json())
    elif content == "!!jrrp":
        randomer = random.Random(
            f'{sender_id}-{data["message"]["date"]}-jrrp-{_version_}'
        )
        result = randomer.randint(0, 50) + randomer.randint(0, 50)
        logger.info(f"{sender_name} 今日人品值为 {result}")
        message = reply_msg.to_content(f"{sender_name} 今日人品为 {result}")
        await asyncio.sleep(0.5)
        await sio.emit("sendMessage", message.to_json())
    elif content == "/bmcl":
        await bmcl.bmcl(sio)
    elif content == "/yw":
        message = yw.yw()
        await asyncio.sleep(random.random() * 2)
        await sio.emit("sendMessage", message.to_json())
        
