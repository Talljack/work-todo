import type { ReminderRule, DailyState, TimeFormat } from '@/types'

const MINUTES_IN_DAY = 24 * 60

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
export function formatTime(date: Date, format: TimeFormat = '24h'): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (format === '12h') {
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes} ${suffix}`
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

export function formatTimeString(time: string, format: TimeFormat = '24h'): string {
  const [rawHours, rawMinutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(rawHours, rawMinutes, 0, 0)
  return formatTime(date, format)
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
  // 如果这条规则已完成，不再提醒
  if (state.completedRules && state.completedRules.includes(rule.id)) {
    return null
  }

  // 如果不是工作日，不提醒
  if (!isWorkDay(now, rule)) return null

  const currentMinutes = getCurrentMinutes(now)
  const startMinutes = parseTime(rule.startTime)
  let deadlineMinutes = parseTime(rule.deadline)
  const originalDeadlineMinutes = deadlineMinutes

  // 处理跨午夜情况
  const isCrossMidnight = deadlineMinutes < startMinutes
  if (isCrossMidnight) {
    deadlineMinutes += MINUTES_IN_DAY
  }

  // 如果还没到开始时间，返回开始时间
  if (currentMinutes < startMinutes) {
    return createDateFromMinutes(startMinutes, now)
  }

  // 调整当前时间（如果规则跨午夜且当前时间在午夜后）
  let adjustedCurrentMinutes = currentMinutes
  if (isCrossMidnight && currentMinutes < startMinutes) {
    adjustedCurrentMinutes += MINUTES_IN_DAY
  }

  // 如果在开始时间和截止时间之间（包括截止时间），计算下一个间隔提醒时间
  if (adjustedCurrentMinutes <= deadlineMinutes) {
    // 检查当前时间是否刚好是一个提醒时间点（在间隔点上）
    const minutesSinceStart = adjustedCurrentMinutes - startMinutes
    if (minutesSinceStart >= 0 && minutesSinceStart % rule.interval === 0) {
      // 当前时间就是提醒时间点，返回当前时间
      return createDateFromMinutes(currentMinutes, now)
    }

    // 否则返回下一个间隔时间点
    const minutesUntilNext = rule.interval - (minutesSinceStart % rule.interval)
    const nextMinutes = adjustedCurrentMinutes + minutesUntilNext

    if (nextMinutes <= deadlineMinutes) {
      const actualNextMinutes = currentMinutes + minutesUntilNext
      return createDateFromMinutes(actualNextMinutes, now)
    }
    // 如果下一个间隔超过截止时间，直接使用第一个迟到提醒时间
  }

  // 查找下一个迟到提醒时间
  const lateReminderMinutes = rule.lateReminders.map((timeStr) => {
    let minutes = parseTime(timeStr)
    if (isCrossMidnight && minutes <= originalDeadlineMinutes) {
      minutes += MINUTES_IN_DAY
    }
    return minutes
  })

  // 首先检查当前时间是否刚好是一个迟到提醒时间点
  if (lateReminderMinutes.includes(adjustedCurrentMinutes)) {
    return createDateFromMinutes(currentMinutes, now)
  }

  // 否则查找下一个迟到提醒时间
  const nextLateReminder = lateReminderMinutes
    .filter((minutes) => minutes > adjustedCurrentMinutes)
    .sort((a, b) => a - b)

  if (nextLateReminder.length > 0) {
    return createDateFromMinutes(nextLateReminder[0], now)
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
  let deadlineMinutes = parseTime(rule.deadline)
  const isCrossMidnight = deadlineMinutes < startMinutes
  if (isCrossMidnight) {
    deadlineMinutes += MINUTES_IN_DAY
  }

  const baseDate = new Date(now)
  baseDate.setHours(0, 0, 0, 0)

  // 添加常规提醒时间
  for (let minutes = startMinutes; minutes <= deadlineMinutes; minutes += rule.interval) {
    times.push(createDateFromMinutes(minutes, baseDate))
  }

  // 添加迟到提醒时间
  rule.lateReminders.forEach((timeStr) => {
    const minutes = parseTime(timeStr)
    if (!isCrossMidnight && minutes > deadlineMinutes) {
      times.push(createDateFromMinutes(minutes, baseDate))
    } else if (isCrossMidnight) {
      const adjusted = minutes <= parseTime(rule.deadline) ? minutes + MINUTES_IN_DAY : minutes
      times.push(createDateFromMinutes(adjusted, baseDate))
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
  const currentMinutes = getCurrentMinutes(now)
  const startMinutes = parseTime(rule.startTime)
  const deadlineMinutesRaw = parseTime(rule.deadline)
  const isCrossMidnight = deadlineMinutesRaw < startMinutes

  const baseDate = new Date(now)
  baseDate.setHours(0, 0, 0, 0)

  const deadlineBase = new Date(baseDate)

  // 只有在跨午夜且当前时间>=开始时间时，deadline才在"明天"
  if (isCrossMidnight && currentMinutes >= startMinutes) {
    deadlineBase.setDate(deadlineBase.getDate() + 1)
  }

  const deadline = createDateFromMinutes(deadlineMinutesRaw, deadlineBase)

  if (now > deadline) {
    return { isPastDeadline: true, hours: 0, minutes: 0 }
  }

  const diff = deadline.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { isPastDeadline: false, hours, minutes }
}
