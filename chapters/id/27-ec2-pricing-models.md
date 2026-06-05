# Babat Chapter 27: Membayar Apa yang Anda Butuhkan

Tom telah meninjau tagihan AWS setiap bulan sejak Nimbus dimulai. Selama satu tahun pertama, dia memahami kira-kira 60% dari apa yang dilihatnya. Sekarang, dia memahami hampir semuanya — kecuali bagian EC2.

Bagian EC2 adalah campuran dari “Instansi On-Demand” pada berbagai jenis instansi, semuanya dipatok per jam, semuanya berjumlah $2.340/bulan.

“Kami tahu kami membutuhkan instansi ini,” kata Tom. “Tapi saya tidak mengerti mengapa kami membayar tarif walk-in untuk semuanya.”

“Tarif walk-in?” tanya Leo.

“On-Demand pricing,” kata Tom. “Ini seperti memesan kamar hotel pada pagi Anda membutuhkannya. Fleksibilitas maksimum. Harga maksimum.”

“Jadi apa alternatifnya?”

Tom menarik halaman harga EC2.

“Ada empat model harga,” katanya. “Dan kami hanya menggunakan satu.”

**Analogi Kamar Hotel**

Harga EC2 memetakan dengan sangat baik ke strategi pemesanan kamar hotel:

**On-Demand**: Datang ke meja depan tanpa reservasi. Anda membayar tarif penuh, tetapi Anda dapat check-out kapan saja Anda mau. Sempurna untuk perjalanan yang tidak terduga.

**Reserved Instances/Savings Plans**: Pesan kamar untuk seluruh tahun di muka. Anda mendapatkan diskon signifikan — 30-72% off — sebagai imbalan atas komitmen untuk menggunakannya.

**Spot Instances**: Menawar untuk ruangan yang tidak terpakai pada saat hotel bersedia menerimanya. Hingga 90% off. Tetapi hotel dapat meminta Anda untuk meninggalkan ruangan dengan pemberitahuan dua menit jika mereka membutuhkan ruangan untuk pelanggan dengan harga penuh.

**Dedicated Hosts**: Menyewa seluruh lantai hotel secara eksklusif untuk diri sendiri. Tidak berbagi dengan tamu lain. Jauh lebih mahal. Diperlukan ketika lisensi perangkat lunak atau aturan kepatuhan melarang berbagi host fisik.

Setiap model memiliki kasus penggunaan. Kesalahan yang dibuat Nimbus adalah: menggunakan On-Demand untuk semuanya, termasuk beban kerja yang berjalan 24/7 dan sepenuhnya dapat diprediksi.

**Instansi On-Demand: Fleksibilitas Maksimal, Biaya Maksimal**

**Kapan untuk Menggunakan:**

- Beban kerja yang tidak terduga (lonjakan lalu lintas yang tidak dapat Anda perkirakan)
- Pengembangan dan pengujian (mulai dan berhenti sering)
- Beban kerja jangka pendek (menjalankan eksperimen selama seminggu)
- Penerapan pertama (sebelum Anda memahami pola penggunaan Anda)

**Kapan Tidak Menggunakan:**

- Beban kerja produksi yang stabil yang Anda ketahui akan berjalan untuk lebih dari satu tahun
- Apa pun dengan beban dasar yang dapat diprediksi

Tom mengidentifikasi instansi On-Demand Nimbus:

- Server API web: 4 instansi EC2, berjalan 24/7 selama 18 bulan. *Beban dasar yang dapat diprediksi.*
- Proxy database (RDS Proxy): Selalu berjalan. *Beban dasar yang dapat diprediksi.*
- Server VPN: Selalu berjalan. *Beban dasar yang dapat diprediksi.*
- Server API tambahan untuk lonjakan lalu lintas: Tidak terduga. *On-Demand adalah yang tepat di sini.*

**Reserved Instances: Komitmen Tahun Panjang**

