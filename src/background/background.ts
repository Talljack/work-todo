import browser from 'webextension-polyfill'
import type { BackgroundMessage, BackgroundResponse } from '@/types'
import { getConfig, getDailyState, markAsSent, resetDailyState, onConfigChanged } from '@/utils/storage'
import { getNextReminderTime, shouldResetState, getNextMidnight } from '@/utils/time'

const ALARM_NAMES = {
  REMINDER: 'todo-reminder',
  MIDNIGHT_RESET: 'midnight-reset',
} as const

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
 * 遍历所有启用的规则，找出最早的下一次提醒时间
 */
async function scheduleNextReminder(): Promise<void> {
  const config = await getConfig()
  const state = await getDailyState()
  const now = new Date()

  let earliestTime: Date | null = null
  let earliestRule: string | null = null

  // 遍历所有启用的规则，找出最早的提醒时间
  for (const rule of config.reminderRules) {
    if (!rule.enabled) continue

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
  // 首先清除所有现有的提醒闹钟，防止休眠后积压的闹钟重复触发
  await browser.alarms.clear(ALARM_NAMES.REMINDER)

  const state = await getDailyState()
  const config = await getConfig()
  const now = new Date()

  // 已发送则跳过，直接安排下一次（如果有的话）
  if (state.sent) {
    console.log('Already sent today, skipping reminder')
    await scheduleNextReminder()
    return
  }

  // 找出当前时间应该提醒的所有规则
  const rulesToRemind = config.reminderRules.filter((rule) => {
    if (!rule.enabled) return false
    const nextTime = getNextReminderTime(now, rule, state)
    // 如果下一次提醒时间在1分钟内，认为应该现在提醒
    return nextTime && nextTime.getTime() - now.getTime() <= 60000
  })

  if (rulesToRemind.length === 0) {
    console.log('No rules to remind at this time')
    await scheduleNextReminder()
    return
  }

  console.log(`Triggering reminder for ${rulesToRemind.length} rule(s)...`)

  // 为每个规则发送通知和Toast
  for (const rule of rulesToRemind) {
    // 1. 发送系统通知
    await browser.notifications.create({
      type: 'basic',
      iconUrl: 'src/assets/icon.png',
      title: rule.notificationTitle,
      message: rule.notificationMessage,
      priority: 2,
    })

    // 2. 在所有标签页显示 Toast 提醒
    try {
      const tabs = await browser.tabs.query({})
      for (const tab of tabs) {
        if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          await browser.tabs
            .sendMessage(tab.id, {
              type: 'SHOW_TOAST',
              message: rule.toastMessage,
              duration: rule.toastDuration * 1000, // 转换为毫秒
              url: rule.toastClickUrl, // 可选的点击后打开的 URL
            })
            .catch(() => {
              // 忽略无法注入的页面（如 chrome:// 页面）
            })
        }
      }
    } catch (error) {
      console.log('Failed to show toast:', error)
    }
  }

  // 3. 更新 Badge
  await browser.action.setBadgeText({ text: '!' })
  await browser.action.setBadgeBackgroundColor({ color: '#EF4444' })

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

        case 'OPEN_OPTIONS':
          await browser.runtime.openOptionsPage()
          return { success: true }

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
        iconUrl: 'src/assets/icon.png',
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
