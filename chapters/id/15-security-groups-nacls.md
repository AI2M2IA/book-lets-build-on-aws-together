# Bab 15: Para Penjaga di Gerbang

Kantor sepi pada suatu Selasa pagi ketika Priya membuka VPC flow logs dan mulai membaca. Di luar jendela, kota mulai bangun. Di dalam, layar menunjukkan sesuatu yang seharusnya tidak ada di sana: koneksi keluar dari instans EC2 pada pukul 2:17 dini hari ke alamat IP di Rumania.

Deploy key lama dari versi pertama Nimbus masih aktif. Ia telah melakukan tiga panggilan API minggu lalu. Leo tidak tahu apa yang membuatnya.

---

*Perombakan IAM telah menggantikan access key dengan role. Setiap layanan sekarang memiliki persis izin yang dibutuhkannya. Tetapi sementara pekerjaan itu berlangsung, masalah yang lebih lama diam-diam memburuk: sebuah kredensial aktif dari pipeline deployment yang telah dinonaktifkan masih hidup, dan sesuatu telah menggunakannya. Lapisan IAM telah diperkuat. Kontrol jaringan yang mungkin telah membendung kerusakan membutuhkan perhatian yang sama.*

---

Priya menarik VPC flow logs — catatan lalu lintas jaringan yang menunjukkan setiap koneksi masuk dan keluar dari VPC.

"Pada Selasa pukul 2:17 dini hari," katanya, "ada koneksi keluar dari instans EC2 yang menjalankan API lama ke alamat IP di Rumania."

"Itu bukan infrastruktur kita," kata Leo.

"Bukan."

"Jadi seseorang ada di instans EC2 kita."

"Atau sesuatu."

Mereka menelusurinya kembali: deploy key lama telah digunakan untuk mengunggah skrip kecil ke instans EC2. Skrip itu telah mencoba memindai port di server-server yang berdekatan. Sebagian besar pemindaian telah gagal.

"Aku sudah men-deploy-nya — oh." Leo telah men-deploy perbaikan pada aturan security group sebelum investigasi selesai. Perbaikannya benar, tetapi ia melakukannya sebelum Priya selesai membaca flow logs. Ia harus berhenti dan memverifikasi bahwa perubahan itu tidak memengaruhi apa pun yang tidak terduga.

"Lain kali, tunggu sampai investigasi ditutup sebelum mendorong perubahan," katanya.

"Security group memblokir mereka," kata Priya. "Penyerang berhasil masuk ke satu instans EC2. Mereka tidak bisa menjangkau yang lain karena security group hanya mengizinkan lalu lintas dari load balancer."

"Jadi kerusakannya terbendung."

"Karena kita telah mengonfigurasi security group dengan benar. Bayangkan jika kita membiarkan port 5432 terbuka untuk instans EC2 mana pun di akun."

Leo tidak perlu membayangkan. Ia pernah melihat konfigurasi itu di pengaturan awal.

"Apakah kita sudah memikirkan apa artinya itu?" Priya melanjutkan. "Instans EC2 mana pun di akun — termasuk yang memiliki kunci yang dikompromikan — bisa terhubung langsung ke database. Menjalankan SQL sembarang. Mengunduh riwayat pesanan setiap pelanggan. Menghapus tabel."

"Sebaliknya mereka ditolak setiap kali mencoba," kata Leo.

"Ya. Karena security group database hanya menerima koneksi dari security group API. Bukan dari EC2 mana pun di akun. Bukan dari IP mana pun. Secara spesifik dari security group API."

"Satu keputusan desain itu," kata Maya, "adalah perbedaan antara insiden yang terbendung dan pelanggaran data penuh."

"Desain security group bukan kotak centang," kata Priya. "Itu adalah keamanan sistem yang sebenarnya."

Rafael sudah mendengarkan. "Bagaimana Anda belajar apa konfigurasi yang benar? Aturannya tampak sembarang pada awalnya."

"Anda mulai dengan mendaftar apa yang perlu dilakukan setiap komponen," kata Priya. "Load balancer perlu menerima HTTPS dari mana saja. Server API perlu menerima HTTP hanya dari load balancer. Database perlu menerima PostgreSQL hanya dari server API. Redis perlu menerima port 6379 hanya dari server API. Persyaratan itu memetakan langsung ke aturan masuk. Semua yang lain ditolak secara default."

"Dan keluar?"

"Keluar adalah tempat orang menjadi malas. Sebagian besar tim membiarkan keluar sebagai allow-all. Itu berarti instans yang dikompromikan dapat memanggil apa pun. Kita akan memperketatnya."

**Dua Lapisan Keamanan Jaringan**

Dalam sebuah VPC, Anda memiliki dua alat berbeda untuk mengontrol lalu lintas jaringan:

**Security Group**: Firewall virtual yang dilampirkan ke sumber daya individual (instans EC2, database RDS, load balancer, fungsi Lambda dalam VPC). Mereka beroperasi di level sumber daya.

