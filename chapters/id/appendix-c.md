# Lampiran C: Registri Konsep

Setiap konsep kunci yang diperkenalkan dalam buku ini, dipetakan ke babnya, analogi yang digunakan, dan domain SAA-C03 tempatnya muncul.

Gunakan ini sebagai indeks studi: jika Anda masih ragu tentang suatu konsep sebelum ujian, temukan di sini dan kembali ke babnya untuk konteks.

---

## A

**ACM (AWS Certificate Manager)** — Sertifikat TLS publik gratis untuk ALB, CloudFront, dan API Gateway, dengan perpanjangan otomatis melalui validasi DNS. Sertifikat CloudFront harus berada di us-east-1. Bab 16. Domain 1.

**ACU (Aurora Capacity Unit)** — Unit pengukuran untuk kapasitas Aurora Serverless v2. Skala secara otomatis dan, pada versi engine yang didukung, dapat melakukan auto-pause ke 0 ACU ketika tidak ada koneksi yang terbuka. Bab 24. Domain 3.

**Alarm (CloudWatch)** — Aturan yang aktif saat sebuah metrik melewati ambang batas, memicu notifikasi atau tindakan auto scaling. Bab 7. Domain 2.

**ALB (Application Load Balancer)** — Load balancer Layer 7 yang merutekan lalu lintas HTTP/HTTPS berdasarkan aturan path dan host. Bab 7. Domain 2.

**AMI (Amazon Machine Image)** — Template yang berisi OS, perangkat lunak, dan konfigurasi untuk sebuah instance EC2. Bab 4. Domain 3.

**Pola pikir arsitek (Architect mindset)** — Bertanya "apa yang rusak duluan, bagaimana kita tahu, dan apa yang dilakukan seseorang pada pukul 3 pagi?" alih-alih hanya "bagaimana cara kerjanya?" Bab 32, Bab 34. Lintas domain.

**Architecture Decision Record (ADR)** — Dokumen singkat yang mencatat sebuah keputusan, alternatifnya, alasannya, dan apa yang akan menyebabkan peninjauan ulang. Bab 32. Lintas domain.

**Tinjauan arsitektur (Architecture review)** — Proses terstruktur yang mencakup: batasan → hal yang belum diketahui → opsi → mode kegagalan → pemantauan → runbook. Bab 32. Lintas domain.

**Athena** — Layanan kueri SQL serverless untuk data di S3. Bayar per TB yang dipindai. Terbaik dengan format kolumnar Parquet/ORC. Bab 26. Domain 3.

**Auto Scaling Group (ASG)** — Sekelompok instance EC2 yang dikelola bersama, secara otomatis mengganti instance yang tidak sehat dan menskala berdasarkan beban. Bab 7. Domain 2, 3.

**Availability Zone (AZ)** — Satu atau lebih pusat data yang terpisah secara fisik dalam sebuah region, terhubung oleh tautan latensi rendah. Bab 2. Domain 2.

---

## B

**AWS Backup** — Backup terpusat berbasis kebijakan di seluruh EBS, RDS, DynamoDB, EFS, dan Storage Gateway. Mendukung salinan lintas region dan lintas akun. Bab 18, 23. Domain 2.

**AWS Batch** — Komputasi batch terkelola untuk kontainer Docker. Terdiri dari job definition (apa yang dijalankan), job queue (di mana job menunggu), dan compute environment (EC2 atau Fargate, On-Demand atau Spot). Untuk beban kerja yang melampaui batas 15 menit Lambda. Bab 21. Domain 3.

**Bucket (S3)** — Kontainer untuk objek S3. Bucket memiliki nama global yang unik dan berada di region tertentu. Bab 5. Domain 3.

**Bucket policy** — Kebijakan berbasis sumber daya yang terpasang pada bucket S3 yang mengontrol akses untuk IAM principal dan akun eksternal. Bab 5. Domain 1.

---

## C

**Pola cache-aside** — Aplikasi memeriksa cache terlebih dahulu; saat miss, mengkueri database, lalu menyimpan hasil di cache. Bab 10. Domain 3.

**Cache hit rate** — Persentase permintaan yang dilayani dari cache alih-alih dari origin. Lebih tinggi lebih baik. Bab 13. Domain 3.

