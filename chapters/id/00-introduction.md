# Bab 0: Sebelum Kita Mulai

Maya sedang berdiri di belakang meja kasir restoran keluarganya pada suatu malam Jumat ketika
pikiran itu muncul.

Mereka sudah buka selama empat tahun. Makanannya enak — orang-orang berkendara melintasi kota untuk
makan arepa. Tetapi setiap kali seseorang menelepon untuk memesan, jalurnya sibuk. Setiap
kali seseorang berkendara untuk mengambil makanan yang tidak pernah benar-benar mereka pesan, itu karena
mereka sudah menelepon dan menyerah.

Pesanan hilang. Uang pergi begitu saja sebelum sempat masuk.

Dan bagian terburuknya adalah tidak ada yang bisa menunjuk satu kegagalan dramatis.

Tidak ada yang meledak. Tidak ada yang rusak. Tidak ada penjahat, tidak ada spanduk pemadaman, tidak ada
layar rusak yang jelas.

Itu hanya gesekan. Gesekan kecil, sunyi, dan mahal.

"Kita kehilangan pesanan setiap Jumat," kata Maya kepada tidak siapa pun secara khusus. "Bukan karena makanannya jelek. Karena tidak ada yang bisa menghubungi kita. Kita butuh situs web."

Sepupunya, Tom, mendongak dari spreadsheet yang sedang ia perbarui secara manual. Tom — mantan
administrator sistem yang menukar ruang server dengan bisnis keluarga — sudah
mengelola "sistem" restoran — kata yang murah hati untuk sebuah Google Sheet bersama dan sebuah
papan tulis — selama dua tahun terakhir.

"Situs web," ia mengulang. "Dan di mana tepatnya sebuah situs web itu berada?"

Maya membuka mulutnya. Menutupnya.

Ia tidak tahu.

**Pertanyaan yang Terdengar Sederhana**

Di mana sebuah situs web berada?

Anda mungkin belum pernah memikirkan ini. Kebanyakan orang belum. Anda mengetik alamat ke
browser, sebuah halaman muncul, dan di antara dua peristiwa itu, keajaiban terjadi.

Sampai suatu hari Anda yang membayar untuk keajaiban itu.

Tapi itu bukan keajaiban. Itu komputer.

Di suatu tempat di dunia, saat ini, ada komputer fisik — sebuah server — yang
menyimpan file yang membentuk situs web itu. Ketika Anda meminta browser untuk menampilkan halaman,
permintaan Anda berjalan melalui internet, sampai ke komputer itu, dan komputer mengirim
file-file tersebut kembali kepada Anda.

Itu saja. Itulah sebuah situs web.

Jadi pertanyaan sebenarnya adalah: komputer *siapa*?

Pertanyaan itu membawa Maya ke papan tulis. Dan papan tulis itu membawa ke segala hal lainnya.

**Tiga Pilihan, Satu Masalah**

Kembali di restoran, Maya dan Tom menggambar pilihan di papan tulis.

**Pilihan satu**: Beli komputer, siapkan di restoran, dan jalankan situs web dari
sana. Ini disebut menjalankan "on-premises" — gedung Anda sendiri, mesin Anda sendiri.
Anda akan melihat istilah ini sepanjang buku.

Tom menulis "tagihan listrik" dan "apa yang terjadi jika rusak" di sebelah pilihan ini. Lalu ia berhenti sejenak dan mulai benar-benar meneliti harga di ponselnya. Sebuah server yang mampu menangani aplikasi web sederhana berharga di antara delapan ratus hingga dua ribu dolar di muka. Tambahkan baterai cadangan UPS, switch terkelola, dan perangkat firewall, dan Anda mendekati empat ribu dolar sebelum Anda membayar untuk satu jam operasi pun. Lalu datang tagihan listrik, kebutuhan pendinginan, dan fakta bahwa Anda harus mengganti perangkat keras setiap tiga sampai lima tahun.

"Berapa biayanya per bulan jika kita memperhitungkan semuanya?" tanya Tom, lebih kepada dirinya sendiri daripada kepada Maya.

Ia menghitung. Server seharga $2.000 yang diamortisasi selama empat tahun: sekitar $42 per bulan. Konsumsi daya yang berjalan 24/7 pada 300 hingga 500 watt: kira-kira $25 hingga $40 per bulan. Koneksi internet kelas bisnis yang mampu menangani lalu lintas nyata: $100 hingga $300 per bulan. Ditambah lagi, setiap tiga sampai lima tahun, Anda harus melakukan semua ini dari awal. Perangkat keras tidak bertahan selamanya.

"Jadi di antara $170 dan $400 per bulan," kata Tom, "sebelum kita membayar siapa pun untuk memperbaikinya ketika rusak. Dan itu akan rusak."

"Apa yang terjadi jika rusak pada pukul 11 malam di hari Jumat?" tanya Maya.

