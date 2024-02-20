import time
import json
import aiohttp

from lib_not_dr.loggers import config

from data_struct import NewMessage, SendMessage

logger = config.get_logger("bmcl")

_version_ = "1.1.0"


def format_data_size(data_bytes: float) -> str:
    data_lens = ["B", "KB", "MB", "GB", "TB"]
    data_len = "0B"
    for i in range(5):
        if data_bytes < 1024:
            data_bytes = round(data_bytes, 5)
            data_len = f"{data_bytes}{data_lens[i]}"
            break
        else:
            data_bytes /= 1024
    return data_len


def format_hit_count(count: int) -> str:
    """数据分段, 四位一个下划线

    Args:
        count (int): 数据

    Returns:
        str: 格式化后的数据
    1 -> 1
    1000 -> 1000
    10000 -> 1_0000
    100000 -> 10_0000
    1000000 -> 100_0000
    """
    count_str = str(count)
    count_len = len(count_str)
    if count_len <= 4:
        return count_str
    else:
        return "_".join(count_str[i:i + 4] for i in range(0, count_len, 4))
    

async def bmcl(sio, reply_msg: SendMessage, msg: NewMessage):
    req_time = time.time()
    # 记录请求时间
    async with aiohttp.ClientSession() as session:
        async with session.get(
                "https://bd.bangbang93.com/openbmclapi/metric/dashboard"
        ) as response:
            if not response.status == 200 or response.reason != "OK":
                await sio.emit(
                    "sendMessage",
                    reply_msg.to_content(
                        f"请求数据失败\n{response.status}"
                    ).to_json(),
                )
                logger.warn(
                    f"数据请求失败, 请检查网络\n{response.status}",
                    tag="bmclapi_dashboard",
                )
                return
            raw_data = await response.text()
            try:
                data = json.loads(raw_data)
                data_bytes: float = data["bytes"]
                data_hits: int = data["hits"]
                data_bandwidth: float = data["currentBandwidth"]
                load_str: float = data["load"] * 100
                online_node: int = data["currentNodes"]
                online_bandwidth: int = data["bandwidth"]
                data_len = format_data_size(data_bytes)
                hits_count = format_hit_count(data_hits)

                report_msg = (
                    f"OpenBMCLAPI 状态面板v{_version_} :\n"
                    f"在线节点: {online_node}  带宽: {online_bandwidth}Mbps\n"
                    f"实时负载: {load_str:.3f}%  带宽: {data_bandwidth:.5f}Mbps\n"
                    f"当日请求: {hits_count} 总数据量: {data_len}\n"
                    f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}\n"
                     "数据源: https://bd.bangbang93.com/pages/dashboard"
                )
                await sio.emit(
                    "sendMessage",
                    reply_msg.to_content(report_msg).to_json()
                )

            except (json.JSONDecodeError, AttributeError, ValueError) as e:
                await sio.emit(
                    "sendMessage",
                    reply_msg.to_content(f"返回数据解析错误\n{e}").to_json(),
                )
                logger.warn(f"返回数据解析错误\n{e}", tag="bmclapi_dashboard")
