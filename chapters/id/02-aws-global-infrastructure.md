# Bab 2: Di Mana di Dunia Server Anda Berada?

Berdirilah. Berjalanlah ke jendela jika ada jendela di dekat Anda.

Lihatlah keluar. Apa pun yang Anda lihat — gedung, pohon, tempat parkir, halaman belakang seseorang —
tidak ada dari itu yang merupakan tempat data Anda berada. Data Anda berada di suatu tempat yang sama sekali berbeda. Mungkin
di suatu tempat yang belum pernah Anda kunjungi.

Itu bukan masalah. Tapi memahami *di mana* membuat sejumlah hal mengejutkan menjadi jelas.

Di bab terakhir, Leo membuat akun AWS pada pukul 11 malam dan meluncurkan server di suatu tempat.
Suatu tempat menjadi kata operatif — ia tidak yakin bagian dunia mana yang ia pilih,
karena ia tidak memilihnya dengan sengaja.

Keesokan paginya, Maya menyadari server ada di Singapura.

"Mengapa Singapura?" ia bertanya.

"Itu adalah default," kata Leo.

Tom mendongak dari kopinya. "Berapa biaya menjalankan server di Singapura ketika
semua pelanggan kita ada di Pantai Barat?"

Leo tidak punya jawaban.

Priya sudah punya: "Juga lebih lambat. Setiap permintaan harus berjalan setengah keliling
dunia."

Bab ini tentang memperbaiki keputusan itu — dan memahami mengapa itu penting.

**Masalah Dengan "Di Suatu Tempat"**

Ketika Anda menggunakan AWS, Anda tidak menggunakan satu pusat data. Anda menggunakan jaringan global
dari mereka. AWS memiliki infrastruktur di lusinan negara.

Itu adalah fitur, bukan hanya fakta. Tetapi itu berarti Anda harus membuat pilihan: *di mana*
Anda ingin infrastruktur Anda berjalan?

Pilihan itu penting karena tiga alasan:

**Kinerja.** Semakin dekat server Anda dengan pengguna Anda, semakin cepat responsnya.
Fisika tidak bisa dinegosiasikan. Data bergerak pada sekitar dua pertiga kecepatan cahaya
melalui kabel serat optik. Permintaan dari Seattle ke Singapura membutuhkan sekitar 300
milidetik hanya dalam transit — sebelum aplikasi Anda melakukan apa pun.

**Kepatuhan.** Beberapa industri memiliki undang-undang tentang di mana data dapat disimpan. Data kesehatan AS mungkin perlu tetap berada di dalam negeri. Data keuangan mungkin perlu tetap dalam wilayah tertentu. Memilih Region yang salah dapat menimbulkan masalah hukum.

**Ketahanan terhadap bencana.** Jika satu lokasi mengalami pemadaman listrik, gempa bumi, atau kegagalan jaringan, Anda ingin sistem Anda bertahan. Menyebarkan infrastruktur di beberapa
lokasi adalah cara Anda melindungi dari bencana lokal.

**Cara AWS Mengorganisir Infrastrukturnya**

AWS membagi infrastruktur globalnya menjadi tiga konsep bersarang. Pikirkan mereka seperti
boneka Rusia, dari yang terbesar ke yang terkecil.

**Region → Availability Zone → Edge Location**

Mari kita buka masing-masing.

**Region: Kotak Besar**

Sebuah **Region** adalah wilayah geografis di mana AWS memiliki kluster pusat data. Setiap Region
dinamai berdasarkan lokasinya: `us-west-2` adalah Oregon, `us-east-1` adalah Virginia Utara,
`eu-west-1` adalah Irlandia, `ap-southeast-1` adalah Singapura — di mana server Leo bersembunyi.

Ada lebih dari 30 Region di seluruh dunia, dan AWS menambahkan lebih banyak secara teratur.

Setiap Region sepenuhnya independen. Data di `us-west-2` tetap di `us-west-2` kecuali
Anda secara eksplisit memindahkannya. Ini sangat penting untuk kepatuhan dan ketahanan — pemadaman besar
di satu Region tidak secara otomatis memengaruhi yang lain.

"Jadi kita harus memilih `us-west-2` untuk Nimbus?" tanya Tom.

Ya. Untuk bisnis AS yang menargetkan pelanggan Pantai Barat, ya. Latensi lebih rendah dan pengguna Anda mendapat respons yang lebih cepat.

"Berapa lebih mahal dibandingkan Singapura?" tambah Tom.

