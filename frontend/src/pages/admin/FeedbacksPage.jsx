import { useEffect, useState } from 'react'
import { Star, Trash2, RefreshCw, MessageSquare } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { adminGetFeedbacks, adminDeleteFeedback } from '../../lib/api'
import { fmtDate } from '../../lib/locale'

const AVATAR_GRADIENTS = [
  ['#7C3AED', '#EC4899'], ['#06B6D4', '#7C3AED'], ['#10B981', '#06B6D4'],
  ['#F59E0B', '#EC4899'], ['#EC4899', '#F97316'], ['#7C3AED', '#10B981'],
]

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    adminGetFeedbacks()
      .then(data => setFeedbacks(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (fb) => {
    if (!window.confirm(`Remove feedback from ${fb.userName}? It will be removed from the homepage.`)) return
    setDeletingId(fb.id)
    try {
      await adminDeleteFeedback(fb.id)
      setFeedbacks(prev => prev.filter(f => f.id !== fb.id))
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3A3060] mb-2">Moderation</p>
          <h1 className="text-[36px] font-black text-white leading-none tracking-tight">User Feedback</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#5A4F7A]">{feedbacks.length} total</span>
          <button onClick={load} className="text-[#3A3060] hover:text-violet-400 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw size={20} className="text-violet-400 animate-spin" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare size={36} className="text-[#2A2050] mb-4" />
          <p className="text-[#4A3F6A] text-[15px] font-medium">No feedback yet</p>
          <p className="text-[#3A3060] text-[13px] mt-1">Feedback will appear here once users submit it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {feedbacks.map((fb, i) => {
            const [from, to] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
            return (
              <div key={fb.id}
                className="bg-white/[0.03] border border-violet-500/15 rounded-2xl p-6 flex flex-col gap-4 hover:border-violet-500/25 transition-colors">

                {/* Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={13}
                        fill={n <= fb.rating ? '#f59e0b' : 'transparent'}
                        stroke={n <= fb.rating ? '#f59e0b' : '#4A3F6A'}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(fb)}
                    disabled={deletingId === fb.id}
                    className="p-1.5 rounded-lg text-[#4A3F6A] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Remove feedback"
                  >
                    {deletingId === fb.id
                      ? <RefreshCw size={13} className="animate-spin" />
                      : <Trash2 size={13} />}
                  </button>
                </div>

                {/* Message */}
                <p className="text-[14px] text-[#C4B5D9] leading-relaxed flex-1 italic">
                  &ldquo;{fb.message}&rdquo;
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                      {fb.userName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <p className="text-[13px] font-semibold text-white">{fb.userName}</p>
                  </div>
                  <p className="text-[11px] text-[#4A3F6A]">
                    {fb.createdAt ? fmtDate(fb.createdAt) : '—'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
