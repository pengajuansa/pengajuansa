"use client";

import React, { useEffect, useState } from 'react';
import { ClockIcon } from './icons';
import Link from 'next/link';
import { supabase } from '../supabase/lib/supabase';

interface PortalAkademikProps {
  mahasiswaId?: string;
  mkIds?: string[]; // MK yang sudah didaftarkan mahasiswa
}

export default function PortalAkademik({ mahasiswaId, mkIds }: PortalAkademikProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mkIds && mkIds.length > 0) {
      // Ambil hanya MK yang terdaftar oleh mahasiswa
      fetchRegisteredCourses(mkIds);
    } else {
      setLoading(false);
    }
  }, [mkIds]);

  const fetchRegisteredCourses = async (ids: string[]) => {
    setLoading(true);

    // Ambil detail MK yang terdaftar beserta info dosen yang dialokasikan
    const { data, error } = await supabase
      .from('mata_kuliah')
      .select(`
        *,
        alokasi_dosen(
          dosen:users(nama_lengkap)
        )
      `)
      .in('id', ids)
      .limit(3);

    if (error) {
      console.error('Error fetching registered courses:', error);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const getStyle = (index: number) => {
    const styles = [
      { borderColor: 'bg-[#1A365D]', textColor: 'text-[#1A365D]', bgColor: 'bg-blue-50' },
      { borderColor: 'bg-[#D97706]', textColor: 'text-[#D97706]', bgColor: 'bg-yellow-50' },
      { borderColor: 'bg-[#991B1B]', textColor: 'text-[#991B1B]', bgColor: 'bg-red-50' }
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="mt-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="m-0 text-xl font-bold text-[#1A365D]">Portal Akademik</h2>
        <Link href="/mahasiswa/mata-kuliah" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#1A365D] hover:underline">
          LIHAT DATA MATA KULIAH →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="flex-1 py-10 text-center font-bold text-gray-300 uppercase tracking-widest">Memuat MK...</div>
        ) : courses.length > 0 ? (
          courses.map((course, index) => {
            const style = getStyle(index);
            // Ambil nama dosen pertama yang dialokasikan
            const dosenName = course.alokasi_dosen?.[0]?.dosen?.nama_lengkap || null;
            return (
              <div key={course.id} className="relative flex-1 overflow-hidden rounded-3xl bg-white p-7 shadow-sm border border-gray-50 transition-all hover:shadow-md">
                <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${style.borderColor}`}></div>
                
                <div className={`mb-4 inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] ${style.bgColor} ${style.textColor} border border-transparent hover:border-current transition-all`}>
                  MATA KULIAH SA
                </div>
                <h3 className="mb-3 mt-0 text-lg font-bold text-gray-900 leading-tight tracking-tight h-12 line-clamp-2">
                  {course.nama_mk}
                </h3>
                
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  <ClockIcon />
                  {course.sks} SKS • SEM {course.semester_asal}
                </div>

                {/* Nama dosen pengampu */}
                {dosenName && (
                  <div className="mb-8 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Dosen:</span>
                    <span className="text-[10px] font-bold text-gray-700 truncate">{dosenName}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">
                    <span>STATUS</span>
                    <span className="text-green-600">AKTIF</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-50 border border-gray-100">
                    <div 
                      className={`h-full rounded-full ${style.borderColor}`} 
                      style={{ width: `100%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 py-10 text-center font-bold text-gray-300 uppercase tracking-widest">Tidak ada mata kuliah terdaftar</div>
        )}
      </div>
    </div>
  );
}
