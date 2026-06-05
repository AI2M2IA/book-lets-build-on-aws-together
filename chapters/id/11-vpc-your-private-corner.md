# Bab 11: Sudut Pribadi Anda di Awan

Priya memiliki selembar kertas dengan gambar di atasnya.

Gambar itu tidak rumit. Sebuah persegi panjang, berlabel “AWS.” Di dalam persegi panjang, sebuah kelompok kotak: instans EC2, database RDS, klaster ElastiCache. Garis-garis yang menghubungkan semuanya ke semuanya. Dan di luar persegi panjang, sebuah label tunggal: “Internet.”

Dia meletakkannya di tengah meja.

“Ini yang kita miliki,” katanya. “Database kita memiliki alamat IP publik. Lapisan cache kita dapat dijangkau dari internet. Instans EC2 kita semuanya berada di jaringan datar yang sama.”

“Kedengarannya baik,” kata Leo. “Kita memiliki grup keamanan.”

“Grup keamanan yang Anda konfigurasi,” kata Priya. “Di malam hari. Selama pengaturan awal.”

Leo tidak mengatakan apa-apa.

“Saya tidak mengkritik konfigurasi,” katanya. “Saya mengatakan bahwa ketika semuanya hidup di jaringan publik datar, satu kesalahan konfigurasi adalah perbedaan antara sistem yang berfungsi dan satu yang dapat diakses oleh semua orang di internet.”

Dia mengambil pena merah dan menggambar lingkaran di sekitar database.

“Ini seharusnya tidak dapat dijangkau dari internet. Sama sekali. Tidak melalui aturan grup keamanan, tidak melalui konfigurasi yang diperkuat. Ini seharusnya tidak dapat dijangkau secara struktural.”

“Kita perlu berbicara tentang arsitektur jaringan,” kata Maya.

“Kita perlu membicarakannya tiga bulan lalu,” kata Priya. “Tapi sekarang tidak apa-apa.”

Tim berkumpul di sekitar papan tulis untuk pertama kalinya dalam beberapa minggu.

**Masalah dengan Tempat Parkir Terbuka**

Bayangkan sebuah garasi publik yang sangat besar. Sepuluh ribu mobil. Mobil apa pun dapat parkir di mana saja. Tidak ada penghalang antara zona, tidak ada gerbang, tidak ada bagian yang dipesan.

Ini adalah jaringan terbuka. Setiap layanan dapat menjangkau setiap layanan lainnya. Server web Anda dapat berbicara dengan database Anda. Database Anda dapat menjangkau internet. Lapisan caching Anda dapat menerima koneksi dari mana saja.

Ketika semuanya dapat berbicara dengan semuanya, satu kompromi memengaruhi semuanya.

“Jadi, jika seseorang meretas garasi parkir,” kata Tom, “mereka dapat berjalan ke mobil apa pun.”

“Dan dari mobil mana pun, berkendara ke mana saja,” konfirmasi Priya. “Kita menginginkan pagar. Kita menginginkan gerbang terkunci. Kita menginginkan zona.”

VPC adalah cara Anda membangun zona-zona ini di AWS.

**Apa Itu VPC?**

**Virtual Private Cloud (VPC)** adalah bagian jaringan yang terisolasi secara logis dari awan AWS—jaringan pribadi yang Anda definisikan yang hanya dapat diakses oleh sumber daya Anda secara default.

Anggap saja sebagai lahan pribadi yang berpagar di dalam garasi publik yang sangat besar. Lahan Anda memiliki aturan sendiri: siapa yang dapat masuk, siapa yang dapat keluar, rute apa yang ada antara bagian-bagian.

Saat Anda membuat VPC, Anda mendefinisikan:

**Blok CIDR:** Rentang alamat IP yang tersedia di dalam jaringan Anda. Misalnya, `10.0.0.0/16` memberi Anda 65.536 alamat IP yang mungkin (10.0.0.0 hingga 10.0.255.255).

