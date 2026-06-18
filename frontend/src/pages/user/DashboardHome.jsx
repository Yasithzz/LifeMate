import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplets, Dumbbell, CheckCircle, Clock, TrendingUp,
  AlertTriangle, Activity, Plus, ArrowRight, Flame, Brain,
} from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import {
  getSession, getWellness, getTasks, getLifestyleLatest, getUnreadCount,
} from '../../lib/api'

const STRESS_COLORS = {
  Low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25' },
  High: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/25' },
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const session = getSession()
  const [tasks, setTasks] = useState([])
  const [wellness, setWellness] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getTasks(), getWellness(), getLifestyleLatest(), getUnreadCount()])
      .then(([t, w, a, n]) => {
        if (t.status === 'fulfilled') setTasks(t.value ?? [])
        if (w.status === 'fulfilled') setWellness(w.value)
        if (a.status === 'fulfilled' && a.value) setAnalysis(a.value)
        if (n.status === 'fulfilled') setUnread(n.value?.count ?? 0)
      })
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const pending = tasks.filter(t => t.status !== 'Completed')
  const completedToday = tasks.filter(t => t.completedAt && t.completedAt.startsWith(today))
  const todayWorkouts = wellness?.workoutHistory?.filter(w => w.recordedAt?.startsWith(today)) ?? []
  const stressColors = analysis?.stressLevel ? STRESS_COLORS[analysis.stressLevel] : null

  return (
    <UserLayout>
      <div className="mb-8">
        <p className="text-[#7B6A9A] text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1 className="text-[28px] font-extrabold text-white tracking-tight mt-0.5">
          {getGreeting()}, {session?.fullName?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Prompt to log lifestyle data */}
      {!loading && !analysis && (
        <div
          onClick={() => navigate('/dashboard/lifestyle')}
          className="mb-6 flex items-center justify-between bg-gradient-to-r from-violet-600/20 to-pink-500/10 border border-violet-500/25 rounded-2xl p-4 cursor-pointer hover:border-violet-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 flex items-center justify-center">
              <Brain size={18} className="text-violet-300" />
            </div>
            <div>
              <p className="text-white text-[14px] font-semibold">Log today's lifestyle data</p>
              <p className="text-[#7B6A9A] text-[12px]">Get your personalized stress analysis & schedule</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-violet-400 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-2xl p-5 border ${stressColors ? `${stressColors.bg} ${stressColors.border}` : 'bg-white/5 border-violet-500/15'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A]">Stress Level</span>
            <AlertTriangle size={16} className={stressColors?.text ?? 'text-[#4A3F6A]'} />
          </div>
          <p className={`text-2xl font-extrabold ${stressColors?.text ?? 'text-[#4A3F6A]'}`}>{analysis?.stressLevel ?? '—'}</p>
          {analysis && <p className="text-[11px] text-[#7B6A9A] mt-1">Score: {analysis.predictionScore}%</p>}
        </div>

        <div className="rounded-2xl p-5 bg-white/5 border border-violet-500/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A]">Hydration</span>
            <Droplets size={16} className="text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{wellness?.todayWater ?? 0} <span className="text-[#7B6A9A] text-base font-medium">cups</span></p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((wellness?.todayWater ?? 0) / 8) * 100)}%` }} />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-white/5 border border-violet-500/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A]">Tasks Done</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{completedToday.length} <span className="text-[#7B6A9A] text-base font-medium">today</span></p>
          <p className="text-[11px] text-[#7B6A9A] mt-1">{pending.length} pending</p>
        </div>

        <div className="rounded-2xl p-5 bg-white/5 border border-violet-500/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A]">Workouts</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{todayWorkouts.length} <span className="text-[#7B6A9A] text-base font-medium">today</span></p>
          <p className="text-[11px] text-[#7B6A9A] mt-1">{wellness?.workoutHistory?.length ?? 0} total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending tasks */}
        <div className="lg:col-span-2 bg-white/5 border border-violet-500/15 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-white">Pending Tasks</h2>
            <button onClick={() => navigate('/dashboard/tasks')} className="text-[12px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-[#7B6A9A] text-sm">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={32} className="text-[#4A3F6A] mx-auto mb-2" />
              <p className="text-[#7B6A9A] text-sm">All caught up! No pending tasks.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-white font-medium truncate">{task.title}</p>
                    <p className="text-[11px] text-[#7B6A9A]">{task.category} · {task.priority}</p>
                  </div>
                  {task.deadline && (
                    <span className="text-[11px] text-[#7B6A9A] flex-shrink-0">
                      {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-[16px] font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Log Water Intake', icon: Droplets, color: 'text-sky-400', to: '/dashboard/wellness' },
              { label: 'Log Workout', icon: Dumbbell, color: 'text-orange-400', to: '/dashboard/wellness' },
              { label: 'Add New Task', icon: Plus, color: 'text-violet-400', to: '/dashboard/tasks' },
              { label: 'View Schedule', icon: Clock, color: 'text-pink-400', to: '/dashboard/schedule' },
              { label: 'Productivity Report', icon: TrendingUp, color: 'text-emerald-400', to: '/dashboard/productivity' },
              { label: 'Log Lifestyle Data', icon: Activity, color: 'text-amber-400', to: '/dashboard/lifestyle' },
            ].map(({ label, icon: Icon, color, to }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 border border-violet-500/10 rounded-xl text-[13.5px] font-medium text-[#C4B5D9] hover:bg-white/8 hover:border-violet-500/25 hover:text-white transition-all duration-200 group"
              >
                <Icon size={16} className={`${color} flex-shrink-0`} />
                {label}
                <ArrowRight size={13} className="ml-auto text-[#4A3F6A] group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
