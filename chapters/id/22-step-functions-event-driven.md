# Bab 22: Diagram Alur yang Menjalankan Dirinya Sendiri

Leo telah menatap file log yang sama selama satu jam. Setiap stack trace cukup jelas secara individual, tetapi pola di antaranya—cara satu langkah gagal secara diam-diam dan langkah berikutnya tetap berjalan—butuh waktu baginya untuk melihatnya. Akhirnya ia bersandar, meletakkan kopinya, dan menulis satu kata di buku catatannya: *koordinasi*.

Bayangkan seorang konduktor melangkah turun dari podium di tengah pertunjukan. Orkestra terus bermain—tetapi tidak ada yang membawa masuk seksi tiup logam di birama 47, tidak ada yang memberi aba-aba untuk keheningan sebelum finale. Musisi individu memainkan bagian mereka dengan benar. Pertunjukan tetap berantakan, karena bagian-bagian itu bergantung pada koordinasi yang tidak dikelola siapa pun.

Itulah masalah yang ditemukan Leo dalam kode konfirmasi pesanan. Bukan bug di langkah individual mana pun. Sebuah kegagalan koordinasi.

---

Kontainer berjalan dengan benar dan men-deploy dengan bersih. Pipeline deployment ECS kokoh. Tetapi di dalam kode aplikasi, jenis kegagalan yang berbeda telah menumpuk selama berminggu-minggu. Kontainer baik-baik saja. Logika di dalam salah satunya tidak.

Leo telah melacak pola dalam log tetapi tidak memahaminya sampai ia menghitung kemunculannya.

Sebelas kali. Dalam dua minggu.

---

Konfirmasi pesanan di Nimbus membutuhkan lima hal terjadi secara berurutan: menagih kartu, mengirim email konfirmasi, memberi tahu restoran, memperbarui inventaris, dan mencatat transaksi untuk akuntansi.

Ketika Leo menulis fungsi konfirmasi pesanan yang asli, ia membungkus semuanya dalam satu blok `try/except` dan berkata "akan baik-baik saja—kita akan menangkap kesalahan di log." Itu delapan bulan yang lalu.

Itu tidak baik-baik saja.

Jika langkah ketiga gagal—jika notifikasi restoran timeout—langkah satu dan dua sudah terjadi. Pelanggan sudah ditagih. Email sudah dikirim. Tetapi restoran tidak tahu pesanan itu ada.

Leo punya nama untuk kategori bug ini: keberhasilan parsial. "Semuanya berhasil," katanya, "kecuali bagian yang penting."

"Berapa kali ini terjadi?" tanya Maya.

"Sebelas kali dalam dua minggu terakhir. Kita menangkap sebagian besar dari panggilan marah ke restoran. Dua kita temukan di log, setelah kejadian."

"Jadi kita tidak punya koordinasi," kata Priya. "Lima langkah, berjalan sebagai skrip, tanpa jaminan semuanya selesai. Dan bagaimana jika seseorang mencoba menerobos masuk selama langkah dua—setelah tagihan lolos tetapi sebelum restoran diberi tahu? Kita sudah menagih pelanggan untuk pesanan yang tidak dimiliki restoran."

"Atau bahwa mereka selesai dalam urutan yang benar."

"Atau bahwa kita tahu mana yang gagal."

Leo memunculkan kode di proyektor. Itu fungsi Python: lima puluh baris, lima panggilan API berurutan, satu blok try/except di sekeliling semuanya.

"Kita membutuhkan sebuah workflow," kata Maya. "Sesuatu yang melacak setiap langkah. Tunggu—tapi *mengapa* kita tidak bisa sekadar menambahkan penanganan kesalahan yang lebih baik ke fungsi Python yang ada? Mengapa kita membutuhkan layanan yang sama sekali baru?"

"Karena penanganan kesalahan yang lebih baik tetap berjalan dalam satu proses yang bisa gagal di titik mana pun," kata Leo. "Jika server di-restart di tengah eksekusi, penanganan kesalahan ikut di-restart bersamanya. Step Functions mempertahankan state secara eksternal."

Pikirkan sebuah daftar periksa manufaktur—yang di dalamnya setiap stasiun mengonfirmasi penyelesaian sebelum meneruskan ke yang berikutnya, dan di mana seluruh lini menahan posisinya ketika sesuatu gagal. Lini tidak memulai ulang dari awal. Ia melanjutkan dari stasiun persis yang gagal. State stasiun itu dicatat. Langkah-langkah sebelumnya sudah selesai dan tidak diulang. Langkah-langkah setelahnya menunggu sampai masalah teratasi.

Itulah yang dibutuhkan alur konfirmasi pesanan. Bukan lebih banyak kode di sekitar masalah. Sebuah sistem yang dirancang untuk mengelola masalah.

**AWS Step Functions: Mengorkestrasi Workflow**

**AWS Step Functions** adalah layanan orkestrasi serverless yang mengoordinasikan langkah-langkah sebuah aplikasi sebagai workflow visual. Setiap langkah adalah sebuah **state** dalam sebuah **state machine**.

Alih-alih skrip Python yang berjalan dari atas ke bawah dan mogok, Anda mendefinisikan workflow sebagai state machine JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Setiap state dapat:

- **Mengeksekusi fungsi Lambda** (pola yang paling umum)
- **Mengeksekusi task ECS** (untuk pekerjaan berdurasi lebih panjang)
- **Menunggu waktu tertentu** atau **kejadian** (menjeda workflow sampai sesuatu yang eksternal terjadi)
- **Memilih jalur** berdasarkan kondisi (logika if/else)
- **Menjalankan cabang paralel** secara bersamaan
- **Mencoba ulang saat gagal** dengan backoff yang dapat dikonfigurasi
- **Menangkap kesalahan** dan merutekan ke state penanganan kesalahan

Step Functions mengelola state eksekusi secara tahan lama. Jika langkah 3 gagal, eksekusi berhenti di langkah 3. Anda dapat memeriksa eksekusi yang gagal di konsol, memperbaiki masalah, dan memulai ulang dari langkah 3—tanpa mengulang langkah 1 dan 2.

Anda mungkin bertanya-tanya: tidak bisakah Anda sekadar menulis logika percobaan ulang di fungsi Lambda Anda? Bisa—tetapi kemudian Anda juga menulis pelacakan kegagalan, persistensi state, dan audit logging dalam kode. Dan ketika langkah 3 dari 7 gagal, Anda perlu tahu restoran mana yang sedang diproses, apa yang terjadi sebelumnya, dan di mana harus melanjutkan. Step Functions melakukan semua itu.

**Alur Pesanan Nimbus: State Machine yang Dianotasi**

Berikut versi yang disederhanakan dari state machine Step Functions sebenarnya yang dibangun Nimbus untuk konfirmasi pesanan—dianotasi agar Anda bisa melihat apa yang dilakukan setiap bagian:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Beberapa hal yang perlu diperhatikan:

**`ChargeCard` memiliki dua klausa Catch.** Satu untuk `PaymentDeclinedError` (kegagalan yang diketahui dan diharapkan—kartu ditolak, bukan kesalahan sistem) dan satu untuk `States.ALL` (apa pun yang lain—pemadaman sistem, timeout, pengecualian tak terduga). Mereka merutekan ke state yang berbeda karena mereka berarti hal yang berbeda.

**`NotifyRestaurant` memiliki Catch yang merutekan ke `RestaurantNotificationFailed`.** Inilah bug yang menyebabkan sebelas insiden itu. Di skrip Python lama, tidak ada padanannya—jika notifikasi gagal, fungsi entah mogok diam-diam atau mencatat kesalahan dan melanjutkan. Step Functions membuat jalur kegagalan eksplisit: ia pergi ke suatu tempat yang spesifik, dan tempat itu memperingatkan tim dukungan sebelum ada yang harus menelepon.

**Setiap Task memiliki Retry.** Jika layanan email mengalami timeout sesaat, ia mencoba ulang secara otomatis, tiga kali, dengan backoff yang meningkat. Pelanggan tidak pernah melihat ini. Pesanan tidak hilang.

**Alurnya adalah graf, bukan skrip.** Jika `NotifyRestaurant` gagal permanen (setelah percobaan ulang), eksekusi tidak berlanjut ke `UpdateInventory`. Workflow berhenti di `RestaurantNotificationFailed`. Inventaris tidak diperbarui untuk restoran yang tidak tahu tentang pesanan itu. Inilah perilaku yang benar.

"Tunggu—tapi *mengapa* kita membutuhkan jalur kegagalan terpisah untuk payment declined vs kesalahan sistem?" tanya Maya.

"Karena mereka membutuhkan respons yang sama sekali berbeda," kata Leo. "Kartu ditolak berarti kita mengirim email ke pelanggan dan meminta mereka mencoba lagi. Kesalahan sistem di fungsi charge berarti kita butuh seorang insinyur untuk menyelidiki mengapa fungsi Lambda gagal. Hasil yang teramati sama—pesanan tidak lolos—tetapi remediasi yang sama sekali berbeda."

**Jenis State: Blok Bangunan**

**Task**: Mengeksekusi sebuah tindakan—memanggil fungsi Lambda, memulai task ECS, memanggil API. Di sinilah pekerjaan nyata terjadi.

**Choice**: Bercabang berdasarkan kondisi dalam data input. Seperti if/else dalam kode.

**Parallel**: Menjalankan beberapa cabang secara bersamaan dan menunggu semuanya selesai.

**Map**: Menerapkan satu set state ke setiap item dalam sebuah daftar. Memproses 50 item menu restoran secara paralel.

Ketika Nimbus mengimpor menu sebuah restoran, menu itu bisa berisi di mana saja dari 8 hingga 200 item. Untuk setiap item, proses impor perlu: memvalidasi formatnya, memeriksa data alergen, mengubah ukuran fotonya, dan menulis record-nya ke DynamoDB.

Tanpa state Map, ini akan menjadi satu Lambda yang memproses item secara berurutan—200 item × 200ms per item = 40 detik waktu pemrosesan. Dengan state Map, Step Functions meluncurkan eksekusi state pemrosesan secara bersamaan—hingga batas konkurensi yang dikonfigurasi—dan menunggu semuanya selesai. 200 item yang sama bisa selesai dalam di bawah 5 detik.