**Subnet:** Pembagian subnet Anda, masing-masing diberi bagian dari rentang alamat IP Anda dan terkait dengan Zona Ketersediaan tertentu.

**Tabel rute:** Aturan yang menentukan ke mana lalu lintas jaringan pergi.

**Internet Gateway:** Koneksi antara VPC Anda dan internet publik.

**Subnet: Publik vs. Privat**

Tidak semua sumber daya harus dapat diakses secara publik.

Server web Anda perlu menerima lalu lintas dari internet—browser pengguna perlu menjangkau itu.

Database Anda seharusnya *tidak pernah* menerima lalu lintas dari internet—hanya server web Anda yang seharusnya dapat berbicara dengannya.

Di sinilah subnet berperan.

**Subnet publik** terhubung ke Internet Gateway dan dapat memiliki sumber daya dengan alamat IP publik. Lalu lintas dapat mengalir ke dan dari internet.

**Subnet privat** tidak memiliki koneksi internet langsung. Sumber daya di subnet privat hanya dapat berkomunikasi dengan sumber daya lain di VPC Anda (kecuali Anda menyiapkan rute keluar yang spesifik). Mereka tidak memiliki alamat IP publik.

Untuk Nimbus, desainnya menjadi jelas:

```
Internet
    |
Internet Gateway
    |
Public Subnet (AZ-a)     Public Subnet (AZ-b)
  [Load Balancer]          [Load Balancer]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [EC2 Instances]           [EC2 Instances]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [RDS Primary]             [RDS Standby]
  [ElastiCache]             [ElastiCache]
```

