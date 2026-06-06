# Bölüm 22: Kendini Çalıştıran Akış Şeması

Leo bir saattir aynı günlük dosyasına bakıyordu. Yığın izleri (stack trace) tek tek yeterince açıktı, ama aralarındaki kalıbı—bir adımın sessizce başarısız olması ve bir sonraki adımın yine de çalışması—görmesi biraz zaman aldı. Sonunda geriye yaslandı, kahvesini bıraktı ve not defterine tek bir kelime yazdı: *koordinasyon*.

Bir orkestra şefinin performansın ortasında kürsüden inmesini hayal edin. Orkestra çalmaya devam eder—ama 47. ölçüde bakırları (brass) girdirecek kimse yok, finalden önceki sessizliği işaret edecek kimse yok. Bireysel müzisyenler bölümlerini doğru çalar. Performans yine de dağılır, çünkü bölümler kimsenin yönetmediği bir koordinasyona bağlıdır.

İşte Leo'nun sipariş onay kodunda bulduğu sorun buydu. Herhangi bir adımdaki bir hata değil. Bir koordinasyon arızası.

---

Konteynerler doğru çalışıyordu ve temiz bir şekilde dağıtılıyordu. ECS dağıtım hattı sağlamdı. Ama uygulama kodunun içinde, haftalardır farklı türde bir arıza birikiyordu. Konteynerler iyiydi. İçlerinden birinin mantığı değildi.

Leo kalıbı günlüklerde takip ediyordu ama olayları sayana kadar onu anlamamıştı.

On bir kez. İki haftada.

---

Nimbus'taki bir sipariş onayı, beş şeyin sırayla gerçekleşmesini gerektiriyordu: kartı ücretlendir, onay e-postasını gönder, restorana bildir, envanteri güncelle ve işlemi muhasebe için kaydet.

Leo orijinal sipariş onay fonksiyonunu yazdığında, tüm işi tek bir `try/except` bloğuna sarmış ve "iyi olacak—hataları günlüklerde yakalarız" demişti. Bu sekiz ay önceydi.

İyi değildi.

Üçüncü adım başarısız olursa—restoran bildirimi zaman aşımına uğrarsa—birinci ve ikinci adımlar zaten gerçekleşmişti. Müşteri ücretlendirildi. E-posta gönderildi. Ama restoran siparişin var olduğunu bilmiyordu.

Leo bu hata kategorisi için bir isim koymuştu: kısmi başarı (partial success). "Her şey çalıştı," dedi, "önemli olan kısım hariç."

"Bu kaç kez oldu?" diye sordu Maya.

"Son iki haftada on bir kez. Çoğunu restorana yapılan öfkeli aramalardan yakaladık. İkisini günlüklerde, olaydan sonra bulduk."

"Yani koordinasyonumuz yok," dedi Priya. "Bir komut dosyası olarak çalışan, hepsinin tamamlanacağına dair garanti olmayan beş adım. Peki birisi ikinci adım sırasında—ücret geçtikten sonra ama restoran bilgilendirilmeden önce—içeri girmeye çalışırsa? Restoranın sahip olmadığı bir sipariş için müşteriyi zaten ücretlendirdik."

"Ya da doğru sırada tamamlanacaklarına dair."

"Ya da hangisinin başarısız olduğunu bileceğimize dair."

Leo kodu projektörde açtı. Bir Python fonksiyonuydu: elli satır, beş sıralı API çağrısı, tüm işin etrafında tek bir try/except bloğu.

"Bir iş akışına ihtiyacımız var," dedi Maya. "Her adımı izleyen bir şey. Bekle—ama mevcut Python fonksiyonuna *neden* sadece daha iyi hata işleme ekleyemiyoruz? Neden tamamen yeni bir hizmete ihtiyacımız var?"

"Çünkü daha iyi hata işleme hâlâ herhangi bir noktada başarısız olabilen tek bir süreçte çalışır," dedi Leo. "Sunucu yürütmenin ortasında yeniden başlarsa, hata işleme de onunla birlikte yeniden başlar. Step Functions durumu harici olarak kalıcı kılar."

Bir üretim kontrol listesi düşünün—her istasyonun bir sonrakine geçmeden önce tamamlanmayı onayladığı ve bir şey başarısız olduğunda tüm hattın konumunu koruduğu bir tane. Hat baştan başlamaz. Başarısız olan tam istasyondan devam eder. O istasyonun durumu kaydedilir. Ondan önceki adımlar tamamlanmıştır ve tekrarlanmaz. Ondan sonraki adımlar sorun çözülene kadar bekler.

İşte sipariş onay akışının ihtiyaç duyduğu şey buydu. Sorunun etrafında daha fazla kod değil. Sorunu yönetmek için tasarlanmış bir sistem.

**AWS Step Functions: İş Akışlarını Orkestre Etme**

**AWS Step Functions**, bir uygulamanın adımlarını görsel bir iş akışı olarak koordine eden sunucusuz bir orkestrasyon hizmetidir. Her adım, bir **durum makinesindeki (state machine)** bir **durumdur (state)**.

Yukarıdan aşağıya çalışan ve çöken bir Python komut dosyası yerine, iş akışını bir JSON/YAML durum makinesi olarak tanımlarsınız:

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

Her durum şunları yapabilir:

- **Bir Lambda fonksiyonu yürütme** (en yaygın kalıp)
- **Bir ECS görevi yürütme** (daha uzun süreli iş için)
- **Belirli bir zamanı** veya **olayı bekleme** (harici bir şey gerçekleşene kadar iş akışını duraklatma)
- **Koşullara göre bir yol seçme** (if/else mantığı)
- **Paralel dalları aynı anda çalıştırma**
- **Arızada yeniden deneme** (yapılandırılabilir geri çekilmeyle)
- **Hataları yakalama** ve hata işleme durumlarına yönlendirme

Step Functions yürütme durumunu dayanıklı bir şekilde yönetir. Adım 3 başarısız olursa, yürütme adım 3'te duraklar. Başarısız yürütmeyi konsolda inceleyebilir, sorunu düzeltebilir ve adım 3'ten yeniden başlatabilirsiniz—adım 1 ve 2'yi tekrarlamadan.

Şunu merak ediyor olabilirsiniz: yeniden deneme mantığını sadece Lambda fonksiyonunuza yazamaz mısınız? Evet—ama o zaman aynı zamanda kodda arıza izleme, durum kalıcılığı ve denetim günlüğü de yazıyorsunuz. Ve 7 adımdan 3'üncüsü başarısız olduğunda, hangi restoranın işlendiğini, daha önce ne olduğunu ve nereden devam edeceğinizi bilmeniz gerekir. Step Functions bunların hepsini yapar.

**Nimbus Sipariş Akışı: Açıklamalı Durum Makinesi**

İşte Nimbus'un sipariş onayı için inşa ettiği gerçek Step Functions durum makinesinin basitleştirilmiş bir versiyonu—her parçanın ne yaptığını görebilmeniz için açıklamalı:

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

Dikkat edilecek birkaç şey:

**`ChargeCard`'ın iki Catch yan tümcesi var.** Biri `PaymentDeclinedError` için (bilinen, beklenen bir arıza—kart reddedildi, bir sistem hatası değil) ve biri `States.ALL` için (başka her şey—bir sistem kesintisi, bir zaman aşımı, beklenmeyen bir istisna). Farklı şeyler ifade ettikleri için farklı durumlara yönlendirilirler.

**`NotifyRestaurant`'ın `RestaurantNotificationFailed`'e yönlendiren bir Catch'i var.** Bu, on bir olaya neden olan hatadır. Eski Python komut dosyasında bunun bir karşılığı yoktu—bildirim başarısız olursa, fonksiyon ya sessizce çökerdi ya da bir hata günlüğe kaydeder ve devam ederdi. Step Functions arıza yolunu açık hâle getirir: belirli bir yere gider ve o yer, birinin araması gerekmeden önce destek ekibini uyarır.

**Her Task'ın Retry'ı var.** E-posta hizmetinin geçici bir zaman aşımı varsa, otomatik olarak, üç kez, artan geri çekilmeyle yeniden dener. Müşteri bunu hiç görmez. Sipariş kaybolmaz.

**Akış bir komut dosyası değil, bir grafiktir.** `NotifyRestaurant` kalıcı olarak başarısız olursa (yeniden denemelerden sonra), yürütme `UpdateInventory`'ye devam etmez. İş akışı `RestaurantNotificationFailed`'de durur. Siparişten haberi olmayan bir restoran için envanter güncellenmez. Bu doğru davranıştır.

"Bekle—ama ödeme reddedildi vs sistem hatası için *neden* ayrı arıza yollarına ihtiyacımız var?" diye sordu Maya.

"Çünkü tamamen farklı yanıtlar gerektirirler," dedi Leo. "Reddedilen bir kart, müşteriye e-posta gönderip tekrar denemesini istememiz demek. Ücretlendirme fonksiyonundaki bir sistem hatası, Lambda fonksiyonunun neden başarısız olduğunu araştırması için bir mühendise ihtiyacımız olduğu demek. Aynı gözlemlenebilir sonuç—sipariş gerçekleşmedi—ama tamamen farklı bir çözüm."

**Durum Türleri: Yapı Taşları**

**Task**: Bir eylem yürüt—bir Lambda fonksiyonu çağır, bir ECS görevi başlat, bir API çağır. Gerçek işin gerçekleştiği yer burasıdır.

**Choice**: Girdi verisindeki koşullara göre dallan. Koddaki bir if/else gibi.

**Parallel**: Birden fazla dalı aynı anda çalıştır ve hepsinin tamamlanmasını bekle.

**Map**: Bir listedeki her öğeye bir dizi durum uygula. 50 restoran menü öğesini paralel olarak işle.

Nimbus bir restoranın menüsünü içe aktardığında, menü 8 ile 200 arası öğe içerebiliyordu. Her öğe için, içe aktarma süreci şunları yapmalıydı: formatı doğrula, alerjen verilerini kontrol et, fotoğrafı yeniden boyutlandır ve kaydı DynamoDB'ye yaz.

Map durumu olmadan, bu öğeleri sırayla işleyen tek bir Lambda olurdu—200 öğe × öğe başına 200ms = 40 saniye işleme süresi. Map durumuyla, Step Functions işleme durumlarının eş zamanlı yürütmelerini başlatır—yapılandırılan eş zamanlılık sınırına kadar—ve hepsinin tamamlanmasını bekler. Aynı 200 öğe 5 saniyenin altında bitebilir.

**Wait**: Belirli bir süre veya bir zaman damgasına kadar duraklat. Zamanlanmış gecikmeler için yararlı.

**Pass**: İş yapmadan girdiyi çıktıya geçir. Veri dönüşümü ve test için kullanılır.

**Succeed/Fail**: Yürütmeyi sonlandıran terminal durumlar.

