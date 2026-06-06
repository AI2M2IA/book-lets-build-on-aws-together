# Bab 26: Memahami Segalanya

Tom sedang menatap sebuah cetakan.

Itu dua halaman angka: jumlah pesanan, total pendapatan, timestamp, kode region. Ia telah meminta Leo mengumpulkan segala yang tersedia tentang pola pesanan Jumat. Leo telah menghabiskan satu jam menulis skrip yang menggabungkan tiga sumber data berbeda—DynamoDB, log CloudWatch, dan sebuah ekspor analitik S3—dan inilah yang keluar.

Angka-angkanya semua ada di sana. Mereka tidak memberitahunya apa pun.

Ia bisa melihat bahwa 847 pesanan telah ditempatkan pada Jumat. Ia tidak bisa mengetahui kapan mereka ditempatkan, restoran mana yang paling sibuk, atau jam puncaknya. Informasi itu ada dalam data. Ia hanya tak terlihat.

---

Semua optimisasi jaringan dari bab 25 telah membuat infrastruktur Nimbus lebih cepat dan lebih murah. Tetapi data yang dihasilkan infrastruktur itu—di DynamoDB, di log CloudWatch, di ekspor analitik S3 yang berjalan sekali semalam—duduk di tiga tempat berbeda, dalam tiga format berbeda, tidak terhubung ke apa pun yang sebenarnya bisa digunakan Tom.

Pertanyaan Maya membuatnya konkret. "Berapa waktu pemesanan tersibuk kita pada hari Jumat?"

Leo melihatnya. "Itu tidak ada di dasbor kita."

"Bisakah kita menambahkannya?"

"Datanya ada di DynamoDB. Dan di log CloudWatch. Dan di S3 dari pekerjaan ekspor analitik." Leo berhenti. "Di tiga tempat berbeda, dalam tiga format berbeda."

Maya menambahkan: "Dan ekspor analitik hanya berjalan sekali semalam. Jika Anda ingin data Jumat, Anda harus menunggu sampai Sabtu pagi."

Tom melihat cetakan itu. "Jadi kita punya datanya. Kita hanya tidak bisa menggunakannya."

Kalimat itu menggambarkan separuh dari analitik modern.

---

**Papan Tulis**

Maya tiba di kantor pagi-pagi dan sudah mengisi setengah papan tulis pada saat Leo tiba.

Tujuh pertanyaan, ditulis dalam dua kolom, semuanya pertanyaan bisnis, tidak satu pun bisa dijawab dari dasbor saat ini:

1. Restoran mana yang memiliki tingkat pembatalan pesanan tertinggi dalam 30 hari pertama?
2. Berapa rata-rata waktu antara restoran menerima notifikasi pesanan dan mengonfirmasinya? Bagaimana ini bervariasi menurut restoran dan menurut hari dalam seminggu?
3. Kota mana yang memiliki tingkat tertinggi pelanggan yang memesan ulang dari restoran yang sama dalam 14 hari?
4. Berapa persentase pesanan yang ditempatkan dalam sesi pertama aplikasi vs. sesi kembali?
5. Kategori menu mana yang mendorong pendapatan tertinggi per restoran?
6. Apa korelasi antara waktu respons restoran dan tingkat pemesanan ulang pelanggan?
7. Bagaimana volume pesanan berubah dalam 48 jam sebelum dan sesudah mitra restoran memposting di media sosial?

"Bisakah kita menjawab salah satu dari ini?" tanyanya.

Leo melihat daftarnya. Ia melihat dasbor saat ini—jumlah pesanan, total pendapatan, restoran aktif.

"Nomor satu," katanya perlahan. "Sebagian. Kita punya record pembatalan. Tetapi kita perlu menggabungkannya dengan tanggal onboarding restoran, dan itu ada di sistem yang berbeda."

"Nomor dua?" tanya Tom.

"Kita menyimpan timestamp notifikasi. Kita menyimpan timestamp konfirmasi. Mereka ada di tabel berbeda dalam format berbeda. Kita perlu JOIN mereka dan menghitung delta-nya."

"Jadi datanya ada," kata Maya.

"Datanya ada," Leo memastikan. "Kita hanya tidak punya cara untuk mengkueri lintas data itu."

"Tunggu—tapi *mengapa* kita tidak bisa sekadar mengkueri database?" tanya Maya. "Kita punya PostgreSQL. Kita punya semua data ini."

"Karena data ada di tiga tempat," kata Leo. "Kejadian pesanan ada di DynamoDB. Timestamp notifikasi ada di log CloudWatch. Tanggal onboarding ada di database RDS PostgreSQL. Dan sebagian darinya—ekspor analitik—ada di S3 sebagai file JSON yang tak seorang pun pernah menggabungkannya ke apa pun."

Tom melihat papan tulis. "Kita telah menghasilkan data ini selama 18 bulan," katanya. "Kita telah terbang buta selama 18 bulan."

"Bukan buta," kata Maya. "Hanya rabun dekat. Kita bisa melihat apa yang langsung ada di depan kita. Kita tidak bisa melihat pola."

Itu adalah pembingkaian yang tepat. Titik-titik data individual ada di sana. Sistem untuk menghubungkannya tidak.

**Tiga Masalah Berbeda**

Masalah data Nimbus memiliki tiga dimensi:

**Streaming real-time**: Pesanan sedang ditempatkan sekarang. Anda ingin melihat dasbor langsung kecepatan pesanan—berapa per menit, menurut region, menurut restoran. Data perlu diproses saat ia tiba.

**Transformasi data**: Data ada di S3 dari berbagai sistem, dalam format berbeda (JSON, CSV, Parquet). Sebelum Anda bisa menganalisisnya, Anda perlu menormalisasinya—skema yang sama, format yang sama, dibersihkan, digabungkan dengan data referensi.

**Analisis ad-hoc**: Begitu data terorganisasi, Anda ingin menjalankan kueri SQL terhadapnya tanpa harus memuatnya ke database terlebih dahulu. "Beri saya 10 restoran teratas berdasarkan pendapatan dalam 30 hari terakhir." Tanpa memuat data ke database.

Masing-masing adalah masalah yang berbeda. AWS memiliki layanan khusus untuk masing-masing.