```markdown
## Load Balancer adalah public-facing — ia perlu menerima lalu lintas dari internet. Instans EC2 bersifat private — mereka hanya menerima lalu lintas dari load balancer. Database bersifat private — mereka hanya menerima lalu lintas dari instans EC2.

"Jadi, untuk mencapai database," kata Tom, "seseorang harus melewati load balancer, lalu melewati instans EC2, lalu melewati grup keamanan database?"

"Tiga lapisan," konfirmasi Priya. "Pertahanan berlapis."

**Gateway NAT: Subnet Privat yang Tetap Dapat Mengunduh Hal-Hal**

Subnet privat tidak dapat menjangkau internet. Tetapi kadang-kadang, mereka perlu. Instans EC2 Anda perlu mengunduh pembaruan perangkat lunak. Aplikasi Anda perlu memanggil API eksternal.

Di sinilah **Gateway NAT** (Terjemahan Alamat Jaringan) masuk.

Gateway NAT berada di subnet publik. Sumber daya di subnet privat dapat mengirim lalu lintas keluar ke Gateway NAT, yang kemudian meneruskannya ke internet—tetapi internet tidak dapat memulai koneksi kembali.

Ini seperti pintu putar satu arah. Anda dapat keluar. Tidak ada orang di luar yang dapat masuk.

"Berapa biaya Gateway NAT?" tanya Tom.

Pertanyaan itu tidak mengejutkan siapa pun.

Penetapan harga Gateway NAT memiliki dua komponen: biaya jam untuk setiap Gateway NAT, ditambah biaya pemrosesan data per GB. Ini dapat bertambah tidak terduga (Bab 30 membahas ini secara rinci). Untuk saat ini: jangan gunakan lebih banyak Gateway NAT daripada yang Anda butuhkan, dan sadari bahwa volume data keluar yang besar akan muncul di tagihan Anda.

**Tabel Rute: Bagaimana Lalu Lintas Menemukan Jalannya**

Setiap subnet memiliki **tabel rute** yang memberi tahu lalu lintas ke mana harus pergi.

Tabel rute subnet publik tipikal terlihat seperti ini:

| Tujuan | Target                      |
|-------------|-----------------------------|
| 10.0.0.0/16 | local                       |
| 0.0.0.0/0   | igw-xxxx (Internet Gateway) |

Aturan pertama: lalu lintas ke alamat IP mana pun dalam rentang VPC Anda tetap lokal. Aturan kedua: semua lalu lintas lainnya (`0.0.0.0/0` berarti "semua") menuju Internet Gateway.

Tabel rute subnet privat:

| Tujuan | Target                 |
|-------------|------------------------|
| 10.0.0.0/16 | local                  |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway) |

Lalu lintas subnet privat tetap lokal atau keluar melalui Gateway NAT. Tidak ada rute langsung ke Internet Gateway.

**Grup Keamanan vs NACL (Pratinjau)**

Di dalam VPC, Anda memiliki dua alat untuk mengontrol lalu lintas pada tingkat sumber daya:

**Grup Keamanan** (Bab 15 membahas ini secara mendalam) bertindak sebagai firewall virtual untuk sumber daya individu—instans EC2, instans RDS, load balancer. Mereka *berstatus*: jika lalu lintas diizinkan masuk, lalu lintas respons yang diizinkan secara otomatis keluar.

**NACL (NACL)** beroperasi pada tingkat subnet dan bersifat *tidak berstatus*: Anda harus mengizinkan lalu lintas masuk dan keluar secara terpisah.

Untuk sebagian besar kasus penggunaan, Grup Keamanan sudah cukup. NACL menambahkan lapisan tambahan saat Anda membutuhkan kontrol tingkat subnet—misalnya, memblokir rentang IP tertentu agar tidak pernah mencapai subnet.

"Grup keamanan pada tingkat instans," tulis Leo di papan tulis. "NACL pada tingkat subnet."

"Dan jangan pernah meninggalkan port 22 terbuka ke 0.0.0.0/0," tambah Priya, menatap Leo.

"Itu satu kali," kata Leo.

"Ini selalu tepat satu kali," kata Priya, "sampai tidak."

**Penyandingan VPC: Menghubungkan Jaringan Privat**

Apa yang terjadi jika Nimbus tumbuh menjadi beberapa VPC? (Ini terjadi. Tim menjadi besar. Layanan diisolasi ke akun terpisah.)

**Penyandingan VPC** memungkinkan dua VPC berkomunikasi secara pribadi seolah-olah mereka berada di jaringan yang sama. Lalu lintas tidak meninggalkan jaringan pribadi AWS.

Pembatasan penting:

- Penyandingan VPC tidak transitif. Jika VPC A dipasangkan dengan VPC B, dan VPC B dipasangkan dengan VPC C, A dan C tidak dapat berkomunikasi—kecuali Anda menambahkan pasangan A-C langsung.
- Blok CIDR tidak boleh tumpang tindih antara VPC yang dipasangkan.

Untuk arsitektur yang lebih besar dengan banyak VPC, **AWS Transit Gateway** (Bab 25) menangani perutean transit tanpa memerlukan mesh perhubungan penyandingan penuh.

## Kekuatan dan Batasan

**Mengapa desain VPC penting:**

- Isolasi jaringan adalah pertahanan berlapis—melanggar satu lapisan tidak berarti mengkompromikan semuanya
- Subnet privat secara signifikan mengurangi permukaan serangan
- Tabel rute dan grup keamanan memberikan kontrol yang tepat atas aliran lalu lintas
- VPC terintegrasi dengan setiap layanan jaringan AWS (Direct Connect, VPN, Transit Gateway)

**Di mana itu menjadi rumit:**

- Desain VPC membutuhkan perencanaan di muka—blok CIDR sulit diubah nanti
- Terlalu banyak VPC kecil menciptakan kompleksitas penyandingan (masalah n-squared)
- Men-debug masalah jaringan di VPC membutuhkan pemahaman tentang tabel rute, grup keamanan, NACL, dan asosiasi subnet secara bersamaan
- Biaya Gateway NAT dapat mengejutkan Anda pada skala (biaya pemrosesan per GB)

## Ringkasan
```

