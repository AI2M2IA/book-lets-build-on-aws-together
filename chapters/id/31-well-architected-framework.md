# Chapter 31: Inspektur Bangunan untuk Arsitektur Cloud

Berdiri. Luruskan badan. Ambil istirahat sungguhan jika Anda membutuhkannya.

Bab ini berbeda dari bab-bab sebelumnya. Kami telah menghabiskan 30 bab membangun pengetahuan tentang layanan dan pola tertentu. Sekarang kita mundur dan melihat gambaran besarnya.

Seperti apa sebenarnya arsitektur cloud yang *baik* itu? Apakah ada cara sistematis untuk mengevaluasi apakah yang Anda bangun benar-benar dirancang dengan baik — atau hanya berfungsi?

Ada. AWS menyebutnya Well-Architected Framework.

**Rekap: Pertanyaan yang Mengikuti Angka-Angka**

Tiga bulan optimasi biaya telah menghasilkan angka yang mengejutkan mereka semua: $35.904 dalam penghematan tahunan, teridentifikasi dan sebagian besar diimplementasikan. EC2 Savings Plans, kebijakan siklus hidup S3, pembersihan penyimpanan, replika database yang tidak terpakai, NAT Gateway endpoints — masing-masing telah menjadi penemuan terpisah, perbaikan terpisah. Tetapi di suatu tempat selama proses itu, Maya telah mulai mengajukan pertanyaan yang berbeda. Bukan "di mana pemborosannya?" tetapi "bagaimana ia menumpuk sejak awal?" Masalah biaya adalah gejala dari sesuatu. Well-Architected Framework adalah kosakata untuk menamai apa sesuatu itu.

Nimbus telah beroperasi selama dua tahun. Tim telah membuat ratusan keputusan arsitektur — beberapa secara sadar, beberapa secara tidak sengaja, beberapa di bawah tekanan. Sistemnya berfungsi. Tetapi Maya punya pertanyaan.

"Apakah arsitektur kita benar-benar *baik*?" tanyanya. "Bukan hanya berfungsi. Baik."

Tidak ada yang segera menjawab.

"Karena saya mendengar tentang Well-Architected Review," lanjutnya. "AWS menawarkannya kepada pelanggan. Beberapa investor kita menyebutkannya. Saya pikir kita harus melakukannya."

"Apa itu?" tanya Leo.

"Kerangka kerja AWS untuk mengevaluasi arsitektur cloud," kata Priya. "Enam pilar. Sekumpulan pertanyaan dan praktik terbaik untuk masing-masing. Anda menilai arsitektur Anda terhadap semuanya dan mengidentifikasi apa yang hilang."

"Ini seperti inspeksi bangunan," kata Tom. "Anda tahu bangunan itu berfungsi. Inspeksi memberi tahu Anda apakah ia sesuai kode dan apa yang mungkin gagal dalam gempa bumi."

**Enam Pilar**

AWS Well-Architected Framework diorganisasikan di sekitar enam pilar. Setiap pilar memiliki sekumpulan prinsip desain, praktik terbaik, dan pertanyaan untuk menilai arsitektur Anda.

**1. Operational Excellence (Keunggulan Operasional)**

*Fokus*: Menjalankan dan memantau sistem untuk memberikan nilai bisnis, dan terus meningkatkan proses dan prosedur.

Area kunci:

- Bagaimana Anda menerapkan perubahan? (CI/CD, infrastruktur sebagai kode, penerapan otomatis)
- Bagaimana Anda memantau sistem dan tahu ketika ada yang salah?
- Bagaimana Anda belajar dari kegagalan? (post-mortem, runbook, budaya tanpa menyalahkan)
- Bagaimana Anda menangani perubahan pada skala besar?

Penilaian Nimbus:

- Ada: Pipeline CI/CD dengan penerapan otomatis
- Ada: CloudWatch alarm dan GuardDuty
- Ada: Uji chaos engineering kuartalan
- Peringatan: Proses post-mortem tidak diformalkan — insiden diselidiki tetapi pembelajaran tidak didokumentasikan secara sistematis

**2. Security (Keamanan)**

*Fokus*: Melindungi informasi, sistem, dan aset melalui penilaian risiko dan strategi mitigasi.

Area kunci:

- Siapa yang bisa mengakses apa, dan dengan hak istimewa terkecil yang mungkin?
- Bagaimana data dienkripsi saat istirahat dan saat transit?
- Bagaimana Anda mendeteksi dan menanggapi ancaman?
- Apakah ada kontrol keamanan otomatis?

Penilaian Nimbus:

- Ada: IAM dengan hak istimewa terkecil (setelah pembersihan di Bab 14)
- Ada: KMS untuk enkripsi data, Secrets Manager untuk kredensial
- Ada: GuardDuty, WAF, Shield Standard
- Ada: VPC dengan subnet privat, security group
- Peringatan: Patching keamanan pada instance EC2 tidak sepenuhnya otomatis (Priya menandainya beberapa bulan lalu, belum terselesaikan)

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya, ketika kesenjangan patching keamanan muncul. "Kita mengotomatiskan penerapan. Kita mengotomatiskan cadangan. Mengapa kita membiarkan patching manual?"

"Karena patching terasa berbeda dari menerapkan kode," kata Priya. "Kita khawatir patching merusak sesuatu. Jadi kita membiarkannya manual untuk mempertahankan kontrol."

"Dan dengan membiarkannya manual, kita membuatnya tidak konsisten," kata Maya. "Yang lebih buruk."

"Ya," kata Priya. "AWS Systems Manager Patch Manager menyelesaikan ini. Kita seharusnya melakukannya enam bulan lalu."

**3. Reliability (Keandalan)**

*Fokus*: Memastikan sistem melakukan fungsi yang dimaksudkan dengan benar dan konsisten, dan mampu pulih dari kegagalan.

Area kunci:

- Bagaimana sistem menangani kegagalan pada tingkat komponen?
- Bagaimana ia pulih dari kegagalan regional?
- Bagaimana permintaan dikelola?
- Bagaimana sistem diuji untuk kegagalan?

Penilaian Nimbus:

- Ada: Multi-AZ untuk semua komponen penting
- Ada: Aurora Serverless dengan failover otomatis
- Ada: Auto Scaling untuk EC2 dan ECS
- Ada: Uji chaos engineering (kuartalan)
- Peringatan: Tidak ada penerapan multi-region (warm standby belum diimplementasikan — direncanakan untuk kuartal berikutnya)

**4. Performance Efficiency (Efisiensi Kinerja)**

*Fokus*: Menggunakan sumber daya IT dan komputasi secara efisien.

Area kunci:

- Apakah jenis instance dan jenis database yang tepat digunakan untuk beban kerja?
- Apakah penskalaan dikonfigurasi dengan benar?
- Apakah data disampaikan ke pengguna dari lokasi optimal?

Penilaian Nimbus:

- Ada: CloudFront untuk pengiriman konten global
- Ada: ElastiCache untuk percepatan baca database
- Ada: Read replica Aurora
- Ada: Lambda untuk beban kerja yang sesuai
- Peringatan: Beberapa instance EC2 tidak pernah di-right-size sejak penerapan awal

**5. Cost Optimization (Optimasi Biaya)**

*Fokus*: Menghindari biaya yang tidak perlu.

Area kunci:

- Apakah sumber daya berukuran sesuai?
- Apakah sumber daya yang tidak terpakai dinonaktifkan?
- Apakah model harga yang sesuai digunakan?
- Apakah anomali pengeluaran terdeteksi?

Penilaian Nimbus:

- Ada: Savings Plans diimplementasikan (Bab 27)
- Ada: Kebijakan siklus hidup S3 (Bab 23)
- Ada: DynamoDB Auto Scaling
- Ada: AWS Budgets dengan peringatan
- Ada: Tinjauan biaya kuartalan

"Berapa biayanya per bulan, persisnya — semua hal yang belum kita right-size?" tanya Tom. "Instance EC2 yang tidak pernah dievaluasi. Yang masih pada ukuran yang kita provision di tahun pertama."

"Saya tidak tahu," kata Leo. "Itulah intinya."

"Itu kesenjangan Performance Efficiency," kata Priya. "Kita mengoptimalkan hal-hal yang kita ketahui. Kita tidak punya angka untuk hal-hal yang belum kita lihat."

**6. Sustainability (Keberlanjutan)**

*Fokus*: Meminimalkan dampak lingkungan dari menjalankan beban kerja cloud.

Area kunci:

- Apakah pemanfaatan dimaksimalkan (menghindari sumber daya idle)?
- Apakah jenis instance dipilih untuk efisiensi energi?
- Apakah data disimpan hanya selama dibutuhkan?

Penilaian Nimbus:

- Ada: Lambda dan Fargate untuk beban kerja serverless/berbasis kontainer (efisiensi sumber daya lebih baik daripada EC2 khusus)
- Ada: Kebijakan siklus hidup S3 (menghapus data ketika tidak lagi dibutuhkan)
- Peringatan: Beberapa instance berbasis Graviton belum diadopsi (AWS Graviton lebih hemat energi dan lebih murah)

**Proses Well-Architected Review**

Tinjauan bukanlah tes yang Anda lulus atau gagal. Ini adalah percakapan terstruktur tentang arsitektur Anda, dipandu oleh 60+ pertanyaan di enam pilar.

Setiap pertanyaan mengidentifikasi praktik terbaik. Jika arsitektur Anda mengikutinya, itu adalah kekuatan. Jika tidak, itu adalah "masalah" — dikategorikan berdasarkan tingkat risiko (tinggi, sedang, rendah).

Hasilnya: daftar rekomendasi perbaikan yang diprioritaskan. Tidak semuanya perlu diperbaiki segera. Kerangka kerja membantu Anda memahami trade-off dari setiap kesenjangan dan memutuskan apa yang ditangani lebih dulu.

Well-Architected Tool AWS (tersedia di konsol AWS, gratis) menyediakan kerangka pertanyaan dan menghasilkan laporan dengan rekomendasi.

Untuk Nimbus, Maya menjadwalkan sesi tinjauan setengah hari yang mencakup keenam pilar — dan memutuskan untuk tidak menjalankannya sendiri. Sesi itu sendiri, dan daftar temuan yang dihasilkannya, adalah arah bab ini.

**Lensa: Mengkhususkan Tinjauan**

Well-Architected Framework inti bersifat agnostik teknologi. AWS juga menerbitkan **Lensa** — ekstensi dari kerangka kerja untuk kasus penggunaan atau industri tertentu:

- **Serverless Lens**: Pertanyaan tambahan untuk arsitektur berbasis Lambda
- **SaaS Lens**: Untuk aplikasi SaaS multi-tenant
- **Machine Learning Lens**: Untuk beban kerja pelatihan dan inferensi ML
- **Financial Services Lens**: Pertanyaan regulasi dan kepatuhan untuk FinTech
- **Healthcare Lens**: Pertimbangan HIPAA

Anda mungkin bertanya-tanya: apakah Anda perlu menjalankan Well-Architected review penuh terhadap keenam pilar sebelum Anda meluncurkan? Tidak. Nilainya ada pada pertanyaan, bukan skornya. Jika Anda pra-peluncuran, pilih dua pilar yang paling relevan dengan situasi Anda — Security dan Reliability hampir selalu titik awal yang tepat — dan kerjakan hanya pertanyaan-pertanyaan itu. Tinjauan parsial yang benar-benar dilakukan lebih berharga daripada tinjauan lengkap yang ditunda sampai arsitektur "siap."

Untuk Nimbus, SaaS Lens relevan. Ia menambahkan pertanyaan tentang isolasi tenant, otomatisasi onboarding, dan alokasi biaya per tenant — semua area yang sedang dikembangkan Nimbus secara aktif.

**Sesi Well-Architected Review: Carlos Memfasilitasi**

Maya telah mengundang Carlos — seorang arsitek senior yang dia temui di acara komunitas AWS, yang memfasilitasi Well-Architected review untuk tim seperti mereka — untuk menjalankan sesi. Dia tiba dengan Well-Architected Tool terbuka di laptopnya dan satu buku catatan. Tanpa agenda. Hanya pertanyaan.

"Saya akan bertanya, Anda jawab dengan jujur," katanya. "Jika jawaban jujurnya adalah 'kami tidak tahu,' katakan itu. Itu sebuah temuan."

Dia memulai dengan Operational Excellence.

"Apakah Anda punya runbook untuk lima insiden teratas Anda?"

Tom melihat Leo. Leo melihat langit-langit.

"Kami punya runbook untuk dua insiden," kata Priya. "Pelanggaran batas koneksi database dan timeout origin CloudFront. Tiga lainnya — kegagalan instance EC2 saat puncak, throttling DynamoDB, dan kegagalan webhook Stripe — kami tangani secara ad hoc."

Carlos menulis: *OPS-1: Runbook untuk 5 insiden teratas. Saat ini: 2/5. Kesenjangan: 3.*

"Kapan terakhir kali Anda menjalankan runbook yang ada dalam sebuah latihan?"

Hening.

"Belum pernah," kata Priya. "Kami menulisnya setelah insiden. Kami tidak pernah menguji apakah mereka masih akurat."

