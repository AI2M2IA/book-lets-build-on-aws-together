# Bab 23: Sistem Pengarsipan yang Mengatur Dirinya Sendiri

Sebuah firma hukum menyimpan berkas kasus aktif di atas meja. Kasus yang sudah selesai masuk ke lemari arsip. Kasus dari tiga tahun lalu masuk ke kotak penyimpanan di ruang bawah tanah. Kasus dari sepuluh tahun lalu masuk ke fasilitas arsip luar ruang yang biayanya hanya beberapa sen per kotak tetapi butuh dua hari untuk mengambil apa pun dari sana.

Informasi yang sama, disimpan dengan biaya berbeda berdasarkan seberapa sering diakses.

S3 melakukan ini secara otomatis.

Tom sedang meninjau tagihan AWS Nimbus. Pos anggaran: penyimpanan S3. $847/bulan.

Dia memanggil Leo.

"Kita memiliki 4,2 terabyte di S3," kata Leo setelah memeriksa.

"Apa saja itu?"

"Foto restoran. Tanda terima pesanan. Ekspor analitik. Snapshot backup dari 18 bulan lalu."

"Kapan terakhir kali seseorang mengakses backup dari 18 bulan lalu?"

Leo memeriksa log akses.

"Oktober lalu," katanya. "Sekali. Untuk memverifikasi format backup."

"Jadi kita membayar untuk 18 bulan backup dengan harga S3 Standard penuh."

"Ya."

Tom melihat halaman harga S3. S3 Standard: $0,023 per GB per bulan. S3 Glacier Instant Retrieval: $0,004 per GB per bulan.

Dia menghitung. Beberapa kalkulasi cepat.

"Kita bisa mengurangi tagihan ini secara signifikan," katanya, "hanya dengan memindahkan data lama ke penyimpanan yang lebih murah."

"Kita perlu tahu mana yang lama," kata Leo.

"S3 tahu. Ia melacak waktu akses terakhir."

**Kelas Penyimpanan S3: Spektrum Lengkap**

Bab 5 memperkenalkan S3 Standard sebagai kelas penyimpanan utama. S3 sebenarnya memiliki tujuh kelas penyimpanan, masing-masing dirancang untuk pola akses yang berbeda:

**S3 Standard**: Untuk data yang sering diakses. Latensi rendah (milidetik). Biaya tertinggi. Tidak ada durasi penyimpanan minimum. Gunakan untuk data aktif: foto menu saat ini, pesanan hari ini, log terbaru.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Untuk data yang diakses kurang dari sekali sebulan. Pengambilan milidetik yang sama seperti Standard, tetapi biaya penyimpanan lebih rendah + biaya pengambilan per GB. Gunakan untuk data yang kamu butuhkan segera saat kamu mengaksesnya, tetapi jarang dilakukan: tanda terima pesanan lama, ekspor analitik dari 6 bulan lalu.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Sama seperti S3 Standard-IA tetapi disimpan hanya di satu Availability Zone (bukan tiga). Daya tahan lebih rendah (jika AZ itu mengalami bencana, data bisa hilang), tetapi 20% lebih murah. Gunakan untuk data yang dapat direkonstruksi jika hilang: cache thumbnail, output pemrosesan sementara.

**S3 Glacier Instant Retrieval**: Data yang diarsipkan yang sesekali kamu butuhkan. Pengambilan milidetik. Biaya penyimpanan sangat rendah, biaya pengambilan per GB lebih tinggi. Durasi penyimpanan minimum 90 hari. Gunakan untuk data yang diakses sekali per kuartal atau kurang: laporan kepatuhan kuartalan, snapshot backup dari 12 bulan lalu.

**S3 Glacier Flexible Retrieval**: Arsip mendalam, diambil dalam hitungan menit hingga jam. Biaya lebih rendah dari Glacier Instant Retrieval. Gunakan untuk data arsip dengan urgensi lebih rendah.

