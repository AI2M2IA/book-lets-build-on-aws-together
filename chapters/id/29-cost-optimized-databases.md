# Chapter 29: Tagihan Database

Tom mencetak metrik CloudWatch. Empat belas halaman. Dia membentangkannya di mejanya sebelum dia percaya dirinya bisa membaca angka-angka itu. Lebih baik melihat semuanya sekaligus daripada menemukan kejutan di tengah halaman.

**Rekap: Penyimpanan Selesai, Database Berikutnya**

Audit penyimpanan telah mengungkap $6.700 dalam pemborosan akumulasi — bukan dari keputusan buruk, tetapi dari ketidakpedulian. Volume yang tidak terpasang, snapshot lama, riwayat versi yang tidak diberitahukan siapa pun ke S3 untuk dibersihkan, unggahan multipart tidak selesai yang telah menumpuk diam-diam selama berbulan-bulan. Tom telah memperbaiki semuanya, mengimplementasikan aturan pembersihan otomatis, dan beralih ke tab berikutnya di spreadsheet. Tingkat data adalah ketidakpastian terbesar yang tersisa: database relasional, tabel NoSQL, node cache, penyimpanan cadangan, dan satu item baris yang telah mengganggunya selama berminggu-minggu.

Item baris tingkat data yang ditinjau:

Aurora cluster: $647/bulan.
Read replica RDS PostgreSQL lawas: $340/bulan.
Tabel DynamoDB: $340/bulan.
ElastiCache: $185/bulan.
Snapshot manual Aurora: $87/bulan.

Total tingkat data yang ditinjau: $1.599/bulan.

"Biarkan saya memahami masing-masing sebelum memutuskan apa pun," katanya. "Karena database bukanlah tempat untuk menghemat uang dengan mengambil jalan pintas."

Ini bijaksana. Kesalahan konfigurasi database yang menyebabkan kehilangan data atau degradasi kinerja jauh lebih mahal daripada penghematannya.

Bayangkan sebuah database seperti mesin mobil. Anda bisa menghemat uang pada mobil dengan beralih ke bahan bakar yang lebih murah, menyesuaikan tekanan ban, dan menghilangkan berat yang tidak perlu dari bagasi. Tetapi jika Anda mencoba menghemat uang dengan melewatkan penggantian oli, Anda berisiko membuat mesin macet — dan mesin yang macet jauh lebih mahal daripada penghematan bahan bakar apa pun. Audit yang akan dijalankan Tom mengikuti logika yang sama: temukan pemborosan di bagasi dan tangki bahan bakar, dan biarkan mesinnya saja sampai Anda tahu persis apa yang Anda lakukan.

**Memahami Beban Kerja Database Anda Terlebih Dahulu**

Optimasi biaya dalam database membutuhkan pemahaman tentang beban kerja sebelum menyentuh apa pun. Tom telah belajar ini dari nyaris-celaka enam bulan sebelumnya: dia telah mulai mengurangi ukuran instance database berdasarkan penggunaan CPU rata-rata — 18% — tanpa terlebih dahulu melihat angka p95. Seorang kolega memintanya memeriksa metrik CloudWatch lebih cermat. CPU p95 adalah 61%, dan selama jam makan malam Jumat yang sangat sibuk, ia mencapai 84%.

"Rata-rata tidak memberi tahu Anda apa yang terjadi pada puncak," kata Tom, ketika dia memberi tahu Priya tentang itu. "Jika saya menyesuaikan ukuran ke rata-rata, kita akan ter-throttle pada malam Jumat."

"Itulah mengapa Anda melihat p95, bukan rata-rata," kata Priya. "Selalu."

Prinsip itu meluas di luar CPU. Tom kini memiliki daftar periksa pra-audit standar:

- CPU: p95, bukan rata-rata
- Memori: FreeableMemory (dalam byte absolut, bukan persentase) — seberapa dekat kita dengan batas?
- Koneksi: DatabaseConnections maksimum selama 30 hari terakhir — seberapa dekat kita dengan batas koneksi?
- Rasio baca/tulis: Menentukan apakah read replica menghasilkan biayanya
- Tingkat pertumbuhan penyimpanan: Berapa GB per bulan yang kita tambahkan?
- Lag replikasi (untuk replika): Apakah replika mengikuti?

Pertanyaan kunci:

- Berapa penggunaan CPU rata-rata dan puncak?
- Berapa rasio baca/tulis?
- Apakah penyimpanan tumbuh, stabil, atau menurun?
- Apakah read replica dimanfaatkan?
- Apakah instance kurang di-provision (menyebabkan perlambatan) atau terlalu di-provision (membayar kapasitas idle)?

Tom menarik metrik CloudWatch untuk ketiga layanan database selama 30 hari sebelumnya:

**Aurora cluster**:

- CPU rata-rata: 18% (p95: 61%; puncak: 84% pada malam Jumat)
- FreeableMemory: konsisten di atas 4GB dari 8GB yang tersedia. Bukan masalah.
- Rasio baca/tulis: 14:1 (baca-berat)
- Penyimpanan: 180GB (tumbuh ~5GB/bulan)
- DatabaseConnections maksimum: 312 dari 1.000 yang tersedia. Nyaman.

**Read replica (RDS PostgreSQL, terpisah dari Aurora)**:

- Ini adalah dua read replica RDS lawas yang dibuat sebelum migrasi Aurora, masih berjalan.
- Koneksi rata-rata ke masing-masing: 2 per hari. CPU rata-rata: 3%.
- FreeableMemory: 7,2GB dari 8GB yang tersedia. Instance hampir idle.

"Mengapa ini masih berjalan?" tanya Tom.

