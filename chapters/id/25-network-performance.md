# Bab 25: Jalan Tol Privat

Berdirilah sejenak. Goyangkan tangan Anda.

Rasakan jarak antara ujung jari Anda dan sesuatu di sisi lain negeri ini. Bayangkan mengirim pesan yang harus menempuh jarak itu, menemukan jalannya melalui selusin serah-terima operator, dan kembali sebelum Anda bisa melanjutkan bekerja. Sekarang bayangkan melakukan itu ribuan kali per detik.

Itulah transfer data yang sebenarnya—jarak fisik, infrastruktur fisik, batasan fisik.

Kita akan membahas memindahkan data. Bukan antar-layanan di AWS, tetapi antara dunia nyata dan AWS—antara kantor Anda dan infrastruktur cloud Anda, antar-benua.

---

Dengan database yang sudah diskalakan dan biaya penyimpanan dikurangi, Tom telah beralih ke tagihan jaringan. Tetapi Leo punya masalah yang lebih mendesak—memindahkan 4 terabyte data pesanan historis ke AWS sedang mengungkap batas koneksi mereka saat ini.

---

Tim infrastruktur Nimbus (sekarang empat insinyur) bekerja dari kantor bersama di Seattle. Mereka membutuhkan akses ke infrastruktur AWS yang mereka kelola. Beberapa operasi membutuhkan koneksi ke resource di VPC.

Saat ini, mereka menggunakan VPN di laptop mereka untuk mengakses bastion host di subnet publik, lalu SSH ke resource dari sana.

Ini berfungsi. Ini lambat. Koneksi VPN merutekan melalui internet publik: Seattle → beberapa lompatan operator → us-west-2. Perjalanan bolak-balik tidak konsisten—30 hingga 80 milidetik tergantung jam—dan throughput dibatasi oleh uplink kantor dan jalur publik.

"Untuk SSH sehari-hari, itu dapat diterima," kata Leo. "Tetapi kita akan mulai memindahkan database analitik kita. 4 terabyte data pesanan historis. Melalui koneksi ini, migrasinya akan memakan berminggu-minggu."

"Kita butuh koneksi yang lebih baik," kata Maya.

"Koneksi privat," tambah Priya. "Bukan melalui internet publik. Dan bagaimana jika seseorang mencoba menerobos masuk selama transfer data? 4TB riwayat pesanan melalui internet publik—bahkan terenkripsi—terasa seperti target."

Pikirkan itu seperti perjalanan ke tempat kerja. Site-to-Site VPN seperti mengemudi di jalan umum: Anda mengunci pintu mobil Anda (enkripsi), tetapi Anda tetap berbagi jalur dengan semua orang, dan kemacetan memperlambat Anda secara tak terduga. Direct Connect seperti menyewa jalur privat khusus di jalan tol—tanpa lalu lintas bersama, kecepatan konsisten, dan tol bulanan yang lebih tinggi. Sebagian besar hari jalan umum baik-baik saja. Ketika Anda memindahkan truk penuh kargo berharga dengan jadwal ketat, Anda membayar untuk jalur privat.

Snow Family adalah opsi yang kebanyakan orang tidak pertimbangkan: mencarter penerbangan kargo sungguhan. Ia tidak selalu tersedia. Ia tidak tepat untuk muatan kecil. Tetapi untuk truk penuh, ia tiba lebih cepat daripada mengemudi dan sama sekali tidak bergantung pada kondisi jalan tol. Fisikanya tidak berubah—Anda tetap memindahkan bit yang sama—tetapi mekanismenya secara fundamental berbeda.

**AWS Site-to-Site VPN: Opsi Cepat**

**AWS Site-to-Site VPN** membuat terowongan terenkripsi antara jaringan on-premises Anda dan VPC Anda, melintasi internet publik.

Penyiapan:

1. Buat Virtual Private Gateway (VGW) yang terpasang ke VPC Anda
2. Buat Customer Gateway yang mewakili router on-premises Anda
3. Bangun dua terowongan VPN (untuk redundansi) di antara keduanya

Lalu lintas terenkripsi (AES-256). Ia menempuh internet publik, yang berarti latensi bergantung pada kondisi internet. AWS menyediakan dua terowongan secara otomatis untuk redundansi—jika satu terowongan bermasalah, lalu lintas beralih ke yang lain.

**Kapan menggunakan Site-to-Site VPN**:

- Penyiapan cepat (menit hingga jam)
- Hemat biaya ($0,05/jam per koneksi VPN)
- Bandwidth: hingga 1,25 Gbps per terowongan
- Latensi internet yang dapat diterima untuk kasus penggunaannya

**Accelerated Site-to-Site VPN** merutekan lalu lintas VPN melalui jaringan global AWS alih-alih internet publik—optimisasi yang sama yang disediakan Global Accelerator, diterapkan pada terowongan VPN. Latensi lebih rendah dan lebih konsisten daripada VPN standar. Biayanya sedikit lebih tinggi (biaya transfer data Global Accelerator berlaku). Untuk tim yang menginginkan penyiapan cepat VPN dan biaya lebih rendah tetapi membutuhkan latensi yang lebih baik, Accelerated VPN adalah jalan tengah praktis antara VPN standar dan Direct Connect.

Untuk migrasi 4TB Nimbus, VPN berbasis internet pada maksimum 1,25 Gbps akan memakan: 4TB / 1,25 Gbps ≈ 7 jam minimum, dengan overhead dunia nyata mendekati 12-20 jam. Dapat diterima, tetapi kemacetan pada jalur internet publik membuatnya tak terduga.

Leo menghitung lebih cermat, karena perhitungan teoretis dan waktu transfer aktual tidak pernah sekali pun cocok dalam pengalamannya.

**Teoretis**: 4 TB = 4.096 GB = 32.768 Gb. Pada 1 Gbps: 32.768 detik ≈ 9,1 jam. Bulatkan ke 9 jam.

**Aktual**: Leo telah menjalankan transfer uji minggu sebelumnya—50 GB dari kantor Seattle ke S3. Waktu teoretis pada kecepatan upstream terukur mereka (875 Mbps): 457 detik. Waktu aktual: 724 detik. Faktor overhead: 1,58.

Diterapkan pada transfer 4TB pada upstream 875 Mbps: 32.768 Gb / 0,875 Gbps × overhead 1,58 ≈ **59.200 detik ≈ 16,4 jam**.

