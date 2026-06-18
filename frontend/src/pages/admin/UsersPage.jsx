import { useEffect, useState } from 'react'
import { Search, UserX, RefreshCw, ShieldCheck } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { getToken } from '../../lib/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.status === 404) {
        setUsers(MOCK_USERS)
      } else if (!res.ok) {
        throw new Error('Failed to load users')
      } else {
        setUsers(await res.json())
      }
    } catch {
      setUsers(MOCK_USERS)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">User Management</h1>
        <p className="text-[#7B6A9A] text-sm mt-1">View and manage all registered users</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E8A]" />
          <input
            type="text"
            placeholder="Search users…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-violet-500/20 rounded-xl pl-9 pr-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#7B6A9A]">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={fetchUsers} className="p-2 rounded-xl bg-white/5 border border-violet-500/15 text-[#7B6A9A] hover:text-violet-400 hover:border-violet-500/30 transition-all">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="text-violet-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-violet-500/10 rounded-2xl">
          <UserX size={32} className="text-[#4A3F6A] mx-auto mb-3" />
          <p className="text-[#7B6A9A]">No users found</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-violet-500/15 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-violet-500/10 bg-white/3">
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">User</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">Email</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">Role</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/8">
              {filtered.map((u, i) => (
                <tr key={u.id ?? i} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                        {u.fullName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-[13px] text-white font-medium">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#9F8BC7]">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1 w-fit text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      u.role === 'ADMIN'
                        ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                        : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                    }`}>
                      {u.role === 'ADMIN' && <ShieldCheck size={11} />} {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#6B5E8A]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

const MOCK_USERS = [
  { id: '1', fullName: 'Admin', email: 'admin@lifemate.com', role: 'ADMIN', createdAt: '2026-06-16T10:00:00Z' },
  { id: '2', fullName: 'Test User', email: 'testuser@example.com', role: 'USER', createdAt: '2026-06-16T10:30:00Z' },
  { id: '3', fullName: 'Browser Test', email: 'browsertest@example.com', role: 'USER', createdAt: '2026-06-18T09:00:00Z' },
]
