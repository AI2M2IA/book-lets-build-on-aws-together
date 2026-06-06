# Bab 1: Mengapa Menyewa Ketika Bisa Memiliki?

Buku catatan terbuka di atas meja, dan Tom sudah mencoret baris yang sama tiga kali.

Ia begadang. Pertanyaan itu tidak mau lepas. Sekitar tengah malam ia menuliskannya secara lengkap, lalu menggarisbawahinya, lalu menggambar kotak di sekelilingnya, lalu mencoretnya karena menuliskannya tidak membuatnya menjadi lebih jelas. Ia menulisnya lagi di margin.

Ketika Leo dan Priya tiba keesokan paginya — kopi di tangan, berdebat tentang sesuatu yang tidak relevan — Tom sudah ada di papan tulis. Pilihan ketiga masih ada di sana, tidak tersentuh. Bentuk awan, digambar oleh seseorang yang mengakui mereka tidak tahu artinya.

Masalah pemesanan restoran telah mengkristalkan sesuatu yang nyata. Maya telah menyatakan cloud sebagai jalan ke depan. Keputusan itu sudah dibuat. Yang tersisa adalah pertanyaan yang tidak bisa dilepaskan Tom, yang duduk di margin buku catatannya: jika menyewa adalah jawabannya, mengapa itu lebih murah daripada memiliki?

"Saya butuh seseorang untuk menjelaskan sesuatu kepada saya," kata Tom, tanpa berbalik. "Jika kita menyewa komputer dari Amazon daripada membeli milik sendiri — mengapa itu bisa *lebih murah*?"

Ruangan menjadi sunyi. Ini adalah jenis pertanyaan yang terdengar sederhana tetapi tidak.

"Karena," Leo mulai.

"Tidak," kata Tom. "Saya ingin memahaminya. Bukan hanya mendengar jawabannya. Mengapa menyewa lebih murah daripada memiliki?"

Leo duduk. Ia meletakkan kopinya di atas meja. Ia benar-benar memikirkannya.

"Karena," katanya lagi, lebih hati-hati kali ini, "kita akan membeli untuk kasus terburuk. Malam Jumat terbesar, momen viral, acara peluncuran. Tapi sebagian besar waktu tidak sesibuk itu."

"Benar," kata Tom. "Lanjutkan."

"Jadi kita akan membayar untuk kapasitas yang tidak kita gunakan. Setiap Selasa yang sepi. Setiap Senin pagi. Kita akan punya server yang hanya duduk di sana, menggunakan listrik, hampir tidak melakukan apa-apa."

"Dan jika kita menyewa saja?"

"Kita membayar untuk yang kita gunakan," kata Leo. "Ketika sepi, kita hampir tidak membayar apa pun. Ketika sibuk, kita membayar lebih. Tapi kita tidak pernah membayar untuk kapasitas yang hanya duduk di sana."

Tom terlihat puas. Bukan karena jawabannya baru baginya — ia sudah memecahkannya malam sebelumnya. Tapi karena mengatakannya dengan lantang membuatnya menjadi nyata. Ia mengambil buku catatannya dan mencoret pertanyaan itu untuk terakhir kalinya.

Itulah fondasinya. Segala hal lain dalam bab ini dibangun di atasnya.

**Masalah yang Jelas Dengan Memiliki Server**

Bayangkan Anda memutuskan untuk membuka restoran. Bukan jenis Nimbus — restoran biasa.

Sebelum pelanggan pertama Anda masuk, Anda butuh meja. Kursi. Dapur. Kompor.
Piring. Staf. Anda butuh semua ini pada hari pertama, bahkan jika minggu pertama Anda sepi, bahkan
jika Anda menghabiskan tiga bulan dengan enam pelanggan per hari sebelum kabar tersebar.

Server fisik bekerja dengan cara yang sama.

Jika Nimbus membeli server mereka sendiri, mereka harus membelinya untuk puncak yang mereka harapkan.
Malam Jumat tersibuk yang bisa mereka bayangkan. Momen viral di mana seorang food blogger
menulis tentang arepa dan sepuluh ribu orang mencoba memesan sekaligus.

Tapi sebagian besar waktu, tidak sesibuk itu. Sebagian besar waktu, server-server itu hanya duduk di sana,
menggunakan listrik, hampir tidak melakukan apa-apa.

"Kami akan membayar untuk kapasitas yang tidak kami gunakan," kata Maya.

"Tepat," kata Tom, yang mengejutkan semua orang karena dia yang mengajukan
pertanyaan itu.

**Biaya Sebenarnya Perangkat Keras: Spreadsheet Tom**

Tom telah membangun model biaya yang layak pada saat tim bertemu. Ia menjelaskannya kepada mereka.

Ia benar-benar memberi harga perangkat keras nyata. Sebuah Dell PowerEdge R550 — server kelas menengah yang mampu menangani beberapa ratus pengguna bersamaan — berharga sekitar $8.000 ketika dikonfigurasi dengan RAM dan penyimpanan yang cukup untuk aplikasi web produksi. Itu satu server. Untuk redundansi (agar satu kegagalan tidak melumpuhkan seluruh sistem), Anda butuh setidaknya dua. Enam belas ribu dolar sebelum Anda mulai.

