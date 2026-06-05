# Lampiran A: Referensi Cepat Layanan AWS

Setiap layanan yang tercakup dalam buku ini, dalam urutan diperkenalkan. Gunakan ini sebagai referensi studi dan pencarian cepat selama persiapan ujian.

---

## Komputasi

**EC2 — Elastic Compute Cloud** *(Bab 4)*

Mesin virtual di cloud. Anda memilih jenis instance (CPU, memori, penyimpanan), sistem operasi, dan wilayah. Anda membayar per jam (On-Demand), per komitmen (Reserved Instances / Savings Plans), atau per slot kapasitas cadangan (Spot). Primitive komputasi dasar.

Konsep kunci: AMI (Amazon Machine Image), jenis instance (t3, m6g, r6g, keluarga c6g), pasangan kunci, profil instance, kelompok penempatan.

Sinyal ujian: Ketika sebuah skenario membutuhkan komputasi yang persisten, status, atau berjalan lama — EC2 atau ECS. Ketika sebuah skenario membutuhkan durasi pendek, pemicu peristiwa, atau komputasi tanpa biaya idle — Lambda.

---

**Auto Scaling + Load Balancer Aplikasi** *(Bab 7)*

Kelompok Skala Otomatis (ASG) menambahkan dan menghapus instance EC2 berdasarkan beban. Load Balancer Aplikasi (ALB) mendistribusikan lalu lintas ke instance dan merutekan berdasarkan jalur atau host. Bersama-sama mereka membentuk lapisan penskalaan horizontal.

Konsep kunci: Templat peluncuran, kebijakan penskalaan (target pelacakan, langkah, terjadwal), pemeriksaan kesehatan, kelompok target ALB, aturan pendengar, perutean berbobot.

Sinyal ujian: "Tangani beban variabel" atau "ketersediaan tinggi di seluruh AZ" → ASG + ALB.

---

**Lambda** *(Bab 20)*

Fungsi serverless. Anda menulis kode; AWS menjalankannya sebagai respons terhadap peristiwa. Tidak ada server yang perlu dikelola. Anda membayar per panggilan dan per milidetik eksekusi. Skala secara otomatis ke ribuan eksekusi bersamaan.

Konsep kunci: Sumber peristiwa (API Gateway, S3, SQS, EventBridge, Kinesis), peran IAM, batas konkurensi, konkurensi yang direservasi dan disediakan, *cold start*, Lapisan, durasi maksimum 15 menit.

Sinyal ujian: "Serverless," "berbasis peristiwa," "tugas durasi pendek," "tidak ada biaya idle" → Lambda.

---

**ECS — Elastic Container Service** *(Bab 21)*

Menjalankan kontainer Docker di AWS. Dua jenis peluncuran: EC2 (Anda mengelola host) dan Fargate (AWS mengelola host). ECS mengelola definisi tugas, layanan, penjadwalan klaster, dan integrasi dengan load balancer dan penemuan layanan.

Konsep kunci: Definisi tugas, layanan ECS, jenis peluncuran Fargate vs. EC2, ECR (pustaka kontainer), peran IAM tugas, penskalaan otomatis layanan.

Sinyal ujian: "Kerangka kerja kontainer," "mikroservis," "Docker di AWS" → ECS (biasanya Fargate untuk kontainer serverless).

---

**EKS — Elastic Kubernetes Service** *(Bab 21)*

Kubernetes yang dikelola. AWS menjalankan *control plane*; Anda menjalankan node pekerja (EC2 atau Fargate). Gunakan EKS ketika tim Anda sudah menggunakan Kubernetes atau memiliki beban kerja yang memerlukan fitur Kubernetes-spesifik.

Sinyal ujian: "Kubernetes," "perlu memigrasikan beban kerja K8s yang ada" → EKS. "Hanya perlu kontainer tanpa overhead K8s" → ECS.

---

## Penyimpanan

**S3 — Simple Storage Service** *(Bab 5)*

