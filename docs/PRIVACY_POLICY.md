# Privacy Policy for Routine Reminder

**Last Updated: January 15, 2025**

## Introduction

Routine Reminder ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Chrome extension.

## TL;DR (Quick Summary)

- ✅ **We DO NOT collect any personal data**
- ✅ **We DO NOT track your usage**
- ✅ **We DO NOT send data to any servers**
- ✅ **All data stays on YOUR device**
- ✅ **We DO NOT use analytics or third-party services**

## Information We Collect

### Data Stored Locally

Routine Reminder stores the following information **locally on your device** using Chrome's storage API:

1. **Configuration Settings**
   - Work days selection
   - Reminder times and intervals
   - routine template content
   - Quick links
   - Language preference
   - Toast notification settings

2. **Usage Data (Local Only)**
   - Daily completion status (sent/not sent)
   - History of last 90 days
   - Streak counter
   - Statistics calculations

### Data We DO NOT Collect

- ❌ Personal information (name, email, etc.)
- ❌ Browsing history
- ❌ Website content you visit
- ❌ IP addresses
- ❌ Location data
- ❌ Analytics or telemetry
- ❌ Crash reports

## How We Use Your Data

Your data is used **entirely on your device** for the following purposes:

1. **Reminder Functionality** - To send you timely notifications
2. **Statistics Display** - To show your completion rate and streaks
3. **Configuration Persistence** - To remember your settings between sessions

**Important:** Your data never leaves your device. There are no servers, no cloud sync, no external APIs.

## Data Storage

- **Storage Location:** Chrome's `chrome.storage.local` and `chrome.storage.sync` APIs
- **Storage Duration:** Data persists until you uninstall the extension or clear Chrome's extension data
- **Storage Limit:** Subject to Chrome's storage quotas (typically 5MB for sync, unlimited for local)

## Permissions Explanation

Routine Reminder requests the following permissions:

| Permission      | Why We Need It                                                            |
| --------------- | ------------------------------------------------------------------------- |
| `storage`       | To save your configuration and history locally                            |
| `alarms`        | To schedule reminder notifications at specific times                      |
| `notifications` | To show browser notifications for reminders                               |
| `tabs`          | To show toast notifications on active tabs                                |
| `<all_urls>`    | To display toast notifications on any webpage (content is never accessed) |

**Note:** The `<all_urls>` permission is only used to inject toast notifications. We **DO NOT** read, modify, or collect any content from the websites you visit.

## Data Sharing

**We DO NOT share your data with anyone.** Period.

- No third-party services
- No analytics companies
- No advertising networks
- No data brokers
- No one else

## Your Data Rights

You have complete control over your data:

### Export Your Data

Use the "Export Config" button in settings to download all your configuration and history as a JSON file.

### Delete Your Data

- **Partial:** Clear specific settings in the extension options
- **Complete:** Uninstall the extension to remove all data

### Transfer Your Data

Use the export/import feature to transfer your settings to another device.

## Third-Party Services

Routine Reminder **does not use any third-party services**, including:

- No analytics (Google Analytics, etc.)
- No crash reporting (Sentry, etc.)
- No advertising networks
- No CDNs for assets
- No external APIs

All code runs locally in your browser.

## Children's Privacy

Routine Reminder does not knowingly collect any information from children under 13. The extension is designed for personal and team productivity and is not intended for use by children.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of any material changes by:

- Updating the "Last Updated" date
- Including a changelog note in extension updates

Continued use of the extension after changes constitutes acceptance of the updated policy.

## Open Source

Routine Reminder is open source! You can:

- Review the source code on GitHub: [repository URL]
- Verify that we follow this privacy policy
- Contribute improvements
- Fork and modify for your own use

## Contact Us

If you have questions about this Privacy Policy or our privacy practices:

- **GitHub Issues:** [repository URL]/issues
- **Email:** [support@worktodo.app](mailto:support@worktodo.app)

## Compliance

### GDPR Compliance (EU)

Routine Reminder is GDPR-compliant because:

- We don't collect personal data
- We don't process personal data
- All data stays on your device
- You have full control (export/delete)

