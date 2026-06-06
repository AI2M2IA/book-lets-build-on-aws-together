# Bab 6: Disk yang Mengikutimu

Tom memiliki pena merah dan kebiasaan yang membuat Leo gelisah.

Setiap Sabtu pagi, ia duduk dengan kopi dan mencetak sesuatu. Bukan email. Bukan laporan. Ia mencetak daftar apa yang dijalankan Nimbus dan membacanya seperti buku besar, baris demi baris, pena di tangan. Ia telah melakukan ini sejak minggu kedua. Suara printer memanas telah menjadi bagian dari akhir pekan.

Leo menyebutnya "hal yang dilakukan Tom yang membuat Leo merasa seperti telah melakukan sesuatu yang salah."

Sabtu itu, Tom melingkari sesuatu dan meninggalkan cetakan itu di meja Maya tanpa sepatah kata pun.

Ia menemukannya Senin pagi. Satu lingkaran. Satu catatan di margin, tiga kata:

*Semuanya. Satu mesin.*

Foto-foto sudah aman di S3 sekarang — masalah itu sudah dipecahkan. Tapi basis data masih di instance EC2 yang sama dengan server web. Riwayat pesanan, catatan pelanggan, dua bulan transaksi. Aplikasi dan segala hal di bawahnya, berbagi satu disk virtual.

"Apa yang terjadi pada basis data jika instance crash?" tanya Maya, cetakan di tangannya.

"Itu juga crash," kata Leo.

"Dan datanya?"

"Tergantung bagaimana basis data menyimpannya."

"Tergantung" itu adalah masalahnya.

**Bagaimana Instance EC2 Menyimpan Data**

Ketika instance EC2 berjalan, sistem operasinya berada di suatu tempat di disk. Disk itu
disebut **volume root**. Secara default, ini adalah **volume EBS** — bahkan ketika Anda
tidak memikirkannya.

Tapi ada sesuatu yang lain: instance EC2 juga punya penyimpanan **instance store**.

Instance store adalah penyimpanan sementara yang terlampir secara fisik ke perangkat keras yang
mendasari yang menjalankan mesin virtual Anda. Ia sangat cepat — lebih cepat daripada hampir setiap opsi
penyimpanan lain di AWS. Tapi ia datang dengan tangkapan.

Instance store bersifat **sementara**.

Ketika instance berhenti atau di-terminate, data instance store hilang. Permanen.
Tidak dapat dipulihkan. AWS tidak memperingatkan Anda dengan sangat keras tentang ini, yang adalah bagaimana tim
menemukannya: dengan kehilangan data.

Instance store sesuai untuk cache, file pemrosesan sementara, dan ruang
sementara. Tidak pernah untuk data yang Anda pedulikan.

**EBS: Disk yang Persisten**

Bayangkan hard drive eksternal yang bisa Anda colokkan ke instance EC2 Anda — yang
tidak menghilang ketika Anda mencabutnya, dan yang bisa Anda pindahkan ke mesin berbeda
jika Anda membutuhkannya. AWS menyebut ini **EBS**: Elastic Block Store.

EBS adalah penyimpanan blok persisten untuk instance EC2.

Penyimpanan blok berarti ia berperilaku seperti hard drive sungguhan: sistem operasi Anda bisa membuat
filesystem di atasnya, membaca dan menulis byte sembarang di posisi sembarang, menjalankan basis data
di atasnya, dan memperlakukannya persis seperti disk yang terlampir.

Properti kuncinya:

**Persisten.** Tidak seperti instance store, volume EBS bertahan dari stop, start instance, dan
bahkan terminasi instance (tergantung konfigurasi). Data tetap di volume
bahkan ketika tidak ada instance yang menggunakannya.

Ada nuansa konfigurasi di sini: ketika Anda membuat instance EC2, volume root
punya pengaturan yang disebut "Delete on Termination." Secara default, ini diatur ke true — volume
root dihapus ketika instance di-terminate. Untuk volume data tambahan
yang Anda lampirkan, defaultnya adalah false — mereka bertahan setelah instance di-terminate.
Anda bisa mengubah kedua pengaturan. Jika Anda ingin volume root bertahan dari terminasi instance
(untuk analisis forensik atau pemulihan data), nonaktifkan "Delete on Termination." Jika Anda ingin
volume data dibersihkan secara otomatis, aktifkan itu.

**Dapat dilampirkan dan dilepas.** Volume EBS bisa dilepas dari satu instance dan
dilampirkan ke yang lain. Jika Anda perlu memigrasikan data atau memulihkan dari instance yang gagal,
Anda bisa melepas volume dan melampirkannya kembali di tempat lain.

Alur kerja lepas-dan-lampirkan-kembali lebih lambat daripada pemulihan snapshot tetapi mempertahankan
keadaan persis volume — semua tulisan yang belum di-commit, semua data yang di-cache, keadaan
filesystem persis. Ini membuatnya berguna untuk analisis forensik (lampirkan volume ke
instance analisis tanpa mem-boot sistem asli) dan untuk migrasi data
(pindahkan volume basis data ke instance yang lebih besar tanpa mengambil snapshot).

**Lampiran tunggal (sebagian besar).** Secara default, volume EBS dilampirkan ke tepat satu
instance EC2 pada satu waktu. Satu instance bisa punya banyak volume EBS, tetapi satu
volume EBS tidak bisa di-mount oleh banyak instance secara bersamaan (dengan satu pengecualian:
EBS Multi-Attach, yang punya kasus penggunaan terbatas dan pembatasan penting).

EBS Multi-Attach memungkinkan volume io1/io2 (Provisioned IOPS) dilampirkan ke banyak instance secara bersamaan
di AZ yang sama. Ini terdengar seperti memecahkan masalah "penyimpanan bersama," tetapi datang
dengan kendala serius: aplikasi pada instance yang dilampirkan harus mampu
mengoordinasikan akses bersamaan — semantik filesystem bersama (manajemen lock, urutan
tulis) tidak disediakan oleh EBS. Dalam praktiknya, EBS Multi-Attach digunakan untuk aplikasi
basis data berkluster yang menangani koordinasi sendiri. Untuk akses file bersama
umum, EFS lebih sederhana dan lebih sesuai.

Analogi EBS: hard drive eksternal yang dicolokkan ke satu laptop. Laptop
(instance EC2) bisa membaca dan menulis ke sana. Ketika Anda selesai, Anda bisa mencabutnya dan
mencolokkannya ke laptop yang berbeda.

**Tipe Volume EBS**

Tidak semua volume EBS sama. AWS menawarkan beberapa tipe dengan profil performa
dan biaya yang berbeda.

**gp3 (General Purpose SSD)**: Pilihan default untuk sebagian besar beban kerja. Keseimbangan yang baik antara
performa dan harga. Cocok untuk volume boot, basis data kecil, dan lingkungan
pengembangan.

Sebelum gp3 menjadi default, ada **gp2** — dan Anda masih akan menemukannya di lapangan. Volume gp2 mengikat performa IOPS mereka langsung ke ukuran volume: Anda mendapat 3 IOPS per gigabyte, hingga maksimum 16.000 IOPS (yang membutuhkan volume 5.334 GB). Throughput dibatasi pada 250 MB/s. Penggabungan ini berarti bahwa pada gp2, satu-satunya cara untuk mendapat lebih banyak IOPS adalah membuat volume lebih besar — bahkan jika Anda tidak butuh ruang ekstra. gp3 mematahkan ketergantungan itu: ia mulai pada 3.000 IOPS dan 125 MB/s terlepas dari ukuran, dan membiarkan Anda mengonfigurasi IOPS dan throughput secara independen, dengan biaya lebih rendah. AWS merekomendasikan gp3 untuk volume baru, tetapi karena banyak beban kerja yang ada masih berjalan di gp2, Anda perlu tahu keduanya.

