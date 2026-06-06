# Bab 2: Di Mana di Dunia Ini Server Anda?

Berdirilah. Berjalanlah ke jendela jika ada di dekat sini.

Lihat ke luar. Apa pun yang Anda lihat — gedung, pohon, tempat parkir, halaman belakang seseorang —
tidak ada satu pun dari itu tempat data Anda berada. Data Anda berada di tempat lain sama sekali. Mungkin
di suatu tempat yang belum pernah Anda kunjungi.

Itu bukan masalah. Tapi memahami *di mana* membuat sejumlah hal yang mengejutkan
menjadi masuk akal.

Setelah sesi papan tulis, keputusan dibuat: Nimbus akan menggunakan AWS. Cloud adalah jawabannya. Tapi "cloud" ternyata adalah sesuatu yang spesifik di lokasi yang spesifik — dan Leo telah memilih lokasi itu tanpa bermaksud demikian.

Keesokan paginya, Maya menyadari server itu ada di Singapura.

"Mengapa Singapura?" tanyanya.

"Itu defaultnya," kata Leo.

Tom mendongak dari kopinya. "Berapa biaya untuk menjalankan server di Singapura ketika
semua pelanggan kita ada di Pantai Barat?"

Leo tidak punya jawaban.

Priya sudah punya kekhawatiran yang berbeda. "Dan siapa yang tahu yurisdiksi mana saja yang dilewati data itu?"

Bab ini tentang memperbaiki keputusan itu — dan memahami mengapa itu penting.

**Masalah Dengan "Suatu Tempat"**

Ketika Anda menggunakan AWS, Anda tidak menggunakan satu pusat data. Anda menggunakan jaringan global
mereka. AWS memiliki infrastruktur di puluhan negara.

Itu adalah fitur, bukan sekadar fakta. Tapi itu berarti Anda harus membuat pilihan: *di mana* Anda
ingin infrastruktur Anda berjalan?

Pilihan itu penting karena tiga alasan:

**Performa.** Semakin dekat server Anda dengan pengguna Anda, semakin cepat responsnya.
Fisika tidak bisa dinegosiasikan. Data berjalan sekitar dua pertiga kecepatan cahaya
melalui kabel serat optik. Perjalanan pulang-pergi dari Seattle ke Singapura memakan waktu sekitar 170
milidetik hanya dalam transit — sebelum aplikasi Anda melakukan apa pun. Permintaan yang sama
dari Seattle ke Oregon (`us-west-2`) memakan waktu sekitar 20 milidetik. Selisihnya
bukan kesalahan pembulatan. Untuk aplikasi pemesanan restoran di mana pelanggan
mengharapkan halaman terasa instan — dan di mana satu halaman memicu beberapa perjalanan
pulang-pergi — latensi dasar 170 md per perjalanan pulang-pergi adalah perbedaan antara produk yang cepat
dan yang lambat.

Tom mengambil ponselnya, membuka aplikasi Nimbus, dan memuat halaman restoran. Ia mengukur waktunya dengan aplikasi stopwatch.

"Hampir tiga detik," katanya.

Leo memeriksa rincian latensi di log server. Hanya perjalanan pulang-pergi ke Singapura — tidak ada hubungannya dengan kueri basis data — menambahkan sekitar 170 milidetik per permintaan, dan aplikasi membuat banyak perjalanan pulang-pergi per halaman.

"Dan jika kita pindahkan server ke Oregon?" tanya Tom.

"Dua puluh milidetik," kata Leo. "Mungkin kurang."

"Berapa biayanya per bulan?"

Selisih harganya beberapa persen. Bukan nol, tetapi bukan variabel utama. Mereka memindahkan server ke `us-west-2` sore itu.

"Saya sudah men-deploy agen monitoring ke instance Singapura," kata Leo, setengah kepada dirinya sendiri. "Oh." Ia berhenti sejenak. "Saya akan menyiapkannya di Oregon saja."

**Kepatuhan.** Beberapa industri punya undang-undang tentang di mana data bisa disimpan. Data kesehatan
AS mungkin perlu tetap di dalam negeri. Data keuangan mungkin perlu tetap di dalam region
tertentu. Memilih Region yang salah bisa menciptakan masalah hukum.

Priya telah meneliti ini sebelum ada yang memintanya.

"GDPR," katanya, mendongak dari catatannya di standup pagi berikutnya. "Jika Nimbus suatu saat melayani pelanggan di Uni Eropa — bahkan satu pelanggan — data pribadi tentang mereka mungkin perlu tetap di dalam UE atau di negara dengan perlindungan setara. Itu bukan opsional. Itu undang-undang."

"Kita aplikasi pemesanan restoran," kata Leo. "Di California."

"Untuk saat ini," kata Priya. "Sudahkah kita memikirkan apa yang terjadi jika kita berekspansi ke Eropa dalam delapan belas bulan dan menyadari kita sudah menyimpan data pelanggan Eropa di Oregon selama satu setengah tahun?"

Jeda.

"Kita akan memperbaikinya saat itu," kata Leo.

"Kamu tidak bisa memperbaiki pelanggaran residensi data secara surut," kata Priya. "Pelanggaran itu sudah terjadi."

Ia tidak sedang dramatis. Denda GDPR mencapai 4% dari pendapatan global tahunan. Pelanggaran HIPAA dalam kesehatan AS bisa mencapai lebih dari $2 juta per kategori pelanggaran per tahun. Ini bukan hipotesis — ini adalah alasan keputusan cloud perusahaan besar dimulai dengan pemetaan kepatuhan, bukan konfigurasi infrastruktur.

Untuk Nimbus, paparan regulasi langsungnya rendah: pelanggan AS, tidak ada data kesehatan, tidak ada layanan keuangan. Tapi memilih Region untuk bisnis yang berniat tumbuh berarti memilih dengan mempertimbangkan pertumbuhan.

