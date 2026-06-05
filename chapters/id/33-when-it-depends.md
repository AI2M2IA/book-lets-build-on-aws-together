# Babat 33: Tergantung

Luangkanlah satu napas terakhir sebelum bab ini.

Anda telah mencapai akhir buku ini. Ini adalah sebuah kesimpulan dan sebuah awal — bab terakhir, dan hari pertama Anda akan membuat keputusan arsitektur secara mandiri.

Bab ini memiliki satu tugas: untuk jujur ​​dengan Anda tentang hal yang tidak pernah dikatakan dengan jelas.

**Pertanyaan**

Pada akhir hampir setiap diskusi arsitektur, seseorang pada akhirnya bertanya: "Apa jawaban yang benar?"

Dan jawaban yang paling berguna, menjengkelkan, jujur, dan salah paham dalam semua rekayasa perangkat lunak adalah:

**Itu tergantung.**

Tidak karena pertanyaan itu tidak dapat dijawab. Tidak karena ahli itu menghindari. Tetapi karena jawaban yang benar sebenarnya bergantung pada konteks yang tidak ada dalam pertanyaan.

Bab ini tentang belajar mengatakan "itu tergantung" dengan benar — yang berarti mampu menyelesaikan kalimat tersebut.

Bayangkan seorang dokter yang ditanya: "Apakah operasi adalah perawatan yang tepat?" Seorang dokter yang buruk mengatakan ya atau tidak tanpa memeriksa pasien. Seorang dokter yang baik mengatakan: "Itu tergantung — pada diagnosis, usia pasien, kondisi mereka yang lain, dan apa yang terjadi jika kita menunggu." Jawabannya bukan penghindaran. Ini adalah presisi. "Itu tergantung" diikuti oleh kalimat lengkap adalah hal yang paling berguna yang dapat dikatakan oleh seorang dokter — atau seorang arsitek —.

**Akhir dari Nimbus**

Dua tahun setelah permulaan. Maya berdiri di sebuah ruang konferensi di Seattle, mempresentasikan kepada sekelompok investor modal ventura.

Nimbus telah tumbuh: 947 mitra restoran. 18.000 pesanan harian. $2,1 juta dalam GMV bulanan. Tiga kota hidup, dua lagi sedang diluncurkan. Sebuah tim empat belas insinyur di dua zona waktu.

Para investor memiliki pertanyaan. Salah satu dari mereka — mitra teknis di dana tersebut — condong ke depan.

"Database apa yang Anda gunakan?" dia bertanya.

Maya tidak ragu-ragu.

"Untuk pesanan dan data pelanggan: Aurora PostgreSQL. Untuk katalog menu: DynamoDB. Untuk manajemen sesi dan caching: ElastiCache Redis. Untuk analisis: Athena di atas file Parquet S3, dengan Redshift untuk kueri dasbor frekuensi tinggi."

Dia mengangguk. "Mengapa Aurora untuk pesanan dan bukan DynamoDB?"

"Karena pesanan memiliki struktur relasional yang kompleks — mereka merujuk ke item menu, akun pelanggan, alamat restoran, metode pembayaran. Kami membutuhkan konsistensi transaksional di seluruh entitas. Database relasional adalah alat yang tepat untuk itu. Kekuatan DynamoDB adalah akses kunci-nilai throughput tinggi dengan skema fleksibel, yang merupakan pola akses katalog menu yang tepat."

Dia menulis sesuatu. "Bagaimana dengan penskalaan? Anda mengatakan 18.000 pesanan harian. Itu sekitar 12 per menit rata-rata. Bagaimana Anda merancang untuk puncak?"

"Pesanan makan malam Jumat adalah sekitar 25x rata-rata. Kami menskalakan secara horizontal dengan ECS dan Aurora Serverless v2, yang menangani lonjakan secara otomatis. CloudFront menyerap beban konten statis. API bersifat tanpa status, sehingga penskalaan horizontal bersih."

"Dan jika Aurora Serverless v2 tidak dapat menskalakan cukup cepat?"

"Kami memiliki hasil pengujian beban. Waktu-ke-skala untuk Aurora Serverless v2 kurang dari 10 detik. Lonjakan rata-rata Jumat kami membutuhkan waktu 8 menit dari garis dasar. Kami merasa nyaman dengan ruang kepala."