Tom tahu cara memperbaiki server — ia menghabiskan bertahun-tahun melakukan persis itu, dalam kehidupan sebelumnya sebagai administrator sistem. Itulah masalahnya. Ia tahu persis apa artinya menjadi satu-satunya orang yang bisa memperbaiki mesin: telepon pukul 2 pagi, akhir pekan yang hilang karena disk gagal, liburan yang terpotong karena catu daya mati. Maya tidak bisa melakukannya, dan Tom tidak ingin menjadi titik kegagalan tunggal bagi titik kegagalan tunggal. Restoran akan gelap. Pesanan akan berhenti. Dan tidak ada redundansi — satu mesin, tanpa rencana cadangan.

"Dan bagaimana jika kita tumbuh cepat?" tambah Maya. "Kita akan membeli server untuk volume hari ini, dan bagaimana jika kita butuh kapasitas tiga kali lipat dalam enam bulan? Kita harus membeli lebih banyak perangkat keras, menunggu pengirimannya, menyiapkannya..."

Tom menambahkan "tidak bisa berkembang," "biaya penggantian," dan "siapa yang memperbaikinya pukul 2 pagi" ke pilihan satu. Kolomnya menjadi panjang.

**Pilihan dua**: Bayar perusahaan hosting untuk menjalankan server kecil untuk mereka. Murah, sederhana.
Cocok untuk blog pribadi di tahun 2008. Mungkin tidak cukup fleksibel untuk bisnis yang berkembang.

"Bagaimana jika tiba-tiba kami mendapat seribu pesanan sekaligus?" tanya Maya.

Tom menambahkan "tidak bisa berkembang" ke pilihan dua.

Ia telah melihat beberapa paket shared hosting saat meneliti. Delapan dolar sebulan, dua belas dolar sebulan. Tetapi setiap paket memiliki batasan keras: ruang disk, bandwidth, koneksi simultan. Satu paket populer membanggakan "bandwidth tak terbatas" di judul lalu mengubur kebijakan pembatasannya empat paragraf ke dalam ketentuan layanan. Seratus pengunjung simultan dan layanan menurun. Dua ratus dan situs mati.

"Itu bukan tak terbatas," kata Tom. "Itu 'tak terbatas sampai itu penting.'"

Server khusus di perusahaan hosting lebih menjanjikan — $80 hingga $200 per bulan untuk sesuatu yang nyata — tetapi tim tetap harus mengonfigurasi dan memeliharanya sendiri. Dan mereka tetap akan membeli plafon tetap, tanpa respons elastis terhadap permintaan.

"Setiap hari kita berada di bawah kapasitas, kita membuang uang," kata Maya. "Setiap hari kita berada di atas kapasitas, kita kehilangan pelanggan. Tidak ada cara untuk pas tepat."

"Kecuali plafonnya bergerak bersama kita," kata Tom.

Ia tidak bermaksud itu sebagai peralihan, tetapi itu peralihan yang tepat.

**Pilihan tiga**: Sesuatu yang lain. Sesuatu yang sudah mereka dengar. Sesuatu yang disebut
"cloud."

Tom menggambar awan di papan tulis. Bentuk awan literal, seperti gambar anak-anak.

"Saya sebenarnya tidak tahu apa artinya itu," ia mengakui.

"Saya juga tidak," kata Maya.

Itulah awal dari segalanya.

**Apa Sebenarnya "Cloud" Itu**

Mari kita perjelas ini segera, karena kata "cloud" adalah salah satu istilah yang paling sering digunakan
dan paling kurang dijelaskan dalam teknologi.

Cloud bukan tempat ajaib tempat data Anda melayang.

Cloud adalah komputer milik orang lain.

Itu saja. Ketika Anda menyimpan foto ke iCloud atau Google Drive, foto Anda disimpan di
komputer fisik milik Apple atau Google, yang berada di sebuah gedung di suatu tempat. Ketika Anda
menggunakan Netflix, video yang Anda tonton dikirim dari server fisik di pusat data
di seluruh dunia.

"Cloud" hanya berarti: komputer yang Anda akses melalui internet, yang tidak harus
Anda miliki atau rawat sendiri.

Dan Amazon — ya, perusahaan yang mengirimkan paket — membangun salah satu koleksi terbesar
komputer-komputer ini di dunia. Mereka menyebutnya Amazon Web Services, atau AWS.

**Analogi Jaringan Listrik**

Bayangkan seperti jaringan listrik.

Seratus tahun lalu, jika Anda ingin menjalankan pabrik, Anda membangun pembangkit listrik sendiri. Anda mempekerjakan insinyur untuk menjalankannya. Anda membayar bahan bakar, pemeliharaan, dan keahlian untuk menjaga lampu tetap menyala. Jika generator rusak, pabrik Anda berhenti. Jika permintaan tumbuh, Anda harus membangun generator yang lebih besar — proses yang mahal dan lambat yang menuntut memprediksi permintaan masa depan bertahun-tahun sebelumnya dan menggelontorkan modal sebelum Anda tahu apakah Anda membutuhkannya.

Lalu jaringan listrik datang, dan permainannya berubah total.

