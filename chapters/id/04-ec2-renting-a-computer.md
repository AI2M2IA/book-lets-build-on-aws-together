# Bab 4: Komputer di Gedung Orang Lain

Grafik CPU telah menjadi musik latar.

Laptop Tom terbuka di sudut mejanya, CloudWatch menyegarkan setiap menit, garis utilisasi menanjak pada kemiringan yang berarti sesuatu sedang bekerja keras. Maya telah memperhatikannya tiga hari lalu dan tidak menyebutkannya kepada siapa pun. Ia malah mengawasi antrian pesanan.

IAM sudah terpasang. Kredensial sudah teratur. Priya sudah punya MFA di segalanya. Tim merasa, untuk pertama kalinya, seolah mereka sedikit bertanggung jawab. Tapi bertanggung jawab tidak memecahkan masalah yang sedang Maya awasi: angka-angka di dasbor pesanan menanjak sementara garis CPU menanjak bersama mereka.

Aplikasi Nimbus berjalan di instance yang diluncurkan Leo tanpa memikirkannya — yang ia "deploy di suatu tempat" dulu sebelum ada yang tahu apa itu Region.

Itu baik-baik saja untuk menunjukkan demo kepada investor. Itu tidak baik-baik saja ketika Maya menekan "luncurkan" dan dua ratus pendaftaran masuk di minggu pertama — empat puluh tujuh restoran aktif menerima pesanan setiap hari. Instance improvisasi Leo sekarang menangani pesanan nyata, menu nyata, dan pelanggan nyata — mesin yang dipilih secara tidak sengaja, diukur secara default, dikonfigurasi oleh orang yang sedang belajar AWS saat ia mengetik.

"Kita butuh server," kata Maya. "Yang sungguhan. Yang benar-benar dipilih seseorang dengan sengaja."

Tom melihat grafik CPU. Garisnya terlihat dari seberang ruangan.

Saat itulah mereka mulai melihat apa sebenarnya artinya menyewa komputer.

**Abstraksi yang Tidak Dijelaskan Siapa Pun**

Ketika orang mengatakan aplikasi mereka "berjalan di cloud," mereka biasanya berarti ia berjalan di
mesin virtual — komputer yang secara fisik tidak ada sebagai perangkat keras khusus,
tetapi yang berperilaku dalam segala hal seperti memang ada.

Inilah mekanismenya.

Server fisik di pusat data AWS punya banyak sumber daya: inti CPU, memori, disk,
dan bandwidth jaringan. AWS mengambil server fisik itu dan membaginya menggunakan perangkat lunak
yang disebut **hypervisor** — perangkat lunak yang bertindak seperti pengawas gedung, membagi
sumber daya server fisik di antara banyak penyewa virtual. Hypervisor menciptakan
banyak mesin virtual, masing-masing tampak punya CPU, memori, dan disk khususnya sendiri — tetapi
sebenarnya berbagi perangkat keras fisik yang mendasarinya.

Bayangkan seperti menyewa apartemen di gedung besar, alih-alih membeli rumah.

Pemilik gedung (AWS) memelihara struktur fisik — pipa, listrik,
keamanan. Anda mendapat satu unit. Anda menata perabotnya sesuka Anda. Anda membayar bulanan (atau
per jam). Ketika Anda butuh lebih banyak ruang, Anda pindah ke unit yang lebih besar. Ketika Anda pindah keluar, Anda
berhenti membayar.

Setiap penyewaan mesin virtual itu adalah apa yang disebut AWS sebagai **instance EC2** — Elastic
Compute Cloud.

EC2 adalah singkatan dari Elastic Compute Cloud. Bagian "elastic" itu penting, dan kita akan
sampai ke sana. Untuk sekarang: instance EC2 adalah komputer yang Anda sewa per jam. Ia punya sistem
operasi, koneksi jaringan, dan daya komputasi. Ia menjalankan aplikasi Anda persis seperti
server fisik akan melakukannya.

**Memilih Instance Anda: Ukuran Penting**

Tidak semua instance EC2 sama. AWS menawarkan ratusan tipe instance, diorganisasi
ke dalam keluarga berdasarkan untuk apa mereka dioptimalkan.

**General purpose** (mis., `t3`, `m6i`): CPU dan memori seimbang. Pilihan default yang baik
untuk sebagian besar aplikasi web. Keluarga `t3` bersifat burstable — ia mengakumulasi kredit CPU
selama periode utilisasi rendah dan membelanjakannya selama lonjakan. Bagus untuk lingkungan
pengembangan dan beban kerja dengan permintaan CPU yang bervariasi. Keluarga `m6i` menyediakan
performa yang konsisten dan non-burstable — lebih baik untuk beban kerja produksi dengan kebutuhan CPU yang berkelanjutan.

**Compute optimized** (mis., `c7g`): Lebih banyak CPU relatif terhadap memori. Bagus untuk video
encoding, pemodelan ilmiah, batch processing. Akhiran "g" di `c7g` berarti
instance menggunakan prosesor AWS Graviton — chip berbasis ARM yang dirancang AWS sendiri,
menawarkan harga-terhadap-performa yang lebih baik untuk banyak beban kerja daripada instance x86 yang setara.

**Memory optimized** (mis., `r7i`): Lebih banyak memori relatif terhadap CPU. Bagus untuk basis data,
caching, analitik in-memory. Jika Anda menjalankan basis data di mana performa membaik
secara dramatis dengan menyimpan lebih banyak data di RAM, keluarga R adalah titik awal yang tepat.

