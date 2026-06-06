# Bab 9: Ketika Tabelnya Semakin Besar

Dapur di mitra restoran pertama Nimbus berbau bawang putih dan roti hangat bahkan pada pukul sepuluh pagi. Maya berada di sana untuk sebuah demo, menyaksikan seorang juru masak menggeser layar aplikasi untuk mencatat sebuah penggantian — ikan menggantikan udang yang sementara habis. Geseran itu terjadi. Menu diperbarui. Seorang pelanggan di bagian kota yang berbeda melihat perubahan itu dalam hitungan detik.

Itu terasa seperti sihir.

Kembali di kantor, sihir itu mulai melambat.

Tabel menu memiliki 50.000 item.

Itu tersebar di 287 restoran — jumlah mitra telah meledak dari empat puluh tujuh di masa load balancer menjadi hampir tiga ratus dalam waktu kurang dari setahun — masing-masing dengan menu spesial harian, item musiman, dan variasi regional. Beberapa item memiliki modifikasi — ukuran, tingkat kepedasan, pilihan protein. Beberapa memiliki penawaran combo yang merujuk ke item lain. Beberapa muncul di menu hanya pada hari kerja, atau hanya saat makan siang, atau hanya di kota-kota tertentu.

Kueri SQL yang mengambil menu lengkap sebuah restoran sebelumnya hanya membutuhkan waktu 200 milidetik untuk dikembalikan.

Sekarang membutuhkan waktu empat detik.

Empat detik adalah perbedaan antara seseorang yang melakukan pemesanan dan seseorang yang menutup aplikasi. Leo telah menjalankan rencana kueri. Tom telah melihat konfigurasi indeks. Priya telah meningkatkan jumlah replika baca. Tidak ada dari itu yang membuat perbedaan yang berarti.

Dan itu mengubah suasana di ruangan itu.

---

**Upaya Pertama: Lebih Banyak Indeks**

Leo membuka rencana kueri. Ia menelusurinya dengan cermat.

"Masalahnya adalah join ini," katanya. "Ketika kita menarik menu sebuah restoran, kita meng-join tabel menu_items dengan tabel modifiers, lalu dengan tabel combos, lalu dengan tabel availability_windows. Empat tabel, tiga join, lima puluh ribu baris."

Ia menambahkan indeks pada `restaurantId` di setiap tabel. Ia menjalankan kueri lagi. Dua detik. Lebih baik, tetapi belum cukup baik.

Tom telah membaca sesuatu tentang query hints. Ia menghabiskan sore hari untuk mengutak-atik. Satu koma tiga detik. Masih belum baik.

"Bagaimana kalau kita denormalisasi?" tanya Leo. "Gabungkan modifiers ke dalam sebuah kolom JSON langsung di tabel menu_items. Lebih sedikit join."

Mereka mencobanya. Tepat satu detik. Terasa seperti kemajuan. Maya mengirim pesan ke para mitra restoran yang mengatakan bahwa mereka telah memperbaiki masalah kecepatan. Itu hari Selasa.

Pada hari Kamis kueri kembali ke 2,8 detik. Data mereka telah bertambah. Lebih banyak restoran telah onboarding. Lebih banyak item per restoran. Kueri yang terasa sudah terpecahkan ternyata belum terpecahkan.

"Pendekatan indeks bisa mengimbangi data hari ini," kata Priya. "Tetapi kita menambahkan empat puluh restoran seminggu. Pada kuartal berikutnya kita akan memiliki item dua kali lipat. Akan seperti apa kuerinya nanti?"

"Tiga detik minimum," kata Leo. "Mungkin lima."

"Jadi kita hanya membeli waktu beberapa minggu."

"Ya."

Mereka merenungkan itu. Perbaikan yang kedaluwarsa bukanlah perbaikan yang sesungguhnya.

---

**Upaya Kedua: Replika Baca**

Priya telah meningkatkan jumlah replika baca sekali. Ia mencoba lagi — sekarang dua replika baca, dan aplikasi mendistribusikan beban di antara keduanya. Teorinya masuk akal: sebarkan lalu lintas baca, setiap replika menangani lebih sedikit pekerjaan.

Itu membantu sedikit. Beban puncak turun dari 2,8 detik menjadi 2,2 detik.

"Itu karena kemacetannya bukan jumlah pembacaan," kata Tom, melihat metrik database. "Itu adalah kueri itu sendiri. Lebih banyak replika berarti lebih banyak server menjalankan kueri lambat yang sama. Kuerinya tetap lambat."

"Berapa biayanya per bulan?" tambahnya, karena ia selalu bertanya. "Dua replika baca tambahan pada db.r5.large — itu sekitar 350 dolar sebulan. Untuk peningkatan dua detik."

Leo menutup panel replika.

"Jadi lebih banyak perangkat keras tidak memperbaiki kueri yang buruk," kata Maya.

"Ketika sebuah masalah bertahan setelah pengindeksan, upaya caching, dan replika tambahan," kata Leo perlahan, "mungkin masalahnya bukan konfigurasinya. Mungkin masalahnya adalah bentuk sistemnya."

Itulah awal dari percakapan yang lebih panjang.

---

*Minggu lalu, tim akhirnya berhasil mengendalikan RDS. Standby Multi-AZ, pencadangan otomatis, sebuah replika baca yang menangani kueri pelaporan. Masalah DBA — yang dulu membuat Leo terbangun di malam hari — telah terpecahkan. Lapisan database terkelola sudah stabil. Tetapi stabil tidak berarti cepat, dan cepat sekarang menjadi masalahnya. Tabel menu mulai mencapai batas yang tidak dapat diperbaiki oleh lebih banyak replika. Bentuk data itu sendirilah yang salah.*

---

**Masalah dengan Memasukkan Semuanya ke dalam Tabel**

Berikut adalah ketegangan inti dari database relasional: mereka dirancang untuk menyimpan *data terstruktur* dalam *bentuk tetap*.

Jika setiap item menu memiliki bidang yang sama — nama, harga, deskripsi, kategori — SQL akan sempurna. Anda akan memiliki tabel `menu_items` yang bersih, baris untuk setiap item, dan kueri yang masuk akal.

Tetapi menu sungguhan tidak bekerja seperti itu.

Satu item mungkin memiliki modifikasi "tingkat kepedasan". Item lain mungkin memiliki "pilihan protein". Item ketiga mungkin memiliki combo yang tertanam — "pesan makanan keluarga dan Anda mendapatkan dua hidangan utama, dua lauk, dan minuman." Struktur data bervariasi *per item*.

Dalam SQL, Anda memiliki dua opsi:

**Opsi 1**: Buat kolom untuk setiap kemungkinan modifikasi. Ini menghasilkan tabel yang sangat lebar di mana sebagian besar kolom kosong sebagian besar waktu.

