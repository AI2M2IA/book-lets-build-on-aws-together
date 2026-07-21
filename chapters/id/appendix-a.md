# Lampiran A: Referensi Cepat Layanan AWS

Setiap layanan yang tercakup dalam buku ini, dalam urutan diperkenalkan. Gunakan ini sebagai referensi studi dan pencarian cepat selama persiapan ujian.

---

## Komputasi

**EC2 — Elastic Compute Cloud** *(Bab 4)*

Mesin virtual di cloud. Anda memilih jenis instance (CPU, memori, penyimpanan), sistem operasi, dan region. Anda membayar per jam (On-Demand), per komitmen (Reserved Instances / Savings Plans), atau per slot kapasitas cadangan (Spot). Primitif komputasi yang fundamental.

Konsep kunci: AMI (Amazon Machine Image), jenis instance (keluarga t3, m6g, r6g, c6g), key pair, instance profile, placement group.

Sinyal ujian: Ketika sebuah skenario membutuhkan komputasi yang persisten, stateful, atau berjalan lama — EC2 atau ECS. Ketika sebuah skenario membutuhkan durasi pendek, dipicu peristiwa, atau komputasi tanpa biaya idle — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Bab 7)*

Auto Scaling Group (ASG) menambahkan dan menghapus instance EC2 berdasarkan beban. Application Load Balancer (ALB) mendistribusikan lalu lintas ke seluruh instance dan merutekan berdasarkan path atau host. Bersama-sama keduanya membentuk lapisan penskalaan horizontal.

Konsep kunci: Launch template, kebijakan penskalaan (target tracking, step, scheduled), health check, target group ALB, listener rule, weighted routing.

Sinyal ujian: "Tangani beban variabel" atau "ketersediaan tinggi di seluruh AZ" → ASG + ALB.

---

**Lambda** *(Bab 20)*

Fungsi serverless. Anda menulis kode; AWS menjalankannya sebagai respons terhadap peristiwa. Tidak ada server yang perlu dikelola. Anda membayar per pemanggilan dan per milidetik eksekusi. Skala secara otomatis ke ribuan eksekusi bersamaan.

Konsep kunci: Sumber peristiwa (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, batas konkurensi, reserved dan provisioned concurrency, cold start, Layers, durasi maksimum 15 menit.

Sinyal ujian: "Serverless," "berbasis peristiwa," "tugas durasi pendek," "tanpa biaya idle" → Lambda.

---

**ECS — Elastic Container Service** *(Bab 21)*

Menjalankan kontainer Docker di AWS. Dua jenis peluncuran: EC2 (Anda mengelola host) dan Fargate (AWS mengelola host). ECS mengelola task definition, service, penjadwalan cluster, serta integrasi dengan load balancer dan service discovery.

Konsep kunci: Task definition, ECS service, jenis peluncuran Fargate vs. EC2, ECR (container registry), task IAM role, service auto scaling.

Sinyal ujian: "Beban kerja terkontainerisasi," "microservice," "Docker di AWS" → ECS (biasanya Fargate untuk kontainer serverless).

---

**EKS — Elastic Kubernetes Service** *(Bab 21)*

Kubernetes yang dikelola. AWS menjalankan control plane; Anda menjalankan worker node (EC2 atau Fargate). Gunakan EKS ketika tim Anda sudah menggunakan Kubernetes atau memiliki beban kerja yang memerlukan fitur khusus Kubernetes.

Sinyal ujian: "Kubernetes," "perlu memigrasikan beban kerja K8s yang ada" → EKS. "Hanya perlu kontainer tanpa overhead K8s" → ECS.

---

**AWS Batch** *(Bab 21)*

Komputasi batch terkelola untuk kontainer Docker. Anda mendefinisikan sebuah job (image Docker + command), sebuah job queue, dan sebuah compute environment (EC2 atau Fargate). AWS Batch menyediakan dan menskalakan komputasi secara otomatis, lalu menghentikannya saat job selesai. Mendukung Spot Instances untuk mengurangi biaya.

Konsep kunci: Job definition (apa yang dijalankan), job queue (di mana job menunggu), compute environment (EC2 atau Fargate, On-Demand atau Spot), array job (menjalankan banyak salinan paralel dari job yang sama).

Sinyal ujian: "Pemrosesan batch yang melampaui timeout 15 menit Lambda," "job komputasi terbatas pada kontainer," "beban kerja HPC di AWS" → AWS Batch.

---

**AWS Outposts** *(Bab 2)*

Rak perangkat keras AWS yang dikelola sepenuhnya dan dipasang di pusat data Anda sendiri atau fasilitas co-location. Menjalankan layanan, API, dan perkakas AWS yang sama dengan cloud publik (EC2, EBS, RDS, EKS, S3 on Outposts) tetapi secara fisik berada on-premises.

Konsep kunci: API AWS yang sama di on-premises, AWS mengelola pemasangan dan patching, pelanggan menyediakan ruang rak dan daya, Local Gateway (LGW) menghubungkan Outposts ke jaringan on-premises.

Sinyal ujian: "Menjalankan AWS di pusat data Anda sendiri," "residensi data mengharuskan komputasi tetap on-premises," "API AWS tanpa ketergantungan internet" → Outposts.

---

**AWS Wavelength** *(Bab 2)*

Infrastruktur AWS yang ditempatkan di dalam jaringan penyedia telekomunikasi 5G. Wavelength Zone berada di tepi jaringan 5G, memungkinkan latensi milidetik satu digit ke perangkat seluler.

Konsep kunci: Wavelength Zone adalah perpanjangan dari Region AWS di dalam jaringan telekomunikasi, lalu lintas tetap berada di jaringan operator antara perangkat dan Wavelength Zone.

Sinyal ujian: "Latensi milidetik satu digit ke pengguna seluler 5G," "AR/VR seluler," "gaming real-time di seluler," "telemetri kendaraan otonom" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Bab 25)*

