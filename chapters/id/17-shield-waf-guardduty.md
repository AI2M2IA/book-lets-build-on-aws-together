# Bab 17: Para Pengawas

Insiden dengan IP Rumania telah dibendung. Rahasia ada di Secrets Manager. Kredensial dirotasi. Kontrol jaringan diperketat.

Tetapi Priya telah mengajukan pertanyaan yang mengakhiri Bab 16: "Jika sesuatu yang tidak biasa muncul di CloudTrail, bagaimana kita akan tahu?"

Jawaban jujurnya adalah: mereka mungkin tidak akan tahu.

---

*Segala sesuatu yang bisa dikunci telah dikunci. Rahasia ada di Secrets Manager. Kunci enkripsi ada di KMS. Lalu lintas jaringan dikontrol oleh security group dan NACL. Pertahanan perimeter sudah solid. Tetapi pertahanan perimeter berasumsi Anda tahu seperti apa serangan sebelum ia tiba. Pertanyaan yang diajukan Priya berbeda: bagaimana dengan serangan yang tidak Anda lihat datang?*

---

CloudTrail mencatat ribuan peristiwa per hari. Tidak ada manusia yang membaca semuanya. Priya memeriksa secara manual setiap minggu, tetapi itu berarti sesuatu bisa terjadi pada hari Selasa dan tidak diperhatikan sampai Senin berikutnya.

"Kita butuh sesuatu yang mengawasi log untuk kita," katanya.

Maya mendongak. "Secara otomatis?"

"Secara otomatis."

"Dan bagaimana jika seseorang mencoba menerobos masuk?" Priya melanjutkan. "Bukan hanya kredensial yang dikompromikan — bagaimana jika seseorang meluncurkan DDoS? Bagaimana jika mereka mulai memprobe endpoint API kita untuk kerentanan injeksi? Bagaimana jika mereka sudah di dalam dan kita tidak tahu?"

"Itu tiga masalah yang berbeda," kata Leo.

"Ya," kata Priya. "Dan AWS memiliki tiga layanan berbeda untuk mengatasinya."

**Tiga Kategori Ancaman**

Ancaman keamanan terhadap aplikasi cloud umumnya terbagi dalam tiga kategori:

**Serangan volume (DDoS)**: Penyerang mengirim begitu banyak lalu lintas sehingga aplikasi Anda tidak dapat merespons pengguna yang sah. Serangan mungkin jutaan permintaan HTTP, atau banjir paket TCP SYN yang dirancang untuk menghabiskan tabel koneksi server Anda.

**Serangan aplikasi (Eksploitasi)**: Penyerang mengirim permintaan yang secara khusus dibuat untuk mengeksploitasi kelemahan dalam aplikasi Anda — SQL injection, cross-site scripting, input cacat yang merusak parser.

**Anomali perilaku (Pengintaian dan kompromi)**: Panggilan API yang seharusnya tidak terjadi (seseorang mengkueri seluruh database pengguna Anda pada pukul 3 dini hari), aktivitas IAM yang tidak biasa (kredensial yang digunakan dari negara baru), atau lalu lintas jaringan ke tujuan yang tidak terduga.

AWS memiliki layanan khusus untuk masing-masing:

- **AWS Shield**: Perlindungan DDoS
- **AWS WAF**: Perlindungan lapisan aplikasi
- **Amazon GuardDuty**: Deteksi ancaman berbasis perilaku

**AWS Shield: Penyerap DDoS**

**AWS Shield Standard** diaktifkan secara otomatis untuk semua pelanggan AWS tanpa biaya tambahan. Ia melindungi dari serangan DDoS layer 3 (jaringan) dan layer 4 (transport) yang paling umum — SYN flood, UDP flood, serangan amplifikasi DNS.

CloudFront, Route 53, dan Elastic Load Balancing berada di tepi jaringan AWS. Ketika serangan DDoS menargetkan aplikasi Anda, ia menghantam layanan terkelola ini terlebih dahulu. Infrastruktur jaringan AWS menyerap serangan sebelum mencapai instans EC2 Anda.

**AWS Shield Advanced** adalah tier premium ($3.000/bulan per organisasi, dengan komitmen satu tahun). Ini adalah langganan terpisah — ia *tidak* termasuk dalam paket AWS Support mana pun. Ia menambahkan:

- Perlindungan untuk EC2, ELB, CloudFront, Global Accelerator, dan Route 53
- Notifikasi serangan hampir real-time
- Akses ke AWS Shield Response Team (SRT) — security engineer yang dapat membantu Anda merespons serangan (melibatkan SRT juga membutuhkan paket Business atau Enterprise Support)
- Perlindungan biaya: jika serangan menyebabkan tagihan Anda melonjak, AWS mengkredit biaya lonjakan
- Deteksi dan mitigasi DDoS yang ditingkatkan di layer 7 (lapisan aplikasi)

"Berapa biayanya per bulan?" tanya Tom.

"Tiga ribu dolar," kata Priya. "Per organisasi."

Tom diam sejenak.

"Untuk enterprise yang menangani jutaan pendapatan, DDoS yang melumpuhkan mereka selama dua jam berbiaya lebih dari tiga ribu dolar," kata Priya.

Tom menghitung dalam diam.

"Kita akan mulai dengan Standard," katanya akhirnya.

---

**Insiden DDoS: Seperti Apa Shield dalam Aksi**

Delapan bulan setelah peluncuran, Nimbus mendapatkan serangan DDoS nyata pertamanya.

Itu dimulai pada pukul 11:43 pagi pada suatu Selasa. Dasbor CloudWatch untuk load balancer menunjukkan permintaan koneksi masuk melonjak dari normal 3.000 per menit menjadi 180.000 per menit dalam waktu kurang dari sembilan puluh detik. IP sumber tersebar di empat puluh negara, dan volume masuk memuncak sekitar lima puluh gigabit per detik. Polanya tak salah lagi: sebuah botnet meluncurkan SYN flood.

Leo melihat metrik CloudFront terlebih dahulu. "Tingkat permintaan naik enam puluh kali lipat. Waktu respons melonjak."

Priya membuka metrik CloudWatch berdampingan: upaya koneksi di edge mendaki vertikal, permintaan yang benar-benar mencapai origin — datar. "Shield Standard sedang memakannya," katanya. Tidak ada peringatan, tidak ada peristiwa dasbor, tidak ada notifikasi. Shield Standard bekerja secara diam-diam: ia selalu aktif, gratis, dan memberi Anda **tidak ada visibilitas serangan** — tidak ada konsol peristiwa, tidak ada notifikasi, tidak ada tim respons DDoS. (Visibilitas itu — dasbor dan peringatan serangan hampir real-time — adalah persis apa yang dijual Shield *Advanced*.) Satu-satunya cara Priya bisa melihat serangan sama sekali adalah melalui metrik CloudWatch-nya sendiri.