**Stream Real-Time: Ticker Tape untuk Data**

Bayangkan sebuah mesin ticker tape—jenis yang mencetak harga saham pada gulungan kertas berkelanjutan. Harga dicetak saat mereka berubah. Setiap orang yang menginginkan harga saat ini bisa membaca tape. Tak seorang pun harus menunggu orang lain; tape terus mencetak terlepas dari berapa banyak orang yang membaca.

Itulah model untuk streaming data real-time. Produser mengirim data saat ia terjadi. Beberapa konsumen bisa membaca stream secara bersamaan, masing-masing dengan kecepatannya sendiri, masing-masing mendapatkan gambaran penuh.

**Amazon Kinesis Data Streams** adalah mesin itu untuk Nimbus. Ketika sebuah pesanan ditempatkan, aplikasi memublikasikan kejadian ke stream Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Konsumen dari stream ini:

- Dasbor real-time (membaca kejadian saat mereka tiba, memperbarui metrik)
- Lambda deteksi penipuan (mencari pola pesanan yang tidak biasa)
- Stream ke S3 untuk penyimpanan permanen

**Konsep Kinesis Data Streams**:

- **Shard**: Unit dasar kapasitas. Satu shard menangani 1 MB/d tulis, 2 MB/d baca.
- **Periode retensi**: Data tetap di stream selama 24 jam (default), dapat diperpanjang hingga **365 hari** (1 tahun) dengan Extended Data Retention.
- **Sequence number**: Setiap record memiliki sequence number. Konsumen melacak posisi mereka di stream.

**Amazon Data Firehose** (sebelumnya **Kinesis Data Firehose**): Layanan pengiriman terkelola antara produser streaming dan tujuan seperti S3, Redshift, dan OpenSearch. Ia mem-buffer, mengompresi, mentransformasi, dan mengirim data secara otomatis.

Untuk Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (format Parquet, terkompresi, dipartisi berdasarkan tanggal).

"Saya sudah men-deploy-nya—oh." Leo telah mengatur jumlah shard ke satu tanpa menghitung throughput tulis terlebih dahulu. Pada volume pesanan Nimbus, satu shard baik-baik saja. Ia mengonfirmasi ini sebelum ada yang menyadari ia telah menebak.

**Penerjemah: Memahami Data Mentah**

Data di S3 itu mentah. Sebelum Anda bisa menganalisisnya secara efisien, Anda perlu menemukan apa yang ada di sana, mentransformasinya menjadi format yang konsisten, menggabungkan dataset berbeda, dan menangani record buruk serta nilai yang hilang.

Itu adalah pekerjaan untuk lapisan penerjemah khusus.

**AWS Glue** adalah layanan ETL (Extract, Transform, Load) yang sepenuhnya terkelola. Ia memiliki dua komponen utama:

**Glue Data Catalog**: Penyimpanan metadata yang menggambarkan data S3 Anda—tabel apa yang ada, kolom apa yang mereka miliki, di mana file data berada. Ini seperti katalog kartu untuk data lake Anda.

**Glue Crawler**: Agen otomatis yang memindai S3, menyimpulkan skema, dan mengisi Data Catalog. Jalankan crawler pada bucket S3 Anda dan 10 menit kemudian Anda memiliki katalog dari semua tabel Anda.

**Glue Job**: Pekerjaan Spark/Python serverless yang melakukan transformasi sebenarnya. Anda menulis logika transformasi (atau menggunakan alat ETL visual Glue), dan Glue menjalankannya di infrastruktur terkelola.

Untuk Nimbus:

1. Glue Crawler memindai data pesanan di S3 → membuat definisi tabel di Glue Data Catalog
2. Glue Job mentransformasi kejadian pesanan JSON mentah menjadi format Parquet yang bersih dan terpartisi
3. Data yang ditransformasi ditulis kembali ke S3 dalam tata letak yang dioptimalkan untuk kueri

**Ketika ETL Rusak: Masalah Evolusi Skema**

Pipeline Glue berjalan bersih selama tiga minggu pertama. Lalu mitra restoran #412 menambahkan field baru ke ekspor menu mereka: `allergen_tags`. Field itu adalah array string—`["gluten", "dairy", "nuts"]`—dan ia muncul di ekspor data malam restoran.

Skema Glue job ketat. Ia telah ditulis untuk mengharapkan field tertentu dalam JSON pesanan. Ketika ia menemui `allergen_tags`—field yang tidak ada dalam skema—Glue job gagal.