Layanan migrasi rehost (lift-and-shift). Sebuah agen mereplikasi disk server sumber blok demi blok ke area staging berbiaya rendah di AWS; Anda meluncurkan salinan uji sesuai permintaan; pada saat cutover, MGN mengonversi server yang direplikasi menjadi instance EC2 native. Tidak diperlukan perubahan aplikasi.

Konsep kunci: Replikasi kontinu tingkat blok, area staging, peluncuran uji sebelum cutover, strategi migrasi "7 R" (MGN = rehost).

Sinyal ujian: "Memigrasikan ratusan VM dengan cepat tanpa perubahan kode," "lift-and-shift server ke EC2" → MGN. DataSync memindahkan *file*; DMS memindahkan *database*; MGN memindahkan *seluruh server*.

---

## Penyimpanan

**S3 — Simple Storage Service** *(Bab 5)*

Penyimpanan objek. Kapasitas tak terbatas, durabilitas 99,999999999% (sebelas sembilan). Menyimpan file sebagai objek di dalam bucket. Bucket berada di sebuah region. Objek dapat berukuran dari 0 byte hingga 5TB.

Konsep kunci: Bucket policy, object ACL, versioning, hosting situs web statis, presigned URL, multipart upload, Transfer Acceleration, storage class (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, ditambah S3 Express One Zone untuk beban kerja directory-bucket single-AZ yang kritis terhadap latensi).

Sinyal ujian: "Menyimpan dan mengambil file," "aset statis," "backup," "data lake" → S3. Storage class yang tepat bergantung pada frekuensi akses dan kecepatan pengambilan.

---

**EBS — Elastic Block Store** *(Bab 6)*

Penyimpanan blok yang terpasang ke satu instance EC2. Berfungsi seperti hard drive. Bertahan secara independen dari siklus hidup instance (Anda dapat melepas dan memasang kembali). Jenis paling umum: gp3 (SSD general purpose, default), io2 (provisioned IOPS untuk database), st1 (HDD throughput-optimized untuk pembacaan sekuensial).

Konsep kunci: Snapshot (inkremental, disimpan di S3), enkripsi (KMS), Multi-Attach (hanya io1/io2), penyediaan IOPS dan throughput.

Sinyal ujian: "Penyimpanan persisten untuk EC2," "penyimpanan database," "memerlukan akses blok latensi rendah" → EBS.

---

**EFS — Elastic File System** *(Bab 6)*

Sistem file bersama, dapat diakses dari beberapa instance EC2 secara bersamaan. Protokol NFS. Skala secara otomatis. Lebih mahal daripada EBS per GB. Storage class meliputi Standard, Infrequent Access, dan Archive. Intelligent-Tiering memindahkan file secara otomatis.

Sinyal ujian: "Sistem file bersama," "beberapa instance EC2 membutuhkan file yang sama," "NFS" → EFS.

---

**Keluarga FSx** *(Bab 6)*

Server file terkelola untuk teknologi bernama tertentu. FSx for Windows File Server: protokol SMB, NTFS, integrasi Active Directory, Multi-AZ. FSx for Lustre: sistem file paralel berperforma tinggi untuk HPC/ML, menyajikan objek S3 sebagai file (lazy loading). FSx for NetApp ONTAP: multi-protokol (NFS + SMB + iSCSI), snapshot, replikasi SnapMirror. FSx for OpenZFS: NFS latensi rendah, snapshot instan dan clone yang dapat ditulis.

Sinyal ujian: "SMB/Active Directory" → FSx for Windows. "Pelatihan HPC/ML pada data S3" → FSx for Lustre. "NFS dan SMB ke data yang sama / migrasi NetApp" → FSx for ONTAP. "Migrasi ZFS / clone instan" → FSx for OpenZFS.

---

**S3 Storage Class dan Lifecycle Policy** *(Bab 23)*

S3 Intelligent-Tiering secara otomatis memindahkan objek antar tier akses berdasarkan frekuensi akses. Lifecycle policy memindahkan objek antar class (Standard → Standard-IA → Glacier) berdasarkan aturan usia. Storage class Glacier memiliki keterlambatan pengambilan mulai dari milidetik (Glacier Instant Retrieval) hingga 12 jam (Glacier Deep Archive).

Sinyal ujian: "Mengurangi biaya penyimpanan untuk data yang jarang diakses" → lifecycle policy, Intelligent-Tiering, atau Glacier.

---

**AWS Storage Gateway** *(Bab 6)*

Layanan penyimpanan hibrida yang menghubungkan lingkungan on-premises ke penyimpanan AWS. Menyajikan penyimpanan melalui protokol yang sudah dipahami aplikasi sambil menyimpan data secara permanen di S3, S3 Glacier, atau sebagai snapshot EBS.

Konsep kunci: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, mode cached atau stored), Tape Gateway (virtual tape library → Glacier).

Sinyal ujian: "Aplikasi on-premises membutuhkan penyimpanan cloud tanpa perubahan kode" → Storage Gateway. "Mengganti backup tape" → Tape Gateway.

---

**AWS DataSync** *(Bab 25)*

Layanan migrasi dan replikasi data berbasis agen. Sebuah agen ringan terhubung ke server file on-premises melalui NFS atau SMB dan menyinkronkan share ke S3, EFS, atau FSx — dengan penjadwalan, pembatasan bandwidth, dan verifikasi integritas yang sudah terpasang.

Konsep kunci: Agen DataSync (VM on-premises atau EC2), sumber NFS/SMB, tujuan S3/EFS/FSx, transfer inkremental terjadwal.

Sinyal ujian: "Memigrasikan atau terus-menerus menyinkronkan sejumlah besar file dari NAS on-premises ke AWS melalui jaringan" → DataSync.

---

**AWS Transfer Family** *(Bab 25)*

Server SFTP, FTPS, dan FTP yang dikelola sepenuhnya, didukung oleh S3 atau EFS sebagai tujuan penyimpanan. Klien terhubung dengan perangkat lunak SFTP mereka yang sudah ada; file yang diunggah langsung masuk ke bucket atau sistem file.

Konsep kunci: Endpoint terkelola (opsional dengan IP statis), penyimpanan pendukung S3 atau EFS, kompatibilitas protokol yang sudah ada untuk mitra eksternal.