**Wait**: Menjeda selama waktu tertentu atau sampai sebuah timestamp. Berguna untuk penundaan terjadwal.

**Pass**: Meneruskan input ke output tanpa melakukan pekerjaan. Digunakan untuk transformasi data dan pengujian.

**Succeed/Fail**: State terminal yang mengakhiri eksekusi.

Untuk onboarding restoran, Leo merancang sebuah workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, dengan 3 percobaan ulang)
3. Cabang paralel:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, menunggu paralel selesai)
5. NotifySalesTeam (Task → Lambda)

Langkah 3a dan 3b berjalan paralel—mereka tidak bergantung satu sama lain, dan menjalankannya secara bersamaan menghemat waktu.

Setelah kohort restoran pertama menyelesaikan onboarding, sebuah persyaratan kepatuhan muncul: sebelum mitra restoran bisa go live, seorang account manager Nimbus harus meninjau dan menyetujui dokumentasi lisensi secara manual. Ini bisa memakan satu hingga tiga hari kerja.

"Dan bagaimana jika seseorang mencoba menerobos masuk selama jendela itu?" tanya Priya. "Jika restoran terkonfigurasi sebagian—akun pembayaran dibuat tetapi belum disetujui—dan seseorang menemukan state yang tertunda, mereka bisa mencoba mengeksploitasi konfigurasi setengah-terbuka itu."

Lebih praktis lagi: bagaimana Anda menjeda workflow Step Functions selama tiga hari menunggu seorang manusia?

Jawabannya adalah **pola callback dengan task token**.

Ketika `ValidateLicense` berjalan, alih-alih selesai secara otomatis, ia memanggil sebuah Lambda yang melakukan tiga hal:

1. Mengirim email ke account manager dengan dokumen restoran
2. Mencatat sebuah **task token** (pengidentifikasi unik yang dihasilkan Step Functions untuk eksekusi dan state spesifik ini) di sebuah database, dikaitkan dengan tinjauan yang tertunda itu
3. Kembali ke Step Functions dengan `.waitForTaskToken`—yang memberi tahu Step Functions untuk menjeda eksekusi pada state ini tanpa batas waktu

Step Functions memarkir eksekusi. Tidak ada hal lain yang terblokir—tidak ada server yang menunggu. State machine hanya menunggu, tidak mengonsumsi sumber daya komputasi.

Tiga hari kemudian, account manager mengklik "Approve" di alat admin internal. Alat admin mencari task token dari database dan memanggil:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions melanjutkan. Eksekusi berlanjut dari langkah 2 (`ImportMenu`), dengan informasi peninjau tersedia dalam state workflow.

"Eksekusi dijeda selama tiga hari," kata Leo, "dan satu-satunya hal yang terjadi ketika saya menyetujuinya adalah satu panggilan API."

"Dan jika account manager menolaknya?" tanya Maya.

"Kita memanggil `send_task_failure` sebagai gantinya. State machine menangkap itu dan merutekan ke state `NotifyRejection` yang mengirim email ke mitra restoran."

Step Functions tidak mem-poll. Ia tidak mencoba ulang. Ia tidak timeout (kecuali Anda mengatur timeout heartbeat). Ia hanya menunggu sampai callback tiba, lalu melanjutkan. Ini secara fundamental berbeda dari mem-poll database atau antrian—dan itulah mengapa Step Functions sangat cocok untuk workflow yang mencampur langkah otomatis dan manual.

**Membaca Konsol Eksekusi: Seperti Apa Sebuah Kegagalan**

Ketika Lambda notifikasi restoran timeout selama minggu pertama Nimbus di Step Functions, Leo membuka konsol Step Functions dan mengklik eksekusi yang gagal.

**Execution Event History** menunjukkan lini masa persis apa yang terjadi:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

Dalam 42 detik, Step Functions telah menagih kartu, mengirim email, mencoba notifikasi restoran tiga kali, menangkap kegagalan, memperingatkan tim dukungan, dan mencatat riwayat lengkap. Sebelum Step Functions, kegagalan ini akan tak terlihat—fungsi Python akan mencatat "notification failed" dan mengembalikan 200 ke pemanggil seolah-olah tidak ada yang salah.

"Lini masa menunjukkan persis di mana segalanya berjalan salah dan kapan," kata Leo. "Dan setiap percobaan ulang diberi timestamp. Anda bisa melihat interval backoff-nya."

Priya melihat konsol. "Dan riwayat ini disimpan berapa lama?"

Riwayat eksekusi Standard workflow disimpan selama 90 hari. Untuk kepatuhan atau audit jangka panjang, kejadian eksekusi juga dapat diekspor ke CloudWatch Logs dan disimpan tanpa batas waktu.

**Standard vs Express Workflow**

Step Functions menawarkan dua jenis workflow:

**Standard workflow**:

- Durasi maksimum: 1 tahun
- Eksekusi bersifat tahan lama—state dipertahankan, dapat diperiksa dan diaudit
- Eksekusi tepat-sekali (sebuah task tidak pernah dijalankan lebih dari sekali kecuali Anda mengonfigurasi Retry)
- Diberi harga per transisi state
- Terbaik untuk workflow yang berdurasi panjang dan penting (pemrosesan pesanan, onboarding, alur pembayaran)

**Express workflow**:

- Durasi maksimum: 5 menit
- Throughput lebih tinggi—hingga 100.000 per detik
- Eksekusi setidaknya-sekali (asinkron) atau paling-banyak-sekali (sinkron)—rancang task agar idempoten
- Diberi harga per durasi (seperti Lambda)
- Terbaik untuk workflow bervolume tinggi dan berdurasi singkat (pemrosesan kejadian real-time, ingesti data IoT)

"Berapa biayanya per bulan?" tanya Tom, memunculkan halaman harga. "Per transisi state untuk Standard—itu menumpuk jika Anda punya banyak langkah."

Leo menelusuri perhitungannya. Untuk workflow onboarding restoran (enam state task per eksekusi, kira-kira 12-15 restoran baru per bulan): kurang dari seratus transisi state—kurang dari satu sen, dan sepenuhnya di dalam tier gratis bulanan 4.000-transisi, jadi secara efektif $0. Untuk workflow konfirmasi pesanan pada lalu lintas penuh Nimbus: lebih berarti, tetapi masih jauh di bawah biaya men-debug sebelas keberhasilan parsial per bulan secara manual.

"Waktu debugging adalah biaya tersembunyinya," kata Leo.

"Itu selalu biaya tersembunyinya," kata Tom.

Tom menghitung angkanya lebih cermat, karena itulah Tom.

**Biaya Standard workflow untuk alur konfirmasi pesanan Nimbus**: lima state per pesanan pada jalur bahagia, pada $0,000025 per transisi state. Lima transisi state × $0,000025 × 15.000 pesanan per bulan = **$1,88/bulan**. Pada sepuluh kali volume pesanan: sekitar $19/bulan. Biaya debugging untuk satu insiden keberhasilan-parsial (24 menit waktu insinyur dukungan) melebihi tagihan Step Functions bulanan berkali-kali lipat.

Perbandingan menjadi penting jika seseorang menyarankan menggunakan Standard workflow untuk kejadian analitik berfrekuensi tinggi. Misalkan Nimbus ingin menggunakan Step Functions untuk memproses setiap kejadian clickstream mentah—setiap tampilan halaman menu, setiap scroll, setiap pencarian. Itu kira-kira 800.000 kejadian per hari pada skala mereka saat ini. Sebuah Standard workflow lima-state untuk setiap kejadian: 800.000 × 5 × $0,000025 × 30 hari = **$3.000/bulan**. Itu uang sungguhan untuk sebuah pipeline analitik.

Express workflow untuk volume yang sama: diberi harga per permintaan ditambah durasi, bukan per transisi state. 24 juta eksekusi bulanan berbiaya $1,00 per juta permintaan = $24. Durasi: 24 juta × 500ms pada minimum penagihan 64MB ≈ 208 GB-jam × $0,06 = $12,50. Total ≈ **$36,50/bulan**—hampir dua orde besaran lebih murah daripada $3.000 milik Standard.

"Jadi jenis workflow bukan sekadar keputusan arsitektur," kata Tom. "Itu adalah keputusan biaya. Jumlah state yang sama bisa berbiaya hampir seratus kali lebih tergantung jenis workflow mana yang Anda gunakan."

"Dan mana yang lebih baik bergantung sepenuhnya pada apa yang dilakukan workflow," kata Leo. "Konfirmasi pesanan: Standard. Ia penting, ia memiliki jalur kegagalan yang berarti, kita ingin jejak audit. Pemrosesan kejadian analitik: Express. Ia bervolume tinggi, berdurasi singkat, dan kita tidak membutuhkan riwayat eksekusi 90 hari untuk setiap tampilan halaman."

Jika proses Anda memiliki dua langkah dan tidak membutuhkan jejak audit, fungsi Lambda sederhana lebih murah dan tidak membutuhkan sintaks state machine JSON—tetapi jika langkah mana pun dapat gagal secara independen dan perlu dicoba ulang atau dimulai ulang tanpa mengulang langkah sebelumnya, Step Functions membayar dirinya sendiri dalam pengurangan debugging dan remediasi manual.

Untuk onboarding restoran Nimbus: Standard (ia penting, tahan lama, mungkin memakan berjam-jam jika langkah manual terlibat).

Untuk pembaruan status pesanan real-time Nimbus: Express (bervolume tinggi, berdurasi singkat, kurang kritis).

**Arsitektur Berbasis Kejadian: Gambaran yang Lebih Besar**

Step Functions adalah satu bagian dari pola yang lebih besar: **arsitektur berbasis kejadian (event-driven architecture)**. Alih-alih layanan saling memanggil secara langsung (kopling ketat), layanan memancarkan kejadian, dan layanan lain bereaksi terhadap kejadian itu.

Kita telah melihat ini di sepanjang buku:

- Pesanan ditempatkan → SNS memublikasikan kejadian → antrian SQS mengirim ke konsumen
- File diunggah ke S3 → Lambda dipicu untuk memprosesnya
- Record DynamoDB berubah → DynamoDB Streams → Lambda memperbarui cache

**Amazon EventBridge** (sebelumnya CloudWatch Events) adalah event bus tingkat lanjut untuk pola ini. Ia merutekan kejadian dari layanan AWS dan aplikasi Anda sendiri ke target (Lambda, SQS, Step Functions, dll.) berdasarkan aturan.

