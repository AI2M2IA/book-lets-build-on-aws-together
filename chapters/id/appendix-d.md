# Lampiran D: Ujian Latihan Lengkap (65 Soal)

Ini adalah ujian latihan SAA-C03 lengkap: 65 soal, mencerminkan bobot domain ujian sebenarnya — Design Secure Architectures (Soal 1–20, ~30%), Design Resilient Architectures (21–37, ~26%), Design High-Performing Architectures (38–53, ~24%), dan Design Cost-Optimized Architectures (54–65, ~20%).

**Cara mengerjakannya:**

- Setel pengatur waktu selama **130 menit** — durasi ujian sebenarnya. Latih ritme pengerjaan: itu dua menit per soal.
- Tujuh soal menyebut **"(Pilih DUA.)"** — soal-soal itu memiliki lima opsi dan tepat dua jawaban benar, persis seperti item respons-ganda di ujian sebenarnya. Keduanya harus benar agar soal dinilai benar.
- Jangan lihat kunci jawaban sampai Anda menyelesaikan seluruh 65 soal. Pada ujian sebenarnya tidak ada umpan balik di tengah jalan, dan melatih toleransi Anda terhadap ketidakpastian adalah bagian dari persiapan.
- Ujian sebenarnya menyertakan 15 soal eksperimental yang tidak dinilai dan tidak dapat Anda identifikasi. Semua 65 soal di sini "dinilai." Tolok ukur kelulusan: **47 atau lebih benar (~72%)** menempatkan Anda dalam rentang skor kelulusan terskala 720/1000. Di bawah 47, tinjau kembali bab-bab yang dipetakan di Lampiran B untuk domain lemah Anda sebelum memesan ujian.
- Untuk setiap soal yang Anda jawab salah — dan setiap soal yang Anda jawab benar tetapi ragu — baca analisis distraktornya. Ujian menguji *perbedaan* antara opsi-opsi yang masuk akal, dan di situlah letak pembelajarannya.

---

## Bagian 1 — Design Secure Architectures (Soal 1–20)

**Soal 1** *(Domain 1 — Task 1.1)*
Sebuah perusahaan jasa keuangan menggunakan AWS Organizations dengan semua fitur diaktifkan. Tim keamanan memasang service control policy (SCP) ke root organisasi yang menolak penggunaan semua AWS Region kecuali eu-west-1. Selama audit, tim menemukan bahwa seorang administrator di salah satu akun masih dapat meluncurkan instance EC2 di us-east-2 meskipun ada SCP. Akun mana yang paling mungkin mengizinkan tindakan ini?

A) Akun member dalam organizational unit (OU) bersarang, karena SCP tidak diteruskan ke OU bersarang
B) Akun management, karena SCP tidak berlaku untuk akun management
C) Akun member yang policy administrator IAM-nya menyertakan Allow eksplisit, yang menimpa SCP
D) Akun member yang dibuat setelah SCP dipasang, karena SCP hanya berlaku untuk akun yang sudah ada saat pemasangan

**Soal 2** *(Domain 1 — Task 1.1)*
Sebuah startup ingin mengizinkan developer-nya membuat IAM role untuk aplikasi mereka, tetapi tim keamanan khawatir developer dapat membuat role dengan izin lebih banyak daripada yang dimiliki developer itu sendiri, yang mengarah pada eskalasi hak istimewa. Tim keamanan ingin developer tetap dapat membuat role secara mandiri. Apa solusi yang PALING tepat?

A) Mewajibkan developer mengirimkan permintaan pembuatan role melalui sistem tiket yang ditinjau oleh tim keamanan
B) Memasang SCP ke akun developer yang menolak tindakan iam:CreateRole sepenuhnya
C) Mewajibkan agar semua role yang dibuat developer menyertakan permission boundary tertentu, ditegakkan dengan IAM condition pada iam:CreateRole dan iam:AttachRolePolicy
D) Mengaktifkan AWS CloudTrail dan mengonfigurasi peringatan setiap kali developer membuat IAM role baru

**Soal 3** *(Domain 1 — Task 1.1)*
Sebuah penyedia SaaS perlu mengakses sumber daya di akun AWS pelanggannya untuk melakukan analisis biaya otomatis. Pelanggan membuat IAM role yang dapat diasumsikan oleh akun penyedia SaaS. Seorang konsultan keamanan memperingatkan bahwa pihak ketiga yang mengetahui ARN role pelanggan dapat menipu penyedia SaaS agar mengakses akun pelanggan tersebut atas nama pihak ketiga itu. Mekanisme mana yang memitigasi risiko "confused deputy" ini?

A) Mewajibkan multi-factor authentication (MFA) pada trust policy role lintas akun
B) Mewajibkan penyedia SaaS meneruskan ExternalId unik, yang ditentukan oleh pelanggan, dalam panggilan sts:AssumeRole dan divalidasi oleh condition dalam trust policy role tersebut
C) Mengenkripsi ARN role dengan AWS KMS sebelum membagikannya kepada penyedia SaaS
D) Mengganti role lintas akun dengan IAM user yang access key-nya dirotasi setiap 90 hari

**Soal 4** *(Domain 1 — Task 1.1)*
Sebuah perusahaan dengan 40 akun AWS di AWS Organizations ingin karyawannya masuk satu kali dengan kredensial Microsoft Entra ID (Azure AD) mereka yang sudah ada dan mengakses semua akun AWS melalui satu portal, dengan izin yang ditetapkan secara terpusat per akun. Solusi mana yang memenuhi persyaratan ini dengan overhead operasional PALING SEDIKIT?

A) Membuat IAM user di setiap dari 40 akun dan menyinkronkan kata sandi dengan Entra ID
B) Mengonfigurasi AWS IAM Identity Center dengan Entra ID sebagai penyedia identitas eksternal dan menetapkan permission set ke user dan group per akun
C) Menyebarkan Amazon Cognito user pool di setiap akun dan memfederasikannya ke Entra ID
D) Membuat SAML identity provider di setiap akun dan menulis IAM role serta trust policy per akun secara manual

**Soal 5** *(Domain 1 — Task 1.1)*
Sebuah perusahaan game seluler sedang membangun aplikasi di mana pemain mendaftar dengan alamat email atau login sosial, dan setelah autentikasi aplikasi harus mengunggah tangkapan layar pemain langsung ke bucket Amazon S3 menggunakan kredensial AWS sementara. Kombinasi layanan mana yang harus direkomendasikan solutions architect?

A) Amazon Cognito user pool untuk pendaftaran/sign-in, dan Amazon Cognito identity pool untuk menukar token yang terautentikasi dengan kredensial AWS sementara
B) Amazon Cognito identity pool untuk pendaftaran/sign-in, dan Amazon Cognito user pool untuk menerbitkan kredensial AWS sementara
C) AWS IAM Identity Center untuk pendaftaran/sign-in, dan AWS STS GetSessionToken untuk kredensial
D) Amazon Cognito user pool saja, karena token user pool memberikan akses langsung ke S3

**Soal 6** *(Domain 1 — Task 1.3)*
Sebuah perusahaan layanan kesehatan harus mengenkripsi data di Amazon S3 dengan kunci yang mendukung rotasi tahunan otomatis yang dikelola oleh AWS, sambil tetap memungkinkan perusahaan mendefinisikan key policy, mengaktifkan pencatatan CloudTrail terhadap penggunaan kunci, dan menonaktifkan kunci jika diperlukan. Jenis kunci KMS mana yang memenuhi persyaratan ini?

A) AWS managed key (aws/s3)
B) Customer managed key dengan rotasi otomatis diaktifkan
C) AWS owned key
D) Customer managed key dengan imported key material (BYOK) dan rotasi otomatis diaktifkan

**Soal 7** *(Domain 1 — Task 1.3)*
Seorang solutions architect menjelaskan bagaimana AWS KMS mengenkripsi file 4 GB yang disimpan oleh sebuah aplikasi, mengingat KMS hanya dapat mengenkripsi hingga 4 KB data secara langsung. Pernyataan mana yang secara akurat menggambarkan envelope encryption?

A) KMS membagi file menjadi potongan 4 KB dan mengenkripsi setiap potongan dengan kunci KMS
B) Aplikasi meminta data key dari KMS, mengenkripsi file secara lokal dengan plaintext data key, lalu menyimpan data key yang terenkripsi bersama data dan membuang plaintext data key
C) KMS mengalirkan file melalui API KMS, yang mengenkripsinya di sisi server dengan kunci KMS
D) Aplikasi mengenkripsi file dengan kunci simetris hardcode, dan KMS menandatangani hasilnya untuk integritas

**Soal 8** *(Domain 1 — Task 1.3)*
Sebuah perusahaan menyimpan kata sandi master Amazon RDS for PostgreSQL dan perlu merotasinya secara otomatis setiap 30 hari tanpa downtime aplikasi. Aplikasi mempertahankan koneksi database berumur panjang, sehingga tim menginginkan strategi rotasi di mana kredensial sebelumnya tetap valid sementara yang baru diaktifkan. Solusi mana yang memenuhi persyaratan ini?

A) Parameter SecureString AWS Systems Manager Parameter Store dengan fungsi Lambda yang dipicu bulanan
B) AWS Secrets Manager dengan strategi rotasi single-user
C) AWS Secrets Manager dengan strategi rotasi alternating-users, yang beralih antara dua user database sehingga satu kredensial selalu tetap valid
D) Rotasi kunci otomatis AWS KMS yang diterapkan pada kata sandi database

**Soal 9** *(Domain 1 — Task 1.3)*
Sebuah perusahaan media menyimpan video mentah di Amazon S3. Kepatuhan mengharuskan perusahaan mengelola dan menyediakan kunci enkripsinya sendiri, AWS tidak pernah menyimpan kunci tersebut, dan kunci disediakan pada setiap permintaan. Opsi enkripsi mana yang memenuhi persyaratan ini?

A) SSE-S3
B) SSE-KMS dengan customer managed key
C) SSE-C
D) Enkripsi sisi klien menggunakan AWS managed key aws/s3

**Soal 10** *(Domain 1 — Task 1.3)*
Sebuah broker-dealer harus menyimpan catatan perdagangan di Amazon S3 selama tujuh tahun dengan cara yang mencegah siapa pun—termasuk root user akun AWS—menghapus atau menimpa objek selama periode retensi, untuk memenuhi SEC Rule 17a-4. Konfigurasi mana yang memenuhi persyaratan ini?

A) S3 Object Lock dalam mode governance dengan periode retensi 7 tahun
B) S3 Object Lock dalam mode compliance dengan periode retensi 7 tahun pada bucket yang versioning-nya diaktifkan
C) Bucket policy S3 yang menolak s3:DeleteObject untuk semua principal
D) S3 Glacier Deep Archive dengan lifecycle rule yang mengakhiri objek setelah 7 tahun

