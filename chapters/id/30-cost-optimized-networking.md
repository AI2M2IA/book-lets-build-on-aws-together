# Babat 30: Biaya Tersembunyi

Biaya penyimpanan muncul sebagai satu baris: “S3: $198.” Biaya komputasi muncul sebagai satu baris: “EC2: $2.340.” Biaya jaringan tersebar di puluhan baris dengan nama-nama seperti “Data Transfer Out,” “NAT Gateway Processing,” “VPC Peering Data Transfer,” dan “CloudFront Data Transfer.” Sebagian besar insinyur menjumlahkannya sekali, tertegun, dan menjumlahkannya lagi.

Tom pernah berkata: “Biaya jaringan. Itu berikutnya.”

Dia membuka tagihan. Mencari bagian transfer data. Menjumlahkan semua baris.

Biaya jaringan di AWS seperti sistem tol kota: masuk ke kota gratis, tetapi setiap terowongan yang Anda ambil keluar berbayar, dan berkendara antar lingkungan sedikit juga berbayar. Sebagian besar orang tidak memikirkan tol sampai mereka menerima tagihan di akhir bulan dan menyadari bahwa mereka telah mengambil terowongan setiap hari ketika jalan permukaan gratis tersedia sepanjang waktu. Tujuan dari bab ini adalah untuk memahami setiap pos pemeriksaan tol—dan memutuskan mana yang layak dibayar.

$847/bulan.

“Kami menghabiskan $847 per bulan untuk transfer data,” katanya.

“Apakah itu banyak?” tanya Leo.

“Ini lebih dari tagihan S3 kami sebelumnya ketika kami mengoptimalkannya. Dan saya bahkan tidak tahu kami memiliki tagihan transfer data sebesar ini.”

Maya melihat ke atas. “Apa sebenarnya transfer data?”

“Ini adalah apa yang AWS kenakan untuk memindahkan byte di sekitar. Byte ke AWS: biasanya gratis. Byte keluar dari AWS ke internet: dikenakan biaya. Byte antara layanan di wilayah yang berbeda: dikenakan biaya. Byte yang melewati NAT Gateway: dikenakan biaya.”

“Bisakah Anda memecahnya?”

Tom bisa. Dan apa yang dia temukan mengubah cara tim berpikir tentang arsitektur mereka.

**Cara AWS Mengenakan Biaya untuk Transfer Data**

Harga transfer data AWS tidak simetris:

**Masuk ke AWS (inbound):** Gratis. Anda dapat mengunggah data sebanyak yang Anda inginkan.

**Keluar dari AWS ke internet (outbound):** Dikenakan biaya. 100GB/bulan pertama gratis. Setelah itu:

- $0,09/GB untuk 10TB pertama (wilayah AS)
- $0,085/GB untuk 40TB berikutnya
- Lebih rendah pada volume yang lebih tinggi

**Dalam zona ketersediaan yang sama:** Gratis. Instance EC2 yang berbicara satu sama lain di zona ketersediaan yang sama tidak membayar apa pun.

**Antar zona ketersediaan (wilayah yang sama):** $0,01/GB dalam kedua arah. Biaya kecil tetapi nyata.

**Antar wilayah:** $0,02-0,08/GB tergantung wilayah. Lalu lintas lintas wilayah secara signifikan lebih mahal.

**NAT Gateway:** $0,045/GB yang diproses. Setiap byte instance EC2 pribadi Anda mengirimkan melalui NAT Gateway ke internet—dan setiap byte yang kembali dikenakan biaya.

**CloudFront:** Tingkat transfer data yang lebih rendah daripada AWS langsung ke internet. $0,085/GB untuk 10TB pertama (sedikit kurang dari transfer data keluar langsung). CloudFront sering mengurangi biaya transfer total karena caching tepinya berarti asal mengirim data lebih jarang.

**Rincian Tom**

Setelah mengkategorikan setiap baris:

**Transfer data keluar ke internet:** $214/bulan

- Respons API ke pelanggan di seluruh dunia
- Isi cache CloudFront (ketika lokasi tepi mengambil dari asal)

**Pemrosesan NAT Gateway:** $289/bulan

- Server aplikasi yang memanggil API eksternal (pemroses pembayaran, layanan email, data peta)
- Panggilan DynamoDB melalui NAT Gateway (sebelum endpoint VPC disiapkan untuk beberapa tabel)

**Transfer data antar zona AZ:** $178/bulan

- Load balancer ke instance EC2 (load balancer berada di satu AZ, beberapa instance di yang lain)
- Server aplikasi ke replika RDS baca (di AZ yang berbeda)

