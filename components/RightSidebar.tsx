"use client";

import React, { useEffect, useState } from 'react';
import { UploadIcon, CalendarIcon } from './icons';
import { supabase } from '../supabase/lib/supabase';
import Link from 'next/link';
import type { SAStatus } from '@/hooks/useSAStatus';

interface RightSidebarProps {
  user?: any;
  saStatus?: SAStatus;
}

export default function RightSidebar({ user, saStatus }: RightSidebarProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hanya fetch tugas jika kondisi SA sudah terpenuhi
  const shouldFetch =
    saStatus &&
    saStatus.sudahDaftar &&
    saStatus.sudahDisetujui &&
    saStatus.sudahAdaDosen &&
    saStatus.dosenIds.length > 0 &&
    saStatus.mkIds.length > 0;

  useEffect(() => {
    if (saStatus?.loading) return; // Tunggu status selesai diperiksa

    if (shouldFetch) {
      fetchTasks(saStatus!.dosenIds, saStatus!.mkIds);
    } else {
      setLoading(false);
      setTasks([]);
    }
  }, [saStatus?.loading, shouldFetch]);

  const fetchTasks = async (dosenIds: string[], mkIds: string[]) => {
    setLoading(true);

    if (!user?.id) {
      setLoading(false);
      return;
    }

    // 1. Ambil semua tugas relevan yang khusus untuk mahasiswa ini
    const { data: allTasks, error: tasksError } = await supabase
      .from('tugas')
      .select(`
        *,
        mata_kuliah:mata_kuliah(nama_mk)
      `)
      .eq('mahasiswa_id', user.id)
      .order('deadline', { ascending: true });

    // 2. Ambil pengumpulan tugas milik mahasiswa ini
    const { data: submissions, error: subsError } = await supabase
      .from('pengumpulan_tugas')
      .select('tugas_id')
      .eq('mahasiswa_id', user.id);

    if (!tasksError && allTasks) {
      const submittedIds = submissions?.map(s => s.tugas_id) || [];
      
      // Filter yang belum dikerjakan untuk "Tugas Mendatang"
      const upcoming = allTasks.filter(t => !submittedIds.includes(t.id));
      
      setTasks(upcoming.slice(0, 3)); // Tampilkan maksimal 3 tugas terdekat
      setCompletedCount(submittedIds.length);
    } else {
      if (tasksError) console.error('Error fetching tasks:', tasksError);
    }
    setLoading(false);
  };

  const getDeadlineInfo = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "Telah Berakhir";
    if (days === 0) return "Tenggat Hari Ini";
    if (days === 1) return "Tenggat Besok";
    return `Tenggat ${days} hari lagi`;
  };

  // ---------------------------------------------------------------
  // Jika status SA belum loading & kondisi belum terpenuhi:
  // tampilkan placeholder informatif
  // ---------------------------------------------------------------
  if (!saStatus?.loading && !shouldFetch) {
    let message = 'Daftarkan SA untuk melihat tugas dari dosen Anda.';
    if (saStatus?.sudahDaftar && !saStatus?.sudahDisetujui) {
      message = 'Menunggu persetujuan Sekjur...';
    } else if (saStatus?.sudahDaftar && saStatus?.sudahDisetujui && !saStatus?.sudahAdaDosen) {
      message = 'Menunggu alokasi dosen dari Kaprodi...';
    }

    return (
      <aside className="lg:sticky lg:top-[100px] flex flex-col gap-5 rounded-2xl bg-[#F8F9FA] border border-gray-100 p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="m-0 text-lg md:text-xl font-bold text-[#1A365D]">Tugas Mendatang</h3>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">0</span>
        </div>

        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📚
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            {message}
          </p>
          {!saStatus?.sudahDaftar && (
            <Link
              href="/mahasiswa/pendaftaran"
              className="mt-2 rounded-xl bg-[#1A365D] px-5 py-2.5 text-[10px] font-black text-white uppercase tracking-widest hover:scale-105 transition-all"
            >
              Daftar Sekarang
            </Link>
          )}
        </div>

        <div className="mt-2 flex items-start gap-3 rounded-xl bg-blue-50/50 p-4 border border-blue-100/50">
          <div className="mt-0.5 text-[#1A365D]">
            <CalendarIcon />
          </div>
          <div>
            <h5 className="mb-1 mt-0 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">INFO</h5>
            <p className="m-0 text-xs font-bold leading-tight text-[#1A365D]">Tugas hanya muncul setelah pendaftaran disetujui dan dosen dialokasikan.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="lg:sticky lg:top-[100px] flex flex-col gap-5">
      
      {/* Tugas Selesai Stats Card */}
      <div className="rounded-2xl bg-[#1A365D] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Tugas Telah Selesai</p>
          <Link href="/mahasiswa/tugas" className="text-[9px] font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors">
            Lihat Riwayat
          </Link>
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
           <h3 className="text-3xl font-black">{completedCount}</h3>
           <span className="text-xs font-bold text-blue-300">Tugas</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl bg-[#F8F9FA] border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="m-0 text-xl font-bold text-[#1A365D]">Tugas Mendatang</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {loading || saStatus?.loading ? (
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-10">Memuat Tugas...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50">
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                  new Date(task.deadline).getTime() - new Date().getTime() < 86400000 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {new Date(task.deadline).getTime() - new Date().getTime() < 86400000 ? 'URGENT' : 'NORMAL'}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                  {getDeadlineInfo(task.deadline)}
                </span>
              </div>
              <div>
                <h4 className="mb-1 mt-0 text-sm font-bold text-gray-900 leading-tight">{task.judul}</h4>
                <p className="m-0 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {task.mata_kuliah?.nama_mk || 'Mata Kuliah'}
                </p>
              </div>
              <Link href={`/mahasiswa/tugas/${task.id}`}>
                <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white p-3 text-[10px] font-black uppercase tracking-widest text-[#1A365D] transition-all hover:bg-gray-50 hover:shadow-sm active:scale-95">
                  <UploadIcon />
                  Kumpulkan
                </button>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-10">Belum ada tugas dari dosen.</p>
        )}
        </div>
      </div>
    </aside>
  );
}
