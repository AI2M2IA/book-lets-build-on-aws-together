# Bab 21: Kontainer Pengiriman untuk Kode

Sebelum tahun 1956, memuat kargo ke sebuah kapal adalah negosiasi yang terampil dan terspesialisasi. Setiap kapal memiliki palka yang berbeda. Setiap pelabuhan memiliki derek yang berbeda. Setiap pengangkut memiliki sistem yang berbeda untuk melacak apa yang dikirim ke mana. Sebuah peti barang berpindah dari truk ke dermaga ke kapal ke dermaga ke truk melalui rantai orang yang semuanya menanganinya secara berbeda. Kargo hilang. Kargo rusak. Barang yang sama, dikirim dua kali, tiba dalam kondisi berbeda karena penanganannya berbeda di kedua kali itu.

Jawabannya, ketika seseorang akhirnya menanyakannya dengan jelas, adalah: standardisasi kontainernya. Jangan selesaikan masalahnya di setiap pelabuhan. Selesaikan sekali, di tingkat kontainer. Kirim kotaknya, bukan hanya isinya.

Kontainer pengiriman yang terstandardisasi tidak hanya membuat pengiriman lebih cepat. Ia membuat pengiriman *dapat diprediksi*. Isi sebuah kontainer di Shanghai berada dalam kondisi persis sama ketika tiba di Rotterdam—karena kontainer melindunginya dari variabilitas di setiap titik transfer.

Itulah persis masalah yang sama yang dimiliki Leo. API Nimbus sedang "dimuat" secara berbeda di setiap "pelabuhan": staging di-deploy berbeda dari produksi, instans satu di-deploy berbeda dari instans tiga, dan enam minggu perubahan yang tidak terdokumentasi telah membuat armada itu tidak dapat diprediksi.

Kontainer tidak akan menjadikan Leo pengembang yang lebih cepat. Ia akan membuat deployment dapat diprediksi.

---

Migrasi Lambda telah mengurangi tagihan EC2 untuk layanan-layanan yang lebih kecil. Tetapi API inti berbeda—ia berjalan terus-menerus, mengangkut semua lalu lintas pesanan, dan telah mengakumulasi riwayat konfigurasi selama delapan bulan. Lambda menyelesaikan kemenganguran. Kontainer akan menyelesaikan inkonsistensi.

API inti tidak menganggur; ia tidak bisa pindah ke Lambda. Tetapi ia memiliki masalah berbeda: instans EC2 yang menjalankannya telah menyimpang satu sama lain.

---

Leo telah belajar untuk tidak mengucapkan "ini berjalan di mesin saya" dengan keras. Itu bukan pembelaan—itu adalah diagnosis. Dan diagnosis kali ini adalah instans EC2 produksi nomor tiga, yang telah menerima patch library enam minggu lalu yang tak seorang pun mendokumentasikannya, yang tidak diterima oleh dua instans lainnya, dan yang sekarang menyebabkan bug yang hanya ada di sana, di satu instans itu, tidak terlihat di mana pun.

Ia telah menghabiskan tiga jam malam sebelumnya untuk melacaknya.

"Setiap kali kita men-deploy," katanya keesokan paginya, "kita berkoordinasi di beberapa instans. Versi baru, dependensi berbeda. Berjalan di staging, rusak di produksi karena lingkungan telah menyimpang."

"Karena seseorang memperbarui sebuah paket di instans tiga tanpa memperbarui yang lain," kata Priya. Bukan dengan nada jahat.

"Saya butuh versi tertentu dari—"

"Saya tahu," katanya. "Dan sekarang instans tiga memiliki riwayat berbeda dari instans satu dan dua. Itu adalah configuration drift. Ia tenang sampai tidak lagi."

"Apa solusi sebenarnya?" tanya Maya.

"Berhenti memperlakukan server seperti hal permanen yang Anda konfigurasi," kata Priya. "Mulai perlakukan mereka seperti unit sekali pakai yang Anda ganti."

**Apa Itu Kontainer?**

"Pikirkan itu seperti kontainer pengiriman," kata Leo, mengambil spidol. "Kontainer tidak peduli kapal mana yang ditumpanginya. Kapal tidak peduli apa yang ada di dalam kontainer. Mereka menyepakati dimensi dan mekanisme penguncian. Segala yang lain ada di dalam kotak."

Sebuah **kontainer** adalah unit ringan dan portabel yang mengemas aplikasi Anda bersama dengan segala yang dibutuhkannya untuk berjalan: runtime (Python 3.11, Node.js 20, Java 17), library dan dependensi, file konfigurasi, dan kode aplikasi itu sendiri.

Tidak seperti mesin virtual (yang mengemulasi seluruh komputer, termasuk kernel sistem operasi), kontainer berbagi kernel OS host sambil menjaga segala yang lain tetap terisolasi. Ini membuat kontainer cepat dimulai (detik, kadang milidetik) dan kecil (megabyte, bukan gigabyte).

Teknologi kontainer paling populer adalah **Docker**. Sebuah Docker image adalah cetak biru—snapshot dari aplikasi dan lingkungannya. Sebuah Docker container adalah instans yang berjalan dari image itu.

Properti kuncinya: **imutabilitas**. Sebuah image yang dibangun hari ini akan berjalan identik di host mana pun yang mendukung Docker—laptop, instans EC2, server di pusat data berbeda. Lingkungan sudah dipanggang ke dalamnya. Configuration drift tidak mungkin.

"Jadi alih-alih khawatir tentang apa yang terinstal di instans EC2," kata Leo, "kita membangun sebuah image yang memiliki segalanya. Image itu berjalan dengan cara yang sama di mana-mana."

"Dan jika Anda perlu mengujinya secara lokal, Anda menjalankan image yang sama," tambah Priya. "Tidak ada lagi 'ini berjalan di mesin saya.'"

**Membangun Docker Image dan Mendorong ke ECR**

Sebelum orkestrator mana pun bisa mengelola kontainer, Leo harus membangunnya dan menyimpannya di suatu tempat yang bisa ditarik oleh ECS.

