import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, Info } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const CURRENCY_SYM = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
const fmt = (amount, currency = 'RWF') =>
  `${CURRENCY_SYM[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function QuotationCreate() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(false)
  const [taxSettings, setTaxSettings] = useState({ type: 'on_total', rate: 0, label: 'Tax', inclusive: false })
  const [form, setForm] = useState({
    customer_id: '',
    issue_date:  new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency:    'RWF',
    notes:       '',
    tax_rate:    0,
    discount_type:   'none',
    discount_amount: 0,
    items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
  })

  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data.data.data || []))
    api.get('/workspace').then(res => {
      const ws      = res.data.data
      const taxRate = parseFloat(ws.tax_rate) || 0
      const taxType = ws.tax_type || 'on_total'
      setTaxSettings({ type: taxType, rate: taxRate, label: ws.tax_label || 'Tax', inclusive: !!ws.tax_inclusive })
      setForm(f => ({
        ...f,
        currency: ws.currency || 'RWF',
        tax_rate: taxType === 'on_total' ? taxRate : 0,
        items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: taxType === 'per_item' ? taxRate : 0 }],
      }))
    })
  }, [])

  const addItem    = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0, tax_rate: taxSettings.type === 'per_item' ? taxSettings.rate : 0 }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i, key, val) => { const items = [...form.items]; items[i][key] = val; setForm({ ...form, items }) }

  const subtotal = form.items.reduce((s, item) => s + (item.quantity || 0) * (item.unit_price || 0), 0)

  const discountValue = (() => {
    if (form.discount_type === 'percentage') return subtotal * ((form.discount_amount || 0) / 100)
    if (form.discount_type === 'fixed')      return Math.min(form.discount_amount || 0, subtotal)
    return 0
  })()

  const afterDiscount = subtotal - discountValue
  const perItemTax    = form.items.reduce((s, item) => s + (item.quantity || 0) * (item.unit_price || 0) * ((item.tax_rate || 0) / 100), 0)
  const onTotalTax    = taxSettings.type === 'on_total' ? afterDiscount * ((form.tax_rate || 0) / 100) : 0
  const taxAmount     = taxSettings.type === 'on_total' ? onTotalTax : perItemTax * (subtotal > 0 ? afterDiscount / subtotal : 1)
  const total         = taxSettings.inclusive ? afterDiscount : afterDiscount + taxAmount

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_id) return toast.error('Select a customer')
    setLoading(true)
    try {
      const payload = {
        ...form,
        items: taxSettings.type === 'on_total'
          ? form.items.map(item => ({ ...item, tax_rate: 0 }))
          : form.items,
      }
      const res = await api.post('/quotations', payload)
      toast.success('Quotation created!')
      navigate(`/quotations/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/quotations')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to quotations
      </button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New quotation</h1>
        <p className="text-muted mt-1">Create a quotation for your customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Details */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
              <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className="input" required>
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input">
                <option value="RWF">RWF — Rwandan Franc</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue date</label>
              <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid until</label>
              <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className="input" required />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Line items</h2>
            <button type="button" onClick={addItem} className="btn-secondary text-sm py-2">
              <Plus className="w-4 h-4" /> Add item
            </button>
          </div>
          <div className="space-y-3">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-5">
                  <label className="block text-xs text-muted mb-1">Description</label>
                  <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="input" required />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <label className="block text-xs text-muted mb-1">Qty</label>
                  <input type="number" min="0.01" step="0.01" value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} className="input" required />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-muted mb-1">Price ({form.currency})</label>
                  <input type="number" min="0" step="0.01" value={item.unit_price}
                    onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} className="input" required />
                </div>
                {taxSettings.type === 'per_item' && (
                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-xs text-muted mb-1">{taxSettings.label} %</label>
                    <input type="number" min="0" max="100" value={item.tax_rate}
                      onChange={e => updateItem(i, 'tax_rate', parseFloat(e.target.value) || 0)} className="input" />
                  </div>
                )}
                <div className={taxSettings.type === 'per_item' ? 'col-span-2 md:col-span-1' : 'col-span-2 md:col-span-3'}>
                  <button type="button" onClick={() => removeItem(i)} className="w-full p-2.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* On-total tax */}
          {taxSettings.type === 'on_total' && (
            <div className="mt-4 pt-4 border-t border-line flex items-center gap-3 flex-wrap">
              <Info className="w-4 h-4 text-muted flex-shrink-0" />
              <label className="text-sm font-medium text-gray-700">{taxSettings.label} rate (%)</label>
              <input type="number" min="0" max="100" step="0.01" value={form.tax_rate}
                onChange={e => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
                className="input w-24" />
              {taxSettings.inclusive && <span className="text-xs text-muted">(tax included in prices)</span>}
            </div>
          )}

          {/* Discount */}
          <div className="mt-4 pt-4 border-t border-line">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Discount</label>
              <select value={form.discount_type}
                onChange={e => setForm({ ...form, discount_type: e.target.value, discount_amount: 0 })}
                className="input w-40 text-sm">
                <option value="none">No discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount</option>
              </select>
              {form.discount_type !== 'none' && (
                <div className="relative">
                  <input type="number" min="0" step="0.01"
                    max={form.discount_type === 'percentage' ? 100 : undefined}
                    value={form.discount_amount}
                    onChange={e => setForm({ ...form, discount_amount: parseFloat(e.target.value) || 0 })}
                    className="input w-32 pr-8" placeholder="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                    {form.discount_type === 'percentage' ? '%' : form.currency}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-6 pt-4 border-t border-line">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{fmt(subtotal, form.currency)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount{form.discount_type === 'percentage' ? ` (${form.discount_amount}%)` : ''}</span>
                  <span className="font-medium">− {fmt(discountValue, form.currency)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm text-muted">
                  <span>{taxSettings.label}{taxSettings.inclusive ? ' (incl.)' : ''}</span>
                  <span className="font-medium">{taxSettings.inclusive ? 'included' : fmt(taxAmount, form.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold tracking-tight pt-2 border-t border-line">
                <span>Total</span>
                <span>{fmt(total, form.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            className="input" rows="3" placeholder="Terms, conditions, or additional information..." />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/quotations')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create quotation'}
          </button>
        </div>
      </form>
    </div>
  )
}