**Ketahanan terhadap bencana.** Jika satu lokasi mengalami pemadaman listrik, gempa bumi, atau kegagalan
jaringan, Anda ingin sistem Anda bertahan. Menyebarkan infrastruktur ke beberapa
lokasi adalah cara Anda melindungi dari bencana lokal.

**Bagaimana AWS Mengorganisasi Infrastrukturnya**

AWS memecah infrastruktur globalnya menjadi tiga konsep bersarang. Bayangkan mereka seperti
boneka matryoshka Rusia, dari yang terbesar hingga terkecil: boneka besar yang terbuka untuk mengungkap
boneka sedang, yang terbuka untuk mengungkap yang kecil. Setiap lapisan bersarang di dalam berikutnya.

Boneka terluar adalah apa yang disebut AWS sebagai **Region**. Di dalam Region ada gugusan
**Availability Zone**. Dan tersebar di mana-mana di seluruh dunia, terlepas dari keduanya,
adalah **Edge Location**.

Mari kita buka masing-masing.

**Region: Kotak-Kotak Besar**

Sebuah **Region** adalah area geografis di mana AWS memiliki gugusan pusat data. Setiap Region
dinamai menurut lokasinya: `us-west-2` adalah Oregon, `us-east-1` adalah Virginia Utara,
`eu-west-1` adalah Irlandia, `ap-southeast-1` adalah Singapura — tempat server Leo bersembunyi.

Ada hampir 40 Region di seluruh dunia, dan AWS menambah lebih banyak secara teratur. Daftarnya terus tumbuh
seiring AWS berekspansi: ada Region di Amerika Utara, Amerika Selatan, Eropa, Timur Tengah,
Asia Pasifik, dan Afrika. Setiap Region baru biasanya diumumkan beberapa bulan sebelum dibuka,
mencakup setidaknya tiga Availability Zone saat peluncuran, dan butuh beberapa tahun sebelum semua layanan AWS
tersedia di dalamnya.

Setiap Region sepenuhnya independen. Data di `us-west-2` tetap di `us-west-2` kecuali
Anda secara eksplisit memindahkannya. Ini penting untuk kepatuhan dan ketahanan — pemadaman
besar di satu Region tidak otomatis memengaruhi yang lain. Peristiwa yang mengganggu jaringan
listrik di Virginia Utara tidak memengaruhi Oregon. Bencana alam di Irlandia tidak
memengaruhi Singapura. Region benar-benar terisolasi satu sama lain di tingkat
infrastruktur fisik.

Independensinya begitu lengkap sehingga jika sebuah Region mengalami pemadaman besar, bahkan
konsol manajemen AWS mungkin memuat dengan lambat — karena konsol itu sendiri berjalan di infrastruktur
AWS. Ini layak diketahui: selama insiden AWS yang nyata, Anda mungkin merasa sulit untuk
mengakses alat monitoring yang Anda butuhkan persis ketika Anda paling membutuhkannya. Ini adalah bagian dari mengapa
tim berpengalaman memantau layanan mereka sendiri secara independen dari konsol AWS.

"Jadi kita harus memilih `us-west-2` untuk Nimbus?" tanya Tom.

Ya. Untuk bisnis AS yang menargetkan pelanggan Pantai Barat, ya. Latensi lebih rendah dan pengguna Anda
mendapatkan respons lebih cepat.

"Berapa lebih mahalnya dibandingkan Singapura?" Tom menambahkan.

Harganya bervariasi menurut Region — biasanya beberapa persen. Manfaat performa dan kepatuhan
dari Region yang tepat sepadan dengan selisih harga yang kecil.

**Perdebatan Pemilihan Region yang Nyaris Disalahpilih Nimbus**

Sebelum tim menetapkan `us-west-2`, ada argumen singkat tentang apakah `us-east-1` (Virginia Utara) lebih masuk akal. Itu Region tertua, terbesar, tempat AWS merilis layanan baru terlebih dahulu. Itu juga Region termurah di sebagian besar halaman harga. Tom menyukai ini.

"Tapi pengguna kita ada di California, Oregon, dan Washington," kata Maya. "Mengapa kita menjalankan server kita di sisi lain negara?"

"Lebih murah," kata Tom. "Dan lebih banyak layanan tersedia."

"Tunggu — tapi *mengapa* kita melakukannya dengan cara itu?" kata Maya. "Pengguna kita ada di Pantai Barat. Server kita harus ada di Pantai Barat. Selisih harganya berapa, enam persen? Tujuh? Kita akan menghabiskan lebih banyak untuk latensi ekstra dalam bentuk pelanggan yang hilang daripada yang kita hemat dalam tagihan komputasi."

Ia benar. Region yang tepat untuk sebuah beban kerja adalah Region terdekat dengan pengguna yang paling penting — kecuali kepatuhan, ketersediaan layanan, atau selisih biaya membenarkan pertukarannya. Untuk Nimbus, tidak ada satu pun dari itu.

Ini adalah keputusan yang terasa kecil tetapi tidak. Tim yang memilih `us-east-1` karena "itu defaultnya" lalu melayani pengguna Pantai Barat dari Pantai Timur meninggalkan performa nyata di atas meja. Konsol AWS default ke `us-east-1` karena alasan historis. Itu bukan rekomendasi.

**Availability Zone: Redundansi yang Sesungguhnya**

Inilah di mana hal menjadi menarik.

Setiap Region bukanlah satu pusat data tunggal. Itu adalah gugusan beberapa pusat data
yang terpisah secara fisik yang disebut **Availability Zone** (atau AZ).