**S3 Glacier Deep Archive**: Opsi berbiaya terendah. Diambil dalam 12 jam. Durasi penyimpanan minimum 180 hari. Gunakan untuk data yang harus disimpan untuk kepatuhan regulasi tetapi tidak pernah diharapkan untuk diakses: catatan pajak 7 tahun, log audit 10 tahun.

Polanya: saat frekuensi akses menurun, biaya menurun tetapi waktu pengambilan meningkat (dan biaya per pengambilan meningkat). Pilih kelas yang sesuai dengan pola aksesmu.

**Kebijakan Siklus Hidup S3: Sistem Pengarsipan Otomatis**

Memindahkan file secara manual antara kelas penyimpanan rawan kesalahan dan memakan waktu. **Kebijakan siklus hidup** S3 mengotomatiskan ini berdasarkan aturan yang kamu tentukan.

Aturan siklus hidup memiliki dua komponen:

**Filter**: Objek mana yang berlaku aturan (semua objek, objek dengan awalan tertentu, objek dengan tag tertentu).

**Tindakan**: Apa yang harus dilakukan, setelah berapa hari.

Contoh kebijakan siklus hidup untuk tanda terima pesanan Nimbus:

```
Transisi ke S3 Standard-IA setelah 90 hari
Transisi ke S3 Glacier Instant Retrieval setelah 365 hari
Transisi ke S3 Glacier Deep Archive setelah 2555 hari (7 tahun)
Hapus setelah 2920 hari (8 tahun)
```

Kebijakan tunggal ini memastikan:

- Tanda terima aktif (< 90 hari): S3 Standard, akses cepat
- Tanda terima baru (90-365 hari): Standard-IA, murah tetapi tersedia secara instan
- Tanda terima historis (1-7 tahun): Glacier, sangat murah, jarang dibutuhkan
- Tanda terima kadaluarsa (> 8 tahun): Dihapus secara otomatis

Tom meninjau perkiraan penghematan: dari $847/bulan menjadi sekitar $220/bulan.

"Hanya dengan... mendefinisikan apa yang lama dan ke mana harus pergi?" katanya.

"Dan S3 memindahkannya secara otomatis," konfirmasi Leo. "Tidak ada cron job. Tidak ada migrasi manual. Tidak ada lupa."

**S3 Intelligent-Tiering: Kelas yang Mengorganisir Dirinya Sendiri**

Bagaimana jika kamu tidak tahu seberapa sering kamu akan mengakses datamu?

**S3 Intelligent-Tiering** memantau pola akses untuk setiap objek dan secara otomatis memindahkannya antara tier akses:

- **Tier Akses Sering**: Untuk objek yang baru-baru ini diakses
- **Tier Akses Jarang**: Objek yang tidak diakses selama 30 hari
- **Tier Akses Arsip Instan**: Objek yang tidak diakses selama 90 hari
- **Tier Akses Arsip**: Objek yang tidak diakses selama 90-730 hari (opsional)
- **Tier Akses Arsip Mendalam**: Objek yang tidak diakses selama 180-730+ hari (opsional)

S3 Intelligent-Tiering menagih biaya pemantauan kecil per objek per bulan ($0,0025 per 1.000 objek), tetapi tidak ada biaya pengambilan untuk tier Sering dan Jarang.

Gunakan Intelligent-Tiering ketika:

- Pola akses tidak terduga atau berubah seiring waktu
- Kamu memiliki campuran data hot dan cold yang tidak dapat dengan mudah diklasifikasikan
- Kamu memiliki objek lebih besar dari 128KB (objek kecil menghabiskan lebih banyak biaya pemantauan daripada yang mereka hemat)

Gunakan kelas penyimpanan eksplisit (dengan kebijakan siklus hidup) ketika:

- Pola akses dapat diprediksi
- Kamu ingin meminimalkan biaya pemantauan per objek
- Objek kecil (< 128KB)

