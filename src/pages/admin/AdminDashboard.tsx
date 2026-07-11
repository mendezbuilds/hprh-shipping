import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Container from '../../components/ui/Container';
import { Search, Package, Plus, Loader2, AlertCircle, ChevronRight, Plane, Truck } from 'lucide-react';
import type { Shipment } from '../../lib/types';
import { CATEGORY_LABELS, TRACKING_STATUS_LABELS } from '../../lib/types';

const STATUS_COLORS: Record<string, string> = {
  SHIPMENT_CREATED:          'bg-hprh-pine/10 text-hprh-pine/70',
  SHIPMENT_RECEIVED:         'bg-hprh-sage/10 text-hprh-sage',
  PICKED_UP:                 'bg-hprh-sage/10 text-hprh-sage',
  IN_TRANSIT:                'bg-hprh-gold/10 text-hprh-gold/80',
  ARRIVED_AT_SORTING_CENTER: 'bg-hprh-sage/10 text-hprh-sage',
  CUSTOMS_CLEARANCE:         'bg-blue-50 text-blue-700',
  CUSTOMS_HOLD:              'bg-hprh-clay/10 text-hprh-clay',
  OUT_FOR_DELIVERY:          'bg-hprh-gold/10 text-hprh-gold/80',
  DELIVERED:                 'bg-hprh-sage/10 text-hprh-sage',
  DELAYED:                   'bg-hprh-clay/10 text-hprh-clay',
  RETURNED_TO_SENDER:        'bg-hprh-clay/10 text-hprh-clay',
};

const PAY_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-hprh-pine/10 text-hprh-pine/60',
  SUBMITTED: 'bg-hprh-gold/10 text-hprh-gold/80',
  PAID:      'bg-hprh-sage/10 text-hprh-sage',
  REJECTED:  'bg-hprh-clay/10 text-hprh-clay',
};

const AdminDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, inTransit: 0, pending: 0, delivered: 0 });

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('current_status', statusFilter);
      if (payFilter) query = query.eq('transport_fee_status', payFilter);

      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;

      const rows = (data || []) as Shipment[];
      setShipments(rows);
      setStats({
        total: rows.length,
        inTransit: rows.filter(s => ['IN_TRANSIT', 'PICKED_UP', 'ARRIVED_AT_SORTING_CENTER', 'OUT_FOR_DELIVERY'].includes(s.current_status)).length,
        pending: rows.filter(s => s.transport_fee_status === 'PENDING' || s.transport_fee_status === 'SUBMITTED').length,
        delivered: rows.filter(s => s.current_status === 'DELIVERED').length,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, payFilter]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const filtered = shipments.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.tracking_number?.toLowerCase().includes(q) ||
      s.sender_name.toLowerCase().includes(q) ||
      s.sender_email.toLowerCase().includes(q) ||
      s.destination_address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-6">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-hprh-pine">Shipments Dashboard</h1>
            <p className="text-xs text-hprh-pine/50 mt-1">Manage all shipment requests and their status.</p>
          </div>
          <Link
            to="/admin/shipments/new"
            className="inline-flex items-center gap-2 bg-hprh-clay text-hprh-paper font-mono font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded hover:bg-hprh-clay/90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Shipment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Shipments', val: stats.total, color: 'text-hprh-pine' },
            { label: 'In Transit', val: stats.inTransit, color: 'text-hprh-gold/80' },
            { label: 'Awaiting Review', val: stats.pending, color: 'text-hprh-clay' },
            { label: 'Delivered', val: stats.delivered, color: 'text-hprh-sage' },
          ].map(s => (
            <div key={s.label} className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-4 text-center">
              <div className={`font-display text-3xl font-extrabold ${s.color}`}>{s.val}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hprh-pine/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, tracking #, or address..."
              className="w-full pl-9 pr-3 py-2.5 border-2 border-hprh-pine/15 focus:border-hprh-sage rounded bg-hprh-paper text-sm text-hprh-pine outline-none transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border-2 border-hprh-pine/15 rounded px-3 py-2.5 text-xs font-mono text-hprh-pine bg-hprh-paper outline-none"
          >
            <option value="">All Statuses</option>
            {Object.entries(TRACKING_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={payFilter}
            onChange={e => setPayFilter(e.target.value)}
            className="border-2 border-hprh-pine/15 rounded px-3 py-2.5 text-xs font-mono text-hprh-pine bg-hprh-paper outline-none"
          >
            <option value="">All Payments</option>
            <option value="PENDING">Fee Pending</option>
            <option value="SUBMITTED">Fee Submitted</option>
            <option value="PAID">Fee Paid</option>
          </select>
        </div>

        {error && (
          <div className="bg-hprh-clay/10 border border-hprh-clay/20 rounded p-4 flex items-center gap-3 text-sm mb-4">
            <AlertCircle className="w-5 h-5 text-hprh-clay flex-shrink-0" />
            <p className="text-hprh-pine">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-hprh-sage mx-auto" />
            <p className="text-xs font-mono text-hprh-pine/50 mt-3 uppercase tracking-widest">Loading shipments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-hprh-pine/10 rounded-xl">
            <Package className="w-12 h-12 text-hprh-pine/20 mx-auto mb-4" />
            <p className="text-sm text-hprh-pine/40 font-mono">No shipments found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => (
              <Link
                key={s.id}
                to={`/admin/shipments/${s.id}`}
                className="block bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-4 hover:border-hprh-sage/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Method icon */}
                    <div className="w-10 h-10 bg-hprh-pine/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      {s.shipping_method === 'air'
                        ? <Plane className="w-5 h-5 text-hprh-pine/40" />
                        : <Truck className="w-5 h-5 text-hprh-pine/40" />}
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-hprh-pine">
                          {s.tracking_number || <span className="text-hprh-pine/30 italic text-xs">No tracking # yet</span>}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${STATUS_COLORS[s.current_status] || 'bg-hprh-pine/10 text-hprh-pine/60'}`}>
                          {TRACKING_STATUS_LABELS[s.current_status]}
                        </span>
                      </div>
                      <p className="text-xs text-hprh-pine/70 mt-0.5 truncate">
                        {s.sender_name} — {CATEGORY_LABELS[s.shipment_category]}
                      </p>
                      <p className="text-[10px] text-hprh-pine/40 font-mono mt-0.5 truncate">
                        {s.pickup_address} → {s.destination_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Payment badges */}
                    <div className="hidden sm:flex flex-col gap-1 text-right">
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${PAY_STATUS_COLORS[s.transport_fee_status]}`}>
                        Fee: {s.transport_fee_status}
                      </span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${PAY_STATUS_COLORS[s.security_deposit_status]}`}>
                        Dep: {s.security_deposit_status}
                      </span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold font-mono text-hprh-pine">
                        {s.transport_fee_amount
                          ? s.transport_fee_amount.toLocaleString('en-US', { style: 'currency', currency: s.transport_fee_currency || 'USD' })
                          : '—'}
                      </span>
                      <p className="text-[9px] text-hprh-pine/40 font-mono">
                        {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-hprh-pine/30 group-hover:text-hprh-sage transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdminDashboard;