"Saya sudah men-deploy-nya — oh," kata Leo. Dia melihat tanggal pembuatan instance. "Mereka untuk fallback selama migrasi Aurora. Saya tidak pernah menghapusnya."

Momen itu — ketika sesuatu yang mahal telah berjalan selama berbulan-bulan tanpa digunakan — adalah momen yang familiar di lingkungan cloud. Leo telah membuat replika sebagai jaring pengaman. Jaring pengaman itu tidak pernah dibutuhkan. Tetapi tidak ada yang mengajukan pertanyaannya sampai sekarang.

"Bagaimana situasi connection pool-nya?" tanya Priya, mencondongkan badan. "Sebelum kita menghapusnya, apakah ada komponen aplikasi yang masih mengarahkan pembacaan ke sana?"

Tom memeriksa log koneksi. Dua koneksi per hari berasal dari skrip pemantauan yang Priya tulis empat belas bulan lalu — ia mem-poll semua endpoint database yang diketahui untuk memverifikasi mereka merespons. Replika hanya dikueri oleh health checker, bukan oleh lalu lintas aplikasi yang sebenarnya.

"Hapus mereka," kata Maya.

Replika diterminasi. Penghematan bulanan: $340.

**Nyaris-Celaka Connection Pool**

Sementara dia membuka metrik koneksi, Tom menjalankan pemeriksaan yang lebih luas di seluruh endpoint database. Apa yang dia temukan membuatnya berhenti.

Endpoint writer Aurora menunjukkan DatabaseConnections maksimum 312. Nyaman. Tetapi endpoint reader menceritakan kisah berbeda.

"Endpoint reader mencapai 847 koneksi pada tiga malam Jumat berturut-turut," kata Tom.

"Berapa batasnya?" tanya Priya.

"Batas untuk kelas instance kita saat ini adalah 1.000. Kita sampai 847. Itu 85% dari batas."

"Dan kita tidak menyadarinya karena kita tidak diberi alarm sampai 90%?" tanya Maya.

"Kita tidak diberi alarm sama sekali," kata Tom. "Tidak ada alarm CloudWatch pada koneksi endpoint reader. Saya hanya menemukan ini karena saya sedang melihat metrik mentah."

Pada 1.000 koneksi, database menolak koneksi baru. Setiap thread aplikasi yang mencoba memperoleh koneksi database pada saat itu melempar exception. Jika exception itu tidak ditangani dengan baik, pengguna melihat error 500.

"Kita tiga puluh detik dari insiden malam Jumat," kata Leo. "Tiga kali berturut-turut."

"Sudahkah kita memikirkan apa yang terjadi ketika ambang batas itu dilewati?" tanya Priya.

"Mitra restoran melihat pesanan gagal selama jam makan malam," kata Maya. "Itu bukan kekhawatiran teoretis."

Tom langsung menyiapkan alarm CloudWatch: peringatan pada 750 koneksi (75% dari batas), page pada 900 (90%). Dia juga mengimplementasikan RDS Proxy untuk endpoint reader — RDS Proxy menggabungkan dan mengelola koneksi database dari lapisan aplikasi, artinya lima puluh thread aplikasi bisa berbagi sepuluh koneksi database. Proxy menangani multiplexing. Database melihat jauh lebih sedikit koneksi bahkan ketika aplikasi berada di bawah beban berat.

"Untuk Aurora Serverless v2, RDS Proxy dihargai $0.015 per ACU per jam, dengan biaya minimum 8 ACU per proxy," kata Tom. "Tetapi jika pelanggaran batas koneksi menyebabkan bahkan satu pemadaman parsial pada malam Jumat, biaya reputasi bagi Nimbus jauh lebih tinggi dengan beberapa kali lipat."

"Berapa biayanya per bulan?" Tom bertanya pada dirinya sendiri, menghitung angkanya. Reader mereka berjalan pada Serverless v2, jadi proxy ditagihkan terhadap minimum 8 ACU: $0.015 × 8 × 730 = $87,60/bulan. Itu biaya yang dia senang bayar.

Anda mungkin bertanya-tanya: jika kita sudah menghemat uang dengan auto-scaling Serverless v2, mengapa repot dengan Reserved Instances untuk tingkat provisioned? Jawabannya adalah bahwa scaling Serverless v2 memiliki biaya — Anda membayar per ACU-jam baik Anda merencanakannya atau tidak. Untuk tim yang menjalankan konfigurasi Aurora tetap, komitmen RI mengubah biaya variabel menjadi biaya yang dapat diprediksi. Untuk tim yang menjalankan instance provisioned (bukan Serverless v2), perbedaan itu sangat penting.

**RDS Reserved Instances: Untuk Tingkat Database Provisioned**

Seperti EC2, RDS menawarkan Reserved Instances untuk penggunaan yang dikomitmen.

Untuk tim yang menggunakan konfigurasi instance Aurora tetap (bukan Serverless v2), Reserved Instances bisa menghemat 30-60%. Berikut cara pendekatan RI provisioned bekerja: Anda berkomitmen ke jenis instance tertentu selama 1 atau 3 tahun sebagai imbalan diskon signifikan pada tarif per jam.

Sebagai ilustrasi: instance writer db.r6g.large pada $0.26/jam On-Demand berjalan $190/bulan. Reserved Instance 1 tahun untuk yang sama mengurangi itu menjadi kira-kira $108/bulan — menghemat $82/bulan per instance, atau hampir $1.000 per tahun per instance database.

**Aurora Serverless v2 vs Standard RI — Titik Impas**

