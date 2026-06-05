# Babat 17: Pengawas

Insiden dengan IP Rumania telah terkandung. Rahasia berada di Secrets Manager. Kredensial telah diputar. Kontrol jaringan telah diperketat.

Namun, Priya mengajukan pertanyaan yang mengakhiri Bab 16: "Jika sesuatu yang tidak biasa muncul di CloudTrail, bagaimana kita mengetahuinya?"

Jawaban yang jujur adalah: mereka mungkin tidak akan tahu.

CloudTrail mencatat ribuan peristiwa per hari. Tidak ada manusia yang membaca semuanya. Priya memeriksa secara manual setiap minggu, tetapi itu berarti sesuatu bisa terjadi pada hari Selasa dan tidak disadari hingga hari Senin berikutnya.

"Kita membutuhkan sesuatu yang mengawasi log untuk kita," katanya.

Maya mendongak. "Secara otomatis?"

"Secara otomatis."

Pertanyaan kedua Tom pada hari itu: "Berapa biayanya?"

**Tiga Kategori Ancaman**

Ancaman keamanan terhadap aplikasi cloud umumnya jatuh ke tiga kategori:

**Serangan Volume (DDoS)**: Seorang penyerang mengirimkan begitu banyak lalu lintas sehingga aplikasi Anda tidak dapat merespons pengguna yang sah. Serangan mungkin berupa jutaan permintaan HTTP, atau banjir paket TCP SYN yang dirancang untuk menguras tabel koneksi server Anda.

**Serangan Aplikasi (Eksploitasi)**: Seorang penyerang mengirimkan permintaan yang dibuat khusus yang dirancang untuk mengeksploitasi kerentanan dalam aplikasi Anda—SQL injection, cross-site scripting, input yang rusak yang menyebabkan parser mogok.

**Anomali Perilaku (Pengintaian dan Kompromi)**: Panggilan API yang seharusnya tidak terjadi (seseorang menanyakan seluruh database pengguna Anda pada pukul 3 pagi), aktivitas IAM yang tidak biasa (kredensial digunakan dari negara baru), atau lalu lintas jaringan ke tujuan yang tidak terduga.

AWS memiliki layanan khusus untuk masing-masing:

- **AWS Shield**: Perlindungan DDoS
- **AWS WAF**: Perlindungan lapisan aplikasi
- **Amazon GuardDuty**: Deteksi ancaman perilaku

**AWS Shield: Penghisap DDoS**

**AWS Shield Standard** diaktifkan secara otomatis untuk semua pelanggan AWS tanpa biaya tambahan. Ini melindungi terhadap serangan DDoS yang paling umum pada lapisan 3 (jaringan) dan lapisan 4 (transport)—SYN floods, UDP floods, serangan amplifikasi DNS.

CloudFront, Route 53, dan Elastic Load Balancing berada di tepi jaringan AWS. Ketika serangan DDoS menargetkan aplikasi Anda, itu mengenai layanan yang dikelola ini pertama. Infrastruktur jaringan AWS menyerap serangan sebelum mencapai instans EC2 Anda.

**AWS Shield Advanced** adalah tingkatan premium ($3.000/bulan per organisasi). Ini menambahkan:

- Perlindungan untuk EC2, ELB, CloudFront, Global Accelerator, dan Route 53
- Pemberitahuan serangan hampir real-time
- Akses ke Tim Respons AWS Shield (SRT) — insinyur keamanan yang dapat membantu Anda menanggapi serangan
- Perlindungan biaya: jika serangan menyebabkan tagihan Anda melonjak, AWS mengkreditkan biaya lonjakan
- Deteksi dan mitigasi DDoS yang ditingkatkan pada lapisan 7 (lapisan aplikasi)

"Tiga ribu dolar sebulan?" kata Tom.

"Untuk perusahaan yang menangani jutaan dolar pendapatan, serangan DDoS yang membuat mereka tidak dapat berfungsi selama dua jam lebih mahal daripada tiga ribu dolar," kata Priya.