**Storage optimized** (mis., `i3`): Penyimpanan lokal berkecepatan tinggi. Bagus untuk beban kerja
intensif data yang butuh I/O disk sangat cepat. Penyimpanan NVMe lokal pada instance ini
secara signifikan lebih cepat daripada EBS — tetapi juga bersifat sementara. Gunakan untuk data sementara,
bukan untuk apa pun yang tidak mampu Anda hilangkan.

**Accelerated computing** (mis., `p4`): GPU terlampir. Bagus untuk pelatihan machine learning
dan rendering grafis. Instance ini mahal — sebuah `p3.8xlarge` berharga
lebih dari $12 per jam — tetapi untuk beban kerja yang diuntungkan dari paralelisme GPU, tidak ada
penggantinya.

Setiap keluarga punya ukuran. Sebuah `t3.micro` punya 2 CPU virtual dan 1 GB memori. Sebuah
`t3.xlarge` punya 4 CPU virtual dan 16 GB. Sebuah `t3.2xlarge` melipatgandakan lagi. Pola
penamaannya konsisten: akhirannya berjalan `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, dan seterusnya.

Leo telah memilih `t3.micro`.

"Berapa banyak pengguna yang bisa ditangani `t3.micro`?" tanya Tom. "Dan berapa lebih mahalnya yang lebih besar?"

"Tergantung pada aplikasinya," kata Leo. "Tapi mungkin tidak seratus pengguna bersamaan
yang menjalankan unggahan gambar dan kueri basis data."

"Berapa biayanya per bulan?" tanya Tom, melihat halaman perbandingan tipe instance.

Leo membuka halaman harga AWS. T3.micro berharga sekitar $8 per bulan. T3.small adalah $17. T3.medium adalah $33. T3.large sekitar $60. Selisihnya melebar cepat saat Anda naik — tidak secara linear, tetapi kira-kira melipatganda dengan setiap langkah ukuran. Tom menuliskan angka-angkanya, mencatat bahwa setiap langkah ukuran melipatgandakan memori — tetapi, anehnya, bukan jumlah CPU. Setiap t3 dari micro hingga large punya 2 vCPU yang sama; jumlahnya tidak meningkat sampai xlarge. Setiap langkah melipatgandakan memori; **baseline kredit CPU** — bagian dari vCPU itu yang bisa digunakan instance secara terus-menerus tanpa membakar kredit lonjakannya — tumbuh juga, meski tidak di setiap langkah.

Tom menulis "t3.micro" di papan tulis dan menggambar wajah sedih di sebelahnya.

**Percakapan Right-Sizing**

T3.micro bertahan sekitar sebulan sebelum lalu lintas malam Jumat menghancurkannya. Leo meng-upgrade dengan tergesa-gesa — langsung ke t3.large, dengan alasan terlalu besar lebih aman daripada terlalu kecil. Dua minggu setelah pindah ke t3.large, Tom menandai sesuatu.

"CPU-nya 9%," katanya. "Rata-rata. Selama tujuh hari terakhir."

Leo melihat grafik CloudWatch. CPU rata-rata 9%. Puncak mungkin 35% selama makan malam Jumat. Sisa waktunya: hampir tidak bergerak.

"Kita menjalankan server $60-sebulan," kata Tom, "pada 9% kapasitasnya."

"Tapi bagaimana dengan puncak Jumat?" kata Leo. "Kita butuh ruang lebih."

"Puncak Jumat mencapai 35%," kata Tom. "T3.small punya dua vCPU yang sama — yang lebih kecil adalah baseline kreditnya, sekitar 20% berkelanjutan. Kita rata-rata 9%. Itu berarti kita akan menabung kredit CPU sepanjang hari, setiap hari, dan membelanjakan sebagiannya untuk beberapa jam di malam Jumat. Saya memeriksa matematika `CPUCreditBalance` — saldonya tidak pernah mendekati kosong. Itu $17 sebulan. Kita punya ruang lebih."

Leo melihat angka-angkanya. Ia melihat grafik. Ia merasakan ketidaknyamanan seorang insinyur yang telah over-provisioning dan tahu itu.

"Tapi bagaimana jika kita dapat lonjakan?" katanya.

"Maka metrik akan memberi tahu kita sebelum itu menyakitkan," kata Priya. "Dan akhirnya kita akan menyiapkan Auto Scaling — itu secara harfiah untuk apa ia ada. Anda tidak perlu menyediakan untuk lonjakan secara manual begitu sistem bisa menambahkan instance secara otomatis."

Mereka memperkecil ke t3.small. Tagihan bulanan turun $40. Selama setahun, itu $480 — bukan tidak ada artinya, terutama untuk startup. Tom mencatatnya di spreadsheet-nya dengan kepuasan tenang seseorang yang telah menunggu untuk membuat poin ini selama dua minggu.

Pola ini punya nama: **right-sizing**. Itu berarti mencocokkan ukuran instance dengan beban kerja yang sebenarnya, bukan kasus terburuk yang dibayangkan. Alat AWS seperti AWS Compute Optimizer dan metrik CloudWatch membuat right-sizing menjadi keputusan berbasis data alih-alih tebakan.

**AMI: Keadaan Awal Mesin Anda**

Sebelum Anda meluncurkan instance EC2, Anda memilih sistem operasi dan konfigurasi
awalnya. Di AWS, ini disebut **Amazon Machine Image** (AMI).

Sebuah AMI adalah template. Ia mendefinisikan:

- Sistem operasi (Amazon Linux, Ubuntu, Windows Server, dll.)
- Perangkat lunak yang sudah terpasang
- Keadaan disk awal

Ketika Anda meluncurkan instance dari AMI, AWS membuat salinan baru template itu
khusus untuk Anda. Anda juga bisa membuat AMI Anda sendiri — jika Anda mengonfigurasi server persis
seperti yang Anda inginkan, Anda bisa "menyimpan" keadaan itu sebagai AMI kustom dan menggunakannya untuk meluncurkan
server identik dengan cepat. Inilah bagaimana Anda men-deploy lingkungan yang konsisten dalam skala besar.

Bayangkan AMI sebagai resep. Resep mendeskripsikan hidangan. Setiap kali Anda mengikuti
resep, Anda mendapatkan hidangan yang sama. Jika Anda ingin mengubah hidangan secara permanen, Anda memperbarui
resepnya.

AWS menyediakan marketplace AMI — beberapa dipelihara AWS (Amazon Linux 2, Amazon
Linux 2023), beberapa dipelihara oleh distribusi Linux besar (Ubuntu, Red Hat, SUSE),
dan beberapa berasal dari vendor pihak ketiga (server basis data yang sudah dikonfigurasi, perangkat
keamanan, perangkat lunak komersial). Untuk sebagian besar aplikasi web, AMI Amazon Linux yang
dipelihara AWS atau AMI Ubuntu LTS adalah titik awal yang tepat.

Untuk Nimbus, Leo membangun AMI kustom yang dimulai dari basis Amazon Linux 2023 terbaru
dan menambahkan runtime Node.js, dependensi sistem aplikasi, dan file
layanan yang sudah dibuat untuk proses aplikasi. Instance baru yang diluncurkan dari AMI ini mulai
melayani lalu lintas dalam kurang dari 90 detik — secara signifikan lebih cepat daripada waktu boot
empat menit ketika menggunakan skrip UserData untuk memasang semuanya dari awal.

Ada kompromi: AMI kustom perlu dipelihara. Setiap kali Anda memperbarui dependensi
sistem atau versi runtime, Anda perlu membangun ulang AMI. Tim yang membiarkan
AMI mereka basi mendapati diri mereka menjalankan instance dengan perangkat lunak usang — risiko
keamanan. Priya memasukkan "bangun ulang AMI dengan paket terbaru" ke daftar periksa teknik bulanan.

"Berapa biaya untuk menyimpan AMI?" tanya Tom.

AMI disimpan sebagai snapshot EBS — Anda membayar tarif snapshot EBS (kira-kira $0,05
per GB per bulan) untuk ukuran AMI. AMI Amazon Linux khas dengan stack aplikasi Nimbus
berukuran sekitar 4 GB. Pada $0,05/GB: $0,20 per bulan per AMI. Menyimpan lima
AMI historis untuk tujuan rollback: $1/bulan. Bukan biaya yang berarti.

**UserData: Skrip Bootstrap**

Ada satu opsi konfigurasi lagi pada EC2 yang ditemukan Leo ketika ia mencoba menghindari membangun AMI baru setiap kali kode aplikasi berubah.

Ketika Anda meluncurkan instance EC2, Anda bisa menyediakan **skrip UserData** — skrip shell yang berjalan secara otomatis ketika instance mulai untuk pertama kalinya. Ia berjalan sebagai root, sebelum instance dianggap "siap."

Untuk Nimbus, skrip UserData-nya terlihat seperti ini:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Skrip itu memasang Node.js, menarik kode aplikasi terbaru, memasang dependensi, dan memulai layanan aplikasi. Setiap instance baru yang diluncurkan dari AMI basis menjalankan skrip ini dan muncul dengan versi aplikasi saat ini terpasang — secara otomatis.

Pendekatan ini berarti AMI tetap sederhana (hanya OS basis), dan UserData menangani penyiapan aplikasi. Kompromi-nya: skrip UserData butuh waktu untuk berjalan. Sebuah instance mungkin butuh tiga hingga lima menit untuk boot dan menjadi siap. Untuk aplikasi di mana waktu startup penting — untuk Auto Scaling, di mana Anda perlu instance baru siap dengan cepat — memanggang aplikasi terlebih dahulu ke AMI kustom mengurangi waktu boot secara signifikan.

"Akan baik-baik saja," kata Leo, ketika Priya bertanya tentang waktu boot.

"Berapa waktu boot-nya?" tanyanya.

"Empat menit."

"Dan selama empat menit itu, instance berjalan tetapi tidak melayani lalu lintas?"

"Ya."

"Jadi selama lonjakan lalu lintas mendadak, kita bisa punya empat menit di mana instance baru belum membantu?"

Leo melihat skrip UserData-nya. Ia mulai melihat cara membangun AMI kustom.

**Key Pair: Cara yang Benar untuk Mengakses Server**

Ingat bencana "Admin123" dari bab lalu?

Cara yang benar untuk masuk ke instance EC2 adalah dengan **key pair**.

Sebuah key pair adalah pasangan kriptografis: public key (disimpan oleh AWS di server) dan
private key (file yang Anda unduh dan jaga rahasia). Untuk masuk, Anda menggunakan SSH — protokol
yang aman — dengan private key Anda. Tidak ada kata sandi. Jika Anda kehilangan private key,
Anda kehilangan akses. Tidak ada "lupa kata sandi saya" untuk SSH.

Ini penting karena key pair:

- Unik untuk Anda
- Mustahil ditebak secara kriptografis
- Tidak disimpan oleh AWS (Anda menyimpan private key)
- Mudah dicabut (hapus key dari server, hasilkan pasangan baru)

Priya telah menyiapkan akses berbasis key pada server Nimbus. Server Admin123
dinonaktifkan. Tidak ada yang sedih tentangnya.

"Dan bagaimana jika seseorang mencoba masuk paksa dan mencegat key pair dalam transit?" tanya Priya. Ia telah memecahkan jawabannya: private key tidak pernah berjalan melalui jaringan. Anda mengunduhnya sekali. Anda menyimpannya secara lokal. Ia tidak pernah meninggalkan mesin Anda.

**Apa yang Terjadi Jika Anda Kehilangan Key Pair**

Leo mengajukan pertanyaan ini di minggu ketiga, dengan energi spesifik seseorang yang belum kehilangan key pair-nya tetapi sedang memikirkannya.

"Jika saya kehilangan file private key, apa yang terjadi?"

"Anda kehilangan akses SSH ke instance," kata Priya.

"Permanen?"

"Tidak selalu. Tapi proses pemulihannya tidak menyenangkan."

Proses pemulihan: hentikan instance, lepaskan volume EBS root-nya, lampirkan ke instance berbeda yang *memang* Anda punya aksesnya, mount volume, tambahkan public key baru ke file `authorized_keys` pada volume yang di-mount, lepaskan dan lampirkan kembali ke instance asli, mulai ulang.

Ini berhasil. Butuh tiga puluh hingga enam puluh menit dan membutuhkan eksekusi yang hati-hati. Satu langkah salah dan Anda bisa membuat keadaan lebih buruk.

Alternatifnya, jika aplikasi Anda tidak menyimpan apa pun yang kritis di volume root (karena Anda telah mengikuti saran dalam buku ini dan menyimpan data di S3 dan EBS): terminate instance dan luncurkan yang baru dari AMI. Hasilkan key pair baru ketika Anda melakukannya.

"Simpan private key di suatu tempat yang aman," kata Priya. "Dan tidak pernah di instance EC2."

Leo melihat folder desktop-nya berlabel `AWS_keys`. Lalu ke Priya. Lalu ia memindahkan folder itu ke pengelola kata sandi terenkripsinya.

**Security Group: Firewall Instance Anda**

Ketika instance EC2 diluncurkan, ia butuh **security group** — firewall virtual yang mengontrol lalu lintas jaringan mana yang bisa mencapainya dan lalu lintas mana yang bisa ia kirim keluar.

Sebuah security group punya dua set aturan: **inbound** (lalu lintas masuk) dan **outbound** (lalu lintas keluar).

Secara default, security group baru memblokir semua lalu lintas inbound dan mengizinkan semua lalu lintas outbound. Anda menambahkan aturan inbound untuk membuka port spesifik ke sumber spesifik.

Untuk server web Nimbus, Priya mengonfigurasi:

- Izinkan TCP port 443 (HTTPS) dari `0.0.0.0/0` (seluruh internet)
- Izinkan TCP port 80 (HTTP) dari `0.0.0.0/0` (dialihkan ke 443 di aplikasi)
- Izinkan TCP port 22 (SSH) hanya dari alamat IP kantor — bukan dari internet

"Tunggu — tapi *mengapa* kita membatasi SSH hanya ke IP kantor?" tanya Maya.

"Karena jika SSH terbuka ke seluruh internet," kata Priya, "bot otomatis akan menghantam port 22 mencoba kombinasi kredensial dua puluh empat jam sehari. Log kita akan penuh dengan upaya yang gagal. Dan jika pernah ada kerentanan di daemon SSH itu sendiri, setiap penyerang di dunia bisa mencoba mengeksploitasinya."

"Tapi bagaimana jika Leo perlu masuk dari rumah?"

"VPN," kata Priya.

Leo sudah punya VPN yang disiapkan. Ia punya ekspresi seseorang yang pernah ditanyai pertanyaan ini sebelumnya.

Basis data masih berada di mesin yang sama dengan aplikasi — tetapi Priya menyiapkan security group terpisah untuk hari ketika tidak lagi: port basis data terbuka hanya untuk lalu lintas dari security group server web — bukan dari internet, bukan dari SSH (untuk akses DB langsung), bukan dari mana pun lainnya. Sementara itu, ia memastikan security group instance bersama tidak mengekspos port basis data ke internet sama sekali. Basis data akan tidak terlihat oleh segala hal kecuali aplikasi yang membutuhkannya.

Untuk mencapai basis data secara langsung, penyerang perlu menyusupi server web terlebih dahulu. Itu adalah lapisan pertahanan pertama.

"Dan lapisan kedua?" tanya Tom.

"Autentikasi IAM untuk basis data. Dan enkripsi dalam transit."

Ia menambahkan keduanya ke daftar periksa penyiapan.

**Metadata Instance EC2 dan IMDSv2**

Ada satu bagian lagi dari keamanan EC2 yang penting dalam praktik, meskipun jarang dijelaskan dalam konten pengantar.

Ketika aplikasi berjalan di instance EC2, ia bisa mengkueri endpoint internal khusus di `http://169.254.169.254/latest/meta-data/` untuk mengambil informasi tentang instance: instance ID-nya, Region-nya, availability zone-nya, dan — yang krusial — kredensial IAM sementara yang terkait dengan IAM Role apa pun yang terlampir.

