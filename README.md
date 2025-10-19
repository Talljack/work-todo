# Routine Reminder

> 🔔 Build daily habits with flexible, privacy-first reminders. Routine Reminder keeps your recurring tasks on track with configurable schedules, reusable templates, and streak insights.

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)

[English](#english) | [中文](#中文)

---

## English

### Features

#### 🕐 Flexible Schedules

- Choose the days a routine is active (weekdays, weekends, or custom)
- Configure start time, deadline, and reminder interval to fit any rhythm
- Add catch-up reminders after the deadline so nothing slips through
- Works equally well for work stand-ups, personal habits, wellness check-ins, and more

#### 📋 Smart Templates

- Built-in templates in English and Chinese to get started fast
- Fully customizable Markdown editor for your own routine scripts
- Per-rule overrides so each reminder can surface unique guidance
- One-click copy from the popup for quick sharing or journaling

#### 🔔 Multi-channel Alerts

- **Browser Notifications** for system tray alerts
- **Toast Notifications** overlay active tabs with actionable banners
- **Badge Alerts** highlight pending routines on the extension icon
- (Sound notifications coming soon in a future release)

#### 📊 Progress Insights

- **Completion Rate** to highlight consistency
- **Streak Counter** to celebrate momentum 🔥
- **Weekly/Monthly Stats** to track broader trends
- **Calendar View** with a GitHub-style heatmap for the last 90 days

#### ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd+Shift+T`: Open the extension popup
- `Ctrl/Cmd+Shift+D`: Mark today as done
- `Ctrl/Cmd+Shift+O`: Open the settings page

#### 🌐 Multi-language Support

- Full support for English and Chinese
- Automatic template switching based on language preference
- More languages coming soon

#### 🔒 Privacy First

- All data stored locally on your device
- No tracking, no analytics, no cloud sync
- Export/import your configuration anytime
- Open source for transparency

### Screenshots

Latest promotional assets and mock screenshots are available under `assets/store/`:

- `promo-small-440x280.png`
- `promo-large-1280x800.png`
- `promo-marquee-1400x560.png`
- `screenshot-*.png` (popup, settings, statistics, onboarding, notifications)

### Installation

#### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store page](#) <!-- Add link after publishing -->
2. Click "Add to Chrome"
3. Pin the extension icon for quick access

#### From Source (For Developers)

```bash
# Clone the repository
git clone https://github.com/yugangcao/work-todo-reminder.git
cd work-todo-reminder

# Install dependencies
pnpm install

# Build the extension
pnpm run build

# Load the extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist` folder
```

### Usage

#### First-Time Setup

1. Open the options page from the popup or `chrome://extensions`
2. Choose which days and times your routines should trigger
3. Review each reminder rule and tailor the notification copy
4. Customize the global routine template (or create per-rule overrides)

#### Daily Workflow

1. Go about your day—Routine Reminder handles the timing
2. When a reminder appears, open the popup from the toolbar
3. Copy or reference the routine template as needed (share, journal, etc.)
4. Complete the task and click "Mark as Done"
5. Watch your streak grow in the statistics tab 🔥

#### Advanced Features

**Per-Rule Templates & Messages**
Each routine can ship with its own template, notification title/message, toast copy, and optional URL.

**Late Reminder Ladder**
Chain multiple backup reminders (e.g., 12:00, 14:00) to nudge yourself until the routine is done.

**Deep Statistics**

- Review the last 90 days of activity
- Compare current streak vs. personal best
- Spot weekly or monthly trends to refine your schedules

### Development

#### Tech Stack

- **Framework**: React 18.3 + TypeScript 5.7
- **Build Tool**: Vite 5.4
- **UI Components**: Radix UI + Tailwind CSS
- **i18n**: react-i18next
- **Testing**: Vitest
- **Linting**: ESLint + Prettier

#### Project Structure

```
work-todo-reminder/
├── src/
│   ├── background/        # Service worker
│   ├── content-script/    # Toast notifications
│   ├── popup/            # Extension popup UI
│   ├── options/          # Settings page
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── Statistics.tsx
│   │   └── Onboarding.tsx
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── i18n/             # Internationalization
├── _locales/             # Chrome extension locales
├── docs/                 # Documentation
├── public/               # Static assets
└── dist/                 # Build output (gitignored)
```

#### Available Scripts

```bash
# Development mode with hot reload
pnpm run dev

# Production build
pnpm run build

# Type checking
pnpm run typecheck

# Linting
pnpm run lint        # Auto-fix
pnpm run lint:check  # Check only (for CI)

# Formatting
pnpm run format        # Auto-format
pnpm run format:check  # Check only (for CI)

# Run all CI checks
pnpm run ci

# Testing
pnpm run test
pnpm run test:watch
pnpm run test:coverage
```

#### Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm run ci`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

### Roadmap

See [TODO.md](TODO.md) for planned features and improvements.

**v1.1 (Next Release)**

- [ ] Sound notification options
- [ ] Dark mode support
- [ ] Context menu integration
- [ ] Cloud backup (optional)

**v1.2 (Future)**

- [ ] Multiple template profiles
- [ ] Calendar API integration
- [ ] Pomodoro timer
- [ ] Team collaboration features

### FAQ

**Q: Does this extension work offline?**
A: Yes! Everything runs on your device; you only need the internet when you copy the template into your team's chat or tool.

**Q: Can I use this for non-work purposes?**
A: Absolutely! Customize it for daily journaling, habit tracking, or any regular reminder needs.

**Q: How do I change the language?**
A: Go to Settings > Other > Language and select your preferred language. Templates will update automatically.

**Q: Where is my data stored?**
A: All data is stored locally using Chrome's storage API. Nothing is sent to external servers.

**Q: Can I sync across devices?**
A: Currently, you need to export/import manually. Cloud sync is planned for a future release.

### Privacy

We take your privacy seriously. See our [Privacy Policy](docs/PRIVACY_POLICY.md) for full details.

**Quick Summary:**

- ✅ No data collection
- ✅ No tracking
- ✅ No external servers
- ✅ All data stays on your device
- ✅ Open source for transparency

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Support

- **Bug Reports**: [GitHub Issues](https://github.com/yugangcao/work-todo-reminder/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yugangcao/work-todo-reminder/discussions)
- **Email**: [support@worktodo.app](mailto:support@worktodo.app)

### Acknowledgments

- UI Components: [Radix UI](https://www.radix-ui.com/)
- Icons: [Radix Icons](https://icons.radix-ui.com/)
- Inspiration: Daily standup meetings and forgetful developers 😅

---

## 中文

### 功能特性

#### 🕐 灵活的提醒计划

- 自由选择例行任务的执行日期（工作日、周末或自定义组合）
- 设置开始时间、截止时间与提醒间隔，适应任何节奏
- 截止后可追加补提醒，确保不错过关键事项
- 无论是工作站会还是日常习惯都能轻松覆盖

#### 📋 智能模板

- 内置中英文示例模板，开箱即可使用
- 支持 Markdown，自由编写适合自己的提示脚本
- 每条提醒规则可拥有独立模板、通知文案与跳转链接
- 弹窗中一键复制，方便分享到聊天工具或日志

#### 🔔 多种提醒方式

- **浏览器通知**：桌面系统托盘直接弹出提醒
- **Toast 通知**：在当前标签页显示醒目的提示卡片
- **徽章提醒**：扩展图标显示待完成状态
- 声音提醒功能正在规划中

#### 📊 进度洞察

- **完成率**：随时掌握执行情况
- **连续记录**：坚持天数一目了然 🔥
- **周/月统计**：观察长期趋势
- **90 天日历**：GitHub 风格热力图回顾历史表现

#### ⌨️ 键盘快捷键

- `Ctrl/Cmd+Shift+T`：打开扩展弹窗
- `Ctrl/Cmd+Shift+D`：将今天标记为已完成
- `Ctrl/Cmd+Shift+O`：打开设置页面

#### 🌐 多语言支持

- 完全支持中英文
- 根据语言偏好自动切换模板
- 即将支持更多语言

#### 🔒 隐私优先

- 所有数据本地存储在您的设备上
- 无追踪、无分析、无云同步
- 随时导出/导入您的配置
- 开源以保证透明度

### 安装

#### 从 Chrome 网上应用店安装（推荐）

1. 访问 [Chrome 网上应用店页面](#) <!-- 发布后添加链接 -->
2. 点击"添加至 Chrome"
3. 按照引导指南操作

#### 从源代码安装（开发者）

```bash
# 克隆仓库
git clone https://github.com/yugangcao/work-todo-reminder.git
cd work-todo-reminder

# 安装依赖
pnpm install

# 构建扩展
pnpm run build

# 在 Chrome 中加载扩展
# 1. 打开 chrome://extensions/
# 2. 启用"开发者模式"
# 3. 点击"加载已解压的扩展程序"
# 4. 选择 `dist` 文件夹
```

### 使用方法

#### 首次设置

1. 通过弹窗或 `chrome://extensions` 打开设置页面
2. 选择提醒日期、开始时间、截止时间与频率
3. 为各条规则编写通知文案与模板内容
4. 保存后等待提醒自动触发

#### 日常流程

1. 按日常节奏工作或生活
2. 收到提醒时点击扩展图标打开弹窗
3. 根据模板执行任务或填写日报/记录
4. 完成后点击“标记已完成”
5. 在统计页查看连续记录与历史表现 🔥

### 开发

详细的开发指南请参见英文版本。

### 常见问题

**问：此扩展程序可以离线工作吗？**
答：可以！所有功能都在本地运行，无需联网。

**问：我可以将其用于非工作目的吗？**
答：当然！自定义它用于每日日记、习惯追踪或任何定期提醒需求。

**问：如何更改语言？**
答：转到 设置 > 其他 > 语言 并选择您的首选语言。模板将自动更新。

**问：我的数据存储在哪里？**
答：所有数据都使用 Chrome 的存储 API 本地存储。不会发送到外部服务器。

### 隐私

我们非常重视您的隐私。完整详情请参见我们的[隐私政策](docs/PRIVACY_POLICY.md)。

**快速摘要：**

- ✅ 不收集数据
- ✅ 不追踪
- ✅ 无外部服务器
- ✅ 所有数据保留在您的设备上
- ✅ 开源保证透明度

### 许可证

本项目采用 MIT 许可证 - 详情请参见 [LICENSE](LICENSE) 文件。

### 支持

- **错误报告**：[GitHub Issues](https://github.com/yugangcao/work-todo-reminder/issues)
- **功能请求**：[GitHub Discussions](https://github.com/yugangcao/work-todo-reminder/discussions)
- **电子邮件**：[support@worktodo.app](mailto:support@worktodo.app)

---

Made with ❤️ by developers, for developers who forget things

**Star ⭐ this repo if you find it helpful!**
