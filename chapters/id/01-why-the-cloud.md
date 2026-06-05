# Bab 1: Mengapa Menyewa Ketika Bisa Memiliki?

Tom sudah duduk memikirkan pertanyaan itu sejak malam sebelumnya. Ia sudah menulisnya di buku catatan, lalu mencoretnya, lalu menulisnya lagi.

Ketika Leo dan Priya tiba keesokan paginya — kopi di tangan, berdebat tentang sesuatu yang tidak relevan — Tom sudah ada di papan tulis. Pilihan ketiga masih ada di sana, tidak tersentuh. Bentuk awan, digambar oleh seseorang yang mengakui mereka tidak tahu artinya.

"Saya butuh seseorang untuk menjelaskan sesuatu kepada saya," kata Tom, tanpa berbalik. "Jika kita menyewa komputer dari Amazon daripada membeli milik sendiri — mengapa itu bisa *lebih murah*?"

Ruangan menjadi sunyi. Ini adalah jenis pertanyaan yang terdengar sederhana tetapi tidak.

"Karena," Leo mulai.

"Tidak," kata Tom. "Saya ingin memahaminya. Bukan hanya mendengar jawabannya. Mengapa menyewa lebih murah daripada memiliki?"

**Masalah Nyata Dengan Memiliki Server**

Bayangkan Anda memutuskan untuk membuka restoran. Bukan jenis Nimbus — restoran biasa.

Sebelum pelanggan pertama Anda masuk, Anda butuh meja. Kursi. Dapur. Kompor.
Piring. Staf. Anda butuh semua ini pada hari pertama, bahkan jika minggu pertama Anda sepi, bahkan
jika Anda menghabiskan tiga bulan dengan enam pelanggan per hari sebelum kabar tersebar.

Server fisik bekerja dengan cara yang sama.

Jika Nimbus membeli server mereka sendiri, mereka harus membelinya untuk puncak yang mereka harapkan.
Malam Jumat tersibuk yang bisa mereka bayangkan. Momen viral di mana seorang food blogger
menulis tentang arepa dan sepuluh ribu orang mencoba memesan sekaligus.

Tapi sebagian besar waktu, tidak sesibuk itu. Sebagian besar waktu, server-server itu hanya duduk di sana,
menggunakan listrik, hampir tidak melakukan apa-apa.

"Kami akan membayar untuk kapasitas yang tidak kami gunakan," kata Maya.

"Tepat," kata Tom, yang mengejutkan semua orang karena dia yang mengajukan pertanyaan.

**Model Penyewaan**

Inilah yang membuat komputasi cloud berbeda.

Ketika Anda menggunakan AWS, Anda tidak membeli server. Anda menyewa daya komputasi, dan Anda membayar hanya
untuk apa yang Anda gunakan. Ini lebih mirip menyewa venue daripada memiliki gedung restoran.

Pikirkan seperti ini.

Jika Anda perlu menjadi tuan rumah pesta ulang tahun untuk lima puluh orang, Anda bisa membeli rumah yang cukup besar
untuk lima puluh orang beserta meja dan kursi mereka. Atau Anda bisa menyewa sebuah venue
selama empat jam pada hari Sabtu, membayar tepat untuk ruang dan waktu yang Anda butuhkan, dan mengembalikan
kunci setelah pesta selesai.

Venue tetap ada ketika Anda membutuhkannya. Tersedia lagi ketika sesuatu yang lain
muncul. Anda tidak harus menyewa manajer gedung. Anda tidak membayar pajak properti
untuk itu sepanjang tahun.

Itulah model cloud. AWS memiliki "venue-venue" tersebut. Anda datang ketika Anda membutuhkannya.

**Tapi Tunggu — Ada Lebih Dari Itu**

"Oke," kata Leo, "tapi bagaimana jika venue saya terbakar?"

Naluri yang baik. Gelap, tapi baik.

Salah satu asumsi diam-diam ketika Anda memiliki server sendiri adalah bahwa *Anda*
bertanggung jawab untuk menjaganya tetap berjalan. Jika server di kantor Anda dijatuhkan
oleh magang yang kikuk, situs web Anda mati. Jika gedung kehilangan listrik, situs web Anda mati. Jika hard drive gagal — dan hard drive selalu gagal pada akhirnya — situs web Anda mati.

