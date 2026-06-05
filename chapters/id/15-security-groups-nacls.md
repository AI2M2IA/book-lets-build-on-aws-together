# Babat 15: Para Pelindung di Gerbang

Kunci deploy lama dari versi pertama Nimbus masih aktif. Ia telah melakukan tiga panggilan API minggu lalu. Leo tidak tahu apa yang membuatnya.

Priya menarik log aliran VPC — catatan lalu lintas jaringan yang menunjukkan setiap koneksi masuk dan keluar dari VPC.

"Pada hari Selasa pukul 2:17 AM," katanya, "ada koneksi keluar dari instans EC2 yang menjalankan API lama ke alamat IP di Rumania."

"Itu bukan infrastruktur kami," kata Leo.

"Tidak."

"Jadi seseorang berada di instans EC2 kami."

"Atau sesuatu."

Mereka melacaknya kembali: kunci deploy lama telah digunakan untuk mengunggah skrip kecil ke instans EC2. Skrip tersebut mencoba memindai port pada server yang berdekatan. Sebagian besar pemindaian gagal.

"Grup keamanan memblokirnya," kata Priya. "Penyerang mendapatkan akses ke satu instans EC2. Mereka tidak dapat menjangkau yang lain karena grup keamanan hanya mengizinkan lalu lintas dari load balancer."

"Jadi kerusakan terkandung."

"Karena kami telah mengonfigurasi grup keamanan dengan benar. Bayangkan jika kami telah meninggalkan port 5432 terbuka ke setiap instans EC2 dalam akun."

Leo tidak perlu membayangkan. Dia telah melihat konfigurasi itu dalam pengaturan awal.

**Dua Lapisan Keamanan Jaringan**

Dalam VPC, Anda memiliki dua alat berbeda untuk mengendalikan lalu lintas jaringan:

**Grup Keamanan:** Firewall virtual yang melekat pada sumber daya individu (instans EC2, database RDS, load balancer, fungsi Lambda dalam VPC). Mereka beroperasi pada tingkat sumber daya.

**Network ACL (NACL):** Aturan firewall yang melekat pada subnet. Mereka beroperasi pada batas subnet — sebelum lalu lintas mencapai sumber daya mana pun dalam subnet tersebut.

Memahami keduanya membutuhkan pemahaman tentang perbedaan kritis: **berkeadaan vs tidak berkeadaan**.

**Berkeadaan: Grup Keamanan**

Sebuah grup keamanan adalah **berkeadaan**.

Ketika Anda mengizinkan lalu lintas masuk pada port tertentu, lalu lintas respons secara otomatis diizinkan keluar, bahkan jika tidak ada aturan keluar eksplisit untuknya.

Ketika Anda mengizinkan lalu lintas keluar ke tujuan, lalu lintas yang kembali secara otomatis diizinkan.

Bayangkan seorang penjaga negara di gedung perkantoran. Anda menunjukkan kartu identitas Anda untuk masuk. Anda berjalan keluar nanti. Penjaga tidak perlu memeriksa Anda lagi saat keluar — sistem mengetahui Anda telah diizinkan masuk, dan Anda diizinkan untuk pergi.

**Aturan Grup Keamanan untuk instans EC2 API Nimbus:**

- **Masuk — TCP 8080 — dari SG Load Balancer** → Terima lalu lintas API dari ALB
- **Masuk — TCP 22 — dari SG Bastion Host** → SSH dari bastion hanya
- **Keluar — TCP 5432 — ke SG RDS** → Terhubung ke PostgreSQL
- **Keluar — TCP 6379 — ke SG ElastiCache** → Terhubung ke Redis
- **Keluar — TCP 443 — ke 0.0.0.0/0** → HTTPS ke API eksternal

Perhatikan: tidak ada aturan keluar eksplisit untuk port 8080. Aturan masuk bersifat berkeadaan — lalu lintas respons (balasan API ke load balancer) diizinkan secara otomatis.

Perhatikan juga: aturan grup keamanan merujuk ke *grup keamanan lain*, bukan alamat IP. "Izinkan masuk dari grup keamanan load balancer" berarti "izinkan lalu lintas dari setiap sumber daya yang memiliki grup keamanan ini melekat." Ini lebih fleksibel dan mudah dipelihara daripada melacak alamat IP.

**Perilaku Default:**

- Secara default, semua lalu lintas masuk ditolak
- Secara default, semua lalu lintas keluar diizinkan
- Semua aturan dievaluasi (grup keamanan tidak memiliki aturan yang diurutkan — semua aturan yang cocok diterapkan)
- Grup keamanan hanya dapat **mengizinkan** lalu lintas — Anda tidak dapat membuat aturan penolakan eksplisit

