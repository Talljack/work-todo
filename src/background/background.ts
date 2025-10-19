import browser from 'webextension-polyfill'
import type { BackgroundMessage, BackgroundResponse } from '@/types'
import {
  getConfig,
  getDailyState,
  markAsSent,
  markRuleAsCompleted,
  resetDailyState,
  onConfigChanged,
} from '@/utils/storage'
import { getNextReminderTime, shouldResetState, getNextMidnight } from '@/utils/time'

const ALARM_NAMES = {
  REMINDER: 'todo-reminder',
  MIDNIGHT_RESET: 'midnight-reset',
} as const

// 防抖：记录上次提醒时间，防止重复触发
let lastReminderTime = 0
const REMINDER_DEBOUNCE_MS = 30000 // 30秒内不重复触发

/**
 * 初始化闹钟系统
 */
async function initAlarms(): Promise<void> {
  console.log('Initializing alarms...')

  const state = await getDailyState()

  // 检查是否需要重置状态
  if (shouldResetState(state.date)) {
    console.log('Resetting daily state...')
    await resetDailyState()
  }

  // 清除所有现有闹钟
  await browser.alarms.clearAll()

  // 设置今日提醒
  await scheduleNextReminder()

  // 设置次日午夜重置闹钟
  await scheduleMidnightReset()
}

/**
 * 安排下一次提醒
 * 遍历所有启用的规则，找出最早的下一次提醒时间（跳过已完成的规则）
 */
async function scheduleNextReminder(): Promise<void> {
  const config = await getConfig()
  const state = await getDailyState()
  const now = new Date()

  let earliestTime: Date | null = null
  let earliestRule: string | null = null

  // 遍历所有启用的规则，找出最早的提醒时间（跳过已完成的）
  for (const rule of config.reminderRules) {
    if (!rule.enabled) continue

    // 跳过已完成的规则
    if (state.completedRules.includes(rule.id)) {
      console.log(`Rule "${rule.name}" is already completed, skipping scheduling`)
      continue
    }

    const nextTime = getNextReminderTime(now, rule, state)
    if (nextTime) {
      if (!earliestTime || nextTime < earliestTime) {
        earliestTime = nextTime
        earliestRule = rule.name
      }
    }
  }

  if (earliestTime && earliestRule) {
    const when = earliestTime.getTime()
    await browser.alarms.create(ALARM_NAMES.REMINDER, { when })
    console.log(`Next reminder scheduled at: ${earliestTime.toLocaleString()} for rule: ${earliestRule}`)
  } else {
    console.log('No more reminders for today')
  }
}

/**
 * 安排午夜重置闹钟
 */
async function scheduleMidnightReset(): Promise<void> {
  const midnight = getNextMidnight()
  await browser.alarms.create(ALARM_NAMES.MIDNIGHT_RESET, {
    when: midnight.getTime(),
  })
  console.log(`Midnight reset scheduled at: ${midnight.toLocaleString()}`)
}

/**
 * 处理提醒
 * 检查所有启用的规则，触发当前时间应该提醒的规则
 */
