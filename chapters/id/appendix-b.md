# Lampiran B: Peta Domain SAA-C03

Ujian AWS Solutions Architect Associate (SAA-C03) diorganisasikan menjadi empat domain. Lampiran ini memetakan setiap bab dalam buku ke domain dan task yang relevan, sehingga Anda dapat belajar berdasarkan area ujian alih-alih urutan bab.

---

## Ikhtisar Domain

| Domain                                              | Bobot | Deskripsi                                              |
|-----------------------------------------------------|-------|--------------------------------------------------------|
| Domain 1: Design Secure Architectures               | 30%   | IAM, keamanan jaringan, perlindungan data              |
| Domain 2: Design Resilient Architectures            | 26%   | Ketersediaan tinggi, toleransi kesalahan, pemulihan bencana |
| Domain 3: Design High-Performing Architectures      | 24%   | Komputasi, penyimpanan, database, performa jaringan    |
| Domain 4: Design Cost-Optimized Architectures       | 20%   | Model penetapan harga, manajemen biaya, optimasi sumber daya |

---

## Domain 1: Design Secure Architectures (30%)

**Task 1.1 — Merancang akses yang aman ke sumber daya AWS**

Konsep inti: IAM user, group, role, policy. Prinsip least privilege. Akses lintas akun. Service role. SCP (Service Control Policy) di AWS Organizations.

| Bab     | Topik                                                                          |
|---------|--------------------------------------------------------------------------------|
| Bab 3   | Dasar-dasar IAM: user, group, role, policy, evaluasi policy                     |
| Bab 14  | IAM tingkat lanjut: role untuk layanan, permission boundary, role lintas akun  |
| Bab 3   | Logika evaluasi policy: explicit deny > explicit allow > implicit deny          |
| Bab 14  | AWS Organizations, SCP, Control Tower, Account Factory                          |
| Bab 14  | Cognito: User Pool (sign-in aplikasi, JWT) dan Identity Pool (kredensial AWS sementara) |

Pola ujian kunci:

- "EC2 perlu mengakses S3 tanpa kredensial hardcode" → IAM role dengan policy S3 yang terpasang ke instance profile EC2
- "Akun yang berbeda perlu berbagi sumber daya" → IAM role dengan trust policy lintas akun
- "Mencegah semua IAM user dalam sebuah OU mengakses sebuah layanan" → SCP di AWS Organizations

---

**Task 1.2 — Merancang beban kerja dan aplikasi yang aman**

Konsep inti: Desain VPC, security group vs. NACL, isolasi jaringan, perlindungan DDoS, WAF, GuardDuty.

| Bab     | Topik                                                                                       |
|---------|---------------------------------------------------------------------------------------------|
| Bab 11  | Desain VPC: subnet publik/privat, NAT Gateway, Internet Gateway, route table                |
| Bab 15  | Security group (stateful, tingkat instance) vs. NACL (stateless, tingkat subnet)            |
| Bab 17  | Shield (DDoS), WAF (firewall aplikasi), GuardDuty (deteksi ancaman), Inspector (pemindaian CVE) |
| Bab 17  | Macie: penemuan data sensitif di S3 (PII, kredensial)                                       |
| Bab 25  | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

Pola ujian kunci:

- "Memblokir IP tertentu dari subnet" → NACL deny rule
- "Mengizinkan HTTP masuk, secara otomatis mengizinkan respons HTTP keluar" → Security group (stateful)
- "Melindungi aplikasi web dari SQL injection" → WAF dengan aturan SQL injection
- "Mendeteksi kredensial IAM yang dikompromikan" → GuardDuty

---

**Task 1.3 — Menentukan kontrol keamanan data yang sesuai**

Konsep inti: Enkripsi saat istirahat dan saat transit, KMS, Secrets Manager, Parameter Store, enkripsi sisi server S3.

| Bab     | Topik                                                                     |
|---------|---------------------------------------------------------------------------|
| Bab 16  | KMS: customer-managed key, rotasi kunci, envelope encryption              |
| Bab 16  | Secrets Manager: rotasi kredensial otomatis, pengambilan secret saat runtime |
| Bab 16  | ACM (AWS Certificate Manager): sertifikat SSL/TLS untuk ALB, CloudFront   |
| Bab 5   | Opsi enkripsi S3: SSE-S3, SSE-KMS, SSE-C                                  |
| Bab 8   | Enkripsi RDS saat istirahat (harus diaktifkan saat pembuatan)             |

