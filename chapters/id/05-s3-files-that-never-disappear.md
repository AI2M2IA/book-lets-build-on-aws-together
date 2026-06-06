# Bab 5: Lemari Arsip yang Hidup di Cloud

Leo sedang membersihkan instance EC2 pada pukul sembilan pagi ketika ia menemukan folder itu.

Kantor sunyi. Maya belum tiba. Kopi masih diseduh. Di luar jendela, para komuter pagi mengalir lewat. Leo memakai headphone dan sedang menggulir melalui direktori ketika ia berhenti.

Delapan ratus file. Semuanya foto menu. Semuanya di satu mesin tanpa cadangan.

Instance EC2 tempat aplikasi Nimbus berjalan telah di-upgrade sekali sejak pemadaman dua belas menit, tetapi penyimpanan foto tidak pernah pindah. Setiap arepa renyah, setiap piring salmon panggang, setiap mangkuk salad yang tertata sempurna — berada di satu mesin virtual yang sudah mereka buktikan bisa mati tanpa peringatan.

Dan jika mesin itu pernah dimulai ulang, diubah ukurannya, atau diganti?

Hilang.

"Berapa banyak foto yang sudah diunggah pelanggan sejauh ini?" tanya Maya, ketika ia tiba.

Leo berbalik. "Sekitar delapan ratus."

"Dan apa yang terjadi pada delapan ratus foto itu jika kita mulai ulang server?"

Salah satu jeda Leo yang penuh makna lagi.

Bab ini tentang di mana file sebenarnya seharusnya berada di cloud.

**Masalah Dengan Menyimpan File "Di Server"**

Ketika Anda menyimpan file langsung di instance EC2 — di dalam filesystem-nya — Anda
mengikat file itu ke siklus hidup mesin spesifik itu.

Ini menciptakan beberapa masalah:

**Sementara secara alami.** Instance EC2 bisa dihentikan, di-terminate, diganti. Disk
lokal mereka tidak dimaksudkan untuk permanen. Itu ruang sementara.

**Titik kegagalan tunggal.** Jika instance gagal, file ikut dengannya. Tidak ada
redundansi. Tidak ada cadangan. Satu pagi yang buruk dan delapan ratus foto menu menghilang.

**Tidak bisa dibagi antar instance.** Ketika Anda menambahkan server kedua (yang Anda akan, di
Bab 7), ia tidak akan melihat file yang disimpan di disk server pertama. Kedua server
terisolasi. Pengguna yang mengunggah foto mungkin melihatnya; pengguna lain yang menghantam server
berbeda mungkin tidak.

**Tidak ada skala.** Ruang disk EC2 terbatas. Jika Anda mengisinya penuh, Anda entah berhenti menerima
unggahan atau berjuang memperluas penyimpanan di bawah tekanan.

Leo belum mempertimbangkan apa yang terjadi dengan banyak server. Ia menyebutkannya secara santai kepada Priya.

"Tunggu — bagaimana masalah foto akan berjalan dengan dua server?" tanya Priya.

"Apa maksudmu?"

"Jika kita punya Server A dan Server B di belakang load balancer," kata Priya, "dan pelanggan mengunggah foto — permintaan mereka pergi ke Server A, kan? Jadi foto disimpan di disk Server A. Sekarang permintaan mereka berikutnya pergi ke Server B. Server B tidak punya fotonya. Apa yang dilihat pelanggan?"

Leo membuka mulutnya. Lalu menutupnya.

"Gambar yang rusak," katanya akhirnya.

"Atau kesalahan 404," kata Priya. "Atau, jika aplikasi mencoba memuatnya dan crash, halaman kesalahan."

Ia menggambar rencana load-balancer di papan tulis — menambahkan server kedua sudah ada di roadmap. Saat itu terjadi, setiap unggahan foto akan menjadi lemparan koin: unggah ke Server A, mungkin dilayani dari Server B, foto hilang, pelanggan bingung.

"Kita akan men-debug-nya selama seminggu sebelum mengetahui apa yang salah," kata Leo.

"Sudahkah kita memikirkan apa yang terjadi ketika kita menyalakan Auto Scaling dan tiba-tiba punya tiga atau empat server?" tanya Priya. "Kita akan kehilangan foto terus-menerus."

Ini adalah kelas bug yang tidak muncul dalam unit test. Ia hanya muncul di produksi, di bawah beban, ketika lalu lintas nyata tersebar di banyak server. Perbaikannya adalah berhenti menyimpan file di server sepenuhnya.

Ada model yang lebih baik. AWS membangunnya pada 2006, dan masih merupakan salah satu layanan cloud yang paling banyak
digunakan di dunia.

**Hard Drive yang Hidup Online**

Bayangkan hard drive yang hidup di internet — yang berskala untuk menampung sebanyak yang
pernah Anda butuhkan, dan menagih Anda hanya untuk yang benar-benar Anda gunakan. Anda tidak pernah menyediakannya.
Anda tidak pernah khawatir kehabisan ruang. Jika Anda memasukkan delapan ratus foto hari ini
dan delapan juta tahun depan, tidak ada yang berubah di pihak Anda kecuali item baris tagihan.

Itulah yang ditawarkan AWS. Mereka menyebutnya **Amazon S3** — Simple Storage Service.

S3 adalah layanan penyimpanan objek AWS. Ia tidak persis seperti filesystem, dan tidak persis
seperti basis data. Ia menyimpan file — disebut objek — dalam kontainer bernama yang disebut bucket.
Modelnya sederhana, dan kesederhanaan itu adalah intinya.