Enam jam data pesanan dari 47 restoran (semua menggunakan format ekspor menu yang sama dengan mitra #412) terakumulasi di S3 tanpa diproses. Eksekusi Glue malam yang seharusnya membuat pesanan tadi malam dapat dikueri pada pagi hari malah berhenti pada 02:47 dan menulis record kegagalan ke CloudWatch.

Tom menemukannya ketika ia mencoba menjalankan kueri Athena pada pukul 9 pagi dan mendapat `0 rows returned` untuk 12 jam sebelumnya.

"ETL rusak karena data sumber berubah?" tanya Maya, ketika Leo menjelaskan apa yang terjadi.

"ETL rusak karena ETL tidak tahu cara menangani perubahan skema," kata Leo. "Kita menulis pekerjaan ketat yang mengharapkan persis field-field ini. Ketika field baru muncul, ia panik."

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui perubahan skema?" tanya Priya. "Mitra restoran jahat yang sengaja mengirimkan field tak terduga untuk merusak pipeline?"

Pertanyaan itu layak dipertimbangkan. Pipeline ETL yang mogok pada input tak terduga adalah vektor denial-of-service: kirim format data yang tidak biasa, rusak pipeline, dan restoran itu (dan semua lain yang berbagi format) berhenti memproses.

Perbaikannya memiliki dua bagian:

**Evolusi skema Glue**: Dynamic frame Glue mendukung evolusi skema—field yang tidak ada dalam skema yang diharapkan diteruskan alih-alih menyebabkan kegagalan. Aktifkan dengan menggunakan DynamicFrame alih-alih DataFrame dalam skrip pekerjaan, dengan `mergeSchema` diatur di opsi tambahan. Field baru ditambahkan ke skema secara otomatis pada eksekusi crawler berikutnya.

```python
# Sebelum (ketat, rusak pada field baru)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Sesudah (evolusi skema diaktifkan)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Peringatan Glue job**: Kegagalan pipeline diam selama sekitar enam jam sebelum Tom menyadarinya. Sebuah alarm CloudWatch pada state eksekusi Glue job (`FAILED`) akan memperingatkan insinyur on-call dalam 5 menit. Biaya alarm: sepuluh sen sebulan—secara efektif gratis (metrik itu sendiri tidak berbiaya apa pun, dan sepuluh alarm pertama masuk tier gratis).

"Enam jam data duduk tidak terproses di S3," kata Leo, setelah menjalankan ulang Glue job secara manual untuk menyusul. "Tidak ada yang hilang—tetapi analitiknya tertinggal sejauh itu. Jika kita punya alarm, penundaannya akan 30 menit."

Pelajaran yang lebih luas: pipeline ETL yang memproses data eksternal perlu menangani perubahan skema dengan anggun. Mitra eksternal—restoran, penyedia pembayaran, layanan pengiriman—akan mengubah format data mereka. Pipeline tidak boleh rapuh terhadap perubahan itu.

**Lapisan Kueri: SQL Langsung pada S3**

Sekarang data ada di S3, dalam format Parquet, dipartisi berdasarkan tanggal. Bagian terakhir: cara untuk mengajukan pertanyaan terhadapnya tanpa memuatnya ke database terlebih dahulu.

**Amazon Athena** adalah layanan kueri interaktif serverless yang menjalankan kueri SQL langsung pada data S3. Tidak ada database untuk disediakan, tidak ada data untuk dimuat. Anda mendefinisikan tabel (atau menggunakan Glue Data Catalog), menulis SQL, dan Athena mengeksekusi kueri terhadap file S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Harga Athena didasarkan pada berapa banyak data yang dipindai sebuah kueri. Di us-east-1, us-west-2, dan sebagian besar region utama, kueri SQL standar berbiaya $5 per terabyte yang dipindai. Menggunakan format Parquet (kolumnar) dengan partition pruning (`WHERE year='2024' AND month='09'`) berarti Athena hanya memindai file yang dibutuhkannya, yang secara dramatis mengurangi biaya.

"Kita bisa menjalankan kueri ini untuk 30 hari data," kata Leo, "dan ia mungkin berbiaya sangat sedikit jika kita menyimpannya dengan baik."

"Bagaimana ia bisa berbiaya sangat sedikit?" tanya Maya. "Jika ia memindai terabyte data, bagaimana itu tidak mahal?"

Leo menjelaskan Parquet. Dalam format berbasis-baris (JSON, CSV), kueri yang mencari dua kolom dari dua puluh harus membaca semua dua puluh. Dalam format kolumnar seperti Parquet, ia hanya membaca dua yang dibutuhkannya. Untuk dataset 50TB, kueri yang dioptimalkan dengan baik mungkin memindai 200GB. Pada $5/TB, itu satu dolar.

"Dan bagaimana jika seseorang mengkueri seluruh tabel secara tidak sengaja?" Maya mendesak.

"Itu risiko biaya yang sebenarnya," kata Leo.

Anda mungkin bertanya-tanya: jika Athena menagih per terabyte yang dipindai, bisakah satu kueri yang ditulis buruk menghasilkan tagihan besar yang tak terduga? Bisa—dan ini terjadi di lingkungan produksi nyata. Kueri terhadap tabel 50TB yang tidak dioptimalkan bisa berbiaya lebih dari seluruh tagihan S3 bulanan Anda. Inilah mengapa format Parquet dan partisi bukan optimisasi opsional—mereka adalah kontrol biaya. Athena juga mendukung batas pemindaian kueri workgroup yang membatasi berapa banyak data yang diizinkan dipindai satu kueri.

"Untuk pertanyaan sembarang apa pun yang bisa kita pikirkan?" tanya Tom.

"Pertanyaan apa pun yang bisa kita ekspresikan dalam SQL, terhadap data apa pun yang telah kita simpan di S3."

Tom duduk di laptop Leo dan menulis kueri pertama:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

Kueri berjalan selama 11 detik. Hasilnya: 20 restoran, diurutkan berdasarkan waktu konfirmasi rata-rata tercepat, dengan tingkat pemesanan ulang mereka di sebelahnya.

Tom menatap keluarannya.

Restoran yang paling cepat mengonfirmasi—yang mengakui dan mengonfirmasi pesanan dalam rata-rata 3-4 menit—memiliki tingkat pemesanan ulang rata-rata 41%. Restoran yang paling lambat mengonfirmasi (waktu konfirmasi rata-rata 18-22 menit) memiliki tingkat pemesanan ulang 13%.

"Restoran yang mengonfirmasi dengan cepat mendapat tiga kali lipat bisnis berulang," kata Tom.

"Itu kesenjangan yang besar," kata Maya. "Mengapa kecepatan konfirmasi memengaruhi tingkat pemesanan ulang begitu banyak?"

"Karena pelanggan menempatkan pesanan lalu duduk di sana menatap ponsel mereka," kata Leo. "Jika konfirmasi datang dalam 3 menit, mereka merasa yakin. Jika datang dalam 22 menit—atau tidak pernah—mereka merasa cemas. Kecemasan adalah kegagalan produk, bahkan jika makanannya tiba baik-baik saja."

"Ini adalah wawasan produk," kata Maya. "Bukan sekadar wawasan analitik. Kita harus menunjukkan kepada restoran benchmark waktu konfirmasi mereka dibandingkan rata-rata kategori."

Kueri Athena telah memindai 1,2 GB data (dua bulan pesanan dalam format Parquet, dipartisi berdasarkan tahun dan bulan). Biaya: $0,006.

Setengah sen. Untuk wawasan bisnis yang mengubah cara Nimbus akan merancang onboarding restoran—restoran mana yang diprioritaskan untuk coaching kesuksesan, target waktu konfirmasi apa yang diatur sebagai bagian dari SLA mitra.

Tom memiliki tatapan seseorang yang menghitung ulang nilai semua data yang telah mereka buang.

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui lapisan kueri?" tanya Priya. "Atau sekadar seorang analis yang secara tidak sengaja mengekspor alamat pelanggan dari data pesanan mentah? PII pelanggan, riwayat pesanan, catatan keuangan—siapa yang mengontrol tabel apa yang bahkan terlihat?"

Sebelum ia menyelesaikan pertanyaannya, Leo juga telah menyadari masalah operasional: bagaimana Anda menghentikan satu tim menjalankan pemindaian seluruh tabel yang katastropik yang menghasilkan tagihan Athena $500 dalam satu kueri?

**Athena Workgroup** menyelesaikan kedua masalah secara bersamaan.

Workgroup adalah konfigurasi bernama yang mengelompokkan pengguna Athena dan menerapkan pengaturan bersama: lokasi hasil kueri, enkripsi, dan—yang kritis—batas pemindaian data per-kueri.

```
Workgroup: analytics-team
  Batas pemindaian kueri: 10 GB per kueri
  Tindakan saat batas terlampaui: Batalkan kueri

Workgroup: engineering-team
  Batas pemindaian kueri: 100 GB per kueri
  Tindakan saat batas terlampaui: Peringatkan saja

Workgroup: finance-reports
  Batas pemindaian kueri: 1 GB per kueri
  Tindakan saat batas terlampaui: Batalkan kueri
```

Seorang analis di workgroup `analytics-team` tidak bisa secara tidak sengaja memindai 50TB data dan menghasilkan biaya Athena $250. Kueri dibatalkan ketika ia akan melebihi 10GB data yang dipindai. Analis melihat pesan kesalahan dan tahu mereka perlu menambahkan filter partisi.

Workgroup juga menegakkan lokasi hasil terpisah per tim: hasil kueri tim engineering masuk ke `s3://nimbus-query-results/engineering/`; hasil tim finance masuk ke `s3://nimbus-query-results/finance/`. Tanpa akses hasil kueri lintas-tim.

IAM mengontrol pengguna mana yang bisa menggunakan workgroup mana. Sebuah fungsi Lambda yang menjalankan laporan otomatis menggunakan workgroup `finance-reports` (dibatasi ketat). Seorang insinyur yang men-debug masalah produksi menggunakan workgroup `engineering-team` (batas lebih lebar, peringatkan bukan batalkan). Akses ke tabel events mentah (berisi PII pelanggan) dibatasi ke workgroup `engineering-team` melalui kondisi IAM pada tabel Glue Data Catalog.

"Itu bukan sekadar kontrol biaya," kata Priya. "Itu kontrol akses. Workgroup adalah titik penegakannya."

Itu menjawab pertanyaannya secara penuh. Setiap diskusi pipeline data yang melewatkan kontrol akses pada akhirnya menjadi insiden kepatuhan—dan di sini, tim analitik hanya melihat tabel pesanan teragregasi, sementara events mentah dengan PII pelanggan tetap di balik otorisasi IAM eksplisit. Glue Data Catalog bukan sekadar direktori skema. Ia adalah batas kontrol akses.

"Itu bukan pekerjaan ekstra," kata Priya. "Itu desainnya."

**Arsitektur Data Lake**

Ketiga layanan ini bergabung menjadi apa yang disebut **arsitektur data lake**—repositori S3 terpusat untuk semua data Anda, dengan alat untuk memprosesnya dan mengkuerinya:

```
Aplikasi (pesanan, menu, kejadian)
    |
    | Kejadian real-time
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (mentah)
                                                   |
                                                   | Glue Crawler menemukan skema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs mentransformasi
                                                   ↓
                                              S3 (bersih, Parquet, terpartisi)
                                                   |
                                                   | Kueri SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Alat Business Intelligence
                                       (QuickSight, Tableau, dll.)
```

Data mentah selalu dilestarikan (di bucket S3 asli). Data yang ditransformasi dapat dikueri via Athena. Pertanyaan baru selalu bisa dijawab dengan menjalankan Glue job baru pada data mentah.

**Amazon Redshift: Ketika Athena Tidak Cukup**

Untuk beberapa kasus penggunaan, Athena terlalu lambat atau terlalu mahal:

- Kueri yang sangat kompleks dengan banyak join
- Dasbor yang menjalankan kueri yang sama ribuan kali per hari
- Machine learning pada data terstruktur
- Persyaratan waktu respons sub-detik untuk alat BI

**Amazon Redshift** adalah data warehouse yang sepenuhnya terkelola: database analitik kolumnar yang dirancang untuk beban kerja analitik yang besar dan berulang. Tidak seperti Athena, yang mengkueri data di tempat ia berada di S3, Redshift memuat data ke penyimpanan warehouse yang dioptimalkan dan menggunakan optimisasi kueri, strategi pengurutan, dan strategi distribusi untuk mempercepat analitik kompleks.

Jika volume data Anda kecil dan kueri Anda jarang berjalan (mingguan atau bulanan), Athena dengan data S3 yang terorganisasi dengan baik sudah cukup dan hampir gratis—tetapi jika Anda menjalankan dasbor analitik yang sama ratusan kali per hari, penyimpanan kolumnar Redshift yang sudah dioptimalkan akan lebih cepat dan pada akhirnya lebih hemat biaya, meskipun membutuhkan data dimuat terlebih dahulu.

Redshift secara signifikan lebih cepat untuk kueri analitik kompleks dengan biaya (kapasitas yang disediakan) dan persyaratan memuat data sebelum mengkueri.

**Redshift Serverless** menghilangkan beban perencanaan kapasitas—Anda mengkueri, Redshift menskala. Biaya didasarkan pada kapasitas komputasi yang benar-benar digunakan, diukur dalam **RPU-jam** dan ditagih per detik (dengan minimum 60 detik per aktivasi), ditambah penyimpanan terkelola per GB-bulan—dan tidak ada biaya untuk komputasi saat warehouse menganggur. (Athena adalah yang diberi harga per kueri: $5 per TB yang dipindai.)

Untuk Nimbus pada skala mereka saat ini: Athena sudah cukup. Pada lima kali volume data dan dengan alat BI mengkueri dasbor yang sama ratusan kali per hari, Redshift akan menjadi hemat biaya.

**Ketika Athena Adalah Alat yang Salah**

"Jadi apa tangkapannya?" tanya Maya. "Mengapa kita tidak menggunakan Athena untuk segalanya? Ia serverless, bayar per kueri, tanpa infrastruktur—kedengarannya sempurna."

Kasus di mana Athena bukan jawaban yang tepat:

**Dasbor berfrekuensi tinggi**: Dasbor analitik yang menghadap pelanggan yang me-refresh setiap 30 detik dan menjalankan 50 kueri per menit bukan kasus penggunaan Athena yang baik. Pada $5/TB yang dipindai, kueri itu perlu sangat dioptimalkan untuk menjadi hemat biaya pada frekuensi itu. Redshift atau database yang pra-teragregasi (bahkan RDS) lebih sesuai untuk dasbor dengan persyaratan waktu respons sub-detik.

**Kueri operasional dengan persyaratan latensi rendah**: Jika seorang agen layanan pelanggan perlu mencari pesanan tertentu dalam di bawah 500ms, Athena bukan alatnya—pencarian DynamoDB atau kueri RDS adalah. Athena dioptimalkan untuk throughput analitik, bukan latensi operasional. Bahkan kueri Athena yang disetel dengan baik pada dataset kecil memiliki overhead cold-start 1-3 detik.

**Sistem transaksional**: Athena hanya-baca. Anda tidak bisa INSERT, UPDATE, atau DELETE record di Athena (kecuali melalui integrasi tertentu seperti Lake Formation atau format tabel Iceberg, yang memiliki kompleksitasnya sendiri). Untuk beban kerja tulis operasional, gunakan database transaksional.

**Dataset yang sangat kecil dan sering berubah**: Jika dataset Anda berubah setiap menit dan hanya 1GB, memuatnya ke RDS atau DynamoDB dan mengkueri di sana lebih sederhana dan lebih cepat daripada menjalankan kueri Athena terhadap file S3 yang mungkin basi. Athena mengkueri file S3 per-saat kueri—jika file ditulis 2 menit lalu, itu kesegaran yang Anda dapatkan.

Pola yang muncul: Athena sangat baik untuk kueri analitik ad-hoc berskala besar dan jarang terhadap data S3. Untuk apa pun yang operasional, transaksional, atau membutuhkan latensi sub-detik, gunakan database operasional yang sesuai.

**Kinesis vs SQS: Menjernihkan Kebingungan**

Ini adalah pertanyaan yang muncul di setiap diskusi arsitektur data. Kinesis dan SQS keduanya berurusan dengan pesan. Kapan Anda menggunakan masing-masing?

Kebingungan datang dari kemiripan tingkat permukaan: keduanya menerima pesan dari produser. Keduanya mengirim pesan itu ke konsumen. Keduanya adalah layanan AWS terkelola. Tetapi model data mereka secara fundamental berbeda.

**SQS (Simple Queue Service)** adalah antrian tugas. Anda memasukkan pesan. Satu konsumen mengeluarkannya dan memprosesnya. Ketika pemrosesan selesai, pesan dihapus. Jika Anda punya sepuluh konsumen, setiap pesan masuk ke persis salah satunya. Pesan hilang setelah dikonsumsi.

**Kinesis Data Streams** adalah log. Anda memasukkan record. Setiap konsumen membaca setiap record. Konsumen A membaca semuanya. Konsumen B juga membaca semuanya, dengan kecepatannya sendiri. Tidak ada konsumen yang menghapus record—ia tetap di stream sampai periode retensi berakhir. Anda bisa menambahkan konsumen ketiga kapan saja, dan ia bisa membaca dari awal stream (dalam jendela retensi).

"Kapan Anda sebenarnya ingin setiap konsumen melihat setiap pesan?" tanya Maya.

Jawabannya adalah kasus penggunaan di mana Kinesis bersinar:

**Dasbor real-time + deteksi penipuan + arsip S3**: Ketiganya mengonsumsi stream kejadian pesanan yang sama secara bersamaan. Jika Anda menggunakan SQS, Anda perlu memublikasikan ke tiga antrian terpisah—dan siapa pun yang memublikasikan harus tahu tentang ketiga konsumen. Dengan Kinesis, produser memublikasikan sekali; sejumlah konsumen bisa membaca secara independen.

**Replay**: Sebuah konsumen gagal selama 2 jam (batas konkurensi Lambda tercapai, layanan hilir mati). Dengan SQS, pesan itu sudah dihapus (atau memiliki visibility timeout yang ditentukan). Dengan Kinesis, konsumen melanjutkan dari checkpoint terakhirnya dan memproses 2 jam record yang terlewat. Data dipertahankan di stream (hingga 365 hari dengan Extended Data Retention).

**Urutan dalam shard**: Record dengan partition key yang sama selalu masuk ke shard yang sama, mempertahankan urutan. Untuk sistem perdagangan saham di mana Anda perlu semua perdagangan untuk simbol `AMZN` diproses secara berurutan, Kinesis menjaminnya. SQS FIFO menyediakan urutan per-grup tetapi pada throughput lebih rendah (hingga 3.000 pesan/detik per antrian dengan batching dalam mode standar—mode throughput tinggi menaikkan ini menjadi puluhan ribu—vs. 1 MB/d atau 1.000 record/d per shard milik Kinesis, dikalikan sebanyak shard yang Anda butuhkan).

Pertanyaan yang menentukan: **Apakah setiap pesan perlu dikonsumsi oleh persis satu konsumen lalu dibuang?** → SQS. **Apakah setiap pesan perlu dilihat oleh beberapa konsumen secara independen, atau apakah Anda membutuhkan kemampuan replay?** → Kinesis.

Untuk dasbor real-time Nimbus: Kinesis. Beberapa konsumen (dasbor, deteksi penipuan, arsip S3) semua membaca stream yang sama.

Untuk antrian pemrosesan pesanan Nimbus (pesanan ditempatkan → satu task ECS memprosesnya): SQS. Satu konsumen, tanpa replay diperlukan, tanpa fan-out diperlukan.

## Memvisualisasikan Data: Amazon QuickSight

Athena mengkueri data. Glue menyiapkannya. Tetapi pada suatu titik seseorang perlu melihat grafik—dan bukan dengan menjalankan kueri SQL di konsol.

"Apakah kita benar-benar membutuhkan layanan lain untuk itu?" tanya Maya. "Tidak bisakah saya sekadar mengekspor hasil Athena ke spreadsheet?"

"Untuk satu kueri, ya," kata Tom. Ia memiliki tatapan seseorang yang sudah mencoba ini. "Untuk dasbor yang ingin Anda bagikan dengan seluruh tim, itu spreadsheet baru setiap pagi."

**Amazon QuickSight** adalah layanan business intelligence (BI) terkelola AWS. Ia terhubung langsung ke Athena, S3, RDS, Redshift, dan sumber lain, dan membiarkan Anda membangun dasbor dan visualisasi tanpa server BI terpisah.

Fitur kunci:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight bisa mengimpor dataset ke mesin in-memory-nya untuk performa kueri sub-detik pada skala besar, tanpa mengkueri ulang Athena pada setiap pemuatan dasbor
- **ML Insights:** deteksi anomali dan peramalan bawaan—tanpa ilmu data diperlukan
- **Dasbor tersemat:** Anda bisa menyematkan dasbor QuickSight ke aplikasi web Anda sendiri via URL

Tom menghubungkan QuickSight ke sumber data Athena dan memiliki dasbor yang berfungsi menampilkan pesanan harian, pendapatan menurut restoran, dan corong konversi dalam satu sore.

"Berapa biayanya per bulan?" tanyanya—lalu menjawab pertanyaannya sendiri sebelum siapa pun bisa. "QuickSight berjalan sekitar $24/bulan per author—orang yang membangun dasbor—dan $3/bulan per reader. Kita punya empat orang yang akan menggunakannya."

"Jadi sekitar seratus dolar sebulan," kata Maya.

"Untuk layanan BI yang jika tidak akan membutuhkan menjalankan server analitik terpisah," kata Priya. "Ya."

Tom memublikasikan dasbor. Keesokan paginya, alih-alih menjalankan kueri Athena, seluruh tim membuka sebuah URL.

> **Tips Ujian — QuickSight**
>
> QuickSight adalah layanan BI dan visualisasi terkelola AWS. Terhubung ke Athena, S3, Redshift, RDS. SPICE adalah mesin kueri in-memory yang mempercepat kueri dasbor yang berulang. Pemicu ujian: "dasbor business intelligence di AWS" atau "visualisasikan data dari Athena/Redshift" → QuickSight.

## Mengatur Lake: AWS Lake Formation

Saat data lake Nimbus tumbuh, akses data menjadi masalah tata kelola.

"Siapa yang bisa mengkueri log transaksi mentah?" tanya Priya, di tinjauan arsitektur berikutnya. "Siapa yang bisa melihat PII pelanggan? Siapa yang bisa mengakses tabel ringkasan keuangan?"

"Engineering memiliki akses penuh," kata Leo. "Tim analitik memiliki akses ke tabel teragregasi. Finance memiliki akses ke tabel pendapatan."

"Dikonfigurasi di mana?"

Leo berhenti. "Di... beberapa tempat berbeda. Kebijakan bucket S3, kebijakan IAM, izin katalog Glue."

"Tiga sistem terpisah, yang semuanya harus konsisten," kata Priya. "Apa yang terjadi ketika kita menambahkan analis baru? Atau ketika kita memutuskan untuk membatasi akses ke kolom tertentu—katakanlah nomor telepon pelanggan—dari tim analitik?"

Pertanyaan itu mengungkap kesenjangannya. Mengelola akses data berbutir-halus lintas kebijakan bucket S3, IAM, dan Glue Data Catalog secara bersamaan itu rapuh.

**AWS Lake Formation** adalah layanan terkelola yang memusatkan kontrol akses untuk data lake Anda. Alih-alih mengelola kebijakan bucket, kebijakan IAM, dan izin katalog Glue secara terpisah, Lake Formation menyediakan satu tempat untuk memberikan izin tingkat-kolom, tingkat-baris, dan tingkat-tabel pada data Anda.

Fitur kunci:

- Berada di atas S3 dan Glue Data Catalog—tanpa migrasi data diperlukan
- **Kontrol akses berbutir-halus:** berikan pengguna atau peran tertentu akses ke tabel, kolom, atau bahkan baris yang difilter tertentu—setara dengan izin tingkat-database pada data S3
- **Pemfilteran data:** ketika seorang pengguna mengkueri tabel yang diatur Lake Formation via Athena, Lake Formation secara otomatis memfilter kolom atau baris yang tidak diizinkan mereka lihat

Priya menyiapkan Lake Formation dengan tiga tingkat izin, dengan Rafael menyusun aturan tingkat-kolom: peran engineering melihat semua tabel dan semua kolom. Peran analitik melihat tabel pesanan teragregasi tetapi bukan kolom PII pelanggan. Peran finance melihat tabel pendapatan dengan pengidentifikasi pelanggan disamarkan.

"Jadi analis menjalankan kueri Athena yang sama," Leo memastikan. "Tetapi Lake Formation mencegatnya dan menanggalkan kolom yang tidak mereka berwenang lihat?"

"Benar. Pemfilterannya otomatis. Analis tidak perlu tahu itu terjadi—dan mereka tidak bisa menyiasatinya dengan mengkueri file S3 mentah secara langsung, karena Lake Formation mengontrol akses pada tingkat katalog."

"Itu bukan pekerjaan ekstra," kata Priya. "Itu desainnya."

> **Tips Ujian — Lake Formation**
>
> Lake Formation memusatkan kontrol akses untuk data lake yang dibangun di S3 dan Glue Data Catalog. Mendukung izin berbutir-halus pada tingkat tabel, kolom, dan baris. Pemicu ujian: "batasi akses ke kolom tertentu di data lake S3" atau "pusatkan tata kelola data lake" → Lake Formation. Perbedaan kunci dari IAM mentah: Lake Formation menegakkan pemfilteran tingkat-kolom dan tingkat-baris yang tidak bisa diekspresikan kebijakan IAM saja.

## Kekuatan dan Keterbatasan

**Kinesis Data Streams**: Gunakan Kinesis ketika data Anda tiba secara terus-menerus dan urutan penting—clickstream, transaksi keuangan, telemetri IoT. Kinesis mempertahankan urutan record dalam shard dan mengizinkan replay selama jendela retensi yang dikonfigurasi (24 jam secara default, hingga 365 hari dengan Extended Data Retention), yang membuatnya secara fundamental berbeda dari SQS. Trade-off-nya adalah kompleksitas operasional: dalam mode provisioned, Anda mengelola kapasitas shard dan perilaku konsumen. Untuk antrian tugas sederhana di mana urutan tidak penting dan replay tidak dibutuhkan, SQS adalah pilihan yang lebih sederhana.

**AWS Glue**: Glue menghilangkan infrastruktur dari klaster ETL tradisional. Anda menulis logika transformasi; AWS mengelola lingkungan Spark. Ini berharga ketika transformasi kompleks atau volume data besar. Keterbatasannya adalah biaya dan cold start—Glue job memiliki penundaan startup beberapa menit, membuatnya tidak cocok untuk transformasi mendekati-real-time. Untuk konversi format file sederhana (CSV ke Parquet), overhead Glue mungkin tidak sepadan dibandingkan fungsi Lambda atau skrip ringan.

**Amazon Athena**: Athena membiarkan Anda mengkueri data S3 dengan SQL standar dan tanpa infrastruktur untuk dikelola. Batasan kritisnya adalah biaya: Athena menagih per terabyte data yang dipindai. Kueri terhadap tabel 10 TB yang memindai keseluruhannya berbiaya jauh lebih daripada kueri yang sama terhadap tabel berformat-Parquet dan terpartisi yang memindai 200 GB. Selalu gunakan format kolumnar (Parquet atau ORC) dan partisi data Anda sebelum menjalankan Athena di produksi. Tanpa optimisasi ini, tagihan Athena bisa mengejutkan Anda.

## Ringkasan

Pekerjaan jaringan di bab 25 membuat pipeline data Nimbus mungkin. Bab ini adalah untuk apa pipeline itu: membuat semua data yang telah dihasilkan Nimbus benar-benar terlihat dan dapat ditindaklanjuti.

- **Amazon Kinesis**: Streaming data real-time. Produser menulis record; konsumen membaca dengan kecepatannya sendiri. Amazon Data Firehose kemudian bisa mengirim data streaming ke S3, Redshift, dan tujuan lain dengan lebih sedikit pekerjaan operasional.
- **AWS Glue**: ETL dan pengatalogan data. Crawler menemukan skema; Job mentransformasi data; Data Catalog membuat data dapat ditemukan oleh Athena dan alat lain.
- **Amazon Athena**: SQL serverless pada S3. Kueri data apa pun di S3 menggunakan SQL standar. Diberi harga per TB yang dipindai—gunakan Parquet dan partisi untuk meminimalkan biaya.
- **Amazon Redshift**: Data warehouse terkelola untuk analitik performa tinggi. Muat data, optimalkan untuk kueri analitik berulang, dan kueri cepat pada skala warehouse.
- **Pola data lake**: data mentah ke S3 → Glue mentransformasinya → Athena mengkuerinya → alat BI memvisualisasikannya.
- **Evolusi skema Glue**: Pipeline ETL yang memproses data eksternal harus menangani perubahan skema dengan anggun. Gunakan DynamicFrame dengan `mergeSchema: true` untuk menghindari kegagalan pipeline ketika data hulu menambahkan field baru.
- **Athena Workgroup**: batas pemindaian data per-tim dan lokasi hasil. Kontrol biaya dan kontrol akses dalam satu konfigurasi. Diperlukan untuk deployment Athena multi-tim apa pun.
- **Kinesis vs SQS**: Kinesis untuk fan-out ke beberapa konsumen dan kemampuan replay. SQS Standard untuk antrian tugas sederhana; SQS FIFO untuk pemrosesan tugas terurut dan terdeduplikasi. Pertanyaan yang menentukan: apakah setiap konsumen perlu melihat setiap pesan, atau apakah setiap pesan masuk ke satu konsumen?
- **Ketika Athena salah**: dasbor berfrekuensi tinggi (gunakan Redshift), kueri operasional (gunakan RDS atau DynamoDB), dataset sangat kecil yang sering berubah (cukup gunakan database).
- **Amazon QuickSight**: Layanan BI terkelola AWS. Terhubung ke Athena, S3, Redshift, dan RDS untuk membangun dasbor tanpa menjalankan server BI terpisah. SPICE adalah mesin in-memory yang mempercepat kueri dasbor berulang.
- **AWS Lake Formation**: Kontrol akses terpusat untuk data lake di S3 + Glue Data Catalog. Memungkinkan izin tingkat-kolom, tingkat-baris, dan tingkat-tabel—tata kelola data berbutir-halus yang tidak bisa diekspresikan IAM saja.

## Tips Ujian

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.5)*

