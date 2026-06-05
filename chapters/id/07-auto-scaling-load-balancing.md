# Bab 7: Restoran yang Berkembang Ketika Sibuk

Pukul 7:43 pada hari Jumat ketika tingkat kesalahan melampaui 12%.

Tom menyadarinya pertama kali karena Tom selalu menyadarinya pertama kali. Dia memiliki tab terbuka ke dasbor CloudWatch yang dia perbarui dengan cara orang lain memeriksa media sosial — secara refleks, terus-menerus, tanpa benar-benar bermaksud demikian.

"Leo," katanya.

Leo sudah melihat. Waktu respons: meningkat. Permintaan yang mengantre: meningkat. Satu instance EC2 — bahkan yang lebih besar yang mereka tingkatkan sebulan lalu — berada pada 94% CPU.

"Kami menolak pelanggan," kata Tom.

"Kami tidak menolaknya," kata Leo. "Server yang sedang bekerja."

"Itu sama halnya."

Itu sama. Dan itu telah terjadi setiap hari Jumat selama tiga minggu. Nimbus telah bertahan dari krisis penyimpanan — database memiliki disk sendiri, foto-foto ada di S3 — tetapi stabil dan skalabel adalah masalah yang sama sekali berbeda. Sistem itu berfungsi. Hanya saja tidak tumbuh.

Tim mereka membutuhkan sistem mereka untuk menangani beban variabel secara otomatis. Tidak untuk membeli server yang cukup untuk kasus terburuk dan membuang-buang uang saat waktu tenang. Dan tidak untuk bergegas secara manual ketika lonjakan lalu lintas terjadi.

Ada pola untuk ini. AWS memiliki dua layanan yang mengimplementasikannya.

**Konsep: Skala Horizontal**

Ada dua cara untuk membuat sistem menangani lebih banyak beban.

**Skala vertikal** berarti membuat satu server menjadi lebih besar. Lebih banyak CPU. Lebih banyak RAM.
Kami melakukan ini di Bab 4 ketika kami meningkatkan dari `t3.micro` ke `t3.large`. Ini membantu.
Tetapi itu memiliki batas: Anda hanya bisa sebesar itu, instance harus di-restart untuk diubah ukurannya, dan Anda masih memiliki satu titik kegagalan.

**Skala horizontal** berarti menambahkan lebih banyak server. Alih-alih satu server besar, jalankan lima server menengah. Ketika lalu lintas turun, jalankan dua. Ketika itu melonjak, jalankan sepuluh.

Skala horizontal memiliki keunggulan yang tidak dimiliki skala vertikal:

- Tidak ada satu titik kegagalan. Jika satu server mati, yang lain tetap melayani.
- Tidak diperlukan restart untuk menambah kapasitas.
- Bayar hanya untuk apa yang Anda gunakan — tambahkan server saat Anda membutuhkannya, hapus saat Anda tidak membutuhkannya.
- Peningkatan linear: dua kali server, kira-kira dua kali throughput.

Masalahnya: jika Anda memiliki beberapa server, bagaimana cara pengguna tahu server mana yang harus mereka ajak bicara?

**Application Load Balancer: Satu Pintu, Banyak Ruangan**

**Application Load Balancer** (ALB) adalah pintu depan aplikasi Anda.

Pengguna terhubung ke load balancer. Load balancer mendistribusikan permintaan masuk ke seluruh armada instansi EC2 Anda. Setiap pengguna melihat satu alamat (URL load balancer). Di balik alamat tersebut, permintaan disebarkan ke sejumlah server yang sedang berjalan.

Bayangkan sebuah restoran besar dengan konter resepsionis di pintu. Pengunjung tiba dan resepsionis mengarahkan mereka ke meja yang tersedia. Resepsionis tahu meja mana yang sibuk dan mana yang kosong. Pengunjung tidak perlu tahu berapa banyak meja yang ada — mereka hanya berjalan masuk dan resepsionis menangani distribusinya.

ALB melakukan ini dengan permintaan web. Ia menerima setiap permintaan HTTP masuk dan memutuskan instansi EC2 mana (disebut **target**) yang harus menanganinya, berdasarkan faktor-faktor seperti:

- Round-robin (setiap server mendapat giliran dalam rotasi)
- Least outstanding requests (server dengan jumlah permintaan yang sedang berlangsung paling sedikit mendapatkan permintaan berikutnya)
- Kesehatan — hanya target yang sehat yang menerima lalu lintas

