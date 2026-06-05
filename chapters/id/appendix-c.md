# Lampiran C: Pustaka Konsep

Setiap konsep utama yang diperkenalkan dalam buku, dipetakan ke babnya, analogi yang digunakan, dan domain SAA-C03 tempatnya muncul.

Gunakan ini sebagai indeks studi: jika Anda tidak yakin dengan suatu konsep sebelum ujian, temukan di sini dan kembalikan ke babnya untuk mendapatkan konteks.

---

## A

**ACU (Aurora Capacity Unit)** — Satuan pengukuran untuk kapasitas Aurora Serverless v2. Menskalakan secara otomatis. Bab 24. Domain 3.

**Alarm (CloudWatch)** — Aturan yang memicu ketika metrik melampaui ambang batas, memicu notifikasi atau tindakan penskalaan otomatis. Bab 7. Domain 2.

**ALB (Application Load Balancer)** — Load balancer Layer 7 yang merutekan lalu lintas HTTP/HTTPS berdasarkan aturan jalur dan host. Bab 7. Domain 2.

**AMI (Amazon Machine Image)** — Templat yang berisi OS, perangkat lunak, dan konfigurasi untuk instance EC2. Bab 4. Domain 3.

**Pemikiran Arsitektur** — Bertanya "apa yang rusak pertama, bagaimana kita tahu, dan apa yang dilakukan seseorang pada pukul 3 pagi" daripada hanya "bagaimana ini bekerja?". Bab 32, Bab 34. Domain Silang.

**Catatan Keputusan Arsitektur (ADR)** — Dokumen pendek yang menangkap keputusan, alternatifnya, rasionalisasinya, dan apa yang akan menyebabkan pertimbangan ulang. Bab 32. Domain Silang.

**Tinjauan Arsitektur** — Proses terstruktur yang mencakup: batasan → ketidakpastian → opsi → mode kegagalan → pemantauan → buku kerja. Bab 32. Domain Silang.

**Athena** — Layanan kueri SQL tanpa server untuk data di S3. Bayar per TB yang dipindai. Terbaik dengan format kolom Parquet/ORC. Bab 26. Domain 3.

**Grup Penskalaan Otomatis (ASG)** — Sekelompok instance EC2 yang dikelola bersama, mengganti instance yang tidak sehat secara otomatis dan menskalakan berdasarkan beban. Bab 7. Domain 2, 3.

**Zona Ketersediaan (AZ)** — Satu atau lebih pusat data fisik terpisah dalam suatu wilayah, terhubung oleh tautan latensi rendah. Bab 2. Domain 2.

---

## B

**Bucket (S3)** — Wadah untuk objek S3. Bucket memiliki nama global unik dan berada di wilayah tertentu. Bab 5. Domain 3.

**Kebijakan Bucket** — Kebijakan berbasis sumber daya yang melekat pada bucket S3 yang mengontrol akses untuk prinsipal IAM dan akun eksternal. Bab 5. Domain 1.

---

## C

**Pola Cache-Aside** — Aplikasi memeriksa cache terlebih dahulu; jika tidak ada, kueri database, lalu menyimpan hasilnya dalam cache. Bab 10. Domain 3.

**Tingkat Hit Cache** — Persentase permintaan yang disajikan dari cache daripada asal. Semakin tinggi semakin baik. Bab 13. Domain 3.

**CloudFront** — CDN AWS. Menyimpan konten di lebih dari 400 lokasi edge di seluruh dunia. Mengurangi latensi dan biaya transfer data asal. Bab 13. Domain 3, 4.

**CloudTrail** — Mencatat setiap panggilan API AWS: siapa, apa, kapan, dari mana. Disimpan di S3. Digunakan untuk audit dan investigasi insiden. Domain 1.

**CloudWatch** — Metrik, log, alarm, dan dasbor untuk sumber daya AWS dan aplikasi khusus. Dirujuk di seluruh domain. Semua domain.

