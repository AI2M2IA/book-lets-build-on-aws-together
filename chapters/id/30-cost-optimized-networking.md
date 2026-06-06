# Chapter 30: Biaya Tersembunyi

Tom punya papan tulis di ruang rapat dengan tiga kolom: komputasi, penyimpanan, jaringan. Dua yang pertama sudah terisi — angka, tanggal, nama optimasi yang selesai. Dia berdiri di depan papan tulis sejenak sebelum menulis apa pun di kolom ketiga. Baris-baris jaringan pada tagihan AWS tersebar di seluruh halaman dengan cara yang tidak dilakukan yang lain. Masing-masing punya nama berbeda, unit berbeda, justifikasi berbeda mengapa uang keluar.

Dia membuka tutup spidol.

**Rekap: Ketidakpastian Terakhir pada Tagihan**

Audit database telah menutup item baris besar terakhir yang sedang aktif dikerjakan Tom — $491/bulan dipulihkan, $5.892 per tahun. Tambahkan EC2 Savings Plans, kebijakan siklus hidup S3, dan pembersihan penyimpanan, dan total berjalannya adalah $34.092 dalam penghematan tahunan selama tiga bulan kerja. Tetapi Tom telah menyadari, selama pendalaman database, bahwa satu kategori nyaris belum diperiksa. Biaya penyimpanan muncul sebagai satu baris: "S3: $198." Biaya komputasi muncul sebagai satu baris: "EC2: $2.340" — sebelum diskon Savings Plan dari Bab 27 mendarat. Biaya jaringan tersebar di selusin entri dengan nama-nama seperti "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," dan "CloudFront Data Transfer." Dia tidak pernah menjumlahkannya dan melihat totalnya. Itu pekerjaan hari ini.

Tom membuka tagihan. Menemukan bagian transfer data. Menjumlahkan semua item baris.

Biaya jaringan di AWS seperti sistem tol kota: berkendara masuk ke kota gratis, tetapi setiap terowongan yang Anda ambil keluar berbiaya, dan berkendara antar lingkungan sedikit berbiaya juga. Sebagian besar orang tidak memikirkan tol sampai mereka menerima tagihan di akhir bulan dan menyadari mereka telah mengambil terowongan setiap hari ketika ada jalan permukaan gratis sepanjang waktu. Tujuan bab ini adalah memahami setiap pos tol — dan memutuskan mana yang layak dibayar.

$847/bulan.

"Kita menghabiskan $847 per bulan untuk transfer data," katanya.

"Apakah itu banyak?" tanya Leo.

"Itu persis sebanyak tagihan S3 kita sebelum kita mengoptimalkannya. Dan saya bahkan tidak tahu kita punya tagihan transfer data sebesar ini."

Maya melihat. "Apa sebenarnya transfer data itu?"

"Itu yang AWS kenakan untuk memindahkan byte di sekitar. Byte ke dalam AWS: biasanya gratis. Byte keluar dari AWS ke internet: dikenakan biaya. Byte antar layanan di region berbeda: dikenakan biaya. Byte yang melewati NAT Gateway: dikenakan biaya."

"Bisakah Anda merincinya?"

Tom bisa. Tetapi dia tidak berhenti di konsol penagihan kali ini. Dia mengaktifkan VPC Flow Logs di semua VPC mereka dan memberikannya ke CloudWatch Logs Insights. Ini memungkinkannya mengueri alur lalu lintas yang sebenarnya — bukan hanya jumlah dolar, tetapi sumber mana yang mengirim data ke mana, dan berapa banyak.

Kueri butuh dua menit untuk berjalan. Dikombinasikan dengan satu sumber log lagi yang akan dia tarik sebentar lagi, outputnya cukup spesifik untuk ditindaklanjuti.

**Analisis Lalu Lintas: Apa yang Sebenarnya Menghasilkan Tagihan**

Lima alur lalu lintas teratas berdasarkan volume, berurutan:

1. Server aplikasi EC2 → NAT Gateway → layanan AWS (SSM, Secrets Manager, CloudWatch, SQS): 3,9TB/bulan
2. Server aplikasi EC2 → NAT Gateway → API eksternal: 1,3TB/bulan
3. Endpoint reader Aurora → server aplikasi EC2 (lintas-AZ): 0,4TB/bulan
4. Pipeline analitik → bucket S3 di us-east-1 (lintas-region): 0,3TB/bulan
5. CloudFront → origin S3 (cache miss): 0,2TB/bulan

Empat yang pertama langsung keluar dari Flow Logs. Yang kelima tidak bisa: VPC Flow Logs hanya melihat lalu lintas yang melintasi antarmuka jaringan di dalam VPC Anda, dan cache miss CloudFront yang mengambil dari S3 tidak pernah menyentuh VPC sama sekali — itu CloudFront berbicara langsung ke S3. Untuk alur itu, Tom menarik log akses standar CloudFront dan memfilter pada field `x-edge-result-type`: setiap entri yang ditandai `Miss` adalah permintaan yang harus diambil CloudFront dari origin, dan menjumlahkan byte-nya memberinya 0,2TB. Satu tagihan, dua instrumen — masing-masing buta terhadap apa yang dilihat yang lain.

"Alur nomor empat," kata Priya. "Mengapa pipeline analitik kita berbicara ke bucket di us-east-1?"

Leo punya ekspresi di wajahnya yang Tom kenali.

"Saya sudah men-deploy-nya — oh," kata Leo. "Enam bulan lalu saya sedang menguji apakah pipeline analitik kita bisa fan-out ke beberapa region secara paralel. Saya membuat bucket uji di us-east-1, mengarahkan pipeline ke sana, dan menjalankannya selama seminggu. Pengujian berakhir tetapi saya lupa menghapus tujuan us-east-1 dari konfigurasi pipeline."

"Jadi selama lima bulan," kata Tom, "kita telah menulis salinan setiap hasil analitik ke bucket di Virginia."

"Berapa biayanya per bulan?" tanya Tom.

