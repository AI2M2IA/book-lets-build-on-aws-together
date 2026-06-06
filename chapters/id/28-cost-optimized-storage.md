# Chapter 28: Kejutan Tagihan Penyimpanan

Spreadsheet itu sudah punya enam belas tab sekarang. Tom membiarkannya terbuka di jendela kedua, seperti sebagian orang menyimpan daftar belanja — selalu terlihat, selalu bertambah. Dia menambahkan baris baru untuk EC2 (selesai, Savings Plan dikomitmen) dan memindahkan kursornya ke baris berikutnya.

Penyimpanan.

**Rekap: EC2 Beres, Satu Item Baris Lagi**

Pekerjaan harga komputasi dari Bab 27 telah mengunci strategi EC2: Compute Savings Plan $0.45/jam pada masa tiga tahun, ditambah Spot untuk batch malam — perkiraan penghematan $42.500 selama masa tersebut. Pekerjaan itu selesai, dan selesai dengan baik. Tetapi itu hanya satu baris pada tagihan. Tom telah belajar, dari enam bulan analisis biaya Athena, bahwa tagihan punya banyak baris — dan bahwa masing-masing layak mendapat penelitian yang sama. S3 berikutnya: $198/bulan, sudah membaik dari $847 setelah perubahan kebijakan siklus hidup dari Bab 23. Namun angka yang menarik perhatiannya berada lebih rendah di halaman. EBS: $440/bulan.

"Itu sepertinya tinggi," katanya.

Leo menarik daftar volume EBS. Ada 47 volume EBS yang terpasang ke instance. Dan kemudian ada 23 volume lain yang tidak terpasang ke instance mana pun.

"Volume 23 ini," kata Tom. "Apa itu?"

**Audit Volume Yatim**

Leo mulai menelusurinya satu per satu. Ini bukan proses yang cepat — volume tidak diberi label secara seragam, tag-nya tidak konsisten, dan beberapa telah dibuat begitu lama sehingga tidak ada yang ingat konteksnya. Tom menarik kursi dan menonton.

Volume ebs-021a4c. Dibuat 16 bulan lalu. Tag: "debug-prod-db-snapshot-restore." Ukuran: 200GB. Terakhir terpasang: tak pernah, atau riwayat pemasangannya telah dihapus.

"Yang itu saya ingat," kata Leo. "Kita punya masalah kueri database dan saya memulihkan sebuah snapshot untuk memeriksa data. Saya memeriksanya, tidak menemukan masalahnya di sana, dan lupa menghapus volumenya."

Volume ebs-07f38b. Dibuat 11 bulan lalu. Tag: "load-test-temp." Ukuran: 400GB.

Leo terdiam sejenak. "Saya rasa itu uji beban yang kita lakukan sebelum presentasi Series Seed. Kita menyediakan instance ekstra dengan penyimpanan ekstra untuk menyimulasikan beban puncak dan kemudian... saya rasa saya tidak menghapus satu pun setelahnya."

"Saya sudah men-deploy-nya — oh," katanya. "Uji bebannya bersifat sementara. Volumenya tidak."

Volume ebs-0ab12c sampai ebs-0ab134. Delapan volume berurutan, dibuat 9 bulan lalu. Tag: "k8s-experiment." Ukuran: 100GB masing-masing, total 800GB.

"Itu evaluasi Kubernetes," kata Priya, sambil melihat dari balik bahu Leo. "Kita menghabiskan tiga minggu mengevaluasi apakah akan bermigrasi ke ECS atau EKS. EKS jadi runner-up. Kita membongkar cluster eksperimen tetapi tampaknya meninggalkan volume persisten-nya."

Tom menjumlahkannya di tab terpisah. Volume demi volume, angkanya menumpuk:

- Volume restore debug: 4 volume × 200GB = 800GB
- Volume uji beban: enam volume antara 200 dan 400GB — kira-kira 1.200GB total
- Volume eksperimen Kubernetes: 8 volume × 100GB = 800GB
- Berbagai tanpa tag: 5 volume × berbagai ukuran = ~700GB

Total: kira-kira 3.500GB di 23 volume yang tidak terpasang.

"Berapa biayanya per bulan?" tanya Tom. Jawabannya: gp3 dengan $0.08/GB/bulan. 3.500GB × $0.08 = $280/bulan.

Dia memeriksa tanggal pembuatan tertua. Enam belas bulan. Dia mengeluarkan kalkulator.

"Kita telah membayar untuk sebagian dari ini selama enam belas bulan," katanya. "Sebagian sembilan bulan. Rata-rata mungkin sepuluh bulan untuk semuanya." 23 volume, rata-rata $12/bulan masing-masing, rata-rata 10 bulan. Itu kira-kira $2.760. Tambahkan volume yang lebih besar dan perhitungannya keluar kira-kira $3.200 total pemborosan.

"Tiga ribu dua ratus dolar," kata Tom. "Dari volume yang tidak digunakan siapa pun."

"Dan tidak ada yang menyadarinya karena biayanya tersebar di puluhan item baris," kata Leo. "Itu bukan satu biaya $3.200. Itu 23 biaya $12 atau $50 atau $80 per bulan, masing-masing secara individu cukup kecil untuk tidak memicu alarm apa pun."

Tom menghapus semua 23 volume yang tidak terpasang. Dia mengonfirmasi dengan Leo dan Priya bahwa masing-masing tidak punya data yang mereka butuhkan — volume debug adalah data usang dari database yang sejak itu telah dimigrasikan, data uji beban tidak relevan, volume eksperimen Kubernetes kosong. Penghapusan butuh lima belas menit. Bulan berikutnya, tagihan EBS turun dari $440 menjadi $160.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya, ketika Tom menjelaskan temuan itu. "Mengapa menghapus volume bukan default ketika Anda menterminasi sebuah instance?"