Tom menghitungnya dengan tenang.

"Kita akan mulai dengan Standard," katanya akhirnya.

**AWS WAF: Penyaring Aplikasi**

**AWS WAF (Web Application Firewall)** beroperasi pada tingkat HTTP—ia memeriksa konten permintaan web sebelum mencapai aplikasi Anda.

WAF dikonfigurasi dengan **Web ACL (Daftar Kontrol Akses)**—kumpulan aturan yang mendefinisikan apa yang akan diizinkan, diblokir, atau dihitung.

WAF dapat dilampirkan ke:

- Distribusi CloudFront (memeriksa permintaan di tepi, secara global)
- Load Balancer Aplikasi (memeriksa permintaan pada tingkat regional)
- API Gateway
- AWS AppSync

**Aturan Terkelola AWS**: AWS dan vendor pihak ketiga menerbitkan kumpulan aturan yang telah dibuat sebelumnya:

- **Aturan Terkelola AWS - Kumpulan Aturan Inti**: Melindungi terhadap kerentanan OWASP Top 10 (SQL injection, XSS, injeksi perintah, traversal jalur, dll.)
- **Aturan Terkelola AWS - Masukan Buruk yang Diketahui**: Memblokir permintaan yang cocok dengan pola serangan yang diketahui
- **Aturan Terkelola AWS - Daftar Reputasi IP Amazon**: Memblokir IP yang diketahui terkait dengan botnet dan pemindai
- **Aturan Terkelola AWS - Kontrol Bot**: Mengidentifikasi dan mengelola lalu lintas bot

Anda juga dapat membuat aturan khusus:

- "Blokir permintaan apa pun dengan header User-Agent yang berisi 'sqlmap'" (pemindai SQL injection umum)
- "Batasi laju: izinkan tidak lebih dari 1000 permintaan per IP per 5 menit"
- "Blokir permintaan yang berisi `<script>` dalam nilai parameter apa pun"

Untuk Nimbus, pengaturan praktis: WAF pada distribusi CloudFront dengan Kumpulan Aturan Inti yang diaktifkan. Ini memblokir pola serangan yang paling umum sebelum permintaan pernah mencapai instans EC2.

**Amazon GuardDuty: Analis Perilaku**

GuardDuty secara fundamental berbeda dari Shield dan WAF. Ia tidak memblokir serangan—ia **mendeteksi perilaku yang tidak biasa**.

GuardDuty terus menganalisis:

- **Log CloudTrail AWS**: Perubahan IAM, panggilan API, login konsol
- **Log Aliran VPC**: pola lalu lintas jaringan di dalam VPC Anda
- **Log Kueri DNS**: apa yang di-resolve instans Anda (perangkat lunak berbahaya sering kali menyelesaikan domain C2 tertentu)

Model pembelajaran mesin mengidentifikasi pola yang menyimpang dari baseline Anda. GuardDuty menghasilkan **temuan**—peringatan yang dikategorikan—ketika ia mendeteksi anomali.

Contoh dari apa yang dapat dideteksi GuardDuty:

- Seorang pengguna IAM yang masuk dengan alamat IP yang tidak dikenali (di negara yang belum pernah digunakan sebelumnya)
- Panggilan API yang dibuat dari node keluar Tor
- Sebuah instance EC2 yang berkomunikasi dengan kolam pertambangan cryptocurrency yang diketahui
- Volume panggilan API yang tidak biasa (abusi kredensial atau pemindaian)
- Sebuah bucket S3 yang diakses oleh alamat IP yang telah ditandai sebagai aktivitas jahat
- Lalu lintas keluar ke domain yang diketahui terkait dengan malware dan perintah kendali

"Ini yang akan menangkap IP Romania," kata Leo dengan tenang.

"Jika kita memiliki GuardDuty diaktifkan, itu akan menandai instance EC2 yang membuat koneksi keluar ke alamat IP eksternal yang tidak dikenal pada pukul 02.00," konfirmasi Priya.