**Unggahan Multipart: Untuk Objek Besar**

S3 memiliki batas unggahan tunggal 5GB. Untuk objek yang lebih besar, kamu harus menggunakan **unggahan multipart**: bagi objek menjadi beberapa bagian, unggah masing-masing secara paralel, dan S3 merakitnya.

Keuntungan:

- Unggahan lebih cepat (paralel)
- Dapat melanjutkan unggahan yang gagal (hanya unggah ulang bagian yang gagal)
- Diperlukan untuk objek > 5GB

Tips aturan siklus hidup: Tetapkan aturan siklus hidup untuk menghapus unggahan multipart yang tidak lengkap setelah 7 hari. Jika unggahan gagal di tengah jalan dan tidak dibersihkan, bagian-bagian parsial tersebut disimpan dan ditagih — tanpa objek yang sudah dirakit untuk menunjukkannya.

Tom sangat menghargai tip ini.

**Replikasi S3: Menyalin Data Antar Bucket**

S3 dapat secara otomatis mereplikasi objek dari satu bucket ke bucket lain:

**Replikasi Same-Region (SRR)**: Salin objek dalam region yang sama. Gunakan untuk kepatuhan (menyimpan salinan terpisah di akun berbeda), mengagregasi log dari beberapa bucket, atau membuat lingkungan pengujian dari data produksi.

**Replikasi Cross-Region (CRR)**: Salin objek ke region berbeda. Gunakan untuk pemulihan bencana (redundansi data lintas region), kepatuhan (data harus berada di geografi tertentu), dan latensi lebih rendah untuk pengguna global.

Replikasi bukan solusi backup — jika kamu menghapus objek di bucket sumber, ia dihapus di replika (kecuali replikasi penanda hapus dinonaktifkan). Gunakan AWS Backup atau versioning dengan object lock untuk backup.

**S3 Object Lock: Immutabilitas untuk Kepatuhan**

Beberapa regulasi mengharuskan data bersifat **immutable** — setelah ditulis, tidak dapat dimodifikasi atau dihapus untuk periode tertentu.

**S3 Object Lock** mengimplementasikan penyimpanan WORM (Write Once, Read Many):

**Periode retensi**: Objek tidak dapat dihapus atau ditimpa selama durasi tertentu.

**Legal hold**: Objek tidak dapat dihapus, terlepas dari periode retensi, sampai legal hold secara eksplisit dihapus.

Gunakan S3 Object Lock untuk industri yang diatur: catatan keuangan (SEC Rule 17a-4), catatan kesehatan (HIPAA), arsip kepatuhan.

## Kekuatan dan Keterbatasan

**Mengapa tier penyimpanan S3 penting**:

- Pengurangan biaya yang signifikan tanpa mengorbankan daya tahan atau ketersediaan untuk apa yang sebenarnya diakses
- Kebijakan siklus hidup mengotomatiskan seluruh proses — tidak ada beban operasional
- S3 Intelligent-Tiering menghilangkan kebutuhan untuk memprediksi pola akses

**Di mana ini menjadi rumit**:

- Biaya durasi penyimpanan minimum berlaku untuk kelas Glacier (90 hari untuk Glacier Instant, 180 hari untuk Deep Archive) — penghapusan lebih awal tetap menimbulkan biaya minimum
- Biaya pengambilan dapat mengejutkanmu jika kamu sering mengakses data yang diarsipkan
- Transisi siklus hidup membutuhkan waktu — objek tidak dipindahkan secara instan setelah aturan dipicu
- Biaya pemantauan Intelligent-Tiering bertambah untuk bucket dengan jutaan objek kecil

## Ringkasan

