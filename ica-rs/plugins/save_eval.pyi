import time
import random
import traceback

from typing import TYPE_CHECKING, TypeVar

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient
else:
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

def safe_eval(code: str, msg: IcaNewMessage) -> str:
    try:
        # code = code.replace('help', '坏东西！\n')
        # code = code.replace('bytes', '坏东西！\n')
        # code = code.replace('encode', '坏东西！\n')
        # code = code.replace('decode', '坏东西！\n')
        # code = code.replace('compile', '屑的！\n')
        # code = code.replace('globals', '拿不到！\n')
        code = code.replace("os", "坏东西！\n")
        code = code.replace("sys", "坏东西！\n")
        # code = code.replace('input', '坏东西！\n')
        # code = code.replace('__', '啊哈！\n')
        # code = code.replace('import', '很坏！\n')
        code = code.replace(" kill", "别跑！\n")
        code = code.replace(" rm ", "别跑！\n")
        code = code.replace("exit", "好坏！\n")
        code = code.replace("eval", "啊哈！\n")
        code = code.replace("exec", "抓住！\n")
        start_time = time.time()
        try:
            import os
            import math
            import decimal

            global_val = {
                "time": time,
                "math": math,
                "decimal": decimal,
                "random": random,
                "__import__": "<built-in function __import__>",
                "globals": "<built-in function globals>",
                "compile": "<built-in function compile>",
                "open": "<built-in function open>",
                "help": "<built-in function help>",
                "exit": "<built-in function exit>",
                "input": "<built-in function input>",
                "return": "别惦记你那个 return 了",
                "getattr": "<built-in function getattr>",
                "setattr": "<built-in function setattr>",
                "msg": msg,
            }
            os.system = "不许"
            result = str(eval(code, global_val, {}))
            limit = 500
            if len(result) > limit:
                result = result[:limit]
        except:
            result = traceback.format_exc()
        end_time = time.time()

        if result == "6" or result == 6:
            result = "他确实等于 6"

        result = f"{code}\neval result:\n{result}\n耗时: {end_time - start_time} s"
        return result
    except:
        error = traceback.format_exc()
        result = f"error:\n{error}"
        return result


def on_message(message: IcaNewMessage, client: IcaClient) -> None:
    if not (message.is_from_self or message.is_reply):
        if message.content.startswith("/="):
            code = message.content[2:]
            result = safe_eval(code, message)
            reply = message.reply_with(result)
            client.send_message(reply)
