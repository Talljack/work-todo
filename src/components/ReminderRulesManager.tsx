import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil1Icon, TrashIcon, PlusIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ReminderRule } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import RuleEditorDialog from '@/components/RuleEditorDialog'

interface ReminderRulesManagerProps {
  rules: ReminderRule[]
  onChange: (rules: ReminderRule[]) => void
  onSave?: (rules: ReminderRule[]) => Promise<void> // 新增：保存回调，传入最新的规则
}

const ReminderRulesManager: React.FC<ReminderRulesManagerProps> = ({ rules, onChange, onSave }) => {
  const { t } = useTranslation()
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set()) // 跟踪展开的规则

  const toggleRuleExpand = (ruleId: string) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRules(newExpanded)
  }

  const handleAddRule = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }

  const handleEditRule = (rule: ReminderRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (rules.length === 1) {
      alert(t('options.rules.deleteLastError', 'You must keep at least one reminder rule'))
      return
    }
    if (confirm(t('options.rules.deleteConfirm', 'Are you sure you want to delete this rule?'))) {
      const updatedRules = rules.filter((r) => r.id !== ruleId)
      onChange(updatedRules)

      // 自动保存到 storage
      if (onSave) {
        setTimeout(async () => {
          await onSave(updatedRules)
        }, 0)
      }
    }
  }

  const handleSaveRule = async (rule: ReminderRule) => {
    let updatedRules: ReminderRule[]

    if (editingRule) {
      // Update existing rule
      updatedRules = rules.map((r) => (r.id === rule.id ? rule : r))
      onChange(updatedRules)
    } else {
      // Add new rule
      updatedRules = [...rules, rule]
      onChange(updatedRules)
    }

    // 自动保存到 storage
    if (onSave) {
      // 使用 setTimeout 确保 onChange 先更新 state
      setTimeout(async () => {
        await onSave(updatedRules)
      }, 0)
    }
  }

  const handleToggleEnabled = async (ruleId: string, enabled: boolean) => {
    const updatedRules = rules.map((r) => (r.id === ruleId ? { ...r, enabled } : r))
    onChange(updatedRules)

    // 自动保存到 storage
    if (onSave) {
      setTimeout(async () => {
        await onSave(updatedRules)
      }, 0)
    }
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

  const formatWorkDays = (workDays: boolean[]): string => {
    const selectedDays = workDays.map((enabled, index) => (enabled ? weekDayNames[index] : null)).filter(Boolean)
    return selectedDays.join(', ')
  }

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
          {rules.map((rule) => (
            <Card key={rule.id} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => handleToggleEnabled(rule.id, checked)}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{rule.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {rule.startTime} - {rule.deadline} · {t('options.rules.interval', 'Every')} {rule.interval}{' '}
                        {t('options.rules.minutes', 'min')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRuleExpand(rule.id)}
                      className="text-slate-600 hover:text-slate-900"
                      title={expandedRules.has(rule.id) ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`h-5 w-5 transition-transform ${expandedRules.has(rule.id) ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRule(rule)}
                      className="text-slate-600 hover:text-slate-900"
                      title={t('options.rules.edit', 'Edit')}
                    >
                      <Pencil1Icon className="h-4 w-4" />
                    </Button>
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
                  </div>
                </div>

                {/* Work Days - Always visible */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">{t('options.rules.workDays', 'Work Days')}:</span>{' '}
                    {formatWorkDays(rule.workDays)}
                  </p>
                </div>

                {/* Detailed info - Collapsible */}
                {expandedRules.has(rule.id) && (
                  <>
                    {/* Notification Settings */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        {t('options.rules.notifications', 'Notification Settings')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="text-xs font-medium text-slate-500 mb-1">
                            {t('options.rules.notificationTitle', 'Title')}
                          </div>
                          <div className="text-sm text-slate-800">{rule.notificationTitle}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="text-xs font-medium text-slate-500 mb-1">
                            {t('options.rules.notificationMessage', 'Message')}
                          </div>
                          <div className="text-sm text-slate-800">{rule.notificationMessage}</div>
                        </div>
                      </div>
                    </div>

                    {/* Toast Settings */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        {t('options.rules.toast', 'Toast Settings')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="text-xs font-medium text-slate-500 mb-1">
                            {t('options.rules.toastMessage', 'Toast Message')}
                          </div>
                          <div className="text-sm text-slate-800">{rule.toastMessage}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="text-xs font-medium text-slate-500 mb-1">
                            {t('options.rules.toastDuration', 'Duration')}
                          </div>
                          <div className="text-sm text-slate-800">
                            {rule.toastDuration} {t('options.rules.seconds', 'seconds')}
                          </div>
                        </div>
                        {rule.toastClickUrl && (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 md:col-span-2">
                            <div className="text-xs font-medium text-slate-500 mb-1">
                              {t('options.rules.toastClickUrl', 'Click URL')}
                            </div>
                            <div className="text-sm text-slate-800 truncate">{rule.toastClickUrl}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Late Reminders */}
                    {rule.lateReminders && rule.lateReminders.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">
                          {t('options.rules.lateReminders', 'Late Reminders')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {rule.lateReminders.map((time, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Template Content */}
                    {rule.templateContent && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">
                          {t('options.rules.templateContent', 'Template Content')}
                        </h4>
                        <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.templateContent}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}

      <Button type="button" onClick={handleAddRule} className="w-full gap-2" size="lg">
        <PlusIcon className="h-5 w-5" />
        {t('options.rules.addRule', 'Add New Reminder Rule')}
      </Button>

      <RuleEditorDialog rule={editingRule} open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSaveRule} />
    </div>
  )
}

export default ReminderRulesManager