"Itu tergantung pada volumenya," kata Tom. "Volume **root** memang dihapus secara default — `DeleteOnTermination` bernilai true untuknya. Tetapi setiap volume data **tambahan** yang Anda pasang default-nya adalah dipertahankan. Asumsinya adalah Anda mungkin membutuhkan data yang ada di dalamnya. 23 yatim ini semuanya volume data — terpasang untuk sesi debug atau uji beban, lalu ditinggalkan ketika instance diterminasi."

"Jadi default melindungi Anda dari kehilangan data tak sengaja pada volume data."

"Dan merugikan Anda uang jika Anda tidak memperhatikan. Mulai sekarang: setiap volume data tambahan dihapus secara eksplisit ketika instance terminasi — atau diatur `DeleteOnTermination` saat pemasangan — kecuali seseorang membuat argumen terdokumentasi mengapa mereka perlu menyimpannya."

"Sudahkah kita memikirkan apa yang terjadi jika seseorang lupa mendokumentasikan argumen itu?" tanya Priya. "Kita bisa menghapus sesuatu yang penting."

"Itu trade-off-nya," kata Tom. "Saat ini trade-off-nya ke arah lain — kita berasumsi semuanya harus disimpan dan membayarnya ketika ternyata tidak. Disiplin mendokumentasikan 'simpan volume ini' lebih kecil risikonya daripada default saat ini yaitu 'simpan semuanya secara diam-diam.'"

**Audit Biaya Penyimpanan**

Penemuan EBS Tom adalah gejala dari pola yang lebih luas: biaya penyimpanan menumpuk secara tak terlihat. Tidak seperti komputasi (Anda menyadari ketika 47 server sedang berjalan), penyimpanan diam-diam bertambah.

Bayangkan seperti sewa unit penyimpanan. Menyewa satu unit jelas terlihat pada laporan kartu kredit. Tetapi jika Anda menyewa unit kedua untuk sebuah proyek, lalu unit ketiga untuk beberapa perabotan lama, dan Anda tidak pernah kembali untuk memeriksa apa yang ada di dalamnya — biaya terus muncul setiap bulan, diam-diam, jauh setelah Anda lupa apa yang Anda simpan. Penyimpanan cloud bekerja dengan cara yang sama: byte-byte itu ada di sana, faktur tiba, dan tidak ada yang mempertanyakannya sampai seseorang akhirnya membuka pintu dan menemukannya penuh dengan hal-hal yang tidak lagi dibutuhkan siapa pun.

Audit biaya penyimpanan yang menyeluruh melihat:

**S3**:

- Apakah kebijakan siklus hidup diterapkan untuk semua bucket?
- Apakah ada snapshot lama (RDS, EBS) yang berada di S3?
- Apakah Intelligent-Tiering sesuai untuk bucket mana pun dengan pola akses yang tidak pasti?
- Apakah objek yang ber-versi menciptakan beberapa salinan yang tidak pernah diakses?
- Apakah ada unggahan multipart yang tidak selesai yang menumpuk secara diam-diam?

**EBS**:

- Apakah ada volume yang tidak terpasang (tidak ada instance berjalan yang menggunakannya)?
- Apakah volume gp3 dikonfigurasi dengan benar? (Volume gp3 default mungkin memiliki throughput/IOPS provisioned berlebih yang tidak dibutuhkan)
- Apakah snapshot yang lebih tua dari yang diperlukan dipertahankan?

**RDS**:

- Apakah periode retensi cadangan otomatis diatur dengan tepat? (Lebih panjang = biaya penyimpanan lebih tinggi)
- Apakah snapshot manual dari instance lama masih berada di sana?
- Apakah read replica dari migrasi database masih berjalan?

**EFS**:

- Apakah volume EFS berada di kelas penyimpanan yang tepat? (Standard vs Infrequent Access)

**S3 Versioning: Biaya Tersembunyi**

Pada Bab 5, kami menyebutkan bahwa versioning S3 menyimpan setiap versi sebelumnya dari sebuah objek. Ini sangat bagus untuk keamanan. Ini sangat buruk untuk biaya jika Anda juga tidak memiliki aturan siklus hidup untuk versi-versi tersebut.

Ketika versioning diaktifkan pada bucket, setiap kali Anda menimpa sebuah objek, versi lama dipertahankan. Seiring waktu:

- Hari 1: Gambar diunggah (v1)
- Hari 30: Gambar diperbarui (v1 sekarang menjadi versi "noncurrent", v2 adalah versi saat ini)
- Hari 60: Gambar diperbarui lagi (v1 dan v2 adalah noncurrent, v3 adalah versi saat ini)
- Hari 365: v1, v2... v12 semuanya disimpan. Anda membayar untuk 12 salinan sebuah gambar.

Anda mungkin bertanya-tanya mengapa versioning tidak otomatis membersihkan versi lama. Jawabannya disengaja — AWS tidak ingin otomatis menghapus data Anda. Tetapi konsekuensinya adalah setiap versi menumpuk sampai Anda memberi tahu S3 secara eksplisit berapa lama menyimpannya. Solusinya: aturan siklus hidup untuk versi noncurrent.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom menerapkan aturan-aturan ini ke semua bucket yang ber-versi. Bulan berikutnya, penyimpanan S3 berkurang sebesar 18%.

**Unggahan Multipart yang Tidak Selesai: Akumulasi Tak Terlihat**

Ada biaya S3 yang lebih halus yang dilewatkan sepenuhnya oleh kebanyakan insinyur: unggahan multipart yang tidak selesai.

