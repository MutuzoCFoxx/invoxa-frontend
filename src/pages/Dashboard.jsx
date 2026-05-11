import { useEffect, useState } from 'react'
import { DollarSign, FileText, Users, Clock, Plus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const symbol = symbols[currency] || currency + ' '
  const num = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${symbol}${num}`
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/dashboard/metrics'), api.get('/invoices')])
      .then(([m, i]) => {
        setMetrics(m.data.data)
        setInvoices(i.data.data.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  // Use the most common currency from invoices, default to RWF
  const mainCurrency = invoices[0]?.currency || 'RWF'

  const cards = [
    { label: 'Total revenue', value: formatCurrency(metrics?.total_revenue || 0, mainCurrency), icon: DollarSign },
    { label: 'Outstanding', value: formatCurrency(metrics?.total_outstanding || 0, mainCurrency), icon: Clock },
    { label: 'Invoices', value: metrics?.total_invoices || 0, icon: FileText },
    { label: 'Customers', value: metrics?.total_customers || 0, icon: Users },
  ]

  if (loading) return <div className="text-center py-12 text-muted">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted mt-1">Here's what's happening with your business</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="card">
            <card.icon className="w-5 h-5 text-muted mb-3" />
            <p className="text-sm text-muted">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent invoices</h2>
          <Link to="/invoices" className="text-sm text-ink font-medium hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted mb-4">No invoices yet. Create your first one!</p>
            <Link to="/invoices/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Create Invoice
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {invoices.slice(0, 5).map(inv => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-3 hover:bg-tint rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-tint rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-ink" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted">{inv.customer?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(inv.total_amount, inv.currency)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full status-${inv.status}`}>{inv.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
