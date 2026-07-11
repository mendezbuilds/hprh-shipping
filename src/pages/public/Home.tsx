import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Search, Shield, Clock, Globe, PawPrint,
  FileText, Laptop, Sofa, Heart, Star, ArrowRight, CheckCircle2,
  MapPin, Phone, Mail
} from 'lucide-react';
import Container from '../../components/ui/Container';

// ——————————————————————————————————————————
// PLACEHOLDER COPY — edit all text in this file
// to match your actual service details.
// ——————————————————————————————————————————

const CATEGORIES = [
  { icon: PawPrint, label: 'Pets', color: 'bg-hprh-sage/10 text-hprh-sage', desc: 'Dogs, cats & domestic animals — safe, climate-controlled transport' },
  { icon: FileText, label: 'Documents', color: 'bg-hprh-gold/10 text-hprh-gold/80', desc: 'Secure, tracked handling of sensitive legal & business documents' },
  { icon: Laptop, label: 'Electronics', color: 'bg-blue-50 text-blue-600', desc: 'Padded, insured delivery for fragile electronics & devices' },
  { icon: Sofa, label: 'Furniture', color: 'bg-orange-50 text-orange-600', desc: 'Heavy-lift specialists for furniture & large household items' },
  { icon: Heart, label: 'Fragile Items', color: 'bg-pink-50 text-pink-600', desc: 'Artwork, antiques & valuables handled with expert care' },
  { icon: Package, label: 'Business Cargo', color: 'bg-hprh-clay/10 text-hprh-clay', desc: 'Pallet, bulk & commercial freight — domestic & international' },
];

const STEPS = [
  { num: '01', title: 'Describe Your Shipment', desc: 'Tell us what you\'re sending — category, weight, dimensions, and any special requirements.' },
  { num: '02', title: 'Get an Instant Quote', desc: 'Enter your pickup and destination addresses. Our system calculates distance and gives you a transparent price.' },
  { num: '03', title: 'Confirm & Pay', desc: 'Review your quote, submit proof of transport fee payment, and place your security deposit.' },
  { num: '04', title: 'We Handle the Rest', desc: 'Our team coordinates pickup. You receive a unique tracking number and can monitor every step online.' },
];

const FEATURES = [
  { icon: Shield, title: 'Fully Insured', desc: 'Every shipment is covered. Declare your item\'s value and ship with confidence.' },
  { icon: Clock, title: 'Real-Time Tracking', desc: 'Get live status updates from pickup to delivery — no more wondering where your package is.' },
  { icon: Globe, title: 'Domestic & International', desc: 'Land freight for local routes. Air freight for cross-border and international destinations.' },
  { icon: Star, title: 'Specialist Pet Transport', desc: 'USDA-compliant, climate-controlled pet travel with certified handlers and health checks.' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    location: 'Texas → Florida',
    quote: 'My labrador arrived safe and happy. The tracking updates every step of the way gave me so much peace of mind. Would use HPRH Transport again without hesitation!',
    category: 'Pet Transport',
  },
  {
    name: 'Daniel K.',
    location: 'New York → London',
    quote: 'Shipped important documents internationally and they arrived perfectly. The admin team was incredibly responsive. Impressive service.',
    category: 'Documents',
  },
  {
    name: 'Priya R.',
    location: 'California → Texas',
    quote: 'Moved my antique collection across states with zero damage. The special handling instructions were followed to the letter. Outstanding!',
    category: 'Artwork & Antiques',
  },
];

// ——————————————————————————————————————————