Konsep kunci di S3 adalah **objek**.

Objek adalah file apa pun: foto, video, PDF, CSV, cadangan, file log. S3
tidak peduli tentang tipe atau struktur. Ia menyimpan byte dan mengembalikannya ketika
Anda meminta.

Objek hidup di dalam **bucket**. Bucket itu seperti folder tingkat-atas — kontainer
bernama dalam S3 yang menampung objek Anda. Setiap bucket punya nama yang unik secara global
(tidak ada dua bucket di seluruh akun AWS yang bisa berbagi nama) dan ada di Region
tertentu.

**Bagaimana S3 Bekerja**

Anda **mengunggah** objek ke bucket. S3 memberinya **key** — pada dasarnya nama path
seperti `menus/restaurant-001/photo-arepa.jpg`. Key itu secara unik mengidentifikasi objek
dalam bucket.

Anda **mengunduh** (atau mengambil) objek menggunakan nama bucket dan key.

Anda juga bisa membuat objek dapat diakses publik — artinya siapa pun dengan URL bisa mengunduhnya. Inilah bagaimana sebagian besar situs web melayani gambar: simpan gambar di S3, buat publik, sematkan URL di HTML Anda.

Atau Anda menjaga objek tetap privat — hanya dapat diakses untuk permintaan yang terautentikasi. Ini adalah
model yang tepat untuk data pelanggan, cadangan, dan apa pun yang sensitif.

S3 bukan filesystem. Tidak ada folder nyata. `/` dalam nama key hanyalah
konvensi — S3 memperlakukan seluruh key sebagai string datar. Tapi terlihat seperti folder
dan sebagian besar alat menyajikannya sebagai folder, jadi jangan khawatir tentang perbedaan ini dalam
praktik.

Ada beberapa karakteristik operasional S3 yang penting dalam praktik tetapi tidak
jelas dari deskripsi:

**Imutabilitas objek**: Objek S3 tidak diedit di tempat. Jika Anda memperbarui file, Anda
mengunggah versi baru objek dengan key yang sama. S3 mengganti objek lama dengan
yang baru (atau, dengan versioning diaktifkan, menyimpan keduanya). Tidak seperti basis data di mana Anda
`UPDATE` baris, objek S3 bersifat tulis-sekali, baca-banyak. Untuk file teks dan dokumen
yang Anda edit sering, ini baik-baik saja — cukup unggah versi baru. Untuk file sangat besar
di mana Anda hanya ingin memperbarui sebagian konten, model objek S3 berarti Anda
mengunggah ulang seluruh file setiap kali.

**Konsistensi read-after-write yang kuat**: Sejak Desember 2020, S3 menyediakan konsistensi
yang kuat untuk semua objek — tulisan baru langsung terlihat oleh pembacaan berikutnya.
Sebelum 2020, S3 punya konsistensi eventual untuk beberapa operasi, yang menyebabkan bug halus
di aplikasi yang menulis objek dan langsung mencoba membacanya. Peningkatan model
konsistensi menghilangkan kelas bug ini.

**URL objek**: Setiap objek S3 punya URL. Untuk objek publik, terlihat seperti:
`https://bucket-name.s3.region.amazonaws.com/key/path`. Untuk objek privat, Anda
bisa menghasilkan pre-signed URL yang menyertakan informasi autentikasi dan kedaluwarsa setelah
waktu yang dikonfigurasi. Kedua format URL adalah bagaimana aplikasi dan browser sebenarnya mengambil
objek — tidak ada protokol proprietari yang terlibat.

**Tidak ada direktori untuk dibuat**: Karena S3 tidak punya folder nyata, tidak ada operasi
pembuatan direktori. Anda cukup mengunggah objek dengan key yang menyertakan prefix
path. "Folder" muncul secara otomatis di konsol ketika objek dengan prefix itu
ada, dan menghilang secara otomatis ketika semua objek dengan prefix itu dihapus.

**Mengapa S3 Berbeda Dari Hard Drive Biasa**

Tiga hal membuat S3 secara fundamental berbeda dari penyimpanan file pada instance EC2:

**Durabilitas.** AWS merancang S3 untuk durabilitas 99,999999999% (sebelas sembilan). Itu berarti
bahwa jika Anda menyimpan sepuluh juta objek, Anda mungkin mengharapkan kehilangan satu objek setiap sepuluh
ribu tahun karena kegagalan perangkat keras. Mereka mencapai ini dengan menyimpan banyak salinan
setiap objek di setidaknya tiga Availability Zone secara otomatis.

Tapi durabilitas melindungi dari kegagalan perangkat keras — bukan dari Anda menghapus sesuatu secara tidak sengaja. Itulah untuk apa versioning ada.

Ada perbedaan penting antara **durabilitas** dan **ketersediaan**. Durabilitas adalah tentang apakah data Anda masih ada. Ketersediaan adalah tentang apakah Anda bisa mengaksesnya sekarang. S3 Standard menawarkan durabilitas 99,999999999% dan ketersediaan 99,99%. Angka durabilitasnya hampir tak terpahami tingginya; angka ketersediaan 99,99% adalah *target desain* — sekitar 52 menit ketidaktersediaan per tahun. *SLA* kontraktualnya sebenarnya lebih rendah (99,9% per bulan), dan melewatkannya memberi Anda kredit layanan, bukan uptime. Dalam praktiknya, ketersediaan S3 jauh lebih tinggi dari kedua angka — tetapi layak memahami bahwa durabilitas dan ketersediaan adalah jaminan terpisah, dan bahwa target desain dan SLA adalah janji terpisah.

