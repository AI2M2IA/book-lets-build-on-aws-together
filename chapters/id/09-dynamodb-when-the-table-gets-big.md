# Bab 9: Ketika Tabelnya Semakin Besar

Tabel menu memiliki 50.000 item.

Ini mencakup 287 restoran, masing-masing dengan menu spesial harian, item musiman, dan variasi regional. Beberapa item memiliki modifikasi — ukuran, tingkat kepedasan, pilihan protein. Beberapa memiliki penawaran combo yang merujuk ke item lain. Beberapa muncul di menu hanya pada hari kerja, atau hanya saat makan siang, atau hanya di kota-kota tertentu.

Kueri SQL yang mengambil menu lengkap sebuah restoran sebelumnya hanya membutuhkan waktu 200 milidetik untuk dikembalikan.

Sekarang membutuhkan waktu empat detik.

Empat detik adalah perbedaan antara seseorang yang melakukan pemesanan dan seseorang yang menutup aplikasi. Leo telah menjalankan rencana kueri. Tom telah melihat konfigurasi indeks. Priya telah meningkatkan jumlah replika baca. Tidak ada dari itu membuat perbedaan yang berarti.

Dan itu mengubah suasana di ruangan itu.

Ketika sebuah masalah bertahan setelah pengindeksan, upaya caching, dan satu replika tambahan, orang berhenti berasumsi bahwa perbaikan itu akan cerdas.

Terkadang solusinya adalah bentuk sistem yang salah.

"Masalahnya," kata Leo, "adalah bentuk data. SQL menginginkan semuanya dalam baris dan kolom. Menu kami tidak memiliki bentuk yang tetap."

Itulah awal dari percakapan yang lebih panjang.

**Masalah dengan Memasukkan Semuanya ke dalam Tabel**

Berikut adalah ketegangan inti dari database relasional: mereka dirancang untuk menyimpan *data terstruktur* dalam *bentuk tetap*.

Jika setiap item menu memiliki bidang yang sama — nama, harga, deskripsi, kategori — SQL akan sempurna. Anda akan memiliki tabel `menu_items` yang bersih, baris untuk setiap item, dan kueri yang masuk akal.

Tetapi menu sungguhan tidak bekerja seperti itu.

Satu item mungkin memiliki modifikasi "tingkat kepedasan". Item lain mungkin memiliki "pilihan protein". Item ketiga mungkin memiliki combo yang tertanam — "pesan makanan keluarga dan Anda mendapatkan dua hidangan utama, dua lauk, dan minuman." Struktur data bervariasi *per item*.

Dalam SQL, Anda memiliki dua opsi:

**Opsi 1**: Buat kolom untuk setiap kemungkinan modifikasi. Ini menghasilkan tabel yang sangat lebar di mana sebagian besar kolom kosong sebagian besar waktu.

**Opsi 2**: Buat tabel modifikasi terpisah dan gabungkan dengan tabel menu item. Ini berfungsi, tetapi menu yang kompleks memerlukan banyak gabungan, dan pada 50.000 item dengan volume baca tinggi, gabungan ini menjadi mahal.

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

Berikut adalah terjemahan Markdown dari buku AWS pemula:

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

Berikut terjemahan Markdown tersebut ke dalam Bahasa Indonesia yang lancar:

Berbagai Bentuk. Koleksi yang Sama. Tidak Masalah.

"Jadi, database ini lebih seperti sistem berkas daripada tabel," kata Maya.

"Tepat sekali," kata Priya. "Anda bisa meletakkan dokumen apa saja di laci mana saja. Anda tidak perlu memotong dokumen agar sesuai dengan ukuran tetap."

**Perkenalkan DynamoDB**

Amazon DynamoDB adalah layanan database NoSQL terkelola AWS. Layanan ini menyimpan data sebagai item (bukan baris), dan item dikumpulkan ke dalam tabel (penamaannya mirip dengan SQL, tetapi perilakunya berbeda).

Setiap item dalam tabel DynamoDB harus memiliki **kunci utama** (primary key), yang secara unik mengidentifikasinya. Segala sesuatu yang lain bersifat fleksibel.

Kunci utama dapat berbentuk dua cara:

**Hanya Kunci Partisi**: Satu atribut yang harus unik di seluruh item.

**Kunci Partisi + Kunci Urut (Kunci Utama Komposit)**: Dua atribut yang *bersama-sama* membentuk kombinasi unik. Ini memungkinkan Anda memiliki beberapa item dengan kunci partisi yang sama, yang dipisahkan oleh kunci urut mereka.

Untuk menu Nimbus:

- Kunci Partisi: `restaurantId`
- Kunci Urut: `itemId`

Ini berarti Anda dapat mengambil semua item untuk restoran tertentu secara efisien — DynamoDB tahu persis partisi mana yang harus dicari.

"Mengapa ini disebut kunci partisi?" tanya Tom.

**Bagaimana DynamoDB Menyimpan Data Secara Internal**

DynamoDB dibangun untuk menskalakan secara horizontal ke ukuran yang sangat besar. Ini dicapai melalui *partisi* — data dibagi di antara banyak mesin fisik berdasarkan kunci partisi.

Saat Anda menulis item, DynamoDB melakukan hashing pada nilai kunci partisi dan menggunakan hash tersebut untuk menentukan partisi fisik (dan oleh karena itu server) mana yang menyimpan item. Saat Anda membaca item, DynamoDB melakukan perhitungan yang sama untuk menemukannya secara instan.

Bayangkan seperti sistem pos. Jika setiap amplop memiliki kode pos, layanan pos tidak membaca setiap amplop untuk mencari tahu ke mana ia milik — ia mengurutkannya berdasarkan kode pos. DynamoDB mengurutkan berdasarkan hash kunci partisi.

Inilah mengapa memilih kunci partisi yang baik itu penting:

- **Baik**: Kardinalitas tinggi, nilai yang didistribusikan secara merata (`restaurantId` dengan banyak restoran)
- **Buruk**: Kardinalitas rendah (`true/false`, `category`) — sebagian besar data berakhir di beberapa partisi, menciptakan "hot spot"

Hot spot berarti satu partisi menerima sebagian besar lalu lintas. Partisi tersebut menjadi kemacetan. DynamoDB mulai membatasi permintaan. Pengguna mulai melihat kesalahan.

"Jadi jika saya menggunakan `available: true` sebagai kunci partisi," kata Leo perlahan, "semua item yang tersedia akan menumpuk di partisi yang sama."

"Dan database Anda akan meleleh saat jam makan malam," konfirmasi Priya.

Leo menutup laptopnya perlahan.

**Membaca dan Menulis dalam Skala**

DynamoDB dapat menangani jutaan permintaan per detik. Tetapi ia perlu tahu berapa banyak kapasitas yang harus disediakan.

Ada dua mode kapasitas:

**Kapasitas yang Disediakan**: Anda menentukan berapa banyak unit baca dan tulis yang Anda inginkan. DynamoDB memesan kapasitas ini untuk Anda dan membatasi lalu lintas yang melebihi batasnya. Biaya yang dapat diprediksi, harga per permintaan lebih rendah.

**Kapasitas On-Demand**: DynamoDB secara otomatis menskalakan dengan lalu lintas aktual Anda. Tidak diperlukan perencanaan kapasitas rutin. Biaya per permintaan lebih tinggi, dan operasinya jauh lebih sederhana, meskipun lonjakan yang jauh melampaui pola lalu lintas tabel terbaru masih dapat menyebabkan pembatasan jika mereka meningkat terlalu cepat.

Untuk Nimbus, menu dibaca jauh lebih sering daripada ditulis. Seorang pelanggan membuka aplikasi, menelusuri menu — itu adalah banyak baca. Seorang mitra restoran memperbarui menu mereka dua kali seminggu — itu adalah penulisan sesekali.

"On-demand masuk akal untuk saat ini," kata Tom. "Kita belum tahu pola lalu lintas kita. Lebih baik membayar lebih per permintaan daripada kekurangan penyediaan dan dibatasi."

Kebijaksanaan infrastruktur yang enggan. Dari Tom. Tim tersebut telah secara resmi tumbuh.

**Konsistensi: Seberapa Segar Data Anda?**

DynamoDB mereplikasi data di seluruh Banyak Zona Ketersediaan secara otomatis. Itu bagus untuk daya tahan, tetapi juga berarti Anda perlu berpikir dengan jelas tentang konsistensi baca.

