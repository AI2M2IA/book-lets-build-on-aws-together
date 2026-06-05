# Babat Chapter 8: Administrator Database yang Tidak Pernah Sakit

Pukul 3 pagi ketika peringatan itu muncul.

Server database membutuhkan patch keamanan — jenis yang memerlukan restart. Kerentanannya nyata, patchnya tersedia, dan jendela untuk menerapkannya tanpa mengganggu pelanggan tepat saat ini, di tengah malam ketika lalu lintas rendah.

Priya adalah satu-satunya yang terjaga. Dia menerapkan patch, me-restart server, mengamati log hingga aplikasi kembali online, dan tidur pada pukul 4:15 pagi.

Pagi harinya dia memberi tahu tim apa yang terjadi. Ada keheningan.

"Itu akan terjadi lagi," kata Tom.

"Itu akan terjadi setiap kali ada patch," kata Priya. "Dan selalu ada patch. Harus ada cara yang lebih baik untuk melakukan ini."

Ada. Itu hanya membutuhkan menyerah pada gagasan bahwa mereka perlu mengelola database itu sendiri.

**Masalah Database Tradisional**

Ketika Anda menjalankan database sendiri pada instance EC2, Anda bertanggung jawab atas semuanya.

Menginstal perangkat lunak database. Mengonfigurasinya dengan aman. Memperbarui patchnya ketika kerentanan keamanan terdeteksi. Membuat cadangan. Menguji bahwa cadangan tersebut benar-benar berfungsi (langkah yang dilewati sebagian besar tim hingga terlambat). Memantau ruang disk. Mengatur replikasi untuk redundansi. Mengonfigurasi failover ketika server utama mati. Menyesuaikan kinerja kueri. Mengelola koneksi di bawah beban.

Tidak satu pun dari ini adalah aplikasi. Tidak ada dari ini menambahkan fitur. Semua dari ini membutuhkan keahlian.

Sebagian besar tim pengembangan bukanlah administrator database. Ini menciptakan pola yang dapat diprediksi: database diinstal, dikonfigurasi secara minimal, dan kemudian sebagian besar terlupakan sampai sesuatu yang katastropik terjadi.

"Apakah itu yang kita lakukan?" tanya Maya.

Jawaban Leo adalah keheningan, yang sama dengan ya.

**Amazon RDS: Layanan Database Terkelola**

**Amazon RDS** — Relational Database Service — menangani beban operasional menjalankan database relasional sehingga Anda tidak perlu melakukannya.

Dengan RDS, AWS mengelola:

- Menginstal dan memperbarui mesin database
- Cadangan otomatis (disimpan di S3, dipertahankan selama hingga 35 hari)
- Failover otomatis (ketika utama gagal, standby mengambil alih secara otomatis)
- Pemantauan dan metrik
- Enkripsi saat istirahat dan dalam transit
- Skalabilitas penyimpanan otomatis (jika Anda mengaktifkannya, disk tumbuh ketika penuh)

Anda mengelola:

- Skema database (struktur tabel Anda)
- Kueri dan logika aplikasi Anda
- Siapa yang memiliki akses ke database
- Jenis instance yang menjalankan database
- Penyetelan parameter (meskipun RDS menyediakan default yang masuk akal)

Analogi: menyewa administrator database yang tidak pernah absen, tidak pernah membuat kesalahan konfigurasi, secara otomatis mengambil cadangan harian, dan memperbaiki diri jika sesuatu yang rusak — tetapi yang tidak menulis logika aplikasi Anda.

**Mesin yang Didukung**

RDS mendukung beberapa mesin database populer:

- **MySQL** — mesin relasional sumber terbuka yang paling banyak digunakan
- **PostgreSQL** — kuat, dapat diperluas, semakin populer untuk beban kerja yang kompleks
- **MariaDB** — cabang sumber terbuka MySQL, sepenuhnya kompatibel
- **Oracle** — tingkat perusahaan, digunakan dalam organisasi besar dengan persyaratan warisan
- **Microsoft SQL Server** — untuk lingkungan berbasis Windows
- **Amazon Aurora** — mesin AWS sendiri, kompatibel dengan MySQL/PostgreSQL, dibangun untuk cloud (kami membahas Aurora secara mendalam di Bab 24)

Untuk Nimbus, pilihan adalah PostgreSQL. Itu yang diketahui Leo, dan itu menangani data relasional dengan baik. Pilihan mesin kurang penting daripada yang Anda pikirkan untuk sebagian besar aplikasi — manfaat operasional RDS berlaku terlepas dari itu.

**Multi-AZ: Standby yang Mengambil Alih**

