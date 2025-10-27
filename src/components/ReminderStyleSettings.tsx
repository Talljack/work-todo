import React from 'react'
import { useTranslation } from 'react-i18next'
import type { AppConfig, SoundStyle, MessageStyle } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    alert(message)
  }

  return (
    <div className="space-y-6">
      {/* 声音提醒设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">🔊 {isZh ? '声音提醒' : 'Sound Reminders'}</CardTitle>
              <CardDescription>
                {isZh ? '为提醒添加声音效果，让通知更有温度' : 'Add sound effects to make reminders more engaging'}
              </CardDescription>
            </div>
            <Switch
              checked={config.soundEnabled !== false}
              onCheckedChange={handleSoundEnabledChange}
              aria-label={isZh ? '启用声音提醒' : 'Enable sound reminders'}
            />
          </div>
        </CardHeader>
        {config.soundEnabled !== false && (
          <CardContent className="space-y-4">
            {/* 声音风格选择 */}
            <div className="space-y-2">
              <Label>{isZh ? '声音风格' : 'Sound Style'}</Label>
              <Select
                value={config.soundStyle || 'professional'}
                onValueChange={(value) => handleSoundStyleChange(value as SoundStyle)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{isZh ? option.label.zh : option.label.en}</div>
                          <div className="text-xs text-muted-foreground">
                            {isZh ? option.description.zh : option.description.en}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 音量控制 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{isZh ? '音量' : 'Volume'}</Label>
                <span className="text-sm text-muted-foreground">{config.soundVolume || 70}%</span>
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
            <Button onClick={handleTestSound} variant="outline" size="sm" className="w-full">
              🎵 {isZh ? '试听声音' : 'Preview Sound'}
            </Button>

            <div className="text-xs text-muted-foreground">
              {isZh
                ? '💡 提示：不同紧急程度的提醒会播放不同的声音效果'
                : '💡 Tip: Different urgency levels will play different sound effects'}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 文案风格设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">💬 {isZh ? '提醒文案' : 'Message Style'}</CardTitle>
              <CardDescription>
                {isZh
                  ? '选择提醒文案的风格，让每次提醒都有新鲜感'
                  : 'Choose message style to keep reminders fresh and engaging'}
              </CardDescription>
            </div>
            <Switch
              checked={config.smartMessageEnabled !== false}
              onCheckedChange={handleSmartMessageEnabledChange}
              aria-label={isZh ? '启用智能文案' : 'Enable smart messages'}
            />
          </div>
        </CardHeader>
        {config.smartMessageEnabled !== false && (
          <CardContent className="space-y-4">
            {/* 文案风格选择 */}
            <div className="space-y-2">
              <Label>{isZh ? '文案风格' : 'Message Style'}</Label>
              <Select
                value={config.messageStyle || 'professional'}
                onValueChange={(value) => handleMessageStyleChange(value as MessageStyle)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{isZh ? option.label.zh : option.label.en}</div>
                          <div className="text-xs text-muted-foreground">
                            {isZh ? option.description.zh : option.description.en}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 预览按钮 */}
            <Button onClick={handlePreviewMessage} variant="outline" size="sm" className="w-full">
              👁️ {isZh ? '预览文案' : 'Preview Message'}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                {isZh
                  ? '💡 提示：系统会从20-30条文案中随机选择，避免重复'
                  : '💡 Tip: System randomly selects from 20-30 messages to avoid repetition'}
              </div>
              <div>
                {isZh
                  ? '⚡ 文案会根据提醒次数和紧急程度自动调整语气'
                  : '⚡ Messages adapt based on reminder count and urgency'}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 风格同步说明 */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            ℹ️ {isZh ? '关于提醒风格' : 'About Reminder Styles'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            {isZh
              ? '✨ 声音和文案风格会自动匹配，为您提供一致的提醒体验。'
              : '✨ Sound and message styles are automatically matched for a consistent experience.'}
          </p>
          <p>
            {isZh
              ? '🎯 系统会根据提醒时间、距离截止时间等因素，智能调整提醒的紧急程度。'
              : '🎯 The system intelligently adjusts urgency based on reminder time and deadline proximity.'}
          </p>
          <p className="font-medium">
            {isZh ? '💝 让提醒有温度，而不仅仅是通知！' : '💝 Make reminders engaging, not just notifications!'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReminderStyleSettings
