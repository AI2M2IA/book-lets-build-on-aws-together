# Bölüm 19: Bilet Makinesi

Bilet makinesi sessiz bir devrimdi. Bir bilet alın, çağrıldığınızda bekleyin. Kuyruk, bir sıraya dönüştü. İnsanlar oturabilirler. Hizmet masası kendi hızında çalışıyordu. Kimse başkasına engel olmuyordu.

Nimbus, siparişlerin popülerleşmesiyle sorunlu bir durumla karşı karşıyaydı.

Her sipariş verildiğinde, API sunucusu şunları yapıyordu:

1. Siparişi veritabanına kaydetti
2. Restoranın tabletine bir bildirim gönderdi
3. Müşteriye bir onay e-postası gönderdi
4. Restoranın analiz panosunu güncelledi
5. Faturalandırma için etkinliği kaydetti

Tüm bunlar, API'nin müşteriye yanıt vermeden önce senkron olarak gerçekleşmesi gerekiyordu. E-posta hizmeti yavaşsa (bazen öyleydi), müşteri bekledi. Analiz panosu kapalıysa (bazen öyleydi), sipariş başarısız oldu.

“Sıkı sıkıya bağlıyız,” dedi Priya. “Her bir alt işlem başarısız olursa tüm sipariş başarısız olur.”

“Eğer siparişi kaydedip müşteriye hemen onaylayabilirsek ne olurdu?” dedi Leo, “ve sonra geri kalanını arka planda işleyebilir miyiz?”

“Bu bir kuyruk,” dedi Priya.

**Deli Standı Modeli**

Yoğun bir deli standında, kasiyer bir dilimleyici bitirene kadar beklemek yerine bir sonraki müşteriye sipariş alır, ona verir ve hizmete başlar. Mutfak siparişleri kendi hızında işler.

Müşteri daha hızlı hizmet alır. Mutfak ani patlamalardan dolayı bunalmaz. Mutfak yavaş bir an yaşadığında, siparişler kayıt defterinde hatalara neden olmaktan ziyade kuyruğa doğru birikir.

Bu, **değişim**: işi kabul eden bileşeni, onu işleyen bileşenlerden ayıran şeydir.

Yazılım sistemlerinde, kuyruk genellikle bir mesaj aracıdır - üreticilerden mesajları alır ve tüketicilere ulaştıran bir hizmettir.

**Amazon SQS: Kuyruk**

**Amazon SQS (Simple Queue Service)**, AWS'nin yönetilen mesaj kuyruk hizmetidir. Mesajlar tüketiciler tarafından işlenene kadar güvenli bir şekilde saklanır.

Temel akış:

1. **Üretici** (API sunucusu), kuyruğa bir mesaj yerleştirir: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. API, müşteriye derhal yanıt verir: "Sipariş onaylandı!"
3. **Tüketiciler** (ayrı çalışan hizmetler), kuyruktan mesajları okur ve bunları işler: restoran bildirimini gönderir, onay e-posta gönderir, analizi günceller

Müşteri deneyimi: Anında onay. Alt işlemleme: İşlem, çalışanların hızına göre asenkron olarak gerçekleşir.

**SQS Temel Kavramları**

**Mesaj görünürlük süresi**: Bir tüketici, SQS'den bir mesaj okuduğunda, mesaj, tüketicilerden diğerlerine 30 saniye (varsayılan) kadar bir süre boyunca *görünmez* olur. Bu, tüketicinin onu işleme süresini sağlar. Tüketici başarılı bir şekilde bitirirse, mesajı siler. Tüketici çökerse, görünürlük süresi sona erer ve mesaj başka bir tüketiciye yeniden deneme için yeniden görünür olur.

Bu, en az bir kez teslimatını sağlar: Her mesaj, tüketici başarısız olursa bile en az bir kez işlenir.