**AWS Client VPN** — Endpoint OpenVPN terkelola. Menghubungkan perangkat individu (laptop, workstation) ke sebuah VPC melalui internet. Autentikasi melalui Active Directory, federasi SAML 2.0 dengan penyedia identitas, atau mutual TLS. Mendukung mode split-tunnel dan full-tunnel. Kontras dengan Site-to-Site VPN (jaringan-ke-jaringan). Bab 11. Domain 1.

**CloudFront** — CDN AWS. Menyimpan cache konten di 750+ edge location di seluruh dunia. Mengurangi latensi dan biaya transfer data origin. Bab 13. Domain 3, 4.

**CloudTrail** — Mencatat setiap panggilan API AWS: siapa, apa, kapan, dari mana. Disimpan di S3. Digunakan untuk audit dan investigasi insiden. Domain 1.

**CloudWatch** — Metrik, log, alarm, dan dashboard untuk sumber daya AWS dan aplikasi kustom. Dirujuk di sepanjang buku. Semua domain.

**Amazon Cognito** — Autentikasi untuk pengguna akhir aplikasi Anda: User Pool adalah direktori pengguna terkelola (pendaftaran, sign-in, MFA, login sosial, JWT); Identity Pool menerbitkan kredensial AWS sementara. IAM untuk engineer Anda; Cognito untuk pelanggan Anda. Bab 14. Domain 1.

**Cold start (Lambda)** — Penundaan pada pemanggilan pertama (atau setelah tidak aktif) saat Lambda menginisialisasi lingkungan eksekusi. Gunakan provisioned concurrency untuk menghilangkannya. Bab 20. Domain 3.

**Compute Savings Plan** — Komitmen terhadap jumlah dolar pengeluaran EC2 per jam, berlaku untuk jenis atau ukuran instance apa pun. Bab 27. Domain 4.

**Config (AWS)** — Melacak perubahan konfigurasi sumber daya AWS dari waktu ke waktu dan mengevaluasi kepatuhan terhadap aturan. Bab 31. Domain 1.

**AWS Control Tower** — Mengotomatiskan tata kelola multi-akun: membangun landing zone (akun management, log archive, dan audit) dengan guardrail dalam hitungan menit — versi pra-rakit dari mengkonfigurasi Organizations, CloudTrail, dan Config secara manual. Bab 14. Domain 1.

**Transfer data cross-AZ** — Lalu lintas antar Availability Zone dalam sebuah region. Dikenai biaya $0,01/GB setiap arah. Bab 30. Domain 4.

**Replikasi cross-region** — Menyalin data (S3 CRR, Aurora Global, DynamoDB Global Tables) ke region yang berbeda. Menimbulkan biaya transfer data. Bab 18, 23, 30. Domain 2.

---

## D

**AWS DataSync** — Migrasi dan sinkronisasi berbasis agen dari file share (NFS/SMB) ke S3, EFS, atau FSx. "rsync versi super, dengan konsol AWS." Bab 25. Domain 3.

**DAX (DynamoDB Accelerator)** — Cache dalam memori khusus untuk DynamoDB. Latensi baca mikrodetik. Bab 9. Domain 3.

**Dead Letter Queue (DLQ)** — Antrian tempat pesan yang berulang kali gagal diproses dikirim, mencegah pemblokiran antrian. Bab 19. Domain 2.

**AWS DMS (Database Migration Service)** — Memigrasikan database ke AWS dengan downtime minimal. Full load (salinan awal) ditambah CDC (Change Data Capture) menjaga sumber dan target tetap tersinkron selama migrasi. Migrasi homogen (jenis engine sama): gunakan DMS langsung. Migrasi heterogen (jenis engine berbeda, mis. Oracle → Aurora PostgreSQL): gunakan SCT (Schema Conversion Tool) terlebih dahulu, lalu DMS. Bab 8. Domain 3.

**Dedicated Host** — Server EC2 fisik yang dicadangkan secara eksklusif untuk penggunaan Anda. Diperlukan untuk lisensi perangkat lunak tertentu. Bab 27. Domain 4.

**Defense in depth** — Melapisi beberapa kontrol keamanan (IAM + security group + NACL + WAF + GuardDuty) sehingga kompromi satu lapisan tidak mengekspos sistem. Bab 33. Domain 1.

**Direct Connect** — Koneksi jaringan privat khusus dari lokasi on-premises ke AWS. Lebih konsisten daripada VPN. Bab 25. Domain 3.

**DLQ** — Lihat Dead Letter Queue.

