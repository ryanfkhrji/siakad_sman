1. Tahun akademik:
Create:
  - ✅ Tidak bisa buat jika masih ada ta lain yang aktif
Update
  - ✅ Tidak bisa update jika status = 'arsip'
  - ✅ Gabisa ubah status dari arsip menjadi aktif
Delete:
  - ✅ Gabisa diapus jika status = arsip
  - ✅ Gabisa diapus jika sudah digunakan oleh semester


2. Semester
Create:
  - ✅ Tidak bisa buat jika masih ada semester lain yang aktif
  - ✅ Tahun akademik otomatis (pastikan sudah ada tahun akademik yang aktif)
Update:
  - ✅ Tidak bisa update jika status semester = arsip
  - ✅ Tidak bisa update jika status tahun akademik = arsip
  - ✅ Tidak bisa ubah status dari arsip menjadi aktif
Delete:
  - ✅ Tidak bisa hapus jika status = arsip
  - ✅ Tidak bisa dihapus jika sudah digunakan pada jadwal pelajaran dan data berkas


3. Kurikulum Mata Pelajaran
Create:
  - ✅ Tidak bisa buat jika belum ada tahun_akademik yang aktif
  - ✅ Tahun akademik otomatis (pastikan sudah ada tahun akademik yang aktif)
Update:
  - ✅ Tidak bisa update jika status tahun akademik = arsip
Delete:
  - ✅ Tidak bisa hapus jika status tahun akademik = arsip
  - ✅ Tidak bisa dihapus jika sudah digunakan pada jadwal pelajaran


4. ATP
Create:
   - Guru: TA dan semester otomatis
   - Guru: Harus kurikulum merdeka dan kompetensi = CP
Clone:
   - Guru: Clone per semester
   - Guru: ATP yang hendak di clone harus sudah disetujui
Update:
   - Tidak bisa ubah jika sudah dikunci/disetujui
   - Hanya bisa diubah pada tahun dan semester aktif
Delete:
   - Tidak bisa hapus jika sudah dikunci/disetujui
   - Hanya bisa dihapus pada tahun dan semester aktif
✅ Diterima
✅ Ditolak


1. Jadwal Pelajaran
Create:
   - Tahun akademik dan semester otomatis
   - 1 guru hanya boleh 1 mapel
Update:
   - Gabisa update jika semester sudah arsip
Delete:
   - Gabisa dihapus bila sudah digunakan pada absensi
   - Gabisa dihapus jika semester dan tahun akademik sudah arsip


<!-- KERJAKAN INSOMNIANYA DULU, CEK DI ATAS -->