**io2 (Provisioned IOPS SSD)**: Opsi performa tinggi untuk beban kerja intensif-I/O.
Anda menentukan berapa banyak operasi I/O per detik (IOPS) yang Anda butuhkan, dan AWS menjamin
performa itu. Sesuai untuk basis data produksi besar.

**st1 (Throughput Optimized HDD)**: Penyimpanan magnetik yang dioptimalkan untuk pembacaan dan penulisan
sekuensial besar. Biaya lebih rendah daripada SSD, tetapi lebih lambat untuk I/O acak. Bagus untuk
data warehousing dan pemrosesan log.

**sc1 (Cold HDD)**: Opsi EBS termurah. Untuk data yang diakses jarang. Tidak
sesuai untuk apa pun yang sensitif waktu.

"Berapa lebih mahalnya io2 dibandingkan gp3?" tanya Tom, mendongak dari buku catatannya.

Leo membuka halaman harga. io2 berharga kira-kira tiga kali biaya per-GB gp3,
ditambah biaya terpisah per IOPS yang disediakan. Tom mencatat selisihnya. "Jadi kita gunakan gp3 sampai
basis data benar-benar membutuhkan jaminan performa."

Ujian tidak mensyaratkan Anda menghafal semua tipe. Ia menguji kemampuan Anda untuk
mencocokkan persyaratan dengan tipe yang tepat: persyaratan IOPS → io2. Beban kerja sekuensial
yang sensitif biaya → st1. Aplikasi web umum → gp3.

**IOPS vs. Throughput: Mengapa Perbedaannya Penting**

Tom kembali ke pertanyaan volume EBS Selasa berikutnya, setelah memeriksa CloudWatch.

"Saya melihat dua metrik di dasbor EBS," katanya. "IOPS dan throughput. Mereka hal yang berbeda?"

Iya.

**IOPS** (Input/Output Operations Per Second) mengukur berapa banyak operasi baca atau tulis yang bisa ditangani disk per detik. Setiap operasi biasanya kecil — 4KB hingga 256KB. IOPS tinggi penting untuk basis data yang melakukan banyak baca dan tulis kecil dan acak: mengambil baris individu, memperbarui catatan, menangani kueri bersamaan.

**Throughput** (diukur dalam MB/s) mengukur berapa banyak data bergerak per detik. Throughput tinggi penting untuk beban kerja sekuensial: membaca file log besar, analitik streaming, memuat dataset besar.

Basis data biasanya butuh IOPS tinggi dan throughput rendah-ke-moderat. Data warehouse yang memindai tabel besar butuh throughput tinggi dan bisa hidup dengan IOPS moderat.

Tom telah mengawasi metrik CloudWatch basis data Nimbus. IOPS melonjak selama jam sibuk makan malam — pembacaan pendek dan acak saat aplikasi mengambil item menu dan data pesanan. Throughput-nya rendah. Polanya cocok dengan beban kerja basis data yang butuh IOPS lebih baik, bukan throughput lebih baik.

"Jadi jika basis data melambat," kata Tom, "kita periksa apakah ia terikat-IOPS atau terikat-throughput sebelum kita meng-upgrade volume?"

"Benar," kata Priya. "Meng-upgrade dari gp3 ke io2 menambah IOPS dengan biaya. Jika masalahnya throughput, upgrade itu tidak akan membantu. Periksa metriknya terlebih dahulu."

Inilah persis bagaimana Anda menghindari upgrade penyimpanan mahal yang memecahkan masalah yang salah.

**Snapshot EBS: Cadangan**

Inilah sesuatu yang menyelamatkan perusahaan secara teratur.

Sebuah **snapshot EBS** adalah cadangan titik-waktu dari volume EBS, disimpan di S3 (meskipun
Anda mengaksesnya melalui antarmuka EBS, bukan langsung melalui S3). Snapshot bersifat
inkremental: snapshot pertama menangkap volume penuh; snapshot berikutnya hanya
menyimpan apa yang berubah sejak yang terakhir.

Anda bisa membuat volume EBS baru dari snapshot — memulihkan ke titik waktu sebelum
korupsi basis data, deployment yang buruk, atau penghapusan yang tidak disengaja.

Anda harus mengotomasi snapshot. AWS menyediakan **Amazon Data Lifecycle Manager** untuk
tujuan ini: definisikan kebijakan (ambil snapshot setiap 6 jam, simpan 7 hari terakhir), dan
ia berjalan secara otomatis.

Priya sudah menyiapkan ini sebelum basis data bahkan masuk ke produksi.

Leo belum memikirkannya.

"Sudahkah kita memikirkan apa yang terjadi jika pekerjaan snapshot gagal diam-diam?" tanya Priya. "Jika kebijakan berjalan tetapi snapshot sebenarnya tidak valid?"

Mereka menguji proses pemulihan sore itu.

Kebijakan cadangan snapshot lengkap Priya untuk basis data produksi Nimbus, begitu ia punya waktu untuk mendokumentasikannya dengan benar:

- **Snapshot harian**, dipertahankan selama 7 hari. Ini mencakup skenario pemulihan normal: deployment yang buruk, penghapusan yang tidak disengaja, peristiwa korupsi yang ditemukan dalam seminggu.
- **Snapshot mingguan** (diambil setiap Minggu pukul 2 pagi), dipertahankan selama 30 hari. Ini mencakup skenario di mana masalah tidak terdeteksi segera — korupsi data halus yang baru disadari berminggu-minggu kemudian.
- Salinan snapshot lintas-region ke `us-east-1`, sekali per minggu, dipertahankan selama 30 hari. Ini mencakup skenario di mana seluruh Region `us-west-2` tidak tersedia dan Nimbus perlu merekonstruksi basis data di tempat lain.

"Itu sepertinya banyak snapshot," kata Leo.

"Setiap snapshot inkremental setelah yang pertama itu kecil," kata Priya. "Anda hanya menyimpan apa yang berubah. Total biaya penyimpanannya moderat."

Tom sudah mencari harganya. Snapshot harian basis data 50GB, disimpan selama 7 hari, ditambah snapshot mingguan yang dipertahankan selama 30 hari — kira-kira $3 hingga $5 per bulan. Biaya tidak memilikinya, jika basis data pernah rusak, jauh lebih tinggi tak terukur.

"Dan Fast Snapshot Restore?" tanya Leo. "Saya melihat opsi itu ketika saya melihat pengaturannya."

**Fast Snapshot Restore** (FSR) adalah fitur EBS yang menghilangkan penalti performa I/O yang biasanya terjadi ketika Anda pertama kali menggunakan snapshot yang dipulihkan. Tanpa FSR, volume EBS yang baru dipulihkan berperforma buruk untuk beberapa menit atau jam pertama saat data dimuat secara malas dari S3 — pembacaan menghantam S3 untuk data yang belum ditarik ke volume. Dengan FSR diaktifkan pada snapshot di AZ tertentu, volume yang dipulihkan langsung siap untuk performa penuh.

