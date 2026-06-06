# Bab 20: Model Pekerja Lepas

Itu adalah Rabu siang yang tenang. Untuk sekali ini Priya melepas headphone-nya, dan kantor memiliki semacam dengungan rendah yang berarti semua orang sedang berkonsentrasi tetapi tak seorang pun panik. Leo membuka dasbor biaya di satu layar dan daftar instans EC2 di layar lain.

Bayangkan seorang pekerja lepas yang bekerja on-call. Mereka tidak duduk di meja dari jam sembilan sampai jam lima. Mereka menunggu. Telepon berdering, mereka mengerjakan pekerjaannya, mereka mengirim faktur, mereka kembali menunggu. Tidak ada pekerjaan, tidak ada biaya. Lonjakan permintaan, mereka menangani semuanya secara bersamaan. Anda hanya membayar untuk jam yang benar-benar dikerjakan—bukan jam yang mereka habiskan untuk tersedia.

Itulah model yang menjadi pokok bahasan bab ini.

Ada kehalusan di sini yang layak dipegang. Model tradisional adalah: rekrut seorang karyawan, bayar untuk 8 jam, dapatkan keluaran yang bervariasi. Model pekerja lepas adalah: bayar hanya ketika telepon berdering, dapatkan persis apa yang diminta. Untuk perusahaan dengan permintaan yang dapat diprediksi dan konstan, model karyawan lebih efisien—Anda tahu telepon akan berdering terus-menerus, jadi membayar per jam itu setara dan tidak ada overhead keterlibatan dan pelepasan. Untuk perusahaan dengan permintaan yang bervariasi, melonjak, atau jarang, model pekerja lepas jauh lebih murah.

AWS menawarkan model itu untuk komputasi—dan apakah itu masuk akal bergantung pada pola permintaan Anda. Pertanyaan pertama tidak pernah "apakah model ini bagus?" tetapi "seperti apa sebenarnya beban kerja saya?"

Untuk sebagian besar beban kerja yang lebih besar dari startup: campuran. Beberapa hal berjalan terus-menerus (server API, database). Beberapa hal berjalan hanya ketika dipicu (pemrosesan kejadian, pembuatan laporan, pengubahan ukuran gambar). Model pekerja lepas adalah untuk kategori kedua—dan Nimbus akan segera menemukan seberapa besar bagian tagihannya yang termasuk di sana.

---

Fan-out SQS/SNS telah men-dekupling alur pesanan, tetapi pekerja yang mengonsumsi antrian-antrian itu masih berjalan di instans EC2 yang menagih per jam—terlepas dari berapa banyak email yang sebenarnya mereka kirim. Arsitekturnya sudah benar; model biayanya masih bocor.

Priya memperhatikannya pertama kali.

"Layanan email," katanya. "Berapa banyak email yang kita kirim per hari?"

Leo memeriksa metrik. "Rata-rata 400 sehari. Puncak sekitar 1.200 pada Jumat malam."

"Dan instans EC2 yang menjalankan layanan email—berapa lama ia berjalan?"

"Selalu. 24/7."

"Bahkan pukul 3 pagi ketika kita mengirim nol email?"

Hening.

Leo memunculkan grafik CPU CloudWatch untuk instans EC2 layanan email. Grafik menunjukkan 18 jam operasi terus-menerus. Pada puncak Jumat: CPU di 38%, menangani lonjakan email. Setelah tengah malam: CPU turun ke 3%. Bertahan di sana sampai pesanan makan siang dimulai.

Tiga persen CPU selama 18 jam berturut-turut. Instans itu berjalan. Ia menagih. Ia tidak melakukan apa pun yang berarti.

"Kita membayar untuk sebuah komputer yang duduk di sana tidak melakukan apa-apa," kata Leo.

"Berapa jam sehari?"

Hening lagi.

"Sekitar 18."

Tom kini sangat memperhatikan.

"Dan itu bukan hanya layanan email," tambah Priya. "Layanan pengubahan ukuran gambar untuk foto restoran berjalan pada 1% CPU sebagian besar waktu. Ia hanya melonjak ketika sebuah restoran mengunggah menu baru. Yang terjadi, berapa, beberapa kali sehari per restoran?"

"Ya," Leo memastikan.

"Pekerjaan pembersihan malam yang menghapus file sementara—itu berjalan selama 4 menit pada pukul 2 pagi lalu duduk sepenuhnya menganggur selama 23 jam 56 menit."

"Juga ya."

Polanya sama di semua layanan Nimbus yang lebih kecil: komputasi dibayar 24 jam sehari, digunakan sebagian kecil darinya.

---

**Server Bukan Selalu Jawabannya**

Instans EC2 bersifat permanen. Anda menyalakannya dan ia berjalan sampai Anda menghentikannya—24 jam sehari, 7 hari seminggu, terlepas dari penggunaan sebenarnya. Untuk server web Anda (yang menangani lalu lintas di segala jam), itu benar. Untuk layanan email (yang mengirim lonjakan email lalu menganggur berjam-jam), itu boros.

Auto Scaling Group dapat menskalakan layanan email turun ke satu instans selama jam tidak sibuk. Tetapi satu instans tetap berjalan terus-menerus.

Inilah pertanyaan yang terus dikembalikan Tom ketika melihat tagihan: apa yang sebenarnya dilakukan setiap layanan selama 18 jam dengan 3% CPU itu? Bukan tidak ada apa-apa, secara teknis—instans itu menunggu, memeriksa kejadian, mempertahankan state-nya. Tetapi dari perspektif bisnis: tidak ada apa-apa. Layanan tidak memberikan nilai. Ia menagih.

Untuk beban kerja yang benar-benar menganggur sebagian besar waktu, instans EC2 yang selalu menyala adalah membayar sewa apartemen yang hanya Anda kunjungi di akhir pekan. Apartemen itu milik Anda; sewanya tidak berhenti.

Model pekerja lepas menyelesaikan ini sepenuhnya. Kode itu ada. Ia hanya tidak berjalan sampai ada alasan untuk menjalankannya. Tidak ada biaya menganggur. Tidak ada kapasitas yang dipesan. Tidak ada server yang menunggu di samping telepon.

