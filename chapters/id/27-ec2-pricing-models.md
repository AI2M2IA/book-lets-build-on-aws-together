# Chapter 27: Membayar Apa yang Anda Butuhkan

Tom membuat kopi sebelum membuka tab tagihan. Dia selalu begitu — beberapa laporan lebih baik didekati dalam keadaan hangat. Dia duduk di kursi dekat jendela, cangkir di tangan, pagi Sabtu masih sepi di luar. Tidak ada notifikasi, tidak ada standup. Hanya spreadsheet dan angka-angka.

Dia membuka tab itu.

**Rekap: Dari Wawasan Athena ke Tagihan**

Analitik Athena dari bab sebelumnya telah melakukan sesuatu yang tak terduga: dengan menjalankan kueri laporan biaya dan penggunaan langsung dari S3, Tom akhirnya bisa melihat bukan hanya total tagihan AWS, tetapi rincian dari apa yang sebenarnya dikeluarkan oleh setiap layanan, minggu demi minggu, selama enam bulan. Gambaran yang muncul cukup jelas untuk membuat khawatir. EC2 adalah item baris tunggal terbesar, dan polanya tak terbantahkan — tim telah membayar harga walk-in untuk hotel yang mereka tinggali sepanjang waktu. Kesadaran itu membawa Tom ke halaman harga EC2 pada pagi Sabtu dengan secangkir kopi segar dan tekad untuk memahami setiap opsi sebelum invoice bulanan berikutnya tiba.

Tom telah meninjau tagihan AWS setiap bulan sejak Nimbus dimulai. Selama tahun pertama, dia memahami kira-kira 60% dari apa yang dilihatnya. Sekarang, dia memahami hampir semuanya — kecuali mengapa bagian EC2 selalu membuatnya merasa mereka membayar terlalu mahal. Bagian EC2 adalah campuran "Instance On-Demand" pada berbagai jenis instance, semuanya dipatok per jam, semuanya berjumlah $2.340/bulan.

Sebelum dia menelepon siapa pun, dia menghabiskan satu jam menelusuri daftar instance sendiri — bukan untuk menyimpulkan apa pun, tetapi untuk membentuk asumsi yang bisa dia uji.

Dia melihat empat instance r6g.large yang ditandai sebagai "api-prod." Dia melihat dua instance c6g.medium yang menjalankan pemroses pekerjaan latar belakang. Dia melihat satu t3.medium berlabel "vpn-server" yang telah berjalan sejak bulan ketiga keberadaan perusahaan. Dia melihat sepasang instance yang ditandai "analytics-batch" yang muncul pada pukul 3 pagi dan menghilang sebelum pukul 7 pagi setiap malam.

Dia menulis satu kolom asumsi:

- Server API: dapat diprediksi, selalu berjalan.
- Pemroses latar belakang: mungkin dapat diprediksi.
- Server VPN: selalu berjalan, tak pernah berubah.
- Analitik batch: mungkin layak Spot?

Lalu dia menulis di margin: *verifikasi masing-masing sebelum memutuskan apa pun.*

Disiplin itu — memisahkan "apa yang saya asumsikan" dari "apa yang saya ketahui" — adalah yang membuat tinjauan biaya Tom berguna. Dia menelepon yang lain.

"Kita bisa saja terus membayar tarif walk-in," kata Tom, ketika yang lain bergabung dalam panggilan. "Tapi kita tidak akan."

"Tarif walk-in?" tanya Leo.

"On-Demand pricing," kata Tom. "Ini seperti memesan kamar hotel pada pagi Anda membutuhkannya. Fleksibilitas maksimum. Harga maksimum."

"Apa alternatifnya?"

**Analogi Hotel**

Tom memikirkannya sejenak. "Kau tahu bagaimana sebagian orang memesan kamar hotel pada pagi mereka tiba? Itulah kita sekarang. Ada strategi yang lebih baik — pesan enam bulan di muka dan dapatkan diskon, ambil kamar yang tak terjual pada menit terakhir untuk tawaran murah, atau sewa seluruh lantai jika kau butuh seluruh lantai. Hotel yang sama, empat harga berbeda."

Leo menatapnya. "Dan versi AWS dari itu adalah?"

Tom menarik halaman harga EC2. "Ada empat model harga. Dan kita hanya menggunakan satu."

Harga EC2 memetakan dengan sangat baik ke strategi pemesanan kamar hotel:

**On-Demand**: Datang ke meja depan tanpa reservasi. Anda membayar tarif penuh, tetapi Anda dapat check-out kapan saja Anda mau. Sempurna untuk masa inap yang tak terduga.

**Reserved Instances/Savings Plans**: Pesan kamar untuk seluruh tahun di muka. Anda mendapatkan diskon signifikan — 30-72% off — sebagai imbalan atas komitmen untuk menggunakannya.

**Spot Instances**: Ambil kamar yang tak terjual dengan tarif diskon besar yang berlaku di hotel — tanpa tawar-menawar, hotel yang menetapkan harga berdasarkan seberapa kosong mereka. Hingga 90% off. Tetapi hotel dapat meminta Anda pergi dengan pemberitahuan dua menit jika mereka membutuhkan kamar untuk pelanggan harga penuh. (Bertahun-tahun lalu Anda harus *menawar* untuk kapasitas Spot; AWS menghentikan penawaran pada 2017 — Anda cukup membayar harga Spot saat ini.)

**Dedicated Hosts**: Sewa seluruh lantai hotel secara eksklusif untuk diri sendiri. Tidak berbagi dengan tamu lain. Jauh lebih mahal. Diperlukan ketika lisensi perangkat lunak atau aturan kepatuhan melarang berbagi host fisik.

Setiap model memiliki kasus penggunaan. Kesalahan yang dibuat Nimbus: menggunakan On-Demand untuk semuanya, termasuk beban kerja yang berjalan 24/7 dan sepenuhnya dapat diprediksi.

**Instance On-Demand: Fleksibilitas Maksimum, Biaya Maksimum**

**Kapan digunakan**:

