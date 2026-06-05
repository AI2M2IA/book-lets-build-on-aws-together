# Babat 12: Bagaimana Internet Menemukan Anda

Nimbus sedang berjalan. Load balancer memiliki IP publik. EC2 instances memiliki IP pribadi. Database terkunci di subnet privat. Priya mengangguk setuju dengan diagram jaringan.

Tom melihat URL load balancer: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

"Apakah itu yang dimasukkan pelanggan ke dalam browser mereka?" dia bertanya.

"Itulah yang AWS tetapkan secara otomatis," kata Maya.

"Saya tidak akan memasukkan itu ke kartu nama."

"Saya juga tidak."

Mereka membutuhkan nama domain. Mereka membeli `eatnimbus.com` dari registrar domain. Sekarang mereka perlu menghubungkan nama itu ke infrastruktur AWS mereka.

"Bagaimana internet tahu bahwa `eatnimbus.com` berarti load balancer di us-east-1?" tanya Leo.

Pertanyaan bagus, Leo.

**Analogi Buku Telepon**

Sebelum smartphone, setiap kota memiliki buku telepon. Jika Anda ingin menghubungi "Pizzeria Mario," Anda tidak perlu menghafal nomor telepon mereka — Anda mencari nama, mendapatkan nomor, dan menelepon.

Internet memiliki buku teleponnya sendiri: **Domain Name System (DNS)**.

DNS menerjemahkan nama yang dapat dibaca manusia (seperti `eatnimbus.com`) ke alamat IP yang dapat dibaca mesin (seperti `203.0.113.42`). Setiap kali Anda mengunjungi situs web, komputer Anda secara diam-diam mencari nama domain di DNS dan mendapatkan alamat IP untuk terhubung.

Jika Anda mengubah alamat IP server Anda, Anda akan memperbarui catatan DNS — seperti mengubah nomor Anda di buku telepon — dan internet akan menemukan Anda di lokasi baru Anda.

**Kenalan dengan Route 53**

Amazon Route 53 adalah layanan DNS terkelola AWS. Nama Route 53 disebut demikian karena port 53 adalah port DNS standar (Terkadang AWS menamai hal-hal secara sederhana).

Route 53 melakukan beberapa hal:

**Pendaftaran domain**: Anda dapat membeli nama domain melalui Route 53 secara langsung.

**Penyebaran DNS (zona terhost):** Anda membuat *zona terhost* untuk domain Anda, dan Route 53 mengelola catatan DNS yang memberi tahu dunia di mana menemukan Anda.

**Pemeriksaan kesehatan**: Route 53 dapat memantau endpoint Anda dan mengarahkan lalu lintas menjauh dari yang tidak sehat.

**Kebijakan perutean lalu lintas**: Route 53 mendukung beberapa strategi perutean di luar DNS sederhana — tertimbang, berbasis latensi, berbasis geolokasi, failover.

**Catatan DNS: Entri Buku Telepon**

Catatan DNS memetakan nama ke tujuan. Jenis yang paling umum:

**Catatan A**: Memetakan nama ke alamat IPv4.
`eatnimbus.com → 203.0.113.42`

**Catatan AAAA**: Memetakan nama ke alamat IPv6.

**Catatan CNAME**: Memetakan nama ke nama lain (alias).
`www.eatnimbus.com → eatnimbus.com`

**Catatan MX**: Menentukan server mana yang menangani email untuk domain.

**Catatan TXT**: Menyimpan teks arbitrer. Sering digunakan untuk verifikasi domain (membuktikan kepemilikan domain) dan autentikasi email (SPF, DKIM).

Untuk Nimbus, pengaturan utamanya:

- `eatnimbus.com → Catatan A yang mengarah ke IP load balancer`
- `www.eatnimbus.com → Catatan CNAME yang mengarah ke eatnimbus.com`
- `api.eatnimbus.com → Catatan A yang mengarah ke load balancer API`