**Cold Start (Lambda)** — Penundaan pada panggilan pertama (atau setelah tidak aktif) saat Lambda menginisialisasi lingkungan eksekusi. Gunakan konkurensi yang disediakan untuk menghilangkan. Bab 20. Domain 3.

**Rencana Penghematan Komputasi** — Komitmen terhadap jumlah dolar pengeluaran jam EC2, berlaku untuk jenis atau ukuran instance apa pun. Bab 27. Domain 4.

**Konfigurasi (AWS)** — Melacak perubahan konfigurasi ke sumber daya AWS dari waktu ke waktu dan mengevaluasi kepatuhan terhadap aturan. Bab 31. Domain 1.

**Transfer Data Antar-AZ** — Lalu lintas antara Zona Ketersediaan dalam suatu wilayah. Dikenakan biaya $0,01/GB dalam setiap arah. Bab 30. Domain 4.

**Replikasi Antar-Wilayah** — Menyalin data (CRR S3, Aurora Global, DynamoDB Global Tables) ke wilayah yang berbeda. Menimbulkan biaya transfer data. Bab 18, 30. Domain 2.

---

## D

**DAX (DynamoDB Accelerator)** — Cache dalam memori khusus untuk DynamoDB. Latensi baca mikrosekon. Bab 9. Domain 3.

**Antrian Surat Mati (DLQ)** — Antrian tempat pesan yang gagal diproses berulang kali dikirim, mencegah penyumbatan antrian. Bab 19. Domain 2.

**Host Khusus** — Server EC2 fisik yang dipesan secara eksklusif untuk penggunaan Anda. Diperlukan untuk lisensi perangkat lunak tertentu. Bab 27. Domain 4.

**Pertahanan dalam Kedalaman** — Lapisan beberapa kontrol keamanan (IAM + grup keamanan + ACLs + WAF + GuardDuty) sehingga kompromi satu lapisan tidak mengekspos sistem. Bab 33. Domain 1.

**Direct Connect** — Koneksi jaringan pribadi khusus dari lokasi on-premises ke AWS. Lebih konsisten daripada VPN. Bab 25. Domain 3.

**DLQ** — Lihat Antrian Surat Mati.

**DynamoDB** — Database NoSQL yang dikelola sepenuhnya dengan latensi milisekon tunggal dalam skala apa pun. Model kunci-nilai dan dokumen. Bab 9. Domain 3.

**DynamoDB Auto Scaling** — Secara otomatis menyesuaikan kapasitas baca/tulis yang disediakan berdasarkan metrik CloudWatch. Bab 29. Domain 4.

**DynamoDB Streams** — Catatan perubahan berurutan dari semua perubahan item dalam tabel DynamoDB. Digunakan dengan Lambda untuk pemrosesan berbasis peristiwa. Bab 9. Domain 2.

---

## E

**EBS (Elastic Block Store)** — Penyimpanan blok yang melekat pada instance EC2 tunggal. Bertahan secara independen. Jenis: gp3, io2, st1. Bab 6. Domain 3.

**EC2 (Elastic Compute Cloud)** — Mesin virtual di cloud. Bab 4. Domain 3.

**ECS (Elastic Container Service)** — Layanan orkestrasi kontainer terkelola. Jenis peluncuran Fargate menghilangkan manajemen server. Bab 21. Domain 2, 3.

**EFS (Elastic File System)** — Sistem file NFS bersama yang dapat diakses dari beberapa instans EC2. Skala secara otomatis. Bab 6. Domain 3.

**EKS (Elastic Kubernetes Service)** — Kontrol plane Kubernetes terkelola di AWS. Bab 21. Domain 3.

**ElastiCache** — Penyimpanan cache dalam memori terkelola. Redis (fitur yang lebih kaya) atau Memcached (lebih sederhana). Bab 10. Domain 3.

**Elastic IP** — Alamat IP publik statis yang dapat Anda alokasikan dan asosiasikan ulang dengan instans EC2. Bab 11. Domain 3.

