import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="bg-hprh-pine text-hprh-paper mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-hprh-sage rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-hprh-paper" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-hprh-paper">HPRH Transport</div>
              <div className="text-[10px] uppercase tracking-widest text-hprh-sage font-bold">Shipping & Logistics</div>
            </div>
          </div>
          <p className="text-xs text-hprh-paper/60 leading-relaxed max-w-xs">
            Reliable, tracked shipping for pets, documents, electronics, and more.
            A service of Happy Paws Rescue Haven.
          </p>
          <a
            href={import.meta.env.VITE_MAIN_SITE_URL || 'https://happypawsrescuehaven.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-hprh-sage hover:text-hprh-gold transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Main Website
          </a>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-hprh-paper/50 font-bold">Quick Links</h3>
          <ul className="flex flex-col gap-2 text-xs text-hprh-paper/60">
            <li><Link to="/" className="hover:text-hprh-sage transition-colors">Home</Link></li>
            <li><Link to="/ship" className="hover:text-hprh-sage transition-colors">Create Shipment</Link></li>
            <li><Link to="/track" className="hover:text-hprh-sage transition-colors">Track Shipment</Link></li>
            <li><Link to="/admin/login" className="hover:text-hprh-sage transition-colors">Staff Portal</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-hprh-paper/50 font-bold">Contact Us</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-xs text-hprh-paper/60">
              <Mail className="w-3.5 h-3.5 text-hprh-sage flex-shrink-0" />
              <span>transport@happypawsrescuehaven.com</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-hprh-paper/60">
              <Phone className="w-3.5 h-3.5 text-hprh-sage flex-shrink-0" />
              <span>+1 (765) 224-8981</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-hprh-paper/60">
              <MapPin className="w-3.5 h-3.5 text-hprh-sage flex-shrink-0" />
              <span>Available Nationwide & International</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-hprh-paper/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] font-mono text-hprh-paper/40">
          © {new Date().getFullYear()} Happy Paws Rescue Haven Transport. All rights reserved.
        </p>
        <p className="text-[10px] font-mono text-hprh-paper/30">
          Serving domestic & international routes
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
