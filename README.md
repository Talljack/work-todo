# Work TODO Reminder

> 📝 Never forget to send your daily work plan again! A smart Chrome extension that helps you stay accountable with customizable reminders, statistics tracking, and streak building.

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)

[English](#english) | [中文](#中文)

---

## English

### Features

#### 🕐 Customizable Work Schedule

- Set your work days (Mon-Fri by default)
- Configure reminder start time, deadline, and intervals (default: 15 minutes)
- Add multiple late reminders if you miss the deadline
- Intelligent reminder system that adapts to your workflow

#### 📋 TODO Templates

- Pre-built templates in English and Chinese
- Fully customizable to match your team's format
- Quick copy-paste functionality
- Support for quick links to frequently used tools (Slack, Jira, etc.)

#### 🔔 Multiple Reminder Methods

- **Browser Notifications**: Standard Chrome notifications
- **Toast Notifications**: Beautiful on-page notifications (unique!)
- **Badge Alerts**: Visual indicator on extension icon
- **Sound Notifications**: Coming soon

#### 📊 Statistics & Gamification

- **Completion Rate**: Track your daily sending rate
- **Streak Counter**: Build and maintain daily streaks 🔥
- **Weekly/Monthly Stats**: View your performance over time
- **Calendar View**: Beautiful GitHub-style contribution calendar
- **Achievements**: Unlock badges for consistent performance

#### ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd+Shift+T`: Open extension popup
- `Ctrl/Cmd+Shift+D`: Mark today as sent
- `Ctrl/Cmd+Shift+O`: Open settings page

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

_Coming soon - Check the `assets/` folder_

### Installation

#### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store page](#) <!-- Add link after publishing -->
2. Click "Add to Chrome"
3. Follow the onboarding guide

#### From Source (For Developers)

```bash
# Clone the repository
git clone https://github.com/yourusername/work-todo-reminder.git
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

1. Complete the interactive onboarding guide
2. Set your work days and reminder times
3. Customize your TODO template
4. (Optional) Add quick links to your tools

#### Daily Workflow

1. Work on your tasks throughout the day
2. Receive reminders at your configured intervals
3. When ready, click the extension icon
4. Copy the template and send to your team
5. Click "Mark as Sent" to track completion
6. Build your streak! 🔥

#### Advanced Features

**Quick Links**
Add shortcuts to frequently used tools:

```
Name: Team Slack
URL: https://your-team.slack.com/...

Name: Jira Board
URL: https://your-company.atlassian.net/...
```

**Multiple Late Reminders**
Set up failsafe reminders:

- 10:30 AM (if missed 10:00 deadline)
- 11:00 AM (final reminder)
- 12:00 PM (last chance before lunch)

**Statistics Tracking**

- View your completion history for the last 90 days
- Check your current streak and personal best
- Analyze weekly/monthly performance trends
- Get motivated by achievement unlocks

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
A: Yes! All functionality works offline except for quick links to external tools.

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

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/work-todo-reminder/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/work-todo-reminder/discussions)
- **Email**: [your-email@example.com]
- **Twitter**: [@yourhandle]

### Acknowledgments

- UI Components: [Radix UI](https://www.radix-ui.com/)
- Icons: [Radix Icons](https://icons.radix-ui.com/)
- Inspiration: Daily standup meetings and forgetful developers 😅

---

## 中文

### 功能特性

#### 🕐 可定制的工作时间表

- 设置您的工作日（默认周一至周五）
- 配置提醒开始时间、截止时间和间隔（默认：15分钟）
- 如果错过截止时间，添加多个迟到提醒
- 智能提醒系统，适应您的工作流程

#### 📋 TODO 模板

- 内置中英文模板
- 完全可定制以匹配您团队的格式
- 快速复制粘贴功能
- 支持常用工具（Slack、Jira等）的快捷链接

#### 🔔 多种提醒方式

- **浏览器通知**：标准 Chrome 通知
- **Toast 通知**：精美的页面内通知（独特功能！）
- **徽章提醒**：扩展图标上的视觉指示器
- **声音通知**：即将推出

#### 📊 统计与游戏化

- **完成率**：追踪您的每日发送率
- **连续记录**：建立并维持每日连续记录 🔥
- **每周/每月统计**：查看您随时间的表现
- **日历视图**：精美的 GitHub 风格贡献日历
- **成就系统**：解锁徽章以保持一致性

#### ⌨️ 键盘快捷键

- `Ctrl/Cmd+Shift+T`：打开扩展弹出窗口
- `Ctrl/Cmd+Shift+D`：将今天标记为已发送
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
git clone https://github.com/yourusername/work-todo-reminder.git
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

1. 完成交互式引导指南
2. 设置您的工作日和提醒时间
3. 自定义您的 TODO 模板
4. （可选）添加工具的快捷链接

#### 每日工作流程

1. 全天处理您的任务
2. 在配置的间隔时间收到提醒
3. 准备好后，点击扩展图标
4. 复制模板并发送给您的团队
5. 点击"标记为已发送"以追踪完成情况
6. 建立您的连续记录！🔥

### 开发

详细的开发指南请参见英文版本。

### 常见问题

**问：此扩展程序可以离线工作吗？**
答：可以！除了快捷链接到外部工具外，所有功能都可以离线工作。

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

- **错误报告**：[GitHub Issues](https://github.com/yourusername/work-todo-reminder/issues)
- **功能请求**：[GitHub Discussions](https://github.com/yourusername/work-todo-reminder/discussions)
- **电子邮件**：[your-email@example.com]

---

Made with ❤️ by developers, for developers who forget things

**Star ⭐ this repo if you find it helpful!**
