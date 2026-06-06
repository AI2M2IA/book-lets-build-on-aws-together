# Bab 10: Ketika Database Terlalu Lambat

Metrik pemuatan halaman terbuka di layar. Leo telah melihatnya selama dua puluh menit tanpa mengatakan apa-apa.

Empat puluh tujuh permintaan DynamoDB per pemuatan halaman. Seratus delapan puluh delapan milidetik hanya untuk mengambil data — sebelum peramban merender satu pun piksel.

Ia telah melakukan perhitungan. Sepuluh ribu pengguna bersamaan pada Jumat malam, masing-masing memuat halaman penelusuran sekitar sekali per menit: empat ratus tujuh puluh ribu pembacaan DynamoDB per menit. Biayanya nyata. Tetapi latensi adalah masalah yang sebenarnya. Seorang pengguna yang membuka halaman penelusuran Nimbus menunggu hampir dua ratus milidetik sebelum apa pun muncul — dan itu pada koneksi cepat.

---

*Minggu sebelumnya, perancangan ulang skema DynamoDB telah berhasil. Tabel menu sekarang fleksibel — restoran mana pun bisa menambahkan modifier apa pun, struktur combo apa pun, variasi musiman apa pun. Performa pada pencarian individual sangat baik. Tetapi pencarian individual yang sangat baik, dikalikan empat puluh tujuh per halaman, tetap menghasilkan halaman yang lambat. Masalah DynamoDB telah terpecahkan. Masalah baru telah menggantikannya.*

---

"Database merespons dalam empat milidetik per permintaan," kata Leo. "Itu sebenarnya cepat. DynamoDB sedang melakukan pekerjaannya."

"Lalu mengapa halaman itu lambat?" tanya Maya.

"Karena kita memanggilnya empat puluh tujuh kali per pemuatan halaman," kata Priya. "Masalahnya bukan database. Masalahnya adalah kita berbicara dengannya terlalu banyak."

Tom condong ke depan. Ia memiliki tatapan yang muncul ketika sebuah masalah akan menjadi percakapan biaya. "Jadi solusinya adalah berbicara dengannya lebih sedikit?"

"Bicaralah dengannya lebih sedikit. Ingat lebih banyak."

---

**Upaya Pertama yang Salah**

Insting pertama Leo adalah meng-cache data per-pengguna. Setiap pengguna memiliki sesi, dan sesi memuat profil mereka: alamat tersimpan, metode pembayaran, ringkasan riwayat pesanan. Mungkin meng-cache itu akan mempercepatnya.

Ia mengimplementasikannya. Format kunci Redis: `user:{userId}:profile`. TTL: sepuluh menit.

Ia menjalankan uji beban. Pemuatan halaman turun enam milidetik.

"Itu tidak banyak," Tom mengamati.

"Tidak," kata Leo.

"Mengapa tidak?"

Leo menatap grafik itu sejenak. "Karena profil pengguna hanya satu permintaan. Masih ada empat puluh enam panggilan DynamoDB per halaman. Dan itu adalah panggilan menu — satu per restoran di halaman penelusuran. Aku meng-cache hal yang salah."

Ini adalah kesalahan umum dalam caching: mengoptimalkan hal yang bukan hambatan. Profil pengguna dimuat dalam dua milidetik. Meng-cache sesuatu yang secepat itu hampir tidak menghemat apa pun. Data menu — diambil empat puluh tujuh kali, masing-masing membutuhkan empat milidetik — adalah masalah yang sebenarnya.

"Kamu perlu meng-cache per-menu, bukan per-pengguna," kata Priya. "Menu untuk Restoran 047 sama untuk setiap pengguna yang menelusurinya. Itu data yang layak di-cache — identik di ribuan permintaan."

Cache per-pengguna berharga ketika pengguna memiliki state terpersonalisasi yang mahal. Cache per-entitas (menu, katalog produk, konfigurasi) berharga ketika data yang sama dilayani ke ribuan pengguna. Ketahui masalah mana yang Anda hadapi sebelum menulis kode.

Leo merancang ulang kunci cache: `menu:{restaurantId}`. Satu entri cache per restoran, dibagikan oleh setiap pengguna yang menelusuri restoran itu.

Ia menjalankan uji beban lagi. Pemuatan halaman turun dari 188 milidetik menjadi 12 milidetik. Itulah peningkatan yang mereka cari.

---

**Analogi Restoran**

Bayangkan dapur sebuah restoran. Setiap kali seorang pelayan perlu mengetahui menu spesial hari itu, mereka berjalan ke belakang, bertanya kepada koki, dan kembali ke meja.

Itu berfungsi dengan baik jika Anda memiliki dua pelayan dan tiga meja.

Sekarang bayangkan dua ratus pelayan dan seribu meja. Setiap satu dari mereka berjalan ke belakang untuk pertanyaan yang sama. Dapur menjadi hambatan. Koki menjawab pertanyaan yang sama empat ratus kali per jam.

Solusi yang jelas: tulis menu spesial di papan di depan restoran. Setiap pelayan membaca dari papan. Dapur mendapat istirahat. Papan diperbarui ketika menu spesial berubah.

Papan itu adalah cache.

Cache adalah penyimpanan lokal yang cepat untuk data yang baru saja diambil. Alih-alih mengambil hal yang sama berulang kali dari sumber yang lambat, Anda mengambilnya sekali dan menyimpannya dekat.

