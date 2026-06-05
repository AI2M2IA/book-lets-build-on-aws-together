# Bab 3: Siapa Anda, Tepatnya?

Leo menekan deploy.

Terminal mengembalikan dua kata: Access Denied.

Ia mencoba lagi. Hasil yang sama. Ia sudah bekerja di Nimbus selama tiga minggu, sudah
diberi akses ke akun AWS pada hari pertamanya, dan sudah melakukan deploy ke lingkungan
staging tanpa masalah. Tapi ini adalah produksi. Dan produksi,
tampaknya, berbeda.

Maya melihat dari balik bahunya ke pesan error. "Siapa yang memberi Anda izin itu?"

Leo berbalik. "Izin apa?"

"Izin untuk deploy ke produksi. Siapa yang mengaturnya?"

Leo membuka konsol AWS dan mulai mengklik menu. Tidak ada yang melakukannya. Tidak ada
kebijakan, tidak ada role, tidak ada pemberian eksplisit. Juga tidak ada penolakan eksplisit — hanya
ketidakhadiran. Tidak ada seorang pun di Nimbus yang pernah duduk dan memikirkan siapa yang bisa melakukan apa.

Itulah masalahnya.

**Masalah Dengan Kata Sandi**

Kata sandi adalah model yang buruk untuk sistem komputer.

Bukan karena selalu lemah. Karena biner: Anda baik memiliki kata sandi atau tidak. Jika Anda memilikinya, Anda bisa melakukan apa pun yang diizinkan akun itu.

Itu baik-baik saja untuk satu pengguna di laptop pribadi mereka. Itu bencana untuk
infrastruktur cloud perusahaan.

Pertimbangkan apa yang perlu dikelola Nimbus: server web, database, penyimpanan file,
jaringan, notifikasi penagihan, akun pengguna. Jika semuanya dilindungi oleh satu kata sandi —
atau bahkan satu set kredensial — maka siapa pun yang mendapatkan kata sandi itu mendapatkan segalanya.

Dan "segalanya" di AWS berarti kemampuan untuk menghapus database. Menjalankan server yang menghasilkan
tagihan $50.000. Mengekstrak setiap catatan pelanggan. Menghancurkan data cadangan.

Priya tidak mendeskripsikan ini dalam istilah yang tenang dan abstrak. Ia mendeskripsikannya sebagai kisah tentang
startup yang mengalami pelanggaran, mendapat tagihan AWS $80.000 dalam 24 jam dari penyerang yang menambang
cryptocurrency di akun mereka, dan tutup tiga bulan kemudian.

Ruangan hening.

"Jadi apa alternatifnya?" tanya Tom.

**Konsep: Identity and Access Management**

Alternatifnya adalah sistem di mana Anda tidak memberi semua orang kunci yang sama. Anda memberi setiap
orang — dan setiap layanan — tepat akses yang mereka butuhkan. Tidak lebih, tidak kurang.

Di AWS, sistem ini disebut **IAM**: Identity and Access Management.

Pikirkan IAM seperti sistem kartu akses di gedung kantor besar.

Gedung memiliki lusinan lantai. Ruang server ada di lantai 12. Kantor keuangan
ada di lantai 8. Suite CEO ada di lantai 20. Setiap karyawan memiliki kartu akses, tetapi
setiap kartu hanya membuka pintu yang perlu dibuka karyawan itu untuk pekerjaannya. Magang tidak bisa menggesek ke ruang server. Akuntan tidak bisa mengakses lantai eksekutif setelah jam kerja.

IAM bekerja dengan cara yang sama. Anda mendefinisikan siapa yang ada (identitas), apa yang mereka boleh lakukan
(izin), dan menerapkan izin tersebut melalui kebijakan.

**Blok Bangunan IAM**

IAM memiliki empat konsep inti. Mereka saling membangun.

**User** adalah identitas individu. Maya memiliki IAM user. Tom memiliki IAM user.
Setiap user memiliki kredensial mereka sendiri — dan hanya boleh memiliki izin yang mereka
butuhkan secara khusus.

**Group** adalah kumpulan user. Daripada mengatur izin untuk Maya, Tom,
Priya, dan Leo secara individual, Anda membuat grup "Developers" dengan izin pengembang
dan menambahkan mereka ke dalamnya. Ketika orang kelima bergabung, Anda menambahkan mereka ke grup dan mereka
langsung mewarisi izin yang tepat.

