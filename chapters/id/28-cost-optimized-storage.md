# Bab 28: Kejutan Tagihan Penyimpanan

Tom telah mengajukan Rencana Tabungan untuk EC2. Baris berikutnya pada tagihan adalah S3: $198/bulan (turun dari $847 setelah perubahan kebijakan siklus hidup dari Bab 23).

Kemudian dia melihat EBS: $440/bulan.

"Ini sepertinya mahal," katanya.

Leo menarik daftar volume EBS. Ada 47 volume EBS yang terpasang ke instance. Dan kemudian ada 23 volume lain yang tidak terpasang ke instance manapun.

"Volume 23 ini," kata Tom. "Apa itu?"

Leo mencarinya. Mereka semua terputus — tidak ada instance yang saat ini menggunakannya. Kebanyakan dibuat dari snapshot untuk tujuan debugging. Beberapa berasal dari instance yang telah dihentikan tetapi volumenya belum dihapus.

"Kami membayar $0,10 per GB per bulan untuk penyimpanan yang tidak dibaca siapa pun," kata Leo.

Tom melihat totalnya: 2,3 TB volume yang tidak terpasang.

"Seratus dua puluh dolar sebulan untuk penyimpanan yang tidak kami gunakan," kata Tom. "Sudah berapa lama ini terjadi?"

Leo memeriksa tanggal pembuatan. Volume tertua berasal dari 16 bulan lalu.

"Tiga ribu enam ratus delapan puluh dolar," kata Tom dengan tenang. "Kami telah menghabiskan tiga ribu enam ratus dolar untuk penyimpanan yang tidak diakses siapa pun."

Dia menghapus volume yang tidak terpasang. Bulan berikutnya, tagihan EBS turun menjadi $210.

**Audit Biaya Penyimpanan**

Penemuan EBS Tom adalah gejala dari pola yang lebih luas: biaya penyimpanan menumpuk secara diam-diam. Tidak seperti komputasi (Anda menyadari ketika 47 server sedang berjalan), penyimpanan diam-diam bertambah.

Bayangkan seperti sewa unit penyimpanan. Menyewa satu unit jelas terlihat pada pernyataan kartu kredit. Tetapi jika Anda menyewa unit kedua untuk sebuah proyek, lalu unit ketiga untuk beberapa perabotan lama, dan Anda tidak pernah kembali untuk memeriksa apa yang ada di dalamnya — biaya terus muncul setiap bulan, diam-diam, jauh setelah Anda lupa apa yang Anda simpan. Penyimpanan awan bekerja dengan cara yang sama: byte-byte itu ada di sana, faktur tiba, dan tidak ada yang mempertanyakannya sampai seseorang akhirnya membuka pintu dan menemukan bahwa itu penuh dengan hal-hal yang tidak lagi dibutuhkan.

Audit biaya penyimpanan yang menyeluruh melihat:

**S3**:

- Apakah kebijakan siklus hidup diterapkan untuk semua bucket?
- Apakah ada snapshot lama (RDS, EBS) yang berada di S3?
- Apakah Intelligent-Tiering sesuai untuk bucket mana pun dengan pola akses yang tidak pasti?
- Apakah objek yang di-versi menciptakan beberapa salinan yang tidak pernah diakses?

**EBS**:

- Apakah ada volume yang tidak terpasang (tidak ada instance yang berjalan yang menggunakannya)?
- Apakah volume gp3 dikonfigurasi dengan benar? (Volume gp3 default mungkin memiliki throughput/IOPS yang berlebihan yang tidak dibutuhkan)
- Apakah snapshot yang lebih tua dari yang diperlukan dipertahankan?

**RDS**:

- Apakah periode retensi cadangan otomatis diatur dengan tepat? (Lebih panjang = biaya penyimpanan yang lebih tinggi)
- Apakah snapshot manual dari instance lama masih berada di sana?
- Apakah replika baca dari migrasi database masih berjalan?

**EFS**:

- Apakah volume EFS berada di kelas penyimpanan yang tepat? (Standar vs Akses Jarang)

**Versioning S3: Biaya Tersembunyi**

