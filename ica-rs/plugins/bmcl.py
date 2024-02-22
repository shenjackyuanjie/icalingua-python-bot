import re
import time
import requests

from typing import TYPE_CHECKING, TypeVar, Optional

if TYPE_CHECKING:
    from ica_typing import NewMessage, IcaClient
else:
    NewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

_version_ = "2.1.0-rs"

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


def wrap_request(url: str, client: IcaClient) -> Optional[dict]:
    response = requests.get(url)
    if not response.status_code == 200 or response.reason != "OK":
        client.warn(
            f"数据请求失败, 请检查网络\n{response.status}"
        )
        return None
    return response.json()



def bmcl_dashboard(msg: NewMessage, client: IcaClient) -> None:
    req_time = time.time()
    # 记录请求时间
    data = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/dashboard", client)
    if data is None:
        return
    data_bytes: float = data["bytes"]
    data_hits: int = data["hits"]
    data_bandwidth: float = data["currentBandwidth"]
    load_str: float = data["load"] * 100
    online_node: int = data["currentNodes"]
    online_bandwidth: int = data["bandwidth"]
    data_len = format_data_size(data_bytes)
    hits_count = format_hit_count(data_hits)
    
    report_msg = (
        f"OpenBMCLAPI 面板v{_version_}-状态\n"
        f"实时信息: {online_node}  带宽: {online_bandwidth}Mbps\n"
        f"负载: {load_str:.2f}%  带宽: {data_bandwidth:.2f}Mbps\n"
        f"当日请求: {hits_count} 数据量: {data_len}\n"
        f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}\n"
         "数据源: https://bd.bangbang93.com/pages/dashboard"
    )
    client.info(report_msg)
    reply = msg.reply_with(report_msg)
    client.send_message(reply)


def parse_rank(data: dict) -> dict:
    rank_data = {"hits": 0, "bytes": 0}
    if "metric" in rank_data:
        rank_data["hits"] = data["metric"]["hits"]
        rank_data["bytes"] = data["metric"]["bytes"]
    return {
        "name": data["name"],
        "start": data["isEnabled"],
        "full": data["fullSize"],
        "version": data["version"] if "version" in data else "未知版本",
        "owner": data["user"]["name"],
        "rank": rank_data
    }


def bmcl_rank(msg: NewMessage, client: IcaClient, name: Optional[str]) -> None:
    req_time = time.time()
    # 记录请求时间
    rank_data = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/rank", client)
    if rank_data is None:
        return
    ranks = [parse_rank(data) for data in rank_data] 
    if name is None:
        # 全部排名
        # 显示前10名
        if len(ranks) < 10:
            show_ranks = ranks
        else:
            show_ranks = ranks[:10]
        rank_msg = (
            f"名称: {r["name"]}-{"全" if r["full"] else "分"} 版本: {r["version"]}\n"
            f"拥有者: {r["owner"]} 状态: {r["start"]}\n"
            f"h/d {format_hit_count(r["rank"]["hits"])}|{format_data_size(r["rank"]["bytes"])}\n"
            for r in show_ranks
        )
        report_msg = (
            f"OpenBMCLAPI 面板v{_version_}-排名\n"
            f"{'\n'.join(rank_msg)}"
            f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}\n"
            "数据源: https://bd.bangbang93.com/openbmclapi/metric/rank"
        )
        reply = msg.reply_with(report_msg)
        client.info(report_msg)
        client.send_message(reply)
        return
    else:
        # 搜索是否有这个名字的节点
        names = [r["name"] for r in ranks]
        finds = [re.search(name, n) for n in names]
        if not finds:
            reply = msg.reply_with(f"未找到名为{name}的节点")
            client.send_message(reply)
            return
        # 如果找到 > 3 个节点, 则提示 不显示
        counts = [True for find in finds if find]
        if len(counts) > 3:
            reply = msg.reply_with(f"搜索|{name}|到{len(counts)}个节点, 请用更精确的名字")
            client.send_message(reply)
            return
        for i, find in enumerate(finds):
            if find:
                rank = ranks[i]
                rank_msg = (
                    f"名称: {rank["name"]}-{"全" if rank["full"] else "分"} 版本: {rank["version"]}\n"
                    f"拥有者: {rank["owner"]} 状态: {rank["start"]}\n"
                    f"h/d {format_hit_count(rank["rank"]["hits"])}|{format_data_size(rank["rank"]["bytes"])}\n"
                )
                report_msg = (
                    f"OpenBMCLAPI 面板v{_version_}-排名\n"
                    f"{rank_msg}"
                    f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}\n"
                    "数据源: https://bd.bangbang93.com/openbmclapi/metric/rank"
                )
                reply = msg.reply_with(report_msg)
                client.info(report_msg)
                client.send_message(reply)
                return
                



help = """/bmcl -> dashboard
/bmcl rank -> all rank
/bmcl rank <name> -> rank of <name>
"""


def on_message(msg: NewMessage, client: IcaClient) -> None:
    if not (msg.is_from_self or msg.is_reply):
        if msg.content.startswith("/bmcl"):
            if msg.content == "/bmcl":
                bmcl_dashboard(msg, client)
            elif msg.content == "/bmcl rank":
                bmcl_rank(msg, client, None)
            elif msg.content.startswith("/bmcl rank") and len(msg.content) > 11:
                name = msg.content[11:]
                bmcl_rank(msg, client, name)
            else:
                reply = msg.reply_with(help)
                client.send_message(reply)
