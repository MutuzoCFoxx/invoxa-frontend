import { useState, useEffect } from 'react'
import { Loader2, User, Lock, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  
  const [password, setPassword] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/auth/profile', profile)
      toast.success('Profile updated successfully!')
      // Refresh user data
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (password.password !== password.password_confirmation) {
      return toast.error('New passwords do not match')
    }
    setLoading(true)
    try {
      await api.put('/auth/profile', password)
      toast.success('Password updated successfully!')
      setPassword({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'profile' 
              ? 'border-ink text-ink' 
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'password' 
              ? 'border-ink text-ink' 
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Profile Information</h2>
          <p className="text-sm text-muted mb-6">Update your personal details</p>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input 
                  value={profile.first_name} 
                  onChange={e => setProfile({...profile, first_name: e.target.value})} 
                  className="input" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input 
                  value={profile.last_name} 
                  onChange={e => setProfile({...profile, last_name: e.target.value})} 
                  className="input" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input 
                type="email" 
                value={profile.email} 
                onChange={e => setProfile({...profile, email: e.target.value})} 
                className="input" 
                required 
              />
            </div>

            <div className="pt-4 border-t border-line">
              <p className="text-xs text-muted mb-3">
                <strong>Workspace:</strong> {user?.workspace?.name || 'N/A'}
              </p>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <h2 className="font-bold text-lg mb-1">Change Password</h2>
          <p className="text-sm text-muted mb-6">Update your password to keep your account secure</p>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
              <input 
                type="password" 
                value={password.current_password} 
                onChange={e => setPassword({...password, current_password: e.target.value})} 
                className="input" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <input 
                type="password" 
                value={password.password} 
                onChange={e => setPassword({...password, password: e.target.value})} 
                className="input" 
                minLength={8}
                required 
              />
              <p className="text-xs text-muted mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
              <input 
                type="password" 
                value={password.password_confirmation} 
                onChange={e => setPassword({...password, password_confirmation: e.target.value})} 
                className="input" 
                required 
              />
            </div>

            <div className="pt-4 border-t border-line">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                ) : (
                  <><Save className="w-4 h-4" /> Update password</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