- Sebuah **VPC** adalah jaringan pribadi yang terisolasi secara logis di AWS — area terpagar Anda di dalam cloud publik.
- **Subnet** membagi VPC Anda berdasarkan Zona Ketersediaan. Subnet publik terhubung ke Internet Gateway; subnet pribadi tidak.
- Tempatkan sumber daya yang menghadap internet (load balancer) di subnet publik. Tempatkan semuanya yang lain (EC2, database, cache) di subnet pribadi.
- **Tabel rute** mengontrol di mana lalu lintas mengalir. Setiap subnet memiliki satu.
- **NAT Gateway** (di subnet publik) memungkinkan sumber daya pribadi untuk memulai koneksi internet keluar tanpa menerima koneksi masuk.
- **VPC Peering** menghubungkan dua VPC secara pribadi. Tidak transitif — untuk konektivitas skala besar, gunakan Transit Gateway.
- **Grup keamanan** melindungi sumber daya individu (keadaan sadar). **ACL Subnet** melindungi seluruh subnet (tidak sadar).

## Tips Ujian

*Domain SAA-C03: Desain Arsitektur Aman (Domain 1, Tugas 1.2)*

- **Publik vs subnet pribadi**: perbedaannya adalah tabel rute. Subnet publik memiliki rute ke Internet Gateway. Subnet pribadi tidak.
- **Penempatan NAT Gateway**: selalu di *subnet publik*. Sumber daya subnet pribadi merutekan lalu lintas keluar ke dalamnya.
- **Ketersediaan Tinggi untuk NAT**: buat NAT Gateway per AZ. Jika Anda memiliki satu NAT Gateway di AZ-a dan AZ-b instance merutekan melalui itu, kegagalan AZ-a akan menjatuhkan akses internet AZ-b juga.
- **VPC Peering tidak transitif**: ujian akan menggambarkan tiga VPC dan meminta apakah mereka dapat berkomunikasi melalui yang tengah — jawabannya adalah tidak tanpa peering langsung atau Transit Gateway.
- **Tumpang tindih CIDR**: VPC yang di-peering tidak dapat memiliki blok CIDR yang tumpang tindih. Jebakan ujian klasik.
- **Host Bastion (kotak lompat)**: untuk SSH ke instance EC2 pribadi, Anda memerlukan host bastion di subnet publik. Bastion adalah satu-satunya mesin dengan IP publik; instance pribadi hanya menerima SSH dari grup keamanan bastion.
- **Titik Akhir VPC**: memungkinkan sumber daya pribadi untuk menjangkau layanan AWS (S3, DynamoDB) tanpa melalui NAT Gateway. Dua jenis: **Titik Akhir Gerbang** (S3, DynamoDB — gratis) dan **Titik Akhir Antarmuka** (layanan lain — harga per jam ditambah data).

## Latihan

**Latihan 1 — Ingat**

Jelaskan mengapa database harus berada di subnet pribadi. Ancaman spesifik apa yang ini mitigasi?

*(Petunjuk: Apa yang dapat dilakukan seseorang terhadap database yang berada di internet publik yang tidak dapat mereka lakukan terhadap satu yang hanya dapat diakses dari dalam VPC?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan sedang merancang aplikasi web multi-tier di AWS. Tier web (ALB + EC2) harus menerima lalu lintas internet. Tier aplikasi (EC2) harus hanya menerima lalu lintas dari tier web. Tier database (RDS) harus hanya menerima lalu lintas dari tier aplikasi. Instance tier aplikasi EC2 perlu mengunduh paket perangkat lunak dari internet. Solusi harus tersedia tinggi.

Arsitektur mana yang TERBAIK memenuhi persyaratan ini?

A) Semua tier di subnet publik; grup keamanan membatasi lalu lintas antar tier
B) Tier web di subnet publik; tier aplikasi dan database di subnet pribadi; satu NAT Gateway di subnet publik
C) Tier web di subnet publik; tier aplikasi dan database di subnet pribadi; satu NAT Gateway per AZ
D) Semua tier di subnet pribadi; Internet Gateway menyediakan akses internet dua arah ke semua tier