Overhead berasal dari beberapa sumber: TCP slow-start pada pembentukan koneksi, packet loss yang membutuhkan transmisi ulang (jalur publik dari Seattle ke us-west-2 rata-rata 0,2% packet loss—kecil, tetapi multiplikatif atas jutaan paket), overhead handshake HTTPS untuk setiap segmen multipart upload, dan waktu pemrosesan bagi S3 untuk merakit multipart upload.

"Enam belas jam baik-baik saja untuk migrasi satu kali," kata Leo. "Masalah sebenarnya adalah jika transfer terputus pada jam ke-14."

Multipart upload S3 menyelesaikan masalah interupsi: jika transfer gagal pada jam ke-14, hanya bagian saat ini yang perlu diunggah ulang. Bagian sebelumnya disimpan di S3 dan transfer bisa dilanjutkan. Tetapi overhead mengelola multipart upload menambah kira-kira 3% ke total waktu transfer.

Estimasi dunia nyata akhir: **sekitar 9 jam teoretis melalui internet 1 Gbps, sekitar 17 jam aktual**—memperhitungkan kecepatan upstream terukur kantor mereka 875 Mbps, overhead packet loss, dan pemrosesan multipart upload.

Leo mempertimbangkan ini sejenak. Lalu ia melihat halaman harga Snow Family.

"Apa opsi yang lain?" tanya Tom.

"Tunggu—tapi *mengapa* kita membutuhkan apa pun lebih dari VPN?" tanya Maya. "Migrasi 4TB adalah kejadian satu kali."

"Bukan," kata Priya. "Setelah data ada di AWS, tim tetap perlu mengaksesnya setiap hari. Dan latensi VPN menumpuk."

**AWS Direct Connect: Saluran Khusus**

**AWS Direct Connect** membangun koneksi jaringan privat dan khusus antara lokasi Anda (atau fasilitas kolokasi Anda) dan AWS. Lalu lintas tidak pernah menyentuh internet publik.

Direct Connect adalah koneksi fisik—saluran fiber dari jaringan Anda ke lokasi AWS Direct Connect. Anda bekerja dengan penyedia telekomunikasi untuk membangun sirkuit fisik. AWS menyediakan port di sisi mereka.

**Manfaat**:

- Latensi konsisten dan dapat diprediksi (tanpa varians internet publik)
- Kecepatan dari 50 Mbps hingga 100 Gbps (dengan port khusus 400 Gbps native di lokasi tertentu sejak 2024)
- Biaya transfer data lebih rendah daripada internet (laju transfer data Direct Connect lebih murah daripada laju data transfer out AWS standar)
- Lebih aman (sirkuit privat, bukan internet publik)

**Trade-off**:

- Penyiapan memakan berminggu-minggu hingga berbulan-bulan (penyediaan infrastruktur fisik)
- Biaya jauh lebih tinggi daripada VPN
- Tanpa redundansi bawaan (Anda membangun sirkuit redundan sendiri)
- Tidak cocok untuk kantor yang tersebar secara geografis tanpa beberapa sirkuit

Anda mungkin bertanya-tanya: jika Direct Connect adalah kabel fiber fisik, apa yang terjadi jika seseorang tidak sengaja memotongnya? Itulah masalah titik-kegagalan-tunggal dengan sirkuit tunggal—itulah mengapa setup Direct Connect produksi menggunakan sirkuit redundan di jalur yang terpisah secara geografis, atau mempertahankan VPN sebagai cadangan. Kabel bisa dipotong; bisnis berlanjut.

"Berapa biayanya per bulan?" tanya Tom. Ia sudah mencarinya. "Port 1Gbps khusus adalah $216/bulan," katanya. "Ditambah sirkuit dari kantor kita, yang dikutip telekomunikasi sebesar $800/bulan."

"Jadi sekitar seribu sebulan total."

Untuk Nimbus: Direct Connect berlebihan untuk ukuran mereka saat ini. Tetapi untuk perusahaan dengan volume transfer data yang signifikan atau persyaratan kepatuhan untuk koneksi jaringan privat, Direct Connect membayar dirinya sendiri.

**Hosted Connection: Jalan Tengah**

Tidak setiap organisasi bisa berkomitmen pada sirkuit fiber khusus 100 Gbps. **Direct Connect Hosted Connection** memungkinkan AWS Direct Connect Partner (telekomunikasi yang disetujui) menyediakan koneksi sub-1Gbps yang Anda bagikan dengan pelanggan lain.

Penyiapan lebih cepat (hari hingga minggu, bukan bulan) dan berbiaya lebih sedikit daripada koneksi khusus. Trade-off-nya: kapasitas bersama berarti throughput yang kurang konsisten.

Untuk Nimbus (saat mereka tumbuh): koneksi hosted 500 Mbps melalui partner akan menyediakan konektivitas privat dengan titik harga yang masuk akal.

Perbedaan praktis yang penting saat ujian: Hosted Connection tersedia dalam kecepatan dari 50 Mbps hingga 10 Gbps (beberapa partner menawarkan hingga 25 Gbps), disediakan oleh AWS Partner. Dedicated Connection langsung ke AWS dan tersedia pada 1 Gbps, 10 Gbps, dan 100 Gbps (ditambah 400 Gbps di lokasi tertentu). Untuk kecepatan di bawah 1 Gbps, Hosted Connection adalah satu-satunya opsi Direct Connect—Dedicated Connection dimulai dari minimum 1 Gbps.

**AWS Transit Gateway: Hub-and-Spoke untuk VPC**

Saat Nimbus tumbuh, mereka akan mengakumulasi beberapa VPC: VPC produksi, VPC staging, VPC analitik, VPC perkakas keamanan.

Tanpa perencanaan yang cermat, menghubungkan VPC ini membutuhkan mesh penuh dari koneksi VPC peering. Untuk 4 VPC: 6 koneksi peering. Untuk 10 VPC: 45 koneksi peering. Untuk 20 VPC: 190 koneksi. Ini tidak menskala.

**AWS Transit Gateway** adalah hub jaringan yang menghubungkan beberapa VPC dan jaringan on-premises. Alih-alih mesh koneksi peering, setiap VPC terhubung ke Transit Gateway. Transit Gateway merutekan lalu lintas di antaranya.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Perutean transitif**: Jika VPC A dan VPC B keduanya terhubung ke Transit Gateway, mereka bisa berkomunikasi—tanpa peer langsung. Transit Gateway menangani peruteannya. Tidak seperti VPC peering (yang tidak transitif), Transit Gateway memungkinkan topologi hub-and-spoke.

