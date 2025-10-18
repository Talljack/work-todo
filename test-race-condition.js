/**
 * Race Condition Test Utility
 *
 * 用法：
 * 1. 打开扩展的 Options 页面
 * 2. 打开 DevTools Console (F12)
 * 3. 复制此文件内容到 Console 并回车
 * 4. 运行测试：runAllTests()
 */

// 颜色输出
const log = {
  info: (msg) => console.log('%c' + msg, 'color: #2196F3'),
  success: (msg) => console.log('%c✅ ' + msg, 'color: #4CAF50; font-weight: bold'),
  error: (msg) => console.log('%c❌ ' + msg, 'color: #F44336; font-weight: bold'),
  warn: (msg) => console.log('%c⚠️ ' + msg, 'color: #FF9800'),
  test: (msg) => console.log('%c🧪 ' + msg, 'color: #9C27B0; font-weight: bold'),
}

// 获取当前配置
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('app_config', (result) => {
      resolve(result.app_config)
    })
  })
}

// 等待指定时间
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 测试 1: 模板编辑后立即编辑规则
async function test1_TemplateAndRuleEdit() {
  log.test('Test 1: 模板编辑后立即编辑规则')

  // 获取初始状态
  const initial = await getConfig()
  const initialRuleName = initial.reminderRules[0]?.name
  log.info(`Initial rule name: ${initialRuleName}`)

  // 触发模板修改
  const templateInput = document.querySelector('#template-content')
  if (!templateInput) {
    log.error('Template input not found. Are you on the Template tab?')
    return false
  }

  const testContent = `TEST_${Date.now()}`
  templateInput.value = testContent
  templateInput.dispatchEvent(new Event('input', { bubbles: true }))
  log.info('Template modified')

  // 500ms 后修改规则（在防抖期间）
  await sleep(500)

  // 切换到 Rules 标签
  const rulesTab = Array.from(document.querySelectorAll('button')).find(
    (btn) => btn.textContent.includes('Reminder Rules') || btn.textContent.includes('规则'),
  )
  if (rulesTab) {
    rulesTab.click()
    await sleep(200)
  }

  // 点击第一条规则的编辑按钮
  const editBtn = document.querySelector('[title="Edit"]')
  if (!editBtn) {
    log.error('Edit button not found')
    return false
  }

  editBtn.click()
  await sleep(300)

  // 修改规则名称
  const nameInput = document.querySelector('#rule-name')
  if (!nameInput) {
    log.error('Rule name input not found')
    return false
  }

  const newRuleName = `TEST_RULE_${Date.now()}`
  nameInput.value = newRuleName
  nameInput.dispatchEvent(new Event('input', { bubbles: true }))
  log.info(`Rule name changed to: ${newRuleName}`)

  // 保存
  await sleep(200)
  const saveBtn = Array.from(document.querySelectorAll('button')).find(
    (btn) => btn.textContent === 'Save' || btn.textContent === '保存',
  )
  if (saveBtn) {
    saveBtn.click()
    log.info('Rule saved')
  }

  // 等待模板防抖触发
  log.warn('Waiting 2 seconds for template debounce...')
  await sleep(2000)

  // 检查最终状态
  const final = await getConfig()
  const finalRuleName = final.reminderRules[0]?.name
  const finalTemplate = final.template.content

  log.info(`Final rule name: ${finalRuleName}`)
  log.info(`Final template contains: ${finalTemplate.includes(testContent) ? 'TEST content' : 'original'}`)

  // 验证结果
  if (finalRuleName === newRuleName && finalTemplate.includes(testContent)) {
    log.success('Test 1 PASSED: Both rule and template changes preserved!')
    return true
  } else {
    log.error('Test 1 FAILED: Changes were overwritten!')
    log.error(`Expected rule name: ${newRuleName}, Got: ${finalRuleName}`)
    return false
  }
}

