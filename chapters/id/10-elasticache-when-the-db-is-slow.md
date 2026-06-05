# Bab 10: Ketika Database Terlalu Lambat

Metrik pemuatan halaman terbuka di layar. Leo telah melihatnya selama dua puluh menit tanpa mengatakan apa-apa.

Empat puluh tujuh permintaan DynamoDB per pemuatan halaman. Seratus delapan puluh delapan milidetik hanya untuk mengambil data—sebelum peramban merender satu pun piksel.

Dia telah melakukan perhitungan. Sepuluh ribu pengguna bersamaan pada hari Jumat malam: empat ratus tujuh puluh ribu baca DynamoDB per menit. Biayanya nyata. Tetapi latensi adalah masalah sebenarnya. Seorang pengguna membuka halaman Nimbus browse menunggu hampir dua ratus milidetik sebelum apa pun muncul—dan itu pada koneksi cepat.

"Database merespons dalam empat milidetik per permintaan," kata Leo. "Itu sebenarnya cepat. DynamoDB sedang melakukan pekerjaannya."

"Lalu mengapa halaman itu lambat?" tanya Maya.

"Karena kita memanggilnya empat puluh tujuh kali per pemuatan halaman," kata Priya. "Masalahnya bukan database. Masalahnya adalah kita berbicara dengannya terlalu banyak."

Tom condong ke depan. Dia memiliki tatapan ketika masalah akan menjadi percakapan biaya. “Jadi solusinya adalah berbicara dengannya lebih sedikit?”

“Bicaralah dengannya lebih sedikit. Ingat lebih banyak.”

**Analogi Restoran**

Bayangkan dapur sebuah restoran. Setiap kali seorang pelayan perlu mengetahui spesialisasi hari itu, mereka berjalan ke belakang, bertanya kepada koki, dan kembali ke meja.

Itu berfungsi dengan baik jika Anda memiliki dua pelayan dan tiga meja.

Sekarang bayangkan dua ratus pelayan dan seribu meja. Setiap satu dari mereka berjalan ke belakang untuk pertanyaan yang sama. Dapur menjadi hambatan. Koki menjawab pertanyaan yang sama empat ratus kali per jam.

Solusi yang jelas: tulis spesialisasi di papan di depan restoran. Setiap pelayan membaca dari papan. Dapur mendapat istirahat. Papan diperbarui ketika spesialisasi berubah.

Papan itu adalah cache.

Cache adalah penyimpanan lokal yang cepat untuk data yang baru diambil. Alih-alih mengambil sesuatu berulang kali dari sumber yang lambat, Anda mengambilnya sekali dan simpan dekat.

**Mengapa Tidak Hanya Menggunakan Memori?**

"Bisakah kita hanya menyimpan menu di memori aplikasi?" tanya Leo.

Pertanyaan yang valid.

Anda bisa. Untuk aplikasi satu server, caching dalam memori berfungsi dengan baik. Tetapi Nimbus berjalan di balik load balancer, di beberapa instance EC2. Jika satu instance menyimpan menu di memori, instance lainnya tidak memiliki data itu. Mereka masing-masing mempertahankan cache terpisah. Ketika menu diperbarui, Anda harus melakukan invalidasi semuanya.

Ini adalah *masalah koherensi cache*—mempertahankan beberapa cache tetap konsisten.

ElastiCache menyelesaikan ini dengan menyediakan *terpusat* cache yang dibagikan oleh semua instance Anda. Alih-alih setiap server memiliki memori sendiri, setiap server membaca dan menulis ke cache yang sama. Satu pembaruan menyebar ke semua.

**Temui ElastiCache**

Amazon ElastiCache adalah layanan caching yang dikelola. Ini menjalankan mesin caching populer—Redis dan Memcached—tanpa Anda harus mengelola server.

**Redis** adalah yang lebih kuat dari keduanya. Ini mendukung struktur data yang kompleks (string, daftar, himpunan, hash, set yang diurutkan), persistensi (data bertahan selama restart), replikasi, dan pub/sub messaging. Redis dapat melakukan lebih dari caching—itu dapat berfungsi sebagai penyimpanan data ringan.

**Memcached** lebih sederhana. Penyimpanan kunci-nilai murni, skalabel secara horizontal, tanpa persistensi. Lebih cepat untuk kasus penggunaan sederhana tetapi lebih sedikit fitur.

Untuk Nimbus: Redis. Mereka perlu mencache data menu (terstruktur), token sesi (kunci-nilai), dan kemudian mereka ingin set yang diurutkan untuk peringkat "restoran yang sedang tren".

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

The first request always hits the database. Every subsequent request hits the cache. With a cache, Nimbus’s forty-seven DynamoDB reads per page load become one or two cache lookups. Fast, cheap, and scalable.

**The TTL: How Long Do You Remember?**

Every cache entry has a **Time-To-Live (TTL)**: the duration after which the entry expires and the next request goes back to the database for fresh data.

This is the core tension of caching: freshness vs. performance.

