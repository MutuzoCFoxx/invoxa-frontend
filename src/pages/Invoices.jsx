import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import api from '../services/api'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/invoices').then(res => setInvoices(res.data.data.data || [])).finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(i => 
    i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    i.customer?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted mt-1">Manage all your invoices</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by number or customer..." className="input pl-10" />
        </div>

        {loading ? <p className="text-center py-12 text-muted">Loading...</p> :
        filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line">
                  <th className="py-3 px-2 font-medium">Number</th>
                  <th className="py-3 px-2 font-medium">Customer</th>
                  <th className="py-3 px-2 font-medium">Amount</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-2 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-line hover:bg-tint transition">
                    <td className="py-4 px-2"><Link to={`/invoices/${inv.id}`} className="font-medium hover:underline">{inv.invoice_number}</Link></td>
                    <td className="py-4 px-2 text-sm">{inv.customer?.name}</td>
                    <td className="py-4 px-2 font-bold">${inv.total_amount}</td>
                    <td className="py-4 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full status-${inv.status}`}>{inv.status}</span>
                    </td>
                    <td className="py-4 px-2 text-sm text-muted">{new Date(inv.due_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