Ketika S3 mengunggah berkas besar, ia memecahnya menjadi bagian-bagian dan mengunggah masing-masing secara terpisah. Ini adalah mekanisme unggahan multipart — lebih andal daripada satu PUT besar untuk berkas di atas beberapa ratus megabyte. Tetapi jika sebuah unggahan dimulai dan kemudian gagal di tengah jalan — gangguan jaringan, crash klien, bug aplikasi — bagian-bagian yang sudah terunggah tetap berada di S3. Mereka tidak terlihat sebagai objek di bucket Anda. Mereka tidak muncul di daftar mana pun. Tetapi mereka tersimpan, dan Anda dikenakan biaya untuknya dengan tarif S3 standar.

Tom menemukan ini dengan mengaktifkan dasbor S3 Storage Lens di konsol S3 dan mengurutkan berdasarkan "incomplete multipart uploads." Nimbus memiliki 340GB data unggahan multipart tidak selesai yang tersimpan diam-diam di bucket di empat akun AWS, sebagian berusia lebih dari setahun.

"Berapa biayanya per bulan?" tanya Tom. $0.023/GB/bulan × 340GB = $7,82/bulan. Kecil secara individu. Tetapi telah menumpuk selama setahun tanpa ada yang menyadarinya.

Solusinya: tambahkan aturan siklus hidup ke setiap bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Setelah tujuh hari, setiap unggahan multipart yang tidak selesai otomatis dibersihkan. Ini berjalan tanpa batas tanpa perhatian berkelanjutan apa pun.

"Jika semua itu telah berada di sana selama setahun penuh — sebut saja $94 yang telah kita keluarkan untuk unggahan yang gagal," kata Leo.

"Untuk unggahan yang gagal," Tom mengonfirmasi. "Bahkan bukan untuk penyimpanan yang sukses. Ini adalah definisi pemborosan infrastruktur."

**EBS: Penyesuaian Ukuran dan Peningkatan gp3**

Harga volume EBS memiliki dua komponen:

1. Penyimpanan (per GB per bulan)
2. IOPS dan throughput yang di-provision (jika Anda menggunakan io1/io2 atau membayar untuk kinerja gp3 tambahan)

**Peluang gp3**: Pada Bab 6, kami mencatat bahwa gp3 adalah default saat ini dan lebih murah daripada gp2. Jika Nimbus memiliki volume yang dibuat sebelum gp3 tersedia (diluncurkan pada Desember 2020), volume tersebut mungkin masih berupa gp2.

Migrasinya sederhana: ubah jenis volume dari gp2 ke gp3 di konsol AWS atau via CLI. Tidak diperlukan downtime. Volume tetap tersedia selama konversi. Karakteristik kinerja setara atau lebih baik — gp3 menyediakan 3.000 IOPS dan throughput baseline 125 MB/s, dibandingkan model burstable gp2 yang bisa tidak konsisten untuk volume yang lebih kecil.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Jika gp3 lebih murah dan setidaknya sama baiknya dengan gp2, mengapa AWS tidak memigrasikan semua orang secara otomatis?"

"Karena AWS tidak membuat perubahan sepihak pada infrastruktur pelanggan," kata Tom. "Bahkan yang menguntungkan. Modifikasi itu secara teoritis bisa memiliki efek samping untuk beberapa beban kerja. Pelanggan yang harus memulainya. Itulah mengapa ribuan tim masih membayar harga gp2 bertahun-tahun setelah gp3 diluncurkan, hanya karena tidak ada yang mencari."

Tom memutuskan untuk melakukan migrasi gp3 pada pagi Sabtu — disiplin pagi yang sama yang telah dia terapkan pada analisis harga EC2. Waktu tenang. Tidak ada standup. Hanya konsol AWS dan sebuah rencana.

Dia telah mengidentifikasi 8 volume di seluruh lingkungan produksi yang masih gp2: empat volume root server API, dua volume yang terpasang ke pemroses latar belakang, dan dua volume data lawas yang dibuat sebelum migrasi gp3 menjadi praktik standar untuk penerapan baru. Bersama-sama totalnya 960 GB.

Proses migrasi adalah satu panggilan API per volume:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Parameter `--iops 3000` dan `--throughput 125` cocok dengan default baseline gp3. Untuk gp2, Tom telah memeriksa metrik CloudWatch terlebih dahulu: IOPS rata-rata pada setiap volume antara 200 dan 800. Tidak satu pun dari mereka membutuhkan lebih dari baseline 3.000 IOPS yang disediakan gp3 secara gratis. Throughput-nya serupa nyaman — jauh di dalam default 125 MB/s.

"Bagaimana jika sebuah volume butuh lebih banyak IOPS setelah kita beralih?" tanya Maya, ketika Tom menjelaskan rencana migrasi.

"Kita bisa meningkatkan IOPS yang di-provision pada volume gp3 kapan saja," kata Tom. "Migrasi tidak mengunci apa pun. Jika kita pindah ke gp3 pada 3.000 IOPS dan menemukan itu tidak cukup, kita modifikasi volumenya lagi untuk menambah lebih banyak. Modifikasinya live — tanpa downtime, tanpa unmounting."

"Dan gp2 tidak bisa dimodifikasi di tempat?"

"gp2 bisa dimodifikasi ke gp3 di tempat. Yang tidak bisa Anda lakukan adalah kembali dari gp3 ke gp2 — setidaknya, tidak dengan mudah, dan tidak ada alasan untuk itu."