Shield Standard telah secara otomatis mendeteksi SYN flood dan melakukan mitigasi dalam dua menit pertama. Lalu lintas serangan diserap di node edge CloudFront secara global — 750+ points of presence yang sama yang melayani konten sah juga menyerap volume serangan.

Pada pukul 11:52 pagi — sembilan menit setelah serangan dimulai — mitigasi Shield telah mengembalikan tingkat permintaan di origin ke normal. Serangan masih berjalan di level jaringan, tetapi mitigasi menanganinya. Aplikasi Nimbus terus melayani pengguna sepanjang waktu.

"Pengguna tidak menyadarinya?" tanya Leo, melihat metrik tingkat error.

"Tingkat error naik sekitar dua persen selama sekitar empat menit," kata Priya. "Beberapa pengguna mendapat respons yang sedikit lebih lambat. Tidak ada outage. Aplikasi tetap aktif."

"Karena Shield menyerap banjir di edge."

"Sebelum ia mencapai load balancer kita. SYN flood lima puluh gigabit menghantam CloudFront. Pada saat pola lalu lintas dikenali dan dimitigasi, origin kita hanya melihat volume permintaan normal."

Serangan berlangsung empat puluh tujuh menit. Pada pukul 12:30 siang metrik edge telah kembali ke baseline — satu-satunya sinyal "selesai" yang diberikan Shield Standard.

"Dan ini Shield Standard," kata Tom. "Versi gratisnya."

"Serangan layer 3 dan 4. Standard melindungi dari itu secara otomatis. Jika serangannya lebih canggih — HTTP flood layer 7, misalnya, di mana setiap permintaan terlihat sah — Standard tidak akan cukup. Itu membutuhkan Shield Advanced ditambah WAF."

Tom menulis "Pantau pola DDoS layer 7" di roadmap keamanannya.

---

**AWS WAF: Filter Aplikasi**

**AWS WAF (Web Application Firewall)** beroperasi di level HTTP — ia memeriksa isi permintaan web sebelum mencapai aplikasi Anda.

WAF dikonfigurasi dengan **Web ACL (Access Control List)** — set aturan yang mendefinisikan apa yang harus diizinkan, diblokir, atau dihitung.

WAF dapat dilampirkan ke:

- Distribusi CloudFront (memeriksa permintaan di edge, secara global)
- Application Load Balancer (memeriksa permintaan di level regional)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS dan vendor pihak ketiga menerbitkan set aturan yang sudah dibangun sebelumnya:

- **AWS Managed Rules - Core Rule Set**: Bersama dengan rule group pendamping (SQL database, Known Bad Inputs), mencakup kerentanan OWASP Top 10 (SQL injection, XSS, command injection, path traversal, dll.)
- **AWS Managed Rules - Known Bad Inputs**: Memblokir permintaan yang cocok dengan pola serangan yang diketahui
- **AWS Managed Rules - Amazon IP Reputation List**: Memblokir IP yang diketahui terkait dengan botnet dan pemindai
- **AWS Managed Rules - Bot Control**: Mengidentifikasi dan mengelola lalu lintas bot

Anda juga dapat membuat aturan kustom:

- "Blokir permintaan apa pun dengan header User-Agent yang berisi 'sqlmap'" (pemindai SQL injection umum)
- "Rate limit: izinkan tidak lebih dari 1000 permintaan per IP per 5 menit"
- "Blokir permintaan yang berisi `<script>` dalam nilai parameter mana pun"

Untuk Nimbus, pengaturan praktisnya: WAF pada distribusi CloudFront dengan Core Rule Set diaktifkan. Ini memblokir pola serangan paling umum sebelum permintaan pernah mencapai instans EC2.

Anda mungkin bertanya-tanya: jika WAF memblokir pola serangan yang diketahui, apa yang terjadi ketika pola serangan baru muncul yang tidak diketahui WAF? Set aturan terkelola WAF diperbarui oleh AWS dan vendor pihak ketiga saat ancaman baru muncul — Anda tidak perlu memperbarui aturan secara manual. Tetapi Anda benar bahwa WAF pada dasarnya reaktif terhadap pola yang diketahui. Teknik serangan baru dan novel tidak akan diblokir oleh aturan yang belum ada. Inilah mengapa GuardDuty ada bersama WAF: WAF menyaring pintu depan, GuardDuty mengawasi perilaku yang tidak biasa di dalam rumah. Tipe serangan baru mungkin tembus WAF, tetapi GuardDuty tetap dapat menandai aktivitas anomali yang ditimbulkannya — panggilan API yang tidak biasa, tujuan jaringan yang tidak terduga, pola akses yang tidak cocok dengan baseline.

**Apakah kita sudah memikirkan apa yang terjadi jika WAF menyebabkan false positive?** tanya Priya. "Permintaan pengguna sah yang diblokir oleh Core Rule Set?"

"WAF memiliki mode 'Count'," kata Leo. "Alih-alih memblokir, ia hanya menghitung permintaan yang cocok. Anda menjalankannya dalam mode Count terlebih dahulu, meninjau apa yang akan diblokirnya, memverifikasi tidak ada false positive, lalu beralih ke Block."

"Bagus," kata Priya. "Kita mulai dalam mode Count."

---

**Membuat Aturan WAF: Kisah Rate Limit**

Dua minggu setelah mengaktifkan WAF dalam mode Count, Priya meninjau log. Temuan Core Rule Set bersih — tidak ada false positive pada lalu lintas sah, segelintir upaya SQL injection yang diblokir dari pemindai otomatis.

Tetapi ia menyadari sebuah pola yang tidak ditandai Core Rule Set: satu alamat IP telah membuat 847 permintaan ke `/api/search` dalam lima menit. Setiap permintaan valid secara struktural. Tetapi 847 pencarian dalam lima menit bukanlah manusia.

"Price scraper," katanya. "Seseorang secara otomatis mengkueri pencarian restoran kita untuk membangun database harga kompetitif."

"Apakah kita peduli?" tanya Leo.

"Ia menggunakan sumber daya komputasi kita dan itu melanggar ketentuan layanan kita," kata Tom.

"Kita peduli," konfirmasi Priya.

Ia membuat aturan WAF berbasis-rate kustom:

```
Nama aturan: RateLimitSearchAPI
Tipe aturan: Aturan berbasis-rate
Batas rate: 100 permintaan per alamat IP
Jendela evaluasi: 5 menit (dapat dikonfigurasi: 1, 2, 5, atau 10 menit)
Pernyataan scope-down: Path URI dimulai dengan /api/search
Aksi: Block
```