Inilah bagaimana aplikasi di instance EC2 memanggil layanan AWS tanpa punya kredensial yang di-hardcode. Ia bertanya ke layanan metadata: "Kredensial apa yang harus saya gunakan sekarang?" Layanan metadata mengembalikan kredensial sementara yang kedaluwarsa dan berotasi secara otomatis.

Masalah keamanannya: versi lama dari layanan metadata ini (IMDSv1) akan merespons permintaan apa pun dari proses apa pun di instance. Jika aplikasi punya kerentanan server-side request forgery (SSRF) — bug di mana penyerang bisa membuat server mengambil URL pilihan penyerang — penyerang bisa menggunakan kerentanan itu untuk mengambil `http://169.254.169.254/latest/meta-data/iam/security-credentials/` dan mengambil kredensial IAM instance.

Serangan ini telah digunakan dalam pelanggaran nyata.

**IMDSv2** (Instance Metadata Service versi 2) memperbaiki ini dengan mensyaratkan token sesi sebelum layanan metadata merespons. Token diperoleh melalui permintaan PUT. Serangan SSRF, yang biasanya menggunakan permintaan GET, tidak bisa menyelesaikan langkah PUT — jadi mereka tidak bisa mendapatkan token, dan metadata tidak dikembalikan.

"Haruskah kita mengaktifkan IMDSv2?" tanya Leo.

