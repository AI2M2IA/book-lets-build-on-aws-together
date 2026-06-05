# Bab 21: Kontainer Pengiriman untuk Kode

"Ini berjalan di mesinku."

Leo sudah belajar untuk tidak mengucapkan ini dengan keras. Itu bukan pembelaan — itu adalah diagnosis. Dan diagnosis kali ini adalah instance EC2 produksi nomor tiga, yang telah menerima patch library enam minggu lalu yang tidak didokumentasikan siapa pun, yang tidak diterima oleh dua instance lainnya, dan yang kini menyebabkan bug yang hanya ada di sana, di instance itu saja, tidak terlihat di mana pun.

Dia menghabiskan tiga jam malam sebelumnya untuk melacaknya.

"Setiap kali kita deploy," katanya keesokan paginya, "kita berkoordinasi di beberapa instance. Versi baru, dependensi berbeda. Berjalan di staging, rusak di produksi karena lingkungan sudah menyimpang."

"Karena seseorang memperbarui paket di instance tiga tanpa memperbarui yang lain," kata Priya. Tidak dengan nada jahat.

"Aku butuh versi tertentu dari—"

"Aku tahu," katanya. "Dan sekarang instance tiga memiliki riwayat berbeda dari instance satu dan dua. Itu adalah configuration drift. Diam sampai tidak lagi."

Lambda telah memperbaiki masalah server menganggur untuk layanan-layanan Nimbus yang lebih kecil. Tetapi API inti — yang menanggung semua lalu lintas pesanan — masih ada di EC2. Dan instance EC2, tidak seperti fungsi, mengumpulkan riwayat.

"Apa solusi sebenarnya?" tanya Maya.

"Berhenti memperlakukan server seperti hal permanen yang kamu konfigurasi," kata Priya. "Mulai memperlakukan mereka seperti unit sekali pakai yang kamu ganti."

Ada analogi yang menjelaskan ini begitu tepat sehingga muncul di hampir setiap penjelasan tentang kontainer perangkat lunak. Analogi ini berasal dari tahun 1956, dan tidak ada hubungannya dengan perangkat lunak. Jawabannya, ketika seseorang akhirnya bertanya "apa solusi untuk mengirim barang secara andal di berbagai moda transportasi?", adalah: standarisasi kontainernya. Kirim kotaknya, bukan hanya isinya.

**Apa Itu Kontainer?**

Sebuah **kontainer** adalah unit portabel ringan yang mengemas aplikasimu bersama dengan semua yang diperlukan untuk menjalankannya: runtime (Python 3.11, Node.js 20, Java 17), library dan dependensi, file konfigurasi, dan kode aplikasi itu sendiri.

Tidak seperti mesin virtual (yang mengemulasi seluruh komputer, termasuk kernel sistem operasi), kontainer berbagi kernel OS host sambil menjaga segalanya tetap terisolasi. Ini membuat kontainer cepat untuk distart (detik, terkadang milidetik) dan kecil (megabyte, bukan gigabyte).

Teknologi kontainer paling populer adalah **Docker**. Docker image adalah cetak biru — snapshot aplikasi dan lingkungannya. Docker container adalah instance yang berjalan dari image tersebut.

Properti kunci: **immutabilitas**. Sebuah image yang dibangun hari ini akan berjalan identik di host mana pun yang mendukung Docker — laptop, instance EC2, server di pusat data berbeda. Lingkungan sudah dimasukkan. Configuration drift tidak mungkin terjadi.

"Jadi alih-alih khawatir tentang apa yang terinstal di instance EC2," kata Leo, "kita membangun image yang memiliki segalanya. Image berjalan dengan cara yang sama di mana saja."

"Dan jika kamu perlu mengujinya secara lokal, kamu menjalankan image yang sama," tambah Priya. "Tidak ada lagi 'ini berjalan di mesinku.'"

**Amazon ECS: Orkestrator**

Menjalankan satu kontainer itu sederhana. Menjalankan puluhan kontainer di beberapa host, merutekan lalu lintas di antaranya, memulai ulang kontainer yang gagal, men-deploy versi baru tanpa downtime — itu membutuhkan sebuah **orkestrator**.

**Amazon ECS (Elastic Container Service)** adalah layanan orkestrasi kontainer terkelola AWS. Kamu mendefinisikan:

- **Definisi task**: Image kontainer apa yang dijalankan, berapa banyak CPU dan memori, variabel lingkungan apa, port apa yang diekspos
- **Service**: Berapa salinan task yang dijalankan, bagaimana menangani kegagalan dan deployment
- **Cluster**: Infrastruktur komputasi yang mendasarinya