**Soal 11** *(Domain 1 — Task 1.2)*
Sebuah aplikasi web berjalan di instance EC2 di belakang Application Load Balancer. Seorang network engineer menambahkan aturan network ACL ke subnet yang mengizinkan TCP port 443 masuk dari 0.0.0.0/0, tetapi klien masih tidak dapat menyelesaikan permintaan HTTPS. Security group dikonfigurasi dengan benar. Apa penyebab yang PALING mungkin?

A) Network ACL bersifat stateful dan memerlukan aturan connection-tracking
B) Network ACL tidak memiliki aturan keluar yang mengizinkan port ephemeral (1024–65535), sehingga lalu lintas balasan diblokir karena NACL bersifat stateless
C) Security group juga harus mengizinkan port 443 keluar, karena security group bersifat stateless
D) Network ACL tidak dapat mengizinkan lalu lintas dari 0.0.0.0/0; CIDR tertentu diperlukan

**Soal 12** *(Domain 1 — Task 1.2)*
Manakah DUA pernyataan tentang security group dan network ACL di sebuah VPC yang akurat? (Pilih DUA.)

A) Security group bersifat stateful, sehingga lalu lintas balasan secara otomatis diizinkan terlepas dari aturan keluar
B) Network ACL mengevaluasi aturan dalam urutan numerik dan mendukung aturan Deny eksplisit
C) Security group mendukung aturan Allow dan Deny
D) Network ACL terpasang pada elastic network interface individu
E) Aturan security group dievaluasi dalam urutan numerik, berhenti pada kecocokan pertama

**Soal 13** *(Domain 1 — Task 1.2)*
Sebuah perusahaan e-commerce yang menjalankan aplikasi yang menghadap publik di CloudFront dan ALB khawatir tentang serangan DDoS yang besar dan canggih. Perusahaan menginginkan akses 24/7 ke AWS Shield Response Team, perlindungan biaya terhadap tagihan penskalaan yang disebabkan oleh serangan, dan diagnostik serangan. Layanan mana yang harus digunakan?

A) AWS Shield Standard, yang diaktifkan secara otomatis tanpa biaya
B) AWS Shield Advanced
C) AWS WAF dengan rate-based rule
D) Amazon GuardDuty dengan paket perlindungan EC2

**Soal 14** *(Domain 1 — Task 1.2)*
Sebuah REST API di belakang Application Load Balancer sedang diserang dengan upaya SQL injection dan permintaan berlebihan dari sekumpulan kecil alamat IP. Solusi mana yang memblokir pola permintaan berbahaya di edge aplikasi dengan upaya pengembangan PALING SEDIKIT?

A) Menambahkan kode validasi input ke setiap handler API
B) Mengaitkan AWS WAF dengan ALB, menggunakan managed rule group SQL injection dan rate-based rule
C) Mengaktifkan AWS Shield Standard pada ALB
D) Mengonfigurasi security group ALB untuk menolak permintaan yang mengandung kata kunci SQL

**Soal 15** *(Domain 1 — Task 1.2)*
Sebuah perusahaan ingin menangani tiga kebutuhan keamanan: (1) terus-menerus mendeteksi instance EC2 yang dikompromikan dan aktivitas API anomali menggunakan threat intelligence, (2) menemukan dan mengklasifikasikan personally identifiable information (PII) yang disimpan di bucket S3, dan (3) memindai instance EC2 dan image kontainer untuk kerentanan perangkat lunak (CVE). Pemetaan layanan AWS ke kebutuhan mana yang benar?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Soal 16** *(Domain 1 — Task 1.2)*
Sebuah aplikasi yang berjalan di instance EC2 di subnet privat harus mengunggah objek ke Amazon S3 dan memanggil Amazon DynamoDB. Kebijakan perusahaan melarang lalu lintas melintasi internet publik, dan tim menginginkan opsi berbiaya terendah untuk kedua layanan. Solusi mana yang memenuhi persyaratan ini?

A) NAT gateway di subnet publik
B) Gateway VPC endpoint untuk S3 dan DynamoDB, dirujuk dalam route table subnet
C) Interface VPC endpoint (AWS PrivateLink) untuk S3 dan DynamoDB
D) Internet gateway dengan aturan security group yang ketat

**Soal 17** *(Domain 1 — Task 1.3)*
Setelah insiden server-side request forgery (SSRF) di mana penyerang mengambil kredensial IAM role dari layanan metadata sebuah instance EC2 melalui aplikasi web yang rentan, tim keamanan ingin mengeraskan semua instance terhadap kelas serangan ini. Apa yang harus dilakukan tim?

A) Menegakkan IMDSv2 dengan mewajibkan session token (HttpTokens=required), sehingga permintaan metadata memerlukan token yang diperoleh via PUT yang tidak dapat diperoleh oleh permintaan SSRF sederhana
B) Menonaktifkan layanan metadata instance di semua instance, karena aplikasi tidak pernah membutuhkannya
C) Memblokir 169.254.169.254 di network ACL subnet
D) Memindahkan kredensial role instance ke file konfigurasi pada instance

**Soal 18** *(Domain 1 — Task 1.3)*
Seorang solutions architect harus menyimpan sekitar 200 nilai konfigurasi aplikasi plaintext (feature flag, nama lingkungan, URL endpoint) dan 5 kata sandi database. Kata sandi memerlukan rotasi otomatis; nilai konfigurasi tidak, dan tim ingin meminimalkan biaya. Kombinasi mana yang PALING hemat biaya?

A) Menyimpan semuanya di AWS Secrets Manager
B) Menyimpan semuanya di parameter standard AWS Systems Manager Parameter Store
C) Menyimpan nilai konfigurasi di parameter standard Parameter Store (tanpa biaya) dan kata sandi di AWS Secrets Manager dengan rotasi diaktifkan
D) Menyimpan nilai konfigurasi di S3 dan kata sandi di parameter SecureString Parameter Store dengan rotasi otomatis bawaan

**Soal 19** *(Domain 1 — Task 1.3)*
Sebuah perusahaan mengenkripsi objek S3 dengan SSE-KMS menggunakan customer managed key. Sebuah aplikasi di akun yang sama membaca objek-objek ini ribuan kali per detik, dan tim mengalami throttling serta kekhawatiran biaya dari panggilan API KMS. Perubahan mana yang mengurangi lalu lintas permintaan KMS sambil mempertahankan enkripsi SSE-KMS?

A) Mengalihkan bucket ke SSE-S3, yang tidak menggunakan kunci
B) Mengaktifkan S3 Bucket Keys, sehingga S3 menggunakan kunci tingkat-bucket berumur pendek untuk mengurangi panggilan ke KMS
C) Menonaktifkan rotasi kunci otomatis pada customer managed key
D) Mengganti customer managed key dengan imported key material

**Soal 20** *(Domain 1 — Task 1.1)*
Manakah DUA pernyataan tentang evaluasi IAM policy dan AWS Organizations yang akurat? (Pilih DUA.)

A) SCP memberikan izin kepada IAM user dan role di akun member
B) Deny eksplisit dalam policy yang berlaku mana pun selalu menimpa Allow apa pun
C) Resource-based policy tidak dapat memberikan akses lintas akun tanpa SCP
D) Permission boundary menetapkan izin maksimum yang dapat diberikan identity-based policy kepada user atau role, tetapi tidak memberikan apa pun dengan sendirinya
E) Jika tidak ada policy yang menyebutkan suatu tindakan, tindakan tersebut diizinkan secara default untuk IAM user

---

## Bagian 2 — Design Resilient Architectures (Soal 21–37)

**Soal 21** *(Domain 2 — Task 2.2)*
Sebuah peritel daring menjalankan Amazon RDS for MySQL. Database mengalami lalu lintas baca yang berat dari dashboard pelaporan, dan perusahaan juga membutuhkan database untuk bertahan dari kegagalan Availability Zone dengan failover otomatis dan tanpa intervensi manual. Kombinasi mana yang memenuhi KEDUA persyaratan?

A) Mengaktifkan deployment Multi-AZ saja; instance standby dapat melayani pembacaan pelaporan
B) Membuat read replica saja; sebuah replica secara otomatis dipromosikan saat AZ primary gagal
C) Mengaktifkan deployment Multi-AZ untuk failover otomatis, dan menambahkan read replica untuk meringankan pembacaan pelaporan
D) Bermigrasi ke kelas instance single-AZ yang lebih besar untuk menangani kedua beban kerja

**Soal 22** *(Domain 2 — Task 2.2)*
Sebuah perusahaan menginginkan ketersediaan tinggi RDS di seluruh Availability Zone, tetapi keberatan membayar instance standby Multi-AZ tradisional yang tidak melayani lalu lintas. Opsi deployment RDS mana yang menyediakan failover otomatis DAN memungkinkan kapasitas standby melayani lalu lintas baca?

A) Deployment RDS Multi-AZ DB instance (satu standby)
B) Deployment RDS Multi-AZ DB cluster, yang memiliki dua instance standby yang dapat dibaca dengan reader endpoint
C) Read replica RDS di tiga AZ dengan Application Load Balancer
D) RDS Single-AZ dengan backup otomatis

**Soal 23** *(Domain 2 — Task 2.2)*
Sebuah platform pembayaran global di Amazon Aurora harus melakukan failover ke AWS Region kedua jika Region primary menjadi tidak tersedia. Tim kepatuhan bertanya apakah Aurora Global Database dapat menjamin kehilangan data nol (RPO = 0) lintas Region. Apa yang harus diberitahukan solutions architect kepada mereka?

A) Ya — Aurora Global Database mereplikasi secara sinkron lintas Region, sehingga RPO tepat 0
B) Tidak — Aurora Global Database menggunakan replikasi asinkron berbasis storage dengan lag tipikal di bawah 1 detik, sehingga RPO lintas Region mendekati nol tetapi tidak pernah dijamin tepat 0
C) Ya — tetapi hanya jika write forwarding diaktifkan di Region sekunder
D) Tidak — Aurora Global Database mereplikasi pada jadwal 5 menit, memberikan RPO 5 menit

**Soal 24** *(Domain 2 — Task 2.2)*
Rencana pemulihan bencana sebuah perusahaan menyatakan: "Setelah pemadaman Regional, sistem pemesanan harus berjalan kembali dalam 4 jam, dan tidak lebih dari 15 menit transaksi yang boleh hilang." Pernyataan mana yang secara benar memetakan angka-angka ini ke metrik DR?

A) RTO = 15 menit; RPO = 4 jam
B) RTO = 4 jam; RPO = 15 menit
C) MTBF = 4 jam; MTTR = 15 menit
D) RPO = 4 jam; SLA = 15 menit

