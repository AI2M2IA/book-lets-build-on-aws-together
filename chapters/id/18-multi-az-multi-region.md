# Babat 18: Ketika Hal-Hal Rusak

Bab ini membahas kegagalan—yang direncanakan, dirancang untuk menanganinya, dan pada akhirnya diterima sebagai hal yang tak terhindarkan. Mungkin ini bab terpenting dalam buku ini.

Nimbus berjalan dengan baik. Lapisan keamanan sudah ada. Pemantauan aktif. Lalu lintas meningkat.

Kemudian Leo menerima notifikasi Slack pada pukul 23:23 hari Kamis.

"us-east-1 Zona Ketersediaan us-east-1b — kegagalan perangkat keras — layanan yang terdegradasi."

Dia membuka konsol AWS. Instans EC2 di us-east-1b menunjukkan bahwa pemeriksaan status gagal. Grup Skala Otomatisnya mendeteksi instans yang tidak sehat dan membuat penggantinya—di us-east-1b.

Di zona ketersediaan yang gagal.

Instans baru juga tidak bisa dimulai. Mereka berada di zona perangkat keras yang sama yang mengalami kegagalan.

"Load balancer mengarahkan lalu lintas ke kedua zona ketersediaan," kata Leo kepada siapa pun. "Setengah dari lalu lintas kami mengarah ke instans yang tidak berfungsi."

Dua puluh dua menit layanan yang terdegradasi sebelum dia menyadarinya dan secara manual memindahkan ASG hanya untuk menggunakan us-east-1a.

"Ini terjadi karena semuanya berada di satu zona ketersediaan," kata Priya pagi berikutnya.

"Tidak," kata Leo. "Saya memiliki instans di dua zona ketersediaan. Masalahnya adalah instans pengganti muncul di zona ketersediaan yang gagal."

"Dan database?"

Leo berhenti.

"Instans RDS adalah Multi-AZ," katanya. "Standby berada di us-east-1b. Yang gagal. Dan RDS mencoba melakukan failover ke standby, yang juga gagal."

Dua puluh dua menit layanan yang terdegradasi telah menjadi tiga puluh delapan.

**Analogi Jaringan Listrik**

Pikirkan tentang bagaimana rumah Anda mendapatkan listrik. Listrik tidak datang dari satu kabel yang berjalan dari satu generator. Itu datang dari jaringan—jaringan generator, stasiun transformator, dan saluran transmisi yang saling mendukung. Jika satu stasiun transformator terbakar, yang lain mengarahkan daya di sekitarnya. Anda tidak menyadarinya. Lampu tetap menyala.

Zona Ketersediaan AWS bekerja dengan cara yang sama. Alih-alih satu pusat data raksasa yang semuanya bergantung padanya, AWS menyebarkan sumber daya Anda ke beberapa fasilitas terpisah secara fisik. Jika satu fasilitas kehilangan daya atau mengalami kegagalan perangkat keras, yang lain terus berjalan. Lalu lintas di-reroute secara otomatis. Aplikasi Anda tetap aktif—karena tidak ada kabel yang bisa diputus.

Multi-Region adalah tingkat berikutnya: bayangkan memiliki generator cadangan di kota yang sama sekali berbeda. Jika seluruh jaringan listrik lokal gagal, kota terpencil mengambil alih. Lebih kompleks untuk diatur, tetapi lebih tangguh terhadap kegagalan katastropik.

**Kosakata Kegagalan**

Sebelum mendesain untuk ketahanan, Anda perlu kata-kata untuk apa yang Anda desain terhadapnya.

**Ketersediaan**: Persentase waktu suatu sistem beroperasi. "Sembilan sembilan" (99,99%) berarti kurang dari 52 menit waktu henti per tahun. "Sembilan sembilan sembilan sembilan" (99,999%) berarti sekitar 5 menit per tahun.

**RTO (Waktu Pemulihan Tujuan)**: Berapa lama sistem dapat tetap tidak berfungsi sebelum menjadi masalah bisnis? Jika RTO Anda adalah 4 jam, Anda memiliki 4 jam untuk memulihkan layanan sebelum SLA dilanggar.

**RPO (Tujuan Titik Pemulihan)**: Berapa banyak data yang dapat Anda tanggung untuk kehilangan? Jika RPO Anda adalah 1 jam, Anda dapat mentolerir kehilangan hingga satu jam data dalam kegagalan katastropik. Semua yang ditulis dalam satu jam sebelum kegagalan hilang.

