import { supabase } from './supabase';

export interface Pengaturan {
  kajur_nama: string;
  kajur_nip: string;
  sekjur_nama: string;
  sekjur_nip: string;
  kaprodi_nama: string;
  kaprodi_nip: string;
}

const DEFAULTS: Pengaturan = {
  kajur_nama:   'Marson James Budiman, SST., MT',
  kajur_nip:    'NIP. 197503052003121002',
  sekjur_nama:  'Maksy Sendiang, SST, MIT',
  sekjur_nip:   'NIP. 197405232002121004',
  kaprodi_nama: 'Ir. Maryam, M.Kom',
  kaprodi_nip:  'NIP. 196601011994032001',
};

/**
 * Fetch all settings from the `pengaturan` table.
 * Falls back to DEFAULTS if the table doesn't exist yet.
 */
export async function fetchPengaturan(): Promise<Pengaturan> {
  try {
    const { data, error } = await supabase
      .from('pengaturan')
      .select('key, value');

    if (error || !data) return { ...DEFAULTS };

    const result = { ...DEFAULTS };
    for (const row of data) {
      if (row.key in result) {
        (result as any)[row.key] = row.value;
      }
    }
    return result;
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Upsert a single setting.
 */
export async function updatePengaturan(key: keyof Pengaturan, value: string): Promise<string | null> {
  const { error } = await supabase
    .from('pengaturan')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return error ? error.message : null;
}