Tom menghitung angka untuk konfigurasi Aurora spesifik mereka. Pertanyaannya: apakah auto-scaling Aurora Serverless v2 memberikan cukup manfaat, atau akankah instance provisioned tetap dengan komitmen Reserved Instance lebih murah?

Harga Serverless v2: $0.12 per ACU-jam. Cluster mereka berskala antara 0,5 ACU (idle) dan 16 ACU (beban puncak). Selama 30 hari sebelumnya, rata-ratanya adalah 4,2 ACU.

Biaya bulanan Serverless v2: 4,2 ACU × $0.12 × 730 jam = $368/bulan untuk writer.

Bandingkan: db.r6g.2xlarge tetap (perkiraan setara provisioned mereka, diukur untuk menangani beban p95) dengan RI 1 tahun: $0.48/jam × 0,60 (diskon RI) × 730 = $210/bulan.

"RI lebih murah," kata Leo.

"Untuk beban tetap, ya," kata Tom. "Tetapi lihat sebarannya. Periode lalu lintas rendah kita — pukul 2 pagi hingga 7 pagi, Senin hingga Kamis — rata-rata 0,8 ACU. Pada instance provisioned tetap, kita akan membayar 8x dari yang kita gunakan selama jam-jam itu, hanya menganggur idle."

"Dan Serverless v2 berskala turun untuk mencocokkannya?"

"Ke 0,5 ACU. Biaya idle-nya sebagian kecil dari yang akan kita bayar untuk instance provisioned yang diukur untuk puncak."

Perhitungan titik impas: Serverless v2 lebih murah ketika rasio puncak/baseline Anda di atas sekitar 4:1. Untuk Nimbus, dengan puncak Jumat pada 16 ACU dan minimum Senin pagi pada 0,8 ACU — rasio 20:1 — Serverless v2 adalah pilihan yang tepat. Jika lalu lintas mereka lebih konsisten (katakanlah, 8 ACU ± 20%), RI provisioned akan lebih murah.

"Ini bukan hanya tentang angka mana yang lebih kecil bulan ini," kata Tom. "Ini tentang model mana yang menangani pertumbuhan kita dengan benar. Jika kita tumbuh 50% kuartal depan, Serverless v2 tinggal berskala naik. RI provisioned akan butuh penyesuaian ukuran, dan kita akan membayar untuk headroom yang tidak terpakai selama transisi."

Tom memetakan perbandingan setahun penuh secara eksplisit agar tim bisa mengikuti penalaran, bukan hanya kesimpulannya.

**Biaya Aurora bulan demi bulan: Serverless v2 vs RI provisioned**

Opsi provisioned: db.r6g.2xlarge dengan Reserved Instance 1 tahun. Biaya: $0.48/jam On-Demand × 0,60 (diskon RI) × 730 jam = $210/bulan. Tetap, terlepas dari beban.

Opsi Serverless v2: bayar per ACU-jam pada $0.12. Variabel, mengikuti beban aktual.

Tom menarik 30 hari metrik ACU Aurora Serverless v2 dari CloudWatch dan membangun distribusi:

- Pukul 2 pagi–7 pagi, Senin–Kamis (lalu lintas rendah): rata-rata 0,8 ACU → $0.096/jam
- Pukul 7 pagi–11 pagi, hari kerja (sedang): rata-rata 3,2 ACU → $0.384/jam  
- Pukul 11 pagi–9 malam, hari kerja (jam kerja puncak): rata-rata 5,8 ACU → $0.696/jam
- Jumat pukul 6 malam–10 malam (jam makan malam): rata-rata 14,1 ACU → $1.692/jam
- Sabtu pukul 12 siang–8 malam (akhir pekan sibuk): rata-rata 9,3 ACU → $1.116/jam
- Minggu (hari teringan): rata-rata 2,1 ACU → $0.252/jam

Rata-rata tertimbang di seluruh bulan penuh: 4,2 ACU → $0.504/jam → $368/bulan.

Pada RI provisioned: $210/bulan. Serverless: $368/bulan. Opsi provisioned menghemat $158/bulan.

"Itu tampak jelas," kata Leo. "Mengapa kita di Serverless?"

"Karena $368 adalah rata-rata," kata Tom. "Lihat malam Jumat."

Jumat pukul 6–10 malam: rata-rata 14,1 ACU. Untuk jendela empat jam itu, Serverless berbiaya $1.692/jam. Sebuah db.r6g.2xlarge provisioned pada $210/bulan — kapasitas maksimumnya — adalah 8 vCPU. Cluster Serverless menjalankan setara dengan kira-kira 16 vCPU selama jendela itu.

"Instance provisioned yang diukur untuk puncak Jumat kita akan menjadi db.r6g.4xlarge," kata Tom. "Pada tarif RI, itu $0.96/jam × 0,60 = $0.576/jam. Bulanan: $420/bulan."

"Itu lebih dari rata-rata Serverless $368," kata Maya.

"Benar. Dan jika kita mengukur instance provisioned untuk baseline hari kerja — db.r6g.2xlarge — malam Jumat akan jadi masalah. Pada beban puncak, kita akan mendorong setara 14 ACU pada instance 8-vCPU. Itu saturasi CPU."

"Jadi Anda perlu mengukur sebelumnya untuk puncak," kata Priya.

"Dengan biaya membayar kapasitas idle 160 jam lainnya dalam seminggu," kata Tom. "Perhitungan RI provisioned yang keluar lebih murah hanya berhasil ketika rasio puncak/baseline Anda rendah. Kita 20:1. Itulah persis skenario yang dirancang untuk Serverless v2."

Dia menunjukkan angka-angka berdampingan:

| Opsi | Bulan rata-rata | Malam sepi (2 pagi) | Jam sibuk Jumat (8 malam) |
|---|---|---|---|
| Serverless v2 | $368 | $0.096/jam | $1.692/jam |
| RI provisioned (r6g.2xl) | $210 | $210/730jam = $0.288/jam | terbatas — risiko saturasi |
| RI provisioned (r6g.4xl) | $420 | $0.576/jam | headroom nyaman |

"Opsi Serverless adalah $368," kata Tom. "Opsi provisioned yang diukur tepat adalah $420 — dan itu sebelum memperhitungkan biaya operasional pemantauan dan penskalaan manual instance provisioned ketika pola lalu lintas kita berubah kuartal depan."

"Dan biaya operasional," kata Priya, "bukan tidak ada."

"Tidak. Dengan Serverless, kita tidak harus memikirkan ukuran instance. Aurora menanganinya. Dengan provisioned, setiap kuartal saya perlu mengevaluasi ulang apakah kelas instance saat ini masih cocok dengan lalu lintas kita. Itu tidak mahal dalam waktu, tetapi itu sesuatu yang bisa salah jika kita berhenti memperhatikan."

"Akan baik-baik saja selama kita tidak lupa menyesuaikan ukurannya," kata Leo, dan kemudian menyadari dirinya. "Yang justru saat itulah ia tidak akan baik-baik saja."

"Tepat," kata Tom.

Kesimpulannya berlaku: Serverless v2 pada $368/bulan adalah pilihan yang tepat untuk rasio puncak/baseline Nimbus 20:1 dan preferensi timnya akan kesederhanaan operasional. RI provisioned hanya menarik untuk tim dengan lalu lintas yang tidak banyak bervariasi — rasio 2:1 atau 3:1 di mana instance provisioned jarang idle.

"Apa yang akan membuat kita beralih ke provisioned?" tanya Maya.

"Jika pola lalu lintas kita mendatar," kata Tom. "Jika Nimbus tumbuh sampai titik di mana baseline lalu lintas rendah juga tinggi — katakanlah, 8 ACU pada pukul 2 pagi alih-alih 0,8 — rasio akan turun ke 2:1 dan provisioned akan masuk akal secara ekonomi. Itu masalah bisnis yang berbeda. Yang ingin kita miliki."


Untuk Aurora dengan Serverless v2, Reserved Instances tidak berlaku secara langsung — Serverless v2 berskala secara dinamis dan Anda membayar per ACU-jam. Ini adalah konfigurasi Nimbus saat ini: writer dan reader Aurora utama keduanya menggunakan Serverless v2. Penghematan untuk Nimbus datang dari sifat auto-scaling Serverless v2 itu sendiri — Anda tidak membayar kapasitas yang tidak terpakai ketika lalu lintas rendah.

Tim yang masih menjalankan instance Aurora tetap harus mengevaluasi komitmen RI setelah jenis instance stabil selama tiga bulan atau lebih.

**DynamoDB: On-Demand vs Provisioned**

Di Bab 9, kami memperkenalkan dua mode kapasitas DynamoDB: on-demand dan provisioned.

Nimbus telah menjalankan DynamoDB dalam mode on-demand sejak awal. Pada lalu lintas rendah, ini benar — on-demand lebih mahal per permintaan tetapi tidak memiliki biaya minimum.

Sekarang, dengan 18 bulan data lalu lintas di CloudWatch, Tom bisa melihat pola.

Permintaan baca rata-rata: 225 per detik (sekitar 19,4 juta per hari)
Permintaan tulis rata-rata: 60 per detik (sekitar 5,2 juta per hari)
Hari puncak (Jumat): 180% dari permintaan DynamoDB rata-rata (ElastiCache menyerap ~95% pembacaan, jadi DynamoDB hanya melihat sebagian kecil dari lonjakan volume pesanan 25x secara keseluruhan)

**Harga on-demand**: $1.25 per juta permintaan tulis, $0.25 per juta permintaan baca.
**Harga provisioned**: $0.00065 per unit kapasitas tulis per jam, $0.00013 per unit kapasitas baca per jam.

Tom menghitung titik impas: kapasitas provisioned menjadi lebih murah ketika Anda menggunakannya cukup konsisten sehingga Anda tidak membayar premi on-demand selama periode idle.

(Catatan tentang angka-angka di bagian ini: mereka mencerminkan tagihan tim pada saat itu, dan bersifat ilustratif. Pada akhir 2024, AWS memotong harga on-demand DynamoDB sebesar 50%, yang menggeser titik impas secara substansial — hari ini, kapasitas provisioned hanya menang ketika pemanfaatan konsisten tinggi. Selalu ulangi perhitungan ini dengan harga saat ini.)

Dengan 18 bulan data yang menunjukkan pola harian yang konsisten, kapasitas provisioned dengan **DynamoDB Auto Scaling** adalah pilihan yang tepat:

- Atur kapasitas minimum pada 60% dari beban rata-rata
- Atur maksimum pada 250% dari rata-rata (menangani lonjakan Jumat)
- Auto Scaling menyesuaikan kapasitas provisioned antara batas-batas ini

Biaya bulanan DynamoDB: turun dari $340 (on-demand) menjadi $230 (provisioned dengan auto scaling). Pengurangan 32%.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Kita di on-demand sejak awal karena kita tidak percaya pola lalu lintas kita sendiri. Apa yang berubah?"

"Delapan belas bulan data," kata Tom. "Kita sekarang tahu seperti apa pola kita — baseline hari kerja yang konsisten, puncak Jumat, periode sepi Minggu. On-demand adalah keputusan yang tepat ketika kita tidak tahu. Provisioned dengan Auto Scaling adalah keputusan yang tepat sekarang setelah kita tahu."

