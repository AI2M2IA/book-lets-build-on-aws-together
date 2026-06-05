# Bab 20: Model Pekerja Lepas

Fungsi notifikasi pesanan berjalan tepat satu kali per pesanan. Di antara pesanan, fungsi itu tidak melakukan apa-apa. Selama tujuh belas jam pada hari Selasa, tidak ada pesanan masuk. Selama tujuh belas jam itu, fungsi tersebut tidak memerlukan biaya apa pun. Tidak ada sepeser pun. Tidak ada server yang menganggur, tidak ada instance yang menunggu, tidak ada kapasitas cadangan yang terbuang sia-sia. Fungsi itu ada. Ia hanya tidak berjalan.

Fan-out SNS/SQS bekerja dengan baik. Layanan analitik, layanan notifikasi, dan layanan email masing-masing mengambil pesan dari antrean SQS mereka sendiri.

Namun Priya memperhatikan sesuatu.

"Layanan email," katanya. "Berapa banyak email yang kita kirim per jam?"

Leo memeriksa metrik. "Rata-rata 400. Puncak sekitar 1.200 pada malam Jumat."

"Dan instance EC2 yang menjalankan layanan email — berapa lama ia berjalan?"

"Selalu. 24/7."

"Bahkan pukul 3 pagi saat kita tidak mengirim email sama sekali?"

Hening.

"Kita membayar untuk komputer yang duduk diam tidak melakukan apa-apa," kata Leo.

"Berapa jam per hari?"

Hening lagi.

"Sekitar 18."

Tom kini sangat memperhatikan.

**Server Bukan Selalu Jawabannya**

Instance EC2 bersifat permanen. Kamu menyalakannya dan ia berjalan sampai kamu menghentikannya — 24 jam sehari, 7 hari seminggu, terlepas dari penggunaan sebenarnya. Untuk server web-mu (yang menangani lalu lintas setiap jam), itu benar. Untuk layanan email (yang mengirim email secara burst lalu menganggur berjam-jam), itu boros.

Auto Scaling Group dapat menskalakan layanan email ke satu instance saat jam tidak sibuk. Namun satu instance tetap berjalan terus-menerus.

Bagaimana jika kode hanya berjalan saat ada pekerjaan yang harus dilakukan?

Itulah premis dari **komputasi serverless**.

**AWS Lambda: Kode Tanpa Server**

**AWS Lambda** memungkinkan kamu menjalankan kode sebagai respons terhadap event tanpa perlu menyediakan atau mengelola server. Kamu mengunggah sebuah fungsi, menentukan apa yang memicunya, dan Lambda menjalankannya ketika pemicu tersebut aktif.

Sebuah fungsi Lambda:

- Tidak memiliki state yang persisten (setiap invokasi berdiri sendiri)
- Berjalan hingga 15 menit per invokasi
- Menskalakan secara otomatis dari 0 hingga ribuan invokasi bersamaan
- Ditagih hanya saat berjalan (per 1 ms eksekusi, dibulatkan ke atas, per GB memori yang dialokasikan)

Saat tidak ada pemicu, Lambda tidak mengeluarkan biaya. Saat pemicu aktif, Lambda berjalan dan menagih biaya. Saat 10.000 pemicu aktif secara bersamaan, Lambda menjalankan 10.000 invokasi bersamaan. Penskalaan berjalan otomatis dan hampir instan.

**Pemicu Event: Apa yang Membangunkan Lambda**

Fungsi Lambda tidak berjalan sendiri — mereka merespons event. Pemicu umum meliputi:

- **Antrean SQS**: Memproses pesan dari antrean. Lambda melakukan polling antrean dan memanggil fungsi dengan batch pesan.
- **API Gateway**: Permintaan HTTP masuk. API Gateway memicu Lambda. Lambda menghasilkan respons.
- **Event S3**: Sebuah file diunggah ke S3. Lambda memprosesnya (mengubah ukuran gambar, mengurai CSV, memvalidasi dokumen).
- **SNS**: Sebuah pesan dipublikasikan ke topik. Lambda diberi notifikasi.
- **DynamoDB Streams**: Sebuah record di DynamoDB berubah. Lambda memproses perubahan tersebut.
- **CloudWatch Events (EventBridge)**: Event terjadwal (seperti cron job) berjalan pada waktu yang ditentukan.
- **ALB**: Permintaan HTTP tiba di load balancer. Lambda dapat menangani rute tertentu.

Untuk Nimbus, layanan email menjadi fungsi Lambda yang dipicu oleh antrean SQS-nya. Saat pesan tiba di antrean, Lambda dipanggil dengan konten pesan, mengirim email melalui SES (Simple Email Service), lalu selesai.