**Transfer data lintas wilayah:** $166/bulan

- Replikasi Aurora Global Database (utama di us-east-1, pembaca di us-west-2)
- Replika S3 Lintas Wilayah untuk cadangan

**NAT Gateway: Kejutan Terbesar**

$289/bulan dalam biaya pemrosesan NAT Gateway adalah item terbesar. Dan itu sebagian tidak perlu.

Dalam Bab 11, Tom telah menyiapkan Endpoint Gateway VPC untuk S3 dan DynamoDB. Ini gratis. Tetapi dia melewatkan menyiapkan Endpoint Antarmuka untuk beberapa layanan lainnya:

- Sistem Manager (SSM) untuk manajemen patch
- Secrets Manager untuk pengambilan kredensial
- CloudWatch untuk pengiriman metrik dan log
- SQS untuk polling pesan

Setiap panggilan ke layanan ini dari instance EC2 pribadi sedang melewati NAT Gateway. Setiap panggilan mengenakan biaya $0,045/GB.

**Endpoint Antarmuka** untuk layanan ini: $0,01/jam per AZ + $0,01/GB data yang diproses.

Pada volume Nimbus, Endpoint SSM akan berbiaya sekitar $15/bulan dan menghemat sekitar $43/bulan dalam biaya NAT Gateway (karena SSM menghasilkan volume data yang signifikan untuk panggilan manajemen patch dan parameter store).

Biaya endpoint dan penghematan bervariasi menurut layanan dan volume. Tom menghitung bahwa menyiapkan Endpoint Antarmuka untuk empat layanan lalu lintas tinggi akan berbiaya $62/bulan total dan menghemat sekitar $140/bulan dalam pemrosesan NAT Gateway.

Penghematan bersih: $78/bulan dari pengaturan endpoint saja.

**Lalu lintas lintas AZ: Pertanyaan Arsitektur**

$178/bulan dalam transfer data lintas AZ lebih rumit.

Beberapa dari itu tidak dapat dihindari: load balancer mendistribusikan lalu lintas di seluruh AZ, jadi beberapa permintaan berasal dari satu AZ dan load balancer meneruskannya ke instance di AZ lain.

Beberapa dari itu dapat dioptimalkan: aplikasi dikonfigurasi untuk menulis ke primer RDS (di us-east-1a) dan membaca dari replika baca (di us-east-1b). Setiap kueri baca melintasi batas AZ.

For para pembaca, satu solusi: konfigurasi aplikasi untuk lebih memilih replika baca di dalam AZ (Availability Zone) yang sama dengan instance yang meminta. Setiap AZ memiliki replika baca sendiri. Lalu lintas tetap lokal.

Perimbangan (trade-off): semakin banyak replika baca = semakin tinggi biayanya. Jika biaya lalu lintas lintas-AZ bernilai $50/bulan dan satu replika baca tambahan bernilai $190/bulan, optimasi lokal-AZ tidak menguntungkan.

Tom menghitung: pada volume kueri saat ini, lalu lintas lintas-AZ hanya bernilai $31/bulan dari $178. Tidak sepadan untuk menambahkan replika.

Biaya lintas-AZ lainnya adalah perutean load balancer dan komunikasi antar layanan — sebagian besar tidak terhindarkan pada tingkat arsitektur saat ini.

"Ini adalah salah satu kasus di mana memahami biaya tidak berarti Anda harus memperbaikinya," kata Tom.

"Berapa biaya untuk menghilangkan lalu lintas lintas-AZ sepenuhnya?" tanya Maya.

"Semua dalam satu AZ menghilangkan tujuan Multi-AZ. Itu adalah penghematan $31/bulan dengan biaya kehilangan ketersediaan tinggi."

"Jadi kita biarkan saja," katanya.

"Kita biarkan saja."

Ini adalah percakapan biaya yang matang: terkadang Anda membayar sesuatu karena alternatifnya lebih mahal dalam hal risiko.

**CloudFront: Diskon Transfer Data**

Berikut fakta yang tidak intuitif: menyajikan data melalui CloudFront umumnya lebih murah daripada menyajikannya langsung dari EC2 atau S3.

**EC2 langsung ke internet**: $0,09/GB
**CloudFront ke internet**: $0,085/GB (sedikit lebih murah)

Namun, penghematan sebenarnya bukanlah tingkat per-GB — tetapi CloudFront menyimpan data di lokasi tepi (edge locations). Jika 1.000 pengguna meminta foto menu yang sama:

- **Tanpa CloudFront**: 1.000 permintaan mengenai origin S3 × ukuran foto × $0,09/GB
- **Dengan CloudFront**: 1 permintaan mengenai S3 (cache miss) + 999 permintaan disajikan dari cache tepi di CloudFront dengan tingkat yang berlaku

Untuk Nimbus dengan tingkat hit cache 83% (dari Bab 13), mereka menyajikan 83% permintaan dari cache tepi. Data origin aktual adalah 17% dari total permintaan — 83% dari lalu lintas "keluar" mereka di-cache di tepi.

"CloudFront bukan hanya CDN (Content Delivery Network) untuk kinerja," kata Tom. "Ini juga optimasi biaya untuk transfer data."

Leo tampak berpikir. "Kita harus memindahkan semua pengiriman konten statis melalui CloudFront, bahkan untuk aset yang tidak sensitif terhadap latensi."

"Benar. Jika pengguna mengunduhnya dari AWS, itu harus melalui CloudFront."

**S3 Select: Mengurangi Transfer Data dalam Kueri**

Optimasi yang halus: **S3 Select** memungkinkan Anda mengambil hanya baris dan kolom yang Anda butuhkan dari sebuah objek S3 (CSV, JSON, Parquet), daripada mengunduh seluruh file untuk memfilternya di aplikasi Anda.

Tanpa S3 Select:

```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

With S3 Select:

## S3 Select

S3 Select memungkinkan Anda untuk mengambil subset data dari objek S3 Anda menggunakan klausa SQL. Ini sangat berguna ketika Anda hanya membutuhkan sebagian kecil dari data yang ada dalam objek S3 yang besar.  Dengan S3 Select, Anda tidak perlu mengunduh seluruh objek ke instance EC2 atau layanan lain untuk memprosesnya.  Anda dapat secara langsung memproses data di S3 menggunakan SQL.

Ini memungkinkan Anda untuk:

*   Mengekstrak kolom tertentu.
*   Memfilter data berdasarkan kondisi tertentu.
*   Mengagregasi data.

S3 Select bekerja dengan membagi objek S3 Anda menjadi halaman-halaman kecil dan kemudian menjalankan kueri SQL pada halaman-halaman tersebut.  Ini secara signifikan mengurangi biaya dan waktu yang dibutuhkan untuk memproses data besar.

```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

