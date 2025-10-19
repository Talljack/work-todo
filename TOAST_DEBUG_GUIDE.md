## Toast 调试步骤

### 步骤1: 检查扩展是否正确加载

1. 打开 Chrome 扩展管理页面: `chrome://extensions/`
2. 找到"日常提醒助手"扩展
3. 确认扩展已启用（开关是打开的）
4. 点击"重新加载"按钮（刷新图标）

### 步骤2: 检查 Service Worker 是否运行

1. 在扩展管理页面，找到"日常提醒助手"
2. 点击"检查视图 service worker"
3. 会打开一个新的DevTools窗口
4. 在Console中应该能看到: `Background service worker loaded`

### 步骤3: 检查 Content Script 是否注入

1. 打开一个普通网页（如：https://www.baidu.com）
2. 按F12打开DevTools
3. 在Console中输入并回车:
   ```javascript
   console.log('Testing content script injection...')
   ```
4. 然后运行:
   ```javascript
   chrome.runtime.sendMessage(
     {
       type: 'TEST_TOAST',
       message: '测试Toast',
       duration: 10000,
     },
     (response) => {
       console.log('Response:', response)
     },
   )
   ```

### 步骤4: 查看详细日志

在Service Worker的Console中，你应该能看到：

```
Testing toast with message: 测试Toast
Found X total tabs
Attempting to send toast to tab XXX: https://...
✓ Toast sent to tab XXX
```

或者错误信息：

```
✗ Failed to send toast to tab XXX: Error: ...
```

### 步骤5: 检查页面Console

在网页的Console中，你应该能看到：

```
Routine Reminder content script loaded
```

如果看不到这行，说明content script没有注入。

### 常见问题和解决方案

#### 问题1: Content Script 没有加载

**解决方案**:

1. 重新加载扩展
2. 刷新网页
3. 确保网页不是特殊页面（不是chrome://、chrome-extension://等）

#### 问题2: 消息发送失败

**解决方案**:

1. 检查Service Worker Console有没有错误
2. 确认TEST_TOAST消息类型已添加到types
3. 重新构建并加载扩展

#### 问题3: Toast容器没有创建

**解决方案**:
在网页Console运行：

```javascript
document.getElementById('work-todo-toast-container')
```

如果返回null，说明容器没创建，content script可能有问题。

### 完整测试命令

在**网页Console**中运行（不是Service Worker Console）:

```javascript
// 1. 检查content script是否加载
console.log('Content script loaded:', !!chrome.runtime)

// 2. 发送测试消息
chrome.runtime.sendMessage(
  {
    type: 'TEST_TOAST',
    message: '这是测试Toast！',
    duration: 10000,
  },
  (response) => {
    console.log('消息发送结果:', response)
    if (chrome.runtime.lastError) {
      console.error('发送错误:', chrome.runtime.lastError)
    }
  },
)

// 3. 检查toast容器
setTimeout(() => {
  const container = document.getElementById('work-todo-toast-container')
  console.log('Toast容器:', container)
}, 1000)
```

### 如果还是不行

请截图并提供：

1. Service Worker Console的输出
2. 网页Console的输出
3. 扩展管理页面的截图
