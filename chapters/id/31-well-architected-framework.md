# Babat 31: Inspektur Bangunan untuk Arsitektur Awan

Berdiri. Luruskan badan. Ambil istirahat sejenak jika Anda membutuhkannya.

Bab ini berbeda dari bab-bab sebelumnya. Kami telah menghabiskan 30 bab untuk membangun pengetahuan tentang layanan dan pola tertentu. Sekarang kita mundur selangkah dan melihat gambaran besarnya.

Apa yang sebenarnya *baik* dalam arsitektur awan? Apakah ada cara sistematis untuk mengevaluasi apakah yang telah Anda bangun benar-benar dirancang dengan baik — atau hanya berfungsi?

Ada. AWS menyebutnya Kerangka Kerja Arsitektur yang Baik.

Nimbus telah beroperasi selama dua tahun. Tim telah membuat ratusan keputusan arsitektur — beberapa secara sadar, beberapa secara tidak sengaja, beberapa di bawah tekanan. Sistemnya berfungsi. Namun Maya memiliki pertanyaan.

"Apakah arsitektur kita benar-benar *baik*?" dia bertanya. "Tidak hanya berfungsi. Baik."

Tidak ada yang segera menjawab.

"Karena saya mendengar tentang Tinjauan Arsitektur yang Baik," lanjutnya. "AWS menawarkannya kepada pelanggan. Beberapa investor kami menyebutkannya. Saya pikir kita harus melakukannya."

"Apa itu?" Leo bertanya.

"Kerangka kerja AWS untuk mengevaluasi arsitektur awan," kata Priya. "Enam pilar. Sekumpulan pertanyaan dan praktik terbaik untuk masing-masing. Anda menilai arsitektur Anda terhadap semuanya dan mengidentifikasi apa yang hilang."

"Ini seperti inspeksi bangunan," kata Tom. "Anda tahu bangunan itu berfungsi. Inspeksi memberi tahu Anda apakah itu sesuai dengan kode dan apa yang mungkin gagal dalam gempa bumi."

**Enam Pilar**

Kerangka Kerja Arsitektur yang Baik AWS diorganisasikan di sekitar enam pilar. Setiap pilar memiliki sekumpulan prinsip desain, praktik terbaik, dan pertanyaan untuk menilai arsitektur Anda.

**1. Keunggulan Operasional**

*Fokus*: Menjalankan dan memantau sistem untuk memberikan nilai bisnis, dan terus meningkatkan proses dan prosedur.

Area Kunci:

- Bagaimana perubahan diterapkan? (CI/CD, infrastruktur sebagai kode, penerapan otomatis)
- Bagaimana sistem dipantau dan Anda tahu ketika ada yang salah?
- Bagaimana Anda belajar dari kegagalan? (post-mortem, runbook, budaya tanpa menyalahkan)
- Bagaimana Anda menangani perubahan pada skala besar?

Penilaian Nimbus:

- Present: Pipeline CI/CD dengan penerapan otomatis
- Present: CloudWatch alarm dan GuardDuty
- Present: Uji chaos triwulanan
- Peringatan: Proses post-mortem tidak diformalkan — insiden diselidiki tetapi pembelajaran tidak didokumentasikan secara sistematis

**2. Keamanan**

*Fokus*: Melindungi informasi, sistem, dan aset melalui penilaian risiko dan strategi mitigasi.

Area Kunci:

- Siapa yang dapat mengakses apa, dan dengan hak istimewa terkecil mungkin?
- Bagaimana data dienkripsi saat istirahat dan saat transit?
- Bagaimana Anda mendeteksi dan menanggapi ancaman?
- Apakah ada kontrol keamanan otomatis?

Penilaian Nimbus:

- Present: IAM dengan hak istimewa terkecil (setelah pembersihan di Bab 14)
- Present: KMS untuk enkripsi data, Secrets Manager untuk kredensial
- Present: GuardDuty, WAF, Shield Standar
- Present: VPC dengan subnet pribadi, grup keamanan
- Peringatan: Patching keamanan pada instans EC2 tidak sepenuhnya otomatis (Priya menandainya beberapa bulan lalu, belum terselesaikan)

**3. Keandalan**

*Fokus*: Memastikan sistem melakukan fungsi yang dimaksudkan dengan benar dan konsisten, dan mampu pulih dari kegagalan.

Area Kunci:

- Bagaimana sistem menangani kegagalan pada tingkat komponen?
- Bagaimana ia pulih dari kegagalan regional?
- Bagaimana permintaan dikelola?
- Bagaimana sistem diuji untuk kegagalan?

Penilaian Nimbus:

- Present: Multi-AZ untuk semua komponen penting
- Present: Aurora Serverless dengan failover otomatis
- Present: Auto Scaling untuk EC2 dan ECS
- Present: Uji chaos triwulanan
- Peringatan: Tidak ada penerapan multi-region (standby hangat belum diimplementasikan — direncanakan untuk kuartal berikutnya)

**4. Efisiensi Kinerja**

*Fokus*: Menggunakan sumber daya IT dan komputasi secara efisien.

Area Kunci:

- Apakah jenis instans dan jenis database yang tepat sedang digunakan untuk beban kerja?
- Apakah penskalaan dikonfigurasi dengan benar?
- Apakah data disampaikan kepada pengguna dari lokasi optimal?

Penilaian Nimbus:

- Present: CloudFront untuk pengiriman konten global
- Present: ElastiCache untuk percepatan baca database
- Present: Replika baca Aurora
- Present: Lambda untuk beban kerja yang sesuai
- Peringatan: Beberapa instans EC2 tidak pernah di-right-size sejak penerapan awal

**5. Optimalisasi Biaya**

*Fokus*: Mencegah biaya yang tidak perlu.

Area Kunci:

- Apakah sumber daya berukuran sesuai?
- Apakah sumber daya yang tidak digunakan dipensiunkan?
- Apakah model harga yang sesuai sedang digunakan?
- Apakah anomali pengeluaran terdeteksi?

Penilaian Nimbus:

- Present: Savings Plans diimplementasikan (Bab 27)
- Present: Kebijakan siklus hidup S3 (Bab 23)
- Present: DynamoDB Auto Scaling
- Present: AWS Budgets dengan peringatan
- Present: Tinjauan biaya triwulanan

**6. Keberlanjutan**

*Fokus*: Meminimalkan dampak lingkungan dari menjalankan beban kerja awan.

Area Kunci:

- Apakah pemanfaatan dimaksimalkan (menghindari sumber daya yang idle)?
- Apakah jenis instans dipilih untuk efisiensi energi?
- Apakah data disimpan hanya selama yang dibutuhkan?

Penilaian Nimbus:

- **Saat Ini:** Lambda dan Fargate untuk beban kerja tanpa server/berbasis kontainer (efisiensi sumber daya lebih baik daripada EC2 khusus)
- **Saat Ini:** Kebijakan siklus hidup S3 (menghapus data yang tidak lagi dibutuhkan)
- **Peringatan:** Beberapa instance Graviton belum diadopsi (AWS Graviton lebih hemat energi dan lebih murah)

**Proses Tinjauan Arsitektur yang Baik**

Tinjauan ini bukanlah tes yang Anda lewatkan atau gagal. Ini adalah percakapan terstruktur tentang arsitektur Anda, dipandu oleh lebih dari 60 pertanyaan di enam pilar.

Setiap pertanyaan mengidentifikasi praktik terbaik. Jika arsitektur Anda mengikuti itu, itu adalah kekuatan. Jika tidak, itu adalah “masalah” — dikategorikan berdasarkan tingkat risiko (tinggi, sedang, rendah).

Hasilnya: daftar prioritas rekomendasi perbaikan. Tidak semua perlu diperbaiki segera. Kerangka kerja ini membantu Anda memahami trade-off dari setiap kesenjangan dan memutuskan apa yang akan ditangani pertama kali.

