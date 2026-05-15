import { useState } from 'react'
import { Mail, MessageCircle, Link as LinkIcon, Download, Share2, X, Loader2, Send, Phone } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const fmt = (amount, currency = 'RWF') => {
  const sym = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' }
  return `${sym[currency] || currency + ' '}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Generic share menu for invoices AND quotations.
 * Props:
 *   document   – the invoice or quotation object
 *   type       – 'invoice' | 'quotation'
 *   onClose    – callback to close modal
 *   onSent     – optional callback after email sent
 */
export default function ShareMenu({ document, type = 'invoice', onClose, onSent }) {
  const [activeView, setActiveView] = useState('menu')
  const [sending, setSending] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [emailForm, setEmailForm] = useState({
    email: document.customer?.email || '',
    message: '',
  })

  const isInvoice = type === 'invoice'
  const docNumber = isInvoice ? document.invoice_number : document.quotation_number
  const dueLabel  = isInvoice
    ? `Due: ${document.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'}`
    : `Valid until: ${document.valid_until ? new Date(document.valid_until).toLocaleDateString() : 'N/A'}`
  const publicPath = isInvoice ? '/i/' : '/q/'
  const apiBase   = isInvoice ? 'invoices' : 'quotations'

  const getShareLink = async () => {
    try {
      const res = await api.get(`/${apiBase}/${document.id}/share-token`)
      const token = res.data.data.token
      const url = `${window.location.origin}${publicPath}${token}`
      setShareUrl(url)
      return url
    } catch {
      toast.error('Failed to generate share link')
      return null
    }
  }

  const shareWhatsApp = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    const total = fmt(document.total_amount, document.currency)
    const message = `Hi ${document.customer?.name || ''},\n\nPlease find your ${type} ${docNumber}.\n\n💰 Amount: ${total}\n📅 ${dueLabel}\n\nView: ${url}\n\nThank you!`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    onClose()
  }

  const shareSMS = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    const total = fmt(document.total_amount, document.currency)
    window.location.href = `sms:?body=${encodeURIComponent(`${type.charAt(0).toUpperCase() + type.slice(1)} ${docNumber} for ${total}. View: ${url}`)}`
    onClose()
  }

  const copyLink = async () => {
    const url = shareUrl || await getShareLink()
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const downloadPdf = async () => {
    try {
      const url = shareUrl || await getShareLink()
      if (!url) return
      const token = url.split(publicPath).pop()
      const pdfUrl = `${import.meta.env.VITE_API_URL}/public/${apiBase}/${document.id}/pdf?token=${token}`
      window.open(pdfUrl, '_blank')
      toast.success('Downloading PDF...')
    } catch {
      toast.error('Failed to download PDF')
    }
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.post(`/${apiBase}/${document.id}/send-email`, emailForm)
      toast.success(`${isInvoice ? 'Invoice' : 'Quotation'} sent successfully!`)
      if (onSent) onSent()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const showLinkView = async () => {
    await getShareLink()
    setActiveView('link')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-line" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {activeView !== 'menu' && (
              <button onClick={() => setActiveView('menu')} className="text-muted hover:text-ink">←</button>
            )}
            <Share2 className="w-5 h-5" />
            <h2 className="text-xl font-bold tracking-tight">
              {activeView === 'menu'  && `Share ${type}`}
              {activeView === 'email' && 'Send via email'}
              {activeView === 'link'  && 'Share link'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-muted mb-6">
          {activeView === 'menu'  && `Share ${docNumber} with your customer`}
          {activeView === 'email' && 'Send a beautiful HTML email'}
          {activeView === 'link'  && 'Anyone with this link can view the document'}
        </p>

        {activeView === 'menu' && (
          <div className="space-y-2">
            {[
              { label: 'WhatsApp', desc: 'Share via WhatsApp message', icon: MessageCircle, color: 'bg-green-100 text-green-600', action: shareWhatsApp },
              { label: 'Email', desc: 'Send a beautiful HTML email', icon: Mail, color: 'bg-blue-100 text-blue-600', action: () => setActiveView('email') },
              { label: 'SMS / Text', desc: 'Send via text message', icon: Phone, color: 'bg-purple-100 text-purple-600', action: shareSMS },
              { label: 'Copy link', desc: 'Get a shareable link', icon: LinkIcon, color: 'bg-orange-100 text-orange-600', action: showLinkView },
              { label: 'Download PDF', desc: 'Save as PDF file', icon: Download, color: 'bg-gray-100 text-gray-600', action: downloadPdf },
            ].map(({ label, desc, icon: Icon, color, action }) => (
              <button key={label} onClick={action}
                className="w-full flex items-center gap-3 p-3 hover:bg-tint rounded-lg transition border border-line">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeView === 'email' && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient email *</label>
              <input type="email" value={emailForm.email}
                onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                className="input" placeholder="customer@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Personal message (optional)</label>
              <textarea value={emailForm.message}
                onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                className="input" rows="4"
                placeholder={`Hi, please find your ${type} attached...`} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send {type}</>}
              </button>
            </div>
          </form>
        )}

        {activeView === 'link' && (
          <div className="space-y-4">
            <div className="bg-tint border border-line rounded-lg p-3 break-all text-sm font-mono">
              {shareUrl || 'Generating link...'}
            </div>
            <button onClick={copyLink} className="btn-primary w-full justify-center">
              <LinkIcon className="w-4 h-4" /> Copy to clipboard
            </button>
            <p className="text-xs text-muted text-center">Anyone with this link can view (no login needed)</p>
          </div>
        )}
      </div>
    </div>
  )
}