Mitra teknis itu melihat ke sisa investor. "Dia tahu sistemnya."

**Empat Pertanyaan di Bawah "Itu Tergantung"**

Setiap kompromi arsitektur mengurangi menjadi empat pertanyaan mendasar. Tidak setiap pertanyaan sama pentingnya untuk setiap keputusan, tetapi keempatnya selalu ada dalam permainan:

**1. Apa pola aksesnya?**

Bagaimana data ditulis dan dibaca? Seberapa sering? Oleh berapa banyak pengguna bersamaan? Dalam urutan apa? Dengan kunci apa?

Pertanyaan ini menentukan pemilihan teknologi pada tingkat paling mendasar. DynamoDB vs Aurora vs Redshift vs Athena — jawaban yang tepat bergantung hampir sepenuhnya pada pola akses.

**2. Apa skala?**

Tidak hanya sekarang — dalam 12 bulan, dalam 5 tahun. Perubahan skala memecahkan jawaban yang benar. Apa yang berfungsi pada 100 permintaan per hari akan rusak pada 100 juta. Apa yang berlebihan pada 10 pengguna diperlukan pada 10.000.

Dan skala bukan hanya lalu lintas. Ini adalah ukuran tim (arsitektur harus dapat dipelihara oleh tim yang Anda miliki). Ini adalah volume data. Ini adalah jangkauan geografis.

**3. Apa konsekuensi kegagalan?**

Jika ini rusak, apa yang terjadi? Apakah pengguna melihat halaman yang lambat? Apakah pesanan gagal? Apakah uang bergerak tidak benar? Apakah catatan medis seseorang menjadi tidak dapat diakses?

Konsekuensi menentukan berapa banyak yang Anda investasikan dalam keandalan. Halaman menu yang lambat membenarkan konsistensi eventual. Pembayaran yang gagal memerlukan penulisan sinkron dan konfirmasi eksplisit.

**4. Apa batasan biaya?**

Tidak hanya uang — juga kompleksitas operasional (yang merupakan bentuk biaya itu sendiri). Solusi yang membutuhkan tiga layanan tambahan mungkin secara teknis lebih unggul daripada satu yang lebih sederhana tetapi terlalu mahal untuk dipelihara dengan tim empat orang.

**"Itu Tergantung": Cara Menyelesaikan Kalimat**

Cara yang benar untuk mengatakan "itu tergantung" adalah dengan segera menyelesaikannya:

*"Haruskah kita menggunakan DynamoDB atau Aurora?"*

"Itu tergantung pada pola akses. Jika Anda membutuhkan akses kunci-nilai throughput tinggi dengan skema fleksibel, DynamoDB. Jika Anda membutuhkan konsistensi transaksional di seluruh entitas dengan kueri kompleks, Aurora."

*"Haruskah kita menggunakan Lambda atau EC2?"*

"Itu tergantung pada karakteristik beban kerja. Lambda untuk beban kerja berbasis kejadian, durasi pendek, variabel di mana biaya idle tidak penting. EC2 atau ECS untuk proses yang persisten, status, atau berjalan lama di mana kinerja yang dapat diprediksi lebih penting daripada biaya idle.”

*"Haruskah kita menggunakan Multi-AZ atau Multi-Region?"*

“Itu tergantung pada persyaratan RTO/RPO Anda dan model ancaman Anda. Multi-AZ melindungi terhadap kegagalan AZ (mode kegagalan AWS yang paling umum) dan menyediakan RPO ~0 dan RTO ~60 detik untuk RDS. Multi-Region melindungi terhadap kegagalan regional (jarang) dan melayani pengguna yang didistribusikan secara global. Jika Anda membutuhkan failover di bawah menit dari bencana regional, Multi-Region. Jika ketahanan AZ sudah cukup, Multi-AZ jauh lebih sederhana dan murah.”

“Itu tergantung” bukanlah akhir dari jawabannya. Itu adalah awal dari jawaban yang sebenarnya.

**Pola yang Tidak Berubah**

Meskipun pilihan teknologi tertentu terus berkembang—layanan baru meluncur, harga berubah, alternatif yang lebih baik muncul—beberapa pola mendasar tetap stabil selama beberapa dekade:

**Pemisahan perhatian**: Komponen yang melakukan hal yang berbeda harus independen. Perubahan pada satu tidak boleh memerlukan perubahan pada yang lain. Inilah mengapa Anda memutuskan dengan SQS, bukan panggilan langsung. Mengapa Anda menggunakan S3 untuk objek, bukan database. Mengapa lapisan web dan lapisan database terpisah.

**Pertahanan berlapis**: Tidak ada satu kontrol keamanan pun yang cukup. Anda memiliki IAM, grup keamanan, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Jika satu lapisan gagal, lapisan berikutnya menangkapnya.

**Bayar sesuai yang Anda gunakan, saat Anda menggunakannya**: Prinsip ekonomi mendasar dari cloud. Lambda menskalakan ke nol. Instance Spot menggunakan kapasitas cadangan. Kebijakan siklus hidup S3 memindahkan data dingin ke penyimpanan yang lebih murah. DynamoDB on-demand mengenakan biaya per permintaan. Pola-pola ini berbeda; prinsipnya sama.

**Optimalkan untuk kegagalan yang paling mungkin**: Multi-AZ pertama (kegagalan AZ terjadi). DR lintas-region kedua (kegagalan regional lebih jarang). Redundansi dalam-AZ (instansi ganda) sebelum kompleksitas lintas-region. Bangun untuk kegagalan yang realistis, bukan kegagalan katastropik tetapi tidak mungkin.

**Ukur sebelum mengoptimalkan**: Pendekatan Tom—ambil metrik CloudWatch, pahami pola sebenarnya, lalu buat keputusan—lebih berharga daripada optimasi prematur berdasarkan asumsi.

**Apa yang Tidak Dapat Diajarkan Buku Ini**

Mari kita langsung tentang hal itu mengenai batasannya.

Buku ini telah mengajari Anda:

- Apa yang dilakukan setiap layanan AWS utama
- Analogi yang membuat mereka intuitif
- Trade-off antara alternatif
- Pengetahuan ujian yang Anda butuhkan untuk SAA-C03
- Kerangka berpikir untuk membuat keputusan arsitektur

Buku ini tidak dapat mengajari Anda:

- **Insting Operasional**: Perasaan yang mengatakan "ini akan menjadi aneh di bawah beban" sebelum Anda melihatnya terjadi. Ini berasal dari mengoperasikan sistem nyata.
- **Penilaian Teknis di Bawah Tekanan**: Memutuskan apa yang harus dilakukan pada pukul 3 pagi ketika sistemnya mati dan Anda memiliki informasi yang tidak lengkap. Ini berasal dari insiden.
- **Intuisi Pemangku Kepentingan**: Mengetahui kapan untuk menentang persyaratan bisnis karena biaya teknis terlalu tinggi. Ini berasal dari pengalaman dengan kedua sisi teknis dan bisnis.
- **Pertanyaan yang Tepat untuk Konteks Spesifik**: Carlos dapat mengajukan pertanyaan yang tepat karena dia telah melihat masalah serupa puluhan kali. Pengetahuan ini diperoleh, bukan dibaca.

Anda belum selesai belajar. Anda baru saja memulai.

**Ujian Bukan Tujuan Akhir**

Anda memilih buku ini untuk mempersiapkan ujian AWS Solutions Architect Associate. Itu valid. Sertifikasi SAA-C03 nyata, dihargai, dan akan membuka pintu.

Tetapi ujian menguji pengetahuan dan pengenalan pola. Itu tidak menguji penilaian. Itu tidak menguji pengalaman operasional. Itu tidak menguji apa yang Anda lakukan ketika arsitektur yang Anda bangun berhenti berfungsi pada pukul 11 malam pada hari Jumat.

Sertifikasi adalah kredensial awal. Ketika Anda lulus ujian, Anda akan tahu cara kerja layanan AWS dan bagaimana mereka bergabung. Anda akan memiliki kerangka berpikir. Anda belum melakukannya.

Langkah selanjutnya setelah ujian: bangun sesuatu yang nyata. Terapkan. Operasikan. Saksikan gagal. Perbaiki. Habiskan uang dalam satu layanan dan pindahkan biaya ke tempat lain. Dapatkan panggilan di tengah malam dan buat keputusan dengan informasi yang tidak mencukupi.