Restoran katılımı (onboarding) için, Leo bir iş akışı tasarladı:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, 3 yeniden denemeli)
3. Paralel dal:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, paralelin tamamlanmasını bekler)
5. NotifySalesTeam (Task → Lambda)

3a ve 3b adımları paralel çalışır—birbirlerine bağlı değildirler ve onları aynı anda çalıştırmak zaman kazandırır.

İlk restoran grubu katılımı tamamladıktan sonra, bir uyumluluk gereksinimi ortaya çıktı: bir restoran ortağı yayına geçmeden önce, bir Nimbus hesap yöneticisinin lisans dokümantasyonunu manuel olarak incelemesi ve onaylaması gerekiyordu. Bu bir ila üç iş günü sürebilirdi.

"Peki birisi o pencere sırasında içeri girmeye çalışırsa?" diye sordu Priya. "Restoran kısmen yapılandırılmışsa—ödeme hesabı oluşturulmuş ama henüz onaylanmamış—ve birisi bekleyen durumu keşfederse, yarı açık yapılandırmayı istismar etmeye çalışabilir."

Daha pratik olarak: bir Step Functions iş akışını bir insanı beklemek için üç gün boyunca nasıl duraklatırsınız?

Cevap, **görev tokenı (task token) ile geri arama (callback) kalıbıdır**.

`ValidateLicense` çalıştığında, otomatik olarak tamamlanmak yerine, üç şey yapan bir Lambda çağırır:

1. Hesap yöneticisine restoranın belgeleriyle bir e-posta gönderir
2. O bekleyen incelemeyle ilişkili olarak bir veritabanına bir **görev tokenı** (Step Functions'ın bu belirli yürütme ve durum için ürettiği benzersiz bir tanımlayıcı) kaydeder
3. `.waitForTaskToken` ile Step Functions'a geri döner—bu, Step Functions'a yürütmeyi bu durumda süresiz olarak duraklatmasını söyler

Step Functions yürütmeyi park eder. Başka hiçbir şey engellenmez—hiçbir sunucu beklemede oturmaz. Durum makinesi sadece bekler, hiçbir işlem kaynağı tüketmez.

Üç gün sonra, hesap yöneticisi dahili yönetici aracında "Onayla"ya tıklar. Yönetici aracı veritabanından görev tokenını bulur ve şunu çağırır:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions devam eder. Yürütme, incelemecinin bilgisi iş akışı durumunda mevcut olarak, adım 2'den (`ImportMenu`) devam eder.

"Yürütme üç gün boyunca duraklatıldı," dedi Leo, "ve onu onayladığımda gerçekleşen tek şey bir API çağrısıydı."

"Ya hesap yöneticisi reddederse?" diye sordu Maya.

"Bunun yerine `send_task_failure` çağırırız. Durum makinesi bunu yakalar ve restoran ortağına e-posta gönderen bir `NotifyRejection` durumuna yönlendirir."

Step Functions yoklama yapmaz. Yeniden denemez. Zaman aşımına uğramaz (bir kalp atışı zaman aşımı ayarlamadığınız sürece). Sadece geri arama gelene kadar bekler, sonra devam eder. Bu, bir veritabanını veya kuyruğu yoklamaktan temelde farklıdır—ve Step Functions'ın otomatik ve manuel adımları karıştıran iş akışları için neden çok uygun olduğunun nedenidir.

**Yürütme Konsolunu Okuma: Bir Arıza Nasıl Görünür**

Nimbus'un Step Functions'taki ilk haftasında restoran bildirim Lambda'sı zaman aşımına uğradığında, Leo Step Functions konsolunu açtı ve başarısız yürütmeye tıkladı.

**Yürütme Olay Geçmişi (Execution Event History)** tam olarak ne olduğunun bir zaman çizelgesini gösterdi:

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

42 saniyede, Step Functions kartı ücretlendirmiş, e-postayı göndermiş, restoran bildirimini üç kez denemiş, arızayı yakalamış, destek ekibini uyarmış ve tam geçmişi kaydetmişti. Step Functions'tan önce, bu arıza görünmez olurdu—Python fonksiyonu "bildirim başarısız" diye günlüğe kaydeder ve hiçbir şey yanlış değilmiş gibi çağırana 200 döndürürdü.

"Zaman çizelgesi işlerin tam olarak nerede ve ne zaman ters gittiğini gösteriyor," dedi Leo. "Ve her yeniden deneme girişimi zaman damgalı. Geri çekilme aralıklarını görebilirsiniz."

Priya konsola baktı. "Peki bu geçmiş ne kadar saklanıyor?"

Standart iş akışı yürütme geçmişi 90 gün boyunca saklanır. Uyumluluk veya uzun vadeli denetim için, yürütme olayları CloudWatch Logs'a da dışa aktarılabilir ve süresiz olarak saklanabilir.

**Standard vs Express İş Akışları**

Step Functions iki iş akışı türü sunar:

**Standard iş akışları**:

- Maksimum süre: 1 yıl
- Yürütmeler dayanıklıdır—durum kalıcı kılınır, incelenebilir ve denetlenebilir
- Tam olarak bir kez yürütme (bir Retry yapılandırmadıkça bir görev birden fazla kez asla çalıştırılmaz)
- Durum geçişi başına fiyatlandırılır
- Uzun süreli, önemli iş akışları için en iyisidir (sipariş işleme, katılım, ödeme akışları)

**Express iş akışları**:

- Maksimum süre: 5 dakika
- Daha yüksek verim—saniyede 100.000'e kadar
- En az bir kez yürütme (asenkron) veya en fazla bir kez (senkron)—görevleri idempotent olacak şekilde tasarlayın
- Süreye göre fiyatlandırılır (Lambda gibi)
- Yüksek hacimli, kısa süreli iş akışları için en iyisidir (gerçek zamanlı olay işleme, IoT veri alımı)

"Bu ayda ne kadara mal oluyor?" diye sordu Tom, fiyatlandırma sayfasını açarak. "Standard için durum geçişi başına—çok adımınız varsa bu birikir."

Leo matematiği gözden geçirdi. Restoran katılım iş akışı için (yürütme başına altı görev durumu, ayda kabaca 12-15 yeni restoran): yüzden az durum geçişi—bir sentten az ve tamamen 4.000-geçişlik aylık ücretsiz katmanın içinde, yani fiilen 0 dolar. Tam Nimbus trafiğinde sipariş onay iş akışı için: daha anlamlı, ama hâlâ ayda on bir kısmi başarıyı manuel olarak ayıklama maliyetinin epeyce altında.

"Ayıklama zamanı gizli maliyettir," dedi Leo.

"Gizli maliyet her zaman odur," dedi Tom.

Tom sayıları daha dikkatli çalıştırdı, çünkü Tom buydu.

**Nimbus'un sipariş onay akışı için Standard iş akışı maliyeti**: mutlu yolda sipariş başına beş durum, durum geçişi başına 0,000025 dolardan. Beş durum geçişi × 0,000025 $ × ayda 15.000 sipariş = **ayda 1,88 $**. On katı sipariş hacminde: ayda yaklaşık 19 dolar. Bir kısmi başarı olayı için ayıklama maliyeti (24 dakikalık destek mühendisi zamanı), aylık Step Functions faturasını defalarca aştı.

Karşılaştırma, birisi yüksek frekanslı analiz olayları için Standard iş akışları kullanmayı önerirse önemli hâle gelir. Diyelim ki Nimbus, her ham tıklama akışı (clickstream) olayını—her menü sayfası görüntüleme, her kaydırma, her arama—işlemek için Step Functions kullanmak istedi. Bu mevcut ölçeklerinde günde kabaca 800.000 olaydır. Her olay için beş durumlu bir Standard iş akışı: 800.000 × 5 × 0,000025 $ × 30 gün = **ayda 3.000 $**. Bir analiz hattı için bu gerçek paradır.

Aynı hacim için Express iş akışları: durum geçişi başına değil, istek artı süreye göre fiyatlandırılır. 24 milyon aylık yürütme, milyon istek başına 1,00 dolardan = 24 dolar. Süre: 24M × 500ms, 64MB faturalandırma minimumunda ≈ 208 GB-saat × 0,06 $ = 12,50 $. Toplam ≈ **ayda 36,50 $**—Standard'ın 3.000 dolarından neredeyse iki kat daha ucuz.

"Yani iş akışı türü sadece mimari bir karar değil," dedi Tom. "Bir maliyet kararı. Aynı sayıda durum, hangi iş akışı türünü kullandığınıza bağlı olarak neredeyse yüz kat daha pahalıya mal olabilir."

"Ve hangisinin daha iyi olduğu tamamen iş akışının ne yaptığına bağlı," dedi Leo. "Sipariş onayı: Standard. Önemli, anlamlı arıza yolları var, denetim izini istiyoruz. Analiz olay işleme: Express. Yüksek hacim, kısa süre ve her sayfa görüntülemesi için 90 günlük yürütme geçmişine ihtiyacımız yok."

Sürecinizin iki adımı varsa ve bir denetim izine ihtiyacı yoksa, basit bir Lambda fonksiyonu daha ucuzdur ve hiçbir JSON durum makinesi sözdizimi gerektirmez—ama herhangi bir adım bağımsız olarak başarısız olabilir ve daha önceki adımları tekrarlamadan yeniden denenmesi veya yeniden başlatılması gerekiyorsa, Step Functions azaltılmış ayıklama ve manuel düzeltmeyle kendini amorti eder.

Nimbus'un restoran katılımı için: Standard (önemli, dayanıklı, manuel adımlar söz konusuysa saatler sürebilir).

Nimbus'un gerçek zamanlı sipariş durumu güncellemeleri için: Express (yüksek hacim, kısa süre, daha az kritik).

**Olay Odaklı Mimari: Daha Büyük Resim**

Step Functions daha büyük bir kalıbın bir parçasıdır: **olay odaklı mimari (event-driven architecture)**. Hizmetlerin birbirini doğrudan çağırması (sıkı bağlantı) yerine, hizmetler olaylar yayar ve diğer hizmetler bu olaylara tepki verir.

Bunu kitap boyunca gördük:

- Siparişler verildi → SNS olay yayınlar → SQS kuyrukları tüketicilere teslim eder
- S3 dosyası yüklendi → Lambda onu işlemek için tetiklenir
- DynamoDB kaydı değişti → DynamoDB Streams → Lambda bir önbelleği günceller

**Amazon EventBridge** (eski adıyla CloudWatch Events), bu kalıp için gelişmiş olay veriyoludur (event bus). AWS hizmetlerinden ve kendi uygulamalarınızdan gelen olayları kurallara göre hedeflere (Lambda, SQS, Step Functions, vb.) yönlendirir.

EventBridge mimari düzeyde gevşek bağlamaya olanak tanır: sipariş hizmeti, kimin dinlediğini bilmeden `order.placed` olayları yayınlar. Analiz hizmeti, bildirim hizmeti ve sadakat puanı hizmeti hepsi bağımsız olarak dinler. Yeni bir dinleyici eklemek, sipariş hizmetini değiştirmeyi gerektirmez.

EventBridge ayrıca düzinelerce AWS hizmetiyle **olay kaynağı (event source)** olarak yerel olarak entegre olur. Bir CloudTrail API çağrısı bir kalıpla eşleştiğinde, EventBridge bir kural tetikleyebilir. Bir EC2 örneği durum değiştirdiğinde, EventBridge bir Lambda tetikleyebilir. Bir RDS örneği geçiş yaptığında, EventBridge nöbetçi mühendisi uyarabilir. Tüm AWS kontrol düzlemini bir olay akışı olarak ele alabilirsiniz.

Nimbus için, özellikle yararlı bir EventBridge kuralı: ECR'ye yeni bir imaj gönderildiğinde bir Lambda tetiklemek. Lambda imaj tarama sonucunu kontrol eder ve herhangi bir YÜKSEK veya KRİTİK CVE bulunursa mühendislik Slack kanalına gönderir—herhangi biri imajı dağıtmadan önce. Bu, ECR'nin güvenlik taramasını (bölüm 21'den) EventBridge'in olay yönlendirmesiyle otomatik bir güvenlik kapısına birleştirir.

Olay odaklı mimari ilkesi, Step Functions'ın yeniden deneme mantığıyla aynıdır: arızayı sessiz ve yutulmuş değil, açık ve yönlendirilmiş yapın. Olaylar aracılığıyla iletişim kuran hizmetler zarif bir şekilde başarısız olur—bir `OrderConfirmed` olayı tetiklendiğinde sadakat puanı Lambda'sı kapalıysa, EventBridge teslimatı yeniden deneyebilir veya bir ölü mektup kuyruğuna gönderebilir. Sipariş onayının kendisi etkilenmez. Ayrıştırma, dayanıklılıktır.

**EventBridge: Yan Etkileri Ana Akıştan Ayırma**

Sipariş onay durum makinesi temiz bir şekilde çalıştıktan sonra, Maya bir sonraki mimari incelemesinde bir soru sordu.

"Bir sipariş onaylandığında sadakat puanı eklemek istiyoruz. Müşteri harcanan her dolar için bir puan alıyor. Bu, durum makinesinde nereye gidiyor?"

Leo'nun ilk içgüdüsü: `LogTransaction`'dan sonra bir `GrantLoyaltyPoints` durumu eklemek.

Priya'nın yanıtı: "Peki sonra tavsiye bonusları eklediğimizde? Ve sipariş sonrası anketler? Ve restoran derecelendirme istekleri? Her biri kritik yola bir durum ekler. Sadakat puanı Lambda'sı başarısız olursa, tüm sipariş onayı başarısız olur."

"Sipariş onay akışı tek bir şey yapmalı," dedi. "Siparişi onayla. Geri kalan her şey bir yan etki."

Bu, ana iş akışından yan etkileri gevşek-bağlamak için bir mekanizma olarak **Amazon EventBridge** için mimari argümandır.

Gözden geçirilmiş yaklaşım: `LogTransaction` durumu başarıyla tamamlandığında, Lambda EventBridge'e bir olay yayınlar:

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

Sonra EventBridge kuralları o olayı bağımsız hedeflere yönlendirir:

- **Kural 1**: `OrderConfirmed` → Sadakat Puanı Lambda'sı (32 dolarlık bir sipariş için 32 puan verir)
- **Kural 2**: `OrderConfirmed` → Sipariş Sonrası Anket Lambda'sı (teslimattan 2 saat sonra için bir anket kuyruğa alır)
- **Kural 3**: `OrderConfirmed` → Analiz Kinesis Akışı (gerçek zamanlı panoyu besler)

Her kural bağımsızdır. Sadakat Puanı Lambda'sı, anket kuyruğunu etkilemeden başarısız olabilir. Analiz hattı, sadakat sistemini engellemeden geride kalabilir. Yeni bir yan etki (bir restoran derecelendirme isteği, bir geri ödeme bildirimi) eklemek, durum makinesini değiştirmeyi değil, yeni bir EventBridge kuralı oluşturmayı gerektirir.

"Peki birisi bir EventBridge kuralı aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "Olay müşteri PII'si (kişisel olarak tanımlanabilir bilgi) içeriyorsa, onu alan her Lambda artık bir PII erişim noktasıdır."

Olay dikkatlice tasarlandı: yalnızca kimlikler, isimler, adresler veya ödeme detayları değil. Müşteri verisine ihtiyaç duyan herhangi bir Lambda, müşteri kimliğini kullanarak onu veritabanından arardı—neye erişebileceğini kontrol eden kendi IAM izinleriyle.

"Olay bir sinyaldir," dedi Priya. "Bir veri dökümü değil."

**Step Functions Doğru Araç Olduğunda**

Step Functions şunlara sahip olduğunuzda mükemmeldir:

**Adımlar arasında ilerlemeyi izlemesi gereken çok adımlı iş akışları**

**İnsan-döngüde (human-in-the-loop) süreçler**—Step Functions, harici bir olayı (bir insanın bir şeyi onaylaması gibi) süresiz olarak bekleyebilir ve sonra devam edebilir

**Ölçekte hata işleme**—birçok adım arasında yerleşik yeniden deneme, yakalama ve geri dönüş mantığı

**Denetlenebilir süreçler**—her yürütme her durum geçişini kaydeder. Tam olarak ne olduğunu ve ne zaman olduğunu görebilirsiniz.

**Karmaşık paralel veya sıralı mantık**—görsel iş akışı, eşdeğer koddan akıl yürütmesini kolaylaştırır

Step Functions basit iki adımlı süreçler için aşırıya kaçmaktır. Koordinasyonun kendisi değerli olduğunda ve arıza senaryoları önemli olduğunda kullanın.

**Step Functions Yanlış Araç Olduğunda**

"Bekle—ama *neden* her şey için Step Functions kullanmayalım?" diye sordu Maya tasarım oturumunun sonunda. "Restoran katılım iş akışını inşa ettik. Sipariş onay akışımız var. Neden her şeyi durum makinelerine dönüştürmeyelim?"

Dürüst cevap: çünkü Step Functions her iş akışının haklı çıkarmadığı bir ek yük ekler.

**Basit iki adımlı süreçler**: İkinci bir Lambda çağırarak yüklenen bir dosyayı işleyen bir Lambda'nız varsa, bir durum makinesinin koordinasyon ek yükü operasyonel faydaya değmez. Tek bir fonksiyon içinde sırayla çağrılan iki Lambda daha basittir, test edilmesi daha kolaydır ve durum geçişi başına maliyeti yoktur.

**Ultra yüksek frekanslı, saniyenin altı iş akışları**: Standard iş akışları, yüksek hacimde biriken önemsiz olmayan bir durum geçişi başına maliyete sahiptir (yukarıdaki analiz örneğinin gösterdiği gibi). Express iş akışları maliyet sorununu çözer ama dayanıklı durum geçmişi sağlamaz. Çok kısa süreyle çok yüksek frekansta, SQS artı Lambda (bölüm 19'daki kalıp) her iki Step Functions türünden de daha basit ve daha ucuzdur.

**Koordinasyonsuz saf fan-out**: Aynı olayı yirmi tüketiciye göndermeniz gerekiyorsa ve her birinin sonucunu umursamıyorsanız, araç SNS'tir. Step Functions ihtiyaç duymadığınız ve gereksiz yere ödeyeceğiniz durum izleme ekler.

**Gerçek zamanlı senkron kullanıcı etkileşimleri**: Step Functions yürütmeleri asenkrondur. Bir kullanıcı bir ödeme ekranında 500ms'nin altında senkron bir yanıt bekliyorsa, bir Step Functions Standard iş akışı bunun için tasarlanmamıştır (Express iş akışları senkron olarak çağrılabilir, ama gecikme ek yükü hâlâ doğrudan bir Lambda çağrısından daha yüksektir). Senkron, kullanıcıya dönük akışlar için, iyi tasarlanmış hata işlemeli Lambda + API Gateway genellikle daha uygundur.

İlke: adımların *koordinasyonu* başlı başına karmaşık olduğunda—adımlar bağımsız olarak başarısız olabildiğinde, daha öncekileri tekrarlamadan bireysel adımları yeniden denemeniz gerektiğinde, yürütme geçmişinin uyumluluk veya ayıklama değeri olduğunda veya iş akışı günler sürebilecek insan onayı adımları içerdiğinde Step Functions kullanın. Tek bir fonksiyon olarak gayet iyi çalışan basit sıralı mantığa orkestrasyon ek yükü eklemek için kullanmayın.

## Güçlü Yönler ve Sınırlamalar

**Step Functions Neden Güçlüdür**:

- Görsel yürütme geçmişi—bir iş akışının tam olarak nerede olduğunu (veya nerede başarısız olduğunu) görün
- Yerleşik yeniden deneme ve hata işleme—özel yeniden deneme kodu yok
- Dayanıklı durum—yürütmeler hizmet yeniden başlatmalarından ve kesintilerden sağ çıkar
- 200'den fazla AWS hizmetiyle doğrudan entegrasyonlar (yalnızca Lambda değil)
- Görsel iş akışı kendini belgeler
- Geri arama kalıbı, işlem tüketmeden insan eylemleri için süresiz beklemeye olanak tanır

**Karmaşıklaştığı Yer**:

- Standard iş akışları durum geçişi başına fiyatlandırılır—çok durumlu karmaşık iş akışları ölçekte pahalı hâle gelebilir
- ASL (Amazon States Language) JSON formatının bir öğrenme eğrisi vardır
- Maksimum yük boyutu 256KB'dir—büyük veri doğrudan iş akışı boyunca değil, S3 referansları aracılığıyla iletilmelidir
- Birçok manuel adımı olan uzun süreli iş akışları dikkatli zaman aşımı yapılandırması gerektirir
- ASL hatalarını ayıklamak yürütmeleri çalıştırmayı gerektirir; gerçek hizmet kadar yetenekli bir yerel emülatör yoktur
- IAM izinleri, durum makinesinin çağırdığı her kaynak için ayrı ayrı verilmelidir—bir izni unutmak çalışma zamanında kafa karıştırıcı bir hataya neden olur

## Özet

Bölüm 21'deki konteynerler dağıtımları güvenilir kıldı. Step Functions çok adımlı iş süreçlerini güvenilir kılar—uygulama mantığına uygulanan aynı "aktarım riskini ortadan kaldır" ilkesi.

- **Step Functions** çok adımlı iş akışlarını durum makineleri olarak orkestre eder.
- Her **durum** bir Lambda fonksiyonu çalıştırabilir, bir ECS görevi yürütebilir, bekleyebilir, dallanabilir veya paralel adımlar çalıştırabilir.
- **Yeniden deneme ve yakalama** her duruma yerleşiktir—özel yeniden deneme kodu gerekmez.
- **Standard iş akışları**: uzun süreli (1 yıla kadar), dayanıklı, tam olarak bir kez. Kritik iş süreçleri için.
- **Express iş akışları**: kısa süreli (5 dakikaya kadar), yüksek verimli. Yüksek hacimli olay işleme için.
- **Görev tokenı ile geri arama kalıbı**: bir iş akışını harici bir olayı veya insan eylemini beklemek için süresiz duraklatın; tek bir API çağrısıyla devam edin.
- **Map durumu**: bir öğe listesini eş zamanlı olarak işleyin—sıralı döngüleri paralel fan-out ile değiştirin.
- **Doğrudan SDK entegrasyonları**: DynamoDB, S3, SQS ve 200'den fazla AWS hizmetini bir Lambda sarmalayıcısı olmadan doğrudan bir durumdan çağırın.
- **EventBridge**: yan etkileri ana iş akışından ayırın—tek bir olay yayınlayın, bağımsız kuralların onu temel durum makinesini değiştirmeden sadakat puanları, analiz ve anket hizmetlerine yönlendirmesine izin verin.
- **Standard vs Express maliyeti**: Durum geçişi başına 0,000025 dolardan Standard, düşük hacimli kritik iş akışları için iyi çalışır (Nimbus için sipariş onayı ayda 1,88 dolar). İstek-artı-süre fiyatlandırmasıyla Express, Standard'ın düzinelerce kat daha pahalıya mal olacağı yüksek frekanslı olaylar için uygundur (Nimbus'un tıklama akışı matematiğinde ~80 kat).
- **Olay odaklı mimari**, sistemleri doğrudan çağrılar yerine olaylar etrafında ayrıştırmak için SNS, SQS, Lambda ve EventBridge gibi hizmetler kullanır.
- Adımların koordinasyonu başlı başına karmaşık olduğunda ve denetlenebilirlik önemli olduğunda Step Functions kullanın. Basit iki adımlı diziler, ultra yüksek frekanslı iş akışları, saf fan-out veya senkron kullanıcıya dönük akışlar için kullanmayın.

## Sınav İpuçları

*SAA-C03 Alanı: Dayanıklı Mimariler Tasarlama (Alan 2, Görev 2.1)*

- **Step Functions kullanım durumu sinyalleri**: "birden fazla Lambda fonksiyonunu orkestre et," "yeniden denemeler ve hata işlemeli iş akışı," "otomatik bir iş akışında insan onayı adımı," "her iş akışı adımının denetim izi" → Step Functions.
- **Standard vs Express**: Uzun süreli, denetlenebilir, iş açısından kritik iş akışları için Standard. Yüksek verimli, kısa süreli olay işleme için Express.
- **SQS vs Step Functions**: Basit görev kuyrukları (üretici/tüketici) için SQS. Karmaşık mantık, yeniden denemeler ve durum izleme içeren çok adımlı iş akışları için Step Functions.
- **EventBridge sinyalleri**: "AWS hizmetlerinden hedeflere olay yönlendir," "hizmetler arası olay odaklı entegrasyon," "bir Lambda fonksiyonu zamanla" → EventBridge (eski adıyla CloudWatch Events).
- **Geri arama kalıbı**: Step Functions yürütmeyi duraklatabilir ve harici bir geri aramayı (bir görev tokenı) bekleyebilir. İşçi bittiğinde geri arar. Lambda'nın 15 dakikalık sınırını istemediğiniz uzun süreli ECS görevleri için yararlıdır.
- **Doğrudan SDK entegrasyonları**: Step Functions AWS hizmetlerini (DynamoDB, S3, SQS, vb.) Lambda'dan geçmeden doğrudan çağırabilir. Basit hizmet çağrıları için maliyeti ve gecikmeyi azaltır. Örneğin, DynamoDB'ye bir sipariş kaydı yazmak, bir Lambda fonksiyonu olmadan durum makinesinden doğrudan bir SDK çağrısı olabilir: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Bu, Lambda soğuk başlatmasını, Lambda yürütme maliyetini ve sadece `dynamodb.put_item(...)` çağırıp dönen kodu ortadan kaldırır.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Step Functions'ın çok adımlı iş akışları için neden yararlı olduğunu açıklayın. Diğer Lambda fonksiyonlarını çağıran basit bir Lambda fonksiyonunun sağlamadığı neyi sağlar?

*(İpucu: Her yaklaşımda 5 adımdan 3'üncüsü başarısız olduğunda ne olacağını düşünün. Ne olduğunu nasıl bilirsiniz? Yalnızca adım 3'ü nasıl yeniden denersiniz?)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir finansal hizmetler şirketi kredi başvurularını birden fazla adımda işliyor: kredi kontrolü, gelir doğrulama, belge doğrulama, sigortacı incelemesi (manuel) ve karar bildirimi. Her adım saniyelerden (kredi kontrolü) günlere (sigortacı incelemesi) kadar sürebilir. Şirketin uyumluluk için her adımın eksiksiz bir denetim izine ihtiyacı var. Başarısız otomatik adımlar otomatik olarak yeniden denenmeli; manuel adımlar duraklamalı ve bir insan kararını beklemelidir.

Bu gereksinimleri EN İYİ hangi hizmet karşılar?

A) Her adım arasında SQS kuyruklarıyla birbirine zincirlenmiş AWS Lambda fonksiyonları  
B) Sigortacı incelemesi adımı için geri arama kalıbı beklemeli AWS Step Functions Standard iş akışları  
C) Otomatik adımlar için AWS Step Functions Express iş akışları ve manuel adım için SQS FIFO  
D) Her adım için Lambda fonksiyonları arasında yönlendiren olay kurallarıyla Amazon EventBridge

