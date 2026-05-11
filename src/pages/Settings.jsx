import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted mt-1">Manage your account</p>
      </div>
      <div className="card">
        <h2 className="font-bold text-lg mb-4">Profile</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-line">
            <span className="text-muted text-sm">Name</span>
            <span className="font-medium text-sm">{user?.first_name} {user?.last_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-line">
            <span className="text-muted text-sm">Email</span>
            <span className="font-medium text-sm">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted text-sm">Workspace</span>
            <span className="font-medium text-sm">{user?.workspace?.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
