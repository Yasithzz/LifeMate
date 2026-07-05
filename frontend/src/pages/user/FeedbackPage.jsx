import { useEffect, useState } from 'react'
import { Star, Send, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getMyFeedback, submitFeedback, deleteMyFeedback } from '../../lib/api'

const MAX_CHARS = 500

export default function FeedbackPage() {
  const [existing, setExisting]   = useState(null)   // their saved feedback or null
  const [rating, setRating]       = useState(5)
  const [hover, setHover]         = useState(0)
  const [message, setMessage]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    getMyFeedback()
      .then(d => {
        if (d && d.id) {
          setExisting(d)
          setRating(d.rating)
          setMessage(d.message)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (message.trim().length < 10) { setError('Please write at least 10 characters.'); return }
    setSaving(true); setError('')
    try {
      const saved = await submitFeedback(message.trim(), rating)
      setExisting(saved)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Remove your feedback from the site?')) return
    setDeleting(true)
    try {
      await deleteMyFeedback()
      setExisting(null)
      setRating(5)
      setMessage('')
    } catch {
      setError('Could not delete feedback.')
    } finally {
      setDeleting(false)
    }
  }

  const activeRating = hover || rating

  return (
    <UserLayout>
      <div className="max-w-xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F6A] mb-2">Your Voice</p>
          <h1 className="text-[32px] font-black text-white leading-none tracking-tight mb-1">Share Feedback</h1>
          <p className="text-[#7B6A9A] text-[14px]">
            Your experience matters. Feedback you submit will appear on the LifeMate home page.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw size={20} className="text-violet-400 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Existing badge */}
            {existing && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-medium">
                  <CheckCircle size={14} />
                  Your feedback is live on the homepage
                </div>
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="text-[#5A4F7A] hover:text-red-400 transition-colors p-1">
                  {deleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            )}

            {/* Star rating */}
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] mb-3">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={32}
                      className="transition-colors duration-100"
                      fill={n <= activeRating ? '#f59e0b' : 'transparent'}
                      stroke={n <= activeRating ? '#f59e0b' : '#4A3F6A'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-[13px] text-[#7B6A9A] self-center">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][activeRating]}
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-widest text-[#7B6A9A] block mb-2">
                Your experience
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Tell us what you love about LifeMate, what helped you most, or what we can improve…"
                className="w-full bg-white/5 border border-violet-500/20 rounded-xl px-4 py-3 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 resize-none"
              />
              <p className="text-[11px] text-[#4A3F6A] mt-1 text-right">{message.length}/{MAX_CHARS}</p>
            </div>

            {/* Error / success */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[13px] bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-[13px] bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <CheckCircle size={14} /> {existing ? 'Feedback updated!' : 'Feedback submitted — thank you!'}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || message.trim().length < 10}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
              {existing ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          </form>
        )}


      </div>
    </UserLayout>
  )
}
