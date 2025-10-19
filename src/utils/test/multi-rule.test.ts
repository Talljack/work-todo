import { describe, expect, test } from 'vitest'
import type { ReminderRule, DailyState } from '@/types'
import { getNextReminderTime, isWorkDay } from '@/utils/time'

describe('Multi-Rule System Tests', () => {
  // 创建测试规则
  const createTestRule = (overrides: Partial<ReminderRule> = {}): ReminderRule => ({
    id: `rule-${Date.now()}`,
    name: 'Test Rule',
    enabled: true,
    workDays: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '09:00',
    interval: 15,
    deadline: '10:00',
    lateReminders: [],
    notificationTitle: 'Test Title',
    notificationMessage: 'Test Message',
    toastMessage: 'Test Toast',
    toastDuration: 10,
    toastClickUrl: '',
    ...overrides,
  })

  describe('Work Day Detection', () => {
    test('should detect work days correctly for Mon-Fri rule', () => {
      const rule = createTestRule()

      // Monday - Friday (2025-10-13 to 2025-10-17)
      expect(isWorkDay(new Date('2025-10-13T10:00:00'), rule)).toBe(true) // Mon
      expect(isWorkDay(new Date('2025-10-14T10:00:00'), rule)).toBe(true) // Tue
      expect(isWorkDay(new Date('2025-10-15T10:00:00'), rule)).toBe(true) // Wed
      expect(isWorkDay(new Date('2025-10-16T10:00:00'), rule)).toBe(true) // Thu
      expect(isWorkDay(new Date('2025-10-17T10:00:00'), rule)).toBe(true) // Fri

      // Weekend
      expect(isWorkDay(new Date('2025-10-18T10:00:00'), rule)).toBe(false) // Sat
      expect(isWorkDay(new Date('2025-10-19T10:00:00'), rule)).toBe(false) // Sun
    })

    test('should detect work days correctly for weekend rule', () => {
      const weekendRule = createTestRule({
        name: 'Weekend Rule',
        workDays: [false, false, false, false, false, true, true], // Sat-Sun
      })

      // Weekdays
      expect(isWorkDay(new Date('2025-10-13T10:00:00'), weekendRule)).toBe(false) // Mon
      expect(isWorkDay(new Date('2025-10-17T10:00:00'), weekendRule)).toBe(false) // Fri

      // Weekend
      expect(isWorkDay(new Date('2025-10-18T10:00:00'), weekendRule)).toBe(true) // Sat
      expect(isWorkDay(new Date('2025-10-19T10:00:00'), weekendRule)).toBe(true) // Sun
    })

    test('should detect work days correctly for every day rule', () => {
      const everyDayRule = createTestRule({
        name: 'Every Day Rule',
        workDays: [true, true, true, true, true, true, true],
      })

      expect(isWorkDay(new Date('2025-10-13T10:00:00'), everyDayRule)).toBe(true) // Mon
      expect(isWorkDay(new Date('2025-10-18T10:00:00'), everyDayRule)).toBe(true) // Sat
      expect(isWorkDay(new Date('2025-10-19T10:00:00'), everyDayRule)).toBe(true) // Sun
    })
  })

  describe('Next Reminder Time Calculation', () => {
    const state: DailyState = { date: '', completedRules: [] }

    test('should return first reminder time when before start time', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '10:00',
        interval: 15,
      })

      const now = new Date('2025-10-17T08:30:00') // Friday 8:30 AM
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(9)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('should return next interval time when within reminder period', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '10:00',
        interval: 15,
      })

      const now = new Date('2025-10-17T09:05:00') // Friday 9:05 AM
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(9)
      // Next interval from 09:00 is 09:15
      expect(nextTime?.getMinutes()).toBe(15)
    })

    test('should return late reminder after deadline', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '10:00',
        interval: 15,
        lateReminders: ['10:30', '11:00'],
      })

      const now = new Date('2025-10-17T10:15:00') // Friday 10:15 AM (past deadline)
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(10)
      expect(nextTime?.getMinutes()).toBe(30)
    })

    test('should return null when already sent', () => {
      const rule = createTestRule()
      const sentState: DailyState = { date: '', completedRules: [rule.id] } // 使用rule的ID

      const now = new Date('2025-10-17T09:00:00')
      const nextTime = getNextReminderTime(now, rule, sentState)

      expect(nextTime).toBeNull()
    })

    test('should return null on non-work day', () => {
      const rule = createTestRule()

      const now = new Date('2025-10-18T09:00:00') // Saturday
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).toBeNull()
    })

    test('should return null when past all reminders', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '10:00',
        interval: 15,
        lateReminders: ['10:30'],
      })

      const now = new Date('2025-10-17T11:00:00') // Past all reminders
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).toBeNull()
    })
  })

  describe('Multiple Rules Scheduling', () => {
    const state: DailyState = { date: '', completedRules: [] }

    test('should find earliest reminder among multiple rules', () => {
      const rules: ReminderRule[] = [
        createTestRule({
          id: 'rule-1',
          name: 'Morning Rule',
          startTime: '09:00',
          deadline: '10:00',
        }),
        createTestRule({
          id: 'rule-2',
          name: 'Afternoon Rule',
          startTime: '15:00',
          deadline: '16:00',
        }),
        createTestRule({
          id: 'rule-3',
          name: 'Evening Rule',
          startTime: '23:00',
          deadline: '23:30',
        }),
      ]

      const now = new Date('2025-10-17T08:00:00') // Friday 8:00 AM

      // Find earliest reminder
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

      expect(earliestRule).not.toBeNull()
      expect(earliestRule?.name).toBe('Morning Rule')
      expect(earliestTime?.getHours()).toBe(9)
      expect(earliestTime?.getMinutes()).toBe(0)
    })

    test('should handle multiple rules with same start time', () => {
      const rules: ReminderRule[] = [
        createTestRule({
          id: 'rule-1',
          name: 'Daily Routine',
          startTime: '09:00',
          deadline: '10:00',
        }),
        createTestRule({
          id: 'rule-2',
          name: 'Medicine Reminder',
          startTime: '09:00',
          deadline: '09:30',
        }),
      ]

      const now = new Date('2025-10-17T08:00:00')

      // Find all rules that should trigger at 09:00
      const rulesToRemind = rules.filter((rule) => {
        if (!rule.enabled) return false
        const nextTime = getNextReminderTime(now, rule, state)
        // Check if should remind within 1 minute
        return nextTime && Math.abs(nextTime.getTime() - new Date('2025-10-17T09:00:00').getTime()) <= 60000
      })

      expect(rulesToRemind.length).toBe(2)
      expect(rulesToRemind.map((r) => r.name)).toContain('Daily Routine')
      expect(rulesToRemind.map((r) => r.name)).toContain('Medicine Reminder')
    })

    test('should skip disabled rules', () => {
      const rules: ReminderRule[] = [
        createTestRule({
          id: 'rule-1',
          name: 'Enabled Rule',
          enabled: true,
          startTime: '09:00',
        }),
        createTestRule({
          id: 'rule-2',
          name: 'Disabled Rule',
          enabled: false,
          startTime: '08:00', // Earlier but disabled
        }),
      ]

      const now = new Date('2025-10-17T07:00:00')

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

      expect(earliestRule?.name).toBe('Enabled Rule')
      expect(earliestRule?.enabled).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    const state: DailyState = { date: '', completedRules: [] }

    test('should handle rule with very short interval', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '09:10',
        interval: 1, // 1 minute
      })

      const now = new Date('2025-10-17T09:00:00')
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(9)
      // At 9:00, which is the start time, should return 9:00 (not 9:01)
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('should handle rule with very long interval', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '18:00',
        interval: 60, // 1 hour
      })

      const now = new Date('2025-10-17T09:30:00')
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(10)
      // Next interval from 09:00 is 10:00
      expect(nextTime?.getMinutes()).toBe(0)
    })

    test('should handle empty late reminders array', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '10:00',
        lateReminders: [],
      })

      const now = new Date('2025-10-17T10:30:00') // Past deadline
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).toBeNull()
    })

    test('should handle multiple late reminders', () => {
      const rule = createTestRule({
        startTime: '09:00',
        deadline: '10:00',
        lateReminders: ['10:30', '11:00', '11:30'],
      })

      const now = new Date('2025-10-17T10:45:00')
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(11)
      expect(nextTime?.getMinutes()).toBe(0)
    })
  })

  describe('Real-world Scenarios', () => {
    const state: DailyState = { date: '', completedRules: [] }

    test('Scenario: Work plan reminder (9-10am, every 15 min)', () => {
      const rule = createTestRule({
        name: '例行任务提醒',
        workDays: [true, true, true, true, true, false, false],
        startTime: '09:00',
        interval: 15,
        deadline: '10:00',
        lateReminders: ['10:30', '11:00'],
      })

      // Test different times throughout the day
      // Note: getNextReminderTime returns current time if it's a reminder point
      const testCases = [
        { time: '08:00', expectedHour: 9, expectedMin: 0 }, // Before start -> start time
        { time: '09:00', expectedHour: 9, expectedMin: 0 }, // At start time -> return current time
        { time: '09:10', expectedHour: 9, expectedMin: 15 }, // Next interval from 09:00 is 09:15
        { time: '09:15', expectedHour: 9, expectedMin: 15 }, // At interval point -> return current time
        { time: '09:20', expectedHour: 9, expectedMin: 30 }, // Next interval from 09:00 is 09:30
        { time: '09:30', expectedHour: 9, expectedMin: 30 }, // At interval point -> return current time
        { time: '09:50', expectedHour: 10, expectedMin: 0 }, // Next interval from 09:00 is 10:00 (deadline)
        { time: '10:10', expectedHour: 10, expectedMin: 30 }, // Past deadline -> first late reminder
        { time: '10:30', expectedHour: 10, expectedMin: 30 }, // At late reminder point -> return current time
        { time: '10:40', expectedHour: 11, expectedMin: 0 }, // Past first late -> second late reminder
      ]

      for (const tc of testCases) {
        const now = new Date(`2025-10-17T${tc.time}:00`)
        const nextTime = getNextReminderTime(now, rule, state)

        expect(nextTime).not.toBeNull()
        expect(nextTime?.getHours()).toBe(tc.expectedHour)
        expect(nextTime?.getMinutes()).toBe(tc.expectedMin)
      }
    })

    test('Scenario: Afternoon tea reminder (3-4pm, every 30 min)', () => {
      const rule = createTestRule({
        name: '下午茶提醒',
        workDays: [true, true, true, true, true, false, false],
        startTime: '15:00',
        interval: 30,
        deadline: '16:00',
        lateReminders: ['16:30'],
      })

      const testCases = [
        { time: '14:00', expectedHour: 15, expectedMin: 0 }, // Before start -> start time
        { time: '15:00', expectedHour: 15, expectedMin: 0 }, // At start time -> return current time
        { time: '15:20', expectedHour: 15, expectedMin: 30 }, // Next interval from 15:00 is 15:30
        { time: '15:30', expectedHour: 15, expectedMin: 30 }, // At interval point -> return current time
        { time: '15:40', expectedHour: 16, expectedMin: 0 }, // Next interval from 15:00 is 16:00 (deadline)
        { time: '16:10', expectedHour: 16, expectedMin: 30 }, // Past deadline -> late reminder
        { time: '16:30', expectedHour: 16, expectedMin: 30 }, // At late reminder point -> return current time
      ]

      for (const tc of testCases) {
        const now = new Date(`2025-10-17T${tc.time}:00`)
        const nextTime = getNextReminderTime(now, rule, state)

        expect(nextTime).not.toBeNull()
        expect(nextTime?.getHours()).toBe(tc.expectedHour)
        expect(nextTime?.getMinutes()).toBe(tc.expectedMin)
      }
    })

    test('Scenario: Bedtime reminder (11pm-12am, every day)', () => {
      const rule = createTestRule({
        name: '睡觉提醒',
        workDays: [true, true, true, true, true, true, true], // Every day
        startTime: '23:00',
        interval: 15,
        deadline: '23:45',
        lateReminders: [],
      })

      // Test on weekend (should still work)
      const now = new Date('2025-10-18T22:00:00') // Saturday 10pm
      const nextTime = getNextReminderTime(now, rule, state)

      expect(nextTime).not.toBeNull()
      expect(nextTime?.getHours()).toBe(23)
      expect(nextTime?.getMinutes()).toBe(0)
    })
  })
})