**Biaya Transit Gateway**: ditagih per attachment (VPC atau koneksi VPN/Direct Connect) ditambah per GB data yang diproses. Pada skala besar, ini sepadan dengan kesederhanaannya.

Untuk Nimbus, kejadian pemicu untuk Transit Gateway adalah penambahan VPC keempat. Mereka punya: produksi, staging, analitik, dan sekarang perkakas keamanan (VPC untuk pemindaian kerentanan dan pemantauan kepatuhan SOC2 yang seharusnya tidak berada di segmen jaringan yang sama dengan produksi).

Tanpa Transit Gateway, menghubungkan empat VPC membutuhkan enam koneksi peering:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

Enam koneksi peering, enam entri route table per VPC, enam aturan security group untuk ditinjau. Dan VPC peering tidak transitif: jika Production dan Analytics ter-peer, dan Analytics dan Security ter-peer, Production tidak bisa mencapai Security melalui VPC Analytics. Anda membutuhkan peering Production ↔ Security secara eksplisit.

Dengan Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Empat attachment. Satu route table untuk dikelola. Perutean transitif: Production bisa mencapai Security melalui Transit Gateway tanpa peer langsung.

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui Transit Gateway?" tanya Priya. "Jika keempat VPC berbagi satu Transit Gateway, resource yang disusupi di VPC Staging bisa mencapai Production."

Transit Gateway mendukung **route table dengan isolasi**: Anda bisa mendefinisikan VPC mana yang diizinkan berkomunikasi melalui Transit Gateway dan mana yang terisolasi. VPC perkakas keamanan bisa mencapai semua yang lain (ia perlu memindai mereka). Staging tidak bisa mencapai Production. Production tidak bisa mencapai Analytics secara langsung (Analytics mengkueri data melalui endpoint read-only tertentu).

"Satu Transit Gateway," kata Priya, "dengan kebijakan perutean yang mengekspresikan model akses sebenarnya. Versus enam koneksi peering tanpa cara terpusat untuk mengaudit apa yang mencapai apa."

**VPC Endpoint: Akses Privat ke Layanan AWS**

Masalah biaya dan keamanan yang halus: ketika instance EC2 Anda (di subnet privat) memanggil API S3, lalu lintas itu merutekan melalui NAT Gateway (untuk mencapai internet, di mana endpoint publik S3 berada). Anda membayar pemrosesan NAT Gateway.

**VPC Endpoint** memungkinkan resource di VPC Anda berkomunikasi dengan layanan AWS secara privat, tanpa melalui internet publik—dan tanpa NAT Gateway.

Dua jenis:

**Gateway endpoint** (gratis): Untuk S3 dan DynamoDB. Anda menambahkan rute di route table Anda yang mengarahkan lalu lintas S3 atau DynamoDB ke endpoint alih-alih NAT Gateway. Gratis untuk dibuat; gratis untuk digunakan.

**Interface endpoint** (berbayar): Untuk layanan AWS lain (SQS, SNS, Secrets Manager, SSM, dll.). Membuat ENI (Elastic Network Interface) di subnet Anda dengan IP privat. Lalu lintas ke layanan menggunakan IP privat ini. Berbiaya ~$0,01/jam per AZ ditambah pemrosesan data.

Leo telah membuat Gateway endpoint minggu sebelumnya tanpa memperbarui route table. "Saya sudah men-deploy-nya—oh," katanya, memeriksa konfigurasi. "Rute-rutenya belum diperbarui. Biar saya perbaiki itu."

Tom langsung membuat Gateway endpoint untuk S3 dan DynamoDB setelah mengetahui mereka gratis. Biaya pemrosesan data NAT Gateway turun 65%.

Perhitungan mengapa: fungsi Lambda dan task ECS Nimbus di subnet privat membuat permintaan konstan ke S3 (membaca file konfigurasi, menulis ekspor log) dan ke DynamoDB (membaca data restoran, menulis record pesanan). Setiap permintaan merutekan melalui NAT Gateway, yang menagih $0,045 per GB data yang diproses.

Pemrosesan data NAT Gateway bulanan Nimbus: 533 GB. Biaya: $24/bulan. Setelah menambahkan Gateway Endpoint S3 dan DynamoDB dan memperbarui route table: lalu lintas S3 dan DynamoDB melewati NAT Gateway sepenuhnya. Pemrosesan NAT Gateway bulanan turun ke 187 GB—lalu lintas sisanya adalah panggilan API ke layanan lain (Secrets Manager, SES, webhook eksternal). Biaya: $8,40/bulan.

Penghematan: $15,60/bulan, $187/tahun, untuk dua konfigurasi Gateway Endpoint gratis yang memakan 10 menit untuk disiapkan.

"Gratis," kata Tom, untuk ketiga kalinya.

"Gateway endpoint gratis untuk dibuat dan gratis untuk digunakan," Leo memastikan. "Mereka bukan hanya peningkatan keamanan—merutekan lalu lintas S3 dan DynamoDB melalui endpoint privat alih-alih NAT Gateway menghapusnya dari internet publik sepenuhnya."

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui lalu lintas NAT Gateway?" tanya Priya. "Jika lalu lintas ke S3 melalui NAT, ia dapat dialamatkan dari internet. Via Gateway Endpoint, ia privat."

Inilah manfaat sekunder dari Gateway Endpoint yang kadang dibayangi oleh diskusi biaya. Lalu lintas ke S3 dan DynamoDB melalui VPC Gateway Endpoint tidak pernah meninggalkan jaringan AWS, tidak pernah melintasi alamat IP publik, dan diatur oleh kebijakan endpoint (kebijakan berbasis resource yang bisa membatasi bucket S3 atau tabel DynamoDB mana yang bisa diakses endpoint). Gateway Endpoint pada bucket yang menyimpan data pelanggan menambah lapisan ekstra: bahkan dengan kebijakan bucket yang salah dikonfigurasi, kebijakan endpoint bisa membatasi akses ke lalu lintas yang berasal dari dalam VPC tertentu.

**AWS Global Accelerator: Perutean di Edge**

Ketika Nimbus melayani pengguna Pantai Timur dari us-west-2 (Oregon), latensinya 80ms. Bukan karena server terlampau jauh, tetapi karena perutean internet publik antara Boston dan Oregon kurang optimal, memantul melalui beberapa jaringan operator.

