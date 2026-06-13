import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // TODO: POST /api/auth/forgot-password  { email }
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050213] via-[#0D0520] to-[#1A0A3D] flex flex-col font-[Inter,system-ui,sans-serif]">
      {/* background glows */}
      <div className="fixed top-0 right-[10%] w-[380px] h-[380px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] left-[5%] w-[280px] h-[280px] bg-pink-500/7 rounded-full blur-[100px] pointer-events-none z-0" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-28 relative z-10">
        <div className="w-full max-w-[420px] bg-[#0F0828]/80 backdrop-blur-3xl border border-violet-500/18 rounded-3xl p-10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">✦</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              LifeMate
            </span>
          </Link>

          {submitted ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-5">
                ✅
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">Check your inbox</h1>
              <p className="text-[#9F8BC7] text-sm leading-relaxed mb-6">
                We've sent a password reset link to{' '}
                <span className="text-violet-300 font-semibold">{email}</span>.
                Please follow the instructions in the email.
              </p>
              <p className="text-[#6B5E8A] text-xs mb-6">
                Didn't receive it? Check your spam folder or try again in a few minutes.
              </p>
              <button onClick={() => { setSubmitted(false); setEmail('') }}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
                ← Try a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1 className="text-[26px] font-extrabold text-white text-center mb-1 tracking-tight">
                Reset Password
              </h1>
              <p className="text-[#9F8BC7] text-sm text-center mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">
                    Email Address
                  </label>
                  <input
                    id="email" type="email"
                    placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    className="bg-violet-500/7 border border-violet-500/20 rounded-xl px-4 py-3 text-[15px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none
                      focus:border-violet-500/60 focus:bg-violet-500/12 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 w-full"
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="mt-2 w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-[16px] py-3.5 rounded-xl
                    shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>
            </>
          )}

          <div className="border-t border-violet-500/10 mt-7 pt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[#9F8BC7] hover:text-violet-300 text-sm transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