Anda terhubung ke jaringan dan membayar persis untuk listrik yang Anda konsumsi. Tanpa pembangkit listrik. Tanpa staf pemeliharaan. Tanpa kontrak bahan bakar. Kapasitas ada di sana ketika Anda membutuhkannya. Anda tidak membayarnya ketika Anda tidak. Anda bisa memulai bengkel kecil dan tumbuh menjadi pabrik besar tanpa bertaruh modal pada skala masa depan yang tidak pasti.

Komputasi cloud adalah gagasan yang sama yang diterapkan pada komputasi. AWS membangun pembangkit listriknya — sebenarnya, ribuan pembangkit listrik di puluhan negara, dioperasikan oleh tim insinyur yang seluruh tujuan profesionalnya adalah menjaga mesin-mesin itu tetap berjalan. Bisnis terhubung dan membayar untuk yang mereka gunakan. Infrastrukturnya dibagikan, dipelihara secara profesional, dan tersedia sesuai permintaan. Anda berhenti mengkhawatirkan lapisan fisik dan fokus pada apa yang sebenarnya Anda bangun.

Ada satu perbedaan dari analogi listrik yang layak disebutkan: listrik adalah satu hal. Komputasi cloud datang dalam banyak ragam. Penyimpanan, komputasi, basis data, jaringan, machine learning, keamanan — setiap jenis sumber daya memiliki harganya sendiri, kompromi-nya sendiri, dan kasus penggunaan yang sesuai dengannya sendiri. Jaringan listrik menyediakan satu hal secara seragam. AWS menyediakan katalog ratusan layanan. Buku ini adalah panduan Anda menuju katalog tersebut, dimulai dengan layanan yang paling penting.

**Mengapa Amazon?**

Itu pertanyaan yang wajar. Amazon mulai sebagai toko buku.

Inilah yang terjadi: Amazon tumbuh begitu cepat sehingga mereka membutuhkan daya komputasi yang sangat besar
untuk menjalankan sistem mereka sendiri. Mereka membangun pusat data. Mereka mempekerjakan insinyur
untuk mengelolanya. Mereka menjadi sangat, sangat ahli dalam menjalankan komputer dalam skala besar.

Kemudian seseorang di Amazon mempunyai gagasan: bagaimana jika kami menjual akses ke semua daya komputasi ini
kepada orang lain?

Pada tahun 2006, Amazon Web Services diluncurkan. Hari ini, AWS menjalankan sebagian besar
internet. Situs web yang Anda gunakan untuk memesan tiket pesawat, aplikasi yang melacak pengiriman Anda, layanan
streaming yang Anda tonton tadi malam — kemungkinan besar setidaknya sebagian darinya berjalan di AWS.

Ini bukan monopoli. Google Cloud dan Microsoft Azure adalah pesaing serius. Tetapi AWS
yang pertama, ini besar, dan inilah yang menjadi topik buku ini.

**Kenalkan Tim**

Maya tidak membangun Nimbus sendirian.

Ia menelepon Tom terlebih dahulu — tentu saja. Tom punya spreadsheet, kontak pemasok, dan
keteguhan yang dibutuhkan untuk benar-benar menjalankan sebuah ide.

Tom adalah tipe orang yang membaca Ketentuan Layanan. Bukan karena ia takut,
tetapi karena ia percaya bahwa memahami berapa biaya sebenarnya dari sesuatu — dalam uang, dalam
risiko, dalam waktu — adalah satu-satunya cara untuk membuat keputusan yang baik. Kolom-kolom papan tulis dengan
daftar keberatan yang terus bertambah itu bukanlah pesimisme. Itu Tom melakukan apa yang Tom
selalu lakukan: memperhitungkan harga di dunia nyata sebelum berkomitmen pada apa pun. Ia bertanya "berapa
biayanya per bulan?" pada saat-saat ketika semua orang lain masih bersemangat tentang apa yang
bisa dilakukan sesuatu. Itu menghemat uang perusahaan, secara teratur, dan kadang-kadang mencegah
bencana sebelum bencana itu bisa dikategorikan sebagai bencana.

Tom mengenal seorang pengembang. Leo. Dua puluh empat tahun, otodidak, tipe orang yang
sudah membangun prototipe sebelum Anda selesai menjelaskan masalah. Ia datang
ke pertemuan pertama mereka dengan laptop dan aplikasi setengah jadi.

"Saya sudah men-deploy-nya — oh," katanya, membuka layar. Ekspresi di wajahnya jelas menunjukkan ia menemukan sesuatu yang tidak terduga. "Saya pikir saya men-deploy-nya di suatu tempat."

Ia memang sudah. Di server yang tidak sepenuhnya ia pahami, di wilayah yang tidak ia pilih
dengan sengaja, menjalankan kode yang pasti akan rusak di bawah beban.

Mereka langsung menyukainya.

