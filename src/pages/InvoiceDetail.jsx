import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)

  useEffect(() => { api.get(`/invoices/${id}`).then(res => setInvoice(res.data.data)) }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return
    await api.delete(`/invoices/${id}`)
    toast.success('Invoice deleted')
    navigate('/invoices')
  }

  if (!invoice) return <div className="text-center py-12 text-muted">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{invoice.invoice_number}</h1>
            <p className="text-muted mt-1 text-sm">Issued {new Date(invoice.issue_date).toLocaleDateString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium status-${invoice.status}`}>{invoice.status}</span>
        </div>

        <div className="bg-tint border border-line rounded-xl p-4 mb-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Bill to</p>
          <p className="font-bold">{invoice.customer?.name}</p>
          <p className="text-sm text-muted">{invoice.customer?.email}</p>
          {invoice.customer?.company_name && <p className="text-sm text-muted">{invoice.customer.company_name}</p>}
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted border-b border-line">
              <th className="py-3 text-left font-medium">Description</th>
              <th className="py-3 text-right font-medium">Qty</th>
              <th className="py-3 text-right font-medium">Price</th>
              <th className="py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map(item => (
              <tr key={item.id} className="border-b border-line">
                <td className="py-3 text-sm">{item.description}</td>
                <td className="py-3 text-sm text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-right">${item.unit_price}</td>
                <td className="py-3 text-right font-medium">${item.line_total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>${invoice.subtotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span>${invoice.tax_amount}</span></div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-line"><span>Total</span><span>${invoice.total_amount}</span></div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-line">
            <p className="text-xs uppercase tracking-wide text-muted mb-1">Notes</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg">
            <Trash2 className="w-4 h-4" /> Delete invoice
          </button>
        </div>
      </div>
    </div>
  )
}