**AWS Global Accelerator** menggunakan backbone global privat AWS—jaringan terdistribusi dari lokasi edge yang merutekan lalu lintas ke aplikasi Anda melalui jalur yang dikontrol AWS alih-alih lompatan operator internet publik. Alih-alih perutean internet publik, lalu lintas memasuki jaringan AWS di lokasi edge terdekat dan menempuh jalur privat yang dioptimalkan ke aplikasi Anda.

Untuk Nimbus, seorang pengguna di Boston akan:

- **Tanpa Global Accelerator**: Rutekan melalui operator internet publik → ~80ms
- **Dengan Global Accelerator**: Mengenai edge AWS terdekat di Boston → menempuh backbone AWS → mencapai us-west-2 → ~60ms

Global Accelerator tidak meng-cache konten (itu CloudFront). Ia mengoptimalkan jalur jaringan untuk permintaan dinamis.

Leo menjalankan perbandingan latensi di beberapa kota setelah mengaktifkan Global Accelerator untuk API Nimbus:

| Kota | Sebelum | Sesudah | Peningkatan |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

Peningkatan paling dramatis untuk pengguna yang jauh secara geografis—Tokyo dari 180ms ke 95ms, Sydney dari 210ms ke 118ms. Untuk Seattle (dekat dengan pusat data us-west-2 di Oregon), peningkatannya lebih kecil—ada lebih sedikit lompatan internet publik untuk dioptimalkan.

"Tunggu—tapi *mengapa* Tokyo mendapat peningkatan 47%?" tanya Maya. "Jika pusat data masih di us-west-2, bukankah kecepatan cahaya adalah batasan sebenarnya?"

"Kecepatan cahaya adalah lantainya," kata Leo. "Batasan sebenarnya adalah perutean internet publik. Lalu lintas dari Tokyo ke us-west-2 melintasi puluhan sistem otonom—operator berbeda, router berbeda, perjanjian peering berbeda. Setiap lompatan menambah latensi. Global Accelerator merutekan lalu lintas dari lokasi edge Tokyo ke us-west-2 melalui fiber privat AWS, yang memiliki jalur lebih pendek dan perutean yang lebih disetel."

Minimum teoretis dari Tokyo ke us-west-2 (berdasarkan kecepatan cahaya melalui fiber, kira-kira 15.500 km bolak-balik): ~77ms. 95ms dengan Global Accelerator mendekati minimum teoretis itu. 180ms tanpanya mencerminkan inefisiensi perutean internet publik, bukan hukum fisika.

Global Accelerator menyediakan dua **alamat IP anycast** statis yang merutekan ke lokasi edge terdekat. Tidak seperti CloudFront (yang menggunakan alamat IP dinamis yang berubah), IP ini stabil—berguna untuk allowlisting firewall dan untuk aplikasi yang membutuhkan IP tetap bagi klien untuk terhubung.

**Kapan menggunakan Global Accelerator vs CloudFront**:

- CloudFront: konten statis dan dapat di-cache, kasus penggunaan CDN
- Global Accelerator: konten dinamis, protokol non-HTTP (UDP, gaming, IoT), atau ketika Anda membutuhkan alamat IP Anycast statis

## Memindahkan Data, Bukan Sekadar Lalu Lintas: DataSync dan Transfer Family

Sementara arsitektur jaringan sedang terbentuk, Maya mendapat tiga proyek onboarding jaringan restoran baru yang mendarat secara bersamaan. Masing-masing memiliki persyaratan migrasi data—dan setiap persyaratan berbeda.

Jaringan pertama, Pacific Table, perlu memindahkan 40 TB file share NFS ke S3. Penyimpanan file mereka saat ini ada di on-premises, tersebar di empat file server di markas Seattle mereka. Leo mulai menulis rencana migrasi.

Jaringan kedua, Marisol Group, memiliki tim akuntansi yang mengunggah faktur setiap hari ke server SFTP lokal. Alur kerja SFTP telah berjalan sejak 2015. Staf akuntansi tahu satu hal: mereka membuka klien SFTP mereka setiap pagi pukul 9, menjatuhkan faktur mereka, dan menutupnya. Tak seorang pun ingin mengubah ini. "Akuntan mereka menggunakan WinSCP," kata Maya. "Itu tidak bisa dinegosiasikan."

"Itu dua alat yang berbeda," kata Priya.

"Ya," kata Leo. "Tetapi keduanya ada."

**AWS DataSync: rsync yang Diberi Steroid, Dengan Konsol AWS**

Untuk migrasi 40 TB Pacific Table, tantangannya bukan bandwidth—kantor Seattle memiliki koneksi upstream yang solid. Tantangannya adalah orkestrasi: menemukan file mana yang ada, mentransfernya dengan andal, memverifikasi checksum, menjadwalkan transfer untuk menghindari menjenuhkan jaringan kantor selama jam kerja, dan memantau kemajuan selama beberapa hari operasi berkelanjutan.

**AWS DataSync** adalah layanan migrasi dan replikasi data berbasis agen. Anda menginstal agen DataSync ringan di lingkungan on-premises Anda—mesin virtual yang berjalan di VMware atau sebagai instance EC2. Agen terhubung ke file server Anda melalui NFS atau SMB, menemukan share Anda, dan menyinkronkannya ke tujuan di AWS: bucket S3, filesystem EFS, atau filesystem FSx.

Anggap itu seperti rsync yang diberi steroid, dengan konsol AWS. DataSync menangani:

- **Penemuan**: agen menginventaris share sumber Anda secara otomatis
- **Penjadwalan**: transfer bisa berjalan pada jadwal yang ditentukan (di luar jam kerja) atau berkelanjutan
- **Verifikasi**: DataSync menghitung checksum di kedua ujung dan memperingatkan Anda tentang ketidakkonsistenan apa pun
- **Pemantauan**: kemajuan transfer, jumlah file, laporan kesalahan, dan utilisasi bandwidth semua terlihat di konsol
- **Enkripsi saat transit**: semua data dienkripsi menggunakan TLS selama transfer

Untuk Pacific Table, Leo menginstal agen DataSync di sebuah VM di jaringan Seattle mereka, mengarahkannya ke empat NFS share, dan mengonfigurasi jadwal transfer: 20:00 hingga 06:00 pada hari kerja, berkelanjutan di akhir pekan. Setelah enam hari, semua 40 TB telah mendarat di S3. Ia memverifikasi transfer dengan laporan checksum bawaan DataSync. Nol ketidaksesuaian.