Itulah bagaimana pengetahuan dalam buku ini menjadi penilaian.

**Jawaban Maya Akhir**

Di akhir pertemuan investor, mitra teknis memiliki satu pertanyaan lagi.

"Jika Anda memulai dari awal hari ini, mengetahui apa yang Anda ketahui sekarang, apa yang akan Anda lakukan secara berbeda?"

Maya mengambil waktu sejenak.

"Saya akan memulai dengan kode infrastruktur dari hari pertama," katanya. "Leo menerapkan instance EC2 pertama secara manual. Kami menghabiskan enam bulan untuk memigrasikan semuanya ke Terraform. Itu enam bulan utang teknis yang menghabiskan waktu nyata.”

"Apa lagi?"

"Saya akan lebih konservatif tentang layanan yang dikelola di awal. Kami menggunakan DynamoDB ketika database RDS sederhana akan cukup untuk beberapa bulan. Pola akses DynamoDB membutuhkan pemikiran berpengalaman yang belum kami miliki. Kami mendesain skema dua kali.”

"Jadi, lebih sederhana lebih baik di awal?"

“Ya.”

"Kesederhanaan itu selalu lebih baik *selalu*. Pertanyaannya selalu: apa hal ter sederhana yang menyelesaikan masalah sebenarnya, bukan masalah yang diperkirakan di masa depan? Kami menambahkan kompleksitas untuk menyelesaikan masalah yang belum kami miliki. Beberapa kompleksitas itu justru menimbulkan masalah sendiri."

Mitra teknis mencatatnya.

"Pertanyaan terakhir," katanya. "Apa hal terpenting yang Anda ketahui tentang membangun di AWS yang tidak Anda ketahui ketika Anda memulai?"

Maya memikirkan selama dua tahun. Insiden-insiden tersebut. Tinjauan biaya. Tinjauan Well-Architected. Pilihan arsitektur yang dibuat di bawah tekanan dan yang dibuat dengan hati-hati. Yang berhasil mereka lakukan dan yang harus mereka ulangi.

"Bahwa awan tidak menyelesaikan masalah arsitektur," katanya. "Ia justru memperbesar masalah tersebut. Keputusan buruk di lokasi on-premise mungkin hanya memakan waktu seminggu. Keputusan buruk di awan dapat memakan biaya setiap bulan, dalam skala besar, sampai seseorang menyadarinya."

Dia terdiam.

"Awan membuat keputusan yang baik berskala. Dan keputusan buruk juga."

**Penutup**

Anda telah mempelajari banyak hal. Layanan AWS. Kompromi-kompromi. Pola-pola.

Sekarang lakukan sesuatu dengan itu.

Bangun sesuatu. Sengaja buat kesalahan. Baca *post-mortem* (mereka bersifat publik — AWS, Cloudflare, GitHub, Stripe semuanya menerbitkannya). Bekerja dengan tim yang lebih baik dari Anda dalam hal yang paling Anda lemah.

Ujian SAA-C03 akan menguji apakah Anda memahami materi tersebut. Karier Anda akan menguji apakah Anda dapat menerapkannya.

Keduanya layak dilakukan. Tidak ada yang merupakan tujuan akhir.

Tidak ada tujuan akhir di bidang ini. Hanya ada masalah berikutnya, keputusan berikutnya, dan kebiasaan mengajukan pertanyaan yang tepat berikutnya.

Semoga berhasil.

Di bab berikutnya: apa yang berubah ketika pekerjaan itu bukan lagi membangun sistem — tetapi bertanggung jawab atasnya.

## Ringkasan

- **"It depends" adalah awal dari jawaban**, bukan akhirnya. Selalu selesaikan kalimat dengan kondisi yang bergantung padanya.
- Empat pertanyaan di bawah setiap pertukaran perdagangan arsitektur: pola akses, skala, konsekuensi kegagalan, batasan biaya.
- Pola-pola yang bertahan: pemisahan kekhawatiran, pertahanan mendalam, bayar sesuai yang Anda gunakan, optimalkan untuk kegagalan yang paling mungkin, ukur sebelum mengoptimalkan.
- **Awan memperbesar keputusan** — baik yang baik maupun yang buruk. Keputusan buruk di lokasi on-premise berharga satu minggu; keputusan buruk di awan mengkompensasi setiap bulan, dalam skala besar.
- Sertifikasi SAA-C03 menguji pengetahuan dan pengenalan pola. Pengalaman produksi mengubah pengetahuan itu menjadi penilaian.