Pernyataan scope-down penting — rate limit hanya berlaku untuk `/api/search`. Lalu lintas API sah ke endpoint lain tidak terpengaruh. Dan perhatikan cara kerja pemblokirannya: tidak ada periode "hukuman" tetap — WAF mengevaluasi ulang tingkat permintaan setiap IP secara terus-menerus, memblokirnya selama tingkat tetap di atas batas, dan membuka blokirnya (biasanya dalam hitungan detik) setelah tingkat turun kembali di bawahnya.

Ia mengaturnya ke mode Count terlebih dahulu. Menjalankannya selama 24 jam. Satu-satunya IP yang memicu aturan adalah scraper. Tidak ada pengguna sah yang pernah mengirim lebih dari 12 permintaan ke endpoint pencarian dalam lima menit.

Ia beralih ke mode Block. Permintaan scraper berikutnya menerima 403. Ia beralih ke IP yang berbeda. Rate limit menangkap yang itu juga.

"Mereka akan menyiasatinya pada akhirnya," kata Leo. "Mendistribusikan ke lebih banyak IP."

"Pada titik mana mereka menggunakan lebih banyak infrastruktur, membayar lebih banyak, dan mendapatkan lebih sedikit data," kata Priya. "Kita tidak perlu menghentikan mereka sepenuhnya. Kita perlu membuatnya cukup mahal sehingga tidak sepadan."

"Berapa biayanya per bulan?" tanya Tom.

Harga WAF adalah per Web ACL per bulan, per aturan per bulan, dan per juta permintaan. Untuk pengaturan Nimbus — satu Web ACL, lima aturan pada CloudFront — sekitar $15 per bulan ditambah biaya permintaan.

Tom menyetujuinya segera.

---

**Amazon GuardDuty: Analis Perilaku**

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya. "Jika WAF memblokir serangan dan Shield menyerap banjir, mengapa kita membutuhkan layanan ketiga? Apa yang sebenarnya diawasi GuardDuty?"

WAF dan Shield adalah filter — mereka mencegat lalu lintas buruk sebelum mencapai aplikasi Anda. GuardDuty mengawasi apa yang terjadi setelah lalu lintas tiba. Ia melihat apa yang dilakukan infrastruktur Anda: kredensial IAM mana yang digunakan, domain mana yang dihubungi instans Anda, panggilan API apa yang terjadi pada pukul 3 dini hari. Penyerang yang tembus pintu depan melalui permintaan yang terlihat sah tidak akan dihentikan oleh WAF — tetapi GuardDuty akan menyadari bahwa kredensial yang sama tiba-tiba membuat panggilan API dari Rumania.

GuardDuty pada dasarnya berbeda dari Shield dan WAF. Ia tidak memblokir serangan — ia **mendeteksi perilaku yang tidak biasa**.

GuardDuty terus-menerus menganalisis beberapa aliran aktivitas untuk mendeteksi ancaman: **peristiwa manajemen dan data CloudTrail** (panggilan API dan tindakan), **VPC Flow Logs** (pola lalu lintas jaringan), dan **log kueri DNS** (pencarian domain). Ini adalah tiga sumber fondasi yang selalu diandalkan GuardDuty:

- **Log AWS CloudTrail**: perubahan IAM, panggilan API, login konsol
- **VPC Flow Logs**: pola lalu lintas jaringan dalam VPC Anda
- **Log kueri DNS**: apa yang di-resolve instans Anda (malware yang diketahui sering me-resolve domain C2 tertentu)

Tetapi GuardDuty telah berkembang secara signifikan melampaui ketiga ini. AWS menyebut add-on opsional sebagai **protection plan** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring, dan Malware Protection — masing-masing diaktifkan secara individual. Tergantung mana yang Anda aktifkan, GuardDuty juga dapat menganalisis **peristiwa data S3** (pola akses tidak biasa ke bucket Anda), **log audit dan aktivitas runtime EKS** (perilaku jahat di dalam kontainer yang berjalan), **peristiwa login RDS** (upaya login database anomali), **lalu lintas jaringan Lambda** (fungsi yang memanggil tujuan eksternal tak terduga), **perilaku runtime ECS/EC2**, dan **volume EBS yang dipindai untuk malware**. Untuk ujian, ketahui tiga sumber inti dengan hafal; protection plan muncul dalam skenario tentang konteks deteksi ancaman tertentu — "deteksi upaya login anomali ke RDS" atau "identifikasi perilaku jahat di dalam kontainer yang berjalan" adalah sinyal untuk memikirkan protection plan opsional GuardDuty.

Model machine learning mengidentifikasi pola yang menyimpang dari baseline Anda. GuardDuty menghasilkan **findings** — peringatan yang dikategorikan — ketika ia mendeteksi anomali.

Contoh apa yang dapat dideteksi GuardDuty:

- Pengguna IAM yang masuk dari alamat IP yang tidak dikenali (di negara yang belum pernah mereka gunakan)
- Panggilan API yang dibuat dari node keluar Tor
- Instans EC2 yang berkomunikasi dengan pool penambangan cryptocurrency yang diketahui
- Volume panggilan API yang luar biasa tinggi (penyalahgunaan kredensial atau pemindaian)
- Bucket S3 yang diakses oleh alamat IP yang telah ditandai untuk aktivitas jahat
- Lalu lintas keluar ke domain yang diketahui terkait dengan command-and-control malware

"Ini yang akan menangkap IP Rumania," kata Leo pelan.

"Jika kita telah mengaktifkan GuardDuty, ia akan menandai instans EC2 yang membuat koneksi keluar ke IP eksternal yang tidak dikenali pada pukul 2 dini hari," konfirmasi Priya.

---

**Lima Tipe Finding GuardDuty dan Apa yang Harus Dilakukan**

Priya membuat runbook untuk lima finding GuardDuty yang paling umum. Ketika sebuah finding menyala, tim langsung tahu apa artinya dan apa yang harus dilakukan.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Seorang pengguna IAM berhasil masuk ke AWS Console dari alamat IP yang belum pernah terlihat untuk akun ini sebelumnya, atau dari lokasi geografis yang tidak konsisten dengan login sebelumnya.

Respons: Verifikasi dengan pengguna bahwa mereka memulai login. Jika mereka tidak — atau tidak dapat dihubungi — segera: nonaktifkan access key dan kata sandi konsol pengguna, cabut sesi aktif, dan mulai audit CloudTrail dari semua yang telah dilakukan pengguna itu dalam 24 jam terakhir. Finding ini sering mendahului penyalahgunaan kredensial.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Sebuah instans EC2 sedang mengkueri alamat IP atau nama domain yang terkait dengan pool penambangan cryptocurrency. Ini hampir selalu hasil dari instans EC2 yang dikompromikan dan digunakan sebagai bot penambangan.