Harga bervariasi berdasarkan Region — biasanya beberapa persen. Manfaat kinerja dan kepatuhan dari Region yang tepat sepadan dengan perbedaan harga kecil.

**Availability Zone: Redundansi Nyata**

Di sinilah menjadi menarik.

Setiap Region bukan satu pusat data. Ini adalah kluster beberapa pusat data yang secara fisik terpisah
yang disebut **Availability Zone** (atau AZ).

Oregon (`us-west-2`) memiliki empat Availability Zone: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Ini adalah gedung nyata, dipisahkan oleh jarak yang berarti — cukup jauh
sehingga kebakaran, banjir, atau pemadaman listrik di satu tidak akan memengaruhi yang lain, tetapi cukup dekat sehingga jaringan di antara mereka sangat cepat (latensi satu digit milidetik).

Ini adalah arsitektur yang membuat AWS andal pada tingkat yang tidak bisa ditandingi satu pusat data.

Priya mencondongkan tubuh ke depan. "Jadi jika kita menjalankan aplikasi kita di dua Availability Zone dan
satu mati—"

"Yang lain tetap berjalan," Maya menyelesaikan.

"Tepat."

Leo, yang mendengarkan diam-diam: "Saya menerapkan semuanya di satu AZ."

"Ya," kata Priya. "Kami memperhatikan."

Konsep menyebarkan aplikasi Anda di beberapa AZ — yang disebut **penerapan Multi-AZ**
— adalah salah satu pola ketahanan terpenting di AWS. Kami mendalaminya di Bab 18. Untuk sekarang, pahami bahwa AZ ada khusus untuk membuat ini mungkin.

**Edge Location: Kecepatan, Di Mana-Mana**

AZ memecahkan ketahanan. Mereka tidak memecahkan masalah melayani konten dengan cepat kepada pengguna di
kota yang jauh dari Region utama Anda.

Masuk **Edge Location**.

Edge Location adalah titik infrastruktur kecil dan ringan yang tersebar di lebih dari 400
kota di seluruh dunia. Mereka bukan pusat data penuh — mereka tidak bisa menjalankan aplikasi Anda.
Yang *bisa* mereka lakukan adalah menyimpan cache konten dekat dengan pengguna Anda.

Bayangkan gambar menu yang disimpan di server di Virginia. Setiap kali seseorang di Tokyo ingin
melihatnya, permintaan harus melakukan perjalanan melintasi Pasifik dan kembali. Dengan Edge Location, AWS bisa menyimpan
salinan file itu di Tokyo dan melayaninya secara lokal — milidetik daripada ratusan milidetik.

Ini adalah tulang punggung CloudFront, jaringan pengiriman konten AWS. Kami menggali lebih dalam tentang
CloudFront di Bab 13. Untuk sekarang: Edge Location adalah tentang kecepatan untuk konten statis.

**Memilih Region: Daftar Periksa Insinyur Senior**

Ketika Nimbus berkembang untuk melayani pengguna di Meksiko dan Kolombia (yang terjadi di Bab 12),
keputusan Region tidak sembarangan. Berikut adalah cara berpikirnya:

**1. Di mana pengguna Anda?**

Mulailah dari sini. Pilih Region yang paling dekat dengan mayoritas pengguna Anda. Latensi adalah
dampak langsung dan terukur paling langsung dari pilihan Region.

**2. Apakah ada persyaratan kepatuhan?**

Beban kerja kesehatan, keuangan, dan pemerintah sering memiliki aturan residensi data yang ketat.
Ketahui lingkungan regulasi Anda sebelum memilih.

**3. Layanan apa yang Anda butuhkan?**

Tidak setiap layanan AWS tersedia di setiap Region. Layanan baru diluncurkan di `us-east-1`
terlebih dahulu. Jika Anda membutuhkan layanan tertentu, verifikasi Region target Anda mendukungnya.

**4. Berapa harganya?**

Region bervariasi dalam harga. `us-east-1` (Virginia Utara) cenderung paling murah karena
skala dan usianya. Amerika Selatan sedikit lebih mahal. Periksa halaman harga AWS
sebelum memfinalisasi.

**5. Apakah Anda membutuhkan multi-Region?**

Untuk sebagian besar aplikasi, beberapa AZ dalam satu Region sudah cukup untuk ketahanan. Untuk
aplikasi kritis di mana bahkan pemadaman regional tidak dapat diterima, Anda merancang untuk
multi-Region — tetapi itu adalah komitmen arsitektur yang signifikan. Jangan lakukan itu
secara spekulatif.

