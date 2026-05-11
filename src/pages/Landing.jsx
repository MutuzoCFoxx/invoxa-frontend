import { Link } from 'react-router-dom'
import { ArrowRight, Check, Star, Zap, Shield, Clock, FileText, Users, DollarSign } from 'lucide-react'
import { LogoFull, LogoMark } from '../components/Logo'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-line sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoFull size={32} />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-ink">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 lg:py-28">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-tint border border-line px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 mb-6">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            Trusted by businesses worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ letterSpacing: '-0.035em' }}>
            Send invoices in seconds.<br/>
            <span className="text-muted">Get paid faster.</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
            The simplest way to create, send, and track professional invoices. Built for freelancers, contractors, and small businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link to="/register" className="btn-primary text-base">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base">
              Sign in to your account
            </Link>
          </div>
          <p className="text-sm text-muted">No credit card required · Free forever plan · Setup in under 2 minutes</p>
        </div>

        {/* App Preview */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-tint border border-line rounded-2xl p-2 shadow-2xl">
            <div className="bg-white rounded-xl border border-line overflow-hidden">
              <div className="border-b border-line p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center text-xs text-muted">invoxa.app/dashboard</div>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Dashboard</h3>
                  <button className="bg-ink text-white text-xs px-3 py-1.5 rounded-md">+ New Invoice</button>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Revenue', value: 'RWF 12.4M', icon: DollarSign },
                    { label: 'Outstanding', value: 'RWF 3.2M', icon: Clock },
                    { label: 'Invoices', value: '24', icon: FileText },
                    { label: 'Customers', value: '18', icon: Users },
                  ].map(s => (
                    <div key={s.label} className="border border-line rounded-lg p-3">
                      <s.icon className="w-4 h-4 text-muted mb-2" />
                      <p className="text-xs text-muted">{s.label}</p>
                      <p className="font-bold text-lg">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="border border-line rounded-lg">
                  <div className="p-3 border-b border-line text-sm font-medium">Recent invoices</div>
                  {[
                    { num: 'INV-00001', name: 'Acme Corp', amount: 'RWF 1.1M', status: 'paid' },
                    { num: 'INV-00002', name: 'Tech Solutions', amount: 'RWF 2.5M', status: 'sent' },
                    { num: 'INV-00003', name: 'Global Services', amount: 'RWF 800K', status: 'draft' },
                  ].map(inv => (
                    <div key={inv.num} className="p-3 flex items-center justify-between border-b border-line last:border-0 text-sm">
                      <span className="font-medium">{inv.num}</span>
                      <span className="text-muted">{inv.name}</span>
                      <span className="font-bold">{inv.amount}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full status-${inv.status}`}>{inv.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-tint border-y border-line">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: '-0.035em' }}>
              Everything you need to invoice
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Powerful features designed to save you time and help you get paid faster.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Lightning fast', desc: 'Create and send invoices in under 30 seconds. No complicated forms.' },
              { icon: Shield, title: 'Bank-level security', desc: 'Your data is encrypted and protected with industry-leading security.' },
              { icon: Clock, title: 'Track everything', desc: 'See who has viewed, paid, or is overdue at a glance.' },
              { icon: FileText, title: 'Professional templates', desc: 'Beautiful invoice designs that make your business look great.' },
              { icon: Users, title: 'Customer management', desc: 'Keep all your customer details organized in one place.' },
              { icon: DollarSign, title: 'Multi-currency', desc: 'Bill clients anywhere in RWF, USD, EUR, GBP and more.' },
            ].map(f => (
              <div key={f.title} className="card card-hover">
                <div className="w-10 h-10 bg-ink rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '10,000+', label: 'Active businesses' },
              { num: 'RWF 50B+', label: 'Invoiced last year' },
              { num: '99.9%', label: 'Uptime' },
              { num: '4.9/5', label: 'Customer rating' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-4xl font-bold tracking-tight">{s.num}</p>
                <p className="text-sm text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - NOW IN RWF */}
      <section id="pricing" className="px-6 py-20 bg-tint border-y border-line">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: '-0.035em' }}>
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { 
                name: 'Free', 
                price: '0', 
                currency: 'RWF', 
                desc: 'Perfect for getting started', 
                features: ['Up to 5 invoices/month', '1 user', 'Basic templates', 'Email support'], 
                cta: 'Start free' 
              },
              { 
                name: 'Pro', 
                price: '15,000', 
                currency: 'RWF', 
                desc: 'For growing businesses', 
                features: ['Unlimited invoices', '5 users', 'Custom branding', 'Priority support', 'Advanced reports'], 
                cta: 'Start free trial', 
                popular: true 
              },
              { 
                name: 'Business', 
                price: '35,000', 
                currency: 'RWF', 
                desc: 'For teams', 
                features: ['Everything in Pro', 'Unlimited users', 'API access', 'Dedicated support', 'Custom integrations'], 
                cta: 'Contact sales' 
              },
            ].map(p => (
              <div key={p.name} className={`card ${p.popular ? 'ring-2 ring-ink' : ''}`}>
                {p.popular && <div className="bg-ink text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">Most popular</div>}
                <h3 className="font-bold text-2xl mb-1">{p.name}</h3>
                <p className="text-sm text-muted mb-4">{p.desc}</p>
                <div className="mb-1">
                  <span className="text-xs text-muted font-medium">{p.currency}</span>
                  <span className="text-4xl font-bold ml-1">{p.price}</span>
                  <span className="text-base text-muted font-normal">/mo</span>
                </div>
                <Link to="/register" className={`block text-center w-full py-2.5 rounded-lg font-medium mt-6 mb-6 ${p.popular ? 'bg-ink text-white' : 'border border-line hover:bg-tint'}`}>
                  {p.cta}
                </Link>
                <ul className="space-y-3">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-ink mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto bg-ink rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: '-0.035em' }}>
            Ready to get paid faster?
          </h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of businesses using Invoxa today.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-ink font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <LogoFull size={32} />
            <p className="text-sm text-muted">© 2026 Invoxa. Your business finances, simplified.</p>
            <div className="flex gap-6 text-sm text-muted">
              <a href="#" className="hover:text-ink">Privacy</a>
              <a href="#" className="hover:text-ink">Terms</a>
              <a href="#" className="hover:text-ink">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
