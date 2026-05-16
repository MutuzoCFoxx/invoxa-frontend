import { useState, useEffect } from 'react'
import { BarChart2, DollarSign, Users, Package, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const n = Number(amount || 0)
  if (n >= 1_000_000) return `${sym[currency] || ''}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${sym[currency] || ''}${(n / 1_000).toFixed(1)}K`
  return `${sym[currency] || currency + ' '}${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const EXPENSE_COLORS = {
  rent: '#6366f1', utilities: '#f59e0b', salaries: '#10b981',
  marketing: '#ec4899', travel: '#3b82f6', supplies: '#8b5cf6',
  equipment: '#14b8a6', software: '#f97316', other: '#94a3b8',
}

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('RWF')

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/reports'),
      api.get('/workspace'),
    ]).then(([reportsRes, wsRes]) => {
      setData(reportsRes.data.data)
      setCurrency(wsRes.data.data.currency || 'RWF')
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    )
  }

  if (!data) return null

  const { revenue, top_clients, top_items, expenses_by_category, total_expenses } = data

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted mt-1">Overview of your business performance</p>
      </div>

      {/* Revenue overview */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total paid" value={fmt(revenue.total_paid, currency)} icon={TrendingUp} color="green" />
          <StatCard label="This month" value={fmt(revenue.this_month, currency)} icon={BarChart2} color="blue" />
          <StatCard label="This year" value={fmt(revenue.this_year, currency)} icon={BarChart2} color="indigo" />
          <StatCard label="Outstanding" value={fmt(revenue.outstanding, currency)} icon={AlertCircle} color="amber" />
        </div>

        {revenue.overdue > 0 && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <TrendingDown className="w-4 h-4 flex-shrink-0" />
            <span><strong>{fmt(revenue.overdue, currency)}</strong> is overdue and needs follow-up</span>
          </div>
        )}
      </section>

      {/* Paid vs Outstanding visual bar */}
      <section>
        <h2 className="text-lg font-bold mb-4">Paid vs Outstanding</h2>
        <div className="card">
          {(() => {
            const total = (revenue.total_paid || 0) + (revenue.outstanding || 0)
            const paidPct = total > 0 ? (revenue.total_paid / total) * 100 : 0
            const outPct = 100 - paidPct
            return (
              <div className="space-y-3">
                <div className="flex rounded-full overflow-hidden h-6" style={{ backgroundColor: '#f1f5f9' }}>
                  {paidPct > 0 && (
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${paidPct}%` }} title={`Paid: ${paidPct.toFixed(0)}%`} />
                  )}
                  {outPct > 0 && (
                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${outPct}%` }} title={`Outstanding: ${outPct.toFixed(0)}%`} />
                  )}
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-muted">Paid <strong className="text-ink">{paidPct.toFixed(0)}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-muted">Outstanding <strong className="text-ink">{outPct.toFixed(0)}%</strong></span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* Top clients */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Top Clients</h2>
        {top_clients.length === 0 ? (
          <div className="card text-center text-muted py-8">No paid invoices yet</div>
        ) : (
          <div className="card divide-y divide-line">
            {top_clients.map((client, idx) => {
              const maxRevenue = top_clients[0]?.total || 1
              const pct = (client.total / maxRevenue) * 100
              return (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted w-5">#{idx + 1}</span>
                      <span className="font-medium text-sm">{client.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">{fmt(client.total, currency)}</span>
                      <span className="text-xs text-muted ml-2">{client.count} inv.</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Top items */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Top Items / Services</h2>
        {top_items.length === 0 ? (
          <div className="card text-center text-muted py-8">No paid invoice items yet</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-line">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Item / Service</th>
                  <th className="pb-3 font-medium text-right">Units sold</th>
                  <th className="pb-3 font-medium text-right">Invoiced</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {top_items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-tint/50 transition">
                    <td className="py-3 text-muted font-bold">#{idx + 1}</td>
                    <td className="py-3 font-medium max-w-xs truncate">{item.description}</td>
                    <td className="py-3 text-right text-muted">{Number(item.units_sold).toLocaleString()}</td>
                    <td className="py-3 text-right text-muted">{item.invoice_count}</td>
                    <td className="py-3 text-right font-bold">{fmt(item.revenue, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Expenses by category */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5" /> Expenses by Category
          <span className="ml-auto text-sm font-normal text-muted">Total: {fmt(total_expenses, currency)}</span>
        </h2>
        {expenses_by_category.length === 0 ? (
          <div className="card text-center text-muted py-8">No expenses recorded yet</div>
        ) : (
          <div className="card divide-y divide-line">
            {expenses_by_category.map((cat, idx) => {
              const pct = total_expenses > 0 ? (cat.total / total_expenses) * 100 : 0
              const color = EXPENSE_COLORS[cat.category] || '#94a3b8'
              return (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium text-sm capitalize">{cat.category}</span>
                      <span className="text-xs text-muted">({cat.count} entries)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">{pct.toFixed(1)}%</span>
                      <span className="font-bold text-sm">{fmt(cat.total, currency)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100' },
    indigo: { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  border: 'border-indigo-100' },
    amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100' },
    red:    { bg: 'bg-red-50',     icon: 'text-red-600',     border: 'border-red-100' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`card border ${c.border} space-y-2`}>
      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
