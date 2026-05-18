"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import { UploadIcon, ClockIcon } from '../../../components/icons';
import { supabase } from '../../../supabase/lib/supabase';
import Link from 'next/link';
import { useSAStatus } from '@/hooks/useSAStatus';

export default function TugasMahasiswa() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BELUM SELESAI');
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      setUserId(parsed.id);
    }
  }, []);

  // Cek status SA mahasiswa
  const saStatus = useSAStatus(userId);

  useEffect(() => {
    if (saStatus.loading) return;

    if (
      saStatus.sudahDaftar &&
      saStatus.sudahDisetujui &&
      saStatus.sudahAdaDosen &&
      saStatus.dosenIds.length > 0 &&
      saStatus.mkIds.length > 0 &&
      userId
    ) {
      fetchData(userId, saStatus.dosenIds, saStatus.mkIds);
    } else {
      setLoading(false);
    }
  }, [saStatus.loading, userId]);

  const fetchData = async (uid: string, dosenIds: string[], mkIds: string[]) => {
    setLoading(true);

    // 1. Ambil tugas yang BENAR-BENAR ditugaskan spesifik untuk mahasiswa ini
    const { data: tasksData, error: tasksError } = await supabase
      .from('tugas')
      .select(`
        *,
        mata_kuliah:mata_kuliah(nama_mk)
      `)
      .eq('mahasiswa_id', uid)
      .order('deadline', { ascending: true });

    // 2. Ambil data pengumpulan tugas milik mahasiswa ini
    const { data: submissionsData, error: subsError } = await supabase
      .from('pengumpulan_tugas')
      .select('tugas_id, nilai')
      .eq('mahasiswa_id', uid);

    if (!tasksError) setTasks(tasksData || []);
    if (!subsError) setSubmissions(submissionsData || []);
    setLoading(false);
  };

  const isSubmitted = (tugasId: string) => {
    return submissions.some(s => s.tugas_id === tugasId);
  };

  const filteredTasks = tasks.filter(task => {
    const submitted = isSubmitted(task.id);
    return activeTab === 'SELESAI' ? submitted : !submitted;
  });

  const topbarTitle = (
    <h2 className="m-0 text-xl font-bold text-[#1A365D]">Tugas Kuliah SA</h2>
  );

  // ---------------------------------------------------------------
  // Tampilan jika kondisi belum terpenuhi
  // ---------------------------------------------------------------
  if (!saStatus.loading && !(saStatus.sudahDaftar && saStatus.sudahDisetujui && saStatus.sudahAdaDosen)) {
    let icon = '📋';
    let title = 'Belum Ada Akses Tugas';
    let desc = 'Anda perlu mendaftar Semester Antara dan mendapat persetujuan untuk mengakses tugas kuliah SA.';

    if (saStatus.sudahDaftar && !saStatus.sudahDisetujui) {
      icon = '⏳';
      title = 'Menunggu Persetujuan Sekjur';
      desc = 'Pendaftaran Anda sedang dalam proses verifikasi oleh Sekretaris Jurusan.';
    } else if (saStatus.sudahDaftar && saStatus.sudahDisetujui && !saStatus.sudahAdaDosen) {
      icon = '👨‍🏫';
      title = 'Menunggu Alokasi Dosen';
      desc = 'Pendaftaran Anda sudah disetujui. Kaprodi sedang memproses alokasi dosen untuk mata kuliah Anda.';
    }

    return (
      <MainLayout topbarTitle={topbarTitle}>
        <div className="flex flex-col gap-8">
          {/* Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-12 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-black mb-4">Pusat Tugas & Penilaian</h1>
              <p className="text-gray-400 font-medium leading-relaxed">
                Daftar tugas akademik untuk mata kuliah Semester Antara Anda.
                Pastikan mengumpulkan tepat waktu untuk mendapatkan nilai maksimal.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          </div>

          {/* Info Card */}
          <div className="flex flex-col items-center gap-6 rounded-[2rem] bg-white py-20 px-10 text-center shadow-sm border border-gray-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-4xl border border-gray-100">
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1A365D] mb-3">{title}</h2>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">{desc}</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mt-4">
              <StatusStep done={saStatus.sudahDaftar} label="Daftar SA" />
              <div className="h-px w-12 bg-gray-200" />
              <StatusStep done={saStatus.sudahDisetujui} label="Disetujui Sekjur" />
              <div className="h-px w-12 bg-gray-200" />
              <StatusStep done={saStatus.sudahAdaDosen} label="Dosen Dialokasikan" />
              <div className="h-px w-12 bg-gray-200" />
              <StatusStep done={false} label="Tugas Aktif" />
            </div>

            <Link
              href={!saStatus.sudahDaftar ? '/mahasiswa/pendaftaran' : '/mahasiswa/riwayat'}
              className="mt-4 rounded-xl bg-[#1A365D] px-8 py-4 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-105 transition-all"
            >
              {!saStatus.sudahDaftar ? 'Daftar Semester Antara' : 'Pantau Status Pendaftaran'} →
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8">
        {/* Banner Area */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black mb-4">Pusat Tugas & Penilaian</h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Daftar tugas akademik untuk mata kuliah Semester Antara Anda. 
              Pastikan mengumpulkan tepat waktu untuk mendapatkan nilai maksimal.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-10 border-b border-gray-50 px-4">
          {['BELUM SELESAI', 'SELESAI'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-5 text-[11px] font-black tracking-[0.2em] transition-all uppercase ${
                activeTab === tab ? 'border-b-4 border-[#1A365D] text-[#1A365D]' : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-2 gap-8">
          {loading || saStatus.loading ? (
            <div className="col-span-2 py-20 text-center font-bold text-gray-300 uppercase tracking-widest">Sinkronisasi Database...</div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="group relative rounded-[2rem] bg-white p-8 shadow-sm border border-gray-50 transition-all hover:shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                    {task.mata_kuliah?.nama_mk || 'MK SA'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <ClockIcon />
                    {new Date(task.deadline).toLocaleDateString('id-ID')}
                  </div>
                </div>

                <h3 className="mb-10 text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors">
                  {task.judul}
                </h3>

                <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                  <div>
                    {activeTab === 'SELESAI' ? (
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">NILAI ANDA</span>
                        <span className="text-lg font-black text-green-600">
                          {submissions.find(s => s.tugas_id === task.id)?.nilai || 'Proses'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">BELUM DIKUMPULKAN</span>
                    )}
                  </div>
                  <Link href={`/mahasiswa/tugas/${task.id}`}>
                    <button className={`rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'SELESAI' ? 'bg-gray-50 text-gray-400 hover:bg-gray-100' : 'bg-[#1A365D] text-white shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95'
                    }`}>
                      {activeTab === 'SELESAI' ? 'Lihat Detail' : 'Upload Tugas'}
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-20 text-center">
              <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Tidak ada tugas dalam kategori ini.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function StatusStep({ done, label }: { done: boolean; label: string }) {
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
