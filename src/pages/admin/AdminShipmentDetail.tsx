import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Container from '../../components/ui/Container';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import {
  ArrowLeft, Loader2, AlertCircle, Check, Plus, History, Package,
  MapPin, DollarSign, Edit3, Save, X, RefreshCw, Hash,
  ExternalLink, PawPrint, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import type { Shipment, ShipmentTrackingEvent, TrackingStatus } from '../../lib/types';
import { TRACKING_STATUS_LABELS, CATEGORY_LABELS, generateTrackingNumber } from '../../lib/types';

const ALL_STATUSES = Object.entries(TRACKING_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

const AdminShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<ShipmentTrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState<Partial<Shipment>>({});

  // Tracking event form
  const [eventStatus, setEventStatus] = useState<TrackingStatus>('IN_TRANSIT');
  const [eventLocation, setEventLocation] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [eventTime, setEventTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [addingEvent, setAddingEvent] = useState(false);

  // Security deposit form
  const [depositAmount, setDepositAmount] = useState('');

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [{ data: s, error: sErr }, { data: ev, error: evErr }] = await Promise.all([
        supabase.from('shipments').select('*').eq('id', id).maybeSingle(),
        supabase.from('shipment_tracking_events').select('*').eq('shipment_id', id).order('event_time', { ascending: false }),
      ]);
      if (sErr) throw sErr;
      if (evErr) throw evErr;
      if (!s) { setError('Shipment not found.'); return; }
      setShipment(s as Shipment);
      setEditFields(s as Shipment);
      setEvents((ev || []) as ShipmentTrackingEvent[]);
      if (s.security_deposit_amount) setDepositAmount(String(s.security_deposit_amount));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load shipment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Generate tracking number ──────────────────────────
  const handleGenerateTracking = async () => {
    if (!shipment) return;
    let tn = '';
    let attempts = 0;
    while (attempts < 10) {
      tn = generateTrackingNumber();
      const { data } = await supabase.from('shipments').select('id').eq('tracking_number', tn).maybeSingle();
      if (!data) break;
      attempts++;
    }
    const { error: dbErr } = await supabase.from('shipments').update({ tracking_number: tn }).eq('id', shipment.id);
    if (dbErr) { notify('Failed to generate tracking number.', 'error'); return; }
    notify(`Tracking number assigned: ${tn}`);
    fetchData();
  };

  // ─── Save edits ────────────────────────────────────────
  const handleSave = async () => {
    if (!shipment) return;
    try {
      setSaving(true);
      const { error: dbErr } = await supabase.from('shipments').update(editFields).eq('id', shipment.id);
      if (dbErr) throw dbErr;
      notify('Shipment updated successfully.');
      setEditMode(false);
      fetchData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Add tracking event ────────────────────────────────
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    try {
      setAddingEvent(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertErr } = await supabase.from('shipment_tracking_events').insert([{
        shipment_id: shipment.id,
        status: eventStatus,
        location: eventLocation || null,
        notes: eventNotes || null,
        event_time: new Date(eventTime).toISOString(),
        posted_by: user?.id || null,
      }]);
      if (insertErr) throw insertErr;

      // Update shipment current status
      await supabase.from('shipments').update({ current_status: eventStatus }).eq('id', shipment.id);

      notify('Tracking event added.');
      setEventLocation('');
      setEventNotes('');
      setEventTime(new Date().toISOString().slice(0, 16));
      fetchData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to add event.', 'error');
    } finally {
      setAddingEvent(false);
    }
  };

  // ─── Set security deposit amount ──────────────────────
  const handleSetDeposit = async () => {
    if (!shipment || !depositAmount) return;
    const { error: dbErr } = await supabase.from('shipments')
      .update({ security_deposit_amount: parseFloat(depositAmount) })
      .eq('id', shipment.id);
    if (dbErr) { notify('Failed to set deposit.', 'error'); return; }
    notify('Security deposit amount set.');
    fetchData();
  };

  // ─── Approve / Reject payment proof ───────────────────
  const handlePaymentAction = async (
    action: 'approve' | 'reject',
    proofType: 'transport_fee' | 'security_deposit'
  ) => {
    if (!shipment) return;

    // Prevent approving transport fee if security deposit is not set yet
    if (proofType === 'transport_fee' && action === 'approve' && (!shipment.security_deposit_amount || shipment.security_deposit_amount <= 0)) {
      notify('Please set the security deposit amount first before approving the transport fee.', 'error');
      return;
    }

    const newStatus = action === 'approve' ? 'PAID' : 'REJECTED';

    // Auto-generate tracking number on security deposit approval if not already set
    let assignedTracking = shipment.tracking_number;
    if (proofType === 'security_deposit' && action === 'approve' && !assignedTracking) {
      assignedTracking = generateTrackingNumber();
    }

    const updates: Record<string, unknown> = proofType === 'transport_fee'
      ? { transport_fee_status: newStatus, transport_fee_reviewed_at: new Date().toISOString() }
      : { 
          security_deposit_status: newStatus, 
          security_deposit_reviewed_at: new Date().toISOString(),
          ...(assignedTracking ? { tracking_number: assignedTracking } : {})
        };

    const { error: dbErr } = await supabase.from('shipments').update(updates).eq('id', shipment.id);
    if (dbErr) { notify('Action failed.', 'error'); return; }

    notify(`${proofType === 'transport_fee' ? 'Transport fee' : 'Security deposit'} ${action}d.`);

    // Trigger notification email upon approval
    if (action === 'approve') {
      try {
        const emailType = proofType === 'transport_fee' ? 'shipment_fee_approved' : 'shipment_finalized';
        const displayItemName = shipment.shipment_category === 'pets' && shipment.pet_name 
          ? shipment.pet_name 
          : (CATEGORY_LABELS[shipment.shipment_category] || 'Package Shipment');

        const { data: fnData, error: fnErr } = await supabase.functions.invoke('send-approval-email', {
          body: {
            type: emailType,
            adopterEmail: shipment.sender_email,
            adopterName: shipment.sender_name,
            petName: displayItemName,
            transportRequestId: shipment.id,
            donationAmount: String(shipment.security_deposit_amount || 0),
            trackingId: assignedTracking || '',
          }
        });

        if (fnErr) {
          throw new Error(fnErr.message || JSON.stringify(fnErr));
        }

        // Check if function returned success: false
        if (fnData && fnData.error) {
          throw new Error(fnData.error);
        }
      } catch (emailErr: any) {
        console.error('Failed to send notification email:', emailErr);
        notify(`Email sending failed: ${emailErr.message}`, 'error');
      }
    }

    fetchData();
  };

  // ─── Get proof URL ─────────────────────────────────────
  const getProofUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('shipment-proofs').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-hprh-sage mx-auto" />
        <p className="text-xs font-mono text-hprh-pine/50 uppercase tracking-widest">Loading shipment...</p>
      </div>
    </div>
  );

  if (error || !shipment) return (
    <Container className="max-w-lg py-20 text-center space-y-4">
      <AlertCircle className="w-10 h-10 text-hprh-clay mx-auto" />
      <p className="text-sm text-hprh-pine">{error || 'Shipment not found.'}</p>
      <button onClick={() => navigate('/admin/dashboard')} className="text-xs font-mono text-hprh-sage hover:underline">← Back to Dashboard</button>
    </Container>
  );

  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="py-6">
      <Container className="max-w-5xl">

        {/* Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-mono font-bold transition-all animate-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-hprh-sage text-white' : 'bg-hprh-clay text-white'}`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.msg}
          </div>
        )}

        {/* Back */}
        <button onClick={() => navigate('/admin/dashboard')} className="inline-flex items-center gap-2 text-xs font-mono text-hprh-pine/60 hover:text-hprh-sage mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Shipments
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-hprh-pine">
                {shipment.tracking_number || <span className="text-hprh-pine/40 italic text-lg">No Tracking # Yet</span>}
              </h1>
              <span className="text-[9px] font-mono font-bold uppercase bg-hprh-pine/10 text-hprh-pine/70 px-2 py-1 rounded">
                {TRACKING_STATUS_LABELS[shipment.current_status]}
              </span>
            </div>
            <p className="text-xs text-hprh-pine/50 mt-1">{shipment.sender_name} · {CATEGORY_LABELS[shipment.shipment_category]} · Created {formatDate(shipment.created_at)}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!shipment.tracking_number && (
              <Button onClick={handleGenerateTracking} size="sm" variant="secondary">
                <Hash className="w-3.5 h-3.5" /> Generate Tracking #
              </Button>
            )}
            {editMode ? (
              <>
                <Button onClick={handleSave} loading={saving} size="sm">
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button onClick={() => { setEditMode(false); setEditFields(shipment); }} variant="ghost" size="sm">
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)} variant="ghost" size="sm">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
            )}
            <Button onClick={fetchData} variant="ghost" size="sm"><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: Details ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Shipment Info */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Shipment Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Category', val: CATEGORY_LABELS[shipment.shipment_category] },
                  { label: 'Method', val: shipment.shipping_method === 'air' ? 'Air Freight' : 'Land Transport' },
                  { label: 'Weight', val: `${shipment.weight_kg} kg` },
                  { label: 'Packages', val: String(shipment.num_packages) },
                  shipment.length_cm ? { label: 'Dimensions', val: `${shipment.length_cm} × ${shipment.width_cm} × ${shipment.height_cm} cm` } : null,
                  shipment.declared_value ? { label: 'Declared Value', val: `$${shipment.declared_value}` } : null,
                  shipment.distance_km ? { label: 'Distance', val: `${Number(shipment.distance_km).toFixed(1)} km` } : null,
                ].filter(Boolean).map(row => row && (
                  <div key={row.label}>
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">{row.label}</span>
                    <span className="font-semibold text-hprh-pine">{row.val}</span>
                  </div>
                ))}
              </div>
              {shipment.package_description && (
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Description</span>
                  <p className="text-xs text-hprh-pine/80 mt-1">{shipment.package_description}</p>
                </div>
              )}
              {shipment.special_handling && (
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Special Handling</span>
                  <p className="text-xs text-hprh-pine/80 mt-1">{shipment.special_handling}</p>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Route
              </h3>
              {editMode ? (
                <div className="space-y-3">
                  <Textarea label="Pickup Address" value={editFields.pickup_address || ''} onChange={e => setEditFields(p => ({ ...p, pickup_address: e.target.value }))} rows={2} />
                  <Textarea label="Destination Address" value={editFields.destination_address || ''} onChange={e => setEditFields(p => ({ ...p, destination_address: e.target.value }))} rows={2} />
                  <Input label="Est. Delivery Date" type="date" value={editFields.estimated_delivery_date || ''} onChange={e => setEditFields(p => ({ ...p, estimated_delivery_date: e.target.value }))} />
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-hprh-sage flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">From</span>
                      <p className="font-semibold text-hprh-pine">{shipment.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-hprh-clay flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">To</span>
                      <p className="font-semibold text-hprh-pine">{shipment.destination_address}</p>
                    </div>
                  </div>
                  {shipment.estimated_delivery_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-hprh-gold/80 flex-shrink-0" />
                      <div>
                        <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Est. Delivery</span>
                        <p className="font-semibold text-hprh-sage">{new Date(shipment.estimated_delivery_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block mb-1">Sender</span>
                  <p className="font-bold text-hprh-pine">{shipment.sender_name}</p>
                  <p className="text-hprh-pine/60">{shipment.sender_email}</p>
                  {shipment.sender_phone && <p className="text-hprh-pine/60">{shipment.sender_phone}</p>}
                </div>
                {shipment.shipment_type === 'send_to_other' && (
                  <div>
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block mb-1">Recipient</span>
                    <p className="font-bold text-hprh-pine">{shipment.recipient_name}</p>
                    <p className="text-hprh-pine/60">{shipment.recipient_email}</p>
                    {shipment.recipient_phone && <p className="text-hprh-pine/60">{shipment.recipient_phone}</p>}
                    {shipment.recipient_address && <p className="text-hprh-pine/60">{shipment.recipient_address}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Pet Details */}
            {shipment.shipment_category === 'pets' && (
              <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2 flex items-center gap-2">
                  <PawPrint className="w-3.5 h-3.5" /> Pet Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { l: 'Name', v: shipment.pet_name },
                    { l: 'Species', v: shipment.pet_species },
                    { l: 'Breed', v: shipment.pet_breed },
                    { l: 'Age', v: shipment.pet_age },
                    { l: 'Weight', v: shipment.pet_weight_kg ? `${shipment.pet_weight_kg} kg` : null },
                    { l: 'Crate Size', v: shipment.pet_crate_size },
                  ].filter(r => r.v).map(r => (
                    <div key={r.l}>
                      <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">{r.l}</span>
                      <span className="font-semibold text-hprh-pine">{r.v}</span>
                    </div>
                  ))}
                </div>
                {shipment.pet_health_status && <div><span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Health Status</span><p className="text-xs text-hprh-pine/80 mt-1">{shipment.pet_health_status}</p></div>}
                {shipment.pet_special_care && <div><span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Special Care</span><p className="text-xs text-hprh-pine/80 mt-1">{shipment.pet_special_care}</p></div>}
              </div>
            )}

            {/* Admin Notes */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2 mb-3">Admin Notes</h3>
              <Textarea
                value={editMode ? (editFields.admin_notes || '') : (shipment.admin_notes || '')}
                onChange={e => editMode && setEditFields(p => ({ ...p, admin_notes: e.target.value }))}
                placeholder="Internal notes visible to customers on tracking page..."
                rows={3}
                disabled={!editMode}
              />
              {!editMode && !shipment.admin_notes && <p className="text-xs text-hprh-pine/30 italic">No notes yet. Click Edit to add notes.</p>}
            </div>

            {/* Tracking Events Timeline */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2 flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Tracking Events
              </h3>

              {/* Add Event Form */}
              <form onSubmit={handleAddEvent} className="bg-hprh-paper border border-hprh-pine/10 rounded-lg p-4 space-y-3">
                <p className="text-[10px] font-mono font-bold uppercase text-hprh-pine/60">Add New Event</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Status *"
                    value={eventStatus}
                    onChange={e => setEventStatus(e.target.value as TrackingStatus)}
                    options={ALL_STATUSES}
                  />
                  <Input
                    label="Date & Time *"
                    type="datetime-local"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                  />
                </div>
                <Input label="Location" value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="e.g. Miami International Airport" />
                <Textarea label="Notes" value={eventNotes} onChange={e => setEventNotes(e.target.value)} placeholder="Customer-visible update notes..." rows={2} />
                <Button type="submit" loading={addingEvent} size="sm">
                  <Plus className="w-3.5 h-3.5" /> Add Event
                </Button>
              </form>

              {/* Event list */}
              {events.length === 0 ? (
                <p className="text-xs text-hprh-pine/30 italic text-center py-4">No tracking events yet.</p>
              ) : (
                <div className="space-y-3">
                  {events.map(ev => (
                    <div key={ev.id} className="flex items-start gap-3 text-xs bg-hprh-paper border border-hprh-pine/5 rounded-lg p-3">
                      <div className="w-2 h-2 rounded-full bg-hprh-sage flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold uppercase text-[9px] bg-hprh-sage/10 text-hprh-sage px-2 py-0.5 rounded">
                            {TRACKING_STATUS_LABELS[ev.status as TrackingStatus] || ev.status}
                          </span>
                          <span className="text-[10px] text-hprh-pine/40 font-mono">{formatDate(ev.event_time)}</span>
                        </div>
                        {ev.location && <p className="text-hprh-pine font-semibold mt-1">📍 {ev.location}</p>}
                        {ev.notes && <p className="text-hprh-pine/60 mt-1 leading-relaxed">{ev.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: Payments ── */}
          <div className="space-y-5">

            {/* Pricing */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Pricing
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-hprh-pine/60">Transport Fee</span>
                  <span className="font-mono font-bold text-hprh-pine">
                    {shipment.transport_fee_amount
                      ? `${shipment.transport_fee_amount.toLocaleString('en-US', { style: 'currency', currency: shipment.transport_fee_currency || 'USD' })}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hprh-pine/60">Security Deposit</span>
                  <span className="font-mono font-bold text-hprh-pine">
                    {shipment.security_deposit_amount
                      ? `${shipment.security_deposit_amount.toLocaleString('en-US', { style: 'currency', currency: shipment.security_deposit_currency || 'USD' })}`
                      : <span className="text-hprh-pine/30 italic">Not set</span>}
                  </span>
                </div>
              </div>
              {/* Set deposit */}
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="Deposit amount"
                  className="flex-1 border-2 border-hprh-pine/15 rounded px-3 py-2 text-xs font-mono text-hprh-pine bg-hprh-paper outline-none focus:border-hprh-sage"
                />
                <Button onClick={handleSetDeposit} size="sm" variant="ghost">Set</Button>
              </div>
            </div>

            {/* Transport Fee Proof */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2">
                Transport Fee Proof
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 rounded ${
                  shipment.transport_fee_status === 'PAID' ? 'bg-hprh-sage/10 text-hprh-sage'
                  : shipment.transport_fee_status === 'SUBMITTED' ? 'bg-hprh-gold/10 text-hprh-gold/80'
                  : shipment.transport_fee_status === 'REJECTED' ? 'bg-hprh-clay/10 text-hprh-clay'
                  : 'bg-hprh-pine/10 text-hprh-pine/60'
                }`}>{shipment.transport_fee_status}</span>
                {shipment.transport_fee_amount_claimed && (
                  <span className="text-xs text-hprh-pine/60">Claimed: ${shipment.transport_fee_amount_claimed}</span>
                )}
              </div>
              {shipment.transport_fee_proof_url && (
                <a
                  href={getProofUrl(shipment.transport_fee_proof_url) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono text-hprh-sage hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> View Receipt
                </a>
              )}
              {shipment.transport_fee_status === 'SUBMITTED' && (
                <div className="flex gap-2">
                  <Button onClick={() => handlePaymentAction('approve', 'transport_fee')} size="sm" variant="secondary">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button onClick={() => handlePaymentAction('reject', 'transport_fee')} size="sm" variant="danger">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              )}
            </div>

            {/* Security Deposit Proof */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/60 border-b border-hprh-pine/10 pb-2">
                Security Deposit Proof
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 rounded ${
                  shipment.security_deposit_status === 'PAID' ? 'bg-hprh-sage/10 text-hprh-sage'
                  : shipment.security_deposit_status === 'SUBMITTED' ? 'bg-hprh-gold/10 text-hprh-gold/80'
                  : shipment.security_deposit_status === 'REJECTED' ? 'bg-hprh-clay/10 text-hprh-clay'
                  : 'bg-hprh-pine/10 text-hprh-pine/60'
                }`}>{shipment.security_deposit_status}</span>
                {shipment.security_deposit_amount_claimed && (
                  <span className="text-xs text-hprh-pine/60">Claimed: ${shipment.security_deposit_amount_claimed}</span>
                )}
              </div>
              {shipment.security_deposit_proof_url && (
                <a
                  href={getProofUrl(shipment.security_deposit_proof_url) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono text-hprh-sage hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> View Receipt
                </a>
              )}
              {shipment.security_deposit_status === 'SUBMITTED' && (
                <div className="flex gap-2">
                  <Button onClick={() => handlePaymentAction('approve', 'security_deposit')} size="sm" variant="secondary">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button onClick={() => handlePaymentAction('reject', 'security_deposit')} size="sm" variant="danger">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>

      </Container>
    </div>
  );
};

export default AdminShipmentDetail;