Ini adalah fitur yang mengubah kalkulus keandalan secara keseluruhan.

**Penyebaran Multi-AZ** berarti RDS memelihara instance standby sinkron di Zona Ketersediaan yang berbeda dari utama. Setiap transaksi yang dikomit ke utama direplikasi secara sinkron ke standby sebelum komitmen diterima.

Ketika utama gagal — kegagalan perangkat keras, gangguan AZ, crash perangkat lunak — RDS secara otomatis beralih ke standby. Catatan DNS untuk endpoint database diperbarui. Aplikasi Anda terhubung kembali ke utama baru.

Failover membutuhkan waktu 60–120 detik. Selama jendela itu, aplikasi Anda akan mengalami kesalahan koneksi. Aplikasi yang ditulis dengan benar harus menangani ini dengan baik (retries koneksi dengan offset).

Standby bukanlah replika baca. Itu tidak melayani lalu lintas baca. Tujuannya adalah untuk siap mengambil alih.

Tom: "Berapa biaya Multi-AZ?"

Perkiraan dua kali biaya instance tunggal — karena Anda pada dasarnya menjalankan dua instance database. Standby memiliki biaya yang sama dengan utama.

Tom: "Dan berapa biaya gangguan yang tidak direncanakan?"

Dia menjawab pertanyaannya sendiri dengan membuka riwayat pesanan dan memperkirakan pendapatan per jam selama puncak Jumat mereka.

Multi-AZ diaktifkan pada sore hari.

**Cadangan Otomatis dan Pemulihan Titik Waktu**

RDS mengambil cadangan otomatis setiap hari. AWS menyimpan cadangan ini di S3 (dikelola oleh RDS — Anda tidak melihatnya secara langsung di konsol S3 Anda). Anda dapat memulihkan database ke titik mana pun dalam periode retensi cadangan Anda.

Backups terjadi selama jendela pemeliharaan yang dapat dikonfigurasi — periode lalu lintas rendah, biasanya di pagi hari. Untuk sebagian besar jenis mesin, backup tidak menyebabkan downtime.

**Pemulihan pada titik waktu** adalah salah satu fitur yang paling berharga: Anda dapat memulihkan ke setiap detik dalam periode retensi Anda. Bukan hanya snapshot harian — *setiap detik*. Ini mungkin karena RDS terus-menerus mengarsipkan log transaksi selain backup harian.

Jika seseorang secara tidak sengaja menjalankan `DELETE FROM orders WHERE 1=1` pada pukul 14.37, Anda dapat memulihkan ke pukul 14.36.

Leo tampak rileks ketika dia memahami ini.

"Bisakah kita memulihkan dari apa yang saya hapus bulan lalu?" dia bertanya.

"Sebelum RDS? Tidak," kata Priya. "Setelah RDS? Ya."

**Replika Baca: Skalabilitas Lalu Lintas Baca**

Multi-AZ tentang ketersediaan. **Replika baca** tentang kinerja.

Replika baca adalah salinan asinkron dari database utama Anda yang dapat melayani kueri baca. Anda dapat memiliki hingga lima replika baca untuk sebagian besar mesin RDS (lebih banyak untuk Aurora).

Aplikasi dimodifikasi untuk mengirim kueri baca ke replika dan kueri tulis ke utama. Ini mendistribusikan beban: utama menangani tulis dan transaksi kompleks; replika menangani baca.

Fitur-fitur utama:

- Replikasi bersifat **asinkron** — mungkin ada penundaan kecil (lag) antara utama dan replika. Jika Anda menulis catatan dan segera membaca dari replika, Anda mungkin tidak melihatnya belum.
- Replika baca dapat berada di wilayah yang sama atau di wilayah yang berbeda (replika lintas wilayah menambahkan latensi tetapi memungkinkan distribusi geografis).
- Replika baca dapat dipromosikan menjadi database mandiri dalam skenario bencana.

Untuk Nimbus: lookup menu adalah baca. Riwayat pesanan adalah baca. Sebagian besar lalu lintas adalah lalu lintas baca. Menambahkan replika baca dan mengarahkan baca ke sana secara signifikan mengurangi beban database utama.

Kami membahas replika baca secara lebih rinci di Bab 24 ketika kami membahas Aurora.

**Parameter Grup RDS dan Grup Opsi**

Dua mekanisme konfigurasi yang muncul dalam ujian:

**Grup parameter** mengontrol pengaturan mesin database — seperti jumlah koneksi maksimum, ukuran cache kueri, nilai timeout. RDS membuat grup parameter default yang berfungsi untuk sebagian besar kasus. Anda membuat grup parameter khusus ketika Anda perlu menyetel pengaturan tertentu.