Migrasi aktual butuh 73 menit dari perintah pertama hingga selesai di seluruh 8 volume. AWS memodifikasi setiap volume sementara ia ter-mount dan sedang digunakan. Server API terus menerima lalu lintas selama proses. CloudWatch tidak menunjukkan lonjakan latensi I/O selama konversi — transisinya sepenuhnya transparan bagi aplikasi yang berjalan.

"Itulah seperti apa 'tidak diperlukan downtime' sebenarnya," kata Leo, melihat metrik sebelum-dan-sesudah yang telah ditangkap Tom. "Saya berasumsi 'tidak ada downtime' berarti 'restart singkat.' Ternyata berarti benar-benar tidak ada yang berubah dari perspektif aplikasi."

Penghematannya: gp2 adalah $0.10/GB/bulan; gp3 adalah $0.08/GB/bulan. Pada 960 GB: $96/bulan vs $76,80/bulan. Penghematan bulanan: $19,20. Tidak transformatif dengan sendirinya, tetapi disiplin yang diwakilinya transformatif. Setiap volume baru yang dibuat sejak titik itu menggunakan gp3 secara default. Aturan organisasi yang Tom tulis pagi itu: tidak ada volume gp2. Setiap insinyur yang membuat volume EBS harus menggunakan gp3 kecuali ada alasan spesifik dan terdokumentasi sebaliknya.

**IOPS dan throughput**: Volume gp3 dilengkapi dengan 3.000 IOPS dan throughput 125 MB/s secara default, tanpa biaya tambahan. Anda dapat men-provision lebih banyak jika beban kerja Anda membutuhkannya. Tinjau apakah kinerja yang di-provision benar-benar dimanfaatkan.

Dalam audit yang sama, Tom menemukan dua volume dengan 10.000 IOPS yang di-provision — pengaturan lawas dari sebelum dia bergabung, diukur untuk sebuah database yang sejak itu telah dimigrasikan ke Aurora. Dia memeriksa metrik CloudWatch: IOPS rata-rata aktual adalah 1.200. Dia mengurangi IOPS yang di-provision menjadi 4.000 (margin keamanan di atas puncak aktual).

Penghematan bulanan: $68 dalam biaya IOPS provisioned yang telah membayar untuk headroom kinerja yang tidak digunakan siapa pun.

**Siklus hidup snapshot**: Snapshot EBS bersifat inkremental (setiap snapshot hanya menyimpan perubahan sejak snapshot sebelumnya), tetapi mereka menumpuk. Snapshot lama dari masa-masa awal Nimbus masih ada. Tom menyimpan 30 hari snapshot harian dan menghapus sisanya.

**EFS: Kelas Penyimpanan dan Keputusan Intelligent-Tiering**

Amazon EFS memiliki kelas penyimpanan sendiri:

- **EFS Standard**: Untuk berkas yang diakses sering. Biaya lebih tinggi.
- **EFS Infrequent Access (IA)**: Untuk berkas yang tidak diakses selama 30 hari. 92% lebih murah daripada Standard.
- **EFS Archive**: Untuk berkas yang tidak diakses selama 90 hari. Bahkan lebih murah daripada IA.

**EFS Intelligent-Tiering**: Secara otomatis memindahkan berkas antar kelas penyimpanan berdasarkan pola akses.

Tom mengaktifkan Intelligent-Tiering pada volume EFS. Enam minggu kemudian, 68% berkas telah pindah ke Infrequent Access. Biaya bulanan EFS turun dari $89 menjadi $31.

Tetapi pilihan antara Intelligent-Tiering dan aturan siklus hidup manual tidaklah sepele. Tom telah mempertimbangkannya.

"Tunggu — tapi *mengapa* kita melakukan Intelligent-Tiering versus hanya menetapkan aturan siklus hidup manual?" tanya Maya. "Jika kita tahu bahwa berkas yang lebih tua dari 30 hari tidak diakses, mengapa tidak menetapkan aturannya saja dan selesai?"

"Intelligent-Tiering menangani berkas yang kembali," kata Tom. "Jika saya menetapkan aturan siklus hidup untuk memindahkan berkas ke IA setelah 30 hari, dan kemudian seseorang mengakses berkas yang telah berada di IA selama enam bulan, ia tetap di IA. Dengan Intelligent-Tiering, jika akses kembali, berkas otomatis pindah kembali ke Standard. Itu dua arah."

"Kapan Anda lebih memilih aturan siklus hidup?"

"Ketika Anda yakin pola aksesnya satu arah. Log arsip — mereka ditulis, menua, diakses sekali untuk audit kepatuhan dan kemudian tidak pernah lagi. Untuk pola itu, aturan siklus hidup yang memindahkan ke Archive setelah 90 hari lebih murah daripada Intelligent-Tiering karena Anda tidak membayar overhead pemantauan."

"Ada biaya pemantauan?"

"Untuk S3 Intelligent-Tiering, ya, itulah mengapa kita membahas ekonomi objek kecil di bab siklus hidup S3 dulu. Untuk EFS, keputusannya sebagian besar tentang pola akses: jika berkas mungkin menjadi panas lagi, Intelligent-Tiering lebih aman. Jika mereka hanya menua dalam satu arah, aturan siklus hidup ke Archive lebih murah dan lebih sederhana."

**Tag Alokasi Biaya S3: Menemukan Siapa Membelanjakan Apa**

Saat Nimbus berkembang, beberapa tim menyimpan data di S3. Tim analitik punya bucket mereka sendiri. Tim teknik punya bucket mereka. Tim data restoran punya bucket mereka.

Tagihan hanya menunjukkan "S3: $198." Tidak ada rincian berdasarkan tim.