FSR memakan biaya ekstra — Anda membayar per snapshot per AZ per jam FSR diaktifkan. Untuk snapshot pemulihan bencana Nimbus, penggunaan sesekali tidak membenarkan biaya FSR yang berkelanjutan. Untuk snapshot basis data produksi yang perlu dipulihkan dan operasional dalam hitungan menit dalam keadaan darurat, FSR layak.

"Aktifkan FSR pada snapshot mingguan yang benar-benar akan kita gunakan untuk pemulihan bencana," kata Priya. "Jangan aktifkan pada setiap snapshot harian dalam jendela retensi."

Tom menambahkan kalkulasi biaya ke spreadsheet-nya.

**Salinan Snapshot Lintas-Region untuk Pemulihan Bencana**

Snapshot EBS hidup di Region tempat mereka dibuat. Jika seluruh Region `us-west-2` mati, snapshot Anda di `us-west-2` tidak dapat diakses.

Solusinya: **salinan snapshot lintas-region**. Anda bisa menyalin snapshot EBS ke Region lain, memberi Anda cadangan yang dapat digunakan bahkan jika Region utama Anda tidak tersedia.

AWS Data Lifecycle Manager mendukung salinan lintas-region otomatis sebagai bagian dari kebijakan snapshot: ambil snapshot harian di `us-west-2`, secara otomatis salin ke `us-east-1` sekali per minggu. Jika bencana terjadi, luncurkan instance EC2 baru di `us-east-1`, pulihkan dari snapshot lintas-region, perbarui endpoint DNS, dan terus beroperasi.

"Ini adalah rencana pemulihan bencana kita untuk basis data," kata Priya, menyajikan dokumentasi kebijakan kepada tim. "Bukan arsitektur multi-region penuh — itu lebih banyak kompleksitas dari yang kita butuhkan sekarang. Tapi jika `us-west-2` mati sepenuhnya, kita bisa memulihkan di `us-east-1` dalam dua jam."

"Dua jam downtime," kata Tom.

"Versus downtime tak terbatas," kata Priya.

Tom mengakui perbedaannya.

**Enkripsi EBS: Kisah Mengapa Anda Tidak Bisa Mengenkripsi Di-Tempat**

Basis data produksi Nimbus telah berjalan selama enam minggu ketika Priya menandai sesuatu.

"Volume EBS tidak dienkripsi," katanya.

"Bisakah kita mengenkripsinya?" tanya Leo.

"Ya. Tapi tidak di-tempat."

Inilah hal tentang enkripsi EBS: Anda tidak bisa mengenkripsi volume EBS yang ada dan tidak terenkripsi secara langsung. Data sudah ditulis dalam plaintext. Untuk mengenkripsinya, Anda harus:

1. Buat snapshot dari volume yang tidak terenkripsi
2. Salin snapshot, mengaktifkan enkripsi pada salinannya
3. Buat volume EBS terenkripsi baru dari snapshot terenkripsi
4. Hentikan instance
5. Lepas volume lama yang tidak terenkripsi
6. Lampirkan volume terenkripsi baru
7. Mulai instance dan verifikasi semuanya berfungsi

Proses ini punya jendela downtime — urutan stop, lepas, lampirkan, start. Untuk Nimbus, dengan basis data kecil, jendelanya sekitar lima belas menit. Untuk basis data produksi besar dengan ratusan GB, proses snapshot dan salin bisa lebih lama, meskipun downtime instance yang sebenarnya tetap hanya siklus stop/start.

"Mengapa kita tidak bisa membalik saklar saja?" tanya Leo.

"Karena data yang ada di disk adalah byte yang tidak terenkripsi," kata Priya. "AWS tidak bisa mengenkripsi ulang mereka tanpa membaca dan menulis ulang setiap blok — yang adalah persis apa yang dilakukan proses salin snapshot. Ia membaca setiap blok dari snapshot sumber, mengenkripsi masing-masing, dan menulisnya ke snapshot baru."

Leo menelusuri prosesnya. Volume terenkripsi baru dilampirkan. Instance kembali online. Basis data berjalan di volume terenkripsi.

"Volume EBS baru bisa dibuat terenkripsi secara default," kata Priya. "Ada pengaturan tingkat-akun. Setiap volume baru dienkripsi secara otomatis. Kita seharusnya mengaktifkan ini di hari pertama."

Ia mengaktifkannya. Dari titik itu ke depan, setiap volume EBS yang dibuat di akun AWS Nimbus dienkripsi secara default — tidak ada langkah ekstra yang dibutuhkan.

**EFS: Lemari Arsip Bersama**

EBS adalah disk yang dilampirkan ke satu instance. Bagaimana jika banyak instance perlu mengakses
file yang sama secara bersamaan?

Yang Anda butuhkan adalah sesuatu seperti lemari arsip di tengah kantor — siapa pun
bisa berjalan, menarik file, mengembalikannya, dan orang berikutnya langsung melihat perubahan.
Banyak orang, secara bersamaan, mengakses penyimpanan yang sama.

AWS menyebut ini **EFS**: Elastic File System.

EFS adalah filesystem jaringan terkelola. Banyak instance EC2 bisa me-mount EFS
filesystem yang sama pada waktu yang sama dan membaca/menulis ke file bersama. Ini adalah kapabilitas kunci
yang tidak disediakan EBS.

Untuk mengatakannya dengan jelas:

EBS adalah hard drive eksternal yang dicolokkan ke satu laptop. Hanya laptop itu yang bisa menggunakannya pada
satu waktu.

EFS adalah lemari arsip di tengah kantor. Anggota tim mana pun bisa berjalan, membuka
laci, membaca file, mengembalikan sesuatu.

**Kapan Anda butuh EFS?**

- Ketika banyak instance EC2 perlu berbagi file — sistem manajemen konten, file
  konfigurasi bersama, pustaka media bersama
- Ketika Anda punya aplikasi yang diskalakan secara horizontal di mana semua instance perlu akses ke
  data yang sama
- Ketika Anda butuh filesystem persisten yang bertahan dari kegagalan instance

EFS diakses melalui jaringan menggunakan protokol NFS (khususnya NFSv4). Setiap instance EC2
yang punya konektivitas jaringan ke target mount EFS bisa me-mount-nya — termasuk
instance di AZ berbeda dalam Region yang sama. Anda mengonfigurasi target mount di setiap
AZ, dan instance terhubung ke target mount terdekat untuk performa optimal.

Implikasi praktisnya: EFS bekerja lintas-AZ secara langsung. Jika Anda punya server web
di `us-west-2a` dan `us-west-2b` yang sama-sama me-mount EFS filesystem yang sama, file yang ditulis
oleh server di `2a` langsung terlihat oleh server di `2b`. Ini adalah perilaku filesystem
bersama yang tidak bisa disediakan EBS.

**Mode Performa EFS**

EFS punya dua mode throughput yang penting untuk pengukuran:

**Elastic Throughput** (default untuk sebagian besar filesystem baru): EFS secara otomatis menskalakan throughput naik dan turun berdasarkan penggunaan aktual. Anda tidak menyediakan tingkat throughput. Anda membayar untuk yang Anda gunakan. Ini adalah mode yang tepat untuk beban kerja variabel di mana kebutuhan throughput berfluktuasi — seperti Nimbus, di mana lalu lintas Senin pagi berbeda dari Jumat malam.

**Provisioned Throughput**: Anda menentukan tingkat throughput terlepas dari data yang disimpan. Berguna ketika beban kerja Anda butuh throughput tinggi yang konsisten yang melebihi apa yang akan disediakan volume data tersimpan dalam mode Elastic. Jika Anda menjalankan sistem build yang membaca puluhan gigabyte per menit terlepas dari berapa banyak yang disimpan, Provisioned Throughput sesuai.