Ada analogi lain yang dianggap berguna oleh para insinyur: rak cadangan perpustakaan. Ketika sebuah buku populer dikembalikan, pustakawan tahu buku itu akan diminta lagi segera, jadi mereka meletakkannya di rak cadangan dekat meja depan alih-alih menyimpannya di rak utama. Pengunjung berikutnya tidak perlu berjalan menyusuri seluruh perpustakaan — mereka menemukannya tepat di meja. Rak cadangan memiliki ruang terbatas. Jika penuh, buku-buku lama dipindahkan kembali ke rak utama untuk memberi ruang bagi yang lebih baru. Cache bekerja secara identik: data yang sering diakses tetap di depan, data yang jarang diakses dikeluarkan untuk memberi ruang.

**Mengapa Tidak Hanya Menggunakan Memori?**

"Bisakah kita hanya menyimpan menu di memori aplikasi?" tanya Leo.

Pertanyaan yang valid.

Anda bisa. Untuk aplikasi satu server, caching dalam memori berfungsi dengan baik. Tetapi Nimbus berjalan di balik load balancer, di beberapa instans EC2. Jika satu instans meng-cache menu di memorinya, instans lain tidak memiliki data itu. Mereka masing-masing mempertahankan cache terpisah. Ketika menu diperbarui, Anda harus membatalkan semuanya.

Ini adalah *masalah koherensi cache* — menjaga beberapa cache tetap konsisten.

ElastiCache menyelesaikan ini dengan menyediakan cache *terpusat* yang dibagikan oleh semua instans Anda. Alih-alih setiap server memiliki memorinya sendiri, setiap server membaca dari dan menulis ke cache yang sama. Satu pembaruan menyebar ke semua.

**Perkenalkan ElastiCache**

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya. "Mengapa layanan yang sama sekali baru? Mengapa tidak menambahkan kapasitas database saja?"

Pertanyaan bagus. Jawabannya adalah bahwa menambahkan lebih banyak kapasitas database — instans yang lebih besar, lebih banyak replika baca — tidak memperbaiki masalah mendasar. Setiap satu dari empat puluh tujuh permintaan pemuatan halaman itu tetap menghabiskan waktu dan uang, bahkan pada database yang lebih cepat. Cache tidak membuat database lebih cepat; ia berarti database ditanyai pertanyaan yang sama jauh lebih jarang. Untuk data yang dibaca berulang kali dan jarang berubah — seperti menu sebuah restoran — cache berarti database mungkin menjawab pertanyaan itu sekali setiap lima menit alih-alih empat puluh tujuh kali per pemuatan halaman.

Amazon ElastiCache adalah layanan caching terkelola. Ia menjalankan mesin caching populer — Redis dan Memcached — tanpa Anda harus mengelola servernya.

**Redis** adalah yang lebih kuat dari keduanya. Ia mendukung struktur data kompleks (string, list, set, hash, sorted set), persistensi (data bertahan selama restart), replikasi, dan pesan pub/sub. Redis dapat melakukan lebih dari caching — ia dapat berfungsi sebagai penyimpanan data ringan.

**Memcached** lebih sederhana. Caching key-value murni, skalabel secara horizontal, tanpa persistensi. Lebih cepat untuk kasus penggunaan sederhana tetapi fiturnya lebih sedikit.

Untuk Nimbus: Redis. Mereka perlu meng-cache data menu (terstruktur), token sesi (key-value), dan kemudian mereka akan menginginkan sorted set untuk peringkat "restoran yang sedang tren".

**Cara Kerja Caching dalam Praktiknya**

Pola caching dasar disebut **cache-aside** (juga disebut lazy loading):

1. Aplikasi membutuhkan data
2. Periksa cache terlebih dahulu
3. Jika ditemukan (*cache hit*): kembalikan data segera
4. Jika tidak ditemukan (*cache miss*): pergi ke database, dapatkan data, simpan di cache, kembalikan

Dalam pseudocode:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

Permintaan pertama selalu menghantam database. Setiap permintaan berikutnya menghantam cache. Dengan cache, empat puluh tujuh pembacaan DynamoDB Nimbus per pemuatan halaman menjadi satu atau dua pencarian cache. Cepat, murah, dan skalabel.

**TTL: Berapa Lama Anda Mengingat?**

Setiap entri cache memiliki **Time-To-Live (TTL)**: durasi setelah mana entri kedaluwarsa dan permintaan berikutnya kembali ke database untuk data segar.

Inilah ketegangan inti dari caching: kesegaran vs. performa.

- **TTL pendek (detik)**: Data sangat segar, tetapi banyak cache miss. Cache hampir tidak membantu.
- **TTL panjang (jam atau hari)**: Sangat cepat, tetapi data bisa menjadi basi. Pelanggan melihat menu kemarin.

Untuk data menu, lima menit masuk akal. Menu tidak berubah setiap detik. Jika sebuah restoran memperbarui menu mereka, pelanggan mungkin melihat versi lama hingga lima menit — dapat diterima.

Untuk token sesi (apakah pengguna ini masuk?), TTL yang lebih pendek masuk akal, atau Anda memperbarui cache segera ketika sesi berubah.

Untuk data keuangan (total pesanan, catatan pembayaran), jangan meng-cache-nya — atau jika Anda melakukannya, batalkan segera saat penulisan.