**Network ACL (NACL)**: Aturan firewall yang dilampirkan ke subnet. Mereka beroperasi di batas subnet — sebelum lalu lintas mencapai sumber daya mana pun di subnet itu.

Memahami keduanya membutuhkan pemahaman satu perbedaan kritis: **stateful vs stateless**.

**Stateful: Security Group**

Sebuah security group bersifat **stateful**.

Ketika Anda mengizinkan lalu lintas masuk pada port tertentu, lalu lintas respons otomatis diizinkan keluar, bahkan jika tidak ada aturan keluar eksplisit untuknya.

Ketika Anda mengizinkan lalu lintas keluar ke suatu tujuan, respons yang kembali masuk otomatis diizinkan.

Bayangkan seorang penjaga keamanan stateful di gedung perkantoran. Anda menunjukkan lencana untuk masuk. Anda keluar nanti. Penjaga tidak perlu memeriksa Anda lagi saat keluar — sistem tahu Anda telah diizinkan masuk, dan Anda boleh keluar.

**Aturan Security Group untuk instans EC2 API Nimbus:**

- **Masuk — TCP 8080 — dari SG Load Balancer** → Terima lalu lintas API dari ALB
- **Masuk — TCP 22 — dari SG Bastion Host** → SSH hanya dari bastion
- **Keluar — TCP 5432 — ke SG RDS** → Terhubung ke PostgreSQL
- **Keluar — TCP 6379 — ke SG ElastiCache** → Terhubung ke Redis
- **Keluar — TCP 443 — ke 0.0.0.0/0** → HTTPS ke API eksternal

Perhatikan: tidak ada aturan keluar eksplisit untuk port 8080. Aturan masuk bersifat stateful — lalu lintas respons (balasan API ke load balancer) otomatis diizinkan.

Perhatikan juga: aturan security group merujuk *security group lain*, bukan alamat IP. "Izinkan masuk dari security group load balancer" berarti "izinkan lalu lintas dari sumber daya mana pun yang memiliki security group ini terlampir." Ini lebih fleksibel dan dapat dipelihara daripada melacak alamat IP.

**Perilaku default:**

- Secara default, semua lalu lintas masuk ditolak
- Secara default, semua lalu lintas keluar diizinkan
- Semua aturan dievaluasi (security group tidak memiliki aturan berurutan — semua aturan yang cocok berlaku)
- Security group hanya dapat **mengizinkan** lalu lintas — Anda tidak dapat membuat aturan deny eksplisit

**Stateless: Network ACL**

Sebuah NACL bersifat **stateless**.

Ketika Anda mengizinkan lalu lintas masuk pada port 8080, itu hanya mencakup masuk. Respons (lalu lintas keluar pada port ephemeral) harus diizinkan secara eksplisit dengan aturan keluar.

Bayangkan sebuah detektor logam. Anda melewatinya saat masuk. Detektor logam tidak tahu Anda sudah melewatinya — Anda harus melewatinya lagi saat keluar.

**Aturan NACL diberi nomor dan dievaluasi secara berurutan.** Aturan pertama yang cocok menang. Aturan 100 dievaluasi sebelum aturan 200. Jika aturan 100 menolak lalu lintas dan aturan 200 mengizinkannya, lalu lintas ditolak.

NACL dapat secara eksplisit **menolak** lalu lintas — tidak seperti security group, yang hanya dapat mengizinkan. Ini membuatnya berguna untuk memblokir rentang IP tertentu.

**Perilaku NACL default:**

- NACL default (dibuat bersama VPC Anda) mengizinkan semua lalu lintas masuk dan keluar
- NACL kustom menolak semua lalu lintas secara default (Anda harus secara eksplisit mengizinkan apa yang Anda inginkan)

**NACL untuk subnet publik (disederhanakan):**

*Aturan masuk (dievaluasi berurutan — cocok pertama menang):*

- Aturan 100: TCP 443, dari 0.0.0.0/0 → **Allow** (HTTPS)
- Aturan 110: TCP 80, dari 0.0.0.0/0 → **Allow** (HTTP)
- Aturan 120: TCP 1024–65535, dari 0.0.0.0/0 → **Allow** (port balik ephemeral)
- Aturan \*: Semua lalu lintas → **Deny**

*Aturan keluar:*

- Aturan 100: TCP 443, ke 0.0.0.0/0 → **Allow** (HTTPS)
- Aturan 110: TCP 80, ke 0.0.0.0/0 → **Allow** (HTTP)
- Aturan 120: TCP 1024–65535, ke 0.0.0.0/0 → **Allow** (port balik ephemeral)
- Aturan \*: Semua lalu lintas → **Deny**

Aturan 120 (port 1024-65535) mengizinkan port ephemeral — port bernomor tinggi sementara yang digunakan untuk lalu lintas respons TCP. Karena NACL bersifat stateless, Anda harus secara eksplisit mengizinkan ini keluar, atau respons server Anda tidak akan tembus.

**Kapan Menggunakan yang Mana**