"Tunggu," kata Tom. "IP load balancer dapat berubah. AWS mengatakan itu dalam dokumentasi."

Pikiran bagus, Tom.

**Catatan Alias: Solusi AWS untuk IP Dinamis**

Load balancer, distribusi CloudFront, dan situs web S3 memiliki nama DNS, bukan alamat IP statis. Alamat IP dasarnya dapat berubah.

Jika Anda membuat CNAME yang mengarah ke nama DNS load balancer, itu berfungsi — tetapi Anda tidak dapat menggunakan CNAME untuk domain root (`eatnimbus.com` tanpa `www`) karena standar DNS.

Route 53 menyelesaikan ini dengan **Catatan Alias** — ekstensi khusus AWS untuk DNS. Catatan Alias memetakan nama langsung ke sumber daya AWS (load balancer, distribusi CloudFront, situs web S3), dan Route 53 menangani resolusi IP dinamis secara otomatis. Catatan Alias dapat digunakan pada tingkat domain root. Dan tidak seperti kueri DNS eksternal ke layanan, kueri Catatan Alias ke sumber daya AWS gratis.

"Jadi kita menggunakan Catatan Alias untuk `eatnimbus.com` yang mengarah ke load balancer," konfirmasi Leo.

"Dan Route 53 menangani IP apa pun yang digunakan load balancer pada saat tertentu," tambah Priya.

"Untuk gratis," kata Tom, tiba-tiba sangat tertarik.

**Kebijakan Perutean: Lebih dari Sekadar "Di Mana Itu?"**

Di sinilah Route 53 menjadi menarik. DNS bukan hanya layanan pencarian — itu juga dapat menjadi alat manajemen lalu lintas.

**Perutean sederhana**: Satu catatan, satu tujuan. DNS standar.

**Perutean tertimbang**: Bagi lalu lintas ke beberapa tujuan berdasarkan bobot. Kirim 90% ke server baru, 10% ke server lama selama migrasi. Sesuaikan bobot hingga Anda yakin dengan server baru, lalu beralih ke 100%.

**Perutean berbasis latensi**: Rute pengguna ke wilayah AWS dengan latensi terendah untuk mereka. Pengguna di Seattle akan dirutekan ke `us-west-2`. Pengguna di Tokyo akan dirutekan ke `ap-northeast-1`. Nama domain yang sama, tujuan yang berbeda.

**Perutean berbasis geolokasi**: Rute berdasarkan lokasi geografis pengguna. Semua pengguna Eropa akan pergi ke `eu-west-1`. Semua pengguna Amerika Utara akan pergi ke `us-east-1`. Berguna untuk kepatuhan data (mempertahankan data pengguna UE di wilayah UE) atau penyesuaian konten (bahasa, mata uang).

**Perutean failover**: Tentukan titik akhir utama dan sekunder. Jika titik akhir utama gagal, kebijakan pemeriksaan kesehatan Route 53 akan mengarahkan lalu lintas ke titik akhir sekunder. Ini adalah lapisan DNS untuk pemulihan bencana.

**Pengarutan Jawaban Multivalue**: Kembalikan hingga delapan alamat IP yang sehat untuk sebuah kueri, memungkinkan klien untuk memilih. Alternatif sederhana untuk load balancer dalam mendistribusikan lalu lintas ke beberapa server.

"Jadi Route 53 bukanlah sekadar buku telepon," kata Maya. "Ini adalah buku telepon pintar yang dapat merutekan panggilan berdasarkan di mana Anda menelepon dari."

"Dan memutuskan koneksi jika nomornya tidak sehat," tambah Priya.

**Pemeriksaan Kesehatan: Merutekan di Sekitar Kegagalan**

Route 53 dapat memantau endpoint Anda dengan pemeriksaan kesehatan. Jika sebuah endpoint gagal, Route 53 dapat:

- Menghapusnya dari respons DNS (menghentikan pengiriman lalu lintas ke sana)
- Memulai pemulihan otomatis ke endpoint cadangan
- Mengirimkan pemberitahuan melalui CloudWatch

Pemeriksaan kesehatan adalah jembatan antara perutean DNS dan kesehatan aplikasi yang sebenarnya. Dalam konfigurasi pemulihan otomatis: Route 53 memantau endpoint utama setiap 30 detik. Jika tiga pemeriksaan berturut-turut gagal, Route 53 mulai mengembalikan alamat endpoint sekunder.

Ini tidak instan—DNS memiliki waktu propagasi. Setelah Route 53 mengubah catatan DNS, resolver DNS di seluruh dunia perlu mengambil perubahan tersebut, yang dapat memakan waktu beberapa detik hingga beberapa menit tergantung pada pengaturan TTL.

**TTL: Cache DNS**

Respons DNS di-cache pada beberapa tingkat—di router Anda, di ISP Anda, di browser Anda. **TTL (Time-To-Live)** pada catatan DNS memberi tahu cache berapa lama untuk mengingat jawaban sebelum memeriksanya lagi.

TTL Tinggi (1 jam atau lebih): Lebih sedikit kueri DNS, beban yang lebih rendah pada Route 53, tetapi perubahan membutuhkan waktu lebih lama untuk menyebar.

TTL Rendah (60 detik atau kurang): Perubahan menyebar dengan cepat, tetapi lebih banyak kueri DNS yang diperlukan.

Sebelum migrasi yang direncanakan (memperbarui DNS untuk menunjuk ke server baru), turunkan TTL Anda menjadi 60 detik sehari sebelumnya. Kemudian ketika Anda membuat perubahan, itu menyebar dalam sekitar satu menit. Setelah migrasi, naikkan kembali ke nilai normal.

"Jika kita hanya menurunkannya selama migrasi dan tidak sebelumnya," kata Leo perlahan, "TTL lama berarti beberapa pengguna akan melihat server lama selama satu jam."

"Tepat," kata Priya. "Migrasi DNS membutuhkan perencanaan sebelum migrasi, bukan hanya selama."

## Kekuatan dan Batasan

**Route 53 adalah pilihan yang tepat untuk**: mendaftarkan dan mengelola nama domain sepenuhnya di dalam AWS; merutekan lalu lintas berdasarkan latensi, geolokasi, atau distribusi tertimbang di seluruh endpoint; pemulihan otomatis berdasarkan pemeriksaan kesehatan antara wilayah atau antara utama dan titik pemulihan bencana; mengintegrasikan DNS dengan layanan AWS lainnya melalui catatan alias.

**Ketika Route 53 tidak diperlukan**: Route 53 adalah layanan DNS, bukan load balancer. Jika Anda perlu mendistribusikan lalu lintas antara beberapa server atau kontainer dalam sebuah wilayah, gunakan Application Load Balancer—Route 53 tidak dapat melakukan distribusi tertimbang round-robin pada tingkat koneksi seperti load balancer dapat. Perutean berbasis latensi di seluruh wilayah menambah biaya dan kompleksitas operasional yang hanya masuk akal ketika pengguna Anda benar-benar didistribusikan secara global dan milidetik penting untuk konversi. Untuk sebagian besar aplikasi satu wilayah, satu catatan A yang menunjuk ke ALB sudah cukup untuk konfigurasi Route 53 Anda.

## Ringkasan

