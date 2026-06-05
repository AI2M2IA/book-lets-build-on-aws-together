# Bab 4: Komputer di Gedung Orang Lain

Aplikasi Nimbus sedang berjalan di laptop Tom.

Itu baik untuk menunjukkan demo kepada investor. Itu tidak baik ketika Maya menekan "launch"
dan 200 restoran mendaftar di minggu pertama. Laptop Tom sekarang menangani pesanan nyata, menu nyata, dan pelanggan nyata — duduk di bawah meja Tom, berjalan dari Wi-Fi kantor, dicolokkan ke stop kontak yang juga menyalakan pemanas ruangan dan pembuat kopi.

"Kita butuh server," kata Maya. "Yang nyata. Berjalan di suatu tempat yang bukan di bawah meja Anda."

Tom menatap laptopnya. Kipas terdengar dari seberang ruangan.

Itulah saat mereka mulai mencari tahu apa sebenarnya artinya menyewa komputer.

**Abstraksi yang Tidak Pernah Dijelaskan Siapa Pun**

Ketika orang mengatakan aplikasi mereka "berjalan di cloud," mereka biasanya berarti ia berjalan di
mesin virtual — komputer yang tidak secara fisik ada sebagai perangkat keras khusus,
tetapi yang berperilaku dalam setiap cara seperti itu.

Inilah mekanismenya.

Server fisik di pusat data AWS memiliki banyak sumber daya: inti CPU, memori, disk,
dan bandwidth jaringan. AWS mengambil server fisik itu dan membaginya menggunakan perangkat lunak
yang disebut **hypervisor**. Hypervisor membuat beberapa mesin virtual, masing-masing
tampak memiliki CPU, memori, dan disk khusus sendiri — tetapi sebenarnya berbagi perangkat keras fisik yang mendasarinya.

Masing-masing mesin virtual itu adalah apa yang disebut AWS sebagai **EC2 instance**.

EC2 singkatan dari Elastic Compute Cloud. Bagian "elastic" penting, dan kita akan
sampai ke sana. Untuk sekarang: EC2 instance adalah komputer yang Anda sewa per jam. Ia memiliki sistem operasi, koneksi jaringan, dan daya komputasi. Ia menjalankan aplikasi Anda sama seperti server fisik.

Analoginya: menyewa apartemen di gedung besar daripada membeli rumah.

Pemilik gedung (AWS) merawat struktur fisik, plumbing, listrik,
keamanan. Anda mendapat unit. Anda mengisinya sesuka Anda. Anda membayar bulanan (atau
per jam). Ketika Anda membutuhkan lebih banyak ruang, Anda pindah ke unit yang lebih besar. Ketika Anda pindah, Anda
berhenti membayar.

**Memilih Instance Anda: Ukuran Penting**

Tidak semua EC2 instance sama. AWS menawarkan ratusan jenis instance, diorganisasikan
ke dalam famili berdasarkan untuk apa mereka dioptimalkan.

**General purpose** (mis., `t3`, `m6i`): CPU dan memori seimbang. Pilihan default yang baik
untuk sebagian besar aplikasi web.

**Compute optimized** (mis., `c7g`): Lebih banyak CPU relatif terhadap memori. Baik untuk encoding video,
pemodelan ilmiah, pemrosesan batch.

**Memory optimized** (mis., `r7i`): Lebih banyak memori relatif terhadap CPU. Baik untuk database,
caching, analitik in-memory.

**Storage optimized** (mis., `i3`): Penyimpanan lokal berkecepatan tinggi. Baik untuk beban kerja intensif data yang membutuhkan disk I/O sangat cepat.

**Accelerated computing** (mis., `p4`): GPU terpasang. Baik untuk pelatihan machine learning dan rendering grafis.

Setiap famili memiliki ukuran. Sebuah `t3.micro` memiliki 2 CPU virtual dan 1 GB memori. Sebuah
`t3.xlarge` memiliki 4 CPU virtual dan 16 GB. Anda memilih ukuran yang tepat untuk beban kerja.

Leo telah memilih `t3.micro`.

"Berapa banyak pengguna yang bisa ditangani `t3.micro`?" tanya Tom.

"Bergantung pada aplikasi," kata Leo. "Tapi mungkin tidak seratus pengguna bersamaan
yang menjalankan upload gambar dan kueri database."

Tom menulis "t3.micro" di papan tulis dan menggambar wajah sedih di sebelahnya.

**AMI: Keadaan Awal Mesin Anda**

