# Bab 6: Disk yang Mengikutimu

Tom memiliki pena merah dan kebiasaan yang membuat Leo gelisah.

Setiap Sabtu pagi, Tom mencetak ringkasan konsol AWS — instance yang berjalan, volume penyimpanan, disk yang terpasang — dan meninjauinya baris demi baris. Dia telah melakukan ini sejak minggu kedua. Dia menyebutnya "buku besar." Leo menyebutnya "hal Tom yang membuatnya merasa seperti dia telah melakukan kesalahan."

Pada hari Sabtu itu, Tom melingkari sesuatu dan meninggalkan cetakan itu di meja Maya tanpa sepatah kata pun.

Dia menemukannya Senin pagi. Satu lingkaran. Satu catatan di margin, tiga kata:

*Semuanya. Satu mesin.*

Server web. Database. Semua catatan pelanggan. Dua bulan riwayat pesanan. Semuanya berjalan di satu instance EC2.

"Apa yang terjadi pada database jika instance tersebut crash?" tanya Maya, dengan cetakan itu di tangannya.

"Itu juga crash," jawab Leo.

"Dan datanya?"

"Tergantung bagaimana database menyimpannya."

"Tergantung" itulah masalahnya.

**Cara Instance EC2 Menyimpan Data**

Ketika sebuah instance EC2 berjalan, sistem operasinya berada di suatu tempat di disk. Disk itu disebut **volume root**. Secara default, ini adalah **volume EBS** — bahkan jika Anda tidak memikirkannya.

Tetapi ada sesuatu yang lain: instance EC2 juga memiliki **penyimpanan instance store**.

Penyimpanan instance bersifat penyimpanan sementara yang terpasang secara fisik ke perangkat keras yang menjalankan mesin virtual Anda. Ini sangat cepat — lebih cepat daripada hampir semua opsi penyimpanan lainnya di AWS. Tetapi ada satu tangkapannya.

Penyimpanan instance bersifat **sementara**.

Ketika instance berhenti atau dihentikan, data penyimpanan instance hilang. Secara permanen. Tidak dapat dipulihkan. AWS tidak memperingatkan Anda terlalu keras tentang ini, yang merupakan cara tim menyadarinya: dengan kehilangan data.

Instance store cocok untuk cache, pemrosesan file sementara, dan ruang
scratch. Jangan pernah untuk data yang Anda pedulikan.

**EBS: Disk Persisten**

**Amazon EBS** — Elastic Block Store — adalah penyimpanan blok persisten untuk instance EC2.

Penyimpanan blok berarti berperilaku seperti hard drive sungguhan: sistem operasi Anda dapat membuat
sistem berkas di atasnya, membaca dan menulis byte arbitrer pada posisi arbitrer, menjalankan database
di atasnya, dan memperlakukannya sama seperti disk yang terpasang.

Properti kuncinya:

**Persisten.** Tidak seperti instance store, volume EBS bertahan selama instance berhenti, dimulai, dan
bahkan dihentikan. Data tetap berada di volume bahkan ketika tidak ada instance yang menggunakannya.

**Dapat dipasang dan dilepas.** Volume EBS dapat dilepas dari satu instance dan
dipasang ke instance lain. Jika Anda perlu memigrasikan data atau memulihkan dari instance yang gagal, Anda dapat melepas volume dan memasangnya kembali di tempat lain.

**Pemasangan tunggal (biasanya).** Secara default, volume EBS terpasang ke tepat satu
instance EC2 pada satu waktu. Satu instance dapat memiliki beberapa volume EBS, tetapi satu volume EBS tidak dapat dipasang oleh beberapa instance secara bersamaan (dengan satu pengecualian: EBS Multi-Attach, yang memiliki kasus penggunaan dan batasan yang terbatas).

Analogi: EBS adalah hard drive eksternal yang Anda colokkan ke laptop. Laptop
(instance EC2) dapat membaca dan menulis ke dalamnya. Ketika Anda selesai, Anda dapat mencabutnya dan
memasangnya ke laptop yang berbeda.

**Jenis Volume EBS**

Tidak semua volume EBS sama. AWS menawarkan beberapa jenis dengan kinerja dan profil biaya yang berbeda.

**gp3 (General Purpose SSD)**: Pilihan default untuk sebagian besar beban kerja. Keseimbangan yang baik antara kinerja dan harga. Cocok untuk volume boot, database kecil, dan lingkungan pengembangan.

**io2 (Provisioned IOPS SSD)**: Pilihan berkinerja tinggi untuk beban kerja yang intensif I/O.
Anda menentukan berapa banyak operasi input/output per detik (IOPS) yang Anda butuhkan, dan AWS menjamin
kinerjanya. Cocok untuk database produksi yang besar.