- Beban kerja yang tak terduga (lonjakan lalu lintas yang tidak dapat Anda perkirakan)
- Pengembangan dan pengujian (mulai dan berhenti sering)
- Beban kerja jangka pendek (menjalankan eksperimen selama seminggu)
- Penerapan pertama (sebelum Anda memahami pola penggunaan Anda)

**Kapan tidak digunakan**:

- Beban kerja produksi stabil yang Anda tahu akan berjalan lebih dari satu tahun
- Apa pun dengan beban dasar yang dapat diprediksi

**EC2 Hibernation: Menjeda Tanpa Kehilangan Status**

Salah satu teknik optimasi biaya yang tidak mendapat cukup perhatian adalah **EC2 Hibernation**. Ketika Anda menghentikan instance biasa, isi RAM hilang — start berikutnya adalah cold start. Sistem operasi boot, aplikasi diinisialisasi, koneksi database dibangun ulang. Untuk sebagian besar server web produksi, ini baik-baik saja. Untuk beban kerja tertentu, ini mahal.

Ketika Anda menghibernasi sebuah instance, isi RAM disimpan ke volume root EBS sebelum dimatikan. Pada start berikutnya, instance melanjutkan tepat di tempat ia berhenti — proses berjalan, koneksi terbangun, status aplikasi utuh — dalam sebagian kecil waktu yang dibutuhkan cold start. Ini sangat berguna untuk pekerjaan analisis jangka panjang yang ingin Anda jeda semalaman tanpa kehilangan status, atau untuk instance pengembangan yang butuh beberapa menit untuk boot dan mengonfigurasi lingkungannya.

"Saya punya instance data science," kata Leo, sambil melihat cetakan. "Butuh sembilan menit untuk start. Lingkungan kustom, selusin paket Python, beberapa bobot model yang dimuat sebelumnya. Saya menghentikannya setiap malam dan menjalankannya kembali setiap pagi."

"Jadi kamu menghabiskan sembilan menit menonton boot setiap hari," kata Tom.

"Ya."

"Itu 45 menit per minggu waktu teknik menunggu sebuah instance EC2."

"Ya."

"Hibernasi saja."

Dengan hibernasi, instance Leo dijeda di akhir hari, menyimpan RAM-nya ke volume root EBS, dan melanjutkan dalam kurang dari 90 detik keesokan paginya. Sesi analisis berlanjut tepat di tempat dia tinggalkan.

Persyaratan hibernasi: hibernasi harus **diaktifkan saat peluncuran** — Anda tidak dapat mengaktifkannya untuk instance yang sudah berjalan (Leo harus meluncurkan ulang kotak data science-nya dari AMI untuk mengaktifkannya). Instance harus memiliki RAM hingga 150 GB (isi RAM harus muat di volume root EBS), volume root harus cukup besar untuk menampung OS dan dump RAM, dan volume root harus dienkripsi (hibernasi menyimpan data in-memory sensitif ke disk). Instance bare-metal dan instance dengan RAM lebih dari 150 GB tidak mendukung hibernasi. Satu batas lagi: sebuah instance dapat tetap terhibernasi paling lama **60 hari** — setelah itu harus dimulai, dihentikan, atau diterminasi; ia tidak dapat tidur tanpa batas.

Tom mengidentifikasi instance On-Demand Nimbus:

- Server API web: 4 instance EC2, berjalan 24/7 selama 18 bulan. *Beban dasar yang dapat diprediksi.*
- Server VPN: Selalu berjalan. *Beban dasar yang dapat diprediksi.*
- Server API tambahan untuk lonjakan lalu lintas: Tak terduga. *On-Demand benar di sini.*

"Tunggu — tapi *mengapa* server lonjakan tetap On-Demand?" tanya Maya. "Jika kita mendapat lonjakan setiap Jumat, bukankah itu cukup dapat diprediksi untuk berkomitmen?"

Tom mempertimbangkannya. "Beban dasarnya dapat diprediksi. Lonjakannya dapat diprediksi waktunya, tetapi tidak besarnya. Beberapa malam Jumat 30% di atas normal; beberapa 150% di atas. Jika saya membeli kapasitas Reserved untuk enam instance dan lonjakan hanya butuh dua tambahan, saya terlalu banyak berkomitmen. Jika saya membeli untuk dua dan lonjakan butuh delapan, saya kekurangan dan kelebihannya tetap berjalan On-Demand. Untuk kapasitas burst secara khusus, On-Demand atau Spot benar — Anda tidak bisa membeli Reserved Instance secara real time ketika lalu lintas mulai naik."

Ada alasan mengapa daftar "kapan tidak digunakan" itu penting: jika Anda telah menjalankan instance yang sama selama enam bulan dan dapat memprediksi mereka akan terus berjalan, setiap bulan dengan On-Demand adalah bulan Anda membayar tarif walk-in untuk kamar yang Anda tempati permanen.

**Reserved Instances: Komitmen Setahun Penuh**

**Reserved Instances (RIs)** adalah komitmen penagihan — Anda setuju untuk menggunakan jenis instance tertentu di region tertentu selama 1 atau 3 tahun. Sebagai imbalannya, AWS mengenakan tarif per jam yang lebih rendah.

**Tingkat diskon**:

- 1 tahun, No Upfront: ~30-40% diskon vs On-Demand
- 1 tahun, Partial Upfront: ~35-45% diskon (bayar sebagian sekarang, lebih murah per jam)
- 1 tahun, All Upfront: ~40-50% diskon (bayar setahun penuh sekarang)
- 3 tahun, All Upfront: ~55-72% diskon (diskon maksimum, komitmen maksimum)

**Standard vs Convertible RIs**:

- **Standard**: Terkunci ke jenis instance dan region yang tepat. Dapat dijual di Reserved Instance Marketplace jika Anda tidak lagi membutuhkannya.
- **Convertible**: Dapat mengubah jenis instance, OS, dan tenancy selama periode komitmen. Diskon lebih kecil daripada Standard (hingga ~66% vs 72%).

Tom melakukan perhitungan untuk 4 server API (r6g.large, sekitar $0.101/jam On-Demand):