AWS mengoperasikan pusat data. Fasilitas besar yang dikelola secara profesional dengan cadangan daya,
koneksi jaringan yang redundan, keamanan fisik, dan tim insinyur yang satu-satunya
pekerjaan mereka adalah menjaga mesin-mesin itu tetap berjalan.

Anda tidak hanya menyewa daya komputasi. Anda menyewa keandalan.

"Berapa biayanya?" tanya Tom.

Kita akan sampai ke sana. Banyak bab dari sekarang, ketika mata Tom tidak akan mengantuk.

**Tiga Hal yang Dilakukan Cloud Secara Berbeda**

Mari kita buat ini konkret. Berikut adalah tiga perbedaan inti antara menjalankan
server sendiri dan menggunakan penyedia cloud.

**1. Anda membayar untuk yang Anda gunakan.**

Tidak ada server yang menganggur. Tidak ada pembelian di muka. Jika Nimbus tidak mendapat pesanan pada Senin
pagi, mereka hampir tidak membayar apa pun. Jika mereka kebanjiran pada Malam Tahun Baru, AWS
secara otomatis memiliki kapasitas yang siap.

**2. Orang lain menangani perangkat keras.**

AWS memelihara mesin fisik. Kabel jaringan. Catu daya.
Sistem pendingin. Nimbus tidak mempekerjakan siapa pun untuk melakukan ini. Mereka fokus pada
aplikasi mereka, bukan pada infrastruktur di bawahnya.

**3. Anda bisa berkembang ke atas — dan ke bawah — secara instan.**

Inilah yang membutuhkan waktu untuk benar-benar dihargai. Dengan server fisik, berkembang ke atas
berarti memesan perangkat keras baru, menunggu berminggu-minggu untuk pengiriman, menyiapkannya. Dengan AWS,
berkembang ke atas berarti mengklik tombol (atau membiarkan sistem melakukannya secara otomatis). Dan ketika
Anda tidak lagi membutuhkan kapasitas ekstra, Anda mengecilkan. Anda berhenti membayar.

Priya telah diam selama penjelasan ini. Ia memiliki pertanyaan.

"Bagaimana dengan keamanan? Siapa yang bertanggung jawab menjaga data tetap aman?"

Dan di situlah hal menjadi menarik.

**Model Tanggung Jawab Bersama**

Ini adalah salah satu konsep terpenting di seluruh AWS. Sederhana setelah Anda
memahaminya, tetapi membingungkan banyak orang — termasuk dalam ujian.

AWS dan Anda berbagi tanggung jawab untuk keamanan. Tapi setiap pihak bertanggung jawab atas
hal-hal yang berbeda.

**AWS bertanggung jawab atas keamanan *dari* cloud.**

Pusat data fisik. Perangkat keras. Infrastruktur jaringan. Hypervisor
yang menjalankan mesin virtual. Jika seseorang masuk ke pusat data AWS, itu adalah masalah Amazon.

**Anda bertanggung jawab atas keamanan *di* cloud.**

Data Anda. Aplikasi Anda. Akun pengguna Anda dan siapa yang memiliki akses ke apa. Konfigurasi yang Anda pilih. Jika seseorang mencuri kata sandi Anda dan masuk ke akun AWS Anda, itu adalah masalah Anda.

Priya mengangguk perlahan. "Jadi mereka melindungi gedung. Kami melindungi apa yang ada di dalamnya."

"Tepat," kata Maya.

"Jadi jika Leo membuka port yang tidak seharusnya..."

"Masih masalah kita," Maya mengkonfirmasi, menatap Leo.

Leo sudah mengetik sesuatu di laptopnya dan berpura-pura tidak mendengar.

## Kekuatan dan Keterbatasan

Tidak ada alat yang sempurna. Mari kita jujur tentang kedua sisinya.

**Mengapa cloud itu bagus**:

- Tidak ada biaya perangkat keras di muka
- Bayar hanya untuk yang Anda gunakan
- Berkembang secara instan ke kedua arah
- Keandalan dan keamanan fisik profesional
- Akses ke ratusan layanan terkelola (database, antrian, machine learning, dan lainnya)
  tanpa harus membangun atau memeliharanya sendiri

