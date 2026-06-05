# Bab 16: Kunci, Gembok, dan Rahasia

Leo sedang meninjau riwayat git ketika dia menemukannya. Kata sandi database. Disimpan enam bulan lalu, dalam teks biasa, oleh seseorang yang tidak lagi bekerja di Nimbus. Commit tersebut bersifat publik. Kata sandi tersebut telah diubah — tetapi mereka tidak yakin tentang hal itu. Mereka memeriksa setiap sistem yang pernah menyentuh kredensial tersebut. Itu memakan waktu empat jam. Hari itu Nimbus memutuskan untuk berhenti menempatkan rahasia dalam kode.

**Dua Masalah: Menyimpan Rahasia dan Mengenkripsi Data**

Keamanan seputar informasi sensitif memiliki dua masalah yang berbeda:

**Menyimpan kredensial** (kata sandi database, kunci API, string koneksi): Di mana mereka berada? Siapa yang dapat mengaksesnya? Bagaimana cara Anda memutarnya tanpa melakukan penyebaran ulang aplikasi Anda?

**Mengenkripsi data** (informasi pelanggan, catatan pembayaran, PII): Bagaimana Anda memastikan bahwa bahkan jika seseorang mendapatkan akses tidak sah ke database atau bucket S3 Anda, mereka tidak dapat membaca data tersebut?

AWS memiliki layanan khusus untuk setiap masalah:

- **AWS Secrets Manager**: Menyimpan dan mengelola kredensial dengan aman
- **AWS KMS (Key Management Service)**: Mengelola kunci enkripsi untuk mengenkripsi dan mendekripsi data

**AWS Secrets Manager: Tidak Ada Lagi Kredensial yang Dikodekan Secara Langsung**

Secrets Manager adalah penyimpanan rahasia yang aman: kredensial database, kunci API, token OAuth, kunci SSH, atau apa pun yang sensitif.

Alih-alih aplikasi Anda membaca kata sandi dari variabel lingkungan atau file konfigurasi, ia memanggil API Secrets Manager saat startup (atau saat dibutuhkan) dan mengambil rahasia. Rahasia tidak pernah menyentuh disk. Rahasia tidak pernah muncul dalam kode Anda. Rahasia tidak ada dalam variabel lingkungan Anda.

Berikut adalah tampilan alur kerjanya:

**Cara lama**:

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

```markdown
**Cara menggunakan Secrets Manager**:
```

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

The EC2 instance needs an IAM role with permission to call `secretsmanager:GetSecretValue` for that specific secret. No other service can read it. The secret is never in the code.

**Automatic Rotation: The Real Power**

The greatest feature of Secrets Manager isn’t storing secrets — it’s rotating them automatically.

Here’s the scenario: every 30 days, Secrets Manager generates a new database password, updates it in RDS, updates the stored secret, and your application retrieves the new password the next time it needs it. No manual intervention. No deployment. No “I need to remember to rotate this.”

The rotation is implemented as a Lambda function. AWS provides templates for RDS databases (MySQL, PostgreSQL, Aurora). You can customize the function for any credential type.

Tom had a question about cost. (Of course he did.)

Secrets Manager charges per secret per month plus per API call. For a small number of database passwords and API keys, the cost is dollars per month — negligible compared to the cost of an incident.

“The compromise last week,” Priya said, “what would it have cost to investigate and remediate?”

Tom was quiet for a moment. “Including my time, your time, Leo’s weekend... couple thousand dollars.”

“Secrets Manager would have caught the static key before it was exploited. And it would have rotated it automatically.”

Tom pulled up the pricing page.

**AWS KMS: The Lock Factory**

AWS KMS (Key Management Service) manages **cryptographic keys** — the secret values used to encrypt and decrypt data.

The analogy: KMS is like a lockbox company that holds the master key. Your data (the contents of the box) is encrypted. Only someone with permission to use the KMS key can decrypt it. KMS logs every use of every key in CloudTrail.

**Customer Master Keys (CMKs)** — now called KMS keys — come in two types:

**AWS managed keys**: AWS creates and manages the key automatically for services like S3, EBS, RDS. You don’t control the key directly, but you can see it’s being used. Free.