Sinyal ujian: "Mitra harus tetap mengunggah melalui SFTP, tetapi file harus masuk ke S3" → Transfer Family.

---

**AWS Snow Family** *(Bab 25)*

Perangkat transfer data fisik untuk migrasi data massal secara offline. Snowball Edge Storage Optimized: 80 TB dapat digunakan, casing yang diperkuat, dikirim ke lokasi Anda; Anda memuat data secara lokal dan mengirimnya kembali untuk diserap ke S3.

Konsep kunci: Lakukan perhitungan transfer terlebih dahulu — jika transfer jaringan akan memakan waktu sekitar seminggu atau lebih, perangkat fisik menang. *Catatan legacy (2026)*: AWS telah memensiunkan keluarga ini — Snowmobile (2024) dan Snowcone (akhir 2024) telah hilang, dan perangkat Snow ditutup untuk pelanggan baru pada November 2025 (AWS kini mengarahkan ke DataSync dan Data Transfer Terminals). Bank soal SAA-C03 mendahului hal ini, jadi ujian masih mengharapkan Snowball sebagai jawaban.

Sinyal ujian: "Migrasi skala petabyte," "bandwidth terbatas, waktu transfer berminggu-minggu" → Snow Family.

---

**AWS Backup** *(Bab 18 dan 23)*

Layanan backup terpusat berbasis kebijakan di seluruh EBS, RDS, DynamoDB, EFS, dan Storage Gateway. Backup plan mendefinisikan jadwal dan retensi; vault menyimpan recovery point.

Konsep kunci: Backup plan dan vault, salinan lintas region dan lintas akun, Vault Lock untuk imutabilitas.

Sinyal ujian: "Memusatkan dan mengotomatiskan backup di beberapa layanan AWS," "salinan backup lintas akun untuk perlindungan ransomware/kompromi akun" → AWS Backup.

---

## Database

**RDS — Relational Database Service** *(Bab 8)*

Database relasional terkelola. Engine yang didukung: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, dan Aurora (engine milik AWS sendiri). AWS menangani backup, patching, failover, dan replikasi. Anda mengelola desain skema, kueri, dan penentuan ukuran instance.

Konsep kunci: Deployment Multi-AZ (failover otomatis, replikasi sinkron), Read Replica (asinkron, untuk penskalaan baca), backup otomatis (retensi 1-35 hari), snapshot manual (disimpan hingga dihapus), RDS Proxy (connection pooling).

Sinyal ujian: "Database relasional," "transaksi ACID," "beban kerja SQL yang sudah ada" → RDS atau Aurora.

---

**Aurora** *(Bab 24)*

Engine database relasional milik AWS, kompatibel dengan MySQL dan PostgreSQL. Engine penyimpanan terdistribusi yang mereplikasi data di 3 AZ dalam 6 salinan. Biasanya 5x lebih cepat dari MySQL. Aurora Serverless v2 menskalakan kapasitas secara otomatis (diukur dalam ACU — Aurora Capacity Unit) dan, pada versi engine yang didukung, dapat melakukan auto-pause ke 0 ACU ketika tidak ada koneksi yang terbuka.

Konsep kunci: Cluster Aurora (writer + hingga 15 Aurora Replica di belakang satu reader endpoint), Aurora Global Database (read replica lintas region dengan lag replikasi < 1 detik), Aurora Serverless v2, ACU, perilaku auto-pause/resume.

Sinyal ujian: "Database relasional berperforma tinggi," "kompatibel MySQL/PostgreSQL," "pembacaan global," "beban kerja variabel" → Aurora.

---

**DynamoDB** *(Bab 9)*

Database NoSQL yang dikelola sepenuhnya. Model key-value dan dokumen. Skala ke throughput berapa pun dengan performa milidetik satu digit. Dua mode kapasitas: on-demand (bayar per permintaan) dan provisioned (bayar per capacity unit per jam, dengan Auto Scaling).

Konsep kunci: Partition key (wajib), sort key (opsional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (change data capture), DynamoDB Accelerator (DAX) — cache dalam memori, TTL (Time to Live), transaksi.

Sinyal ujian: "Akses berbasis kunci throughput tinggi," "skema fleksibel," "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Bab 10)*

Caching dalam memori yang dikelola. Dua engine: Redis (persisten, pub/sub, scripting Lua, struktur data) dan Memcached (cache murni, lebih sederhana, multi-threaded). Gunakan untuk mengurangi beban database dan menyajikan data yang sering dibaca dalam hitungan mikrodetik.

Konsep kunci: Pola cache-aside, pola write-through, kebijakan eviction, TTL, cluster mode (Redis), Multi-AZ dengan failover otomatis.

Sinyal ujian: "Mengurangi beban database," "latensi baca sub-milidetik," "manajemen sesi," "leaderboard real-time" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Bab 10)*

Database utama dalam memori yang durabel dan kompatibel dengan Redis. Tidak seperti ElastiCache (yang merupakan cache di mana kehilangan data dapat diterima), MemoryDB menyimpan transaction log Multi-AZ dan menjamin durabilitas. Anda dapat menggunakan MemoryDB sebagai database utama — bukan hanya cache di depan database lain.

Konsep kunci: Kompatibilitas API Redis, transaction log Multi-AZ (jaminan durabilitas), performa dalam memori, database utama (bukan lapisan cache).

Sinyal ujian: "Kompatibel Redis DAN kehilangan data tidak dapat diterima," "database dalam memori yang durabel" → MemoryDB. "Redis sebagai cache, kehilangan data dapat diterima" → ElastiCache Redis.

---

**Database Khusus (Purpose-Built)** *(Bab 9, 10, dan 24)*

Cocokkan bentuk data dengan engine. DocumentDB: dokumen yang kompatibel dengan MongoDB. Neptune: database graf (relasi, traversal — Gremlin/SPARQL). Keyspaces: wide-column yang kompatibel dengan Cassandra. Timestream: time-series (penawaran saat ini: Timestream for InfluxDB). MemoryDB: database *utama* yang durabel dan kompatibel dengan Redis (vs ElastiCache = cache). QLDB ("ledger kriptografis imutabel") dihentikan pada 2025 — anggap sebagai distraktor legacy.

