/**
 * 后台消息类型
 */
export type BackgroundMessageType = 'REINIT_ALARMS' | 'GET_STATE' | 'MARK_SENT' | 'OPEN_OPTIONS' | 'TEST_TOAST'

/**
 * 后台消息
 */
export interface BackgroundMessage {
  type: BackgroundMessageType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any // 允许任意类型的载荷
}

/**
 * 后台响应
 */
export interface BackgroundResponse {
  success: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any // 允许任意类型的数据
  error?: string
}
