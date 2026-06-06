# Bab 3: Siapa Anda, Tepatnya?

Saat itu lewat pukul sembilan pagi. Leo sudah di mejanya sejak pukul tujuh, kopi sudah dingin di samping keyboard. Kantor sunyi — Maya belum tiba, Tom sedang menelepon. Di luar, seseorang sedang memotong rumput.

Leo mengetik perintah itu sekali lagi.

Terminal mengembalikan dua kata: Access Denied.

Krisis Singapura sudah di belakang mereka. Region sudah diperbaiki, server berjalan di us-west-2, dan tim sejenak merasa cakap. Perasaan itu bertahan sekitar empat puluh delapan jam sebelum masalah baru muncul: Leo tidak bisa men-deploy ke produksi. Tidak ada yang menyiapkan izinnya. Tidak ada yang menyiapkan izin siapa pun. Akun AWS terbuka lebar di tingkat root dan terkunci rapat di mana-mana lainnya, dan tidak ada yang menyadarinya karena tidak ada yang mencoba.

"Saya sudah men-deploy-nya — oh," gumam Leo, menggulir balik melalui terminalnya. Ia telah men-deploy ke apa yang ia kira produksi selama seminggu. Itu staging. Lingkungan produksi yang sebenarnya tidak pernah disentuh.

Maya melihat dari balik bahunya ke pesan kesalahan. "Siapa yang memberimu izin itu?"

Leo berbalik. "Izin apa?"

"Izin untuk men-deploy ke produksi. Siapa yang menyiapkan itu?"

Leo membuka konsol AWS dan mulai mengklik melalui menu. Tidak ada yang melakukannya. Tidak ada
kebijakan, tidak ada role, tidak ada pemberian eksplisit. Juga tidak ada penolakan eksplisit — hanya
ketiadaan. Tidak ada seorang pun di Nimbus yang pernah duduk dan memikirkan siapa yang bisa melakukan apa.

Itulah masalahnya.

**Masalah Dengan Kata Sandi**

Kata sandi adalah model yang buruk untuk sistem komputer.

Bukan karena mereka selalu lemah. Karena mereka biner: Anda entah punya kata sandi
atau tidak. Jika Anda punya, Anda bisa melakukan apa pun yang diizinkan untuk dilakukan akun.

Itu baik-baik saja untuk satu pengguna di laptop pribadi mereka. Itu bencana untuk
infrastruktur cloud sebuah perusahaan.

Pertimbangkan apa yang perlu dikelola Nimbus: server web, basis data, penyimpanan file,
jaringan, peringatan tagihan, akun pengguna. Jika semuanya dilindungi oleh satu kata sandi —
atau bahkan satu set kredensial — maka siapa pun yang mendapatkan kata sandi itu mendapatkan segalanya.

Dan "segalanya" di AWS berarti kemampuan untuk menghapus basis data. Menyalakan server yang
menghasilkan tagihan $50.000. Mengeksfiltrasi setiap catatan pelanggan. Menghancurkan data cadangan.

Ada masalah lain di luar sifat biner kata sandi: kata sandi bersifat statis.
Mereka tidak kedaluwarsa secara otomatis. Mereka sering digunakan ulang di berbagai layanan. Mereka ditulis
di kertas. Mereka disimpan di spreadsheet berlabel "kata sandi JANGAN BAGIKAN." Mereka tetap dibagikan
saja, karena kenyamanan mengalahkan keamanan ketika mekanisme keamanannya adalah friksi.

Masalah "kredensial bersama" bukanlah cacat karakter. Itu masalah sistem. Ketika
satu-satunya cara untuk memberi seseorang akses sementara ke sistem adalah memberi mereka kata sandi
permanen, orang berbagi kata sandi. Solusinya adalah membangun sistem di mana akses sementara
dan berlingkup adalah default — bukan solusi sementara yang membutuhkan upaya heroik.

Itulah yang dilakukan IAM. Bukan sekadar "kata sandi yang lebih baik," tetapi model yang secara fundamental berbeda
di mana akses ditentukan oleh identitas dan kebijakan alih-alih oleh siapa yang tahu serangkaian
karakter.

Priya tidak mendeskripsikan ini dalam istilah yang tenang dan abstrak. Ia mendeskripsikannya sebagai sebuah cerita.

**Pelanggaran yang Berbiaya $80.000 dalam Empat Jam**

Seorang pengembang di sebuah startup mendorong skrip deployment GitHub Actions ke repositori publik mereka. Skrip itu berisi kredensial AWS yang di-hardcode sebagai variabel lingkungan — kesalahan yang cukup umum sehingga punya kategorinya sendiri dalam post-mortem keamanan cloud. Kredensial itu punya akses admin penuh ke akun AWS perusahaan, karena seseorang telah mengonfigurasinya seperti itu enam bulan sebelumnya untuk menghindari berurusan dengan kebijakan IAM.

Kredensial itu ada di file selama kira-kira enam menit sebelum sebuah pemindai otomatis — dijalankan oleh penyerang, bukan peneliti keamanan — menemukannya.