Perkiraan papan tulis sebesar $2.000 itu optimistis. Perangkat keras produksi berbiaya lebih. Anda butuh memori yang cukup agar aplikasi dan basis data berjalan bersamaan. Anda butuh RAID untuk redundansi penyimpanan. Anda butuh kartu antarmuka jaringan yang cukup cepat untuk menangani lalu lintas nyata. Pada saat Anda mengonfigurasi server produksi yang nyata, angka $8.000 itu bukan berlebihan.

"Dua server: $16.000," kata Tom, menuliskannya.

Lalu biaya berkelanjutan. Daya: server yang berjalan 24/7 pada 400 watt mengonsumsi sekitar 3.500 kilowatt-jam per tahun. Pada $0,12 per kWh, itu kira-kira $420 setahun, per server. Dikali dua: $840 setahun hanya untuk listrik.

Lalu internet. Koneksi bisnis yang cukup cepat untuk menangani lalu lintas nyata — bukan Wi-Fi residensial yang saat ini digunakan restoran, tetapi koneksi fiber simetris kelas bisnis dengan perjanjian tingkat layanan — berharga $200 hingga $400 per bulan. Itu $2.400 hingga $4.800 setahun.

Lalu siklus hidup perangkat keras. Server bertahan tiga sampai lima tahun sebelum menjadi terlalu lambat atau terlalu tidak andal untuk menjalankan beban kerja produksi. Setelah tahun keempat, Anda menjalankan perangkat keras yang tidak bisa di-patch terhadap kerentanan tertentu dan yang tidak lagi didukung vendor server Anda. Jadi Anda mengamortisasi biaya di muka: $16.000 selama empat tahun adalah $4.000 setahun dalam depresiasi modal.

Lalu biaya yang tidak dituliskan siapa pun: cadangan baterai UPS (uninterruptible power supply) untuk bertahan dari pemadaman listrik singkat, kira-kira $400. Switch jaringan terkelola, $300. Perangkat firewall dengan fitur keamanan yang layak, $500 hingga $2.000. Hard drive cadangan di rak untuk kegagalan yang tak terhindarkan, $200. Pendinginan — jika server berada di kantor belakang restoran, seseorang perlu memperhitungkan panas yang mereka hasilkan, yang berarti entah sirkuit pendingin udara khusus atau tagihan listrik yang mengejutkan.

Jumlahkan semuanya: di antara $8.000 dan $12.000 per tahun dalam depresiasi modal dan biaya berkelanjutan, sebelum Anda membayar siapa pun untuk memelihara, mengonfigurasi, atau memperbaiki perangkat keras. Dan "pemeliharaan" bukan sekadar item baris — itu adalah persyaratan keahlian. Anda entah mempekerjakan seseorang yang tahu cara menjalankan server, atau Anda adalah orang yang menjalankannya pada pukul 2 pagi ketika ada yang salah.

"Dan ketika rusak," kata Tom, "kita tidak tahu cara memperbaikinya. Kita akan membayar seseorang dengan tarif darurat. Dan sementara kita menunggu mereka, restoran gelap."

"Bandingkan itu dengan AWS," kata Tom. Ia membuka halaman harga EC2. Sebuah instance `t3.medium` — komputasi yang cukup untuk beban kerja awal Nimbus — berharga sekitar $30 per bulan. Dua di antaranya, untuk redundansi, adalah $60 sebulan, atau $720 setahun.

Empat ribu dolar setahun dalam depresiasi versus $720. Selisihnya tidak dekat. Bahkan jika Anda menambahkan jaringan, transfer data, dan layanan basis data terkelola di AWS, tagihan cloud untuk beban kerja skala startup adalah sebagian kecil dari biaya perangkat keras fisik.

"Tapi," kata Tom, karena Tom selalu punya tapi, "kita harus jujur tentang kapan ini berhenti menjadi sejelas ini."

Ia benar. Pada skala yang sangat besar — ribuan server, utilisasi konstan — ekonominya bergeser. Sebuah perusahaan yang menjalankan 5.000 server pada utilisasi 90% sepanjang waktu mungkin menemukan bahwa memiliki perangkat keras lebih murah per unit daripada menyewa pada volume tersebut. Perusahaan besar terkadang mencapai titik ini. Startup hampir tidak pernah. Untuk startup dengan pertumbuhan tak terduga, tanpa keahlian perangkat keras, dan skala yang tidak pasti, matematika cloud sudah jelas.

**Model Penyewaan**

Inilah yang membuat komputasi cloud berbeda.

Ketika Anda menggunakan AWS, Anda tidak membeli server. Anda menyewa daya komputasi, dan Anda membayar hanya
untuk apa yang Anda gunakan. Ini lebih mirip menyewa venue daripada memiliki gedung restoran.

Pikirkan seperti ini.

Jika Anda perlu menjadi tuan rumah pesta ulang tahun untuk lima puluh orang, Anda bisa membeli rumah yang cukup besar
untuk lima puluh orang beserta meja dan kursi mereka. Atau Anda bisa menyewa sebuah venue
selama empat jam pada hari Sabtu, membayar tepat untuk ruang dan waktu yang Anda butuhkan, dan mengembalikan
kunci setelah pesta selesai.

