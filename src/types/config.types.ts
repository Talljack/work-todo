/**
 * 提醒规则
 */
export interface ReminderRule {
  /** 规则 ID */
  id: string
  /** 规则名称 */
  name: string
  /** 是否启用 */
  enabled: boolean
  /** 启用的工作日 [Mon, Tue, Wed, Thu, Fri, Sat, Sun] */
  workDays: boolean[]
  /** 开始提醒时间，格式 "HH:mm" */
  startTime: string
  /** 提醒间隔（分钟） */
  interval: number
  /** 最后发送时间/截止时间，格式 "HH:mm" */
  deadline: string
  /** 迟到补提醒时间点，格式 ["HH:mm", "HH:mm"] */
  lateReminders: string[]
  /** 系统通知标题 */
  notificationTitle: string
  /** 系统通知内容 */
  notificationMessage: string
  /** Toast 提醒内容 */
  toastMessage: string
  /** Toast 提醒持续时间（秒） */
  toastDuration: number
  /** Toast 点击后打开的 URL（可选） */
  toastClickUrl?: string
  /** 该规则的 TODO 模板内容（支持 Markdown）*/
  templateContent?: string
}

/**
 * 工作日配置（已废弃，保留用于迁移）
 * @deprecated 使用 ReminderRule 替代
 */
export interface WorkDayConfig {
  /** 启用的工作日 [Mon, Tue, Wed, Thu, Fri, Sat, Sun] */
  enabled: boolean[]
  /** 开始提醒时间，格式 "HH:mm" */
  startTime: string
  /** 提醒间隔（分钟） */
  interval: number
  /** 最后发送时间/截止时间，格式 "HH:mm" */
  deadline: string
  /** 迟到补提醒时间点，格式 ["HH:mm", "HH:mm"] */
  lateReminders: string[]
  /** Toast 提醒持续时间（秒） */
  toastDuration: number
  /** Toast 提醒内容 */
  toastMessage: string
}

/**
 * TODO 模板配置
 */
export interface TodoTemplate {
  /** 模板内容 */
  content: string
}

/**
 * 应用配置
 */
export interface AppConfig {
  /** 提醒规则列表 */
  reminderRules: ReminderRule[]
  /** TODO 模板 */
  template: TodoTemplate
  /** 时区（仅显示用） */
  timezone: string
  /** 配置版本号，用于迁移 */
  version: number
  /** 旧版配置（用于迁移兼容）*/
  workDays?: WorkDayConfig
}

/**
 * 获取默认模板内容（根据语言）
 */
export const getDefaultTemplateContent = (lang?: string): string => {
  // 优先使用传入的语言，其次从 localStorage 读取，最后使用浏览器语言
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null
  const language = lang || savedLang || navigator.language

  console.log('[getDefaultTemplateContent] Details:')
  console.log('  - Input lang:', lang)
  console.log('  - localStorage language:', savedLang)
  console.log('  - navigator.language:', navigator.language)
  console.log('  - Final language:', language)
  console.log('  - Is Chinese?:', language.startsWith('zh'))

  if (language.startsWith('zh')) {
    console.log('  → Returning CHINESE template')
    return `【昨日回顾】
- 

【今日计划】
- 

【风险与需求】
- `
  }
  console.log('  → Returning ENGLISH template')
  return `[Yesterday's Review]
- 

[Today's Plan]
- 

[Risks & Requirements]
- `
}

/**
 * 获取默认 Toast 消息（根据语言）
 */
export const getDefaultToastMessage = (lang?: string): string => {
  // 优先使用传入的语言，其次从 localStorage 读取，最后使用浏览器语言
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null
  const language = lang || savedLang || navigator.language

  console.log('[getDefaultToastMessage] Final language:', language)

  if (language.startsWith('zh')) {
    console.log('  → Returning CHINESE message')
    return '别忘了发送今日工作计划！点击这里打开扩展。'
  }
  console.log('  → Returning ENGLISH message')
  return "Don't forget to send today's work plan! Click here to open the extension."
}

/**
 * 创建默认的提醒规则
 */
export const createDefaultReminderRule = (lang?: string): ReminderRule => {
  const language =
    lang ||
    (typeof window !== 'undefined' ? localStorage.getItem('language') : null) ||
    (typeof navigator !== 'undefined' ? navigator.language : 'en')
  const isChinese = language.startsWith('zh')

  return {
    id: `rule-${Date.now()}`,
    name: isChinese ? '工作计划提醒' : 'Work Plan Reminder',
    enabled: true,
    workDays: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '09:00',
    interval: 15,
    deadline: '10:00',
    lateReminders: ['10:30', '11:00'],
    notificationTitle: isChinese ? '提醒：发送今日 TODO' : "Reminder: Send Today's TODO",
    notificationMessage: isChinese
      ? '别忘了发送今日工作计划！点击打开扩展。'
      : "Don't forget to send your daily work plan! Click to open.",
    toastMessage: isChinese ? '别忘了发送今日工作计划！' : "Don't forget to send your work plan!",
    toastDuration: 10,
    toastClickUrl: '', // 可选的 URL
    templateContent: getDefaultTemplateContent(language), // 使用默认模板
  }
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  version: 5, // 版本 5: 为每个规则添加 templateContent 字段，支持 Markdown
  reminderRules: [createDefaultReminderRule()],
  template: {
    content: getDefaultTemplateContent(),
  },
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
}