Ia menulis Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Baris kuncinya: `FROM python:3.11-slim`. Bukan Python 3.9. Bukan Python 3.10. 3.11—versi spesifik yang telah disepakati tim, dipanggang ke dalam image. Setiap instans yang menjalankan image ini akan menggunakan persis Python 3.11. Perilaku pembulatan modul decimal akan identik di mana-mana.

Ia membangun image secara lokal: `docker build -t nimbus-api:1.0.0 .`

Build memakan 4 menit. Docker menarik base image, menginstal dependensi, menyalin kode aplikasi, dan menghasilkan sebuah image yang diberi tag `nimbus-api:1.0.0`.

Ia menjalankannya secara lokal: `docker run -p 8000:8000 nimbus-api:1.0.0`

API mulai. Port yang sama, perilaku yang sama dengan server produksi—karena lingkungannya identik.

Lalu ia mendorongnya ke ECR:

```bash
# Autentikasi Docker ke ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Beri tag image untuk ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Dorong
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Push memakan 2 menit. ECR menyimpan image, langsung memicu pemindaian image, dan melaporkan hasil dalam 5 menit.

**Amazon ECS: Orkestrator**

Menjalankan satu kontainer itu sederhana. Menjalankan puluhan kontainer di beberapa host, merutekan lalu lintas di antaranya, memulai ulang kontainer yang gagal, men-deploy versi baru tanpa waktu henti—itu membutuhkan sebuah **orkestrator**.

**Amazon ECS (Elastic Container Service)** adalah layanan orkestrasi kontainer terkelola dari AWS. Anda mendefinisikan:

- **Task definition**: Image kontainer apa yang dijalankan, berapa banyak CPU dan memori, variabel lingkungan apa, port apa yang diekspos
- **Service**: Berapa banyak salinan task yang dijalankan, bagaimana menangani kegagalan dan deployment
- **Cluster**: Infrastruktur komputasi yang mendasarinya

ECS menangani sisanya: menempatkan task pada kapasitas yang tersedia, memulai ulang task yang gagal, menguras koneksi selama deployment, mendaftarkan task yang sehat ke load balancer.

Untuk Nimbus, API berpindah dari instans EC2 dengan deployment yang dikelola manual ke ECS. Setiap deployment baru mendorong Docker image baru ke **Amazon ECR (Elastic Container Registry)**—registry kontainer terkelola AWS—dan ECS meluncurkannya ke semua task tanpa waktu henti.

**Fargate vs Tipe Launch EC2**

ECS dapat menjalankan kontainer dalam dua mode:

**Tipe launch EC2**: Anda mengelola instans EC2 yang mendasarinya. Anda bertanggung jawab mem-patch instans, menyesuaikan ukurannya, dan memastikan ada cukup kapasitas untuk kontainer Anda. Kontrol lebih, tanggung jawab lebih.

**Fargate (komputasi serverless untuk kontainer)**: AWS mengelola infrastruktur yang mendasari sepenuhnya. Anda menentukan CPU dan memori per task; Fargate menyediakan kapasitas yang tepat secara otomatis. Tidak ada instans EC2 untuk dikelola. Anda membayar per vCPU-detik dan GB-detik memori.

Fargate adalah model "kontainer serverless"—Anda mendapatkan isolasi lingkungan dari kontainer tanpa mengelola server. Trade-off-nya: kontrol yang lebih sedikit atas konfigurasi instans yang mendasari dan biaya per-unit yang sedikit lebih tinggi.

"Berapa biayanya per bulan?" tanya Tom, memunculkan kalkulator harga. "Fargate versus tipe launch EC2—saya ingin melihat angka sebenarnya."

Perkiraan firasat Leo—yang dibawa-bawa semua orang—adalah bahwa Fargate akan berbiaya lebih. Kenyamanan serverless, harga premium. Ia menebak mungkin dua puluh atau tiga puluh persen di atas EC2.

"Hitung angka sebenarnya," kata Tom, karena itulah Tom.

Layanan API Nimbus menjalankan 3 task, masing-masing membutuhkan 0,5 vCPU dan 1GB memori, 24/7:

**Fargate**: $0,04048/vCPU-jam × 0,5 × 3 × 720 jam = $43,72/bulan untuk CPU. $0,004445/GB-jam × 1 × 3 × 720 = $9,60/bulan untuk memori. Total: $53,32/bulan.

**Tipe launch EC2** (3 × t3.medium pada $0,0416/jam): $0,0416 × 3 × 720 = $89,86/bulan.

"Tunggu," kata Tom. "Fargate lebih murah?"

"Pada ukuran ini, ya," kata Leo. "Fargate menagih persis untuk apa yang Anda alokasikan. Instans EC2 memiliki overhead—OS dan agen ECS mengonsumsi sebagian CPU dan memori bahkan sebelum kontainer Anda mulai. Sebuah t3.medium memberi 2 vCPU dan 4GB, tetapi Anda menggunakan 0,5 vCPU dan 1GB per kontainer. Sisanya terbuang."

"Tetapi tipe launch EC2 memungkinkan Anda mengemas beberapa task ke satu instans."

"Ya. Pada skala lebih besar, dengan bin-packing yang cermat, tipe launch EC2 menjadi lebih murah. Pada skala kita—tiga task—Fargate menang."

Tom mencatat ini.

Untuk Nimbus: Fargate untuk layanan API. Mereka tidak ingin mengelola instans EC2 untuk kontainer.

Jika Anda mengontainerkan dengan Fargate, Anda menghilangkan semua overhead manajemen EC2—tetapi Anda menyerahkan kemampuan menyesuaikan tipe instans, yang penting untuk beban kerja GPU atau jaringan khusus. Jika Anda memilih ECS untuk kesederhanaan AWS-native, Anda mendapatkan integrasi IAM dan ALB yang erat—tetapi Anda terkunci dari ekosistem Kubernetes, yang membutuhkan rearsitektur jika Anda nanti membutuhkan portabilitas multi-cloud.

**Amazon EKS: Ketika Anda Membutuhkan Kubernetes**

**Kubernetes** adalah sistem orkestrasi kontainer open-source—pada dasarnya standar industri untuk mengelola kontainer pada skala besar. Ia kuat, dapat diperluas, dan kompleks.

**Amazon EKS (Elastic Kubernetes Service)** adalah layanan Kubernetes terkelola AWS. Ia menjalankan control plane Kubernetes (lapisan manajemen) untuk Anda, sementara Anda mengelola worker node (atau menggunakan Fargate untuk itu juga).

Anda mungkin bertanya-tanya: jika Kubernetes adalah standar industri dan setiap lowongan kerja menyebutnya, mengapa kita tidak sekadar menggunakannya? Karena "standar industri" menggambarkan apa yang digunakan perusahaan besar dengan tim platform khusus. Untuk tim enam orang yang membangun aplikasi pemesanan makanan, Kubernetes menambah kompleksitas operasional tanpa manfaat praktis saat ini. Kompleksitasnya nyata; manfaatnya teoretis pada skala ini.

Kubernetes memberikan nilai pada tingkat kompleksitas yang tidak dibutuhkan kebanyakan tim: custom resource definition untuk membangun platform internal, batasan penjadwalan lanjutan, pod disruption budget untuk kontrol deployment yang halus, dan integrasi service mesh untuk manajemen lalu lintas antara ratusan microservice. Ini adalah kemampuan sejati. Mereka juga kemampuan yang tidak akan pernah dijalankan oleh startup seukuran Nimbus.

Prinsip rekayasa di sini kadang disebut YAGNI: You Aren't Gonna Need It (Anda Tidak Akan Membutuhkannya). ECS memberi Nimbus segala yang mereka butuhkan saat ini. EKS memberi mereka lebih dari yang mereka butuhkan, ditambah kurva belajar yang signifikan dan overhead operasional. "Ini akan berguna nanti" bukan alasan yang baik untuk menambah kompleksitas sekarang.

Kapan sebaiknya Anda menggunakan EKS vs ECS?

**Gunakan ECS** jika:

- Anda terutama di AWS dan menginginkan pengalaman yang lebih sederhana dan lebih AWS-native
- Tim Anda tidak memiliki keahlian Kubernetes yang ada
- Anda menginginkan overhead operasional yang lebih sedikit

**Gunakan EKS** jika:

- Anda membutuhkan fitur khusus Kubernetes (Custom Resource Definition, Helm chart, ekosistem Kubernetes)
- Tim Anda sudah mengenal Kubernetes
- Anda menjalankan lingkungan hybrid (sebagian on-premises, sebagian di AWS) dan menginginkan lapisan orkestrasi yang konsisten
- Beban kerja Anda memiliki persyaratan yang sesuai dengan ekstensibilitas Kubernetes

**Jaringan Kontainer: IP Ephemeral dan Penemuan Layanan**

Satu hal yang mengejutkan tim ketika beralih ke kontainer: alamat IP sebuah kontainer berubah setiap kali ia dimulai ulang.

Di dunia EC2, instans memiliki IP privat yang relatif stabil. Anda bisa (meskipun seharusnya tidak) men-hardcode mereka di file konfigurasi. Layanan saling mengenal melalui IP.

Di dunia kontainer, setiap task di ECS mendapat IP dari subnet VPC ketika ia mulai. Ketika ia berhenti dan task baru mulai (sebagai bagian dari deployment atau restart), task baru itu mendapat IP yang berbeda.

"Apa yang terjadi ketika sebuah layanan di-hardcode untuk memanggil `10.0.1.45` dan kontainer itu diganti dengan `10.0.1.82`?" tanya Priya. "Layanan yang memanggil mulai mengenai ketiadaan."

Inilah mengapa penemuan layanan (service discovery) penting di lingkungan kontainer. ECS + Application Load Balancer menangani ini secara otomatis: nama DNS ALB stabil; ECS mendaftarkan task yang sehat ke target group; ALB merutekan ke task mana pun yang saat ini sehat. Layanan yang memanggil berbicara dengan nama DNS ALB, bukan dengan IP kontainer individual.

Untuk komunikasi layanan-ke-layanan internal (bukan yang menghadap pengguna), **AWS Cloud Map** menyediakan penemuan layanan: setiap layanan ECS mendaftar ke Cloud Map, yang menyediakan nama DNS yang stabil. Layanan pesanan memanggil `http://notification.nimbus.local:8080`, dan Cloud Map me-resolve-nya ke task mana pun di layanan notifikasi yang saat ini sehat.

