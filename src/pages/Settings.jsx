import { useState, useEffect } from 'react'
import { Loader2, User, Lock, Building2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '' })
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [workspace, setWorkspace] = useState({
    name: '', logo_url: '', company_email: '', company_phone: '',
    company_address: '', tax_id: '', website: '', invoice_footer: '', currency: 'RWF',
    bank_name: '', bank_account_number: '', bank_account_name: ''
  })

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      })
    }
  }, [user])

  useEffect(() => {
    api.get('/workspace').then(res => {
      const ws = res.data.data
      setWorkspace({
        name: ws.name || '',
        logo_url: ws.logo_url || '',
        company_email: ws.company_email || '',
        company_phone: ws.company_phone || '',
        company_address: ws.company_address || '',
        tax_id: ws.tax_id || '',
        website: ws.website || '',
        invoice_footer: ws.invoice_footer || '',
        currency: ws.currency || 'RWF',
        bank_name: ws.bank_name || '',
        bank_account_number: ws.bank_account_number || '',
        bank_account_name: ws.bank_account_name || '',
      })
    }).finally(() => setWorkspaceLoading(false))
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/auth/profile', profile)
      toast.success('Profile updated!')
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setLoading(false) }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (password.password !== password.password_confirmation) {
      return toast.error('Passwords do not match')
    }
    setLoading(true)
    try {
      await api.put('/auth/profile', password)
      toast.success('Password updated!')
      setPassword({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally { setLoading(false) }
  }

  const handleWorkspaceUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/workspace', workspace)
      toast.success('Company details saved! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'password', label: 'Password', icon: Lock },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted mt-1">Manage your account and business</p>
      </div>

      <div className="flex gap-2 border-b border-line overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Profile Information</h2>
          <p className="text-sm text-muted mb-6">Update your personal details</p>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} className="input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="input" required />
            </div>
            <div className="pt-4 border-t border-line">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save changes</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Company Details</h2>
          <p className="text-sm text-muted mb-6">This information appears on your invoices</p>
          
          {workspaceLoading ? <p className="text-muted">Loading...</p> : (
            <form onSubmit={handleWorkspaceUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company logo URL</label>
                <input 
                  type="url"
                  value={workspace.logo_url} 
                  onChange={e => setWorkspace({...workspace, logo_url: e.target.value})} 
                  placeholder="https://yourcompany.com/logo.png" 
                  className="input" 
                />
                {workspace.logo_url && (
                  <div className="mt-3 p-3 bg-tint border border-line rounded-lg">
                    <p className="text-xs text-muted mb-2">Preview:</p>
                    <img src={workspace.logo_url} alt="Logo" className="h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <p className="text-xs text-muted mt-1">💡 Upload to imgur.com or similar, then paste link</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name *</label>
                <input value={workspace.name} onChange={e => setWorkspace({...workspace, name: e.target.value})} className="input" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company email</label>
                  <input type="email" value={workspace.company_email} onChange={e => setWorkspace({...workspace, company_email: e.target.value})} placeholder="hello@company.com" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input value={workspace.company_phone} onChange={e => setWorkspace({...workspace, company_phone: e.target.value})} placeholder="+250 788 123 456" className="input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea value={workspace.company_address} onChange={e => setWorkspace({...workspace, company_address: e.target.value})} placeholder="KG 123 St, Kigali, Rwanda" className="input" rows="3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax ID / TIN</label>
                  <input value={workspace.tax_id} onChange={e => setWorkspace({...workspace, tax_id: e.target.value})} placeholder="123456789" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                  <input value={workspace.website} onChange={e => setWorkspace({...workspace, website: e.target.value})} placeholder="www.company.com" className="input" />
                </div>
              </div>

              <div className="border-t border-line pt-4 mt-4">
                <h3 className="font-bold mb-3">Bank Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank name</label>
                    <input value={workspace.bank_name} onChange={e => setWorkspace({...workspace, bank_name: e.target.value})} placeholder="Bank of Kigali" className="input" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Account number</label>
                      <input value={workspace.bank_account_number} onChange={e => setWorkspace({...workspace, bank_account_number: e.target.value})} placeholder="1234567890" className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Account name</label>
                      <input value={workspace.bank_account_name} onChange={e => setWorkspace({...workspace, bank_account_name: e.target.value})} placeholder="Your Company Ltd" className="input" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default currency</label>
                <select value={workspace.currency} onChange={e => setWorkspace({...workspace, currency: e.target.value})} className="input">
                  <option value="RWF">RWF (Rwandan Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice footer text</label>
                <textarea 
                  value={workspace.invoice_footer} 
                  onChange={e => setWorkspace({...workspace, invoice_footer: e.target.value})} 
                  placeholder="Thank you for your business! Payment terms: Net 30." 
                  className="input" 
                  rows="2" 
                />
              </div>

              <div className="pt-4 border-t border-line">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save company details</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Change Password</h2>
          <p className="text-sm text-muted mb-6">Update your password to keep your account secure</p>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
              <input type="password" value={password.current_password} onChange={e => setPassword({...password, current_password: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <input type="password" value={password.password} onChange={e => setPassword({...password, password: e.target.value})} className="input" minLength={8} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
              <input type="password" value={password.password_confirmation} onChange={e => setPassword({...password, password_confirmation: e.target.value})} className="input" required />
            </div>
            <div className="pt-4 border-t border-line">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Save className="w-4 h-4" /> Update password</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