Alat Arsitektur yang Baik AWS (tersedia di konsol AWS, gratis) menyediakan kerangka pertanyaan dan menghasilkan laporan dengan rekomendasi.

Untuk Nimbus, Maya menjadwalkan lokakarya setengah hari. Semua empat anggota tim meninjau setiap pilar bersama-sama. Pada akhirnya, mereka memiliki daftar 12 “masalah” — tiga risiko tinggi, lima risiko sedang, empat risiko rendah.

**Masalah Risiko Tinggi:**

1. Tidak ada rencana DR multi-region (keandalan)
2. Patch keamanan EC2 tidak diotomatiskan (keamanan)
3. Tidak ada proses respons insiden formal (keunggulan operasional)

**Masalah Risiko Sedang:**

5 item termasuk: tidak ada adopsi Graviton, beberapa instance EC2 tidak disesuaikan dengan benar, tidak ada buku kerja formal untuk pemulihan failover database

**Masalah Risiko Rendah:**

4 item termasuk: Tingkat hit cache CloudFront bisa lebih tinggi dengan TTL yang disetel, beberapa aturan grup keamanan lebih luas dari yang diperlukan

**Lensa: Spesialisasi Tinjauan**

Kerangka Arsitektur yang Baik inti bersifat tanpa bias teknologi. AWS juga menerbitkan **Lensa** — ekstensi dari kerangka kerja untuk kasus penggunaan atau industri tertentu:

- **Lensa Serverless:** Pertanyaan tambahan untuk arsitektur berbasis Lambda
- **Lensa SaaS:** Untuk aplikasi SaaS multi-tenant
- **Lensa Pembelajaran Mesin:** Untuk beban kerja pelatihan dan inferensi ML
- **Lensa Keuangan Layanan:** Pertanyaan tentang peraturan dan kepatuhan untuk FinTech
- **Lensa Kesehatan:** Pertimbangan HIPAA

Untuk Nimbus, Lensa SaaS relevan. Ini menambahkan pertanyaan tentang isolasi tenant, otomatisasi onboarding, dan alokasi biaya per tenant — semua area yang sedang dikembangkan secara aktif oleh Nimbus.

**Perbedaan antara Desain yang Baik dan Hanya Bekerja**

"Sistem kami berfungsi," kata Leo setelah tinjauan. "Tapi saya tidak menyadari berapa banyak hal yang telah kami lakukan 'cukup baik' dan melanjutkan."

"Itu normal," kata Priya. "Membangun di bawah tekanan waktu berarti Anda membuat pilihan pragmatis. Tinjauan Arsitektur yang Baik adalah waktu terjadwal untuk meninjau mereka."

"Beberapa kesenjangan ini tampak jelas dalam retrospektif," lanjutnya. "Patch keamanan — saya tahu kami belum mengotomatiskan itu. Saya hanya tidak pernah memprioritaskannya."

"Karena 'itu berfungsi' dan 'itu terstruktur dengan baik' terasa sama dalam kehidupan sehari-hari," kata Maya. "Perbedaannya hanya terlihat ketika sesuatu yang salah terjadi."

Ini adalah salah satu hal terpenting yang dipahami oleh seorang insinyur senior: tidak adanya insiden tidak berarti tidak adanya risiko. Ini berarti risiko belum memicu.

**Infrastruktur sebagai Kode: Pengaktif Keunggulan Operasional**

Satu tema di seluruh banyak pilar: **Infrastruktur sebagai Kode (IaC)**.

Jika infrastruktur Anda dikonfigurasi secara manual melalui konsol, maka:

- Mereproduksinya dalam skenario DR lambat dan rawan kesalahan
- Audit perubahan tidak mungkin (siapa yang mengubah apa, dan kapan?)
- Membatalkan perubahan buruk memerlukan pembalikan manual
- Konsistensi antar lingkungan (dev/staging/production) membutuhkan disiplin

