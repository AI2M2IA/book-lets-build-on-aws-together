# Chapter 33: Tergantung

Ambil satu napas terakhir sebelum bab ini.

Kursor berkedip di slide kosong Maya. Judul: "Arsitektur di Nimbus." Dia menghapusnya dan mengetik: "Pertanyaan Itu." Lalu dia melihat ruangan dan menyadari dia tidak membutuhkan slide itu sama sekali.

**Rekap: Dari Tinjauan ke Presentasi**

Tinjauan arsitektur dengan Carlos — kini enam bulan dan beberapa ratus peluncuran restoran di belakang mereka — telah meninggalkan tim dengan setumpuk ADR dan cara berpikir yang lebih bersih tentang keputusan sebelum mereka dikirimkan. Maya telah mempersiapkan presentasi investor ketika dia menyadari bahwa semua yang ditanyakan Carlos — dan semua yang dia jawab dengan percaya diri — berujung pada logika dasar yang sama. Investor akan bertanya mengapa. Dia telah belajar, selama dua tahun membangun Nimbus, bahwa jawabannya tidak pernah nama layanan. Jawabannya selalu set kondisi yang membuat satu layanan benar dan layanan lain salah. Dia akan masuk ke ruangan penuh orang yang akan memintanya membela setiap pilihan arsitektur. Dia siap.

**Pertanyaan Itu**

Di akhir hampir setiap diskusi arsitektur, seseorang akhirnya bertanya: "Apa jawaban yang benar?"

Dan jawaban yang paling berguna, menjengkelkan, jujur, dan disalahpahami dalam semua rekayasa perangkat lunak adalah:

**Itu tergantung.**

Bukan karena pertanyaannya tidak dapat dijawab. Bukan karena ahlinya menghindar. Tetapi karena jawaban yang benar benar-benar, secara struktural, bergantung pada konteks yang tidak ada dalam pertanyaan.

Bab ini tentang belajar mengatakan "itu tergantung" dengan benar — yang berarti mampu menyelesaikan kalimat itu.

Bayangkan seorang dokter yang ditanya: "Apakah operasi adalah perawatan yang tepat?" Dokter yang buruk mengatakan ya atau tidak tanpa memeriksa pasien. Dokter yang baik mengatakan: "Itu tergantung — pada diagnosis, usia pasien, kondisi mereka yang lain, dan apa yang terjadi jika kita menunggu." Jawabannya bukan penghindaran. Itu presisi. "Itu tergantung" diikuti kalimat lengkap adalah hal yang paling berguna yang bisa dikatakan seorang dokter — atau arsitek.

**Akhir dari Nimbus**

Dua setengah tahun setelah permulaan. Maya berdiri di ruang konferensi di Seattle, mempresentasikan kepada sekelompok investor modal ventura.

Nimbus telah tumbuh: 947 mitra restoran. 18.000 pesanan harian. $18 juta dalam GMV bulanan. Tiga kota beroperasi, dua lagi meluncur. Tim empat belas insinyur di dua zona waktu.

Para investor punya pertanyaan. Salah satunya — mitra teknis di dana tersebut — mencondongkan badan.

"Database apa yang Anda gunakan?" tanyanya.

Maya tidak ragu-ragu.

"Untuk pesanan dan data pelanggan: Aurora PostgreSQL. Untuk katalog menu: DynamoDB. Untuk manajemen sesi dan caching: ElastiCache Redis. Untuk analitik: Athena di atas berkas Parquet S3, dengan Redshift untuk kueri dasbor frekuensi tinggi."

Dia mengangguk. "Mengapa Aurora untuk pesanan dan bukan DynamoDB?"

"Karena pesanan punya struktur relasional yang kompleks — mereka merujuk item menu, akun pelanggan, alamat restoran, metode pembayaran. Kami butuh konsistensi transaksional di seluruh entitas. Database relasional adalah alat yang tepat untuk itu. Kekuatan DynamoDB adalah akses key-value throughput tinggi dengan skema fleksibel, yang persis pola akses katalog menu."

Dia menulis sesuatu. "Bagaimana dengan penskalaan? Anda mengatakan 18.000 pesanan harian. Itu sekitar 12 per menit rata-rata. Bagaimana Anda merancang untuk puncak?"

"Jam makan malam Jumat sekitar 25x rata-rata. Kami menskalakan secara horizontal dengan ECS dan Aurora Serverless v2, yang menangani lonjakan secara otomatis. CloudFront menyerap beban konten statis. API tanpa status, jadi penskalaan horizontal bersih."

"Dan jika Aurora Serverless v2 tidak bisa menskalakan cukup cepat?"

"Kami punya hasil uji beban. Waktu-ke-skala untuk Aurora Serverless v2 di bawah 10 detik. Lonjakan rata-rata Jumat kami butuh 8 menit dari baseline. Kami nyaman dengan headroom-nya."

Mitra teknis itu melihat sisa investor. "Dia tahu sistemnya."

Dia punya lebih banyak pertanyaan.

"Bagaimana Anda menangani keamanan penerapan? Pada 947 restoran, penerapan yang buruk berarti 947 restoran tidak bisa menerima pesanan."