EventBridge memungkinkan kopling longgar pada tingkat arsitektur: layanan pesanan memublikasikan kejadian `order.placed` tanpa mengetahui siapa yang mendengarkan. Layanan analitik, layanan notifikasi, dan layanan poin loyalitas semua mendengarkan secara independen. Menambahkan pendengar baru tidak membutuhkan perubahan pada layanan pesanan.

EventBridge juga terintegrasi secara native dengan puluhan layanan AWS sebagai **sumber kejadian**. Ketika sebuah panggilan API CloudTrail cocok dengan pola, EventBridge dapat menyalakan sebuah aturan. Ketika sebuah instans EC2 berubah state, EventBridge dapat memicu sebuah Lambda. Ketika sebuah instans RDS melakukan failover, EventBridge dapat memperingatkan insinyur on-call. Anda dapat memperlakukan seluruh control plane AWS sebagai sebuah aliran kejadian.

Untuk Nimbus, sebuah aturan EventBridge yang sangat berguna: memicu sebuah Lambda setiap kali image baru didorong ke ECR. Lambda memeriksa hasil pemindaian image dan mengirim ke channel Slack rekayasa jika ada CVE HIGH atau CRITICAL yang ditemukan—sebelum ada yang men-deploy image. Ini menggabungkan pemindaian keamanan ECR (dari bab 21) dengan perutean kejadian EventBridge menjadi gerbang keamanan otomatis.

Prinsip arsitektur berbasis kejadian sama dengan logika percobaan ulang Step Functions: buat kegagalan eksplisit dan terutekan, bukan diam-diam dan ditelan. Layanan yang berkomunikasi melalui kejadian gagal dengan anggun—jika Lambda poin loyalitas mati ketika sebuah kejadian `OrderConfirmed` menyala, EventBridge dapat mencoba ulang pengiriman atau mengirim ke dead-letter queue. Konfirmasi pesanan itu sendiri tidak terpengaruh. Dekupling itulah ketahanannya.

**EventBridge: Men-dekupling Efek Samping dari Alur Utama**

Setelah state machine konfirmasi pesanan berjalan dengan bersih, Maya mengangkat sebuah pertanyaan di tinjauan arsitektur berikutnya.

"Kita ingin menambahkan poin loyalitas ketika sebuah pesanan dikonfirmasi. Pelanggan mendapat satu poin per dolar yang dibelanjakan. Di mana itu masuk dalam state machine?"

Insting pertama Leo: menambahkan state `GrantLoyaltyPoints` setelah `LogTransaction`.

Respons Priya: "Dan kemudian ketika kita menambahkan bonus referral? Dan survei pasca-pesanan? Dan permintaan penilaian restoran? Masing-masing menambahkan sebuah state ke jalur kritis. Jika Lambda poin loyalitas gagal, seluruh konfirmasi pesanan gagal."

"Alur konfirmasi pesanan seharusnya melakukan satu hal," katanya. "Mengonfirmasi pesanan. Segala yang lain adalah efek samping."

Inilah argumen arsitektur untuk **Amazon EventBridge** sebagai mekanisme untuk men-dekupling efek samping secara longgar dari workflow utama.

Pendekatan yang direvisi: ketika state `LogTransaction` selesai dengan sukses, Lambda memublikasikan sebuah kejadian ke EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Lalu aturan EventBridge merutekan kejadian itu ke target independen:

- **Aturan 1**: `OrderConfirmed` → Lambda Poin Loyalitas (memberikan 32 poin untuk pesanan $32)
- **Aturan 2**: `OrderConfirmed` → Lambda Survei Pasca-Pesanan (mengantrekan survei 2 jam setelah pengiriman)
- **Aturan 3**: `OrderConfirmed` → Stream Analitik Kinesis (memberi makan dasbor real-time)

Setiap aturan independen. Lambda Poin Loyalitas bisa gagal tanpa memengaruhi antrian survei. Pipeline analitik bisa tertinggal tanpa memblokir sistem loyalitas. Menambahkan efek samping baru (permintaan penilaian restoran, notifikasi cashback) membutuhkan pembuatan aturan EventBridge baru—bukan memodifikasi state machine.

"Dan bagaimana jika seseorang mencoba menerobos masuk melalui sebuah aturan EventBridge?" tanya Priya. "Jika kejadian itu berisi PII pelanggan, setiap Lambda yang menerimanya sekarang menjadi titik akses PII."

Kejadian itu dirancang dengan cermat: hanya ID, bukan nama, alamat, atau detail pembayaran. Lambda mana pun yang membutuhkan data pelanggan akan mencarinya dari database menggunakan ID pelanggan—dengan izin IAM-nya sendiri yang mengontrol apa yang bisa ia akses.

"Kejadian adalah sebuah sinyal," kata Priya. "Bukan dump data."

**Kapan Step Functions Adalah Alat yang Tepat**

Step Functions unggul ketika Anda memiliki:

**Workflow multi-langkah** yang perlu melacak kemajuan lintas langkah

**Proses human-in-the-loop**—Step Functions dapat menunggu tanpa batas waktu untuk sebuah kejadian eksternal (seperti seorang manusia menyetujui sesuatu) lalu melanjutkan

