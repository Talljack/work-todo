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

  // 标记规则为已完成
  const handleMarkRuleAsCompleted = async (ruleId: string) => {
    try {
      await browser.runtime.sendMessage({
        type: 'MARK_RULE_COMPLETED',
        payload: { ruleId },
      })
      // 重新加载状态
      const newState = await getDailyState()
      setState(newState)
    } catch (error) {
      console.error('Failed to mark rule as completed:', error)
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

  // 获取下一个未完成的规则（下一个提醒时间最早的规则）
  const getNextRuleEntry = (): { rule: ReminderRule; time: Date } | null => {
    const now = currentTime
    let best: { rule: ReminderRule; time: Date } | null = null

    for (const rule of config.reminderRules) {
      if (!rule.enabled) continue

      // 跳过已完成的规则
      if (state.completedRules.includes(rule.id)) {
        continue
      }

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

  // 检查所有启用的规则是否都已完成
  const enabledRules = config.reminderRules.filter((rule) => rule.enabled)
  const allRulesCompleted =
    enabledRules.length > 0 && enabledRules.every((rule) => state.completedRules.includes(rule.id))

  // 计算距离下一次提醒的时间
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
          {isToday && allRulesCompleted ? (
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
        {/* 当前规则 - 简洁展示 */}
        {nextDetailRule ? (
          <div className="card space-y-3">
            {/* 规则标题和时间 */}
            <div>
              <h2 className="text-base font-semibold text-gray-800">{nextDetailRule.name}</h2>
              <div className="text-xs text-gray-500 mt-1">
                {formatTimeString(nextDetailRule.startTime, timeFormat)} -{' '}
                {formatTimeString(nextDetailRule.deadline, timeFormat)} ·{' '}
                {t('popup.everyMinutes', { minutes: nextDetailRule.interval })}
              </div>
            </div>

            {/* 提醒内容 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  {t('popup.ruleTemplateLabel', 'Reminder Content')}
                </h3>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(getTemplateContent())
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch (error) {
                      console.error('Failed to copy:', error)
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {copied ? t('popup.template.copied') : t('popup.template.copy')}
                </button>
              </div>
              <div className="prose prose-sm max-w-none bg-white p-3 rounded border border-gray-200 max-h-48 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{getTemplateContent()}</ReactMarkdown>
              </div>
            </div>

            {/* 完成按钮 */}
            {!allRulesCompleted && isTodayWorkDay && (
              <button
                onClick={() => handleMarkRuleAsCompleted(nextActiveRule.id)}
                className="w-full btn-primary py-3 text-base shadow-md hover:shadow-lg"
              >
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
        ) : (
          // 没有规则时显示提示
          <div className="text-center text-gray-500 py-8">
            {allRulesCompleted
              ? t('popup.allCompleted', 'All tasks completed for today!')
              : t('popup.noRules', 'No active reminders.')}
          </div>
        )}
      </div>
    </div>
  )
}

export default Popup
