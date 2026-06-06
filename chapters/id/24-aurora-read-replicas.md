# Bab 24: Database yang Tumbuh Bersama Anda

Bayangkan sebuah perpustakaan yang dimulai dengan dua rak dan satu pustakawan. Itu cukup, untuk sementara. Pustakawan tahu di mana segala sesuatu berada. Permintaan dijawab dengan cepat. Lalu perpustakaan tumbuh: sepuluh rak, dua puluh, empat puluh. Pustakawan yang sama, meja yang sama, katalog kartu yang sama. Sekarang menemukan apa pun membutuhkan penantian. Pustakawan tidak lambat—hanya saja ada lebih banyak perpustakaan daripada yang bisa dilayani satu orang dengan kecepatan aslinya.

Solusinya bukan pustakawan yang lebih cepat. Solusinya adalah jenis perpustakaan yang berbeda.

---

Setelah pengurangan biaya S3, Tom melanjutkan tinjauannya. Tier database adalah jenis masalah yang berbeda—bukan data menganggur di storage class yang salah, tetapi sistem yang secara aktif berjuang di bawah beban enam bulan pertumbuhan lalu lintas.

---

Angka-angkanya tidak nyaman.

Nimbus menjalankan RDS PostgreSQL: Multi-AZ, instance db.r6g.large. $340/bulan.

Leo memunculkan dasbor metrik CloudWatch. Angka-angkanya memiliki pola.

**DatabaseConnections**: 198 dari maksimum 200 selama puncak Jumat. Dua koneksi dari saturasi. Pada 200, upaya koneksi baru akan gagal dengan "too many connections"—kesalahan yang akan muncul sebagai HTTP 500 ke pelanggan yang memesan makan malam.

**CPUUtilization**: 89% puncak selama jam sibuk makan malam Jumat. Instance dirancang untuk menangani lonjakan—sebuah db.r6g.large memiliki 2 vCPU dan 16 GB memori—tetapi CPU 89% yang berkelanjutan berarti database berada di kapasitas bahkan sebelum jam puncak tiba.

**ReadLatency**: 840 milidetik P95. Enam bulan lalu, ia 180ms. Degradasinya bertahap—10 hingga 20ms per minggu—tak terlihat sampai ia menjadi katastropik. Seminggu sebelum tinjauan Tom, latensi P99 telah melewati satu detik penuh. Pelanggan yang mengklik menu restoran menunggu lebih dari satu detik untuk halaman dimuat.

**FreeStorageSpace**: 18% dari penyimpanan yang disediakan tersisa. Pada laju pertumbuhan saat ini, database akan kehabisan penyimpanan yang disediakan dalam kira-kira 11 minggu.

"Masing-masing dari ini bisa diselesaikan secara terpisah," kata Leo, menatap dasbor. "Tetapi kita memiliki keempatnya sekaligus."

Lonjakan jumlah koneksi menunjuk ke masalah connection pooling di aplikasi—terlalu banyak task ECS yang membuka koneksi database mereka sendiri. Masalah CPU menunjuk ke kueri yang mahal. Masalah latensi dan masalah CPU hampir pasti adalah masalah yang sama: sebuah kueri lambat yang berjalan terlalu sering.

"Tunggu—tapi *mengapa* kita di 198 koneksi?" tanya Maya. "Kita punya tiga task ECS. Bagaimana kita punya hampir 200 koneksi database?"

Setiap task ECS menggunakan SQLAlchemy dengan ukuran pool default 5 koneksi ditambah overflow 10. Tiga task × 15 potensi koneksi = 45 koneksi dari aplikasi. 153 sisanya berasal dari fungsi Lambda analitik, pekerja pekerjaan latar belakang, pekerjaan Glue ETL, koneksi lokal tim pengembangan melalui bastion host, dan beberapa koneksi yang telah dibuka tetapi tidak ditutup dengan benar oleh versi kode yang lebih lama.

"Masalah jumlah koneksi," kata Leo, "sebenarnya adalah masalah aplikasi yang terlihat seperti masalah database." Ia menambahkan PgBouncer (sebuah connection pooler) ke daftar tugas—tetapi penyumbatan langsungnya adalah kueri lambat.

CPU database melonjak ke 89% selama jam sibuk makan malam Jumat. Kueri baca mengantre. Latensi kueri P95 telah berlipat ganda selama enam bulan.

"Database adalah penyumbatnya," katanya. "Lalu lintas telah tumbuh. Database belum menskala bersamanya."

"Bisakah kita sekadar membuat instance-nya lebih besar?" tanya Maya. "Tunggu—tapi *mengapa* kita memiliki satu database yang menangani semua baca dan tulis? Mengapa kita tidak mendistribusikan ini dari awal?"

"Bisa," kata Leo. "Itu penskalaan vertikal. Kita pindah dari r6g.large ke r6g.xlarge. CPU lebih banyak, memori lebih banyak. Itu akan berbiaya lebih dan membelikan kita waktu."

"Tetapi itu tidak memperbaiki masalah mendasarnya," kata Priya. "Pada akhirnya kita akan mencapai instance terbesar dan membutuhkan pendekatan yang berbeda. Dan sudahkah kita memikirkan apa yang terjadi jika sebuah tulisan masuk ke read replica secara tidak sengaja? Replica menolaknya dan pesanan gagal secara diam-diam."

"Ada dua pendekatan," kata Leo. "Read replica, atau Aurora."

"Apa perbedaannya?"

"Pikirkan itu seperti perpustakaan," kata Leo, mengambil spidol. "Satu pustakawan yang baik memeriksa pengembalian buku maupun menjawab pertanyaan pengunjung. Ketika perpustakaan menjadi populer, antrean terbentuk. Solusinya: rekrut lebih banyak pustakawan—tetapi hanya untuk menjawab pertanyaan. Pengembalian masih melalui meja asli."

"Itu sebuah read replica," kata Priya.

"Tepat. Aurora melangkah lebih jauh—ia mendesain ulang sistem rak itu sendiri sehingga setiap pustakawan berbagi rak yang sama dan selalu melihat buku yang sama, tanpa penundaan. Tanpa menunggu pembaruan menetes dari satu meja ke meja lain."

**Read Replica: Mendistribusikan Lalu Lintas Baca**

Kebanyakan aplikasi web membaca data jauh lebih sering daripada menulisnya. Seorang pelanggan yang menjelajahi menu membuat lusinan kueri SELECT. Menempatkan pesanan membuat beberapa kueri INSERT/UPDATE. Rasionya biasanya 10:1 atau lebih tinggi.

Sebuah **read replica** adalah instance RDS tambahan yang menerima salinan semua tulisan dari primary dan membuat tulisan itu tersedia untuk kueri SELECT.

Cara kerjanya:

1. Tulisan aplikasi (INSERT, UPDATE, DELETE) masuk ke database primary
2. Primary mereplikasi perubahan itu secara asinkron ke read replica
3. Bacaan aplikasi (SELECT) didistribusikan ke read replica
4. Read replica berbagi beban—masing-masing menangani sebagian dari total lalu lintas baca

Hasilnya: database primary hanya menangani tulisan (dan secara opsional beberapa bacaan). Read replica menangani beban baca. Untuk rasio baca/tulis 10:1, menambahkan satu read replica kira-kira menjadikan total beban primary setengahnya.

**Batasan penting**: Replikasi bersifat **asinkron**. Ada lag replikasi—biasanya milidetik, tetapi bisa detik di bawah beban. Bacaan dari replica mungkin melihat data yang sedikit di belakang primary. Untuk sebagian besar bacaan (menjelajahi menu, melihat riwayat pesanan), ini dapat diterima. Untuk "apakah pesanan saya baru saja lolos?"—baca dari primary.

**Read Replica: Detailnya**

- Anda bisa memiliki hingga 15 read replica per instance RDS primary (MySQL, PostgreSQL, MariaDB)
- Read replica bisa berada di region yang sama atau region yang berbeda (replica lintas-region)
- Read replica bisa memiliki read replica-nya sendiri (chaining)
- Read replica adalah endpoint terpisah—aplikasi Anda harus mengarahkan bacaan ke endpoint replica
- Read replica bisa dipromosikan menjadi database mandiri (berguna untuk DR)

Untuk Nimbus, Leo menambahkan satu read replica. "Akan baik-baik saja," katanya ketika Priya bertanya apakah ia telah menguji logika perutean baca/tulis aplikasi sebelum mengalihkan lalu lintas. Ia belum. Ia menghabiskan empat puluh menit berikutnya memverifikasi bahwa tulisan tidak masuk ke endpoint read replica.

Ia memperbarui aplikasi menjadi:

- Operasi tulis → endpoint primary
- Menjelajahi menu, riwayat pesanan → endpoint replica

CPU pada primary turun dari 89% menjadi 41% pada puncak.

**Masalah Konsistensi Read-After-Write**

Tiga hari setelah mengaktifkan read replica, sebuah tiket dukungan tiba. Seorang mitra restoran telah memperbarui menu mereka—menghapus item yang dihentikan—lalu menelepon untuk mengonfirmasi bahwa item itu telah dihapus. Agen layanan pelanggan memunculkan menu dari antarmuka Nimbus. Item itu masih ada.

Dua puluh detik kemudian, ia hilang.

Lag replikasi asinkron. Tulisan (DELETE item menu) masuk ke primary. Bacaan agen layanan pelanggan masuk ke replica, yang belum menerima perubahan itu. Replica tertinggal 15 detik pada saat itu—tidak biasa, tetapi terlihat.

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui jendela konsistensi akhir?" tanya Priya. "Atau sekadar—bagaimana jika pesanan ditempatkan untuk item menu yang baru saja dihapus? Kita akan menagih pelanggan dan restoran tidak akan memiliki item itu."

Ini adalah kekhawatiran konsistensi yang nyata, bukan sekadar gangguan UX.

Solusinya: identifikasi bacaan mana yang memiliki persyaratan konsistensi dan rutekan ke primary.

**Bacaan yang bisa masuk ke replica** (konsistensi akhir baik-baik saja):
- Pelanggan menjelajahi menu restoran (basi 1-2 detik tidak terasa)
- Kueri riwayat pesanan (pengguna melihat riwayat pesanan mereka dari semenit lalu)
- Bacaan jenis-analitik (restoran teratas minggu ini)

**Bacaan yang harus masuk ke primary** (konsistensi read-after-write diperlukan):
- Segera setelah tulisan, ketika aplikasi perlu mengonfirmasi tulisan berhasil
- Bacaan status pesanan segera setelah penempatan pesanan
- Bacaan menu yang dipicu oleh antarmuka manajemen restoran (restoran baru saja mengubah menu)

Aplikasi menambahkan petunjuk perutean di lapisan koneksi database: jika permintaan datang dari dasbor manajemen restoran, rutekan ke primary. Jika datang dari pelanggan yang menjelajah, rutekan ke replica. Header HTTP `X-Read-Consistency: strong` berfungsi sebagai sinyalnya.

"Tidak terlalu sulit," kata Leo. "Anda hanya perlu tahu bacaan mana yang membutuhkannya."

"Dan mendokumentasikannya," kata Priya. "Agar orang berikutnya yang menambahkan endpoint baru tahu pool mana yang harus digunakan."

"Berapa biayanya per bulan?" tanya Tom. Itu pertanyaan pembuka standarnya untuk layanan baru apa pun.

Sebuah read replica dengan tipe instance yang sama berbiaya sama dengan primary. Dari $340/bulan menjadi $680/bulan.

"Kita menggandakan biaya untuk kira-kira menjadikan beban setengahnya," kata Tom.

"Ya. Tetapi alternatifnya adalah pindah ke tipe instance yang lebih besar, yang juga akan berbiaya lebih dan tidak akan mendistribusikan beban baca."

Tom menghitung. Ia mengangguk, dengan enggan.

"Bagaimana jika primary gagal?" tanya Maya, sebelum Tom bisa beralih ke Aurora. "Apa yang terjadi pada read replica?"

Leo menjelaskan promosi replica.

**Jika instance RDS primary gagal**, AWS secara otomatis melakukan failover ke replica standby dalam konfigurasi Multi-AZ (jenis replica yang berbeda—standby sinkron, bukan read replica). Standby Multi-AZ menjadi primary baru. Read replica terus melayani bacaan, sekarang mereplikasi dari primary baru. Dari perspektif aplikasi, DNS endpoint primary berubah untuk menunjuk ke mantan standby, dan aplikasi terhubung kembali.

Failover biasanya memakan 60-120 detik untuk RDS PostgreSQL. Selama jendela itu, tulisan gagal.

**Promosi read replica** adalah operasi terpisah—dan skenario terpisah. Jika Anda ingin mengambil read replica dan menjadikannya database independen yang dapat ditulis (untuk DR, untuk migrasi ke region baru, atau karena primary sudah hilang dan Anda perlu mempromosikan alih-alih menunggu failover Multi-AZ), Anda bisa mempromosikan read replica menjadi primary mandiri. Promosi memakan beberapa menit, setelahnya replica tidak lagi mereplikasi dari primary asli—ia adalah database-nya sendiri.

"Sudahkah kita memikirkan apa yang terjadi jika primary us-west-2 mati total?" tanya Priya. "Bukan sekadar failover ke standby Multi-AZ—seluruh region."

"Jika region gagal," kata Leo, "standby Multi-AZ juga ada di us-west-2. Keduanya gagal bersamaan."

"Jadi untuk skenario DR regional yang sesungguhnya," kata Tom, "kita akan membutuhkan read replica di us-east-1 yang bisa kita promosikan."

"Ya. Read replica lintas-region. Kita belum punya."

"Berapa biayanya per bulan?" tanya Tom. Ia sudah tahu jawabannya akan melibatkan sebuah keputusan.

Sebuah read replica lintas-region dari db.r6g.large di us-east-1: $340/bulan (biaya instance yang sama). Ditambah transfer data lintas-region untuk replikasi: minimal pada volume tulis Nimbus. Total: kira-kira $350/bulan untuk replica DR.

"Itu $4.200 per tahun," kata Tom, "untuk melindungi terhadap skenario yang terjadi pada region AWS kurang dari lima kali dalam sepuluh tahun."

"Dan biaya Nimbus down selama 24 jam selama kejadian regional adalah?" tanya Priya.

Tom menghitung. Ia tidak menjawab dengan keras. Tetapi ia menambahkan "read replica lintas-region" ke backlog DR.

"Apa itu Aurora?" tanyanya.

**Amazon Aurora: Memikirkan Ulang Mesin Database**

Aurora adalah mesin database relasional milik AWS, kompatibel dengan MySQL dan PostgreSQL. Ia dirancang dari awal untuk beban kerja cloud, membayangkan ulang bagaimana lapisan penyimpanan database relasional bekerja.

Dalam setup RDS tradisional (MySQL, PostgreSQL), penyimpanan dan komputasi terkopel ketat. Mesin database mengelola file data. Replikasi menyalin data dari primary ke replica. Replica harus mengulang setiap operasi tulis.

Ini menciptakan langit-langit pada kecepatan replikasi: sebuah replica hanya bisa menerapkan tulisan secepat ia bisa memproses log replikasi. Selama periode berat-tulis—impor massal, flash sale, pembaruan batch—replica bisa tertinggal. Lag replikasi bukan cacat dalam implementasi; ia adalah konsekuensi dari arsitektur.

Priya telah menandai ini segera ketika Leo mengusulkan read replica. "Dan sudahkah kita memikirkan apa yang terjadi jika lag replikasi melonjak ke 30 detik selama jam sibuk Jumat? Replica tertinggal 30 detik. Seorang pelanggan menempatkan pesanan, slot dapur dipesan di primary, tetapi pelanggan kedua yang mengkueri replica tidak melihat pemesanan itu. Dua pesanan, satu slot."

"Itu masalah konsistensi inventaris," kata Leo.

"Itu persis masalah konsistensi inventaris," Priya memastikan. "Itulah mengapa bacaan inventaris—'apakah item ini masih tersedia?'—harus masuk ke primary."

Arsitektur Aurora mengatasi lag secara langsung.

Aurora memisahkan penyimpanan dari komputasi. Ia menggunakan lapisan penyimpanan terdistribusi dan toleran-kesalahan yang mereplikasi data secara otomatis di tiga Availability Zone dalam enam salinan. Lapisan komputasi (instance database) berada di atas lapisan penyimpanan ini.

**Apa yang diubah ini**:

**Read replica**: Aurora replica tidak perlu mereplikasi data—mereka sudah berbagi lapisan penyimpanan yang sama. Ini berarti:

- Hingga 15 Aurora Replica yang berbagi volume penyimpanan (RDS biasa juga mengizinkan hingga 15 read replica, tetapi masing-masing adalah salinan data penuh)
- Lag replikasi biasanya di bawah 100 milidetik (vs detik untuk RDS di bawah beban)
- Replica bisa dipromosikan menjadi primary dalam di bawah 30 detik (vs menit)

**Failover**: Karena replica berbagi penyimpanan, failover jauh lebih cepat—promosi tidak melibatkan transfer data, hanya mengalihkan tulisan.