- **Short TTL (seconds)**: Very fresh data, but lots of cache misses. Cache barely helps.
- **Long TTL (hours or days)**: Very fast, but data can become stale. Customer sees yesterday’s menu.

For menu data, five minutes is reasonable. The menu doesn't change every second. If a restaurant updates their menu, customers might see the old version for up to five minutes — acceptable.

For session tokens (is this user logged in?), shorter TTL makes sense, or you update the cache immediately when the session changes.

For financial data (order totals, payment records), don’t cache it — or if you do, invalidate immediately on write.

“There are only two hard problems in computer science,” Leo quoted, with the practiced delivery of someone who’d said it before. “Cache invalidation and naming things.”

“Why is cache invalidation hard?” Maya asked.

“Because when does data *actually* change? Did the menu change because a restaurant partner updated it? Or because a cron job ran? Or because an admin manually edited it? Every place that can change the data needs to know to tell the cache.”

This is why senior engineers start a caching conversation with “what are the write paths?” instead of “let’s add Redis.”

**Cache Eviction: When the Board Gets Full**

The specials board has limited space. When it fills up, you have to erase something to make room.

Redis (and caches in general) have *eviction policies* that determine what gets removed when memory is full:

- **LRU (Least Recently Used)**: Remove items that haven't been accessed in the longest time.
- **LFU (Least Frequently Used)**: Remove items that are accessed least often.
- **allkeys-random**: Random eviction. Simple, not optimal.
- **noeviction**: Return an error when memory is full (application must handle this).

For most web applications: LRU. The things you haven't looked at recently are probably less needed.

**ElastiCache for Redis: What You Get Managed**

Like RDS, ElastiCache takes an open-source tool and handles the operational work:

- **Automated backups**: Redis snapshots on a schedule
- **Multi-AZ replication**: Primary node + read replicas in different AZs
- **Automatic failover**: If the primary Redis node fails, a replica is promoted automatically
- **Cluster mode**: Horizontal sharding across multiple nodes for very large caches
- **Encryption**: In-transit and at-rest encryption for compliance
- **VPC integration**: Cache runs in your private network, not publicly accessible

Tom looked at the feature list. “How much does it cost?”

“Less than the DynamoDB reads we’re replacing,” Leo said. “I ran the numbers.”

Tom’s expression shifted from skeptical to interested. That was progress.

## Strengths and Limitations

**Why caching is powerful**:

- Dramatically reduces database load (fewer queries, lower costs)
- Sub-millisecond response times for cache hits
- Protects your database from traffic spikes
- Redis supports richer data structures than a simple key-value store

**Where caching gets complicated**:

- Cache invalidation is genuinely hard — stale data causes bugs
- Adds operational complexity (another service to monitor, another failure point)
- Cold start problem: when you deploy fresh, the cache is empty — database takes the full load
- Cache stampede: if many entries expire at once, all requests hit the database simultaneously
- ElastiCache nodes are not free — you pay for them even when idle

**ElastiCache vs DynamoDB DAX**:

If you’re caching DynamoDB data specifically, AWS offers **DAX (DynamoDB Accelerator)** — a purpose-built in-memory cache for DynamoDB. DAX is transparent to your application code (same API), reduces DynamoDB read latency to microseconds, and handles cache invalidation automatically.

Use DAX when your bottleneck is DynamoDB reads. Use ElastiCache when you need a general-purpose cache for any data source.

## Summary

- A cache is a fast store of recently retrieved data — you ask once, remember the answer.
- ElastiCache is AWS’s managed caching service, supporting Redis and Memcached.
- **Redis** is richer (complex data structures, persistence, pub/sub). **Memcached** is simpler (pure key-value, horizontally scalable).
- The **cache-aside pattern** (lazy loading): check cache first, fall back to database on miss.
- **TTL** controls how long data stays cached. Short TTL = fresh, many misses. Long TTL = fast, potentially stale.
- Cache invalidation is hard. Know all the write paths before adding a cache.
- ElastiCache manages replication, failover, backups, and encryption — you focus on cache design.
- **DAX** is the DynamoDB-specific cache. ElastiCache is general-purpose.

## Exam Tips

*SAA-C03 Domain: Desain Arsitektur Berkinerma (Domain 3, Tugas 3.3)*

- **Redis vs Memcached pada ujian**: Redis = persistensi, replikasi, struktur kompleks, pub/sub. Memcached = kunci-nilai sederhana, penskalaan horizontal murni. Ketika skenario menyebutkan “Anda tidak boleh kehilangan data yang di-cache,” jawabannya adalah Redis (ini menyimpan ke disk).
- **Sinyal penggunaan ElastiCache**: “database menjadi hambatan,” “pemuatan baca yang berat,” “kurangi latensi,” “penyimpanan sesi” — semuanya menunjukkan ElastiCache.
- **Sinyal DAX**: “kurangi latensi baca DynamoDB” atau “baca DynamoDB terlalu lambat” → DAX, bukan ElastiCache.
- **Manajemen sesi**: ElastiCache Redis adalah jawaban yang tepat untuk menyimpan data sesi pengguna. Aplikasi tanpa status + penyimpanan sesi Redis = penskalaan horizontal dengan sesi yang konsisten.
- **Write-through vs cache-aside**: Cache-aside (pemuatan malas) adalah yang paling umum. Write-through memperbarui cache pada setiap tulis — tidak pernah kedaluwarsa, tetapi lebih banyak operasi tulis. Ujian mungkin membedakan di antara keduanya.
- **Kebijakan evasi cache**: LRU (least recently used) adalah jawaban ujian yang paling umum untuk beban kerja web umum.