"Dan untuk replikasi berkelanjutan?" tanya Maya. "Pacific Table akan tetap menambahkan file setelah migrasi."

"DataSync mendukung transfer inkremental," kata Leo. "Setelah sinkronisasi awal, ia hanya menyalin apa yang berubah. Kita bisa menjalankannya setiap malam sebagai pekerjaan replikasi."

**AWS Transfer Family: Alur Kerja SFTP Anda, Didukung oleh S3**

Untuk tim akuntansi Marisol Group, persyaratannya berbeda. Tak seorang pun beralih dari SFTP. Akuntan akan terus menggunakan WinSCP. Pertanyaannya adalah: di mana unggahan SFTP itu mendarat?

Saat ini, mereka mendarat di server Linux lokal di kantor belakang Marisol. File kemudian dipindahkan secara manual ke sistem akuntansi mereka. Server lokal membutuhkan pemeliharaan, backup, dan seseorang dengan akses SSH untuk mengelolanya.

**AWS Transfer Family** adalah server SFTP, FTPS, dan FTP yang sepenuhnya terkelola—didukung oleh S3 atau EFS sebagai tujuan penyimpanan. Anda menyediakan endpoint Transfer Family (ia mendapat hostname dan, secara opsional, alamat IP statis). Klien Anda terhubung ke sana menggunakan perangkat lunak SFTP yang sudah ada. Ketika mereka mengunggah file, file itu mendarat langsung di bucket S3.

Tim akuntansi tidak mengubah apa pun. Mereka tetap membuka WinSCP setiap pagi pukul 9. Mereka tetap terhubung ke server SFTP dengan kredensial mereka yang ada. Mereka tetap menjatuhkan faktur mereka di folder yang sama. Perbedaannya tak terlihat oleh mereka: di sisi server, file sekarang langsung masuk ke S3 alih-alih ke server Linux lokal.

"Dan dari S3, kita bisa memicu sisa alur kerja secara otomatis," kata Priya. "Kejadian S3 memicu fungsi Lambda yang memproses faktur dan memasukkannya ke sistem akuntansi. Tanpa langkah manual."

"Jadi alur kerja akuntan tidak berubah," kata Maya, "tetapi di sisi kita, seluruhnya otomatis."

"Ya. Dan server SFTP itu sendiri sepenuhnya terkelola—tanpa patching, tanpa backup, tanpa server untuk dipelihara."

Tom sudah mencari harganya. Transfer Family menagih per jam ketersediaan endpoint ditambah per GB yang ditransfer. Untuk volume faktur Marisol Group, biaya bulanannya jauh di bawah $30. Biaya memelihara server lokal yang digantikannya—depresiasi perangkat keras, waktu rekayasa untuk pemeliharaan, manajemen backup—jauh lebih besar.

---

> **Tips Ujian — DataSync dan Transfer Family**
>
> *SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.1)*
>
> - **DataSync** = memindahkan data secara massal dari on-premises ke AWS (file share NFS atau SMB → S3, EFS, atau FSx). Sinyal ujian: "migrasi file share," "replikasi data NFS ke S3," "transfer data on-premises ke AWS," "replikasi berkelanjutan data file." DataSync menggunakan agen yang diinstal on-premises; agen menangani penemuan, penjadwalan, dan verifikasi.
> - **Transfer Family** = transfer file berkelanjutan menggunakan protokol SFTP, FTPS, atau FTP, tanpa mengubah alat klien. Sinyal ujian: "alur kerja SFTP yang ada," "mitra mengunggah file via SFTP," "server SFTP didukung S3," "lift-and-shift SFTP," "tidak bisa mengubah proses transfer file." Transfer Family adalah jawabannya ketika persyaratannya adalah kompatibilitas SFTP, bukan volume data.
> - **Perbedaannya penting**: DataSync untuk migrasi massal dan replikasi (berbasis agen, digerakkan jadwal, dioptimalkan jaringan). Transfer Family untuk layanan transfer file yang kompatibel-protokol (berbasis endpoint, selalu menyala, transparan-klien). Mereka menyelesaikan masalah yang berbeda.
> - DataSync mendukung S3, EFS, dan FSx sebagai tujuan. Transfer Family mendukung S3 dan EFS sebagai backend penyimpanan.

---

**Memigrasikan Server, Bukan Sekadar File: 7 R dan MGN**

Jaringan ketiga dalam pipeline Maya tidak hanya memiliki file—ia memiliki seluruh server: aplikasi reservasi kustom yang berjalan di dua mesin on-premises yang tak seorang pun ingin menulis ulang sebelum pindah. Memindahkan *aplikasi* adalah disiplinnya sendiri, dan AWS menjelaskan **tujuh cara untuk bermigrasi** (the "7 Rs") yang sebagian besar perlu Anda kenali:

- **Rehost** ("lift and shift"): pindahkan server apa adanya. Tercepat, perubahan paling sedikit.
- **Replatform** ("lift, tinker, and shift"): peningkatan kecil dalam perjalanan—seperti memindahkan database yang dikelola sendiri ke RDS.
- **Repurchase**: buang sistem lama, beli SaaS sebagai gantinya.
- **Refactor**: rancang ulang cloud-native. Usaha terbesar, hasil terbesar.
- **Retire**: ternyata tak seorang pun menggunakannya. Hapus.
- **Retain**: biarkan di tempatnya, untuk sekarang.
- **Relocate**: pindahkan di tingkat hypervisor tanpa mengubah apa pun.

Untuk kasus rehost, alatnya adalah **AWS Application Migration Service (MGN)**: agen mereplikasi disk server sumber, blok demi blok, ke area staging berbiaya rendah di AWS; Anda meluncurkan salinan uji kapan pun Anda mau; pada cutover, MGN mengonversi server yang direplikasi menjadi instance EC2 native. Lift, shift, selesai—refactoring bisa datang nanti, pada waktu cloud. (Pendampingnya untuk perencanaan portofolio, Application Discovery Service dan Migration Hub, ditutup untuk pelanggan baru pada akhir 2025—kenali nama mereka sebagai "penemuan inventaris" dan "pelacakan migrasi terpusat" jika ujian menyebutnya.)

---

**AWS Snow Family: Opsi Fisik**

Masih ada masalah dataset historis 4TB dan estimasi internet 17 jam. Setelah menghitungnya, Leo telah melihat halaman harga Snow Family dan langsung mengambil keputusan.