**İpucu 1**: "Günlere kadar" süre—hangi Step Functions türü bunu destekler?

**İpucu 2**: "Bir insan kararını bekle"—hangi Step Functions kalıbı bunun için tasarlanmıştır?

**İpucu 3**: "Uyumluluk için eksiksiz denetim izi"—hangi hizmet yürütme başına durum geçmişi sağlar?

**Cevap**: B

**Açıklama**: Step Functions Standard iş akışları 1 yıla kadar çalışabilir, günler süren sigortacı incelemesi adımını destekler. Geri arama kalıbı bekleme, yürütmeyi sigortacı adımında bir görev tokenıyla duraklatır; sigortacı bir karar verdiğinde, iş akışını sürdürmek için tokenla geri arar. Standard iş akışları her durum geçişini kaydeder—uyumluluk için eksiksiz denetim izi.

**Neden A değil?** SQS aracılığıyla zincirlenen Lambda yerleşik durum izleme veya denetim izi sağlamaz. Başarısız adımlar özel yeniden deneme mantığı gerektirir. Belirli bir başarısız adımdan yeniden başlatmak özel uygulama gerektirir.

**Neden C değil?** Express iş akışlarının 5 dakikalık maksimum süresi vardır—günler sürebilen bir adımla uyumsuz.

