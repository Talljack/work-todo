import browser from 'webextension-polyfill'
import type { AppConfig, AppData, DailyState, HistoryRecord, Statistics, WorkDayConfig, ReminderRule } from '@/types'
import {
  DEFAULT_APP_DATA,
  DEFAULT_CONFIG,
  DEFAULT_DAILY_STATE,
  getDefaultTemplateContent,
  createDefaultReminderRule,
} from '@/types'

const STORAGE_KEYS = {
  CONFIG: 'app_config',
  DAILY_STATE: 'daily_state',
  APP_DATA: 'app_data',
} as const

/**
 * 迁移旧配置到新版本
 */
function migrateConfig(oldConfig: Partial<AppConfig>): AppConfig {
  const currentLang =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null) ||
    (typeof navigator !== 'undefined' ? navigator.language : 'en')
  const isChinese = currentLang.startsWith('zh')

  // 如果已经是最新版本（v5），直接返回
  if (oldConfig.version && oldConfig.version >= 5 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    return {
      ...DEFAULT_CONFIG,
      ...oldConfig,
    } as AppConfig
  }

  // v4 -> v5: 为每个规则添加 templateContent 字段（如果没有的话）
  if (oldConfig.version === 4 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    console.log('[migrateConfig] Migrating from v4 to v5')

    const migratedRules = oldConfig.reminderRules.map((rule) => {
      return {
        ...rule,
        // 如果规则没有 templateContent，使用全局模板作为默认值
        templateContent: rule.templateContent || oldConfig.template?.content || getDefaultTemplateContent(currentLang),
      }
    })

    const newConfig: AppConfig = {
      version: 5,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    }

    console.log('[migrateConfig] v4 -> v5 migration complete', newConfig)
    return newConfig
  }

  // v3 -> v4: 将 quickLinks 转换为 toastClickUrl（取第一个链接的 URL）
  if (oldConfig.version === 3 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    console.log('[migrateConfig] Migrating from v3 to v5')

    const migratedRules = oldConfig.reminderRules.map((rule) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldQuickLinks = (rule as any).quickLinks || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const { quickLinks, ...ruleWithoutQuickLinks } = rule as any

      return {
        ...ruleWithoutQuickLinks,
        toastClickUrl: oldQuickLinks.length > 0 ? oldQuickLinks[0].url : '',
        templateContent: oldConfig.template?.content || getDefaultTemplateContent(currentLang),
      }
    })

    const newConfig: AppConfig = {
      version: 5,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    }

    console.log('[migrateConfig] v3 -> v5 migration complete', newConfig)
    return newConfig
  }

  // v2 -> v3 -> v5: 将 template.quickLinks 迁移到 toastClickUrl
  if (oldConfig.version === 2 && oldConfig.reminderRules && oldConfig.reminderRules.length > 0) {
    console.log('[migrateConfig] Migrating from v2 to v5')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalQuickLinks = (oldConfig.template as any)?.quickLinks || []

    const migratedRules = oldConfig.reminderRules.map((rule) => {
      return {
        ...rule,
        toastClickUrl: globalQuickLinks.length > 0 ? globalQuickLinks[0].url : '',
        templateContent: oldConfig.template?.content || getDefaultTemplateContent(currentLang),
      }
    })

    return {
      version: 5,
      reminderRules: migratedRules,
      template: {
        content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
      },
      timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
    }
  }

  // v1 -> v5: 将旧的 workDays 配置转换为一个 ReminderRule
  console.log('[migrateConfig] Migrating from v1 to v5')

  const reminderRules: ReminderRule[] = []

  if (oldConfig.workDays) {
    const oldWorkDays = oldConfig.workDays as WorkDayConfig
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalQuickLinks = (oldConfig.template as any)?.quickLinks || []

    reminderRules.push({
      id: `rule-${Date.now()}`,
      name: isChinese ? '工作计划提醒' : 'Work Plan Reminder',
      enabled: true,
      workDays: oldWorkDays.enabled,
      startTime: oldWorkDays.startTime,
      interval: oldWorkDays.interval,
      deadline: oldWorkDays.deadline,
      lateReminders: oldWorkDays.lateReminders,
      notificationTitle: isChinese ? '提醒：发送今日 TODO' : "Reminder: Send Today's TODO",
      notificationMessage: isChinese
        ? '别忘了发送今日工作计划！点击打开扩展。'
        : "Don't forget to send your daily work plan! Click to open.",
      toastMessage:
        oldWorkDays.toastMessage || (isChinese ? '别忘了发送今日工作计划！' : "Don't forget to send your work plan!"),
      toastDuration: oldWorkDays.toastDuration || 10,
      toastClickUrl: globalQuickLinks.length > 0 ? globalQuickLinks[0].url : '',
      templateContent: oldConfig.template?.content || getDefaultTemplateContent(currentLang),
    })
  } else {
    // 如果没有旧配置，使用默认规则
    reminderRules.push(createDefaultReminderRule(currentLang))
  }

  const newConfig: AppConfig = {
    version: 5,
    reminderRules,
    template: {
      content: oldConfig.template?.content || DEFAULT_CONFIG.template.content,
    },
    timezone: oldConfig.timezone || DEFAULT_CONFIG.timezone,
  }

  console.log('[migrateConfig] Migration complete', newConfig)
  return newConfig
}