"Berapa biayanya?"

Harga GuardDuty didasarkan pada volume log yang dianalisis—peristiwa CloudTrail, data aliran VPC, kueri DNS. Untuk aplikasi kecil hingga menengah, biasanya $50-150/bulan. Pada skala besar, tetap merupakan sebagian kecil dari biaya infrastruktur.

Tom menarik konsol dan mengaktifkannya.

**Menghubungkan Tiga Layanan**

Shield, WAF, dan GuardDuty bekerja pada lapisan yang berbeda dan saling melengkapi:

| Layanan    | Lapisan                     | Melindungi Terhadap                            | Tindakan                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Jaringan/Transport (L3/L4) | Banjir DDoS                                 | Menyerap/mengurangi dampak serangan |
| AWS WAF    | Aplikasi (L7)          | OWASP Top 10, bot, scraper                | Mengizinkan, memblokir, atau menghitung permintaan |
| GuardDuty  | Perilaku (semua log)     | Anomali, kredensial yang terkompromi, malware | Mendeteksi dan memberi tahu          |

Shield menghentikan banjir. WAF menyaring air. GuardDuty mengawasi aliran pipa untuk pola yang tidak biasa.

**CloudTrail: Fondasi**

Ketiga layanan ini mengandalkan log. **AWS CloudTrail** adalah layanan pencatatan yang menangkap setiap panggilan API di akun AWS Anda—siapa yang memanggil apa, kapan, dari mana, dengan hasil apa.

CloudTrail diaktifkan secara default untuk riwayat 90 hari di konsol. Untuk mempertahankan log jangka panjang:

1. Buat jejak yang menulis ke bucket S3
2. Secara opsional, kirim ke CloudWatch Logs untuk peringatan waktu nyata
3. Aktifkan validasi file log (untuk mendeteksi jika log dirusak)

GuardDuty, AWS Config, dan Security Hub semuanya membaca dari CloudTrail. Tanpa log CloudTrail, layanan ini tidak memiliki apa pun untuk dianalisis.

**AWS Security Hub: Dasbor**

Jika Anda menjalankan beberapa akun AWS atau membutuhkan tampilan terpadu dari temuan keamanan, **AWS Security Hub** mengumpulkan temuan dari GuardDuty, Inspector (penilaian kerentanan), Macie (privasi data), Config, dan Firewall Manager ke dalam satu dasbor.

Ini juga memeriksa konfigurasi Anda terhadap praktik terbaik keamanan (standar AWS Foundational Security Best Practices) dan Benchmark CIS AWS Foundations.

Untuk Nimbus: Security Hub belum diperlukan. Ketika mereka tumbuh menjadi tiga akun (pengembangan, staging, produksi), itu akan berguna.

## Kekuatan dan Batasan

**AWS Shield**:

- Standar: gratis dan otomatis—tidak ada alasan untuk tidak menggunakannya
- Lanjutan: sangat baik untuk target berprofil tinggi; mahal untuk tim kecil

**AWS WAF**:

- Grup aturan yang dikelola menyederhanakan pengaturan secara signifikan
- Aturan khusus membutuhkan pemahaman tentang pola serangan HTTP
- Pembatasan laju adalah fitur yang ampuh yang sering terlewatkan
- WAF bukanlah pengganti kode aplikasi yang aman—ini adalah lapisan pertahanan-dalam-kedalaman

**GuardDuty**:

- Sangat rendah upaya untuk diaktifkan (beberapa klik)
- Temuan memerlukan tinjauan dan respons manusia—GuardDuty mendeteksi, tetapi tidak memperbaiki
- False positive terjadi—aktivitas yang sah terlihat tidak lazim untuk model ML
- Uji coba 30 hari—layak diaktifkan segera

## Ringkasan

