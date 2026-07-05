import { useEffect, useState } from 'react'
import { ArrowRight, Star, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { adminGetStats, adminGetBestEngaged, adminGetInactiveUsers, adminDeleteUser } from '../../lib/api'
import { fmtDateLong, fmtDateShort } from '../../lib/locale'

function EngagementBar({ count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-pink-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-[#7B6A9A] w-8 text-right">{count}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, newThisWeek: 0, inactiveCount: 0 })
  const [bestEngaged, setBestEngaged] = useState([])
  const [inactive, setInactive] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [s, eng, inact] = await Promise.all([
        adminGetStats(),
        adminGetBestEngaged(),
        adminGetInactiveUsers(30),
      ])
      setStats(s)
      setBestEngaged(eng)
      setInactive(inact)
    } catch {
      // silently ignore — backend may be starting
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDeleteInactive = async (user) => {
    if (!window.confirm(`Delete account for ${user.fullName} (${user.email})? This cannot be undone.`)) return
    setDeletingId(user.id)
    try {
      await adminDeleteUser(user.id)
      setInactive(prev => prev.filter(u => u.id !== user.id))
      setStats(prev => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1), inactiveCount: Math.max(0, prev.inactiveCount - 1) }))
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const maxLogins = bestEngaged.reduce((m, u) => Math.max(m, u.loginCount), 0)

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3A3060] mb-2">
            {fmtDateLong(new Date())}
          </p>
          <h1 className="text-[36px] font-black text-white leading-none tracking-tight">System Overview</h1>
        </div>
        <button onClick={load} className="text-[#3A3060] hover:text-violet-400 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex gap-0 mb-10 rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
        {[
          { label: 'Total users',   value: stats.totalUsers,   accent: 'text-white' },
          { label: 'Active today',  value: stats.activeToday,  accent: 'text-emerald-300' },
          { label: 'New this week', value: stats.newThisWeek,  accent: 'text-violet-300' },
          { label: 'Inactive 30d',  value: stats.inactiveCount, accent: stats.inactiveCount > 0 ? 'text-amber-300' : 'text-white' },
        ].map((s, i) => (
          <div key={s.label} className={`flex-1 px-5 py-5 ${i < 3 ? 'border-r border-white/[0.05]' : ''}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3A3060] mb-2">{s.label}</p>
            <p className={`text-[28px] font-black leading-none ${s.accent}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Best Engaged Users */}
        <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Star size={16} className="text-amber-400" />
              <h2 className="text-[15px] font-bold text-white">Most Engaged Users</h2>
            </div>
            <a href="/admin/users" className="text-[12px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={13} />
            </a>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><RefreshCw size={18} className="text-violet-400 animate-spin" /></div>
          ) : bestEngaged.length === 0 ? (
            <p className="text-center text-[13px] text-[#4A3F6A] py-6">No engagement data yet</p>
          ) : (
            <div className="space-y-4">
              {bestEngaged.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className={`w-5 text-[12px] font-bold text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-[#9F8BC7]' : 'text-[#4A3F6A]'}`}>#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {u.fullName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{u.fullName}</p>
                    <EngagementBar count={u.loginCount} max={maxLogins} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Users */}
        <div className="bg-white/5 border border-amber-500/15 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-amber-400" />
              <h2 className="text-[15px] font-bold text-white">Inactive for 30+ Days</h2>
            </div>
            <a href="/admin/users" className="text-[12px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={13} />
            </a>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><RefreshCw size={18} className="text-violet-400 animate-spin" /></div>
          ) : inactive.length === 0 ? (
            <p className="text-center text-[13px] text-[#4A3F6A] py-6">No inactive users</p>
          ) : (
            <div className="space-y-3">
              {inactive.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 text-[11px] font-bold flex-shrink-0">
                    {u.fullName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{u.fullName}</p>
                    <p className="text-[11px] text-[#6B5E8A]">
                      {u.lastLoginAt
                        ? `Last seen ${fmtDateShort(u.lastLoginAt)}`
                        : 'Never logged in'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteInactive(u)}
                    disabled={deletingId === u.id}
                    className="p-1.5 rounded-lg text-[#4A3F6A] hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    title="Delete account"
                  >
                    {deletingId === u.id
                      ? <RefreshCw size={13} className="animate-spin" />
                      : <Trash2 size={13} />}
                  </button>
                </div>
              ))}
              {inactive.length > 5 && (
                <p className="text-[12px] text-[#4A3F6A] text-center pt-1">+{inactive.length - 5} more inactive users</p>
              )}
            </div>
          )}
        </div>
      </div>

    </AdminLayout>
  )
}