Maya pernah ditanya ini, secara internal. "Feature flag untuk semua perubahan perilaku. Kami menerapkan kode terus-menerus, tetapi perilaku baru digerbang di balik flag yang kami aktifkan secara bertahap. Penerapan yang mengubah alur konfirmasi pesanan dirilis ke 1% restoran selama 24 jam, lalu 10%, lalu 50%, lalu 100% — dengan rollback otomatis jika tingkat error melebihi ambang batas di tahap mana pun."

"Berapa lama rollout penuh?"

"Tiga hari untuk perubahan berisiko tinggi. Satu hari untuk berisiko rendah. Rollback darurat selesai dalam kurang dari empat menit."

"Berapa latensi Stripe p99 Anda?"

Tom menjawab sebelum Maya bisa. "214 milidetik."

"Itu tinggi," kata investor.

"SLA kami ke restoran adalah penempatan pesanan ke konfirmasi dalam kurang dari 5 detik," kata Tom. "214ms untuk panggilan Stripe adalah 4,3% dari anggaran itu. Sisa waktu adalah penulisan Aurora, pengiriman pesan SQS, push notifikasi tablet restoran. Kami punya headroom."

"Bagaimana jika Stripe punya insiden?"

"Kami menggunakan penangkapan pembayaran asinkron Stripe. Pesanan diterima dan restoran diberi tahu segera. Penangkapan pembayaran terjadi secara asinkron. Jika Stripe lambat, pesanan tetap diproses — penangkapan mencoba ulang. Jika Stripe sepenuhnya mati, kami mengantrekan upaya penangkapan dengan exponential backoff dan memberi peringatan on-call kami. Kami belum pernah menahan pesanan untuk Stripe dalam 14 bulan."

Investor menulis sesuatu. "Apakah Anda punya titik kegagalan tunggal?"

Priya menjawab. "Aurora di satu region adalah dependensi single-region. Kami punya Multi-AZ untuk kegagalan tingkat-AZ, dan reader Aurora Global Database yang sudah berjalan di us-east-1. Kegagalan regional penuh akan berarti failover ke reader itu — dan failover regional otomatis di sekitarnya adalah yang sedang kami bangun kuartal ini. Sampai saat itu, ya — kegagalan regional us-west-2 akan menjatuhkan Nimbus."

"Mengapa Anda belum membangun failover multi-region?"

"Karena sampai enam bulan lalu, biaya teknik membangunnya dengan benar melebihi risiko bisnis dari pemadaman," kata Priya. "Kami belum pernah punya kegagalan AWS regional yang berlangsung lebih dari 30 menit di region operasi kami. Pada 287 restoran — sekitar 4.200 pesanan sehari dengan nilai pesanan rata-rata $34 — pemadaman regional 2 jam menghabiskan kami kira-kira $12.000 dalam GMV. Biaya teknik dari warm standby yang diimplementasikan dengan benar adalah 3 bulan waktu insinyur senior. Pada pendapatan kami saat itu, perhitungannya mendukung penundaan."

"Dan sekarang?"

"Pada 947 restoran dan 18.000 pesanan harian, pemadaman 2 jam yang sama menghabiskan kira-kira $51.000 dalam GMV dan menghasilkan kerusakan reputasi signifikan dengan mitra restoran yang bergantung pada kami untuk layanan makan malam mereka. Perhitungannya telah berubah. Proyek failover dimulai sprint berikutnya."

Investor melihat investor lain di ruangan. "Dia juga tahu profil risikonya."


**Empat Pertanyaan di Bawah "Itu Tergantung"**

Dia telah menanyakan suatu versi dari masing-masing pertanyaan ini selama dua tahun tanpa tahu bahwa dia menanyakan pertanyaan yang sama dalam empat cara berbeda. Sesi investor telah memperjelasnya. Setiap pilihan yang dia jelaskan dengan percaya diri kembali ke empat sumbu yang sama.

**1. Apa pola aksesnya?**

Bagaimana data ditulis dan dibaca? Pada frekuensi apa? Oleh berapa banyak pengguna bersamaan? Dalam urutan apa? Dengan kunci apa?

Pertanyaan ini menentukan pemilihan teknologi pada tingkat paling fundamental. DynamoDB vs Aurora vs Redshift vs Athena — jawaban yang tepat bergantung hampir sepenuhnya pada pola akses.

**2. Apa skalanya?**

Bukan hanya sekarang — dalam 12 bulan, dalam 5 tahun. Skala mengubah jawaban yang benar. Apa yang berfungsi pada 100 permintaan per hari rusak pada 100 juta. Apa yang berlebihan pada 10 pengguna diperlukan pada 10.000.

Dan skala bukan hanya lalu lintas. Itu ukuran tim (arsitektur harus dapat dipelihara oleh tim yang Anda miliki). Itu volume data. Itu jangkauan geografis.

**3. Apa konsekuensi kegagalannya?**

Jika ini rusak, apa yang terjadi? Apakah pengguna melihat halaman yang lambat? Apakah pesanan gagal? Apakah uang bergerak secara tidak benar? Apakah catatan medis seseorang menjadi tidak dapat diakses?

Konsekuensi menentukan berapa banyak yang Anda investasikan dalam keandalan. Halaman menu yang lambat menjamin konsistensi eventual. Pembayaran yang gagal menjamin penulisan sinkron dan konfirmasi eksplisit.

**4. Apa batasan biayanya?**

