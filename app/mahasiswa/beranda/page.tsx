"use client";

import { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import WelcomeBanner from '../../../components/WelcomeBanner';
import PortalAkademik from '../../../components/PortalAkademik';
import SemesterTimeline from '../../../components/SemesterTimeline';
import RightSidebar from '../../../components/RightSidebar';
import { useRouter } from 'next/navigation';
import { useSAStatus } from '@/hooks/useSAStatus';
import { supabase } from '../../../supabase/lib/supabase';
import Link from 'next/link';

export default function Beranda() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Cek sesi Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Fetch data profil terbaru dari database
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser(profile);
        // Sync ke localStorage untuk komponen lain jika perlu
        localStorage.setItem('user', JSON.stringify(profile));
      } else {
        // Fallback ke localStorage jika query gagal
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  // Cek status SA mahasiswa menggunakan hook terpusat
  const saStatus = useSAStatus(user?.id ?? null);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A365D] border-t-transparent"></div>
      </div>
    );
  }

  const topbarTitle = (
    <h2 className="m-0 text-xl font-bold text-[#1A365D]">Beranda</h2>
  );

  // ----------------------------------------------------------------
  // Kondisi: Portal Akademik & Tugas Mendatang hanya muncul jika
  //   1. Mahasiswa sudah mendaftar SA
  //   2. Sekjur sudah menyetujui (status = 'Approved')
  //   3. Kaprodi sudah mengalokasikan dosen ke MK yang didaftarkan
  // ----------------------------------------------------------------
  const portalVisible = saStatus.sudahDaftar && saStatus.sudahDisetujui && saStatus.sudahAdaDosen;

  return (
    <MainLayout topbarTitle={topbarTitle}>
      <div className="flex gap-6">
        {/* Left Main Content */}
        <div className="flex w-2/3 flex-col gap-6">
          <WelcomeBanner user={user} />

          {/* Portal Akademik — hanya jika sudah daftar & disetujui & ada dosen */}
          {saStatus.loading ? (
            <div className="flex items-center justify-center rounded-2xl bg-white py-10 shadow-sm border border-gray-50">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#1A365D] border-t-transparent"></div>
            </div>
          ) : portalVisible ? (
            <PortalAkademik mahasiswaId={user?.id} mkIds={saStatus.mkIds} />
          ) : (
            <PendaftaranBanner saStatus={saStatus} />
          )}

          {/* Timeline selalu tampil agar mahasiswa tahu progres pendaftarannya */}
          <SemesterTimeline />
        </div>

        {/* Right Sidebar */}
        <div className="w-1/3 shrink-0">
          <RightSidebar user={user} saStatus={saStatus} />
        </div>
      </div>
    </MainLayout>
  );
}

// ---------------------------------------------------------------
// Banner informatif ketika syarat belum terpenuhi
// ---------------------------------------------------------------
function PendaftaranBanner({ saStatus }: { saStatus: ReturnType<typeof useSAStatus> }) {
  // Tentukan pesan yang sesuai dengan kondisi
  let icon = '📋';
  let title = 'Daftarkan Semester Antara Anda';
  let description = 'Anda belum mendaftar Semester Antara. Silakan ajukan pendaftaran untuk mengakses Portal Akademik dan Tugas dari dosen Anda.';
  let actionLabel = 'Daftar Sekarang';
  let actionHref = '/mahasiswa/pendaftaran';
  let badgeText = 'BELUM MENDAFTAR';
  let badgeClass = 'bg-gray-100 text-gray-500';

  if (saStatus.sudahDaftar && !saStatus.sudahDisetujui) {
    icon = '⏳';
    title = 'Pendaftaran Sedang Diverifikasi';
    description = 'Pengajuan SA Anda sedang menunggu persetujuan dari Sekretaris Jurusan. Portal Akademik dan Tugas akan muncul setelah Sekjur menyetujui dan dosen dialokasikan oleh Kaprodi.';
    actionLabel = 'Pantau Status';
    actionHref = '/mahasiswa/riwayat';
    badgeText = 'MENUNGGU PERSETUJUAN SEKJUR';
    badgeClass = 'bg-orange-50 text-orange-600 border-orange-100';
  } else if (saStatus.sudahDaftar && saStatus.sudahDisetujui && !saStatus.sudahAdaDosen) {
    icon = '👨‍🏫';
    title = 'Menunggu Alokasi Dosen dari Kaprodi';
    description = 'Pendaftaran SA Anda telah disetujui oleh Sekjur. Saat ini Kaprodi sedang memproses alokasi dosen pengampu untuk mata kuliah Anda. Portal Akademik dan Tugas akan muncul setelah proses ini selesai.';
    actionLabel = 'Lihat Riwayat';
    actionHref = '/mahasiswa/riwayat';
    badgeText = 'MENUNGGU ALOKASI DOSEN';
    badgeClass = 'bg-blue-50 text-blue-600 border-blue-100';
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-3xl border border-gray-100">
          {icon}
        </div>
        <div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${badgeClass}`}>
            {badgeText}
          </span>
          <h3 className="mt-2 text-lg font-black text-[#1A365D]">{title}</h3>
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

      {/* Progress steps */}
      <div className="flex items-center gap-3">
        <Step done={saStatus.sudahDaftar} label="Daftar SA" />
        <div className="h-px flex-1 bg-gray-100" />
        <Step done={saStatus.sudahDisetujui} label="Disetujui Sekjur" />
        <div className="h-px flex-1 bg-gray-100" />
        <Step done={saStatus.sudahAdaDosen} label="Dosen Dialokasikan" />
        <div className="h-px flex-1 bg-gray-100" />
        <Step done={false} label="Portal & Tugas Aktif" />
      </div>

      <Link
        href={actionHref}
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1A365D] px-6 py-3 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
      >
        {actionLabel} →
      </Link>
    </div>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-colors ${done ? 'bg-[#1A365D] text-white' : 'bg-gray-100 text-gray-400'}`}>
        {done ? '✓' : '○'}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${done ? 'text-[#1A365D]' : 'text-gray-300'}`}>
        {label}
      </span>
    </div>
  );
}