Venue tetap ada ketika Anda membutuhkannya. Tersedia lagi ketika sesuatu yang lain
muncul. Anda tidak harus menyewa manajer gedung. Anda tidak membayar pajak properti
untuk itu sepanjang tahun.

Tapi inilah bagian yang tidak sepenuhnya ditangkap analogi: dengan AWS, "venue" bisa tumbuh atau menyusut agar pas dengan pesta Anda. Jika lima puluh orang datang lalu dua ratus lagi tiba tak terduga, venue akan mengembang untuk menampung mereka. Jika pesta berakhir lebih awal, venue akan menyusut dan Anda berhenti membayar untuk ruang ekstra segera.

Tidak ada penyewaan venue yang bekerja seperti itu. Komputasi cloud iya.

Itulah model cloud. AWS memiliki "venue-venue" tersebut. Anda datang ketika Anda membutuhkannya.

Ada analogi kedua yang menyentuh bagian gambaran yang berbeda.

Bayangkan Anda adalah startup yang membutuhkan fotografi profesional. Anda bisa mempekerjakan fotografer penuh waktu — gaji, peralatan, tunjangan, ruang kantor, seluruh paket. Atau Anda bisa mempekerjakan fotografer per jam ketika Anda membutuhkannya, membayar untuk pekerjaan yang dilakukan, dan melepasnya ketika pemotretan selesai.

Fotografer sesuai permintaan berbiaya lebih per jam daripada yang bergaji. Tapi kecuali Anda membutuhkan fotografi setiap jam setiap hari, model sesuai permintaan secara dramatis lebih murah secara total. Dan Anda bisa mempekerjakan spesialis berbeda untuk pekerjaan berbeda — fotografer potret untuk foto profil, fotografer produk untuk foto katalog — tanpa mempertahankan jumlah staf untuk keduanya.

Komputasi cloud memiliki ekonomi spesialisasi yang sama ini. AWS mempertahankan tim spesialis untuk setiap lapisan infrastruktur: insinyur jaringan, administrator basis data, peneliti keamanan, ahli pengadaan perangkat keras. Anda mengakses hasil keahlian mereka — basis data yang andal, jaringan yang aman, server yang dikonfigurasi dengan baik — per jam, tanpa mempekerjakan satu pun spesialis tersebut sendiri.

Anda mungkin bertanya-tanya: jika menyewa per jam lebih mahal daripada membeli langsung per unit, bagaimana ekonominya berjalan? Jawabannya adalah utilisasi. Server fisik yang Anda miliki duduk pada 9% CPU di Selasa yang sepi. Server cloud yang Anda sewa untuk jam-jam yang benar-benar Anda butuhkan berjalan pada utilisasi apa pun yang dituntut beban kerja, dan Anda berhenti membayar ketika beban kerja berhenti. Total yang Anda bayar untuk jam-jam yang benar-benar Anda gunakan lebih sedikit daripada total yang akan Anda bayar untuk server yang menganggur di sudut.

**Tapi Tunggu — Ada Lebih Dari Itu**

"Oke," kata Leo, "tapi bagaimana jika venue saya terbakar?"

Naluri yang baik. Gelap, tapi baik.

Salah satu asumsi diam-diam ketika Anda memiliki server sendiri adalah bahwa *Anda*
bertanggung jawab untuk menjaganya tetap berjalan. Jika server di kantor Anda dijatuhkan
oleh magang yang kikuk, situs web Anda mati. Jika gedung kehilangan listrik, situs web Anda
mati. Jika hard drive gagal — dan hard drive selalu gagal pada akhirnya — situs web Anda
mati.

AWS mengoperasikan pusat data. Fasilitas besar yang dikelola secara profesional dengan cadangan daya,
koneksi jaringan yang redundan, keamanan fisik, dan tim insinyur yang satu-satunya
pekerjaan mereka adalah menjaga mesin-mesin itu tetap berjalan. Mereka punya catu daya yang redundan. Mereka punya
generator cadangan. Mereka punya koneksi jaringan yang redundan dari banyak penyedia.
Mereka punya keamanan fisik yang tidak bisa didekati kebanyakan gedung kantor.

Anda tidak hanya menyewa daya komputasi. Anda menyewa keandalan.

"Berapa biayanya?" tanya Tom.

Kita akan sampai ke sana. Harga adalah babnya sendiri, dan ia memang layak mendapatkannya.

**Tiga Hal yang Dilakukan Cloud Secara Berbeda**

Mari kita buat ini konkret. Berikut adalah tiga perbedaan inti antara menjalankan
server sendiri dan menggunakan penyedia cloud.

**1. Anda membayar untuk yang Anda gunakan.**

Tidak ada server yang menganggur. Tidak ada pembelian di muka. Jika Nimbus tidak mendapat pesanan pada Senin
pagi, mereka hampir tidak membayar apa pun. Jika mereka kebanjiran pada Malam Tahun Baru, AWS
secara otomatis memiliki kapasitas yang siap.

Model ini mencocokkan biaya dengan nilai dengan cara yang tidak bisa dilakukan infrastruktur tetap. Ketika
biaya Anda melacak pendapatan Anda, perencanaan keuangan menjadi lebih sederhana.

