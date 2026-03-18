# 🌐 自动化导航

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)](https://deepseekai.github.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 基于GitHub Pages构建的自动化导航门户，动态聚合所有子站点

## 🚀 快速导航
<!-- 自动生成导航链接 -->
<div align="center">

| 🔍 子站点名称 | 📚 最新更新 | 🏷️ 标签分类 |
|--------------|------------|-------------|
| [新闻聚合](/news-digest) | 2024-03-15 | 资讯 |
| [技术文档](/tech-docs) | 2024-03-14 | 开发 |
| [项目展示](/projects) | 2024-03-13 | 作品 |

</div>

## ✨ 核心特性
- 🌀 **自动发现** - 动态加载所有启用GitHub Pages的子仓库
- 🧩 **模块化配置** - 通过`subsite-config.json`标准化子站信息
- 🎨 **响应式设计** - 完美适配移动端与桌面端
- ⚡ **即时更新** - 新增子站自动同步到导航

## 🛠️ 使用指南

### 添加新子站
1. 创建新仓库并启用GitHub Pages
2. 在仓库根目录添加配置文件：
```json
// subsite-config.json
{
  "displayName": "站点名称",
  "url": "/repository-name",
  "icon": "🚀",
  "description": "站点简介",
  "tags": ["分类1", "分类2"]
}
