import io
import re
import time
import requests
import traceback

from typing import TYPE_CHECKING, TypeVar, Optional, Tuple

if TYPE_CHECKING:
    from ica_typing import IcaNewMessage, IcaClient, ConfigData
    CONFIG_DATA: ConfigData
else:
    CONFIG_DATA = None # type: ignore
    IcaNewMessage = TypeVar("NewMessage")
    IcaClient = TypeVar("IcaClient")

_version_ = "2.3.0-rs"
backend_version = "unknown"

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
        # 先倒序
        # 再插入
        # 最后再倒序
        count_str = count_str[::-1]
        count_str = "_".join([count_str[i:i+4] for i in range(0, count_len, 4)])
        count_str = count_str[::-1]
        return count_str


def wrap_request(url: str, msg: IcaNewMessage, client: IcaClient) -> Optional[dict]:
    try:
        cookie = CONFIG_DATA["cookie"] # type: ignore
        if cookie == "填写你的 cookie" or cookie is None:
            response = requests.get(url)
        else:
            response = requests.get(url, cookies={"openbmclapi-jwt": cookie})
    except requests.exceptions.RequestException:
        warn_msg = f"数据请求失败, 请检查网络\n{traceback.format_exc()}"
        reply = msg.reply_with(warn_msg)
        client.send_and_warn(reply)
        return None
    except Exception as _:
        warn_msg = f"数据请求中发生未知错误, 请呼叫 shenjack\n{traceback.format_exc()}"
        reply = msg.reply_with(warn_msg)
        client.send_and_warn(reply)
        return None
    if not response.status_code == 200 or response.reason != "OK":
        warn_msg = f"请求失败, 请检查网络\n{response.status_code} {response.reason}"
        reply = msg.reply_with(warn_msg)
        client.send_and_warn(reply)
        return None
    return response.json()


def bmcl_dashboard(msg: IcaNewMessage, client: IcaClient) -> None:
    req_time = time.time()
    # 记录请求时间
    data = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/dashboard", msg, client)
    dashboard_status = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/version", msg, client)
    if data is None or dashboard_status is None:
        return
    backend_version = dashboard_status["version"]
    backend_commit = dashboard_status["_resolved"].split("#")[1][:7]
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
        f"api版本 {backend_version} commit:{backend_commit}\n"
        f"实时信息: {online_node}  带宽: {online_bandwidth}Mbps\n"
        f"负载: {load_str:.2f}%  带宽: {data_bandwidth:.2f}Mbps\n"
        f"当日请求: {hits_count} 数据量: {data_len}\n"
        f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}\n"
         "数据源: https://bd.bangbang93.com/pages/dashboard"
    )
    client.info(report_msg)
    reply = msg.reply_with(report_msg)
    client.send_message(reply)


def check_is_full_data(data: list) -> bool:
    return 'user' in data[0]


def display_rank_min(ranks: list, req_time) -> str:
    cache = io.StringIO()
    cache.write(f"bmclapi v{_version_}-排名({len(ranks)})")
    if check_is_full_data(ranks):
        cache.write("完整\n")
        for rank in ranks:
            cache.write('✅' if rank['isEnabled'] else '❌')
            if 'fullSize' in rank:
                cache.write('🌕' if rank['fullSize'] else '🌘')
            cache.write(f"-{rank['index']+1:3}")
            cache.write(f"|{rank['name']}\n")
    else:
        cache.write("无cookie\n")
        for rank in ranks:
            cache.write('✅' if rank['isEnabled'] else '❌')
            cache.write(f"-{rank['index']+1:3}")
            cache.write(f"|{rank['name']}\n")
    cache.write(f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}")
    return cache.getvalue()