*OPS-2: Validasi runbook. Tes terakhir: tidak pernah.*

Carlos melanjutkan. Security.

"Siapa yang punya akses akun root saat ini?"

"Root?" kata Leo. "Hanya Maya. Dan saya pikir Tom masih punya kredensial root dari saat kita menyiapkan akun — tapi kita merotasinya setelah Bab 14." Dia berhenti. "Tom, apakah kita merotasi root setelah pembersihan IAM?"

Tom membuka entri 1Password. "Kita mengubah kata sandi dan menambahkan MFA. Tetapi kredensial root masih di vault 1Password bersama. Tiga orang punya akses ke vault itu: saya, Maya, dan Leo."

"Jadi tiga orang punya akses root," kata Carlos. "Panduan AWS adalah bahwa root hanya boleh digunakan untuk daftar tugas terdokumentasi yang singkat — sekitar sepuluh operasi tingkat-akun, semuanya jarang dan sebagian besar hanya darurat. Setelah operasi itu, sesi root harus diakhiri. Apakah akses root dicatat secara terpisah?"

"CloudTrail mencatatnya," kata Priya.

"Apakah ada peringatan ketika root digunakan?"

Jeda lagi.

"Tidak," kata Tom.

Carlos menulis: *SEC-1: Kontrol akses akun root. Saat ini: 3 pengguna di vault bersama, tanpa peringatan penggunaan. Kesenjangan: Penggunaan root harus memicu peringatan SNS segera. Target: 0 sesi root non-darurat.*

"Berikutnya: siapa yang meninjau perubahan izin IAM? Apakah ada proses peer review untuk role IAM baru atau perluasan kebijakan?"

"Priya meninjaunya," kata Leo. "Dia peninjau keamanan de facto."

"Apa yang terjadi ketika Priya sedang liburan?"

Tidak ada yang menjawab.

"Itu kesenjangan proses," kata Carlos, tanpa menghakimi. "Bukan kesenjangan dalam kemampuan Priya — kesenjangan dalam desain proses. Tinjauan keamanan yang bergantung pada ketersediaan satu orang adalah titik kegagalan tunggal dalam postur keamanan Anda."

*SEC-2: Proses tinjauan IAM. Saat ini: peninjau tunggal, tanpa cadangan. Kesenjangan: Tetapkan peninjau cadangan dan dokumentasikan kriteria tinjauan.*

Carlos beralih ke Reliability.

"Apakah Anda telah menguji failover Aurora Multi-AZ di bawah beban?"

"Kami mengujinya saat idle," kata Tom. "Kami menjalankan perintah failover ketika sistem sepi dan mengonfirmasi replika dipromosikan dalam 45 detik."

"Berapa bebannya saat itu?"

"Mungkin 5% dari puncak."

"Apa yang terjadi pada connection pool selama failover pada 80% beban puncak?"

Tom memikirkannya. "Endpoint DNS diperbarui. Aplikasi yang menggunakan endpoint writer akan melihat error koneksi selama jendela pengalihan — biasanya 20-45 detik. Pada beban 5%, kami punya sepuluh koneksi aktif. Pada puncak, kami akan punya 300. Dengan RDS Proxy di depan, proxy menangani penyambungan ulang."

"Apakah RDS Proxy benar-benar menyambung ulang secara transparan selama failover Multi-AZ?"

Tom melihat Priya. "Saya yakin begitu. Tetapi saya belum mengujinya."

"Itu jawaban yang berbeda dari 'ya,'" kata Carlos. "Asumsi yang tidak diuji dalam desain ketersediaan tinggi Anda adalah sebuah temuan."

*REL-1: Failover Aurora Multi-AZ di bawah beban. Diuji: hanya idle. Kesenjangan: Uji pada 70% beban puncak dengan RDS Proxy terpasang. Validasi perilaku connection pool selama jendela failover.*

"Sudahkah Anda memikirkan apa yang terjadi jika failover butuh 90 detik alih-alih 45?" tanya Priya, menyapa Tom alih-alih Carlos. Dia sudah melakukan pekerjaannya.

"Pada 90 detik, kita akan punya timeout aplikasi untuk permintaan apa pun yang tidak bisa dicoba ulang," kata Tom. "Alur penempatan pesanan punya logika retry. Alur konfirmasi — kurang begitu. Failover 90 detik selama jam makan malam berarti sebagian konfirmasi gagal, restoran tidak mendapat pesanan, pelanggan mendapat pengembalian dana."

"Itu blast radius-nya," kata Carlos. "Bagus. Sekarang Anda tahu apa yang Anda lindungi dan bagaimana mengukurnya. Tes harus memvalidasi baik durasi failover maupun perilaku aplikasi selama jendela pengalihan."

Dia beralih ke Performance Efficiency.

"Apakah Anda me-right-size instance EC2 Anda?"

"Kami me-right-size selama tinjauan biaya," kata Tom. "Savings Plans dikomitmenkan ke jenis instance saat ini."

"Kapan terakhir kali Anda melihat rekomendasi Compute Optimizer?"

Tom membukanya. AWS Compute Optimizer telah menandai tiga instance sebagai berpotensi over-provisioned: dua pemroses latar belakang c6g.medium dan satu server VPN t3.medium. Rekomendasi server VPN adalah menurunkan ukuran ke t3.small. Pemroses ditandai sebagai "over-provisioned" dengan keyakinan 82%.

"Kami belum melihat ini sejak kami menyiapkannya," Tom mengakui.

"Compute Optimizer telah menghasilkan rekomendasi selama berapa lama?"

Tom memeriksa. "Enam minggu."

Carlos menulis: *PERF-1: Right-sizing EC2 via Compute Optimizer. Saat ini: rekomendasi tersedia, tidak ditinjau. Kesenjangan: Tinjauan bulanan output Compute Optimizer; terapkan rekomendasi setelah validasi staging.*

"Satu lagi," kata Carlos. "Yang ini lintas semua pilar." Dia menulis di papan tulis:

*Bebas-insiden tidak sama dengan dirancang-baik.*

Dia membiarkannya di sana sejenak.

"Sistem Anda telah berjalan selama dua tahun tanpa pemadaman besar yang menghadap pelanggan," katanya. "Itu benar-benar baik. Tetapi saya ingin Anda memperhatikan apa yang dikatakannya kepada Anda — dan apa yang tidak."

"Itu memberi tahu kita bahwa kita beruntung?" Leo menawarkan.