**Opsi 2**: Buat tabel modifikasi terpisah dan gabungkan dengan tabel menu item. Ini berfungsi, tetapi menu yang kompleks memerlukan banyak join, dan pada lima puluh ribu item dengan volume baca tinggi, join ini menjadi mahal.

"Ada opsi ketiga," kata Priya, yang telah membaca dokumentasi dengan tenang di sudut.

Dia membuka tab baru. "Bagaimana jika data tidak perlu masuk ke dalam tabel?"

**Cara Berbeda untuk Memikirkan Data**

Database relasional menyimpan data sebagai baris dalam tabel. Setiap baris harus sesuai dengan skema tabel. Skema disepakati sebelumnya.

Database NoSQL menyimpan data secara berbeda. Salah satu pendekatan yang umum adalah *model dokumen*: setiap catatan disimpan sebagai dokumen mandiri (biasanya JSON), dan dokumen dalam koleksi yang sama tidak perlu memiliki bidang yang sama.

Sebuah item menu dalam model dokumen mungkin terlihat seperti ini:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Item lain mungkin terlihat sangat berbeda:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Berbagai bentuk. Koleksi yang sama. Tidak masalah.

"Jadi, database ini lebih seperti sistem berkas daripada tabel," kata Maya.

"Tepat sekali," kata Priya. "Anda bisa meletakkan dokumen apa saja di laci mana saja. Anda tidak perlu memotong dokumen agar sesuai dengan ukuran tetap."

**Perkenalkan DynamoDB**

Amazon DynamoDB adalah layanan database NoSQL terkelola AWS. Layanan ini menyimpan data sebagai item (bukan baris), dan item dikumpulkan ke dalam tabel (penamaannya mirip dengan SQL, tetapi perilakunya berbeda).

Setiap item dalam tabel DynamoDB harus memiliki **kunci utama** (primary key), yang secara unik mengidentifikasinya. Segala sesuatu yang lain bersifat fleksibel.

Kunci utama dapat berbentuk salah satu dari dua cara:

**Hanya kunci partisi**: Satu atribut yang harus unik di seluruh item.

**Kunci partisi + kunci urut (kunci utama komposit)**: Dua atribut yang *bersama-sama* membentuk kombinasi unik. Ini memungkinkan Anda memiliki beberapa item dengan kunci partisi yang sama, yang dibedakan oleh kunci urut mereka.

Untuk menu Nimbus:

- Kunci partisi: `restaurantId`
- Kunci urut: `itemId`

Ini berarti Anda dapat mengambil semua item untuk restoran tertentu secara efisien — DynamoDB tahu persis partisi mana yang harus dicari.

"Mengapa ini disebut kunci partisi?" tanya Tom.

"Dan bagaimana jika seseorang mencoba menerobos masuk?" tanya Priya. "Jika kunci partisi bisa ditebak, bisakah seseorang membanjiri satu partisi dengan penulisan dan menyebabkan kondisi hot spot secara sengaja?"

"Ya," kata Leo. "Itu sebenarnya adalah vektor denial-of-service untuk tabel yang dirancang dengan buruk. Yang merupakan satu alasan lagi untuk memilih kunci berkardinalitas tinggi."

Priya mencatatnya.

**Bagaimana DynamoDB Menyimpan Data Secara Internal**

DynamoDB dibangun untuk menskalakan secara horizontal ke ukuran yang sangat besar. Ini dicapai melalui *partisi* — data dibagi di antara banyak mesin fisik berdasarkan kunci partisi.

Saat Anda menulis item, DynamoDB melakukan hashing pada nilai kunci partisi dan menggunakan hash tersebut untuk menentukan partisi fisik (dan oleh karena itu server) mana yang menyimpan item. Saat Anda membaca item, DynamoDB melakukan perhitungan yang sama untuk menemukannya secara instan.

Bayangkan seperti sistem pos. Jika setiap amplop memiliki kode pos, layanan pos tidak membaca setiap amplop untuk mencari tahu ke mana amplop itu seharusnya pergi — ia mengurutkannya berdasarkan kode pos. DynamoDB mengurutkan berdasarkan hash kunci partisi.

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya. "Mengapa pilihan kunci partisi begitu penting? Tidak bisakah kita memilih apa saja?"

Ini adalah pertanyaan yang tepat. Kunci partisi adalah keputusan desain tunggal yang paling penting dalam sebuah skema DynamoDB. Inilah alasannya:

Jika Anda memilih kunci partisi dengan kardinalitas rendah — misalnya, `available: true/false`, atau `category: "main/side/drink"` — sebagian besar data Anda mendarat di beberapa partisi yang sama. DynamoDB menyebut ini "hot partition." Satu server menangani sebagian besar lalu lintas. Server itu kelebihan beban. DynamoDB mulai membatasi permintaan. Pengguna mulai melihat kesalahan.

- **Baik**: Kardinalitas tinggi, nilai yang didistribusikan secara merata (`restaurantId` dengan banyak restoran)
- **Buruk**: Kardinalitas rendah (`true/false`, `category`) — sebagian besar data mendarat di beberapa partisi, menciptakan "hot spot"

"Jadi jika saya menggunakan `available: true` sebagai kunci partisi," kata Leo perlahan, "semua item yang tersedia akan menumpuk di partisi yang sama."

"Dan database Anda akan meleleh saat jam sibuk makan malam," konfirmasi Priya.

Leo menutup laptopnya perlahan.

---

**Insiden Hot Partition**

Mereka tidak perlu membayangkannya. Beberapa bulan kemudian — selama bulan kedua mereka menggunakan DynamoDB, sebelum mereka benar-benar menghayati aturannya — mereka akan mempelajarinya dengan cara yang sulit.

Tim telah meluncurkan fitur baru: sebuah lencana "Featured Items". Mitra restoran dapat menandai hingga lima item sebagai unggulan. Fitur tersebut menyimpan atribut `featured: true` pada setiap item.

Leo berpikir akan berguna untuk mengkueri semua item unggulan di seluruh restoran — untuk widget "trending items" di halaman beranda. Ia telah membuat indeks sekunder untuk mendukung kueri ini. Indeks tersebut menggunakan `featured` sebagai kunci partisinya.

"Akan baik-baik saja," katanya. "Berapa banyak item unggulan yang mungkin ada?"

Sekitar seribu dua ratus, tersebar di dua ratus empat puluh restoran.

Tetapi widget "trending items" dimuat di setiap halaman. Setiap pemuatan halaman memicu kueri terhadap indeks `featured`. Seluruh seribu dua ratus item berada di dua partisi — `true` dan `false`. Partisi `true` menerima setiap hantaman.

Jam sibuk makan malam Jumat. Delapan ribu pengguna bersamaan. Semua memuat halaman beranda.

Tingkat kesalahan DynamoDB melonjak menjadi delapan belas persen. Beberapa pengguna mendapatkan widget trending yang kosong. Beberapa mendapatkan spinner pemuatan. Beberapa mendapatkan kesalahan yang merembet ke dalam alur pemesanan.