**Penanganan kesalahan pada skala besar**—logika retry, catch, dan fallback bawaan lintas banyak langkah

**Proses yang dapat diaudit**—setiap eksekusi mencatat setiap transisi state. Anda bisa melihat persis apa yang terjadi dan kapan.

**Logika paralel atau berurutan yang kompleks**—workflow visual membuatnya lebih mudah dinalar daripada kode yang setara

Step Functions berlebihan untuk proses dua-langkah sederhana. Gunakan ketika koordinasi itu sendiri bernilai dan skenario kegagalannya penting.

**Kapan Step Functions Adalah Alat yang Salah**

"Tunggu—tapi *mengapa* kita tidak menggunakan Step Functions untuk segalanya?" tanya Maya di akhir sesi desain. "Kita sudah membangun workflow onboarding restoran. Kita punya alur konfirmasi pesanan. Mengapa tidak mengonversi segalanya menjadi state machine?"

Jawaban jujurnya: karena Step Functions menambah overhead yang tidak dibenarkan oleh setiap workflow.

**Proses dua-langkah sederhana**: Jika Anda punya sebuah Lambda yang memproses file yang diunggah dengan memanggil Lambda kedua, overhead koordinasi sebuah state machine tidak sepadan dengan manfaat operasionalnya. Dua Lambda yang dipanggil berurutan dalam satu fungsi lebih sederhana, lebih mudah diuji, dan tidak memiliki biaya per-transisi-state.

**Workflow berfrekuensi ultra-tinggi, sub-detik**: Standard workflow memiliki biaya per-transisi-state yang tidak sepele yang menumpuk pada volume tinggi (seperti yang ditunjukkan contoh analitik di atas). Express workflow menyelesaikan masalah biaya tetapi tidak menyediakan riwayat state yang tahan lama. Pada frekuensi sangat tinggi dengan durasi sangat singkat, SQS plus Lambda (pola dari bab 19) lebih sederhana dan lebih murah daripada jenis Step Functions mana pun.

**Fan-out murni tanpa koordinasi**: Jika Anda perlu mengirim kejadian yang sama ke dua puluh konsumen dan tidak peduli hasil masing-masing, SNS adalah alatnya. Step Functions menambahkan pelacakan state yang tidak Anda butuhkan dan akan Anda bayar secara tak perlu.

**Interaksi pengguna sinkron real-time**: Eksekusi Step Functions bersifat asinkron. Jika seorang pengguna menunggu di layar checkout untuk respons sinkron dalam di bawah 500ms, Standard workflow Step Functions tidak dirancang untuk ini (Express workflow dapat dipanggil secara sinkron, tetapi overhead latensinya masih lebih tinggi daripada panggilan Lambda langsung). Untuk alur sinkron yang menghadap pengguna, Lambda + API Gateway dengan penanganan kesalahan yang dirancang baik seringkali lebih sesuai.

Prinsipnya: gunakan Step Functions ketika *koordinasi* langkah itu sendiri kompleks—ketika langkah dapat gagal secara independen, ketika Anda perlu mencoba ulang langkah individual tanpa mengulang yang sebelumnya, ketika riwayat eksekusi memiliki nilai kepatuhan atau debugging, atau ketika workflow melibatkan langkah persetujuan manusia yang mungkin memakan berhari-hari. Jangan gunakan untuk menambah overhead orkestrasi ke logika berurutan sederhana yang bekerja baik sebagai satu fungsi.

## Kekuatan dan Keterbatasan

**Mengapa Step Functions itu kuat**:

- Riwayat eksekusi visual—lihat persis di mana sebuah workflow berada (atau gagal)
- Retry dan penanganan kesalahan bawaan—tanpa kode retry kustom
- State tahan lama—eksekusi bertahan dari restart layanan dan pemadaman
- Integrasi langsung dengan 200+ layanan AWS (bukan hanya Lambda)
- Workflow visual mendokumentasikan dirinya sendiri
- Pola callback memungkinkan penantian tanpa batas waktu untuk tindakan manusia tanpa mengonsumsi komputasi

**Di mana hal ini menjadi rumit**:

- Standard workflow diberi harga per transisi state—workflow kompleks dengan banyak state bisa menjadi mahal pada skala besar
- Format JSON ASL (Amazon States Language) memiliki kurva belajar
- Ukuran payload maksimum adalah 256KB—data besar harus diteruskan via referensi S3, bukan langsung melalui workflow
- Workflow berdurasi panjang dengan banyak langkah manual membutuhkan konfigurasi timeout yang cermat
- Men-debug kesalahan ASL membutuhkan menjalankan eksekusi; tidak ada emulator lokal yang sekapabel layanan sebenarnya
- Izin IAM harus diberikan secara terpisah untuk setiap resource yang dipanggil state machine—melupakan satu izin menyebabkan kesalahan yang membingungkan saat runtime

## Ringkasan

Kontainer di bab 21 membuat deployment andal. Step Functions membuat proses bisnis multi-langkah andal—prinsip yang sama tentang "hilangkan risiko serah-terima" yang diterapkan pada logika aplikasi.