**Soal 25** *(Domain 2 — Task 2.2)*
Sebuah perusahaan asuransi membutuhkan strategi DR untuk aplikasi kritis. Persyaratan: data harus terus-menerus direplikasi ke Region DR; infrastruktur inti (database, AMI, stack minimal) harus sudah ada di Region DR tetapi komputasi harus tetap dimatikan sampai bencana, untuk mengontrol biaya; RTO puluhan menit dapat diterima. Strategi DR mana yang cocok?

A) Backup and restore
B) Pilot light — elemen inti disediakan di Region DR dengan data direplikasi secara langsung, tetapi komputasi mati sampai failover
C) Warm standby — salinan penuh beban kerja yang diperkecil tetapi selalu berjalan
D) Multi-site active/active

**Soal 26** *(Domain 2 — Task 2.2)*
Manakah DUA pernyataan tentang strategi pemulihan bencana AWS yang akurat? (Pilih DUA.)

A) Backup and restore memerlukan sumber daya disediakan dan berjalan sebelumnya di Region pemulihan
B) Backup and restore menawarkan RTO terendah dari keempat strategi
C) Multi-site active/active melayani lalu lintas dari beberapa Region secara bersamaan dan menawarkan RTO mendekati nol dengan biaya tertinggi
D) Pilot light mempertahankan salinan aplikasi berkapasitas penuh yang melayani lalu lintas produksi di Region pemulihan
E) Warm standby mempertahankan salinan beban kerja yang diperkecil tetapi sepenuhnya fungsional yang selalu berjalan di Region pemulihan

**Soal 27** *(Domain 2 — Task 2.1)*
Sebuah aplikasi pemrosesan gambar membaca pesan dari antrian standard Amazon SQS. Memproses satu gambar memakan waktu hingga 3 menit, tetapi visibility timeout antrian disetel ke 30 detik. Pengguna melaporkan bahwa beberapa gambar diproses dua atau tiga kali. Apa penyebab dan perbaikan yang PALING mungkin?

A) Antrian adalah FIFO; beralih ke antrian standard
B) Visibility timeout berakhir sebelum pemrosesan selesai, membuat pesan terlihat lagi oleh konsumer lain; tingkatkan visibility timeout melampaui waktu pemrosesan
C) Long polling dinonaktifkan; aktifkan ReceiveMessageWaitTime 20 detik
D) Periode retensi pesan terlalu pendek; tingkatkan menjadi 14 hari

**Soal 28** *(Domain 2 — Task 2.1)*
Sebuah aplikasi penagihan mengonsumsi pesan dari antrian SQS. Sesekali pesan yang cacat menyebabkan konsumer gagal berulang kali, dan pesan tersebut berputar melalui antrian selamanya, membuang-buang komputasi. Apa yang harus dikonfigurasi arsitek?

A) Dead-letter queue dengan redrive policy maxReceiveCount, sehingga pesan yang berulang kali gagal dipindahkan ke samping untuk dianalisis
B) Visibility timeout yang lebih pendek sehingga pesan buruk dicoba ulang lebih cepat
C) Pengurutan FIFO, yang secara otomatis membuang pesan yang cacat
D) Periode retensi pesan 1 menit sehingga pesan buruk segera kedaluwarsa

**Soal 29** *(Domain 2 — Task 2.1)*
Sebuah perusahaan pialang memproses peristiwa perdagangan per akun pelanggan. Peristiwa untuk akun yang sama harus diproses secara berurutan ketat dan tepat sekali, tetapi peristiwa untuk akun yang berbeda boleh diproses secara paralel untuk throughput. Solusi mana yang memenuhi persyaratan ini?

A) Antrian standard SQS dengan satu thread konsumer
B) Antrian FIFO SQS yang menggunakan ID akun pelanggan sebagai MessageGroupId, yang mempertahankan urutan dalam setiap grup sambil mengizinkan paralelisme antar grup
C) Topic standard SNS dengan pemfilteran pesan berdasarkan ID akun
D) Antrian FIFO SQS dengan satu MessageGroupId untuk semua pelanggan

**Soal 30** *(Domain 2 — Task 2.1)*
Ketika sebuah pesanan dibuat, platform e-commerce harus secara bersamaan memicu tiga proses independen: pembuatan faktur, pemenuhan gudang, dan ingesti analitik. Setiap proses harus menerima setiap peristiwa pesanan, menyangganya secara durabel, dan memprosesnya dengan kecepatannya sendiri. Arsitektur mana yang memenuhi persyaratan ini?

A) Satu antrian SQS dengan tiga konsumer yang melakukan polling pada antrian yang sama
B) Topic SNS yang melakukan fan-out ke tiga antrian SQS, satu langganan per proses
C) Tiga fungsi Lambda yang dipanggil secara berurutan oleh Step Functions
D) Topic SNS dengan tiga langganan email

**Soal 31** *(Domain 2 — Task 2.1)*
Selama flash sale, sebuah fungsi Lambda yang dipicu oleh API Gateway mulai mengembalikan error throttling 429 sementara fungsi Lambda kritis lainnya di akun yang sama juga mulai di-throttle. Akun berada pada kuota konkurensi default-nya. Tindakan mana yang melindungi fungsi kritis agar tidak kekurangan sumber daya akibat fungsi sale?

A) Meningkatkan timeout fungsi sale dari 3 detik ke maksimum 15 menit
B) Mengonfigurasi reserved concurrency pada fungsi kritis (dan secara opsional membatasi fungsi sale), menjamin mereka mendapat konkurensi khusus dari pool akun
C) Mengaktifkan provisioned concurrency pada fungsi sale, yang menaikkan kuota seluruh akun
D) Memindahkan fungsi kritis ke konfigurasi memori 10 GB

**Soal 32** *(Domain 2 — Task 2.1)*
Sebuah perusahaan media memiliki alur kerja penerbitan video dengan langkah yang menunggu hingga 2 hari agar moderator manusia menyetujui konten melalui alat eksternal sebelum melanjutkan. Alur kerja harus dapat diaudit, berjalan selama berhari-hari, dan melanjutkan tepat di tempat ia berhenti setelah moderator merespons. Solusi mana yang PALING cocok?

A) Alur kerja Express Step Functions dengan state Wait
B) Alur kerja Standard Step Functions menggunakan pola callback: task token (waitForTaskToken) dikirim ke sistem moderasi, dan alur kerja melanjutkan saat SendTaskSuccess dipanggil
C) Fungsi Lambda yang tidur sampai moderator menyetujui
D) Aturan EventBridge dengan penundaan terjadwal 2 hari

**Soal 33** *(Domain 2 — Task 2.1)*
Sebuah perusahaan menjalankan pipeline ingesti IoT bervolume tinggi yang mengeksekusi sekitar 90.000 eksekusi alur kerja pendek per detik, masing-masing selesai dalam waktu kurang dari 5 detik. Semantik eksekusi tepat-sekali tidak diperlukan, tetapi biaya harus diminimalkan. Secara terpisah, alur kerja rekonsiliasi keuangan bulanan berjalan selama 12 jam dan memerlukan eksekusi tepat-sekali dengan riwayat eksekusi penuh. Jenis alur kerja Step Functions mana yang harus digunakan?

A) Express workflow untuk pipeline IoT; Standard workflow untuk rekonsiliasi
B) Standard workflow untuk keduanya
C) Express workflow untuk keduanya, karena Express mendukung hingga satu tahun eksekusi
D) Standard workflow untuk pipeline IoT; Express workflow untuk rekonsiliasi

**Soal 34** *(Domain 2 — Task 2.2)*
Sebuah perusahaan meng-host aplikasi web utamanya di ALB di us-east-1 dan salinan pemulihan pasif di us-west-2. Perusahaan ingin Route 53 mengirim semua lalu lintas ke us-east-1 dan secara otomatis mengarahkan ulang pengguna ke us-west-2 hanya saat endpoint primary menjadi tidak sehat. Konfigurasi Route 53 mana yang memenuhi persyaratan ini?

A) Weighted routing dengan bobot 50/50
B) Failover routing dengan health check pada record primary dan record us-west-2 disetel sebagai sekunder
C) Latency-based routing antara kedua Region
D) Geolocation routing dengan record default yang mengarah ke us-west-2

**Soal 35** *(Domain 2 — Task 2.2)*
Sebuah Auto Scaling group menjalankan server web EC2 di belakang Application Load Balancer di tiga Availability Zone. ALB menandai beberapa instance tidak sehat karena proses server web crash, namun Auto Scaling group tidak pernah menggantinya karena instance EC2 itu sendiri masih lulus status check. Apa yang harus diubah solutions architect?

A) Mengaktifkan pemantauan CloudWatch terperinci pada instance
B) Mengonfigurasi Auto Scaling group untuk menggunakan ELB health check selain EC2 status check, sehingga instance yang gagal target health ALB dihentikan dan diganti
C) Meningkatkan health check grace period ASG
D) Mengalihkan ALB ke Network Load Balancer

**Soal 36** *(Domain 2 — Task 2.1)*
Sebuah firma perdagangan membutuhkan load balancer untuk protokol TCP kustom yang harus menangani jutaan permintaan per detik dengan latensi sangat rendah dan mengekspos alamat IP statis per Availability Zone. Load balancer mana yang harus dipilih firma tersebut?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Soal 37** *(Domain 2 — Task 2.2)*
Manakah DUA pernyataan tentang membangun penyimpanan yang tangguh di AWS yang akurat? (Pilih DUA.)

A) S3 Cross-Region Replication secara retroaktif menyalin semua objek yang ada sebelum replikasi dikonfigurasi, tanpa tindakan tambahan
B) Storage class Amazon EFS Standard menyimpan data secara redundan di beberapa Availability Zone dan dapat di-mount secara bersamaan oleh instance di AZ yang berbeda
C) S3 Cross-Region Replication memerlukan versioning diaktifkan pada bucket sumber dan tujuan
D) Volume Amazon EFS hanya dapat dipasang ke satu instance EC2 pada satu waktu, seperti EBS
E) Mengaktifkan versioning S3 secara otomatis mereplikasi objek ke Region lain

---

## Bagian 3 — Design High-Performing Architectures (Soal 38–53)

**Soal 38** *(Domain 3 — Task 3.1)*
Sebuah perusahaan analitik media menjalankan database PostgreSQL di Amazon RDS menggunakan volume EBS gp3. Beban kerja pelaporan baru memerlukan 50.000 IOPS berkelanjutan dengan latensi sub-milidetik dan jaminan durabilitas 99,999%. Volume harus mendukung ini secara konsisten tanpa bursting. Jenis volume EBS mana yang harus direkomendasikan solutions architect?

A) gp3 yang disediakan dengan IOPS maksimum
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 dengan ukuran volume 16 TiB

**Soal 39** *(Domain 3 — Task 3.1)*
Sebuah firma riset genomika membutuhkan penyimpanan file bersama untuk cluster high-performance computing (HPC) berbasis Linux yang terdiri dari 500 instance EC2. Beban kerja memerlukan latensi sub-milidetik dan throughput agregat ratusan GB/s, dan dataset input ditempatkan di Amazon S3. Layanan penyimpanan mana yang paling memenuhi persyaratan ini?

