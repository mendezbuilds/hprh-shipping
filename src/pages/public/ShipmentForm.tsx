import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Container from '../../components/ui/Container';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import {
  User, Users, PawPrint, Package, MapPin, Upload, CheckCircle2,
  ArrowRight, ArrowLeft, AlertCircle, Copy, Check, ShieldCheck, Info, Search
} from 'lucide-react';
import type {
  ShipmentCategory, ShippingMethod, ShipmentType, ShipmentPricingTier,
  BankAccount
} from '../../lib/types';
import {
  CATEGORY_LABELS, PET_CRATE_SIZES, haversineKm,
  calculateFee as calcFee
} from '../../lib/types';

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ─── Category options ──────────────────────────────────────
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

const CRATE_OPTIONS = PET_CRATE_SIZES.map(s => ({ value: s, label: s }));

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' },
];

// ─── Main component ────────────────────────────────────────
const ShipmentForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume');

  const [step, setStep] = useState<StepIndex>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Shipment ID (set after initial submit)
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [trackingRef, setTrackingRef] = useState<string>(''); // reference shown to user
  const [submittedPurpose, setSubmittedPurpose] = useState<'transport_fee' | 'security_deposit' | null>(null);

  // ─── Step 0 – Category & Type ──────────────────────────
  const [shipmentType, setShipmentType] = useState<ShipmentType>('self');
  const [category, setCategory] = useState<ShipmentCategory>('documents');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('land');

  // Pet extra fields
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeightKg, setPetWeightKg] = useState('');
  const [petCrateSize, setPetCrateSize] = useState('');
  const [petHealthStatus, setPetHealthStatus] = useState('');
  const [petSpecialCare, setPetSpecialCare] = useState('');

  // ─── Step 1 – Package Details ─────────────────────────
  const [weightKg, setWeightKg] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [numPackages, setNumPackages] = useState('1');
  const [declaredValue, setDeclaredValue] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [specialHandling, setSpecialHandling] = useState('');
  const [preferredDelivery, setPreferredDelivery] = useState('');

  // ─── Step 2 – Contact Info ────────────────────────────
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  // ─── Step 3 – Locations & Quote ──────────────────────
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [quoteResult, setQuoteResult] = useState<{
    distanceKm: number;
    fee: number;
    currency: string;
    tierId: string;
    tierName: string;
    pickupLat: number; pickupLng: number;
    destLat: number; destLng: number;
    formattedPickup: string; formattedDest: string;
  } | null>(null);
  const [pricingTiers, setPricingTiers] = useState<ShipmentPricingTier[]>([]);

  // ─── Step 4 & 5 – Payment Proof ──────────────────────
  const [paymentMethods, setPaymentMethods] = useState<BankAccount[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amountClaimed, setAmountClaimed] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ─── Fetch pricing tiers & payment methods on mount ──
  useEffect(() => {
    const fetchData = async () => {
      const [{ data: tiers }, { data: methods }] = await Promise.all([
        supabase.from('shipment_pricing_tiers').select('*').eq('is_active', true),
        supabase.from('bank_accounts').select('*').eq('is_active', true),
      ]);
      setPricingTiers((tiers || []) as ShipmentPricingTier[]);
      const activeMethods = (methods || []) as BankAccount[];
      setPaymentMethods(activeMethods);
      if (activeMethods.length > 0) setSelectedMethodId(activeMethods[0].id);
    };
    fetchData();
  }, []);

  // Resume shipment from query param
  useEffect(() => {
    if (!resumeId) return;
    const loadResume = async () => {
      try {
        const { data, error: dbErr } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', resumeId)
          .maybeSingle();
        if (dbErr) throw dbErr;
        if (data) {
          setShipmentId(data.id);
          setTrackingRef(data.id.slice(0, 8).toUpperCase());
          setSenderName(data.sender_name);
          setSenderEmail(data.sender_email);
          setSenderPhone(data.sender_phone || '');
          setCategory(data.shipment_category);
          setShippingMethod(data.shipping_method);
          setWeightKg(String(data.weight_kg));
          
          if (data.transport_fee_status === 'PENDING') {
            setAmountClaimed(String(data.transport_fee_amount));
            setStep(4);
          } else if (data.transport_fee_status === 'SUBMITTED' || data.transport_fee_status === 'PAID') {
            if (data.security_deposit_status === 'PENDING') {
              setAmountClaimed(data.security_deposit_amount ? String(data.security_deposit_amount) : '');
              setStep(5);
            } else if (data.security_deposit_status === 'SUBMITTED') {
              setStep(5);
            } else {
              setStep(6);
            }
          }
        }
      } catch (err) {
        console.error('Failed to resume shipment:', err);
      }
    };
    loadResume();
  }, [resumeId]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  // ─── Navigation helpers ───────────────────────────────
  const goNext = () => setStep(s => Math.min(s + 1, 6) as StepIndex);
  const goPrev = () => setStep(s => Math.max(s - 1, 0) as StepIndex);
  const clearError = () => setError(null);

  // ─── Geocode helper (uses existing Supabase edge fn) ─
  const geocodeAddress = async (address: string) => {
    const { data, error } = await supabase.functions.invoke('geocode-address', { body: { address } });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude), formatted: data.formattedAddress as string };
  };

  // ─── Step 3: Calculate Quote ──────────────────────────
  const handleCalculateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !destinationAddress.trim()) return;
    try {
      setGeocoding(true);
      setError(null);
      setQuoteResult(null);

      const [pickup, dest] = await Promise.all([
        geocodeAddress(pickupAddress),
        geocodeAddress(destinationAddress),
      ]);

      const distKm = haversineKm(pickup.lat, pickup.lng, dest.lat, dest.lng);
      const weight = parseFloat(weightKg) || 0;

      const matchingTier = pricingTiers
        .filter(t => t.shipping_method === shippingMethod)
        .find(t => distKm >= t.min_distance_km && (t.max_distance_km === null || distKm <= t.max_distance_km));

      if (!matchingTier) throw new Error('No pricing tier found for this route. Please contact us directly.');

      const fee = calcFee(matchingTier, distKm, weight);

      setQuoteResult({
        distanceKm: distKm,
        fee: Math.ceil(fee * 100) / 100,
        currency: matchingTier.currency,
        tierId: matchingTier.id,
        tierName: matchingTier.name,
        pickupLat: pickup.lat, pickupLng: pickup.lng,
        destLat: dest.lat, destLng: dest.lng,
        formattedPickup: pickup.formatted,
        formattedDest: dest.formatted,
      });
      setAmountClaimed(String(Math.ceil(fee * 100) / 100));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Geocoding failed. Please check the address.');
    } finally {
      setGeocoding(false);
    }
  };

  // ─── Create Shipment record (on quote confirm) ────────
  const handleConfirmQuote = async () => {
    if (!quoteResult) return;
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        shipment_type: shipmentType,
        shipment_category: category,
        shipping_method: shippingMethod,

        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone || null,

        recipient_name: shipmentType === 'send_to_other' ? recipientName : null,
        recipient_email: shipmentType === 'send_to_other' ? recipientEmail : null,
        recipient_phone: shipmentType === 'send_to_other' ? recipientPhone || null : null,
        recipient_address: shipmentType === 'send_to_other' ? recipientAddress || null : null,

        pickup_address: quoteResult.formattedPickup,
        pickup_latitude: quoteResult.pickupLat,
        pickup_longitude: quoteResult.pickupLng,
        destination_address: quoteResult.formattedDest,
        destination_latitude: quoteResult.destLat,
        destination_longitude: quoteResult.destLng,
        distance_km: quoteResult.distanceKm,

        package_description: packageDesc || null,
        weight_kg: parseFloat(weightKg) || 0,
        length_cm: lengthCm ? parseFloat(lengthCm) : null,
        width_cm: widthCm ? parseFloat(widthCm) : null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        num_packages: parseInt(numPackages) || 1,
        declared_value: declaredValue ? parseFloat(declaredValue) : null,
        special_handling: specialHandling || null,
        preferred_delivery_date: preferredDelivery || null,

        // Pet
        pet_name: category === 'pets' ? petName || null : null,
        pet_species: category === 'pets' ? petSpecies || null : null,
        pet_breed: category === 'pets' ? petBreed || null : null,
        pet_age: category === 'pets' ? petAge || null : null,
        pet_weight_kg: category === 'pets' && petWeightKg ? parseFloat(petWeightKg) : null,
        pet_crate_size: category === 'pets' ? petCrateSize || null : null,
        pet_health_status: category === 'pets' ? petHealthStatus || null : null,
        pet_special_care: category === 'pets' ? petSpecialCare || null : null,

        pricing_tier_id: quoteResult.tierId,
        transport_fee_amount: quoteResult.fee,
        transport_fee_currency: quoteResult.currency,

        current_status: 'SHIPMENT_CREATED',
        transport_fee_status: 'PENDING',
        security_deposit_status: 'PENDING',
      };

      const { data, error: dbError } = await supabase
        .from('shipments')
        .insert([payload])
        .select()
        .single();

      if (dbError) throw dbError;

      setShipmentId(data.id);
      setTrackingRef(data.id.slice(0, 8).toUpperCase()); // temp ref until admin assigns tracking number
      goNext(); // go to step 4 (transport fee)
    } catch (err: any) {
      console.error('Failed to create shipment:', err);
      setError(err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Handle payment proof file ────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    const file = e.target.files?.[0];
    if (!file) { setSelectedFile(null); return; }
    if (file.size > 5 * 1024 * 1024) { setFileError('File must be under 5 MB.'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic', 'application/pdf'];
    if (!allowed.includes(file.type)) { setFileError('Supported formats: JPG, PNG, HEIC, PDF.'); return; }
    setSelectedFile(file);
    if (file.type !== 'application/pdf') setPreviewUrl(URL.createObjectURL(file));
  };

  // ─── Submit payment proof ─────────────────────────────
  const handlePaymentSubmit = async (e: React.FormEvent, purpose: 'transport_fee' | 'security_deposit') => {
    e.preventDefault();
    if (!shipmentId || !selectedFile || !selectedMethodId) {
      setFileError('Please select a file and payment method.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setFileError(null);

      const ext = selectedFile.name.split('.').pop();
      const folder = purpose === 'transport_fee' ? 'transport-fees' : 'security-deposits';
      const path = `${folder}/${shipmentId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('shipment-proofs')
        .upload(path, selectedFile, { cacheControl: '3600', upsert: false, contentType: selectedFile.type });
      if (uploadErr) throw uploadErr;

      const updates: Record<string, unknown> =
        purpose === 'transport_fee'
          ? {
              transport_fee_status: 'SUBMITTED',
              transport_fee_proof_url: path,
              transport_fee_bank_id: selectedMethodId,
              transport_fee_amount_claimed: parseFloat(amountClaimed) || 0,
              transport_fee_reference: referenceNote || null,
            }
          : {
              security_deposit_status: 'SUBMITTED',
              security_deposit_proof_url: path,
              security_deposit_bank_id: selectedMethodId,
              security_deposit_amount_claimed: parseFloat(amountClaimed) || 0,
              security_deposit_reference: referenceNote || null,
            };

      const { error: dbErr } = await supabase.from('shipments').update(updates).eq('id', shipmentId);
      if (dbErr) throw dbErr;

      // Reset file state for next step
      setSelectedFile(null);
      setReferenceNote('');
      setAmountClaimed('');
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }

      setSubmittedPurpose(purpose);
      setStep(6);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

  // ─── Step progress indicator ──────────────────────────
  const StepIndicator = () => {
    const isResumeDeposit = !!resumeId && (step === 5 || (step === 6 && submittedPurpose === 'security_deposit'));
    const labels = isResumeDeposit 
      ? ['Security Deposit', 'Done'] 
      : ['Category', 'Package', 'Contact', 'Location & Quote', 'Transport Fee', 'Done'];

    let activeIndex = 0;
    if (isResumeDeposit) {
      activeIndex = step === 5 ? 0 : 1;
    } else {
      activeIndex = step === 6 ? 5 : step;
    }

    return (
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {labels.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                i < activeIndex ? 'bg-hprh-sage border-hprh-sage text-white'
                : i === activeIndex ? 'bg-hprh-clay border-hprh-clay text-white'
                : 'border-hprh-pine/15 text-hprh-pine/30'
              }`}>
                {i < activeIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-wider whitespace-nowrap ${i === activeIndex ? 'text-hprh-clay font-bold' : 'text-hprh-pine/40'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 min-w-[16px] h-0.5 mb-5 transition-all ${i < activeIndex ? 'bg-hprh-sage' : 'bg-hprh-pine/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const ErrorBanner = () => error ? (
    <div className="bg-hprh-clay/10 border border-hprh-clay/20 rounded p-4 flex items-start gap-3 text-xs mt-4">
      <AlertCircle className="w-5 h-5 text-hprh-clay flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-mono font-bold uppercase text-hprh-clay block">Error</span>
        <p className="text-hprh-pine/80 mt-1">{error}</p>
      </div>
    </div>
  ) : null;

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="py-12 bg-hprh-paper min-h-screen">
      <Container className="max-w-3xl">

        {/* Page Header */}
        <div className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold">Ship With Us</span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-hprh-pine mt-1">
            Create a Shipment Request
          </h1>
          <p className="text-sm text-hprh-pine/60 mt-2 leading-relaxed">
            Complete the steps below to submit your shipment. You'll receive a reference number on completion.
          </p>
        </div>

        <StepIndicator />

        {/* ──────────────────────────────────
            STEP 0 — Category & Type
        ────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-display font-bold text-2xl text-hprh-pine">What are you shipping?</h2>

            {/* Shipment type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { value: 'self', icon: User, title: 'Transporting to Myself', desc: 'You are the sender and recipient. Enter your details once.' },
                { value: 'send_to_other', icon: Users, title: 'Sending to Someone Else', desc: 'Separate sender and recipient information will be collected.' },
              ] as const).map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setShipmentType(opt.value)}
                    className={`text-left border-2 rounded-xl p-5 space-y-3 transition-all ${shipmentType === opt.value ? 'border-hprh-sage bg-hprh-sage/5 shadow-md' : 'border-hprh-pine/10 hover:border-hprh-sage/40'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${shipmentType === opt.value ? 'bg-hprh-sage text-white' : 'bg-hprh-pine/5 text-hprh-pine/50'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-hprh-pine">{opt.title}</h3>
                      <p className="text-xs text-hprh-pine/60 mt-1">{opt.desc}</p>
                    </div>
                    {shipmentType === opt.value && <span className="text-[9px] font-mono font-bold uppercase text-hprh-sage">Selected ✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Category */}
            <Select
              label="Shipment Category *"
              value={category}
              onChange={e => setCategory(e.target.value as ShipmentCategory)}
              options={CATEGORY_OPTIONS}
            />

            {/* Shipping Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { value: 'land', icon: '🚛', title: 'Land Transport', desc: 'Domestic routes. Trucks & ground freight.' },
                { value: 'air', icon: '✈️', title: 'Air Freight', desc: 'International routes. Faster, longer range.' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setShippingMethod(opt.value)}
                  className={`text-left border-2 rounded-xl p-4 flex items-center gap-4 transition-all ${shippingMethod === opt.value ? 'border-hprh-clay bg-hprh-clay/5' : 'border-hprh-pine/10 hover:border-hprh-clay/40'}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <h4 className="font-display font-bold text-sm text-hprh-pine">{opt.title}</h4>
                    <p className="text-[10px] text-hprh-pine/50 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Pet extra fields */}
            {category === 'pets' && (
              <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <PawPrint className="w-4 h-4 text-hprh-sage" />
                  <h3 className="font-display font-bold text-base text-hprh-pine">Pet Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Pet Name *" value={petName} onChange={e => setPetName(e.target.value)} placeholder="e.g. Buddy" />
                  <Select label="Species *" value={petSpecies} onChange={e => setPetSpecies(e.target.value)} options={SPECIES_OPTIONS} />
                  <Input label="Breed" value={petBreed} onChange={e => setPetBreed(e.target.value)} placeholder="e.g. Labrador Retriever" />
                  <Input label="Age" value={petAge} onChange={e => setPetAge(e.target.value)} placeholder="e.g. 3 years" />
                  <Input label="Pet Weight (kg) *" type="number" min="0" step="0.1" value={petWeightKg} onChange={e => setPetWeightKg(e.target.value)} placeholder="e.g. 18.5" />
                  <Select label="Travel Crate Size *" value={petCrateSize} onChange={e => setPetCrateSize(e.target.value)} options={CRATE_OPTIONS} placeholder="Select crate size" />
                </div>
                <Textarea label="Health / Vaccination Status (optional)" value={petHealthStatus} onChange={e => setPetHealthStatus(e.target.value)} placeholder="e.g. Up to date on all vaccinations, microchipped, vet-cleared for travel" rows={2} />
                <Textarea label="Special Care Instructions (optional)" value={petSpecialCare} onChange={e => setPetSpecialCare(e.target.value)} placeholder="e.g. Needs anxiety medication during travel, feed twice daily" rows={2} />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => { clearError(); goNext(); }} size="lg">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <ErrorBanner />
          </div>
        )}

        {/* ──────────────────────────────────
            STEP 1 — Package Details
        ────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-display font-bold text-2xl text-hprh-pine">Package Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Total Weight (kg) *" type="number" min="0.1" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 5.0" required />
              <Input label="Number of Packages *" type="number" min="1" step="1" value={numPackages} onChange={e => setNumPackages(e.target.value)} />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold block mb-2">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Length" type="number" min="0" value={lengthCm} onChange={e => setLengthCm(e.target.value)} placeholder="L" />
                <Input label="Width" type="number" min="0" value={widthCm} onChange={e => setWidthCm(e.target.value)} placeholder="W" />
                <Input label="Height" type="number" min="0" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="H" />
              </div>
            </div>

            <Input label="Declared Value (USD)" type="number" min="0" value={declaredValue} onChange={e => setDeclaredValue(e.target.value)} placeholder="e.g. 500" hint="For insurance purposes" />
            <Textarea label="Package Description *" value={packageDesc} onChange={e => setPackageDesc(e.target.value)} placeholder="Briefly describe the contents of your shipment" rows={2} />
            <Textarea label="Special Handling Instructions (optional)" value={specialHandling} onChange={e => setSpecialHandling(e.target.value)} placeholder="e.g. Handle with care — glass items. Keep upright at all times." rows={2} />
            <Input label="Preferred Delivery Date (optional)" type="date" value={preferredDelivery} onChange={e => setPreferredDelivery(e.target.value)} />

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={goPrev}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => {
                if (!weightKg || parseFloat(weightKg) <= 0) { setError('Please enter package weight.'); return; }
                clearError(); goNext();
              }} size="lg">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <ErrorBanner />
          </div>
        )}

        {/* ──────────────────────────────────
            STEP 2 — Contact Information
        ────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-display font-bold text-2xl text-hprh-pine">Contact Information</h2>

            {/* Sender */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-hprh-sage" />
                <h3 className="font-display font-bold text-base text-hprh-pine">
                  {shipmentType === 'self' ? 'Your Information' : 'Sender Information'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name *" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="John Smith" />
                <Input label="Email Address *" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="john@example.com" />
                <Input label="Phone Number" type="tel" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>
            </div>

            {/* Recipient (only if send_to_other) */}
            {shipmentType === 'send_to_other' && (
              <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-hprh-clay" />
                  <h3 className="font-display font-bold text-base text-hprh-pine">Recipient Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Recipient Full Name *" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Jane Doe" />
                  <Input label="Recipient Email" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="jane@example.com" />
                  <Input label="Recipient Phone" type="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="+1 555 111 2222" />
                  <Input label="Recipient Address" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} placeholder="123 Main St, City, State ZIP" />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={goPrev}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => {
                if (!senderName || !senderEmail) { setError('Sender name and email are required.'); return; }
                if (shipmentType === 'send_to_other' && !recipientName) { setError('Recipient name is required.'); return; }
                clearError(); goNext();
              }} size="lg">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <ErrorBanner />
          </div>
        )}

        {/* ──────────────────────────────────
            STEP 3 — Locations & Pricing
        ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-display font-bold text-2xl text-hprh-pine">Locations & Price Quote</h2>
            <p className="text-sm text-hprh-pine/60">
              Enter your pickup and delivery addresses. The system will calculate the distance and generate a price quote.
            </p>

            <form onSubmit={handleCalculateQuote} className="space-y-4">
              <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-hprh-sage" />
                  <h3 className="font-display font-bold text-base text-hprh-pine">Addresses</h3>
                </div>
                <Textarea
                  label="Pickup Address *"
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  placeholder="e.g. 100 Main St, Houston, TX 77001, USA"
                  required
                  rows={2}
                />
                <Textarea
                  label="Destination Address *"
                  value={destinationAddress}
                  onChange={e => setDestinationAddress(e.target.value)}
                  placeholder="e.g. 42 Elm Street, London, SW1A 2AA, UK"
                  required
                  rows={2}
                />
              </div>

              <Button type="submit" loading={geocoding} size="lg" className="w-full justify-center">
                Calculate Distance & Quote
              </Button>
            </form>

            {/* Quote Result */}
            {quoteResult && (
              <div className="bg-hprh-sage/5 border-2 border-hprh-sage/30 rounded-xl p-6 space-y-5 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-hprh-sage" />
                  <h3 className="font-display font-bold text-lg text-hprh-pine">Quote Ready!</h3>
                </div>

                <div className="space-y-3 bg-hprh-paper/60 border border-hprh-pine/10 rounded-lg p-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-hprh-sage flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Pickup Address</span>
                      <strong className="text-hprh-pine">{quoteResult.formattedPickup}</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 border-t border-hprh-pine/10 pt-3">
                    <MapPin className="w-3.5 h-3.5 text-hprh-clay flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Destination Address</span>
                      <strong className="text-hprh-pine">{quoteResult.formattedDest}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 border-t border-hprh-pine/10 pt-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Distance</span>
                    <span className="font-mono text-xl font-bold text-hprh-pine">{quoteResult.distanceKm.toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Tier</span>
                    <span className="text-sm font-semibold text-hprh-pine">{quoteResult.tierName}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Transport Fee</span>
                    <span className="font-mono text-3xl font-extrabold text-hprh-clay">
                      {quoteResult.fee.toLocaleString('en-US', { style: 'currency', currency: quoteResult.currency })}
                    </span>
                  </div>
                </div>

                <div className="bg-hprh-gold/10 border border-hprh-gold/20 rounded p-3 flex items-start gap-2 text-xs">
                  <Info className="w-4 h-4 text-hprh-gold/80 flex-shrink-0 mt-0.5" />
                  <p className="text-hprh-pine/70">
                    A <strong>security deposit</strong> will also be required. The admin team will notify you of the amount after reviewing your request.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={goPrev}><ArrowLeft className="w-4 h-4" /> Back</Button>
              {quoteResult && (
                <Button onClick={handleConfirmQuote} loading={submitting} size="lg">
                  Confirm & Proceed to Payment <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
            <ErrorBanner />
          </div>
        )}

        {/* ──────────────────────────────────
            STEP 4 — Transport Fee Payment
        ────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-hprh-sage" />
              <div>
                <h2 className="font-display font-bold text-2xl text-hprh-pine">Transport Fee Payment</h2>
                <p className="text-xs text-hprh-pine/60 mt-0.5">Step 1 of 2 — Pay the transport fee to proceed.</p>
              </div>
            </div>

            {/* Reference */}
            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase text-hprh-pine/40 block">Your Request Reference</span>
                <span className="font-mono text-sm font-bold text-hprh-pine">{trackingRef}</span>
              </div>
              <button
                onClick={() => handleCopy(trackingRef)}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-hprh-sage hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Payment Methods */}
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 bg-hprh-paper-dark border border-dashed border-hprh-pine/15 rounded-xl text-xs text-hprh-pine/40">
                No payment methods configured. Please contact our team.
              </div>
            ) : (
              <form onSubmit={e => handlePaymentSubmit(e, 'transport_fee')} className="space-y-5">
                {/* Method selector */}
                {paymentMethods.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">Select Payment Method</label>
                    <div className="grid gap-2">
                      {paymentMethods.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMethodId(m.id)}
                          className={`flex items-center gap-3 border-2 rounded-lg p-3 text-left transition-all ${selectedMethodId === m.id ? 'border-hprh-sage bg-hprh-sage/5' : 'border-hprh-pine/10 hover:border-hprh-sage/40'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedMethodId === m.id ? 'border-hprh-sage bg-hprh-sage' : 'border-hprh-pine/20'}`}>
                            {selectedMethodId === m.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-xs font-semibold text-hprh-pine">{m.display_label || m.bank_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected method details */}
                {selectedMethod && (
                  <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/70 border-b border-hprh-pine/10 pb-2">
                      {selectedMethod.display_label || selectedMethod.bank_name}
                    </h4>
                    {[
                      selectedMethod.account_name && { label: 'Account Name', val: selectedMethod.account_name },
                      selectedMethod.account_number && { label: 'Account Number', val: selectedMethod.account_number },
                      selectedMethod.routing_number && { label: 'Routing Number', val: selectedMethod.routing_number },
                      selectedMethod.swift_code && { label: 'SWIFT/BIC', val: selectedMethod.swift_code },
                      selectedMethod.handle && { label: selectedMethod.method_type?.toUpperCase() || 'Handle', val: selectedMethod.handle },
                    ].filter(Boolean).map(row => {
                      const r = row as { label: string; val: string };
                      return (
                        <div key={r.label} className="flex items-center justify-between">
                          <span className="text-[10px] text-hprh-pine/50 font-mono uppercase">{r.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-hprh-pine">{r.val}</span>
                            <button type="button" onClick={() => handleCopy(r.val)} className="text-hprh-pine/40 hover:text-hprh-sage">
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {selectedMethod.notes && (
                      <p className="text-[10px] text-hprh-pine/50 bg-hprh-pine/5 rounded p-2 leading-relaxed">{selectedMethod.notes}</p>
                    )}
                  </div>
                )}

                {/* Upload */}
                <div className="space-y-3">
                  <Input
                    label="Amount Sent *"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountClaimed}
                    onChange={e => setAmountClaimed(e.target.value)}
                    hint="Enter the exact amount you transferred"
                  />
                  <Input
                    label="Transaction Reference / Note (optional)"
                    value={referenceNote}
                    onChange={e => setReferenceNote(e.target.value)}
                    placeholder="e.g. Bank confirmation number"
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">Payment Receipt *</label>
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-hprh-pine/20 rounded-xl p-6 cursor-pointer hover:border-hprh-sage/50 transition-all bg-hprh-paper-dark">
                      <Upload className="w-6 h-6 text-hprh-pine/40" />
                      <span className="text-xs text-hprh-pine/60">{selectedFile ? selectedFile.name : 'Click to upload receipt (JPG, PNG, PDF — max 5 MB)'}</span>
                      <input type="file" accept=".jpg,.jpeg,.png,.heic,.pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                    {fileError && <p className="text-[10px] text-hprh-clay">{fileError}</p>}
                    {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-48 rounded border border-hprh-pine/10 object-contain" />}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={goPrev}><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button type="submit" loading={submitting} size="lg">
                    Submit Proof <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <ErrorBanner />
              </form>
            )}
          </div>
        )}

        {/* ──────────────────────────────────
            STEP 5 — Security Deposit
        ────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-hprh-clay" />
              <div>
                <h2 className="font-display font-bold text-2xl text-hprh-pine">Security Deposit</h2>
                <p className="text-xs text-hprh-pine/60 mt-0.5">Step 2 of 2 — Refundable on successful delivery.</p>
              </div>
            </div>

            <div className="bg-hprh-gold/10 border border-hprh-gold/20 rounded-xl p-4 flex items-start gap-3 text-xs">
              <Info className="w-4 h-4 text-hprh-gold/80 flex-shrink-0 mt-0.5" />
              <p className="text-hprh-pine/70 leading-relaxed">
                The admin team will review your transport fee proof and contact you with the <strong>security deposit amount</strong>.
                If you've already been given the deposit amount, you may submit your proof below.
                Otherwise, await our confirmation email before proceeding.
              </p>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 bg-hprh-paper-dark border border-dashed border-hprh-pine/15 rounded-xl text-xs text-hprh-pine/40">
                No payment methods configured. Please contact our team.
              </div>
            ) : (
              <form onSubmit={e => handlePaymentSubmit(e, 'security_deposit')} className="space-y-5">
                {paymentMethods.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">Select Payment Method</label>
                    <div className="grid gap-2">
                      {paymentMethods.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMethodId(m.id)}
                          className={`flex items-center gap-3 border-2 rounded-lg p-3 text-left transition-all ${selectedMethodId === m.id ? 'border-hprh-sage bg-hprh-sage/5' : 'border-hprh-pine/10 hover:border-hprh-sage/40'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedMethodId === m.id ? 'border-hprh-sage bg-hprh-sage' : 'border-hprh-pine/20'}`}>
                            {selectedMethodId === m.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-xs font-semibold text-hprh-pine">{m.display_label || m.bank_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMethod && (
                  <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 space-y-3">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest font-bold text-hprh-pine/70 border-b border-hprh-pine/10 pb-2">
                      {selectedMethod.display_label || selectedMethod.bank_name}
                    </h4>
                    {[
                      selectedMethod.account_name && { label: 'Account Name', val: selectedMethod.account_name },
                      selectedMethod.account_number && { label: 'Account Number', val: selectedMethod.account_number },
                      selectedMethod.routing_number && { label: 'Routing Number', val: selectedMethod.routing_number },
                      selectedMethod.swift_code && { label: 'SWIFT/BIC', val: selectedMethod.swift_code },
                      selectedMethod.handle && { label: selectedMethod.method_type?.toUpperCase() || 'Handle', val: selectedMethod.handle },
                    ].filter(Boolean).map(row => {
                      const r = row as { label: string; val: string };
                      return (
                        <div key={r.label} className="flex items-center justify-between">
                          <span className="text-[10px] text-hprh-pine/50 font-mono uppercase">{r.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-hprh-pine">{r.val}</span>
                            <button type="button" onClick={() => handleCopy(r.val)} className="text-hprh-pine/40 hover:text-hprh-sage">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Input label="Deposit Amount Paid *" type="number" min="0" step="0.01" value={amountClaimed} onChange={e => setAmountClaimed(e.target.value)} hint="Enter the exact deposit amount you transferred" />
                <Input label="Transaction Reference (optional)" value={referenceNote} onChange={e => setReferenceNote(e.target.value)} placeholder="e.g. Bank confirmation number" />
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold">Deposit Receipt *</label>
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-hprh-pine/20 rounded-xl p-6 cursor-pointer hover:border-hprh-sage/50 transition-all bg-hprh-paper-dark">
                    <Upload className="w-6 h-6 text-hprh-pine/40" />
                    <span className="text-xs text-hprh-pine/60">{selectedFile ? selectedFile.name : 'Click to upload receipt (JPG, PNG, PDF — max 5 MB)'}</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.heic,.pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                  {fileError && <p className="text-[10px] text-hprh-clay">{fileError}</p>}
                  {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-48 rounded border border-hprh-pine/10 object-contain" />}
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={goPrev}><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button type="submit" loading={submitting} size="lg" variant="secondary">
                    Submit Deposit Proof <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <ErrorBanner />
              </form>
            )}
          </div>
        )}

        {/* ──────────────────────────────────
            STEP 6 — Confirmation
        ────────────────────────────────── */}
        {step === 6 && (
          <div className="text-center space-y-6 py-8 animate-in slide-in-from-bottom-2">
            <div className="w-20 h-20 bg-hprh-sage/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-hprh-sage" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-hprh-sage font-bold block">Submission Complete</span>
              <h2 className="font-display text-3xl font-extrabold text-hprh-pine">Thank You!</h2>
              {submittedPurpose === 'security_deposit' ? (
                <p className="text-sm text-hprh-pine/60 max-w-md mx-auto leading-relaxed">
                  Your security deposit proof has been submitted. Our team will verify it and finalize your dispatch updates. You can track your shipment status live using your tracking number.
                </p>
              ) : (
                <p className="text-sm text-hprh-pine/60 max-w-md mx-auto leading-relaxed">
                  Your shipment request and transport fee proof have been submitted. Our team will review your submission and contact you at <strong>{senderEmail}</strong> with the security deposit details within 1–2 business days.
                </p>
              )}
            </div>

            <div className="bg-hprh-paper-dark border border-hprh-pine/10 rounded-xl p-5 max-w-sm mx-auto space-y-2 text-left">
              <p className="text-[10px] font-mono uppercase text-hprh-pine/40">Request Reference</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-hprh-pine">{trackingRef}</span>
                <button onClick={() => handleCopy(trackingRef)} className="inline-flex items-center gap-1 text-[10px] font-mono text-hprh-sage hover:underline">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-hprh-pine/50">Keep this reference for your records. Once a tracking number is assigned, you can use it on the tracking page.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link to="/track" className="inline-flex items-center gap-2 bg-hprh-sage text-hprh-paper font-mono font-bold text-sm uppercase tracking-wider px-6 py-3 rounded hover:bg-hprh-sage/90 transition-all">
                <Search className="w-4 h-4" /> Track Shipment
              </Link>
              <Link to="/ship" className="inline-flex items-center gap-2 border-2 border-hprh-pine/20 text-hprh-pine font-mono font-bold text-sm uppercase tracking-wider px-6 py-3 rounded hover:border-hprh-sage hover:text-hprh-sage transition-all">
                <Package className="w-4 h-4" /> New Shipment
              </Link>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};

export default ShipmentForm;