- **Kinesis vs SQS**: Kinesis = streaming terurut, real-time, beberapa konsumen, replay dalam jendela retensi (24 jam default, hingga 365 hari). SQS = antrian tugas, setiap pesan diproses sekali. "Beberapa konsumen membaca stream yang sama secara bersamaan" → Kinesis. "Satu pekerja per pesan" → SQS.
- **Sinyal ujian Athena**: "SQL serverless pada S3," "analisis data S3 tanpa memuatnya ke database," "bayar per kueri" → Athena.
- **Optimisasi biaya Athena**: Format kolumnar (Parquet atau ORC) + partisi secara dramatis mengurangi data yang dipindai dan biaya. Ujian mungkin menanyakan cara mengurangi biaya Athena.
- **Harga Athena**: $5 per TB yang dipindai (us-east-1, us-west-2, dan sebagian besar region utama). Biaya dihitung pada data yang dipindai, bukan data yang dikembalikan—selalu optimalkan format penyimpanan sebelum menjalankan kueri produksi.
- **Glue Crawler**: "Temukan skema data S3 secara otomatis" → Glue Crawler.
- **Amazon Data Firehose**: "Muat data streaming secara otomatis ke S3/Redshift/OpenSearch tanpa mengelola konsumen" → Amazon Data Firehose. Materi lama mungkin masih menyebutnya Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift untuk kueri berfrekuensi tinggi dan kompleks pada dataset tetap (dasbor BI). Athena untuk kueri ad-hoc pada data S3 yang sering berubah.
- **EMR (Elastic MapReduce)**: Klaster Hadoop/Spark terkelola AWS. Ujian menggunakan ini ketika "beban kerja Hadoop/Spark yang ada" atau "framework pemrosesan data kustom" disebutkan. Glue adalah alternatif terkelola untuk sebagian besar kasus penggunaan.
- **QuickSight:** BI dan visualisasi terkelola AWS. Terhubung ke Athena, S3, Redshift, RDS. SPICE = mesin in-memory untuk kueri berulang yang cepat. Pemicu ujian: "dasbor business intelligence di AWS" → QuickSight.
- **Lake Formation:** Kontrol akses terpusat untuk data lake (S3 + Glue Data Catalog). Izin berbutir-halus: tingkat tabel, kolom, dan baris. Pemicu ujian: "batasi akses ke kolom tertentu di data lake S3" atau "pusatkan tata kelola data lake" → Lake Formation.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara Amazon Kinesis dan Amazon SQS. Kapan Anda akan menggunakan masing-masing?

