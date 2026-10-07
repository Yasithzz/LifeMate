import { useEffect, useRef, useState } from 'react'
import { getTasks, getLifestyleLatest, getWeeklySchedule } from '../lib/api'

const COOLDOWN_MS = 4 * 60 * 60 * 1000 // 4 hours per alert key
const STORAGE_KEY = 'lm_alert_shown'

function loadShown() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function markShown(key) {
  const map = loadShown()
  map[key] = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function canShow(key) {
  const map = loadShown()
  return !map[key] || Date.now() - map[key] > COOLDOWN_MS
}

function todayDayName() {
  const names = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return names[new Date().getDay()]
}

function minutesUntil(timeStr) {
  if (!timeStr) return Infinity
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date()
  target.setHours(h, m, 0, 0)
  return Math.round((target - Date.now()) / 60000)
}

export function useSmartAlerts() {
  const [alerts, setAlerts] = useState([])
  const built = useRef(false)

  useEffect(() => {
    if (built.current) return
    built.current = true

    Promise.allSettled([
      getTasks().catch(() => null),
      getLifestyleLatest().catch(() => null),
      getWeeklySchedule().catch(() => null),
    ]).then(([tasksRes, lifestyleRes, scheduleRes]) => {
      const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value ?? []) : []
      const lifestyle = lifestyleRes.status === 'fulfilled' ? lifestyleRes.value : null
      const schedule = scheduleRes.status === 'fulfilled' ? scheduleRes.value : null

      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      const queue = []

      // ─── Overdue tasks ────────────────────────────────────
      const overdue = tasks.filter(t => t.status !== 'Completed' && t.deadline && t.deadline < today)
      if (overdue.length > 0 && canShow('overdue')) {
        const names = overdue.slice(0, 2).map(t => `"${t.title}"`).join(', ')
        const extra = overdue.length > 2 ? ` and ${overdue.length - 2} more` : ''
        queue.push({
          id: 'overdue',
          type: 'deadline',
          icon: '⚠️',
          title: `${overdue.length} Overdue Task${overdue.length > 1 ? 's' : ''}`,
          message: overdue.length === 1
            ? `"${overdue[0].title}" is past its deadline — tackle it now!`
            : `${names}${extra} are overdue.`,
          color: 'red',
        })
      }

      // ─── Due today ───────────────────────────────────────
      const dueToday = tasks.filter(t => t.status !== 'Completed' && t.deadline === today)
      if (dueToday.length > 0 && canShow('dueToday_' + today)) {
        queue.push({
          id: 'dueToday_' + today,
          type: 'deadline',
          icon: '🗓️',
          title: `${dueToday.length} Task${dueToday.length > 1 ? 's' : ''} Due Today`,
          message: dueToday.length === 1
            ? `"${dueToday[0].title}" is due today — stay on track!`
            : `${dueToday.slice(0, 2).map(t => `"${t.title}"`).join(', ')} ${dueToday.length > 2 ? `+${dueToday.length - 2} more` : ''} due today.`,
          color: 'amber',
        })
      }

      // ─── Due tomorrow ────────────────────────────────────
      const dueTomorrow = tasks.filter(t => t.status !== 'Completed' && t.deadline === tomorrow)
      if (dueTomorrow.length > 0 && canShow('dueTomorrow_' + tomorrow)) {
        queue.push({
          id: 'dueTomorrow_' + tomorrow,
          type: 'task',
          icon: '📅',
          title: 'Heads up — tasks due tomorrow',
          message: dueTomorrow.length === 1
            ? `"${dueTomorrow[0].title}" is due tomorrow — plan ahead!`
            : `${dueTomorrow.length} tasks are due tomorrow.`,
          color: 'violet',
        })
      }

      // ─── Upcoming meetings (within 60 min) ───────────────
      if (schedule?.days) {
        const todayItems = schedule.days[todayDayName()] ?? []
        const upcoming = todayItems.filter(item => {
          const mins = minutesUntil(item.startTime)
          return item.activityType === 'Meeting' && item.status !== 'completed' && mins >= 0 && mins <= 60
        })
        if (upcoming.length > 0) {
          const item = upcoming[0]
          const mins = minutesUntil(item.startTime)
          const alertKey = 'meeting_' + item.itemId + '_' + today
          if (canShow(alertKey)) {
            queue.push({
              id: alertKey,
              type: 'schedule',
              icon: '📋',
              title: mins <= 5 ? 'Meeting starting now!' : `Meeting in ${mins} min`,
              message: item.title || 'You have a meeting coming up — prepare now!',
              color: 'amber',
            })
          }
        }
      }

      // ─── Wellness / stress alerts ─────────────────────────
      if (lifestyle?.stressLevel) {
        const level = lifestyle.stressLevel
        if (level === 'High' && canShow('wellness_high')) {
          queue.push({
            id: 'wellness_high',
            type: 'wellness',
            icon: '🌬️',
            title: 'Stress level is High',
            message: 'Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s. A short walk also lowers cortisol noticeably.',
            color: 'orange',
          })
        }
        if (level === 'Very High' && canShow('wellness_veryhigh')) {
          queue.push({
            id: 'wellness_veryhigh',
            type: 'wellness',
            icon: '🛑',
            title: 'Very High Stress Detected',
            message: 'Please rest — defer non-essential tasks, hydrate, and try 10 min of gentle stretching or box breathing right now.',
            color: 'red',
          })
        }
        if ((level === 'High' || level === 'Very High') && canShow('wellness_water')) {
          queue.push({
            id: 'wellness_water',
            type: 'wellness',
            icon: '💧',
            title: 'Stay hydrated',
            message: 'Stress dehydrates you faster than usual. Drink a full glass of water now!',
            color: 'sky',
          })
        }
      }

      setAlerts(queue)
    })
  }, [])

  const dismiss = (id) => {
    markShown(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return { alerts, dismiss }
}
