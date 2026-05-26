"use client";

import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { supabase } from '../../../supabase/lib/supabase';
import Link from 'next/link';

export default function AdminMahasiswa() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false, message: "", type: 'success'
  });

  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [filteredProdi, setFilteredProdi] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    email: "",
    password: "",
    jurusan: "",
    prodi: "",
    ipk: "",
    semester: "1"
  });

  useEffect(() => {
    fetchStudents();
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.jurusan) {
      const selectedJurusan = jurusanList.find(j => j.nama_jurusan === formData.jurusan);
      if (selectedJurusan) {
        setFilteredProdi(prodiList.filter(p => p.jurusan_id === selectedJurusan.id));
      }
    } else {
      setFilteredProdi([]);
    }
  }, [formData.jurusan, jurusanList, prodiList]);

  const fetchInitialData = async () => {
    const { data: jurusans } = await supabase.from('jurusan').select('*').order('nama_jurusan');
    const { data: prodis } = await supabase.from('prodi').select('*').order('nama_prodi');
    if (jurusans) setJurusanList(jurusans);
    if (prodis) setProdiList(prodis);
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('nama_mahasiswa', { ascending: true });

    if (!error) setStudents(data || []);
    setLoading(false);
  };

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: 'success' }), 3000);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Register ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nama_lengkap: formData.nama,
            role: 'mahasiswa'
          }
        }
      });

      if (authError && !authError.message.includes("already registered")) throw authError;

      let userId = authData.user?.id;

      if (!userId) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email)
          .single();
        userId = existingUser?.id;
      }

      if (!userId) throw new Error("Gagal mengidentifikasi User ID.");

      // 2. Simpan ke Tabel Users (Gunakan UPSERT)
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        email: formData.email,
        nama_lengkap: formData.nama,
        nim_nip: formData.nim,
        role: 'mahasiswa',
        jurusan: formData.jurusan,
        prodi: formData.prodi,
        ipk: parseFloat(formData.ipk) || 0,
        semester: parseInt(formData.semester) || 1,
        password: formData.password
      });

      if (userError) throw userError;

      // 3. Simpan ke Tabel Mahasiswa (Gunakan UPSERT)
      const { error: mhsError } = await supabase.from('mahasiswa').upsert({
        id: userId,
        nama_mahasiswa: formData.nama,
        nim: formData.nim,
        jurusan: formData.jurusan,
        prodi: formData.prodi,
        ipk: parseFloat(formData.ipk) || 0,
        semester: parseInt(formData.semester) || 1,
        email: formData.email
      }, { onConflict: 'id' });

      if (mhsError) throw mhsError;

      showNotify("Mahasiswa berhasil diproses!");
      setIsModalOpen(false);
      setFormData({ nim: "", nama: "", email: "", password: "", jurusan: "", prodi: "", ipk: "", semester: "1" });
      fetchStudents();

    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "Gagal memproses data mahasiswa";
      if (err.message?.includes("rate limit exceeded")) {
        errorMsg = "Batas pendaftaran tercapai. Silakan tunggu beberapa menit.";
      }
      showNotify(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split(/\r?\n/);

      if (lines.length < 2) {
        showNotify("File CSV kosong atau tidak valid", "error");
        setIsSubmitting(false);
        return;
      }

      // Deteksi Delimiter
      const firstLine = lines[0];
      const delimiters = [',', ';', '\t'];
      const delimiter = delimiters.reduce((prev, curr) =>
        (firstLine.split(curr).length > firstLine.split(prev).length) ? curr : prev
      );

      // Parser CSV yang mendukung tanda kutip (Regex)
      const parseCSVLine = (text: string, delim: string) => {
        const regex = new RegExp(`(?:${delim}|\\n|^)(?:"([^"]*(?:""[^"]*)*)"|([^"${delim}\\n]*))`, 'g');
        const results = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
          results.push((match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2]).trim());
        }
        return results;
      };

      const rawHeaders = parseCSVLine(firstLine, delimiter).map(h =>
        h.replace(/[^\x20-\x7E]/g, "").toLowerCase()
      );

      console.log("Headers Detected:", rawHeaders);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line, delimiter);
        const row: any = {};
        rawHeaders.forEach((header, index) => {
          if (header) row[header] = values[index] || "";
        });

        // Smart Mapping & Fallbacks
        const namaIdx = rawHeaders.findIndex(h => h.includes('nama') || h.includes('name'));
        const nimIdx = rawHeaders.findIndex(h => h.includes('nim') || h.includes('id'));
        const emailIdx = rawHeaders.findIndex(h => h.includes('email') || h.includes('surel'));

        const nama = (namaIdx !== -1 ? values[namaIdx] : row.nama) || "Mahasiswa Baru";
        const nim = (nimIdx !== -1 ? values[nimIdx] : row.nim) || "000000";
        let email = (emailIdx !== -1 ? values[emailIdx] : row.email) || "";

        // JIKA EMAIL KOSONG: Generate dari NIM
        if (!email || !email.includes('@')) {
          email = `${nim.replace(/\s+/g, '')}@mhs.polimdo.ac.id`;
          console.log(`Baris ${i + 1}: Email dibuat otomatis -> ${email}`);
        }

        const password = row.password || "Polimdo123!";

        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { nama_lengkap: nama, role: 'mahasiswa' } }
          });

          if (authError && !authError.message.includes("already registered")) throw authError;

          const userId = authData.user?.id;
          if (userId || authError?.message.includes("already registered")) {
            const targetId = userId || (await supabase.from('users').select('id').eq('email', email).single()).data?.id;

            if (targetId) {
              // Upsert ke tabel users
              await supabase.from('users').upsert({
                id: targetId, email, nama_lengkap: nama, nim_nip: nim,
                role: 'mahasiswa', jurusan: row.jurusan || "", prodi: row.prodi || "",
                ipk: parseFloat(row.ipk) || 0, semester: parseInt(row.semester) || 1, password
              });

              // Upsert ke tabel mahasiswa
              await supabase.from('mahasiswa').upsert({
                id: targetId, nama_mahasiswa: nama, nim: nim,
                jurusan: row.jurusan || "", prodi: row.prodi || "",
                ipk: parseFloat(row.ipk) || 0, semester: parseInt(row.semester) || 1, email
              }, { onConflict: 'id' });

              successCount++;
            }
          }
        } catch (err: any) {
          console.error(`Error baris ${i + 1} (${email}):`, err.message);
          errorCount++;
        }
      }

      showNotify(`Import Selesai! Berhasil: ${successCount}, Gagal: ${errorCount}`);
      setIsSubmitting(false);
      fetchStudents();
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      (s.nama_mahasiswa?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.nim?.includes(searchTerm))
    );
  }, [students, searchTerm]);

  const topbarTitle = (
    <h2 className="m-0 text-xl font-bold text-[#1A365D]">Manajemen Mahasiswa</h2>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-6 relative">

        {/* Toast Notification */}
        {notification.show && (
          <div className={`fixed top-8 right-8 z-[110] flex items-center gap-3 rounded-2xl px-6 py-4 text-white shadow-2xl animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-[#1A365D]' : 'bg-red-600'}`}>
            <div className={`h-2 w-2 rounded-full animate-pulse ${notification.type === 'success' ? 'bg-green-400' : 'bg-white'}`}></div>
            <p className="text-xs font-black uppercase tracking-widest leading-relaxed max-w-xs">{notification.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96 group">
            <input
              type="text"
              placeholder="Cari Nama atau NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-white p-4 pl-12 text-sm shadow-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              id="csvInput"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
              disabled={isSubmitting}
            />
            <label
              htmlFor="csvInput"
              className={`rounded-2xl border-2 border-[#1A365D] px-5 py-3 text-xs font-black text-[#1A365D] hover:bg-gray-50 transition-all uppercase tracking-widest cursor-pointer flex items-center gap-2 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Import CSV
            </label>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl bg-[#1A365D] px-5 py-3 text-xs font-black text-white shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap"
            >
              + Tambah Mahasiswa
            </button>
          </div>
        </div>

        {/* ── MOBILE: Card List ── */}
        <div className="md:hidden flex flex-col gap-2">
          {loading ? (
            <div className="py-16 text-center font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memuat Data...</div>
          ) : filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
            <div key={`m-${student.id}-${idx}`} className="flex items-center gap-4 rounded-2xl bg-white border border-gray-50 shadow-sm p-4">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center font-black text-blue-600 border border-blue-200/50 shadow-sm">
                {student.nama_mahasiswa?.charAt(0)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{student.nama_mahasiswa}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{student.nim}</p>
                <p className="text-[10px] font-semibold text-gray-400 line-clamp-1">{student.prodi}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Link href={`/admin/mahasiswa/${student.id}`} className="rounded-xl bg-gray-50 px-3 py-1.5 text-[9px] font-black text-gray-400 hover:bg-[#1A365D] hover:text-white transition-all uppercase tracking-widest text-center">
                  Detail
                </Link>
                <Link href={`/admin/mahasiswa/edit/${student.id}`} className="rounded-xl bg-yellow-50 px-3 py-1.5 text-[9px] font-black text-yellow-600 hover:bg-yellow-600 hover:text-white transition-all uppercase tracking-widest text-center border border-yellow-100">
                  Edit
                </Link>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center font-bold text-gray-300 uppercase tracking-widest">Data tidak ditemukan</div>
          )}
        </div>

        {/* ── DESKTOP: Table ── */}
        <div className="hidden md:block overflow-x-auto rounded-[2.5rem] bg-white shadow-sm border border-gray-50">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Mahasiswa</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">NIM</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Prodi</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-400 uppercase tracking-widest">Memuat Data...</td></tr>
              ) : filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                <tr key={`d-${student.id}-${idx}`} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center font-black text-blue-600 border border-blue-200/50 shadow-sm">
                        {student.nama_mahasiswa?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors">{student.nama_mahasiswa}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-gray-500 tracking-tighter">{student.nim}</td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{student.prodi}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/mahasiswa/${student.id}`} className="inline-flex rounded-xl bg-gray-50 px-4 py-2.5 text-[10px] font-black text-gray-400 hover:bg-[#1A365D] hover:text-white transition-all uppercase tracking-widest shadow-sm">
                        Detail
                      </Link>
                      <Link href={`/admin/mahasiswa/edit/${student.id}`} className="inline-flex rounded-xl bg-yellow-50 px-4 py-2.5 text-[10px] font-black text-yellow-600 hover:bg-yellow-600 hover:text-white transition-all uppercase tracking-widest shadow-sm border border-yellow-100">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-300 uppercase tracking-widest">Data tidak ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah Mahasiswa */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[#1A365D] uppercase tracking-tight">Registrasi Mahasiswa</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Input data lengkap sesuai halaman pendaftaran</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Mahasiswa</label>
                  <input
                    type="text" required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama sesuai KTP/Ijazah"
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIM</label>
                  <input
                    type="text" required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 210101"
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Kampus</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mhs@polimdo.ac.id"
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Login</label>
                  <input
                    type="password" required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter..."
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jurusan</label>
                  <select
                    required
                    value={formData.jurusan}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value, prodi: "" })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all appearance-none"
                  >
                    <option value="">Pilih Jurusan</option>
                    {jurusanList.map(j => <option key={j.id} value={j.nama_jurusan}>{j.nama_jurusan}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Program Studi</label>
                  <select
                    required
                    disabled={!formData.jurusan}
                    value={formData.prodi}
                    onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">Pilih Prodi</option>
                    {filteredProdi.map(p => <option key={p.id} value={p.nama_prodi}>{p.nama_prodi}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IPK Terakhir</label>
                  <input
                    type="number" step="0.01" required
                    value={formData.ipk}
                    onChange={(e) => setFormData({ ...formData, ipk: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                  <input
                    type="number" required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="1"
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="pt-6 col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-[1.5rem] bg-[#1A365D] py-5 text-sm font-black text-white shadow-2xl shadow-blue-900/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSubmitting ? "Mendaftarkan ke Sistem..." : "Simpan & Daftarkan Mahasiswa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