Saat Anda membaca dari DynamoDB, Anda memiliki pilihan:

**Bacaan yang Akhirnya Konsisten**: Ini adalah default. Ini lebih murah, dan hasilnya mungkin sedikit tertinggal dari penulisan yang baru diselesaikan.

**Bacaan yang Konsisten Secara Kuat**: Untuk baca terhadap tabel atau indeks sekunder lokal, DynamoDB dapat mengembalikan nilai terbaru yang dikomit dari penulisan yang berhasil sebelumnya. Ini membutuhkan kapasitas baca yang lebih mahal dan tidak tersedia untuk indeks sekunder global.

Untuk data menu, konsistensi yang akhirnya baik-baik saja. Item menu yang sedikit ketinggalan beberapa milidetik tidak masalah.

Untuk data konfirmasi pesanan — "apakah pesanan ini telah ditempatkan?" — Anda ingin konsistensi yang kuat. Pelanggan tidak boleh melihat pesan "coba lagi" ketika pesanan mereka baru saja disimpan.

"Ini seperti perbedaan antara memeriksa saldo bank Anda di aplikasi versus menelepon bank secara langsung," kata Maya. "Aplikasi mungkin 30 detik tertinggal. Panggilan telepon selalu saat ini."

**Kompromi: Apa yang Tidak Bisa Dilakukan DynamoDB**

NoSQL tidak secara ketat lebih baik daripada SQL. Ini adalah alat yang berbeda untuk pekerjaan yang berbeda.

Apa yang menyerahkan DynamoDB:

**Kueri yang Fleksibel**: Dalam SQL, Anda dapat memfilter dan mengurutkan berdasarkan kolom apa saja. Dalam DynamoDB, Anda hanya dapat mengkueri secara efisien berdasarkan kunci utama. Kueri berdasarkan bidang arbitrer memerlukan *scan* (membaca setiap item dalam tabel), yang mahal dan lambat pada skala.

**Gabung**: DynamoDB tidak melakukan join. Jika Anda membutuhkan data dari dua tabel, Anda melakukan dua pembacaan terpisah dalam kode aplikasi Anda.

**Transaksi**: DynamoDB mendukung transaksi, tetapi database relasional masih merupakan kesesuaian yang lebih alami untuk banyak alur kerja multi-entitas, sistem berbasis pelaporan, dan desain berbasis join.

**Keterbiasan**: Puluhan tahun alat SQL, keterampilan, dan model mental tidak mentransfer secara langsung.

DynamoDB yang unggul dalam hal:

- Pola akses nilai kunci dan dokumen
- Skala besar (latensi satu digit milidetik pada ukuran apa pun)
- Serverless, tanpa manajemen infrastruktur
- Penskalaan otomatis, replikasi multi-AZ, cadangan
- Kinerja yang dapat diprediksi terlepas dari volume data

"Jadi aturannya," kata Maya, "gunakan DynamoDB ketika Anda *tahu persis* bagaimana Anda akan mengakses data. Gunakan SQL ketika Anda belum tahu."

Priya mengangguk. "Rancang pola akses Anda terlebih dahulu. Kemudian pilih database Anda."

Ini adalah salah satu hal paling senior yang dapat dihasilkan oleh percakapan database.

**Kapan Menggunakan Masing-masing**

| Situasi                                             | Cari yang Terbaik               |
|-------------------------------------------------------|-------------------------|
| Data terstruktur, kueri kompleks, pelaporan           | RDS (PostgreSQL, MySQL) |
| Bentuk data fleksibel, akses berbasis kunci, skala besar | DynamoDB                |
| Penulisan berat dengan hubungan kompleks                | RDS                     |
| Pembacaan berat dengan pola akses yang dapat diprediksi | DynamoDB                |
| Anda membutuhkan join dan agregat                         | RDS                     |
| Anda membutuhkan latensi milidetik pada jutaan req/sec   | DynamoDB                |
| Transaksi di seluruh entitas                        | RDS (biasanya)           |
| Lalu lintas lonjakan yang tidak terduga / serverless | DynamoDB on-demand      |