Pemindai mengindeks kredensial, menilai izin akun, dan mulai menyalakan instance GPU di banyak region. Instance GPU itu mahal. Mereka juga berguna untuk penambangan kriptokurensi. Dalam jam pertama, empat puluh tujuh instance `p3.8xlarge` berjalan di `us-east-1`, `eu-west-1`, dan `ap-southeast-1`.

Sebuah `p3.8xlarge` berharga sekitar $12 per jam. Empat puluh tujuh dari mereka berharga $564 per jam.

Pada saat peringatan tagihan startup berbunyi — dikonfigurasi pada $1.000 per hari, yang tidak ada yang berpikir untuk memperketatnya — empat jam telah berlalu. Tagihan mendekati $2.200 dan terus naik.

Pada saat seseorang memahami apa yang terjadi dan mencabut kredensial, tagihan telah mencapai $3.400 untuk beberapa jam itu. Tapi biaya sebenarnya datang kemudian: audit mengungkapkan bahwa penyerang telah menambang selama berminggu-minggu, diam-diam, di malam hari, menggunakan set kedua kredensial yang bocor yang tidak ada yang menyadarinya. Total kerusakan pada saat audit selesai: lebih dari $80.000.

"Dan mereka tutup?" tanya Tom.

"Tiga bulan kemudian," kata Priya. "Para investor menarik diri. Pelanggaran diungkapkan. Liputan pers membuat penggalangan dana mustahil."

Ruangan sunyi.

"Jadi apa alternatifnya?" tanya Tom.

**Konsep: Identity and Access Management**

Alternatifnya adalah sistem di mana Anda tidak memberi semua orang kunci yang sama.

Bayangkan sebuah gedung perkantoran di mana setiap lantai punya area berbeda, dan setiap karyawan
punya kartu akses yang hanya membuka pintu yang mereka butuhkan untuk pekerjaan mereka. Kartu akses magang
berfungsi di lantai tiga. Kartu akses akuntan membuka kantor keuangan tetapi tidak
ruang server. Tidak ada yang berjalan melalui pintu yang tidak mereka punya alasan untuk dilewati.

Itulah model yang digunakan AWS.

AWS menyebut sistem ini **IAM**: Identity and Access Management.

IAM adalah sistem kartu akses untuk seluruh akun cloud Anda. Anda menentukan siapa yang ada
(identitas), apa yang boleh mereka lakukan (izin), dan menerapkan izin itu
melalui kebijakan. Gedung punya puluhan lantai. IAM memastikan setiap orang hanya bisa
mencapai lantai yang mereka butuhkan.

Analogi kartu akses meluas lebih jauh. Di gedung yang dikelola dengan baik, Anda tahu kapan pun siapa yang punya akses ke apa. Anda bisa mencetak laporan: inilah hak akses setiap kartu akses. Inilah siapa yang telah berada di ruang server dalam 30 hari terakhir. Inilah kartu yang belum digunakan dalam 90 hari (indikator yang mungkin dari kartu karyawan yang diberhentikan yang tidak dinonaktifkan).

IAM menyediakan visibilitas yang sama. Setiap tindakan yang diambil melalui IAM — setiap panggilan API, setiap login konsol, setiap pemberian izin — dicatat di **AWS CloudTrail**. Jika Anda perlu tahu siapa yang menghapus basis data pada pukul 2 pagi di hari Selasa, CloudTrail punya jawabannya. Jika Anda perlu menunjukkan kepada auditor bahwa hanya pengguna yang berwenang yang punya akses ke sistem produksi, CloudTrail menyediakan buktinya.

AWS CloudTrail secara otomatis menyimpan riwayat 90 hari peristiwa manajemen, yang bisa dibaca dari konsol. Tapi 90 hari punya cara untuk menjadi tidak cukup ketika tim keamanan Anda perlu mengaudit sesuatu dari kuartal lalu. Untuk pencatatan jangka panjang yang persisten — dan untuk peringatan — Anda perlu membuat **Trail**, yang menulis semua peristiwa ke bucket S3 dan bisa melakukan streaming ke CloudWatch Logs. Trail tidak otomatis; itu sesuatu yang Anda konfigurasi sekali lalu lupakan. Sampai Anda membutuhkannya.

Kombinasi kontrol akses IAM dan pencatatan audit CloudTrail adalah yang memungkinkan organisasi besar menjalankan akun AWS dalam skala besar dengan percaya diri: akses ditentukan dan ditegakkan oleh IAM; setiap penggunaan akses itu dicatat oleh CloudTrail.

**Analogi Rumah Sakit**

Berikut cara kedua untuk memikirkannya — yang membuat hierarki akses lebih intuitif.

Bayangkan sebuah rumah sakit. Bukan hanya gedung fisiknya, tetapi struktur organisasi lengkap dari orang, peran, dan data.

**Resepsionis** bisa melihat jadwal janji pasien dan informasi asuransi. Mereka bisa mendaftarkan masuk dan keluar pasien. Mereka tidak bisa mengakses rekam medis, tidak bisa memodifikasi resep, tidak bisa melihat riwayat bedah.

