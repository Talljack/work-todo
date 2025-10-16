import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import browser from 'webextension-polyfill'
import type { AppConfig, QuickLink } from '@/types'
import { DEFAULT_CONFIG } from '@/types'
import { getConfig, saveConfig, exportConfig, importConfig } from '@/utils/storage'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const Options: React.FC = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('options.title')}</h1>
          <p className="text-gray-600">{t('options.description')}</p>
        </div>

        {/* 工作日与时间设置 */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('options.workDays.title')}</h2>

          {/* 工作日选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('options.workDays.selectDays')}</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => handleWorkDayChange(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    config.workDays.enabled[index]
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t(`options.workDays.days.${day}`)}
                </button>
              ))}
            </div>
          </div>

          {/* 时间设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('options.workDays.startTime')}</label>
              <input
                type="time"
                value={config.workDays.startTime}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    workDays: { ...config.workDays, startTime: e.target.value },
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('options.workDays.deadline')}</label>
              <input
                type="time"
                value={config.workDays.deadline}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    workDays: { ...config.workDays, deadline: e.target.value },
                  })
                }
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('options.workDays.interval')}</label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.workDays.interval}
              onChange={(e) =>
                setConfig({
                  ...config,
                  workDays: { ...config.workDays, interval: parseInt(e.target.value) || 15 },
                })
              }
              className="input-field max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">{t('options.workDays.intervalHint')}</p>
          </div>

          {/* 迟到提醒时间 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">{t('options.workDays.lateReminders')}</label>
              <button
                onClick={handleAddLateReminder}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + {t('options.workDays.addLateReminder')}
              </button>
            </div>
            <div className="space-y-2">
              {config.workDays.lateReminders.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleLateReminderChange(index, e.target.value)}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => handleRemoveLateReminder(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title={t('options.workDays.remove')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TODO 模板设置 */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('options.template.title')}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('options.template.content')}</label>
            <textarea
              value={config.template.content}
              onChange={(e) =>
                setConfig({
                  ...config,
                  template: { ...config.template, content: e.target.value },
                })
              }
              rows={10}
              className="input-field font-mono text-sm"
              placeholder={t('options.template.placeholder')}
            />
            <p className="text-xs text-gray-500 mt-1">{t('options.template.hint')}</p>
          </div>
        </div>

        {/* 快捷链接设置 */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('options.quickLinks.title')}</h2>
            <button onClick={handleAddQuickLink} className="btn-secondary text-sm">
              + {t('options.quickLinks.add')}
            </button>
          </div>

          <div className="space-y-3">
            {config.template.quickLinks.map((link, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleQuickLinkChange(index, 'name', e.target.value)}
                    placeholder={t('options.quickLinks.namePlaceholder')}
                    className="input-field"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleQuickLinkChange(index, 'url', e.target.value)}
                    placeholder={t('options.quickLinks.urlPlaceholder')}
                    className="input-field"
                  />
                </div>
                <button
                  onClick={() => handleRemoveQuickLink(index)}
                  className="text-red-600 hover:text-red-700 p-2 mt-1"
                  title={t('options.quickLinks.remove')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {config.template.quickLinks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">{t('options.quickLinks.empty')}</p>
            )}
          </div>
        </div>

        {/* 其他设置 */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('options.other.title')}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('options.other.timezone')}</label>
            <input
              type="text"
              value={config.timezone}
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{t('options.other.timezoneHint')}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-secondary">
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t('options.other.export')}
            </button>
            <button onClick={handleImport} className="btn-secondary">
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {t('options.other.import')}
            </button>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 -mb-8 mt-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              {saved && (
                <span className="text-green-600 text-sm font-medium flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('options.save.success')}
                </span>
              )}
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3 text-base">
              {saving ? t('options.save.saving') : t('options.save.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options
