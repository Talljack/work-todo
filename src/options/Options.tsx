import React, { useEffect, useState } from 'react'
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
import type { AppConfig } from '@/types'
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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<NavigationSection>('general')
  const [version, setVersion] = useState('1.0.0')

  // 获取扩展版本号
  useEffect(() => {
    const manifest = browser.runtime.getManifest()
    setVersion(manifest.version)
  }, [])

  // 切换语言并自动更新模板
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)

    // 自动更新模板为新语言
    handleResetTemplate(lang)
  }

  // 重置为默认模板（根据当前语言）
  const handleResetTemplate = (language?: string) => {
    const lang = language || i18n.language
    const defaultContent = getDefaultTemplateContent(lang)
    setConfig({
      ...config,
      template: { ...config.template, content: defaultContent },
    })
  }

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await getConfig()
        setConfig(cfg)
      } catch (error) {
        console.error('Failed to load config:', error)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  // 保存配置
  const handleSave = async () => {
    setSaving(true)
    try {
      await saveConfig(config)
      // 通知后台重新初始化
      await browser.runtime.sendMessage({ type: 'REINIT_ALARMS' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save config:', error)
      alert(t('options.save.error'))
    } finally {
      setSaving(false)
    }
  }

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
        setConfig(newConfig)
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
        setConfig(DEFAULT_CONFIG)
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
            <h1 className="text-xl font-bold text-slate-900">Work TODO</h1>
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
                onChange={(rules) => setConfig({ ...config, reminderRules: rules })}
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
                      setConfig({
                        ...config,
                        template: { ...config.template, content: e.target.value },
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

        {/* 固定底部保存按钮 */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="mx-auto max-w-4xl px-8 py-4 flex items-center justify-between">
            <div className="flex-1">
              {saved && (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircledIcon className="h-5 w-5" />
                  <span>{t('options.save.success')}</span>
                </div>
              )}
            </div>
            <Button type="button" size="lg" onClick={handleSave} disabled={saving} className="min-w-[140px]">
              {saving && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? t('options.save.saving') : t('options.save.button')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Options