**Perawat** bisa mengakses rekam medis untuk pasien di bangsal mereka. Mereka bisa memberikan obat sesuai perintah dokter. Mereka tidak bisa meresepkan obat. Mereka tidak bisa mengotorisasi operasi.

**Dokter** bisa melihat dan memodifikasi rekam medis, menulis resep, dan memesan tes. Mereka tidak bisa mengakses sistem penggajian. Mereka tidak bisa memodifikasi resep dokter lain tanpa override spesifik.

**Ahli bedah** bisa mengakses sistem ruang operasi. Mereka punya izin spesifik untuk rekam bedah yang tidak dibutuhkan sebagian besar dokter.

**Staf kebersihan** bisa mengakses denah lantai dan jadwal ruangan. Mereka tidak bisa mengakses data pasien apa pun.

Setiap orang di rumah sakit punya akses yang mereka butuhkan untuk pekerjaan mereka — dan hanya itu. Resepsionis tidak punya akses bedah. Staf kebersihan tidak melihat rekam pasien. Dan yang krusial: jika kartu akses anggota staf kebersihan dicuri, penyerang mendapatkan jadwal kebersihan. Mereka tidak mendapatkan rekam pasien. Radius ledakan pelanggaran terbatas pada apa yang bisa diakses kartu akses itu.

Inilah cara IAM bekerja. Setiap identitas — setiap pengguna, setiap layanan, setiap proses otomatis — mendapatkan persis izin yang dibutuhkannya. Tidak lebih.

Tom bersandar. "Jadi Leo adalah perawat, dan saya akuntan."

"Sesuatu seperti itu," kata Priya. "Dan tidak satu pun dari kalian adalah ahli bedah."

"Siapa ahli bedahnya?"

"Tidak ada, sehari-hari," kata Priya. "Akun root adalah ahli bedah. Ia hanya keluar untuk prosedur yang spesifik dan terdokumentasi."

**Blok Penyusun IAM**

IAM punya empat konsep inti. Mereka saling membangun.

**User** adalah identitas individu. Maya punya user IAM. Tom punya user IAM.
Setiap user punya kredensialnya sendiri — dan seharusnya hanya punya izin yang
secara spesifik mereka butuhkan.

User IAM punya dua jenis kredensial: **kata sandi** untuk akses konsol (masuk ke antarmuka web AWS) dan **access key** (sebuah key ID dan secret key) untuk akses programatik melalui CLI atau SDK. Anda tidak selalu butuh keduanya. Pengembang yang hanya menggunakan CLI tidak butuh kata sandi konsol. Pengguna non-teknis yang hanya butuh konsol tidak butuh access key. Berikan hanya yang dibutuhkan.

**Group** adalah kumpulan user. Alih-alih mengatur izin untuk Maya, Tom,
Priya, dan Leo secara individu, Anda membuat group "Developers" dengan izin pengembang
dan menambahkan mereka ke dalamnya. Ketika orang kelima bergabung, Anda menambahkan mereka ke group dan mereka
langsung mewarisi izin yang tepat.

Manfaat praktis dari group adalah kemudahan pemeliharaan. Jika group "Developers" butuh izin baru — katakanlah, akses ke bucket S3 baru — Anda menambahkannya ke group sekali dan semua pengembang langsung memilikinya. Tanpa group, Anda akan memperbarui setiap user secara individu, yang menciptakan peluang untuk inkonsistensi dan melewatkan orang.

**Role** adalah identitas sementara yang bisa *diasumsikan* oleh sesuatu — seseorang, sebuah
layanan, atau akun AWS lain. Kita akan membahas role secara mendalam di Bab 14. Untuk sekarang: jika
User adalah karyawan permanen, Role adalah lencana pengunjung. Ia memberi akses spesifik
untuk waktu atau tujuan spesifik.

Penggunaan Role yang paling penting untuk bab ini: IAM Role untuk instance EC2. Ketika Anda melampirkan Role ke instance EC2, aplikasi yang berjalan di instance itu bisa membuat panggilan API AWS menggunakan izin Role — tanpa kredensial statis yang disimpan di mana pun. Kredensialnya sementara, dirotasi secara otomatis oleh AWS, dan berlingkup pada kebijakan Role. Ini menghilangkan masalah "kredensial dalam file konfigurasi" sepenuhnya.

**Policy** adalah aturan izin yang sebenarnya. Sebuah policy adalah dokumen (ditulis dalam JSON
secara internal, tetapi Anda tidak perlu menghafal formatnya) yang mengatakan: "Pemegang
policy ini DIIZINKAN untuk melakukan tindakan X pada sumber daya Y." Atau "DITOLAK tindakan Z."

AWS menyediakan ratusan **managed policy** — kebijakan yang sudah ditulis untuk kasus penggunaan umum. `AmazonS3ReadOnlyAccess` memberi akses baca ke semua bucket S3. `AmazonEC2FullAccess` memberi kontrol EC2 penuh. Untuk penggunaan produksi, Anda sering menginginkan **customer-managed policy** — kebijakan yang Anda tulis sendiri, berlingkup secara presisi pada sumber daya dan tindakan yang benar-benar dibutuhkan aplikasi Anda.

