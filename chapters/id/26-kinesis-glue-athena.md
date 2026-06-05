# Babat 26: Memahami Semuanya

Data itu mentah: stempel waktu, klik, kejadian, angka. Informasi adalah apa yang Anda dapatkan ketika data diorganisasikan, diproses, dan diberi konteks. Kesenjangan antara keduanya adalah tempat bab ini berada.

Dan dalam sistem yang berkembang, kesenjangan ini menjadi mahal dengan cepat.

Nimbus menghasilkan sejumlah besar data. Setiap pesanan: dicatat. Setiap tampilan menu: dicatat. Setiap pembaruan restoran: ditangkap. Setiap interaksi pelanggan: dilacak.

Tom memiliki pertanyaan.

“Berapa waktu pemesanan terpadat pada hari Jumat?”

Leo melihatnya. “Itu tidak ada di dasbor kami.”

“Bisakah kita menambahkannya?”

“Data ada di DynamoDB. Dan di log CloudWatch. Dan di S3 dari pekerjaan ekspor analitik.” Leo berhenti sejenak. “Di tiga tempat berbeda, dalam tiga format berbeda.”

Maya menambahkan: “Dan pekerjaan ekspor analitik hanya berjalan sekali semalam. Jika Anda ingin data Jumat, Anda harus menunggu sampai pagi Sabtu.”

Tom melihat ke layar. “Jadi kita memiliki datanya. Kita hanya tidak bisa menggunakannya.”

Kalimat ini menggambarkan setengah dari analisis modern.

Ini adalah masalah rekayasa data: Anda memiliki data, tetapi itu tidak dalam bentuk yang dapat Anda analisis ketika Anda membutuhkannya.

**Tiga Masalah Berbeda**

Masalah data Nimbus memiliki tiga dimensi:

**Streaming Real-time**: Pesanan sedang ditempatkan saat ini. Anda ingin melihat dasbor langsung tentang kecepatan pesanan — berapa banyak per menit, berdasarkan wilayah, berdasarkan restoran. Data perlu diproses saat tiba.

**Transformasi Data**: Data ada di S3 dari berbagai sistem, dalam format yang berbeda (JSON, CSV, Parquet). Sebelum Anda dapat menganalisisnya, Anda perlu menormalkannya — skema yang sama, format yang sama, dibersihkan, digabungkan dengan data referensi.

**Analisis Ad-hoc**: Setelah data diorganisasikan, Anda ingin menjalankan kueri SQL terhadapnya tanpa harus memuatnya ke dalam database terlebih dahulu. “Berikan saya 10 restoran teratas berdasarkan pendapatan dalam 30 hari terakhir.” Tanpa memuat data ke dalam database.

Setiap dari ini adalah masalah yang berbeda. AWS menyediakan layanan khusus untuk masing-masing:

- **Amazon Kinesis**: Data streaming real-time
- **AWS Glue**: Transformasi data dan katalogisasi
- **Amazon Athena**: Kueri SQL tanpa server pada S3

**Amazon Kinesis: Ticker Tape Waktu Nyata**

**Amazon Kinesis Data Streams** adalah layanan streaming data real-time. Produsen mengirimkan catatan data ke aliran. Beberapa konsumen dapat membaca dari aliran secara bersamaan, masing-masing pada kecepatan mereka sendiri.

Bayangkan mesin ticker tape: harga dicetak terus menerus, semua orang dapat membaca pita, dan pita tidak melambat untuk pembaca individu mana pun.

Untuk Nimbus, ketika pesanan ditempatkan, aplikasi menerbitkan acara ke aliran Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Konsumen dari aliran ini:

- Dasbor waktu nyata (membaca acara saat tiba, memperbarui metrik)
- Lambda deteksi penipuan (mencari pola pesanan yang tidak biasa)
- Aliran ke S3 untuk penyimpanan permanen

**Konsep Kinesis Data Streams**:

- **Shard**: Unit kapasitas dasar. Satu shard menangani 1 MB/s tulis, 2 MB/s baca.
- **Periode retensi**: Data tetap berada di aliran selama 24 jam (default) hingga 7 hari.
- **Nomor urutan**: Setiap catatan memiliki nomor urutan. Konsumen melacak posisi mereka dalam aliran.

**Amazon Data Firehose** (dulu **Kinesis Data Firehose**): Layanan pengiriman yang dikelola antara produsen streaming dan tujuan seperti S3, Redshift, dan OpenSearch. Ini mengantre, mengompres, mentransformasikan, dan mengirimkan data secara otomatis.

Untuk Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (format Parquet, terkompresi, dipartisi berdasarkan tanggal).

**AWS Glue: Penerjemah**

Data di S3 mentah. Sebelum Anda dapat menganalisisnya secara efisien, Anda perlu:

- Menemukan apa yang ada dan skemanya (kolom apa, jenis apa)
- Mentransformasikannya menjadi format yang konsisten
- Menggabungkan berbagai dataset bersama-sama
- Menangani catatan buruk, perubahan skema, nilai yang hilang

**AWS Glue** adalah layanan ETL (Ekstrak, Transformasi, Muat) yang dikelola sepenuhnya. Ini memiliki dua komponen utama:

**Glue Data Catalog**: Sebuah penyimpanan metadata yang menjelaskan data S3 Anda — tabel apa yang ada, kolom apa yang mereka miliki, di mana file data berada. Ini seperti katalog kartu untuk danau data Anda.

**Glue Crawlers**: Agen otomatis yang memindai S3, menyimpulkan skema, dan mengisi Data Catalog. Jalankan crawler pada bucket S3 Anda dan 10 menit kemudian Anda memiliki katalog dari semua tabel Anda.

**Glue Jobs**: Pekerjaan Spark/Python tanpa server yang melakukan transformasi aktual. Anda menulis logika transformasi (atau menggunakan alat ETL visual Glue), dan Glue menjalankannya pada infrastruktur yang dikelola.

Untuk Nimbus:

1. Glue Crawler memindai data pesanan di S3 → membuat definisi tabel di Glue Data Catalog
2. Glue Job mentransformasikan peristiwa pesanan JSON mentah menjadi format Parquet bersih, yang dipartisi, dalam format yang dioptimalkan untuk kueri
3. Data yang telah diubah ditulis kembali ke S3 dalam tata letak yang dioptimalkan untuk kueri

**Amazon Athena: Pustakawan**

**Amazon Athena** adalah layanan kueri tanpa server, interaktif yang menjalankan kueri SQL langsung pada data S3. Tidak perlu menyediakan database, tidak perlu memuat data. Anda mendefinisikan tabel (atau menggunakan Glue Data Catalog), menulis SQL, dan Athena menjalankan kueri terhadap file S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

```markdown
Athena pricing didasarkan pada jumlah data yang dipindai oleh sebuah query. Di banyak wilayah, query SQL standar dimulai dari $5 per terabyte yang dipindai. Menggunakan format Parquet (berkolom) dengan pemangkasan partisi (`WHERE year='2024' AND month='01'`) berarti Athena hanya memindai file yang dibutuhkan, yang secara dramatis mengurangi biaya.

"Kita bisa menjalankan query ini untuk 30 hari data," kata Leo, "dan mungkin biayanya akan sangat kecil jika kita menyimpannya dengan baik."

"Untuk pertanyaan arbitrer apa pun yang bisa kita pikirkan?" tanya Tom.

"Untuk pertanyaan apa pun yang bisa kita nyatakan dalam SQL, terhadap data apa pun yang telah kita simpan di S3."

Tom tampak seperti sedang menghitung ulang nilai dari semua data yang telah mereka buang-buang.

**Arsitektur Data Lake**

Tiga layanan ini bergabung menjadi apa yang disebut **arsitektur data lake** — repositori S3 terpusat untuk semua data Anda, dengan alat untuk memproses dan menanyainya:
```

```
Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)
```