/**
 * 检测模板语言是否匹配当前界面语言
 */
function isTemplateMismatch(template: string, currentLang: string): boolean {
  const isChinese = currentLang.startsWith('zh')
  const hasChineseContent = template.includes('【') || template.includes('】')
  return isChinese !== hasChineseContent
}

/**
 * 获取应用配置
 */
export async function getConfig(): Promise<AppConfig> {
  try {
    const result = await browser.storage.sync.get(STORAGE_KEYS.CONFIG)
    const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null
    const currentLang = savedLang || (typeof navigator !== 'undefined' ? navigator.language : 'en')

    if (result[STORAGE_KEYS.CONFIG]) {
      const saved = result[STORAGE_KEYS.CONFIG] as Partial<AppConfig>

      // 迁移旧配置
      const config = migrateConfig(saved)

      // 如果是迁移的配置，自动保存新格式
      if (!saved.version || saved.version < 5) {
        console.log('[getConfig] Saving migrated config')
        await saveConfig(config)
      }

      // 检查模板语言是否匹配，不匹配则自动更新
      if (isTemplateMismatch(config.template.content, currentLang)) {
        console.log('[getConfig] Template language mismatch detected!')
        console.log('  Current language:', currentLang)
        console.log('  Template has Chinese?:', config.template.content.includes('【'))
        console.log('  → Auto-updating template')

        config.template.content = getDefaultTemplateContent(currentLang)

        // 自动保存更新后的配置
        await saveConfig(config)
      }

      return config
    }

    // 首次使用：根据当前语言设置生成默认配置
    console.log('[getConfig] First time use, language:', currentLang)
    console.log('[getConfig] Using template:', getDefaultTemplateContent(currentLang).substring(0, 50))

    const defaultConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      template: {
        ...DEFAULT_CONFIG.template,
        content: getDefaultTemplateContent(currentLang),
      },
    }

    return defaultConfig
  } catch (error) {
    console.error('Failed to get config:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * 保存应用配置
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    await browser.storage.sync.set({
      [STORAGE_KEYS.CONFIG]: config,
    })
  } catch (error) {
    console.error('Failed to save config:', error)
    throw error
  }
}

/**
 * 获取当日状态（使用 local storage 避免跨设备同步冲突）
 */
export async function getDailyState(): Promise<DailyState> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEYS.DAILY_STATE)
    if (result[STORAGE_KEYS.DAILY_STATE]) {
      return result[STORAGE_KEYS.DAILY_STATE] as DailyState
    }
    return DEFAULT_DAILY_STATE
  } catch (error) {
    console.error('Failed to get daily state:', error)
    return DEFAULT_DAILY_STATE
  }
}

/**
 * 保存当日状态
 */
export async function saveDailyState(state: DailyState): Promise<void> {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.DAILY_STATE]: state,
    })
  } catch (error) {
    console.error('Failed to save daily state:', error)
    throw error
  }
}

/**
 * 标记今日已发送
 */
export async function markAsSent(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  // 更新每日状态
  await saveDailyState({
    date: today,
    sent: true,
    lastRemindTime: now,
  })

  // 添加到历史记录
  await addHistoryRecord(today, true, now)
}

/**
 * 重置当日状态
 */
export async function resetDailyState(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await saveDailyState({
    date: today,
    sent: false,
  })
}

/**
 * 导出配置为 JSON
 */
export async function exportConfig(): Promise<string> {
  const config = await getConfig()
  return JSON.stringify(config, null, 2)
}

/**
 * 从 JSON 导入配置
 */
export async function importConfig(jsonString: string): Promise<void> {
  try {
    const imported = JSON.parse(jsonString) as Partial<AppConfig>

    // 迁移旧配置
    const config = migrateConfig(imported)

    // 验证配置结构
    if (!config.reminderRules || !config.template) {
      throw new Error('Invalid config format')
    }

    await saveConfig(config)
  } catch (error) {
    console.error('Failed to import config:', error)
    throw error
  }
}

/**
 * 监听配置变化
 */
export function onConfigChanged(callback: (newConfig: AppConfig, oldConfig: AppConfig) => void): void {
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes[STORAGE_KEYS.CONFIG]) {
      const newConfig = changes[STORAGE_KEYS.CONFIG].newValue as AppConfig
      const oldConfig = changes[STORAGE_KEYS.CONFIG].oldValue as AppConfig
      if (newConfig && oldConfig) {
        callback(newConfig, oldConfig)
      }
    }
  })
}

/**
 * 获取应用数据（历史记录等）
 */