Bukan hanya uang — juga kompleksitas operasional (yang merupakan bentuk biaya itu sendiri). Solusi yang memerlukan tiga layanan tambahan mungkin secara teknis lebih unggul daripada yang lebih sederhana tetapi terlalu mahal untuk dipelihara dengan tim empat orang.

"Tunggu — tapi *mengapa* pola akses begitu penting?" Maya pernah bertanya, dua tahun sebelumnya, ketika Tom pertama kali mengusulkan memisahkan katalog menu dari database pesanan. "Tidak bisakah kita mengoptimalkannya nanti?"

Pertanyaan itu, ternyata, adalah awal dari jawabannya. Anda tidak bisa mengoptimalkan skema relasional untuk pola akses key-value tanpa membangunnya ulang. Pola akses harus diketahui pada waktu desain, bukan dipasang ulang. Setiap keputusan arsitektur yang dia buat sejak itu dimulai dengan pertanyaan yang sama.

Anda mungkin bertanya-tanya: jika "itu tergantung" selalu jawaban yang benar, bagaimana Anda pernah membuat keputusan? Jawabannya adalah bahwa menyelesaikan kalimat memaksa Anda menamai kondisinya, dan setelah Anda menamainya, Anda tahu informasi apa yang Anda butuhkan. "Itu tergantung pada pola akses" menjadi "pergi cari tahu apa pola akses sebenarnya." Empat pertanyaan bukanlah cara untuk menghindari keputusan — itu cara untuk membuatnya dengan informasi yang tepat.

**"Itu Tergantung": Cara Menyelesaikan Kalimatnya**

Cara yang benar untuk mengatakan "itu tergantung" adalah dengan segera menyelesaikannya:

*"Haruskah kita menggunakan DynamoDB atau Aurora?"*

"Itu tergantung pada pola akses. Jika Anda butuh lookup berbasis kunci throughput tinggi dengan skema fleksibel, DynamoDB. Jika Anda butuh konsistensi transaksional di seluruh entitas terkait dengan kueri kompleks, Aurora."

*"Haruskah kita menggunakan Lambda atau EC2?"*

"Itu tergantung pada karakteristik beban kerja. Lambda untuk beban kerja berbasis peristiwa, durasi pendek, variabel di mana biaya idle nol penting. EC2 atau ECS untuk proses persisten, berstatus, atau berjalan lama di mana kinerja yang dapat diprediksi lebih penting daripada biaya idle."

*"Haruskah kita menggunakan Multi-AZ atau Multi-Region?"*

"Itu tergantung pada persyaratan RTO/RPO Anda dan model ancaman Anda. Multi-AZ melindungi terhadap kegagalan AZ (mode kegagalan AWS yang paling umum) dan menyediakan RPO ~0 dan RTO ~60 detik untuk RDS. Multi-Region melindungi terhadap kegagalan regional (jarang) dan melayani pengguna yang terdistribusi global. Jika Anda butuh failover di bawah satu menit dari bencana regional, Multi-Region. Jika ketahanan AZ sudah cukup, Multi-AZ jauh lebih sederhana dan lebih murah."

"Itu tergantung" bukan akhir dari jawabannya. Itu awal dari jawaban yang sebenarnya.


*"Haruskah kita menggunakan EKS atau ECS untuk orkestrasi kontainer?"*

Investor telah menanyakan yang satu ini sebelum Maya pindah ke slide berikutnya. Dia berhenti.

"Itu tergantung pada ukuran tim, keahlian Kubernetes yang ada, dan apakah Anda butuh fitur spesifik Kubernetes."

"Perluas itu," katanya.

"Kubernetes adalah platform orkestrasi yang kuat," kata Maya. "Ia punya ekosistem yang kaya — Helm chart, custom resource definition, federasi multi-cluster, kebijakan penjadwalan canggih. Jika Anda punya tim yang tahu Kubernetes, punya tooling yang dibangun di sekitarnya, dan butuh kemampuan itu, EKS adalah pilihan yang tepat. Anda mendapat control plane terkelola, tetapi Anda masih mengelola kompleksitas Kubernetes berupa kebijakan jaringan, keamanan pod, kuota sumber daya, dan sisanya."

"Dan ECS?"

"ECS lebih sederhana. Tanpa API Kubernetes. Tanpa etcd. Tanpa kompleksitas jaringan pod. Anda mendefinisikan task, service, dan cluster. IAM terintegrasi secara native tanpa memerlukan plugin tambahan. Model mentalnya jauh lebih kecil. Untuk tim yang belum tahu Kubernetes, ECS menghilangkan berbulan-bulan kurva pembelajaran."

"Yang mana yang digunakan Nimbus?"

"ECS," katanya. "Kami mengevaluasi EKS delapan belas bulan lalu. Kami punya satu insinyur dengan pengalaman Kubernetes. Yang lain akan butuh 3 sampai 4 bulan untuk menjadi produktif dalam lingkungan Kubernetes produksi. Fitur yang akan diberikan EKS — manajemen multi-cluster, penjadwalan kustom — kami tidak butuh. ECS dengan Fargate menjalankan kontainer kami. Tim produktif dalam dua minggu."

"Apakah itu pilihan yang tepat pada 50 insinyur?" tanyanya.

