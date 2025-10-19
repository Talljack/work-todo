import { describe, expect, test } from 'vitest'
import type { AppConfig, WorkDayConfig, ReminderRule } from '@/types'
import { DEFAULT_CONFIG } from '@/types'

/**
 * 迁移配置测试
 * 模拟 storage.ts 中的 migrateConfig 函数（更新到 v4）
 */
function migrateConfig(oldConfig: Partial<AppConfig>): AppConfig {
  const isChinese = true // 测试用

  // 如果已经是最新版本（v4），直接返回
  if (oldConfig.version && oldConfig.version >= 4 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    return {
      ...DEFAULT_CONFIG,
      ...oldConfig,
    } as AppConfig
  }

  // v3 -> v4: 将 quickLinks 转换为 toastClickUrl（取第一个链接的 URL）
  if (oldConfig.version === 3 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    const migratedRules = oldConfig.reminderRules.map((rule) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldQuickLinks = (rule as any).quickLinks || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const { quickLinks, ...ruleWithoutQuickLinks } = rule as any

      return {
        ...ruleWithoutQuickLinks,
        toastClickUrl: oldQuickLinks.length > 0 ? oldQuickLinks[0].url : '',
      }
    })

    return {
      version: 4,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    }
  }

  // v2 -> v4: 将 template.quickLinks 迁移到 toastClickUrl
  if (oldConfig.version === 2 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalQuickLinks = (oldConfig.template as any)?.quickLinks || []

    const migratedRules = oldConfig.reminderRules.map((rule) => {
      return {
        ...rule,
        toastClickUrl: globalQuickLinks.length > 0 ? globalQuickLinks[0].url : '',
      }
    })

    return {
      version: 4,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    }
  }

  // v1 -> v4: 将旧的 workDays 配置转换为一个 ReminderRule
  const reminderRules: ReminderRule[] = []

  if (oldConfig.workDays) {
    const oldWorkDays = oldConfig.workDays as WorkDayConfig
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalQuickLinks = (oldConfig.template as any)?.quickLinks || []

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
    })
  }

  const newConfig: AppConfig = {
    version: 4,
    reminderRules,
    template: {
      content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
    },
    timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
  }

  return newConfig
}