Itulah premis dari **komputasi serverless**.

**AWS Lambda: Kode Tanpa Server**

**AWS Lambda** memungkinkan Anda menjalankan kode sebagai respons terhadap kejadian tanpa menyediakan atau mengelola server. Anda mengunggah sebuah fungsi, menentukan apa yang memicunya, dan Lambda menjalankannya ketika pemicu itu menyala.

Sebuah fungsi Lambda:

- Tidak memiliki state persisten (setiap invokasi independen)
- Berjalan hingga 15 menit per invokasi
- Menskala secara otomatis dari 0 hingga ribuan invokasi bersamaan
- Ditagih hanya ketika berjalan (per 1 ms eksekusi, dibulatkan ke atas, per GB memori yang dialokasikan)

Ketika tidak ada pemicu, Lambda tidak berbiaya apa pun. Ketika pemicu menyala, Lambda berjalan dan menagih. Ketika 10.000 pemicu menyala bersamaan, Lambda menjalankan 10.000 invokasi bersamaan. Penskalaannya otomatis dan hampir instan.

**Pemicu Kejadian: Apa yang Membangunkan Lambda**

Fungsi Lambda tidak berjalan sendiri—mereka merespons kejadian. Pemicu umum meliputi:

- **Antrian SQS**: Memproses pesan dari antrian. Lambda mem-poll antrian dan memanggil fungsi dengan batch pesan.
- **API Gateway**: Permintaan HTTP masuk. API Gateway memicu Lambda. Lambda menghasilkan respons.
- **Kejadian S3**: Sebuah file diunggah ke S3. Lambda memprosesnya (mengubah ukuran gambar, mengurai CSV, memvalidasi dokumen).
- **SNS**: Sebuah pesan dipublikasikan ke topic. Lambda diberi tahu.
- **DynamoDB Streams**: Sebuah record di DynamoDB berubah. Lambda memproses perubahan itu.
- **CloudWatch Events (EventBridge)**: Sebuah kejadian terjadwal (seperti cron job) berjalan pada waktu yang ditentukan.
- **ALB**: Sebuah permintaan HTTP tiba di load balancer. Lambda dapat menangani rute tertentu.

Untuk Nimbus, layanan email menjadi fungsi Lambda yang dipicu oleh antrian SQS-nya. Ketika sebuah pesan tiba di antrian, Lambda dipanggil dengan konten pesan, mengirim email melalui SES (Simple Email Service), dan keluar.

Nol server. Nol waktu menganggur. Nol biaya saat menganggur.

Pola Lambda + SQS layak diinternalisasi: SQS menangani antrian, daya tahan, logika percobaan ulang, dan DLQ. Lambda menangani pemrosesan. Anda mendapatkan manfaat dekupling SQS dengan ekonomi scale-to-zero dari Lambda. Tidak ada layanan yang melakukan pekerjaan yang lain. Mereka tersusun dengan rapi.

"Apa yang terjadi dengan pesan yang cacat di antrian?" tanya Priya. "Bisakah input buruk merusak Lambda dengan cara yang memengaruhi fungsi lain di akun?"

Invokasi Lambda terisolasi satu sama lain. Fungsi yang mogok tidak memengaruhi fungsi lain. Sebuah Lambda yang melempar pengecualian tak tertangani pada pesan yang cacat: pesan kembali ke antrian, mencoba ulang hingga batas yang dikonfigurasi, lalu pindah ke DLQ. Lambda itu sendiri tetap tersedia untuk pesan berikutnya. Validasi input di dalam handler Lambda tetap penting—untuk menangkap data cacat sebelum mencoba memprosesnya—tetapi satu pesan buruk tidak bisa menjatuhkan fungsi.

**Masalah Cold Start**

Fungsi Lambda berjalan di **lingkungan eksekusi**—kontainer kecil yang terisolasi. Ketika sebuah fungsi dipanggil:

1. AWS memeriksa apakah lingkungan eksekusi yang hangat tersedia (yang menangani invokasi baru-baru ini)
2. Jika hangat: fungsi langsung berjalan
3. Jika dingin: AWS menginisialisasi lingkungan eksekusi baru—mengunduh kode Anda, memulai runtime, menjalankan kode inisialisasi Anda—lalu menjalankan fungsi

Sebuah **cold start** menambahkan latensi 100ms hingga beberapa detik tergantung runtime (Java dan .NET memiliki cold start lebih lama daripada Python dan Node.js) dan ukuran paket kode Anda.

Anda mungkin bertanya-tanya: jika Lambda memulai dari awal setiap kali, bukankah itu membuatnya lebih lambat daripada server yang sudah berjalan? Ya—kadang. Itulah masalah cold start, dan itu penting untuk API yang menghadap pengguna dan sensitif waktu. Itu tidak penting sama sekali untuk pekerjaan latar belakang di mana pengguna sudah menerima konfirmasi mereka. Cold start 200ms pada layanan email yang berjalan di latar belakang tidak terlihat oleh siapa pun.

Untuk pemrosesan asinkron (pengiriman email, pengubahan ukuran gambar), cold start tidak terlihat oleh pengguna.

Untuk API sinkron (permintaan HTTP di mana pengguna menunggu respons), cold start dapat menyebabkan respons lambat sesekali.

**Mitigasi**:

- **Provisioned concurrency**: Memanaskan terlebih dahulu sejumlah lingkungan eksekusi tertentu. Mereka selalu siap. Anda membayar ini bahkan ketika mereka tidak memproses permintaan.
- **Ukuran paket lebih kecil**: Kode yang lebih kecil diinisialisasi lebih cepat.
- **Invokasi pemanasan**: Ping terjadwal untuk menjaga fungsi tetap hangat (pendekatan umum tetapi kurang elegan).
- **Pilih runtime yang tepat**: Python dan Node.js cold start lebih cepat daripada Java.

**Investigasi Cold Start yang Nyata**

Dua minggu setelah migrasi Lambda, Leo mendapat pesan Slack dari mitra restoran: "Konfirmasi pesanan kadang memakan 3 detik. Biasanya cepat. Apa yang terjadi?"