Leo bergerak cepat. Kadang terlalu cepat. Ia punya bakat pengembang untuk membangun hal-hal yang berfungsi dan titik buta pengembang untuk hal-hal yang berfungsi *saat ini* tetapi diam-diam membangun utang teknis. Ia memperlakukan pesan kesalahan seperti sebagian orang memperlakukan label peringatan — informatif tetapi tidak selalu mengikat. Respons defaultnya terhadap potensi masalah adalah "akan baik-baik saja," dan ia cukup sering benar sehingga butuh waktu sebelum tim belajar untuk khawatir ketika ia mengatakannya dengan nada kepastian santai tertentu yang berarti ia sebenarnya belum memeriksanya.

Priya datang belakangan — dirujuk oleh teman bersama. Gelar ilmu komputer, fokus keamanan,
tipe orang yang membaca post-mortem kegagalan teknologi terkenal di malam Sabtu.
Ia punya satu pertanyaan di pertemuan pertamanya.

"Apakah ada yang memikirkan apa yang terjadi jika seseorang mencoba masuk paksa?"

Hening.

"Selamat bergabung dengan tim," kata Maya.

Versi antusiasme Priya adalah model ancaman yang terperinci. Ia benar-benar menikmati proses tinjauan arsitektur. Ia adalah orang yang membaca white paper keamanan AWS dan menyoroti bagian-bagian yang relevan sebelum ada yang memintanya. Ia juga, tim akan menemukan, dapat diandalkan benarnya tentang hal-hal yang belum mereka pikirkan. Ia mengajukan pertanyaan seperti insinyur struktural yang baik memeriksa dinding penahan beban — bukan karena ia mengharapkannya gagal, tetapi karena satu-satunya cara untuk tahu dinding itu kokoh adalah dengan memeriksanya dengan teliti dan mendokumentasikan apa yang ditemukan.

"Sudahkah kita memikirkan apa yang terjadi jika..." adalah cara Priya memulai sebagian besar kontribusinya. Seiring waktu, tim mulai memahami bahwa pertanyaan ini, lebih dari yang lain, adalah cara bencana dicegah sebelum bisa menjadi insiden.

Bersama-sama, keempat orang itu membuat sesuatu yang berfungsi. Maya melihat produknya. Tom mengawasi biayanya. Leo membangunnya. Priya mengamankannya. Buku yang Anda baca ini adalah catatan tentang apa yang mereka pelajari.

**Apa Itu Buku Ini**

Ini adalah kisah Nimbus.

Nimbus dimulai sebagai sistem pemesanan restoran dan menjadi sesuatu yang jauh lebih besar. Seiring
berkembang, ia menghadapi setiap masalah yang dihadapi perangkat lunak yang berkembang: sistem yang tidak mampu
menangani lalu lintas, data yang hilang, server yang mati di saat yang paling buruk, biaya yang
tumbuh lebih cepat dari pendapatan.

Dan setiap kali mereka menghadapi masalah, mereka menemukan layanan AWS yang dirancang untuk menyelesaikan
persis jenis masalah itu.

Buku ini mengajarkan AWS dengan mengikuti perjalanan tersebut.

Anda akan belajar bukan hanya *apa* yang dilakukan setiap layanan, tetapi *mengapa* ia ada, *kapan* menggunakannya,
dan — sama pentingnya — *kapan tidak menggunakannya*. Setiap alat memiliki kompromi. Setiap
keputusan memiliki biaya. Itulah yang dipahami insinyur senior yang masih dipelajari insinyur junior.

Pada saat Anda menyelesaikan buku ini, Anda akan siap untuk mengikuti ujian AWS Solutions Architect
Associate (SAA-C03). Lebih dari itu: Anda akan siap untuk masuk ke percakapan teknis nyata
dan bisa mengimbanginya.

Itulah janjinya.

Inilah seperti apa itu dalam praktiknya, bagian demi bagian.

**Bab 1–5: Fondasi**. Pada saat Anda mencapai akhir Bab 5, Anda akan
memahami apa sebenarnya komputasi cloud itu dan mengapa ia ada, bagaimana mengendalikan siapa yang memiliki
akses ke akun AWS Anda dan mengapa akun root membuat insinyur keamanan ketakutan, di mana
server Anda berada dan mengapa geografi penting, apa itu instance EC2 dan bagaimana mengatur ukurannya,
dan bagaimana menyimpan file di cloud tanpa mengikatnya ke satu mesin. Bab-bab ini
mencakup konsep yang dianggap sudah pasti oleh setiap arsitek AWS — tetapi yang tidak dijelaskan
siapa pun dengan cukup jelas pada kesempatan pertama.

**Bab 6–10: Data dan Skala**. Bagian ini tentang apa yang terjadi ketika
aplikasi Anda berkembang. Anda akan melihat Nimbus menabrak dinding penskalaan — satu server, terlalu banyak pengguna,
tidak ada ruang untuk berkembang — dan menyaksikan mereka menyelesaikannya dengan load balancer, auto scaling,
basis data terkelola, dan caching. Pada akhir bagian ini, Anda akan memahami bagaimana sistem
produksi nyata menangani beban yang bervariasi dan mengapa basis data hampir selalu menjadi
bottleneck pertama.

