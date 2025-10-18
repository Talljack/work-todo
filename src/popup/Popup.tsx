import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import browser from 'webextension-polyfill'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { AppConfig, DailyState, ReminderRule } from '@/types'
import { getConfig, getDailyState } from '@/utils/storage'
import { formatTime, getTimeUntilDeadline, isWorkDay, getNextReminderTime } from '@/utils/time'

const Popup: React.FC = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [state, setState] = useState<DailyState | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRuleDetailsExpanded, setIsRuleDetailsExpanded] = useState(false) // 规则详情折叠状态，默认折叠

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
  const getNextActiveRule = (): ReminderRule | null => {
    const now = new Date()
    let earliestTime: Date | null = null
    let earliestRule: ReminderRule | null = null

    for (const rule of config.reminderRules) {
      if (!rule.enabled) continue

      const nextTime = getNextReminderTime(now, rule, state)
      if (nextTime) {
        if (!earliestTime || nextTime < earliestTime) {
          earliestTime = nextTime
          earliestRule = rule
        }
      }
    }

    return earliestRule
  }

  // 获取今天激活的规则（用于显示规则信息，不受sent状态影响）
  const getTodayActiveRule = (): ReminderRule | null => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // 找出今天启用的、符合工作日设置的规则
    for (const rule of config.reminderRules) {
      if (!rule.enabled) continue
      if (!isWorkDay(now, rule)) continue

      // 解析规则的时间
      const [startHour, startMin] = rule.startTime.split(':').map(Number)
      const [deadlineHour, deadlineMin] = rule.deadline.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      let deadlineMinutes = deadlineHour * 60 + deadlineMin

      // 处理跨午夜情况（例如 23:30 - 00:30）
      if (deadlineMinutes < startMinutes) {
        deadlineMinutes += 24 * 60
      }

      // 检查当前时间是否在开始时间之后
      let adjustedCurrentMinutes = currentMinutes
      if (currentMinutes < startMinutes && deadlineMinutes >= 24 * 60) {
        // 如果当前时间在午夜后，且规则跨午夜，需要调整
        adjustedCurrentMinutes += 24 * 60
      }

      // 检查是否在活动时间范围内（包括迟到提醒时间）
      const lateReminders = rule.lateReminders || []
      let latestMinutes = deadlineMinutes

      if (lateReminders.length > 0) {
        // 找到最晚的迟到提醒时间
        const lateMinutes = lateReminders.map((time) => {
          const [h, m] = time.split(':').map(Number)
          let mins = h * 60 + m
          if (mins < startMinutes) mins += 24 * 60 // 跨午夜
          return mins
        })
        latestMinutes = Math.max(deadlineMinutes, ...lateMinutes)
      }

      if (adjustedCurrentMinutes >= startMinutes && adjustedCurrentMinutes <= latestMinutes) {
        return rule
      }
    }

    return null
  }

  // 获取要显示的模板内容
  const getTemplateContent = (): string => {
    const activeRule = getTodayActiveRule()

    // 如果有今天激活的规则且该规则有自定义模板，使用规则的模板
    if (activeRule?.templateContent) {
      return activeRule.templateContent
    }

    // 否则使用全局模板
    return config.template.content
  }

  // 获取今天会触发的规则的截止时间（必须是今天的工作日）
  const nextActiveRule = getNextActiveRule()
  const todayActiveRule = getTodayActiveRule() // 用于显示规则信息
  const timeUntilDeadline = nextActiveRule
    ? getTimeUntilDeadline(nextActiveRule)
    : { isPastDeadline: true, hours: 0, minutes: 0 }

  const getDeadlineText = () => {
    if (timeUntilDeadline.isPastDeadline) {
      return t('popup.status.pastDeadline')
    }
    if (timeUntilDeadline.hours > 0) {
      return t('popup.status.timeRemaining', {
        hours: timeUntilDeadline.hours,
        minutes: timeUntilDeadline.minutes,
      })
    }
    return t('popup.status.minutesRemaining', { minutes: timeUntilDeadline.minutes })
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

        <div className="text-sm text-white/90">{formatTime(currentTime)}</div>

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
        {todayActiveRule && (
          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('popup.activeRule', 'Active Rule')}</h2>
                <div className="text-lg font-bold text-primary-700">{todayActiveRule.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {todayActiveRule.startTime} - {todayActiveRule.deadline} · Every {todayActiveRule.interval} min
                </div>
              </div>
              <button
                onClick={() => setIsRuleDetailsExpanded(!isRuleDetailsExpanded)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                title={isRuleDetailsExpanded ? 'Collapse' : 'Expand'}
              >
                <svg
                  className={`w-5 h-5 transition-transform ${isRuleDetailsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* 详细信息 - 只在展开时显示 */}
            {isRuleDetailsExpanded && (
              <>
                {/* 通知设置 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2">
                    {t('popup.notificationSettings', 'Notification Settings')}
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-1">Title</div>
                      <div className="text-sm text-gray-800">{todayActiveRule.notificationTitle}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-1">Message</div>
                      <div className="text-sm text-gray-800">{todayActiveRule.notificationMessage}</div>
                    </div>
                  </div>
                </div>

                {/* Toast设置 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2">
                    {t('popup.toastSettings', 'Toast Settings')}
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-1">Message</div>
                      <div className="text-sm text-gray-800">{todayActiveRule.toastMessage}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-1">Duration</div>
                      <div className="text-sm text-gray-800">{todayActiveRule.toastDuration}s</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TODO 模板 */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('popup.template.title')}</h2>
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
