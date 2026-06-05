# Babat Chapter 29: Tagihan Database

Audit penyimpanan Tom telah mengidentifikasi $8.800 dalam pemborosan. Dia beralih ke item item baris database.

RDS Aurora: $647/bulan.
RDS PostgreSQL (replika baca): $340/bulan.
ElastiCache: $183/bulan.

Total tingkatan database: $1.170/bulan.

"Biarkan saya memahami masing-masing sebelum membuat keputusan apa pun," katanya. "Karena database bukanlah tempat untuk menghemat uang dengan mengambil jalan pintas."

Ini adalah nasihat yang bijak. Konfigurasi database yang salah yang menyebabkan kehilangan data atau degradasi kinerja akan jauh lebih mahal daripada penghematan.

Bayangkan sebuah database seperti mesin engin mobil. Anda dapat menghemat uang pada mobil dengan beralih ke bahan bakar yang lebih murah, menyesuaikan tekanan ban, dan menghilangkan berat yang tidak perlu dari bagasi. Tetapi jika Anda mencoba menghemat uang dengan melewati penggantian oli, Anda berisiko membuat mesin macet — dan mesin yang macet akan jauh lebih mahal daripada penghematan bahan bakar apa pun. Audit yang akan dijalankan Tom mengikuti logika yang sama: temukan pemborosan di bagasi dan tangki bahan bakar, dan biarkan mesin saja sampai Anda tahu persis apa yang Anda lakukan.

**Memahami Beban Kerja Database Anda Terlebih Dahulu**

Optimasi biaya dalam database membutuhkan pemahaman tentang beban kerja sebelum menyentuh apa pun.

Pertanyaan kunci:

- Apa penggunaan CPU rata-rata dan puncak?
- Apa rasio baca/tulis?
- Apakah penyimpanan tumbuh, stabil, atau menurun?
- Apakah replika baca digunakan?
- Apakah instans kurang diperkirakan (menyebabkan perlambatan) atau terlalu diperkirakan (membayar kapasitas yang tidak terpakai)?

Tom menarik CloudWatch metrik untuk semua tiga layanan database selama 30 hari terakhir:

**Klaster Aurora:**

- Penggunaan CPU rata-rata: 18% (puncak: 67% pada hari Jumat malam)
- Rasio baca/tulis: 14:1 (baca-berat)
- Penyimpanan: 180GB (pertumbuhan ~5GB/bulan)

**Replika baca (RDS PostgreSQL, terpisah dari Aurora):**

- Ini adalah dua replika baca RDS warisan yang dibuat sebelum migrasi Aurora, masih berjalan.
- Penggunaan CPU rata-rata per masing-masing: 2 per hari. Penggunaan CPU rata-rata: 3%.

"Mengapa ini masih berjalan?" tanya Tom.

Leo melihat tanggal pembuatan instans. "Mereka dibuat selama migrasi Aurora untuk fallback. Kami lupa untuk menghapusnya."

Momen—ketika sesuatu yang mahal telah berjalan selama berbulan-bulan tanpa digunakan—adalah momen yang familiar di lingkungan cloud.

Replika tersebut dihentikan. Penghematan bulanan: $340.

**RDS Reserved Instances: Versi Database**

Seperti EC2, RDS menawarkan Reserved Instances untuk penggunaan yang berkomitmen.

Untuk Aurora dengan Serverless v2, Reserved Instances tidak berlaku secara langsung—Serverless v2 menskalakan secara dinamis dan Anda membayar per ACU-jam. Namun, jika Anda menggunakan konfigurasi instans Aurora tetap (tidak Serverless), Reserved Instances dapat menghemat 30-60%.

Tom meninjau instans Aurora yang dialokasikan (penulis dan satu pembaca):

- Instans penulis: db.r6g.large, On-Demand = $0,26/jam = $190/bulan
- Instans pembaca: db.r6g.large, On-Demand = $0,26/jam = $190/bulan

Reserved Instances 1 tahun untuk keduanya: ~$108/bulan masing-masing. Penghematan tahunan: $984.

"Tunggu," kata Leo. "Kami bermigrasi ke Aurora Serverless v2 di Bab 24. Mengapa Tom melihat On-Demand untuk instans yang dialokasikan?"

