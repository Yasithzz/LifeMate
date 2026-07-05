import { useEffect, useState } from 'react'

// Apply this user's saved theme + accent to <html> — scoped to user dashboard only
function applyUserTheme() {
  const theme = localStorage.getItem('lm_theme') || 'dark'
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  document.documentElement.setAttribute('data-theme', resolved)

  const accent = localStorage.getItem('lm_accent') || 'violet'
  if (accent !== 'violet') {
    document.documentElement.setAttribute('data-accent', accent)
  } else {
    document.documentElement.removeAttribute('data-accent')
  }
}
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Heart, CalendarDays, CheckSquare, Zap,
  Bell, User, Settings, LogOut, BarChart3, Menu, X, Sparkles, MessageSquare,
} from 'lucide-react'
import { clearSession, getSession, getUnreadCount, getProfile } from '../lib/api'
import NotificationPopup from './NotificationPopup'
import dashboardBg from '../assets/dashboard-bg.svg'

// Cached across remounts so the sidebar avatar doesn't blink back to the
// initial-letter placeholder on every dashboard navigation while it refetches.
let cachedAvatar = null

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Wellness',
    items: [
      { to: '/dashboard/lifestyle', icon: Heart,        label: 'Lifestyle' },
      { to: '/dashboard/wellness',  icon: Zap,          label: 'Wellness' },
      { to: '/dashboard/schedule',  icon: CalendarDays, label: 'Schedule' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { to: '/dashboard/tasks',        icon: CheckSquare, label: 'Tasks' },
      { to: '/dashboard/productivity', icon: BarChart3,   label: 'Productivity' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/notifications', icon: Bell,           label: 'Notifications', badge: true },
      { to: '/dashboard/profile',       icon: User,           label: 'Profile' },
      { to: '/dashboard/settings',      icon: Settings,       label: 'Settings' },
      { to: '/dashboard/feedback',      icon: MessageSquare,  label: 'Feedback' },
    ],
  },
]

export default function UserLayout({ children }) {
  // Synchronous call during render — runs before first paint so there's no flash
  // even when React Router remounts this component on every dashboard navigation.
  applyUserTheme()

  const navigate = useNavigate()
  const session = getSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [avatar, setAvatar] = useState(cachedAvatar)

  useEffect(() => {
    getUnreadCount().then(d => setUnreadCount(d?.count ?? 0)).catch(() => {})
    getProfile().then(p => {
      const next = p?.avatarBase64 || null
      cachedAvatar = next
      setAvatar(next)
    }).catch(() => {})
    // No cleanup here — public pages and AdminLayout reset the theme on their own mount.
    // A cleanup would fire on every inter-dashboard navigation causing a dark flash.
  }, [])

  const handleLogout = () => { clearSession(); navigate('/login') }

  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ backgroundColor: 'var(--lm-bg)' }}>

      {/* Background image — lm-bg-img class lets light theme CSS hide this */}
      <div
        className="lm-bg-img fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Veil — colour and opacity shift per theme via --lm-overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'var(--lm-overlay)' }} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        style={{ backgroundColor: 'var(--lm-sidebar)' }}
        className={`
        fixed top-0 left-0 h-screen w-56
        backdrop-blur-2xl
        border-r border-white/[0.05]
        flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-[15px] font-bold text-white tracking-tight">LifeMate</span>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#4A3F6A] hover:text-white transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto pb-4">
          {NAV_GROUPS.map(({ label, items }, gi) => (
            <div key={label} className={gi > 0 ? 'mt-5' : ''}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3A3060] px-2 mb-1.5">
                {label}
              </p>
              {items.map(({ to, icon: Icon, label: lbl, badge }) => (
                <NavLink key={to} to={to} end={to === '/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2 py-2 my-0.5 rounded-lg text-[13px] font-medium transition-all duration-150
                    relative group
                    ${isActive
                      ? 'text-white border-l-2 border-violet-500 pl-[6px] bg-white/[0.04]'
                      : 'text-[#5A4F7A] hover:text-[#C4B5D9] hover:bg-white/[0.03] border-l-2 border-transparent pl-[6px]'
                    }`
                  }
                >
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{lbl}</span>
                  {badge && unreadCount > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User strip */}
        <div className="px-3 pb-4 border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-violet-900 flex items-center justify-center text-violet-300 text-[11px] font-bold">
                    {session?.fullName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#C4B5D9] truncate">{session?.fullName}</p>
            </div>
            <button onClick={handleLogout} title="Log out"
              className="text-[#3A3060] hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile header ─────────────────────────────────────────── */}
      <header style={{ backgroundColor: 'var(--lm-sidebar)' }} className="md:hidden fixed top-0 left-0 right-0 h-12 backdrop-blur-2xl border-b border-white/[0.05] flex items-center px-4 gap-3 z-20">
        <button onClick={() => setSidebarOpen(true)} className="text-[#5A4F7A] hover:text-white transition-colors" aria-label="Menu">
          <Menu size={20} />
        </button>
        <span className="text-[15px] font-bold text-white tracking-tight">LifeMate</span>
        {unreadCount > 0 && (
          <NavLink to="/dashboard/notifications" className="ml-auto relative text-[#5A4F7A] hover:text-violet-300 transition-colors">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-violet-600 text-white text-[8px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </NavLink>
        )}
      </header>

      <NotificationPopup />

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="md:ml-56 min-h-screen pt-12 md:pt-0">
        <div className="relative z-10 p-5 sm:p-7 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
