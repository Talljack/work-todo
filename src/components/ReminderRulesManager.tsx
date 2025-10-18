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
}

const ReminderRulesManager: React.FC<ReminderRulesManagerProps> = ({ rules, onChange }) => {
  const { t } = useTranslation()
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddRule = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }

  const handleEditRule = (rule: ReminderRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    if (rules.length === 1) {
      alert(t('options.rules.deleteLastError', 'You must keep at least one reminder rule'))
      return
    }
    if (confirm(t('options.rules.deleteConfirm', 'Are you sure you want to delete this rule?'))) {
      onChange(rules.filter((r) => r.id !== ruleId))
    }
  }

  const handleSaveRule = (rule: ReminderRule) => {
    if (editingRule) {
      // Update existing rule
      onChange(rules.map((r) => (r.id === rule.id ? rule : r)))
    } else {
      // Add new rule
      onChange([...rules, rule])
    }
  }

  const handleToggleEnabled = (ruleId: string, enabled: boolean) => {
    onChange(rules.map((r) => (r.id === ruleId ? { ...r, enabled } : r)))
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
                    <div>
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

                {/* Work Days */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">{t('options.rules.workDays', 'Work Days')}:</span>{' '}
                    {formatWorkDays(rule.workDays)}
                  </p>
                </div>

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