**AWS CloudFormation** memungkinkan Anda mendefinisikan infrastruktur dalam templat YAML/JSON. **AWS CDK (Cloud Development Kit)** memungkinkan Anda mendefinisikan infrastruktur menggunakan bahasa pemrograman (Python, TypeScript, Java). **Terraform** adalah alternatif pihak ketiga populer.

Nimbus telah secara bertahap beralih ke IaC menggunakan Terraform. Pada saat tinjauan Arsitektur yang Baik, sekitar 60% dari infrastruktur mereka didefinisikan dalam kode. Tinjauan tersebut merekomendasikan untuk mencapai 100%.

"Mengapa 40% yang tersisa?" tanya Leo.

"40% yang tersisa adalah tempat infrastruktur kritis kami berada," kata Priya. "Jika kami tidak dapat mereproduksinya dari kode, kami tidak dapat pulih dari bencana regional dengan andal."

## Kekuatan dan Batasan

**Apa yang dilakukan Kerangka Kerja Arsitektur yang Baik dengan baik:** Ini memberi tim kosakata bersama untuk membahas trade-off arsitektur — bahasa yang bertahan melalui perubahan personel dan percakapan vendor. Menjalankan Tinjauan Arsitektur yang Baik memaksa pengakuan eksplisit tentang risiko yang tidak terlihat jika tidak — "Ya, kami tahu kami memiliki titik kegagalan tunggal di sini; kami menerima trade-off itu karena biaya menghilangkan itu melebihi biaya yang diharapkan dari kegagalan tersebut." Itu adalah output dari tinjauan yang baik.

**Apa yang Tidak Bisa Dilakukan**: Kerangka Kerja ini bersifat deskriptif, bukan preskriptif. Ia menjelaskan properti dari sistem yang terarahkan dengan baik — ia tidak memberi tahu Anda cara membangunnya. Memeriksa setiap kotak dalam Tinjauan Arsitektur yang Terarahkan dengan Baik tidak menjamin arsitektur yang baik. Sistem dapat sangat tersedia, operasional sangat baik, dioptimalkan biaya, dan tetap memecahkan masalah yang salah. Kerangka Kerja ini adalah lensa, bukan cetak biru. Gunakan untuk mengungkap pertanyaan yang tepat, bukan untuk menjawabnya.

## Ringkasan

- **Kerangka Kerja Arsitektur AWS** memiliki enam pilar: Keunggulan Operasional, Keamanan, Keandalan, Efisiensi Kinerja, Optimasi Biaya, dan Keberlanjutan.
- Setiap pilar memiliki prinsip desain dan praktik terbaik yang dievaluasi melalui serangkaian pertanyaan terstruktur.
- **Alat Arsitektur AWS** (gratis di konsol AWS) memandu tinjauan dan menghasilkan laporan.
- Keluaran adalah daftar prioritas peningkatan arsitektur yang dikategorikan berdasarkan risiko.
- **Lensa** mengkhususkan kerangka kerja untuk domain tertentu (serverless, SaaS, perawatan kesehatan, ML).
- **Infrastruktur sebagai Kode** adalah pendorong silang pilar — direkomendasikan oleh pilar Keunggulan Operasional, Keamanan, dan Keandalan.
- Tinjauan Arsitektur yang Terarahkan dengan Baik bukanlah tes lulus/gagal. Ini adalah percakapan peningkatan terstruktur.

## Tips Ujian

*Domain SAA-C03: Lintas Domain — semua domain*