**st1 (Throughput Optimized HDD)**: Penyimpanan magnetik yang dioptimalkan untuk baca dan tulis berurutan besar. Lebih murah daripada SSD, tetapi lebih lambat untuk I/O acak. Baik untuk gudang data dan pemrosesan log.

**sc1 (Cold HDD)**: Opsi EBS termurah. Untuk data yang jarang diakses. Tidak
sesuai untuk apa pun yang sensitif terhadap waktu.

Ujian ini tidak mengharuskan Anda untuk menghafal semua jenis. Ini justru menguji kemampuan Anda untuk mencocokkan persyaratan dengan jenis yang tepat: persyaratan IOPS → io2. Beban kerja berurutan yang sensitif terhadap biaya → st1. Aplikasi web umum → gp3.

**EBS Snapshot: Cadangan**

Ini adalah sesuatu yang dilakukan perusahaan secara teratur.

**EBS snapshot** adalah cadangan titik waktu dari volume EBS, yang disimpan di S3 (meskipun Anda mengaksesnya melalui antarmuka EBS, bukan langsung melalui S3). Snapshot bersifat inkremental: snapshot pertama menangkap seluruh volume; snapshot berikutnya hanya menyimpan apa yang telah berubah sejak yang terakhir.

Anda dapat membuat volume EBS baru dari snapshot — memulihkan ke titik waktu sebelum korupsi database, penerapan yang buruk, atau penghapusan yang tidak disengaja.

Anda harus mengotomatiskan snapshot. AWS menyediakan **Amazon Data Lifecycle Manager** untuk ini
tujuan: definisikan kebijakan (ambil snapshot setiap 6 jam, simpan 7 hari terakhir), dan
itu berjalan secara otomatis.

Priya telah menyiapkan ini sebelum database bahkan masuk ke produksi.

Leo belum memikirkannya.

**EFS: Lemari Arsip Bersama**

EBS adalah disk yang terpasang ke satu instance. Apa jadinya jika beberapa instance perlu mengakses file yang sama secara bersamaan?

Masuklah **Amazon EFS** — Elastic File System.

EFS adalah sistem berkas jaringan yang dikelola. Beberapa instance EC2 dapat memasang sistem berkas EFS yang sama pada saat yang sama dan membaca/menulis ke berkas yang dibagikan. Ini adalah kemampuan utama yang tidak disediakan oleh EBS.

Bayangkan ini:

EBS adalah hard drive eksternal yang dicolokkan ke satu laptop. Hanya laptop itu yang dapat menggunakannya pada satu waktu.

EFS adalah lemari arsip di tengah kantor. Setiap anggota tim dapat berjalan ke sana, membuka laci, membaca berkas, dan memasukkan sesuatu kembali. Banyak orang, secara bersamaan, mengakses penyimpanan yang sama.

**Kapan Anda perlu EFS?**

- Ketika beberapa instance EC2 membutuhkan berbagi berkas — sistem manajemen konten, berkas konfigurasi yang dibagikan, perpustakaan media yang dibagikan
- Ketika Anda memiliki aplikasi yang diskalakan secara horizontal di mana semua instance membutuhkan akses ke data yang sama
- Ketika Anda membutuhkan sistem berkas persisten yang bertahan selama kegagalan instance

**EFS vs. S3:** EFS adalah sistem berkas (folder, berkas, izin, penguncian). S3 adalah penyimpanan objek (unggah, unduh, tanpa semantik sistem berkas). EFS jauh lebih mahal daripada S3. Gunakan S3 untuk berkas yang disimpan dan diambil secara keseluruhan. Gunakan EFS untuk berkas yang secara aktif dibaca dan ditulis oleh aplikasi melalui operasi sistem berkas standar.

**Memilih Penyimpanan yang Tepat**

Hingga saat ini, Anda telah melihat tiga jenis penyimpanan di AWS. Mari buat keputusan menjadi jelas.

| Kebutuhan                                  | Jenis Penyimpanan     |
|---------------------------------------|------------------|
| Database membutuhkan disk persisten dan cepat  | EBS (gp3 atau io2) |
| Beberapa server membutuhkan berkas yang dibagikan    | EFS              |
| Berkas, cadangan, gambar, objek besar | S3               |
| Ruang komputasi sementara | Instance Store   |
| Arsip jangka panjang dengan biaya minimum    | S3 Glacier       |

