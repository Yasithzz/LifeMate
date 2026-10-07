import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, LogOut, ShieldCheck, Menu, X, MessageSquare } from 'lucide-react'
import { clearSession, getSession } from '../lib/api'

const NAV = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Overview',  end: true },
  { to: '/admin/users',       icon: Users,           label: 'Users' },
  { to: '/admin/feedbacks',   icon: MessageSquare,   label: 'Feedback' },
  { to: '/admin/settings',    icon: Settings,        label: 'Settings' },
]

function applyAdminTheme() {
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

export default function AdminLayout({ children }) {
  // Synchronous — runs before first paint so there's no flash on inter-admin navigation
  applyAdminTheme()

  const navigate = useNavigate()
  const session = getSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { clearSession(); navigate('/login') }

  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ backgroundColor: 'var(--lm-bg)' }}>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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
            <ShieldCheck size={15} className="text-violet-500" />
            <div>
              <span className="text-[14px] font-bold text-white tracking-tight">LifeMate</span>
              <span className="ml-2 text-[10px] font-semibold text-[#3A3060] uppercase tracking-wider">Admin</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#4A3F6A] hover:text-white transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3A3060] px-2 mb-1.5">Navigation</p>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2 py-2 my-0.5 rounded-lg text-[13px] font-medium transition-all duration-150
                border-l-2 pl-[6px]
                ${isActive
                  ? 'text-white border-violet-500 bg-white/[0.04]'
                  : 'text-[#5A4F7A] border-transparent hover:text-[#C4B5D9] hover:bg-white/[0.03]'
                }`
              }
            >
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin strip */}
        <div className="px-3 pb-4 border-t border-white/[0.04] pt-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-violet-900 flex items-center justify-center text-violet-300 text-[11px] font-bold flex-shrink-0 ring-1 ring-white/10">
              {session?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#C4B5D9] truncate">{session?.fullName ?? 'Admin'}</p>
            </div>
            <button onClick={handleLogout} title="Log out"
              className="text-[#3A3060] hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header style={{ backgroundColor: 'var(--lm-sidebar)' }} className="md:hidden fixed top-0 left-0 right-0 h-12 backdrop-blur-2xl border-b border-white/[0.05] flex items-center px-4 gap-3 z-20">
        <button onClick={() => setSidebarOpen(true)} className="text-[#5A4F7A] hover:text-white transition-colors" aria-label="Menu">
          <Menu size={20} />
        </button>
        <span className="text-[15px] font-bold text-white tracking-tight">LifeMate</span>
        <span className="text-[10px] font-semibold text-[#3A3060] uppercase tracking-wider">Admin</span>
      </header>

      {/* Main */}
      <main className="md:ml-56 min-h-screen pt-12 md:pt-0">
        <div className="relative z-10 p-5 sm:p-7 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