- **DNS** menerjemahkan nama domain ke alamat IP—buku telepon internet.
- **Route 53** adalah layanan DNS terkelola AWS: pendaftaran domain, hosting DNS, pemeriksaan kesehatan, dan kebijakan perutean.
- **Catatan A** memetakan nama ke alamat IPv4. **Catatan CNAME** memetakan nama ke nama lain. **Catatan Alias** memetakan nama ke sumber daya AWS (load balancer, CloudFront, S3).
- Gunakan Catatan Alias (bukan CNAME) untuk domain root dan untuk sumber daya dengan IP dinamis.
- Kebijakan perutean melampaui DNS sederhana: **tertimbang** (pemecahan lalu lintas), **berbasis latensi** (kinerja), **berbasis geolokasi** (kedaulatan data), **pemulihan otomatis** (disaster recovery).
- **Pemeriksaan kesehatan** memantau endpoint dan secara otomatis menghapus target yang tidak sehat dari respons DNS.
- Rencanakan perubahan TTL sebelum migrasi—turunkan TTL terlebih dahulu agar perubahan menyebar dengan cepat.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.4)*

- **Alias vs CNAME**: Record Alias dapat digunakan pada domain root; CNAME tidak dapat. Record Alias ke sumber daya AWS gratis; kueri DNS CNAME dikenakan biaya. Ketika ujian menanyakan tentang memetakan domain root ke load balancer → Record Alias.
- **Kasus Penggunaan Kebijakan Perutean** (skenario ujian umum):
  - "Secara bertahap memigrasikan lalu lintas ke versi baru" → Perutean berbobot
  - "Merutekan pengguna ke wilayah AWS terdekat" → Perutean berbasis latensi
  - "Mempertahankan data pengguna UE di wilayah UE" → Perutean berbasis lokasi geografis
  - "Failover DNS otomatis saat utama tidak tersedia" → Perutean failover dengan pemeriksaan kesehatan
- **Route 53 pemeriksaan kesehatan**: Dapat memeriksa titik akhir HTTP/HTTPS/TCP, dan dapat memicu alarm CloudWatch. Ujian menggunakan ini dalam skenario pemulihan bencana.
- **TTL dan propagasi**: Ketahui bahwa TTL mengontrol berapa lama pemecah DNS menyimpan rekaman. TTL pendek = perubahan yang lebih cepat. Skenario ujian: "tim memperbarui DNS tetapi pengguna masih menargetkan server lama" → TTL terlalu tinggi.
- **Zona Hosted Privat**: Route 53 dapat membuat rekaman DNS yang hanya menyelesaikan di dalam VPC. Ujian menggunakan ini untuk penemuan layanan internal (misalnya, `database.internal` menyelesaikan ke endpoint RDS pribadi).
- Route 53 bersifat **global** — itu tidak diterapkan di wilayah. Tidak diperlukan pemilihan wilayah saat membuat zona hosted.

## Latihan

**Latihan 1 — Ingatan**

Jelaskan perbedaan antara record CNAME dan record Alias. Kapan Anda akan menggunakannya?

*(Petunjuk: Pertimbangkan batasan CNAME pada domain root, dan perilaku record Alias dengan sumber daya AWS dinamis.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Perusahaan media mengoperasikan situs web dari dua wilayah AWS: `us-east-1` (utama) dan `eu-west-1` (sekunder). Tim ingin lalu lintas secara otomatis dirutekan ke `eu-west-1` jika wilayah utama tidak tersedia. Perusahaan juga ingin memverifikasi bahwa mekanisme failover berfungsi dengan benar tanpa benar-benar menonaktifkan wilayah utama.

Konfigurasi Route 53 mana yang TERBAIK memenuhi persyaratan ini?

A) Perutean berbobot dengan bobot 100% pada `us-east-1` dan 0% pada `eu-west-1`
B) Perutean berbasis latensi dengan pemeriksaan kesehatan pada kedua titik akhir
C) Perutean failover dengan pemeriksaan kesehatan pada titik akhir utama dan rekaman sekunder yang menunjuk ke `eu-west-1`
D) Perutean berbasis lokasi geografis dengan Amerika Utara menunjuk ke `us-east-1` dan Eropa menunjuk ke `eu-west-1`