Untuk migrasi di atas beberapa terabyte di mana waktu lebih penting daripada kesederhanaan, AWS mengirim alat penyimpanan fisik ke lokasi Anda. Anda mengisinya dengan data. Anda mengirimnya kembali. AWS meng-ingest data langsung ke S3.

**Snowball Edge Storage Optimized**: 80 TB kapasitas yang dapat digunakan, enklosur yang diperkuat. Mengirim ke lokasi Anda dalam 2-5 hari kerja. Anda memuat data menggunakan antarmuka lokal (NFS, antarmuka S3). Anda mengirimnya kembali. AWS meng-ingest data dalam kira-kira 1-3 hari kerja setelah penerimaan.

Untuk migrasi 4TB Nimbus, prosesnya:

1. **Pesan** Snowball Edge melalui konsol AWS (memakan 2 menit, dikirim dalam 3 hari)
2. **Hubungkan** alat ke jaringan kantor Seattle; ia muncul sebagai titik mount NFS
3. **Salin** 4TB data pesanan historis menggunakan antarmuka kompatibel-S3 perangkat: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Penyalinan selesai** dalam sekitar 2 jam (jaringan lokal, tanpa internet)
5. **Kirim** alat kembali ke AWS (label prabayar disertakan)
6. AWS **meng-ingest** data ke S3 dalam 72 jam setelah penerimaan
7. **Verifikasi** — S3 menyediakan laporan penyelesaian pekerjaan yang menunjukkan setiap file yang ditransfer dan checksum

Total waktu yang berlalu: 3 hari untuk pengiriman + 2 jam untuk menyalin + 1 hari pengiriman balik + 2 hari ingestion = kira-kira 7 hari kalender. Versus sekitar 17 jam berkelanjutan—yang akan membutuhkan koneksi internet yang stabil dan tak terganggu, menjenuhkan uplink kantor sepanjang malam dan sebagian besar hari kerja.

Biaya: sewa perangkat Snowball Edge adalah $300 untuk 10 hari. Pengiriman (dua arah): kira-kira $80. Transfer data masuk S3 gratis. Total biaya migrasi: **$380**.

Bandingkan dengan sekitar 17 jam penggunaan internet 875 Mbps berkelanjutan: terowongan VPN gratis ($0,05/jam tetapi terowongan sudah berjalan); transfer masuk S3 gratis. Jalur internet "gratis" memiliki biaya nyata dalam waktu rekayasa (memantau transfer 17 jam), risiko (interupsi apa pun yang membutuhkan restart), dan biaya peluang (koneksi internet mereka jenuh selama jendela transfer). Leo memesannya. Bagaimana itu berjalan ada di adegan pasca kredit bab ini.

---

## Kekuatan dan Keterbatasan

**Site-to-Site VPN**:

- Penyiapan cepat, biaya rendah
- Jalur internet publik berarti latensi bervariasi
- Langit-langit bandwidth terbatas (1,25 Gbps per terowongan)
- Opsi Accelerated VPN memperbaiki latensi dengan biaya sedikit lebih tinggi

**Direct Connect**:

- Konsisten, privat, bandwidth-tinggi
- Lambat untuk disiapkan, biaya berulang yang signifikan
- Sirkuit fisik adalah titik kegagalan tunggal (tambahkan redundansi atau pertahankan cadangan VPN)
- Titik impas dengan penghematan biaya egress pada kira-kira 10-15 TB/bulan tergantung skenario harga

**AWS Snow Family**:

- Untuk migrasi satu kali di atas 1-2 TB, seringkali lebih cepat dan lebih murah daripada transfer jaringan
- Tanpa konsumsi bandwidth internet selama migrasi
- Jendela sewa perangkat 10 hari; pengiriman prabayar

**Transit Gateway**:

- Menyederhanakan konektivitas multi-VPC secara dramatis
- Perutean transitif (tidak seperti VPC peering)
- Route table isolasi memungkinkan segmentasi tanpa koneksi peering terpisah
- Biaya menumpuk untuk banyak attachment

**VPC Endpoint**:

- Manfaat keamanan dan biaya untuk S3/DynamoDB (gateway endpoint gratis)
- Menghilangkan biaya NAT Gateway untuk lalu lintas layanan AWS
- Kebijakan endpoint menambah lapisan kontrol akses ekstra di luar IAM dan kebijakan bucket
- Interface endpoint untuk layanan lain (Secrets Manager, SSM, SES) menjaga lalu lintas privat tetapi berbiaya ~$0,01/jam per AZ

**Global Accelerator**:

- Memperbaiki latensi aplikasi dinamis untuk pengguna global: peningkatan 33-47% dalam praktik untuk pengguna yang jauh
- IP Anycast tetap (tidak seperti IP dinamis CloudFront)—berguna untuk allowlisting firewall
- Protokol non-HTTP (UDP, TCP)—CloudFront hanya HTTP/HTTPS
- Biaya tambahan ($0,025/jam per accelerator + transfer data)

## Ringkasan

Pekerjaan Aurora di bab 24 mengoptimalkan cara Nimbus menyajikan data ke aplikasinya sendiri. Bab ini tentang bagaimana data bergerak antara dunia luar dan AWS—dan bagaimana membuat pergerakan itu lebih andal, lebih cepat, dan lebih murah.

