import React from 'react'
import ReactDOM from 'react-dom/client'
import toast, { Toaster } from 'react-hot-toast'
import browser from 'webextension-polyfill'

/**
 * Content Script - 用于在页面上显示 Toast 提醒
 */

// 创建 Toast 容器
let toastRoot: ReactDOM.Root | null = null

function initToastContainer() {
  if (toastRoot) return

  // 创建容器元素
  const container = document.createElement('div')
  container.id = 'work-todo-toast-container'
  document.body.appendChild(container)

  // 创建 React 根节点并渲染 Toaster
  toastRoot = ReactDOM.createRoot(container)
  toastRoot.render(
    React.createElement(Toaster, {
      position: 'top-right',
      toastOptions: {
        duration: 10000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          fontSize: '14px',
          maxWidth: '400px',
        },
      },
    }),
  )
}

// 监听来自后台的消息
browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const msg = message as { type: string; message?: string; duration?: number }

  if (msg.type === 'SHOW_TOAST') {
    initToastContainer()

    // 获取持续时间（默认 30 秒）
    const duration = msg.duration || 30000

    // 显示自定义 toast
    toast.custom(
      (t) =>
        React.createElement(
          'div',
          {
            onClick: () => {
              browser.runtime.sendMessage({ type: 'OPEN_OPTIONS' })
              toast.dismiss(t.id)
            },
            style: {
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              cursor: 'pointer',
            },
          },
          React.createElement('div', { style: { fontSize: '24px' } }, '⏰'),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'div',
              { style: { fontWeight: 600, fontSize: '16px', marginBottom: '4px' } },
              '工作 TODO 提醒',
            ),
            React.createElement('div', { style: { opacity: 0.95, lineHeight: 1.5 } }, msg.message || ''),
          ),
          React.createElement(
            'button',
            {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                toast.dismiss(t.id)
              },
              style: {
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: 0,
                transition: 'background 0.2s',
              },
            },
            '×',
          ),
        ),
      {
        duration,
      },
    )

    sendResponse({ success: true })
  }
  return true
})

console.log('Work TODO Reminder content script loaded')
