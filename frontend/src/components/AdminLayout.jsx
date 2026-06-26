import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { clearSession, getSession } from '../lib/api'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const session = getSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#050213] font-[Inter,system-ui,sans-serif]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-[#0A0420]/95 backdrop-blur-xl border-r border-violet-500/10 flex flex-col z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-violet-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-violet-400 flex-shrink-0" />
            <span className="text-[16px] font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              LifeMate Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-[#7B6A9A] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]'
                    : 'text-[#7B6A9A] hover:bg-white/5 hover:text-violet-300'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-3 py-4 border-t border-violet-500/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{session?.fullName ?? 'Admin'}</p>
              <p className="text-[11px] text-[#6B5E8A] truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13.5px] font-medium text-[#7B6A9A] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0A0420]/95 backdrop-blur-xl border-b border-violet-500/10 flex items-center px-4 gap-3 z-20">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-[#7B6A9A] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          LifeMate Admin
        </span>
      </header>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen pt-14 md:pt-0">
        <div className="fixed top-14 md:top-0 right-[10%] w-[500px] h-[400px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
