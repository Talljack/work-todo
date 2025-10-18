/**
 * 简化版测试脚本 - 直接粘贴到 Console 运行
 *
 * 使用步骤：
 * 1. 打开扩展的 Options 页面
 * 2. 按 F12 打开 DevTools
 * 3. 复制下面的全部代码
 * 4. 粘贴到 Console 并按回车
 * 5. 测试会自动运行
 */

;(async function () {
  console.clear()
  console.log('%c🧪 启动竞态条件测试...', 'color: #9C27B0; font-size: 16px; font-weight: bold')
  console.log('')

  // 辅助函数
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const getConfig = () =>
    new Promise((resolve) => {
      chrome.storage.sync.get('app_config', (result) => resolve(result.app_config))
    })

  // 测试前检查
  console.log('%c📋 检查环境...', 'color: #2196F3; font-weight: bold')

  const templateInput = document.querySelector('#template-content')
  if (!templateInput) {
    console.log('%c❌ 错误: 请确保在 Default Template 标签页', 'color: #F44336; font-weight: bold')
    console.log('%c请切换到 "Default Template" 标签后重新运行', 'color: #FF9800')
    return
  }
  console.log('%c✓ Template 标签页已就绪', 'color: #4CAF50')

  // 启用监控
  console.log('%c✓ 启用存储监控', 'color: #4CAF50')
  let saveCount = 0
  const savedConfigs = []

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.app_config) {
      saveCount++
      const now = changes.app_config.newValue
      savedConfigs.push({
        time: Date.now(),
        rulesCount: now?.reminderRules?.length || 0,
        ruleName: now?.reminderRules?.[0]?.name || 'N/A',
        templatePreview: (now?.template?.content || '').substring(0, 30) + '...',
      })

      console.log(`%c📦 保存 #${saveCount}`, 'color: #2196F3; font-weight: bold')
      console.log('  规则名称:', now?.reminderRules?.[0]?.name)
      console.log('  规则数量:', now?.reminderRules?.length)
    }
  })

  console.log('')
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666')
  console.log('%c🧪 测试: 模板编辑 + 规则修改（竞态条件）', 'color: #9C27B0; font-size: 14px; font-weight: bold')
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666')
  console.log('')

  // 获取初始状态
  const initial = await getConfig()
  const initialRuleName = initial.reminderRules[0]?.name || 'Unknown'
  console.log('%c1️⃣ 初始状态', 'color: #2196F3; font-weight: bold')
  console.log('   规则名称:', initialRuleName)
  console.log('')

  // 修改模板
  const testContent = `TEST_TEMPLATE_${Date.now()}\n\n原模板内容保留`
  templateInput.value = testContent
  templateInput.dispatchEvent(new Event('input', { bubbles: true }))

  console.log('%c2️⃣ 修改模板内容', 'color: #2196F3; font-weight: bold')
  console.log('   ⏰ 防抖计时器已启动 (1秒后保存)')
  console.log('')

  // 等待 500ms 后修改规则
  await sleep(500)
  console.log('%c3️⃣ 500ms 后 - 切换到 Rules 标签', 'color: #2196F3; font-weight: bold')

  const rulesTab = Array.from(document.querySelectorAll('button')).find(
    (btn) => btn.textContent.includes('Reminder Rules') || btn.textContent.includes('规则'),
  )

  if (rulesTab) {
    rulesTab.click()
    await sleep(300)
    console.log('   ✓ 已切换到 Reminder Rules')
  }
  console.log('')

  // 点击编辑
  console.log('%c4️⃣ 编辑第一条规则', 'color: #2196F3; font-weight: bold')
  const editBtn = document.querySelector('[title="Edit"]')
  if (!editBtn) {
    console.log('%c❌ 找不到编辑按钮', 'color: #F44336')
    return
  }

  editBtn.click()
  await sleep(400)
  console.log('   ✓ 编辑对话框已打开')

  // 修改名称
  const nameInput = document.querySelector('#rule-name')
  if (!nameInput) {
    console.log('%c❌ 找不到名称输入框', 'color: #F44336')
    return
  }

  const newRuleName = `RACE_TEST_${Date.now()}`
  nameInput.value = newRuleName
  nameInput.dispatchEvent(new Event('input', { bubbles: true }))

  console.log('   新名称:', newRuleName)
  console.log('')

  // 保存规则
  await sleep(200)
  const saveBtn = Array.from(document.querySelectorAll('button')).find(
    (btn) => btn.textContent === 'Save' || btn.textContent === '保存',
  )

  if (saveBtn) {
    saveBtn.click()
    console.log('%c5️⃣ 保存规则修改', 'color: #2196F3; font-weight: bold')
    console.log('   ⚡ 规则自动保存会立即执行')
  }
  console.log('')

  // 等待模板防抖触发
  console.log('%c⏳ 等待 2 秒让模板防抖触发...', 'color: #FF9800; font-weight: bold')
  await sleep(2000)
  console.log('')

  // 检查最终结果
  console.log('%c6️⃣ 检查最终结果', 'color: #2196F3; font-weight: bold')
  const final = await getConfig()
  const finalRuleName = final.reminderRules[0]?.name
  const finalTemplate = final.template.content

  console.log('   最终规则名称:', finalRuleName)
  console.log('   模板包含测试内容:', finalTemplate.includes('TEST_TEMPLATE'))
  console.log('')

  // 显示保存历史
  console.log('%c📊 保存历史 (总共 ' + saveCount + ' 次)', 'color: #2196F3; font-weight: bold')
  savedConfigs.forEach((cfg, idx) => {
    console.log(`   #${idx + 1}: ${cfg.ruleName}`)
  })
  console.log('')

  // 验证结果
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666')
  console.log('%c📈 测试结果', 'color: #9C27B0; font-size: 14px; font-weight: bold')
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666')
  console.log('')

  const rulePassed = finalRuleName === newRuleName
  const templatePassed = finalTemplate.includes('TEST_TEMPLATE')

  if (rulePassed && templatePassed) {
    console.log('%c✅ 测试通过！', 'color: #4CAF50; font-size: 18px; font-weight: bold')
    console.log('%c规则修改已保留: ' + finalRuleName, 'color: #4CAF50')
    console.log('%c模板修改已保留', 'color: #4CAF50')
    console.log('')
    console.log('%c🎉 竞态条件已修复！', 'color: #4CAF50; font-size: 16px; font-weight: bold')
  } else {
    console.log('%c❌ 测试失败！', 'color: #F44336; font-size: 18px; font-weight: bold')
    console.log('')

    if (!rulePassed) {
      console.log('%c规则被覆盖了:', 'color: #F44336; font-weight: bold')
      console.log('   期望:', newRuleName)
      console.log('   实际:', finalRuleName)
    }

    if (!templatePassed) {
      console.log('%c模板丢失了', 'color: #F44336; font-weight: bold')
    }

    console.log('')
    console.log('%c⚠️ 竞态条件仍然存在！', 'color: #F44336; font-size: 16px; font-weight: bold')
  }

  console.log('')
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #666')
  console.log('')

  // 提供刷新测试建议
  if (rulePassed && templatePassed) {
    console.log('%c💡 建议: 刷新页面验证持久化', 'color: #2196F3')
    console.log('   按 F5 刷新后，检查规则名称是否还是:', newRuleName)
  }
})()
