"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase/lib/supabase';
import { UniversityIcon, UserIcon, LockIcon, EyeIcon, ArrowRightIcon } from '../../components/login-icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Autentikasi via Supabase Auth (Standard)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const authUser = data.user;

      // 2. Ambil metadata role
      const role = authUser.user_metadata?.role;
      const nama_lengkap = authUser.user_metadata?.nama_lengkap || authUser.email;

      // Inisialisasi profil dasar dari Auth
      let userProfile: any = {
        id: authUser.id,
        email: authUser.email,
        role: role || 'mahasiswa',
        nama_lengkap: nama_lengkap
      };

      if (!role) {
        // Fallback: Query profil lengkap dari tabel users
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (dbUser) {
          userProfile = { ...dbUser };
        }
      } else {
        // Jika role sudah ada di metadata, tetap ambil detail lengkap dari tabel users
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        if (dbUser) {
          userProfile = { ...dbUser };
        }
      }

      // 3. Override role jika email adalah milik bagian akademik
      if (userProfile.email === 'akademik@polimdo.ac.id') {
        userProfile.role = 'akademik';
      }

      // 4. Simpan ke localStorage untuk UI yang sudah ada
      localStorage.setItem('user', JSON.stringify(userProfile));

      const roleRedirects = {
        admin: '/admin/dashboard',
        dosen: '/dosen/dashboard',
        sekjur: '/sekjur/dashboard',
        kaprodi: '/kaprodi/dashboard',
        mahasiswa: '/mahasiswa/beranda',
        akademik: '/akademik/dashboard'
      };

      router.push(roleRedirects[userProfile.role as keyof typeof roleRedirects] || '/mahasiswa/beranda');
    } catch (err: any) {
      setError('Login Gagal: ' + (err.message || 'Periksa kembali email dan kata sandi Anda.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#11151e] font-sans text-white">
      {/* Left Column - Image & Overlay */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block animate-in fade-in slide-in-from-left duration-1000">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-110"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-[#0f172a]/80" />

        <div className="absolute top-1/2 left-16 right-16 -translate-y-1/2 flex flex-col items-start text-white">
          <div className="mb-8 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
              alt="Decoration" 
              className="h-32 w-48 object-cover rounded-xl"
            />
          </div>
          <span className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FACC15]">
            Portal Semester Antara POLIMDO
          </span>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
            Transformasi Pendidikan Vokasi Melalui Semester Antara.
          </h1>
          <div className="mb-6 h-1 w-24 bg-indigo-300"></div>
          <p className="max-w-xl text-lg leading-relaxed text-gray-200">
            Optimalkan masa studi Anda dengan kurikulum yang fleksibel dan terstruktur untuk pencapaian akademik yang maksimal di Politeknik Negeri Manado.
          </p>
        </div>

        {/* Decorative Badge */}
        <div className="absolute bottom-12 right-12 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white animate-spin-slow">
            <p className="text-[8px] font-black uppercase text-center tracking-widest">Digital • Portal • Polimdo • SA</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8 lg:w-1/2 animate-in fade-in slide-in-from-right duration-700">
        <div className="w-full max-w-md rounded-3xl bg-[#1c212d] p-7 sm:p-12 shadow-2xl relative border border-white/5">

          {/* Header & Logo */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
              <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-900/40">
                <UniversityIcon />
              </div>
            </div>
            <h2 className="mb-2 text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Polimdo SA</h2>
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-blue-500/30"></div>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-blue-400 font-black">
                Portal Semester Antara POLIMDO
              </p>
              <div className="h-px w-6 bg-blue-500/30"></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-1 text-lg sm:text-xl font-bold text-white">Selamat Datang</h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide">Masuk ke Portal Pendaftaran Semester Antara POLIMDO</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-red-400 animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                EMAIL / USERNAME
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <UserIcon />
                </div>
                <input
                  type="email" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@polimdo.ac.id"
                  className="w-full rounded-xl bg-[#262c3a] py-4 pl-12 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:bg-[#2d3445] focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                KATA SANDI
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"} required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded-xl bg-[#262c3a] py-4 pl-12 pr-12 text-sm text-white placeholder-gray-600 outline-none transition-all focus:bg-[#2d3445] focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex cursor-pointer items-center gap-2 group">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-700 bg-[#262c3a] text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                />
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-widest">Ingat saya</span>
              </label>
              <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-[#FACC15] hover:underline uppercase tracking-widest">
                Lupa Sandi?
              </Link>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] py-4 text-xs font-black text-white shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? "Memproses..." : "Masuk ke Sistem"}
                {!loading && <ArrowRightIcon />}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Belum punya akun? {' '}
              <Link href="/register" className="text-[#FACC15] hover:underline font-black">Buat Akun Baru</Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
