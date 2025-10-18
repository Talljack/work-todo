# 架构设计文档 / Architecture Design

## 系统概览

Routine Reminder 是一个基于 Chrome Extension Manifest V3 的浏览器扩展，使用现代前端技术栈构建。

### 技术选型理由

| 技术                  | 理由                                   |
| --------------------- | -------------------------------------- |
| React 18.3            | 声明式 UI，组件化开发，生态成熟        |
| TypeScript 5.7        | 类型安全，减少运行时错误，提升开发体验 |
| Vite 5.4              | 快速的开发服务器和构建工具             |
| Tailwind CSS 3.4      | 实用优先的 CSS 框架，快速构建现代 UI   |
| webextension-polyfill | 跨浏览器 API 兼容层，Promise 化 API    |

## 核心模块设计

### 1. 数据模型 (`src/types/`)

#### AppConfig - 应用配置

```typescript
interface AppConfig {
  workDays: WorkDayConfig // 工作日配置
  template: TodoTemplate // 提醒模板
  timezone: string // 时区（只读）
}
```

存储位置：`chrome.storage.sync`（跨设备同步）

#### DailyState - 每日状态

```typescript
interface DailyState {
  date: string // 日期 "YYYY-MM-DD"
  sent: boolean // 是否已完成
  lastRemindTime?: string // 最后提醒时间
}
```

存储位置：`chrome.storage.local`（本地，避免跨设备冲突）

### 2. Storage 管理层 (`src/utils/storage.ts`)

**职责**：

- 封装 Chrome Storage API
- 提供配置的读写、导入导出
- 提供状态管理方法
- 监听配置变化

**关键设计**：

- 配置使用 `sync` storage 实现跨设备同步
- 状态使用 `local` storage 避免冲突
- 提供默认值机制
- 错误处理和降级

```typescript
// 示例：配置读取带默认值
export async function getConfig(): Promise<AppConfig> {
  const result = await browser.storage.sync.get(STORAGE_KEYS.CONFIG)
  return result[STORAGE_KEYS.CONFIG] || DEFAULT_CONFIG
}
```

### 3. 时间工具 (`src/utils/time.ts`)

**职责**：

- 时间格式转换（字符串 ↔ 分钟数 ↔ Date）
- 工作日判断
- 计算下次提醒时间
- 判断是否需要重置状态

**核心算法：计算下次提醒时间**

```typescript
function getNextReminderTime(now, config, state) {
  // 1. 已完成 → 不提醒
  if (state.sent) return null

  // 2. 非工作日 → 不提醒
  if (!isWorkDay(now, config)) return null

  // 3. 未到开始时间 → 返回开始时间
  if (currentTime < startTime) return startTime

  // 4. 在正常提醒时段 → 按间隔计算
  if (currentTime < deadline) {
    return currentTime + interval
  }

  // 5. 过了截止时间 → 使用迟到提醒
  return findNextLateReminder()
}
```

### 4. 后台服务 (`src/background/background.ts`)

**Service Worker 生命周期**：

```
浏览器启动 / 扩展安装
    ↓
onStartup / onInstalled
    ↓
initAlarms()
    ├─ 检查并重置状态
    ├─ 安排今日提醒
    └─ 安排午夜重置闹钟
    ↓
等待闹钟触发...
    ↓
onAlarm
    ├─ todo-reminder → 发送通知 + Badge + 安排下次提醒
    └─ midnight-reset → 重置状态 + 重新初始化
```

**关键技术点**：

1. **Service Worker 持久化**
   - 使用 Chrome Alarms API 确保定时任务可靠执行
   - Alarms 在 Service Worker 休眠时仍能触发
   - 浏览器重启后自动恢复

2. **状态同步**
   - 监听 `chrome.storage.onChanged` 实现配置变化响应
   - 配置变化时自动重新初始化闹钟

3. **多提醒机制**
   - 常规提醒：开始时间 → 截止时间，按间隔提醒
   - 迟到提醒：截止时间后的补充提醒点
   - 每次提醒后立即安排下次提醒

### 5. Popup 界面 (`src/popup/Popup.tsx`)

**组件结构**：

```
Popup
├─ Header
│  ├─ 标题
│  ├─ 设置按钮
│  ├─ 当前时间
│  └─ 状态徽章（已完成/待发送/休息日）
├─ Template Card
│  ├─ 模板内容展示
│  └─ 复制按钮
├─ Active Rule Card
│  └─ 当前规则的通知设置信息
└─ Action Buttons
   └─ 标记已完成按钮
```

**交互设计**：

- 一键复制：使用 Clipboard API
- 标记已完成：通过 `runtime.sendMessage` 通知后台

### 6. Options 页面 (`src/options/Options.tsx`)

**表单设计**：

```
Options
├─ Work Schedule Section
│  ├─ 工作日选择（Toggle Buttons）
│  ├─ 时间设置（Time Input）
│  └─ 迟到提醒列表（Dynamic List）
├─ Template Section
│  └─ 多行文本框
└─ Other Section
   ├─ 时区显示
   └─ 导入/导出
```

**保存逻辑**：

1. 保存到 Storage
2. 发送消息到后台重新初始化闹钟
3. 显示成功提示

