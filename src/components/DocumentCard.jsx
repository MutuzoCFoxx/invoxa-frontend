/**
 * Shared document renderer for invoices and quotations.
 * Used by InvoiceDetail, QuotationDetail, PublicInvoice, PublicQuotation.
 */

const STATUS_COLORS = {
  draft:          'bg-gray-100 text-gray-700',
  sent:           'bg-blue-50 text-blue-700',
  paid:           'bg-green-50 text-green-700',
  overdue:        'bg-red-50 text-red-700',
  partially_paid: 'bg-yellow-50 text-yellow-700',
  accepted:       'bg-green-50 text-green-700',
  rejected:       'bg-red-50 text-red-700',
  expired:        'bg-yellow-50 text-yellow-700',
}

const CURRENCY_SYM = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }

function fmt(amount, currency = 'RWF') {
  const sym = CURRENCY_SYM[currency] || (currency + ' ')
  return `${sym}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * @param {object} props
 * @param {object} props.doc          - Invoice or Quotation object (with items, customer loaded)
 * @param {'invoice'|'quotation'} props.type
 * @param {object} props.workspace    - Workspace object (branding, tax, bank details)
 * @param {React.ReactNode} props.children - Optional content appended after the document (payments, actions)
 */
export default function DocumentCard({ doc, type, workspace, children }) {
  if (!doc) return null

  const curr         = doc.currency || 'RWF'
  const isInvoice    = type === 'invoice'
  const docNumber    = isInvoice ? doc.invoice_number : doc.quotation_number
  const docLabel     = isInvoice ? 'INVOICE' : 'QUOTATION'
  const accentColor  = workspace?.brand_color || '#0b0d10'
  const template     = workspace?.invoice_template || 'classic'

  // Tax display
  const taxLabel     = workspace?.tax_label || 'Tax'
  const taxInclusive = workspace?.tax_inclusive
  const taxRate      = workspace?.tax_rate || 0

  // Discount
  const hasDiscount  = doc.discount_type && doc.discount_type !== 'none' && Number(doc.discount_value) > 0
  const discountLabel = doc.discount_type === 'percentage'
    ? `Discount (${doc.discount_amount}%)`
    : 'Discount'

  // Payments (invoices only)
  const amountPaid   = Number(doc.amount_paid || 0)
  const balanceDue   = Math.max(0, Number(doc.total_amount) - amountPaid)

  const headerStyle  = { borderColor: accentColor }
  const accentStyle  = { color: accentColor }
  const accentBgStyle= { backgroundColor: accentColor }

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden print:shadow-none print:border-none">

      {/* ── HEADER BAR (template-aware) ── */}
      {template === 'bold' || template === 'wave' || template === 'redmond' ? (
        <div className="relative px-8 pt-8 pb-6 md:px-12 md:pt-10" style={{ backgroundColor: accentColor }}>
          {template === 'wave' && (
            <svg viewBox="0 0 1200 60" className="absolute bottom-0 left-0 w-full" style={{ height: 32 }} preserveAspectRatio="none">
              <path d="M0 0 Q300 60 600 30 Q900 0 1200 40 L1200 60 L0 60Z" fill="white" />
            </svg>
          )}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
            <div className="flex-1">
              {workspace?.logo_url && (
                <img src={workspace.logo_url} alt={workspace?.name} className="h-14 mb-3 object-contain brightness-0 invert"
                  onError={e => { e.target.style.display = 'none' }} />
              )}
              <h2 className="text-2xl font-bold text-white">{workspace?.name || 'Your Company'}</h2>
              {workspace?.company_address && <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{workspace.company_address}</p>}
              {workspace?.company_email && <p className="text-sm text-white/70">{workspace.company_email}</p>}
              {workspace?.company_phone && <p className="text-sm text-white/70">{workspace.company_phone}</p>}
              {workspace?.tax_id && <p className="text-sm text-white/60">TIN: {workspace.tax_id}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-1">{docLabel}</p>
              <p className="text-3xl font-bold text-white font-mono">{docNumber}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                {doc.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Classic / Sharp / Compact / Clean / Redmond header */
        <div className="px-8 pt-8 pb-6 md:px-12 md:pt-10 border-b-2" style={headerStyle}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              {workspace?.logo_url && (
                <img src={workspace.logo_url} alt={workspace?.name}
                  className="h-14 mb-3 object-contain max-w-[200px]"
                  onError={e => { e.target.style.display = 'none' }} />
              )}
              <h2 className="text-2xl font-bold tracking-tight">{workspace?.name || 'Your Company'}</h2>
              {workspace?.company_address && <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{workspace.company_address}</p>}
              {workspace?.company_email && <p className="text-sm text-gray-500">{workspace.company_email}</p>}
              {workspace?.company_phone && <p className="text-sm text-gray-500">{workspace.company_phone}</p>}
              {workspace?.tax_id && <p className="text-sm text-gray-500">TIN: {workspace.tax_id}</p>}
              {workspace?.website && <p className="text-sm text-gray-500">{workspace.website}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{docLabel}</p>
              <p className="text-3xl font-bold tracking-tight font-mono" style={accentStyle}>{docNumber}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-700'}`}>
                {doc.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-8 md:px-12 space-y-8">
        {/* ── BILL TO / DATES ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              {isInvoice ? 'Bill to' : 'Prepared for'}
            </p>
            <p className="font-bold text-lg">{doc.customer?.name}</p>
            {doc.customer?.company_name && <p className="text-sm text-gray-600">{doc.customer.company_name}</p>}
            {doc.customer?.email && <p className="text-sm text-gray-500">{doc.customer.email}</p>}
            {doc.customer?.phone && <p className="text-sm text-gray-500">{doc.customer.phone}</p>}
            {doc.customer?.billing_address && <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{doc.customer.billing_address}</p>}
          </div>
          <div className="md:text-right space-y-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Issue date</p>
              <p className="font-medium">{fmtDate(doc.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {isInvoice ? 'Due date' : 'Valid until'}
              </p>
              <p className="font-medium">{fmtDate(isInvoice ? doc.due_date : doc.valid_until)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Currency</p>
              <p className="font-medium">{curr}</p>
            </div>
          </div>
        </div>

        {/* ── LINE ITEMS TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={headerStyle}>
                <th className="py-3 text-left text-xs uppercase tracking-wide text-gray-400 font-medium">Description</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium w-16">Qty</th>
                <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium w-28">Unit Price</th>
                {doc.items?.some(i => Number(i.tax_rate) > 0) && (
                  <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium w-20">{taxLabel}</th>
                )}
                <th className="py-3 text-right text-xs uppercase tracking-wide text-gray-400 font-medium w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {doc.items?.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 text-sm">{item.description}</td>
                  <td className="py-3.5 text-sm text-right text-gray-600">{Number(item.quantity).toLocaleString()}</td>
                  <td className="py-3.5 text-sm text-right text-gray-600">{fmt(item.unit_price, curr)}</td>
                  {doc.items?.some(i => Number(i.tax_rate) > 0) && (
                    <td className="py-3.5 text-sm text-right text-gray-500">{Number(item.tax_rate) > 0 ? `${item.tax_rate}%` : '—'}</td>
                  )}
                  <td className="py-3.5 text-sm text-right font-medium">{fmt(item.line_total, curr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS ── */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{fmt(doc.subtotal, curr)}</span>
            </div>

            {hasDiscount && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>{discountLabel}</span>
                <span className="font-medium">− {fmt(doc.discount_value, curr)}</span>
              </div>
            )}

            {Number(doc.tax_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {taxLabel}{taxRate > 0 ? ` (${taxRate}%)` : ''}{taxInclusive ? ' — inclusive' : ''}
                </span>
                <span className="font-medium">{taxInclusive ? 'included' : fmt(doc.tax_amount, curr)}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold pt-3 border-t-2" style={headerStyle}>
              <span>Total</span>
              <span style={accentStyle}>{fmt(doc.total_amount, curr)}</span>
            </div>

            {/* Invoice-only: amount paid + balance due */}
            {isInvoice && amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600 pt-1">
                  <span>Amount paid</span>
                  <span className="font-medium">− {fmt(amountPaid, curr)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t border-gray-200">
                  <span>Balance due</span>
                  <span>{fmt(balanceDue, curr)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── BANK DETAILS ── */}
        {(workspace?.bank_name || workspace?.bank_account_number) && (
          <div className="rounded-xl p-4 border border-gray-100" style={{ backgroundColor: `${accentColor}08` }}>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              {isInvoice ? 'Payment Details' : 'Payment Details (upon acceptance)'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              {workspace.bank_name && (
                <div><span className="text-gray-400">Bank</span><p className="font-medium">{workspace.bank_name}</p></div>
              )}
              {workspace.bank_account_number && (
                <div><span className="text-gray-400">Account</span><p className="font-medium font-mono">{workspace.bank_account_number}</p></div>
              )}
              {workspace.bank_account_name && (
                <div><span className="text-gray-400">Account name</span><p className="font-medium">{workspace.bank_account_name}</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {doc.notes && (
          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{doc.notes}</p>
          </div>
        )}

        {/* ── FOOTER ── */}
        {workspace?.invoice_footer && (
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{workspace.invoice_footer}</p>
          </div>
        )}
      </div>

      {/* Slot for additional content (payments, actions) */}
      {children}
    </div>
  )
}