"Mungkin tidak," kata Maya. "Pada 50 insinyur dengan beberapa tim produk yang membutuhkan namespace terisolasi, kebijakan jaringan kustom, dan kuota sumber daya berlingkup-tim — model namespace Kubernetes menjadi benar-benar berharga. ECS tidak punya isolasi namespace yang setara. Pada skala itu, kurva pembelajaran Kubernetes diamortisasi di seluruh tim yang jauh lebih besar. Jawaban 'itu tergantung' bergeser."

"Pada ukuran tim berapa pergeseran itu terjadi?" tanyanya.

Dia telah memikirkan ini. "Aturan yang saya gunakan: ketika overhead operasional Kubernetes menjadi lebih kecil daripada overhead organisasional bekerja di sekitar keterbatasan ECS, beralih. Untuk tim 14 orang, ECS. Untuk tim 50 orang dengan beberapa vertikal produk, mungkin EKS. Angkanya tidak tetap — itu tergantung pada apa yang Anda bangun dan siapa yang membangunnya."

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" Maya bertanya pada dirinya sendiri, mengulangi pertanyaan yang dia pelajari dari dua tahun membangun. "Mengapa tidak pilih satu dan tetap padanya?"

Karena jawaban yang benar berubah seiring organisasi berubah. Keputusan arsitektur yang dibuat untuk tim 4 orang belum tentu benar untuk tim 40 orang. Kondisi berubah. Jawaban berubah dengannya.

"Itulah intinya," katanya kepada investor. "Jawaban yang benar hari ini adalah ECS. Jawaban yang benar dalam tiga tahun mungkin EKS. Kami akan meninjau kembali ketika kondisi menjaminnya. Kami punya ADR yang mendokumentasikan mengapa kami memilih ECS, dan ia mencantumkan secara eksplisit apa yang akan memicu pertimbangan ulang."

Investor menulis satu catatan lagi. "Itu cara yang matang untuk memegang keputusan teknis."


**Variasi: Ketika "Itu Tergantung" Membuat Anda dalam Masalah**

Jika pola akses mendukung lookup key-value dan Anda memilih DynamoDB, Anda akan mengungguli Aurora pada skala besar — tetapi jika Anda menambahkan fitur yang memerlukan kueri JOIN di seluruh tiga entitas, Anda telah membangun fondasi yang salah dan akan perlu bermigrasi di bawah tekanan. Jawaban "itu tergantung" hanya sebaik pemahaman Anda tentang kondisi yang Anda andalkan.

Jika Anda mengoptimalkan untuk skala saat ini dan pola akses saat ini, Anda akan membuat keputusan yang tepat untuk hari ini — tetapi jika lalu lintas tumbuh 50x dalam setahun tanpa arsitektur Anda beradaptasi, keputusan yang benar untuk hari pertama menjadi penghambat untuk hari ke-365. Empat pertanyaan harus ditanyakan bukan hanya pada waktu desain tetapi ditinjau kembali seiring sistem tumbuh.

**Pola yang Tidak Berubah**

Meskipun pilihan teknologi spesifik berkembang — layanan baru meluncur, harga berubah, alternatif yang lebih baik muncul — beberapa pola mendasar tetap stabil selama beberapa dekade:

**Pemisahan perhatian (separation of concerns)**: Komponen yang melakukan hal berbeda harus independen. Perubahan pada satu tidak boleh memerlukan perubahan pada yang lain. Inilah mengapa Anda memisahkan dengan SQS, bukan panggilan langsung. Mengapa Anda menggunakan S3 untuk objek, bukan database. Mengapa tingkat web dan tingkat database terpisah.

**Pertahanan berlapis (defense in depth)**: Tidak ada kontrol keamanan tunggal yang cukup. Anda punya IAM, security group, NACL, WAF, GuardDuty, Secrets Manager, KMS. Jika satu lapisan gagal, lapisan berikutnya menangkapnya.

**Bayar sesuai yang Anda gunakan, saat Anda menggunakannya**: Prinsip ekonomi fundamental cloud. Lambda berskala ke nol. Spot instance menggunakan kapasitas cadangan. Kebijakan siklus hidup S3 memindahkan data dingin ke penyimpanan yang lebih murah. DynamoDB on-demand mengenakan biaya per permintaan. Tom telah menanyakan "Berapa biayanya per bulan?" sepuluh ribu kali selama dua tahun. Pertanyaan itu — ditanyakan secara konsisten, dijawab secara ketat — telah berubah menjadi hampir $36.000 dalam penghematan tahunan. Polanya berbeda; prinsipnya sama.

**Optimalkan untuk kegagalan yang paling mungkin**: Multi-AZ dulu (kegagalan AZ terjadi). DR lintas-region kedua (kegagalan regional lebih jarang). Redundansi dalam-AZ (beberapa instance) sebelum kompleksitas lintas-region. Bangun untuk kegagalan yang realistis, bukan yang katastropik tetapi tidak mungkin.

**Ukur sebelum mengoptimalkan**: Pendekatan Tom — tarik metrik CloudWatch, pahami pola sebenarnya, lalu buat keputusan — lebih berharga daripada optimasi prematur berdasarkan asumsi. Insting Leo pada pekerjaan batch malam — "Akan baik-baik saja" — adalah hal terpenting untuk melatih diri Anda agar tidak melakukannya. Biasanya memang baik-baik saja, sampai satu kali ketika tidak, dan Anda belum mengukur apa pun.