*Petunjuk 1*: "Tersedia tinggi" berarti tidak ada satu pun titik kegagalan. Pilihan mana yang memperkenalkan NAT Gateway sebagai satu titik kegagalan?

*Petunjuk 2*: Jika AZ NAT Gateway gagal, instance mana yang kehilangan akses internet?

*Petunjuk 3*: Baca persyaratan dengan cermat — tier aplikasi membutuhkan akses internet *keluar*, bukan masuk.

**Jawaban**: C

**Penjelasan**: Tier web di subnet publik menyediakan akses internet-menghadap melalui ALB. Tier aplikasi dan database di subnet pribadi memastikan mereka tidak dapat dijangkau langsung dari internet. Satu NAT Gateway per AZ (satu di setiap subnet publik) menyediakan akses internet keluar yang tersedia tinggi untuk instance subnet pribadi — jika satu AZ gagal, AZ lainnya's NAT Gateway terus melayani lalu lintas.

**Mengapa bukan A?** Subnet publik untuk semua tier mengekspos aplikasi dan database secara langsung ke internet, menghancurkan tujuan model keamanan bertingkat.

**Mengapa bukan B?** Satu NAT Gateway di satu AZ adalah satu titik kegagalan. Jika kegagalan AZ's NAT Gateway, semua instance pribadi kehilangan akses internet keluar.

**Mengapa bukan D?** Internet Gateway menyediakan konektivitas dua arah — subnet pribadi dengan rute ke Internet Gateway secara efektif adalah subnet publik.

*Domain SAA-C03: Desain Arsitektur Aman — Tugas 1.2*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus berkembang. Tim rekayasa ingin memisahkan layanan "menu" ke dalam akun sendiri dengan VPC sendiri, sambil menjaga aplikasi Nimbus utama di akun dan VPC terpisah.

Bagaimana cara Anda menghubungkan dua VPC ini sehingga aplikasi utama dapat menanyakan layanan menu? Apa batasan yang perlu Anda rencanakan? Apa yang akan Anda gunakan jika Nimbus memiliki sepuluh VPC mikroservice terpisah yang semuanya perlu berkomunikasi?

*(Tidak ada jawaban yang benar tunggal. Tujuannya adalah untuk mempraktikkan desain jaringan multi-VPC.)*

## Adegan Pasca Kredit

Priya mendesain ulang jaringan.

Tiga hari kemudian, setiap sumber daya berada di tempat yang tepat. Instans EC2 berada di subnet privat, load balancer berada di subnet publik, dan RDS serta ElastiCache hanya dapat diakses dari lapisan aplikasi. Grup keamanan memiliki port minimum yang diperlukan.

Leo telah mencoba SSH langsung ke database untuk memeriksa sesuatu. Ia tidak bisa. Koneksi waktu habis.

"Bagus," kata Priya.

"Saya hanya perlu memeriksa satu hal," kata Leo.

"Apa?"

"Apakah indeks telah diatur dengan benar?"

Priya membuka laptopnya. "Saya dapat memeriksanya dari host bastion, melalui instansi aplikasi, yang memiliki kredensial database yang benar di Secrets Manager."

"Itu empat lompatan."

"Itu benar." Dia mengetik sesuatu. "Indeks telah diatur. Silakan."

Leo menatap layar sejenak.

"Saya akan belajar ini," katanya.

"Kamu sudah belajar," jawabnya. "Kamu hanya mengeluhkan kontrol keamanan daripada mengeluhkan bahwa mereka tidak ada."

Di bab berikutnya: bagaimana internet menemukan Nimbus — mesin tak terlihat dari nama domain.