Leo menarik metriknya. "Partisi indeks sedang dibatasi," katanya. "Kita mencapai batas throughput pada satu partisi."

"Bagaimana?" tanya Priya.

"Kunci `featured` hanya memiliki dua nilai. Seluruh seribu dua ratus item unggulan berada di partisi yang sama. Setiap pemuatan halaman beranda menghantam partisi itu."

Mereka menonaktifkan widget trending dalam waktu tiga menit. Tingkat kesalahan turun menjadi nol.

"Jadi kunci partisi dua nilai membatasi kita pada malam Jumat," kata Tom.

"Ya," kata Leo.

"Berapa biaya yang kita keluarkan?"

"Sekitar empat puluh menit pengalaman yang menurun di delapan ribu pengguna," kata Priya. "Dampak pendapatan, mungkin beberapa ratus pesanan."

Leo mengganti indeks tersebut dengan desain yang berbeda: tabel DynamoDB khusus bernama `featured_items` dengan `restaurantId` sebagai kunci partisi dan sebuah Lambda terjadwal — sepotong kecil kode yang dijalankan AWS untuk Anda (Bab 20) — yang memperbaruinya setiap lima belas menit dari tabel utama. Kueri menjadi sebuah scan atas tabel kecil yang terisolasi alih-alih hot partition pada tabel utama.

"Rancang pola akses Anda terlebih dahulu," kata Priya. "Lalu pilih model data Anda."

"Aku tahu," kata Leo. "Aku tahu sekarang."

---

**Membaca dan Menulis dalam Skala**

DynamoDB dapat menangani jutaan permintaan per detik. Tetapi ia perlu tahu berapa banyak kapasitas yang harus disediakan.

Ada dua mode kapasitas:

**Kapasitas yang disediakan (provisioned)**: Anda menentukan berapa banyak unit baca dan tulis yang Anda inginkan. DynamoDB memesan kapasitas ini untuk Anda dan membatasi lalu lintas yang melebihi batasnya. Biaya yang dapat diprediksi, harga per permintaan lebih rendah.

Unit-unit ini memiliki definisi yang presisi, dan ujian mengharapkan Anda mengetahuinya: satu **Read Capacity Unit (RCU)** adalah satu pembacaan konsisten kuat per detik untuk item hingga 4 KB — atau dua pembacaan konsisten pada akhirnya dengan ukuran yang sama. Satu **Write Capacity Unit (WCU)** adalah satu penulisan per detik untuk item hingga 1 KB. Item yang lebih besar mengonsumsi lebih banyak secara proporsional: membaca item 12 KB secara konsisten kuat menghabiskan 3 RCU; menulis item 3 KB menghabiskan 3 WCU.

**Kapasitas on-demand**: DynamoDB secara otomatis menskalakan dengan lalu lintas aktual Anda. Tidak diperlukan perencanaan kapasitas rutin. Biaya per permintaan lebih tinggi, dan jauh lebih sederhana secara operasional, meskipun lonjakan mendadak yang jauh melampaui pola lalu lintas tabel terbaru masih dapat menyebabkan pembatasan jika meningkat terlalu cepat.

Untuk Nimbus, menu dibaca jauh lebih sering daripada ditulis. Seorang pelanggan membuka aplikasi, menelusuri menu — itu banyak pembacaan. Seorang mitra restoran memperbarui menu mereka dua kali seminggu — itu penulisan sesekali.

"On-demand masuk akal untuk saat ini," kata Tom. "Kita belum tahu pola lalu lintas kita. Lebih baik membayar lebih per permintaan daripada kekurangan penyediaan dan dibatasi."

Kebijaksanaan infrastruktur yang enggan. Dari Tom. Tim tersebut secara resmi telah tumbuh.

"Berapa biayanya per bulan?" tanya Tom, membuka kalkulator harga.

"Pada volume baca kita saat ini — sekitar empat puluh ribu pembacaan per hari — on-demand sekitar dua belas dolar sebulan," kata Leo. "Provisioned, jika kita menyetelnya dengan benar, lebih dekat ke empat dolar. Tetapi kita harus menetapkan kapasitas secara manual dan berisiko dibatasi jika kita salah menebak."

Tom menulis kedua angka itu. Ia selalu menulis angka.

**Konsistensi: Seberapa Segar Data Anda?**

DynamoDB mereplikasi data di beberapa Availability Zone secara otomatis. Itu bagus untuk daya tahan, tetapi juga berarti Anda perlu berpikir dengan jelas tentang konsistensi baca.

Saat Anda membaca dari DynamoDB, Anda memiliki pilihan:

**Bacaan yang konsisten pada akhirnya (eventually consistent)**: Ini adalah default. Ini lebih murah, dan hasilnya mungkin sedikit tertinggal dari penulisan yang baru saja selesai.

**Bacaan yang konsisten kuat (strongly consistent)**: Untuk pembacaan terhadap tabel atau indeks sekunder lokal, DynamoDB dapat mengembalikan nilai terbaru yang telah dikomit dari penulisan sebelumnya yang berhasil. Ini menghabiskan lebih banyak kapasitas baca dan tidak tersedia untuk indeks sekunder global.

Untuk data menu, konsistensi pada akhirnya sudah cukup. Item menu yang ketinggalan semilidetik tidak masalah.

Untuk data konfirmasi pesanan — "apakah pesanan ini telah ditempatkan?" — Anda menginginkan konsistensi kuat. Pelanggan tidak boleh melihat pesan "coba lagi" ketika pesanan mereka baru saja disimpan.

"Ini seperti perbedaan antara memeriksa saldo bank Anda di aplikasi versus menelepon bank secara langsung," kata Maya. "Aplikasi mungkin tertinggal tiga puluh detik. Panggilan telepon selalu terkini."

Anda mungkin bertanya-tanya: jika DynamoDB mereplikasi di beberapa AZ secara otomatis, mengapa mode konsistensi penting sama sekali? Inilah jawabannya: replikasi membutuhkan sedikit waktu yang bukan nol — biasanya milidetik. Bacaan yang konsisten pada akhirnya mungkin dilayani dari replika yang belum menerima penulisan terbaru. Bacaan yang konsisten kuat selalu menghubungi salinan utama data. Untuk sebagian besar kasus penggunaan (item menu, katalog produk, profil pengguna) keterlambatannya tidak terasa. Untuk kasus penggunaan di mana kebenaran penting pada saat pembacaan (konfirmasi pembayaran, ketersediaan inventaris), Anda menginginkan konsistensi kuat.

**Indeks Sekunder: Mengkueri di Luar Kunci Utama**

Bagaimana jika Anda perlu mengakses data dengan cara yang berbeda dari yang diizinkan kunci utama?

