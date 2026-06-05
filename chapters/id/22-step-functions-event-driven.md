# Bab 22: Diagram Alur yang Menjalankan Dirinya Sendiri

Konfirmasi pesanan di Nimbus membutuhkan lima hal yang terjadi secara berurutan: menagih kartu, mengirim email konfirmasi, memberi tahu restoran, memperbarui inventaris, dan mencatat transaksi untuk akuntansi. Jika langkah ketiga gagal — jika notifikasi restoran timeout — langkah satu dan dua sudah terjadi. Pelanggan sudah ditagih. Email sudah dikirim. Tetapi restoran tidak tahu pesanan itu ada.

Leo memiliki nama untuk kategori bug ini: keberhasilan parsial. "Semuanya berhasil," katanya, "kecuali bagian yang penting."

"Berapa kali ini terjadi?" tanya Maya.

"Sebelas kali dalam dua minggu terakhir. Kita berhasil menangkap sebagian besar dari panggilan marah ke restoran. Dua kita temukan di log, setelah kejadian."

"Jadi kita tidak memiliki koordinasi," kata Priya. "Lima langkah, berjalan sebagai skrip, tanpa jaminan semuanya selesai."

"Atau bahwa mereka selesai dalam urutan yang benar."

"Atau bahwa kita tahu mana yang gagal."

Leo menampilkan kode di proyektor. Itu adalah fungsi Python: lima puluh baris, lima panggilan API berurutan, satu blok try/except di sekeliling semuanya. "Jika ada yang di sini melempar exception, kita mendapat 500 dan pelanggan melihat error. Tetapi tagihan dan email tidak bisa di-rollback."

"Kita membutuhkan sebuah workflow," kata Maya. "Sesuatu yang melacak setiap langkah."

**AWS Step Functions: Mengorkestrasikan Workflow**

**AWS Step Functions** adalah layanan orkestrasi serverless yang mengkoordinasikan langkah-langkah aplikasi sebagai visual workflow. Setiap langkah adalah sebuah **state** dalam sebuah **state machine**.

Alih-alih skrip Python yang berjalan dari atas ke bawah dan crash, kamu mendefinisikan workflow sebagai state machine JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Setiap state dapat:

- **Menjalankan fungsi Lambda** (pola paling umum)
- **Menjalankan task ECS** (untuk pekerjaan yang lebih lama)
- **Menunggu waktu tertentu** atau **event** (menjeda workflow sampai sesuatu yang eksternal terjadi)
- **Memilih jalur** berdasarkan kondisi (logika if/else)
- **Menjalankan cabang paralel** secara bersamaan
- **Mencoba ulang saat gagal** dengan backoff yang dapat dikonfigurasi
- **Menangkap error** dan merutekan ke state penanganan error

Step Functions mengelola state eksekusi secara tahan lama. Jika langkah 3 gagal, eksekusi dijeda di langkah 3. Kamu dapat memeriksa eksekusi yang gagal di konsol, memperbaiki masalah, dan memulai ulang dari langkah 3 — tanpa mengulang langkah 1 dan 2.

**Tipe State: Blok Pembangun**

**Task**: Menjalankan aksi — panggil fungsi Lambda, mulai task ECS, panggil API. Di sinilah pekerjaan nyata terjadi.

**Choice**: Bercabang berdasarkan kondisi dalam data input. Seperti if/else dalam kode.

**Parallel**: Menjalankan beberapa cabang secara bersamaan dan menunggu semuanya selesai.

**Map**: Menerapkan serangkaian state ke setiap item dalam daftar. Memproses 50 item menu restoran secara paralel.

**Wait**: Menjeda selama waktu tertentu atau hingga timestamp. Berguna untuk penundaan terjadwal.

**Pass**: Meneruskan input ke output tanpa melakukan pekerjaan. Digunakan untuk transformasi data dan pengujian.

**Succeed/Fail**: State terminal yang mengakhiri eksekusi.

Untuk proses onboarding restoran, Leo merancang sebuah workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, dengan 3 kali retry)
3. Cabang paralel:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, menunggu paralel selesai)
5. NotifySalesTeam (Task → Lambda)

Langkah 3a dan 3b berjalan paralel — mereka tidak saling bergantung, dan menjalankannya bersamaan menghemat waktu.

**Workflow Standar vs Ekspres**