Ada juga mode ketiga, **Bursting Throughput**, yang merupakan perilaku EFS asli dan masih default untuk file system yang dibuat sebelum Elastic tersedia. Dalam mode Bursting, throughput berskala dengan berapa banyak data yang Anda simpan: Anda mendapat baseline 50 KB/s per GB, ditambah kredit burst yang terakumulasi ketika Anda di bawah baseline dan bisa dibelanjakan ketika Anda butuh throughput lebih tinggi (hingga 100 MB/s untuk file system yang lebih kecil, atau hingga kelipatan baseline untuk yang lebih besar). Ini adalah pilihan yang tepat untuk beban kerja dengan pola akses yang tidak dapat diprediksi atau melonjak di mana file system cukup besar untuk menghasilkan kredit burst yang berarti. Jika file system Anda kecil dan pola akses Anda melonjak, Anda bisa membakar kredit Anda dengan cepat — awasi metrik CloudWatch `BurstCreditBalance` untuk tahu di mana Anda berdiri.

Pertanyaan Tom langsung: "Apakah Elastic lebih mahal?"

"Tergantung pola penggunaan," kata Leo. "Dengan Elastic, Anda membayar untuk throughput yang benar-benar Anda konsumsi. Dengan Provisioned, Anda membayar untuk throughput yang telah Anda tentukan bahkan jika Anda tidak menggunakannya."

"Jadi untuk beban kerja variabel, Elastic biasanya lebih murah," kata Tom.

"Biasanya," kata Priya. "Periksa pola throughput Anda yang sebenarnya di CloudWatch sebelum memutuskan."

EFS juga punya dua mode performa: **General Purpose** (latensi rendah, cocok untuk sebagian besar beban kerja, default) dan **Max I/O** (throughput lebih tinggi untuk beban kerja yang sangat terparalelkan dengan mengorbankan latensi sedikit lebih tinggi). General Purpose menangani sebagian besar kasus penggunaan. Max I/O dirancang untuk aplikasi yang perlu membuat ribuan operasi filesystem bersamaan — pipeline pemrosesan media skala besar, alur kerja komputasi ilmiah dengan banyak pembaca paralel.

**EFS vs. S3:** EFS adalah filesystem (folder, file, izin, locking). S3 adalah
penyimpanan objek (unggah, unduh, tanpa semantik filesystem). EFS jauh lebih mahal
daripada S3 — kira-kira $0,30 per GB per bulan untuk EFS Standard versus $0,023 per GB per bulan
untuk S3 Standard. Gunakan S3 untuk file yang disimpan dan diambil secara utuh. Gunakan EFS untuk file
yang aplikasi aktif baca dan tulis melalui operasi filesystem standar.

**Jika EBS Maka Satu Instance, Tapi Jika EFS Maka Banyak**

Keputusan EBS/EFS bermuara pada satu pertanyaan: berapa banyak instance yang perlu mengakses penyimpanan ini pada waktu yang sama?

Jika Anda membangun aplikasi yang diskalakan secara horizontal di EBS, maka setiap instance punya disknya sendiri — tetapi ketika pengguna mengunggah file ke instance A, instance B tidak bisa melihatnya. Itu baik-baik saja untuk basis data (setiap DB punya disknya sendiri), tetapi rusak untuk konten bersama. Jika Anda butuh akses bersama, EFS adalah jawabannya — tetapi EFS berbiaya lebih per GB daripada S3, dan punya latensi lebih tinggi daripada EBS untuk I/O acak. Pilihan yang tepat sepenuhnya tergantung pada apa yang dilakukan aplikasi Anda dengan data.

**Memilih Penyimpanan yang Tepat**

Sekarang Anda telah melihat tiga tipe penyimpanan di AWS. Mari kita buat keputusannya jelas.

| Kebutuhan                                  | Tipe Penyimpanan |
|--------------------------------------------|------------------|
| Basis data butuh disk persisten, cepat     | EBS (gp3 atau io2) |
| Banyak server butuh file bersama           | EFS              |
| File, cadangan, gambar, objek besar        | S3               |
| Ruang komputasi sementara                  | Instance Store   |
| Arsip jangka panjang dengan biaya minimum  | S3 Glacier       |

Anda mungkin bertanya-tanya: jika EFS membiarkan banyak instance berbagi file, mengapa tidak menggunakannya saja untuk segalanya? Karena EFS berbiaya jauh lebih per GB daripada S3, dan punya latensi lebih tinggi daripada EBS lokal untuk I/O acak. Ia adalah alat yang tepat untuk akses filesystem bersama — bukan untuk penyimpanan file umum atau penyimpanan basis data.

Membuat keputusan ini dengan benar itu penting. Menggunakan S3 di mana Anda butuh EFS menambah kompleksitas
operasional. Menggunakan EBS di mana Anda butuh EFS menyebabkan kegagalan ketika Anda menskalakan. Menggunakan
instance store di mana Anda butuh persistensi kehilangan data.

Priya mencetak tabel ini dan menempelkannya di dinding.

"Setiap kali kita menambahkan persyaratan penyimpanan," katanya, "kita mulai di sini."

Mari kita telusuri beberapa skenario nyata untuk membuat keputusannya konkret:

**Skenario A**: Pekerjaan pelatihan machine learning berjalan di instance EC2 GPU dan perlu
membaca dataset 200GB. Pekerjaan berjalan sekali sehari dan memakan dua jam. Dataset
dibagikan oleh banyak tim riset.

Keputusan: S3. Dataset besar, dibaca-sekali-per-pekerjaan, dan dibagikan. S3 murah, durabel,
dan dapat diakses dari instance EC2 mana pun atau akun tim mana pun. Instance GPU membacanya
melalui API S3. Tidak ada kebutuhan untuk filesystem di sini.

**Skenario B**: Sebuah situs WordPress berjalan di empat instance EC2 di belakang load balancer.
WordPress menyimpan file plugin, file tema, dan unggahan pengguna di direktori pada
server. Keempat instance perlu membaca dan menulis file yang sama.

Keputusan: EFS. WordPress menggunakan semantik filesystem — ia membuat direktori, menulis
file, membaca file berdasarkan path. S3 akan membutuhkan penulisan ulang ekosistem plugin WordPress.
EFS me-mount sebagai filesystem NFS standar, yang dikerjakan WordPress secara natif.

**Skenario C**: Sebuah basis data PostgreSQL berjalan di instance EC2. Ia butuh I/O acak cepat
untuk eksekusi kueri dan pencarian indeks.

Keputusan: EBS (gp3 atau io2). Basis data butuh penyimpanan blok dengan latensi rendah untuk pembacaan
dan penulisan kecil dan acak. S3 terlalu lambat dan tidak mendukung semantik filesystem.
EFS punya latensi lebih tinggi daripada EBS untuk I/O acak.

Polanya: default untuk file adalah S3. Tambahkan EBS ketika Anda butuh penyimpanan blok untuk
instance tertentu. Tambahkan EFS ketika banyak instance perlu berbagi filesystem.
Instance store hanya untuk ruang sementara.

## Ketika EFS Tidak Cukup: Amazon FSx

