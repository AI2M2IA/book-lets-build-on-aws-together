# Bab 13: Cepat di Mana Saja

Sebuah foto yang berjalan dari server di Oregon ke telepon di Boston menempuh jarak sekitar 4.100 kilometer kabel serat optik. Pada dua pertiga kecepatan cahaya, itu sekitar 25 milidetik fisika murni — tidak dapat dihindari, tidak dapat dinegosiasikan, tertanam dalam hukum alam semesta.

Lalu tambahkan perjalanan bolak-balik. Lalu tambahkan waktu pemrosesan. Peramban belum mulai merender dan 80 milidetik sudah hilang.

---

*`eatnimbus.com` sudah aktif dan nama domainnya nyata. Pengguna dapat menemukan aplikasinya. Tetapi menemukannya tidak sama dengan menikmatinya. Tom telah menjalankan pengukuran latensi dari berbagai kota, dan angka dari Pantai Timur dan Amerika Selatan tidak bagus. Masalah nama domain telah terpecahkan. Masalah fisika belum.*

---

`eatnimbus.com` sudah aktif. Leo telah memeriksa metrik latensi dari pengguna Pantai Timur: 80-100 milidetik per permintaan. Itu mungkin terdengar kecil, tetapi ia menumpuk.

Muat menu: 90ms. Muat daftar restoran: 80ms. Muat foto-foto restoran: 200ms (gambar itu besar). Total waktu sebelum pengguna dapat melakukan pemesanan: lebih dari setengah detik pada koneksi yang baik.

"Fisika adalah masalahnya," kata Leo. "Server ada di Oregon. Pertumbuhan ada di Pantai Timur — dan di São Paulo."

"Jadi pindahkan server ke Pantai Timur," kata Tom.

"Itu memakan biaya."

"Berapa biayanya per bulan?" tanya Tom.

"Menjalankan duplikat penuh infrastruktur kita di us-east-1? Mungkin tiga kali lipat biaya kita saat ini. Dan itu menciptakan masalah yang sama sekali baru: menjaga database Pantai Barat dan database Pantai Timur tetap sinkron."

Priya mendongak dari laptopnya. "Atau kita tidak memindahkan server. Kita memindahkan *konten*."

Maya mendongak. "Apa bedanya? Jika konten ada di server, dan server ada di Oregon, maka konten ada di Oregon."

"Sebagian besar dari apa yang disajikan sebuah halaman bersifat statis," kata Priya. "Gambar, stylesheet, file JavaScript, font. Itu sama untuk setiap pengguna. Mereka tidak berasal dari database. Mereka tinggal di S3. Dan objek S3 dapat disajikan dari mana saja."

"Jadi kita menyalinnya ke server yang lebih dekat dengan pengguna?"

"Kita membiarkan sebuah layanan mengelolanya untuk kita. Satu sumber kebenaran. Salinan di mana pun dibutuhkan."

Tom sudah membuka halaman harga. Ia menghitung sebelum Priya selesai menjelaskan.

**Analogi Gudang yang Sudah Distok Sebelumnya**

Bayangkan Amazon si pengecer, bukan perusahaan cloud. Mereka memiliki gudang besar di satu lokasi dengan setiap produk. Jika mereka mengirim setiap pesanan dari satu gudang itu, pelanggan di kota-kota jauh akan menunggu berhari-hari.

Sebaliknya, Amazon memiliki pusat pemenuhan dekat pusat-pusat populasi utama. Ketika sebuah produk populer, mereka menyetok gudang lokal itu sebelumnya. Ketika pelanggan di Seattle memesan buku, ia dikirim dari pusat pemenuhan lokal — bukan dari seberang negara.

Inilah **Content Delivery Network (CDN)**: jaringan server yang terdistribusi secara geografis yang meng-cache salinan konten Anda dekat dengan pengguna Anda.

Ketika pengguna di Boston meminta halaman beranda Anda, CDN menyajikannya dari server di Boston. Bukan Oregon. Permintaan tidak pernah menyeberangi negara.

**Perkenalkan CloudFront**

Amazon CloudFront adalah CDN milik AWS. Ia beroperasi melalui jaringan global **edge location** — server caching yang ditempatkan di kota-kota di seluruh dunia. Pada saat penulisan ini, ada lebih dari 750 points of presence di 100+ kota.

Ketika Anda mengonfigurasi CloudFront, Anda menentukan sebuah **origin**: sumber konten Anda yang sebenarnya. Origin Anda bisa berupa:

- Sebuah bucket S3 (file statis: gambar, CSS, JavaScript, PDF)
- Sebuah Application Load Balancer (konten dinamis dari aplikasi Anda)
- Sebuah instans EC2
- Sebuah server HTTP di mana saja di internet

CloudFront berada di depan origin Anda. Permintaan masuk di edge location terdekat. Jika edge memiliki konten yang di-cache, ia mengembalikannya segera. Jika tidak (sebuah *cache miss*), ia mengambil dari origin Anda, meng-cache-nya, dan mengembalikannya.

**Cara Kerja Caching CloudFront**

Permintaan pertama untuk setiap potongan konten selalu cache miss — ia pergi ke origin. Setiap permintaan berikutnya menghantam cache di edge location.

Untuk Nimbus, foto-foto menu adalah kandidat CloudFront yang sempurna. Foto restoran jarang berubah (mungkin ketika restoran memperbarui profil mereka). Dengan CloudFront:

1. Pengguna di Boston meminta `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront memeriksa edge location di Boston — belum di-cache (cache miss)
3. CloudFront mengambil dari S3 di us-west-2 (~80ms)
4. CloudFront menyimpan foto di edge location Boston
5. Pengguna berikutnya di Boston meminta foto yang sama
6. CloudFront menyajikan dari cache edge lokal (~5ms)

Penalti 80ms yang sama untuk permintaan pertama. Tetapi permintaan keseribu dari kota yang sama adalah 5 milidetik.

**Header Cache-Control** dan **pengaturan TTL** di CloudFront menentukan berapa lama konten tetap di-cache di edge. File gambar dapat di-cache selama berjam-jam atau berhari-hari. Halaman HTML (yang lebih sering berubah) mungkin di-cache selama beberapa menit atau detik.

Anda mungkin bertanya-tanya: mengapa tidak meng-host saja seluruh aplikasi di beberapa region alih-alih menggunakan CDN? Jika data ada di Oregon, mengapa tidak menaruh salinan penuh di New York, Tokyo, dan São Paulo? Anda bisa. Tetapi itu berarti menjaga beberapa database tetap tersinkronisasi, mengelola deployment di seluruh region secara bersamaan, menangani skenario split-brain di mana region tidak setuju. CDN adalah jawaban yang jauh lebih sederhana untuk konten statis dan semi-statis: satu origin, banyak salinan yang di-cache di edge. Anda hanya menambahkan kompleksitas multi-region ketika Anda benar-benar membutuhkan operasi komputasi atau database dekat pengguna — untuk sebagian besar konten, caching di edge sudah cukup.

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya. "Mengapa menaruh cache di edge alih-alih hanya menambahkan klaster ElastiCache yang lebih besar di Oregon?"

"Karena fisika tetap menjadi masalah," kata Priya. "Bahkan jika Oregon merespons dalam satu milidetik, respons itu tetap harus berjalan ke Boston. Waktu pulang-pergi minimal 70 milidetik — kecepatan cahaya tidak peduli seberapa cepat server kita. Caching di edge memindahkan jawaban lebih dekat ke pertanyaan."

**Konten Dinamis: CloudFront untuk Lebih dari Sekadar Caching**

"Tetapi bagaimana dengan respons API kita?" tanya Leo. "Itu dinamis — mereka berubah per pengguna, per permintaan. Anda tidak bisa meng-cache halaman riwayat pesanan."

Benar. Tetapi CloudFront tetap membantu dengan konten dinamis.

Bahkan ketika konten tidak dapat di-cache, CloudFront merutekan permintaan dari edge location ke origin melalui jaringan backbone privat AWS — serat berkecepatan tinggi yang menghubungkan infrastruktur AWS secara global. Ini lebih cepat dan lebih andal daripada merutekan melalui internet publik, di mana lalu lintas dapat memantul melalui beberapa carrier.

Hasilnya: permintaan dinamis tetap 20-40% lebih cepat melalui CloudFront daripada langsung ke origin melalui internet publik. Bukan karena caching, tetapi karena jalur jaringannya.

"Itu tidak masuk akal," kata Maya. "Jika respons API tetap harus berjalan dari Oregon ke edge lalu ke Boston, bagaimana itu lebih cepat daripada langsung dari Oregon ke Boston?"

"Dua alasan," kata Priya. "Pertama, backbone privat AWS lebih cepat dan lebih andal daripada internet publik. Lalu lintas internet publik merutekan melalui beberapa carrier, masing-masing menambahkan latensi dan variabilitasnya sendiri. Backbone adalah serat langsung, latensi rendah. Kedua, terminasi SSL terjadi di edge. Pengguna membangun koneksi TLS ke edge location CloudFront terdekat — handshake-nya cepat. CloudFront kemudian menjaga koneksi persisten yang sudah ditetapkan ke origin. Dua koneksi jarak pendek alih-alih satu jarak jauh."

"Jadi bahkan untuk konten yang tidak di-cache, CloudFront memangkas waktu dari overhead koneksi," kata Leo.

"Biasanya sepuluh hingga empat puluh persen. Tidak sedramatis caching. Tetapi nyata."

Selain itu, CloudFront menyediakan:

**Terminasi SSL/TLS**: CloudFront menangani HTTPS di edge. Koneksi antara pengguna dan CloudFront terenkripsi. CloudFront dapat terhubung ke origin Anda melalui HTTP secara internal (mengurangi beban origin) atau HTTPS (untuk enkripsi ujung-ke-ujung).

**Perlindungan DDoS**: CloudFront terintegrasi dengan AWS Shield Standard. Lalu lintas yang terdistribusi di ratusan edge location berarti serangan diserap di edge alih-alih menghantam origin Anda.

**Geo-restriction**: Blokir akses dari negara-negara tertentu. Jika Nimbus hanya berlisensi untuk beroperasi di pasar tertentu, CloudFront dapat menegakkan itu di edge tanpa permintaan pernah mencapai server Anda.

**Dan bagaimana jika seseorang mencoba menerobos masuk melalui CDN?** tanya Priya. "Cache poisoning — bagaimana jika seseorang berhasil menyuntikkan konten buruk ke cache edge?"

"CloudFront memiliki kontrol cache key," kata Leo. "Anda mendefinisikan persis atribut apa yang menentukan apakah dua permintaan mendapatkan respons cache yang sama. Header, query string, cookie. Penyerang tidak dapat menyuntikkan respons cache yang berbeda tanpa mencocokkan cache key yang persis."

"Dan Origin Access Control berarti bucket S3 tidak akan menyajikan apa pun yang tidak datang melalui CloudFront," kata Priya. "Satu permukaan serangan alih-alih dua."

**CloudFront Behavior: Aturan Caching yang Halus**

Sebuah distribusi CloudFront dapat memiliki beberapa **behavior** — aturan routing berdasarkan pola URL.

Untuk Nimbus:

- `/images/*` → Cache di edge selama 7 hari (foto tidak sering berubah)
- `/static/*` → Cache di edge selama 30 hari (CSS dan JavaScript dengan nama file berversi)
- `/api/*` → Jangan cache; teruskan langsung ke load balancer
- `/*` → Cache selama 5 menit (halaman HTML)

Ini memungkinkan CloudFront menjadi cerdas: meng-cache secara agresif apa yang stabil, meneruskan apa yang dinamis.

Behavior dicocokkan dari yang paling spesifik ke yang paling tidak spesifik. `/images/hero.jpg` cocok dengan `/images/*` sebelum cocok dengan `/*`. Catch-all `/*` di bagian bawah adalah default — ia berlaku untuk apa pun yang tidak cocok dengan pola yang lebih spesifik.

"Bagaimana jika kita ingin caching berbeda untuk pengguna terautentikasi vs tidak terautentikasi?" tanya Priya. "URL yang sama mungkin mengembalikan konten berbeda tergantung apakah pengguna masuk."

"Maka Anda menyertakan cookie sesi dalam cache key," kata Leo. "Tetapi itu berarti setiap pengguna yang masuk mendapatkan entri cache-nya sendiri. Hit rate Anda runtuh untuk konten terautentikasi."

"Itulah mengapa Anda memisahkan konten terautentikasi dari konten publik di level URL," kata Priya. "Apa pun yang membutuhkan autentikasi pergi ke `/app/*` dan tidak di-cache. Konten publik pergi ke `/browse/*` dan di-cache secara agresif. Satu batas yang jelas."

Pelajarannya: CloudFront bekerja paling baik ketika struktur URL Anda mencerminkan maksud caching. URL yang menunjuk ke data yang sepenuhnya publik dan statis harus terlihat berbeda dari URL yang mengembalikan data yang dipersonalisasi dan dinamis. Jika mereka terlihat sama bagi CloudFront, entah cache-nya rusak atau konten yang salah disajikan.

Leo merestrukturisasi skema URL Nimbus selama akhir pekan. Endpoint penelusuran pindah ke `/browse/`. Endpoint API pindah ke `/api/`. UI aplikasi terautentikasi pindah ke `/app/`. Tiga behavior, tiga kebijakan caching yang jelas, nol ambiguitas.

"Ini agak sebuah refactor," katanya.

"Ini struktur yang tepat," kata Priya. "Anda akan membutuhkannya pada akhirnya."

**Origin Access Control: Mengamankan S3 dengan CloudFront**

Jika bucket S3 Anda berisi konten privat yang hanya boleh disajikan melalui CloudFront (bukan langsung), Anda dapat menggunakan **Origin Access Control (OAC)** untuk memastikan S3 menolak permintaan yang tidak datang dari CloudFront.

Dengan cara ini:

- `d1234abcd.cloudfront.net/image.jpg` → Disajikan (CloudFront memiliki izin)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Diblokir (akses S3 langsung ditolak)

Konten Anda hanya dapat dijangkau melalui distribusi Anda, dengan aturan cache dan pengaturan keamanan Anda diterapkan.

---

**Insiden Foto Basi**

Restoran 112 — tempat makan Kolombia di Eastside — mengirim email ke dukungan pada Kamis pagi. Seorang pelanggan mengeluh bahwa foto hero restoran masih menampilkan etalase lama, meskipun pemilik telah mengunggah yang baru dua hari lalu.

Leo membuka pengaturan distribusi CloudFront.

Behavior untuk `/images/*` memiliki TTL tujuh hari. Portal mitra restoran telah mengunggah foto baru dua hari lalu, menggantikan file di jalur kunci S3 yang sama: `restaurant-112/hero.jpg`. File lama hilang dari S3. Tetapi CloudFront masih menyajikannya dari cache di setiap edge location yang telah mengambilnya dalam tujuh hari terakhir.

"Kita mengubah konten di origin," kata Leo. "Tetapi CloudFront tidak tahu itu. Ia memiliki salinan yang di-cache dan ia tidak akan memeriksa selama tujuh hari."

"Aku sudah men-deploy-nya — oh." Ia berasumsi mengganti file S3 akan otomatis menyegarkan cache CloudFront. Tidak. CloudFront tidak memiliki mekanisme untuk mendeteksi bahwa konten di sebuah kunci S3 telah berubah — ia hanya menyajikan apa pun yang di-cache sampai TTL kedaluwarsa.

Dua opsi:

**Opsi satu: Invalidasi.** Kirim CloudFront permintaan invalidasi untuk `/images/restaurant-112/hero.jpg`. CloudFront menandai jalur itu basi di semua edge location. Permintaan berikutnya untuk jalur itu mengambil konten segar dari S3. Biaya: 1.000 jalur invalidasi pertama setiap bulan gratis; di atas itu, $0,005 *per jalur*. Untuk satu file, gratis. Untuk menginvalidasi ribuan file selama pembaruan massal, biaya menumpuk.

**Opsi dua: Nama file berversi.** Alih-alih `hero.jpg`, namai file `hero-v2.jpg`. Perbarui referensi di database. CloudFront tidak memiliki entri yang di-cache untuk `hero-v2.jpg` — permintaan pertama mengambilnya dari S3, dan pengguna melihatnya segera. `hero.jpg` lama tetap di-cache tetapi tidak lagi dirujuk di mana pun. Ia kedaluwarsa secara alami setelah tujuh hari.

"Untuk konten yang diunggah pengguna," kata Priya, "nama berversi adalah pola yang tepat. Tambahkan hash atau timestamp ke nama file. Setiap unggahan baru adalah entri cache baru. Tanpa biaya invalidasi, tanpa konten basi."

Leo memperbarui portal mitra. Unggahan baru sekarang akan disimpan sebagai `hero-{timestamp}.jpg`. Catatan database diperbarui dengan jalur baru. Jalur lama yang di-cache menjadi tidak relevan.

"Bagaimana dengan kasus deployment?" tanya Maya. "Ketika kita mendorong versi baru aplikasi dan JavaScript-nya berubah?"

"Prinsip yang sama," kata Priya. "Alat build seperti Webpack menghasilkan nama file ber-hash: `app.a3b9c2d4.js`. Deploy versi baru dan hash-nya berubah: `app.f7e1b3c5.js`. CloudFront menyajikan keduanya dari cache — pengguna lama mendapat file lama, pengguna baru mendapat file baru. Tanpa invalidasi, tanpa masalah koordinasi."

"Halaman HTML merujuk hash saat ini," kata Leo. "Jadi pengguna baru mendapat HTML baru dengan hash JS baru, dan CDN menyajikan file yang tepat."

"Praktik standar," konfirmasi Priya.

---

**Latensi dengan Angka Nyata**

Tom telah menjalankan pengukuran latensi dari tiga kota.

| Lokasi | Tanpa CloudFront | Dengan CloudFront | Peningkatan |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"Peningkatan paling besar di mana masalah fisikanya paling buruk," Tom mengamati. "São Paulo ke Oregon lebih dari dua ratus milidetik. Itu lebih dari seperempat detik, hanya untuk memulai percakapan."

"Dan konten tidak pernah mencapai São Paulo untuk kedua kalinya," kata Leo. "Pengguna pertama di São Paulo mengambil dari Oregon dan meng-cache-nya secara lokal. Setiap pengguna setelah itu mendapat tiga puluh lima milidetik."

"Pengguna pertama di São Paulo menanggung biayanya," kata Tom. "Semua orang lain mendapat manfaat."

"Begitulah cara kerja CDN," kata Priya. "Permintaan pertama mengisi cache. Setiap cache hit setelah itu hampir gratis."

Implikasinya untuk produk global signifikan. Tanpa CloudFront, pengguna di Tokyo yang menunggu 260 milidetik untuk gambar hero Anda menunggu karena fisika — kabel serat optik dan kecepatan cahaya. Dengan CloudFront, Anda menaruh salinan gambar itu di Tokyo, dan masalah fisikanya pada dasarnya hilang.

---

**Multiple Origin: ALB dan S3 Bersama**

"Kita punya gambar di S3 dan API kita di load balancer," kata Maya. "Apakah kita butuh dua distribusi CloudFront?"

"Tidak," kata Leo. "Satu distribusi, beberapa origin."

Satu distribusi CloudFront dapat merutekan pola URL yang berbeda ke origin yang berbeda. Ini adalah pola multi-origin:

```
eatnimbus.com/*         → Origin: ALB di us-west-2 (konten dinamis)
eatnimbus.com/images/*  → Origin: bucket S3 (gambar statis)
eatnimbus.com/static/*  → Origin: bucket S3 (CSS, JS, font)
```

CloudFront mengevaluasi behavior dalam urutan spesifisitas. Permintaan ke `/images/hero.jpg` cocok dengan behavior `/images/*` dan pergi ke S3. Permintaan ke `/api/orders` cocok dengan catch-all `/*` dan pergi ke ALB.

Manfaatnya: satu domain, satu sertifikat SSL, satu distribusi CloudFront, beberapa backend. Pengguna melihat domain yang terpadu. Routing-nya tidak terlihat oleh mereka.

Satu detail operasional yang juga merupakan fakta ujian yang terjamin: sertifikat SSL itu berasal dari AWS Certificate Manager (ACM), dan **sertifikat yang digunakan oleh CloudFront harus diminta atau diimpor di `us-east-1`** — terlepas dari di mana origin Anda berada. CloudFront adalah layanan global yang control plane-nya tinggal di us-east-1; sertifikat yang berada di us-west-2 sama sekali tidak akan muncul di dropdown distribusi. (Untuk layanan regional seperti ALB, sertifikat tinggal di region ALB itu sendiri.)

"Dan ALB tidak menghadap publik?" tanya Priya.

"Hanya CloudFront yang berbicara dengan ALB," kata Leo. "Kita membatasi security group ALB ke managed prefix list CloudFront. Koneksi langsung ke ALB dari internet diblokir."

"Jadi satu-satunya cara menjangkau aplikasi adalah melalui CloudFront."

"Yang berarti aturan WAF, terminasi SSL, dan perlindungan DDoS berlaku untuk semua lalu lintas sebelum mencapai kita."

---

**CloudFront Functions vs Lambda@Edge**

"Apakah kita sudah memikirkan apa yang akan kita lakukan jika kita perlu menulis ulang sebuah URL di edge?" tanya Priya. "Atau menambahkan header keamanan ke setiap respons?"

"Tidak bisakah kita melakukan itu di aplikasi?" tanya Leo.

"Kita bisa. Tetapi jika itu terjadi di edge — sebelum CloudFront menyajikan dari cache — kita menghemat satu perjalanan pulang-pergi ke origin."

CloudFront mendukung dua mekanisme untuk menjalankan kode di edge:

**CloudFront Functions** adalah fungsi JavaScript ringan yang berjalan di setiap edge location. Mereka mengeksekusi dalam waktu di bawah milidetik, menangani jutaan permintaan per detik, dan dirancang untuk transformasi sederhana: penulisan ulang URL, manipulasi header, normalisasi query string, redirect sederhana. Mereka dapat berjalan pada viewer request dan viewer response (sebelum dan sesudah cache, dari perspektif pengguna). Mereka tidak dapat melakukan panggilan jaringan. Biaya: $0,10 per juta pemanggilan.

**Lambda@Edge** menjalankan fungsi Lambda yang sebenarnya di regional edge location CloudFront (bukan setiap pop, tetapi puluhan yang utama secara global). Lambda@Edge dapat melakukan panggilan jaringan, mengakses database, menghasilkan respons dinamis, melakukan logika autentikasi kompleks. Ia berjalan pada viewer request, origin request, origin response, dan viewer response — memberi Anda empat titik intervensi dalam siklus hidup permintaan. Biaya: lebih tinggi daripada CloudFront Functions, ditagih per permintaan dan durasi.

Model mentalnya:

| Kasus penggunaan | Alat |
|---|---|
| Tulis ulang `/old-path` ke `/new-path` | CloudFront Functions |
| Tambahkan header `Strict-Transport-Security` | CloudFront Functions |
| Normalisasi query string sebelum pencarian cache | CloudFront Functions |
| A/B test: tetapkan cookie test pada viewer request | CloudFront Functions |
| A/B test: rutekan 10% pengguna ke origin berbeda | Lambda@Edge (origin request — CloudFront Functions tidak bisa mengubah origin) |
| Autentikasi token JWT (membutuhkan pustaka kripto) | Lambda@Edge |
| Ambil konten yang dipersonalisasi dari database di edge | Lambda@Edge |
| Hasilkan thumbnail gambar sesuai permintaan di edge | Lambda@Edge |

Untuk Nimbus: mereka menggunakan CloudFront Function untuk menambahkan header keamanan ke setiap respons — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Dua lusin baris JavaScript. Eksekusi di bawah milidetik. Tidak ada perjalanan pulang-pergi origin yang diperlukan.

"Akan butuh waktu lebih lama untuk menjelaskan header itu ke seorang junior engineer," kata Leo, "daripada menulis fungsinya."

---

**Price Class: Memilih Edge Location Mana**

"Apakah kita sudah memikirkan berapa biaya ini pada skala besar?" tanya Tom, men-scroll halaman harga CloudFront.

"Berapa biayanya per bulan?" secara teknis adalah dua pertanyaan di sini. Pertama: berapa yang dikenakan CloudFront? Kedua: apakah Anda membutuhkan setiap edge location di dunia?

Harga transfer data CloudFront bervariasi berdasarkan region. Lalu lintas yang disajikan dari edge location di Amerika Utara dan Eropa paling murah. Lalu lintas dari Amerika Selatan, Asia Pasifik, Australia, dan India lebih mahal — karena infrastruktur di sana lebih mahal.

AWS memungkinkan Anda memilih sebuah **price class** untuk distribusi Anda:

- **Price Class All**: Menggunakan semua edge location secara global. Performa terbaik di mana saja. Biaya transfer data tertinggi untuk region di luar Amerika Utara dan Eropa.
- **Price Class 200**: Menggunakan sebagian besar edge location (Amerika Utara, Eropa, Asia, Timur Tengah, Afrika). Mengecualikan lokasi Amerika Selatan yang paling mahal dan beberapa lokasi Oseania.
- **Price Class 100**: Menggunakan hanya edge location Amerika Utara dan Eropa. Paling murah. Pengguna di São Paulo, Tokyo, dan Sydney tetap dilayani — tetapi dari edge Amerika Utara atau Eropa, bukan yang terdekat dengan mereka.

"Jadi jika kita memilih Price Class 100," kata Tom, "pengguna di São Paulo dilayani dari... Miami? New York?"

"Edge yang disertakan terdekat. Mungkin 50 milidetik alih-alih 230 milidetik langsung ke Oregon," kata Priya. "Tetap peningkatan yang berarti. Tidak sebagus Price Class All."

"Dan selisih biayanya?"

"Transfer data keluar dari Amerika Selatan sekitar dua kali lipat biaya Amerika Utara. Untuk startup yang masih membangun lalu lintas, Price Class 200 adalah kompromi yang masuk akal — Anda mendapatkan Asia dan Eropa dengan biaya lebih rendah daripada Price Class All, dan sebagian besar pengguna Anda tercakup."

"Mulai dengan 200," kata Tom. "Ketika kita punya data lalu lintas nyata dari setiap region, kita akan memutuskan apakah All sepadan."

Price class yang tepat tergantung di mana pengguna Anda berada. Jika Anda tidak punya pengguna di Amerika Selatan, membayar untuk edge location Amerika Selatan adalah biaya murni. Jika dua puluh persen pendapatan Anda berasal dari Brasil, peningkatan performa dari Price Class All mungkin membayar dirinya sendiri.

---

**Desain Cache Key**

"Apakah kita sudah memikirkan apa yang terjadi ketika dua pengguna berbeda meminta URL yang sama tetapi mendapatkan konten yang berbeda?" tanya Priya.

Leo memikirkannya. "Halaman yang dipersonalisasi."

"Atau halaman spesifik bahasa. Atau versi mobile versus desktop. Atau halaman yang bervariasi berdasarkan cookie."

Secara default, CloudFront hanya menggunakan jalur URL sebagai cache key. Dua permintaan ke `/browse` mendapatkan respons cache yang sama, terlepas dari preferensi bahasa pengguna, tipe perangkat, atau cookie sesi.

Jika aplikasi Anda menyajikan konten berbeda berdasarkan query string, header, atau cookie — dan Anda ingin CloudFront meng-cache variasi tersebut secara terpisah — Anda perlu menyertakan atribut tersebut dalam **cache key**.

Untuk Nimbus:

- `/browse?city=miami` harus di-cache terpisah dari `/browse?city=boston` — daftar restoran yang berbeda. Sertakan query string dalam cache key.
- Pengguna mobile mungkin mendapatkan tata letak yang berbeda. Sertakan tipe perangkat yang dinormalisasi (diturunkan dari header `User-Agent`) dalam cache key.
- Header `Accept-Language` menentukan dalam bahasa apa halaman dirender. Sertakan dalam cache key.

Berhati-hatilah, namun. Setiap atribut cache key yang Anda tambahkan menciptakan lebih banyak variasi cache. Jika Anda menyertakan seluruh string `User-Agent` (yang bervariasi berdasarkan versi peramban, versi OS, dan level patch), Anda secara efektif merusak caching — setiap pengguna memiliki User-Agent yang sedikit berbeda, jadi setiap permintaan adalah cache miss.

Disiplinnya: normalisasi sebelum caching. Kurangi "iPhone 15 Pro Safari 17.4.1" menjadi "mobile." Kurangi semua bahasa yang diterima menjadi dua atau tiga yang benar-benar Anda dukung. Sertakan hanya apa yang benar-benar mengubah respons.

"Semakin spesifik cache key Anda," kata Leo, "semakin buruk hit rate Anda."

"Dan semakin generik," kata Priya, "semakin mungkin Anda menyajikan konten yang salah ke pengguna yang salah."

"Jadi desain cache key adalah kompromi yang sama seperti segala hal lain dalam caching."

"Ya," kata Priya. "Selalu kompromi yang sama."

---

## Ketika CloudFront Bukan Jawabannya: Global Accelerator

Aplikasi mobile Nimbus memiliki fitur yang diam-diam diawasi Tom selama dua bulan: status pesanan real-time. Ketika pelanggan melakukan pemesanan, aplikasi tetap terhubung via WebSocket dan layar manajemen pesanan dapur diperbarui secara real-time. Tanpa tombol refresh. Tanpa polling. Sebuah koneksi langsung yang mendorong pembaruan saat dapur menandai sebuah item siap.

"Ini menggunakan WebSocket," kata Tom, melihat metrik latensi suatu pagi. "Dari pengguna di São Paulo, pembentukan koneksi membutuhkan 340 milidetik. Ada yang salah."

"CloudFront tidak meng-cache koneksi WebSocket," kata Leo. "Ia mem-proxy mereka — meneruskan ke origin. Tidak ada manfaat caching."

"Benar. Jadi mengapa masih lambat?"

"Karena WebSocket tetap berjalan dari São Paulo ke server kita di Oregon melalui internet publik," kata Leo. "CloudFront membantu, karena ia menerminasi handshake TLS di edge dan kemudian menggunakan backbone AWS ke origin. Tetapi untuk koneksi WebSocket yang persisten, itu tetap koneksi jarak jauh."

"Ada layanan persis untuk masalah ini," kata Priya.

**AWS Global Accelerator** bukan CDN. Ia tidak meng-cache apa pun. Ia tidak menyajikan konten dari edge location. Yang ia lakukan adalah memberi Anda dua alamat IP Anycast statis yang diiklankan secara global dari semua edge location AWS secara bersamaan — lalu merutekan lalu lintas pengguna Anda melalui backbone privat AWS alih-alih internet publik.

Ketika pelanggan di São Paulo membuka aplikasi Nimbus, perangkat mereka terhubung ke edge location AWS terdekat (yang mungkin di São Paulo sendiri). Dari edge location itu, lalu lintas berjalan ke server Nimbus di Oregon melalui jaringan serat privat AWS yang dipantau dan dioptimalkan — bukan melalui internet publik di mana paket memantul melalui carrier dan routing hop yang tidak dapat diprediksi.

Internet publik tidak dirancang untuk latensi. Ia dirancang untuk ketahanan — paket dapat mengambil jalur yang tersedia mana pun. Backbone AWS dirancang berbeda: ia langsung, kemacetan rendah, dan di bawah kontrol operasional AWS.

Tom membandingkan selisihnya.

| Rute | Latensi (São Paulo ke Oregon) |
|---|---|
| Internet publik | 340ms |
| Via Global Accelerator | 180ms |

Pengurangan 47%. Bukan dari caching — dari jalur jaringan yang lebih baik.

"Lalu mengapa kita tidak menggunakan CloudFront saja untuk semuanya?" tanya Maya. "CloudFront sudah merutekan melalui backbone AWS untuk konten dinamis."

"CloudFront hanya HTTP dan HTTPS," kata Priya. "WebSocket bekerja dengan CloudFront, tetapi hanya melalui HTTP upgrade. Dan beberapa protokol kita — data sensor IoT, misalnya — adalah TCP atau UDP murni. CloudFront tidak menangani itu. Global Accelerator agnostik-protokol. TCP, UDP, WebSocket, apa pun. Ia memindahkan paket, bukan permintaan HTTP."

Ada perbedaan lain yang Priya catat dalam dokumentasi keamanannya.

"Global Accelerator memberi kita dua IP Anycast statis," katanya. "IP itu tidak pernah berubah. Itu berarti kita dapat menambahkannya ke kebijakan keamanan kita, menambahkannya ke whitelist mitra, menambahkannya ke aturan firewall. Alamat IP CloudFront berubah seiring waktu — mereka dikelola oleh AWS dan tidak tetap."

"Bagaimana dengan failover?" tanya Leo.

"Instan," kata Priya. "Jika aplikasi us-west-2 kita memiliki masalah, Global Accelerator dapat menggeser lalu lintas ke cadangan di us-east-1 dalam waktu di bawah 30 detik — tanpa mengubah alamat IP yang dihubungkan pengguna. Failover DNS melalui Route 53 membutuhkan 60-300 detik tergantung TTL. Global Accelerator lebih cepat."

**CloudFront vs. Global Accelerator — model mentalnya:**

CloudFront meningkatkan pengiriman dengan caching. Ia dibangun untuk HTTP/HTTPS dan manfaatnya paling besar ketika konten dapat di-cache dekat pengguna — file statis, gambar, JavaScript. Ketika konten tidak dapat di-cache, CloudFront tetap membantu melalui routing backbone, tetapi peningkatannya lebih kecil.

Global Accelerator meningkatkan pengiriman dengan routing. Ia tidak memindahkan konten. Ia tidak meng-cache apa pun. Manfaatnya berlaku untuk setiap paket — di-cache atau tidak, HTTP atau tidak, statis atau dinamis. Dua IP statisnya bekerja secara global. Failover hampir instan. Kasus penggunaan di mana CloudFront tidak cukup — WebSocket real-time, protokol berbasis UDP, lalu lintas non-HTTP, aplikasi global yang membutuhkan IP tetap — adalah tempat Global Accelerator menjadi alat yang tepat.

Tom memperbarui aplikasi mobile Nimbus untuk terhubung ke endpoint Global Accelerator untuk fitur status pesanan real-time. Pembentukan koneksi WebSocket di São Paulo turun dari 340ms menjadi 180ms. Pembaruan dapur tetap terasa instan — karena sekarang, untuk pengguna di luar Amerika Utara, mereka memang benar-benar instan.

## Kekuatan dan Batasan

**Mengapa CloudFront itu kuat**:

- Lebih dari 750 points of presence di 100+ kota — sebagian besar pengguna mendapatkan konten dari <20ms jauhnya
- Konten statis disajikan dalam satu digit milidetik setelah cache pertama
- Mengurangi beban origin secara signifikan (lalu lintas berulang tidak pernah menghantam server Anda)
- Terintegrasi dengan AWS Shield, WAF, dan Certificate Manager
- Tidak diperlukan perencanaan kapasitas — CloudFront menskalakan otomatis
- Distribusi multi-origin merutekan jalur berbeda ke backend berbeda dari satu domain
- CloudFront Functions menangani logika edge ringan pada latensi di bawah milidetik

**Di mana menjadi rumit**:

- Konten yang di-cache bisa basi — menginvalidasi cache memakan biaya ($0,005 per jalur setelah 1.000 jalur gratis pertama setiap bulan). Gunakan nama file berversi sebagai gantinya.
- Header Cache-Control harus disetel dengan benar di origin — kesalahan menyebabkan konten basi
- Konten dinamis mendapat manfaat dari optimasi routing tetapi bukan dari caching
- Men-debug perilaku cache (apa yang di-cache di mana, untuk berapa lama) membutuhkan pemahaman beberapa lapisan: header origin, pengaturan TTL CloudFront, aturan behavior
- Transfer data keluar melalui CloudFront memakan biaya, meskipun lebih sedikit daripada transfer data standar
- Desain cache key membutuhkan pemikiran cermat — terlalu spesifik merusak caching, terlalu generik menyajikan konten yang salah

## Ringkasan

CloudFront tidak mengubah fisikanya. Cahaya tetap berjalan dengan kecepatan yang sama. Tetapi ia mengubah di mana jawabannya tinggal — dan untuk sebagian besar pengguna, jawabannya sekarang beberapa milidetik jauhnya alih-alih beberapa ratus. Cache hit rate setelah deployment: 83%. Itu berarti 830.000 dari setiap juta permintaan tidak pernah mencapai server origin sama sekali. Pengguna di São Paulo beralih dari 290 milidetik menjadi 35 milidetik. Pengguna di Tokyo dari 260 menjadi 28.

- Sebuah **CDN** meng-cache salinan konten Anda di edge location dekat pengguna Anda — mengurangi latensi dan beban origin.
- **CloudFront** adalah CDN milik AWS, dengan 750+ points of presence secara global.
- Cache miss mengambil dari **origin** (S3, ALB, EC2). Cache hit menyajikan dari edge — milidetik, bukan ratusan milidetik.
- **Behavior** memungkinkan Anda menyetel aturan caching berbeda untuk pola URL berbeda. Satu distribusi dapat menyajikan `/images/*` dari S3 dan `/*` dari ALB.
- Konten dinamis tidak di-cache, tetapi CloudFront tetap meningkatkan performa melalui jaringan backbone privat AWS.
- **Hindari konten basi** dengan menggunakan nama file berversi (mis., `hero-v2.jpg`) alih-alih invalidasi — lebih murah dan lebih andal.
- **CloudFront Functions** menangani logika edge ringan (manipulasi header, penulisan ulang URL) pada kecepatan di bawah milidetik. **Lambda@Edge** menangani pemrosesan lebih berat yang membutuhkan panggilan jaringan.
- **Price class** memungkinkan Anda mengontrol edge location mana yang melayani lalu lintas Anda — dan karenanya biaya transfer data Anda.
- **Desain cache key** menentukan atribut permintaan mana yang menciptakan variasi cache terpisah. Kunci yang lebih spesifik = hit rate lebih rendah. Kurang spesifik = risiko menyajikan konten yang salah.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.4)*

- **CloudFront + S3**: Pola ujian klasik untuk menyajikan situs web statis secara global. Bucket S3 sebagai origin, CloudFront sebagai CDN, Origin Access Control untuk mencegah akses S3 langsung.
- **Edge location vs Region vs AZ**: Edge location lebih banyak jumlahnya dan hanya ada untuk tujuan caching/CDN. Mereka tidak sama dengan AZ (yang menjalankan komputasi Anda).
- **Invalidasi cache**: Membuat invalidasi `/images/*` untuk memaksa CloudFront mengambil konten segar. Memakan biaya — ujian mungkin menanyakan alternatif yang hemat biaya: URL berversi (`image-v2.jpg` alih-alih `image.jpg`), yang secara alami melewati cache.
- **Kontrol TTL**: `Cache-Control: max-age=3600` di origin menyetel TTL cache 1 jam. CloudFront menghormati header ini. TTL minimum, TTL maksimum, dan TTL default juga dapat disetel dalam behavior distribusi.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions berjalan di edge untuk manipulasi request/response ringan (di bawah milidetik). Lambda@Edge menjalankan kode Lambda Anda di regional edge location untuk pemrosesan lebih berat. Ujian membedakannya berdasarkan kompleksitas kasus penggunaan. CloudFront Functions tidak dapat melakukan panggilan jaringan; Lambda@Edge bisa.
- **Signed URL dan Signed Cookie**: Mengontrol siapa yang dapat mengakses konten melalui CloudFront. Signed URL memberi akses ke file tertentu; signed cookie memberi akses ke beberapa file. Ujian menggunakan ini untuk "konten pelanggan berbayar."
- **Price Class**: Ujian mungkin menanyakan price class mana yang dipilih untuk audiens global vs. audiens Amerika Utara/Eropa. Price Class All = performa terbaik, biaya tertinggi. Price Class 100 = hanya Amerika Utara dan Eropa, biaya terendah.
- **Cache key**: Cache key default adalah URL. Menambahkan query string, header, atau cookie ke cache key menciptakan variasi cache terpisah — tetapi meningkatkan tingkat cache miss. Ujian mungkin menyajikan skenario di mana konten bervariasi berdasarkan parameter kueri dan menanyakan cara mengonfigurasi caching.
- **Origin failover**: CloudFront mendukung origin group dengan origin primer dan sekunder. Jika origin primer mengembalikan error 5xx, CloudFront otomatis mencoba ulang dengan sekunder. Berbeda dari failover Route 53 — ini di dalam satu distribusi CloudFront.
- **Behavior multi-origin**: Satu distribusi dapat merutekan `/images/*` ke S3 dan `/*` ke ALB. Ujian mungkin menyajikan ini sebagai "cara menyajikan konten statis dan dinamis dari satu domain tanpa dua distribusi."
- **CloudFront vs. Global Accelerator:** CloudFront = CDN HTTP/HTTPS, meng-cache konten di edge location, mengurangi beban origin, terbaik untuk konten statis dan cacheable. Global Accelerator = protokol TCP/UDP apa pun, tidak meng-cache apa pun, merutekan lalu lintas melalui backbone privat AWS, menyediakan 2 IP Anycast statis, mendukung failover regional hampir instan. Pemicu ujian: "tingkatkan latensi untuk lalu lintas non-HTTP" atau "IP statis untuk aplikasi global" atau "performa WebSocket untuk pengguna global" atau "failover regional lebih cepat daripada DNS" → Global Accelerator. "Sajikan file statis secara global dengan latensi rendah" → CloudFront.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara cache hit dan cache miss CloudFront. Apa yang terjadi dalam setiap kasus?

*(Petunjuk: Pikirkan dari mana konten berasal, dan bagaimana waktu respons berbeda antara kedua kasus.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan perangkat lunak mendistribusikan file installer besar (~2GB masing-masing) dari sebuah bucket S3 ke pelanggan di seluruh dunia. Kecepatan unduh lambat untuk pelanggan di Asia. Tim ingin meningkatkan performa tanpa mereplikasi bucket S3 ke beberapa region. Mereka juga perlu memastikan bahwa hanya pelanggan yang membayar yang dapat mengunduh installer.

Solusi mana yang PALING memenuhi persyaratan ini?

A) Aktifkan S3 Transfer Acceleration pada bucket dan hasilkan pre-signed URL untuk pelanggan yang membayar  
B) Gunakan CloudFront dengan bucket S3 sebagai origin, aktifkan Origin Access Control, dan gunakan CloudFront Signed URL untuk pelanggan yang membayar  
C) Buat bucket S3 di setiap region AWS dan gunakan Route 53 geolocation routing untuk mengarahkan pelanggan ke bucket terdekat  
D) Gunakan Application Load Balancer di setiap region dengan instans EC2 yang menyajikan file installer

**Petunjuk 1**: Persyaratannya adalah meningkatkan performa global *tanpa* mereplikasi bucket. Opsi mana yang tidak memerlukan beberapa bucket?

**Petunjuk 2**: Layanan mana yang secara khusus mengontrol siapa yang dapat mengakses konten yang disajikan melalui CloudFront?

**Petunjuk 3**: S3 Transfer Acceleration dioptimalkan untuk unggahan jarak jauh *ke* S3. Untuk mengirimkan konten *dari* S3 ke pengguna akhir secara global, CloudFront adalah alat yang tepat.

**Jawaban**: B

**Penjelasan**: CloudFront meng-cache file installer di edge location secara global setelah unduhan pertama. Unduhan berikutnya dari region yang sama datang dari edge — jauh lebih cepat daripada menyeberangi Pasifik dari S3 di us-west-2. Origin Access Control memastikan bucket S3 hanya dapat diakses melalui CloudFront. Signed URL membatasi akses ke pelanggan yang membayar.

**Mengapa tidak A?** S3 Transfer Acceleration dioptimalkan untuk unggahan jarak jauh *ke dalam* S3 — bukan untuk mendistribusikan konten *dari* S3 ke audiens global. Untuk itu, CloudFront adalah alat yang benar. Pre-signed URL mengontrol akses tetapi tidak meningkatkan performa global.

**Mengapa tidak C?** Membuat bucket S3 per region memang berfungsi untuk performa, tetapi bertentangan dengan persyaratan untuk menghindari replikasi. Ia juga membutuhkan strategi sinkronisasi data di seluruh bucket.

**Mengapa tidak D?** Instans EC2 di balik load balancer di setiap region secara signifikan lebih mahal daripada CloudFront dan membutuhkan pengelolaan server di beberapa region.

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi — Tugas 3.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin menambahkan konten video — video tutorial memasak singkat dari mitra restoran. Video bisa 50-500MB. Mereka memperkirakan video yang sama akan ditonton oleh ribuan pengguna di kota yang sama dalam hitungan jam setelah publikasi.

Rancang arsitektur penyimpanan dan pengiriman. Apakah Anda akan menggunakan S3 dan CloudFront? Bagaimana Anda akan menangani permintaan pertama (cold start) untuk meminimalkan penundaan sebelum video di-cache? TTL cache apa yang akan Anda setel untuk video yang tidak akan berubah setelah publikasi?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih keputusan desain CDN.)*

## Adegan Pasca-Kredit

"Aku sudah men-deploy-nya — oh." Leo telah mengarahkan distribusi CloudFront ke origin yang salah — bucket S3 pengembangan alih-alih yang produksi. Selama sekitar empat menit, beberapa pengguna Pantai Barat telah melihat versi lama aplikasi. Ia telah memperbaiki pengaturan origin, menginvalidasi cache, dan diam-diam memperbarui log insiden.

Priya mengawasi metrik CloudFront setelah deployment.

Cache hit rate: 83%.

"Apa artinya itu?" tanya Tom.

"Artinya 83% pengguna kita mendapatkan konten dari edge location dekat mereka, bukan dari us-west-2."

"Dan 17% lainnya?"

"Permintaan pertama kali. Konten yang belum di-cache di edge location itu."

Tom menatap metriknya. "Jadi kita menyajikan hampir satu juta permintaan sehari dari node edge CloudFront. Dan hanya 170.000 dari itu yang benar-benar menghantam server kita."

"Ya."

"Jadi jika kita tidak punya CloudFront, server kita akan menangani satu juta permintaan."

"Pada 140-160 milidetik masing-masing, untuk pengguna global."

Tom bersandar. Ia memiliki tatapan yang Maya kenali — tatapan seseorang yang menghitung ulang biaya secara real-time.

"Ini sepadan," katanya.

Maya sudah di laptopnya. "Dua engineer baru bergabung dengan kita minggu depan. Soo-Jin dari tim platform di perusahaan terakhirnya, dan Rafael — ia spesialis keamanan. Aku ingin mereka di-onboarding tentang IAM sebelum hari pertama mereka."

"IAM tingkat lanjut?" tanya Leo.

"Role, policy, akses lintas-akun. Hal yang sesungguhnya."

Di bab berikutnya: izin yang halus yang memungkinkan satu bagian sistem berbicara dengan bagian lain — dengan aman.