"Tunggu — tetapi *mengapa* kita melakukannya seperti itu?" tanya Maya. "Mengapa memiliki dua alat terpisah — security group *dan* NACL — jika security group sudah berfungsi? Apa gunanya kompleksitas ekstra?"

Jawabannya adalah bahwa mereka beroperasi di level yang berbeda dan memiliki kemampuan yang berbeda. Security group melindungi sumber daya individual dan hanya dapat mengizinkan lalu lintas. NACL melindungi seluruh subnet dan dapat secara eksplisit menolak. Memiliki keduanya berarti Anda dapat menerapkan aturan allow yang halus di level sumber daya dan aturan deny yang luas di level subnet — tanpa yang satu mengganggu yang lain.

Gunakan **security group** untuk lapisan utama kontrol akses. Mereka lebih mudah dikelola, stateful (lebih kecil kemungkinan pemblokiran tidak sengaja karena lupa port ephemeral), dan mendukung perujukan security group lain.

Gunakan **NACL** untuk kontrol level subnet, terutama:

- **Aturan deny eksplisit**: Blokir alamat IP atau rentang tertentu agar tidak menjangkau seluruh subnet
- **Pemblokiran darurat**: Sebuah IP secara aktif menyerang — tambahkan aturan deny NACL untuk memblokir seluruh subnet sebelum ia mencapai sumber daya mana pun

Anda mungkin bertanya-tanya: jika security group bersifat stateful dan memblokir semua masuk secara default, kapan Anda benar-benar membutuhkan NACL? Security group menangani sebagian besar kasus dengan baik. Tetapi ada satu hal yang tidak bisa mereka lakukan: menolak secara eksplisit. Security group hanya dapat mengizinkan lalu lintas — jika aturan tidak cocok, lalu lintas ditolak secara default. Anda tidak dapat menambahkan aturan yang mengatakan "blokir IP tertentu ini." Untuk itu, Anda membutuhkan NACL: aturan deny bernomor yang menghentikan rentang alamat tertentu sebelum mencapai sumber daya mana pun di subnet. NACL paling berguna untuk respons darurat (memblokir penyerang aktif) dan untuk menegakkan batas level subnet yang tidak boleh bergantung pada konfigurasi sumber daya individual.

"Jadi security group adalah kontrol yang halus," kata Maya, "dan NACL adalah sapuan lebar?"

"Security group melindungi sumber daya individual," konfirmasi Priya. "NACL melindungi seluruh subnet. Ketika Anda ingin memblokir IP agar tidak menjangkau apa pun di jaringan Anda, NACL. Ketika Anda ingin mengizinkan hanya load balancer untuk menjangkau server API, security group."

"Apakah kita sudah memikirkan apa yang terjadi jika penyerang kembali dengan IP yang berbeda?" kata Priya. "NACL memblokir satu rentang. Mereka beralih ke yang lain."

"Itulah gunanya GuardDuty," kata Leo. "Deteksi perilaku. Jika skrip yang sama berjalan dari IP baru, pola lalu lintasnya terlihat sama."

"Kita akan sampai ke sana," kata Priya. "Yang pertama dulu."

"Berapa biaya semua ini per bulan?" tanya Tom.

Security group dan NACL itu sendiri gratis. AWS tidak mengenakan biaya untuk jumlah security group, jumlah aturan, atau jumlah entri NACL. Pertimbangan biayanya tidak langsung: aturan keluar security group yang lebih ketat dapat merutekan lebih sedikit lalu lintas melalui NAT Gateway, mengurangi biaya pemrosesan data.

"Jadi kontrol keamanannya gratis," kata Rafael. "Biayanya adalah infrastruktur yang mendukungnya."

"Benar. NAT Gateway untuk ketersediaan tinggi. Interface VPC Endpoint untuk layanan yang jika tidak akan melalui NAT. Itu memiliki biaya. Aturan security group itu sendiri tidak."

**Menyatukannya: Pertahanan Berlapis**

Setelah insiden, Priya menggambar lapisan pertahanan Nimbus di papan tulis:

```
Internet
  ↓
CloudFront + Shield (penyerapan DDoS)
  ↓
WAF (penyaringan lapisan aplikasi)
  ↓
Internet Gateway
  ↓
NACL pada subnet publik (aturan level subnet, pemblokiran darurat)
  ↓
Security Group ALB (HTTPS dari mana saja)
  ↓
NACL pada subnet aplikasi privat
  ↓
Security Group API EC2 (port 8080 hanya dari SG ALB)
  ↓
NACL pada subnet data privat
  ↓
Security Group RDS (port 5432 hanya dari SG API)
```

"Setiap lapisan berasumsi yang sebelumnya mungkin gagal," katanya. "Database tidak percaya bahwa lapisan jaringan menghentikan penyerang. Instans EC2 tidak percaya bahwa ALB menghentikan penyerang. Setiap lapisan menegakkan aturannya sendiri secara independen."

"Defense in depth," kata Maya.