*(Petunjuk: Pikirkan berapa banyak konsumen yang bisa membaca data yang sama, apakah pesan dihapus setelah dibaca, dan apakah urutan penting.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan ride-sharing ingin menganalisis data perjalanan. 1 juta perjalanan diselesaikan setiap hari. Record perjalanan disimpan di S3 sebagai file JSON (kira-kira 2KB masing-masing). Tim analitik ingin menjalankan kueri SQL ad-hoc seperti "rata-rata durasi perjalanan menurut kota minggu lalu." Kueri harus selesai dalam di bawah 2 menit. Biaya penyimpanan harus diminimalkan. Tim akan menjalankan 20-30 kueri per minggu.

Arsitektur mana yang PALING memenuhi persyaratan ini?

A) Gunakan AWS Glue untuk mengonversi JSON ke format Parquet yang dipartisi berdasarkan tanggal dan kota; kueri dengan Amazon Athena  
B) Muat data perjalanan ke RDS PostgreSQL setiap hari; kueri menggunakan SQL standar  
C) Gunakan Amazon Data Firehose untuk mengirim data perjalanan ke Amazon Redshift; kueri dengan Redshift  
D) Muat data perjalanan ke DynamoDB dan gunakan PartiQL untuk kueri SQL

**Petunjuk 1**: 20-30 kueri per minggu adalah frekuensi rendah. Layanan mana yang paling hemat biaya untuk kueri sesekali?