Anda mungkin bertanya-tanya: mengapa tidak menambahkan kapasitas database saja alih-alih memperkenalkan seluruh lapisan caching baru? Lebih banyak replika, instans yang lebih besar — mengapa tidak itu? Jawabannya adalah bahwa kapasitas database tambahan melipatgandakan kemampuan Anda menangani permintaan bersamaan, tetapi tidak mengurangi jumlah permintaan. Jika sepuluh ribu pengguna masing-masing memicu empat puluh tujuh pembacaan per pemuatan halaman, menambahkan replika baca kedua hanya berarti setiap replika menangani dua puluh tiga ribu permintaan alih-alih empat puluh tujuh ribu — total pekerjaan tidak menyusut. Cache menghilangkan pekerjaan redundan sepenuhnya: sepuluh ribu pengguna itu berbagi hasil cache yang sama.

"Hanya ada dua masalah sulit dalam ilmu komputer," Leo mengutip, dengan penyampaian terlatih seseorang yang pernah mengatakannya. "Invalidasi cache dan menamai sesuatu."

"Mengapa invalidasi cache itu sulit?" tanya Maya.

"Karena kapan data *sebenarnya* berubah? Apakah menu berubah karena seorang mitra restoran memperbaruinya? Atau karena cron job berjalan? Atau karena admin mengeditnya secara manual? Setiap tempat yang dapat mengubah data perlu tahu untuk memberi tahu cache."

Inilah mengapa insinyur senior memulai percakapan caching dengan "apa saja jalur penulisannya?" alih-alih "ayo tambahkan Redis."

---

**Kisah Invalidasi Cache**

Mereka mengetahui betapa sulitnya invalidasi cache pertama kali seorang mitra restoran mengeluh.

Restoran 112 — sebuah tempat makan Kolombia di Eastside — telah memperbarui harga mereka pada Kamis sore. Mereka menaikkan harga arepa dari $8 menjadi $9. Mereka menelepon dukungan Nimbus dua puluh menit kemudian.

"Menu kami masih menampilkan harga lama," kata pemiliknya. "Pelanggan melakukan pemesanan dengan harga $8. Kami harus menghormati harga itu sekarang."

Tom menghitung kerugiannya sementara Priya menelusuri bug. Setiap pesanan yang ditempatkan dalam dua puluh menit itu telah dikenakan $8. Restoran menginginkan $9. Nimbus harus menanggung selisihnya.

TTL lima menit seharusnya sudah kedaluwarsa sejak lama. Dua puluh menit telah berlalu. Priya menarik kodenya.

Kunci cache adalah `menu:restaurant-112`. Ia telah disetel dengan TTL 300 detik. Ia memeriksa kapan terakhir kali ditulis.

"Itu disetel pada pukul 2:03 siang," katanya. "Dua puluh dua menit yang lalu."

"Tetapi TTL-nya lima menit," kata Leo.

"TTL-nya lima menit sejak pertama kali di-cache. Tetapi setiap permintaan yang menghantam cache menyegarkan TTL-nya. Entri cache disentuh setiap beberapa detik oleh permintaan yang masuk, dan TTL-nya direset."

"Jadi ia tidak pernah kedaluwarsa."

"Tidak dalam implementasi ini. Kita menyetel TTL pada setiap pembacaan cache. Sliding window. Entri tetap hidup selama ada yang menghantamnya."

Perbaikannya: gunakan TTL tetap yang hanya disetel saat penulisan, tidak pernah diperpanjang saat pembacaan. Entri kedaluwarsa tepat lima menit setelah disimpan, terlepas dari berapa kali ia dibaca. Ketika restoran memperbarui menu mereka, entri lama kedaluwarsa dalam lima menit dan permintaan berikutnya mengambil data segar.

"Dan untuk kasus di mana restoran memperbarui harga dan kita perlu itu tercermin segera?" tanya Tom.

"Invalidasi aktif," kata Priya. "Ketika portal mitra restoran mengirimkan pembaruan, API memanggil `cache.delete('menu:restaurant-112')` sebelum mengembalikan. Permintaan berikutnya mengambil data segar segera."

"Tetapi itu mengharuskan portal mengetahui tentang cache."

"Setiap jalur penulisan ke database perlu mengetahui tentang cache. Itulah yang dikatakan Leo sebelumnya. Sekarang kita mengalaminya."

"Aku sudah men-deploy-nya — oh." Leo telah mengimplementasikan invalidasi di portal tetapi lupa antarmuka edit admin. Dua minggu kemudian, seorang admin telah memperbarui sebuah menu melalui dasbor internal, dan harga lama bertahan di cache selama lima menit. Versi yang lebih kecil dari insiden yang sama.

Mereka menambahkan sebuah handler DynamoDB Streams — dari bab sebelumnya — yang secara otomatis membatalkan cache setiap kali sebuah item menu berubah, terlepas dari sistem mana yang memicu penulisan. Satu handler, semua jalur penulisan tercakup.

---

**Cache Eviction: Ketika Papan Penuh**

Papan menu spesial memiliki ruang terbatas. Ketika penuh, Anda harus menghapus sesuatu untuk memberi ruang.

Redis (dan cache pada umumnya) memiliki *kebijakan eviction* yang menentukan apa yang dihapus ketika memori penuh:

- **LRU (Least Recently Used)**: Hapus item yang paling lama tidak diakses.
- **LFU (Least Frequently Used)**: Hapus item yang paling jarang diakses.
- **allkeys-random**: Eviction acak. Sederhana, tidak optimal.
- **noeviction**: Kembalikan kesalahan ketika memori penuh (aplikasi harus menangani ini).

