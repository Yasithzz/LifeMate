import { useEffect, useState } from 'react'
import { Droplets, Dumbbell, Lightbulb, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getWellness, logWater, deleteWater, logWorkout, deleteWorkout, getLifestyleLatest } from '../../lib/api'

const WORKOUT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Yoga', 'Weight Training', 'HIIT', 'Stretching', 'Other']

// ─── Personalised suggestions per ML stress level ────────────────
const SUGGESTIONS_BY_LEVEL = {
  'Very Low': [
    { type: 'Hydration',    icon: '💧', text: 'Your body is thriving — maintain excellent hydration by drinking 8+ cups today.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { type: 'Workout',      icon: '💪', text: "Great energy! This is the perfect day for high-intensity training — push your limits safely.", color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { type: 'Mindfulness',  icon: '🙏', text: 'Use this calm state to practice gratitude journaling — 3 things you\'re grateful for today.', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { type: 'Sleep',        icon: '🌙', text: 'Your sleep patterns are optimal. Keep your consistent bedtime to sustain this low-stress state.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { type: 'Nutrition',    icon: '🥗', text: 'Fuel your performance — include lean protein, complex carbs and colourful vegetables in every meal.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { type: 'Social',       icon: '🤝', text: 'You\'re in a great headspace to nurture important relationships — reach out to someone you care about.', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  ],
  'Low': [
    { type: 'Hydration',    icon: '💧', text: 'Drink a glass of water every hour to keep energy steady throughout the day.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { type: 'Workout',      icon: '🏃', text: 'Aim for 30–45 minutes of moderate exercise today — cycling, swimming or a brisk walk all count.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { type: 'Mindfulness',  icon: '🧘', text: 'Take a 5-minute breathing break every 90 minutes to stay refreshed and focused.', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { type: 'Sleep',        icon: '🌙', text: 'Maintain your healthy sleep pattern — aim for 7–9 hours and keep a consistent wake time.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { type: 'Nutrition',    icon: '🥗', text: 'Balanced meals with protein and vegetables will keep your energy and mood stable all day.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ],
  'Normal': [
    { type: 'Hydration',    icon: '💧', text: 'Drink 8 cups of water today — dehydration amplifies the feeling of stress and fatigue.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { type: 'Break',        icon: '🧘', text: 'Take a short 5-minute mindful break every 90 minutes — step away from your screen and breathe.', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { type: 'Workout',      icon: '🏃', text: '30 minutes of moderate exercise today will cut your stress level noticeably by evening.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { type: 'Sleep',        icon: '🌙', text: 'Stick to a consistent sleep schedule — 7–9 hours tonight helps reset your stress response.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { type: 'Nutrition',    icon: '🥗', text: 'Avoid skipping meals. Include protein and fibre at every meal to prevent energy crashes.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ],
  'High': [
    { type: 'Breathe',      icon: '🌬️', text: 'Try the 4-7-8 technique right now: inhale 4s, hold 7s, exhale 8s. Repeat 4 times to calm your nervous system.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { type: 'Hydration',    icon: '💧', text: 'Stress dehydrates you faster. Drink a large glass of water now and set an hourly reminder for the rest of the day.', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { type: 'Movement',     icon: '🚶', text: 'A 20-minute walk outside reduces cortisol by up to 15% — even a short walk helps significantly.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { type: 'Breaks',       icon: '⏸️', text: 'Increase break frequency — take a 10-minute break every 45 minutes instead of waiting until you\'re burned out.', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { type: 'Sleep',        icon: '🌙', text: 'Make 8 hours of sleep your top priority tonight. High stress without adequate sleep creates a damaging cycle.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { type: 'Reduce',       icon: '📵', text: 'Limit caffeine and screen time after 6 PM — both directly elevate cortisol and worsen high stress.', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  ],
  'Very High': [
    { type: 'Stop & Rest',  icon: '🛑', text: 'You are at very high stress. Cancel or defer any non-essential tasks right now — your health comes first.', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { type: 'Breathe',      icon: '🌬️', text: 'Do box breathing immediately: breathe in 4s, hold 4s, out 4s, hold 4s — repeat 6 times for fast relief.', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { type: 'Hydration',    icon: '💧', text: 'Sip a large glass of water slowly. Very high stress suppresses thirst — you are likely already dehydrated.', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { type: 'Gentle Move',  icon: '🧘', text: 'A 10-minute gentle stretch or slow yoga session is all you need — do not push into intense exercise today.', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { type: 'Sleep',        icon: '🌙', text: 'Sleep is the single most powerful recovery tool. Prioritise 9 hours tonight and go to bed by 10 PM.', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { type: 'Connect',      icon: '🤗', text: 'Talk to someone you trust — a friend, family member or counsellor. Isolation amplifies very high stress.', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  ],
}

const STRESS_BADGE = {
  'Very Low': 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  Low:        'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  Normal:     'text-amber-400 bg-amber-500/10 border-amber-500/25',
  High:       'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'Very High':'text-red-400 bg-red-500/10 border-red-500/25',
}
const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 w-full'

export default function WellnessPage() {
  const [data, setData] = useState({ todayWater: 0, waterHistory: [], workoutHistory: [] })
  const [loading, setLoading] = useState(true)
  const [workoutForm, setWorkoutForm] = useState({ workoutType: 'Running', durationMinutes: '' })
  const [waterFlash, setWaterFlash] = useState(false)
  const [workoutFlash, setWorkoutFlash] = useState(false)
  const [stressLevel, setStressLevel] = useState(null)

  const reload = () => getWellness().then(d => setData(d ?? { todayWater: 0, waterHistory: [], workoutHistory: [] }))

  useEffect(() => {
    Promise.allSettled([
      reload(),
      getLifestyleLatest().then(a => { if (a?.stressLevel) setStressLevel(a.stressLevel) })
    ]).finally(() => setLoading(false))
  }, [])

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
                      <span className="text-[11px] text-[#6B5E8A]">
                        {new Date(w.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(w.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
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

            {/* Personalised Suggestions */}
            <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <Lightbulb size={18} className="text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">Wellness Suggestions</h2>
                    <p className="text-[11px] text-[#7B6A9A]">Personalised based on your latest stress analysis</p>
                  </div>
                </div>
                {stressLevel && (
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STRESS_BADGE[stressLevel] ?? STRESS_BADGE.Normal}`}>
                    {stressLevel} Stress
                  </span>
                )}
                {!stressLevel && (
                  <span className="text-[11px] text-[#6B5E8A] italic">Log lifestyle data to personalise</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(SUGGESTIONS_BY_LEVEL[stressLevel] ?? SUGGESTIONS_BY_LEVEL['Normal']).map(({ type, icon, text, color }) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* All water history */}
              {data.waterHistory.length > 0 && (
                <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
                  <h2 className="text-[15px] font-bold text-white mb-4">All Water Intake History</h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.waterHistory.map(w => (
                      <div key={w.id} className="flex items-center justify-between py-2 border-b border-violet-500/8 last:border-0">
                        <div>
                          <p className="text-[13px] text-white font-medium">{w.amount} cup{w.amount > 1 ? 's' : ''}</p>
                          <p className="text-[11px] text-[#7B6A9A]">
                            {new Date(w.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(w.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteWater(w.id)} className="p-1 text-[#4A3F6A] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            </div>
          </>
        )}
      </div>
    </UserLayout>
  )
}
