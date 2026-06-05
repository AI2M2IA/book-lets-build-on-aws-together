# Bab 14: Siapa yang Diizinkan Melakukan Apa

Tom memiliki kunci akses terbuka dalam sebuah file teks, siap untuk ditempel.

"Apa yang sedang kamu lakukan?" tanya Priya.

"Instans EC2 perlu membaca file konfigurasi dari S3. Aku memasukkan kredensial ke dalam konfigurasi server."

Dia melihat layar sejenak. "Tutup file itu."

"Aku hanya—"

"Jika seseorang mendapatkan akses ke server itu," katanya, "mereka akan mendapatkan kunci-kunci tersebut. Dan kunci-kunci tersebut menyentuh apa pun yang diizinkan disentuh oleh pengguna IAM. Yang mungkin lebih dari sekadar S3."

Tom menutup file tersebut.

"Ada cara yang lebih baik," katanya. "Server itu sendiri dapat memiliki peran. Bayangkan itu seperti jabatan pekerjaan—instans tidak perlu kredensial karena sistem sudah tahu apa itu dan apa yang diizinkannya lakukan."

Tom terlihat skeptis. "Jadi, server tersebut mengautentikasi dirinya sendiri?"

"Ya. Tanpa kata sandi. Tanpa kunci dalam file konfigurasi. Tanpa apa pun yang dapat secara tidak sengaja dikomite ke git."

Bagian terakhir itu menyentuh. Tom menemukan kata sandi database dalam riwayat git dua minggu lalu. Dia membuka tab browser baru.

**Membahas Kembali IAM: Gambaran Penuh**

Bab 3 memperkenalkan IAM: pengguna, grup, peran, dan kebijakan. Sekarang saatnya untuk menggali lebih dalam.

Kebijakan IAM adalah dokumen JSON yang menentukan tindakan apa yang diizinkan atau ditolak pada sumber daya mana pun. Mereka terlihat seperti ini:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Berikut terjemahan Markdown tersebut ke dalam Bahasa Indonesia yang lancar:

Ini adalah kebijakan yang memungkinkan pembacaan dan penulisan objek di bucket `nimbus-assets`, dan tidak ada yang lain. Tidak ada penghapusan. Tidak ada daftar bucket. Tidak ada operasi S3 lainnya. Tidak ada layanan AWS lainnya.

Ini adalah cara yang benar untuk memberikan izin: tindakan spesifik, sumber daya spesifik.

**Masalah dengan “Akses Administrator”**

Kebijakan Terkelola AWS seperti `AdministratorAccess` dirancang untuk memulai dengan cepat. Mereka tidak dirancang untuk menjalankan sistem produksi dengan anggota tim sungguhan.

`AdministratorAccess` memberikan setiap tindakan pada setiap sumber daya. Jika anggota tim dengan kebijakan ini membuat kesalahan—misalnya, secara tidak sengaja menghapus bucket S3, menghentikan instance EC2 yang salah, atau mengubah aturan grup keamanan—tidak ada yang dapat dilakukan AWS untuk menghentikannya. Izin telah diberikan.

Jika kredensial anggota tim disusupi (serangan phishing, kunci akses yang bocor, pencurian laptop), penyerang memiliki akses administrator ke segala sesuatu di akun AWS Anda.

“Jadi apa yang seharusnya Soo-Jin lakukan?” tanya Leo.

“Apa yang perlu dilakukan Soo-Jin?” jawab Priya.

“Terapkan API. Periksa log. Tidak ada yang lain.”

“Kemudian dia mendapatkan: kemampuan untuk mendorong ke pipeline kode, akses baca ke log CloudWatch, dan tidak ada yang lain.”

“Itu… sangat spesifik.”

“Ya. Itu poinnya.”

**Peran IAM: Identitas untuk Layanan**

Bab 3 memperkenalkan peran sebagai cara bagi instance EC2 untuk mengakses layanan AWS tanpa menyimpan kredensial. Mari kita buat ini menjadi konkret.

