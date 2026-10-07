import { useEffect, useState } from 'react'
import {
  Palette, Lock, Key, Shield, Mail,
  CheckCircle, AlertCircle, Loader2, Eye, EyeOff,
  RefreshCw, Sun, Moon, Monitor, Check, ShieldCheck,
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import {
  changePassword, getSession, getSecurityInfo,
  sendEmailVerificationOtp, verifyEmail,
  forgotPasswordInitiate, forgotPasswordReset,
} from '../../lib/api'

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

const ACCENT_COLORS = [
  { name: 'Violet', value: 'violet', hex: ['#7c3aed', '#ec4899'] },
  { name: 'Blue',   value: 'blue',   hex: ['#2563eb', '#06b6d4'] },
  { name: 'Emerald',value: 'emerald',hex: ['#059669', '#14b8a6'] },
  { name: 'Rose',   value: 'rose',   hex: ['#e11d48', '#f97316'] },
  { name: 'Indigo', value: 'indigo', hex: ['#4338ca', '#8b5cf6'] },
]
const THEMES = [
  { id: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Default dark theme' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Follow system setting' },
  { id: 'light',  label: 'Light',  icon: Sun,     desc: 'Bright light theme' },
]

function applyThemeToDom(t) {
  const resolved = t === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : t
  document.documentElement.setAttribute('data-theme', resolved)
}

const NAV = [
  {
    group: 'General',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Palette },
    ],
  },
  {
    group: 'Security & Login',
    items: [
      { id: 'password',      label: 'Change Password', icon: Lock },
      { id: 'forgot',        label: 'Forgot Password', icon: Key },
      { id: 'verifications', label: 'Verifications',   icon: Shield },
    ],
  },
]

