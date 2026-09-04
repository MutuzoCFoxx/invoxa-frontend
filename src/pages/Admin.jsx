import { useState, useEffect } from 'react'
import { Users, TrendingUp, ShieldOff, Shield, Crown, Zap, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const PLAN_COLORS = {
  free:     'bg-gray-100 text-gray-700',
  pro:      'bg-blue-50 text-blue-700',
  business: 'bg-purple-50 text-purple-700',
}

const PLAN_ICONS = { free: null, pro: Zap, business: Crown }

export default function Admin() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [meta, setMeta]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [billingFilter, setBillingFilter] = useState('')
  const [page, setPage]     = useState(1)
  const [actionLoading, setActionLoading] = useState(null)

  const loadStats = () =>
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {})

  const loadUsers = () => {
    setLoading(true)
    api.get('/admin/users', { params: { search, plan: planFilter, status: statusFilter, billing: billingFilter, page } })
      .then(r => {
        setUsers(r.data.data.data || [])
        setMeta(r.data.data)
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadStats() }, [])
  useEffect(() => { loadUsers() }, [search, planFilter, statusFilter, billingFilter, page])

  const handlePlan = async (user, plan) => {
    setActionLoading(`plan-${user.id}`)
    try {
      await api.put(`/admin/users/${user.id}/plan`, { plan })
      toast.success(`${user.name} → ${plan}`)
      loadUsers()
    } catch { toast.error('Failed to update plan') }
    finally { setActionLoading(null) }
  }

  const handleToggle = async (user) => {
    setActionLoading(`toggle-${user.id}`)
    try {
      await api.post(`/admin/users/${user.id}/toggle-active`)
      toast.success(user.is_active ? 'User deactivated' : 'User activated')
      loadUsers()
    } catch { toast.error('Failed to update status') }
    finally { setActionLoading(null) }
  }

  const fmt = n => Number(n || 0).toLocaleString()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
        <p className="text-muted mt-1">Manage users, plans, and platform health</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total users',    value: fmt(stats.total_users),    icon: Users,       color: 'text-blue-600' },
            { label: 'Pro',            value: fmt(stats.pro_users),       icon: Zap,         color: 'text-blue-500' },
            { label: 'Business',       value: fmt(stats.business_users),  icon: Crown,       color: 'text-purple-600' },
            { label: 'MRR (RWF)',      value: fmt(stats.mrr),             icon: TrendingUp,  color: 'text-green-600' },
            { label: 'Overdue',        value: fmt(stats.overdue_users),   icon: AlertTriangle, color: 'text-red-600' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="card flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-gray-50 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              className="input pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="input w-36" value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}>
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
          </select>
          <select className="input w-36" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="input w-36" value={billingFilter} onChange={e => { setBillingFilter(e.target.value); setPage(1) }}>
            <option value="">All billing</option>
            <option value="overdue">Overdue only</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">User</th>
                <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Plan</th>
                <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Renewal Due</th>
                <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Status</th>
                <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Joined</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted">No users found</td></tr>
              ) : users.map(user => {
                const plan = user.workspace?.plan || 'free'
                const PlanIcon = PLAN_ICONS[plan]
                const dueAt = user.workspace?.plan_expires_at
                const isOverdue = plan !== 'free' && dueAt && new Date(dueAt) < new Date()
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3.5">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[plan]}`}>
                        {PlanIcon && <PlanIcon className="w-3 h-3" />}
                        {plan}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {plan === 'free' ? (
                        <span className="text-xs text-muted">—</span>
                      ) : dueAt ? (
                        <div className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted'}`}>
                          {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                          {new Date(dueAt).toLocaleDateString()}
                          {isOverdue && <span className="block">Overdue</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Plan selector */}
                        <select
                          value={plan}
                          disabled={actionLoading === `plan-${user.id}`}
                          onChange={e => handlePlan(user, e.target.value)}
                          className="input text-xs py-1.5 w-28"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="business">Business</option>
                        </select>
                        {/* Activate / Deactivate */}
                        {!user.is_admin && (
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={actionLoading === `toggle-${user.id}`}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                              user.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {user.is_active
                              ? <><ShieldOff className="w-3.5 h-3.5" /> Deactivate</>
                              : <><Shield className="w-3.5 h-3.5" /> Activate</>}
                          </button>
                        )}
                        {user.is_admin && (
                          <span className="text-xs text-purple-600 font-medium px-2">Admin</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
            <p className="text-sm text-muted">
              Showing {meta.from}–{meta.to} of {meta.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === meta.last_page}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