**Di mana menjadi rumit**:

- Biaya bisa tidak terduga jika Anda tidak memperhatikan (mimpi buruk Tom di masa depan)
- Anda bergantung pada pihak ketiga untuk infrastruktur Anda — jika AWS mengalami pemadaman di wilayah Anda,
  layanan Anda juga terpengaruh
- Ada kurva pembelajaran. AWS memiliki ratusan layanan. Mengetahui mana yang harus digunakan
  membutuhkan pengalaman, atau buku seperti ini.
- Data yang meninggalkan cloud bisa mahal. Memindahkan data dalam jumlah besar keluar dari AWS
  menghabiskan biaya. (Kami akan kembali ke ini di Bab 30.)

"Jadi kita menukar kontrol dengan kenyamanan," kata Tom.

"Dan menukar biaya di muka dengan biaya yang berkelanjutan," Maya menambahkan.

"Dan menukar masalah orang lain dengan masalah kita sendiri, di sisi keamanan," kata Priya.

"Tapi kami juga menukar server Leo yang rusak dengan server Amazon yang sangat tidak rusak," kata Leo,
yang ternyata mendengarkan sepanjang waktu.

Ia tidak sepenuhnya salah.

## Ringkasan

- Cloud adalah daya komputasi yang Anda sewa daripada miliki.
- AWS adalah penyedia cloud terbesar di dunia.
- Manfaat utama adalah penskalaan bayar sesuai penggunaan: Anda membayar hanya untuk yang Anda gunakan, dan Anda
  bisa berkembang ke atas atau ke bawah sesuai kebutuhan.
- AWS menangani infrastruktur fisik. Anda menangani aplikasi, data,
  dan konfigurasi Anda. Pembagian ini disebut **Model Tanggung Jawab Bersama**.
- Cloud tidak selalu lebih murah atau lebih sederhana — tetapi menghilangkan hambatan untuk memulai,
  dan memungkinkan penskalaan dengan cara yang tidak bisa ditandingi server fisik.

## Tips Ujian

*Domain SAA-C03: Lintas domain — Dasar-dasar konsep cloud*

- **Model Tanggung Jawab Bersama** muncul secara teratur dalam ujian. Ingat: AWS
  bertanggung jawab atas keamanan *dari* cloud (perangkat keras, pusat data, jaringan global).
  Anda bertanggung jawab atas keamanan *di* cloud (data, identitas, konfigurasi aplikasi).
- **Nuansa penting**: pembagian bergeser tergantung pada jenis layanan. Untuk EC2
  (mesin virtual yang Anda kontrol), *Anda* yang memperbarui sistem operasi. Untuk RDS (database
  terkelola), AWS yang memperbarui mesin database. Semakin "terkelola" suatu layanan,
  semakin banyak tanggung jawab yang pindah ke AWS. Skenario ujian akan mendeskripsikan insiden
  dan menanyakan siapa yang bertanggung jawab — selalu tanyakan "seberapa terkelola layanan ini?"
- Pertanyaan tentang *manfaat* cloud sering menguji CapEx vs. OpEx. Perangkat keras on-premises
  adalah pengeluaran modal (CapEx — beli sekali, depresiasi seiring waktu). Cloud adalah
  pengeluaran operasional (OpEx — bayar bulanan). AWS menggeser biaya dari CapEx ke OpEx.
- "Elastisitas" — kemampuan untuk berkembang ke atas *dan ke bawah* secara otomatis — adalah manfaat cloud inti. Anda mungkin melihatnya dipasangkan dengan "skalabilitas" dalam ujian. Elastisitas berarti penskalaan otomatis berbasis permintaan ke kedua arah. Skalabilitas berarti sistem *bisa* berkembang, tetapi belum tentu menyusut secara otomatis.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: jelaskan Model Tanggung Jawab Bersama. Siapa yang bertanggung jawab atas apa,
dan mengapa perbedaan itu penting?