**Enkripsi Envelope** — Pola di mana data dienkripsi dengan kunci data (DEK), dan DEK dienkripsi dengan kunci master (CMK di KMS). Bab 16. Domain 1.

**EventBridge** — Bus acara untuk merutekan acara dari layanan AWS, mitra SaaS, dan sumber khusus ke target. Mendukung aturan terjadwal. Bab 22. Domain 2.

**Penolakan Eksplisit** — Pernyataan IAM deny yang tidak dapat ditimpa oleh semua izinkan. Memiliki prioritas di atas semua izinkan. Bab 3. Domain 1.

---

## F

**Perutean Failover (Route 53)** — Merutekan lalu lintas ke titik akhir sekunder ketika titik akhir utama gagal dalam pemeriksaan kesehatan. Bab 12. Domain 2.

**Fargate** — Mesin komputasi serverless untuk ECS dan EKS. Tidak ada instans EC2 yang perlu dikelola. Bab 21. Domain 3.

**Pola Fan-out** — Satu topik SNS mengirimkan pesan yang sama ke beberapa antrian SQS secara bersamaan. Bab 19. Domain 2.

**Antrian FIFO (SQS)** — Pemrosesan satu kali, pengurutan ketat. Throughput lebih rendah daripada antrian standar. Bab 19. Domain 2.

**Mode Kegagalan** — Cara spesifik suatu sistem dapat gagal. Mengidentifikasi mode kegagalan sebelum produksi adalah inti dari tinjauan arsitektur. Bab 32. Lintas domain.

---

## G

**Titik Akhir Gerbang** — Jenis titik akhir VPC gratis untuk S3 dan DynamoDB. Merutekan lalu lintas melalui jaringan pribadi AWS, menghilangkan biaya NAT Gateway. Bab 30. Domain 4.

**Perutean Berdasarkan Geografi (Route 53)** — Perutean berdasarkan lokasi geografis asal kueri DNS. Bab 12. Domain 3.

**Global Accelerator** — Merutekan lalu lintas ke tepi AWS terdekat melalui Anycast, meningkatkan latensi untuk aplikasi dinamis. Bab 25. Domain 3.

**Glue (AWS)** — ETL serverless. Crawler Glue menemukan skema; Pekerjaan Glue mentransformasikan data; Katalog Data menyimpan metadata. Bab 26. Domain 3.

**GSI (Global Secondary Index)** — Indeks alternatif pada tabel DynamoDB dengan kunci partisi dan kunci sort opsional yang berbeda. Memungkinkan pola kueri yang fleksibel. Bab 9. Domain 3.

**GuardDuty** — Layanan deteksi ancaman menggunakan ML pada CloudTrail, VPC Flow Logs, dan log DNS untuk mendeteksi aktivitas yang tidak biasa. Bab 17. Domain 1.

---

## H

**Pemeriksaan Kesehatan (Route 53)** — Memantau ketersediaan titik akhir. Pemeriksaan kesehatan yang gagal memicu perutean failover. Bab 12. Domain 2.

**Partisi Panas (DynamoDB)** — Partisi yang menerima lalu lintas yang tidak proporsional karena banyak permintaan berbagi kunci partisi yang sama. Bab 9. Domain 3.

---

## I

**IAM (Identity and Access Management)** — Mengontrol autentikasi dan otorisasi untuk akun AWS. Pengguna, grup, peran, kebijakan. Bab 3, 14. Domain 1.

**Peran IAM** — Identitas IAM dengan kredensial sementara, yang diasumsikan oleh layanan, pengguna, atau akun lain. Bab 3, 14. Domain 1.

**Idempotensi** — Sifat suatu operasi yang menghasilkan hasil yang sama apa pun jumlah panggilan. Penting untuk sistem terdistribusi (pembatalan, pembayaran, pemrosesan pesanan). Bab 32. Lintas domain.

