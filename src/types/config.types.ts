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
export type TimeFormat = '24h' | '12h'

export interface AppConfig {
  /** 提醒规则列表 */
  reminderRules: ReminderRule[]
  /** TODO 模板 */
  template: TodoTemplate
  /** 时区（仅显示用） */
  timezone: string
  /** 时间制式 */
  timeFormat: TimeFormat
  /** Toast 弹窗背景色（CSS gradient） */
  toastBackgroundColor?: string
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
    return `【今日重点】
- 

【例行任务】
- 

【备注】
- `
  }
  console.log('  → Returning ENGLISH template')
  return `[Today's Focus]
- 

[Routine Tasks]
- 

[Notes]
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
    return '别忘了今天的例行任务！点击查看详情。'
  }
  console.log('  → Returning ENGLISH message')
  return "Don't forget today's routine! Tap to check in."
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
    name: isChinese ? '每日例行提醒' : 'Daily Routine Reminder',
    enabled: true,
    workDays: [true, true, true, true, true, true, true], // Every day
    startTime: '09:00',
    interval: 10,
    deadline: '10:00',
    lateReminders: ['10:30'],
    notificationTitle: isChinese ? '提醒：今日例行检查' : 'Reminder: Daily routine check-in',
    notificationMessage: isChinese
      ? '别忘了今天的例行任务！点击查看详情。'
      : "It's time for your daily routine. Click to review.",
    toastMessage: isChinese ? '别忘了完成今日例行任务！' : "Don't forget today's routine!",
    toastDuration: 10,
    toastClickUrl: '', // 可选的 URL
    templateContent: getDefaultTemplateContent(language), // 使用默认模板
  }
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  version: 6, // 版本 6: 新增时间制式配置
  reminderRules: [createDefaultReminderRule()],
  template: {
    content: getDefaultTemplateContent(),
  },
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  timeFormat: '24h',
  toastBackgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}
