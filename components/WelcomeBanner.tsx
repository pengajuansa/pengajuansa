import React from 'react';

interface WelcomeBannerProps {
  user?: any;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#113a81] to-[#1a4a9c] p-5 md:p-8 text-white shadow-lg">
      <div className="relative z-10">
        <h1 className="mb-2 mt-0 text-xl md:text-3xl font-extrabold leading-[1.2]">
          Selamat datang kembali,<br/>{user?.nama_lengkap || 'Pengguna'}
        </h1>
        <p className="mb-6 md:mb-8 mt-0 text-sm text-blue-200">
          {user?.jurusan ? `${user.jurusan} • ` : ''}
          {user?.prodi || 'Program Studi'} • Semester {user?.semester || '-'}
        </p>
        
        <div className="flex flex-wrap gap-6 md:gap-12">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-300">NIM / NIP</span>
            <span className="text-base md:text-lg font-extrabold">{user?.nim_nip || '00000000'}</span>
          </div>
          {user?.role === 'mahasiswa' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-blue-300">IPK</span>
              <span className="text-base md:text-lg font-extrabold">{user?.ipk || '0.00'} / 4.00</span>
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-0 md:absolute md:right-0 md:top-0 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm border border-white/20">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          Status Aktif
        </div>
      </div>
      
      {/* Abstract Background Shapes */}
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      <div className="absolute top-0 right-1/4 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl"></div>
    </div>
  );
}