**Kunci Idempotensi** — Pengidentifikasi unik untuk suatu operasi, diperiksa sebelum eksekusi untuk mencegah pemrosesan duplikat. Bab 32. Lintas domain.

**Titik Akhir Antarmuka (PrivateLink)** — Titik akhir VPC untuk sebagian besar layanan AWS. Harga per jam + per GB. Menyediakan konektivitas pribadi tanpa internet atau NAT. Bab 30. Domain 4.

**Internet Gateway (IGW)** — Memungkinkan instans di subnet publik untuk berkomunikasi dengan internet. Membutuhkan agar tabel rute subnet memiliki rute ke IGW. Bab 11. Domain 3.

**"It depends"** — Jawaban jujur untuk sebagian besar pertanyaan arsitektur, yang harus selalu dilengkapi: "It depends on the access pattern / scale / failure consequence / cost constraint." Bab 33. Lintas domain.

---

## K

**Kinesis Data Firehose** — Pengiriman terkelola data streaming ke S3, Redshift, OpenSearch. Tidak ada manajemen konsumen. Bab 26. Domain 3.

**Kinesis Data Streams** — Alur acara waktu nyata yang diurutkan. Tahan lama, dapat direproduksi. Diukur dalam shard. Bab 26. Domain 3.

**KMS (Key Management Service)** — Membuat, menyimpan, dan mengontrol kunci kriptografi untuk enkripsi saat istirahat. Bab 16. Domain 1.

---

## L

**Lambda** — Fungsi serverless yang dipicu oleh peristiwa. Bayar per panggilan dan per ms. Durasi maksimum 15 menit. Bab 20. Domain 2, 3, 4.

**Lambda@Edge** — Fungsi Lambda yang berjalan di lokasi tepi CloudFront, memodifikasi permintaan dan respons. Bab 13. Domain 3.

**Latensi Berbasis Perutean (Route 53)** — Merutekan kueri DNS ke wilayah AWS dengan latensi terendah yang diukur. Bab 12. Domain 3.

**Template Peluncuran** — Templat versi yang menentukan konfigurasi instans EC2 untuk Grup Skala Otomatis. Bab 7. Domain 3.