"Tetapi jika kita over-provision," tanya Leo, "kita membayar kapasitas yang tidak terpakai."

"Itu risikonya," kata Tom. "Dengan Auto Scaling, kita menetapkan minimum cukup tinggi untuk menghindari throttling, dan biarkan AWS mengelola dalam rentang kita."

"Dan jika pola lalu lintas kita berubah secara signifikan?"

"Maka kita sesuaikan batas-batasnya. Kita meninjau ini setiap kuartal."

**ElastiCache: Penyesuaian Ukuran dan Kisah Peringatan**

Tagihan ElastiCache: $185/bulan. Satu instance Redis cache.r6g.large di setiap AZ (dua node, primer + replika).

Metrik CloudWatch menunjukkan:

- Penggunaan memori rata-rata: 34%
- Puncak: 58%

Instance tersebut terlalu di-provision. Sebuah cache.r6g.medium kemungkinan akan menangani beban dengan headroom.

Tetapi di sini Tom berhenti. Dia ingat apa yang terjadi di perusahaan sebelumnya ketika dia menyesuaikan ukuran cache secara agresif — dan dia menceritakan kisah lengkapnya kepada tim, karena itu adalah jenis kisah yang perlu diceritakan sebelum Anda menemukan diri Anda di tengah-tengahnya.

Di perusahaan sebelumnya — platform SaaS untuk pelaporan keuangan — cluster ElastiCache telah berupa cache.r6g.large. Dua node, primer dan replika. Penggunaan memori rata-rata: 31%. Puncak yang teramati: 54%. Insinyur on-call yang menandainya telah menghitung: cache.r6g.medium akan menangani beban dengan headroom 25% di atas puncak yang teramati. Penghematan: $60/bulan — harga di region dan generasi node perusahaan itu pada saat itu, lebih kecil daripada kesenjangan setara di Nimbus hari ini. Perubahan disetujui pada hari Selasa.

Bulan berikutnya, pada Kamis malam pukul 11:47 malam, batch settlement akhir bulan dimulai.

Batch settlement berjalan setiap kuartal. Ia menarik catatan transaksi setiap akun aktif untuk tiga bulan sebelumnya, mengagregasinya, menghitung pajak, dan menulis catatan settlement. Cache digunakan untuk menyimpan status agregasi antara — total berjalan setiap akun seiring batch berlangsung. cache.r6g.large selalu menanganinya. Tidak ada yang melihat metrik batch settlement secara spesifik saat membuat keputusan penyesuaian ukuran, karena batch bersifat kuartalan dan jendela observasi adalah empat minggu.

Pada instance medium, maxMemoryPolicy diatur ke `allkeys-lru` — ketika memori penuh, Redis akan menggusur key yang paling jarang digunakan untuk membuat ruang. Itu kebijakan yang benar untuk cache umum. Tetapi untuk batch settlement, setiap key dalam cache secara aktif dibutuhkan. Ketika memori terisi pada 84% dari 6,38 GB instance medium, Redis mulai menggusur key. Setiap penggusuran adalah cache miss. Setiap cache miss mengirim kueri ke database PostgreSQL yang mendasari untuk menghitung ulang nilai yang digusur dari catatan transaksi mentah.

Connection pool database dikonfigurasi untuk lalu lintas steady-state, bukan beban batch settlement. Dalam empat menit setelah penggusuran dimulai, database memiliki 847 koneksi aktif. Batas koneksi adalah 1.000. Pada 9 menit, thread aplikasi pertama mulai melihat error "too many connections." Pada 12 menit, tiga layanan yang berbagi connection pool database — batch settlement, layanan pelaporan real-time, dan API yang menghadap klien — semuanya terpengaruh.

Insinyur on-call mengeskalasi pada pukul 11:59 malam. Tinjauan insiden dimulai pukul 12:08 pagi.

Respons pertama: tingkatkan timeout Lambda untuk fungsi batch settlement (batch settlement sebagian berbasis Lambda). Ini salah. Timeout bukan masalahnya.

Respons kedua: tambahkan fungsi Lambda kedua untuk memparalelkan batch settlement. Juga salah. Lebih banyak paralelisme berarti lebih banyak akses cache simultan, yang berarti penggusuran lebih cepat, yang membuat situasi lebih buruk.

Respons ketiga: skala turun batch settlement untuk mengurangi tekanan database. Ini sedikit membantu tetapi tidak mengatasi akar penyebabnya.

Respons keempat, pada pukul 2:31 pagi: pulihkan cache.r6g.large. Tekanan memori turun segera. Penggusuran berhenti. Connection pool database bersih. Batch settlement selesai pukul 4:17 pagi, tertunda lebih dari empat jam.

Total insiden: empat jam kinerja API terdegradasi bagi klien yang mencoba mengakses laporan. Satu batch settlement penuh tertunda. Waktu teknik: kira-kira 22 jam di lima insinyur. Perkiraan biaya langsung: $40.000.

Penghematan $60/bulan telah menelan biaya $40.000 dalam satu insiden.

"Kesalahannya bukan keputusan penyesuaian ukuran," kata Tom. "Keputusan itu dapat dipertahankan berdasarkan data yang tersedia. Kesalahannya adalah jendela observasi. Kita mengukur empat minggu metrik. Batch settlement adalah kuartalan. Kita melihat kerangka waktu yang salah."

"Jadi bagaimana Anda menghindarinya?" tanya Maya.

"Anda bertanya: operasi apa yang paling tinggi taruhannya yang didukung cache ini? Dan Anda menemukan metrik spesifik operasi itu. Bukan minggu rata-rata. Minggu spesifik — atau bulan — atau kuartal — ketika bebannya tertinggi. Dan Anda mengukur untuk itu."