- **Site-to-Site VPN**: Terowongan terenkripsi melalui internet publik antara on-premises dan VPC. Penyiapan cepat, biaya lebih rendah, latensi bervariasi. Dua terowongan untuk redundansi. Maksimum 1,25 Gbps per terowongan.
- **Direct Connect**: Koneksi fiber privat dan khusus ke AWS. Latensi dapat diprediksi, bandwidth lebih tinggi, berminggu-minggu untuk disiapkan, biaya signifikan. Titik impas dengan penghematan egress VPN pada kira-kira 13,5 TB/bulan untuk skenario harga Nimbus.
- **AWS Snow Family**: Alat penyimpanan fisik untuk migrasi data massal. Lebih cepat daripada transfer internet untuk migrasi multi-TB. $380 total untuk migrasi 4TB Nimbus vs. sekitar 17 jam saturasi jaringan.
- **Transit Gateway**: Hub untuk konektivitas VPC dan on-premises. Memungkinkan perutean transitif (tidak seperti VPC peering). Mendukung route table isolasi untuk mengontrol VPC mana yang bisa mencapai mana. Menskala ke ratusan koneksi.
- **VPC Endpoint**: Akses privat ke layanan AWS tanpa NAT Gateway. Gateway endpoint (S3, DynamoDB) gratis—tambahkan ke setiap VPC yang mengakses S3 atau DynamoDB. Menghemat Nimbus $15,60/bulan dan menghapus lalu lintas S3/DynamoDB dari NAT Gateway.
- **Global Accelerator**: Merutekan lalu lintas dinamis melalui backbone privat AWS untuk latensi yang lebih rendah dan lebih konsisten secara global. IP Anycast statis. Peningkatan latensi 33-47% untuk pengguna yang jauh (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms). Bukan CDN—tidak meng-cache.
- **AWS DataSync**: Layanan berbasis agen untuk memigrasikan dan mereplikasi data file NFS/SMB on-premises ke S3, EFS, atau FSx. Menangani penjadwalan, verifikasi checksum, pemantauan. Digunakan untuk migrasi satu kali dan replikasi berkelanjutan file share.
- **AWS Transfer Family**: Server SFTP, FTPS, dan FTP terkelola yang didukung S3 atau EFS. Memungkinkan klien SFTP yang ada mengunggah file ke S3 tanpa mengubah alur kerja mereka.

## Tips Ujian

*SAA-C03 Domain: Design High-Performing Architectures (Domain 3, Task 3.4)*

- **Sinyal VPN vs Direct Connect**: VPN = "enkripsi lalu lintas ke VPC," "penyiapan cepat," "sensitif biaya." Direct Connect = "latensi rendah konsisten," "transfer data besar," "koneksi privat," "kepatuhan yang membutuhkan jaringan privat."
- **Transit Gateway vs VPC Peering**: Peering tidak transitif (A→B→C tidak mengizinkan A→C). Transit Gateway transitif. "Banyak VPC yang perlu berkomunikasi" → Transit Gateway.
- **VPC Gateway Endpoint**: Gratis. Hanya S3 dan DynamoDB. Perubahan route table. Tanpa biaya ekstra. Skenario ujian: "kurangi biaya transfer data untuk akses S3 dari subnet privat" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = konten dinamis, non-HTTP, IP statis, optimisasi jaringan. CloudFront = caching, konten HTTP, CDN.
- **Direct Connect + VPN**: Anda bisa menggunakan VPN sebagai cadangan untuk koneksi Direct Connect. Jika sirkuit Direct Connect gagal, lalu lintas failover ke VPN. Lebih mahal daripada VPN saja, lebih andal daripada Direct Connect saja.
- **Direct Connect Gateway**: Hubungkan sirkuit Direct Connect ke beberapa VPC di beberapa region atau akun. Tanpanya, sirkuit Direct Connect terhubung ke satu VGW di satu region.
- **AWS Snow Family**: "Migrasi data besar," "kecepatan transfer terlalu lambat," "migrasi skala-petabyte" → Snow Family. Snowball Edge = hingga 80TB. Lakukan perhitungan transfer terlebih dahulu: jika memindahkan data melalui jaringan yang tersedia akan memakan kira-kira seminggu atau lebih, jawabannya adalah perangkat fisik. *Pemeriksaan realita (2026)*: AWS telah mengarsipkan keluarganya—Snowmobile ditarik pada 2024, Snowcone dihentikan pada akhir 2024, dan per November 2025 perangkat Snow tidak lagi ditawarkan ke pelanggan baru (AWS sekarang menunjuk ke DataSync melalui saluran cepat dan ke **Data Transfer Terminals**, lokasi aman tempat Anda membawa drive Anda sendiri). Bank soal SAA-C03 mendahului semua ini, jadi pada ujian, "berminggu-minggu transfer jaringan, bandwidth terbatas" masih menunjuk ke Snowball.
- **Route table Transit Gateway**: Transit Gateway mendukung beberapa route table untuk segmentasi jaringan. Sinyal ujian: "isolasi VPC produksi dari staging" dengan konektivitas bersama melalui Transit Gateway → route table terpisah.
- **IP tetap Global Accelerator**: Tidak seperti CloudFront, Global Accelerator menyediakan dua IP Anycast statis. Sinyal ujian: "aplikasi membutuhkan alamat IP tetap bagi klien untuk di-allowlist" atau "lalu lintas UDP" → Global Accelerator (CloudFront hanya HTTP/HTTPS).
- **Sinyal AWS DataSync**: "migrasi file share NFS/SMB ke S3/EFS/FSx," "replikasi berkelanjutan data file on-premises," "migrasi file berbasis agen." DataSync bukan untuk transfer SFTP yang kompatibel-protokol—ia untuk migrasi dan replikasi file share massal.
- **Sinyal AWS Transfer Family**: "alur kerja SFTP yang ada," "mitra atau pelanggan mengunggah file via SFTP," "angkat server SFTP ke cloud tanpa mengubah alat klien," "SFTP/FTPS/FTP didukung S3." Transfer Family bukan alat migrasi data—ia adalah endpoint protokol terkelola. Perbedaannya: DataSync memindahkan data secara massal sesuai jadwal; Transfer Family menyediakan endpoint SFTP/FTP yang selalu menyala untuk unggahan file berkelanjutan.
- **MGN (Application Migration Service)**: "migrasikan ratusan VM dengan cepat, tanpa perubahan kode," "rehost / lift-and-shift server ke EC2" → MGN (replikasi tingkat-blok, peluncuran uji, cutover ke instance EC2 native). DataSync memindahkan *file*; DMS memindahkan *database*; MGN memindahkan *seluruh server*.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara AWS Site-to-Site VPN dan AWS Direct Connect. Dalam skenario apa Anda akan memilih masing-masing?

*(Petunjuk: Pikirkan waktu penyiapan, biaya, konsistensi latensi, dan persyaratan bandwidth.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan layanan keuangan membutuhkan koneksi jaringan privat, terenkripsi, dan khusus dari pusat data on-premises mereka ke AWS. Mereka mentransfer 500GB data keuangan sensitif setiap hari. Koneksi harus memiliki latensi yang konsisten dan dapat diprediksi serta tidak boleh melintasi internet publik. Mereka juga membutuhkan koneksi cadangan jika primer gagal.

Arsitektur mana yang PALING memenuhi persyaratan ini?

A) Site-to-Site VPN dengan perutean BGP dan VPN kedua untuk redundansi  
B) Direct Connect Hosted Connection dengan Direct Connect Gateway  
C) Dua koneksi Site-to-Site VPN melalui penyedia internet yang berbeda  
D) Koneksi Direct Connect dengan Site-to-Site VPN sebagai cadangan