"Jadi kontainer saling berbicara melalui nama DNS, bukan IP?" Leo memastikan.

"Benar. IP bersifat ephemeral. Nama DNS adalah kontraknya."

**Injeksi Rahasia: Tidak Ada Rahasia di Variabel Lingkungan**

Deployment EC2 asli memiliki masalah yang sudah ditandai Priya selama berbulan-bulan: rahasia (kata sandi database, API key, kredensial SES) disimpan di variabel lingkungan pada instans EC2, diatur via skrip deployment.

Variabel lingkungan dapat diakses oleh proses apa pun yang berjalan di instans. Mereka muncul di alat debugging, di beberapa laporan crash, dan di daftar proses. Mereka juga terlihat di CloudWatch jika Anda mencatatnya (yang dilakukan beberapa alat pengembangan secara default).

Kontainer tidak menyelesaikan ini secara otomatis—Anda masih bisa meneruskan rahasia sebagai variabel lingkungan di task definition ECS. Dan task definition ECS disimpan di konsol AWS, terlihat oleh siapa pun dengan akses ECS.

Pola yang benar: **integrasi AWS Secrets Manager + task definition ECS**.

Alih-alih menyimpan kata sandi database di task definition:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS mengambil rahasia dari Secrets Manager pada waktu peluncuran task dan menyuntikkannya ke kontainer sebagai variabel lingkungan. Nilai rahasia tidak pernah disimpan di task definition—hanya ARN dari rahasia Secrets Manager. Kontainer menerima nilai saat runtime. Secrets Manager dapat merotasi nilai tanpa mengubah task definition.

