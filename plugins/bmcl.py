import json
import aiohttp

from lib_not_dr.loggers import config

from data_struct import NewMessage, SendMessage

logger = config.get_logger("bmcl")

_version_ = "1.0.0"


async def bmcl(sio, reply_msg: SendMessage, msg: NewMessage):
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
                data_lens = ["B", "KB", "MB", "GB", "TB"]
                data_len = "0B"
                for i in range(5):
                    if data_bytes < 1024:
                        data_bytes = round(data_bytes, 5)
                        data_len = f"{data_bytes}{data_lens[i]}"
                        break
                    else:
                        data_bytes /= 1024

                report_msg = (
                    f"OpenBMCLAPI 状态面板v{_version_} :\n"
                    f"在线节点: {online_node}  带宽: {online_bandwidth}Mbps\n"
                    f"实时负载: {load_str:.3f}%  带宽: {data_bandwidth:.5f}Mbps\n"
                    f"当日请求: {data_hits} 总数据量: {data_len}"
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