**Grup opsi** mengaktifkan fitur tambahan untuk beberapa mesin — seperti enkripsi jaringan native Oracle atau enkripsi data transparan SQL Server. Sebagian besar penyebaran mesin sumber terbuka tidak memerlukan grup opsi khusus.

Anda tidak perlu menghafal ini. Ketahui bahwa mereka ada untuk menyesuaikan perilaku mesin database.

## Kekuatan dan Batasan

**Mengapa RDS itu luar biasa:**

- Menghilangkan beban operasional dalam mengelola perangkat lunak database
- Backup otomatis dan pemulihan pada titik waktu
- Multi-AZ untuk failover otomatis dengan RTO minimal
- Replika baca untuk skalabilitas lalu lintas baca
- Enkripsi saat istirahat dan dalam transit dibangun di dalam
- Semua mesin database relasional utama didukung

**Di mana RDS memiliki batasan:**

- Anda tidak dapat mengakses sistem operasi dasar. Anda tidak dapat menginstal perangkat lunak OS-level khusus atau mengubah pengaturan sistem operasi. Jika database Anda memiliki persyaratan yang membutuhkan akses OS-level, Anda mungkin perlu menjalankan database EC2 Anda sendiri.
- RDS bukanlah serverless (dengan pengecualian — Aurora Serverless ada, dibahas di Bab 24). Anda membayar untuk instance yang berjalan bahkan jika tidak aktif.
- RDS tidak dirancang untuk database yang di-shard secara horizontal. Untuk skala-out besar dari beban kerja relasional tulis-berat, Anda mungkin akhirnya membutuhkan arsitektur yang berbeda.
- Untuk pola data NoSQL, DynamoDB (Bab 9) lebih tepat.

## Ringkasan

- **Amazon RDS** adalah layanan database relasional yang dikelola. AWS menangani patching, backup, failover, dan manajemen penyimpanan. Anda menangani skema, kueri, dan logika aplikasi.
- **Multi-AZ** deployment mempertahankan standby sinkron dalam AZ yang berbeda. Failover otomatis terjadi dalam 60–120 detik jika utama gagal.
- **Backup otomatis** dengan **pemulihan pada titik waktu** memungkinkan Anda memulihkan ke setiap detik dalam periode retensi.
- **Replika baca** adalah salinan asinkron yang melayani lalu lintas baca, mengurangi beban pada utama. Lag replikasi berarti mereka mungkin sedikit tertinggal.
- Pilih RDS ketika Anda membutuhkan database relasional dengan operasi yang dikelola. Gunakan Aurora (Bab 24) ketika Anda membutuhkan kinerja yang lebih tinggi atau opsi serverless.

## Tips Ujian

*SAA-C03 Domain 3 — Tugas 3.3 (solusi database)*

- **Multi-AZ adalah untuk ketersediaan tinggi, bukan kinerja.** Standby tidak melayani lalu lintas baca. Replika baca adalah untuk kinerja. Perbedaan ini sering diuji.
- **Failover Multi-AZ otomatis.** Anda tidak perlu mengonfigurasi kapan atau bagaimana hal itu terjadi. RDS memantau primary dan memicu failover secara otomatis.
- **Lag replikasi penting.** Replika baca dapat sedikit tertinggal dari primary. Jika aplikasi Anda memerlukan membaca data yang baru saja ditulis, ia harus membaca dari primary, bukan replika. Ini disebut "read-your-writes consistency."
- **Cadangan otomatis dipertahankan selama 0–35 hari.** Mengatur retensi ke 0 menonaktifkan cadangan otomatis. Snapshot manual dipertahankan selamanya sampai Anda menghapusnya.
- **Skalabilitas penyimpanan RDS otomatis** mencegah pemadaman karena disk penuh. Aktifkan. Ini hanya menskalakan ke atas, tidak pernah ke bawah. Ujian mungkin menguji apakah Anda tahu asimetri ini.

## Latihan

**Latihan 1 — Ingatan**

Dengan kata-kata Anda sendiri: apa perbedaan antara Multi-AZ dan replika baca di RDS?
Apa masalah yang diselesaikan masing-masing satu?

