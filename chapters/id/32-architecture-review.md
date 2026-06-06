# Chapter 32: Mempertahankan Rencana

Carlos kembali, beberapa minggu setelah sesi Well-Architected. Kali ini laptop tetap di tasnya; dia mengambil spidol papan tulis sebagai gantinya, menyapa setiap orang di ruangan, menemukan tempat dekat papan, dan membuka tutup spidol.

"Ceritakan tentang Nimbus," katanya. Seolah dia tidak pernah mendengarnya.

**Rekap: Dari Tinjauan ke Perhitungan**

Well-Architected review dari Bab 31 telah mengungkap tiga temuan berisiko tinggi dan kesadaran Maya yang berkembang bahwa ada kesenjangan antara keputusan yang telah dibuat tim dan keputusan yang telah mereka *pikirkan matang-matang*. Kerangka kerja telah memberi mereka kosakata untuk kesenjangan itu. Yang tidak bisa diberikannya adalah praktik menutupnya secara real time — sebelum sebuah fitur dikirimkan, bukan setelah. Itulah keberadaan Carlos di sini. Maya telah mengundangnya secara khusus karena Nimbus akan membangun sesuatu yang signifikan, dan dia ingin tantangan terstruktur sebelum baris pertama kode produksi ditulis.

Tinjauan arsitektur yang baik seperti daftar periksa pra-penerbangan untuk seorang pilot. Pesawat mungkin terlihat sangat siap terbang — mesin berjalan, bahan bakar penuh, penumpang naik. Tetapi daftar periksa itu ada karena pilot berpengalaman tahu bahwa hal-hal yang paling mungkin menyebabkan masalah adalah persis hal-hal yang terasa baik tepat sampai mereka tidak. Daftar periksa itu tidak berarti pilot tidak tahu apa yang mereka lakukan. Itu berarti mereka telah menginternalisasi bahwa bahkan ahli pun melewatkan hal-hal ketika mereka melewatkan proses terstruktur.

**Gerakan Pertama Arsitek**

Yang terjadi selanjutnya mengejutkan tim.

Maya mulai menjelaskan sistem — instance EC2, Aurora, CloudFront, ElastiCache, DynamoDB untuk menu, VPC dengan subnet privat...

Carlos menghentikannya dengan lembut.

"Mulai dengan bisnis," katanya. "Bukan teknologi."

Dia berhenti. Lalu: "Nimbus adalah platform pemesanan restoran. Kami punya 287 mitra restoran. Kami memproses sekitar 4.200 pesanan per hari. Nilai pesanan rata-rata adalah $34. Kami tumbuh 18% kuartal demi kuartal."

"Bagus. Apa hal terpenting yang harus dilakukan Nimbus?"

"Memproses pesanan," kata Leo.

"Secara spesifik," tekan Carlos.

"Sebuah pesanan harus mencapai restoran dalam lima detik sejak penempatan," kata Priya, "atau dapur melewatkan jendela waktu."

"Apa yang terjadi jika tidak?"

"Restoran membuat kesalahan. Pelanggan mendapat makanan yang salah, atau menunggu terlalu lama. Mereka mengeluh. Kami kehilangan mitra restoran."

"Jadi SLA lima detik," kata Carlos, "bukan target teknis. Itu persyaratan kelangsungan bisnis."

Keheningan.

"Itulah," katanya, "mengapa percakapan arsitektur harus dimulai dengan persyaratan bisnis. Teknologi berada di hilir dari batasan itu."

**Struktur Tinjauan Arsitektur**

Tinjauan arsitektur yang sebenarnya — jenis yang terjadi sebelum Anda membangun sesuatu yang penting, atau ketika Anda mengevaluasi apakah akan menskalakan — punya struktur.

Carlos menuliskannya di papan tulis:

**1. Pahami batasan**

Apa yang harus benar? Apa yang tidak boleh terjadi? (Bukan "apa yang kita inginkan." Apa yang tidak dapat dinegosiasikan?)

**2. Pahami yang tidak diketahui**

Apa yang tidak kita ketahui? Di mana kita membuat asumsi? Apa yang terjadi jika asumsi itu salah?

**3. Evaluasi opsi**

Apa alternatif yang realistis? Apa trade-off dari masing-masing?

**4. Identifikasi mode kegagalan**

Bagaimana ini rusak? Apa urutan peristiwa ketika setiap mode kegagalan terpicu?

**5. Validasi pemantauan**

Bagaimana Anda akan tahu ketika sesuatu salah? Sebelum pengguna memberi tahu Anda?

**6. Definisikan runbook**

Apa yang dilakukan seseorang pada pukul 3 pagi ketika ini rusak?

Ini bukan daftar periksa untuk diikuti secara mekanis. Ini kerangka berpikir. Tujuannya adalah memastikan pertanyaan penting diajukan *sebelum* Anda berada di produksi.

**Menjalankan Tinjauan: Fitur Baru Nimbus**

Carlos telah diundang secara khusus karena Nimbus akan membangun sesuatu yang baru.

**Fitur**: "Nimbus Instant" — jaminan pengiriman 15 menit. Jika mitra restoran gagal memenuhi jendela 15 menit lebih dari sekali per minggu, Nimbus akan mengembalikan dana ke pelanggan secara otomatis.

"Jelaskan persyaratan teknisnya," kata Carlos.

Priya memulai. "Kita butuh pelacakan real-time dari penempatan pesanan hingga pengiriman. Kita perlu membandingkan waktu pengiriman aktual terhadap SLA 15 menit. Kita perlu memicu pengembalian dana secara otomatis."