Oregon (`us-west-2`) memiliki empat Availability Zone: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Ini adalah gedung nyata, dipisahkan oleh jarak yang berarti — cukup jauh
sehingga kebakaran, banjir, atau pemadaman listrik di satu tidak akan memengaruhi yang lain, tetapi cukup
dekat sehingga jaringan di antara mereka sangat cepat (latensi milidetik satu digit).

Seberapa jauh "jarak yang berarti"? AWS tidak mempublikasikan koordinat persis, tetapi peneliti independen memperkirakan AZ dalam satu Region biasanya dipisahkan puluhan mil — cukup jauh untuk berada di jaringan listrik berbeda dan jalur fiber berbeda, tidak begitu jauh sehingga kecepatan cahaya menjadi faktor pembatas untuk replikasi sinkron.

Pemisahan ini disengaja dan penting. Jika dua AZ berbagi gardu listrik yang sama, kegagalan gardu akan melumpuhkan kedua AZ secara bersamaan — menghilangkan redundansi. Pemisahan fisik memastikan bahwa kegagalan mode-umum (jenis yang memengaruhi seluruh area geografis) benar-benar peristiwa langka daripada risiko yang dapat diperkirakan.

Ini adalah arsitektur yang membuat AWS andal pada tingkat yang tidak bisa ditandingi pusat data tunggal mana pun.

Priya mencondongkan tubuh ke depan. "Jadi jika kita menjalankan aplikasi kita di dua Availability Zone dan
satu mati—"

"Yang lain tetap berjalan," Maya menyelesaikan.

"Tepat."

Leo, yang telah mendengarkan dengan tenang: "Saya men-deploy semuanya di satu AZ."

"Ya," kata Priya. "Kami perhatikan."

Konsep menyebarkan aplikasi Anda di beberapa AZ — disebut **deployment Multi-AZ** — adalah
salah satu pola ketahanan terpenting di AWS. Kita membahasnya secara mendalam di Bab 18.
Untuk sekarang, pahami bahwa AZ ada secara khusus untuk memungkinkan ini.

Satu nuansa yang layak diketahui: nama AZ (`us-west-2a`, `us-west-2b`, dll.) tidak konsisten di seluruh akun AWS. Yang muncul sebagai `us-west-2a` di akun Anda mungkin pusat data fisik yang berbeda dari yang muncul sebagai `us-west-2a` di akun kolega. AWS mengacak pemetaan untuk mencegah semua pelanggan men-deploy ke AZ fisik yang sama ketika mereka default ke "a." Jika Anda perlu mengoordinasikan AZ fisik mana yang Anda tempati dengan akun lain (untuk komunikasi antar-akun latensi rendah, misalnya), AWS menyediakan AZ ID — pengidentifikasi stabil yang memetakan ke lokasi fisik yang sama di seluruh akun. AZ bernama (`2a`, `2b`) relatif terhadap akun. AZ ID (`usw2-az1`, `usw2-az2`) bersifat fisik. Ujian menguji perbedaan ini sesekali.

**Seperti Apa Sebenarnya Kegagalan AZ Itu**

Ini tidak abstrak. Mari saya jelaskan timeline nyata.

Saat itu pukul 14.47 di hari Selasa. Kesalahan listrik pada salah satu transformator yang memasok daya ke `us-west-2b` menyebabkan pemadaman di pusat data itu. Peristiwa itu tidak diprediksi.

Jika Nimbus berjalan sepenuhnya di `us-west-2b`:
- 14.47: instance EC2 kehilangan daya. Server basis data kehilangan daya.
- 14.47: permintaan masuk ke aplikasi Nimbus mulai gagal dengan timeout koneksi.
- 14.47: peringatan monitoring Tom berbunyi.
- 14.50: Leo memulai proses pemulihan. Ia meluncurkan instance EC2 baru di `us-west-2a`.
- 15.05: basis data kembali online dari pemulihan snapshot.
- 15.12: aplikasi dikonfigurasi ulang untuk menunjuk ke endpoint basis data baru.
- 15.20: Nimbus melayani lalu lintas lagi.

Itu 33 menit downtime. Selama jam makan malam Jumat, 33 menit bisa berbiaya ribuan dalam bentuk pesanan yang hilang dan jenis kerusakan reputasi yang tidak muncul dalam laporan insiden.

Jika Nimbus berjalan di `us-west-2a` dan `us-west-2b` dengan deployment Multi-AZ yang tepat:
- 14.47: instance EC2 di `us-west-2b` kehilangan daya.
- 14.47: Application Load Balancer mendeteksi instance yang tidak sehat melalui health check.
- 14.47: ALB berhenti merutekan lalu lintas ke instance yang gagal, secara otomatis.
- 14.47: lalu lintas terus mengalir ke instance di `us-west-2a`.
- 14.48: Auto Scaling Group meluncurkan instance pengganti.
- 14.55: pengganti lolos health check dan bergabung kembali dengan armada.

Downtime: nol. Dampak pelanggan: nyaris nol. Monitoring Tom berbunyi, tetapi tindakan Leo adalah "amati dan konfirmasi pemulihan selesai," bukan "bangun ulang semuanya secara manual."

Inilah perbedaan antara Multi-AZ dan single-AZ. Batas AZ adalah tempat desain redundansi AWS menjadi ketahanan aplikasi Anda.

**Matematika Keandalan Multi-AZ**

AWS merancang setiap AZ agar independen — bukan hanya secara fisik, tetapi dengan daya, pendinginan, dan jaringan terpisah. Probabilitas dua AZ di Region yang sama gagal secara bersamaan dirancang agar sangat rendah.