**Reserved Instances (RIs)** adalah komitmen penagihan — Anda setuju untuk menggunakan jenis instansi tertentu di wilayah tertentu selama 1 atau 3 tahun. Sebagai imbalannya, AWS mengenakan tingkat jam yang lebih rendah.

**Tingkat Diskon:**

- 1 tahun, Tidak Ada Upfront: ~30-40% diskon vs On-Demand
- 1 tahun, Partial Upfront: ~35-45% diskon (bayar sebagian sekarang, lebih murah per jam)
- 1 tahun, All Upfront: ~40-50% diskon (bayar seluruh tahun sekarang)
- 3 tahun, All Upfront: ~55-72% diskon (diskon maksimum, komitmen maksimum)

**Standard vs Convertible RIs:**

- **Standard**: Terkunci ke jenis instansi dan wilayah yang tepat. Dapat dijual di Pasar Reserved Instance jika Anda tidak lagi membutuhkannya.
- **Convertible**: Dapat mengubah jenis instansi, OS, dan penyewa selama periode komitmen. Kurang diskon daripada Standard (~50% max vs 72%).

Tom melakukan perhitungan untuk 4 server API (r6g.large, $0.252/jam On-Demand):

- Biaya tahunan On-Demand: $0.252 × 24 × 365 × 4 = $8.820
- 1 tahun All Upfront RI (1 instansi): ~$1.600 upfront
- 4 instansi: ~$6.400 upfront = **$2.420 yang dihemat dalam tahun pertama**

“Kami bisa menghemat $2.420 dalam tahun pertama hanya dengan berkomitmen,” kata Tom.

“Ini adalah komitmen,” kata Maya. “Apa yang terjadi jika kami perlu mengubah jenis instansi?”

“Kami dapat memperoleh Reserved Instances Convertible jika kami pikir kami mungkin.”

“Apa yang terjadi jika AWS merilis jenis instansi yang lebih baik?”

“Kami periksa saat RI berakhir. Jika jenis baru lebih baik, kami membeli RI baru.”

**Savings Plans: Komitmen yang Fleksibel**

**Savings Plans** adalah alternatif yang lebih fleksibel daripada Reserved Instances. Alih-alih berkomitmen untuk jenis instansi tertentu, Anda berkomitmen untuk jumlah pengeluaran jam tertentu (dalam dolar).

**Compute Savings Plans**: Berlaku untuk jenis instansi EC2 mana pun, terlepas dari jenis, ukuran, wilayah, atau OS. Paling fleksibel. Hingga 66% diskon.

**EC2 Instance Savings Plans**: Berlaku untuk keluarga instansi tertentu di wilayah (misalnya, “instansi c6g di us-east-1”). Lebih membatasi daripada Compute, tetapi hingga 72% diskon (sama dengan RI maksimum).

**SageMaker Savings Plans**: Spesifik untuk pelatihan dan inferensi SageMaker ML.

Untuk Nimbus: Compute Savings Plans untuk server API mereka. Mereka berkomitmen untuk $1.50/jam pengeluaran EC2. Jenis instansi mana pun, ukuran apa pun. Ketika mereka meningkatkan skala armada atau mengubah jenis instansi, Savings Plan masih berlaku.

“Ini lebih baik daripada Reserved Instances untuk kami,” kata Leo. “Kami masih bereksperimen dengan jenis instansi. Savings Plan Compute memberi kami diskon tanpa mengunci kami ke r6g secara khusus.”

**Spot Instances: Diskon 90%**