**Biaya bertumpuk dari default yang salah**.

Tom punya pola lain untuk ditambahkan ke daftar, yang dia identifikasi hanya setelah tiga bulan tinjauan biaya: biaya tidak mengubah default.

Layanan AWS dirancang agar aman dan fungsional di luar kotak. Default tidak dirancang untuk optimal bagi setiap beban kerja. gp2 adalah jenis volume EBS default sampai gp3 diluncurkan pada Desember 2020. Setelah itu, gp3 menjadi default untuk volume baru — tetapi volume gp2 yang ada tidak pernah dikonversi, karena AWS tidak memodifikasi sumber daya pelanggan yang ada tanpa tindakan eksplisit.

Implikasi biayanya: setiap tim yang membuat volume EBS sebelum gp3 dan tidak pernah menjalankan audit migrasi membayar 25% lebih per GB selama bertahun-tahun, bukan karena mereka membuat keputusan yang salah, tetapi karena mereka tidak membuat keputusan. Default bertahan, dan biaya bertumpuk secara diam-diam.

Inilah mengapa pertanyaan "tunggu, tapi mengapa kita melakukannya dengan cara itu?" telah menjadi hal yang paling berharga yang ditanyakan tim. Itu tidak selalu tentang menantang keputusan yang dibuat. Terkadang itu tentang mempertanyakan non-keputusan: default yang diterima tanpa pemeriksaan.

Polanya menggeneralisasi: tinjau kembali default ketika AWS meluncurkan opsi baru. gp2 ke gp3. DynamoDB On-Demand ke provisioned dengan Auto Scaling ketika lalu lintas stabil. S3 Standard ke Intelligent-Tiering ketika pola akses menjadi tidak pasti. Tinjauan ulang tidak harus mahal — satu sore analisis per kategori, kuartalan. Tetapi itu tidak bisa dilewati. Default bertumpuk.

"Setiap dolar yang kita keluarkan untuk sesuatu yang kita pilih adalah biaya yang disengaja," kata Tom, dalam tinjauan bulanan. "Setiap dolar yang kita keluarkan untuk sesuatu yang belum kita lihat sejak kita provision-kan adalah potensi default yang harus dipertanyakan."

"Berapa banyak yang kita punya?" tanya Maya.

"Lebih sedikit daripada enam bulan lalu," katanya. "Lebih dari nol."

Itu jawaban yang jujur. Itu selalu jawaban yang jujur.


**Apa yang Tidak Bisa Diajarkan Buku Ini**

Mari jujur tentang batasannya.

Buku ini telah mengajari Anda:

- Apa yang dilakukan setiap layanan AWS utama
- Analogi yang membuatnya intuitif
- Trade-off antar alternatif
- Pengetahuan ujian yang Anda butuhkan untuk SAA-C03
- Kerangka untuk memikirkan keputusan arsitektur

Buku ini tidak bisa mengajari Anda:

- **Insting produksi**: Firasat yang mengatakan "ini akan menjadi aneh di bawah beban" sebelum Anda melihatnya terjadi. Ini datang dari mengoperasikan sistem nyata.
- **Penilaian teknis di bawah tekanan**: Memutuskan apa yang harus dilakukan pada pukul 3 pagi ketika sistem mati dan Anda punya informasi tidak lengkap. Ini datang dari insiden.
- **Intuisi pemangku kepentingan**: Mengetahui kapan menentang persyaratan bisnis karena biaya teknisnya terlalu tinggi. Ini datang dari pengalaman dengan kedua sisi teknis dan bisnis.
- **Pertanyaan yang tepat untuk konteks spesifik**: Carlos bisa mengajukan pertanyaan yang tepat karena dia telah melihat masalah serupa puluhan kali. Pengetahuan ini diperoleh, bukan dibaca.

Anda belum selesai belajar. Anda baru saja mulai.

**Ujian Bukan Tujuan Akhir**

Anda mengambil buku ini untuk mempersiapkan ujian AWS Solutions Architect Associate. Itu valid. Sertifikasi SAA-C03 nyata, dihargai, dan akan membuka pintu.

Tetapi ujian menguji pengetahuan dan pengenalan pola. Ia tidak menguji penilaian. Ia tidak menguji pengalaman operasional. Ia tidak menguji apa yang Anda lakukan ketika arsitektur yang Anda bangun berhenti berfungsi pada pukul 11 malam pada hari Jumat.

Sertifikasi adalah kredensial awal. Ketika Anda lulus ujian, Anda akan tahu cara kerja layanan AWS dan bagaimana mereka bergabung. Anda akan punya kerangka untuk memikirkan arsitektur. Anda belum melakukannya.

Langkah berikutnya setelah ujian: bangun sesuatu yang nyata. Terapkan. Operasikan. Saksikan ia gagal. Perbaiki. Kehabisan uang di satu layanan dan pindahkan biaya ke tempat lain. Dapatkan panggilan di tengah malam dan buat keputusan dengan informasi yang tidak mencukupi.

Itulah bagaimana pengetahuan dalam buku ini menjadi penilaian.

**Jawaban Akhir Maya**

Di akhir pertemuan investor, mitra teknis punya satu pertanyaan lagi.

"Jika Anda memulai dari awal hari ini, mengetahui apa yang Anda ketahui sekarang, apa yang akan Anda lakukan berbeda?"