Instance EC2 Anda yang menjalankan API Nimbus perlu:

- Membaca dari DynamoDB (menu)
- Menulis ke DynamoDB (pesanan)
- Menyimpan objek di S3 (kuitansi, unggahan)
- Menulis log ke CloudWatch
- Membaca rahasia dari Secrets Manager

Alih-alih membuat pengguna dengan kunci akses dan menyimpan kunci tersebut pada instance EC2 (bencana keamanan—kunci akses dapat dibaca oleh siapa saja dengan akses SSH), Anda membuat **Peran IAM** untuk instance EC2 dengan izin yang tepat.

Instance EC2 secara otomatis menganggap peran tersebut. AWS menyediakan kredensial sementara melalui layanan metadata instance. Kredensial berputar secara otomatis. Tidak ada kunci akses yang bocor.

“Dan jika seseorang membobol instance EC2?” tanya Leo.

“Mereka dapat melakukan apa yang diizinkan oleh peran EC2,” kata Priya. “Yang mana adalah membaca menu, menulis pesanan, dan mengirim log. Mereka tidak dapat menghapus bucket S3. Mereka tidak dapat menghentikan instance EC2. Mereka tidak dapat menyentuh IAM.”

“Karena peran EC2 tidak memiliki izin tersebut.”

“Tepat.”

**Asumsi Peran: Bagaimana Layanan Menjadi Layanan Lain**

Peran dapat diasumsikan oleh:

- **Layanan AWS** (EC2, Lambda, tugas ECS, dll.)
- **Pengguna IAM** di akun Anda sendiri (peningkatan peran—Anda menganggap peran dengan izin yang lebih banyak untuk tugas tertentu)
- **Pengguna IAM di akun AWS lainnya** (akses lintas akun—akun organisasi lain dapat menganggap peran di akun Anda)
- **Penyedia identitas eksternal** (Google, Active Directory, Okta—akses federasi untuk pengguna manusia)

Pola terakhir ini—**federasi identitas**—adalah bagaimana organisasi besar memberikan akses AWS kepada karyawan mereka tanpa membuat pengguna IAM individu untuk setiap orang. Direktori Aktif perusahaan Anda memiliki kredensial Anda. Saat Anda masuk ke AWS, Anda mengautentikasi terhadap Direktori Aktif, dan AWS memberikan peran kepada Anda.

**Batas Izin: Membatasi Apa yang Dapat Diberikan oleh Peran**

Berikut adalah masalah yang halus tetapi penting: secara default, IAM tidak mencegah pengguna untuk memberikan izin yang tidak mereka miliki.

Jika Soo-Jin memiliki `iam:CreatePolicy` dan `iam:AttachUserPolicy`, dia dapat membuat kebijakan yang memberikan akses tulis ke S3 dan menambahkannya ke dirinya sendiri—bahkan jika kebijakan yang ada hanya mengizinkan akses baca ke S3. Kelas kerentanan ini disebut **peningkatan hak istimewa**, dan ini adalah mengapa batas izin ada.

Tetapi bagaimana jika Anda ingin mendelegasikan pembuatan izin IAM ke pemimpin tim, sambil memastikan bahwa mereka tidak dapat memberikan lebih dari yang Anda maksudkan?

**Batas Izin** menetapkan izin maksimum yang dapat diberikan kepada suatu identitas. Bahkan jika identitas memiliki kebijakan yang melekat yang lebih luas, izin efektif dibatasi oleh batas izin.

Contoh: Anda memberi pemimpin tim kebijakan yang mengizinkan mereka untuk membuat peran IAM. Tetapi Anda menambahkan batas izin yang mengatakan “peran yang dibuat oleh pemimpin tim ini tidak dapat memiliki akses hapus S3.” Bahkan jika pemimpin tim membuat peran dengan akses penuh S3, batas tersebut mencegah akses hapus S3 diterapkan.