```markdown
S3 Select mengurangi data yang ditransfer dari S3 ke aplikasi Anda. Untuk file besar dengan kueri selektif, ini dapat berupa pengurangan volume data 10-100x — dan oleh karena itu, biaya.

**Optimalisasi Jaringan Lengkap**

Setelah tiga minggu analisis dan implementasi:

| Item Biaya                               | Sebelum   | Setelah    | Penghematan Bulanan |
|------------------------------------------|----------|----------|--------------------|
| NAT Gateway (Titik Akhir Antarmuka)       | $289     | $211     | $78                |
| Optimalisasi CloudFront (pindahkan lebih banyak aset) | $214     | $147     | $67                |
| Lalu lintas antar Zona Wilayah (diterima sebagaimana adanya) | $178     | $178     | $0                 |
| Lalu lintas antar Wilayah (diterima sebagaimana adanya) | $166     | $166     | $0                 |
| **Total**                                | **$847** | **$702** | **$145/bulan**       |

$145/bulan, $1.740/tahun dalam penghematan jaringan. Modest dibandingkan dengan komputasi dan penyimpanan, tetapi bermakna.

Lebih penting lagi: Tom sekarang memahami setiap baris dari tagihan jaringan. Dia dapat menjelaskan setiap biaya dan telah secara sadar memutuskan untuk mengoptimalkan mana dan mana yang harus diterima.

## Kekuatan dan Batasan

**Biaya NAT Gateway:**

- Volume data besar melalui NAT Gateway menumpuk dengan cepat
- VPC Endpoints menghilangkan beberapa biaya NAT sepenuhnya
- Tinjau layanan mana yang dipanggil oleh instance pribadi Anda dan apakah endpoint tersedia

**CloudFront untuk Biaya:**

- Tingkat hit cache secara langsung menentukan penghematan biaya
- Tingkat hit cache tinggi = transfer asal yang lebih rendah + biaya transfer keseluruhan yang lebih rendah
- Pindahkan semua pengiriman aset statis melalui CloudFront

**Trade-off antar Zona Wilayah:**

- Menghilangkan lalu lintas antar Zona Wilayah biasanya memerlukan perubahan arsitektur yang berbiaya lebih mahal daripada penghematan
- Hitung dengan hati-hati sebelum mengoptimalkan

**S3 Select:**

- Penghematan signifikan untuk kueri selektif pada objek S3 besar
- Tidak membantu ketika Anda membutuhkan seluruh file

Dalam bab berikutnya: kerangka kerja enam pilar yang mengajukan pertanyaan yang seharusnya dimulai setiap tinjauan arsitektur.

## Ringkasan

- AWS mengenakan biaya untuk **data keluar** (internet: ~$0,09/GB), **lalu lintas antar Zona Wilayah** ($0,01/GB setiap arah), **lalu lintas antar Wilayah** ($0,02-0,08/GB), dan **pemrosesan NAT Gateway** ($0,045/GB).
- **Data masuk** gratis. **Lalu lintas yang sama dengan Zona Wilayah** gratis.
- **Titik Akhir Gerbang VPC** (S3, DynamoDB): Gratis. Menghilangkan biaya NAT Gateway untuk layanan ini.
- **Titik Akhir Antarmuka VPC**: Dihargai per jam ditambah per GB. Lebih murah daripada NAT Gateway untuk layanan volume tinggi.
- **CloudFront** menyajikan data dengan tingkat yang lebih rendah daripada EC2-ke-internet langsung dan secara drastis mengurangi volume transfer asal melalui caching.
- **S3 Select** mengurangi transfer data dari S3 dengan memfilter di sumber.
- Beberapa biaya jaringan adalah trade-off arsitektur (antar Zona Wilayah untuk HA) — pahami mereka, jangan selalu menghilangkannya.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Biaya yang Dioptimalkan (Domain 4, Tugas 4.4)*

- **NAT Gateway vs VPC Endpoints**: Skenario Ujian: "EC2 di subnet pribadi sering memanggil S3/DynamoDB — bagaimana mengurangi biaya NAT Gateway?" → VPC Gateway Endpoints (gratis untuk S3 dan DynamoDB).
- **Aturan Harga Transfer Data**:
  - Masuk ke AWS: gratis
  - Sama dengan Zona Wilayah: gratis
  - Antar Zona Wilayah: dikenakan biaya
  - Antar Wilayah: dikenakan biaya (tingkat yang lebih tinggi)
  - Internet: dikenakan biaya (tingkat yang signifikan)
- **CloudFront sebagai Optimalisasi Biaya**: "Kurangi biaya transfer data untuk pengiriman konten global" → CloudFront. Lapisan cache mengurangi permintaan asal.
- **Akselerasi Transfer S3**: Mempercepat unggahan *ke* S3 menggunakan lokasi ujung CloudFront. Biaya yang lebih tinggi daripada S3 standar. Gunakan untuk pelanggan yang mengunggah file besar dari lokasi geografis yang jauh.
- **Biaya Replikasi antar Wilayah**: Mereplikasi data di seluruh wilayah dikenakan biaya transfer data. Untuk S3 CRR, Anda membayar baik biaya transfer data keluar maupun biaya permintaan S3.
- **PrivateLink (Titik Akhir Antarmuka VPC)**: Menyediakan konektivitas pribadi ke layanan AWS dan ke layanan yang dihosting oleh pelanggan AWS lainnya. Lebih aman daripada melewati NAT, seringkali lebih murah untuk layanan volume tinggi.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara VPC Gateway Endpoint dan VPC Interface Endpoint. Untuk layanan AWS mana yang tersedia, dan apa biayanya masing-masing?

*(Petunjuk: Gateway Endpoints gratis tetapi hanya untuk S3 dan DynamoDB. Interface Endpoints berbayar per jam tetapi berfungsi untuk sebagian besar layanan AWS lainnya.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Aplikasi perusahaan berjalan pada instance EC2 di subnet pribadi. Instance tersebut membuat panggilan API yang sering ke Amazon SQS dan Amazon S3. Saat ini, semua lalu lintas keluar melalui NAT Gateway. Tim ingin mengurangi biaya NAT Gateway. Keamanan data harus dipertahankan — tidak ada lalu lintas yang harus melewati internet publik.

Pendekatan mana yang TERBAIK memenuhi persyaratan ini dengan biaya berkelanjutan minimum?

A) Buat Gateway Endpoint untuk SQS dan Gateway Endpoint untuk S3
B) Buat Interface Endpoint untuk SQS dan Gateway Endpoint untuk S3
C) Buat Interface Endpoint untuk kedua SQS dan S3
D) Hapus NAT Gateway dan gunakan gateway internet secara langsung untuk panggilan API

*(Petunjuk 1: Gateway Endpoints hanya tersedia untuk S3 dan DynamoDB.)*
```

