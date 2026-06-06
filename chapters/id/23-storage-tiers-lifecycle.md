# Bab 23: Sistem Pengarsipan yang Mengatur Dirinya Sendiri

Sebuah firma hukum menyimpan berkas kasus aktif di atas meja. Kasus yang sudah selesai masuk ke lemari arsip. Kasus dari tiga tahun lalu masuk ke kotak penyimpanan di ruang bawah tanah. Kasus dari sepuluh tahun lalu masuk ke fasilitas arsip luar lokasi yang berbiaya beberapa sen per kotak tetapi memakan dua hari untuk mengambil apa pun dari sana.

Informasi yang sama, disimpan dengan biaya berbeda berdasarkan seberapa sering ia diakses.

---

Dengan otomatisasi workflow sudah terpasang dan alur pesanan akhirnya stabil, Tom telah kembali ke tinjauan biayanya. Tagihan S3 telah mengganggu pikirannya sejak kuartal sebelumnya—salah satu item baris yang terus tumbuh tanpa ada yang melihatnya secara langsung. Ia akhirnya punya waktu untuk melihat.

Ia memanggil Leo.

"Kita punya 4,2 terabyte di S3," kata Leo setelah memeriksa.

"Berisi apa?"

"Foto restoran. Tanda terima pesanan. Ekspor analitik. Snapshot backup dari 18 bulan lalu."

"Kapan terakhir kali seseorang mengakses backup dari 18 bulan lalu?"

Leo memeriksa log akses.

"Oktober lalu," katanya. "Sekali. Untuk memverifikasi format backup."

"Jadi kita membayar 18 bulan backup dengan harga S3 Standard penuh."

"Ya."

"Berapa biayanya per bulan—Glacier vs Standard?" tanya Tom, sudah memunculkan halaman harga.

S3 Standard: $0,023 per GB per bulan. S3 Glacier Instant Retrieval: $0,004 per GB per bulan.

Tom menghitung.

"Kita bisa mengurangi tagihan ini secara signifikan," katanya, "hanya dengan memindahkan data lama ke penyimpanan yang lebih murah."

"Kita perlu tahu apa yang lama," kata Leo.

"S3 tahu. Ia melacak waktu akses terakhir."

**Storage Class S3: Spektrum Lengkap**

Bab 5 memperkenalkan S3 Standard sebagai storage class utama. S3 sebenarnya memiliki delapan storage class, masing-masing dirancang untuk pola akses yang berbeda (yang kedelapan, **S3 Express One Zone**, adalah class single-AZ terspesialisasi untuk beban kerja yang kritis-latensi dan jarang muncul di luar skenario performa tinggi):

**S3 Standard**: Untuk data yang sering diakses. Latensi rendah (milidetik). Biaya tertinggi. Tanpa durasi penyimpanan minimum. Gunakan untuk data aktif: foto menu saat ini, pesanan hari ini, log terbaru.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Untuk data yang diakses kurang dari sekali sebulan. Pengambilan milidetik yang sama dengan Standard, tetapi biaya penyimpanan lebih rendah + biaya pengambilan per-GB. Durasi penyimpanan minimum 30 hari. Gunakan untuk data yang Anda butuhkan segera ketika mengaksesnya, tetapi jarang mengaksesnya: tanda terima pesanan lama, ekspor analitik berusia 6 bulan.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Sama dengan S3 Standard-IA (termasuk minimum 30 hari) tetapi disimpan hanya di satu Availability Zone (alih-alih tiga). Kurang tahan lama (jika AZ itu mengalami bencana, data bisa hilang), tetapi 20% lebih murah. Gunakan untuk data yang bisa dibuat ulang jika hilang: cache thumbnail, keluaran pemrosesan sementara.

**S3 Glacier Instant Retrieval**: Data arsip yang sesekali Anda butuhkan. Pengambilan milidetik. Biaya penyimpanan sangat rendah, biaya pengambilan per-GB lebih tinggi. Penyimpanan minimum 90 hari. Gunakan untuk data yang diakses sekali per kuartal atau kurang: laporan kepatuhan triwulanan, snapshot backup berusia 12 bulan.

**S3 Glacier Flexible Retrieval**: Arsip dalam, diambil dalam hitungan menit hingga jam. Biaya lebih rendah daripada Glacier Instant Retrieval. Gunakan untuk data arsip dengan urgensi lebih rendah.

**S3 Glacier Deep Archive**: Opsi biaya terendah. Diambil dalam 12 jam. Penyimpanan minimum 180 hari. Gunakan untuk data yang harus disimpan untuk kepatuhan regulasi tetapi tidak pernah diharapkan untuk diakses: catatan pajak 7 tahun, log audit 10 tahun.

Polanya: seiring frekuensi akses menurun, biaya menurun tetapi waktu pengambilan meningkat (dan biaya per-pengambilan meningkat). Pilih class yang cocok dengan pola akses Anda.

**S3 Lifecycle Policy: Sistem Pengarsipan Otomatis**

Memindahkan file secara manual antar-storage class itu rawan kesalahan dan memakan waktu. **Lifecycle policy** S3 mengotomatiskan ini berdasarkan aturan yang Anda definisikan.