"Dan jika seseorang membaca task definition?" tanya Priya. "Mereka akan melihat ARN Secrets Manager, tetapi bukan nilainya."

"Dan tanpa izin IAM yang tepat," Leo memastikan, "mereka tidak bisa mengambil nilai dari Secrets Manager juga."

"Itulah desainnya," kata Priya. "Peran eksekusi task memiliki izin untuk membaca rahasia spesifik itu. Tidak ada yang lain. Menyusupi task definition memberi Anda sebuah ARN, bukan kata sandi."

"Yang mana yang harus kita gunakan?" tanya Maya. "Dan mengapa bukan Kubernetes? Ia ada di setiap deskripsi pekerjaan. Setiap pembicaraan konferensi."

"ECS," kata Priya segera. "Kita tidak punya keahlian Kubernetes. ECS melakukan segala yang kita butuhkan. Menambahkan Kubernetes sekarang berarti menambah kompleksitas operasional tanpa manfaat praktis."

Soo-Jin, yang telah menjalankan klaster Kubernetes di perusahaannya yang terakhir, mengangguk. "Saya pernah membawa pager itu. Anda tidak menginginkannya sampai Anda membutuhkannya."

"Kita selalu bisa bermigrasi ke EKS nanti jika kita melampaui ECS," tambah Leo.

Ini adalah jawaban senior yang benar: pilih alat yang lebih sederhana yang sesuai dengan kebutuhan Anda saat ini.

**ECR: Mengamankan Image Anda**

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui base image yang rentan?" tanya Priya. "Seseorang mengambil image lama dengan CVE yang diketahui dan menggunakannya untuk mendapatkan pijakan di kontainer aplikasi?"

Itu adalah pertanyaan yang tepat untuk diajukan sebelum men-deploy kontainer mana pun di produksi.

**Amazon ECR (Elastic Container Registry)** menyimpan Docker image Anda dan dapat memindai mereka untuk kerentanan yang diketahui sebelum deployment. Pemindaian image ECR memeriksa image terhadap basis data CVE yang diketahui (Common Vulnerabilities and Exposures) dan menandai masalah berdasarkan tingkat keparahan.

Kebijakan yang ditulis Priya: tidak ada image dengan CVE tingkat keparahan CRITICAL yang akan di-deploy ke produksi. Pipeline CI/CD akan memeriksa hasil pemindaian sebelum memperbarui layanan ECS. Jika kerentanan kritis ditemukan, pipeline akan gagal dan memperingatkan tim.

"Itu bukan paranoia," kata Priya. "Itu hanya memiliki pemeriksaan sebelum Anda men-deploy."

**Bagaimana Kontainer Mengubah Deployment**

Sebelum kontainer, men-deploy versi baru API Nimbus berarti:

1. SSH ke setiap instans EC2
2. Tarik kode terbaru dari Git
3. Instal/perbarui dependensi
4. Mulai ulang proses aplikasi
5. Verifikasi kesehatan
6. Pindah ke instans berikutnya

Ini rawan kesalahan dan lambat. Ini membutuhkan koordinasi. Jika langkah 3 gagal di instans 4, Anda memiliki deployment campuran dengan beberapa instans menjalankan versi lama dan beberapa gagal menjalankan versi baru.

Dengan ECS dan kontainer:

1. Bangun Docker image baru (otomatis dalam pipeline CI/CD)
2. Dorong ke ECR
3. Perbarui layanan ECS untuk menggunakan versi image baru

ECS menangani rolling deployment: memulai task baru dengan image baru, menunggu mereka sehat, lalu menghentikan task lama. Deployment tanpa waktu henti, otomatis.

Jika versi baru gagal health check, ECS menghentikan deployment dan versi lama terus melayani lalu lintas.

**Konfigurasi Minimum Deployment: Health Check**

Seluruh keamanan deployment kontainer bergantung pada health check yang benar-benar bekerja.

ECS menggunakan dua jenis health check:

**Health check tingkat kontainer**: Didefinisikan di Dockerfile atau task definition. Berjalan di dalam kontainer untuk memverifikasi aplikasi merespons.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Health check target group ALB**: Load balancer secara berkala mengirim permintaan HTTP ke endpoint kesehatan. Task yang gagal health check dihapus dari target group.

Jika tidak ada health check yang dikonfigurasi dengan benar, ECS menganggap setiap task sehat—dan akan men-deploy image yang rusak tanpa berhenti. Ini adalah kesalahan deployment kontainer yang paling umum.

"Bisakah endpoint health check membocorkan informasi internal?" tanya Priya.

Endpoint health check di `/health` hanya mengembalikan: `{"status": "ok"}`. Tidak ada nomor versi, tidak ada status dependensi, tidak ada konfigurasi internal. Informasi apa pun dalam respons kesehatan bisa berguna bagi seseorang yang memetakan aplikasi. Jaga endpoint kesehatan tetap minimal.

Untuk status kesehatan internal yang detail (konektivitas database, pemeriksaan dependensi), gunakan endpoint `/health/detail` terpisah yang terautentikasi—dapat diakses hanya dari dalam VPC.

**Logging Terstruktur: Satu-Satunya Jendela ke Kontainer yang Berjalan**

Di EC2, sesuatu berjalan salah dan Anda SSH masuk. Anda meng-tail file log. Anda melihat tabel proses. Anda memeriksa penggunaan disk. Anda mencari-cari.

Di sebuah kontainer, tidak ada SSH. Kontainer bersifat ephemeral—ia mungkin berjalan di host mana pun di klaster, dan ECS akan menggantinya tanpa peringatan jika ia gagal health check. Pada saat Anda berpikir untuk SSH masuk, kontainer yang ingin Anda periksa mungkin sudah tidak ada lagi.