**Petunjuk 2**: Endpoint Antarmuka tersedia untuk SQS dan banyak layanan lainnya (tetapi memerlukan biaya).

**Petunjuk 3**: Sebuah Gateway Internet di tabel rute subnet pribadi akan menjadikannya subnet publik — melanggar persyaratan keamanan.

**Jawaban**: B

**Penjelasan**: S3 menggunakan Gateway Endpoint (gratis). SQS memerlukan Interface Endpoint (berbayar). Kombinasi ini menghilangkan biaya pemrosesan data NAT Gateway untuk kedua layanan. Semua lalu lintas tetap berada di dalam jaringan pribadi AWS — tanpa melalui internet publik.

**Mengapa bukan A?** Gateway Endpoint tidak tersedia untuk SQS. Hanya S3 dan DynamoDB yang memiliki Gateway Endpoint.

**Mengapa bukan C?** Meskipun ini berfungsi, menggunakan Interface Endpoint untuk S3 (sebagai pengganti Gateway Endpoint gratis) menimbulkan biaya jam-per-jam yang tidak perlu. Selalu gunakan Gateway Endpoint gratis untuk S3 dan DynamoDB.

**Mengapa bukan D?** Menambahkan rute ke Gateway Internet dari subnet pribadi akan menjadikannya subnet publik. Instans EC2 di subnet pribadi biasanya tidak memiliki Elastic IPs, sehingga mereka tidak dapat merutekan melalui Gateway Internet tanpa perubahan tambahan — dan melakukannya akan mengekspos mereka ke lalu lintas internet masuk.

*SAA-C03 Domain: Desain Arsitektur yang Dioptimalkan Biaya — Tugas 4.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Lalu lintas yang dihasilkan oleh pengguna West Coast Nimbus sangat signifikan. Aplikasi tersebut disajikan kepada mereka dari us-east-1 (Virginia). Saat ini:

- Respons API berjalan langsung dari instans EC2 us-east-1 ke pengguna West Coast (~80ms, $0.09/GB)
- Foto menu berasal dari S3 us-east-1 melalui CloudFront edge di Seattle (~8ms setelah caching)

Tim sedang mempertimbangkan untuk menambahkan wilayah aplikasi kedua di us-west-2 (Oregon) untuk pengguna West Coast untuk mengurangi latensi API.

Analisis biaya transfer data baru ini. Biaya transfer data lintas wilayah apa yang akan dikenakan oleh pengaturan dual-region? Apakah Routing 53 berbasis latensi akan mengurangi atau meningkatkan biaya transfer total? Dalam kondisi apa (volume lalu lintas, sensitivitas latensi) pengaturan dual-region akan membuahkan hasil?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk berlatih analisis biaya-manfaat multi-region.)*

## Adegan Setelah Kredit

Tom menutup analisis jaringan.

Dampak total proyek optimasi tiga bulan:

- Rencana Hemat EC2: -$14.200/tahun
- Penyimpanan (S3 + EBS): -$6.200/tahun
- Tingkat Database: -$11.220/tahun
- Jaringan: -$1.740/tahun
- **Total: -$33.360/tahun**

Dia menulisnya di papan tulis di ruang rapat.

Leo menatapnya. "Tiga puluh tiga ribu."

"Dan perubahan," kata Tom.

"Per tahun."

"Per tahun."

Priya melakukan perhitungannya. "Itu $2.780 per bulan yang kami keluarkan untuk hal-hal yang tidak menciptakan nilai."

"Tidak semuanya," koreksi Tom. "Beberapa di antaranya adalah hal-hal yang kami dapatkan nilainya, tetapi membayar terlalu mahal untuknya. Rencana Hemat — kami mendapatkan kapasitas EC2 yang sama persis, hanya dengan harga yang lebih baik."

Maya berdiri di depan papan tulis untuk waktu yang lama.

"Ketika kami memulai Nimbus," katanya, "setiap dolar penting. Kami hampir tidak mampu membeli instans EC2 pertama."

"Ya," kata Tom.

"Dan di suatu tempat di sepanjang jalan, kami berhenti memperhatikan dolar seolah-olah itu penting."

"Pertumbuhan melakukan itu," kata Priya. "Fokusnya bergeser ke membangun, bukan mengoptimalkan."

"Keduanya penting," kata Maya. "Keduanya, selalu. Tambahkan ini ke wiki. Dan tetapkan tinjauan triwulanan untuk biaya."

Tom sudah membuka kalender.

Dalam bab-bab berikutnya: kita akan mundur dari layanan individu dan mulai berpikir seperti arsitek.
