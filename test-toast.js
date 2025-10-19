/**
 * Toast 测试脚本
 *
 * 使用方法：
 * 1. 打开任意网页
 * 2. 打开浏览器控制台 (F12)
 * 3. 复制整个脚本并粘贴到控制台
 * 4. 按回车执行
 */

// 测试基本 Toast
async function testBasicToast() {
  console.log('[测试] 发送基本 Toast...')
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'TEST_TOAST',
      message: '这是一个测试 Toast 消息！',
      duration: 10000,
    })
    console.log('[成功] Toast 已发送:', response)
  } catch (error) {
    console.error('[错误]', error)
  }
}

// 测试带链接的 Toast
async function testToastWithUrl() {
  console.log('[测试] 发送带链接的 Toast...')
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'TEST_TOAST',
      message: '点击这个 Toast 将打开 Google',
      duration: 15000,
      url: 'https://www.google.com',
    })
    console.log('[成功] 带链接的 Toast 已发送:', response)
  } catch (error) {
    console.error('[错误]', error)
  }
}

// 测试长时间 Toast (30秒)
async function testLongToast() {
  console.log('[测试] 发送长时间 Toast (30秒)...')
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'TEST_TOAST',
      message: '这个 Toast 将显示 30 秒钟',
      duration: 30000,
    })
    console.log('[成功] 长时间 Toast 已发送:', response)
  } catch (error) {
    console.error('[错误]', error)
  }
}

// 测试多个 Toast
async function testMultipleToasts() {
  console.log('[测试] 发送多个 Toast...')
  const messages = ['第一个提醒消息', '第二个提醒消息', '第三个提醒消息']

  for (let i = 0; i < messages.length; i++) {
    try {
      await chrome.runtime.sendMessage({
        type: 'TEST_TOAST',
        message: messages[i],
        duration: 5000,
      })
      console.log(`[成功] Toast ${i + 1}/${messages.length} 已发送`)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error('[错误]', error)
    }
  }
}

// 自定义 Toast
async function testCustomToast(message, duration = 10000, url = '') {
  console.log('[测试] 发送自定义 Toast...', { message, duration, url })
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'TEST_TOAST',
      message,
      duration,
      url,
    })
    console.log('[成功] 自定义 Toast 已发送:', response)
  } catch (error) {
    console.error('[错误]', error)
  }
}

// 显示使用说明
console.log('%c🔔 Toast 测试脚本已加载', 'color: #667eea; font-size: 16px; font-weight: bold;')
console.log('%c可用的测试函数:', 'color: #667eea; font-size: 14px;')
console.log('  testBasicToast()         - 测试基本 Toast')
console.log('  testToastWithUrl()       - 测试带链接的 Toast')
console.log('  testLongToast()          - 测试长时间 Toast (30秒)')
console.log('  testMultipleToasts()     - 测试多个 Toast')
console.log('  testCustomToast(msg, duration, url) - 自定义 Toast')
console.log('')
console.log('%c示例:', 'color: #667eea; font-weight: bold;')
console.log('  testBasicToast()')
console.log('  testCustomToast("你好！", 15000)')
console.log('  testCustomToast("点我", 10000, "https://google.com")')
console.log('')
console.log('%c💡 提示: 直接调用上面的函数来测试 Toast 功能', 'color: #fbbf24; font-size: 12px;')

// 自动运行一个基本测试
console.log('')
console.log('%c⚡ 自动测试: 3秒后发送一个测试 Toast...', 'color: #22c55e;')
setTimeout(() => {
  testBasicToast()
}, 3000)