Step Functions menawarkan dua tipe workflow:

**Workflow standar**:

- Durasi maksimum: 1 tahun
- Eksekusi tahan lama — state dipersistensikan, dapat diperiksa dan diaudit
- Eksekusi at-least-once (setiap task dijalankan setidaknya satu kali)
- Dihargai per transisi state
- Terbaik untuk workflow jangka panjang yang penting (pemrosesan pesanan, onboarding, aliran pembayaran)

**Workflow ekspres**:

- Durasi maksimum: 5 menit
- Throughput lebih tinggi — hingga 100.000 per detik
- At-least-once atau at-most-once (dapat dikonfigurasi)
- Dihargai per durasi (seperti Lambda)
- Terbaik untuk workflow berdurasi singkat dengan volume tinggi (pemrosesan event real-time, konsumsi data IoT)

Untuk onboarding restoran Nimbus: Standar (ini penting, tahan lama, mungkin membutuhkan waktu berjam-jam jika ada langkah manual yang terlibat).

Untuk pembaruan status pesanan real-time Nimbus: Ekspres (volume tinggi, durasi singkat, kurang kritis).

**Arsitektur Berbasis Event: Gambaran Besar**

Step Functions adalah satu bagian dari pola yang lebih besar: **arsitektur berbasis event**. Alih-alih layanan memanggil satu sama lain secara langsung (coupling ketat), layanan memancarkan event, dan layanan lain bereaksi terhadap event tersebut.

Kita telah melihat ini di seluruh buku:

- Pesanan ditempatkan → SNS mempublikasikan event → antrean SQS mengirimkan ke konsumen
- File S3 diunggah → Lambda dipicu untuk memprosesnya
- Record DynamoDB berubah → DynamoDB Streams → Lambda memperbarui cache

**Amazon EventBridge** (sebelumnya CloudWatch Events) adalah event bus canggih untuk pola ini. Ia merutekan event dari layanan AWS dan aplikasimu sendiri ke target (Lambda, SQS, Step Functions, dll.) berdasarkan aturan.

EventBridge memungkinkan coupling longgar pada tingkat arsitektur: layanan pesanan mempublikasikan event `order.placed` tanpa mengetahui siapa yang mendengarkan. Layanan analitik, layanan notifikasi, dan layanan poin loyalitas semuanya mendengarkan secara independen. Menambahkan listener baru tidak memerlukan perubahan pada layanan pesanan.

**Kapan Step Functions adalah Alat yang Tepat**

Step Functions unggul ketika kamu memiliki:

**Workflow multi-langkah** yang perlu melacak kemajuan di seluruh langkah

**Proses human-in-the-loop** — Step Functions dapat menunggu tanpa batas waktu untuk event eksternal (seperti manusia yang menyetujui sesuatu) dan kemudian melanjutkan

**Penanganan error pada skala besar** — logika retry, catch, dan fallback bawaan di banyak langkah

**Proses yang dapat diaudit** — setiap eksekusi mencatat setiap transisi state. Kamu dapat melihat persis apa yang terjadi dan kapan.

**Logika paralel atau sekuensial yang kompleks** — visual workflow membuatnya lebih mudah untuk dipikirkan dibanding kode yang setara

Step Functions berlebihan untuk proses dua langkah yang sederhana. Gunakan ketika koordinasinya sendiri bernilai dan skenario kegagalannya penting.

## Kekuatan dan Keterbatasan

**Mengapa Step Functions kuat**:

- Riwayat eksekusi visual — lihat persis di mana workflow berada (atau gagal)
- Retry dan penanganan error bawaan — tidak ada kode retry kustom
- State tahan lama — eksekusi bertahan melewati restart dan pemadaman layanan
- Integrasi langsung dengan 200+ layanan AWS (tidak hanya Lambda)
- Visual workflow mendokumentasikan dirinya sendiri

**Di mana ini menjadi rumit**:

- Workflow standar dihargai per transisi state — workflow kompleks dengan banyak state dapat menjadi mahal pada skala besar
- Format JSON ASL (Amazon States Language) memiliki kurva pembelajaran
- Ukuran payload maksimum adalah 256KB — data besar harus diteruskan melalui referensi S3, tidak langsung melalui workflow
- Workflow jangka panjang dengan banyak langkah manual membutuhkan konfigurasi timeout yang cermat

