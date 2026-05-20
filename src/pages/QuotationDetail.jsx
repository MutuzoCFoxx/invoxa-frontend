import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, FileText, ArrowRight, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import ShareMenu from '../components/ShareMenu'
import DocumentCard from '../components/DocumentCard'

export default function QuotationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quotation, setQuotation] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [converting, setConverting] = useState(false)
  const [showShare, setShowShare]   = useState(false)

  const load = () => {
    Promise.all([api.get(`/quotations/${id}`), api.get('/workspace')]).then(([q, ws]) => {
      setQuotation(q.data.data)
      setWorkspace(ws.data.data)
    })
  }
  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this quotation?')) return
    await api.delete(`/quotations/${id}`)
    toast.success('Quotation deleted')
    navigate('/quotations')
  }

  const handleConvert = async () => {
    if (!confirm('Convert this quotation to an invoice?')) return
    setConverting(true)
    try {
      const res = await api.post(`/quotations/${id}/convert-to-invoice`)
      toast.success('Converted to invoice!')
      navigate(`/invoices/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert')
    } finally { setConverting(false) }
  }

  if (!quotation) return <div className="text-center py-12 text-muted">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/quotations')} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to quotations
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Quotation details</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowShare(true)} className="btn-secondary text-sm">
            <Share2 className="w-4 h-4" /> Share
          </button>
          {quotation.status !== 'accepted' && (
            <button onClick={handleConvert} disabled={converting} className="btn-primary text-sm">
              <FileText className="w-4 h-4" />
              {converting ? 'Converting...' : 'Convert to Invoice'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <DocumentCard doc={quotation} type="quotation" workspace={workspace} />

      <div className="flex justify-end">
        <button onClick={handleDelete}
          className="flex items-center gap-2 text-sm text-muted hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition">
          <Trash2 className="w-4 h-4" /> Delete quotation
        </button>
      </div>

      {showShare && <ShareMenu document={quotation} type="quotation" onClose={() => setShowShare(false)} onSent={load} />}
    </div>
  )
}
