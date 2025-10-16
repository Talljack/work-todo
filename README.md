# Work TODO Reminder

A Chrome extension that helps you remember to send your daily work TODO on time. Smart reminders ensure you never miss the deadline again!

## 功能特性 / Features

- ⏰ **智能提醒** - 工作日自动定时提醒，多轮推送直到完成
- 📋 **快捷模板** - 一键复制 TODO 模板，快速填写今日计划
- 🔗 **快捷链接** - 直达常用发送渠道（IM、邮件、文档等）
- ✅ **状态管理** - 标记已发送后，当天不再提醒，次日自动重置
- 🔄 **跨设备同步** - 配置自动同步到所有 Chrome 设备
- 🌍 **多语言支持** - 支持中英文界面

## 技术栈 / Tech Stack

- **React 18.3** - UI 框架
- **TypeScript 5.7** - 类型安全
- **Vite 5.4** - 快速构建
- **Tailwind CSS 3.4** - 现代样式
- **Chrome Extension MV3** - 最新扩展标准
- **webextension-polyfill** - 跨浏览器兼容

## 安装与开发 / Installation & Development

### 前置要求

- Node.js >= 18
- pnpm >= 9

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 加载扩展到 Chrome

1. 打开 Chrome 浏览器，进入扩展管理页面（`chrome://extensions/`）
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录

### 调试页面

- Popup 页面：`http://localhost:5173/popup.html`
- Options 页面：`http://localhost:5173/options.html`

## 构建与发布 / Build & Release

```bash
pnpm build
```

构建完成后，`dist` 目录包含可发布到 Chrome Web Store 的扩展包。

## 使用指南 / Usage Guide

### 首次使用

1. 安装扩展后，点击扩展图标打开 Popup
2. 点击右上角齿轮图标进入设置页面
3. 配置您的工作日、提醒时间、TODO 模板和快捷链接
4. 保存设置

### 配置说明

**工作日设置**

- 选择您的工作日（默认周一至周五）
- 设置开始提醒时间（如 09:00）
- 设置截止时间（如 10:00）
- 设置提醒间隔（如 15 分钟）
- 可添加迟到补提醒时间（如 10:30、11:00）

**TODO 模板**

- 编辑您的每日 TODO 模板
- 模板会在 Popup 中显示，支持一键复制

**快捷链接**

- 添加常用的发送渠道链接
- 如：公司 IM 群聊、日报文档、邮件等

### 日常使用

1. 在设定的时间，扩展会发送系统通知并在图标上显示红点
2. 点击扩展图标打开 Popup
3. 复制 TODO 模板，填写今日计划
4. 通过快捷链接跳转到发送渠道
5. 发送完成后，点击"标记已发送"按钮
6. 标记后，当天不会再收到提醒

## 核心实现 / Core Implementation

### 闹钟系统

使用 Chrome Alarms API 实现可靠的定时提醒：

- Service Worker 休眠时仍能触发
- 浏览器重启后自动恢复
- 支持多个提醒时间点

### 状态管理

- 配置数据存储在 `chrome.storage.sync`（跨设备同步）
- 每日状态存储在 `chrome.storage.local`（避免冲突）
- 每天 0:00 自动重置状态

### 提醒策略

1. 在开始时间到截止时间之间，按间隔提醒
2. 超过截止时间后，使用迟到补提醒
3. 标记已发送后，停止所有提醒
4. 次日自动重置，继续提醒

## 项目结构 / Project Structure

```
work-todo/
├── src/
│   ├── background/       # Service Worker
│   ├── popup/           # Popup 界面
│   ├── options/         # 设置页面
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   │   ├── storage.ts   # 存储管理
│   │   └── time.ts      # 时间工具
│   ├── i18n/            # 国际化
│   └── styles/          # 样式文件
├── pages/               # HTML 页面
├── _locales/            # 扩展描述翻译
└── manifest.json        # 扩展配置
```

## 测试 / Testing

```bash
pnpm test
```

## 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！

## 许可证 / License

MIT License

## 致谢 / Credits

- UI 设计参考 [21st.dev](https://21st.dev/community/components)
- 基于 Chrome Extension Vite Starter 模板
