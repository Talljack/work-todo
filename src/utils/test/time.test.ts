import { describe, expect, test } from 'vitest'
import {
  parseTime,
  formatTime,
  formatTimeString,
  isWorkDay,
  shouldResetState,
  getCurrentMinutes,
  createDateFromMinutes,
  getNextReminderTime,
} from '../time'
import type { ReminderRule, DailyState } from '@/types'

describe('Time Utils', () => {
  describe('parseTime', () => {
    test('should parse time string to minutes', () => {
      expect(parseTime('09:00')).toBe(540) // 9 * 60
      expect(parseTime('10:30')).toBe(630) // 10 * 60 + 30
      expect(parseTime('00:00')).toBe(0)
      expect(parseTime('23:59')).toBe(1439)
    })
  })

  describe('formatTime', () => {
    test('should format date to HH:mm by default', () => {
      const date = new Date('2025-10-16T09:30:00')
      expect(formatTime(date)).toBe('09:30')

      const date2 = new Date('2025-10-16T23:05:00')
      expect(formatTime(date2)).toBe('23:05')
    })

    test('should format date to 12-hour when requested', () => {
      const date = new Date('2025-10-16T09:30:00')
      expect(formatTime(date, '12h')).toBe('9:30 AM')

      const date2 = new Date('2025-10-16T23:05:00')
      expect(formatTime(date2, '12h')).toBe('11:05 PM')
    })
  })

  describe('formatTimeString', () => {
    test('should format time string using provided format', () => {
      expect(formatTimeString('09:15', '24h')).toBe('09:15')
      expect(formatTimeString('09:15', '12h')).toBe('9:15 AM')
      expect(formatTimeString('23:45', '12h')).toBe('11:45 PM')
    })
  })

  describe('getCurrentMinutes', () => {
    test('should get minutes from midnight', () => {
      const date = new Date('2025-10-16T09:30:00')
      expect(getCurrentMinutes(date)).toBe(570) // 9 * 60 + 30
    })
  })

  describe('createDateFromMinutes', () => {
    test('should create date from minutes', () => {
      const baseDate = new Date('2025-10-16T00:00:00')
      const result = createDateFromMinutes(570, baseDate)
      expect(result.getHours()).toBe(9)
      expect(result.getMinutes()).toBe(30)
    })
  })

  describe('isWorkDay', () => {
    const rule: ReminderRule = {
      id: 'test-rule',
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
      toastDuration: 30,
      toastClickUrl: '',
    }

    test('should return true for workdays', () => {
      // Monday (2025-10-13)
      const monday = new Date('2025-10-13T10:00:00')
      expect(isWorkDay(monday, rule)).toBe(true)

      // Friday (2025-10-17)
      const friday = new Date('2025-10-17T10:00:00')
      expect(isWorkDay(friday, rule)).toBe(true)
    })

    test('should return false for weekends', () => {
      // Saturday (2025-10-18)
      const saturday = new Date('2025-10-18T10:00:00')
      expect(isWorkDay(saturday, rule)).toBe(false)

      // Sunday (2025-10-19)
      const sunday = new Date('2025-10-19T10:00:00')
      expect(isWorkDay(sunday, rule)).toBe(false)
    })
  })

  describe('shouldResetState', () => {
    test('should return true if lastDate is empty', () => {
      expect(shouldResetState('')).toBe(true)
    })

    test('should return true if lastDate is different from today', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const lastDate = yesterday.toISOString().split('T')[0]
      expect(shouldResetState(lastDate)).toBe(true)
    })

    test('should return false if lastDate is today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(shouldResetState(today)).toBe(false)
    })
  })

  describe('getNextReminderTime', () => {
    const rule: ReminderRule = {
      id: 'test-rule',
      name: 'Test Rule',
      enabled: true,
      workDays: [true, true, true, true, true, false, false], // Mon-Fri
      startTime: '09:00',
      interval: 15,
      deadline: '10:00',
      lateReminders: ['10:30', '11:00'],
      notificationTitle: 'Test Title',
      notificationMessage: 'Test Message',
      toastMessage: 'Test Toast',
      toastDuration: 30,
      toastClickUrl: '',
    }

    const state: DailyState = { date: '', completedRules: [] }

    test('should return current time when exactly at start time', () => {
      const now = new Date('2025-10-17T09:00:00') // Friday 09:00
      const result = getNextReminderTime(now, rule, state)

      expect(result).not.toBeNull()
      expect(result!.getHours()).toBe(9)
      expect(result!.getMinutes()).toBe(0)
    })

    test('should return current time when exactly at an interval point', () => {
      const now = new Date('2025-10-17T09:15:00') // Friday 09:15 (start + 15min)
      const result = getNextReminderTime(now, rule, state)

      expect(result).not.toBeNull()
      expect(result!.getHours()).toBe(9)
      expect(result!.getMinutes()).toBe(15)
    })

    test('should return current time when exactly at a late reminder time', () => {
      const now = new Date('2025-10-17T10:30:00') // Friday 10:30 (late reminder)
      const result = getNextReminderTime(now, rule, state)

      expect(result).not.toBeNull()
      expect(result!.getHours()).toBe(10)
      expect(result!.getMinutes()).toBe(30)
    })

    test('should return next interval when between reminder times', () => {
      const now = new Date('2025-10-17T09:05:00') // Friday 09:05 (5 min after start)
      const result = getNextReminderTime(now, rule, state)

      expect(result).not.toBeNull()
      expect(result!.getHours()).toBe(9)
      expect(result!.getMinutes()).toBe(15) // Next interval from 09:00 is 09:15
    })

    test('should return null when already sent', () => {
      const now = new Date('2025-10-17T09:00:00')
      const sentState: DailyState = { date: '', completedRules: ['test-rule'] } // 包含rule ID表示已完成
      const result = getNextReminderTime(now, rule, sentState)

      expect(result).toBeNull()
    })

    test('should return null on non-work day', () => {
      const now = new Date('2025-10-18T09:00:00') // Saturday
      const result = getNextReminderTime(now, rule, state)

      expect(result).toBeNull()
    })
  })
})