Sinyal ujian: "graf sosial / rekomendasi / cincin penipuan" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "Telemetri IoT dari waktu ke waktu" → Timestream.

---

**AWS DMS — Database Migration Service** *(Bab 8)*

Memigrasikan database ke AWS dengan downtime minimal. Mendukung full load (salinan awal) ditambah CDC (Change Data Capture) untuk menjaga sumber dan target tetap tersinkron selama migrasi berjalan. Ketika memigrasikan antara jenis engine yang sama (MySQL → MySQL, PostgreSQL → PostgreSQL), gunakan DMS secara langsung. Ketika memigrasikan antara jenis engine yang berbeda (Oracle → Aurora PostgreSQL), gunakan AWS Schema Conversion Tool (SCT) terlebih dahulu untuk mengonversi skema, lalu DMS untuk datanya.

Konsep kunci: Replication instance, source dan target endpoint, full load + CDC, SCT (Schema Conversion Tool) untuk migrasi heterogen.

Sinyal ujian: "Memigrasikan database dengan downtime minimal" → DMS. "Oracle ke Aurora" atau migrasi heterogen apa pun → SCT + DMS. "Engine sama, jenis sama" → DMS langsung.

---

## Jaringan

**VPC — Virtual Private Cloud** *(Bab 11)*

Jaringan terisolasi di dalam AWS. Mencakup semua AZ dalam sebuah region. Anda mendefinisikan ruang alamat IP (blok CIDR), membuat subnet (publik atau privat), mengonfigurasi route table, dan mengontrol akses melalui security group dan NACL.

Konsep kunci: Subnet publik (rute ke Internet Gateway), subnet privat (rute ke NAT Gateway untuk keluar), Internet Gateway (masuk + keluar ke internet), NAT Gateway (hanya keluar untuk instance privat), VPC Peering (menghubungkan dua VPC), VPC Endpoint (terhubung ke layanan AWS tanpa internet).

Sinyal ujian: "Jaringan privat di AWS," "mengisolasi sumber daya dari internet," "mengontrol lalu lintas jaringan" → VPC.

---

**Security Group dan NACL** *(Bab 15)*

Security group adalah firewall stateful di tingkat instance — hanya allow rule, lalu lintas balasan otomatis. NACL (Network Access Control List) adalah firewall stateless di tingkat subnet — memerlukan rule masuk dan keluar, dievaluasi berurutan berdasarkan nomor rule.

Sinyal ujian: "Memblokir IP tertentu agar tidak mengakses subnet" → NACL. "Mengontrol lalu lintas ke/dari sebuah instance" → security group.

---

**Route 53** *(Bab 12)*

Layanan DNS dan registrar domain milik AWS. Merutekan lalu lintas internet ke sumber daya AWS dan endpoint eksternal. Kebijakan routing: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

Konsep kunci: Hosted zone (publik dan privat), jenis record (A, AAAA, CNAME, Alias), health check, Traffic Flow (editor kebijakan visual — perhatikan bahwa geoproximity juga tersedia sebagai kebijakan routing langsung pada record, dengan bias yang dapat disesuaikan, tanpa memerlukan Traffic Flow).

Sinyal ujian: "Routing DNS," "failover antar region," "merutekan berdasarkan latensi atau lokasi" → Route 53 dengan kebijakan routing yang sesuai.

---

**CloudFront** *(Bab 13)*

Content Delivery Network (CDN). Menyimpan cache konten di edge location (750+ point of presence di seluruh dunia). Mengurangi latensi untuk pengguna akhir. Mengurangi biaya transfer origin melalui caching. Terintegrasi dengan S3, EC2, ALB, dan API Gateway sebagai origin.

Konsep kunci: Distribution, origin, behavior (routing berbasis path ke origin), TTL (cache control), invalidasi cache, signed URL dan cookie (kontrol akses), Lambda@Edge dan CloudFront Functions (menjalankan kode di edge), Origin Shield (mengurangi beban origin).

Sinyal ujian: "Latensi rendah global," "cache konten statis," "mengurangi beban origin," "perlindungan terhadap DDoS dengan Shield" → CloudFront.

---

**Direct Connect dan VPN** *(Bab 25)*

AWS Direct Connect adalah koneksi jaringan fisik khusus dari pusat data on-premises Anda ke AWS. Melewati internet publik. Bandwidth dan latensi lebih konsisten. AWS Site-to-Site VPN adalah terowongan terenkripsi melalui internet publik — lebih cepat disiapkan, biaya lebih rendah, tetapi performa variabel.

Konsep kunci: Virtual Interface (VIF), Direct Connect Gateway (terhubung ke beberapa region), Transit Gateway (topologi jaringan hub-and-spoke), redundansi terowongan VPN.

Sinyal ujian: "Koneksi privat khusus ke AWS" → Direct Connect. "Koneksi terenkripsi, penyiapan lebih cepat" → VPN. "Menghubungkan beberapa VPC" → Transit Gateway.

---

**VPC Endpoint** *(Bab 30)*

Menghubungkan sumber daya privat ke layanan AWS tanpa menggunakan internet publik atau NAT Gateway. Gateway Endpoint: gratis, tersedia hanya untuk S3 dan DynamoDB. Interface Endpoint (PrivateLink): dikenai biaya per jam + per GB, tersedia untuk sebagian besar layanan AWS.

Sinyal ujian: "EC2 di subnet privat memanggil S3/DynamoDB — kurangi biaya NAT Gateway" → Gateway Endpoint (gratis). "Koneksi privat ke SQS, SSM, Secrets Manager dari subnet privat" → Interface Endpoint.

---

**AWS Client VPN** *(Bab 11)*