Log bukan kenyamanan debugging di lingkungan terkontainer. Mereka adalah satu-satunya bukti bahwa sesuatu terjadi.

"Dan bagaimana jika sebuah kontainer gagal secara diam-diam dan kita tidak punya log?" tanya Priya selama tinjauan arsitektur kontainer. "Kita bisa punya task yang keluar dengan kode 1 dan tidak pernah tahu penyebabnya jika log tidak ditangkap sebelum ia berhenti."

Ini bukan hipotetis. Ia terjadi pada deployment kontainer pertama, secara konsisten.

Pola yang benar: konfigurasikan setiap kontainer untuk mengirim log terstruktur ke **Amazon CloudWatch Logs** menggunakan driver log `awslogs`. ECS menangani pengirimannya secara otomatis—tidak ada agen log untuk diinstal, tidak ada kontainer sidecar yang dibutuhkan.

Dalam task definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Setiap baris yang ditulis ke stdout atau stderr di dalam kontainer ditangkap dan dikirim ke log group `/ecs/nimbus-api`, diorganisasi berdasarkan ID task. ECS membuat log stream baru untuk setiap task, sehingga Anda dapat menemukan log untuk kontainer spesifik yang gagal—bahkan setelah ia diganti.

Peran eksekusi task membutuhkan izin untuk menulis ke CloudWatch Logs. Tanpanya, driver log gagal secara diam-diam dan semua keluaran log hilang.

**Log terstruktur vs teks biasa**: Log teks biasa ("Order 7741 placed") membutuhkan grep. Log JSON terstruktur (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) dapat dikueri dengan CloudWatch Logs Insights menggunakan sintaks yang menyerupai SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Kueri itu berjalan langsung terhadap log group. Tanpa database. Tanpa data pipeline. Tanpa pekerjaan ETL. Jawabannya ada di sana dalam hitungan detik.

Ini tidak menggantikan data lake analitik yang akan kita bangun di bab 26. Ini menjawab pertanyaan operasional—"berapa banyak pesanan dari restoran 47 dalam 30 menit terakhir?"—di tengah insiden, ketika Anda tidak punya waktu untuk menjalankan kueri Athena.

**CloudWatch Container Insights**

**Container Insights** adalah fitur CloudWatch yang mengumpulkan dan mengagregasi metrik tingkat kontainer—CPU, memori, I/O jaringan, I/O penyimpanan—per klaster, layanan, dan task ECS. Alih-alih metrik tingkat EC2 (bagaimana keadaan host?), Anda melihat metrik tingkat task (bagaimana keadaan layanan ECS spesifik ini?).

Aktifkan dengan satu pengaturan pada klaster ECS:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Setelah mengaktifkan:

- Anda melihat dasbor per layanan: jumlah task, utilisasi CPU, utilisasi memori
- Anda dapat memasang alarm pada CPU tingkat task (alih-alih CPU host EC2, yang merupakan sinyal yang jauh lebih kasar)
- Anda dapat mengorelasikan lonjakan memori dengan kejadian log—memori task naik ke 95% pada 14:22; log menunjukkan lonjakan permintaan masuk dari impor menu restoran 47 persis pada 14:21

"Berapa biayanya per bulan?" tanya Tom.

Container Insights menagih untuk metrik kustom dan penyimpanan log yang ia hasilkan. Pada skala Nimbus (tiga layanan, 3-6 task masing-masing), ini kira-kira $12/bulan—pertukaran yang masuk akal untuk visibilitas operasional tingkat task.

Leo mengaktifkannya pada hari yang sama.

Pertama kali sebuah task gagal health check dan diganti oleh ECS, dasbor Container Insights menangkap kejadiannya secara otomatis: ID task, waktu mulai, waktu kegagalan, kode keluar. Log stream CloudWatch untuk task itu mempertahankan 40 baris keluaran terakhir sebelum penghentian—yang menunjukkan pengecualian tak tertangani yang dipicu oleh JSON menu yang cacat dari mitra restoran baru.

Tanpa Container Insights dan logging terstruktur: lonjakan misterius pada tingkat kesalahan, investigasi membutuhkan SSH ke host yang tidak lagi menjalankan task yang gagal, 45 menit tebakan.

Dengan mereka: tautan log stream di dasbor CloudWatch, pengecualian yang tepat, ID restoran, field yang bermasalah—dalam waktu di bawah lima menit.

"Tanpa SSH," kata Leo, meninjau post-mortem. "Tanpa waktu henti untuk menginvestigasi. Log yang melakukan pekerjaannya."

"Log hanya melakukan pekerjaannya," kata Priya, "jika Anda mengonfigurasinya untuk ditangkap."


**Kapan Kontainer Adalah Pilihan yang Salah**

"Tunggu—tapi *mengapa* kita tidak mengontainerkan segalanya?" tanya Maya. "Anda baru saja meyakinkan saya bahwa kontainer menyelesaikan semua masalah configuration drift. Mengapa tidak menjalankan setiap layanan sebagai kontainer?"

Itu pertanyaan yang sama yang ia tanyakan tentang Lambda. Jawabannya serupa.

Kontainer menambah persyaratan operasional: Anda membutuhkan registry kontainer (ECR), pipeline CI/CD yang membangun dan mendorong image, sebuah orkestrator (ECS), pemantauan yang dikonfigurasi untuk visibilitas tingkat-task alih-alih tingkat-instans, dan tim yang memahami Docker dan pemversian image.

Untuk layanan yang sudah bekerja dengan baik di EC2, stabil, dan tidak menderita configuration drift, biaya mengontainerkannya mungkin melebihi manfaatnya.

Kasus spesifik di mana kontainer adalah pilihan yang salah:

**Layanan stateful yang tidak dibangun untuk mobilitas kontainer**: Database dalam kontainer membutuhkan manajemen volume persisten yang cermat. Kebanyakan tim yang menjalankan database dalam kontainer akhirnya memindahkannya kembali ke layanan terkelola (RDS, ElastiCache) setelah menghadapi kompleksitas ini.