Untuk sebagian besar aplikasi web: LRU. Hal-hal yang belum Anda lihat baru-baru ini mungkin kurang dibutuhkan.

---

**Masalah Cache Stampede**

"Apakah kita sudah memikirkan apa yang terjadi jika seluruh cache kosong sekaligus?" tanya Priya.

"Kapan itu akan terjadi?" kata Leo.

"Ketika Anda men-deploy klaster ElastiCache baru. Ketika TTL pada sejumlah besar entri kedaluwarsa secara bersamaan. Ketika Anda mem-flush cache untuk memaksa penyegaran setelah perbaikan bug."

Leo memikirkannya. "Jika cache kosong, setiap permintaan pergi ke database. Semua sekaligus. Selama beberapa detik, database menangani beban penuh dari setiap pengguna bersamaan."

"Tanpa cache di depannya."

"Itu akan menyakitkan." Leo melihat pengaturan kapasitas database. "Kita pasti akan dibatasi."

Ini disebut **cache stampede** (juga disebut thundering herd). Ini terjadi ketika banyak entri cache kedaluwarsa pada saat yang sama — sering kali karena semuanya dibuat pada saat yang sama selama deploy atau cold start — dan gelombang cache miss yang tiba-tiba semuanya menghantam database secara bersamaan.

Strategi mitigasi:

**Jitter pada TTL**: Alih-alih menyetel setiap entri menu tepat 300 detik, tambahkan variasi acak: 270 hingga 330 detik. Entri kedaluwarsa pada waktu yang sedikit berbeda, menyebarkan gelombang cache miss selama satu menit alih-alih menghantam secara bersamaan.

**Kedaluwarsa dini probabilistik**: Sebelum sebuah entri kedaluwarsa, persentase kecil permintaan secara proaktif menyegarkannya. Ini menjaga entri tetap segar sebelum menjadi basi, mencegah kedaluwarsa pernah menjadi sebuah miss.

**Request coalescing (mutex/lock)**: Ketika cache miss terjadi, dapatkan sebuah lock sebelum menghantam database. Permintaan bersamaan lain untuk kunci yang sama menunggu permintaan pertama selesai dan mengisi ulang cache, lalu membaca dari cache. Hanya satu permintaan database yang dibuat per cache miss, bahkan di bawah konkurensi tinggi.

Untuk Nimbus, mereka mengimplementasikan jitter TTL. Sederhana, efektif, tanpa kompleksitas tambahan.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"Dua baris kode," kata Leo. "Untuk mencegah potensi outage database selama deploy."

"Sebagian besar peningkatan keandalan seperti itu," kata Priya. "Murah untuk diimplementasikan, mahal untuk mengetahui bahwa Anda membutuhkannya."

---

**Struktur Data Redis: Lebih dari Key-Value**

Ketika Nimbus menambahkan fitur "restoran yang sedang tren", Leo awalnya menyimpan peringkatnya sebagai list JSON biasa: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Itu berfungsi, tetapi memperbaruinya merepotkan. Untuk menambahkan restoran baru atau memperbarui skor, ia harus membaca seluruh list, memodifikasinya dalam kode aplikasi, dan menulis ulang semuanya. Di bawah penulisan bersamaan dari pipeline analitik, race condition menyebabkan skor tertimpa.

Priya mengarahkannya ke sorted set Redis.

Sebuah **sorted set** di Redis menyimpan anggota dengan skor numerik terkait. Anggota secara otomatis diurutkan berdasarkan skor. Operasinya atomik — tidak ada race condition dari pembaruan bersamaan.

```
# Tambah/perbarui skor sebuah restoran
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Dapatkan 10 restoran teratas berdasarkan skor (tertinggi dulu)
ZREVRANGE trending:global 0 9 WITHSCORES

# Tambahkan skor sebuah restoran secara atomik
ZINCRBY trending:global 50 "NIMBUS-047"
```

Lambda analitik memanggil `ZINCRBY` setiap kali sebuah pesanan ditempatkan, menambah skor restoran. Halaman beranda memanggil `ZREVRANGE` untuk mendapatkan sepuluh teratas. Tanpa lock, tanpa race condition, tanpa siklus read-modify-write.

Redis mendukung beberapa struktur data lain di luar key-value sederhana:

**List**: Urutan terurut. Push ke depan atau belakang. Gunakan untuk antrean, feed aktivitas terbaru, log stream.

**Set**: Koleksi tak terurut tanpa duplikat. Operasi union, intersection, difference. Gunakan untuk "pengguna mana yang telah melihat notifikasi ini?" atau "restoran mana yang ada di kategori ini?"

**Hash**: Bidang bernama dalam sebuah kunci. Gunakan untuk objek terstruktur di mana Anda ingin memperbarui bidang individual tanpa menulis ulang seluruh objek.

**HyperLogLog**: Estimasi kardinalitas probabilistik. Hitung pengunjung unik ke sebuah halaman tanpa menyimpan setiap ID pengunjung. Ringkas dan cepat.

**Pub/Sub**: Publikasikan pesan ke channel; subscriber menerimanya secara real-time. Gunakan untuk notifikasi real-time ringan antar layanan.

"Redis bukan hanya cache," kata Leo. "Ini adalah server struktur data."

"Itu deskripsi resminya," kata Priya.

"Kupikir ini hanya kamus mewah."

"Awalnya memang begitu."

---

**Write-Through: Pola Caching yang Lain**

