import { useEffect, useState } from 'react'
import { Save, CheckCircle, Loader2 } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getProfile, updateProfile, getSession } from '../../lib/api'

const MEAL_PREFS = ['Balanced', 'Vegetarian', 'Vegan', 'High-Protein', 'Keto', 'Mediterranean']
const WORKOUT_PREFS = ['Light', 'Moderate', 'Intense', 'None']
const FREE_TIME = ['Reading', 'Gaming', 'Music', 'Outdoor activities', 'Socializing', 'Creative arts', 'Sports', 'Other']

const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 w-full'
const selectCls = inputCls + ' cursor-pointer'

export default function ProfilePage() {
  const session = getSession()
  const [form, setForm] = useState({ sleepSchedule: '22:30', wakeTime: '07:00', workHours: '09:00-17:00', mealPreference: 'Balanced', workoutPreference: 'Moderate', freeTimePreference: 'Reading', reminderPreference: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getProfile().then(p => {
      if (p) setForm({ sleepSchedule: p.sleepSchedule ?? '22:30', wakeTime: p.wakeTime ?? '07:00', workHours: p.workHours ?? '09:00-17:00', mealPreference: p.mealPreference ?? 'Balanced', workoutPreference: p.workoutPreference ?? 'Moderate', freeTimePreference: p.freeTimePreference ?? 'Reading', reminderPreference: p.reminderPreference ?? true })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  if (loading) return <UserLayout><div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div></UserLayout>

  return (
    <UserLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">Profile</h1>
          <p className="text-[#7B6A9A] text-sm mt-1">Personalize LifeMate to your lifestyle for better recommendations</p>
        </div>

        <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
            {session?.fullName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-white font-bold text-[16px]">{session?.fullName}</p>
            <p className="text-[#7B6A9A] text-sm">{session?.email}</p>
            <span className="inline-block mt-1 text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">{session?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-white mb-5">Lifestyle Preferences</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Bedtime</label>
                <input type="time" value={form.sleepSchedule} onChange={e => setForm(f => ({ ...f, sleepSchedule: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Wake Time</label>
                <input type="time" value={form.wakeTime} onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Work Hours</label>
              <input type="text" placeholder="09:00-17:00" value={form.workHours} onChange={e => setForm(f => ({ ...f, workHours: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Meal Preference</label>
              <select value={form.mealPreference} onChange={e => setForm(f => ({ ...f, mealPreference: e.target.value }))} className={selectCls}>
                {MEAL_PREFS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Workout Preference</label>
              <select value={form.workoutPreference} onChange={e => setForm(f => ({ ...f, workoutPreference: e.target.value }))} className={selectCls}>
                {WORKOUT_PREFS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Free Time Preference</label>
              <select value={form.freeTimePreference} onChange={e => setForm(f => ({ ...f, freeTimePreference: e.target.value }))} className={selectCls}>
                {FREE_TIME.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-[14px] text-white font-medium">Enable Reminders</p>
                <p className="text-[12px] text-[#7B6A9A]">Receive notifications for tasks, hydration, and wellness tips</p>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, reminderPreference: !f.reminderPreference }))}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.reminderPreference ? 'bg-violet-600' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${form.reminderPreference ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <CheckCircle size={15} /> Profile saved to database!
              </div>
            )}
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Preferences
            </button>
          </div>
        </form>
      </div>
    </UserLayout>
  )
}