**Layanan dengan persyaratan perangkat keras khusus**: Beban kerja GPU, konfigurasi antarmuka jaringan tertentu, atau pemrosesan berbasis FPGA membutuhkan instans EC2 dengan perangkat keras tertentu. Kontainer tidak mengubah ini—Anda tetap menggunakan tipe launch EC2, hanya dengan kontainer di atasnya, dan abstraksi kontainer menambah kompleksitas tanpa manfaat.

**Skrip dan pekerjaan yang sangat sederhana**: Skrip Python 40 baris yang berjalan seminggu sekali dan tidak memiliki masalah drift dependensi. Menambahkan Docker, ECR, task definition ECS, dan pipeline CI/CD untuk ini tidak proporsional. Lambda lebih sederhana. Cron job EC2 biasa mungkin lebih sederhana lagi.

"Prinsipnya," kata Leo, "sama seperti selalu: cocokkan alat dengan masalah. Kontainer menyelesaikan configuration drift dan konsistensi deployment. Jika Anda tidak punya masalah itu, Anda tidak membutuhkan kontainer."

## AWS Batch: Kontainer untuk Pekerjaan Skala Besar

ECS dan EKS dirancang untuk layanan berdurasi panjang—aplikasi yang berjalan terus-menerus, menerima permintaan, dan menskala dengan lalu lintas. Tetapi beberapa beban kerja berbeda: mereka berjalan untuk durasi tetap, memproses dataset yang ditentukan, lalu berhenti. Menghasilkan faktur akhir bulan untuk ratusan restoran. Menjalankan pekerjaan pelatihan machine learning. Memproses ekspor analitik malam.

Untuk beban kerja ini, Anda tidak ingin sebuah layanan—Anda ingin sebuah pekerjaan (job).

**AWS Batch** adalah layanan yang sepenuhnya terkelola yang menjalankan pekerjaan komputasi batch pada skala apa pun. Anda mendefinisikan pekerjaan Anda sebagai Docker container (format kontainer yang sama yang digunakan ECS), dan Batch menangani sisanya: menyediakan komputasi EC2 atau Fargate, menjadwalkan pekerjaan ke dalam antrian, menskala kapasitas naik ketika pekerjaan tiba dan kembali ke nol ketika selesai.

Konsep kunci:

- **Job definition:** Docker container, persyaratan resource (vCPU, memori), dan perintah untuk dijalankan
- **Job queue:** tempat pekerjaan yang dikirim menunggu sebelum berjalan; setiap antrian dikaitkan dengan satu atau lebih compute environment
- **Compute environment:** kapasitas EC2 atau Fargate yang mendasari. Dapat menggunakan Spot Instance untuk penghematan biaya hingga 90%—Batch menangani interupsi dan percobaan ulang secara otomatis

"Tunggu—tapi *mengapa* kita menggunakan Batch alih-alih sekadar menjalankan task ECS?" tanya Maya.

"Karena layanan ECS selalu menyala," kata Leo. "Ia menunggu permintaan. Pekerjaan Batch berjalan, selesai, dan Batch menskala komputasi kembali ke nol. Anda tidak membayar apa pun di antara percobaan."

Tom mendongak dari halaman harga. "Dan Spot Instance?"

"Batch bisa berjalan di Spot. Jika Spot Instance direklamasi di tengah pekerjaan, Batch mencoba ulang secara otomatis. Untuk pekerjaan faktur 45 menit, itu baik-baik saja."

**vs. ECS/EKS:** ECS/EKS menjalankan layanan—selalu menyala, digerakkan oleh permintaan. Batch menjalankan pekerjaan—durasi terbatas, digerakkan oleh data, menskala ke nol saat menganggur.

**vs. Lambda:** Lambda memiliki timeout 15 menit. Pekerjaan Batch dapat berjalan berjam-jam atau berhari-hari.

Konteks Nimbus: pekerjaan pembuatan faktur malam memakan 45 menit untuk ratusan mitra restoran. Lambda timeout pada 15 menit. Layanan ECS yang selalu menyala membuang uang 23 jam sehari. Batch menjalankan pekerjaan pada Spot Instance, selesai dalam 38 menit, berbiaya $1,20, dan dimatikan.

"Itu lebih murah daripada kopi yang saya beli sambil menunggu skrip lama selesai," kata Leo.

"Dan tidak ada EC2 untuk dikelola," tambah Priya. "Batch menyediakannya, menjalankannya, menghentikannya."

## Kekuatan dan Keterbatasan

**Kontainer**:

- Menghilangkan inkonsistensi lingkungan ("berjalan di mesin saya")
- Memungkinkan deployment yang cepat dan andal
- Imutabel—image yang sama berjalan identik di mana-mana
- Efisien—lebih ringan dari VM, startup lebih cepat

**ECS**:

- Lebih sederhana dari Kubernetes untuk beban kerja yang berpusat pada AWS
- Integrasi AWS yang erat (IAM, ALB, CloudWatch, Secrets Manager)
- Opsi Fargate menghilangkan manajemen EC2 sepenuhnya

**EKS**:

- Kompatibilitas Kubernetes penuh—gunakan seluruh ekosistem
- Lebih baik untuk lingkungan hybrid atau tim dengan keahlian Kubernetes
- Lebih kompleks untuk disiapkan dan dioperasikan daripada ECS

**Di mana hal ini menjadi rumit**:

- Image kontainer harus dibangun dan diberi versi—membutuhkan pipeline CI/CD
- Men-debug kontainer membutuhkan perangkat berbeda dari men-debug proses tradisional
- Kontainer stateful (database dalam kontainer) membutuhkan konfigurasi penyimpanan persisten yang cermat
- Jaringan antar-kontainer (komunikasi layanan-ke-layanan) membutuhkan pemahaman konsep jaringan kontainer

## Ringkasan

Lambda membuat komputasi menganggur gratis. Kontainer membuat deployment deterministik. Bersama-sama, mereka menyelesaikan dua penyebab paling umum dari kesakitan operasional bagi tim rekayasa yang berkembang.

