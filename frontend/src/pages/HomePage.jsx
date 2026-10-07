import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPublicFeedbacks } from '../lib/api'

/* ── Feature cards data ── */
const FEATURES = [
  {
    icon: '🎯',
    from: 'rgba(124,58,237,0.2)',
    to:   'rgba(236,72,153,0.2)',
    title: 'Smart Goal Setting',
    desc:  'Define meaningful goals with milestones. Break big dreams into daily actions that feel achievable and real.',
  },
  {
    icon: '🌟',
    from: 'rgba(6,182,212,0.2)',
    to:   'rgba(124,58,237,0.2)',
    title: 'Daily Ritual Builder',
    desc:  'Design your perfect morning and evening routines using proven habit-stacking techniques.',
  },
  {
    icon: '📊',
    from: 'rgba(16,185,129,0.2)',
    to:   'rgba(6,182,212,0.2)',
    title: 'Progress Insights',
    desc:  'Beautiful visualisations that reveal your growth over time and keep you motivated to keep going.',
  },
  {
    icon: '🧘',
    from: 'rgba(245,158,11,0.2)',
    to:   'rgba(236,72,153,0.2)',
    title: 'Wellness Tracking',
    desc:  'Monitor mood, sleep, and energy levels to understand what makes you feel your absolute best.',
  },
  {
    icon: '🔔',
    from: 'rgba(236,72,153,0.2)',
    to:   'rgba(245,158,11,0.2)',
    title: 'Smart Reminders',
    desc:  'Intelligent nudges at exactly the right moment — never intrusive, always perfectly timed.',
  },
  {
    icon: '🤝',
    from: 'rgba(124,58,237,0.2)',
    to:   'rgba(16,185,129,0.2)',
    title: 'Community Support',
    desc:  'Connect with like-minded people on similar journeys. Share wins, support each other, grow together.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create Your Account',
    desc:  'Sign up in seconds. No credit card required. Start exploring your possibilities right away.',
  },
  {
    n: '02',
    title: 'Set Your Intentions',
    desc:  'Tell us your goals and dreams. We break them into clear, achievable daily habits.',
  },
  {
    n: '03',
    title: 'Track & Transform',
    desc:  'Follow your personalised plan. Watch your progress grow and celebrate every milestone.',
  },
]

// Avatar gradient pairs — cycled by index
const AVATAR_GRADIENTS = [
  ['#7C3AED', '#EC4899'],
  ['#06B6D4', '#7C3AED'],
  ['#10B981', '#06B6D4'],
  ['#F59E0B', '#EC4899'],
  ['#EC4899', '#F97316'],
  ['#7C3AED', '#10B981'],
]

/* ── Small reusable section header ── */
function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block bg-violet-500/15 border border-violet-500/30 text-violet-300 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5">
        {badge}
      </span>
      <h2 className="text-4xl md:text-[44px] font-extrabold text-white mb-4 tracking-tight leading-tight">
        {title}
      </h2>
      <p className="text-[#9F8BC7] text-lg max-w-[500px] mx-auto leading-relaxed">{subtitle}</p>
    </div>
  )
}