**DynamoDB** — Database NoSQL yang dikelola sepenuhnya dengan latensi milidetik satu digit pada skala berapa pun. Model key-value dan dokumen. Bab 9. Domain 3.

**DynamoDB Auto Scaling** — Secara otomatis menyesuaikan provisioned read/write capacity berdasarkan metrik CloudWatch. Bab 29. Domain 4.

**DynamoDB Streams** — Log perubahan terurut waktu dari semua perubahan item dalam sebuah tabel DynamoDB. Digunakan dengan Lambda untuk pemrosesan berbasis peristiwa. Bab 9. Domain 2.

---

## E

**EBS (Elastic Block Store)** — Penyimpanan blok yang terpasang ke satu instance EC2. Bertahan secara independen. Jenis: gp3, io2, st1. Bab 6. Domain 3.

**EC2 (Elastic Compute Cloud)** — Mesin virtual di cloud. Bab 4. Domain 3.

**ECS (Elastic Container Service)** — Orkestrasi kontainer terkelola. Jenis peluncuran Fargate menghilangkan pengelolaan server. Bab 21. Domain 2, 3.

**EFS (Elastic File System)** — Sistem file NFS bersama yang dapat diakses dari beberapa instance EC2. Skala secara otomatis. Storage class meliputi Standard, Infrequent Access, dan Archive, dengan Intelligent-Tiering untuk perpindahan otomatis antar tier. Bab 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Control plane Kubernetes terkelola di AWS. Bab 21. Domain 3.

**Elastic Disaster Recovery (DRS)** — Replikasi kontinu tingkat blok dari server (on-premises atau EC2) ke area staging berbiaya rendah, dengan instance pemulihan diluncurkan dalam hitungan menit — sebuah pilot light terkelola. Bab 18. Domain 2.

**ElastiCache** — Caching dalam memori terkelola. Redis (fitur lebih kaya) atau Memcached (lebih sederhana). Bab 10. Domain 3.

**Elastic IP** — Alamat IP publik statis yang dapat Anda alokasikan dan kaitkan ulang dengan instance EC2. Bab 11. Domain 3.

**Envelope encryption** — Pola di mana data dienkripsi dengan data key (DEK), dan DEK dienkripsi dengan master key (CMK di KMS). Bab 16. Domain 1.

**EventBridge** — Event bus untuk merutekan peristiwa dari layanan AWS, mitra SaaS, dan sumber kustom ke target. Mendukung scheduled rule. Bab 22. Domain 2.

**Explicit deny** — Pernyataan deny IAM yang tidak dapat ditimpa oleh allow apa pun. Diutamakan di atas semua allow. Bab 3. Domain 1.

---

## F

**Failover routing (Route 53)** — Merutekan lalu lintas ke endpoint sekunder ketika yang utama gagal health check. Bab 12. Domain 2.

**Fargate** — Engine komputasi serverless untuk ECS dan EKS. Tidak ada instance EC2 yang perlu dikelola. Bab 21. Domain 3.

**Pola fan-out** — Satu topic SNS mengirim pesan yang sama ke beberapa antrian SQS secara bersamaan. Bab 19. Domain 2.

**FIFO queue (SQS)** — Pemrosesan tepat-sekali, pengurutan ketat. Throughput lebih rendah daripada standard queue. Bab 19. Domain 2.

**Mode kegagalan (Failure mode)** — Cara spesifik suatu sistem dapat gagal. Mengidentifikasi mode kegagalan sebelum produksi adalah inti dari tinjauan arsitektur. Bab 32. Lintas domain.

---

## G

**Gateway Endpoint** — Jenis VPC endpoint gratis untuk S3 dan DynamoDB. Merutekan lalu lintas melalui jaringan privat AWS, menghilangkan biaya NAT Gateway. Bab 30. Domain 4.

**Gateway Load Balancer (GWLB)** — Load balancer Layer 3 untuk menyisipkan appliance jaringan virtual pihak ketiga (firewall, IDS/IPS) secara inline ke dalam aliran lalu lintas. Bab 7. Domain 1.

**Geolocation routing (Route 53)** — Merutekan berdasarkan lokasi geografis asal kueri DNS. Bab 12. Domain 3.

**Global Accelerator** — Merutekan lalu lintas ke edge AWS terdekat melalui Anycast, meningkatkan latensi untuk aplikasi dinamis. Bab 25. Domain 3.

