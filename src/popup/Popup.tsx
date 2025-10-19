import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import browser from 'webextension-polyfill'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { AppConfig, DailyState, ReminderRule } from '@/types'
import { getConfig, getDailyState } from '@/utils/storage'
import { formatTime, formatTimeString, isWorkDay, getNextReminderTime } from '@/utils/time'

const Popup: React.FC = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [state, setState] = useState<DailyState | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 加载配置和状态
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cfg, st] = await Promise.all([getConfig(), getDailyState()])
        setConfig(cfg)
        setState(st)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 定时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 复制模板
  const handleCopyTemplate = async () => {
    if (!config) return

    try {
      await navigator.clipboard.writeText(getTemplateContent())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // 标记已发送
  const handleMarkAsSent = async () => {
    try {
      await browser.runtime.sendMessage({ type: 'MARK_SENT' })
      // 重新加载状态
      const newState = await getDailyState()
      setState(newState)
    } catch (error) {
      console.error('Failed to mark as sent:', error)
    }
  }

  // 打开 Options 页面
  const handleOpenOptions = () => {
    browser.runtime.openOptionsPage()
  }

  if (loading) {
    return (
      <div className="w-96 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!config || !state) {
    return (
      <div className="w-96 p-6">
        <div className="text-red-600">{t('popup.error')}</div>
      </div>
    )
  }

  const isToday = state.date === new Date().toISOString().split('T')[0]

  // 检查今天是否是工作日（任意一个启用的规则将今天设为工作日即可）
  const isTodayWorkDay = config.reminderRules.some((rule) => {
    if (!rule.enabled) return false
    return isWorkDay(new Date(), rule)
  })

  // 获取即将触发的规则（下一个提醒时间最早的规则）
  // 用于确定提醒时间和Mark as Done按钮
  const getNextRuleEntry = (): { rule: ReminderRule; time: Date } | null => {
    const now = currentTime
    let best: { rule: ReminderRule; time: Date } | null = null

    for (const rule of config.reminderRules) {
      if (!rule.enabled) continue

      const nextTime = getNextReminderTime(now, rule, state)
      if (!nextTime) continue

      if (!best || nextTime < best.time) {
        best = { rule, time: nextTime }
      }
    }

    return best
  }

  const nextRuleEntry = getNextRuleEntry()
  const nextActiveRule = nextRuleEntry?.rule ?? null
  const nextReminderTime = nextRuleEntry?.time ?? null

  const getTemplateContent = (): string => {
    if (nextActiveRule?.templateContent) {
      return nextActiveRule.templateContent
    }
    return config.template.content
  }

  const timeFormat = config.timeFormat ?? '24h'

  const nextDetailRule = nextActiveRule

  // 计算距离下一次提醒的时间，而不是距离deadline
  const getTimeUntilNextReminder = (): {
    isPastDeadline: boolean
    hours: number
    minutes: number
  } => {
    if (!nextReminderTime) {
      return { isPastDeadline: true, hours: 0, minutes: 0 }
    }

    const diff = nextReminderTime.getTime() - currentTime.getTime()
    if (diff <= 0) {
      return { isPastDeadline: true, hours: 0, minutes: 0 }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { isPastDeadline: false, hours, minutes }
  }

  const timeUntilNext = getTimeUntilNextReminder()

  const getDeadlineText = () => {
    if (timeUntilNext.isPastDeadline) {
      return t('popup.status.pastDeadline')
    }
    if (timeUntilNext.hours > 0) {
      return t('popup.status.timeRemaining', {
        hours: timeUntilNext.hours,
        minutes: timeUntilNext.minutes,
      })
    }
    return t('popup.status.minutesRemaining', { minutes: timeUntilNext.minutes })
  }

  return (
    <div className="w-[480px] bg-gray-50 max-h-[600px] overflow-y-auto">
      {/* 头部状态 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">{t('popup.title')}</h1>
          <button
            onClick={handleOpenOptions}
            className="text-white/80 hover:text-white transition-colors"
            title={t('popup.settings')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="text-sm text-white/90">{formatTime(currentTime, timeFormat)}</div>

        {/* 状态指示器 */}
        <div className="mt-4 flex items-center">
          {isToday && state.sent ? (
            <div className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('popup.status.sent')}
            </div>
          ) : isTodayWorkDay ? (
            <div className="flex items-center bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {t('popup.status.pending')} · {getDeadlineText()}
            </div>
          ) : (
            <div className="flex items-center bg-gray-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {t('popup.status.notWorkDay')}
            </div>
          )}
        </div>
      </div>

      {/* 主体内容 */}
      <div className="p-6 space-y-4">
        {/* 当前激活的规则信息 */}
        {nextDetailRule && (
          <div className="card space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('popup.activeRule', 'Active Rule')}</h2>
              <div className="rounded border border-gray-200 bg-white p-3 space-y-1">
                <div className="text-sm font-semibold text-primary-700">{nextDetailRule.name}</div>
                <div className="text-xs text-gray-500">
                  {formatTimeString(nextDetailRule.startTime, timeFormat)} -{' '}
                  {formatTimeString(nextDetailRule.deadline, timeFormat)} ·{' '}
                  {t('popup.everyMinutes', { minutes: nextDetailRule.interval })}
                </div>
                {nextReminderTime && (
                  <div className="text-xs text-gray-500">
                    {t('popup.nextReminderAt', 'Next reminder at')} {formatTime(nextReminderTime, timeFormat)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded border border-gray-200 p-3 bg-white space-y-2">
                <div className="text-xs font-medium text-gray-500">
                  {t('popup.notificationSettings', 'Notification Settings')}
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-sm text-gray-800">
                  <div className="font-medium">{nextDetailRule.notificationTitle}</div>
                  <div className="mt-1 whitespace-pre-line text-gray-600">{nextDetailRule.notificationMessage}</div>
                </div>
              </div>

              <div className="rounded border border-gray-200 p-3 bg-white space-y-2">
                <div className="text-xs font-medium text-gray-500">{t('popup.toastSettings', 'Toast Settings')}</div>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-sm text-gray-800">
                  <div className="whitespace-pre-line">{nextDetailRule.toastMessage}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('popup.toastDurationLabel', 'Toast Duration')}: {nextDetailRule.toastDuration}s
                  </div>
                  {nextDetailRule.toastClickUrl && nextDetailRule.toastClickUrl.trim() !== '' && (
                    <a
                      href={nextDetailRule.toastClickUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-primary-600 hover:underline break-all mt-1"
                    >
                      {nextDetailRule.toastClickUrl}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('popup.ruleTemplateLabel', 'Reminder Content')}</h2>
            <button
              onClick={handleCopyTemplate}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {copied ? (
                <span className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('popup.template.copied')}
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  {t('popup.template.copy')}
                </span>
              )}
            </button>
          </div>
          <div className="prose prose-sm max-w-none bg-gray-50 p-3 rounded border border-gray-200 max-h-48 overflow-y-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{getTemplateContent()}</ReactMarkdown>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {!state.sent && isTodayWorkDay && (
            <button onClick={handleMarkAsSent} className="w-full btn-primary py-3 text-base shadow-md hover:shadow-lg">
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('popup.actions.markSent')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Popup