Transfer lintas-region dari us-west-2 ke us-east-1: $0.02/GB. 300GB/bulan = $6/bulan untuk transfer. Ditambah penyimpanan S3 untuk data duplikat di us-east-1: 300GB × 5 bulan × $0.023/GB = $34,50 dalam data tersimpan.

"Tidak besar," kata Leo.

"Tidak besar per bulan," kata Tom. "Tetapi telah berjalan selama lima bulan dan tidak ada yang tahu. Itu biaya yang tidak disengaja. Pertanyaannya bukan apakah $6 itu penting — tetapi apakah kita tahu mengapa setiap dolar dikeluarkan."

Leo menghapus bucket uji us-east-1 dan menghapus tujuannya dari konfigurasi pipeline.

Temuan yang paling dapat ditindaklanjuti dalam output flow log adalah alur nomor satu: server aplikasi EC2 memanggil layanan AWS melalui NAT Gateway.

Tom menarik entri log spesifik untuk kueri CloudWatch Logs Insights, difilter untuk hanya menampilkan lalu lintas yang ditujukan ke rentang IP layanan AWS:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Output menunjukkan sesuatu yang tidak dia harapkan: kira-kira 300 GB per bulan lalu lintas S3 region-yang-sama — terpisah dari alur lintas-region ke bucket us-east-1 Leo — melewati NAT Gateway. Tetapi Tom telah mengonfigurasi S3 Gateway Endpoints berbulan-bulan lalu.

"Kita punya S3 Gateway Endpoint," kata Leo. "Mengapa lalu lintas S3 masih melalui NAT?"

Tom melihat route table. Gateway Endpoint dikonfigurasi — tetapi hanya untuk VPC aplikasi. Pipeline analitik berjalan di VPC terpisah yang telah dibuat sembilan bulan lalu untuk isolasi data. VPC itu tidak punya S3 Gateway Endpoint. Setiap panggilan S3 dari instance EC2 pipeline analitik dirutekan melalui NAT Gateway VPC itu.

"0,3TB lalu lintas pipeline analitik × $0.045/GB = $13,50/bulan," kata Tom. "Hanya dari endpoint yang hilang di VPC kedua."

"Berapa biaya menambahkan endpoint?" tanya Leo.

"Nol," kata Tom. "S3 Gateway Endpoints gratis. Itu sebuah entri route table."

Menambahkan Gateway Endpoint ke VPC analitik akan butuh empat menit dan memangkas $13,50 dari biaya NAT Gateway bulanan — angka absolut kecil, tetapi temuannya adalah prinsipnya. Mereka telah menambahkan kontrol biaya di satu VPC dan lupa mereplikasinya ketika mereka membuat yang kedua. Konsistensi memerlukan proses, bukan hanya pengetahuan.

Tom menambahkan ke daftar periksa penerapan: ketika membuat VPC baru, tambahkan S3 dan DynamoDB Gateway Endpoints sebelum melampirkan beban kerja apa pun.

Temuan spesifik kedua dari flow logs lebih mahal. Lalu lintas dari fungsi Lambda yang menjalankan sistem notifikasi pesanan — akses S3 untuk membaca berkas konfigurasi restoran — melalui NAT Gateway alih-alih S3 endpoint. Fungsi Lambda berjalan di dalam VPC (untuk akses RDS), dan S3 endpoint VPC dikonfigurasi hanya untuk instance EC2 di subnet aplikasi. Fungsi Lambda di subnet Lambda dirutekan melalui NAT.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Kita punya endpoint-nya. Mengapa Lambda tidak menggunakannya?"

"VPC Gateway Endpoints berlaku per subnet berdasarkan route table," kata Tom. "Fungsi Lambda ada di subnet mereka sendiri dengan route table mereka sendiri. Route table itu tidak punya rute endpoint. Saya menambahkannya untuk subnet aplikasi. Saya melewatkan subnet Lambda."

Menambahkan rute S3 endpoint ke route table subnet Lambda akan menghemat $41/bulan lagi dalam biaya pemrosesan NAT Gateway yang telah membebani panggilan S3 yang seharusnya gratis.

Analisis flow log telah membayar dirinya sendiri. Tiga jam waktu kueri, tiga temuan konkret: endpoint VPC analitik yang terlupakan ($13,50/bulan), kesenjangan routing subnet Lambda ($41/bulan), dan temuan besar asli yang menjadi dasar keputusan Interface Endpoint. Total penghematan bulanan tambahan yang diidentifikasi oleh analisis flow log: $54,50, di atas $78 dari Interface Endpoints yang sudah diangkat analisis itu. Dua perbaikan lebih kecil itu masuk backlog untuk sprint berikutnya; tabel penghematan di akhir bab ini hanya menghitung apa yang dikirimkan.

"Pelajarannya adalah bahwa VPC endpoint bukan konfigurasi satu kali," kata Tom. "Setiap VPC baru, setiap subnet baru, setiap jenis beban kerja baru memerlukan pemeriksaan yang sama. Default untuk apa pun di subnet privat adalah merutekan melalui NAT. Pemeriksaannya adalah: apakah beban kerja ini memanggil S3, DynamoDB, atau salah satu layanan AWS lalu lintas tinggi? Jika ya, apakah ia punya rute endpoint?"

"Sudahkah kita memikirkan mengotomatiskan pemeriksaan itu?" tanya Priya. "Aturan AWS Config yang memberi peringatan ketika subnet privat dibuat tanpa rute S3 endpoint?"

"Itu ada di daftar," kata Tom. "Tepat setelah peringatan volume yatim."


Dan dengan itu, Tom punya jawabannya untuk pertanyaan yang memulai analisis. Biaya jaringan bukanlah masalah tunggal. Mereka adalah lima masalah berbeda, masing-masing dengan solusi berbeda.

**Cara AWS Mengenakan Biaya untuk Transfer Data**

Harga transfer data AWS bersifat asimetris:

**Ke dalam AWS (inbound)**: Gratis. Anda bisa mengunggah data sebanyak yang Anda inginkan.

**Keluar dari AWS ke internet (outbound)**: Dikenakan biaya. 100GB/bulan pertama gratis. Setelah itu:

- $0.09/GB untuk 10TB pertama/bulan (region AS)
- $0.085/GB untuk 40TB berikutnya
- Lebih rendah pada volume yang lebih tinggi

**Dalam Availability Zone yang sama**: Gratis. Instance EC2 yang berbicara satu sama lain di AZ yang sama tidak membayar apa pun.

**Antar Availability Zone (region yang sama)**: $0.01/GB di setiap arah. Biaya kecil tetapi nyata.

**Antar Region**: $0.02-0.08/GB tergantung region. Lalu lintas lintas-region secara signifikan lebih mahal.

**NAT Gateway**: $0.045/GB yang diproses. Setiap byte yang dikirim instance EC2 privat Anda melalui NAT Gateway untuk mencapai internet — dan setiap byte yang kembali — dikenakan biaya.

**CloudFront**: Tarif transfer data lebih rendah daripada AWS-ke-internet langsung. $0.085/GB untuk 10TB pertama (sedikit kurang dari transfer data keluar langsung). CloudFront sering mengurangi total biaya transfer karena caching edge-nya berarti origin menyajikan data lebih jarang.

**Rincian Tom**

"Berapa biayanya per bulan?" Tom bertanya, untuk setiap item baris secara bergiliran. Dia menambahkannya ke tab terpisah di spreadsheet — bukan total bulanan, tetapi setiap kategori dirinci. Totalnya kurang berguna daripada memahami bagian mana dari tagihan adalah jenis biaya apa.

Setelah mengkategorikan setiap item baris:

**Data keluar ke internet**: $214/bulan

- Respons API ke pelanggan secara global
- Aset yang masih disajikan langsung dari S3 dan ALB ke klien, melewati CloudFront (pengisian cache itu sendiri — CloudFront mengambil dari origin AWS — gratis: AWS membebaskan transfer origin-ke-CloudFront)

**Pemrosesan NAT Gateway**: $289/bulan

- Server aplikasi memanggil API eksternal (pemroses pembayaran, layanan email, data peta)
- Panggilan DynamoDB melalui NAT Gateway (sebelum VPC endpoint disiapkan untuk beberapa tabel)

**Transfer data lintas-AZ**: $178/bulan

- Load balancer ke instance EC2 (load balancer di satu AZ, beberapa instance di yang lain)
- Server aplikasi ke read replica RDS (di AZ berbeda)

**Transfer data lintas-region**: $166/bulan

- Replikasi Aurora Global Database (primer di us-west-2, reader di us-east-1)
- S3 Cross-Region Replication untuk cadangan
- Pipeline uji Leo yang terlupakan ($6/bulan dari total ini)

**NAT Gateway: Kejutan Terbesar**

$289/bulan dalam biaya pemrosesan NAT Gateway adalah item terbesar. Dan analisis VPC Flow Log telah membuatnya spesifik: konsumen teratas adalah server aplikasi memanggil API layanan AWS (SSM, Secrets Manager, CloudWatch Logs) melalui NAT Gateway.

Dalam Bab 11, Tom telah menyiapkan VPC Gateway Endpoints untuk S3 dan DynamoDB. Ini gratis. Tetapi dia melewatkan menyiapkan Interface Endpoints untuk beberapa layanan lain:

- Systems Manager (SSM) untuk manajemen patch
- Secrets Manager untuk pengambilan kredensial
- CloudWatch untuk pengiriman metrik dan log
- SQS untuk polling pesan

Setiap panggilan ke layanan ini dari instance EC2 privat melewati NAT Gateway. Setiap panggilan dikenakan $0.045/GB.

Anda mungkin bertanya-tanya mengapa AWS mengenakan biaya untuk lalu lintas yang melewati NAT Gateway ketika Anda sudah di dalam jaringan AWS. Jawabannya adalah bahwa NAT Gateway itu sendiri adalah layanan terkelola — biayanya untuk dijalankan, dan AWS meneruskan biaya itu per gigabyte. VPC Endpoints menghilangkan perantara, itulah mengapa mereka mengurangi tagihan.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya, ketika Tom menunjukkan angka-angkanya. "Kita menyiapkan Gateway Endpoints untuk S3 dan DynamoDB. Mengapa kita tidak melakukan hal yang sama untuk SSM dan CloudWatch?"

"Gateway Endpoints hanya tersedia untuk S3 dan DynamoDB," kata Tom. "Untuk yang lainnya — SSM, Secrets Manager, SQS — Anda butuh Interface Endpoints. Mereka tidak gratis, tetapi lebih murah daripada merutekan melalui NAT pada volume yang kita hasilkan."

**Interface Endpoints** untuk layanan ini: $0.01/jam per AZ + $0.01/GB data yang diproses.

Pada volume Nimbus, SSM Interface Endpoint akan berbiaya sekitar $25/bulan (biaya per jam ditambah pemrosesan per-GB) dan menghemat sekitar $45/bulan dalam biaya NAT Gateway (karena SSM menghasilkan volume data signifikan untuk manajemen patch dan panggilan parameter store).

Biaya dan penghematan endpoint bervariasi menurut layanan dan volume. Tom menghitung bahwa menyiapkan Interface Endpoints untuk empat layanan lalu lintas tinggi — dua AZ masing-masing, ditambah pemrosesan $0.01/GB pada 3,9TB yang akan mereka bawa — akan berbiaya sekitar $97/bulan total dan menghemat kira-kira $176/bulan dalam pemrosesan NAT Gateway.

Penghematan bersih: $78/bulan dari pengaturan endpoint saja.

"Dan bagaimana jika seseorang mencoba membobol?" kata Priya, ketika percakapan VPC endpoint beralih ke implementasi. "VPC endpoint berarti lalu lintas tidak pernah menyentuh internet publik — itu bukan hanya biaya, itu pengurangan permukaan ancaman. Kita seharusnya melakukan ini untuk manfaat keamanan saja."

"Setuju," kata Tom. "Penghematan biaya adalah bonus."

Leo melihat daftar layanan yang telah dirutekan melalui NAT. "Saya mungkin telah menyiapkan endpoint logging CloudWatch tanpa memeriksa apakah ada VPC endpoint untuknya," katanya. "Akan baik-baik saja untuk sekarang — tapi ya, itu telah melalui NAT selama enam bulan."

