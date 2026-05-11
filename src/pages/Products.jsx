import { useEffect, useState } from 'react'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const formatCurrency = (amount, currency = 'RWF') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const symbol = symbols[currency] || currency + ' '
  const num = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${symbol}${num}`
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', unit_price: '', tax_rate: 0 })

  const load = () => api.get('/products').then(res => setProducts(res.data.data.data || []))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', form)
      toast.success('Product added!')
      setShowModal(false)
      setForm({ name: '', sku: '', unit_price: '', tax_rate: 0 })
      load()
    } catch (err) { toast.error('Failed to add product') }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted mt-1">Your catalog of services and products</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted mb-4">No products yet</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="card card-hover">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-ink rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  {p.sku && <p className="text-xs text-muted">SKU: {p.sku}</p>}
                  <p className="text-lg font-bold mt-1">{formatCurrency(p.unit_price, 'RWF')}</p>
                  {p.tax_rate > 0 && <p className="text-xs text-muted">Tax: {p.tax_rate}%</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-line" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold tracking-tight mb-4">Add product</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name *" className="input" required />
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="SKU" className="input" />
              <input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} placeholder="Price (RWF) *" className="input" required />
              <input type="number" value={form.tax_rate} onChange={e => setForm({...form, tax_rate: e.target.value})} placeholder="Tax rate %" className="input" />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