Model evaluasi IAM adalah: secara default, segalanya ditolak. Izin harus
diberikan secara eksplisit. Jika sebuah policy tidak mengatakan Anda bisa melakukan sesuatu, Anda tidak bisa.

**Prinsip Hak Istimewa Terkecil**

Beri orang dan sistem hanya akses yang mereka butuhkan untuk melakukan pekerjaan mereka. Tidak lebih.

Priya menyebut ini "prinsip hak istimewa terkecil." Kedengarannya jelas. Dalam praktiknya,
sebagian besar tim melanggarnya terus-menerus — bukan dengan jahat, tetapi karena kenyamanan.

"Bisakah kita beri Leo akses admin saja agar ia bisa men-deploy lebih cepat?"

Tidak.

"Bisakah kita gunakan akun root saja untuk segalanya?"

Sama sekali tidak.

Akun root adalah kunci utama untuk seluruh akun AWS Anda. Ia bisa melakukan apa pun,
termasuk menutup akun itu sendiri. Anda harus membuatnya sekali, menyiapkan autentikasi
multi-faktor, lalu tidak pernah menggunakannya lagi untuk pekerjaan sehari-hari.

Ada persis segelintir tugas yang membutuhkan akun root: mengubah alamat email akun, melihat informasi tagihan yang tidak didelegasikan, menutup akun, dan beberapa operasi administratif lain yang secara eksplisit dibatasi AWS untuk root. Untuk segala hal lainnya — membuat user, men-deploy infrastruktur, mengakses basis data — Anda menggunakan user dan role IAM. Akun root adalah untuk manajer gedung. Semua orang lain punya kartu akses yang sesuai.

Priya membuat user IAM terpisah untuk semua orang sore itu. Ia memberi Leo izin
untuk men-deploy ke lingkungan pengembangan. Bukan produksi. Bukan tagihan. Bukan jaringan.
Hanya deployment.

"Ini terasa membatasi," kata Leo.

"Begitulah cara Anda tahu itu benar," balas Priya.

Batas pengembangan-versus-produksi adalah garis hak-istimewa-terkecil pertama dan paling penting yang digambar Priya. Pengembang perlu bergerak cepat dalam pengembangan: membuat sumber daya, menguji konfigurasi, membuat kesalahan. Tapi produksi berbeda. Perubahan produksi perlu disengaja, ditinjau, dan dijalankan melalui proses yang terkendali. Memberi pengembang akses produksi langsung sama dengan memberi mereka kemampuan untuk membuat kesalahan produksi pada kecepatan pengembangan.

Seiring waktu, Priya membangun sistem di mana akses produksi diberikan sementara melalui proses asumsi role: seorang pengembang yang perlu membuat perubahan produksi meminta aksesnya, mendapatkannya untuk jendela 4 jam, membuat perubahan, dan akses kedaluwarsa secara otomatis. Jendela itu dicatat di CloudTrail. Akses tidak bisa digunakan setelah kedaluwarsa. Produksi dilindungi bukan dengan menolak akses secara permanen, tetapi dengan membuat akses terbatas waktu dan dapat diaudit.

Anda mungkin bertanya-tanya: jika segalanya ditolak secara default, mengapa akun root punya akses penuh? Akun root itu istimewa — ia melewati IAM sepenuhnya. Itulah persis mengapa Anda menguncinya. Setiap tindakan lain di AWS melewati rantai evaluasi IAM, di mana Allow yang hilang sama dengan Deny.

**Radius Ledakan: Mengapa Hak Istimewa Terkecil Menyelamatkan Perusahaan**

Ada konsep yang digunakan insinyur keamanan untuk memikirkan kompromi kredensial: **radius ledakan**.

Radius ledakan adalah kerusakan maksimum yang bisa dilakukan penyerang jika mereka memperoleh kredensial tertentu.

Penyerang dengan kredensial root sebuah akun AWS punya radius ledakan tak terbatas. Mereka bisa menghapus setiap sumber daya, mengeksfiltrasi setiap byte data, menyalakan instance GPU di setiap Region, dan menutup akun. Kredensial itu sendiri tidak berisi batasan.

Penyerang dengan kredensial IAM Leo — berlingkup pada deployment ke lingkungan pengembangan dan membaca dari satu bucket S3 — punya radius ledakan yang kecil. Mereka bisa men-deploy ke dev. Mereka bisa membaca beberapa file. Mereka tidak bisa menyentuh produksi. Mereka tidak bisa mengakses basis data. Mereka tidak bisa melihat tagihan. Mereka tidak bisa menyalakan instance GPU.

Cerita pelanggaran dari sebelumnya punya radius ledakan yang besar karena kredensial pengembang adalah admin. Jika kredensial yang sama itu berlingkup pada pekerjaan mereka yang sebenarnya — men-deploy ke satu lingkungan spesifik — kerusakannya akan jauh lebih kecil. Serangan mungkin tetap terjadi. Hasilnya akan berbeda.

Inilah mengapa hak istimewa terkecil bukan sekadar kebijakan. Itu arsitektur. Setiap izin yang tidak Anda berikan adalah radius ledakan yang tidak Anda miliki.