**Glue (AWS)** — ETL serverless. Glue Crawler menemukan skema; Glue Job mentransformasi data; Data Catalog menyimpan metadata. Bab 26. Domain 3.

**GSI (Global Secondary Index)** — Indeks alternatif pada tabel DynamoDB dengan partition key berbeda dan sort key opsional. Memungkinkan pola kueri yang fleksibel. Bab 9. Domain 3.

**GuardDuty** — Layanan deteksi ancaman yang menggunakan ML pada CloudTrail, VPC Flow Log, dan log DNS untuk mendeteksi aktivitas tidak biasa. Bab 17. Domain 1.

---

## H

**Health check (Route 53)** — Memantau ketersediaan endpoint. Health check yang gagal memicu failover routing. Bab 12. Domain 2.

**Hot partition (DynamoDB)** — Sebuah partisi yang menerima lalu lintas tidak proporsional karena banyak permintaan berbagi partition key yang sama. Bab 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — Mengontrol autentikasi dan otorisasi untuk akun AWS. User, group, role, policy. Bab 3, 14. Domain 1.

**IAM role** — Identitas IAM dengan kredensial sementara, diasumsikan oleh layanan, user, atau akun lain. Bab 3, 14. Domain 1.

**Idempotensi (Idempotency)** — Properti dari sebuah operasi yang menghasilkan hasil yang sama baik dipanggil sekali maupun berkali-kali. Kritis untuk sistem terdistribusi (refund, pembayaran, pemrosesan pesanan). Bab 32. Lintas domain.

**Idempotency key** — Pengidentifikasi unik untuk sebuah operasi, diperiksa sebelum eksekusi untuk mencegah pemrosesan ganda. Bab 32. Lintas domain.

**Interface Endpoint (PrivateLink)** — VPC endpoint untuk sebagian besar layanan AWS. Dikenai biaya per jam + per GB. Menyediakan konektivitas privat tanpa internet atau NAT. Bab 30. Domain 4.

**Internet Gateway (IGW)** — Memungkinkan instance di subnet publik berkomunikasi dengan internet. Memerlukan route table subnet untuk memiliki rute ke IGW. Bab 11. Domain 3.

**"It depends"** — Jawaban jujur untuk sebagian besar pertanyaan arsitektur, yang harus selalu dilengkapi: "Tergantung pada pola akses / skala / konsekuensi kegagalan / batasan biaya." Bab 33. Lintas domain.

---

## K

**Kinesis Data Firehose** — Nama lama Amazon Data Firehose: pengiriman terkelola data streaming ke S3, Redshift, OpenSearch. Tanpa pengelolaan konsumer. Pertanyaan ujian lama mungkin masih menggunakan nama lama. Bab 26. Domain 3.

**Kinesis Data Streams** — Stream peristiwa terurut real-time. Durabel, dapat diputar ulang dalam jendela retensi (default 24 jam, hingga 365 hari). Diukur dalam shard. Bab 26. Domain 3.

**KMS (Key Management Service)** — Membuat, menyimpan, dan mengontrol kunci kriptografis untuk enkripsi saat istirahat. Bab 16. Domain 1.

---

## L

**Lambda** — Fungsi serverless yang dipicu oleh peristiwa. Bayar per pemanggilan dan per ms. Durasi maksimum 15 menit. Bab 20. Domain 2, 3, 4.

**Lambda@Edge** — Fungsi Lambda yang berjalan di edge location CloudFront, memodifikasi permintaan dan respons. Bab 13. Domain 3.

**AWS Lake Formation** — Lapisan kontrol akses data lake terpusat di atas S3 dan Glue Data Catalog. Menyediakan izin berbutir halus di tingkat tabel, kolom, dan baris. Menyederhanakan penyiapan data lake yang aman. Bab 26. Domain 3.

**Latency-based routing (Route 53)** — Merutekan kueri DNS ke region AWS dengan latensi terukur terendah. Bab 12. Domain 3.

**Launch template** — Template berversi yang menentukan konfigurasi instance EC2 untuk Auto Scaling Group. Bab 7. Domain 3.

**Least privilege** — Praktik terbaik IAM: berikan hanya izin yang diperlukan, tidak lebih. Bab 3. Domain 1.

**Lifecycle policy (S3)** — Aturan yang secara otomatis memindahkan objek ke storage class yang lebih murah atau menghapusnya berdasarkan usia. Bab 23. Domain 4.