"Apa persyaratan latensi untuk data pelacakan?"

"Hampir real-time. Pelanggan melihat pembaruan status di ponsel mereka."

"Dalam berapa lama?"

"Lima detik mungkin."

"Mungkin?"

"Dalam lima detik. Itu persyaratan produk."

"Bagus. Kinesis untuk aliran peristiwa, kalau begitu. Apa mode kegagalan jika Kinesis tertunda?"

"Pembaruan status terlambat ke pelanggan."

"Apakah itu dapat diterima?"

"Untuk 10 detik? Mungkin. Untuk 60 detik? Tidak."

"Jadi apa SLA untuk sistem pelacakan?"

Priya melihat Leo. "Kita belum punya."

Carlos menulis di papan: *Tidak diketahui: SLA pelacakan.*

"Ini penting," katanya. "Karena SLA menentukan desain infrastruktur. Jika SLA Anda 5 detik, Anda butuh solusi yang berbeda daripada jika 60 detik."

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Mengapa tidak hanya menggunakan mekanisme polling yang dicek aplikasi setiap beberapa detik alih-alih push real-time?"

"Latensi dan biaya," kata Carlos. "Pendekatan polling pada skala besar — katakanlah, 10.000 pesanan aktif, masing-masing aplikasi melakukan polling setiap 5 detik — adalah 2.000 permintaan per detik, atau 120.000 permintaan per menit. Model push melalui Kinesis mengirimkan pembaruan hanya ketika status berubah. Lebih sedikit permintaan, latensi lebih rendah, dan komitmen SLA lebih mudah diaudit dari log peristiwa. Polling berfungsi pada skala kecil. Pada skala yang dituju Nimbus, push adalah fondasi yang tepat."

Leo telah diam selama penjelasan Carlos. Lalu: "Saya akan membangun ini dengan WebSockets."

Carlos melihatnya. "Jelaskan."

"Setiap pesanan mendapat koneksi WebSocket. Klien terhubung ketika pesanan ditempatkan. Server mendorong perubahan status — dikonfirmasi, sedang disiapkan, dalam perjalanan, terkirim — saat terjadi. Tanpa polling, latensi rendah, model sederhana."

"Apa yang mempertahankan koneksi WebSocket?"

"Endpoint WebSocket API Gateway. Fungsi Lambda menangani peristiwa koneksi dan pesan. DynamoDB menyimpan ID koneksi."

Carlos menulisnya di papan. "Dan mode kegagalan ketika jaringan klien terputus selama 15 detik?"

"Koneksi diterminasi. Klien menyambung ulang dan meminta status saat ini."

"Dari mana?"

"Dari... handler Lambda, yang membaca dari DynamoDB."

"Jadi Anda punya jalur push dan jalur pull," kata Carlos. "Push WebSocket adalah happy path. Pembacaan DynamoDB adalah jalur pemulihan. Bagaimana Anda memastikan koneksi dibangun ulang sebelum pelanggan menyadari statusnya basi?"

Leo berpikir. "Klien mendeteksi pemutusan dan menyambung ulang dalam beberapa detik. Logika penyambungan ulang sederhana."

"Pada 10.000 pesanan aktif secara bersamaan — yang merupakan arah Nimbus — berapa banyak koneksi WebSocket bersamaan itu?"

"10.000."

"WebSocket API Gateway punya kuota default 500 **koneksi baru per detik** per akun," kata Carlos. "Bukan koneksi bersamaan — *laju* koneksi. 10.000 koneksi mantap baik-baik saja. Masalahnya adalah badai penyambungan ulang: ketika gangguan jaringan memutus beberapa ribu klien sekaligus dan mereka semua menyambung ulang dalam dua detik yang sama, Anda mencapai kuota laju dan penyambungan ulang mulai gagal persis ketika pengguna paling memperhatikan. Anda bisa meminta peningkatan, tetapi itu kuota yang akan Anda tinjau ulang seiring Anda tumbuh. Juga: WebSocket API Gateway mengenakan $0.25 per juta connection-minute, ditambah $1.00 per juta pesan. Pada 10.000 pesanan per hari dengan rata-rata jendela pelacakan 40 menit, itu hanya sekitar 400.000 connection-minute per hari — receh. Pada 10.000 pesanan aktif secara bersamaan, itu skala yang berbeda."

"Itu tidak banyak," kata Leo.

"Tidak pada 10.000 pesanan aktif," kata Carlos. "Pada skala itu, sebut saja kira-kira $150 per bulan dengan biaya connection-minute dan pesan. Biaya bukan argumen melawan WebSockets di sini. Kuota laju-koneksi di bawah badai penyambungan ulang, dan manajemen status-koneksi, itulah argumennya."

"Jadi WebSockets menjadi rumit pada skala besar," kata Maya.

"Mereka menjadi dapat dikelola pada skala besar jika Anda merancang untuknya," kata Carlos. "Itu tidak salah — itu set trade-off yang berbeda. Sekarang biarkan saya tunjukkan alternatif polling."

Dia menggambar opsi kedua.

"Polling: klien mengirim permintaan GET ke `/orders/{order_id}/status` setiap 5 detik. Backend membaca dari DynamoDB. Mengembalikan status saat ini."

"Itu banyak permintaan," kata Priya.

"10.000 pesanan aktif × 1 poll per 5 detik = 2.000 permintaan per detik. API Anda perlu menangani 2.000 RPS. DynamoDB auto-scale. API Gateway menangani bebannya. Biayanya: 2.000 RPS × 3.600 detik × 24 jam × 30 hari = 5,18 miliar permintaan per bulan. Harga API Gateway REST API: $3.50 per juta permintaan = $18.130/bulan."

