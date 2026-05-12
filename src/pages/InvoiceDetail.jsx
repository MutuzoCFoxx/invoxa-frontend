import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import ShareMenu from '../components/ShareMenu'

const fmt = (amount, currency = 'USD') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [showShare, setShowShare] = useState(false)

  const load = () => {
    Promise.all([api.get(`/invoices/${id}`), api.get('/workspace')]).then(([inv, ws]) => {
      setInvoice(inv.data.data)
      setWorkspace(ws.data.data)
    })
  }
  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return
    await api.delete(`/invoices/${id}`)
    toast.success('Invoice deleted')
    navigate('/invoices')
  }

  if (!invoice) return <div className="text-center py-12 text-muted">Loading...</div>
  const curr = invoice.currency || 'USD'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Invoice details</h1>
        <button onClick={() => setShowShare(true)} className="btn-primary text-sm"><Share2 className="w-4 h-4" /> Share invoice</button>
      </div>

      {/* INVOICE DOCUMENT */}
      <div className="card p-8 md:p-12">
        {/* HEADER: Company LEFT | Invoice Number RIGHT — PARALLEL */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 pb-8 border-b-2 border-ink">
          <div className="flex-1">
            {workspace?.logo_url && <img src={workspace.logo_url} alt={workspace.name} className="h-12 mb-3 object-contain" onError={e => e.target.style.display='none'} />}
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
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium status-${invoice.status}`}>{invoice.status}</span>
          </div>
        </div>

        {/* BILL TO LEFT | DATES RIGHT */}
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

        {/* LINE ITEMS */}
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

        {/* TOTALS */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{fmt(invoice.subtotal, curr)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span>{fmt(invoice.tax_amount, curr)}</span></div>
            <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-ink"><span>Total</span><span>{fmt(invoice.total_amount, curr)}</span></div>
          </div>
        </div>

        {/* BANK DETAILS */}
        {(workspace?.bank_name || workspace?.bank_account_number) && (
          <div className="bg-tint border border-line rounded-xl p-4 mb-6">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Payment Details</p>
            {workspace.bank_name && <p className="text-sm"><span className="text-muted">Bank:</span> <span className="font-medium">{workspace.bank_name}</span></p>}
            {workspace.bank_account_number && <p className="text-sm"><span className="text-muted">Account:</span> <span className="font-medium font-mono">{workspace.bank_account_number}</span></p>}
            {workspace.bank_account_name && <p className="text-sm"><span className="text-muted">Name:</span> <span className="font-medium">{workspace.bank_account_name}</span></p>}
          </div>
        )}

        {invoice.notes && (<div className="border-t border-line pt-6 mb-6"><p className="text-xs uppercase tracking-widest text-muted mb-2">Notes</p><p className="text-sm whitespace-pre-wrap">{invoice.notes}</p></div>)}
        {workspace?.invoice_footer && (<div className="border-t border-line pt-6 text-center"><p className="text-sm text-muted whitespace-pre-wrap">{workspace.invoice_footer}</p></div>)}
      </div>

      <div className="flex justify-end">
        <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg"><Trash2 className="w-4 h-4" /> Delete invoice</button>
      </div>
      {showShare && <ShareMenu invoice={invoice} onClose={() => setShowShare(false)} onSent={load} />}
    </div>
  )
}
