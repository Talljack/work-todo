# 如何测试竞态条件修复

## 快速测试（推荐）

### 方法 1: 使用自动化测试脚本 🤖

1. **重新加载扩展**

   ```
   chrome://extensions/ → 找到扩展 → 点击刷新图标
   ```

2. **打开 Options 页面**
   - 点击扩展图标 → 点击设置按钮
   - 或在扩展管理页面点击"选项"

3. **打开 DevTools Console**
   - 按 `F12` 或 `Cmd+Option+I` (Mac)
   - 切换到 Console 标签

4. **加载测试脚本**
   - 打开文件 `test-race-condition.js`
   - 复制所有内容
   - 粘贴到 Console 并回车

5. **运行测试**

   ```javascript
   runAllTests()
   ```

6. **查看结果**
   - ✅ 绿色 = 测试通过
   - ❌ 红色 = 测试失败

---

### 方法 2: 手动测试 👆

#### 测试步骤

1. **打开 Options 页面**

2. **执行以下操作**:
   - 切换到 "Default Template" 标签
   - 修改模板，添加一行 "TEST 123"
   - **立即**（1秒内）切换到 "Reminder Rules" 标签
   - 点击第一条规则的编辑按钮 ✏️
   - 修改规则名称为 "Modified Test Rule"
   - 点击 Save
   - **等待 2 秒**
   - 刷新页面 (F5)

3. **检查结果**:
   - ✅ 规则名称应该还是 "Modified Test Rule"
   - ✅ 模板内容包含 "TEST 123"
   - ❌ 如果规则名称恢复，说明修复失败

---

## 监控存储变化（可选）

在 Console 中运行此代码来实时监控配置保存：

```javascript
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.app_config) {
    const old = changes.app_config.oldValue
    const now = changes.app_config.newValue

    console.log('📦 Config saved:')
    console.log('  Rules:', old?.reminderRules?.length, '→', now?.reminderRules?.length)
    console.log('  First rule:', now?.reminderRules[0]?.name)
    console.log('  Template changed:', old?.template?.content !== now?.template?.content)
  }
})

console.log('✅ Monitoring enabled')
```

然后执行测试，观察输出。

---

## 预期结果

### ✅ 修复成功的表现

```
📦 Config saved:
  Rules: 2 → 2
  First rule: Modified Test Rule  ← 保留修改
  Template changed: true

✅ Test PASSED: Both changes preserved!
```

### ❌ 修复失败的表现

```
📦 Config saved:
  Rules: 2 → 2
  First rule: Daily Routine Reminder  ← 被覆盖
  Template changed: true

❌ Test FAILED: Rule change was overwritten!
```

---

## 测试场景覆盖

自动化测试脚本包含：

- ✅ 模板编辑 + 规则编辑（在防抖期间）
- ✅ 模板编辑 + 规则开关切换（在防抖期间）
- ✅ 存储变化实时监控

更多测试场景请参考 `TEST_RACE_CONDITION.md`

---

## 问题诊断

如果测试失败：

1. **检查修复是否已应用**

   ```javascript
   // 在 Console 查看 Options 组件代码
   console.log(Options.toString())
   // 应该看到 configRef.current
   ```

2. **检查扩展版本**
   - 确保使用的是最新构建的版本
   - 查看 `dist/` 目录的构建时间

3. **清除缓存**
   ```
   chrome://extensions/ → 扩展详情 → 清除存储
   ```

---

## 报告测试结果

请将测试结果报告给开发者：

- 使用了哪个测试方法？
- 测试通过还是失败？
- Console 输出是什么？
- 截图（如果有的话）
