# Babat 25: Jalur Pribadi

Berdiri tegak sejenak. Mengeluarkan tangan Anda.

Kita akan membahas tentang memindahkan data. Bukan antara layanan di AWS, tetapi antara dunia nyata dan AWS—antara kantor Anda dan infrastruktur cloud Anda, antara benua.

Tim infrastruktur Nimbus (sekarang empat insinyur) bekerja dari kantor bersama di Seattle. Mereka membutuhkan akses ke infrastruktur AWS yang mereka kelola. Beberapa operasi memerlukan koneksi ke sumber daya di VPC.

Saat ini, mereka menggunakan VPN pada laptop mereka untuk mengakses host bastion di subnet publik, kemudian SSH ke sumber daya dari sana.

Ini berfungsi. Ini lambat. Koneksi VPN merutekan melalui internet publik: Seattle → serat melintasi negara bagian → lompatan operator ganda → us-east-1. Setiap perjalanan bolak-balik adalah 80+ milidetik.

"Untuk SSH sehari-hari, itu dapat diterima," kata Leo. "Tetapi kita akan segera memulai pemindahan database analitik kami. 4 terabyte data pesanan historis. Melalui koneksi ini, migrasi akan memakan minggu."

"Kita membutuhkan koneksi yang lebih baik," kata Maya.

"Koneksi pribadi," tambah Priya. "Tidak melalui internet publik."

Bayangkan seperti bepergian ke tempat kerja. VPN Site-to-Site seperti mengemudi di jalan raya umum: Anda mengunci pintu mobil Anda (enkripsi), tetapi Anda masih berbagi jalur dengan semua orang, dan kemacetan lalu lintas memperlambat Anda secara tidak terduga. Direct Connect seperti menyewa jalur pribadi khusus di jalan raya—tanpa lalu lintas bersama, kecepatan yang konsisten, dan biaya bulanan yang lebih tinggi. Sebagian besar hari, jalan raya publik baik-baik saja. Ketika Anda memindahkan truk penuh muatan barang berharga sesuai jadwal, Anda membayar jalur pribadi.

**AWS Site-to-Site VPN: Pilihan Cepat**

**AWS Site-to-Site VPN** membuat terowongan terenkripsi antara jaringan on-premises Anda dan VPC Anda, melintasi internet publik.

Pengaturan:

1. Buat Gateway Virtual Pribadi (VGW) yang terpasang ke VPC Anda
2. Buat Customer Gateway yang mewakili router on-premises Anda
3. Tetapkan dua terowongan VPN (untuk redundansi) di antara mereka

Lalu lintas dienkripsi (AES-256). Ini melakukan perjalanan melalui internet publik, yang berarti latensi bergantung pada kondisi internet. AWS menyediakan dua terowongan secara otomatis untuk redundansi—jika satu terowongan mengalami masalah, lalu lintas beralih ke yang lain.

**Kapan menggunakan Site-to-Site VPN:**

- Pengaturan cepat (menit hingga jam)
- Biaya efektif ($0.05/jam per koneksi VPN)
- Bandwidth: hingga 1.25 Gbps per terowongan
- Latensi internet yang dapat diterima untuk kasus penggunaan

Untuk migrasi 4TB Nimbus, bandwidth berbasis internet pada 1.25 Gbps akan memakan waktu: 4TB / 1.25 Gbps ≈ 7 jam minimum, dengan overhead dunia nyata mendekati 12-20 jam. Dapat diterima, tetapi kemacetan lalu lintas di jalur internet publik membuatnya tidak dapat diprediksi.

"Apa opsi lainnya?" tanya Tom.

**AWS Direct Connect: Garis Khusus**

**AWS Direct Connect** membangun koneksi jaringan pribadi khusus antara lokasi Anda (atau fasilitas colocation Anda) dan AWS. Lalu lintas tidak pernah menyentuh internet publik.

Direct Connect adalah koneksi fisik—garis serat dari jaringan Anda ke lokasi Direct Connect AWS. Anda bekerja dengan penyedia layanan komunikasi untuk membangun sirkuit fisik. AWS menyediakan port di sisi mereka.

**Manfaat:**

- Latensi yang konsisten dan dapat diprediksi (tanpa variasi internet publik)
- Kecepatan dari 50 Mbps hingga 100 Gbps
- Biaya transfer data yang lebih rendah daripada internet (tarif transfer data Direct Connect lebih murah daripada tarif transfer data keluar AWS standar)
- Lebih aman (sirkuit pribadi, bukan internet publik)

**Kompromi:**

- Pengaturan membutuhkan minggu hingga bulan (penyediaan infrastruktur fisik)
- Biaya yang jauh lebih tinggi daripada VPN ($0.025-0.30/jam per port, ditambah biaya sirkuit telekomunikasi—seringkali $500-1000+/bulan minimum)
- Tidak ada redundansi bawaan (Anda menetapkan sirkuit redundan sendiri)
- Tidak cocok untuk kantor yang didistribusikan secara geografis tanpa beberapa sirkuit

