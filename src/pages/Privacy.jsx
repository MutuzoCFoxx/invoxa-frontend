import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LogoFull } from '../components/Logo'

export default function Privacy() {
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
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted mb-8">Last updated: May 11, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2">1. Information We Collect</h2>
            <p>We collect information you provide when using Invoxa:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account info:</strong> Name, email, password (encrypted)</li>
              <li><strong>Business info:</strong> Company name, address, tax ID</li>
              <li><strong>Customer data:</strong> Names, emails, addresses of your customers</li>
              <li><strong>Invoice data:</strong> Line items, amounts, taxes</li>
              <li><strong>Payment info:</strong> Phone numbers for Mobile Money (not stored permanently)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide and maintain the Invoxa service</li>
              <li>Process payments and send billing invoices</li>
              <li>Send service-related communications</li>
              <li>Improve our products and features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">3. Data Storage and Security</h2>
            <p>Your data is stored on secure cloud servers with industry-standard encryption:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Passwords are hashed using bcrypt</li>
              <li>All data transmissions use HTTPS/TLS encryption</li>
              <li>Regular security audits and updates</li>
              <li>Database backups encrypted at rest</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">4. Data Sharing</h2>
            <p>We do NOT sell your personal data. We only share data when:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You explicitly authorize it (e.g., sharing an invoice via email)</li>
              <li>Required by Rwandan law or court order</li>
              <li>Necessary to provide service (e.g., email delivery via Resend)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">5. Cookies and Tracking</h2>
            <p>We use minimal cookies for authentication and session management. We do not use third-party tracking cookies for advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your invoice data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">7. Data Retention</h2>
            <p>We retain your data while your account is active. After account deletion:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Personal data deleted within 30 days</li>
              <li>Invoice records kept for 7 years (Rwandan tax law requirement)</li>
              <li>Anonymized analytics data may be retained indefinitely</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">8. Children's Privacy</h2>
            <p>Invoxa is not intended for users under 18 years of age. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">9. Changes to Privacy Policy</h2>
            <p>We may update this policy. Significant changes will be communicated via email. Continued use constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">10. Contact Us</h2>
            <p>Questions about privacy? Contact: <strong>privacy@invoxa.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
