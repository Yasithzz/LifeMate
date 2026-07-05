import { useEffect, useRef, useState } from 'react'
import { Save, CheckCircle, Loader2, Camera, X, AlertCircle, Images } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getProfile, updateProfile, getSession, patchSession } from '../../lib/api'
import { MALE_AVATARS, FEMALE_AVATARS } from '../../lib/avatarPresets'

const MEAL_PREFS = ['Balanced', 'Vegetarian', 'Vegan', 'High-Protein', 'Keto', 'Mediterranean']
const WORKOUT_PREFS = ['Light', 'Moderate', 'Intense', 'None']
const FREE_TIME = ['Reading', 'Gaming', 'Music', 'Outdoor activities', 'Socializing', 'Creative arts', 'Sports', 'Other']

const ALL_DAYS = [
  { key: 'MONDAY',    short: 'Mon', label: 'Monday'    },
  { key: 'TUESDAY',   short: 'Tue', label: 'Tuesday'   },
  { key: 'WEDNESDAY', short: 'Wed', label: 'Wednesday' },
  { key: 'THURSDAY',  short: 'Thu', label: 'Thursday'  },
  { key: 'FRIDAY',    short: 'Fri', label: 'Friday'    },
  { key: 'SATURDAY',  short: 'Sat', label: 'Saturday'  },
  { key: 'SUNDAY',    short: 'Sun', label: 'Sunday'    },
]
const DEFAULT_WORKING_DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY']
const MAX_AVATAR_ENCODED = 2_800_000 // ~2MB source image (base64 is ~1.33x raw size)

const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 w-full'
const selectCls = inputCls + ' cursor-pointer'

