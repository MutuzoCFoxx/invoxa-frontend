import { useEffect, useState } from 'react'
import { Users, DollarSign, FileText, TrendingUp, Mail, Send, Shield } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [sending, setSending] = useState(null)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required')
      navigate('/dashboard')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, subsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/subscribers' + (filter ? `?plan=${filter}` : ''))
      ])
      setStats(statsRes.data.data)
      setSubscribers(subsRes.data.data)
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (user?.role === 'admin') loadData() }, [filter])

  const sendBilling = async (workspaceId) => {
    setSending(workspaceId)
    try {
      const res = await api.post(`/admin/billing/send/${workspaceId}`)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send')
    } finally { setSending(null) }
  }

  const sendBillingToAll = async () => {
    if (!confirm('Send billing invoices to ALL Pro and Business subscribers?')) return
    setSending('all')
    try {
      const res = await api.post('/admin/billing/send-all')
      toast.success(res.data.message)
    } catch (err) {
      toast.error('Failed to send batch')
    } finally { setSending(null) }
  }

  if (loading || !stats) return <div className="text-center py-12 text-muted">Loading admin dashboard...</div>

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: Users },
    { label: 'Free', value: stats.free_subscribers, icon: FileText },
    { label: 'Pro', value: stats.pro_subscribers, icon: TrendingUp },
    { label: 'Business', value: stats.business_subscribers, icon: Shield },
    { label: 'Total Invoices', value: stats.total_invoices, icon: FileText },
    { label: 'MRR (RWF)', value: stats.monthly_revenue.toLocaleString(), icon: DollarSign },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-tint border border-line px-2 py-1 rounded-full text-xs font-medium mb-2">
            <Shield className="w-3 h-3" /> Admin Only
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted mt-1">Manage subscribers and billing</p>
        </div>
        <button onClick={sendBillingToAll} disabled={sending === 'all'} className="btn-primary">
          <Send className="w-4 h-4" />
          {sending === 'all' ? 'Sending...' : 'Bill All Paying Users'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {cards.map(card => (
          <div key={card.label} className="card p-4">
            <card.icon className="w-4 h-4 text-muted mb-2" />
            <p className="text-xs text-muted">{card.label}</p>
            <p className="text-xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Subscribers</h2>
          <div className="flex gap-2">
            {['', 'free', 'pro', 'business'].map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`text-xs px-3 py-1 rounded-full ${filter === p ? 'bg-ink text-white' : 'bg-tint border border-line'}`}
              >
                {p || 'All'}
              </button>
            ))}
          </div>
        </div>
        
        {subscribers.length === 0 ? (
          <p className="text-center py-8 text-muted">No subscribers found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line">
                  <th className="py-3 px-2 font-medium">Workspace</th>
                  <th className="py-3 px-2 font-medium">Owner</th>
                  <th className="py-3 px-2 font-medium">Email</th>
                  <th className="py-3 px-2 font-medium">Plan</th>
                  <th className="py-3 px-2 font-medium">Joined</th>
                  <th className="py-3 px-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.id} className="border-b border-line hover:bg-tint">
                    <td className="py-3 px-2 font-medium">{sub.workspace_name}</td>
                    <td className="py-3 px-2">{sub.owner_name}</td>
                    <td className="py-3 px-2 text-xs">{sub.owner_email}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sub.plan === 'pro' ? 'bg-blue-50 text-blue-700' :
                        sub.plan === 'business' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>{sub.plan}</span>
                    </td>
                    <td className="py-3 px-2 text-xs text-muted">{new Date(sub.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-2 text-right">
                      {sub.plan !== 'free' && (
                        <button 
                          onClick={() => sendBilling(sub.id)} 
                          disabled={sending === sub.id}
                          className="text-xs px-3 py-1 bg-ink text-white rounded-full hover:bg-gray-800 disabled:opacity-50"
                        >
                          <Mail className="w-3 h-3 inline mr-1" />
                          {sending === sub.id ? 'Sending...' : 'Send Bill'}
                        </button>
                      )}
                    </td>
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
