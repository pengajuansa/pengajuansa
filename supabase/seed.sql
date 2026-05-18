-- ==========================================================
-- DATA AWAL (SEED DATA) PENGAJUAN SA POLIMDO
-- Mengisi tabel relasi dan beberapa tambahan Users
-- ==========================================================

-- 1. BERSIHKAN DATA LAMA
DELETE FROM pengumpulan_tugas;
DELETE FROM tugas;
DELETE FROM pembayaran;
DELETE FROM pendaftaran_items;
DELETE FROM pendaftaran_sa;
DELETE FROM alokasi_dosen;
DELETE FROM mata_kuliah;

-- 2. MATIKAN KEAMANAN (RLS) JIKA ADA
ALTER TABLE mata_kuliah DISABLE ROW LEVEL SECURITY;
ALTER TABLE alokasi_dosen DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendaftaran_sa DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendaftaran_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE tugas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengumpulan_tugas DISABLE ROW LEVEL SECURITY;

-- 3. TAMBAH MAHASISWA DUMMY TAMBAHAN UNTUK JURUSAN LAIN
INSERT INTO users (email, password, nim_nip, nama_lengkap, role, jurusan, prodi, ipk, semester)
VALUES
('siti@polimdo.ac.id', 'mhs123', '22041012', 'Siti Aminah', 'mahasiswa', 'Akuntansi', 'D-4 Akuntansi Keuangan', 3.60, 4),
('aditya@polimdo.ac.id', 'mhs123', '22041013', 'Aditya Pratama', 'mahasiswa', 'Teknik Mesin', 'D-4 Teknik Mesin Produksi dan Perawatan', 3.45, 6),
('budi@polimdo.ac.id', 'mhs123', '22041014', 'Budi Santoso', 'mahasiswa', 'Teknik Sipil', 'D-4 Konstruksi Bangunan', 3.10, 2)
ON CONFLICT (email) DO NOTHING;

-- 4. DATA MATA KULIAH
INSERT INTO mata_kuliah (id, kode_mk, nama_mk, sks, semester_asal, rumpun, status_buka)
VALUES
('11111111-1111-1111-1111-000000000001', 'TIF1023', 'Pemrograman Berorientasi Objek', 3, 2, 'Teknik Elektro', TRUE),
('11111111-1111-1111-1111-000000000002', 'TIF2144', 'Struktur Data & Algoritma', 4, 3, 'Teknik Elektro', TRUE),
('11111111-1111-1111-1111-000000000003', 'AKT3001', 'Akuntansi Biaya', 3, 3, 'Akuntansi', TRUE),
('11111111-1111-1111-1111-000000000004', 'MES2011', 'Mekanika Fluida', 2, 3, 'Teknik Mesin', TRUE),
('11111111-1111-1111-1111-000000000005', 'TIF4012', 'Pemrograman Web Lanjut', 3, 4, 'Teknik Elektro', TRUE),
('11111111-1111-1111-1111-000000000006', 'SIP1002', 'Statika', 3, 1, 'Teknik Sipil', TRUE)
ON CONFLICT (kode_mk) DO NOTHING;

-- 5. DATA ALOKASI DOSEN
INSERT INTO alokasi_dosen (mk_id, dosen_id, tahun_akademik)
VALUES
('11111111-1111-1111-1111-000000000001', (SELECT id FROM users WHERE email = 'dosen@polimdo.ac.id' LIMIT 1), '2023/2024 Genap'),
('11111111-1111-1111-1111-000000000005', (SELECT id FROM users WHERE email = 'dosen@polimdo.ac.id' LIMIT 1), '2023/2024 Genap');

-- 6. DATA PENDAFTARAN SA 
INSERT INTO pendaftaran_sa (id, mahasiswa_id, kode_pendaftaran, status, biaya_pendaftaran)
VALUES
('22222222-2222-2222-2222-000000000001', (SELECT id FROM users WHERE email = 'mahasiswa@polimdo.ac.id' LIMIT 1), 'REG-2024-001', 'Pending', 500000),
('22222222-2222-2222-2222-000000000002', (SELECT id FROM users WHERE email = 'siti@polimdo.ac.id' LIMIT 1), 'REG-2024-002', 'Pending', 500000),
('22222222-2222-2222-2222-000000000003', (SELECT id FROM users WHERE email = 'aditya@polimdo.ac.id' LIMIT 1), 'REG-2024-003', 'Approved', 150000);

-- 7. DETAIL ITEM PENDAFTARAN
INSERT INTO pendaftaran_items (pendaftaran_id, mk_id, nilai_lama)
VALUES
('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000005', 'E'),
('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000003', 'D'),
('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-000000000004', 'E');

-- 8. DATA PEMBAYARAN
INSERT INTO pembayaran (pendaftaran_id, bukti_url, status_verifikasi)
VALUES
('22222222-2222-2222-2222-000000000001', 'https://via.placeholder.com/400x500.png?text=Bukti+Bayar+Andi', 'Pending'),
('22222222-2222-2222-2222-000000000002', 'https://via.placeholder.com/400x500.png?text=Bukti+Bayar+Siti', 'Pending'),
('22222222-2222-2222-2222-000000000003', 'https://via.placeholder.com/400x500.png?text=Bukti+Bayar+Aditya', 'Verified');

-- 9. DATA TUGAS & PENGUMPULAN
INSERT INTO tugas (id, mk_id, dosen_id, judul, deskripsi, deadline)
VALUES
('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-000000000005', (SELECT id FROM users WHERE email = 'dosen@polimdo.ac.id' LIMIT 1), 'Tugas 04: RESTful API Development', 'Buat API ExpressJS', NOW() + INTERVAL '5 days');

INSERT INTO pengumpulan_tugas (tugas_id, mahasiswa_id, file_url, nilai)
VALUES
('33333333-3333-3333-3333-000000000001', (SELECT id FROM users WHERE email = 'mahasiswa@polimdo.ac.id' LIMIT 1), 'Tugas4_Andi.pdf', 92);
