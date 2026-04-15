import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Zap, Shield, Globe, Star, ArrowRight, Check, ChevronDown, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Calendar, title: 'Smart Scheduling', desc: 'Share your link and let invitees pick a time that works for both of you.' },
    { icon: Clock, title: 'Time Zone Magic', desc: 'Automatically detects and converts time zones for all parties.' },
    { icon: Zap, title: 'Instant Confirms', desc: 'Automatic confirmations, reminders, and follow-ups with zero effort.' },
    { icon: Shield, title: 'No Double Bookings', desc: 'Real-time conflict detection keeps your calendar clean and accurate.' },
  ];

  const stats = [
    { number: '20M+', label: 'Users worldwide' },
    { number: '100M+', label: 'Meetings scheduled' },
    { number: '4.7★', label: 'App Store rating' },
    { number: '50+', label: 'Integrations' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Product Manager at Stripe', text: 'Calendly eliminated the back-and-forth completely. I save hours every week.' },
    { name: 'Marcus Patel', role: 'Founder at TechFlow', text: 'Our sales conversion increased 40% after embedding Calendly on our site.' },
    { name: 'Priya Sharma', role: 'HR Director at Notion', text: 'Onboarding interviews became seamless. Candidates love the experience.' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#006bff] rounded-full flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white font-extrabold text-lg">C</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Calendly</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 text-gray-600 font-medium text-sm">
            {['Product', 'Solutions', 'Pricing', 'Resources'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#006bff] transition-colors flex items-center gap-1 group">
                {item}
                <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex gap-3 items-center">
            <Link to="/app/event-types" className="text-gray-700 font-bold hover:text-[#006bff] transition-colors px-4 py-2">
              Log In
            </Link>
            <Link to="/app/event-types" className="bg-[#006bff] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5">
              Get started free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 shadow-lg">
            {['Product', 'Solutions', 'Pricing', 'Resources'].map(item => (
              <a key={item} href="#" className="block text-gray-700 font-semibold py-2 hover:text-[#006bff]">{item}</a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link to="/app/event-types" className="text-center py-2 font-bold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50">Log In</Link>
              <Link to="/app/event-types" className="text-center py-2.5 font-bold text-white bg-[#006bff] rounded-full hover:bg-blue-700">Get started free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#f0f6ff] to-white relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-200 to-blue-300 rounded-full opacity-15 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          {/* Left copy */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#006bff] py-1.5 px-4 rounded-full text-sm font-bold mb-6">
              <Zap className="w-4 h-4" /> New: AI-powered scheduling is here
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Easy scheduling <span className="text-[#006bff]">ahead</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join 20 million professionals who use Calendly to book meetings without the back-and-forth emails. It's free to start.
            </p>

            <div className="flex flex-col gap-3 mb-8 max-w-sm">
              <Link to="/app/event-types" className="flex items-center justify-center gap-3 w-full py-3.5 border-2 border-gray-300 rounded-xl hover:border-[#006bff] bg-white font-bold text-gray-700 transition-all hover:shadow-md group">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign up with Google
              </Link>
              <Link to="/app/event-types" className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] rounded-xl text-white font-bold transition-all hover:shadow-md">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0"/><path d="M17.5 2.5H13L12 4l-1-1.5H6.5L3 9l9 12.5L21 9z" fill="#F35325"/><path d="M3 9h9v12.5z" fill="#81BC06"/><path d="M12 9l9 12.5L12 21.5z" fill="#05A6F0"/><path d="M12 9L3 9 6.5 2.5H12z" fill="#FFBA08"/></svg>
                Sign up with Microsoft
              </Link>
            </div>
            <p className="text-center text-sm text-gray-500">
              Or{' '}
              <Link to="/app/event-types" className="text-[#006bff] hover:underline font-semibold">sign up free with email</Link>
              {' '}— No credit card required
            </p>

            <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {['bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-white ${c} flex items-center justify-center text-xs text-white font-bold`}>{String.fromCharCode(65 + i)}</div>
                ))}
              </div>
              <span>Trusted by <strong className="text-gray-700">20M+ users</strong></span>
              <div className="flex text-yellow-400">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</div>
            </div>
          </div>

          {/* Right: Mock booking widget */}
          <div className="flex-1 flex justify-center items-center w-full max-w-lg">
            <div className="relative bg-white rounded-2xl shadow-[0_20px_70px_-15px_rgba(0,107,255,0.15)] border border-gray-100 p-7 w-full transition-all hover:shadow-[0_30px_80px_-15px_rgba(0,107,255,0.25)] hover:-translate-y-1 duration-500">
              <div className="mb-5 pb-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#006bff] flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-blue-200">F</div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Fatima Sy</p>
                  <h2 className="text-lg font-extrabold text-gray-900">Client Check-in</h2>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> 30 min
                  </p>
                </div>
              </div>

              <p className="font-bold text-gray-900 mb-4 text-sm">Select a Date &amp; Time</p>

              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-[10px] mb-5">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="text-gray-400 font-bold mb-1">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  let cls = 'w-8 h-8 mx-auto flex items-center justify-center rounded-full font-semibold transition-all cursor-pointer text-xs ';
                  if (i === 21) cls += 'bg-[#006bff] text-white shadow-md shadow-blue-200 scale-110';
                  else if ([15, 18, 24, 29].includes(i)) cls += 'text-[#006bff] bg-blue-50 hover:bg-blue-100';
                  else if (i < 7) cls += 'text-gray-300 cursor-not-allowed';
                  else cls += 'text-gray-700 hover:bg-gray-100';
                  return <div key={i} className={cls}>{i + 1}</div>;
                })}
              </div>

              <div className="space-y-2.5">
                <div className="h-11 border border-gray-200 rounded-xl flex items-center justify-center text-sm font-semibold text-gray-600 hover:border-[#006bff] hover:text-[#006bff] cursor-pointer transition-colors">10:00am</div>
                <div className="flex gap-2.5 h-11">
                  <div className="w-1/2 bg-gray-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-inner">11:00am</div>
                  <div className="flex-1 bg-[#006bff] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-colors">Confirm →</div>
                </div>
                <div className="h-11 border border-[#006bff] text-[#006bff] rounded-xl flex items-center justify-center text-sm font-semibold hover:bg-blue-50 cursor-pointer transition-colors">1:00pm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-14 bg-[#0f172a]">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-extrabold text-white mb-1">{s.number}</div>
              <div className="text-gray-400 font-medium text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="product" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#006bff] py-1.5 px-4 rounded-full text-sm font-bold mb-4">
              <Zap className="w-4 h-4" /> Features
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to schedule smarter</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">From solo consultants to enterprise teams — Calendly works for everyone, everywhere.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${activeFeature === i ? 'border-[#006bff] bg-blue-50 shadow-lg shadow-blue-100 -translate-y-1' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeFeature === i ? 'bg-[#006bff] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Loved by teams worldwide</h2>
            <div className="flex justify-center text-yellow-400 gap-1 text-2xl">★★★★★</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-base leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center ${['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i]}`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#006bff] py-1.5 px-4 rounded-full text-sm font-bold mb-4">
            Pricing
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 mb-12 text-lg">Start for free. Upgrade when you're ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', features: ['1 event type', 'Unlimited bookings', 'Calendly branding', 'Email support'], cta: 'Get started free', primary: false },
              { name: 'Standard', price: '$10/mo', features: ['Unlimited event types', 'Custom branding', 'Group events', 'Integrations', 'Priority support'], cta: 'Start free trial', primary: true },
              { name: 'Teams', price: '$16/mo', features: ['Everything in Standard', 'Round-robin scheduling', 'Team pages', 'Advanced analytics', 'SSO / SAML'], cta: 'Start free trial', primary: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-7 border-2 flex flex-col ${plan.primary ? 'border-[#006bff] bg-[#006bff] text-white shadow-xl shadow-blue-200' : 'border-gray-200 bg-white text-gray-900'}`}>
                <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${plan.primary ? 'text-blue-200' : 'text-gray-500'}`}>{plan.name}</p>
                <div className="text-4xl font-extrabold mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm font-medium">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.primary ? 'text-blue-200' : 'text-[#006bff]'}`} /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/app/event-types" className={`py-3 rounded-full font-bold text-center transition-all hover:-translate-y-0.5 ${plan.primary ? 'bg-white text-[#006bff] hover:bg-gray-50 shadow-md' : 'bg-[#006bff] text-white hover:bg-blue-700 shadow-md shadow-blue-200'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#006bff] to-[#3b82f6]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">Start scheduling in minutes</h2>
          <p className="text-blue-100 text-lg mb-8">Join millions who've simplified their scheduling forever.</p>
          <Link to="/app/event-types" className="inline-flex items-center gap-2 bg-white text-[#006bff] px-8 py-4 rounded-full font-extrabold text-lg hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl">
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#006bff] rounded-full flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">C</span>
              </div>
              <span className="text-white font-extrabold text-lg">Calendly</span>
            </div>
            <p className="text-sm max-w-xs">The modern scheduling platform for individuals and teams.</p>
          </div>
          <div className="flex flex-wrap gap-12">
            {[
              { heading: 'Product', links: ['Event Types', 'Availability', 'Integrations', 'Security'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map((col, i) => (
              <div key={i}>
                <p className="text-white font-bold text-sm mb-3">{col.heading}</p>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-sm hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 text-sm text-center text-gray-600">
          © 2025 Calendly Clone. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
