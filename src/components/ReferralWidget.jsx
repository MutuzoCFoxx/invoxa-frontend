import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Users, Zap, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../services/api'

export default function ReferralWidget() {
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/referral').then(res => setData(res.data.data)).catch(() => {})
  }, [])

  if (!data || data.is_paid) return null

  const referralUrl = `${window.location.origin}/register?ref=${data.referral_code}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — please copy manually')
    }
  }

  const used       = data.invoices_used
  const cap        = data.free_cap
  const pct        = cap > 0 ? Math.min((used / cap) * 100, 100) : 0
  const remaining  = data.invoices_remaining
  const bonusSlots = data.max_bonus - data.bonus_invoices  // how many more referrals help
  const atMax      = data.bonus_invoices >= data.max_bonus

  return (
    <div className="card border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-base">Refer &amp; Earn</h3>
            <p className="text-xs text-muted">Each referral = +1 free invoice (up to {data.max_free} total)</p>
          </div>
        </div>
        {remaining === 0 && (
          <Link to="/upgrade?plan=pro" className="flex items-center gap-1 text-xs font-semibold text-white bg-ink px-3 py-1.5 rounded-lg hover:opacity-80 transition whitespace-nowrap flex-shrink-0">
            <Zap className="w-3 h-3" /> Upgrade
          </Link>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted">Free invoices used</span>
          <span className="font-semibold">{used} / {cap}</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {!atMax && (
          <p className="text-xs text-emerald-700">
            Refer {bonusSlots} more friend{bonusSlots !== 1 ? 's' : ''} to reach {data.max_free} free invoices
          </p>
        )}
        {remaining === 0 && (
          <p className="text-xs text-red-600 font-medium">You've used all free invoices — upgrade to keep going!</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-white rounded-lg border border-line">
          <p className="text-xl font-bold">{data.referral_count}</p>
          <p className="text-xs text-muted flex items-center justify-center gap-0.5"><Users className="w-3 h-3" /> Referred</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-line">
          <p className="text-xl font-bold">+{data.bonus_invoices}</p>
          <p className="text-xs text-muted">Bonus inv.</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-line">
          <p className="text-xl font-bold">{remaining === 'unlimited' ? '∞' : remaining}</p>
          <p className="text-xs text-muted">Remaining</p>
        </div>
      </div>

      {/* Referral code + copy */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600">Your referral link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 min-w-0">
            <span className="text-xs font-mono text-muted truncate flex-1">{referralUrl}</span>
            <span className="text-xs font-bold tracking-widest text-ink flex-shrink-0 bg-tint px-2 py-0.5 rounded">
              {data.referral_code}
            </span>
          </div>
          <button
            onClick={copyLink}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition ${
              copied ? 'bg-emerald-100 text-emerald-700' : 'bg-ink text-white hover:opacity-80'
            }`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
        <p className="text-xs text-muted">Share this link — when they sign up you both get a bonus invoice</p>
      </div>
    </div>
  )
}
