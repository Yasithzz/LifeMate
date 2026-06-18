import { useState } from 'react'
import { Users, ShieldCheck, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'

export default function AdminDashboard() {
  const [stats] = useState({
    totalUsers: 3,
    activeToday: 1,
    newThisWeek: 2,
    systemStatus: 'Healthy',
  })

  const recentUsers = [
    { name: 'Browser Test', email: 'browsertest@example.com', role: 'USER', joined: 'Jun 18, 2026' },
    { name: 'Test User', email: 'testuser@example.com', role: 'USER', joined: 'Jun 16, 2026' },
    { name: 'Admin', email: 'admin@lifemate.com', role: 'ADMIN', joined: 'Jun 16, 2026' },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-[#7B6A9A] text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'New This Week', value: stats.newThisWeek, icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
          { label: 'System Status', value: stats.systemStatus, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl p-5 border ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A]">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-white/5 border border-violet-500/15 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-white">Recent Users</h2>
          <a href="/admin/users" className="text-[12px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={13} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-[#6B5E8A] border-b border-violet-500/10">
                <th className="text-left pb-3 font-semibold">Name</th>
                <th className="text-left pb-3 font-semibold">Email</th>
                <th className="text-left pb-3 font-semibold">Role</th>
                <th className="text-left pb-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/8">
              {recentUsers.map((u, i) => (
                <tr key={i} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <span className="text-[13px] text-white font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-[#9F8BC7]">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      u.role === 'ADMIN'
                        ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                        : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-3 text-[13px] text-[#6B5E8A]">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Backend', items: [['Framework', 'Spring Boot 4.1'], ['Database', 'MongoDB Atlas'], ['Status', '● Running'], ['Port', '8080']] },
          { title: 'Frontend', items: [['Framework', 'React 19 + Vite 8'], ['Styling', 'Tailwind CSS v4'], ['Auth', 'JWT Bearer Token'], ['Port', '5173']] },
        ].map(({ title, items }) => (
          <div key={title} className="bg-white/5 border border-violet-500/15 rounded-2xl p-5">
            <h3 className="text-[13px] font-bold text-white mb-4">{title}</h3>
            <div className="space-y-2">
              {items.map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12px]">
                  <span className="text-[#6B5E8A]">{k}</span>
                  <span className={`font-medium ${v.startsWith('●') ? 'text-emerald-400' : 'text-[#C4B5D9]'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
