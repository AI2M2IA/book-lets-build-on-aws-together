# Bab 24: Database yang Tumbuh Bersamamu

Tinjauan biaya Tom menemukan sesuatu yang tidak terduga di tier database.

Nimbus menjalankan RDS PostgreSQL: Multi-AZ, instance db.r6g.large. $340/bulan.

"Itu tampak tinggi," kata Tom. "Tapi aku tidak yakin apa yang harus dibandingkan."

Leo menarik metrik performa. CPU database melonjak ke 85% selama makan malam Jumat. Kueri baca antre. Latensi kueri P95 telah berlipat ganda dalam enam bulan.

"Database adalah bottleneck," katanya. "Lalu lintas telah tumbuh. Database belum menskalakan bersamanya."

"Bisakah kita hanya membuat instancenya lebih besar?" tanya Maya.

"Bisa," kata Leo. "Itu adalah penskalaan vertikal. Kita berpindah dari r6g.large ke r6g.xlarge. CPU dan memori lebih banyak. Ini akan menghabiskan lebih banyak biaya dan memberi kita waktu."

"Tapi itu tidak memperbaiki masalah yang mendasar," kata Priya. "Akhirnya kita akan mencapai instance terbesar dan membutuhkan pendekatan yang berbeda."

"Ada dua pendekatan," kata Leo. "Read replica, atau Aurora."

"Apa bedanya?"

Pertanyaan yang bagus. Sisa bab ini adalah jawabannya.

Bayangkan perpustakaan yang sibuk dengan satu pustakawan yang mengembalikan buku sekaligus menjawab pertanyaan pengunjung. Ketika perpustakaan menjadi populer, antrian terbentuk. Solusinya: pekerjakan lebih banyak pustakawan — tetapi hanya untuk menjawab pertanyaan. Pengembalian buku tetap melalui meja aslinya. Itulah read replica: kapasitas ekstra yang menangani pembacaan, sementara semua penulisan masih melalui satu sumber otoritatif. Aurora melangkah lebih jauh, mendesain ulang sistem rak itu sendiri sehingga setiap pustakawan berbagi rak yang sama dan selalu melihat buku yang sama, tanpa penundaan.

**Read Replica: Mendistribusikan Lalu Lintas Baca**

Sebagian besar aplikasi web membaca data jauh lebih sering daripada menulisnya. Pelanggan yang menelusuri menu membuat puluhan kueri SELECT. Menempatkan pesanan membuat beberapa kueri INSERT/UPDATE. Rasionya biasanya 10:1 atau lebih tinggi.

Sebuah **read replica** adalah instance RDS tambahan yang menerima salinan semua penulisan dari primary dan membuat penulisan tersebut tersedia untuk kueri SELECT.

Cara kerjanya:

1. Penulisan aplikasi (INSERT, UPDATE, DELETE) masuk ke database primary
2. Primary mereplikasi perubahan tersebut secara asinkron ke read replica
3. Pembacaan aplikasi (SELECT) didistribusikan di seluruh read replica
4. Read replica berbagi beban — masing-masing menangani sebagian dari total lalu lintas baca

Hasilnya: database primary hanya menangani penulisan (dan opsional beberapa pembacaan). Read replica menangani beban baca. Untuk rasio baca/tulis 10:1, menambahkan satu read replica kira-kira mengurangi separuh total beban primary.

**Batasan penting**: Replikasi bersifat **asinkron**. Ada lag replikasi — biasanya milidetik, tetapi bisa detik di bawah beban. Pembacaan dari replika mungkin melihat data yang sedikit di belakang primary. Untuk sebagian besar pembacaan (menelusuri menu, melihat riwayat pesanan), ini dapat diterima. Untuk "apakah pesananku baru saja diproses?" — baca dari primary.

**Read Replica: Detail**

- Kamu bisa memiliki hingga 5 read replica per instance RDS primary
- Read replica bisa berada di region yang sama atau region berbeda (replika cross-region)
- Read replica bisa memiliki read replica sendiri (berantai)
- Read replica adalah endpoint terpisah — aplikasimu harus mengarahkan pembacaan ke endpoint replika
- Read replica dapat dipromosikan ke database mandiri (berguna untuk DR)

Untuk Nimbus, Leo menambahkan satu read replica. Dia memperbarui aplikasi untuk:

- Operasi tulis → endpoint primary
- Penelusuran menu, riwayat pesanan → endpoint replika

CPU pada primary turun dari 85% menjadi 41% saat puncak.

Tom melihat biayanya: read replica dengan tipe instance yang sama berharga sama dengan primary. Dari $340/bulan menjadi $680/bulan.

"Kita menggandakan biaya untuk kira-kira mengurangi separuh beban," kata Tom.

"Ya. Tapi alternatifnya adalah berpindah ke tipe instance yang lebih besar, yang juga akan menghabiskan lebih banyak biaya dan tidak mendistribusikan beban baca."

Tom menghitung. Dia mengangguk, dengan enggan.

"Apa itu Aurora?" tanyanya.

**Amazon Aurora: Memikirkan Ulang Mesin Database**

Aurora adalah mesin database relasional proprietary AWS, kompatibel dengan MySQL dan PostgreSQL. Dirancang dari awal untuk beban kerja cloud, mendesain ulang cara kerja lapisan penyimpanan database relasional.

Dalam pengaturan RDS tradisional (MySQL, PostgreSQL), penyimpanan dan komputasi sangat terikat. Mesin database mengelola file data. Replikasi menyalin data dari primary ke replika. Replika harus mengulang setiap operasi tulis.

Aurora memisahkan penyimpanan dari komputasi. Ia menggunakan lapisan penyimpanan terdistribusi yang toleran terhadap kesalahan yang mereplikasi data secara otomatis di tiga Availability Zone dalam enam salinan. Lapisan komputasi (instance database) berada di atas lapisan penyimpanan ini.

**Yang berubah**:

**Read replica**: Replika Aurora tidak perlu mereplikasi data — mereka sudah berbagi lapisan penyimpanan yang sama. Ini berarti:

- Hingga 15 read replica (vs 5 untuk RDS reguler)
- Lag replikasi biasanya di bawah 100 milidetik (vs detik untuk RDS di bawah beban)
- Replika dapat dipromosikan ke primary dalam waktu kurang dari 30 detik (vs menit)

**Failover**: Karena replika berbagi penyimpanan, failover jauh lebih cepat — promosi tidak melibatkan transfer data, hanya mengalihkan penulisan.

**Penyimpanan**: Aurora secara otomatis menskalakan penyimpanan dalam kenaikan 10GB, hingga 128TB. Kamu tidak pernah menyediakan penyimpanan di muka.

**Performa**: Aurora mengklaim throughput 5x dari MySQL standar dan 3x PostgreSQL standar untuk tipe instance yang setara.

**Harga Aurora: Pertanyaan Tom**

"Berapa biayanya?" tanya Tom.

Harga Aurora berbeda dari RDS:

**Harga instance**: Mirip dengan harga instance RDS berdasarkan tipe.

**Harga penyimpanan**: $0,10 per GB per bulan (kamu membayar untuk apa yang disimpan, diskalakan secara otomatis).

**Harga I/O**: Aurora menagih per permintaan I/O (baca/tulis ke penyimpanan). Ini bisa signifikan untuk beban kerja yang banyak menulis.

"Tunggu," kata Tom. "Kita membayar untuk I/O secara terpisah?"

"Aurora Serverless v2 dan Aurora I/O-Optimized mengubah model harga ini," kata Leo. "Aurora I/O-Optimized tidak menagih biaya I/O tetapi harga penyimpanan dan instance lebih tinggi. Lebih baik untuk beban kerja yang banyak I/O."

Tom melihat trade-off. Untuk Nimbus, yang merupakan read-heavy (banyak kueri menu, sedikit penulisan), Aurora I/O-Optimized mungkin menghabiskan lebih banyak biaya. Harga Aurora standar mungkin sesuai.

Ini adalah keputusan biaya nyata yang dibuat insinyur senior: kamu perlu mengetahui pola I/O beban kerjamu untuk memilih dengan benar.

**Aurora Serverless: Penskalaan Tanpa Memikirkan Instance**

**Aurora Serverless v2** adalah konfigurasi yang secara otomatis menskalakan kapasitas komputasi berdasarkan beban database aktual. Alih-alih memilih ukuran instance tetap (db.r6g.large), kamu menetapkan kapasitas minimum dan maksimum dalam Aurora Capacity Units (ACU).

Aurora Serverless v2:

- Menskalakan naik dalam hitungan detik saat beban meningkat
- Menskalakan turun mendekati nol selama periode menganggur
- Biaya: $0,12 per ACU-jam (plus penyimpanan dan I/O)

Untuk beban kerja dengan lalu lintas variabel — lonjakan Jumat Nimbus vs ketenangan Senin pagi — Serverless v2 mengurangi biaya selama periode di luar jam sibuk dan menangani puncak tanpa pra-provisioning.

"Jadi selama lonjakan Jumat," kata Leo, "Aurora secara otomatis menskalakan naik. Minggu pagi saat kita hampir tidak punya lalu lintas, ia menskalakan kembali ke minimum."

"Dan kita hanya membayar untuk kapasitas yang kita gunakan," kata Tom.

"Benar."

Tom memiliki ekspresi seseorang yang telah menemukan persis apa yang mereka cari.

**Aurora Global Database: Pembacaan Multi-Region**

**Aurora Global Database** memperluas Aurora ke beberapa region AWS:

- **Satu region primary** menangani semua penulisan
- **Hingga lima region sekunder** melayani pembacaan dengan lag replikasi biasanya <1 detik
- Region sekunder dapat dipromosikan ke primary dalam waktu kurang dari 1 menit (untuk skenario DR)

Untuk ekspansi global Nimbus, Aurora Global Database akan memungkinkan mitra restoran di London mengkueri menu lokal mereka dari replika baca EU, sementara semua pesanan (penulisan) masih melewati primary AS.

**RDS vs Aurora: Kapan Memilih Masing-Masing**

| Faktor            | RDS (PostgreSQL/MySQL)        | Aurora                                                      |
|-------------------|-------------------------------|-------------------------------------------------------------|
| Biaya             | Lebih rendah untuk beban kerja kecil | Lebih tinggi di awal, tetapi menskalakan lebih baik    |
| Kompatibilitas    | Penuh                         | Kompatibel dengan MySQL/PostgreSQL (dengan perbedaan kecil) |
| Maks replika      | 5                             | 15                                                          |
| Lag replika       | Bisa beberapa detik           | Biasanya <100ms                                             |
| Penyimpanan       | Provisioning tetap            | Auto-skalakan hingga 128TB                                  |
| Waktu failover    | 60-120 detik                  | <30 detik                                                   |
| Opsi serverless   | Terbatas                      | Aurora Serverless v2                                        |
| Terbaik untuk     | Beban kerja stabil, dapat diprediksi | Lalu lintas variabel, volume baca tinggi, butuh failover cepat |

## Kekuatan dan Keterbatasan

**Kekuatan Aurora**:

- Failover jauh lebih cepat dibanding RDS standar
- Hingga 15 read replica dengan lag minimal
- Penyimpanan auto-skalakan
- Serverless v2 untuk beban kerja variabel
- Global Database untuk deployment multi-region

**Keterbatasan Aurora**:

- Biaya lebih tinggi untuk beban kerja kecil yang stabil
- Harga I/O bisa signifikan untuk beban kerja yang banyak menulis (gunakan I/O-Optimized untuk ini)
- Perbedaan kompatibilitas MySQL/PostgreSQL kecil dapat membutuhkan perubahan kode
- Cold start Serverless v2 (dari mendekati nol) dapat menyebabkan lonjakan latensi

## Ringkasan

- **Read replica** mendistribusikan lalu lintas baca dari primary. Replikasi asinkron — lag kecil dapat diterima untuk sebagian besar pembacaan.
- **Aurora** mendesain ulang lapisan penyimpanan: terdistribusi, dibagikan di seluruh replika, auto-skalakan.
- Aurora menawarkan: 15 read replica, lag replika <100ms, failover <30 detik, penyimpanan auto-skalakan hingga 128TB.
- **Aurora Serverless v2**: auto-skalakan kapasitas komputasi berdasarkan beban. Bagus untuk lalu lintas variabel.
- **Aurora Global Database**: primary di satu region, read replica di hingga lima region.
- Pilih RDS untuk beban kerja yang lebih kecil, stabil, dan dapat diprediksi. Pilih Aurora ketika kamu membutuhkan skala, failover cepat, atau penanganan lalu lintas variabel.

## Tips Ujian

*Domain SAA-C03: Merancang Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.3)*

- **Replika Aurora vs read replica RDS**: Replika Aurora berbagi penyimpanan (lag mendekati nol, failover <30 detik). Read replica RDS mereplikasi data (lag memungkinkan, menit untuk failover).
- **Aurora Serverless v2**: "auto-skalakan kapasitas database," "lalu lintas database yang tidak terduga atau tidak menentu," "skalakan ke nol" → Aurora Serverless v2.
- **Aurora Global Database**: "database multi-region," "baca dari EU dengan latensi rendah dari primary AS," "RTO < 1 menit untuk failover regional" → Aurora Global Database.
- **Waktu failover**: Aurora < 30 detik. RDS Multi-AZ 60-120 detik. Ketahui keduanya.
- **Aurora I/O-Optimized**: Biaya penyimpanan dan instance lebih tinggi, tidak ada biaya per I/O. Gunakan ketika biaya I/O mendominasi (banyak menulis). Aurora standar: biaya penyimpanan lebih rendah, bayar per I/O. Gunakan untuk yang banyak membaca.
- **Aurora Backtrack**: Putar balik database ke titik waktu tertentu tanpa memulihkan dari snapshot backup. Tersedia untuk Aurora yang kompatibel dengan MySQL saja. Sinyal ujian: "data terhapus secara tidak sengaja, perlu pemulihan cepat tanpa memulihkan backup penuh."

## Latihan

**Latihan 1 — Mengingat Kembali**

Jelaskan perbedaan antara Aurora dan read replica RDS standar. Mengapa lag replikasi Aurora biasanya lebih rendah?

*(Petunjuk: Perbedaan kuncinya adalah penyimpanan bersama vs replikasi data. Pikirkan apa yang harus dilakukan setiap replika ketika sebuah penulisan tiba.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Database MySQL platform media sosial mengalami latensi baca yang tinggi karena lalu lintas yang meningkat. Aplikasi ini read-heavy (95% pembacaan, 5% penulisan). Tim membutuhkan latensi baca yang konsisten, bahkan selama lonjakan lalu lintas. Mereka membutuhkan failover otomatis dengan downtime minimal (target RTO < 30 detik). Volume data tumbuh secara tidak terduga.

Solusi database mana yang PALING memenuhi persyaratan ini?

A) RDS MySQL Multi-AZ dengan lima read replica  
B) Aurora MySQL dengan Aurora Replica dan Aurora Serverless v2  
C) RDS MySQL dengan tipe instance yang lebih besar (penskalaan vertikal)  
D) DynamoDB dengan DynamoDB DAX untuk caching baca