Jika satu AZ memiliki ketersediaan 99,9% (sekitar 8,7 jam downtime per tahun), maka arsitektur dua-AZ yang memperlakukan kegagalan sebagai peristiwa independen memiliki ketersediaan sekitar 99,9999% untuk mode kegagalan yang sama — sekitar 31 detik downtime per tahun dari kegagalan AZ.

Dalam praktiknya, faktor pembatas untuk sebagian besar aplikasi bukanlah ketersediaan AZ. Itu adalah kode aplikasi, proses deployment, dan basis data. Tapi matematikanya menggambarkan mengapa Multi-AZ adalah baseline standar: biaya menjalankan di dua AZ moderat; peningkatan ketersediaannya besar.

**Edge Location: Kecepatan, di Mana Saja**

AZ memecahkan ketahanan. Mereka tidak memecahkan masalah melayani konten dengan cepat kepada pengguna di
kota-kota yang jauh dari Region utama Anda.

Masuklah **Edge Location**.

Edge Location adalah titik infrastruktur kecil dan ringan — lebih dari 750 titik
kehadiran yang tersebar di lebih dari 100 kota di seluruh dunia. Mereka bukan pusat data penuh — mereka
tidak bisa menjalankan aplikasi Anda.
Yang *bisa* mereka lakukan adalah men-cache konten dekat dengan pengguna Anda.

Bayangkan gambar menu yang disimpan di server di Virginia. Setiap kali seseorang di Tokyo ingin
melihatnya, permintaan berjalan melintasi Pasifik dan kembali. Dengan Edge Location, AWS bisa menyimpan
salinan file itu di Tokyo dan melayaninya secara lokal — milidetik alih-alih ratusan
milidetik.

Ini adalah tulang punggung CloudFront, jaringan pengiriman konten AWS. Kita menggali
CloudFront di Bab 13. Untuk sekarang: Edge Location adalah tentang kecepatan untuk konten statis.

Anda mungkin bertanya-tanya: jika Edge Location men-cache konten, apakah mereka juga menyimpan data Anda secara permanen? Tidak. Edge Location menyimpan salinan konten sementara untuk melayaninya lebih cepat — aslinya selalu berada di Region Anda. Jika cache kedaluwarsa atau konten berubah, Edge Location mengambil salinan baru dari sumbernya.

Jaringan Edge Location terpisah dari struktur Region dan AZ. Ketika Anda memikirkan di mana aplikasi Anda *berjalan*, Anda memikirkan Region dan AZ. Ketika Anda memikirkan bagaimana konten sampai ke pengguna Anda *dengan cepat*, Anda memikirkan Edge Location dan CloudFront. Mereka memecahkan masalah berbeda dan beroperasi di lapisan berbeda.

AWS juga memiliki konsep terkait yang disebut **Regional Edge Cache** — node caching yang lebih besar yang berada di antara Region Anda dan Edge Location. Jika Edge Location di sebuah kota tidak punya salinan file yang di-cache, ia mengambil dari Regional Edge Cache alih-alih kembali sampai ke Region Anda. Ini mengurangi beban pada origin Anda dan meningkatkan tingkat cache hit untuk konten yang kurang populer. Anda tidak mengonfigurasi Regional Edge Cache secara langsung — mereka adalah bagian dari infrastruktur CloudFront yang beroperasi secara otomatis.

Implikasi praktis untuk Nimbus: ketika tim menambahkan CloudFront di Bab 13, gambar menu yang dulu berjalan dari Oregon ke browser pelanggan pada setiap permintaan akan dilayani dari Edge Location terdekat — Dallas untuk pelanggan Texas, Atlanta untuk pelanggan Georgia, Chicago untuk pelanggan Illinois. Pengguna di Chicago mendapatkan gambar menu mereka dari server berjarak 300 mil alih-alih 2.000 mil. Selisihnya terukur dan berarti.

**Sebuah Peringatan Tentang Salinan yang Di-Cache**

Ada satu detail tentang Edge Location yang layak ditandai sekarang, meskipun kisah lengkapnya menjadi milik Bab 13: salinan yang di-cache adalah sebuah *salinan*, dan salinan bisa menjadi basi. Jika aslinya berubah di Region Anda, Edge Location mungkin terus melayani versi lama untuk sementara. Berapa lama, dan apa yang bisa Anda lakukan tentangnya, adalah persis jenis kontrol yang diberikan CDN — dan persis apa yang akan diperjuangkan tim ketika Nimbus benar-benar men-deploy CloudFront. Untuk sekarang, bawa ke depan hanya ini: konten bisa berada dekat dengan pengguna, dan "dekat" terkadang berarti "sedikit ketinggalan zaman."

**Memilih Region: Daftar Periksa Insinyur Senior**

Jika Nimbus suatu hari berekspansi untuk melayani pengguna di Meksiko dan Kolombia — skenario yang akan kita
latih dalam latihan bab ini — keputusan Region tidaklah sewenang-wenang. Inilah pemikirannya:

**1. Di mana pengguna Anda?**

Mulai di sini. Pilih Region terdekat dengan mayoritas pengguna Anda. Latensi adalah dampak
paling langsung dan terukur dari pemilihan Region.

Jarak fisik antara pengguna dan server penting dengan cara yang mudah
diremehkan. Perjalanan pulang-pergi 170 md ke Singapura versus perjalanan pulang-pergi 20 md ke Oregon
bukanlah metrik performa abstrak — itu adalah perbedaan antara halaman yang terasa
instan dan halaman yang terasa lambat. Pada perangkat seluler dengan latensi radio
tambahan, penalti Singapura semakin berlipat. Untuk pengguna di San Jose, `us-west-2`
(Oregon) adalah Region yang tepat bahkan sebelum Anda mempertimbangkan faktor lain apa pun.

**2. Apakah ada persyaratan kepatuhan?**