- **AWS Shield Standar**: Gratis, perlindungan DDoS otomatis pada lapisan 3/4. Selalu aktif.
- **AWS Shield Lanjutan**: Perlindungan DDoS premium dengan akses SRT dan perlindungan biaya. Kasus penggunaan perusahaan.
- **AWS WAF**: Firewall lapisan aplikasi. Periksa dan filter permintaan HTTP. Lampirkan ke CloudFront, ALB, atau API Gateway. Gunakan Grup Aturan yang Dikelola untuk perlindungan OWASP Top 10.
- **Amazon GuardDuty**: Deteksi ancaman perilaku. Menganalisis CloudTrail, Log Aliran VPC, dan Log DNS. Menghasilkan temuan untuk aktivitas yang tidak lazim.
- **CloudTrail**: Fondasi dari semua pencatatan keamanan AWS. Aktifkan jejak yang menulis ke S3 untuk retensi jangka panjang.
- Layanan ini saling melengkapi: Shield pada lapisan jaringan, WAF pada lapisan aplikasi, GuardDuty pada lapisan perilaku.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Keamanan (Domain 1, Tugas 1.2)*

- **Perlindungan Standar vs. Tingkat Lanjut**: Standar gratis dan otomatis. Tingkat Lanjut memerlukan biaya dan menambahkan SRT, perlindungan biaya, serta deteksi yang lebih baik. Sinyal ujian untuk Tingkat Lanjut: “DDoS skala besar,” “jaminan SLA selama serangan,” “perlindungan finansial terhadap lonjakan biaya terkait DDoS.”
- **Sinyal penggunaan WAF**: “memblokir injeksi SQL,” “memblokir skrip lintas situs,” “membatasi laju panggilan API,” “memblokir agen pengguna tertentu,” “perlindungan OWASP Top 10” → WAF.
- **Sinyal GuardDuty**: “mendeteksi aktivitas API yang tidak biasa,” “mengidentifikasi kredensial yang terkompromi,” “menandai koneksi jaringan EC2 yang tidak biasa,” “intelijen ancaman” → GuardDuty.
- **Lampiran WAF**: Dapat dilampirkan ke CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **Sumber data GuardDuty**: Peristiwa manajemen CloudTrail, peristiwa data S3 CloudTrail, Log Aliran VPC, log DNS. Ujian mungkin menanyakan sumber data mana yang relevan untuk skenario deteksi tertentu.
- **Macie**: Seringkali disalahartikan dengan GuardDuty. **Macie** menggunakan ML untuk mendeteksi data sensitif di S3 (PII, kredensial, data keuangan). **GuardDuty** mendeteksi ancaman dan anomali dalam perilaku. Kasus penggunaan yang berbeda.

## Latihan

**Latihan 1 — Ingatan**

Jelaskan perbedaan antara AWS WAF dan Amazon GuardDuty. Apa yang dilindungi masing-masing layanan, dan pada lapisan apa masing-masing beroperasi?

*(Petunjuk: Pikirkan WAF sebagai filter pada permintaan masuk, dan GuardDuty sebagai analis perilaku yang mengawasi log Anda.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan ritel memiliki situs web yang menjadi target botnet yang mengirimkan jutaan permintaan per jam ke API pencarian produk mereka. Permintaan tampak sah (string Agen Pengguna yang valid, cookie sesi yang valid) tetapi tidak menghasilkan pembelian — mereka hanya menyalin harga produk. Serangan menyebabkan pelanggan yang sah mengalami waktu respons yang lambat.

Kombinasi layanan MANA yang TERBAIK untuk mengatasi ancaman ini?

A) AWS Shield Advanced dan CloudFront
B) AWS WAF dengan aturan pembatasan laju dan CloudFront
C) Amazon GuardDuty dan AWS Shield Standar
D) Jaringan ACL yang memblokir rentang IP botnet