**Petunjuk 1**: "RTO < 30 detik" — layanan mana yang mencapai ini? Periksa waktu failover untuk setiap opsi.

**Petunjuk 2**: "Latensi baca yang konsisten selama lonjakan" — replika layanan mana yang memiliki lag mendekati nol vs lag potensial beberapa detik?

**Petunjuk 3**: "Volume data yang tumbuh secara tidak terduga" — layanan mana yang auto-skalakan penyimpanan?

**Jawaban**: B

**Penjelasan**: Aurora MySQL dengan Aurora Replica memberikan lag replikasi mendekati nol (milidetik, bukan detik) untuk performa baca yang konsisten di bawah beban. Aurora Serverless v2 auto-skalakan komputasi selama lonjakan lalu lintas tanpa over-provisioning. Penyimpanan Aurora auto-skalakan seiring pertumbuhan data. Failover Aurora (promosi replika) selesai dalam waktu kurang dari 30 detik — memenuhi persyaratan RTO.

**Mengapa bukan A?** Failover RDS Multi-AZ membutuhkan 60-120 detik — tidak memenuhi RTO < 30 detik. Lag read replica RDS standar bisa mencapai detik di bawah beban — latensi baca yang "konsisten" lebih sulit dijamin.

**Mengapa bukan C?** Penskalaan vertikal (instance lebih besar) meningkatkan kapasitas tetapi tidak mendistribusikan beban baca. Database tetap menjadi titik kegagalan tunggal untuk pembacaan.

**Mengapa bukan D?** DynamoDB adalah NoSQL — bermigrasi dari MySQL ke DynamoDB membutuhkan rearchitecting model data dan kueri aplikasi, yang jauh di luar cakupan tugas peningkatan performa ini.

*Domain SAA-C03: Merancang Arsitektur Berkinerja Tinggi — Tugas 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus merancang ekspansi global. Mereka ingin mitra restoran di Pantai Barat, di Jerman, dan di Australia melihat data pesanan mereka sendiri dengan cepat, tanpa latensi lintas region. Namun, semua penulisan harus melewati satu primary US-East untuk menjaga konsistensi.

Rancang arsitektur database menggunakan Aurora. Bagaimana kamu akan mengstrukturkan Global Database? Apa yang terjadi jika primary US-East turun? Bagaimana kamu akan menangani proses promosi?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih desain database multi-region.)*

## Adegan Pasca-Kredit

Leo bermigrasi ke Aurora dengan Serverless v2.

Lonjakan Jumat datang dan pergi. CPU tidak pernah melebihi 60%. Latensi kueri tetap konsisten. Aurora telah menskalakan naik untuk menangani beban secara otomatis, kemudian menskalakan kembali turun setelah rush.

"Berapa biayanya dibandingkan Jumat lalu?" tanya Tom pada Senin pagi.

Leo membuka billing explorer. "Jumat puncak di $0,89/jam. Sabtu pagi $0,11/jam."

Tom tidak berkata apa-apa.

"Pengaturan lama adalah $0,47/jam tetap terlepas dari beban," tambah Leo.

"Jadi kita membayar lebih selama lonjakan dibanding sebelumnya," kata Tom.

"Ya. Tapi jauh lebih sedikit selama di luar jam sibuk. Biaya bersih selama seminggu lebih rendah."

Tom menghitung. Kemudian mengangguk.

"Ada pelajaran di sini," katanya. "Pertanyaan yang tepat bukan 'apakah ini lebih murah?' Ini 'apakah ini lebih murah untuk pola penggunaan aktual kita?'"

"Itu," kata Priya dari seberang ruangan, "adalah insting insinyur senior."

Tom tampak sedikit terkejut untuk dideskripsikan seperti itu.

Di bab berikutnya: ketika jaringanmu adalah bottleneck, dan mengapa jalan tol pribadi mungkin sepadan dengan tolnya.
