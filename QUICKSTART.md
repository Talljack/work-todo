# 快速开始指南 / Quick Start Guide

## 5 分钟快速配置

### 1. 安装依赖并构建

```bash
# 安装依赖
pnpm install

# 开发模式构建（会自动监听文件变化）
pnpm dev

# 或者直接构建生产版本
pnpm build
```

### 2. 加载扩展到 Chrome

1. 打开 Chrome，输入 `chrome://extensions/`
2. 打开右上角的"开发者模式"开关
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 文件夹

### 3. 首次配置

点击浏览器右上角的扩展图标 → 点击齿轮图标进入设置：

#### 工作日设置

```
工作日：☑ 周一 ☑ 周二 ☑ 周三 ☑ 周四 ☑ 周五
开始提醒时间：09:00
截止时间：10:00
提醒间隔：15 分钟
迟到补提醒：10:30, 11:00
```

#### TODO 模板

```
【昨日回顾】
- 完成了用户登录功能
- 修复了数据展示bug

【今日计划】
- 开发文件上传模块
- 优化首页加载速度
- 参加下午的技术评审

【风险与需求】
- 需要后端提供新的API接口
```

#### 快捷链接（可选）

```
名称：企业微信群
URL：https://work.weixin.qq.com/...

名称：日报文档
URL：https://docs.google.com/...
```

### 4. 日常使用流程

**早上 9:00**

- 收到浏览器通知："提醒：发送今日 TODO"
- 扩展图标显示红色感叹号

**点击扩展图标**

- 查看 TODO 模板
- 点击"复制"按钮，一键复制模板内容
- 点击快捷链接，跳转到发送渠道

**填写并发送**

- 在企业微信/邮件中粘贴模板
- 根据实际情况填写内容
- 发送给团队

**标记完成**

- 回到扩展，点击"标记已发送"按钮
- 今天不会再收到提醒
- 明天自动重置，继续提醒

## 常见场景配置

### 场景 1：严格打卡型（适合有强制要求的团队）

```
开始时间：08:50（提前10分钟提醒）
截止时间：09:00
间隔：2 分钟（高频提醒）
迟到提醒：09:05, 09:10, 09:15
```

### 场景 2：灵活发送型（适合弹性工作时间）

```
开始时间：09:00
截止时间：11:00
间隔：30 分钟（低频提醒）
迟到提醒：14:00（下午补充提醒）
```

### 场景 3：周报型（每周五发送）

```
工作日：仅勾选 周五
开始时间：16:00
截止时间：17:30
间隔：20 分钟
```

## 高级技巧

### 1. 模板变量（可以手动实现）

在模板中使用占位符，提醒自己填写：

```
【昨日回顾】
- [项目A] TODO_YESTERDAY
- [项目B] TODO_YESTERDAY

【今日计划】
- [优先级P0] TODO_TODAY
- [优先级P1] TODO_TODAY
```

### 2. 多端同步

配置会自动同步到所有登录了相同 Chrome 账号的设备：

- 工作电脑
- 家里电脑
- 笔记本

但每日状态是本地的，不会跨设备同步（避免冲突）。

### 3. 配置备份

定期导出配置作为备份：

1. 进入设置页面
2. 点击"导出配置"
3. 保存 JSON 文件到安全位置

### 4. 快捷键（浏览器设置）

可以在 Chrome 扩展管理页面设置快捷键：

1. 打开 `chrome://extensions/shortcuts`
2. 找到"Work TODO Reminder"
3. 设置自定义快捷键（如 `Ctrl+Shift+T`）

## 故障排查

### 提醒没有触发？

1. 检查是否是工作日
2. 检查当前时间是否在提醒时间范围内
3. 检查是否已经标记为"已发送"
4. 打开扩展的 Service Worker 控制台查看日志：
   - 右键扩展图标 → "管理扩展"
   - 点击"Service Worker" → "检查视图"

### 通知没有显示？

1. 检查 Chrome 通知权限：
   - 设置 → 隐私和安全 → 网站设置 → 通知
2. 检查系统通知设置（Windows/macOS）
3. 确保 Chrome 没有开启免打扰模式

### 配置丢失？

1. 尝试导入之前的备份配置
2. 检查 Chrome 同步是否开启
3. 重新手动配置（配置会自动保存）

## 开发调试

### 实时查看日志

```bash
# 开启开发模式
pnpm dev
```

然后：

1. 在 `chrome://extensions/` 重载扩展
2. 点击 Service Worker 下的"检查视图"
3. 查看 Console 日志

### 测试提醒功能

修改时间设置为当前时间后几分钟，快速验证提醒是否正常触发。

### 调试界面

- Popup: `http://localhost:5173/popup.html`
- Options: `http://localhost:5173/options.html`

可以像调试普通网页一样使用 Chrome DevTools。

## 更多资源

- [Chrome Extension 开发文档](https://developer.chrome.com/docs/extensions/)
- [Chrome Alarms API](https://developer.chrome.com/docs/extensions/reference/alarms/)
- [Chrome Notifications API](https://developer.chrome.com/docs/extensions/reference/notifications/)
- [问题反馈](https://github.com/your-repo/issues)

---

祝您工作愉快，再也不用担心忘记发 TODO！🎉