async function handleReminder(): Promise<void> {
  // 防抖：如果距离上次触发时间小于30秒，跳过
  const now = Date.now()
  if (now - lastReminderTime < REMINDER_DEBOUNCE_MS) {
    console.log('Debouncing: Reminder triggered too soon after last one, skipping...')
    return
  }
  lastReminderTime = now

  // 首先清除所有现有的提醒闹钟，防止休眠后积压的闹钟重复触发
  await browser.alarms.clear(ALARM_NAMES.REMINDER)

  const state = await getDailyState()
  const config = await getConfig()
  const currentTime = new Date()

  // 检查所有启用的规则是否都已完成
  const enabledRules = config.reminderRules.filter((rule) => rule.enabled)
  const allCompleted = enabledRules.length > 0 && enabledRules.every((rule) => state.completedRules.includes(rule.id))

  if (allCompleted) {
    console.log('All enabled rules completed today, skipping reminder')
    await scheduleNextReminder()
    return
  }

  // 找出当前时间应该提醒的所有规则（排除已完成的）
  const rulesToRemind = config.reminderRules.filter((rule) => {
    if (!rule.enabled) return false

    // 跳过已完成的规则
    if (state.completedRules.includes(rule.id)) {
      console.log(`Rule "${rule.name}" is already completed, skipping`)
      return false
    }

    const nextTime = getNextReminderTime(currentTime, rule, state)
    // 如果下一次提醒时间在1分钟内，认为应该现在提醒
    return nextTime && nextTime.getTime() - currentTime.getTime() <= 60000
  })

  if (rulesToRemind.length === 0) {
    console.log('No rules to remind at this time')
    await scheduleNextReminder()
    return
  }

  console.log(`Triggering reminder for ${rulesToRemind.length} rule(s)...`)

  // 为每个规则发送通知和Toast
  for (const rule of rulesToRemind) {
    console.log(`Processing rule: ${rule.name}`)

    // 1. 发送系统通知
    try {
      await browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('src/assets/icons/icon-128.png'),
        title: rule.notificationTitle,
        message: rule.notificationMessage,
        priority: 2,
      })
      console.log('✓ Notification created')
    } catch (error) {
      console.error('✗ Failed to create notification:', error)
    }

    // 2. 在所有标签页显示 Toast 提醒
    try {
      const tabs = await browser.tabs.query({})
      console.log(`Found ${tabs.length} total tabs`)

      let toastSent = false
      let validTabCount = 0

      for (const tab of tabs) {
        if (!tab.id || !tab.url) continue

        // 排除特殊页面
        if (
          tab.url.startsWith('chrome://') ||
          tab.url.startsWith('chrome-extension://') ||
          tab.url.startsWith('about:') ||
          tab.url.startsWith('edge://')
        ) {
          console.log(`Skipping special tab: ${tab.url}`)
          continue
        }

        validTabCount++
        console.log(`Attempting to send toast to tab ${tab.id}: ${tab.url}`)

        try {
          await browser.tabs.sendMessage(tab.id, {
            type: 'SHOW_TOAST',
            message: rule.toastMessage,
            duration: rule.toastDuration * 1000,
            url: rule.toastClickUrl,
          })
          toastSent = true
          console.log(`✓ Toast sent to tab ${tab.id}`)
        } catch {
          // 如果content script未注入，使用简单的原生通知样式
          console.log(`✗ Content script not available in tab ${tab.id}, using fallback toast...`)
          try {
            await browser.scripting.executeScript({
              target: { tabId: tab.id },
              func: (message: string, duration: number, clickUrl?: string) => {
                const toast = document.createElement('div')
                toast.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 16px 20px;
                  border-radius: 12px;
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                  font-size: 14px;
                  max-width: 400px;
                  z-index: 999999;
                  cursor: pointer;
                  display: flex;
                  gap: 12px;
                  align-items: start;
                  animation: slideIn 0.3s ease-out;
                `
                toast.innerHTML =
                  '<div style="font-size: 24px;">⏰</div>' +
                  '<div style="flex: 1;">' +
                  '<div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">日常提醒助手</div>' +
                  '<div style="opacity: 0.95; line-height: 1.5;">' +
                  message +
                  '</div>' +
                  '</div>' +
                  '<button style="background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">×</button>'

                const style = document.createElement('style')
                style.textContent =
                  '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }'
                document.head.appendChild(style)

                document.body.appendChild(toast)

                toast.addEventListener('click', (e) => {
                  const target = e.target as HTMLElement
                  if (target.tagName === 'BUTTON') {
                    e.stopPropagation()
                    toast.remove()
                  } else if (clickUrl) {
                    window.open(clickUrl, '_blank')
                    toast.remove()
                  }
                })

                setTimeout(() => {
                  toast.style.animation = 'slideIn 0.3s ease-out reverse'
                  setTimeout(() => toast.remove(), 300)
                }, duration)
              },
              args: [rule.toastMessage, rule.toastDuration * 1000, rule.toastClickUrl],
            })
            toastSent = true
            console.log(`✓ Fallback toast shown in tab ${tab.id}`)
          } catch (injectError) {
            console.log(`✗ Failed to show fallback toast in tab ${tab.id}:`, injectError)
          }
        }
      }

      console.log(`Valid tabs found: ${validTabCount}, Toast sent: ${toastSent}`)

      if (!toastSent) {
        console.warn('⚠️ No valid tabs available for toast notification.')
      }
    } catch (error) {
      console.error('Failed to show toast:', error)
    }
  }

  // 3. 更新 Badge（如果还有未完成的规则）
  const hasIncomplete = enabledRules.some((rule) => !state.completedRules.includes(rule.id))
  if (hasIncomplete) {
    await browser.action.setBadgeText({ text: '!' })
    await browser.action.setBadgeBackgroundColor({ color: '#EF4444' })
  } else {
    await browser.action.setBadgeText({ text: '' })
  }

  // 4. 安排下一次提醒
  await scheduleNextReminder()
}

/**
 * 处理午夜重置
 */
async function handleMidnightReset(): Promise<void> {
  console.log('Midnight reset triggered')
  await resetDailyState()
  await initAlarms()
}

/**
 * 处理标记已发送
 */
async function handleMarkAsSent(): Promise<void> {
  await markAsSent()

  // 清除 Badge
  await browser.action.setBadgeText({ text: '' })

  // 清除今日所有提醒闹钟
  await browser.alarms.clear(ALARM_NAMES.REMINDER)

  console.log('Marked as sent, all reminders cleared')
}

// 监听扩展安装
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details.reason)
  await initAlarms()
})

// 监听浏览器启动
browser.runtime.onStartup.addListener(async () => {
  console.log('Browser started')
  await initAlarms()
})

// 监听闹钟触发
browser.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name)

  if (alarm.name === ALARM_NAMES.REMINDER) {
    await handleReminder()
  } else if (alarm.name === ALARM_NAMES.MIDNIGHT_RESET) {
    await handleMidnightReset()
  }
})

// 监听通知点击
browser.notifications.onClicked.addListener(async () => {
  console.log('Notification clicked')
  // 在 Chrome 中无法直接打开 popup，但可以打开 options 页面
  await browser.runtime.openOptionsPage()
})

// 监听来自 popup/options/content script 的消息
browser.runtime.onMessage.addListener((message: unknown): Promise<BackgroundResponse> => {
  console.log('Message received:', message)

  return (async () => {
    try {
      const msg = message as BackgroundMessage

      switch (msg.type) {
        case 'REINIT_ALARMS':
          await initAlarms()
          return { success: true }

        case 'GET_STATE': {
          const state = await getDailyState()
          return { success: true, data: state }
        }

        case 'MARK_SENT':
          await handleMarkAsSent()
          return { success: true }

        case 'MARK_RULE_COMPLETED': {
          const ruleId = msg.payload?.ruleId
          if (!ruleId) {
            return { success: false, error: 'Missing ruleId' }
          }
          await markRuleAsCompleted(ruleId)

          // 检查是否所有规则都已完成
          const config = await getConfig()
          const state = await getDailyState()
          const enabledRules = config.reminderRules.filter((rule) => rule.enabled)
          const allCompleted =
            enabledRules.length > 0 && enabledRules.every((rule) => state.completedRules.includes(rule.id))

          if (allCompleted) {
            // 清除 Badge
            await browser.action.setBadgeText({ text: '' })
            // 清除今日所有提醒闹钟
            await browser.alarms.clear(ALARM_NAMES.REMINDER)
          } else {
            // 重新安排下一次提醒（因为某些规则可能已完成）
            await scheduleNextReminder()
          }

          console.log(`Rule ${ruleId} marked as completed`)
          return { success: true }
        }

        case 'OPEN_OPTIONS':
          await browser.runtime.openOptionsPage()
          return { success: true }

        case 'TEST_TOAST': {
          // 测试 Toast 消息
          const payload = msg.payload || {}
          console.log('Testing toast with message:', payload.message)

          try {
            const tabs = await browser.tabs.query({})
            let toastSent = false

            for (const tab of tabs) {
              if (!tab.id || !tab.url) continue
              if (
                tab.url.startsWith('chrome://') ||
                tab.url.startsWith('chrome-extension://') ||
                tab.url.startsWith('about:') ||
                tab.url.startsWith('edge://')
              ) {
                continue
              }

              try {
                await browser.tabs.sendMessage(tab.id, {
                  type: 'SHOW_TOAST',
                  message: payload.message || '测试 Toast 消息',
                  duration: payload.duration || 10000,
                  url: payload.url || '',
                })
                toastSent = true
              } catch {
                // 使用 fallback toast
                try {
                  await browser.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (message: string, duration: number, clickUrl?: string) => {
                      const toast = document.createElement('div')
                      toast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 16px 20px;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                        font-size: 14px;
                        max-width: 400px;
                        z-index: 999999;
                        cursor: pointer;
                        display: flex;
                        gap: 12px;
                        align-items: start;
                        animation: slideIn 0.3s ease-out;
                      `
                      toast.innerHTML =
                        '<div style="font-size: 24px;">⏰</div>' +
                        '<div style="flex: 1;">' +
                        '<div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">日常提醒助手</div>' +
                        '<div style="opacity: 0.95; line-height: 1.5;">' +
                        message +
                        '</div>' +
                        '</div>' +
                        '<button style="background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">×</button>'

                      const style = document.createElement('style')
                      style.textContent =
                        '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }'
                      document.head.appendChild(style)

                      document.body.appendChild(toast)

                      toast.addEventListener('click', (e) => {
                        const target = e.target as HTMLElement
                        if (target.tagName === 'BUTTON') {
                          e.stopPropagation()
                          toast.remove()
                        } else if (clickUrl) {
                          window.open(clickUrl, '_blank')
                          toast.remove()
                        }
                      })

                      setTimeout(() => {
                        toast.style.animation = 'slideIn 0.3s ease-out reverse'
                        setTimeout(() => toast.remove(), 300)
                      }, duration)
                    },
                    args: [payload.message || '测试 Toast 消息', payload.duration || 10000, payload.url || ''],
                  })
                  toastSent = true
                } catch (injectError) {
                  console.log(`Failed to send test toast to tab ${tab.id}:`, injectError)
                }
              }
            }

            if (!toastSent) {
              console.warn('⚠️ No valid tabs available for test toast.')
            }

            return { success: true }
          } catch (error) {
            console.error('Error sending test toast:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
          }
        }

        default:
          return { success: false, error: 'Unknown message type' }
      }
    } catch (error) {
      console.error('Error handling message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })()
})

// 监听配置变化
onConfigChanged(async () => {
  console.log('Config changed, reinitializing alarms...')
  await initAlarms()
})

// 监听键盘快捷键命令
browser.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command)

  switch (command) {
    case 'mark-as-sent':
      await handleMarkAsSent()
      // 显示通知确认
      await browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('src/assets/icons/icon-128.png'),
        title: '✅ 已标记为已发送',
        message: '今日 TODO 已标记为已发送',
        priority: 1,
      })
      break

    case 'open-options':
      await browser.runtime.openOptionsPage()
      break

    default:
      console.log('Unknown command:', command)
  }
})

console.log('Background service worker loaded')