**Neden D değil?** EventBridge hizmetler arasında olay yönlendirir ama iş akışı durumunu sürdürmez veya yerleşik yeniden deneme/denetim sağlamaz. Bunu yalnızca EventBridge üzerinde inşa etmek özel durum yönetimi gerektirir.

*SAA-C03 Alanı: Dayanıklı Mimariler Tasarlama — Görev 2.1*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus bir yemek kalitesi anlaşmazlığı çözüm süreci inşa ediyor. Bir müşteri kötü bir deneyim bildirdiğinde:

1. Rapor otomatik olarak doğrulanır (siparişin var olup olmadığını, yeterince yeni olup olmadığını kontrol eder)
2. Restoran otomatik olarak bilgilendirilir
3. Bir Nimbus destek temsilcisi şikâyeti inceler (manuel adım—1-3 iş günü sürebilir)
4. Temsilcinin kararına göre: geri ödeme yap (Lambda → ödeme işlemcisi) VEYA özür kuponu gönder (Lambda → kupon hizmeti) VEYA yönetime ilet (Step Functions alt iş akışı)
5. Müşteri sonuçtan haberdar edilir

Bunu bir Step Functions iş akışı olarak tasarlayın. Her adımı hangi durum türü ele alır? 1-3 günlük beklemeyi nasıl ele alırsınız? Adım 4'teki dalı nasıl modellersiniz?