**LSI (Local Secondary Index)** — Indeks alternatif pada tabel DynamoDB yang menggunakan partition key yang sama tetapi sort key yang berbeda. Harus dibuat saat pembuatan tabel. Bab 9. Domain 3.

---

## M

**Amazon Macie** — Penemuan berbasis ML terhadap data sensitif (PII) di S3 dan penandaan risiko paparan. GuardDuty mengawasi perilaku; Macie mengaudit apa yang disimpan. Bab 17. Domain 1.

**Memcached** — Engine caching dalam memori yang sederhana dan multi-threaded. Tanpa persistensi, tanpa struktur data. Gunakan Redis kecuali Anda secara khusus memerlukan multi-threading dengan mengorbankan fitur. Bab 10. Domain 3.

**Amazon MemoryDB for Redis** — Database utama dalam memori yang durabel dan kompatibel dengan Redis. Tidak seperti ElastiCache, MemoryDB menulis ke transaction log Multi-AZ, menjamin durabilitas data. Gunakan ketika kompatibilitas API Redis diperlukan DAN kehilangan data tidak dapat diterima. Bab 10. Domain 3.

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: replikasi tingkat blok dari seluruh server ke AWS, peluncuran uji, lalu cutover ke instance EC2 native. DataSync memindahkan file; DMS memindahkan database; MGN memindahkan server. Bab 25. Domain 3.

**Amazon MQ** — Broker ActiveMQ/RabbitMQ terkelola yang berbicara protokol standar (AMQP, MQTT, STOMP). Untuk lift-and-shift beban kerja broker yang sudah ada tanpa perubahan kode; messaging dari awal → SQS/SNS. Bab 19. Domain 2.

**Multi-AZ (RDS)** — Replika standby sinkron di AZ yang berbeda dengan failover otomatis. RPO ~0, RTO ~60 detik. Untuk ketersediaan tinggi, bukan penskalaan baca. Bab 8, 18. Domain 2.

**Multi-Region** — Menyebarkan komponen aplikasi di beberapa region AWS untuk redundansi geografis dan performa global. Kompleksitas dan biaya lebih tinggi. Bab 18. Domain 2.

---

## N

**Network Load Balancer (NLB)** — Load balancer Layer 4 (TCP/UDP/TLS): jutaan permintaan per detik, IP statis per AZ, melestarikan source IP. Tidak ada kesadaran HTTP — itu tugas ALB. Bab 7. Domain 3.

**NACL (Network Access Control List)** — Firewall stateless di tingkat subnet. Memerlukan aturan masuk dan keluar. Aturan dievaluasi dalam urutan numerik. Bab 15. Domain 1.

**NAT Gateway** — Memungkinkan instance di subnet privat membuat koneksi keluar ke internet. Dikenai biaya $0,045/GB yang diproses. Bab 11, 30. Domain 4.

---

## O

**Object (S3)** — File yang disimpan di S3. Terdiri dari key (nama), value (data), dan metadata. Ukuran maksimum 5TB. Bab 5. Domain 3.

**On-Demand capacity (DynamoDB)** — Mode bayar per permintaan. Lebih mahal per permintaan daripada provisioned, tetapi tidak memerlukan perencanaan kapasitas. Bab 29. Domain 4.

**On-Demand instances (EC2)** — Bayar per jam tanpa komitmen. Fleksibilitas maksimum, harga maksimum. Bab 27. Domain 4.

**AWS Outposts** — Rak perangkat keras AWS yang dikelola sepenuhnya dan dipasang di pusat data pelanggan sendiri atau fasilitas co-location. Menjalankan layanan, API, dan perkakas AWS yang sama dengan cloud publik secara on-premises. AWS mengelola pemasangan dan patching; pelanggan menyediakan ruang rak dan daya. Untuk residensi data, beban kerja on-premises latensi rendah, atau skenario terputus. Bab 2. Domain 4.

---

## P

**Partition key (DynamoDB)** — Komponen primary key yang menentukan partisi mana yang menyimpan sebuah item. Pilih key berkardinalitas tinggi untuk distribusi yang merata. Bab 9. Domain 3.

**Permission boundary** — Kebijakan IAM yang menetapkan izin maksimum yang dapat dimiliki identitas IAM, meskipun kebijakan lain memberikan lebih banyak. Bab 14. Domain 1.

**Placement group** — Mengontrol penempatan fisik instance EC2 untuk meminimalkan latensi (cluster) atau memaksimalkan ketersediaan (spread). Bab 4. Domain 3.

