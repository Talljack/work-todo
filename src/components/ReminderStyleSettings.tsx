import React from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import type { AppConfig, SoundStyle, MessageStyle } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { soundManager } from '@/utils/soundManager'
import { messageStyleManager } from '@/utils/messageStyleManager'

interface ReminderStyleSettingsProps {
  config: AppConfig
  onConfigChange: (config: AppConfig) => void
}

const STYLE_OPTIONS: Array<{
  value: SoundStyle | MessageStyle
  label: { en: string; zh: string }
  description: { en: string; zh: string }
  icon: string
}> = [
  {
    value: 'professional',
    label: { en: 'Professional', zh: '专业严肃' },
    description: {
      en: 'Formal and appropriate for business settings',
      zh: '正式得体，适合企业用户',
    },
    icon: '💼',
  },
  {
    value: 'cute',
    label: { en: 'Cute & Gentle', zh: '可爱温柔' },
    description: {
      en: 'Playful and friendly with emojis',
      zh: '拟人化、有emoji',
    },
    icon: '🌸',
  },
  {
    value: 'motivational',
    label: { en: 'Motivational', zh: '激励鼓舞' },
    description: {
      en: 'Encouraging and achievement-focused',
      zh: '正能量、强调成就',
    },
    icon: '💪',
  },
  {
    value: 'humorous',
    label: { en: 'Humorous', zh: '幽默诙谐' },
    description: {
      en: 'Light-hearted and fun',
      zh: '轻松搞笑',
    },
    icon: '😄',
  },
  {
    value: 'minimal',
    label: { en: 'Minimal', zh: '极简风格' },
    description: {
      en: 'Simple and concise',
      zh: '简洁直接',
    },
    icon: '⚪',
  },
]

