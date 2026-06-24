import { useEffect, useState } from 'react'
import {
  Palette, Globe, Lock, Key, Shield, Mail,
  CheckCircle, AlertCircle, Loader2, Eye, EyeOff,
  RefreshCw, Sun, Moon, Monitor, Check,
} from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import {
  changePassword, getSecurityInfo,
  sendEmailVerificationOtp, verifyEmail,
  forgotPasswordInitiate, forgotPasswordReset,
} from '../../lib/api'

// ─── shared style constants ───────────────────────────────────────
const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-3 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 w-full'

function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} placeholder={placeholder} value={value}
        onChange={onChange} required className={inputCls + ' pr-12'} />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5E8A] hover:text-violet-400 transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

function Badge({ verified }) {
  return verified
    ? <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full"><CheckCircle size={11} />Verified</span>
    : <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full"><AlertCircle size={11} />Not verified</span>
}

// ─── sidebar navigation ───────────────────────────────────────────
const NAV = [
  {
    group: 'General',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'language', label: 'Language & Region', icon: Globe },
    ],
  },
  {
    group: 'Security & Login',
    items: [
      { id: 'password', label: 'Change Password', icon: Lock },
      { id: 'forgot', label: 'Forgot Password', icon: Key },
      { id: 'verifications', label: 'Verifications', icon: Shield },
    ],
  },
]

// ─── Appearance section ───────────────────────────────────────────
const ACCENT_COLORS = [
  { name: 'Violet', value: 'violet', hex: ['#7c3aed', '#ec4899'] },
  { name: 'Blue',   value: 'blue',   hex: ['#2563eb', '#06b6d4'] },
  { name: 'Emerald',value: 'emerald',hex: ['#059669', '#14b8a6'] },
  { name: 'Rose',   value: 'rose',   hex: ['#e11d48', '#f97316'] },
  { name: 'Indigo', value: 'indigo', hex: ['#4338ca', '#8b5cf6'] },
]
const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Default dark theme' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Follow system setting' },
  { id: 'light', label: 'Light', icon: Sun, desc: 'Coming soon' },
]