def display_rank_full(ranks: list, req_time) -> str:
    cache = io.StringIO()
    cache.write(f"bmclapi v{_version_}-排名({len(ranks)})")
    if check_is_full_data(ranks):
        cache.write("完整\n")
        for rank in ranks:
            # 基本信息
            cache.write('✅' if rank['isEnabled'] else '❌')
            if 'fullSize' in rank:
                cache.write('🌕' if rank['fullSize'] else '🌘')
            cache.write(f"|{rank['index']+1:3}|")
            cache.write(f"{rank['name']}")
            if 'version' in rank:
                cache.write(f"|{rank['version']}")
                if rank['version'] != backend_version:
                    cache.write("🟠")
                else:
                    cache.write("🟢")
            cache.write('\n')
            # 用户/赞助信息
            if ('user' in rank) and (rank['user'] is not None):
                cache.write(f"所有者:{rank['user']['name']}")
            if 'sponsor' in rank:
                cache.write(f"|赞助者:{rank['sponsor']['name']}")
            if 'sponsor' in rank or ('user' in rank and rank['user'] is not None):
                cache.write('\n')
            # 数据信息
            if 'metric' in rank:
                hits = format_hit_count(rank['metric']['hits'])
                data = format_data_size(rank['metric']['bytes'])
                cache.write(f"hit/data|{hits}|{data}")
                cache.write('\n')
    else:
        cache.write("无cookie\n")
        for rank in ranks:
            cache.write('✅' if rank['isEnabled'] else '❌')
            cache.write(f"-{rank['index']+1:3}")
            cache.write(f"|{rank['name']}|\n")
            if 'sponsor' in rank:
                cache.write(f"赞助者: {rank['sponsor']['name']}|")
            if 'metric' in rank:
                cache.write(f"hit/data|{format_hit_count(rank['metric']['hits'])}|{format_data_size(rank['metric']['bytes'])}\n")
    cache.write(f"请求时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(req_time))}")
    return cache.getvalue()


def bmcl_rank_general(msg, client):
    req_time = time.time()
    # 记录请求时间
    rank_data = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/rank", msg, client)
    if rank_data is None:
        return
    # 预处理数据
    for i, r in enumerate(rank_data):
        r['index'] = i
    # 显示前3名
    ranks = rank_data[:3]
    # ranks = rank_data
    report_msg = display_rank_full(ranks, req_time)
    client.info(report_msg)
    reply = msg.reply_with(display_rank_full(ranks, req_time))
    client.send_message(reply)


def bmcl_rank(msg: IcaNewMessage, client: IcaClient, name: str) -> None:
    req_time = time.time()
    # 记录请求时间
    rank_data = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/rank", msg, client)
    if rank_data is None:
        return
    # 预处理数据
    for i, r in enumerate(rank_data):
        r['index'] = i
    # 搜索是否有这个名字的节点
    names = [r["name"].lower() for r in rank_data]
    try:
        finds = [re.search(name.lower(), n) for n in names]
    except re.error as e:
        reply = msg.reply_with(f"正则表达式错误: {e}, 请检查输入")
        client.send_message(reply)
        return
    if not any(finds):
        reply = msg.reply_with(f"未找到名为{name}的节点")
        client.send_message(reply)
        return
    # 如果找到 > 3 个节点, 则提示 不显示
    counts = [f for f in finds if f]
    ranks = [rank_data[i] for i, f in enumerate(finds) if f]
    if len(counts) > 3:
        if len(counts) > 10:
            reply = msg.reply_with(f"搜索|{name}|到{len(counts)}个节点, 请用更精确的名字")
        else:
            # 4~10  个节点 只显示名称和次序
            report_msg = display_rank_min(ranks, req_time)
            reply = msg.reply_with(report_msg)
        client.send_message(reply)
        return
    # 如果找到 <= 3 个节点, 则显示全部信息
    report_msg = display_rank_full(ranks, req_time)
    client.info(report_msg)
    reply = msg.reply_with(report_msg)
    client.send_message(reply)


help = """/bmcl -> dashboard
/bmcl rank -> all rank
/bmcl rank <name> -> rank of <name>
/brrs <name> -> rank of <name>
搜索限制:
1- 3 显示全部信息
4-10 显示状态、名称
11+  不显示
"""


def on_ica_message(msg: IcaNewMessage, client: IcaClient) -> None:
    if not (msg.is_from_self or msg.is_reply):
        if '\n' in msg.content:
            return
        try:
            global backend_version
            if backend_version == "unknown":
                dashboard_status = wrap_request("https://bd.bangbang93.com/openbmclapi/metric/version", msg, client)
                if dashboard_status is None:
                    return
                backend_version = dashboard_status["version"]
            if msg.content.startswith("/bmcl"):
                if msg.content == "/bmcl":
                    bmcl_dashboard(msg, client)
                elif msg.content == "/bmcl rank":
                    bmcl_rank_general(msg, client)
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
        except:  # noqa
            report_msg = f"bmcl插件发生错误,请呼叫shenjack\n{traceback.format_exc()}"
            reply = msg.reply_with(report_msg)
            client.send_and_warn(reply)


def on_config() -> Tuple[str, str]:
    return (
        "bmcl.toml",
        """cookie = \"填写你的 cookie\""""
    )