```markdown
**Instans Spot** menggunakan kapasitas EC2 cadangan AWS. Ketika AWS memiliki server yang tidak terpakai, Anda dapat menyewanya dengan harga 60-90% di bawah harga On-Demand. Ketika AWS membutuhkan kapasitas tersebut kembali (untuk pelanggan On-Demand atau Reserved), mereka memberi Anda peringatan 2 menit dan mengakhiri instans Anda.

Risiko gangguan adalah karakteristik yang menentukan. Instans Spot hanya cocok untuk:

- **Beban kerja toleran terhadap kesalahan:** Jika instans terganggu di tengah tugas, tugas dapat dimulai ulang tanpa merusak apa pun
- **Pemrosesan tanpa status:** Ukuran ulang gambar, encoding video, analisis batch, pelatihan ML
- **Pekerjaan batch jangka pendek:** Peringatan 2 menit sudah cukup untuk menyimpan status dan melakukan checkpoint
- **Ragam armada Auto Scaling:** Gunakan Spot untuk sebagian besar ASG Anda dengan On-Demand sebagai dasar

Untuk Nimbus: Instans Spot masuk akal untuk pekerjaan analisis batch yang berjalan setiap malam (memproses data pesanan harian menjadi laporan yang digabungkan). Jika Instans Spot terganggu di tengah pekerjaan, pekerjaan gagal, tetapi dimulai dari awal pada instans baru. Data di S3 aman.

"Menggunakan Spot untuk pekerjaan malam itu menurunkan biayanya dari $12/malam menjadi $2/malam," kata Leo.

**Host Khusus: Pilihan Kepatuhan**

Beberapa lisensi perangkat lunak (Oracle, Windows Server dalam beberapa konfigurasi) dihargai per soket atau inti fisik. Saat Anda menjalankan perangkat lunak ini pada host bersama (default untuk EC2), Anda mungkin membayar kapasitas yang tidak Anda gunakan.

**Host Khusus** memberi Anda akses ke server fisik sepenuhnya untuk penggunaan Anda. Anda dapat membawa lisensi per soket yang ada Anda. Tidak ada instans pelanggan AWS lainnya yang berjalan pada perangkat keras yang sama.

Host Khusus secara signifikan lebih mahal daripada EC2 standar. Mereka adalah alat kepatuhan dan lisensi, bukan alat optimasi biaya.

Nimbus tidak memiliki persyaratan lisensi yang membutuhkan Host Khusus. Kebanyakan aplikasi berbasis cloud asli tidak.

**Membangun Armada Campuran**

Pendekatan yang matang: gunakan beberapa model harga bersamaan.

Untuk armada API Nimbus:

- **Muatan dasar (4 instans, selalu berjalan)**: Ditutupi oleh komitmen Savings Plan
- **Puncak yang dapat diprediksi (2 instans tambahan selama jam kerja)**: Ditutupi oleh Savings Plan jika komitmen mencakupnya, jika tidak On-Demand
- **Kelebihan lonjakan lalu lintas**: Instans Spot (diterima karena server API tidak memiliki status — permintaan mendistribusikan ulang jika instans terganggu)

Hasilnya: armada yang mengoptimalkan biaya di setiap lapisan — harga yang berkomitmen untuk bagian yang dapat diprediksi, On-Demand untuk pertumbuhan yang tidak terduga, Spot untuk kapasitas ledakan.

## Kekuatan dan Batasan

**On-Demand**: Tidak ada komitmen. Harga penuh. Gunakan untuk beban kerja yang tidak terduga atau jangka pendek.

**Reservasi Instans**: Hingga diskon 72%. Terkunci ke jenis instans/wilayah/OS tertentu. Jual kapasitas yang tidak terpakai di Pasar RI.

**Savings Plan**: Hingga diskon 66-72%. Lebih fleksibel daripada Reservasi Instans (Perencanaan Hemat Komputasi berlaku untuk jenis instans apa pun). Penerapan otomatis ke penggunaan yang cocok.

**Instans Spot**: Hingga diskon 90%. Risiko gangguan 2 menit. Hanya untuk beban kerja toleran terhadap kesalahan, tanpa status, yang dapat diinterupsi.

**Host Khusus**: Server fisik penuh. Paling mahal. Diperlukan untuk skenario lisensi atau kepatuhan tertentu.

## Ringkasan

- EC2 memiliki empat model harga: **On-Demand** (harga penuh, tidak ada komitmen), **Reservasi Instans/Savings Plan** (pengeluaran yang dikomit untuk diskon yang signifikan), **Spot** (kapasitas cadangan pada 60-90% diskon, dapat diinterupsi), **Host Khusus** (eksklusivitas server fisik).
- **Savings Plan** umumnya lebih disukai daripada Reservasi Instans untuk fleksibilitas.
- **Instans Spot** memerlukan beban kerja toleran terhadap kesalahan, tanpa status — hanya untuk pekerjaan batch, pelatihan ML, dan pemrosesan yang dapat diinterupsi.
- Strategi optimal adalah **armada campuran**: Savings Plan untuk dasar, On-Demand untuk pertumbuhan yang tidak terduga, Spot untuk pekerjaan batch yang dapat diinterupsi.
- Tinjau model harga saat beban kerja telah berjalan dengan stabil selama 3+ bulan — saat itulah On-Demand mulai menjadi pemborosan.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Biaya yang Dioptimalkan (Domain 4, Tugas 4.2)*
```