Endpoint OpenVPN terkelola yang memungkinkan perangkat individu (laptop, workstation) terhubung secara aman ke sebuah VPC melalui internet. Opsi autentikasi: Active Directory, federasi SAML 2.0 dengan penyedia identitas, atau mutual TLS (berbasis sertifikat). Mendukung split-tunnel (hanya lalu lintas yang menuju VPC melewati terowongan) dan full-tunnel (semua lalu lintas dirutekan melalui AWS).

Konsep kunci: Client VPN endpoint, target network (asosiasi subnet VPC), authorization rule, split-tunnel vs. full-tunnel.

Sinyal ujian: "Engineer jarak jauh membutuhkan akses aman ke VPC dari rumah," "konektivitas perangkat individu ke VPC" → Client VPN. Kontras: Site-to-Site VPN = jaringan-ke-jaringan. Client VPN = perangkat-ke-jaringan.

---

**Network Load Balancer (NLB) dan Gateway Load Balancer (GWLB)** *(Bab 7)*

NLB beroperasi di Layer 4 (TCP/UDP/TLS): tanpa inspeksi HTTP, hanya routing paket dengan kecepatan ekstrem — jutaan permintaan per detik, dengan IP statis per AZ dan pelestarian source IP. GWLB beroperasi di Layer 3 dan ada untuk satu tujuan: menyisipkan appliance jaringan virtual pihak ketiga (firewall, IDS/IPS, deep packet inspection) secara inline ke dalam aliran lalu lintas.

Konsep kunci: NLB = Layer 4, IP statis, latensi sangat rendah, protokol non-HTTP. GWLB = Layer 3, enkapsulasi GENEVE, fleet appliance di belakang satu titik masuk. ALB = Layer 7 (routing path/host).

Sinyal ujian: "Jutaan permintaan TCP per detik," "IP statis untuk load balancer," "melestarikan source IP" → NLB. "Menyisipkan appliance keamanan pihak ketiga ke jalur lalu lintas" → GWLB.

---

**AWS Global Accelerator** *(Bab 25)*

Merutekan lalu lintas pengguna ke backbone global privat AWS di edge location terdekat, alih-alih melintasi internet publik. Menyediakan dua alamat IP Anycast statis yang berada di depan ALB, NLB, atau instance EC2 Anda di satu atau beberapa region. Meningkatkan latensi dan konsistensi untuk lalu lintas *dinamis* (tidak dapat di-cache).

Konsep kunci: IP Anycast statis, onboarding edge ke backbone AWS, failover regional berbasis health-check dalam hitungan detik, endpoint group dengan traffic dial.

Sinyal ujian: "Pengguna global, lalu lintas dinamis/non-HTTP, IP statis, failover regional cepat" → Global Accelerator. "Konten yang dapat di-cache/statis" → CloudFront sebagai gantinya.

---

## Keamanan dan Identitas

**IAM — Identity and Access Management** *(Bab 3 dan 14)*

Mengontrol siapa yang dapat melakukan apa di akun AWS Anda. User (kredensial jangka panjang), Group (user yang berbagi izin), Role (kredensial sementara untuk layanan dan akses lintas akun), Policy (dokumen JSON yang mendefinisikan aturan allow/deny).

Konsep kunci: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (Service Control Policy di AWS Organizations), Permission boundary, AssumeRole.

Sinyal ujian: IAM terlibat dalam setiap pertanyaan keamanan. Pola kunci: layanan menggunakan IAM role (bukan user). Akses lintas akun menggunakan asumsi role. Least privilege — berikan hanya apa yang diperlukan.

---

**KMS — Key Management Service** *(Bab 16)*

Layanan kunci enkripsi terkelola. Membuat, menyimpan, dan mengontrol kunci kriptografis. Customer-managed key (CMK) memungkinkan Anda mendefinisikan kebijakan rotasi, penggunaan, dan akses. AWS-managed key dikelola secara otomatis.

Konsep kunci: Key policy (terpisah dari IAM policy), Envelope encryption (data dienkripsi dengan data key; data key dienkripsi dengan CMK), Rotasi kunci otomatis, Multi-region key, Grant.

Sinyal ujian: "Mengenkripsi data saat istirahat," "kunci enkripsi yang dikelola pelanggan," "rotasi kunci" → KMS.

---

**Secrets Manager** *(Bab 16)*

Menyimpan dan secara otomatis merotasi nilai sensitif: kredensial database, API key, token OAuth. Terintegrasi dengan RDS untuk rotasi kata sandi otomatis. Aplikasi mengambil secret saat runtime melalui API — jangan pernah menanamkan kredensial secara hardcode.

Sinyal ujian: "Menyimpan dan merotasi kredensial database," "menghindari secret yang di-hardcode" → Secrets Manager. "Menyimpan nilai konfigurasi, bukan secret" → Parameter Store (SSM).

---

**AWS Shield** *(Bab 17)*

Perlindungan DDoS. Shield Standard otomatis dan gratis — melindungi terhadap serangan volumetrik dan protokol yang umum. Shield Advanced menambahkan perlindungan finansial, tim respons DDoS 24/7, dan visibilitas serangan yang terperinci.

Sinyal ujian: "Melindungi terhadap DDoS" → Shield Standard (otomatis) atau Shield Advanced (enterprise, dengan SLA).

---

**WAF — Web Application Firewall** *(Bab 17)*

Memfilter lalu lintas HTTP/HTTPS berdasarkan aturan: blok IP, rate limit, pola SQL injection, pola XSS, pembatasan geografis, aturan kustom. Terpasang pada CloudFront, ALB, API Gateway, atau AppSync.

Sinyal ujian: "Memblokir alamat IP tertentu," "mencegah SQL injection di edge," "membatasi laju panggilan API" → WAF.

---

**GuardDuty** *(Bab 17)*

Layanan deteksi ancaman. Menganalisis log CloudTrail, VPC Flow Log, dan log DNS menggunakan ML dan intelijen ancaman. Mendeteksi aktivitas API yang tidak biasa, komunikasi dengan IP berbahaya yang dikenal, kredensial yang dikompromikan.

Sinyal ujian: "Mendeteksi aktivitas tidak biasa," "mengidentifikasi kredensial IAM yang dikompromikan," "pemantauan ancaman berkelanjutan" → GuardDuty.

