import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircledIcon,
  DownloadIcon,
  GearIcon,
  ReloadIcon,
  RocketIcon,
  UploadIcon,
  TrashIcon,
  ResetIcon,
} from '@radix-ui/react-icons'
import browser from 'webextension-polyfill'
import type { AppConfig, TimeFormat } from '@/types'
import { DEFAULT_CONFIG, getDefaultTemplateContent } from '@/types'
import { exportConfig, getConfig, importConfig, saveConfig } from '@/utils/storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Statistics from '@/components/Statistics'
import ReminderRulesManager from '@/components/ReminderRulesManager'

type NavigationSection = 'general' | 'rules' | 'template' | 'statistics'

const Options: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<NavigationSection>('general')
  const [version, setVersion] = useState('1.0.0')
  const configRef = useRef<AppConfig>(config) // 保存最新的 config 引用

  // 更新 config 的辅助函数，同时更新 state 和 ref
  const updateConfig = (newConfig: AppConfig) => {
    configRef.current = newConfig // 立即同步更新 ref
    setConfig(newConfig) // 异步更新 state
  }

  // 获取扩展版本号
  useEffect(() => {
    const manifest = browser.runtime.getManifest()
    setVersion(manifest.version)
  }, [])

  // 切换语言并自动保存
  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)

    // 自动更新模板为新语言
    const defaultContent = getDefaultTemplateContent(lang)
    const newConfig = {
      ...configRef.current,
      template: { ...configRef.current.template, content: defaultContent },
    }
    updateConfig(newConfig)

    // 自动保存
    await saveConfig(newConfig)
    await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
  }

  const handleTimeFormatChange = async (format: TimeFormat) => {
    const newConfig = {
      ...configRef.current,
      timeFormat: format,
    }
    updateConfig(newConfig)
    await saveConfig(newConfig)
  }

  // 重置为默认模板（根据当前语言）
  const handleResetTemplate = async (language?: string) => {
    const lang = language || i18n.language
    const defaultContent = getDefaultTemplateContent(lang)
    const newConfig = {
      ...configRef.current,
      template: { ...configRef.current.template, content: defaultContent },
    }
    updateConfig(newConfig)

    // 自动保存
    await saveConfig(newConfig)
    await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
  }

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await getConfig()
        updateConfig(cfg)
      } catch (error) {
        console.error('Failed to load config:', error)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  // 自动保存模板内容（防抖）
  useEffect(() => {
    if (loading) return // 避免初次加载时保存

    const timeoutId = setTimeout(async () => {
      try {
        // 使用 ref 获取最新的 config，避免保存闭包中的旧快照
        await saveConfig(configRef.current)
        await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
      } catch (error) {
        console.error('Failed to auto-save template:', error)
      }
    }, 1000) // 1秒防抖

    return () => clearTimeout(timeoutId)
  }, [config.template.content, loading])

  // 导出配置
  const handleExport = async () => {
    try {
      const json = await exportConfig()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `work-todo-config-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export config:', error)
      alert(t('options.export.error'))
    }
  }

  // 导入配置
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        await importConfig(text)
        const newConfig = await getConfig()
        updateConfig(newConfig)
        alert(t('options.import.success'))
        // 重新初始化闹钟
        await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
      } catch (error) {
        console.error('Failed to import config:', error)
        alert(t('options.import.error'))
      }
    }
    input.click()
  }

  // 重置所有设置
  const handleResetSettings = async () => {
    if (
      confirm(
        t('options.reset.confirm', 'Are you sure you want to reset all settings to default? This cannot be undone.'),
      )
    ) {
      try {
        await saveConfig(DEFAULT_CONFIG)
        updateConfig(DEFAULT_CONFIG)
        await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
        alert(t('options.reset.success', 'Settings have been reset to default'))
      } catch (error) {
        console.error('Failed to reset settings:', error)
        alert(t('options.reset.error', 'Failed to reset settings'))
      }
    }
  }

  // 清除缓存（清除本地存储的状态数据）
  const handleClearCache = async () => {
    if (confirm(t('options.clearCache.confirm', 'Clear all cached data? This will reset daily state and history.'))) {
      try {
        await browser.storage.local.clear()
        alert(t('options.clearCache.success', 'Cache cleared successfully'))
        window.location.reload()
      } catch (error) {
        console.error('Failed to clear cache:', error)
        alert(t('options.clearCache.error', 'Failed to clear cache'))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <ReloadIcon className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // 导航菜单项
  const navItems: { id: NavigationSection; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: t('options.nav.general', 'General'), icon: <GearIcon className="h-4 w-4" /> },
    { id: 'rules', label: t('options.nav.rules', 'Reminder Rules'), icon: <RocketIcon className="h-4 w-4" /> },
    { id: 'template', label: t('options.nav.template', 'Template'), icon: <CheckCircledIcon className="h-4 w-4" /> },
    {
      id: 'statistics',
      label: t('options.nav.statistics', 'Statistics'),
      icon: <CheckCircledIcon className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 左侧导航栏 */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm">
        <div className="sticky top-0 p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900">Routine Reminder</h1>
            <p className="text-sm text-slate-500">Reminder Settings</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full justify-start gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              {t('options.other.export')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="w-full justify-start gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              {t('options.other.import')}
            </Button>
          </div>

          {/* 版本号 */}
          <div className="mt-auto pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">v{version}</p>
          </div>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-auto">
        {/* 右上角操作按钮 */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-8 py-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <TrashIcon className="h-4 w-4" />
              {t('options.clearCache.button', 'Clear Cache')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
              className="gap-2 text-slate-600 hover:text-red-600"
            >
              <ResetIcon className="h-4 w-4" />
              {t('options.reset.button', 'Reset')}
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl p-8">
          {/* General Section */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('options.nav.general', 'General')}</h2>
                <p className="text-sm text-slate-500">
                  {t('options.general.description', 'Configure general settings')}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('options.other.language')}</CardTitle>
                  <CardDescription>{t('options.other.languageHint')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={i18n.language.startsWith('zh') ? 'zh' : 'en'}
                    onValueChange={(value) => handleLanguageChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('options.other.timezone')}</Label>
                    <Input id="timezone" type="text" value={config.timezone} disabled />
                    <p className="text-xs text-slate-500">{t('options.other.timezoneHint')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-format">{t('options.other.timeFormat')}</Label>
                    <Select
                      value={config.timeFormat}
                      onValueChange={(value) => handleTimeFormatChange(value as TimeFormat)}
                    >
                      <SelectTrigger id="time-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">{t('options.other.timeFormat24', '24-hour')}</SelectItem>
                        <SelectItem value="12h">{t('options.other.timeFormat12', '12-hour')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">{t('options.other.timeFormatHint')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reminder Rules Section */}
          {activeSection === 'rules' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('options.nav.rules', 'Reminder Rules')}</h2>
                <p className="text-sm text-slate-500">
                  {t(
                    'options.rules.description',
                    'Manage your reminder rules. You can create multiple rules for different purposes.',
                  )}
                </p>
              </div>

              <ReminderRulesManager
                rules={config.reminderRules}
                onChange={(rules) => updateConfig({ ...configRef.current, reminderRules: rules })}
                onSave={async (updatedRules) => {
                  // 自动保存规则变更到 storage
                  const newConfig = { ...configRef.current, reminderRules: updatedRules }
                  await saveConfig(newConfig)
                  // 通知后台重新初始化
                  await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
                }}
                timeFormat={config.timeFormat}
              />
            </div>
          )}

          {/* Template Section */}
          {activeSection === 'template' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t('options.template.title')}</h2>
                  <p className="text-sm text-slate-500">{t('options.template.hint')}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetTemplate()}
                  className="gap-2"
                >
                  <ReloadIcon className="h-4 w-4" />
                  {t('options.template.reset')}
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Label htmlFor="template-content">{t('options.template.content')}</Label>
                  <Textarea
                    id="template-content"
                    value={config.template.content}
                    onChange={(e) =>
                      updateConfig({
                        ...configRef.current,
                        template: { ...configRef.current.template, content: e.target.value },
                      })
                    }
                    rows={12}
                    className="font-mono text-sm"
                    placeholder={t('options.template.placeholder')}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Statistics Section */}
          {activeSection === 'statistics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('options.tabs.statistics', 'Statistics')}</h2>
                <p className="text-sm text-slate-500">Track your completion rate and streaks</p>
              </div>
              <Statistics />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Options