DynamoDB mendukung **indeks sekunder** — kunci alternatif yang memungkinkan Anda mengkueri data yang sama menggunakan atribut yang berbeda.

**Local Secondary Index (LSI)**: Menggunakan kunci partisi yang sama dengan tabel, tetapi kunci urut yang berbeda. Harus didefinisikan saat pembuatan tabel dan tidak dapat ditambahkan kemudian. Berbagi kapasitas tersedia milik tabel. Karena LSI berbagi partisi, ia mendukung bacaan yang konsisten kuat.

**Global Secondary Index (GSI)**: Indeks yang sepenuhnya terpisah dengan kunci partisi dan kunci urutnya sendiri — berbeda dari kunci utama tabel. Dapat ditambahkan atau dihapus setelah tabel ada, yang memberi Anda fleksibilitas. Memiliki pengaturan kapasitas tersedianya sendiri, terpisah dari tabel.

Untuk Nimbus: jika mereka perlu mengkueri item berdasarkan rentang harga, sebuah GSI dapat mendukung itu — tetapi dengan satu aturan yang perlu diingat: kunci partisi hanya menerima perbandingan *kesetaraan*, jadi `price` (yang ingin Anda buat rentangnya) harus menjadi **kunci urut**, dengan atribut pengelompokan seperti kategori atau `cuisineType#region` sebagai kunci partisi GSI. Itulah persis indeks yang dibangun pada panduan di bawah.

Jika Anda memilih LSI, maka Anda mendapatkan konsistensi kuat dan kapasitas bersama, tetapi Anda terkunci pada desain itu saat pembuatan tabel; jika Anda memilih GSI, maka Anda mendapatkan fleksibilitas untuk menambahkannya kemudian dan penskalaan independen, tetapi Anda kehilangan kemampuan untuk melakukan bacaan yang konsisten kuat terhadap indeks.

---

**Panduan Kueri GSI**

Priya menelusuri sebuah contoh konkret. Nimbus ingin mendukung fitur "telusuri berdasarkan masakan": tampilkan semua hidangan yang tersedia dari jenis masakan tertentu di seluruh restoran mitra.

Tabel utama memiliki `restaurantId` sebagai kunci partisi dan `itemId` sebagai kunci urut. Anda tidak dapat mengkueri "semua item dengan cuisineType = Colombian" secara efisien — itu akan memerlukan scan di setiap partisi.

Mereka membuat sebuah GSI:

- Kunci partisi GSI: `cuisineType#region` (mis., "Colombian#NYC", "Mexican#Chicago")
- Kunci urut GSI: `price`

GSI menggandakan sebuah proyeksi dari setiap item — hanya bidang yang dibutuhkan untuk halaman penelusuran — ke dalam penyimpanan indeks. Sekarang sebuah kueri terhadap GSI dengan `cuisineType#region = "Colombian#NYC"` langsung menuju partisi indeks itu.

"Mengapa tidak menggunakan `cuisineType` saja?" tanya Leo.

"Karena cuisineType saja memiliki kardinalitas rendah," kata Priya. "Colombian, Mexican, Thai — total dua puluh nilai. Hot partition lagi. Menambahkan region memberi kita Colombian#NYC, Colombian#Chicago, Colombian#LA. Lebih banyak partisi, distribusi lebih baik."

"Itu terasa agak akal-akalan."

"Itu pola DynamoDB standar. Namanya partition key sharding. Terkadang Anda harus bekerja dengan alatnya."

Kueri GSI dalam kode terlihat seperti ini:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Itu mengembalikan semua hidangan Kolombia di New York City dengan harga antara $10 dan $25, diurutkan berdasarkan harga, dalam waktu sekitar 4 milidetik.

"Itu seribu kali lebih cepat daripada kueri SQL lama," kata Leo.

"Karena ia hanya menyentuh satu partisi dari satu indeks," konfirmasi Priya. "Bukan memindai setiap baris di tabel yang di-join."

---

**DynamoDB Streams: Bereaksi terhadap Perubahan**

"Apakah kita sudah memikirkan apa yang terjadi ketika sebuah item menu diperbarui?" tanya Priya suatu pagi. "Seorang mitra restoran mengubah harga. Kita perlu memperbarui indeks pencarian. Kita perlu membatalkan entri ElastiCache" — layanan caching yang akan kita temui di bab berikutnya — "dan kita perlu mencatat perubahan untuk pipeline analitik kita."

"Kita bisa melakukan semua itu di handler API," kata Leo. "Ketika penulisan terjadi, picu semua pembaruan hilir."

"Dan jika salah satunya gagal?"

"Maka... kita coba ulang."

"Bagaimana jika instans EC2 crash setelah penulisan tetapi sebelum pembaruan hilir? Datanya tersimpan, tetapi tidak ada yang tahu tentang perubahannya."

Leo memikirkannya.

"Kita perlu pembaruan itu dijamin," katanya. "Bahkan jika kode aplikasi kita gagal di tengah jalan."

Inilah yang dipecahkan oleh **DynamoDB Streams**.

DynamoDB Streams menangkap log terurut waktu dari setiap modifikasi item dalam sebuah tabel DynamoDB. Setiap insert, update, dan delete ditulis ke stream sebagai sebuah peristiwa. Stream menyimpan peristiwa selama 24 jam.

Anda dapat melampirkan sebuah fungsi Lambda ke stream. Setiap kali sebuah item berubah, fungsi Lambda dipanggil dengan kondisi sebelum-dan-sesudah item tersebut. Lambda kemudian dapat:

- Memperbarui indeks pencarian (OpenSearch)
- Membatalkan entri cache di ElastiCache
- Mengirim notifikasi ke sistem lain
- Memasok pipeline analitik
- Mereplikasi perubahan ke tabel atau database lain

Perbedaan kritisnya: Streams memisahkan penulisan dari efek hilir. Penulisan DynamoDB berhasil secara independen dari apakah Lambda berhasil. Jika Lambda gagal, DynamoDB mencobanya ulang. Jika aplikasi crash setelah penulisan, peristiwa stream masih ada di sana — Lambda akan memprosesnya ketika keadaan pulih.

"Jadi kita menulis ke DynamoDB," kata Leo perlahan, "dan DynamoDB menjamin pemrosesan hilir terjadi pada akhirnya, bahkan jika kita crash."

"Tepat sekali," kata Priya. "Ini perbedaan antara berharap semua efek samping Anda berjalan dan memiliki database yang menjaminnya."

Untuk Nimbus, mereka menyambungkan DynamoDB Streams pada tabel menu ke sebuah Lambda yang membatalkan entri ElastiCache ketika item menu berubah. Cache tetap konsisten dengan database, secara otomatis, tanpa kode aplikasi apa pun yang mengelola pembatalan.

"Berapa biaya Streams?" tanya Tom.

