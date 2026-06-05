# Babat 19: Mesin Tiket

Mesin tiket adalah revolusi yang tenang. Ambil nomor, tunggu dipanggil. Antrian menjadi antrean. Orang bisa duduk. Counter layanan bekerja dengan kecepatan sendiri. Tidak ada yang menghalangi orang lain.

Nimbus memiliki masalah yang tidak terasa seperti masalah sampai pesanan menjadi populer.

Setiap kali pesanan ditempatkan, server API harus:

1. Menyimpan pesanan ke dalam database
2. Mengirim notifikasi ke tablet restoran
3. Mengirim email konfirmasi ke pelanggan
4. Memperbarui dasbor analitik restoran
5. Mencatat kejadian untuk penagihan

Semua ini harus terjadi secara sinkron sebelum API dapat menanggapi pelanggan. Jika layanan email lambat (kadang-kadang memang lambat), pelanggan harus menunggu. Jika dasbor analitik mati (kadang-kadang memang mati), pesanan gagal.

"Kami sangat terhubung," kata Priya. "Jika langkah hilir mana pun gagal, seluruh pesanan gagal."

"Bagaimana jika kita dapat menyimpan pesanan dan segera mengonfirmasi ke pelanggan," kata Leo, "dan kemudian memproses sisanya di latar belakang?"

"Itu adalah antrian," kata Priya.

**Model Counter Deli**

Di counter deli yang sibuk, orang di register tidak menunggu pemotong menyelesaikan pemotongan sebelum melayani pelanggan berikutnya. Mereka mengambil pesanan, menyerahkannya ke dapur, dan mulai melayani orang berikutnya. Dapur memproses pesanan dengan kecepatan sendiri.

Pelanggan mendapatkan layanan yang lebih cepat. Dapur tidak kewalahan oleh lonjakan tiba-tiba. Jika dapur mengalami momen lambat, pesanan menumpuk di antrian daripada menyebabkan kesalahan di register.

Ini adalah **dekupling**: memisahkan komponen yang menerima pekerjaan dari komponen yang memprosesnya.

Dalam sistem perangkat lunak, antrian seringkali merupakan broker pesan — sebuah layanan yang menerima pesan dari produsen dan mengirimkannya ke konsumen.

**Amazon SQS: Antrian**

**Amazon SQS (Simple Queue Service)** adalah layanan antrian pesan yang dikelola AWS. Ini menyimpan pesan hingga mereka diproses oleh konsumen.

Aliran dasar:

1. **Produser** (server API) menempatkan pesan di antrian: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. API segera menanggapi pelanggan: "Pesanan dikonfirmasi!"
3. **Konsumen** (layanan pekerja terpisah) membaca pesan dari antrian dan memprosesnya: mengirim notifikasi ke restoran, mengirim email konfirmasi, memperbarui analitik

Pengalaman pelanggan: konfirmasi instan. Pemrosesan hilir: terjadi secara asinkron, dengan kecepatan pekerja.

**Konsep Kunci SQS**

**Waktu Kedaluwarsa Visibilitas Pesan**: Ketika konsumen membaca pesan dari SQS, pesan menjadi *tidak terlihat* bagi konsumen lain selama periode (default: 30 detik). Ini memberi konsumen waktu untuk memprosesnya. Jika konsumen selesai dengan sukses, ia menghapus pesan. Jika konsumen mogok, waktu kedaluwarsa visibilitas kedaluwarsa dan pesan menjadi terlihat lagi untuk konsumen lain untuk mencoba lagi.

Ini memastikan pengiriman setidaknya sekali: setiap pesan akan diproses setidaknya sekali, bahkan jika konsumen gagal di tengah pemrosesan.

**Antrian Surat Mati (DLQ)**: Jika pesan gagal diproses terlalu banyak kali (dikonfigurasi — misalnya, 5 percobaan), SQS memindahkannya ke antrian surat mati. Anda memeriksa DLQ untuk memahami mengapa pesan gagal tanpa kehilangan mereka.

**Jenis Antrian**:

**Antrian Standar**: Throughput maksimum (jumlah pesan per detik yang tidak terbatas). Urutan pengiriman terbaik upaya (tidak dijamin). Pengiriman setidaknya sekali (sangat jarang, pesan mungkin dikirimkan dua kali).

**Antrian FIFO**: Urutan pertama masuk, pertama keluar yang ketat. Pengiriman tepat sekali. Terbatas hingga 3.000 pesan per detik dengan pengelompokan, 300 tanpa. Gunakan saat urutan penting (transaksi keuangan, perubahan status berurutan).

