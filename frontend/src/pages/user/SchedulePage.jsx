import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  RefreshCw, Plus, Trash2, CheckCircle2, Circle, Sparkles, Loader2,
  Clock, X, CalendarDays,
} from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import {
  getWeeklySchedule, generateWeeklySchedule, patchScheduleSlot,
  addScheduleSlot, deleteScheduleSlot, getLifestyleLatest,
} from '../../lib/api'

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const DAY_LABELS = { MONDAY:'Mon',TUESDAY:'Tue',WEDNESDAY:'Wed',THURSDAY:'Thu',FRIDAY:'Fri',SATURDAY:'Sat',SUNDAY:'Sun' }
const ACTIVITY_TYPES = ['Work','Exercise','Meal','Break','Study','Leisure','Sleep','Meeting','Other']

const COLORS = {
  Work:     'bg-violet-500/20 border-l-violet-500 text-violet-300',
  Exercise: 'bg-orange-500/20 border-l-orange-500 text-orange-300',
  Meal:     'bg-emerald-500/20 border-l-emerald-500 text-emerald-300',
  Break:    'bg-sky-500/20 border-l-sky-500 text-sky-300',
  Study:    'bg-indigo-500/20 border-l-indigo-500 text-indigo-300',
  Leisure:  'bg-pink-500/20 border-l-pink-500 text-pink-300',
  Sleep:    'bg-purple-500/20 border-l-purple-500 text-purple-300',
  Meeting:  'bg-amber-500/20 border-l-amber-500 text-amber-300',
  Other:    'bg-white/8 border-l-white/30 text-white/70',
}

const STRESS_BADGE = {
  'Very Low':'text-sky-400 bg-sky-500/10 border-sky-500/25',
  Low:'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  Normal:'text-amber-400 bg-amber-500/10 border-amber-500/25',
  High:'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'Very High':'text-red-400 bg-red-500/10 border-red-500/25',
}

const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 w-full'

function getMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday
}