**Ketersediaan.** S3 dirancang agar dapat diakses bahkan ketika komponen individu
gagal. Anda tidak terhubung ke satu server — Anda terhubung ke sistem terdistribusi
yang merutekan di sekitar kegagalan.

**Skala.** S3 menampung jumlah data yang pada dasarnya tak terbatas. Satu bucket bisa menampung
triliunan objek. Amazon sendiri menggunakan S3 untuk menyimpan data pada skala yang sulit
dipahami. Bucket S3 terbesar di dunia menampung exabyte data — jutaan
terabyte. Anda tidak mengelola skala ini; Anda hanya mengunggah objek dan S3 menangani
semuanya di bawah.

**Biaya.** S3 Standard berharga kira-kira $0,023 per GB per bulan pada saat penulisan ini.
Untuk delapan ratus foto menu Nimbus dengan rata-rata 2MB masing-masing, itu 1,6 GB
penyimpanan — sekitar $0,04 per bulan. Bahkan pada 800.000 foto, Anda melihat $37 per
bulan untuk penyimpanan. Biaya penyimpanan yang sama pada volume EBS akan kira-kira
$128 per bulan, dengan plafon tetap yang membutuhkan perluasan sebelum Anda bisa menambah lebih.
S3 tumbuh secara otomatis dan menagih secara proporsional. EBS punya ukuran tetap dan biaya tetap.

**Versioning: Tombol Undo**

Inilah sesuatu yang ditemukan Maya ketika ia menjelajahi konsol S3.

S3 mendukung **versioning**. Ketika Anda mengaktifkan versioning pada bucket, S3 menyimpan setiap
versi setiap objek — termasuk versi sebelumnya dan versi yang dihapus.

Ini adalah tombol undo untuk file Anda.

Priya ingin mengujinya sebelum mempercayainya. Ia mengunggah foto menu ke bucket, lalu mengunggah versi baru dengan file yang salah — gambar serba hitam yang ia buat dalam tiga puluh detik.

Ia membuka konsol S3, mengklik "Show versions," dan menemukan keduanya: versi buruk (saat ini) dan aslinya (sebelumnya). Ia memulihkan versi sebelumnya dengan menyalinnya kembali sebagai versi saat ini yang baru.

"Berhasil," katanya.

"Berapa biaya untuk menyimpan semua versi itu?" tanya Tom.

Anda membayar untuk penyimpanan setiap versi. Jika Anda punya banyak versi file besar, itu
bertambah. AWS punya **kebijakan siklus hidup** yang secara otomatis menghapus versi lama setelah
waktu tertentu — kita membahasnya di Bab 23 ketika kita membahas optimasi biaya secara mendalam.

"Jadi kita mengaktifkan versioning tetapi mengatur aturan siklus hidup untuk menghapus versi lama setelah tiga puluh hari," kata Priya. "Dengan begitu kita punya jendela pemulihan tanpa membayar untuk menyimpan setiap versi selamanya."

Tom menuliskan angkanya. Biaya penyimpanan untuk tiga puluh hari versi dapat diterima.

**S3 Event Notification: File yang Melakukan Sesuatu**

Leo melihat foto menu dari sudut yang berbeda.

"Saat ini," katanya, "ketika sebuah restoran mengunggah foto, kita menyimpan aslinya pada resolusi penuh. Beberapa di antaranya empat ribu kali tiga ribu piksel. Setiap kali pelanggan memuat halaman menu di ponsel, kita melayani gambar empat megabyte."

"Berapa biayanya dalam bandwidth?" tanya Tom.

Leo membuka angka transfer data pada tagihan. Jawabannya adalah "lebih dari seharusnya."

S3 punya fitur yang disebut **Event Notification**. Ketika objek diunggah ke bucket, S3 bisa secara otomatis memicu layanan lain — seperti Lambda, layanan komputasi serverless yang kita bahas di Bab 20. Pemicu itu bisa menjalankan kode sebagai respons terhadap unggahan tanpa intervensi manual apa pun.

Solusi Nimbus: setiap kali foto diunggah ke bucket foto mentah, S3 Event Notification memicu fungsi Lambda. Fungsi Lambda membaca foto asli, menghasilkan thumbnail selebar 400 piksel, dan menyimpannya ke bucket foto yang diproses. Aplikasi yang menghadap pelanggan melayani thumbnail alih-alih aslinya.

Pipeline-nya:

1. Restoran mengunggah foto asli 4MB ke `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 memicu Event Notification
3. Fungsi Lambda membaca aslinya, menghasilkan thumbnail 400x300
4. Lambda menyimpan thumbnail ke `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Pelanggan memuat menu, aplikasi melayani thumbnail 40KB alih-alih aslinya 4MB

Hasilnya: pengurangan 99% dalam bandwidth gambar. Pemuatan halaman lebih cepat. Baris transfer data yang lebih kecil pada tagihan. Aslinya dipertahankan di bucket mentah, jadi jika Nimbus pernah ingin menghasilkan versi resolusi lebih tinggi, materi sumbernya ada di sana.

"Itu berjalan secara otomatis?" tanya Maya.

"Setiap kali siapa pun mengunggah foto," kata Leo. "Kita tidak pernah menyentuhnya."

Pola ini — pemrosesan berbasis-peristiwa yang dipicu oleh peristiwa penyimpanan — adalah salah satu pola yang paling umum dan kuat dalam arsitektur cloud modern. Kita meninjaunya secara menyeluruh di Bab 20.

**Cross-Region Replication: Ketika Satu Salinan Tidak Cukup**

