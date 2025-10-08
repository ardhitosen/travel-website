"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion } from 'framer-motion';

type Banner = { id?: number | string; imageUrl?: string; fact?: string; destination?: string };
type Destination = {
  id?: string | number;
  imageUrl?: string;
  name?: string;
  description?: string;
  highlights?: unknown;
};

type VisaAdmin = {
  id?: string | number;
  name?: string;
  duration?: string;
  processingTime?: string;
  price?: string;
  imageUrl?: string;
  requirements?: unknown;
  documents?: unknown;
};

type ItineraryAdmin = {
  id?: string | number;
  name?: string;
  city?: string;
  duration?: string;
  price?: string;
  highlights?: unknown;
  days?: unknown;
};

type Promotion = { id?: string | number; title?: string; description?: string; imageUrl?: string; position?: number; destination?: string };

const AdminPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [visas, setVisas] = useState<VisaAdmin[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryAdmin[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activeTab, setActiveTab] = useState<'banners'|'destinations'|'visas'|'itineraries'|'promos'>('banners');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!res.ok) return router.replace('/login');
        const j = await res.json().catch(() => ({}));
        if (!j.ok) return router.replace('/login');
      } catch (e) {
        console.error('Network or auth error:', e);
        router.replace('/login');
      }
    };
    check();
  }, [router]);

  const fetchAll = async () => {
    setLoading(true);
    const [bResponse, dResponse, visaResponse, itinResponse, pResponse] = await Promise.all([
      fetch('/api/banners'),
      fetch('/api/destinations'),
      fetch('/api/visa'),
      fetch('/api/itineraries'),
      fetch('/api/promotions'),
    ]);
    const b = bResponse.ok ? await bResponse.json() : [];
    const d = dResponse.ok ? await dResponse.json() : [];
    const v = visaResponse.ok ? await visaResponse.json() : [];
    const i = itinResponse.ok ? await itinResponse.json() : [];
    const p = pResponse.ok ? await pResponse.json() : [];

    setBanners(Array.isArray(b) ? b : []);
    setDestinations(Array.isArray(d) ? d : []);
    setVisas(Array.isArray(v) ? v : []);
    setItineraries(Array.isArray(i) ? i : []);
    setPromotions(Array.isArray(p) ? p : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'unknown' }));
      throw new Error(err?.error || 'Upload failed');
    }
    const data = await res.json();
    // API returns either { url } or { secure_url }
    return (data.url || data.secure_url) as string;
  };

  const addBanner = async (file: File | null, destination: string) => {
    const imageUrl = file ? await uploadFile(file) : '';
    await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, destination }),
    });
    await fetchAll();
  };

  const addPromotion = async (file: File | null, title: string, description: string) => {
    const imageUrl = file ? await uploadFile(file) : '';
    const res = await fetch('/api/promotions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl, title, description, position: 0 }) });
    if (!res.ok) throw new Error('Failed to create promotion');
    const created = await res.json().catch(() => null);
    // optimistically update local promotions list
    if (created) setPromotions(prev => [created, ...prev]);
  };

  const deleteBanner = async (id: number | string) => {
    if (!confirm('Delete this banner? This will remove the image from disk.')) return;
    const idNum = Number(id);
    const res = await fetch(`/api/banners/${idNum}`, { method: "DELETE" });
    if (!res.ok) {
      alert('Failed to delete banner');
      return;
    }
    await fetchAll();
    alert('Banner deleted');
  };

  // Inline edit dialog state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  // Visa / Itinerary edit state
  const [editingVisa, setEditingVisa] = useState<VisaAdmin | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<ItineraryAdmin | null>(null);

  const updateBanner = async (id: number | string, imageUrl: string | null, destination: string) => {
    const body: any = { destination };
    if (imageUrl) body.imageUrl = imageUrl;
    const res = await fetch(`/api/banners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Update failed');
    await fetchAll();
  };

  const normalizeHighlights = (h: unknown): string[] => {
    if (!h) return [];
    if (Array.isArray(h)) return h.map(String);
    try {
      const maybe = h as { values?: unknown };
      if (Array.isArray(maybe.values)) return maybe.values.map(String);
    } catch (err) {
      console.error('Error normalizing highlights:', err);
    }
    return [];
  };

  const safeJoin = (x: unknown, sep = ', ') => {
    if (!x) return '—';
    if (Array.isArray(x)) return x.map(String).join(sep) || '—';
    return String(x) || '—';
  };

  const safeLength = (x: unknown) => {
    if (!x) return 0;
    if (Array.isArray(x)) return x.length;
    try {
      const s = String(x);
      return s.length;
    } catch {
      return 0;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl animate-pulse delay-200" />
        <div className="absolute bottom-[-6rem] left-1/3 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl animate-pulse delay-500" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 sm:p-10 text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">Manage content, promotions, visas, and itineraries in one polished view.</p>
            </div>
            {loading && <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-500 px-4 py-2 text-sm shadow-inner">Loading...</div>}
          </div>

          <div className="mb-8">
            <nav className="flex flex-wrap gap-3">
              {(['banners','destinations','visas','itineraries','promos'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${activeTab===t
                    ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg shadow-sky-200/60 scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-800'}
                  `}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>
          </div>

      {/* BANNERS TAB */}
      {activeTab === 'banners' && (
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-2xl font-semibold text-slate-900">Banners</h2>
            <span className="text-sm text-slate-500">Upload and curate hero visuals for featured destinations and promos.</span>
          </div>
          <BannerForm onSubmit={addBanner} />

          <ul className="mt-6 space-y-4">
            {banners.map((b) => (
              <motion.li
                key={b.id}
                className="p-4 sm:p-5 bg-white/90 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-lg transition"
                whileHover={{ y: -2, scale: 1.01 }}
              >
                <div className="w-full sm:w-28 h-24 relative rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                  {b.imageUrl ? <img src={b.imageUrl} alt="banner" className="w-full h-full object-cover" /> : <div className="text-sm text-slate-400 p-3">No image</div>}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Destination</div>
                  <div className="text-lg font-semibold text-slate-800">{b.destination}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setEditingBanner(b)}>Edit</button>
                  <button className="px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600" onClick={() => deleteBanner(b.id ?? '')}>Delete</button>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>
      )}
      {/** Edit dialog */}
      {editingBanner && (
        <EditBannerDialog
          banner={editingBanner}
          onClose={() => setEditingBanner(null)}
          onSave={async (file, destination) => {
            try {
              let imageUrl: string | null = null;
              if (file) imageUrl = await uploadFile(file);
              await updateBanner(editingBanner.id ?? '', imageUrl, destination);
            } catch (err) {
              throw err;
            }
          }}
        />
      )}

      {/* DESTINATIONS TAB */}
      {activeTab === 'destinations' && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-2xl font-semibold text-slate-900">Destinations</h2>
            <span className="text-sm text-slate-500">Showcase travel hotspots with rich imagery, highlights, and stories.</span>
          </div>
          <DestinationForm onSubmit={async (file, name, description, highlights) => {
            const imageUrl = file ? await uploadFile(file) : '';
            await fetch('/api/destinations', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, description, imageUrl, highlights }) });
            await fetchAll();
          }} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {destinations.map((d) => {
              const dest = d as Destination;
              const highlights = normalizeHighlights(dest.highlights);
              return (
                <motion.div
                  key={dest.id}
                  className="p-5 bg-white/90 border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition flex flex-col gap-4"
                  whileHover={{ y: -3, scale: 1.01 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 relative rounded-xl overflow-hidden bg-slate-100">
                      {dest.imageUrl ? <img src={dest.imageUrl} alt={dest.name || 'Destination image'} className="w-full h-full object-cover" /> : <div className="text-sm text-slate-400 p-2">No image</div>}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">Destination</div>
                      <div className="text-xl font-semibold text-slate-800">{dest.name}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed">{dest.description}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Highlights</div>
                  <div className="text-sm text-slate-700">{highlights.join(", ") || '—'}</div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => router.push(`/admin/edit/destination/${dest.id}`)}>Edit</button>
                    <button className="px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600" onClick={async () => {
                      if (!confirm('Delete destination and its images? This is permanent.')) return;
                      const id = String(dest.id);
                      const res = await fetch(`/api/destinations/${id}`, { method: 'DELETE' });
                      if (!res.ok) { alert('Failed to delete'); return; }
                      await fetchAll();
                      alert('Deleted');
                    }}>Delete</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* PROMOS TAB */}
      {activeTab === 'promos' && (
        <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Create Promotion</h3>
                  <PromotionForm onSubmit={addPromotion} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Existing Promotions</h3>
                  <PromotionsList promos={promotions} onDeleted={() => { /* parent will manage state */ }} />
                </div>
              </div>
        </section>
      )}

      {/* VISAS & ITINERARIES */}
      {activeTab === 'visas' && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-2xl font-semibold text-slate-900">Visa Options</h2>
            <span className="text-sm text-slate-500">Craft compelling visa packages with processing info, requirements, and imagery.</span>
          </div>
          <VisaForm onSubmit={async (v) => {
            await fetch('/api/visa', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(v) });
            await fetchAll();
          }} destinations={destinations} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {visas.map((v) => (
              <motion.div key={v.id} className="p-5 bg-white/90 border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition flex flex-col gap-4" whileHover={{ y: -3, scale: 1.01 }}>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {v.imageUrl ? (
                      // show thumbnail if imageUrl exists
                      <img src={v.imageUrl} alt={v.name || 'visa image'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-slate-400 p-2">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-semibold text-slate-800">{v.name} — {v.duration}</div>
                        <div className="text-sm text-slate-500">{v.processingTime} • {v.price}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setEditingVisa(v)}>Edit</button>
                        <button className="px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600" onClick={async () => {
                          if (!confirm('Delete this visa?')) return;
                          const res = await fetch(`/api/visa/${v.id}`, { method: 'DELETE' });
                          if (!res.ok) { alert('Failed to delete'); return; }
                          await fetchAll();
                          alert('Deleted');
                        }}>Delete</button>
                      </div>
                    </div>
                    {/* destination not required in admin form */}
                    <div className="text-sm text-slate-600">Requirements: {safeJoin(v.requirements)}</div>
                    <div className="text-sm text-slate-600">Documents: {safeJoin(v.documents)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {editingVisa && (
            <VisaEditDialog visa={editingVisa} destinations={destinations} onClose={() => setEditingVisa(null)} onSave={async (payload) => {
              const res = await fetch(`/api/visa/${editingVisa.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
              if (!res.ok) throw new Error('Failed');
              await fetchAll();
            }} />
          )}
        </section>
      )}

      {activeTab === 'itineraries' && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-2xl font-semibold text-slate-900">Itineraries</h2>
            <span className="text-sm text-slate-500">Design immersive day-by-day journeys with highlights, pricing, and visuals.</span>
          </div>
          <ItineraryForm onSubmit={async (payload) => {
            // send full payload including destinationId or destinationName
            await fetch('/api/itineraries', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
            await fetchAll();
          }} destinations={destinations} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {itineraries.map((it) => (
              <motion.div key={it.id} className="p-5 bg-white/90 border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition flex flex-col gap-4" whileHover={{ y: -3, scale: 1.01 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold text-slate-800">{it.name} — {it.city}</div>
                    <div className="text-sm text-slate-500">{it.duration} • {it.price}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setEditingItinerary(it)}>Edit</button>
                    <button className="px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600" onClick={async () => {
                      if (!confirm('Delete this itinerary?')) return;
                      const res = await fetch(`/api/itineraries/${it.id}`, { method: 'DELETE' });
                      if (!res.ok) { alert('Failed to delete'); return; }
                      await fetchAll();
                      alert('Deleted');
                    }}>Delete</button>
                  </div>
                </div>
                {/* destination not required in admin list */}
                <div className="text-sm text-slate-600">Highlights: {safeJoin(it.highlights)}</div>
                <div className="text-sm text-slate-600">Days: {safeLength(it.days)}</div>
              </motion.div>
            ))}
          </div>

          {editingItinerary && (
            <ItineraryEditDialog itinerary={editingItinerary} onClose={() => setEditingItinerary(null)} onSave={async (payload) => {
              const res = await fetch(`/api/itineraries/${editingItinerary.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
              if (!res.ok) throw new Error('Failed');
              await fetchAll();
            }} destinations={destinations} />
          )}
        </section>
      )}
          </motion.div>
        </div>
      </div>
  );
};

const BannerForm = ({ onSubmit }: { onSubmit: (file: File | null, destination: string) => Promise<void> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [destinationInputLocal, setDestinationInputLocal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) { setError('Please select an image'); return; }
    setSubmitting(true);
    try {
      // delegate upload + create to parent so it can refresh state instantly
      await onSubmit(file, destination);
      setFile(null);
      setPreview(null);
      setDestination("");
      // clear
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/95 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 transition hover:shadow-md">
      <input type="file" accept="image/*" onChange={(e) => {
        setError(null);
        const f = e.target.files?.[0] || null;
        if (!f) { setFile(null); setPreview(null); return; }
        if (f.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
        if (!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type)) { setError('Unsupported image type'); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
      }} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
      {preview && <img src={preview} alt="preview" className="w-48 h-28 object-cover rounded-xl border border-slate-200" />}
      {error && <div className="text-sm text-rose-500">{error}</div>}
  <input type="text" placeholder="Name (e.g., Japan or promo)" value={destination} onChange={(e) => setDestination(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold shadow-sm hover:shadow-lg transition disabled:opacity-60" disabled={submitting || !file}>
        {submitting ? "Uploading..." : "Add Banner"}
      </button>
    </form>
  );
};

const DestinationForm = ({ onSubmit }: { onSubmit: (file: File | null, name: string, description: string, highlights: string[]) => Promise<void> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!name) { setError('Name is required'); return; }
      const hs = highlights.split(',').map(s => s.trim()).filter(Boolean);
      await onSubmit(file, name, description, hs);
      setFile(null);
      setPreview(null);
      setName("");
      setDescription("");
      setHighlights("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/95 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 mb-6 transition hover:shadow-md">
      <input type="file" accept="image/*" onChange={(e) => {
        setError(null);
        const f = e.target.files?.[0] || null;
        if (!f) { setFile(null); setPreview(null); return; }
        if (f.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
        if (!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type)) { setError('Unsupported image type'); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
      }} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
      {preview && <img src={preview} alt="preview" className="w-48 h-28 object-cover rounded-xl border border-slate-200" />}
      {error && <div className="text-sm text-rose-500">{error}</div>}
      <input type="text" placeholder="Name (e.g., Bali)" value={name} onChange={(e) => setName(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <input type="text" placeholder="Highlights (comma separated)" value={highlights} onChange={(e) => setHighlights(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-sm hover:shadow-lg transition disabled:opacity-60" disabled={submitting || !name}>{submitting ? 'Saving...' : 'Add Destination'}</button>
      </div>
    </form>
  );
};

const EditBannerDialog = ({ banner, onClose, onSave }: { banner: Banner | null; onClose: () => void; onSave: (file: File | null, destination: string) => Promise<void> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(banner?.imageUrl || null);
  const [destination, setDestination] = useState(banner?.destination || '');
  // Do not maintain title/description state here because the current
  // runtime database may not have those columns. Omitting them prevents
  // accidental writes that cause Prisma errors.
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPreview(banner?.imageUrl || null);
    setDestination(banner?.destination || '');
  // intentionally do not populate title/description.
  }, [banner]);

  if (!banner) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // upload file if needed
      let imageUrl: string | null = null;
      if (file) {
        const form = new FormData(); form.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: form });
        const j = await r.json().catch(() => ({} as any));
        imageUrl = j.url || j.secure_url || null;
      }
      // call parent-provided onSave so parent can refresh state
      const body: any = { destination };
      if (imageUrl) body.imageUrl = imageUrl;
      await onSave(file, destination);
      onClose();
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/95 border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <h3 className="text-lg font-semibold mb-3">Edit Banner</h3>
        <div className="flex flex-col gap-2">
          <input type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : banner?.imageUrl || null);
          }} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
          {preview && <img src={preview} alt="preview" className="w-full h-36 object-cover rounded-xl border border-slate-200" />}
          <input className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" value={destination} onChange={(e) => setDestination(e.target.value)} />
          {/* Title and short description inputs removed to avoid writing columns that may not exist in DB */}
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg transition" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Visa Form & Edit Dialog
const VisaForm = ({ onSubmit, destinations }: { onSubmit: (payload: any) => Promise<void>, destinations: Destination[] }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [price, setPrice] = useState('');
  const [validity, setValidity] = useState('');
  const [requirements, setRequirements] = useState('');
  const [documents, setDocuments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [destinationInputLocal, setDestinationInputLocal] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await (window as any).uploadFile ? await (window as any).uploadFile(file) : await (async () => { return await fetch('/api/upload', { method: 'POST', body: (() => { const f = new FormData(); f.append('file', file); return f; })() }).then(r=>r.json()).then(j=>j.url || j.secure_url) })();
      }
      const payload = {
        name, description, duration, processingTime, price, validity,
        requirements: requirements.split(',').map(s => s.trim()).filter(Boolean),
        documents: documents.split(',').map(s => s.trim()).filter(Boolean),
        destination: destinationInputLocal || '',
        ...(imageUrl ? { imageUrl } : {}),
      };
      await onSubmit(payload);
  setName(''); setDescription(''); setDuration(''); setProcessingTime(''); setPrice(''); setValidity(''); setRequirements(''); setDocuments(''); setFile(null); setPreview(null); setDestinationInputLocal('');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handle} className="p-6 bg-white/95 border border-slate-200 rounded-2xl shadow-sm mb-6 transition hover:shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={processingTime} onChange={e => setProcessingTime(e.target.value)} placeholder="Processing Time" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={validity} onChange={e => setValidity(e.target.value)} placeholder="Validity" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      </div>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <div className="mt-4 space-y-3">
        <label className="text-sm font-semibold text-slate-500">Destination (choose or add new)</label>
        <select value={destinationInputLocal} onChange={e => setDestinationInputLocal(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition w-full">
          <option value="">-- select existing destination --</option>
          {destinations.map(d => <option key={d.id} value={String(d.name)}>{d.name}</option>)}
        </select>
        <input value={destinationInputLocal} onChange={e => setDestinationInputLocal(e.target.value)} placeholder="Or type destination" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition w-full" />
      </div>
      <div className="mt-4">
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); setPreview(f ? URL.createObjectURL(f) : null); }} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
        {preview && <img src={preview} alt="preview" className="w-32 h-20 object-cover rounded-xl border border-slate-200 mt-3" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <input value={requirements} onChange={e => setRequirements(e.target.value)} placeholder="Requirements (comma separated)" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={documents} onChange={e => setDocuments(e.target.value)} placeholder="Documents (comma separated)" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      </div>
      <div className="flex justify-end mt-6">
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-sm hover:shadow-lg transition disabled:opacity-60" disabled={submitting || !name}>Add Visa</button>
      </div>
    </form>
  );
};

const VisaEditDialog = ({ visa, destinations, onClose, onSave }: { visa: any; destinations: Destination[]; onClose: () => void; onSave: (payload: any) => Promise<void> }) => {
  const [name, setName] = useState(visa?.name || '');
  const [description, setDescription] = useState(visa?.description || '');
  const [duration, setDuration] = useState(visa?.duration || '');
  const [processingTime, setProcessingTime] = useState(visa?.processingTime || '');
  const [price, setPrice] = useState(visa?.price || '');
  const [validity, setValidity] = useState(visa?.validity || '');
  const [requirements, setRequirements] = useState((visa?.requirements || []).join(', '));
  const [documents, setDocuments] = useState((visa?.documents || []).join(', '));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(visa?.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const [destinationEdit, setDestinationEdit] = useState(visa?.destination || '');

  useEffect(() => {
    setName(visa?.name || ''); setDescription(visa?.description || ''); setDuration(visa?.duration || ''); setProcessingTime(visa?.processingTime || ''); setPrice(visa?.price || ''); setValidity(visa?.validity || ''); setRequirements((visa?.requirements || []).join(', ')); setDocuments((visa?.documents || []).join(', ')); setPreview(visa?.imageUrl || null); setFile(null);
    setDestinationEdit(visa?.destination || '');
  }, [visa]);

  if (!visa) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const form = new FormData(); form.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: form });
        const j = await r.json().catch(() => ({} as any));
        imageUrl = j.url || j.secure_url || undefined;
      }
  const payload = { name, description, duration, processingTime, price, validity, requirements: requirements.split(',').map((s:any)=>s.trim()).filter(Boolean), documents: documents.split(',').map((s:any)=>s.trim()).filter(Boolean), destination: destinationEdit || '', ...(imageUrl ? { imageUrl } : {}) };
      await onSave(payload);
      onClose();
    } catch (err) {
      alert('Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/95 border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8">
        <h3 className="text-lg font-semibold mb-4">Edit Visa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={name} onChange={e=>setName(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={duration} onChange={e=>setDuration(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={processingTime} onChange={e=>setProcessingTime(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={price} onChange={e=>setPrice(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={validity} onChange={e=>setValidity(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        </div>
        <div className="mt-4 space-y-3">
          <label className="text-sm font-semibold text-slate-500">Destination</label>
          <select value={destinationEdit} onChange={e => setDestinationEdit(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition w-full">
            <option value="">-- select existing destination --</option>
            {destinations.map(d => <option key={d.id} value={String(d.name)}>{d.name}</option>)}
          </select>
          <input value={destinationEdit} onChange={e => setDestinationEdit(e.target.value)} placeholder="Or type destination" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition w-full" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-500">Image</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : (visa?.imageUrl || null));
          }} className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
          {preview && <img src={preview} alt="preview" className="w-48 h-28 object-cover rounded-xl border border-slate-200 mt-3" />}
        </div>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input value={requirements} onChange={e=>setRequirements(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={documents} onChange={e=>setDocuments(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg transition" onClick={handleSave} disabled={saving}>{saving? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

// --- Itinerary Form & Edit Dialog
const ItineraryForm = ({ onSubmit, destinations }: { onSubmit: (payload: any) => Promise<void>, destinations: Destination[] }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [highlights, setHighlights] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [days, setDays] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      // require a file upload as image source
      if (!file) {
        alert('Please select an image file for the itinerary');
        return;
      }
      // upload file
      let uploadedUrl: string | undefined;
      const form = new FormData(); form.append('file', file);
      const r = await fetch('/api/upload', { method: 'POST', body: form });
      const j = await r.json().catch(() => ({} as any));
      uploadedUrl = j.url || j.secure_url || undefined;
  const payload = { name, slug, city, duration, price, description, imageUrl: uploadedUrl || '', highlights: highlights.split(',').map(s=>s.trim()).filter(Boolean), destinationId: destinationId || null, days: days.map((d, idx)=>({ dayNumber: idx+1, activities: d.split('\n').map(s=>s.trim()).filter(Boolean) })) };
      await onSubmit(payload);
  setName(''); setSlug(''); setCity(''); setDuration(''); setPrice(''); setHighlights(''); setDestinationId('');
      setFile(null); setPreview(null); setDescription(''); setDays(['']);
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handle} className="p-6 bg-white/95 border border-slate-200 rounded-2xl mb-6 shadow-sm transition hover:shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <select value={destinationId} onChange={e=>setDestinationId(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition">
          <option value="">-- Select destination --</option>
          {destinations.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-sm font-semibold text-slate-500">Upload image</label>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); setPreview(f ? URL.createObjectURL(f) : null); }} className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
        {preview && <img src={preview} alt="preview" className="w-40 h-28 object-cover rounded-xl border border-slate-200 mt-3" />}
      </div>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <input value={highlights} onChange={e=>setHighlights(e.target.value)} placeholder="Highlights (comma separated)" className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
      <div className="mt-5">
        <label className="block text-sm font-semibold text-slate-500 mb-2">Days (one per block, activities newline-separated)</label>
        {days.map((d, idx) => (
          <div key={idx} className="mb-3 p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
            <label className="text-sm font-medium text-slate-600">Day {idx+1}</label>
            <textarea value={d} onChange={e => setDays(prev => { const copy = [...prev]; copy[idx] = e.target.value; return copy; })} placeholder={`Activities for day ${idx+1} (one per line)`} className="w-full border border-slate-200 px-3 py-2 rounded-lg mt-2 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" rows={3} />
            <div className="flex gap-2 mt-3">
              <button type="button" className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300" onClick={() => setDays(prev => { const copy = [...prev]; copy.splice(idx,1); return copy.length?copy:['']; })}>Remove Day</button>
            </div>
          </div>
        ))}
        <button type="button" className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg transition" onClick={() => setDays(prev => [...prev, ''])}>Add Day</button>
      </div>
      <div className="flex justify-end mt-6">
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-sm hover:shadow-lg transition disabled:opacity-60" disabled={submitting || !name || !destinationId || !file}>Add Itinerary</button>
      </div>
    </form>
  );
};

const ItineraryEditDialog = ({ itinerary, onClose, onSave, destinations }: { itinerary: any; onClose: () => void; onSave: (payload: any) => Promise<void>; destinations: Destination[] }) => {
  const [name, setName] = useState(itinerary?.name || '');
  const [slug, setSlug] = useState(itinerary?.slug || '');
  const [city, setCity] = useState(itinerary?.city || '');
  const [duration, setDuration] = useState(itinerary?.duration || '');
  const [price, setPrice] = useState(itinerary?.price || '');
  const [imageUrl, setImageUrl] = useState(itinerary?.imageUrl || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(itinerary?.imageUrl || null);
  const [description, setDescription] = useState(itinerary?.description || '');
  const [highlights, setHighlights] = useState((itinerary?.highlights || []).join(', '));
  const [destinationId, setDestinationId] = useState(itinerary?.destinationId || '');
  const [daysEdit, setDaysEdit] = useState<string[]>(() => (itinerary?.days || []).map((d:any) => Array.isArray(d.activities)?d.activities.join('\n') : ''));
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(itinerary?.name || ''); setSlug(itinerary?.slug || ''); setCity(itinerary?.city || ''); setDuration(itinerary?.duration || ''); setPrice(itinerary?.price || ''); setImageUrl(itinerary?.imageUrl || ''); setDescription(itinerary?.description || ''); setHighlights((itinerary?.highlights || []).join(', ')); setDestinationId(itinerary?.destinationId || ''); }, [itinerary]);

  useEffect(() => { setDaysEdit((itinerary?.days || []).map((d:any) => Array.isArray(d.activities)?d.activities.join('\n') : '')); }, [itinerary]);

  if (!itinerary) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // upload file first if provided
      let uploadedUrl: string | undefined;
      if (file) {
        const form = new FormData(); form.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: form });
        const j = await r.json().catch(() => ({} as any));
        uploadedUrl = j.url || j.secure_url || undefined;
      }
      const finalImage = uploadedUrl || imageUrl || undefined;
      const payload = { name, slug, city, duration, price, description, imageUrl: finalImage, highlights: highlights.split(',').map((s:any)=>s.trim()).filter(Boolean), destinationId: destinationId || null, days: daysEdit.map((d, idx) => ({ dayNumber: idx+1, activities: d.split('\n').map((s:string)=>s.trim()).filter(Boolean) })) };
      await onSave(payload);
      onClose();
    } catch (err) { alert('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/95 border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8">
        <h3 className="text-lg font-semibold mb-4">Edit Itinerary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={name} onChange={e=>setName(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={slug} onChange={e=>setSlug(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={city} onChange={e=>setCity(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={duration} onChange={e=>setDuration(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <input value={price} onChange={e=>setPrice(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
          <label className="w-full">
            <div className="text-sm font-semibold text-slate-500 mb-2">Destination</div>
            <select value={String(destinationId || '')} onChange={e=>setDestinationId(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg w-full focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition">
              <option value="">-- Select destination --</option>
              {destinations.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
            </select>
          </label>
        </div>
        <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />
        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-500">Or upload image</label>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); setPreview(f ? URL.createObjectURL(f) : (itinerary?.imageUrl || null)); }} className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer" />
          {preview && <img src={preview} alt="preview" className="w-48 h-28 object-cover rounded-xl border border-slate-200 mt-3" />}
        </div>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" placeholder="Short description" />
        <input value={highlights} onChange={e=>setHighlights(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-lg mt-4 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" />

        {/* Days editor - allow editing each day's activities (newline-separated) */}
        <div className="mt-5">
          <label className="block text-sm font-semibold text-slate-500 mb-2">Days (edit activities, one per line)</label>
          {daysEdit.map((d, idx) => (
            <div key={idx} className="mb-3 p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-slate-600">Day {idx + 1}</div>
                <div className="flex gap-2">
                  <button type="button" className="px-2 py-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300" onClick={() => setDaysEdit(prev => { const copy = [...prev]; copy.splice(idx,1); return copy.length?copy:['']; })}>Remove</button>
                </div>
              </div>
              <textarea value={d} onChange={e => setDaysEdit(prev => { const copy = [...prev]; copy[idx] = e.target.value; return copy; })} placeholder={`Activities for day ${idx+1} (one per line)`} className="w-full border border-slate-200 px-3 py-2 rounded-lg mt-2 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition" rows={4} />
            </div>
          ))}
          <button type="button" className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg transition" onClick={() => setDaysEdit(prev => [...prev, ''])}>Add Day</button>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg transition" onClick={handleSave} disabled={saving}>{saving? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

const PromotionForm = ({ onSubmit }: { onSubmit: (file: File | null, title: string, description: string) => Promise<void> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // handle file selection and create an object URL for preview; revoke previous URL to avoid leaks
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      if (preview) { try { URL.revokeObjectURL(preview); } catch {} }
      setFile(null);
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(f);
    if (preview) { try { URL.revokeObjectURL(preview); } catch {} }
    setFile(f);
    setPreview(url);
  };

  // cleanup when component unmounts
  React.useEffect(() => {
    return () => {
      if (preview) {
        try { URL.revokeObjectURL(preview); } catch {}
      }
    };
  }, [preview]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(file, title, description);
      // clear local state and revoke preview
      if (preview) { try { URL.revokeObjectURL(preview); } catch {} }
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handle} className="p-4 bg-white/95 border border-slate-200 rounded-2xl">
  <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700 file:font-semibold hover:file:bg-sky-100 cursor-pointer mb-2" />
      {preview && (
        <div className="mb-2 w-full">
          <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-xl border border-slate-200" />
        </div>
      )}
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full border border-slate-200 px-3 py-2 rounded-lg mb-2" />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="w-full border border-slate-200 px-3 py-2 rounded-lg mb-2" />
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white" disabled={submitting}>{submitting? 'Saving...' : 'Create Promotion'}</button>
      </div>
    </form>
  );
};

const PromotionsList = ({ promosEndpoint, promos, onDeleted }: { promosEndpoint?: string; promos?: any[]; onDeleted?: () => void }) => {
  const [list, setList] = useState<any[]>(Array.isArray(promos) ? promos : []);

  useEffect(() => {
    let mounted = true;
    // if parent provided promos, use them; otherwise fetch from endpoint
    if (Array.isArray(promos)) {
      setList(promos);
      return () => { mounted = false; };
    }
    (async () => {
      try {
        if (!promosEndpoint) return;
        const r = await fetch(promosEndpoint);
        if (!r.ok) return;
        const j = await r.json();
        if (mounted) setList(Array.isArray(j) ? j : []);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [promosEndpoint, promos]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this promotion?')) return;
    const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setList(prev => prev.filter(p => p.id !== id));
      if (onDeleted) onDeleted();
    } else alert('Delete failed');
  };

  return (
    <ul className="space-y-3">
      {list.map(p => (
        <li key={p.id} className="p-3 bg-white/90 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-20 h-12 bg-slate-100 rounded overflow-hidden">{p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : null}</div>
            <div>
              <div className="font-semibold">{p.title || p.fact || `Promo ${p.id}`}</div>
              <div className="text-sm text-slate-500">{p.description || ''}</div>
            </div>
          </div>
          <button className="px-3 py-1 rounded-xl bg-rose-500 text-white" onClick={() => handleDelete(p.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};