"Itu memberi tahu Anda bahwa mode kegagalan yang telah Anda temui berada dalam kemampuan Anda untuk menangani, mengingat arsitektur yang Anda miliki hari ini. Itu tidak memberi tahu Anda bahwa arsitekturnya kokoh. Sistem yang belum gagal tidak terbukti tangguh. Ia terbukti belum menemui kondisi spesifik yang akan mengekspos kelemahannya."

"Jadi tidak gagal tidak berarti tidak rentan," kata Maya.

"Benar. Well-Architected review tidak mencari bukti kegagalan masa lalu. Ia mencari paparan masa depan. Failover yang tidak diuji. Runbook yang tidak ada. Role IAM yang terlalu luas. Tidak satu pun dari ini yang telah menyebabkan insiden. Semuanya bisa."

"Itulah mengapa kesenjangan patching penting," kata Priya. "Kita belum dibobol melalui instance EC2 yang tidak di-patch. Itu tidak berarti kita tidak akan."

"Tepat," kata Carlos. "Ketiadaan bahaya bukan bukti keamanan. Keberadaan kerentanan yang tidak ditangani adalah bukti risiko — terlepas dari apakah risiko itu telah terwujud."

Dia menutup spidolnya.

"Itulah perbedaan antara sistem yang dirancang-baik dan yang beruntung."


**Temuan IAM Over-Permission**

Carlos menandai temuan kedua selama tinjauan pilar keamanan yang memerlukan pandangan lebih dalam.

"Fungsi Lambda Anda yang menangani notifikasi pesanan — izin IAM apa yang dimilikinya?"

Leo membuka execution role-nya. Butuh tiga puluh detik lebih lama dari seharusnya untuk menemukannya — role telah dibuat di awal kehidupan Nimbus dan dinamai secara generik.

"S3 full access," katanya, ketika menemukannya.

Carlos menunggu.

"Bucket mana?" tanyanya.

"Semua bucket," kata Leo. Dia membaca kebijakannya. "`arn:aws:s3:::*`. Kita memberinya S3 full access."

"Apa yang sebenarnya dilakukan fungsi itu dengan S3?"

"Ia membaca konfigurasi restoran dari satu bucket," kata Leo. "Bucket `nimbus-restaurant-config`. Khususnya objek `restaurants/{restaurant_id}/config.json`. Ia membacanya. Itu saja."

"Jadi fungsi itu butuh `s3:GetObject` pada `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json`," kata Carlos. "Yang ia miliki adalah izin S3 penuh pada setiap bucket di akun."

"Termasuk," kata Priya, "bucket snapshot Aurora. Bucket log CloudTrail. Bucket riwayat pesanan pelanggan."

"Jika fungsi Lambda ini dikompromikan," kata Carlos, "penyerang punya akses penuh ke setiap bucket S3 di akun. Mereka bisa membaca, menulis, atau menghapus data apa pun."

"Saya sudah men-deploy-nya — oh," kata Leo. Dia membaca kebijakannya. "Saya menulis ini dua tahun lalu. Saya terburu-buru membuat sistem notifikasi berfungsi. Saya memberinya akses luas karena saya belum yakin apa yang dibutuhkannya. Dan saya tidak pernah kembali untuk mempersempitnya."

"Itu sumber over-permission paling umum dalam sistem produksi," kata Carlos, tanpa tuduhan. "Bukan kelalaian yang disengaja — jalan pintas yang diambil di bawah tekanan waktu, yang tidak pernah ditinjau kembali."

Tom sudah melihat daftar lengkap execution role Lambda.

"Berapa banyak fungsi Lambda kita yang punya izin terlalu luas?" tanya Maya.

Jawabannya, setelah dua puluh menit tinjauan: 7 dari 23 fungsi Lambda punya izin lebih luas daripada yang dibutuhkan tujuan terdokumentasinya. Yang paling mengkhawatirkan: Lambda konfirmasi pembayaran punya `dynamodb:*` pada semua tabel. Ia hanya butuh `dynamodb:GetItem` dan `dynamodb:PutItem` pada tabel orders.

"Tiga jam kerja untuk memperbaiki ketujuhnya," perkiraan Priya. "Tulis kebijakan hak istimewa terkecil, lampirkan, hapus yang luas."

"Apakah ini temuan berisiko tertinggi sejauh ini?" tanya Maya kepada Carlos.

"Seri dengan kesenjangan runbook," katanya. "Masalah IAM adalah masalah blast-radius — jika salah satu fungsi ini dikompromikan, akses penyerang jauh lebih besar daripada seharusnya. Masalah runbook adalah masalah waktu-pemulihan — ketika sesuatu salah, Anda berimprovisasi alih-alih mengikuti prosedur yang teruji. Keduanya benar-benar berisiko tinggi."

Maya menandai keduanya sebagai P1 dalam dokumen pelacakan.

"Dan bagaimana jika seseorang mencoba membobol?" kata Priya. "Kita telah mengkhawatirkan penyerang eksternal. Tetapi Lambda yang over-permissioned berarti kegagalan internal — kesalahan konfigurasi, kerentanan dependensi, serangan rantai pasok — bisa punya blast radius yang sama."

"Defense in depth mengasumsikan setiap lapisan punya akses minimum yang diperlukan," kata Carlos. "Ketika satu lapisan punya lebih banyak akses dari yang dibutuhkan, defense in depth berhenti bekerja sebagaimana dirancang. Anda mendapat satu lapisan yang dikompromikan, tetapi ia punya kunci ke tiga lapisan lain."

Priya menandai temuan IAM over-permission sebagai P1, kolom satu, dengan tenggat waktu satu minggu.


**Memeringkat Temuan: P1, P2, P3**

Di akhir sesi, tim punya 14 temuan di papan. Carlos meminta mereka melakukan triase sebelum pergi.

"Setiap temuan dalam daftar ini butuh prioritas," katanya. "Tidak semuanya sama pentingnya. Prioritaskan berdasarkan: apa blast radius-nya jika ini gagal? Seberapa mungkin ia gagal? Seberapa sulit memperbaikinya?"

14 temuan:

1. Tidak ada runbook untuk 3 dari 5 insiden teratas (OPS)
2. Runbook tidak pernah diuji (OPS)
3. Tidak ada proses respons insiden formal di luar runbook (OPS)
4. Akses root di vault bersama, tanpa peringatan penggunaan (SEC)
5. Proses tinjauan IAM tidak punya peninjau cadangan (SEC)
6. 7 fungsi Lambda over-permissioned (SEC) ← Lambda notifikasi Leo
7. Beberapa aturan security group lebih luas dari yang diperlukan (SEC)
8. Failover Aurora tidak diuji di bawah beban (REL)
9. Rencana DR multi-region tidak diimplementasikan (REL)
10. Patching keamanan tidak diotomatiskan (SEC)
11. Right-sizing EC2 tidak ditinjau sejak peluncuran (PERF)
12. Instance Graviton tidak diadopsi (SUST)
13. TTL cache CloudFront tidak disetel (PERF)
14. 40% infrastruktur tidak dalam IaC (OPS)