**Penyimpanan**: Aurora secara otomatis menskalakan penyimpanan dalam kenaikan 10GB, hingga 128 TiB (256 TiB dalam versi mesin terbaru). Anda tidak pernah menyediakan penyimpanan terlebih dahulu.

**Performa**: Aurora mengklaim throughput 5x dari MySQL standar dan 3x PostgreSQL standar untuk tipe instance yang setara.

Anda mungkin bertanya-tanya: jika semua replica berbagi penyimpanan yang sama, bukankah penyimpanan itu menjadi titik kegagalan tunggal? Lapisan penyimpanan Aurora secara otomatis mereplikasi data di enam salinan di tiga Availability Zone. Penyimpanan itu sendiri lebih tangguh daripada setup RDS Multi-AZ tunggal mana pun—ia dirancang untuk bertahan dari kehilangan seluruh AZ dengan nol kehilangan data dan tanpa perlu failover.

Pertanyaan umum kedua: jika Aurora kompatibel dengan MySQL/PostgreSQL, bisakah Anda bermigrasi dari RDS PostgreSQL ke Aurora PostgreSQL tanpa mengubah kode aplikasi? Hampir. Kompatibilitas Aurora PostgreSQL berarti Aurora mengimplementasikan protokol wire PostgreSQL dan mendukung sebagian besar sintaks dan fitur SQL PostgreSQL. Kebanyakan aplikasi bermigrasi tanpa perubahan kode. Kasus tepinya: sejumlah kecil ekstensi PostgreSQL tidak tersedia di Aurora, beberapa kueri katalog sistem mengembalikan nilai yang berbeda, dan operasi administratif tertentu berbeda. Untuk migrasi produksi, uji dengan lalu lintas baca paralel sebelum mengalihkan tulisan.

Untuk Nimbus, migrasi dari RDS PostgreSQL ke Aurora PostgreSQL memakan satu sore. Aplikasi diarahkan ke endpoint Aurora. Kueri menu—setelah Leo menambahkan indeks yang ditunjuk Performance Insights sebagai konsumen teratas beban database—berjalan dalam 4ms alih-alih 620ms. Connection pool tidak lagi mencapai 198 dari 200. Latensi P95 turun ke 28ms.

"Ini adalah mesin database yang berbeda," kata Leo, "yang dianggap aplikasi sebagai mesin database yang sama."

"Dan bagian yang menariknya?" tanya Maya.

"Kloning database cepat."

"Dicatat," kata Sam pelan dari seberang ruangan, sudah mengetik. Sam adalah insinyur backend yang bergabung dengan tim beberapa minggu sebelumnya untuk mengambil sebagian pekerjaan database dari pundak Leo. Tak seorang pun bertanya apa yang sedang ia lakukan.

**Harga Aurora: Pertanyaan Tom**

Harga Aurora berbeda dari RDS:

**Harga instance**: Mirip dengan harga instance RDS berdasarkan tipe.

**Harga penyimpanan**: $0,10 per GB per bulan (Anda membayar untuk apa yang disimpan, diskalakan secara otomatis).

**Harga I/O**: Aurora menagih per permintaan I/O (baca/tulis ke penyimpanan). Ini bisa signifikan untuk beban kerja berat-tulis.

"Tunggu," kata Tom. "Kita membayar untuk I/O secara terpisah?"

"Aurora Serverless v2 dan Aurora I/O-Optimized mengubah model harga ini," kata Leo. "Aurora I/O-Optimized tidak menagih biaya I/O tetapi harga penyimpanan dan instance yang lebih tinggi. Lebih baik untuk beban kerja berat-I/O."

Tom melihat trade-off-nya. Untuk Nimbus, yang berat-baca (banyak kueri menu, sedikit tulisan), Aurora I/O-Optimized mungkin berbiaya lebih. Harga Aurora standar mungkin sesuai.

Sebuah heuristik yang berguna: jika biaya I/O Anda melebihi sekitar 25% dari total tagihan Aurora Anda, I/O-Optimized kemungkinan lebih murah. Untuk beban kerja berat-baca Nimbus, biaya I/O rendah—harga standar berlaku. Untuk beban kerja berat-tulis seperti sistem logging kejadian, I/O-Optimized bisa mengurangi biaya secara signifikan.

Ini adalah keputusan biaya nyata yang dibuat insinyur senior: Anda perlu tahu pola I/O beban kerja Anda untuk memilih dengan benar.

Jika beban kerja Anda kecil, stabil, dan dapat diprediksi, RDS PostgreSQL lebih sederhana dan secara berarti lebih murah—tetapi jika lalu lintas Anda tak terduga, volume data Anda tumbuh melampaui apa yang bisa Anda sediakan terlebih dahulu, atau Anda membutuhkan failover otomatis dalam di bawah 30 detik, model penyimpanan bersama Aurora membenarkan biaya dasar yang lebih tinggi.

**Aurora Serverless: Menskala Tanpa Memikirkan Instance**

**Aurora Serverless v2** adalah konfigurasi yang secara otomatis menskalakan kapasitas komputasi berdasarkan beban database aktual. Alih-alih memilih ukuran instance tetap (db.r6g.large), Anda mengatur kapasitas minimum dan maksimum dalam Aurora Capacity Unit (ACU).

Aurora Serverless v2:

- Menskala naik dalam hitungan detik ketika beban meningkat
- Menskala turun selama periode menganggur—dan sejak akhir 2024, bisa auto-pause sampai ke 0 ACU ketika tidak ada koneksi (resume memakan ~15 detik; auto-pause tidak bekerja dengan RDS Proxy atau proxy penahan-koneksi lainnya)
- Biaya: $0,12 per ACU-jam (ditambah penyimpanan dan I/O)

