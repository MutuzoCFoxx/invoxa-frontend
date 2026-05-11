import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { LogoMark } from '../components/Logo'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-tint">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <LogoMark size={56} />
        </Link>
        <div className="bg-white rounded-2xl border border-line p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted text-sm mt-1">Start invoicing in under 2 minutes</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" minLength={8} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input type="password" value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-6">
            Already have an account? <Link to="/login" className="text-ink font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