- **Kontainer** mengemas kode aplikasi, runtime, dan dependensi bersama—berjalan identik di mana saja.
- **Docker** adalah teknologi kontainer standar. Image adalah cetak biru; kontainer adalah instans yang berjalan.
- **ECR (Elastic Container Registry)** adalah registry Docker terkelola AWS—simpan, beri versi, dan pindai image Anda di sini. Aktifkan pemindaian image untuk menangkap CVE sebelum deployment.
- **ECS (Elastic Container Service)** mengorkestrasi kontainer. Anda mendefinisikan task dan service; ECS mengelola penempatan dan siklus hidup.
- **Fargate** adalah komputasi serverless untuk kontainer—tidak ada instans EC2 untuk dikelola. Seringkali lebih murah dari tipe launch EC2 pada skala kecil karena penghapusan overhead EC2. Pada skala lebih besar dengan bin-packing task yang cermat, tipe launch EC2 bisa menjadi lebih hemat biaya.
- **EKS (Elastic Kubernetes Service)** adalah Kubernetes terkelola—untuk tim yang membutuhkan fitur atau kompatibilitas Kubernetes.
- **Integrasi Secrets Manager**: suntikkan rahasia ke kontainer pada waktu peluncuran via task definition—jangan simpan nilai rahasia di variabel lingkungan atau task definition secara langsung.
- **Penemuan layanan**: IP kontainer bersifat ephemeral. Gunakan nama DNS ALB atau Cloud Map untuk pengalamatan layanan yang stabil.
- Pilih ECS untuk kesederhanaan di AWS; pilih EKS untuk kompatibilitas ekosistem Kubernetes.

## Tips Ujian

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Sinyal ECS vs EKS**: Skenario ujian yang menyebut "Kubernetes," "Helm," "keahlian Kubernetes yang sudah ada," atau "orkestrasi kontainer multi-cloud" → EKS. Segala yang lain → ECS.
- **Fargate vs tipe launch EC2**: "Tidak ingin mengelola instans EC2 untuk kontainer," "kontainer serverless," "tanpa manajemen infrastruktur" → Fargate. "Membutuhkan tipe instans tertentu," "beban kerja GPU," "kontrol instans yang halus" → tipe launch EC2.
- **Task role vs. task execution role**—pembeda ujian yang nyata. **Task execution role** digunakan oleh *agen* ECS atas nama task, sebelum dan di sekitar kode Anda: menarik image dari ECR, mengambil rahasia dari Secrets Manager, menulis log ke CloudWatch. **Task role** adalah apa yang digunakan *kode aplikasi Anda di dalam kontainer* untuk memanggil layanan AWS: membaca dari S3, menulis ke DynamoDB—seperti peran instans EC2, tetapi per task, sehingga setiap task bisa memiliki izin berbeda. "Kontainer perlu membaca dari S3" → **task role** (dilampirkan di task definition). "Task gagal menarik image-nya / tidak bisa mengambil rahasianya" → **execution role** kekurangan izin.
- **Fargate Spot**: jalankan kontainer yang toleran kegagalan pada kapasitas cadangan hingga ~70% lebih murah, dengan peringatan interupsi dua menit—setara Fargate dari EC2 Spot, dikonfigurasi via capacity provider. Pemicu ujian: "jalankan kontainer yang toleran interupsi dengan biaya terendah tanpa mengelola instans" → Fargate Spot.
- **Pemindaian image ECR**: ECR dapat memindai image kontainer untuk kerentanan yang diketahui (CVE). Sinyal ujian: "pindai kontainer untuk kerentanan keamanan" → pemindaian image ECR.
- **Deployment blue/green**: ECS mendukung deployment blue/green via integrasi CodeDeploy. Deployment tanpa waktu henti dengan rollback otomatis. Pola ujian: "deploy tanpa waktu henti dengan rollback otomatis" → ECS + CodeDeploy blue/green.
- **Integrasi Secrets Manager**: Sinyal ujian: "suntikkan rahasia ke kontainer tanpa menyimpan nilai di task definition" → gunakan field `secrets` di task definition yang merujuk ke ARN Secrets Manager. Task execution role membutuhkan izin `secretsmanager:GetSecretValue`.
- **ECS Service Auto Scaling**: Skalakan jumlah task berdasarkan CPU, memori, atau metrik CloudWatch kustom. Bekerja dengan ALB untuk merutekan lalu lintas ke jumlah task berjalan yang tepat.
- **AWS Batch:** Komputasi batch terkelola untuk Docker container. Job queue → compute environment (EC2 atau Fargate, mendukung Spot). Gunakan ketika: timeout Lambda terlalu pendek, layanan ECS boros untuk pekerjaan terbatas. Pemicu ujian: "pemrosesan batch skala besar" atau "pekerjaan yang berjalan berjam-jam" → AWS Batch.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan perbedaan antara Docker image dan Docker container. Jelaskan perbedaan antara ECS dan ECR.

*(Petunjuk: Image bagi kontainer seperti resep bagi hidangan yang sudah dimasak. ECR menyimpan image; ECS menjalankannya.)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan memiliki aplikasi microservices yang saat ini berjalan di instans EC2 yang dikelola secara manual. Tim kesulitan dengan deployment yang tidak konsisten—instans EC2 yang berbeda memiliki versi library yang berbeda, menyebabkan bug yang sulit direproduksi. Mereka ingin menstandardisasi deployment sambil meminimalkan overhead operasional untuk mengelola server yang mendasari. Tim tidak memiliki pengalaman Kubernetes.

Solusi mana yang PALING memenuhi persyaratan ini?

A) Kontainerkan aplikasi dengan Docker; gunakan Amazon ECS dengan tipe launch Fargate  
B) Deploy di EC2 dengan AWS Systems Manager Patch Manager untuk menjaga instans konsisten  
C) Kontainerkan aplikasi dengan Docker; gunakan Amazon EKS dengan self-managed node group  
D) Gunakan AWS Elastic Beanstalk untuk mengelola deployment dan konfigurasi instans secara otomatis