export async function getAppData(): Promise<AppData> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEYS.APP_DATA)
    if (result[STORAGE_KEYS.APP_DATA]) {
      return result[STORAGE_KEYS.APP_DATA] as AppData
    }
    // 首次使用，初始化数据
    const initialData: AppData = {
      ...DEFAULT_APP_DATA,
      installDate: new Date().toISOString(),
    }
    await saveAppData(initialData)
    return initialData
  } catch (error) {
    console.error('Failed to get app data:', error)
    return DEFAULT_APP_DATA
  }
}

/**
 * 保存应用数据
 */
export async function saveAppData(data: AppData): Promise<void> {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.APP_DATA]: data,
    })
  } catch (error) {
    console.error('Failed to save app data:', error)
    throw error
  }
}

/**
 * 添加历史记录
 */
export async function addHistoryRecord(date: string, sent: boolean, sentAt?: string): Promise<void> {
  const appData = await getAppData()

  // 检查是否已存在该日期的记录
  const existingIndex = appData.history.findIndex((record) => record.date === date)

  const newRecord: HistoryRecord = {
    date,
    sent,
    sentAt,
  }

  if (existingIndex >= 0) {
    // 更新现有记录
    appData.history[existingIndex] = newRecord
  } else {
    // 添加新记录
    appData.history.push(newRecord)
  }

  // 按日期降序排序
  appData.history.sort((a, b) => b.date.localeCompare(a.date))

  // 只保留最近90天的记录
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0]

  appData.history = appData.history.filter((record) => record.date >= cutoffDate)

  await saveAppData(appData)
}

/**
 * 合并所有启用规则的工作日
 * 返回工作日索引数组 [0=Monday, 6=Sunday]
 */
function getMergedWorkDays(config: AppConfig): number[] {
  const merged = [false, false, false, false, false, false, false]

  // 合并所有启用规则的工作日（任意一个规则启用该天即算工作日）
  for (const rule of config.reminderRules) {
    if (rule.enabled) {
      rule.workDays.forEach((enabled, index) => {
        if (enabled) merged[index] = true
      })
    }
  }

  // 转换为索引数组
  return merged.map((enabled, index) => (enabled ? index : -1)).filter((index) => index !== -1)
}

/**
 * 计算统计数据
 */
export async function getStatistics(): Promise<Statistics> {
  const appData = await getAppData()
  const config = await getConfig()
  const history = appData.history

  if (history.length === 0) {
    return {
      totalDays: 0,
      completedDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      weeklyCompletionRate: 0,
      monthlyCompletionRate: 0,
    }
  }

  // 计算总天数和完成天数（只统计工作日）
  const workDayIndices = getMergedWorkDays(config)

  let totalDays = 0
  let completedDays = 0

  for (const record of history) {
    const date = new Date(record.date)
    const dayOfWeek = (date.getDay() + 6) % 7 // 转换为 0=周一, 6=周日

    if (workDayIndices.includes(dayOfWeek)) {
      totalDays++
      if (record.sent) {
        completedDays++
      }
    }
  }

  // 计算连续天数
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date().toISOString().split('T')[0]
  const checkDate = new Date(today)

  // 计算当前连续天数
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const dayOfWeek = (checkDate.getDay() + 6) % 7

    // 只检查工作日
    if (workDayIndices.includes(dayOfWeek)) {
      const record = history.find((r) => r.date === dateStr)
      if (record && record.sent) {
        currentStreak++
      } else {
        break
      }
    }

    checkDate.setDate(checkDate.getDate() - 1)

    // 最多检查90天
    if (currentStreak > 90) break
  }

  // 计算最长连续天数
  for (let i = 0; i < history.length; i++) {
    const record = history[i]
    const date = new Date(record.date)
    const dayOfWeek = (date.getDay() + 6) % 7

    if (workDayIndices.includes(dayOfWeek)) {
      if (record.sent) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
  }

  // 计算本周完成率
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1))
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const weekRecords = history.filter((r) => r.date >= weekStartStr)
  let weekTotal = 0
  let weekCompleted = 0

  for (const record of weekRecords) {
    const date = new Date(record.date)
    const dayOfWeek = (date.getDay() + 6) % 7

    if (workDayIndices.includes(dayOfWeek)) {
      weekTotal++
      if (record.sent) weekCompleted++
    }
  }

  // 计算本月完成率
  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  const monthRecords = history.filter((r) => r.date >= monthStartStr)
  let monthTotal = 0
  let monthCompleted = 0

  for (const record of monthRecords) {
    const date = new Date(record.date)
    const dayOfWeek = (date.getDay() + 6) % 7

    if (workDayIndices.includes(dayOfWeek)) {
      monthTotal++
      if (record.sent) monthCompleted++
    }
  }

  return {
    totalDays,
    completedDays,
    currentStreak,
    longestStreak,
    completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
    weeklyCompletionRate: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
    monthlyCompletionRate: monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0,
  }
}