*(Tek bir doğru cevap yoktur. Amaç, Step Functions durum tasarımı pratiği yapmaktır.)*

**Uzantı**: Durum makinesi tamamlandıktan sonra (hangi dal olursa olsun), EventBridge'e bir `OrderDisputeResolved` olayı yayınlar. Bu olayı hangi yan etkiler dinleyebilir? Şunu düşünün: restoranın derecelendirme sistemi, müşterinin sadakat puanları (geri ödemeler puan düşebilir), analiz hattı (anlaşmazlık oranı önemli bir restoran kalite metriğidir) ve müşteri destek ekibinin SLA izleme panosu. Burada EventBridge kullanmak, anlaşmazlık durum makinesinin bir bağımlılık örümceğine dönüşmesini nasıl önler?

## Kredilerden Sonraki Sahne

Restoran katılım iş akışı yayındaydı.

Sonraki ay içinde, 12 yeni restoran ortağı katıldı. İkisinin ödeme işleme adımı sırasında (adım 3) arızası oldu. Her iki durumda da, Step Functions tam hatayı yakaladı, yürütmenin durumunu kaydetti ve Nimbus ekibine bir uyarı gönderdi.

Leo kök nedeni düzeltti (ödeme sağlayıcısı için yanlış yapılandırılmış bir API anahtarı) ve her iki yürütmeyi de adım 3'ten yeniden denedi. Yürütmeler her biri 23 saniyede tamamlandı, tam olarak başarısız oldukları yerden devam ettiler.

Hiçbir restoranın yeniden içe aktarılması gerekmedi. Hiçbir IAM rolü çift oluşturulmadı. Hiçbir yinelenen hoş geldin e-postası gönderilmedi.

"Step Functions'tan önce," dedi Leo Maya'ya, "bu, birinin her restoran için neyin yapılıp neyin yapılmadığını manuel olarak izlemesini ve eksik adımları manuel olarak yeniden çalıştırmasını gerektirirdi."

"Ya şimdi?"

"Şimdi konsolda yeniden denemeye tıklıyorum. Sistem neyin yapıldığını biliyor."

Maya bunu düşündü.

"Bu sadece teknik bir iyileştirme değil," dedi. "Bu, ölçeklenen bir süreç ile ölçeklenmeyen bir süreç arasındaki farktır."

Sonraki bölümde: şu anda erişmediğiniz ama kesinlikle sonsuza dek saklamak istediğiniz verilerle ne yapacağınız.
