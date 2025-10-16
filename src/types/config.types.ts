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
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  workDays: {
    enabled: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '09:00',
    interval: 15, // 15分钟
    deadline: '10:00',
    lateReminders: ['10:30', '11:00'],
    toastDuration: 30, // 30秒
    toastMessage: '别忘了发送今日工作计划！点击这里打开扩展。',
  },
  template: {
    content: `【昨日回顾】
- 

【今日计划】
- 

【风险与需求】
- `,
    quickLinks: [],
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}
