def safe_eval(code: str) -> str:
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
                "globals": "也别惦记你那个 globals 了",
                "compile": "想得美",
                "help": "虽然但是 help 也不行",
                "exit": "不许 exit",
                "input": "你想干嘛",
                "return": "别惦记你那个 return 了",
                "getattr": "<built-in function getattr>",
                "setattr": "<built-in function setattr>",
            }
            os.system = "不许"
            result = str(eval(code, global_val, {}))
            limit = 500
            if len(result) > limit:
                result = result[:limit]
        except:
            result = traceback.format_exc()
        end_time = time.time()
        result = result.replace(BOTCONFIG.private_key, "***")
        result = result.replace(BOTCONFIG.host, "***")

        logger.info(f"{Fore.MAGENTA}safe_eval: {result}")

        if result == "6" or result == 6:
            result = "他确实等于 6"

        result = f"{code}\neval result:\n{result}\n耗时: {end_time - start_time} s"
        return result
    except:
        error = traceback.format_exc()
        result = f"error:\n{error}"
        return result