Ada istilah untuk ini dalam akuntansi: beralih dari pengeluaran modal ke pengeluaran operasional. CapEx adalah pembelian di muka yang Anda depresiasi seiring waktu — seperti membeli Dell PowerEdge. OpEx adalah pengeluaran berkelanjutan yang Anda bayar sesuai jalan — seperti tagihan AWS. Untuk startup dengan modal terbatas dan pendapatan tidak pasti, OpEx jauh lebih disukai. Anda tidak bertaruh $16.000 pada perkiraan permintaan yang tidak bisa Anda pastikan.

"Setiap dolar yang tidak kita habiskan untuk perangkat keras," kata Tom, "adalah dolar yang bisa kita habiskan untuk benar-benar membangun produk."

Itu bukan poin sepele. Biaya perangkat keras di muka yang dihitung Tom — $16.000 untuk dua server kelas produksi — mewakili jenis pengeluaran modal yang membuat investor mengajukan pertanyaan yang tidak nyaman dan memaksa pendiri membuat pilihan sulit tentang runway.

**2. Orang lain menangani perangkat keras.**

AWS memelihara mesin fisik. Kabel jaringan. Catu daya.
Sistem pendingin. Nimbus tidak mempekerjakan siapa pun untuk melakukan ini. Mereka fokus pada
aplikasi mereka, bukan pada infrastruktur di bawahnya.

Ini layak diberi jeda. Keahlian yang dibutuhkan untuk menjalankan infrastruktur pusat data
fisik adalah nyata. Sistem pendingin, manajemen daya, jadwal penggantian perangkat keras,
redundansi jaringan — ini adalah disiplin yang berbeda. Dengan menggunakan AWS, Nimbus
mendapatkan akses ke keahlian itu tanpa mempekerjakannya.

Administrator sistem dengan keterampilan untuk memelihara server produksi dengan benar berpenghasilan $80.000 hingga $130.000 per tahun. Tim yang bisa menangani kegagalan perangkat keras, keamanan tingkat OS, konfigurasi jaringan, dan manajemen penyimpanan berbiaya lebih. Layanan AWS berbiaya sebagian kecil dari itu — dan keahlian operasional sudah termasuk dalam layanan.

Ini adalah argumen skala ekonomi yang dibuat AWS secara eksplisit. Karena AWS menjalankan infrastruktur untuk ribuan pelanggan secara bersamaan, biaya per unit untuk mempertahankan keahlian itu dibagi ke seluruh mereka. Setiap pelanggan individu mendapatkan akses ke operasi infrastruktur kelas dunia dengan tagihan yang merupakan sebagian kecil dari berapa biaya operasi tersebut jika mereka membangunnya sendiri.

**3. Anda bisa berkembang ke atas — dan ke bawah — secara instan.**

Inilah yang membutuhkan waktu untuk benar-benar dihargai. Dengan server fisik, berkembang ke atas
berarti memesan perangkat keras baru, menunggu berminggu-minggu untuk pengiriman, menyiapkannya. Dengan AWS,
berkembang ke atas berarti mengklik tombol (atau membiarkan sistem melakukannya secara otomatis). Dan ketika
Anda tidak lagi membutuhkan kapasitas ekstra, Anda mengecilkan. Anda berhenti membayar.

Bagian "dan ke bawah" itu kurang dihargai. Mengecilkan pada perangkat keras fisik berarti Anda
tetap memiliki perangkat keras, tetap membayar listrik, tetap memelihara sistem. Anda hanya
memiliki lebih dari yang Anda butuhkan. Dengan cloud, mengecilkan itu nyata — sumber daya hilang, dan
biaya hilang bersamanya.

Leo mendeskripsikan ini sebagai "bagian yang terasa seperti curang." Ia telah menghabiskan bertahun-tahun bekerja menyiasati sistem berkapasitas tetap — memperkirakan dengan hati-hati berapa banyak server yang akan ia butuhkan, menyediakan secara konservatif, mengawasi meteran kapasitas, dan terkadang salah ke dua arah. Gagasan bahwa ia bisa menambahkan server, menggunakannya selama empat jam di malam Jumat, dan menghapusnya — membayar hanya untuk empat jam tersebut — terasa salah dengan cara hal-hal yang terlalu bagus untuk menjadi kenyataan terasa salah.

Itu tidak terlalu bagus untuk menjadi kenyataan. Itu adalah model bisnisnya. AWS menghasilkan uang ketika Anda menggunakan infrastruktur mereka. Mereka punya setiap insentif untuk membuat penggunaan itu sebebas friksi mungkin.

Priya telah diam selama penjelasan ini. Ia memiliki pertanyaan.

"Dan bagaimana jika seseorang mencoba masuk paksa? Itu masalah siapa?"

Dan di situlah hal menjadi menarik.

**Model Tanggung Jawab Bersama**

Ini adalah salah satu konsep terpenting di seluruh AWS. Sederhana setelah Anda
memahaminya, tetapi membingungkan banyak orang — termasuk dalam ujian.

AWS dan Anda berbagi tanggung jawab untuk keamanan. Tapi setiap pihak bertanggung jawab atas
hal-hal yang berbeda.

**AWS bertanggung jawab atas keamanan *dari* cloud.**