export default function ProfilePage() {
  const session = getSession()
  const fileRef = useRef(null)

  // ── Identity state ───────────────────────────────────────────────
  const [identity, setIdentity] = useState({ fullName: '' })
  const [savedName, setSavedName] = useState('')
  const [avatar, setAvatar] = useState(null)        // persisted in DB
  const [avatarPreview, setAvatarPreview] = useState(null) // unsaved pick
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [pickerGender, setPickerGender] = useState('male')
  const [savingIdentity, setSavingIdentity] = useState(false)
  const [savedIdentity, setSavedIdentity] = useState(false)
  const [identityError, setIdentityError] = useState('')

  // ── Lifestyle state ──────────────────────────────────────────────
  const [prefs, setPrefs] = useState({
    sleepSchedule: '22:30', wakeTime: '07:00', workHours: '09:00-17:00',
    mealPreference: 'Balanced', workoutPreference: 'Moderate', freeTimePreference: 'Reading',
    reminderPreference: true, workingDays: DEFAULT_WORKING_DAYS,
  })
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savedPrefs, setSavedPrefs] = useState(false)
  const [prefsError, setPrefsError] = useState('')

  const [loading, setLoading] = useState(true)

  const identityDirty = identity.fullName.trim() !== savedName || avatarChanged

  useEffect(() => {
    getProfile().then(p => {
      if (p) {
        const name = p.fullName ?? ''
        setIdentity({ fullName: name })
        setSavedName(name)
        setAvatar(p.avatarBase64 ?? null)
        setPrefs({
          sleepSchedule: p.sleepSchedule ?? '22:30',
          wakeTime: p.wakeTime ?? '07:00',
          workHours: p.workHours ?? '09:00-17:00',
          mealPreference: p.mealPreference ?? 'Balanced',
          workoutPreference: p.workoutPreference ?? 'Moderate',
          freeTimePreference: p.freeTimePreference ?? 'Reading',
          reminderPreference: p.reminderPreference ?? true,
          workingDays: p.workingDays ?? DEFAULT_WORKING_DAYS,
        })
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // ── Avatar file pick ─────────────────────────────────────────────
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    if (!file.type.startsWith('image/')) { setAvatarError('Please select an image file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = ev.target.result
      if (b64.length > MAX_AVATAR_ENCODED) { setAvatarError('Image too large — use an image under 2 MB.'); return }
      setAvatarPreview(b64)
      setAvatarChanged(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeAvatar = () => { setAvatarPreview(null); setAvatarChanged(true) }

  const pickPresetAvatar = (src) => {
    setAvatarError('')
    setAvatarPreview(src)
    setAvatarChanged(true)
    setShowAvatarPicker(false)
  }

  const discardIdentity = () => {
    setIdentity({ fullName: savedName })
    setAvatarPreview(null)
    setAvatarChanged(false)
    setAvatarError('')
    setIdentityError('')
  }

  // ── Save identity (name + photo) ─────────────────────────────────
  const saveIdentity = async (e) => {
    e?.preventDefault()
    setIdentityError('')
    if (!identity.fullName.trim()) { setIdentityError('Name cannot be empty.'); return }
    setSavingIdentity(true)
    try {
      const payload = { fullName: identity.fullName.trim() }
      if (avatarChanged) payload.avatarBase64 = avatarPreview ?? ''
      await updateProfile(payload)
      patchSession({ fullName: identity.fullName.trim() })
      setSavedName(identity.fullName.trim())
      if (avatarChanged) { setAvatar(avatarPreview); setAvatarPreview(null); setAvatarChanged(false) }
      setSavedIdentity(true); setTimeout(() => setSavedIdentity(false), 2500)
    } catch (err) {
      setIdentityError(err.message || 'Failed to save')
    } finally { setSavingIdentity(false) }
  }

  // ── Save lifestyle prefs ─────────────────────────────────────────
  const savePrefs = async (e) => {
    e?.preventDefault()
    setPrefsError('')
    setSavingPrefs(true)
    try {
      await updateProfile(prefs)
      setSavedPrefs(true); setTimeout(() => setSavedPrefs(false), 2500)
    } catch (err) {
      setPrefsError(err.message || 'Failed to save')
    } finally { setSavingPrefs(false) }
  }

  const displayAvatar = avatarChanged ? avatarPreview : avatar
  const initials = (identity.fullName || session?.fullName || 'U')[0]?.toUpperCase()

  if (loading) return (
    <UserLayout>
      <div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>
    </UserLayout>
  )

  return (
    <UserLayout>
      {/* Sticky unsaved-changes bar — identity only */}
      {identityDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#0D0520]/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-[0_8px_40px_rgba(124,58,237,0.35)] md:left-[calc(50%+128px)]">
          <AlertCircle size={15} className="text-violet-400 flex-shrink-0" />
          <span className="text-[13px] text-[#C4B5D9]">Unsaved identity changes</span>
          <button onClick={discardIdentity} disabled={savingIdentity}
            className="text-[12px] text-[#7B6A9A] hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
            Discard
          </button>
          <button onClick={saveIdentity} disabled={savingIdentity}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[13px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_16px_rgba(124,58,237,0.4)] disabled:opacity-60">
            {savingIdentity ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {savingIdentity ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">Profile</h1>
          <p className="text-[#7B6A9A] text-sm mt-1">Manage your identity and lifestyle preferences</p>
        </div>

        {/* ── Section 1: Identity ──────────────────────────────── */}
        <div className={`bg-white/5 border rounded-2xl p-6 mb-6 transition-all duration-200 ${identityDirty ? 'border-violet-500/40 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]' : 'border-violet-500/15'}`}>
          <h2 className="text-[15px] font-bold text-white mb-5">Identity</h2>

          <div className="flex items-center gap-5 mb-5">
            {/* Avatar */}
            <div className="flex flex-col items-start gap-2 flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-violet-500/20">
                  {displayAvatar
                    ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-2xl font-extrabold">{initials}</div>
                  }
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-violet-600 border-2 border-[#050213] flex items-center justify-center hover:bg-violet-500 transition-colors shadow-lg"
                  title="Change photo">
                  <Camera size={13} className="text-white" />
                </button>
                {displayAvatar && (
                  <button type="button" onClick={removeAvatar}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-[#050213] flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg"
                    title="Remove photo">
                    <X size={10} className="text-white" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </div>
              <button type="button" onClick={() => setShowAvatarPicker(true)}
                className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap">
                <Images size={11} /> Choose avatar
              </button>
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1">Display Name</label>
              <input
                type="text"
                value={identity.fullName}
                onChange={e => setIdentity({ fullName: e.target.value })}
                maxLength={60}
                placeholder="Your name"
                className={inputCls}
              />
              <p className="text-[12px] text-[#6B5E8A] mt-2">{session?.email}</p>
            </div>
          </div>

          {avatarError && (
            <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[13px]">{avatarError}</div>
          )}
          {identityError && (
            <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[13px]">{identityError}</div>
          )}
          {savedIdentity && (
            <div className="mb-4 flex items-center gap-2 text-emerald-400 text-[13px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <CheckCircle size={14} /> Name and photo saved!
            </div>
          )}

          <button onClick={saveIdentity} disabled={savingIdentity || !identityDirty}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)] disabled:opacity-40 disabled:hover:translate-y-0">
            {savingIdentity ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {savingIdentity ? 'Saving…' : 'Save Identity'}
          </button>
        </div>

        {/* Avatar picker modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowAvatarPicker(false)}>
            <div onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0D0520] border border-violet-500/20 rounded-2xl p-6 shadow-[0_8px_40px_rgba(124,58,237,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-white">Choose an avatar</h3>
                <button type="button" onClick={() => setShowAvatarPicker(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#7B6A9A] hover:text-white hover:bg-white/5 transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => setPickerGender(g)}
                    className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 capitalize ${
                      pickerGender === g
                        ? 'bg-violet-600/25 border-violet-500/50 text-violet-300'
                        : 'bg-white/5 border-violet-500/10 text-[#7B6A9A] hover:border-violet-500/30 hover:text-violet-300'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {(pickerGender === 'male' ? MALE_AVATARS : FEMALE_AVATARS).map(a => (
                  <button key={a.id} type="button" title={a.label} onClick={() => pickPresetAvatar(a.src)}
                    className="group aspect-square rounded-xl overflow-hidden ring-2 ring-violet-500/15 hover:ring-violet-500/60 transition-all duration-200">
                    <img src={a.src} alt={a.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Section 2: Lifestyle Preferences ────────────────── */}
        <form onSubmit={savePrefs} className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-white mb-5">Lifestyle Preferences</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Bedtime</label>
                <input type="time" value={prefs.sleepSchedule} onChange={e => setPrefs(p => ({ ...p, sleepSchedule: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Wake Time</label>
                <input type="time" value={prefs.wakeTime} onChange={e => setPrefs(p => ({ ...p, wakeTime: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Work Hours</label>
              <input type="text" placeholder="09:00-17:00" value={prefs.workHours} onChange={e => setPrefs(p => ({ ...p, workHours: e.target.value }))} className={inputCls} />
            </div>

            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1">Regular Working Days</label>
              <p className="text-[11px] text-[#6B5E8A] mb-2.5">
                Selected days get a work-focused schedule. Other days get a personal/leisure schedule.
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {ALL_DAYS.map(({ key, short, label }) => {
                  const isSelected = prefs.workingDays.includes(key)
                  return (
                    <button key={key} type="button" title={label}
                      onClick={() => setPrefs(p => ({
                        ...p,
                        workingDays: isSelected ? p.workingDays.filter(d => d !== key) : [...p.workingDays, key],
                      }))}
                      className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
                        isSelected
                          ? 'bg-violet-600/25 border-violet-500/50 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]'
                          : 'bg-white/5 border-violet-500/10 text-[#7B6A9A] hover:border-violet-500/30 hover:text-violet-300'
                      }`}>
                      {short}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-[#7B6A9A] mt-2">
                {prefs.workingDays.length === 0
                  ? 'No working days — all days get a personal schedule'
                  : `${prefs.workingDays.length} working day${prefs.workingDays.length > 1 ? 's' : ''} selected`}
              </p>
            </div>

            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Meal Preference</label>
              <select value={prefs.mealPreference} onChange={e => setPrefs(p => ({ ...p, mealPreference: e.target.value }))} className={selectCls}>
                {MEAL_PREFS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Workout Preference</label>
              <select value={prefs.workoutPreference} onChange={e => setPrefs(p => ({ ...p, workoutPreference: e.target.value }))} className={selectCls}>
                {WORKOUT_PREFS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Free Time Preference</label>
              <select value={prefs.freeTimePreference} onChange={e => setPrefs(p => ({ ...p, freeTimePreference: e.target.value }))} className={selectCls}>
                {FREE_TIME.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-[14px] text-white font-medium">Enable Reminders</p>
                <p className="text-[12px] text-[#7B6A9A]">Receive notifications for tasks, hydration, and wellness tips</p>
              </div>
              <button type="button" onClick={() => setPrefs(p => ({ ...p, reminderPreference: !p.reminderPreference }))}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${prefs.reminderPreference ? 'bg-violet-600' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${prefs.reminderPreference ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            {prefsError && (
              <div className="text-red-400 text-[13px] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{prefsError}</div>
            )}
            {savedPrefs && (
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <CheckCircle size={15} /> Preferences saved!
              </div>
            )}
            <button type="submit" disabled={savingPrefs}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
              {savingPrefs ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Preferences
            </button>
          </div>
        </form>
      </div>
    </UserLayout>
  )
}