```markdown
**Least privilege** — IAM praktik terbaik: berikan hanya izin yang dibutuhkan, tidak lebih. Bab 3. Domain 1.

**Lifecycle policy (S3)** — Aturan yang secara otomatis mentransfer objek ke kelas penyimpanan yang lebih murah atau menghapusnya berdasarkan usia. Bab 23. Domain 4.

**LSI (Local Secondary Index)** — Indeks alternatif pada tabel DynamoDB menggunakan kunci partisi yang sama tetapi kunci sort yang berbeda. Harus dibuat saat pembuatan tabel. Bab 9. Domain 3.

---

## M

**Memcached** — Mesin caching dalam memori multi-threaded sederhana. Tidak ada persistensi, tidak ada struktur data. Gunakan Redis kecuali Anda secara khusus membutuhkan multi-threading dengan mengorbankan fitur. Bab 10. Domain 3.

**Multi-AZ (RDS)** — Replika standby sinkron dalam AZ yang berbeda dengan failover otomatis. RPO ~0, RTO ~60 detik. Untuk ketersediaan tinggi, bukan penskalaan baca. Bab 8, 18. Domain 2.

**Multi-Region** — Menerapkan komponen aplikasi di berbagai wilayah AWS untuk redundansi geografis dan kinerja global. Kompleksitas dan biaya lebih tinggi. Bab 18. Domain 2.

---

## N

**NACL (Network Access Control List)** — Firewall stateless pada tingkat subnet. Membutuhkan aturan masuk dan keluar. Aturan dievaluasi dalam urutan numerik. Bab 15. Domain 1.

**NAT Gateway** — Memungkinkan instance di subnet pribadi untuk membuat koneksi keluar ke internet. Biaya $0.045/GB diproses. Bab 11, 30. Domain 4.

---

## O

**Object (S3)** — File yang disimpan di S3. Terdiri dari kunci (nama), nilai (data), dan metadata. Ukuran maksimum 5TB. Bab 5. Domain 3.

**On-Demand capacity (DynamoDB)** — Mode bayar sesuai permintaan. Lebih mahal per permintaan daripada provisioned, tetapi tidak diperlukan perencanaan kapasitas. Bab 29. Domain 4.

**On-Demand instances (EC2)** — Bayar per jam tanpa komitmen. Fleksibilitas maksimum, harga maksimum. Bab 27. Domain 4.

---

## P

**Partition key (DynamoDB)** — Komponen kunci utama yang menentukan partisi mana yang menyimpan item. Pilih kunci berardinalitas tinggi untuk distribusi yang merata. Bab 9. Domain 3.

**Permission boundary** — Kebijakan IAM yang menetapkan izin maksimum yang dapat dimiliki oleh identitas IAM, bahkan jika kebijakan lain memberikan lebih banyak. Bab 14. Domain 1.

**Placement group** — Mengontrol penempatan fisik instance EC2 untuk meminimalkan latensi (klaster) atau memaksimalkan ketersediaan (sebaran). Bab 4. Domain 3.

**PrivateLink** — Layanan AWS untuk membuat endpoint pribadi ke layanan yang di-host di AWS, dapat diakses melalui Interface Endpoints. Bab 30. Domain 1.

**Provisioned concurrency (Lambda)** — Lingkungan eksekusi yang telah diinisialisasi sebelumnya yang menghilangkan penundaan *cold start*. Bab 20. Domain 3.

**Provisioned capacity (DynamoDB)** — Throughput baca dan tulis yang telah dialokasikan sebelumnya, diukur dalam unit kapasitas per detik. Lebih murah daripada on-demand untuk lalu lintas yang dapat diprediksi. Bab 9, 29. Domain 4.

---

## R

**RDS (Relational Database Service)** — Layanan database relasional yang dikelola. Menangani pencadangan, patching, failover. Bab 8. Domain 3.

**RDS Proxy** — Mengelola kumpulan koneksi antara Lambda/aplikasi dan RDS, mencegah kehabisan koneksi. Bab 8. Domain 3.

**Read Replica (RDS)** — Salinan asinkron dari database untuk penskalaan baca. Tidak menyediakan failover otomatis. Bab 8, 24. Domain 3.

**Redis** — Penyimpanan data struktur dalam memori yang digunakan untuk caching, manajemen sesi, papan skor real-time, pub/sub. Bab 10. Domain 3.

**Reserved Instance (EC2)** — Komitmen untuk menggunakan jenis instance tertentu di wilayah tertentu selama 1 atau 3 tahun sebagai imbalan atas diskon. Bab 27. Domain 4.

**Route 53** — Layanan DNS AWS dan registrar domain. Mendukung beberapa kebijakan routing. Bab 12. Domain 2, 3.

**RPO (Recovery Point Objective)** — Kerugian data maksimum yang dapat diterima yang diukur dalam waktu. "Berapa banyak data yang dapat kita rugi?" Bab 18. Domain 2.

**RTO (Recovery Time Objective)** — Waktu maksimum yang dapat diterima untuk memulihkan layanan setelah kegagalan. "Berapa lama kita bisa mati?" Bab 18. Domain 2.

**Runbook** — Instruksi langkah demi langkah untuk mengoperasikan sistem, khususnya untuk respons insiden. "Apa yang dilakukan seseorang pada jam 3 pagi?" Bab 32. Domain lintas-domain.

---

## S

**S3 Intelligent-Tiering** — Secara otomatis memindahkan objek S3 antara tingkatan akses berdasarkan pola akses. Tidak ada biaya pengambilan. Bab 23. Domain 4.

**S3 Select** — Mengambil subset konten objek S3 menggunakan ekspresi SQL, mengurangi transfer data. Bab 30. Domain 4.

**Savings Plan** — Model harga fleksibel yang berkomitmen untuk jumlah jam pengeluaran hourly dalam imbalan diskon. Lebih fleksibel daripada Reserved Instances. Bab 27. Domain 4.

**SCP (Service Control Policy)** — Kebijakan AWS Organizations yang membatasi izin maksimum yang tersedia untuk akun dalam OU. Bab 14. Domain 1.

**Secrets Manager** — Menyimpan dan secara otomatis memutar rahasia (kata sandi database, kunci API). Bab 16. Domain 1.

**Security group** — Firewall virtual stateful pada tingkat instance. Aturan izinkan hanya; lalu lintas yang dikembalikan bersifat otomatis. Bab 15. Domain 1.

**Shard (Kinesis)** — Unit dasar throughput di Kinesis Data Streams: 1 MB/s tulis, 2 MB/s baca. Bab 26. Domain 3.
```

