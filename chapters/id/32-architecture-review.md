# Babat 32: Mempertahankan Rencana

Pertanyaan Maya di akhir Bab 31: “Apa perbedaan antara membuat keputusan arsitektur dan berpikir seperti seorang arsitek?”

Dia telah mengundang seorang tamu untuk membantu menjawabnya.

Namanya adalah Carlos. Dia telah menjadi seorang insinyur selama 20 tahun, manajer teknik selama tujuh, dan penasihat startup selama tiga. Dia adalah orang yang telah melihat sistem berhasil dan gagal cukup banyak untuk memiliki insting yang terkalibrasi tentang keduanya.

Dia tiba tanpa apa-apa: tanpa slide, tanpa agenda. Hanya ada pena whiteboard dan sebuah pertanyaan.

“Ceritakan tentang Nimbus,” katanya.

Ulasan arsitektur yang baik seperti pemeriksaan pra-penerbangan untuk seorang pilot. Pesawat mungkin terlihat siap terbang dengan sempurna—mesin berjalan, bahan bakar penuh, penumpang naik. Tetapi daftar periksa itu ada karena pilot berpengalaman tahu bahwa hal-hal yang paling mungkin menyebabkan masalah adalah hal-hal yang terasa baik tepat hingga mereka tidak. Daftar periksa itu tidak berarti pilot tidak tahu apa yang mereka lakukan. Itu berarti mereka telah memahami bahwa bahkan ahli pun melewatkan hal-hal ketika mereka melewatkan proses yang terstruktur.

**Gerakan Pertama Arsitek**

Yang terjadi selanjutnya mengejutkan tim.

Maya mulai menjelaskan sistem—instansi EC2, Aurora, CloudFront, ElastiCache, DynamoDB untuk menu, VPC dengan subnet privat...

Carlos menghentikannya dengan lembut.

“Mulai dengan bisnis,” katanya. “Bukan teknologi.”

Dia berhenti sejenak. Kemudian: “Nimbus adalah platform pemesanan restoran. Kami memiliki 287 mitra restoran. Kami memproses sekitar 4.200 pesanan per hari. Nilai pesanan rata-rata adalah $34. Kami tumbuh 18% kuartalan demi kuartalan.”

“Bagus. Apa hal terpenting yang harus dilakukan Nimbus?”

“Memproses pesanan,” kata Leo.

“Secara khusus,” tekan Carlos.

“Pesanan harus mencapai restoran dalam lima detik sejak ditempatkan, atau dapur melewatkan jendela waktu,” kata Priya, “dan pelanggan mengeluh. Kami kehilangan mitra restoran.”

“Jadi SLA lima detik,” kata Carlos, “bukan target teknis. Ini persyaratan kelangsungan bisnis.”

Keheningan.

“Itu,” katanya, “alasan mengapa percakapan arsitektur harus dimulai dengan persyaratan bisnis. Teknologi berada di hilir dari batasan itu.”

**Struktur Ulasan Arsitektur**

Ulasan arsitektur yang sebenarnya—yang terjadi sebelum Anda membangun sesuatu yang penting, atau ketika Anda mengevaluasi apakah Anda akan menskalakan—memiliki struktur.

Carlos menuliskannya di papan tulis:

**1. Pahami batasan**

Apa yang harus benar? Apa yang tidak boleh terjadi? (Bukan “apa yang kita inginkan.” Apa yang tidak dapat dinegosiasikan?)

**2. Pahami yang tidak diketahui**

Apa yang tidak kita ketahui? Di mana kita membuat asumsi? Apa yang terjadi jika asumsi itu salah?

**3. Evaluasi opsi**

Apa alternatif yang realistis? Apa trade-off dari masing-masing?

**4. Identifikasi mode kegagalan**

Bagaimana ini rusak? Apa urutan peristiwa ketika setiap mode kegagalan memicu?

**5. Validasi pemantauan**

Bagaimana Anda tahu ketika sesuatu salah? Sebelum pengguna memberi tahu Anda?

**6. Definisikan buku kerja**

Apa yang dilakukan seseorang pada pukul 3 pagi ketika ini rusak?

Ini bukan daftar periksa untuk diikuti secara mekanis. Ini adalah kerangka berpikir. Tujuannya adalah untuk memastikan pertanyaan penting diajukan *sebelum* Anda berada dalam produksi.

**Menjalankan Ulasan: Fitur Baru Nimbus**

