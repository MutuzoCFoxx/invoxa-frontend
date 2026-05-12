import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PlanProvider } from './contexts/PlanContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import InvoiceCreate from './pages/InvoiceCreate'
import InvoiceDetail from './pages/InvoiceDetail'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Settings from './pages/Settings'
import PublicInvoice from './pages/PublicInvoice'
import Upgrade from './pages/Upgrade'
import AdminDashboard from './pages/AdminDashboard'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Quotations from './pages/Quotations'
import QuotationCreate from './pages/QuotationCreate'
import QuotationDetail from './pages/QuotationDetail'
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (user) return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/i/:token" element={<PublicInvoice />} />
            {/* Public legal pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<InvoiceCreate />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/new" element={<QuotationCreate />} />
              <Route path="/quotations/:id" element={<QuotationDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