**Petunjuk 2**: Format Parquet + partisi secara dramatis mengurangi data yang dipindai oleh Athena—dan karenanya biaya.

**Petunjuk 3**: 1 juta perjalanan × 2KB = ~2GB per hari. Selama seminggu, ~14GB. Pada $5/TB untuk Athena, bahkan tanpa optimisasi, ini terjangkau.

**Jawaban**: A

**Penjelasan**: Glue mengonversi JSON ke Parquet (format kolumnar secara dramatis mengurangi data yang dipindai) yang dipartisi berdasarkan tanggal dan kota (partition pruning berarti kueri "minggu lalu" hanya memindai 7 hari partisi). Athena mengkueri S3 langsung dengan SQL standar. Untuk 20-30 kueri per minggu, Athena bayar-per-kueri sangat hemat biaya vs Redshift yang selalu berjalan.

**Mengapa bukan B?** Memuat 2GB data setiap hari ke RDS, lalu mengkueri, membutuhkan instance database yang berjalan 24/7. Untuk 20-30 kueri per minggu, ini sangat over-engineered dan mahal.

**Mengapa bukan C?** Redshift hemat biaya untuk kueri berfrekuensi tinggi (ratusan per hari pada dataset yang sama). Untuk 20-30 kueri per minggu, klaster Redshift yang selalu menyala berbiaya jauh lebih daripada harga per-kueri Athena.