"Dan jika Anda tidak bisa menemukan metriknya karena operasinya jarang?"

"Itu jawabannya," kata Tom. "Jika Anda tidak bisa menemukan metrik untuk skenario beban tinggi yang spesifik, respons yang benar adalah belum menyesuaikan ukuran. Tunggu kejadian berikutnya, instrumentasi secara berat, lalu ukur berdasarkan apa yang Anda amati."

Cluster ElastiCache Nimbus punya operasi taruhan-tinggi sendiri: jam makan malam Jumat. Tom punya data itu — tiga malam Jumat berturut-turut telah mencapai 58% penggunaan memori pada r6g.large. Jika dia pindah ke r6g.medium dan sesuatu dalam pipeline pemrosesan pesanan berubah untuk menggunakan lebih banyak ruang cache — fitur baru, strategi caching berbeda — 58% itu bisa menjadi 80%, dan 80% pada medium adalah wilayah penggusuran.

Dia tetap menghitung angkanya. Pindah dari r6g.large ke r6g.medium: dua node pada $0.127/jam versus dua node pada $0.065/jam, berjalan 730 jam per bulan. Large: $185/bulan. Medium: $95/bulan. Potensi penghematan: $90/bulan. Dia menguji instance medium di staging selama dua minggu di bawah beban. Memori memuncak pada 71% — cukup dekat dengan batas sehingga dia merasa tidak nyaman.

Kemudian dia menghargai alternatifnya: pertahankan cache.r6g.large, tetapi beli Reserved Nodes (komitmen 1 tahun). Dari On-Demand $185 menjadi Reserved $120/bulan. Penghematan: $65/bulan tanpa mengubah jenis instance.

"$65/bulan yang akan saya hemat pada Reserved Nodes pada ukuran instance yang sama adalah penghematan nyata," kata Tom. "$90/bulan yang akan saya hemat dengan pindah ke medium adalah penghematan semu jika ia membahayakan jam makan malam Jumat. Terkadang menyesuaikan ukuran ke instance yang lebih kecil membahayakan insiden kinerja — Reserved Nodes memberi kita sebagian besar penghematan tanpa risiko apa pun."

Dia membeli Reserved Nodes untuk r6g.large.

"Selisih $25 dalam penghematan bulanan," kata Tom, "tidak sebanding dengan insiden malam Jumat."

**Retensi Cadangan RDS: Trade-Off Penyimpanan**

Cadangan otomatis RDS disimpan di S3 (tanpa biaya tambahan untuk penyimpanan hingga 100% dari ukuran database Anda). Retensi default adalah 7 hari.

Untuk database Aurora 180GB Nimbus, 7 hari cadangan sudah sesuai — mereka telah bisa memulihkan dari cadangan dalam jendela itu saat pengujian.

Tetapi Tom memperhatikan: mereka juga punya snapshot manual dari setiap penerapan signifikan, disimpan tanpa batas.

23 snapshot manual, total 4,1TB penyimpanan snapshot.
Biaya: $0.021/GB/bulan untuk penyimpanan cadangan Aurora = sekitar $87/bulan dalam penyimpanan snapshot manual.

Mereka menyimpan 3 snapshot manual terakhir per lingkungan (produksi, staging). Menghapus sisanya — sekitar 1,1TB dipertahankan.
Penghematan: $64/bulan.

"Kita membayar $64 per bulan untuk asuransi yang tidak pernah kita gunakan," kata Leo.

"Kita membayar untuk ketenangan pikiran," koreksi Tom. "Pertanyaannya adalah: berapa banyak ketenangan pikiran yang layak $64 per bulan?"

"Dengan rencana pemulihan bencana yang tepat," kata Priya, "Anda bisa mendapat ketenangan pikiran yang sama dari 7 hari cadangan otomatis dan 3 snapshot manual."

"Setuju. Sekarang."

**Variasi: Ketika Provisioned Menjadi Bumerang**

Jika pola lalu lintas Anda konsisten dan dapat diprediksi, kapasitas provisioned dengan Auto Scaling menghemat 30% dibanding on-demand. Tetapi jika fitur baru diluncurkan dan volume tulis Anda melonjak 5x dalam semalam, Anda akan ter-throttle sebelum Auto Scaling mengejar — Auto Scaling bereaksi terhadap lalu lintas yang teramati, yang berarti ada lag. Mempertahankan mode on-demand untuk minggu-minggu sekitar peluncuran fitur besar adalah trade-off yang masuk akal: biaya sedikit lebih tinggi, tidak ada risiko throttling selama periode ketika Anda mengamati pola lalu lintas berubah secara real time.

Jika Anda menghilangkan read replica yang tidak terpakai (seperti replika PostgreSQL lawas Nimbus), penghematannya langsung dan tidak ambigu — tidak ada trade-off, karena replika tidak memberikan nilai. Tetapi jika Anda tergoda untuk menghilangkan read replica yang menangani hanya 2% lalu lintas, periksa apa yang terjadi pada primer ketika 2% itu tidak punya tempat untuk pergi selama puncak. Beberapa read replica ada untuk headroom, bukan beban saat ini.

**Ringkasan Optimasi Database**

| Layanan                                           | Sebelum     | Sesudah    | Penghematan Bulanan |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (Serverless v2 dipertahankan setelah analisis)    | $647       | $647     | $0 (model yang benar) |
| RDS Read Replica (tidak terpakai)                        | $340       | $0       | $340           |
| DynamoDB (On-Demand -> Provisioned + Auto Scaling) | $340       | $230     | $110           |
| ElastiCache (Reserved Nodes)                      | $185       | $120     | $65            |
| Snapshot manual Aurora                           | $87        | $23      | $64            |
| RDS Proxy (keamanan koneksi)                     | $0         | $88      | -$88           |
| **Total**                                         | **$1.599** | **$1.108** | **$491/bulan** |