Sebuah lifecycle rule memiliki dua komponen:

**Filter**: Objek mana yang berlaku untuk aturan itu (semua objek, objek dengan prefix tertentu, objek dengan tag tertentu).

**Tindakan**: Apa yang harus dilakukan, setelah berapa hari.

Contoh lifecycle policy untuk tanda terima pesanan Nimbus:

```
Transisikan ke S3 Standard-IA setelah 90 hari
Transisikan ke S3 Glacier Instant Retrieval setelah 365 hari
Transisikan ke S3 Glacier Flexible Retrieval setelah 540 hari (18 bulan)
Transisikan ke S3 Glacier Deep Archive setelah 2555 hari (7 tahun)
Hapus setelah 2920 hari (8 tahun)
```

Satu policy ini memastikan:

- Tanda terima aktif (< 90 hari): S3 Standard, akses cepat
- Tanda terima terbaru (90-365 hari): Standard-IA, murah tetapi langsung tersedia
- Tanda terima lebih lama (1 tahun hingga 18 bulan): Glacier Instant, sangat murah, milidetik saat dibutuhkan
- Tanda terima historis (18 bulan hingga 7 tahun): Glacier Flexible, lebih murah lagi—pengambilan memakan jam, bukan milidetik
- Tanda terima kedaluwarsa (> 8 tahun): Dihapus secara otomatis