Carlos telah diundang secara khusus karena Nimbus akan membangun sesuatu yang baru.

**Fitur**: “Nimbus Instant” — jaminan pengiriman 15 menit. Jika mitra restoran gagal memenuhi jendela waktu 15 menit lebih dari sekali per minggu, Nimbus akan mengembalikan uang kepada pelanggan secara otomatis.

“Jelaskan kepada saya persyaratan teknisnya,” kata Carlos.

Priya mulai. “Kita membutuhkan pelacakan waktu nyata dari penempatan pesanan hingga pengiriman. Kita perlu membandingkan waktu pengiriman aktual terhadap SLA 15 menit. Kita perlu memicu pengembalian dana secara otomatis.”

“Apa persyaratan latensi untuk data pelacakan?”

“Hampir waktu nyata. Pelanggan melihat pembaruan status di ponsel mereka.”

“Dalam berapa lama?”

“Lima detik mungkin.”

“Mungkin?”

“Dalam lima detik. Itu persyaratan produk.”

“Bagus. Gunakan Kinesis untuk aliran acara, lalu apa mode kegagalan jika Kinesis tertunda?”

“Pembaruan status terlambat ke pelanggan.”

“Apakah itu dapat diterima?”

“Untuk 10 detik? Mungkin. Untuk 60 detik? Tidak.”

“Jadi apa SLA untuk sistem pelacakan?”

Priya melihat ke Leo. “Kita belum memilikinya.”

Carlos menulis di papan: *Tidak Diketahui: SLA pelacakan.*

“Ini penting,” katanya. “Karena SLA menentukan desain infrastruktur. Jika SLA Anda adalah 5 detik, Anda membutuhkan solusi yang berbeda daripada jika itu 60 detik.”

**Pertanyaan yang Diajukan Arsitek**

Selama dua jam berikutnya, Carlos memandu tim melalui ulasan tersebut. Pilihan dari pertanyaannya:

**Tentang penyimpanan data:**

“Di mana status pesanan disimpan selama pemenuhan? Jika aplikasi crash di tengah pengiriman, apa proses pemulihannya? Bisakah Anda merekonstruksi status dari peristiwa saja?”

**Tentang mekanisme pengembalian dana:**

“Pengembalian dana dipicu secara otomatis. Apa yang mencegah pengembalian dana dikeluarkan dua kali? Apa yang terjadi jika pemroses pembayaran waktu habis dan Anda tidak yakin apakah pengembalian dana diterima?”

**Tentang pelacakan pengiriman:**

"Anda mengandalkan data GPS kurir. Apa yang terjadi jika sinyal GPS hilang selama 90 detik? Bagaimana Anda membedakan 'GPS hilang' dari 'pengiriman dalam proses' dari 'masalah pengiriman'?"

**Tentang Penanganan Kegagalan:**

"Jika layanan pengembalian dana sedang tidak berfungsi, apakah pesanan tetap diproses? Apakah pelanggan masih mendapatkan makanannya? Apa pengalaman pengguna selama kegagalan sistem parsial?"

**Tentang Observabilitas:**

"Bagaimana Anda mengetahui sekarang berapa banyak pesanan yang saat ini berada dalam 5 menit dari SLA 15 menit? Jika angka ini melonjak, siapa yang diberitahu?"

Setiap pertanyaan mengungkapkan asumsi yang telah dibuat tim tanpa menyadarinya.

"Kami belum memikirkan masalah pengembalian dana ganda," kata Leo setelahnya. "Kami hanya akan memanggil API pembayaran."

"Itu tidak salah," kata Priya. "Tetapi Anda membutuhkan idempotensi. Operasi pengembalian dana perlu aman untuk dipanggil dua kali."

"Kunci idempotensi — ID unik per upaya pengembalian dana, disimpan dalam DB sebelum memanggil API pembayaran. Jika kami memanggil dua kali dengan kunci yang sama, API pembayaran akan mengabaikan panggilan kedua."

"Yang berarti," tambah Carlos, "bahwa Anda membutuhkan penyimpanan status yang persisten untuk operasi pengembalian dana, bukan hanya sebuah peristiwa dalam antrian."

Ini adalah jenis detail arsitektur yang muncul dalam tinjauan terstruktur — dan seringkali tidak muncul ketika Anda hanya membangun.

**Catatan Keputusan Arsitektur**