Jawaban yang salah adalah selalu "selalu gunakan satu atau yang lain." Nimbus akhirnya menggunakan keduanya: RDS untuk riwayat pesanan dan catatan keuangan (terstruktur, relasional, membutuhkan pelaporan), DynamoDB untuk menu (skema fleksibel, volume baca tinggi, akses berdasarkan ID restoran).

## Kekuatan dan Batasan

**Mengapa DynamoDB itu kuat**:

- Latensi satu digit milidetik pada skala apa pun
- Dikelola sepenuhnya — tidak ada patching, tidak ada pengaturan replikasi, tidak ada jendela pemeliharaan
- Replikasi multi-AZ otomatis (daya tahan dibangun di dalam)
- Penskalaan on-demand berarti tidak ada perencanaan kapasitas
- Integrasi native dengan Lambda, API Gateway, Stream
- Pemulihan titik waktu (mirip dengan cadangan RDS otomatis)
- DynamoDB Stream — tangkap setiap perubahan sebagai peristiwa (berguna untuk pemrosesan waktu nyata)

**Di mana DynamoDB menjadi rumit**:

- Desain pola akses tidak dapat dinegosiasikan — kesalahan mahal untuk dibatalkan
- Kueri kompleks membutuhkan indeks sekunder (menambah biaya dan kompleksitas)
- Pemindaian itu mahal — hindari di produksi
- "Batas ukuran item" adalah 400KB — item besar membutuhkan penyimpanan yang berbeda
- Harga bisa mengejutkan Anda jika Anda tidak memahami biaya unit baca/tulis

## Ringkasan

- DynamoDB adalah layanan database NoSQL yang dikelola oleh AWS.
- Item disimpan sebagai dokumen fleksibel — tidak diperlukan skema tetap yang diperlukan.
- Setiap item harus memiliki **kunci utama**: kunci partisi saja, atau kunci partisi + kunci urutan.
- Kunci partisi menentukan partisi fisik tempat item disimpan. Pilih itu untuk distribusi yang merata.
- **On-demand** kapasitas menskalakan secara otomatis; kapasitas **disediakan** lebih murah jika lalu lintas Anda dapat diprediksi.
- **Bacaan yang konsisten pada akhirnya** lebih murah dan lebih cepat. **Bacaan yang sangat konsisten** selalu saat ini.
- DynamoDB unggul dalam akses berbasis kunci pada skala besar. Ini kesulitan dengan kueri ad-hoc dan join.
- Gunakan RDS untuk data relasional. Gunakan DynamoDB untuk data dokumen/nilai kunci. Gunakan keduanya ketika situasi tersebut menyebutkan.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.3)*

- Ketahui aturan kunci partisi: **tingkat kardinalitas tinggi, distribusi yang merata**. Partisi panas adalah jebakan umum ujian.
- **On-demand vs disediakan**: on-demand untuk lalu lintas yang tidak terduga; disediakan (dengan Auto Scaling) untuk beban kerja yang dapat diprediksi.
- **DynamoDB Stream**: menangkap perubahan item tingkat item secara real-time. Skenario ujian umum: "pemicu fungsi Lambda saat rekaman berubah."
- **Tabel Global**: replikasi multi-wilayah, multi-aktif untuk aplikasi yang didistribusikan secara global dan skenario pemulihan bencana. Pada ujian, ini adalah sinyal kuat ketika beban kerja membutuhkan baca dan tulis lokal di lebih dari satu Wilayah.
- **DAX (DynamoDB Accelerator)**: lapisan caching berbasis memori untuk DynamoDB. Mengurangi latensi baca dari milidetik ke mikrodetik. Penggunaan ujian ini ketika replika baca RDS tidak membantu (karena itu adalah cache khusus DynamoDB).
- **Kunci utama gabungan**: kunci partisi + kunci urutan memungkinkan kueri fleksibel dalam partisi. Contoh: ambil semua pesanan untuk pelanggan antara dua tanggal — `customerId` adalah kunci partisi, `orderDate` adalah kunci urutan.
- Ketahui kapan *tidak* menggunakan DynamoDB: join kompleks, pelaporan ad-hoc, transaksi multi-entitas → RDS biasanya jawabannya.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara kunci partisi dan kunci urutan. Kapan Anda akan menggunakannya?