Pelajaran penyimpanan berikutnya tidak datang sebagai pemadaman atau perdebatan papan tulis. Ia datang sebagai kontrak penjualan — jenis yang telah dikejar Maya sejak portal diluncurkan, jenis yang butuh satu kuartal penuh demo dan panggilan tindak lanjut untuk ditutup. Tiga bulan setelah portal operator restoran diluncurkan, Nimbus menandatangani klien multi-lokasi pertamanya: Copper Kettle, grup keluarga dengan selusin lokasi di seluruh midwest. Maya yang menjalankan kesepakatan. Tom yang membangun model keuangan. Leo telah mulai merencanakan integrasi teknis sebelum tintanya kering.

Lalu ia membaca catatan infrastruktur dari tim IT Copper Kettle.

"Server file mereka Windows," katanya. "Semuanya Windows. Perangkat lunak manajemen dapur mereka, sistem HR mereka, alat penjadwalan mereka — semuanya menulis ke drive bersama di server file Windows. Protokol SMB. Autentikasi Active Directory."

"Bisakah kita mengangkat mereka ke EFS?" tanya Maya.

Leo menggeleng. "EFS menggunakan NFS. Aplikasi mereka berbicara SMB. Itu protokol yang berbeda. Perangkat lunak Copper Kettle tidak tahu apa itu NFS. Anda tidak bisa begitu saja mengarahkannya ke mount EFS."

"Jadi kita tidak bisa menggunakan EFS."

"Tidak untuk ini. Ada layanan yang berbeda."

**FSx for Windows File Server: EFS, Tapi untuk Windows**

**Amazon FSx for Windows File Server** adalah file system bersama natif-Windows yang dikelola sepenuhnya. Ia mendukung protokol SMB (Server Message Block) — protokol yang sama yang telah digunakan server Windows, aplikasi Windows, dan share file Windows on-premises selama beberapa dekade. Ia terintegrasi dengan Active Directory, mendukung ACL Windows (izin tingkat-file), dan mendukung fitur spesifik-Windows yang benar-benar diandalkan aplikasi Windows.

Bayangkan sebagai EFS, tetapi untuk Windows — dengan semua fitur spesifik-Windows yang sudah diharapkan lingkungan Active Directory Anda. Perangkat lunak manajemen dapur Copper Kettle akan terhubung ke sana persis seperti ia terhubung ke server file on-premises. Aplikasi tidak berubah. Protokol tidak berubah. Data hanya hidup di layanan AWS terkelola alih-alih server di basement suatu tempat di Chicago.

Untuk migrasi Copper Kettle: Leo menyediakan file system FSx for Windows File Server, menghubungkannya ke Active Directory Copper Kettle (diperluas ke AWS melalui AWS Managed Microsoft AD), dan memetakan huruf drive yang ada. Perangkat lunak dapur menemukan share file-nya persis di tempat yang ia harapkan.

"Berapa biayanya per bulan?" tanya Tom.

Leo sudah melihat. FSx for Windows diberi harga per GB penyimpanan per bulan — lebih mahal daripada EFS, secara signifikan lebih dari S3, tetapi jauh lebih murah daripada memelihara server file Windows di selusin lokasi. Tom menuliskan angkanya tanpa keberatan.

**FSx for Lustre: Ketika Pekerjaan ML Anda Perlu Memberi Makan Ratusan GPU**

Sementara itu, Leo telah mulai membuat prototipe mesin rekomendasi di samping — memprediksi hidangan mana yang kemungkinan akan dipesan pelanggan berdasarkan perilaku masa lalu dan apa yang dipesan pelanggan serupa. Data pelatihannya masih kecil, tetapi eksperimen membawanya menyelami lubang kelinci tentang bagaimana tim ML serius memberi makan model mereka: pekerjaan pelatihan yang membaca ratusan gigabyte dari S3 pada setiap proses.

"Pola yang terus muncul dalam studi kasus," ia melaporkan di makan siang tim berikutnya, "adalah pekerjaan pelatihan yang ter-bottleneck pada I/O. GPU mahal yang menganggur 40% waktu, menunggu batch data berikutnya."

Ini adalah masalah yang berbeda dari penyimpanan file bersama. Ini adalah masalah komputasi performa tinggi (HPC): ketika Anda punya ratusan unit pemrosesan yang semuanya perlu membaca data secara bersamaan, pada throughput sangat tinggi, dari dataset yang sama.

**Amazon FSx for Lustre** adalah implementasi terkelola sepenuhnya dari file system paralel Lustre. Lustre dibangun khusus untuk persis skenario ini — pembacaan paralel pada throughput sangat tinggi, di banyak klien bersamaan. Ia terintegrasi secara natif dengan S3: Anda mengarahkan FSx for Lustre ke bucket S3, dan ia secara otomatis membuat data itu tersedia melalui filesystem Lustre. Pekerjaan pelatihan membaca dari titik mount lokal; FSx melakukan streaming data dari S3 di belakang layar.

Ketika pekerjaan pelatihan ML Anda perlu memberi makan data ke ratusan GPU secara bersamaan, FSx for Lustre adalah alatnya. Hal yang sama berlaku untuk pemodelan keuangan, beban kerja genomika, dan rendering video — beban kerja apa pun di mana bottleneck-nya adalah throughput I/O paralel alih-alih kapasitas penyimpanan.

Studi kasus yang telah ditandai Leo menceritakan kisahnya dalam dua angka: setelah memigrasikan pekerjaan pelatihan ke FSx for Lustre, utilisasi GPU naik dari 60% menjadi 94%, dan proses pelatihan yang telah memakan enam jam selesai dalam tiga setengah jam. Nimbus tidak akan butuh tenaga semacam itu untuk waktu yang lama — tetapi Leo menyimpan polanya untuk hari ketika mesin rekomendasi tumbuh dewasa.

**Opsi FSx Lainnya**

AWS juga menawarkan **FSx for NetApp ONTAP** — untuk perusahaan yang sudah menjalankan penyimpanan NetApp on-premises dan ingin akses multi-protokol (NFS, SMB, dan iSCSI dari filesystem yang sama) — dan **FSx for OpenZFS**, untuk beban kerja yang butuh fitur spesifik-ZFS seperti snapshot dan clone di tingkat filesystem. Keduanya adalah alat khusus untuk organisasi dengan infrastruktur atau persyaratan yang ada secara spesifik.

Untuk sebagian besar tim, keputusannya adalah antara empat varian FSx dan EFS. Pertanyaannya selalu sama: protokol apa yang dibicarakan beban kerja, dan karakteristik performa apa yang ia butuhkan?

---