**Health checks** sangat penting. ALB secara teratur mengirimkan permintaan uji ke setiap target. Jika target tidak merespons dengan benar, ALB menandainya tidak sehat dan berhenti mengirim lalu lintas ke sana. Ketika target pulih, lalu lintas dilanjutkan.

Ini otomatis. Anda mengonfigurasi parameter pemeriksaan kesehatan; ALB menegakkannya.

**Auto Scaling: Restoran yang Membuka Lebih Banyak Meja**

Sebuah ALB mendistribusikan lalu lintas ke server yang ada. Tetapi ia tidak menambahkan server ketika Anda membutuhkan lebih banyak.

**Auto Scaling** melakukan itu.

Sebuah **Auto Scaling Group** (ASG) adalah konfigurasi yang memberi tahu AWS:

- Jumlah minimum instance yang selalu berjalan
- Jumlah maksimum instance yang diizinkan
- Kondisi di mana untuk melakukan penskalaan keluar (menambahkan instance) atau penskalaan masuk (menghapusnya)

Kondisi penskalaan disebut **kebijakan**. Jenis yang paling umum adalah:

**Target tracking**: "Pertahankan pemanfaatan CPU rata-rata sebesar 70%." Ketika pemanfaatan CPU rata-rata melebihi 70%, AWS meluncurkan instance baru. Ketika itu turun di bawah, instance dihentikan.

Ini otomatis. Tidak ada yang perlu memantau metrik. Tidak ada yang perlu meluncurkan server secara manual. Sistem bereaksi terhadap beban secara *real-time*.

Priya menyaksikan ini terjadi secara langsung selama keramaian Jumat untuk pertama kalinya. Jumlah server naik dari 2 menjadi 5 selama lima belas menit, lalu kembali ke 2 setelah keramaian.

"Itu," katanya, "benar-benar mengesankan."

Tom sedang menonton grafik biaya. Tagihan meningkat selama keramaian dan turun setelahnya. "Kami hanya membayar apa yang kami gunakan," katanya, sama terkesannya.

**Cara Kerja ALB dan ASG Bersama**

Kedua layanan ini dirancang untuk digunakan bersama.

Anda menempatkan ALB di depan. ALB mengarah ke **target group** — sebuah kumpulan instance yang seharusnya menerima lalu lintas. Auto Scaling Group mengelola instance tersebut: ia menambahkannya ke target group ketika melakukan penskalaan keluar, menghapusnya ketika melakukan penskalaan masuk.

Alur kerjanya:

1. Lalu lintas tiba di ALB
2. ALB mendistribusikan permintaan ke target yang sehat
3. CPU/load meningkat pada target tersebut
4. ASG mendeteksi peningkatan beban, meluncurkan instance baru
5. Instance baru lulus pemeriksaan kesehatan, terdaftar dengan ALB
6. ALB mulai mengirimkan lalu lintas ke mereka
7. Beban menurun, ASG menghentikan instance ekstra
8. ALB berhenti mengirimkan lalu lintas ke instance yang dihentikan

Ini terjadi tanpa campur tangan manusia.

**Launch Templates: Blueprint untuk Instance Baru**

Ketika ASG meluncurkan instance baru, ia perlu tahu apa yang akan diluncurkan. Ini didefinisikan
dalam **Launch Template** — sebuah AMI, jenis instance, grup keamanan yang akan diterapkan,
dan data pengguna (skrip startup yang berjalan saat instance boot).

Pola umum: Anda membangun aplikasi Anda ke dalam AMI khusus (lihat Bab 4).
Ketika ASG membutuhkan instance baru, ia meluncurkan AMI tersebut. Instance baru boot dengan
aplikasi Anda sudah terinstal. Tidak diperlukan pengaturan manual.

Untuk lingkungan yang lebih dinamis, Anda juga dapat menggunakan **skrip data pengguna** yang menarik dan
menginstal versi terbaru dari kode Anda saat startup. Ini lebih fleksibel tetapi membutuhkan waktu lebih lama untuk boot.

Pilihan yang tepat tergantung pada berapa lama instance Anda perlu boot dan seberapa sering aplikasi Anda berubah.

**Sticky Sessions: Masalah Halus**

Berikut adalah sesuatu yang menjebak banyak tim ketika mereka pertama kali menerapkan load balancing.

