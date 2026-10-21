import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Container from '../../components/ui/Container';
import {
  Search, AlertTriangle, Loader2, CheckCircle2, MapPin,
  PawPrint, Info
} from 'lucide-react';
import type { Shipment, ShipmentTrackingEvent, TrackingStatus } from '../../lib/types';
import { TRACKING_STATUS_LABELS, CATEGORY_LABELS } from '../../lib/types';

// Status configuration: color and icon per status
const STATUS_CONFIG: Record<TrackingStatus, { dot: string; badge: string; label: string }> = {
  SHIPMENT_CREATED:           { dot: 'bg-slate-400 border-slate-300', badge: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Shipment Created' },
  SHIPMENT_RECEIVED:          { dot: 'bg-sky-500 border-sky-400', badge: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Shipment Received' },
  PICKED_UP:                  { dot: 'bg-indigo-500 border-indigo-400', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Picked Up' },
  IN_TRANSIT:                 { dot: 'bg-indigo-600 border-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'In Transit' },
  ARRIVED_AT_SORTING_CENTER:  { dot: 'bg-sky-600 border-sky-500', badge: 'bg-sky-50 text-sky-700 border-sky-200', label: 'At Sorting Center' },
  CUSTOMS_CLEARANCE:          { dot: 'bg-blue-600 border-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Customs Clearance' },
  CUSTOMS_HOLD:               { dot: 'bg-amber-500 border-amber-400', badge: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Customs Hold' },
  OUT_FOR_DELIVERY:           { dot: 'bg-emerald-500 border-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Out for Delivery' },
  DELIVERED:                  { dot: 'bg-emerald-600 border-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Delivered' },
  DELAYED:                    { dot: 'bg-rose-500 border-rose-400', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Delayed' },
  RETURNED_TO_SENDER:         { dot: 'bg-rose-600 border-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Returned to Sender' },
};

const TrackingPage: React.FC = () => {
  const { trackingNumber: paramTracking } = useParams<{ trackingNumber?: string }>();
  const navigate = useNavigate();

  const [input, setInput] = useState(paramTracking || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<ShipmentTrackingEvent[]>([]);

  // Auto-search if URL has a tracking number
  useEffect(() => {
    if (paramTracking) doSearch(paramTracking);
  }, [paramTracking]);

  const doSearch = async (trackingNum: string) => {
    const clean = trackingNum.trim().toUpperCase();
    if (!clean) { setError('Please enter a tracking number.'); return; }

    try {
      setLoading(true);
      setError(null);
      setShipment(null);
      setEvents([]);

      const { data, error: dbErr } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', clean)
        .maybeSingle();

      if (dbErr) throw dbErr;

      if (!data) {
        setError("We couldn't find a shipment with that tracking number. Please verify the code and try again.");
        return;
      }

      const { data: eventsData, error: eventsErr } = await supabase
        .from('shipment_tracking_events')
        .select('*')
        .eq('shipment_id', data.id)
        .order('event_time', { ascending: false });

      if (eventsErr) throw eventsErr;

      setShipment(data as Shipment);
      setEvents((eventsData || []) as ShipmentTrackingEvent[]);
    } catch (err: unknown) {
      setError("We couldn't find that tracking number. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/track/${input.trim().toUpperCase()}`, { replace: true });
    doSearch(input);
  };

  const currentStatusCfg = shipment ? (STATUS_CONFIG[shipment.current_status] || STATUS_CONFIG['SHIPMENT_CREATED']) : null;

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <Container className="max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-full inline-block">
            Rescue4paws Real-Time Tracking
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
            Track Your Shipment
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Enter your tracking code to view verified milestones, carrier location, and estimated delivery timeline.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-7 max-w-md mx-auto relative overflow-hidden">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Tracking Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="e.g. SHP-2026-4827"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl py-3 px-4 pr-10 text-xs font-mono font-bold placeholder-slate-400 text-slate-900 uppercase outline-none transition-all"
                  required
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold py-3 px-6 rounded-full uppercase tracking-wider transition-all duration-200 shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching Database...</>
              ) : (
                'Track Shipment'
              )}
            </button>
          </form>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-start gap-3 mt-4 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-rose-700 block">Record Not Found</span>
                <p className="leading-relaxed font-sans mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Result */}
        {shipment && currentStatusCfg && (
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-lg p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-sky-500" />

            {/* Docket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block mb-0.5">
                  Consignment Reference
                </span>
                <h2 className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
                  {shipment.tracking_number}
                </h2>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">
                  Booked on {new Date(shipment.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border shadow-2xs ${currentStatusCfg.badge}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStatusCfg.dot}`} />
                  {currentStatusCfg.label}
                </span>
              </div>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Category</span>
                <div className="mt-1 font-semibold text-slate-900 flex items-center gap-1">
                  {shipment.shipment_category === 'pets' && <PawPrint className="w-3.5 h-3.5 text-indigo-600 inline" />}
                  {CATEGORY_LABELS[shipment.shipment_category]}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Weight</span>
                <span className="mt-1 font-semibold text-slate-900 block">{shipment.weight_kg} kg</span>
              </div>
              {(shipment.length_cm || shipment.width_cm || shipment.height_cm) && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Dimensions</span>
                  <span className="mt-1 font-semibold text-slate-900 block">
                    {shipment.length_cm} × {shipment.width_cm} × {shipment.height_cm} cm
                  </span>
                </div>
              )}
              {shipment.estimated_delivery_date && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Est. Delivery</span>
                  <span className="mt-1 font-semibold text-indigo-600 block">
                    {new Date(shipment.estimated_delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {shipment.distance_km && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Calculated Route</span>
                  <span className="mt-1 font-semibold text-slate-900 block">{Number(shipment.distance_km).toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Route */}
            {(shipment.pickup_address || shipment.destination_address) && (
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Origin / Pickup</span>
                    <p className="text-slate-800 font-semibold">{shipment.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Destination</span>
                    <p className="text-slate-800 font-semibold">{shipment.destination_address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pet info */}
            {shipment.shipment_category === 'pets' && shipment.pet_name && (
              <div className="flex items-center gap-4 bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-600/20">
                  <PawPrint className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold block">Pet Passenger</span>
                  <span className="font-display text-xl font-extrabold text-slate-900">{shipment.pet_name}</span>
                  <span className="text-xs text-slate-600 block font-sans">
                    {shipment.pet_breed || shipment.pet_species} {shipment.pet_age ? `• ${shipment.pet_age}` : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {shipment.admin_notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-semibold text-amber-800 block">Dispatch Notes</span>
                  <p className="text-xs text-amber-900 leading-relaxed mt-0.5">{shipment.admin_notes}</p>
                </div>
              </div>
            )}

            {/* Tracking Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-900 border-b border-slate-100 pb-2">
                Milestone Timeline
              </h3>

              {events.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-xs text-slate-500 italic text-center">
                  Tracking events will appear here as your shipment progresses through checkpoints.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-indigo-200 py-1 ml-2">
                  {events.map(event => {
                    const cfg = STATUS_CONFIG[event.status as TrackingStatus] || STATUS_CONFIG['SHIPMENT_CREATED'];
                    return (
                      <div key={event.id} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${cfg.dot}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${cfg.badge}`}>
                              {TRACKING_STATUS_LABELS[event.status as TrackingStatus] || event.status}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatDate(event.event_time)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="text-xs font-semibold text-slate-800">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal mr-1">Location:</span>
                              {event.location}
                            </div>
                          )}
                          {event.notes && (
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delivered Banner */}
            {shipment.current_status === 'DELIVERED' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-bottom-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0 animate-bounce">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="uppercase font-bold text-emerald-900 block text-xs">Delivery Confirmed</span>
                  <p className="text-xs leading-relaxed font-sans text-emerald-800 mt-0.5">
                    Your consignment has reached its recipient successfully. Thank you for choosing Rescue4paws Transport Network!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </Container>
    </div>
  );
};

export default TrackingPage;