> **Tips Ujian — Amazon FSx**
>
> *Domain SAA-C03: Merancang Arsitektur Berperforma Tinggi (Domain 3, Tugas 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + beban kerja Windows**. Sinyal ujian: "server file Windows," "protokol SMB," "integrasi Active Directory," "lift-and-shift aplikasi Windows." Ketika Anda melihat frasa-frasa itu, FSx for Windows adalah jawabannya.
> - **FSx for Lustre = HPC + pelatihan ML + I/O paralel + integrasi S3**. Sinyal ujian: "pelatihan machine learning," "komputasi performa tinggi," "HPC," "file system paralel," "beban kerja intensif-I/O," "kluster GPU," "integrasikan file system dengan S3." Ketika Anda melihat frasa-frasa itu, FSx for Lustre adalah jawabannya.
> - **EFS bukan pengganti untuk keduanya.** EFS adalah NFS untuk beban kerja Linux. Ia tidak berbicara SMB. Ia bukan file system performa-tinggi paralel. Menggunakan EFS di mana FSx dibutuhkan berarti aplikasi tidak berfungsi (Windows) atau ter-bottleneck-I/O (HPC).
> - **FSx for NetApp ONTAP dan FSx for OpenZFS** muncul lebih jarang, tetapi sinyalnya khas. "Migrasi penyimpanan NetApp/ONTAP yang ada," "akses multi-protokol (NFS + SMB + iSCSI)," atau "SnapMirror" → FSx for NetApp ONTAP. "ZFS," "NFS dengan snapshot/clone instan," atau "migrasi server file ZFS on-premises" → FSx for OpenZFS.
> - Referensi cepat: "SMB atau server file Windows" → FSx for Windows. "Pelatihan machine learning atau komputasi performa tinggi" → FSx for Lustre. "NetApp/multi-protokol" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## Jembatan ke Cloud: AWS Storage Gateway

Prospek terbesar Nimbus sejauh ini — sebuah jaringan regional bernama Meridian Kitchen, dua puluh lokasi di tiga negara bagian — datang dengan masalah yang tidak bisa dipecahkan dengan `aws s3 cp`.

Meridian punya data operasional bertahun-tahun yang hidup di server file on-premises. Resep, faktur, rekaman video dapur, kontrak pemasok. Bukan beberapa gigabyte. Terabyte. Dan perangkat lunak yang menghasilkan dan mengonsumsi data ini — sistem manajemen dapur mereka, platform faktur mereka, alat HR mereka — semuanya menulis ke share file lokal menggunakan NFS atau SMB. Menulis ulang aplikasi itu tidak layak. Memindahkan semua data dalam semalam juga tidak layak.

"Jadi bagaimana kita mulai memasukkan data mereka ke AWS," tanya Maya, "tanpa meminta mereka mengubah satu aplikasi pun?"

"Ada layanan untuk persis ini," kata Priya. "Ia berjalan di pusat data mereka sebagai VM, terlihat seperti server file atau perangkat penyimpanan biasa bagi perangkat lunak mereka yang ada, dan diam-diam menyimpan segalanya di AWS di belakang layar."

Layanan itu adalah **AWS Storage Gateway**: layanan penyimpanan hibrida yang menghubungkan lingkungan on-premises ke penyimpanan AWS. Ia menyajikan penyimpanan ke aplikasi Anda menggunakan protokol yang sudah mereka pahami, sementara sebenarnya mempersistensi data di S3, S3 Glacier, atau sebagai snapshot EBS.

Ada tiga tipe gateway, masing-masing memecahkan masalah on-premises yang berbeda.

**File Gateway** menyajikan antarmuka NFS atau SMB ke aplikasi on-premises. File yang ditulis ke gateway disimpan sebagai objek di S3 — tetapi aplikasi tidak tahu itu. Ia melihat file system. File yang sering diakses di-cache secara lokal untuk pembacaan latensi-rendah; sisanya hidup di S3. Inilah yang dibutuhkan Meridian: perangkat lunak manajemen dapur menulis ke apa yang terlihat seperti share file, dan data berakhir di S3 di mana Nimbus bisa menganalisisnya, mencadangkannya, dan mencarinya.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Mengapa tidak mengarahkan perangkat lunak ke S3 secara langsung saja?"

Karena NFS dan SMB bukan S3. Perangkat lunak dapur tidak berbicara API S3. Ia membuka path file. Ia menulis byte ke direktori. File Gateway menerjemahkan itu ke operasi objek S3 tanpa aplikasi tahu apa pun berubah.

**Volume Gateway** menyajikan volume penyimpanan blok iSCSI ke server on-premises — antarmuka yang sama yang akan disajikan hard drive fisik atau perangkat SAN. Ia punya dua mode: *stored volume* menyimpan data utama on-premises dengan cadangan asinkron ke S3 sebagai snapshot EBS (untuk beban kerja on-premises-dulu yang juga ingin cadangan cloud), dan *cached volume* menyimpan data utama di S3 dengan data yang sering diakses di-cache on-premises (untuk organisasi yang siap memperlakukan S3 sebagai penyimpanan utama).

**Tape Gateway** menyajikan pustaka tape virtual (VTL) ke perangkat lunak cadangan seperti Veeam, Veritas, atau NetBackup. Perangkat lunak cadangan menulis ke apa yang terlihat seperti kartrid tape fisik. Tape virtual itu disimpan di S3 dan bisa diarsipkan ke S3 Glacier. Perangkat lunak cadangan tidak berubah. Robot tape fisik dan rak hilang.

"Tim cadangan Meridian menjalankan Veeam," kata Leo. "Mereka punya tape fisik sungguhan. Penyimpanan off-site, jadwal rotasi, semuanya."

"Tape Gateway menggantikan tape fisik," kata Priya. "Konfigurasi Veeam yang sama. Pekerjaan cadangan yang sama. Tape hanya hidup di S3 alih-alih rak."

Tom mencari biaya penyimpanan tape off-site. Ia menutup tab itu tanpa komentar dan menyetujui rencana migrasi.

---

> **Tips Ujian — AWS Storage Gateway**
>
> *Domain SAA-C03: Merancang Arsitektur Berperforma Tinggi (Domain 3)*
>
> - **File Gateway = NFS/SMB → S3.** File yang ditulis oleh aplikasi on-premises menjadi objek S3. File yang sering diakses di-cache secara lokal. Pemicu ujian: "aplikasi on-premises perlu menyimpan file di S3 tanpa perubahan kode."
> - **Volume Gateway = penyimpanan blok iSCSI → snapshot S3.** Mode stored: data utama on-premises, dicadangkan ke S3 sebagai snapshot EBS. Mode cached: data utama di S3, blok yang sering diakses di-cache secara lokal. Pemicu ujian: "server on-premises butuh penyimpanan blok yang didukung cloud."
> - **Tape Gateway = VTL → S3/Glacier.** Perangkat lunak cadangan menulis ke tape virtual; tape disimpan di S3 atau diarsipkan ke Glacier. Pemicu ujian: "ganti infrastruktur cadangan tape fisik tanpa mengubah perangkat lunak cadangan."
> - **Pola ujian kunci:** "aplikasi on-premises butuh penyimpanan cloud tanpa perubahan kode" → Storage Gateway. "Ganti cadangan tape" → Tape Gateway secara spesifik.

---

## Kekuatan dan Keterbatasan

**Kekuatan EBS**:

- Penyimpanan blok yang persisten dan cepat untuk EC2
- Snapshot untuk cadangan dan pemulihan titik-waktu
- Beberapa tingkat performa untuk beban kerja yang berbeda
- Enkripsi at rest didukung secara natif — aktifkan enkripsi tingkat-akun secara default

**Keterbatasan EBS**:

- Dilampirkan ke satu instance pada satu waktu (dengan pengecualian kecil)
- Di AZ yang sama dengan instance EC2 (menyalin ke AZ lain membutuhkan snapshot)
- Anda membayar untuk penyimpanan yang disediakan, bukan hanya yang Anda gunakan
- Mengenkripsi volume yang ada dan tidak terenkripsi membutuhkan siklus snapshot-salin-pulihkan dengan jendela pemeliharaan

**Kekuatan EFS**:

- Filesystem bersama multi-instance — protokol NFS natif
- Berskala secara otomatis, Anda tidak menyediakan kapasitas
- Dapat diakses lintas-AZ dalam sebuah Region
- Mode Elastic Throughput menyesuaikan secara otomatis dengan beban kerja

**Keterbatasan EFS**:

- Lebih mahal daripada S3 per GB
- Latensi lebih tinggi daripada EBS untuk I/O acak
- Tidak tersedia di semua Region

## Memindahkan Data Secara Massal: DataSync dan Snow Family

Storage Gateway menjaga aplikasi on-premises *terhubung terus-menerus* ke penyimpanan cloud. Tapi dua skenario migrasi lain muncul terus-menerus dalam ujian — dan akhirnya dalam proyek nyata:

**AWS DataSync** adalah untuk *transfer massal online*: memindahkan dataset besar melalui jaringan antara server file NFS/SMB on-premises (atau cloud lain) dan S3, EFS, atau FSx — sekali, atau secara terjadwal. Ia menangani paralelisasi, verifikasi integritas, percobaan ulang, dan pembatasan bandwidth, dan kira-kira 10x lebih cepat daripada skrip gaya-rsync buatan tangan. Pemicu ujian: "migrasi/transfer jutaan file dari server NFS on-premises ke Amazon EFS/S3" → DataSync. (Jangan bingungkan dengan Storage Gateway, yang untuk *akses hibrida berkelanjutan*, atau DMS, yang memigrasikan *basis data*.)

**AWS Snow Family** adalah untuk ketika jaringan adalah bottleneck-nya. Memindahkan 100 TB melalui jalur 100 Mbps memakan lebih dari tiga bulan; sebuah truk lebih cepat. **Snowball Edge** adalah perangkat tangguh yang dikirim AWS kepada Anda — muat hingga ~80 TB secara lokal, kirim kembali, AWS mengimpornya ke S3. **Snowcone** adalah versi portabel kecil (~8–14 TB) untuk edge location — dihentikan di akhir 2024, meskipun mungkin masih muncul dalam pertanyaan ujian yang lebih lama (lihat pemeriksaan realitas di Bab 25). Pemicu matematika ujian: ketika soal memberi Anda ukuran dataset dan jalur tipis atau tidak andal dan menanyakan migrasi tercepat/paling praktis, hitung waktu transfer — jika itu berminggu-minggu atau berbulan-bulan, jawabannya adalah Snow Family.

> **Tips Ujian — AWS Backup**
>
> Satu layanan lagi yang menyatukan bab ini: **AWS Backup** memusatkan dan mengotomasi cadangan di seluruh EBS, EFS, RDS, DynamoDB, FSx, dan Storage Gateway dengan satu rencana cadangan — jadwal, retensi, salinan lintas-region dan lintas-akun, dan Backup Vault Lock untuk imutabilitas. Pemicu ujian: "kelola cadangan secara terpusat di banyak layanan/akun AWS" → AWS Backup, bukan skrip per-layanan.


## Ringkasan

Pena merah Tom melingkari masalah sebenarnya: terlalu banyak di satu mesin. Memindahkan penyimpanan keluar dari instance EC2 bukan hanya tentang kapasitas — ia tentang memisahkan kepentingan sehingga setiap lapisan bisa dikelola, diskalakan, dan diamankan secara independen. Pilihan penyimpanan yang tepat tergantung pada empat pertanyaan: apa yang membutuhkan penyimpanan, berapa banyak hal yang membutuhkannya sekaligus, berapa lama ia hidup, dan bagaimana ia diakses? Empat pertanyaan itu secara konsisten mengarah ke jawaban yang tepat.

- **EBS** (Elastic Block Store) adalah penyimpanan blok persisten untuk satu instance EC2. Ia bertahan dari stop instance dan bisa di-snapshot untuk cadangan. Gunakan gp3 untuk beban kerja umum, io2 untuk persyaratan IOPS tinggi. Instance store bersifat sementara dan cepat tetapi hilang ketika instance di-terminate.
- **EFS** (Elastic File System) adalah filesystem jaringan bersama yang bisa di-mount banyak instance secara bersamaan. EFS membentang lintas AZ dalam sebuah Region; EBS dibatasi pada satu AZ.
- Cocokkan tipe penyimpanan dengan persyaratan: basis data EC2 tunggal → EBS; file bersama lintas server → EFS; objek, media, cadangan → S3; arsip → S3 Glacier.
- Mengenkripsi volume EBS yang ada membutuhkan: snapshot → salinan terenkripsi → volume baru → tukar. Aktifkan enkripsi tingkat-akun secara default untuk menghindari ini untuk volume baru.
- **EBS "Delete on Termination"**: volume root default menghapus pada terminasi instance; volume data default bertahan. Tinjau kedua pengaturan saat merancang kebijakan siklus hidup instance.

## Tips Ujian

*Domain SAA-C03 3 — Tugas 3.1 (solusi penyimpanan)*

- **Volume EBS hidup di satu AZ.** Mereka hanya bisa dilampirkan ke instance di
  AZ yang sama. Untuk menggunakan volume EBS di AZ berbeda, Anda membuat snapshot dan memulihkannya
  di AZ target.
- **Snapshot EBS bersifat inkremental dan disimpan di S3.** Snapshot pertama penuh;
  yang berikutnya hanya menyimpan perubahan. Anda bisa menyalin snapshot ke Region lain untuk
  pemulihan bencana.
- **EFS bersifat lintas-AZ.** Banyak instance di AZ berbeda dalam Region yang sama
  bisa me-mount EFS filesystem yang sama. Ini adalah pembeda kunci dari EBS.
- **Ketika skenario ujian mengatakan "aplikasi web dengan konten bersama" atau "banyak
  instance mengakses file yang sama," pikirkan EFS.** Ketika mengatakan "penyimpanan basis data"
  atau "disk persisten untuk satu server," pikirkan EBS.
- **Data instance store bertahan dari reboot tetapi tidak dari stop atau terminasi.** Sebuah pertanyaan
  mungkin mendeskripsikan data yang "menghilang setelah instance dihentikan" — itu instance
  store yang berperan.
- **gp3 vs. io2**: gp3 adalah default untuk penggunaan umum; io2 untuk beban kerja yang
  butuh IOPS terjamin (basis data besar, sistem misi-kritis). Skenario ujian
  yang mendeskripsikan "persyaratan IOPS" atau "performa basis data latensi-rendah yang konsisten"
  mengarah ke io2.
- **gp2 vs. gp3:** IOPS gp2 digabungkan ke ukuran (3 IOPS/GB, maks 16.000 IOPS pada 5.334 GB); IOPS gp3 independen dari ukuran (3.000 dasar, dapat dikonfigurasi hingga 80.000 sejak akhir 2025 — materi lama, dan mungkin bank soal ujian, masih mengasumsikan batas 16.000 sebelumnya). Pola pertanyaan ujian: beban kerja butuh lebih banyak IOPS tanpa menambah penyimpanan — jawabannya adalah gp3 atau io2, bukan gp2.
- **Enkripsi at rest untuk EBS**: Anda tidak bisa mengenkripsi volume yang ada dan tidak terenkripsi
  di tempat — Anda harus snapshot, salin terenkripsi, pulihkan. Aktifkan default enkripsi tingkat-akun
  untuk menghindari membuat volume tidak terenkripsi secara tidak sengaja. Enkripsi adalah AES-256
  menggunakan kunci KMS.
- **Fast Snapshot Restore** menghilangkan penalti performa pada volume yang baru dipulihkan
  tetapi memakan biaya per snapshot per AZ. Pertanyaan ujian tentang memulihkan volume
  "segera pada performa penuh" mengarah ke FSR.
- **Mode performa EFS**: General Purpose (latensi rendah, cocok untuk sebagian besar beban kerja)
  vs. Max I/O (throughput lebih tinggi untuk beban kerja yang sangat terparalelkan).
- **Mode throughput EFS — tiga opsi:** Bursting (throughput berskala dengan ukuran penyimpanan, menggunakan kredit burst — bagus untuk beban kerja melonjak), Elastic (auto-scale, bayar per penggunaan — bagus untuk beban kerja tidak dapat diprediksi), Provisioned (throughput tetap terlepas dari penyimpanan — bagus untuk kebutuhan throughput tinggi yang konsisten). Ujian menguji apakah Anda tahu kapan menyediakan throughput vs. membiarkannya berskala elastis atau mengandalkan kredit burst.
- **Salinan snapshot lintas-region**: Snapshot EBS bisa disalin ke Region lain untuk
  pemulihan bencana. Snapshot yang disalin bersifat independen dan tidak menambah biaya transfer
  data selama pemulihan — hanya selama operasi salin itu sendiri.
- **Tipe Storage Gateway:** File Gateway = NFS/SMB → S3 (file menjadi objek). Volume Gateway = penyimpanan blok iSCSI → snapshot S3 (stored: utama on-prem; cached: utama di S3). Tape Gateway = VTL → S3/Glacier (mengganti tape fisik). Pemicu ujian: "aplikasi on-premises butuh penyimpanan cloud tanpa perubahan kode" → Storage Gateway. "Ganti cadangan tape" → Tape Gateway.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa perbedaan antara EBS dan EFS? Kapan Anda akan memilih
satu daripada yang lain?

*(Petunjuk: Pikirkan tentang apakah satu instance atau banyak instance perlu mengakses
penyimpanan pada waktu yang sama.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan menjalankan aplikasi web di empat instance EC2 di belakang load
balancer. Pengguna bisa mengunggah foto profil. Foto apa pun harus dapat dilihat oleh pengguna
segera setelah unggahan, terlepas dari instance mana yang menanganinya. Foto-foto
dilayani ke browser melalui HTTP, tidak pernah dimodifikasi di tempat, dan tim ingin
solusi yang PALING hemat-biaya, dapat diskalakan dengan overhead operasional paling sedikit.

Solusi penyimpanan mana yang PALING BAIK memenuhi persyaratan mereka?

A) Lampirkan volume EBS gp3 ke setiap instance EC2 dan sinkronkan file di antara mereka menggunakan
   pekerjaan cron  
B) Simpan foto langsung di instance store instance EC2  
C) Gunakan Amazon EFS, di-mount pada keempat instance EC2 secara bersamaan  
D) Simpan foto di S3 dan akses langsung dari kode aplikasi