Cache-aside (lazy loading) adalah pola yang paling umum. Tetapi ada pola kedua yang layak diketahui: **write-through**.

Dalam caching write-through, setiap kali aplikasi Anda menulis ke database, ia juga menulis ke cache segera.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

Keuntungannya: cache selalu terbarui. Tidak ada data basi antara penulisan dan kedaluwarsa TTL.

Kerugiannya: setiap penulisan masuk ke dua tempat. Dan Anda mengisi cache dengan data yang mungkin tidak pernah dibaca. Jika sepuluh restoran memperbarui menu mereka tetapi hanya dua dari mereka yang mendapat lalu lintas signifikan dalam lima menit berikutnya, Anda telah melakukan pekerjaan write-through untuk delapan cache yang tidak akan digunakan sebelum kedaluwarsa.

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya. "Jika kita menulis ke cache pada setiap pembaruan, kita melakukan lebih banyak pekerjaan per penulisan daripada sebelumnya. Bagaimana itu lebih baik?"

"Itu tidak selalu lebih baik," kata Priya. "Write-through masuk akal ketika Anda tidak dapat mentoleransi jendela data basi apa pun setelah penulisan. Cache-aside menerima hingga satu TTL kebasian sebagai imbalan tidak melakukan pekerjaan ekstra pada setiap penulisan."

Untuk Nimbus: cache-aside adalah pilihan yang tepat. Menu dibaca jauh lebih sering daripada ditulis. Jendela basi lima menit dapat diterima. Untuk sistem perdagangan keuangan di mana setiap pembaruan harga perlu tercermin segera, write-through akan lebih sesuai.

Keputusannya bermuara pada dua pertanyaan: berapa rasio penulisan-ke-pembacaan Anda, dan seberapa toleran Anda terhadap pembacaan basi setelah penulisan?


---

**ElastiCache for Redis: Apa yang Dikelola untuk Anda**

Seperti RDS, ElastiCache mengambil alat open-source dan menangani pekerjaan operasionalnya:

- **Pencadangan otomatis**: Snapshot Redis sesuai jadwal
- **Replikasi Multi-AZ**: Node primer + replika baca di AZ yang berbeda
- **Failover otomatis**: Jika node Redis primer gagal, sebuah replika dipromosikan secara otomatis
- **Cluster mode**: Sharding horizontal di beberapa node untuk cache yang sangat besar
- **Enkripsi**: Enkripsi in-transit dan at-rest untuk kepatuhan
- **Integrasi VPC**: Cache berjalan di jaringan privat Anda, tidak dapat diakses publik

"Berapa biayanya per bulan?" tanya Tom.

"Lebih murah daripada pembacaan DynamoDB yang kita gantikan," kata Leo. "Sekitar dua ratus dolar sebulan."

Leo membuka halaman harga. Ia sudah melakukan perhitungan, tetapi ia memandu Tom melewatinya.

Sebuah `cache.t3.micro` — node terkecil — sekitar $12 per bulan. Ia memiliki memori 0,5 GB. Cukup untuk aplikasi kecil dengan beberapa ratus kunci cache.

Sebuah `cache.r6g.large` — tier yang sesuai untuk lalu lintas Nimbus — memiliki memori 13 GB dan berjalan sekitar $140 per bulan. Sebagai perbandingan, Nimbus telah menghabiskan sekitar $400 per bulan untuk pembacaan DynamoDB sebelum caching. Setelah caching, pembacaan tersebut turun sekitar 89 persen. Perhitungannya menghasilkan sekitar $356 per bulan yang dihemat pada pembacaan DynamoDB, dikurangi $140 yang dihabiskan untuk ElastiCache — penghematan bersih sekitar $216 per bulan.

Ekspresi Tom bergeser dari skeptis menjadi puas. "Hitung angkanya dengan benar sebelum kita scale up, tetapi itu masuk akal." Ia mencatatnya.

"Dan bagaimana jika seseorang mencoba menerobos masuk?" kata Priya. "Cache mungkin memiliki token sesi. Data pengguna. Kita perlu token auth pada instans Redis dan tanpa akses publik."

"Itu akan berada di subnet privat," kata Leo.

"Bagus. Tetapi 'akan baik-baik saja' bukanlah postur keamanan," katanya. "Token auth. Enkripsi in-transit. Hanya VPC."

Leo mengangguk. Ia benar.

---

**Memantau Cache**

"Apakah kita sudah memikirkan apa yang terjadi ketika cache tidak bekerja dengan benar?" tanya Priya, seminggu setelah deployment Redis. "Bukan hanya gagal total — bekerja, tetapi buruk. Tingkat miss tinggi. Tingkat eviction tinggi. Latensi merangkak naik."

"Aku akan menyadarinya ketika waktu pemuatan halaman meningkat," kata Leo.

"Pada titik mana database sudah kesulitan," katanya.

ElastiCache mengekspos metrik melalui CloudWatch. Yang paling penting:

**CacheHitRate**: Persentase pembacaan cache yang mengembalikan hasil. Idealnya di atas 80% untuk cache yang matang. Tingkat hit yang menurun menandakan bahwa data yang paling banyak diakses tidak ada di cache — entah TTL terlalu pendek, cache terlalu kecil, atau pola akses Anda telah berubah.

**CacheMisses**: Jumlah absolut cache miss. Lonjakan mendadak di sini berarti cache tidak membantu dan database menanggung beban penuh.