Pada Bab 5, kami menyebutkan bahwa versioning S3 menyimpan setiap versi sebelumnya dari sebuah objek. Ini sangat bagus untuk keamanan. Ini sangat buruk untuk biaya jika Anda juga tidak memiliki aturan siklus hidup untuk versi tersebut.

Ketika versioning diaktifkan pada bucket, setiap kali Anda menimpa sebuah objek, versi lama dipertahankan. Seiring waktu:

- Hari 1: Gambar diunggah (v1)
- Hari 30: Gambar diperbarui (v1 sekarang menjadi "versi nonaktif", v2 adalah versi aktif)
- Hari 60: Gambar diperbarui lagi (v1 dan v2 adalah versi nonaktif, v3 adalah versi aktif)
- Hari 365: v1, v2... v12 semuanya disimpan. Anda membayar untuk 12 salinan gambar.

Solusinya: aturan siklus hidup untuk versi nonaktif.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom menerapkan aturan-aturan ini ke semua bucket yang telah di-versi. Pada bulan berikutnya, penyimpanan S3 berkurang sebesar 18%.

**EBS: Optimalisasi Ukuran dan Peningkatan gp3**

Harga volume EBS memiliki dua komponen:

1.  Penyimpanan (per GB per bulan)
2.  IOPS dan throughput yang telah di-provision (jika Anda menggunakan io1/io2 atau membayar untuk kinerja gp3 tambahan)

**Peluang gp3**: Pada Bab 6, kami mencatat bahwa gp3 adalah default saat ini dan lebih murah daripada gp2. Jika Nimbus memiliki volume yang dibuat sebelum gp3 tersedia (peluncurannya pada Desember 2020), volume tersebut mungkin masih berupa gp2.

Tom menemukan 12 volume gp2 yang totalnya 1.200 GB. Migrasi ke gp3 menghemat 20% pada volume tersebut secara instan, tanpa penurunan kinerja.

**IOPS dan Throughput**: Volume gp3 dilengkapi dengan 3.000 IOPS dan throughput 125 MB/s secara default, tanpa biaya tambahan. Anda dapat menyediakan lebih banyak jika beban kerja Anda membutuhkannya. Tinjau apakah kinerja yang telah di-provision benar-benar dimanfaatkan.

Tom menemukan dua volume gp3 dengan 10.000 IOPS yang telah di-provision. Dia memeriksa metrik CloudWatch: IOPS rata-rata aktual adalah 1.200. Dia mengurangi IOPS yang telah di-provision menjadi 4.000 (margin keamanan di atas puncak aktual).

Penghematan bulanan: $68.

**Siklus Hidup Snapshot**: Snapshot EBS bersifat inkremental (setiap snapshot hanya menyimpan perubahan sejak snapshot sebelumnya), tetapi mereka bertambah banyak. Snapshot lama dari awal-awal Nimbus masih ada. Tom menyimpan 30 hari dari snapshot harian dan menghapus sisanya.

**EFS: Tingkatan Penyimpanan**

Amazon EFS memiliki tingkatan penyimpanan sendiri:

-   **EFS Standar**: Untuk file yang diakses secara sering. Biaya lebih tinggi.
-   **EFS Akses Jarang (IA)**: Untuk file yang tidak diakses selama 30 hari. 92% lebih murah daripada Standar.
-   **EFS Arsip**: Untuk file yang tidak diakses selama 90 hari. Bahkan lebih murah daripada IA.

**EFS Intelligent-Tiering**: Secara otomatis memindahkan file antar tingkatan penyimpanan berdasarkan pola akses.

Tom mengaktifkan Intelligent-Tiering pada volume EFS. Enam minggu kemudian, 68% dari file telah dipindahkan ke Akses Jarang. Biaya bulanan EFS turun dari $89 menjadi $31.

**Alokasi Biaya S3: Mengetahui Siapa yang Membelanjakan Apa**

Saat Nimbus berkembang, beberapa tim menyimpan data di S3. Tim analisis memiliki bucket mereka sendiri. Tim rekayasa memiliki bucket mereka sendiri. Tim data restoran memiliki bucket mereka sendiri.

Tagihan hanya menunjukkan "S3: $198." Tidak ada rincian berdasarkan tim.

