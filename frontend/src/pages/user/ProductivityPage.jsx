import { useEffect, useState } from 'react'
import { TrendingUp, CheckCircle2, Clock, Target, BarChart3, Award, Loader2, Droplets } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getTasks, getWellness, getLifestyleHistory, getLifestyleLatest } from '../../lib/api'

function StatCard({ label, value, sub, icon: Icon, color, bgColor }) {
  return (
    <div className={`rounded-2xl p-5 border ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A]">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-[#7B6A9A] mt-1">{sub}</p>}
    </div>
  )
}

const CATEGORY_COLORS = {
  Work: 'bg-violet-500', Health: 'bg-emerald-500', Personal: 'bg-pink-500',
  Study: 'bg-indigo-500', Exercise: 'bg-orange-500', Other: 'bg-slate-500',
}

export default function ProductivityPage() {
  const [tasks, setTasks] = useState([])
  const [wellness, setWellness] = useState(null)
  const [history, setHistory] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getTasks(), getWellness(), getLifestyleHistory(), getLifestyleLatest()]).then(([t, w, h, l]) => {
      if (t.status === 'fulfilled') setTasks(t.value ?? [])
      if (w.status === 'fulfilled') setWellness(w.value)
      if (h.status === 'fulfilled') setHistory(h.value ?? [])
      if (l.status === 'fulfilled' && l.value) setLatest(l.value)
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const completed = tasks.filter(t => t.status === 'Completed')
  const pending = tasks.filter(t => t.status !== 'Completed')
  const completedToday = completed.filter(t => t.completedAt?.startsWith(today))

  const focusHours = Math.round(completed.reduce((s, t) => s + (t.durationMinutes ?? 0), 0) / 60 * 10) / 10

  const rate = tasks.length === 0 ? 0 : completed.length / tasks.length
  const stressBonus = latest?.stressLevel === 'Low' ? 10 : latest?.stressLevel === 'High' ? -10 : 0
  const score = tasks.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(rate * 85 + stressBonus + ((wellness?.todayWater ?? 0) >= 8 ? 5 : 0))))

  const byCategoryMap = {}
  completed.forEach(t => { byCategoryMap[t.category] = (byCategoryMap[t.category] || 0) + 1 })
  const byCategory = Object.entries(byCategoryMap).sort((a, b) => b[1] - a[1])

  const stressHistory = [...history].slice(0, 7).reverse()
  const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'
  const scoreBg = score >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 40 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'

  if (loading) return <UserLayout><div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div></UserLayout>

  return (
    <UserLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">Productivity Report</h1>
          <p className="text-[#7B6A9A] text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Score hero */}
        <div className={`mb-6 rounded-2xl p-6 border ${scoreBg} flex flex-col sm:flex-row items-center gap-4 sm:gap-6`}>
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={score >= 70 ? '#34d399' : score >= 40 ? '#f59e0b' : '#f87171'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${score * 2.639} 264`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-extrabold ${scoreColor}`}>{score}</span>
            </div>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-widest text-[#7B6A9A] font-semibold mb-1">Productivity Score</p>
            <p className={`text-3xl font-extrabold ${scoreColor}`}>{score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work'}</p>
            <p className="text-[13px] text-[#7B6A9A] mt-1">Based on task completion, stress level & hydration from your database</p>
          </div>
          <div className="hidden sm:block sm:ml-auto flex-shrink-0"><Award size={40} className={scoreColor + ' opacity-50'} /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Completed" value={completed.length} sub={`${completedToday.length} today`} icon={CheckCircle2} color="text-emerald-400" bgColor="bg-emerald-500/10 border-emerald-500/20" />
          <StatCard label="Pending" value={pending.length} sub="in queue" icon={Target} color="text-amber-400" bgColor="bg-amber-500/10 border-amber-500/20" />
          <StatCard label="Focus Hours" value={focusHours} sub="hours logged" icon={Clock} color="text-sky-400" bgColor="bg-sky-500/10 border-sky-500/20" />
          <StatCard label="Stress Check-ins" value={history.length} sub={latest ? `Latest: ${latest.stressLevel}` : 'No data'} icon={TrendingUp} color="text-violet-400" bgColor="bg-violet-500/10 border-violet-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
            <h2 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={17} className="text-violet-400" /> Tasks by Category</h2>
            {byCategory.length === 0 ? (
              <p className="text-[#7B6A9A] text-sm text-center py-8">Complete tasks to see breakdown</p>
            ) : (
              <div className="space-y-3">
                {byCategory.map(([cat, count]) => {
                  const pct = Math.round((count / completed.length) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-[#C4B5D9] font-medium">{cat}</span>
                        <span className="text-[#7B6A9A]">{count} · {pct}%</span>
                      </div>
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${CATEGORY_COLORS[cat] ?? 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
            <h2 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={17} className="text-violet-400" /> Stress Trend</h2>
            {stressHistory.length === 0 ? (
              <p className="text-[#7B6A9A] text-sm text-center py-8">Log lifestyle data to track trends</p>
            ) : (
              <div className="space-y-2">
                {stressHistory.map((e, i) => (
                  <div key={e.id ?? i} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#6B5E8A] w-20 flex-shrink-0">
                      {new Date(e.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${e.stressLevel === 'Low' ? 'bg-emerald-500' : e.stressLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${e.predictionScore}%` }} />
                    </div>
                    <span className={`text-[11px] font-semibold w-14 text-right flex-shrink-0 ${e.stressLevel === 'Low' ? 'text-emerald-400' : e.stressLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
                      {e.stressLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white/5 border border-violet-500/15 rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-white mb-4">Wellness Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="py-4">
              <p className="text-[28px] font-extrabold text-sky-400">{wellness?.todayWater ?? 0}</p>
              <p className="text-[12px] text-[#7B6A9A] mt-1">Cups of water today</p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full mx-auto max-w-[80px] overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${Math.min(100, ((wellness?.todayWater ?? 0) / 8) * 100)}%` }} />
              </div>
            </div>
            <div className="py-4 border-t md:border-t-0 md:border-x border-violet-500/10">
              <p className="text-[28px] font-extrabold text-orange-400">{wellness?.workoutHistory?.length ?? 0}</p>
              <p className="text-[12px] text-[#7B6A9A] mt-1">Total workouts logged</p>
              <p className="text-[11px] text-[#6B5E8A] mt-1">{wellness?.workoutHistory?.filter(w => w.recordedAt?.startsWith(today)).length ?? 0} today</p>
            </div>
            <div className="py-4">
              <p className="text-[28px] font-extrabold text-violet-400">{history.length}</p>
              <p className="text-[12px] text-[#7B6A9A] mt-1">Lifestyle check-ins</p>
              <p className="text-[11px] text-[#6B5E8A] mt-1">Keep the streak going!</p>
            </div>
          </div>
        </div>

        {wellness?.waterHistory?.length > 0 && (
          <div className="mt-6 bg-white/5 border border-violet-500/15 rounded-2xl p-6">
            <h2 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2"><Droplets size={17} className="text-sky-400" /> Water Intake History</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wellness.waterHistory.map(w => (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-violet-500/8 last:border-0">
                  <span className="text-[13px] text-white font-medium">{w.amount} cup{w.amount > 1 ? 's' : ''}</span>
                  <span className="text-[11px] text-[#7B6A9A]">
                    {new Date(w.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(w.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  )
}