Maya mengambil sejenak.

"Saya akan memulai dengan infrastructure as code dari hari pertama," katanya. "Leo menerapkan instance EC2 pertama secara manual. Kami menghabiskan enam bulan memigrasikan semuanya ke Terraform. Itu enam bulan utang teknis yang menghabiskan waktu nyata kami."

"Apa lagi?"

"Saya akan lebih konservatif tentang layanan terkelola di awal. Kami menggunakan DynamoDB ketika database RDS sederhana akan cukup selama berbulan-bulan. Desain pola akses DynamoDB memerlukan pemikiran berpengalaman yang belum kami miliki. Kami mendesain ulang skema dua kali."

"Jadi lebih sederhana lebih baik di awal?"

"Lebih sederhana lebih baik *selalu*. Pertanyaannya selalu: apa hal paling sederhana yang menyelesaikan masalah sebenarnya, bukan masalah masa depan yang diantisipasi? Kami menambahkan kompleksitas untuk menyelesaikan masalah yang belum kami miliki. Sebagian kompleksitas itu menyebabkan masalahnya sendiri."

Mitra teknis menuliskannya.

"Pertanyaan terakhir," katanya. "Apa hal terpenting yang Anda ketahui tentang membangun di AWS yang tidak Anda ketahui ketika Anda memulai?"

Maya memikirkan dua tahun itu. Insiden-insiden. Tinjauan biaya. Well-Architected review. Keputusan arsitektur yang dibuat di bawah tekanan dan yang dibuat dengan hati-hati. Yang mereka lakukan dengan benar dan yang harus mereka ulangi.

"Bahwa cloud tidak menyelesaikan masalah arsitektur," katanya. "Ia memperbesarnya. Keputusan buruk on-premises mungkin menghabiskan Anda seminggu. Keputusan buruk di cloud bisa menghabiskan Anda uang setiap bulan, pada skala besar, sampai seseorang menyadarinya."

Dia berhenti.

"Cloud membuat keputusan yang baik berskala. Dan keputusan buruk juga."

Malam itu, Maya bercerita kepada Tom, Priya, dan Leo tentang sesi investor.

"Dia bertanya tentang pilihan database," katanya. "Semuanya."

"Berapa biayanya per bulan?" tanya Tom segera, yang persis pertanyaan yang salah dan juga yang benar. "Apakah dia bertanya tentang model biaya?"

"Ya. Saya menjelaskan Savings Plans, peralihan DynamoDB ke provisioned. Dia mengangguk."

"Dan bagaimana jika seseorang mencoba membobol?" tanya Priya. "Apakah pertanyaan keamanan muncul?"

"IAM, enkripsi, GuardDuty. Ya. Dia tampak puas."

Leo telah diam. "Apakah dia bertanya tentang bagian-bagian yang tidak berjalan baik?"

"Dia bertanya apa yang akan saya lakukan berbeda. Saya menceritakannya tentang memulai dengan infrastructure as code, dan menjadi lebih konservatif tentang layanan terkelola di awal."

"Skema DynamoDB yang kita desain ulang dua kali," kata Leo. "Saya selalu merasa itu salah saya."

"Itu salah kita semua," kata Maya. "Itulah intinya."

**Penutup**

Anda telah belajar banyak. Layanan AWS. Trade-off. Pola.

Sekarang lakukan sesuatu dengannya.

Bangun sesuatu. Buat kesalahan dengan sengaja. Baca post-mortem (mereka publik — AWS, Cloudflare, GitHub, Stripe semuanya menerbitkannya). Bekerjalah dengan tim yang lebih baik daripada Anda dalam hal-hal yang paling Anda lemah.

Ujian SAA-C03 akan menguji apakah Anda tahu materinya. Karier Anda akan menguji apakah Anda bisa menerapkannya.

Keduanya layak dilakukan. Tidak ada yang merupakan tujuan akhir.

Tidak ada tujuan akhir di bidang ini. Hanya ada masalah berikutnya, keputusan berikutnya, dan kebiasaan mengajukan pertanyaan berikutnya yang tepat.

**Pelajaran yang Tidak Masuk Slide Deck**

Di kereta kembali dari Seattle, Maya bercerita kepada Leo dan Priya tentang dua hal yang dia senang investor tidak tanyakan secara langsung — karena jawaban jujurnya akan butuh dua puluh menit masing-masing.

**Insiden pipeline analitik**.

Delapan bulan sebelumnya, pipeline analitik telah dikopling ke layanan pemrosesan pesanan utama. Peristiwa pesanan ditulis ke antrian SQS yang sama yang dikonsumsi pipeline analitik. Kopling itu tampak masuk akal: analitik butuh data pesanan, pemrosesan pesanan menghasilkan data pesanan.

Pada Rabu malam, sebuah bug di Lambda agregasi analitik menyebabkannya berhenti mengonsumsi dari antrian. Kedalaman antrian tumbuh. Karena layanan pemrosesan pesanan berbagi antrian SQS yang sama untuk pesan konfirmasinya, baik pipeline analitik maupun jalur konfirmasi pesanan menumpuk secara bersamaan. Mitra restoran mulai melihat penundaan konfirmasi. Antrian SQS mendekati batas retensi pesannya.

