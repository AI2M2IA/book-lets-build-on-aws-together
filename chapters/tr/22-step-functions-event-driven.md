# Bölüm 22: Kendini Çalıştıran Akış Şeması

Nimbus’taki bir sipariş onayı beş şeyin ardışık olarak gerçekleşmesini gerektiriyordu: kartı öde, teyit e-postasını gönder, restorana bildirimde bulun, envanteri güncelle ve işlemi muhasele için kaydet. Üçüncü adım başarısız olursa – restorana bildirim zaman aşımına uğrarsa – ilk ve ikinci adımlar zaten gerçekleşmişti. Müşterinin kartı ücretlendirildi. E-posta gönderildi. Ancak restoran siparişin varlığını bilmedi.

Leo, bu tür bir hatanın adını şöyle koydu: kısmi başarı. “Her şeyin işe yaradığı,” dedi, “sadece önemli olan kısım çalışmadı.”

“Bu ne kadar kez oldu?” Maya sordu.

“Son iki haftada on bir kez. Çoğunu restoranlara yapılan öfkeli çağrıların yardımıyla yakaladık. İkisini loglardan, olayın ardından bulduk.”

“Yani koordinasyonumuz yok,” dedi Priya. “Beş adım, bir betik olarak çalışıyor, hepsi tamamlanacak garantisi yok.”

“Ya da doğru sırada tamamlanacaklar.”

“Ya da hangisinin başarısız olduğunu bileceğiz.”

Leo, projektörde kodu açtı. Yirmi beş satırlık bir Python fonksiyonuydu: beş ardışık API çağrısı, tümü etrafında tek bir try/except bloğu ile çevrili. “Burada herhangi bir şey bir istisna yükseltirse, 500 alıyoruz ve müşteri bir hata mesajı görüyor. Ancak ücretler ve e-postalar geri alınmıyor.”

“Bir iş akışı gerekiyor,” dedi Maya. “Her adımı takip eden bir şey.”

**AWS Step Functions: İş Akışlarını Senkronize Etme**

**AWS Step Functions** , bir uygulamanın adımlarını görsel bir iş akışı olarak koordine eden, sunucusuz bir orkestrasyon hizmetidir. Her adım, bir **durum**dur ve bu durumlar **durum makinesinde** bulunur.

Üstten alta çalışan ve çökebilen bir Python betiği yerine, iş akışını JSON/YAML durum makinesi olarak tanımlarsınız:

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

Her metin, her durumları:

- **Lambda fonksiyonunu çalıştırır** (en yaygın desen)
- **ECS görevi çalıştırır** (daha uzun süreli işler için)
- **Belirli bir süre boyunca veya bir olaya göre bekler** (dışarıdan bir şeyin olması bekleyene kadar iş akışını duraklatır)
- **Koşullara göre bir yolu seçer** (if/else mantığı)
- **Simultane dalları çalıştırır**
- **Başarısızlık durumunda yeniden denemeye çalışır** yapılandırılabilir geri dönüşle
- **Hataları yakalar** ve hata işleme durumlarına yönlendirir

Step Functions, yürütme durumunu dayanıklı bir şekilde yönetir. 3. adım başarısız olursa, yürütme 3. adımda durur. Başarısız yürütmeyi konsolda inceleyebilir, sorunu çözebilir ve adım 3'ten yeniden başlatabilirsiniz — adım 1 ve 2'yi tekrarlamadan.

**Durum Türleri: Temel Taşlar**

**Görev:** Bir eylemi gerçekleştir — Lambda fonksiyonunu çağır, ECS görevi başlat, bir API'ye çağır. Gerçek iş burada gerçekleşir.

**Seçim:** Verideki koşullara göre bir dal oluştur — if/else gibi bir kodda.

**Paralel:** Birden çok dalı aynı anda çalıştır ve hepsinin tamamlanmasını bekle.

**Harita:** Bir listedeki her öğe için bir dizi durumu uygula. 50 restoran menü öğesini paralel olarak işle.

**Bekle:** Belirtilen süre boyunca veya bir zaman damgasına kadar bekle. Planlı gecikmeler için kullanışlıdır.

**Geçir:** Girişi çıktısına aktarmadan herhangi bir iş yapmadan. Veri dönüşümü ve test için kullanılır.

**Başar/Başarısız:** Yürütmeyi sonlandıran terminal durumlar.

Restoran onboarding'ı için Leo bir iş akışı tasarladı:

1. LisansDoğrula (Görev → Lambda)
2. Menüyü İçe Aktar (Görev → Lambda, 3 denemeyle)
3. Paralel dal:
   a. ÖdemeKur (Görev → Lambda)
   b. IAMRolüOluştur (Görev → Lambda)