- Biaya tahunan On-Demand: $0.101 × 24 × 365 × 4 ≈ $3.540
- 1 tahun All Upfront RI (1 instance): ~$520 upfront (≈41% off)
- 4 instance: ~$2.080 upfront = **sekitar $1.460 dihemat di tahun pertama**

"Kita bisa menghemat hampir seribu lima ratus dolar di tahun pertama hanya dengan berkomitmen," kata Tom. "Berapa biayanya per bulan, persisnya — setiap reserved instance dibandingkan dengan yang kita bayar sekarang?"

"Itu dibebankan di muka," kata Maya. "Anda membayar setahun penuh di muka."

"Tunggu — tapi *mengapa* kita berkomitmen ke Standard RI jika jenis instance masih berkembang?" tanya Maya. "Bagaimana jika r6g menjadi usang tahun depan?"

"Kita ambil Convertible RIs jika kita pikir kita mungkin perlu berubah. Diskon lebih kecil — hingga ~66% bukannya 72% — tetapi fleksibilitas untuk beralih keluarga instance selama periode komitmen."

"Dan jika AWS merilis jenis instance yang lebih baik setelah kita berkomitmen?"

"Kita periksa saat RI berakhir. Jika jenis baru lebih baik, kita beli RI baru untuk masa berikutnya. RI saat ini tetap berjalan sampai akhir dengan harga yang dikomitmen."

Tom menarik perbandingan break-even ke layar bersama agar semua orang bisa mengikuti:

**Perbandingan tiga arah: r6g.large, 4 instance, 12 bulan**

| Opsi | Biaya Tahunan | Setara Bulanan | Fleksibilitas |
|---|---|---|---|
| On-Demand ($0.101/jam × 4) | $3.540 | $295 | Penuh |
| Compute Savings Plan (~34% off 1-thn, komitmen $0.27/jam) | $2.365 | $197 | Tinggi |
| Standard RI, 1-thn All Upfront (4 × $520) | $2.080 | $173 | Rendah |

"Tunggu," kata Leo. "RI lebih murah daripada Savings Plan?"

"Pada masa yang sama, ya — itulah harga fleksibilitas," kata Tom. "Compute Savings Plan berlaku untuk *jenis instance apa pun*, ukuran, region, bahkan Fargate dan Lambda, jadi diskon maksimumnya lebih rendah — hingga 66% pada tingkat 3 tahun. Standard RI, atau EC2 Instance Savings Plan, mengunci Anda ke keluarga instance dan membayar Anda untuk penguncian itu dengan diskon hingga 72%. Semakin banyak kebebasan yang Anda pertahankan, semakin sedikit diskon AWS."

"Berapa break-even untuk RI 3 tahun?"

"3 tahun All Upfront: sekitar $1.060 per instance, jadi $4.240 total untuk keempatnya — itu membeli 36 bulan. Setara bulanan: $118, versus $295 On-Demand. Biaya di muka membayar dirinya sendiri sekitar bulan keempat belas; setelah itu Anda berada di wilayah penghematan selama hampir dua tahun lagi."

"Jadi jika kita memutuskan di bulan keempat bahwa kita butuh keluarga instance berbeda," kata Priya, "kita masih membayar komitmen asli."

"Benar. Anda bisa menjual Standard RIs di RI Marketplace, tetapi tidak selalu pada nilai penuh. Convertible RIs bisa ditukar tetapi tidak dijual. Inilah mengapa Savings Plan sering menjadi pilihan yang lebih aman — prinsip yang sama, lebih sedikit penguncian."

**Savings Plans: Komitmen yang Fleksibel**

**Savings Plans** adalah alternatif yang lebih baru dan lebih fleksibel daripada Reserved Instances. Alih-alih berkomitmen ke jenis instance tertentu, Anda berkomitmen ke *jumlah pengeluaran per jam* tertentu (dalam dolar).

**Compute Savings Plans**: Berlaku untuk instance EC2 apa pun, terlepas dari jenis, ukuran, region, atau OS. Paling fleksibel. Hingga 66% diskon.

**EC2 Instance Savings Plans**: Berlaku untuk keluarga instance tertentu di sebuah region (mis., "instance c6g di us-west-2"). Lebih membatasi daripada Compute, tetapi hingga 72% diskon (sama dengan maksimum RI).

**SageMaker Savings Plans**: Spesifik untuk pelatihan dan inferensi SageMaker ML.

Untuk Nimbus: Compute Savings Plans untuk server API mereka. Mereka berkomitmen ke pengeluaran komputasi $0.45/jam. Jenis instance apa pun, ukuran apa pun — dan komitmen itu juga mencakup Fargate dan Lambda, yang penting untuk apa yang terjadi berikutnya. Ketika mereka meningkatkan skala armada atau mengubah jenis instance, Savings Plan tetap berlaku.

"Ini lebih baik daripada Reserved Instances untuk kita," kata Leo. "Kita masih bereksperimen dengan jenis instance. Compute Savings Plan memberi kita diskon tanpa mengunci kita ke r6g secara khusus."

"Apa yang terjadi ketika kita berkomitmen ke $0.45/jam dan hanya menggunakan $0.36 beberapa bulan?" tanya Maya.

"Anda membayar $0.45 terlepas dari itu," kata Tom. "Komitmennya tanpa syarat. Savings Plan berlaku untuk penggunaan apa pun yang Anda miliki hingga jumlah yang dikomitmen. Apa pun di atas itu berjalan dengan tarif On-Demand. Disiplinnya adalah menetapkan komitmen pada level yang Anda yakin akan selalu dicapai."

"Dan kita seharusnya tidak berkomitmen ke rata-rata kita — kita harus berkomitmen ke titik terendah kita," kata Priya.

"Tepat. Lihat enam bulan terakhir. Cari minggu terendah. Berkomitmen ke 90% dari angka itu. Lalu tinjau setiap kuartal seiring kita tumbuh."

"Sudahkah kita memikirkan apa yang terjadi jika kita terlalu banyak berkomitmen?" lanjut Priya. "Kita membeli paket $2/jam, lalu kuartal berikutnya kita optimalkan dan penggunaan komputasi kita turun ke $1.50?"