function dayDate(monday, dayIndex) {
  const d = new Date(monday)
  d.setDate(d.getDate() + dayIndex)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dayDateFull(monday, dayIndex) {
  const d = new Date(monday)
  d.setDate(d.getDate() + dayIndex)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function SchedulePage() {
  const location = useLocation()
  const [schedule, setSchedule] = useState(null)
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay()
    return DAYS[(d === 0 ? 6 : d - 1)]  // 0=Mon, 6=Sun
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ title:'', startTime:'09:00', endTime:'10:00', activityType:'Work' })
  const [saving, setSaving] = useState(false)

  const monday = getMonday()

  const loadSchedule = () => {
    setLoading(true)
    setFetchError('')
    Promise.allSettled([getWeeklySchedule(), getLifestyleLatest()]).then(([s, a]) => {
      if (s.status === 'fulfilled') setSchedule(s.value)
      else setFetchError(s.reason?.message || 'Failed to load schedule')
      if (a.status === 'fulfilled' && a.value) setLatestAnalysis(a.value)
    }).finally(() => setLoading(false))
  }

  // Initial load + re-fetch when lifestyle page navigates here with a refresh stamp
  const [refreshing, setRefreshing] = useState(false)

  // Initial load + auto-refresh when navigated to after a lifestyle submission
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadSchedule()
    // Check if lifestyle data was recently submitted (localStorage signal)
    const pendingRefresh = localStorage.getItem('lm_schedule_needs_refresh')
    const needsRefresh   = pendingRefresh && (Date.now() - parseInt(pendingRefresh)) < 30000

    if (needsRefresh) {
      localStorage.removeItem('lm_schedule_needs_refresh')
      setRefreshing(true)
      // Re-fetch after 2.5 s to pick up the async-generated schedule
      const t = setTimeout(() => {
        setRefreshing(false)
        loadSchedule()
      }, 2500)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    setFetchError('')
    try {
      const s = await generateWeeklySchedule(latestAnalysis?.stressLevel || 'Normal')
      setSchedule(s)
    } catch (err) {
      setFetchError(err.message || 'Failed to generate schedule')
    } finally { setGenerating(false) }
  }

  const toggleSlot = async (itemId) => {
    const slots = schedule?.days?.[activeDay] ?? []
    const slot = slots.find(s => s.itemId === itemId)
    if (!slot) return
    const next = slot.status === 'completed' ? 'pending' : 'completed'
    try {
      const updated = await patchScheduleSlot(itemId, activeDay, next)
      setSchedule(updated)
    } catch { /* ignore */ }
  }

  const handleDelete = async (itemId) => {
    try {
      const updated = await deleteScheduleSlot(itemId, activeDay)
      setSchedule(updated)
    } catch { /* ignore */ }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await addScheduleSlot(activeDay, addForm)
      setSchedule(updated)
      setAddForm({ title:'', startTime:'09:00', endTime:'10:00', activityType:'Work' })
      setShowAddForm(false)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const slots     = schedule?.days?.[activeDay] ?? []
  const leaveDays = new Set(schedule?.leaveDays ?? [])
  const isLeave   = leaveDays.has(dayDateFull(monday, DAYS.indexOf(activeDay)))

  const completedCount = DAYS.reduce((acc, d) => {
    return acc + (schedule?.days?.[d]?.filter(s => s.status === 'completed').length ?? 0)
  }, 0)
  const totalCount = DAYS.reduce((acc, d) => {
    const day = schedule?.days?.[d] ?? []
    return acc + day.filter(s => s.activityType !== 'Sleep' && s.title !== 'Rest Day / Holiday').length
  }, 0)

  if (loading) return (
    <UserLayout>
      <div className="flex justify-center py-24"><Loader2 size={26} className="text-violet-400 animate-spin"/></div>
    </UserLayout>
  )

  return (
    <UserLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">Weekly Schedule</h1>
          <p className="text-[#7B6A9A] text-sm mt-0.5">
            Week of {monday.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {schedule?.stressLevel && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border hidden sm:flex items-center gap-1 ${STRESS_BADGE[schedule.stressLevel]}`}>
              <Sparkles size={11}/> {schedule.stressLevel} Stress
            </span>
          )}
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold px-4 py-2.5 rounded-xl text-[13px] shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
            {generating ? <><RefreshCw size={14} className="animate-spin"/> Generating…</> : <><Sparkles size={14}/> Regenerate</>}
          </button>
        </div>
      </div>

      {/* Async generation banner */}
      {refreshing && (
        <div className="mb-4 flex items-center gap-2.5 text-[13px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
          <RefreshCw size={14} className="animate-spin flex-shrink-0" />
          Generating your personalised schedule based on today's lifestyle data…
        </div>
      )}

      {/* Weekly progress bar */}
      {totalCount > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-[12px] text-[#7B6A9A] mb-1.5">
            <span>Weekly progress: {completedCount}/{totalCount} tasks completed</span>
            <span>{Math.round((completedCount/totalCount)*100)}%</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-700"
              style={{width:`${(completedCount/totalCount)*100}%`}}/>
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 rounded-2xl p-1.5 overflow-x-auto">
        {DAYS.map((day, i) => {
          const dateStr = dayDateFull(monday, i)
          const isL     = leaveDays.has(dateStr)
          const t = new Date(); const todayStr = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
          const isToday  = dateStr === todayStr
          const daySlots = schedule?.days?.[day] ?? []
          const doneQty  = daySlots.filter(s=>s.status==='completed').length
          const totalQty = daySlots.filter(s=>s.activityType!=='Sleep'&&s.title!=='Rest Day / Holiday').length
          return (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`flex flex-col items-center min-w-[52px] py-2 px-2 rounded-xl transition-all duration-200 relative ${
                activeDay===day ? 'bg-violet-600/25 border border-violet-500/40' : 'hover:bg-white/8 border border-transparent'
              }`}>
              {isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-400"/>}
              <span className={`text-[12px] font-bold ${activeDay===day?'text-violet-300':isL?'text-amber-400':'text-[#9F8BC7]'}`}>{DAY_LABELS[day]}</span>
              <span className="text-[10px] text-[#6B5E8A] mt-0.5">{dayDate(monday,i)}</span>
              {isL ? <span className="text-[9px] text-amber-400 mt-0.5">leave</span>
                   : totalQty > 0 ? <span className={`text-[9px] mt-0.5 ${doneQty===totalQty?'text-emerald-400':'text-[#6B5E8A]'}`}>{doneQty}/{totalQty}</span>
                   : null}
            </button>
          )
        })}
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-red-400 text-sm">{fetchError}</p>
          <button onClick={loadSchedule} className="text-[12px] text-red-400 hover:text-red-300 underline ml-4">Retry</button>
        </div>
      )}

      {/* No schedule state */}
      {!schedule && (
        <div className="text-center py-16 bg-white/5 border border-violet-500/10 rounded-2xl">
          <CalendarDays size={36} className="text-[#4A3F6A] mx-auto mb-3"/>
          <p className="text-white font-semibold mb-1">No schedule yet</p>
          <p className="text-[#7B6A9A] text-sm mb-5">Submit your lifestyle data to generate a personalised weekly schedule</p>
          <button onClick={handleGenerate} disabled={generating}
            className="bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold px-6 py-2.5 rounded-xl text-[14px]">
            {generating ? 'Generating…' : 'Generate Schedule'}
          </button>
        </div>
      )}

      {/* Leave day */}
      {schedule && isLeave && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
          <CalendarDays size={32} className="text-amber-400 mx-auto mb-2"/>
          <p className="text-amber-300 font-bold text-[15px]">Rest Day / Holiday</p>
          <p className="text-[#7B6A9A] text-sm mt-1">No schedule for this day — enjoy your time off!</p>
        </div>
      )}

      {/* Day schedule */}
      {schedule && !isLeave && (
        <div className="space-y-2">
          {/* Add form */}
          {showAddForm && (
            <div className="bg-[#0F0828]/80 border border-violet-500/25 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-white">Add Activity to {DAY_LABELS[activeDay]}</h3>
                <button onClick={() => setShowAddForm(false)} className="text-[#7B6A9A] hover:text-white"><X size={17}/></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-3">
                <input className={inputCls} placeholder="Activity title" required value={addForm.title}
                  onChange={e => setAddForm(f=>({...f,title:e.target.value}))} autoFocus/>
                <select className={inputCls+' cursor-pointer'} value={addForm.activityType}
                  onChange={e => setAddForm(f=>({...f,activityType:e.target.value}))}>
                  {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-[#7B6A9A] uppercase tracking-widest block mb-1">Start</label>
                    <input type="time" className={inputCls} value={addForm.startTime} onChange={e=>setAddForm(f=>({...f,startTime:e.target.value}))}/></div>
                  <div><label className="text-[10px] text-[#7B6A9A] uppercase tracking-widest block mb-1">End</label>
                    <input type="time" className={inputCls} value={addForm.endTime} onChange={e=>setAddForm(f=>({...f,endTime:e.target.value}))}/></div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2.5 rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
                    {saving && <Loader2 size={13} className="animate-spin"/>} Add Activity
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 border border-violet-500/20 text-[#9F8BC7] rounded-xl text-[14px] hover:bg-white/5">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Day header + add button */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-bold text-white">{activeDay.charAt(0)+activeDay.slice(1).toLowerCase()}</h2>
              <p className="text-[12px] text-[#7B6A9A]">{dayDate(monday, DAYS.indexOf(activeDay))}</p>
            </div>
            <button onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-violet-500/20 text-violet-400 rounded-xl text-[13px] font-semibold hover:bg-violet-500/10 transition-colors">
              <Plus size={14}/> Add Activity
            </button>
          </div>

          {slots.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-violet-500/10 rounded-2xl">
              <Clock size={28} className="text-[#4A3F6A] mx-auto mb-2"/>
              <p className="text-[#7B6A9A] text-sm">No activities scheduled. Add one above.</p>
            </div>
          ) : (
            slots.map(slot => (
              <div key={slot.itemId}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-l-2 border border-violet-500/8 group transition-all duration-200 hover:border-violet-500/20 ${COLORS[slot.activityType]??COLORS.Other} ${slot.status==='completed'?'opacity-50':''} ${slot.title==='Rest Day / Holiday'?'opacity-80':''}`}>
                <button onClick={() => toggleSlot(slot.itemId)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
                  {slot.status==='completed'
                    ? <CheckCircle2 size={18} className="text-emerald-400"/>
                    : <Circle size={18} className="opacity-50 hover:opacity-100 transition-opacity"/>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold ${slot.status==='completed'?'line-through opacity-70':'text-white'}`}>{slot.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] opacity-70 flex items-center gap-1"><Clock size={10}/>{slot.startTime} – {slot.endTime}</span>
                    <span className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">{slot.activityType}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(slot.itemId)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[#4A3F6A] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                  <Trash2 size={13}/>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </UserLayout>
  )
}
