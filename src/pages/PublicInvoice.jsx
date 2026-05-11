import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Printer, FileText } from 'lucide-react'
import axios from 'axios'
import { LogoFull } from '../components/Logo'

const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const symbol = symbols[currency] || currency + ' '
  const num = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol}${num}`
}

export default function PublicInvoice() {
  const { token } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/public/invoices/${token}`)
      .then(res => setInvoice(res.data.data))
      .catch(() => setError('Invoice not found or link expired'))
      .finally(() => setLoading(false))
  }, [token])

  const handlePrint = () => window.print()

  const handleDownloadPDF = () => {
    // Use browser's print-to-PDF
    window.print()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted">Loading invoice...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <FileText className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Invoice not found</h1>
      <p className="text-muted text-center">{error}</p>
    </div>
  )

  const curr = invoice.currency || 'USD'

  return (
    <div className="min-h-screen bg-tint py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto">
        
        {/* Action bar - hidden on print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <LogoFull size={32} />
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary text-sm">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary text-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-2xl border border-line p-8 md:p-12 print:border-0 print:rounded-none print:p-0">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-12 pb-8 border-b border-line">
            <div>
              <LogoFull size={36} />
              <p className="text-sm text-muted mt-2">{invoice.workspace?.name}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
              <p className="text-2xl font-mono mt-1">{invoice.invoice_number}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium status-${invoice.status}`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Bill to + Dates */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Bill to</p>
              <p className="font-bold text-lg">{invoice.customer?.name}</p>
              {invoice.customer?.company_name && <p className="text-sm text-muted">{invoice.customer.company_name}</p>}
              <p className="text-sm text-muted">{invoice.customer?.email}</p>
              {invoice.customer?.phone && <p className="text-sm text-muted">{invoice.customer.phone}</p>}
              {invoice.customer?.billing_address && <p className="text-sm text-muted mt-2 whitespace-pre-wrap">{invoice.customer.billing_address}</p>}
            </div>
            <div className="md:text-right space-y-2">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Issue date</p>
                <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Due date</p>
                <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">Description</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Qty</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Price</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Tax</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-muted font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map(item => (
                <tr key={item.id} className="border-b border-line">
                  <td className="py-4">{item.description}</td>
                  <td className="py-4 text-right">{item.quantity}</td>
                  <td className="py-4 text-right">{formatCurrency(item.unit_price, curr)}</td>
                  <td className="py-4 text-right">{item.tax_rate}%</td>
                  <td className="py-4 text-right font-medium">{formatCurrency(item.line_total, curr)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal, curr)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Tax</span>
                <span>{formatCurrency(invoice.tax_amount, curr)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-ink">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount, curr)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t border-line pt-6 mb-8">
              <p className="text-xs uppercase tracking-wide text-muted mb-2">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-line pt-6 text-center text-xs text-muted">
            <p>Thank you for your business!</p>
            <p className="mt-2">Generated by <strong className="text-ink">Invoxa</strong></p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6 print:hidden">
          Powered by <strong>Invoxa</strong> · Your business finances, simplified.
        </p>
      </div>
    </div>
  )
}
