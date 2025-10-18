import { describe, expect, test } from 'vitest'
import type { ReminderRule, DailyState } from '@/types'
import { getNextReminderTime } from '@/utils/time'

describe('Popup Display Logic - Multi-Rule Scenarios', () => {
  const state: DailyState = { date: '', sent: false }

  // 创建工作计划提醒规则（周一到周五，11:00-12:00）
  const workPlanRule: ReminderRule = {
    id: 'work-plan',
    name: 'Work Plan Reminder',
    enabled: true,
    workDays: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '11:00',
    interval: 15,
    deadline: '12:00',
    lateReminders: [],
    notificationTitle: 'Work Plan',
    notificationMessage: 'Send your work plan',
    toastMessage: 'Work plan reminder',
    toastDuration: 10,
    templateContent: "[Yesterday's Review]\n-\n\n[Today's Plan]\n-\n\n[Risks & Requirements]\n-",
  }

  // 创建睡觉提醒规则（每天，23:00-23:45，避免跨午夜问题）
  const sleepRule: ReminderRule = {
    id: 'sleep',
    name: '睡觉提醒',
    enabled: true,
    workDays: [true, true, true, true, true, true, true], // Every day
    startTime: '23:00',
    interval: 15,
    deadline: '23:45',
    lateReminders: [],
    notificationTitle: 'Sleep Reminder',
    notificationMessage: 'Time to sleep',
    toastMessage: 'Sleep reminder',
    toastDuration: 10,
    templateContent: "[Yesterday's Review]\n-\n\n[Today's Plan]\n-\n\n[Risks & Requirements]\n-",
  }

  const rules = [workPlanRule, sleepRule]

  /**
   * 获取下一个会触发的规则（模拟 Popup 的逻辑）
   */
  const getNextActiveRule = (now: Date): ReminderRule | null => {
    let earliestTime: Date | null = null
    let earliestRule: ReminderRule | null = null

    for (const rule of rules) {
      if (!rule.enabled) continue

      const nextTime = getNextReminderTime(now, rule, state)
      if (nextTime) {
        if (!earliestTime || nextTime < earliestTime) {
          earliestTime = nextTime
          earliestRule = rule
        }
      }
    }

    return earliestRule
  }

  describe('Weekend (Saturday) Scenarios', () => {
    test('Saturday 11:17 - Should show Sleep Reminder (not Work Plan)', () => {
      // 2025-10-18 is Saturday
      const now = new Date('2025-10-18T11:17:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('睡觉提醒')
      expect(activeRule?.id).toBe('sleep')

      // 验证下一次提醒时间是 23:00
      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('Saturday 22:00 - Should show Sleep Reminder', () => {
      const now = new Date('2025-10-18T22:00:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('睡觉提醒')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('Saturday 23:30 - Should show Sleep Reminder (middle point)', () => {
      const now = new Date('2025-10-18T23:30:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('睡觉提醒')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(30)
    })

    test('Saturday 23:50 - Past all reminders, should return null', () => {
      // 23:50 已过所有提醒时间
      const now = new Date('2025-10-18T23:50:00')
      const activeRule = getNextActiveRule(now)

      // 今天已没有更多提醒
      expect(activeRule).toBeNull()
    })
  })

  describe('Weekend (Sunday) Scenarios', () => {
    test('Sunday 10:00 - Should show Sleep Reminder (not Work Plan)', () => {
      // 2025-10-19 is Sunday
      const now = new Date('2025-10-19T10:00:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('睡觉提醒')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(0)
    })
  })

  describe('Weekday (Monday) Scenarios', () => {
    test('Monday 10:00 - Should show Work Plan Reminder', () => {
      // 2025-10-20 is Monday
      const now = new Date('2025-10-20T10:00:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('Work Plan Reminder')
      expect(activeRule?.id).toBe('work-plan')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(11)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('Monday 11:30 - Should show Work Plan Reminder', () => {
      const now = new Date('2025-10-20T11:30:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('Work Plan Reminder')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(11)
      expect(nextTime?.getMinutes()).toBe(30)
    })

    test('Monday 13:00 - Should show Sleep Reminder (Work Plan ended)', () => {
      const now = new Date('2025-10-20T13:00:00')
      const activeRule = getNextActiveRule(now)

      // 工作计划提醒已结束，应该显示睡觉提醒
      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('睡觉提醒')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('Monday 22:00 - Should show Sleep Reminder', () => {
      const now = new Date('2025-10-20T22:00:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('睡觉提醒')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    test('Monday 01:00 - Should show Work Plan Reminder (next morning)', () => {
      // 凌晨 1:00（周一），下一个提醒是 11:00 的工作计划
      const now = new Date('2025-10-20T01:00:00')
      const activeRule = getNextActiveRule(now)

      expect(activeRule).not.toBeNull()
      expect(activeRule?.name).toBe('Work Plan Reminder')

      const nextTime = getNextReminderTime(now, activeRule!, state)
      expect(nextTime?.getHours()).toBe(11)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('Should handle already sent state', () => {
      const sentState: DailyState = { date: '2025-10-20', sent: true }
      const now = new Date('2025-10-20T11:00:00')

      const nextTimeWorkPlan = getNextReminderTime(now, workPlanRule, sentState)
      const nextTimeSleep = getNextReminderTime(now, sleepRule, sentState)

      // 如果已发送，两个规则都不应该再提醒
      expect(nextTimeWorkPlan).toBeNull()
      expect(nextTimeSleep).toBeNull()
    })
  })

  describe('Time Calculation Verification', () => {
    test('Saturday 11:17 - Time until Sleep Reminder should be ~11h 43m', () => {
      const now = new Date('2025-10-18T11:17:00')
      const activeRule = getNextActiveRule(now)
      const nextTime = getNextReminderTime(now, activeRule!, state)

      expect(nextTime).not.toBeNull()

      const diff = nextTime!.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      expect(hours).toBe(11)
      expect(minutes).toBe(43)
    })

    test('Monday 10:00 - Time until Work Plan should be 1h 0m', () => {
      const now = new Date('2025-10-20T10:00:00')
      const activeRule = getNextActiveRule(now)
      const nextTime = getNextReminderTime(now, activeRule!, state)

      expect(nextTime).not.toBeNull()

      const diff = nextTime!.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      expect(hours).toBe(1)
      expect(minutes).toBe(0)
    })
  })
})
