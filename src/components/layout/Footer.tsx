import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ShieldCheck, Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MAIN_SITE_URL = 'https://rescue4paws.org';

export const Footer: React.FC = () => {
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
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 py-16 font-sans mt-auto relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start">

          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline tracking-tight">
                <span className="font-display text-2xl font-extrabold text-white leading-tight">
                  Rescue
                </span>
                <span className="font-display text-2xl font-black bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent leading-tight ml-0.5">
                  4paws
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-sm">
              Rescue4paws Transport is the dedicated shipping and logistics network of Rescue4paws. Providing climate-controlled pet travel, sensitive documents delivery, and specialized cargo nationwide and internationally.
            </p>

            <div className="pt-1">
              <a
                href={MAIN_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3.5 py-2 rounded-full transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visit Main Website ({MAIN_SITE_URL.replace('https://', '')})</span>
              </a>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified 501(c)(3) Network</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <Heart className="w-3.5 h-3.5 fill-rose-400" />
                <span>100% Safe Pet Transit</span>
              </div>
            </div>
          </div>

          {/* Links grid */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h5 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
                Transport
              </h5>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/ship" className="hover:text-indigo-400 transition-colors">Create Shipment</Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-indigo-400 transition-colors">Track Shipment</Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Staff Portal</Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
                Rescue4paws
              </h5>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <a href={`${MAIN_SITE_URL}/adopt`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                    Available Pets <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href={`${MAIN_SITE_URL}/volunteer`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                    Foster a Pet <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href={`${MAIN_SITE_URL}/donate`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                    Donate to Care <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href={`${MAIN_SITE_URL}/about`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                    About Our Mission <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact details */}
          <div className="md:col-span-3 space-y-4">
            <h5 className="text-xs uppercase tracking-widest font-bold text-white">
              Contact & Support
            </h5>
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-400">
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{contactInfo.email}</span>
              </a>
              <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors">
                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{contactInfo.phone}</span>
              </a>
              <div className="flex items-center gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Available Nationwide & International</span>
              </div>
            </div>
            <div className="pt-2 font-display italic text-indigo-300 text-xs">
              “Safe, compassionate journeys for every precious life.”
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Rescue4paws Transport Network. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
              rescue4paws.org
            </a>
            <span>Terms of Transit</span>
            <span>Non-Profit Verification</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