Pencocokan yang bagus. Mari kita akurat: Pengguna penulis Aurora utama Nimbus menggunakan Serverless v2. Pembaca (untuk replika baca) juga menggunakan Serverless v2. Serverless v2 tidak memiliki Reserved Instances tradisional—Anda membayar per ACU-jam.

Untuk tim yang menjalankan instans Aurora tetap (tidak Serverless), Reserved Instances adalah penghematan yang signifikan. Untuk beban kerja Serverless v2, penghematan datang dari sifat penskalaan otomatis layanan itu sendiri—Anda tidak membayar untuk kapasitas yang tidak terpakai.

**DynamoDB: On-Demand vs. Dialokasikan**

Di Bab 9, kami memperkenalkan dua mode kapasitas DynamoDB: on-demand dan dialokasikan.

Nimbus telah menjalankan DynamoDB dalam mode on-demand sejak awal. Pada lalu lintas rendah, ini benar—on-demand lebih mahal per permintaan tetapi tidak memiliki biaya minimum.

Sekarang, dengan 18 bulan data lalu lintas di CloudWatch, Tom dapat melihat pola.

Kapasitas unit baca rata-rata per hari: 45.000
Kapasitas unit tulis rata-rata per hari: 12.000
Puncak hari (Jumat): 180% dari volume permintaan DynamoDB rata-rata (ElastiCache menyerap ~95% dari lonjakan volume baca, sehingga DynamoDB hanya melihat sebagian kecil dari volume lonjakan 25x)

**Harga on-demand:** $1,25 per juta permintaan tulis, $0,25 per juta permintaan baca.
**Harga dialokasikan:** $0,00065 per unit kapasitas tulis per jam, $0,00013 per unit kapasitas baca per jam.

Tom menghitung titik impas: kapasitas dialokasikan menjadi lebih murah ketika Anda menggunakannya secara konsisten sehingga Anda tidak membayar premi on-demand selama periode tidak aktif.

Dengan 18 bulan data yang menunjukkan pola harian yang konsisten, kapasitas dialokasikan dengan **DynamoDB Auto Scaling** adalah pilihan yang tepat:

- Atur kapasitas minimum pada 60% dari beban rata-rata
- Atur maksimum pada 250% dari rata-rata (menangani lonjakan Jumat)
- Auto Scaling menyesuaikan kapasitas dialokasikan antara batas-batas ini

Biaya bulanan DynamoDB: turun dari $340 (on-demand) menjadi $230 (dialokasikan dengan auto scaling). Pengurangan 32%.

"Tetapi jika kita terlalu memperkirakan," tanya Leo, "kita membayar untuk kapasitas yang tidak terpakai."

"Itulah risikonya," kata Tom. "Dengan Auto Scaling, kita menetapkan minimum tinggi untuk menghindari throttling, dan biarkan AWS mengelola dalam rentang kita."

"Dan jika pola lalu lintas kita berubah secara signifikan?"

"Kemudian kita menyesuaikan batas-batasnya. Kami meninjau ini secara triwulanan."

**ElastiCache: Penyesuaian Ukuran dan Node yang Disiapkan Sebelumnya**

Tagihan ElastiCache: $183/bulan. Satu cache.r6g.large instance Redis dalam setiap AZ (dua node, primer + replika).

Metrik CloudWatch menunjukkan:

- Penggunaan memori rata-rata: 34%
- Puncak: 58%

Instans tersebut terlalu banyak dialokasikan. Cache.r6g.medium kemungkinan akan menangani beban dengan ruang kepala.

Memindahkan dari r6g.large (2 node × $0,127/jam) ke r6g.medium (2 node × $0,065/jam):

- Penghematan bulanan: $113 → tunggu.

Perhitungan sebenarnya: large = 2 × $0,127 × 730 jam = $185/bulan. Medium = 2 × $0,065 × 730 = $95/bulan. Penghematan: $90/bulan.

Tom menguji instance medium dalam staging selama dua minggu di bawah beban. Penggunaan memori mencapai 71%. Cukup dekat dengan batas sehingga dia merasa tidak nyaman.

Dia mencoba cache.r6g.large tetapi dengan Node yang Disiapkan Sebelumnya (komitmen 1 tahun): dari On-Demand $185 menjadi Disiapkan Sebelumnya $120/bulan. Penghematan: $65/bulan tanpa mengubah jenis instans.