**Bab 11–17: Jaringan dan Keamanan**. Konsep-konsep di sini terasa abstrak sampai Anda
membutuhkannya. VPC, security group, DNS, manajemen sertifikat, manajemen kunci. Pada
akhir bagian ini, Anda akan memahami bagaimana lalu lintas bergerak melalui aplikasi cloud
dan bagaimana mencegahnya bergerak ke tempat-tempat yang seharusnya tidak.

**Bab 18–22: Ketahanan dan Arsitektur Modern**. Desain multi-region, sistem
yang terpisah (decoupled), komputasi serverless, kontainer. Bab-bab ini mencakup pola-pola
arsitektur yang memisahkan sistem produksi dari proyek mainan. Anda akan menyelesaikan bagian ini
dengan memahami mengapa arsitek berpengalaman memikirkan kegagalan sebelum mereka memikirkan
fitur.

**Bab 23–26: Performa dan Data**. Tingkatan penyimpanan, kebijakan siklus hidup, Aurora dan
read replica, performa jaringan, dan layanan analitik yang mengubah data mentah menjadi
jawaban. Pada akhir bagian ini, Anda akan memahami bagaimana membuat sistem lebih cepat — dan
bagaimana mengetahui bagian mana yang sebenarnya lambat.

**Bab 27–30: Optimasi Biaya**. Harga AWS rumit, tetapi mengikuti
prinsip. Pada akhir bagian ini, Anda akan memahami bagaimana membaca tagihan AWS, bagaimana
memprediksi biaya sebelum berkomitmen pada arsitektur, dan bagaimana menemukan optimasi
yang penting versus yang tidak.

**Bab 31–34: Berpikir Seperti Arsitek**. Bagian terakhir mundur dari
layanan spesifik dan membahas proses penalaran. Kapan Anda menambahkan kompleksitas?
Kapan Anda menjaganya tetap sederhana? Bagaimana Anda mempertahankan sebuah keputusan ketika ada
alternatif yang masuk akal? Ini adalah bagian yang paling sulit dan paling berharga.


**Beberapa Hal Sebelum Kita Mulai**

**Buku ini mengasumsikan Anda hampir tidak tahu apa pun tentang komputasi cloud.** Jika Anda pernah
mendengar tentang AWS tetapi belum pernah menggunakannya, Anda berada di tempat yang tepat. Jika Anda belum pernah mendengar tentang AWS sama
sekali, Anda juga berada di tempat yang tepat.

**Buku ini tidak mengasumsikan Anda seorang pengembang.** Maya bukan. Tom nyaris. Anda
tidak perlu menulis kode untuk memahami arsitektur. Anda perlu memahami masalah
dan solusi.

**Buku ini terkadang akan sengaja salah.** Tim akan membuat kesalahan. Mereka akan
memilih layanan yang salah. Mereka akan melewatkan langkah keamanan yang akan mereka sesali. Mereka akan
over-provisioning dan under-provisioning. Begitulah cara mereka belajar, dan begitu pula cara Anda.

**Tips ujian adalah nyata.** SAA-C03 adalah ujian nyata. Pertanyaan berbasis skenario
di akhir setiap bab dirancang agar terasa seperti ujian sebenarnya. Jika Anda bisa menjawabnya,
Anda berada di jalur yang benar.

Dan satu hal lagi.

Baca buku ini dengan pensil, atau aplikasi catatan, atau daftar berjalan tentang momen "saya pikir jawabannya
adalah...".

Berhenti sebelum tim memutuskan sesuatu. Buat keputusan sendiri. Lalu terus membaca dan
lihat apakah Anda akan membuat kompromi yang sama.

Anda mungkin bertanya-tanya: mengapa mengikuti sebuah startup restoran melalui buku sertifikasi AWS? Jawabannya adalah bahwa konsep abstrak melekat ketika Anda sudah merasakan masalahnya. Pada saat Anda bertemu setiap layanan AWS, Nimbus akan sudah membutuhkannya terlebih dahulu.

**Cara Membaca Buku Ini**

Setiap bab mengikuti struktur yang sama. Anda akan melihat tim menabrak sebuah masalah —
sesuatu yang rusak, sesuatu yang lambat, sesuatu yang tidak bisa berkembang. Lalu Anda akan menyaksikan
mereka mencari tahu apa yang sebenarnya terjadi. Lalu layanan AWS yang relevan muncul, dinamai
dan dijelaskan. Lalu ada penyelaman lebih dalam ke detail teknisnya. Lalu kompromi,
latihan, dan sebuah adegan yang menyiapkan bab berikutnya.

Latihan di akhir setiap bab datang dalam tiga jenis. Latihan mengingat kembali memeriksa
bahwa Anda memahami apa yang baru saja Anda baca. Pertanyaan skenario SAA-C03 terlihat dan terasa seperti
pertanyaan ujian nyata — baca petunjuknya sebelum Anda menebak, karena penalaran sama
pentingnya dengan jawabannya. Tantangan arsitektur tidak memiliki satu jawaban yang benar; mereka
ada untuk membuat Anda melatih pemikiran, bukan menghafal hasilnya.