Setelah tinjauan, Carlos merekomendasikan agar tim mendokumentasikan keputusan mereka dalam **Catatan Keputusan Arsitektur (ADR)** — dokumen pendek yang menangkap:

- **Keputusan apa yang dibuat**
- **Alternatif apa yang dipertimbangkan**
- **Mengapa keputusan ini dibuat (konteks dan batasan pada saat itu)**
- **Apa *trade-off*-nya**
- **Apa yang akan menyebabkan kita meninjau kembali keputusan ini**

"ADR adalah untuk diri Anda sendiri di masa depan," kata Carlos. "Dalam 18 bulan, Anda akan melihat arsitektur dan bertanya-tanya mengapa itu dilakukan dengan cara itu. Jika Anda memiliki ADR, Anda akan memahami konteksnya. Jika tidak, Anda akan biarkan saja (karena Anda takut menyentuhnya) atau mengubahnya (karena Anda tidak memahami mengapa itu dilakukan dengan cara itu)."

Leo menulis ADR pertama pada sore itu: keputusan untuk menggunakan Kinesis untuk peristiwa pelacakan pengiriman, dengan konteks, alternatif yang dipertimbangkan (SQS, EventBridge, polling), dan *trade-off*-nya.

**Apa yang Membuat Seorang Arsitek**

Pada akhir sesi, Maya bertanya kepada Carlos pertanyaan aslinya: "Apa perbedaan antara membuat keputusan arsitektur dan berpikir seperti seorang arsitek?"

Dia mempertimbangkannya.

"Seorang arsitek tidak tahu lebih banyak tentang teknologi daripada seorang insinyur senior," katanya. "Seorang arsitek yang baik mungkin tahu sedikit kurang tentang kerangka kerja terbaru. Tetapi seorang arsitek memiliki *default* pertanyaan yang berbeda."

"Apa maksudmu?"

"Ketika Anda adalah seorang insinyur senior yang melihat fitur baru, pertanyaan pertama Anda biasanya adalah: 'Apa yang kita bangun? Bagaimana cara kerjanya? Apa perpustakaan terbaik untuk ini?' Ketika seorang arsitek melihat fitur yang sama, pertanyaan pertama mereka adalah: 'Masalah apa yang diselesaikan ini? Apa yang pertama kali rusak ketika lalu lintas berlipat ganda? Bagaimana kita tahu ketika itu terdegradasi? Apa pengalaman pengguna ketika pemroses pembayaran lambat?'"

"Arsitek bertanya tentang sistem di bawah tekanan," kata Leo.

"Dan tentang konsekuensi bisnis dari setiap kegagalan," tambah Priya.

"Dan," kata Tom, "tentang apa yang terjadi dengan tagihan ketika ini diskalakan."

Carlos mengangguk. "Anda semua sudah melakukan ini. Anda sudah melakukannya sejak Bab 1. Perbedaan antara seorang insinyur senior dan seorang arsitek bukanlah sertifikasi atau gelar. Ini adalah kebiasaan mengajukan pertanyaan berikutnya — pertanyaan yang mengungkapkan hal yang belum Anda pikirkan."

## Kekuatan dan Batasan

**Tinjauan Arsitektur:**

- Menangkap *mode* kegagalan sebelum mereka berada dalam produksi
- Menciptakan pemahaman bersama antara anggota tim yang sering memiliki pengetahuan terpisah
- Menghasilkan dokumentasi (ADR) yang memberikan keuntungan selama bertahun-tahun
- Memperlambat pengambilan keputusan dengan cara yang bermanfaat — "bergerak cepat tanpa tinjauan adalah 'bergerak cepat dan membentur tembok yang tidak Anda lihat'"

**Di mana mereka menjadi rumit:**

- Membutuhkan seseorang yang cukup terampil untuk mengajukan pertanyaan yang tepat — tinjauan hanya sebaik pertanyaan yang diajukan
- Dapat menjadi birokratis jika diperlakukan sebagai kotak centang daripada percakapan
- Beberapa keputusan arsitektur benar-benar tidak memerlukan tinjauan lengkap — mengetahui mana yang melakukannya itu sendiri adalah keterampilan arsitektur
- Keluaran (ADR, diagram, log keputusan) harus dipelihara saat sistem berkembang

Dalam bab berikutnya: jawaban yang paling berguna, menjengkelkan, dan jujur ​​di semua rekayasa perangkat lunak.

## Ringkasan

