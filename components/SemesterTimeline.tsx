  "use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/lib/supabase';
import { useSAStatus } from '@/hooks/useSAStatus';

export default function SemesterTimeline() {
  const [user, setUser] = useState<any>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskStats, setTaskStats] = useState({ total: 0, submitted: 0, graded: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const saStatus = useSAStatus(user?.id ?? null);

  useEffect(() => {
    if (saStatus.sudahAdaDosen && user?.id) {
      fetchTaskProgress(user.id, saStatus.dosenIds, saStatus.mkIds);
    } else if (!saStatus.loading) {
      setLoadingTasks(false);
    }
  }, [saStatus.loading, saStatus.sudahAdaDosen, user?.id]);

  const fetchTaskProgress = async (uid: string, dosenIds: string[], mkIds: string[]) => {
    setLoadingTasks(true);
    
    // 1. Ambil semua tugas relevan khusus untuk mahasiswa ini
    const { data: tasks } = await supabase
      .from('tugas')
      .select('id')
      .eq('mahasiswa_id', uid);

    // 2. Ambil pengumpulan tugas
    const { data: subs } = await supabase
      .from('pengumpulan_tugas')
      .select('nilai')
      .eq('mahasiswa_id', uid);

    if (tasks) {
      const total = tasks.length;
      const submitted = subs?.length || 0;
      const graded = subs?.filter(s => s.nilai !== null).length || 0;
      setTaskStats({ total, submitted, graded });
    }
    setLoadingTasks(false);
  };

  const getStepStatus = (stepId: number) => {
    const dbStatus = saStatus.sudahDisetujui ? 'Approved' : (saStatus.sudahDaftar ? 'Pending' : 'Draft');

    // 1: Pembayaran
    if (stepId === 1) {
      return dbStatus === 'Draft' ? 'current' : 'completed';
    }
    // 2: Verifikasi
    if (stepId === 2) {
      if (dbStatus === 'Draft') return 'pending';
      return dbStatus === 'Pending' ? 'current' : 'completed';
    }
    // 3: Alokasi Dosen
    if (stepId === 3) {
      if (dbStatus !== 'Approved') return 'pending';
      return saStatus.sudahAdaDosen ? 'completed' : 'current';
    }
    // 4: Perkuliahan
    if (stepId === 4) {
      if (!saStatus.sudahAdaDosen) return 'pending';
      const isDone = taskStats.total > 0 && taskStats.submitted >= taskStats.total;
      return isDone ? 'completed' : 'current';
    }
    // 5: Penilaian
    if (stepId === 5) {
      const perkuliahanDone = taskStats.total > 0 && taskStats.submitted >= taskStats.total;
      if (!perkuliahanDone) return 'pending';
      const isGraded = taskStats.total > 0 && taskStats.graded >= taskStats.total;
      return isGraded ? 'completed' : 'current';
    }
    return 'pending';
  };

  const steps = [
    { id: 1, label: 'PEMBAYARAN' },
    { id: 2, label: 'VERIFIKASI' },
    { id: 3, label: 'ALOKASI DOSEN' },
    { id: 4, label: 'PERKULIAHAN' },
    { id: 5, label: 'PENILAIAN' },
  ];

  const completedCount = steps.filter(s => getStepStatus(s.id) === 'completed').length;
  
  // Hitung persentase progress untuk garis timeline (berdasarkan jumlah segmen antar tahap)
  const progressWidth = `${Math.max(0, (completedCount - 1) / (steps.length - 1)) * 100}%`;
  
  let currentStatusLabel = 'Belum Daftar';
  if (saStatus.sudahDaftar) currentStatusLabel = 'Menunggu Verifikasi Sekjur';
  if (saStatus.sudahDisetujui) currentStatusLabel = 'Disetujui Sekjur / Menunggu Dosen';
  if (saStatus.sudahAdaDosen) currentStatusLabel = 'Masa Perkuliahan Aktif';
  if (completedCount === 4) currentStatusLabel = 'Menunggu Penilaian Akhir';
  if (completedCount === 5) currentStatusLabel = 'Semester Antara Selesai';

  return (
    <div className="mt-2 rounded-2xl md:rounded-[2rem] bg-white px-4 md:px-10 py-6 md:py-10 shadow-sm border border-gray-50">
      <div className="mb-8 md:mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg md:text-xl font-black text-[#1A365D] uppercase tracking-tight">Perjalanan Semester Antara</h2>
          <p className="text-xs font-bold text-gray-400 mt-1">Status Utama: <span className="text-blue-600 uppercase tracking-widest">{currentStatusLabel}</span></p>
        </div>
        <span className="rounded-xl bg-blue-50 px-4 py-2 text-[10px] font-black text-[#1A365D] uppercase tracking-widest border border-blue-100 whitespace-nowrap">
          {completedCount} / 5 Tahap Selesai
        </span>
      </div>

      {/* Vertical Timeline on Mobile */}
      <div className="md:hidden flex flex-col gap-5 pl-2 py-2">
        {steps.map((step, idx) => {
          const stepStatus = getStepStatus(step.id);
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div 
                  className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white transition-all duration-500 z-10 ${
                    stepStatus === 'completed' ? 'bg-[#1A365D] text-white' : 
                    stepStatus === 'current' ? 'bg-[#1A365D] text-white shadow-xl' : 
                    'bg-gray-100 text-gray-300'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    <div className={`h-2.5 w-2.5 rounded-full ${stepStatus === 'current' ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-8 -my-1 ${stepStatus === 'completed' ? 'bg-[#1A365D]' : 'bg-gray-100'}`} />
                )}
              </div>
              <div className="flex flex-col mt-1">
                <span 
                  className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500 ${
                    stepStatus === 'current' ? 'text-[#1A365D]' :
                    stepStatus === 'completed' ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal Timeline on Desktop */}
      <div className="hidden md:block overflow-x-auto pb-2">
        <div className="relative flex justify-between px-5 pb-2 min-w-[500px]">
          {/* Container Garis Timeline */}
          <div className="absolute left-[30px] right-[30px] top-[14px] z-[1] h-1.5">
            <div className="h-full w-full rounded-full bg-gray-50"></div>
            <div 
              className="absolute left-0 top-0 z-[2] h-1.5 rounded-full bg-[#1A365D] transition-all duration-1000 ease-out shadow-sm" 
              style={{ width: progressWidth }}
            ></div>
          </div>

          {steps.map((step) => {
            const stepStatus = getStepStatus(step.id);
            return (
              <div key={step.id} className="relative z-[3] flex flex-col items-center gap-5">
                <div 
                  className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white transition-all duration-500 ${
                    stepStatus === 'completed' ? 'bg-[#1A365D] text-white' : 
                    stepStatus === 'current' ? 'bg-[#1A365D] shadow-xl' : 
                    'bg-gray-100 text-gray-300'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    <div className={`h-2.5 w-2.5 rounded-full ${stepStatus === 'current' ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                  )}
                </div>
                <span 
                  className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                    stepStatus === 'current' ? 'text-[#1A365D]' :
                    stepStatus === 'completed' ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