"Saya sudah men-deploy perbaikannya," kata Leo, pukul 11 malam itu — lalu berhenti. Perbaikan untuk bug analitik akan memerlukan penerapan ulang Lambda yang akan membersihkan antrian, tetapi dia belum memeriksa apakah pesan konfirmasi pesanan dalam antrian masih dalam visibility timeout-nya. Jika timeout telah kedaluwarsa, Lambda akan memproses ulang mereka, dan mitra restoran akan menerima konfirmasi pesanan duplikat.

Insiden telah berlangsung tiga jam dan memerlukan dua rollback.

Pelajaran arsitekturnya sederhana: analitik dan pemrosesan operasional tidak boleh berbagi antrian yang sama. Mereka punya karakteristik kinerja berbeda, mode kegagalan berbeda, dan konsekuensi berbeda ketika mereka gagal. Mengopling mereka berarti kegagalan di jalur prioritas-lebih-rendah bisa mendegradasi jalur prioritas-lebih-tinggi.

Setelah insiden, Nimbus memisahkan pipeline sepenuhnya. Peristiwa pesanan masuk ke antrian operasional khusus. Aturan EventBridge terpisah menggandakan peristiwa ke antrian khusus-analitik. Kedua pipeline tidak punya infrastruktur bersama kecuali sumber peristiwa. Kali berikutnya Lambda analitik punya bug — dan memang, dua bulan kemudian — ia gagal diam-diam, antrian analitik menumpuk, laporan pagi terlambat, dan jalur konfirmasi pesanan sepenuhnya tidak terpengaruh.

"Pemisahan perhatian," kata Priya, setelah bug Lambda analitik kedua. "Prinsip yang sama pada tingkat infrastruktur seperti pada tingkat kode. Dua hal yang gagal secara berbeda tidak boleh berbagi domain kegagalan yang sama."

**Abstraksi prematur.**

Tiga bulan sebelum Series A, Leo telah mengusulkan membangun layanan konfigurasi restoran generik. Nimbus punya tiga jenis konfigurasi spesifik-restoran pada saat itu: pengaturan menu, parameter zona pengiriman, dan preferensi notifikasi. Layanan konfigurasi generik, Leo berargumen, akan memungkinkan mereka menambah jenis konfigurasi baru tanpa membangun logika penyimpanan dan pengambilan baru setiap kali.

Tim telah membangunnya. Dua minggu untuk mendesain model data. Satu minggu untuk mengimplementasikan layanan. Satu minggu lagi untuk memigrasikan tiga jenis konfigurasi yang ada ke dalamnya. Empat minggu total.

Pada saat mereka selesai membangun layanan konfigurasi generik, mereka punya... tiga jenis konfigurasi. Tiga yang sama yang mereka miliki sebelumnya. Layanan generik tidak menambah kemampuan baru; ia hanya membuat kemampuan yang ada lebih sulit dipahami. Skema key-value yang membuat layanan "generik" juga membuatnya tidak mungkin menambahkan validasi atau batasan tipe tanpa membangun schema registry di atasnya.

"Kita membangun framework untuk sebuah library," kata Tom, ketika dia menceritakan kisah investor kepada Leo.

"Apa artinya itu?" tanya Leo.

"Kita punya tiga buku. Kita membangun sistem manajemen perpustakaan untuk mengorganisirnya. Akan lebih baik hanya meletakkan tiga buku di rak."

Layanan konfigurasi telah dinonaktifkan diam-diam delapan bulan kemudian, ketika tim tumbuh cukup besar sehingga empat insinyur menghabiskan waktu non-sepele mempelajari cara kerjanya sebelum menemukan bahwa ia adalah wrapper tipis di sekitar tabel DynamoDB. Mereka bermigrasi kembali ke akses DynamoDB langsung dengan skema bertipe per jenis konfigurasi dalam dua hari.

"Empat minggu membangunnya," kata Tom. "Dua hari membatalkannya. Ditambah biaya berkelanjutan menjelaskannya ke setiap insinyur baru."

"Apa keputusan yang tepat?" tanya Priya.

"Bangun layanan konfigurasi ketika Anda punya lebih dari sepuluh jenis konfigurasi dan polanya jelas stabil," kata Tom. "Bukan ketika Anda punya tiga dan Anda berspekulasi tentang kebutuhan masa depan. Abstraksinya prematur. Kebutuhan yang dirancang untuknya tidak terwujud."

"Sudahkah kita memikirkan apa yang terjadi jika kita membangun abstraksi sebelum kita memahami ruang masalahnya?" tanya Priya.

"Kita baru saja menjelaskannya," kata Tom. "Anda menghabiskan waktu memelihara abstraksi yang berbiaya lebih dari masalah yang sedang diselesaikannya."

Maya menambahkan ini ke model mentalnya tentang anti-pola arsitektur: layanan generik yang dibangun untuk tiga kasus penggunaan. Pipeline yang terkopling. Keputusan right-sizing yang dibuat pada jendela observasi yang tidak mencukupi. Masing-masing adalah keputusan yang masuk akal secara lokal, pada saat itu, dengan informasi yang tersedia. Masing-masing ternyata salah dengan cara yang menjadi terlihat hanya nanti.

"Yang terlihat baik di atas kertas," katanya kepada Priya, "adalah yang paling banyak menghabiskan biaya Anda."