Beberapa aplikasi web menyimpan data sesi — status login, isi keranjang belanja — di server itu sendiri (dalam memori atau pada disk lokal). Ini berfungsi dengan baik dengan satu server.
Dengan beberapa server, itu rusak.

Seorang pengguna masuk. Permintaan pergi ke Server A. Server A menyimpan sesi tersebut. Permintaan berikutnya pergi ke Server B. Server B tidak memiliki sesi. Pengguna tampak logout.

Ini dapat diatasi dalam dua cara:

**Sesi Menempel** (atau affinity sesi): Konfigurasikan ALB untuk selalu mengirimkan permintaan
dari pengguna yang sama ke server yang sama. Ini adalah solusi jangka pendek. Ini merusak load
balancing (beberapa server mendapatkan lebih banyak "pengguna menempel" daripada yang lain) dan menciptakan masalah
ketika sebuah instance dihentikan.

**Desain Aplikasi Tanpa Keadaan** (Stateless): Simpan data sesi secara eksternal — di database atau
cache seperti ElastiCache (Bab 10). Setiap server dapat merekonstruksi sesi pengguna mana pun dari penyimpanan eksternal. Server menjadi dapat dipertukarkan. Ini adalah pendekatan yang tepat
untuk aplikasi yang dapat diskalakan secara horizontal.

Priya menyebut ini "keputusan arsitektur terpenting yang Anda buat ketika Anda menggunakan beberapa server." Dia benar. Kami menemukannya lagi di Bab 10.

**Jenis Load Balancer**

AWS menawarkan tiga jenis load balancer, masing-masing cocok untuk lalu lintas yang berbeda:

**Application Load Balancer (ALB)**: Lalu lintas HTTP dan HTTPS. Lapisan 7 (memahami
HTTP). Dapat merutekan berdasarkan jalur URL (`/api` ke satu grup, `/static` ke yang lain),
header host, dan parameter kueri. Ini yang paling banyak digunakan oleh aplikasi web.

**Network Load Balancer (NLB)**: Lalu lintas TCP, UDP, dan TLS. Lapisan 4 (tidak memahami
HTTP). Kinerja sangat tinggi, jutaan permintaan per detik, latensi sangat rendah. Gunakan ketika Anda membutuhkan kecepatan mentah atau ketika Anda tidak berurusan dengan HTTP.

**Gateway Load Balancer (GWLB)**: Untuk merutekan lalu lintas melalui perangkat jaringan virtual pihak ketiga (firewall, deteksi intrusi). Anda jarang memerlukannya pada tingkat junior.

Untuk Nimbus (dan untuk sebagian besar aplikasi web), ALB adalah pilihan yang tepat.

## Kekuatan dan Keterbatasan

**Mengapa ALB + Auto Scaling itu Kuat**:

- Skala tanpa gangguan (instance ditambahkan/dihapus tanpa mengganggu koneksi yang ada)
- Failover otomatis (instance yang tidak sehat dihapus dari lalu lintas secara otomatis)
- Efisiensi biaya (bayar hanya untuk instance yang berjalan)
- Tidak ada titik kegagalan tunggal — banyak instance di beberapa AZ

**Di mana hal ini menjadi rumit**:

- Aplikasi stateful membutuhkan penanganan khusus (sesi lengket atau status eksternal)
- Skala keluar membutuhkan waktu — jika lonjakan lalu lintas terjadi secara instan, ada jeda sebelum instance baru siap. Anda dapat mengurangi ini dengan **skala yang dijadwalkan** (memperbesar sebelum peristiwa yang diketahui) atau jumlah minimum instance yang lebih besar
- Lebih banyak komponen yang bergerak berarti lebih banyak yang dipantau dan di-debug
- Beberapa aplikasi tidak dapat diskalakan secara horizontal dengan mudah (database, sistem warisan tertentu). Skalabilitas horizontal paling baik untuk lapisan tanpa status.

## Ringkasan