Untuk beban kerja dengan lalu lintas yang bervariasi—lonjakan Jumat Nimbus vs ketenangan Senin pagi—Serverless v2 mengurangi biaya selama periode di luar puncak dan menangani puncak tanpa pra-penyediaan.

"Jadi selama lonjakan Jumat," kata Leo, "Aurora secara otomatis menskala naik. Minggu pagi ketika kita hampir tidak punya lalu lintas, ia menskala turun ke minimum."

"Dan kita hanya membayar untuk kapasitas yang kita gunakan," kata Tom.

"Benar."

Setelah sebulan di Aurora Serverless v2, Leo memunculkan grafik ACU (Aurora Capacity Unit) untuk minggu sebelumnya.

Grafik menunjukkan dua pola yang berbeda. Selama minggu, database berjalan pada 2-4 ACU—dengungan tenang dari kueri latar belakang, pemeriksaan kesehatan ECS, pekerjaan Glue ETL, dan pengujian pengembangan. Pada Jumat malam antara 18:00 dan 22:00, jumlah ACU mendaki:

```
Jumat 18:00  → 6 ACU
Jumat 19:00  → 14 ACU
Jumat 19:45  → 26 ACU  (puncak — pesanan pizza melonjak sebelum kickoff NFL)
Jumat 20:30  → 18 ACU
Jumat 21:00  → 12 ACU
Jumat 22:30  → 4 ACU
Sabtu 02:00 → 2 ACU  (minimum)
```

Penskalaannya hampir instan—Aurora Serverless v2 menskala dalam kenaikan 0,5 ACU, dan ia bisa menambah kapasitas dalam hitungan detik alih-alih menit yang dibutuhkan untuk menyediakan instance RDS baru.

"Berapa biaya puncak Jumat itu?" tanya Tom.

Pada $0,12 per ACU-jam: puncak Jumat adalah 4 jam dengan rata-rata 18 ACU → $8,64 untuk periode puncak. Sisa minggu pada rata-rata 3 ACU × 164 jam × $0,12 = $59,04. Total untuk minggu: $67,68.

Instance yang disediakan setara untuk menangani puncak Jumat (db.r6g.xlarge, 4 vCPU, 32 GB) akan berbiaya $0,937/jam × 168 jam = **$157,42 untuk minggu**—terlepas dari apakah puncak Jumat pernah terwujud atau tidak.

"Serverless v2 adalah $67 untuk minggu. Instance yang disediakan berukuran puncak adalah $157," kata Tom. "Itu pengurangan 57%."

"Pada database yang secara sah menggunakan 26 ACU selama empat jam pada Jumat dan 2 ACU untuk sisa minggu," kata Leo. "Jika database Anda berjalan pada beban tinggi konsisten sepanjang minggu, instance yang disediakan lebih murah. Penghematan berasal dari variabilitas."

Tom mengangguk perlahan. Ia menambahkan ini ke sebuah pola dalam catatannya: setiap kisah penghematan kuartal ini memiliki bentuk yang sama. Anda membayar untuk apa yang Anda gunakan, bukan untuk apa yang mungkin Anda butuhkan. Lifecycle policy S3 hanya membayar untuk storage class yang dijamin setiap objek. Lambda hanya membayar untuk waktu invokasi. Fargate hanya membayar untuk CPU dan memori task. Aurora Serverless v2 hanya membayar untuk ACU yang benar-benar dikonsumsi database.

Tom memiliki ekspresi seseorang yang telah menemukan persis apa yang mereka cari.

**Memulihkan Diri dari Migrasi yang Buruk: Clone, PITR, dan Tombol Undo**

Dua minggu setelah pindah ke Aurora, Sam menjalankan skrip migrasi database di produksi. Skrip itu seharusnya menghapus kolom `legacy_menu_format` dari tabel `menu_items`. Ia menjalankannya tanpa klausa WHERE yang ia kira telah ia sertakan.

Hasilnya bukan menghapus kolom. Itu adalah pernyataan DELETE yang membersihkan 40.000 baris dari tabel `menu_items`—kira-kira 200 restoran senilai data menu, hilang.

Peringatan menyala dalam 30 detik. Kegagalan pesanan melonjak. Layanan menu mulai mengembalikan hasil kosong untuk 200 restoran.

"Itu seharusnya punya klausa WHERE," kata Sam, menatap konsol.

Jalur pemulihan tradisional: pulihkan dari snapshot backup otomatis terbaru. Backup otomatis berjalan sekali setiap 24 jam, dan restore-and-swap penuh akan memakan 20-40 menit—selama itu *semua* restoran akan gelap, bukan hanya 200 yang terdampak—dan setiap pesanan yang ditempatkan sejak backup akan hilang.

Leo tidak melakukan itu. Seperti RDS standar, Aurora menyimpan backup berkelanjutan untuk **point-in-time recovery (PITR)**—Anda bisa memulihkan klaster ke detik mana pun dalam jendela retensi backup, bukan hanya ke snapshot malam terakhir. Dan yang kritis, restore membuat klaster *baru*; produksi tetap aktif sementara Anda memulihkan.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Timestamp-nya: 15:42:00Z—empat menit sebelum Sam menjalankan skrip migrasi. Sementara klaster pemulihan menyala, sisa produksi terus melayani restoran yang tidak terdampak. Begitu ia tersedia, Leo men-dump baris `menu_items` untuk 200 restoran terdampak dari klaster pemulihan dan memasukkannya kembali ke produksi. Total waktu dari peringatan hingga menu pulih sepenuhnya: sedikit di bawah 40 menit—dan karena ia memperbaiki baris secara bedah alih-alih menukar seluruh database, tidak ada pesanan yang ditempatkan setelah 15:42 yang hilang. Klaster pemulihan dihapus setelahnya; ia telah memenuhi tujuannya.

"Apa yang kita kehilangan?" tanya Maya.