Mendapatkan keputusan ini tepat sangat penting. Menggunakan S3 ketika Anda membutuhkan EFS menambah kompleksitas operasional. Menggunakan EBS ketika Anda membutuhkan EFS menyebabkan kegagalan saat Anda menskalakan. Menggunakan instance store ketika Anda membutuhkan persistensi kehilangan data.

Priya mencetak tabel ini dan menempelkannya di dinding.

"Setiap kali kita menambahkan persyaratan penyimpanan," katanya, "kita mulai di sini."

## Kekuatan dan Keterbatasan

**Kekuatan EBS**:

- Penyimpanan blok yang persisten dan cepat untuk EC2
- Snapshot untuk pencadangan dan pemulihan titik waktu
- Beberapa tingkatan kinerja untuk berbagai beban kerja
- Enkripsi saat istirahat didukung secara native

**Keterbatasan EBS**:

- Terpasang ke satu instance pada satu waktu (dengan pengecualian kecil)
- Di dalam AZ yang sama dengan instance EC2 (menyalin ke AZ lain memerlukan snapshot)
- Anda membayar untuk penyimpanan yang dialokasikan, bukan hanya apa yang Anda gunakan

**Kekuatan EFS**:

- Sistem file bersama multi-instance — protokol NFS native
- Menskalakan secara otomatis, Anda tidak perlu menyediakan kapasitas
- Dapat diakses di seluruh AZ dalam sebuah Region

**Keterbatasan EFS**:

- Lebih mahal daripada S3 per GB
- Latensi lebih tinggi daripada EBS untuk I/O acak
- Tidak tersedia di semua Region

## Ringkasan

- **Instance store** adalah penyimpanan sementara, cepat, yang terpasang secara fisik ke host.
  Data hilang ketika instance berhenti atau dihentikan. Hanya untuk ruang scratch saja.
- **EBS** (Elastic Block Store) adalah penyimpanan blok persisten untuk satu instance EC2.
  Ini bertahan selama instance berhenti. Ini dapat di-snapshot untuk cadangan. Pilih jenis volume yang tepat
  (gp3 untuk penggunaan umum, io2 untuk persyaratan IOPS tinggi).
- **EFS** (Elastic File System) adalah sistem file jaringan bersama yang dapat dipasang secara bersamaan oleh banyak instance.
  Gunakan ini ketika beberapa server membutuhkan akses ke file yang sama.
- Cocokkan jenis penyimpanan dengan persyaratan: database → EBS; file bersama → EFS;
  objek/cadangan → S3; arsip → S3 Glacier.

## Tips Ujian

*SAA-C03 Domain 3 — Tugas 3.1 (solusi penyimpanan)*

- **Volume EBS hidup di satu AZ.** Mereka hanya dapat dipasang ke instance di AZ yang sama. Untuk menggunakan volume EBS di AZ yang berbeda, Anda membuat snapshot dan memulihkannya di AZ target.
- **Snapshot EBS bersifat inkremental dan disimpan di S3.** Snapshot pertama penuh; yang berikutnya hanya menyimpan perubahan. Anda dapat menyalin snapshot ke wilayah lain untuk pemulihan bencana.
- **EFS bersifat cross-AZ.** Beberapa instance di AZ yang berbeda dalam wilayah yang sama dapat memasang sistem file EFS yang sama. Ini adalah pembeda utama dari EBS.
- Ketika skenario ujian mengatakan "aplikasi web dengan konten bersama" atau "beberapa instance mengakses file yang sama," pikirkan EFS. Ketika itu mengatakan "penyimpanan database" atau "disk persisten untuk satu server," pikirkan EBS.
- **Data instance store bertahan selama reboot tetapi tidak selama berhenti atau penghentian.** Sebuah pertanyaan mungkin menggambarkan data yang "menghilang setelah instance dihentikan" — itu adalah instance store yang berperan.

## Latihan

**Latihan 1 — Ingat Kembali**

In kata-kata Anda sendiri: apa perbedaan antara EBS dan EFS? Kapan Anda akan memilih
salah satunya daripada yang lain?

*(Petunjuk: Pikirkan apakah satu instance atau beberapa instance perlu mengakses
penyimpanan pada saat yang sama.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan menjalankan aplikasi web di seluruh empat instance EC2 di belakang load
balancer. Pengguna dapat mengunggah foto profil. Semua empat instance harus dapat menyajikan
foto pengguna mana pun segera setelah diunggah, terlepas dari instance mana yang menangani
unggah tersebut. Tim membutuhkan penyimpanan file bersama yang persisten.

Solusi penyimpanan mana yang TERBAIK memenuhi persyaratan ini?

A) Lampirkan volume gp3 EBS ke setiap instance EC2 dan sinkronkan file di antara mereka menggunakan
   pekerjaan cron
