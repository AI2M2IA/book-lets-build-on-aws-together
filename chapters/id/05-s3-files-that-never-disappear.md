# Bab 5: Lemari Arsip yang Hidup di Cloud

Leo menyadari bahwa Nimbus menyimpan foto menu yang diunggah langsung di EC2 instance. Setiap foto yang diunggah pelanggan — arepa renyah, piring salmon panggang, mangkuk salad yang tertata sempurna — berada di satu mesin virtual.

Dan jika mesin itu pernah di-restart, diubah ukurannya, atau diganti?

Hilang.

"Berapa banyak foto yang sudah diunggah pelanggan sejauh ini?" tanya Maya.

Leo membuka console. "Sekitar delapan ratus."

"Dan apa yang terjadi pada delapan ratus foto itu jika kita me-restart server?"

Satu lagi jeda bermakna dari Leo.

Bab ini membahas di mana file sebenarnya seharusnya berada di cloud.

**Masalah Menyimpan File "di Server"**

Ketika Anda menyimpan file langsung di EC2 instance — di dalam filesystem-nya — Anda mengikat file-file itu pada lifecycle mesin spesifik tersebut.

Ini menciptakan beberapa masalah:

**Secara alami ephemeral.** EC2 instance dapat dihentikan, di-terminate, diganti. Disk lokalnya tidak dimaksudkan untuk permanen. Itu adalah ruang sementara.

**Single point of failure.** Jika instance gagal, file ikut hilang. Tidak ada redundancy. Tidak ada backup. Satu pagi yang buruk dan delapan ratus foto menu menghilang.

**Tidak bisa dibagikan antar instance.** Ketika Anda menambahkan server kedua (dan Anda akan melakukannya di Bab 7), server itu tidak akan melihat file yang disimpan di disk server pertama. Kedua server terisolasi. Pengguna yang mengunggah foto mungkin bisa melihatnya; pengguna lain yang mengenai server berbeda mungkin tidak.

**Tidak scale.** Ruang disk EC2 terbatas. Jika penuh, Anda berhenti menerima upload atau terburu-buru memperluas storage di bawah tekanan.

Ada model yang lebih baik. AWS membangunnya pada 2006, dan sampai sekarang masih menjadi salah satu layanan cloud paling banyak digunakan di dunia.

**Amazon S3: Hard Drive yang Hidup Online**

**Amazon S3** — Simple Storage Service — adalah layanan object storage AWS.

Pikirkan sebagai hard drive yang hidup di internet. Hard drive tak terbatas. Yang secara otomatis dicadangkan di beberapa Availability Zone sehingga kehilangan satu data center tidak menghilangkan file Anda.

Konsep kunci di S3 adalah **object**.

Object adalah file apa pun: foto, video, PDF, CSV, backup, log file. S3 tidak peduli pada tipe atau strukturnya. Ia menyimpan byte dan mengembalikannya ketika Anda meminta.

Object hidup di dalam **bucket**. Bucket seperti folder tingkat atas — container bernama di dalam S3 yang menampung object Anda. Setiap bucket memiliki nama yang unik secara global (tidak ada dua bucket di semua akun AWS yang dapat berbagi nama) dan berada di Region tertentu.

**Cara Kerja S3**

Modelnya sederhana, dan kesederhanaan itu memang intinya.

Anda **mengunggah** object ke bucket. S3 memberinya **key** — pada dasarnya nama path seperti `menus/restaurant-001/photo-arepa.jpg`. Key itu secara unik mengidentifikasi object di dalam bucket.

Anda **mengunduh** (atau mengambil) object menggunakan nama bucket dan key.

Anda juga bisa membuat object dapat diakses publik — artinya siapa pun dengan URL dapat mengunduhnya. Beginilah kebanyakan website menyajikan gambar: simpan gambar di S3, buat publik, embed URL di HTML Anda.

Atau Anda menjaga object tetap private — hanya dapat diakses oleh request yang terautentikasi. Ini model yang benar untuk data pelanggan, backup, dan apa pun yang sensitif.

S3 bukan filesystem. Tidak ada folder sungguhan. `/` dalam nama key hanyalah konvensi — S3 memperlakukan seluruh key sebagai string datar. Tetapi tampilannya seperti folder dan kebanyakan tools menyajikannya sebagai folder, jadi jangan terlalu khawatir tentang perbedaan ini dalam praktik.

**Mengapa S3 Berbeda dari Hard Drive Biasa**

