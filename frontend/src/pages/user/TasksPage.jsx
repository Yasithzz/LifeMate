import { useEffect, useState } from 'react'
import { Plus, CheckCircle2, Circle, Trash2, Clock, Flag, Tag, X, Edit2, Loader2 } from 'lucide-react'
import UserLayout from '../../components/UserLayout'
import { getTasks, createTask, updateTask, completeTask, deleteTask } from '../../lib/api'

const PRIORITIES = ['Low', 'Medium', 'High']
const CATEGORIES = ['Work', 'Health', 'Personal', 'Study', 'Exercise', 'Other']
const TABS = ['All', 'Pending', 'In Progress', 'Completed']
const priorityStyle = {
  High: 'text-red-400 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}
const inputCls = 'bg-white/5 border border-violet-500/20 rounded-xl px-4 py-2.5 text-[14px] text-[#E2D9F3] placeholder-[#6B5E8A] outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 w-full'
const blank = { title: '', category: 'Work', priority: 'Medium', status: 'Pending', deadline: '', durationMinutes: '' }

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getTasks().then(t => setTasks(t ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t => tab === 'All' || t.status === tab)
  const counts = {
    All: tasks.length,
    Pending: tasks.filter(t => t.status === 'Pending').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Completed: tasks.filter(t => t.status === 'Completed').length,
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null }
      if (editId) {
        const updated = await updateTask(editId, payload)
        setTasks(ts => ts.map(t => t.id === editId ? updated : t))
      } else {
        const created = await createTask(payload)
        setTasks(ts => [created, ...ts])
      }
      setForm(blank); setEditId(null); setShowForm(false)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const toggle = async (task) => {
    if (task.status === 'Completed') {
      try {
        const updated = await updateTask(task.id, { ...task, status: 'Pending', durationMinutes: task.durationMinutes })
        setTasks(ts => ts.map(t => t.id === task.id ? updated : t))
      } catch { /* ignore */ }
    } else {
      try {
        const updated = await completeTask(task.id)
        setTasks(ts => ts.map(t => t.id === task.id ? updated : t))
      } catch { /* ignore */ }
    }
  }

  const remove = async (id) => {
    try { await deleteTask(id); setTasks(ts => ts.filter(t => t.id !== id)) } catch { /* ignore */ }
  }

  const startEdit = (task) => {
    setForm({ title: task.title, category: task.category, priority: task.priority, status: task.status, deadline: task.deadline ?? '', durationMinutes: task.durationMinutes ?? '' })
    setEditId(task.id); setShowForm(true)
  }

  return (
    <UserLayout>
      <div className="max-w-3xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-extrabold text-white tracking-tight">Tasks</h1>
            <p className="text-[#7B6A9A] text-sm mt-1">{tasks.length} total · {counts.Pending} pending · {counts.Completed} completed</p>
          </div>
          <button onClick={() => { setForm(blank); setEditId(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold px-4 py-2.5 rounded-xl text-[14px] shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200">
            <Plus size={16} /> New Task
          </button>
        </div>

        {showForm && (
          <div className="mb-6 bg-[#0F0828]/80 border border-violet-500/25 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-white">{editId ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-[#7B6A9A] hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input className={inputCls} placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select className={inputCls + ' cursor-pointer'} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className={inputCls + ' cursor-pointer'} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p}>{p} Priority</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#7B6A9A] font-semibold block mb-1.5">Deadline</label>
                  <input type="date" className={inputCls} value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-[#7B6A9A] font-semibold block mb-1.5">Duration (mins)</label>
                  <input type="number" className={inputCls} placeholder="e.g. 30" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
                </div>
              </div>
              {editId && (
                <select className={inputCls + ' cursor-pointer'} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['Pending', 'In Progress', 'Completed'].map(s => <option key={s}>{s}</option>)}
                </select>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2.5 rounded-xl text-[14px] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />} {editId ? 'Save Changes' : 'Add Task'}
                </button>
                <button onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2.5 rounded-xl border border-violet-500/20 text-[#9F8BC7] hover:bg-white/5 text-[14px]">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${tab === t ? 'bg-violet-600/30 text-violet-300' : 'text-[#7B6A9A] hover:text-violet-300'}`}>
              {t} {counts[t] > 0 && <span className="ml-1 text-[11px] opacity-70">{counts[t]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-violet-500/10 rounded-2xl">
            <CheckCircle2 size={36} className="text-[#4A3F6A] mx-auto mb-3" />
            <p className="text-[#7B6A9A]">No {tab.toLowerCase()} tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => (
              <div key={task.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group hover:border-violet-500/25 ${task.status === 'Completed' ? 'bg-white/3 border-violet-500/8 opacity-60' : 'bg-white/5 border-violet-500/12'}`}>
                <button onClick={() => toggle(task)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
                  {task.status === 'Completed' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} className="text-[#4A3F6A] hover:text-violet-400 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-semibold ${task.status === 'Completed' ? 'text-[#7B6A9A] line-through' : 'text-white'}`}>{task.title}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-[#7B6A9A]"><Tag size={11} />{task.category}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${priorityStyle[task.priority]}`}><Flag size={10} className="inline mr-0.5" />{task.priority}</span>
                    {task.deadline && <span className="flex items-center gap-1 text-[11px] text-[#7B6A9A]"><Clock size={11} />{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    {task.durationMinutes && <span className="text-[11px] text-[#7B6A9A]">{task.durationMinutes}m</span>}
                    {task.status === 'In Progress' && <span className="text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">In Progress</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(task)} className="p-1.5 text-[#7B6A9A] hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => remove(task.id)} className="p-1.5 text-[#7B6A9A] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