---

**Amazon Inspector** *(Bab 17)*

Layanan penilaian kerentanan otomatis. Terus-menerus memindai instance EC2, image kontainer Amazon ECR, dan fungsi Lambda untuk kerentanan perangkat lunak (CVE) dan paparan jaringan yang tidak diinginkan. Temuan dikirim ke AWS Security Hub untuk pengelolaan terpusat.

Konsep kunci: Pemindaian CVE, penilaian berkelanjutan (bukan sekali jalan), cakupan EC2 + ECR + Lambda, integrasi Security Hub.

Sinyal ujian: "Memindai EC2 secara otomatis untuk kerentanan yang dikenal," "pemindaian CVE untuk image kontainer," "penilaian kerentanan berkelanjutan" → Inspector.

---

**Amazon Cognito** *(Bab 14)*

Autentikasi terkelola untuk pengguna akhir aplikasi Anda — direktori pengguna yang tidak perlu Anda bangun. User Pool menangani pendaftaran, sign-in, MFA, reset kata sandi, dan penyedia identitas sosial (Google, Facebook, penyedia OIDC apa pun), menerbitkan JWT yang divalidasi aplikasi Anda. Identity Pool menukar token tersebut dengan kredensial AWS sementara.

Konsep kunci: User Pool (autentikasi, JWT) vs. Identity Pool (kredensial AWS sementara), hosted UI, federasi sosial/OIDC/SAML, Cognito authorizer API Gateway.

Sinyal ujian: "Aplikasi membutuhkan pendaftaran/sign-in pengguna," "login sosial," "memberikan pengguna aplikasi seluler akses sementara ke sumber daya AWS" → Cognito. Kontras: IAM untuk engineer dan layanan Anda; Cognito untuk pelanggan Anda.

---

**AWS Certificate Manager (ACM)** *(Bab 16)*

Menyediakan sertifikat TLS/SSL publik gratis untuk layanan yang dikelola AWS (ALB, CloudFront, API Gateway) dan menangani seluruh siklus hidup — tanpa kalender perpanjangan, tanpa penanganan private key. Memperbarui otomatis melalui validasi DNS.

Konsep kunci: Validasi DNS vs. email, perpanjangan otomatis, sertifikat untuk CloudFront harus berada di us-east-1, sertifikat publik gratis tidak dapat diekspor (opsi berbayar yang dapat diekspor tersedia sejak 2025).

Sinyal ujian: "HTTPS pada load balancer atau CDN," "perpanjangan sertifikat otomatis" → ACM.

---

**Amazon Macie** *(Bab 17)*

Penemuan data sensitif untuk S3. Menggunakan machine learning dan pencocokan pola untuk menemukan PII (nama, nomor kartu, kredensial) di bucket dan menandai risiko akses seperti paparan publik. Melengkapi GuardDuty: GuardDuty mengawasi perilaku; Macie mengaudit apa yang disimpan.

Konsep kunci: Managed data identifier (pola PII), cakupan hanya S3, temuan ke Security Hub/EventBridge.

Sinyal ujian: "Menemukan PII di S3," "mengidentifikasi paparan data sensitif" → Macie.

---

**AWS Control Tower** *(Bab 14)*

Mengotomatiskan penyiapan dan tata kelola lingkungan multi-akun. Membuat landing zone — akun management, log archive, dan audit yang sudah terkonfigurasi dengan Organizations, CloudTrail, Config, dan guardrail — dalam hitungan menit alih-alih berhari-hari pengkabelan manual.

Konsep kunci: Landing zone, guardrail (preventif = SCP, detektif = aturan Config), Account Factory untuk akun baru yang terstandarisasi.

Sinyal ujian: "Menyiapkan dan mengatur lingkungan multi-akun baru dengan praktik terbaik secara otomatis" → Control Tower. Kontras: Organizations adalah blok bangunan mentahnya; Control Tower adalah perakitan otomatisnya.

---

## Messaging dan Pemrosesan Peristiwa

**SQS — Simple Queue Service** *(Bab 19)*

Antrian pesan terkelola. Produser mengirim pesan; konsumer membaca dan menghapusnya. Memisahkan layanan: pengirim tidak perlu tahu apakah penerima tersedia. Standard queue: pengiriman setidaknya-sekali, pengurutan best-effort. FIFO queue: pemrosesan tepat-sekali, pengurutan ketat.

Konsep kunci: Visibility timeout (pesan disembunyikan dari konsumer lain saat diproses), Dead Letter Queue (DLQ) untuk pesan yang berulang kali gagal, Retensi pesan (default 4 hari, hingga 14), Long polling (mengurangi respons kosong), Payload maksimum 256KB secara default (dapat dinaikkan ke 1 MiB sejak 2025; untuk payload lebih besar, Extended Client Library menyimpan body di S3).

Sinyal ujian: "Memisahkan layanan," "menyangga permintaan saat lonjakan beban," "pemrosesan async" → SQS. "Urutan penting dan tepat-sekali diperlukan" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Bab 19)*

Layanan pub/sub terkelola. Penerbit mengirim pesan ke topic; semua subscriber menerima salinan. Pola fan-out: satu pesan → banyak konsumer. Protokol: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push.

Konsep kunci: Topic, subscription, pola fan-out (SNS → beberapa antrian SQS), pemfilteran pesan (subscriber hanya menerima pesan yang cocok).

Sinyal ujian: "Mengirim notifikasi ke beberapa endpoint secara bersamaan," "fan-out satu peristiwa ke beberapa konsumer" → SNS. Pola umum: SNS + SQS untuk fan-out yang durabel.

---

**EventBridge** *(Bab 22)*

Event bus untuk membangun arsitektur berbasis peristiwa. Merutekan peristiwa dari layanan AWS, mitra SaaS, dan sumber kustom ke Lambda, SQS, SNS, Step Functions, dan target lainnya. Mendukung scheduled rule (cron) dan pencocokan pola.