- S3 memiliki tujuh kelas penyimpanan: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, dan Glacier Deep Archive.
- **Kebijakan siklus hidup** mengotomatiskan transisi antara kelas penyimpanan berdasarkan usia — definisikan sekali, S3 menanganinya selamanya.
- **S3 Intelligent-Tiering** secara otomatis memindahkan objek antara tier berdasarkan pola akses aktual — gunakan untuk beban kerja yang tidak terduga.
- **Unggahan multipart** diperlukan untuk objek > 5GB dan direkomendasikan untuk apa pun > 100MB.
- **Replikasi S3** (SRR dan CRR) menyalin objek lintas bucket dan region — untuk DR, kepatuhan, atau agregasi.
- **S3 Object Lock** menyediakan penyimpanan WORM untuk skenario kepatuhan.

## Tips Ujian

*Domain SAA-C03: Merancang Arsitektur yang Dioptimalkan Biaya (Domain 4, Tugas 4.1)*

- **Sinyal pemilihan kelas penyimpanan**:
  - "Sering diakses" → Standard
  - "Diakses sekali sebulan, butuh pengambilan instan" → Standard-IA
  - "Dapat mentolerir jam pengambilan, jarang diakses" → Glacier Flexible Retrieval
  - "Kepatuhan regulasi, retensi 7+ tahun, tidak pernah diakses" → Glacier Deep Archive
  - "Pola akses tidak diketahui atau berubah" → Intelligent-Tiering
- **Pola ujian kebijakan siklus hidup**: "kurangi biaya penyimpanan secara otomatis seiring data menua," "transisi ke arsip setelah 90 hari" → kebijakan siklus hidup.
- **Biaya pemantauan Intelligent-Tiering**: Biaya per objek yang kecil. Untuk sejumlah besar objek kecil, ini dapat melebihi penghematan. Ujian mungkin menguji ini.
- **Persyaratan CRR**: Versioning harus diaktifkan di bucket sumber dan tujuan. Sumber dan tujuan harus berada di region berbeda.
- **S3 Object Lock**: "WORM," "immutable," "SEC 17a-4," "tidak dapat dihapus atau dimodifikasi" → Object Lock. Mode governance (dapat diganti oleh admin). Mode compliance (tidak dapat diganti oleh siapa pun, termasuk root).
- **Pemulihan Glacier**: Objek di Glacier tidak tersedia segera. Kamu harus "memulihkan" salinan ke S3 Standard untuk akses. Salinan yang dipulihkan bersifat sementara (kamu menetapkan durasinya). Aslinya tetap di Glacier.

## Latihan

**Latihan 1 — Mengingat Kembali**

Jelaskan perbedaan antara S3 Standard-IA dan S3 Glacier Instant Retrieval. Pola akses apa yang membuat masing-masing sesuai?

*(Petunjuk: Pikirkan seberapa sering kamu mengakses data dan seberapa cepat kamu membutuhkannya saat kamu mengaksesnya.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan menghasilkan 500GB log aplikasi setiap hari. Log sangat banyak dikueri dalam 7 hari pertama (debugging dan pemantauan). Setelah 7 hari, log jarang diakses tetapi harus tersedia dalam 30 menit jika diperlukan. Setelah 1 tahun, log harus dipertahankan untuk kepatuhan tetapi tidak pernah diakses. Perusahaan perlu meminimalkan biaya penyimpanan sambil memenuhi persyaratan ini.

Kebijakan siklus hidup S3 mana yang PALING memenuhi persyaratan ini?

A) Simpan di S3 Standard selama 7 hari; transisi ke S3 Glacier Deep Archive setelah 7 hari; kedaluwarsa setelah 365 hari  
B) Simpan di S3 Standard selama 7 hari; transisi ke S3 Standard-IA setelah 7 hari; transisi ke S3 Glacier Flexible Retrieval setelah 365 hari  
C) Simpan semua log di S3 Intelligent-Tiering dari hari pertama  
D) Simpan di S3 Standard selama 7 hari; transisi ke S3 Glacier Instant Retrieval setelah 7 hari; transisi ke S3 Glacier Deep Archive setelah 365 hari