Sebelum Anda meluncurkan EC2 instance, Anda memilih sistem operasi dan konfigurasi awal. Di AWS, ini disebut **Amazon Machine Image** (AMI).

AMI adalah template. Ia mendefinisikan:

- Sistem operasi (Amazon Linux, Ubuntu, Windows Server, dll.)
- Perangkat lunak yang sudah terinstal
- Status disk awal

Ketika Anda meluncurkan instance dari AMI, AWS membuat salinan segar template itu
khusus untuk Anda. Anda juga bisa membuat AMI Anda sendiri — jika Anda mengkonfigurasi server persis
seperti yang Anda inginkan, Anda bisa "menyimpan" keadaan itu sebagai AMI kustom dan menggunakannya untuk meluncurkan server yang identik dengan cepat. Inilah cara Anda menerapkan lingkungan yang konsisten dalam skala besar.

Pikirkan AMI sebagai resep. Resep mendeskripsikan makanan. Setiap kali Anda mengikuti
resep, Anda mendapatkan makanan yang sama. Jika Anda ingin mengubah makanan secara permanen, Anda memperbarui
resepnya.

**Key Pair: Cara yang Benar untuk Mengakses Server**

Ingat bencana "Admin123" dari bab terakhir?

Cara yang benar untuk masuk ke EC2 instance adalah dengan **key pair**.

Key pair adalah pasangan kriptografi: kunci publik (disimpan oleh AWS di server) dan
kunci privat (file yang Anda unduh dan jaga kerahasiaannya). Untuk masuk, Anda menggunakan SSH — protokol aman — dengan kunci privat Anda. Tidak ada kata sandi. Jika Anda kehilangan kunci privat,
Anda kehilangan akses. Tidak ada "lupa kata sandi" untuk SSH.

Ini penting karena key pair:

- Unik untuk Anda
- Secara kriptografi tidak mungkin ditebak
- Tidak disimpan oleh AWS (Anda menyimpan kunci privat)
- Mudah dicabut (hapus kunci dari server, buat pasangan baru)

Priya sudah mengatur akses berbasis kunci di server Nimbus. Server Admin123 dihentikan. Tidak ada yang sedih karenanya.

**Siklus Hidup Instance: Bukan Selamanya**

Ini adalah sesuatu yang sering terlewatkan oleh banyak pemula.

EC2 instance tidak permanen secara default. Ketika Anda menghentikan instance, sumber daya komputasi dilepaskan. Ketika Anda memulainya lagi, ia mungkin berjalan di perangkat keras fisik yang berbeda. Data yang disimpan *di instance itu sendiri* (di volume root-nya) bertahan
melalui siklus berhenti/mulai — tetapi alamat IP publik berubah.

Ketika Anda *menghentikan* instance secara permanen, itu sudah pergi. Kecuali Anda memiliki penyimpanan terpisah yang dilampirkan (yang kami bahas di Bab 6), data apa pun di instance menghilang.

"Sementaraan" ini sebenarnya adalah fitur, bukan bug. Artinya Anda bisa menjalankan
server, menggunakannya, dan membuangnya. Ini memungkinkan penskalaan horizontal. Tapi itu juga
berarti Anda tidak boleh menyimpan data penting *di* EC2 instance itu sendiri.

Lalu di mana data tinggal?

Di penyimpanan terpisah. Kita sampai ke sana di dua bab berikutnya.

**Apa Artinya "Elastic"**

Kami katakan EC2 singkatan dari Elastic Compute Cloud. Apa yang elastis dari itu?

Dua hal:

**Elastisitas vertikal**: Anda bisa mengubah ukuran instance. Hentikan instance,
ubah dari `t3.micro` ke `t3.xlarge`, mulai ulang. Lebih banyak CPU dan memori, aplikasi yang sama, pengaturan yang sama.

**Elastisitas horizontal**: Anda bisa menambahkan lebih banyak instance. Daripada satu server besar,
jalankan sepuluh server menengah di belakang load balancer. Ketika lalu lintas turun, hapus instance
dan berhenti membayar untuknya.

Kedua pendekatan memecahkan masalah "satu server, terlalu banyak lalu lintas". Mereka memiliki
kompromi yang berbeda, yang kami jelajahi di Bab 7 ketika kami menambahkan Auto Scaling ke cerita.

Wawasan kunci: dengan EC2, daya komputasi adalah sesuatu yang Anda *sesuaikan* daripada sesuatu yang
Anda *beli*. Perlu lebih? Putar kenopnya ke atas. Perlu lebih sedikit? Putar ke bawah. Bayar sesuai.

## Kekuatan dan Keterbatasan