*(Petunjuk: Pikirkan tentang menu Nimbus — mengapa menggunakan restaurantId sebagai kunci partisi dan itemId sebagai kunci pengurutan membuat pengambilan menu lengkap restoran menjadi efisien?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan game global menyimpan profil pemain di DynamoDB. Setiap profil mencakup bidang seperti nama pengguna, level, pencapaian, dan inventaris. Beberapa pemain memiliki 10 item inventaris; yang lain memiliki 5.000 konfigurasi khusus. Perusahaan tersebut membutuhkan latensi baca satu digit milidetik untuk pencarian profil selama permainan aktif.

Pendekatan desain mana yang PALING mendukung persyaratan ini?

A) Migrasikan ke RDS Aurora dengan replika baca di setiap wilayah
B) Gunakan DynamoDB dengan `playerId` sebagai kunci partisi dan simpan seluruh profil sebagai satu item
C) Gunakan DynamoDB dengan `level` sebagai kunci partisi untuk mengelompokkan pemain dengan keterampilan serupa
D) Gunakan ElastiCache di depan RDS untuk mencapai latensi sub-milidetik

**Petunjuk 1**: Pola aksesnya adalah “cari pemain tertentu berdasarkan ID.” Kunci mana yang membuat itu efisien?

**Petunjuk 2**: Satu opsi menciptakan partisi panas yang buruk. Atribut mana yang memiliki kardinalitas yang sangat rendah?

**Petunjuk 3**: DynamoDB sudah menyediakan latensi satu digit milidetik secara native.

**Jawaban**: B

**Penjelasan**: Menggunakan `playerId` sebagai kunci partisi mendistribusikan data secara merata di seluruh partisi dan memungkinkan pencarian instan berdasarkan ID pemain — tepatnya pola akses yang dijelaskan. Model dokumen fleksibel DynamoDB menangani ukuran inventaris yang bervariasi tanpa perubahan skema.

**Mengapa tidak A?** RDS Aurora dengan replika baca menambahkan kompleksitas dan masih bukan pilihan pertama alami untuk jenis pencarian profil berbasis kunci pada skala permainan.

**Mengapa tidak C?** Menggunakan `level` sebagai kunci partisi menciptakan partisi panas yang parah — sebagian besar lalu lintas menuju level 1 (pemain baru) atau level maksimum (veteran aktif), meninggalkan partisi lain tidak aktif.

**Mengapa tidak D?** Pertanyaan ini menjelaskan DynamoDB, bukan RDS. Menambahkan ElastiCache di depan RDS memperkenalkan dua layanan baru ketika DynamoDB saja sudah menyelesaikan masalah.

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi — Tugas 3.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus menambahkan fitur “favorit”: pelanggan dapat menyimpan item menu favorit mereka dan mengurutkannya dengan satu ketukan.

Rancang tabel DynamoDB untuk fitur ini. Kunci partisi apa yang akan Anda gunakan? Apakah Anda akan menggunakan kunci pengurutan? Bagaimana struktur itemnya?

Kemudian pertimbangkan: apa yang terjadi jika Anda perlu menampilkan “100 item paling banyak disukai di seluruh pelanggan”? Bisakah DynamoDB menjawabnya secara efisien? Jika tidak, apa yang akan Anda tambahkan ke arsitektur?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk berlatih mendesain untuk pola akses.)*

## Adegan Pasca-Kredit

Leo telah memigrasikan menu ke DynamoDB pada akhir minggu. Bacaannya cepat. Skemanya fleksibel. Mitra restoran dapat menambahkan bidang modifier apa pun yang mereka inginkan.

Dia merasa baik tentang dirinya sendiri.

Kemudian Priya melihat dasbor pemantauan.

"Leo," katanya, "setiap pemuatan halaman membuat 47 permintaan DynamoDB."

"Satu per restoran," Leo mengkonfirmasi. "Karena pelanggan berada di halaman lihat semua."

"Dan setiap permintaan tersebut membutuhkan sekitar empat milidetik."

Leo melakukan perhitungannya. 47 kali 4. "Itu... 188 milidetik saja untuk menu. Sebelum dirender."

"Pada setiap pemuatan halaman."

"Untuk setiap pelanggan."

Dia menatap layar.

"Kita membutuhkan cache," katanya.

Di bab berikutnya: lapisan antara aplikasi Nimbus dan basis datanya yang membuat kueri lambat menjadi cepat.