Nol server. Nol waktu menganggur. Nol biaya saat menganggur.

**Masalah Cold Start**

Fungsi Lambda berjalan di **lingkungan eksekusi** — kontainer kecil yang terisolasi. Saat sebuah fungsi dipanggil:

1. AWS memeriksa apakah lingkungan eksekusi yang hangat tersedia (salah satu yang baru-baru ini menangani invokasi)
2. Jika hangat: fungsi langsung berjalan
3. Jika dingin: AWS menginisialisasi lingkungan eksekusi baru — mengunduh kode-mu, memulai runtime, menjalankan kode inisialisasi — kemudian menjalankan fungsi

Sebuah **cold start** menambahkan latensi 100ms hingga beberapa detik tergantung pada runtime (Java dan .NET memiliki cold start lebih lama dibanding Python dan Node.js) dan ukuran paket kode-mu.

Untuk pemrosesan asinkron (pengiriman email, pengubahan ukuran gambar), cold start tidak terlihat oleh pengguna.

Untuk API sinkron (permintaan HTTP di mana pengguna menunggu respons), cold start dapat menyebabkan respons yang kadang-kadang lambat.

**Mitigasi**:

- **Provisioned concurrency**: Pra-panaskan sejumlah lingkungan eksekusi yang ditentukan. Selalu siap. Kamu membayar untuk ini bahkan saat tidak memproses permintaan.
- **Ukuran paket yang lebih kecil**: Kode yang lebih kecil diinisialisasi lebih cepat.
- **Invokasi pemanasan**: Ping terjadwal untuk menjaga fungsi tetap hangat (pendekatan umum namun kurang elegan).
- **Pilih runtime yang tepat**: Python dan Node.js cold start lebih cepat dibanding Java.

**Harga Lambda: Mengapa Tom Tersenyum**

Harga Lambda memiliki dua komponen:

1. **Biaya permintaan**: $0,20 per juta invokasi
2. **Biaya durasi**: $0,0000166667 per GB-detik (memori yang dialokasikan × detik berjalan)

Satu juta permintaan pertama per bulan gratis (selalu, tidak hanya di tahun pertama).

Tom menghitung untuk layanan email:

- 1.200 email per hari × 30 hari = 36.000 invokasi per bulan
- Setiap invokasi membutuhkan ~2 detik pada memori 256MB
- Durasi: 36.000 × 2 × 0,25GB × $0,0000166667 = $0,30/bulan
- Permintaan: 36.000 << 1.000.000 (tier gratis) = $0,00/bulan

Instance EC2 untuk layanan email: $18/bulan.

Tom diam sejenak. Kemudian: "Kita harus melakukan ini untuk semuanya."

**Keunggulan dan Keterbatasan Lambda**

Lambda sangat cocok untuk:

- **Pemrosesan berbasis event**: Merespons event (unggahan file, pesan antrean, tugas terjadwal)
- **Tugas berdurasi singkat**: Pemrosesan yang selesai jauh di bawah 15 menit
- **Lalu lintas yang tidak menentu dan tidak terduga**: Lambda menskalakan dari 0 hingga ribuan secara instan — tanpa pra-provisioning
- **Operasi yang jarang dilakukan**: Laporan yang berjalan pukul 2 pagi setiap hari. Pekerjaan pembersihan yang berjalan setiap minggu.
- **Kode penghubung**: Fungsi kecil yang memindahkan data antar layanan

Lambda kurang cocok untuk:

- **Proses berdurasi panjang**: Batas 15 menit adalah dinding yang keras
- **Aplikasi stateful**: Fungsi Lambda stateless berdasarkan desain — setiap invokasi berdiri sendiri
- **API berthroughput tinggi dan berlatensi rendah**: Cold start dapat menyebabkan lonjakan latensi; provisioned concurrency mengurangi ini tetapi menambah biaya
- **Aplikasi yang membutuhkan koneksi persisten**: Lambda tidak mudah mempertahankan pool koneksi database yang berumur panjang (meskipun alat pooling koneksi seperti RDS Proxy membantu)
- **Server web tradisional**: Mungkin, tetapi bukan pilihan yang paling natural

"Jadi Lambda bukan pengganti EC2," kata Maya. "Ia adalah alat berbeda untuk pekerjaan yang berbeda."

"API web Nimbus tetap di EC2 atau ECS," konfirmasi Leo. "Layanan email, pengubah ukuran gambar, generator laporan harian, pembersih log — itu semua pindah ke Lambda."

**Filosofi Serverless**

Lambda adalah bagian dari konsep yang lebih luas: **serverless** — membangun aplikasi di mana kamu tidak mengelola server, hanya kode.

