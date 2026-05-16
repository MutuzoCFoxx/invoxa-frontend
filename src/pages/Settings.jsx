import { useState, useEffect, useRef } from 'react'
import { Loader2, User, Lock, Building2, Save, Upload, X, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  const [logoUploading, setLogoUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

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

  const uploadLogo = async (file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowed.includes(file.type)) {
      return toast.error('Please upload a JPEG, PNG, SVG or WebP image')
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Logo must be smaller than 2 MB')
    }
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await api.post('/workspace/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setWorkspace(w => ({ ...w, logo_url: res.data.logo_url }))
      toast.success('Logo uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleFileInput = (e) => uploadLogo(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    uploadLogo(e.dataTransfer.files[0])
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remove your company logo?')) return
    try {
      await api.delete('/workspace/logo')
      setWorkspace(w => ({ ...w, logo_url: '' }))
      toast.success('Logo removed')
    } catch {
      toast.error('Failed to remove logo')
    }
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
              {/* LOGO UPLOAD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>

                {workspace.logo_url ? (
                  /* — Preview with remove button — */
                  <div className="flex items-start gap-4 p-4 bg-tint border border-line rounded-xl">
                    <div className="flex-1 min-w-0 bg-white border border-line rounded-lg p-3 flex items-center justify-center" style={{ minHeight: 80 }}>
                      <img
                        src={workspace.logo_url}
                        alt="Company logo"
                        className="max-h-16 max-w-full object-contain"
                        onError={e => e.target.style.display = 'none'}
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoUploading}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* — Drop zone — */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition ${
                      dragOver ? 'border-ink bg-tint scale-[1.01]' : 'border-line hover:border-gray-400 hover:bg-tint/50'
                    }`}
                  >
                    {logoUploading ? (
                      <Loader2 className="w-8 h-8 text-muted animate-spin" />
                    ) : (
                      <div className="w-12 h-12 bg-tint rounded-xl flex items-center justify-center">
                        <ImagePlus className="w-6 h-6 text-muted" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-medium text-ink">
                        {logoUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-xs text-muted mt-1">PNG, JPG, SVG or WebP · Max 2 MB</p>
                      <p className="text-xs text-muted">Recommended size: <strong>400 × 120 px</strong> (transparent background)</p>
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleFileInput}
                />
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