**PrivateLink** — Layanan AWS untuk membuat endpoint privat ke layanan yang di-host di AWS, dapat diakses melalui Interface Endpoint. Bab 30. Domain 1.

**Provisioned concurrency (Lambda)** — Lingkungan eksekusi yang sudah diinisialisasi sebelumnya yang menghilangkan penundaan cold start. Bab 20. Domain 3.

**Provisioned capacity (DynamoDB)** — Throughput baca dan tulis yang dialokasikan sebelumnya, diukur dalam capacity unit per detik. Lebih murah daripada on-demand untuk lalu lintas yang dapat diprediksi. Bab 9, 29. Domain 4.

---

## Q

**Amazon QuickSight** — Layanan business intelligence dan visualisasi data terkelola. Menggunakan SPICE (Super-fast, Parallel, In-memory Calculation Engine) untuk menyimpan cache data demi rendering dashboard yang cepat. Terhubung ke Athena, S3, Redshift, RDS, dan sumber data AWS lainnya. Tidak ada server BI yang perlu dikelola. Bab 26. Domain 3.

---

## R

**RDS (Relational Database Service)** — Database relasional terkelola. Menangani backup, patching, failover. Bab 8. Domain 3.

**RDS Proxy** — Mengelola connection pool antara Lambda/aplikasi dan RDS, mencegah kehabisan koneksi. Bab 8. Domain 3.

**Read Replica (RDS)** — Salinan asinkron dari database untuk penskalaan baca. TIDAK menyediakan failover otomatis. Bab 8, 24. Domain 3.

**Redis** — Penyimpanan struktur data dalam memori yang digunakan untuk caching, manajemen sesi, leaderboard real-time, pub/sub. Bab 10. Domain 3.

**Reserved Instance (EC2)** — Komitmen untuk menggunakan jenis instance tertentu di region tertentu selama 1 atau 3 tahun sebagai imbalan diskon. Bab 27. Domain 4.

**Route 53** — Layanan DNS dan registrar domain AWS. Mendukung beberapa kebijakan routing. Bab 12. Domain 2, 3.

**RPO (Recovery Point Objective)** — Kehilangan data maksimum yang dapat diterima diukur dalam waktu. "Berapa banyak data yang mampu kita kehilangan?" Bab 18. Domain 2.

**RTO (Recovery Time Objective)** — Waktu maksimum yang dapat diterima untuk memulihkan layanan setelah kegagalan. "Berapa lama kita dapat down?" Bab 18. Domain 2.

**Runbook** — Instruksi langkah demi langkah untuk mengoperasikan sebuah sistem, khususnya untuk respons insiden. "Apa yang dilakukan seseorang pada pukul 3 pagi?" Bab 32. Lintas domain.

---

## S

**S3 Intelligent-Tiering** — Secara otomatis memindahkan objek S3 antar tier akses berdasarkan pola akses. Tanpa biaya pengambilan. Bab 23. Domain 4.

**S3 Select** — Mengambil sebagian konten objek S3 menggunakan ekspresi SQL, mengurangi transfer data. Legacy: tidak tersedia untuk pelanggan baru sejak pertengahan 2024 — Athena kini menjadi jalur utama untuk memfilter dan mengkueri data di S3. S3 Object Lambda, yang dulu disarankan sebagai alternatif, kini juga legacy (ditutup untuk pelanggan baru pada November 2025; beban kerja yang ada tetap berfungsi). Bab 30. Domain 4.

**Savings Plan** — Model penetapan harga fleksibel yang berkomitmen terhadap jumlah dolar pengeluaran per jam sebagai imbalan diskon. Lebih fleksibel daripada Reserved Instances. Bab 27. Domain 4.

**SCP (Service Control Policy)** — Kebijakan AWS Organizations yang membatasi izin maksimum yang tersedia untuk akun dalam sebuah OU. Bab 14. Domain 1.

**Secrets Manager** — Menyimpan dan secara otomatis merotasi secret (kata sandi database, API key). Bab 16. Domain 1.

**Security group** — Firewall virtual stateful di tingkat instance. Hanya allow rule; lalu lintas balasan otomatis. Bab 15. Domain 1.

**Shard (Kinesis)** — Unit dasar throughput di Kinesis Data Streams: tulis 1 MB/s, baca 2 MB/s. Bab 26. Domain 3.