**Evictions**: Jumlah item cache yang dikeluarkan untuk memberi ruang bagi yang baru. Tingkat eviction tinggi berarti cache Anda terlalu kecil untuk working set Anda. Anda butuh lebih banyak memori atau strategi caching yang lebih selektif.

**CurrConnections**: Koneksi klien saat ini ke Redis. Terlalu banyak koneksi dapat menghabiskan batas koneksi Redis. Aplikasi harus menggunakan connection pooling untuk menghindari membuka koneksi baru pada setiap permintaan.

**ReplicationLag**: Seberapa jauh replika baca tertinggal dari primer. Jika ini bertambah, pembacaan replika mungkin mengembalikan data basi.

Leo menyiapkan dua alarm CloudWatch. Pertama: peringatkan jika tingkat hit cache turun di bawah 70% selama lima belas menit berturut-turut — itu akan menandakan masalah yang layak diselidiki sebelum database merasakannya. Kedua: peringatkan jika tingkat eviction melebihi 100 eviction per menit — itu akan menandakan cache berukuran terlalu kecil.

"Dua alarm," kata Priya, meninjau konfigurasinya. "Itu awal yang baik."

"Aku juga menambahkan dasbor," kata Leo. "Tingkat hit, tingkat miss, eviction, latensi. Semua terlihat di satu tempat."

"Itu lebih baik daripada menunggu halaman menjadi lambat."

"Jauh lebih baik," Leo setuju.


---

**ElastiCache vs DAX: Cache Mana untuk DynamoDB?**

"Jika kita meng-cache data DynamoDB," tanya Maya, "mengapa tidak menggunakan DAX alih-alih ElastiCache? Aku melihatnya di dokumentasi."

Pertanyaan bagus.

**DAX (DynamoDB Accelerator)** adalah cache dalam memori yang dibangun khusus untuk DynamoDB. Ia mencegat panggilan API DynamoDB di tingkat klien — kode aplikasi Anda berbicara ke DAX menggunakan SDK DynamoDB yang sama. Cache miss otomatis diambil dari DynamoDB. Cache hit kembali dalam mikrodetik. Invalidasi ditangani secara otomatis ketika data berubah.

**ElastiCache** adalah cache serbaguna. Anda mengelola kunci cache, logika TTL, invalidasi — semuanya. Lebih banyak kontrol, lebih banyak tanggung jawab.

Kapan menggunakan masing-masing:

| Skenario | Rekomendasi |
|---|---|
| Anda meng-cache pembacaan DynamoDB dan menginginkan nol perubahan aplikasi | DAX |
| Anda butuh latensi mikrodetik pada pembacaan DynamoDB | DAX |
| Anda meng-cache dari banyak sumber (DynamoDB + RDS + API eksternal) | ElastiCache |
| Anda butuh struktur data Redis (sorted set, pub/sub, HyperLogLog) | ElastiCache |
| Anda butuh kontrol TTL halus dan logika invalidasi kustom | ElastiCache |
| Anda butuh penyimpanan sesi, rate limiting, atau distributed lock | ElastiCache |

Untuk Nimbus: mereka memilih ElastiCache karena mereka meng-cache data dari banyak sumber — DynamoDB untuk menu, RDS untuk ringkasan riwayat pesanan, API eksternal untuk rating restoran. DAX hanya bekerja dengan DynamoDB. Dan mereka membutuhkan sorted set Redis untuk peringkat tren.

"Jika ini murni masalah caching DynamoDB," kata Priya, "DAX akan menjadi jawaban yang lebih sederhana. Satu layanan, invalidasi otomatis, API yang sama. Tetapi kita memiliki lebih dari satu sumber data."

"Jadi DAX lebih sederhana ketika Anda hanya DynamoDB," Maya merangkum. "ElastiCache ketika Anda membutuhkan kotak peralatan lengkap."

"Itu kompromi-nya."

### Ketika Data Cache Tidak Boleh Hilang: Amazon MemoryDB

"Mengapa ada yang menggunakan Redis sebagai database utama?" tanya Maya. "Bukankah itu cache?"

Itu persis pertanyaan yang tepat.

ElastiCache for Redis adalah cache — cepat, dalam memori, dan secara desain, bukan sumber kebenaran. Jika sebuah node ElastiCache gagal, cache kosong saat restart. Aplikasi menghangatkannya kembali dari database. Itu tidak masalah untuk sebuah cache.

Tetapi beberapa kasus penggunaan memperlakukan Redis bukan sebagai cache melainkan sebagai penyimpanan data utama — state sesi yang harus bertahan dari restart, leaderboard real-time yang tidak boleh hilang, keranjang belanja yang harus bertahan di seluruh kegagalan AZ. Untuk kasus penggunaan ini, daya tahan eventual ElastiCache adalah sebuah risiko.

**Amazon MemoryDB for Redis** adalah database dalam memori yang sepenuhnya terkelola, kompatibel dengan Redis, dan tahan lama (durable). Tidak seperti ElastiCache, MemoryDB menggunakan log transaksi terdistribusi yang disimpan di beberapa AZ yang membuat setiap penulisan tahan lama sebelum diakui. Data bertahan dari kegagalan node — bukan karena diputar ulang dari database yang lebih lambat, tetapi karena ia tidak pernah hanya di satu tempat.

Perbedaan kuncinya:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| Peran | Lapisan cache | Database utama |
| Daya tahan | Tidak dijamin saat kegagalan | Log transaksi Multi-AZ |
| Latensi | Pembacaan dan penulisan mikrodetik | Pembacaan mikrodetik, penulisan satu digit milidetik |