## Tips Ujian

*SAA-C03 Domain: Tuntas — semua domain*

Bab ini menutup konten ujian dari buku ini. Sebelum Anda mengikuti ujian:

**Tinjau layanan yang paling tidak Anda kuasai**:

- Bagi kebanyakan orang: Kinesis vs SQS (perbedaan antara aliran vs antrean)
- Jaringan VPC (tabel rute, subnet, NAT Gateway, Internet Gateway)
- Evaluasi logika kebijakan IAM (penolakan eksplisit > izin eksplisit > penolakan implisit)
- Pemilihan kelas penyimpanan (ketahui enam kelas penyimpanan S3 dan trade-off mereka)
- RDS vs Aurora vs DynamoDB untuk kasus penggunaan tertentu

**Ketahui struktur skenario ujian yang khas**:

SAA-C03 menyajikan persyaratan bisnis ("perusahaan membutuhkan ketersediaan 99,99%") dan meminta Anda untuk mengidentifikasi arsitektur yang memenuhi persyaratan tersebut. Selalu baca persyaratan, identifikasi kendala utama, dan hilangkan opsi yang tidak memenuhinya.

**Latih identifikasi *distractor***:

Setiap jawaban salah pada ujian salah karena alasan tertentu. Belajar untuk *mengapa* setiap jawaban yang salah salah lebih berharga daripada menghafal jawaban yang benar.

**Ujian memberi penghargaan atas pengenalan pola**:

- "Decouple" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Global low latency" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Kepatuhan/audit" → CloudTrail, Config, Security Hub, Macie
- "Optimasi biaya" → Spot Instances, Savings Plans, kebijakan siklus hidup, ukur ukuran yang tepat

**Anda siap**. Bukan karena buku ini mencakup semuanya — tidak ada yang melakukannya. Tetapi karena Anda memahami prinsip-prinsipnya dengan cukup baik untuk bernalar menuju jawaban bahkan ketika Anda tidak langsung mengenali skenario yang tepat.

## Latihan

**Latihan Akhir**

Tidak ada lagi pertanyaan ujian terstruktur setelah bab ini.

Sebaliknya: satu pertanyaan terbuka.

Sistem apa yang akan Anda bangun hari ini, mengetahui apa yang Anda ketahui?

Tuliskan. Sketsa arsitekturnya. Identifikasi layanannya. Catat trade-off yang akan Anda buat dan mengapa. Antisipasi mode kegagalan.

Kemudian bangunkan itu.

Itulah tugasnya. Tidak ada tanggal jatuh tempo. Tidak ada nilai. Hanya ada pekerjaan itu.

## Adegan Setelah Kredit

Investasi itu datang.

Seri A. $4 juta. Cukup untuk memperluas ke lima kota baru, tiga kali lipat tim teknik, dan membangun Nimbus Instant.

Pada malam itu, Maya berada di restoran keluarga asalnya. Restoran asli. Restoran tempat Nimbus dimulai, ketika dia menyadari bahwa mereka kehilangan pesanan karena telepon selalu sibuk.

Dia memesan arepa — hidangan yang sama yang selalu dia pesan.

Sementara dia menunggu, dia membuka laptopnya dan membaca bab pertama dari buku ini.

*"Di mana sebuah situs web tinggal?"*

Dia ingat tidak tahu jawabannya.

Dia tersenyum.

Dia menutup laptopnya.

Makanan itu tiba.

Ini sempurna.

*Terima kasih telah membaca.*

*Sertifikasi AWS Solutions Architect Associate (SAA-C03) tersedia di pusat pengujian Pearson VUE dan secara online melalui sistem pengujian jarak jauh mereka. Kunjungi aws.amazon.com/certification untuk mendaftar.*

*Cerita tentang Nimbus adalah fiksi. Layanan AWS, model harga, dan praktik terbaik yang dijelaskan dalam buku ini adalah nyata. Kedua hal ini dapat berubah — AWS sering memperbarui layanannya. Selalu verifikasi harga dan kemampuan layanan saat ini di aws.amazon.com.*

*Semoga berhasil.*