**Apa yang Terjadi Ketika Anda Salah Tentang Ini**

Tiga skenario, dalam urutan keparahan yang meningkat:

**Skenario 1**: Seorang karyawan dengan akses admin meninggalkan perusahaan. Tidak ada yang menonaktifkan
akunnya. Tiga bulan kemudian, mereka masih punya akses. Ini terjadi terus-menerus.
IAM memecahkannya: Anda menonaktifkan user. Seketika, di mana-mana.

Ini adalah mode kegagalan IAM yang paling umum, dan sepenuhnya dapat dicegah. Sebagian besar organisasi
punya proses untuk mencabut akses fisik (mengembalikan lencana, mengembalikan laptop) tetapi
mengabaikan IAM. Daftar periksa offboarding yang mencakup "nonaktifkan user IAM" dan
"hapus dari semua group IAM" bukanlah tantangan teknik yang kompleks — itu adalah
disiplin proses. Tim yang melakukannya secara konsisten adalah mereka yang tidak pernah menemukan apa yang
terjadi ketika mantan karyawan masih bisa mengakses basis data produksi.

**Skenario 2**: Laptop seorang pengembang disusupi. Penyerang menemukan kredensial AWS
yang disimpan dalam file konfigurasi dengan izin admin penuh. Karena kredensial punya akses
luas, penyerang bisa melakukan apa pun: menambang kriptokurensi, mencuri data, menghapus cadangan.
Dengan hak istimewa terkecil: kredensial hanya berfungsi untuk lingkup terbatasnya. Radius ledakan terkendali.

Pola kredensial-dalam-file-konfigurasi lebih umum dari seharusnya. Pengembang
sering menyimpan kredensial AWS di `~/.aws/credentials` untuk pengembangan lokal — yang
baik-baik saja. Masalahnya adalah ketika kredensial itu punya akses tingkat produksi alih-alih
berlingkup pada lingkungan sandbox. Kredensial pengembangan harus berlingkup pada
lingkungan pengembangan. Akses produksi harus membutuhkan langkah eksplisit untuk diasumsikan, bukan
hadir di setiap laptop sepanjang waktu.

**Skenario 3**: Aplikasi yang ditulis dengan buruk secara tidak sengaja mengekspos kredensial AWS dalam
log-nya. Jika kredensial itu punya akses luas, Anda punya pelanggaran katastrofik. Jika mereka
punya akses sempit — hanya ke bucket S3 spesifik yang dibutuhkan aplikasi — paparannya
terbatas dan terkendali.

Skenario kredensial-aplikasi-dalam-log itu halus. Sering terjadi ketika kode debugging
mencatat konteks permintaan penuh — termasuk header otorisasi — atau ketika error
handler menserialisasi semua variabel lingkungan (termasuk `AWS_ACCESS_KEY_ID`) ke file
log. Pengamannya di sini adalah IAM Role untuk EC2, yang menghilangkan kredensial statis dari
lingkungan aplikasi sepenuhnya. Jika tidak ada kredensial statis, mereka tidak bisa
muncul di log.

Polanya: akses harus berlingkup pada minimum. Selalu. Bukan karena Anda tidak mempercayai
orang-orang Anda, tetapi karena Anda tidak bisa mengendalikan apa yang terjadi pada kredensial yang disusupi.

**Jika Akses Luas Maka Kenyamanan Tapi Paparan**

Selalu ada godaan untuk memberi tim akses yang lebih luas dari yang mereka butuhkan — itu membuat
deployment lebih cepat, mengurangi friksi, menghindari momen "Access Denied" yang merusak
alur. Jika Anda memberi semua orang akses admin, maka deployment lancar dan tidak ada yang
terblokir — tetapi ketika kredensial bocor (dan mereka bocor), penyerang mewarisi hak admin
penuh. Satu laptop yang disusupi menjadi pelanggaran akun lengkap. Tulis izin minimum
terlebih dahulu. Perluas hanya ketika sesuatu gagal. Aturan itu menyelamatkan perusahaan.

**Autentikasi Multi-Faktor: Kunci Kedua**

Bahkan dengan hak istimewa terkecil, kredensial bisa dicuri. Kata sandi bisa ditebak,
di-phishing, atau bocor. IAM mengatasi ini dengan **Autentikasi Multi-Faktor (MFA)**.

MFA membutuhkan sesuatu yang Anda *ketahui* (kata sandi) ditambah sesuatu yang Anda *miliki* (sebuah ponsel,
kunci perangkat keras). Bahkan jika penyerang mencuri kata sandi Anda, mereka tidak bisa masuk tanpa
juga memiliki ponsel Anda.

MFA harus diaktifkan untuk setiap user IAM. Itu tidak bisa dinegosiasikan untuk akun root.

Priya menghabiskan sore itu menyiapkannya untuk semua orang. Itu tidak berjalan mulus.

Aplikasi authenticator Leo mendaftarkan akun yang salah dua kali. Ia harus memindai kode QR tiga kali karena jam di laptopnya sedikit tidak sinkron, yang menyebabkan token berbasis waktu gagal. Pada percobaan ketiga, itu berhasil.