Priya mengangkat pertanyaan kepatuhan di akhir minggu.

"Jika Nimbus berekspansi untuk melayani restoran di UE," katanya, "dan restoran itu mengunggah foto — apakah foto itu disimpan di bucket `us-west-2` kita?"

"Ya," kata Leo.

"Dan apakah GDPR punya sesuatu untuk dikatakan tentang di mana data itu disimpan?"

Iya. Ketentuan transfer data GDPR berarti data pribadi tentang penduduk UE mungkin membutuhkan penyimpanan di dalam UE atau di yurisdiksi dengan perlindungan data yang memadai.

Jawaban S3 untuk ini adalah **Cross-Region Replication** (CRR). Ketika Anda mengaktifkan CRR pada bucket, setiap objek baru yang diunggah secara otomatis direplikasi ke bucket di Region lain. Anda mengonfigurasi bucket sumber, bucket tujuan, dan IAM role yang memberi S3 izin untuk melakukan replikasi.

Ketika ekspansi UE terjadi, rencananya adalah ini: foto yang diunggah oleh restoran UE akan masuk ke bucket `eu-west-1`, dan CRR akan mereplikasinya ke bucket cadangan di `eu-central-1` (Frankfurt) untuk pemulihan bencana. Data UE tetap di Region UE.

"Berapa biayanya?" tanya Tom.

Biaya transfer data lintas-region dan penyimpanan berlaku — kira-kira tarif transfer per-GB dari Region sumber ke tujuan, ditambah penyimpanan untuk salinan yang direplikasi. Tom menghitung volume foto UE yang diproyeksikan Nimbus dan menentukan bahwa itu akan dapat diterima.

"Dan bagaimana jika seseorang mencoba masuk paksa ke pipeline replikasi?" tanya Priya. "IAM role yang melakukan replikasi harus berlingkup ketat — hanya tindakan replikasi S3, hanya pada bucket spesifik."

Ia menulis persyaratan itu ke rencana ekspansi.

**Multipart Upload dan Masalah Unggahan Tidak Lengkap**

Tom menemukan item baris yang tidak terduga pada tagihan AWS.

"Kita membayar untuk penyimpanan di S3," katanya, "tetapi jumlahnya lebih tinggi dari yang saya harapkan dari jumlah foto yang kita punya."

Leo menyelidiki. Ia menemukan kategori dalam laporan S3 Storage Lens: **multipart upload yang tidak lengkap**.

Ketika S3 mengunggah file yang lebih besar dari ukuran tertentu, ia menggunakan **multipart upload**: file dibagi menjadi bagian-bagian, setiap bagian diunggah secara terpisah, lalu bagian-bagian dirakit menjadi objek akhir. Ini membuat unggahan besar lebih andal — jika satu bagian gagal, hanya bagian itu yang perlu diulang, bukan seluruh file.

Tapi jika multipart upload dimulai lalu ditinggalkan — pengguna menutup browser, jaringan terputus, aplikasi crash — bagian-bagian parsial tetap di S3, mengakumulasi biaya penyimpanan. Mereka tidak terlihat sebagai objek yang selesai, tetapi mereka ditagih sebagai penyimpanan.

"Berapa banyak?" tanya Tom.

"Sekitar $12 sebulan," kata Leo. "Dari unggahan parsial yang tidak pernah selesai."

Perbaikannya: **aturan siklus hidup** S3 yang secara otomatis menghapus multipart upload yang tidak lengkap setelah tujuh hari. Unggahan apa pun yang belum selesai dalam seminggu ditinggalkan, dan bagian-bagian parsial dibersihkan.

Tom menambahkan aturan siklus hidup sore itu. Biaya $12/bulan menghilang dalam hitungan hari.

"Itu $144 setahun," kata Tom, melihat spreadsheet-nya. "Untuk tidak ada apa-apa."

"Saya sudah menyiapkan uji beban yang menggunakan multipart upload," kata Leo. "Oh." Jeda. "Itu mungkin sebagian besarnya. Saya lupa membersihkannya ketika tes selesai."

Tom tetap menuliskannya.

**Kontrol Akses: Publik vs. Privat**

Secara default, segalanya di S3 bersifat privat. Hanya akun AWS Anda yang bisa mengaksesnya.

Anda bisa membuat objek individu publik — yang adalah bagaimana Anda akan melayani gambar menu ke
pengunjung situs web. Atau Anda bisa menjaga semuanya tetap privat dan menghasilkan **pre-signed URL**:
tautan terbatas-waktu yang membiarkan seseorang mengunduh objek spesifik tanpa membutuhkan kredensial
AWS. Sempurna untuk membiarkan pelanggan mengunduh faktur mereka selama 24 jam.

Priya punya opini yang sangat kuat tentang ini.

"Dan bagaimana jika seseorang mencoba masuk paksa melalui bucket yang salah dikonfigurasi?" katanya. "Jangan pernah membuat bucket sepenuhnya publik kecuali Anda telah secara sadar memutuskan untuk membuat setiap
objek di dalamnya dapat diakses oleh seluruh internet. Kesalahan keamanan S3 yang paling
umum adalah secara tidak sengaja mengekspos bucket yang berisi data sensitif."

AWS sekarang punya pengaturan "Block Public Access" yang bisa Anda terapkan di tingkat akun,
memaksa semua bucket menjadi privat kecuali Anda secara eksplisit menimpanya per-bucket.

Aktifkan itu. Selalu.