Pusat data fisik. Perangkat keras. Infrastruktur jaringan. Hypervisor
yang menjalankan mesin virtual. Jika seseorang masuk ke pusat data AWS, itu adalah
masalah Amazon. Jika disk fisik gagal dan merusak data, itu adalah masalah Amazon.
Jika infrastruktur jaringan antar availability zone disusupi, itu adalah
masalah Amazon.

**Anda bertanggung jawab atas keamanan *di* cloud.**

Data Anda. Aplikasi Anda. Akun pengguna Anda dan siapa yang memiliki akses ke apa. Konfigurasi yang Anda pilih. Jika seseorang mencuri kata sandi Anda dan masuk ke akun AWS Anda,
itu adalah masalah Anda. Jika Anda salah mengonfigurasi basis data agar dapat diakses publik,
itu adalah masalah Anda. Jika aplikasi Anda memiliki kerentanan yang memungkinkan SQL injection,
itu adalah masalah Anda.

Priya mengangguk perlahan. "Jadi mereka melindungi gedung. Kami melindungi apa yang ada di dalamnya."

"Tepat," kata Maya.

"Jadi jika Leo membuka port yang tidak seharusnya..."

"Masih masalah kita," Maya mengkonfirmasi, menatap Leo.

Leo sudah mengetik sesuatu di laptopnya dan berpura-pura tidak mendengar.

Anda mungkin bertanya-tanya: apakah ini berarti AWS pernah bertanggung jawab atas pelanggaran data? Hanya jika pelanggaran terjadi di tingkat fisik atau infrastruktur — pusat data yang disusupi, kegagalan perangkat keras, kerentanan dalam hypervisor itu sendiri. Pelanggaran yang disebabkan oleh aplikasi yang salah dikonfigurasi, kata sandi lemah, atau kontrol akses yang diatur dengan buruk selalu menjadi tanggung jawab pelanggan, terlepas dari seberapa besar atau bereputasinya penyedia cloud.

**Analogi Bandara**

Berikut cara kedua untuk memikirkan Model Tanggung Jawab Bersama, karena cukup sering muncul dalam ujian sehingga layak dua sudut pandang.

Bayangkan sebuah bandara.

Operator bandara mengamankan area — landasan pacu, terminal, pagar, pos pemeriksaan, apa yang terjadi ketika seseorang yang tidak berwenang ditemukan dekat depot bahan bakar.

Tapi sekali di dalam, setiap maskapai bertanggung jawab atas operasinya sendiri: pemeliharaan pesawatnya sendiri, prosedur krunya sendiri, manifes penumpangnya sendiri. Jika sebuah maskapai kehilangan bagasi penumpang atau seorang pilot melewatkan checklist, itu bukan kesalahan bandara. Area telah diamankan. Maskapai yang beroperasi di dalamnya membuat pilihan yang buruk.

AWS adalah bandara. Anda adalah maskapai yang beroperasi di dalamnya. AWS mengamankan struktur fisik dan infrastruktur inti. Anda mengamankan data Anda, kontrol akses Anda, dan keputusan aplikasi Anda.

Analogi ini penting karena ia memperjelas di mana garisnya ketika ada yang salah. "Kami di AWS, jadi itu masalah mereka" selalu menjadi jawaban yang salah dalam ujian, dan hampir selalu menjadi jawaban yang salah di dunia nyata.

**Jenis Layanan Penting**

Ada satu kerutan lagi yang layak diketahui sekarang, meskipun kita akan meninjaunya kembali sepanjang buku.

Pembagian tanggung jawab bergeser tergantung pada seberapa terkelola suatu layanan.

Untuk EC2 — mesin virtual yang Anda kontrol — Anda bertanggung jawab untuk mem-patch sistem operasi. AWS menyediakan mesin fisik dan hypervisor. Segala hal di atas OS adalah milik Anda.

Untuk RDS — layanan basis data terkelola yang kita bahas di Bab 8 — AWS mem-patch mesin basis data itu sendiri. Anda tidak mengelola OS. Tanggung jawab Anda menyusut menjadi konfigurasi basis data, data di dalamnya, dan siapa yang memiliki akses.

Untuk S3 — layanan penyimpanan file — AWS mengelola infrastruktur sepenuhnya. Tanggung jawab Anda adalah kontrol akses (siapa yang bisa membaca dan menulis ke bucket Anda) dan data itu sendiri.

Semakin terkelola suatu layanan, semakin banyak tanggung jawab yang bergeser ke AWS. Ini adalah pola ujian kunci: ketika sebuah pertanyaan menanyakan siapa yang bertanggung jawab atas sesuatu, tanyakan "seberapa terkelola layanan ini?" terlebih dahulu.

**Jika Cloud Maka Kenyamanan Tapi Bukan Kontrol**

Model cloud menawarkan keunggulan nyata: tidak ada perangkat keras untuk dikelola, biaya elastis, skala instan. Tapi itu berarti menukar sesuatu juga.