"Itu default untuk instance baru sekarang," kata Priya. "Tapi untuk instance yang ada, Anda harus opt in."

Ia mengaktifkannya di semua instance Nimbus yang ada sore itu.

**Siklus Hidup Instance: Tidak Selamanya**

Ini sesuatu yang banyak pemula lewatkan.

Instance EC2 tidak permanen secara default. Ketika Anda menghentikan instance, sumber daya
komputasi dilepaskan. Ketika Anda memulainya lagi, ia mungkin berjalan di perangkat keras
fisik yang berbeda. Data apa pun yang disimpan *di instance itu sendiri* (di volume root-nya) bertahan
dari siklus stop/start — tetapi alamat IP publik berubah.

Ketika Anda *terminate* instance, ia hilang. Kecuali Anda punya penyimpanan terpisah yang terlampir
(yang kita bahas di Bab 6), data apa pun di instance menghilang.

Empat keadaan yang bisa dialami instance EC2:

**Pending**: Instance sedang memulai. Ia telah dialokasikan perangkat keras tetapi belum
selesai boot.

**Running**: Instance aktif dan dapat diakses. Anda membayar untuknya. Pada boot pertama, inilah saat skrip UserData juga dijalankan.

**Stopping/Stopped**: Instance dimatikan. Volume root EBS dipertahankan.
Anda tidak membayar untuk komputasi, tetapi Anda masih membayar untuk penyimpanan EBS yang terlampir.

