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
export type SoundStyle = 'professional' | 'cute' | 'minimal' | 'motivational' | 'humorous'
export type MessageStyle = 'professional' | 'cute' | 'motivational' | 'humorous' | 'minimal'

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
  /** 声音提醒风格 */
  soundStyle?: SoundStyle
  /** 声音音量 (0-100) */
  soundVolume?: number
  /** 是否启用声音提醒 */
  soundEnabled?: boolean
  /** 文案提醒风格 */
  messageStyle?: MessageStyle
  /** 是否启用智能文案（使用风格化文案替代默认文案） */
  smartMessageEnabled?: boolean
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
const generateRuleId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${random}`
}

export const createDefaultReminderRule = (lang?: string): ReminderRule => {
  const language =
    lang ||
    (typeof window !== 'undefined' ? localStorage.getItem('language') : null) ||
    (typeof navigator !== 'undefined' ? navigator.language : 'en')
  const isChinese = language.startsWith('zh')

  return {
    id: generateRuleId('rule'),
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

export const createPresetReminderRules = (lang?: string): ReminderRule[] => {
  const language =
    lang ||
    (typeof window !== 'undefined' ? localStorage.getItem('language') : null) ||
    (typeof navigator !== 'undefined' ? navigator.language : 'en')
  const isChinese = language.startsWith('zh')
  const weekdaySchedule = [true, true, true, true, true, false, false]

  return [
    {
      id: generateRuleId('rule'),
      name: isChinese ? '晨间站会' : 'Morning Standup',
      enabled: true,
      workDays: weekdaySchedule,
      startTime: '09:15',
      interval: 15,
      deadline: '09:45',
      lateReminders: ['10:00'],
      notificationTitle: isChinese ? '提醒：请分享今日计划' : 'Reminder: Share today’s plan',
      notificationMessage: isChinese
        ? '晨间站会开始啦，简单同步今日目标与阻碍。'
        : 'Morning standup is starting—share goals and blockers.',
      toastMessage: isChinese
        ? '写下今日重点，让团队同步你的进展。'
        : 'Outline today’s focus so the team stays aligned.',
      toastDuration: 15,
      toastClickUrl: '',
      templateContent: isChinese
        ? `【今日重点】
- 3 个最重要的任务
- 可能遇到的阻碍
- 需要的协助

【额外事项】
- 会议与提醒
- 客户或团队跟进`
        : `[Today’s Top Priorities]
- Three key tasks
- Potential blockers
- Help needed from the team

[Other Notes]
- Meetings & reminders
- Follow-ups to schedule`,
    },
    {
      id: generateRuleId('rule'),
      name: isChinese ? '午间进度检查' : 'Midday Progress Check-in',
      enabled: true,
      workDays: weekdaySchedule,
      startTime: '13:30',
      interval: 20,
      deadline: '14:30',
      lateReminders: ['15:00'],
      notificationTitle: isChinese ? '提醒：更新半日进度' : 'Reminder: Midday update',
      notificationMessage: isChinese
        ? '查看上午的任务是否按计划推进，及时调整节奏。'
        : 'Review morning tasks and adjust the afternoon plan.',
      toastMessage: isChinese
        ? '用 2 分钟记录进度，确保下午方向明确。'
        : 'Take 2 minutes to log progress and steer the afternoon.',
      toastDuration: 20,
      toastClickUrl: '',
      templateContent: isChinese
        ? `【上午完成】
- 核心成果
- 未完成原因

【下午计划】
- 必做事项
- 预计完成时间

【风险与提醒】
- 需要提前沟通的事项`
        : `[Morning Progress]
- Wins delivered
- Items still pending (and why)

[Afternoon Plan]
- Must-finish tasks
- Estimated completion time

[Risks & Reminders]
- Topics to flag early`,
    },
    {
      id: generateRuleId('rule'),
      name: isChinese ? '日终复盘' : 'End-of-day Wrap-up',
      enabled: true,
      workDays: weekdaySchedule,
      startTime: '17:30',
      interval: 20,
      deadline: '18:30',
      lateReminders: ['19:00'],
      notificationTitle: isChinese ? '提醒：填写今日总结' : 'Reminder: Capture today’s summary',
      notificationMessage: isChinese
        ? '回顾当天成果，记录待办与思考，方便次日承接。'
        : 'Reflect on today, note carry-overs, prep for tomorrow.',
      toastMessage: isChinese
        ? '写下今日成果，顺手安排明日优先级。'
        : 'Log today’s wins and set tomorrow’s priorities.',
      toastDuration: 20,
      toastClickUrl: '',
      templateContent: isChinese
        ? `【今日成果】
- 完成的亮点
- 学到的经验

【待延续事项】
- 明日优先级
- 待确认或阻碍

【个人提醒】
- 自我复盘 / 心情记录`
        : `[Today’s Highlights]
- Key accomplishments
- Lessons learned

[Carry-over]
- Tomorrow’s priorities
- Items blocked or pending review

[Personal Note]
- Reflection / how you felt today`,
    },
  ]
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  version: 7, // 版本 7: 新增声音和文案风格配置
  reminderRules: createPresetReminderRules(),
  template: {
    content: getDefaultTemplateContent(),
  },
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  timeFormat: '24h',
  toastBackgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  soundStyle: 'professional',
  soundVolume: 70,
  soundEnabled: true,
  messageStyle: 'professional',
  smartMessageEnabled: true,
}