**Model Tanggung Jawab Bersama** — AWS bertanggung jawab atas keamanan *dari* cloud (infrastruktur); Anda bertanggung jawab atas keamanan *dalam* cloud (data, konfigurasi, akses). Bab 1. Domain 1.

**Shield** — Perlindungan DDoS. Standar: gratis, otomatis. Lanjutan: berbayar, dengan dukungan DRT dan perlindungan finansial. Bab 17. Domain 1.

**SNS (Simple Notification Service)** — Pub/sub messaging. Mengirim pesan ke semua pelanggan secara bersamaan. Pola *fan-out*. Bab 19. Domain 2.

**Sort key (DynamoDB)** — Komponen kedua opsional dari kunci utama. Memungkinkan kueri rentang dalam partisi. Bab 9. Domain 3.

**Spot Instances** — Instance EC2 menggunakan kapasitas cadangan dengan diskon 60-90%. Dapat terganggu dengan pemberitahuan 2 menit. Hanya untuk beban kerja yang toleran terhadap kesalahan. Bab 27. Domain 4.

**SQS (Simple Queue Service)** — Antrian pesan yang dikelola. Memisahkan produsen dari konsumen. Antrian Standar (setidaknya sekali) dan FIFO (tepat sekali). Bab 19. Domain 2.

**Step Functions** — Layanan orkestrasi alur kerja tanpa server. Mesin keadaan untuk mengoordinasikan layanan AWS. Bab 22. Domain 2.

---

## T

**Target tracking scaling** — Kebijakan Auto Scaling yang menyesuaikan kapasitas untuk mempertahankan nilai metrik target (misalnya, pemanfaatan CPU 60%). Bab 7. Domain 2.

**Transit Gateway** — Topologi jaringan *hub-and-spoke* yang menghubungkan beberapa VPC dan jaringan *on-premises* melalui gerbang pusat. Bab 25. Domain 3.

**TTL (Time to Live)** — Stempel waktu setelah mana DynamoDB secara otomatis menghapus item. Juga digunakan dalam DNS (berapa lama *resolver* menyimpan rekaman) dan caching (berapa lama nilai *cache* valid). Bab 9, 12. Domain 3.

---

## V

**VIF (Virtual Interface)** — Koneksi logis yang digunakan dengan AWS Direct Connect. VIF Publik mengakses titik akhir publik AWS; VIF Privat mengakses sumber daya VPC. Bab 25. Domain 3.

**Visibility timeout (SQS)** — Periode selama mana pesan yang diterima disembunyikan dari konsumen lain. Memungkinkan pemrosesan tanpa konsumen lain melihat pesan yang sama. Bab 19. Domain 2.

**VPC (Virtual Private Cloud)** — Jaringan virtual terisolasi di AWS. Berisi subnet, tabel rute, dan gerbang. Bab 11. Domain 1.

**VPC Endpoint** — Menghubungkan sumber daya VPC ke layanan AWS melalui jaringan pribadi AWS. Gerbang (gratis, S3/DynamoDB) dan Antarmuka (berbayar, sebagian besar layanan lainnya). Bab 30. Domain 1, 4.

