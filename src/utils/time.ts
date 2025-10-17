import type { ReminderRule, DailyState } from '@/types'

/**
 * 判断指定日期是否为工作日
 */
export function isWorkDay(date: Date, rule: ReminderRule): boolean {
  const dayOfWeek = date.getDay()
  // JavaScript 的 getDay() 返回 0-6，0 是周日
  // 我们的配置是 [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  const configIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  return rule.workDays[configIndex]
}

/**
 * 解析时间字符串 "HH:mm" 返回分钟数
 */
export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 从分钟数创建今日的 Date 对象
 */
export function createDateFromMinutes(minutes: number, baseDate?: Date): Date {
  const date = baseDate ? new Date(baseDate) : new Date()
  date.setHours(Math.floor(minutes / 60))
  date.setMinutes(minutes % 60)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

/**
 * 获取当前时间的分钟数（从午夜开始）
 */
export function getCurrentMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * 格式化时间为 "HH:mm"
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 判断是否需要重置状态
 */
export function shouldResetState(lastDate: string): boolean {
  if (!lastDate) return true

  const today = new Date().toISOString().split('T')[0]
  return lastDate !== today
}

/**
 * 计算下次提醒时间
 * 返回 null 表示今天不需要再提醒
 */
export function getNextReminderTime(now: Date, rule: ReminderRule, state: DailyState): Date | null {
  // 如果已发送，不再提醒
  if (state.sent) return null

  // 如果不是工作日，不提醒
  if (!isWorkDay(now, rule)) return null

  const currentMinutes = getCurrentMinutes(now)
  const startMinutes = parseTime(rule.startTime)
  const deadlineMinutes = parseTime(rule.deadline)

  // 如果还没到开始时间，返回开始时间
  if (currentMinutes < startMinutes) {
    return createDateFromMinutes(startMinutes, now)
  }

  // 如果在开始时间和截止时间之间，计算下一个间隔提醒时间
  if (currentMinutes < deadlineMinutes) {
    const nextMinutes = currentMinutes + rule.interval
    if (nextMinutes <= deadlineMinutes) {
      return createDateFromMinutes(nextMinutes, now)
    }
    // 如果下一个间隔超过截止时间，直接使用第一个迟到提醒时间
  }

  // 查找下一个迟到提醒时间
  const lateReminderMinutes = rule.lateReminders
    .map(parseTime)
    .filter((minutes) => minutes > currentMinutes)
    .sort((a, b) => a - b)

  if (lateReminderMinutes.length > 0) {
    return createDateFromMinutes(lateReminderMinutes[0], now)
  }

  // 今天没有更多提醒了
  return null
}

/**
 * 获取所有今日提醒时间点
 */
export function getTodayReminderTimes(rule: ReminderRule): Date[] {
  const now = new Date()
  if (!isWorkDay(now, rule)) return []

  const times: Date[] = []
  const startMinutes = parseTime(rule.startTime)
  const deadlineMinutes = parseTime(rule.deadline)

  // 添加常规提醒时间
  for (let minutes = startMinutes; minutes <= deadlineMinutes; minutes += rule.interval) {
    times.push(createDateFromMinutes(minutes, now))
  }

  // 添加迟到提醒时间
  rule.lateReminders.forEach((timeStr) => {
    const minutes = parseTime(timeStr)
    if (minutes > deadlineMinutes) {
      times.push(createDateFromMinutes(minutes, now))
    }
  })

  return times
}

/**
 * 获取明天午夜的时间
 */
export function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

/**
 * 计算距离截止时间还有多久
 * 返回结构化数据，便于国际化
 */
export function getTimeUntilDeadline(rule: ReminderRule): {
  isPastDeadline: boolean
  hours: number
  minutes: number
} {
  const now = new Date()
  const deadlineMinutes = parseTime(rule.deadline)
  const deadline = createDateFromMinutes(deadlineMinutes, now)

  if (now > deadline) {
    return { isPastDeadline: true, hours: 0, minutes: 0 }
  }

  const diff = deadline.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { isPastDeadline: false, hours, minutes }
}