Respons: Isolasi instans segera — modifikasi security group-nya untuk memblokir semua lalu lintas masuk dan keluar kecuali untuk bastion host Anda. Ambil snapshot forensik dari volume EBS. Lalu hentikan instans dan luncurkan pengganti dari AMI yang bersih.

**3. Recon:EC2/PortProbeUnprotectedPort**

Sebuah instans EC2 memiliki port yang terbuka ke internet yang sedang diprobe oleh pemindai yang diketahui atau dari node keluar Tor. GuardDuty menandai port yang muncul di flow logs sebagai dapat diakses dari sumber eksternal.

Respons: Tinjau aturan security group. Jika port sengaja terbuka, tandai finding sebagai selesai dengan catatan. Jika tidak disengaja, tutup port segera. Periksa CloudTrail untuk akses apa pun yang mungkin terjadi melalui port itu.

**4. Trojan:EC2/BlackholeTraffic**

Sebuah instans EC2 mencoba berkomunikasi dengan alamat IP yang telah diidentifikasi sebagai "black hole" — tujuan yang terkait dengan infrastruktur command-and-control malware. Lalu lintas ke IP ini menunjukkan instans telah terinfeksi dan mencoba menelepon pulang.

Respons: Sama seperti finding CryptoCurrency — isolasi, snapshot, ganti. Finding ini menunjukkan malware aktif di instans. Jangan mencoba membersihkan instans di tempat; bangun yang baru dari AMI yang bersih.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Seseorang telah menonaktifkan pengaturan Block Public Access pada bucket S3. Ini tidak berarti bucket bersifat publik — ini berarti mekanisme keamanan yang mencegah eksposur publik yang tidak disengaja telah dimatikan untuk bucket itu. Ini sering dilakukan secara tidak sengaja atau sebagai bagian dari deployment yang salah konfigurasi.

Respons: Selidiki siapa yang membuat perubahan (CloudTrail akan memiliki panggilan API). Aktifkan kembali Block Public Access kecuali ada alasan terdokumentasi mengapa ia harus dinonaktifkan. Pertimbangkan mengaktifkan pengaturan Block Public Access level akun untuk mencegah finding ini terjadi di masa depan.

"Hal terpenting tentang finding GuardDuty," kata Priya, "adalah bahwa mereka bukan peringatan — mereka hipotesis. Setiap finding mengatakan 'pola ini terlihat anomali.' Anda memverifikasi, Anda menyelidiki, Anda merespons. Beberapa akan menjadi false positive. Sebagian besar tidak."

"Bagaimana kita memprioritaskan?" tanya Rafael.

"GuardDuty menetapkan tingkat keparahan: Low, Medium, High. Finding keparahan High membutuhkan respons hari yang sama. Finding Trojan dan kompromi kredensial selalu High. Finding port probe mungkin Medium atau Low. Mulai dengan High, turun ke bawah."

---

"Berapa biayanya?" tanya Tom.

Harga GuardDuty didasarkan pada volume log yang dianalisis — peristiwa CloudTrail, data flow VPC, kueri DNS. Untuk aplikasi kecil hingga menengah, biasanya $50-150/bulan. Pada skala besar, ia tetap sebagian kecil dari biaya infrastruktur.

Tom membuka konsol dan mengaktifkannya.

"Akan baik-baik saja," kata Leo. "Ini hanya pemantauan. Bukan seperti ia akan merusak apa pun."

"Aku sudah men-deploy-nya," tambah Leo — lalu memeriksa dasbor GuardDuty. "Oh. Finding sampel saja. Yang nyata butuh waktu."

"GuardDuty butuh waktu untuk membangun baseline tentang seperti apa normal," kata Priya. "Beri ia beberapa hari. Finding nyata pertama akan tiba — mereka selalu tiba."

Ia ternyata benar tentang itu. Tetapi finding pertama adalah cerita untuk akhir bab ini.

**Menghubungkan Ketiga Layanan**

Shield, WAF, dan GuardDuty bekerja di lapisan yang berbeda dan saling melengkapi:

| Layanan    | Lapisan                   | Melindungi Dari                             | Aksi                               |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Jaringan/Transport (L3/L4)| Banjir DDoS                                 | Menyerap/memitigasi serangan       |
| AWS WAF    | Aplikasi (L7)             | OWASP Top 10, bot, scraper                  | Mengizinkan, memblokir, menghitung |
| GuardDuty  | Perilaku (semua log)      | Anomali, kredensial dikompromikan, malware  | Mendeteksi dan memberi peringatan  |

Shield menghentikan banjir. WAF menyaring airnya. GuardDuty mengawasi pipa untuk pola aliran yang tidak biasa. Macie mengaudit apa yang disimpan di reservoir. Security Hub adalah ruang kontrol tempat semua dasbor terlihat sekaligus.

Mode kegagalan masing-masing menjelaskan mengapa Anda membutuhkan semuanya:

- SYN flood 50 Gbps bukan permintaan web. WAF tidak dapat memeriksanya. GuardDuty mungkin menyadari peristiwa CloudTrail terkait. Shield menghentikannya.
- Satu permintaan SQL injection bukan banjir. Shield mengabaikannya. GuardDuty tidak tahu isi permintaan HTTP. WAF menangkapnya.
- Pengguna AWS sah yang menggunakan kredensial mereka sendiri untuk mengeksfiltrasi data secara perlahan — tidak ada DDoS, tidak ada injeksi, HTTP valid — Shield dan WAF tidak melihat sesuatu yang tidak biasa. GuardDuty menyadari kredensial digunakan dari negara baru pada pukul 3 dini hari.
- Seorang developer yang secara tidak sengaja mengunggah data pelanggan ke bucket yang dapat diakses publik tidak menghasilkan perilaku anomali sama sekali. GuardDuty tidak punya apa pun untuk ditandai. Macie memindai bucket dan menemukan PII.

Setiap layanan memiliki titik buta. Kombinasinya menutupi titik buta itu.

**CloudTrail: Fondasinya**

Ketiga layanan mengandalkan log. **AWS CloudTrail** adalah layanan logging yang menangkap setiap panggilan API di akun AWS Anda — siapa memanggil apa, kapan, dari mana, dengan hasil apa.

CloudTrail diaktifkan secara default untuk riwayat 90 hari di konsol. Untuk menyimpan log jangka panjang:

1. Buat sebuah trail yang menulis ke bucket S3
2. Opsional, kirim ke CloudWatch Logs untuk peringatan real-time
3. Aktifkan validasi file log (untuk mendeteksi jika log dirusak)

GuardDuty, AWS Config, Security Hub, dan IAM Access Analyzer semuanya membaca dari CloudTrail. Tanpa log CloudTrail, layanan-layanan ini tidak punya apa pun untuk dianalisis.

