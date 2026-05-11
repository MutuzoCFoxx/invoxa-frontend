import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { LogoMark } from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('admin@invoxa.com')
  const [password, setPassword] = useState('password123')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
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
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted text-sm mt-1">Sign in to your Invoxa account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-6">
            New to Invoxa? <Link to="/register" className="text-ink font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
