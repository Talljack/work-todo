import browser from 'webextension-polyfill'

/**
 * Sound Manager
 * 管理提醒声音的播放
 */

export type SoundStyle = 'professional' | 'cute' | 'minimal' | 'motivational' | 'humorous'
export type SoundUrgency = 'gentle' | 'normal' | 'urgent'

/**
 * 声音预设配置
 * 每种风格对应3种紧急程度的声音
 */
export const SOUND_PRESETS: Record<SoundStyle, Record<SoundUrgency, string>> = {
  professional: {
    gentle: 'sounds/professional-gentle.mp3',
    normal: 'sounds/professional-normal.mp3',
    urgent: 'sounds/professional-urgent.mp3',
  },
  cute: {
    gentle: 'sounds/cute-gentle.mp3',
    normal: 'sounds/cute-normal.mp3',
    urgent: 'sounds/cute-urgent.mp3',
  },
  minimal: {
    gentle: 'sounds/minimal-gentle.mp3',
    normal: 'sounds/minimal-normal.mp3',
    urgent: 'sounds/minimal-urgent.mp3',
  },
  motivational: {
    gentle: 'sounds/motivational-gentle.mp3',
    normal: 'sounds/motivational-normal.mp3',
    urgent: 'sounds/motivational-urgent.mp3',
  },
  humorous: {
    gentle: 'sounds/humorous-gentle.mp3',
    normal: 'sounds/humorous-normal.mp3',
    urgent: 'sounds/humorous-urgent.mp3',
  },
}

/**
 * 声音管理器类
 */
export class SoundManager {
  private audio: HTMLAudioElement | null = null
  private volume: number = 70 // 默认音量 70%

  /**
   * 播放声音
   * @param style 声音风格
   * @param urgency 紧急程度
   * @returns Promise<void>
   */
  async play(style: SoundStyle, urgency: SoundUrgency): Promise<void> {
    try {
      const soundPath = SOUND_PRESETS[style][urgency]

      // 如果正在播放，先停止
      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }

      // 在扩展中使用 browser.runtime.getURL
      const soundUrl = browser.runtime.getURL(soundPath)
      this.audio = new Audio(soundUrl)
      this.audio.volume = this.volume / 100

      await this.audio.play()

      console.log(`✓ Sound played: ${style} - ${urgency}`)
    } catch (error) {
      console.error('Failed to play sound:', error)
      // 播放失败不影响主流程，静默处理
    }
  }

  /**
   * 设置音量
   * @param volume 音量 (0-100)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume))
    if (this.audio) {
      this.audio.volume = this.volume / 100
    }
  }

  /**
   * 获取当前音量
   * @returns 当前音量 (0-100)
   */
  getVolume(): number {
    return this.volume
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }

  /**
   * 测试播放声音（用于UI预览）
   * @param style 声音风格
   * @param urgency 紧急程度
   */
  async test(style: SoundStyle, urgency: SoundUrgency): Promise<void> {
    await this.play(style, urgency)
  }

  /**
   * 根据提醒次数判断紧急程度
   * @param reminderCount 提醒次数（第几次提醒）
   * @returns 紧急程度
   */
  static getUrgencyByReminderCount(reminderCount: number): SoundUrgency {
    if (reminderCount === 0) return 'gentle'
    if (reminderCount <= 2) return 'normal'
    return 'urgent'
  }

  /**
   * 根据距离截止时间判断紧急程度
   * @param minutesToDeadline 距离截止时间的分钟数
   * @returns 紧急程度
   */
  static getUrgencyByTimeToDeadline(minutesToDeadline: number): SoundUrgency {
    if (minutesToDeadline > 60) return 'gentle'
    if (minutesToDeadline > 15) return 'normal'
    return 'urgent'
  }
}

/**
 * 全局声音管理器实例
 */
export const soundManager = new SoundManager()
