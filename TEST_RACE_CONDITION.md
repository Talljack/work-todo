# Race Condition Fix - Test Plan

## 问题描述

模板自动保存使用防抖（1秒），可能会覆盖在防抖期间进行的规则修改。

## 测试场景

### 场景 1: 模板编辑后立即编辑规则

**步骤**:

1. 打开 Options 页面
2. 切换到 "Default Template" 标签
3. 修改模板内容（例如添加一行 "Test 123"）
4. **立即**（1秒内）切换到 "Reminder Rules" 标签
5. 编辑第一条规则（例如修改名称为 "Modified Rule"）
6. **等待 2 秒**（确保模板防抖触发）
7. 刷新页面

**预期结果**: ✅

- 模板修改保留
- 规则修改保留（名称显示为 "Modified Rule"）

**失败表现**: ❌

- 规则修改丢失（名称恢复为原来的值）

---

### 场景 2: 模板编辑后立即添加新规则

**步骤**:

1. 打开 Options 页面
2. 切换到 "Default Template" 标签
3. 修改模板内容
4. **立即**（1秒内）切换到 "Reminder Rules" 标签
5. 点击 "Add New Reminder Rule"
6. 填写新规则信息并保存
7. **等待 2 秒**
8. 刷新页面

**预期结果**: ✅

- 模板修改保留
- 新规则存在

**失败表现**: ❌

- 新规则消失

---

### 场景 3: 模板编辑后立即删除规则

**步骤**:

1. 确保有至少 2 条规则
2. 切换到 "Default Template" 标签
3. 修改模板内容
4. **立即**（1秒内）切换到 "Reminder Rules" 标签
5. 删除第二条规则
6. **等待 2 秒**
7. 刷新页面

**预期结果**: ✅

- 模板修改保留
- 规则被删除（只剩 1 条）

**失败表现**: ❌

- 被删除的规则重新出现

---

### 场景 4: 模板编辑后立即切换规则开关

**步骤**:

1. 切换到 "Default Template" 标签
2. 修改模板内容
3. **立即**（1秒内）切换到 "Reminder Rules" 标签
4. 切换第一条规则的开关（启用 → 禁用 或 禁用 → 启用）
5. **等待 2 秒**
6. 刷新页面

**预期结果**: ✅

- 模板修改保留
- 规则开关状态保留

**失败表现**: ❌

- 规则开关状态恢复

---

### 场景 5: 连续快速编辑

**步骤**:

1. 修改模板内容
2. 0.5秒后编辑规则A
3. 0.5秒后编辑规则B
4. 0.5秒后删除规则C
5. **等待 3 秒**
6. 刷新页面

**预期结果**: ✅

- 所有修改都保留

**失败表现**: ❌

- 部分修改丢失

---

## 使用 Chrome DevTools 验证

### 监控存储变化

在 Console 中运行以下代码来监控 storage 变化：

```javascript
// 监听存储变化
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.app_config) {
    console.log('=== Config Changed ===')
    console.log('Old:', changes.app_config.oldValue)
    console.log('New:', changes.app_config.newValue)

    const oldRules = changes.app_config.oldValue?.reminderRules || []
    const newRules = changes.app_config.newValue?.reminderRules || []

    console.log('Rules count:', oldRules.length, '→', newRules.length)
    console.log(
      'Template changed:',
      changes.app_config.oldValue?.template?.content !== changes.app_config.newValue?.template?.content,
    )
  }
})

// 查看当前配置
chrome.storage.sync.get('app_config', (result) => {
  console.log('Current config:', result.app_config)
})
```

### 测试时查看时间线

1. 打开 DevTools Console
2. 执行上面的监控代码
3. 执行测试场景
4. 观察 Console 输出
5. 验证：
   - ✅ 每次保存都是最新的完整 config
   - ❌ 保存了旧的 config 快照

---

## 自动化测试脚本

可以使用以下脚本快速测试：

```javascript
// 在 Options 页面的 Console 中运行

async function testRaceCondition() {
  console.log('🧪 Testing race condition...')

  // 1. 获取初始配置
  const initialConfig = await chrome.storage.sync.get('app_config')
  const initialRulesCount = initialConfig.app_config.reminderRules.length
  console.log('Initial rules count:', initialRulesCount)

  // 2. 触发模板修改（这会启动 1 秒防抖）
  console.log('⏰ Triggering template change...')
  const templateTextarea = document.querySelector('#template-content')
  templateTextarea.value = 'TEST CONTENT ' + Date.now()
  templateTextarea.dispatchEvent(new Event('input', { bubbles: true }))

  // 3. 500ms 后修改规则（在防抖期间）
  setTimeout(async () => {
    console.log('⚡ Triggering rule change (before debounce)...')

    // 模拟点击编辑按钮
    const editButton = document.querySelector('[title="Edit"]')
    if (editButton) {
      editButton.click()

      // 等待对话框打开，然后修改名称
      setTimeout(() => {
        const nameInput = document.querySelector('#rule-name')
        if (nameInput) {
          nameInput.value = 'RACE_TEST_' + Date.now()
          nameInput.dispatchEvent(new Event('input', { bubbles: true }))

          // 保存
          setTimeout(() => {
            const saveButton = document.querySelector('button:contains("Save")')
            saveButton?.click()
          }, 100)
        }
      }, 100)
    }
  }, 500)

  // 4. 2 秒后检查结果
  setTimeout(async () => {
    const finalConfig = await chrome.storage.sync.get('app_config')
    const finalRulesCount = finalConfig.app_config.reminderRules.length
    const ruleName = finalConfig.app_config.reminderRules[0].name

    console.log('Final rules count:', finalRulesCount)
    console.log('First rule name:', ruleName)

    if (ruleName.startsWith('RACE_TEST_')) {
      console.log('✅ TEST PASSED: Rule change preserved!')
    } else {
      console.log('❌ TEST FAILED: Rule change was overwritten!')
    }
  }, 2000)
}

// 运行测试
testRaceCondition()
```

---

## 测试检查清单

- [ ] 场景 1: 模板编辑后立即编辑规则
- [ ] 场景 2: 模板编辑后立即添加新规则
- [ ] 场景 3: 模板编辑后立即删除规则
- [ ] 场景 4: 模板编辑后立即切换规则开关
- [ ] 场景 5: 连续快速编辑
- [ ] Chrome DevTools 监控验证
- [ ] 自动化测试脚本验证

## 修复验证

如果所有测试通过，说明竞态条件已被成功修复。

修复原理：使用 `useRef` 保存最新的 config 引用，防抖回调执行时使用 `configRef.current` 获取最新状态，而不是闭包中捕获的旧快照。
