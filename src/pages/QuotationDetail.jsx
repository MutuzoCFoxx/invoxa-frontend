import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, FileText, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const fmt = (amount, currency = 'USD') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function QuotationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quotation, setQuotation] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/quotations/${id}`), api.get('/workspace')]).then(([q, ws]) => {
      setQuotation(q.data.data); setWorkspace(ws.data.data)
    })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this quotation?')) return
    await api.delete(`/quotations/${id}`)
    toast.success('Quotation deleted')
    navigate('/quotations')
  }

  const handleConvert = async () => {
    if (!confirm('Convert this quotation to an invoice?')) return
    setConverting(true)
    try {
      const res = await api.post(`/quotations/${id}/convert-to-invoice`)
      toast.success('Converted to invoice!')
      navigate(`/invoices/${res.data.data.id}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to convert') }
    finally { setConverting(false) }
  }

  if (!quotation) return <div className="text-center py-12 text-muted">Loading...</div>
  const curr = quotation.currency || 'RWF'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/quotations')} className="flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Quotation details</h1>
        <div className="flex gap-2">
          {quotation.status !== 'accepted' && (
            <button onClick={handleConvert} disabled={converting} className="btn-primary text-sm">
              <FileText className="w-4 h-4" /> {converting ? 'Converting...' : 'Convert to Invoice'} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="card p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 pb-8 border-b-2 border-ink">
          <div className="flex-1">
            {workspace?.logo_url && <img src={workspace.logo_url} alt={workspace.name} className="h-12 mb-3 object-contain" onError={e => e.target.style.display='none'} />}
            <h2 className="text-2xl font-bold tracking-tight">{workspace?.name || 'Your Company'}</h2>
            {workspace?.company_address && <p className="text-sm text-muted mt-1 whitespace-pre-wrap">{workspace.company_address}</p>}
            {workspace?.company_email && <p className="text-sm text-muted">{workspace.company_email}</p>}
            {workspace?.company_phone && <p className="text-sm text-muted">{workspace.company_phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Quotation</p>
            <p className="text-3xl font-bold tracking-tight font-mono">{quotation.quotation_number}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              quotation.status === 'accepted' ? 'bg-green-50 text-green-700' : quotation.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
            }`}>{quotation.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Prepared for</p>
            <p className="font-bold text-lg">{quotation.customer?.name}</p>
            <p className="text-sm text-muted">{quotation.customer?.email}</p>
          </div>
          <div className="md:text-right space-y-3">
            <div><p className="text-xs uppercase tracking-widest text-muted">Issue date</p><p className="font-medium">{new Date(quotation.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-muted">Valid until</p><p className="font-medium">{new Date(quotation.valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
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
          <tbody>{quotation.items?.map(item => (
            <tr key={item.id} className="border-b border-line">
              <td className="py-4 text-sm">{item.description}</td>
              <td className="py-4 text-sm text-right">{item.quantity}</td>
              <td className="py-4 text-sm text-right">{fmt(item.unit_price, curr)}</td>
              <td className="py-4 text-sm text-right">{item.tax_rate}%</td>
              <td className="py-4 text-right font-medium">{fmt(item.line_total, curr)}</td>
            </tr>
          ))}</tbody>
        </table>

        <div className="flex justify-end mb-8"><div className="w-72 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{fmt(quotation.subtotal, curr)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span>{fmt(quotation.tax_amount, curr)}</span></div>
          <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-ink"><span>Total</span><span>{fmt(quotation.total_amount, curr)}</span></div>
        </div></div>

        {quotation.notes && (<div className="border-t border-line pt-6"><p className="text-xs uppercase tracking-widest text-muted mb-2">Notes</p><p className="text-sm whitespace-pre-wrap">{quotation.notes}</p></div>)}
      </div>

      <div className="flex justify-end">
        <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg"><Trash2 className="w-4 h-4" /> Delete quotation</button>
      </div>
    </div>
  )
}
