import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText, Filter } from 'lucide-react'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_OPTIONS = ['', 'draft', 'sent', 'accepted', 'rejected', 'expired']

const STATUS_COLORS = {
  draft:    'bg-gray-100 text-gray-700',
  sent:     'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  expired:  'bg-yellow-50 text-yellow-700',
}

export default function Quotations() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/quotations', { params: { search, status, page } })
      const d = res.data.data
      setQuotations(d.data || [])
      setLastPage(d.last_page || 1)
      setTotal(d.total || 0)
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted mt-1">{total} quotation{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/quotations/new" className="btn-primary"><Plus className="w-4 h-4" /> New Quotation</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by number or customer..." className="input pl-9" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input pl-9 pr-8">
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted mb-4">{search || status ? 'No quotations match your filters' : 'No quotations yet'}</p>
            {!search && !status && <Link to="/quotations/new" className="btn-primary"><Plus className="w-4 h-4" /> Create Quotation</Link>}
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
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-wide text-muted font-medium">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {quotations.map(q => (
                    <tr key={q.id} className="hover:bg-tint/50 transition">
                      <td className="py-4 px-4">
                        <Link to={`/quotations/${q.id}`} className="font-medium text-sm hover:underline font-mono">{q.quotation_number}</Link>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium">{q.customer?.name}</p>
                        {q.customer?.company_name && <p className="text-xs text-muted">{q.customer.company_name}</p>}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-sm">{fmt(q.total_amount, q.currency)}</td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-700'}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">
                        {q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
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