```markdown
The raw data selalu dipertahankan (di bucket S3 asli). Data yang telah diubah dapat dipertanyakan melalui Athena. Pertanyaan-pertanyaan baru selalu dapat dijawab dengan menjalankan pekerjaan Glue baru pada data mentah.

**Amazon Redshift: Ketika Athena Tidak Cukup**

Untuk beberapa kasus penggunaan, Athena terlalu lambat atau terlalu mahal:

- Kueri yang sangat kompleks dengan banyak penggabungan
- Dasbor yang menjalankan kueri yang sama ribuan kali per hari
- Pembelajaran mesin pada data terstruktur
- Persyaratan waktu respons sub-detik untuk alat BI

**Amazon Redshift** adalah gudang data yang dikelola sepenuhnya: basis data analitik kolom yang dirancang untuk beban kerja analitis besar dan berulang. Tidak seperti Athena, yang menanyakan data di mana ia berada di S3, Redshift memuat data ke dalam penyimpanan gudang yang dioptimalkan dan menggunakan optimasi kueri, strategi penyortiran, dan strategi distribusi untuk mempercepat analitik kompleks.

Redshift secara signifikan lebih cepat untuk kueri analitik kompleks dengan mengorbankan biaya (kapasitas yang di-provision) dan persyaratan untuk memuat data sebelum menanyakan.

**Redshift Serverless** menghilangkan beban perencanaan kapasitas — Anda menanyakan, Redshift menskalakan. Biayanya per kueri.

Untuk Nimbus pada skala mereka saat ini: Athena sudah cukup. Pada lima kali volume data dan dengan alat BI yang menanyakan dasbor ratusan kali per hari, Redshift akan menjadi hemat biaya.

## Kekuatan dan Batasan

**Kinesis Data Streams**: Gunakan Kinesis ketika data Anda tiba secara terus-menerus dan urutan penting — klikstream, transaksi keuangan, telemetri IoT. Kinesis mempertahankan urutan rekaman dalam shard dan memungkinkan pemutaran selama jendela retensi yang dikonfigurasi, yang membuatnya secara fundamental berbeda dari SQS. Perubahannya adalah kompleksitas operasional: dalam mode yang di-provision, Anda mengelola kapasitas shard dan perilaku konsumen. Untuk antrian tugas sederhana di mana urutan tidak penting dan pemutaran tidak diperlukan, SQS adalah pilihan yang lebih sederhana.

**AWS Glue**: Glue menghilangkan infrastruktur dari klaster ETL tradisional. Anda menulis logika transformasi; AWS mengelola lingkungan Spark. Ini berharga ketika transformasi kompleks atau volume data besar. Batasannya adalah biaya dan *cold start* — pekerjaan Glue memiliki penundaan awal beberapa menit, sehingga tidak cocok untuk transformasi *near-real-time*. Untuk konversi format file sederhana (CSV ke Parquet), overhead Glue mungkin tidak sepadan dengan fungsi Lambda atau skrip ringan untuk volume data yang kecil.

**Amazon Athena**: Athena memungkinkan Anda menanyakan data S3 dengan SQL standar dan tanpa mengelola infrastruktur apa pun. Batasan utamanya adalah biaya: Athena mengenakan biaya per terabyte data yang dipindai. Kueri terhadap tabel 10 TB yang memindai semuanya akan menelan biaya secara signifikan lebih banyak daripada kueri yang sama terhadap tabel yang diformat Parquet yang dipartisi yang memindai 200 GB. Selalu gunakan format kolom (Parquet atau ORC) dan partisi data Anda sebelum menjalankan Athena dalam produksi. Tanpa pengoptimalan ini, tagihan Athena dapat mengejutkan Anda.

## Ringkasan

- **Amazon Kinesis**: Streaming data real-time. Produsen menulis rekaman; konsumen membaca dengan kecepatan mereka sendiri. Amazon Data Firehose kemudian dapat mengirimkan data streaming ke S3, Redshift, dan tujuan lainnya dengan lebih sedikit pekerjaan operasional.
- **AWS Glue**: ETL dan katalogisasi data. Crawler menemukan skema; Pekerjaan mentransformasikan data; Katalog Data membuat data dapat ditemukan oleh Athena dan alat lainnya.
- **Amazon Athena**: SQL tanpa server pada S3. Tanyakan data apa pun di S3 menggunakan SQL standar. Dikenakan biaya per TB yang dipindai — gunakan Parquet dan partisi untuk meminimalkan biaya.
- **Amazon Redshift**: Gudang data yang dikelola untuk analitik berkinerja tinggi. Muat data ke dalamnya, optimalkan untuk kueri analitis berulang, dan tanyakan dengan cepat pada skala gudang.
- Pola *data lake*: data mentah ke S3 → Glue mentransformasikan data → Athena menanyakannya → Alat BI memvisualisasikannya.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.5)*

- **Kinesis vs SQS**: Kinesis = diurutkan, streaming real-time, banyak konsumen, pemutaran dalam jendela retensi. SQS = antrian tugas, setiap pesan diproses sekali. "Beberapa konsumen membaca aliran yang sama secara bersamaan" → Kinesis. "Satu pekerja per pesan" → SQS.
- **Sinyal ujian Athena**: "SQL tanpa server pada S3," "analisis data S3 tanpa memuatnya ke database," "bayar per kueri" → Athena.
- **Optimasi biaya Athena**: Format kolom (Parquet atau ORC) + partisi secara drastis mengurangi data yang dipindai dan biaya. Ujian mungkin menanyakan bagaimana mengurangi biaya Athena.
- **Glue Crawler**: "Temukan skema data S3 secara otomatis" → Glue Crawler.
- **Amazon Data Firehose**: "Secara otomatis memuat data streaming ke S3/Redshift/OpenSearch tanpa mengelola konsumen" → Amazon Data Firehose. Bahan-bahan lama mungkin masih menyebutnya Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift untuk kueri frekuensi tinggi, kompleks pada dataset tetap (dasbor BI). Athena untuk kueri *ad hoc* pada data S3 yang sering berubah.
- **EMR (Elastic MapReduce)**: Klaster Hadoop/Spark yang dikelola oleh AWS. Ujian menggunakan ini ketika "klaster Hadoop/Spark yang ada" atau "kerangka data pemrosesan khusus" disebutkan. Glue adalah alternatif yang dikelola untuk sebagian besar kasus penggunaan.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara Amazon Kinesis dan Amazon SQS. Kapan Anda akan menggunakannya?
```