Ruangan hening.

"Itu bukan opsi yang layak pada skala besar," kata Tom.

"Benar," kata Carlos. "Polling pada interval 5 detik adalah implementasi paling sederhana dan paling mahal pada skala besar. Ia juga menghasilkan beban yang proporsional dengan koneksi aktif, bukan proporsional dengan perubahan status. Jika sebuah pesanan duduk dalam 'sedang disiapkan' selama 20 menit, polling menghasilkan 240 permintaan yang semuanya mengembalikan status yang sama. Itu pemborosan."

"Dan Kinesis?" tanya Maya.

"Kinesis menghasilkan satu peristiwa per perubahan status. Konfirmasi pesanan: satu peristiwa. Penerimaan dapur: satu peristiwa. Pengambilan pengemudi: satu peristiwa. Pengiriman: satu peristiwa. Empat peristiwa per pesanan, terlepas dari berapa lama setiap status berlangsung. Konsumen — backend Anda — membaca dari aliran Kinesis dan mendorong pembaruan ke klien melalui mekanisme pengiriman apa pun yang Anda pilih."

"Tetapi klien masih butuh cara untuk menerima push," kata Leo.

"Ya. Anda bisa menggunakan Server-Sent Events, endpoint long-poll, atau WebSockets untuk pengiriman last-mile. Kinesis menangani aliran peristiwa yang andal, terurut, dapat diputar ulang untuk backend Anda. Mekanisme pengiriman klien adalah keputusan terpisah. Keuntungan kunci: Kinesis memisahkan sumber peristiwa dari konsumen. Sistem pelacakan pengiriman, sistem pengembalian dana, sistem notifikasi restoran, dan tampilan status pelanggan semuanya mengonsumsi dari aliran Kinesis yang sama secara independen."

"Jadi ini bukan Kinesis sebagai pengganti WebSockets," kata Maya. "Ini Kinesis ditambah mekanisme pengiriman klien yang lebih ringan."

"Tepat. Analisis trade-off-nya:"

Dia menulisnya:

| Opsi | Latensi | Biaya (500 / 10K pesanan aktif) | Kompleksitas |
|---|---|---|---|
| Hanya WebSockets | ~50ms | $8 / $150 per bulan | Sedang |
| Polling (5d) | 0–5d | $906 / $18.130 per bulan | Rendah |
| Kinesis + SSE | ~200ms | $8 / $75 per bulan | Sedang-tinggi |

"Opsi polling dieliminasi oleh biaya," kata Carlos. "WebSockets layak tetapi memerlukan manajemen koneksi pada skala besar. Kinesis ditambah Server-Sent Events sedikit lebih tinggi latensinya dan sebanding biayanya — yang ia beli untuk Anda adalah log peristiwa yang tahan lama dan dapat diputar ulang yang Anda butuhkan untuk sistem pengembalian dana, dan konsumen yang terpisah."

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Jika WebSockets punya latensi lebih rendah, mengapa menerima latensi lebih tinggi dari Kinesis ditambah SSE?"

"Apakah 200ms versus 50ms terlihat oleh pelanggan yang menonton pembaruan status pengiriman?" tanya Carlos.

"Tidak," katanya.

"Maka perbedaan latensinya di bawah ambang persepsi. Perbedaan biaya pada sepuluh ribu pesanan aktif sederhana — $75 versus $150 per bulan. Perbedaan arsitektur adalah argumen sebenarnya: Kinesis memberi Anda log peristiwa yang tahan lama dan dapat diputar ulang — yang akan Anda butuhkan untuk jejak audit pengembalian dana — dan memisahkan konsumen pelacakan Anda. WebSockets akan mengharuskan Anda membangun ulang pemisahan itu nanti."

Leo melihat tabel. "Kita nyaris mengirimkan versi WebSocket."

"Itu akan berfungsi," kata Carlos. "Itu hal penting untuk dipahami. WebSockets akan berfungsi. Pertanyaan dalam arsitektur jarang 'apakah ini berfungsi?' Pertanyaannya adalah 'berapa biaya ini seiring ia tumbuh, dan apa yang harus kita bangun ulang nanti?'"


**Pertanyaan yang Diajukan Arsitek**

Selama dua jam berikutnya, Carlos memandu tim melalui tinjauan. Pilihan dari pertanyaannya:

**Tentang penyimpanan data**:

"Di mana status pesanan disimpan selama pemenuhan? Jika aplikasi crash di tengah pengiriman, apa proses pemulihannya? Bisakah Anda merekonstruksi status dari peristiwa saja?"

**Tentang mekanisme pengembalian dana**:

"Pengembalian dana dipicu secara otomatis. Apa yang mencegah pengembalian dana dikeluarkan dua kali? Bagaimana jika pemroses pembayaran timeout dan Anda tidak yakin apakah pengembalian dana diterima?"

**Tentang pelacakan pengiriman**:

"Anda mengandalkan data GPS kurir. Apa yang terjadi jika sinyal GPS hilang selama 90 detik? Bagaimana Anda membedakan 'GPS hilang' dari 'pengiriman dalam proses' dari 'masalah pengiriman'?"

**Tentang penanganan kegagalan**:

"Jika layanan pengembalian dana mati, apakah pesanan tetap diproses? Apakah pelanggan tetap mendapat makanannya? Apa pengalaman pengguna selama kegagalan sistem parsial?"

**Tentang observabilitas**:

"Bagaimana Anda tahu sekarang berapa banyak pesanan yang saat ini berada dalam 5 menit dari SLA 15 menit? Jika angka itu melonjak, siapa yang diberi tahu?"

Setiap pertanyaan mengungkapkan asumsi yang telah dibuat tim tanpa menyadarinya.

"Saya sudah men-deploy-nya — oh," kata Leo. "Endpoint pengembalian dana. Saya hanya akan memanggil API pembayaran langsung. Kita belum memikirkan memanggilnya dua kali." Dia berhenti. "Jadi jika panggilan pertama berhasil tetapi konfirmasi kita hilang saat transit, kita memanggil lagi dan pelanggan mendapat dua pengembalian dana."

"Sudahkah kita memikirkan apa yang terjadi jika API pembayaran menerima panggilan pertama tetapi konfirmasi kita hilang saat transit?" tanya Priya.

"Itu idempotensi," kata Carlos.

"Kunci idempotensi — ID unik per upaya pengembalian dana, disimpan di DB sebelum memanggil API pembayaran," kata Priya. "Jika kita memanggil dua kali dengan kunci yang sama, API pembayaran mengabaikan panggilan kedua."

"Yang berarti," tambah Carlos, "bahwa Anda butuh penyimpanan status persisten untuk operasi pengembalian dana, bukan hanya peristiwa dalam antrian."


"Pemantauan yang telah kita diskusikan," kata Carlos, "semuanya pemantauan infrastruktur. CPU. Jumlah koneksi. Lag Kinesis. Ini penting — tetapi ini bukan pemantauan yang memberi tahu Anda apakah Nimbus Instant berfungsi."

"Apa pemantauan yang memberi tahu kita ia berfungsi?" tanya Maya.

"Waktu konfirmasi p95 per restoran. Berapa lama, pada persentil ke-95, dari penempatan pesanan ke konfirmasi restoran — diukur secara terpisah untuk setiap mitra restoran?"

"Kita tidak punya metrik itu," kata Priya.

"Itu kesenjangannya," kata Carlos. "Anda bisa punya infrastruktur sempurna — CloudWatch hijau di setiap alarm — dan masih punya mitra restoran yang latensi konfirmasinya telah memburuk selama tiga minggu karena perangkat lunak tablet mereka punya bug. Infrastrukturnya baik. SLA bisnis dilanggar. Dan Anda tidak akan tahu sampai restoran menelepon untuk mengeluh."

"Bagaimana kita menangkap itu?" tanya Leo.

"Pancarkan metrik CloudWatch kustom atau dorong ke pipeline analitik Anda setiap kali konfirmasi pesanan diterima. Beri stempel waktu penempatan pesanan. Beri stempel waktu konfirmasi. Hitung selisihnya. Pancarkan dengan tag `restaurant_id`. Bangun dasbor CloudWatch yang menunjukkan waktu konfirmasi p95 per restoran selama 7 hari terakhir."

"Dan beri alarm ketika ia memburuk?" tanya Tom.

"Beri alarm ketika p95 untuk restoran tertentu melebihi 90 detik selama lebih dari 5 menit berturut-turut," kata Carlos. "Itu anomali yang menjamin jangkauan proaktif, bukan respons tunggu-keluhan."

"Ini perbedaan antara memantau infrastruktur dan memantau produk," kata Priya.

"Tepat," kata Carlos. "Pemantauan infrastruktur memberi tahu Anda apakah sistem Anda sehat. Pemantauan tingkat-bisnis memberi tahu Anda apakah pelanggan Anda mengalami apa yang Anda janjikan kepada mereka. Anda butuh keduanya. Sebagian besar tim hanya punya yang pertama."

Maya menambahkannya ke lampiran ADR: lacak waktu konfirmasi p95 per restoran selain metrik kesehatan infrastruktur. Ambang batas alarm akan ditentukan oleh tim produk berkonsultasi dengan tim keberhasilan restoran.

"Ini juga tempat pemantauan biaya dan pemantauan bisnis berpotongan," kata Tom. "Jika latensi konfirmasi kita melonjak untuk sebagian restoran pada malam Jumat, akar penyebabnya mungkin Lambda cold start yang mengenai shard restoran itu di Kinesis. Metrik bisnis mengungkap gejalanya. Metrik infrastruktur mengungkap penyebabnya."

"Dan solusinya mungkin bukan lebih banyak infrastruktur," kata Carlos. "Mungkin provisioned concurrency pada fungsi Lambda spesifik. Atau mungkin shard rebalancing. Atau mungkin bug di endpoint konfirmasi restoran. Anda tidak bisa tahu yang mana sampai Anda punya kedua lapisan observabilitas."

"Sudahkah kita memikirkan apa yang terjadi jika kita memperbaiki infrastruktur dan metrik bisnis masih tidak membaik?" tanya Priya.

"Maka akar penyebabnya tidak di infrastruktur," kata Carlos. "Yang merupakan informasi berharga. Tanpa metrik bisnis, Anda akan mengejar perbaikan infrastruktur untuk masalah yang hidup di tempat lain."


"Berapa biayanya per bulan ketika kita punya 500 pengiriman bersamaan yang dilacak?" tanya Tom. "Penyimpanan status, aliran Kinesis, fungsi Lambda yang memproses peristiwa?"

Carlos mengangguk. "Itu pertanyaan yang tepat untuk diajukan sekarang, saat Anda merancang, bukan setelah Anda membangunnya."

Ini jenis detail arsitektur yang muncul dalam tinjauan terstruktur — dan sering tidak muncul ketika Anda hanya membangun.

**Architecture Decision Record**