## 数据流

### 1. 配置变更流程

```
User 修改配置
    ↓
Options Page
    ↓
saveConfig()
    ↓
chrome.storage.sync.set()
    ↓
storage.onChanged 事件
    ↓
Background Service
    ↓
initAlarms() 重新初始化
```

### 2. 提醒触发流程

```
Chrome Alarms
    ↓
onAlarm 事件
    ↓
handleReminder()
    ├─ 检查状态
    ├─ 创建通知
    ├─ 更新 Badge
    └─ 安排下次提醒
```

### 3. 标记已完成流程

```
User 点击按钮
    ↓
Popup
    ↓
runtime.sendMessage()
    ↓
Background
    ├─ markAsSent()
    ├─ 清除 Badge
    └─ 清除闹钟
    ↓
Response
    ↓
Popup 刷新状态
```

## 关键技术实现

### 1. Chrome Alarms API 使用

**为什么使用 Alarms 而不是 setTimeout？**

- Service Worker 可能随时被挂起
- setTimeout 在 Worker 休眠时不可靠
- Alarms 是持久化的，浏览器保证执行

**实现方式**：

```typescript
// 创建精确时间闹钟
chrome.alarms.create('todo-reminder', {
  when: nextReminderTime.getTime(), // 时间戳
})

// 监听触发
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'todo-reminder') {
    handleReminder()
  }
})
```

### 2. 跨设备同步策略

**配置同步**：

- 使用 `chrome.storage.sync`
- 自动同步到所有设备
- 配额：100KB 总容量

**状态隔离**：

- 使用 `chrome.storage.local`
- 每台设备独立状态
- 避免"在 A 设备标记，B 设备不提醒"的冲突

### 3. 状态重置机制

**双重保障**：

1. **午夜闹钟**

   ```typescript
   // 设置次日 0:00 闹钟
   const midnight = getNextMidnight()
   chrome.alarms.create('midnight-reset', {
     when: midnight.getTime(),
   })
   ```

2. **启动检查**
   ```typescript
   chrome.runtime.onStartup.addListener(() => {
     const state = getDailyState()
     if (shouldResetState(state.date)) {
       resetDailyState()
     }
     initAlarms()
   })
   ```

### 4. 国际化实现

使用 `i18next` + `react-i18next`：

```typescript
// 定义翻译资源
const resources = {
  en: { translation: { ... } },
  zh: { translation: { ... } }
}

// 自动检测语言
i18n.use(LanguageDetector).init({
  fallbackLng: 'en',
  resources
})

// 在组件中使用
const { t } = useTranslation()
<h1>{t('popup.title')}</h1>
```

## 性能优化

### 1. 减少不必要的存储读取

```typescript
// ❌ 每次都读取
const config = await getConfig()

// ✅ 启动时读取一次，缓存使用
let cachedConfig = await getConfig()
```

### 2. 批量操作

```typescript
// 并行读取
const [config, state] = await Promise.all([getConfig(), getDailyState()])
```

### 3. 按需更新 UI

React 组件使用 useState 和 useEffect 管理状态，只在需要时重新渲染。

## 安全考虑

### 1. 权限最小化

仅请求必要的权限：

- `storage` - 存储配置
- `alarms` - 定时提醒
- `notifications` - 系统通知

移除了不需要的：

- ~~`tabs`~~ - 不需要访问标签页内容
- ~~`<all_urls>`~~ - 不需要访问网页
- ~~`content-scripts`~~ - 不需要注入脚本

### 2. 数据验证

```typescript
// 导入配置时验证
export async function importConfig(jsonString: string) {
  const config = JSON.parse(jsonString)

  // 验证结构
  if (!config.workDays || !config.template) {
    throw new Error('Invalid config format')
  }

  await saveConfig(config)
}
```

### 3. XSS 防护

- React 自动转义输出
- i18next 配置 `escapeValue: false`（React 已处理）

## 测试策略

### 1. 单元测试

针对纯函数进行测试：

- 时间工具函数
- 数据转换函数

```typescript
test('parseTime should convert HH:mm to minutes', () => {
  expect(parseTime('09:30')).toBe(570)
})
```

### 2. 集成测试

需要 mock Chrome APIs：

- Storage API
- Alarms API
- Notifications API

### 3. 手动测试

- 修改系统时间测试跨天重置
- 修改工作日配置测试提醒逻辑
- 测试多设备同步

## 未来优化方向

### 1. 功能扩展

- [ ] 音频提醒（需要 offscreen document）
- [ ] 自定义提醒音效
- [ ] 模板变量支持（日期、时间等）
- [ ] 历史记录查看
- [ ] 统计分析（按时发送率）

### 2. 技术优化

- [ ] 添加更多单元测试
- [ ] 使用状态管理库（如 Zustand）
- [ ] 优化 Bundle 大小
- [ ] 支持 Firefox / Edge

### 3. 体验优化

- [ ] 深色模式
- [ ] 更多动画效果
- [ ] 键盘快捷键
- [ ] 右键菜单快捷操作

## 参考资料

- [Chrome Extension MV3 文档](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Alarms API](https://developer.chrome.com/docs/extensions/reference/alarms/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Service Workers 生命周期](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