Beban kerja kesehatan, keuangan, dan pemerintah sering punya aturan residensi data yang ketat.
Ketahui lingkungan regulasi Anda sebelum memilih. GDPR mensyaratkan bahwa data pribadi dari penduduk UE disimpan di yurisdiksi dengan perlindungan data yang memadai — entah UE itu sendiri atau negara dengan keputusan kecukupan. HIPAA mensyaratkan pengamanan terdokumentasi untuk data kesehatan AS. Ini bukan pertimbangan opsional untuk ditinjau nanti.

Dalam praktiknya: bicaralah dengan tim hukum Anda sebelum memilih Region untuk beban kerja yang diatur mana pun. AWS memelihara dokumentasi kepatuhan yang ekstensif untuk setiap Region, termasuk sertifikasi seperti SOC 2, ISO 27001, PCI DSS, dan kelayakan HIPAA. Tapi sertifikasi memberi tahu Anda apa yang telah dilakukan AWS; tim hukum Anda memberi tahu Anda apakah itu cukup untuk konteks regulasi spesifik Anda.

**3. Layanan mana yang Anda butuhkan?**

Tidak setiap layanan AWS tersedia di setiap Region. Layanan baru diluncurkan di `us-east-1`
terlebih dahulu. Jika Anda membutuhkan layanan tertentu, verifikasi Region target Anda mendukungnya.

Ini kurang menjadi kekhawatiran untuk layanan dalam buku ini — semua layanan utama tersedia
secara luas — tetapi penting untuk layanan yang lebih baru, perangkat keras khusus (beberapa tipe
instance GPU hanya ada di Region tertentu), dan AWS GovCloud (Region terpisah
yang dirancang untuk beban kerja pemerintah AS dengan persyaratan regulasi spesifik).

**4. Bagaimana harganya?**

Region bervariasi dalam harga. `us-east-1` (Virginia Utara) cenderung termurah karena
skala dan usianya. Amerika Selatan sedikit lebih mahal. Periksa halaman harga AWS
sebelum memfinalisasi.

Selisih harga biasanya kecil — beberapa hingga sepuluh persen antara Region populer. Itu jarang menjadi faktor penentu. Tapi untuk beban kerja yang sensitif terhadap biaya yang menjalankan ribuan instance, bahkan selisih harga 5% berlipat seiring waktu. Tom akan memeriksa angkanya dan memperhitungkannya, seperti Tom memeriksa semua angka dan memperhitungkannya.

**5. Apakah Anda butuh multi-Region?**

Untuk sebagian besar aplikasi, beberapa AZ dalam satu Region adalah ketahanan yang cukup. Untuk
aplikasi kritis di mana bahkan pemadaman regional tidak bisa diterima, Anda merancang untuk
multi-Region — tetapi itu adalah komitmen arsitektur yang signifikan. Jangan lakukan itu
secara spekulatif.

"Apa aturannya untuk kapan kita menambahkan Region kedua?" tanya Leo.

"Ketika kita punya persyaratan terdokumentasi yang mengatakan 'harus tetap operasional jika seluruh Region AWS tidak tersedia,'" kata Priya. "Bukan 'akan menyenangkan.' Persyaratan spesifik, dengan justifikasi bisnis spesifik, yang telah kita timbang terhadap kompleksitas dan biaya."

"Seperti apa itu dalam praktiknya?"

"Kontrak pelanggan dengan SLA yang mensyaratkan uptime 99,99%. Mandat regulasi untuk redundansi geografis. Skenario kehilangan-region yang benar-benar bisa kita kuantifikasi dalam istilah pendapatan. Bukan sekadar 'bagaimana jika us-west-2 mati.'"

Leo melihat arsitektur Nimbus saat ini. Mereka masih di satu AZ.

"Multi-AZ dulu," katanya.

"Multi-AZ dulu," Priya mengonfirmasi.

**Keterbatasan yang Tidak Dibicarakan Siapa Pun**

Region itu kuat, tetapi mereka menciptakan satu ketegangan penting.

Menjalankan di beberapa Region benar-benar sulit.

Replikasi data antar Region punya latensi. Menjaga dua Region tetap sinkron — sehingga
transaksi di Region A langsung terlihat di Region B — adalah salah satu masalah
tersulit dalam sistem terdistribusi. AWS menyediakan alat untuk itu, tetapi itu memakan biaya dan menambah
kompleksitas operasional.

Sebagian besar aplikasi harus mulai dengan satu Region, beberapa AZ, dan berekspansi ke multi-Region
hanya ketika mereka punya persyaratan yang jelas: mandat regulasi, SLA kontrak yang mensyaratkan
downtime regional nyaris-nol, atau basis pengguna yang benar-benar tersebar di seluruh benua.

Mereplikasi data antar region menambah biaya — transfer data lintas-region adalah salah satu item baris yang paling diremehkan pada tagihan AWS. Itu juga menambah kompleksitas operasional: setiap tulisan yang harus konsisten antar region menambah latensi.

Sebagian besar kegagalan yang memengaruhi aplikasi nyata bukanlah bencana lintas-region. Mereka adalah masalah dalam-region seperti security group yang salah dikonfigurasi atau deployment yang gagal. Skenario dramatis "seluruh region mati" menjadi berita utama persis karena ia langka. Investasikan dalam multi-AZ sebelum multi-region. Tambahkan multi-region ketika kasus bisnisnya jelas.

Untuk memberi angka spesifik: AWS telah mengalami sejumlah kecil peristiwa single-region yang signifikan sepanjang sejarahnya. Pemadaman regional penuh benar-benar tidak umum. Peristiwa tingkat-AZ — pemadaman singkat yang memengaruhi satu pusat data dalam sebuah region — kurang langka dan persis apa yang dirancang untuk diserap deployment Multi-AZ. Frekuensi peristiwa AZ dibandingkan peristiwa regional kira-kira satu orde besaran lebih tinggi. Menghabiskan upaya arsitektur pada mode kegagalan yang lebih umum terlebih dahulu adalah pilihan rasional.