**Shutting-down/Terminated**: Instance sedang dihapus. Kecuali Anda telah mengonfigurasi
volume EBS untuk bertahan, datanya hilang.

"Sifat sementara" ini sebenarnya adalah fitur, bukan bug. Itu berarti Anda bisa menyalakan
server, menggunakannya, dan membuangnya. Itu memungkinkan penskalaan horizontal. Tapi juga
berarti Anda tidak boleh pernah menyimpan data penting *di* instance EC2 itu sendiri.

Lalu di mana data berada?

Di penyimpanan terpisah. Kita sampai ke sana di dua bab berikutnya.

Anda mungkin bertanya-tanya: jika instance mendapatkan alamat IP baru setiap kali ia mulai ulang, bagaimana aplikasi Anda menjaga alamat yang stabil? AWS punya solusi yang disebut Elastic IP — IP publik statis yang Anda miliki dan yang tetap sama bahkan setelah mulai ulang. Catatan tentang biaya: sejak Februari 2024, AWS mengenakan biaya per jam yang kecil untuk setiap alamat IPv4 publik — Elastic IP (terlampir atau tidak) dan IP publik yang ditetapkan otomatis pada instance sama-sama. IPv4 publik tidak lagi gratis, yang merupakan satu alasan lagi untuk menjaga instance di subnet privat di belakang load balancer.

Untuk aplikasi di belakang load balancer — yang merupakan arsitektur yang benar untuk
aplikasi web produksi mana pun — Anda tidak butuh Elastic IP sama sekali. Pengguna terhubung ke
nama DNS load balancer yang stabil. Load balancer terhubung ke instance dengan alamat
IP privat mereka di dalam VPC. Instance bisa datang dan pergi, mendapat IP baru, scale
in dan out — load balancer menangani semuanya secara transparan. Elastic IP adalah untuk
kasus penggunaan spesifik: server yang dihubungi klien secara langsung melalui IP, bastion host
dengan alamat stabil, aplikasi yang tidak di belakang load balancer karena suatu
alasan spesifik.

Leo awalnya berencana menggunakan Elastic IP untuk server web Nimbus. Priya menunjukkan
bahwa dengan load balancer, alamat IP server web tidak relevan bagi
klien eksternal. Load balancer punya nama DNS yang stabil. Instance di belakangnya
bersifat sekali pakai berdasarkan desain.

"Jadi Elastic IP untuk pengecualian, bukan aturan," kata Leo.

"Benar," kata Priya. "Dan jika Anda mendapati diri Anda meraihnya, tanyakan apakah
arsitekturnya seharusnya punya load balancer saja."

**Apa Arti "Elastic"**

Kita mengatakan EC2 adalah singkatan dari Elastic Compute Cloud. Apa yang elastic tentangnya?

Dua hal:

**Elastisitas vertikal**: Anda bisa mengubah ukuran instance. Hentikan instance,
ubah dari `t3.micro` ke `t3.xlarge`, mulai ulang. Lebih banyak CPU dan memori, aplikasi
yang sama, penyiapan yang sama.

**Elastisitas horizontal**: Anda bisa menambahkan lebih banyak instance. Alih-alih satu server besar,
jalankan sepuluh server medium di belakang load balancer. Ketika lalu lintas turun, hapus instance
dan berhenti membayar untuknya.

Kedua pendekatan memecahkan masalah "satu server, terlalu banyak lalu lintas." Mereka punya kompromi
yang berbeda, yang kita jelajahi di Bab 7 ketika kita menambahkan Auto Scaling ke cerita.

Wawasan kunci: dengan EC2, daya komputasi adalah sesuatu yang Anda *putar* alih-alih sesuatu yang
Anda *beli*. Butuh lebih? Putar naik. Butuh kurang? Putar turun. Bayar sesuai itu.