A) Amazon EFS dengan mode performa Max I/O
B) Amazon FSx for Windows File Server dengan penyimpanan SSD
C) Amazon FSx for Lustre yang ditautkan ke bucket S3
D) Amazon S3 yang diakses melalui Mountpoint pada setiap instance

**Soal 40** *(Domain 3 — Task 3.1)*
Sebuah perusahaan sedang memigrasikan aplikasi Windows on-premises yang mengandalkan SMB file share dan access control list yang terintegrasi Active Directory. Aplikasi akan berjalan di instance EC2 Windows di dua Availability Zone dan harus mempertahankan izin NTFS-nya yang sudah ada. Layanan penyimpanan AWS mana yang harus dipilih solutions architect?

A) Amazon EFS dengan izin POSIX
B) Amazon FSx for Windows File Server dalam mode deployment Multi-AZ
C) Amazon S3 dengan bucket policy yang dipetakan ke grup AD
D) Amazon FSx for Lustre dengan penyimpanan persisten

**Soal 41** *(Domain 3 — Task 3.1)*
Sebuah perusahaan produksi video di Singapura mengunggah file footage mentah 40 GB ke bucket S3 di us-east-1 dari kantor di seluruh dunia. Unggahan sering gagal di tengah jalan melalui internet publik, memaksa restart lengkap, dan waktu transfer keseluruhan lambat. Kombinasi tindakan mana yang harus direkomendasikan solutions architect? (Pilih DUA.)

A) Mengonversi bucket ke S3 One Zone-IA untuk meningkatkan throughput tulis
B) Menempatkan Application Load Balancer di depan bucket di setiap region
C) Mengaktifkan S3 Cross-Region Replication ke bucket di ap-southeast-1
D) Mengaktifkan S3 Transfer Acceleration pada bucket dan mengunggah melalui endpoint yang dipercepat
E) Menggunakan multipart upload untuk file besar

**Soal 42** *(Domain 3 — Task 3.1)*
Sebuah platform real-time bidding menjalankan beban kerja NoSQL di EC2 yang membutuhkan latensi penyimpanan paling rendah secara mutlak untuk data scratch sementara. Data tersebut diregenerasi saat startup dan tidak perlu bertahan dari penghentian atau terminasi instance. Opsi penyimpanan mana yang memberikan performa tertinggi untuk kasus penggunaan ini?

A) Volume EBS io2 dengan 64.000 provisioned IOPS
B) Volume instance store (NVMe SSD) pada instance storage-optimized
C) Amazon EFS dalam mode General Purpose
D) Volume EBS gp3 dengan throughput provisioned maksimum

**Soal 43** *(Domain 3 — Task 3.3)*
Sebuah perusahaan game menyimpan data sesi pemain dalam tabel DynamoDB dengan partition key `game_id`. Hanya ada 12 game populer, dan tabel mengalami throttling pada beberapa partisi sementara kapasitas yang dikonsumsi secara keseluruhan jauh di bawah kapasitas yang disediakan. Apa yang harus direkomendasikan solutions architect?

A) Mengalihkan tabel ke provisioned capacity dengan auto scaling
B) Menggunakan partition key berkardinalitas tinggi, seperti komposit dari game_id dan player_id
C) Membuat local secondary index pada player_id
D) Mengaktifkan DynamoDB Streams untuk menyebarkan penulisan ke seluruh partisi

**Soal 44** *(Domain 3 — Task 3.3)*
Sebuah situs e-commerce menyimpan data katalog produk di DynamoDB. Lalu lintas baca sangat berat dengan item yang sama diminta jutaan kali per hari, dan tim membutuhkan latensi baca mikrodetik tanpa menulis ulang panggilan API DynamoDB aplikasi. Apa yang harus direkomendasikan solutions architect?

A) Menyebarkan Amazon ElastiCache for Redis dan memodifikasi aplikasi untuk memeriksa cache terlebih dahulu
B) Menambahkan DynamoDB Accelerator (DAX) di depan tabel
C) Membuat global secondary index untuk mendistribusikan pembacaan
D) Mengaktifkan DynamoDB Global Tables di region kedua

**Soal 45** *(Domain 3 — Task 3.3)*
Sebuah perusahaan logistik memiliki tabel DynamoDB di produksi yang membutuhkan pola kueri baru: mengkueri pengiriman berdasarkan `carrier_id` dan mengurutkan berdasarkan `delivery_date`, dengan throughput-nya sendiri yang disediakan sehingga kueri analitik baru tidak memengaruhi aplikasi utama. Tabel sudah ada dan memiliki lalu lintas langsung. Solusi mana yang memenuhi persyaratan ini?

A) Membuat local secondary index dengan carrier_id sebagai sort key
B) Membuat global secondary index dengan carrier_id sebagai partition key dan delivery_date sebagai sort key
C) Membuat ulang tabel dengan primary key komposit dari carrier_id dan delivery_date
D) Mengaktifkan DynamoDB Stream dan mengkueri stream berdasarkan carrier_id

**Soal 46** *(Domain 3 — Task 3.3)*
Sebuah layanan manajemen sesi menyimpan sesi pengguna di DynamoDB. Sesi menjadi tidak berguna setelah 24 jam, dan tim ingin item yang kedaluwarsa dihapus secara otomatis tanpa biaya tambahan. Apa yang harus diimplementasikan solutions architect?

A) Fungsi Lambda terjadwal yang memindai tabel setiap jam dan menghapus item lama
B) DynamoDB Time to Live (TTL) dengan atribut stempel waktu kedaluwarsa pada setiap item
C) Lifecycle policy pada tabel DynamoDB
D) DynamoDB Streams dengan filter untuk membuang item yang lebih lama dari 24 jam

**Soal 47** *(Domain 3 — Task 3.3)*
Sebuah aplikasi serverless menggunakan fungsi Lambda yang terhubung ke database Amazon RDS for MySQL. Selama lonjakan lalu lintas, ratusan pemanggilan Lambda bersamaan menghabiskan batas koneksi database, menyebabkan error. Solusi mana yang menangani ini dengan perubahan aplikasi paling sedikit?

A) Meningkatkan ukuran instance RDS untuk menaikkan max_connections
B) Menempatkan Amazon RDS Proxy di antara fungsi Lambda dan database
C) Memigrasikan database ke DynamoDB
D) Mengonfigurasi reserved concurrency Lambda sebesar 10

**Soal 48** *(Domain 3 — Task 3.3)*
Sebuah situs berita keuangan menggunakan Amazon Aurora MySQL. Lalu lintas baca melonjak 20x selama jam pasar dan instance primary terbatas CPU dalam melayani kueri SELECT. Penulisan sederhana. Apa cara yang PALING efisien secara operasional untuk menskalakan pembacaan?

A) Menambahkan Aurora Replica dan mengarahkan lalu lintas baca ke reader endpoint cluster dengan auto scaling
B) Membuat standby Multi-AZ dan mengirim pembacaan ke standby
C) Melakukan sharding database di beberapa cluster Aurora
D) Mengaktifkan Aurora Backtrack untuk meringankan pembacaan

**Soal 49** *(Domain 3 — Task 3.4)*
Sebuah perusahaan game multiplayer menjalankan aplikasi yang sensitif terhadap latensi menggunakan protokol UDP di Network Load Balancer di dua AWS Region. Pemain di seluruh dunia membutuhkan alamat IP statis untuk allow-listing dan failover regional yang cepat. Layanan mana yang harus dipilih solutions architect?

A) Amazon CloudFront dengan dua custom origin
B) AWS Global Accelerator dengan endpoint group di kedua region
C) Amazon Route 53 dengan latency-based routing
D) Application Load Balancer dengan cross-zone load balancing

**Soal 50** *(Domain 3 — Task 3.4)*
Sebuah perusahaan streaming harus mematuhi aturan lisensi konten: pengguna di Jerman harus selalu dilayani dari deployment eu-central-1, dan pengguna di Prancis dari deployment eu-west-3, terlepas dari endpoint mana yang menawarkan latensi lebih rendah. Kebijakan routing Route 53 mana yang harus digunakan?

A) Latency-based routing
B) Geolocation routing
C) Geoproximity routing dengan bias positif pada eu-central-1
D) Weighted routing dengan bobot 50/50

**Soal 51** *(Domain 3 — Task 3.2)*
Seorang solutions architect sedang menyebarkan beban kerja HPC yang sangat terikat (tightly coupled) yang menggunakan MPI dan membutuhkan latensi jaringan serendah mungkin serta performa packet-per-second tertinggi antara 32 instance EC2. Strategi penempatan mana yang harus digunakan?

A) Spread placement group di tiga Availability Zone
B) Partition placement group dengan 7 partisi
C) Cluster placement group di satu Availability Zone
D) Meluncurkan instance di subnet terpisah dengan enhanced networking

**Soal 52** *(Domain 3 — Task 3.5)*
Sebuah perusahaan IoT mengingesti data clickstream yang harus dikirim ke Amazon S3 dalam waktu hampir real-time untuk analitik. Tim menginginkan solusi yang dikelola sepenuhnya tanpa aplikasi konsumer untuk ditulis, tanpa pengelolaan shard, dan dengan penyangga record bawaan serta konversi format ke Parquet. Layanan mana yang harus mereka gunakan?

A) Amazon Kinesis Data Streams dengan konsumer Lambda
B) Amazon Data Firehose (sebelumnya Kinesis Data Firehose) dengan tujuan S3
C) Amazon SQS dengan armada poller EC2
D) Amazon MSK dengan sink Kafka Connect kustom

**Soal 53** *(Domain 3 — Task 3.5)*
Sebuah perusahaan menyimpan log aplikasi sebagai file JSON terkompresi di Amazon S3 dan ingin analis menjalankan kueri SQL ad hoc terhadapnya tanpa menyediakan server atau memuat data ke database. Skema harus ditemukan dan dikatalogkan secara otomatis. Kombinasi mana yang harus direkomendasikan solutions architect?

A) Amazon Redshift dengan perintah COPY dan penyegaran terjadwal
B) AWS Glue crawler untuk mengisi Data Catalog dan Amazon Athena untuk kueri SQL
C) Amazon EMR dengan cluster Presto yang berjalan lama
D) Amazon RDS for PostgreSQL dengan ekstensi aws_s3

---

## Bagian 4 — Design Cost-Optimized Architectures (Soal 54–65)

**Soal 54** *(Domain 4 — Task 4.2)*
Sebuah lembaga riset menjalankan simulasi batch malam hari di EC2 yang memakan waktu sekitar 90 menit, mencatat checkpoint kemajuan ke Amazon S3 setiap 5 menit, dan dapat dimulai ulang dari checkpoint terakhir kapan saja. Lembaga menginginkan biaya komputasi serendah mungkin. Opsi pembelian mana yang harus direkomendasikan solutions architect?

