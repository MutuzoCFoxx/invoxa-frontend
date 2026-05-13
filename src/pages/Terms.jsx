import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LogoFull } from '../components/Logo'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><LogoFull size={32} /></Link>
          <Link to="/" className="text-sm font-medium flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted mb-8">Last updated: May 11, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using Invoxa ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">2. Description of Service</h2>
            <p>Invoxa is a cloud-based invoice management platform that allows businesses to create, send, and track invoices and quotations. The Service is provided "as is" and "as available."</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">3. Account Registration</h2>
            <p>To use Invoxa, you must register an account with accurate information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">4. Subscription Plans</h2>
            <p>Invoxa offers Free, Pro (RWF 15,000/month), and Business (RWF 35,000/month) plans:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Free plan:</strong> Limited to 5 invoices per month, 1 user</li>
              <li><strong>Pro plan:</strong> Unlimited invoices, up to 5 users, custom branding</li>
              <li><strong>Business plan:</strong> Everything in Pro, unlimited users, API access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">5. Payment Terms</h2>
            <p>Paid plans are billed monthly. Payments are processed via MTN Mobile Money, Airtel Money, or bank transfer. Invoices are sent at the end of each billing cycle and must be paid within 7 days.</p>
            <p className="mt-2">Failure to pay may result in service suspension or account downgrade to the Free plan.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">6. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide accurate information when creating invoices</li>
              <li>Not use Invoxa for fraudulent or illegal purposes</li>
              <li>Comply with all applicable Rwandan tax laws and regulations</li>
              <li>Not attempt to disrupt or interfere with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">7. Data Ownership</h2>
            <p>You retain ownership of all data you upload to Invoxa, including customer information, products, and invoices. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">8. Cancellation</h2>
            <p>You may cancel your subscription at any time through your account settings. Upon cancellation, your account will revert to the Free plan at the end of your current billing period.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">9. Limitation of Liability</h2>
            <p>Invoxa is not liable for any indirect, incidental, or consequential damages arising from the use of our Service. Our total liability is limited to the amount paid by you in the past 12 months.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">10. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Continued use of Invoxa after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">11. Contact</h2>
            <p>For questions about these Terms, contact us at: <strong>mclaude@iremecloud.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