"Apakah ada cara untuk melakukan ini tanpa aplikasi?" tanya Leo, melihat ponselnya.

"Kunci perangkat keras," kata Priya. "Perangkat fisik yang dicolokkan ke USB. Lebih aman daripada aplikasi. Lebih mahal."

"Berapa lebih mahal?"

"Sekitar $50 per kunci. Anda akan ingin dua, jika Anda kehilangan satu."

Tom menulis "$100 per pengembang" di buku catatannya.

"Kita membelinya," kata Priya. "Untuk akun root setidaknya."

Tom bertanya apakah itu terlalu banyak friksi secara keseluruhan. Priya membuka cerita pelanggaran lagi.

Tom menyiapkan MFA segera.

"Dan bagaimana jika seseorang mencoba masuk paksa saat kita di tengah transisi ini?" tanya Priya. "Sebelum semua orang punya MFA yang diaktifkan?"

Tidak ada yang punya jawaban yang baik. Ia menyiapkan MFA untuk akun root terlebih dahulu, sebelum siapa pun lainnya.

**IAM Access Analyzer: Pasang Mata Kedua**

Priya punya satu alat lagi untuk ditunjukkan kepada tim setelah penyiapan MFA selesai.

"Yang ini berjalan secara otomatis," katanya, membuka tab konsol baru.

**IAM Access Analyzer** adalah layanan yang terus-menerus menganalisis kebijakan IAM Anda dan menandai apa pun yang memberi akses ke sumber daya di luar akun Anda — atau di luar yang akan Anda harapkan.

Ia menemukan sesuatu pada proses pertama.

Sebuah bucket S3 — yang disiapkan Leo sebagai "sementara" tiga minggu lalu lalu dilupakan — punya bucket policy yang mengizinkan akses baca publik. Bucket itu berisi beberapa file data uji, tidak ada yang sensitif. Tapi ia juga berisi folder yang dinamai Leo `db-backups-staging` dan diisi dengan beberapa file SQL yang diekspor untuk menguji proses impor.

"Apakah ada sesuatu yang sensitif dalam file SQL itu?" tanya Priya.

Leo melihat nama folder. Lalu file di dalamnya. Lalu langit-langit.

"Saya mengekspor basis data staging," katanya. "Yang punya salinan data pelanggan produksi awal."

Priya menutup laptopnya perlahan.

Bucket disetel ke privat dalam lima menit. Access Analyzer terus memantau kebijakan masa depan apa pun yang membuka sumber daya secara tak terduga.

"Anggap itu sebagai alarm perimeter," kata Priya. "Setiap kali seseorang secara tidak sengaja meninggalkan pintu terbuka, ia memberi tahu kita."

Anda mungkin bertanya-tanya: apakah IAM Access Analyzer menggantikan tinjauan kebijakan manual? Tidak. Ia adalah alat deteksi, bukan alat pencegahan. Ia memberi tahu Anda tentang akses yang telah diberikan — ia tidak bisa memberi tahu Anda apakah akses itu disengaja. Tinjauan manusia tentang "apakah kebijakan ini benar?" tetap harus terjadi. Access Analyzer hanya memastikan jendela yang terbuka tidak luput dari perhatian.

## Kekuatan dan Keterbatasan

**IAM adalah alat yang tepat untuk**:

- Mengontrol siapa dan apa yang bisa mengakses setiap sumber daya AWS
- Menerapkan hak istimewa terkecil di seluruh user, layanan, dan batas antar-akun
- Menghilangkan kebutuhan untuk berbagi kredensial berumur panjang antar sistem
- Setiap tindakan IAM dicatat secara otomatis, memberi Anda jejak audit tentang siapa yang melakukan apa dan kapan (dibahas di Bab 14)
- Akses lintas-akun: IAM Role di Akun A bisa diasumsikan oleh principal di Akun B, memungkinkan berbagi sumber daya yang terkendali antar akun AWS tanpa berbagi kredensial

**Di mana IAM menjadi sulit**: Kebijakan IAM bisa tumbuh menjadi ratusan pernyataan di seluruh puluhan role, dan men-debug kesalahan "Access Denied" membutuhkan pemahaman tentang mana dari kebijakan itu yang efektif — tugas yang lebih sulit dari kedengarannya. Kesalahan IAM yang paling umum bukanlah terlalu sedikit akses — melainkan terlalu banyak. Kebijakan yang terlalu permisif yang dibuat untuk "agar berfungsi saja" menjadi kewajiban keamanan yang menyakitkan untuk dibatalkan setelahnya. Tulis izin minimum terlebih dahulu. Perluas hanya ketika sesuatu gagal.