A) On-Demand Instances di satu AZ
B) Standard Reserved Instances dengan jangka 3 tahun
C) Spot Instances menggunakan Spot Fleet yang didiversifikasi di beberapa jenis instance dan AZ
D) Compute Savings Plan yang diukur sesuai puncak beban kerja batch

**Soal 55** *(Domain 4 — Task 4.2)*
Sebuah perusahaan SaaS memiliki pengeluaran komputasi baseline yang stabil tetapi mengharapkan untuk memigrasikan beban kerja antara EC2, AWS Fargate, dan AWS Lambda selama tiga tahun ke depan saat memodernisasi. Perusahaan menginginkan diskon berbasis komitmen yang secara otomatis berlaku di ketiga layanan komputasi dan semua region. Opsi mana yang harus direkomendasikan solutions architect?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Soal 56** *(Domain 4 — Task 4.2)*
Sebuah perusahaan membeli Standard Reserved Instances 3 tahun untuk Amazon RDS dan untuk Amazon EC2. Setelah re-arsitektur, perusahaan tidak lagi membutuhkan kedua reservasi tersebut. Tim keuangan bertanya reservasi mana yang dapat dijual untuk memulihkan biaya. Apa yang harus diberitahukan solutions architect kepada mereka?

A) Baik Reserved Instances EC2 maupun RDS dapat dijual di Reserved Instance Marketplace
B) Hanya Reserved Instances EC2 yang dapat dijual di Reserved Instance Marketplace; RI RDS tidak dapat dijual kembali
C) Hanya Reserved Instances RDS yang dapat dijual, karena reservasi database dapat dipindahtangankan
D) Tidak ada yang dapat dijual; Reserved Instances tidak dapat dikembalikan dan tidak dapat dipindahtangankan dalam semua kasus

**Soal 57** *(Domain 4 — Task 4.2)*
Sebuah tim pengembangan menjalankan pemrosesan data fault-tolerant yang terkontainerisasi di Amazon ECS dengan kapasitas EC2 Spot. Mereka membutuhkan worker untuk melakukan drain dan checkpoint secara graceful sebelum pengambilan kembali. Berapa banyak peringatan awal yang diberikan AWS sebelum Spot Instance diinterupsi?

A) Tidak ada peringatan yang diberikan
B) Pemberitahuan interupsi 2 menit
C) Pemberitahuan interupsi 15 menit
D) Jendela rebalance 24 jam

**Soal 58** *(Domain 4 — Task 4.1)*
Sebuah arsip layanan kesehatan menyimpan catatan kepatuhan di Amazon S3 yang jarang diakses tetapi, saat dipanggil dengan surat perintah pengadilan, harus dapat diambil dalam 5 menit. Catatan disimpan selama 7 tahun dan biaya penyimpanan harus diminimalkan. Storage class mana yang memenuhi persyaratan ini?

A) S3 Glacier Deep Archive dengan Standard retrieval
B) S3 Glacier Flexible Retrieval dengan Expedited retrieval saat dibutuhkan
C) S3 Glacier Flexible Retrieval dengan Bulk retrieval
D) S3 Standard-IA

**Soal 59** *(Domain 4 — Task 4.1)*
Sebuah startup berbagi foto menyimpan gambar thumbnail yang mudah direproduksi dan jarang diakses. Tim menginginkan opsi infrequent-access berbiaya terendah dan menerima bahwa kehilangan satu Availability Zone dapat memerlukan regenerasi thumbnail dari aslinya. Storage class mana yang harus digunakan?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Soal 60** *(Domain 4 — Task 4.1)*
Sebuah perusahaan memiliki bucket S3 dengan jutaan objek yang pola aksesnya tidak diketahui dan berubah secara tidak terduga. Seorang solutions architect sedang mengevaluasi S3 Intelligent-Tiering. Manakah DUA pernyataan tentang Intelligent-Tiering yang akurat? (Pilih DUA.)

A) Ia mengenakan biaya pemantauan dan otomasi kecil per objek untuk objek yang dipantaunya
B) Ia mengenakan biaya pengambilan setiap kali objek berpindah kembali ke tier Frequent Access
C) Objek yang lebih kecil dari 128 KB tidak dipantau atau di-tier otomatis dan ditagih dengan tarif tier Frequent Access
D) Ia mereplikasi objek ke region kedua secara otomatis
E) Ia memerlukan durasi penyimpanan minimum 90 hari untuk setiap objek

**Soal 61** *(Domain 4 — Task 4.1)*
Sebuah tim analitik sering membatalkan multipart upload besar ke bucket data lake S3, dan AWS Cost Explorer menunjukkan biaya penyimpanan yang terus bertambah meskipun jumlah objek yang terlihat di bucket tetap. Apa perbaikan yang PALING hemat biaya?

A) Mengaktifkan S3 Versioning untuk melacak part yang yatim
B) Menambahkan lifecycle rule yang membatalkan multipart upload yang tidak lengkap setelah sejumlah hari tertentu
C) Memigrasikan bucket ke S3 One Zone-IA
D) Mengaktifkan S3 Transfer Acceleration untuk menyelesaikan unggahan lebih cepat

**Soal 62** *(Domain 4 — Task 4.1)*
Armada EC2 sebuah perusahaan menggunakan ratusan volume EBS gp2 yang diukur besar semata-mata untuk memperoleh baseline IOPS. Tinjauan utilisasi menunjukkan IOPS dibutuhkan tetapi sebagian besar kapasitas tidak. Apa yang harus dilakukan solutions architect untuk mengurangi biaya penyimpanan tanpa kehilangan performa?

A) Memigrasikan volume ke io2 dan menyediakan IOPS yang sama
B) Memigrasikan volume ke gp3, menyesuaikan ukuran kapasitas, dan menyediakan IOPS secara independen
C) Mengonversi volume ke st1 throughput-optimized HDD
D) Membuat snapshot volume setiap hari dan menghapus aslinya

**Soal 63** *(Domain 4 — Task 4.4)*
Sebuah pipeline data di subnet privat mentransfer 60 TB per bulan dari instance EC2 ke Amazon S3 di region yang sama melalui NAT gateway, menghasilkan biaya pemrosesan data yang besar. Apa perubahan yang PALING hemat biaya?

A) Mengganti NAT gateway dengan NAT instance pada instance EC2 besar
B) Membuat gateway VPC endpoint untuk S3 dan merutekan lalu lintas melaluinya
C) Membuat interface VPC endpoint (PrivateLink) untuk S3
D) Memindahkan instance EC2 ke subnet publik dengan alamat IPv4 publik

**Soal 64** *(Domain 4 — Task 4.4)*
Tagihan bulanan sebuah startup menunjukkan biaya tak terduga untuk alamat IPv4 publik yang digunakan di puluhan instance EC2 yang hanya memanggil layanan AWS lain dalam VPC. Tim keuangan juga ingin peringatan sebelum pengeluaran keseluruhan bulan depan melebihi ambang batas. Kombinasi tindakan mana yang harus dilakukan solutions architect? (Pilih DUA.)

A) Mengganti IPv4 publik dengan Elastic IP pada setiap instance, yang selalu gratis selama terpasang
B) Menghapus alamat IPv4 publik dan menggunakan konektivitas privat (VPC endpoint/NAT sesuai kebutuhan), karena AWS mengenakan biaya untuk alamat IPv4 publik yang digunakan
C) Menggunakan AWS Compute Optimizer untuk memblokir pengeluaran di atas ambang batas
D) Mengaktifkan AWS Shield Advanced untuk membatasi pengeluaran bulanan
E) Membuat cost budget AWS Budgets dengan ambang peringatan dan notifikasi email

**Soal 65** *(Domain 4 — Task 4.3)*
Sebuah lingkungan pengembangan menggunakan cluster Amazon Aurora PostgreSQL yang idle pada malam hari dan akhir pekan tetapi harus bangun secara otomatis saat developer terhubung, tanpa intervensi manual atau pengubahan ukuran instance. Biaya harus turun hingga mendekati nol untuk komputasi saat idle. Solusi mana yang memenuhi persyaratan ini?

A) Aurora Serverless v2 yang dikonfigurasi dengan kapasitas minimum 0 ACU sehingga melakukan auto-pause saat idle
B) Cluster Aurora provisioned yang dihentikan oleh fungsi Lambda terjadwal setiap malam
C) Aurora global database dengan cluster sekunder headless
D) Aurora provisioned dengan dua instance reader yang diciutkan pada malam hari

---

## Kunci Jawaban

### Bagian 1 — Soal 1–20

**1. Jawaban: B** — SCP tidak pernah berlaku untuk akun management organisasi, sehingga principal-nya tidak terpengaruh oleh pembatasan Region. *Mengapa bukan yang lain:* A — SCP memang diwariskan melalui OU bersarang; C — Allow IAM tidak dapat menimpa Deny SCP di akun member; D — SCP berlaku segera untuk semua akun saat ini dan masa depan di bawah titik pemasangan.

**2. Jawaban: C** — Permission boundary yang ditegakkan sebagai condition pada tindakan pembuatan role membatasi izin maksimum dari role apa pun yang dibuat developer, mencegah eskalasi hak istimewa sambil mempertahankan layanan mandiri. *Mengapa bukan yang lain:* A — tinjauan manual menambah overhead operasional dan menghilangkan layanan mandiri; B — menolak iam:CreateRole memblokir alur kerja yang sah; D — peringatan CloudTrail bersifat detektif, bukan preventif.

**3. Jawaban: B** — ExternalId yang ditentukan pelanggan dan divalidasi dalam condition trust policy memastikan penyedia SaaS hanya mengasumsikan role atas nama pelanggan yang benar, memitigasi masalah confused deputy. *Mengapa bukan yang lain:* A — MFA tidak praktis untuk asumsi layanan-ke-layanan otomatis dan tidak menangani kebingungan deputy; C — mengenkripsi ARN (yang bukan rahasia) tidak menyelesaikan apa pun; D — kunci IAM user berumur panjang kurang aman daripada role.

**4. Jawaban: B** — IAM Identity Center memfederasi sekali dengan Entra ID dan secara terpusat menetapkan permission set di semua akun organisasi melalui satu portal akses. *Mengapa bukan yang lain:* A — IAM user per akun adalah persis overhead yang harus dihindari; C — Cognito untuk identitas aplikasi (pelanggan), bukan akses tenaga kerja ke akun AWS; D — penyiapan SAML per akun manual berfungsi tetapi memiliki overhead operasional jauh lebih tinggi.

**5. Jawaban: A** — User pool menangani autentikasi (sign-in email/sosial); identity pool menukar token yang dihasilkan dengan kredensial AWS sementara yang dibatasi oleh IAM role untuk mengakses S3. *Mengapa bukan yang lain:* B — membalik tujuan kedua layanan; C — IAM Identity Center untuk pengguna tenaga kerja, bukan pelanggan aplikasi; D — token user pool (JWT) tidak memberikan akses layanan AWS dengan sendirinya.

