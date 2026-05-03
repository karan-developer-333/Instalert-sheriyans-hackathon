import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Users, Code2, Layers, X, ChevronDown, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const mountedRef = useRef(true);
  const [pricingAnnual, setPricingAnnual] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return;
      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) setActiveCard((current) => (current + 1) % 3);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => {
      clearInterval(progressInterval);
      mountedRef.current = false;
    };
  }, []);

  const features = [
    { icon: Zap, title: "Plan your schedules", description: "Streamline customer subscriptions and billing with automated scheduling tools." },
    { icon: BarChart3, title: "Analytics & insights", description: "Transform your business data into actionable insights with real-time analytics." },
    { icon: Users, title: "Collaborate seamlessly", description: "Keep your team aligned with shared dashboards and collaborative workflows." },
  ];

  const faqs = [
    { q: "What is InstaAlert?", a: "InstaAlert is a SaaS platform for effortless custom contract billing, team collaboration, and incident management." },
    { q: "Is there a free plan?", a: "Yes! Our Starter plan is completely free and supports up to 3 team members." },
    { q: "Can I switch plans anytime?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your settings." },
    { q: "How does the team collaboration work?", a: "Invite team members via join codes. Everyone gets real-time updates on incidents and tasks." },
    { q: "Do you offer API access?", a: "Yes, our Professional and Enterprise plans include full API access for integrations." },
    { q: "What kind of support do you provide?", a: "All plans include email support. Enterprise customers get dedicated account managers and 24/7 priority support." },
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "CTO at TechFlow", quote: "InstaAlert transformed how we handle billing. The automation alone saved us 20 hours per week.", rating: 5 },
    { name: "Marcus Johnson", role: "PM at DataSync", quote: "The real-time collaboration features are incredible. Our team has never been more aligned.", rating: 5 },
    { name: "Emily Rodriguez", role: "Founder at BuildStack", quote: "Setup took minutes, not days. The intuitive interface made onboarding our team a breeze.", rating: 5 },
  ];

  const integrations = ["GitHub", "Slack", "Figma", "Discord", "Notion", "Stripe", "Jira", "Linear"];

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto mt-4 px-4">
          <div className="bg-[#F7F5F3]/90 backdrop-blur-sm shadow-[0px_0px_0px_2px_white] rounded-full px-4 py-2 flex justify-between items-center border border-[rgba(55,50,47,0.08)]">
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium text-[#2F3037] font-sans">InstaAlert</span>
              <div className="hidden sm:flex items-center gap-4">
                <a href="#features" className="text-[13px] font-medium text-[rgba(49,45,43,0.80)] hover:text-[#37322F] transition-colors">Products</a>
                <a href="#pricing" className="text-[13px] font-medium text-[rgba(49,45,43,0.80)] hover:text-[#37322F] transition-colors">Pricing</a>
                <a href="#faq" className="text-[13px] font-medium text-[rgba(49,45,43,0.80)] hover:text-[#37322F] transition-colors">FAQ</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button size="sm" className="rounded-full bg-[#37322F] hover:bg-[#37322F]/90" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate("/auth/login")}>
                    Log in
                  </Button>
                  <Button size="sm" className="rounded-full bg-[#37322F] hover:bg-[#37322F]/90 hidden sm:flex" onClick={() => navigate("/auth/register")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-4 flex flex-col items-center">
        <div className="max-w-[748px] text-center space-y-6">
          <h1 className="text-[28px] sm:text-[40px] md:text-[56px] lg:text-[72px] font-serif font-normal leading-[1.1] text-[#37322F]">
            Effortless custom contract billing by InstaAlert
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[rgba(55,50,47,0.80)] max-w-[506px] mx-auto leading-relaxed">
            Streamline your billing process with seamless automation for every custom contract, tailored by InstaAlert.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button size="lg" className="rounded-full bg-[#37322F] hover:bg-[#37322F]/90 px-10 h-12 text-base" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth/register")}>
            {isAuthenticated ? "Go to Dashboard" : "Start for free"} <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-[#605A57]">No credit card required</p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-12 w-full max-w-[960px]">
          <div className="bg-white shadow-[0px_0px_0px_0.9px_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
            <div className="h-[8px] bg-[#F7F5F3] border-b border-[rgba(55,50,47,0.08)]" />
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Revenue", value: "$48,290", change: "+12.5%" },
                  { label: "Active Contracts", value: "142", change: "+8.2%" },
                  { label: "Team Members", value: "28", change: "+3.1%" },
                  { label: "Avg. Response", value: "1.2h", change: "-24%" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-[#F7F5F3] rounded-lg">
                    <p className="text-xs text-[#605A57]">{stat.label}</p>
                    <p className="text-xl font-semibold text-[#37322F] mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>
              <div className="h-32 bg-gradient-to-br from-[#37322F]/5 to-[#37322F]/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-16 h-16 text-[#37322F]/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E0DEDB] rounded-lg overflow-hidden border border-[#E0DEDB] w-full max-w-[700px]">
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => { setActiveCard(i); setProgress(0); }}
              className={`p-5 text-left transition-colors relative ${activeCard === i ? "bg-white" : "bg-[#F7F5F3] hover:bg-white"}`}
            >
              {activeCard === i && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
                  <div className="h-full bg-[#322D2B] transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <f.icon className="w-4 h-4 text-[#37322F]" />
                <h3 className="text-sm font-semibold text-[#49423D]">{f.title}</h3>
              </div>
              <p className="text-[13px] text-[#605A57] leading-[22px]">{f.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 border-y border-[rgba(55,50,47,0.12)]">
        <div className="max-w-[586px] mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-[rgba(2,6,23,0.08)]">
            <Star className="w-3 h-3 text-[#37322F] fill-[#37322F]" />
            <span className="text-xs font-medium text-[#37322F]">Social Proof</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#49423D] tracking-tight">
            Confidence backed by results
          </h2>
          <p className="text-sm sm:text-base text-[#605A57]">
            Our customers achieve more each day because their tools are simple, powerful, and clear.
          </p>
        </div>

        <div className="max-w-[700px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgba(55,50,47,0.12)] rounded-lg overflow-hidden border border-[rgba(55,50,47,0.12)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 sm:h-24 bg-white flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#37322F]/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#37322F]/30" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#37322F]">{integrations[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 border-b border-[rgba(55,50,47,0.12)]">
        <div className="max-w-[616px] mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-[rgba(2,6,23,0.08)]">
            <Layers className="w-3 h-3 text-[#37322F]" />
            <span className="text-xs font-medium text-[#37322F]">Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#49423D] tracking-tight">
            Built for absolute clarity and focused work
          </h2>
          <p className="text-sm sm:text-base text-[#605A57]">
            Stay focused with tools that organize, connect, and turn information into confident decisions.
          </p>
        </div>

        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(55,50,47,0.12)] rounded-lg overflow-hidden border border-[rgba(55,50,47,0.12)]">
          {[
            { icon: Zap, title: "Smart. Simple. Brilliant.", desc: "Your data is beautifully organized so you see everything clearly without the clutter.", color: "from-amber-500/10 to-orange-500/10" },
            { icon: Code2, title: "Your work, in sync", desc: "Every update flows instantly across your team and keeps collaboration effortless and fast.", color: "from-blue-500/10 to-cyan-500/10" },
            { icon: Layers, title: "Effortless integration", desc: "All your favorite tools connect in one place and work together seamlessly by design.", color: "from-purple-500/10 to-pink-500/10" },
            { icon: BarChart3, title: "Numbers that speak", desc: "Track growth with precision and turn raw data into confident decisions you can trust.", color: "from-green-500/10 to-emerald-500/10" },
          ].map((f, i) => (
            <div key={i} className="bg-[#F7F5F3] p-6 md:p-8 lg:p-10 space-y-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                <f.icon className="w-5 h-5 text-[#37322F]" />
              </div>
              <h3 className="text-lg font-semibold text-[#37322F]">{f.title}</h3>
              <p className="text-sm text-[#605A57] leading-relaxed">{f.desc}</p>
              <div className="h-24 bg-white/50 rounded-lg flex items-center justify-center">
                <f.icon className="w-8 h-8 text-[#37322F]/20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 border-b border-[rgba(55,50,47,0.12)]">
        <div className="max-w-[616px] mx-auto text-center space-y-4 mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#49423D] tracking-tight">Loved by teams everywhere</h2>
          <p className="text-sm sm:text-base text-[#605A57]">See what our customers have to say about their experience.</p>
        </div>

        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-[rgba(55,50,47,0.12)] bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-[#49423D] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-[#37322F]/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#37322F]">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#37322F]">{t.name}</p>
                    <p className="text-xs text-[#605A57]">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 border-b border-[rgba(55,50,47,0.12)]">
        <div className="max-w-[616px] mx-auto text-center space-y-4 mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#49423D] tracking-tight">Simple, transparent pricing</h2>
          <p className="text-sm sm:text-base text-[#605A57]">Choose the plan that works best for your team.</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm ${!pricingAnnual ? "text-[#37322F] font-medium" : "text-[#605A57]"}`}>Monthly</span>
          <button onClick={() => setPricingAnnual(!pricingAnnual)} className="w-10 h-5 rounded-full bg-[#37322F] relative transition-colors">
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${pricingAnnual ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm ${pricingAnnual ? "text-[#37322F] font-medium" : "text-[#605A57]"}`}>
            Annual <span className="text-green-600 text-xs">(save 20%)</span>
          </span>
        </div>

        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Starter", price: 0, desc: "Perfect for small teams", features: ["Up to 3 members", "Basic incident tracking", "Email support", "Community access"] },
            { name: "Professional", price: pricingAnnual ? 16 : 20, desc: "For growing teams", features: ["Up to 25 members", "Advanced analytics", "API access", "Priority support", "Custom integrations"], popular: true },
            { name: "Enterprise", price: pricingAnnual ? 160 : 200, desc: "For large organizations", features: ["Unlimited members", "SSO & SAML", "Dedicated account manager", "24/7 support", "SLA guarantee", "Custom contracts"] },
          ].map((plan, i) => (
            <Card key={i} className={`border-[rgba(55,50,47,0.12)] ${plan.popular ? "ring-2 ring-[#37322F] shadow-lg" : ""}`}>
              <CardContent className="p-6 space-y-4">
                {plan.popular && <span className="text-xs font-medium text-[#37322F] bg-[#37322F]/10 px-2 py-0.5 rounded-full">Most Popular</span>}
                <h3 className="text-lg font-semibold text-[#37322F]">{plan.name}</h3>
                <p className="text-sm text-[#605A57]">{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-[#37322F]">${plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-[#605A57]">/month</span>}
                </div>
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#605A57]">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? "bg-[#37322F] hover:bg-[#37322F]/90" : ""}`} variant={plan.popular ? "default" : "outline"} onClick={() => navigate("/auth/register")}>
                  {plan.price === 0 ? "Get started" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 border-b border-[rgba(55,50,47,0.12)]">
        <div className="max-w-[616px] mx-auto text-center space-y-4 mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#49423D] tracking-tight">Frequently asked questions</h2>
          <p className="text-sm sm:text-base text-[#605A57]">Everything you need to know about InstaAlert.</p>
        </div>

        <div className="max-w-[700px] mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-[rgba(55,50,47,0.12)] rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium text-[#37322F]">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-[#605A57]">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-[600px] mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-[#37322F]">Ready to get started?</h2>
          <p className="text-sm sm:text-base text-[#605A57]">Join thousands of teams already using InstaAlert to streamline their workflow.</p>
          <Button size="lg" className="rounded-full bg-[#37322F] hover:bg-[#37322F]/90 px-10 h-12 text-base" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth/register")}>
            {isAuthenticated ? "Go to Dashboard" : "Start for free"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(55,50,47,0.12)] py-12 px-4">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <span className="text-xl font-semibold text-[#49423D]">InstaAlert</span>
            <p className="text-sm text-[rgba(73,66,61,0.90)]">Coding made effortless</p>
            <div className="flex gap-4">
              <a href="#" className="text-[#49423D] hover:opacity-70 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-[#49423D] hover:opacity-70 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
              </a>
              <a href="#" className="text-[#49423D] hover:opacity-70 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 20.566-1.589 24-6.086 24-12 0-6.627-5.374-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[rgba(73,66,61,0.50)]">Product</p>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Features</a>
                <a href="#pricing" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Pricing</a>
                <a href="#" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Integrations</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[rgba(73,66,61,0.50)]">Company</p>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">About</a>
                <a href="#" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Blog</a>
                <a href="#" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Careers</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[rgba(73,66,61,0.50)]">Resources</p>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Documentation</a>
                <a href="#faq" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">FAQ</a>
                <a href="#" className="block text-sm text-[#49423D] hover:text-[#37322F] transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 max-w-[900px] mx-auto" />

        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-xs text-[#605A57]">&copy; {new Date().getFullYear()} InstaAlert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