**Toleransi Kesalahan**: Kemampuan untuk terus beroperasi (pada tingkat tertentu) ketika komponen gagal.

**Pemulihan Bencana (DR)**: Proses memulihkan diri dari kegagalan katastropik—kebakaran pusat data, pemadaman wilayah, penghapusan massal yang tidak disengaja.

Kelima konsep ini mendorong setiap keputusan arsitektur dalam bab ini.

**Multi-AZ: Bertahan dari Kegagalan Zona Ketersediaan**

Zona Ketersediaan (AZ) adalah pusat data terpisah secara fisik dalam Wilayah. AZ dirancang untuk menjadi independen: pasokan daya terpisah, pendinginan terpisah, infrastruktur jaringan terpisah. Tetapi mereka cukup dekat sehingga latensi jaringan di antara mereka adalah 1-2 milidetik.

**Penyebaran Multi-AZ** menyebarkan sumber daya Anda di dua atau lebih AZ dalam Wilayah. Jika satu AZ gagal:

- Load balancer berhenti mengarahkan lalu lintas ke instans yang tidak sehat di AZ yang gagal
- Grup Skala Otomatis mengganti instans—tetapi di AZ yang *sehat*
- RDS melakukan failover ke standby di AZ yang sehat

Kesalahan Leo: Grup Skala Otomatisnya tidak dikonfigurasi untuk meluncurkan instans pengganti hanya ke AZ yang sehat, dengan minimum dua AZ selalu aktif.

Solusinya: konfigurasikan ASG untuk meluncurkan hanya ke AZ yang sehat, dengan minimum dua AZ selalu aktif.

Pelajaran yang lebih dalam: menguji skenario kegagalan Anda sebelum mereka terjadi di produksi.

**Mensimulasikan Kegagalan: Rekayasa Kebusukan**

"Bagaimana kita tahu pengaturan Multi-AZ kita benar-benar berfungsi?" tanya Maya.

"Kita merusak hal-hal dengan sengaja," kata Leo.

Ini terdengar sembrono. Itu sebenarnya hal yang paling bertanggung jawab yang dapat dilakukan tim.

**Rekayasa Kebusukan** adalah praktik secara sengaja menyuntikkan kegagalan ke dalam sistem Anda untuk memverifikasi bahwa sistem tersebut menanganinya dengan benar. Anda secara sengaja mengakhiri instans EC2. Anda melakukan failover instans RDS. Anda memblokir subnet dari load balancer.

Jika sistem pulih secara otomatis dalam RTO Anda, desain Anda berfungsi.

Jika tidak, Anda telah mempelajari hal itu dalam pengaturan terkendali—bukan selama insiden produksi pukul 2 pagi.

Untuk Nimbus: Leo menulis *runbook* (prosedur terdokumentasi) untuk menguji setiap skenario kegagalan. Sekali setiap kuartal, mereka sengaja menyebabkan satu komponen gagal dan mengukur waktu pemulihan. Jika pemulihan membutuhkan waktu lebih lama dari RTO, mereka akan memperbaiki desainnya.

**Multi-Region: Bertahan dari Kegagalan Regional**

Sebagian besar kegagalan AWS memengaruhi Zona Ketersediaan, bukan seluruh Wilayah. Kegagalan regional jarang terjadi—tetapi itu bisa terjadi.

Dalam kegagalan regional (atau untuk aplikasi global yang membutuhkan latensi sangat rendah di mana-mana), **Multi-Region** adalah jawabannya: sebarkan aplikasi Anda di dua atau lebih Wilayah AWS.

Multi-Region memperkenalkan kompleksitas mendasar:

**Replikasi Data**: Database Anda perlu sinkron di seluruh wilayah. Setiap data yang ditulis di us-east-1 harus pada akhirnya mencapai eu-west-1. “Akhirnya” adalah masalahnya—selama penundaan waktu, wilayah memiliki tampilan dunia yang sedikit berbeda.

**Aktif-Pasif vs Aktif-Aktif**:

- **Aktif-Pasif**: Satu wilayah melayani semua lalu lintas. Yang lain adalah *standby* hangat. Pada kegagalan, DNS beralih lalu lintas ke *standby*. Lebih sederhana, tetapi *standby* tidak aktif dan mahal.
- **Aktif-Aktif**: Kedua wilayah melayani lalu lintas secara bersamaan. Lebih kompleks untuk dibangun (membutuhkan resolusi konflik untuk penulisan bersamaan), tetapi latensi global lebih rendah dan tidak ada sumber daya yang tidak aktif.

**Waktu Pemulihan**: Perubahan DNS membutuhkan waktu untuk disebarkan (tergantung TTL). Selama jendela penyebaran, beberapa pengguna masih menargetkan wilayah yang gagal. Merancang untuk RTO yang sangat rendah memerlukan pemanasan *standby* dan meminimalkan TTL sebelum peralihan yang direncanakan.

**Strategi Pemulihan Bencana: Spektrum**

Ada empat strategi DR umum, diatur dari termurah (dan lambat untuk dipulihkan) hingga yang paling mahal (dan tercepat untuk dipulihkan):

**Cadangan dan Pemulihan** (jam RPO/RTO):

- Buat cadangan semuanya ke S3 di wilayah yang berbeda
- Pada bencana: siapkan infrastruktur dari awal, pulihkan dari cadangan
- Biaya: sangat rendah (Anda hanya membayar untuk penyimpanan)
- Waktu pemulihan: jam

**Titik Pilot** (menit hingga 1 jam RPO/RTO):

- Jalankan versi minimal dari aplikasi yang berjalan di wilayah DR (titik *pilot* yang dapat dengan cepat ditingkatkan)
- Data inti direplikasi (replika baca RDS di wilayah DR)
- Pada bencana: skala up wilayah DR, promosikan replika baca menjadi utama, beralihkan DNS
- Biaya: moderat (Anda membayar untuk jejak berjalan yang kecil)
- Waktu pemulihan: beberapa menit

**Standby Hangat** (detik hingga menit RPO/RTO):

- Jalankan versi yang diskalakan dari aplikasi penuh di wilayah DR
- Sepenuhnya fungsional tetapi pada kapasitas yang berkurang
- Pada bencana: skala up, beralihkan DNS
- Biaya: lebih tinggi (selalu menjalankan tumpukan penuh pada skala yang berkurang)
- Waktu pemulihan: menit

**Aktif-Aktif / Situs Multi** (RPO/RTO mendekati nol):

- Kapasitas penuh di dua atau lebih wilayah, melayani lalu lintas secara bersamaan
- Tidak diperlukan pemulihan—jika satu wilayah gagal, lalu lintas akan diarahkan ke wilayah lain secara otomatis
- Biaya: tertinggi (dua penyebaran penuh pada skala penuh)
- Waktu pemulihan: detik (hanya penyebaran DNS)

Untuk Nimbus pada tahap ini: *standby* hangat. Mereka tidak mampu *active-active*, tetapi cadangan dan pemulihan terlalu lambat untuk persyaratan bisnis mereka.

**Amazon RDS: Multi-AZ vs Read Replicas vs Multi-Region**

Tiga ini berbeda dan sering disalahartikan:

| Fitur       | Multi-AZ                     | Read Replica     | Multi-Region Read Replica |
|---------------|------------------------------|------------------|---------------------------|
| Tujuan       | Ketersediaan Tinggi (pemulihan) | Penskalaan Baca     | Penskalaan Baca + DR         |
| Sinkronisasi Data | Sinkron                     | Asinkron         | Asinkron              |
| Pemulihan     | Otomatis                    | Promosi Manual | Promosi Manual          |
| Dapat Dibaca?     | Tidak (standby pasif)      | Ya              | Ya                       |
| Melintasi Wilayah? | Tidak (zona yang sama)             | Ya (opsional)   | Ya                       |
| Untuk       | HA, RPO~0                    | Beban Baca        | Pemulihan Bencana         |

Wawasan kunci: *Standby* Multi-AZ bersifat **sinkron**—setiap penulisan ke *primary* dikonfirmasi pada *standby* sebelum penulisan diakui. Ini berarti jika *primary* gagal, tidak ada data yang hilang. RPO = 0.

Read replica bersifat **asinkron**—ada penundaan replikasi. Jika *primary* gagal dan Anda mempromosikan read replica, Anda mungkin kehilangan detik atau menit penulisan terbaru. RPO > 0.

## Kekuatan dan Keterbatasan

**Multi-AZ**:

- Penting untuk beban kerja produksi—zona tunggal adalah titik kegagalan tunggal
- Didukung dengan baik oleh layanan AWS (RDS, ElastiCache, EKS, ALB semuanya mendukung Multi-AZ)
- Overhead biaya relatif rendah dibandingkan dengan perlindungan yang diberikannya

**Multi-Region**:

- Kompleks untuk diimplementasikan dengan benar, terutama untuk database
- Persyaratan residensi data/kedaulatan mungkin sebenarnya membutuhkannya (data pengguna UE harus tetap di UE)
- Manfaat latensi untuk pengguna global berasal dari perutean, bukan dari multi-region secara langsung (gunakan CloudFront untuk konten statis)
- Sebagian besar organisasi tidak membutuhkan *active-active*; mereka kurang berinvestasi dalam *standby* hangat

## Ringkasan

- **RTO** (Recovery Time Objective): berapa lama Anda bisa tidak berfungsi. **RPO** (Recovery Point Objective): berapa banyak data yang bisa Anda hilangkan.
- **Multi-AZ** menyebarkan sumber daya di seluruh Availability Zones dalam sebuah Region. Melindungi terhadap kegagalan AZ.
- **Multi-Region** menyebarkan di beberapa AWS Region. Melindungi terhadap kegagalan regional dan melayani pengguna global dengan latensi lebih rendah.
- Strategi DR (termurah hingga paling mahal): Backup & Restore → Pilot Light → Warm Standby → Active-Active.
- RDS Multi-AZ standby: sinkron, failover otomatis, RPO = 0. Read replicas: asinkron, promosi manual, RPO > 0.
- Uji kegagalan Anda secara sengaja (chaos engineering) sebelum terjadi di produksi.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Resilient (Domain 2, Tugas 2.2)*

- **RTO vs RPO**: Harapkan ujian akan memberikan Anda persyaratan ("organisasi dapat mentolerir tidak lebih dari 1 jam downtime dan tidak ada kehilangan data") dan meminta Anda untuk memilih strategi DR yang tepat. Peta: tidak ada kehilangan data = replikasi sinkron = Multi-AZ atau active-active. 1 jam downtime = backup-and-restore terlalu lambat; warm standby mungkin berfungsi.
- **Multi-AZ RDS vs Read Replicas**: Ujian akan meminta Anda untuk HA (Multi-AZ) vs penskalaan baca (read replicas). Standby Multi-AZ tidak dapat dibaca. Read replicas dapat dipromosikan ke primary (secara manual) untuk DR.
- **Pilot Light vs Warm Standby**: Pilot Light memiliki infrastruktur minimal yang berjalan (hanya replikasi data). Warm Standby memiliki aplikasi yang diskalakan secara menurun tetapi berjalan. Perbedaannya adalah seberapa cepat Anda dapat menskalakan.
- **Aurora Global Database**: Fitur khusus Aurora untuk multi-region active-passive. Region utama melayani tulis; region sekunder melayani baca dengan latensi <1 detik. Pada failover, region sekunder dapat dipromosikan dalam <1 menit. Sinyal ujian: "Aurora, multi-region, RTO < 1 menit."
- **AWS Backup**: Layanan pencadangan terpusat untuk EBS, RDS, DynamoDB, EFS, Storage Gateway. Ujian menggunakannya untuk skenario backup-and-restore.
- **Route 53 failover**: Lapisan DNS dari DR. Pemeriksaan kesehatan primer gagal → Route 53 merutekan ke sekunder. Waktu propagasi berarti ini bukan instan.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara RTO dan RPO. Mengapa sebuah organisasi mungkin memiliki RTO yang rendah (tidak bisa down lama) tetapi RPO yang tinggi (dapat mentolerir kehilangan data terbaru)?

*(Petunjuk: Pikirkan tentang bisnis di mana melayani pelanggan dengan cepat lebih penting daripada menyimpan setiap transaksi.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan perawatan kesehatan menjalankan sistem catatan pasien pada RDS PostgreSQL di `us-east-1`. Persyaratan peraturan mengharuskan data pasien tidak pernah hilang (RPO = 0). Sistem dapat mentolerir hingga 30 menit downtime (RTO = 30 menit) dalam bencana. Biaya menjadi perhatian.

Arsitektur mana yang TERBAIK memenuhi persyaratan ini?

A) RDS Multi-AZ di `us-east-1` dengan pencadangan otomatis harian ke S3 di `us-west-2`
B) RDS Multi-AZ di `us-east-1` dengan read replica di `us-west-2` yang dikonfigurasi untuk promosi manual
C) RDS di `us-east-1` dengan warm standby di `us-west-2` dan replikasi active-active
D) Aurora Global Database dengan primary di `us-east-1` dan secondary di `us-west-2`