**Tidak Berkeadaan: Network ACL**

Sebuah NACL adalah **tidak berkeadaan**.

Ketika Anda mengizinkan lalu lintas masuk pada port 8080, itu hanya mencakup lalu lintas masuk. Lalu lintas respons (lalu lintas keluar ke port ephemera) harus diizinkan secara eksplisit dengan aturan keluar.

Bayangkan detektor logam. Anda melewati itu saat masuk. Detektor logam tidak tahu Anda telah melewati — Anda harus melewati lagi saat keluar.

**Aturan NACL dinomori dan dievaluasi dalam urutan.** Aturan pertama yang cocok menang. Aturan 100 dievaluasi sebelum aturan 200. Jika aturan 100 menolak lalu lintas dan aturan 200 mengizinkannya, lalu lintas ditolak.

NACL dapat secara eksplisit **menolak** lalu lintas — tidak seperti grup keamanan, yang hanya dapat mengizinkan. Ini membuatnya berguna untuk memblokir rentang IP tertentu.

**Perilaku Default NACL:**

- NACL default (dibuat dengan VPC Anda) mengizinkan semua lalu lintas masuk dan keluar
- NACL khusus menolak semua lalu lintas secara default (Anda harus mengizinkan apa yang Anda inginkan)

**NACL untuk subnet publik (disimplifikasi):**

*Aturan Masuk (dievaluasi dalam urutan — kecocokan pertama menang):*

- Aturan 100: TCP 443, dari 0.0.0.0/0 → **Izinkan** (HTTPS)
- Aturan 110: TCP 80, dari 0.0.0.0/0 → **Izinkan** (HTTP)
- Aturan 120: TCP 1024–65535, dari 0.0.0.0/0 → **Izinkan** (port ephemera kembali)
- Aturan \*: Semua lalu lintas → **Tolak**

*Aturan Keluar:*

- Aturan 100: TCP 443, ke 0.0.0.0/0 → **Izinkan** (HTTPS)
- Aturan 110: TCP 80, ke 0.0.0/0 → **Izinkan** (HTTP)
- Aturan 120: TCP 1024–65535, ke 0.0.0.0/0 → **Izinkan** (port ephemera kembali)
- Aturan \*: Semua lalu lintas → **Tolak**

Aturan 120 (port 1024-65535) mengizinkan port ephemera — port nomor tinggi sementara yang digunakan untuk lalu lintas TCP respons. Karena NACL tidak berkeadaan, Anda harus secara eksplisit mengizinkan ini keluar, atau respons server Anda tidak akan dapat melewati.

**Kapan Menggunakan yang Mana**