"Bagaimana jika seseorang mencoba menonaktifkan CloudTrail?" tanya Priya. "Jika penyerang mendapatkan akses administrator, tindakan pertama mereka mungkin menonaktifkan logging — menutupi jejak mereka."

"Itulah yang dicegah SCP dari Bab 14," kata Leo. "Tidak ada seorang pun di akun ini yang dapat menonaktifkan CloudTrail, bahkan administrator."

"Dan jika mereka entah bagaimana melakukannya?"

"Security Hub akan menghasilkan finding. CloudTrail mengirim notifikasi ke SNS pada perubahan konfigurasi. Kita mendapat peringatan dalam dua menit dari modifikasi CloudTrail apa pun."

"Dan GuardDuty akan menandai panggilan API-nya," tambah Rafael, "sebagai tindakan IAM yang tidak biasa — menonaktifkan logging bukanlah aktivitas operasional normal."

Beberapa lapisan deteksi untuk salah satu tindakan keamanan paling kritis: merusak log. Ini bukan kebetulan. Priya telah merancangnya dengan sengaja.

"Defense in depth berlaku untuk lapisan pemantauan juga," katanya. "Bukan hanya lapisan aplikasi."

**Amazon Macie: Data Sensitif di S3**

"Apakah kita sudah memikirkan apa yang terjadi jika seseorang secara tidak sengaja mengunggah file dengan nomor kartu kredit pelanggan ke S3?" tanya Priya. "Bukan dengan jahat — hanya developer mengekspor data untuk debugging dan mengunggah file yang salah?"

"Kita tidak akan pernah tahu," kata Leo.

"Tepat sekali. Kecuali kita punya Macie."

**Amazon Macie** adalah layanan keamanan data yang menggunakan machine learning untuk secara otomatis menemukan dan melindungi data sensitif di S3. Ia terus-menerus memindai bucket S3 dan mengidentifikasi:

- PII (Personally Identifiable Information): nama, alamat email, nomor telepon, tanggal lahir
- Data keuangan: nomor kartu kredit, nomor rekening bank
- Kredensial: kata sandi, access key, kunci privat yang tertanam dalam file
- Informasi kesehatan: catatan pasien, diagnosis

Macie menghasilkan finding ketika ia mendeteksi data sensitif di tempat yang seharusnya tidak ada — atau ketika bucket S3 memiliki konfigurasi akses yang terlalu permisif.

"Apakah ini sama dengan GuardDuty?" tanya Maya.

"Tujuan berbeda," kata Priya. "GuardDuty mengawasi perilaku — tindakan apa yang diambil, apakah tindakan itu terlihat anomali. Macie mengawasi data — konten apa yang disimpan, apakah konten itu sensitif. GuardDuty akan menandai instans EC2 yang membuat panggilan API tidak biasa. Macie akan menandai bucket S3 yang berisi nomor kartu kredit."

"Jadi GuardDuty adalah analis perilaku," kata Leo, "dan Macie adalah auditor data."

"Tepat sekali. Anda butuh keduanya. Penyerang yang mengeksfiltrasi data melalui panggilan API yang terlihat sah mungkin ditandai oleh GuardDuty untuk pola API yang tidak biasa. Tetapi jika seorang karyawan mengunggah file dengan 10.000 catatan pelanggan ke bucket pengembangan, tidak ada perilaku anomali untuk dideteksi — hanya data sensitif di tempat yang salah. Macie menangkap itu."

Untuk Nimbus, nilai paling langsung Macie adalah pada bucket `nimbus-debug-exports` — bucket yang digunakan developer untuk membuang data untuk debugging. Macie menemukan tiga file yang berisi riwayat pesanan dengan nama pelanggan dan alamat pengiriman. Bukan data pembayaran, tetapi data pribadi yang seharusnya tidak ada di bucket pengembangan yang tidak terenkripsi.

File dihapus. Sebuah policy ditambahkan: bucket debug dibatasi hanya untuk data uji sintetis. Data pelanggan nyata membutuhkan persetujuan Priya untuk diekspor ke lingkungan mana pun di luar produksi.

"Berapa biayanya per bulan?" tanya Tom.

Macie mengenakan biaya berdasarkan jumlah bucket S3 yang dievaluasi per bulan dan volume data yang dipindai. Untuk startup dengan jumlah bucket moderat, sekitar $10-50 per bulan. Gratis untuk 30 hari pertama.

Tom mengaktifkannya sebelum makan siang.

---

**AWS Security Hub: Dasbornya**

Jika Anda menjalankan beberapa akun AWS atau membutuhkan tampilan terkonsolidasi dari finding keamanan, **AWS Security Hub** mengagregasi finding dari GuardDuty, Inspector (penilaian kerentanan), Macie (privasi data), Config, dan Firewall Manager ke dalam satu dasbor.

Ia juga memeriksa konfigurasi Anda terhadap praktik terbaik keamanan (standar AWS Foundational Security Best Practices) dan CIS AWS Foundations Benchmark.

Security Hub adalah jawaban untuk "bagaimana saya melihat semua finding keamanan saya di satu tempat tanpa beralih antara lima konsol berbeda?" Ketika GuardDuty menghasilkan finding, ia muncul di GuardDuty dan di Security Hub. Ketika Macie menemukan data sensitif di bucket S3, ia muncul di Macie dan di Security Hub. Ketika aturan Config mendeteksi kesalahan konfigurasi, ia muncul di Config dan di Security Hub.

Untuk tim akun tunggal, Security Hub menambah nilai marginal — ia konsol lain untuk diperiksa. Kekuatannya muncul pada skala besar: tiga akun, sepuluh akun, lima puluh akun. Semua finding dari semua akun teragregasi ke Security Hub akun manajemen. Satu tim memantau satu dasbor. Satu set peringatan. Tidak ada pemeriksaan log akun-per-akun.

Untuk Nimbus: Security Hub belum dibutuhkan. Ketika mereka tumbuh menjadi tiga akun (dev, staging, produksi), ia akan menjadi esensial.

"Siapkan sekarang," kata Soo-Jin, di minggu ketiganya. "Butuh lima belas menit untuk mengaktifkan. Butuh tiga bulan untuk berharap Anda telah melakukannya lebih awal."

Mereka mengaktifkannya.

**Amazon Inspector: Penilaian Kerentanan**

Seminggu setelah mengaktifkan Macie, sebuah CVE diterbitkan untuk versi OpenSSL yang berjalan di seluruh fleet produksi Nimbus. Priya membaca advisory-nya sambil minum kopi.

"Kita perlu tahu instans mana yang terpengaruh," katanya.

"Aku bisa menjalankan pemindaian manual," kata Leo.

