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
 */
async function scheduleNextReminder(): Promise<void> {
  const config = await getConfig()
  const state = await getDailyState()
  const now = new Date()

  const nextTime = getNextReminderTime(now, config.workDays, state)

  if (nextTime) {
    const when = nextTime.getTime()
    await browser.alarms.create(ALARM_NAMES.REMINDER, { when })
    console.log(`Next reminder scheduled at: ${nextTime.toLocaleString()}`)
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
 */
async function handleReminder(): Promise<void> {
  const state = await getDailyState()

  // 已发送则跳过
  if (state.sent) {
    console.log('Already sent today, skipping reminder')
    return
  }

  console.log('Triggering reminder...')

  // 发送通知
  await browser.notifications.create({
    type: 'basic',
    iconUrl: 'src/assets/icon.png',
    title: '提醒：发送今日 TODO',
    message: '别忘了发送今日工作计划！点击打开扩展。',
    priority: 2,
  })

  // 更新 Badge
  await browser.action.setBadgeText({ text: '!' })
  await browser.action.setBadgeBackgroundColor({ color: '#EF4444' })

  // 安排下一次提醒
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

// 监听来自 popup/options 的消息
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

console.log('Background service worker loaded')