*(Petunjuk: Pikirkan tentang berapa banyak konsumen yang dapat membaca data yang sama, apakah pesan dihapus setelah dibaca, dan apakah urutan penting.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan berbagi tumpangan ingin menganalisis data perjalanan. 1 juta perjalanan diselesaikan setiap hari. Catatan perjalanan disimpan di S3 sebagai file JSON (kira-kira 2KB masing-masing). Tim analitik ingin menjalankan kueri SQL *ad-hoc* seperti "durasi perjalanan rata-rata berdasarkan kota minggu lalu." Kueri harus selesai dalam waktu kurang dari 2 menit. Biaya penyimpanan harus diminimalkan. Tim akan menjalankan 20-30 kueri per minggu.

Arsitektur mana yang TERBAIK memenuhi persyaratan ini?

A) Muat data perjalanan ke RDS PostgreSQL setiap hari; kueri menggunakan SQL standar
B) Gunakan AWS Glue untuk mengonversi JSON ke format Parquet yang dipartisi berdasarkan tanggal dan kota; kueri dengan Amazon Athena
C) Gunakan Amazon Data Firehose untuk mengirimkan data perjalanan ke Amazon Redshift; kueri dengan Redshift
D) Muat data perjalanan ke DynamoDB dan gunakan PartiQL untuk kueri SQL

**Petunjuk 1**: 20-30 kueri per minggu adalah frekuensi rendah. Layanan mana yang paling hemat biaya untuk kueri sesekali?

