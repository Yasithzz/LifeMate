import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Phone, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import { forgotPasswordInitiate, forgotPasswordReset } from '../lib/api'

const inputCls =
  'bg-violet-500/7 border border-violet-500/20 rounded-xl px-4 py-3 text-[15px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none ' +
  'focus:border-violet-500/60 focus:bg-violet-500/12 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 w-full'

function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange}
        required className={inputCls + ' pr-12'} />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5E8A] hover:text-violet-400 transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState('email')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  const handleInitiate = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await forgotPasswordInitiate(email, method); setStep(1) }
    catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true)
    try { await forgotPasswordInitiate(email, method) } catch { /* resend errors are non-critical */ }
    finally { setResending(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault(); setError('')
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try { await forgotPasswordReset(email, otp, newPassword); setStep(2) }
    catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050213] via-[#0D0520] to-[#1A0A3D] flex flex-col font-[Inter,system-ui,sans-serif]">
      <div className="fixed top-0 right-[10%] w-[380px] h-[380px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] left-[5%] w-[280px] h-[280px] bg-pink-500/7 rounded-full blur-[100px] pointer-events-none z-0" />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-28 relative z-10">
        <div className="w-full max-w-[420px] bg-[#0F0828]/80 backdrop-blur-3xl border border-violet-500/18 rounded-3xl p-10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">✦</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">LifeMate</span>
          </Link>

          {/* Step 0 — email + method */}
          {step === 0 && (
            <>
              <h1 className="text-[24px] font-extrabold text-white text-center mb-1 tracking-tight">Forgot Password?</h1>
              <p className="text-[#9F8BC7] text-sm text-center mb-8">Enter your email and we'll send an OTP to reset your password</p>
              <form onSubmit={handleInitiate} className="flex flex-col gap-4">
                <input type="email" className={inputCls} placeholder="you@example.com" required value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }} />

                {email && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-2">Send OTP via</p>
                    <div className="flex gap-2">
                      {[{ v: 'email', icon: Mail, label: 'Email' }, { v: 'phone', icon: Phone, label: 'Phone' }].map(({ v, icon: Icon, label }) => (
                        <button key={v} type="button" onClick={() => setMethod(v)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${method === v ? 'bg-violet-600/25 border-violet-500/50 text-violet-300' : 'bg-white/5 border-violet-500/15 text-[#7B6A9A] hover:border-violet-500/30 hover:text-violet-300'}`}>
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                    {method === 'phone' && (
                      <p className="text-[11px] text-[#6B5E8A] mt-1.5">Phone OTP requires a verified phone number in Settings.</p>
                    )}
                  </div>
                )}

                {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-[16px] py-3.5 rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0">
                  {loading && <Loader2 size={16} className="animate-spin" />} Send OTP
                </button>
              </form>
            </>
          )}

          {/* Step 1 — OTP + new password */}
          {step === 1 && (
            <>
              <button onClick={() => { setStep(0); setOtp(''); setError('') }}
                className="flex items-center gap-1.5 text-[#7B6A9A] hover:text-violet-400 text-sm mb-6 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
              <h1 className="text-[24px] font-extrabold text-white text-center mb-1 tracking-tight">Enter OTP</h1>
              <p className="text-[#9F8BC7] text-sm text-center mb-1">
                A 6-digit code was sent to your {method === 'phone' ? 'verified phone number' : 'email address'}
              </p>
              <p className="text-violet-400 text-sm text-center font-medium mb-8">{email}</p>

              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">One-Time Password</label>
                  <div className="flex gap-2">
                    <input className={inputCls + ' text-center text-2xl tracking-[0.4em] font-bold'}
                      placeholder="000000" maxLength={6} value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }} autoFocus />
                    <button type="button" onClick={handleResend} disabled={resending}
                      className="flex-shrink-0 p-3.5 bg-white/5 border border-violet-500/20 rounded-xl text-[#7B6A9A] hover:text-violet-400 hover:border-violet-500/40 transition-all"
                      title="Resend OTP">
                      <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#6B5E8A] mt-1.5">Expires in 10 minutes · Click <RefreshCw size={11} className="inline" /> to resend</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">New Password</label>
                  <PasswordInput placeholder="Min. 6 characters" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError('') }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-1.5">Confirm Password</label>
                  <PasswordInput placeholder="Repeat new password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} />
                </div>

                {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-[16px] py-3.5 rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0">
                  {loading && <Loader2 size={16} className="animate-spin" />} Reset Password
                </button>
              </form>
            </>
          )}

          {/* Step 2 — success */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h1 className="text-[22px] font-extrabold text-white mb-2">Password Reset!</h1>
              <p className="text-[#9F8BC7] text-sm mb-8">Your password has been updated successfully.</p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-[16px] py-3.5 rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all duration-200">
                Back to Sign In
              </button>
            </div>
          )}

          {step < 2 && (
            <div className="border-t border-violet-500/10 mt-7 pt-6 text-center">
              <Link to="/login" className="text-[#9F8BC7] text-sm hover:text-violet-300 transition-colors flex items-center justify-center gap-1.5">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
