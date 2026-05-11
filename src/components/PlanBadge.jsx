import { Link } from 'react-router-dom'
import { Sparkles, Zap, Crown } from 'lucide-react'
import { usePlan } from '../contexts/PlanContext'

export default function PlanBadge() {
  const { plan } = usePlan()
  
  if (!plan) return null

  const config = {
    free: { 
      icon: Sparkles, 
      label: 'Free', 
      bg: 'bg-gray-100', 
      text: 'text-gray-700',
      showUpgrade: true 
    },
    pro: { 
      icon: Zap, 
      label: 'Pro', 
      bg: 'bg-blue-50', 
      text: 'text-blue-700',
      showUpgrade: false 
    },
    business: { 
      icon: Crown, 
      label: 'Business', 
      bg: 'bg-purple-50', 
      text: 'text-purple-700',
      showUpgrade: false 
    },
  }

  const c = config[plan.current_plan] || config.free
  const Icon = c.icon

  return (
    <div className="px-4 py-3 mx-4 mb-3 rounded-lg bg-tint border border-line">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          <span className={`text-xs font-bold ${c.text}`}>{c.label} Plan</span>
        </div>
        {c.showUpgrade && (
          <Link to="/upgrade?plan=pro" className="text-xs font-medium text-ink hover:underline">
            Upgrade
          </Link>
        )}
      </div>
      {plan.current_plan === 'free' && (
        <>
          <div className="text-xs text-muted mb-1.5">
            {plan.usage.invoices_remaining} of {plan.limits.invoices_per_month} invoices left
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-ink h-full transition-all" 
              style={{ width: `${(plan.usage.invoices_this_month / plan.limits.invoices_per_month) * 100}%` }}
            ></div>
          </div>
        </>
      )}
      {plan.current_plan !== 'free' && (
        <p className="text-xs text-muted">Unlimited invoices ✨</p>
      )}
    </div>
  )
}