*(Petunjuk: Pikirkan tentang analogi Priya — siapa yang melindungi gedung, dan siapa yang melindungi apa yang ada
di dalamnya.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan sedang memigrasikan aplikasi webnya dari pusat data on-premises
ke AWS. Tim keamanan khawatir tentang mempertahankan kepatuhan terhadap kebijakan perlindungan data mereka. Seorang insinyur baru bertanya: "Sekarang kita sudah di AWS, apakah Amazon menangani semua
persyaratan keamanan kita?"

Mana dari berikut ini yang PALING BAIK mendeskripsikan bagaimana tanggung jawab keamanan dibagi?

A) AWS sepenuhnya bertanggung jawab atas semua keamanan setelah aplikasi di-hosting di cloud  
B) Pelanggan sepenuhnya bertanggung jawab atas semua keamanan, termasuk keamanan pusat data fisik  
C) AWS mengelola keamanan infrastruktur yang mendasarinya; pelanggan mengelola keamanan data, aplikasi, dan konfigurasi mereka  
D) Tanggung jawab keamanan dinegosiasikan per akun dan bergantung pada tingkat layanan pelanggan

**Petunjuk 1**: Pikirkan tentang apa yang secara fisik dikendalikan AWS versus apa yang Anda kendalikan.

**Petunjuk 2**: AWS memiliki pusat data. Anda memilih apa yang akan dimasukkan dan bagaimana mengkonfigurasi
aplikasi Anda.

**Petunjuk 3**: Kami memperkenalkan nama spesifik untuk pembagian tanggung jawab ini dalam
bab ini.

**Jawaban**: C

**Penjelasan**: Model Tanggung Jawab Bersama AWS membagi keamanan menjadi dua domain.
AWS mengamankan infrastruktur fisik — pusat data, perangkat keras, dan jaringan.
Pelanggan mengamankan semua yang mereka terapkan di atasnya: data mereka, kontrol akses mereka,
konfigurasi aplikasi mereka, dan pengaturan jaringan mereka.

**Mengapa bukan A?** AWS tidak pernah mengambil tanggung jawab penuh atas keamanan aplikasi pelanggan.
Begitu Anda mengkonfigurasi sesuatu, konfigurasi itu milik Anda untuk dikelola.

**Mengapa bukan B?** Pelanggan tidak bertanggung jawab atas keamanan pusat data fisik —
itulah justru salah satu keuntungan menggunakan AWS.

**Mengapa bukan D?** Model Tanggung Jawab Bersama adalah kerangka tetap, bukan pengaturan yang dinegosiasikan.

*Domain SAA-C03: Lintas domain — Konsep cloud / Tanggung Jawab Bersama*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Seorang teman sedang meluncurkan aplikasi baru dan meminta pendapat Anda. Mereka memutuskan antara
membeli dua server fisik (satu untuk aplikasi, satu untuk database) atau menggunakan penyedia cloud. Proyeksi lalu lintas mereka adalah 10-100 pengguna per hari, tetapi mereka memiliki acara peluncuran
dalam tiga bulan yang mungkin membawa 10.000 pengguna dalam satu hari.

Telusuri komprominya. Pilihan mana yang akan Anda rekomendasikan, dan apa alasan utamanya? Apa yang akan Anda korbankan dengan pilihan Anda?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah melatih pemikiran dalam kompromi.)*

## Adegan Pasca-Kredit

Tiga hari kemudian, Nimbus memiliki akun AWS.

Leo telah membuatnya pada pukul 11 malam menggunakan alamat email pribadinya, kartu kredit yang harus ia pinjam dari Tom, dan antusiasme yang, dalam retrospeksi, sedikit mengkhawatirkan.

"Saya menemukan sesuatu yang disebut EC2," katanya keesokan paginya, menunjukkan layar laptopnya.
"Ini seperti komputer yang Anda sewa. Saya pikir saya sudah memulai satu."

"Kamu *pikir*?" tanya Priya.

"Maksud saya, saya pasti sudah memulai satu." Ia menggulir ke bawah. "Saya hanya tidak tahu di mana itu."

Maya menunduk dan melihat layar.

"Leo," katanya. "Mengapa tertulis 'Region: ap-southeast-1'?"

"Apa artinya itu?"

Di bab berikutnya: geografi AWS — di mana server sebenarnya berada, dan mengapa itu penting.
