import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Quotations() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/quotations').then(res => setQuotations(res.data.data.data || [])).finally(() => setLoading(false))
  }, [])

  const filtered = quotations.filter(q =>
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    q.customer?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted mt-1">Create and manage quotations</p>
        </div>
        <Link to="/quotations/new" className="btn-primary"><Plus className="w-4 h-4" /> New Quotation</Link>
      </div>
      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotations..." className="input pl-10" />
        </div>
        {loading ? <p className="text-center py-12 text-muted">Loading...</p> :
        filtered.length === 0 ? (
          <div className="text-center py-12"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-muted">No quotations found</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line">
              <th className="py-3 px-2 font-medium">Number</th><th className="py-3 px-2 font-medium">Customer</th>
              <th className="py-3 px-2 font-medium">Amount</th><th className="py-3 px-2 font-medium">Status</th>
              <th className="py-3 px-2 font-medium">Valid Until</th>
            </tr></thead>
            <tbody>{filtered.map(q => (
              <tr key={q.id} className="border-b border-line hover:bg-tint transition">
                <td className="py-4 px-2"><Link to={`/quotations/${q.id}`} className="font-medium hover:underline">{q.quotation_number}</Link></td>
                <td className="py-4 px-2 text-sm">{q.customer?.name}</td>
                <td className="py-4 px-2 font-bold">{fmt(q.total_amount, q.currency)}</td>
                <td className="py-4 px-2"><span className={`text-xs px-2 py-1 rounded-full ${
                  q.status === 'accepted' ? 'bg-green-50 text-green-700' : q.status === 'sent' ? 'bg-blue-50 text-blue-700' :
                  q.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                }`}>{q.status}</span></td>
                <td className="py-4 px-2 text-sm text-muted">{new Date(q.valid_until).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