Enam pesanan yang ditempatkan terhadap menu yang sesaat kosong telah gagal di checkout—semuanya ada di antrian SQS dan bisa diputar ulang. Tidak ada data pelanggan yang hilang permanen.

"Dan di sinilah **kloning database cepat** masuk," kata Leo, mengumpulkan tim setelahnya. Aurora bisa membuat **clone** dari sebuah klaster dalam hitungan menit, terlepas dari ukuran database, menggunakan copy-on-write: clone berbagi lapisan penyimpanan aslinya dan hanya halaman baru atau yang diubah yang mengonsumsi ruang tambahan. Sebuah clone dari database produksi saat ini murah, cepat, dan sepenuhnya terisolasi—tulisan ke clone tidak pernah menyentuh produksi.

"Yang berarti," kata Priya, menatap Sam, "skrip migrasi diuji terhadap clone data produksi sebelum ia pernah berjalan di produksi. Itu aturan baru."

Sam mengangguk. Ia sudah menulisnya di sticky note.

Satu alat lagi termasuk dalam gambaran ini. Aurora MySQL—bukan Aurora PostgreSQL—memiliki **Aurora Backtrack**: fitur yang memutar mundur klaster *di tempat* ke titik waktu tertentu, tanpa memulihkan ke klaster baru sama sekali. Jika klaster Nimbus adalah Aurora MySQL, Leo bisa mem-backtrack-nya ke 15:42 dalam di bawah tiga menit—meskipun memutar mundur seluruh klaster juga akan menggulung balik segelintir pesanan sah yang ditulis setelah penghapusan, yang dilestarikan pendekatan PITR bedah.

"Dan bagaimana jika seseorang mencoba menerobos masuk menggunakan Backtrack—atau point-in-time restore?" tanya Priya. "Bisakah penyerang memutar mundur log audit atau data kepatuhan?"

Backtrack membutuhkan izin API `rds:BacktrackDBCluster`, dan restore membutuhkan `rds:RestoreDBClusterToPointInTime`—tindakan IAM terpisah dari operasi database normal. Peran aplikasi standar tidak memiliki izin ini. Hanya tim operasi, dengan kebijakan IAM eksplisit yang mengizinkan mereka, yang bisa menggunakannya. Ia menambahkan ini ke daftar periksa tinjauan izin IAM.

Peringatan penting: Aurora Backtrack hanya tersedia untuk klaster yang kompatibel dengan Aurora MySQL, bukan PostgreSQL. Jendela Backtrack dikonfigurasi pada pembuatan klaster (1 jam hingga 72 jam, menagih per jam jendela backtrack). Dan Backtrack memengaruhi seluruh klaster—Anda tidak bisa mem-Backtrack satu tabel atau satu set baris. Untuk pemulihan tingkat-baris secara bedah—di kedua mesin—pendekatan PITR-ke-klaster-sementara yang digunakan Leo adalah alatnya.

**Aurora Global Database: Bacaan Multi-Region**

**Aurora Global Database** memperluas Aurora di beberapa region AWS:

- **Satu region primary** menangani semua tulisan
- **Hingga lima region sekunder** melayani bacaan dengan lag replikasi biasanya <1 detik
- Region sekunder bisa dipromosikan menjadi primary dalam di bawah 1 menit (untuk skenario DR)

Untuk ekspansi global Nimbus, Aurora Global Database akan membiarkan mitra restoran di London mengkueri menu lokal mereka dari read replica UE, sementara semua pesanan (tulisan) tetap melalui primary AS.

**RDS vs Aurora: Kapan Memilih Masing-Masing**

| Faktor            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Biaya              | Lebih rendah untuk beban kerja kecil     | Dasar lebih tinggi, tetapi menskala lebih baik                             |
| Kompatibilitas     | Penuh                          | Kompatibel MySQL/PostgreSQL (dengan perbedaan kecil)       |
| Maks replica      | 15 (masing-masing salinan data penuh)    | 15 (volume penyimpanan bersama)                                 |
| Lag replica       | Bisa detik                | Biasanya <100ms                                             |
| Penyimpanan           | Penyediaan tetap            | Auto-skala ke 128 TiB (256 TiB dalam versi terbaru)        |
| Waktu failover     | 60-120 detik                | <30 detik                                                |
| Opsi serverless | Terbatas                       | Aurora Serverless v2                                       |
| Terbaik untuk          | Beban kerja stabil, dapat diprediksi | Lalu lintas bervariasi, volume baca tinggi, butuh failover cepat |

**Melampaui Relasional: Keluarga yang Dibangun untuk Tujuan Khusus**

Bab 9 memperkenalkan DocumentDB (dokumen kompatibel-MongoDB), Neptune (relasi graf), dan Keyspaces (wide-column kompatibel-Cassandra), dan bab 10 memperkenalkan MemoryDB (database primary tahan lama kompatibel-Redis). Dua nama lagi melengkapi keluarganya—Anda tidak perlu kedalaman tentang mereka, hanya kemampuan untuk mengenali bentuk data mana yang menunjuk ke mesin mana, karena mereka muncul terus-menerus sebagai opsi jawaban:

- **Amazon Timestream**: data **time-series**—pembacaan sensor, metrik, telemetri. Sinyal ujian: "pengukuran IoT dari waktu ke waktu." (Di dunia nyata penawaran saat ini adalah Timestream for InfluxDB; varian "LiveAnalytics" asli ditutup untuk pelanggan baru pada 2025.)
- **Amazon QLDB**: Anda mungkin masih menemukannya dalam soal lama sebagai "ledger yang imutabel dan dapat diverifikasi secara kriptografis." AWS menghentikan QLDB pada 2025 (merekomendasikan Aurora PostgreSQL sebagai gantinya)—perlakukan sebagai distraktor legacy, bukan blok bangunan.