"Defense in depth. Penyerang yang berhasil melewati satu lapisan masih menghadapi yang berikutnya. Tidak ada satu kesalahan konfigurasi yang katastropik. Itu berarti satu lapisan gagal, dan yang lain bertahan."

Leo melihat diagramnya. Penyerang telah mengkompromikan satu instans EC2. Mereka telah melewati lapisan kredensial. Tetapi setiap lapisan berikutnya telah bertahan.

Itulah seperti apa defense in depth dalam praktik.

**Insiden: Apa yang Ditangkap Lapisan-lapisan**

Kembali ke serangan IP Rumania:

**Apa yang terjadi**: Penyerang menggunakan deploy key yang dikompromikan untuk mengunggah skrip pemindai ke satu instans EC2. Skrip itu mencoba terhubung ke layanan lain.

**Apa yang menghentikan mereka**:

- Security group RDS hanya mengizinkan masuk pada port 5432 dari security group API EC2. Skrip tidak bisa menjangkau database dari alat pemindai — ia tidak melampirkan security group yang tepat.
- Security group ElastiCache hanya mengizinkan masuk pada port 6379 dari security group API EC2.
- Instans EC2 lain hanya mengizinkan SSH dari security group bastion host.

**Apa yang tidak menghentikan mereka**:

- Aturan keluar instans EC2 mengizinkan HTTPS ke 0.0.0.0/0 (dibutuhkan untuk unduhan paket). Skrip menggunakan ini untuk membuat koneksi keluar ke server penyerang.

Setelah insiden, Priya menambahkan:

- Aturan NACL yang memblokir rentang IP Rumania
- Aturan keluar yang lebih membatasi pada instans EC2 (hanya mengizinkan tujuan tertentu yang diketahui baik)
- Pemeriksaan bahwa **IMDSv2 ditegakkan** (`HttpTokens=required`) pada setiap instans — skrip telah berjalan *di* instans, yang berarti ia bisa saja mengkueri layanan metadata untuk kredensial sementara role instans. IMDSv2 telah diaktifkan kembali di Bab 4; Priya memverifikasi ia masih diperlukan di mana saja, karena penyerang dengan eksekusi kode ditambah IMDSv1 sama dengan kredensial AWS yang dicuri.

---

**Membaca Flow Logs: Apa yang Priya Lihat**

Investigasi dimulai dengan VPC flow logs. Priya membuka CloudWatch Logs Insights dan menjalankan kueri terhadap grup flow log untuk 48 jam terakhir:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` adalah instans EC2 yang dikompromikan. Filter REJECT menunjukkan upaya koneksi yang telah diblokir.

Hasilnya:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Instans EC2 lain — SSH diblokir
10.0.10.7 → 10.0.10.9  port 22    REJECT   # EC2 lain — SSH diblokir
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — diblokir security group
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # Replika RDS — diblokir
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — diblokir
```

Pemindaian telah menghantam setiap layanan internal. Setiap upaya telah ditolak. Desain security group telah bertahan.