"Mulai dengan yang jelas," kata Carlos. "Tiga mana yang akan Anda perbaiki dulu jika Anda hanya punya seminggu?"

Maya langsung menjawab: "Peringatan akses root. Over-permission Lambda. Otomatisasi patching keamanan."

"Mengapa?" tanya Carlos.

"Karena ketiganya adalah kesenjangan keamanan dengan blast radius yang jelas. Yang lain adalah peningkatan keandalan dan operasional — penting, tetapi kita telah hidup dengannya dan mereka belum menyebabkan insiden. Kesenjangan keamanan diam-diam menumpuk setiap hari kita tidak memperbaikinya."

Tom tidak setuju, sedikit. "Over-permission Lambda mendesak. Tetapi saya akan menukar patching keamanan dengan tes failover Aurora. Kita tidak pernah mengonfirmasi pengaturan Multi-AZ kita berfungsi dengan benar di bawah beban. Jika ia gagal selama jam makan malam Jumat dan kita tidak punya runbook teruji untuknya, kita dalam masalah."

"Keduanya bisa P1," kata Priya. "Kita punya seminggu. Lima hari kerja. Izin Lambda adalah perbaikan dua jam per fungsi. Peringatan akses root adalah aturan CloudWatch event tiga puluh menit. Otomatisasi patching keamanan adalah dua hari pengaturan dan pengujian Systems Manager. Tes failover Aurora adalah setengah hari yang dijadwalkan pada Selasa pukul 2 pagi."

Carlos mengangguk. "Itu cara yang benar untuk triase. Bukan hanya 'apa yang paling penting' tetapi 'apa yang bisa kita benar-benar lakukan minggu ini, dan dalam urutan apa?'"

Triase akhir:

**P1 (minggu ini)**:
- Perbaikan hak istimewa terkecil execution role Lambda (7 fungsi)
- Peringatan CloudWatch akun root
- Tes failover Aurora Multi-AZ di bawah beban (jadwalkan untuk Selasa berikutnya, pukul 2 pagi)

**P2 (bulan ini)**:
- Otomatisasi patching keamanan via Systems Manager
- Runbook yang hilang untuk 3 insiden teratas
- Proses respons insiden formal terdokumentasi
- Migrasi 40% IaC — identifikasi sumber daya mana, bangun rencana migrasi

**P3 (kuartal ini)**:
- Latihan validasi runbook
- Peninjau cadangan proses tinjauan IAM terdokumentasi
- Aturan security group yang terlalu luas diperketat
- Tinjauan right-sizing EC2 via Compute Optimizer
- Rencana adopsi Graviton
- Penyetelan TTL CloudFront

"Itu empat belas temuan dengan pemilik, tenggat waktu, dan prioritas," kata Maya. "Kita belum pernah seterorganisir ini tentang utang teknis."

"Itulah gunanya tinjauan," kata Carlos. "Bukan untuk membuat Anda merasa buruk tentang kesenjangannya. Untuk memberi Anda kosakata dan daftar yang benar-benar bisa Anda eksekusi."


**Perbedaan Antara Dirancang-Baik dan Sekadar Berfungsi**

"Sistem kita berfungsi," kata Leo setelah tinjauan. "Tapi saya tidak menyadari berapa banyak hal yang telah kita lakukan 'cukup baik' lalu melanjutkan."

"Sudahkah kita memikirkan apa yang terjadi jika kita terus membiarkan kesenjangan ini?" tanya Priya. "Masalah patching telah terbuka selama berbulan-bulan. Proses respons insiden tidak ada. Ini bukan hal-hal kecil — ini hal-hal yang menentukan apakah pemadaman malam Jumat adalah perbaikan 20 menit atau bencana empat jam."

"Itulah mengapa kita melakukan tinjauan," kata Maya.

"Itu normal," kata Priya. "Membangun di bawah tekanan waktu berarti Anda membuat pilihan pragmatis. Well-Architected review adalah waktu terjadwal untuk meninjaunya kembali."

"Beberapa kesenjangan ini tampak jelas dalam retrospektif," lanjutnya. "Patching keamanan — saya tahu kita belum mengotomatiskannya. Saya hanya tidak pernah memprioritaskan memperbaikinya."

"Karena 'ia berfungsi' dan 'ia well-architected' terasa sama dari hari ke hari," kata Maya. "Perbedaannya hanya terlihat ketika sesuatu salah."

Ini adalah salah satu hal terpenting yang dipahami insinyur senior: ketiadaan insiden tidak berarti ketiadaan risiko. Itu berarti risiko belum terpicu.

**Infrastructure as Code: Pengaktif Keunggulan Operasional**

Satu tema di seluruh banyak pilar: **Infrastructure as Code (IaC)**.

Jika infrastruktur Anda dikonfigurasi secara manual melalui konsol, maka:

- Membuatnya ulang dalam skenario DR lambat dan rawan kesalahan
- Mengaudit perubahan tidak mungkin (siapa mengubah apa, dan kapan?)
- Mengembalikan perubahan buruk memerlukan pembalikan manual
- Konsistensi antar lingkungan (dev/staging/production) memerlukan disiplin

**AWS CloudFormation** memungkinkan Anda mendefinisikan infrastruktur dalam templat YAML/JSON. **AWS CDK (Cloud Development Kit)** memungkinkan Anda mendefinisikan infrastruktur menggunakan bahasa pemrograman (Python, TypeScript, Java). **Terraform** adalah alternatif pihak ketiga yang populer.

Nimbus telah secara bertahap beralih ke IaC menggunakan Terraform. Pada saat Well-Architected review, sekitar 60% infrastruktur mereka didefinisikan dalam kode. Tinjauan merekomendasikan mencapai 100%.

"Mengapa 40% sisanya?" tanya Leo.

"40% sisanya adalah tempat infrastruktur kritis kita berada," kata Priya. "Jika kita tidak bisa membuatnya ulang dari kode, kita tidak bisa pulih dari bencana regional dengan andal."

Leo melihat daftarnya. "40% sisanya — ya. Akan baik-baik saja, kita akan memigrasikannya sprint berikutnya."

Priya menahan pandangannya pada layar. "Itu infrastruktur kritis. Konfigurasi failover multi-region. Hierarki role IAM. Hal-hal yang, jika kita harus membangun ulang dari awal pada pukul 3 pagi, kita perlu tahu sudah benar-benar tepat."