"Terkadang menyesuaikan ukuran ke instance yang lebih kecil berisiko terjadinya insiden kinerja,” katanya. “Node yang Disiapkan Sebelumnya memberi kami penghematan yang sama dengan risiko yang lebih rendah.”

**Penyimpanan Cadangan RDS: Trade-off Penyimpanan**

Cadangan RDS otomatis disimpan di S3 (tanpa biaya tambahan untuk penyimpanan hingga 100% dari ukuran database Anda). Retensi defaultnya adalah 7 hari.

Untuk Nimbus’s 180GB Aurora database, 7 hari cadangan sudah cukup — mereka telah dapat memulihkan dari cadangan dalam jendela tersebut dalam pengujian.

Tetapi Tom memperhatikan: mereka juga memiliki snapshot manual dari setiap penyebaran signifikan, disimpan selamanya.

23 snapshot manual, total 4,1TB penyimpanan snapshot.
Biaya: $0,095/GB/bulan untuk cadangan Aurora = $389/bulan dalam penyimpanan snapshot manual.

Mereka menyimpan 3 snapshot manual terakhir per lingkungan (produksi, staging). Menghapus sisanya.
Penghematan: $350/bulan.

"Kami membayar $350 sebulan untuk asuransi yang tidak pernah kami gunakan,” kata Leo.

"Kami membayar untuk ketenangan pikiran,” koreksi Tom. “Pertanyaannya adalah: berapa banyak ketenangan pikiran yang layak $350 per bulan?”

“Dengan rencana pemulihan bencana yang tepat,” kata Priya, “Anda dapat memperoleh ketenangan pikiran yang sama dari 7 hari cadangan otomatis dan 3 snapshot manual.”

“Setuju. Sekarang.”

**Ringkasan Optimalisasi Database**

| Layanan                                           | Sebelum     | Setelah    | Penghematan Bulanan |
|---------------------------------------------------|------------|----------|--------------------|
| RDS Read Replicas (tidak digunakan)                        | $340       | $0       | $340                |
| Aurora (Node yang Disiapkan Sebelumnya)                       | $190       | $120     | $70                 |
| DynamoDB (On-Demand → Provisioned + Auto Scaling) | $340       | $230     | $110                |
| ElastiCache (Node yang Disiapkan Sebelumnya)                      | $185       | $120     | $65                 |
| Aurora snapshot manual                           | $389       | $39      | $350                |
| **Total**                                         | **$1.444** | **$509** | **$935/bulan**       |

$935 per bulan dalam penghematan database. $11.220 per tahun.

Tom menempatkan angka ini di sebelah penghematan penyimpanan ($6.200/tahun) dan penghematan Rencana Penyimpanan ($14.200/tahun).

Dampak optimalisasi total: $31.620/tahun.

"Itu tiga insinyur junior,” kata Maya.

"Atau satu senior,” kata Priya.

"Atau dua belas bulan eksperimen,” kata Leo.

Ketiganya benar.

## Kekuatan dan Batasan

**DynamoDB Provisioned dengan Auto Scaling**:

- Lebih murah daripada on-demand untuk beban kerja yang dapat diprediksi dan konsisten
- Auto Scaling menangani variabilitas tanpa dialokasikan secara permanen
- Membutuhkan pemantauan untuk memastikan batas kapasitas tetap sesuai

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Penghematan yang signifikan untuk beban kerja yang stabil dan jangka panjang
- Komitmen terkunci — jika kebutuhan Anda berubah, Anda telah membayar untuk kapasitas yang tidak terpakai
- Pasar RI memungkinkan penjualan Node yang Disiapkan Sebelumnya RDS yang tidak terpakai (tidak seperti Convertible, yang tidak dapat dijual)

**Prinsip Umum**:

- Selalu pahami penggunaan sebelum mengoptimalkan
- Sumber daya yang tidak terpakai (seperti replica baca warisan) adalah optimalisasi dengan pengembalian tertinggi
- Penyesuaian ukuran memerlukan validasi dalam staging sebelum diterapkan ke produksi
- Harga yang Disiapkan Sebelumnya memerlukan kepercayaan pada stabilitas beban kerja

## Ringkasan