"Selisih $0.50/jam menjadi pemborosan," kata Tom. "Kita membayar kapasitas yang tidak lagi ada. Itulah risiko menetapkan komitmen terlalu tinggi. Tinjauan kuartalan justru untuk menangkap ini — jika penggunaan kita turun di bawah komitmen, kita tahu pembelian berikutnya harus lebih kecil. Satu nuansa penting: *Compute* Savings Plan mengikuti Anda ke Fargate dan Lambda — memigrasikan beban kerja EC2 ke kontainer tidak akan menyia-nyiakannya. Yang menyia-nyiakan komitmen adalah benar-benar menggunakan lebih sedikit komputasi, atau menahan *EC2 Instance* Savings Plan atau RI untuk keluarga instance yang berhenti Anda gunakan."

Anda mungkin bertanya-tanya: mengapa tidak selalu membeli Savings Plans pada jumlah maksimum yang terjangkau dan biarkan AWS mengaturnya? Jawabannya adalah komitmen itu adalah titik dasar, bukan batas atas. Jika Anda berkomitmen $5/jam tetapi hanya menggunakan $3/jam, Anda membayar $5/jam. Setiap dolar dari pengeluaran yang dikomitmen yang tidak cocok dengan penggunaan aktual adalah satu dolar yang terbuang. Tinjauan kuartalan bukan opsional — itulah yang menjaga Savings Plan tetap menjadi optimasi alih-alih komitmen berlebih.

**Spot Instances: Diskon 90%**

**Spot Instances** menggunakan kapasitas EC2 cadangan AWS. Ketika AWS memiliki server yang tidak terpakai, Anda dapat menyewanya dengan harga 60-90% di bawah harga On-Demand. Ketika AWS membutuhkan kapasitas tersebut kembali (untuk pelanggan On-Demand atau Reserved), mereka memberi Anda peringatan 2 menit dan menterminasi instance Anda.

Anda mungkin bertanya-tanya: siapa yang akan merancang sistem di sekitar instance yang dapat lenyap dengan pemberitahuan dua menit? Jawabannya adalah: siapa pun yang pekerjaannya dapat dimulai ulang dari awal. Pekerjaan batch, analitik, pipeline rendering — tidak satu pun dari ini memerlukan instance spesifik yang memulai pekerjaan untuk menjadi yang menyelesaikannya. Peringatan 2 menit cukup untuk menyimpan checkpoint, menguras koneksi, dan keluar dengan bersih.

Risiko gangguan adalah karakteristik yang menentukan. Spot Instances hanya cocok untuk:

- **Beban kerja toleran terhadap kesalahan**: Jika sebuah instance terminasi di tengah tugas, tugas dapat dimulai ulang tanpa merusak apa pun
- **Pemrosesan tanpa status**: Pengubahan ukuran gambar, encoding video, analitik batch, pelatihan ML
- **Pekerjaan batch berumur pendek**: Peringatan 2 menit cukup untuk menyimpan status dan checkpoint
- **Armada campuran Auto Scaling**: Gunakan Spot untuk mayoritas ASG Anda dengan On-Demand sebagai dasar

Untuk Nimbus: Spot Instances masuk akal untuk pekerjaan analitik batch yang berjalan setiap malam (memproses data pesanan harian menjadi laporan agregat). Jika sebuah Spot Instance diterminasi di tengah pekerjaan, pekerjaan gagal, tetapi dimulai ulang dari awal pada instance baru. Data di S3 aman.

Tetapi Leo mengetahui ini dengan cara yang sulit sebelum tim sepenuhnya memahami polanya.

Tiga bulan sebelumnya, dia telah memindahkan pekerjaan batch malam ke Spot tanpa membangun logika checkpoint. Malam pertama, Spot Instance berjalan baik. Malam kedua, terganggu pada pukul 4:47 pagi — empat puluh tujuh menit ke dalam pekerjaan yang butuh satu jam dua puluh menit untuk selesai. Pekerjaan gagal. Laporan akhir untuk pesanan hari sebelumnya hilang ketika mitra restoran login pagi itu.

"Saya sudah men-deploy-nya — oh," kata Leo, sambil melihat notifikasi pekerjaan yang gagal. "Saya berasumsi akan baik-baik saja. Itu baik-baik saja malam pertama."

"Apa yang terjadi?" tanya Maya.

"Gangguan Spot. AWS butuh kapasitas kembali, memberi kita dua menit, instance terminasi. Pekerjaan tidak punya checkpoint. Ketika Spot Instance baru diluncurkan pukul 5 pagi untuk mencoba lagi, ia mulai dari nol. Selesai pukul 6:40 pagi. Laporan terlambat dua jam."

Perbaikannya sederhana: tulis hasil antara ke S3 setiap lima belas menit. Setiap checkpoint adalah status parsial yang lengkap — cukup bagi instance baru untuk membaca checkpoint terakhir dan melanjutkan dari titik itu alih-alih memulai ulang dari awal.

"Menggunakan Spot untuk pekerjaan malam menurunkan biayanya dari $12/malam menjadi $2/malam," lapor Leo, setelah perbaikan diterapkan. "Bahkan dengan satu malam buruk, total biaya menjalankannya selama tiga bulan lebih sedikit daripada dua minggu harga On-Demand."

"Akan baik-baik saja," tambah Leo, "bahkan jika terganggu di tengah jalan — kan?"

"Dengan checkpoint terpasang, ya," kata Tom. "Tanpa itu, tidak. Toleransi gangguan harus dibangun ke dalam pekerjaan, bukan diasumsikan."

"Dan bagaimana jika seseorang mencoba membobol?" tanya Priya. "Spot Instance ada di perangkat keras bersama. Jika terganggu dan yang baru diluncurkan, apakah ada paparan data antar instance?"

"Tidak," kata Tom. "AWS menghapus penyimpanan instance saat terminasi. Pelanggan berikutnya yang mendapat perangkat keras itu melihat papan tulis bersih. Tapi itu insting yang baik — setiap kali Anda menggunakan kapasitas bersama, layak memverifikasi model isolasinya."