**Tag alokasi biaya** memungkinkan Anda memberi tag pada sumber daya AWS dengan metadata bisnis (tim, proyek, lingkungan) dan kemudian melihat biaya yang dirinci berdasarkan tag tersebut di AWS Cost Explorer.

Tom menambahkan tag ke semua bucket S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Setelah siklus penagihan dengan tagging, dia bisa melihat: "Data lake tim analitik adalah $74/bulan. Cadangan teknik adalah $43/bulan. Data restoran adalah $81/bulan."

Sekarang dia bisa melakukan percakapan anggaran dengan setiap tim alih-alih hanya melihat angka agregat.

**AWS Cost Explorer dan AWS Budgets**

**AWS Cost Explorer**: Memvisualisasikan biaya historis dan yang diprakirakan berdasarkan layanan, region, tag, dan jenis penggunaan. Penting untuk memahami ke mana uang pergi.

**AWS Budgets**: Menetapkan peringatan ketika biaya melebihi (atau diprakirakan akan melebihi) ambang batas. Anda dapat membuat anggaran berdasarkan layanan, region, tag, atau akun.

Tom menyiapkan tiga anggaran:

1. Total tagihan bulanan: Peringatan pada 90% dari jumlah yang dianggarkan
2. EC2 On-Demand: Peringatan jika pengeluaran On-Demand melebihi $500/bulan (menandakan kesenjangan Savings Plan)
3. Transfer data keluar: Peringatan pada $200/bulan (biaya transfer data dapat melonjak tak terduga)

Budgets mengirim peringatan ke saluran Slack. Tim melihat kapan mereka mendekati batas, alih-alih menemukannya di faktur bulanan.

**Tanda Terima dengan Setiap Baris: Cost and Usage Reports**

Cost Explorer menjawab sebagian besar pertanyaan Tom. Lalu dia menemui satu yang tidak bisa: "tepatnya bucket S3 mana, jam demi jam, yang mendorong lonjakan Selasa lalu — dan di bawah tag mana?"

Untuk pertanyaan tingkat forensik, AWS menyediakan **Cost and Usage Report (CUR)** — kini dikirim melalui **Data Exports** — data penagihan paling rinci yang dihasilkan AWS: setiap item baris, **per sumber daya, per jam**, dengan tag, dikirim ke bucket S3 milik Anda. Ini bukan dasbor; ini buku besar mentah. Pola standarnya adalah menjalankan kueri padanya dengan Athena (ia mendarat dalam format kolumnar) atau memberinya ke QuickSight untuk dasbor.

Pembagian kerja di ujian: **Cost Explorer** = visualisasi interaktif dan prakiraan di konsol. **Budgets** = peringatan pada ambang batas. **CUR/Data Exports** = data paling granular, dikirim ke S3, untuk analisis Anda sendiri. Ketika sebuah pertanyaan mengatakan "data biaya tingkat sumber daya, per jam untuk analisis kustom" — itu adalah CUR, bukan Cost Explorer.

"Sudahkah kita memikirkan apa yang terjadi jika kita tidak pernah melihat ini?" tanya Priya. "Kita telah menemukan $6.700 dalam dua hari. Apa yang masih bersembunyi?"

"Audit reguler," lanjutnya. "Tinjauan Cost Explorer bulanan. AWS Trusted Advisor menandai volume yang tidak terpasang dan sumber daya idle secara otomatis. Otomatiskan pembersihan pola pemborosan yang diketahui: hapus snapshot yang lebih tua dari N hari, peringatkan tentang volume EBS yang tidak terpasang, kedaluwarsakan versi S3 lama."

**S3 Requester-Pays: Mengalihkan Biaya Transfer**

Selama audit penyimpanan, Tom menemukan situasi yang tidak dia antisipasi.

Mitra restoran Nimbus perlu mengunduh aset foto menu mereka — gambar yang sudah diproses dan diubah ukurannya yang disajikan platform pemesanan ke pelanggan. Untuk restoran yang memperbarui menunya, ini berarti mengunduh di mana saja dari 50 MB (pembaruan kecil) hingga 800 MB (penyegaran musiman penuh) berkas gambar. Saat ini, Nimbus membayar biaya transfer data keluar pada setiap unduhan: $0.09/GB dari S3 ke lokasi mitra.

Pada 287 mitra restoran, dengan rata-rata satu penyegaran menu per bulan dan unduhan rata-rata 200 MB, perhitungannya adalah: 287 × 0,2GB × $0.09 = $5,17/bulan. Tidak signifikan pada skala saat ini.

"Apa yang terjadi pada 2.000 restoran?" tanya Tom.

"Perhitungan yang sama," kata Maya. "Sekitar $36/bulan."

"Bagaimana dengan 10.000 restoran, dan mitra mengunduh paket aset musiman besar — katakanlah, 2 GB untuk pembaruan menu liburan?"

Dia menghitungnya. 10.000 × 2GB × $0.09 = $1.800/bulan dalam transfer data, hanya untuk mitra mengunduh aset yang mereka butuhkan.

"Itu angka yang nyata," kata Priya.

"Sudahkah kita memikirkan apa yang terjadi jika tagihan itu muncul di bulan yang sama saat kita mencoba menutup Series B?" lanjut Priya.

"S3 Requester-Pays," kata Tom.

S3 punya fitur bernama Requester-Pays: ketika diaktifkan pada bucket, entitas yang membuat permintaan — bukan pemilik bucket — yang membayar biaya transfer data dan biaya permintaan. Pemilik bucket tetap membayar untuk penyimpanan. Tetapi setiap unduhan dari bucket ditagihkan ke akun AWS pemohon.