Tiga hal membuat S3 secara fundamental berbeda dari file storage di EC2 instance:

**Durability.** AWS merancang S3 untuk durability 99.999999999% (eleven nines). Itu berarti jika Anda menyimpan sepuluh juta object, Anda mungkin mengharapkan kehilangan satu object setiap sepuluh ribu tahun karena kegagalan hardware. Mereka mencapainya dengan menyimpan beberapa salinan dari setiap object di setidaknya tiga Availability Zone secara otomatis.

**Availability.** S3 dirancang agar tetap dapat diakses bahkan ketika komponen individual gagal. Anda tidak terhubung ke satu server — Anda terhubung ke sistem terdistribusi yang merutekan di sekitar kegagalan.

**Scale.** S3 menampung jumlah data yang pada dasarnya tidak terbatas. Satu bucket dapat menampung triliunan object. Amazon sendiri menggunakan S3 untuk menyimpan data pada skala yang sulit dipahami.

**Versioning: Tombol Undo**

Ini sesuatu yang Maya temukan ketika menjelajahi S3 console.

S3 mendukung **versioning**. Ketika Anda mengaktifkan versioning pada bucket, S3 menyimpan setiap versi dari setiap object — termasuk versi sebelumnya dan versi yang dihapus.

Ini adalah tombol undo untuk file Anda.

Mengunggah foto menu baru yang tanpa sengaja menimpa yang lama? Versi lama masih ada. Menghapus file karena kesalahan? Bisa dipulihkan. Terkena ransomware yang menimpa semua file dengan sampah terenkripsi? Dengan versioning, Anda restore dari sebelum serangan.

"Berapa biaya menyimpan semua versi itu?" tanya Tom.

Anda membayar storage untuk setiap versi. Jika Anda memiliki banyak versi file besar, biayanya bertambah. AWS memiliki **lifecycle policies** yang otomatis menghapus versi lama setelah waktu tertentu — kita membahasnya di Bab 23 ketika masuk lebih dalam ke optimisasi biaya.

**Access Control: Public vs. Private**

Secara default, semua yang ada di S3 private. Hanya akun AWS Anda yang dapat mengaksesnya.

Anda bisa membuat object individual public — itulah cara Anda menyajikan gambar menu kepada pengunjung website. Atau Anda bisa menjaga semuanya private dan menghasilkan **pre-signed URLs**: link berbatas waktu yang memungkinkan seseorang mengunduh object tertentu tanpa membutuhkan AWS credentials. Sempurna untuk membiarkan pelanggan mengunduh invoice mereka selama 24 jam.

Priya punya pendapat yang sangat kuat tentang ini.

"Jangan pernah membuat bucket sepenuhnya public kecuali Anda secara sadar memutuskan bahwa setiap object di dalamnya dapat diakses seluruh internet," katanya. "Kesalahan security S3 yang paling umum adalah secara tidak sengaja mengekspos bucket yang berisi data sensitif."

AWS sekarang memiliki pengaturan "Block Public Access" yang dapat Anda terapkan di level account, memaksa semua bucket menjadi private kecuali Anda secara eksplisit override per bucket.

Aktifkan. Selalu.

**S3 Storage Classes: Tidak Semua Data Sama**

Tidak semua data diakses dengan frekuensi yang sama.

Foto menu paling populer diambil puluhan kali per detik. Log Anda dari tiga tahun lalu mungkin diakses sekali setahun, kalaupun pernah. S3 mengenali ini dan menawarkan berbagai **storage classes** dengan trade-off performa dan biaya yang berbeda.

| Storage Class           | Use Case                                      | Retrieval        | Cost                        |
|-------------------------|-----------------------------------------------|------------------|-----------------------------|
| S3 Standard             | Data yang sering diakses                      | Immediate        | Lebih tinggi per GB         |
| S3 Standard-IA          | Akses jarang, tetap butuh retrieval cepat     | Immediate        | Lebih rendah per GB, retrieval fee |
| S3 Glacier Instant      | Arsip yang sesekali diakses                   | Immediate        | Jauh lebih rendah           |
| S3 Glacier Flexible     | Arsip yang jarang diakses                     | Menit hingga jam | Sangat rendah               |
| S3 Glacier Deep Archive | Arsip compliance, hampir tidak pernah diakses | Hingga 12 jam    | Terendah                    |