**Diversifikasi Spot Fleet**

Leo telah mempelajari satu hal lagi dari pekerjaan batch yang terganggu: ketika Anda meminta satu jenis Spot Instance, Anda bertaruh pada ketersediaan jenis spesifik itu di AZ tersebut. Jika kapasitas Spot untuk c5.2xlarge di us-west-2a habis, pekerjaan Anda menunggu — atau gagal.

**Spot Fleet** menyelesaikan ini dengan memungkinkan Anda menentukan banyak jenis instance dan AZ dalam satu permintaan. AWS memenuhi armada dari kombinasi mana pun yang memiliki kapasitas tersedia dengan harga terendah.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Dengan armada yang terdiversifikasi, gangguan pada satu jenis instance atau AZ hanya memengaruhi sebagian armada. Sisanya terus berjalan. Untuk pekerjaan batch Nimbus, menjalankan Spot Fleet empat-instance alih-alih satu instance besar berarti bahkan gangguan parsial memungkinkan pekerjaan selesai — lebih lambat, tetapi tanpa restart total.

"Armada yang terdiversifikasi juga cenderung mendapat harga lebih baik," kata Tom. "AWS memberi Anda harga terendah di seluruh jenis dalam armada Anda. Pada beberapa malam Anda mendapat c5a dengan harga lebih rendah daripada c5 karena kapasitas kebetulan ada di sana."

"Berapa biayanya per bulan dibandingkan hanya menggunakan satu jenis instance?" Tom bertanya pada dirinya sendiri dengan suara keras — kebiasaan itu sekarang benar-benar refleks. Dia menghitung angkanya. Spot Fleet dengan harga campuran rata-rata $1.80/malam versus $2.00/malam dengan permintaan satu jenis. Selisih kecil dalam istilah absolut, tetapi peningkatan keandalan saja sudah menjustifikasi perubahan itu.

"Dan bagaimana jika seseorang mencoba membobol Spot Fleet?" tanya Priya.

"Jawaban yang sama seperti biasa," kata Tom. "Setiap instance terisolasi dari yang lain. Fleet tidak menempatkan mereka pada segmen privat bersama secara otomatis. Security group Anda tetap berlaku untuk setiap instance secara individual."

Checkpoint membuat gangguan dapat dikelola, bukan dihilangkan. Pekerjaan tetap dimulai ulang dari checkpoint terakhir, dan jika restart bertepatan dengan periode lonjakan harga Spot, instance pengganti mungkin butuh 10 hingga 20 menit untuk tersedia. Pekerjaan yang sudah tercakup oleh checkpoint terakhir dilewati saat restart; pekerjaan sejak itu dikerjakan ulang. Total overhead pengerjaan ulang: kecil, tetapi nyata.

Spot Fleet menyelesaikan masalah ketersediaan dengan rapi. Dengan menentukan lima jenis instance di tiga AZ, Leo mengurangi probabilitas kesenjangan kapasitas total ke mendekati nol. Strategi alokasi AWS — diversified — mendistribusikan armada empat-instance di seluruh pool, sehingga tidak ada gangguan pool tunggal yang dapat menghentikan pekerjaan. Ketika satu instance terganggu, tiga sisanya terus memproses, dan checkpoint berarti instance pengganti mengambil hanya pekerjaan yang sedang diproses oleh yang terganggu. Dari ujung ke ujung, pekerjaan tak pernah lagi melewatkan tenggat laporan pukul 7 pagi.

"Berapa biaya diversifikasi dalam hal kompleksitas?" tanya Maya, ketika Leo mendokumentasikan ini.

"Tiga baris ekstra dalam permintaan Spot Fleet," kata Leo. "Kode pemrosesan tidak tahu atau peduli jenis instance mana yang dijalankannya. Kompleksitas sepenuhnya berada di konfigurasi armada, bukan di aplikasi."

Itulah keuntungan merancang aplikasi menjadi tanpa status sejak awal: keputusan penskalaan dan toleransi kesalahan menjadi keputusan infrastruktur, bukan keputusan kode.


**Dedicated Hosts: Pilihan Kepatuhan**

Beberapa lisensi perangkat lunak (Oracle, Windows Server dalam beberapa konfigurasi) dihargai per soket atau inti fisik. Ketika Anda menjalankan perangkat lunak ini pada host bersama (default untuk EC2), Anda mungkin membayar kapasitas yang tidak Anda gunakan.

**Dedicated Hosts** memberi Anda akses ke server fisik sepenuhnya untuk penggunaan Anda. Anda dapat membawa lisensi per soket yang sudah Anda miliki. Tidak ada instance pelanggan AWS lain yang berjalan pada perangkat keras yang sama.

Dedicated Hosts secara signifikan lebih mahal daripada EC2 standar. Mereka adalah alat kepatuhan dan lisensi, bukan alat optimasi biaya.

Nimbus tidak memiliki persyaratan lisensi yang membutuhkan Dedicated Hosts. Sebagian besar aplikasi cloud-native tidak.

**Variasi: Ketika Komitmen Menjadi Bumerang**

Jika beban kerja Anda dapat diprediksi dan stabil selama 12 bulan, Reserved Instances memberikan diskon maksimum — tetapi jika kebutuhan jenis instance Anda mungkin berubah signifikan selama periode itu, penguncian itu akan merugikan Anda fleksibilitas yang nilainya lebih besar daripada selisih harga. Convertible RIs menyelesaikan sebagian dari itu, tetapi dengan diskon yang berkurang. Compute Savings Plans menyelesaikan sebagian besarnya, dengan diskon maksimum yang sedikit lebih rendah daripada Standard RIs.

Jika Anda menggunakan Spot Instances untuk pekerjaan batch yang toleran terhadap kesalahan, Anda dapat mencapai penghematan 60-90% — tetapi jika instance yang sama melayani permintaan pengguna langsung, gangguan di tengah permintaan berarti transaksi gagal dan pelanggan tidak senang. Toleransi beban kerja terhadap gangguan adalah variabel penentu.