*(Petunjuk: Satu melindungi terhadap downtime; yang lain meningkatkan kinerja di bawah beban baca. Mereka memecahkan masalah yang berbeda dan dapat digunakan bersama.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan menjalankan database PostgreSQL produksi di RDS. Database mengalami lalu lintas baca tinggi karena kueri pelaporan yang berjalan sepanjang hari. Tim juga khawatir tentang ketersediaan database — mereka tidak dapat mentolerir lebih dari beberapa menit downtime dalam skenario kegagalan. Mereka ingin meminimalkan dampak pada database primary dari beban kerja pelaporan.

Kombinasi fitur RDS MANA YANG TERBAIK yang mengatasi kedua kekhawatiran tersebut?

A) Aktifkan Multi-AZ dan jalankan semua kueri terhadap instance standby
B) Aktifkan Multi-AZ untuk perlindungan failover dan buat replika baca untuk kueri pelaporan
C) Buat beberapa replika baca dan nonaktifkan Multi-AZ untuk mengurangi biaya
D) Ambil snapshot manual yang lebih sering dan pulihkan dari mereka jika primary gagal

**Petunjuk 1**: Kedua persyaratan adalah: (1) ketersediaan selama kegagalan, (2) membebaskan baca. Fitur mana yang mengatasi persyaratan mana?

**Petunjuk 2**: Multi-AZ menyediakan failover otomatis. Standby tidak melayani lalu lintas baca. Jadi Multi-AZ saja tidak membantu dengan masalah baca.

**Petunjuk 3**: Replika baca melayani lalu lintas baca. Multi-AZ menyediakan failover. Anda membutuhkan keduanya.

**Jawaban**: B

**Penjelasan**: Multi-AZ menyediakan failover otomatis ke standby di AZ yang berbeda — ini mengatasi persyaratan ketersediaan. Replika baca memungkinkan kueri pelaporan untuk berjalan tanpa memengaruhi database primary — ini mengatasi persyaratan kinerja. Kedua fitur dapat digunakan secara bersamaan.

**Mengapa bukan A?** Standby Multi-AZ tidak dapat melayani lalu lintas baca. Ini secara eksklusif untuk failover. Mencoba mengkueri langsung ke itu tidak didukung.

**Mengapa bukan C?** Replika baca membantu dengan kinerja baca tetapi tidak menyediakan failover otomatis. Jika primary gagal, Anda perlu mempromosikan replika baca secara manual — yang membutuhkan waktu dan bukan otomatis.

**Mengapa bukan D?** Snapshot manual memulihkan salinan penuh dari database — proses yang jauh lebih lama (mungkin berjam-jam untuk database besar). Ini tidak memenuhi persyaratan "beberapa menit downtime."

*SAA-C03 Domain 3 — Tugas 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang mempertimbangkan untuk memigrasikan database PostgreSQL self-managed mereka yang ada (berjalan di instance EC2) ke RDS PostgreSQL. Migrasi perlu terjadi dengan downtime minimal — idealnya kurang dari 15 menit. Database tersebut berukuran 200 GB.

Pendekatan apa yang akan Anda rekomendasikan? Layanan AWS mana yang dapat membantu dengan migrasi? Risiko apa yang akan Anda uji sebelum melakukan cutover produksi?

*(Tidak ada jawaban yang benar tunggal. Pikirkan tentang AWS Database Migration Service, replikasi logis, dan risiko inkonsistensi data selama cutover.)*

## Adegan Pasca Kredit

Pada akhir hari, Nimbus telah bermigrasi ke RDS PostgreSQL dengan Multi-AZ diaktifkan. Migrasi itu sendiri memakan sebagian besar sore — Leo menggunakan pendekatan backup-and-restore, dengan jendela pemeliharaan singkat.

Tom telah memantau tagihan dengan cermat.

"Instance RDS," katanya, "berkosta dua kali lipat dari EC2 database yang kami miliki."

"Dan cadangan otomatis?" Maya bertanya.

"Sedikit lebih banyak."

"Dan failover yang akan kami dapatkan secara gratis jika primary mati?"

Tom tidak memiliki harga untuk itu. Dia menulisnya sebagai pertanyaan.

Tiga hari kemudian, database itu sehat. Waktu kueri telah sedikit menurun tetapi tidak cukup. Menu masih lambat untuk dimuat. Dua puluh dua ribu item. Dua puluh dua ribu baris dalam kueri yang mengembalikan semuanya, setiap saat.

"Masalahnya bukan mesin database," kata Priya, "Ini adalah model data. Data ini memiliki bentuk yang bervariabel. SQL sedang melawan kita."

Dia berhenti.

"Beberapa item menu, profil restoran, zona pengiriman — data ini memiliki bentuk yang bervariabel. SQL sedang melawan kita."

Leo sudah meneliti sesuatu.

"Apa jika kita menggunakan jenis database yang berbeda untuk menu?" katanya.

Di bab berikutnya: database yang tidak memperlambat, bahkan ketika jutaan orang memesan sekaligus.