**Petunjuk 2**: Format Parquet + partisi secara dramatis mengurangi data yang dipindai oleh Athena — dan oleh karena itu biaya.

**Petunjuk 3**: 1 juta perjalanan × 2KB = ~2GB per hari. Selama seminggu, ~14GB. Pada $5/TB untuk Athena, bahkan tanpa optimasi, ini terjangkau.

**Jawaban**: B

**Penjelasan**: Glue mengonversi JSON ke Parquet (format kolom secara dramatis mengurangi data yang dipindai) yang dipartisi berdasarkan tanggal dan kota (partisi pruning berarti kueri "minggu lalu" hanya memindai 7 hari partisi). Athena mengkueri S3 secara langsung dengan SQL standar. Untuk 20-30 kueri per minggu, harga per kueri Athena sangat hemat biaya dibandingkan dengan selalu berjalan Redshift.

**Mengapa tidak A?** Memuat 2GB data per hari ke RDS, lalu mengkueri, memerlukan instance database yang berjalan 24/7. Untuk 20-30 kueri per minggu, ini sangat berlebihan dan mahal.

**Mengapa tidak C?** Redshift hemat biaya untuk kueri frekuensi tinggi (ratusan per hari pada dataset yang sama). Untuk 20-30 kueri per minggu, klaster Redshift yang selalu berjalan jauh lebih mahal daripada harga per kueri Athena.

**Mengapa tidak D?** DynamoDB adalah penyimpanan kunci-nilai/dokumen yang dioptimalkan untuk akses berbasis kunci, bukan kueri analitik *ad-hoc*. PartiQL pada DynamoDB tidak mendukung jenis pengelompokan dan agregasi GROUP BY yang dijelaskan.

*SAA-C03 Domain: Rancang Arsitektur Berkinerja — Tugas 3.5*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus ingin membangun sistem deteksi penipuan *real-time* untuk pesanan. Sistem tersebut harus:

- Mendeteksi pesanan yang dilakukan oleh akun yang sama lebih dari 5 kali dalam 60 detik
- Tandai pesanan di atas $500 dari akun baru (< 30 hari)
- Kirim pesanan yang ditandai ke antrian tinjauan manusia

Rancang arsitekturnya. Apa yang disediakan Kinesis? Di mana logika penipuan dijalankan? Bagaimana Anda mengkorelasikan "akun yang sama, jendela 60 detik"? Layanan mana yang menerima pesanan yang ditandai?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk mempraktikkan desain arsitektur *streaming* *real-time*.)*

## Adegan Pasca Kredit

Tom menjalankan kueri Athena pertama.

"Restoran 10 teratas berdasarkan pendapatan tahun lalu," katanya.

12 detik kemudian, hasilnya muncul.

Dia menatapnya.

"Restoran 47 adalah yang pertama," katanya. Itu adalah restoran keluarga Maya — yang satu tempat Nimbus dimulai.

"Tentu saja itu," kata Maya. "Arepa itu enak."

Tom menjalankan kueri lain. Dan lagi. Setiap menjawab dalam detik, setiap berharga sebagian sen.

Setelah satu jam, dia memiliki gambaran lengkap tentang bisnis Nimbus dalam cara yang belum pernah dia miliki sebelumnya. Restoran kategori mana yang tumbuh paling cepat. Kelompok pelanggan mana yang mempertahankan diri terlama. Item menu mana yang mendorong pesanan berulang terbanyak.

"Kenapa kita tidak membangun ini lebih awal?" dia bertanya.

"Kami memiliki datanya," kata Leo. "Kami hanya tidak memiliki pipa untuk menggunakannya."

"Data itu selalu ada," kata Maya dengan tenang. "Kami hanya tidak bisa melihatnya."

Dalam bab berikutnya: sekarang setelah kita dapat melihat bisnis dengan jelas, mari kita bicarakan tentang cara membayar infrastruktur yang menjalankannya — lebih efisien.
