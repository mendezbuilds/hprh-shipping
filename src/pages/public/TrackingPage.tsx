import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Container from '../../components/ui/Container';
import {
  Search, AlertTriangle, Loader2, CheckCircle2, MapPin,
  Package, Plane, Truck, PawPrint, Info
} from 'lucide-react';
import type { Shipment, ShipmentTrackingEvent, TrackingStatus } from '../../lib/types';
import { TRACKING_STATUS_LABELS, CATEGORY_LABELS } from '../../lib/types';

// Status configuration: color and icon per status
const STATUS_CONFIG: Record<TrackingStatus, { dot: string; badge: string; label: string }> = {
  SHIPMENT_CREATED:           { dot: 'bg-hprh-pine/60 border-hprh-pine/40', badge: 'bg-hprh-pine/10 text-hprh-pine/70 border-hprh-pine/20', label: 'Shipment Created' },
  SHIPMENT_RECEIVED:          { dot: 'bg-hprh-sage border-hprh-sage', badge: 'bg-hprh-sage/10 text-hprh-sage border-hprh-sage/30', label: 'Shipment Received' },
  PICKED_UP:                  { dot: 'bg-hprh-sage border-hprh-sage', badge: 'bg-hprh-sage/10 text-hprh-sage border-hprh-sage/30', label: 'Picked Up' },
  IN_TRANSIT:                 { dot: 'bg-hprh-gold border-hprh-gold', badge: 'bg-hprh-gold/10 text-hprh-gold/80 border-hprh-gold/30', label: 'In Transit' },
  ARRIVED_AT_SORTING_CENTER:  { dot: 'bg-hprh-sage border-hprh-sage', badge: 'bg-hprh-sage/10 text-hprh-sage border-hprh-sage/30', label: 'At Sorting Center' },
  CUSTOMS_CLEARANCE:          { dot: 'bg-blue-500 border-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Customs Clearance' },
  CUSTOMS_HOLD:               { dot: 'bg-hprh-clay border-hprh-clay', badge: 'bg-hprh-clay/10 text-hprh-clay border-hprh-clay/30', label: 'Customs Hold' },
  OUT_FOR_DELIVERY:           { dot: 'bg-hprh-gold border-hprh-gold', badge: 'bg-hprh-gold/10 text-hprh-gold/80 border-hprh-gold/30', label: 'Out for Delivery' },
  DELIVERED:                  { dot: 'bg-hprh-sage border-hprh-sage', badge: 'bg-hprh-sage/10 text-hprh-sage border-hprh-sage/30', label: 'Delivered' },
  DELAYED:                    { dot: 'bg-hprh-clay border-hprh-clay', badge: 'bg-hprh-clay/10 text-hprh-clay border-hprh-clay/30', label: 'Delayed' },
  RETURNED_TO_SENDER:         { dot: 'bg-hprh-clay border-hprh-clay', badge: 'bg-hprh-clay/10 text-hprh-clay border-hprh-clay/30', label: 'Returned to Sender' },
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
        setError("We couldn't find a shipment with that tracking number. Please double-check and try again.");
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
    <div className="py-12 md:py-20 bg-hprh-paper min-h-screen text-hprh-pine font-sans">
      <Container className="max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-hprh-sage font-bold bg-hprh-sage/5 border border-hprh-sage/20 px-3 py-1 rounded inline-block">
            Shipment Tracking
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-hprh-pine mt-2">
            Track Your Shipment
          </h1>
          <p className="text-xs sm:text-sm text-hprh-pine/60 max-w-md mx-auto leading-relaxed">
            Enter your tracking number to view the current status, location, and full delivery timeline.
          </p>
        </div>

        {/* Search Box */}
        <div
          className="bg-hprh-paper-dark border-2 border-hprh-pine/20 rounded-xl shadow-md p-6 max-w-md mx-auto relative overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(#1f2a1e05 1px, transparent 0)', backgroundSize: '16px 16px' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-hprh-clay/40" />
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">
                Tracking Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="e.g. SHP-2026-4827"
                  className="w-full bg-hprh-paper border-2 border-hprh-pine/15 focus:border-hprh-sage focus:ring-1 focus:ring-hprh-sage/20 rounded py-2.5 px-4 pr-10 text-xs font-mono font-bold placeholder-hprh-pine/30 text-hprh-pine uppercase outline-none transition-all"
                  required
                />
                <Search className="w-4 h-4 text-hprh-pine/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hprh-sage hover:bg-hprh-sage/95 text-hprh-paper disabled:bg-hprh-sage/50 text-xs font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
              ) : (
                'Track Shipment'
              )}
            </button>
          </form>

          {error && (
            <div className="bg-hprh-clay/10 border border-hprh-clay/20 text-hprh-pine p-4 rounded text-xs flex items-start gap-3 mt-4 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-hprh-clay flex-shrink-0" />
              <div>
                <span className="font-mono uppercase font-bold text-hprh-clay block">Not Found</span>
                <p className="leading-relaxed font-sans mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Result */}
        {shipment && currentStatusCfg && (
          <div className="bg-hprh-paper-dark border-2 border-hprh-pine/20 rounded-xl shadow-md p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-hprh-sage" />

            {/* Docket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-hprh-pine/20 pb-5 gap-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-hprh-pine/40 font-bold block mb-1">
                  Tracking Number
                </span>
                <h2 className="font-mono text-xl sm:text-2xl font-bold text-hprh-pine uppercase tracking-wide">
                  {shipment.tracking_number}
                </h2>
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded border ${currentStatusCfg.badge} ${
                shipment.current_status === 'IN_TRANSIT' || shipment.current_status === 'OUT_FOR_DELIVERY' ? 'animate-pulse' : ''
              }`}>
                {TRACKING_STATUS_LABELS[shipment.current_status]}
              </span>
            </div>

            {/* Shipment Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Shipping Method</span>
                <div className="flex items-center gap-1.5 mt-1 font-semibold text-hprh-pine">
                  {shipment.shipping_method === 'air' ? <Plane className="w-3.5 h-3.5 text-hprh-sage" /> : <Truck className="w-3.5 h-3.5 text-hprh-sage" />}
                  {shipment.shipping_method === 'air' ? 'Air Freight' : 'Land Transport'}
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Category</span>
                <div className="flex items-center gap-1.5 mt-1 font-semibold text-hprh-pine">
                  {shipment.shipment_category === 'pets' ? <PawPrint className="w-3.5 h-3.5 text-hprh-sage" /> : <Package className="w-3.5 h-3.5 text-hprh-sage" />}
                  {CATEGORY_LABELS[shipment.shipment_category]}
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Weight</span>
                <span className="mt-1 font-semibold text-hprh-pine block">{shipment.weight_kg} kg</span>
              </div>
              {(shipment.length_cm || shipment.width_cm || shipment.height_cm) && (
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Dimensions</span>
                  <span className="mt-1 font-semibold text-hprh-pine block">
                    {shipment.length_cm}×{shipment.width_cm}×{shipment.height_cm} cm
                  </span>
                </div>
              )}
              {shipment.estimated_delivery_date && (
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Est. Delivery</span>
                  <span className="mt-1 font-semibold text-hprh-sage block">
                    {new Date(shipment.estimated_delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {shipment.distance_km && (
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Distance</span>
                  <span className="mt-1 font-semibold text-hprh-pine block">{Number(shipment.distance_km).toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Route */}
            {(shipment.pickup_address || shipment.destination_address) && (
              <div className="bg-hprh-paper/60 border border-hprh-pine/10 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-hprh-sage flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40">From</span>
                    <p className="text-hprh-pine font-semibold">{shipment.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-hprh-clay flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40">To</span>
                    <p className="text-hprh-pine font-semibold">{shipment.destination_address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pet info */}
            {shipment.shipment_category === 'pets' && shipment.pet_name && (
              <div className="flex items-center gap-4 bg-hprh-paper/50 border border-hprh-pine/10 p-4 rounded-lg">
                <div className="w-12 h-12 bg-hprh-sage/10 text-hprh-sage rounded-full flex items-center justify-center flex-shrink-0">
                  <PawPrint className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-hprh-pine/40 font-bold block">Passenger</span>
                  <span className="font-display text-xl font-extrabold text-hprh-pine">{shipment.pet_name}</span>
                  <span className="text-xs text-hprh-pine/60 block font-sans">
                    {shipment.pet_breed || shipment.pet_species} {shipment.pet_age ? `• ${shipment.pet_age}` : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {shipment.admin_notes && (
              <div className="bg-hprh-gold/10 border border-hprh-gold/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-hprh-gold/80 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/50 font-bold block">Notes from Our Team</span>
                  <p className="text-xs text-hprh-pine/80 leading-relaxed mt-1">{shipment.admin_notes}</p>
                </div>
              </div>
            )}

            {/* Tracking Timeline */}
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-hprh-sage border-b border-hprh-sage/20 pb-2">
                Tracking Timeline
              </h3>

              {events.length === 0 ? (
                <div className="bg-hprh-paper border border-hprh-pine/10 rounded p-4 text-xs text-hprh-pine/60 italic text-center">
                  Tracking events will appear here as your shipment progresses.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-hprh-pine/15 py-1 ml-2">
                  {events.map(event => {
                    const cfg = STATUS_CONFIG[event.status as TrackingStatus] || STATUS_CONFIG['SHIPMENT_CREATED'];
                    return (
                      <div key={event.id} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${cfg.dot}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-sm ${cfg.badge}`}>
                              {TRACKING_STATUS_LABELS[event.status as TrackingStatus] || event.status}
                            </span>
                            <span className="text-[10px] text-hprh-pine/50 font-mono">
                              {formatDate(event.event_time)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="text-xs font-bold text-hprh-pine">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-hprh-pine/40 font-normal mr-1">Location:</span>
                              {event.location}
                            </div>
                          )}
                          {event.notes && (
                            <p className="text-xs text-hprh-pine/70 leading-relaxed bg-hprh-paper/40 border border-hprh-pine/5 p-3 rounded">
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
              <div className="bg-hprh-sage/10 border border-hprh-sage/20 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-bottom-2">
                <div className="p-2 bg-hprh-sage/20 text-hprh-sage rounded-full flex-shrink-0 animate-bounce">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono uppercase font-bold text-hprh-pine block text-xs">Delivery Complete</span>
                  <p className="text-xs leading-relaxed font-sans text-hprh-pine/80 mt-1">
                    Your shipment has been successfully delivered to its destination. Thank you for choosing HPRH Transport!
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
