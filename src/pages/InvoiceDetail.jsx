import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Share2, Plus, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import ShareMenu from '../components/ShareMenu'
import DocumentCard from '../components/DocumentCard'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mtn_momo',      label: 'MTN MoMo' },
  { value: 'airtel_money',  label: 'Airtel Money' },
  { value: 'other',         label: 'Other' },
]

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice]     = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [payments, setPayments]   = useState([])
  const [showShare, setShowShare]   = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '', payment_date: new Date().toISOString().split('T')[0],
    method: 'cash', reference: '', notes: '',
  })

  const load = async () => {
    const [inv, ws, pmt] = await Promise.all([
      api.get(`/invoices/${id}`),
      api.get('/workspace'),
      api.get(`/invoices/${id}/payments`),
    ])
    setInvoice(inv.data.data)
    setWorkspace(ws.data.data)
    setPayments(pmt.data.data || [])
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return
    await api.delete(`/invoices/${id}`)
    toast.success('Invoice deleted')
    navigate('/invoices')
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()
    setSavingPayment(true)
    try {
      await api.post(`/invoices/${id}/payments`, paymentForm)
      toast.success('Payment recorded')
      setShowPayment(false)
      setPaymentForm({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'cash', reference: '', notes: '' })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally { setSavingPayment(false) }
  }

  const handleRemovePayment = async (paymentId) => {
    if (!confirm('Remove this payment?')) return
    try {
      await api.delete(`/invoices/${id}/payments/${paymentId}`)
      toast.success('Payment removed')
      await load()
    } catch { toast.error('Failed to remove payment') }
  }

  if (!invoice) return <div className="text-center py-12 text-muted">Loading...</div>

  const curr       = invoice.currency || 'RWF'
  const balanceDue = Math.max(0, Number(invoice.total_amount) - Number(invoice.amount_paid || 0))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to invoices
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Invoice details</h1>
        <div className="flex gap-2 flex-wrap">
          {invoice.status !== 'paid' && (
            <button onClick={() => setShowPayment(true)}
              className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
              <CheckCircle2 className="w-4 h-4" /> Record Payment
            </button>
          )}
          <button onClick={() => setShowShare(true)} className="btn-primary text-sm">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Document */}
      <DocumentCard doc={invoice} type="invoice" workspace={workspace} />

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Payment History</h2>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-green-800">{fmt(p.amount, curr)}</p>
                  <p className="text-xs text-green-600">
                    {new Date(p.payment_date).toLocaleDateString()} · {PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method}
                  </p>
                  {p.reference && <p className="text-xs text-muted">Ref: {p.reference}</p>}
                </div>
                <button onClick={() => handleRemovePayment(p.id)} className="text-muted hover:text-red-500 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleDelete}
          className="flex items-center gap-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition">
          <Trash2 className="w-4 h-4" /> Delete invoice
        </button>
      </div>

      {showShare && <ShareMenu document={invoice} type="invoice" onClose={() => setShowShare(false)} onSent={load} />}

      {/* Record Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowPayment(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-line" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Record Payment</h2>
              <button onClick={() => setShowPayment(false)}><X className="w-5 h-5 text-muted" /></button>
            </div>
            <p className="text-sm text-muted mb-4">Balance due: <span className="font-bold text-ink">{fmt(balanceDue, curr)}</span></p>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount *</label>
                <input type="number" step="0.01" min="0.01" max={balanceDue}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="input" placeholder="0.00" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Payment Date *</label>
                <input type="date" value={paymentForm.payment_date}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Method *</label>
                <select value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="input">
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Reference (optional)</label>
                <input type="text" value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="input" placeholder="Transaction ID, receipt no..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowPayment(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={savingPayment} className="btn-primary">
                  {savingPayment ? 'Saving...' : <><Plus className="w-4 h-4" /> Record</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