"Anda membayar untuk membaca dari stream — setiap pemanggilan Lambda membaca darinya. Pada volume kita, mungkin dua hingga tiga dolar sebulan."

Tom menyetujuinya tanpa pertanyaan lebih lanjut. Ia telah belajar kapan dua dolar sebulan itu sepadan.

**Kompromi: Apa yang Tidak Bisa Dilakukan DynamoDB**

NoSQL tidak secara ketat lebih baik daripada SQL. Ini adalah alat yang berbeda untuk pekerjaan yang berbeda.

Apa yang dilepaskan DynamoDB:

**Kueri yang fleksibel**: Dalam SQL, Anda dapat memfilter dan mengurutkan berdasarkan kolom apa saja. Dalam DynamoDB, Anda hanya dapat mengkueri secara efisien berdasarkan kunci utama. Mengkueri berdasarkan bidang sembarang memerlukan *scan* (membaca setiap item dalam tabel), yang mahal dan lambat pada skala besar.

**Join**: DynamoDB tidak melakukan join. Jika Anda membutuhkan data dari dua tabel, Anda melakukan dua pembacaan terpisah dalam kode aplikasi Anda.

**Transaksi**: DynamoDB mendukung transaksi, tetapi database relasional masih merupakan kesesuaian yang lebih alami untuk banyak alur kerja multi-entitas, sistem berbasis pelaporan, dan desain berbasis join.

**Keterbiasaan**: Puluhan tahun perkakas SQL, keterampilan, dan model mental tidak ditransfer secara langsung.

Apa yang menjadi keunggulan DynamoDB:

- Pola akses key-value dan dokumen
- Skala besar (latensi satu digit milidetik pada ukuran apa pun)
- Serverless, tanpa manajemen infrastruktur
- Penskalaan otomatis, replikasi multi-AZ, pencadangan
- Kinerja yang dapat diprediksi terlepas dari volume data

"Jadi aturannya," kata Maya, "gunakan DynamoDB ketika Anda *tahu persis* bagaimana Anda akan mengakses data. Gunakan SQL ketika Anda belum tahu."

Priya mengangguk. "Rancang pola akses Anda terlebih dahulu. Lalu pilih database Anda."

Ini adalah salah satu hal paling senior yang dapat dihasilkan oleh sebuah percakapan database.

---

**Kapan DynamoDB Menjadi Pilihan yang Salah**

Tom, yang telah mengambil alih modul pelaporan keuangan, memiliki sebuah pertanyaan.

"Kita sedang membangun pelaporan keuangan," katanya. "Ringkasan pendapatan bulanan per restoran, perhitungan pajak, riwayat faktur. Bisakah kita memasukkannya juga ke DynamoDB?"

Tim saling berpandangan.

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya, sebelum Priya sempat.

Priya tersenyum. Maya mulai terbiasa.

"Jelaskan kueri-kuerinya kepada kami," kata Priya kepada Tom.

Ia membuka spesifikasinya. "Kita butuh: total pendapatan per restoran, dikelompokkan berdasarkan minggu. Item dengan kinerja terbaik berdasarkan jumlah pesanan, di seluruh restoran. Pendapatan dipecah berdasarkan jenis masakan. Nilai pesanan rata-rata berdasarkan kota. Perbandingan tahun-ke-tahun untuk pelaporan mitra."

Leo membaca daftar itu. "Setiap satu dari itu adalah agregasi. Sum, group, average, compare."

"DynamoDB tidak punya fungsi agregasi," kata Priya. "Tidak ada GROUP BY. Tidak ada SUM. Tidak ada AVG. Untuk menjawab 'total pendapatan per restoran minggu ini,' Anda harus memindai setiap pesanan untuk minggu itu, menariknya semua ke memori aplikasi, dan menghitungnya sendiri."

"Itu terdengar buruk," kata Tom.

"Pada skala kita, itu puluhan ribu catatan yang ditarik ke memori untuk setiap permintaan laporan. Itu akan lambat dan mahal. Dan setiap kali kita menambahkan persyaratan laporan baru, kita akan menulis kode scan-and-compute baru."

"Jadi kita pakai apa?"

"Untuk pelaporan keuangan? RDS. PostgreSQL dengan indeks yang tepat. Kueri yang Anda jelaskan persis seperti yang dirancang untuk SQL. Itu akan menjadi sepuluh baris SQL. Itu akan menjadi dua ratus baris kode scan DynamoDB."

DynamoDB salah ketika:

- Anda tidak mengetahui pola akses Anda sebelumnya (pelaporan secara inheren bersifat eksploratif)
- Anda membutuhkan agregasi (SUM, GROUP BY, COUNT) di seluruh kumpulan data besar
- Data Anda memiliki hubungan kompleks dan Anda membutuhkan join
- Anda membutuhkan fleksibilitas kueri ad-hoc — untuk mengajukan pertanyaan yang belum Anda pikirkan
- Data Anda memiliki struktur yang secara fundamental relasional yang tidak memetakan ke key-value secara alami

"Jadi pilihannya bukan 'teknologi baru lebih baik,'" kata Maya.

"Pilihannya adalah 'apa bentuk data Anda, dan bagaimana Anda akan mengaksesnya,'" konfirmasi Priya. "DynamoDB benar-benar lebih baik untuk menu. Itu akan benar-benar lebih buruk untuk laporan keuangan. Kedua pernyataan itu benar pada saat yang sama."

Tom membangun pelaporan keuangan di PostgreSQL. Kueri GROUP BY pertama yang ia tulis kembali dalam 80 milidetik. Ia tidak perlu menulis satu baris pun kode scan.

---

**Kapan Menggunakan Masing-masing**

| Situasi                                             | Pilih                   |
|-------------------------------------------------------|-------------------------|
| Data terstruktur, kueri kompleks, pelaporan           | RDS (PostgreSQL, MySQL) |
| Bentuk data fleksibel, akses berbasis kunci, skala besar | DynamoDB             |
| Penulisan berat dengan hubungan kompleks                | RDS                     |
| Pembacaan berat dengan pola akses yang dapat diprediksi | DynamoDB               |
| Anda membutuhkan join dan agregat                         | RDS                     |
| Anda membutuhkan latensi milidetik pada jutaan req/sec   | DynamoDB                |
| Transaksi di seluruh banyak entitas                | RDS (biasanya)           |
| Serverless / lonjakan lalu lintas yang tidak terduga | DynamoDB on-demand      |
| Pelaporan keuangan, analitik ad-hoc                | RDS atau data warehouse |
| Event sourcing, change capture, pemrosesan real-time  | DynamoDB + Streams      |

Jawaban yang salah selalu "selalu gunakan satu atau yang lain." Nimbus akhirnya menggunakan keduanya: RDS untuk riwayat pesanan dan catatan keuangan (terstruktur, relasional, membutuhkan pelaporan), DynamoDB untuk menu (skema fleksibel, volume baca tinggi, akses berdasarkan ID restoran).