Maya melihat tabel tipe instance. "Jika kita bisa membuat servernya lebih besar saja, mengapa repot dengan sepuluh medium?"

"Karena," kata Leo, "satu server besar tetap satu server. Jika ia mati, semuanya mati. Sepuluh server medium berarti satu bisa gagal dan sembilan tetap berjalan."

"Dan," tambah Priya, "Anda tidak bisa membuat server lebih besar tanpa mulai ulang. Sepuluh yang kecil berarti Anda bisa menambah lebih banyak tanpa menyentuh yang sedang berjalan."

Tom sudah menulis "mulai ulang = downtime" di buku catatannya.

## Kekuatan dan Keterbatasan

**Mengapa EC2 itu kuat**:

- Kontrol penuh. Anda memilih OS, perangkat lunak, konfigurasi. Itu komputer Anda.
- Pengukuran fleksibel. Ratusan tipe instance di setiap kasus penggunaan.
- Tidak ada perangkat keras untuk dikelola. AWS menangani lapisan fisik.
- Penagihan per detik, dengan minimum 60 detik, untuk AMI Amazon Linux, Windows, dan Ubuntu. (Beberapa AMI Linux komersial, seperti RHEL dan SUSE, masih menagih per jam — periksa ketentuan penagihan AMI.) Anda menghentikan instance, Anda berhenti membayar.
- Bekerja dengan segalanya. EC2 adalah fondasi yang menjadi dasar sebagian besar layanan AWS lain.
- Beberapa model harga (On-Demand, Reserved, Spot) memungkinkan optimasi biaya yang signifikan
  untuk beban kerja yang dapat diprediksi atau fleksibel — dibahas secara rinci di Bab 27.

**Di mana menjadi rumit**:

- Anda bertanggung jawab untuk mem-patch dan memperbarui sistem operasi. (Model Tanggung Jawab
  Bersama — ini adalah bagian "di cloud" yang milik Anda.)
- Patching OS tidak opsional. Instance EC2 yang tidak di-patch adalah salah satu vektor
  serangan paling umum dalam pelanggaran cloud. AWS Systems Manager Patch Manager bisa mengotomasi
  ini — tetapi Anda harus mengonfigurasinya dan memantaunya.
- Mengelola EC2 dalam skala besar berarti mengelola keadaan instance, AMI, patch keamanan, dan
  siklus hidup di potensi ribuan mesin. Itu overhead operasional.
- EC2 bukan jawaban yang tepat untuk segalanya. Untuk kode berbasis-peristiwa yang berjalan
  jarang, Lambda (Bab 20) lebih murah dan lebih sederhana. Untuk beban kerja yang
  dikontainerkan, ECS dan EKS (Bab 21) menawarkan efisiensi sumber daya yang lebih baik.
- Instance yang tidak digunakan tetap memakan biaya. Jika Anda menghentikan instance, Anda berhenti membayar untuk
  komputasi — tetapi jika Anda punya penyimpanan terlampir, Anda tetap membayar untuk itu.

**Penilaian kapan-tidak-menggunakan-EC2**: EC2 memberi Anda kontrol maksimum — tetapi kontrol punya biaya operasional. Setiap instance EC2 yang Anda jalankan adalah sesuatu yang harus Anda patch, pantau, dan akhirnya ganti. Untuk aplikasi yang berjalan jarang (Lambda lebih murah), untuk aplikasi yang perlu scale horizontal ke puluhan atau ratusan instance (kontainer lebih efisien), atau untuk basis data dan beban kerja terkelola lainnya (RDS, ElastiCache), layanan yang dikelola sepenuhnya menghilangkan overhead operasional yang signifikan dengan premi biaya yang moderat. EC2 adalah pilihan yang tepat ketika Anda butuh kontrol yang ia berikan — bukan secara default.

Priya punya heuristik: "Jika kita akan senang dengan layanan terkelola yang melakukan apa yang kita butuhkan, gunakan layanan terkelola. Gunakan EC2 ketika opsi terkelola tidak ada atau tidak cocok."

Leo awalnya menentang ini. "Tapi EC2 memberi kita lebih banyak opsi."

"Opsi adalah overhead," kata Priya. "Kita tidak butuh setiap opsi. Kita butuh konfigurasi yang tepat, dipelihara dengan andal."

**Placement Group EC2: Mengontrol di Mana Instance Mendarat**

EC2 memberi Anda kontrol atas apa instance Anda itu — ukurannya, OS-nya, konfigurasinya. Ia juga memberi Anda kontrol terbatas atas *di mana* ia mendarat secara fisik, melalui fitur yang disebut **placement group**.

Secara default, AWS menyebarkan instance di perangkat keras fisik untuk memaksimalkan ketersediaan. Tapi untuk beban kerja tertentu, Anda ingin menimpa default itu — entah untuk membuat instance lebih dekat, atau untuk menjamin mereka tetap berjauhan.

Tiga tipe placement group:

**Cluster**: Mengemas instance berdekatan dalam satu Availability Zone, biasanya di rak fisik yang sama atau perangkat keras yang berdekatan. Hasilnya adalah latensi jaringan terendah dan throughput jaringan tertinggi antar instance dalam group — dengan throughput jaringan 10 Gbps atau lebih tinggi antar instance (jangan bingungkan ini dengan Enhanced Networking/ENA, yang merupakan fitur jaringan per-instance yang independen dari placement group). Ini adalah pilihan untuk HPC (komputasi performa tinggi), pekerjaan pelatihan ML skala besar, dan beban kerja paralel yang berpasangan erat di mana instance menghabiskan banyak waktu mengirim data satu sama lain. Kompromi-nya adalah ketersediaan: jika segmen perangkat keras yang mendasarinya gagal, semua instance dalam cluster bisa terpengaruh secara bersamaan.