"Itu ada di daftar," kata Tom. "CloudWatch adalah salah satu dari empat yang kita perbaiki."

**Perhitungan PrivateLink: Kapan Masuk Akal**

Ada versi yang lebih kompleks dari percakapan ini yang muncul seiring arsitektur tumbuh: menggunakan AWS PrivateLink untuk menyediakan konektivitas privat ke layanan yang di-host oleh pelanggan AWS lain (atau layanan Anda sendiri di VPC lain).

PrivateLink Interface Endpoints berbiaya $0.01/jam per AZ ditambah $0.01/GB. Untuk layanan yang menghasilkan 1TB/bulan lalu lintas melalui endpoint:

- Biaya PrivateLink: $0.01 × 2 AZ × 730 jam + $0.01 × 1.000GB = $14,60 + $10 = $24,60/bulan
- Merutekan lalu lintas yang sama melalui NAT Gateway yang ada sebagai gantinya: $0.045 × 1.000GB = $45/bulan biaya pemrosesan tambahan

Perbandingannya bersifat *tambahan*, karena NAT Gateway tetap ada apa pun yang terjadi — ia masih melayani sisa lalu lintas yang menuju internet, jadi biaya per jamnya ($0.045 × 2 × 730 = $65,70) tidak hilang ketika satu layanan ini pindah ke endpoint. Untuk volume lalu lintas ini, PrivateLink menghemat kira-kira $20/bulan. Titik impasnya kira-kira 420GB/bulan — di bawah itu, biaya per jam endpoint itu sendiri melebihi penghematan per-GB relatif terhadap pemrosesan NAT.

"Tunggu — tapi *mengapa* kita menggunakan PrivateLink alih-alih hanya VPN atau peering?" tanya Maya.

"VPC Peering lebih sederhana dan gratis untuk transfer dalam-region," kata Tom. "Tetapi peering membuat koneksi yang terutekan sepenuhnya antar VPC — apa pun di VPC A berpotensi mencapai apa pun di VPC B. PrivateLink lebih bedah. Endpoint mengekspos layanan spesifik, bukan rute jaringan penuh. Untuk arsitektur yang sadar keamanan, kekhususan itu penting."

"Dan bagaimana jika seseorang mencoba membobol VPC yang dipeering?" tanya Priya. "Peering penuh berarti instance yang dikompromikan di satu VPC punya rute ke setiap instance di VPC yang dipeering."

"Itu argumen untuk PrivateLink daripada peering ketika Anda terhubung ke layanan pihak ketiga atau layanan yang dimiliki tim terpisah," kata Tom. "Peering untuk VPC dalam-perusahaan yang dipercaya. PrivateLink untuk apa pun di mana Anda ingin koneksi paparan-minimum."

**Lalu Lintas Lintas-AZ: Pertanyaan Arsitektur**

$178/bulan dalam transfer data lintas-AZ lebih rumit.

Sebagian dari itu tidak dapat dihindari: load balancer mendistribusikan lalu lintas di seluruh AZ, jadi beberapa permintaan berasal di satu AZ dan load balancer meneruskannya ke instance di AZ lain.

Sebagian dari itu dapat dioptimalkan: aplikasi dikonfigurasi untuk menulis ke primer RDS (di us-west-2a) dan membaca dari read replica (di us-west-2b). Setiap kueri baca melintasi batas AZ.

Untuk pembacaan, satu solusi: konfigurasi aplikasi untuk memilih read replica di AZ yang sama dengan instance yang meminta. Setiap AZ mendapat read replica-nya sendiri. Lalu lintas tetap lokal.

Trade-off: lebih banyak read replica = lebih banyak biaya. Jika biaya lalu lintas lintas-AZ adalah $50/bulan dan read replica tambahan berbiaya $190/bulan, optimasi lokal-AZ tidak menguntungkan.

Tom menghitung: pada volume kueri mereka saat ini, lalu lintas lintas-AZ hanya $31/bulan dari $178. Tidak sepadan menambahkan replika.

Biaya lintas-AZ lainnya adalah routing load balancer dan komunikasi antar layanan — sebagian besar tidak dapat dihindari pada tingkat arsitektur saat ini.

"Ini salah satu kasus di mana memahami biaya tidak berarti Anda harus memperbaikinya," kata Tom.

"Berapa biaya menghilangkan lalu lintas lintas-AZ sepenuhnya?" tanya Maya.

"Semuanya di satu AZ menggagalkan tujuan Multi-AZ. Itu penghematan $31/bulan dengan biaya kehilangan ketersediaan tinggi."

"Jadi kita biarkan saja," katanya.

"Kita biarkan saja."

**S3 Select: Mengurangi Transfer Data dalam Kueri**

Sementara meninjau pipeline analitik, Tom menemukan optimasi lain yang spesifik untuk bagaimana tim analitik mengueri berkas S3 besar.

Polanya: setiap pagi, sebuah pekerjaan analitik mengunduh berkas Parquet 500MB dari S3 untuk memfilternya di memori untuk data pesanan spesifik restoran. Kira-kira 95% berkas dibuang setelah diunduh.

**S3 Select** memungkinkan Anda mengambil hanya baris dan kolom yang Anda butuhkan dari objek S3 (CSV, JSON, Parquet), alih-alih mengunduh seluruh berkas untuk memfilternya di aplikasi Anda.

> **Pembaruan penting**: pada pertengahan 2024, AWS berhenti menawarkan S3 Select kepada pelanggan baru — pengguna yang ada tetap memilikinya, tetapi itu jalan buntu untuk arsitektur baru. Prinsip yang diajarkan bagian ini (filter di lapisan penyimpanan, jangan kirim seluruh berkas) bersifat abadi; alat modern untuknya adalah **Amazon Athena** (SQL langsung di atas S3, termasuk join dan agregasi yang tidak pernah dimiliki S3 Select). **S3 Object Lambda**, yang dulunya alternatif lain, mengikuti S3 Select ke status legacy: per 7 November 2025 ia juga ditutup untuk pelanggan baru (beban kerja yang ada tetap berjalan). Pada ujian saat ini, "kueri data di tempat pada S3" menunjuk ke Athena. Kisah di bawah ini dipertahankan karena *penalaran*-nya — ukur dulu, pindahkan filter ke data — adalah pelajarannya.