Leo memunculkan metrik CloudWatch untuk fungsi Lambda. Di grafik "Duration", ia bisa melihat sebuah pola: invokasi pertama setelah jeda lebih dari 15-20 menit akan melonjak ke 2.800-3.200 milidetik. Invokasi berikutnya: 180-220 milidetik.

Cold start klasik.

Ia menarik trace X-Ray untuk salah satu invokasi 3-detik itu. Lini masa menunjukkannya dengan jelas:

- Fase inisialisasi: 2.640ms (mengunduh kode fungsi, memulai runtime Node.js, menjalankan kode inisialisasi tingkat modul)
- Eksekusi fungsi handler: 290ms

Fase inisialisasi adalah masalahnya. Ia melihat kode inisialisasi. Fungsi itu mengimpor SDK besar, menginisialisasi koneksi database, dan memuat konfigurasi dari AWS Secrets Manager—semua saat startup.

"Sebagian inisialisasi ini hanya perlu terjadi sekali per lingkungan eksekusi," kata Leo. "Tetapi itu terjadi pada setiap cold start."

Ia merestrukturisasi kode Lambda untuk menginisialisasi koneksi database di luar fungsi handler (sehingga digunakan ulang lintas invokasi hangat) dan mengurangi ukuran paket dengan menghapus modul SDK yang tidak terpakai. Ia juga beralih dari membundel seluruh AWS SDK menjadi mengimpor hanya layanan spesifik yang ia butuhkan.

Setelah optimisasi:

- Durasi cold start: 1.100ms (masih ada, tetapi tidak separah sebelumnya)
- Invokasi hangat: 165ms

Cold start 1,1 detik masih terjadi sesekali. Untuk layanan email (asinkron, penundaan yang menghadap pengguna tidak terlihat), ini dapat diterima. Untuk Lambda notifikasi restoran (menghadap pelanggan, dipesan dari tablet), Priya mendorong provisioned concurrency: dua lingkungan yang sudah dipanaskan selalu siap.

"Berapa biayanya per bulan?" tanya Tom.

Dua lingkungan provisioned concurrency pada 256MB: sekitar $5,40/bulan. Lonjakan latensi berhenti.

**Harga Lambda: Mengapa Tom Tersenyum**

Harga Lambda memiliki dua komponen:

1. **Biaya permintaan**: $0,20 per juta invokasi
2. **Biaya durasi**: $0,0000166667 per GB-detik (memori yang dialokasikan × detik berjalan)

Satu juta permintaan pertama per bulan gratis (selalu, bukan hanya di tahun pertama).

"Berapa biayanya per bulan?" tanya Tom sebelum Leo bisa membuka kalkulator.

Tom melakukan perhitungan untuk layanan email sendiri:

- Asumsikan setiap hari adalah Jumat—kasus terburuk: 1.200 email per hari × 30 hari = 36.000 invokasi per bulan
- Setiap invokasi memakan ~2 detik pada memori 256MB
- Durasi: 36.000 × 2 × 0,25GB × $0,0000166667 = $0,30/bulan
- Permintaan: 36.000 << 1.000.000 (tier gratis) = $0,00/bulan

"Dan 18.000 GB-detik itu jauh di dalam 400.000 GB-detik durasi yang selalu gratis," tambah Tom. "Jadi biaya sebenarnya akan nol. Tetapi saya mengabaikan tier gratis dengan sengaja—saya ingin tahu biaya unit yang sebenarnya."

Instans EC2 untuk layanan email: $18/bulan.

"Saya sudah men-deploy-nya—oh." Leo menghentikan dirinya. Ia telah mendorong Lambda layanan email ke produksi sebelum menyelesaikan konfigurasi DLQ. "Beri saya lima menit."

Tom diam sejenak. Lalu: "Kita harus melakukan ini untuk segalanya."

**Apa yang Lambda Kuasai (dan Apa yang Tidak)**

"Tunggu—tapi *mengapa* kita tidak sekadar menggunakan Lambda untuk segalanya, kalau begitu?" tanya Maya. "Jika ia lebih murah dan menskala otomatis, apa tangkapannya?"

"Batas 15 menit," kata Leo. "Dan cold start untuk apa pun yang menghadap pengguna. Dan ketiadaan state—Anda tidak bisa menyimpan apa pun di memori antar-invokasi."

Jika beban kerja Anda melonjak, berbasis kejadian, dan selesai di bawah 15 menit, Lambda akan berbiaya sebagian kecil dari instans EC2 yang selalu menyala—tetapi jika beban kerja Anda adalah pekerjaan pemrosesan data berdurasi panjang yang mendekati atau melebihi batas 15 menit, Lambda adalah alat yang salah dan Anda akan membutuhkan ECS, Batch, atau pendekatan berbasis EC2.

Lambda sangat baik untuk:

- **Pemrosesan berbasis kejadian**: Merespons kejadian (unggahan file, pesan antrian, tugas terjadwal)
- **Tugas berdurasi singkat**: Pemrosesan yang selesai jauh dalam 15 menit
- **Lalu lintas yang melonjak dan tak terduga**: Lambda menskala dari 0 ke ribuan secara instan—tanpa pra-penyediaan
- **Operasi yang jarang**: Sebuah laporan yang berjalan pukul 2 pagi setiap hari. Sebuah pekerjaan pembersihan yang berjalan mingguan.
- **Kode penghubung**: Fungsi kecil yang memindahkan data antar-layanan

Anda mungkin bertanya-tanya: apa yang terjadi pada penskalaan Lambda ketika lonjakan mendadak 10.000 kejadian tiba bersamaan? Batas konkurensi default Lambda adalah 1.000 eksekusi bersamaan per akun. Jika 10.000 kejadian tiba sekaligus, hingga 1.000 invokasi berjalan langsung; sisanya menunggu di antrian SQS (jika dipicu via SQS) dan diproses saat kapasitas terbebaskan. Ini biasanya baik-baik saja untuk pemrosesan berbasis antrian. Untuk kasus penggunaan yang sensitif latensi, batas lonjakan Lambda (laju awal di mana eksekusi bersamaan baru ditambahkan) dapat menyebabkan throttling singkat selama lonjakan mendadak—provisioned concurrency menghindari ini dengan kapasitas yang sudah dialokasikan.