Keduanya mendukung perintah dan struktur data Redis yang sama. API-nya sama. Jaminan daya tahannya tidak.

Untuk Nimbus: tim ingin menyimpan jumlah pesanan per-restoran real-time sebagai sorted set Redis — dan itu harus bertahan dari kegagalan AZ tanpa menyemai ulang dari database. Persyaratan itu — kompatibel dengan Redis *dan* tahan lama — adalah sinyal yang tepat untuk MemoryDB.

"Jadi kita tidak perlu menghangatkannya kembali setelah kegagalan?" tanya Leo.

"Itulah intinya," kata Priya. "Jika node gagal dan kembali, datanya ada di sana. Log transaksi menjaganya."

Leo menatap halaman harga sejenak. "Biayanya lebih mahal daripada ElastiCache."

"Segala sesuatu yang layak dipercaya memang begitu," kata Priya.

## Kekuatan dan Batasan

**Mengapa caching itu kuat**:

- Secara dramatis mengurangi beban database (lebih sedikit kueri, biaya lebih rendah)
- Waktu respons sub-milidetik untuk cache hit
- Melindungi database Anda dari lonjakan lalu lintas
- Redis mendukung struktur data yang lebih kaya daripada penyimpanan key-value sederhana
- Mitigasi cache stampede (jitter TTL, coalescing) melindungi dari lonjakan cold-start

**Di mana caching menjadi rumit**:

- Invalidasi cache benar-benar sulit — data basi menyebabkan bug
- Menambah kompleksitas operasional (layanan lain untuk dipantau, titik kegagalan lain)
- Masalah cold start: ketika Anda men-deploy baru, cache kosong — database menanggung beban penuh
- Cache stampede: jika banyak entri kedaluwarsa sekaligus, semua permintaan menghantam database secara bersamaan
- Node ElastiCache tidak gratis — Anda membayarnya bahkan saat idle

**ElastiCache vs DynamoDB DAX**:

Jika Anda meng-cache data DynamoDB secara khusus, AWS menawarkan **DAX (DynamoDB Accelerator)** — cache dalam memori yang dibangun khusus untuk DynamoDB. DAX transparan untuk kode aplikasi Anda (API yang sama), mengurangi latensi baca DynamoDB ke mikrodetik, dan menangani invalidasi cache secara otomatis.

Gunakan DAX ketika hambatan Anda adalah pembacaan DynamoDB dan Anda menginginkan caching tanpa perubahan. Gunakan ElastiCache ketika Anda membutuhkan cache serbaguna untuk sumber data apa pun, atau ketika Anda membutuhkan struktur data Redis.

## Ringkasan

Empat puluh tujuh panggilan database menjadi satu pencarian cache. Halaman berubah dari 188 milidetik menjadi 12. Menambahkan lapisan caching adalah salah satu perubahan dengan daya ungkit tertinggi yang dapat dilakukan aplikasi yang berkembang — tetapi hanya ketika cache dirancang dengan cermat, dengan jawaban yang jelas atas pertanyaan "kapan data ini berubah?"

- Cache adalah penyimpanan cepat untuk data yang baru saja diambil — Anda bertanya sekali, mengingat jawabannya. ElastiCache adalah layanan caching terkelola AWS, mendukung **Redis** (persistensi, struktur data kompleks, pub/sub) dan **Memcached** (key-value murni, penskalaan horizontal).
- **Pola cache-aside** (lazy loading): periksa cache dulu, beralih ke database saat miss. **TTL** mengontrol berapa lama data tetap di-cache — TTL pendek berarti data lebih segar dan lebih banyak miss; TTL panjang berarti respons lebih cepat dan potensi kebasian.
- Cache hal yang tepat: data per-entitas yang dibagi di banyak pengguna, bukan data per-pengguna yang unik untuk setiap sesi. Cache stampede terjadi ketika banyak entri kedaluwarsa secara bersamaan — mitigasi dengan jitter TTL.
- **DAX** adalah pilihan yang tepat untuk caching khusus DynamoDB. **ElastiCache** lebih fleksibel untuk caching multi-sumber dan struktur data Redis.
- Bagian tersulit dari caching adalah invalidasi: mengetahui kapan data berubah dan memperbarui cache di semua jalur kode yang menulisnya. Cache hanya sebaik strategi invalidasinya.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.3)*

- **Redis vs Memcached pada ujian**: Redis = persistensi, replikasi, struktur kompleks, pub/sub. Memcached = key-value sederhana, penskalaan horizontal murni. Ketika skenario menyebutkan "Anda tidak boleh kehilangan data yang di-cache," jawabannya adalah Redis (ia menyimpan ke disk).
- **Sinyal kasus penggunaan ElastiCache**: "database menjadi hambatan," "beban kerja baca-berat," "kurangi latensi," "penyimpanan sesi" — semuanya menunjuk ke ElastiCache.
- **Sinyal DAX**: "kurangi latensi baca DynamoDB" atau "baca DynamoDB terlalu lambat" → DAX, bukan ElastiCache.
- **Manajemen sesi**: ElastiCache Redis adalah jawaban kanonik untuk menyimpan data sesi pengguna. Aplikasi stateless + penyimpanan sesi Redis = penskalaan horizontal dengan sesi yang konsisten.
- **Write-through vs cache-aside**: Cache-aside (lazy loading) adalah yang paling umum. Write-through memperbarui cache pada setiap penulisan — tidak pernah basi, tetapi lebih banyak operasi penulisan. Ujian mungkin membedakan keduanya.
- **Kebijakan eviction cache**: LRU (least recently used) adalah jawaban ujian yang paling umum untuk beban kerja web umum.
- **ElastiCache vs. MemoryDB:** ElastiCache = lapisan cache, cepat, kehilangan data dapat diterima saat kegagalan. MemoryDB = database utama dalam memori yang tahan lama, kompatibel dengan Redis, log transaksi multi-AZ. Pemicu ujian: "kompatibel dengan Redis DAN tahan lama" atau "penyimpanan data utama di Redis" → MemoryDB, bukan ElastiCache.