Sejarah di balik ini: sebelum AWS menambahkan Block Public Access tingkat-akun, insiden
keamanan S3 yang paling umum adalah secara tidak sengaja membuat bucket publik. Seorang pengembang membuat
bucket untuk pengujian, mencentang kotak "publik" demi kenyamanan, menambahkan beberapa file termasuk
beberapa dari folder lain yang tidak mereka pikirkan, lalu melupakannya. Bucket
duduk di sana, dapat diakses publik, selama berbulan-bulan. Dalam beberapa kasus terkenal, "bucket
uji yang terlupakan" itu berisi data pelanggan, dokumen internal, atau kredensial.

Block Public Access tingkat-akun adalah pengaman terhadap ini. Bahkan jika pengembang
secara tidak sengaja mengonfigurasi bucket menjadi publik, pengaturan tingkat-akun menimpanya.
Anda harus secara eksplisit menonaktifkan pengaturan tingkat-akun sebelum bucket mana pun bisa menjadi
publik — yang menciptakan polisi tidur yang disengaja yang mencegah kecelakaan.

Nimbus punya Block Public Access yang diaktifkan di tingkat akun. Jadi bagaimana gambar menu
yang perlu dapat diakses publik akan dilayani? Pola standar — yang akan diadopsi Nimbus
nanti, di Bab 13 — adalah menempatkan CDN seperti CloudFront di depan
bucket dengan kebijakan Origin Access Control: CDN bisa mengambil objek dari bucket S3
privat, tetapi tidak ada yang bisa mengakses bucket secara langsung. Pola ini lebih aman daripada
bucket publik dan memungkinkan caching CDN mengurangi biaya permintaan S3.

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" tanya Maya. "Gambarnya publik bagaimanapun,
jadi mengapa penting jika bucket-nya publik?"

"Karena bucket publik berarti siapa pun bisa menghitung apa yang ada di dalamnya," kata Priya. "Mereka
bisa mendaftar semua objek dalam bucket. Dengan CloudFront di depan, mereka hanya melihat
URL yang kita ekspos di aplikasi. Bucket itu sendiri tetap privat."

Maya menambahkan "menghitung (enumerate)" ke model mentalnya tentang permukaan serangan.

**Storage Class S3: Tidak Semua Data Sama**

Tidak semua data diakses secara setara.

Foto menu Anda yang paling populer diambil puluhan kali per detik. Log Anda dari
tiga tahun lalu diakses mungkin sekali setahun, jika sama sekali. S3 mengenali ini dan menawarkan
**storage class** yang berbeda dengan kompromi performa dan biaya yang berbeda.

| Storage Class           | Kasus Penggunaan                                  | Pengambilan        | Biaya                          |
|-------------------------|---------------------------------------------------|--------------------|--------------------------------|
| S3 Standard             | Data yang sering diakses                          | Segera             | Lebih tinggi per GB            |
| S3 Standard-IA          | Akses jarang, masih butuh pengambilan cepat       | Segera             | Lebih rendah per GB, biaya ambil |
| S3 Glacier Instant      | Arsip yang diakses sesekali                        | Segera             | Jauh lebih rendah              |
| S3 Glacier Flexible     | Arsip yang jarang diakses                          | Menit hingga jam   | Sangat rendah                  |
| S3 Glacier Deep Archive | Arsip kepatuhan, hampir tidak pernah diakses      | Hingga 12 jam      | Terendah                       |

Kita membahasnya secara mendalam di Bab 23. Untuk sekarang: konsepnya adalah bahwa Anda bisa secara otomatis
memindahkan objek antar storage class berdasarkan usia dan pola akses mereka, menghemat
uang yang signifikan untuk data yang jarang Anda sentuh.

Ada juga **S3 Intelligent-Tiering** — storage class yang secara otomatis memindahkan
objek antara tingkat akses-sering dan akses-jarang berdasarkan pola akses yang diamati.
Anda membayar biaya monitoring kecil per objek per bulan, dan S3 menangani
tiering secara otomatis. Ini berguna ketika Anda tidak yakin objek mana yang akan
diakses sering dan mana yang tidak — layanan mempelajari polanya dan mengoptimalkan
sesuai itu.

Pendekatan Tom lebih manual: "Saya ingin tahu ke mana setiap dolar pergi." Ia memilih
aturan siklus hidup eksplisit alih-alih Intelligent-Tiering, karena aturan eksplisit dapat diprediksi
dan dapat diaudit. Setelah enam bulan mengoperasikan penyimpanan S3 Nimbus, ia punya gambaran jelas
tentang pola akses dan bisa mengatur aturan siklus hidup yang memindahkan objek ke Standard-IA
setelah 30 hari dan ke Glacier Flexible Retrieval setelah 180 hari.

Total penghematan penyimpanan dari manajemen siklus hidup di tahun pertama: kira-kira
$340. Tidak mengubah hidup, tetapi nyata — dan polanya berulang di puluhan bucket
dalam akun AWS yang serius mana pun.

"Itu hampir tiket pesawat pulang-pergi," kata Maya.

"Itu praktik teknik yang baik," kata Tom. Ia memasukkannya ke spreadsheet.

Ada satu jebakan dalam pemilihan storage class yang menjebak banyak tim: **durasi
penyimpanan minimum**. S3 Standard-IA punya durasi penyimpanan minimum 30 hari — jika Anda
menyimpan objek di Standard-IA dan menghapusnya setelah 15 hari, Anda tetap membayar untuk 30 hari.
Glacier Flexible Retrieval punya minimum 90 hari. Glacier Deep Archive punya minimum
180 hari.