4. HoşGeldinE-postaGönder (Görev → Lambda, paralel tamamlanmasını bekler)
5. SatışEkibineBildir (Görev → Lambda)

3a ve 3b adımları paralel olarak çalışır — birbirlerinden bağımsızdır ve aynı anda çalıştırılması zaman tasarrufu sağlar.

**Standart vs. Express İş Akışları**

Step Functions, iki tür iş akışı sunar:

**Standart iş akışları:**

- Maksimum süre: 1 yıl
- Yürütmeler dayanıklıdır — durum tutulur, incelenebilir ve denetlenebilir
- En az bir kez yürütme (her görev en az bir kez çalışır)
- Durum geçişi başına fiyatlandırılır
- Uzun süreli, önemli iş akışları için en iyisidir (sipariş işleme, onboarding, ödeme akışları)

**Express iş akışları:**

- Maksimum süre: 5 dakika
- Daha yüksek verim — saniyede 100.000'e kadar
- En az bir kez veya en çok bir kez (ayarlanabilir)
- Durum başına fiyatlandırılır (Lambda gibi)
- Yüksek hacimli, kısa süreli iş akışları için en iyisidir (gerçek zamanlı olay işleme, IoT veri girişi)

Nimbus'un restoran onboarding'ı için: Standart (önemli, dayanıklı, manuel adımlar dahil olmak üzere saatler sürebilir).

Nimbus'un gerçek zamanlı sipariş durumu güncellemeleri için: Express (yüksek hacim, kısa süre, daha az kritik).

**Olay Tabanlı Mimari: Daha Büyük Resim**

Step Functions, daha büyük bir desen olan **olay tabanlı mimari**nin bir parçasıdır. Hizmetler doğrudan birbirine değil, olaylar yayınlar ve diğer hizmetler bu olaylara yanıt verir (sıkı ilişki yerine).

Bu kitabın ilerleyen kısımlarında bunu gördük:

- Siparişler yerleştirildiğinde → SNS olayını yayınlar → SQS kuyrukları tüketicilere teslim eder
- S3 dosyası yüklendiğinde → Lambda tetiklenir
- DynamoDB kaydı değiştiğinde → DynamoDB Akışları → Lambda bir önbelleği günceller

**Amazon EventBridge** (eski adıyla CloudWatch Events) bu desen için gelişmiş olay geçişidir. AWS hizmetlerinden ve kendi uygulamalarınızdan olayları, kurallara göre hedef (Lambda, SQS, Step Functions vb.) olanlara yönlendirir.

EventBridge, mimari düzeyde gevşek ilişkiyi sağlar: Sipariş hizmeti `order.placed` olaylarını yayınlar, kimin dinlediğini bilmeden. Analitik hizmeti, bildirim hizmeti ve sadakat puan hizmeti bağımsız olarak dinler. Yeni bir dinleyici eklemek, sipariş hizmetini değiştirmeyi gerektirmez.

**Ne Zaman Step Functions Doğru Araçtır**

Step Functions, aşağıdaki durumlarda mükemmeldir:

**Adımları içeren iş akışları** ilerlemeyi adımlarda takip etmeleri gereken

**İnsan-içerikli süreçler** — Step Functions, bir şeyin onaylanması gibi bir dış olayla sonsuza kadar bekleyebilir ve ardından devam edebilir

**Ölçekte hata işleme** — çok sayıda adımda yerleşik yeniden deneme, yakalama ve yedekleme mantığı

**Denetlenebilir süreçler** — her yürütme her durum geçişini kaydeder. Ne olduğunun ve ne zaman olduğunu tam olarak görebilirsiniz.

**Karmaşık paralel veya sıralı mantık** — görsel iş akışı, eşdeğer koddan daha kolay anlaşılmasını sağlar

Step Functions, basit iki adımlı süreçler için aşırı derecede karmaşıktır. Koordinasyonun kendisi değerli olduğunda ve başarısızlık senaryolarının önemli olduğunda kullanın.

## Güçlü Yönler ve Sınırlamalar

**Neden Step Functions Güçlüdür:**

- Görsel yürütme geçmişi — bir iş akışının (veya başarısız olduğunda) nerede olduğunu gör
- Yerleşik yeniden deneme ve hata işleme — özel yeniden deneme kodu gerekmez
- Dayanıklı durum — yürütmeler yeniden başlatma ve kesintiler sırasında hayatta kalır
- 200'den fazla AWS hizmetiyle doğrudan entegrasyon (yalnızca Lambda ile değil)
- Görsel iş akışı kendi kendini belgelemesini sağlar

**Nerede Karmaşık Hale Gelir:**