Ada kasus pilihan-salah yang lebih halus: terlalu banyak berkomitmen pada Savings Plan. Jika Anda membeli Compute Savings Plan $3.00/jam karena penggunaan komputasi Anda rata-rata $3.00/jam kuartal lalu, lalu mengoptimalkan layanan Anda kuartal ini (menurunkan total penggunaan ke $1.80/jam), Anda membayar $3.00/jam yang dikomitmen terlepas dari itu. Selisih $1.20/jam adalah pemborosan. (Perhatikan bahwa memindahkan beban kerja EC2 ke Fargate atau Lambda *tidak* akan menyia-nyiakan Compute Savings Plan — ia mencakup ketiganya. Risiko penyia-nyiaan adalah pengurangan penggunaan yang nyata, atau penguncian keluarga dengan EC2 Instance Savings Plans dan RIs.) Inilah mengapa strategi titik dasar penting: berkomitmen ke minimum Anda, bukan rata-rata Anda. Dan tinjau setiap kuartal.

Aturannya: berkomitmen pada apa yang Anda yakini. Gunakan On-Demand untuk apa yang tidak Anda yakini. Gunakan Spot hanya untuk apa yang dapat bertahan dari penghentian mendadak.

**Membangun Armada Campuran**

Pendekatan yang matang: gunakan beberapa model harga bersamaan.

Untuk armada API Nimbus:

- **Beban dasar (4 instance, selalu berjalan)**: Dicakup oleh komitmen Savings Plan
- **Puncak yang dapat diprediksi (2 instance tambahan selama jam kerja)**: Dicakup oleh Savings Plan jika komitmen mencakupnya, jika tidak On-Demand
- **Kelebihan lonjakan lalu lintas**: Spot Instances (dapat diterima karena server API tanpa status — permintaan didistribusikan ulang jika sebuah instance terminasi)

Hasilnya: armada yang mengoptimalkan biaya di setiap lapisan — harga yang dikomitmen untuk bagian yang dapat diprediksi, On-Demand untuk pertumbuhan tak terduga, Spot untuk kapasitas burst.

**Memantau Pemanfaatan Savings Plan**

Membeli Savings Plan bukanlah akhir dari pekerjaan. Itu adalah awal dari kewajiban berulang: mengetahui apakah komitmen sedang dihasilkan.

Tom menetapkan pengingat kalender untuk Senin pertama setiap kuartal: tinjauan pemanfaatan Savings Plan. Alatnya adalah AWS Cost Explorer. Secara spesifik, tab "Savings Plans" di bawah "Reservations and Savings Plans," yang menampilkan tiga angka yang dia pedulikan:

- **Tingkat pemanfaatan (utilization)**: Berapa persen dari pengeluaran yang dikomitmen benar-benar dicocokkan oleh penggunaan yang memenuhi syarat? Angka di bawah 100% berarti dia membayar komitmen yang tidak digunakan.
- **Tingkat cakupan (coverage)**: Berapa persen penggunaan EC2 yang memenuhi syarat dicakup oleh Savings Plan, versus berjalan dengan tarif On-Demand? Angka di bawah 80% berarti ada penggunaan yang tidak tercakup yang akan ditangkap oleh komitmen yang lebih besar.
- **Pengeluaran On-Demand**: Bagian dari pengeluaran EC2 yang tidak dicakup oleh Savings Plan apa pun. Jika ini tumbuh, entah Savings Plan terlalu kecil atau beban kerja baru telah ditambahkan di luar cakupan komitmen.

Pada tinjauan kuartalan pertama, angka-angkanya terlihat seperti ini:

- Pemanfaatan: 97%. Tiga persen dari pengeluaran yang dikomitmen tidak tercocokkan — $9,90 per bulan pada komitmen $330/bulan. Itu dapat diterima; itu berarti komitmen ditetapkan sedikit di atas penggunaan titik dasar aktual, yang disengaja.
- Cakupan: 84%. Enam belas persen dari penggunaan EC2 yang memenuhi syarat berjalan On-Demand. Itu adalah kapasitas burst — instance kelebihan yang berputar selama lonjakan lalu lintas dan tidak dicakup oleh komitmen.
- Pengeluaran EC2 On-Demand: $147/bulan. Spot Instances (tidak dicakup oleh Savings Plans, dihargai terpisah) menyumbang sebagian besar sisanya.

"Pemanfaatan 97% itu sehat," kata Tom. "Itu berarti kita tidak terlalu banyak berkomitmen. Jika ini 80%, saya akan tahu kita telah membeli berlebih."

"Dan cakupan 84%?" tanya Maya.

"Itu juga baik. 16% yang On-Demand adalah kapasitas burst — instance yang berjalan selama berjam-jam saat puncak, bukan sepanjang hari. Kita perlu membeli komitmen Savings Plan jauh lebih banyak untuk mencakupnya, dan mungkin tidak terjustifikasi." Dia menghitung angkanya: instance On-Demand yang tidak tercakup berjalan mungkin 40 jam per bulan pada $0.101/jam per instance. Mencakupnya dengan Savings Plan akan memerlukan komitmen yang akan kita manfaatkan kurang dari 90% dari waktu. Lebih baik dibiarkan On-Demand.

Pada tinjauan kuartalan kedua, enam bulan kemudian, satu metrik telah berubah: pengeluaran EC2 On-Demand telah tumbuh menjadi $290/bulan. Fitur Nimbus Instant telah diluncurkan, dan beberapa instance layanan latar belakang baru telah ditambahkan tanpa disadari Tom.

"Ketiga instance ini," kata Tom, menunjuk rincian Cost Explorer. "Mereka telah berjalan On-Demand selama tiga bulan. Jika mereka akan terus berjalan, kita harus menambahkannya ke komitmen Savings Plan."

Tinjauan kuartalan telah menangkapnya. Tanpa tinjauan itu, ketiga instance itu akan terus dengan tarif walk-in tanpa batas.

"Bagaimana cara menyesuaikan komitmen?" tanya Priya.