Kita masuk lebih dalam ke ini di Bab 23. Untuk sekarang: konsepnya adalah Anda bisa otomatis memindahkan object antar storage class berdasarkan usia dan pola aksesnya, menghemat uang signifikan pada data yang jarang Anda sentuh.

## Strengths and Limitations

**Mengapa S3 sangat baik**:

- Durability eleven-nines. Data Anda lebih aman di S3 daripada di hampir sistem lain mana pun.
- Scale tak terbatas. Anda tidak pernah perlu provision storage — ia tinggal tumbuh.
- Sangat murah untuk apa yang diberikannya (pecahan sen per GB per bulan).
- Integrasi native dengan hampir semua layanan AWS lain.
- Mendukung static website hosting — Anda dapat menyajikan website statis lengkap langsung dari S3, tanpa server.

**Di mana S3 bukan pilihan yang tepat**:

- S3 bukan filesystem. Jika aplikasi Anda perlu mount drive dan menggunakannya seperti disk lokal (membaca, menulis, memodifikasi file in place), S3 adalah tool yang salah. Gunakan EFS (Elastic File System, Bab 6) atau EBS.
- S3 memiliki latensi yang terasa lebih tinggi daripada disk lokal. Untuk database atau aplikasi yang membutuhkan I/O random-access cepat, block storage (EBS, Bab 6) lebih tepat.
- Transfer data besar masuk ke S3 gratis. Transfer data besar *keluar* dikenakan biaya. Ini kejutan billing yang umum — kita membahasnya di Bab 30.

## Summary

- **Amazon S3** adalah object storage — tempat menyimpan file (disebut object) dalam container bernama (disebut bucket).
- S3 dirancang untuk durability eleven-nines dengan otomatis menyimpan salinan setiap object di setidaknya tiga Availability Zone.
- File yang disimpan di EC2 instance terikat pada lifecycle instance itu. File penting seharusnya berada di S3, bukan di server.
- **Versioning** mempertahankan versi sebelumnya dari object — tombol undo Anda.
- Secara default, S3 private. Aktifkan "Block Public Access" di level account.
- S3 memiliki beberapa **storage classes** untuk pola akses dan biaya yang berbeda. Kelas infrequent access jauh lebih murah tetapi mengenakan retrieval fees.

## Exam Tips

*SAA-C03 Domain 3 — Task 3.1 (high-performing storage solutions)*

- **S3 adalah object storage, bukan block storage.** Ketika scenario exam membutuhkan filesystem yang dapat di-mount oleh beberapa server, itu EFS. Ketika membutuhkan disk untuk satu EC2 instance, itu EBS. Ketika perlu menyimpan file, backup, gambar, atau data yang diakses via HTTP — itu S3.
- **Durability eleven-nines** berarti S3 mereplikasi data ke beberapa AZ secara otomatis. Anda tidak mengkonfigurasi ini — ini default.
- **S3 Regional**, tetapi dapat diakses secara global. Bucket berada di Region tertentu, tetapi Anda dapat mengaksesnya dari mana saja.
- **Pre-signed URLs** memungkinkan akses berbatas waktu ke private objects. Pattern umum: aplikasi Anda menghasilkan pre-signed URL yang valid 15 menit, memberikannya kepada user, user mengunduh file langsung dari S3.
- **S3 Standard-IA** memiliki minimum storage duration charge (30 hari). Jangan gunakan untuk data yang akan cepat Anda hapus. Exam menguji apakah Anda memahami trade-off antar storage classes.
- **Storage class decision tree**: *sering diakses* → S3 Standard; *jarang diakses tetapi butuh retrieval cepat* → S3 Standard-IA; *arsip sesekali diakses* → S3 Glacier Instant Retrieval; *arsip jarang diakses* → S3 Glacier Flexible Retrieval; *arsip compliance, hampir tidak pernah diakses* → S3 Glacier Deep Archive. Ketika scenario menyebut "cost optimization" dan "infrequent access," Standard-IA hampir selalu jawabannya. Ketika menyebut "compliance" atau "seven-year retention," pikirkan Glacier Deep Archive.

## Exercises

**Exercise 1 — Recall**

Dengan kata-kata Anda sendiri: apa itu S3 object? Apa itu S3 bucket? Mengapa menyimpan file di S3 lebih baik daripada menyimpannya di disk lokal EC2 instance?

*(Hint: Pikirkan apa yang terjadi pada file di EC2 instance jika instance di-terminate. Apa yang S3 lakukan secara berbeda?)*