Tanpa S3 Select:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Dengan S3 Select:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select mengurangi data yang dipindahkan dari S3 ke aplikasi Anda. Untuk berkas besar dengan kueri selektif, ini bisa menjadi pengurangan volume data 10-100x — dan, karena instance analitik berjalan di region yang sama dengan bucket, kemenangannya bukan tagihan transfer (transfer S3-ke-EC2 region-yang-sama gratis): itu komputasi, memori, dan waktu yang dihabiskan untuk mengunduh dan memfilter data yang segera Anda buang.

Tom mengangkatnya dengan tim analitik. Mereka awalnya menentang.

"Kami sudah tahu cara menulis pandas," kata seorang analis.

"Ini bukan tentang pandas," kata Tom. "Ini tentang fakta bahwa kalian mengunduh 500MB untuk mendapatkan 2MB data. Unduhannya sendiri gratis — region yang sama — tetapi instance-nya tidak. Kalian menjalankan ini untuk setiap restoran: 287 restoran, 287 kueri, 140GB ditarik dan difilter di pandas setiap malam. Itulah yang membuat kotak analitik sibuk selama dua jam — dan itulah mengapa ia xlarge."

"Dan S3 Select?"

"S3 Select mengenakan $0.002 per GB yang dipindai dan $0.0007 per GB yang dikembalikan — sekitar sepersepuluh sen per kueri. Sebagai gantinya, instance menerima 600MB semalam alih-alih 140GB, pekerjaan selesai dalam beberapa menit, dan kotak bisa turun ukuran."

"Itu $450 sebulan," kata analis itu, setelah melakukan perhitungan instance — perkiraan kasar dari tarif per jam instance dan jam yang dihabiskannya bekerja keras.

"Itulah mengapa saya di sini," kata Tom. Angka sebenarnya akan ternyata lebih rendah — ketika Tom kemudian menarik pengeluaran komputasi aktual yang dapat diatribusikan ke pekerjaan malam, jumlahnya $202/bulan, bukan $450. Perhitungan kasar menemukan masalahnya; pengukuran mengukurnya.

Tom mengangkatnya dengan Leo dulu, sebelum membawa tim analitik ke percakapan. Dia tahu Leo akan menentang, dan dia ingin memahami penentangan itu sebelum menjadi debat tingkat-ruangan.

"S3 Select akan menghemat $180/bulan pada kueri pipeline analitik," kata Tom.

"Itu memerlukan penulisan ulang setiap kueri," kata Leo.

"Itu memerlukan mengubah pola akses data dari 'unduh dan filter' menjadi 'kueri via S3 Select API.'"

"Yang merupakan penulisan ulang."

"Itu perubahan dalam panggilan library klien," kata Tom. "Logika kueri — ekspresi pemfilteran — tetap sama. Yang berubah adalah di mana pemfilteran terjadi. Saat ini: EC2. Dengan S3 Select: S3."

"Saya sudah membaca dokumen S3 Select," kata Leo. "Anda tidak bisa melakukan join. Anda tidak bisa melakukan agregasi yang lebih kompleks dari SUM dan COUNT dasar. Beberapa kueri analitik kita lebih canggih dari itu."

"Saya tahu," kata Tom. "Itulah mengapa saya tidak mengusulkan S3 Select untuk semua kueri. Saya mengusulkannya untuk kueri ringkasan harian spesifik restoran. Itu berkas Parquet 500MB yang difilter berdasarkan restaurant_id, menarik dua kolom. Kueri itu murni filter-dan-proyeksi. S3 Select persis alat yang tepat untuk kasus itu."

Leo terdiam sejenak. Dia membuka kueri yang dimaksud.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"Versi S3 Select-nya akan menjadi apa — panggilan select_object_content?"

"Ya," kata Tom. "Anda akan mengganti panggilan read_parquet dengan panggilan select_object_content yang mendorong klausa WHERE ke S3. Hasilnya kembali sudah difilter. Anda mendapat aliran rekaman yang cocok alih-alih seluruh berkas Parquet."

"Dan saya harus menangani responsnya secara berbeda."

"Format responsnya CSV secara default. Anda akan butuh wrapper kecil untuk mem-parse-nya kembali menjadi DataFrame, atau Anda menggunakan format output Parquet jika ingin mempertahankan logika parsing saat ini."

Leo melihatnya. "Berapa banyak kerja itu?"

"Setengah hari," kata Tom. "Mungkin sehari jika Anda ingin mengujinya secara menyeluruh di seluruh 287 ID restoran dalam batch malam."

"Untuk $180/bulan."

"$2.160 per tahun," kata Tom. "Dan pendekatannya berskala. Pada 2.000 restoran, kueri yang sama pada ukuran berkas yang sama berbiaya bahkan lebih tanpa S3 Select. Anda menginvestasikan satu hari hari ini untuk menghindari masalah yang jauh lebih besar nanti."

Leo menutup notebook. "Kueri di mana S3 Select tidak berfungsi — kueri agregasi, perbandingan lintas-restoran — itu tetap apa adanya?"

"Itu tetap apa adanya," Tom mengonfirmasi. "Saya tidak mencoba menulis ulang pipeline analitik. Saya mencoba berhenti mengunduh 500 MB untuk menggunakan 2 MB darinya."

"Oke," kata Leo. "Saya akan melakukannya minggu ini."

Dia melakukannya. Implementasi butuh enam jam. Dia membungkus panggilan S3 Select dalam fungsi utilitas yang cocok dengan antarmuka yang sama dengan panggilan read_parquet yang ada — kode pemanggil dalam batch malam tidak butuh perubahan sama sekali. Hanya lapisan akses data yang berubah.