Leo mempertimbangkannya sejenak.

"...Kau benar," katanya pelan. "Kita sudah punya konfigurasi manual yang melayang dari apa yang ditulis siapa pun. Jika kita harus membangun ulang dari awal, kita akan menebak-nebak."

"Itulah mengapa tinjauan menemukannya," kata Maya. "Bukan untuk menyalahkan. Untuk memperbaikinya sebelum ia penting."

**CloudFormation Secara Mendalam: Alat IaC Native AWS**

Meskipun Nimbus telah mengadopsi Terraform, Well-Architected review juga mengungkap bahwa tim tidak pernah sepenuhnya memahami AWS CloudFormation — layanan IaC native AWS yang mendasari layanan seperti CDK, SAM (serverless application model), dan Service Catalog. Ujian menguji CloudFormation secara spesifik, dan beberapa layanan AWS memerlukan pemahaman tentangnya.

Masalah yang telah dinamai Carlos sebelumnya dalam sesi itu konkret: Leo telah secara manual mengklik melalui konsol untuk membuat lingkungan. Butuh 45 menit setiap kali, dan perbedaan apa pun antara staging dan produksi tidak terlihat sampai sesuatu rusak. Tiga dari lima insiden produksi tahun lalu disebabkan oleh konfigurasi di produksi yang tidak cocok dengan staging — aturan security group berbeda, variabel lingkungan berbeda, jenis instance berbeda.

"Konsol adalah pintu satu arah," kata Carlos. "Anda bisa masuk dan mengubah hal-hal, tetapi Anda tidak bisa dengan mudah berjalan keluar dan melihat persis apa yang diubah, atau mereproduksi keadaan kemarin."

CloudFormation adalah jawaban untuk itu. Berikut cara kerjanya:

**Template**: Berkas YAML atau JSON yang mendeklarasikan infrastruktur AWS yang Anda inginkan. Bukan instruksi tentang cara membuatnya — deklarasi tentang seperti apa seharusnya. "Saya ingin VPC dengan rentang CIDR ini, dua subnet publik, dua subnet privat, Internet Gateway, dan route table ini." CloudFormation membaca templat dan menentukan cara membuat infrastruktur nyata cocok dengan deklarasi.

Bayangkan template sebagai resep untuk sebuah lingkungan. Resepnya tidak berubah. Setiap lingkungan yang dibuat darinya identik. Staging dan produksi menggunakan templat yang sama, dengan parameter berbeda (ukuran instance berbeda, nama domain berbeda). Keputusan struktural — subnet mana yang ada, security group mana, role IAM mana — identik.

**Stack**: Instance yang diterapkan dari sebuah template. Ketika Leo menjalankan `aws cloudformation deploy --template-file infrastructure.yaml`, CloudFormation membuat Stack — koleksi bernama dari sumber daya AWS aktual yang dijelaskan templat. Stack mengingat sumber daya mana yang dibuatnya, dan ia mengelolanya sebagai satu unit. Perbarui templat dan terapkan ulang Stack: CloudFormation menghitung perbedaan antara keadaan saat ini dan templat baru, dan menerapkan hanya perubahan yang dibutuhkan. Hapus Stack: CloudFormation membongkar setiap sumber daya yang dibuatnya, dalam urutan yang benar, tanpa Anda harus mengingatnya.

"Jadi Stack adalah penerapannya, bukan templatnya?" tanya Maya.

"Templat adalah resepnya. Stack adalah hidangannya. Anda bisa membuat hidangan yang sama dari resep yang sama sebanyak yang Anda mau. Setiap kali sama."

**Change Set**: Sebelum menerapkan pembaruan ke Stack yang berjalan, Anda bisa membuat Change Set — pratinjau dari apa yang akan dilakukan CloudFormation. Menambahkan sumber daya baru? Change Set menunjukkannya. Memodifikasi security group? Change Set menunjukkan sebelum dan sesudah. Mengganti instance RDS? Change Set menandainya sebagai penggantian — yang berarti downtime — sebelum Anda berkomitmen.

"Lihat diff sebelum apply," kata Priya. "Inilah yang kita lewatkan ketika Leo mengklik hal-hal di konsol."

Untuk Nimbus, kebijakannya menjadi: semua perubahan infrastruktur ke produksi harus melalui tinjauan Change Set. Tanpa edit konsol langsung. Change Set adalah proses peer review untuk infrastruktur.

**Drift Detection**: Seiring waktu, orang mengklik hal-hal di konsol. Aturan security group ditambahkan selama insiden. Variabel lingkungan diubah di tengah deploy. Jenis instance dinaikkan secara manual ketika perbaikan terjadwal terlalu lama. CloudFormation menyebut ini **drift** — ketika keadaan aktual sebuah sumber daya tidak lagi cocok dengan apa yang dikatakan templat Stack seharusnya.

Drift detection CloudFormation memindai sumber daya Stack dan melaporkan perbedaan apa pun antara keadaan aktual dan keadaan yang ditentukan templat. Ketika Leo menjalankan drift detection pada stack Nimbus yang ada untuk pertama kalinya, dia menemukan sebelas sumber daya yang drift. Tujuh di antaranya adalah modifikasi security group. Tiga adalah perubahan kebijakan IAM. Satu adalah bucket S3 yang kebijakan siklus hidupnya diubah langsung di konsol enam bulan lalu dan tidak pernah dicerminkan dalam templat.

"Sebelas sumber daya di mana infrastruktur nyata dan templat tidak sepakat," kata Priya. "Sebelas potensi inkonsistensi antara staging dan produksi yang tidak kita ketahui."

Leo tidak berkata apa-apa. Beberapa modifikasi itu adalah miliknya.

Dia menghabiskan minggu berikutnya merekonsiliasi sumber daya yang drift dengan templat. Tiga dari perubahan manual adalah bug — konfigurasi yang seharusnya tidak pernah diterapkan. Sisanya adalah perubahan sah yang hanya tidak pernah di-commit kembali ke templat.

**Mengapa Penting untuk Well-Architected Framework**: Infrastructure as Code berada di persimpangan Operational Excellence (penerapan berulang, infrastruktur ter-version-control, auditabilitas setiap perubahan), Reliability (jika sebuah Region gagal, Anda bisa membuat ulang lingkungan dari templat, bukan dari ingatan), dan Security (role IAM dan aturan security group ditinjau dalam kode, bukan ditemukan setelah fakta di konsol). Itu bukan nice-to-have — itu salah satu praktik fundamental yang secara konsisten direkomendasikan kerangka kerja.

---

