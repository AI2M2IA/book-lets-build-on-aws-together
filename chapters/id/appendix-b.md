# Lampiran B: Peta Domain SAA-C03

Ujian Arsitek Solusi AWS Asosiasi (SAA-C03) diorganisasikan menjadi empat domain. Lampiran ini memetakan setiap bab dalam buku ke domain dan tugas yang relevan, sehingga Anda dapat belajar berdasarkan area ujian daripada urutan bab.

---

## Ikhtisar Domain

| Domain                                         | Bobot | Deskripsi                                            |
|------------------------------------------------|--------|--------------------------------------------------------|
| Domain 1: Rancang Arsitektur yang Aman          | 30%    | IAM, keamanan jaringan, perlindungan data                 |
| Domain 2: Rancang Arsitektur yang Tangguh       | 26%    | Ketersediaan Tinggi, toleransi kesalahan, pemulihan bencana |
| Domain 3: Rancang Arsitektur yang Berkinerja Tinggi | 24%    | Komputasi, penyimpanan, database, kinerja jaringan        |
| Domain 4: Rancang Arsitektur yang Dioptimalkan Biaya | 20%    | Model harga, manajemen biaya, optimasi sumber daya |

---

## Domain 1: Rancang Arsitektur yang Aman (30%)

**Tugas 1.1 — Rancang akses ke sumber daya AWS yang aman**

Konsep inti: Pengguna, grup, peran IAM, kebijakan. Prinsip hak istimewa paling sedikit. Akses lintas akun. Peran layanan. Kebijakan Kontrol Layanan (SCP) di AWS Organizations.

| Bab    | Topik                                                                        |
|------------|------------------------------------------------------------------------------|
| Bab 3  | Dasar-dasar IAM: pengguna, grup, peran, kebijakan, evaluasi kebijakan          |
| Bab 14 | IAM Tingkat Lanjut: peran untuk layanan, batas izin, peran lintas akun |
| Bab 3  | Logika evaluasi kebijakan: tolak eksplisit > izinkan eksplisit > tolak implisit      |
| Bab 14 | AWS Organizations dan SCPs                                                   |

Pola ujian kunci:

- "EC2 perlu mengakses S3 tanpa kredensial yang dikodekan secara permanen" → peran IAM dengan kebijakan S3 yang dilampirkan ke profil instans EC2
- "Akun yang berbeda perlu berbagi sumber daya" → peran IAM dengan kebijakan kepercayaan lintas akun
- "Blokir semua pengguna IAM dalam OU dari mengakses layanan" → SCP di AWS Organizations

---

**Tugas 1.2 — Rancang beban kerja dan aplikasi yang aman**

Konsep inti: Desain VPC, grup keamanan vs. NACL, isolasi jaringan, perlindungan DDoS, WAF, GuardDuty.

| Bab    | Topik                                                                              |
|------------|------------------------------------------------------------------------------------|
| Bab 11 | Desain VPC: subnet publik/privat, NAT Gateway, Internet Gateway, tabel rute    |
| Bab 15 | Grup keamanan (berkeadaan) vs. NACL (tidak berkeadaan, tingkat subnet)     |
| Bab 17 | Shield (perlindungan DDoS), WAF (firewall aplikasi), GuardDuty (deteksi ancaman) |
| Bab 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                  |

Pola ujian kunci:

- "Blokir IP tertentu dari subnet" → aturan penolakan NACL
- "Izinkan HTTP masuk, secara otomatis izinkan respons HTTP keluar" → Grup keamanan (berkeadaan)
- "Lindungi aplikasi web dari injeksi SQL" → WAF dengan aturan injeksi SQL
- "Deteksi kredensial IAM yang dikompromikan" → GuardDuty

---

**Tugas 1.3 — Tentukan kontrol keamanan data yang sesuai**

Konsep inti: Enkripsi saat istirahat dan dalam transit, KMS, Secrets Manager, Parameter Store, enkripsi sisi server S3.

| Bab    | Topik                                                                    |
|------------|--------------------------------------------------------------------------|
| Bab 16 | KMS: kunci yang dikelola pelanggan, rotasi kunci, enkripsi amplop            |
| Bab 16 | Secrets Manager: rotasi kredensial otomatis, pengambilan rahasia waktu proses |
| Bab 5  | Opsi enkripsi S3: SSE-S3, SSE-KMS, SSE-C                            |
| Bab 8  | Enkripsi RDS saat istirahat (harus diaktifkan saat pembuatan)                     |