Arsitektur multi-Region yang prematur adalah salah satu kesalahan paling umum dan mahal
yang dibuat insinyur junior ketika mereka mulai merasa percaya diri.

Tom mengangguk. "Jadi kita tidak melakukan multi-Region hanya karena kita bisa."

"Tidak sampai kita perlu," kata Maya. "Dan kita akan tahu kapan kita perlu."

"Bagaimana kita akan tahu?" tanya Leo.

"Ketika dokumen tinjauan arsitektur Anda punya persyaratan yang mengatakan 'harus bertahan dari pemadaman
regional,'" kata Priya. "Sudahkah kita memikirkan apa yang terjadi jika seluruh AZ mati sebelum kita bahkan menyiapkan Multi-AZ? Kita harus memperbaiki itu terlebih dahulu. Sampai saat itu: multi-AZ."

Anda mungkin bertanya-tanya: bagaimana Anda memverifikasi bahwa deployment Multi-AZ Anda benar-benar berfungsi sebelum Anda membutuhkannya? Anda mengujinya. AWS menyediakan alat bernama **AWS Fault Injection Service (FIS)** — sebelumnya Fault Injection Simulator — yang bisa menyimulasikan kegagalan AZ, penghentian instance, dan kondisi kesalahan lainnya terhadap arsitektur Anda yang sedang berjalan — sehingga Anda bisa mengamati bagaimana sistem Anda berperilaku di bawah kondisi kegagalan dengan cara yang terkendali, alih-alih menemukan perilakunya selama insiden yang sebenarnya. Menguji arsitektur ketahanan Anda sama pentingnya dengan membangunnya. Priya memasukkan "uji injeksi kesalahan" ke kalender tinjauan arsitektur triwulanan segera setelah membaca tentangnya.

## Ketika AWS Datang kepada Anda: Outposts dan Wavelength

Region dan Availability Zone mencakup dunia — tetapi tidak setiap masalah diselesaikan dengan memindahkan data ke AWS. Beberapa beban kerja harus tetap on-premises: sistem lantai manufaktur yang butuh latensi sub-milidetik, aplikasi kesehatan dengan persyaratan residensi data, sistem point-of-sale ritel di toko tanpa internet yang andal. Untuk ini, AWS memperluas infrastrukturnya ke lokasi pelanggan.

"Tunggu — bagaimana jika kita akhirnya bekerja dengan sistem rumah sakit?" tanya Priya. "Perangkat lunak pemantauan pasien mereka secara harfiah tidak bisa mentoleransi perjalanan pulang-pergi cloud. Dan secara hukum mungkin tidak diizinkan meninggalkan gedung."

Maya membuka dokumentasi AWS. Dua layanan terus muncul.

**AWS Outposts**

Rak perangkat keras AWS yang dikelola sepenuhnya yang dipasang di pusat data atau fasilitas co-location Anda sendiri. Outposts menjalankan infrastruktur, layanan, API, dan alat AWS yang sama dengan cloud AWS — EC2, EBS, RDS, EKS, S3 di Outposts — tetapi secara fisik di gedung Anda.

Kasus penggunaan: beban kerja manufaktur yang sensitif terhadap latensi, persyaratan residensi data di mana data harus tetap secara fisik di lokasi tertentu, aplikasi yang membutuhkan API AWS tetapi tidak bisa mentoleransi celah konektivitas ke cloud publik.

Poin kunci: Outposts tetap dikelola oleh AWS. AWS memasangnya, mem-patch-nya, dan memantaunya. Anda memiliki ruang rak dan daya. API dan tooling-nya identik dengan cloud publik — template CloudFormation yang sama, kebijakan IAM yang sama, perintah CLI yang sama. Perbedaannya dalam ujian adalah lokasi fisik, bukan model operasional.

"Jadi itu AWS, tetapi di gedung pelanggan kita," kata Leo.

"Tepat," kata Maya. "API yang sama. Kode pos yang berbeda."

**AWS Wavelength**

Infrastruktur AWS yang di-deploy di dalam jaringan 5G penyedia telekomunikasi. Wavelength Zone berada di tepi jaringan 5G, secara fisik dekat dengan pengguna seluler, memungkinkan latensi milidetik satu digit untuk aplikasi seluler.

Kasus penggunaan: gaming real-time, AR/VR, telemetri kendaraan otonom, pemrosesan video langsung di tepi 5G.

"Yang itu bukan untuk rumah sakit," kata Tom. "Itu untuk seseorang yang membangun generasi berikutnya dari game seluler multiplayer."

"Atau telemetri mobil self-driving," kata Priya. "Apa pun di mana perangkat seluler perlu berbicara dengan server dan 50 milidetik terlalu lambat."

**Perbedaannya:** Outposts membawa AWS ke pusat data Anda — gedung Anda, rak Anda, daya Anda. Wavelength membawa AWS ke tepi jaringan telekomunikasi — secara fisik berlokasi bersama dengan infrastruktur radio 5G, dekat dengan pengguna seluler yang tidak pernah menyentuh jaringan pribadi Anda.

**AWS Local Zones**

Ada saudara ketiga dalam keluarga ini — dan dalam ujian, ini yang paling sering diuji dari ketiganya. **Local Zones** adalah infrastruktur AWS yang di-deploy di area metropolitan besar yang tidak punya Region penuh — Los Angeles, Houston, Miami, Lagos, dan puluhan lainnya. Sebuah Local Zone adalah ekstensi dari Region induk: Anda menjalankan EC2, EBS, dan subset layanan lain *di metro itu sendiri*, mendapatkan latensi milidetik satu digit ke pengguna di kota itu, sementara segala hal lain (dan semua manajemen) tetap di Region induk.