ECS menangani sisanya: menempatkan task pada kapasitas yang tersedia, memulai ulang task yang gagal, menguras koneksi selama deployment, mendaftarkan task yang sehat ke load balancer.

Untuk Nimbus, API berpindah dari instance EC2 dengan deployment yang dikelola secara manual ke ECS. Setiap deployment baru mendorong Docker image baru ke **Amazon ECR (Elastic Container Registry)** — registry kontainer Docker terkelola AWS — dan ECS meluncurkannya di semua task tanpa downtime.

**Fargate vs Tipe Launch EC2**

ECS dapat menjalankan kontainer dalam dua mode:

**Tipe launch EC2**: Kamu mengelola instance EC2 yang mendasarinya. Kamu bertanggung jawab untuk mem-patch instance, mengatur ukurannya dengan tepat, dan memastikan ada cukup kapasitas untuk kontainermu. Kontrol lebih banyak, tanggung jawab lebih banyak.

**Fargate (komputasi serverless untuk kontainer)**: AWS mengelola infrastruktur yang mendasari sepenuhnya. Kamu menentukan CPU dan memori per task; Fargate menyediakan kapasitas yang tepat secara otomatis. Tidak ada instance EC2 yang perlu dikelola. Kamu membayar per vCPU-detik dan GB-detik memori.

Fargate adalah model "kontainer serverless" — kamu mendapatkan isolasi lingkungan dari kontainer tanpa mengelola server. Trade-off: kontrol yang lebih sedikit atas konfigurasi instance yang mendasari dan biaya per unit yang sedikit lebih tinggi.

Untuk Nimbus: Fargate untuk layanan API. Mereka tidak ingin mengelola instance EC2 untuk kontainer.

**Amazon EKS: Saat Kamu Membutuhkan Kubernetes**

**Kubernetes** adalah sistem orkestrasi kontainer open-source — pada dasarnya standar industri untuk mengelola kontainer dalam skala besar. Ini kuat, dapat diperluas, dan kompleks.

**Amazon EKS (Elastic Kubernetes Service)** adalah layanan Kubernetes terkelola AWS. AWS menjalankan control plane Kubernetes (lapisan manajemen) untukmu, sementara kamu mengelola worker node (atau menggunakan Fargate untuk itu juga).

Kapan sebaiknya kamu menggunakan EKS vs ECS?

**Gunakan ECS** jika:

- Kamu terutama ada di AWS dan ingin pengalaman yang lebih sederhana dan lebih native AWS
- Timmu tidak memiliki keahlian Kubernetes yang ada
- Kamu ingin overhead operasional yang lebih sedikit

**Gunakan EKS** jika:

- Kamu membutuhkan fitur khusus Kubernetes (Custom Resource Definitions, Helm charts, ekosistem Kubernetes)
- Timmu sudah mengenal Kubernetes
- Kamu menjalankan lingkungan hybrid (sebagian di on-premises, sebagian di AWS) dan ingin lapisan orkestrasi yang konsisten
- Beban kerjamu memiliki persyaratan yang sesuai dengan kemampuan perluasan Kubernetes

"Mana yang harus kita gunakan?" tanya Maya.

"ECS," kata Priya segera. "Kita tidak memiliki keahlian Kubernetes. ECS melakukan semua yang kita butuhkan. Menambahkan Kubernetes sekarang akan menambah kompleksitas operasional tanpa manfaat praktis."

"Kita selalu bisa bermigrasi ke EKS nanti jika kita sudah melampaui ECS," tambah Leo.

Ini adalah jawaban senior yang benar: pilih alat yang lebih sederhana yang sesuai dengan kebutuhan saat ini.

**Bagaimana Kontainer Mengubah Deployment**

Sebelum kontainer, men-deploy versi baru API Nimbus berarti:

1. SSH ke setiap instance EC2
2. Tarik kode terbaru dari Git
3. Instal/perbarui dependensi
4. Mulai ulang proses aplikasi
5. Verifikasi kesehatan
6. Pindah ke instance berikutnya

Ini rawan kesalahan dan lambat. Ini membutuhkan koordinasi. Jika langkah 3 gagal pada instance 4, kamu memiliki deployment campuran dengan beberapa instance menjalankan versi lama dan beberapa gagal menjalankan versi baru.

Dengan ECS dan kontainer:

1. Bangun Docker image baru (otomatis dalam pipeline CI/CD)
2. Dorong ke ECR
3. Perbarui service ECS untuk menggunakan versi image baru

ECS menangani rolling deployment: memulai task baru dengan image baru, menunggu sampai sehat, kemudian menghentikan task lama. Deployment tanpa downtime, otomatis.