"Karena Anda tidak meninjaunya kembali," kata Priya. "Anda melihat desainnya, ia koheren, logikanya berlaku, dan Anda melanjutkan. Mode kegagalannya tidak terlihat sampai sistem berada di bawah beban atau tekanan yang tidak pernah dimodelkan versi kertasnya."

"Itulah mengapa tinjauan arsitektur penting," kata Maya. "Bukan karena peninjau tahu lebih banyak. Karena mereka akan menanyakan pertanyaan yang tidak terpikir oleh Anda."


## Ringkasan

Pertemuan investor berjalan baik. Bukan karena Maya telah menghafal struktur harga setiap layanan, tetapi karena dia bisa menjawab *mengapa* untuk setiap pilihan yang dibuat Nimbus. Jawaban "itu tergantung" yang dia berikan presisi, kondisional, dan berlandaskan pada empat pertanyaan yang sama yang telah dia tanyakan, dalam berbagai bentuk, selama dua tahun.

- **"Itu tergantung" adalah awal dari jawaban**, bukan akhirnya. Selalu selesaikan kalimat dengan kondisi yang menjadi sandarannya.
- Empat pertanyaan di bawah setiap trade-off arsitektur: pola akses, skala, konsekuensi kegagalan, batasan biaya.
- Pola yang bertahan: pemisahan perhatian, pertahanan berlapis, bayar sesuai yang Anda gunakan, optimalkan untuk kegagalan yang mungkin, ukur sebelum mengoptimalkan.
- **Cloud memperbesar keputusan** — yang baik dan yang buruk. Keputusan buruk on-premises menghabiskan seminggu; keputusan buruk di cloud bertumpuk bulanan, pada skala besar.
- Sertifikasi SAA-C03 menguji pengetahuan dan pengenalan pola. Pengalaman produksi mengubah pengetahuan itu menjadi penilaian.

## Tips Ujian

*SAA-C03 Domain: Cross-domain — semua domain*

Bab ini menutup konten ujian dari buku ini. Sebelum Anda mengikuti ujian:

**Tinjau layanan yang paling tidak Anda kuasai**:

- Bagi kebanyakan orang: Kinesis vs SQS (perbedaan stream vs queue)
- Jaringan VPC (route table, subnet, NAT Gateway, Internet Gateway)
- Logika evaluasi kebijakan IAM (explicit deny > explicit allow > implicit deny)
- Pemilihan kelas penyimpanan (ketahui kedelapan kelas penyimpanan S3 dan trade-off mereka)
- RDS vs Aurora vs DynamoDB untuk kasus penggunaan tertentu

**Ketahui struktur skenario khas ujian**:

SAA-C03 menyajikan persyaratan bisnis ("perusahaan membutuhkan ketersediaan 99,99%") dan meminta Anda mengidentifikasi arsitektur yang memenuhinya. Selalu baca persyaratannya, identifikasi batasan kunci, dan eliminasi opsi yang tidak memenuhinya.

**Latih identifikasi distractor**:

Setiap jawaban salah pada ujian salah karena alasan tertentu. Belajar mengidentifikasi *mengapa* setiap jawaban salah itu salah lebih berharga daripada menghafal jawaban yang benar.

**Ujian memberi imbalan pada pengenalan pola**:

- "Decouple" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Global low latency" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Kepatuhan/audit" → CloudTrail, Config, Security Hub, Macie
- "Optimasi biaya" → Spot Instances, Savings Plans, kebijakan siklus hidup, right-sizing

**Anda siap**. Bukan karena buku ini mencakup semuanya — tidak ada yang melakukannya. Tetapi karena Anda memahami prinsip-prinsipnya cukup baik untuk bernalar menuju jawaban bahkan ketika Anda tidak langsung mengenali skenario yang tepat.

## Latihan

**Latihan Akhir**

Tidak ada lagi pertanyaan ujian terstruktur setelah bab ini.

Sebagai gantinya: satu pertanyaan terbuka.

Sistem apa yang akan Anda bangun hari ini, mengetahui apa yang Anda ketahui?

Tuliskan. Sketsa arsitekturnya. Identifikasi layanannya. Catat trade-off yang akan Anda buat dan mengapa. Antisipasi mode kegagalannya.

Lalu bangun itu.

Itulah tugasnya. Tidak ada tenggat waktu. Tidak ada nilai. Hanya ada pekerjaannya.

## Adegan Pasca-Kredit

Investasi itu datang.

Series A. $4 juta. Cukup untuk berekspansi ke lima kota baru, melipattigakan tim teknik, dan membangun Nimbus Instant.

Malam itu, Maya berada di restoran keluarganya. Yang asli. Tempat di mana Nimbus dimulai, ketika dia menyadari mereka kehilangan pesanan karena telepon selalu sibuk.

Dia memesan arepa — hidangan yang sama yang selalu dia pesan.

Sementara dia menunggu, dia membuka laptopnya dan membaca bab pertama buku ini.

*"Di mana sebuah situs web tinggal?"*

Dia ingat tidak tahu jawabannya.

Dia tersenyum.

Dia menutup laptopnya.

Makanannya tiba.

Itu sempurna.

Di bab berikutnya: apa yang berubah ketika pekerjaannya bukan lagi membangun sistem — tetapi bertanggung jawab atasnya.