**Mengapa bukan D?** DynamoDB adalah penyimpanan key-value/dokumen yang dioptimalkan untuk akses berbasis-kunci, bukan kueri analitik ad-hoc. PartiQL pada DynamoDB tidak mendukung jenis agregasi GROUP BY yang dijelaskan.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.5*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin membangun sistem deteksi penipuan real-time untuk pesanan. Sistem harus:

- Mendeteksi pesanan yang ditempatkan oleh akun yang sama lebih dari 5 kali dalam 60 detik
- Menandai pesanan di atas $500 dari akun baru (< 30 hari)
- Mengirim pesanan yang ditandai ke antrian tinjauan manusia

Rancang arsitekturnya. Apa yang disediakan Kinesis? Di mana logika penipuan berjalan? Bagaimana Anda mengorelasikan "akun yang sama, jendela 60-detik"? Layanan apa yang menerima pesanan yang ditandai?

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih desain arsitektur streaming real-time.)*

## Adegan Pasca Kredit

Tom menjalankan kueri Athena pertama.

"Top 10 restoran berdasarkan pendapatan kuartal lalu," katanya.

12 detik kemudian, hasilnya muncul.

Ia menatapnya.

"Restoran 47 adalah yang pertama," katanya. Itu adalah restoran keluarga Maya—yang tempat Nimbus dimulai.

"Tentu saja," kata Maya. "Arepa-nya memang sebagus itu."

Tom menjalankan kueri lain. Dan lagi. "Berapa biayanya per bulan?" tanya Tom sebelum Leo bisa mengatakan apa pun. Leo memeriksa riwayat pemindaian kueri. Tiga kueri, total data dipindai: 1,2GB. Biaya: kurang dari satu sen.

Setelah satu jam, Tom memiliki gambaran lengkap bisnis Nimbus dengan cara yang belum pernah ia miliki sebelumnya. Kategori restoran mana yang tumbuh tercepat. Kohort pelanggan mana yang bertahan terlama. Item menu mana yang mendorong paling banyak pesanan berulang.

"Mengapa kita tidak membangun ini lebih cepat?" tanyanya.

"Kita punya datanya," kata Leo. "Kita hanya tidak punya pipeline untuk menggunakannya."

"Datanya selalu ada di sana," kata Maya pelan. "Kita hanya tidak bisa melihatnya."

Pada bab berikutnya: sekarang kita bisa melihat bisnis dengan jelas, mari kita bicara tentang cara membayar infrastruktur yang menjalankannya—dengan lebih efisien.
