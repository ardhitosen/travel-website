"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Destination = { id?: string | number; name?: string; description?: string; imageUrl?: string; highlights?: any };

export default function EditDestinationPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ?? '';
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/destinations/${id}`);
        if (!res.ok) {
          setError(`Failed to load destination: ${res.status}`);
          setDestination(null);
          return;
        }
        const d = await res.json();
        setDestination(d);
        setName(d?.name || '');
        setDescription(d?.description || '');
        setHighlights(Array.isArray(d?.highlights) ? d.highlights.join(', ') : (typeof d?.highlights === 'string' ? d.highlights : ''));
        setPreview(d?.imageUrl || null);
      } catch (e: any) {
        setError(String(e || 'Unknown error'));
        setDestination(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const uploadFile = async (f: File) => {
    const form = new FormData();
    form.append('file', f);
    const r = await fetch('/api/upload', { method: 'POST', body: form });
    if (!r.ok) throw new Error('Upload failed');
    const j = await r.json().catch(() => ({} as any));
    return j.url || j.secure_url || '';
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let imageUrl = preview || '';
      if (file) {
        imageUrl = await uploadFile(file);
      }
      const hs = highlights.split(',').map(s => s.trim()).filter(Boolean);
      const payload: any = { name, description, highlights: hs };
      if (imageUrl) payload.imageUrl = imageUrl;

      const res = await fetch(`/api/destinations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        throw new Error(j?.error || `Failed to save (${res.status})`);
      }

      alert('Saved');
      router.push('/admin');
    } catch (e: any) {
      setError(String(e?.message || e || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!destination) return <div className="p-6">{error || 'Destination not found'}</div>;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl delay-200" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8">
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl p-6 sm:p-10 text-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold tracking-tight">Edit Destination</h1>
          </div>

          {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}

          <div className="p-4 bg-white/95 border border-slate-200 rounded-lg mb-4">
            <label className="text-sm text-slate-600">Image</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : destination?.imageUrl || null);
            }} className="block w-full mt-2 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sky-700" />
            {preview && <img src={preview} alt="preview" className="w-full h-48 object-cover rounded mt-3 border border-slate-200" />}
          </div>

          <div className="p-4 bg-white/95 border border-slate-200 rounded-lg mb-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full border border-slate-200 px-3 py-2 rounded-lg mb-2 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full border border-slate-200 px-3 py-2 rounded-lg mb-2 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            <input value={highlights} onChange={e => setHighlights(e.target.value)} placeholder="Highlights (comma separated)" className="w-full border border-slate-200 px-3 py-2 rounded-lg text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
          </div>

          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => router.push('/admin')} disabled={saving}>Cancel</button>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