"Untuk sembilan instans, tentu. Untuk sembilan puluh? Untuk kontainer?" Priya membuka konsol Inspector. "Inilah gunanya Inspector."

**Amazon Inspector** adalah layanan penilaian kerentanan otomatis. Di mana GuardDuty mengawasi perilaku — apa yang dilakukan infrastruktur Anda saat ini — Inspector melihat apa yang ada yang bisa dieksploitasi.

- **Instans EC2:** Inspector memindai sistem operasi dan paket terinstal terhadap NVD (National Vulnerability Database) — katalog otoritatif CVE yang diketahui. Jika Anda menjalankan OpenSSL 1.1.1 dan sebuah CVE menargetkan versi itu, Inspector menandainya.
- **Image kontainer ECR:** Inspector memindai image kontainer di Elastic Container Registry sebelum di-deploy. Paket yang rentan dalam base image muncul sebagai finding sebelum kontainer pernah berjalan di produksi.
- **Paket fungsi Lambda:** Inspector menganalisis dependensi yang dibundel ke dalam fungsi Lambda Anda — paket Python, modul Node, dependensi Java — untuk kerentanan yang diketahui.

Perbedaan kritis dari pemindaian sekali jalan: Inspector berjalan **terus-menerus**. Ia tidak hanya memeriksa instans Anda sekali ketika Anda mengaktifkannya dan menyatakannya bersih. Ketika CVE baru diterbitkan, Inspector secara otomatis mengevaluasi ulang sumber daya Anda yang ada terhadap kerentanan baru. Ketika instans EC2 berubah — paket baru terinstal, AMI diperbarui — Inspector memindainya ulang. Fleet EC2 Priya ditandai untuk CVE OpenSSL dalam hitungan menit setelah mengaktifkan Inspector, bukan karena ia memintanya untuk memindai, tetapi karena itulah yang dilakukannya.

Finding diberi peringkat keparahan: Critical, High, Medium, Low, Informational. Mereka mengalir ke Security Hub bersama finding GuardDuty dan Macie. Satu dasbor. Ketiga lensa.

"Tiga instans terpengaruh," kata Leo, membaca finding Inspector. "Enam lainnya menggunakan versi yang sudah dipatch."

"Patch ketiga itu minggu ini," kata Priya.

"Bagaimana dengan image kontainer?"

Priya melihat finding ECR Inspector. Dua base image di container registry mereka memiliki kerentanan yang diketahui — versi paket yang lebih lama yang sejak itu telah dipatch. Ia menandainya untuk dibangun ulang.

"Hal pentingnya," kata Priya, "adalah bahwa kita menemukan ini sebelum dieksploitasi. Bukan setelahnya."

**Model Tiga Lensa**

GuardDuty, Inspector, dan Macie masing-masing mengawasi hal yang berbeda:

- **GuardDuty** bersifat perilaku. Ia bertanya: *apa yang sedang terjadi saat ini yang terlihat salah?* Panggilan API dari lokasi tak terduga, instans EC2 yang menghubungi server command-and-control, kredensial yang digunakan pada jam yang tidak biasa. Ia menangkap ancaman aktif dan anomali.
- **Inspector** bersifat struktural. Ia bertanya: *apa yang ada di lingkungan kita yang bisa dieksploitasi?* Paket yang tidak dipatch, dependensi rentan, runtime usang. Ia menangkap kondisi yang membuat serangan mungkin.
- **Macie** tentang data. Ia bertanya: *informasi sensitif apa yang tergeletak di bucket S3 kita yang seharusnya tidak ada di sana?* PII, catatan keuangan, kredensial yang tertinggal dalam file. Ia menangkap eksposur yang tidak menghasilkan perilaku anomali — hanya data di tempat yang salah.

Sebuah kompromi yang melibatkan CVE yang diketahui mungkin muncul di ketiganya: Inspector akan menandai kerentanan sebelum serangan. GuardDuty akan menandai perilaku anomali selama serangan. Macie akan menandai data yang dieksfiltrasi setelah mendarat di S3.

Tiga lensa berbeda, tiga horizon waktu berbeda, tidak ada yang menggantikan yang lain.

**AWS Network Firewall: Inspektur Lalu Lintas**

Satu spesialis lagi layak disebutkan sebelum kotak peralatan ditutup. Security group dan NACL (Bab 15) menyaring lalu lintas berdasarkan IP, port, dan protokol — mereka dapat mengatakan *siapa* yang boleh berbicara dengan *apa*, tetapi mereka tidak dapat melihat ke dalam percakapan. **AWS Network Firewall** adalah firewall stateful terkelola yang Anda deploy di level VPC. Ia melakukan deep packet inspection: menyaring berdasarkan nama domain (izinkan keluar hanya ke `*.eatnimbus.com` dan repository paket Anda), memblokir lalu lintas yang cocok dengan signature intrusi (IDS/IPS, kompatibel dengan aturan Suricata), dan memeriksa aliran yang akan dengan mudah dilewatkan security group karena nomor port-nya terlihat baik.

"Jadi ini security group dengan otak," kata Leo.

"Ini appliance yang akan Anda beli dari vendor firewall," kata Priya, "kecuali terkelola, auto-scaling, dan di-deploy di subnet-nya sendiri sehingga semua lalu lintas masuk dan keluar VPC dirutekan melaluinya."

Sinyal ujian: "periksa atau saring lalu lintas berdasarkan nama domain atau payload," "deteksi/pencegahan intrusi (IDS/IPS) untuk VPC," atau "penyaringan egress terpusat untuk lalu lintas keluar" → Network Firewall. Security group dan NACL adalah jawaban untuk allow/deny level instans dan level subnet berdasarkan port dan IP; Network Firewall adalah jawaban ketika pertanyaan menuntut inspeksi *di dalam* lalu lintas. Dan ketika pertanyaan menanyakan cara mengelola aturan WAF, Shield Advanced, security group, *dan* policy Network Firewall secara konsisten di banyak akun — itu **AWS Firewall Manager**, lapisan administrasi policy di atasnya.

## Kekuatan dan Batasan

**AWS Shield**:

- Standard: gratis dan otomatis — tidak ada alasan untuk tidak menggunakannya
- Advanced: sangat baik untuk target profil tinggi; mahal untuk tim kecil
- Standard menyerap serangan layer 3/4 (SYN flood, UDP flood, amplifikasi DNS) secara otomatis
- Advanced menambahkan perlindungan layer 7, notifikasi real-time, dan Shield Response Team

**AWS WAF**:

- Managed rule group menyederhanakan penyiapan secara signifikan — perlindungan OWASP Top 10 dengan beberapa klik
- Aturan kustom membutuhkan pemahaman pola serangan HTTP
- Rate limiting adalah fitur kuat yang sering diabaikan — efektif terhadap scraper dan brute force
- WAF bukan pengganti kode aplikasi yang aman — ia lapisan defense-in-depth
- Mulai dalam mode Count, validasi, lalu beralih ke Block

**GuardDuty**:

- Sangat sedikit upaya untuk mengaktifkan (beberapa klik, uji coba gratis 30 hari)
- Finding membutuhkan tinjauan dan respons manusia — GuardDuty mendeteksi, ia tidak memperbaiki
- False positive terjadi — beberapa aktivitas sah terlihat anomali bagi model ML
- Tingkat keparahan (Low/Medium/High) membantu memprioritaskan respons
- Terintegrasi dengan Security Hub, EventBridge, dan Lambda untuk alur kerja respons otomatis

**Amazon Inspector**:

- Pemindaian kerentanan terus-menerus dan otomatis — bukan pemeriksaan sekali jalan
- Memindai ulang secara otomatis ketika CVE baru diterbitkan atau ketika sumber daya berubah
- Mencakup instans EC2 (paket OS dan aplikasi), image kontainer ECR, dan paket fungsi Lambda
- Finding mengalir ke Security Hub; peringkat keparahan membantu memprioritaskan patching
- Tidak memblokir serangan — ia memunculkan kondisi yang membuat serangan mungkin

**Amazon Macie**:

- Secara otomatis menemukan data sensitif (PII, kredensial, data keuangan) di S3
- Menangkap eksposur data yang tidak memiliki pola perilaku anomali — GuardDuty akan melewatkannya
- Uji coba gratis 30 hari; bayar per bucket per bulan setelahnya
- Paling berharga untuk tim dengan banyak bucket S3 dan tingkat sensitivitas yang bervariasi

**AWS Security Hub**:

- Mengagregasi finding dari GuardDuty, Macie, Inspector, Config, dan Firewall Manager
- Memeriksa konfigurasi terhadap benchmark keamanan (CIS, NIST, PCI-DSS)
- Paling berharga pada skala multi-akun
- Aktifkan lebih awal, bahkan jika Anda hanya punya satu akun — riwayat finding bersifat kumulatif

## Ringkasan

Lima layanan, lima lapisan. Masing-masing mengatasi jenis ancaman yang berbeda — dan tidak ada yang menggantikan yang lain. Serangan DDoS melewati WAF dan GuardDuty. Upaya SQL injection melewati Shield. Kredensial yang dikompromikan yang digunakan secara perlahan dan hati-hati mungkin melewati Shield dan WAF sepenuhnya — tetapi GuardDuty akan melihat anomalinya. Seorang developer yang secara tidak sengaja mengunggah PII pelanggan ke bucket S3 debug melewati ketiganya — tetapi Macie menangkapnya.

- **AWS Shield Standard**: Perlindungan DDoS gratis dan otomatis di layer 3/4. Selalu aktif. Menyerap SYN flood 50 Gbps sebelum mencapai load balancer Nimbus.
- **AWS Shield Advanced**: Perlindungan DDoS premium dengan akses SRT dan perlindungan biaya. Kasus penggunaan enterprise.
- **AWS WAF**: Firewall lapisan aplikasi. Memeriksa dan menyaring permintaan HTTP. Lampirkan ke CloudFront, ALB, atau API Gateway. Gunakan Managed Rule Group untuk perlindungan OWASP Top 10. Aturan berbasis-rate untuk pertahanan scraper.
- **Amazon GuardDuty**: Deteksi ancaman berbasis perilaku. Sumber data inti: peristiwa CloudTrail, VPC Flow Logs, dan log DNS. Perlindungan opsional yang diperluas menambahkan peristiwa S3, pemantauan runtime EKS/ECS, peristiwa login RDS, dan aktivitas jaringan Lambda. Menghasilkan finding yang dikategorikan untuk aktivitas anomali. Lima tipe finding kunci: UnauthorizedAccess (login konsol), CryptoCurrency (penambangan), Recon (port probe), Trojan (lalu lintas C2), Policy (kesalahan konfigurasi S3).
- **Amazon Inspector**: Penilaian kerentanan otomatis. Memindai instans EC2, image kontainer ECR, dan paket fungsi Lambda untuk CVE yang diketahui. Berjalan terus-menerus dan mengevaluasi ulang ketika kerentanan baru diterbitkan. Finding mengalir ke Security Hub.
- **Amazon Macie**: Penemuan data sensitif di S3. Mendeteksi PII, kredensial, dan data keuangan. Menangkap eksposur yang tidak memiliki pola perilaku anomali.
- **AWS Security Hub**: Mengagregasi finding dari semua layanan keamanan ke dalam satu dasbor. Memungkinkan pemantauan terpusat di beberapa akun.
- **CloudTrail**: Fondasi dari semua logging keamanan AWS. Aktifkan trail yang menulis ke S3 untuk penyimpanan jangka panjang. Setiap layanan keamanan membaca darinya.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Aman (Domain 1, Tugas 1.2)*

