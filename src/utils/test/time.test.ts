import { describe, expect, test } from 'vitest'
import { parseTime, formatTime, isWorkDay, shouldResetState, getCurrentMinutes, createDateFromMinutes } from '../time'
import type { WorkDayConfig } from '@/types'

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
    test('should format date to HH:mm', () => {
      const date = new Date('2025-10-16T09:30:00')
      expect(formatTime(date)).toBe('09:30')

      const date2 = new Date('2025-10-16T23:05:00')
      expect(formatTime(date2)).toBe('23:05')
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
    const config: WorkDayConfig = {
      enabled: [true, true, true, true, true, false, false], // Mon-Fri
      startTime: '09:00',
      interval: 15,
      deadline: '10:00',
      lateReminders: [],
    }

    test('should return true for workdays', () => {
      // Monday (2025-10-13)
      const monday = new Date('2025-10-13T10:00:00')
      expect(isWorkDay(monday, config)).toBe(true)

      // Friday (2025-10-17)
      const friday = new Date('2025-10-17T10:00:00')
      expect(isWorkDay(friday, config)).toBe(true)
    })

    test('should return false for weekends', () => {
      // Saturday (2025-10-18)
      const saturday = new Date('2025-10-18T10:00:00')
      expect(isWorkDay(saturday, config)).toBe(false)

      // Sunday (2025-10-19)
      const sunday = new Date('2025-10-19T10:00:00')
      expect(isWorkDay(sunday, config)).toBe(false)
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
})