$491 per bulan dalam penghematan database. $5.892 per tahun.

Tom menempatkan angka ini di samping pembersihan penyimpanan ($6.200/tahun), kebijakan siklus hidup S3 dari Bab 23 ($7.800/tahun), dan penghematan Savings Plan ($14.200/tahun).

Total dampak optimasi sampai saat ini: $34.092/tahun.

"Itu runway yang nyata," kata Maya.

"Atau beberapa eksperimen serius," kata Priya.

"Atau dua belas bulan eksperimen," kata Leo.

Ketiganya benar.

## Kekuatan dan Batasan

**DynamoDB Provisioned dengan Auto Scaling**:

- Lebih murah daripada on-demand untuk beban kerja yang dapat diprediksi dan konsisten
- Auto Scaling menangani variabilitas tanpa over-provisioning secara permanen
- Membutuhkan pemantauan untuk memastikan batas kapasitas tetap sesuai

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Penghematan signifikan untuk beban kerja yang stabil dan berjalan lama
- Komitmen terkunci — jika kebutuhan Anda berubah, Anda telah membayar untuk kapasitas yang tidak terpakai
- Tidak seperti EC2 Standard RIs, RDS RIs **tidak bisa** dijual kembali di Reserved Instance Marketplace — Marketplace hanya untuk EC2. RDS RI yang tidak terpakai adalah biaya hangus, yang membuat keputusan ukuran lebih penting

**Prinsip umum**:

- Selalu pahami pemanfaatan sebelum mengoptimalkan — gunakan p95, bukan rata-rata
- Sumber daya yang tidak terpakai (seperti read replica lawas) adalah optimasi dengan pengembalian tertinggi
- Penyesuaian ukuran memerlukan validasi di staging sebelum diterapkan ke produksi, dan memeriksa pola beban kerja musiman yang mungkin tidak muncul dalam jendela observasi standar
- Harga reserved memerlukan kepercayaan pada stabilitas beban kerja

## Ringkasan

- **Audit dulu**: Tarik metrik CloudWatch sebelum membuat perubahan database apa pun. Gunakan latensi p95 dan CPU p95 — bukan rata-rata. Periksa FreeableMemory dan maksimum koneksi.
- **Hapus sumber daya yang tidak terpakai**: Read replica, database idle, dan instance pengujian yang tidak lagi dibutuhkan.
- **Awasi connection pool Anda**: Atur alarm pada DatabaseConnections pada 75% dan 90% dari batas. Pertimbangkan RDS Proxy untuk multiplexing koneksi.
- **DynamoDB On-Demand vs Provisioned**: On-Demand untuk lalu lintas tak terduga; Provisioned + Auto Scaling untuk pola yang konsisten.
- **Penyesuaian ukuran ElastiCache**: Uji di staging di bawah beban puncak yang realistis, termasuk puncak musiman. Reserved Nodes menawarkan penghematan pada ukuran instance yang sama ketika pengurangan ukuran agresif membawa risiko.
- **Manajemen snapshot RDS**: Simpan hanya snapshot yang Anda butuhkan. Snapshot manual disimpan tanpa batas kecuali dihapus.

## Tips Ujian

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.3)*

- **Mode harga DynamoDB**: On-Demand = bayar per permintaan (biaya per unit lebih tinggi, tanpa minimum). Provisioned = bayar per unit kapasitas per jam (biaya per unit lebih rendah, harus mengalokasikan kapasitas). **DynamoDB Auto Scaling** menyesuaikan kapasitas provisioned secara otomatis.
- **RDS Reserved Instances**: Tersedia untuk semua jenis mesin RDS. Penerapan Multi-AZ bisa menggunakan Reserved Instances (Anda berkomitmen ke Multi-AZ). Masa 1 atau 3 tahun.
- **ElastiCache Reserved Nodes**: Model komitmen yang sama dengan EC2 Reserved Instances. Diterapkan per node, bukan per cluster.
- **Penyimpanan snapshot RDS**: Cadangan otomatis gratis hingga 100% dari ukuran database. Snapshot manual dikenakan biaya per GB per bulan di S3. Skenario ujian: "kurangi biaya penyimpanan RDS" → hapus snapshot manual lama.
- **Kapasitas reserved DynamoDB**: Tersedia untuk DynamoDB juga (dikomitmenkan ke kapasitas baca/tulis tertentu selama 1 atau 3 tahun dengan diskon). Berbeda dari provisioned standar — Anda membayar di muka untuk kapasitas di semua tabel DynamoDB Anda di sebuah region.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 berskala otomatis, ideal untuk beban kerja variabel. Provisioned dengan Reserved Instances lebih murah untuk beban kerja yang stabil dan dapat diprediksi.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan kapan Anda harus menggunakan kapasitas on-demand DynamoDB versus kapasitas provisioned dengan Auto Scaling. Informasi apa yang Anda butuhkan untuk membuat keputusan ini?