## Latihan

**Latihan 1 — Mengingat**

Dalam kata-kata Anda: apa itu invalidasi cache, dan mengapa itu sulit?

*(Petunjuk: Pikirkan tentang semua tempat di Nimbus di mana data menu dapat diperbarui — portal mitra restoran, alat admin, pekerjaan cron. Setiap jalur tersebut perlu mengetahui tentang cache.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Platform streaming video melayani jutaan pengguna. Katalog film yang tersedia berubah jarang (diperbarui setiap malam). Aplikasi mengalami penggunaan CPU database yang tinggi karena setiap permintaan pengguna menanyakan katalog. Tim ingin mengurangi beban database sambil menjaga akurasi data katalog dalam satu jam setelah pembaruan.

Solusi MANA YANG TERBAIK yang memenuhi persyaratan ini?

A) Tambahkan replika baca ke database RDS untuk mendistribusikan beban
B) Migrasikan katalog ke DynamoDB dengan kapasitas sesuai permintaan
C) Gunakan ElastiCache untuk Redis dengan TTL 1 jam untuk data katalog
D) Tingkatkan ukuran instance RDS untuk menangani lebih banyak kueri bersamaan

**Petunjuk 1**: Data bersifat baca-berat dan berubah jarang. Pola mana yang ideal untuk ini?

**Petunjuk 2**: “Akurat dalam satu jam” diterjemahkan langsung ke parameter konfigurasi cache tertentu.

**Petunjuk 3**: Tujuannya adalah mengurangi beban database, bukan hanya menanganinya.

**Jawaban**: C

**Penjelasan**: ElastiCache dengan TTL satu jam meng-cache data katalog setelah permintaan pertama per kunci. Permintaan berikutnya mengembalikan dari cache tanpa menyentuh database. Saat pembaruan malam berjalan, entri kedaluwarsa dalam satu jam dan data segar dimuat pada permintaan berikutnya.

**Mengapa tidak A?** Replikasi baca mendistribusikan lalu lintas baca ke beberapa node database tetapi tidak mengurangi jumlah total kueri. Mereka berguna untuk penskalaan baca, bukan untuk mengurangi beban database dari kueri yang sering diulang.

**Mengapa tidak B?** Memigrasikan ke DynamoDB tidak menyelesaikan masalah mendasar — data katalog masih diambil dari database (DynamoDB) pada setiap permintaan pengguna.

**Mengapa tidak D?** Meningkatkan ukuran instance menangani lebih banyak kueri bersamaan tetapi tidak mengurangi jumlah kueri. Ketidakefektifan mendasar tetap ada.

*SAA-C03 Domain: Desain Arsitektur Berkinerma — Tugas 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin menambahkan fitur “restoran populer”: daftar teratas 10 restoran berdasarkan volume pesanan dalam 24 jam terakhir, diperbarui setiap 15 menit.

Bagaimana Anda akan mengimplementasikannya dengan ElastiCache Redis? Struktur data Redis mana yang akan Anda gunakan? Apa TTL cache Anda, dan kapan tepatnya Anda akan memperbarui cache?

Pertimbangkan juga: apa yang terjadi jika node ElastiCache gagal? Apakah fitur tersebut rusak? Bagaimana Anda merancangnya untuk kegagalan ini?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk berlatih desain cache dan pemikiran tentang kegagalan.)*

## Adegan Pasca Kredit

Leo menambahkan caching Redis untuk menu. Waktu pemuatan halaman turun dari 188 milidetik menjadi 12 milidetik.

Sebanyak 47 panggilan DynamoDB menjadi satu lookup Redis. Panggilan tersebut berlangsung 0,8 milidetik.

Dia mengumumkan ini pada *standup* hari Senin.

"Bagus," kata Priya, tanpa mengalihkan pandangannya dari laptopnya.

"Terima kasih," kata Leo.

"Kapan terakhir kali Anda memutar token otentikasi Redis?"

Leo melihat catatan-catatannya. "Saya tidak berpikir saya menyetelnya."

"Jadi cache tidak diautentikasi."

"Ini berada di dalam VPC."

"Begitu juga semuanya yang lainnya yang terkompromi." Dia akhirnya mendongak. "Jika laptop Leo terinfeksi dan seseorang melakukan pivot ke VPC, cache Anda tidak memiliki kata sandi."

Leo menatapnya.

"Saya akan mengatur token otentikasi," katanya.

Di bab berikutnya: jaringan privat yang memisahkan apa yang dimiliki Nimbus dari sisanya.