**Alokasi biaya tag** memungkinkan Anda memberi tag pada sumber daya AWS dengan metadata bisnis (tim, proyek, lingkungan) dan kemudian melihat biaya yang dipecah berdasarkan tag tersebut di AWS Cost Explorer.

Tom menambahkan tag ke semua bucket S3:

```
Team: analytics
Environment: production
Project: nimbus-core
```

Setelah siklus penagihan dengan pelabelan, dia bisa melihat: “Danau data tim Analitik adalah $74/bulan. Cadangan rekayasa adalah $43/bulan. Data restoran adalah $81/bulan.”

Sekarang dia bisa memiliki percakapan anggaran dengan setiap tim secara langsung, daripada hanya melihat angka agregat.

**AWS Cost Explorer dan AWS Budgets**

**AWS Cost Explorer**: Memvisualisasikan biaya historis dan yang diproyeksikan berdasarkan layanan, wilayah, pelabelan, dan jenis penggunaan. Penting untuk memahami ke mana uang itu pergi.

**AWS Budgets**: Menetapkan peringatan ketika biaya melebihi (atau diproyeksikan melebihi) ambang batas. Anda dapat membuat anggaran berdasarkan layanan, wilayah, pelabelan, atau akun.

Tom menyiapkan tiga anggaran:

1. Total tagihan bulanan: Peringatkan pada 90% dari jumlah anggaran yang ditetapkan
2. EC2 On-Demand: Peringatkan jika pengeluaran On-Demand melebihi $500/bulan (menunjukkan kesenjangan dalam Rencana Penyediaan)
3. Transfer data keluar: Peringatkan pada $200/bulan (biaya transfer data dapat melonjak secara tak terduga)

Anggaran mengirimkan peringatan ke saluran Slack. Tim melihat kapan mereka mendekati batas, daripada menemukannya pada faktur bulanan.

**Biaya Pengabaian**

Tom membangun spreadsheet. Dia menghitung berapa banyak Nimbus telah menghabiskan untuk:

- Volume EBS yang tidak terpasang (16 bulan): $3.680
- Snapshot S3 lama (ditemukan dan dihapus): $890
- IOPS yang dialokasikan yang tidak diperlukan: $816
- Migrasi dari gp2 ke gp3 penghematan (proyeksi, jika dilakukan lebih awal): $2.160 selama 18 bulan
- Versi S3 yang tidak aktif yang menumpuk: $1.340

Pemborosan total yang teridentifikasi: sekitar $8.800 selama 18 bulan.

“Delapan ribu delapan ratus dolar,” kata Maya.

“Dari pengabaian,” kata Tom. “Tidak dari membuat keputusan arsitektur yang salah. Dari tidak membersihkan.”

“Apa perbaikan sistemiknya?”

“Tinjauan reguler,” kata Priya. “Tinjauan Cost Explorer bulanan. AWS Trusted Advisor secara otomatis menandai volume yang tidak terpasang dan sumber daya yang tidak aktif. Otomatiskan pembersihan limbah pola yang diketahui: hapus snapshot yang lebih tua dari N hari, peringatkan tentang volume EBS yang tidak terpasang, kadaluwarsa versi S3 yang lama.”

“Dan,” tambah Tom, “jadikan kebersihan biaya bagian dari proses penerapan. Ketika seorang insinyur mengakhiri instance EC2, volume EBS dihapus secara otomatis kecuali mereka secara eksplisit menolak.”

## Kekuatan dan Batasan

**Disiplin optimasi biaya**:

- Tinjauan reguler menangkap limbah yang menumpuk sebelum menjadi signifikan
- Pelabelan memungkinkan akuntabilitas — tim melihat biaya mereka sendiri
- Peringatan otomatis mencegah kejutan penagihan
- Kebijakan siklus hidup dan penyesuaian ukuran sering kali merupakan penghematan yang dapat diatur dan dilupakan

**Di mana hal itu menjadi rumit**:

- Mengidentifikasi limbah di seluruh akun besar dengan banyak tim memerlukan alat terpusat
- Beberapa limbah bersifat sengaja (mempertahankan snapshot ekstra “hanya jika terjadi”) — trade-off biaya/risiko adalah penilaian
- Migrasi gp3 memerlukan validasi yang cermat (default IOPS dan throughput dapat berbeda dari perilaku gp2 dalam beberapa kasus tepi)
- Tag alokasi biaya memerlukan disiplin di seluruh tim — pelabelan yang tidak konsisten membuat data tidak lengkap

## Ringkasan

- **Biaya penyimpanan menumpuk secara tidak terlihat** — audit reguler sangat penting.
- **Volume EBS yang tidak terpasang** adalah sumber limbah yang umum. Hapus mereka (atau otomatiskan penghapusan saat instance berakhir).
- **Penyesuaian ukuran EBS**: Migrasi dari gp2 ke gp3 (biasanya penghematan 20%) Hapus IOPS yang berlebihan.
- **Versi S3**: Aktifkan aturan siklus hidup untuk versi yang tidak aktif untuk menghindari membayar riwayat versi tanpa batas.
- **EFS Intelligent-Tiering**: Secara otomatis memindahkan file ke tingkatan biaya yang lebih rendah berdasarkan frekuensi akses.
- **Tag alokasi biaya**: Tandai sumber daya dengan metadata tim/proyek/lingkungan untuk visibilitas biaya dan akuntabilitas.
- **AWS Budgets**: Peringatan proaktif ketika biaya mendekati ambang batas. Jangan pernah terkejut dengan tagihan bulanan.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Biaya yang Dioptimalkan (Domain 4, Tugas 4.1)*

- **Tag alokasi biaya**: Aktifkan Tag Pengguna yang Didefinisikan untuk alokasi biaya di konsol penagihan; lalu tandai sumber daya. Cost Explorer menunjukkan pemecahan berdasarkan tag. Skenario Ujian: “identifikasi departemen mana yang menghasilkan biaya S3 terbanyak” → tag alokasi biaya
- **AWS Trusted Advisor**: Mengidentifikasi instance EC2 yang tidak terpakai, volume EBS yang tidak terpasang, load balancer yang tidak aktif, dan limbah lainnya. Pemeriksaan dasar gratis; pemeriksaan penuh memerlukan Dukungan Bisnis/Enterprise.
- **Komponen biaya EBS**: Penyimpanan (per GB), IOPS yang dialokasikan (jika io1/io2 atau ekstra gp3), throughput (jika ekstra gp3). Ketahui komponen mana yang dapat disesuaikan ukurannya.
- **Biaya versi S3**: Versi yang tidak aktif disimpan dan dikenakan biaya pada tingkat yang sama dengan versi saat ini. Aturan siklus hidup yang kadaluarsa versi yang tidak aktif sangat penting untuk pengendalian biaya dalam bucket yang memiliki versi.
- **AWS Compute Optimizer**: Menganalisis penggunaan EC2 dan merekomendasikan jenis instance yang disesuaikan. Sinyal Ujian: “kurangi biaya EC2 dengan memilih jenis instance yang tepat” → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Menggunakan ML untuk mendeteksi pola pengeluaran yang tidak biasa. Sinyal Ujian: “secara otomatis mendeteksi peningkatan biaya yang tidak terduga” → Deteksi Anomali Biaya.

## Latihan

**Latihan 1 — Ingat**

Jelaskan mengapa volume EBS yang tidak terpasang menghasilkan biaya bahkan jika tidak ada instance EC2 yang menggunakannya. Apa proses yang harus diikuti oleh insinyur saat mengakhiri instance EC2 untuk menghindari limbah ini?

*(Petunjuk: Volume EBS menyimpan data pada disk fisik, dan disk tersebut tetap dikenakan biaya terlepas apakah sedang dibaca atau tidak.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Tagihan AWS sebuah perusahaan telah meningkat dari $5.000 menjadi $9.000/bulan selama enam bulan, tetapi mereka belum menambahkan layanan baru. Tim teknik mencurigai biaya penyimpanan adalah masalahnya. Kombinasi alat AWS mana yang PALING BAIK untuk mengidentifikasi dan menjelaskan peningkatan biaya tersebut?

A) AWS CloudTrail untuk meninjau panggilan API dan mengidentifikasi siapa yang membuat sumber daya baru
B) AWS Cost Explorer untuk pemecahan biaya berdasarkan tingkat layanan, dan AWS Trusted Advisor untuk mendeteksi sumber daya yang tidak aktif dan tidak terhubung
C) Amazon CloudWatch untuk memantau pemanfaatan sumber daya dan membuat alarm biaya
D) AWS Config untuk mengidentifikasi semua sumber daya dan status kepatuhannya

