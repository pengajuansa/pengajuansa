"use client";

import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import { supabase } from '../../../supabase/lib/supabase';
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

export default function DataMKAdmin() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mata_kuliah')
      .select('*')
      .order('nama_mk', { ascending: true });

    if (!error) {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const filteredMK = useMemo(() => {
    return courses.filter(c => 
      c.nama_mk?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.kode_mk?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: "Apakah Anda yakin ingin menghapus mata kuliah ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1A365D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan'
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from('mata_kuliah').delete().eq('id', id);
      if (!error) {
        setCourses(courses.filter(c => c.id !== id));
      } else {
        Swal.fire({
      title: 'Gagal',
      text: "Gagal menghapus: " + error.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
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
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const rowsToInsert = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        rowsToInsert.push({
          kode_mk: row.kode_mk,
          nama_mk: row.nama_mk,
          sks: parseInt(row.sks) || 0,
          semester_asal: parseInt(row.semester_asal) || 1,
          jurusan: row.jurusan,
          prodi: row.prodi,
          status_buka: true
        });
      }

      const { error } = await supabase.from('mata_kuliah').insert(rowsToInsert);

      if (error) {
        Swal.fire({
      title: 'Gagal',
      text: "Gagal import CSV: " + error.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
      } else {
        Swal.fire({
      title: 'Berhasil',
      text: `Berhasil mengimpor ${rowsToInsert.length} mata kuliah.`,
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
        fetchCourses();
      }
      setLoading(false);
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const topbarTitle = (
    <div>
      <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Manajemen Mata Kuliah</h2>
      <p className="text-xs font-semibold text-gray-500">Master kurikulum dan bobot SKS setiap mata kuliah</p>
    </div>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8">
        
        {/* Table Header / Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[2rem] bg-white p-5 md:p-8 shadow-sm border border-gray-50">
          <div className="flex gap-4 w-full sm:flex-grow sm:max-w-md">
            <input 
              type="text" 
              placeholder="Cari Kode atau Mata Kuliah..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="file" 
              id="csvMK" 
              accept=".csv" 
              className="hidden" 
              onChange={handleCSVUpload}
            />
            <label 
              htmlFor="csvMK"
              className="group flex items-center gap-2 rounded-2xl border-2 border-[#1A365D] px-5 py-3 text-xs font-black text-[#1A365D] hover:bg-gray-50 transition-all uppercase tracking-widest cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              IMPORT CSV
            </label>
            <Link 
              href="/admin/mata-kuliah/tambah"
              className="flex items-center gap-2 rounded-2xl bg-[#1A365D] px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap"
            >
              <PlusIcon /> TAMBAH MK
            </Link>
          </div>
        </div>

        {/* ── MOBILE: Card List ── */}
        <div className="md:hidden flex flex-col gap-2">
          {loading ? (
            <div className="py-16 text-center font-bold text-gray-300 uppercase tracking-widest animate-pulse">Menghubungkan ke Database...</div>
          ) : filteredMK.length > 0 ? filteredMK.map((course) => (
            <div key={`m-${course.id}`} className="rounded-2xl bg-white border border-gray-50 shadow-sm p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-[#1A365D] uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded">{course.kode_mk}</span>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{course.sks} SKS</span>
                    <span className="text-[10px] font-bold text-gray-400">Sem {course.semester_asal}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 line-clamp-2">{course.nama_mk}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mt-0.5">
                    {course.jurusan || '-'} • {course.prodi || '-'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/mata-kuliah/edit/${course.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm"
                  >
                    <EditIcon />
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-red-600 hover:text-white transition-all border border-gray-100 shadow-sm"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center font-bold text-gray-300 uppercase tracking-widest">Mata kuliah tidak ditemukan</div>
          )}
        </div>

        {/* ── DESKTOP: Table ── */}
        <div className="hidden md:block overflow-x-auto rounded-[2rem] bg-white shadow-sm border border-gray-50">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">KODE</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">MATA KULIAH</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">SKS</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">SEM</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">JURUSAN / PRODI</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center font-bold text-gray-300 uppercase tracking-widest animate-pulse">Menghubungkan ke Database...</td>
                </tr>
              ) : filteredMK.map((course) => (
                <tr key={`d-${course.id}`} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-[#1A365D] uppercase tracking-tighter">{course.kode_mk}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-900 group-hover:text-[#1A365D] transition-colors">
                    {course.nama_mk}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{course.sks}</span>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-gray-400">
                    {course.semester_asal}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#1A365D] uppercase tracking-tight">{course.jurusan || '-'}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{course.prodi || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/mata-kuliah/edit/${course.id}`}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-400 hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-200"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-400 hover:bg-red-600 hover:text-white transition-all border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-red-200"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredMK.length === 0 && (
            <div className="p-32 text-center">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-300">Mata kuliah tidak ditemukan</p>
            </div>
          )}

          <div className="bg-gray-50/30 p-6 md:p-8 flex items-center justify-between border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Kurikulum Master: {filteredMK.length} MK</p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