Jika Anda memindahkan infrastruktur Anda ke cloud, maka Anda mendapatkan fleksibilitas dan mengurangi biaya modal di muka — tetapi Anda melepaskan kontrol penuh atas mesin yang mendasarinya. Anda tidak bisa memeriksanya secara fisik. Anda tidak bisa menjamin di mana di pusat data mereka berada. Anda bergantung pada uptime AWS, jendela pemeliharaan AWS, dan respons insiden AWS ketika ada yang salah di tingkat infrastruktur. Untuk sebagian besar tim, itu pertukaran yang sangat baik. Untuk beberapa industri yang diatur, itu memerlukan dokumentasi yang hati-hati dan sertifikasi kepatuhan AWS. Ketahui apa yang Anda tukar sebelum Anda menukarnya.

## Kekuatan dan Keterbatasan

Tidak ada alat yang sempurna. Mari kita jujur tentang kedua sisinya.

**Mengapa cloud itu bagus**:

- Tidak ada biaya perangkat keras di muka
- Bayar hanya untuk yang Anda gunakan
- Berkembang secara instan ke kedua arah
- Keandalan dan keamanan fisik profesional
- Akses ke ratusan layanan terkelola (database, antrian, machine learning, dan lainnya)
  tanpa harus membangun atau memeliharanya sendiri
- Jangkauan global: men-deploy ke geografi baru adalah perubahan konfigurasi, bukan proses
  pengadaan perangkat keras

**Di mana menjadi rumit**:

- Biaya bisa tidak terduga jika Anda tidak memperhatikan (mimpi buruk Tom di masa depan)
- Anda bergantung pada pihak ketiga untuk infrastruktur Anda — jika AWS mengalami pemadaman di
  region Anda, layanan Anda juga terpengaruh
- Ada kurva pembelajaran. AWS memiliki ratusan layanan. Mengetahui mana yang harus digunakan
  membutuhkan pengalaman, atau buku seperti ini.
- Data yang meninggalkan cloud bisa mahal. Memindahkan data dalam jumlah besar keluar dari AWS
  menghabiskan biaya. (Kami akan kembali ke ini di Bab 30.)
- Vendor lock-in itu nyata untuk layanan tingkat lebih tinggi. Menggunakan basis data AWS terkelola
  mudah untuk dimulai dan lebih sulit untuk ditinggalkan. Semakin banyak layanan spesifik AWS yang Anda gunakan,
  semakin Anda berkomitmen pada ekosistem dan harga AWS.

"Jadi kita menukar kontrol dengan kenyamanan," kata Tom.

"Dan menukar biaya di muka dengan biaya yang berkelanjutan," Maya menambahkan.

"Dan menukar masalah orang lain dengan masalah kita sendiri, di sisi keamanan," kata Priya.

"Tapi kami juga menukar server Leo yang rusak dengan server Amazon yang sangat tidak rusak," kata Leo,
yang ternyata mendengarkan sepanjang waktu.

Ia tidak sepenuhnya salah.

Tom punya satu kekhawatiran lagi.

"Jika kita membangun segalanya di AWS dan AWS menaikkan harga dalam tiga tahun, kita tidak bisa begitu saja
memindahkan basis data kita ke ruang belakang restoran."

"Benar," kata Maya. "Tapi lintasan harga Amazon umumnya menurun — mereka telah
memotong harga lebih dari 100 kali sejak 2006. Risiko lock-in itu nyata, tetapi
risiko historis sebenarnya dari kenaikan harga mendadak rendah."

"Umumnya," kata Tom. Ia menuliskannya. Ia akan meninjau kembali perhitungan ini, seperti ia
meninjau semua perhitungannya, pada suatu Sabtu pagi di masa depan dengan pena merah dan kopi.

**Kapan On-Premises Adalah Pilihan yang Tepat**

Cloud memenangkan perbandingan Nimbus dengan jelas. Tapi kejujuran intelektual menuntut mengatakan kapan ia tidak menang.

**Perusahaan besar dengan beban kerja yang stabil dan dapat diprediksi** terkadang menemukan bahwa memiliki perangkat keras menjadi kompetitif secara biaya dengan menyewa begitu utilisasi secara konsisten tinggi. Jika Anda menjalankan ribuan server pada utilisasi 80% sepanjang waktu, ekonomi kepemilikan terlihat berbeda dari startup dengan lalu lintas yang bervariasi. Model bayar-per-penggunaan cloud paling menguntungkan ketika utilisasi bervariasi. Ketika utilisasi stabil dan tinggi, ekonomi per unit kepemilikan bisa kompetitif. Inilah mengapa beberapa perusahaan besar menjalankan arsitektur hibrida: cloud untuk beban kerja variabel, on-premises untuk yang stabil.

**Lingkungan data yang diatur dengan persyaratan lokalitas ketat** mungkin tidak punya pilihan selain on-premises. Lingkungan komputasi rahasia pemerintah — sistem yang menangani informasi keamanan nasional yang dirahasiakan — tidak bisa menggunakan penyedia cloud komersial. Data tidak boleh meninggalkan fasilitas yang dikendalikan secara fisik. Sistem keuangan di yurisdiksi tertentu memiliki persyaratan serupa. Organisasi kesehatan yang memproses kategori data tertentu mungkin menghadapi persyaratan yang tidak sepenuhnya dipenuhi sertifikasi cloud komersial. Dalam situasi ini, on-premises bukanlah preferensi; itu adalah mandat.

