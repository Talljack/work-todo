/**
 * 多规则调度逻辑验证脚本
 * 运行方式: node --loader tsx test-multi-rules.ts
 */

import { getNextReminderTime, isWorkDay } from '../src/utils/time'
import type { ReminderRule, DailyState } from '../src/types'

// 模拟规则
const testRules: ReminderRule[] = [
  {
    id: 'rule-1',
    name: '工作计划提醒',
    enabled: true,
    workDays: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '09:00',
    interval: 15,
    deadline: '10:00',
    lateReminders: ['10:30', '11:00'],
    notificationTitle: '提醒：发送今日 TODO',
    notificationMessage: '别忘了发送今日工作计划！',
    toastMessage: '别忘了发送今日工作计划！',
    toastDuration: 10,
  },
  {
    id: 'rule-2',
    name: '下午茶提醒',
    enabled: true,
    workDays: [true, true, true, true, true, false, false], // Mon-Fri
    startTime: '15:00',
    interval: 30,
    deadline: '16:00',
    lateReminders: ['16:30'],
    notificationTitle: '下午茶时间',
    notificationMessage: '休息一下，喝杯茶吧~',
    toastMessage: '下午茶时间！',
    toastDuration: 10,
  },
  {
    id: 'rule-3',
    name: '睡觉提醒',
    enabled: true,
    workDays: [true, true, true, true, true, true, true], // Every day
    startTime: '23:00',
    interval: 15,
    deadline: '23:45',
    lateReminders: [],
    notificationTitle: '该睡觉了',
    notificationMessage: '早睡早起身体好！',
    toastMessage: '该睡觉了！',
    toastDuration: 10,
  },
  {
    id: 'rule-4',
    name: '周末提醒',
    enabled: true,
    workDays: [false, false, false, false, false, true, true], // Sat-Sun only
    startTime: '10:00',
    interval: 60,
    deadline: '11:00',
    lateReminders: [],
    notificationTitle: '周末愉快',
    notificationMessage: '享受你的周末时光~',
    toastMessage: '周末愉快！',
    toastDuration: 10,
  },
]

// 测试场景
const testScenarios = [
  {
    name: '工作日上午 8:30 - 应该找到 09:00 的工作计划提醒',
    now: new Date('2025-10-17T08:30:00'), // Friday
    expectedRuleName: '工作计划提醒',
    expectedTime: '09:00',
  },
  {
    name: '工作日上午 9:00 - 应该找到 09:00 的工作计划提醒',
    now: new Date('2025-10-17T09:00:00'), // Friday
    expectedRuleName: '工作计划提醒',
    expectedTime: '09:00',
  },
  {
    name: '工作日上午 9:30 - 应该找到 09:45 的工作计划提醒',
    now: new Date('2025-10-17T09:30:00'), // Friday
    expectedRuleName: '工作计划提醒',
    expectedTime: '09:45',
  },
  {
    name: '工作日中午 12:00 - 应该找到 15:00 的下午茶提醒',
    now: new Date('2025-10-17T12:00:00'), // Friday
    expectedRuleName: '下午茶提醒',
    expectedTime: '15:00',
  },
  {
    name: '工作日晚上 22:00 - 应该找到 23:00 的睡觉提醒',
    now: new Date('2025-10-17T22:00:00'), // Friday
    expectedRuleName: '睡觉提醒',
    expectedTime: '23:00',
  },
  {
    name: '周六上午 9:00 - 应该找到 10:00 的周末提醒',
    now: new Date('2025-10-18T09:00:00'), // Saturday
    expectedRuleName: '周末提醒',
    expectedTime: '10:00',
  },
  {
    name: '周日上午 9:00 - 应该找到 10:00 的周末提醒',
    now: new Date('2025-10-19T09:00:00'), // Sunday
    expectedRuleName: '周末提醒',
    expectedTime: '10:00',
  },
]

// 模拟调度逻辑
function findNextReminder(now: Date, rules: ReminderRule[], state: DailyState) {
  let earliestTime: Date | null = null
  let earliestRule: ReminderRule | null = null

  for (const rule of rules) {
    if (!rule.enabled) continue

    const nextTime = getNextReminderTime(now, rule, state)
    if (nextTime) {
      if (!earliestTime || nextTime < earliestTime) {
        earliestTime = nextTime
        earliestRule = rule
      }
    }
  }

  return { time: earliestTime, rule: earliestRule }
}

// 运行测试
console.log('🧪 多规则调度逻辑验证\n')
console.log('='.repeat(80))

const state: DailyState = {
  date: '',
  sent: false,
}

let allPassed = true

for (const scenario of testScenarios) {
  console.log(`\n测试: ${scenario.name}`)
  console.log(`当前时间: ${scenario.now.toLocaleString('zh-CN')}`)

  const result = findNextReminder(scenario.now, testRules, state)

  if (result.time && result.rule) {
    const resultTime = `${String(result.time.getHours()).padStart(2, '0')}:${String(result.time.getMinutes()).padStart(2, '0')}`

    console.log(`✓ 找到提醒: ${result.rule.name}`)
    console.log(`  提醒时间: ${resultTime}`)

    if (result.rule.name === scenario.expectedRuleName && resultTime === scenario.expectedTime) {
      console.log('  ✅ 测试通过')
    } else {
      console.log(`  ❌ 测试失败`)
      console.log(`     期望规则: ${scenario.expectedRuleName}`)
      console.log(`     期望时间: ${scenario.expectedTime}`)
      allPassed = false
    }
  } else {
    console.log('✗ 未找到提醒')
    console.log('  ❌ 测试失败')
    allPassed = false
  }
}

console.log('\n' + '='.repeat(80))
console.log(allPassed ? '\n✅ 所有测试通过！' : '\n❌ 部分测试失败')

// 额外验证：工作日判断
console.log('\n\n📅 工作日判断验证\n')
console.log('='.repeat(80))

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const testDates = [
  new Date('2025-10-12T10:00:00'), // Sunday
  new Date('2025-10-13T10:00:00'), // Monday
  new Date('2025-10-17T10:00:00'), // Friday
  new Date('2025-10-18T10:00:00'), // Saturday
]

for (const date of testDates) {
  const dayName = weekdays[date.getDay()]
  console.log(`\n${date.toLocaleDateString('zh-CN')} (${dayName}):`)

  for (const rule of testRules) {
    const isWork = isWorkDay(date, rule)
    console.log(`  ${rule.name}: ${isWork ? '✓ 工作日' : '✗ 非工作日'}`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('\n验证完成！\n')