Untuk objek yang dihapus sering atau punya umur pendek, minimum ini membuat
kelas IA dan Glacier lebih mahal daripada Standard, bukan lebih murah. Sebelum pindah ke
storage class yang lebih murah, verifikasi bahwa objek akan benar-benar hidup di sana cukup lama agar
penghematan melebihi penalti durasi minimum.

## Kekuatan dan Keterbatasan

**Mengapa S3 luar biasa**:

- Durabilitas sebelas-sembilan. Data Anda lebih aman di S3 daripada di hampir sistem lain mana pun.
- Skala tak terbatas. Anda tidak pernah perlu menyediakan penyimpanan — ia hanya tumbuh.
- Sangat murah untuk apa yang ia sediakan (pecahan sen per GB per bulan).
- Integrasi natif dengan hampir setiap layanan AWS lain.
- Mendukung hosting situs web statis — Anda bisa melayani situs web statis lengkap
  langsung dari S3, tanpa server yang dibutuhkan.
- Pemrosesan berbasis-peristiwa: S3 Event Notification memicu Lambda, SQS, atau SNS
  secara otomatis ketika objek dibuat atau dihapus, memungkinkan pipeline pemrosesan
  yang kuat tanpa polling atau pekerjaan terjadwal.
- Cross-Region Replication untuk residensi data kepatuhan dan pemulihan bencana.

**Di mana S3 bukan pilihan yang tepat**:

- S3 bukan filesystem. Jika aplikasi Anda perlu me-mount drive dan menggunakannya seperti
  disk lokal (membaca, menulis, memodifikasi file di tempat), S3 adalah alat yang salah.
  Gunakan EFS (Elastic File System, Bab 6) atau EBS sebagai gantinya.
- S3 punya latensi yang secara nyata lebih tinggi daripada disk lokal. Untuk basis data atau
  aplikasi yang butuh I/O akses-acak yang cepat, penyimpanan blok (EBS, Bab 6)
  sesuai.
- Transfer data *masuk* ke S3 bebas dari biaya bandwidth — tetapi tidak sepenuhnya gratis:
  setiap unggahan adalah permintaan PUT, dan S3 menagih per permintaan. Mengunggah jutaan
  objek kecil bisa berbiaya lebih dalam biaya permintaan daripada dalam penyimpanan. Transfer data *keluar*
  memakan biaya per GB. Keduanya adalah kejutan tagihan umum — kita membahasnya di Bab 30.
- S3 bukan basis data. Anda bisa menyimpan dan mengambil objek dengan key, tetapi Anda tidak bisa
  mengkueri objek berdasarkan kontennya, menjalankan agregasi, atau melakukan operasi relasional.
  Jika Anda perlu mengkueri konten data yang disimpan (bukan hanya mengambilnya dengan nama),
  Anda butuh basis data atau layanan seperti Athena (Bab 26) yang bisa mengkueri objek S3
  menggunakan SQL.
- Versioning objek menyimpan biaya yang berlipat. Setiap versi sebelumnya dari setiap objek
  yang diversiokan ditagih sebagai penyimpanan. Aturan siklus hidup yang mengakhiri versi lama
  tidak opsional — mereka adalah bagian dari strategi manajemen biaya untuk bucket mana pun
  dengan versioning diaktifkan.

**Bagaimana Objek S3 Dienkripsi**

"Dan bagaimana jika seseorang mencoba masuk paksa?" tanya Priya, seperti yang dapat diduga, hari foto-foto itu ditayangkan. "Apakah objek ini dienkripsi saat tidak digunakan (at rest)?"

Iya — dan itu layak dipahami, karena enkripsi S3 adalah salah satu topik yang paling diuji dalam ujian. Setiap objek yang diunggah ke S3 dienkripsi at rest secara default. Pertanyaannya adalah *siapa yang memegang kunci*:

**SSE-S3 (default)**: S3 mengenkripsi setiap objek dengan kunci yang dikelola S3 sendiri, menggunakan AES-256. Anda tidak melakukan apa pun, mengonfigurasi apa pun, membayar apa pun. Sejak Januari 2023, ini otomatis di setiap bucket. Untuk sebagian besar data, ini cukup.

**SSE-KMS**: S3 mengenkripsi objek dengan kunci KMS — entah kunci `aws/s3` yang dikelola AWS atau kunci yang dikelola pelanggan yang Anda kontrol (Bab 16 membahas KMS secara mendalam). Apa yang Anda dapatkan: jejak audit di CloudTrail dari setiap penggunaan kunci, kemampuan untuk mengontrol persis siapa yang bisa mendekripsi melalui kebijakan kunci, dan kemampuan untuk mencabut akses dengan menonaktifkan kunci. Apa yang Anda bayar: biaya API KMS per permintaan. Pada tingkat permintaan tinggi, aktifkan **S3 Bucket Keys** — S3 menurunkan kunci tingkat-bucket berumur pendek dari kunci KMS Anda, memotong panggilan API KMS (dan biaya) hingga 99%.

**SSE-C**: Anda menyediakan kunci enkripsi Anda sendiri *dengan setiap permintaan*. AWS menggunakannya di memori dan tidak pernah menyimpannya. Untuk organisasi yang aturan kepatuhannya mengatakan AWS tidak boleh pernah memegang kunci. Menuntut secara operasional — kehilangan kunci, kehilangan data.

Pola ujian: "enkripsi dengan jejak audit penggunaan kunci" atau "kontrol siapa yang bisa mendekripsi" → SSE-KMS. "Perusahaan harus mengelola kuncinya sendiri dan AWS tidak boleh pernah menyimpannya" → SSE-C. "Enkripsi at rest tanpa overhead manajemen" → SSE-S3 (sudah aktif).