**Persyaratan latensi sangat rendah, kedekatan fisik** menciptakan kategori ketiga. Beberapa sistem perdagangan keuangan membutuhkan latensi sub-milidetik antara aplikasi mereka dan mesin pencocokan bursa. Co-location di pusat data fisik yang sama dengan bursa — dengan koneksi fiber langsung — mencapai latensi yang tidak bisa ditandingi region cloud mana pun. Beberapa instrumen ilmiah — akselerator partikel, jaringan seismik, teleskop radio — menghasilkan data yang harus diproses secara lokal sebelum transmisi menjadi layak. Ini adalah kasus penggunaan nyata yang memerlukan kedekatan fisik dengan perangkat keras.

**Kontrak jangka panjang yang ada** adalah kendala yang paling biasa tetapi sering paling relevan. Sebuah perusahaan yang menandatangani sewa pusat data lima tahun pada 2022 memiliki kewajiban kontrak. Pindah ke cloud sebelum sewa berakhir memiliki biaya nyata — pembayaran sewa yang tersisa — yang mengubah ekonominya secara signifikan. Keputusan arsitektur tidak terjadi dalam ruang hampa. Mereka terjadi di organisasi dengan kontrak yang ada, jadwal depresiasi perangkat keras yang ada, dan keahlian staf yang ada.

"Apakah ada yang seperti itu kita?" tanya Maya.

"Tidak," kata Tom. "Kita tidak punya perangkat keras. Tidak ada kontrak. Tidak ada mandat regulasi. Dan tim tanpa pengalaman administrasi server."

"Jadi cloud lah."

"Cloud lah. Tapi mengetahui kapan itu bukan jawabannya adalah bagian dari mengetahui apa yang Anda lakukan."

Tidak ada pengecualian on-premises yang berlaku untuk Nimbus. Tapi mereka nyata, dan arsitek cloud yang baik tahu kapan harus mengatakan "cloud bukanlah jawaban yang tepat di sini." Tujuannya bukan untuk menjadi advokat cloud. Tujuannya adalah untuk benar.

## Ringkasan

Pertanyaan yang tidak bisa dilepaskan Tom — mengapa menyewa lebih murah daripada memiliki? — ternyata punya jawaban sederhana dan jawaban yang rumit. Jawaban sederhananya adalah utilisasi: Anda berhenti membayar untuk kapasitas yang menganggur di Selasa yang sepi. Jawaban rumitnya melibatkan Model Tanggung Jawab Bersama, kompromi antara CapEx dan OpEx, dan beberapa situasi jujur di mana cloud sebenarnya adalah pilihan yang salah. Tom benar mengajukan pertanyaan itu. Jawabannya mengubah cara tim memikirkan segala hal yang menyusul.

- Manfaat utama adalah penskalaan bayar sesuai penggunaan: Anda membayar hanya untuk yang Anda gunakan, dan Anda bisa berkembang ke atas atau ke bawah sesuai kebutuhan.
- Perbandingan biaya Tom menunjukkan ekonomi perangkat keras dengan jelas: $720/tahun untuk dua instance EC2 vs. $8.000–$12.000/tahun untuk perangkat keras fisik yang setara, sebelum biaya pemeliharaan.
- AWS menangani infrastruktur fisik. Anda menangani aplikasi, data, dan konfigurasi Anda. Pembagian ini disebut **Model Tanggung Jawab Bersama**.
- Model Tanggung Jawab Bersama bergeser tergantung pada jenis layanan — layanan yang lebih terkelola berarti lebih banyak tanggung jawab AWS.
- Cloud tidak selalu lebih murah atau lebih sederhana — tetapi menghilangkan hambatan untuk memulai, dan memungkinkan penskalaan dengan cara yang tidak bisa ditandingi server fisik.

## Tips Ujian

*Domain SAA-C03: Lintas domain — Dasar-dasar konsep cloud*

- **Model Tanggung Jawab Bersama** muncul secara teratur dalam ujian. Ingat: AWS
  bertanggung jawab atas keamanan *dari* cloud (perangkat keras, pusat data, jaringan global).
  Anda bertanggung jawab atas keamanan *di* cloud (data, identitas, konfigurasi aplikasi).
- **Nuansa penting**: pembagian bergeser tergantung pada jenis layanan. Untuk EC2
  (mesin virtual yang Anda kontrol), *Anda* yang memperbarui sistem operasi. Untuk RDS (database
  terkelola), AWS yang memperbarui mesin database. Semakin "terkelola" suatu layanan,
  semakin banyak tanggung jawab yang pindah ke AWS. Skenario ujian akan mendeskripsikan insiden
  dan menanyakan siapa yang bertanggung jawab — selalu tanyakan "seberapa terkelola layanan ini?"
- Pertanyaan tentang *manfaat* cloud sering menguji CapEx vs. OpEx. Perangkat keras on-premises
  adalah pengeluaran modal (CapEx — beli sekali, depresiasi seiring waktu). Cloud adalah
  pengeluaran operasional (OpEx — bayar bulanan). AWS menggeser biaya dari CapEx ke OpEx.