// 测试 2: 模板编辑后立即切换规则开关
async function test2_TemplateAndToggle() {
  log.test('Test 2: 模板编辑后立即切换规则开关')

  const initial = await getConfig()
  const initialEnabled = initial.reminderRules[0]?.enabled
  log.info(`Initial rule enabled: ${initialEnabled}`)

  // 切换到 Template 标签
  const templateTab = Array.from(document.querySelectorAll('button')).find(
    (btn) => btn.textContent.includes('Template') || btn.textContent.includes('模板'),
  )
  if (templateTab) {
    templateTab.click()
    await sleep(200)
  }

  // 修改模板
  const templateInput = document.querySelector('#template-content')
  if (!templateInput) {
    log.error('Template input not found')
    return false
  }

  const testContent = `TOGGLE_TEST_${Date.now()}`
  templateInput.value = testContent
  templateInput.dispatchEvent(new Event('input', { bubbles: true }))
  log.info('Template modified')

  // 500ms 后切换规则
  await sleep(500)

  // 切换到 Rules 标签
  const rulesTab = Array.from(document.querySelectorAll('button')).find(
    (btn) => btn.textContent.includes('Reminder Rules') || btn.textContent.includes('规则'),
  )
  if (rulesTab) {
    rulesTab.click()
    await sleep(200)
  }

  // 找到第一个开关按钮并点击
  const toggleSwitch = document.querySelector('[role="switch"]')
  if (!toggleSwitch) {
    log.error('Toggle switch not found')
    return false
  }

  toggleSwitch.click()
  log.info('Rule toggled')

  // 等待模板防抖
  log.warn('Waiting 2 seconds for template debounce...')
  await sleep(2000)

  // 检查结果
  const final = await getConfig()
  const finalEnabled = final.reminderRules[0]?.enabled

  log.info(`Final rule enabled: ${finalEnabled}`)

  if (finalEnabled !== initialEnabled) {
    log.success('Test 2 PASSED: Toggle state preserved!')
    return true
  } else {
    log.error('Test 2 FAILED: Toggle was reverted!')
    return false
  }
}

// 启用存储监控
function enableStorageMonitoring() {
  log.info('Enabling storage monitoring...')

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.app_config) {
      const old = changes.app_config.oldValue
      const now = changes.app_config.newValue

      console.group('📦 Storage Changed')
      console.log('Rules count:', old?.reminderRules?.length || 0, '→', now?.reminderRules?.length || 0)
      if (now?.reminderRules?.[0]) {
        console.log('First rule name:', now.reminderRules[0].name)
        console.log('First rule enabled:', now.reminderRules[0].enabled)
      }
      console.log('Template changed:', old?.template?.content !== now?.template?.content)
      console.groupEnd()
    }
  })

  log.success('Storage monitoring enabled!')
}

// 运行所有测试
async function runAllTests() {
  console.clear()
  log.test('========================================')
  log.test('  Race Condition Test Suite')
  log.test('========================================')

  enableStorageMonitoring()

  const results = []

  // 测试 1
  try {
    const result1 = await test1_TemplateAndRuleEdit()
    results.push({ name: 'Test 1', passed: result1 })
  } catch (error) {
    log.error(`Test 1 error: ${error.message}`)
    results.push({ name: 'Test 1', passed: false })
  }

  await sleep(1000)

  // 测试 2
  try {
    const result2 = await test2_TemplateAndToggle()
    results.push({ name: 'Test 2', passed: result2 })
  } catch (error) {
    log.error(`Test 2 error: ${error.message}`)
    results.push({ name: 'Test 2', passed: false })
  }

  // 汇总结果
  console.log('\n')
  log.test('========================================')
  log.test('  Test Results Summary')
  log.test('========================================')

  results.forEach(({ name, passed }) => {
    if (passed) {
      log.success(`${name}: PASSED`)
    } else {
      log.error(`${name}: FAILED`)
    }
  })

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length

  console.log('\n')
  if (passedCount === totalCount) {
    log.success(`All tests passed! (${passedCount}/${totalCount})`)
  } else {
    log.error(`Some tests failed. (${passedCount}/${totalCount} passed)`)
  }

  return results
}

// 导出函数供使用
console.log('%c=== Race Condition Test Utility Loaded ===', 'color: #4CAF50; font-size: 14px; font-weight: bold')
console.log('%cRun: runAllTests()', 'color: #2196F3; font-size: 12px')
console.log('%cOr run individual tests:', 'color: #2196F3; font-size: 12px')
console.log('%c  - test1_TemplateAndRuleEdit()', 'color: #666; font-size: 11px')
console.log('%c  - test2_TemplateAndToggle()', 'color: #666; font-size: 11px')
console.log('%c  - enableStorageMonitoring()', 'color: #666; font-size: 11px')
