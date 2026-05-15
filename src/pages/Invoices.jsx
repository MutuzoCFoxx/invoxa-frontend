import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText, Filter } from 'lucide-react'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_OPTIONS = ['', 'draft', 'sent', 'paid', 'overdue', 'partially_paid']

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-50 text-blue-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
  partially_paid: 'bg-yellow-50 text-yellow-700',
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices', { params: { search, status, page } })
      const d = res.data.data
      setInvoices(d.data || [])
      setLastPage(d.last_page || 1)
      setTotal(d.total || 0)
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { load() }, [load])

  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleStatus = (val) => { setStatus(val); setPage(1) }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted mt-1">{total} invoice{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/invoices/new" className="btn-primary"><Plus className="w-4 h-4" /> New Invoice</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search by number or customer..." className="input pl-9" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select value={status} onChange={e => handleStatus(e.target.value)} className="input pl-9 pr-8">
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s ? s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted mb-4">{search || status ? 'No invoices match your filters' : 'No invoices yet'}</p>
            {!search && !status && <Link to="/invoices/new" className="btn-primary"><Plus className="w-4 h-4" /> Create Invoice</Link>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-tint">
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-wide text-muted font-medium">Number</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-wide text-muted font-medium">Customer</th>
                    <th className="py-3 px-4 text-right text-xs uppercase tracking-wide text-muted font-medium">Amount</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-wide text-muted font-medium">Status</th>
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-wide text-muted font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-tint/50 transition">
                      <td className="py-4 px-4">
                        <Link to={`/invoices/${inv.id}`} className="font-medium text-sm hover:underline font-mono">{inv.invoice_number}</Link>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium">{inv.customer?.name}</p>
                        {inv.customer?.company_name && <p className="text-xs text-muted">{inv.customer.company_name}</p>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-sm">{fmt(inv.total_amount, inv.currency)}</p>
                        {Number(inv.amount_paid) > 0 && Number(inv.amount_paid) < Number(inv.total_amount) && (
                          <p className="text-xs text-muted">Paid: {fmt(inv.amount_paid, inv.currency)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-700'}`}>
                          {inv.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
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
    </div>
  )
}