Penyimpanan objek. Kapasitas tidak terbatas, daya tahan 99,999,999,99% (eleven nines). Menyimpan file sebagai objek dalam *bucket*. *Bucket* hidup di wilayah. Objek dapat berkisar dari 0 byte hingga 5TB.

Konsep kunci: Kebijakan *bucket*, ACL objek, versi, hosting situs statis, URL yang diautentikasi, unggahan multipart, Transfer Acceleration, kelas penyimpanan (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Sinyal ujian: "Simpan dan ambil file," "aset statis," "cadangan," "danau data" → S3. Kelas penyimpanan yang tepat bergantung pada frekuensi akses dan kecepatan pengambilan.

---

**EBS — Elastic Block Store** *(Bab 6)*

Penyimpanan blok yang terpasang ke instance EC2 tunggal. Berfungsi seperti hard drive. Bertahan secara independen dari siklus hidup instance (Anda dapat mencabut dan memasang kembali). Jenis yang paling umum: gp3 (SSD tujuan umum, default), io2 (IOPS yang dipesan untuk database), st1 (throughput-optimized HDD untuk baca berurutan).

Konsep kunci: Snapshot (incremental, disimpan di S3), enkripsi (KMS), Multi-Attach (io1/io2 hanya), penyediaan IOPS dan throughput.

Sinyal ujian: "Penyimpanan persisten untuk EC2," "penyimpanan database," "membutuhkan akses blok latensi rendah" → EBS.

---

**EFS — Elastic File System** *(Bab 6)*

Sistem file bersama, dapat diakses dari beberapa instance EC2 secara bersamaan. Protokol NFS. Skala secara otomatis. Lebih mahal per GB daripada EBS. Dua kelas penyimpanan: Standar dan Akses Tidak Sering. Intelligent-Tiering secara otomatis memindahkan file antar tingkatan akses berdasarkan aturan usia.

Sinyal ujian: "Sistem file bersama," "beberapa instance EC2 membutuhkan file yang sama," "NFS" → EFS.

---

**Kelas Penyimpanan S3 dan Kebijakan Siklus Hidup** *(Bab 23)*

Kelas Penyimpanan S3 Intelligent-Tiering secara otomatis memindahkan objek antar tingkatan akses berdasarkan frekuensi akses. Kebijakan Siklus Hidup mentransisikan objek antar kelas (Standard → Standard-IA → Glacier) berdasarkan aturan usia. Kelas penyimpanan Glacier memiliki penundaan pengambilan yang berkisar dari menit (Glacier Instant) hingga 12 jam (Glacier Deep Archive).

Sinyal ujian: "Kurangi biaya penyimpanan untuk data yang jarang diakses" → kebijakan siklus hidup, Intelligent-Tiering, atau Glacier.

---

## Database

**RDS — Relational Database Service** *(Bab 8)*

Manajemen database relasional. Mesin yang didukung: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, dan Aurora (mesin eksklusif AWS). AWS menangani pencadangan, patching, failover, dan replikasi. Anda mengelola desain skema, kueri, dan ukuran instance.

Konsep kunci: Penyebaran Multi-AZ (failover otomatis, replikasi sinkron), Replika Baca (asinkron, untuk penskalaan baca), pencadangan otomatis (retensi 1-35 hari), snapshot manual (dipertahankan hingga dihapus), RDS Proxy (pemantauan koneksi).

Sinyal ujian: "Database relasional," "Transaksi ACID," "tugas SQL yang ada" → RDS atau Aurora.

---

**Aurora** *(Bab 24)*

Mesin database relasional AWS, kompatibel dengan MySQL dan PostgreSQL. Mesin penyimpanan terdistribusi yang mereplikasi data di seluruh 3 AZ di 6 salinan. Biasanya 5x lebih cepat daripada MySQL. Aurora Serverless v2 menskalakan kapasitas secara otomatis (diukur dalam ACU - Unit Kapasitas Aurora).

Konsep kunci: Klaster Aurora (penulis + hingga 15 titik akhir pembaca), Database Aurora Global (replika baca lintas wilayah dengan penundaan replikasi < 1 detik), Aurora Serverless v2.

Sinyal ujian: "Database relasional berkinerja tinggi," "kompatibel dengan MySQL/PostgreSQL," "baca global," "tugas variabel" → Aurora.

---

**DynamoDB** *(Bab 9)*

Database NoSQL yang dikelola sepenuhnya. Model kunci-nilai dan dokumen. Menskalakan ke throughput apa pun dengan kinerja milidetik tunggal. Dua mode kapasitas: on-demand (bayar per permintaan) dan provisioned (bayar per unit kapasitas per jam, dengan Auto Scaling).

Konsep kunci: Kunci partisi (diperlukan), kunci pengurutan (opsional), Indeks Sekunder Global (GSI), Indeks Sekunder Lokal (LSI), DynamoDB Streams (penangkapan perubahan data), DynamoDB Accelerator (DAX) — cache berbasis memori, TTL (Waktu untuk Hidup), transaksi.

Sinyal ujian: "Akses berbasis kunci dengan throughput tinggi," "skema fleksibel," "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Bab 10)*

Caching berbasis memori yang dikelola. Dua mesin: Redis (persistent, pub/sub, Lua scripting, struktur data) dan Memcached (cache murni, lebih sederhana, multi-threaded). Digunakan untuk mengurangi beban database dan menyajikan data yang sering dibaca dalam mikrodetik.

Konsep kunci: Pola Cache-Aside, Pola Tulis-Lewat, Kebijakan Evensi, TTL, mode klaster (Redis), Multi-AZ dengan failover otomatis.

Sinyal ujian: "Kurangi beban database," "latensi baca sub-milidetik," "manajemen sesi," "papan peringkat waktu nyata" → ElastiCache Redis.

---

## Jaringan

**VPC — Jaringan Virtual Privat** *(Bab 11)*

Jaringan terisolasi di AWS. Mencakup semua AZ di wilayah. Anda mendefinisikan ruang alamat IP (blok CIDR), membuat subnet (publik atau privat), mengonfigurasi tabel rute, dan mengontrol akses melalui grup keamanan dan NACLs.

Konsep kunci: Subnet publik (rute ke Gateway Internet), subnet privat (rute ke NAT Gateway untuk keluar), Gateway Internet (masuk + keluar ke internet), NAT Gateway (keluar saja untuk instance pribadi), VPC Peering (terhubung dua VPC), VPC Endpoints (terhubung ke layanan AWS tanpa internet).

Sinyal ujian: "Jaringan pribadi di AWS," "isolasi sumber daya dari internet," "kontrol lalu lintas jaringan" → VPC.

---

**Grup Keamanan dan NACLs** *(Bab 15)*

Grup keamanan adalah firewall berbasis status pada tingkat instance — hanya aturan yang diizinkan, lalu lintas yang dikembalikan otomatis. NACLs (Daftar Kontrol Akses Jaringan) adalah firewall berbasis status pada tingkat subnet — memerlukan aturan masuk dan keluar, dievaluasi dalam urutan berdasarkan nomor aturan.

Sinyal ujian: "Blokir IP tertentu dari mengakses subnet" → NACL. "Kontrol lalu lintas ke/dari instance" → grup keamanan.

---

**Route 53** *(Bab 12)*

Layanan DNS AWS dan pendaftar domain. Merutekan lalu lintas internet ke sumber daya AWS dan titik akhir eksternal. Kebijakan perutean: Sederhana, Tertimbang, Latensi-berbasis, Failover, Geolocation, Geoproximity, Multi-nilai Jawaban.

Konsep kunci: Zona yang Dihosting (publik dan privat), jenis rekaman (A, AAAA, CNAME, Alias), pemeriksaan kesehatan, Aliran Lalu Lintas (editor kebijakan visual).

Sinyal ujian: "Perutean DNS," "failover antar wilayah," "rute berdasarkan latensi atau lokasi" → Route 53 dengan kebijakan perutean yang sesuai.

---

**CloudFront** *(Bab 13)*

Jaringan Pengiriman Konten (CDN). Menyimpan konten di lokasi tepi (400+ di seluruh dunia). Mengurangi latensi untuk pengguna akhir. Mengurangi biaya transfer asal melalui caching. Berintegrasi dengan S3, EC2, ALB, dan API Gateway sebagai asal.

Konsep kunci: Distribusi, asal, perilaku (perutean berbasis jalur ke asal), TTL (kontrol cache), invalidasi cache, URL yang ditandatangani dan cookie (kontrol akses), Lambda@Edge dan CloudFront Functions (jalankan kode di tepi), Perisai Asal (kurangi beban asal).

Sinyal ujian: "Latensi global rendah," "cache konten statis," "kurangi beban asal," "melindungi dari DDoS dengan Shield" → CloudFront.

---

**Direct Connect dan VPN** *(Bab 25)*

AWS Direct Connect adalah koneksi jaringan fisik khusus dari pusat data Anda ke AWS. Melewati internet publik. Bandwidth dan latensi yang lebih konsisten. AWS Site-to-Site VPN adalah terowongan terenkripsi di atas internet publik — lebih cepat untuk disiapkan, biaya lebih rendah, tetapi kinerja bervariasi.

Konsep kunci: Antarmuka Virtual (VIF), Gateway Direct Connect (terhubung ke beberapa wilayah), Transit Gateway (topologi hub-and-spoke), redundansi terowongan VPN.

```markdown
Exam signal: “Dedicated private connection to AWS” → Direct Connect. “Encrypted connection, faster setup” → VPN. “Connect multiple VPCs” → Transit Gateway.

---

**VPC Endpoints** *(Bab 30)*

Hubungkan sumber daya pribadi ke layanan AWS tanpa menggunakan internet publik atau NAT Gateway. Gateway Endpoints: gratis, tersedia hanya untuk S3 dan DynamoDB. Interface Endpoints (PrivateLink): berbayar per jam + per GB, tersedia untuk sebagian besar layanan AWS.

Exam signal: “EC2 di subnet pribadi memanggil S3/DynamoDB — mengurangi biaya NAT Gateway” → Gateway Endpoint (gratis). “Koneksi pribadi ke SQS, SSM, Secrets Manager dari subnet pribadi” → Interface Endpoint.

---

## Keamanan dan Identitas

**IAM — Identity and Access Management** *(Bab 3 dan 14)*

Mengontrol siapa yang dapat melakukan apa di akun AWS Anda. Pengguna (kredensial jangka panjang), Grup (pengguna yang berbagi izin), Peran (kredensial sementara untuk layanan dan akses lintas akun), Kebijakan (dokumen JSON yang mendefinisikan aturan izinkan/tolak).

Konsep kunci: Principal, Tindakan, Sumber Daya, Kondisi, tolak eksplisit > izinkan eksplisit > tolak implisit, SCP (Kebijakan Kontrol Layanan di AWS Organizations), Batas Izin, AsumsikanPeran.

Exam signal: IAM terlibat dalam setiap pertanyaan keamanan. Pola kunci: layanan menggunakan peran IAM (bukan pengguna). Akses lintas akun menggunakan asumsi peran. Prinsip paling sedikit hak — berikan hanya apa yang diperlukan.

---

**KMS — Key Management Service** *(Bab 16)*

Layanan manajemen kunci terkelola. Membuat, menyimpan, dan mengontrol kunci kriptografi. Kunci yang dikelola pelanggan (CMKs) memungkinkan Anda untuk mendefinisikan rotasi, penggunaan, dan kebijakan akses. Kunci yang dikelola AWS dikelola secara otomatis.

Konsep kunci: Kebijakan kunci (terpisah dari kebijakan IAM), Enkripsi amplop (data dienkripsi dengan kunci data; kunci data dienkripsi dengan CMK), Rotasi kunci otomatis, Kunci multi-wilayah, Pemberian.

Exam signal: “Enkripsi data saat istirahat,” “kunci enkripsi yang dikelola pelanggan,” “rotasi kunci” → KMS.

---

**Secrets Manager** *(Bab 16)*

Menyimpan dan memutar kunci sensitif secara otomatis: kredensial database, kunci API, token OAuth. Terintegrasi dengan RDS untuk rotasi kata sandi otomatis. Aplikasi mengambil rahasia saat runtime melalui API — jangan mengkodekan kredensial secara permanen.

Exam signal: “Simpan dan putar kredensial database,” “hindari rahasia yang dikodekan secara permanen” → Secrets Manager. “Simpan nilai konfigurasi, bukan rahasia” → Parameter Store (SSM).

---

**AWS Shield** *(Bab 17)*

Perlindungan DDoS. Shield Standard adalah otomatis dan gratis — melindungi terhadap serangan volumetrik dan protokol umum. Shield Advanced menambahkan perlindungan finansial, tim respons DDoS 24/7, dan visibilitas serangan terperinci.

Exam signal: “Lindungi terhadap DDoS” → Shield Standard (otomatis) atau Shield Advanced (enterprise, dengan SLA).

---

**WAF — Web Application Firewall** *(Bab 17)*

Memfilter lalu lintas HTTP/HTTPS berdasarkan aturan: pemblokiran IP, batas laju, pola injeksi SQL, pola XSS, pembatasan geografis, aturan khusus. Terpasang ke CloudFront, ALB, API Gateway, atau AppSync.

Exam signal: “Blokir alamat IP tertentu,” “mencegah injeksi SQL di tepi,” “batas laju panggilan API” → WAF.

---

**GuardDuty** *(Bab 17)*

Layanan deteksi ancaman. Menganalisis log CloudTrail, Log Aliran VPC, dan log DNS menggunakan ML dan intelijen ancaman. Mendeteksi aktivitas API yang tidak biasa, komunikasi dengan alamat IP berbahaya yang diketahui, kredensial yang dikompromikan.

Exam signal: “Deteksi aktivitas yang tidak biasa,” “identifikasi kredensial IAM yang dikompromikan,” “pemantauan ancaman berkelanjutan” → GuardDuty.

---

## Messaging dan Pemrosesan Event

**SQS — Simple Queue Service** *(Bab 19)*

Antrian pesan terkelola. Produsen mengirim pesan; konsumen membaca dan menghapusnya. Melepas layanan: pengirim tidak perlu tahu apakah penerima tersedia. Antrian standar: pengiriman setidaknya sekali, pengurutan terbaik upaya. Antrian FIFO: pemrosesan satu kali yang tepat, pengurutan ketat.

Konsep kunci: Waktu kedaluwarsa visibilitas (pesan disembunyikan dari konsumen lain saat memproses), Antrian Surat Mati (DLQ) untuk pesan yang gagal berulang kali, Retensi pesan (4 hari default, hingga 14), Polling panjang (mengurangi respons kosong).

Exam signal: “Melepas layanan,” “mengantrikan permintaan selama lonjakan beban,” “pemrosesan asinkron” → SQS. “Urutan penting dan satu kali yang tepat diperlukan” → SQS FIFO.

---

**SNS — Simple Notification Service** *(Bab 19)*

Layanan pub/sub terkelola. Penerbit mengirim pesan ke topik; semua pelanggan menerima salinan. Pola kipas: satu pesan → banyak konsumen. Protokol: SQS, Lambda, HTTP/HTTPS, email, SMS, push seluler.

Konsep kunci: Topik, langganan, pola kipas (SNS → banyak antrian SQS), penyaringan pesan (pelanggan hanya menerima pesan yang cocok).

Exam signal: “Kirim notifikasi ke banyak titik akhir secara bersamaan,” “sebar satu acara ke banyak konsumen” → SNS. Pola umum: SNS + SQS untuk kipas yang tahan lama.

---

**EventBridge** *(Bab 22)*

Bus acara untuk membangun arsitektur berbasis acara. Merutekan acara dari layanan AWS, mitra SaaS, dan sumber khusus ke Lambda, SQS, SNS, Step Functions, dan target lainnya. Mendukung aturan terjadwal (cron) dan pencocokan pola.

Exam signal: “Rute acara dari layanan AWS ke target,” “jadwalkan fungsi Lambda,” “orkestrasi berbasis acara” → EventBridge.
```

**Step Functions** *(Bab 22)*

Orkestrasi alur kerja tanpa server. Mengkoordinasikan fungsi Lambda, tugas ECS, DynamoDB, SNS, SQS, dan layanan lainnya ke dalam mesin keadaan visual. Menangani percobaan ulang, penanganan kesalahan, cabang paralel, dan keadaan tunggu.

Konsep kunci: Mesin keadaan, jenis keadaan (Tugas, Tunggu, Pilihan, Paralel, Peta, Lewati, Berhasil, Gagal), Alur Kerja Standar (benar-benar satu-satunya, jangka panjang) vs. Alur Kerja Ekspres (setidaknya satu, volume tinggi).

Sinyal ujian: “Mengorkestrasi beberapa fungsi Lambda,” “alur kerja jangka panjang dengan logika percobaan ulang,” “langkah persetujuan manusia” → Step Functions.

---

**Kinesis** *(Bab 26)*

Streaming data real-time. Kinesis Data Streams: aliran tahan lama, terurut dari rekaman (seperti log komit terdistribusi). Konsumen memproses rekaman; data dipertahankan selama 24 jam hingga 7 hari. Kinesis Data Firehose: pengiriman yang dikelola sepenuhnya ke S3, Redshift, OpenSearch, Splunk — tidak diperlukan manajemen konsumen.

Konsep kunci: Shard (unit throughput: 1MB/s tulis, 2MB/s baca), kunci partisi (menentukan penugasan shard), nomor urut, pengepematian (KCL atau Lambda), Firehose vs. Streams.

Sinyal ujian: “Streaming data real-time,” “rekaman terurut,” “memutar ulang peristiwa” → Kinesis Data Streams. “Menyampaikan data streaming ke S3/Redshift tanpa mengelola konsumen” → Kinesis Firehose. Kontras dengan SQS: Kinesis mempertahankan dan memutar ulang; SQS menghapus pada konsumsi.

---

## Analitik

**Athena** *(Bab 26)*

Kueri SQL tanpa server pada data yang disimpan di S3. Tidak ada infrastruktur yang perlu dikelola. Bayar per kueri (per TB yang dipindai). Terbaik dengan format kolom (Parquet, ORC) dan data yang dipartisi.

Sinyal ujian: “Menanyakan data S3 dengan SQL,” “analitik ad-hoc pada data danau,” “tidak ada infrastruktur yang perlu dikelola” → Athena.

---

**Glue** *(Bab 26)*

Layanan ETL (Ekstrak, Transformasi, Muat) tanpa server. Glue Crawlers menemukan data dan memperbarui Katalog Glue Data. Glue Jobs menjalankan transformasi Spark atau Python. Katalog Data terintegrasi dengan Athena, Redshift Spectrum, dan EMR.

Sinyal ujian: “Mentransformasi dan memuat data untuk analitik,” “menemukan skema data S3,” “alur kerja ETL” → Glue.

---

## Ketersediaan Tinggi dan Pemulihan Bencana

**Multi-AZ dan Multi-Region** *(Bab 18)*

Multi-AZ: replikasi sinkron dalam suatu wilayah untuk failover otomatis (RDS Multi-AZ, load balancer di seluruh AZ). RPO ~0, RTO ~60s untuk RDS. Multi-Region: replikasi asinkron untuk redundansi geografis dan latensi yang lebih rendah untuk pengguna global.

Konsep kunci: RTO (Tujuan Waktu Pemulihan — berapa lama untuk pulih), RPO (Tujuan Titik Pemulihan — berapa banyak data yang dapat hilang). Pilot Light, Standby Hangat, Strategi DR Aktif-Aktif.

Sinyal ujian: Bedakan antara kegagalan tingkat AZ (Multi-AZ menangani) vs. kegagalan regional (Multi-Region menangani). Biaya dan kompleksitas meningkat secara signifikan dengan Multi-Region.

---

## Optimalisasi Biaya

**Model Harga EC2** *(Bab 27)*

On-Demand: harga penuh, tidak ada komitmen. Reserved Instances (1 atau 3 tahun): diskon 30-72% untuk jenis instance tertentu. Savings Plans (Komputasi atau EC2 Instance): pengeluaran jam yang dikomit untuk fleksibilitas. Spot: 60-90% diskon untuk beban kerja yang dapat diinterupsi.

Sinyal ujian: “Meminimalkan biaya untuk beban kerja yang dapat diprediksi” → Savings Plans atau Reserved Instances. “Pemrosesan batch yang toleran terhadap kesalahan” → Spot. “Tidak dapat diprediksi atau jangka pendek” → On-Demand.

---

**Harga Transfer Data** *(Bab 30)*

Masuk ke AWS: gratis. Sama-AZ: gratis. Silang-AZ: $0.01/GB ke arah masing-masing. Silang-region: $0.02-0.08/GB. Internet (keluar): ~$0.09/GB. NAT Gateway pemrosesan: $0.045/GB. Transfer data CloudFront lebih murah daripada EC2-ke-internet langsung, dan caching mengurangi volume total.

Sinyal ujian: “Mengurangi biaya transfer data untuk S3/DynamoDB dari subnet pribadi” → Gateway Endpoints (gratis). “Mengurangi biaya NAT Gateway untuk layanan lain” → Interface Endpoints.

---

## Observabilitas

**CloudWatch** *(dirujuk di seluruh)*

Pemantauan dan observabilitas. Metrik CloudWatch: data deret waktu numerik dari layanan AWS dan aplikasi khusus. Log CloudWatch: mengumpulkan, mencari, dan menganalisis data log. Alarm CloudWatch: memicu notifikasi atau penskalaan otomatis berdasarkan ambang batas metrik. Dasbor CloudWatch: memvisualisasikan metrik.

Konsep kunci: Dimensi metrik, periode retensi, grup log dan aliran log, filter metrik, Agen CloudWatch (untuk metrik dan log tingkat OS dari EC2), Container Insights.

---

**CloudTrail** *(dirujuk di seluruh)*

Mencatat setiap panggilan API yang dibuat di akun AWS Anda: siapa yang membuatnya, dari mana, kapan, dan apa responsnya. Jalur multi-region menyimpan log di S3 secara permanen. Digunakan untuk audit keamanan, kepatuhan, dan investigasi insiden.

Sinyal ujian: “Siapa yang menghapus sumber daya itu?” “Audit semua aktivitas API” → CloudTrail.

---

**AWS Config** *(dirujuk di Bab 31)*

Melacak perubahan konfigurasi sumber daya dari waktu ke waktu. Mengevaluasi sumber daya terhadap aturan kepatuhan. Mencatat riwayat setiap perubahan konfigurasi untuk setiap sumber daya. Terintegrasi dengan Systems Manager untuk remediasi.

Sinyal ujian: “Apakah sumber daya ini sesuai dengan kebijakan keamanan kami?” “Apa tampilan konfigurasi sumber daya minggu lalu?” → AWS Config.

---

## Terstruktur dengan Baik

**Enam Pilar** *(Bab 31)*

| Pilar                   | Pertanyaan inti                         | Layanan utama                                    |
|-------------------------|------------------------------------------|--------------------------------------------------|
| Keunggulan Operasional  | Apakah kami berjalan dengan baik?        | CloudWatch, CloudTrail, SSM, Config               |
| Keamanan               | Apakah kami terlindungi?                | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Keandalan              | Apakah kami pulih dari kegagalan?       | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Efisiensi Kinerja      | Apakah kami menggunakan sumber daya yang tepat? | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Optimalisasi Biaya      | Apakah kami menghabiskan dengan bijak?   | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Keberlanjutan          | Apakah kami meminimalkan dampak lingkungan? | Right-sizing, Graviton, tingkatan penyimpanan efisien |

Alat Well-Architected AWS: mengevaluasi arsitektur Anda terhadap enam pilar. Gunakan ini sebelum ujian untuk memahami alasan di balik setiap pertanyaan pilar.