Bulan berikutnya, tagihan komputasi malam pipeline analitik turun dari $202 menjadi $22 — pekerjaan selesai dalam beberapa menit alih-alih jam, pada instance yang lebih kecil. Penghematan $180/bulan telah menelan biaya enam jam waktu teknik. Disetahunkan, itu pengembalian 1.800% atas investasi waktu.

"Bagian yang saya tolak," kata Leo, dalam tinjauan bulanan, "adalah penulisan ulangnya. Ternyata itu penggantian fungsi, bukan penulisan ulang. Saya sedang menyelesaikan masalah yang dibayangkan."

"Itu layak dicatat," kata Tom. "Ketika Anda mengevaluasi apakah akan mengimplementasikan optimasi, jadilah spesifik tentang apa pekerjaan itu sebenarnya. 'Memerlukan penulisan ulang kueri' adalah versi yang dibayangkan. 'Memerlukan mengubah fungsi akses data' adalah versi yang nyata."


**"Biaya yang Disengaja vs Tidak Disengaja"**

Di akhir analisis jaringan tiga minggu, Tom membawa rincian lengkap kembali ke tim. Dia punya kolom baru di spreadsheet-nya: "Disengaja?" dengan ya atau tidak untuk setiap item baris.

"Itu kerangka yang saya gunakan sekarang," katanya. "Bukan hanya 'berapa biayanya' tetapi 'apakah kita memutuskan untuk mengeluarkan ini?'"

"Apa biaya yang disengaja?" tanya Maya.

"Replikasi Aurora Global Database. Kita memutuskan untuk mereplikasi ke us-east-1 karena kita punya mitra restoran di Pantai Timur. Itu $120/bulan dalam replikasi lintas-region — kira-kira dua kali lipat perkiraan kasar dari hari-hari perencanaan DR. Kita memilih biaya itu untuk alasan spesifik."

"Dan tidak disengaja?"

"Pipeline analitik Leo yang menulis ke us-east-1 selama lima bulan setelah pengujian berakhir. Tidak ada yang memilih itu. Itu terjadi karena tidak ada yang mengawasi."

"Dan biaya NAT Gateway untuk panggilan layanan AWS?"

"Di antaranya," kata Tom. "Kita tidak secara eksplisit memutuskan untuk merutekan SSM melalui NAT Gateway — itu default. Kita tidak tahu ada opsi yang lebih murah. Apakah itu disengaja? Kita membuat pilihan, kita hanya tidak tahu apa yang kita pilih."

"Itu kategori paling berbahaya," kata Priya. "Keputusan yang tidak Anda tahu Anda buat."

"Itulah mengapa analisis VPC Flow Logs penting," kata Tom. "Itu membuat yang tak terlihat menjadi terlihat. Setiap byte yang melintasi batas sekarang punya kisah yang bisa kita lacak."

"Sudahkah kita memikirkan apa yang terjadi jika kita membiarkan ini melayang lagi?" tanya Priya. "Kita telah melakukan analisis satu kali. Dalam enam bulan, Leo akan membuat bucket uji lain di suatu tempat."

"Saya akan ada di sini," kata Leo. "Saya akan melakukannya di eu-west-1 lain kali jadi setidaknya berbiaya lebih per GB dan kalian menyadarinya lebih cepat."

"Tinjauan VPC Flow Log bulanan," kata Tom. "Saya akan menambahkannya ke tinjauan biaya kuartalan. Jika kita melihat alur lintas-region baru atau lonjakan NAT Gateway, kita melacaknya sebelum tagihan berikutnya."

**Variasi: Trade-Off yang Anda Terima**

Jika Anda menghilangkan lalu lintas lintas-AZ dengan menjalankan semuanya di satu Availability Zone, Anda menghemat kira-kira $31/bulan pada volume Nimbus saat ini — tetapi Anda kehilangan redundansi Multi-AZ yang bernilai jauh lebih dari itu dalam risiko insiden. Percakapan biaya yang matang tidak selalu tentang menemukan penghematan; terkadang itu tentang memahami persis apa yang Anda bayar dan memutuskan itu sepadan.

Biaya lintas-AZ adalah harga ketahanan. Beberapa biaya jaringan adalah komitmen arsitektur, bukan inefisiensi.

Koneksi SAA-C03: ujian sering menyajikan skenario di mana "optimasi biaya" akan menghilangkan redundansi. Jawaban yang benar biasanya adalah mempertahankan redundansi dan mengoptimalkan di tempat lain — ketahui perbedaan antara pemborosan dan biaya keandalan.

**CloudFront: Diskon Transfer Data**

Berikut fakta yang berlawanan dengan intuisi: menyajikan data melalui CloudFront umumnya lebih murah daripada menyajikannya langsung dari EC2 atau S3.

**EC2 langsung ke internet**: $0.09/GB
**CloudFront ke internet**: $0.085/GB (sedikit lebih murah)

Tetapi penghematan sebenarnya bukan tarif per-GB — tetapi bahwa CloudFront menyimpan data di lokasi edge. Jika 1.000 pengguna meminta foto menu yang sama:

- **Tanpa CloudFront**: 1.000 permintaan keluar dari S3 langsung ke internet × ukuran foto × $0.09/GB
- **Dengan CloudFront**: klien mendapat foto dari edge pada tarif CloudFront ($0.085/GB), dan pengisian cache — CloudFront mengambil dari S3 pada 1 miss — **gratis** (AWS membebaskan transfer origin-ke-CloudFront; Anda hanya membayar permintaan GET origin)

Untuk Nimbus dengan tingkat cache hit 83% (dari Bab 13), 83% permintaan tidak pernah menyentuh origin sama sekali — lebih sedikit permintaan origin, lebih sedikit beban origin, dan setiap byte ditagihkan pada tarif edge alih-alih tarif internet S3.

"CloudFront bukan hanya CDN untuk kinerja," kata Tom. "Ini juga optimasi biaya untuk transfer data."

Leo tampak berpikir. "Kita harus memindahkan semua pengiriman konten statis melalui CloudFront, bahkan untuk aset yang tidak sensitif terhadap latensi."

"Benar. Jika pengguna mengunduhnya dari AWS, itu harus melalui CloudFront."

**Optimasi Jaringan Lengkap**