*(Petunjuk: Pikirkan tentang apa arti "dapat diprediksi" dalam hal data lalu lintas, dan risiko apa yang dihilangkan on-demand yang diperkenalkan provisioned.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan menjalankan tabel DynamoDB untuk papan peringkat game seluler. Lalu lintas sangat konsisten sepanjang tahun, kecuali selama acara musiman yang dijadwalkan berbulan-bulan sebelumnya (satu minggu per kuartal, mencapai 10x lalu lintas normal saat pemain bergabung selama hari pertama). Prioritas perusahaan adalah meminimalkan biaya database selama periode steady-state yang panjang dan dapat diprediksi sambil mempertahankan kinerja melalui minggu-minggu acara yang diketahui.

Strategi kapasitas DynamoDB mana yang PALING memenuhi persyaratan ini?

A) Kapasitas on-demand untuk menangani puncak musiman tanpa throttling  
B) Kapasitas provisioned yang diatur pada tingkat puncak musiman (selalu provisioned untuk 10x lalu lintas)  
C) Kapasitas provisioned dengan DynamoDB Auto Scaling, dengan kapasitas maksimum diatur untuk puncak musiman  
D) Unit kapasitas reserved DynamoDB selama 3 tahun pada tingkat lalu lintas normal

**Petunjuk 1**: "Lalu lintas sangat konsisten kecuali puncak musiman yang terjadwal dan diketahui" — mode mana yang menangani keduanya secara efisien? (Kekuatan on-demand adalah lalu lintas *tak terduga*; lalu lintas ini dapat diprediksi.)

**Petunjuk 2**: "Minimalkan biaya" selama non-puncak berarti Anda tidak bisa over-provision untuk 10x sepanjang waktu.

**Petunjuk 3**: DynamoDB Auto Scaling bisa berskala naik untuk acara musiman dan berskala turun setelahnya.

**Jawaban**: C

**Penjelasan**: Kapasitas provisioned dengan Auto Scaling menskalakan tabel berdasarkan lalu lintas aktual. Selama periode normal, kapasitas pada tingkat normal (biaya rendah). Selama acara musiman — yang tanggalnya diketahui sebelumnya dan yang lalu lintasnya membangun secara bertahap selama hari pertama — Auto Scaling melacak peningkatan hingga tingkat maksimum yang dikonfigurasi (menangani puncak 10x), dan tim juga bisa menaikkan minimum menjelang awal terjadwal sebagai headroom ekstra. Setelah acara, kapasitas berskala turun kembali. Ini lebih murah daripada on-demand selama steady-state yang mendominasi tahun (on-demand berbiaya lebih per permintaan) dan lebih murah daripada selalu provisioning untuk 10x.

**Mengapa bukan A?** On-demand menangani puncak tanpa throttling, tetapi kekuatannya adalah lalu lintas *tak terduga*. Di sini lalu lintas sangat konsisten dan puncaknya terjadwal dan bertahap — membayar premi per-permintaan on-demand untuk ~92% tahun yang steady-state bertentangan dengan prioritas yang dinyatakan yaitu meminimalkan biaya selama periode normal.

**Mengapa bukan B?** Provisioning pada 10x secara permanen berarti ~90% dari kapasitas provisioned menganggur tidak terpakai selama ~92% tahun — membayar kapasitas yang tidak pernah digunakan.

**Mengapa bukan D?** Unit kapasitas reserved mengunci Anda ke tingkat lalu lintas normal. Selama acara musiman 10x, Anda akan ter-throttle di luar jumlah yang reserved, atau Anda perlu menambahkan on-demand di atasnya.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang mengevaluasi fitur baru: dasbor analitik restoran yang menampilkan jumlah pesanan real-time, pendapatan per jam, dan demografi pelanggan. Data ini akan mengueri database kira-kira 200 kali per menit (satu kueri per analis per refresh halaman, dengan 10 analis).

Saat ini data analitik berada di Athena (S3). Haruskah mereka membangun dasbor di Athena, atau haruskah mereka memuat data ke database? Jika database, yang mana (Aurora, DynamoDB, Redshift)?

Pertimbangkan: frekuensi kueri, persyaratan kebaruan data, kompleksitas kueri (agregasi, join), dan biaya per kueri pada volume ini.

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih pemilihan database untuk beban kerja analitik.)*

## Adegan Pasca-Kredit

Tom mempresentasikan ringkasan optimasi biaya lengkap kepada Maya.

Tiga bulan kerja. $34.092 dalam penghematan tahunan teridentifikasi, sebagian besar sudah diimplementasikan.

"Apa sisanya?" tanya Maya.

"Optimasi yang belum saya yakini," kata Tom. "Konfigurasi Aurora mungkin bisa lebih disesuaikan ukurannya, tetapi saya ingin satu kuartal data lagi sebelum berkomitmen. Dan ada pertanyaan transfer data yang belum saya analisis sepenuhnya."

"Biaya jaringan."

"Ya. Itu berikutnya."

Maya melihat angka-angka itu. "Tom, saya ingin memahami sesuatu. Optimasi ini — Anda telah mengerjakannya selama tiga bulan. Itu bagian yang signifikan dari waktu Anda."

"Sekitar 30%."

"Dan Anda menemukan sekitar $34.000 per tahun. Jadi optimasi itu membayar dirinya sendiri dalam — apa, beberapa bulan gaji Anda?"

Tom menatapnya. "Sekitar itu."

"Dan setiap tahun setelahnya, itu penghematan murni."

"Atau investasi ulang murni," katanya. "Efeknya sama."

Maya mengangguk. "Inilah yang saya ingin Anda lakukan. Bukan hanya pada penyimpanan dan database — pada semuanya. Jadikan optimasi biaya sebagai fungsi berkelanjutan dari peran Anda."

Tom belum pernah mendengar pekerjaannya dideskripsikan dengan cara ini. Dia merasa deskripsi itu akurat sekaligus memuaskan.

Di bab berikutnya: kategori biaya terakhir yang tersisa — dan yang mengejutkan hampir semua orang.