Untuk layanan email Nimbus pada skala mereka saat ini, 1.000 invokasi bersamaan jauh lebih dari yang akan mereka butuhkan. Tetapi itu adalah batasan yang tepat untuk diketahui sebelum Anda mencapainya.

Lambda buruk untuk:

- **Proses berdurasi panjang**: Batas 15 menit adalah dinding keras
- **Aplikasi stateful**: Fungsi Lambda stateless secara desain—setiap invokasi independen
- **API throughput tinggi, latensi rendah**: Cold start dapat menyebabkan lonjakan latensi; provisioned concurrency memitigasi ini tetapi menambah biaya
- **Aplikasi yang membutuhkan koneksi persisten**: Lambda tidak bisa mempertahankan connection pool database berumur panjang dengan mudah (meskipun alat pooling koneksi seperti RDS Proxy membantu)
- **Server web tradisional**: Mungkin, tetapi bukan kecocokan yang natural

**Dinding 15 Menit: Ketika Lambda Adalah Alat yang Salah**

Tiga minggu setelah migrasi, Leo mencoba memindahkan satu beban kerja lagi ke Lambda: generator laporan analitik malam. Ia menarik data pesanan dari database, menggabungkannya dengan metadata restoran, menghitung statistik, dan menghasilkan PDF.

Pada malam pertama, invokasi Lambda gagal dengan kesalahan timeout.

"Pembuatan laporan memakan 17 menit," kata Leo keesokan paginya.

"Maksimum Lambda adalah 15," kata Priya.

"Ya. Saya tahu itu sekarang."

Ia telah memeriksa waktu pemrosesan rata-rata (8 menit) dan mengasumsikan Lambda akan bekerja. Ia tidak memeriksa ekornya—malam-malam ketika volume data lebih tinggi dan kueri memakan waktu lebih lama. Pada malam-malam itu, 15 menit tidak cukup.

"Jadi laporannya hanya... tidak dihasilkan?" tanya Maya.

"Benar. Tidak ada notifikasi kesalahan. Tidak ada laporan parsial. Hanya keheningan."

"Saya sudah men-deploy-nya—oh," kata Leo.

Inilah salah satu cara spesifik Lambda gagal tanpa anggun: timeout tidak menghasilkan keluaran, tidak ada pesan kesalahan di aplikasi, hanya log kesalahan CloudWatch. Jika Anda tidak memantau kesalahan timeout Lambda secara khusus, Anda mungkin tidak menyadarinya selama berhari-hari.

Solusinya: pindahkan generator laporan ke ECS Fargate—kontainer tanpa mengelola server; bab berikutnya—yang tidak memiliki batas waktu. Lambda adalah alat yang salah untuk beban kerja yang mungkin melebihi 15 menit bahkan sesekali. Pelajarannya bukan "Lambda buruk." Pelajarannya adalah "Lambda adalah alat yang tepat untuk beban kerja yang sesuai dengan batasannya—dan sumber kegagalan yang mengejutkan ketika tidak."

**RDS Proxy: Connection Pooling untuk Lambda**

Sifat stateless Lambda menciptakan masalah database tertentu.

Ketika sebuah instans EC2 terhubung ke RDS, ia mempertahankan connection pool persisten. Aplikasi menggunakan ulang koneksi dari pool. RDS dapat menangani, katakanlah, 200 koneksi bersamaan.

Ketika Lambda menangani 500 invokasi bersamaan, setiap invokasi mencoba membuka koneksi database-nya sendiri. Itu 500 koneksi baru—membanjiri database yang mendukung 200.

**Amazon RDS Proxy** berada di antara fungsi Lambda dan RDS, mempertahankan connection pool persisten dan memultipleks koneksi Lambda yang berumur pendek melaluinya.

Alih-alih: invokasi Lambda → koneksi RDS baru (untuk masing-masing dari 500 invokasi bersamaan)

Dengan RDS Proxy: invokasi Lambda → RDS Proxy → pool berisi 20 koneksi RDS persisten

"Proxy membutuhkan kredensial RDS," kata Priya. "Di mana itu disimpan? Apakah ia menyimpannya?"

RDS Proxy menyimpan kredensial di Secrets Manager dan merotasinya secara otomatis. Peran IAM fungsi Lambda memberinya akses ke proxy (menggunakan autentikasi IAM), bukan ke kredensial RDS secara langsung. Kredensial tidak pernah terekspos ke kode Lambda.

"Jadi fungsi Lambda mengautentikasi via IAM," Leo memastikan, "dan proxy menangani kredensial database yang sebenarnya."

Untuk Lambda pemrosesan pesanan Nimbus (yang mengkueri RDS untuk validasi pesanan), RDS Proxy menghilangkan kehabisan connection pool selama puncak lalu lintas Jumat.

**Lambda Layers: Dependensi Bersama**

Lambda layanan email, Lambda notifikasi, dan Lambda laporan semuanya berbagi kode library internal yang sama: fungsi utilitas untuk memformat mata uang, membersihkan input, logging dalam format standar.

Tanpa Lambda Layers, kode bersama itu harus dibundel ke dalam paket deployment setiap fungsi. Tiga fungsi, tiga salinan dari library 2MB yang sama. Ketika library diperbarui, ketiga fungsi membutuhkan deployment baru.

**Lambda Layers** adalah paket terpisah yang dapat direferensikan fungsi Lambda saat runtime. Library bersama diekstrak ke dalam sebuah layer. Ketiga fungsi mereferensikan layer itu. Pembaruan ke library bersama berarti memperbarui versi layer—bukan men-deploy ulang ketiga fungsi.

Manfaat tambahan: paket fungsi individual yang lebih kecil berarti cold start yang lebih cepat.

"Satu hal yang tidak diubah layer: peran eksekusi," kata Priya. "Jika sebuah Lambda memiliki izin terlalu luas, fungsi yang disusupi dapat mengakses segalanya di akun."

"Prinsip yang sama dengan peran EC2," kata Leo. "Hak istimewa minimum. Setiap Lambda hanya mendapat izin yang benar-benar ia butuhkan."

"Jadi Lambda bukan pengganti EC2," kata Maya. "Ia adalah alat berbeda untuk pekerjaan berbeda."