- Tinjauan arsitektur dimulai dengan **persyaratan bisnis, bukan teknologi**.
- Struktur tinjauan: batasan → ketidakpastian → opsi → mode kegagalan → pemantauan → buku kerja.
- Arsitek bertanya: Apa yang pertama kali rusak? Bagaimana kita tahu itu terdegradasi? Apa pengalaman pengguna selama kegagalan? Apa biayanya dalam skala besar?
- **Catatan Keputusan Arsitektur (ADR)** menangkap apa yang telah diputuskan, mengapa, dan apa yang akan menyebabkan pertimbangan ulang.
- Berpikir seperti seorang arsitek adalah kebiasaan: mengajukan pertanyaan berikutnya, terutama tentang mode kegagalan, konsekuensi bisnis, dan ekonomi skala.
- Perbedaan antara membuat keputusan dan menjadi seorang arsitek adalah kumpulan pertanyaan default: arsitek secara default bertanya tentang tingkat sistem dan pertanyaan kegagalan, bukan hanya pertanyaan implementasi.

## Tips Ujian

*Domain SAA-C03: Lintas domain — penalaran arsitektur*

Bab ini kurang tentang topik ujian tertentu dan lebih tentang pola pikir yang diuji ujian tersebut.

- **Skenario SAA-C03** hampir selalu menggambarkan batasan bisnis ("perusahaan tidak dapat menanggung lebih dari 1 jam waktu henti") dan meminta Anda untuk memilih arsitektur yang memenuhi persyaratan tersebut. Berlatihlah menerjemahkan batasan bisnis ke dalam persyaratan teknis.
- **Pemikiran mode kegagalan**: Banyak pertanyaan ujian menggambarkan sistem dan meminta apa yang terjadi ketika komponen gagal. Berlatihlah mengajukan pertanyaan "apa yang pertama kali rusak?" untuk arsitektur yang Anda temui.
- **Pemikiran tentang trade-off**: Ujian jarang memiliki "jawaban yang sempurna". Ini meminta jawaban *terbaik* yang diberikan sekumpulan batasan. Biasakan diri Anda dengan "opsi ini benar mengingat persyaratan khusus ini, meskipun opsi lain akan lebih baik di bawah persyaratan yang berbeda."
- **Idempotensi**: Masalah pengembalian ganda adalah tantangan sistem terdistribusi yang nyata. Kunci idempotensi (unik per operasi, diperiksa sebelum eksekusi) adalah solusi standar. Ketahui pola ini.
- **Catatan Keputusan Arsitektur**: Bukan layanan AWS, tetapi praktik terbaik yang mencerminkan pilar Keunggulan Operasional dari Kerangka Kerja Arsitektur yang Terbaik.

## Latihan

**Latihan 1 — Mengingat**

Carlos mengajukan enam jenis pertanyaan selama tinjauan arsitektur. Bisakah Anda merekonstruksi enam area tersebut tanpa melihat bab ini?

*(Petunjuk: Mereka tercantum dalam "Struktur Tinjauan Arsitektur" bagian. Cobalah mengingatnya dari memori — tindakan mencoba mengingat (bahkan jika Anda gagal) memperkuat retensi jangka panjang.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan sedang membangun sistem manajemen penawaran waktu nyata untuk periklanan online. Penawaran harus dievaluasi dan dijawab dalam 100 milidetik. Sistem memproses 1 juta penawaran per detik pada puncak. Jika sistem penawaran mati, perusahaan kehilangan pendapatan iklan. Tim database perusahaan mengusulkan menggunakan RDS Aurora dengan 10 replika baca. Arsitek solusi harus mengevaluasi proposal tersebut.

Masalah apa yang HARUS diajukan arsitek PERTAMA?

A) Biaya 10 replika baca Aurora terlalu tinggi untuk anggaran.
B) Replika baca Aurora memiliki keterlambatan replikasi yang dapat menyebabkan masalah konsistensi.
C) Latensi kueri tipikal Aurora 1-5ms mungkin tidak memenuhi SLA 100ms.
D) RDS Aurora tidak mendukung volume transaksi 1 juta permintaan per detik pada persyaratan latensi ini.

**Petunjuk 1**: Batasan utamanya adalah 100ms total waktu respons pada 1 juta permintaan/detik. Dari opsi ini, opsi mana yang secara langsung mengancam memenuhi batasan ini?

