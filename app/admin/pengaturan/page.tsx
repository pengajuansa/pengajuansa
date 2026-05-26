"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { fetchPengaturan, updatePengaturan, type Pengaturan } from '../../../supabase/lib/pengaturan';
import Swal from 'sweetalert2';

// ── Icons ────────────────────────────────────────────────────
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

type FieldDef = {
  key: keyof Pengaturan;
  label: string;
  placeholder: string;
};

const GROUPS: { title: string; color: string; icon: string; fields: FieldDef[] }[] = [
  {
    title: 'Ketua Jurusan (Kajur)',
    color: 'blue',
    icon: '🎓',
    fields: [
      { key: 'kajur_nama', label: 'Nama Lengkap + Gelar', placeholder: 'cth. Dr. Budi Santoso, M.T.' },
      { key: 'kajur_nip',  label: 'NIP',                  placeholder: 'cth. NIP. 197001011995031001' },
    ],
  },
  {
    title: 'Sekretaris Jurusan (Sekjur)',
    color: 'indigo',
    icon: '📋',
    fields: [
      { key: 'sekjur_nama', label: 'Nama Lengkap + Gelar', placeholder: 'cth. Drs. Ahmad Fauzi, M.Kom.' },
      { key: 'sekjur_nip',  label: 'NIP',                  placeholder: 'cth. NIP. 197405232002121004' },
    ],
  },
  {
    title: 'Ketua Program Studi (Kaprodi)',
    color: 'violet',
    icon: '🏛️',
    fields: [
      { key: 'kaprodi_nama', label: 'Nama Lengkap + Gelar', placeholder: 'cth. Ir. Siti Rahma, M.Sc.' },
      { key: 'kaprodi_nip',  label: 'NIP',                  placeholder: 'cth. NIP. 196601011994032001' },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; badge: string; ring: string; btn: string }> = {
  blue:   { bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   ring: 'focus:ring-blue-500/20 focus:border-blue-400',   btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' },
  indigo: { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', ring: 'focus:ring-indigo-500/20 focus:border-indigo-400', btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20' },
  violet: { bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700', ring: 'focus:ring-violet-500/20 focus:border-violet-400', btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-900/20' },
};

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Pengaturan | null>(null);
  const [draft, setDraft]       = useState<Pengaturan | null>(null);
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [tableExists, setTableExists] = useState(true);

  const load = useCallback(async () => {
    const data = await fetchPengaturan();
    setSettings(data);
    setDraft(data);
    // Check if we're using real DB data (best-effort)
    try {
      const { createClient } = await import('@supabase/supabase-js');
      // We just rely on the helper's error handling — if it returned defaults, table might not exist
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveGroup = async (group: typeof GROUPS[0]) => {
    if (!draft) return;
    setSaving(s => ({ ...s, [group.title]: true }));
    const errors: string[] = [];

    for (const field of group.fields) {
      const val = draft[field.key];
      const err = await updatePengaturan(field.key, val);
      if (err) {
        errors.push(`${field.label}: ${err}`);
        // If table doesn't exist, flag it
        if (err.includes('42P01') || err.includes('does not exist')) {
          setTableExists(false);
        }
      }
    }

    setSaving(s => ({ ...s, [group.title]: false }));

    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        html: errors.map(e => `<p class="text-sm">${e}</p>`).join(''),
        confirmButtonColor: '#1A365D',
      });
    } else {
      setSettings({ ...draft });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan!',
        text: `Data ${group.title} berhasil diperbarui.`,
        confirmButtonColor: '#1A365D',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const hasChanged = (group: typeof GROUPS[0]) => {
    if (!settings || !draft) return false;
    return group.fields.some(f => draft[f.key] !== settings[f.key]);
  };

  return (
    <AdminLayout topbarTitle={
      <div className="flex items-center gap-3">
        <span className="text-red-600"><SettingsIcon /></span>
        <div>
          <h2 className="m-0 text-xl font-bold text-[#1A365D]">Pengaturan Pejabat</h2>
          <p className="m-0 text-xs text-gray-400 font-medium">Kelola nama & NIP pejabat struktural jurusan</p>
        </div>
      </div>
    }>
      <div className="flex flex-col gap-8 relative">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1A365D] to-[#1E3A8A] p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-200">
              <SettingsIcon /> Konfigurasi Sistem
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Manajemen Pejabat Struktural</h1>
            <p className="text-sm text-blue-200 font-medium max-w-lg">
              Perubahan di sini akan otomatis tercermin pada seluruh dokumen resmi yang dicetak sistem, termasuk <strong>Kartu Hasil Studi (KHS)</strong> dan formulir lainnya.
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* Table Not Exist Warning */}
        {!tableExists && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="font-bold text-orange-800 mb-2">⚠️ Tabel pengaturan belum dibuat di database</p>
            <p className="text-sm text-orange-700 mb-3">
              Jalankan SQL berikut sekali di <strong>Supabase Dashboard → SQL Editor</strong> untuk mengaktifkan fitur ini:
            </p>
            <pre className="text-xs bg-orange-100 rounded-xl p-4 overflow-x-auto text-orange-900 leading-relaxed">{`CREATE TABLE IF NOT EXISTS public.pengaturan (
  key   text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pengaturan" ON public.pengaturan;
CREATE POLICY "Public read pengaturan"
  ON public.pengaturan FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin write pengaturan" ON public.pengaturan;
CREATE POLICY "Admin write pengaturan"
  ON public.pengaturan FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

INSERT INTO public.pengaturan (key, value) VALUES
  ('kajur_nama',   'Marson James Budiman, SST., MT'),
  ('kajur_nip',    'NIP. 197503052003121002'),
  ('sekjur_nama',  'Maksy Sendiang, SST, MIT'),
  ('sekjur_nip',   'NIP. 197405232002121004'),
  ('kaprodi_nama', 'Ir. Maryam, M.Kom'),
  ('kaprodi_nip',  'NIP. 196601011994032001')
ON CONFLICT (key) DO NOTHING;`}</pre>
          </div>
        )}

        {/* Edit Groups */}
        {!draft ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A365D] border-t-transparent" />
          </div>
        ) : (
          GROUPS.map(group => {
            const c = COLOR_MAP[group.color];
            const changed = hasChanged(group);
            const isSaving = saving[group.title];
            return (
              <div key={group.title} className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                {/* Group Header */}
                <div className={`${c.bg} px-6 py-5 flex items-center justify-between border-b border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div>
                      <h3 className="font-black text-[#1A365D] text-base m-0">{group.title}</h3>
                      {changed && (
                        <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${c.badge}`}>
                          ● Ada Perubahan
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveGroup(group)}
                    disabled={isSaving || !changed}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black text-white shadow-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${c.btn}`}
                  >
                    {isSaving
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : <SaveIcon />
                    }
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>

                {/* Fields */}
                <div className="px-6 py-6 flex flex-col gap-5">
                  {group.fields.map(field => (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <PersonIcon />
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={draft[field.key]}
                        onChange={e => setDraft(d => d ? { ...d, [field.key]: e.target.value } : d)}
                        placeholder={field.placeholder}
                        className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:bg-white focus:ring-2 ${c.ring}`}
                      />
                      {draft[field.key] !== settings?.[field.key] && (
                        <p className="text-[10px] text-gray-400 font-medium">
                          Sebelumnya: <span className="font-bold text-gray-500">{settings?.[field.key]}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Info Note */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <div>
            <p className="text-sm font-bold text-blue-800 mb-1">Catatan Penting</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Perubahan nama dan NIP akan langsung terbaca pada dokumen KHS yang dicetak berikutnya. Dokumen yang sudah terunduh sebelumnya tidak terpengaruh.
              Pastikan penulisan sudah sesuai format resmi beserta gelar akademik.
            </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