**Keterbatasan yang Tidak Dibicarakan Siapa pun**

Region itu powerful, tetapi mereka menciptakan satu ketegangan penting.

Menjalankan di beberapa Region sangat sulit.

Replikasi data antara Region memiliki latensi. Menjaga dua Region tetap sinkron — sehingga
transaksi di Region A langsung terlihat di Region B — adalah salah satu masalah tersulit
dalam sistem terdistribusi. AWS menyediakan alat untuk itu, tetapi biayanya dan menambah
kompleksitas operasional.

Sebagian besar aplikasi harus mulai dengan satu Region, beberapa AZ, dan berkembang ke multi-Region
hanya ketika mereka memiliki persyaratan yang jelas: mandat regulasi, SLA kontraktual yang memerlukan
hampir nol downtime regional, atau basis pengguna yang benar-benar terdistribusi di seluruh benua.

Arsitektur multi-Region yang prematur adalah salah satu kesalahan paling umum dan mahal
yang dibuat insinyur junior ketika mereka mulai merasa percaya diri.

Tom mengangguk. "Jadi kita tidak melakukan multi-Region hanya karena kita bisa."

"Tidak sampai kita perlu," kata Maya. "Dan kita akan tahu ketika kita perlu."

"Bagaimana kita akan tahu?" tanya Leo.

"Ketika dokumen tinjauan arsitektur Anda memiliki persyaratan yang mengatakan 'harus bertahan dari pemadaman regional,'"
kata Priya. "Sampai saat itu: multi-AZ."

## Kekuatan dan Keterbatasan

**Gunakan desain multi-region dan multi-AZ ketika**: aplikasi Anda memiliki pengguna di beberapa geografi dan latensi penting; SLA Anda memerlukan ketersediaan 99,99% atau lebih tinggi; persyaratan regulasi mengamanatkan residensi data di region tertentu; Anda membutuhkan pemulihan bencana dengan RTO di bawah satu jam.

**Komprominya nyata**: Mereplikasi data lintas region menambah biaya — transfer data lintas region adalah salah satu item paling diremehkan dalam tagihan AWS. Ini juga menambah kompleksitas operasional: setiap penulisan yang harus konsisten lintas region menambah latensi. Sebagian besar kegagalan yang memengaruhi aplikasi nyata bukan bencana lintas region — itu masalah dalam region seperti security group yang salah konfigurasi atau penerapan yang kacau. Investasikan di multi-AZ sebelum multi-region. Tambahkan multi-region ketika kasus bisnisnya jelas.

## Ringkasan

- AWS mengorganisasi infrastruktur globalnya menjadi **Region**, **Availability Zone**,
  dan **Edge Location**.
- Sebuah **Region** adalah kluster geografis pusat data. Setiap Region terisolasi —
  data tetap di Region kecuali Anda secara eksplisit memindahkannya.
- **Availability Zone** adalah pusat data yang secara fisik terpisah dalam Region, terhubung
  oleh jaringan latensi rendah. Penerapan di beberapa AZ adalah cara standar untuk
  bertahan dari kegagalan lokal.
- **Edge Location** menyimpan cache konten dekat dengan pengguna di seluruh dunia. Mereka mendukung CloudFront.
- Pilih Region Anda berdasarkan lokasi pengguna, persyaratan kepatuhan, ketersediaan layanan,
  dan harga — dalam urutan itu.
- Multi-AZ adalah baseline ketahanan standar. Multi-Region untuk beban kerja kritis
  dengan persyaratan spesifik yang terdokumentasi — bukan titik awal default.

## Tips Ujian

*Domain SAA-C03 1 — Tugas 1.1 / Domain 2 — Tugas 2.2*

- **Region terisolasi secara default.** Data tidak mereplikasi antar Region kecuali
  Anda mengkonfigurasinya. Ini penting untuk skenario kedaulatan dan kepatuhan data.
- **AZ adalah unit ketahanan untuk sebagian besar pertanyaan.** Ketika ujian menanyakan cara bertahan dari
  kegagalan pusat data, jawabannya melibatkan beberapa AZ dalam satu Region.
- **Multi-Region untuk ketahanan pemadaman regional.** Jika skenario mengatakan "harus tetap
  beroperasi bahkan jika seluruh Region AWS gagal," jawabannya melibatkan arsitektur multi-Region.