"Anda membeli Savings Plan baru tambahan di atas yang sudah ada," kata Tom. "Savings Plans menumpuk. Saya akan menambahkan Compute Savings Plan $0.10/jam untuk beban dasar baru. Paket $0.45/jam yang ada berlanjut sampai masa tiga tahunnya berakhir. Paket baru memulai masa tiga tahunnya sendiri."

"Jadi kita akan punya dua Savings Plan yang tumpang tindih."

"Ya. Mereka berlaku secara independen untuk penggunaan apa pun yang memenuhi syarat yang ada. AWS mencocokkannya dalam urutan dari yang paling menguntungkan ke yang paling tidak menguntungkan."

"Sudahkah kita memikirkan apa yang terjadi jika kita menjual salah satu layanan latar belakang itu tahun depan?" tanya Priya. "Kita telah berkomitmen ke $0.55/jam selama tiga tahun."

"Itu risiko masa tiga tahun," kata Tom. "Itulah mengapa komitmen baru lebih kecil — saya berkomitmen ke titik dasar beban kerja baru, bukan rata-rata. Jika kita menonaktifkan satu layanan dan penggunaan turun, layanan yang tersisa seharusnya tetap mengonsumsi seluruh jumlah yang dikomitmen."

Disiplin tinjauan kuartalan tidaklah glamor. Itu lima belas menit di Cost Explorer, tiga angka diperiksa, satu keputusan dibuat atau ditunda. Tetapi selama tiga tahun, disiplin itu adalah perbedaan antara Savings Plan yang memberikan pemanfaatan 90%+ — penghematan sejati — dan yang melayang ke pemborosan parsial seiring infrastruktur berkembang di sekitarnya.

## Kekuatan dan Batasan

**On-Demand**: Tidak ada komitmen. Harga penuh. Gunakan untuk beban kerja yang tak terduga atau jangka pendek.

**Reserved Instances**: Hingga 72% diskon. Terkunci ke jenis instance/region/OS tertentu. Jual kapasitas yang tidak terpakai di RI Marketplace.

**Savings Plans**: Hingga 66-72% diskon. Lebih fleksibel daripada RIs (Compute Savings Plans berlaku untuk jenis instance apa pun). Penerapan otomatis ke penggunaan yang cocok.

**Spot Instances**: Hingga 90% diskon. Risiko gangguan 2 menit. Hanya untuk beban kerja toleran terhadap kesalahan, tanpa status, dapat diinterupsi.

**Dedicated Hosts**: Server fisik penuh. Paling mahal. Diperlukan untuk skenario lisensi atau kepatuhan tertentu.

## Ringkasan

Tom menghabiskan sisa Sabtu memetakan setiap beban kerja Nimbus ke model harga idealnya — beban dasar ke Savings Plans, pekerjaan batch malam ke Spot, kelebihan tak terduga ke On-Demand. Latihan itu mengubah tiga bulan membayar tarif walk-in menjadi strategi yang disengaja. Angka-angka, setelah dihitung, sulit diabaikan.

- Harga EC2 memiliki empat model: **On-Demand** (harga penuh, tanpa komitmen), **Reserved Instances/Savings Plans** (pengeluaran yang dikomitmen untuk diskon signifikan), **Spot** (kapasitas cadangan dengan diskon 60-90%, dapat diinterupsi), **Dedicated Hosts** (eksklusivitas server fisik).
- **Savings Plans** umumnya lebih disukai daripada Reserved Instances untuk fleksibilitas.
- **Spot Instances** memerlukan beban kerja toleran terhadap kesalahan, tanpa status — hanya untuk pekerjaan batch, pelatihan ML, dan pemrosesan yang dapat diinterupsi.
- **Checkpoint ke penyimpanan tahan lama** (S3) diperlukan untuk pekerjaan batch berbasis Spot — pekerjaan yang terganggu harus melanjutkan dari checkpoint terakhir, bukan memulai ulang dari nol.
- **Diversifikasi Spot Fleet** di beberapa jenis instance dan AZ mengurangi risiko gangguan dan sering menghasilkan harga lebih baik.
- Strategi optimal adalah **armada campuran**: Savings Plans untuk beban dasar, On-Demand untuk pertumbuhan tak terduga, Spot untuk pekerjaan batch yang dapat diinterupsi.
- Tinjau model harga ketika beban kerja telah berjalan stabil selama 3+ bulan — saat itulah On-Demand mulai menjadi pemborosan.
- **Tinjau komitmen Savings Plan setiap kuartal** — berkomitmen ke titik dasar Anda, bukan rata-rata, dan sesuaikan seiring pola penggunaan berubah.

## Tips Ujian

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.2)*

- **Savings Plans vs Reserved Instances**: Savings Plans lebih fleksibel (berlaku untuk instance EC2 apa pun untuk Compute Savings Plans). Reserved Instances mengunci ke jenis instance tertentu. Skenario ujian: "butuh fleksibilitas maksimum sambil tetap mendapatkan diskon" → Savings Plans. "Tahu jenis instance yang tepat selama 3 tahun" → Standard RI untuk diskon maksimum.
- **Sinyal Spot**: "sensitif biaya," "toleran terhadap kesalahan," "pemrosesan batch," "dapat menangani gangguan," "beban kerja tanpa status," "pelatihan ML" → Spot.
- **Penanganan gangguan Spot**: Instance Spot mendapat peringatan 2 menit sebelum terminasi. Aplikasi Anda harus menanganinya dengan baik (simpan status, kuras koneksi, keluar dengan bersih).
- **On-Demand vs Spot untuk server web**: Server web yang melayani lalu lintas pengguna langsung TIDAK boleh menggunakan Spot (gangguan menyebabkan permintaan yang gagal). Gunakan On-Demand atau Savings Plans untuk tingkat web.
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans berlaku untuk keluarga instance dan region tertentu (diskon lebih tinggi). Compute Savings Plans berlaku untuk instance EC2 apa pun, Lambda, dan Fargate (diskon maksimum lebih rendah, lebih fleksibel).
- **RI Marketplace**: Reserved Instances Standard yang tidak terpakai dapat dijual ke pelanggan AWS lain. Convertible RIs tidak dapat dijual.
- **Hibernation:** Menyimpan isi RAM ke volume root EBS saat berhenti; memulihkannya saat start. Instance melanjutkan lebih cepat daripada cold start dengan semua proses dan status utuh. Gunakan ketika status instance harus dipertahankan antar sesi. Memerlukan: diaktifkan saat peluncuran (tidak dapat ditambahkan ke instance yang sudah ada), RAM ≤ 150 GB, volume root EBS terenkripsi, tidak tersedia untuk instance bare-metal; maksimum 60 hari terhibernasi. Sinyal ujian: "melanjutkan instance dengan cepat dengan status in-memory dipertahankan" atau "instance pengembangan butuh terlalu lama untuk diinisialisasi" → Hibernation.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan kapan Spot Instances sesuai dan kapan tidak. Karakteristik apa yang membuat beban kerja cocok untuk Spot?