Pola ujian kunci:

- "Merotasi kredensial database secara otomatis" → Secrets Manager dengan integrasi RDS
- "Mengontrol siapa yang dapat menggunakan kunci enkripsi di seluruh akun" → KMS key policy
- "Menyimpan nilai konfigurasi non-rahasia" → SSM Parameter Store (bukan Secrets Manager)
- "Mengenkripsi objek S3 dengan kunci yang dikelola perusahaan" → SSE-KMS dengan CMK

---

## Domain 2: Design Resilient Architectures (26%)

**Task 2.1 — Merancang arsitektur yang dapat diskalakan dan loosely coupled**

Konsep inti: Auto Scaling, load balancer, decoupling SQS/SNS, pemicu peristiwa Lambda, ECS/EKS, Step Functions.

| Bab     | Topik                                                             |
|---------|------------------------------------------------------------------|
| Bab 7   | Auto Scaling Group, Application Load Balancer, kebijakan penskalaan |
| Bab 19  | SQS (decoupling dengan antrian), SNS (notifikasi fan-out)        |
| Bab 20  | Lambda: komputasi serverless, pemicu peristiwa, konkurensi        |
| Bab 20  | API Gateway: API REST/HTTP/WebSocket terkelola, mandiri atau + Lambda |
| Bab 21  | ECS dan EKS: microservice terkontainerisasi                      |
| Bab 22  | Step Functions: orkestrasi alur kerja                            |
| Bab 26  | Kinesis: streaming data real-time                                |

Pola ujian kunci:

- "Memisahkan pemrosesan pesanan dari pembaruan inventaris" → antrian SQS antar layanan
- "Memberi tahu beberapa layanan saat pesanan baru dibuat" → topic SNS dengan subscription SQS (fan-out)
- "Memproses unggahan S3 secara otomatis" → notifikasi peristiwa S3 → Lambda
- "Menjalankan alur kerja multi-langkah dengan logika retry" → Step Functions

---

**Task 2.2 — Merancang arsitektur yang sangat tersedia dan/atau toleran terhadap kesalahan**

Konsep inti: Multi-AZ, Multi-Region, failover Route 53, read replica RDS, Aurora Global Database, backup dan restore.

| Bab     | Topik                                                                                         |
|---------|----------------------------------------------------------------------------------------------|
| Bab 2   | Infrastruktur global AWS: Region, AZ, edge location                                           |
| Bab 7   | ALB di beberapa AZ, ASG mengganti instance yang tidak sehat                                   |
| Bab 8   | RDS Multi-AZ: replikasi sinkron, failover otomatis                                            |
| Bab 12  | Route 53: failover routing, latency routing, health check                                     |
| Bab 18  | Multi-AZ vs. Multi-Region: RTO/RPO, strategi DR (pilot light, warm standby, active-active)    |
| Bab 18  | AWS Backup (backup terpusat, lintas akun), Elastic Disaster Recovery (pilot light terkelola)  |
| Bab 24  | Aurora Global Database: read replica lintas region, lag replikasi < 1d                        |

Pola ujian kunci:

- "Failover otomatis jika RDS utama gagal" → RDS Multi-AZ (bukan Read Replica)
- "Menyajikan pembacaan secara global dengan latensi rendah" → Aurora Global Database
- "Merutekan lalu lintas ke region sekunder jika utama tidak tersedia" → Route 53 dengan Failover routing + health check
- "RTO 1 menit, RPO 0" → Deployment Multi-AZ (bukan Multi-Region)
- "RTO 15 menit, lintas region" → Strategi Pilot Light

---

## Domain 3: Design High-Performing Architectures (24%)

**Task 3.1 — Menentukan solusi penyimpanan yang berperforma tinggi dan/atau dapat diskalakan**

Konsep inti: S3 vs. EBS vs. EFS, pemilihan storage class, S3 Transfer Acceleration, multipart upload, CloudFront untuk aset.