Aturan yang layak ditulis di papan tulis: **baris relasional → RDS/Aurora; key-value pada skala besar → DynamoDB; dokumen → DocumentDB; relasi → Neptune; waktu → Timestream; Cassandra → Keyspaces; Redis tahan lama → MemoryDB.** Cocokkan bentuknya, dan pertanyaan menjawab dirinya sendiri.

## Kekuatan dan Keterbatasan

**Kekuatan Aurora**:

- Failover jauh lebih cepat daripada RDS standar
- Hingga 15 read replica dengan lag minimal
- Penyimpanan auto-skala
- Serverless v2 untuk beban kerja yang bervariasi
- Global Database untuk deployment multi-region

**Keterbatasan Aurora**:

- Biaya lebih tinggi untuk beban kerja kecil dan stabil
- Harga I/O bisa signifikan untuk beban kerja berat-tulis (gunakan I/O-Optimized untuk ini)
- Perbedaan kompatibilitas MySQL/PostgreSQL kecil bisa membutuhkan perubahan kode
- Resume Serverless v2 dari auto-pause (~15 detik) dan scale-up cepat bisa menyebabkan lonjakan latensi

## Ringkasan

Pekerjaan lifecycle S3 di bab 23 mengurangi biaya dengan memindahkan data ke storage tier yang tepat. Aurora melakukan yang setara untuk komputasi: alih-alih menyediakan untuk beban puncak dan membayarnya sepanjang waktu, Serverless v2 menskala untuk mencocokkan permintaan.

- **Read replica** mendistribusikan lalu lintas baca dari primary. Replikasi asinkron—sedikit lag dapat diterima untuk sebagian besar bacaan. Rutekan bacaan yang membutuhkan konsistensi tulis (bacaan segera-pasca-tulis, bacaan antarmuka admin) ke primary, bukan replica.
- **Aurora** membayangkan ulang lapisan penyimpanan: terdistribusi, berbagi lintas replica, auto-skala.
- Aurora menawarkan: 15 read replica, lag replica <100ms, failover <30d, penyimpanan auto-skala hingga 128 TiB (256 TiB dalam versi terbaru).
- **Performance Insights**: identifikasi kueri SQL spesifik yang menyebabkan beban database sebelum memutuskan cara menskala. Indeks yang hilang bisa menghilangkan kebutuhan akan instance yang lebih besar.
- **Metrik database CloudWatch**: DatabaseConnections (mendekati saturasi berarti connection pooling aplikasi rusak), CPUUtilization (CPU tinggi berkelanjutan berarti kueri mahal), ReadLatency (degradasi dari waktu ke waktu seringkali adalah tabel yang tumbuh dengan indeks yang hilang).
- **Aurora Serverless v2**: auto-skala komputasi dalam kenaikan 0,5 ACU. Ditagih per ACU-jam. Jauh lebih murah daripada instance yang disediakan untuk beban kerja dengan variabilitas tinggi antara puncak dan di luar puncak.
- **Point-in-time recovery (PITR)**: pulihkan klaster Aurora ke detik mana pun dalam jendela retensi backup—ke klaster *baru*, sehingga produksi tetap aktif sementara Anda menyalin balik baris yang hilang secara bedah.
- **Kloning database cepat**: clone copy-on-write dari klaster dalam hitungan menit terlepas dari ukuran. Murah, terisolasi—gunakan untuk menguji migrasi terhadap data produksi sebelum mereka berjalan di produksi.
- **Aurora Backtrack** (hanya kompatibel-MySQL—bukan PostgreSQL): putar mundur klaster di tempat ke titik waktu tanpa memulihkan dari backup. Tersedia untuk jendela hingga 72 jam. Membutuhkan izin IAM `rds:BacktrackDBCluster`—batasi ke tim operasi.
- **Aurora Global Database**: primary di satu region, read replica di hingga lima region.
- **Promosi read replica**: read replica lintas-region bisa dipromosikan menjadi primary mandiri untuk DR regional. Seimbangkan manfaat DR terhadap biaya menjalankan instance penuh kedua.
- Pilih RDS untuk beban kerja yang lebih kecil, stabil, dapat diprediksi. Pilih Aurora ketika Anda membutuhkan skala, failover cepat, atau penanganan lalu lintas yang bervariasi.

## Tips Ujian

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.3)*

- **Aurora replica vs RDS read replica**: Aurora replica berbagi penyimpanan (lag mendekati-nol, failover <30d). RDS read replica mereplikasi data (lag mungkin, menit untuk failover).
- **Aurora Serverless v2**: "auto-skala kapasitas database," "lalu lintas database tak terduga atau melonjak" → Aurora Serverless v2. Perhatian: secara historis hanya Serverless **v1** yang menskala ke nol; minimum v2 adalah 0,5 ACU sampai akhir 2024, ketika v2 mendapat auto-pause ke 0 ACU. Soal ujian lama mungkin masih mengasumsikan v2 tidak bisa menskala ke nol.
- **Aurora Global Database**: "database multi-region," "baca dari UE dengan latensi rendah dari primary AS," "RTO < 1 menit untuk failover regional" → Aurora Global Database.
- **Pengaturan waktu failover**: Aurora < 30 detik. RDS Multi-AZ 60-120 detik. Ketahui keduanya.
- **Database yang dibangun untuk tujuan khusus berdasarkan bentuk data**: "social graph / rekomendasi / cincin penipuan" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "time series / telemetri IoT" → Timestream. "database *primary* kompatibel-Redis (tahan lama)" → MemoryDB (vs ElastiCache = cache). "ledger kriptografis imutabel" → QLDB dalam soal lama (dihentikan pada 2025).
- **Aurora I/O-Optimized**: Biaya penyimpanan dan instance lebih tinggi, tanpa biaya per-I/O. Gunakan ketika biaya I/O mendominasi (berat-tulis). Aurora Standar: biaya penyimpanan lebih rendah, bayar per I/O. Gunakan untuk berat-baca.
- **Aurora Backtrack**: Putar mundur database di tempat ke titik waktu tertentu tanpa memulihkan dari snapshot backup. Tersedia hanya untuk Aurora kompatibel-MySQL—untuk Aurora PostgreSQL, jawabannya adalah point-in-time restore (ke klaster baru) atau clone cepat. Sinyal ujian: "tidak sengaja menghapus data, perlu pulih cepat tanpa memulihkan backup penuh" + MySQL → Backtrack.
- **Kloning database cepat Aurora**: clone copy-on-write dalam hitungan menit, terlepas dari ukuran database. Sinyal ujian: "uji terhadap salinan data produksi dengan cepat dan murah" → clone, bukan snapshot-restore.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara Aurora dan read replica RDS standar. Mengapa lag replikasi Aurora biasanya lebih rendah?