*(Petunjuk: Pikirkan tentang apa yang terjadi ketika instance diterminasi dengan pemberitahuan 2 menit. Beban kerja mana yang pulih dengan bersih? Mana yang tidak?)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan media menjalankan pipeline transcoding video yang mengubah video yang diunggah menjadi beberapa format. Pekerjaan transcoding berjalan terus-menerus kapan pun video diunggah (operasi 24/7, volume variabel). Setiap pekerjaan butuh 5-30 menit. Jika pekerjaan transcoding terganggu, pekerjaan dapat dimulai ulang dari awal tanpa kehilangan data. Perusahaan ingin meminimalkan biaya.

Model harga EC2 mana yang PALING memenuhi persyaratan ini?

A) Instance On-Demand dalam Auto Scaling Group  
B) Reserved Instances (1 tahun, All Upfront)  
C) Spot Instances dengan Spot Fleet untuk diversifikasi instance otomatis  
D) Dedicated Hosts dengan lisensi perangkat lunak media perusahaan yang ada

**Petunjuk 1**: "Dapat dimulai ulang dari awal tanpa kehilangan data" — ini adalah frasa kunci yang memungkinkan model harga tertentu.

**Petunjuk 2**: "Minimalkan biaya" dengan beban kerja yang dapat diinterupsi mengarah pada opsi diskon maksimum.

**Petunjuk 3**: Spot Fleet meminta instance dari beberapa jenis instance dan AZ, mengurangi kemungkinan gangguan.

**Jawaban**: C

**Penjelasan**: Pekerjaan transcoding toleran terhadap kesalahan — mereka dapat dimulai ulang jika terganggu. Ini menjadikan mereka ideal untuk Spot Instances, yang menawarkan diskon 60-90% dibandingkan On-Demand. Spot Fleet mendiversifikasi di seluruh jenis instance dan Availability Zone, mengurangi kemungkinan gangguan massal.

**Mengapa bukan A?** On-Demand adalah opsi biaya tertinggi. Untuk beban kerja yang berjalan terus-menerus dan toleran terhadap kesalahan, ini boros.

**Mengapa bukan B?** Reserved Instances memberikan diskon 50-72% tetapi tidak menawarkan potensi diskon 90% dari Spot untuk beban kerja toleran terhadap kesalahan. Selain itu, RIs untuk beban kerja yang dapat diprediksi dan stabil — Spot secara khusus untuk pemrosesan batch yang dapat diinterupsi.

**Mengapa bukan D?** Dedicated Hosts untuk kepatuhan lisensi, bukan optimasi biaya. Mereka adalah opsi paling mahal.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Infrastruktur Nimbus memiliki beban kerja berikut:

1. Server API: 6 instance, berjalan 24/7, stabil selama 2 tahun, menggunakan r6g.large
2. Pekerjaan batch analitik malam: 4 instance, berjalan pukul 3-6 pagi setiap malam, selalu jenis instance yang sama
3. Lingkungan pengujian: 2 instance, digunakan oleh insinyur pukul 9 pagi - 6 sore pada hari kerja
4. Kelebihan lonjakan lalu lintas: 0-8 instance, berputar selama jam sibuk, sepenuhnya tak terduga

Rancang strategi harga optimal untuk setiap jenis beban kerja. Jumlah komitmen Savings Plan mana yang akan mencakup beban kerja 1 dan 2? Untuk beban kerja 3, apakah ada strategi yang lebih cerdas daripada On-Demand?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih strategi harga EC2.)*

## Adegan Pasca-Kredit

Tom mengirimkan pembelian Savings Plan.

Komitmen $0.45/jam. Masa tiga tahun. Compute Savings Plans untuk fleksibilitas.

Dikombinasikan dengan Spot fleet untuk batch malam, perkiraan penghematan: $42.500 selama tiga tahun — sedikit lebih dari $14.000 per tahun.

Maya membaca angka itu. "Empat puluh dua ribu dolar."

"Dibandingkan dengan menjalankan semuanya On-Demand, selama tiga tahun."

"Berapa biaya untuk melakukan ini?"

"Satu sore analisis," kata Tom. "Dan keputusan untuk berkomitmen."

"Tiga tahun adalah waktu yang lama," kata Leo. "Bagaimana jika kita mengubah jenis instance?"

"Compute Savings Plans berlaku untuk jenis instance EC2 apa pun. Dan dalam tiga tahun, kita sudah cukup besar sehingga percakapan ini akan terlihat berbeda."

Leo memikirkan itu.

"Sudah berapa lama Anda tahu tentang Savings Plans?" tanyanya.

"Sejak kita mulai," kata Tom. "Saya menunggu sampai beban kerja cukup stabil untuk berkomitmen."

"Delapan belas bulan membayar On-Demand sambil menunggu."

"Ya." Tom menutup konsol. "Terkadang hal termahal yang Anda lakukan adalah menunggu untuk menghemat uang."

Di bab berikutnya: disiplin yang sama diterapkan pada biaya penyimpanan, dengan beberapa kejutan tentang apa yang mendorong tagihan.