Untuk Nimbus, sebagian besar antrian menggunakan antrian standar. Antrian penagihan menggunakan FIFO untuk memastikan biaya diproses dalam urutan.

**Amazon SNS: Pemancar**

**Amazon SNS (Simple Notification Service)** adalah layanan pesan pub/sub (publish/subscribe). Alih-alih satu produsen, satu konsumen (antrian), SNS mendukung satu pesan yang dikirim ke *banyak* pelanggan secara bersamaan.

Modelnya:

1. Seorang **penerbit** mengirim pesan ke topik SNS
2. Semua **pelanggan** dari topik tersebut menerima pesan secara bersamaan (fan-out)

Pelanggan dapat berupa:

- Antrian SQS (mendorong pesan ke antrian untuk pemrosesan asinkron)
- Fungsi Lambda (memicu fungsi secara langsung)
- Titik akhir HTTP/HTTPS (pengiriman webhook)
- Alamat email
- SMS (nomor telepon)

Untuk Nimbus, acara pesanan yang ditempatkan diterbitkan ke topik SNS bernama `order-events`:

- Layanan notifikasi restoran berlangganan (menerima di antrian SQS-nya)
- Layanan email berlangganan (menerima di antrian SQS-nya)
- Layanan analitik berlangganan (menerima di antrian SQS-nya)
- Layanan penagihan berlangganan (menerima di antrian FIFO SQS-nya)

Satu acara pesanan. Empat pelanggan. Semua diberitahu secara bersamaan. Setiap memproses dengan kecepatan sendiri.

"Jadi SNS adalah pengumuman," kata Maya, "dan SQS adalah kotak masuk tempat setiap tim memproses pengumuman dengan kecepatan sendiri."

"Tepat," kata Leo. "SNS/SQS fan-out adalah pola standar."

**Pola Fan-Out SNS/SQS**

Kombinasi ini — topik SNS yang memberi makan beberapa antrian SQS — adalah salah satu pola arsitektur terpenting di AWS:

```
API Server
    |
    | publishes to
    ↓
SNS Topic: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
SQS Queue         SQS Queue         SQS Queue
(notifications)  (email service)   (analytics)
    |                 |                 |
    ↓                 ↓                 ↓
Worker             Worker            Worker
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

Berikut terjemahan Markdown dari buku AWS untuk pemula ke dalam Bahasa Indonesia yang lancar:

Setiap antrian bersifat independen. Layanan analitik dapat berjalan lambat—antriannya penuh, tetapi layanan notifikasi dan email terus beroperasi tanpa terpengaruh. Jika layanan analitik gagal, pesannya menunggu di antrian hingga kembali aktif. Tidak ada yang hilang.

Ini adalah properti kunci: **gagal secara independen**. Masalah dalam satu konsumen tidak menyebar ke yang lain.

**Penyaringan Pesan: Tidak Semua Pesan untuk Setiap Pemasok**

Saat sistem berkembang, Anda tidak ingin setiap pemasok memproses setiap pesan. Layanan analitik seharusnya tidak menerima pesan tentang pemrosesan pembayaran yang gagal jika hanya peduli dengan pesanan yang selesai.

**Penyaringan pesan SNS** memungkinkan pemasok menentukan kebijakan filter—hanya kirim pesan yang cocok dengan atribut tertentu.

Layanan notifikasi restoran berlangganan dengan filter: hanya pesan di mana `status = "confirmed"`.

Layanan peringatan kesalahan berlangganan dengan filter: hanya pesan di mana `status = "failed"`.

Setiap pemasok hanya menerima apa yang dibutuhkan.

**Kapan Menggunakan SQS vs SNS**

**SQS saja**: Satu produsen, satu konsumen (atau beberapa konsumen bersaing pada antrian yang sama). Pesan perlu diproses sekali, dalam urutan (FIFO) atau tidak (standar). Pola antrian pekerja—satu antrian, beberapa pekerja yang mengkonsumsi dari antrian tersebut.

**SNS saja**: Notifikasi "fire-and-forget". Kirim ke email, SMS, atau endpoint HTTP. Tidak perlu mengantre pesan—hanya beritahu dan lanjutkan.

**SNS + SQS (fan-out)**: Satu acara, beberapa konsumen independen. Setiap konsumen memiliki antrian sendiri, memproses secara independen, dan dapat gagal secara independen.

## Kekuatan dan Batasan

**Mengapa SQS dan SNS itu kuat**:

- SQS menyediakan pengiriman pesan yang tahan lama dan andal—pesan disimpan di beberapa AZ
- Decoupling memungkinkan penskalaan dan penerapan independen dari layanan produsen dan konsumen
- Antrian surat mati memastikan tidak ada pesan yang hilang secara diam-diam karena kegagalan
- Pola fan-out SNS memungkinkan penambahan konsumen baru tanpa mengubah produsen

**Di mana hal itu menjadi rumit**:

- Pengiriman setidaknya sekali berarti konsumen harus *idempoten*—memproses pesan yang sama dua kali tidak boleh menyebabkan masalah (pesanan duplikat, biaya duplikat)
- Antrian FIFO lebih mahal dan memiliki batasan throughput
- Debug pesan yang gagal di beberapa antrian dan layanan membutuhkan pencatatan dan kemampuan observasi yang baik
- Jaminan urutan pesan terbatas—jika urutan yang ketat penting di beberapa layanan, desainnya menjadi kompleks

## Ringkasan

- **Decoupling** memisahkan komponen yang menghasilkan pekerjaan dari komponen yang memprosesnya.
- **SQS** adalah antrian yang dikelola. Produsen mengirim pesan; konsumen membaca dan memprosesnya secara asinkron.
- **SQS Standar**: throughput tinggi, urutan terbaik upaya, pengiriman setidaknya sekali.
- **SQS FIFO**: urutan ketat, pengiriman tepat sekali, throughput lebih rendah.
- **SNS** adalah layanan pub/sub. Satu pesan, banyak pelanggan secara bersamaan.
- **SNS + SQS fan-out**: pola standar untuk satu acara yang memicu beberapa pipeline pemrosesan independen.
- **Antrian surat mati**: menangkap pesan yang gagal memproses setelah terlalu banyak percobaan ulang.
- **Idempotensi**: rancang konsumen untuk memproses pesan duplikat dengan aman.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur yang Tangguh (Domain 2, Tugas 2.1)*

- **SQS Standar vs FIFO**: Ujian membedakan berdasarkan urutan dan jaminan pengiriman. "Harus diproses dalam urutan" → FIFO. "Throughput maksimum" → Standar.
- **Waktu kedaluwarsa visibilitas**: Konsep kunci untuk pengiriman setidaknya sekali. Jika konsumen gagal, pesan menjadi terlihat lagi setelah waktu kedaluwarsa. Ujian skenario: "pesan sedang diproses dua kali" → waktu kedaluwarsa visibilitas terlalu pendek (konsumen membutuhkan waktu lebih lama dari waktu kedaluwarsa untuk memproses).
- **Antrian surat mati**: Pesan yang gagal setelah N percobaan ulang dipindahkan di sini. Ujian skenario: "memastikan tidak ada pesan yang hilang bahkan jika pemrosesan gagal berulang kali" → DLQ.
- **Fan-out SNS**: Pola ujian klasik untuk satu acara yang memicu beberapa konsumen. "Pemberitahuan pesanan harus memicu email, SMS, dan pembaruan inventaris secara bersamaan" → Topik SNS dengan langganan SQS.
- **SQS + Lambda**: Lambda dapat dikonfigurasi untuk mempolling antrian SQS dan memicu pada setiap batch pesan. Ujian menggunakan ini untuk pemrosesan berbasis acara pada skala besar.
- **Polling panjang SQS**: Alih-alih konsumen mempolling setiap beberapa detik (polling pendek, membuang panggilan API), polling panjang menunggu hingga 20 detik untuk pesan. Mengurangi biaya dan respons kosong palsu.

## Latihan

**Latihan 1 — Ingat**

Jelaskan pola fan-out SNS/SQS. Mengapa pola ini menggunakan antrian SQS alih-alih memiliki layanan berlangganan langsung ke topik SNS dengan endpoint HTTP?

*(Petunjuk: Pikirkan apa yang terjadi jika salah satu endpoint HTTP tidak berfungsi saat SNS menerbitkan pesan.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Platform e-commerce memproses 10.000 pesanan per jam. Saat pesanan ditempatkan, sistem harus: (1) menyimpan pesanan dalam database, (2) mengurangi inventaris, (3) mengirim email konfirmasi, dan (4) memperbarui dasbor analitik. Saat ini, keempat langkah terjadi secara sinkron—jika layanan analitik lambat, pelanggan harus menunggu. Tim ingin meningkatkan waktu respons yang dihadapi pelanggan sambil memastikan tidak ada pesanan yang hilang.

Arsitektur MANA yang PALING baik untuk mengatasi persyaratan ini?

A) Gunakan antrian SQS FIFO untuk memproses keempat langkah dalam urutan.
B) Biarkan API menyimpan urutan dan segera mengonfirmasi ke pelanggan; publikasikan acara ke topik SNS; biarkan layanan inventaris, email, dan analitik berlangganan melalui antrian SQS.
C) Gunakan instans EC2 paralel untuk memproses setiap langkah secara bersamaan, secara sinkron.
D) Gunakan API Gateway dengan validasi permintaan untuk mempercepat pemrosesan pesanan.

**Petunjuk 1**: Konfirmasi pelanggan harus segera. Langkah mana yang harus terjadi sebelum respons, dan langkah mana yang dapat terjadi setelahnya?

**Petunjuk 2**: Layanan analitik yang lambat tidak boleh memengaruhi layanan email atau inventaris.

**Petunjuk 3**: Fan-out SNS memungkinkan ketiga layanan hilir untuk menerima acara secara bersamaan.

**Jawaban**: B

**Penjelasan**: API menyimpan pesanan ke database (sinkron — harus dilakukan sebelum mengonfirmasi) dan segera mengembalikan konfirmasi. Kemudian, ia menerbitkan acara `pesanan-diterima` ke topik SNS. Layanan inventaris, email, dan analitik masing-masing berlangganan melalui antrian SQS independen. Mereka memproses dengan kecepatan mereka sendiri — jika analitik lambat, antriannya bertambah tetapi layanan lainnya tidak terpengaruh. Jika layanan mana pun gagal, pesan-pesannya tetap berada di antrian SQS dan dicoba lagi; setelah jumlah percobaan ulang yang gagal yang dikonfigurasi, mereka dipindahkan ke DLQ.

**Mengapa bukan A?** Antrian FIFO memproses pesan dalam urutan — ini tidak membantu dengan perlambatan sinkron. Selain itu, pemrosesan berurutan berarti bahwa jika analitik lambat, itu masih memblokir email.

**Mengapa bukan C?** "Instans EC2 paralel yang memproses secara sinkron" masih memerlukan semua langkah untuk menyelesaikan sebelum menanggapi pelanggan. Menambahkan instans tidak menyelesaikan pengikatan sinkron.

**Mengapa bukan D?** API Gateway mempercepat perutean dan validasi API, tetapi tidak memutuskan hubungan langkah-langkah pemrosesan hilir.

*SAA-C03 Domain: Desain Arsitektur Tangguh — Tugas 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang membangun sistem notifikasi untuk mitra restoran. Ketika pelanggan melakukan pemesanan, mitra restoran perlu diberi tahu melalui:

- Tablet mereka (notifikasi push)
- Sistem tampilan dapur (webhook HTTP ke perangkat keras lokal mereka)
- SMS cadangan (jika notifikasi tablet gagal)

Layanan notifikasi tablet andal. Webhook dapur kadang-kadang tidak berfungsi (restoran mematikan perangkat keras mereka saat tutup). SMS hanya boleh dipicu jika notifikasi tablet gagal.

Rancang arsitektur menggunakan SNS dan SQS. Bagaimana Anda menangani persyaratan "SMS hanya jika tablet gagal"? Bagaimana Anda memastikan bahwa webhook dapur tidak memblokir notifikasi tablet saat offline?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk berlatih desain fan-out dengan perutean kondisional.)*

## Adegan Pasca-Kredit

Alur pesanan baru sudah aktif.

Pelanggan melakukan pemesanan. API merespons dalam 95 milidetik. Konfirmasi muncul di ponsel mereka secara instan.

Di balik layar: empat layanan memproses secara asinkron. Layanan analitik memiliki bug yang menyebabkan ia crash pada pesanan yang berisi karakter khusus tertentu dalam nama barang. Antriannya terisi 3.200 pesan selama dua jam.

Pelanggan tidak menyadarinya.

Ketika Leo memperbaiki bug dan layanan analitik dimulai ulang, ia memproses backlog dalam 18 menit. Tidak ada data yang hilang. DLQ kosong.

"Inilah yang dimaksud dengan decoupling," kata Priya.

Tom sedang membaca halaman harga SQS. "Per juta permintaan, 0,40 dolar."

"Apakah itu buruk?"

"Pada volume kami, sekitar dua belas dolar per bulan." Dia menatap layar. "Saya mengharapkan lebih."

Dia memiliki tatapan seseorang yang menemukan sesuatu yang murah juga baik-baik saja.

Di bab berikutnya: fungsi yang hanya berjalan ketika seseorang mengetuk—dan tidak ada biaya ketika mereka tidak mengetuk.