Tetapi ada juga entri keluar ACCEPT:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 byte
```

Itu adalah upaya eksfiltrasi data — 2,8 kilobyte dikirim ke IP Rumania melalui HTTPS. Security group mengizinkan HTTPS keluar untuk unduhan paket yang sah. Penyerang telah menggunakan aturan itu.

"Security group menghentikan pergerakan lateral," kata Priya, memandu tim melewati log. "Tetapi aturan keluarnya terlalu permisif. Kita mengizinkan HTTPS ke tujuan mana pun. Kita seharusnya mengizinkan HTTPS hanya ke endpoint AWS yang diketahui — CloudWatch, Secrets Manager, S3 — dan ke CDN repository paket."

Ia menunjukkan aturan keluar security group yang diperbarui:

```
TCP 443 → pl-63a5400a (prefix list S3 gateway endpoint AWS)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (repo paket AWS — menyempit seiring waktu)
```

"Itu menghilangkan aturan keluar HTTPS umum. HTTPS keluar sekarang hanya pergi ke tujuan yang diketahui baik."

"Bagaimana dengan fungsi Lambda yang memanggil API pihak ketiga?" tanya Leo.

"Itu melalui NAT Gateway, yang memiliki aturan keluar khusus tersendiri," kata Priya. "Lambda tidak menggunakan security group EC2. Network interface berbeda, set aturan berbeda."

---

**Kisah Debugging Stateless**

Dua minggu setelah insiden, Rafael — masih di bulan pertamanya — sedang membantu menyiapkan pipeline data baru. Itu melibatkan fungsi Lambda dalam VPC yang perlu memanggil API internal yang berjalan di EC2.

Fungsi Lambda time out. Setiap panggilan time out.

Rafael memeriksa security group. Security group Lambda memiliki aturan keluar untuk TCP 8080 ke security group EC2. Security group EC2 memiliki aturan masuk untuk TCP 8080 dari security group Lambda. Aturannya terlihat benar.

Ia berpaling ke Leo. "Security group-nya terlihat baik. Mengapa ia time out?"

Leo melihat konfigurasi subnet. Fungsi Lambda berada di subnet privat. Subnet itu memiliki NACL kustom yang telah Priya terapkan selama pengerasan keamanan.

Ia melihat aturan keluar NACL:

```
Rule 100: TCP 443  → 0.0.0.0/0  ALLOW
Rule 110: TCP 5432 → 10.0.20.0/24 ALLOW
Rule *:   All      → 0.0.0.0/0  DENY
```

"NACL mengizinkan HTTPS keluar dan PostgreSQL keluar," kata Leo. "Ia tidak mengizinkan TCP 8080 keluar."

"Security group mengizinkannya," kata Rafael.

"NACL tidak. Dan NACL bersifat stateless. Bahkan jika security group fungsi Lambda mengizinkan koneksi keluar, NACL di batas subnet tetap mengevaluasi lalu lintas keluar. NACL memblokir panggilan Lambda sebelum ia meninggalkan subnet."

"Tetapi jika aku menambahkan ALLOW untuk TCP 8080 keluar ke NACL—"

"Anda juga perlu menambahkan ALLOW untuk port ephemeral masuk," kata Leo. "Respons dari instans EC2 kembali pada port acak antara 1024 dan 65535. Jika aturan masuk NACL tidak mengizinkannya, respons diblokir pada perjalanan balik."

Rafael memperbarui NACL:

```
Rule 100:  TCP 443       → 0.0.0.0/0      ALLOW  (keluar)
Rule 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (keluar ke subnet EC2)
Rule 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (keluar ke subnet DB)
Rule *:    All           → 0.0.0.0/0      DENY
```

Dan di sisi masuk:

```
Rule 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (lalu lintas balik dari EC2)
Rule *:    All                               DENY
```

Fungsi Lambda terhubung segera.

"Inilah mengapa orang membenci NACL," kata Rafael.

"Inilah mengapa Anda perlu memahaminya," kata Priya. "Bug yang mereka ciptakan adalah persis bug yang mereka dirancang untuk cegah — aliran lalu lintas yang tidak terduga. Memahami model stateless memberi tahu Anda persis di mana harus mencari ketika sebuah koneksi gagal secara misterius."

"Security group stateful — lalu lintas balik otomatis. NACL stateless — lalu lintas balik butuh aturan eksplisit," Rafael mengulang.

"Katakan itu sampai menjadi bagian dari cara Anda berpikir," kata Priya.

---

**Pemblokiran Darurat NACL: Aturan /24**

Setelah mengidentifikasi rentang IP sumber penyerang, respons Priya langsung: tambahkan aturan deny NACL.

Tetapi ia tidak memblokir hanya satu IP saja. Ia memblokir seluruh `/24` — subnet 256-alamat tempat penyerang beroperasi.

"Mengapa seluruh /24?" tanya Leo.

"Karena pemblokiran IP individual adalah permainan yang kalah. Penyerang menggunakan beberapa IP dalam suatu rentang, merotasinya ketika satu diblokir. Memblokir /24 membuatnya lebih sulit — mereka perlu beralih ke blok alamat yang berbeda, yang menghabiskan waktu dan upaya mereka."

Aturan NACL:

```
Rule 90:  ALL from 185.220.101.0/24 → DENY
```

Aturan 90 dievaluasi sebelum aturan allow mana pun (yang dimulai di aturan 100). Seluruh rentang diblokir sebelum aturan allow mana pun dipertimbangkan.

"Dan ini berlaku untuk setiap sumber daya di subnet?" tanya Leo.

"Setiap sumber daya. Itulah inti dari NACL — ia berlaku sebelum lalu lintas mencapai security group sumber daya individual mana pun. Sebuah deny NACL di aturan 90 berarti paket tidak pernah sampai ke evaluasi security group."

"Bisakah kita melakukan ini dengan security group saja?"

"Tidak. Security group hanya dapat mengizinkan lalu lintas. Tidak ada aturan deny. Jika Anda ingin memblokir IP tertentu agar tidak menjangkau sumber daya mana pun di subnet, NACL adalah satu-satunya opsi."

Ini adalah kasus penggunaan utama untuk aturan deny NACL: respons darurat terhadap serangan aktif. Security group adalah mekanisme kontrol utama. NACL adalah rem darurat.

---

**Pola Desain Security Group: Rujukan berdasarkan ID**

"Apakah kita sudah memikirkan apa yang terjadi ketika instans EC2 kita diganti?" tanya Priya. "Auto Scaling menghentikan instans lama dan meluncurkan yang baru. Instans baru mendapatkan alamat IP privat baru."

"Jika aturan security group merujuk alamat IP," kata Leo perlahan, "kita harus memperbarui aturan setiap kali sebuah instans diganti."

"Tepat sekali. Itulah mengapa Anda tidak merujuk alamat IP dalam aturan security group untuk lalu lintas intra-VPC."

Security group dapat merujuk security group lain alih-alih alamat IP. Ketika sebuah aturan mengatakan "izinkan masuk dari security group load balancer," itu berarti "izinkan lalu lintas dari sumber daya mana pun yang memiliki security group load balancer terlampir." Auto Scaling dapat meluncurkan seribu instans baru dengan IP baru masing-masing, dan aturan tetap valid.

Struktur security group Nimbus:

```
nimbus-alb-sg (Load Balancer)
  - Masuk: TCP 443 dari 0.0.0.0/0
  - Masuk: TCP 80 dari 0.0.0.0/0