Satu jebakan nyaris menggagalkan rencana. Sejak akhir 2024, lifecycle rule **tidak mentransisikan objek yang lebih kecil dari 128 KB secara default**—dan tanda terima Nimbus rata-rata 18 KB masing-masing. Untuk membuat policy benar-benar memindahkannya, Leo harus mengganti ukuran objek minimum default pada aturan (filter lifecycle juga bisa memilih berdasarkan ukuran dengan `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). Default itu ada karena alasan yang baik: class arsip menagih ~40 KB overhead metadata per objek dan setiap transisi berbiaya biaya permintaan, jadi untuk jutaan objek kecil transisi bisa berbiaya lebih dari yang dihematnya. Leo menghitung untuk tanda terima—pada retensi tujuh tahun, ia tetap menguntungkan.

Tom meninjau penghematan yang diproyeksikan: dari $847/bulan menjadi sekitar $220/bulan.

"Hanya dengan... mendefinisikan apa yang lama dan ke mana ia harus pergi?" katanya.

"Dan S3 memindahkannya secara otomatis," Leo memastikan. "Tanpa cron job. Tanpa migrasi manual. Tanpa lupa."

"Tunggu—tapi *mengapa* S3 tidak melakukan ini secara default?" tanya Maya dari seberang ruangan. "Mengapa Anda harus mendefinisikan policy sama sekali?"

"Karena 'lama' berbeda untuk setiap bucket," kata Leo. "Arsip kepatuhan dan unggahan foto membutuhkan aturan retensi yang sama sekali berbeda. S3 tidak bisa menebak mana yang mana."

Anda mungkin bertanya-tanya: apa yang terjadi jika data yang salah dipindahkan ke Glacier dan Anda membutuhkannya dengan mendesak? Anda akan membayar biaya pengambilan dan menunggu—itulah mengapa Anda harus menguji lifecycle rule Anda pada bucket kecil yang non-kritis terlebih dahulu, dan memverifikasi log akses sebelum meluncurkannya ke data produksi. Kesalahan pengambilan pada 18 bulan backup akan berbiaya jauh lebih sedikit daripada insiden yang menghadap pelanggan, tetapi tetap layak diuji terlebih dahulu.

Jika pola akses data Anda dapat diprediksi (log selalu dingin setelah 30 hari), gunakan lifecycle rule eksplisit—mereka lebih hemat biaya daripada biaya pemantauan per-objek Intelligent-Tiering. Jika pola akses Anda berubah dari waktu ke waktu atau sulit diprediksi, gunakan Intelligent-Tiering—tetapi sadari bahwa ia hanya mengabaikan objek yang lebih kecil dari 128 KB: mereka tidak dipantau, tidak ditagih biaya pemantauan, dan tidak pernah meninggalkan tier Frequent Access.

**S3 Intelligent-Tiering: Class yang Mengatur Sendiri**

Bagaimana jika Anda tidak tahu seberapa sering Anda akan mengakses data Anda?

**S3 Intelligent-Tiering** memantau pola akses untuk setiap objek dan secara otomatis memindahkannya antar-tier akses:

- **Tier Frequent Access**: Untuk objek yang diakses baru-baru ini
- **Tier Infrequent Access**: Objek yang tidak diakses selama 30 hari
- **Tier Archive Instant Access**: Objek yang tidak diakses selama 90 hari
- **Tier Archive Access**: Objek yang tidak diakses selama 90-730 hari (opsional)
- **Tier Deep Archive Access**: Objek yang tidak diakses selama 180-730+ hari (opsional)

S3 Intelligent-Tiering menagih biaya pemantauan kecil per objek per bulan ($0,0025 per 1.000 objek), tetapi tanpa biaya pengambilan untuk tier Frequent dan Infrequent.

Gunakan Intelligent-Tiering ketika:

- Pola akses tidak dapat diprediksi atau berubah dari waktu ke waktu
- Anda memiliki campuran data panas dan dingin yang tidak bisa Anda klasifikasikan dengan mudah
- Anda memiliki objek yang lebih besar dari 128KB (objek lebih kecil tidak dipantau atau di-auto-tier sama sekali)

Gunakan storage class eksplisit (dengan lifecycle policy) ketika:

- Pola akses dapat diprediksi
- Anda ingin setiap objek—termasuk yang kecil—benar-benar pindah ke class yang lebih murah
- Objek berukuran kecil (< 128KB)

Catatan tentang file kecil layak ditekankan. Nimbus memiliki 2,3 juta objek tanda terima pesanan di S3—masing-masing adalah file JSON kecil, rata-rata sekitar 18KB. Tom awalnya mempertimbangkan Intelligent-Tiering untuk bucket tanda terima, sampai ia membaca tulisan kecilnya.

Objek yang lebih kecil dari 128KB **tidak dipantau dan tidak di-auto-tier** di Intelligent-Tiering. Mereka tidak membayar biaya pemantauan ($0,0025 per 1.000 objek per bulan)—tetapi mereka juga tidak pernah pindah: mereka duduk di tier Frequent Access, dengan harga setara-Standard, selamanya.

Jadi untuk tanda terima 18KB, Intelligent-Tiering tidak akan berbiaya tambahan apa pun bagi Nimbus—ia hanya tidak akan *melakukan* apa pun. 2,3 juta tanda terima dingin akan terus membayar harga penyimpanan-panas ($0,023/GB) tanpa batas waktu, sementara tier Archive ($0,00099/GB) duduk di luar jangkauan.

"Jadi Intelligent-Tiering dirancang untuk objek besar," kata Maya.

"Atau untuk beban kerja di mana Anda benar-benar tidak tahu pola aksesnya," kata Tom. "Untuk bucket file kecil di mana kita tahu tanda terima panas selama 90 hari dan dingin setelah itu, lifecycle rule eksplisit—dengan override objek-kecil dari tadi—adalah satu-satunya hal yang benar-benar memindahkannya."

Intelligent-Tiering adalah layanan yang sangat baik. Ia hanya bukan alat yang tepat untuk setiap bucket: di bawah ambang 128KB ia tidak berbahaya tetapi tidak berguna, dan hanya lifecycle rule eksplisit (dengan override ukuran) yang akan men-tier objek kecil.

**Ketika Anda Benar-Benar Membutuhkan Data Kembali: Sebuah Kisah Pengambilan Glacier**

Tiga bulan setelah lifecycle policy di-deploy, Nimbus menerima pemberitahuan hukum. Seorang mantan mitra restoran menyengketakan sebuah ketentuan kontrak, dan pengacara Nimbus membutuhkan 18 bulan catatan pesanan untuk mitra itu—segalanya dari pembukaan hingga penghentian kontrak.

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui proses penemuan hukum?" kata Priya. Ia tidak bercanda. "Pengacara yang meminta ekspor data massal adalah vektor rekayasa sosial yang umum. Verifikasi permintaan itu sah sebelum membuka penyimpanan data apa pun."

Permintaan itu sah. Catatannya ada di S3, di tiga storage class: 90 hari terbaru di Standard-IA, tahun sebelumnya di Glacier Instant Retrieval, sisanya di Glacier Flexible Retrieval (lifecycle policy telah menggunakan Flexible untuk data berusia lebih dari 18 bulan).

Catatan Glacier Instant langsung tersedia. Leo memfilter berdasarkan ID restoran, menjalankan kueri Athena untuk mengidentifikasi catatan pesanan yang cocok, dan mengekspornya ke lokasi S3 yang aman. Lima menit kerja.

Catatan Glacier Flexible membutuhkan permintaan restore:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

**Tier Standard** Glacier Flexible Retrieval: 3-5 jam. Catatan akan tersedia sebagai salinan sementara di S3 Standard selama 7 hari, lalu dihapus secara otomatis. Salinan arsip asli tetap di Glacier.

Biaya seluruh pengambilan: $0,01 per GB yang diambil pada tier Standard, untuk 4,2 GB catatan arsip. Sekitar empat sen. (Tier Expedited—1 hingga 5 menit—berbiaya $0,03 per GB, tetapi ketersediaannya tidak dijamin seperti Standard.)

"Empat sen," kata Maya, ketika Leo melapor balik. "Untuk 18 bulan catatan."

"Kita menyimpan 4,2GB pada $0,0036 per GB per bulan selama satu setengah tahun," kata Leo. "Biaya penyimpanan totalnya sekitar dua puluh tujuh sen. Biaya pengambilannya empat. Versus satu dolar tujuh puluh empat sen jika kita menyimpannya di S3 Standard selama 18 bulan."

"Dan satu-satunya yang penting," kata Priya, "adalah bahwa kita ingat ia ada di Flexible Retrieval dan merencanakan penantian 3-5 jam. Jika pengacara membutuhkan ini dalam 30 menit, kita akan punya masalah."

Inilah pelajaran operasional penting tentang Glacier: ini bukan sekadar keputusan biaya, ini adalah keputusan SLA pengambilan. Sebelum mengarsipkan data ke Glacier Flexible atau Deep Archive, dokumentasikan waktu pengambilan untuk siapa pun yang mungkin membutuhkannya. "Data itu ada" dan "kita bisa mendapatkannya dalam 30 menit" adalah dua jaminan yang berbeda.

**Multipart Upload: Untuk Objek Besar**

S3 memiliki batas unggahan tunggal 5GB. Untuk objek yang lebih besar, Anda harus menggunakan **multipart upload**: membagi objek menjadi beberapa bagian, mengunggah masing-masing secara paralel, dan S3 merakitnya.

Manfaat:

- Unggahan lebih cepat (paralel)
- Bisa melanjutkan unggahan yang gagal (hanya mengunggah ulang bagian yang gagal)
- Diperlukan untuk objek > 5GB

Tips lifecycle rule: Setel sebuah lifecycle rule untuk menghapus multipart upload yang tidak lengkap setelah 7 hari. Jika sebuah unggahan gagal di tengah jalan dan tidak dibersihkan, bagian-bagian parsial itu disimpan dan ditagih—tanpa objek yang dirakit sebagai hasilnya.

Tom menghargai tips ini luar biasa.

Ia menjalankan perintah AWS CLI untuk membuat daftar multipart upload yang tidak lengkap di semua bucket Nimbus:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Keluarannya lebih panjang dari yang ia harapkan. Ia menyalurkannya ke penghitung.

340 unggahan tidak lengkap. Yang tertua dari 8 bulan lalu—uji beban Leo terhadap alur unggahan foto restoran. Uji beban telah menghasilkan ratusan unggahan parsial, tidak satu pun yang diselesaikan (tes tidak dirancang untuk menyelesaikannya, hanya untuk menguji endpoint inisiasi). 340 unggahan tidak lengkap, duduk di S3, masing-masing mewakili data parsial yang disimpan dan ditagih AWS.

"Berapa biayanya per bulan?" kata Tom. Ia tidak meminta informasi. Ia sedang menghitung dengan keras.

Ukuran gabungan bagian-bagian yang tidak lengkap: 48 GB. Pada $0,023/GB: $1,10/bulan. Selama delapan bulan: $8,80 sudah dikeluarkan.

Pada laju pertumbuhan saat ini, jika tidak dibersihkan: berlanjut tanpa batas waktu.

"Leo," kata Tom.

"Saya sudah men-deploy-nya—oh," kata Leo, mendekat. "Uji beban. Saya lupa membersihkan unggahan parsial."

"Delapan bulan lalu."

"Saya tidak tahu S3 menyimpan bagian-bagiannya bahkan jika unggahan tidak pernah selesai."

"Ia menyimpannya. Ia menagihnya. Dan tidak ada dasbor yang memperingatkan Anda tentangnya. Mereka hanya menumpuk."

Solusinya: sebuah lifecycle rule untuk menghapus bagian multipart upload yang tidak lengkap setelah 7 hari.

```
Aturan: Hapus bagian multipart upload yang tidak lengkap
Prefix: (semua objek)
Tindakan: Hapus multipart upload yang tidak lengkap setelah 7 hari
```

340 unggahan yang ada dibersihkan secara manual. Lifecycle rule memastikan tidak ada uji beban atau unggahan gagal di masa depan yang menumpuk dengan cara yang sama. $1,10/bulan yang diam-diam menumpuk selama delapan bulan berhenti—kecil dalam dolar, tetapi polanya (tak terlihat, tumbuh, tak terbatas) adalah bagian yang layak dihentikan.

"Aturannya tiga baris," kata Tom. "Saya seharusnya mengaturnya di setiap bucket saat pembuatan." Ia memperbarui daftar periksa pembuatan bucket: setiap bucket S3 baru mendapat aturan pembersihan multipart upload secara default.

**Tiga Lapisan Keamanan: Rekap Cepat Sebelum Detour**

"Dan bagaimana jika seseorang mencoba menerobos masuk dan menghapus log audit?" tanya Priya lagi—kali ini dalam konteks model ancaman yang spesifik. "Bukan sekadar lifecycle rule yang salah dikonfigurasi. Orang dalam yang jahat. API key IAM yang disusupi dengan akses tulis."

Tim sudah punya jawabannya—mereka hanya belum menerapkannya ke bucket ini. Tiga lapisan, masing-masing dibahas sebelumnya di buku, masing-masing mengatasi vektor ancaman yang berbeda:

**Versioning** (bab 5) membuat penghapusan dapat dibalik—sebuah DELETE menjadi delete marker, dan versi sebelumnya tetap dapat dipulihkan. Untuk data tulis-sekali seperti tanda terima pesanan, overhead penyimpanannya minimal: hanya pernah ada satu versi per objek.

**S3 Object Lock** (bab 5) membuat objek benar-benar imutabel—penyimpanan WORM yang bahkan API key admin tidak bisa menghapusnya selama periode retensi. Untuk tanda terima, dengan persyaratan retensi pajak 7 tahun mereka, tim memilih mode Compliance: tidak ada salah konfigurasi lifecycle, tidak ada kesalahan IAM, tidak ada kredensial yang disusupi yang bisa menghapusnya sebelum auditor meminta. Dan Object Lock berdampingan dengan transisi lifecycle—aturan yang memindahkan tanda terima ke Glacier Deep Archive tetap bekerja; data menjadi lebih murah dan tetap imutabel.

**CloudTrail S3 data events** (bab 16-17) memberi tahu Anda apa yang terjadi pada data: setiap GET, PUT, DELETE, dan COPY dicatat dengan siapa, dari mana, dan kapan—bahan mentah yang digunakan GuardDuty (bab 17) untuk memperingatkan tentang anomali.

"Versioning untuk pemulihan kecelakaan. Object Lock untuk imutabilitas kepatuhan. CloudTrail untuk forensik," Priya merangkum. "Kita membahas masing-masing secara terpisah. Keputusan baru hari ini adalah mengaktifkan ketiganya untuk bucket ini."

**Cross-Region Replication: Catatan Pesanan sebagai Pemulihan Bencana**

Bucket tanda terima pesanan Nimbus ada di us-west-2. Itu disengaja—us-west-2 adalah tempat aplikasi berjalan. Tetapi "aplikasi ada di us-west-2" dan "semua catatan pesanan hanya ada di us-west-2" adalah profil risiko yang berbeda.

Jika Nimbus perlu mengaktifkan situs pemulihan bencana di us-east-1, catatan pesanan perlu ada di sana juga. Menunggu untuk menyalinnya di tengah kegagalan regional bukanlah rencana pemulihan.

Priya merekomendasikan **Cross-Region Replication (CRR)** untuk bucket tanda terima pesanan. Aturannya:

```
Sumber: nimbus-order-receipts (us-west-2)
Tujuan: nimbus-order-receipts-dr (us-east-1)
Replikasi: Semua objek
Storage class di tujuan: S3 Standard-IA (lebih murah — ini salinan DR, jarang diakses)
```

Mekanismenya sudah familiar dari bab 5: replikasi asinkron dari penulisan baru (sebagian besar objek dalam 15 menit; SLA yang dijamin membutuhkan membayar **S3 Replication Time Control**), versioning diperlukan di kedua bucket, peran IAM dengan izin baca-sumber/tulis-tujuan. Detail yang layak diperhatikan dalam aturan di atas: tujuan menggunakan *storage class yang berbeda* dari sumber—Standard-IA untuk salinan DR, alih-alih membayar salinan Standard kedua yang jarang dibaca. Dan prasyarat versioning tidak berbiaya tambahan apa pun—mereka sudah mengaktifkan versioning untuk pemulihan kecelakaan. (Saudara dari CRR, **Same-Region Replication (SRR)**, menyalin objek antar-bucket di region yang *sama*—berguna untuk salinan kepatuhan di akun terpisah, agregasi log, atau lingkungan uji yang diisi dari data produksi.)

Satu jebakan yang ditandai Priya sebelum ada yang menabraknya: replikasi **tidak retroaktif**. Objek yang sudah ada di bucket ketika Anda mengaktifkan aturan tidak direplikasi—hanya penulisan baru. Tim mengaktifkan CRR dengan harapan semua data yang ada akan muncul di tujuan, lalu menemukan bucket DR hampir kosong. Untuk objek yang sudah ada sebelumnya, Anda menjalankan **S3 Batch Replication**, sebuah operasi terpisah yang menerapkan aturan replikasi ke objek yang sudah ada di sana. Nimbus menjalankannya sekali untuk mengisi bucket DR dengan 0,8 TB tanda terima yang sudah ada.

"Dan delete marker?" tanya Priya. "Jika seseorang menghapus tanda terima di us-west-2, apakah ia mereplikasi penghapusan itu ke us-east-1?"

Secara default, tidak—dalam konfigurasi replikasi saat ini (skema V2 yang dibuat konsol), **delete marker tidak direplikasi**. Seseorang menghapus tanda terima di us-west-2, dan salinan us-east-1 tetap menyajikannya seolah-olah tidak terjadi apa-apa. Jika Anda *ingin* bucket DR mencerminkan penghapusan, Anda mengaktifkan replikasi delete marker secara eksplisit pada aturan (tidak didukung pada aturan dengan filter tag)—itu adalah default dalam skema V1 legacy, yang masih dijelaskan materi lama. Bagaimanapun, kedaluwarsa lifecycle tidak pernah mereplikasi delete marker-nya.

Replikasi tetap *bukan* solusi backup, walaupun—untuk alasan yang berlawanan: ia tidak akan melindungi terhadap penghapusan versi permanen atau penimpaan berbahaya yang direplikasi ke cermin, dan ia tidak memiliki semantik retensi. Untuk backup sejati, pasangkan versioning dengan Object Lock, atau gunakan AWS Backup.

"Berapa biayanya per bulan?" tanya Tom.

Penyimpanan untuk 0,8 TB di S3 Standard-IA di us-east-1: $10,00/bulan. Ditambah transfer data replikasi (ditagih per GB yang ditransfer lintas-region): minimal pada volume tulis mereka saat ini. Total biaya tambahan: kira-kira $10-11/bulan untuk salinan lintas-region lengkap dari semua catatan pesanan.

Tom mencatat ini tanpa keluhan.

**S3 Storage Lens: Melihat Gambaran Lengkap**

Tom telah melakukan auditnya secara manual—membuka konsol AWS bucket demi bucket, menjalankan perintah AWS CLI untuk menghitung objek, memeriksa billing explorer untuk biaya penyimpanan per bucket. Itu memakan hampir seluruh sore baginya untuk membangun spreadsheet itu.

**S3 Storage Lens** adalah alat AWS yang menggantikan proses manual itu. Ia menyediakan visibilitas seluruh-organisasi ke penggunaan dan aktivitas S3 di semua bucket, semua akun, dan semua region—dalam satu dasbor.

Metrik yang paling penting untuk optimisasi biaya:

**Non-current version bytes**: Berapa banyak penyimpanan yang dikonsumsi oleh versi lama (ketika versioning diaktifkan). Versioning penting untuk keamanan, tetapi jika sebuah dokumen sering diperbarui, versi lama menumpuk. Lifecycle rule untuk mengedaluwarsakan versi non-current setelah 30 hari mencegah pembengkakan versi.

**Incomplete multipart upload bytes**: Persis masalah yang disebabkan Leo dengan uji beban, dimunculkan secara otomatis. Tanpa Storage Lens, Tom harus tahu untuk mencari multipart upload yang tidak lengkap. Dengan Storage Lens, mereka muncul di dasbor sebagai item baris.

**% permintaan yang mengembalikan 403**: Lonjakan respons 403 (Forbidden) pada bucket yang seharusnya dapat diakses publik mungkin menunjukkan kebijakan bucket yang salah dikonfigurasi. Lonjakan pada bucket privat mungkin menunjukkan upaya pemindaian atau penyelidikan. Bagaimanapun, itu adalah sinyal yang layak diselidiki.

**Ukuran objek rata-rata**: Bucket berisi objek kecil (rata-rata 2KB) berperilaku berbeda dari bucket berisi objek besar (rata-rata 50MB) dalam hal ekonomi Intelligent-Tiering, biaya permintaan, dan performa kueri untuk Athena.

S3 Storage Lens memiliki tier gratis yang mencakup metrik esensial. Metrik lanjutan (statistik permintaan, lens group untuk pemfilteran) memiliki biaya tambahan per juta objek per bulan—kecil relatif terhadap penghematan yang dimungkinkannya.

"Mengapa kita tidak menggunakan ini dari awal?" tanya Maya.

"Kita tidak punya 4,2 terabyte dari awal," kata Tom. "Pada skala kecil, spreadsheet berfungsi. Pada skala ini, skala itu sendiri menjadi argumen untuk alat itu."

Ini adalah tema yang berulang dalam arsitektur Nimbus: alat yang tepat untuk skala tertentu tidak selalu alat yang tepat untuk skala berikutnya. S3 Storage Lens layak dikonfigurasi segera setelah penggunaan S3 Anda tumbuh melampaui apa yang bisa Anda audit secara manual dalam satu sore—yang kira-kira ketika penghematan yang dimungkinkannya mulai secara berarti melebihi waktu yang dihematnya.

## Kekuatan dan Keterbatasan

**Mengapa storage tier S3 penting**:

- Pengurangan biaya signifikan tanpa mengorbankan daya tahan atau ketersediaan untuk apa yang sebenarnya diakses
- Lifecycle policy mengotomatiskan seluruh proses—tanpa beban operasional
- S3 Intelligent-Tiering menghilangkan kebutuhan untuk memprediksi pola akses

**Di mana hal ini menjadi rumit**:

- Biaya durasi penyimpanan minimum berlaku untuk class Glacier (90 hari untuk Glacier Instant, 180 hari untuk Deep Archive)—menghapus lebih awal tetap dikenai biaya minimum
- Biaya pengambilan bisa mengejutkan Anda jika Anda sering mengakses data arsip
- Transisi lifecycle memakan waktu—objek tidak dipindahkan secara instan setelah aturan terpicu
- Intelligent-Tiering mengabaikan objek di bawah 128KB—tanpa biaya, tetapi juga tanpa tiering; dan lifecycle rule melewatkannya secara default kecuali Anda mengganti ukuran objek minimum

## Ringkasan

Otomatisasi workflow dari bab 22 mengoptimalkan cara Nimbus memproses permintaan. Bab ini mengoptimalkan apa yang Nimbus bayar untuk data yang disimpan tetapi tidak diakses. Prinsipnya sama: berhenti membayar untuk tier yang salah.

- S3 memiliki delapan storage class: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive—ditambah Express One Zone (low-latency terspesialisasi, single AZ).
- **Lifecycle policy** mengotomatiskan transisi antar-storage class berdasarkan usia—definisikan sekali, S3 menanganinya selamanya.
- **S3 Intelligent-Tiering** secara otomatis memindahkan objek antar-tier berdasarkan pola akses aktual—gunakan untuk beban kerja tak terduga dengan objek yang lebih besar dari 128KB. Objek lebih kecil tidak dipantau atau di-auto-tier (dan tidak membayar biaya pemantauan)—mereka tetap di tier Frequent Access.
- **Pengambilan Glacier** membutuhkan permintaan restore untuk tier Flexible dan Deep Archive. Rencanakan waktu pengambilan (menit hingga 12 jam) sebelum mengarsipkan data apa pun dengan SLA untuk pengambilan.
- **Multipart upload yang tidak lengkap** menumpuk secara diam-diam dan menimbulkan biaya penyimpanan. Tambahkan lifecycle rule untuk menghapus bagian yang tidak lengkap setelah 7 hari di setiap bucket.
- **Tiga lapisan keamanan**: versioning (penghapusan dapat dibalik), Object Lock (imutabilitas untuk kepatuhan), CloudTrail data events (forensik dan deteksi anomali).
- **Cross-Region Replication (CRR)**: replikasikan catatan pesanan ke region DR secara otomatis. Membutuhkan versioning di kedua bucket. Konfigurasikan apakah delete marker direplikasi berdasarkan apakah salinan DR adalah cermin atau backup.
- **Multipart upload** diperlukan untuk objek > 5GB dan direkomendasikan untuk apa pun > 100MB.
- **S3 Object Lock** menyediakan penyimpanan WORM untuk skenario kepatuhan—mode Governance dapat di-override oleh admin; mode Compliance tidak dapat di-override oleh siapa pun.

## Tips Ujian

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

- **Sinyal pemilihan storage class**:
  - "Sering diakses" → Standard
  - "Diakses sekali sebulan, butuh pengambilan instan" → Standard-IA
  - "Bisa mentolerir berjam-jam waktu pengambilan, jarang diakses" → Glacier Flexible Retrieval
  - "Kepatuhan regulasi, retensi 7+ tahun, tidak pernah diakses" → Glacier Deep Archive
  - "Pola akses tidak diketahui atau berubah" → Intelligent-Tiering
- **Pola ujian lifecycle policy**: "kurangi biaya penyimpanan secara otomatis seiring data menua," "transisikan ke arsip setelah 90 hari" → lifecycle policy.
- **Intelligent-Tiering dan objek kecil**: objek di bawah 128KB tidak dipantau, tidak membayar biaya pemantauan, dan tidak pernah auto-tier—mereka tetap di Frequent Access. Lifecycle rule juga melewatkan objek sub-128KB secara default (dapat di-override). Ujian mungkin menguji salah satu fakta.
- **Persyaratan CRR**: Versioning harus diaktifkan di bucket sumber dan tujuan. Sumber dan tujuan harus berada di region yang berbeda.
- **S3 Object Lock**: "WORM," "imutabel," "SEC 17a-4," "tidak dapat dihapus atau dimodifikasi" → Object Lock. Mode Governance (dapat di-override oleh admin). Mode Compliance (tidak dapat di-override oleh siapa pun, termasuk root).
- **Restore Glacier**: Objek di Glacier tidak langsung tersedia. Anda harus me-"restore" salinan ke S3 Standard untuk akses. Salinan yang di-restore bersifat sementara (Anda mengatur durasinya). Aslinya tetap di Glacier.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara S3 Standard-IA dan S3 Glacier Instant Retrieval. Pola akses apa yang membuat masing-masing sesuai?

*(Petunjuk: Pikirkan seberapa sering Anda akan mengakses data dan seberapa cepat Anda membutuhkannya ketika Anda mengaksesnya.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan menghasilkan 500GB log aplikasi setiap hari. Log banyak dikueri selama 7 hari pertama (debugging dan pemantauan). Setelah 7 hari, log jarang diakses tetapi harus tersedia dalam 30 menit jika dibutuhkan. Setelah 1 tahun, log harus disimpan untuk kepatuhan tetapi tidak pernah diakses. Perusahaan perlu meminimalkan biaya penyimpanan sambil memenuhi persyaratan ini.

Lifecycle policy S3 mana yang PALING memenuhi persyaratan ini?

A) Simpan di S3 Standard selama 7 hari; transisikan ke S3 Glacier Deep Archive setelah 7 hari; kedaluwarsakan setelah 365 hari  
B) Simpan di S3 Standard selama 7 hari; transisikan ke S3 Standard-IA setelah 7 hari; transisikan ke S3 Glacier Flexible Retrieval setelah 365 hari  
C) Simpan semua log di S3 Intelligent-Tiering dari hari ke-1  
D) Simpan di S3 Standard selama 7 hari; transisikan ke S3 Glacier Instant Retrieval setelah 7 hari; transisikan ke S3 Glacier Deep Archive setelah 365 hari

**Petunjuk 1**: "Tersedia dalam 30 menit" mengesampingkan storage class mana?

**Petunjuk 2**: Deep Archive memakan 12 jam untuk diambil—tidak memenuhi persyaratan 30 menit untuk hari 7-365.

**Petunjuk 3**: Setelah 365 hari, waktu pengambilan tidak penting (tidak pernah diakses), jadi opsi termurah berlaku.

**Jawaban**: D

**Penjelasan**: S3 Standard selama 7 hari menangani akses yang sering. Glacier Instant Retrieval menyediakan akses milidetik untuk hari 7-365—memenuhi persyaratan 30 menit dengan biaya jauh lebih rendah daripada Standard-IA. Setelah 365 hari, Glacier Deep Archive adalah opsi termurah untuk data yang tidak pernah diakses.

**Mengapa bukan A?** Glacier Deep Archive memakan 12 jam untuk diambil—tidak memenuhi persyaratan "ketersediaan 30 menit" untuk hari 7-365.

**Mengapa bukan B?** Standard-IA bahkan tidak bisa menjadi pemberhentian pertama di sini: S3 mengharuskan objek menua 30 hari di Standard sebelum lifecycle rule boleh mentransisikannya ke Standard-IA atau One Zone-IA—jadi "Standard-IA setelah 7 hari" adalah aturan yang tidak valid. (Aturan 30 hari tidak berlaku untuk class Glacier, yang persis mengapa D berfungsi.) Dan bahkan mengesampingkan itu, Glacier Instant Retrieval jauh lebih murah untuk data yang jarang diakses setelah hari 7.

**Mengapa bukan C?** Intelligent-Tiering memiliki biaya pemantauan per objek dan mungkin tidak memindahkan log ke tier arsip seagresif lifecycle rule eksplisit. Untuk volume log yang besar dengan pola akses yang dapat diprediksi, lifecycle rule eksplisit lebih hemat biaya.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus memiliki tiga jenis data S3 dengan karakteristik yang berbeda:

- Foto restoran: diunggah sekali, diakses berkali-kali oleh pelanggan, tidak pernah dihapus
- Tanda terima pesanan: diakses oleh pelanggan dalam bulan pertama, disimpan 7 tahun untuk keperluan pajak
- Ekspor analitik: dihasilkan setiap hari, dianalisis dalam minggu berikutnya, disimpan 2 tahun

Rancang lifecycle policy untuk masing-masing. Untuk foto restoran, apakah Intelligent-Tiering masuk akal? Untuk tanda terima pesanan, storage class apa yang mencakup jendela 1 bulan hingga 7 tahun? Untuk ekspor analitik, bagaimana Anda akan menyusun bucket untuk menerapkan policy berbeda ke prefix berbeda?

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih pemilihan storage tier untuk data dunia nyata.)*

## Adegan Pasca Kredit

Tom mengimplementasikan lifecycle policy.

Leo telah membantu mengonfigurasi aturan pertama. "Akan baik-baik saja," katanya. "Durasi penyimpanan minimum hanya berlaku jika kita menghapus lebih awal—dan kita tidak menghapus apa pun." Ia memeriksa persyaratan durasi minimum Glacier di tengah jalan. "Sebenarnya, biar saya baca ulang ini."

Pada bucket yang berbeda—ekspor staging analitik sementara—ia hampir menggabungkan transisi 30-hari ke Glacier Instant Retrieval dengan aturan kedaluwarsa 60-hari. Durasi penyimpanan minimum untuk Glacier Instant adalah 90 hari: objek-objek itu akan masuk Glacier pada hari ke-30 dan dihapus pada hari ke-60, dan S3 tetap akan menagih 90 hari penuh untuk setiap satunya—membayar harga arsip untuk penyimpanan yang sudah tidak ada lagi. Ia membatalkan transisi Glacier untuk bucket itu sepenuhnya; data yang dihapus pada 60 hari tidak pernah hidup cukup lama untuk mengamortisasi minimum 90 hari. Policy tanda terima aman sebagaimana dirancang: transisi ke Standard-IA pada 90 hari, Glacier Instant Retrieval pada 365 hari, Glacier Flexible Retrieval pada 540 hari, Glacier Deep Archive pada 2.555 hari.

Ia juga mengatur aturan pembersihan multipart upload di setiap bucket. Bukan karena ada lebih banyak unggahan terbengkalai—tidak ada—tetapi karena akan ada. Uji beban terjadi. Deployment gagal di tengah. Aturan itu lebih murah daripada ingatan yang dibutuhkan untuk mengingat membersihkannya secara manual.

Tagihan S3 turun dari $847 menjadi $198 bulan berikutnya.

Ia mencetak perbandingannya dan meletakkannya di meja Maya tanpa berkata apa-apa.

Maya melihatnya. Lalu pada tanggalnya. Lalu pada Tom.

"Tiga minggu," katanya.

"Satu sore untuk merancang policy," katanya. "Satu jam untuk mengimplementasikannya. Tiga minggu untuk melihat siklus penagihan penuh pertama."

"Pengurangan tiga perempat dalam biaya S3."

"Untuk data yang tidak kita akses."

"Dan cross-region replication?" tanya Leo.

"Sepuluh dolar sebulan lebih," kata Tom. "Untuk salinan lengkap dari setiap tanda terima pesanan di region kedua."

"Itu keputusan pemulihan bencana termurah yang pernah kita buat."

Maya melihat angka-angka itu lagi.

"Tom," katanya, "saya ingin kamu melakukan tinjauan ini untuk setiap layanan AWS yang kita gunakan. Penyimpanan, komputasi, jaringan. Temukan pemborosannya."

Ia sudah kembali di mejanya.

"Saya mulai minggu lalu," katanya.

Pada bab berikutnya: tier database memiliki versi percakapan ini sendiri, dan Aurora adalah jawaban yang tidak Tom duga akan ia sukai.