**Ölümcü Hata Kuyrukları (DLQ'lar)**: Bir mesaj, yapılandırılmış bir şekilde (örneğin, 5 deneme) çok sayıda kez başarısız olursa, SQS onu Ölümcü Hata Kuyruğuna (DLQ) taşır. DLQ'deki mesajların neden başarısız olduğunu anlamak için DLQ'yu inceleyebilirsiniz.

**Kuyruk Türleri**:

**Standart Kuyruklar**: Maksimum akış (saniye başına sınırsız mesajlar). Teslimat sırası en iyi çabaya dayanır (garanti edilmez). En az bir kez teslimat (çok nadiren, bir mesaj iki kez teslim edilebilir).

**FIFO Kuyruklar**: İlk önce gelir, ilk önce gider (FIFO) sırasına kesin bir düzen. Tam olarak bir kez teslimat. Gruplandırma ile 3.000 mesaj/saniye, gruplandırma olmadan 300. Finansal işlemler veya ardışık durum değişiklikleri gibi sıranın önemli olduğu durumlarda kullanın.

Nimbus için, çoğu kuyruk standart kuyrukları kullanılıyordu. Faturalandırma kuyruğu, ücretlerin sırayla işlenmesini sağlamak için FIFO kullanılıyordu.

**Amazon SNS: Yayıncı**

**Amazon SNS (Simple Notification Service)**, yayın/abone (pub/sub) mesaj hizmetidir. Tek bir üreticiden, tek bir tüketimden (kuyruk) ziyade, bir mesajın *çok sayıda* aboneye aynı anda teslim edilmesini sağlar.

Model:

1. Bir **yayıncı**, bir SNS **konusuna** bir mesaj gönderir
2. Tüm **abone**lar, aynı anda (fan-out) mesajı alır
3. Abone olabilirler:

- SQS kuyrukları (mesajları asenkron olarak işlemek için kuyruğa gönderir)
- Lambda işlevleri (işlevi doğrudan tetikler)
- HTTP/HTTPS uç noktaları (webhook teslimi)
- E-posta adresleri
- SMS (telefon numaraları)

Nimbus için, yerleştirilen sipariş etkinliği, `order-events` adlı bir SNS konusuna yayınlanır:

- Restoran bildirim hizmeti abone olur (kendi SQS kuyruğuna alır)
- E-posta hizmeti abone olur (kendi SQS kuyruğuna alır)
- Analiz hizmeti abone olur (kendi SQS kuyruğuna alır)
- Faturalandırma hizmeti abone olur (FIFO SQS kuyruğuna alır)

Tek bir sipariş etkinliği. Dört abone. Hepsi aynı anda bilgilendirilir. Her biri kendi hızında işler.

“Yani SNS, duyuru,” dedi Maya, “ve SQS, her ekibin duyuruyu kendi hızında bir posta kutusunda işlediği yerdir.”

"Tamamdır," dedi Leo. "SNS/SQS fan-out, standart bir kalıptır."

**SNS/SQS Fan-Out Kalıbı**

Bu kombinasyon – SNS konusunun birden çok SQS kuyruğuna beslenmesi – AWS'deki en önemli mimari kalıplardan biridir:

```
API Server
    |
    | publishes to
    ↓
SNS Topic: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
SQS Queue         SQS Queue         SQS Queue
(notifications)  (email service)   (analytics)
    |                 |                 |
    ↓                 ↓                 ↓
Worker             Worker            Worker
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

Her şey kuyruklar arasında bağımsızdır. Analitik hizmet yavaş olabilir — kuyruğu dolar, ancak bildirim ve e-posta hizmetleri etkilenmez. Analitik hizmet çökerse, mesajları geri dönüp çalışmaya başladığında kuyrukta bekler. Hiçbir şey kaybolmaz.

Bu ana özelliktir: **bağımsız arıza**. Bir tüketiciyle ilgili sorunlar diğerlerine yayılmaz.

**Mesaj Filtreleme: Her Abonelik İçin Her Mesaj Değil**

Sistemler büyüdükçe, her aboneliğin her mesajı işlemesini istemezsiniz. Bir analitik hizmet, tamamlanmış siparişler hakkında mesajları almalıysa, başarısız ödeme işleme hakkında mesajları almamalıdır.

**SNS mesaj filtreleme**, abonelerin filtre politikelerini belirtmelerine olanak tanır — yalnızca belirli özelliklere uyan mesajları teslim eder.

Restoran bildirim hizmeti, yalnızca “onaylanmış” durumdaki mesajları teslim edecek şekilde bir filtreyle abone olur: `status = "confirmed"`.

Hata uyarı hizmeti, yalnızca “başarısız” durumdaki mesajları teslim edecek şekilde bir filtreyle abone olur.

Her abone, ihtiyacı olan tek şeyi alır.

**Ne Zaman SQS'yi Ne Zaman SNS Kullanmalıyız**

**Sadece SQS**: Bir üretici, bir tüketici (veya aynı kuyruğa birden fazla rekabetçi tüketici). Mesajlar tek seferde işlenmelidir, sırayla (FIFO) veya olmamalıdır (standart). İşçi kuyruk modeli — bir kuyruk, birden fazla işçinin ondan tüketmesi.

**Sadece SNS**: “Unut ve ateş” bildirimleri. E-posta, SMS veya HTTP uç noktalarına iletin. Mesajı kuyruğa alma ihtiyacını ortadan kaldırır — sadece bildirin ve devam edin.

**SNS + SQS (fan-out)**: Bir olay, birden fazla bağımsız tüketici. Her tüketici kendi kuyruğuna sahiptir, bağımsız olarak işler ve bağımsız olarak başarısız olabilir.

## Güçlü Yönler ve Sınırlamalar

**Neden SQS ve SNS Güçlüdür**:

- SQS, mesajların güvenli, güvenilir teslimini sağlar — mesajlar birden çok bölgeye (AZ) depolanır.
- Ayrılma, üretici ve tüketici hizmetlerinin bağımsız ölçeklendirilmesini ve dağıtımını sağlar.
- Ölü mektup kuyrukları, başarısızlıkta hiçbir mesajın sessizce kaybolmasını sağlar.
- SNS fan-out modeli, üreticiyi değiştirmeden yeni tüketicilerin eklenmesini sağlar.

**Karmaşık Olduğu Yer**:

- En az bir kez teslimat, tüketicilerin idempotent olması gerektiği anlamına gelir — aynı mesajın iki kez işlenmesi sorunlara neden olmamalıdır (çift siparişler, çift ücretler).
- FIFO kuyrukları daha pahalıdır ve daha düşük bant genişliğine sahiptir.
- Başarısız mesajların birden çok kuyruk ve hizmet arasında hata ayıklanması, iyi günlükleme ve gözlemlenebilirlik gerektirir.
- Mesaj sıralama garantileri sınırlıdır — birden çok hizmet arasında kesin sıralama önemliyse, tasarım karmaşıklık kazanır.

## Özet

- **Ayrılma**, işi üreten bileşenleri işi işleyen bileşenlerden ayırır.
- **SQS** yönetilen bir kuyruktur. Üreticiler mesajlar gönderir; tüketiciler okur ve bunları asenkron olarak işler.
- **SQS Standart**: Yüksek bant genişliği, en iyi çaba ile sıralama, en az bir kez teslimat.
- **SQS FIFO**: Kesin sıralama, tam olarak bir kez teslimat, daha düşük bant genişliği.
- **SNS** bir yayın/abone hizmetidir. Bir mesaj, çok sayıda abone aynı anda alır.
- **SNS + SQS fan-out**: Bir olayın birden fazla bağımsız işlem hattını tetikleme standardı. “Sipariş yerleştirme bildirimi e-posta, SMS ve envanter güncellemelerini aynı anda tetiklemeli” → SNS konusuyla SQS abonelikleri.
- **Ölü mektup kuyrukları**: Ret başarısız olduğunda N kez sonra hareket ettirilen mesajlar.
- **Idempotent**: Tüketicilerin yinelenen mesajları güvenli bir şekilde işlemesini sağlamak.

## Sınav İpuçları

*SAA-C03 Alan: Dayanıklı Mimarileri Tasarla (Alan 2, Görev 2.1)*

- **SQS Standart vs FIFO**: Sınav, sıralama ve teslimat garantileri açısından ayrım yapar. “Sırayla işlem yapılmalı” → FIFO. “Maksimum bant genişliği” → Standart.
- **Görünüm zamanı**: En az bir kez teslimat için önemli bir kavram. Bir tüketici başarısız olursa, mesaj timeout süresinden sonra yeniden görünür. Sınav senaryosu: “Mesajlar iki kez işleniyor” → görünüm zamanı çok kısa (tüketici timeout süresinden daha uzun süre mesajı işler).
- **Ölü mektup kuyruğu**: Başarısızlıkların ardından N kez yeniden deneme sonrasında hareket ettirilen mesajlar. Sınav senaryosu: “Başarısızlıklar nedeniyle bile hiçbir mesaj kaybolmamalıdır” → DLQ.
- **SNS fan-out**: Bir olayın birden fazla tüketiciyi tetikleme klasik sınav modeli. “Sipariş yerleştirme bildirimi e-posta, SMS ve envanter güncellemelerini aynı anda tetiklemeli” → SNS konusuyla SQS abonelikleri.
- **SQS + Lambda**: Lambda, SQS kuyruğuna poling yaparak ve her parti mesaj için tetikleyerek yapılandırılabilir. Sınav, ölçekte olay odaklı işleme için kullanılır.
- **SQS uzun poling**: Tüketicilerin her birkaç saniyede bir poling yapması yerine (kısa poling, API çağrılarını boşa harcar), uzun poling, 20 saniye boyunca bir mesaj için bekler. Maliyetleri azaltır ve boş yanıtların yanlış algılanmasını önler.

## Uygulama Örnekleri

**Uygulama 1 — Hatırlama**

SNS/SQS fan-out modelini açıklayın. Modelin SQS kuyruklarını kullanarak SNS konusuna doğrudan abone olmaktan neden kullanması gerekir?

*(İpucu: Bir uç nokta çalışmıyorsa ne olur diye düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir e-ticaret platformu, saatte 10.000 sipariş işliyor. Bir sipariş verildiğinde, sistem şu adımları tamamlamalıdır: (1) siparişi veritabanında saklamalı, (2) envanteri azaltmalı, (3) bir onay e-postası göndermeli ve (4) analitik panosunu güncellemeli. Şu anda, dört adım da senkron olarak gerçekleşiyor — analitik hizmet yavaşsa, müşteriler bekliyor. Takım, müşteri tarafındaki yanıt süresini iyileştirirken hiçbir siparişin kaybedilmesini sağlamak istiyor.

Hangi mimari bu gereksinimi en iyi karşılar?

A) Tüm dört adımı sıralı olarak işlemek için SQS FIFO kuyruklarını kullanın.
B) API, siparişi kaydetmeli ve müşteriye hemen onay vermeli; bir SNS konusuna bir olay yayınlamalı; envanter, e-posta ve analitik hizmetler, SQS kuyruklarına bağımsız olarak abone olmalı.
C) Her adımı eş zamanlı olarak işlemek için paralel EC2 örneklerini kullanın.
D) Sipariş işleme hızını artırmak için API Gateway ile istek doğrulama kullanın.

**İpucu 1**: Müşteri onayı derhal olmalı. Hangi adımlar yanıt vermeden önce gerçekleşmeli ve hangileri yanıt verdikten sonra gerçekleşebilir?

**İpucu 2**: Yavaşlayan analitik hizmet, e-posta veya envanter hizmetlerini etkilememeli.

**İpucu 3**: SNS fan-out, tüm üç alt hizmetin aynı anda olayı almasını sağlar.

**Cevap**: B

**Açıklama**: API, siparişi veritabanına kaydeder (senkron — yanıt vermeden önce yapılmalı) ve hemen bir onay verir. Ardından, "sipariş verildi" adlı bir olay, bir SNS konusuna yayınlanır. Envanter, e-posta ve analitik hizmetler, bağımsız SQS kuyruklarına abone olur. Onlar kendi hızlarında işlem yapar — analitik yavaşsa, kuyruğu büyür ancak diğer hizmetler etkilenmez. Herhangi bir hizmet başarısız olursa, mesajları SQS kuyruğunda kalır ve yapılandırılmış sayıda başarısız deneme sonrasında DLQ'ya taşınır.

**Neden A?** FIFO kuyruklar mesajları sıralı olarak işler — bu, senkron yavaşlamaya yardımcı olmaz. Ayrıca, sıralı işlem, analitik hizmetin müşteriye yanıt vermesini engellemeye devam etmesi anlamına gelir.

**Neden C?** "Eş zamanlı olarak işleyen paralel EC2 örnekleri" hala tüm adımların müşteriye yanıt vermeden önce tamamlanmasını gerektirir. Örnek eklemek, senkron bağlantıyı çözmez.

**Neden D?** API Gateway, API yönlendirme ve doğrulama hızlandırır, ancak alt hizmetlerin işlenmesini ayırmaz.

*SAA-C03 Alanı: Dayanıklı Mimarileri Tasarla — Görev 2.1*

**3. Egzersiz — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus, restoran ortakları için bir bildirim sistemi oluşturuyor. Bir müşteri sipariş verdiğinde, restoran aşağıdaki yollarla bilgilendirilmelidir:

- Tablet uygulamaları (push bildirimleri)
- Yerel donanımlarında bir mutfak ekran sistemi (HTTP webhook'ları)
- Tablet bildirimleri başarısız olursa (alternatif olarak) SMS

Tablet bildirim hizmeti güvenilirdir. Mutfak webhook'ı bazen kapalıdır (restoranlar kapanışta donanımlarını kapatır). SMS yalnızca tablet bildirimleri başarısız olduğunda ateşlenmelidir.

SNS ve SQS kullanarak mimariyi tasarlayın. "Tablet başarısız olduğunda SMS'i ateşle" gereksinimi nasıl ele alınır? Mutfak webhook'ının tablet bildirimini kapalıyken engellemesini nasıl sağlarsınız?

*(Tek bir doğru cevap yoktur. Amaç, koşullu yönlendirme ile fan-out tasarımı uygulamaktır.)*

## Kapanış Sahnesi

Yeni iş akışı canlı hale getirildi.

Müşteriler siparişler veriyorlardı. API 95 milisaniyede yanıt veriyordu. Onaylar telefonlarına anında görünüyorlardı.

Arka planda: dört hizmet senkron olarak işlem yapıyordu. Analitik hizmet, öğe adında belirli özel karakterler içeren siparişlerde çöktü. Kuyruğu iki saat boyunca 3.200 mesajla doldu.

Müşteriler farkında değildi.

Leo hatayı düzeltip analitik hizmet yeniden başladıktan sonra, gecikmiş mesajları 18 dakikada işledi. Hiçbir veri kaybolmadı. DLQ boştu.

"Bu, ayrılmanın ne demek olduğunu gösteriyor," Priya dedi.

Tom, SQS fiyatlandırma sayfasını okuyordu. "Milyon istek başına 0,40 dolar."

"Bu kötü mü?"

"Mevcut hacmizde yaklaşık on iki dolar bir ay." Ekrandaki bakışıyla şaşkınlığını gösterdi. "Daha fazla bekliyordum."

Çok ucuz bir şeyin aslında çok iyi olduğunu keşfetti.

Sonraki bölümde: bir şeyi çalarken çalışan ve kimse çalmadığında hiçbir maliyet gerektirmeyen fonksiyon.
