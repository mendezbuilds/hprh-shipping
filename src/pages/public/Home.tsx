import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Search, Clock, Globe, PawPrint,
  FileText, Laptop, Sofa, Heart, Star, ArrowRight, CheckCircle2,
  MapPin, Phone, Mail, Sparkles, ShieldCheck
} from 'lucide-react';
import Container from '../../components/ui/Container';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  { icon: PawPrint, label: 'Pets & Rescues', color: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20', desc: 'Dogs, cats & rescue pets — USDA-compliant, climate-controlled transport with certified handlers.' },
  { icon: FileText, label: 'Critical Documents', color: 'bg-sky-500/10 text-sky-600 border border-sky-500/20', desc: 'Tamper-evident, chain-of-custody handling for legal, medical, and high-priority paperwork.' },
  { icon: Laptop, label: 'Electronics & Tech', color: 'bg-violet-500/10 text-violet-600 border border-violet-500/20', desc: 'Anti-static, shock-cushioned delivery with declared value coverage for sensitive hardware.' },
  { icon: Sofa, label: 'Furniture & Estates', color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', desc: 'White-glove blanket wrap and two-person teams for furniture and estate distribution.' },
  { icon: Heart, label: 'Fragile Valuables', color: 'bg-rose-500/10 text-rose-600 border border-rose-500/20', desc: 'Custom crating and gentle transit for artwork, vintage heirlooms, and delicate items.' },
  { icon: Package, label: 'Commercial Cargo', color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', desc: 'Palletized freight, express parcels, and cross-border commercial logistics.' },
];

const STEPS = [
  { num: '01', title: 'Describe Your Shipment', desc: 'Select your cargo category, package dimensions, weight, and any specialized handling needs.' },
  { num: '02', title: 'Instant Live Quote', desc: 'Enter origin and destination addresses. Our routing engine calculates accurate distance and pricing instantly.' },
  { num: '03', title: 'Confirm & Deposit', desc: 'Review your breakdown, provide transport fee payment proof, and submit your security deposit seamlessly.' },
  { num: '04', title: 'Live GPS Tracking', desc: 'Our transport dispatch coordinates transit. Track milestone events and delivery progress online 24/7.' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Fully Insured Transit', desc: 'Every cargo and passenger is insured. Declare your value and transit with absolute confidence.' },
  { icon: Clock, title: 'Real-Time Tracking Events', desc: 'Instant status checkpoints from initial pickup to sorting hubs and destination sign-off.' },
  { icon: Globe, title: 'Domestic & Global Reach', desc: 'Express land freight for regional corridors and bonded air freight for international consignments.' },
  { icon: PawPrint, title: 'Compassionate Pet Travel', desc: 'Climate-monitored vehicles, mandatory hydration stops, and veterinary health cert verification.' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    location: 'Texas → Florida',
    quote: 'My rescue golden retriever arrived calm, happy, and well cared for. The live tracking checkpoints every step gave my family immense peace of mind. Outstanding team!',
    category: 'Pet Transport',
  },
  {
    name: 'Daniel K.',
    location: 'New York → London',
    quote: 'Shipped time-critical adoption paperwork internationally and it arrived ahead of schedule with complete chain-of-custody. Flawless communication from dispatch.',
    category: 'Documents',
  },
  {
    name: 'Priya R.',
    location: 'California → Texas',
    quote: 'Moved fragile antique display cases across states without a single scratch. The white-glove handlers followed instructions down to the letter. Highly recommend!',
    category: 'Fragile Cargo',
  },
];

const Home: React.FC = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '(409) 422-8478',
    email: 'transport@rescue4paws.org'
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('key, value')
          .in('key', ['contact_phone', 'contact_email', 'transport_email']);

        if (error) throw error;

        if (data) {
          const info = {
            phone: '(409) 422-8478',
            email: 'transport@rescue4paws.org'
          };
          data.forEach((row: any) => {
            if (row.key === 'contact_phone' && row.value) info.phone = row.value;
            if (row.key === 'transport_email' && row.value) {
              info.email = row.value;
            } else if (row.key === 'contact_email' && row.value) {
              info.email = row.value.replace(/adoption@/i, 'transport@');
            }
          });
          setContactInfo(info);
        }
      } catch (err) {
        console.error('Error fetching contact info from settings:', err);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">

      {/* HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rescue4paws Dedicated Logistics Network</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Safe Transport For{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">
                Every Precious Cargo.
              </span>
              <br />
              <span className="text-slate-300">Tracked in Real Time.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
              Rescue4paws Transport is the dedicated shipping and logistics network of{' '}
              <a href="https://rescue4paws.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-indigo-400/40">
                Rescue4paws
              </a>
              . Whether moving a rescue pet to their loving forever family, expediting sensitive documents, or freighting valuable cargo — we deliver white-glove care, temperature-controlled safety, and total peace of mind.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/ship"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:-translate-y-0.5"
              >
                <Package className="w-4 h-4" />
                <span>Create Shipment</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-200 backdrop-blur-xs"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>Track a Shipment</span>
              </Link>
            </div>
          </div>
        </Container>

        {/* Transition divider to slate-50 */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-slate-50 pointer-events-none" />
      </section>

      {/* STATS STRIP */}
      <section className="bg-white border-y border-slate-200/80 py-8 relative z-20 shadow-xs">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '5,000+', label: 'Shipments Completed' },
              { value: '99.4%', label: 'On-Time Arrival' },
              { value: '50+', label: 'Countries & Regions' },
              { value: '24/7', label: 'Live GPS & Dispatch' },
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="font-display text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* WHAT WE SHIP */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 inline-block mb-3">
              Versatile Logistics
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Every Category, Handled With Expert Care
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              From companion pets requiring climate-controlled comfort to high-value artwork and express documents, our vetted carriers ensure your items reach their destination safely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      {cat.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                    <span>Explore options</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/ship"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-200 shadow-sm"
            >
              <span>Start Your Shipment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-24 bg-white border-y border-slate-200/80">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 inline-block mb-3">
              Simple 4-Step Flow
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              How Transport Works
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Transparent quoting, straightforward proof submission, and uninterrupted live tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 h-full space-y-3 relative hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="font-display text-3xl font-black bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                    {step.num}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURES & LIVE TRACKING CARD MOCKUP */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 inline-block">
                Why Shippers Trust Us
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Logistics Engineered For{' '}
                <span className="text-indigo-600">Safety & Transparency</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We believe shipping should never be a mystery. As part of the Rescue4paws network, every shipment receives a unique tracking number, verified custody milestones, and a dedicated dispatch coordinator keeping you informed.
              </p>

              <div className="space-y-4 pt-2">
                {FEATURES.map(feat => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.title} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900">{feat.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Tracking Card Mockup */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900 text-white rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Live Consignment</p>
                    <p className="font-mono text-xl font-bold text-white tracking-wide">SHP-2026-4827</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full animate-pulse-soft flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    In Transit
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { status: 'Shipment Created & Manifest Booked', time: 'June 28 • 9:00 AM', done: true },
                    { status: 'Climate-Controlled Vehicle Picked Up', time: 'June 28 • 2:45 PM', done: true },
                    { status: 'En Route to Regional Sorting Hub', time: 'June 29 • 6:10 AM', done: true },
                    { status: 'Final Mile Delivery & Sign-off', time: 'Expected Tomorrow', done: false },
                  ].map(event => (
                    <div key={event.status} className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        event.done ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-600'
                      }`}>
                        {event.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${event.done ? 'text-white' : 'text-slate-400'}`}>
                          {event.status}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    to="/track"
                    className="block w-full text-center bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-semibold py-3 rounded-full transition-all duration-200 shadow-md shadow-indigo-600/30"
                  >
                    Track Any Shipment Live
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* CUSTOMER STORIES */}
      <section className="py-20 sm:py-24 bg-white border-y border-slate-200/80">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 inline-block mb-3">
              Verified Feedback
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Trusted by Hundreds of Families & Shippers
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Read first-hand accounts from pet adopters, legal firms, and everyday shippers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 space-y-4 flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex text-amber-400 gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {t.location}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/60 px-2.5 py-1 rounded-full">
                    {t.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative space-y-6 max-w-2xl mx-auto z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full inline-block">
                Start Shipping Today
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Get an Instant Quote in{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                  Under 2 Minutes
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Zero guesswork, transparent distance calculation, and dedicated care. Book your shipment now or check an existing tracking reference.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  to="/ship"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:scale-105"
                >
                  <Package className="w-4 h-4" />
                  <span>Create Shipment</span>
                </Link>
                <Link
                  to="/track"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm px-8 py-3.5 rounded-full transition-all duration-200"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Shipment</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CONTACT / SUPPORT STRIP */}
      <section className="bg-white border-t border-slate-200/80 py-12">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Have Questions About a Route?</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Our logistics coordinators are available Monday through Saturday. We are glad to answer route questions, pet travel protocol questions, and high-value cargo handling details.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href={`mailto:${contactInfo.email}`}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-full transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>{contactInfo.email}</span>
              </a>
              <a
                href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>{contactInfo.phone}</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
};

export default Home;