- **Edge Location ≠ AZ.** Edge Location menyimpan cache konten — mereka tidak bisa menjalankan server aplikasi Anda. Jangan bingungkan mereka dengan pusat data.
- Ujian sering menguji hubungan antara kepatuhan dan pemilihan Region.
  Jika skenario menyebutkan persyaratan residensi data, pilihan Region adalah bagian dari jawabannya.

## Latihan

**Latihan 1 — Mengingat Kembali**

Dengan kata-kata Anda sendiri: apa perbedaan antara Region dan Availability Zone?
Mengapa perbedaan itu penting ketika merancang aplikasi web yang tangguh?

*(Petunjuk: Pikirkan tentang dua jenis kegagalan berbeda yang dilindungi masing-masing.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan kesehatan AS harus menyimpan semua data pasien dalam satu Region AWS
untuk mematuhi kebijakan residensi data internal. Mereka sedang merancang aplikasi cloud baru
di Pantai Barat dan ingin memaksimalkan ketahanan tanpa memindahkan data ke Region lain.

Konfigurasi mana yang PALING BAIK memenuhi kebutuhan mereka?

A) Terapkan di `us-east-1` dan gunakan CloudFront Edge Location di Oregon untuk melayani konten
   lebih cepat  
B) Terapkan di `us-west-2` (Oregon) di beberapa Availability Zone  
C) Terapkan di beberapa Region termasuk `us-west-2` dan `us-east-1` dengan replikasi data lintas-Region  
D) Terapkan di `us-west-2` dalam satu Availability Zone untuk meminimalkan biaya

**Petunjuk 1**: Kebijakan berarti data harus tetap di satu Region. Pilihan mana yang
memindahkan data ke Region lain?

**Petunjuk 2**: Di antara pilihan yang menjaga data di `us-west-2`, mana yang memberikan ketahanan paling besar?

**Petunjuk 3**: Beberapa AZ dalam satu Region memberikan ketahanan tanpa melewati batas Region.

**Jawaban**: B

**Penjelasan**: `us-west-2` menjaga semua data dalam satu Region, memenuhi persyaratan kebijakan.
Penerapan di beberapa AZ dalam Region tersebut melindungi dari kegagalan pusat data
tanpa memindahkan data ke Region lain. Ini adalah keseimbangan yang tepat
antara kepatuhan dan ketahanan.

**Mengapa bukan A?** CloudFront menyimpan cache konten di Edge Location secara global — data akan
secara fisik meninggalkan `us-west-2`, melanggar kebijakan residensi.

**Mengapa bukan C?** Mereplikasi ke `us-east-1` memindahkan data pasien ke Pantai Timur,
secara langsung melanggar persyaratan satu Region.

**Mengapa bukan D?** Satu AZ tidak memiliki ketahanan. Jika AZ tersebut mengalami pemadaman,
aplikasi gagal sepenuhnya.

*Domain SAA-C03 1 — Tugas 1.1 (infrastruktur global, kedaulatan data)*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang berkembang untuk melayani pelanggan di Meksiko dan Kolombia. Saat ini semuanya
berjalan di `us-west-2`. Tim berdebat: haruskah mereka menambahkan Region kedua `us-east-1`,
atau tetap satu Region dengan beberapa AZ?

Pertanyaan apa yang akan Anda ajukan sebelum memutuskan? Apa saja biaya dan risiko utama dari
menambahkan Region kedua? Apa biaya utama *tidak* menambahkannya?

*(Tidak ada satu jawaban yang benar. Latih penalaran kompromi multi-Region.)*

## Adegan Pasca-Kredit

Leo memperbaiki masalah Singapura. Nimbus pindah ke `us-west-2`. Latensi turun.
Satu-satunya pertanyaan lanjutan Tom — "apakah itu mengubah tagihan kita?" — dijawab dengan angka yang sedikit lebih tinggi, yang ia terima dengan keengganan yang terlihat.

Itu bertahan dua hari sebelum masalah berikutnya.

Leo datang ke standup dengan ekspresi yang telah dipelajari Maya: tampang
seseorang yang telah melakukan sesuatu yang tidak bisa dibatalkan.

"Jadi," katanya dengan hati-hati. "Saya menyiapkan server. Dan saya butuh cara untuk masuk.
Jadi saya membuat nama pengguna."

"Dan?" tanya Priya.

"'Admin'."

Hening.

"Dan kata sandinya?"

Hening lebih lama.

"'Admin123'."

Priya berdiri.

Di bab berikutnya: bagaimana Nimbus mengontrol siapa yang bisa menyentuh apa — dan apa yang terjadi ketika mereka melakukan kesalahan.
