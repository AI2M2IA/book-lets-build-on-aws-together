# Babat 13: Fast Everywhere

Sebuah foto yang bepergian dari server di Virginia ke telepon di Seattle menempuh jarak sekitar 4.400 kilometer melalui serat optik. Pada dua pertiga kecepatan cahaya, itu membutuhkan waktu sekitar 25 milidetik — tidak dapat dihindari, tidak dapat dinegosiasikan, tertanam dalam hukum alam semesta.

Kemudian tambahkan perjalanan bolak-balik. Kemudian tambahkan waktu pemrosesan. Browser belum mulai merender dan 80 milidetik sudah hilang.

`eatnimbus.com` sudah aktif. Leo telah memeriksa metrik latensi dari pengguna di West Coast: 80-100 milidetik per permintaan. Itu mungkin terdengar kecil, tetapi itu terakumulasi.

Muat menu: 90ms. Muat daftar restoran: 80ms. Muat foto restoran: 200ms (gambar-gambar besar). Waktu total sebelum pengguna dapat melakukan pemesanan: lebih dari setengah detik pada koneksi yang baik.

"Fisika adalah masalahnya," kata Leo. "Server-nya ada di Virginia. Pengguna-pengguna berada di West Coast."

"Jadi pindahkan server ke West Coast," kata Tom.

"Itu mahal."

"Berapa banyak?"

"Banyak. Dan itu menciptakan masalah baru: menjaga database di East Coast dan database di West Coast tetap sinkron."

Priya mendongak dari laptopnya. "Atau kita tidak memindahkan server. Kita memindahkan *konten*."

**Analogi Gudang Pra-Isi**

Bayangkan Amazon sebagai pengecer, bukan perusahaan cloud. Mereka memiliki gudang besar di satu lokasi dengan semua produk. Jika mereka mengirimkan setiap pesanan dari satu gudang itu, pelanggan di kota-kota yang jauh akan menunggu berhari-hari.

Sebagai gantinya, Amazon memiliki pusat distribusi dekat pusat populasi utama. Ketika suatu produk populer, mereka mengisi gudang lokal dengan stok. Ketika seorang pelanggan di Seattle memesan buku, itu dikirim dari pusat distribusi lokal — bukan dari Virginia.

Ini adalah **Jaringan Pengiriman Konten (CDN)**: jaringan server yang didistribusikan secara geografis yang menyimpan salinan konten Anda dekat dengan pengguna Anda.

Ketika seorang pengguna di Seattle meminta halaman beranda Anda, CDN menyajikannya dari server di Seattle. Bukan Virginia. Permintaan tidak pernah menyeberangi negara.

**Kenali CloudFront**

Amazon CloudFront adalah CDN AWS. Ini beroperasi melalui jaringan lokasi tepi global — server caching yang diposisikan di kota-kota di seluruh dunia. Per tanggal penulisan ini, ada lebih dari 500 lokasi tepi di 90+ kota.

Saat Anda mengonfigurasi CloudFront, Anda menentukan **asal** — sumber konten Anda yang sebenarnya. Asal Anda mungkin berupa:

- Bucket S3 (file statis: gambar, CSS, JavaScript, PDF)
- Load Balancer Aplikasi (konten dinamis dari aplikasi Anda)
- EC2 instance
- Server HTTP di mana saja di internet

CloudFront berada di depan asal Anda. Permintaan masuk di lokasi tepi terdekat. Jika tepi memiliki konten yang di-cache, ia mengembalikannya secara instan. Jika tidak (cache miss), ia mengambilnya dari asal, menyimpannya, dan mengembalikannya.

**Cara Penyimpanan Cache CloudFront Bekerja**

Permintaan pertama untuk setiap potongan konten selalu merupakan cache miss — ia pergi ke asal. Setiap permintaan berikutnya mengenai cache di lokasi tepi.

Untuk Nimbus, foto menu adalah kandidat CloudFront yang sempurna. Foto restoran jarang berubah (mungkin ketika restoran memperbarui profil mereka). Dengan CloudFront:

1. Pengguna di Seattle meminta `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront memeriksa lokasi tepi di Seattle — belum di-cache (cache miss)
3. CloudFront mengambilnya dari S3 di us-east-1 (~80ms)
4. CloudFront menyimpan foto di lokasi tepi Seattle
5. Pengguna berikutnya di Seattle meminta foto yang sama
6. CloudFront menyajikannya dari cache tepi lokal (~5ms)

Hukuman 80ms yang sama untuk permintaan pertama. Tetapi permintaan seribu kali dari kota yang sama adalah 5 milidetik.

**Header Kontrol Cache** dan **pengaturan TTL** di CloudFront menentukan berapa lama konten tetap di-cache di tepi. File gambar dapat di-cache selama berjam-jam atau berhari-hari. Halaman HTML (yang berubah lebih sering) mungkin di-cache selama beberapa menit atau detik.

**Konten Dinamis: CloudFront untuk Lebih dari Penyimpanan Cache**

"Tapi bagaimana dengan respons API kami?" tanya Leo. "Mereka bersifat dinamis — mereka berubah per pengguna, per permintaan. Anda tidak dapat menyimpan halaman riwayat pemesanan."

Benar. Tetapi CloudFront masih membantu dengan konten dinamis.

Bahkan ketika konten tidak dapat di-cache, CloudFront merutekan permintaan dari lokasi tepi ke asal melalui jaringan backbone pribadi AWS — serat berkecepatan tinggi yang menghubungkan infrastruktur AWS secara global. Ini lebih cepat dan lebih andal daripada merutekan melalui internet publik, di mana lalu lintas dapat melompat melalui banyak operator.

Hasilnya: permintaan dinamis masih 20-40% lebih cepat melalui CloudFront daripada pergi langsung ke asal melalui internet publik. Bukan karena caching, tetapi karena jalur jaringan.

Selain itu, CloudFront menyediakan:

**Penyelesaian SSL/TLS**: CloudFront menangani HTTPS di tepi. Koneksi antara pengguna dan CloudFront dienkripsi. CloudFront dapat terhubung ke asal melalui HTTP secara internal (mengurangi beban asal) atau HTTPS (untuk enkripsi ujung ke ujung).

**Perlindungan DDoS**: CloudFront terintegrasi dengan AWS Shield Standard. Lalu lintas terdistribusi di ratusan lokasi tepi berarti serangan diserap di tepi daripada menghantam asal.

**Pembatasan Geografis**: Memblokir akses dari negara-negara tertentu. Jika Nimbus hanya berlisensi untuk beroperasi di pasar tertentu, CloudFront dapat menegakkannya di tepi tanpa permintaan pernah mencapai server Anda.

**Perilaku CloudFront: Aturan Penyimpanan Cache Tingkat Halus**

Sebuah distribusi CloudFront dapat memiliki banyak **perilaku** — aturan perutean berdasarkan pola URL.

Untuk Nimbus:

- `/images/*` → Penyimpanan di tepi selama 7 hari (foto tidak sering berubah)
- `/static/*` → Penyimpanan di tepi selama 30 hari (CSS dan JavaScript dengan nama file versi)
- `/api/*` → Jangan menyimpan; teruskan langsung ke load balancer
- `/*` → Penyimpanan selama 5 menit (halaman HTML)

Ini memungkinkan CloudFront menjadi cerdas: agresif menyimpan apa yang stabil, meneruskan apa yang dinamis.

**Kontrol Akses Sumber**: Mengamankan S3 dengan CloudFront

Jika bucket S3 Anda berisi konten pribadi yang hanya boleh disajikan melalui CloudFront (bukan secara langsung), Anda dapat menggunakan **Kontrol Akses Sumber (OAC)** untuk memastikan S3 menolak permintaan yang tidak berasal dari CloudFront.

Dengan cara ini:

- `d1234abcd.cloudfront.net/image.jpg` Disajikan (CloudFront memiliki izin)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Diblokir (akses S3 langsung ditolak)

Konten Anda hanya dapat diakses melalui distribusi Anda, dengan aturan cache dan pengaturan keamanan yang diterapkan.

## Kekuatan dan Batasan

**Mengapa CloudFront itu Kuat**:

- Lokasi tepi di lebih dari 90 kota — sebagian besar pengguna mendapatkan konten dalam jarak <20ms
- Konten statis disajikan dalam milidetik tunggal setelah cache pertama
- Mengurangi beban sumber secara signifikan (lalu lintas berulang tidak pernah mengenai server Anda)
- Terintegrasi dengan AWS Shield, WAF, dan Certificate Manager
- Tidak diperlukan perencanaan kapasitas — CloudFront menskalakan secara otomatis

**Di mana itu menjadi rumit**:

- Konten yang di-cache dapat menjadi usang — membatalkan cache menghabiskan uang ($0.005 per 1.000 jalur)
- Header Cache-Control harus diatur dengan benar di sumber — kesalahan menyebabkan konten usang
- Konten dinamis mendapat manfaat dari optimasi perutean tetapi tidak dari caching
- Debug perilaku cache (apa yang di-cache di mana, untuk berapa lama) membutuhkan pemahaman tentang beberapa lapisan: header sumber, pengaturan TTL CloudFront, aturan perilaku
- Transfer data keluar melalui CloudFront menghabiskan uang, meskipun lebih sedikit daripada transfer data standar

## Ringkasan

- CDN menyimpan salinan konten Anda di lokasi tepi dekat pengguna Anda — mengurangi latensi dan beban sumber.
- **CloudFront** adalah CDN AWS, dengan lebih dari 500 lokasi tepi secara global.
- Cache miss mengambil dari **sumber** (S3, ALB, EC2). Cache hit menyajikan dari tepi — milidetik, bukan ratusan milidetik.
- **Perilaku** memungkinkan Anda untuk mengatur aturan caching yang berbeda untuk pola URL yang berbeda.
- Konten dinamis tidak di-cache, tetapi CloudFront tetap meningkatkan kinerja melalui jaringan backbone pribadi AWS.
- **Kontrol Akses Sumber** membatasi akses S3 langsung — konten hanya disajikan melalui CloudFront.
- Terintegrasi dengan Shield (DDoS), WAF (firewall aplikasi), dan ACM (SSL sertifikat).

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.4)*

- **CloudFront + S3**: Pola ujian klasik untuk menyajikan situs web statis secara global. Bucket S3 sebagai sumber, CloudFront sebagai CDN, Kontrol Akses Sumber untuk mencegah akses S3 langsung.
- **Lokasi tepi vs Wilayah vs AZ**: Lokasi tepi lebih banyak jumlahnya dan hanya ada untuk tujuan caching/CDN. Mereka bukanlah AZ (yang menjalankan komputasi Anda).
- **Pinvalidasi cache**: Membuat invalidasi `/images/*` untuk memaksa CloudFront mengambil konten segar. Menghabiskan uang — ujian mungkin meminta alternatif yang paling hemat biaya: URL versi (`image-v2.jpg` daripada `image.jpg`), yang secara alami melewati cache.
- **Kontrol TTL**: `Cache-Control: max-age=3600` di sumber menetapkan TTL cache 1 jam. CloudFront menghormati header ini.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions berjalan di tepi untuk manipulasi permintaan/respons ringan (sub-milidetik). Lambda@Edge berjalan kode Lambda Anda di lokasi tepi untuk pemrosesan yang lebih berat. Ujian membedakan mereka berdasarkan kompleksitas kasus penggunaan.
- **URL Beranda yang Ditandatangani dan Cookie yang Ditandatangani**: Mengontrol siapa yang dapat mengakses konten melalui CloudFront. URL beranda yang ditandatangani memberikan akses ke file tertentu; cookie yang ditandatangani memberikan akses ke beberapa file. Ujian menggunakan ini untuk "konten pelanggan berbayar."

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara cache hit CloudFront dan cache miss. Apa yang terjadi dalam setiap kasus?

*(Petunjuk: Pikirkan tentang dari mana konten berasal, dan bagaimana waktu respons berbeda antara kedua kasus tersebut.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan perangkat lunak mendistribusikan file installer besar (~2GB) masing-masing dari bucket S3 ke pelanggan di seluruh dunia. Kecepatan unduh lambat untuk pelanggan di Asia. Tim ingin meningkatkan kinerja tanpa mereplikasi bucket S3 ke beberapa wilayah. Mereka juga perlu memastikan bahwa hanya pelanggan yang membayar yang dapat mengunduh installer.

Solusi MANA yang TERBAIK memenuhi persyaratan ini?

A) Aktifkan S3 Transfer Acceleration pada bucket dan buat URL pra-ditandatangani untuk pelanggan berbayar.
B) Gunakan CloudFront dengan bucket S3 sebagai origin, aktifkan Kontrol Akses Origin, dan gunakan URL CloudFront yang ditandatangani untuk pelanggan berbayar.
C) Buat bucket S3 di setiap wilayah AWS dan gunakan Route 53 routing berbasis lokasi untuk mengarahkan pelanggan ke bucket terdekat.
D) Gunakan Application Load Balancer di setiap wilayah dengan instance EC2 yang menyajikan file installer.

**Petunjuk 1**: Persyaratan adalah untuk meningkatkan kinerja global *tanpa* mereplikasi bucket. Opsi mana yang tidak memerlukan beberapa bucket?

**Petunjuk 2**: Layanan mana yang secara khusus mengontrol siapa yang dapat mengakses konten yang disajikan melalui CloudFront?

**Petunjuk 3**: S3 Transfer Acceleration dioptimalkan untuk unggahan jarak jauh *ke* S3. Untuk menyampaikan konten *dari* S3 ke pengguna akhir secara global, CloudFront adalah alat yang tepat.

**Jawaban**: B

**Penjelasan**: CloudFront menyimpan cache file installer di lokasi edge secara global setelah unduhan pertama. Unduhan berikutnya dari wilayah yang sama berasal dari edge — jauh lebih cepat daripada melintasi Pasifik dari us-east-1. Kontrol Akses Origin memastikan bucket S3 hanya dapat diakses melalui CloudFront. URL yang ditandatangani membatasi akses untuk pelanggan berbayar.

**Mengapa tidak A?** S3 Transfer Acceleration dioptimalkan untuk unggahan jarak jauh *ke* S3 — bukan untuk mendistribusikan konten *dari* S3 ke audiens global. Untuk itu, CloudFront adalah alat yang tepat. URL pra-ditandatangani mengontrol akses tetapi tidak meningkatkan kinerja global.

**Mengapa tidak C?** Membuat bucket S3 per wilayah memang berfungsi untuk kinerja, tetapi bertentangan dengan persyaratan untuk menghindari replikasi. Ini juga memerlukan strategi sinkronisasi data di antara bucket.

**Mengapa tidak D?** Instance EC2 di balik load balancer di setiap wilayah jauh lebih mahal daripada CloudFront dan memerlukan pengelolaan server di beberapa wilayah.

*SAA-C03 Domain: Desain Arsitektur Berkinerja — Tugas 3.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin menambahkan konten video — tutorial memasak pendek dari mitra restoran. Video dapat berukuran 50-500MB. Mereka memperkirakan video yang sama akan ditonton oleh ribuan pengguna di kota yang sama dalam beberapa jam setelah dipublikasikan.

Rancang arsitektur penyimpanan dan pengiriman. Apakah Anda akan menggunakan S3 dan CloudFront? Bagaimana cara menangani permintaan pertama (cold start) untuk meminimalkan penundaan sebelum video di-cache? TTL cache apa yang akan Anda atur untuk video yang tidak akan berubah setelah dipublikasikan?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk berlatih keputusan desain CDN.)*

## Adegan Setelah Kredit

Priya mengamati metrik CloudFront setelah penerapan.

Tingkat hit cache: 83%.

"Apa artinya itu?" tanya Tom.

"Ini berarti 83% dari pengguna kami mendapatkan konten dari lokasi edge yang dekat dengan mereka, bukan dari us-east-1."

"Dan 17% lainnya?"

"Permintaan pertama. Konten yang belum di-cache di lokasi edge tersebut."

Tom menatap metrik tersebut. "Jadi kami menyajikan hampir satu juta permintaan per hari dari node edge CloudFront. Dan hanya 170.000 dari permintaan tersebut yang mengenai server kami."

"Ya."

"Jadi jika kami tidak memiliki CloudFront, server kami akan menangani satu juta permintaan."

"Dengan latensi 140-160 milidetik untuk pengguna global."

Tom mundur. Dia memiliki tatapan yang dikenali Maya — tatapan seseorang yang menghitung ulang biaya secara *real-time*.

"Ini sepadan," katanya.

Maya sudah di laptopnya. "Dua insinyur baru bergabung dengan kami minggu depan. Soo-Jin dari tim platform di perusahaan sebelumnya, dan Rafael — dia berspesialisasi dalam keamanan. Saya ingin mereka di-onboarding di IAM sebelum hari pertama mereka."

"IAM lanjutan?" tanya Leo.

"Peran, kebijakan, akses lintas akun. Hal-hal yang sebenarnya."

Di bab berikutnya: izin yang terperinci yang memungkinkan satu bagian sistem untuk berbicara dengan yang lain — dengan aman.