Jika versi baru gagal health check, ECS menghentikan deployment dan versi lama terus melayani lalu lintas.

## Kekuatan dan Keterbatasan

**Kontainer**:

- Menghilangkan inkonsistensi lingkungan ("ini berjalan di mesinku")
- Memungkinkan deployment yang cepat dan andal
- Immutable — image yang sama berjalan identik di mana saja
- Efisien — lebih ringan dari VM, startup lebih cepat

**ECS**:

- Lebih sederhana dari Kubernetes untuk beban kerja yang berpusat pada AWS
- Integrasi AWS yang erat (IAM, ALB, CloudWatch, Secrets Manager)
- Opsi Fargate menghilangkan manajemen EC2 sepenuhnya

**EKS**:

- Kompatibilitas Kubernetes penuh — gunakan seluruh ekosistem
- Lebih baik untuk lingkungan hybrid atau tim dengan keahlian Kubernetes
- Lebih kompleks untuk disiapkan dan dioperasikan dibanding ECS

**Di mana ini menjadi rumit**:

- Image kontainer harus dibangun dan di-versi — membutuhkan pipeline CI/CD
- Debugging kontainer membutuhkan tooling berbeda dari debugging proses tradisional
- Kontainer stateful (database dalam kontainer) membutuhkan konfigurasi penyimpanan persisten yang cermat
- Jaringan antar kontainer (komunikasi layanan-ke-layanan) membutuhkan pemahaman konsep jaringan kontainer

## Ringkasan

- **Kontainer** mengemas kode aplikasi, runtime, dan dependensi bersama — berjalan identik di mana saja.
- **Docker** adalah teknologi kontainer standar. Image adalah cetak biru; kontainer adalah instance yang berjalan.
- **ECR (Elastic Container Registry)** adalah registry Docker terkelola AWS — simpan dan versi image-mu di sini.
- **ECS (Elastic Container Service)** mengorkestrasikan kontainer. Kamu mendefinisikan task dan service; ECS mengelola penempatan dan siklus hidup.
- **Fargate** adalah komputasi serverless untuk kontainer — tidak ada instance EC2 yang perlu dikelola.
- **EKS (Elastic Kubernetes Service)** adalah Kubernetes terkelola — untuk tim yang membutuhkan fitur atau kompatibilitas Kubernetes.
- Pilih ECS untuk kesederhanaan di AWS; pilih EKS untuk kompatibilitas ekosistem Kubernetes.

## Tips Ujian

*Domain SAA-C03: Merancang Arsitektur yang Tangguh (Domain 2, Tugas 2.1)*

- **Sinyal ECS vs EKS**: Skenario ujian yang menyebutkan "Kubernetes," "Helm," "keahlian Kubernetes yang sudah ada," atau "orkestrasi kontainer multi-cloud" → EKS. Semua yang lain → ECS.
- **Fargate vs tipe launch EC2**: "Tidak ingin mengelola instance EC2 untuk kontainer," "kontainer serverless," "tidak ada manajemen infrastruktur" → Fargate. "Membutuhkan tipe instance tertentu," "beban kerja GPU," "kontrol instance yang halus" → tipe launch EC2.
- **Peran task ECS**: Seperti peran instance EC2, task ECS memiliki peran IAM. Setiap task dapat memiliki izin yang berbeda. Skenario ujian: "kontainer perlu membaca dari S3" → lampirkan peran IAM ke definisi task.
- **Pemindaian image ECR**: ECR dapat memindai image kontainer untuk kerentanan yang diketahui (CVE). Sinyal ujian: "pindai kontainer untuk kerentanan keamanan" → pemindaian image ECR.
- **Deployment blue/green**: ECS mendukung deployment blue/green melalui integrasi CodeDeploy. Deployment tanpa downtime dengan rollback otomatis. Pola ujian: "deploy tanpa downtime dengan rollback otomatis" → ECS + CodeDeploy blue/green.
- **Auto Scaling Service ECS**: Skalakan jumlah task berdasarkan CPU, memori, atau metrik CloudWatch kustom. Bekerja dengan ALB untuk merutekan lalu lintas ke jumlah task yang berjalan yang tepat.

## Latihan

**Latihan 1 — Mengingat Kembali**

Jelaskan perbedaan antara Docker image dan Docker container. Jelaskan perbedaan antara ECS dan ECR.