Stack Nimbus yang sepenuhnya serverless mungkin terlihat seperti:

- API Gateway + Lambda (menggantikan EC2 dengan server web)
- DynamoDB (menggantikan RDS — juga serverless, tanpa manajemen server)
- S3 (aset statis — secara inheren serverless)
- SNS + SQS (pesan — serverless)
- Lambda (semua pemrosesan latar belakang)

Daya tariknya: kamu menulis kode; AWS mengelola segalanya. Tidak ada patching, tidak ada konfigurasi penskalaan, tidak ada perencanaan kapasitas.

Realitanya: serverless memiliki kompleksitas operasional tersendiri — debugging fungsi Lambda yang terdistribusi, mengelola cold start, memahami batas konkurensi. Ini tidak lebih sederhana, hanya berbeda.

## Kekuatan dan Keterbatasan

**Mengapa Lambda kuat**:

- Bayar per penggunaan sebenarnya — nol biaya saat menganggur
- Penskalaan otomatis tanpa konfigurasi
- Tidak ada server untuk di-patch atau dirawat
- Tier gratis yang murah hati (1 juta permintaan per bulan, gratis selamanya)
- Integrasi erat dengan layanan AWS lainnya

**Di mana ini menjadi rumit**:

- Cold start nyata dan membutuhkan penanganan cermat untuk beban kerja yang sensitif terhadap latensi
- Batas eksekusi 15 menit mengecualikan tugas berdurasi panjang
- Debugging lebih sulit — tidak ada server persisten untuk di-SSH
- Desain stateless mengharuskan semua state dieksternalisasi (database, cache, S3)
- Batas konkurensi (default 1.000 eksekusi bersamaan per akun) dapat membatasi pada skala besar
- Fungsi Lambda yang terhubung ke VPC memiliki latensi tambahan dan masalah cold start

## Ringkasan

- **AWS Lambda** menjalankan kode sebagai respons terhadap event tanpa mengelola server.
- **Bayar per penggunaan**: ditagih per invokasi dan per 1 ms eksekusi (dibulatkan ke atas). Nol biaya saat menganggur.
- Menskalakan secara otomatis dari 0 hingga ribuan invokasi bersamaan.
- **Cold start**: latensi inisialisasi saat tidak ada lingkungan eksekusi yang hangat. Dikurangi dengan provisioned concurrency atau runtime yang ringan.
- Terbaik untuk: beban kerja berbasis event, berdurasi singkat, tidak menentu, atau jarang.
- Tidak ideal untuk: tugas berdurasi panjang, aplikasi stateful, API berthroughput tinggi berlatensi rendah tanpa provisioned concurrency.
- **Serverless** adalah filosofi desain — kamu mengelola kode, bukan infrastruktur.

## Tips Ujian

*Domain SAA-C03: Merancang Arsitektur yang Tangguh (Domain 2, Tugas 2.1)*

- **Lambda + S3**: Pola klasik — file diunggah ke S3 memicu Lambda untuk pemrosesan (pembuatan thumbnail, pemindaian virus, transformasi data). Tidak diperlukan server.
- **Lambda + SQS**: Lambda melakukan polling SQS dan memproses batch. SQS menyediakan mekanisme retry/DLQ. Lambda menyediakan pemrosesan.
- **Lambda + API Gateway**: API HTTP serverless. API Gateway menangani routing, autentikasi, throttling. Lambda menangani logika bisnis.
- **Sinyal cold start**: "lonjakan latensi pada permintaan pertama," "waktu respons tidak konsisten" → cold start. Solusi: provisioned concurrency (berbayar), paket lebih kecil, runtime lebih ringan.
- **Batas eksekusi**: Maksimum 15 menit. Memori maksimum 10GB. Penyimpanan sementara /tmp 512MB secara default (dapat dikonfigurasi hingga 10GB). Batas-batas ini muncul dalam skenario ujian.
- **Konkurensi Lambda**: Default 1.000 eksekusi bersamaan per akun (dapat ditingkatkan). **Reserved concurrency**: menjamin fungsi mendapatkan jumlah eksekusi tertentu; mencegah fungsi lain menggunakannya. **Provisioned concurrency**: pra-panaskan sejumlah lingkungan eksekusi.
- **Event source mapping**: Fitur Lambda yang menghubungkan SQS/DynamoDB Streams/Kinesis ke Lambda. Lambda melakukan polling sumber dan mem-batch record.

## Latihan

**Latihan 1 — Mengingat Kembali**

Jelaskan masalah cold start. Pada jenis aplikasi apa cold start paling bermasalah? Pada jenis apa cold start dapat diterima?