Ada tantangan praktis dengan IAM dalam skala besar: **penyebaran kebijakan (policy sprawl)**. Organisasi yang telah menjalankan AWS selama beberapa tahun sering punya puluhan atau ratusan kebijakan kustom, banyak di antaranya tumpang tindih, beberapa tidak pernah digunakan, dan beberapa saling bertentangan dengan cara yang tidak ada yang menyadari karena kontradiksi hanya penting untuk kasus tepi. AWS menyediakan **IAM Access Analyzer** (yang kita perkenalkan di bab ini) dan alat **simulasi kebijakan IAM** untuk membantu mengaudit dan merasionalisasi kebijakan. Tapi strategi yang paling efektif adalah membangun kebijakan yang bersih dari awal dan mengaudit secara teratur — alih-alih membiarkan kebijakan menumpuk dan mencoba menguraikannya nanti.

Priya menyiapkan tinjauan IAM triwulanan: daftar semua role dan kebijakan, periksa mana yang aktif digunakan melalui log CloudTrail, tandai kredensial yang tidak digunakan atau kebijakan yang terlalu luas untuk dihapus atau dibatasi. Tinjauan itu memakan dua jam per kuartal dan menangkap tiga masalah kebijakan di tahun pertamanya.

"Ini bukan pekerjaan yang mengasyikkan," katanya. "Tapi tinjauan akses adalah cara Anda menemukan hal-hal yang akan menjadi katastrofik jika seseorang menyadarinya terlebih dahulu."

## Ringkasan

Kata sandi Admin123 adalah gejalanya. Penyakitnya adalah Nimbus tidak punya strategi kontrol akses sama sekali — kredensial root bersama, tidak ada role, tidak ada kebijakan, tidak ada jejak audit. IAM tidak hanya memperbaiki gejala; ia memaksa tim menjawab pertanyaan yang telah mereka hindari: siapa, tepatnya, yang diizinkan untuk melakukan apa? Jawaban atas pertanyaan itu adalah fondasi dari setiap arsitektur AWS yang aman.

- **IAM** (Identity and Access Management) adalah bagaimana Anda mengontrol siapa yang bisa melakukan apa di AWS. Blok penyusun inti adalah: **User**, **Group**, **Role**, dan **Policy**.
- Secara default, segalanya di AWS **ditolak**. Izin harus diberikan secara eksplisit.
- **Prinsip Hak Istimewa Terkecil** berarti memberi setiap identitas hanya akses yang dibutuhkannya — meminimalkan **radius ledakan** jika kredensial pernah disusupi.
- **Akun root** bisa melakukan apa pun, termasuk hal-hal katastrofik. Kunci di balik MFA dan gunakan sesedikit mungkin.
- Aktifkan **MFA** untuk setiap user IAM. Tidak bisa dinegosiasikan — dalam ujian maupun dalam produksi.

## Tips Ujian

*Domain SAA-C03 1 — Tugas 1.1 (akses aman ke sumber daya AWS)*

- **Segalanya ditolak secara default.** "Allow" eksplisit diperlukan. Jika sebuah kebijakan
  tidak menyebutkan suatu tindakan, tindakan itu ditolak.
- **Deny eksplisit selalu menang.** Jika ada kebijakan dalam rantai yang menolak suatu tindakan, deny
  itu tidak bisa ditimpa oleh Allow di mana pun lain dalam rantai. Ini menjebak banyak
  kandidat.
- **Akun root ≠ admin IAM.** Akun root adalah kredensial terpisah dari IAM.
  Anda tidak bisa menghapus akun root. Anda *bisa* (dan seharusnya) membatasi kapan ia digunakan.
- **IAM bersifat global**, bukan Regional. User, group, role, dan kebijakan IAM ada
  di seluruh akun AWS, bukan per-Region.
- **Role adalah cara yang disukai untuk memberi akses ke layanan AWS.** Jika instance EC2
  perlu mengakses S3, Anda melampirkan IAM Role ke instance — Anda tidak menyimpan
  kredensial di mesin. Pola ini muncul terus-menerus dalam ujian.
- **IAM Access Analyzer** menghasilkan temuan ketika sumber daya dapat diakses dari luar akun atau dari luar organisasi. Ketika skenario ujian menyebutkan mendeteksi akses eksternal yang tidak diinginkan ke S3 atau KMS, Access Analyzer adalah jawabannya.
- **MFA untuk akun root itu wajib**, bukan opsional, dalam konteks praktik terbaik keamanan AWS. Pertanyaan ujian tentang mengamankan akun root selalu menyertakan MFA sebagai bagian dari jawaban yang benar.
- **Permission boundary** adalah fitur IAM lanjutan (dibahas di Bab 14) yang membatasi izin maksimum yang bisa dimiliki user atau role IAM, bahkan jika kebijakan mereka memberi lebih. Pertanyaan ujian tentang "mencegah eskalasi hak istimewa" atau "menetapkan plafon izin maksimum" mengarah ke permission boundary.
- **Service Control Policies (SCP)** adalah kebijakan tingkat-organisasi yang membatasi apa yang bisa dilakukan di akun anggota AWS Organization. Mereka bekerja di atas tingkat IAM — bahkan administrator akun tidak bisa melebihi batas yang ditetapkan SCP. Ketika skenario ujian melibatkan tata kelola keamanan multi-akun, pikirkan SCP.
- **CloudTrail** mencatat semua panggilan API IAM. Ketika skenario ujian menanyakan "bagaimana Anda akan mengaudit user mana yang membuat perubahan pada kebijakan IAM," jawabannya adalah CloudTrail. Setiap tindakan IAM — membuat user, memodifikasi kebijakan, mengasumsikan role — dicatat. Riwayat peristiwa 90 hari bersifat otomatis dan gratis; untuk retensi jangka panjang dan peringatan, Anda harus membuat Trail yang mengirimkan log ke bucket S3.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa perbedaan antara User IAM, Group, dan Role?
Kapan Anda akan menggunakan masing-masing?