> **Tips Ujian — CloudFormation**
>
> *SAA-C03 Domain: Cross-domain — Operational Excellence dan Reliability*
>
> - **CloudFormation = IaC deklaratif di AWS.** Anda mendeklarasikan keadaan yang diinginkan dalam templat; CloudFormation membuat dan mengelola sumber daya. Sinyal ujian: "penerapan berulang," "infrastruktur sebagai kode," "lingkungan yang konsisten."
> - **Template** → **Stack**: templat adalah deklarasi; Stack adalah sumber daya yang diterapkan. Stack bisa dibuat, diperbarui, atau dihapus sebagai satu unit.
> - **Change Set**: Pratinjau apa yang akan berubah sebelum menerapkan pembaruan ke Stack yang berjalan. "Lihat diff sebelum apply." Sinyal ujian: "tinjau perubahan infrastruktur sebelum menerapkan" → Change Set.
> - **Drift Detection**: Mengidentifikasi sumber daya yang telah diubah secara manual di luar CloudFormation. "Seseorang mengklik sesuatu di konsol" → Drift Detection.
> - **Atribut DeletionPolicy**: Mengontrol apa yang terjadi pada sumber daya ketika Stack-nya dihapus. `Retain` — sumber daya dipertahankan (berguna untuk bucket S3 dengan data yang tidak ingin Anda kehilangan). `Delete` — sumber daya dihancurkan (default). `Snapshot` — untuk RDS dan beberapa layanan lain, CloudFormation mengambil snapshot akhir sebelum menghapus. Sinyal ujian: "cegah database RDS dihapus ketika stack dihapus" → `DeletionPolicy: Snapshot` atau `DeletionPolicy: Retain`.
> - **CloudFormation StackSets**: Terapkan Stack yang sama di beberapa akun AWS dan region dari satu operasi. Sinyal ujian: "terapkan infrastruktur yang sama di semua akun dalam sebuah organisasi."

**Variasi: Ketika Kerangka Kerja Menyesatkan Anda**

Jika Anda mencentang setiap kotak dalam Well-Architected review tetapi belum memvalidasi pemulihan kegagalan Anda di staging, arsitektur ketersediaan tinggi Anda akan gagal pada insiden nyata pertama — karena dokumentasi ketahanan tidak sama dengan ketahanan yang teruji. Kerangka kerja menanyakan "apakah Anda punya Multi-AZ?" bukan "apakah Anda telah mengonfirmasi bahwa failover benar-benar bekerja dengan benar dalam konfigurasi spesifik Anda?"

Jika Anda menggunakan kerangka kerja sebagai daftar periksa untuk memuaskan auditor alih-alih sebagai alat berpikir untuk meningkatkan sistem, Anda akan menghasilkan dokumentasi akurat dari arsitektur yang tidak Anda pahami sepenuhnya. Pertanyaan paling berharga ketika mereka mengungkap kesenjangan yang tidak Anda duga akan ditemukan.

## Kekuatan dan Batasan

**Apa yang dilakukan Well-Architected Framework dengan baik**: Ia memberi tim kosakata bersama untuk mendiskusikan trade-off arsitektur — bahasa yang bertahan melewati perubahan personel dan percakapan vendor. Menjalankan Well-Architected Review memaksa pengakuan eksplisit atas risiko yang sebaliknya tak terlihat: "Ya, kita tahu kita punya titik kegagalan tunggal di sini; kita menerima trade-off itu karena biaya menghilangkannya melebihi biaya yang diharapkan dari kegagalannya." Trade-off yang terdokumentasi dan disengaja seperti itu adalah output dari tinjauan yang baik.

**Apa yang tidak bisa dilakukannya**: Kerangka kerja bersifat deskriptif, bukan preskriptif. Ia menjelaskan properti dari sistem yang well-architected — ia tidak memberi tahu Anda cara membangunnya. Mencentang setiap kotak dalam Well-Architected Review tidak menjamin arsitektur yang baik. Sistem bisa sangat tersedia, unggul secara operasional, dioptimalkan biayanya, dan tetap menyelesaikan masalah yang salah. Kerangka kerja adalah lensa, bukan cetak biru. Gunakan untuk mengungkap pertanyaan yang tepat, bukan untuk menjawabnya.

## Ringkasan

Well-Architected review meninggalkan mereka dengan 14 item — tiga yang butuh perhatian segera, sisanya yang butuh rencana. Temuan berisiko tinggi bukan kejutan persisnya; itu hal-hal yang tim ketahui dan belum sempat tangani. Tinjauan memberi mereka cara terstruktur untuk mengakui kesenjangan itu secara terbuka, memprioritaskannya berdasarkan risiko, dan berkomitmen pada linimasa. Akuntabilitas itu, lebih dari temuan individu mana pun, adalah nilainya.

- **AWS Well-Architected Framework** punya enam pilar: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, dan Sustainability.
- Setiap pilar punya prinsip desain dan praktik terbaik yang dievaluasi melalui serangkaian pertanyaan terstruktur.
- **Well-Architected Tool** (gratis di konsol AWS) memandu tinjauan dan menghasilkan laporan.
- Output-nya adalah daftar perbaikan arsitektur yang diprioritaskan dan dikategorikan berdasarkan risiko.
- **Infrastructure as Code** adalah pengaktif lintas-pilar — direkomendasikan oleh pilar Operational Excellence, Security, dan Reliability.

## Tips Ujian

*SAA-C03 Domain: Cross-domain — semua domain*

- **Ketahui keenam pilar dan fokus utamanya**. Ujian akan menggambarkan skenario (mis., "tim ingin memastikan sistem mereka bisa pulih dari kegagalan AZ") dan menanyakan pilar mana yang berlaku (Reliability).
- **Pemetaan pilar**:
  - "Menerapkan perubahan dengan andal, belajar dari kegagalan, memantau" → Operational Excellence
  - "IAM, enkripsi, kontrol jaringan, deteksi ancaman" → Security
  - "HA, failover, scaling, DR" → Reliability
  - "Right-sizing, CDN, pemilihan teknologi yang tepat" → Performance Efficiency
  - "Model harga, sumber daya tidak terpakai, visibilitas biaya" → Cost Optimization
  - "Efisiensi energi, pemanfaatan sumber daya, siklus hidup data" → Sustainability
- **Infrastructure as Code**: Direkomendasikan oleh kerangka kerja untuk keberulangan, auditabilitas, dan pemulihan. CloudFormation, CDK, dan SAM adalah alat IaC native AWS.
- **Well-Architected Tool**: Alat konsol AWS yang memandu proses tinjauan. Gratis digunakan. Menghasilkan rencana perbaikan.
- **AWS Trusted Advisor**: Mirip dengan Well-Architected framework tetapi otomatis — memindai akun Anda dan memberikan rekomendasi di seluruh biaya, kinerja, keamanan, dan toleransi kesalahan. Tumpang tindihnya nyata: Trusted Advisor mengotomatiskan sebagian dari apa yang dievaluasi kerangka kerja secara manual.