- **Rencana Tabungan vs Instans Terperangkap (Reserved Instances)**: Rencana Tabungan lebih fleksibel (berlaku untuk setiap instans EC2 untuk Rencana Tabungan Komputasi). Instans Terperangkap mengunci ke jenis instans tertentu. Skenario ujian: “membutuhkan fleksibilitas maksimum sambil tetap mendapatkan diskon” → Rencana Tabungan. “Tahu jenis instans yang tepat selama 3 tahun” → Instans Terperangkap Standar untuk diskon maksimum.
- **Sinyal Spot**: “sensitif biaya,” “toleran terhadap kesalahan,” “pemrosesan batch,” “dapat menangani gangguan,” “tugas tanpa status,” “pelatihan ML” → Spot.
- **Penanganan Interupsi Spot**: Instans Spot mendapatkan peringatan 2 menit sebelum dihentikan. Aplikasi Anda harus menanganinya dengan baik (simpan status, draini koneksi, keluar dengan bersih).
- **On-Demand vs Spot untuk Server Web**: Server web yang melayani lalu lintas pengguna langsung TIDAK boleh menggunakan Spot (interupsi menyebabkan permintaan yang gagal). Gunakan On-Demand atau Rencana Tabungan untuk tingkatan web.
- **EC2 Rencana Tabungan vs Rencana Tabungan Komputasi**: Rencana Tabungan EC2 berlaku untuk keluarga instans dan wilayah tertentu (diskon lebih tinggi). Rencana Tabungan Komputasi berlaku untuk setiap instans EC2, Lambda, dan Fargate (diskon maksimum lebih rendah, lebih fleksibel).
- **Pasar Instans Terperangkap (RI Marketplace)**: Instans Terperangkap Standar yang tidak terpakai dapat dijual ke pelanggan AWS lainnya. Instans Terperangkap yang dapat diubah tidak dapat dijual.

## Latihan

**Latihan 1 — Mengingat**

Kapan Instans Spot sesuai dan kapan mereka tidak? Apa karakteristik yang membuat beban kerja cocok untuk Spot?

*(Petunjuk: Pikirkan tentang apa yang terjadi ketika instans dihentikan dengan pemberitahuan 2 menit. Beban kerja mana yang pulih dengan bersih? Mana yang tidak?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan media menjalankan pipeline transcoding video yang mengubah video yang diunggah menjadi beberapa format. Pekerjaan transcoding berjalan terus-menerus kapan saja (operasi 24/7, volume variabel). Setiap pekerjaan membutuhkan waktu 5-30 menit. Jika pekerjaan transcoding terganggu, pekerjaan dapat dimulai kembali dari awal tanpa kehilangan data. Perusahaan ingin meminimalkan biaya.

Model harga EC2 mana yang TERBAIK memenuhi persyaratan ini?

A) Instans On-Demand dalam Grup Skala Otomatis
B) Instans Terperangkap (1 tahun, Semua Di Depan)
C) Instans Spot dengan Spot Fleet untuk diversifikasi instans otomatis
D) Host Khusus dengan lisensi perangkat lunak media perusahaan yang ada