Ini adalah konsep tingkat lanjut, tetapi muncul di ujian dan mencerminkan bagaimana organisasi mendelegasikan manajemen IAM dalam skala besar.

**Analisis Akses IAM: Audit Izin**

Priya menghabiskan dua hari untuk meninjau pengaturan IAM timnya. Dia menemukan:

- Pengguna pribadi Leo memiliki akses administrator (seperti yang ditemukan)
- Fungsi Lambda lama memiliki izin untuk membaca semua bucket S3 (tinggal dari pengujian)
- Peran layanan memiliki akses tulis ke tabel DynamoDB yang tidak lagi ada

Ini adalah hal yang normal. Konfigurasi IAM mengumpulkan sampah dari waktu ke waktu.

**Analisis Akses IAM** adalah layanan AWS yang secara otomatis mengidentifikasi sumber daya (bucket S3, peran IAM, kunci KMS, fungsi Lambda) yang dibagikan dengan entitas eksternal. Ini juga mengidentifikasi kebijakan yang terlalu permisif.

Berikut terjemahan Markdown tersebut ke dalam Bahasa Indonesia yang lancar:

Regular audit IAM harus menjadi bagian dari operasi Anda. Izin tumbuh; mereka jarang menyusut secara organik. Access Analyzer membantu membuat yang tidak terlihat menjadi terlihat.

**Kebijakan Kontrol Layanan: Penutup Organisasi**

Jika lingkungan AWS Anda berkembang menjadi beberapa akun (pola umum untuk tim besar — akun pengembangan, akun staging, akun produksi), **AWS Organizations** memungkinkan Anda untuk mengelolanya dari akun pusat.

Dalam Organizations, **Kebijakan Kontrol Layanan (SCPs)** menerapkan penutup yang memengaruhi *setiap* entitas IAM dalam akun, termasuk administrator.

Contoh SCP: “Tidak seorang pun di akun pengembangan dapat membuat instance EC2 di wilayah eu-west-1.”

Bahkan jika seseorang memiliki akses administrator di akun pengembangan, mereka tidak dapat melanggar SCP ini. Ini ditegakkan pada tingkat organisasi, di atas tingkat akun.

SCPs tidak memberikan izin — mereka membatasi. Mereka mendefinisikan izin maksimum yang dapat dimiliki oleh entitas IAM mana pun dalam sebuah akun.

## Kekuatan dan Batasan

**Mengapa peran IAM dan prinsip hak akses paling sedikit penting:**

- Membatasi radius ledakan saat kredensial dikompromikan
- Memerlukan penyerang untuk meningkatkan melalui beberapa sistem daripada mendapatkan akses penuh segera
- Menyediakan jejak audit — CloudTrail log peran mana yang melakukan apa
- Memaksa keputusan sadar tentang akses — “apa yang sebenarnya dibutuhkan layanan ini?”

**Di mana hal itu menjadi rumit:**

- Menulis kebijakan IAM yang tepat membutuhkan pemahaman tentang model tindakan/sumber daya AWS untuk setiap layanan (dan setiap layanan memiliki puluhan tindakan)
- Kebijakan yang terlalu membatasi memutus aplikasi — men-debug kesalahan “akses ditolak” di seluruh layanan memakan waktu
- IAM menyebarkan perubahan dengan sedikit penundaan (biasanya detik, kadang-kadang lebih lama) — dapat menyebabkan masalah waktu yang membingungkan
- Peran lintas akun memerlukan konfigurasi kebijakan kepercayaan yang cermat

## Ringkasan