nimbus-api-sg (instans API EC2)
  - Masuk: TCP 8080 dari nimbus-alb-sg
  - Masuk: TCP 22 dari nimbus-bastion-sg
  - Keluar: TCP 5432 ke nimbus-rds-sg
  - Keluar: TCP 6379 ke nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Masuk: TCP 5432 dari nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Masuk: TCP 6379 dari nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Masuk: TCP 22 dari <IP VPN kantor>
```

Tidak ada alamat IP untuk lalu lintas internal. Hanya ID security group. Ketika sebuah instans diganti, keanggotaan security group ditransfer secara otomatis ke instans baru.

"Dan untuk microservice yang kita rencanakan?" tanya Rafael. "Kita akan punya selusin layanan pada akhirnya. Masing-masing perlu berbicara dengan beberapa yang lain, tetapi tidak semua yang lain."

"Setiap layanan mendapat security group-nya sendiri," kata Priya. "Security group Layanan A dirujuk dalam aturan masuk setiap layanan yang diizinkan dipanggil Layanan A. Layanan yang tidak boleh berkomunikasi cukup tidak merujuk security group satu sama lain."

Ini adalah **pola security group hub-and-spoke** untuk microservice. Sebuah security group database bersama memiliki aturan masuk dari lima security group layanan yang berbeda. Jika layanan keenam membutuhkan akses database, Anda menambahkan security group-nya ke aturan masuk database. Jika akses harus dihapus, Anda menghapus rujukannya. Tidak ada manajemen IP. Tidak ada aturan basi yang menunjuk ke server yang telah dinonaktifkan.

"Security group adalah identitasnya," kata Priya. "Alamat IP adalah kebetulan penjadwalan."

---

**Firewall Least-Privilege: Disiplinnya**

"Apakah kita sudah memikirkan apa postur yang benar untuk aturan keluar?" tanya Priya selama tinjauan pasca-insiden.

Sebagian besar tim membiarkan aturan keluar security group EC2 pada default: izinkan semua keluar. Ini nyaman — aplikasi dapat memanggil apa pun — tetapi ini bukan least privilege.

Prinsip Priya: aturan keluar harus sespesifik aturan masuk.

Aturan keluar security group API Nimbus, setelah pengerasan:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL ke RDS)
TCP 6379 → nimbus-redis-sg     (Redis ke ElastiCache)
TCP 443  → prefix list s3.amazonaws.com    (S3 gateway endpoint)
TCP 443  → endpoint secretsmanager         (Secrets Manager)
TCP 443  → endpoint logs                   (CloudWatch Logs)
```

Tidak ada "izinkan semua keluar." Setiap tujuan disebutkan namanya.

"Ini banyak pemeliharaan," kata Leo.

"Ini lebih banyak pemeliharaan daripada allow-all," Priya mengakui. "Ini lebih sedikit pembersihan daripada pelanggaran data. Penyerang yang mengkompromikan instans EC2 bisa mengeksfiltrasi lebih banyak data jika aturan keluarnya terbuka. Mereka menggunakan aturan HTTPS-ke-mana-saja karena ia ada di sana."

"Dan dengan aturan keluar yang spesifik, bahkan instans yang dikompromikan hanya dapat mengirim data ke tujuan yang disetujui."

"Tepat sekali. Security group menjadi garis pertahanan terakhir, bukan hanya garis pertahanan pertama."

---

## Kekuatan dan Batasan

**Security Group**:

- Stateful (tidak ada sakit kepala port ephemeral)
- Dapat merujuk security group lain (lebih fleksibel daripada IP)
- Hanya aturan allow — tidak ada deny eksplisit
- Beroperasi di level sumber daya — granular
- Aturan berlaku segera — tanpa urutan, tanpa prioritas
- Beberapa security group dapat dilampirkan ke satu sumber daya — aturan dari semua digabungkan

**NACL**:

- Stateless (membutuhkan aturan eksplisit untuk kedua arah termasuk port ephemeral)
- Dapat menolak secara eksplisit — berguna untuk memblokir IP yang diketahui buruk
- Beroperasi di level subnet — sapuan lebih lebar
- Aturan bernomor dievaluasi berurutan — dapat diprediksi tetapi membutuhkan manajemen yang hati-hati
- Berlaku sebelum lalu lintas mencapai sumber daya mana pun di subnet — garis pertahanan pertama
- Efektif untuk pemblokiran IP darurat di seluruh subnet

**Di mana setiap alat cocok**:

Gunakan security group untuk segala sesuatu secara default. Tambahkan NACL ketika Anda membutuhkan aturan deny eksplisit — memblokir rentang IP, memblokir port di level subnet terlepas dari konfigurasi sumber daya individual, atau menegakkan bahwa sebuah subnet data tidak pernah dapat menerima lalu lintas dari sumber tertentu. NACL bukan pengganti security group; mereka adalah pelengkap untuk situasi di mana desain allow-only security group tidak cukup.

## Ringkasan

Insiden IP Rumania telah dibendung oleh kontrol keamanan yang sudah ada — bukan karena keberuntungan, tetapi karena desain. Security group telah mencegah pergerakan lateral dalam VPC. Setelah insiden, NACL menambahkan kemampuan untuk secara eksplisit memblokir rentang IP penyerang di batas subnet. VPC flow logs membuat serangan terlihat. Dua alat, dua lapisan, dua pekerjaan berbeda — dengan logging untuk membuktikan apa yang terjadi.

- **Security Group** adalah firewall virtual stateful untuk sumber daya individual. Hanya aturan allow. Semua aturan dievaluasi secara bersamaan.
- **NACL** adalah firewall stateless untuk seluruh subnet. Aturan allow dan deny. Aturan dievaluasi dalam urutan nomor — cocok pertama menang.
- **Stateful** berarti lalu lintas respons otomatis diizinkan. **Stateless** berarti Anda harus secara eksplisit mengizinkan lalu lintas di kedua arah, termasuk port balik ephemeral.
- Security group adalah lapisan kontrol akses utama Anda. NACL adalah override level subnet — terutama untuk pemblokiran darurat.
- Ketika NACL mengizinkan lalu lintas masuk, Anda juga harus mengizinkan port ephemeral keluar (1024-65535) agar respons TCP tembus.
- **Rujuk security group berdasarkan ID**, bukan alamat IP, untuk lalu lintas intra-VPC. Auto Scaling mengganti instans; keanggotaan security group ditransfer otomatis.
- **Aturan keluar yang spesifik** pada instans EC2 membatasi apa yang dapat dilakukan instans yang dikompromikan — firewall least-privilege.
- Gunakan flow logs untuk melihat apa yang sebenarnya dilakukan security group dan NACL. Aturan adalah teori. Log adalah bukti.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Aman (Domain 1, Tugas 1.2)*

- **Stateful vs stateless**: Perbedaan ini adalah konsep yang paling diuji dalam bab ini. Security group = stateful = respons diizinkan otomatis. NACL = stateless = harus secara eksplisit mengizinkan lalu lintas respons.
- **Aturan security group**: Tidak ada deny eksplisit. Ketika beberapa security group dilampirkan ke sebuah instans, union dari semua aturan berlaku. Semua aturan yang cocok dievaluasi secara bersamaan.
- **Urutan aturan NACL**: Aturan dievaluasi dari nomor terendah ke tertinggi. Aturan 100 sebelum 200. Cocok pertama menang. Aturan `*` (asterisk) di bagian bawah adalah deny implisit. Menambahkan aturan deny di aturan 90 memblokir sebelum aturan allow mana pun di 100.
- **Port ephemeral**: Kesalahan NACL klasik adalah lupa mengizinkan keluar pada port 1024-65535. Jika NACL Anda mengizinkan HTTP masuk (port 80) tetapi tidak mengizinkan port ephemeral keluar, pengguna dapat mengirim permintaan tetapi tidak pernah menerima respons. Ini adalah skenario ujian NACL yang paling umum.
- **Perujukan security group**: Anda dapat mengizinkan lalu lintas dari security group lain (bukan hanya IP). Ini adalah pola yang direkomendasikan untuk lalu lintas intra-VPC. Ujian sering menggunakan "izinkan masuk dari security group ALB" sebagai jawaban yang benar untuk membatasi akses EC2.
- **NACL default vs NACL kustom**: NACL default mengizinkan semua lalu lintas. NACL kustom (yang Anda buat) menolak semua lalu lintas secara default. Skenario ujian: "membuat NACL baru dan sekarang lalu lintas diblokir" → periksa aturan allow yang hilang.
- **Memblokir IP penyerang**: Security group tidak dapat memblokir IP tertentu (hanya allow). NACL dapat secara eksplisit menolak IP atau CIDR tertentu. Skenario ujian: "blokir IP tertentu agar tidak menjangkau sumber daya mana pun di subnet" → aturan deny NACL.
- **Men-debug kegagalan koneksi**: Periksa urutannya: security group pada sumber (keluar) → security group pada tujuan (masuk) → NACL pada subnet sumber (keluar + port ephemeral) → NACL pada subnet tujuan (masuk). Sebagian besar kegagalan koneksi ujian disebabkan oleh aturan keluar NACL yang hilang atau izin port ephemeral yang hilang.
- **Beberapa subnet dan NACL**: Satu NACL berlaku untuk semua subnet yang terasosiasi dengannya. Satu subnet hanya dapat diasosiasikan dengan satu NACL. Ujian mungkin menanyakan NACL mana yang harus diperbarui ketika lalu lintas subnet tertentu terpengaruh.