- Standart iş akışları, durum geçişlerine göre fiyatlandırılır — çok sayıda durum içeren karmaşık iş akışları ölçeklendirme sırasında pahalı hale gelebilir.
- ASL (Amazon States Language) JSON formatı bir öğrenme eğrisi içerir.
- Maksimum yükleme boyutu 256KB'dır — büyük veri, iş akışından doğrudan değil, S3 referansları aracılığıyla iletilmelidir.
- Çok sayıda manuel adım içeren uzun süreli iş akışları, dikkatli bir zaman aşımı yapılandırması gerektirir.

## Özeti

- **Step Functions**, durum makineleri olarak çok adımlı iş akışlarını orkestre eder.
- Her **durum**, bir Lambda fonksiyonunu çalıştırabilir, bir ECS görevi gerçekleştirebilir, bekleyebilir, dallanabilir veya paralel adımları çalıştırabilir.
- **Tekrar ve yakalama** her durumda yerleşik olarak bulunur — özel tekrar kodu gerekmez.
- **Standart iş akışları**: uzun süreli (1 yıla kadar), dayanıklı, en az bir kez. Kritik iş süreçleri için.
- **Express iş akışları**: kısa süreli (5 dakikaya kadar), yüksek verimlilik. Yüksek hacimli olay işleme için.
- **Olay odaklı mimari**, olaylar yerine doğrudan çağrılar yerine SNS, SQS, Lambda ve EventBridge gibi hizmetleri kullanarak sistemleri ayırır.
- Step Functions'ın koordinasyon adımları kendisi için karmaşık olduğunda ve denetlenebilirliğin önemli olduğunda kullanın.

## Sınav İpuçları

*SAA-C03 Alanı: Dayanıklı Mimarileri Tasarlayın (Alan 2, Görev 2.1)*

- **Step Functions kullanım sinyalleri**: "birden fazla Lambda fonksiyonunu orkestre et", "geri alma ve hata işlemeyi içeren iş akışı", "otomatik iş akışında insan onay adımı", "her iş akışı adımı için denetim kaydı" → Step Functions.
- **Standart vs Express**: Uzun süreli, denetlenebilir, iş açısından kritik iş akışları için Standart. Yüksek verimlilik, kısa süreli olay işleme için Express.
- **SQS vs Step Functions**: Basit görev kuyrukları (üretici/tüketici) için SQS. Karmaşık mantık, geri alma ve durum takibi için çok adımlı iş akışları için Step Functions.
- **EventBridge sinyalleri**: "AWS hizmetlerinden hedeflere olayları yönlendir", "hizmetler arasında olay odaklı entegrasyon", "bir Lambda fonksiyonunu planla" → EventBridge (eski adıyla CloudWatch Events).
- **Callback deseni**: Step Functions, yürütmeyi duraklatabilir ve bir görev token'ı için harici bir callback'e (bir görev token'ı) bekleyebilir. İşletimci token ile biten işi tamamladığında çağırır. Lambda'nın 15 dakikalık sınırını önlemek için uzun süreli ECS görevleri için kullanışlıdır.
- **Doğrudan SDK entegrasyonları**: Step Functions, Lambda aracılığıyla gitmeden AWS hizmetlerini doğrudan çağırabilir (DynamoDB, S3, SQS vb.). Basit hizmet çağrıları için maliyeti ve gecikmeyi azaltır.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Step Functions'ın çok adımlı iş akışları için ne işe yaradığını açıklayın. Basit bir Lambda fonksiyonunun diğer Lambda fonksiyonlarını çağırması durumunda sağladığı ne var?

*(İpucu: 3. adımın başarısız olduğu durumda ne olur? Bunu nasıl bilirsiniz? 3. adımı nasıl yeniden denersiniz?)*

**Alıştırma 2 — Sınav Uygulaması**

*Senaryo*: Bir finansal hizmetler şirketi, kredi kontrolü, gelir doğrulama, belge doğrulama, bir underwriting incelemesi (manuel), karar bildirim gibi çok adımlı bir süreçte kredi başvurularını işler. Her adım saniyelerden (kredi kontrolü) günler (underwriting incelemesi) kadar sürebilir. Şirket, uyumluluk için her adımın tam bir denetim kaydını gerektirir. Otomatik başarısız adımlar otomatik olarak yeniden denenmelidir; manuel adımlar durmalı ve bir insan kararını beklemelidir.

Bu gereksinimleri en iyi karşılayan hizmet hangisidir?

A) SQS kuyruğu arasında her adım arasında zincirlenmiş AWS Lambda fonksiyonları
B) İnsan onay adımı için bir görev token'ı ile bekleyebilen bir geri alma ve hata işlemeyi içeren AWS Step Functions Standard iş akışları
C) Otomatik adımlar için AWS Step Functions Express iş akışları ve manuel adım için FIFO SQS
D) EventBridge ile olay kuralları arasında Lambda fonksiyonlarını yönlendiren Amazon EventBridge