Jika Anda membaca ini terutama untuk lulus SAA-C03, perhatikan baik-baik bagian Tips
Ujian. Mereka menandai apa yang sebenarnya diuji ujian, termasuk jebakan umum dan
kosakata spesifik yang digunakan ujian. Jika Anda membaca ini untuk membangun pemahaman
praktis, Tantangan Arsitektur adalah tempat pembelajaran terdalam terjadi.

Kedua hal ini benar pada saat yang sama: ini adalah buku persiapan ujian dan panduan
praktis. Setiap konsep yang muncul dalam cerita juga muncul dalam tujuan domain ujian. Perjalanan Nimbus
bukan hiasan. Itu adalah kurikulumnya.

Satu catatan terakhir tentang para karakter. Maya banyak bertanya "tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" Itu disengaja. Ia adalah proksi pembaca. Setiap kali ia bertanya, itu karena seorang pembelajar nyata akan menanyakan hal yang sama. Ikuti pertanyaannya dengan cermat — itu menandai momen-momen di mana penalaran paling penting.

Tom juga banyak bertanya "berapa biayanya per bulan?" Juga disengaja. Biaya adalah kendala nyata dalam setiap keputusan arsitektur. Jawaban yang mengabaikan biaya bukanlah jawaban yang lengkap. Tom memastikan tim tidak pernah melupakan itu.

**Catatan praktis tentang membaca aktif.** Ini bukan buku untuk dibaca secara pasif. Bab-babnya
saling membangun — keputusan arsitektur yang dibuat di Bab 4 menciptakan
masalah yang diperbaiki Bab 7, dan kompromi yang diterima di Bab 7 menciptakan biaya yang
diselesaikan Bab 27. Jika Anda melompat ke layanan yang menarik bagi Anda, konteksnya
akan hilang dan penalarannya tidak akan terasa sama.

Baca dengan sesuatu untuk menulis. Ketika tim akan membuat keputusan, tutup
buku sejenak dan buat keputusan Anda sendiri terlebih dahulu. Layanan mana yang akan Anda pilih? Kompromi
mana yang akan Anda terima? Lalu lanjutkan membaca. Membandingkan naluri Anda dengan keputusan tim
— dan memahami di mana mereka berbeda — adalah tempat pembelajaran nyata terjadi.

Ketika Anda menemui pertanyaan skenario di akhir bab, baca petunjuknya hanya
setelah Anda membuat pilihan. Petunjuk dirancang untuk mengoreksi jawaban salah yang paling
umum, yang berarti mereka paling berguna setelah Anda sudah berkomitmen pada sebuah arah.

Jika Anda membaca buku ini sebagai bagian dari persiapan ujian SAA-C03, atur kecepatan yang memungkinkan
Anda merefleksikan di antara bab. Satu atau dua bab per hari lebih efektif daripada
maraton akhir pekan. Konsep-konsepnya berlipat ganda — ujian menguji penalaran lintas layanan,
bukan hanya pengetahuan layanan individu, dan penalaran itu butuh waktu untuk mengeras.

Dan jika ada sesuatu yang tidak jelas: tim akan mengajukan pertanyaan sebelum Anda harus. Maya
bertanya "tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" persis karena alasan ini. Jika Anda mendapati
diri Anda bingung dengan keputusan yang dibuat tim, tunggu dua paragraf. Maya mungkin
akan menanyakan hal yang sama.

Satu hal lagi sebelum kita mulai. Tom akan mengutip harga sepanjang buku ini, karena
Tom mengutip harga tentang segala hal. Angka-angka itu — bersama dengan batasan layanan dan
detail fitur — mencerminkan dokumentasi AWS per pertengahan 2026. AWS sering mengubahnya,
dan hampir selalu menurunkan harga. Penalaran di balik setiap keputusan akan tetap berlaku;
dolar dan batasan yang persis mungkin tidak. Ketika itu uang Anda, periksa dokumentasi AWS
saat ini seperti yang akan dilakukan Tom.

**Dan satu peringatan jujur**: cloud tidak selalu menjadi jawaban yang tepat.
Untuk sebagian besar startup dan perusahaan tahap pertumbuhan jelas iya — perhitungan yang dilakukan Tom di
papan tulis membuktikan kasus itu — tetapi ada situasi nyata, dari data rahasia hingga
beban kerja stabil yang masif, di mana memiliki perangkat keras sendiri menang. Tim membahas
pengecualian itu di bab berikutnya, ketika Tom bersikeras mendengar argumen menentang
cloud sebelum berkomitmen padanya.

## Kekuatan dan Keterbatasan

**Kekuatan pendekatan ini**: Belajar melalui narasi yang berkelanjutan memberi konteks pada konsep sebelum mereka mendapatkan nama. Pada saat Anda mencapai IAM atau RDS, Anda sudah merasakan masalah yang mereka selesaikan — karena Nimbus merasakannya terlebih dahulu. Ini membuat retensi lebih tinggi dan penalaran kompromi lebih alami daripada menghafal daftar fitur.

