import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { loginUser } from '../lib/api'

export default function LoginPage() {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.removeAttribute('data-accent')

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const auth = await loginUser({ email: form.email, password: form.password })
      navigate(auth.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

          <h1 className="text-[26px] font-extrabold text-white text-center mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#9F8BC7] text-sm text-center mb-8">
            Sign in to continue your journey
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">
                Email Address
              </label>
              <input
                id="email" name="email" type="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange} required
                className="bg-violet-500/7 border border-violet-500/20 rounded-xl px-4 py-3 text-[15px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none
                  focus:border-violet-500/60 focus:bg-violet-500/12 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 w-full"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">
                Password
              </label>
              <input
                id="password" name="password" type="password"
                placeholder="Enter your password"
                value={form.password} onChange={handleChange} required
                className="bg-violet-500/7 border border-violet-500/20 rounded-xl px-4 py-3 text-[15px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none
                  focus:border-violet-500/60 focus:bg-violet-500/12 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 w-full"
              />
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#9F8BC7] cursor-pointer select-none">
                <input
                  name="remember" type="checkbox"
                  checked={form.remember} onChange={handleChange}
                  className="accent-violet-500 w-4 h-4"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-[16px] py-3.5 rounded-xl
                shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="border-t border-violet-500/10 mt-7 pt-6 text-center">
            <p className="text-[#9F8BC7] text-sm">
              New to LifeMate?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