- **Skalabilitas horizontal** (menambahkan lebih banyak server) lebih disukai daripada skalabilitas vertikal (membuat satu server lebih besar) karena menghilangkan titik kegagalan tunggal dan memungkinkan biaya yang elastis.
- **Application Load Balancer (ALB)** mendistribusikan lalu lintas HTTP/HTTPS masuk ke beberapa target EC2. Ini melakukan pemeriksaan kesehatan dan hanya merutekan ke instance yang sehat.
- **Auto Scaling Group (ASG)** secara otomatis menyesuaikan jumlah instance EC2 berdasarkan kebijakan penskalaan yang ditentukan (misalnya, penggunaan CPU target).
- ALB dan ASG bekerja bersama: ASG mengelola armada, ALB mendistribusikan lalu lintas ke dalamnya.
- Aplikasi stateful harus menggunakan sesi lengket (perbaikan jangka pendek) atau eksternalisasi status (desain jangka panjang yang benar).
- Untuk lalu lintas HTTP, gunakan ALB. Untuk kinerja TCP/UDP mentah, gunakan NLB.

## Tips Ujian

*SAA-C03 Domain 2 — Tugas 2.1 (arsitektur yang dapat diskalakan) / Domain 3 — Tugas 3.2*

- **Pemeriksaan kesehatan ASG dapat berasal dari EC2 atau ALB.** Pemeriksaan kesehatan EC2 hanya mendeteksi
  apakah instance sedang berjalan. Pemeriksaan kesehatan ALB mendeteksi apakah aplikasi
  merespons dengan benar. Pemeriksaan kesehatan ALB lebih komprehensif dan sebaiknya
  digunakan untuk aplikasi web.
- **Pelacakan penskalaan target adalah jawaban ujian yang paling umum** untuk kebijakan penskalaan.
  Penskalaan sederhana (menambahkan N instance saat alarm memicu) lebih tua dan kurang adaptif.
- **Penskalaan ke luar cepat; penskalaan ke dalam lambat.** AWS mengakhiri instance secara bertahap selama penskalaan ke dalam untuk menghindari mengganggu koneksi aktif — perilaku yang dikendalikan oleh pengaturan **penundaan deregistration** ALB.
- **Jumlah instance minimum adalah lantai ketahanan Anda.** Jika Anda mengatur minimum = 1
  dan instance tersebut gagal, aplikasi Anda akan mati sebelum ASG dapat bereaksi. Atur
  minimum ≥ 2 dan sebarkan di seluruh AZ untuk ketahanan yang sebenarnya.
- **ALB dapat mendistribusikan lalu lintas di seluruh AZ secara otomatis.** Dengan cross-zone load balancing diaktifkan, setiap node ALB mendistribusikan permintaan secara merata ke semua target terdaftar terlepas dari AZ. Ini penting untuk beban yang seimbang ketika jumlah instance instance AZ berbeda.

## Latihan

**Latihan 1 — Ingat Kembali**

Dalam kata-kata Anda sendiri: apa perbedaan antara Application Load Balancer dan
Auto Scaling Group? Masalah apa yang diselesaikan masing-masing, dan mengapa Anda biasanya
menggunakannya bersama-sama?

*(Petunjuk: Satu mendistribusikan lalu lintas yang sudah ada; yang lain menyesuaikan jumlah kapasitas yang Anda miliki.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan ritel mengalami lalu lintas situs web e-commerce yang sangat bervariasi:
lalu lintas rendah pada hari kerja, lonjakan besar pada akhir pekan dan selama acara flash sale.
Mereka ingin aplikasi mereka menangani beban puncak tanpa memelihara kapasitas yang tidak terpakai
pada periode yang tenang. Aplikasi saat ini menyimpan data sesi dalam memori server.

Perubahan arsitektur mana yang PALING BAIK untuk mengatasi persyaratan skalabilitas mereka?

A) Tingkatkan ke satu instance EC2 yang sangat besar yang dapat menangani lalu lintas puncak
B) Sebarkan beberapa instance EC2 di belakang ALB dengan Grup Skala Otomatis, dan
   eksternalisasi penyimpanan sesi ke ElastiCache
C) Sebarkan beberapa instance EC2 di belakang ALB dengan sesi menempel diaktifkan
D) Tambahkan instance EC2 secara manual sebelum setiap lonjakan lalu lintas yang diharapkan dan
   akhiri mereka setelahnya

**Petunjuk 1**: "Tanpa memelihara kapasitas yang tidak terpakai" berarti Anda membutuhkan penskalaan otomatis,
bukan instance besar tetap atau manajemen manual.

**Petunjuk 2**: Penyimpanan sesi dalam memori server adalah masalah untuk penerapan multi-instance
. Pilihan mana yang mengatasi ini?

