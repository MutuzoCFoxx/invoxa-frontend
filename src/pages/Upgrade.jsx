import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import { usePlan } from '../contexts/PlanContext'

const PLANS = {
  pro: { name: 'Pro', price: 15000, features: ['Unlimited invoices', '5 users', 'Custom branding', 'Priority support'] },
  business: { name: 'Business', price: 35000, features: ['Unlimited invoices', 'Unlimited users', 'API access', 'Dedicated support'] },
}

export default function Upgrade() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { refresh } = usePlan()
  const planKey = params.get('plan') || 'pro'
  const plan = PLANS[planKey]
  
  const [step, setStep] = useState(1) // 1: choose payment, 2: enter phone, 3: processing
  const [paymentMethod, setPaymentMethod] = useState('mtn')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!plan) {
    return <div className="p-6 text-center">Invalid plan selected</div>
  }

  const handlePayment = async () => {
    if (!phoneNumber.match(/^(078|079|072|073)\d{7}$/)) {
      return toast.error('Enter a valid Rwandan mobile number (e.g., 0781234567)')
    }
    
    setProcessing(true)
    setStep(3)
    
    try {
      // Simulate payment processing
      await new Promise(r => setTimeout(r, 3000))
      
      const res = await api.post('/plan/upgrade', {
        plan: planKey,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
      })
      
      await refresh()
      toast.success('🎉 Welcome to ' + plan.name + '!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Payment failed. Please try again.')
      setStep(2)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upgrade to {plan.name}</h1>
        <p className="text-muted mt-1">Unlock the full power of Invoxa</p>
      </div>

      {/* Plan summary */}
      <div className="card">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-bold text-xl">{plan.name} Plan</h2>
          <div>
            <span className="text-xs text-muted">RWF</span>
            <span className="text-3xl font-bold ml-1">{plan.price.toLocaleString()}</span>
            <span className="text-sm text-muted">/month</span>
          </div>
        </div>
        <ul className="space-y-2">
          {plan.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-ink" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Step 1: Choose payment method */}
      {step === 1 && (
        <div className="card">
          <h3 className="font-bold mb-4">Choose payment method</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => setPaymentMethod('mtn')}
              className={`p-4 border-2 rounded-xl text-left transition ${paymentMethod === 'mtn' ? 'border-ink bg-tint' : 'border-line hover:border-gray-300'}`}
            >
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-2 font-bold text-xs">MTN</div>
              <p className="font-medium">MTN Mobile Money</p>
              <p className="text-xs text-muted">Pay with MoMo</p>
            </button>
            <button 
              onClick={() => setPaymentMethod('airtel')}
              className={`p-4 border-2 rounded-xl text-left transition ${paymentMethod === 'airtel' ? 'border-ink bg-tint' : 'border-line hover:border-gray-300'}`}
            >
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2 font-bold text-xs text-white">Airtel</div>
              <p className="font-medium">Airtel Money</p>
              <p className="text-xs text-muted">Pay with Airtel</p>
            </button>
          </div>
          <button onClick={() => setStep(2)} className="btn-primary w-full justify-center">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Enter phone number */}
      {step === 2 && (
        <div className="card">
          <h3 className="font-bold mb-1">Enter your phone number</h3>
          <p className="text-sm text-muted mb-4">
            We'll send a payment prompt to your {paymentMethod === 'mtn' ? 'MTN' : 'Airtel'} number
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 w-4 h-4 text-muted" />
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                placeholder="0781234567" 
                className="input pl-10" 
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted mt-1">Format: 07XXXXXXXX</p>
          </div>

          <div className="bg-tint border border-line rounded-lg p-3 mb-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted">Plan</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted">Billing</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-line font-bold">
              <span>Total</span>
              <span>RWF {plan.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={handlePayment} className="btn-primary flex-1 justify-center">
              Pay RWF {plan.price.toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-ink" />
          <h3 className="font-bold text-xl mb-2">Processing payment...</h3>
          <p className="text-sm text-muted">
            Check your phone for a prompt from {paymentMethod === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}.<br/>
            Enter your PIN to complete the payment.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-tint px-4 py-2 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Waiting for confirmation...
          </div>
        </div>
      )}

      {/* Test mode notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        🧪 <strong>Test mode:</strong> Payment is simulated for now. Real MTN/Airtel integration coming when your merchant account is approved.
      </div>
    </div>
  )
}