const Home: React.FC = () => {
  return (
    <div className="font-sans text-hprh-pine">

      {/* ─── HERO ─── */}
      <section className="relative bg-hprh-pine overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #FBF7EE 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-hprh-sage/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-hprh-clay/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

        <Container className="relative py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold bg-hprh-sage/10 border border-hprh-sage/20 px-3 py-1.5 rounded mb-5">
              Trusted Transport Partner
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-hprh-paper leading-tight mb-6">
              Ship Anything,{' '}
              <span className="text-hprh-clay">Anywhere.</span>
              <br />
              <span className="text-hprh-gold">Track Every Step.</span>
            </h1>
            <p className="text-sm sm:text-base text-hprh-paper/70 leading-relaxed max-w-xl mb-8">
              {/* ↓ PLACEHOLDER — edit this paragraph to describe your service */}
              HPRH Transport is the trusted logistics arm of Happy Paws Rescue Haven.
              Whether you're shipping a beloved pet across the country, sending fragile artwork
              overseas, or moving business cargo — we handle every shipment with the care and
              transparency your items deserve. Fully tracked. Fully insured. Always reliable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/ship"
                className="inline-flex items-center gap-2 bg-hprh-clay text-hprh-paper font-mono font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded hover:bg-hprh-clay/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Package className="w-4 h-4" />
                Create Shipment
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 border-2 border-hprh-paper/20 text-hprh-paper font-mono font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded hover:border-hprh-sage hover:text-hprh-sage transition-all"
              >
                <Search className="w-4 h-4" />
                Track a Shipment
              </Link>
            </div>
          </div>
        </Container>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#FBF7EE" />
          </svg>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="bg-hprh-paper-dark border-y border-hprh-pine/10 py-6">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '5,000+', label: 'Shipments Delivered' },
              { value: '98%', label: 'On-Time Rate' },
              { value: '50+', label: 'Countries Served' },
              { value: '24/7', label: 'Tracking & Support' },
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="font-display text-3xl font-extrabold text-hprh-clay">{stat.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── WHAT WE SHIP ─── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="text-center mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold">What We Ship</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-hprh-pine mt-2">
              Every Category, Handled With Care
            </h2>
            <p className="text-sm text-hprh-pine/60 max-w-xl mx-auto mt-3 leading-relaxed">
              {/* ↓ PLACEHOLDER */}
              From living pets to priceless antiques, our specialist teams and vetted carriers
              ensure your items reach their destination safely and on time.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-6 hover:border-hprh-sage/40 hover:shadow-md transition-all group"
                >
                  <div className={`w-11 h-11 rounded-lg ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-hprh-pine mb-1">{cat.label}</h3>
                  <p className="text-xs text-hprh-pine/60 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/ship"
              className="inline-flex items-center gap-2 bg-hprh-sage text-hprh-paper font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded hover:bg-hprh-sage/90 transition-all"
            >
              Start a Shipment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 sm:py-20 bg-hprh-paper-dark border-y border-hprh-pine/10">
        <Container>
          <div className="text-center mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold">Simple Process</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-hprh-pine mt-2">How It Works</h2>
            <p className="text-sm text-hprh-pine/60 max-w-lg mx-auto mt-3 leading-relaxed">
              {/* ↓ PLACEHOLDER */}
              Four straightforward steps from request to delivery. No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="bg-hprh-paper border border-hprh-pine/10 rounded-xl p-6 h-full space-y-3">
                  <div className="font-mono text-3xl font-extrabold text-hprh-pine/10">{step.num}</div>
                  <h3 className="font-display font-bold text-lg text-hprh-pine">{step.title}</h3>
                  <p className="text-xs text-hprh-pine/60 leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="w-5 h-5 text-hprh-sage/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold">Why Choose Us</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-hprh-pine">
                Shipping You Can{' '}
                <span className="text-hprh-clay">Actually Trust</span>
              </h2>
              <p className="text-sm text-hprh-pine/60 leading-relaxed">
                {/* ↓ PLACEHOLDER */}
                We built HPRH Transport because reliable, transparent shipping shouldn't be a luxury.
                Every shipment gets a unique tracking number, real-time status updates, and a
                dedicated team making sure your items arrive exactly as they left.
              </p>
              <div className="space-y-4">
                {FEATURES.map(feat => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-hprh-sage/10 text-hprh-sage rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-hprh-pine">{feat.title}</h4>
                        <p className="text-xs text-hprh-pine/60 leading-relaxed mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking preview card */}
            <div className="bg-hprh-pine rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-hprh-sage/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-hprh-paper/40">Tracking Number</p>
                  <p className="font-mono text-lg font-bold text-hprh-paper">SHP-2026-4827</p>
                </div>
                <span className="bg-hprh-sage/20 text-hprh-sage border border-hprh-sage/30 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded animate-pulse-soft">
                  In Transit
                </span>
              </div>
              <div className="border-t border-hprh-paper/10 pt-4 space-y-3">
                {[
                  { status: 'Shipment Created', time: 'Jun 28 · 9:00 AM', done: true },
                  { status: 'Picked Up', time: 'Jun 28 · 2:45 PM', done: true },
                  { status: 'In Transit', time: 'Jun 29 · 6:10 AM', done: true },
                  { status: 'Out for Delivery', time: 'Expected Jul 1', done: false },
                ].map(event => (
                  <div key={event.status} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${event.done ? 'bg-hprh-sage' : 'bg-hprh-paper/10 border border-hprh-paper/20'}`}>
                      {event.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${event.done ? 'text-hprh-paper' : 'text-hprh-paper/40'}`}>{event.status}</p>
                      <p className="text-[10px] text-hprh-paper/30 font-mono">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/track"
                className="block w-full text-center bg-hprh-clay text-hprh-paper text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded hover:bg-hprh-clay/90 transition-all mt-2"
              >
                Track Your Shipment
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-16 sm:py-20 bg-hprh-paper-dark border-y border-hprh-pine/10">
        <Container>
          <div className="text-center mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold">Customer Stories</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-hprh-pine mt-2">
              Trusted by Thousands
            </h2>
            <p className="text-sm text-hprh-pine/60 max-w-md mx-auto mt-3">
              {/* ↓ PLACEHOLDER — replace with real testimonials */}
              Real stories from real customers who've shipped with us.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-hprh-paper border border-hprh-pine/10 rounded-xl p-6 space-y-4">
                <div className="flex text-hprh-gold gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-hprh-pine/80 leading-relaxed italic">"{t.quote}"</p>
                <div className="border-t border-hprh-pine/10 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-hprh-pine">{t.name}</p>
                    <p className="text-[10px] text-hprh-pine/50 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {t.location}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider bg-hprh-sage/10 text-hprh-sage px-2 py-1 rounded font-bold">
                    {t.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="bg-hprh-pine rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #FBF7EE 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            <div className="relative space-y-6 max-w-2xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold">Ready to Ship?</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-hprh-paper">
                Get Your Quote in{' '}
                <span className="text-hprh-gold">Under 2 Minutes</span>
              </h2>
              <p className="text-sm text-hprh-paper/60 leading-relaxed">
                {/* ↓ PLACEHOLDER */}
                No lengthy forms, no phone calls. Enter your shipment details,
                get an instant distance-based quote, and book with confidence.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  to="/ship"
                  className="inline-flex items-center gap-2 bg-hprh-clay text-hprh-paper font-mono font-bold text-sm uppercase tracking-wider px-8 py-3.5 rounded hover:bg-hprh-clay/90 transition-all shadow-lg"
                >
                  <Package className="w-4 h-4" /> Create Shipment
                </Link>
                <Link
                  to="/track"
                  className="inline-flex items-center gap-2 border-2 border-hprh-paper/20 text-hprh-paper font-mono font-bold text-sm uppercase tracking-wider px-8 py-3.5 rounded hover:border-hprh-sage hover:text-hprh-sage transition-all"
                >
                  <Search className="w-4 h-4" /> Track Shipment
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── CONTACT STRIP ─── */}
      <section className="bg-hprh-paper-dark border-t border-hprh-pine/10 py-10">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl text-hprh-pine mb-1">Need Help?</h3>
              <p className="text-xs text-hprh-pine/60">
                {/* ↓ PLACEHOLDER */}
                Our support team is available Monday – Saturday, 8am – 6pm. We're here to assist with quotes, shipment questions, and tracking issues.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href="mailto:transport@happypawsrescuehaven.com"
                className="inline-flex items-center gap-2 border border-hprh-pine/20 text-hprh-pine text-xs font-mono px-4 py-2.5 rounded hover:border-hprh-sage hover:text-hprh-sage transition-all"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>
              <a
                href="tel:+17652248981"
                className="inline-flex items-center gap-2 bg-hprh-sage text-hprh-paper text-xs font-mono font-bold px-4 py-2.5 rounded hover:bg-hprh-sage/90 transition-all"
              >
                <Phone className="w-4 h-4" /> +1 (765) 224-8981
              </a>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
};

export default Home;