**Keterbatasan yang perlu diperhatikan**: Buku ini mencakup kurikulum AWS SAA-C03 Solutions Architect Associate. Itu cakupan yang besar, tetapi bukan setiap layanan AWS — dan arsitektur produksi selalu melibatkan layanan dan batasan yang spesifik untuk industri dan skala Anda. Kisah Nimbus adalah fiktif; startup nyata membuat keputusan yang lebih berantakan dengan alasan yang lebih berantakan. Gunakan buku ini untuk membangun penalaran, bukan untuk menyalin arsitekturnya.

## Ringkasan

Nimbus dimulai dengan masalah yang bisa dialami bisnis kecil mana pun: pelanggan yang tidak bisa menghubungi, dan tidak ada yang bisa menunjuk satu kegagalan dramatis. Itu hanya gesekan — kecil, sunyi, dan mahal. Sesi papan tulis tidak menghasilkan solusi. Itu menghasilkan pertanyaan yang layak diajukan: apa, tepatnya, cloud itu? Jawabannya ternyata lebih penting daripada yang diperkirakan siapa pun.

- **Cloud** adalah akses sesuai kebutuhan ke sumber daya komputasi melalui internet — komputer milik orang lain yang tidak harus Anda miliki atau rawat.
- Tiga pilihan hosting: on-premises (perangkat keras Anda, biaya Anda, keahlian Anda yang dibutuhkan), hosting server kecil pihak ketiga (terbatas, tidak bisa berkembang), cloud (bayar sesuai penggunaan, berkembang sesuai permintaan).
- Biaya on-premises adalah nyata dan sering diremehkan: depresiasi perangkat keras, listrik, konektivitas internet, dan keahlian pemeliharaan bertambah secara signifikan sebelum Anda menulis satu baris kode aplikasi pun.
- **AWS** diluncurkan pada tahun 2006 ketika Amazon membuka infrastruktur pusat datanya untuk pelanggan eksternal. Ia tetap menjadi penyedia cloud terbesar, diikuti oleh Microsoft Azure dan Google Cloud.
- Cloud tidak selalu menjadi jawaban yang tepat — tetapi untuk sebagian besar startup dan perusahaan tahap pertumbuhan dengan permintaan yang tidak terduga dan tim kecil, jelas iya.

## Tips Ujian

*Domain SAA-C03: Lintas domain — Dasar-dasar konsep cloud*

- **Cloud dalam ujian** berarti komputasi sesuai kebutuhan, bayar sesuai penggunaan melalui internet. Ini adalah model pengiriman, bukan teknologi.
- **CapEx vs. OpEx**: Infrastruktur on-premises adalah pengeluaran modal (CapEx — pembelian perangkat keras di muka). Cloud adalah pengeluaran operasional (OpEx — biaya penggunaan berulang). Skenario ujian yang menanyakan tentang "menghilangkan biaya di muka" atau "beralih dari CapEx ke OpEx" mengarah pada adopsi cloud.
- **Manfaat cloud**: Tidak ada perangkat keras di muka, penskalaan elastis, bayar hanya untuk yang Anda gunakan, tidak ada manajemen infrastruktur fisik. Skenario dengan "lalu lintas tidak terduga" atau "tim kecil, tidak ada keahlian perangkat keras" adalah sinyal kuat untuk cloud.
- **On-premises** berarti menjalankan perangkat keras Anda sendiri di fasilitas Anda sendiri. Ujian sering mengontraskan arsitektur on-premises dengan alternatif cloud.
- **AWS bukan satu-satunya cloud** — Azure dan GCP adalah pesaing nyata — tetapi ujian SAA-C03 spesifik untuk AWS. Anda tidak akan diminta untuk membandingkan penyedia.
- **Skala ekonomi**: AWS mencapai biaya per unit yang lebih rendah karena ia mengagregasi permintaan dari ribuan pelanggan. Ini adalah salah satu keunggulan cloud yang dinyatakan atas on-premises dalam kerangka kerja ujian AWS. Ketika Anda melihat "manfaat cloud" di ujian, skala ekonomi selalu menjadi jawaban yang valid.
- **Enam keunggulan komputasi cloud** menurut dokumentasi AWS: tukar pengeluaran tetap dengan pengeluaran variabel, manfaatkan skala ekonomi yang masif, berhenti menebak kapasitas, tingkatkan kecepatan dan kelincahan, berhenti menghabiskan uang menjalankan pusat data, mendunia dalam hitungan menit. Ini muncul kata demi kata dalam pertanyaan ujian tentang mengapa organisasi pindah ke cloud.
- **Kelincahan dalam ujian** berarti kemampuan untuk bereksperimen dan men-deploy dengan cepat dengan biaya rendah per percobaan — bukan kecepatan mentah. Ketika sebuah skenario menyebutkan mengurangi waktu ke pasar atau memungkinkan iterasi cepat, kelincahan adalah manfaat cloud yang sedang diuji.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa itu "cloud," dan mengapa bisnis kecil akan memilihnya daripada
membeli server mereka sendiri?