"API web Nimbus tetap di EC2 atau ECS," Leo memastikan. "Layanan email, pengubah ukuran gambar, generator laporan malam, pembersih log—itu pindah ke Lambda."

**Filosofi Serverless**

Lambda adalah bagian dari konsep yang lebih luas: **serverless**—membangun aplikasi di mana Anda tidak mengelola server, hanya kode.

Tumpukan Nimbus yang sepenuhnya serverless mungkin terlihat seperti:

- API Gateway + Lambda (alih-alih EC2 dengan server web)
- DynamoDB (alih-alih RDS—juga serverless, tanpa manajemen server)
- S3 (aset statis—secara inheren serverless)
- SNS + SQS (perpesanan—serverless)
- Lambda (semua pemrosesan latar belakang)

Daya tariknya: Anda menulis kode; AWS mengelola yang lainnya. Tidak ada patching, tidak ada konfigurasi penskalaan, tidak ada perencanaan kapasitas.

## Amazon API Gateway

Daftar pemicu Lambda menyebut API Gateway sekilas: permintaan HTTP masuk, API Gateway memicu Lambda. Itu akurat, tetapi meremehkan apa sebenarnya API Gateway itu.

"Tunggu—tapi *mengapa* kita menempatkan API Gateway di depan Lambda?" tanya Maya. "Tidak bisakah Lambda menerima permintaan HTTP secara langsung?"

Lambda dapat menerima permintaan HTTP via function URL—endpoint HTTPS yang sederhana dan langsung. Tetapi ia tidak menangani perutean, otorisasi, throttling, caching, atau transformasi permintaan. Untuk API produksi, kekhawatiran-kekhawatiran itu ada terlepas dari apakah backend Anda Lambda atau EC2.

**Amazon API Gateway** adalah layanan yang sepenuhnya terkelola untuk membuat, men-deploy, dan mengelola API pada skala apa pun. Ia menangani manajemen lalu lintas, otorisasi, throttling, caching, dan pemantauan sehingga fungsi Lambda Anda (atau EC2, atau backend HTTP apa pun) tidak perlu mengimplementasikannya sendiri.

**Tiga jenis API:**

**REST API** adalah opsi yang paling kaya fitur. Ia mendukung transformasi permintaan dan respons, caching respons, usage plan yang terikat ke API key, dan semua jenis otorisasi. Sebagian besar pertanyaan ujian SAA-C03 yang menyebut API Gateway melibatkan REST API.

**HTTP API** lebih sederhana dan lebih murah—biaya kira-kira 70% lebih rendah dari REST API. Ia dirancang untuk backend Lambda dan proxy HTTP. Ia mendukung otorisasi OIDC dan OAuth 2.0 tetapi tidak transformasi permintaan atau caching. Jika Anda tidak membutuhkan fitur lanjutan REST API, HTTP API adalah pilihan yang tepat.

**WebSocket API** mengelola koneksi dua arah yang persisten. API Gateway menangani siklus hidup koneksi dan merutekan pesan ke Lambda berdasarkan konten pesan. Fungsi Lambda tidak perlu mengelola state socket—API Gateway yang melakukannya.

**Opsi otorisasi** (yang diuji ujian):

**Cognito User Pool authorizer** memvalidasi JWT dari Cognito User Pool. Tidak memerlukan Lambda. API Gateway memeriksa token itu sendiri. Jika valid, permintaan lolos.

**Lambda authorizer** menjalankan fungsi Lambda Anda sendiri untuk memvalidasi token—JWT kustom, token OAuth dari penyedia identitas pihak ketiga, API key dalam format proprietary. Lambda mengembalikan kebijakan IAM. Jika kebijakan mengizinkan tindakan, permintaan berlanjut.

**API key** adalah kunci sederhana yang diteruskan dalam header permintaan. API key untuk pembatasan laju per klien, bukan untuk autentikasi. Jangan gunakan mereka sebagai mekanisme keamanan—mereka bukan rahasia, mereka adalah pengidentifikasi.

**Throttling dan usage plan:**

Secara default, API Gateway mengizinkan 10.000 permintaan per detik di tingkat akun (batas lunak), dengan lonjakan 5.000. Lampaui itu dan klien menerima `429 Too Many Requests`—backend Anda bahkan tidak pernah merasakannya. Ketika Anda membutuhkan batas per klien, Anda membuat usage plan: lampirkan ke API key, atur laju permintaan dan kuota harian atau bulanan. Lonjakan satu klien tidak mengonsumsi alokasi klien lain.

Dua angka yang layak diingat: payload maksimum adalah **10 MB**, dan timeout integrasi default adalah **29 detik**—jika backend Anda memakan waktu lebih lama, gateway menyerah. (Sejak 2024, timeout itu dapat dinaikkan melampaui 29 detik untuk REST API Regional dan privat via peningkatan kuota—tetapi default 29 detik masih yang diharapkan ujian.) API Gateway adalah untuk API request/response, bukan pekerjaan berdurasi panjang; untuk yang itu, serahkan pekerjaan ke SQS atau Step Functions dan balas segera.

"Berapa biaya ini per bulan?" tanya Tom.

Untuk REST API: $3,50 per juta panggilan API, ditambah $0,09 per GB transfer data. Untuk lalu lintas kecil-hingga-menengah, ia pada dasarnya gratis. Untuk API bervolume tinggi, titik harga HTTP API yang lebih rendah menjadi berarti.

Leo menunjuk daftar pemicu Lambda yang ia tulis sebelumnya. "Jadi API Gateway bukan hanya cara untuk memicu Lambda. Ia adalah hal yang membuat Lambda terasa seperti API sungguhan."

"Fungsi Lambda menangani logika bisnis," kata Priya. "API Gateway menangani segalanya di depannya—perutean, autentikasi, throttling, pemantauan. Masing-masing melakukan satu hal."

"Dan bagaimana jika seseorang mencoba memanggil Lambda secara langsung, melewati API Gateway?"

"Kebijakan eksekusi Lambda hanya mengizinkan invokasi dari API Gateway," kata Priya. "Kebijakan berbasis resource pada Lambda menolak segala yang lain."