```markdown
Gunakan **group keamanan** sebagai lapisan akses kontrol utama. Mereka lebih mudah dikelola, bersifat stateful (kemungkinan lebih kecil untuk pemblokiran tidak sengaja karena melupakan port ephemeris), dan mendukung referensi ke grup keamanan lainnya.

Gunakan **NACLs** untuk kontrol pada tingkat subnet, terutama:

- **Aturan penolakan eksplisit**: Memblokir alamat IP atau rentang tertentu untuk mencapai seluruh subnet
- **Pemblokiran darurat**: IP secara aktif menyerang—tambahkan aturan penolakan NACL untuk memblokir seluruh subnet sebelum mencapai sumber daya mana pun

“Jadi, grup keamanan adalah kontrol tingkat halus,” kata Maya, “dan NACL adalah sapuan lebar?”

“Grup keamanan melindungi sumber daya individu,” konfirmasi Priya. “NACL melindungi seluruh subnet. Saat Anda ingin memblokir IP dari mencapai apa pun di jaringan Anda, NACL. Saat Anda ingin mengizinkan hanya load balancer untuk mencapai server API, grup keamanan.”

**Insiden: Apa yang Ditangkap oleh Lapisan**

Kembali ke serangan IP Rumania:

**Apa yang terjadi**: Penyerang menggunakan kunci deploy yang terkompromi untuk mengunggah skrip pemindaian ke satu instansi EC2. Skrip mencoba terhubung ke layanan lain.

**Apa yang menghentikannya**:

- Grup keamanan RDS hanya mengizinkan masuk pada port 5432 dari grup keamanan EC2 API. Skrip tidak dapat menjangkau database dari alat pemindaian—itu tidak melampirkan grup keamanan yang benar.
- Grup keamanan ElastiCache hanya mengizinkan masuk pada port 6379 dari grup keamanan EC2 API.
- Instansi EC2 lainnya hanya mengizinkan SSH dari grup keamanan host bastion.

**Apa yang tidak menghentikannya**:

- Aturan keluar instansi EC2 mengizinkan HTTPS ke 0.0.0.0/0 (diperlukan untuk unduhan paket). Skrip menggunakan ini untuk membuat koneksi keluar ke server penyerang.

Setelah insiden, Priya menambahkan:

- Aturan NACL yang memblokir rentang IP Rumania
- Aturan keluar yang lebih ketat pada instansi EC2 (hanya mengizinkan tujuan yang diketahui baik)

## Kekuatan dan Batasan

**Grup Keamanan**:

- Stateful (tidak ada masalah port ephemeris)
- Dapat merujuk ke grup keamanan lainnya (lebih fleksibel daripada IP)
- Hanya mengizinkan aturan—tidak ada penolakan eksplisit
- Beroperasi pada tingkat sumber daya—granular

**NACLs**:

- Stateless (memerlukan aturan eksplisit untuk kedua arah, termasuk port ephemeris)
- Dapat secara eksplisit menolak—berguna untuk memblokir IP yang diketahui buruk
- Beroperasi pada tingkat subnet—sapuan lebar
- Aturan bernomor dievaluasi dalam urutan—prediktabel tetapi memerlukan manajemen yang cermat

## Ringkasan

- **Grup Keamanan** adalah firewall virtual stateful untuk sumber daya individu. Hanya mengizinkan aturan. Semua aturan dievaluasi.
- **NACLs** adalah firewall stateless untuk seluruh subnet. Mengizinkan dan aturan penolakan. Aturan dievaluasi dalam urutan numerik.
- **Stateful** berarti lalu lintas respons secara otomatis diizinkan. **Stateless** berarti Anda harus secara eksplisit mengizinkan lalu lintas dalam kedua arah.
- Grup keamanan adalah lapisan kontrol akses utama Anda. NACLs adalah lapisan tambahan untuk kontrol tingkat subnet dan penolakan eksplisit.
- Saat NACL mengizinkan lalu lintas masuk, Anda juga harus mengizinkan port ephemeris keluar (1024-65535) untuk lalu lintas respons untuk melewati.
- Grup keamanan dapat merujuk ke grup keamanan lainnya—mengizinkan lalu lintas dari grup keamanan load balancer lebih mudah dipelihara daripada melacak alamat IP.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Keamanan (Domain 1, Tugas 1.2)*

- **Stateful vs stateless**: Konsep ini yang paling sering diuji dalam bab ini. Grup keamanan = stateful = lalu lintas respons diizinkan secara otomatis. NACLs = stateless = harus secara eksplisit mengizinkan lalu lintas respons.
- **Aturan grup keamanan**: Tidak ada penolakan eksplisit. Saat beberapa grup keamanan terpasang ke sebuah instansi, gabungan semua aturan berlaku. Semua aturan yang cocok dievaluasi.
- **Urutan aturan NACL**: Aturan dievaluasi dari nomor terendah hingga tertinggi. Aturan 100 sebelum 200. Poin bintang (*) (asterisk) di bagian bawah adalah aturan penolakan implisit.
- **Port ephemeris**: Kesalahan NACL klasik adalah melupakan untuk mengizinkan keluar pada port 1024-65535. Jika NACL Anda mengizinkan lalu lintas masuk HTTP (port 80) tetapi tidak mengizinkan port ephemeris keluar, pengguna dapat mengirim permintaan tetapi tidak pernah menerima respons.
- **Referensi grup keamanan**: Anda dapat mengizinkan lalu lintas dari grup keamanan lainnya—bukan hanya alamat IP. Ini adalah pola yang direkomendasikan untuk lalu lintas intra-VPC.
- **NACL default vs custom NACL**: NACL default mengizinkan semua lalu lintas. NACL kustom (satu yang Anda buat) menolak semua lalu lintas secara default. Skenario ujian: "membuat NACL baru dan sekarang lalu lintas diblokir" → periksa aturan izinkan yang hilang.

## Latihan

**Latihan 1 — Ingat**

Seorang pengembang menambahkan aturan masuk ke grup keamanan yang mengizinkan lalu lintas pada port 443. Apakah dia juga perlu menambahkan aturan keluar untuk mengizinkan respons server? Mengapa atau mengapa tidak?

Jika sebagai gantinya dia menambahkan aturan masuk ke NACL yang mengizinkan lalu lintas pada port 443, apakah dia perlu menambahkan aturan keluar? Mengapa atau mengapa tidak?

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan memiliki aplikasi web yang berjalan pada instansi EC2 dalam subnet publik. Aplikasi menerima lalu lintas HTTPS (port 443) dari internet. Pengguna melaporkan bahwa mereka dapat terhubung ke aplikasi tetapi tidak dapat menerima respons—permintaan menggantung dan waktu habis.
```