- **Audit pertama**: Tarik metrik CloudWatch sebelum membuat perubahan database apa pun.
- **Hapus sumber daya yang tidak digunakan**: Replica baca yang tidak terpakai, database yang menganggur, dan instance pengujian yang tidak lagi dibutuhkan.
- **DynamoDB On-Demand vs Provisioned**: On-Demand untuk lalu lintas yang tidak terduga; Provisioned + Auto Scaling untuk pola yang konsisten.
- **ElastiCache Node yang Disiapkan Sebelumnya**: Seperti EC2 Reserved Instances untuk Redis/Memcached. Penghematan 30-50% untuk beban kerja yang stabil.
- **Manajemen Snapshot RDS**: Simpan hanya snapshot yang Anda butuhkan. Snapshot manual disimpan selamanya kecuali dihapus.
- **Sesuaikan ukuran dengan hati-hati**: Penyesuaian ukuran database berisiko menyebabkan insiden kinerja. Uji dalam staging, validasi di bawah beban.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Biaya yang Dioptimalkan (Domain 4, Tugas 4.3)*

- **DynamoDB harga mode**: On-Demand = bayar per permintaan (biaya per unit lebih tinggi, tanpa batas minimum). Provisioned = bayar per unit kapasitas per jam (biaya per unit lebih rendah, harus dialokasikan kapasitas). **DynamoDB Auto Scaling** menyesuaikan kapasitas provisioned secara otomatis.
- **RDS Reserved Instances**: Tersedia untuk semua jenis mesin RDS. Deployment Multi-AZ dapat menggunakan Reserved Instances (Anda berkomitmen untuk Multi-AZ). Istilah 1 atau 3 tahun.
- **ElastiCache Reserved Nodes**: Komitmen yang sama dengan EC2 Reserved Instances. Diterapkan per node, bukan per kluster.
- **RDS snapshot penyimpanan**: Cadangan otomatis gratis hingga 100% dari ukuran database. Snapshot manual dikenakan biaya per GB per bulan di S3. Skenario ujian: "kurangi biaya penyimpanan RDS" → hapus snapshot manual lama.
- **DynamoDB kapasitas yang di-reserve**: Tersedia untuk DynamoDB juga (diberikan komitmen untuk baca/tulis kapasitas tertentu selama 1 atau 3 tahun dengan diskon). Berbeda dengan provisioned standar — Anda membayar di muka untuk kapasitas di semua tabel DynamoDB Anda di sebuah wilayah.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 menskalakan secara otomatis, ideal untuk beban kerja variabel. Provisioned dengan Reserved Instances lebih murah untuk beban kerja yang stabil dan dapat diprediksi.

## Latihan

**Latihan 1 — Mengingat**

Kapan Anda harus menggunakan kapasitas on-demand DynamoDB versus kapasitas provisioned dengan Auto Scaling? Informasi apa yang Anda butuhkan untuk membuat keputusan tersebut?

*(Petunjuk: Pikirkan tentang apa yang dimaksud dengan "dapat diprediksi" dalam hal data lalu lintas, dan apa risiko yang dihilangkan oleh on-demand yang diperkenalkan oleh provisioned.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan menjalankan tabel DynamoDB untuk papan peringkat game seluler. Lalu lintas puncak sangat berat selama acara musiman (satu minggu per kuartal, 10x lalu lintas normal) tetapi konsisten lainnya. Di luar acara musiman, perusahaan ingin meminimalkan biaya database sambil mempertahankan kinerja.

Strategi kapasitas DynamoDB MANA yang TERBAIK memenuhi persyaratan ini?

A) Kapasitas on-demand untuk menangani puncak musiman tanpa throttling
B) Kapasitas provisioned yang diatur pada tingkat puncak musiman (selalu provisioned untuk 10x lalu lintas)
C) Kapasitas provisioned dengan DynamoDB Auto Scaling, dengan kapasitas maksimum yang ditetapkan untuk puncak musiman
D) Unit kapasitas yang di-reserve untuk periode 3 tahun pada tingkat lalu lintas normal

*(Petunjuk 1: "Lalu lintas yang konsisten kecuali puncak musiman" — mode mana yang menangani keduanya secara efisien?)*