Setelah tiga minggu analisis dan implementasi:

| Item Biaya                                  | Sebelum   | Sesudah    | Penghematan Bulanan |
|--------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoints)          | $289     | $211     | $78            |
| Optimasi CloudFront (pindahkan lebih banyak aset) | $214     | $147     | $67            |
| Lalu lintas lintas-AZ (diterima apa adanya)          | $178     | $178     | $0             |
| Lalu lintas lintas-region (bucket uji Leo)   | $166     | $160     | $6             |
| **Total**                                  | **$847** | **$696** | **$151/bulan** |

$151/bulan, $1.812/tahun dalam penghematan jaringan. Sederhana dibandingkan komputasi dan penyimpanan, tetapi bermakna.

Lebih penting lagi: Tom sekarang memahami setiap baris dari tagihan jaringan. Dia bisa menjelaskan setiap biaya dan telah secara sadar memutuskan mana yang dioptimalkan dan mana yang diterima. Perbedaan antara biaya yang disengaja dan tidak disengaja kini eksplisit dan terdokumentasi.

## Kekuatan dan Batasan

**Biaya NAT Gateway**:

- Volume data besar melalui NAT Gateway menumpuk dengan cepat
- VPC Endpoints menghilangkan beberapa biaya NAT sepenuhnya
- Tinjau layanan mana yang dipanggil instance privat Anda dan apakah endpoint tersedia

**CloudFront untuk biaya**:

- Tingkat cache hit secara langsung menentukan penghematan biaya
- Tingkat cache hit tinggi = lebih sedikit permintaan origin dan lebih sedikit beban origin, ditambah lebih banyak byte ditagihkan pada tarif sisi-viewer CloudFront yang lebih murah (transfer origin-ke-CloudFront dari origin AWS tidak dikenakan biaya sama sekali)
- Pindahkan semua pengiriman aset statis melalui CloudFront

**Trade-off lintas-AZ**:

- Menghilangkan lalu lintas lintas-AZ biasanya memerlukan perubahan arsitektur yang berbiaya lebih dari penghematannya
- Hitung dengan cermat sebelum mengoptimalkan

**S3 Select** (legacy — tidak tersedia untuk pelanggan baru sejak 2024; gunakan Athena sebagai gantinya. S3 Object Lambda juga legacy sekarang — ditutup untuk pelanggan baru per November 2025, beban kerja yang ada tidak terpengaruh):

- Prinsipnya berlaku: filter di lapisan penyimpanan alih-alih mengunduh objek S3 besar — penghematan muncul dalam waktu komputasi, ukuran instance, dan durasi pekerjaan (transfer S3 region-yang-sama sudah gratis)
- Tidak membantu ketika Anda butuh seluruh berkas

## Ringkasan

Tom menutup analisis jaringan dengan angka di papan tulis dan pemahaman yang lebih jelas tentang apa ketidakpastian terakhir pada tagihan itu sebenarnya. $847/bulan dalam biaya jaringan bukanlah misteri ketidakcakapan — itu biaya yang diharapkan dari sistem terdistribusi yang membentang di availability zone, melayani pengguna global, dan mereplikasi data di seluruh region. Sebagian besarnya layak dibayar. Sebagian tidak. Kemajuan kuncinya adalah mampu membedakan mana yang mana.

- AWS mengenakan biaya untuk **data keluar** (internet: ~$0.09/GB), **lalu lintas lintas-AZ** ($0.01/GB setiap arah), **lalu lintas lintas-region** ($0.02-0.08/GB), dan **pemrosesan NAT Gateway** ($0.045/GB).
- **Data masuk** gratis. **Lalu lintas same-AZ** gratis.
- **VPC Flow Logs** mengungkap alur lalu lintas spesifik mana di dalam VPC Anda yang menghasilkan setiap kategori biaya — penting untuk optimasi yang tertarget. Alur yang tidak pernah melintasi antarmuka jaringan VPC (seperti CloudFront mengambil dari origin S3) butuh instrumen mereka sendiri: log standar CloudFront atau log akses server S3.
- **VPC Gateway Endpoints** (S3, DynamoDB): Gratis. Menghilangkan biaya NAT Gateway untuk layanan ini.
- **VPC Interface Endpoints**: Dihargai per jam ditambah per GB. Lebih murah daripada NAT Gateway untuk layanan volume tinggi.
- **CloudFront** menyajikan data pada tarif lebih rendah daripada EC2-ke-internet langsung dan secara dramatis mengurangi volume transfer origin melalui caching.
- Pertanyaan kritisnya bukan hanya "berapa banyak" tetapi "apakah biaya ini disengaja?" Biaya yang tidak disengaja — pipeline uji yang terlupakan, routing default melalui NAT — adalah tempat penghematan sebenarnya bersembunyi.

## Tips Ujian

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.4)*

- **NAT Gateway vs VPC Endpoints**: Skenario ujian: "EC2 di subnet privat sering memanggil S3/DynamoDB — bagaimana mengurangi biaya NAT Gateway?" → VPC Gateway Endpoints (gratis untuk S3 dan DynamoDB).
- **Aturan harga transfer data**:
  - Ke dalam AWS: gratis
  - Same-AZ: gratis
  - Lintas-AZ: dikenakan biaya
  - Lintas-region: dikenakan biaya (tarif lebih tinggi)
  - Internet: dikenakan biaya (tarif signifikan)
- **CloudFront sebagai optimasi biaya**: "Kurangi biaya transfer data untuk pengiriman konten global" → CloudFront. Lapisan cache mengurangi permintaan origin.
- **S3 Transfer Acceleration**: Mempercepat unggahan *ke* S3 menggunakan lokasi edge CloudFront. Biaya lebih tinggi daripada S3 standar. Gunakan untuk pelanggan yang mengunggah berkas besar dari lokasi yang jauh secara geografis.
- **Biaya replikasi lintas-region**: Mereplikasi data di seluruh region menimbulkan biaya transfer data. Untuk S3 CRR, Anda membayar baik tarif transfer data keluar maupun biaya permintaan S3.
- **PrivateLink (VPC Interface Endpoints)**: Menyediakan konektivitas privat ke layanan AWS dan ke layanan yang di-host oleh pelanggan AWS lain. Lebih aman daripada melewati NAT, sering lebih murah untuk layanan volume tinggi. Titik impas vs pemrosesan NAT Gateway kira-kira 420GB/bulan (menghitung biaya per jam per-AZ endpoint itu sendiri, dan mengasumsikan NAT Gateway tetap untuk lalu lintas lain).

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara VPC Gateway Endpoint dan VPC Interface Endpoint. Untuk layanan AWS mana masing-masing tersedia, dan berapa biaya masing-masing?