**Customer managed keys**: You create the key in KMS and control every aspect of it: who can use it, when it rotates, who can administer it. You can enable automatic annual rotation. Cost: $1/month per key plus per-API-call charges.

**Encryption in AWS Services: KMS Integration**

Most AWS services integrate with KMS for encryption:

**S3**: Enable “server-side encryption with KMS” on a bucket. Every object is encrypted at rest with a KMS key. Reading an object requires permission to both the S3 bucket *and* the KMS key.

**RDS**: Enable encryption at creation time. The database storage, backups, and snapshots are all encrypted with a KMS key. Note: encryption cannot be enabled on an existing unencrypted RDS instance — you must snapshot, copy the snapshot with encryption enabled, and restore.

**EBS**: Encrypt volumes with KMS. New volumes created from encrypted snapshots are automatically encrypted.

**DynamoDB**: Encryption at rest using KMS is enabled by default on all tables.

**ElastiCache Redis**: Encryption at rest with KMS for sensitive cached data.

The principle: data should be encrypted at rest (stored on disk) and in transit (moving across a network). KMS handles at-rest encryption. TLS/SSL (provided automatically by AWS services) handles in-transit encryption.

**Envelope Encryption: How KMS Actually Works**

Here’s a detail that helps you understand KMS behavior and exam questions.

KMS does not encrypt your data directly in most cases. It uses **envelope encryption**:

1. KMS generates a **data key** (a unique symmetric key)
2. The service uses the data key to encrypt your data locally (fast — symmetric encryption)
3. The service asks KMS to encrypt the data key (using your KMS key)
4. Both the encrypted data and the encrypted data key are stored
5. Your actual data never leaves the service — only the data key goes to KMS for encryption/decryption

When you read the data:

1. The service asks KMS to decrypt the data key
2. KMS checks permissions, decrypts the data key, returns it
3. The service uses the decrypted data key to decrypt your data locally

This means KMS can handle very large data without sending it all through the KMS API. Only small keys go to KMS. CloudTrail logs every KMS API call — every encrypt and decrypt operation.

**Secrets Manager vs Parameter Store**

AWS also has **Systems Manager Parameter Store**, which stores configuration values (not just secrets). Parameter Store is cheaper — free for standard parameters. It can also store encrypted parameters using KMS.

For secrets that need rotation: Secrets Manager.

For configuration values and non-sensitive parameters: Parameter Store (free tier is very generous).

For application configuration (port numbers, feature flags, environment-specific settings): Parameter Store.

## Strengths and Limitations

**AWS Secrets Manager**:

- Automatic secret rotation without code changes
- Fine-grained IAM access control per secret
- Versioning (access the previous version during rotation)
- Audit via CloudTrail
- Cost: ~$0.40/secret/month + API calls

**AWS KMS**:

- Manajemen kunci terpusat dengan jejak audit lengkap
- Rotasi kunci tahunan otomatis untuk kunci yang dikelola pelanggan
- Izin IAM terperinci per kunci (kebijakan kunci + kebijakan IAM)
- Modul Keamanan Perangkat Keras (HSM) yang didukung — kunci tidak pernah meninggalkan HSM
- Biaya: $1/bulan per kunci + $0,03 per 10.000 panggilan API

**Di mana hal ini menjadi rumit**:

- Kebijakan kunci KMS terpisah dari (dan dievaluasi bersamaan dengan) kebijakan IAM — bisa membingungkan untuk di-debug
- Enkripsi saat istirahat harus direncanakan — Anda tidak dapat mengenkripsi instance RDS yang tidak terenkripsi yang ada di tempat
- Penghapusan kunci dalam KMS memiliki periode tunggu 7-30 hari (mekanisme keselamatan — kunci yang hilang berarti data yang hilang)
- Biaya Secrets Manager meningkat seiring dengan jumlah rahasia dan panggilan API pada skala

## Ringkasan