**6. Jawaban: B** — Customer managed key memberikan kontrol penuh atas key policy, pencatatan penggunaan, dan penonaktifan, serta mendukung rotasi otomatis (tahunan secara default). *Mengapa bukan yang lain:* A — AWS managed key tidak memungkinkan Anda mengedit key policy atau menonaktifkan kunci; C — AWS owned key sepenuhnya tidak terlihat oleh pelanggan; D — imported (BYOK) key material tidak mendukung rotasi otomatis.

**7. Jawaban: B** — Envelope encryption: KMS menghasilkan data key; data dienkripsi secara lokal dengan plaintext data key, yang dibuang, sementara salinan data key yang terenkripsi KMS disimpan bersama ciphertext. *Mengapa bukan yang lain:* A dan C — KMS tidak pernah mengenkripsi payload besar secara langsung atau melalui streaming; D — kunci hardcode adalah anti-pola dan bukan envelope encryption.

**8. Jawaban: C** — Strategi alternating-users Secrets Manager mempertahankan dua kredensial dan merotasinya bergantian, sehingga koneksi yang ada yang menggunakan kredensial sebelumnya tetap berfungsi selama rotasi. *Mengapa bukan yang lain:* A — Parameter Store tidak memiliki rotasi bawaan; Anda harus membangun semuanya sendiri; B — rotasi single-user membatalkan kata sandi lama segera, berisiko kegagalan koneksi; D — rotasi KMS merotasi materi kunci enkripsi, bukan kata sandi database.

**9. Jawaban: C** — SSE-C memungkinkan pelanggan menyediakan kunci enkripsi pada setiap permintaan; AWS menggunakannya di memori untuk operasi dan tidak pernah menyimpannya. *Mengapa bukan yang lain:* A — kunci SSE-S3 sepenuhnya dikelola AWS; B — kunci SSE-KMS disimpan di AWS KMS; D — aws/s3 adalah kunci KMS yang dikelola AWS dan sama sekali bukan sisi klien.

**10. Jawaban: B** — Mode compliance Object Lock mencegah penghapusan atau penimpaan oleh user mana pun, termasuk root, sampai retensi kedaluwarsa, dan Object Lock memerlukan versioning. *Mengapa bukan yang lain:* A — mode governance dapat dilewati oleh user dengan s3:BypassGovernanceRetention; C — bucket policy dapat dimodifikasi atau dihapus oleh root user; D — kedaluwarsa lifecycle tidak mencegah penghapusan selama periode.

**11. Jawaban: B** — NACL bersifat stateless, sehingga lalu lintas respons ke port sumber ephemeral klien harus diizinkan secara eksplisit untuk keluar. *Mengapa bukan yang lain:* A — NACL bersifat stateless, bukan stateful; C — security group bersifat stateful, sehingga lalu lintas balasan otomatis; D — 0.0.0.0/0 sepenuhnya valid dalam aturan NACL.

**12. Jawaban: A, B** — Security group bersifat stateful (lalu lintas balasan otomatis diizinkan), dan NACL memproses aturan bernomor secara berurutan dan mendukung Deny. *Mengapa bukan yang lain:* C — security group hanya mendukung aturan Allow; D — NACL terpasang pada subnet, bukan ENI (security group terpasang pada ENI); E — aturan security group semuanya dievaluasi bersama tanpa pengurutan.

**13. Jawaban: B** — Shield Advanced menyediakan Shield Response Team, perlindungan biaya DDoS, dan visibilitas/diagnostik serangan untuk sumber daya yang dilindungi seperti CloudFront dan ALB. *Mengapa bukan yang lain:* A — Shield Standard otomatis tetapi tidak menyertakan akses SRT atau perlindungan biaya; C — WAF menangani pola permintaan layer-7, bukan seluruh set persyaratan; D — GuardDuty adalah deteksi ancaman, bukan perlindungan DDoS.

**14. Jawaban: B** — AWS WAF pada ALB dengan managed rule group SQLi ditambah rate-based rule memblokir kedua pola serangan tanpa perubahan kode aplikasi. *Mengapa bukan yang lain:* A — upaya pengembangan tinggi; C — Shield Standard menangani banjir L3/L4, bukan SQL injection; D — security group tidak dapat memeriksa konten permintaan.

**15. Jawaban: B** — GuardDuty = deteksi ancaman dari log dan threat intel; Macie = penemuan data sensitif (PII) di S3; Inspector = pemindaian kerentanan (CVE) terhadap EC2, image ECR, dan Lambda. *Mengapa bukan yang lain:* A, C, D — masing-masing mengacaukan setidaknya dua dari pemetaan layanan-ke-tujuan.

**16. Jawaban: B** — Gateway endpoint hanya ada untuk S3 dan DynamoDB, menjaga lalu lintas di jaringan AWS, dan tidak memiliki biaya per jam atau pemrosesan data. *Mengapa bukan yang lain:* A — NAT gateway merutekan via ruang IP publik dan dikenai biaya per jam/per GB; C — interface endpoint menimbulkan biaya per jam dan data, jadi bukan biaya terendah; D — internet gateway mengirim lalu lintas melalui internet publik.

**17. Jawaban: A** — IMDSv2 memerlukan session token yang diperoleh via permintaan PUT, yang tidak dapat dilakukan oleh vektor SSRF tipikal; menegakkan HttpTokens=required memblokir pencurian kredensial IMDSv1. *Mengapa bukan yang lain:* B — banyak agen dan SDK secara sah membutuhkan IMDS; C — NACL tidak memengaruhi lalu lintas link-local antara instance dan endpoint metadata-nya sendiri; D — kredensial statis dalam file jauh lebih buruk daripada kredensial role.

**18. Jawaban: C** — Parameter standard Parameter Store gratis dan baik untuk konfigurasi plaintext; Secrets Manager menambahkan rotasi bawaan hanya untuk 5 kata sandi, meminimalkan biaya. *Mengapa bukan yang lain:* A — membayar harga per-secret Secrets Manager untuk 200 nilai konfigurasi biasa boros; B — Parameter Store saja tidak memiliki rotasi native untuk kata sandi; D — Parameter Store tidak memiliki rotasi otomatis bawaan, jadi opsi ini menyatakan kemampuan yang tidak ada.

**19. Jawaban: B** — S3 Bucket Keys memungkinkan S3 menghasilkan data key tingkat-bucket berbatas waktu dari kunci KMS, secara dramatis mengurangi permintaan KMS per-objek (dan biaya) sambil tetap SSE-KMS. *Mengapa bukan yang lain:* A — SSE-S3 meninggalkan persyaratan KMS; C — frekuensi rotasi tidak memengaruhi volume API per-permintaan; D — imported key material tidak mengubah jumlah permintaan.

**20. Jawaban: B, D** — Deny eksplisit selalu menang atas Allow apa pun dalam evaluasi policy, dan permission boundary hanya membatasi (tidak pernah memberikan) izin. *Mengapa bukan yang lain:* A — SCP adalah guardrail yang membatasi izin yang tersedia; SCP tidak memberikan apa pun; C — resource-based policy secara rutin memberikan akses lintas akun dengan sendirinya; E — IAM default ke implicit deny saat tidak ada yang mengizinkan suatu tindakan.

### Bagian 2 — Soal 21–37

**21. Jawaban: C** — Multi-AZ menyediakan failover otomatis untuk kegagalan AZ; read replica menyerap lalu lintas baca pelaporan — dua fitur untuk dua masalah berbeda. *Mengapa bukan yang lain:* A — standby Multi-AZ tradisional tidak dapat melayani pembacaan; B — promosi replica bersifat manual (atau di-script) dan replica saja tidak memberikan failover HA otomatis; D — instance single-AZ yang lebih besar gagal pada kedua persyaratan ketahanan AZ.

**22. Jawaban: B** — Deployment Multi-AZ DB cluster menjalankan satu writer dan dua standby yang dapat dibaca di tiga AZ, dengan reader endpoint, sehingga kapasitas standby melayani pembacaan sambil tetap mendukung failover otomatis yang cepat. *Mengapa bukan yang lain:* A — standby tunggal dalam deployment instance tidak melayani lalu lintas; C — read replica tidak menyediakan failover otomatis terkelola dan database RDS tidak di-load-balance via ALB; D — Single-AZ tidak memiliki failover sama sekali.

**23. Jawaban: B** — Replikasi Aurora Global Database bersifat asinkron di lapisan storage dengan lag tipikal sub-detik, sehingga RPO lintas Region mendekati nol tetapi tidak pernah dapat dijamin tepat 0. *Mengapa bukan yang lain:* A — replikasi tidak sinkron lintas Region; C — write forwarding merutekan penulisan ke primary; itu tidak mengubah semantik replikasi; D — lag replikasi biasanya di bawah satu detik, bukan jadwal 5 menit.

**24. Jawaban: B** — Recovery Time Objective adalah downtime maksimum yang dapat ditoleransi (4 jam); Recovery Point Objective adalah jendela kehilangan data maksimum yang dapat ditoleransi (15 menit). *Mengapa bukan yang lain:* A — membalik definisi; C — MTBF/MTTR adalah statistik keandalan, bukan tujuan DR; D — SLA adalah komitmen kontraktual, bukan metrik kehilangan data.

**25. Jawaban: B** — Pilot light menjaga data terus-menerus direplikasi dan sumber daya inti disediakan tetapi dimatikan, menghasilkan RTO puluhan menit dengan biaya rendah — kecocokan persis. *Mengapa bukan yang lain:* A — backup and restore tidak memiliki replikasi langsung dan RTO jauh lebih lama; C — warm standby menjaga stack tetap berjalan, biayanya lebih dari yang dibutuhkan; D — active/active adalah yang paling mahal dan jauh melampaui persyaratan.

**26. Jawaban: C, E** — Warm standby adalah salinan penuh yang diperkecil dan selalu berjalan; multi-site active/active melayani dari beberapa Region dengan RTO mendekati nol dengan biaya tertinggi. *Mengapa bukan yang lain:* A — backup and restore didefinisikan dengan tidak menjalankan sumber daya sebelumnya; B — backup and restore memiliki RTO tertinggi (terburuk); D — pilot light disediakan-tetapi-mati, bukan kapasitas penuh yang melayani lalu lintas.

**27. Jawaban: B** — Ketika visibility timeout 30 detik habis di tengah pemrosesan, pesan muncul kembali dan konsumer lain memprosesnya lagi; setel visibility timeout lebih lama dari waktu pemrosesan maksimum (mis. 6× sebagai praktik terbaik). *Mengapa bukan yang lain:* A — FIFO vs. standard bukan penyebabnya; C — long polling memengaruhi efisiensi empty-receive, bukan duplikat; D — periode retensi mengatur berapa lama pesan bertahan, bukan pengiriman ulang.

