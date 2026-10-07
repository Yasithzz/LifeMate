import { useEffect, useRef, useState } from 'react'
import { X, Bell, AlertTriangle, Calendar, Heart } from 'lucide-react'
import { useSmartAlerts } from '../hooks/useSmartAlerts'

const COLORS = {
  red:    { bar: 'bg-red-500',    bg: 'bg-red-500/10 border-red-500/25',    icon: 'text-red-400 bg-red-500/15',    title: 'text-red-300' },
  amber:  { bar: 'bg-amber-500',  bg: 'bg-amber-500/10 border-amber-500/25',  icon: 'text-amber-400 bg-amber-500/15',  title: 'text-amber-300' },
  violet: { bar: 'bg-violet-500', bg: 'bg-violet-500/10 border-violet-500/25', icon: 'text-violet-400 bg-violet-500/15', title: 'text-violet-300' },
  orange: { bar: 'bg-orange-500', bg: 'bg-orange-500/10 border-orange-500/25', icon: 'text-orange-400 bg-orange-500/15', title: 'text-orange-300' },
  sky:    { bar: 'bg-sky-500',    bg: 'bg-sky-500/10 border-sky-500/25',    icon: 'text-sky-400 bg-sky-500/15',    title: 'text-sky-300' },
}

const TYPE_ICON = {
  deadline: AlertTriangle,
  task:     Calendar,
  schedule: Calendar,
  wellness: Heart,
}

const AUTO_DISMISS_MS = 8000
const PROGRESS_INTERVAL_MS = 50

export default function NotificationPopup() {
  const { alerts, dismiss } = useSmartAlerts()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const timerRef = useRef(null)
  const progressRef = useRef(null)
  const currentAlert = alerts[0] ?? null

  // Animate in when a new alert arrives
  useEffect(() => {
    if (!currentAlert) { setVisible(false); return }

    setVisible(false)
    setProgress(100)

    // Small delay so the slide-in animation triggers properly
    const showTimer = setTimeout(() => setVisible(true), 50)

    // Progress bar countdown
    const steps = AUTO_DISMISS_MS / PROGRESS_INTERVAL_MS
    let step = 0
    progressRef.current = setInterval(() => {
      step++
      setProgress(Math.max(0, 100 - (step / steps) * 100))
    }, PROGRESS_INTERVAL_MS)

    // Auto-dismiss
    timerRef.current = setTimeout(() => handleDismiss(), AUTO_DISMISS_MS)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(timerRef.current)
      clearInterval(progressRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAlert?.id])

  const handleDismiss = () => {
    clearTimeout(timerRef.current)
    clearInterval(progressRef.current)
    setVisible(false)
    // Wait for slide-out animation before removing from queue
    setTimeout(() => dismiss(currentAlert?.id), 300)
  }

  if (!currentAlert) return null

  const colors = COLORS[currentAlert.color] ?? COLORS.violet
  const Icon = TYPE_ICON[currentAlert.type] ?? Bell
  const remaining = alerts.length

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] w-[340px] transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      role="alert"
    >
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] ${colors.bg}`}>
        {/* Progress bar */}
        <div
          className={`absolute top-0 left-0 h-[3px] ${colors.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />

        {/* Badge: more alerts queued */}
        {remaining > 1 && (
          <div className="absolute top-3 right-10 text-[10px] font-bold text-[#7B6A9A] bg-white/5 px-1.5 py-0.5 rounded-full border border-violet-500/15">
            +{remaining - 1} more
          </div>
        )}

        <div className="p-4 pt-5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${colors.icon}`}>
              <Icon size={17} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <p className={`text-[13px] font-bold leading-tight mb-1 ${colors.title}`}>
                {currentAlert.icon} {currentAlert.title}
              </p>
              <p className="text-[12px] text-[#9F8BC7] leading-relaxed">
                {currentAlert.message}
              </p>
            </div>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-[#4A3F6A] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