*(Petunjuk 1*: Permintaan adalah tingkat HTTP (lapisan aplikasi). Layanan mana yang beroperasi pada lapisan HTTP?

*(Petunjuk 2*: Botnet menggunakan banyak alamat IP yang berbeda — memblokir rentang IP tertentu pada tingkat ACL tidak efektif melawan botnet besar.

*(Petunjuk 3*: Pembatasan laju berdasarkan alamat IP dapat memperlambat penyalinan bahkan jika Anda tidak dapat memblokirnya sepenuhnya.

**Jawaban**: B

**Penjelasan**: AWS WAF dapat membatasi laju permintaan per alamat IP, mengurangi dampak volume tinggi dari sumber tunggal. Jaringan CloudFront mendistribusikan lalu lintas masuk ke seluruh jaringan tepi AWS, menyerap volume dan melindungi asal. Aturan WAF juga dapat mencocokkan pada pola permintaan (permintaan berurutan cepat ke titik akhir API yang sama) untuk mengidentifikasi perilaku penyalinan.

**Mengapa bukan A?** Shield Advanced melindungi terhadap banjir DDoS (lapisan 3/4). Skenario ini menggambarkan serangan lapisan aplikasi penyalinan (permintaan HTTP lapisan 7), yang tidak diperiksa oleh Shield.

**Mengapa bukan C?** GuardDuty mendeteksi anomali dalam perilaku akun AWS Anda — ia tidak memblokir permintaan HTTP masuk. Shield Standar tidak menangani serangan lapisan aplikasi.

**Mengapa bukan D?** Botnet menggunakan ribuan alamat IP dari sumber terdistribusi. Memblokir rentang tertentu adalah pendekatan "potong-tebang" yang gagal melawan botnet canggih.

*SAA-C03 Domain: Desain Arsitektur yang Aman — Tugas 1.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang mempertimbangkan model ancaman mereka saat mereka bersiap untuk menangani data kartu kredit. Tinjauan kepatuhan PCI-DSS memerlukan:

- Perlindungan terhadap serangan DDoS lapisan jaringan
- Penyaringan lapisan aplikasi untuk eksploitasi web yang diketahui
- Pencatatan semua panggilan API ke penyimpanan jangka panjang yang tahan terhadap perubahan
- Deteksi pola akses yang tidak biasa ke layanan pembayaran

Petakan setiap persyaratan ke layanan AWS atau konfigurasi tertentu. Apakah Shield Standar sudah cukup, atau konteks PCI-DSS menyarankan Tingkat Lanjut? Di mana Anda akan melampirkan WAF?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk mempraktikkan pemetaan persyaratan kepatuhan ke layanan AWS.)*

## Adegan Pasca Kredit

GuardDuty telah diaktifkan.

Empat puluh delapan jam kemudian, ia menghasilkan temuan pertamanya: *"Instansi EC2 i-0abc123 berkomunikasi dengan node keluar Tor yang diketahui."*

Leo melihat ID instansi.

"Itu instansi pemantauan internal," katanya. "Yang satu yang saya atur untuk menjalankan diagnostik jaringan."

"Apakah seharusnya berkomunikasi dengan node keluar Tor?"

"Tidak." Dia berhenti sejenak. "Mengapa mereka melakukannya?"

Dia membuka instansi. Seseorang telah memasang alat di dalamnya — sebuah alat pemindaian jaringan sumber terbuka yang sah, yang, ternyata, juga berkomunikasi dengan infrastruktur Tor untuk pengumpulan data anonim.

"Jadi alat itu menelepon rumah," kata Priya.

"Tanpa sepengetahuan saya," konfirmasi Leo.

"Ini adalah risiko rantai pasokan. Ketergantungan yang melakukan hal-hal yang tidak Anda otorisasi."

Leo menginstal alat tersebut. Dia menyiapkan proses untuk meninjau setiap alat pihak ketiga sebelum instalasi.

"Apakah ini tingkat paranoia yang kita hadapi sekarang?" tanya Maya.

"Ya," kata Priya.

"Apakah ini tingkat yang seharusnya kita selalu hadapi?" tanya Maya.

"Juga ya," kata Priya.

Dalam bab berikutnya: apa yang terjadi ketika pusat data di Virginia menghilang — dan mengapa Nimbus tetap berjalan.