Setelah tinjauan, Carlos merekomendasikan tim mendokumentasikan keputusan mereka dalam **Architecture Decision Records (ADRs)** — dokumen pendek yang menangkap:

- **Keputusan apa yang dibuat**
- **Alternatif apa yang dipertimbangkan**
- **Mengapa keputusan ini dibuat (konteks dan batasan pada saat itu)**
- **Apa trade-off-nya**
- **Apa yang akan menyebabkan kita meninjau kembali keputusan ini**

Anda mungkin bertanya-tanya: apakah ADR perlu menjadi dokumen formal? Tidak. ADR bisa berupa paragraf dalam utas Slack jika di situlah tim Anda bekerja. Formatnya tidak relevan. Tindakan menuliskan apa yang Anda putuskan dan mengapa — sebelum melanjutkan — itulah yang menciptakan memori institusional.

"ADR untuk diri masa depan Anda," kata Carlos. "Dalam 18 bulan, Anda akan melihat sepotong arsitektur dan bertanya-tanya mengapa itu dilakukan dengan cara itu. Jika Anda punya ADR, Anda akan memahami konteksnya. Jika tidak, Anda akan membiarkannya (karena Anda takut menyentuhnya) atau mengubahnya (karena Anda tidak memahami mengapa itu dilakukan dengan cara itu)."

Leo menulis ADR pertama sore itu: keputusan untuk menggunakan Kinesis untuk peristiwa pelacakan pengiriman, dengan konteks, alternatif yang dipertimbangkan (SQS, EventBridge, polling), dan trade-off-nya.

Carlos melihat ADR yang telah Leo rancang. Dia membacanya dalam tiga puluh detik. Lalu dia berkata: "Tunjukkan ke tim seperti apa ADR-007."

Leo memproyeksikannya.

---

**ADR-007: Infrastruktur Peristiwa Pelacakan Pengiriman**

**Tanggal**: 2025-03-14
**Status**: Diterima
**Penulis**: Leo (dengan tinjauan dari Carlos, Priya)

---

**Masalah**

Nimbus Instant memerlukan pelacakan status pengiriman real-time. Pesanan harus memperbarui statusnya (dikonfirmasi → sedang disiapkan → dalam perjalanan → terkirim) dan memunculkan pembaruan itu ke aplikasi seluler pelanggan dalam 5 detik dari perubahan status. Sistem pengembalian dana juga butuh log peristiwa pengiriman yang dapat diaudit dan diputar ulang untuk menentukan kepatuhan SLA.

---

**Opsi yang Dipertimbangkan**

**Opsi 1: API Gateway WebSocket + status DynamoDB**
- Klien mempertahankan koneksi WebSocket per pesanan
- Backend mendorong perubahan status melalui koneksi terbuka
- Saat menyambung ulang, klien menarik status saat ini dari DynamoDB
- Perkiraan biaya pada skala besar (10K pesanan aktif bersamaan): ~$150/bulan
- Kelemahan: Manajemen batas koneksi pada skala besar; tidak ada replay bawaan untuk audit

**Opsi 2: Polling klien (interval 5 detik)**
- Klien melakukan polling `/orders/{order_id}/status` setiap 5 detik
- Backend membaca dari DynamoDB pada setiap poll
- Implementasi paling sederhana
- Perkiraan biaya pada skala besar (10K pesanan aktif bersamaan): $18.130/bulan
- Dieliminasi karena biaya

**Opsi 3: Kinesis Data Streams + Server-Sent Events**
- Perubahan status pengiriman dipublikasikan ke aliran Kinesis, diukur berdasarkan throughput: satu shard memasukkan 1 MB/d atau 1.000 rekaman/d. Pada 10K pesanan aktif (~4 peristiwa perubahan-status per pesanan, payload JSON kecil), laju tulis puncak adalah ~40-50 peristiwa/d — senilai satu shard. Provision 3 shard untuk penyebaran partisi dan headroom konsumen.
- Endpoint SSE berlangganan ke shard Kinesis yang ditugaskan ke partisi pesanan
- Klien menerima peristiwa SSE; menyambung ulang menggunakan API EventSource standar
- Perkiraan biaya pada skala besar (10K pesanan aktif bersamaan): ~$75/bulan
- Menyediakan log peristiwa yang tahan lama dan dapat diputar ulang; memisahkan semua konsumen

---

**Keputusan**

Opsi 3: Kinesis Data Streams + SSE.

Alasan: keuntungan biaya signifikan pada skala besar; log peristiwa Kinesis memenuhi persyaratan audit pengembalian dana tanpa implementasi jejak audit terpisah; penanganan penyambungan ulang SSE lebih sederhana daripada manajemen koneksi WebSocket pada skala besar.

---

**Konsekuensi**

- *Positif*: Sistem pengembalian dana, sistem notifikasi restoran, dan aplikasi pelanggan semuanya mengonsumsi dari aliran Kinesis yang sama secara independen. Konsumen baru bisa ditambahkan tanpa memodifikasi produser.
- *Positif*: Peristiwa dapat diputar ulang hingga 7 hari (retensi diperpanjang yang kita konfigurasi; Kinesis mendukung hingga 365 hari dengan biaya tambahan). Jika Lambda pemrosesan pengembalian dana gagal, ia bisa memutar ulang peristiwa yang terlewat.
- *Negatif*: Latensi SSE (~200ms) lebih tinggi daripada latensi WebSocket (~50ms). Dapat diterima karena perbedaan ini di bawah ambang persepsi pelanggan untuk pembaruan status.
- *Negatif*: Harga provisioned Kinesis berskala dengan shard-hour, dan retensi diperpanjang kira-kira menggandakan biaya per-shard. Headroom throughput besar (satu shard memasukkan 1.000 rekaman/d), tetapi seiring jumlah konsumen dan beban baca per-konsumen tumbuh melewati kira-kira 50K pesanan aktif harian, jumlah shard — dan strategi re-shard/fan-out konsumen — perlu ditinjau ulang.

