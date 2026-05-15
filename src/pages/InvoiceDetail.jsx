import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Share2, Plus, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import ShareMenu from '../components/ShareMenu'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-50 text-blue-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
  partially_paid: 'bg-yellow-50 text-yellow-700',
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'other', label: 'Other' },
]

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [payments, setPayments] = useState([])
  const [showShare, setShowShare] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    method: 'cash',
    reference: '',
    notes: '',
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
      const res = await api.post(`/invoices/${id}/payments`, paymentForm)
      toast.success('Payment recorded')
      setShowPayment(false)
      setPaymentForm({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'cash', reference: '', notes: '' })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleRemovePayment = async (paymentId) => {
    if (!confirm('Remove this payment?')) return
    try {
      await api.delete(`/invoices/${id}/payments/${paymentId}`)
      toast.success('Payment removed')
      await load()
    } catch {
      toast.error('Failed to remove payment')
    }
  }

  if (!invoice) return <div className="text-center py-12 text-muted">Loading...</div>
  const curr = invoice.currency || 'RWF'
  const balanceDue = Math.max(0, Number(invoice.total_amount) - Number(invoice.amount_paid || 0))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Invoice details</h1>
        <div className="flex gap-2">
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

      {/* INVOICE DOCUMENT */}
      <div className="card p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 pb-8 border-b-2 border-ink">
          <div className="flex-1">
            {workspace?.logo_url && <img src={workspace.logo_url} alt={workspace.name} className="h-12 mb-3 object-contain" onError={e => e.target.style.display = 'none'} />}
            <h2 className="text-2xl font-bold tracking-tight">{workspace?.name || 'Your Company'}</h2>
            {workspace?.company_address && <p className="text-sm text-muted mt-1 whitespace-pre-wrap">{workspace.company_address}</p>}
            {workspace?.company_email && <p className="text-sm text-muted">{workspace.company_email}</p>}
            {workspace?.company_phone && <p className="text-sm text-muted">{workspace.company_phone}</p>}
            {workspace?.tax_id && <p className="text-sm text-muted">Tax ID: {workspace.tax_id}</p>}
            {workspace?.website && <p className="text-sm text-muted">{workspace.website}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Invoice</p>
            <p className="text-3xl font-bold tracking-tight font-mono">{invoice.invoice_number}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || 'bg-gray-100 text-gray-700'}`}>
              {invoice.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Bill to</p>
            <p className="font-bold text-lg">{invoice.customer?.name}</p>
            {invoice.customer?.company_name && <p className="text-sm">{invoice.customer.company_name}</p>}
            <p className="text-sm text-muted">{invoice.customer?.email}</p>
            {invoice.customer?.phone && <p className="text-sm text-muted">{invoice.customer.phone}</p>}
            {invoice.customer?.billing_address && <p className="text-sm text-muted mt-1 whitespace-pre-wrap">{invoice.customer.billing_address}</p>}
          </div>
          <div className="md:text-right space-y-3">
            <div><p className="text-xs uppercase tracking-widest text-muted">Issue date</p><p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-muted">Due date</p><p className="font-medium">{new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-muted">Currency</p><p className="font-medium">{curr}</p></div>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead><tr className="border-b-2 border-ink">
            <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Description</th>
            <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Qty</th>
            <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Price</th>
            <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Tax</th>
            <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Total</th>
          </tr></thead>
          <tbody>
            {invoice.items?.map(item => (
              <tr key={item.id} className="border-b border-line">
                <td className="py-4 text-sm">{item.description}</td>
                <td className="py-4 text-sm text-right">{item.quantity}</td>
                <td className="py-4 text-sm text-right">{fmt(item.unit_price, curr)}</td>
                <td className="py-4 text-sm text-right">{item.tax_rate}%</td>
                <td className="py-4 text-right font-medium">{fmt(item.line_total, curr)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{fmt(invoice.subtotal, curr)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span>{fmt(invoice.tax_amount, curr)}</span></div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-ink"><span>Total</span><span>{fmt(invoice.total_amount, curr)}</span></div>
            {Number(invoice.amount_paid) > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600"><span>Amount paid</span><span>– {fmt(invoice.amount_paid, curr)}</span></div>
                <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t border-line"><span>Balance due</span><span>{fmt(balanceDue, curr)}</span></div>
              </>
            )}
          </div>
        </div>

        {(workspace?.bank_name || workspace?.bank_account_number) && (
          <div className="bg-tint border border-line rounded-xl p-4 mb-6">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Payment Details</p>
            {workspace.bank_name && <p className="text-sm"><span className="text-muted">Bank:</span> <span className="font-medium">{workspace.bank_name}</span></p>}
            {workspace.bank_account_number && <p className="text-sm"><span className="text-muted">Account:</span> <span className="font-medium font-mono">{workspace.bank_account_number}</span></p>}
            {workspace.bank_account_name && <p className="text-sm"><span className="text-muted">Name:</span> <span className="font-medium">{workspace.bank_account_name}</span></p>}
          </div>
        )}

        {invoice.notes && <div className="border-t border-line pt-6 mb-6"><p className="text-xs uppercase tracking-widest text-muted mb-2">Notes</p><p className="text-sm whitespace-pre-wrap">{invoice.notes}</p></div>}
        {workspace?.invoice_footer && <div className="border-t border-line pt-6 text-center"><p className="text-sm text-muted whitespace-pre-wrap">{workspace.invoice_footer}</p></div>}
      </div>

      {/* PAYMENT HISTORY */}
      {payments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Payment History</h2>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-green-800">{fmt(p.amount, curr)}</p>
                  <p className="text-xs text-green-600">{new Date(p.payment_date).toLocaleDateString()} · {PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method}</p>
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
        <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg">
          <Trash2 className="w-4 h-4" /> Delete invoice
        </button>
      </div>

      {showShare && <ShareMenu document={invoice} type="invoice" onClose={() => setShowShare(false)} onSent={load} />}

      {/* PAYMENT MODAL */}
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
                  {savingPayment ? 'Saving...' : <><Plus className="w-4 h-4" /> Record Payment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