*(Petunjuk 1*: Persyaratan adalah failover otomatis saat utama gagal. Kebijakan perutean mana yang dirancang khusus untuk ini?

*(Petunjuk 2*: "Uji tanpa menonaktifkan wilayah utama" — pemeriksaan kesehatan dapat diatur secara manual menjadi "tidak sehat" untuk pengujian.

*(Petunjuk 3*: Perutean berbasis latensi mengoptimalkan untuk kecepatan, bukan untuk failover.

**Jawaban**: C

**Penjelasan**: Kebijakan perutean failover dirancang khusus untuk kasus penggunaan ini. Rekaman utama menunjuk ke `us-east-1` dengan pemeriksaan kesehatan. Rekaman sekunder menunjuk ke `eu-west-1`. Jika pemeriksaan kesehatan gagal, Route 53 secara otomatis menyajikan rekaman sekunder. Pemeriksaan kesehatan dapat dipaksa untuk gagal secara manual untuk pengujian tanpa benar-benar mengganggu wilayah utama.

**Mengapa bukan A?** Perutean berbobot dengan 100%/0% secara efektif bersifat statis — itu tidak beralih secara otomatis saat utama gagal.

**Mengapa bukan B?** Perutean berbasis latensi memilih titik akhir tercepat untuk setiap pengguna. Itu tidak secara otomatis mengecualikan wilayah berdasarkan kesehatan — itu masih akan merutekan beberapa lalu lintas ke titik akhir yang tidak sehat `us-east-1` jika latensi menguntungkan itu.

**Mengapa bukan D?** Perutean berbasis lokasi geografis merutekan berdasarkan lokasi pengguna, bukan kesehatan titik akhir. Pengguna Eropa akan terjebak di `eu-west-1` bahkan jika `us-east-1` sehat, dan pengguna Amerika Utara tidak akan gagal ke `eu-west-1` bahkan jika `us-east-1` turun.

*SAA-C03 Domain: Desain Arsitektur Berkinerja — Tugas 3.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang memperluas secara internasional. Mereka ingin `eatnimbus.com` memuat dengan cepat untuk pengguna di West Coast, East Coast, dan Australia. Mereka juga memiliki persyaratan peraturan: pesanan yang dilakukan oleh pengguna Eropa harus diproses oleh server di UE.

Rancang strategi perutean Route 53 yang mengatasi kedua persyaratan. Kebijakan perutean atau kombinasi kebijakan mana yang akan Anda gunakan? Infrastruktur apa yang akan Anda butuhkan di setiap wilayah?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk berlatih desain perutean multi-wilayah.)*

## Adegan Pasca Kredit

`eatnimbus.com` hidup.

Maya mengetiknya ke browsernya, dan halaman pemesanan Nimbus memuat. Dia memesan arepa dari restoran keluarganya sendiri, hanya untuk menguji alur kerja. Pesanan itu berhasil. Dapur menerimanya.

Dia mundur.

Tom sudah membaca log pemeriksaan kesehatan Route 53. "Waktu respons adalah 47 milidetik dari us-east-1."

"Apakah itu cepat?" tanya Maya.

"Untuk DNS? Ya."

"Tetapi untuk pengguna di Seattle?"

Tom melihat grafik latensi. "Sekitar 80 milidetik."

Maya memikirkannya. "Jika sebagian besar pelanggan kami berada di West Coast, dan server kami berada di Virginia..."

"Setiap permintaan melakukan perjalanan dari Seattle ke Virginia dan kembali," kata Leo dari seberang ruangan. "Kecepatan cahaya. Anda tidak dapat mengalahkan fisika."

"Jadi kita perlu server yang lebih dekat dengan Seattle."

"Atau sesuatu yang lebih dekat dengan Seattle yang melayani konten untuk mereka."

Pikiran itu menggantung di udara.

Di bab berikutnya: gudang-gudang yang menempatkan konten Nimbus hanya dalam seperseribu detik dari setiap pengguna, di mana-mana.
