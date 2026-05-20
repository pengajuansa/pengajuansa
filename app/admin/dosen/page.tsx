"use client";

import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import { supabase, supabaseAuthClient } from '../../../supabase/lib/supabase';
import Swal from 'sweetalert2';

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function DataDosenAdmin() {
  const [dosen, setDosen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{ show: boolean, message: string }>({ show: false, message: "" });

  useEffect(() => {
    fetchDosen();
  }, []);

  const fetchDosen = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        alokasi_dosen(
          mata_kuliah(nama_mk)
        )
      `)
      .eq('role', 'dosen')
      .order('nama_lengkap', { ascending: true });

    if (!error) setDosen(data || []);
    setLoading(false);
  };

  const filteredDosen = useMemo(() => {
    return dosen.filter(d =>
      d.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nim_nip.includes(searchTerm)
    );
  }, [dosen, searchTerm]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: "Apakah Anda yakin ingin menghapus data dosen ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1A365D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan'
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) {
        setDosen(dosen.filter(d => d.id !== id));
        setNotification({ show: true, message: "Data dosen telah dihapus." });
      }
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split(/\r?\n/);
      
      if (lines.length < 2) {
        setNotification({ show: true, message: "File CSV kosong atau tidak valid" });
        setLoading(false);
        return;
      }

      // Deteksi Delimiter
      const firstLine = lines[0];
      const delimiters = [',', ';', '\t'];
      const delimiter = delimiters.reduce((prev, curr) => 
        (firstLine.split(curr).length > firstLine.split(prev).length) ? curr : prev
      );

      // Parser CSV yang mendukung tanda kutip (Regex)
      const parseCSVLine = (text: string, delim: string) => {
        const regex = new RegExp(`(?:${delim}|\\n|^)(?:"([^"]*(?:""[^"]*)*)"|([^"${delim}\\n]*))`, 'g');
        const results = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
          results.push((match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2]).trim());
        }
        return results;
      };

      const rawHeaders = parseCSVLine(firstLine, delimiter).map(h => 
        h.replace(/[^\x20-\x7E]/g, "").toLowerCase()
      );
      
      console.log("Headers Detected:", rawHeaders);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line, delimiter);
        const row: any = {};
        rawHeaders.forEach((header, index) => {
          if (header) row[header] = values[index] || "";
        });

        // Smart Mapping & Fallbacks
        const namaIdx = rawHeaders.findIndex(h => h.includes('nama') || h.includes('name'));
        const nipIdx = rawHeaders.findIndex(h => h.includes('nip') || h.includes('nim') || h.includes('id'));
        const emailIdx = rawHeaders.findIndex(h => h.includes('email') || h.includes('surel'));
        
        const nama = (namaIdx !== -1 ? values[namaIdx] : row.nama) || "Dosen Baru";
        const nip = (nipIdx !== -1 ? values[nipIdx] : row.nip) || "0000";
        let email = (emailIdx !== -1 ? values[emailIdx] : row.email) || "";
        
        // JIKA EMAIL KOSONG: Generate dari NIP (Wajib untuk Supabase Auth)
        if (!email || !email.includes('@')) {
          email = `${nip.replace(/\s+/g, '')}@polimdo.ac.id`;
          console.log(`Baris ${i + 1}: Email dibuat otomatis -> ${email}`);
        }

        const password = row.password || "Polimdo123!";
        const kodeMk = row.kode_mk || values[rawHeaders.findIndex(h => h.includes('kode'))] || "";

        try {
          let mkId = null;
          if (kodeMk) {
            const { data: mkData } = await supabase.from('mata_kuliah').select('id').eq('kode_mk', kodeMk).single();
            if (mkData) mkId = mkData.id;
          }

          const { data: authData, error: authError } = await supabaseAuthClient.auth.signUp({
            email: email,
            password: password,
            options: { data: { nama_lengkap: nama, role: 'dosen' } }
          });

          if (authError && !authError.message.includes("already registered")) throw authError;

          let userId = authData.user?.id;
          if (!userId && authError?.message.includes("already registered")) {
            const { data: signInData } = await supabaseAuthClient.auth.signInWithPassword({
              email: email,
              password: password
            }).catch(() => ({ data: { user: null } }));
            userId = signInData?.user?.id;
          }

          if (userId || authError?.message.includes("already registered")) {
            // Dapatkan ID User (baik baru maupun yang sudah ada)
            const targetId = userId || (await supabase.from('users').select('id').eq('email', email).single()).data?.id;

            if (targetId) {
              // 1. Sync ke tabel users
              await supabase.from('users').upsert({
                id: targetId, email, nama_lengkap: nama, nim_nip: nip,
                role: 'dosen', jurusan: row.jurusan || "Teknik Elektro", prodi: row.prodi || "Teknik Informatika", password
              });

              // 2. Sync ke tabel dosen (PENTING: Agar dosen lama tidak hilang dari list)
              await supabase.from('dosen').upsert({
                id: targetId,
                nip: nip,
                nama_dosen: nama,
                jurusan: row.jurusan || "Teknik Elektro",
                prodi: row.prodi || "Teknik Informatika",
                status: 'Aktif'
              });

              // 3. Alokasi Mata Kuliah
              if (mkId) {
                await supabase.from('alokasi_dosen').upsert({
                  dosen_id: targetId, mk_id: mkId, tahun_akademik: '2023/2024'
                }, { onConflict: 'dosen_id,mk_id' });
              }
              successCount++;
            }
          }
        } catch (err: any) {
          console.error(`Error baris ${i + 1} (${email}):`, err.message);
          errorCount++;
        }
      }

      setNotification({ show: true, message: `Import Selesai! Berhasil: ${successCount}, Gagal: ${errorCount}` });
      setLoading(false);
      fetchDosen();
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const topbarTitle = (
    <div>
      <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Manajemen Data Dosen</h2>
      <p className="text-xs font-semibold text-gray-500">Daftar master dosen pengajar Politeknik Negeri Manado</p>
    </div>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8 relative">

        {/* Toast Notification */}
        {notification.show && (
          <div className="fixed top-8 right-8 z-[110] flex items-center gap-3 rounded-2xl bg-[#0F172A] px-6 py-4 text-white shadow-2xl animate-in slide-in-from-right duration-500 border border-white/10">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <CheckIcon />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">{notification.message}</p>
          </div>
        )}

        {/* Table Header / Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[2rem] bg-white p-5 md:p-8 shadow-sm border border-gray-50">
          <div className="flex gap-4 w-full sm:flex-grow sm:max-w-md">
            <div className="relative flex-grow group">
              <input
                type="text"
                placeholder="Cari NIP atau Nama Dosen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-400 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              id="csvDosen"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <label
              htmlFor="csvDosen"
              className="group flex items-center gap-2 rounded-2xl border-2 border-[#1A365D] px-5 py-3 text-xs font-black text-[#1A365D] hover:bg-gray-50 transition-all uppercase tracking-widest cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              IMPORT CSV
            </label>
            <Link
              href="/admin/dosen/tambah"
              className="group flex items-center gap-2 rounded-2xl bg-[#1A365D] px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap"
            >
              <PlusIcon /> TAMBAH DOSEN
            </Link>
          </div>
        </div>

        {/* ── MOBILE: Card List ── */}
        <div className="md:hidden flex flex-col gap-2">
          {loading ? (
            <div className="py-16 text-center font-bold text-gray-400 uppercase tracking-widest animate-pulse">Sinkronisasi Data...</div>
          ) : filteredDosen.length > 0 ? filteredDosen.map((item, idx) => (
            <div key={`m-${item.id}-${idx}`} className="flex items-center gap-3 rounded-2xl bg-white border border-gray-50 shadow-sm p-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xs font-black text-blue-700 shadow-sm border border-blue-200/50">
                {item.nama_lengkap.charAt(0)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.nama_lengkap}</p>
                <p className="text-[10px] font-black text-blue-600 tracking-tighter">{item.nim_nip}</p>
                <p className="text-[10px] font-semibold text-gray-400 line-clamp-1">{item.alokasi_dosen?.[0]?.mata_kuliah?.nama_mk || 'Belum Dialokasikan'}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/admin/dosen/edit/${item.id}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm">
                  <EditIcon />
                </Link>
                <button onClick={() => handleDelete(item.id)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-red-600 hover:text-white transition-all border border-gray-100 shadow-sm">
                  <TrashIcon />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center font-bold text-gray-300 uppercase tracking-widest">Data dosen tidak ditemukan</div>
          )}
        </div>

        {/* ── DESKTOP: Table ── */}
        <div className="hidden md:block overflow-x-auto rounded-[2rem] bg-white shadow-sm border border-gray-50">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">NIP / NIDN</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">NAMA LENGKAP</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">MATA KULIAH PENGAMPU</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-300 uppercase tracking-widest">Sinkronisasi Data...</td></tr>
              ) : filteredDosen.map((item, idx) => (
                <tr key={`d-${item.id}-${idx}`} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-blue-600 tracking-tighter">{item.nim_nip}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xs font-black text-blue-700 shadow-sm border border-blue-200/50">
                        {item.nama_lengkap.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors">{item.nama_lengkap}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-500">
                    {item.alokasi_dosen?.[0]?.mata_kuliah?.nama_mk || 'Belum Dialokasikan'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/dosen/edit/${item.id}`} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-400 hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-200">
                        <EditIcon />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-400 hover:bg-red-600 hover:text-white transition-all border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-red-200">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredDosen.length === 0 && (
            <div className="p-32 text-center">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-300">Data dosen tidak ditemukan</p>
            </div>
          )}

          <div className="bg-gray-50/30 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Master Data: {filteredDosen.length} Dosen</p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
