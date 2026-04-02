# 🌐 九头鸟龙 · 主站导航

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)](https://pengjunlong.github.io)
[![Jekyll](https://img.shields.io/badge/Jekyll-minimal--mistakes-blue)](https://github.com/mmistakes/minimal-mistakes)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

> 基于 GitHub Pages + Jekyll 构建的个人主站，使用 Minimal Mistakes 主题，自动发现并聚合所有子仓库站点。

---

## ✨ 核心特性

- 🌀 **自动发现** — 通过 GitHub API 动态加载所有启用 Pages 的子仓库
- 🧩 **模块化接入** — 子仓库只需放一个 `subsite-config.json` 即可被收录
- 🎨 **统一主题** — 使用 Minimal Mistakes `air` 皮肤，无额外自定义 CSS
- ⚡ **智能缓存** — 本地 localStorage 缓存 1 小时，减少 API 调用
- 🔄 **自动重试** — fetch 失败自动退避重试，网络异常更健壮
- 📱 **响应式适配** — 适配桌面端与移动设备

---

## 🗂️ 项目结构

```
pengjunlong.github.io/
├── _config.yml                    # Jekyll 站点配置（主题、作者、插件等）
├── _data/
│   └── navigation.yml             # 顶部导航菜单
├── _includes/
│   ├── head/
│   │   └── custom.html            # <head> 补充（Open Graph 标签）
│   ├── analytics.html             # Google Analytics
│   └── subsites-nav.html          # 子站导航卡片模板（含内联样式）
├── assets/
│   └── js/
│       └── subsites-loader.js     # 子站点动态加载逻辑
└── index.md                       # 首页
```

---

## 🚀 子站接入指南

### 第一步：在子仓库根目录创建 `subsite-config.json`

```json
{
  "displayName": "站点名称",
  "description": "一句话介绍这个站点",
  "icon": "🚀",
  "tags": ["分类1", "分类2"],
  "color": "#FF6B6B",
  "order": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `displayName` | string | ✅ | 卡片显示名称 |
| `description` | string | ✅ | 站点简介（最多2行展示） |
| `icon` | string | ❌ | emoji（如 `🚀`）或 Font Awesome 类名（如 `fas fa-rocket`） |
| `tags` | string[] | ❌ | 分类标签，展示在卡片上 |
| `color` | string | ❌ | 卡片主题色（hex），不填则自动按名称分配色板色 |
| `order` | number | ❌ | 排序权重，数字越小越靠前，默认 999 |

### 第二步：确保该仓库已启用 GitHub Pages

进入仓库 → Settings → Pages → 选择分支并保存。

主站会在下次刷新时（或缓存过期后）自动发现并展示该子站。

---

## 🛠️ 主站本地开发

```bash
# 安装依赖
bundle install

# 本地预览（热重载）
bundle exec jekyll serve --livereload

# 访问
open http://localhost:4000
```

---

## ⚙️ 配置说明

### 修改站点信息（`_config.yml`）

```yaml
title: "九头鸟龙"
description: "落霞与孤鹜齐飞，秋水共长天一色"
url: "https://pengjunlong.github.io"

author:
  name: "Junlong Peng"
  avatar: "https://avatars.githubusercontent.com/u/1436509?v=4"
  bio: "数风流人物千里共婵娟"
```

### 更换主题皮肤

修改 `_config.yml` 中的 `minimal_mistakes_skin`，可选值：

| 皮肤 | 风格 |
|------|------|
| `air` | 清新蓝白（当前） |
| `sunrise` | 暖橙 |
| `aqua` | 青色 |
| `default` | 经典 |
| `dark` | 暗色 |

### 修改导航菜单（`_data/navigation.yml`）

```yaml
main:
  - title: "🏠 首页"
    url: /
  - title: "📚 博客"
    url: /blog/
  - title: "🚀 子站点"
    url: /#subsites
  - title: "👤 关于"
    url: /about/
```

---

## 📄 License

MIT © [pengjunlong](https://github.com/pengjunlong)