**Petunjuk 1**: "Tersedia dalam 30 menit" menyingkirkan kelas penyimpanan mana?

**Petunjuk 2**: Deep Archive membutuhkan 12 jam untuk diambil — tidak memenuhi persyaratan 30 menit untuk hari 7-365.

**Petunjuk 3**: Setelah 365 hari, waktu pengambilan tidak penting (tidak pernah diakses), jadi opsi termurah berlaku.

**Jawaban**: D

**Penjelasan**: S3 Standard selama 7 hari menangani akses sering. Glacier Instant Retrieval menyediakan akses milidetik untuk hari 7-365 — memenuhi persyaratan 30 menit dengan biaya yang jauh lebih rendah dibanding Standard-IA. Setelah 365 hari, Glacier Deep Archive adalah opsi termurah untuk data yang tidak pernah diakses.

**Mengapa bukan A?** Glacier Deep Archive membutuhkan 12 jam untuk diambil — tidak memenuhi persyaratan "ketersediaan 30 menit" untuk hari 7-365.

**Mengapa bukan B?** Standard-IA setelah 7 hari berhasil, tetapi Glacier Instant Retrieval jauh lebih murah. Standard-IA lebih sesuai ketika kamu membutuhkan pengambilan instan tetapi akses jarang — di sini, data hampir tidak pernah diakses setelah hari ke-7, membuat Glacier lebih hemat biaya.

**Mengapa bukan C?** Intelligent-Tiering memiliki biaya pemantauan per objek dan mungkin tidak memindahkan log ke tier arsip seagresif aturan siklus hidup eksplisit. Untuk volume log yang besar dengan pola akses yang dapat diprediksi, aturan siklus hidup eksplisit lebih hemat biaya.

*Domain SAA-C03: Merancang Arsitektur yang Dioptimalkan Biaya — Tugas 4.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus memiliki tiga jenis data S3 dengan karakteristik berbeda:

- Foto restoran: diunggah sekali, diakses berkali-kali oleh pelanggan, tidak pernah dihapus
- Tanda terima pesanan: diakses oleh pelanggan di bulan pertama, disimpan 7 tahun untuk keperluan pajak
- Ekspor analitik: dibuat setiap hari, dianalisis di minggu berikutnya, disimpan 2 tahun

Rancang kebijakan siklus hidup untuk masing-masing. Untuk foto restoran, apakah Intelligent-Tiering masuk akal? Untuk tanda terima pesanan, kelas penyimpanan apa yang mencakup jendela 1 bulan hingga 7 tahun? Untuk ekspor analitik, bagaimana kamu akan mengstrukturkan bucket untuk menerapkan kebijakan berbeda ke awalan yang berbeda?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih pemilihan tier penyimpanan untuk data dunia nyata.)*

## Adegan Pasca-Kredit

Tom mengimplementasikan kebijakan siklus hidup.

Tagihan S3 turun dari $847 menjadi $198 di bulan berikutnya.

Dia mencetak perbandingan dan meletakkannya di meja Maya tanpa berkata apa-apa.

Maya melihatnya. Kemudian melihat tanggalnya. Kemudian melihat Tom.

"Tiga minggu," katanya.

"Satu sore untuk merancang kebijakan," katanya. "Satu jam untuk mengimplementasikannya. Tiga minggu untuk melihat siklus penagihan penuh pertama."

"Pengurangan dua pertiga biaya S3."

"Untuk data yang tidak kita akses."

Maya melihat angka-angkanya lagi.

"Tom," katanya, "aku ingin kamu melakukan tinjauan ini untuk setiap layanan AWS yang kita gunakan. Penyimpanan, komputasi, jaringan. Temukan pemborosannya."

Dia sudah kembali ke mejanya.

"Aku mulai minggu lalu," katanya.

Di bab berikutnya: tier database memiliki versi percakapan ini sendiri, dan Aurora adalah jawaban yang tidak Tom sangka akan ia sukai.