**Petunjuk 1**: Kontainer menyelesaikan masalah "lingkungan tidak konsisten" secara langsung. Opsi mana yang menggunakan kontainer?

**Petunjuk 2**: "Minimalkan overhead operasional untuk mengelola server" → Fargate (tanpa manajemen EC2) vs node yang dikelola sendiri (masih mengelola EC2).

**Petunjuk 3**: "Tanpa pengalaman Kubernetes" → EKS adalah kompleksitas operasional yang lebih dari ECS.

**Jawaban**: A

**Penjelasan**: Mengontainerkan dengan Docker memastikan setiap deployment menggunakan image yang sama dengan dependensi yang sama—menghilangkan configuration drift. ECS dengan Fargate berarti tidak ada instans EC2 untuk dikelola. Tim fokus pada kode aplikasi dan definisi kontainer, bukan pemeliharaan server. ECS (bukan EKS) sesuai untuk tim tanpa pengalaman Kubernetes.

**Mengapa bukan B?** Patch Manager menjaga instans EC2 tetap diperbarui tetapi tidak menyelesaikan inkonsistensi versi library antar-aplikasi. Masalah mendasar (lingkungan kode berbeda di instans berbeda) tetap ada.

**Mengapa bukan C?** EKS dengan self-managed node group membutuhkan pengelolaan instans EC2 *dan* mempelajari Kubernetes. Keduanya tidak sejalan dengan persyaratan.

**Mengapa bukan D?** Elastic Beanstalk mengelola deployment aplikasi di EC2 tetapi tidak menyelesaikan inkonsistensi lingkungan mendasar kecuali kontainer digunakan. Beanstalk tidak menggunakan Docker image secara default (meskipun dapat dikonfigurasi untuk itu).

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus memecah API monolitik menjadi tiga microservice: layanan pesanan, layanan menu, dan layanan notifikasi. Setiap layanan memiliki persyaratan penskalaan yang berbeda (layanan pesanan menskala dengan lalu lintas; layanan menu sebagian besar read-only dan stabil; layanan notifikasi memiliki lonjakan yang melonjak).

Rancang arsitektur ECS untuk ketiga layanan ini. Bagaimana Anda akan menangani komunikasi layanan-ke-layanan? Apakah Anda akan menggunakan satu klaster ECS atau tiga? Bagaimana Anda akan mengonfigurasi Auto Scaling secara berbeda untuk setiap layanan?

Pertimbangkan: layanan menu sangat berat-baca dan bisa menyajikan data basi selama 60 detik—apakah Anda akan menambahkan caching di depannya? Layanan notifikasi melonjak berat pada Jumat malam—apakah Anda akan mengatur kapasitas Min Fargate ke 1 dan Max ke 20? Apa yang terjadi pada notifikasi yang sedang berjalan selama kejadian scale-down?

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih arsitektur microservices di ECS.)*

## Adegan Pasca Kredit

Deployment kontainer pertama berjalan sempurna.

Versi baru API: tanpa waktu henti. ECS meluncurkannya, health check lolos, task lama dikuras, task baru mengambil alih. Leo menonton status task di konsol dengan sesuatu yang mendekati ketidakpercayaan.

"Itu langsung berfungsi," katanya.

"Minggu lalu kamu mengatakan hal yang sama tentang deploy SSH manual sebelum ia gagal di instans tiga," kata Priya.

"Saya sudah men-deploy-nya—oh." Leo berhenti. "Saya men-deploy tanpa memberi tag versi image. Biar saya perbaiki itu."

"Itulah intinya," kata Priya. "Pemversian image adalah cara Anda melacak apa yang berjalan."

"Bagaimana Anda tahu versi apa yang ada di produksi sekarang?" tanya Maya.

Leo memunculkan konsol ECS. Di bawah task yang berjalan, image-nya tercantum: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Versi 1.0.3. Dibangun pada 14:22 UTC. Di-deploy pada 14:31 UTC.

"Pada setup EC2 lama," kata Leo, "saya harus SSH ke sebuah instans dan menjalankan `pip show` untuk melihat versi apa dari setiap dependensi yang terinstal. Dan itu mungkin berbeda di instans lain."

"Dan sekarang?"

"Tag pada image memberi tahu saya persis apa yang berjalan. Riwayat pemindaian ECR memberi tahu saya apakah ia telah dipindai. Riwayat deployment ECS memberi tahu saya kapan ia di-deploy dan apa versi sebelumnya."

"Tanpa SSH. Tanpa waktu henti. Tanpa 'tunggu sampai ia restart.'"

"Image adalah artefak deployment," kata Priya. "Lingkungan imutabel. Proses deployment deklaratif. Beginilah seharusnya perangkat lunak dikirim."

Leo menatap konsol sejenak lagi.

"Saya menghabiskan tiga tahun mengoordinasikan deployment EC2," katanya. "Mengoordinasikan skrip SSH. Menulis runbook deployment."

"Anda sedang menyelesaikan masalah," kata Priya, "yang diselesaikan kontainer secara desain."

Ia tidak mengatakan apa pun setelah itu. Tetapi keesokan paginya, ia mulai menulis dokumentasi tentang proses build kontainer, agar tak seorang pun lagi harus menghabiskan tiga tahun untuk memahaminya.

Bug instans-tiga, enam minggu drift tak terdokumentasi, dan masalah-masalah seperti itu yang belum mereka tangkap—semuanya memiliki satu akar penyebab. Bukan aktor jahat. Bukan kegagalan perangkat keras. Hanya sebuah server yang telah diperlakukan seperti perlengkapan permanen alih-alih unit sekali pakai.

Kontainer adalah jawaban untuk itu. Bukan karena ia baru dan menarik. Karena ia membuat pertanyaan itu mustahil untuk diajukan.

Pada bab berikutnya: diagram alur yang menjalankan dirinya sendiri—dan mengingat di mana ia berhenti.