**Shared Responsibility Model** — AWS bertanggung jawab atas keamanan *atas* cloud (infrastruktur); Anda bertanggung jawab atas keamanan *di dalam* cloud (data, konfigurasi, akses). Bab 1. Domain 1.

**Shield** — Perlindungan DDoS. Standard: gratis, otomatis. Advanced: berbayar, dengan dukungan DRT dan perlindungan finansial. Bab 17. Domain 1.

**Snow Family** — Perangkat fisik untuk transfer data massal offline (Snowball Edge: 80 TB) — mencarter penerbangan kargo alih-alih menyetir di jalan tol. Legacy (2026): Snowmobile dan Snowcone dihentikan; perangkat Snow ditutup untuk pelanggan baru pada November 2025 (AWS mengarahkan ke DataSync dan Data Transfer Terminals), tetapi ujian SAA-C03 masih mengharapkan Snowball untuk "berminggu-minggu transfer, bandwidth terbatas." Bab 25. Domain 3.

**SNS (Simple Notification Service)** — Messaging pub/sub. Mendorong pesan ke semua subscriber secara bersamaan. Pola fan-out. Bab 19. Domain 2.

**Sort key (DynamoDB)** — Komponen kedua opsional dari primary key. Memungkinkan kueri rentang dalam sebuah partisi. Bab 9. Domain 3.

**Spot Instances** — Instance EC2 yang menggunakan kapasitas cadangan dengan diskon 60-90%. Dapat diinterupsi dengan pemberitahuan 2 menit. Hanya untuk beban kerja yang toleran terhadap kesalahan. Bab 27. Domain 4.

**SQS (Simple Queue Service)** — Antrian pesan terkelola. Memisahkan produser dari konsumer. Antrian Standard (setidaknya-sekali) dan FIFO (tepat-sekali). Bab 19. Domain 2.

**Step Functions** — Layanan orkestrasi alur kerja serverless. State machine untuk mengoordinasikan layanan AWS. Bab 22. Domain 2.

**AWS Storage Gateway** — Jembatan antara penyimpanan on-premises dan cloud: menyajikan antarmuka NFS/SMB (File), iSCSI (Volume), atau virtual tape (Tape) secara lokal sambil menyimpan data secara permanen di S3, Glacier, atau snapshot EBS. Bab 6. Domain 3.

---

## T

**Target tracking scaling** — Kebijakan Auto Scaling yang menyesuaikan kapasitas untuk mempertahankan nilai metrik target (mis. utilisasi CPU 60%). Bab 7. Domain 2.

**AWS Transfer Family** — Endpoint SFTP/FTPS/FTP terkelola yang didukung oleh S3 atau EFS. Mitra tetap menggunakan klien SFTP mereka yang sudah ada; file langsung masuk ke bucket Anda. Bab 25. Domain 3.

**Transit Gateway** — Topologi jaringan hub-and-spoke yang menghubungkan beberapa VPC dan jaringan on-premises melalui gateway pusat. Bab 25. Domain 3.

**TTL (Time to Live)** — Stempel waktu setelahnya DynamoDB secara otomatis menghapus sebuah item. Juga digunakan dalam DNS (berapa lama resolver menyimpan cache sebuah record) dan caching (berapa lama nilai yang di-cache valid). Bab 9, 12. Domain 3.

---

## V

**VIF (Virtual Interface)** — Koneksi logis yang digunakan dengan AWS Direct Connect. Public VIF mengakses endpoint publik AWS; Private VIF mengakses sumber daya VPC. Bab 25. Domain 3.

**Visibility timeout (SQS)** — Periode selama pesan yang diterima disembunyikan dari konsumer lain. Memungkinkan pemrosesan tanpa konsumer lain melihat pesan yang sama. Bab 19. Domain 2.

**VPC (Virtual Private Cloud)** — Jaringan virtual terisolasi di AWS. Berisi subnet, route table, dan gateway. Bab 11. Domain 1.

**VPC Endpoint** — Menghubungkan sumber daya VPC ke layanan AWS melalui jaringan privat AWS. Gateway (gratis, S3/DynamoDB) dan Interface (berbayar, sebagian besar layanan lain). Bab 30. Domain 1, 4.

**VPC Flow Logs** — Menangkap informasi tentang lalu lintas IP yang menuju dan dari antarmuka jaringan dalam sebuah VPC. Digunakan oleh GuardDuty dan untuk pemecahan masalah jaringan. Bab 17. Domain 1.