**Petunjuk 1**: Persyaratannya adalah "keempat instance harus melayani foto apa pun." Pilihan mana
yang membuat file langsung terlihat oleh semua instance?

**Petunjuk 2**: Instance store bersifat sementara. EBS tidak bisa di-mount pada banyak instance
secara bersamaan. Itu mempersempitnya.

**Petunjuk 3**: Baik C maupun D secara teori bisa berhasil. Mana yang lebih sesuai untuk
kasus di mana aplikasi perlu mengakses foto melalui operasi filesystem vs.
permintaan HTTP?

**Jawaban**: D

**Penjelasan**: Menyimpan foto di S3 dan melayaninya melalui URL adalah pilihan yang
benar secara arsitektur untuk aplikasi web. Foto yang diunggah langsung dapat diakses dari
server mana pun (dan dari browser mana pun) melalui URL S3. S3 dirancang untuk persis kasus
penggunaan ini: menyimpan file yang diunggah pengguna dalam skala besar dengan ketersediaan tinggi dan nol
overhead manajemen.

Catatan: C (EFS) secara teknis akan berhasil, tetapi S3 adalah pola yang disukai untuk file biner
yang diunggah pengguna dalam aplikasi web karena ia lebih murah, lebih dapat diskalakan, dan melayani file
melalui HTTP secara langsung tanpa aplikasi bertindak sebagai proxy.