*(Petunjuk: Image bagi container seperti resep bagi makanan yang sudah dimasak. ECR menyimpan image; ECS menjalankannya.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan memiliki aplikasi microservices yang saat ini berjalan di instance EC2 yang dikelola secara manual. Tim mengalami kesulitan dengan deployment yang tidak konsisten — instance EC2 yang berbeda memiliki versi library yang berbeda, menyebabkan bug yang sulit direproduksi. Mereka ingin menstandardisasi deployment sambil meminimalkan overhead operasional untuk mengelola server yang mendasari. Tim tidak memiliki pengalaman Kubernetes.

Solusi mana yang PALING memenuhi persyaratan ini?

A) Deploy di EC2 dengan AWS Systems Manager Patch Manager untuk menjaga konsistensi instance  
B) Kontainerisasi aplikasi dengan Docker; gunakan Amazon ECS dengan tipe launch Fargate  
C) Kontainerisasi aplikasi dengan Docker; gunakan Amazon EKS dengan self-managed node groups  
D) Gunakan AWS Elastic Beanstalk untuk mengelola deployment dan konfigurasi instance secara otomatis

**Petunjuk 1**: Kontainer memecahkan masalah "lingkungan yang tidak konsisten" secara langsung. Opsi mana yang menggunakan kontainer?

**Petunjuk 2**: "Minimalkan overhead operasional untuk mengelola server" → Fargate (tidak ada manajemen EC2) vs node yang dikelola sendiri (masih mengelola EC2).

**Petunjuk 3**: "Tidak ada pengalaman Kubernetes" → EKS adalah kompleksitas operasional lebih dari ECS.

**Jawaban**: B

**Penjelasan**: Kontainerisasi dengan Docker memastikan setiap deployment menggunakan image yang sama dengan dependensi yang sama — menghilangkan configuration drift. ECS dengan Fargate berarti tidak ada instance EC2 yang perlu dikelola. Tim fokus pada kode aplikasi dan definisi kontainer, bukan pemeliharaan server. ECS (bukan EKS) sesuai untuk tim tanpa pengalaman Kubernetes.

**Mengapa bukan A?** Patch Manager menjaga instance EC2 tetap diperbarui tetapi tidak memecahkan inkonsistensi versi library antar aplikasi. Masalah mendasar (lingkungan kode berbeda di instance berbeda) tetap ada.

**Mengapa bukan C?** EKS dengan self-managed node groups membutuhkan pengelolaan instance EC2 *dan* belajar Kubernetes. Keduanya tidak sesuai dengan persyaratan.

**Mengapa bukan D?** Elastic Beanstalk mengelola deployment aplikasi di EC2 tetapi tidak memecahkan inkonsistensi lingkungan yang mendasar kecuali kontainer digunakan. Beanstalk tidak menggunakan Docker image secara default (meskipun dapat dikonfigurasi untuk itu).

*Domain SAA-C03: Merancang Arsitektur yang Tangguh — Tugas 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus memecah API monolitik menjadi tiga microservice: layanan pesanan, layanan menu, dan layanan notifikasi. Setiap layanan memiliki persyaratan penskalaan yang berbeda (layanan pesanan menskalakan dengan lalu lintas; layanan menu sebagian besar read-only dan stabil; layanan notifikasi memiliki burst yang tidak menentu).

Rancang arsitektur ECS untuk ketiga layanan ini. Bagaimana kamu akan menangani komunikasi layanan-ke-layanan? Apakah kamu akan menggunakan satu cluster ECS atau tiga? Bagaimana kamu akan mengonfigurasi Auto Scaling secara berbeda untuk setiap layanan?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih arsitektur microservices di ECS.)*

## Adegan Pasca-Kredit

Deployment kontainer pertama berjalan sempurna.

Versi baru API: tanpa downtime. ECS meluncurkannya, health check lulus, task lama dikuras, task baru mengambil alih. Leo menonton status task di konsol dengan sesuatu yang mendekati ketidakpercayaan.

"Itu langsung berfungsi," katanya.

"Itulah intinya," kata Priya.

"Tidak ada SSH. Tidak ada downtime. Tidak ada 'tunggu sampai restart.'"

"Image adalah artefak deployment," katanya. "Lingkungan immutable. Proses deployment bersifat deklaratif. Beginilah seharusnya perangkat lunak dikirimkan."

Leo menatap konsol sejenak lagi.

"Aku menghabiskan tiga tahun mengkoordinasikan deployment EC2," katanya. "Mengkoordinasikan skrip SSH. Menulis runbook deployment."

"Kamu memecahkan masalah," kata Priya, "yang dipecahkan kontainer berdasarkan desain."

Dia tidak berkata apa-apa setelah itu. Tetapi keesokan paginya, dia mulai menulis dokumentasi tentang proses build kontainer, agar tidak ada orang lain yang harus menghabiskan tiga tahun untuk mencari tahu sendiri.

Di bab berikutnya: diagram alur yang menjalankan dirinya sendiri — dan mengingat di mana ia berhenti.