**Apa yang akan menyebabkan kita meninjau kembali keputusan ini**: Jika volume pesanan tumbuh hingga biaya shard Kinesis melebihi biaya WebSocket pada skala baru, atau jika latensi SSE 200ms menjadi masalah diferensiasi produk.

---

"Baris terakhir," kata Maya. "Itu yang belum saya pikirkan."

"Pemicu untuk meninjau kembali," kata Carlos. "Setiap keputusan punya kondisi di mana ia menjadi salah. Menuliskannya berarti Anda akan mengenalinya ketika muncul."

"Alih-alih menemukannya dalam post-mortem," kata Priya.

"Alih-alih itu, ya."

Tom membaca konsekuensi biaya. "Strategi re-shard dan fan-out — kita belum punya itu."

"Anda tidak membutuhkannya sampai 50K pesanan aktif harian," kata Carlos. "Pada 287 restoran dan 4.200 pesanan harian Anda saat ini, Anda punya headroom signifikan. ADR memberi tahu Anda apa yang harus dibangun sebelum ia menjadi mendesak, bukan sebelum ia menjadi relevan."

Leo telah mencatat. "ADR melakukan dua hal," katanya. "Ia mendokumentasikan apa yang kita putuskan. Dan ia mendokumentasikan apa yang perlu kita putuskan berikutnya jika situasi berubah."

"Itulah yang membuat ADR berguna selama delapan belas bulan," kata Carlos. "Bukan keputusannya sendiri — keputusan menjadi basi. Penalarannya. Penalaran memberi tahu Anda apakah keputusan harus ditinjau kembali, bahkan ketika keputusan masih berlaku."


**Apa yang Membuat Seorang Arsitek**

Di akhir sesi, Maya menanyakan Carlos pertanyaan aslinya: "Apa perbedaan antara membuat keputusan arsitektur dan berpikir seperti seorang arsitek?"

Dia mempertimbangkannya.

"Seorang arsitek tidak tahu lebih banyak teknologi daripada insinyur senior," katanya. "Arsitek yang baik mungkin tahu sedikit lebih sedikit tentang framework terbaru. Tetapi seorang arsitek punya set pertanyaan default yang berbeda."

"Apa maksudmu?"

"Ketika Anda insinyur senior yang melihat fitur baru, pertanyaan pertama Anda biasanya: 'Apa yang kita bangun? Bagaimana cara kerjanya? Apa library terbaik untuk ini?' Ketika seorang arsitek melihat fitur yang sama, pertanyaan pertama mereka adalah: 'Masalah apa yang diselesaikan ini? Apa yang rusak pertama ketika lalu lintas berlipat ganda? Bagaimana kita tahu ketika ia terdegradasi? Apa pengalaman pengguna ketika pemroses pembayaran lambat?'"

"Arsitek bertanya tentang sistem di bawah tekanan," kata Leo.

"Dan tentang konsekuensi bisnis dari setiap kegagalan," tambah Priya.

"Dan," kata Tom, "tentang apa yang terjadi pada tagihan ketika ini berskala."

Carlos mengangguk. "Kalian semua sudah melakukan ini. Kalian telah melakukannya sejak Bab 1. Perbedaan antara insinyur senior dan arsitek bukanlah sertifikasi atau gelar. Itu kebiasaan mengajukan pertanyaan berikutnya — yang mengungkapkan hal yang belum Anda pikirkan."

**Variasi: Ketika Tinjauan Arsitektur Menambah Risiko Alih-Alih Menghilangkannya**

Jika tinjauan Anda diperlakukan sebagai gerbang persetujuan alih-alih proses pembelajaran, tim akan mulai menyembunyikan pilihan desain untuk menghindari penundaan — dan mode kegagalan akan tetap ada, hanya tidak terdokumentasi. Tinjauan arsitektur yang memperlambat pengiriman tanpa meningkatkan kualitas lebih buruk daripada tidak ada tinjauan sama sekali.

Jika masalah idempotensi untuk layanan pengembalian dana telah diperlakukan sebagai penundaan tak terduga ke peluncuran fitur alih-alih penemuan yang diperlukan, Leo akan mengirimkan endpoint asli, pengembalian dana ganda pada akhirnya akan terjadi, dan tim akan mengetahuinya dari pelanggan yang marah. Tinjauan memunculkan masalah pada titik di mana memperbaikinya berbiaya satu hari, bukan rollback.

Nilai tinjauan proporsional dengan seberapa bersedia tim membiarkannya mengubah desain.

## Kekuatan dan Batasan

**Tinjauan arsitektur**:

- Menangkap mode kegagalan sebelum mereka berada di produksi
- Menciptakan pemahaman bersama antara anggota tim yang sering punya pengetahuan tersilo
- Menghasilkan dokumentasi (ADR) yang memberi keuntungan selama bertahun-tahun
- Memperlambat pengambilan keputusan dengan cara yang bermanfaat — "bergerak cepat" tanpa tinjauan adalah "bergerak cepat dan menabrak tembok yang tidak Anda lihat"

**Di mana mereka menjadi rumit**:

- Membutuhkan seseorang yang cukup terampil untuk mengajukan pertanyaan yang tepat — tinjauan hanya sebaik peninjaunya
- Bisa menjadi birokratis jika diperlakukan sebagai kotak centang alih-alih percakapan
- Beberapa keputusan arsitektur benar-benar tidak butuh tinjauan lengkap — mengetahui mana yang butuh itu sendiri adalah keterampilan arsitektur
- Output-nya (ADR, diagram, log keputusan) harus dipelihara seiring sistem berkembang

## Ringkasan

Tinjauan dengan Carlos butuh dua jam dan menghasilkan tiga ADR, daftar enam hal yang tidak diketahui untuk diselesaikan sebelum fitur dibangun, dan satu perubahan arsitektur (penyimpanan status idempotensi) yang akan menyakitkan untuk dipasang ulang setelah peluncuran. Metafora daftar periksa pra-penerbangan berlaku sepanjang waktu: tidak ada hal katastropik yang ditemukan, tetapi beberapa hal yang akan menyebabkan masalah nanti telah ditangkap dan didokumentasikan saat mereka masih mudah diperbaiki.

- Tinjauan arsitektur dimulai dengan **persyaratan bisnis, bukan teknologi**.
- Struktur tinjauan: batasan → yang tidak diketahui → opsi → mode kegagalan → pemantauan → runbook.
- Arsitek bertanya: Apa yang rusak pertama? Bagaimana kita tahu ia terdegradasi? Apa pengalaman pengguna selama kegagalan? Berapa biayanya pada skala besar?
- **Architecture Decision Records (ADRs)** menangkap apa yang diputuskan, mengapa, dan apa yang akan menyebabkan pertimbangan ulang.
- Berpikir seperti arsitek adalah kebiasaan: mengajukan pertanyaan berikutnya, terutama tentang mode kegagalan, konsekuensi bisnis, dan ekonomi skala.

## Tips Ujian

*SAA-C03 Domain: Cross-domain — penalaran arsitektur*

Bab ini kurang tentang topik ujian tertentu dan lebih tentang pola pikir yang diuji ujian.

- **Skenario SAA-C03** hampir selalu menggambarkan batasan bisnis terlebih dahulu ("perusahaan tidak mampu lebih dari 1 jam downtime") dan meminta Anda memilih arsitektur yang memenuhinya. Berlatihlah menerjemahkan batasan bisnis ke persyaratan teknis.
- **Pemikiran mode kegagalan**: Banyak pertanyaan ujian menggambarkan sistem dan menanyakan apa yang terjadi ketika komponen gagal. Berlatihlah bertanya "apa yang rusak pertama?" untuk arsitektur yang Anda temui.
- **Pemikiran trade-off**: Ujian jarang punya jawaban "sempurna". Ia meminta jawaban *terbaik* dengan sekumpulan batasan. Biasakan diri dengan "opsi ini benar mengingat persyaratan spesifik ini, meskipun opsi lain akan lebih baik di bawah persyaratan berbeda."
- **Architecture Decision Records**: Bukan layanan AWS, tetapi praktik terbaik yang mencerminkan pilar Operational Excellence dari Well-Architected Framework.
- **Kinesis untuk event streaming real-time**: Fitur Nimbus Instant dalam bab ini menggunakan Kinesis untuk streaming peristiwa pengiriman. Sinyal ujian: "ingesti peristiwa real-time dengan pemrosesan terurut" → Kinesis Data Streams. "Memisahkan komponen, pengiriman at-least-once" → SQS. Mengetahui kapan menggunakan masing-masing adalah pola ujian yang berulang.
- **Idempotensi sebagai pola yang dapat diuji**: SAA-C03 sering menguji idempotensi dalam sistem terdistribusi. Pola intinya: hasilkan kunci idempotensi unik sebelum memanggil sistem eksternal; persisten-kan kunci dan hasilnya; saat retry, periksa kunci yang ada sebelum mengeksekusi ulang. Jika ditemukan, kembalikan hasil yang sebelumnya disimpan tanpa mengeksekusi ulang. Ini mencegah double-charge, double-send, dan mutasi status duplikat ketika retry terjadi setelah timeout jaringan. Sinyal ujian: "cegah operasi duplikat ketika panggilan layanan di-retry" atau "pastikan pemrosesan exactly-once peristiwa pembayaran" → kunci idempotensi disimpan di DynamoDB dengan conditional write.
- **Server-Sent Events vs WebSockets**: SSE bersifat satu arah (server ke klien), menggunakan HTTP standar, dan menyambung ulang secara otomatis via API EventSource. WebSockets bersifat dua arah, memerlukan manajemen koneksi, dan sesuai ketika klien juga perlu mendorong data ke server. Untuk pembaruan status pengiriman (server-ke-klien saja), SSE lebih sederhana dan lebih murah daripada WebSockets pada skala besar.

## Latihan

**Latihan 1 — Mengingat**

Carlos mengajukan enam jenis pertanyaan selama tinjauan arsitektur. Bisakah Anda merekonstruksi enam area itu tanpa melihat bab ini?

*(Petunjuk: Mereka tercantum dalam bagian "Struktur Tinjauan Arsitektur". Coba ingat dari memori — tindakan mencoba mengingat (bahkan jika Anda gagal) memperkuat retensi jangka panjang.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan sedang membangun sistem manajemen penawaran real-time untuk iklan online. Penawaran harus dievaluasi dan dijawab dalam 100 milidetik. Sistem memproses 1 juta penawaran per detik pada puncak. Jika sistem penawaran mati, perusahaan kehilangan pendapatan iklan. Tim database perusahaan mengusulkan menggunakan RDS Aurora dengan 10 read replica. Arsitek solusi harus mengevaluasi apakah proposal itu pada dasarnya layak sebelum meninjau karakteristik sekundernya.

Masalah mana yang harus diajukan arsitek PERTAMA?

A) Biaya 10 read replica Aurora terlalu tinggi untuk anggaran  
B) Read replica Aurora punya lag replikasi yang dapat menyebabkan masalah konsistensi  
C) Latensi kueri tipikal Aurora 1-5ms mungkin tidak memenuhi SLA respons 100ms  
D) RDS Aurora tidak mendukung volume transaksi 1 juta permintaan per detik pada persyaratan latensi ini