- **Ketahui semua enam pilar dan fokus utamanya**. Ujian akan menggambarkan skenario (misalnya, “tim ingin memastikan sistem mereka dapat pulih dari kegagalan zona ketersediaan”) dan meminta pilar mana yang termasuk di dalamnya (Keandalan).
- **Pemetaan Pilar**:
  - “Menerapkan perubahan secara andal, belajar dari kegagalan, memantau” → Keunggulan Operasional
  - “IAM, enkripsi, kontrol jaringan, deteksi ancaman” → Keamanan
  - “HA, pemulihan, penskalaan, DR” → Keandalan
  - “Menyesuaikan ukuran, CDN, pemilihan teknologi yang tepat” → Efisiensi Kinerja
  - “Model harga, sumber daya yang tidak terpakai, visibilitas biaya” → Optimasi Biaya
  - “Efisiensi energi, pemanfaatan sumber daya, siklus hidup data” → Keberlanjutan
- **Infrastruktur sebagai Kode**: Direkomendasikan oleh kerangka kerja untuk kemampuan berulang, kemampuan audit, dan pemulihan. CloudFormation, CDK, dan SAM adalah alat IaC asli AWS.
- **Alat Arsitektur AWS**: Alat konsol AWS yang memandu proses tinjauan. Gratis untuk digunakan. Menghasilkan rencana peningkatan.
- **AWS Trusted Advisor**: Mirip dengan Kerangka Kerja Arsitektur AWS tetapi otomatis — memindai akun Anda dan memberikan rekomendasi di seluruh biaya, kinerja, keamanan, dan toleransi kesalahan. Tumpang tindihnya nyata: Trusted Advisor mengotomatiskan beberapa hal yang dievaluasi secara manual oleh kerangka kerja.

## Latihan

**Latihan 1 — Ingat Kembali**

Sebutkan enam pilar dari Kerangka Kerja Arsitektur AWS yang Terarahkan dengan Baik dan jelaskan perhatian utama masing-masing dalam satu kalimat.

*(Cobalah untuk melakukan ini dari memori. Jika Anda kesulitan, itu informasi yang berguna tentang pilar mana yang membutuhkan lebih banyak perhatian.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Tim teknik sedang mempersiapkan tinjauan Arsitektur yang Terarahkan dengan Baik. Aplikasi mereka berjalan di EC2 dengan RDS Multi-AZ. Baru-baru ini, mereka menemukan bahwa:

- Proses penerapan mereka terkadang meninggalkan instance EC2 dengan versi pustaka yang berbeda (drift konfigurasi)
- Mereka tidak memiliki peringatan otomatis saat pemindahan RDS diaktifkan
- Pengguna IAM mereka semua memiliki AdministratorAccess
- Mereka belum menguji proses pemulihan cadangan mereka selama 14 bulan

Petakan setiap masalah ke PILAR TERRELEVANT PALING TINGGI.

A) Drift konfigurasi: Keunggulan Operasional; Tidak ada peringatan pemindahan RDS: Keandalan; AdministratorAccess: Keamanan; Tidak ada pengujian pemulihan cadangan: Keandalan

B) Drift konfigurasi: Keamanan; Tidak ada peringatan pemindahan RDS: Efisiensi Kinerja; AdministratorAccess: Keunggulan Operasional; Tidak ada pengujian pemulihan cadangan: Optimasi Biaya

C) Drift konfigurasi: Keandalan; Tidak ada peringatan pemindahan RDS: Efisiensi Kinerja; AdministratorAccess: Keamanan; Tidak ada pengujian pemulihan cadangan: Keunggulan Operasional

D) Drift konfigurasi: Keamanan; Tidak ada peringatan pemindahan RDS: Keandalan; AdministratorAccess: Optimasi Biaya; Tidak ada pengujian pemulihan cadangan: Keamanan

**Petunjuk 1**: “Drift konfigurasi” dalam proses penerapan → pilar mana yang mencakup praktik penerapan?

**Petunjuk 2**: “AdministratorAccess” untuk semua pengguna → pilar mana yang mencakup kontrol akses?

**Petunjuk 3**: “Pengujian pemulihan cadangan tidak diuji” → pilar mana yang mencakup pengujian mekanisme pemulihan Anda?

**Jawaban**: A