**VPC Flow Logs** — Menangkap informasi tentang lalu lintas IP yang menuju dan keluar dari antarmuka jaringan di VPC. Digunakan oleh GuardDuty dan untuk pemecahan masalah jaringan. Bab 17. Domain 1.

**VPC Peering** — Koneksi jaringan antara dua VPC yang memungkinkan lalu lintas untuk dirutekan di antara mereka menggunakan alamat IP pribadi. Bab 11. Domain 3.

---

## W

**WAF (Web Application Firewall)** — Memfilter lalu lintas HTTP/HTTPS menggunakan aturan (blok IP, injeksi SQL, batas laju). Menempel pada CloudFront, ALB, atau API Gateway. Bab 17. Domain 1.

**Well-Architected Framework** — Kerangka evaluasi enam pilar AWS: Keunggulan Operasional, Keamanan, Keandalan, Efisiensi Kinerja, Optimalisasi Biaya, Keberlanjutan. Bab 31. Domain Silang.

**Weighted routing (Route 53)** — Mendistribusikan kueri DNS ke titik akhir berdasarkan bobot. Digunakan untuk penerapan biru-hijau dan A/B testing. Bab 12. Domain 3.

**Write-through caching** — Memperbarui *cache* setiap kali database diperbarui. Data selalu konsisten tetapi *cache* mungkin menyimpan banyak item yang tidak pernah dibaca kembali. Bab 10. Domain 3.

---

## SAA-C03 Quick Pattern Reference

| Jika ujian mengatakan...                           | Pikirkan...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Pisahkan layanan"                           | SQS, SNS, EventBridge                        |
| "Sebarkan ke banyak konsumen"               | SNS + Langganan SQS                      |
| "Acara terurut waktu nyata"                    | Kinesis Data Streams                         |
| "Tanpa server"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Latensi rendah global (dinamis)"                | Global Accelerator                           |
| "Latensi rendah global (statis/dikemukkan)"          | CloudFront                                   |
| "Perlindungan DDoS"                             | Shield (Standar: gratis; Lanjutan: berbayar)      |
| "Blokir injeksi SQL di tepi"                 | WAF                                          |
| "Deteksi kredensial yang terkompromi"           | GuardDuty                                    |
| "Audit aktivitas API"                          | CloudTrail                                   |
| "Putar kredensial database"                 | Secrets Manager                              |
| "Enkripsi data saat istirahat, kunci yang dikelola pelanggan" | KMS dengan CMK                                 |
| "Simpan nilai konfigurasi"                  | SSM Parameter Store                          |
| "Penyimpanan database IOPS tinggi"                  | io2 EBS                                      |
| "Sistem file bersama untuk EC2"                  | EFS                                          |
| "Tanyakan data S3 dengan SQL"                      | Athena                                       |
| "Pipa ETL untuk analitik"                  | AWS Glue                                     |
| "Sampaikan data streaming ke S3"                | Kinesis Firehose                             |
| "Pekerjaan batch toleran kesalahan, minimalkan biaya"    | Spot Instances                               |
| "Beban produksi yang berkomitmen, stabil"       | Savings Plans                                |
| "Subnet pribadi → S3 tanpa NAT"             | S3 Gateway Endpoint                          |
| "Subnet pribadi → SQS tanpa NAT"            | SQS Interface Endpoint                       |
| "Multi-AZ untuk RDS"                            | Failover otomatis (tidak penskalaan baca)        |
| "Replika baca untuk RDS"                        | Penskalaan baca (tidak failover otomatis)        |
| "Waktu pemulihan < 1 menit, lintas AZ"          | Multi-AZ                                     |
| "Pemulihan di seluruh wilayah, RTO menit"        | Pilot Light atau Standby Hangat                  |
| "Aktif-Aktif, tanpa RTO"                     | Multi-Region Aktif-Aktif (paling kompleks)    |