- Hindari **akses administrator** dalam produksi — ini untuk pengaturan, bukan operasi.
- Kebijakan IAM menentukan **Efek**, **Tindakan**, dan **Sumber Daya** — spesifik pada ketiganya.
- Lampirkan kebijakan ke **grup** (untuk manusia) dan **peran** (untuk layanan).
- Instance EC2, fungsi Lambda, dan layanan AWS lainnya harus menggunakan **peran IAM**, bukan kunci akses.
- **Batas izin** membatasi izin maksimum yang dapat dimiliki oleh setiap identitas, terlepas dari kebijakan yang dilampirkan.
- **SCPs** (Kebijakan Kontrol Layanan) menerapkan pembatasan tingkat organisasi yang bahkan administrator tidak dapat menimpa.
- **IAM Access Analyzer** mengidentifikasi kebijakan yang terlalu permisif dan akses eksternal ke sumber daya.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Aman (Domain 1, Tugas 1.1)*

- **Peran IAM untuk EC2**: Jawaban kanonik ketika EC2 perlu mengakses S3, DynamoDB, Secrets Manager, atau layanan AWS lainnya. Jangan menyimpan kunci akses di instance.
- **Logika evaluasi kebijakan**: Ketika IAM mengevaluasi permintaan, ia menggunakan hierarki izinkan/tolak eksplisit. Izinkan eksplisit selalu menang, bahkan terhadap Izinkan eksplisit. Defaultnya adalah Tolak.
- **Batas izin**: Digunakan ketika mendelegasikan administrasi IAM. Skenario ujian: “izinkan pengembang untuk membuat peran untuk fungsi Lambda mereka, tetapi mencegah mereka memberikan izin di luar apa yang mereka miliki” → Batas izin.
- **SCPs tidak memberikan izin**: Mereka hanya membatasi. Jika SCP mengizinkan S3 tetapi kebijakan IAM menolaknya, S3 ditolak. Jika SCP menolak S3 tetapi kebijakan IAM mengizinkannya, S3 ditolak.
- **Kebijakan berbasis sumber daya**: Beberapa layanan AWS (S3, SQS, Lambda) memiliki kebijakan berbasis sumber daya — izin yang dilampirkan ke sumber daya, bukan identitas. Ini bekerja bersama dengan kebijakan IAM.
- **Akses lintas akun**: Peran IAM di Akun A dengan kebijakan kepercayaan yang mengizinkan Akun B untuk menahannya. Pengguna/peran Akun B kemudian menggunakan `sts:AssumeRole` untuk mendapatkan kredensial sementara di Akun A.
- **Pengguna IAM vs Akses Terfederasi**: Untuk organisasi besar, akses terfederasi (melalui IAM Identity Center atau federasi langsung dengan IdP) lebih disukai daripada pengguna IAM individu.

## Latihan

**Latihan 1 — Ingat**

Jelaskan perbedaan antara kebijakan IAM yang dilampirkan ke pengguna dan peran IAM yang diasumsikan oleh instance EC2. Kapan Anda akan menggunakannya?

*(Petunjuk: Pikirkan tentang kredensial — di mana mereka hidup, dan siapa yang mengelolanya?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Fungsi Lambda perlu membaca dari bucket S3 dan menulis ke tabel DynamoDB. Seorang pengembang telah memberikan fungsi Lambda dengan `AdministratorAccess` untuk kesederhanaan selama pengembangan. Sebelum berpindah ke produksi, tim keamanan ingin mengikuti prinsip hak akses paling sedikit.

Pendekatan mana yang TERBAIK berikut?

A) Buat pengguna IAM baru dengan izin S3 baca dan DynamoDB tulis; hasilkan kunci akses; simpan kunci dalam variabel lingkungan Lambda
B) Lampirkan kebijakan inline ke peran eksekusi fungsi Lambda yang memberikan `s3:GetObject` pada bucket tertentu dan `dynamodb:PutItem` pada tabel tertentu
C) Pertahankan `AdministratorAccess` tetapi tambahkan SCP yang memblokir semua tindakan kecuali S3 dan DynamoDB
D) Buat grup IAM dengan izin S3 baca dan DynamoDB tulis dan tambahkan fungsi Lambda ke grup

