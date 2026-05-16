import { useState, useEffect, useRef } from 'react'
import { Loader2, User, Lock, Building2, Save, Upload, X, ImagePlus, Percent, Palette, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const TEMPLATES = [
  { id: 'classic',  label: 'Classic',  desc: 'Traditional layout with header bar' },
  { id: 'sharp',    label: 'Sharp',    desc: 'Angular, clean borders' },
  { id: 'compact',  label: 'Compact',  desc: 'Dense, space-saving layout' },
  { id: 'bold',     label: 'Bold',     desc: 'Large headers, strong typography' },
  { id: 'wave',     label: 'Wave',     desc: 'Decorative curved accent' },
  { id: 'redmond',  label: 'Redmond',  desc: 'Modern card-based design' },
  { id: 'clean',    label: 'Clean',    desc: 'Minimal, whitespace-rich' },
]

const PRESET_COLORS = [
  '#0b0d10', '#1a56db', '#0e9f6e', '#e02424',
  '#ff5a1f', '#9061f9', '#e74694', '#c27803',
]

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
    bank_name: '', bank_account_number: '', bank_account_name: '',
    tax_type: 'on_total', tax_rate: 0, tax_label: 'VAT', tax_inclusive: false,
    invoice_template: 'classic', brand_color: '#0b0d10',
  })

  useEffect(() => {
    if (user) {
      setProfile({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' })
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
        tax_type: ws.tax_type || 'on_total',
        tax_rate: ws.tax_rate ?? 0,
        tax_label: ws.tax_label || 'VAT',
        tax_inclusive: !!ws.tax_inclusive,
        invoice_template: ws.invoice_template || 'classic',
        brand_color: ws.brand_color || '#0b0d10',
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
    if (password.password !== password.password_confirmation) return toast.error('Passwords do not match')
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
    if (!allowed.includes(file.type)) return toast.error('Please upload a JPEG, PNG, SVG or WebP image')
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be smaller than 2 MB')
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await api.post('/workspace/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setWorkspace(w => ({ ...w, logo_url: res.data.logo_url }))
      toast.success('Logo uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setLogoUploading(false) }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remove your company logo?')) return
    try {
      await api.delete('/workspace/logo')
      setWorkspace(w => ({ ...w, logo_url: '' }))
      toast.success('Logo removed')
    } catch { toast.error('Failed to remove logo') }
  }

  const handleWorkspaceUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/workspace', workspace)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'profile',   label: 'Profile',   icon: User },
    { id: 'company',   label: 'Company',   icon: Building2 },
    { id: 'tax',       label: 'Tax',       icon: Percent },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'password',  label: 'Password',  icon: Lock },
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── PROFILE ── */}
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

      {/* ── COMPANY ── */}
      {activeTab === 'company' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Company Details</h2>
          <p className="text-sm text-muted mb-6">This information appears on your invoices and quotations</p>
          {workspaceLoading ? <p className="text-muted">Loading...</p> : (
            <form onSubmit={handleWorkspaceUpdate} className="space-y-4">
              {/* LOGO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                {workspace.logo_url ? (
                  <div className="flex items-start gap-4 p-4 bg-tint border border-line rounded-xl">
                    <div className="flex-1 min-w-0 bg-white border border-line rounded-lg p-3 flex items-center justify-center" style={{ minHeight: 80 }}>
                      <img src={workspace.logo_url} alt="Company logo" className="max-h-16 max-w-full object-contain" onError={e => e.target.style.display = 'none'} />
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoUploading} className="btn-secondary text-xs py-1.5 px-3">
                        {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Replace
                      </button>
                      <button type="button" onClick={handleRemoveLogo} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); uploadLogo(e.dataTransfer.files[0]) }}
                    className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition ${
                      dragOver ? 'border-ink bg-tint scale-[1.01]' : 'border-line hover:border-gray-400 hover:bg-tint/50'
                    }`}>
                    {logoUploading ? <Loader2 className="w-8 h-8 text-muted animate-spin" /> : (
                      <div className="w-12 h-12 bg-tint rounded-xl flex items-center justify-center">
                        <ImagePlus className="w-6 h-6 text-muted" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-medium text-ink">{logoUploading ? 'Uploading...' : 'Click to upload or drag & drop'}</p>
                      <p className="text-xs text-muted mt-1">PNG, JPG, SVG or WebP · Max 2 MB</p>
                      <p className="text-xs text-muted">Recommended: <strong>400 × 120 px</strong> with transparent background</p>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp" className="hidden" onChange={e => uploadLogo(e.target.files[0])} />
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
                <textarea value={workspace.invoice_footer} onChange={e => setWorkspace({...workspace, invoice_footer: e.target.value})} placeholder="Thank you for your business! Payment terms: Net 30." className="input" rows="2" />
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

      {/* ── TAX ── */}
      {activeTab === 'tax' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Tax Settings</h2>
          <p className="text-sm text-muted mb-6">
            Configure default tax that pre-fills when you create invoices and quotations
          </p>
          {workspaceLoading ? <p className="text-muted">Loading...</p> : (
            <form onSubmit={handleWorkspaceUpdate} className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                These tax defaults auto-populate when creating a new invoice or quotation. You can always override per-document.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax type</label>
                <select value={workspace.tax_type} onChange={e => setWorkspace({...workspace, tax_type: e.target.value})} className="input">
                  <option value="on_total">On Total — single tax applied to the invoice total</option>
                  <option value="per_item">Per Item — tax set individually on each line item</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Default rate (%)</label>
                  <div className="relative">
                    <input
                      type="number" min="0" max="100" step="0.01"
                      value={workspace.tax_rate}
                      onChange={e => setWorkspace({...workspace, tax_rate: parseFloat(e.target.value) || 0})}
                      className="input pr-10"
                      placeholder="18"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax label</label>
                  <input
                    value={workspace.tax_label}
                    onChange={e => setWorkspace({...workspace, tax_label: e.target.value})}
                    className="input"
                    placeholder="VAT"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-line rounded-xl">
                <input
                  id="tax_inclusive"
                  type="checkbox"
                  checked={workspace.tax_inclusive}
                  onChange={e => setWorkspace({...workspace, tax_inclusive: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 accent-ink"
                />
                <label htmlFor="tax_inclusive" className="cursor-pointer flex-1">
                  <span className="font-medium text-sm">Tax inclusive</span>
                  <p className="text-xs text-muted mt-0.5">Prices already include tax (tax shown as informational only)</p>
                </label>
              </div>

              {workspace.tax_rate > 0 && (
                <div className="p-4 bg-tint border border-line rounded-xl text-sm space-y-1">
                  <p className="font-medium">Preview</p>
                  <p className="text-muted">
                    {workspace.tax_label || 'Tax'} ({workspace.tax_rate}%) — {workspace.tax_inclusive ? 'inclusive' : 'added on top'}
                    {workspace.tax_type === 'on_total' ? ', applied to invoice total' : ', set per line item'}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-line">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save tax settings</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-bold text-lg mb-1">Brand Color</h2>
            <p className="text-sm text-muted mb-4">Used as the primary accent color on invoices and quotations</p>
            {workspaceLoading ? <p className="text-muted">Loading...</p> : (
              <form onSubmit={handleWorkspaceUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preset colors</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(color => (
                      <button key={color} type="button"
                        onClick={() => setWorkspace({...workspace, brand_color: color})}
                        className="w-9 h-9 rounded-full border-2 transition flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color, borderColor: workspace.brand_color === color ? color : 'transparent', outline: workspace.brand_color === color ? `3px solid ${color}40` : 'none', outlineOffset: 2 }}
                        title={color}>
                        {workspace.brand_color === color && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                    <label className="w-9 h-9 rounded-full border-2 border-dashed border-line cursor-pointer flex items-center justify-center hover:border-gray-400 transition relative overflow-hidden" title="Custom color">
                      <span className="text-muted text-xs">+</span>
                      <input type="color" value={workspace.brand_color} onChange={e => setWorkspace({...workspace, brand_color: e.target.value})} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: workspace.brand_color }} />
                  <div className="flex-1">
                    <label className="block text-xs text-muted mb-1">Hex value</label>
                    <input
                      value={workspace.brand_color}
                      onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setWorkspace({...workspace, brand_color: e.target.value}) }}
                      className="input font-mono text-sm"
                      placeholder="#0b0d10"
                      maxLength={7}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save brand color</>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="card">
            <h2 className="font-bold text-lg mb-1">Invoice &amp; Quotation Template</h2>
            <p className="text-sm text-muted mb-4">Choose a display style for your documents</p>
            {workspaceLoading ? <p className="text-muted">Loading...</p> : (
              <form onSubmit={handleWorkspaceUpdate} className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TEMPLATES.map(tpl => {
                    const selected = workspace.invoice_template === tpl.id
                    return (
                      <button key={tpl.id} type="button"
                        onClick={() => setWorkspace({...workspace, invoice_template: tpl.id})}
                        className={`relative p-4 rounded-xl border-2 text-left transition ${
                          selected ? 'border-ink bg-tint' : 'border-line hover:border-gray-300'
                        }`}>
                        {/* Mini template preview */}
                        <div className="w-full aspect-[3/2] rounded-lg mb-3 overflow-hidden border border-line bg-white">
                          <TemplateMiniPreview id={tpl.id} color={workspace.brand_color} />
                        </div>
                        <p className="font-semibold text-sm">{tpl.label}</p>
                        <p className="text-xs text-muted mt-0.5 leading-tight">{tpl.desc}</p>
                        {selected && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-line">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save template</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── PASSWORD ── */}
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

function TemplateMiniPreview({ id, color }) {
  const bg = color || '#0b0d10'
  const lightBg = `${bg}18`

  const variants = {
    classic: (
      <div className="w-full h-full p-2 flex flex-col gap-1">
        <div className="h-4 rounded" style={{ backgroundColor: bg }} />
        <div className="flex gap-1 mt-1">
          <div className="flex-1 space-y-1">
            <div className="h-1.5 bg-gray-200 rounded w-3/4" />
            <div className="h-1.5 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="w-8 space-y-1">
            <div className="h-1.5 bg-gray-200 rounded" />
            <div className="h-1.5 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex-1 mt-1 border-t border-gray-100 space-y-1 pt-1">
          {[1,2,3].map(i => <div key={i} className="h-1.5 bg-gray-100 rounded" />)}
        </div>
      </div>
    ),
    sharp: (
      <div className="w-full h-full p-2 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-6" style={{ backgroundColor: bg }} />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 bg-gray-200 rounded-none w-3/4" />
            <div className="h-1.5 bg-gray-100 rounded-none w-1/2" />
          </div>
        </div>
        <div className="h-px mt-1" style={{ backgroundColor: bg }} />
        <div className="flex-1 mt-1 space-y-1">
          {[1,2,3].map(i => <div key={i} className="h-1.5 bg-gray-100 rounded-none" />)}
        </div>
      </div>
    ),
    compact: (
      <div className="w-full h-full p-1.5 flex flex-col gap-0.5">
        <div className="flex justify-between items-center">
          <div className="h-1.5 w-8 rounded" style={{ backgroundColor: bg }} />
          <div className="h-1.5 w-6 bg-gray-200 rounded" />
        </div>
        <div className="h-px bg-gray-200" />
        {[1,2,3,4].map(i => (
          <div key={i} className="flex gap-1">
            <div className="h-1 flex-1 bg-gray-100 rounded" />
            <div className="h-1 w-4 bg-gray-100 rounded" />
            <div className="h-1 w-4 bg-gray-100 rounded" />
          </div>
        ))}
        <div className="h-px bg-gray-200 mt-0.5" />
        <div className="flex justify-end"><div className="h-1.5 w-6 rounded" style={{ backgroundColor: bg }} /></div>
      </div>
    ),
    bold: (
      <div className="w-full h-full flex flex-col">
        <div className="h-5 flex items-center px-2" style={{ backgroundColor: bg }}>
          <div className="h-1.5 w-8 bg-white/60 rounded" />
        </div>
        <div className="flex-1 p-2 space-y-1.5">
          <div className="h-2 bg-gray-200 rounded w-2/3" />
          <div className="h-1.5 bg-gray-100 rounded w-1/2" />
          <div className="h-px bg-gray-200 my-1" />
          {[1,2].map(i => <div key={i} className="h-1.5 bg-gray-100 rounded" />)}
          <div className="flex justify-end mt-1"><div className="h-2 w-8 rounded" style={{ backgroundColor: `${bg}40` }} /></div>
        </div>
      </div>
    ),
    wave: (
      <div className="w-full h-full relative overflow-hidden flex flex-col">
        <div className="h-5 relative" style={{ backgroundColor: bg }}>
          <svg viewBox="0 0 100 10" className="absolute bottom-0 w-full" style={{ height: 6 }} preserveAspectRatio="none">
            <path d="M0 0 Q25 10 50 5 Q75 0 100 8 L100 10 L0 10Z" fill="white" />
          </svg>
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="h-1.5 bg-gray-200 rounded w-3/4" />
          <div className="h-1.5 bg-gray-100 rounded w-1/2" />
          {[1,2].map(i => <div key={i} className="h-1 bg-gray-100 rounded" />)}
        </div>
      </div>
    ),
    redmond: (
      <div className="w-full h-full p-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: bg }} />
          <div className="h-1.5 flex-1 bg-gray-200 rounded" />
        </div>
        <div className="p-1.5 rounded border space-y-1" style={{ borderColor: `${bg}40`, backgroundColor: lightBg }}>
          <div className="h-1.5 bg-gray-200 rounded w-2/3" />
          <div className="h-1 bg-gray-100 rounded w-full" />
          <div className="h-1 bg-gray-100 rounded w-4/5" />
        </div>
        <div className="flex justify-end"><div className="h-1.5 w-8 rounded" style={{ backgroundColor: bg }} /></div>
      </div>
    ),
    clean: (
      <div className="w-full h-full p-3 flex flex-col gap-2">
        <div className="h-1.5 w-10 rounded-sm" style={{ backgroundColor: bg }} />
        <div className="h-1 bg-gray-100 rounded w-2/3" />
        <div className="h-px bg-gray-100 my-0.5" />
        <div className="space-y-1">
          {[1,2,3].map(i => <div key={i} className="h-1 bg-gray-100 rounded" />)}
        </div>
        <div className="flex justify-end mt-auto">
          <div className="h-1.5 w-6 rounded" style={{ backgroundColor: `${bg}50` }} />
        </div>
      </div>
    ),
  }

  return variants[id] || variants.classic
}