const ReminderStyleSettings: React.FC<ReminderStyleSettingsProps> = ({ config, onConfigChange }) => {
  const { i18n } = useTranslation()
  const isZh = i18n.language.startsWith('zh')

  const handleSoundStyleChange = (style: SoundStyle) => {
    const newConfig = { ...config, soundStyle: style }
    onConfigChange(newConfig)
  }

  const handleMessageStyleChange = (style: MessageStyle) => {
    const newConfig = { ...config, messageStyle: style }
    onConfigChange(newConfig)
  }

  const handleSoundEnabledChange = (enabled: boolean) => {
    const newConfig = { ...config, soundEnabled: enabled }
    onConfigChange(newConfig)
  }

  const handleSmartMessageEnabledChange = (enabled: boolean) => {
    const newConfig = { ...config, smartMessageEnabled: enabled }
    onConfigChange(newConfig)
  }

  const handleVolumeChange = (value: number[]) => {
    const volume = value[0]
    const newConfig = { ...config, soundVolume: volume }
    soundManager.setVolume(volume)
    onConfigChange(newConfig)
  }

  const handleTestSound = async () => {
    const style = config.soundStyle || 'professional'
    await soundManager.play(style, 'normal')
  }

  const handlePreviewMessage = () => {
    const style = config.messageStyle || 'professional'
    const lang = isZh ? 'zh' : 'en'
    const message = messageStyleManager.getRandomMessage(
      style,
      'first',
      {
        streak: 7,
        time: new Date().toLocaleTimeString(),
      },
      lang,
    )

    // 使用 toast 显示消息预览
    toast(message, {
      duration: 5000,
      icon: '💬',
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
        padding: '16px',
        fontSize: '14px',
        maxWidth: '500px',
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{isZh ? '提醒样式设置' : 'Reminder Styles'}</h1>
        <p className="text-muted-foreground text-lg">
          {isZh
            ? '自定义声音和文案风格，让提醒更生动有趣'
            : 'Customize the sound and message style of your reminders to make them more engaging'}
        </p>
      </div>

      {/* 声音提醒设置 */}
      <Card className="overflow-hidden border-2 transition-all hover:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <span className="text-2xl">🔊</span>
              </div>
              <div>
                <CardTitle className="text-xl">{isZh ? '声音提醒' : 'Sound Reminders'}</CardTitle>
                <CardDescription className="mt-1">
                  {isZh ? '为提醒添加声音效果，让通知更有温度' : 'Add sound effects to make reminders more engaging'}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.soundEnabled === true}
              onCheckedChange={handleSoundEnabledChange}
              aria-label={isZh ? '启用声音提醒' : 'Enable sound reminders'}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardHeader>
        {config.soundEnabled === true && (
          <CardContent className="space-y-6 pt-6">
            {/* 声音风格选择 - 卡片式 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{isZh ? '声音风格' : 'Sound Style'}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSoundStyleChange(option.value as SoundStyle)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      hover:shadow-md hover:scale-105 active:scale-95
                      ${
                        config.soundStyle === option.value || (!config.soundStyle && option.value === 'professional')
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{isZh ? option.label.zh : option.label.en}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {isZh ? option.description.zh : option.description.en}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 音量控制 */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <span className="text-lg">🔉</span>
                  {isZh ? '音量' : 'Volume'}
                </Label>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 min-w-[4rem] text-right">
                  {config.soundVolume || 70}%
                </span>
              </div>
              <Slider
                value={[config.soundVolume || 70]}
                onValueChange={handleVolumeChange}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* 试听按钮 */}
            <Button
              onClick={handleTestSound}
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              🎵 {isZh ? '试听声音' : 'Preview Sound'}
            </Button>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <span className="text-base">💡</span>
              <span>
                {isZh
                  ? '不同紧急程度的提醒会播放不同的声音效果'
                  : 'Different urgency levels will play different sound effects'}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 文案风格设置 */}
      <Card className="overflow-hidden border-2 transition-all hover:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <CardTitle className="text-xl">{isZh ? '提醒文案' : 'Message Style'}</CardTitle>
                <CardDescription className="mt-1">
                  {isZh
                    ? '选择提醒文案的风格，让每次提醒都有新鲜感'
                    : 'Choose message style to keep reminders fresh and engaging'}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.smartMessageEnabled === true}
              onCheckedChange={handleSmartMessageEnabledChange}
              aria-label={isZh ? '启用智能文案' : 'Enable smart messages'}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardHeader>
        {config.smartMessageEnabled === true && (
          <CardContent className="space-y-6 pt-6">
            {/* 文案风格选择 - 卡片式 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{isZh ? '文案风格' : 'Message Style'}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMessageStyleChange(option.value as MessageStyle)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      hover:shadow-md hover:scale-105 active:scale-95
                      ${
                        config.messageStyle === option.value ||
                        (!config.messageStyle && option.value === 'professional')
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/50 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{isZh ? option.label.zh : option.label.en}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {isZh ? option.description.zh : option.description.en}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 预览按钮 */}
            <Button
              onClick={handlePreviewMessage}
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              👁️ {isZh ? '预览文案' : 'Preview Message'}
            </Button>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-base">💡</span>
                <span>
                  {isZh
                    ? '系统会从20-30条文案中随机选择，避免重复'
                    : 'System randomly selects from 20-30 messages to avoid repetition'}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <span className="text-base">⚡</span>
                <span>
                  {isZh
                    ? '文案会根据提醒次数和紧急程度自动调整语气'
                    : 'Messages adapt based on reminder count and urgency'}
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 风格同步说明 */}
      <Card className="overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 shadow-md">
        <CardHeader className="border-b border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-gray-900/50">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            <span className="text-lg">{isZh ? '关于提醒风格' : 'About Reminder Styles'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <span className="text-xl">✨</span>
            <p className="text-sm">
              {isZh
                ? '声音和文案风格会自动匹配，为您提供一致的提醒体验。'
                : 'Sound and message styles are automatically matched for a consistent experience.'}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg">
            <span className="text-xl">🎯</span>
            <p className="text-sm">
              {isZh
                ? '系统会根据提醒时间、距离截止时间等因素，智能调整提醒的紧急程度。'
                : 'The system intelligently adjusts urgency based on reminder time and deadline proximity.'}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-950/40 dark:to-purple-950/40 rounded-lg border border-pink-200 dark:border-pink-800">
            <span className="text-xl">💝</span>
            <p className="text-sm font-semibold">
              {isZh ? '让提醒有温度，而不仅仅是通知！' : 'Make reminders engaging, not just notifications!'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReminderStyleSettings
