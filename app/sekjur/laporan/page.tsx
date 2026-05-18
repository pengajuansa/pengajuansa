"use client";

import React, { useEffect, useState } from 'react';
import SekjurLayout from '../../../components/SekjurLayout';
import { supabase } from '../../../supabase/lib/supabase';

export default function LaporanSemesterPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pendaftaran_sa')
      .select(`
        *,
        mahasiswa:mahasiswa_id (
          nama_mahasiswa, 
          nim, 
          prodi
        )
      `)
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReportData(data);
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const topbarTitle = (
    <div>
      <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Laporan Semester Antara</h2>
      <p className="text-xs font-semibold text-gray-500">Rekapitulasi Mahasiswa Terdaftar & Disetujui</p>
    </div>
  );

  return (
    <SekjurLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-6" id="report-container">
        
        {/* Header Laporan (Hanya muncul saat print) */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold text-black uppercase tracking-widest">LAPORAN SEMESTER ANTARA</h1>
          <p className="text-sm font-semibold text-gray-600 uppercase mt-1">Politeknik Negeri Manado</p>
          <hr className="mt-4 border-2 border-black" />
        </div>

        <div className="flex justify-between items-center print:hidden">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Data Pendaftaran Lunas</h3>
            <p className="text-xs text-gray-500 mt-1">Menampilkan mahasiswa yang telah menyelesaikan administrasi</p>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-700/40 active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Unduh PDF
          </button>
        </div>

        {/* Mobile View: Cards (Hidden on print) */}
        <div className="block md:hidden print:hidden space-y-4">
          {loading ? (
            <div className="py-10 text-center font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memuat Data...</div>
          ) : reportData.length > 0 ? (
            reportData.map((item, index) => {
              const initials = item.mahasiswa?.nama_mahasiswa?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??';
              return (
                <div key={item.id} className="rounded-2xl bg-white p-5 border border-gray-50 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-xs font-black text-blue-700 shadow-sm border border-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">NO. {index + 1}</span>
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.mahasiswa?.nama_mahasiswa}</h4>
                      <p className="text-[10px] font-medium text-gray-500">{item.mahasiswa?.nim} • {item.mahasiswa?.prodi || 'Tidak Diketahui'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 bg-gray-50/50 rounded-xl p-3.5 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">STATUS</span>
                      <div>
                        <span className="inline-flex rounded-lg bg-green-50 px-2 py-0.5 text-[8px] font-black text-green-700 border border-green-100 uppercase">
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">TANGGAL DISETUJUI</span>
                      <span className="font-bold text-gray-800">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center font-bold text-gray-400 uppercase tracking-widest bg-white rounded-2xl border border-gray-50">
              Belum ada data yang disetujui.
            </div>
          )}
        </div>

        {/* Desktop & Print View: Table */}
        <div className="hidden md:block print:block rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold print:bg-white print:text-black">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">NIM</th>
                  <th className="px-6 py-4">Nama Mahasiswa</th>
                  <th className="px-6 py-4">Program Studi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Tanggal Disetujui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 print:divide-black">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center font-bold text-gray-400 uppercase tracking-widest">Memuat Data...</td>
                  </tr>
                ) : reportData.length > 0 ? (
                  reportData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.mahasiswa?.nim}</td>
                      <td className="px-6 py-4 font-bold text-[#1A365D]">{item.mahasiswa?.nama_mahasiswa}</td>
                      <td className="px-6 py-4 text-xs font-semibold">{item.mahasiswa?.prodi || 'Tidak Diketahui'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 print:bg-transparent print:p-0 print:text-black">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center font-bold text-gray-400 uppercase tracking-widest">Belum ada data yang disetujui.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white;
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          #report-container, #report-container * {
            visibility: visible;
          }
          #report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border-bottom: 1px solid black !important;
            padding: 12px 8px !important;
          }
          th {
            border-bottom: 2px solid black !important;
          }
        }
      `}} />
    </SekjurLayout>
  );
}