**Mengapa bukan A?** Menyinkronkan file melalui pekerjaan cron menciptakan kondisi balapan dan masalah
konsistensi. Di antara unggahan dan sinkronisasi berikutnya, file akan hilang di instance lain.

**Mengapa bukan B?** Data instance store hilang ketika instance dihentikan atau di-terminate.
Foto akan menghilang.

**Mengapa bukan C?** EFS adalah jawaban yang tepat ketika pertanyaan menuntut semantik filesystem
(mis., CMS yang memodifikasi file di tempat). Untuk foto yang diunggah pengguna yang dilayani melalui
web, S3 lebih sederhana, lebih murah, dan lebih sesuai.

**Peringatan kata-kunci-ujian**: pada ujian sebenarnya, baca soal secara harfiah. Jika dikatakan
"penyimpanan **file** bersama," "file system," "NFS," atau "POSIX," jawaban kuncinya adalah
**EFS** — jangan menimpa persyaratan yang dinyatakan dengan selera arsitektur. Skenario
ini berkunci ke S3 karena ia meminta pengiriman objek hemat-biaya melalui HTTP,
bukan untuk file system.

*Domain SAA-C03 3 — Tugas 3.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus menambahkan fitur baru: pemilik restoran bisa mengunggah menu PDF yang
kemudian diuraikan dan digunakan untuk mengisi basis data Nimbus. Pekerjaan pemrosesan PDF berjalan
di armada instance EC2 yang perlu: (a) membaca PDF yang diunggah, (b) menulis
file pemrosesan sementara, (c) menulis output yang diuraikan.

Layanan penyimpanan mana yang akan Anda gunakan untuk masing-masing dari tiga langkah ini, dan mengapa?

*(Tidak ada satu jawaban yang benar. Fokus pada mencocokkan tipe penyimpanan dengan
karakteristik setiap langkah.)*

## Adegan Pasca-Kredit

Sore itu, Nimbus memisahkan penyimpanan mereka dengan benar. Basis data mendapat volume
EBS-nya sendiri dengan snapshot otomatis dan enkripsi diaktifkan. Foto menu pindah ke S3. Instance EC2
akhirnya punya ruang untuk bernapas.

Leo menjalankan uji beban. Situs menangani dua ratus pengguna bersamaan tanpa kesulitan.

"Akan baik-baik saja dari sini," katanya, mengawasi grafik mendatar dengan mulus.

Tom melihat tagihan. Volume EBS menambah $8 sebulan. Ia menuliskannya.

"Saya terus menambahkan hal ke tagihan ini," katanya. "Kapan ini seimbang?"

"Ketika kita berhenti mengalami pemadaman," kata Maya. "Setiap pemadaman berbiaya lebih dari pencegahannya."

Tom tidak terlihat yakin. Ia akan, akhirnya.

Tiga hari kemudian, seorang pemilik restoran di platform mencoba memesan dan mendapat
kesalahan. Maya memeriksa log.

Basis data ada di sana. Aplikasi berjalan. Tapi dua puluh pengguna bersamaan
semuanya mencoba membaca menu sekaligus, dan masing-masing menghantam basis data.

"Setiap pemuatan halaman adalah kueri basis data," kata Leo. "Setiap satunya."

Priya sudah men-Google sesuatu.

Di bab berikutnya: apa yang terjadi ketika lebih banyak pelanggan datang daripada yang bisa ditangani server.