**Partition**: Membagi instance di seluruh partisi logis, di mana setiap partisi berada di set perangkat kerasnya sendiri — rak terpisah, daya terpisah, switch jaringan terpisah. Instance dalam satu partisi berbagi perangkat keras satu sama lain, tetapi partisi tidak pernah berbagi perangkat keras dengan partisi lain. Desain ini membatasi radius ledakan kegagalan perangkat keras: rak yang mati memengaruhi satu partisi tetapi bukan yang lain. Placement group partition dibangun untuk beban kerja terdistribusi dan tereplikasi yang besar — Apache Hadoop, Apache Cassandra, Apache Kafka — di mana Anda ingin isolasi kesalahan yang cukup sehingga kegagalan tingkat-rak tidak melumpuhkan seluruh cluster Anda.

**Spread**: Menempatkan setiap instance di perangkat keras yang mendasari yang sepenuhnya terpisah. Isolasi maksimum antar instance. Jika Anda punya lima instance aplikasi kritis yang tidak boleh berbagi host fisik (karena satu kegagalan perangkat keras tidak boleh melumpuhkan lebih dari satu), Spread adalah jawabannya. Batasnya: **7 instance per Availability Zone per placement group**. Spread dirancang untuk sejumlah kecil instance kritis yang tidak bisa mentoleransi co-location, bukan untuk armada besar.

"Jadi Cluster untuk kecepatan, Spread untuk isolasi, dan Partition untuk sistem terdistribusi yang butuh keduanya, sebagian clustering dan sebagian isolasi?" tanya Maya.

"Cukup dekat," kata Priya. "Cluster: latensi rendah antar instance, satu risiko besar. Spread: isolasi maksimum, batas keras tujuh per AZ. Partition: isolasi terstruktur untuk sistem terdistribusi besar — Anda mengontrol partisi mana yang dimasuki setiap instance."

Untuk arsitektur Nimbus saat ini, tidak satu pun dari ini berlaku. Tapi mengetahui mereka ada berarti mengetahui kapan harus meraihnya — dan lebih langsung lagi, mengetahui apa yang sebenarnya ditanyakan pertanyaan ujian tentang "beban kerja HPC yang butuh latensi antar-node rendah."

## Ringkasan

Instance yang diluncurkan secara tidak sengaja tidak akan pernah menjadi server produksi. Memahami EC2 dengan benar tidak hanya memecahkan masalah kapasitas — ia memperkenalkan serangkaian konsep baru yang akan muncul di hampir setiap bab berikutnya. Tipe instance, AMI, key pair, security group, dan right-sizing bukanlah trivia EC2; mereka adalah kosakata yang menjadi dasar sisa buku. Pelajari mereka di sini dan segala hal lainnya menjadi lebih masuk akal.

- Sebuah **instance EC2** adalah mesin virtual yang Anda sewa di AWS. Tipe instance diorganisasi berdasarkan kasus penggunaan: general purpose, compute optimized, memory optimized, storage optimized. Pilih keluarga yang tepat dan right-size ke metrik beban kerja yang sebenarnya — bukan kasus terburuk yang dibayangkan.
- Sebuah **AMI** (Amazon Machine Image) adalah template untuk OS dan konfigurasi awal instance Anda. AMI kustom memungkinkan deployment yang konsisten dan dapat diulang.
- **Key pair** adalah cara yang aman untuk mengakses instance EC2. **Security group** adalah firewall instance Anda — batasi SSH ke IP yang dikenal dan kunci port basis data hanya ke security group aplikasi.
- **IMDSv2** harus diaktifkan di semua instance untuk melindungi dari pencurian kredensial berbasis SSRF dari layanan metadata instance.
- Instance EC2 tidak permanen secara default. Instance yang di-terminate kehilangan data lokalnya — simpan data penting di S3 atau EBS, bukan di disk instance.

## Tips Ujian

*Domain SAA-C03 3 — Tugas 3.2 (solusi komputasi berperforma tinggi)*

- **Tanggung Jawab Bersama untuk EC2**: Anda bertanggung jawab untuk mem-patch OS.
  AWS memelihara perangkat keras fisik dan hypervisor. Ini adalah perbedaan yang sering
  diuji.
- **Keluarga instance penting untuk pertanyaan skenario.** Jika skenario menyebutkan kebutuhan
  memori tinggi (cache in-memory, SAP HANA), jawabannya kemungkinan melibatkan instance
  memory-optimized. Jika menyebutkan batch processing atau HPC, compute-optimized.
- **Stopping ≠ Terminating.** Menghentikan instance mempertahankannya (Anda bisa mulai ulang).
  Terminate menghapusnya. Skenario ujian menguji apakah Anda tahu perbedaan ini.
- **IP publik berubah saat mulai ulang.** Jika aplikasi Anda butuh alamat IP yang stabil,
  gunakan **Elastic IP** — IP publik statis yang tetap terkait dengan akun Anda.
  Sejak Februari 2024, AWS menagih setiap alamat IPv4 publik per jam — Elastic IP
  (terlampir atau tidak) dan IP publik yang ditetapkan otomatis sama-sama.
- Model harga **On-Demand, Reserved, dan Spot** diuji secara berat di Domain 4.
  Kita membahasnya di Bab 27. Untuk sekarang, ketahui bahwa On-Demand berarti bayar per detik
  tanpa komitmen.
- **Security group bersifat stateful.** Jika Anda mengizinkan lalu lintas inbound di suatu port,
  lalu lintas balik secara otomatis diizinkan tanpa aturan outbound eksplisit. NACL
  (dibahas di Bab 15) bersifat stateless — mereka membutuhkan aturan inbound dan outbound.
