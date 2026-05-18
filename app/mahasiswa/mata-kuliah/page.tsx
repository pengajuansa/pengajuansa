"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import { ClockIcon } from '../../../components/icons';
import { supabase } from '../../../supabase/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

export default function MataKuliahPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchCourses(parsedUser.id);
    }
  }, []);

  const fetchCourses = async (userId: string) => {
    setLoading(true);

    // 1. Ambil SEMUA pendaftaran aktif
    const { data: pendaftarans } = await supabase
      .from('pendaftaran_sa')
      .select('id')
      .eq('mahasiswa_id', userId)
      .eq('status', 'Approved');

    if (pendaftarans && pendaftarans.length > 0) {
      const pIds = pendaftarans.map(p => p.id);
      
      // 2. Ambil MK yang didaftarkan
      const { data: items, error } = await supabase
        .from('pendaftaran_items')
        .select(`
          pendaftaran_id,
          mata_kuliah:mata_kuliah(
            id,
            nama_mk,
            sks,
            semester_asal
          )
        `)
        .in('pendaftaran_id', pIds);

      // 3. Ambil alokasi dosen secara eksplisit berdasarkan pendaftaran_id
      const { data: alokasis } = await supabase
        .from('alokasi_dosen')
        .select('mk_id, pendaftaran_id, dosen:users(nama_lengkap)')
        .in('pendaftaran_id', pIds);

      if (!error && items) {
        // Pemetaan data untuk UI
        const mappedData = items.map((item: any, index: number) => {
          const allocation = alokasis?.find(a => a.mk_id === item.mata_kuliah.id && a.pendaftaran_id === item.pendaftaran_id);
          const isAllocated = !!allocation;
          
          return {
            id: item.mata_kuliah.id,
            title: item.mata_kuliah.nama_mk,
            sks: item.mata_kuliah.sks || 0,
            semester: item.mata_kuliah.semester_asal || '-',
            dosen: isAllocated
              ? (Array.isArray(allocation.dosen)
                ? allocation.dosen[0]?.nama_lengkap
                : (allocation.dosen as any)?.nama_lengkap) || 'Menunggu Alokasi Kaprodi'
              : 'Menunggu Alokasi Kaprodi',
            status: isAllocated ? 'AKTIF' : 'PENDING',
            color: index % 3 === 0 ? '#1A365D' : index % 3 === 1 ? '#D97706' : '#991B1B'
          };
        });
        setCourses(mappedData);
      }
    }
    setLoading(false);
  };

  const handleDownloadKHS = async (course: any) => {
    if (!user) return;
    
    Swal.fire({
      title: 'Menyiapkan KHS...',
      text: 'Mohon tunggu, dokumen sedang dibuat',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 1. Ambil data Mahasiswa yang lengkap (prodi dll)
      const { data: studentData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // 2. Ambil data tugas & nilai untuk Mata Kuliah ini
      const { data: tasksData } = await supabase
        .from('tugas')
        .select(`
          id, judul,
          pengumpulan_tugas(nilai, mahasiswa_id)
        `)
        .eq('mk_id', course.id)
        .eq('mahasiswa_id', user.id);

      const tasks = tasksData || [];
      const tableRows: any[] = [];
      let totalNilai = 0;
      let gradedTasksCount = 0;

      tasks.forEach((t: any, index: number) => {
        const submission = t.pengumpulan_tugas?.find((s: any) => s.mahasiswa_id === user.id);
        const nilai = submission?.nilai !== null && submission?.nilai !== undefined ? parseFloat(submission.nilai) : 0;
        const status = submission ? (submission.nilai !== null ? 'Dinilai' : 'Menunggu Penilaian') : 'Belum Dikumpulkan';
        
        if (status === 'Dinilai') {
          totalNilai += nilai;
          gradedTasksCount++;
        }

        tableRows.push([
          index + 1,
          t.judul,
          status,
          status === 'Dinilai' ? nilai : '-'
        ]);
      });

      const nilaiAkhir = gradedTasksCount > 0 ? (totalNilai / gradedTasksCount).toFixed(2) : '0.00';
      
      let gradeHuruf = 'E';
      const naFloat = parseFloat(nilaiAkhir as string);
      if (naFloat >= 85) gradeHuruf = 'A';
      else if (naFloat >= 80) gradeHuruf = 'A-';
      else if (naFloat >= 75) gradeHuruf = 'B+';
      else if (naFloat >= 70) gradeHuruf = 'B';
      else if (naFloat >= 65) gradeHuruf = 'B-';
      else if (naFloat >= 60) gradeHuruf = 'C+';
      else if (naFloat >= 55) gradeHuruf = 'C';
      else if (naFloat >= 40) gradeHuruf = 'D';

      // 3. Generate PDF
      const doc = new jsPDF();

      // Header Kampus
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI", 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text("POLITEKNIK NEGERI MANADO", 105, 28, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("KARTU HASIL STUDI (KHS) - SEMESTER ANTARA", 105, 36, { align: 'center' });
      doc.line(20, 42, 190, 42); // Garis pembatas

      // Identitas Mahasiswa & MK
      doc.setFontSize(10);
      doc.text(`Nama Mahasiswa : ${studentData?.nama_lengkap || user.nama_lengkap}`, 20, 52);
      doc.text(`NIM / NIP      : ${studentData?.nim_nip || user.nim_nip}`, 20, 59);
      doc.text(`Program Studi  : ${studentData?.prodi || '-'}`, 20, 66);

      doc.text(`Mata Kuliah    : ${course.title}`, 110, 52);
      doc.text(`SKS / Semester : ${course.sks} / ${course.semester}`, 110, 59);
      doc.text(`Dosen Pengampu : ${course.dosen}`, 110, 66);

      // Tabel Nilai
      autoTable(doc, {
        startY: 75,
        head: [['No', 'Tugas', 'Status', 'Nilai (0-100)']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [26, 54, 93], textColor: 255 },
        styles: { fontSize: 9 }
      });

      // Total & Kesimpulan Nilai
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Nilai Akhir Rata-rata : ${nilaiAkhir}`, 20, finalY);
      doc.text(`Grade (Huruf Mutu)    : ${gradeHuruf}`, 20, finalY + 8);
      
      // Footer TTD
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Manado, ${today}`, 140, finalY + 20);
      doc.text("Dosen Pengampu", 140, finalY + 27);
      
      doc.setFont("helvetica", "bold");
      doc.text(course.dosen, 140, finalY + 50);

      // Save PDF
      doc.save(`KHS_SA_${course.title.replace(/\s+/g, '_')}_${user.nim_nip}.pdf`);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `KHS untuk ${course.title} telah diunduh.`,
        confirmButtonColor: '#1A365D'
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', 'Gagal membuat dokumen KHS: ' + err.message, 'error');
    }
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <h2 className="m-0 text-xl font-bold text-[#1A365D]">Data Mata Kuliah SA</h2>
      <div className="mx-4 h-5 w-px bg-gray-300"></div>
      <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Detail Akademik</span>
    </div>
  );

  return (
    <MainLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8">

        {/* Banner Area */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B2559] p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-4 text-4xl font-black tracking-tight leading-tight">Data Mata Kuliah <br />Semester Antara</h1>
            <p className="mb-8 text-blue-200 font-medium">Berikut adalah daftar lengkap Mata Kuliah yang telah disetujui beserta alokasi dosen pengampunya.</p>
          </div>
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full h-32 w-full rounded-2xl bg-gray-50 animate-pulse"></div>
          ) : courses.length > 0 ? (
            courses.map((item) => (
              <div key={item.id} className="relative flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-gray-50 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full" style={{ backgroundColor: item.color }}></div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] ${item.status === 'AKTIF' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {item.status}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    <ClockIcon />
                    {item.sks} SKS
                  </div>
                </div>

                <h4 className="mb-4 text-xl font-black text-[#1A365D] leading-tight line-clamp-2">{item.title}</h4>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Dosen Pengampu</p>
                    <p className={`text-sm font-bold truncate ${item.status === 'AKTIF' ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                      {item.dosen}
                    </p>
                  </div>
                  {item.status === 'AKTIF' && (
                    <button 
                      onClick={() => handleDownloadKHS(item)}
                      className="shrink-0 flex items-center justify-center rounded-xl bg-blue-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-[#1A365D] hover:text-white transition-all shadow-sm"
                    >
                      Unduh KHS
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/50 py-20 px-4 text-center">
              <span className="text-sm font-black uppercase tracking-widest text-gray-400">Belum ada mata kuliah yang disetujui</span>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aktif (Dialokasi)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-400"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menunggu Kaprodi</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
