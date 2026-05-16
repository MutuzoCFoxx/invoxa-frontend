import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Loader2, ArrowRight, Gift } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { LogoMark } from '../components/Logo'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', password_confirmation: '',
    referral_code: '',
  })

  // Auto-fill referral code from ?ref= URL param
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setForm(f => ({ ...f, referral_code: ref.toUpperCase() }))
      setShowReferral(true)
    }
  }, [searchParams])

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
            <p className="text-muted text-sm mt-1">Start invoicing in under 2 minutes · Free forever</p>
          </div>

          {/* Referral banner */}
          {form.referral_code && (
            <div className="mb-5 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
              <Gift className="w-4 h-4 flex-shrink-0" />
              <span>You were referred — you'll start with <strong>3 free invoices</strong> instead of 2!</span>
            </div>
          )}

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

            {/* Referral code toggle */}
            {!showReferral ? (
              <button type="button" onClick={() => setShowReferral(true)}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition">
                <Gift className="w-3.5 h-3.5" /> Have a referral code?
              </button>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-emerald-600" /> Referral code <span className="text-muted font-normal">(optional)</span>
                </label>
                <input
                  value={form.referral_code}
                  onChange={e => setForm({...form, referral_code: e.target.value.toUpperCase()})}
                  className="input font-mono tracking-widest uppercase"
                  placeholder="e.g. ABC12345"
                  maxLength={10}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account? <Link to="/login" className="text-ink font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Free trial note */}
        <p className="text-center text-xs text-muted mt-4">
          Free plan includes 2 invoices · Refer friends to earn up to 5 total
        </p>
      </div>
    </div>
  )
}
