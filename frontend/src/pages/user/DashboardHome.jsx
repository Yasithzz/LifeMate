import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplets, Dumbbell, CheckSquare, Clock,
  TrendingUp, Activity, Plus, ArrowRight, Brain,
} from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getSession, getWellness, getTasks, getLifestyleLatest } from '../../lib/api'
import { fmtDateLong, fmtDateShort } from '../../lib/locale'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Still up?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

const STRESS_PILL = {
  Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400   bg-amber-500/10   border-amber-500/20',
  High:   'text-red-400     bg-red-500/10     border-red-500/20',
}

const PRIORITY_DOT = {
  High:   'bg-red-400',
  Medium: 'bg-amber-400',
  Low:    'bg-emerald-400',
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const session  = getSession()
  const [tasks,    setTasks]    = useState([])
  const [wellness, setWellness] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.allSettled([getTasks(), getWellness(), getLifestyleLatest()])
      .then(([t, w, a]) => {
        if (t.status === 'fulfilled') setTasks(t.value ?? [])
        if (w.status === 'fulfilled') setWellness(w.value)
        if (a.status === 'fulfilled' && a.value) setAnalysis(a.value)
      })
      .finally(() => setLoading(false))
  }, [])

  const today         = new Date().toISOString().split('T')[0]
  const pending       = tasks.filter(t => t.status !== 'Completed')
  const doneToday     = tasks.filter(t => t.completedAt?.startsWith(today)).length
  const waterCups     = wellness?.todayWater ?? 0
  const waterPct      = Math.min(100, Math.round((waterCups / 8) * 100))
  const workoutsToday = (wellness?.workoutHistory ?? []).filter(w => w.recordedAt?.startsWith(today)).length
  const name          = session?.fullName?.split(' ')[0] ?? ''

  return (
    <UserLayout>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4A3F6A] mb-2">
          {fmtDateLong(new Date())}
        </p>
        <h1 className="text-[38px] sm:text-[46px] font-black text-white leading-none tracking-tight">
          {getGreeting()}{name ? `,` : '.'}<br />
          {name && <span className="text-violet-400">{name}.</span>}
        </h1>
        {analysis?.stressLevel && (
          <div className="mt-4 inline-flex items-center gap-2">
            <span className="text-[12px] text-[#5A4F7A]">Today's stress reading —</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STRESS_PILL[analysis.stressLevel] ?? 'text-[#7B6A9A] bg-white/5 border-white/10'}`}>
              {analysis.stressLevel}
            </span>
          </div>
        )}
      </div>

      {/* ── Log lifestyle prompt ──────────────────────────────────── */}
      {!loading && !analysis && (
        <button onClick={() => navigate('/dashboard/lifestyle')}
          className="w-full mb-8 flex items-center justify-between px-5 py-4 rounded-2xl border border-dashed border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/5 transition-all duration-200 group text-left">
          <div className="flex items-center gap-3">
            <Brain size={18} className="text-violet-400" />
            <div>
              <p className="text-[14px] font-semibold text-white">Log today's check-in</p>
              <p className="text-[12px] text-[#5A4F7A] mt-0.5">Get a personalized stress analysis and schedule</p>
            </div>
          </div>
          <ArrowRight size={15} className="text-[#4A3F6A] group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
        </button>
      )}

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <div className="flex gap-0 mb-10 rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
        {[
          {
            label: 'Tasks done',
            value: doneToday,
            sub: `${pending.length} pending`,
            accent: 'text-white',
          },
          {
            label: 'Water today',
            value: waterCups,
            sub: `${waterPct}% of daily goal`,
            accent: 'text-sky-300',
            bar: waterPct,
            barColor: 'bg-sky-400',
          },
          {
            label: 'Workouts',
            value: workoutsToday,
            sub: `${wellness?.workoutHistory?.length ?? 0} all-time`,
            accent: 'text-orange-300',
          },
          {
            label: 'Pending tasks',
            value: pending.length,
            sub: tasks.length > 0 ? `${Math.round((doneToday / Math.max(tasks.length, 1)) * 100)}% completion` : 'No tasks yet',
            accent: pending.length > 5 ? 'text-amber-300' : 'text-white',
          },
        ].map((s, i) => (
          <div key={s.label}
            className={`flex-1 px-5 py-5 ${i < 3 ? 'border-r border-white/[0.05]' : ''}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3A3060] mb-2">{s.label}</p>
            <p className={`text-[28px] font-black leading-none ${s.accent}`}>{loading ? '—' : s.value}</p>
            {s.bar !== undefined && !loading && (
              <div className="mt-2 h-[3px] bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${s.barColor}`} style={{ width: `${s.bar}%` }} />
              </div>
            )}
            <p className="text-[11px] text-[#3A3060] mt-1.5">{loading ? '…' : s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main content: tasks + quick actions ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">

        {/* Tasks */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[18px] font-bold text-white">Pending tasks</h2>
            <button onClick={() => navigate('/dashboard/tasks')}
              className="text-[11px] font-medium text-[#5A4F7A] hover:text-violet-400 transition-colors flex items-center gap-1">
              All tasks <ArrowRight size={11} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="py-12 text-center">
              <CheckSquare size={28} className="text-[#2A2050] mx-auto mb-2" />
              <p className="text-[#4A3F6A] text-sm">Nothing pending — you're clear.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {pending.slice(0, 7).map(task => (
                <div key={task.id}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-default">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] ?? 'bg-[#4A3F6A]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[#C4B5D9] font-medium truncate group-hover:text-white transition-colors">{task.title}</p>
                    <p className="text-[11px] text-[#3A3060] mt-0.5">{task.category}</p>
                  </div>
                  {task.deadline && (
                    <span className="text-[11px] text-[#3A3060] flex-shrink-0">
                      {fmtDateShort(task.deadline)}
                    </span>
                  )}
                </div>
              ))}
              {pending.length > 7 && (
                <button onClick={() => navigate('/dashboard/tasks')}
                  className="w-full py-2.5 text-[12px] text-[#4A3F6A] hover:text-violet-400 transition-colors text-center">
                  +{pending.length - 7} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick links — vertical card stack, each unique */}
        <div>
          <h2 className="text-[18px] font-bold text-white mb-4">Quick add</h2>
          <div className="space-y-2">
            <button onClick={() => navigate('/dashboard/wellness')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-500/8 border border-sky-500/15 hover:border-sky-500/35 hover:bg-sky-500/12 transition-all text-left group">
              <Droplets size={15} className="text-sky-400 flex-shrink-0" />
              <span className="text-[13px] text-[#9FC8E0] font-medium group-hover:text-white transition-colors">Log water</span>
            </button>
            <button onClick={() => navigate('/dashboard/wellness')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/15 hover:border-orange-500/35 hover:bg-orange-500/12 transition-all text-left group">
              <Dumbbell size={15} className="text-orange-400 flex-shrink-0" />
              <span className="text-[13px] text-[#E0C09F] font-medium group-hover:text-white transition-colors">Log workout</span>
            </button>
            <button onClick={() => navigate('/dashboard/tasks')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/15 hover:border-violet-500/35 hover:bg-violet-500/12 transition-all text-left group">
              <Plus size={15} className="text-violet-400 flex-shrink-0" />
              <span className="text-[13px] text-[#C4B5D9] font-medium group-hover:text-white transition-colors">New task</span>
            </button>
            <button onClick={() => navigate('/dashboard/schedule')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-500/8 border border-pink-500/15 hover:border-pink-500/35 hover:bg-pink-500/12 transition-all text-left group">
              <Clock size={15} className="text-pink-400 flex-shrink-0" />
              <span className="text-[13px] text-[#E0B4C8] font-medium group-hover:text-white transition-colors">My schedule</span>
            </button>
            <button onClick={() => navigate('/dashboard/productivity')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15 hover:border-emerald-500/35 hover:bg-emerald-500/12 transition-all text-left group">
              <TrendingUp size={15} className="text-emerald-400 flex-shrink-0" />
              <span className="text-[13px] text-[#9FDEC0] font-medium group-hover:text-white transition-colors">Productivity</span>
            </button>
            <button onClick={() => navigate('/dashboard/lifestyle')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15 hover:border-amber-500/35 hover:bg-amber-500/12 transition-all text-left group">
              <Activity size={15} className="text-amber-400 flex-shrink-0" />
              <span className="text-[13px] text-[#DEC89F] font-medium group-hover:text-white transition-colors">Lifestyle check-in</span>
            </button>
          </div>
        </div>

      </div>
    </UserLayout>
  )
}
