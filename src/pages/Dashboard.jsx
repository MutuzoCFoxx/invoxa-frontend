import { useEffect, useState } from 'react'
import { DollarSign, FileText, Users, Clock, Plus, ArrowRight, TrendingUp, AlertCircle, Receipt, FileCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'
import ReferralWidget from '../components/ReferralWidget'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const n = Number(amount || 0)
  if (n >= 1_000_000) return `${sym[currency] || currency + ' '}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${sym[currency] || currency + ' '}${(n / 1_000).toFixed(0)}K`
  return `${sym[currency] || currency + ' '}${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const STATUS_PIE_COLORS = {
  draft: '#9ca3af',
  sent: '#3b82f6',
  paid: '#10b981',
  overdue: '#ef4444',
  partially_paid: '#f59e0b',
}

const MONTH_ABBR = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }

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

  const currency = 'RWF'

  const chartData = (metrics?.monthly_revenue || []).map(r => ({
    month: MONTH_ABBR[r.month?.split('-')[1]] || r.month,
    revenue: r.revenue,
  }))

  const pieData = Object.entries(metrics?.status_breakdown || {})
    .map(([status, count]) => ({ name: status.replace('_', ' '), value: count, color: STATUS_PIE_COLORS[status] || '#9ca3af' }))
    .filter(d => d.value > 0)

  const kpis = [
    { label: 'Total Revenue', value: fmt(metrics?.total_revenue, currency), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Outstanding', value: fmt(metrics?.total_outstanding, currency), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Expenses', value: fmt(metrics?.total_expenses, currency), icon: Receipt, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Invoices', value: metrics?.total_invoices ?? 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Quotations', value: metrics?.total_quotations ?? 0, icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Customers', value: metrics?.total_customers ?? 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Overdue', value: metrics?.overdue_count ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pending Quotes', value: metrics?.pending_quotations ?? 0, icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted mt-1">Here's what's happening with your business</p>
        </div>
        <div className="flex gap-2">
          <Link to="/quotations/new" className="btn-secondary text-sm"><Plus className="w-4 h-4" /> New Quote</Link>
          <Link to="/invoices/new" className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Invoice</Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card">
            <div className={`w-9 h-9 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-xs text-muted font-medium">{kpi.label}</p>
            <p className="text-2xl font-bold mt-0.5">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Revenue Trend (last 6 months)</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted text-sm">No paid invoices yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, currency)} width={70} />
                <Tooltip formatter={(v) => [fmt(v, currency), 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 3, fill: '#111' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Invoice status pie */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Invoice Status</h2>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted text-sm">No invoices yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Referral widget */}
      <ReferralWidget />

      {/* Overdue alert */}
      {(metrics?.overdue_count || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            You have <strong>{metrics.overdue_count}</strong> overdue {metrics.overdue_count === 1 ? 'invoice' : 'invoices'} that need attention.
          </p>
          <Link to="/invoices" className="ml-auto text-sm font-medium text-red-700 hover:underline whitespace-nowrap">View →</Link>
        </div>
      )}

      {/* Recent invoices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Invoices</h2>
          <Link to="/invoices" className="text-sm text-ink font-medium hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted mb-4">No invoices yet. Create your first one!</p>
            <Link to="/invoices/new" className="btn-primary"><Plus className="w-4 h-4" /> Create Invoice</Link>
          </div>
        ) : (
          <div className="space-y-1">
            {invoices.slice(0, 6).map(inv => (
              <Link key={inv.id} to={`/invoices/${inv.id}`}
                className="flex items-center justify-between p-3 hover:bg-tint rounded-lg transition">
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
                  <p className="font-bold text-sm">{fmt(inv.total_amount, inv.currency)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full status-${inv.status}`}>{inv.status?.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