Pola ujian kunci:

- "Rotasi kredensial database secara otomatis" → Secrets Manager dengan integrasi RDS
- "Kontrol siapa yang dapat menggunakan kunci enkripsi di seluruh akun" → kebijakan kunci KMS
- "Simpan nilai konfigurasi non-rahasia" → SSM Parameter Store (bukan Secrets Manager)
- "Enkripsi objek S3 dengan kunci yang dikelola perusahaan" → SSE-KMS dengan CMK

---

## Domain 2: Rancang Arsitektur yang Tangguh (26%)

**Tugas 2.1 — Rancang arsitektur yang dapat diskalakan dan terlepas**

Konsep inti: Skala Otomatis, load balancer, SQS/SNS decoupling, pemicu Lambda, ECS/EKS, Step Functions.

| Bab    | Topik                                                            |
|------------|------------------------------------------------------------------|
| Bab 7  | Grup Skala Otomatis, Load Balancer Aplikasi, kebijakan penskalaan |
| Bab 19 | SQS (pemutusan dengan antrean), SNS (pancar notifikasi)        |
| Bab 20 | Lambda: komputasi serverless, pemicu acara, konkurensi          |
| Bab 21 | ECS dan EKS: layanan mikro yang dikontainerisasi                         |
| Bab 22 | Step Functions: orkestrasi alur kerja                           |
| Bab 26 | Kinesis: streaming data real-time                                |

Pola ujian kunci:

- "Low-latency access to frequently accessed data" → DynamoDB with DAX
- "High-performance analytics queries" → Redshift
- "Relational data with complex queries" → RDS
- "Serverless database with automatic scaling" → Aurora Serverless v2
- "Caching frequently accessed data" → ElastiCache (Redis or Memcached)

---

**Task 4.1 — Design a highly available and scalable web application**

Core concepts: Load Balancing, Auto Scaling, Content Delivery Network (CDN), caching, monitoring.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 3  | Load Balancing: ALB, placement groups                               |
| Chapter 13 | CDN: CloudFront, caching, edge locations                           |
| Chapter 19 | Monitoring: CloudWatch, alarms, dashboards                         |
| Chapter 22 | Caching: CloudFront caching, ElastiCache caching                   |

Key exam patterns:

- "Distribute traffic across multiple EC2 instances" → ALB with multiple targets
- "Serve static assets globally with low latency" → CloudFront
- "Monitor application performance and set alarms" → CloudWatch
- "Cache frequently accessed data to reduce database load" → CloudFront caching + ElastiCache

---

**Task 4.2 — Design a disaster recovery solution**

Core concepts: Backup and Restore, Pilot Light, Warm Standby, Active-Active, RTO, RPO.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 18 | Multi-AZ vs. Multi-Region: RTO/RPO, DR strategies (pilot light, warm standby, active-active) |
| Chapter 26 | Backup and Restore: snapshots, point-in-time recovery               |

Key exam patterns:

- "RTO of 15 minutes, RPO of 1 hour" → Warm Standby strategy
- "RTO of 1 hour, RPO of 5 minutes" → Active-Active strategy
- "Minimal cost DR solution, acceptable RTO/RPO" → Pilot Light strategy
- "Regular backups to a separate region" → Backup and Restore

- "Microsecond reads for a session store" → ElastiCache Redis atau DAX (jika backend DynamoDB)
- "High-throughput key-value access with flexible schema" → DynamoDB
- "Complex joins and ACID transactions" → Aurora atau RDS
- "Analytics on petabytes of structured data" → Redshift (tidak tercakup secara rinci tetapi sinyal: “data warehouse” → Redshift)

---

**Tugas 3.4 — Tentukan arsitektur jaringan berkinerja tinggi dan/atau skalabel**

Konsep inti: CloudFront, Global Accelerator, Direct Connect, VPN, kelompok penempatan, jaringan yang ditingkatkan.