export default function AdminSettingsPage() {
  const session = getSession()
  const [active, setActive] = useState('appearance')
  const [security, setSecurity]     = useState(null)
  const [loadingSec, setLoadingSec] = useState(true)

  // appearance
  const [accent, setAccent]         = useState(() => localStorage.getItem('lm_accent') || 'violet')
  const [theme, setTheme]           = useState(() => localStorage.getItem('lm_theme')  || 'dark')
  const [appearSaved, setAppearSaved] = useState(false)

  // change pw
  const [cpForm, setCpForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [cpBusy, setCpBusy]   = useState(false)
  const [cpError, setCpError] = useState('')
  const [cpSuccess, setCpSuccess] = useState(false)

  // forgot pw
  const [fpStep, setFpStep]       = useState(0)
  const [fpEmail, setFpEmail]     = useState('')
  const [fpOtp, setFpOtp]         = useState('')
  const [fpPw, setFpPw]           = useState('')
  const [fpCpw, setFpCpw]         = useState('')
  const [fpBusy, setFpBusy]       = useState(false)
  const [fpError, setFpError]     = useState('')
  const [fpSuccess, setFpSuccess] = useState(false)
  const [fpResend, setFpResend]   = useState(false)

  // email verify
  const [evOtp, setEvOtp]   = useState('')
  const [evSent, setEvSent] = useState(false)
  const [evBusy, setEvBusy] = useState(false)
  const [evError, setEvError] = useState('')

  useEffect(() => {
    getSecurityInfo().then(s => { if (s) setSecurity(s) }).catch(() => {}).finally(() => setLoadingSec(false))
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault(); setCpError('')
    if (cpForm.newPassword !== cpForm.confirmPassword) { setCpError('New passwords do not match.'); return }
    if (cpForm.newPassword.length < 6) { setCpError('Password must be at least 6 characters.'); return }
    setCpBusy(true)
    try {
      await changePassword({ currentPassword: cpForm.currentPassword, newPassword: cpForm.newPassword })
      setCpSuccess(true); setCpForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setCpSuccess(false), 3000)
    } catch (err) { setCpError(err.message) } finally { setCpBusy(false) }
  }

  const handleFpInitiate = async (e) => {
    e.preventDefault(); setFpError(''); setFpBusy(true)
    try { await forgotPasswordInitiate(fpEmail, 'email'); setFpStep(1) }
    catch (err) { setFpError(err.message) } finally { setFpBusy(false) }
  }

  const handleFpReset = async (e) => {
    e.preventDefault(); setFpError('')
    if (fpPw !== fpCpw) { setFpError('Passwords do not match.'); return }
    setFpBusy(true)
    try { await forgotPasswordReset(fpEmail, fpOtp, fpPw); setFpSuccess(true); setFpStep(0) }
    catch (err) { setFpError(err.message) } finally { setFpBusy(false) }
  }

  const sendEmailOtp = async () => {
    setEvError(''); setEvBusy(true)
    try { await sendEmailVerificationOtp(); setEvSent(true) }
    catch (e) { setEvError(e.message) } finally { setEvBusy(false) }
  }

  const doVerifyEmail = async (e) => {
    e.preventDefault(); setEvError(''); setEvBusy(true)
    try { const s = await verifyEmail(evOtp); setSecurity(s); setEvSent(false); setEvOtp('') }
    catch (e) { setEvError(e.message) } finally { setEvBusy(false) }
  }

  const saveAppearance = () => {
    localStorage.setItem('lm_accent', accent)
    localStorage.setItem('lm_theme', theme)
    if (accent !== 'violet') {
      document.documentElement.setAttribute('data-accent', accent)
    } else {
      document.documentElement.removeAttribute('data-accent')
    }
    applyThemeToDom(theme)
    setAppearSaved(true)
    setTimeout(() => setAppearSaved(false), 2000)
  }

  return (
    <AdminLayout>
      {/* Admin identity banner */}
      <div className="flex items-center gap-4 bg-white/5 border border-violet-500/15 rounded-2xl p-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-[14px]">{session?.fullName ?? 'Admin'}</p>
          <p className="text-[#7B6A9A] text-[12px]">{session?.email} · Administrator</p>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-[#7B6A9A] text-sm mt-0.5">Manage admin account preferences and security</p>
      </div>

      <div className="flex gap-8 items-start">

        {/* Sidebar nav — matches user settings style */}
        <aside className="w-52 flex-shrink-0 sticky top-8">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3A3060] px-3 mb-1.5">{group}</p>
              <div className="space-y-0.5">
                {items.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActive(id)}
                    className={`flex items-center gap-2.5 w-full px-2 py-2 my-0.5 rounded-lg text-[13px] font-medium transition-all duration-150 text-left border-l-2 pl-[6px]
                      ${active === id
                        ? 'text-white border-violet-500 bg-white/[0.04]'
                        : 'text-[#5A4F7A] border-transparent hover:text-[#C4B5D9] hover:bg-white/[0.03]'
                      }`}>
                    <Icon size={15} className="flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Appearance */}
          {active === 'appearance' && (
            <div className="space-y-8 max-w-xl">
              <div>
                <h2 className="text-[18px] font-bold text-white mb-1">Appearance</h2>
                <p className="text-[#7B6A9A] text-sm">Customize how the admin panel looks on your device</p>
              </div>

              {/* Theme */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(({ id, label, icon: Icon, desc }) => (
                    <button key={id} onClick={() => setTheme(id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer
                        ${theme === id ? 'bg-violet-600/20 border-violet-500/50' : 'bg-white/5 border-violet-500/10 hover:border-violet-500/30'}`}>
                      {theme === id && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === id ? 'bg-violet-500/30' : 'bg-white/8'}`}>
                        <Icon size={20} className={theme === id ? 'text-violet-300' : 'text-[#7B6A9A]'} />
                      </div>
                      <span className={`text-[13px] font-medium ${theme === id ? 'text-white' : 'text-[#9F8BC7]'}`}>{label}</span>
                      <span className="text-[11px] text-[#6B5E8A]">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {ACCENT_COLORS.map(c => (
                    <button key={c.value} onClick={() => setAccent(c.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 flex-1
                        ${accent === c.value ? 'bg-white/10 border-white/25' : 'bg-white/5 border-violet-500/10 hover:border-violet-500/25'}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${c.hex[0]}, ${c.hex[1]})` }}>
                        {accent === c.value && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-[11px] text-[#9F8BC7]">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {appearSaved && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  <CheckCircle size={14} /> Preferences saved!
                </div>
              )}
              <button onClick={saveAppearance}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                Save Preferences
              </button>
            </div>
          )}

          {/* Change Password */}
          {active === 'password' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h2 className="text-[18px] font-bold text-white mb-1">Change Password</h2>
                <p className="text-[#7B6A9A] text-sm">Update your admin account password</p>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div><label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Current password</label><PasswordInput placeholder="Enter current password" value={cpForm.currentPassword} onChange={e => { setCpForm(f => ({ ...f, currentPassword: e.target.value })); setCpError('') }} /></div>
                <div><label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">New password</label><PasswordInput placeholder="Min. 6 characters" value={cpForm.newPassword} onChange={e => { setCpForm(f => ({ ...f, newPassword: e.target.value })); setCpError('') }} /></div>
                <div><label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Confirm new password</label><PasswordInput placeholder="Repeat new password" value={cpForm.confirmPassword} onChange={e => { setCpForm(f => ({ ...f, confirmPassword: e.target.value })); setCpError('') }} /></div>
                {cpError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{cpError}</p>}
                {cpSuccess && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"><CheckCircle size={14} />Password updated!</div>}
                <button type="submit" disabled={cpBusy}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)] disabled:opacity-60">
                  {cpBusy && <Loader2 size={14} className="animate-spin" />} Update Password
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password */}
          {active === 'forgot' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h2 className="text-[18px] font-bold text-white mb-1">Forgot Password</h2>
                <p className="text-[#7B6A9A] text-sm">Reset via OTP sent to your email</p>
              </div>
              {fpSuccess && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2"><CheckCircle size={14} />Password reset successfully.</div>}
              {fpStep === 0 && (
                <form onSubmit={handleFpInitiate} className="space-y-4">
                  <div><label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Admin email</label><input type="email" className={inputCls} placeholder="admin@lifemate.com" required value={fpEmail} onChange={e => { setFpEmail(e.target.value); setFpError('') }} /></div>
                  {fpError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{fpError}</p>}
                  <button type="submit" disabled={fpBusy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)] disabled:opacity-60">
                    {fpBusy && <Loader2 size={14} className="animate-spin" />} Send OTP
                  </button>
                </form>
              )}
              {fpStep === 1 && (
                <form onSubmit={handleFpReset} className="space-y-4">
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-[13px] text-violet-300">OTP sent to your email. Valid for 10 minutes.</div>
                  <div>
                    <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">One-time password</label>
                    <div className="flex gap-2">
                      <input className={inputCls + ' text-center text-xl tracking-[0.4em] font-bold'} placeholder="000000" maxLength={6} value={fpOtp}
                        onChange={e => { setFpOtp(e.target.value.replace(/\D/g, '')); setFpError('') }} autoFocus />
                      <button type="button" disabled={fpResend}
                        onClick={async () => { setFpResend(true); try { await forgotPasswordInitiate(fpEmail, 'email') } catch { } finally { setFpResend(false) } }}
                        className="p-3.5 bg-white/5 border border-violet-500/20 rounded-xl text-[#7B6A9A] hover:text-violet-400 transition-colors">
                        <RefreshCw size={16} className={fpResend ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                  <div><label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">New password</label><PasswordInput placeholder="Min. 6 characters" value={fpPw} onChange={e => { setFpPw(e.target.value); setFpError('') }} /></div>
                  <div><label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Confirm password</label><PasswordInput placeholder="Repeat" value={fpCpw} onChange={e => { setFpCpw(e.target.value); setFpError('') }} /></div>
                  {fpError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{fpError}</p>}
                  <div className="flex gap-3">
                    <button type="submit" disabled={fpBusy || fpOtp.length < 6}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
                      {fpBusy && <Loader2 size={14} className="animate-spin" />} Reset Password
                    </button>
                    <button type="button" onClick={() => { setFpStep(0); setFpError('') }}
                      className="px-4 py-2.5 rounded-xl border border-violet-500/20 text-[#9F8BC7] hover:bg-white/5 text-[14px] transition-colors">
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Verifications */}
          {active === 'verifications' && (
            loadingSec
              ? <div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>
              : (
                <div className="space-y-8 max-w-lg">
                  <div>
                    <h2 className="text-[18px] font-bold text-white mb-1">Verifications</h2>
                    <p className="text-[#7B6A9A] text-sm">Verify contact details to enable OTP-based recovery</p>
                  </div>
                  <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center"><Mail size={18} className="text-sky-400" /></div>
                        <div><p className="text-[14px] font-bold text-white">Email Address</p><p className="text-[12px] text-[#7B6A9A]">Receive OTPs and security alerts</p></div>
                      </div>
                      <Badge verified={security?.emailVerified} />
                    </div>
                    {!security?.emailVerified && (
                      evSent ? (
                        <form onSubmit={doVerifyEmail} className="space-y-3">
                          <p className="text-[12px] text-[#7B6A9A]">Enter the 6-digit code sent to your email.</p>
                          <div className="flex gap-2">
                            <input className={inputCls + ' text-center text-xl tracking-[0.3em] font-bold'} placeholder="000000" maxLength={6} value={evOtp} onChange={e => { setEvOtp(e.target.value.replace(/\D/g, '')); setEvError('') }} autoFocus />
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
                    {security?.emailVerified && <p className="text-[12px] text-emerald-400">Email verified — used for OTP-based password recovery.</p>}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
