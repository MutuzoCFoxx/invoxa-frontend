import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PublicQuotation() {
  const { token } = useParams()
  const [quotation, setQuotation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/public/quotations/${token}`)
      .then(r => setQuotation(r.data.data))
      .catch(() => setError('This quotation link is invalid or has expired.'))
  }, [token])

  if (error) return (
    <div className="min-h-screen bg-tint flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  )

  if (!quotation) return (
    <div className="min-h-screen bg-tint flex items-center justify-center">
      <div className="animate-pulse text-muted">Loading quotation...</div>
    </div>
  )

  const curr = quotation.currency || 'RWF'
  const ws = quotation.workspace
  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date()

  return (
    <div className="min-h-screen bg-tint py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {isExpired && quotation.status !== 'accepted' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-4 text-sm text-center">
            ⚠️ This quotation expired on {new Date(quotation.valid_until).toLocaleDateString()}. Please contact the sender for a renewed offer.
          </div>
        )}
        <div className="bg-white rounded-2xl border border-line p-8 md:p-12 shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 pb-8 border-b-2 border-gray-900">
            <div>
              {ws?.logo_url && <img src={ws.logo_url} alt={ws.name} className="h-12 mb-3 object-contain" onError={e => e.target.style.display = 'none'} />}
              <h2 className="text-2xl font-bold">{ws?.name || 'Company'}</h2>
              {ws?.company_address && <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{ws.company_address}</p>}
              {ws?.company_email && <p className="text-sm text-gray-500">{ws.company_email}</p>}
              {ws?.company_phone && <p className="text-sm text-gray-500">{ws.company_phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Quotation</p>
              <p className="text-3xl font-bold font-mono">{quotation.quotation_number}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                quotation.status === 'accepted' ? 'bg-green-50 text-green-700' :
                quotation.status === 'rejected' ? 'bg-red-50 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>{quotation.status}</span>
            </div>
          </div>

          {/* Bill-to + Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Prepared for</p>
              <p className="font-bold text-lg">{quotation.customer?.name}</p>
              {quotation.customer?.company_name && <p className="text-sm">{quotation.customer.company_name}</p>}
              <p className="text-sm text-gray-500">{quotation.customer?.email}</p>
            </div>
            <div className="md:text-right space-y-3">
              <div><p className="text-xs uppercase tracking-widest text-gray-400">Issue date</p><p className="font-medium">{new Date(quotation.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
              <div><p className="text-xs uppercase tracking-widest text-gray-400">Valid until</p><p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>{new Date(quotation.valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full mb-8">
            <thead><tr className="border-b-2 border-gray-900">
              <th className="py-3 text-left text-xs uppercase tracking-wide text-gray-400 font-medium">Description</th>
              <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium">Qty</th>
              <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium">Price</th>
              <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium">Tax</th>
              <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium">Total</th>
            </tr></thead>
            <tbody>
              {quotation.items?.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 text-sm">{item.description}</td>
                  <td className="py-4 text-sm text-right">{item.quantity}</td>
                  <td className="py-4 text-sm text-right">{fmt(item.unit_price, curr)}</td>
                  <td className="py-4 text-sm text-right">{item.tax_rate}%</td>
                  <td className="py-4 text-right font-medium">{fmt(item.line_total, curr)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{fmt(quotation.subtotal, curr)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>{fmt(quotation.tax_amount, curr)}</span></div>
              <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-gray-900"><span>Total</span><span>{fmt(quotation.total_amount, curr)}</span></div>
            </div>
          </div>

          {/* Payment details */}
          {(ws?.bank_name || ws?.bank_account_number) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Payment Details (upon acceptance)</p>
              {ws.bank_name && <p className="text-sm"><span className="text-gray-400">Bank:</span> <span className="font-medium">{ws.bank_name}</span></p>}
              {ws.bank_account_number && <p className="text-sm"><span className="text-gray-400">Account:</span> <span className="font-medium font-mono">{ws.bank_account_number}</span></p>}
              {ws.bank_account_name && <p className="text-sm"><span className="text-gray-400">Name:</span> <span className="font-medium">{ws.bank_account_name}</span></p>}
            </div>
          )}

          {quotation.notes && <div className="border-t border-gray-100 pt-6 mb-6"><p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Notes</p><p className="text-sm whitespace-pre-wrap text-gray-600">{quotation.notes}</p></div>}

          <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            {ws?.invoice_footer ? ws.invoice_footer + ' · ' : 'Thank you for considering our services · '}
            Powered by Invoxa
          </div>
        </div>
      </div>
    </div>
  )
}