- **Step Functions** mengorkestrasi workflow multi-langkah sebagai state machine.
- Setiap **state** dapat menjalankan fungsi Lambda, mengeksekusi task ECS, menunggu, bercabang, atau menjalankan langkah paralel.
- **Retry dan catch** dibangun ke dalam setiap state—tidak perlu kode retry kustom.
- **Standard workflow**: berdurasi panjang (hingga 1 tahun), tahan lama, tepat-sekali. Untuk proses bisnis kritis.
- **Express workflow**: berdurasi singkat (hingga 5 menit), throughput tinggi. Untuk pemrosesan kejadian bervolume tinggi.
- **Pola callback dengan task token**: jeda workflow tanpa batas waktu menunggu kejadian eksternal atau tindakan manusia; lanjutkan dengan satu panggilan API.
- **State Map**: proses daftar item secara bersamaan—ganti loop berurutan dengan fan-out paralel.
- **Integrasi SDK langsung**: panggil DynamoDB, S3, SQS, dan 200+ layanan AWS langsung dari sebuah state, tanpa pembungkus Lambda.
- **EventBridge**: dekupling efek samping dari workflow utama—publikasikan satu kejadian, biarkan aturan independen merutekannya ke layanan poin loyalitas, analitik, dan survei tanpa memodifikasi state machine inti.
- **Biaya Standard vs Express**: Standard pada $0,000025 per transisi state bekerja baik untuk workflow kritis bervolume rendah (konfirmasi pesanan pada $1,88/bulan untuk Nimbus). Express pada harga per-permintaan-plus-durasi sesuai untuk kejadian berfrekuensi tinggi di mana Standard akan berbiaya puluhan kali lebih (~80x dalam perhitungan clickstream Nimbus).
- **Arsitektur berbasis kejadian** menggunakan layanan seperti SNS, SQS, Lambda, dan EventBridge untuk men-dekupling sistem di sekitar kejadian alih-alih panggilan langsung.
- Gunakan Step Functions ketika koordinasi langkah itu sendiri kompleks dan ketika auditabilitas penting. Jangan gunakan untuk urutan dua-langkah sederhana, workflow berfrekuensi ultra-tinggi, fan-out murni, atau alur sinkron yang menghadap pengguna.

## Tips Ujian

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **Sinyal kasus penggunaan Step Functions**: "orkestrasi beberapa fungsi Lambda," "workflow dengan retry dan penanganan kesalahan," "langkah persetujuan manusia dalam workflow otomatis," "jejak audit setiap langkah workflow" → Step Functions.
- **Standard vs Express**: Standard untuk workflow yang berdurasi panjang, dapat diaudit, dan kritis-bisnis. Express untuk pemrosesan kejadian throughput tinggi, berdurasi singkat.
- **SQS vs Step Functions**: SQS untuk antrian task sederhana (produser/konsumen). Step Functions untuk workflow multi-langkah dengan logika kompleks, retry, dan pelacakan state.
- **Sinyal EventBridge**: "rutekan kejadian dari layanan AWS ke target," "integrasi berbasis kejadian antar-layanan," "jadwalkan fungsi Lambda" → EventBridge (sebelumnya CloudWatch Events).
- **Pola callback**: Step Functions dapat menjeda eksekusi dan menunggu callback eksternal (task token). Pekerja memanggil balik ketika selesai. Berguna untuk task ECS berdurasi panjang di mana Anda tidak menginginkan batas 15 menit Lambda.
- **Integrasi SDK langsung**: Step Functions dapat memanggil layanan AWS langsung (DynamoDB, S3, SQS, dll.) tanpa melewati Lambda. Mengurangi biaya dan latensi untuk panggilan layanan sederhana. Misalnya, menulis record pesanan ke DynamoDB bisa menjadi panggilan SDK langsung dari state machine tanpa fungsi Lambda: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Ini menghilangkan cold start Lambda, biaya eksekusi Lambda, dan kode yang hanya memanggil `dynamodb.put_item(...)` dan mengembalikan.

## Latihan

**Latihan 1 — Mengingat**

Jelaskan mengapa Step Functions berguna untuk workflow multi-langkah. Apa yang ia sediakan yang tidak disediakan fungsi Lambda sederhana yang memanggil fungsi Lambda lain?

*(Petunjuk: Pikirkan apa yang terjadi ketika langkah 3 dari 5 gagal di setiap pendekatan. Bagaimana Anda tahu apa yang terjadi? Bagaimana Anda mencoba ulang hanya langkah 3?)*

**Latihan 2 — Skenario SAA-C03**

*Skenario*: Sebuah perusahaan layanan keuangan memproses aplikasi pinjaman dalam beberapa langkah: pemeriksaan kredit, verifikasi pendapatan, validasi dokumen, tinjauan underwriter (manual), dan notifikasi keputusan. Setiap langkah bisa memakan di mana saja dari detik (pemeriksaan kredit) hingga hari (tinjauan underwriter). Perusahaan membutuhkan jejak audit lengkap dari setiap langkah untuk kepatuhan. Langkah otomatis yang gagal harus mencoba ulang secara otomatis; langkah manual harus menjeda dan menunggu keputusan manusia.

Layanan mana yang PALING memenuhi persyaratan ini?

