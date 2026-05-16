import { Link } from 'react-router-dom'
import { Sparkles, Zap, Crown, Gift } from 'lucide-react'
import { usePlan } from '../contexts/PlanContext'

export default function PlanBadge() {
  const { plan } = usePlan()
  if (!plan) return null

  const config = {
    free:     { icon: Sparkles, label: 'Free',     bg: 'bg-gray-100',   text: 'text-gray-700',   showUpgrade: true },
    pro:      { icon: Zap,      label: 'Pro',      bg: 'bg-blue-50',    text: 'text-blue-700',   showUpgrade: false },
    business: { icon: Crown,    label: 'Business', bg: 'bg-purple-50',  text: 'text-purple-700', showUpgrade: false },
  }

  const c    = config[plan.current_plan] || config.free
  const Icon = c.icon
  const ref  = plan.referral

  const isFree     = plan.current_plan === 'free'
  const used       = plan.usage.invoices_this_month
  const limit      = plan.usage.invoices_limit  // already includes bonus
  const pct        = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const hasBonus   = ref && ref.bonus_invoices > 0
  const canEarnMore= ref && ref.bonus_invoices < ref.max_bonus

  return (
    <div className="px-4 py-3 mx-4 mb-3 rounded-lg bg-tint border border-line space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          <span className={`text-xs font-bold ${c.text}`}>{c.label} Plan</span>
          {hasBonus && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
              <Gift className="w-2.5 h-2.5" />+{ref.bonus_invoices}
            </span>
          )}
        </div>
        {c.showUpgrade && (
          <Link to="/upgrade?plan=pro" className="text-xs font-medium text-ink hover:underline">Upgrade</Link>
        )}
      </div>

      {isFree ? (
        <>
          <div className="text-xs text-muted">
            {used} / {limit} invoices used
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-ink'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {canEarnMore && (
            <p className="text-xs text-emerald-700 flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Refer friends → earn up to {ref.max_free} total
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted">Unlimited invoices</p>
      )}
    </div>
  )
}
