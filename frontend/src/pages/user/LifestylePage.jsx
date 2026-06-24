import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'  // kept for RefreshSchedule nav in handleRefreshSchedule
import {
  Brain, Moon, Battery, BarChart3, ChevronLeft, ChevronRight,
  Users, Monitor, Droplets, Dumbbell, CheckCircle2, Loader2,
  CalendarDays, Trash2, RefreshCw,
} from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import {
  submitLifestyle, getLifestyleHistory, getLifestyleToday,
  getHolidays, addHoliday, removeHoliday, generateWeeklySchedule,
} from '../../lib/api'

/* ─── constants ─────────────────────────────────────────────────── */
const MOODS = [
  { emoji: '😄', label: 'Great', value: 5 },
  { emoji: '🙂', label: 'Good',  value: 4 },
  { emoji: '😐', label: 'Okay',  value: 3 },
  { emoji: '😔', label: 'Low',   value: 2 },
  { emoji: '😣', label: 'Stressed', value: 1 },
]
const WORKLOAD = ['Very Light','Light','Moderate','Heavy','Very Heavy']
const ENERGY   = ['Exhausted','Tired','Okay','Energized','Very Energized']
const SOCIAL   = ['None','Minimal','Moderate','Social','Very Social']

const STRESS_COLORS = {
  'Very Low': 'text-sky-400 bg-sky-500/15 border-sky-500/25',
  Low:        'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  Normal:     'text-amber-400 bg-amber-500/15 border-amber-500/25',
  High:       'text-orange-400 bg-orange-500/15 border-orange-500/25',
  'Very High':'text-red-400 bg-red-500/15 border-red-500/25',
}

const STRESS_MSG = {
  'Very Low': "Excellent! You're in a great state. Use today's energy wisely.",
  Low:        "Good. You're managing well — keep your healthy habits going.",
  Normal:     "Moderate stress detected. Take regular breaks and stay hydrated.",
  High:       "High stress. Prioritise rest, reduce workload where possible.",
  'Very High':"Very high stress. Focus on recovery: rest, breathe, be gentle with yourself.",
}

const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

