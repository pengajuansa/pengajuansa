/**
 * useSAStatus - Custom Hook
 *
 * Mengembalikan status lengkap pendaftaran SA mahasiswa:
 * 1. sudahDaftar      : mahasiswa sudah submit pendaftaran
 * 2. sudahDisetujui   : sekjur sudah approve (status = 'Approved')
 * 3. sudahAdaDosen    : kaprodi sudah alokasikan dosen ke MK yang didaftarkan
 * 4. mkIds            : daftar mk_id yang didaftarkan mahasiswa
 * 5. dosenIds         : daftar dosen_id yang dialokasikan ke MK tersebut
 * 6. loading          : proses fetch sedang berjalan
 */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase/lib/supabase";

export interface SAStatus {
  sudahDaftar: boolean;
  sudahDisetujui: boolean;
  sudahAdaDosen: boolean;
  mkIds: string[];
  dosenIds: string[];
  loading: boolean;
}

export function useSAStatus(mahasiswaId: string | null): SAStatus {
  const [status, setStatus] = useState<SAStatus>({
    sudahDaftar: false,
    sudahDisetujui: false,
    sudahAdaDosen: false,
    mkIds: [],
    dosenIds: [],
    loading: true,
  });

  useEffect(() => {
    if (!mahasiswaId) {
      setStatus((s) => ({ ...s, loading: false }));
      return;
    }

    const fetchStatus = async () => {
      setStatus((s) => ({ ...s, loading: true }));

      // 1. Cek apakah mahasiswa sudah mendaftar SA
      const { data: pendaftarans, error: pErr } = await supabase
        .from("pendaftaran_sa")
        .select("id, status")
        .eq("mahasiswa_id", mahasiswaId);

      if (pErr || !pendaftarans || pendaftarans.length === 0) {
        setStatus({
          sudahDaftar: false,
          sudahDisetujui: false,
          sudahAdaDosen: false,
          mkIds: [],
          dosenIds: [],
          loading: false,
        });
        return;
      }

      const sudahDaftar = true;
      const approvedPendaftarans = pendaftarans.filter(p => p.status === "Approved");
      const sudahDisetujui = approvedPendaftarans.length > 0;

      if (!sudahDisetujui) {
        setStatus({
          sudahDaftar,
          sudahDisetujui: false,
          sudahAdaDosen: false,
          mkIds: [],
          dosenIds: [],
          loading: false,
        });
        return;
      }

      const approvedPendaftaranIds = approvedPendaftarans.map(p => p.id);

      // 2. Ambil mk_id yang didaftarkan mahasiswa ini dari pendaftaran yang di-approve
      const { data: items, error: iErr } = await supabase
        .from("pendaftaran_items")
        .select("mk_id")
        .in("pendaftaran_id", approvedPendaftaranIds);

      if (iErr || !items || items.length === 0) {
        setStatus({
          sudahDaftar,
          sudahDisetujui,
          sudahAdaDosen: false,
          mkIds: [],
          dosenIds: [],
          loading: false,
        });
        return;
      }

      const mkIds = items.map((i: any) => i.mk_id);

      // 3. Cek apakah MK tersebut sudah dialokasikan dosen dari kaprodi (khusus untuk pendaftaran mahasiswa ini)
      const { data: alokasi, error: aErr } = await supabase
        .from("alokasi_dosen")
        .select("mk_id, dosen_id")
        .in("pendaftaran_id", approvedPendaftaranIds);

      if (aErr || !alokasi || alokasi.length === 0) {
        setStatus({
          sudahDaftar,
          sudahDisetujui,
          sudahAdaDosen: false,
          mkIds: [], // Hanya tampilkan MK jika sudah dialokasikan
          dosenIds: [],
          loading: false,
        });
        return;
      }

      // Ini adalah daftar MK yang BENAR-BENAR sudah dialokasikan kaprodi untuk mahasiswa ini
      const allocatedMkIds = alokasi.map((a: any) => a.mk_id);
      const dosenIds = [...new Set(alokasi.map((a: any) => a.dosen_id))] as string[];

      // Dianggap sudah ada dosen jika ada alokasi
      const sudahAdaDosen = allocatedMkIds.length > 0;

      setStatus({
        sudahDaftar,
        sudahDisetujui,
        sudahAdaDosen,
        mkIds: allocatedMkIds, // Hanya MK yang sudah dialokasikan yang ditampilkan di portal
        dosenIds,
        loading: false,
      });
    };

    fetchStatus();
  }, [mahasiswaId]);

  return status;
}
