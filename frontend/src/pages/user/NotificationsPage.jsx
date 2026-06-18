import { useEffect, useState } from 'react'
import { CheckCheck, Trash2, BellOff, Loader2 } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../lib/api'

const TYPE_STYLES = {
  analysis: 'bg-violet-500/15 border-l-violet-500',
  task: 'bg-amber-500/10 border-l-amber-500',
  wellness: 'bg-sky-500/10 border-l-sky-500',
  achievement: 'bg-emerald-500/10 border-l-emerald-500',
  schedule: 'bg-pink-500/10 border-l-pink-500',
  info: 'bg-white/5 border-l-violet-400',
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationsPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const reload = () => getNotifications().then(n => setNotes(n ?? []))

  useEffect(() => { reload().finally(() => setLoading(false)) }, [])

  const unread = notes.filter(n => !n.isRead).length
  const displayed = filter === 'unread' ? notes.filter(n => !n.isRead) : notes

  const markRead = async (id) => {
    try { await markNotificationRead(id); setNotes(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n)) } catch { /* ignore */ }
  }

  const markAll = async () => {
    try { await markAllNotificationsRead(); setNotes(ns => ns.map(n => ({ ...n, isRead: true }))) } catch { /* ignore */ }
  }

  const remove = async (id) => {
    try { await deleteNotification(id); setNotes(ns => ns.filter(n => n.id !== id)) } catch { /* ignore */ }
  }

  return (
    <UserLayout>
      <div className="max-w-2xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-extrabold text-white tracking-tight">Notifications</h1>
            <p className="text-[#7B6A9A] text-sm mt-1">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAll} className="flex items-center gap-1.5 text-[13px] text-violet-400 hover:text-violet-300 border border-violet-500/25 px-3 py-2 rounded-xl hover:bg-violet-500/10 transition-all">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1 w-fit">
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all duration-200 ${filter === f ? 'bg-violet-600/30 text-violet-300' : 'text-[#7B6A9A] hover:text-violet-300'}`}>
              {f} {f === 'unread' && unread > 0 && <span className="ml-1 text-[11px] bg-violet-600/40 text-violet-300 px-1.5 py-0.5 rounded-full">{unread}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-violet-500/10 rounded-2xl">
            <BellOff size={36} className="text-[#4A3F6A] mx-auto mb-3" />
            <p className="text-[#7B6A9A]">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border-l-2 border border-violet-500/10 cursor-pointer transition-all duration-200 hover:border-violet-500/25 group ${TYPE_STYLES[n.type] ?? TYPE_STYLES.info} ${n.isRead ? 'opacity-60' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-violet-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13.5px] leading-relaxed ${n.isRead ? 'text-[#9F8BC7]' : 'text-white font-medium'}`}>{n.message}</p>
                  <p className="text-[11px] text-[#6B5E8A] mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); remove(n.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[#4A3F6A] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
