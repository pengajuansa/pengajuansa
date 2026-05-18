"use client";

import React from 'react';
import MainLayout from '../../../components/MainLayout';

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeadsetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18C21 19.1046 20.1046 20 19 20H17V13H21M3 18C3 19.1046 3.89543 20 5 20H7V13H3M3 18V21M12 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TerminalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 9L10 12L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92V19.92C22.0032 20.1986 21.9113 20.4687 21.7411 20.6871C21.5709 20.9055 21.3323 21.0594 21.064 21.124C20.4851 21.2662 19.8821 21.3392 19.28 21.34C16.1438 21.2934 13.1118 20.3013 10.5 18.5C8.06456 16.8375 6.06249 14.6543 4.66 12.12C2.93291 9.42168 1.99616 6.27985 2.00001 3.08001C2.00035 2.8028 2.07849 2.53123 2.2246 2.30231C2.37071 2.07338 2.57723 1.89831 2.81501 1.79001C3.12519 1.64299 3.46976 1.57864 3.82001 1.60001H6.82001C7.29177 1.59549 7.74903 1.76634 8.11326 2.08381C8.47748 2.40128 8.72589 2.84568 8.82001 3.32001C8.94639 4.31065 9.17646 5.28189 9.50001 6.21001C9.62675 6.57463 9.64687 6.9696 9.55747 7.34581C9.46808 7.72202 9.27318 8.0628 8.99001 8.33001L7.73001 9.59001C9.15545 12.0991 11.2335 14.1772 13.74 15.6L15.01 14.34C15.2772 14.0568 15.618 13.8619 15.9942 13.7725C16.3704 13.6831 16.7654 13.7033 17.13 13.83C18.0581 14.1536 19.0294 14.3836 20.02 14.51C20.4996 14.6062 20.9482 14.86 21.2678 15.2307C21.5874 15.6013 21.751 16.0585 21.74 16.53V16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BantuanPage() {
  const topbarTitle = (
    <h2 className="m-0 text-xl font-bold text-[#1A365D]">Polimdo Academic</h2>
  );

  return (
    <MainLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-6">
        
        {/* Header Area */}
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-[#1A365D] mb-3">Pusat Dukungan Mahasiswa</h1>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Kami di sini untuk membantu perjalanan akademik Anda. Temukan jawaban dari pertanyaan umum atau hubungi tim spesialis kami untuk bantuan lebih lanjut.
          </p>
        </div>

        <div className="flex gap-8">
          
          {/* Left Column */}
          <div className="flex w-2/3 flex-col gap-8">
            
            {/* FAQ Section */}
            <div className="rounded-2xl bg-gray-50 p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Pertanyaan Umum (FAQ)</h2>
                <button className="text-xs font-bold text-[#1A365D] hover:underline">Lihat Semua</button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <span className="font-bold text-gray-800">Bagaimana cara reset password portal?</span>
                  <div className="text-gray-400">
                    <ChevronDownIcon />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <span className="font-bold text-gray-800">Masalah pengisian KRS online?</span>
                  <div className="text-gray-400">
                    <ChevronDownIcon />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <span className="font-bold text-gray-800">Jadwal UTS/UAS belum muncul?</span>
                  <div className="text-gray-400">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="flex gap-6">
              <div className="flex-1 rounded-2xl bg-[#0F4C81] p-8 text-white shadow-md">
                <div className="mb-4 text-blue-200">
                  <HeadsetIcon />
                </div>
                <h3 className="text-xl font-bold mb-1">Bantuan Akademik</h3>
                <p className="text-xs text-blue-200 mb-6">Senin - Jumat | 08:00 - 16:00</p>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <PhoneIcon />
                  (0431) 888 123
                </div>
              </div>

              <div className="flex-1 rounded-2xl bg-[#87781F] p-8 text-white shadow-md">
                <div className="mb-4 text-yellow-200/60">
                  <TerminalIcon />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Technical Support IT</h3>
                <p className="text-xs text-yellow-100/60 mb-6">Layanan Gangguan Sistem</p>
                <div className="flex items-center gap-2 text-sm font-bold text-yellow-100/80">
                  <MailIcon />
                  it.support@polimdo.ac.id
                </div>
              </div>
            </div>

            {/* Image Banner */}
            <div className="relative overflow-hidden rounded-2xl h-64 flex items-center shadow-md mt-4">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="absolute inset-0 bg-[#0A1A36]/70"></div>
              
              <div className="relative z-10 flex w-full items-center justify-between p-10">
                <p className="max-w-xs text-xl font-medium italic leading-relaxed text-white">
                  "Pendidikan adalah senjata paling ampuh untuk mengubah dunia."
                </p>
                <div className="max-w-sm pl-12 border-l border-white/20 text-white">
                  <h3 className="text-2xl font-bold mb-4">Panduan Pengguna Terpadu</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">
                    Unduh panduan lengkap penggunaan Portal Akademik Polimdo untuk mahasiswa. Dokumentasi mencakup tutorial video dan langkah-langkah tertulis.
                  </p>
                  <button className="flex items-center gap-2 font-bold text-white hover:text-gray-200">
                    Unduh PDF Panduan (12MB)
                    <DownloadIcon />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Support Form) */}
          <div className="w-1/3">
            <div className="rounded-2xl bg-gray-200/50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kirim Tiket Bantuan</h3>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Tim kami akan merespons dalam waktu maksimal 1×24 jam kerja.
              </p>

              <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    KATEGORI MASALAH
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border-none bg-gray-100 p-4 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#1A365D]">
                      <option>Masalah Login/Sistem</option>
                      <option>Masalah KRS/KHS</option>
                      <option>Masalah Pembayaran</option>
                      <option>Lainnya</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    SUBJEK
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ringkasan singkat masalah" 
                    className="w-full rounded-xl border-none bg-gray-100 p-4 text-sm outline-none focus:ring-2 focus:ring-[#1A365D] placeholder-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    DETAIL PESAN
                  </label>
                  <textarea 
                    placeholder="Jelaskan masalah Anda secara detail..." 
                    rows={6}
                    className="w-full resize-none rounded-xl border-none bg-gray-100 p-4 text-sm outline-none focus:ring-2 focus:ring-[#1A365D] placeholder-gray-400"
                  ></textarea>
                </div>

                <button 
                  type="button" 
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C81] py-4 text-sm font-bold text-white transition-opacity hover:bg-[#0a3a66]"
                >
                  <SendIcon />
                  Kirim Laporan
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