## Database yang Tepat untuk Beban Kerja yang Tepat

Lompat maju enam bulan — jauh setelah migrasi DynamoDB telah mapan — dan Nimbus memiliki tiga proyek baru di papan. Maya memandu tim melalui semuanya pada suatu Selasa pagi.

"Pertama: sebuah mesin rekomendasi. Kita ingin menunjukkan kepada pelanggan hidangan yang kemungkinan akan mereka pesan berdasarkan riwayat mereka dan apa yang dipesan orang dengan selera serupa. Kedua: kita memindahkan data menu untuk mendukung konten yang lebih kaya — dokumen menu lengkap dalam JSON, struktur berbeda per restoran, skema fleksibel. Ketiga: kita akan menyelesaikan akuisisi Barato, dan tim data mereka menjalankan klaster Cassandra untuk data perilaku pelanggan. Mereka ingin membawanya ke AWS tanpa menulis ulang pipeline mereka."

Tiga proyek. Tiga persyaratan data yang sangat berbeda. Tidak ada satu pun yang jelas cocok untuk DynamoDB.

"Semua ini membutuhkan database yang berbeda," kata Priya.

"Kita punya DynamoDB," kata Leo.

"Kita punya hak untuk memilih alat yang tepat," kata Priya.

**Amazon DocumentDB: Ketika Beban Kerja Anda Berbicara MongoDB**

Proyek kedua — dokumen menu JSON yang kaya dengan skema fleksibel per restoran — menggambarkan sebuah database dokumen. Nimbus sudah menggunakan skema fleksibel DynamoDB untuk menu, tetapi seiring tim membangun fitur menu yang lebih canggih (modifier bertingkat, harga berbasis waktu, struktur combo kompleks), model kueri DynamoDB mulai menunjukkan batasannya. Tim menginginkan kueri dokumen yang lebih kaya: temukan semua item menu di mana sebuah modifier bertingkat mengandung opsi tertentu, filter berdasarkan bidang sembarang di dalam struktur JSON.

"Itu adalah pola database dokumen," kata Priya. "MongoDB."

"Kita bisa menjalankan MongoDB di EC2," tawar Leo.

"Atau kita bisa menggunakan DocumentDB," kata Priya.

**Amazon DocumentDB** adalah database dokumen terkelola yang kompatibel dengan MongoDB. Ia menyimpan data sebagai dokumen mirip-JSON dengan skema fleksibel — dokumen berbeda dalam koleksi yang sama dapat memiliki bidang yang berbeda. DocumentDB mendukung bahasa kueri, API, dan driver MongoDB. Jika beban kerja Anda saat ini berjalan di MongoDB, DocumentDB berbicara dalam bahasa yang sama. Jalur migrasinya adalah memindahkan sebuah connection string, bukan menulis ulang aplikasi.

DocumentDB sepenuhnya terkelola: tanpa patching, pencadangan otomatis, ketersediaan tinggi Multi-AZ, replika baca, dan penyimpanan yang otomatis bertambah seiring data Anda bertambah.

"Jadi kita memigrasikan menu ke DocumentDB," kata Leo. "Dan kueri yang sudah kita miliki dalam sintaks MongoDB langsung bekerja?"

"Dengan sedikit pengujian kompatibilitas, ya," konfirmasi Priya. "DocumentDB mendukung sebagian besar API kueri MongoDB. Periksa matriks kompatibilitas sebelum mengasumsikan cakupan penuh, tetapi untuk kueri dokumen dan agregasi, itu sederhana."

Sinyal ujian untuk DocumentDB sederhana: **"kompatibel dengan MongoDB"** atau **"document store."** Jika sebuah skenario menyebutkan MongoDB atau data berorientasi dokumen, DocumentDB adalah jawaban AWS yang terkelola.

**Amazon Neptune: Ketika Hubungannya Adalah Datanya**

Mesin rekomendasi adalah masalah yang lebih sulit.

Pertanyaannya bukan "apa yang dipesan pelanggan ini?" — itu adalah pencarian DynamoDB sederhana. Pertanyaannya adalah: "pelanggan mana yang memiliki profil selera serupa dengan pelanggan ini, dan hidangan apa yang disukai pelanggan-pelanggan tersebut yang belum dicoba oleh pelanggan ini?"

Itu adalah masalah graf. Model datanya bukan tabel berisi baris atau koleksi dokumen. Ini adalah jaringan hubungan: pelanggan terhubung ke hidangan (dipesan, dinilai, dilihat), hidangan terhubung ke restoran dan jenis masakan, restoran terhubung ke lingkungan dan kota. Rekomendasinya tidak ada di titik datanya — melainkan di jalur di antara titik-titik tersebut.

"Kita butuh database graf," kata Priya.

**Amazon Neptune** adalah database graf yang sepenuhnya terkelola. Ia mendukung dua model graf: **property graph** (dikueri dengan bahasa traversal Gremlin) dan **RDF** (dikueri dengan SPARQL). Anda memilih berdasarkan tumpukan graf yang sudah ada atau preferensi tim; keduanya berjalan di infrastruktur Neptune yang sama.

Database graf dibangun khusus untuk beban kerja di mana hubungan antar titik data sama pentingnya dengan data itu sendiri: jaringan sosial (siapa terhubung dengan siapa), mesin rekomendasi (apa yang disukai pengguna serupa), deteksi penipuan (transaksi mana yang memiliki pola mencurigakan di seluruh akun), dan knowledge graph (bagaimana konsep saling berhubungan).

Untuk mesin rekomendasi Nimbus: pelanggan dan hidangan menjadi node di Neptune. Peristiwa pesanan menjadi edge. Sebuah traversal Gremlin dapat menemukan, dalam satu kueri, semua hidangan yang dinilai tinggi oleh pelanggan dengan riwayat pesanan serupa, diurutkan berdasarkan kekuatan koneksi — tanpa rantai JOIN kompleks yang akan diperlukan dalam database relasional atau kueri bolak-balik berkali-kali yang akan dibutuhkan dalam DynamoDB.

Sinyal ujian untuk Neptune: **"jaringan sosial," "mesin rekomendasi," "knowledge graph," "deteksi penipuan,"** atau **"graph traversal."** Jika sebuah skenario menggambarkan data di mana koneksinya sama pentingnya dengan datanya sendiri, Neptune adalah jawabannya.

**Amazon Keyspaces: Cassandra Tanpa Operasi**

Akuisisi Barato membawa sebuah klaster Cassandra ke dalam gambaran. Cassandra adalah database NoSQL wide-column — dirancang untuk throughput penulisan yang sangat tinggi dan skalabilitas horizontal, biasanya digunakan untuk data time-series, log aktivitas pengguna, dan telemetri IoT. Tim data Barato menggunakannya untuk melacak perilaku pelanggan: item mana yang dilihat, mana yang ditambahkan ke keranjang, mana yang diabaikan.