Pola untuk dihafal — tiga saudara "komputasi tepi", tiga pemicu:

- "Latensi milidetik satu digit ke pengguna akhir **di kota/area metro tertentu**" → **Local Zones**
- "Latensi ultra-rendah untuk **perangkat seluler 5G**" → **Wavelength**
- "Layanan AWS yang berjalan **di pusat data kita sendiri** / data harus tetap on-premises" → **Outposts**

Tidak satu pun dari ketiganya adalah jawaban untuk aplikasi web yang khas. Semuanya muncul dalam ujian SAA-C03 sebagai jebakan pencocokan pola: frasa pemicu yang penting.

## Kekuatan dan Keterbatasan

**Gunakan desain multi-region dan multi-AZ ketika**: aplikasi Anda punya pengguna di banyak geografi dan latensi penting; SLA Anda mensyaratkan ketersediaan 99,99% atau lebih tinggi; persyaratan regulasi mengamanatkan residensi data di region tertentu; Anda butuh pemulihan bencana dengan RTO di bawah satu jam.

**Kompromi-nya nyata**: Menjalankan di beberapa Region memberi Anda redundansi terhadap pemadaman regional — tetapi dengan biaya dan kompleksitas yang signifikan.

Ingat peringatan biaya dari awal bab ini: setiap byte yang berpindah antar region memakan biaya. Dalam pengaturan multi-region aktif-aktif di mana tulisan harus konsisten, Anda membayar biaya itu terus-menerus.

Kompleksitas operasional juga berskala. Men-debug insiden di satu region itu sulit. Men-debug insiden terdistribusi lintas-region — di mana permintaan yang sama menyentuh infrastruktur di dua benua — adalah jenis kesulitan yang sama sekali berbeda.

**Progresi yang tepat untuk sebagian besar aplikasi**: Mulai dengan satu Region dan beberapa AZ. Itu memberi Anda ketahanan terhadap kegagalan yang benar-benar terjadi — pemadaman tingkat-AZ, kegagalan perangkat keras, peristiwa daya — pada sebagian kecil kompleksitas arsitektur multi-region. Tambahkan multi-region ketika persyaratan spesifik dan terdokumentasi membuatnya perlu. Tidak sebelumnya.

Pola umum untuk tim yang melompat ke multi-region terlalu dini: kompleksitas mengelola dua region memperkenalkan mode kegagalannya sendiri — bug sinkronisasi data, skenario split-brain, deployment yang tidak konsisten. Arsitektur ketahanan yang dirancang justru untuk mencegah kegagalan terkadang memperkenalkan kategori kegagalan baru yang tidak akan ada dalam desain yang lebih sederhana.

Priya punya dokumen yang ia sebut "anggaran kompleksitas." Idenya: setiap keputusan arsitektur yang menambah kompleksitas operasional punya biaya, dan organisasi punya kapasitas terbatas untuk mengelola kompleksitas itu. Menghabiskan anggaran kompleksitas pada arsitektur multi-region sebelum Anda menguasai keandalan single-region adalah investasi yang buruk. Kompleksitas harus diarahkan ke mode kegagalan yang benar-benar Anda hadapi, bukan yang membuat cerita pemulihan bencana yang bagus.

"Kita punya satu region, satu AZ, dan proses deployment yang membuat Leo gugup setiap kali ia menjalankannya," kata Priya. "Langkah berikutnya yang tepat adalah multi-AZ, bukan multi-region."

Tom menulis "anggaran kompleksitas" di buku catatannya. Ia akan menggunakan frasa itu secara teratur selama dua tahun berikutnya.

## Ringkasan

Kecelakaan Singapura Leo ternyata menjadi pelajaran yang berguna — bukan karena ia menyebabkan kerusakan yang bertahan lama, tetapi karena ia memaksa tim memahami sesuatu yang biasanya dilewati: di mana infrastruktur Anda berjalan bukanlah keputusan kosmetik. Fisika tidak bisa dinegosiasikan. Seratus tujuh puluh milidetik latensi dasar per perjalanan pulang-pergi adalah perbedaan antara produk yang cepat dan yang lambat, dan aturan kepatuhan tentang di mana data berada tidak peduli seberapa cepat Anda berpindah.

- AWS mengorganisasi infrastruktur globalnya menjadi **Region**, **Availability Zone**, dan **Edge Location**.
- Sebuah **Region** adalah gugusan geografis pusat data. Setiap Region terisolasi — data tetap di Region kecuali Anda secara eksplisit memindahkannya.
- **Availability Zone** adalah pusat data yang terpisah secara fisik dalam sebuah Region, terhubung oleh jaringan latensi rendah. Men-deploy di beberapa AZ adalah cara standar untuk bertahan dari kegagalan lokal.
- Pilih Region Anda berdasarkan lokasi pengguna, persyaratan kepatuhan, ketersediaan layanan, dan harga — dalam urutan itu.
- Multi-AZ adalah baseline ketahanan standar. Multi-Region adalah untuk beban kerja kritis dengan persyaratan spesifik dan terdokumentasi — bukan titik awal default.

## Tips Ujian

*Domain SAA-C03 1 — Tugas 1.1 / Domain 2 — Tugas 2.2*

- **Region terisolasi secara default.** Data tidak bereplikasi antar Region kecuali
  Anda mengonfigurasinya. Ini penting untuk skenario kedaulatan data dan kepatuhan.
- **AZ adalah unit ketahanan untuk sebagian besar pertanyaan.** Ketika ujian menanyakan bagaimana bertahan
  dari kegagalan pusat data, jawabannya melibatkan beberapa AZ dalam satu Region.