**Petunjuk 2**: Pemikiran mode kegagalan: Banyak pertanyaan ujian menggambarkan sistem dan meminta apa yang terjadi ketika komponen gagal. Berlatihlah mengajukan pertanyaan "apa yang pertama kali rusak?" untuk arsitektur yang Anda temui.

**Petunjuk 3**: Pemikiran tentang trade-off: Ujian jarang memiliki "jawaban yang sempurna". Ini meminta jawaban *terbaik* yang diberikan sekumpulan batasan. Biasakan diri Anda dengan "opsi ini benar mengingat persyaratan khusus ini, meskipun opsi lain akan lebih baik di bawah persyaratan yang berbeda."

**Jawaban**: D

**Penjelasan**: Meskipun Aurora berkinerja tinggi, 1 juta permintaan per detik pada 100ms total waktu respons adalah persyaratan ekstrem. Arsitek harus terlebih dahulu mempertanyakan apakah Aurora (atau database relasional apa pun) dapat berfungsi sebagai sistem lookup utama pada skala dan latensi ini. Sistem seperti ini biasanya menggunakan penyimpanan data dalam memori (Redis) atau database berkinerja rendah khusus, bukan database relasional dengan semantik SQL penuh. SLA 100ms dapat dicapai untuk kueri Aurora saja, tetapi kombinasi 1M RPS dan 100ms total SLA melebihi karakteristik throughput Aurora yang khas.

**Mengapa bukan A?** Biaya adalah perhatian yang valid, tetapi perhatian pertama harus apakah arsitek secara teknis layak pada persyaratan yang dinyatakan.

**Mengapa bukan B?** Keterlambatan replikasi dalam replika baca Aurora biasanya <100ms — dapat diterima untuk sebagian besar kasus penggunaan. Masalah konsistensi itu nyata tetapi sekunder terhadap pertanyaan kelayakan.

**Mengapa bukan C?** Latensi kueri Aurora 1-5ms berada dalam SLA 100ms untuk bagian kueri database. Ini bukan perhatian utamanya.

*Domain SAA-C03: Lintas domain — desain sistem*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Terapkan struktur tinjauan arsitektur ke sistem nyata atau hipotetis:

Sebuah startup ingin membangun game trivia multipemain *real-time*. Pemain bergabung ke ruang permainan (hingga 10 pemain per ruangan). Setiap putaran menampilkan pertanyaan selama 15 detik; semua pemain menjawab secara bersamaan. Skor dihitung secara instan setelah setiap pertanyaan. Permainan berlangsung selama 10 putaran. Penggunaan puncak: 50.000 permainan bersamaan.

Lakukan *review* enam langkah berikut:

1. Apa saja batasan yang tidak dapat dinegosiasikan?
2. Apa saja hal yang tidak diketahui dan asumsi?
3. Apa saja opsi teknologi yang realistis?
4. Apa saja mode kegagalan?
5. Bagaimana Anda akan tahu ketika sistem mulai menurun?
6. Bagaimana tampilan *runbook* untuk jam 3 pagi?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk melatih struktur *review* sebagai alat berpikir.)*

## Adegan Setelah Kredit

Carlos meninggalkan kantor pukul 6 sore.

Tim duduk beberapa saat setelah itu, tidak melakukan apa pun secara khusus.

"Saya merasa saya belajar lebih banyak dalam dua jam itu daripada dalam bab tunggal tentang layanan AWS apa pun," kata Leo.

"Itu karena bab-bab itu tentang alat," kata Maya. "Ini tentang penilaian."

"Apakah penilaian dapat diajarkan?" dia bertanya.

"Ya," kata Priya. "Tapi bukan melalui membaca. Melalui praktik. Melalui membuat keputusan, melihat apa yang rusak, memikirkan mengapa."

"Melalui pengalaman," kata Tom.

"Melalui pengalaman terstruktur," koreksi Priya. "Pengalaman tanpa refleksi tidak membangun penilaian. Anda harus mengajukan pertanyaan setelahnya."

Maya melihat papan tulis. Catatan *review* masih ada di sana — batasan, ketidakpastian, mode kegagalan, pertanyaan pemantauan. Itu memenuhi dua papan tulis.

"Ini harus masuk ke dalam ADR," katanya.

Leo sudah mengetik.

Dalam bab terakhir: satu-satunya hal yang tidak dapat diberikan oleh alat atau kerangka kerja apa pun — dan mengapa "tergantung" adalah jawaban yang paling jujur dan kuat dalam arsitektur perangkat lunak.
