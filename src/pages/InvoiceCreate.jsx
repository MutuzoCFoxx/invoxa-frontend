import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

// Currency formatter helper
const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const symbol = symbols[currency] || currency + ' '
  const num = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol}${num}`
}

export default function InvoiceCreate() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
    currency: 'RWF',
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]
  })

  useEffect(() => { api.get('/customers').then(res => setCustomers(res.data.data.data || [])) }, [])

  const addItem = () => setForm({...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]})
  const removeItem = (i) => setForm({...form, items: form.items.filter((_,idx) => idx !== i)})
  const updateItem = (i, key, val) => {
    const items = [...form.items]; items[i][key] = val; setForm({...form, items})
  }

  const subtotal = form.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0)
  const taxTotal = form.items.reduce((sum, item) => {
    const sub = (item.quantity || 0) * (item.unit_price || 0)
    return sum + sub * ((item.tax_rate || 0) / 100)
  }, 0)
  const total = subtotal + taxTotal

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_id) return toast.error('Select a customer')
    setLoading(true)
    try {
      const res = await api.post('/invoices', form)
      toast.success('Invoice created!')
      navigate(`/invoices/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to invoices
      </button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New invoice</h1>
        <p className="text-muted mt-1">Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
              <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="input" required>
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="input">
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue date</label>
              <input type="date" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date</label>
              <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="input" required />
            </div>
          </div>
        </div>

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
                  <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value))} className="input" required />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-muted mb-1">Price ({form.currency})</label>
                  <input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value))} className="input" required />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <label className="block text-xs text-muted mb-1">Tax %</label>
                  <input type="number" min="0" max="100" value={item.tax_rate} onChange={e => updateItem(i, 'tax_rate', parseFloat(e.target.value))} className="input" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <button type="button" onClick={() => removeItem(i)} className="w-full p-2.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-line">
            <div className="text-right space-y-1">
              <div className="text-sm text-muted">Subtotal: <span className="font-medium text-ink">{formatCurrency(subtotal, form.currency)}</span></div>
              <div className="text-sm text-muted">Tax: <span className="font-medium text-ink">{formatCurrency(taxTotal, form.currency)}</span></div>
              <div className="text-2xl font-bold tracking-tight pt-2 border-t border-line">
                Total: {formatCurrency(total, form.currency)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input" rows="3" placeholder="Add any notes..." />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/invoices')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}