Trade-off-nya adalah akses. Requester-Pays mengharuskan pemohon menjadi pelanggan AWS dengan akun yang valid — akses tanpa otentikasi atau anonim ke bucket Requester-Pays mengembalikan error. Untuk mitra restoran Nimbus, yang merupakan bisnis dengan tingkat kecanggihan teknis yang bervariasi, mengharuskan mereka memiliki akun AWS untuk mengunduh aset menu mereka sendiri bukanlah model yang layak.

"Kita tidak bisa melakukan Requester-Pays untuk akses mitra langsung," kata Maya. "Sebagian besar mitra kita tidak akan menyiapkan akun AWS untuk mengunduh foto."

"Benar," kata Tom. "Tetapi kita bisa menggunakannya untuk integrasi B2B — jaringan yang lebih besar yang punya tim teknis dan akun AWS. Bukan restoran kecil di sudut, tetapi jaringan burger 50 lokasi yang punya tim teknik dan berintegrasi dengan API kita secara langsung. Untuk segmen itu, Requester-Pays masuk akal."

"Dan untuk sisanya?"

"Kita beri mereka portal unduhan yang menggunakan URL S3 pre-signed. Transfer tetap melalui AWS, biayanya tetap milik kita — tetapi itu juga sudah diperhitungkan ke dalam harga mitra. Opsi Requester-Pays adalah sesuatu yang akan kita bangun ke dalam negosiasi kontrak untuk mitra yang lebih besar, bukan sesuatu yang kita terapkan hari ini."

Tom menambahkannya ke spreadsheet di bawah "optimasi masa depan": S3 Requester-Pays untuk mitra enterprise dengan akun AWS. Pada 2.000 restoran dengan 20% klien enterprise, pada unduhan bulanan 2 GB: $72/bulan berpotensi dialihkan ke mitra. Kecil pada skala itu, tetapi pola yang sama menjadi bermakna seiring paket aset bertumbuh. Tinjau ketika jumlah mitra melebihi 1.000 atau ketika mitra enterprise mulai menarik paket musiman yang lebih besar.

"Pelajarannya sama seperti biasa," kata Tom. "Ketahui biayanya akan menjadi berapa pada skala besar sebelum Anda berada pada skala itu. Masalah $5 hari ini adalah masalah $1.800 dalam tiga tahun. Merancang untuknya sekarang tidak memerlukan biaya."

**Tata Kelola: Auto-Delete vs Alert-Only**

Pertanyaan otomatisasi adalah yang paling banyak menimbulkan ketidaksepakatan.

"Haruskah kita auto-delete volume EBS yang tidak terpasang setelah 14 hari?" tanya Tom. "Aturan AWS Config bisa menandainya. Lambda bisa menghapusnya secara otomatis."

"Tidak," kata Priya segera.

"Mengapa tidak?"

"Karena auto-deletion berarti kita pada akhirnya akan menghapus sesuatu yang tidak terpasang karena suatu alasan. Mungkin seseorang melepas volume untuk memindahkannya ke instance berbeda, dan ia telah berada di sana selama 12 hari sementara sebuah perubahan ditinjau. Auto-delete pada hari ke-14 menghancurkan data itu."

"Jadi alert-only?" kata Tom. "Kita mendapat notifikasi tetapi tidak otomatis menghapus."

"Peringatan dulu," kata Priya. "Paksa manusia untuk membuat keputusan. Peringatannya adalah: 'Volume ini telah tidak terpasang selama 14 hari. Tandai sebagai `keep: true` jika Anda membutuhkannya, atau ia akan ditandai untuk penghapusan pada tinjauan berikutnya.' Keputusan manusia kemudian didokumentasikan oleh ada atau tidaknya tag."

"Itu lebih lambat," kata Leo.

"Lebih lambat dan lebih kecil kemungkinan menghancurkan data," kata Priya. "Kita sudah kehilangan $3.200 karena kelalaian. Kita belum kehilangan data apa pun karena otomatisasi. Saya tahu mana yang lebih saya pilih untuk dipertahankan."

Tom mendarat pada hibrida: auto-alert pada 7 hari, mengharuskan tag `keep: true` untuk menekan peringatan di masa depan, dan menjalankan laporan mingguan dari semua volume yang tidak-bertag-dan-tidak-terpasang untuk ditinjau tim bersama. Tidak ada auto-deletion.

**Variasi: Ketika Pembersihan Lebih Mahal daripada Penghematannya**

Jika Anda butuh keamanan snapshot ekstra, simpan mereka — tetapi setiap snapshot yang lebih tua dari 90 hari tanpa akses harus mendapatkan tempatnya. Trade-off-nya asimetris: menghapus snapshot yang Anda butuhkan menelan biaya insiden; menyimpan snapshot yang tidak Anda butuhkan hanya menelan biaya bulanan kecil. Untuk data yang sensitif terhadap kepatuhan, biaya menyimpan snapshot lama nyata tetapi biasanya lebih kecil daripada biaya tidak memilikinya ketika seorang auditor bertanya. Untuk snapshot pengembangan dari tes yang berjalan 14 bulan lalu, perhitungannya berjalan ke arah lain.

Jika Anda mengaktifkan EFS Intelligent-Tiering untuk berkas dengan pola akses tidak pasti, tiering otomatis menghemat uang dan tidak memerlukan intervensi berkelanjutan. Jika berkas dapat diprediksi menua menuju akses arsip, aturan siklus hidup langsung lebih sederhana. Ukur sebelum mengaktifkan.

Koneksi SAA-C03: Ujian menguji apakah Anda bisa memilih antara kelas penyimpanan S3 (Standard, IA, Glacier) dengan skenario frekuensi akses tertentu. Logika yang sama berlaku di sini — kelas yang tepat tergantung pada seberapa sering data diakses.