Realitanya: serverless memiliki kompleksitas operasionalnya sendiri—men-debug fungsi Lambda terdistribusi, mengelola cold start, memahami batas konkurensi. Ia tidak lebih sederhana, hanya berbeda.

"Tunggu—tapi *mengapa* serverless 'tidak lebih sederhana'?" tanya Maya. "Seluruh promosinya adalah bahwa ia menghilangkan beban operasional."

"Ia menghilangkan sebagian beban operasional," kata Leo. "Penyediaan infrastruktur, patching, konfigurasi penskalaan—itu hilang. Yang tersisa berbeda: manajemen cold start, distributed tracing lintas fungsi yang tidak bisa Anda SSH, batas konkurensi, mengelola versi dan alias fungsi, memahami bagaimana pembaruan Layer menyebar, menangani timeout 15 menit dengan anggun."

"Jadi bebannya bergeser," kata Priya. "Dari operasi infrastruktur ke operasi fungsi."

"Ya. Untuk banyak beban kerja—terutama yang berbasis kejadian, kecil, melonjak—itu adalah pertukaran yang lebih baik. Untuk server aplikasi berdurasi panjang yang perlu diinteraksi dan di-debug insinyur, EC2 atau kontainer seringkali tetap menjadi pilihan yang tepat."

Anda mungkin bertanya-tanya: apakah serverless adalah masa depan, dan haruskah segalanya pada akhirnya pindah ke Lambda? Jawaban jujurnya adalah bahwa itu bergantung pada beban kerja. Serverless telah mendominasi pemrosesan berbasis kejadian. Ia telah membuat terobosan signifikan dalam API HTTP (via API Gateway + Lambda). Ia belum menggantikan server aplikasi yang selalu menyala, pemrosesan batch berdurasi panjang, atau layanan stateful—dan mungkin tidak akan, karena kasus penggunaan itu tidak mendapat manfaat dari model Lambda. Pertanyaan alat yang tepat tidak pernah hilang; ia hanya berlaku untuk opsi berbeda dari waktu ke waktu.

## Kekuatan dan Keterbatasan

**Mengapa Lambda kuat**:

- Bayar-per-pemakaian sejati—nol biaya saat menganggur
- Penskalaan otomatis tanpa konfigurasi
- Tidak ada server untuk di-patch atau dirawat
- Tier gratis yang murah hati (1 juta permintaan per bulan, gratis selamanya)
- Integrasi erat dengan seluruh AWS
- RDS Proxy dan Lambda Layers mengatasi dua dari masalah Lambda yang paling umum (connection pooling dan berbagi kode) tanpa membutuhkan perubahan arsitektur

**Di mana hal ini menjadi rumit**:

- Cold start itu nyata dan membutuhkan penanganan cermat untuk beban kerja yang sensitif latensi
- Batas eksekusi 15 menit mengecualikan tugas berdurasi panjang
- Men-debug lebih sulit—tidak ada server persisten untuk di-SSH
- Desain stateless membutuhkan eksternalisasi semua state (database, cache, S3)
- Batas konkurensi (default 1.000 invokasi bersamaan per akun) dapat throttle pada skala besar
- Fungsi Lambda yang terhubung VPC memiliki latensi tambahan dan masalah cold start

**Memantau Lambda Tanpa SSH**

Pertama kali sesuatu rusak di fungsi Lambda, insting Leo adalah SSH masuk dan melihat prosesnya. Tidak ada proses untuk di-SSH. Lingkungan eksekusi Lambda bersifat sementara dan tidak dapat diakses.

Men-debug Lambda membutuhkan mempelajari perangkat berbeda:

**CloudWatch Logs**: Setiap invokasi Lambda menulis stdout/stderr-nya ke CloudWatch Log Group. Logging terstruktur (format JSON) membuatnya dapat difilter. Field paling berguna: nama fungsi, ID invokasi, durasi, jenis kesalahan, dan correlation ID kustom Anda.

**CloudWatch Metrics**: Lambda memublikasikan metrik Invocations, Duration, Errors, Throttles, dan ConcurrentExecutions secara otomatis. Menyetel alarm pada Errors dan Throttles seharusnya menjadi hari pertama dari setiap deployment Lambda.

**AWS X-Ray**: Distributed tracing untuk Lambda. Menambahkan sedikit overhead (2-5ms per invokasi) tetapi memberi Anda flame graph tentang di mana waktu dihabiskan di dalam fungsi. Penting untuk analisis cold start—X-Ray menunjukkan fase inisialisasi secara terpisah dari fase handler.

**Lambda Insights**: Pemantauan yang ditingkatkan untuk Lambda, tersedia via CloudWatch Lambda Insights. Menambahkan penggunaan memori, waktu CPU, dan durasi init ke metrik standar. Berbiaya sedikit ekstra tetapi sepadan untuk fungsi produksi.

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui lingkungan eksekusi?" tanya Priya. "Fungsi Lambda berjalan di kontainer terisolasi, tetapi jika dependensi memiliki kerentanan, bisakah penyerang mendapatkan eksekusi kode di dalam Lambda kita?"

Mitigasinya: jaga dependensi minimal dan terkini (analisis cold start sudah mendorong Leo mengurangi ukuran paket), gunakan Lambda Layers untuk memversi library bersama, dan berikan peran eksekusi Lambda izin minimum yang dibutuhkan. Jika fungsi hanya bisa menulis ke satu bucket S3 tertentu dan mengkueri satu tabel DynamoDB tertentu, radius ledakan fungsi yang disusupi terbatas pada persis itu.

"Hak istimewa minimum untuk peran eksekusi Lambda bukan opsional," kata Priya. "Itulah yang membatasi kerusakan ketika sesuatu berjalan salah."

Ia benar. Dan seperti kebanyakan saran keamanan, itu juga sekadar rekayasa yang baik.

## Ringkasan

Arsitektur SQS/SNS dari bab 19 memisahkan kekhawatiran menerima pekerjaan dan memprosesnya. Lambda membawanya lebih jauh: ia memisahkan kekhawatiran memproses pekerjaan dan membayar kapasitas untuk melakukannya.

