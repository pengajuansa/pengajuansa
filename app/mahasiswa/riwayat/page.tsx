"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import { supabase } from '../../../supabase/lib/supabase';

export default function RiwayatAkademikPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    // Fetch data pendaftaran yang terhubung dengan mata kuliah yang diambil
    const { data, error } = await supabase
      .from('pendaftaran_sa')
      .select(`
        *,
        items:pendaftaran_items(
          mata_kuliah:mata_kuliah(nama_mk)
        )
      `)
      .eq('mahasiswa_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const topbarTitle = (
    <h2 className="m-0 text-xl font-bold text-[#1A365D]">Riwayat Akademik</h2>
  );

  return (
    <MainLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black mb-4">Riwayat Pengajuan</h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Daftar seluruh riwayat pendaftaran Semester Antara Anda. 
              Gunakan informasi ini untuk memantau status verifikasi dan bukti pembayaran.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>

        {/* Status List */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-50">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Kode REG</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Daftar Mata Kuliah</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Tanggal</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-300 uppercase tracking-widest animate-pulse">Menghubungkan ke Database...</td>
                </tr>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-[#1A365D] tracking-wider">{item.kode_pendaftaran}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        {item.items && item.items.length > 0 ? (
                          item.items.map((it: any, idx: number) => (
                            <span key={idx} className="text-sm font-bold text-gray-900">• {it.mata_kuliah?.nama_mk}</span>
                          ))
                        ) : (
                          <span className="text-xs font-bold text-gray-400 italic">MK Belum Dialokasikan</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[9px] font-black tracking-widest uppercase border ${
                        item.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                        item.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'Approved' ? 'bg-green-600' : item.status === 'Pending' ? 'bg-orange-600 animate-pulse' : 'bg-gray-400'}`}></div>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Belum ada data riwayat pendaftaran.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