**Petunjuk 1**: Batasan utamanya adalah 100ms total waktu respons pada 1 juta permintaan/detik. Dari kekhawatiran ini, mana yang, jika valid, membuat proposal tidak dapat dijalankan tidak peduli bagaimana tiga lainnya ditangani?

**Petunjuk 2**: Latensi kueri Aurora biasanya 1-5ms. 1-5ms untuk kueri database menyisakan 95-99ms untuk jaringan, logika aplikasi, dan serialisasi. Apakah batasan 100ms berisiko?

**Petunjuk 3**: Aurora bisa menangani IOPS tinggi, tetapi 1 juta permintaan per detik adalah laju yang luar biasa. Apa yang terjadi pada arsitektur pada skala itu?

**Jawaban**: D

**Penjelasan**: Meskipun Aurora berkinerja tinggi, 1 juta permintaan per detik pada 100ms total waktu respons adalah persyaratan ekstrem — itu adalah penghalang arsitektur yang menentukan apakah proposal bisa ada sama sekali. Arsitek harus pertama mempertanyakan apakah Aurora (atau database relasional apa pun) bisa berfungsi sebagai sistem lookup utama pada skala dan latensi ini. Sistem seperti ini biasanya menggunakan penyimpanan data in-memory (Redis) atau database latensi-rendah khusus, bukan database relasional dengan semantik SQL penuh. SLA 100ms dapat dicapai untuk kueri Aurora saja, tetapi kombinasi 1M RPS dan 100ms total SLA melebihi karakteristik throughput Aurora tipikal. "PERTAMA" berarti kelayakan sebelum penyempurnaan: jika mesin tidak bisa menanggung beban, setiap kekhawatiran lain tentang proposal menjadi tidak relevan.

**Mengapa bukan A?** Biaya adalah kekhawatiran yang valid, tetapi kekhawatiran pertama harus apakah arsitektur secara teknis layak pada persyaratan yang dinyatakan.

**Mengapa bukan B?** Lag replikasi adalah karakteristik proposal yang nyata tetapi *sekunder* — properti yang Anda setel setelah arsitektur layak. Lag replika Aurora biasanya <100ms dan dapat diterima untuk sebagian besar kasus penggunaan; mengangkatnya pertama akan berarti memperdebatkan perilaku konsistensi sistem yang tidak bisa menanggung throughput yang diperlukan di tempat pertama. Pertanyaan kelayakan (D) menaungi itu.

**Mengapa bukan C?** Latensi Aurora 1-5ms berada jauh dalam SLA 100ms untuk porsi kueri database. Ini bukan kekhawatiran utama.

*SAA-C03 Domain: Cross-domain — desain sistem*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Terapkan struktur tinjauan arsitektur ke sistem nyata atau hipotetis:

Sebuah startup ingin membangun game trivia multipemain real-time. Pemain bergabung ke ruang permainan (hingga 10 pemain masing-masing). Setiap putaran menampilkan pertanyaan selama 15 detik; semua pemain menjawab secara bersamaan. Skor dihitung secara instan setelah setiap pertanyaan. Permainan berlangsung 10 putaran. Penggunaan puncak: 50.000 permainan bersamaan.

Jalankan tinjauan enam langkah:

1. Apa batasan yang tidak dapat dinegosiasikan?
2. Apa hal yang tidak diketahui dan asumsi?
3. Apa opsi teknologi yang realistis?
4. Apa mode kegagalannya?
5. Bagaimana Anda akan tahu ketika ia terdegradasi?
6. Seperti apa runbook pukul 3 pagi?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih struktur tinjauan sebagai alat berpikir.)*

## Adegan Pasca-Kredit

Carlos meninggalkan kantor pukul 6 sore.

Tim duduk beberapa saat setelahnya, tidak melakukan apa pun secara khusus.

"Saya merasa saya belajar lebih banyak dalam dua jam itu daripada dalam bab layanan AWS individual mana pun," kata Leo.

"Itu karena bab-bab itu tentang alat," kata Maya. "Ini tentang penilaian."

"Apakah penilaian dapat diajarkan?" tanyanya.

"Ya," kata Priya. "Tetapi bukan melalui membaca. Melalui praktik. Melalui membuat keputusan, melihat apa yang rusak, memikirkan mengapa."

"Melalui pengalaman," kata Tom.

"Melalui pengalaman terstruktur," koreksi Priya. "Pengalaman tanpa refleksi tidak membangun penilaian. Anda harus mengajukan pertanyaan setelahnya."

Maya melihat papan tulis. Catatan tinjauan masih di sana — batasan, yang tidak diketahui, mode kegagalan, pertanyaan pemantauan. Itu memenuhi dua papan tulis.

"Ini harus masuk ke ADR," katanya.

Leo sudah mengetik.

Di bab terakhir: satu hal yang tidak bisa diberikan alat atau kerangka kerja mana pun — dan mengapa "tergantung" adalah jawaban paling jujur dan kuat dalam arsitektur perangkat lunak.