**Petunjuk 1**: RPO = 0 berarti tidak ada kehilangan data, yang membutuhkan replikasi sinkron atau mendekati sinkron.

**Petunjuk 2**: RTO = 30 menit berarti Anda memiliki waktu untuk intervensi manual. Anda tidak perlu failover otomatis milidetik.

**Petunjuk 3**: Opsi mana yang menyediakan perlindungan Multi-AZ (RPO = 0 dalam region) ditambah kemampuan DR lintas region?

**Jawaban**: A

**Penjelasan**: RDS Multi-AZ di us-east-1 menyediakan replikasi sinkron ke standby di region yang sama — RPO = 0 untuk kegagalan AZ. Pencadangan otomatis harian ke S3 di us-west-2 menyediakan DR lintas region. Dalam kegagalan regional penuh, Anda memulihkan dari backup S3 di us-west-2 — dalam 30 menit untuk database kecil. Ini hemat biaya dan memenuhi kedua persyaratan.

**Mengapa bukan B?** Read replicas bersifat asinkron — dapat terjadi lag replikasi. Jika primary gagal, data yang ditulis sejak sinkronisasi replica terakhir hilang. RPO > 0, yang melanggar persyaratan.

**Mengapa bukan C?** "Replikasi active-active" untuk PostgreSQL di seluruh region adalah kompleks untuk diimplementasikan dan bukan fitur RDS standar. Opsi ini sulit dan mahal secara teknis.

**Mengapa bukan D?** Aurora Global Database akan berfungsi tetapi secara signifikan lebih mahal daripada RDS Multi-AZ. Skenario mengatakan biaya menjadi perhatian, dan Aurora adalah harga premium.

*SAA-C03 Domain: Desain Arsitektur Resilient — Tugas 2.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus telah dipilih untuk menyediakan layanan pemesanan untuk festival makanan utama di Seattle. Untuk 72 jam, mereka mengharapkan 50x lalu lintas normal mereka, dengan nol toleransi untuk downtime (kontrak pengorganisasi festival menentukan denda keuangan untuk setiap downtime selama acara).

Rancang strategi DR untuk jendela festival secara khusus. Apakah Anda akan beralih ke active-active untuk 72 jam tersebut? Bagaimana Anda akan melakukan pra-uji failover? Apa RTO Anda, dan bagaimana Anda akan memvalidasinya sebelum acara tersebut?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk mempraktikkan desain DR untuk persyaratan SLA tertentu.)*

## Adegan Pasca Kredit

Leo membuat *runbook* untuk *chaos engineering*.

Setiap kuartal, selama jendela pemeliharaan terjadwal, tim akan melakukan hal berikut:

1. Menghentikan satu *EC2 instance* di us-east-1a dan mengamati apakah *ASG* menggantinya dengan benar
2. Memaksa *RDS Multi-AZ failover* secara manual dan memverifikasi bahwa aplikasi terhubung kembali dalam waktu 60 detik
3. Mensimulasikan kegagalan total us-east-1b dengan menyesuaikan *availability zones* *ASG*
4. Memulihkan *backup* berusia satu minggu ke *RDS instance* baru dan memverifikasi bahwa datanya terlihat benar

Untuk pertama kalinya mereka menjalankannya, langkah 2 membutuhkan waktu 4 menit 17 detik.

"Komitmen RTO kami kepada mitra restoran adalah 5 menit," kata Tom.

"Jadi kami lolos. Hampir saja."

"Apa yang akan terjadi jika *failover* membutuhkan waktu lebih dari 5 menit dalam insiden nyata?"

Maya menjawab: "Kami akan melanggar SLA. Ada denda finansial dalam kontrak."

Leo menatap angka 4:17 di layar.

"Maka kita perlu membuatnya lebih cepat," katanya. Dan dia mulai membaca dokumentasi untuk Aurora.

Pada bab berikutnya: mesin tiket yang memungkinkan setiap bagian dari Nimbus bekerja dengan kecepatan masing-masing.