### CCPA Compliance (California)

Routine Reminder complies with CCPA because:

- We don't sell personal information
- We don't collect personal information
- We don't share data with third parties

### Other Regulations

Since we don't collect any data, we comply with virtually all privacy regulations worldwide.

## Technical Security

- All data is stored using Chrome's secure storage APIs
- No data transmission over networks
- No external requests or API calls
- Code follows security best practices
- Regular security audits (as an open-source project)

## Transparency

We believe in complete transparency:

1. **Open Source:** All code is publicly available
2. **No Obfuscation:** Code is readable and auditable
3. **Clear Permissions:** We only request necessary permissions
4. **This Policy:** Written in plain language

## Summary

Routine Reminder is a privacy-first extension. Your data stays on your device, period. We can't access your data because we never receive it in the first place.

---

**Questions?** Feel free to reach out or review our open-source code to verify these claims.

---

# 隐私政策（中文版）

**最后更新：2025年1月15日**

## 简介

Routine Reminder（"我们"或"本扩展程序"）致力于保护您的隐私。本隐私政策说明了您使用我们的 Chrome 扩展程序时我们如何处理信息。

## 简要总结

- ✅ **我们不收集任何个人数据**
- ✅ **我们不跟踪您的使用情况**
- ✅ **我们不向任何服务器发送数据**
- ✅ **所有数据都保存在您的设备上**
- ✅ **我们不使用分析或第三方服务**

## 我们收集的信息

### 本地存储的数据

Routine Reminder 使用 Chrome 的存储 API **在您的设备上本地存储**以下信息：

1. **配置设置**
   - 工作日选择
   - 提醒时间和间隔
   - 提醒模板内容
   - 每条提醒规则的模板和文案
   - 语言偏好
   - Toast 通知设置

2. **使用数据（仅本地）**
   - 每日完成状态（已完成/未发送）
   - 最近90天的历史记录
   - 连续计数器
   - 统计计算

### 我们不收集的数据

- ❌ 个人信息（姓名、电子邮件等）
- ❌ 浏览历史
- ❌ 您访问的网站内容
- ❌ IP 地址
- ❌ 位置数据
- ❌ 分析或遥测
- ❌ 崩溃报告

## 数据使用方式

您的数据**完全在您的设备上**用于以下目的：

1. **提醒功能** - 及时向您发送通知
2. **统计显示** - 显示您的完成率和连续记录
3. **配置持久化** - 在会话之间记住您的设置

**重要提示：** 您的数据永远不会离开您的设备。没有服务器、没有云同步、没有外部 API。

## 权限说明

Routine Reminder 请求以下权限：

| 权限            | 为什么需要                                  |
| --------------- | ------------------------------------------- |
| `storage`       | 在本地保存您的配置和历史记录                |
| `alarms`        | 在特定时间安排提醒通知                      |
| `notifications` | 显示浏览器提醒通知                          |
| `tabs`          | 在活动标签页上显示 Toast 通知               |
| `<all_urls>`    | 在任何网页上显示 Toast 通知（从不访问内容） |

**注意：** `<all_urls>` 权限仅用于注入 Toast 通知。我们**不会**读取、修改或收集您访问的网站中的任何内容。

## 数据共享

**我们不与任何人共享您的数据。** 就这么简单。

## 您的数据权利

您完全控制您的数据：

### 导出数据

使用设置中的"导出配置"按钮将所有配置和历史记录下载为 JSON 文件。

### 删除数据

- **部分删除：** 在扩展程序选项中清除特定设置
- **完全删除：** 卸载扩展程序以删除所有数据

## 开源

Routine Reminder 是开源的！您可以：

- 在 GitHub 上查看源代码
- 验证我们遵守此隐私政策
- 贡献改进
- Fork 并修改供自己使用

## 联系我们

如果您对本隐私政策或我们的隐私实践有疑问：

- **GitHub Issues：** [repository URL]/issues
- **电子邮件：** [support@worktodo.app](mailto:support@worktodo.app)

---

**有问题吗？** 请随时联系我们或查看我们的开源代码以验证这些声明。