**İpucu 1**: "Günler" süresi — hangi Step Functions türü bu desteği sağlar?

**İpucu 2**: "Bir insan kararını bekle" — bu pattern'ı tasarlayan Step Functions türü hangisidir?

**İpucu 3**: "Tam bir denetim kaydı uyumluluk için" — hangi hizmet her yürütme için durum geçmişini sağlar?

**Cevap**: B

**Açıklama**: Step Functions Standard iş akışları, günler süren underwriting inceleme adımı için 1 yıla kadar çalışabilir. Görev token'ı ile bir underwriting incelemesi adımı için Wait for callback pattern'ı yürütmeyi duraklatır; bir underwriting, token ile devam etmeden önce karar verir. Standart iş akışları her durum geçişini kaydeder — uyumluluk için tam bir denetim kaydı sağlar.

**Neden A?** Lambda'nın SQS kuyrukları aracılığıyla zincirlenmesi, durum takibi veya denetim kaydı sağlamaz. Başarısız adımlar için özel bir geri alma kodu gerekir. Başarısız bir adımı belirli bir noktadan yeniden başlatmak için özel bir uygulama gerekir.

**Neden C?** Express iş akışları 5 dakikalık bir maksimum süreyi desteklemez — günler süren bir adım için uygun değildir.

**Neden D?** EventBridge olayları hizmetler arasında yönlendirir ancak iş akışı durumunu korumaz veya yerleşik geri alma/denetim sağlar. Bu tek başına EventBridge üzerinde inşa edilirse özel durum yönetimi gerekir.

*SAA-C03 Alanı: Dayanıklı Mimarileri Tasarlayın — Görev 2.1*

**Alıştırma 3 — Mimari Zorluğu *(İsteğe bağlı)*

Nimbus, yiyecek kalitesine dair anlaşmazlık çözümleme süreci oluşturuyor. Bir müşterinin kötü bir deneyim bildirmesi durumunda:

1.  Rapor otomatik olarak doğrulanır (siparişin var olup olmadığını, yeterince güncel olup olmadığını kontrol eder)
2.  Restoran otomatik olarak bilgilendirilir
3.  Nimbus destek ajanı şikayeti inceler (manuel adım — 1-3 iş günü sürebilir)
4.  Ajanın kararına göre: para iadesi düzenle (Lambda → ödeme işlemcisi) VEYA özür kuponu gönder (Lambda → kupon servisi) VEYA yönetime yükselt (Step Functions alt iş akışı)
5.  Müşteriye sonuç bildirilir

Bu süreci Step Functions iş akışı olarak tasarlayın. Her adım için hangi durum türü kullanılır? 1-3 günlük bekleme süresi nasıl yönetilir? 4. adımda dallanma nasıl modellenir?

*(Tek bir doğru cevap yoktur. Amaç Step Functions durum tasarımı pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Restoran onboarding iş akışı canlıydı.

Sonraki bir ayda, 12 yeni restoran ortağı onboarding yapıldı. İki tanesi 3. adımda (ödeme işleme) başarısızlıklar yaşadı. Her iki durumda da Step Functions, yürütmenin tam hata bilgisini yakaladı, durumu kaydetti ve Nimbus ekibine uyarı gönderdi.

Leo, kök nedeni (ödül veren sağlayıcı için yanlış yapılandırılmış bir API anahtarı) düzeltti ve 3. adımdan her iki yürütmeyi de yeniden denedi. Yürütmelerden her biri 23 saniyede tamamlandı ve tam olarak nerede başarısız olduklarından sonra devam etti.

Hiçbir restoranın yeniden içe aktarılması gerekmedi. Hiçbir IAM rolü çift oluşturulmadı. Hiçbir yinelenen hoş geldin e-postası gönderilmedi.

"Step Functions olmadan," dedi Leo Maya'ya, "bu, her restoran için neyin yapıldığını ve yapılmadığını manuel olarak takip etmeyi ve eksik adımları manuel olarak yeniden çalıştırmayı gerektirirdi."

"Ve şimdi?"

"Şimdi konsolun içinde yeniden denetleme seçeneğine tıklıyorum. Sistem neyin yapıldığını biliyor."

Maya bu üzerine düşündü.

"Bu sadece bir teknik iyileştirme değil," dedi. "Bu, ölçeklenebilen bir süreç ile olmayan bir süreç arasındaki fark."

Sonraki bölümde: şu anda erişmediğiniz ancak kesinlikle sonsuza kadar saklamak istediğiniz verilerle nasıl başa çıkılır.
