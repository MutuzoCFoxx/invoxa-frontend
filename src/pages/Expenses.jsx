import { useEffect, useState } from 'react'
import { Plus, X, Edit2, Trash2, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const CATEGORIES = [
  'general', 'office', 'travel', 'meals', 'utilities',
  'software', 'marketing', 'salaries', 'rent', 'equipment', 'other',
]

const CURRENCIES = ['RWF', 'USD', 'EUR', 'GBP']

const BLANK_FORM = {
  title: '', category: 'general', amount: '', currency: 'RWF',
  expense_date: new Date().toISOString().split('T')[0],
  description: '', vendor: '', receipt_url: '',
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const load = async (params = {}) => {
    setLoading(true)
    try {
      const res = await api.get('/expenses', {
        params: { search, category: filterCategory, page, ...params },
      })
      setExpenses(res.data.data.data || [])
      setLastPage(res.data.data.last_page || 1)
      setTotalAmount(res.data.meta?.total_amount || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, filterCategory, page])

  const openCreate = () => { setEditing(null); setForm(BLANK_FORM); setShowModal(true) }
  const openEdit = (exp) => {
    setEditing(exp)
    setForm({
      title: exp.title, category: exp.category, amount: exp.amount,
      currency: exp.currency, expense_date: exp.expense_date?.split('T')[0] || exp.expense_date,
      description: exp.description || '', vendor: exp.vendor || '', receipt_url: exp.receipt_url || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/expenses/${editing.id}`, form)
        toast.success('Expense updated')
      } else {
        await api.post('/expenses', form)
        toast.success('Expense recorded')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}`)
    toast.success('Expense deleted')
    load()
  }

  const catColor = (cat) => {
    const colors = {
      office: 'bg-blue-50 text-blue-700', travel: 'bg-purple-50 text-purple-700',
      meals: 'bg-orange-50 text-orange-700', utilities: 'bg-yellow-50 text-yellow-700',
      software: 'bg-cyan-50 text-cyan-700', marketing: 'bg-pink-50 text-pink-700',
      salaries: 'bg-indigo-50 text-indigo-700', rent: 'bg-teal-50 text-teal-700',
      equipment: 'bg-gray-100 text-gray-700', other: 'bg-red-50 text-red-700',
    }
    return colors[cat] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted mt-1">Track your business expenses</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary card */}
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
          <span className="text-red-600 font-bold text-lg">↓</span>
        </div>
        <div>
          <p className="text-sm text-muted">Total Expenses</p>
          <p className="text-2xl font-bold">{fmt(totalAmount, 'RWF')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9" placeholder="Search expenses..." />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
            className="input pl-9 pr-8">
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-muted mb-4">No expenses yet. Start tracking your costs!</p>
            <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Expense</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-tint">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Title</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Category</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Date</th>
                    <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Amount</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-tint/50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{exp.title}</p>
                        {exp.description && <p className="text-xs text-muted truncate max-w-xs">{exp.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColor(exp.category)}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{exp.vendor || '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {new Date(exp.expense_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-sm">{fmt(exp.amount, exp.currency)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(exp)} className="p-1.5 hover:bg-gray-100 rounded-md text-muted hover:text-ink">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(exp.id)} className="p-1.5 hover:bg-red-50 rounded-md text-muted hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-line">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">← Prev</button>
                <span className="text-sm text-muted">Page {page} of {lastPage}</span>
                <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-line max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input" placeholder="e.g. Office supplies" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date *</label>
                  <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })}
                    className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amount *</label>
                  <input type="number" step="0.01" min="0" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="input" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Vendor</label>
                <input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                  className="input" placeholder="Supplier or vendor name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input" rows="3" placeholder="Additional details..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Receipt URL (optional)</label>
                <input type="url" value={form.receipt_url} onChange={e => setForm({ ...form, receipt_url: e.target.value })}
                  className="input" placeholder="https://..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