**Petunjuk 1**: "Identifikasi peningkatan biaya" → visualisasikan rincian biaya berdasarkan layanan.

**Petunjuk 2**: "Sumber daya yang tidak aktif dan tidak terhubung" → alat tertentu secara proaktif mengidentifikasi ini.

**Petunjuk 3**: CloudTrail mencatat panggilan API; Cost Explorer menunjukkan tren biaya. Mana yang lebih berguna untuk analisis biaya?

**Jawaban**: B

**Penjelasan**: AWS Cost Explorer menunjukkan tren biaya yang dipecah berdasarkan layanan, wilayah, dan jenis penggunaan — sempurna untuk mengidentifikasi layanan mana yang mendorong peningkatan tersebut. Pemeriksaan optimasi biaya AWS Trusted Advisor mengidentifikasi volume EBS yang tidak terhubung, instance EC2 yang tidak aktif, load balancer yang kurang dimanfaatkan, dan sumber limbah umum lainnya.

**Mengapa tidak A?** CloudTrail mencatat siapa yang membuat sumber daya dan kapan, tetapi tidak secara langsung menunjukkan tren biaya atau mengidentifikasi limbah.

**Mengapa tidak C?** CloudWatch memantau kinerja sumber daya (CPU, memori) — berguna untuk melakukan penyesuaian ukuran tetapi tidak untuk mengidentifikasi limbah penyimpanan yang terakumulasi.

**Mengapa tidak D?** AWS Config melacak konfigurasi sumber daya dan kepatuhan tetapi bukan alat analisis biaya.

*SAA-C03 Domain: Desain Arsitektur yang Dioptimalkan Biayanya — Tugas 4.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Tagihan S3 Nimbus menunjukkan $340/bulan untuk bucket yang diberi label "cadangan." Bucket tersebut memiliki versi yang diaktifkan dan berisi:

- Snapshot database harian (7 hari sudah cukup untuk kebijakan mereka)
- Cadangan penuh mingguan (dipertahankan selama 3 bulan)
- Arsip triwulanan (dipertahankan selama 7 tahun untuk kepatuhan pajak)

Rancang kebijakan siklus hidup untuk bucket ini yang meminimalkan biaya sambil memenuhi persyaratan retensi ini. Kelas penyimpanan mana yang harus digunakan untuk setiap jenis data? Bagaimana cara menangani versi untuk mencegah versi lama menumpuk?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk mempraktikkan desain kebijakan siklus hidup.)*

## Adegan Pasca Kredit

Tom menerbitkan temuan audit biaya kepada tim.

Limbah yang teridentifikasi: $8.800 selama 18 bulan.
Penghematan tahunan yang diharapkan dari perubahan yang diimplementasikan: $6.200.

Kemudian dia menambahkan baris di bagian bawah: "Ini tidak termasuk penghematan dari Savings Plans ($14.200/tahun) atau kebijakan siklus hidup S3 ($7.800/tahun). Dampak optimasi tahunan gabungan: kira-kira $28.200."

Maya membacanya dua kali.

"Itu hampir seperti gaji seorang insinyur junior," katanya.

"Di limbah," Tom mengonfirmasi.

"Atau," kata Leo, "itu adalah bukti bahwa melakukan optimasi ini lebih awal akan mendanai insinyur junior itu."

Tom menatapnya.

"Itulah cara yang benar untuk memikirkannya," katanya. "Optimasi biaya bukanlah tentang memotong. Ini tentang tidak membayar hal-hal yang tidak menciptakan nilai."

Maya menempelkan dokumen tersebut ke wiki perusahaan.

Di bab berikutnya: tingkatan database menerima perawatan yang sama, dan Tom menemukan satu-satunya tempat di mana dia sebenarnya kurang berinvestasi.