**S3 Object Lock: Tulis Sekali, Baca Banyak**

Beberapa data harus *mustahil* untuk dihapus — bukan dilindungi oleh kebijakan, secara struktural imutabel. Catatan perdagangan keuangan, log audit, bukti hukum. **S3 Object Lock** membuat objek tidak dapat dihapus dan tidak dapat dimodifikasi selama periode retensi, bahkan oleh administrator. Ia membutuhkan versioning, dan datang dalam dua mode yang gemar dikontraskan ujian: **governance mode** (pengguna dengan izin khusus masih bisa mem-bypass lock) dan **compliance mode** (tidak ada yang bisa memperpendek retensi atau menghapus objek — bahkan pengguna root — sampai periode berakhir). Frasa regulasi seperti "WORM storage" atau "SEC Rule 17a-4" adalah pemicu ujian untuk Object Lock dalam compliance mode.

**S3 Transfer Acceleration: Unggahan Cepat dari Jauh**

Ketika pengguna mengunggah file besar ke bucket dari sisi lain dunia, bagian yang lambat adalah jalur internet-publik yang panjang ke region bucket. **S3 Transfer Acceleration** memberi bucket endpoint khusus yang merutekan unggahan ke edge location AWS terdekat, lalu membawanya melalui backbone privat AWS ke bucket. Pemicu ujian: "pengguna di seluruh dunia mengunggah file besar ke bucket terpusat; unggahan lambat" → Transfer Acceleration (sering dipasangkan dengan multipart upload). Perhatikan arahnya: Transfer Acceleration tentang memasukkan data *ke* S3; CloudFront tentang melayani data *keluar*.

Satu storage class lagi yang layak diketahui sekarang: **S3 One Zone-IA** — seperti Standard-IA tetapi disimpan di satu Availability Zone, sekitar 20% lebih murah, untuk data yang jarang diakses yang bisa Anda buat ulang jika AZ itu hilang (thumbnail, laporan yang bisa dihasilkan ulang). Ini adalah pengecoh ujian standar; Bab 23 membahas spektrum storage-class lengkap.


## Ringkasan

Delapan ratus foto pada satu instance adalah masalahnya. S3 memecahkannya — tetapi S3 lebih dari sekadar tempat untuk menyimpan file. Ia adalah penyimpanan objek yang durabel, dapat diskalakan, dapat diakses secara global dengan model aksesnya sendiri, storage class, kebijakan siklus hidup, dan sistem peristiwa. Memahami apa yang S3 kuasai, dan apa yang dengan sengaja tidak, membentuk setiap keputusan penyimpanan yang akan dibuat tim dari sini ke depan.

- **Amazon S3** adalah penyimpanan objek — file (objek) dalam kontainer bernama (bucket). Ia menyimpan salinan di setidaknya tiga Availability Zone untuk durabilitas sebelas-sembilan. S3 bukan filesystem: gunakan EFS untuk mount bersama, EBS untuk penyimpanan blok single-instance.
- File yang disimpan di instance EC2 terikat ke siklus hidup instance itu, menyebabkan bug foto-hilang ketika lalu lintas tersebar di banyak server. S3 memecahkan ini dengan independen dari instance mana pun.
- **Versioning** mempertahankan versi objek sebelumnya. **Aturan siklus hidup** mengotomasi transisi antar storage class dan membersihkan multipart upload yang tidak lengkap yang jika tidak akan mengakumulasi biaya tagihan yang diam-diam.
- Secara default, S3 bersifat privat. Aktifkan "Block Public Access" di tingkat akun. Layani objek publik melalui CloudFront dengan Origin Access Control alih-alih membuat bucket langsung publik.
- Storage class S3 membiarkan Anda mencocokkan biaya dengan frekuensi akses — tetapi awasi biaya durasi penyimpanan minimum sebelum mentransisikan objek berumur pendek ke tingkat Infrequent Access atau Glacier.

## Tips Ujian

*Domain SAA-C03 3 — Tugas 3.1 (solusi penyimpanan berperforma tinggi)*

- **S3 adalah penyimpanan objek, bukan penyimpanan blok.** Ketika skenario ujian butuh
  filesystem yang bisa di-mount banyak server, itu EFS. Ketika butuh disk
  untuk satu instance EC2, itu EBS. Ketika butuh menyimpan file, cadangan,
  gambar, atau data yang diakses melalui HTTP — itu S3.
- **Durabilitas sebelas-sembilan** berarti S3 mereplikasi data di banyak AZ
  secara otomatis. Anda tidak mengonfigurasi ini — itu defaultnya.
- **S3 bersifat Regional**, tetapi dapat diakses secara global. Bucket ada di Region tertentu,
  tetapi Anda bisa mengaksesnya dari mana saja.
- **Pre-signed URL** memungkinkan akses terbatas-waktu ke objek privat. Pola umum:
  aplikasi Anda menghasilkan pre-signed URL yang berlaku selama 15 menit, memberikannya kepada
  pengguna, pengguna mengunduh file langsung dari S3.
- **S3 Standard-IA** punya biaya durasi penyimpanan minimum (30 hari). Jangan gunakan
  untuk data yang akan Anda hapus dengan cepat. Ujian menguji apakah Anda tahu kompromi
  antar storage class.