- **AWS Lambda** menjalankan kode sebagai respons terhadap kejadian tanpa mengelola server.
- **Bayar per pemakaian**: ditagih per invokasi dan per 1 ms eksekusi (dibulatkan ke atas). Nol biaya saat menganggur.
- Menskala secara otomatis dari 0 hingga ribuan invokasi bersamaan.
- **Cold start**: latensi inisialisasi ketika tidak ada lingkungan eksekusi hangat. Dimitigasi dengan provisioned concurrency atau runtime ringan.
- **Lambda Layers**: paket kode bersama yang dapat direferensikan beberapa fungsi, mengurangi duplikasi dan ukuran paket.
- **RDS Proxy**: menyelesaikan masalah kehabisan koneksi Lambda dengan mempertahankan connection pool database persisten antara Lambda dan RDS.
- **Pemantauan**: gunakan CloudWatch Logs, Metrics, X-Ray tracing, dan Lambda Insights—tidak ada server untuk di-SSH.
- Terbaik untuk: beban kerja berbasis kejadian, berdurasi singkat, melonjak, atau jarang.
- Tidak ideal untuk: tugas berdurasi panjang (batas keras 15 menit), aplikasi stateful, API throughput tinggi latensi rendah tanpa provisioned concurrency.
- **Serverless** adalah filosofi desain—Anda mengelola kode, bukan infrastruktur. Kompleksitas operasional bergeser, bukan menghilang.

## Tips Ujian

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Lambda + S3**: Pola klasik—file diunggah ke S3 memicu Lambda untuk pemrosesan (pembuatan thumbnail, pemindaian virus, transformasi data). Tidak diperlukan server.
- **Lambda + SQS**: Lambda mem-poll SQS dan memproses batch. SQS menyediakan mekanisme retry/DLQ. Lambda menyediakan pemrosesan.
- **Lambda + API Gateway**: API HTTP serverless. API Gateway menangani perutean, autentikasi, throttling. Lambda menangani logika bisnis.
- **Jenis API Gateway:** REST API = fitur penuh, transformasi permintaan, caching, usage plan. HTTP API = lebih sederhana, lebih murah, hanya OIDC/OAuth. WebSocket API = koneksi dua arah persisten. **Otorisasi:** Cognito authorizer = validasi Cognito JWT secara native. Lambda authorizer = logika validasi token kustom. API key = pembatasan laju per klien (bukan autentikasi). Pemicu ujian: "REST API serverless" → API Gateway + Lambda.
- **Sinyal cold start**: "lonjakan latensi pada permintaan pertama," "waktu respons tidak konsisten" → cold start. Solusi: provisioned concurrency (berbiaya uang), paket lebih kecil, runtime lebih ringan.
- **Batas eksekusi**: Maksimum 15 menit. Memori maksimum 10GB. Penyimpanan sementara /tmp 512MB secara default (dapat dikonfigurasi hingga 10GB). Batas-batas ini muncul dalam skenario ujian.
- **Kesalahan timeout Lambda bersifat diam-diam**: Jika fungsi Lambda timeout, ia menghasilkan kesalahan CloudWatch tetapi tidak ada respons kesalahan di tingkat aplikasi. Pantau kesalahan Lambda Timeout CloudWatch secara eksplisit. Inilah cara generator laporan 17-menit Leo gagal pada malam pertamanya tanpa alarm tingkat aplikasi apa pun.
- **Cold start VPC Lambda**: Fungsi Lambda di dalam VPC memiliki latensi cold start tambahan (penyediaan ENI). AWS memperbaiki ini secara signifikan dengan Hyperplane ENI, tetapi cold start VPC Lambda masih lebih lambat daripada non-VPC. Hindari VPC untuk fungsi Lambda yang tidak membutuhkan resource VPC (yaitu, tidak terhubung ke RDS, ElastiCache, atau resource khusus-VPC lainnya).
- **Konkurensi Lambda**: Default 1.000 eksekusi bersamaan per akun (dapat ditingkatkan). **Reserved concurrency**: menjamin fungsi mendapat jumlah eksekusi tertentu; mencegah fungsi lain mengonsumsinya. **Provisioned concurrency**: memanaskan sejumlah lingkungan eksekusi terlebih dahulu.
- **Event source mapping**: Fitur Lambda yang menghubungkan SQS/DynamoDB Streams/Kinesis ke Lambda. Lambda mem-poll sumber dan mem-batch record.
- **Mencapai batas akun**: "aplikasi di-throttle / LimitExceeded saat menskala" → periksa batas di **Service Quotas** dan minta peningkatan di sana (banyak kuota, seperti konkurensi Lambda, dapat disesuaikan; beberapa adalah batas keras).
- **RDS Proxy**: Sinyal ujian: "fungsi Lambda menyebabkan terlalu banyak koneksi database," "kehabisan connection pool dengan Lambda." → RDS Proxy mempertahankan koneksi persisten dan memultipleks koneksi Lambda yang berumur pendek.
- **Lambda Layers**: Sinyal ujian: "berbagi kode lintas beberapa fungsi Lambda," "mengurangi ukuran paket deployment" → Lambda Layers.
- **Lambda + X-Ray**: Distributed tracing untuk Lambda. Skenario ujian: "lacak permintaan lintas beberapa fungsi Lambda dan layanan" → aktifkan X-Ray tracing pada Lambda.
- **Lambda Destinations:** Untuk invokasi Lambda asinkron, Anda dapat mengonfigurasi Destination baik untuk hasil sukses maupun gagal. Kirim hasil sukses ke SQS, SNS, EventBridge, atau fungsi Lambda lain. Kirim kegagalan ke SQS atau SNS untuk peringatan. Ini adalah alternatif yang lebih disukai daripada DLQ untuk invokasi async karena ia menangkap baik sukses maupun gagal, bukan hanya gagal. Sinyal ujian: "rutekan hasil Lambda yang sukses ke layanan lain" atau "tangkap baik hasil sukses maupun gagal dari Lambda async" → Lambda Destinations. "Hanya tangkap pesan gagal untuk invokasi async" → DLQ masih valid tetapi Destinations adalah solusi yang lebih lengkap.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan masalah cold start. Pada jenis aplikasi apa cold start paling bermasalah? Pada jenis apa cold start dapat diterima?

