"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminPage = () => {
  const [banners, setBanners] = useState<Array<Record<string, any>>>([]);
  const [destinations, setDestinations] = useState<Array<Record<string, any>>>([]);
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
        router.replace('/login');
      }
    };
    check();
  }, [router]);

  const fetchAll = async () => {
    setLoading(true);
    const [b, d] = await Promise.all([
      fetch("/api/banners").then(r => r.json()),
      fetch("/api/destinations").then(r => r.json()),
    ]);
    setBanners(b);
    setDestinations(d);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url as string;
  };

  const addBanner = async (file: File, fact: string, destination: string) => {
    const imageUrl = await uploadFile(file);
    await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, fact, destination }),
    });
    await fetchAll();
  };

  const deleteBanner = async (id: number) => {
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {loading && <div className="mb-4">Loading...</div>}

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Banners</h2>
        <BannerForm onSubmit={addBanner} />
        <ul className="mt-4 space-y-3">
          {banners.map((b) => (
            <li key={b.id} className="p-4 border rounded-lg flex items-center gap-4">
              <img src={b.imageUrl} alt="banner" className="w-24 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{b.destination}</div>
                <div className="text-sm text-gray-600">{b.fact}</div>
              </div>
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => deleteBanner(b.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {destinations.map((d) => {
            const dest = d as { id?: string | number; imageUrl?: string; name?: string; description?: string; highlights?: unknown };
            const highlights = Array.isArray(dest.highlights) ? dest.highlights : (dest.highlights && (dest.highlights as any).values) || [];
            return (
              <div key={dest.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <img src={dest.imageUrl} alt={dest.name} className="w-20 h-14 object-cover rounded" />
                  <div className="font-semibold">{dest.name}</div>
                </div>
                <div className="text-sm text-gray-600 mb-2">{dest.description}</div>
                <div className="text-sm">Highlights: {(Array.isArray(highlights) ? highlights : []).join(", ")}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const BannerForm = ({ onSubmit }: { onSubmit: (file: File, fact: string, destination: string) => Promise<void> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fact, setFact] = useState("");
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      await onSubmit(file, fact, destination);
      setFile(null);
      setFact("");
      setDestination("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg flex flex-col gap-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input type="text" placeholder="Destination (e.g., Japan)" value={destination} onChange={(e) => setDestination(e.target.value)} className="border px-3 py-2 rounded" />
      <input type="text" placeholder="Fun fact" value={fact} onChange={(e) => setFact(e.target.value)} className="border px-3 py-2 rounded" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting || !file}>
        {submitting ? "Uploading..." : "Add Banner"}
      </button>
    </form>
  );
};

export default AdminPage; 