**Role** adalah identitas sementara yang bisa *diasumsikan* oleh sesuatu — seseorang, layanan, atau akun AWS lain. Kami akan mendalami role di Bab 14. Untuk sekarang: jika User adalah karyawan tetap, Role adalah kartu tamu. Ini memberikan akses tertentu untuk waktu atau tujuan tertentu.

**Policy** adalah aturan izin sebenarnya. Kebijakan adalah dokumen (ditulis dalam JSON
secara internal, tetapi Anda tidak perlu menghafal formatnya) yang mengatakan: "Pemegang kebijakan ini DIIZINKAN untuk melakukan tindakan X pada sumber daya Y." Atau "DITOLAK tindakan Z."

Model evaluasi IAM adalah: secara default, semuanya ditolak. Izin harus
diberikan secara eksplisit. Jika kebijakan tidak mengatakan Anda bisa melakukan sesuatu, Anda tidak bisa.

**Prinsip Hak Istimewa Minimum**

Ini adalah konsep terpenting dalam seluruh keamanan, bukan hanya IAM.

**Berikan orang dan sistem hanya akses yang mereka butuhkan untuk melakukan pekerjaan mereka. Tidak lebih.**

Priya menyebut ini "prinsip hak istimewa minimum." Kedengarannya jelas. Dalam praktiknya,
sebagian besar tim melanggarnya terus-menerus — bukan dengan jahat, tetapi demi kenyamanan.

"Bisakah kita memberi Leo akses admin agar ia bisa melakukan deploy lebih cepat?"

Tidak.

"Bisakah kita menggunakan akun root untuk segalanya?"

Tentu saja tidak.

Akun root adalah kunci master untuk seluruh akun AWS Anda. Ia bisa melakukan apa saja,
termasuk menutup akun itu sendiri. Anda harus membuatnya sekali, mengatur autentikasi multi-faktor,
dan kemudian tidak pernah menggunakannya lagi untuk pekerjaan sehari-hari.

Priya membuat IAM user terpisah untuk semua orang sore itu. Ia memberi Leo izin
untuk deploy ke lingkungan pengembangan. Bukan produksi. Bukan penagihan. Bukan jaringan.
Hanya deployment.

"Ini terasa membatasi," kata Leo.

"Begitulah cara Anda tahu ini benar," Priya menjawab.

**Apa yang Terjadi Ketika Anda Salah**

Tiga skenario, dalam urutan tingkat keparahan yang meningkat:

**Skenario 1**: Seorang karyawan dengan akses admin meninggalkan perusahaan. Tidak ada yang menonaktifkan
akun mereka. Tiga bulan kemudian, mereka masih memiliki akses. Ini terjadi terus-menerus.
IAM memecahkannya: Anda menonaktifkan user. Seketika, di mana saja.

**Skenario 2**: Laptop pengembang dikompromi. Penyerang menemukan kredensial AWS
yang disimpan dalam file konfigurasi dengan izin admin penuh. Karena kredensial memiliki akses luas, penyerang bisa melakukan apa saja: menambang cryptocurrency, mencuri data, menghapus cadangan.
Dengan hak istimewa minimum: kredensial hanya bekerja untuk cakupan terbatas mereka. Radius ledakan terkandung.

**Skenario 3**: Aplikasi yang ditulis dengan buruk secara tidak sengaja mengekspos kredensial AWS di log-nya.
Jika kredensial tersebut memiliki akses luas, Anda mengalami pelanggaran bencana. Jika mereka
memiliki akses sempit — hanya ke bucket S3 tertentu yang dibutuhkan aplikasi — eksposur
terbatas dan terkandung.

Polanya: akses harus dibatasi ke minimum. Selalu. Bukan karena Anda tidak mempercayai
orang-orang Anda, tetapi karena Anda tidak bisa mengontrol apa yang terjadi pada kredensial yang dikompromi.

**Autentikasi Multi-Faktor: Kunci Kedua**

Satu konsep lagi sebelum kita menutup bab ini.

Bahkan dengan hak istimewa minimum, kredensial bisa dicuri. Kata sandi bisa ditebak,
di-phish, atau bocor. IAM mengatasi hal ini dengan **Autentikasi Multi-Faktor (MFA)**.