export default function HomePage() {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.removeAttribute('data-accent')

  const [feedbacks, setFeedbacks] = useState([])

  useEffect(() => {
    getPublicFeedbacks().then(data => {
      if (Array.isArray(data)) setFeedbacks(data)
    }).catch(() => {})
  }, [])

  return (
    <div className="bg-[#050213] text-[#E2D9F3] font-[Inter,system-ui,sans-serif] overflow-x-hidden">
      <Navbar />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20 px-6 overflow-hidden">
        {/* background glows */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[8%] w-[380px] h-[380px] bg-pink-500/8 rounded-full blur-[100px] pointer-events-none" />

        {/* dot-grid overlay */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        {/* hero background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050213] via-[#0D0520] to-[#1A0A3D] -z-10" />

        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* ── Left: copy ── */}
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-7">
              ✨ Your Personal Life Companion
            </div>

            <h1 className="text-5xl md:text-[62px] font-black leading-[1.08] tracking-tight text-white mb-6">
              Build Habits That
              <span className="block bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">
                Transform Your Life
              </span>
            </h1>

            <p className="text-[#9F8BC7] text-lg leading-relaxed mb-10 max-w-[480px]">
              LifeMate helps you set meaningful goals, build powerful daily habits, and track
              your progress — all in one beautifully designed app built for real, lasting transformation.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-base px-7 py-3.5 rounded-xl
                  shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 transition-all duration-300 group">
                Get Started Free
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center text-violet-300 border border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/55 hover:text-white text-base font-medium px-7 py-3.5 rounded-xl transition-all duration-200">
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {['from-violet-600 to-pink-500', 'from-pink-500 to-amber-400', 'from-cyan-500 to-violet-600', 'from-emerald-500 to-cyan-500', 'from-violet-400 to-emerald-400'].map((g, i) => (
                  <div key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-[#050213] ${i > 0 ? '-ml-2' : ''}`} />
                ))}
              </div>
              <p className="text-[#9F8BC7] text-sm">
                <span className="text-violet-300 font-semibold">50,000+</span> people already transforming their lives
              </p>
            </div>
          </div>

          {/* ── Right: phone mockup ── */}
          <div className="hidden lg:flex justify-center relative">
            {/* Phone */}
            <div className="relative w-[270px] h-[550px] bg-gradient-to-b from-[#1A0A3D] to-[#0D0520] rounded-[40px] border border-violet-500/35
              shadow-[0_0_0_1px_rgba(124,58,237,0.08),0_24px_80px_rgba(0,0,0,0.7),0_0_80px_rgba(124,58,237,0.12)] overflow-hidden">

              {/* notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0D0520] rounded-full z-10" />

              {/* screen content */}
              <div className="absolute inset-0 p-5 pt-12 flex flex-col gap-3 overflow-hidden">
                {/* top bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-[13px] font-semibold">Good morning! ☀️</p>
                    <p className="text-violet-400 text-[11px] mt-0.5">Friday, June 13</p>
                  </div>
                  <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    🔥 7
                  </div>
                </div>

                {/* progress card */}
                <div className="bg-violet-500/12 border border-violet-500/22 rounded-2xl p-3.5">
                  <div className="flex justify-between items-center text-[12px] mb-2">
                    <span className="text-violet-300 font-medium">Today's Habits</span>
                    <span className="text-violet-400 font-bold">4 / 6</span>
                  </div>
                  <div className="h-1.5 bg-violet-500/15 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" style={{ width: '67%' }} />
                  </div>
                  <p className="text-[11px] text-[#9F8BC7] mt-1.5">Keep going, you're doing great! 💪</p>
                </div>

                {/* habits */}
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Morning Meditation', done: true },
                    { label: '30 min Exercise',    done: true },
                    { label: 'Read 20 Pages',      done: true },
                    { label: 'Drink 8 Glasses',    done: false },
                    { label: 'Evening Journal',    done: false },
                  ].map(({ label, done }) => (
                    <div key={label}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] border transition-all
                        ${done
                          ? 'bg-violet-500/8 border-violet-500/15 text-[#E2D9F3]'
                          : 'bg-white/[0.03] border-white/5 text-[#9F8BC7]'}`}>
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold
                        ${done
                          ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white'
                          : 'border-2 border-violet-500/30'}`}>
                        {done && '✓'}
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* floating cards */}
            <div className="float-slow absolute -top-4 -right-6 flex items-center gap-2.5 bg-[#0A0420]/90 backdrop-blur-xl border border-violet-500/22 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-white text-[13px] font-semibold leading-tight">Goal Achieved!</p>
                <p className="text-[#9F8BC7] text-[11px]">Running 5K completed</p>
              </div>
            </div>
            <div className="float-delayed absolute bottom-16 -left-8 flex items-center gap-2.5 bg-[#0A0420]/90 backdrop-blur-xl border border-violet-500/22 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-white text-[13px] font-semibold leading-tight">+23% Growth</p>
                <p className="text-[#9F8BC7] text-[11px]">This month vs last</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="bg-violet-500/[0.04] border-y border-violet-500/10 py-10 px-6">
        <div className="max-w-[900px] mx-auto flex flex-wrap items-center justify-around gap-8">
          {[
            { num: '50K+', label: 'Active Users' },
            { num: '2M+',  label: 'Habits Tracked' },
            { num: '89%',  label: 'Goal Success Rate' },
            { num: '4.9★', label: 'User Rating' },
          ].map(({ num, label }, i, arr) => (
            <div key={label} className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                  {num}
                </p>
                <p className="text-[#9F8BC7] text-sm mt-1">{label}</p>
              </div>
              {i < arr.length - 1 && <div className="hidden sm:block w-px h-10 bg-violet-500/20" />}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="py-24 px-6 bg-[#050213]">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeader
            badge="Features"
            title="Everything You Need to Thrive"
            subtitle="Powerful tools designed to help you build a life you're truly proud of."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title}
                className="bg-white/[0.03] border border-violet-500/15 rounded-2xl p-8 hover:bg-violet-500/[0.07] hover:border-violet-500/35 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(124,58,237,0.12)] transition-all duration-300">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{ background: `linear-gradient(135deg, ${f.from}, ${f.to})` }}>
                  {f.icon}
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-[#9F8BC7] text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-[#0D0520] to-[#050213]">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeader
            badge="How It Works"
            title="Start Your Journey in 3 Simple Steps"
            subtitle="Getting started has never been easier. Your transformation begins today."
          />

          <div className="flex flex-col md:flex-row items-center gap-4">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.n}>
                <div className="flex-1 bg-white/[0.03] border border-violet-500/15 rounded-2xl p-9 text-center hover:bg-violet-500/[0.06] transition-all duration-300">
                  <p className="text-6xl font-black bg-gradient-to-r from-violet-500/50 to-pink-500/50 bg-clip-text text-transparent mb-4 leading-none">
                    {step.n}
                  </p>
                  <h3 className="text-white text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-[#9F8BC7] text-[15px] leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="text-violet-500/40 text-3xl flex-shrink-0 md:block hidden">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ USER FEEDBACK ════════════════ */}
      {feedbacks.length > 0 && (
        <section id="testimonials" className="py-24 px-6 bg-[#050213]">
          <div className="max-w-[1200px] mx-auto">
            <SectionHeader
              badge="From Our Users"
              title="Real People, Real Transformations"
              subtitle="Hear directly from the LifeMate community."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.slice(0, 6).map((fb, i) => {
                const [from, to] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                const featured   = i === 1
                return (
                  <div key={fb.id}
                    className={`rounded-2xl p-8 transition-all duration-300
                      ${featured
                        ? 'bg-violet-500/10 border border-violet-500/35 shadow-[0_0_40px_rgba(124,58,237,0.1)]'
                        : 'bg-white/[0.03] border border-violet-500/15 hover:bg-violet-500/[0.06] hover:-translate-y-0.5'
                      }`}>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={14}
                          fill={n <= fb.rating ? '#f59e0b' : 'transparent'}
                          stroke={n <= fb.rating ? '#f59e0b' : '#4A3F6A'}
                        />
                      ))}
                    </div>
                    <p className="text-violet-200 text-[15px] leading-relaxed mb-6 italic">
                      &ldquo;{fb.message}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[13px] font-bold"
                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                        {fb.userName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <p className="text-white text-sm font-semibold">{fb.userName}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {feedbacks.length > 6 && (
              <p className="text-center text-[13px] text-[#5A4F7A] mt-8">
                +{feedbacks.length - 6} more reviews from our community
              </p>
            )}
          </div>
        </section>
      )}

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-gradient-to-br from-[#0D0520] via-[#1A0A3D] to-[#0D0520]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
            Ready to Transform Your Life?
          </h2>
          <p className="text-[#9F8BC7] text-lg mb-10">
            Join thousands of people already living their best lives with LifeMate.
          </p>
          <Link to="/signup"
            className="inline-block bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-lg px-12 py-4.5 rounded-2xl
              shadow-[0_8px_40px_rgba(124,58,237,0.5)] hover:shadow-[0_16px_60px_rgba(124,58,237,0.7)] hover:-translate-y-1 transition-all duration-300">
            Start For Free Today →
          </Link>
          <p className="text-[#6B5E8A] text-sm mt-5">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