- Jangan simpan kredensial dalam kode, variabel lingkungan, atau file konfigurasi yang dicadangkan dalam kontrol versi.
- **Secrets Manager** menyimpan kredensial dengan aman dan merotasi mereka secara otomatis. Aplikasi mengambil rahasia melalui API.
- **KMS** mengelola kunci enkripsi. Sebagian besar layanan AWS mengintegrasikan dengan KMS untuk enkripsi saat istirahat.
- **Enkripsi saat istirahat** (data yang disimpan di disk) menggunakan kunci KMS yang dikelola oleh AWS atau Anda. **Enkripsi dalam transit** menggunakan TLS.
- **Enkripsi amplop**: KMS mengenkripsi kunci, bukan data secara langsung. Layanan mengenkripsi data menggunakan kunci data lokal.
- **Kunci KMS yang dikelola pelanggan**: kendali penuh atas rotasi, akses, dan audit. **Kunci yang dikelola AWS**: otomatis, tidak perlu konfigurasi.
- **Parameter Store** adalah alternatif yang lebih ringan untuk Secrets Manager untuk nilai konfigurasi yang tidak sensitif.

## Tips Ujian

*Domain SAA-C03: Desain Arsitektur yang Aman (Domain 1, Tugas 1.3)*

- **Secrets Manager vs SSM Parameter Store**: Secrets Manager untuk kredensial yang memerlukan rotasi otomatis; Parameter Store untuk konfigurasi umum. Ujian membedakan mereka berdasarkan persyaratan rotasi dan sensitivitas biaya.
- **Kebijakan kunci KMS**: Kunci KMS memiliki kebijakan kuncinya sendiri (kebijakan berbasis sumber daya). Kebijakan IAM saja tidak memberikan akses ke kunci KMS — kebijakan kunci harus secara eksplisit mengizinkannya.
- **Enkripsi RDS**: Tidak dapat mengaktifkan enkripsi pada instance RDS yang tidak terenkripsi yang ada. Prosesnya: buat snapshot → salin snapshot dengan enkripsi diaktifkan → pulihkan dari snapshot yang dienkripsi → migrasikan lalu lintas ke instance baru.
- **Enkripsi EBS**: Volume baru dapat dienkripsi. Snapshot dari volume yang dienkripsi selalu dienkripsi. Volume yang tidak dienkripsi tidak dapat dienkripsi secara langsung — snapshot + salin + pulihkan.
- **CloudTrail + KMS**: Setiap panggilan API KMS dicatat dalam CloudTrail. Ini adalah fitur kepatuhan utama.
- **Kunci KMS multi-region**: Replikasi materi kunci ke beberapa wilayah sehingga dekripsi dapat terjadi tanpa panggilan API lintas-wilayah. Ujian menggunakan ini untuk pemulihan bencana multi-region dengan data yang dienkripsi.
- **KMS vs CloudHSM**: KMS bersifat multi-tenant (dikelola oleh AWS). CloudHSM adalah modul keamanan perangkat keras khusus yang hanya Anda kendalikan. Ujian menunjukkan: "FIPS 140-2 Level 3," "HSM khusus," "operasi kriptografi yang dikelola pelanggan" → CloudHSM.

## Latihan

**Latihan 1 — Ingat**

Jelaskan konsep enkripsi amplop. Mengapa KMS mengenkripsi kunci data kecil daripada mengenkripsi data aplikasi Anda secara langsung?

*(Petunjuk: Pikirkan apa yang terjadi jika Anda memiliki 1GB data untuk dienkripsi, dan apa implikasi kinerja mengirim 1GB ke layanan KMS jarak jauh.)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Perusahaan jasa keuangan menyimpan data pelanggan sensitif dalam database MySQL RDS. Persyaratan kepatuhan baru mengharuskan:

1. Semua data harus dienkripsi saat istirahat
2. Semua penggunaan kunci enkripsi harus dapat diaudit
3. Kunci enkripsi harus dikendalikan oleh pelanggan (tidak dikelola oleh AWS)
4. Kata sandi database harus dirotasi secara otomatis setiap 90 hari

Database dibuat enam bulan lalu tanpa enkripsi yang diaktifkan. Tindakan mana yang TERBAIK memenuhi keempat persyaratan?

A) Aktifkan RDS enkripsi pada database yang ada; buat kunci KMS yang dikelola pelanggan; konfigurasi Secrets Manager dengan rotasi 90 hari
B) Buat snapshot dari database yang ada; salin snapshot dengan enkripsi menggunakan kunci KMS yang dikelola pelanggan; pulihkan dari snapshot yang dienkripsi; konfigurasi Secrets Manager dengan rotasi 90 hari
C) Buat instance RDS baru yang dienkripsi dengan kunci yang dikelola AWS; migrasikan data dari instance lama; konfigurasi Secrets Manager dengan rotasi 90 hari
D) Aktifkan RDS enkripsi saat istirahat pada database yang ada menggunakan kunci yang dikelola AWS; konfigurasi Secrets Manager dengan rotasi 90 hari