## Ringkasan

- **Step Functions** mengorkestrasikan workflow multi-langkah sebagai state machine.
- Setiap **state** dapat menjalankan fungsi Lambda, mengeksekusi task ECS, menunggu, bercabang, atau menjalankan langkah paralel.
- **Retry dan catch** sudah terpasang di setiap state — tidak diperlukan kode retry kustom.
- **Workflow standar**: jangka panjang (hingga 1 tahun), tahan lama, at-least-once. Untuk proses bisnis kritis.
- **Workflow ekspres**: durasi singkat (hingga 5 menit), throughput tinggi. Untuk pemrosesan event volume tinggi.
- **Arsitektur berbasis event** menggunakan layanan seperti SNS, SQS, Lambda, dan EventBridge untuk memisahkan sistem di sekitar event daripada panggilan langsung.
- Gunakan Step Functions ketika koordinasi langkah-langkah itu sendiri kompleks dan ketika kemampuan audit penting.

## Tips Ujian

*Domain SAA-C03: Merancang Arsitektur yang Tangguh (Domain 2, Tugas 2.1)*

- **Sinyal kasus penggunaan Step Functions**: "orkestrasikan beberapa fungsi Lambda," "workflow dengan retry dan penanganan error," "langkah persetujuan manusia dalam workflow otomatis," "jejak audit setiap langkah workflow" → Step Functions.
- **Standar vs Ekspres**: Standar untuk workflow jangka panjang, dapat diaudit, kritis bisnis. Ekspres untuk pemrosesan event berdurasi singkat berthroughput tinggi.
- **SQS vs Step Functions**: SQS untuk antrean task sederhana (produsen/konsumen). Step Functions untuk workflow multi-langkah dengan logika kompleks, retry, dan pelacakan state.
- **Sinyal EventBridge**: "rutekan event dari layanan AWS ke target," "integrasi berbasis event antar layanan," "jadwalkan fungsi Lambda" → EventBridge (sebelumnya CloudWatch Events).
- **Pola callback**: Step Functions dapat menjeda eksekusi dan menunggu callback eksternal (task token). Worker memanggil kembali saat selesai. Berguna untuk task ECS jangka panjang di mana kamu tidak ingin batas 15 menit Lambda.
- **Integrasi SDK langsung**: Step Functions dapat memanggil layanan AWS secara langsung (DynamoDB, S3, SQS, dll.) tanpa melalui Lambda. Mengurangi biaya dan latensi untuk panggilan layanan sederhana.

## Latihan

**Latihan 1 — Mengingat Kembali**

Jelaskan mengapa Step Functions berguna untuk workflow multi-langkah. Apa yang diberikannya yang tidak diberikan oleh fungsi Lambda sederhana yang memanggil fungsi Lambda lain?

*(Petunjuk: Pikirkan apa yang terjadi ketika langkah 3 dari 5 gagal dalam setiap pendekatan. Bagaimana kamu mengetahui apa yang terjadi? Bagaimana kamu mencoba ulang hanya langkah 3?)*

**Latihan 2 — Latihan Ujian**

*Skenario*: Sebuah perusahaan layanan keuangan memproses aplikasi pinjaman dalam beberapa langkah: pemeriksaan kredit, verifikasi pendapatan, validasi dokumen, tinjauan penjamin emisi (manual), dan notifikasi keputusan. Setiap langkah dapat membutuhkan waktu dari beberapa detik (pemeriksaan kredit) hingga beberapa hari (tinjauan penjamin emisi). Perusahaan membutuhkan jejak audit lengkap dari setiap langkah untuk kepatuhan. Langkah otomatis yang gagal harus dicoba ulang secara otomatis; langkah manual harus dijeda dan menunggu keputusan manusia.

Layanan mana yang PALING memenuhi persyaratan ini?

A) Fungsi AWS Lambda yang dirantai bersama dengan antrean SQS di antara setiap langkah  
B) Workflow Standar AWS Step Functions dengan pola Wait for callback untuk langkah tinjauan penjamin emisi  
C) Workflow Ekspres AWS Step Functions untuk langkah otomatis dan SQS FIFO untuk langkah manual  
D) Amazon EventBridge dengan aturan event yang merutekan antara fungsi Lambda untuk setiap langkah