Untuk Nimbus: Direct Connect berlebihan untuk ukuran mereka saat ini. Tetapi untuk perusahaan dengan volume transfer data yang signifikan atau persyaratan kepatuhan untuk koneksi jaringan pribadi, Direct Connect membuahkan hasil.

**Koneksi yang Dihosting: Titik Tengah**

Tidak semua organisasi dapat berkomitmen untuk sirkuit serat khusus 100 Gbps. **Direct Connect yang Dihosting** memungkinkan Mitra Direct Connect AWS (telekomunikasi yang disetujui) untuk menyediakan koneksi di bawah 1Gbps yang Anda bagikan dengan pelanggan lain.

Pengaturan lebih cepat (hari hingga minggu, bukan bulan) dan lebih murah daripada koneksi khusus. Komprominya: kapasitas bersama berarti throughput yang kurang konsisten.

Untuk Nimbus (saat mereka tumbuh): koneksi yang di-host 500 Mbps melalui mitra akan memberikan konektivitas pribadi dengan titik harga yang wajar.

**AWS Transit Gateway: Hub-and-Spoke untuk VPC**

Saat Nimbus tumbuh, mereka akan mengakumulasi beberapa VPC: VPC produksi, VPC staging, VPC analitik, VPC alat keamanan.

Tanpa perencanaan yang cermat, menghubungkan VPC ini memerlukan mesh peering VPC penuh. Untuk 4 VPC: 6 koneksi peering. Untuk 10 VPC: 45 koneksi peering. Untuk 20 VPC: 190 koneksi. Ini tidak dapat diskalakan.

**Transit Gateway AWS** adalah pusat jaringan yang menghubungkan beberapa VPC (Virtual Private Cloud) dan jaringan on-premises. Alih-alih jaringan mesh dengan koneksi peering, setiap VPC terhubung ke Transit Gateway. Transit Gateway merutekan lalu lintas di antara VPC tersebut.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