Memigrasikan Cassandra ke AWS memiliki dua opsi: menjalankannya di EC2 (overhead operasional dari mengelola klaster, peningkatan, penskalaan) atau menggunakan opsi terkelola.

"Amazon Keyspaces," kata Priya.

**Amazon Keyspaces** adalah database terkelola tanpa server (serverless) yang kompatibel dengan Cassandra. Ia mendukung Cassandra Query Language (CQL) — bahasa kueri yang sama yang sudah digunakan pipeline Barato. Seperti DocumentDB untuk MongoDB, Keyspaces adalah jalur terkelola: pertahankan kode aplikasi apa adanya, arahkan ke sebuah endpoint Keyspaces alih-alih klaster yang dikelola sendiri, dan biarkan AWS menangani infrastrukturnya.

Keyspaces menskalakan secara otomatis dengan lalu lintas, tidak memerlukan perencanaan kapasitas, dan serverless — Anda membayar untuk pembacaan dan penulisan yang benar-benar Anda lakukan. Untuk data pelacakan perilaku Barato, ini adalah model yang tepat: volume yang sangat bervariasi (jam sibuk makan malam vs jam 3 pagi), skema wide-column, throughput penulisan tinggi.

Sinyal ujian: **"kompatibel dengan Cassandra," "wide-column," "CQL,"** atau **"beban kerja Cassandra."**

**Memilih Database yang Tepat: Tabel Referensi**

Pada titik ini dalam cerita, lanskap database Nimbus terlihat sama sekali berbeda dengan yang ada di bab tujuh. Alat yang tepat untuk setiap beban kerja:

| Frasa Pemicu | Database |
|---|---|
| "Kompatibel dengan MongoDB" atau "document store" | DocumentDB |
| "Hubungan graf," "jaringan sosial," "mesin rekomendasi" | Neptune |
| "Kompatibel dengan Cassandra" atau "wide-column" | Keyspaces |
| "Key-value pada skala apa pun," "latensi satu digit milidetik" | DynamoDB |
| "Relasional + serverless," "SQL auto-scaling" | Aurora Serverless |
| "Data terstruktur, kueri kompleks, pelaporan" | RDS (PostgreSQL, MySQL) |

"Apakah ini akan terus bertambah?" tanya Leo, melihat daftar itu.

"Ya," kata Maya. "Karena masalah yang berbeda memiliki bentuk yang berbeda. Dan menggunakan bentuk yang salah akan menghabiskan kinerja, waktu developer, atau keduanya."

"Pertanyaan yang tepat bukanlah 'database apa yang harus kita gunakan,'" tambah Priya. "Melainkan 'apa bentuk data kita, dan bagaimana kita akan mengaksesnya?' Database mengikuti dari jawabannya."

Itu adalah hal terpenting yang ia katakan tentang database dalam dua tahun.

## Kekuatan dan Batasan

**Mengapa DynamoDB itu kuat**:

- Latensi satu digit milidetik pada skala apa pun
- Dikelola sepenuhnya — tanpa patching, tanpa pengaturan replikasi, tanpa jendela pemeliharaan
- Replikasi multi-AZ otomatis (daya tahan dibangun di dalam)
- Penskalaan on-demand berarti tanpa perencanaan kapasitas
- Integrasi native dengan Lambda, API Gateway, Streams
- Point-in-time recovery (mirip dengan pencadangan otomatis RDS)
- DynamoDB Streams — tangkap setiap perubahan sebagai peristiwa (berguna untuk pemrosesan real-time)

**Di mana DynamoDB menjadi rumit**:

- Desain pola akses tidak dapat dinegosiasikan — kesalahan mahal untuk dibatalkan
- Kueri kompleks membutuhkan indeks sekunder (menambah biaya dan kompleksitas)
- Scan itu mahal — hindari di produksi
- "Batas ukuran item" adalah 400KB — item besar membutuhkan penyimpanan yang berbeda
- Harga bisa mengejutkan Anda jika Anda tidak memahami biaya unit baca/tulis
- Hot partition adalah pembunuh diam-diam — tidak ada kesalahan sampai pembatasan dimulai

## Ringkasan

Perancangan ulang skema membutuhkan dua hari dan banyak ruang papan tulis. Memilih database NoSQL bukan hanya keputusan teknis — itu mengubah cara Anda berpikir tentang data sepenuhnya. Tetapi hasilnya adalah tabel menu yang dapat tumbuh ke ukuran berapa pun tanpa melambat. Sama pentingnya: tim belajar di mana batas-batas DynamoDB berada, dan database khusus mana yang perlu digunakan ketika masalahnya berubah bentuk.

- DynamoDB adalah layanan database NoSQL terkelola AWS. Item adalah dokumen fleksibel — tanpa skema tetap. Setiap item harus memiliki **kunci utama**: kunci partisi saja, atau kunci partisi + kunci urut. Pilih kunci partisi untuk distribusi merata — hot partition menyebabkan pembatasan.
- Kapasitas **on-demand** menskalakan secara otomatis; kapasitas **provisioned** lebih murah untuk lalu lintas yang dapat diprediksi. Bacaan yang **konsisten pada akhirnya** lebih murah; bacaan yang **konsisten kuat** selalu terkini tetapi tidak tersedia pada GSI.
- **DynamoDB Streams** menangkap perubahan tingkat item secara real-time — gunakan untuk mendorong pembatalan cache, pembaruan indeks pencarian, dan pipeline analitik.
- DynamoDB adalah pilihan yang salah untuk pelaporan, join kompleks, dan kueri ad-hoc — gunakan RDS untuk itu.
- **DocumentDB** (kompatibel dengan MongoDB), **Neptune** (database graf), dan **Keyspaces** (kompatibel dengan Cassandra) adalah alternatif terkelola AWS untuk beban kerja yang tidak cocok dengan model key-value DynamoDB.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.3)*