- **Multi-Region adalah untuk ketahanan pemadaman regional.** Jika skenario mengatakan "harus tetap
  operasional bahkan jika seluruh Region AWS gagal," jawabannya melibatkan arsitektur
  multi-Region.
- **Edge Location ≠ AZ.** Edge Location men-cache konten — mereka tidak bisa menjalankan server
  aplikasi Anda. Jangan bingungkan mereka dengan pusat data.
- Ujian sering menguji hubungan antara kepatuhan dan pemilihan Region.
  Jika skenario menyebutkan persyaratan residensi data, pilihan Region adalah bagian dari jawaban.
- **GDPR dan residensi data** dalam skenario ujian biasanya mengarah pada menjaga data di dalam Region tertentu dan memastikan replikasi lintas-region dinonaktifkan atau dikontrol.
- **Outposts vs Wavelength vs Local Zones:** Outposts = rak AWS di pusat data Anda (on-premises, residensi data, latensi lokal). Wavelength = AWS di tepi jaringan 5G (pengguna seluler, latensi ultra-rendah). Local Zones = komputasi AWS di area metro tanpa Region penuh. Pemicu ujian: "jalankan AWS di fasilitas Anda sendiri" → Outposts. "Latensi ultra-rendah untuk pengguna seluler 5G" → Wavelength. "Latensi milidetik satu digit ke pengguna di kota tertentu" → Local Zones.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa perbedaan antara Region dan Availability Zone?
Mengapa perbedaan itu penting saat merancang aplikasi web yang tahan banting?

*(Petunjuk: Pikirkan tentang dua jenis kegagalan berbeda yang dilindungi masing-masing.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan kesehatan AS harus menyimpan semua data pasien dalam satu Region
AWS untuk mematuhi kebijakan residensi data internal mereka. Mereka sedang merancang aplikasi
cloud baru di Pantai Barat dan ingin memaksimalkan ketahanan tanpa memindahkan data ke
Region lain.

Konfigurasi mana yang PALING BAIK memenuhi persyaratan mereka?

A) Deploy di `us-east-1` dan gunakan Edge Location CloudFront di Oregon untuk melayani konten
   lebih cepat  
B) Deploy di `us-west-2` di satu Availability Zone untuk meminimalkan biaya  
C) Deploy di beberapa Region termasuk `us-west-2` dan `us-east-1` dengan replikasi
   data lintas-Region  
D) Deploy di `us-west-2` (Oregon) di beberapa Availability Zone

**Petunjuk 1**: Kebijakan berarti data harus tetap di satu Region. Pilihan mana yang
memindahkan data ke Region lain?

**Petunjuk 2**: Di antara pilihan yang menjaga data di `us-west-2`, mana yang memberikan ketahanan terbanyak?

**Petunjuk 3**: Beberapa AZ dalam satu Region memberikan ketahanan tanpa melintasi
batas Region.

**Jawaban**: D

**Penjelasan**: `us-west-2` menjaga semua data dalam satu Region, memenuhi persyaratan
kebijakan. Men-deploy di beberapa AZ dalam Region itu melindungi dari
kegagalan pusat data tanpa memindahkan data ke Region lain. Ini adalah keseimbangan yang benar
antara kepatuhan dan ketahanan.

**Mengapa bukan A?** Pilihan A men-deploy di `us-east-1`, jauh dari pengguna Pantai Barat — dan
CloudFront akan men-cache konten yang berdekatan dengan pasien di Edge Location di luar Region
yang dipilih, melanggar kebijakan residensi.

**Mengapa bukan B?** Satu AZ tidak punya ketahanan. Jika AZ itu mengalami pemadaman,
aplikasi gagal sepenuhnya.

**Mengapa bukan C?** Mereplikasi ke `us-east-1` memindahkan data pasien ke Pantai Timur,
secara langsung melanggar persyaratan Region-tunggal.

*Domain SAA-C03 1 — Tugas 1.1 (infrastruktur global, kedaulatan data)*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang berekspansi untuk melayani pelanggan di Meksiko dan Kolombia. Saat ini semuanya
berjalan di `us-west-2`. Tim sedang berdebat: haruskah mereka menambahkan Region kedua `us-east-1`,
atau tetap single-Region dengan beberapa AZ?

Pertanyaan apa yang akan Anda ajukan sebelum memutuskan? Apa biaya dan risiko utama dari
menambahkan Region kedua? Apa biaya utama dari *tidak* menambahkannya?

*(Tidak ada satu jawaban yang benar. Latih penalaran kompromi multi-Region.)*

## Adegan Pasca-Kredit

Leo memperbaiki masalah Singapura. Nimbus pindah ke `us-west-2`. Latensinya turun.
Satu pertanyaan tindak lanjut Tom — "apakah itu mengubah tagihan kita?" — dijawab dengan
angka yang sedikit lebih tinggi, yang ia terima dengan keengganan yang terlihat.

Itu bertahan dua hari sebelum masalah berikutnya.

Leo datang ke standup dengan ekspresi yang telah dipelajari Maya untuk dikenali: tampang
seseorang yang telah melakukan sesuatu yang tidak bisa mereka batalkan.

"Jadi," katanya hati-hati. "Saya menyiapkan server. Dan saya butuh cara untuk masuk.
Jadi saya membuat username."

"Dan?" tanya Priya.

"'Admin'."

Hening.

"Dan kata sandinya?"

Keheningan yang lebih lama.

"'Admin123'."

Priya berdiri.

Di bab berikutnya: bagaimana Nimbus mengontrol siapa yang bisa menyentuh apa — dan apa yang terjadi ketika mereka salah.