```markdown
**Routing Transitif**: Jika VPC A dan VPC B keduanya terhubung ke Transit Gateway, mereka dapat berkomunikasi – tanpa peer langsung. Transit Gateway menangani perutean. Tidak seperti VPC peering (yang tidak transitif), Transit Gateway memungkinkan topologi hub-and-spoke.

**Biaya Transit Gateway**: Dikenakan per lampiran (VPC atau VPN/Direct Connect) ditambah per GB data yang diproses. Pada skala besar, ini sepadan dengan kesederhanaannya.

**VPC Endpoints: Akses Pribadi ke Layanan AWS**

Masalah biaya dan keamanan yang halus: Ketika instance EC2 Anda (di subnet pribadi) memanggil API S3, lalu lintas tersebut melewati NAT Gateway (untuk mencapai internet, tempat endpoint publik S3 berada). Anda membayar untuk pemrosesan NAT Gateway.

**VPC Endpoints** memungkinkan sumber daya di VPC Anda untuk berkomunikasi dengan layanan AWS secara pribadi, tanpa melalui internet publik – dan tanpa NAT Gateway.

Ada dua jenis:

**Endpoint Gerbang** (berbayar): Untuk S3 dan DynamoDB. Anda menambahkan rute di tabel rute Anda yang mengarahkan lalu lintas S3 atau DynamoDB ke endpoint daripada NAT Gateway. Gratis untuk dibuat; gratis untuk digunakan.

**Endpoint Antarmuka** (berbayar): Untuk layanan AWS lainnya (SQS, SNS, Secrets Manager, SSM, dll.). Ini membuat ENI (Elastic Network Interface) di subnet Anda dengan alamat IP pribadi. Lalu lintas ke layanan menggunakan alamat IP pribadi ini. Biayanya sekitar $0.01/jam per AZ ditambah pemrosesan data.

Tom segera membuat Endpoint Gerbang untuk S3 dan DynamoDB setelah mempelajari bahwa mereka gratis. Biaya pemrosesan data NAT Gateway turun sebesar 30%.

**AWS Global Accelerator: Perutean di Tepi**

Ketika Nimbus melayani pengguna di West Coast dari us-east-1 (Virginia), latensinya adalah 80ms. Bukan karena server terlalu jauh, tetapi karena perutean internet publik antara Seattle dan Virginia tidak optimal, memantul melalui beberapa jaringan operator.

**AWS Global Accelerator** menggunakan jaringan backbone pribadi AWS (infrastruktur yang sama yang menggerakkan CloudFront) untuk merutekan lalu lintas antara pengguna dan aplikasi AWS. Alih-alih perutean internet publik, lalu lintas memasuki jaringan AWS di lokasi tepi terdekat dan melakukan perjalanan melalui jalur pribadi yang dioptimalkan ke aplikasi Anda.

Untuk Nimbus, seorang pengguna di Seattle akan:

- **Tanpa Global Accelerator**: Merutekan melalui operator internet publik → ~80ms
- **Dengan Global Accelerator**: Menghantam tepi AWS terdekat di Seattle → melakukan perjalanan melalui backbone AWS → mencapai us-east-1 → ~45ms

Global Accelerator tidak melakukan caching konten (itu CloudFront). Ini mengoptimalkan jalur jaringan untuk permintaan dinamis.

**Kapan Menggunakan Global Accelerator vs CloudFront**:

- CloudFront: konten statis dan dapat di-cache, kasus penggunaan CDN
- Global Accelerator: konten dinamis, protokol non-HTTP (UDP, gaming, IoT), atau ketika Anda membutuhkan alamat Anycast statis

## Kekuatan dan Batasan

**Site-to-Site VPN**:

- Pengaturan cepat, biaya rendah
- Jalur internet publik berarti latensi bervariasi
- Batas bandwidth terbatas

**Direct Connect**:

- Konsisten, pribadi, bandwidth tinggi
- Lambat untuk diatur, biaya berulang signifikan
- Sirkuit fisik adalah titik kegagalan tunggal (tambahkan redundansi)

**Transit Gateway**:

- Menyederhanakan konektivitas multi-VPC secara dramatis
- Perutean transitif (tidak seperti VPC peering)
- Biaya bertambah untuk banyak lampiran

**VPC Endpoints**:

- Keuntungan keamanan dan biaya untuk S3/DynamoDB (endpoint gerbang gratis)
- Menghilangkan biaya NAT Gateway untuk lalu lintas layanan AWS

**Global Accelerator**:

- Meningkatkan latensi aplikasi dinamis untuk pengguna global
- Alamat Anycast tetap (tidak seperti alamat IP dinamis CloudFront)
- Biaya tambahan ($0.025/jam per accelerator + transfer data)

## Ringkasan

- **Site-to-Site VPN**: Terowongan terenkripsi di atas internet publik antara on-premises dan VPC. Pengaturan cepat, biaya lebih rendah, latensi bervariasi.
- **Direct Connect**: Koneksi serat khusus dan pribadi ke AWS. Latensi yang dapat diprediksi, bandwidth tinggi, minggu untuk diatur, biaya signifikan.
- **Transit Gateway**: Hub untuk konektivitas VPC dan on-premises. Memungkinkan perutean transitif. Menskalakan ke ratusan koneksi.
- **VPC Endpoints**: Akses pribadi ke layanan AWS tanpa NAT Gateway. Endpoint gerbang (S3, DynamoDB) gratis.
- **Global Accelerator**: Merutekan lalu lintas dinamis di atas backbone AWS untuk latensi yang lebih rendah dan lebih konsisten secara global.

## Tips Ujian

*SAA-C03 Domain: Desain Arsitektur Berkinerja Tinggi (Domain 3, Tugas 3.4)*
```

- **Sinyal VPN vs Direct Connect**: VPN = “enkripsi lalu lintas ke VPC,” “pengaturan cepat,” “sensitif biaya.” Direct Connect = “latensi rendah yang konsisten,” “transfer data besar,” “koneksi pribadi,” “kepatuhan yang memerlukan jaringan pribadi.”
- **Transit Gateway vs Peering VPC**: Peering tidak transitif (A→B→C tidak memungkinkan A→C). Transit Gateway bersifat transitif. “Banyak VPC yang perlu berkomunikasi” → Transit Gateway.
- **Titik Akhir Gerbang VPC**: Gratis. S3 dan DynamoDB saja. Perubahan tabel rute. Tidak ada biaya tambahan. Skenario ujian: “mengurangi biaya transfer data untuk akses S3 dari subnet pribadi” → Titik Akhir Gerbang.
- **Global Accelerator vs CloudFront**: Accelerator = konten dinamis, non-HTTP, alamat IP statis, optimasi jaringan. CloudFront = caching, konten HTTP, CDN.
- **Direct Connect + VPN**: Anda dapat menggunakan VPN sebagai cadangan untuk koneksi Direct Connect. Jika sirkuit Direct Connect gagal, lalu lintas gagal di-failover ke VPN. Lebih mahal daripada VPN saja, lebih andal daripada Direct Connect saja.
- **Gerbang Direct Connect**: Hubungkan sirkuit Direct Connect ke beberapa VPC di beberapa wilayah atau akun. Tanpa itu, sirkuit Direct Connect terhubung ke satu Gerbang VGW di satu wilayah.

## Latihan

**Latihan 1 — Ingat Kembali**