**Petunjuk 3**: Pilihan C menggunakan sesi menempel — itu adalah solusi sementara, bukan perbaikan.
Pilihan mana yang mengatasi skalabilitas dan masalah penyimpanan sesi dengan benar?

**Jawaban**: B

**Penjelasan**: ALB dengan Grup Skala Otomatis menyediakan penskalaan elastis otomatis—instance ditambahkan selama lonjakan dan dihapus selama periode yang tenang. Memindahkan penyimpanan sesi ke ElastiCache (cache eksternal) membuat aplikasi menjadi tidak berstatus—sebuah instance apa pun dapat menangani permintaan pengguna mana pun, dan ALB dapat mendistribusikan lalu lintas secara bebas.
Ini adalah solusi arsitektur yang benar.

**Mengapa tidak A?** Satu instance besar, tidak peduli seberapa besar, tetap menjadi satu titik kegagalan. Ini juga membuang-buang uang pada periode yang tenang ketika sebagian besar kapasitasnya tidak terpakai.

**Mengapa Tidak C?** Sesi lengket mengarahkan pengguna ke instance yang sama, yang sebagian mengurangi masalah sesi tetapi merusak *load balancing*. Jika instance tersebut berakhir (selama *scale-in* atau kegagalan), pengguna tetap kehilangan sesi mereka.

**Mengapa Tidak D?** Peningkatan skala manual memerlukan seseorang untuk memprediksi lonjakan lalu lintas dengan benar dan bertindak sebelumnya. Ini lambat, rawan kesalahan, dan membutuhkan banyak tenaga kerja. *Auto Scaling* menangani ini secara otomatis.

*SAA-C03 Domain 2 — Tugas 2.1 / Domain 3 — Tugas 3.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus memiliki promosi besar yang akan datang: diskon 50% untuk semua pesanan selama 4 jam berikutnya pada hari Sabtu. Tahun lalu, promosi serupa menyebabkan lalu lintas 10 kali lipat normal. Tim memperkirakan lonjakan akan tiba-tiba dan berlangsung tepat 4 jam.

*Auto Scaling* akan bereaksi pada akhirnya, tetapi ada jeda waktu. Bagaimana Anda merancangnya untuk lonjakan yang diketahui ini? Apa perbedaan antara peningkatan skala reaktif dan proaktif, dan kapan masing-masing masuk akal?

*(Tidak ada jawaban tunggal yang benar. Pikirkan tentang tindakan peningkatan skala terjadwal, *pre-warming*, dan implikasi biaya dari setiap pendekatan.)*

## Adegan Setelah Kredit

Pada hari Jumat pertama setelah menerapkan *Auto Scaling* dan ALB, tim mengamati metrik bersama-sama.

7:15pm: dua instance berjalan. Beban normal.
7:45pm: beban meningkat. *Auto Scaling* meluncurkan dua instance lagi.
8:00pm: empat instance menangani puncak. Waktu respons stabil.
9:30pm: beban turun. *Auto Scaling* menghentikan dua instance.
9:45pm: kembali ke dua instance.

Situs tidak pernah turun. Tidak pernah.

Leo memperbarui halaman metrik tiga kali, seolah-olah dia mengharapkan menemukan kegagalan yang terlewatkan.

"Apakah aneh bahwa saya merasa sedikit kecewa tidak ada yang rusak?" katanya.

"Ya," kata Priya.

Tom sedang melihat tagihan. Biayanya telah mengikuti lalu lintas hampir sempurna.
"Kami membayar apa yang kami gunakan," katanya. "Tidak lebih. Tidak kurang."

Dia terdengar benar-benar terkejut.

Keesokan paginya, Maya menemukan masalah baru di log kesalahan. Bukan pemadaman — lebih buruk.

"Database kami," katanya, "mengembalikan waktu query rata-rata delapan detik."

Delapan detik. Untuk aplikasi pemesanan restoran.

"Setiap kali seseorang memuat menu, kami mengkueri setiap item dalam database untuk membangun halaman," kata Leo. "Dan sekarang kami memiliki empat puluh tujuh restoran."

"Berapa banyak item menu total?" tanya Tom.

Leo menjalankan kuerinya.

"Sekitar dua puluh dua ribu."

Kesunyian.

Di bab berikutnya: database yang tidak memerlukan DBA — hanya kartu kredit.