**Petunjuk 1**: Fungsi Lambda menggunakan peran eksekusi, bukan kunci akses. Opsi mana yang menghormati ini?

**Petunjuk 2**: Prinsip *least privilege* berarti tindakan spesifik pada sumber daya tertentu, bukan kebijakan yang luas.

**Petunjuk 3**: Grup IAM berisi pengguna, bukan fungsi Lambda.

**Jawaban**: B

**Penjelasan**: Peran eksekusi Lambda harus hanya memiliki izin khusus yang dibutuhkan fungsi tersebut. Kebijakan inline yang dibatasi pada tindakan spesifik (`s3:GetObject`) dan sumber daya spesifik (ARN bucket, ARN DynamoDB) adalah implementasi *least privilege*.

**Mengapa bukan A?** Menyimpan kunci akses dalam variabel lingkungan Lambda adalah pola keamanan yang buruk — kunci dapat dibaca oleh siapa saja yang memiliki akses ke konsol Lambda atau melalui konteks eksekusi. Fungsi Lambda menggunakan peran eksekusi dengan kredensial sementara dari IAM.

**Mengapa bukan C?** SCP berlaku pada tingkat Organisasi/akun dan tidak berfungsi sebagai kontrol izin per-fungsi. AdministratorAccess dengan SCP adalah lapisan yang salah.

**Mengapa bukan D?** Fungsi Lambda tidak dapat ditambahkan ke grup IAM. Grup hanya untuk pengguna IAM saja.

*SAA-C03 Domain: Desain Arsitektur Aman — Tugas 1.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus telah berkembang menjadi tiga tim: tim API inti, tim portal mitra restoran, dan tim analitik. Setiap tim memiliki lima pengembang dan menerapkan ke akun AWS bersama.

Rancang struktur IAM yang:

- Memberikan setiap tim akses ke hanya layanan mereka
- Mencegah tim analitik menulis ke database produksi
- Memungkinkan seorang pemimpin tim di setiap tim untuk membuat peran IAM untuk layanan mereka, tetapi tidak untuk meningkatkan izin mereka sendiri
- Menyediakan grup admin untuk tim platform yang dapat mengelola semua layanan

Konstruksi IAM apa yang akan Anda gunakan? Di mana batas izin akan diterapkan?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk berlatih desain IAM multi-tim.)*

## Adegan Pasca-Kredit

Leo menghabiskan akhir pekan untuk mengerjakan IAM.

Pada hari Senin, setiap layanan memiliki peran dengan izin yang dibutuhkan persisnya. Soo-Jin dan Rafael memiliki keanggotaan grup yang sesuai dengan fungsi pekerjaan mereka yang sebenarnya. Leo sendiri telah menghilangkan akses administrator dan menggunakan peran yang telah dirancangnya — dengan izin untuk melakukan pekerjaannya, dan tidak lebih.

Ini membutuhkan waktu lebih lama dari yang diharapkan.

Priya meninjau pekerjaannya pada hari Selasa pagi. Dia membaca dokumen kebijakan dengan cermat.

"Ini bagus," katanya.

"Terima kasih," kata Leo, dengan rasa lega dari seseorang yang telah menghabiskan akhir pekan untuk merasa rendah diri karena JSON.

"Anda meninggalkan satu hal."

Leo menegakkan tubuhnya.

"Kunci deploy lama dari versi pertama. Dalam rahasia GitHub Actions."

"Itu dinonaktifkan."

Priya mengetik sesuatu. "Apakah itu?"

Jeda.

"Saya akan menonaktifkannya," kata Leo.

"Apakah itu?"

Jeda yang lebih lama.

"Sesuatu sedang menggunakannya," kata Leo. "Saya akan menyelidikinya."

Di bab berikutnya: perbedaan antara penjaga keamanan yang mengingat wajah dan pintu yang hanya membaca badge.
