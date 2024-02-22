# icalingua bot

这是一个基于 icalingua docker 版的 bot

> 出于某个企鹅, 和保护 作者 和 原项目 ( ica ) 的原因 \
> 功能请自行理解

## 使用方法 ( Python 版 )

- 安装依赖

```powershell
python -m pip install -r requirement.txt
```

> 如果你想使用虚拟环境 \
> 可以使用 `python -m venv venv` 创建虚拟环境 \
> 然后使用 `venv\Scripts\activate` 激活虚拟环境 \
> 最后使用 `python -m pip install -r requirement.txt` 安装依赖

- 修改配置文件

```powershell
Copy-Item config-temp.toml config.toml
# 欸我就用 powershell 
```

- icalingua 启动!

```bash
# 用你自己的方法启动你的 icalingua 后端
# 例如
docker start icalingua
# 或者
docker up -d
```

- bot 启动!

```powershell
python connect.py
```

## 使用方法 ( Rust 版 )

- 准备一个 Python 环境

- 修改好配置文件

```powershell
Copy-Item config-temp.toml config.toml
```

- 编译

```powershell
cargo build --release
```

运行