MFA memerlukan sesuatu yang Anda *ketahui* (kata sandi) ditambah sesuatu yang Anda *miliki* (ponsel,
kunci perangkat keras). Bahkan jika penyerang mencuri kata sandi Anda, mereka tidak bisa masuk tanpa
juga memiliki ponsel Anda.

MFA harus diaktifkan untuk setiap IAM user. Ini tidak bisa dinegosiasikan untuk akun root.

Priya menghabiskan sore itu menyiapkannya untuk semua orang.

Tom bertanya apakah itu terlalu banyak friksi. Priya menampilkan kisah pelanggaran lagi.

Tom segera mengatur MFA.

## Kekuatan dan Keterbatasan

**IAM adalah alat yang tepat untuk**: mengontrol siapa dan apa yang bisa mengakses setiap sumber daya AWS; menerapkan hak istimewa minimum di seluruh pengguna, layanan, dan batas lintas akun; menghasilkan jejak audit dari setiap panggilan API melalui integrasi CloudTrail; menghilangkan kebutuhan untuk berbagi kredensial berumur panjang antar sistem.

**Di mana IAM menjadi sulit**: Kebijakan IAM bisa berkembang menjadi ratusan pernyataan di lusinan role, dan men-debug error "Access Denied" memerlukan pemahaman mana dari kebijakan-kebijakan itu yang efektif — tugas yang lebih sulit dari yang terdengar. Kesalahan IAM paling umum bukan terlalu sedikit akses — itu terlalu banyak. Kebijakan yang terlalu permisif yang dibuat untuk "sekadar membuatnya bekerja" menjadi tanggung jawab keamanan yang menyakitkan untuk diputar kembali. Tulis izin minimum terlebih dahulu. Perluas hanya ketika ada yang gagal.

## Ringkasan

- **IAM** (Identity and Access Management) adalah cara Anda mengontrol siapa yang bisa melakukan apa di AWS.
- Blok bangunan inti adalah: **User** (individu), **Group** (kumpulan
  user), **Role** (identitas sementara), dan **Policy** (aturan izin).
- Secara default, semuanya di AWS **ditolak**. Izin harus diberikan secara eksplisit.
- **Prinsip Hak Istimewa Minimum** berarti memberi setiap identitas hanya akses yang diperlukan. Tidak lebih.
- **Akun root** bisa melakukan apa saja, termasuk hal-hal bencana. Kunci di balik
  MFA dan gunakan sesedikit mungkin.
- Aktifkan **MFA** untuk setiap IAM user. Tidak bisa dinegosiasikan.

## Tips Ujian

*Domain SAA-C03 1 — Tugas 1.1 (akses aman ke sumber daya AWS)*

- **Semuanya ditolak secara default.** "Allow" eksplisit diperlukan. Jika kebijakan
  tidak menyebutkan tindakan, tindakan itu ditolak.
- **Deny eksplisit selalu menang.** Jika kebijakan mana pun dalam rantai menolak tindakan, penolakan itu tidak bisa diganti oleh Allow di mana pun dalam rantai. Ini mengejutkan banyak kandidat.
- **Akun root ≠ admin IAM.** Akun root adalah kredensial terpisah dari IAM.
  Anda tidak bisa menghapus akun root. Anda *bisa* (dan seharusnya) membatasi kapan itu digunakan.
- **IAM bersifat global**, bukan Regional. IAM user, group, role, dan policy ada
  di seluruh akun AWS, bukan per Region.
- **Role adalah cara yang lebih disukai untuk memberikan akses ke layanan AWS.** Jika EC2 instance
  perlu mengakses S3, Anda melampirkan IAM Role ke instance — Anda tidak menyimpan
  kredensial di mesin. Pola ini sering muncul dalam ujian.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa perbedaan antara IAM User, Group, dan Role?
Kapan Anda akan menggunakan masing-masing?