- "Elastisitas" — kemampuan untuk berkembang ke atas *dan ke bawah* secara otomatis — adalah manfaat cloud
  inti. Anda mungkin melihatnya dipasangkan dengan "skalabilitas" dalam ujian. Elastisitas berarti
  penskalaan otomatis berbasis permintaan ke kedua arah. Skalabilitas berarti sistem
  *bisa* berkembang, tetapi belum tentu menyusut secara otomatis.
- Ujian mungkin mendeskripsikan skenario di mana sebuah perusahaan pindah dari "membeli server" ke "cloud." Kerangka yang benar: pindah dari CapEx ke OpEx, menghilangkan biaya di muka, mendapatkan elastisitas, dan menggeser tanggung jawab infrastruktur ke penyedia cloud.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: jelaskan Model Tanggung Jawab Bersama. Siapa yang bertanggung jawab atas apa,
dan mengapa perbedaan itu penting?

*(Petunjuk: Pikirkan tentang analogi Priya — siapa yang melindungi gedung, dan siapa yang melindungi apa yang ada
di dalamnya.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan sedang memigrasikan aplikasi webnya dari pusat data on-premises
ke AWS. Tim keamanan khawatir tentang mempertahankan kepatuhan terhadap kebijakan perlindungan
data mereka. Seorang insinyur baru bertanya: "Sekarang kita sudah di AWS, apakah Amazon menangani
semua persyaratan keamanan kita?"

Mana dari berikut ini yang PALING BAIK mendeskripsikan bagaimana tanggung jawab keamanan dibagi?

A) AWS sepenuhnya bertanggung jawab atas semua keamanan setelah aplikasi di-hosting di cloud  
B) Pelanggan sepenuhnya bertanggung jawab atas semua keamanan, termasuk keamanan pusat data fisik  
C) AWS mengelola keamanan infrastruktur yang mendasarinya; pelanggan mengelola keamanan data, aplikasi, dan konfigurasi mereka  
D) Tanggung jawab keamanan dinegosiasikan per akun dan bergantung pada tingkat layanan pelanggan

**Petunjuk 1**: Pikirkan tentang apa yang secara fisik dikendalikan AWS versus apa yang Anda kendalikan.

**Petunjuk 2**: AWS memiliki pusat data. Anda memilih apa yang akan dimasukkan dan bagaimana mengkonfigurasi
aplikasi Anda.

**Petunjuk 3**: Kami memperkenalkan nama spesifik untuk pembagian tanggung jawab ini dalam
bab ini.

**Jawaban**: C

**Penjelasan**: Model Tanggung Jawab Bersama AWS membagi keamanan menjadi dua domain.
AWS mengamankan infrastruktur fisik — pusat data, perangkat keras, dan jaringan.
Pelanggan mengamankan semua yang mereka terapkan di atasnya: data mereka, kontrol akses mereka,
konfigurasi aplikasi mereka, dan pengaturan jaringan mereka.

**Mengapa bukan A?** AWS tidak pernah mengambil tanggung jawab penuh atas keamanan aplikasi pelanggan.
Begitu Anda mengkonfigurasi sesuatu, konfigurasi itu milik Anda untuk dikelola.

**Mengapa bukan B?** Pelanggan tidak bertanggung jawab atas keamanan pusat data fisik —
itulah justru salah satu keuntungan menggunakan AWS.

**Mengapa bukan D?** Model Tanggung Jawab Bersama adalah kerangka tetap, bukan pengaturan yang dinegosiasikan.

*Domain SAA-C03: Lintas domain — Konsep cloud / Tanggung Jawab Bersama*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Seorang teman sedang meluncurkan aplikasi baru dan meminta pendapat Anda. Mereka memutuskan antara
membeli dua server fisik (satu untuk aplikasi, satu untuk database) atau menggunakan penyedia cloud.
Proyeksi lalu lintas mereka adalah 10–100 pengguna per hari, tetapi mereka memiliki acara peluncuran
dalam tiga bulan yang mungkin membawa 10.000 pengguna dalam satu hari.

Telusuri komprominya. Pilihan mana yang akan Anda rekomendasikan, dan apa alasan
utamanya? Apa yang akan Anda korbankan dengan pilihan Anda?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah melatih pemikiran dalam kompromi.)*

## Adegan Pasca-Kredit

Tiga hari kemudian, Nimbus memiliki akun AWS.

Leo telah membuatnya pada pukul 11 malam menggunakan alamat email pribadinya, kartu kredit yang harus ia pinjam dari Tom, dan antusiasme yang, dalam retrospeksi, sedikit mengkhawatirkan.

"Saya menemukan sesuatu yang disebut EC2," katanya keesokan paginya, menunjukkan layar laptopnya.
"Ini seperti komputer yang Anda sewa. Saya pikir saya sudah memulai satu."

"Kamu *pikir*?" tanya Priya.

"Maksud saya, saya pasti sudah memulai satu." Ia menggulir ke bawah. "Saya hanya tidak tahu di mana itu."

Maya menunduk dan melihat layar.

"Leo," katanya. "Mengapa tertulis 'Region: ap-southeast-1'?"

"Apa artinya itu?"

"Tunggu — tapi *mengapa* kita berada di Singapura?" kata Maya. "Semua pelanggan kita ada di Pantai Barat."

Di bab berikutnya: geografi AWS — di mana server sebenarnya berada, dan mengapa itu penting.