*(Petunjuk: Pikirkan tentang analogi gedung kartu akses — mana yang merupakan kartu permanen,
mana yang merupakan pengelompokan departemen, dan mana yang merupakan lencana pengunjung?)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan menjalankan aplikasi web di instance EC2 yang perlu membaca file
dari bucket S3. Seorang pengembang junior menyarankan menyimpan access key AWS langsung di
kode aplikasi pada instance EC2. Tim keamanan keberatan.

Apa solusi yang PALING aman dan tepat secara operasional?

A) Simpan access key dalam variabel lingkungan pada instance EC2 alih-alih
   kode  
B) Buat user IAM khusus dengan izin baca S3 dan bagikan kredensial
   dengan tim pengembangan  
C) Lampirkan IAM Role dengan izin baca S3 yang sesuai langsung ke instance
   EC2  
D) Gunakan kredensial akun root untuk memberi aplikasi akses penuh ke semua sumber daya
   AWS

**Petunjuk 1**: Masalah dengan menyimpan kredensial di mana pun pada instance adalah bahwa
kredensial bisa bocor. Apakah ada cara untuk memberi instance EC2 akses tanpa
menggunakan kredensial sama sekali?

**Petunjuk 2**: AWS punya mekanisme di mana layanan bisa diberi izin tanpa
membutuhkan kredensial statis. Apa nama mekanisme itu?

**Petunjuk 3**: IAM Role bisa dilampirkan ke instance EC2. Ketika dilampirkan, instance
secara otomatis menerima kredensial sementara yang dirotasi oleh AWS. Tidak ada kredensial
statis yang dibutuhkan.

**Jawaban**: C

**Penjelasan**: Melampirkan IAM Role ke instance EC2 adalah pola yang benar.
Instance secara otomatis mendapatkan kredensial sementara yang berotasi melalui layanan
metadata EC2. Tidak ada kredensial berumur panjang untuk bocor, dirotasi, atau secara tidak sengaja
di-commit ke repositori.

**Mengapa bukan A?** Variabel lingkungan pada instance EC2 masih bisa bocor —
melalui log aplikasi, endpoint debugging, atau jika instance disusupi.
Kredensial statis adalah masalahnya, bukan lokasinya.

**Mengapa bukan B?** Membuat user IAM bersama dan mendistribusikan kredensial ke tim
melanggar hak istimewa terkecil dan membuat rotasi kredensial menjadi mimpi buruk. Jika satu orang
pergi, Anda tidak bisa dengan mudah mencabut hanya akses mereka tanpa mengubah kredensial bersama.

**Mengapa bukan D?** Menggunakan kredensial akun root untuk aplikasi apa pun adalah pelanggaran
keamanan yang parah. Akun root punya akses tak terbatas dan kredensialnya tidak boleh
meninggalkan kendali pemilik akun.

*Domain SAA-C03 1 — Tugas 1.1 (IAM role, hak istimewa terkecil)*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus akan menerima tiga pengembang baru bulan depan. Masing-masing akan butuh tingkat
akses yang berbeda: satu bekerja di lapisan basis data, satu di server aplikasi, satu di
file statis front-end. Ada juga pipeline CI/CD yang perlu men-deploy kode.

Rancang struktur IAM untuk skenario ini. User, group, role, dan kebijakan apa
yang akan Anda buat? Apa batas hak-istimewa-terkecil yang paling penting untuk ditegakkan?

*(Tidak ada satu jawaban yang benar. Pikirkan tentang meminimalkan radius ledakan jika ada satu
identitas yang disusupi.)*

## Adegan Pasca-Kredit

Pada akhir hari, setiap user IAM punya MFA yang diaktifkan. Akun Leo telah dikurangi
menjadi akses tingkat-pengembang: men-deploy ke lingkungan dev, membaca dari bucket konfigurasi
bersama, tidak ada yang lain.

Ia telah mencoba, sekali, mengakses basis data produksi.

Access denied.

"Apakah ini rasanya dipercaya tetapi tidak terlalu banyak?" tanyanya.

"Itu persis seperti rasanya," kata Priya.

Keesokan paginya, Tom tiba lebih awal dan menemukan sesuatu yang membuatnya segera memanggil
tim masuk.

Di konsol AWS, ia bisa melihat bahwa situs web mereka mendapatkan lalu lintas. Lebih dari
yang mereka harapkan. Dan server web — milik Leo yang asli — berjalan panas. Sangat panas.

"Kita punya seratus pengguna bersamaan," kata Tom. "Dan satu server."

Di bab berikutnya: server pertama — menyewa komputer di pusat data orang lain.