**Mengapa EC2 powerful**:

- Kontrol penuh. Anda memilih OS, perangkat lunak, konfigurasi. Itu komputer Anda.
- Ukuran yang fleksibel. Ratusan jenis instance di setiap kasus penggunaan.
- Tidak ada perangkat keras yang perlu dikelola. AWS menangani lapisan fisik.
- Penagihan per detik (untuk sebagian besar jenis instance). Anda menghentikan instance, Anda berhenti membayar.
- Bekerja dengan segalanya. EC2 adalah fondasi tempat sebagian besar layanan AWS lainnya dibangun.

**Di mana menjadi rumit**:

- Anda bertanggung jawab untuk mem-patch dan memperbarui sistem operasi. (Model Tanggung Jawab Bersama — ini adalah bagian "di cloud" yang menjadi tanggung jawab Anda.)
- Mengelola EC2 dalam skala besar berarti mengelola status instance, AMI, patch keamanan, dan
  siklus hidup di ribuan mesin. Itu overhead operasional.
- EC2 bukan jawaban yang tepat untuk segalanya. Untuk kode berbasis event yang berjalan
  jarang, Lambda (Bab 20) lebih murah dan sederhana. Untuk beban kerja yang dikontainerisasi,
  ECS dan EKS (Bab 21) menawarkan efisiensi sumber daya yang lebih baik.
- Instance yang tidak digunakan masih menghabiskan biaya. Jika Anda menghentikan instance, Anda berhenti membayar untuk
  komputasi — tetapi jika Anda memiliki penyimpanan yang dilampirkan, Anda masih membayar untuk itu.

## Ringkasan

- **EC2 instance** adalah mesin virtual yang Anda sewa di AWS. Ia memiliki OS, akses jaringan, dan sumber daya komputasi.
- Jenis instance diorganisasikan berdasarkan kasus penggunaan: general purpose, compute optimized,
  memory optimized, storage optimized, accelerated computing. Pilih famili
  dan ukuran yang tepat untuk beban kerja Anda.
- **AMI** (Amazon Machine Image) adalah template untuk OS dan konfigurasi awal instance Anda. AMI kustom memungkinkan penerapan yang konsisten dan dapat diulang.
- **Key pair** adalah cara aman untuk mengakses EC2 instance. Tidak ada kata sandi.
- EC2 instance tidak permanen secara default. Instance yang dihentikan kehilangan datanya.
  Simpan data penting di layanan penyimpanan terpisah.
- "Elastic" berarti Anda bisa menskalakan komputasi ke atas dan ke bawah — baik secara vertikal (instance yang lebih besar)
  maupun horizontal (lebih banyak instance).

## Tips Ujian

*Domain SAA-C03 3 — Tugas 3.2 (solusi komputasi berkinerja tinggi)*

- **Tanggung Jawab Bersama untuk EC2**: Anda bertanggung jawab untuk mem-patch OS.
  AWS memelihara perangkat keras fisik dan hypervisor. Ini adalah perbedaan yang sering diuji.
- **Famili instance penting untuk pertanyaan skenario.** Jika skenario menyebutkan persyaratan memori tinggi (cache in-memory, SAP HANA), jawabannya kemungkinan melibatkan instance yang dioptimalkan untuk memori. Jika menyebutkan pemrosesan batch atau HPC, compute-optimized.
- **Menghentikan sementara ≠ Menghentikan permanen.** Menghentikan sementara instance melestarikannya (Anda bisa memulai ulang). Menghentikan permanen menghapusnya. Skenario ujian menguji apakah Anda tahu perbedaan ini.
- **IP publik berubah saat restart.** Jika aplikasi Anda membutuhkan alamat IP yang stabil,
  gunakan **Elastic IP** — IP publik statis yang tetap terkait dengan akun Anda.
  Ini menghabiskan biaya jika Anda mengalokasikan satu dan tidak menggunakannya.
- Model harga **On-Demand, Reserved, dan Spot** diuji berat di Domain 4.
  Kami menutupnya di Bab 27. Untuk sekarang, ketahui bahwa On-Demand berarti bayar per detik
  tanpa komitmen.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa itu EC2 instance? Apa itu AMI? Apa hubungan
antara keduanya?