## Latihan

**Latihan 1 — Ingat**

Seorang developer menambahkan aturan masuk ke security group yang mengizinkan lalu lintas pada port 443. Apakah ia juga perlu menambahkan aturan keluar untuk mengizinkan respons server? Mengapa atau mengapa tidak?

Jika sebaliknya ia menambahkan aturan masuk ke NACL yang mengizinkan lalu lintas pada port 443, apakah ia perlu menambahkan aturan keluar? Mengapa atau mengapa tidak?

**Petunjuk**: Pikirkan kembali analogi bab ini — apakah masing-masing adalah penjaga keamanan yang ingat mengizinkan Anda masuk, atau detektor logam yang harus Anda lewati lagi saat keluar?

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan memiliki aplikasi web yang berjalan di instans EC2 di subnet publik. Aplikasi menerima lalu lintas HTTPS (port 443) dari internet. Pengguna melaporkan bahwa mereka dapat terhubung ke aplikasi tetapi tidak dapat menerima respons — permintaan menggantung dan time out.

Security group EC2 memiliki aturan masuk yang mengizinkan TCP 443 dari 0.0.0.0/0. NACL subnet memiliki aturan masuk (aturan 100) yang mengizinkan TCP 443 dari 0.0.0.0/0 dan aturan keluar (aturan 100) yang mengizinkan TCP 443 ke 0.0.0.0/0.

Apa penyebab yang PALING mungkin dari masalah ini?

A) Security group kehilangan aturan keluar untuk TCP 443  
B) Instans EC2 tidak memiliki alamat Elastic IP  
C) Security group kehilangan aturan masuk untuk port ephemeral  
D) NACL kehilangan aturan keluar yang mengizinkan port ephemeral (1024-65535)

**Petunjuk 1**: Security group bersifat stateful — mereka otomatis mengizinkan respons. NACL bersifat stateless — mereka tidak.

**Petunjuk 2**: Ketika peramban terhubung ke server web pada port 443, respons server kembali pada port ephemeral acak (1024-65535), bukan port 443.

**Petunjuk 3**: NACL memiliki aturan keluar untuk 443, tetapi respons tidak pergi ke port 443.

**Jawaban**: D

**Penjelasan**: NACL bersifat stateless. Ketika pengguna terhubung ke server pada port 443, respons TCP server kembali pada port ephemeral (dipilih acak dari 1024-65535). Aturan keluar NACL hanya mengizinkan port 443, jadi respons diblokir oleh aturan deny default. Menambahkan aturan keluar NACL yang mengizinkan TCP 1024-65535 akan memperbaikinya.

**Mengapa tidak A?** Security group bersifat stateful — lalu lintas respons otomatis diizinkan terlepas dari aturan keluar. Tidak ada aturan keluar security group yang dibutuhkan.

**Mengapa tidak B?** Elastic IP memengaruhi apakah instans memiliki IP publik, bukan apakah koneksi yang telah ditetapkan dapat menerima respons.

**Mengapa tidak C?** Port ephemeral adalah untuk lalu lintas respons keluar, bukan masuk. Koneksi masuk dari pengguna datang pada port 443, yang sudah diizinkan.

*SAA-C03 Domain: Desain Arsitektur Aman — Tugas 1.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Setelah serangan IP Rumania, Priya ingin mengimplementasikan dua kontrol tambahan:

1. Blokir seluruh rentang IP 185.0.0.0/8 agar tidak menjangkau sumber daya mana pun di subnet publik
2. Pastikan bahwa subnet privat yang berisi database tidak pernah dapat berkomunikasi dengan internet, bahkan jika seseorang salah mengonfigurasi security group

Alat mana yang akan Anda gunakan untuk setiap persyaratan, dan bagaimana Anda akan mengonfigurasinya? Bisakah Anda menggunakan security group untuk keduanya? Bisakah Anda menggunakan NACL untuk keduanya?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah memahami alat mana yang cocok untuk masalah mana.)*

## Adegan Pasca-Kredit

Insiden telah dibendung. Deploy key yang dikompromikan dinonaktifkan. Rentang IP Rumania diblokir di NACL. Skrip lama telah dihapus dari instans EC2.

Priya menulis laporan insiden. Ia membagikannya dengan tim.

Baris terakhir laporan: "Akar penyebab: sebuah kredensial aktif dari pipeline deployment yang dinonaktifkan tidak pernah dirotasi atau dicabut. Rekomendasi: rotasi kredensial otomatis dan audit rutin semua kredensial IAM."

Leo membacanya tiga kali.

"Aku seharusnya merotasi kunci itu," katanya.

"Ya," kata Priya.

"Bagaimana kita memastikan ini tidak terjadi lagi?"

"Otomasi," katanya. "Dan sesuatu yang mengawasi para pengawas."

Di bab berikutnya: kotak penyimpanan tempat Nimbus menyimpan rahasianya — dan rotasi yang membuat kunci yang dicuri tidak berguna.