*(Petunjuk: Pikirkan tentang analogi gedung kartu akses — mana yang merupakan kartu permanen,
mana yang merupakan pengelompokan departemen, dan mana yang merupakan kartu tamu?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan menjalankan aplikasi web di EC2 instance yang perlu membaca file
dari bucket S3. Seorang pengembang junior menyarankan menyimpan kunci akses AWS langsung di
kode aplikasi di EC2 instance. Tim keamanan keberatan.

Apa solusi yang PALING AMAN dan paling tepat secara operasional?

A) Simpan kunci akses dalam variabel lingkungan di EC2 instance daripada di kode  
B) Buat IAM user khusus dengan izin baca S3 dan bagikan kredensial
   dengan tim pengembangan  
C) Lampirkan IAM Role dengan izin baca S3 yang sesuai langsung ke EC2 instance  
D) Gunakan kredensial akun root untuk memberi aplikasi akses penuh ke semua sumber daya AWS

**Petunjuk 1**: Masalah dengan menyimpan kredensial di mana saja di instance adalah bahwa
kredensial bisa bocor. Apakah ada cara untuk memberi EC2 instance akses tanpa
menggunakan kredensial sama sekali?

**Petunjuk 2**: AWS memiliki mekanisme di mana layanan bisa diberi izin tanpa
memerlukan kredensial statis. Apa mekanisme itu disebut?

**Petunjuk 3**: IAM Role bisa dilampirkan ke EC2 instance. Ketika dilampirkan, instance
secara otomatis menerima kredensial sementara yang dirotasi oleh AWS. Tidak perlu kredensial statis.

**Jawaban**: C

**Penjelasan**: Melampirkan IAM Role ke EC2 instance adalah pola yang benar.
Instance secara otomatis mendapat kredensial sementara dan berputar melalui layanan metadata EC2. Tidak ada kredensial berumur panjang untuk bocor, dirotasi, atau tidak sengaja
di-commit ke repositori.

**Mengapa bukan A?** Variabel lingkungan di EC2 instance masih bisa bocor —
melalui log aplikasi, endpoint debug, atau jika instance dikompromi.
Kredensial statis adalah masalahnya, bukan lokasinya.

**Mengapa bukan B?** Membuat IAM user bersama dan mendistribusikan kredensial ke tim
melanggar hak istimewa minimum dan membuat rotasi kredensial menjadi mimpi buruk. Jika satu orang
pergi, Anda tidak bisa dengan mudah mencabut hanya akses mereka tanpa mengubah kredensial bersama.

**Mengapa bukan D?** Menggunakan kredensial akun root untuk aplikasi apa pun adalah pelanggaran keamanan serius. Akun root memiliki akses tidak terbatas dan kredensialnya tidak boleh pernah
meninggalkan kendali pemilik akun.

*Domain SAA-C03 1 — Tugas 1.1 (IAM role, hak istimewa minimum)*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus akan merekrut tiga pengembang baru bulan depan. Masing-masing akan membutuhkan tingkat
akses yang berbeda: satu bekerja di lapisan database, satu di server aplikasi, satu di
file statis front-end. Ada juga pipeline CI/CD yang perlu men-deploy kode.

Rancang struktur IAM untuk skenario ini. User, group, role, dan policy apa yang
akan Anda buat? Apa batas hak istimewa minimum yang paling penting untuk diterapkan?

*(Tidak ada satu jawaban yang benar. Pikirkan tentang meminimalkan radius ledakan jika salah satu
identitas dikompromi.)*

## Adegan Pasca-Kredit

Di akhir hari, setiap IAM user memiliki MFA yang diaktifkan. Akun Leo telah dikurangi
menjadi akses tingkat pengembang: deploy ke lingkungan dev, baca dari bucket konfigurasi bersama, tidak ada lagi.

Ia pernah mencoba, sekali, untuk mengakses database produksi.

Access denied.

"Apakah ini yang terasa seperti dipercaya tapi tidak terlalu banyak?" ia bertanya.

"Tepat seperti itu rasanya," kata Priya.

Keesokan paginya, Tom tiba lebih awal dan menemukan sesuatu yang membuatnya segera memanggil tim.

Di konsol AWS, ia bisa melihat bahwa situs web mereka mendapatkan lalu lintas. Lebih dari
yang mereka harapkan. Dan server web — yang asli milik Leo — sedang berjalan panas. Sangat panas.

"Kita punya seratus pengguna bersamaan," kata Tom. "Dan satu server."

Di bab berikutnya: server pertama — menyewa komputer di pusat data orang lain.