## Latihan

**Latihan 1 — Mengingat**

Sebutkan enam pilar AWS Well-Architected Framework dan jelaskan perhatian utama masing-masing dalam satu kalimat.

*(Coba lakukan ini dari ingatan. Jika Anda kesulitan, itu informasi berguna tentang pilar mana yang butuh lebih banyak perhatian.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah tim teknik sedang mempersiapkan Well-Architected review. Aplikasi mereka berjalan di EC2 dengan RDS Multi-AZ. Baru-baru ini, mereka menemukan bahwa:

- Proses penerapan mereka terkadang meninggalkan instance EC2 dengan versi library berbeda (configuration drift)
- Mereka tidak punya peringatan otomatis ketika failover RDS dipicu
- Pengguna IAM mereka semua punya AdministratorAccess
- Mereka belum menguji proses pemulihan cadangan mereka selama 14 bulan

Petakan setiap masalah ke pilar Well-Architected yang PALING relevan.

A) Configuration drift: Operational Excellence; Tidak ada peringatan failover RDS: Reliability; AdministratorAccess: Security; Tidak ada tes pemulihan cadangan: Reliability

B) Configuration drift: Security; Tidak ada peringatan failover RDS: Performance Efficiency; AdministratorAccess: Operational Excellence; Tidak ada tes pemulihan cadangan: Cost Optimization

C) Configuration drift: Reliability; Tidak ada peringatan failover RDS: Performance Efficiency; AdministratorAccess: Security; Tidak ada tes pemulihan cadangan: Operational Excellence

D) Configuration drift: Security; Tidak ada peringatan failover RDS: Reliability; AdministratorAccess: Cost Optimization; Tidak ada tes pemulihan cadangan: Security

**Petunjuk 1**: "Configuration drift" dalam proses penerapan → pilar mana yang mencakup praktik penerapan?

**Petunjuk 2**: "AdministratorAccess" untuk semua pengguna → pilar mana yang mencakup kontrol akses?

**Petunjuk 3**: "Pemulihan cadangan tidak diuji" → pilar mana yang mencakup pengujian mekanisme pemulihan Anda?

**Jawaban**: A

**Penjelasan**: Configuration drift dalam penerapan (lingkungan tidak konsisten) adalah masalah Operational Excellence — ini tentang praktik penerapan yang andal dan konsisten. Tidak ada peringatan pada failover RDS berarti Anda tidak tahu kapan mekanisme HA dipicu — masalah Reliability (mengetahui kesehatan sistem Anda). AdministratorAccess untuk semua pengguna melanggar hak istimewa terkecil — masalah Security. Pemulihan cadangan yang tidak diuji berarti mekanisme Reliability (DR) Anda tidak terverifikasi.

**Mengapa bukan B?** B salah menempatkan configuration drift ke Security (versi library yang tidak konsisten adalah masalah operasi penerapan, bukan ancaman keamanan) dan AdministratorAccess ke Operational Excellence (kontrol akses adalah perhatian Security, bukan proses ops).

**Mengapa bukan C?** C menempatkan AdministratorAccess dengan benar di Security tetapi salah menempatkan configuration drift ke Reliability (konsistensi penerapan adalah Operational Excellence) dan pemulihan cadangan yang tidak diuji ke Operational Excellence (pengujian pemulihan adalah perhatian Reliability — Anda memverifikasi bahwa sistem Anda bisa pulih, bukan bahwa proses Anda konsisten).

**Mengapa bukan D?** D menugaskan AdministratorAccess ke Cost Optimization (izin yang terlalu luas tidak ada hubungannya dengan biaya) dan pemulihan cadangan yang tidak diuji ke Security (tidak bisa memulihkan cadangan adalah kegagalan Reliability, bukan kerentanan keamanan).

*SAA-C03 Domain: Cross-domain*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Lakukan mini Well-Architected review pada aplikasi yang Anda kenal atau sedang bangun. Untuk setiap dari enam pilar, catat:

- Satu hal yang dilakukan aplikasi dengan baik
- Satu hal yang bisa ditingkatkan aplikasi

Kemudian peringkat item perbaikan Anda berdasarkan risiko (apa yang paling mungkin menyebabkan insiden atau pemborosan?) dan prioritas (apa yang akan punya dampak terbesar jika diperbaiki?).

*(Latihan ini lebih berharga daripada yang mungkin terlihat. Praktik mengevaluasi arsitektur secara sistematis dari berbagai sudut adalah keterampilan inti insinyur senior.)*

## Adegan Pasca-Kredit

Tiga minggu setelah Well-Architected review, tim telah mengimplementasikan tiga perbaikan P1 — ketujuh role Lambda menjadi hak istimewa terkecil, penggunaan root memicu peringatan, dan failover Aurora telah diuji di bawah beban pada Selasa pukul 2 pagi — dan pekerjaan P2 sedang berlangsung.

Patching EC2 kini diotomatiskan via AWS Systems Manager Patch Manager. Dokumen proses respons insiden ada (tidak sempurna, tetapi ditulis dan dibagikan). Rencana warm standby multi-region telah dirancang dan dijadwalkan untuk diimplementasikan kuartal berikutnya.

Priya meninjau laporan Well-Architected Tool. Temuan P1 ditutup atau ditugaskan dengan bukti. Item berisiko sedang dan rendah menyusut, dengan pemilik dan tanggal.

"Kita dalam kondisi lebih baik daripada sebelumnya," katanya.

"Apakah itu bagus?" tanya Leo.

"Itu kemajuan," katanya. "Anda tidak menyelesaikan Well-Architected review. Anda membuat kemajuan, lalu Anda meninjau lagi dalam enam bulan."

Maya telah memikirkan sesuatu.

"Kita telah menghabiskan 31 bab mempelajari layanan AWS individual," katanya. "Dan sekarang kita mulai melihat keseluruhan sistem. Itulah cara arsitek berpikir."

"Kita sudah berpikir seperti arsitek selama beberapa waktu," kata Leo.

"Kita telah membuat keputusan arsitektur," kata Maya. "Itu berbeda. Berpikir seperti arsitek berarti Anda mengevaluasi keputusan *sebelum* membuatnya, bukan setelah."

"Apa bedanya?" tanya Tom.

"Di bab berikutnya," katanya, "kita coba menjawab itu."

Di bab berikutnya: seperti apa tinjauan arsitektur yang sebenarnya, dari prinsip-prinsip dasar.
