import { describe, expect, test } from 'vitest'
import type { AppConfig, ReminderRule, WorkDayConfig } from '@/types'
import { DEFAULT_CONFIG } from '@/types'

type LegacyRule = ReminderRule & { quickLinks?: Array<{ url: string }> }
type LegacyTemplate = { quickLinks?: Array<{ url: string }> }

const ensureTimeFormat = (format?: AppConfig['timeFormat']): AppConfig['timeFormat'] =>
  format === '12h' ? '12h' : '24h'

function migrateConfig(oldConfig: Partial<AppConfig>): AppConfig {
  const isChinese = true

  if (oldConfig.version && oldConfig.version >= 6 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    return {
      ...DEFAULT_CONFIG,
      ...oldConfig,
      timeFormat: ensureTimeFormat(oldConfig.timeFormat),
    } as AppConfig
  }

  if (oldConfig.version === 5 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    return {
      ...oldConfig,
      version: 6,
      timeFormat: ensureTimeFormat(oldConfig.timeFormat),
      reminderRules: oldConfig.reminderRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    } as AppConfig
  }

  if (oldConfig.version === 3 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    const migrateRule = (rule: LegacyRule): ReminderRule => {
      const { quickLinks, ...rest } = rule
      return {
        ...rest,
        toastClickUrl: quickLinks && quickLinks.length > 0 ? quickLinks[0].url : '',
      }
    }

    const migratedRules = (oldConfig.reminderRules as LegacyRule[]).map((rule) => migrateRule(rule))

    return {
      version: 6,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
      timeFormat: ensureTimeFormat(oldConfig.timeFormat),
    }
  }

  if (oldConfig.version === 2 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    const migrateRule = (rule: LegacyRule): ReminderRule => {
      const { quickLinks, ...rest } = rule
      return {
        ...rest,
        toastClickUrl: quickLinks && quickLinks.length > 0 ? quickLinks[0].url : '',
      }
    }

    const migratedRules = (oldConfig.reminderRules as LegacyRule[]).map((rule) => migrateRule(rule))

    return {
      version: 6,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
      timeFormat: ensureTimeFormat(oldConfig.timeFormat),
    }
  }

  const reminderRules: ReminderRule[] = []

  if (oldConfig.workDays) {
    const oldWorkDays = oldConfig.workDays as WorkDayConfig
    const globalQuickLinks = (oldConfig.template as LegacyTemplate | undefined)?.quickLinks || []

    reminderRules.push({
      id: `rule-${Date.now()}`,
      name: isChinese ? '每日例行提醒' : 'Daily Routine Reminder',
      enabled: true,
      workDays: oldWorkDays.enabled,
      startTime: oldWorkDays.startTime,
      interval: oldWorkDays.interval,
      deadline: oldWorkDays.deadline,
      lateReminders: oldWorkDays.lateReminders,
      notificationTitle: isChinese ? '提醒：今日例行检查' : 'Reminder: Daily routine check-in',
      notificationMessage: isChinese
        ? '别忘了今天的例行任务！点击查看详情。'
        : "It's time for your daily routine. Click to review.",
      toastMessage:
        oldWorkDays.toastMessage || (isChinese ? '别忘了完成今日例行任务！' : "Don't forget today's routine!"),
      toastDuration: oldWorkDays.toastDuration || 10,
      toastClickUrl: globalQuickLinks.length > 0 ? globalQuickLinks[0].url : '',
      templateContent: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
    })
  }

  const newConfig: AppConfig = {
    version: 6,
    reminderRules,
    template: {
      content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
    },
    timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    timeFormat: ensureTimeFormat(oldConfig.timeFormat),
  }

  return newConfig
}

describe('Configuration Migration Tests', () => {
  test('migrates v1 config to v6 with defaults', () => {
    const oldConfig: Partial<AppConfig> = {
      version: 1,
      workDays: {
        enabled: [true, true, true, true, true, false, false],
        startTime: '09:00',
        interval: 15,
        deadline: '10:00',
        lateReminders: ['10:30', '11:00'],
        toastDuration: 10,
        toastMessage: '别忘了发送今日例行任务！',
      },
      template: {
        content: '测试模板',
      },
      timezone: 'Asia/Shanghai',
    }

    const migrated = migrateConfig(oldConfig)

    expect(migrated.version).toBe(6)
    expect(migrated.timeFormat).toBe('24h')
    expect(migrated.reminderRules).toHaveLength(1)
    expect(migrated.template.content).toBe('测试模板')
    expect(migrated.timezone).toBe('Asia/Shanghai')
  })

  test('retains existing v6 config', () => {
    const config: AppConfig = {
      version: 6,
      reminderRules: [
        {
          id: 'rule-1',
          name: 'Rule',
          enabled: true,
          workDays: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: [],
          notificationTitle: 'Title',
          notificationMessage: 'Message',
          toastMessage: 'Toast',
          toastDuration: 10,
          toastClickUrl: '',
          templateContent: 'Template',
        },
      ],
      template: {
        content: '模板',
      },
      timezone: 'Asia/Shanghai',
      timeFormat: '12h',
    }

    const migrated = migrateConfig(config)
    expect(migrated.version).toBe(6)
    expect(migrated.timeFormat).toBe('12h')
    expect(migrated.reminderRules).toHaveLength(1)
  })
})
