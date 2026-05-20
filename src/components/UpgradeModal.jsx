import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, Sparkles, Zap, Crown, Gift, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function UpgradeModal({ reason, referralCode, onClose }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const referralUrl = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : null

  const copyReferral = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error('Could not copy') }
  }

  const plans = [
    {
      name: 'Pro', key: 'pro', price: '10,000', icon: Zap, popular: true,
      features: ['Unlimited invoices', 'Up to 5 users', 'Custom branding', 'Priority support', 'Advanced reports'],
    },
    {
      name: 'Business', key: 'business', price: '20,000', icon: Crown,
      features: ['Everything in Pro', 'Unlimited users', 'API access', 'Dedicated support', 'Custom integrations'],
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl border border-line max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-tint border border-line px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" /> Free limit reached
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Keep going with Invoxa</h2>
            <p className="text-sm text-muted mt-1">{reason || "You've used all your free invoices."}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Referral option - earn more free invoices */}
        {referralCode && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-600" />
              <p className="font-semibold text-emerald-800">Not ready to upgrade? Refer a friend instead!</p>
            </div>
            <p className="text-sm text-emerald-700">
              Each friend who signs up with your referral link gives you <strong>+1 free invoice</strong> (up to 5 total).
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 truncate">
                {referralUrl}
              </div>
              <button onClick={copyReferral}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition ${copied ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>
        )}

        <p className="text-sm font-medium text-gray-600 mb-4">Or upgrade for unlimited invoices:</p>

        <div className="grid md:grid-cols-2 gap-4">
          {plans.map(p => {
            const Icon = p.icon
            return (
              <div key={p.key} className={`border rounded-xl p-5 ${p.popular ? 'border-ink ring-2 ring-ink' : 'border-line'}`}>
                {p.popular && (
                  <div className="bg-ink text-white text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-3">Most popular</div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-bold text-lg">{p.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-xs text-muted">RWF</span>
                  <span className="text-3xl font-bold ml-1">{p.price}</span>
                  <span className="text-sm text-muted">/mo</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-ink mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => { onClose(); navigate(`/upgrade?plan=${p.key}`) }}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition ${p.popular ? 'bg-ink text-white hover:bg-gray-800' : 'border border-line hover:bg-tint'}`}>
                  Upgrade to {p.name}
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Pay via MTN Mobile Money or Airtel Money · Cancel anytime
        </p>
      </div>
    </div>
  )
}
