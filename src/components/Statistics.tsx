import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { HistoryRecord, Statistics as StatsType } from '@/types'
import { getAppData, getStatistics } from '@/utils/storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Statistics: React.FC = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState<StatsType | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, appData] = await Promise.all([getStatistics(), getAppData()])
        setStats(statsData)
        setHistory(appData.history.slice(0, 30)) // 最近30天
      } catch (error) {
        console.error('Failed to load statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
        {t('statistics.error', 'Failed to load statistics')}
      </div>
    )
  }

  // 获取最近7天的数据用于迷你图
  const getLast7Days = () => {
    const last7Days: HistoryRecord[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const record = history.find((h) => h.date === dateStr)
      last7Days.push(record || { date: dateStr, sent: false })
    }

    return last7Days
  }

  const last7Days = getLast7Days()

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 完成率 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.completionRate', 'Completion Rate')}</CardTitle>
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-gray-500">
              {stats.completedDays} / {stats.totalDays} {t('statistics.days', 'days')}
            </p>
          </CardContent>
        </Card>

        {/* 当前连续 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.currentStreak', 'Current Streak')}</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-gray-500">{t('statistics.days', 'days')}</p>
          </CardContent>
        </Card>

        {/* 最长连续 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.longestStreak', 'Longest Streak')}</CardTitle>
            <span className="text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak}</div>
            <p className="text-xs text-gray-500">{t('statistics.days', 'days')}</p>
          </CardContent>
        </Card>

        {/* 本周完成率 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.thisWeek', 'This Week')}</CardTitle>
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyCompletionRate}%</div>
            <p className="text-xs text-gray-500">{t('statistics.completed', 'completed')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 最近7天活动 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statistics.last7Days', 'Last 7 Days Activity')}</CardTitle>
          <CardDescription>{t('statistics.last7DaysDescription', 'Your recent completion history')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2">
            {last7Days.map((record, index) => {
              const date = new Date(record.date)
              const dayName = date.toLocaleDateString(undefined, { weekday: 'short' })
              const height = record.sent ? 100 : 20

              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 items-end">
                    <div
                      className={`w-full rounded-t transition-all ${record.sent ? 'bg-green-500' : 'bg-gray-200'}`}
                      style={{ height: `${height}%` }}
                      title={record.sent ? t('statistics.completed') : t('statistics.notCompleted')}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{dayName}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 月度日历视图 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statistics.monthlyCalendar', 'Monthly Calendar')}</CardTitle>
          <CardDescription>
            {t('statistics.monthlyCalendarDescription', 'Green = Completed, Gray = Incomplete, Empty = Future/Weekend')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyCalendar history={history} />
        </CardContent>
      </Card>

      {/* 鼓励消息 */}
      {stats.currentStreak >= 7 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-semibold text-green-900">{t('statistics.congratulations', 'Congratulations!')}</p>
                <p className="text-sm text-green-700">
                  {t('statistics.streakMessage', `You've maintained a ${stats.currentStreak}-day streak! Keep it up!`, {
                    streak: stats.currentStreak,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 月度日历组件
const MonthlyCalendar: React.FC<{ history: HistoryRecord[] }> = ({ history }) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 获取当月第一天是星期几 (0=周日)
  const startDay = firstDay.getDay()

  // 生成日历数组
  const days: (Date | null)[] = []

  // 添加空白天数
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }

  // 添加当月的天数
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* 星期标题 */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-gray-500">
          {day}
        </div>
      ))}

      {/* 日期格子 */}
      {days.map((day, index) => {
        if (!day) {
          return <div key={`empty-${index}`} className="aspect-square" />
        }

        const dateStr = day.toISOString().split('T')[0]
        const record = history.find((h) => h.date === dateStr)
        const isFuture = day > today
        const isToday = dateStr === today.toISOString().split('T')[0]

        let bgColor = 'bg-gray-100'
        if (record?.sent) {
          bgColor = 'bg-green-500'
        } else if (!isFuture && record) {
          bgColor = 'bg-red-200'
        }

        return (
          <div
            key={dateStr}
            className={`flex aspect-square items-center justify-center rounded-md text-xs font-medium ${bgColor} ${
              isToday ? 'ring-2 ring-primary-500' : ''
            } ${isFuture ? 'opacity-30' : ''}`}
            title={record?.sent ? 'Completed' : record ? 'Incomplete' : 'No data'}
          >
            {day.getDate()}
          </div>
        )
      })}
    </div>
  )
}

export default Statistics
