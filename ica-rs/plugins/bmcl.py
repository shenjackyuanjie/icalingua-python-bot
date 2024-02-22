import re
import time
import requests

from typing import TYPE_CHECKING, TypeVar, Optional

if TYPE_CHECKING:
    from ica_typing import NewMessage, IcaClient
else:
    NewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

_version_ = "2.1.2-rs"

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
    if "metric" in data:
        rank_data["hits"] = data["metric"]["hits"]
        rank_data["bytes"] = data["metric"]["bytes"]
    return {
        "name": data["name"],
        "start": data["isEnabled"],
        # "full": "全量" if "fullSize" in data else "分片",
        # "version": data["version"] if "version" in data else "未知版本",
        "owner": data["sponsor"]["name"] if "sponsor" in data else "未知",
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
        # 显示前3名
        limit = 3
        if len(ranks) < limit:
            show_ranks = ranks
        else:
            show_ranks = ranks[:limit]
        rank_msg = (
            f"{'✅' if r['start'] else '❌'}名称: {r['name']}\n"
            # f"-{rank['full']} \n"
            # f"版本: {r['version']}\n"
            f"赞助者: {r['owner']}|"
            f"h/d {format_hit_count(r['rank']['hits'])}|{format_data_size(r['rank']['bytes'])}"
            for r in show_ranks
        )
        rank_msg = "\n".join(rank_msg)
        report_msg = (
            f"OpenBMCLAPI 面板v{_version_}-排名\n{rank_msg}\n"
            f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}\n"
        )
        reply = msg.reply_with(report_msg)
        client.info(report_msg)
        client.send_message(reply)
        return
    else:
        # 搜索是否有这个名字的节点
        names = [r["name"].lower() for r in ranks]
        finds = [re.search(name.lower(), n) for n in names]
        if not any(finds):
            reply = msg.reply_with(f"未找到名为{name}的节点")
            client.send_message(reply)
            return
        # 如果找到 > 3 个节点, 则提示 不显示
        counts = [True for find in finds if find]
        if len(counts) > 3:
            if len(counts) > 10:
                reply = msg.reply_with(f"搜索|{name}|到{len(counts)}个节点, 请用更精确的名字")
            else:
                # 4~10  个节点 只显示名称和次序
                find_msg = [f"{'✅' if r['start'] else '❌'}{r['name']}-No.{i+1}" for i, r in enumerate(ranks) if finds[i]]
                find_msg = "\n".join(find_msg)
                report_msg = f"OpenBMCLAPI 面板v{_version_}-搜索|{name}|\n{find_msg}"
                reply = msg.reply_with(report_msg)
            client.send_message(reply)
            return
        rank_msgs = []
        for i, find in enumerate(finds):
            if find:
                rank = ranks[i]
                rank_msg = (
                    f"{'✅' if rank['start'] else '❌'}名称: {rank['name']}-No.{i+1}\n"
                    # f"-{rank['full']} \n"
                    # f"版本: {rank['version']}\n"
                    f"赞助商: {rank['owner']}|"
                    f"h/d {format_hit_count(rank['rank']['hits'])}|{format_data_size(rank['rank']['bytes'])}"
                )
                rank_msgs.append(rank_msg)
        rank_msgs = "\n".join(rank_msgs)
        report_msg = f"OpenBMCLAPI 面板v{_version_}-排名\n{rank_msgs}"
        reply = msg.reply_with(report_msg)
        client.info(report_msg)
        client.send_message(reply)
        return
                



help = """/bmcl -> dashboard
/bmcl rank -> all rank
/bmcl rank <name> -> rank of <name>
/brrs <name> -> rank of <name>
搜索限制:
1- 3 显示全部信息
4-10 显示状态、名称
11+  不显示
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
        elif msg.content.startswith("/brrs"):
            if msg.content == "/brrs":
                reply = msg.reply_with(help)
                client.send_message(reply)
            else:
                name = msg.content.split(" ")
                if len(name) > 1:
                    name = name[1]
                    bmcl_rank(msg, client, name)