| Bab     | Topik                                                                    |
|---------|--------------------------------------------------------------------------|
| Bab 5   | S3: penyimpanan objek, storage class, versioning, lifecycle              |
| Bab 6   | EBS: jenis penyimpanan blok (gp3, io2, st1), EFS: penyimpanan file bersama |
| Bab 6   | Storage Gateway: jembatan hibrida on-premises ke S3 (File, Volume, Tape) |
| Bab 23  | Transisi storage class S3, opsi pengambilan Glacier                      |
| Bab 25  | DataSync (sinkronisasi file online), Transfer Family (SFTP→S3 terkelola), Snow Family (transfer massal offline — legacy: ditutup untuk pelanggan baru pada November 2025; AWS kini mengarahkan ke DataSync dan Data Transfer Terminals), MGN (rehost server) |
| Bab 28  | Right-sizing EBS, migrasi gp2→gp3, manajemen snapshot                    |

Pola ujian kunci:

- "Sistem file bersama yang dapat diakses dari beberapa instance EC2" → EFS (bukan EBS; EBS terpasang ke satu instance)
- "IOPS tinggi untuk beban kerja database" → EBS io2
- "Mengurangi biaya untuk file yang tidak diakses dalam 90 hari" → S3 lifecycle policy → Glacier
- "Mengunggah file besar dari lokasi jauh lebih cepat" → S3 Transfer Acceleration
- "Berminggu-minggu transfer melalui bandwidth terbatas" → ujian SAA-C03 masih mengharapkan Snowball, meskipun Snow Family ditutup untuk pelanggan baru pada 2025

---

**Task 3.2 — Menentukan solusi komputasi yang berperforma tinggi dan/atau dapat diskalakan**

Konsep inti: Keluarga instance EC2, prosesor Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| Bab     | Topik                                                                                    |
|---------|-----------------------------------------------------------------------------------------|
| Bab 4   | Jenis instance EC2: compute-optimized (c), memory-optimized (r), general purpose (m, t)  |
| Bab 7   | Auto Scaling: penskalaan horizontal untuk tier web                                       |
| Bab 20  | Lambda: konkurensi, provisioned concurrency (untuk latensi konsisten)                    |
| Bab 21  | ECS Fargate: kontainer serverless                                                        |
| Bab 21  | AWS Batch: komputasi batch terkelola untuk kontainer Docker, didukung Spot              |
| Bab 27  | Spot Instances untuk beban kerja batch yang toleran terhadap kesalahan                   |

Pola ujian kunci:

- "Beban kerja pelatihan ML, minimalkan biaya, dapat diinterupsi" → Spot Instances
- "Respons Lambda sub-100ms yang konsisten" → Provisioned concurrency (menghilangkan cold start)
- "Microservice terkontainerisasi, tanpa pengelolaan infrastruktur" → ECS Fargate

---

**Task 3.3 — Menentukan solusi database yang berperforma tinggi**

Konsep inti: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, pola akses, read replica, DAX.

| Bab     | Topik                                                             |
|---------|------------------------------------------------------------------|
| Bab 8   | RDS: database relasional terkelola, kapan menggunakan RDBMS       |
| Bab 9   | DynamoDB: NoSQL, partition key, GSI, DAX (cache dalam memori)     |
| Bab 10  | ElastiCache: Redis vs. Memcached, strategi caching               |
| Bab 10  | MemoryDB for Redis: database utama durabel yang kompatibel Redis  |
| Bab 24  | Aurora: performa, Serverless v2, read replica, Global Database    |
| Bab 29  | DynamoDB on-demand vs. provisioned capacity dengan Auto Scaling   |

Pola ujian kunci:

- "Pembacaan mikrodetik untuk session store" → ElastiCache Redis atau DAX (jika backend DynamoDB)
- "Akses key-value throughput tinggi dengan skema fleksibel" → DynamoDB
- "Join kompleks dan transaksi ACID" → Aurora atau RDS
- "Analitik pada petabyte data terstruktur" → Redshift (tidak dibahas secara rinci tetapi sinyal: "data warehouse" → Redshift)

---

**Task 3.4 — Menentukan arsitektur jaringan yang berperforma tinggi dan/atau dapat diskalakan**

Konsep inti: CloudFront, Global Accelerator, Direct Connect, VPN, placement group, enhanced networking.

| Bab     | Topik                                                             |
|---------|------------------------------------------------------------------|
| Bab 7   | NLB (Layer 4) dan GWLB (Gateway Load Balancer untuk appliance jaringan) |
| Bab 11  | Client VPN: akses terenkripsi perangkat individu ke VPC          |
| Bab 12  | Route 53: kebijakan routing: latency-based, geolocation, weighted |
| Bab 13  | CloudFront: CDN, edge caching, Lambda@Edge                       |
| Bab 25  | AWS Global Accelerator: Anycast routing ke backbone AWS          |
| Bab 25  | Direct Connect: konektivitas privat khusus                      |
| Bab 30  | VPC Endpoint: konektivitas privat ke layanan AWS                |