/* ─── sub-components ────────────────────────────────────────────── */
function ScaleSelector({ value, onChange, labels }) {
  return (
    <div className="flex gap-2">
      {labels.map((label, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}
          className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 ${
            value === i + 1
              ? 'bg-violet-600/30 border border-violet-500/50 text-violet-300'
              : 'bg-white/5 border border-violet-500/10 text-[#7B6A9A] hover:border-violet-500/30 hover:text-violet-300'
          }`}>{label}</button>
      ))}
    </div>
  )
}

/* ─── Holiday / Leave Mini-Calendar ─────────────────────────────── */
function HolidayCalendar({ holidays, onAdd, onRemove, scheduleRefreshing, onRefreshSchedule }) {
  const today = new Date()
  const [viewY, setViewY] = useState(today.getFullYear())
  const [viewM, setViewM] = useState(today.getMonth())

  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const daysInMonth = new Date(viewY, viewM+1, 0).getDate()
  const firstDay    = new Date(viewY, viewM, 1).getDay()
  const holidaySet  = new Set(holidays.map(h => h.date))
  const typeOf      = d => holidays.find(h => h.date === d)?.type

  // Instant toggle: unmarked → LEAVE → HOLIDAY → removed
  const handleClick = (dateStr) => {
    const current = typeOf(dateStr)
    if (!current) {
      onAdd(dateStr, 'LEAVE')       // mark as Leave instantly
    } else if (current === 'LEAVE') {
      onAdd(dateStr, 'HOLIDAY')     // upgrade to Holiday instantly
    } else {
      onRemove(dateStr)             // remove instantly
    }
  }

  return (
    <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <CalendarDays size={17} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-white">Holidays & Leave Days</h3>
            <p className="text-[11px] text-[#7B6A9A]">These days will be skipped in your weekly schedule</p>
          </div>
        </div>
        {/* Refresh Schedule button */}
        <button
          onClick={onRefreshSchedule}
          disabled={scheduleRefreshing}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/25 text-violet-400 hover:bg-violet-600/25 hover:border-violet-500/40 transition-all duration-200 disabled:opacity-60 flex-shrink-0"
        >
          <RefreshCw size={13} className={scheduleRefreshing ? 'animate-spin' : ''} />
          {scheduleRefreshing ? 'Refreshing…' : 'Refresh Schedule'}
        </button>
      </div>

      {/* Refresh status banner */}
      {scheduleRefreshing && (
        <div className="flex items-center gap-2 text-[12px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2 mb-3">
          <RefreshCw size={13} className="animate-spin flex-shrink-0" />
          Regenerating your weekly schedule with updated leave days…
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { let m=viewM-1,y=viewY; if(m<0){m=11;y--;} setViewM(m);setViewY(y) }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[#7B6A9A]"><ChevronLeft size={15}/></button>
        <span className="text-[13px] font-semibold text-white">{MONTH_NAMES[viewM]} {viewY}</span>
        <button onClick={() => { let m=viewM+1,y=viewY; if(m>11){m=0;y++;} setViewM(m);setViewY(y) }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[#7B6A9A]"><ChevronRight size={15}/></button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => <div key={d} className="text-center text-[10px] font-semibold text-[#6B5E8A] py-1">{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({length: firstDay}, (_,i) => <div key={'e'+i}/>)}
        {Array.from({length: daysInMonth}, (_,i) => {
          const day = i + 1
          const dateStr = `${viewY}-${String(viewM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isHoliday = holidaySet.has(dateStr)
          const type = typeOf(dateStr)
          const isToday = fmt(today) === dateStr
          return (
            <button key={day} onClick={() => handleClick(dateStr)}
              className={`aspect-square flex items-center justify-center rounded-lg text-[12px] font-medium transition-all duration-150 ${
                isHoliday
                  ? type === 'HOLIDAY'
                    ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300'
                    : 'bg-violet-500/30 border border-violet-500/50 text-violet-300'
                  : isToday
                    ? 'bg-white/15 border border-white/30 text-white'
                    : 'hover:bg-white/8 text-[#9F8BC7] border border-transparent hover:border-violet-500/20'
              }`}
            >{day}</button>
          )
        })}
      </div>

      {/* Legend + hint */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-violet-300"><span className="w-3 h-3 rounded bg-violet-500/40 border border-violet-500/50"/>&nbsp;Leave</span>
          <span className="flex items-center gap-1.5 text-[11px] text-amber-300"><span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/50"/>&nbsp;Holiday</span>
        </div>
        <span className="text-[10px] text-[#6B5E8A]">Click to toggle · Leave → Holiday → Remove</span>
      </div>

      {/* List with Update button */}
      {holidays.length > 0 && (
        <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto">
          {holidays.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(h => (
            <div key={h.date} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[12px] text-white font-medium">{h.date}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  h.type==='HOLIDAY' ? 'bg-amber-500/20 text-amber-400' : 'bg-violet-500/20 text-violet-400'
                }`}>{h.type}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Update: toggle LEAVE ↔ HOLIDAY */}
                <button
                  onClick={() => onAdd(h.date, h.type === 'LEAVE' ? 'HOLIDAY' : 'LEAVE')}
                  title={`Change to ${h.type === 'LEAVE' ? 'Holiday' : 'Leave'}`}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 hover:bg-violet-500/15 text-[#7B6A9A] hover:text-violet-300 transition-colors border border-transparent hover:border-violet-500/20">
                  → {h.type === 'LEAVE' ? 'Holiday' : 'Leave'}
                </button>
                <button onClick={() => onRemove(h.date)} title="Remove" className="p-1 text-[#4A3F6A] hover:text-red-400 transition-colors">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function LifestylePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    mood: 3, workload: 3, sleepHours: 7, energyLevel: 3,
    socialInteraction: 3, exerciseDone: 0, screenTimeHours: 4, waterCups: 6,
  })
  const [todayEntry, setTodayEntry] = useState(null)
  const [history, setHistory] = useState([])
  const [holidays, setHolidays] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [result, setResult] = useState(null)
  const [, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getLifestyleToday(), getLifestyleHistory(), getHolidays()])
      .then(([t, h, hl]) => {
        if (t.status==='fulfilled' && t.value) { setTodayEntry(t.value); setResult(t.value) }
        if (h.status==='fulfilled') setHistory(h.value ?? [])
        if (hl.status==='fulfilled') setHolidays(hl.value ?? [])
      }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const r = await submitLifestyle({
        mood: form.mood, workload: form.workload, sleepHours: form.sleepHours,
        energyLevel: form.energyLevel, socialInteraction: form.socialInteraction,
        exerciseDone: form.exerciseDone, screenTimeHours: form.screenTimeHours,
        waterCups: form.waterCups,
      })
      setResult(r); setTodayEntry(r)
      setHistory(prev => [r, ...prev.filter(e => e.id !== r.id)])
      // Store a refresh signal so SchedulePage reloads next time it's visited
      localStorage.setItem('lm_schedule_needs_refresh', Date.now().toString())
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleRefreshSchedule = async () => {
    if (!result) return
    setRefreshing(true)
    try { await generateWeeklySchedule(result.stressLevel) }
    catch { /* ignore */ } finally { setRefreshing(false) }
  }

  const [calendarScheduleRefreshing, setCalendarScheduleRefreshing] = useState(false)

  const refreshScheduleAfterHolidayChange = async () => {
    setCalendarScheduleRefreshing(true)
    localStorage.setItem('lm_schedule_needs_refresh', Date.now().toString())
    try { await generateWeeklySchedule(result?.stressLevel) }
    catch { /* non-fatal */ }
    finally { setCalendarScheduleRefreshing(false) }
  }

  const handleAddHoliday = async (date, type) => {
    // Optimistic UI update — instant
    const optimistic = { date, type, note: '' }
    setHolidays(prev => [...prev.filter(x=>x.date!==date), optimistic])
    try {
      const h = await addHoliday(date, type)
      setHolidays(prev => prev.map(x => x.date===date ? h : x))
    } catch { setHolidays(prev => prev.filter(x=>x.date!==date)) }
    // Regenerate schedule so this day shows as Rest Day
    refreshScheduleAfterHolidayChange()
  }

  const handleRemoveHoliday = async (date) => {
    // Optimistic UI update — instant
    setHolidays(prev => prev.filter(x=>x.date!==date))
    try { await removeHoliday(date) } catch { /* ignore */ }
    // Regenerate schedule so this day gets a real schedule back
    refreshScheduleAfterHolidayChange()
  }

  const sc = result?.stressLevel ? STRESS_COLORS[result.stressLevel] : null

  return (
    <UserLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">Lifestyle Data</h1>
          <p className="text-[#7B6A9A] text-sm mt-1">Log your daily indicators — our ML model analyses your stress and refreshes your weekly schedule</p>
        </div>

        {/* ML result */}
        {result && (
          <div className={`mb-5 p-5 rounded-2xl border ${sc}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Brain size={18}/><span className="font-bold text-[14px]">ML Stress Analysis Result</span></div>
              <button onClick={handleRefreshSchedule} disabled={refreshing}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-60">
                <RefreshCw size={13} className={refreshing?'animate-spin':''}/> Refresh Schedule
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px] opacity-70 uppercase tracking-widest font-semibold">Stress Level</p>
                <p className="text-2xl font-extrabold mt-0.5">{result.stressLevel}</p>
              </div>
              <div className="h-10 w-px bg-current opacity-20"/>
              <div>
                <p className="text-[11px] opacity-70 uppercase tracking-widest font-semibold">Confidence</p>
                <p className="text-2xl font-extrabold mt-0.5">{100 - (result.stressIndex * 15)}%</p>
              </div>
              <div className="ml-auto w-16 h-16 rounded-full border-4 border-current/30 flex items-center justify-center">
                <span className="text-lg font-extrabold">{result.stressIndex}</span>
              </div>
            </div>
            <p className="text-[12px] opacity-75 mt-3">{STRESS_MSG[result.stressLevel]}</p>
          </div>
        )}

        {/* Daily check-in form */}
        <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-white">Daily Check-in</h2>
            {todayEntry && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12}/> Submitted today
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Mood */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-3">How are you feeling?</label>
              <div className="flex gap-3">
                {MOODS.map(({emoji,label,value}) => (
                  <button key={value} type="button" onClick={() => setForm(f=>({...f,mood:value}))}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-200 ${form.mood===value?'bg-violet-600/25 border border-violet-500/50 scale-105':'bg-white/5 border border-violet-500/10 hover:border-violet-500/30'}`}>
                    <span className="text-xl mb-1">{emoji}</span>
                    <span className="text-[10px] text-[#7B6A9A]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep hours */}
            <div>
              <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                <Moon size={13}/> Sleep Hours (last night)
              </label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setForm(f=>({...f,sleepHours:Math.max(0,parseFloat((f.sleepHours-.5).toFixed(1)))}))}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-violet-500/15 text-violet-300 hover:bg-violet-600/20 flex items-center justify-center"><ChevronLeft size={16}/></button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-extrabold text-white">{form.sleepHours}</span>
                  <span className="text-[#7B6A9A] text-sm ml-1">hrs</span>
                </div>
                <button type="button" onClick={() => setForm(f=>({...f,sleepHours:Math.min(12,parseFloat((f.sleepHours+.5).toFixed(1)))}))}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-violet-500/15 text-violet-300 hover:bg-violet-600/20 flex items-center justify-center"><ChevronRight size={16}/></button>
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{width:`${(form.sleepHours/12)*100}%`}}/>
                  </div>
                  <p className="text-[10px] text-[#7B6A9A] mt-1">Recommended: 7–9 hrs</p>
                </div>
              </div>
            </div>

            {/* Workload */}
            <div>
              <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                <BarChart3 size={13}/> Workload
              </label>
              <ScaleSelector value={form.workload} onChange={v=>setForm(f=>({...f,workload:v}))} labels={WORKLOAD}/>
            </div>

            {/* Energy */}
            <div>
              <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                <Battery size={13}/> Energy Level
              </label>
              <ScaleSelector value={form.energyLevel} onChange={v=>setForm(f=>({...f,energyLevel:v}))} labels={ENERGY}/>
            </div>

            {/* Social Interaction */}
            <div>
              <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                <Users size={13}/> Social Interaction
              </label>
              <ScaleSelector value={form.socialInteraction} onChange={v=>setForm(f=>({...f,socialInteraction:v}))} labels={SOCIAL}/>
            </div>

            {/* Exercise + Screen time + Water (3-column) */}
            <div className="grid grid-cols-3 gap-4">
              {/* Exercise */}
              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                  <Dumbbell size={12}/> Exercise
                </label>
                <div className="flex gap-2">
                  {[{v:1,l:'Yes'},{v:0,l:'No'}].map(({v,l}) => (
                    <button key={v} type="button" onClick={() => setForm(f=>({...f,exerciseDone:v}))}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${form.exerciseDone===v?'bg-violet-600/25 border-violet-500/50 text-violet-300':'bg-white/5 border-violet-500/10 text-[#7B6A9A] hover:border-violet-500/25'}`}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Screen time */}
              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                  <Monitor size={12}/> Screen (hrs)
                </label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setForm(f=>({...f,screenTimeHours:Math.max(0,parseFloat((f.screenTimeHours-0.5).toFixed(1)))}))}
                    className="w-8 h-10 rounded-lg bg-white/5 border border-violet-500/15 text-violet-300 hover:bg-violet-600/20 flex items-center justify-center"><ChevronLeft size={13}/></button>
                  <span className="flex-1 text-center text-[16px] font-bold text-white">{form.screenTimeHours}</span>
                  <button type="button" onClick={() => setForm(f=>({...f,screenTimeHours:Math.min(14,parseFloat((f.screenTimeHours+0.5).toFixed(1)))}))}
                    className="w-8 h-10 rounded-lg bg-white/5 border border-violet-500/15 text-violet-300 hover:bg-violet-600/20 flex items-center justify-center"><ChevronRight size={13}/></button>
                </div>
              </div>

              {/* Water */}
              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">
                  <Droplets size={12}/> Water (cups)
                </label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setForm(f=>({...f,waterCups:Math.max(0,parseFloat((f.waterCups-0.5).toFixed(1)))}))}
                    className="w-8 h-10 rounded-lg bg-white/5 border border-violet-500/15 text-violet-300 hover:bg-violet-600/20 flex items-center justify-center"><ChevronLeft size={13}/></button>
                  <span className="flex-1 text-center text-[16px] font-bold text-white">{form.waterCups}</span>
                  <button type="button" onClick={() => setForm(f=>({...f,waterCups:Math.min(16,parseFloat((f.waterCups+0.5).toFixed(1)))}))}
                    className="w-8 h-10 rounded-lg bg-white/5 border border-violet-500/15 text-violet-300 hover:bg-violet-600/20 flex items-center justify-center"><ChevronRight size={13}/></button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0">
              {submitting && <Loader2 size={16} className="animate-spin"/>}
              {submitting ? 'Analysing…' : todayEntry ? "Update & Refresh Schedule" : "Submit & Analyse Stress"}
            </button>
          </form>
        </div>

        {/* Holiday calendar */}
        <HolidayCalendar
          holidays={holidays}
          onAdd={handleAddHoliday}
          onRemove={handleRemoveHoliday}
          scheduleRefreshing={calendarScheduleRefreshing}
          onRefreshSchedule={refreshScheduleAfterHolidayChange}
        />

        {/* History */}
        {history.length > 0 && (
          <div className="mt-5 bg-white/5 border border-violet-500/15 rounded-2xl p-5">
            <h2 className="text-[14px] font-bold text-white mb-3">Recent History</h2>
            <div className="space-y-2">
              {history.slice(0,7).map((e,i) => (
                <div key={e.id??i} className="flex items-center justify-between py-2 border-b border-violet-500/8 last:border-0">
                  <div>
                    <p className="text-[13px] text-white font-medium">
                      {MOODS.find(m=>m.value===e.mood)?.emoji} Mood: {MOODS.find(m=>m.value===e.mood)?.label} · Sleep: {e.sleepHours}h · Water: {e.waterCups ?? '–'} cups
                    </p>
                    <p className="text-[11px] text-[#7B6A9A]">
                      {new Date(e.submittedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </p>
                  </div>
                  {e.stressLevel && (
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STRESS_COLORS[e.stressLevel]??STRESS_COLORS.Normal}`}>
                      {e.stressLevel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  )
}
