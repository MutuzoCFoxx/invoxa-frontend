import { useEffect, useState } from 'react'
import { Plus, Mail, Phone, Users } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company_name: '', tin: '' })

  const load = () => api.get('/customers').then(res => setCustomers(res.data.data.data || []))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/customers', form)
      toast.success('Customer added!')
      setShowModal(false)
      setForm({ name: '', email: '', phone: '', company_name: '', tin: '' })
      load()
    } catch (err) { toast.error('Failed to add customer') }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted mt-1">Manage your customer list</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted mb-4">No customers yet</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add your first customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map(c => (
            <div key={c.id} className="card card-hover">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-ink rounded-lg flex items-center justify-center text-white font-bold">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{c.name}</p>
                  {c.company_name && <p className="text-xs text-muted truncate">{c.company_name}</p>}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted flex items-center gap-1.5"><Mail className="w-3 h-3" />{c.email}</p>
                    {c.phone && <p className="text-xs text-muted flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</p>}
                    {c.tin && <p className="text-xs text-muted">TIN: {c.tin}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-line" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold tracking-tight mb-4">Add customer</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name *" className="input" required />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email *" className="input" required />
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" className="input" />
              <input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="Company" className="input" />
              <input value={form.tin} onChange={e => setForm({...form, tin: e.target.value})} placeholder="TIN (Tax ID)" className="input" />
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
