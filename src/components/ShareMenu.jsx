import { useState } from 'react'
import { Mail, MessageCircle, Link as LinkIcon, Printer, Download, Share2, X, Loader2, Send, Phone } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  const symbol = symbols[currency] || currency + ' '
  return `${symbol}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ShareMenu({ invoice, onClose, onSent }) {
  const [activeView, setActiveView] = useState('menu') // menu, email, link
  const [sending, setSending] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [emailForm, setEmailForm] = useState({ 
    email: invoice.customer?.email || '', 
    message: '' 
  })

  // Get the public share URL
  const getShareLink = async () => {
    try {
      const res = await api.get(`/invoices/${invoice.id}/share-token`)
      const url = `${window.location.origin}/i/${res.data.data.token}`
      setShareUrl(url)
      return url
    } catch (err) {
      toast.error('Failed to generate share link')
      return null
    }
  }

  // Open in WhatsApp
  const shareWhatsApp = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    
    const currency = invoice.currency || 'USD'
    const total = formatCurrency(invoice.total_amount, currency)
    
    const message = `Hi ${invoice.customer?.name || ''},

Please find your invoice ${invoice.invoice_number}.

💰 Amount: ${total}
📅 Due: ${new Date(invoice.due_date).toLocaleDateString()}

View invoice: ${url}

Thank you!`
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  // Open SMS
  const shareSMS = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    
    const total = formatCurrency(invoice.total_amount, invoice.currency)
    const message = `Invoice ${invoice.invoice_number} for ${total}. View: ${url}`
    
    window.location.href = `sms:?body=${encodeURIComponent(message)}`
    onClose()
  }

  // Copy link
  const copyLink = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard! 📋')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  // Print
  const print = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    window.open(url, '_blank')
  }

  // Send email
  const handleSendEmail = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.post(`/invoices/${invoice.id}/send-email`, emailForm)
      toast.success('Invoice sent successfully! 📧')
      if (onSent) onSent()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  // Show share link view
  const showLink = async () => {
    await getShareLink()
    setActiveView('link')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-line" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {activeView !== 'menu' && (
              <button onClick={() => setActiveView('menu')} className="text-muted hover:text-ink">
                ←
              </button>
            )}
            <Share2 className="w-5 h-5" />
            <h2 className="text-xl font-bold tracking-tight">
              {activeView === 'menu' && 'Share invoice'}
              {activeView === 'email' && 'Send via email'}
              {activeView === 'link' && 'Share link'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted mb-6">
          {activeView === 'menu' && `Share ${invoice.invoice_number} with your customer`}
          {activeView === 'email' && 'Send a beautiful HTML email'}
          {activeView === 'link' && 'Anyone with this link can view the invoice'}
        </p>
        
        {/* MENU VIEW */}
        {activeView === 'menu' && (
          <div className="space-y-2">
            <button 
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-3 p-3 hover:bg-tint rounded-lg transition border border-line"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted">Share via WhatsApp message</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveView('email')}
              className="w-full flex items-center gap-3 p-3 hover:bg-tint rounded-lg transition border border-line"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Email</p>
                <p className="text-xs text-muted">Send beautiful HTML email</p>
              </div>
            </button>

            <button 
              onClick={shareSMS}
              className="w-full flex items-center gap-3 p-3 hover:bg-tint rounded-lg transition border border-line"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">SMS / Text</p>
                <p className="text-xs text-muted">Send via text message</p>
              </div>
            </button>

            <button 
              onClick={showLink}
              className="w-full flex items-center gap-3 p-3 hover:bg-tint rounded-lg transition border border-line"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Copy link</p>
                <p className="text-xs text-muted">Get a shareable link</p>
              </div>
            </button>

            <button 
              onClick={print}
              className="w-full flex items-center gap-3 p-3 hover:bg-tint rounded-lg transition border border-line"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Printer className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">Print / Save as PDF</p>
                <p className="text-xs text-muted">Open print-friendly view</p>
              </div>
            </button>
          </div>
        )}

        {/* EMAIL VIEW */}
        {activeView === 'email' && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient email *</label>
              <input 
                type="email" 
                value={emailForm.email} 
                onChange={e => setEmailForm({...emailForm, email: e.target.value})} 
                className="input" 
                placeholder="customer@example.com"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Personal message (optional)</label>
              <textarea 
                value={emailForm.message} 
                onChange={e => setEmailForm({...emailForm, message: e.target.value})} 
                className="input" 
                rows="4"
                placeholder="Hi, please find your invoice attached..."
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send invoice</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* LINK VIEW */}
        {activeView === 'link' && (
          <div className="space-y-4">
            <div className="bg-tint border border-line rounded-lg p-3 break-all text-sm font-mono">
              {shareUrl || 'Generating link...'}
            </div>
            <button onClick={copyLink} className="btn-primary w-full justify-center">
              <LinkIcon className="w-4 h-4" /> Copy to clipboard
            </button>
            <p className="text-xs text-muted text-center">
              Anyone with this link can view the invoice (no login needed)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
