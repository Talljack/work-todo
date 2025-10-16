/**
 * 工作日配置
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
 * 快捷链接
 */
export interface QuickLink {
  /** 链接名称 */
  name: string
  /** 链接 URL */
  url: string
}

/**
 * TODO 模板配置
 */
export interface TodoTemplate {
  /** 模板内容 */
  content: string
  /** 快捷链接列表 */
  quickLinks: QuickLink[]
}

/**
 * 应用配置
 */
export interface AppConfig {
  /** 工作日配置 */
  workDays: WorkDayConfig
  /** TODO 模板 */
  template: TodoTemplate
  /** 时区（仅显示用） */
  timezone: string
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
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  workDays: {
    enabled: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '09:00',
    interval: 15, // 15分钟
    deadline: '10:00',
    lateReminders: ['10:30', '11:00'],
    toastDuration: 10, // 10秒
    toastMessage: getDefaultToastMessage(),
  },
  template: {
    content: getDefaultTemplateContent(),
    quickLinks: [],
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}