```markdown
# EC2 Keamanan Grup dan NACL

Grup Keamanan EC2 memiliki aturan masuk (inbound) yang mengizinkan TCP 443 dari 0.0.0.0/0. Subnet memiliki NACL (Network Access Control List) dengan aturan masuk (rule 100) yang mengizinkan TCP 443 dari 0.0.0.0/0 dan aturan keluar (outbound) (rule 100) yang mengizinkan TCP 443 ke 0.0.0.0/0.

Apa penyebab paling mungkin dari masalah ini?

A) Grup Keamanan tidak memiliki aturan keluar (outbound) untuk TCP 443
B) NACL tidak memiliki aturan keluar (outbound) yang mengizinkan port ephemera (1024-65535)
C) Grup Keamanan tidak memiliki aturan masuk (inbound) untuk port ephemera
D) Instans EC2 tidak memiliki Elastic IP address

**Petunjuk 1**: Grup Keamanan bersifat *stateful* — mereka secara otomatis mengizinkan respons. NACL bersifat *stateless* — mereka tidak.

**Petunjuk 2**: Ketika browser terhubung ke server web pada port 443, lalu lintas respons server kembali pada port ephemera acak (1024-65535), bukan port 443.

**Petunjuk 3**: NACL memiliki aturan keluar (outbound) untuk 443, tetapi respons tidak pergi ke port 443.

**Jawaban**: B

**Penjelasan**: NACL bersifat *stateless*. Ketika pengguna terhubung ke server pada port 443, lalu lintas TCP respons server kembali pada port ephemera (yang dipilih secara acak dari 1024-65535). Aturan keluar (outbound) NACL hanya mengizinkan port 443, sehingga respons diblokir oleh aturan deny default. Menambahkan aturan keluar (outbound) NACL yang mengizinkan TCP 1024-65535 akan memperbaiki ini.

**Mengapa tidak A?** Grup Keamanan bersifat *stateful* — lalu lintas respons diizinkan secara otomatis terlepas dari aturan keluar (outbound) apa pun. Tidak diperlukan aturan keluar (outbound) pada Grup Keamanan.

**Mengapa tidak C?** Port ephemera digunakan untuk lalu lintas respons keluar, bukan untuk lalu lintas masuk. Koneksi masuk dari pengguna datang pada port 443, yang sudah diizinkan.

**Mengapa tidak D?** Elastic IPs memengaruhi apakah instans memiliki IP publik, bukan apakah koneksi yang sudah ada dapat menerima respons.

*SAA-C03 Domain: Desain Arsitektur yang Aman — Tugas 1.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Setelah serangan IP Rumania, Priya ingin menerapkan dua kontrol tambahan:

1. Blokir seluruh rentang IP 185.0.0.0/8 dari mencapai sumber daya mana pun di subnet publik
2. Pastikan bahwa subnet pribadi yang berisi database tidak dapat berkomunikasi dengan internet, bahkan jika seseorang salah mengkonfigurasi Grup Keamanan

Alat apa yang akan Anda gunakan untuk setiap persyaratan, dan bagaimana Anda akan mengonfigurasinya? Bisakah Anda menggunakan Grup Keamanan untuk keduanya? Bisakah Anda menggunakan NACL untuk keduanya?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk memahami alat mana yang cocok untuk masalah mana.)*

## Adegan Pasca-Kredit

Insiden tersebut terkandung. Kunci deploy yang terkompromi dinonaktifkan. Rentang IP Rumania diblokir di NACL. Skrip lama telah dihapus dari instans EC2.

Priya menulis laporan insiden. Dia membagikannya dengan tim.

Baris terakhir dari laporan tersebut: "Penyebab utama: kredensial aktif dari pipeline penyebaran yang dinonaktifkan tidak pernah diputar atau ditarik. Rekomendasi: rotasi kredensial otomatis dan audit rutin dari semua kredensial IAM."

Leo membacanya tiga kali.

"Seharusnya saya memutar kunci itu," katanya.

"Ya," kata Priya.

"Bagaimana kita memastikan ini tidak terjadi lagi?"

"Otomatisasi," jawabnya. "Dan sesuatu yang mengawasi pengamat."

Di bab berikutnya: kotak pengaman tempat Nimbus menyimpan rahasianya — dan rotasi yang membuat kunci curian menjadi tidak berguna.
```