**28. Jawaban: A** — Redrive policy dengan maxReceiveCount memindahkan pesan yang berulang kali gagal ("poison pill") ke dead-letter queue untuk analisis offline, menghentikan loop retry tak terbatas. *Mengapa bukan yang lain:* B — visibility timeout yang lebih pendek membuat loop berputar lebih cepat; C — FIFO tidak membuang pesan yang cacat; D — retensi 1 menit juga akan mengakhiri pesan yang valid.

**29. Jawaban: B** — Antrian FIFO menjamin pemrosesan tepat-sekali dan pengurutan ketat dalam satu MessageGroupId; menggunakan ID akun sebagai group ID memberikan pengurutan per-akun dengan paralelisme antar-akun (dan mode FIFO throughput tinggi dapat menskala lebih jauh). *Mengapa bukan yang lain:* A — antrian standard tidak dapat menjamin urutan atau tepat-sekali; C — SNS tidak memberikan jaminan pengurutan atau pemrosesan tepat-sekali untuk pola ini; D — satu group ID menserialisasi semuanya, menghancurkan throughput.

**30. Jawaban: B** — Fan-out SNS-ke-SQS mengirim setiap peristiwa ke setiap antrian, di mana setiap konsumer mendapat penyangga durabel dan kecepatan pemrosesan independen. *Mengapa bukan yang lain:* A — tiga konsumer pada satu antrian membagi pesan; setiap pesan hanya menuju satu konsumer; C — pemanggilan berurutan bukan pemrosesan paralel independen dengan penyangga; D — langganan email mengirim ke manusia, bukan penyangga aplikasi yang durabel.

**31. Jawaban: B** — Reserved concurrency menyisihkan konkurensi khusus untuk fungsi kritis (dan membatasi fungsi sale membatasi blast radius-nya), mencegah satu fungsi menghabiskan pool akun bersama. *Mengapa bukan yang lain:* A — timeout yang lebih lama menahan slot konkurensi lebih lama, memperburuk throttling; C — provisioned concurrency memanaskan lingkungan sebelumnya tetapi tidak menaikkan kuota konkurensi akun; D — ukuran memori tidak memengaruhi batas konkurensi.

**32. Jawaban: B** — Standard workflow berjalan hingga satu tahun dan pola callback waitForTaskToken menjeda eksekusi tanpa biaya komputasi sampai SendTaskSuccess/SendTaskFailure mengembalikan token. *Mengapa bukan yang lain:* A — Express workflow maksimum 5 menit; C — Lambda dapat berjalan paling lama 15 menit dan tidur membuang uang; D — jadwal EventBridge dapat memicu peristiwa tetapi tidak dapat menjeda dan melanjutkan state alur kerja.

**33. Jawaban: A** — Express workflow dibangun untuk eksekusi berlaju sangat tinggi, durasi pendek, setidaknya-sekali dengan biaya lebih rendah; Standard workflow menyediakan semantik tepat-sekali, durasi hingga satu tahun, dan riwayat eksekusi penuh untuk job rekonsiliasi. *Mengapa bukan yang lain:* B — Standard tidak dapat mempertahankan 90.000 start/detik secara ekonomis untuk kasus penggunaan ini; C — Express maksimum 5 menit dan setidaknya-sekali, gagal pada job tepat-sekali 12 jam; D — penetapan terbalik gagal pada kedua beban kerja.

**34. Jawaban: B** — Failover routing mengirim semua lalu lintas ke primary selama health check-nya lulus, lalu secara otomatis menjawab dengan record sekunder saat gagal. *Mengapa bukan yang lain:* A — weighted 50/50 mengirim setengah lalu lintas ke salinan pasif sepanjang waktu; C — latency-based routing membagi lalu lintas berdasarkan performa, bukan maksud active/passive; D — geolocation merutekan berdasarkan lokasi pengguna, tidak terkait dengan failover berbasis kesehatan endpoint.

**35. Jawaban: B** — Menambahkan jenis ELB health check membuat ASG memperlakukan kegagalan target-health ALB sebagai tidak sehat, sehingga instance yang aplikasinya crash dihentikan dan diganti meskipun EC2 status check lulus. *Mengapa bukan yang lain:* A — pemantauan terperinci hanya mengubah granularitas metrik; C — grace period menunda evaluasi kesehatan, kebalikan dari yang dibutuhkan; D — jenis load balancer bukan masalahnya.

**36. Jawaban: B** — Network Load Balancer beroperasi di layer 4 (TCP/UDP), menangani jutaan permintaan per detik dengan latensi sangat rendah, dan mendukung IP statis (atau Elastic) per AZ. *Mengapa bukan yang lain:* A — ALB adalah layer 7 (HTTP/HTTPS) dan tidak menawarkan IP statis secara native; C — Gateway Load Balancer untuk menyebarkan appliance virtual inline; D — Classic Load Balancer adalah legacy dan tidak memenuhi kedua persyaratan.

**37. Jawaban: B, C** — CRR memerlukan versioning diaktifkan pada kedua bucket, dan kelas EFS Standard adalah sistem file regional (multi-AZ) yang dapat di-mount secara bersamaan lintas AZ. *Mengapa bukan yang lain:* A — CRR hanya mereplikasi objek baru setelah konfigurasi kecuali Anda menjalankan S3 Batch Replication untuk yang sudah ada; D — EFS mendukung ribuan klien NFS bersamaan, tidak seperti EBS single-attach; E — versioning adalah prasyarat untuk replikasi tetapi tidak mereplikasi apa pun dengan sendirinya.

### Bagian 3 — Soal 38–53

**38. Jawaban: B** — io2 Block Express memberikan hingga 256.000 IOPS, latensi sub-milidetik, dan durabilitas 99,999%, memenuhi ketiga persyaratan. *Mengapa bukan yang lain:* A — gp3 kini dapat mencapai angka IOPS tersebut (batasnya dinaikkan menjadi 80.000 pada akhir 2025), tetapi gagal pada dua persyaratan lainnya: durabilitas 99,8–99,9% (soal menuntut 99,999%) dan latensinya milidetik satu digit, bukan dijamin sub-milidetik; B adalah satu-satunya jenis yang memenuhi ketiganya; C — st1 berbasis HDD dan tidak cocok untuk database intensif IOPS; D — gp2 maksimum 16.000 IOPS dan bursting bukan jaminan berkelanjutan.

**39. Jawaban: C** — FSx for Lustre dibangun khusus untuk HPC dengan latensi sub-milidetik, throughput ratusan GB/s, dan integrasi S3 native (lazy-loading dan ekspor). *Mengapa bukan yang lain:* A — EFS tidak dapat menyamai profil throughput/latensi HPC Lustre; B — FSx for Windows menyasar beban kerja SMB/Windows, bukan HPC Linux; D — Mountpoint for S3 tidak memberikan semantik sistem file POSIX bersama atau latensi yang diperlukan.

**40. Jawaban: B** — FSx for Windows File Server secara native mendukung SMB, integrasi Active Directory, dan ACL NTFS, dan mode Multi-AZ mencakup persyaratan dua-AZ. *Mengapa bukan yang lain:* A — EFS adalah NFS/POSIX dan tidak mempertahankan izin NTFS; C — S3 adalah penyimpanan objek, bukan SMB file share; D — Lustre adalah sistem file HPC Linux tanpa dukungan SMB/AD.

**41. Jawaban: D, E** — Transfer Acceleration merutekan unggahan melalui jaringan edge/backbone AWS untuk mempercepat transfer jarak jauh, dan multipart upload memparalelkan transfer dan memungkinkan part yang gagal dicoba ulang tanpa memulai ulang seluruh file 40 GB. *Mengapa bukan yang lain:* A — One Zone-IA mengubah redundansi, bukan performa unggahan; B — Anda tidak dapat menempatkan ALB di depan S3 untuk unggahan; C — CRR mereplikasi setelah unggahan dan tidak membantu ingest.

**42. Jawaban: B** — Instance store NVMe SSD terpasang secara fisik ke host, menawarkan latensi terendah untuk data ephemeral yang dapat diregenerasi. *Mengapa bukan yang lain:* A dan D — EBS melintasi jaringan dan menambah latensi; C — EFS adalah sistem file jaringan dengan latensi lebih tinggi daripada keduanya.

