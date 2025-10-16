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
 * 默认状态
 */
export const DEFAULT_DAILY_STATE: DailyState = {
  date: '',
  sent: false,
}
