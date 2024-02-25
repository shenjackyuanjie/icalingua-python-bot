# 更新日志

## 0.4.11

这几天就是在刷版本号的感觉

- 添加
  - `DeleteMessage` 用于删除消息
  - `NewMessage.as_delete` 用于将消息转换为删除消息
  - `client::delete_message` 用于删除消息
  - `client::fetch_history` 用于获取历史消息 TODO
  - `py::class::DeleteMessagePy` 用于删除消息 的 Python 侧 API
  - `py::class::IcaClientPy.delete_message` 用于删除消息 的 Python 侧 API
  - `IcalinguaStatus.current_loaded_messages_count`
    - 用于以后加载信息计数
- 修改
  - `py::class::IcaStatusPy` 
    - 大部分方法从手动 `unsafe` + `Option`
    - 改成直接调用 `IcalinguaStatus` 的方法
  - `IcalinguaStatus`
    - 所有方法均改成 直接对着 `IcalinguaStatus` 的方法调用
    - 补全没有的方法

## 0.4.10

好家伙, 我感觉都快能叫 0.5 了
修改了一些内部数据结构, 使得插件更加稳定

添加了 `rustfmt.toml` 用于格式化代码
**注意**: 请在提交代码前使用 `cargo +nightly fmt` 格式化代码

修复了 `Message` 解析 `replyMessage` 字段是 如果是 null 则会解析失败的问题

## 0.4.9

修复了 Python 插件运行错误会导致整个程序崩溃的问题

## 0.4.8

添加了 `filter_list` 用于过滤特定人的消息

## 0.4.7

修复了重载时如果代码有问题会直接 panic 的问题

## 0.4.6

现在更适合部署了

## 0.4.5

添加 `is_reply` api 到 `NewMessagePy`

## 0.4.4

现在正式支持 Python 插件了
`/bmcl` 也迁移到了 Python 插件版本

## 0.4.3

噫! 好! 我成了!

## 0.4.2

现在是 async 版本啦!

## 0.4.1

现在能发送登录信息啦

## 0.4.0

使用 Rust 从头实现一遍
\能登录啦/

## 0.3.3

适配 Rust 端的配置文件修改

## 0.3.1/2

改进 `/bmcl` 的细节

## 0.3.0

合并了 dongdigua 的代码, 把消息处理部分分离
现在代码更阳间了（喜

## 0.2.3

添加了 `/bmcl` 请求 bmclapi 状态

## 0.2.2

重构了一波整体代码