- Ketahui aturan kunci partisi: **kardinalitas tinggi, distribusi merata**. Hot partition adalah jebakan ujian yang umum.
- **On-demand vs provisioned**: on-demand untuk lalu lintas yang tidak terduga; provisioned (dengan Auto Scaling) untuk beban kerja yang dapat diprediksi.
- **DynamoDB Streams**: menangkap perubahan tingkat item secara real-time. Skenario ujian umum: "picu fungsi Lambda saat sebuah catatan berubah."
- **Global Tables**: replikasi multi-Region, multi-active untuk aplikasi yang didistribusikan secara global dan skenario pemulihan bencana. Pada ujian, ini adalah sinyal kuat ketika beban kerja membutuhkan baca dan tulis lokal di lebih dari satu Region.
- **DynamoDB TTL (Time to Live)**: setel atribut timestamp kedaluwarsa pada item dan DynamoDB menghapusnya secara otomatis setelah kedaluwarsa — **tanpa biaya**, tanpa mengonsumsi kapasitas tulis. Pemicu ujian: "data sesi/item sementara harus dihapus secara otomatis setelah N jam dengan biaya terendah" → TTL, jangan pernah scan Lambda terjadwal. Item yang kedaluwarsa juga dapat mengalir ke DynamoDB Streams untuk pengarsipan.
- **DAX (DynamoDB Accelerator)**: lapisan caching dalam memori untuk DynamoDB. Mengurangi latensi baca dari milidetik ke mikrodetik. Ujian menggunakan ini ketika replika baca RDS tidak membantu (karena ini adalah cache khusus DynamoDB).
- **Kunci utama komposit**: kunci partisi + kunci urut memungkinkan kueri fleksibel dalam satu partisi. Contoh: ambil semua pesanan untuk seorang pelanggan antara dua tanggal — `customerId` adalah kunci partisi, `orderDate` adalah kunci urut.
- **GSI vs LSI**: GSI dapat ditambahkan setelah pembuatan tabel; LSI tidak bisa. LSI mendukung bacaan konsisten kuat; GSI tidak. LSI berbagi kapasitas tabel; GSI memiliki kapasitasnya sendiri.
- Ketahui kapan *tidak* menggunakan DynamoDB: join kompleks, pelaporan ad-hoc, transaksi multi-entitas → RDS biasanya jawabannya.
- **Pemilihan database yang dibangun khusus** — ujian sering menyajikan sebuah skenario dan menanyakan database mana yang cocok. Gunakan ini sebagai referensi cepat Anda: "kompatibel dengan MongoDB" → DocumentDB. "Graf/jaringan sosial/mesin rekomendasi/knowledge graph" → Neptune. "Kompatibel dengan Cassandra/wide-column" → Keyspaces. "Key-value pada skala apa pun/latensi milidetik" → DynamoDB. "Relasional/kueri kompleks/pelaporan" → RDS atau Aurora.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara kunci partisi dan kunci urut. Kapan Anda akan menggunakan keduanya?

*(Petunjuk: Pikirkan tentang menu Nimbus — mengapa memiliki restaurantId sebagai kunci partisi dan itemId sebagai kunci urut membuat pengambilan menu lengkap restoran menjadi efisien?)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan game global menyimpan profil pemain di DynamoDB. Setiap profil mencakup bidang seperti nama pengguna, level, pencapaian, dan inventaris. Beberapa pemain memiliki 10 item inventaris; yang lain memiliki beberapa ratus — profil bervariasi dalam bentuk tetapi masing-masing tetap nyaman di bawah batas ukuran item DynamoDB 400KB. Perusahaan membutuhkan latensi baca satu digit milidetik untuk pencarian profil selama permainan aktif.

Pendekatan desain mana yang PALING mendukung persyaratan ini?

A) Gunakan DynamoDB dengan `playerId` sebagai kunci partisi dan simpan seluruh profil sebagai satu item  
B) Migrasikan ke RDS Aurora dengan replika baca di setiap region  
C) Gunakan DynamoDB dengan `level` sebagai kunci partisi untuk mengelompokkan pemain dengan keterampilan serupa  
D) Gunakan ElastiCache di depan RDS untuk mencapai latensi sub-milidetik

**Petunjuk 1**: Pola aksesnya adalah "cari pemain tertentu berdasarkan ID." Kunci mana yang membuat itu efisien?

**Petunjuk 2**: Satu opsi menciptakan hot partition yang buruk. Atribut mana yang memiliki kardinalitas yang sangat rendah?

**Petunjuk 3**: DynamoDB sudah menyediakan latensi satu digit milidetik secara native.

**Jawaban**: A

**Penjelasan**: Menggunakan `playerId` sebagai kunci partisi mendistribusikan data secara merata di seluruh partisi dan memungkinkan pencarian instan berdasarkan ID pemain — tepatnya pola akses yang dijelaskan. Model dokumen fleksibel DynamoDB menangani ukuran inventaris yang bervariasi tanpa perubahan skema.

**Mengapa tidak B?** RDS Aurora dengan replika baca menambah kompleksitas dan tetap bukan pilihan pertama alami untuk jenis pencarian profil berbasis kunci pada skala permainan.

**Mengapa tidak C?** Menggunakan `level` sebagai kunci partisi menciptakan hot partition yang parah — sebagian besar lalu lintas menuju level 1 (pemain baru) atau level maksimum (veteran aktif), meninggalkan partisi lain tidak aktif.

**Mengapa tidak D?** Pertanyaan ini menjelaskan DynamoDB, bukan RDS. Menambahkan ElastiCache di depan RDS memperkenalkan dua layanan baru ketika DynamoDB saja sudah menyelesaikan masalah.

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi — Tugas 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus menambahkan fitur "favorit": pelanggan dapat menyimpan item menu favorit mereka dan memesan ulang dengan satu ketukan.

Rancang tabel DynamoDB untuk fitur ini. Apa kunci partisinya? Apakah Anda akan menggunakan kunci urut? Bagaimana struktur itemnya?

Lalu pertimbangkan: apa yang terjadi jika Anda perlu menampilkan "100 item paling banyak difavoritkan di seluruh pelanggan"? Bisakah DynamoDB menjawabnya secara efisien? Jika tidak, apa yang akan Anda tambahkan ke arsitektur?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih merancang untuk pola akses.)*

## Adegan Pasca-Kredit

"Aku sudah men-deploy-nya — oh." Leo telah menjalankan migrasi menu ke DynamoDB pada Kamis malam tanpa memberi tahu siapa pun. Itu berhasil. Pembacaannya cepat. Skemanya fleksibel. Mitra restoran dapat menambahkan bidang modifier apa pun yang mereka inginkan. Tetapi ia lupa memperbarui dasbor pemantauan, dan Priya menghabiskan dua puluh menit Jumat pagi bertanya-tanya mengapa metrik database menjadi datar.

Ia merasa baik tentang dirinya sendiri pula.

Lalu Priya, setelah dasbor dipulihkan, melihat metriknya.

"Leo," katanya, "setiap pemuatan halaman membuat empat puluh tujuh permintaan DynamoDB."

"Satu per restoran yang ditampilkan," konfirmasi Leo. "Halaman penelusuran memuat empat puluh tujuh restoran terdekat untuk lokasi pelanggan."

"Dan setiap permintaan tersebut membutuhkan sekitar empat milidetik."

Leo melakukan perhitungannya. Empat puluh tujuh dikali empat. "Itu... seratus delapan puluh delapan milidetik hanya untuk menu. Sebelum dirender."

"Pada setiap pemuatan halaman."

"Untuk setiap pelanggan."

Ia menatap layar.

"Kita butuh cache," katanya.

Di bab berikutnya: lapisan antara aplikasi Nimbus dan database-nya yang membuat kueri lambat menjadi cepat.
