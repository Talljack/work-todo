import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircledIcon, DownloadIcon, PlusIcon, ReloadIcon, TrashIcon, UploadIcon } from '@radix-ui/react-icons'
import browser from 'webextension-polyfill'
import type { AppConfig, QuickLink } from '@/types'
import { DEFAULT_CONFIG, getDefaultTemplateContent, getDefaultToastMessage } from '@/types'
import { exportConfig, getConfig, importConfig, saveConfig } from '@/utils/storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const Options: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 切换语言并自动更新模板
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)

    // 自动更新模板和 Toast 消息为新语言
    handleResetTemplate(lang)
  }

  // 重置为默认模板（根据当前语言）
  const handleResetTemplate = (language?: string) => {
    const lang = language || i18n.language
    const defaultContent = getDefaultTemplateContent(lang)
    const defaultMessage = getDefaultToastMessage(lang)
    setConfig({
      ...config,
      template: { ...config.template, content: defaultContent },
      workDays: { ...config.workDays, toastMessage: defaultMessage },
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

  // 更新工作日
  const handleWorkDayChange = (index: number) => {
    const newEnabled = [...config.workDays.enabled]
    newEnabled[index] = !newEnabled[index]
    setConfig({
      ...config,
      workDays: { ...config.workDays, enabled: newEnabled },
    })
  }

  // 添加快捷链接
  const handleAddQuickLink = () => {
    setConfig({
      ...config,
      template: {
        ...config.template,
        quickLinks: [...config.template.quickLinks, { name: '', url: '' }],
      },
    })
  }

  // 删除快捷链接
  const handleRemoveQuickLink = (index: number) => {
    const newLinks = config.template.quickLinks.filter((_, i) => i !== index)
    setConfig({
      ...config,
      template: { ...config.template, quickLinks: newLinks },
    })
  }

  // 更新快捷链接
  const handleQuickLinkChange = (index: number, field: keyof QuickLink, value: string) => {
    const newLinks = [...config.template.quickLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setConfig({
      ...config,
      template: { ...config.template, quickLinks: newLinks },
    })
  }

  // 添加迟到提醒时间
  const handleAddLateReminder = () => {
    setConfig({
      ...config,
      workDays: {
        ...config.workDays,
        lateReminders: [...config.workDays.lateReminders, '12:00'],
      },
    })
  }

  // 删除迟到提醒时间
  const handleRemoveLateReminder = (index: number) => {
    const newReminders = config.workDays.lateReminders.filter((_, i) => i !== index)
    setConfig({
      ...config,
      workDays: { ...config.workDays, lateReminders: newReminders },
    })
  }

  // 更新迟到提醒时间
  const handleLateReminderChange = (index: number, value: string) => {
    const newReminders = [...config.workDays.lateReminders]
    newReminders[index] = value
    setConfig({
      ...config,
      workDays: { ...config.workDays, lateReminders: newReminders },
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <ReloadIcon className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-40 pt-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 md:pb-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{t('options.title')}</h1>
          <p className="text-base text-gray-600 md:text-lg">{t('options.description')}</p>
        </header>

        <div className="grid gap-8">
          <Card>
            <CardHeader className="space-y-1.5">
              <CardTitle>{t('options.workDays.title')}</CardTitle>
              <CardDescription>{t('options.workDays.intervalHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t('options.workDays.selectDays')}</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={config.workDays.enabled[index] ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                      onClick={() => handleWorkDayChange(index)}
                    >
                      {t(`options.workDays.days.${day}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-time">{t('options.workDays.startTime')}</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={config.workDays.startTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        workDays: { ...config.workDays, startTime: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">{t('options.workDays.deadline')}</Label>
                  <Input
                    id="deadline"
                    type="time"
                    value={config.workDays.deadline}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        workDays: { ...config.workDays, deadline: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="interval">{t('options.workDays.interval')}</Label>
                  <Input
                    id="interval"
                    type="number"
                    min={1}
                    max={60}
                    value={config.workDays.interval}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        workDays: {
                          ...config.workDays,
                          interval: parseInt(e.target.value, 10) || 15,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">{t('options.workDays.intervalHint')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toast-duration">{t('options.workDays.toastDuration')}</Label>
                  <Input
                    id="toast-duration"
                    type="number"
                    min={5}
                    max={120}
                    value={config.workDays.toastDuration}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        workDays: {
                          ...config.workDays,
                          toastDuration: parseInt(e.target.value, 10) || 10,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">{t('options.workDays.toastDurationHint')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toast-message">{t('options.workDays.toastMessage')}</Label>
                <Textarea
                  id="toast-message"
                  rows={4}
                  value={config.workDays.toastMessage || ''}
                  placeholder={t('options.workDays.toastMessagePlaceholder')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      workDays: { ...config.workDays, toastMessage: e.target.value },
                    })
                  }
                />
                <p className="text-xs text-gray-500">{t('options.workDays.toastMessageHint')}</p>
              </div>

              <Separator className="h-px" />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>{t('options.workDays.lateReminders')}</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddLateReminder}>
                    <PlusIcon className="mr-1 h-4 w-4" />
                    {t('options.workDays.addLateReminder')}
                  </Button>
                </div>
                <div className="space-y-2">
                  {config.workDays.lateReminders.map((time, index) => (
                    <div key={`${time}-${index}`} className="flex items-center gap-3">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleLateReminderChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemoveLateReminder(index)}
                        title={t('options.workDays.remove')}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{t('options.template.title')}</CardTitle>
                <CardDescription>{t('options.template.hint')}</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => handleResetTemplate()} className="gap-2">
                <ReloadIcon className="h-4 w-4" />
                {t('options.template.reset')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
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
                rows={10}
                className="font-mono text-sm"
                placeholder={t('options.template.placeholder')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{t('options.quickLinks.title')}</CardTitle>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddQuickLink} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                {t('options.quickLinks.add')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.template.quickLinks.length === 0 && (
                <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  {t('options.quickLinks.empty')}
                </div>
              )}

              {config.template.quickLinks.map((link, index) => (
                <div
                  key={`${link.url}-${index}`}
                  className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`quick-link-name-${index}`}>{t('options.quickLinks.namePlaceholder')}</Label>
                      <Input
                        id={`quick-link-name-${index}`}
                        value={link.name}
                        placeholder={t('options.quickLinks.namePlaceholder')}
                        onChange={(e) => handleQuickLinkChange(index, 'name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`quick-link-url-${index}`}>{t('options.quickLinks.urlPlaceholder')}</Label>
                      <Input
                        id={`quick-link-url-${index}`}
                        type="url"
                        value={link.url}
                        placeholder={t('options.quickLinks.urlPlaceholder')}
                        onChange={(e) => handleQuickLinkChange(index, 'url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-end md:justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRemoveQuickLink(index)}
                      title={t('options.quickLinks.remove')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('options.other.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('options.other.language')}</Label>
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
                <p className="text-xs text-gray-500">{t('options.other.languageHint')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">{t('options.other.timezone')}</Label>
                <Input id="timezone" type="text" value={config.timezone} disabled />
                <p className="text-xs text-gray-500">{t('options.other.timezoneHint')}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 bg-gray-50/50 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                className="flex-1 gap-2 border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow sm:flex-initial"
              >
                <DownloadIcon className="h-4 w-4" />
                {t('options.other.export')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleImport}
                className="flex-1 gap-2 border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow sm:flex-initial"
              >
                <UploadIcon className="h-4 w-4" />
                {t('options.other.import')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex-1">
            {saved && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 transition-all animate-in fade-in-0 slide-in-from-bottom-2">
                <CheckCircledIcon className="h-5 w-5 flex-shrink-0" />
                <span>{t('options.save.success')}</span>
              </div>
            )}
          </div>
          <Button type="button" size="lg" onClick={handleSave} disabled={saving} className="min-w-[140px] shadow-sm">
            {saving && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? t('options.save.saving') : t('options.save.button')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Options