**Penjelasan**: Drift konfigurasi dalam penerapan (lingkungan yang tidak konsisten) adalah masalah Keunggulan Operasional — ini tentang praktik penerapan yang andal dan konsisten. Tidak ada peringatan pada pemindahan RDS berarti Anda tidak tahu kapan mekanisme HA diaktifkan — masalah Keandalan (mengetahui kesehatan sistem Anda). AdministratorAccess untuk semua pengguna melanggar prinsip hak istimewa paling sedikit — masalah Keamanan. Pengujian pemulihan cadangan yang tidak diuji berarti mekanisme Keandalan (DR) Anda tidak diverifikasi.

**Mengapa Tidak C?** C menempatkan AdministratorAccess dengan tepat di Security, tetapi salah menetapkan drift konfigurasi ke Keandalan (konsistensi penerapan adalah Keunggulan Operasional) dan pemulihan cadangan yang tidak diuji ke Keunggulan Operasional (pengujian pemulihan adalah masalah Keandalan — Anda memverifikasi bahwa sistem Anda dapat pulih, bukan bahwa proses Anda konsisten).

**Mengapa Tidak D?** D menugaskan AdministratorAccess ke Optimalisasi Biaya (izin yang terlalu luas tidak ada hubungannya dengan biaya) dan pemulihan cadangan yang tidak diuji ke Security (tidak dapat memulihkan cadangan adalah kegagalan Keandalan, bukan kerentanan keamanan).

*Domain SAA-C03: Lintas-Domain*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Lakukan tinjauan Well-Architected mini pada aplikasi yang Anda kenal atau sedang dibangun. Untuk setiap dari enam pilar, catat:

- Satu hal yang dilakukan aplikasi dengan baik
- Satu hal yang dapat ditingkatkan dari aplikasi

Kemudian urutkan item peningkatan Anda berdasarkan risiko (apa yang paling mungkin menyebabkan insiden atau pemborosan?) dan prioritas (apa yang akan memiliki dampak terbesar jika diperbaiki?).

*(Latihan ini lebih berharga daripada yang terlihat. Praktik mengevaluasi arsitektur secara sistematis dari berbagai sudut pandang adalah keterampilan insinyur senior inti.)*

## Adegan Pasca-Kredit

Tiga minggu setelah tinjauan Well-Architected, tim telah menerapkan tiga perbaikan risiko tinggi.

Patching EC2 sekarang diotomatiskan melalui AWS Systems Manager Patch Manager. Dokumen proses respons insiden ada (tidak sempurna, tetapi ditulis dan dibagikan). Rencana standby hangat multi-region telah dirancang dan dijadwalkan untuk diimplementasikan pada kuartal berikutnya.

Priya meninjau laporan Alat Well-Architected. Jumlah risiko tinggi: 0. Risiko sedang: 3. Risiko rendah: 4.

"Kami berada dalam kondisi yang lebih baik daripada sebelumnya," katanya.

"Apakah itu bagus?" Leo bertanya.

"Itu adalah kemajuan," katanya. "Anda tidak menyelesaikan tinjauan Well-Architected. Anda membuat kemajuan, lalu Anda meninjau lagi dalam enam bulan."

Maya telah memikirkan sesuatu.

"Kami telah mempelajari layanan AWS individu selama 31 bab. Dan sekarang kami mulai melihat keseluruhan sistem. Inilah cara para arsitek berpikir."

"Kami telah berpikir seperti arsitek selama ini," kata Leo.

"Kami telah membuat keputusan arsitektur," kata Maya. "Itu berbeda. Berpikir seperti seorang arsitek berarti Anda mengevaluasi keputusan *sebelum* membuat keputusan, bukan setelah."

"Apa bedanya?" Tom bertanya.

"Di bab berikutnya," katanya, "kita akan mencoba menjawab itu."

Di bab berikutnya: apa tampilan tinjauan arsitektur yang sebenarnya, dari prinsip-prinsip dasar.