**Petunjuk 1**: "Tidak boleh melintasi internet publik"—lalu lintas VPN melalui internet publik (terenkripsi). Hanya Direct Connect yang privat.

**Petunjuk 2**: "Latensi konsisten dan dapat diprediksi"—performa VPN internet publik bervariasi. Direct Connect konsisten.

**Petunjuk 3**: "Koneksi cadangan"—apa pendekatan yang direkomendasikan ketika Direct Connect adalah primer?

**Jawaban**: D

**Penjelasan**: Direct Connect menyediakan koneksi privat dan khusus yang tidak melintasi internet publik—memenuhi persyaratan privasi dan latensi. Site-to-Site VPN sebagai cadangan menyediakan redundansi: jika sirkuit Direct Connect gagal, lalu lintas failover ke VPN terenkripsi. Ini adalah pola HA standar untuk Direct Connect.

**Mengapa bukan A?** Lalu lintas Site-to-Site VPN melintasi internet publik, yang melanggar persyaratan "tidak boleh melintasi internet publik".

**Mengapa bukan B?** Hosted Connection menyediakan koneksi Direct Connect tetapi opsi B tidak menyertakan cadangan. Direct Connect tunggal tanpa cadangan adalah titik kegagalan tunggal—fiber fisik bisa dipotong.

**Mengapa bukan C?** Dua koneksi VPN melalui ISP yang berbeda tetap melintasi internet publik, bahkan jika terenkripsi. Tidak memenuhi persyaratan jaringan privat.

*SAA-C03 Domain: Design High-Performing Architectures — Task 3.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus berkembang untuk memiliki tim rekayasa regional di Seattle, Berlin, dan Singapura. Setiap tim regional membutuhkan akses ke:

- VPC produksi (read-only untuk debugging)
- VPC staging (akses penuh untuk pengujian)
- VPC analitik (read-only untuk pelaporan)

Rancang konektivitas jaringannya. Apakah Anda akan menggunakan Transit Gateway? Direct Connect di setiap region atau Site-to-Site VPN? Bagaimana Anda akan menegakkan akses read-only untuk produksi? (Petunjuk: ini adalah pertanyaan jaringan dan IAM sekaligus.)

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih desain jaringan multi-region, multi-tim.)*

**Ekstensi**: Tim Berlin melaporkan bahwa latensi VPN mereka ke VPC produksi (us-west-2) rata-rata 160ms. Pada volume data berapa Accelerated Site-to-Site VPN atau Direct Connect Hosted Connection menjadi opsi yang lebih baik? Riset harga Direct Connect Hosted Connection saat ini dari AWS Partner Eropa. Apakah peningkatan latensi saja akan membenarkan biayanya pada volume data perkiraan Anda?

## Adegan Pasca Kredit

Migrasi data selesai dalam 8 hari kalender—3 hari agar Snowball Edge tiba, 94 menit untuk menyalin data, 4 hari bagi AWS untuk menerima perangkat dan meng-ingest data, lalu sinkronisasi akhir delta yang telah terakumulasi sementara Snowball dalam perjalanan. Waktu langsung untuk keseluruhannya: di bawah empat jam.

Langkah terakhir itu penting. Snowball Edge menyalin snapshot titik-waktu dari dataset 4TB. Sementara ia dalam perjalanan, database produksi terus berjalan—pesanan baru ditempatkan, record baru dibuat. Sinkronisasi delta melalui VPN adalah 12GB, selesai dalam 18 menit.

"Transfer massal adalah Snowball," kata Leo. "Sinkronisasinya hanya data baru bersih dari 8 hari yang diperlukan."

"Saya sudah men-deploy-nya—oh," kata Leo, menonton penyalinan selesai di Snowball Edge setelah 94 menit. "Saya seharusnya mengatur throttle bandwidth pada penyalinan lokal untuk menghindari menjenuhkan jaringan kantor selama jam kerja."

Ia belum mengatur throttle. Internet kantor baik-baik saja—Snowball adalah operasi jaringan lokal. Tetapi switch jaringan sebentar menjadi penyumbat saat penyalinan mendekati throughput lokal 9 Gbps.

"Intinya," katanya, setelah memperbaiki pengaturan throttle, "adalah bahwa surat fisik lebih cepat daripada internet di atas volume data tertentu."

"Itu entah jelas atau berlawanan dengan intuisi," kata Maya, "tergantung bagaimana Anda memikirkannya."

"Lain kali," kata Leo, "kita harus menyiapkan Direct Connect."

Tom tidak meraih kalkulator—ia sudah menjalankan perhitungan sebelumnya, ketika Direct Connect pertama kali muncul: sekitar seribu sebulan, port plus sirkuit.

"Untuk apa yang kita lakukan sekarang, mungkin tidak sepadan. Tetapi jika kita mulai memindahkan lebih dari 10TB sebulan antara kantor kita dan AWS, penghematan transfer data pada Direct Connect akan mengimbangi biayanya."

"Jadi kita memantau volume transfer data," kata Priya, "dan meninjau kembali ketika ia melewati ambang batas."

"Itu arsitektur yang sadar-biaya," kata Tom.

"Itu selalu menjadi intinya," kata Maya.

Priya telah menonton migrasi dari seberang ruangan. "Lain kali kita melakukan sesuatu seperti ini," katanya, "bisakah kita melakukannya sebelum data ada di produksi dan bisnis bergantung padanya? Memigrasikan data live selalu lebih berisiko daripada memigrasikan data at-rest."

"Ia tidak pernah at-rest ketika bisnis sedang berjalan," kata Leo.

"Saya tahu," katanya. "Itulah intinya. Rencanakan migrasi sebelum Anda membutuhkannya. Bukan setelahnya."

Tom sudah menghitung berapa biaya untuk memiliki set kedua infrastruktur di us-east-1 yang siap menerima migrasi kapan saja. Ia menyimpan angka itu untuk dirinya sendiri untuk sekarang. Ada bab-bab yang lebih mendesak untuk ditutup.

Pada bab berikutnya: apa yang terjadi ketika Anda memiliki lebih banyak data daripada yang bisa disimpan database mana pun secara wajar, dan Anda perlu memahami semuanya.