function AppearanceSection() {
  const [accent, setAccent] = useState(() => localStorage.getItem('lm_accent') || 'violet')
  const [theme, setTheme] = useState(() => localStorage.getItem('lm_theme') || 'dark')
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('lm_accent', accent)
    localStorage.setItem('lm_theme', theme)
    if (accent !== 'violet') {
      document.documentElement.setAttribute('data-accent', accent)
    } else {
      document.documentElement.removeAttribute('data-accent')
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h2 className="text-[18px] font-bold text-white mb-1">Appearance</h2>
        <p className="text-[#7B6A9A] text-sm">Customize how LifeMate looks on your device</p>
      </div>

      {/* Theme */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-3">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => setTheme(id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${theme === id ? 'bg-violet-600/20 border-violet-500/50' : 'bg-white/5 border-violet-500/10 hover:border-violet-500/30'} ${id === 'light' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={id === 'light'}>
              {theme === id && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === id ? 'bg-violet-500/30' : 'bg-white/8'}`}>
                <Icon size={20} className={theme === id ? 'text-violet-300' : 'text-[#7B6A9A]'} />
              </div>
              <span className={`text-[13px] font-medium ${theme === id ? 'text-white' : 'text-[#9F8BC7]'}`}>{label}</span>
              <span className="text-[11px] text-[#6B5E8A]">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-3">Accent Color</p>
        <div className="flex gap-3">
          {ACCENT_COLORS.map(c => (
            <button key={c.value} onClick={() => setAccent(c.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 flex-1 ${accent === c.value ? 'bg-white/10 border-white/25' : 'bg-white/5 border-violet-500/10 hover:border-violet-500/25'}`}>
              <div className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${c.hex[0]}, ${c.hex[1]})` }}>
                {accent === c.value && <Check size={14} className="text-white" />}
              </div>
              <span className="text-[11px] text-[#9F8BC7]">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {saved && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"><CheckCircle size={14} />Preferences saved!</div>}
      <button onClick={save} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
        Save Appearance
      </button>
    </div>
  )
}

// ─── Language section ─────────────────────────────────────────────
const LANGUAGES = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Japanese', 'Chinese (Simplified)', 'Arabic', 'Hindi', 'Portuguese']
const TIMEZONES = ['(GMT+5:30) Colombo', '(GMT+0:00) London', '(GMT-5:00) New York', '(GMT-8:00) Los Angeles', '(GMT+9:00) Tokyo', '(GMT+8:00) Singapore']

function LanguageSection() {
  const [lang, setLang] = useState(() => localStorage.getItem('lm_lang') || 'English (US)')
  const [tz, setTz] = useState(() => localStorage.getItem('lm_tz') || '(GMT+5:30) Colombo')
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('lm_lang', lang)
    localStorage.setItem('lm_tz', tz)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const sel = inputCls + ' cursor-pointer'

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h2 className="text-[18px] font-bold text-white mb-1">Language & Region</h2>
        <p className="text-[#7B6A9A] text-sm">Choose your preferred language and regional settings</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-300">Multi-language support is coming soon. Your preference will be saved for when it's available.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Language</label>
          <select className={sel} value={lang} onChange={e => setLang(e.target.value)}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Timezone</label>
          <select className={sel} value={tz} onChange={e => setTz(e.target.value)}>
            {TIMEZONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {saved && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"><CheckCircle size={14} />Preferences saved!</div>}
      <button onClick={save} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
        Save Preferences
      </button>
    </div>
  )
}

// ─── Change Password section ──────────────────────────────────────
function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handle = async (e) => {
    e.preventDefault(); setError('')
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setSaving(true)
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setSuccess(true); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(false), 3500)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[18px] font-bold text-white mb-1">Change Password</h2>
        <p className="text-[#7B6A9A] text-sm">Use a strong, unique password for your account</p>
      </div>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Current password</label>
          <PasswordInput placeholder="Enter current password" value={form.currentPassword} onChange={e => { setForm(f => ({ ...f, currentPassword: e.target.value })); setError(''); setSuccess(false) }} />
        </div>
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">New password</label>
          <PasswordInput placeholder="Min. 6 characters" value={form.newPassword} onChange={e => { setForm(f => ({ ...f, newPassword: e.target.value })); setError(''); setSuccess(false) }} />
        </div>
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Confirm new password</label>
          <PasswordInput placeholder="Repeat new password" value={form.confirmPassword} onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setError(''); setSuccess(false) }} />
        </div>
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        {success && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"><CheckCircle size={14} />Password updated successfully!</div>}
        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)] disabled:opacity-60 disabled:hover:translate-y-0">
          {saving && <Loader2 size={14} className="animate-spin" />} Update Password
        </button>
      </form>
    </div>
  )
}

// ─── Forgot Password section ──────────────────────────────────────
function ForgotPasswordSection() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [pw, setPw] = useState('')
  const [cpw, setCpw] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const initiate = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await forgotPasswordInitiate(email, 'email'); setStep(1) }
    catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const reset = async (e) => {
    e.preventDefault(); setError('')
    if (pw !== cpw) { setError('Passwords do not match.'); return }
    setLoading(true)
    try { await forgotPasswordReset(email, otp, pw); setSuccess(true); setStep(0); setEmail(''); setOtp(''); setPw(''); setCpw('') }
    catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[18px] font-bold text-white mb-1">Forgot Password</h2>
        <p className="text-[#7B6A9A] text-sm">Reset your password using a one-time code sent to your email</p>
      </div>

      {success && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"><CheckCircle size={14} />Password reset! You can now log in with your new password.</div>}

      {step === 0 && (
        <form onSubmit={initiate} className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Your email address</label>
            <input type="email" className={inputCls} placeholder="you@example.com" required value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold rounded-xl text-[14px] hover:bg-amber-500/25 transition-colors disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Send OTP
          </button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={reset} className="space-y-4">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-[13px] text-violet-300">
            OTP sent to your {method === 'phone' ? 'phone number' : 'email'}. Valid for 10 minutes.
          </div>
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">One-time password</label>
            <div className="flex gap-2">
              <input className={inputCls + ' text-center text-xl tracking-[0.4em] font-bold'} placeholder="000000" maxLength={6} value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }} autoFocus />
              <button type="button" onClick={async () => { setResending(true); try { await forgotPasswordInitiate(email, 'email') } catch { /* ignore */ } finally { setResending(false) } }}
                disabled={resending} className="flex-shrink-0 p-3.5 bg-white/5 border border-violet-500/20 rounded-xl text-[#7B6A9A] hover:text-violet-400 hover:border-violet-500/30 transition-all">
                <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">New password</label>
            <PasswordInput placeholder="Min. 6 characters" value={pw} onChange={e => { setPw(e.target.value); setError('') }} />
          </div>
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Confirm new password</label>
            <PasswordInput placeholder="Repeat new password" value={cpw} onChange={e => { setCpw(e.target.value); setError('') }} />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading || otp.length < 6}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />} Reset Password
            </button>
            <button type="button" onClick={() => { setStep(0); setError('') }}
              className="px-4 py-2.5 rounded-xl border border-violet-500/20 text-[#9F8BC7] hover:bg-white/5 text-[14px] transition-colors">Back</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Verifications section ────────────────────────────────────────
function VerificationsSection({ security, setSecurity }) {
  const [evOtp, setEvOtp] = useState('')
  const [evSent, setEvSent] = useState(false)
  const [evBusy, setEvBusy] = useState(false)
  const [evError, setEvError] = useState('')

  const sendEmailOtp = async () => {
    setEvError(''); setEvBusy(true)
    try { await sendEmailVerificationOtp(); setEvSent(true) } catch (e) { setEvError(e.message) } finally { setEvBusy(false) }
  }
  const doVerifyEmail = async (e) => {
    e.preventDefault(); setEvError(''); setEvBusy(true)
    try { const s = await verifyEmail(evOtp); setSecurity(s); setEvSent(false); setEvOtp('') } catch (e) { setEvError(e.message) } finally { setEvBusy(false) }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-[18px] font-bold text-white mb-1">Verifications</h2>
        <p className="text-[#7B6A9A] text-sm">Verify your contact details to enable OTP-based account recovery and two-factor options</p>
      </div>

      {/* Email */}
      <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center"><Mail size={18} className="text-sky-400" /></div>
            <div>
              <p className="text-[14px] font-bold text-white">Email Address</p>
              <p className="text-[12px] text-[#7B6A9A]">Receive OTPs and security alerts</p>
            </div>
          </div>
          <Badge verified={security?.emailVerified} />
        </div>

        {!security?.emailVerified && (
          evSent ? (
            <form onSubmit={doVerifyEmail} className="space-y-3">
              <p className="text-[12px] text-[#7B6A9A]">Enter the 6-digit code sent to your email address.</p>
              <div className="flex gap-2">
                <input className={inputCls + ' text-center text-xl tracking-[0.3em] font-bold'} placeholder="000000" maxLength={6} value={evOtp}
                  onChange={e => { setEvOtp(e.target.value.replace(/\D/g, '')); setEvError('') }} autoFocus />
                <button type="button" onClick={sendEmailOtp} className="p-3 bg-white/5 border border-violet-500/20 rounded-xl text-[#7B6A9A] hover:text-violet-400 transition-colors"><RefreshCw size={15} /></button>
              </div>
              {evError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{evError}</p>}
              <button type="submit" disabled={evBusy || evOtp.length < 6}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500/15 border border-sky-500/25 text-sky-400 font-semibold rounded-xl text-[13px] hover:bg-sky-500/25 transition-colors disabled:opacity-60">
                {evBusy && <Loader2 size={13} className="animate-spin" />} Verify Email
              </button>
            </form>
          ) : (
            <>
              {evError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{evError}</p>}
              <button onClick={sendEmailOtp} disabled={evBusy}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-semibold rounded-xl text-[13px] hover:bg-sky-500/20 transition-colors disabled:opacity-60">
                {evBusy ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} Send Verification Code
              </button>
            </>
          )
        )}
        {security?.emailVerified && (
          <p className="text-[12px] text-emerald-400">Your email address is verified and can be used for password recovery.</p>
        )}
      </div>

    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
export default function SettingsPage() {
  const [active, setActive] = useState('appearance')
  const [security, setSecurity] = useState(null)
  const [loadingSec, setLoadingSec] = useState(true)

  useEffect(() => {
    getSecurityInfo().then(s => { if (s) setSecurity(s) }).catch(() => {}).finally(() => setLoadingSec(false))
  }, [])

  return (
    <UserLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-[#7B6A9A] text-sm mt-0.5">Manage your preferences and account security</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left sidebar */}
        <aside className="w-52 flex-shrink-0 sticky top-8">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#4A3F6A] px-3 mb-1.5">{group}</p>
              <div className="space-y-0.5">
                {items.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActive(id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 text-left ${active === id ? 'bg-violet-600/20 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]' : 'text-[#7B6A9A] hover:bg-white/5 hover:text-violet-300'}`}>
                    <Icon size={15} className="flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          {active === 'appearance' && <AppearanceSection />}
          {active === 'language' && <LanguageSection />}
          {active === 'password' && <ChangePasswordSection />}
          {active === 'forgot' && <ForgotPasswordSection />}
          {active === 'verifications' && (
            loadingSec
              ? <div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>
              : <VerificationsSection security={security} setSecurity={setSecurity} />
          )}
        </div>
      </div>
    </UserLayout>
  )
}