**Petunjuk 1**: Anda tidak dapat mengaktifkan enkripsi pada instance RDS yang tidak terenkripsi yang ada secara langsung.

**Petunjuk 2**: "Dikendalikan pelanggan" berarti kunci yang dikelola pelanggan, bukan kunci yang dikelola AWS.

**Petunjuk 3**: Proses salinan snapshot adalah jalur migrasi standar ke RDS yang dienkripsi.

**Jawaban**: B

**Penjelasan**: Enkripsi RDS tidak dapat diaktifkan pada instance yang sudah ada. Pendekatan standar adalah: ambil *snapshot* dari instance yang ada → salin *snapshot* dengan enkripsi yang diaktifkan menggunakan kunci KMS yang dikelola pelanggan (memenuhi persyaratan 1, 2, dan 3) → pulihkan dari *snapshot* yang terenkripsi. Kunci KMS yang dikelola pelanggan secara otomatis mencatat semua penggunaan dalam CloudTrail (audit) dan menjaga kunci enkripsi di bawah kendali Anda. Secrets Manager menangani rotasi kata sandi otomatis 90 hari (memenuhi persyaratan 4).

**Mengapa Bukan A?** Anda tidak dapat mengaktifkan enkripsi pada instance RDS yang tidak terenkripsi secara *in-place*.

**Mengapa Bukan C?** Kunci yang dikelola AWS tidak memenuhi persyaratan "kendali pelanggan" (persyaratan 3).

**Mengapa Bukan D?** Masalah yang sama seperti A (tidak dapat diaktifkan *in-place*) ditambah kunci yang dikelola AWS tidak memenuhi persyaratan 3.

*SAA-C03 Domain: Desain Arsitektur Aman — Tugas 1.3*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus perlu menyimpan data sensitif berikut:

- Kata sandi database untuk instance RDS produksi
- Kunci rahasia API Stripe (digunakan untuk pemrosesan pembayaran)
- Kunci enkripsi simetris untuk mengenkripsi riwayat pesanan pelanggan di DynamoDB
- Nilai konfigurasi per restoran (endpoint API, bendera fitur — tidak sensitif)

Layanan AWS atau pendekatan mana yang akan Anda gunakan untuk masing-masing? Strategi rotasi apa yang akan Anda terapkan untuk masing-masing?

*(Tidak ada jawaban tunggal yang benar. Tujuannya adalah untuk berlatih mencocokkan alat keamanan dengan kasus penggunaan.)*

## Adegan Pasca-Kredit

Rahasia telah dimigrasikan.

Kata sandi database: Secrets Manager, berputar setiap 30 hari.

Kunci API: Secrets Manager, dengan rotasi Lambda yang memanggil API penyedia pembayaran untuk menghasilkan kunci baru.

Data pesanan pelanggan: dienkripsi dengan kunci KMS yang dikelola pelanggan.

Kredensial lama: dinonaktifkan. File konfigurasi lama: dihapus. Rahasia GitHub Actions: dihapus.

"Sekarang kami siap untuk audit," kata Priya.

"Definisikan 'siap untuk audit'," kata Maya.

"Jika seorang auditor kepatuhan bertanya kepada kami untuk membuktikan bahwa tidak ada kredensial yang dikodekan secara permanen dalam kode kami atau diekspos dalam infrastruktur kami, kami dapat menunjukkan kepada mereka: setiap rahasia berada di Secrets Manager, setiap kunci enkripsi berada di KMS, setiap akses dicatat dalam CloudTrail."

"Kapan terakhir kali seseorang memeriksa log CloudTrail?"

Jeda.

"Saya memeriksanya setiap minggu," kata Priya.

"Dan jika sesuatu yang tidak biasa muncul, bagaimana kita akan tahu?"

"Itu," kata Priya, menutup laptopnya, "adalah percakapan berikutnya."

Di bab berikutnya: tiga lapisan pertahanan yang memisahkan Nimbus dari internet.
