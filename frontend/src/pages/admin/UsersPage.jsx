import { useEffect, useState } from 'react'
import { Search, UserX, RefreshCw, ShieldCheck, Trash2, AlertTriangle, X } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { adminGetUsers, adminDeleteUser } from '../../lib/api'
import { fmtDate } from '../../lib/locale'

function DeleteModal({ user, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D0520] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-bold text-white">Delete Account</h3>
          </div>
          <button onClick={onCancel} className="text-[#6B5E8A] hover:text-violet-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-[#9F8BC7] mb-1">
          You are about to permanently delete:
        </p>
        <p className="text-[14px] font-semibold text-white mb-1">{user.fullName}</p>
        <p className="text-[12px] text-[#7B6A9A] mb-4">{user.email}</p>
        <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-5">
          This will permanently delete all their data including tasks, schedules, wellness logs, and notifications. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-[13px] hover:bg-red-500/30 transition-colors disabled:opacity-60">
            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? 'Deleting…' : 'Delete Account'}
          </button>
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-2.5 border border-violet-500/20 text-[#9F8BC7] font-medium rounded-xl text-[13px] hover:bg-white/5 transition-colors disabled:opacity-60">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await adminGetUsers())
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await adminDeleteUser(toDelete.id)
      setUsers(prev => prev.filter(u => u.id !== toDelete.id))
      setToDelete(null)
    } catch (e) {
      setError(e.message || 'Failed to delete user')
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase())
  )

  const regularUsers = filtered.filter(u => u.role !== 'ADMIN')
  const adminUsers = filtered.filter(u => u.role === 'ADMIN')
  const sorted = [...adminUsers, ...regularUsers]

  return (
    <AdminLayout>
      {toDelete && (
        <DeleteModal
          user={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          deleting={deleting}
        />
      )}

      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">User Management</h1>
        <p className="text-[#7B6A9A] text-sm mt-1">View and manage all registered users</p>
      </div>

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
          <span className="text-[13px] text-[#7B6A9A]">{sorted.length} user{sorted.length !== 1 ? 's' : ''}</span>
          <button onClick={fetchUsers} className="p-2 rounded-xl bg-white/5 border border-violet-500/15 text-[#7B6A9A] hover:text-violet-400 hover:border-violet-500/30 transition-all">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[13px]">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="text-violet-400 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
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
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">Last Login</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">Logins</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest text-[#6B5E8A] font-semibold">Joined</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/8">
              {sorted.map((u, i) => (
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
                    {u.lastLoginAt
                      ? fmtDate(u.lastLoginAt)
                      : <span className="text-amber-500/70">Never</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[13px] font-semibold ${u.loginCount > 10 ? 'text-emerald-400' : u.loginCount > 0 ? 'text-[#9F8BC7]' : 'text-[#4A3F6A]'}`}>
                      {u.loginCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#6B5E8A]">
                    {u.createdAt ? fmtDate(u.createdAt) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => setToDelete(u)}
                        className="p-1.5 rounded-lg text-[#4A3F6A] hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete account"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