*(Petunjuk 2: "Minimalkan biaya" selama periode non-puncak berarti Anda tidak dapat melakukan over-provisioning untuk 10x sepanjang waktu.)*

*(Petunjuk 3: DynamoDB Auto Scaling dapat menskalakan ke atas untuk acara musiman dan menskalakan ke bawah setelahnya.)*

**Jawaban**: C

**Penjelasan**: Kapasitas provisioned dengan Auto Scaling menskalakan tabel berdasarkan lalu lintas aktual. Selama periode normal, kapasitas berada pada tingkat normal (biaya rendah). Selama acara musiman, Auto Scaling mendeteksi peningkatan lalu lintas dan menskalakan ke tingkat maksimum yang dikonfigurasi (menangani puncak 10x). Setelah acara, ia menskalakan kembali ke bawah. Ini lebih murah daripada on-demand selama periode normal (on-demand lebih mahal per permintaan) dan lebih murah daripada selalu menyediakan untuk 10x.

**Mengapa bukan A?** On-demand menangani puncak tanpa throttling tetapi lebih mahal per permintaan daripada provisioned selama lalu lintas normal yang dapat diprediksi.

**Mengapa bukan B?** Menyediakan pada 10x secara permanen berarti 75% dari kapasitas provisioned tidak terpakai 75% dari waktu — membayar untuk kapasitas yang tidak pernah digunakan.

**Mengapa bukan D?** Unit kapasitas yang di-reserve mengunci Anda pada tingkat lalu lintas normal. Selama acara musiman 10x, Anda akan dibatasi di luar jumlah yang di-reserve, atau Anda perlu menambahkan on-demand di atasnya.

*SAA-C03 Domain: Desain Arsitektur yang Dioptimalkan Biaya — Tugas 4.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang mengevaluasi fitur baru: dasbor analitik restoran yang menampilkan jumlah pesanan waktu nyata, pendapatan per jam, dan demografi pelanggan. Data ini akan menanyai database kira-kira 200 kali per menit (satu kueri per analis per refresh halaman, dengan 10 analis), yang diterapkan.

Saat ini data analitik berada di Athena (S3). Haruskah mereka membangun dasbor di Athena, atau haruskah mereka memuat data ke database? Jika database, database mana (Aurora, DynamoDB, Redshift)?

Pertimbangkan: frekuensi kueri, persyaratan kebaruan data, kompleksitas kueri (agregasi, gabungan), dan biaya per kueri pada volume ini.

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk berlatih pemilihan database untuk beban kerja analitik.)*

## Adegan Pasca Kredit

Tom mempresentasikan ringkasan optimalisasi biaya secara keseluruhan kepada Maya.

Tiga bulan kerja. Penghematan tahunan sebesar $31.620 teridentifikasi. Perubahan sebesar $26.400 telah diimplementasikan.

"Apa sisanya $5.220?" Maya bertanya.

"Optimalisasi yang belum saya yakini," kata Tom. "Konfigurasi Aurora dapat lebih disesuaikan, tetapi saya ingin satu kuartal data lagi sebelum berkomitmen. Dan ada pertanyaan transfer data yang belum saya analisis sepenuhnya."

"Biaya jaringan."

"Ya. Itu berikutnya."

Maya melihat angka-angka itu. "Tom, saya ingin memahami sesuatu. Optimalisasi ini — Anda telah mengerjakannya selama tiga bulan. Itu merupakan bagian yang signifikan dari waktu Anda."

"Sekitar 30%."

"Dan Anda menghemat $26.400 per tahun. Jadi optimalisasi itu membayar dirinya sendiri dalam — apa, empat bulan gaji Anda?"

Tom menatapnya. "Sekitar itu."

"Dan setiap tahun setelahnya, ini adalah penghematan murni."

"Atau investasi ulang murni," katanya. "Efeknya sama."

Maya mengangguk. "Inilah yang saya ingin kamu lakukan. Bukan hanya pada penyimpanan dan database – pada semuanya. Jadikan optimasi biaya sebagai fungsi berkelanjutan dari peranmu."

Tom belum pernah mendengar deskripsi pekerjaannya seperti ini. Dia merasa deskripsi itu akurat dan memuaskan.

Pada bab berikutnya: kategori biaya terakhir yang tersisa – dan yang mengejutkan hampir semua orang.