Jelaskan perbedaan antara AWS Site-to-Site VPN dan AWS Direct Connect. Dalam skenario apa Anda akan memilih masing-masing?

*(Petunjuk: Pikirkan tentang waktu pengaturan, biaya, konsistensi latensi, dan persyaratan bandwidth.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan jasa keuangan memerlukan koneksi jaringan pribadi, terenkripsi, khusus untuk mereka dari pusat data on-premise mereka ke AWS. Mereka mentransfer 500GB data keuangan sensitif setiap hari. Koneksi harus memiliki latensi yang konsisten dan dapat diprediksi dan tidak melintasi internet publik. Mereka juga membutuhkan koneksi cadangan jika yang utama gagal.

Arsitektur MANA yang TERBAIK memenuhi persyaratan ini?

A) VPN Site-to-Site dengan perutean BGP dan VPN kedua untuk redundansi
B) Koneksi Direct Connect dengan VPN Site-to-Site sebagai cadangan
C) Dua koneksi Site-to-Site VPN melalui penyedia internet yang berbeda
D) Koneksi Direct Connect yang Dihosting dengan Gerbang Direct Connect

**Petunjuk 1**: “Tidak melintasi internet publik” — lalu lintas VPN melewati internet publik (dienkripsi). Hanya Direct Connect yang pribadi.

**Petunjuk 2**: “Latensi yang konsisten dan dapat diprediksi” — kinerja VPN internet publik bervariasi. Direct Connect konsisten.

**Petunjuk 3**: “Koneksi cadangan” — apa pendekatan yang direkomendasikan saat Direct Connect adalah yang utama?

**Jawaban**: B

**Penjelasan**: Direct Connect menyediakan koneksi pribadi dan khusus yang tidak melintasi internet publik — memenuhi persyaratan privasi dan latensi. VPN Site-to-Site sebagai cadangan menyediakan redundansi: jika sirkuit Direct Connect gagal, lalu lintas gagal di-failover ke VPN yang dienkripsi. Ini adalah pola HA standar untuk Direct Connect.

**Mengapa bukan A?** Lalu lintas VPN Site-to-Site melewati internet publik, yang melanggar persyaratan “tidak melintasi internet publik”.

**Mengapa bukan C?** Dua koneksi VPN melalui ISP yang berbeda masih melewati internet publik, bahkan jika dienkripsi. Tidak memenuhi persyaratan jaringan pribadi.

**Mengapa bukan D?** Koneksi yang Dihosting menyediakan koneksi Direct Connect tetapi opsi D tidak menyertakan cadangan. Satu Direct Connect tanpa cadangan adalah titik kegagalan tunggal — serat dapat terputus.

*SAA-C03 Domain: Desain Arsitektur Berkinerja — Tugas 3.4*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang memperluas untuk memiliki tim rekayasa regional di Seattle, Berlin, dan Singapura. Setiap tim regional membutuhkan akses ke:

- VPC produksi (read-only untuk debugging)
- VPC staging (akses penuh untuk pengujian)
- VPC analitik (read-only untuk pelaporan)

Rancang konektivitas jaringan. Apakah Anda akan menggunakan Transit Gateway? Direct Connect di setiap wilayah atau Site-to-Site VPN? Bagaimana Anda menegakkan akses read-only untuk produksi? (Petunjuk: ini adalah pertanyaan jaringan dan IAM.)

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk berlatih desain jaringan multi-wilayah, multi-tim.)*

## Adegan Pasca Kredit

Migrasi data selesai dalam 14 jam.

Tidak melalui jalur internet publik yang lambat — Leo telah menggunakan AWS Snow Family (perangkat penyimpanan fisik yang dikirim dan diterima dari AWS) untuk sebagian besar data, kemudian menyinkronkan delta yang tersisa melalui VPN.

"Lain kali," katanya, "kita harus menyiapkan Direct Connect."

Tom melihat harganya.

"Sebuah port 1Gbps khusus berharga $216/bulan," katanya. "Selain itu, biaya sirkuit dari kantor kami, yang ditawarkan oleh telecom sebesar $800/bulan."

"Jadi sekitar seribu dolar per bulan total."

"Untuk apa yang kami lakukan sekarang, mungkin tidak sepadan. Tetapi jika kami mulai memindahkan lebih dari 10TB per bulan antara kantor kami dan AWS, penghematan biaya transfer data pada Direct Connect akan mengimbangi biaya tersebut."

"Jadi kita pantau volume transfer data," kata Priya, "dan tinjau saat melampaui ambang batas."

"Itu arsitektur yang sadar biaya," kata Tom.

"Itu selalu menjadi poinnya," kata Maya.

Di bab berikutnya: apa yang terjadi ketika Anda memiliki lebih banyak data daripada database apa pun yang dapat secara wajar disimpan, dan Anda perlu membuat arti dari semuanya.