*(Petunjuk: Bandingkan API real-time (pengguna menunggu respons) dengan pekerjaan latar belakang asinkron (pengguna sudah mendapat konfirmasi dan melakukan hal lain).)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan menerima gambar produk dari pemasok mereka melalui bucket S3. Setiap gambar perlu diubah ukurannya menjadi empat dimensi standar (thumbnail, kecil, sedang, besar) dan disimpan kembali di S3. Volumenya tidak terduga — beberapa hari 10 gambar, beberapa hari 100.000. Pemrosesan harus selesai dalam 10 menit per gambar. Biaya harus diminimalkan.

Arsitektur mana yang PALING memenuhi persyaratan ini?

A) Instance EC2 dalam Auto Scaling Group yang memantau bucket S3 dengan long polling  
B) Notifikasi event S3 yang memicu fungsi Lambda untuk mengubah ukuran gambar dan menyimpan hasilnya di S3  
C) Task ECS Fargate yang dipicu oleh antrean SQS, dengan event S3 yang mempublikasikan ke antrean  
D) Instance EC2 khusus dengan cron job yang memeriksa S3 setiap menit untuk gambar baru

**Petunjuk 1**: Volume yang tidak terduga menguntungkan penskalaan-ke-nol. Opsi mana yang melakukan itu?

**Petunjuk 2**: 10 menit per gambar berada dalam batas 15 menit Lambda. Periksa apakah pekerjaan pengubahan ukuran gambar sesuai dengan batasan Lambda.

**Petunjuk 3**: Instance EC2 khusus yang berjalan 24/7 mahal dan tidak menskalakan.

**Jawaban**: B

**Penjelasan**: Notifikasi event S3 memicu Lambda saat gambar diunggah. Lambda mengubah ukuran gambar menjadi empat dimensi dan menyimpan hasilnya di S3. Lambda menskalakan dari 0 hingga ribuan invokasi bersamaan secara otomatis, menangani volume yang tidak terduga tanpa pra-provisioning. Nol biaya saat tidak ada gambar yang diproses.

**Mengapa bukan A?** EC2 dalam ASG tidak menskalakan ke nol — minimal satu instance selalu berjalan. Long polling S3 bukan mekanisme event S3 yang native. Biaya lebih tinggi dibanding Lambda untuk beban kerja yang tidak menentu.

**Mengapa bukan C?** ECS Fargate berfungsi, tetapi lebih kompleks (membutuhkan manajemen kontainer, ECR, definisi task) dan memiliki latensi cold start yang sedikit lebih tinggi dibanding Lambda untuk beban kerja yang tidak menentu. Lambda lebih sederhana untuk kasus penggunaan ini.

**Mengapa bukan D?** Instance EC2 khusus adalah titik kegagalan tunggal, tidak menskalakan, berjalan 24/7, dan pendekatan berbasis cron memiliki lag deteksi hingga 60 detik.

*Domain SAA-C03: Merancang Arsitektur yang Tangguh — Tugas 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin membuat laporan harian pukul 5 pagi dengan 10 restoran teratas berdasarkan volume pesanan dari hari sebelumnya. Laporan dibuat dari data DynamoDB, diformat sebagai PDF, disimpan di S3, dan dikirim email ke semua mitra restoran.

Rancang pipeline berbasis Lambda yang lengkap untuk ini. Apa yang memicu Lambda? Apa yang terjadi jika pembuatan PDF membutuhkan 12 menit? Bagaimana jika ada 5.000 mitra restoran dan pengiriman email ke semua membutuhkan waktu? Apakah kamu akan menggunakan satu Lambda atau beberapa?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih mengomposisi Lambda dengan layanan lain.)*

## Adegan Pasca-Kredit

Tom meninjau tagihan di akhir bulan.

Layanan email: sudah hilang dari tagihan EC2.
Pekerjaan pengubahan ukuran gambar: hilang.
Tugas pembersihan malam: hilang.
Laporan analitik harian: hilang.

Total tagihan Lambda untuk bulan itu: $4,23.

"Empat dolar," kata Tom.

"Dan dua puluh tiga sen," tambah Leo dengan membantu.

Tom melihat tagihan bulan sebelumnya, ketika layanan-layanan itu semua ada di instance EC2.

"Kita membayar $187 untuk beban kerja yang sama itu."

"Lambda tidak menagih untuk waktu menganggur," kata Leo. "Dan sebagian besar layanan itu menganggur 90% dari waktunya."

Tom menatap layar untuk waktu yang lama.

"Aku mencabut semua yang aku katakan tentang serverless sebagai kata hype," katanya.

Di bab berikutnya: kontainer pengiriman yang membuat server mana pun terasa seperti rumah.