**Petunjuk 1**: Durasi "hingga beberapa hari" — tipe Step Functions mana yang mendukung ini?

**Petunjuk 2**: "Menunggu keputusan manusia" — pola Step Functions mana yang dirancang untuk ini?

**Petunjuk 3**: "Jejak audit lengkap untuk kepatuhan" — layanan mana yang menyediakan riwayat state per eksekusi?

**Jawaban**: B

**Penjelasan**: Workflow Standar Step Functions dapat berjalan hingga 1 tahun, mendukung langkah tinjauan penjamin emisi yang dapat berlangsung berhari-hari. Pola Wait for callback menjeda eksekusi di langkah penjamin emisi dengan task token; ketika penjamin emisi membuat keputusan, mereka memanggil kembali dengan token untuk melanjutkan workflow. Workflow standar mencatat setiap transisi state — jejak audit lengkap untuk kepatuhan.

**Mengapa bukan A?** Lambda yang dirantai melalui SQS tidak menyediakan pelacakan state bawaan atau jejak audit. Langkah yang gagal membutuhkan logika retry kustom. Memulai ulang dari langkah yang gagal tertentu membutuhkan implementasi kustom.

**Mengapa bukan C?** Workflow ekspres memiliki durasi maksimum 5 menit — tidak kompatibel dengan langkah yang dapat berlangsung berhari-hari.

**Mengapa bukan D?** EventBridge merutekan event antar layanan tetapi tidak mempertahankan state workflow atau menyediakan retry/audit bawaan. Membangun ini di EventBridge saja membutuhkan manajemen state kustom.

*Domain SAA-C03: Merancang Arsitektur yang Tangguh — Tugas 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang membangun proses penyelesaian sengketa kualitas makanan. Ketika pelanggan melaporkan pengalaman buruk:

1. Laporan divalidasi secara otomatis (memeriksa apakah pesanan ada, apakah cukup baru)
2. Restoran diberi tahu secara otomatis
3. Agen dukungan Nimbus meninjau keluhan (langkah manual — dapat membutuhkan 1-3 hari kerja)
4. Berdasarkan keputusan agen: keluarkan pengembalian dana (Lambda → pemroses pembayaran) ATAU kirim kupon permintaan maaf (Lambda → layanan kupon) ATAU eskalasi ke manajemen (sub-workflow Step Functions)
5. Pelanggan diberi tahu tentang hasilnya

Rancang ini sebagai workflow Step Functions. Tipe state apa yang menangani setiap langkah? Bagaimana kamu akan menangani penantian 1-3 hari? Bagaimana kamu akan memodelkan percabangan pada langkah 4?

*(Tidak ada satu jawaban yang benar. Tujuannya adalah berlatih desain state Step Functions.)*

## Adegan Pasca-Kredit

Workflow onboarding restoran sudah live.

Selama bulan berikutnya, 12 mitra restoran baru melakukan onboarding. Dua mengalami kegagalan selama langkah pemrosesan pembayaran (langkah 3). Dalam kedua kasus, Step Functions menangkap error yang tepat, menyimpan state eksekusi, dan mengirimkan peringatan ke tim Nimbus.

Leo memperbaiki akar penyebabnya (kunci API yang salah dikonfigurasi untuk penyedia pembayaran) dan mencoba ulang kedua eksekusi dari langkah 3. Eksekusi selesai dalam 23 detik masing-masing, melanjutkan dari tepat di mana mereka gagal.

Tidak ada restoran yang perlu diimpor ulang. Tidak ada peran IAM yang dibuat dua kali. Tidak ada email selamat datang duplikat yang dikirim.

"Sebelum Step Functions," kata Leo kepada Maya, "ini akan membutuhkan seseorang untuk melacak secara manual apa yang sudah dan belum dilakukan untuk setiap restoran, dan secara manual menjalankan ulang langkah-langkah yang hilang."

"Dan sekarang?"

"Sekarang aku klik retry di konsol. Sistem tahu apa yang sudah selesai."

Maya memikirkan ini.

"Itu bukan hanya peningkatan teknis," katanya. "Itulah perbedaan antara proses yang menskalakan dan yang tidak."

Di bab berikutnya: apa yang harus dilakukan dengan data yang tidak kamu akses sekarang, tetapi pasti ingin kamu simpan selamanya.