*(Petunjuk: Perbedaan kuncinya adalah penyimpanan bersama vs replikasi data. Pikirkan apa yang harus dilakukan setiap replica ketika sebuah tulisan tiba.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Database MySQL sebuah platform media sosial mengalami latensi baca tinggi akibat lalu lintas yang meningkat. Aplikasi berat-baca (95% baca, 5% tulis). Tim membutuhkan latensi baca yang konsisten, bahkan selama lonjakan lalu lintas. Mereka membutuhkan failover otomatis dengan waktu henti minimal (target RTO < 30 detik). Volume data tumbuh secara tak terduga.

Solusi database mana yang PALING memenuhi persyaratan ini?

A) RDS MySQL Multi-AZ dengan lima read replica  
B) Aurora MySQL dengan Aurora Replica dan Aurora Serverless v2  
C) RDS MySQL dengan tipe instance yang lebih besar (penskalaan vertikal)  
D) DynamoDB dengan DynamoDB DAX untuk caching baca

**Petunjuk 1**: "RTO < 30 detik"—layanan mana yang mencapai ini? Periksa pengaturan waktu failover untuk setiap opsi.

**Petunjuk 2**: "Latensi baca konsisten selama lonjakan"—replica layanan mana yang memiliki lag mendekati-nol vs potensi detik lag?

**Petunjuk 3**: "Volume data tumbuh tak terduga"—layanan mana yang auto-skala penyimpanan?

**Jawaban**: B

**Penjelasan**: Aurora MySQL dengan Aurora Replica menyediakan lag replikasi mendekati-nol (milidetik, bukan detik) untuk performa baca yang konsisten di bawah beban. Aurora Serverless v2 auto-skala komputasi selama lonjakan lalu lintas tanpa over-provisioning. Penyimpanan Aurora auto-skala seiring data tumbuh. Failover Aurora (promosi replica) selesai dalam di bawah 30 detik—memenuhi persyaratan RTO.

**Mengapa bukan A?** Failover RDS Multi-AZ memakan 60-120 detik—tidak memenuhi RTO < 30 detik. Lag read replica RDS standar bisa mencapai detik di bawah beban—latensi baca "konsisten" lebih sulit dijamin.

**Mengapa bukan C?** Penskalaan vertikal (instance lebih besar) meningkatkan kapasitas tetapi tidak mendistribusikan beban baca. Database tetap menjadi titik kegagalan tunggal untuk bacaan.

**Mengapa bukan D?** DynamoDB adalah NoSQL—bermigrasi dari MySQL ke DynamoDB membutuhkan rearsitektur model data dan kueri aplikasi, yang jauh di luar cakupan tugas peningkatan performa ini.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang merancang ekspansi global. Mereka ingin mitra restoran di Pantai Timur, di Jerman, dan di Australia melihat data pesanan mereka sendiri dengan cepat, tanpa latensi lintas-region. Namun, semua tulisan harus melalui satu primary us-west-2 untuk mempertahankan konsistensi.

Rancang arsitektur database menggunakan Aurora. Bagaimana Anda akan menyusun Global Database—misalnya, klaster sekunder di us-east-1, eu-central-1, dan ap-southeast-2? Apa yang terjadi jika primary us-west-2 mati? Bagaimana Anda akan menangani proses promosi?

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih desain database multi-region.)*

## Adegan Pasca Kredit

Leo bermigrasi ke Aurora dengan Serverless v2.

Lonjakan Jumat datang dan pergi. CPU tidak pernah melebihi 60%. Latensi kueri tetap konsisten. Aurora telah menskala naik untuk menangani beban secara otomatis, lalu menskala kembali turun setelah jam sibuk.

"Berapa biaya ini dibandingkan Jumat lalu?" tanya Tom Senin pagi.

Leo memunculkan billing explorer. "Jumat rata-rata sekitar $2,16/jam selama puncak malam. Sabtu pagi adalah $0,24/jam."

Tom tidak berkata apa-apa.

"Setup lama adalah $0,47/jam tetap terlepas dari beban," tambah Leo.

"Jadi kita membayar lebih selama lonjakan daripada sebelumnya," kata Tom.

"Ya. Tetapi secara signifikan lebih sedikit selama di luar puncak. Biaya bersih selama minggu lebih rendah."

Tom menghitung. Lalu mengangguk.

"Ada pelajaran di sini," katanya. "Pertanyaan yang tepat bukan 'apakah ini lebih murah?' Tetapi 'apakah ini lebih murah untuk pola penggunaan aktual kita?'"

"Itu," kata Priya dari seberang ruangan, "adalah insting insinyur senior."

Tom terlihat sedikit khawatir digambarkan seperti itu.

Pada bab berikutnya: ketika jaringan Anda adalah penyumbatnya, dan mengapa jalan tol privat mungkin sepadan dengan biaya tolnya.
