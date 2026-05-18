"use client";

import React from 'react';
import Link from 'next/link';
import KaprodiLayout from '../../../../components/KaprodiLayout';

// Icons
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5V4.5z"></path></svg>
);

const PaymentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default function DetailValidasiFormulir({ params }: { params: { id: string } }) {
  // Dummy data for the specific application
  const data = {
    id: params.id,
    nama: "Andi Saputra",
    nim: "22041011",
    prodi: "Teknik Informatika",
    semester: "6",
    ipk: "3.75",
    mk_sa: [
      { kode: "TI-402", nama: "Pemrograman Web Lanjut", sks: 4, alasan: "Mengulang (Nilai D)" },
      { kode: "TI-305", nama: "Basis Data Lanjut", sks: 3, alasan: "Akselerasi" }
    ],
    status_bayar: "LUNAS",
    tgl_bayar: "12 Juni 2024",
    bukti_bayar: "/images/dummy-receipt.jpg",
    catatan_sekjur: "Dokumen lengkap, bukti pembayaran telah diverifikasi secara fisik oleh bagian keuangan fakultas.",
    tgl_kirim: "15 Juni 2024, 10:24 WITA"
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href="/kaprodi/validasi-formulir" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-gray-50 hover:text-[#0F172A] transition-all shadow-sm border border-gray-100">
        <ChevronLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#0F172A]">Detail Pengajuan SA</h2>
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">ID PENGAJUAN: #SA-2024-00{data.id}</p>
      </div>
    </div>
  );

  return (
    <KaprodiLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        
        {/* Status Header */}
        <div className="rounded-3xl bg-[#0F172A] p-8 text-white flex items-center justify-between shadow-xl shadow-blue-900/10">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl font-black">
              {data.nama.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-2xl font-black">{data.nama}</h3>
              <p className="text-sm font-bold text-blue-300">NIM: {data.nim} • {data.prodi}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">STATUS SAAT INI</span>
            <div className="rounded-full bg-yellow-400 px-6 py-2 text-xs font-black text-[#0F172A] tracking-widest">MENUNGGU VALIDASI KAPRODI</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Side: Student & Course Info */}
          <div className="col-span-8 flex flex-col gap-8">
            
            {/* Akademik Info */}
            <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserIcon />
                </div>
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-[0.2em]">Informasi Akademik</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semester</span>
                  <span className="text-lg font-black text-[#0F172A]">{data.semester} <span className="text-xs text-gray-400">(Aktif)</span></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IPK Terakhir</span>
                  <span className="text-lg font-black text-blue-600">{data.ipk}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prodi</span>
                  <span className="text-lg font-black text-[#0F172A]">{data.prodi}</span>
                </div>
              </div>
            </div>

            {/* Courses Info */}
            <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <BookIcon />
                </div>
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-[0.2em]">Rencana Mata Kuliah SA</h4>
              </div>

              <div className="space-y-4">
                {data.mk_sa.map((mk, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl bg-gray-50/50 p-6 border border-gray-50">
                    <div>
                      <h5 className="text-base font-black text-[#0F172A]">{mk.nama}</h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{mk.kode}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{mk.sks} SKS</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ALASAN</span>
                      <span className="rounded-lg bg-white border border-gray-100 px-3 py-1.5 text-[10px] font-black text-orange-700 tracking-wider">{mk.alasan}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 rounded-2xl bg-blue-50/30 p-6 border border-blue-50">
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div>
                    <h6 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Catatan Sekjur</h6>
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed italic">"{data.catatan_sekjur}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Payment & Actions */}
          <div className="col-span-4 flex flex-col gap-8">
            
            {/* Payment Card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <PaymentIcon />
                </div>
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-[0.2em]">Pembayaran</h4>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Pembayaran</span>
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-black text-green-700 w-fit">
                    <CheckCircleIcon /> LUNAS
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal Verifikasi Keuangan</span>
                  <span className="text-sm font-bold text-gray-900">{data.tgl_bayar}</span>
                </div>
                
                <div className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 aspect-video flex flex-col items-center justify-center transition-all hover:bg-gray-100">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BUKTI TRANSFER</p>
                   <p className="text-[8px] font-bold text-blue-600 underline uppercase mt-1">Klik untuk Memperbesar</p>
                </div>
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex flex-col gap-4">
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0F172A] py-5 text-sm font-black text-white shadow-xl shadow-blue-900/20 hover:bg-green-600 transition-all hover:scale-[1.02] active:scale-95">
                <CheckCircleIcon /> VALIDASI & SETUJUI
              </button>
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-50 py-5 text-sm font-black text-red-600 border border-red-100 hover:bg-red-100 transition-all">
                KEMBALIKAN KE SEKJUR
              </button>
              <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest mt-2 px-4">
                Dikirim oleh Sekjur pada: <br/> {data.tgl_kirim}
              </p>
            </div>

          </div>
        </div>

      </div>
    </KaprodiLayout>
  );
}