B) Simpan foto langsung di penyimpanan instance store dari EC2
C) Gunakan Amazon EFS, yang dipasang pada semua empat instance EC2 secara bersamaan
D) Simpan foto di S3 dan aksesnya langsung dari kode aplikasi

**Petunjuk 1**: Persyaratan adalah "empat instance harus menyajikan foto apa pun." Pilihan mana yang membuat file
langsung terlihat oleh semua instance?

**Petunjuk 2**: Instance store bersifat sementara. EBS tidak dapat dipasang pada beberapa instance
secara bersamaan. Itu mempersempitnya.

**Petunjuk 3**: Baik C dan D secara teoritis dapat berfungsi. Pilihan mana yang lebih tepat untuk
kasus di mana aplikasi perlu mengakses foto melalui operasi filesystem vs.
permintaan HTTP?

Jawaban: D

Penjelasan: Menyimpan foto di S3 dan menyajikannya melalui URL adalah pilihan arsitektur yang paling tepat untuk aplikasi web. Foto yang diunggah dapat diakses segera dari
siapa pun (dan dari browser mana pun) melalui URL S3. S3 dirancang untuk kasus penggunaan ini: menyimpan file yang diunggah pengguna dalam skala besar dengan ketersediaan tinggi dan tanpa overhead manajemen.

Catatan: C (EFS) secara teknis akan berfungsi, tetapi S3 adalah pola yang disukai untuk file biner yang diunggah pengguna dalam aplikasi web karena lebih murah, lebih skalabel, dan melayani file langsung melalui HTTP tanpa aplikasi bertindak sebagai proxy.

**Mengapa tidak A?** Menyinkronkan file melalui pekerjaan cron menciptakan kondisi balapan dan masalah konsistensi. Antara unggahan dan sinkronisasi berikutnya, file akan hilang di instans lain.

**Mengapa tidak B?** Data penyimpanan instans hilang ketika instans dihentikan atau dihentikan. Foto akan hilang.

**Mengapa tidak C?** EFS adalah jawaban yang tepat jika aplikasi membutuhkan semantik sistem file (misalnya, CMS yang memodifikasi file di tempat). Untuk foto yang diunggah pengguna yang disajikan melalui web, S3 lebih sederhana, lebih murah, dan lebih tepat.

*SAA-C03 Domain 3 — Tugas 3.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus menambahkan fitur baru: pemilik restoran dapat mengunggah menu PDF yang kemudian diproses dan digunakan untuk mengisi database Nimbus. Pekerjaan pemrosesan PDF berjalan pada armada instans EC2 yang perlu: (a) membaca PDF yang diunggah, (b) menulis file pemrosesan sementara, (c) menulis output yang diproses.

Layanan penyimpanan mana yang akan Anda gunakan untuk setiap langkah ini, dan mengapa?

*(Tidak ada jawaban tunggal yang benar. Fokuslah pada pencocokan jenis penyimpanan dengan karakteristik setiap langkah.)*

## Adegan Setelah Kredit

Pada sore itu, Nimbus memisahkan penyimpanan mereka dengan benar. Database mendapatkan volume EBS sendiri dengan snapshot otomatis. Foto menu dipindahkan ke S3. Instans EC2 akhirnya memiliki ruang untuk bernapas.

Leo menjalankan uji beban. Situs tersebut menangani dua ratus pengguna bersamaan tanpa keringat.

Tom melihat tagihannya. Volume EBS menambah $8 per bulan. Dia mencatatnya.

"Aku terus menambahkan hal-hal ke tagihan ini," katanya. "Kapan ini seimbang?"

Ketika kita berhenti mengalami pemadaman,” kata Maya. “Setiap pemadaman berharga lebih mahal daripada pencegahannya.”

Tom tidak terlihat yakin. Dia akan, pada akhirnya.

Tiga hari kemudian, seorang pemilik restoran di platform tersebut mencoba melakukan pemesanan dan mendapatkan kesalahan. Maya memeriksa log.

Database ada di sana. Aplikasi sedang berjalan. Tetapi dua puluh pengguna bersamaan semuanya mencoba membaca menu sekaligus, dan masing-masing dari mereka menekan database.

“Setiap pemuatan halaman adalah kueri database,” kata Leo. “Setiap satu.”

Priya sudah mencari di Google sesuatu.

Pada bab berikutnya: apa yang terjadi ketika lebih banyak pelanggan tiba daripada yang dapat ditangani oleh server.