*(Petunjuk 1*: “Dapat dimulai kembali dari awal tanpa kehilangan data” — ini adalah frasa kunci yang memungkinkan model harga tertentu.

*(Petunjuk 2*: “Minimalkan biaya” dengan beban kerja yang terputus mengarah pada opsi diskon maksimum.

*(Petunjuk 3*: Permintaan Spot Fleet meminta instans dari beberapa jenis instans dan Zona Ketersediaan, mengurangi kemungkinan gangguan.

**Jawaban**: C

**Penjelasan**: Pekerjaan transcoding adalah toleran terhadap kesalahan — mereka dapat dimulai ulang jika terganggu. Ini menjadikan mereka ideal untuk Instans Spot, yang menawarkan diskon 60-90% dibandingkan dengan On-Demand. Spot Fleet mendiversifikasi di seluruh jenis instans dan Zona Ketersediaan, mengurangi kemungkinan gangguan massal.

**Mengapa bukan A?** On-Demand adalah opsi biaya tertinggi. Untuk beban kerja yang berjalan terus-menerus, ini boros.

**Mengapa bukan B?** Instans Terperangkap memberikan diskon 50-72% tetapi tidak menawarkan potensi diskon 90% dari Spot untuk beban kerja toleran terhadap kesalahan. Selain itu, Instans Terperangkap untuk beban kerja yang stabil dan dapat diprediksi — Spot secara khusus untuk pemrosesan batch yang dapat terputus.

**Mengapa bukan D?** Host Khusus untuk kepatuhan lisensi, bukan optimasi biaya. Mereka adalah opsi paling mahal.

*Domain SAA-C03: Desain Arsitektur Biaya-Optimalkan — Tugas 4.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Infrastruktur Nimbus memiliki beban kerja berikut:

1. Server API: 6 instans, berjalan 24/7, stabil selama 2 tahun, menggunakan r6g.large
2. Pekerjaan batch analisis harian: 4 instans, berjalan 3AM-6AM setiap malam, selalu jenis instans yang sama
3. Lingkungan pengujian: 2 instans, digunakan oleh insinyur 9 AM-6 PM pada hari kerja
4. Kelebihan lonjakan lalu lintas: 0-8 instans, dijalankan selama jam sibuk, sepenuhnya tidak terduga

Rancang model harga optimal untuk setiap jenis beban kerja. Jumlah komitmen Rencana Tabungan mana yang akan menutupi beban kerja 1 dan 2? Untuk beban kerja 3, apakah ada strategi yang lebih cerdas daripada On-Demand?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk mempraktikkan strategi harga EC2.)*

## Adegan Pasca Kredit

Tom menyerahkan pembelian Rencana Tabungan.

Komitmen $5,76/jam. Jangka waktu tiga tahun. Rencana Tabungan Komputasi untuk fleksibilitas.

Penghematan yang diperkirakan: $42.500 selama tiga tahun.

Maya membaca angka itu. “Empat puluh dua ribu dolar.”

“Dibandingkan dengan On-Demand untuk instans yang sama, selama tiga tahun.”

“Berapa biaya untuk melakukan ini?”

“Satu sore analisis,” kata Tom. “Dan keputusan untuk berkomitmen.”

“Tiga tahun adalah waktu yang lama,” kata Leo. “Apa yang terjadi jika kita mengubah jenis instans?”

“Rencana Tabungan Komputasi berlaku untuk setiap jenis instans EC2. Dan dalam tiga tahun, kita sudah cukup besar sehingga percakapan ini terlihat berbeda.”

Leo memikirkan itu.

“Sudah berapa lama Anda tahu tentang Rencana Tabungan?” dia bertanya.

“Sejak kita mulai,” kata Tom. “Saya menunggu hingga beban kerja stabil untuk berkomitmen.”

“Tujuh belas bulan membayar On-Demand sambil menunggu.”

“Ya.” Tom menutup konsol. “Terkadang hal termahal yang Anda lakukan adalah menunggu untuk menghemat uang.”

Di bab berikutnya: disiplin yang sama diterapkan pada biaya penyimpanan, dengan beberapa kejutan tentang apa yang mendorong tagihan tersebut.