**Exercise 2 — Exam Practice**

*Scenario*: Sebuah perusahaan media memproduksi video dokumenter. Mereka perlu menyimpan footage 4K asli (sering diakses selama produksi), final cut yang sudah diedit (diakses bulanan untuk distribusi), dan archive masters (disimpan tanpa batas tetapi diakses paling banyak setahun sekali untuk keperluan compliance). Mereka ingin meminimalkan biaya storage sambil memenuhi requirement akses setiap tier.

Strategi storage mana yang BEST memenuhi kebutuhan mereka?

A) Simpan semua content di S3 Standard untuk performa konsisten dan kesederhanaan  
B) Simpan original footage di S3 Standard, final cuts di S3 Standard-IA, dan archives di S3 Glacier Deep Archive  
C) Simpan semua content di EC2 instance storage untuk akses tercepat  
D) Simpan semua content di S3 Glacier Deep Archive untuk meminimalkan biaya

**Hint 1**: File yang berbeda memiliki pola akses yang berbeda. S3 menawarkan storage classes berbeda untuk frekuensi akses berbeda. Kelas mana yang cocok dengan "sering diakses"?

**Hint 2**: Archives yang diakses "paling banyak setahun sekali" tidak membutuhkan retrieval immediate. Storage class mana yang dirancang untuk archival jangka panjang dengan biaya minimum?

**Hint 3**: Cocokkan frekuensi akses setiap tier dengan storage class yang sesuai. Sering diakses = Standard. Bulanan = Standard-IA. Setahun sekali = Glacier Deep Archive.

**Answer**: B

**Explanation**: Strategi ini mencocokkan setiap tier data dengan S3 storage class yang tepat. Original footage yang sering diakses tetap di Standard untuk immediate access tanpa retrieval fees. Final cuts yang diakses bulanan masuk ke Standard-IA (biaya storage lebih rendah, retrieval fee terjangkau). Archives yang diakses setahun sekali masuk ke Glacier Deep Archive untuk biaya storage serendah mungkin.

**Why not A?** Menyimpan semuanya di Standard sederhana tetapi mahal. Anda membayar premium pricing untuk archival content yang jarang diakses.

**Why not C?** EC2 instance storage ephemeral dan tidak tepat untuk penyimpanan media jangka panjang. Jika instance di-terminate, semua content hilang.

**Why not D?** Glacier Deep Archive memiliki retrieval time hingga 12 jam. Menyimpan production footage yang sering diakses di sana akan membuat pekerjaan produksi mustahil.

*SAA-C03 Domain 3 — Task 3.1 / Domain 4 — Task 4.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus menyimpan foto pesanan yang diunggah pelanggan di S3. Regulasi perlindungan data mengharuskan foto pelanggan disimpan selama 7 tahun tetapi dapat dihapus setelah itu. Team juga ingin meminimalkan biaya menyimpan foto lama dari tahun-tahun sebelumnya.

Rancang strategi S3 storage untuk requirement ini. Storage classes mana yang akan Anda gunakan, dan kapan Anda akan melakukan transition di antaranya? Apa yang akan Anda lakukan tentang requirement deletion?

*(Hint: Pikirkan lifecycle policies. Tidak ada satu jawaban benar — reason through trade-off biaya vs. retrieval time.)*

## Post-Credits Scene

Leo memigrasikan foto menu ke S3 sore itu. Delapan ratus object, aman disimpan di tiga Availability Zone, dengan versioning enabled.

"Sebenarnya sekarang mereka lebih aman daripada sebelumnya," katanya, dengan sedikit puas.

"Mereka selalu lebih aman di S3," kata Priya. "Kita hanya menunggu sampai setelah kita membangun masalahnya untuk memperbaikinya."

Leo menerima itu.

Keesokan paginya, Tom datang membawa printout. AWS bill, diberi anotasi dengan pena merah.

"Kita punya masalah database," katanya. "Kita menjalankan order database di EC2 instance yang sama dengan web server. Dan menu database kita. Dan customer records kita."

Ia berhenti.

"Semuanya berada di mesin yang sama. Satu mesin. Semua data kita."

Maya melihat printout itu. Lalu Tom. Lalu langit-langit.

"Dan kalau mesin itu rusak?"

Tom menunjuk anotasi pena merah.

Di bab berikutnya: perbedaan antara hard drive yang Anda sewa dan lemari arsip yang dibagikan seluruh kantor.