- **Shield Standard vs Advanced**: Standard gratis dan otomatis. Advanced memakan biaya dan menambahkan SRT, perlindungan biaya, dan deteksi yang lebih baik. Sinyal ujian untuk Advanced: "DDoS skala besar," "jaminan SLA selama serangan," "perlindungan finansial terhadap lonjakan biaya terkait DDoS."
- **Sinyal kasus penggunaan WAF**: "blokir SQL injection," "blokir cross-site scripting," "rate limit panggilan API," "blokir user-agent tertentu," "perlindungan OWASP Top 10" → WAF.
- **Sinyal GuardDuty**: "deteksi aktivitas API tidak biasa," "identifikasi kredensial dikompromikan," "tandai koneksi jaringan EC2 anomali," "threat intelligence" → GuardDuty.
- **Lampiran WAF**: Dapat dilampirkan ke CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **Sumber data GuardDuty**: Tiga sumber inti — peristiwa CloudTrail, VPC Flow Logs, log DNS. Sumber opsional yang diperluas mencakup peristiwa data S3, log audit EKS, peristiwa login RDS, aktivitas jaringan Lambda, dan runtime ECS. Ujian mungkin menanyakan sumber data mana yang relevan untuk skenario deteksi tertentu: "login RDS anomali" → GuardDuty RDS Protection; "ancaman runtime kontainer" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs GuardDuty**: Ini adalah distraktor ujian umum. **Macie** menggunakan ML untuk mendeteksi data sensitif di S3 (PII, kredensial, data keuangan). **GuardDuty** mendeteksi ancaman dan anomali dalam perilaku. Macie tentang konten. GuardDuty tentang perilaku.
- **Inspector vs. GuardDuty vs. Macie:** Tiga lensa berbeda, tidak ada yang menggantikan yang lain. **Inspector** = pemindaian kerentanan — CVE pada instans EC2, image kontainer di ECR, dan paket fungsi Lambda. Berjalan terus-menerus dan memindai ulang ketika CVE baru diterbitkan. **GuardDuty** = deteksi ancaman berbasis perilaku — apa yang sedang terjadi saat ini yang terlihat anomali. **Macie** = penemuan data sensitif di S3 — PII, kredensial, dan data keuangan yang seharusnya tidak ada di sana. Pemicu ujian: "identifikasi kerentanan tidak dipatch pada EC2" atau "pindai image kontainer untuk CVE" → Inspector. "Deteksi panggilan API tidak biasa atau kredensial dikompromikan" → GuardDuty. "Temukan PII atau data sensitif di S3" → Macie.
- **Security Hub**: Mengagregasi finding keamanan dari beberapa layanan dan akun. Skenario ujian: "perusahaan memiliki beberapa akun AWS dan ingin tampilan tunggal dari semua finding keamanan" → Security Hub.
- **Aturan berbasis-rate di WAF**: Digunakan untuk membatasi permintaan per IP dalam jendela waktu. Berbeda dari Core Rule Set (yang mencocokkan pola serangan). Ujian menggunakan aturan berbasis-rate untuk "cegah upaya login brute force" atau "mitigasi scraping."
- **CloudTrail + GuardDuty + Security Hub**: Ketiganya bersama membentuk inti observabilitas keamanan AWS. Aktifkan CloudTrail terlebih dahulu (GuardDuty dan Security Hub bergantung padanya), lalu GuardDuty, lalu Security Hub untuk mengagregasi finding.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara AWS WAF dan Amazon GuardDuty. Apa yang dilindungi masing-masing layanan, dan di lapisan mana masing-masing beroperasi?

*(Petunjuk: Pikirkan WAF sebagai filter pada permintaan masuk, dan GuardDuty sebagai analis perilaku yang mengawasi log Anda.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Situs web sebuah perusahaan ritel sedang ditargetkan oleh botnet yang mengirim jutaan permintaan per jam ke API pencarian produk mereka. Permintaan tampak sah (string User-Agent valid, cookie sesi valid) tetapi tidak menghasilkan pembelian — mereka melakukan scraping harga produk. Serangan menyebabkan pelanggan sah mengalami waktu respons yang lambat.

Kombinasi layanan mana yang PALING mengatasi ancaman ini?

A) AWS WAF dengan aturan rate limiting dan CloudFront  
B) AWS Shield Advanced dan CloudFront  
C) Amazon GuardDuty dan AWS Shield Standard  
D) Network ACL yang memblokir rentang IP botnet

**Petunjuk 1**: Permintaan berada di level HTTP (lapisan aplikasi). Layanan mana yang beroperasi di lapisan HTTP?

**Petunjuk 2**: Botnet menggunakan banyak alamat IP berbeda — memblokir rentang IP tertentu di level NACL tidak efektif terhadap botnet besar.

**Petunjuk 3**: Rate limiting berdasarkan alamat IP dapat memperlambat scraping bahkan jika Anda tidak dapat memblokirnya sepenuhnya.

**Jawaban**: A

**Penjelasan**: AWS WAF dapat membatasi permintaan per alamat IP, mengurangi dampak scraping volume tinggi dari sumber tunggal mana pun. CloudFront mendistribusikan lalu lintas masuk di jaringan edge AWS, menyerap volume dan melindungi origin. Aturan WAF juga dapat mencocokkan pola permintaan (permintaan berurutan cepat ke endpoint API yang sama) untuk mengidentifikasi perilaku scraping.

**Mengapa tidak B?** Shield Advanced melindungi dari banjir DDoS (layer 3/4). Skenario menjelaskan scraping lapisan aplikasi (permintaan HTTP layer 7), yang tidak diperiksa Shield.

**Mengapa tidak C?** GuardDuty mendeteksi anomali dalam perilaku akun AWS Anda — ia tidak memblokir permintaan HTTP masuk. Shield Standard tidak menangani serangan lapisan aplikasi.

**Mengapa tidak D?** Botnet besar menggunakan ribuan alamat IP dari sumber yang terdistribusi. Memblokir rentang tertentu adalah pendekatan whack-a-mole yang gagal terhadap botnet canggih.

*SAA-C03 Domain: Desain Arsitektur Aman — Tugas 1.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang mempertimbangkan model ancaman mereka saat mereka bersiap menangani data kartu kredit. Tinjauan kepatuhan PCI-DSS membutuhkan:

- Perlindungan terhadap serangan DDoS lapisan jaringan
- Penyaringan lapisan aplikasi untuk eksploitasi web yang diketahui
- Logging semua panggilan API ke penyimpanan jangka panjang yang tamper-evident
- Deteksi pola akses tidak biasa ke layanan pembayaran

Petakan setiap persyaratan ke layanan atau konfigurasi AWS tertentu. Apakah Shield Standard cukup, atau apakah konteks PCI-DSS menyarankan Advanced? Di mana Anda akan melampirkan WAF?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih memetakan persyaratan kepatuhan ke layanan AWS.)*

## Adegan Pasca-Kredit

GuardDuty diaktifkan.

Empat puluh delapan jam kemudian, ia menghasilkan finding pertamanya: *"Instans EC2 i-0abc123 sedang berkomunikasi dengan node keluar Tor yang diketahui."*

Leo melihat ID instans.

"Itu instans pemantauan internal," katanya. "Yang aku siapkan untuk menjalankan diagnostik jaringan."

"Apakah ia seharusnya berkomunikasi dengan node keluar Tor?"

"Tidak." Ia berhenti. "Mengapa ia melakukannya?"

Ia membuka instans. Seseorang telah menginstal sebuah alat di atasnya — pemindai jaringan open-source yang sah yang, ternyata, juga berkomunikasi dengan infrastruktur Tor untuk pengumpulan data anonim.

"Jadi alat itu menelepon pulang," kata Priya.

"Tanpa sepengetahuanku," konfirmasi Leo.

"Itu risiko rantai pasok. Sebuah dependensi yang melakukan hal-hal yang tidak Anda otorisasi."

Leo menghapus alat itu. Ia menyiapkan proses untuk meninjau setiap alat pihak ketiga sebelum instalasi.

"Apakah ini level paranoia yang kita capai sekarang?" tanya Maya.

"Ya," kata Priya.

"Apakah ini level yang seharusnya selalu kita capai?" tanya Maya.

"Juga ya," kata Priya.

Di bab berikutnya: apa yang terjadi ketika pusat data di Oregon menghilang — dan mengapa Nimbus tetap berjalan.