## Latihan

**Latihan 1 — Ingat**

Dalam kata-kata Anda sendiri: apa itu invalidasi cache, dan mengapa itu sulit?

*(Petunjuk: Pikirkan tentang semua tempat di Nimbus di mana data menu dapat diperbarui — portal mitra restoran, alat admin, cron job. Setiap jalur tersebut perlu mengetahui tentang cache.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah platform streaming video melayani jutaan pengguna. Katalog film yang tersedia jarang berubah (diperbarui setiap malam). Aplikasi mengalami penggunaan CPU database yang tinggi karena setiap permintaan pengguna mengkueri katalog. Tim ingin mengurangi beban database sambil menjaga data katalog akurat dalam satu jam setelah pembaruan.

Solusi mana yang PALING memenuhi persyaratan ini?

A) Tambahkan replika baca ke database RDS untuk mendistribusikan beban  
B) Migrasikan katalog ke DynamoDB dengan kapasitas on-demand  
C) Gunakan ElastiCache for Redis dengan TTL 1 jam untuk data katalog  
D) Tingkatkan ukuran instans RDS untuk menangani lebih banyak kueri bersamaan

**Petunjuk 1**: Data bersifat baca-berat dan jarang berubah. Pola mana yang ideal untuk ini?

**Petunjuk 2**: "Akurat dalam satu jam" diterjemahkan langsung ke parameter konfigurasi cache tertentu.

**Petunjuk 3**: Tujuannya adalah mengurangi beban database, bukan hanya menanganinya lebih banyak.

**Jawaban**: C

**Penjelasan**: ElastiCache dengan TTL satu jam meng-cache data katalog setelah permintaan pertama per kunci. Permintaan berikutnya kembali dari cache tanpa menyentuh database. Saat pembaruan malam berjalan, entri kedaluwarsa dalam satu jam dan data segar dimuat pada permintaan berikutnya.

**Mengapa tidak A?** Replika baca mendistribusikan lalu lintas baca ke lebih banyak node database tetapi tidak mengurangi jumlah total kueri. Mereka berguna untuk penskalaan baca, bukan untuk mengurangi beban database dari kueri yang sering diulang.

**Mengapa tidak B?** Memigrasikan ke DynamoDB tidak menyelesaikan masalah mendasar — data katalog tetap diambil dari database (DynamoDB) pada setiap permintaan pengguna.

**Mengapa tidak D?** Meningkatkan ukuran instans menangani lebih banyak kueri bersamaan tetapi tidak mengurangi jumlah kueri. Ketidakefisienan mendasar tetap ada.

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi — Tugas 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin menambahkan fitur "restoran yang sedang tren": daftar peringkat 10 restoran teratas berdasarkan volume pesanan dalam 24 jam terakhir, diperbarui setiap 15 menit.

Bagaimana Anda akan mengimplementasikannya dengan ElastiCache Redis? Struktur data Redis mana yang akan Anda gunakan untuk peringkatnya? Apa TTL cache Anda, dan kapan tepatnya Anda akan memperbarui cache?

Pertimbangkan juga: apa yang terjadi jika node ElastiCache mati? Apakah fitur tersebut rusak? Bagaimana Anda merancang untuk mengatasi kegagalan ini?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih desain cache dan pemikiran tentang kegagalan.)*

## Adegan Pasca-Kredit

"Aku sudah men-deploy-nya — oh." Leo telah mendorong integrasi Redis ke produksi sebelum memperbarui pengaturan connection pool. Di bawah beban, aplikasi membuka terlalu banyak koneksi Redis. Ia harus me-roll back-nya dan men-deploy lagi dengan konfigurasi yang benar.

Leo menambahkan caching Redis untuk menu. Waktu pemuatan halaman turun dari 188 milidetik menjadi 12 milidetik.

Empat puluh tujuh panggilan DynamoDB menjadi satu pencarian Redis. Panggilan tersebut berlangsung 0,8 milidetik.

Ia mengumumkan ini pada standup hari Senin.

"Bagus," kata Priya, tanpa mengalihkan pandangan dari laptopnya.

"Terima kasih," kata Leo.

"Kapan terakhir kali Anda merotasi token auth Redis?"

Leo melihat catatannya. "Kurasa aku tidak menyetelnya."

"Jadi cache tidak terautentikasi."

"Ini berada di dalam VPC."

"Begitu juga semua hal lain yang ikut terkompromi." Ia akhirnya mendongak. "Jika laptop Leo terinfeksi dan seseorang melakukan pivot ke dalam VPC, cache Anda tidak memiliki kata sandi."

Leo menatapnya.

"Aku akan menyetel token auth," katanya.

Di bab berikutnya: jaringan privat yang memisahkan apa yang dimiliki Nimbus dari sisa internet.
