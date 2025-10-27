import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import type { ReminderRule } from '@/types'
import { createDefaultReminderRule } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RuleEditorDialogProps {
  rule: ReminderRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (rule: ReminderRule) => void
}

const RuleEditorDialog: React.FC<RuleEditorDialogProps> = ({ rule, open, onOpenChange, onSave }) => {
  const { t, i18n } = useTranslation()
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (open) {
      if (rule) {
        setEditingRule({ ...rule })
      } else {
        setEditingRule(createDefaultReminderRule(i18n.language))
      }
      setErrorMessage('') // 清除错误消息
    }
  }, [open, rule, i18n.language])

  // 时间校验辅助函数
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const validateTimes = (): boolean => {
    if (!editingRule) return false

    const startMinutes = parseTime(editingRule.startTime)
    const deadlineMinutes = parseTime(editingRule.deadline)

    // 1. 验证 Deadline > startTime（考虑跨午夜情况）
    // 如果 deadline < startTime，说明是跨午夜的情况（如 23:30 - 00:30），这是允许的
    // 但如果 deadline === startTime，则不允许
    if (deadlineMinutes === startMinutes) {
      setErrorMessage(t('options.rules.error.deadlineEqualStart', '截止时间不能等于开始时间'))
      return false
    }

    // 2. 验证所有 Late Reminders > Deadline
    for (let i = 0; i < editingRule.lateReminders.length; i++) {
      const lateTime = editingRule.lateReminders[i]
      if (!lateTime) continue // 跳过空值

      const lateMinutes = parseTime(lateTime)

      // 如果是跨午夜的规则（deadline < startTime，如 11:30 -> 00:00）
      if (deadlineMinutes < startMinutes) {
        // Late reminder 应该在 deadline 之后（第二天）
        // 对于跨午夜规则，Late Reminder 只要不等于 deadline 即可
        // 因为无法通过时间值判断是第一天还是第二天，我们假设用户设置的都是第二天
        if (lateMinutes === deadlineMinutes) {
          setErrorMessage(
            t(
              'options.rules.error.lateReminderInvalid',
              `迟到提醒时间 ${lateTime} 不能等于截止时间 ${editingRule.deadline}`,
            ),
          )
          return false
        }
        // 其他时间都是有效的
      } else {
        // 非跨午夜的情况，late reminder 必须 > deadline
        if (lateMinutes <= deadlineMinutes) {
          setErrorMessage(
            t(
              'options.rules.error.lateReminderBeforeDeadline',
              `迟到提醒时间 ${lateTime} 必须在截止时间 ${editingRule.deadline} 之后`,
            ),
          )
          return false
        }
      }
    }

    return true
  }

  const handleSave = () => {
    if (editingRule) {
      // 验证时间
      if (!validateTimes()) {
        return // 验证失败，不保存
      }

      onSave(editingRule)
      onOpenChange(false)
    }
  }

  const handleWorkDayToggle = (index: number) => {
    if (!editingRule) return
    const newWorkDays = [...editingRule.workDays]
    newWorkDays[index] = !newWorkDays[index]
    setEditingRule({ ...editingRule, workDays: newWorkDays })
  }

  const handleAddLateReminder = () => {
    if (!editingRule) return
    setEditingRule({
      ...editingRule,
      lateReminders: [...editingRule.lateReminders, ''],
    })
  }

  const handleRemoveLateReminder = (index: number) => {
    if (!editingRule) return
    setEditingRule({
      ...editingRule,
      lateReminders: editingRule.lateReminders.filter((_, i) => i !== index),
    })
  }

  const handleUpdateLateReminder = (index: number, value: string) => {
    if (!editingRule) return
    const newLateReminders = [...editingRule.lateReminders]
    newLateReminders[index] = value
    setEditingRule({ ...editingRule, lateReminders: newLateReminders })
  }

  const weekDayNames = [
    t('options.rules.weekdays.mon', 'Mon'),
    t('options.rules.weekdays.tue', 'Tue'),
    t('options.rules.weekdays.wed', 'Wed'),
    t('options.rules.weekdays.thu', 'Thu'),
    t('options.rules.weekdays.fri', 'Fri'),
    t('options.rules.weekdays.sat', 'Sat'),
    t('options.rules.weekdays.sun', 'Sun'),
  ]

  if (!editingRule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? t('options.rules.edit', 'Edit Rule') : t('options.rules.add', 'Add Rule')}</DialogTitle>
          <DialogDescription>
            {t('options.rules.dialogDescription', 'Configure your reminder rule settings')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">{t('options.rules.name', 'Rule Name')}</Label>
              <Input
                id="rule-name"
                value={editingRule.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingRule({ ...editingRule, name: e.target.value })
                }
                placeholder={t('options.rules.namePlaceholder', 'e.g., Morning Routine')}
              />
            </div>

            {/* Work Days */}
            <div className="space-y-2">
              <Label>{t('options.rules.workDays', 'Work Days')}</Label>
              <div className="flex gap-2">
                {weekDayNames.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleWorkDayToggle(index)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      editingRule.workDays[index]
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-start">{t('options.rules.startTime', 'Start Time')}</Label>
                <Input
                  id="rule-start"
                  type="time"
                  value={editingRule.startTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingRule({ ...editingRule, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-deadline">{t('options.rules.deadline', 'Deadline')}</Label>
                <Input
                  id="rule-deadline"
                  type="time"
                  value={editingRule.deadline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingRule({ ...editingRule, deadline: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-interval">{t('options.rules.interval', 'Interval (min)')}</Label>
                <Input
                  id="rule-interval"
                  type="number"
                  min="1"
                  max="60"
                  value={editingRule.interval}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingRule({ ...editingRule, interval: parseInt(e.target.value) || 15 })
                  }
                />
              </div>
            </div>

            {/* Late Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('options.rules.lateReminders', 'Late Reminders')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddLateReminder} className="h-8 gap-1">
                  <PlusIcon className="h-3 w-3" />
                  {t('options.rules.addLateReminder', 'Add')}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {t('options.rules.lateRemindersHint', 'Additional reminder times if TODO is not sent before deadline')}
              </p>
              {editingRule.lateReminders.length > 0 && (
                <div className="space-y-2">
                  {editingRule.lateReminders.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleUpdateLateReminder(index, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLateReminder(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-900">
              {t('options.rules.notifications', 'Notification Settings')}
            </h4>
            <div className="space-y-2">
              <Label htmlFor="rule-notif-title">{t('options.rules.notificationTitle', 'Title')}</Label>
              <Input
                id="rule-notif-title"
                value={editingRule.notificationTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingRule({ ...editingRule, notificationTitle: e.target.value })
                }
                placeholder={t('options.rules.notificationTitlePlaceholder', 'e.g., Reminder: Send TODO')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-notif-message">{t('options.rules.notificationMessage', 'Message')}</Label>
              <Textarea
                id="rule-notif-message"
                value={editingRule.notificationMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditingRule({ ...editingRule, notificationMessage: e.target.value })
                }
                rows={2}
                placeholder={t('options.rules.notificationMessagePlaceholder', "Don't forget today's routine!")}
              />
            </div>
          </div>

          {/* Toast Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-900">{t('options.rules.toast', 'Toast Settings')}</h4>
            <div className="space-y-2">
              <Label htmlFor="rule-toast-message">{t('options.rules.toastMessage', 'Toast Message')}</Label>
              <Input
                id="rule-toast-message"
                value={editingRule.toastMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingRule({ ...editingRule, toastMessage: e.target.value })
                }
                placeholder={t('options.rules.toastMessagePlaceholder', "Don't forget to send your plan!")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-toast-url">{t('options.rules.toastClickUrl', 'Toast Click URL (Optional)')}</Label>
              <Input
                id="rule-toast-url"
                type="url"
                value={editingRule.toastClickUrl || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingRule({ ...editingRule, toastClickUrl: e.target.value })
                }
                placeholder={t('options.rules.toastClickUrlPlaceholder', 'https://slack.com/...')}
              />
              <p className="text-xs text-slate-500">
                {t('options.rules.toastClickUrlHint', 'Click on Toast to open this URL (optional)')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-toast-duration">{t('options.rules.toastDuration', 'Duration (seconds)')}</Label>
              <Input
                id="rule-toast-duration"
                type="number"
                min="5"
                max="60"
                value={editingRule.toastDuration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingRule({ ...editingRule, toastDuration: parseInt(e.target.value) || 10 })
                }
              />
            </div>
          </div>

          {/* Template Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-900">{t('options.rules.template', 'Template Settings')}</h4>
            <div className="space-y-2">
              <Label htmlFor="rule-template">{t('options.rules.templateContent', 'TODO Template (Markdown)')}</Label>
              <Textarea
                id="rule-template"
                value={editingRule.templateContent || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditingRule({ ...editingRule, templateContent: e.target.value })
                }
                rows={6}
                placeholder={t('options.rules.templateContentPlaceholder', 'Leave empty to use global template')}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                {t(
                  'options.rules.templateContentHint',
                  'Custom template for this rule. Leave empty to use the global template. Supports Markdown.',
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common.save', 'Save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RuleEditorDialog