*(Petunjuk: Bandingkan API real-time (pengguna menunggu respons) dengan pekerjaan latar belakang asinkron (pengguna sudah mendapat konfirmasi dan melakukan hal lain).)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan menerima gambar produk dari pemasok mereka melalui bucket S3. Setiap gambar perlu diubah ukurannya menjadi empat dimensi standar (thumbnail, kecil, sedang, besar) dan disimpan kembali di S3. Volumenya tak terduga—beberapa hari 10 gambar, beberapa hari 100.000. Pemrosesan harus selesai dalam 10 menit per gambar. Biaya harus diminimalkan.

Arsitektur mana yang PALING memenuhi persyaratan ini?

A) Instans EC2 dalam Auto Scaling Group yang memantau bucket S3 dengan long polling  
B) Instans EC2 khusus dengan cron job yang memeriksa S3 setiap menit untuk gambar baru  
C) Task ECS Fargate yang dipicu oleh antrian SQS, dengan kejadian S3 yang memublikasikan ke antrian  
D) Notifikasi kejadian S3 yang memicu fungsi Lambda yang mengubah ukuran gambar dan menyimpan hasilnya di S3

**Petunjuk 1**: Volume yang tak terduga menguntungkan penskalaan-ke-nol. Opsi mana yang melakukan itu?

**Petunjuk 2**: 10 menit per gambar berada dalam batas 15 menit Lambda. Periksa apakah pekerjaan pengubahan ukuran gambar sesuai dengan batasan Lambda.

**Petunjuk 3**: Instans EC2 khusus yang berjalan 24/7 mahal dan tidak menskala.

**Jawaban**: D

**Penjelasan**: Notifikasi kejadian S3 memicu Lambda ketika sebuah gambar diunggah. Lambda mengubah ukuran gambar menjadi empat dimensi dan menyimpan hasilnya di S3. Lambda menskala dari 0 hingga ribuan invokasi bersamaan secara otomatis, menangani volume tak terduga tanpa pra-penyediaan. Nol biaya ketika tidak ada gambar yang diproses.

**Mengapa bukan A?** EC2 dalam ASG tidak menskala ke nol—minimum satu instans selalu berjalan. Long polling S3 bukan mekanisme kejadian S3 yang native. Biaya lebih tinggi daripada Lambda untuk beban kerja yang melonjak.

**Mengapa bukan B?** Instans EC2 khusus adalah titik kegagalan tunggal, tidak menskala, berjalan 24/7, dan pendekatan berbasis cron memiliki lag deteksi hingga 60 detik.

**Mengapa bukan C?** ECS Fargate berfungsi, tetapi lebih kompleks (membutuhkan manajemen kontainer, ECR, definisi task) dan startup task Fargate memakan puluhan detik hingga menit—jauh lebih lambat daripada cold start Lambda—membuatnya kurang cocok untuk pekerjaan yang melonjak dan berbasis kejadian. Lambda lebih sederhana untuk kasus penggunaan ini.

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin menghasilkan laporan harian pukul 5 pagi dengan 10 restoran teratas berdasarkan volume pesanan hari sebelumnya. Laporan dihasilkan dari data DynamoDB, diformat sebagai PDF, disimpan di S3, dan dikirim email ke semua mitra restoran.

Rancang pipeline berbasis Lambda yang lengkap untuk ini. Apa yang memicu Lambda? Apa yang terjadi jika pembuatan PDF memakan 12 menit? Bagaimana jika ada 5.000 mitra restoran dan mengirim email ke semuanya memakan waktu? Apakah Anda akan menggunakan satu Lambda atau beberapa?

Pertimbangkan juga: bagaimana jika Lambda timeout setelah 14 menit, setelah memproses 4.500 dari 5.000 email restoran? Bagaimana Anda menghindari mengirim email duplikat ketika Lambda dicoba ulang? Izin IAM apa yang dibutuhkan Lambda ini, dan apa set minimum yang diperlukan?

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih menyusun Lambda dengan layanan lain.)*

## Adegan Pasca Kredit

Tom meninjau tagihan di akhir bulan.

Layanan email: sudah hilang dari tagihan EC2.
Pekerjaan pengubahan ukuran gambar: hilang.
Tugas pembersihan malam: hilang.
Laporan analitik harian: hilang. (Generator laporan telah dipindahkan ke ECS Fargate setelah insiden timeout 17 menit, tetapi biaya komputasi Lambda nol karena sekarang diorkestrasi secara berbeda.)

Total biaya Lambda untuk bulan itu: $5,47.

"Lima dolar," kata Tom.

"Dan empat puluh tujuh sen," tambah Leo dengan membantu.

Tom melihat tagihan bulan sebelumnya, ketika layanan-layanan itu semua ada di instans EC2.

"Kita membayar $187 untuk beban kerja yang sama itu."

"Lambda tidak menagih untuk waktu menganggur," kata Leo. "Dan sebagian besar layanan itu menganggur 90% dari waktunya."

Tom memunculkan grafik CloudWatch sekali lagi. Lambda layanan email telah dipanggil 36.412 kali. Total durasi: sekitar 18.200 GB-detik. Pada $0,0000166667 per GB-detik: $0,30—dan bahkan itu nosional, karena 18.200 GB-detik berada nyaman di dalam 400.000 GB-detik durasi yang selalu gratis. Item baris yang sebenarnya adalah nol.

"Instans EC2 berbiaya $18 sebulan," kata Tom. "Kita menghabiskan tiga puluh sen—dan itu saya mengabaikan tier gratis, jadi kita tahu biaya unit yang sebenarnya. Tagihan mengatakan nol."

"Sebagian besar dari $5,47 itu adalah provisioned concurrency pada Lambda notifikasi—yang itu menagih entah ia berjalan atau tidak. Pengubah ukuran gambar, tugas pembersihan, dan sisanya muat di dalam tier gratis."

Tom menatap layar untuk waktu yang lama.

"Saya tarik kembali semua yang saya katakan tentang serverless sebagai kata hype," katanya.

"Kamu tidak pernah mengatakan itu," kata Leo.

"Saya memikirkannya dengan sangat keras."

Pada bab berikutnya: kontainer pengiriman yang membuat server mana pun terasa seperti rumah.
