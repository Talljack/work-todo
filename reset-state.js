// 在浏览器控制台 (F12) 粘贴这段代码并回车，清除今天的状态数据

chrome.storage.local.set(
  {
    daily_state: {
      date: new Date().toISOString().split('T')[0],
      completedRules: [],
    },
  },
  () => {
    console.log('✅ 状态已重置！请重新打开 Popup')
    // 重新加载扩展
    chrome.runtime.reload()
  },
)
