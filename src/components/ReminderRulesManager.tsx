import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, PlusIcon } from '@radix-ui/react-icons'
import type { ReminderRule } from '@/types'
import { createDefaultReminderRule } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface ReminderRulesManagerProps {
  rules: ReminderRule[]
  onChange: (rules: ReminderRule[]) => void
}

const ReminderRulesManager: React.FC<ReminderRulesManagerProps> = ({ rules, onChange }) => {
  const { t, i18n } = useTranslation()
  const [expandedRuleIds, setExpandedRuleIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (ruleId: string) => {
    const newExpanded = new Set(expandedRuleIds)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRuleIds(newExpanded)
  }

  const handleAddRule = () => {
    const newRule = createDefaultReminderRule(i18n.language)
    onChange([...rules, newRule])
    // Auto-expand the new rule
    setExpandedRuleIds(new Set([...expandedRuleIds, newRule.id]))
  }

  const handleDeleteRule = (ruleId: string) => {
    if (rules.length === 1) {
      alert(t('options.rules.deleteLastError', 'You must keep at least one reminder rule'))
      return
    }
    if (confirm(t('options.rules.deleteConfirm', 'Are you sure you want to delete this rule?'))) {
      onChange(rules.filter((r) => r.id !== ruleId))
      const newExpanded = new Set(expandedRuleIds)
      newExpanded.delete(ruleId)
      setExpandedRuleIds(newExpanded)
    }
  }

  const handleUpdateRule = (ruleId: string, updates: Partial<ReminderRule>) => {
    onChange(rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)))
  }

  const handleWorkDayToggle = (ruleId: string, dayIndex: number) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (!rule) return

    const newWorkDays = [...rule.workDays]
    newWorkDays[dayIndex] = !newWorkDays[dayIndex]
    handleUpdateRule(ruleId, { workDays: newWorkDays })
  }

  const handleAddLateReminder = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (!rule) return

    const newLateReminders = [...rule.lateReminders, '']
    handleUpdateRule(ruleId, { lateReminders: newLateReminders })
  }

  const handleRemoveLateReminder = (ruleId: string, index: number) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (!rule) return

    const newLateReminders = rule.lateReminders.filter((_, i) => i !== index)
    handleUpdateRule(ruleId, { lateReminders: newLateReminders })
  }

  const handleUpdateLateReminder = (ruleId: string, index: number, value: string) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (!rule) return

    const newLateReminders = [...rule.lateReminders]
    newLateReminders[index] = value
    handleUpdateRule(ruleId, { lateReminders: newLateReminders })
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

  return (
    <div className="space-y-4">
      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            {t('options.rules.noRules', 'No reminder rules yet')}
          </CardContent>
        </Card>
      ) : (
        <>
          {rules.map((rule) => {
            const isExpanded = expandedRuleIds.has(rule.id)

            return (
              <Card key={rule.id} className={isExpanded ? 'border-primary-200' : ''}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => handleUpdateRule(rule.id, { enabled: checked })}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        {!isExpanded && (
                          <p className="text-sm text-slate-500 mt-1">
                            {rule.startTime} - {rule.deadline} · {t('options.rules.interval', 'Every')} {rule.interval}{' '}
                            {t('options.rules.minutes', 'min')} · {rule.workDays.filter(Boolean).length}{' '}
                            {t('options.rules.days', 'days')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={t('options.rules.delete', 'Delete')}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => toggleExpanded(rule.id)}>
                        {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-6 pt-0 border-t">
                    {/* Basic Info */}
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`rule-name-${rule.id}`}>{t('options.rules.name', 'Rule Name')}</Label>
                        <Input
                          id={`rule-name-${rule.id}`}
                          value={rule.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateRule(rule.id, { name: e.target.value })
                          }
                          placeholder={t('options.rules.namePlaceholder', 'e.g., Work Plan Reminder')}
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
                              onClick={() => handleWorkDayToggle(rule.id, index)}
                              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                rule.workDays[index]
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
                          <Label htmlFor={`rule-start-${rule.id}`}>{t('options.rules.startTime', 'Start Time')}</Label>
                          <Input
                            id={`rule-start-${rule.id}`}
                            type="time"
                            value={rule.startTime}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { startTime: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-deadline-${rule.id}`}>{t('options.rules.deadline', 'Deadline')}</Label>
                          <Input
                            id={`rule-deadline-${rule.id}`}
                            type="time"
                            value={rule.deadline}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { deadline: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-interval-${rule.id}`}>
                            {t('options.rules.interval', 'Interval (min)')}
                          </Label>
                          <Input
                            id={`rule-interval-${rule.id}`}
                            type="number"
                            min="1"
                            max="60"
                            value={rule.interval}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { interval: parseInt(e.target.value) || 15 })
                            }
                          />
                        </div>
                      </div>

                      {/* Late Reminders */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{t('options.rules.lateReminders', 'Late Reminders')}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLateReminder(rule.id)}
                            className="h-8 gap-1"
                          >
                            <PlusIcon className="h-3 w-3" />
                            {t('options.rules.addLateReminder', 'Add')}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {t(
                            'options.rules.lateRemindersHint',
                            'Additional reminder times if TODO is not sent before deadline',
                          )}
                        </p>
                        {rule.lateReminders.length > 0 && (
                          <div className="space-y-2">
                            {rule.lateReminders.map((time, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  type="time"
                                  value={time}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleUpdateLateReminder(rule.id, index, e.target.value)
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveLateReminder(rule.id, index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notification Settings */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {t('options.rules.notifications', 'Notification Settings')}
                        </h4>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-notif-title-${rule.id}`}>
                            {t('options.rules.notificationTitle', 'Title')}
                          </Label>
                          <Input
                            id={`rule-notif-title-${rule.id}`}
                            value={rule.notificationTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { notificationTitle: e.target.value })
                            }
                            placeholder={t('options.rules.notificationTitlePlaceholder', 'e.g., Reminder: Send TODO')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-notif-message-${rule.id}`}>
                            {t('options.rules.notificationMessage', 'Message')}
                          </Label>
                          <Textarea
                            id={`rule-notif-message-${rule.id}`}
                            value={rule.notificationMessage}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              handleUpdateRule(rule.id, { notificationMessage: e.target.value })
                            }
                            rows={2}
                            placeholder={t(
                              'options.rules.notificationMessagePlaceholder',
                              "Don't forget to send your work plan!",
                            )}
                          />
                        </div>
                      </div>

                      {/* Toast Settings */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {t('options.rules.toast', 'Toast Settings')}
                        </h4>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-toast-message-${rule.id}`}>
                            {t('options.rules.toastMessage', 'Toast Message')}
                          </Label>
                          <Input
                            id={`rule-toast-message-${rule.id}`}
                            value={rule.toastMessage}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { toastMessage: e.target.value })
                            }
                            placeholder={t('options.rules.toastMessagePlaceholder', "Don't forget to send your plan!")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-toast-url-${rule.id}`}>
                            {t('options.rules.toastClickUrl', 'Toast Click URL (Optional)')}
                          </Label>
                          <Input
                            id={`rule-toast-url-${rule.id}`}
                            type="url"
                            value={rule.toastClickUrl || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { toastClickUrl: e.target.value })
                            }
                            placeholder={t('options.rules.toastClickUrlPlaceholder', 'https://slack.com/...')}
                          />
                          <p className="text-xs text-slate-500">
                            {t('options.rules.toastClickUrlHint', 'Click on Toast to open this URL (optional)')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-toast-duration-${rule.id}`}>
                            {t('options.rules.toastDuration', 'Duration (seconds)')}
                          </Label>
                          <Input
                            id={`rule-toast-duration-${rule.id}`}
                            type="number"
                            min="5"
                            max="60"
                            value={rule.toastDuration}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleUpdateRule(rule.id, { toastDuration: parseInt(e.target.value) || 10 })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </>
      )}

      <Button type="button" onClick={handleAddRule} className="w-full gap-2" size="lg">
        <PlusIcon className="h-5 w-5" />
        {t('options.rules.addRule', 'Add New Reminder Rule')}
      </Button>
    </div>
  )
}

export default ReminderRulesManager
