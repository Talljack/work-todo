/**
 * 每日状态
 */
export interface DailyState {
  /** 日期，格式 "YYYY-MM-DD" */
  date: string
  /** 是否已发送 */
  sent: boolean
  /** 最后提醒时间（ISO 字符串） */
  lastRemindTime?: string
}

/**
 * 历史记录条目
 */
export interface HistoryRecord {
  /** 日期，格式 "YYYY-MM-DD" */
  date: string
  /** 是否已发送 */
  sent: boolean
  /** 发送时间（ISO 字符串） */
  sentAt?: string
}

/**
 * 统计数据
 */
export interface Statistics {
  /** 总天数 */
  totalDays: number
  /** 完成天数 */
  completedDays: number
  /** 当前连续天数 */
  currentStreak: number
  /** 最长连续天数 */
  longestStreak: number
  /** 完成率 (0-100) */
  completionRate: number
  /** 本周完成率 */
  weeklyCompletionRate: number
  /** 本月完成率 */
  monthlyCompletionRate: number
}

/**
 * 应用数据（包含历史记录）
 */
export interface AppData {
  /** 历史记录（最近90天） */
  history: HistoryRecord[]
  /** 首次安装时间 */
  installDate?: string
}

/**
 * 默认状态
 */
export const DEFAULT_DAILY_STATE: DailyState = {
  date: '',
  sent: false,
}

/**
 * 默认应用数据
 */
export const DEFAULT_APP_DATA: AppData = {
  history: [],
}