A) Fungsi AWS Lambda yang dirantai bersama dengan antrian SQS di antara setiap langkah  
B) Standard workflow AWS Step Functions dengan pola Wait for callback untuk langkah tinjauan underwriter  
C) Express workflow AWS Step Functions untuk langkah otomatis dan SQS FIFO untuk langkah manual  
D) Amazon EventBridge dengan aturan kejadian yang merutekan antar-fungsi Lambda untuk setiap langkah

**Petunjuk 1**: Durasi "hingga berhari-hari"—jenis Step Functions mana yang mendukung ini?

**Petunjuk 2**: "Menunggu keputusan manusia"—pola Step Functions mana yang dirancang untuk ini?

**Petunjuk 3**: "Jejak audit lengkap untuk kepatuhan"—layanan mana yang menyediakan riwayat state per-eksekusi?

**Jawaban**: B

**Penjelasan**: Standard workflow Step Functions dapat berjalan hingga 1 tahun, mendukung langkah tinjauan underwriter yang berdurasi berhari-hari. Pola Wait for callback menjeda eksekusi pada langkah underwriter dengan task token; ketika underwriter membuat keputusan, mereka memanggil balik dengan token untuk melanjutkan workflow. Standard workflow mencatat setiap transisi state—jejak audit lengkap untuk kepatuhan.

**Mengapa bukan A?** Lambda yang dirantai via SQS tidak menyediakan pelacakan state atau jejak audit bawaan. Langkah yang gagal membutuhkan logika retry kustom. Memulai ulang dari langkah gagal tertentu membutuhkan implementasi kustom.

**Mengapa bukan C?** Express workflow memiliki durasi maksimum 5 menit—tidak kompatibel dengan langkah yang bisa memakan berhari-hari.

**Mengapa bukan D?** EventBridge merutekan kejadian antar-layanan tetapi tidak mempertahankan state workflow atau menyediakan retry/audit bawaan. Membangun ini di EventBridge saja membutuhkan manajemen state kustom.

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**Latihan 3 — Tantangan Arsitektur** *(Opsional)*

Nimbus sedang membangun proses resolusi sengketa kualitas makanan. Ketika seorang pelanggan melaporkan pengalaman buruk:

1. Laporan divalidasi secara otomatis (memeriksa apakah pesanan ada, apakah cukup baru)
2. Restoran diberi tahu secara otomatis
3. Seorang agen dukungan Nimbus meninjau keluhan (langkah manual—bisa memakan 1-3 hari kerja)
4. Berdasarkan keputusan agen: keluarkan pengembalian dana (Lambda → pemroses pembayaran) ATAU kirim kupon permintaan maaf (Lambda → layanan kupon) ATAU eskalasi ke manajemen (sub-workflow Step Functions)
5. Pelanggan diberi tahu tentang hasilnya

Rancang ini sebagai workflow Step Functions. Jenis state apa yang menangani setiap langkah? Bagaimana Anda akan menangani penantian 1-3 hari? Bagaimana Anda akan memodelkan cabang di langkah 4?

*(Tidak ada jawaban benar tunggal. Tujuannya adalah berlatih desain state Step Functions.)*

**Ekstensi**: Setelah state machine selesai (cabang mana pun), ia memublikasikan kejadian `OrderDisputeResolved` ke EventBridge. Efek samping apa yang mungkin mendengarkan kejadian ini? Pertimbangkan: sistem penilaian restoran, poin loyalitas pelanggan (pengembalian dana mungkin mengurangi poin), pipeline analitik (tingkat sengketa adalah metrik kualitas restoran kunci), dan dasbor pelacakan SLA tim dukungan pelanggan. Bagaimana menggunakan EventBridge di sini menjaga state machine sengketa dari menjadi laba-laba dependensi?

## Adegan Pasca Kredit

Workflow onboarding restoran sudah aktif.

Selama sebulan berikutnya, 12 mitra restoran baru melakukan onboarding. Dua mengalami kegagalan selama langkah pemrosesan pembayaran (langkah 3). Dalam kedua kasus, Step Functions menangkap kesalahan yang tepat, menyimpan state eksekusi, dan mengirim peringatan ke tim Nimbus.

Leo memperbaiki akar penyebabnya (API key yang salah dikonfigurasi untuk penyedia pembayaran) dan mencoba ulang kedua eksekusi dari langkah 3. Eksekusi selesai dalam 23 detik masing-masing, melanjutkan dari persis tempat mereka gagal.

Tidak ada restoran yang perlu diimpor ulang. Tidak ada peran IAM yang dibuat ganda. Tidak ada email selamat datang duplikat yang dikirim.

"Sebelum Step Functions," Leo memberi tahu Maya, "ini akan membutuhkan seseorang untuk secara manual melacak apa yang sudah dan belum dilakukan untuk setiap restoran, dan secara manual menjalankan ulang langkah yang hilang."

"Dan sekarang?"

"Sekarang saya klik retry di konsol. Sistem tahu apa yang sudah selesai."

Maya memikirkan ini.

"Itu bukan sekadar peningkatan teknis," katanya. "Itu adalah perbedaan antara proses yang menskala dan yang tidak."

Pada bab berikutnya: apa yang harus dilakukan dengan data yang tidak Anda akses saat ini, tetapi pasti ingin Anda simpan selamanya.
