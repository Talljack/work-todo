import browser from 'webextension-polyfill'
import type { AppConfig, DailyState } from '@/types'
import { DEFAULT_CONFIG, DEFAULT_DAILY_STATE, getDefaultTemplateContent, getDefaultToastMessage } from '@/types'

const STORAGE_KEYS = {
  CONFIG: 'app_config',
  DAILY_STATE: 'daily_state',
} as const

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
    const currentLang = savedLang || navigator.language

    if (result[STORAGE_KEYS.CONFIG]) {
      const saved = result[STORAGE_KEYS.CONFIG] as Partial<AppConfig>
      const config = {
        ...DEFAULT_CONFIG,
        ...saved,
      } as AppConfig

      // 检查模板语言是否匹配，不匹配则自动更新
      if (isTemplateMismatch(config.template.content, currentLang)) {
        console.log('[getConfig] Template language mismatch detected!')
        console.log('  Current language:', currentLang)
        console.log('  Template has Chinese?:', config.template.content.includes('【'))
        console.log('  → Auto-updating template and toast message')

        config.template.content = getDefaultTemplateContent(currentLang)
        config.workDays.toastMessage = getDefaultToastMessage(currentLang)

        // 自动保存更新后的配置
        await saveConfig(config)
      }

      return config
    }

    // 首次使用：根据当前语言设置生成默认配置
    console.log('[getConfig] First time use, language:', currentLang)
    console.log('[getConfig] Using template:', getDefaultTemplateContent(currentLang).substring(0, 50))

    return {
      ...DEFAULT_CONFIG,
      template: {
        ...DEFAULT_CONFIG.template,
        content: getDefaultTemplateContent(currentLang),
      },
      workDays: {
        ...DEFAULT_CONFIG.workDays,
        toastMessage: getDefaultToastMessage(currentLang),
      },
    }
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
  await saveDailyState({
    date: today,
    sent: true,
    lastRemindTime: new Date().toISOString(),
  })
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
    const config = JSON.parse(jsonString) as AppConfig
    // 验证配置结构
    if (!config.workDays || !config.template) {
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