- **Placement Group:** Cluster = latensi terendah antar instance (HPC, pelatihan ML — tetapi risiko titik-kegagalan-tunggal untuk group); Partition = sistem terdistribusi (Hadoop, Kafka, Cassandra) dengan isolasi kegagalan per partisi; Spread = isolasi instance maksimum, maks 7 per AZ. Pola pertanyaan ujian: "beban kerja HPC berpasangan erat butuh throughput jaringan maksimum antar node" → placement group Cluster.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa itu instance EC2? Apa itu AMI? Apa hubungan
antara keduanya?

*(Petunjuk: Pikirkan tentang analogi resep — apa resepnya, dan apa hidangannya?)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan sedang men-deploy aplikasi web berlalu lintas tinggi. Aplikasi
menangani pencarian katalog produk dengan logika pemfilteran kompleks yang intensif CPU.
Tim mengharapkan lonjakan lalu lintas signifikan selama acara penjualan. Mereka ingin memastikan
mereka memilih tipe instance EC2 yang tepat dan siap untuk lonjakan lalu lintas.

Kombinasi pilihan mana yang PALING BAIK memenuhi persyaratan mereka?

A) Instance memory-optimized dengan jumlah tetap untuk memastikan performa konsisten  
B) Instance compute-optimized dengan Auto Scaling untuk menangani lonjakan lalu lintas  
C) Instance general-purpose dengan satu ukuran instance besar  
D) Instance storage-optimized karena katalog produk membutuhkan akses disk cepat

**Petunjuk 1**: Beban kerja dideskripsikan sebagai "intensif CPU." Keluarga instance mana yang
dioptimalkan untuk CPU?

**Petunjuk 2**: Skenario menyebutkan "lonjakan lalu lintas selama acara penjualan." Jumlah instance
yang tetap tidak akan menangani lalu lintas variabel secara efisien. Fitur AWS apa yang menangani ini?

**Petunjuk 3**: Instance compute-optimized menangani pekerjaan berat-CPU. Auto Scaling menambah
dan menghapus instance berdasarkan permintaan. Bersama mereka menjawab kedua persyaratan.

**Jawaban**: B

**Penjelasan**: Instance compute-optimized (seperti keluarga `c`) menyediakan lebih banyak CPU
per dolar untuk beban kerja intensif CPU. Auto Scaling secara otomatis menyesuaikan jumlah
instance berdasarkan beban — menambahkan instance selama acara penjualan, menghapusnya ketika
lalu lintas kembali normal. Kombinasi ini mengoptimalkan baik performa maupun biaya.

**Mengapa bukan A?** Instance memory-optimized dirancang untuk beban kerja yang butuh jumlah RAM
besar (basis data, cache in-memory). Ini adalah beban kerja terikat-CPU. Dan jumlah
instance tetap berarti entah over-provisioning (pemborosan) atau under-provisioning (kegagalan).

**Mengapa bukan C?** Instance general-purpose menukar sebagian efisiensi CPU dengan keseimbangan. Untuk
beban kerja yang diketahui intensif CPU, compute-optimized lebih sesuai. Dan satu
instance besar adalah titik kegagalan tunggal.

**Mengapa bukan D?** Bottleneck-nya adalah CPU, bukan I/O disk. Instance storage-optimized
dirancang untuk beban kerja yang butuh throughput sangat tinggi ke penyimpanan lokal.

*Domain SAA-C03 3 — Tugas 3.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus saat ini menjalankan satu instance EC2 `t3.micro` untuk seluruh aplikasi.
Tim perlu memutuskan: upgrade ke instance yang lebih besar (`t3.2xlarge`) atau menambahkan lebih banyak
instance `t3.micro` di belakang load balancer?

Telusuri komprominya. Apa keunggulan masing-masing pendekatan? Pertanyaan apa
yang akan Anda ajukan untuk memutuskan? (Petunjuk: pikirkan tentang titik kegagalan tunggal,
biaya, kompleksitas deployment, dan apa yang terjadi selama pemeliharaan.)

*(Tidak ada satu jawaban yang benar. Ini tentang penalaran melalui penskalaan vertikal vs.
horizontal.)*

## Adegan Pasca-Kredit

Leo menghabiskan sore itu mengeksekusi perkecilan. Ia pindah dari `t3.large` ke `t3.small`,
menggunakan data right-sizing yang telah dikumpulkan Tom dari CloudWatch. CPU stabil di sekitar
12% selama beban normal. Halaman dimuat dalam kurang dari satu detik.

Tom mengawasi tagihan AWS diperbarui secara real time. T3.small masih berbiaya kira-kira dua kali lipat per jam dari micro asli — tetapi sepertiga dari t3.large yang telah mereka bayar lebih. Ia membuat catatan: *$40/bulan dihemat vs. t3.large sebelumnya. Keputusan yang benar.*

Maya sedang melihat sesuatu yang lain di layarnya.

"Leo," katanya. "Saat kamu mengubah ukuran instance, situs web mati selama
dua belas menit."

Leo mendongak.

"Kita punya antrian dua ratus pesanan yang belum terpenuhi."

Ia melihat layar. Lalu langit-langit. Lalu kembali ke layar.

"Kita butuh sesuatu untuk gambar kita," katanya, sedikit mengubah topik. "Saat ini,
foto menu yang diunggah disimpan langsung di server. Jika kita mengubah ukuran atau mulai ulang
instance, apakah kita kehilangannya?"

Priya sudah tahu jawabannya.

Di bab berikutnya: di mana file berada ketika tidak ada hard drive untuk ditunjuk.