*(Petunjuk: Pikirkan tentang analogi resep — apa itu resep, dan apa itu makanan?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan sedang menerapkan aplikasi web bervolume tinggi. Aplikasi
menangani pencarian katalog produk dengan logika penyaringan kompleks yang intensif CPU.
Tim mengharapkan lonjakan lalu lintas yang signifikan selama acara obral. Mereka ingin memastikan
mereka memilih jenis EC2 instance yang tepat dan siap menghadapi lonjakan lalu lintas.

Kombinasi pilihan mana yang PALING BAIK memenuhi kebutuhan mereka?

A) Instance yang dioptimalkan memori dengan jumlah tetap untuk memastikan kinerja yang konsisten  
B) Instance yang dioptimalkan komputasi dengan Auto Scaling untuk menangani lonjakan lalu lintas  
C) Instance general-purpose dengan ukuran satu instance yang besar  
D) Instance yang dioptimalkan penyimpanan karena katalog produk memerlukan akses disk yang cepat

**Petunjuk 1**: Beban kerja dideskripsikan sebagai "intensif CPU." Famili instance mana yang
dioptimalkan untuk CPU?

**Petunjuk 2**: Skenario menyebutkan "lonjakan lalu lintas selama acara obral." Jumlah instance tetap
tidak akan menangani lalu lintas yang bervariasi secara efisien. Fitur AWS apa yang menangani ini?

**Petunjuk 3**: Instance yang dioptimalkan komputasi menangani pekerjaan berat CPU. Auto Scaling menambah
dan menghapus instance berdasarkan permintaan. Bersama-sama mereka menjawab kedua persyaratan.

**Jawaban**: B

**Penjelasan**: Instance yang dioptimalkan komputasi (seperti famili `c`) memberikan lebih banyak CPU
per dolar untuk beban kerja intensif CPU. Auto Scaling secara otomatis menyesuaikan jumlah
instance berdasarkan beban — menambahkan instance selama acara obral, menghapusnya ketika
lalu lintas kembali normal. Kombinasi ini mengoptimalkan kinerja dan biaya.

**Mengapa bukan A?** Instance yang dioptimalkan memori dirancang untuk beban kerja yang membutuhkan RAM dalam jumlah besar (database, cache in-memory). Ini adalah beban kerja terikat CPU. Dan jumlah instance tetap berarti over-provisioning (pemborosan) atau under-provisioning (kegagalan).

**Mengapa bukan C?** Instance general-purpose menukar beberapa efisiensi CPU untuk keseimbangan. Untuk
beban kerja intensif CPU yang diketahui, compute-optimized lebih tepat. Dan satu
instance besar adalah satu titik kegagalan.

**Mengapa bukan D?** Hambatannya adalah CPU, bukan disk I/O. Instance yang dioptimalkan penyimpanan
dirancang untuk beban kerja yang membutuhkan throughput sangat tinggi ke penyimpanan lokal.

*Domain SAA-C03 3 — Tugas 3.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus saat ini menjalankan satu EC2 instance `t3.micro` untuk seluruh aplikasi.
Tim perlu memutuskan: tingkatkan ke instance yang lebih besar (`t3.2xlarge`) atau tambahkan lebih banyak
instance `t3.micro` di belakang load balancer?

Telusuri komprominya. Apa keuntungan dari setiap pendekatan? Pertanyaan apa
yang akan Anda ajukan untuk memutuskan? (Petunjuk: pikirkan tentang single point of failure,
biaya, kompleksitas penerapan, dan apa yang terjadi selama pemeliharaan.)

*(Tidak ada satu jawaban yang benar. Ini tentang penalaran melalui penskalaan vertikal vs.
horizontal.)*

## Adegan Pasca-Kredit

Leo menghabiskan sore hari mengubah ukuran server. Ia berpindah dari `t3.micro` ke `t3.large`.
CPU turun ke 30%. Halaman dimuat dalam kurang dari satu detik.

Tom memantau pembaruan tagihan AWS secara real time. Instance baru menghabiskan empat kali lebih banyak
per jam. Ia membuat catatan.

Maya sedang melihat sesuatu yang lain di layarnya.

"Leo," katanya. "Saat Anda mengubah ukuran instance, situs web mati selama
dua belas menit."

Leo mendongak.

"Kami memiliki antrean dua ratus pesanan yang tidak terpenuhi."

Ia melihat layar. Lalu ke langit-langit. Lalu kembali ke layar.

"Kita butuh sesuatu untuk gambar kita," katanya, sedikit mengubah topik. "Sekarang,
foto menu yang diunggah disimpan langsung di server. Jika kita mengubah ukuran atau memulai ulang
instance, apakah kita kehilangan foto-foto itu?"

Priya sudah tahu jawabannya.

Di bab berikutnya: di mana file tinggal ketika tidak ada hard drive untuk ditunjuk.