| Bab    | Topik                                                               |
|------------|------------------------------------------------------------------|
| Bab 12 | Route 53: kebijakan perutean: berbasis latensi, berbasis lokasi, berbobot |
| Bab 13 | CloudFront: CDN, caching tepi, Lambda@Edge                       |
| Bab 25 | Direct Connect: konektivitas pribadi khusus                         |
| Bab 25 | AWS Global Accelerator: perutean Anycast ke tepi AWS terdekat      |
| Bab 30 | VPC Endpoints: konektivitas pribadi ke layanan AWS              |

Pola ujian utama:

- "Mengurangi latensi untuk pengguna global yang mengakses respons API dinamis" → Global Accelerator (bukan CloudFront, yang terbaik untuk konten yang dapat di-cache)
- "Mengurangi latensi untuk aset statis secara global" → CloudFront
- "Konektivitas pribadi yang konsisten ke AWS dari lokasi di tempat" → Direct Connect
- "Unggah cepat dari pelanggan di seluruh dunia ke bucket S3 Anda" → S3 Transfer Acceleration

---

**Tugas 3.5 — Tentukan solusi ingest dan transformasi data berkinerja tinggi**

Konsep inti: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Bab    | Topik                                                               |
|------------|---------------------------------------------------------------------|
| Bab 26 | Kinesis Data Streams: pemrosesan peristiwa terurut waktu nyata            |
| Bab 26 | Kinesis Data Firehose: pengiriman terkelola ke S3, Redshift, OpenSearch |
| Bab 26 | AWS Glue: ETL tanpa server, Katalog Data, Penjelajah                    |
| Bab 26 | Athena: SQL tanpa server di S3                                        |

Pola ujian utama:

- "Memproses data aliran klik dalam waktu nyata" → Kinesis Data Streams + Lambda atau KDA
- "Menyampaikan data aliran ke S3 untuk analisis nanti" → Kinesis Firehose
- "Mentransformasikan dan mengkatalogkan data dari berbagai sumber" → AWS Glue
- "Menanyakan data historis yang disimpan di S3 dengan SQL" → Athena

---

## Domain 4: Rancang Arsitektur yang Dioptimalkan Biaya (20%)

**Tugas 4.1 — Rancang solusi penyimpanan yang dioptimalkan biaya**

| Bab    | Topik                                                              |
|------------|--------------------------------------------------------------------|
| Bab 23 | Kebijakan siklus hidup S3, transisi kelas penyimpanan                   |
| Bab 28 | Ukuran EBS yang tepat, migrasi gp2→gp3, aturan siklus hidup versi S3 |
| Bab 28 | EFS Tiering Cerdas, tag alokasi biaya, AWS Budgets         |

Pola ujian utama:

- "Mengidentifikasi tim mana yang menghasilkan biaya S3 terbanyak" → Tag alokasi biaya + Cost Explorer
- "Mengurangi biaya untuk objek yang jarang diakses secara otomatis" → S3 Intelligent-Tiering
- "Memberi tahu ketika biaya bulanan melebihi $10.000" → AWS Budgets

---

**Tugas 4.2 — Rancang solusi komputasi yang dioptimalkan biaya**

| Bab    | Topik                                                                            |
|------------|----------------------------------------------------------------------------------|
| Bab 27 | Harga EC2: On-Demand, Instance Terperinci, Savings Plans, Spot, Host Khusus |
| Bab 20 | Lambda: bayar per panggilan (biaya idle tidak ada)                                      |

Pola ujian utama:

- "Mengurangi biaya untuk beban kerja produksi yang stabil" → Savings Plans (lebih fleksibel) atau Instance Terperinci
- "Meminimalkan biaya untuk pekerjaan batch yang dapat terganggu" → Instance Spot
- "Pemrosesan berbasis peristiwa dengan biaya idle tidak ada" → Lambda

---

**Tugas 4.3 — Rancang solusi database yang dioptimalkan biaya**

| Bab    | Topik                                             |
|------------|---------------------------------------------------|
| Bab 29 | DynamoDB on-demand vs. provisioned + Auto Scaling |
| Bab 29 | Instance Terperinci RDS dan ElastiCache      |
| Bab 29 | Manajemen snapshot RDS                           |

Pola ujian utama:

- "Lalu lintas DynamoDB yang tidak terduga" → Mode kapasitas on-demand
- "Lalu lintas DynamoDB yang konsisten dengan puncak yang diketahui" → Provisioned + Auto Scaling
- "Mengurangi biaya RDS untuk beban kerja yang stabil" → Instance Terperinci (1- atau 3-tahun)

---

**Tugas 4.4 — Rancang arsitektur jaringan yang dioptimalkan biaya**

```markdown
| Bab        | Topik                                                                                                                               |
|------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Bab 30     | Penetapan biaya transfer data: masuk (gratis), antar-AZ ($0,01/GB), antar-region, internet ($0,09/GB)                               |
| Bab 30     | NAT Gateway ($0,045/GB) vs. VPC Endpoints (Gerbang: gratis; Antarmuka: berbayar)                                                  |
| Bab 30     | CloudFront sebagai pengoptimal biaya transfer data                                                                                   |

Pola ujian kunci:

- "EC2 di subnet pribadi memanggil S3 — hilangkan biaya NAT Gateway" → Endpoint S3 Gateway (gratis)
- "EC2 di subnet pribadi memanggil SQS — kurangi biaya NAT Gateway" → Endpoint Antarmuka SQS
- "Kurangi biaya transfer data untuk pengiriman konten global" → CloudFront (cache mengurangi permintaan ke origin)

---

## Topik Lintas Domain

Beberapa topik muncul di berbagai domain:

| Topik                              | Domain      | Bab        |
|------------------------------------|-------------|------------|
| Kerangka Arsitektur yang Baik      | Semua       | 31         |
| Tinjauan Arsitektur dan ADR        | Semua       | 32         |
| Alasan Pertimbangan ("tergantung") | Semua       | 33         |
| Desain Multi-AZ                    | 2, 3        | 7, 8, 18, 24 |
| Pemantauan dan Observabilitas      | 1, 2        | Sepanjang   |
| CloudFront                         | 3, 4        | 13, 30      |

---

## Daftar Periksa Sebelum Ujian

Sebelum mengikuti ujian SAA-C03:

**Area dengan Bobot Tinggi (Paling Mungkin Muncul)**

- [ ] Logika evaluasi kebijakan IAM (penolakan eksplisit → izin eksplisit → penolakan implisit)
- [ ] Komponen VPC: subnet, tabel rute, IGW, NAT Gateway, grup keamanan, NACLs
- [ ] Kelas penyimpanan S3 dan kapan menggunakannya
- [ ] RDS Multi-AZ vs. Replika Baca (pemulihan bencana vs. penskalaan baca)
- [ ] SQS vs. SNS vs. EventBridge (tarik vs. dorong vs. perutean acara)
- [ ] Model harga EC2: Spot untuk toleran kesalahan, Rencana Tabungan untuk beban kerja yang berkomitmen
- [ ] Pemicu Lambda dan konkurensi
- [ ] DynamoDB vs. Aurora vs. Redshift (pola akses menentukan pilihan)
- [ ] CloudFront: CDN untuk statis, Global Accelerator untuk dinamis

**Jebakan Umum**

- [ ] EBS terpasang ke SATU instance; EFS dibagikan
- [ ] Replika Baca RDS adalah untuk penskalaan baca, BUKAN pemulihan bencana otomatis (itu Multi-AZ)
- [ ] NACLs bersifat tidak berkorelasi (membutuhkan aturan masuk dan keluar)
- [ ] Endpoint Gerbang gratis dan hanya untuk S3 dan DynamoDB
- [ ] Kinesis menyimpan dan memutar ulang; SQS menghapus saat dikonsumsi
- [ ] "Decouple" tidak selalu berarti SQS — SNS fan-out dan EventBridge juga merupakan pola decouple
- [ ] Shield Standar gratis dan otomatis; Advanced adalah langganan berbayar

**Struktur Ujian**

- 65 pertanyaan, 130 menit (2 jam 10 menit)
- Pilihan ganda (satu jawaban benar) dan pilihan ganda banyak (pilih N jawaban benar)
- Skor minimal: 720 dari 1000
- Pertanyaan yang tidak dinilai tertanam; Anda tidak dapat mengetahui pertanyaannya
- Kelola waktu: ~2 menit per pertanyaan; tandai pertanyaan yang sulit dan kembalikan
```