- **Pohon keputusan storage class**: *sering diakses* → S3 Standard; *jarang diakses tetapi butuh pengambilan cepat* → S3 Standard-IA; *arsip diakses sesekali* → S3 Glacier Instant Retrieval; *arsip jarang diakses* → S3 Glacier Flexible Retrieval; *arsip kepatuhan, hampir tidak pernah diakses* → S3 Glacier Deep Archive.
- **Cross-Region Replication** mensyaratkan versioning diaktifkan di bucket sumber dan tujuan. Pertanyaan ujian tentang pemulihan bencana atau kedaulatan data sering melibatkan CRR.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa itu objek S3? Apa itu bucket S3? Mengapa menyimpan file
di S3 lebih baik daripada menyimpannya di disk lokal instance EC2?

*(Petunjuk: Pikirkan tentang apa yang terjadi pada file di instance EC2 jika instance
di-terminate. Apa yang dilakukan S3 secara berbeda?)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan media memproduksi video dokumenter. Mereka perlu menyimpan rekaman
4K asli (diakses sering selama produksi), potongan akhir yang diedit (diakses bulanan
untuk distribusi), dan master arsip (disimpan tanpa batas tetapi diakses paling banyak sekali
setahun untuk tujuan kepatuhan). Mereka ingin meminimalkan biaya penyimpanan sambil memenuhi
persyaratan akses setiap tingkat.

Strategi penyimpanan mana yang PALING BAIK memenuhi kebutuhan mereka?

A) Simpan rekaman asli di S3 Standard, potongan akhir di S3 Standard-IA, dan arsip
   di S3 Glacier Deep Archive  
B) Simpan semua konten di S3 Standard untuk performa dan kesederhanaan yang konsisten  
C) Simpan semua konten di penyimpanan instance EC2 untuk akses tercepat  
D) Simpan semua konten di S3 Glacier Deep Archive untuk meminimalkan biaya

**Petunjuk 1**: File yang berbeda punya pola akses yang berbeda. S3 menawarkan storage class
yang berbeda untuk frekuensi akses yang berbeda. Kelas mana yang cocok dengan "sering diakses"?

**Petunjuk 2**: Arsip yang diakses "paling banyak sekali setahun" tidak butuh pengambilan segera.
Storage class mana yang dirancang untuk pengarsipan jangka panjang dengan biaya minimum?

**Petunjuk 3**: Cocokkan frekuensi akses setiap tingkat dengan storage class yang sesuai.
Sering diakses = Standard. Bulanan = Standard-IA. Sekali setahun = Glacier Deep Archive.

**Jawaban**: A

**Penjelasan**: Strategi ini dengan benar mencocokkan setiap tingkat data dengan
storage class S3 yang sesuai. Rekaman asli yang sering diakses tetap di Standard untuk
akses segera tanpa biaya pengambilan. Potongan akhir yang diakses bulanan masuk ke Standard-IA
(biaya penyimpanan lebih rendah, biaya pengambilan terjangkau). Arsip yang diakses sekali setahun masuk ke
Glacier Deep Archive untuk biaya penyimpanan serendah mungkin.

**Mengapa bukan B?** Menyimpan semuanya di Standard itu sederhana tetapi mahal.

**Mengapa bukan C?** Penyimpanan instance EC2 bersifat sementara dan tidak sesuai untuk penyimpanan
media jangka panjang. Jika instance di-terminate, semua konten hilang.

**Mengapa bukan D?** Glacier Deep Archive punya waktu pengambilan hingga 12 jam. Menyimpan
rekaman produksi yang sering diakses di sana akan membuat pekerjaan produksi mustahil.

*Domain SAA-C03 3 — Tugas 3.1 / Domain 4 — Tugas 4.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus menyimpan foto pesanan yang diunggah pelanggan di S3. Sebuah regulasi perlindungan data
mensyaratkan bahwa foto pelanggan harus disimpan selama 7 tahun tetapi bisa dihapus setelah
itu. Tim juga ingin meminimalkan biaya menyimpan foto lama dari tahun-tahun sebelumnya.

Rancang strategi penyimpanan S3 untuk persyaratan ini. Storage class mana yang akan Anda
gunakan, dan kapan Anda akan bertransisi di antaranya? Apa yang akan Anda lakukan tentang persyaratan
penghapusan?

*(Petunjuk: Pikirkan tentang kebijakan siklus hidup. Tidak ada satu jawaban yang benar — telusuri
melalui kompromi biaya vs. waktu pengambilan.)*

## Adegan Pasca-Kredit

Leo memigrasikan foto menu ke S3 sore itu. Delapan ratus objek, tersimpan dengan aman
di tiga Availability Zone, dengan versioning diaktifkan.

"Mereka sebenarnya lebih aman sekarang daripada sebelumnya," katanya, dengan sedikit kepuasan.

"Mereka selalu lebih aman di S3," kata Priya. "Kita hanya menunggu sampai setelah kita membangun
masalah untuk memperbaikinya."

Leo menerima ini.

Keesokan paginya, Tom tiba dengan cetakan. Tagihan AWS, dianotasi dengan pena merah.

"Kita punya masalah basis data," katanya. "Kita menjalankan basis data pesanan kita di instance
EC2 yang sama dengan server web. Dan basis data menu kita. Dan catatan pelanggan kita."

Ia berhenti.

"Semuanya di mesin yang sama. Satu mesin. Semua data kita."

Maya melihat cetakan itu. Lalu ke Tom. Lalu ke langit-langit.

"Dan jika mesin itu rusak?"

Tom menunjuk ke anotasi pena merah.

Di bab berikutnya: perbedaan antara hard drive yang Anda sewa dan lemari arsip yang dibagikan seluruh kantor.