*(Petunjuk: Pikirkan tentang apa yang Maya dan Tom tulis di sebelah Pilihan 1 di papan tulis.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah startup kecil sedang meluncurkan aplikasi pengiriman makanan. Mereka mengharapkan lalu lintas yang rendah
awalnya, tetapi mengantisipasi pertumbuhan pesat jika produknya berhasil. Tim pendiri
tidak memiliki pengalaman mengelola server fisik. Mereka ingin meminimalkan biaya di muka dan
menghindari beban operasional pemeliharaan perangkat keras.

Pendekatan mana berikut ini yang PALING BAIK memenuhi kebutuhan mereka?

A) Gunakan penyedia cloud untuk hosting aplikasi dan bayar hanya untuk yang mereka gunakan  
B) Beli server khusus dan hosting aplikasi di kantor mereka  
C) Bermitra dengan pusat data co-location untuk memasang server mereka sendiri  
D) Bangun aplikasi agar berjalan sepenuhnya offline tanpa infrastruktur internet

**Petunjuk 1**: Pikirkan tentang apa yang perlu *dihindari* startup sama banyaknya dengan apa yang perlu
mereka miliki.

**Petunjuk 2**: Skenario secara khusus menyebutkan "tidak ada pengalaman mengelola perangkat keras" dan
"meminimalkan biaya di muka." Pilihan mana yang menghilangkan kekhawatiran tersebut?

**Petunjuk 3**: Kami mendeskripsikan pilihan ini dalam bab ini sebagai membayar untuk "komputer milik orang
lain."

**Jawaban**: A

**Penjelasan**: Penyedia cloud seperti AWS menawarkan harga bayar sesuai penggunaan tanpa biaya perangkat keras
di muka, dan mereka menangani semua pemeliharaan infrastruktur fisik. Ini persis
model yang masuk akal untuk startup dengan lalu lintas yang tidak menentu dan tidak ada keahlian perangkat keras
— sama seperti Nimbus.

**Mengapa bukan B?** Membeli server khusus memerlukan modal di muka, pemeliharaan yang berkelanjutan,
dan tidak menawarkan kemampuan bawaan untuk berkembang seiring lalu lintas tumbuh.

**Mengapa bukan C?** Co-location memecahkan masalah ruang tetapi startup masih harus membeli,
memelihara, dan mengelola server mereka sendiri.

**Mengapa bukan D?** Aplikasi pengiriman makanan membutuhkan konektivitas internet berdasarkan definisi.

*Domain SAA-C03: Lintas domain — Dasar-dasar konsep cloud*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Maya ingin meyakinkan pamannya (yang memiliki restoran) untuk membiarkannya membangun sistem pemesanan berbasis
cloud. Ia skeptis: "Mengapa kami harus membayar Amazon setiap bulan ketika kami bisa saja
membeli komputer sekali?"

Bagaimana Anda akan menjelaskan komprominya? Apa yang akan Anda katakan sebagai keuntungan terbesar dari
pendekatan cloud untuk sebuah restoran? Dan apa satu skenario di mana membeli komputer sendiri
sebenarnya mungkin lebih masuk akal?

Pikirkan dalam kerangka analogi jaringan listrik: kapan masuk akal bagi sebuah
perusahaan untuk menjalankan generatornya sendiri daripada terhubung ke jaringan? Jawaban atas
pertanyaan itu hampir langsung memetakan ke kapan masuk akal menjalankan server Anda sendiri.

*(Tidak ada satu jawaban yang benar. Tujuannya adalah melatih pemikiran tentang kompromi.)*

## Adegan Pasca-Kredit

Malam itu, setelah semua orang pulang, Maya duduk sendirian di restoran
dengan laptopnya.

Ia sudah menemukan situs web AWS. Ia sudah mengklik beberapa halaman. Ada ratusan
layanan yang terdaftar. Ratusan.

Ia menggulir ke bawah. Dan ke bawah. Dan ke bawah.

Lalu ia menutup laptopnya.

"Kita akan butuh rencana," katanya kepada ruangan yang kosong.

Tom telah mengirim pesan kepadanya harga server yang ia temukan sebelumnya. Ia membaca angka-angka itu lagi: biaya di muka, depresiasi, listrik, siklus penggantian. Lalu ia membuka kalkulator harga AWS. Ia mengetik satu server virtual — jenis terkecil, hanya untuk melihat. Angka bulanannya lebih rendah daripada tagihan listrik untuk ruang server fisik.

Ia menatap angka itu untuk beberapa saat.

Lalu ia mengirim pesan kepada Tom: *Kita pakai cloud.*

Balasannya datang dalam waktu kurang dari satu menit: *Aku tahu. Aku juga sudah menghitungnya. Tapi kita melakukannya dengan hati-hati.*

Ia meletakkan ponselnya. Di luar, restoran sunyi. Dapur gelap. Di suatu tempat antara dapur dan cloud, ada sebuah bisnis yang akan segera ia bangun.

Di bab berikutnya: mengapa perusahaan berhenti membeli server dan mulai menyewanya — dan apa yang berubah.
