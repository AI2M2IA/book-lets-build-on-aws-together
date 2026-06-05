\newpage

*Hak Cipta © 2026 AI(2)M(2)IA*

*Semua hak dilindungi. Tidak ada bagian dari publikasi ini yang boleh direproduksi, didistribusikan,
atau ditransmisikan dalam bentuk apa pun atau dengan cara apa pun, termasuk fotokopi, perekaman, atau
metode elektronik maupun mekanis lainnya, tanpa izin tertulis sebelumnya dari penerbit,
kecuali dalam hal kutipan singkat yang terdapat dalam ulasan kritis
dan penggunaan nonkomersial tertentu lainnya yang diizinkan oleh hukum hak cipta.*

*Kisah Nimbus dan karakter-karakternya adalah fiktif. Kemiripan apa pun dengan
orang nyata, yang masih hidup atau sudah meninggal, atau peristiwa nyata adalah semata-mata kebetulan.*

*Layanan AWS, model penetapan harga, praktik terbaik, dan konten ujian yang dijelaskan dalam
buku ini didasarkan pada dokumentasi yang tersedia untuk umum pada tanggal publikasi.
Amazon Web Services, AWS, dan merek terkait adalah merek dagang dari Amazon.com, Inc.
atau afiliasinya. Buku ini adalah sumber daya pendidikan independen dan tidak
berafiliasi dengan, didukung oleh, atau disponsori oleh Amazon Web Services.*

*Harga dan fitur layanan AWS sering berubah. Selalu verifikasi informasi terkini
di aws.amazon.com sebelum membuat keputusan arsitektur atau keuangan.*

*Ujian AWS Solutions Architect Associate (SAA-C03) adalah ujian sertifikasi nyata.
Kunjungi aws.amazon.com/certification untuk mendaftar.*

*Edisi Pertama, 2026*

*Dicetak dan didistribusikan melalui Amazon KDP*

---

\newpage

# Catatan tentang Metode

Buku ini ditulis dengan bantuan AI dan diungkapkan dengan nama pena AI(2)M(2)IA, sesuai dengan praktik setiap volume di rak ini.

Kurikulum yang akan Anda ikuti — premisnya, karakter-karakternya, bentuk infrastruktur Nimbus dari jalur telepon restoran hingga arsitektur AWS berkelas produksi, kompromi yang dilakukan tim di bawah tekanan dan yang pertama kali mereka salah — semuanya dipilih oleh seorang penulis manusia dan dibawa, layanan demi layanan, melalui kolaborasi panjang dengan model bahasa besar. Sampul dirancang dengan bantuan model pembangkit gambar di bawah arahan yang sama. Ebook itu sendiri disiapkan oleh perangkat otomatis.

Apa yang Anda baca adalah apa yang dipertahankan.

Tidak ada klaim dalam halaman-halaman ini tentang kepengarangan tanpa bantuan; juga tidak ada klaim bahwa mesin sendirian adalah pengarangnya. Karya ini, seperti infrastruktur yang digambarkannya, ditopang oleh lapisan-lapisan yang saling bergantung satu sama lain.

---

\newpage

*Untuk semua orang yang membuka browser, mengetik perintah, dan berhasil membuat sesuatu bekerja —
dan untuk semua orang yang membuka browser, mengetik perintah, dan belajar dari apa
yang tidak berhasil.*

---

\newpage

# Kata Pengantar

Anda mungkin pernah mencoba belajar AWS sebelumnya.

Mungkin Anda membuka dokumentasi dan, sepuluh menit kemudian, mendapati diri Anda menatap sintaks kebijakan IAM sebelum Anda bahkan memahami untuk apa IAM itu.

Mungkin Anda menyelesaikan kursus video dan menyadari bahwa Anda masih tidak bisa menjelaskan di mana sebuah situs web sebenarnya berada.

Mungkin Anda menyorot panduan ujian, menghafal nama layanan, lalu terdiam ketika pertama kali sebuah skenario menanyakan apa yang akan Anda lakukan jika database gagal saat makan malam ramai.

Itu bukan kesalahan Anda.

Begitulah komputasi cloud biasanya diajarkan: sebagai katalog terlebih dahulu, dan sebagai sistem belakangan.

Buku ini bekerja secara berbeda.

**Anda tidak akan mempelajari AWS. Anda akan menggunakannya.**

Kita mulai dengan sebuah restoran yang kehilangan pesanan karena jalur telepon sibuk dan tidak ada situs web.

Dari sana, Anda akan mengikuti Maya, Tom, Priya, dan Leo saat mereka membangun infrastruktur Nimbus satu keputusan sekaligus. Bukan dalam urutan rapi yang disukai silabus sertifikasi, tetapi dalam urutan berantakan yang dituntut sistem nyata.

Pada akhirnya, Nimbus akan menangani 18.000 pesanan harian: berjalan di beberapa Availability Zone, pulih secara otomatis dari kegagalan, melayani pengguna Pantai Barat dalam milidetik melalui jaringan pengiriman konten, memproses setiap pesanan melalui pipeline analitik waktu nyata, dan menjaga biaya tetap terkendali seiring arsitektur tumbuh bersama bisnis.

Setiap layanan AWS dalam buku ini muncul pada saat ia menjadi perlu. Bukan karena silabus menuntutnya. Karena sistem membutuhkannya.

**Untuk siapa buku ini** Jika Anda belajar lebih baik melalui masalah daripada melalui dokumentasi, buku ini ditulis untuk Anda. Jika Anda sedang mempersiapkan diri untuk sertifikasi AWS Solutions Architect Associate (SAA-C03), buku ini juga untuk Anda: setiap domain ujian tercakup, dan setiap bab diakhiri dengan Tips Ujian dan pertanyaan latihan bergaya SAA-C03. Jika Anda sudah bekerja di bidang rekayasa dan ingin memahami *mengapa* keputusan arsitektur tersebut berhasil, bukan hanya apa nama layanannya, Anda akan menemukan penalaran itu di setiap halaman.

**Apa yang tidak akan Anda temukan di sini** Sebuah jalan pintas. Ini bukan panduan belajar kilat. Ini lebih panjang dari panduan belajar kilat karena pemahaman membutuhkan waktu lebih lama dari menghafal, dan pemahaman itulah yang dapat ditransfer ke peran berikutnya, sistem berikutnya, dan insiden produksi yang tidak terdokumentasi dengan baik.

**Cara membaca buku ini** Baca seperti novel pada pertama kali. Biarkan arsitektur mengungkapkan dirinya sendiri saat tim menghadapi masalah nyata dan membuat kompromi nyata. Di akhir setiap bab, berhenti dan gunakan Tips Ujian dan latihan secara aktif: tutup jawabannya, pertimbangkan skenario sendiri, dan baru kemudian periksa apa yang terjadi.

Ketika Anda selesai, Nimbus akan berada dalam produksi. Begitu juga pemahaman Anda tentang AWS.

Mari kita mulai.