*(Petunjuk: Gateway Endpoints gratis tetapi hanya untuk S3 dan DynamoDB. Interface Endpoints berbiaya per jam tetapi berfungsi untuk sebagian besar layanan AWS lainnya.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Aplikasi sebuah perusahaan berjalan pada instance EC2 di subnet privat. Instance membuat panggilan API yang sering ke Amazon SQS dan Amazon S3. Saat ini, semua lalu lintas keluar melalui NAT Gateway. Tim ingin mengurangi biaya NAT Gateway. Keamanan data harus dipertahankan — tidak ada lalu lintas yang boleh melintasi internet publik.

Pendekatan mana yang PALING memenuhi persyaratan ini dengan biaya berkelanjutan minimum?

A) Buat Gateway Endpoint untuk SQS dan Gateway Endpoint untuk S3  
B) Buat Interface Endpoints untuk SQS dan S3  
C) Buat Interface Endpoint untuk SQS dan Gateway Endpoint untuk S3  
D) Hapus NAT Gateway dan gunakan internet gateway langsung untuk panggilan API

**Petunjuk 1**: Gateway Endpoints hanya tersedia untuk S3 dan DynamoDB.

**Petunjuk 2**: Interface Endpoints tersedia untuk SQS dan banyak layanan lainnya (tetapi berbiaya).

**Petunjuk 3**: Internet Gateway di route table subnet privat akan menjadikannya subnet publik — melanggar persyaratan keamanan.

**Jawaban**: C

**Penjelasan**: S3 menggunakan Gateway Endpoint (gratis). SQS memerlukan Interface Endpoint (berbiaya). Kombinasi ini menghilangkan biaya pemrosesan data NAT Gateway untuk kedua layanan. Semua lalu lintas tetap dalam jaringan privat AWS — tidak ada perlintasan internet publik.

**Mengapa bukan A?** Gateway Endpoints tidak tersedia untuk SQS. Hanya S3 dan DynamoDB yang punya Gateway Endpoints.

**Mengapa bukan B?** Meskipun ini berfungsi, menggunakan Interface Endpoint untuk S3 (alih-alih Gateway Endpoint gratis) menimbulkan biaya per jam yang tidak perlu. Selalu gunakan Gateway Endpoint gratis untuk S3 dan DynamoDB.

**Mengapa bukan D?** Menambahkan rute ke Internet Gateway dari subnet privat menjadikannya subnet publik. Instance EC2 di subnet privat biasanya tidak punya Elastic IP, jadi mereka tidak benar-benar bisa merutekan melalui Internet Gateway tanpa perubahan tambahan — dan melakukannya akan mengeksposnya ke lalu lintas internet masuk.

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Pengguna Pantai Timur Nimbus menghasilkan lalu lintas signifikan. Aplikasi melayani mereka dari us-west-2 (Oregon). Saat ini:

- Respons API berjalan langsung dari instance EC2 us-west-2 ke pengguna Pantai Timur (~80ms, $0.09/GB)
- Foto menu berasal dari S3 us-west-2 melalui CloudFront edge di Boston (~8ms setelah caching)

Tim sedang mempertimbangkan menambahkan region aplikasi kedua di us-east-1 (Virginia Utara) untuk pengguna Pantai Timur untuk mengurangi latensi API.

Analisis biaya transfer data dari perubahan ini. Biaya transfer data lintas-region baru apa yang akan ditimbulkan pengaturan dual-region? Apakah Route 53 latency-based routing akan mengurangi atau menambah total biaya transfer? Dalam kondisi apa (volume lalu lintas, sensitivitas latensi) pengaturan dual-region akan menguntungkan?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih analisis biaya-manfaat multi-region.)*

## Adegan Pasca-Kredit

Tom menutup analisis jaringan.

Total dampak proyek optimasi tiga bulan:

- EC2 Savings Plans: -$14.200/tahun
- Kebijakan siklus hidup S3: -$7.800/tahun
- Penyimpanan (S3 + EBS): -$6.200/tahun
- Tingkat database: -$5.892/tahun
- Jaringan: -$1.812/tahun
- **Total: -$35.904/tahun**

Dia menulisnya di papan tulis di ruang rapat.

Leo menatapnya. "Tiga puluh lima ribu."

"Dan recehnya," kata Tom.

"Per tahun."

"Per tahun."

Priya melakukan perhitungan. "Itu $2.992 per bulan yang kita keluarkan untuk hal-hal yang tidak menciptakan nilai."

"Tidak semuanya," koreksi Tom. "Sebagian adalah hal-hal yang kita dapatkan nilainya, tetapi membayar terlalu mahal. Savings Plans — kita mendapat kapasitas EC2 yang persis sama, hanya dengan harga yang lebih baik."

Maya berdiri di depan papan tulis untuk waktu yang lama.

"Ketika kita memulai Nimbus," katanya, "setiap dolar penting. Kita nyaris tidak mampu membeli instance EC2 pertama."

"Ya," kata Tom.

"Dan di suatu tempat sepanjang jalan, kita berhenti mengawasi dolar dengan secermat itu."

"Pertumbuhan melakukan itu," kata Priya. "Fokus bergeser ke membangun, bukan mengoptimalkan."

"Keduanya penting," kata Maya. "Keduanya, selalu. Tambahkan ini ke wiki. Dan tetapkan tinjauan kuartalan untuk biaya."

Tom sudah membuka kalendernya.

Di beberapa bab berikutnya: kita mundur dari layanan individual dan mulai berpikir seperti arsitek.
