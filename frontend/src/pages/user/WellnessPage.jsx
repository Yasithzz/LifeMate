import { useEffect, useState } from 'react'
import { Droplets, Dumbbell, Lightbulb, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getWellness, logWater, deleteWater, logWorkout, deleteWorkout } from '../../lib/api'

const WORKOUT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Yoga', 'Weight Training', 'HIIT', 'Stretching', 'Other']
const SUGGESTIONS = [
  { type: 'Hydration', icon: '💧', text: 'Drink a glass of water every hour. Aim for 8 cups daily.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { type: 'Break', icon: '🧘', text: 'Take a 5-minute mindful break every 90 minutes of focused work.', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { type: 'Workout', icon: '🏃', text: '30 minutes of moderate exercise 5 days a week reduces stress by 40%.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { type: 'Sleep', icon: '🌙', text: 'Consistent sleep/wake times improve energy levels within one week.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { type: 'Nutrition', icon: '🥗', text: 'Include protein and vegetables in every meal to maintain stable energy.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
]
const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 w-full'

export default function WellnessPage() {
  const [data, setData] = useState({ todayWater: 0, waterHistory: [], workoutHistory: [] })
  const [loading, setLoading] = useState(true)
  const [workoutForm, setWorkoutForm] = useState({ workoutType: 'Running', durationMinutes: '' })
  const [waterFlash, setWaterFlash] = useState(false)
  const [workoutFlash, setWorkoutFlash] = useState(false)

  const reload = () => getWellness().then(d => setData(d ?? { todayWater: 0, waterHistory: [], workoutHistory: [] }))

  useEffect(() => { reload().finally(() => setLoading(false)) }, [])

  const today = new Date().toISOString().split('T')[0]
  const pct = Math.min(100, Math.round((data.todayWater / 8) * 100))
  const todayWorkouts = data.workoutHistory.filter(w => w.recordedAt?.startsWith(today))

  const handleLogWater = async (amt) => {
    try { await logWater(amt); await reload(); setWaterFlash(true); setTimeout(() => setWaterFlash(false), 1500) } catch { /* ignore */ }
  }

  const handleDeleteWater = async (id) => {
    try { await deleteWater(id); await reload() } catch { /* ignore */ }
  }

  const handleLogWorkout = async () => {
    if (!workoutForm.durationMinutes) return
    try {
      await logWorkout({ workoutType: workoutForm.workoutType, durationMinutes: parseInt(workoutForm.durationMinutes) })
      await reload()
      setWorkoutForm({ workoutType: 'Running', durationMinutes: '' })
      setWorkoutFlash(true); setTimeout(() => setWorkoutFlash(false), 2000)
    } catch { /* ignore */ }
  }

  const handleDeleteWorkout = async (id) => {
    try { await deleteWorkout(id); await reload() } catch { /* ignore */ }
  }

  return (
    <UserLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">Wellness Tracker</h1>
          <p className="text-[#7B6A9A] text-sm mt-1">Track hydration, workouts, and get personalized wellness suggestions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Water tracker */}
              <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                    <Droplets size={18} className="text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">Water Intake</h2>
                    <p className="text-[11px] text-[#7B6A9A]">Today: {data.todayWater} / 8 cups</p>
                  </div>
                </div>
                <div className="flex justify-center mb-5">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#wg)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${pct * 2.639} 264`} className="transition-all duration-500" />
                      <defs>
                        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-white">{data.todayWater}</span>
                      <span className="text-[11px] text-[#7B6A9A]">{pct}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[1, 2, 3].map(amt => (
                    <button key={amt} onClick={() => handleLogWater(amt)}
                      className="py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[13px] font-semibold hover:bg-sky-500/20 transition-colors">
                      +{amt} cup{amt > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                {waterFlash && (
                  <div className="flex items-center gap-2 text-emerald-400 text-[13px] justify-center mb-2">
                    <CheckCircle size={14} /> Logged!
                  </div>
                )}
                {data.waterHistory.slice(0, 5).map(w => (
                  <div key={w.id} className="flex items-center justify-between py-1.5 border-b border-violet-500/8 last:border-0">
                    <span className="text-[12px] text-[#9F8BC7]">{w.amount} cup{w.amount > 1 ? 's' : ''}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#6B5E8A]">{new Date(w.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      <button onClick={() => handleDeleteWater(w.id)} className="p-1 text-[#4A3F6A] hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Workout logger */}
              <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                    <Dumbbell size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">Workout Log</h2>
                    <p className="text-[11px] text-[#7B6A9A]">{todayWorkouts.length} workout{todayWorkouts.length !== 1 ? 's' : ''} today</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <select value={workoutForm.workoutType} onChange={e => setWorkoutForm(f => ({ ...f, workoutType: e.target.value }))} className={inputCls + ' cursor-pointer'}>
                    {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Duration (mins)" min="1" value={workoutForm.durationMinutes}
                      onChange={e => setWorkoutForm(f => ({ ...f, durationMinutes: e.target.value }))} className={inputCls} />
                    <button onClick={handleLogWorkout} className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-4 rounded-xl hover:-translate-y-0.5 transition-all duration-200">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                {workoutFlash && (
                  <div className="flex items-center gap-2 text-emerald-400 text-[13px] mb-3"><CheckCircle size={14} /> Logged!</div>
                )}
                {todayWorkouts.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {todayWorkouts.map(w => (
                      <div key={w.id} className="flex items-center justify-between py-2 border-b border-violet-500/8 last:border-0">
                        <div>
                          <p className="text-[13px] text-white font-medium">{w.workoutType}</p>
                          <p className="text-[11px] text-[#7B6A9A]">{w.durationMinutes} mins</p>
                        </div>
                        <button onClick={() => handleDeleteWorkout(w.id)} className="p-1 text-[#4A3F6A] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#4A3F6A] text-center py-4">No workouts logged today</p>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <Lightbulb size={18} className="text-violet-400" />
                </div>
                <h2 className="text-[15px] font-bold text-white">Wellness Suggestions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUGGESTIONS.map(({ type, icon, text, color }) => (
                  <div key={type} className={`p-4 rounded-xl border ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-[12px] font-bold uppercase tracking-wide">{type}</span>
                    </div>
                    <p className="text-[12px] opacity-80 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* All workout history */}
            {data.workoutHistory.length > 0 && (
              <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
                <h2 className="text-[15px] font-bold text-white mb-4">All Workout History</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.workoutHistory.map(w => (
                    <div key={w.id} className="flex items-center justify-between py-2 border-b border-violet-500/8 last:border-0">
                      <div>
                        <p className="text-[13px] text-white font-medium">{w.workoutType}</p>
                        <p className="text-[11px] text-[#7B6A9A]">{new Date(w.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {w.durationMinutes} mins</p>
                      </div>
                      <button onClick={() => handleDeleteWorkout(w.id)} className="p-1 text-[#4A3F6A] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  )
}