**Biaya Kelalaian**

Tom membangun spreadsheet. Dia menghitung berapa banyak Nimbus telah keluarkan untuk:

- Volume EBS yang tidak terpasang (16 bulan): $3.200
- Snapshot S3 lama (ditemukan dan dihapus): $890
- IOPS provisioned yang tidak dibutuhkan: $816
- Penghematan migrasi gp2 ke gp3 (proyeksi, jika dilakukan lebih awal): $346 selama 18 bulan
- Versi S3 noncurrent yang menumpuk: $1.340
- Unggahan multipart yang tidak selesai: $94

Total pemborosan yang teridentifikasi: kira-kira $6.700 selama 18 bulan.

"Enam ribu tujuh ratus dolar," kata Maya.

"Dari kelalaian," kata Tom. "Bukan dari membuat keputusan arsitektur yang salah. Dari tidak membersihkan."

"Apa perbaikan sistematisnya?"

"Dan," tambah Tom, "jadikan kebersihan biaya bagian dari proses penerapan. Ketika seorang insinyur menterminasi instance EC2, volume EBS dihapus secara otomatis kecuali mereka secara eksplisit memilih keluar."

## Kekuatan dan Batasan

**Disiplin optimasi biaya**:

- Tinjauan reguler menangkap pemborosan yang menumpuk sebelum menjadi signifikan
- Tagging memungkinkan akuntabilitas — tim melihat biaya mereka sendiri
- Peringatan otomatis mencegah kejutan penagihan
- Kebijakan siklus hidup dan penyesuaian ukuran sering kali merupakan penghematan set-and-forget

**Di mana hal itu menjadi rumit**:

- Mengidentifikasi pemborosan di seluruh akun besar dengan banyak tim memerlukan alat terpusat
- Beberapa pemborosan disengaja (menyimpan snapshot ekstra "untuk jaga-jaga") — trade-off biaya/risiko adalah penilaian
- Migrasi gp3 memerlukan validasi cermat (default IOPS dan throughput bisa berbeda dari perilaku gp2 dalam beberapa kasus tepi)
- Tag alokasi biaya memerlukan disiplin di seluruh tim — tagging yang tidak konsisten membuat datanya tidak lengkap
- Otomatisasi auto-deletion berbahaya untuk penyimpanan — alert-and-review lebih aman untuk volume dan snapshot

## Ringkasan

Audit penyimpanan butuh dua hari. Pemborosan yang diungkapnya — $6.700 selama 18 bulan akumulasi tak terlihat — lebih merupakan kegagalan perhatian daripada kegagalan pengambilan keputusan. Tidak ada yang dikonfigurasi salah dengan sengaja. Snapshot, volume yang tidak terpasang, riwayat versi yang menumpuk, unggahan multipart yang tidak selesai: masing-masing masuk akal pada saatnya dan hanya tidak pernah ditinjau kembali. Pelajarannya bukan tentang layanan AWS tertentu. Ini tentang membangun kebiasaan untuk melihat.

- **Biaya penyimpanan menumpuk secara tak terlihat** — audit reguler sangat penting.
- **Volume EBS yang tidak terpasang** adalah sumber pemborosan yang umum. Hapus mereka (atau otomatiskan penghapusan saat instance terminasi).
- **Penyesuaian ukuran EBS**: Migrasi gp2 ke gp3 (biasanya penghematan 20%). Hapus IOPS provisioned berlebih.
- **S3 versioning**: Aktifkan aturan siklus hidup untuk versi noncurrent untuk menghindari membayar riwayat versi tak terbatas.
- **Unggahan multipart yang tidak selesai**: Tambahkan aturan siklus hidup `AbortIncompleteMultipartUpload` ke setiap bucket. Ini sering terlewatkan dan menumpuk diam-diam.
- **EFS Intelligent-Tiering**: Secara otomatis memindahkan berkas ke tingkat biaya lebih rendah berdasarkan frekuensi akses. Untuk pola akses yang dapat diprediksi, aturan siklus hidup manual bisa lebih murah.
- **Tata kelola**: Peringatkan tentang volume yang tidak terpasang setelah 7-14 hari; haruskan tagging eksplisit untuk menekan. Hindari auto-deletion untuk sumber daya penyimpanan.

## Tips Ujian

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

- **Tag alokasi biaya**: Aktifkan User-Defined Tags untuk alokasi biaya di konsol penagihan; lalu beri tag pada sumber daya. Cost Explorer menunjukkan rincian berdasarkan tag. Skenario ujian: "identifikasi departemen mana yang menghasilkan biaya S3 terbanyak" → tag alokasi biaya.
- **AWS Trusted Advisor**: Mengidentifikasi instance EC2 yang kurang dimanfaatkan, volume EBS yang tidak terpasang, load balancer idle, dan pemborosan lainnya. Pemeriksaan dasar gratis; pemeriksaan penuh memerlukan Business/Enterprise Support.
- **Komponen biaya EBS**: Penyimpanan (per GB), IOPS provisioned (jika io1/io2 atau gp3 ekstra), throughput (jika gp3 ekstra). Ketahui komponen mana yang dapat disesuaikan ukurannya.
- **Biaya versioning S3**: Versi noncurrent disimpan dan dikenakan biaya pada tarif yang sama dengan versi saat ini. Aturan siklus hidup yang mengedaluwarsakan versi noncurrent sangat penting untuk pengendalian biaya pada bucket ber-versi.
- **AWS Compute Optimizer**: Menganalisis pemanfaatan EC2 dan merekomendasikan jenis instance yang sesuai ukurannya. Sinyal ujian: "kurangi biaya EC2 dengan memilih jenis instance yang tepat" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Menggunakan ML untuk mendeteksi pola pengeluaran yang tidak biasa. Sinyal ujian: "secara otomatis mendeteksi peningkatan biaya tak terduga" → Cost Anomaly Detection.
- **Jajaran alat biaya**: bagan/prakiraan interaktif → Cost Explorer. Peringatan ambang batas → Budgets. "Data penagihan paling granular, tingkat sumber daya/per jam dikirim ke S3 untuk analisis kustom (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "bagikan dataset S3 besar; konsumen membayar biaya unduhan mereka sendiri" → S3 Requester Pays (pemilik tetap membayar penyimpanan saja; pemohon harus terotentikasi dengan akun AWS).

