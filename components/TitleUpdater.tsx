"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    let pageTitle = "";

    // Exact matches for public / auth routes
    if (pathname === "/login") {
      pageTitle = "Login";
    } else if (pathname === "/register") {
      pageTitle = "Register";
    } else if (pathname === "/forgot-password") {
      pageTitle = "Lupa Password";
    } else if (pathname === "/reset-password") {
      pageTitle = "Reset Password";
    }
    // Admin routes
    else if (pathname === "/admin/dashboard") {
      pageTitle = "Dashboard Admin";
    } else if (pathname === "/admin/mahasiswa") {
      pageTitle = "Kelola Mahasiswa - Admin";
    } else if (pathname === "/admin/dosen") {
      pageTitle = "Kelola Dosen - Admin";
    } else if (pathname === "/admin/dosen/tambah") {
      pageTitle = "Tambah Dosen - Admin";
    } else if (pathname === "/admin/mata-kuliah") {
      pageTitle = "Kelola Mata Kuliah - Admin";
    } else if (pathname === "/admin/mata-kuliah/tambah") {
      pageTitle = "Tambah Mata Kuliah - Admin";
    }
    // Admin dynamic routes
    else if (pathname.startsWith("/admin/mahasiswa/edit/")) {
      pageTitle = "Edit Mahasiswa - Admin";
    } else if (pathname.startsWith("/admin/mahasiswa/")) {
      pageTitle = "Detail Mahasiswa - Admin";
    } else if (pathname.startsWith("/admin/dosen/edit/")) {
      pageTitle = "Edit Dosen - Admin";
    } else if (pathname.startsWith("/admin/mata-kuliah/edit/")) {
      pageTitle = "Edit Mata Kuliah - Admin";
    }
    // Mahasiswa routes
    else if (pathname === "/mahasiswa/beranda") {
      pageTitle = "Beranda - Mahasiswa";
    } else if (pathname === "/mahasiswa/pendaftaran") {
      pageTitle = "Pendaftaran SA - Mahasiswa";
    } else if (pathname === "/mahasiswa/mata-kuliah") {
      pageTitle = "Mata Kuliah - Mahasiswa";
    } else if (pathname === "/mahasiswa/riwayat") {
      pageTitle = "Riwayat - Mahasiswa";
    } else if (pathname === "/mahasiswa/tugas") {
      pageTitle = "Tugas - Mahasiswa";
    } else if (pathname.startsWith("/mahasiswa/tugas/")) {
      pageTitle = "Detail Tugas - Mahasiswa";
    } else if (pathname === "/mahasiswa/bantuan") {
      pageTitle = "Bantuan - Mahasiswa";
    }
    // Dosen routes
    else if (pathname === "/dosen/dashboard") {
      pageTitle = "Dashboard - Dosen";
    } else if (pathname === "/dosen/manajemen-mk") {
      pageTitle = "Manajemen MK - Dosen";
    } else if (pathname === "/dosen/penilaian") {
      pageTitle = "Penilaian - Dosen";
    } else if (pathname === "/dosen/tugas") {
      pageTitle = "Kelola Tugas - Dosen";
    } else if (pathname === "/dosen/tugas/buat") {
      pageTitle = "Buat Tugas - Dosen";
    } else if (pathname.startsWith("/dosen/tugas/kelola/")) {
      pageTitle = "Detail Tugas - Dosen";
    }
    // Kaprodi routes
    else if (pathname === "/kaprodi/dashboard") {
      pageTitle = "Dashboard - Kaprodi";
    } else if (pathname === "/kaprodi/validasi-formulir") {
      pageTitle = "Validasi Formulir - Kaprodi";
    } else if (pathname.startsWith("/kaprodi/validasi-formulir/")) {
      pageTitle = "Detail Validasi - Kaprodi";
    } else if (pathname === "/kaprodi/alokasi") {
      pageTitle = "Alokasi Dosen - Kaprodi";
    }
    // Sekjur routes
    else if (pathname === "/sekjur/dashboard") {
      pageTitle = "Dashboard - Sekjur";
    } else if (pathname === "/sekjur/formulir-sa") {
      pageTitle = "Formulir SA - Sekjur";
    } else if (pathname === "/sekjur/pembayaran") {
      pageTitle = "Pembayaran - Sekjur";
    } else if (pathname === "/sekjur/laporan") {
      pageTitle = "Laporan - Sekjur";
    }

    const defaultTitle = "Pengajuan SA Polimdo";
    document.title = pageTitle ? `${pageTitle} - ${defaultTitle}` : defaultTitle;
  }, [pathname]);

  return null;
}