**VPC Peering** — Koneksi jaringan antara dua VPC yang memungkinkan lalu lintas dirutekan di antaranya menggunakan alamat IP privat. Bab 11. Domain 3.

---

## W

**WAF (Web Application Firewall)** — Memfilter lalu lintas HTTP/HTTPS menggunakan aturan (blok IP, SQL injection, rate limit). Terpasang pada CloudFront, ALB, atau API Gateway. Bab 17. Domain 1.

**AWS Wavelength** — Infrastruktur AWS yang ditempatkan di dalam jaringan penyedia telekomunikasi 5G di edge radio. Memungkinkan latensi milidetik satu digit ke perangkat seluler. Untuk AR/VR seluler, gaming real-time, telemetri kendaraan otonom, dan video langsung di edge 5G. Wavelength Zone adalah perpanjangan dari Region AWS di dalam jaringan telekomunikasi. Bab 2. Domain 3.

**Well-Architected Framework** — Kerangka kerja evaluasi enam pilar AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Bab 31. Lintas domain.

**Weighted routing (Route 53)** — Mendistribusikan kueri DNS ke seluruh endpoint berdasarkan bobot. Digunakan untuk deployment blue-green dan pengujian A/B. Bab 12. Domain 3.

**Write-through caching** — Memperbarui cache setiap kali database diperbarui. Data selalu konsisten tetapi cache mungkin menyimpan banyak item yang tidak pernah dibaca ulang. Bab 10. Domain 3.

---

## Referensi Pola Cepat SAA-C03

| Jika ujian menyebut...                        | Pikirkan...                                  |
|-----------------------------------------------|----------------------------------------------|
| "Decouple services"                           | SQS, SNS, EventBridge                        |
| "Fan-out ke beberapa konsumer"                | SNS + subscription SQS                       |
| "Peristiwa terurut real-time"                 | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Latensi rendah global (dinamis)"             | Global Accelerator                           |
| "Latensi rendah global (statis/cached)"       | CloudFront                                   |
| "Perlindungan DDoS"                           | Shield (Standard: gratis; Advanced: berbayar) |
| "Blokir SQL injection di edge"                | WAF                                          |
| "Deteksi kredensial yang dikompromikan"       | GuardDuty                                    |
| "Audit aktivitas API"                         | CloudTrail                                   |
| "Rotasi kredensial database"                  | Secrets Manager                              |
| "Enkripsi data saat istirahat, customer-managed key" | KMS dengan CMK                        |
| "Simpan nilai konfigurasi"                    | SSM Parameter Store                          |
| "Penyimpanan database IOPS tinggi"            | EBS io2                                      |
| "Sistem file bersama untuk EC2"               | EFS                                          |
| "Kueri data S3 dengan SQL"                    | Athena                                       |
| "Pipeline ETL untuk analitik"                 | AWS Glue                                     |
| "Kirim data streaming ke S3"                  | Amazon Data Firehose                         |
| "Job batch fault-tolerant, minimalkan biaya"  | Spot Instances                              |
| "Beban kerja produksi stabil terkomitmen"     | Savings Plans                                |
| "Subnet privat → S3 tanpa NAT"                | S3 Gateway Endpoint                          |
| "Subnet privat → SQS tanpa NAT"               | SQS Interface Endpoint                       |
| "Multi-AZ untuk RDS"                          | Failover otomatis (bukan penskalaan baca)    |
| "Read Replica untuk RDS"                      | Penskalaan baca (bukan failover otomatis)    |
| "Waktu pemulihan 1–2 menit, cross-AZ"         | Multi-AZ (failover RDS: 60–120 detik)        |
| "Pemulihan lintas region, RTO menit"          | Pilot Light atau Warm Standby                |
| "Active-Active, RTO nol"                      | Multi-Region Active-Active (paling kompleks) |
| "Pemrosesan batch melampaui timeout Lambda"   | AWS Batch                                    |
| "Kompatibel Redis DAN durabel"                | MemoryDB for Redis                           |
| "Engineer jarak jauh mengakses VPC dari rumah" | Client VPN                                  |
| "Migrasi database dengan downtime minimal"    | DMS (+ SCT untuk heterogen)                  |
| "Dashboard BI di AWS"                         | QuickSight                                   |
| "Menjalankan AWS di pusat data Anda sendiri"  | Outposts                                     |
| "Komputasi edge seluler 5G"                   | Wavelength                                   |