## Latihan

**Latihan 1 — Mengingat**

Jelaskan mengapa volume EBS yang tidak terpasang menghasilkan biaya meskipun tidak ada instance EC2 yang menggunakannya. Proses apa yang harus diikuti insinyur saat menterminasi instance EC2 untuk menghindari pemborosan ini?

*(Petunjuk: Volume EBS menyimpan data pada disk fisik, dan disk itu menelan biaya terlepas dari apakah sedang dibaca atau tidak.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Tagihan AWS sebuah perusahaan telah tumbuh dari $5.000 menjadi $9.000/bulan selama enam bulan, tetapi mereka belum menambahkan layanan baru. Tim teknik mencurigai biaya penyimpanan adalah masalahnya. Kombinasi alat AWS mana yang PALING BAIK mengidentifikasi dan menjelaskan peningkatan biaya tersebut?

A) AWS CloudTrail untuk meninjau panggilan API dan mengidentifikasi siapa yang membuat sumber daya baru  
B) AWS Cost Explorer untuk rincian biaya tingkat layanan, dan AWS Trusted Advisor untuk deteksi sumber daya idle dan tidak terpasang  
C) Amazon CloudWatch untuk memantau pemanfaatan sumber daya dan membuat alarm biaya  
D) AWS Config untuk mengidentifikasi semua sumber daya dan status kepatuhannya

**Petunjuk 1**: "Identifikasi peningkatan biaya" → visualisasikan rincian biaya berdasarkan layanan.

**Petunjuk 2**: "Sumber daya idle dan tidak terpasang" → alat tertentu secara proaktif mengidentifikasi ini.

**Petunjuk 3**: CloudTrail mencatat panggilan API; Cost Explorer menunjukkan tren biaya. Mana yang lebih berguna untuk analisis biaya?

**Jawaban**: B

**Penjelasan**: AWS Cost Explorer menunjukkan tren biaya yang dirinci berdasarkan layanan, region, dan jenis penggunaan — sempurna untuk mengidentifikasi layanan mana yang mendorong peningkatan tersebut. Pemeriksaan optimasi biaya AWS Trusted Advisor mengidentifikasi volume EBS yang tidak terpasang, instance EC2 idle, load balancer yang kurang dimanfaatkan, dan sumber pemborosan umum lainnya.

**Mengapa bukan A?** CloudTrail mencatat siapa yang membuat sumber daya dan kapan, tetapi tidak secara langsung menunjukkan tren biaya atau mengidentifikasi pemborosan.

**Mengapa bukan C?** CloudWatch memantau kinerja sumber daya (CPU, memori) — berguna untuk penyesuaian ukuran tetapi bukan untuk mengidentifikasi pemborosan penyimpanan yang menumpuk.

**Mengapa bukan D?** AWS Config melacak konfigurasi sumber daya dan kepatuhan tetapi bukan alat analisis biaya.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Tagihan S3 Nimbus menunjukkan $340/bulan untuk bucket berlabel "backups." Bucket tersebut memiliki versioning yang diaktifkan dan berisi:

- Snapshot database harian (7 hari sudah cukup untuk kebijakan mereka)
- Cadangan penuh mingguan (disimpan selama 3 bulan)
- Arsip triwulanan (disimpan selama 7 tahun untuk kepatuhan pajak)

Rancang kebijakan siklus hidup untuk bucket ini yang meminimalkan biaya sambil memenuhi persyaratan retensi ini. Kelas penyimpanan mana yang harus digunakan setiap jenis data? Bagaimana Anda akan menangani versioning untuk mencegah versi lama menumpuk?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih desain kebijakan siklus hidup.)*

## Adegan Pasca-Kredit

Tom menerbitkan temuan audit biaya kepada tim.

Pemborosan yang teridentifikasi: $6.700 selama 18 bulan.
Penghematan tahunan yang diharapkan dari perubahan yang diimplementasikan: $6.200.

Kemudian dia menambahkan baris di bagian bawah: "Ini tidak termasuk penghematan dari Savings Plans ($14.200/tahun) atau kebijakan siklus hidup S3 ($7.800/tahun). Dampak optimasi tahunan gabungan: kira-kira $28.200."

Maya membacanya dua kali.

"Itu hampir gaji seorang insinyur junior," katanya.

"Dalam pemborosan," Tom mengonfirmasi.

"Atau," kata Leo, "itu bukti bahwa melakukan optimasi ini lebih awal akan mendanai insinyur junior itu."

Tom menatapnya.

"Itu cara yang benar untuk memikirkannya," katanya. "Optimasi biaya bukan tentang memotong. Ini tentang tidak membayar untuk hal-hal yang tidak menciptakan nilai."

Maya menyematkan dokumen itu ke wiki perusahaan.

Di bab berikutnya: tingkat database mendapat perlakuan yang sama, dan Tom menemukan satu tempat di mana dia sebenarnya kurang berinvestasi.