Sinyal ujian: "Merutekan peristiwa dari layanan AWS ke target," "menjadwalkan fungsi Lambda," "orkestrasi berbasis peristiwa" → EventBridge.

---

**Step Functions** *(Bab 22)*

Orkestrasi alur kerja serverless. Mengoordinasikan fungsi Lambda, task ECS, DynamoDB, SNS, SQS, dan layanan lain menjadi state machine visual. Menangani retry, penanganan error, cabang paralel, dan wait state.

Konsep kunci: State machine, jenis state (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflow (tepat-sekali, berjalan lama) vs. Express Workflow: Asinkron (setidaknya-sekali, volume tinggi — rancang task agar idempoten) dan Sinkron (paling-banyak-sekali, mengembalikan hasil secara langsung seperti panggilan API).

Sinyal ujian: "Mengorkestrasikan beberapa fungsi Lambda," "alur kerja berjalan lama dengan logika retry," "langkah persetujuan manusia" → Step Functions.

---

**Kinesis** *(Bab 26)*

Streaming data real-time. Kinesis Data Streams: stream record yang durabel dan terurut (seperti commit log terdistribusi). Konsumer memproses record; data disimpan 24 jam (default) hingga 365 hari (dengan Extended Data Retention). Amazon Data Firehose (sebelumnya Kinesis Data Firehose): pengiriman yang dikelola sepenuhnya ke S3, Redshift, OpenSearch, Splunk — tidak diperlukan pengelolaan konsumer.

Konsep kunci: Shard (unit throughput: tulis 1MB/s, baca 2MB/s), partition key (menentukan penugasan shard), sequence number, checkpointing (KCL atau Lambda), Firehose vs. Streams.

Sinyal ujian: "Streaming real-time," "record terurut," "memutar ulang peristiwa" → Kinesis Data Streams. "Mengirim data streaming ke S3/Redshift tanpa mengelola konsumer" → Amazon Data Firehose (pertanyaan lama mungkin menyebut "Kinesis Data Firehose"). "SQL pada data streaming" → Amazon Managed Service for Apache Flink (sebelumnya Kinesis Data Analytics). Kontras dengan SQS: Kinesis menyimpan dan memutar ulang; SQS menghapus saat dikonsumsi.

---

**Amazon MQ** *(Bab 19)*

Layanan message broker terkelola yang mendukung Apache ActiveMQ dan RabbitMQ. Mendukung protokol messaging standar industri: AMQP, STOMP, MQTT, OpenWire, dan WebSocket. Kasus penggunaan utamanya adalah migrasi lift-and-shift beban kerja message broker on-premises — aplikasi yang sudah menggunakan ActiveMQ atau RabbitMQ dapat terhubung tanpa perubahan kode.

Konsep kunci: Pilihan engine ActiveMQ vs. RabbitMQ, dukungan protokol (AMQP/STOMP/MQTT), konfigurasi broker single-instance atau active/standby untuk HA.

Sinyal ujian: "Memigrasikan ActiveMQ atau RabbitMQ on-premises ke AWS tanpa mengubah kode aplikasi" → Amazon MQ. "Messaging AWS-native dari awal" → SQS atau SNS (lebih sederhana, lebih dapat diskalakan).

---

## Analitik

**Athena** *(Bab 26)*

Kueri SQL serverless pada data yang disimpan di S3. Tidak ada infrastruktur yang perlu dikelola. Bayar per kueri (per TB yang dipindai). Terbaik dengan format kolumnar (Parquet, ORC) dan data yang dipartisi.

Sinyal ujian: "Mengkueri data S3 dengan SQL," "analitik ad-hoc pada data lake," "tanpa pengelolaan infrastruktur" → Athena.

---

**Glue** *(Bab 26)*

Layanan ETL (Extract, Transform, Load) serverless. Glue Crawler menemukan data dan memperbarui Glue Data Catalog. Glue Job menjalankan transformasi Spark atau Python. Data Catalog terintegrasi dengan Athena, Redshift Spectrum, dan EMR.

Sinyal ujian: "Mentransformasi dan memuat data untuk analitik," "menemukan skema data S3," "pipeline ETL" → Glue.

---

**Amazon QuickSight** *(Bab 26)*

Layanan business intelligence dan visualisasi data terkelola. Menggunakan SPICE (Super-fast, Parallel, In-memory Calculation Engine), sebuah engine dalam memori yang menyimpan cache data yang diimpor untuk rendering dashboard yang cepat. Terhubung ke Athena, S3, Redshift, RDS, dan sumber data AWS lainnya. Tidak ada server BI yang perlu dikelola.

Konsep kunci: SPICE (engine dalam memori), dataset, analisis, dashboard, ML Insights (deteksi anomali, peramalan), keamanan tingkat baris dan tingkat kolom.

Sinyal ujian: "Dashboard BI di AWS tanpa mengelola server," "memvisualisasikan data dari Athena atau Redshift" → QuickSight.

---

**AWS Lake Formation** *(Bab 26)*

Lapisan kontrol akses data lake terpusat di atas S3 dan Glue Data Catalog. Menyediakan izin berbutir halus di tingkat tabel, kolom, dan baris — lebih granular daripada bucket policy S3 saja. Menyederhanakan penyiapan data lake yang aman: Lake Formation menangani model izin; Glue menangani katalog; S3 menyimpan data.

Konsep kunci: Izin data lake (tingkat tabel/kolom/baris), integrasi Glue Data Catalog, LF-tag untuk kontrol akses berbasis atribut, grant/revoke terpusat untuk kueri Athena dan Redshift Spectrum.

Sinyal ujian: "Kontrol akses berbutir halus pada data lake," "keamanan tingkat kolom atau tingkat baris pada data S3" → Lake Formation.

---

## Ketersediaan Tinggi dan Pemulihan Bencana

**Multi-AZ dan Multi-Region** *(Bab 18)*

Multi-AZ: replikasi sinkron dalam sebuah region untuk failover otomatis (RDS Multi-AZ, load balancer di seluruh AZ). RPO ~0, RTO ~60d untuk RDS. Multi-Region: replikasi asinkron untuk redundansi geografis dan latensi lebih rendah bagi pengguna global.

Konsep kunci: RTO (Recovery Time Objective — berapa lama untuk pulih), RPO (Recovery Point Objective — berapa banyak data yang dapat hilang). Strategi DR Pilot Light, Warm Standby, Active-Active.

Sinyal ujian: Bedakan antara kegagalan tingkat AZ (ditangani Multi-AZ) vs. kegagalan regional (ditangani Multi-Region). Biaya dan kompleksitas meningkat signifikan dengan Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(Bab 18)*

Pemulihan bencana terkelola untuk server (on-premises atau EC2). Terus-menerus mereplikasi server sumber blok demi blok ke area staging berbiaya rendah dan meluncurkan instance pemulihan penuh dalam hitungan menit saat dibutuhkan — sebuah pilot light terkelola: waktu pemulihan mendekati warm-standby dengan harga mendekati backup-and-restore.

Konsep kunci: Replikasi kontinu tingkat blok, area staging berbiaya rendah, peluncuran pemulihan sesuai permintaan, pemulihan point-in-time.

Sinyal ujian: "Meminimalkan downtime dan kehilangan data untuk beban kerja berbasis server dengan layanan DR terkelola," "pilot light tanpa membangunnya sendiri" → DRS.

---

## Optimasi Biaya

**Model Penetapan Harga EC2** *(Bab 27)*

On-Demand: harga penuh, tanpa komitmen. Reserved Instances (1 atau 3 tahun): diskon 30-72% untuk jenis instance tertentu. Savings Plans (Compute atau EC2 Instance): pengeluaran per jam yang dikomitmenkan untuk fleksibilitas. Spot: diskon 60-90% untuk beban kerja yang dapat diinterupsi.

Sinyal ujian: "Meminimalkan biaya untuk beban kerja yang dapat diprediksi" → Savings Plans atau Reserved Instances. "Pemrosesan batch yang fault-tolerant" → Spot. "Tidak dapat diprediksi atau jangka pendek" → On-Demand.

---

**Penetapan Harga Transfer Data** *(Bab 30)*

Masuk ke AWS: gratis. Same-AZ: gratis. Cross-AZ: $0,01/GB setiap arah. Cross-region: $0,02-0,08/GB. Internet (keluar): ~$0,09/GB. Pemrosesan NAT Gateway: $0,045/GB. Transfer data CloudFront lebih murah daripada EC2-ke-internet langsung, dan caching mengurangi total volume.

Sinyal ujian: "Mengurangi biaya transfer data untuk S3/DynamoDB dari subnet privat" → Gateway Endpoint (gratis). "Mengurangi biaya NAT Gateway untuk layanan lain" → Interface Endpoint.

---

## Observabilitas

**CloudWatch** *(dirujuk di sepanjang buku)*

Pemantauan dan observabilitas. CloudWatch Metrics: data time-series numerik dari layanan AWS dan aplikasi kustom. CloudWatch Logs: mengumpulkan, mencari, dan menganalisis data log. CloudWatch Alarms: memicu notifikasi atau auto scaling berdasarkan ambang batas metrik. CloudWatch Dashboards: memvisualisasikan metrik.

Konsep kunci: Dimensi metrik, periode retensi, log group dan log stream, metric filter, CloudWatch Agent (untuk metrik dan log tingkat OS dari EC2), Container Insights.

---

**CloudTrail** *(dirujuk di sepanjang buku)*

Mencatat setiap panggilan API yang dibuat di akun AWS Anda: siapa yang membuatnya, dari mana, kapan, dan apa responsnya. Trail multi-region menyimpan log di S3 tanpa batas waktu. Digunakan untuk audit keamanan, kepatuhan, dan investigasi insiden.

Sinyal ujian: "Siapa yang menghapus sumber daya itu?" "Mengaudit semua aktivitas API" → CloudTrail.

---

**X-Ray** *(Bab 20)*

Distributed tracing: mengikuti permintaan individu di seluruh layanan (trace → segment → subsegment), membangun service map dengan latensi dan tingkat error per hop. Sampling menjaga overhead tetap rendah; anotasi membuat trace dapat dicari. Active tracing dapat diaktifkan pada stage Lambda dan API Gateway.

Sinyal ujian: "Melacak permintaan di seluruh microservice," "menemukan bottleneck antar layanan" → X-Ray (bukan CloudWatch, bukan CloudTrail).

---

**AWS Config** *(dirujuk di Bab 31)*

Melacak perubahan konfigurasi sumber daya dari waktu ke waktu. Mengevaluasi sumber daya terhadap aturan kepatuhan. Mencatat riwayat setiap perubahan konfigurasi untuk setiap sumber daya. Terintegrasi dengan Systems Manager untuk remediasi.

Sinyal ujian: "Apakah sumber daya ini patuh terhadap kebijakan keamanan kami?" "Seperti apa konfigurasi sumber daya ini minggu lalu?" → AWS Config.

---

## Well-Architected

**Enam Pilar** *(Bab 31)*

| Pilar                   | Pertanyaan inti                          | Layanan kunci                                     |
|-------------------------|------------------------------------------|---------------------------------------------------|
| Operational Excellence  | Apakah kita berjalan dengan baik?        | CloudWatch, CloudTrail, SSM, Config               |
| Security                | Apakah kita terlindungi?                 | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability             | Apakah kita pulih dari kegagalan?        | Multi-AZ, failover Route 53, backup/restore, SQS  |
| Performance Efficiency  | Apakah kita menggunakan sumber daya yang tepat? | Right-sizing, Auto Scaling, CloudFront, Kinesis |
| Cost Optimization       | Apakah kita berbelanja dengan bijak?     | Savings Plans, Spot, lifecycle S3, VPC Endpoint   |
| Sustainability          | Apakah kita meminimalkan dampak lingkungan? | Right-sizing, Graviton, tier penyimpanan efisien |

AWS Well-Architected Tool: mengevaluasi arsitektur Anda terhadap enam pilar. Gunakan sebelum ujian untuk memahami penalaran di balik pertanyaan setiap pilar.
