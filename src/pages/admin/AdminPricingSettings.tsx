import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Container from '../../components/ui/Container';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Plus, Edit3, Trash2, Save, X, AlertCircle, Check, Loader2, Settings } from 'lucide-react';
import type { ShipmentPricingTier } from '../../lib/types';

const METHOD_OPTIONS = [
  { value: 'land', label: '🚛 Land Transport (Domestic)' },
  { value: 'air', label: '✈️ Air Freight (International)' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
];

const AdminPricingSettings: React.FC = () => {
  const [tiers, setTiers] = useState<ShipmentPricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'land' | 'air'>('land');
  const [minDist, setMinDist] = useState('');
  const [maxDist, setMaxDist] = useState('');
  const [baseFee, setBaseFee] = useState('');
  const [perKmRate, setPerKmRate] = useState('');
  const [perKgRate, setPerKgRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isActive, setIsActive] = useState(true);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchTiers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: dbErr } = await supabase
        .from('shipment_pricing_tiers')
        .select('*')
        .order('shipping_method')
        .order('min_distance_km');
      if (dbErr) throw dbErr;
      setTiers((data || []) as ShipmentPricingTier[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tiers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setMethod('land');
    setMinDist('');
    setMaxDist('');
    setBaseFee('');
    setPerKmRate('');
    setPerKgRate('');
    setCurrency('USD');
    setIsActive(true);
    setIsFormOpen(false);
  };

  const openEdit = (tier: ShipmentPricingTier) => {
    setEditingId(tier.id);
    setName(tier.name);
    setMethod(tier.shipping_method);
    setMinDist(String(tier.min_distance_km));
    setMaxDist(tier.max_distance_km !== null ? String(tier.max_distance_km) : '');
    setBaseFee(String(tier.base_fee));
    setPerKmRate(String(tier.per_km_rate));
    setPerKgRate(String(tier.per_kg_rate));
    setCurrency(tier.currency);
    setIsActive(tier.is_active);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name,
        shipping_method: method,
        min_distance_km: parseFloat(minDist) || 0,
        max_distance_km: maxDist ? parseFloat(maxDist) : null,
        base_fee: parseFloat(baseFee) || 0,
        per_km_rate: parseFloat(perKmRate) || 0,
        per_kg_rate: parseFloat(perKgRate) || 0,
        currency,
        is_active: isActive,
      };

      if (editingId) {
        const { error: dbErr } = await supabase.from('shipment_pricing_tiers').update(payload).eq('id', editingId);
        if (dbErr) throw dbErr;
        notify('Tier updated successfully.');
      } else {
        const { error: dbErr } = await supabase.from('shipment_pricing_tiers').insert([payload]);
        if (dbErr) throw dbErr;
        notify('New tier created.');
      }

      resetForm();
      fetchTiers();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing tier?')) return;
    const { error: dbErr } = await supabase.from('shipment_pricing_tiers').delete().eq('id', id);
    if (dbErr) { notify('Delete failed.', 'error'); return; }
    notify('Tier deleted.');
    fetchTiers();
  };

  const handleToggleActive = async (tier: ShipmentPricingTier) => {
    await supabase.from('shipment_pricing_tiers').update({ is_active: !tier.is_active }).eq('id', tier.id);
    fetchTiers();
  };

  // Preview: calculate example fee
  const previewFee = (tier: ShipmentPricingTier) => {
    const exampleDist = tier.max_distance_km ? (tier.min_distance_km + tier.max_distance_km) / 2 : tier.min_distance_km + 100;
    const exampleWeight = 10;
    const fee = tier.base_fee + (exampleDist * tier.per_km_rate) + (exampleWeight * tier.per_kg_rate);
    return { fee: fee.toFixed(2), dist: exampleDist.toFixed(0), weight: exampleWeight };
  };

  return (
    <div className="py-6">
      <Container className="max-w-5xl">

        {/* Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-mono font-bold animate-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-hprh-sage text-white' : 'bg-hprh-clay text-white'}`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-hprh-pine flex items-center gap-3">
              <Settings className="w-7 h-7 text-hprh-sage" /> Pricing Tiers
            </h1>
            <p className="text-xs text-hprh-pine/50 mt-1">
              Configure distance-based + weight-adjusted rates for land and air shipments.
              Formula: <code className="font-mono bg-hprh-pine/5 px-1 rounded">Base Fee + (Distance × Per-km Rate) + (Weight × Per-kg Rate)</code>
            </p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-hprh-clay/10 border border-hprh-clay/20 rounded p-4 flex items-center gap-3 text-sm mb-4">
            <AlertCircle className="w-5 h-5 text-hprh-clay flex-shrink-0" />
            <p className="text-hprh-pine">{error}</p>
          </div>
        )}

        {/* Form */}
        {isFormOpen && (
          <div className="bg-hprh-paper-dark border-2 border-hprh-sage/30 rounded-xl p-6 mb-6 space-y-5 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-hprh-pine">
                {editingId ? 'Edit Pricing Tier' : 'New Pricing Tier'}
              </h2>
              <button onClick={resetForm} className="text-hprh-pine/40 hover:text-hprh-pine">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Tier Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Land — Regional (100–500 km)" required />
                <Select label="Shipping Method *" value={method} onChange={e => setMethod(e.target.value as 'land' | 'air')} options={METHOD_OPTIONS} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Input label="Min Distance (km) *" type="number" min="0" value={minDist} onChange={e => setMinDist(e.target.value)} required />
                <Input label="Max Distance (km)" type="number" min="0" value={maxDist} onChange={e => setMaxDist(e.target.value)} hint="Leave blank for unlimited" />
                <Input label="Base Fee *" type="number" min="0" step="0.01" value={baseFee} onChange={e => setBaseFee(e.target.value)} required />
                <Select label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} options={CURRENCY_OPTIONS} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Per-km Rate *" type="number" min="0" step="0.0001" value={perKmRate} onChange={e => setPerKmRate(e.target.value)} hint="Amount added per km of distance" required />
                <Input label="Per-kg Rate" type="number" min="0" step="0.0001" value={perKgRate} onChange={e => setPerKgRate(e.target.value)} hint="Amount added per kg of weight (can be 0)" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 accent-hprh-sage" />
                <label htmlFor="is_active" className="text-xs font-semibold text-hprh-pine">Active (visible to customers)</label>
              </div>

              {/* Preview */}
              {baseFee && perKmRate && minDist && (
                <div className="bg-hprh-sage/5 border border-hprh-sage/20 rounded p-3 text-xs font-mono text-hprh-pine/70">
                  <span className="font-bold text-hprh-pine">Preview:</span> For a{' '}
                  {maxDist ? `${Math.floor((parseFloat(minDist) + parseFloat(maxDist)) / 2)}` : `${parseFloat(minDist) + 100}`}-km shipment at 10 kg:
                  {' '}<span className="text-hprh-clay font-bold">
                    {(
                      parseFloat(baseFee || '0') +
                      ((maxDist ? (parseFloat(minDist) + parseFloat(maxDist)) / 2 : parseFloat(minDist) + 100) * parseFloat(perKmRate || '0')) +
                      (10 * parseFloat(perKgRate || '0'))
                    ).toFixed(2)} {currency}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button type="submit" loading={submitting}><Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create Tier'}</Button>
                <Button type="button" variant="ghost" onClick={resetForm}><X className="w-4 h-4" /> Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Tiers list */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-hprh-sage mx-auto" />
          </div>
        ) : (
          <div className="space-y-8">
            {(['land', 'air'] as const).map(m => {
              const methodTiers = tiers.filter(t => t.shipping_method === m);
              return (
                <div key={m}>
                  <h2 className="font-display font-bold text-lg text-hprh-pine mb-3 flex items-center gap-2">
                    {m === 'land' ? '🚛' : '✈️'} {m === 'land' ? 'Land Transport' : 'Air Freight'}
                    <span className="text-[10px] font-mono bg-hprh-pine/10 text-hprh-pine/60 px-2 py-0.5 rounded">{methodTiers.length} tiers</span>
                  </h2>
                  {methodTiers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-hprh-pine/10 rounded-xl text-xs text-hprh-pine/30">
                      No {m} tiers configured yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {methodTiers.map(tier => {
                        const preview = previewFee(tier);
                        return (
                          <div key={tier.id} className={`bg-hprh-paper-dark border rounded-xl p-5 transition-all ${tier.is_active ? 'border-hprh-pine/10' : 'border-hprh-pine/5 opacity-60'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-display font-bold text-base text-hprh-pine">{tier.name}</span>
                                  {!tier.is_active && <span className="text-[9px] font-mono bg-hprh-clay/10 text-hprh-clay px-2 py-0.5 rounded uppercase">Inactive</span>}
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs font-mono text-hprh-pine/60">
                                  <span>Range: {tier.min_distance_km}–{tier.max_distance_km ?? '∞'} km</span>
                                  <span>Base: {tier.base_fee} {tier.currency}</span>
                                  <span>+{tier.per_km_rate}/km</span>
                                  <span>+{tier.per_kg_rate}/kg</span>
                                </div>
                                <p className="text-[10px] text-hprh-pine/40 font-mono">
                                  Example ({preview.dist} km, {preview.weight} kg) ≈ <strong className="text-hprh-clay">{preview.fee} {tier.currency}</strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleToggleActive(tier)}
                                  className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1.5 rounded border transition-all ${tier.is_active ? 'border-hprh-sage/40 text-hprh-sage hover:bg-hprh-clay/5 hover:border-hprh-clay hover:text-hprh-clay' : 'border-hprh-sage/30 text-hprh-pine/40 hover:text-hprh-sage hover:border-hprh-sage'}`}
                                >
                                  {tier.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => openEdit(tier)} className="text-hprh-pine/40 hover:text-hprh-sage transition-colors p-1.5 rounded border border-hprh-pine/10 hover:border-hprh-sage/40">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(tier.id)} className="text-hprh-pine/40 hover:text-hprh-clay transition-colors p-1.5 rounded border border-hprh-pine/10 hover:border-hprh-clay/40">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdminPricingSettings;