describe('Configuration Migration Tests', () => {
  describe('v1 to v4 Migration', () => {
    test('should migrate v1 config with workDays to v4 with reminderRules', () => {
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

      const migratedConfig = migrateConfig(oldConfig)

      // 验证版本号更新到 v4
      expect(migratedConfig.version).toBe(4)

      // 验证创建了一个规则
      expect(migratedConfig.reminderRules).toHaveLength(1)

      const rule = migratedConfig.reminderRules[0]

      // 验证规则字段正确迁移
      expect(rule.name).toBe('每日例行提醒')
      expect(rule.enabled).toBe(true)
      expect(rule.workDays).toEqual([true, true, true, true, true, false, false])
      expect(rule.startTime).toBe('09:00')
      expect(rule.interval).toBe(15)
      expect(rule.deadline).toBe('10:00')
      expect(rule.lateReminders).toEqual(['10:30', '11:00'])
      expect(rule.toastMessage).toBe('别忘了发送今日例行任务！')
      expect(rule.toastDuration).toBe(10)
      expect(rule.toastClickUrl).toBe('')

      // 验证新增字段有默认值
      expect(rule.notificationTitle).toBeTruthy()
      expect(rule.notificationMessage).toBeTruthy()
      expect(rule.id).toBeTruthy()

      // 验证模板和时区保留
      expect(migratedConfig.template.content).toBe('测试模板')
      expect(migratedConfig.timezone).toBe('Asia/Shanghai')
    })

    test('should keep v4 config unchanged', () => {
      const v4Config: AppConfig = {
        version: 4,
        reminderRules: [
          {
            id: 'rule-1',
            name: 'Test Rule',
            enabled: true,
            workDays: [true, true, true, true, true, false, false],
            startTime: '09:00',
            interval: 15,
            deadline: '10:00',
            lateReminders: [],
            notificationTitle: 'Test',
            notificationMessage: 'Test Message',
            toastMessage: 'Test Toast',
            toastDuration: 10,
            toastClickUrl: 'https://example.com',
          },
        ],
        template: {
          content: 'Test Template',
        },
        timezone: 'UTC',
      }

      const result = migrateConfig(v4Config)

      // 应该保持 v4 不变
      expect(result.version).toBe(4)
      expect(result.reminderRules).toHaveLength(1)
      expect(result.reminderRules[0].id).toBe('rule-1')
      expect(result.reminderRules[0].toastClickUrl).toBe('https://example.com')
      expect(result.template.content).toBe('Test Template')
    })

    test('should handle config without workDays field', () => {
      const emptyConfig: Partial<AppConfig> = {
        version: 1,
        template: {
          content: 'Empty Template',
        },
        timezone: 'UTC',
      }

      const result = migrateConfig(emptyConfig)

      expect(result.version).toBe(4)
      expect(result.reminderRules).toHaveLength(0)
      expect(result.template.content).toBe('Empty Template')
    })

    test('should migrate config with custom toast settings', () => {
      const oldConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [false, false, false, false, false, true, true], // Weekend only
          startTime: '10:00',
          interval: 30,
          deadline: '11:00',
          lateReminders: [],
          toastDuration: 20,
          toastMessage: 'Weekend reminder!',
        },
      }

      const result = migrateConfig(oldConfig)

      expect(result.reminderRules[0].workDays).toEqual([false, false, false, false, false, true, true])
      expect(result.reminderRules[0].toastDuration).toBe(20)
      expect(result.reminderRules[0].toastMessage).toBe('Weekend reminder!')
    })
  })

  describe('Backward Compatibility', () => {
    test('should preserve custom template during migration', () => {
      const oldConfig: Partial<AppConfig> = {
        version: 1,
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: [],
          toastDuration: 10,
          toastMessage: 'Test',
        },
        template: {
          content: '【昨日】\n- 完成了 A\n\n【今日】\n- 计划 B',
        },
      }

      const result = migrateConfig(oldConfig)

      expect(result.template.content).toBe('【昨日】\n- 完成了 A\n\n【今日】\n- 计划 B')
    })

    test('should preserve timezone setting', () => {
      const oldConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: [],
          toastDuration: 10,
          toastMessage: 'Test',
        },
        timezone: 'America/New_York',
      }

      const result = migrateConfig(oldConfig)

      expect(result.timezone).toBe('America/New_York')
    })
  })

  describe('Data Validation', () => {
    test('should create valid rule ID', () => {
      const oldConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: [],
          toastDuration: 10,
          toastMessage: 'Test',
        },
      }

      const result = migrateConfig(oldConfig)

      expect(result.reminderRules[0].id).toMatch(/^rule-\d+$/)
    })

    test('should set enabled to true for migrated rule', () => {
      const oldConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: [],
          toastDuration: 10,
          toastMessage: 'Test',
        },
      }

      const result = migrateConfig(oldConfig)

      expect(result.reminderRules[0].enabled).toBe(true)
    })

    test('should handle empty lateReminders array', () => {
      const oldConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: [],
          toastDuration: 10,
          toastMessage: 'Test',
        },
      }

      const result = migrateConfig(oldConfig)

      expect(result.reminderRules[0].lateReminders).toEqual([])
    })

    test('should handle multiple lateReminders', () => {
      const oldConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: ['10:30', '11:00', '11:30'],
          toastDuration: 10,
          toastMessage: 'Test',
        },
      }

      const result = migrateConfig(oldConfig)

      expect(result.reminderRules[0].lateReminders).toEqual(['10:30', '11:00', '11:30'])
    })
  })

  describe('Real-world Migration Scenarios', () => {
    test('Scenario: Default installation config', () => {
      const defaultV1Config: Partial<AppConfig> = {
        version: 1,
        workDays: {
          enabled: [true, true, true, true, true, false, false],
          startTime: '09:00',
          interval: 15,
          deadline: '10:00',
          lateReminders: ['10:30', '11:00'],
          toastDuration: 10,
          toastMessage: '别忘了发送今日例行任务！点击这里打开扩展。',
        },
        template: {
          content: '【昨日回顾】\n- \n\n【今日计划】\n- \n\n【风险与需求】\n- ',
        },
        timezone: 'Asia/Shanghai',
      }

      const result = migrateConfig(defaultV1Config)

      expect(result.version).toBe(4)
      expect(result.reminderRules).toHaveLength(1)
      expect(result.reminderRules[0].name).toBe('每日例行提醒')
      expect(result.reminderRules[0].workDays).toEqual([true, true, true, true, true, false, false])
      expect(result.reminderRules[0].toastClickUrl).toBe('')
    })

    test('Scenario: User with customized work days', () => {
      const customConfig: Partial<AppConfig> = {
        workDays: {
          enabled: [false, true, true, true, true, true, false], // Tue-Sat
          startTime: '10:00',
          interval: 20,
          deadline: '11:00',
          lateReminders: ['11:30'],
          toastDuration: 15,
          toastMessage: 'Custom message',
        },
      }

      const result = migrateConfig(customConfig)

      expect(result.reminderRules[0].workDays).toEqual([false, true, true, true, true, true, false])
      expect(result.reminderRules[0].startTime).toBe('10:00')
      expect(result.reminderRules[0].interval).toBe(20)
    })
  })
})
