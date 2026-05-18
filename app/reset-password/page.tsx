"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase/lib/supabase';
import { UniversityIcon, LockIcon, EyeIcon, ArrowRightIcon } from '../../components/login-icons';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Supabase handles the recovery session automatically when clicking the email link
    // but we can check if we have a session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage({
          type: 'error',
          text: 'Sesi pemulihan tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.'
        });
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Kata sandi berhasil diperbarui. Anda akan diarahkan ke halaman login.'
      });

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: 'Gagal memperbarui kata sandi: ' + (err.message || 'Silakan coba lagi.')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#11151e] font-sans text-white">
      {/* Left Column - Image & Overlay */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block animate-in fade-in slide-in-from-left duration-1000">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-[#0f172a]/80" />

        <div className="absolute top-1/2 left-16 right-16 -translate-y-1/2 flex flex-col items-start text-white">
          <div className="mb-8 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
              alt="Decoration" 
              className="h-32 w-48 object-cover rounded-xl"
            />
          </div>
          <span className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FACC15]">
            Sistem Keamanan Pusat
          </span>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
            Perbarui Kata Sandi Anda Untuk Keamanan Maksimal.
          </h1>
          <div className="mb-6 h-1 w-24 bg-indigo-300"></div>
          <p className="max-w-xl text-lg leading-relaxed text-gray-200">
            Gunakan kombinasi karakter yang kuat untuk melindungi akun akademik Anda. Keamanan data Anda adalah prioritas utama kami di Politeknik Negeri Manado.
          </p>
        </div>

        {/* Decorative Badge */}
        <div className="absolute bottom-12 right-12 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white animate-spin-slow">
            <p className="text-[8px] font-black uppercase text-center tracking-widest">Digital • Portal • Polimdo • SA</p>
        </div>
      </div>

      {/* Right Column - Reset Form */}
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
              <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.4em] text-blue-400 font-black">
                PASSWORD UPDATE
              </p>
              <div className="h-px w-6 bg-blue-500/30"></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-1 text-lg sm:text-xl font-bold text-white">Atur Ulang Sandi</h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide">Masukkan kata sandi baru Anda di bawah ini.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl border p-3 sm:p-4 text-[10px] sm:text-xs font-bold animate-in zoom-in duration-300 ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                KATA SANDI BARU
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"} required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
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

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                KONFIRMASI KATA SANDI
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"} required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full rounded-xl bg-[#262c3a] py-4 pl-12 pr-12 text-sm text-white placeholder-gray-600 outline-none transition-all focus:bg-[#2d3445] focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <button
                type="submit"
                disabled={loading || (message?.type === 'success')}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] py-4 text-xs font-black text-white shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? "Memproses..." : "Perbarui Kata Sandi"}
                {!loading && <ArrowRightIcon />}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <div className="mt-8 lg:absolute lg:bottom-8 mx-auto w-full max-w-lg px-8 text-center lg:right-0 lg:w-1/2">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 leading-relaxed">
            © 2024 POLIMDO SA. SECURITY INFRASTRUCTURE.<br className="hidden sm:block" />END-TO-END ENCRYPTION ACTIVE.
          </p>
        </div>
      </div>
    </div>
  );
}