Pola ujian kunci:

- "Mengurangi latensi untuk pengguna global yang mengakses respons API dinamis" → Global Accelerator (bukan CloudFront, yang terbaik untuk konten yang dapat di-cache)
- "Mengurangi latensi untuk aset statis secara global" → CloudFront
- "Konektivitas privat yang konsisten ke AWS dari on-premises" → Direct Connect
- "Unggahan cepat dari pelanggan di seluruh dunia ke bucket S3 Anda" → S3 Transfer Acceleration

---

**Task 3.5 — Menentukan solusi ingesti dan transformasi data yang berperforma tinggi**

Konsep inti: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Bab     | Topik                                                              |
|---------|-------------------------------------------------------------------|
| Bab 26  | Kinesis Data Streams: pemrosesan peristiwa terurut real-time      |
| Bab 26  | Amazon Data Firehose (eks-Kinesis Data Firehose): pengiriman terkelola ke S3, Redshift, OpenSearch |
| Bab 26  | AWS Glue: ETL serverless, Data Catalog, Crawler                  |
| Bab 26  | Athena: SQL serverless pada S3                                    |
| Bab 26  | QuickSight: dashboard BI terkelola, engine dalam memori SPICE     |
| Bab 26  | Lake Formation: kontrol akses data lake berbutir halus            |

Pola ujian kunci:

- "Memproses data click-stream secara real-time" → Kinesis Data Streams + Lambda atau Managed Service for Apache Flink (sebelumnya Kinesis Data Analytics)
- "Mengirim data streaming ke S3 untuk analisis nanti" → Amazon Data Firehose
- "Mentransformasi dan mengkatalogkan data dari beberapa sumber" → AWS Glue
- "Mengkueri data historis yang disimpan di S3 dengan SQL" → Athena

---

## Domain 4: Design Cost-Optimized Architectures (20%)

**Task 4.1 — Merancang solusi penyimpanan yang dioptimalkan biaya**

| Bab     | Topik                                                             |
|---------|------------------------------------------------------------------|
| Bab 23  | S3 lifecycle policy, transisi storage class                      |
| Bab 28  | Right-sizing EBS, migrasi gp2→gp3, aturan lifecycle versioning S3 |
| Bab 28  | EFS Intelligent-Tiering, cost allocation tag, AWS Budgets         |

Pola ujian kunci:

- "Mengidentifikasi tim mana yang menghasilkan biaya S3 terbanyak" → Cost allocation tag + Cost Explorer
- "Mengurangi biaya untuk objek yang jarang diakses secara otomatis" → S3 Intelligent-Tiering
- "Memberi peringatan saat biaya bulanan melebihi $10.000" → AWS Budgets

---

**Task 4.2 — Merancang solusi komputasi yang dioptimalkan biaya**

| Bab     | Topik                                                                            |
|---------|----------------------------------------------------------------------------------|
| Bab 2   | Outposts: rak AWS on-premises (trade-off biaya kapital vs. opex cloud)            |
| Bab 2   | Wavelength: komputasi edge 5G (kemitraan telekomunikasi, penempatan berbasis latensi) |
| Bab 27  | Penetapan harga EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Bab 20  | Lambda: bayar per pemanggilan (tanpa biaya idle)                                  |

Pola ujian kunci:

- "Mengurangi biaya untuk beban kerja produksi steady-state" → Savings Plans (lebih fleksibel) atau Reserved Instances
- "Meminimalkan biaya untuk job batch yang dapat diinterupsi" → Spot Instances
- "Pemrosesan berbasis peristiwa tanpa biaya idle" → Lambda

---

**Task 4.3 — Merancang solusi database yang dioptimalkan biaya**

| Bab     | Topik                                             |
|---------|---------------------------------------------------|
| Bab 29  | DynamoDB on-demand vs. provisioned + Auto Scaling |
| Bab 29  | Reserved Instances/Node RDS dan ElastiCache       |
| Bab 29  | Manajemen snapshot RDS                            |

Pola ujian kunci:

- "Lalu lintas DynamoDB yang tidak dapat diprediksi" → Mode kapasitas on-demand
- "Lalu lintas DynamoDB konsisten dengan puncak yang diketahui" → Provisioned + Auto Scaling
- "Mengurangi biaya RDS untuk beban kerja stabil" → Reserved Instances (1 atau 3 tahun)

---

**Task 4.4 — Merancang arsitektur jaringan yang dioptimalkan biaya**

| Bab     | Topik                                                                                          |
|---------|-----------------------------------------------------------------------------------------------|
| Bab 30  | Penetapan harga transfer data: masuk (gratis), cross-AZ ($0,01/GB), cross-region, internet ($0,09/GB) |
| Bab 30  | NAT Gateway ($0,045/GB) vs. VPC Endpoint (Gateway: gratis; Interface: berbayar)               |
| Bab 30  | CloudFront sebagai pengoptimal biaya transfer data                                             |

Pola ujian kunci:

- "EC2 di subnet privat memanggil S3 — menghilangkan biaya NAT Gateway" → S3 Gateway Endpoint (gratis)
- "EC2 di subnet privat memanggil SQS — mengurangi biaya NAT Gateway" → SQS Interface Endpoint
- "Mengurangi biaya transfer data untuk pengiriman konten global" → CloudFront (caching mengurangi permintaan origin)

---

## Topik Lintas Domain

Beberapa topik muncul di beberapa domain:

| Topik                              | Domain  | Bab          |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | Semua   | 31           |
| Tinjauan arsitektur dan ADR        | Semua   | 32           |
| Penalaran trade-off ("it depends") | Semua   | 33           |
| Desain Multi-AZ                    | 2, 3    | 7, 8, 18, 24 |
| Pemantauan dan observabilitas      | 1, 2    | Di sepanjang buku |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Daftar Periksa Pra-Ujian

Sebelum mengikuti SAA-C03:

**Area berbobot tinggi (paling mungkin muncul)**

- [ ] Logika evaluasi IAM policy (explicit deny → explicit allow → implicit deny)
- [ ] Komponen VPC: subnet, route table, IGW, NAT Gateway, security group, NACL
- [ ] Storage class S3 dan kapan menggunakan masing-masing
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. penskalaan baca)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. perutean peristiwa)
- [ ] Model penetapan harga EC2: Spot untuk fault-tolerant, Savings Plans untuk beban kerja terkomitmen
- [ ] Pemicu dan konkurensi Lambda
- [ ] DynamoDB vs. Aurora vs. Redshift (pola akses menentukan pilihan)
- [ ] CloudFront: CDN untuk statis, Global Accelerator untuk dinamis

**Jebakan umum**

- [ ] EBS terpasang ke SATU instance; EFS bersifat bersama
- [ ] RDS Read Replica untuk penskalaan baca, BUKAN failover otomatis (itu Multi-AZ)
- [ ] NACL bersifat stateless (memerlukan aturan masuk dan keluar)
- [ ] Gateway Endpoint gratis dan hanya untuk S3 dan DynamoDB
- [ ] Kinesis menyimpan dan memutar ulang; SQS menghapus saat dikonsumsi
- [ ] "Decouple" tidak selalu berarti SQS — fan-out SNS dan EventBridge juga merupakan pola decoupling
- [ ] Shield Standard gratis dan otomatis; Advanced adalah langganan berbayar
- [ ] ElastiCache vs. MemoryDB: ElastiCache = cache (kehilangan data OK). MemoryDB = database utama durabel.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = perangkat individu. Site-to-Site = jaringan-ke-jaringan.
- [ ] Outposts vs. Wavelength: Outposts = rak AWS on-premises. Wavelength = edge 5G.
- [ ] DMS: homogen = DMS langsung. Heterogen = SCT terlebih dahulu, lalu DMS.
- [ ] DataSync memindahkan *file*; DMS memindahkan *database*; MGN memindahkan *seluruh server*.

**Struktur ujian**

- 65 soal, 130 menit (2 jam 10 menit)
- Pilihan ganda (satu jawaban benar) dan respons ganda (pilih N yang benar)
- Skor kelulusan: 720 dari 1000
- Soal yang tidak dinilai disisipkan; Anda tidak dapat mengetahui yang mana
- Kelola waktu: ~2 menit per soal; tandai yang sulit dan kembali lagi