**43. Jawaban: B** — Throttling pada hot partition dengan utilisasi keseluruhan rendah adalah masalah klasik partition key berkardinalitas rendah; key berkardinalitas tinggi (mis. game_id#player_id) mendistribusikan lalu lintas secara merata. *Mengapa bukan yang lain:* A — perubahan mode kapasitas tidak memperbaiki hot partition; C — LSI berbagi partition key yang sama dan hot partition yang sama; D — Streams menangkap perubahan, tidak mendistribusikan ulang penulisan.

**44. Jawaban: B** — DAX adalah cache dalam memori yang kompatibel dengan DynamoDB dan transparan terhadap API, memberikan pembacaan mikrodetik dengan perubahan kode minimal. *Mengapa bukan yang lain:* A — ElastiCache memerlukan penulisan ulang aplikasi untuk mengelola cache; C — GSI tidak menyimpan cache item panas atau memberikan latensi mikrodetik; D — Global Tables menangani akses multi-region, bukan latensi baca single-item.

**45. Jawaban: B** — GSI dapat ditambahkan ke tabel yang sudah ada kapan saja, mendukung kombinasi partition/sort key baru, dan memiliki throughput-nya sendiri yang disediakan, terisolasi dari tabel dasar. *Mengapa bukan yang lain:* A — LSI hanya dapat dibuat saat pembuatan tabel, berbagi partition key tabel, dan berbagi throughput tabel; C — membuat ulang tabel mengganggu dan tidak perlu; D — Streams untuk change capture, bukan kueri ad hoc.

**46. Jawaban: B** — DynamoDB TTL menghapus item yang kedaluwarsa secara otomatis di latar belakang tanpa biaya tambahan. *Mengapa bukan yang lain:* A — pemindaian terjadwal mengonsumsi kapasitas baca/tulis dan menelan biaya; C — lifecycle policy adalah konsep S3/EFS, bukan DynamoDB; D — Streams memfilter peristiwa di hilir tetapi tidak menghapus item dari tabel.

**47. Jawaban: B** — RDS Proxy mengumpulkan dan memultipleks koneksi, memungkinkan ribuan pemanggilan Lambda berbagi sekumpulan kecil koneksi database hanya dengan perubahan connection-string. *Mengapa bukan yang lain:* A — memperbesar mahal dan hanya menunda batas; C — migrasi database adalah perubahan aplikasi besar; D — membatasi Lambda ke 10 melumpuhkan throughput alih-alih menyelesaikan manajemen koneksi.

**48. Jawaban: A** — Aurora Replica (hingga 15) di belakang reader endpoint dengan auto scaling replica meringankan lalu lintas baca dengan kerja operasional minimal. *Mengapa bukan yang lain:* B — Aurora tidak menggunakan model standby pasif; standby dalam istilah RDS klasik tidak melayani lalu lintas; C — sharding adalah overhead operasional tinggi untuk masalah penskalaan baca; D — Backtrack memutar mundur database dalam waktu, tidak melayani pembacaan.

**49. Jawaban: B** — Global Accelerator menyediakan dua IP anycast statis, mendukung UDP, berada di depan NLB di beberapa region, dan melakukan failover dalam hitungan detik melalui backbone AWS. *Mengapa bukan yang lain:* A — CloudFront melayani konten HTTP/HTTPS, bukan UDP sembarang, dan tidak memiliki IP statis yang menghadap klien; C — latency routing Route 53 bergantung pada TTL DNS untuk failover dan tidak menyediakan IP statis; D — ALB bersifat regional dan hanya HTTP.

**50. Jawaban: B** — Geolocation routing menjawab kueri DNS berdasarkan negara pengguna, menegakkan Jerman→eu-central-1 dan Prancis→eu-west-3 secara deterministik untuk kepatuhan lisensi. *Mengapa bukan yang lain:* A — latency routing memilih endpoint tercepat, yang dapat melanggar aturan lisensi; C — bias geoproximity menggeser batas berdasarkan jarak tetapi tidak menjamin pemetaan negara yang ketat; D — weighted routing mendistribusikan secara acak berdasarkan bobot, mengabaikan lokasi.

**51. Jawaban: C** — Cluster placement group mengemas instance berdekatan di satu AZ untuk latensi terendah dan packets-per-second tertinggi, ideal untuk beban kerja MPI yang sangat terikat. *Mengapa bukan yang lain:* A — spread group memisahkan instance ke perangkat keras berbeda, meningkatkan latensi, dan dibatasi 7 per AZ; B — partition group mengisolasi domain kegagalan untuk sistem data terdistribusi, bukan MPI latensi rendah; D — subnet terpisah tidak melakukan apa pun untuk menempatkan instance secara bersamaan.

**52. Jawaban: B** — Amazon Data Firehose dikelola sepenuhnya, tidak memerlukan konsumer atau pengelolaan shard, menyangga record, dan dapat mengonversi JSON ke Parquet sebelum mengirim ke S3. *Mengapa bukan yang lain:* A — Kinesis Data Streams memerlukan penulisan/pengelolaan konsumer; C — SQS plus poller EC2 adalah infrastruktur kustom untuk dibangun dan dijalankan; D — MSK memerlukan pengelolaan cluster Kafka dan konektor.

**53. Jawaban: B** — Glue crawler menyimpulkan skema ke dalam Data Catalog dan Athena menjalankan SQL serverless langsung terhadap file S3. *Mengapa bukan yang lain:* A — Redshift memerlukan penyediaan cluster dan pemuatan data; C — EMR berarti mengelola cluster yang berjalan lama; D — RDS akan memerlukan pemuatan data ke server database.

### Bagian 4 — Soal 54–65

**54. Jawaban: C** — Job batch yang ber-checkpoint dan dapat dimulai ulang adalah beban kerja Spot yang ideal, dan Spot Fleet yang didiversifikasi di seluruh jenis instance/AZ meminimalkan dampak interupsi dengan penghematan hingga ~90%. *Mengapa bukan yang lain:* A — On-Demand melepaskan diskon tanpa manfaat di sini; B dan D — komitmen memberikan diskon lebih kecil daripada Spot dan mengunci pengeluaran untuk job yang ramah interupsi.

**55. Jawaban: C** — Compute Savings Plans berlaku otomatis di seluruh EC2 (keluarga/region apa pun), Fargate, dan Lambda, sesuai dengan jalur modernisasi. *Mengapa bukan yang lain:* A — EC2 Instance Savings Plans terkunci pada keluarga instance di sebuah region dan mengecualikan Fargate/Lambda; B dan D — Reserved Instances hanya mencakup EC2 dan tidak berlaku untuk Fargate atau Lambda.

**56. Jawaban: B** — Hanya EC2 Standard Reserved Instances yang dapat didaftarkan di Reserved Instance Marketplace; RI RDS (dan layanan lain) tidak dapat dijual kembali. *Mengapa bukan yang lain:* A dan C — RI RDS tidak memenuhi syarat marketplace; D — EC2 Standard RI sebenarnya dapat dijual di marketplace.

**57. Jawaban: B** — AWS memberikan pemberitahuan interupsi Spot dua menit sebelum mengambil kembali instance, memberi waktu untuk drain dan checkpoint. *Mengapa bukan yang lain:* A — peringatan diberikan; C dan D — 15 menit dan 24 jam bukan jendela interupsi Spot (rekomendasi rebalance dapat datang lebih awal tetapi bukan jendela tetap yang dijamin).

**58. Jawaban: B** — Glacier Flexible Retrieval menawarkan biaya penyimpanan arsip rendah dan Expedited retrieval yang mengembalikan data dalam 1–5 menit (sekitar $0,03/GB), memenuhi persyaratan 5 menit. *Mengapa bukan yang lain:* A — pengambilan tercepat Deep Archive ~12 jam; C — Bulk retrieval memakan 5–12 jam; D — Standard-IA mengambil secara instan tetapi jauh lebih mahal untuk penyimpanan 7 tahun yang jarang diakses.

**59. Jawaban: B** — One Zone-IA berbiaya ~20% lebih rendah daripada Standard-IA dan trade-off durabilitas single-AZ dapat diterima untuk thumbnail yang dapat direproduksi. *Mengapa bukan yang lain:* A — Standard-IA berbiaya lebih untuk redundansi yang tidak dibutuhkan data; C — Intelligent-Tiering menambah biaya pemantauan dan tidak meminimalkan biaya untuk akses yang diketahui-jarang; D — Glacier Instant Retrieval memiliki minimum 90 hari dan profil biaya pengambilan yang berbeda untuk pola ini.

**60. Jawaban: A, C** — Intelligent-Tiering mengenakan biaya pemantauan/otomasi kecil per-objek, dan objek di bawah 128 KB disimpan tetapi tidak dipantau atau di-tier (ditagih dengan tarif Frequent Access). *Mengapa bukan yang lain:* B — Intelligent-Tiering tidak memiliki biaya pengambilan antar tier otomatisnya; D — ia tidak pernah mereplikasi lintas region; E — tidak ada minimum 90 hari untuk setiap objek di kelas ini.

**61. Jawaban: B** — Part multipart upload yang tidak lengkap ditagih sebagai penyimpanan tetapi tidak terlihat sebagai objek; lifecycle rule dengan AbortIncompleteMultipartUpload menghapusnya secara otomatis. *Mengapa bukan yang lain:* A — versioning akan meningkatkan penyimpanan, bukan membersihkan part; C — mengubah storage class tidak menghapus part yatim; D — Transfer Acceleration mempercepat transfer tetapi tidak membersihkan unggahan yang sudah ditinggalkan.

**62. Jawaban: B** — gp3 memisahkan IOPS/throughput dari ukuran dan berbiaya ~20% lebih rendah per GB daripada gp2, sehingga kapasitas dapat disesuaikan ukurannya sambil mempertahankan IOPS yang dibutuhkan; migrasinya adalah operasi ModifyVolume online. *Mengapa bukan yang lain:* A — io2 lebih mahal, bukan lebih murah; C — st1 tidak dapat memberikan IOPS yang diperlukan; D — menghapus volume menghancurkan data langsung.

**63. Jawaban: B** — Gateway VPC endpoint untuk S3 gratis dan menghilangkan biaya pemrosesan data NAT gateway untuk lalu lintas S3 region yang sama. *Mengapa bukan yang lain:* A — NAT instance masih menimbulkan biaya EC2 dan operasional; C — interface endpoint ditagih per-jam dan per-GB, berbiaya lebih dari gateway endpoint yang gratis; D — subnet publik menambah biaya IPv4 publik dan melemahkan keamanan.

**64. Jawaban: B, E** — AWS mengenakan biaya untuk setiap alamat IPv4 publik yang digunakan, jadi menghapus yang tidak diperlukan memangkas biaya, dan AWS Budgets menyediakan peringatan ambang batas proaktif pada pengeluaran perkiraan/aktual. *Mengapa bukan yang lain:* A — Elastic IP juga ditagih di bawah biaya IPv4 publik bahkan saat terpasang; C — Compute Optimizer merekomendasikan right-sizing tetapi tidak dapat memblokir atau memberi peringatan pada ambang pengeluaran; D — Shield Advanced adalah layanan DDoS yang menambah biaya.

**65. Jawaban: A** — Aurora Serverless v2 mendukung penskalaan ke 0 ACU (auto-pause, tersedia sejak akhir 2024) dan secara otomatis melanjutkan saat ada koneksi, menghilangkan biaya komputasi saat idle tanpa langkah manual. Nuansa yang perlu diketahui: auto-pause memerlukan versi engine terbaru (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); koneksi pertama setelah jeda memakan ~15 detik untuk melanjutkan (lebih lama setelah dijeda 24+ jam); penyimpanan tetap ditagih saat komputasi dijeda; dan apa pun yang menahan koneksi tetap terbuka — RDS Proxy, health check keep-alive — mencegah jeda sepenuhnya. *Mengapa bukan yang lain:* B — cluster provisioned yang dihentikan tidak bangun otomatis saat developer terhubung (dan memulai ulang setelah 7 hari); C — sekunder global database headless menangani DR, bukan biaya idle; D — reader yang diciutkan tetap meninggalkan instance writer berjalan dan ditagih.

---

## Panduan Penilaian

| Skor | Pembacaan hasil |
|---|---|
| 55–65 | Siap ujian. Pesan ujian. Tinjau hanya soal yang Anda jawab salah. |
| 47–54 | Dalam rentang kelulusan, tetapi marginnya tipis. Baca ulang bab di balik setiap kesalahan (gunakan tag domain), ulangi dalam satu minggu. |
| 38–46 | Fondasi sudah ada; celah masih tersisa. Kerjakan peta domain Lampiran B untuk domain lemah Anda sebelum mengulang. |
| Di bawah 38 | Baca ulang bab untuk dua domain terlemah Anda dari awal sampai akhir, kerjakan ulang latihan babnya, lalu ulangi ujian ini. |

Lacak kesalahan Anda *berdasarkan domain* (setiap soal diberi tag). Skor rendah yang terkonsentrasi di satu domain adalah masalah studi yang terfokus; skor yang sama tersebar merata adalah masalah ritme atau pembacaan soal — perlambat dan garis bawahi apa yang sebenarnya dituntut setiap stem (HA vs DR, biaya vs performa, "PALING hemat biaya" vs "overhead operasional PALING SEDIKIT").
