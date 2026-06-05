# Bölüm 23: Kendini Sıralayan Dosya Sistemi

Bir hukuk firması aktif dava dosyalarını masanın üzerinde tutar. Tamamlanan davalar dosya dolabına girer. Üç yıl önceki davalar bodrumdaki depolama kutularına girer. On yıl önceki davalar iki günde bir bir dışarıdaki arşiv tesisine girer ve kutusuz her şeyden sadece birkaç sent maliyetlidir.

Aynı bilgiler, erişim sıklığına bağlı olarak farklı maliyetlerle saklanır.

S3 bunu otomatik olarak yapar.

Tom, Nimbus AWS faturalarını inceliyordu. Satır öğesi: S3 depolama. Aylık 847 dolar.

Leo'yu çağırdı.

"S3'te 4,2 terabaytımız var," dedi Leo kontrol ettikten sonra.

"Ne için?"

"Restoran fotoğrafları. Sipariş fişleri. Analitik dışarı aktarmalar. 18 ay önceki yedekleme anlık görüntüleri."

"18 ay önce bir yedeklemeye erişildi son olarak ne zaman?"

Leo erişim günlüklerini kontrol etti.

"Ekimde," dedi. "Bir kez. Yedekleme formatını doğrulamak için."

"Yani 18 ayın yedeklemesi için tam S3 Standart fiyatını ödüyoruz."

"Evet."

Tom, S3 fiyatlandırma sayfasını inceledi. S3 Standart: GB başına ayda 0,023 dolar. S3 Glacier Instant Retrieval: GB başına ayda 0,004 dolar.

Hesapladı, birkaç hesaplama yaptı.

"Sadece eski verileri daha ucuz depolamaya taşıyarak bu faturaları önemli ölçüde azaltabiliriz," dedi, "sadece eski verileri daha ucuz depolamaya taşıyarak."

"Ne eski olduğunu bilmemiz gerekiyor," dedi Leo.

"S3 bunu biliyor. Son erişim zamanını takip ediyor."

**S3 Depolama Sınıfları: Tüm Spektrum**

Bölüm 5, S3 Standard'ı ana depolama sınıfı olarak tanıttı. S3 aslında yedi depolama sınıfına sahiptir ve her biri farklı erişim desenleri için tasarlanmıştır:

**S3 Standart**: Sık erişilen verilere. Düşük gecikme süresi (milyonlarca kar parçası). En yüksek maliyet. Minimum depolama süresi yok. Güncel menü fotoğrafları, günün siparişleri, yakın tarihli günlükler gibi aktif verilere kullanın.

**S3 Standart-Sık Erişimli Erişim (S3 Standart-IA)**: Bir ayda bir kezden daha az erişilen verilere. Standart ile aynı milisaniyelik geri çağırma, ancak daha düşük depolama maliyeti + GB başına geri çağırma ücreti. Hemen erişmeniz gerektiği ancak nadiren eriştiğiniz veriler için kullanın: eski sipariş fişleri, 6 aylık analiz dışarı aktarmaları.

**S3 Tek Bölge-Sık Erişimli Erişim (S3 Tek Bölge-IA)**: S3 Standart-IA ile aynı, ancak yalnızca bir Erişilebilirlik Bölgesinde (üç yerine) saklanır. Bu bölgenin bir felaket durumunda bir felaket durumunda veri kaybedilebilir, ancak daha ucuzdur. Kaybedilirse yeniden oluşturulabilen verilere kullanın: önbellek önizleme görüntüleri, geçici işleme çıktıları.

**S3 Glacier Instant Retrieval**: Nadiren ihtiyaç duyulan arşivlenmiş veriler. Milisaniyelik geri çağırma. Çok düşük depolama maliyeti, daha yüksek GB başına geri çağırma maliyeti. 90 günlük minimum depolama. Bir çeyrek veya daha az sıklıkta erişilen veriler için kullanın: çeyreklik uyumluluk raporları, 12 aylık yedekleme anlık görüntüleri.

**S3 Glacier Flexible Retrieval**: Düşük maliyetli arşiv, dakikalar ila saatlerde geri çağrılır. Glacier Instant Retrieval'den daha düşük maliyetlidir.

**S3 Glacier Deep Archive**: En düşük maliyetli seçenek. 12 saatte geri çağrılır. 180 günlük minimum depolama. Hiç beklendiği gibi erişilmeyecek olan düzenleyici uyumluluk için saklanması gereken veriler için kullanın: 7 yıllık vergi kayıtları, 10 yıllık denetim günlükleri.

Desen: Erişim sıklığı azaldıkça maliyet azalır ancak geri çağırma süresi (ve geri çağırma maliyeti artar). Erişim deseninize uyan sınıfı seçin.

**S3 Yaşam Döngüsü Politikaları: Otomatik Dosya Sistemi**

Dosyaları depolama sınıfları arasında manuel olarak taşımak hataya açık ve zaman alıcıdır. S3 **yaşam döngüsü politikaları**, tanımladığınız kurallara göre bunu otomatikleştirir.

Bir yaşam döngüsü kuralı iki bileşene sahiptir:

**Filtre**: Kurala hangi nesnelerin uygulanacağını belirler (tüm nesneler, belirli bir ön eki olan nesneler, belirli etiketlerle işaretlenmiş nesneler).

**Eylemler**: Birkaç gün sonra ne yapılacağını.

Örneğin, Nimbus'un sipariş fişleri için bir yaşam döngüsü politikası:

```
Transition to S3 Standard-IA after 90 days
Transition to S3 Glacier Instant Retrieval after 365 days
Transition to S3 Glacier Deep Archive after 2555 days (7 years)
Delete after 2920 days (8 years)
```

Bu tek tekil politika şunları sağlar:

- Aktif makbuzlar (< 90 gün): S3 Standard, hızlı erişim
- Yakın zamanda oluşturulan makbuzlar (90-365 gün): Standard-IA, ucuz ancak anında kullanılabilir
- Tarihsel makbuzlar (1-7 yıl): Glacier, çok ucuz, nadiren ihtiyaç duyulur
- Geçerli olmayan makbuzlar (> 8 yıl): Otomatik olarak silinir

Tom, beklenen tasarrufları gözden geçirdi: 847 ABD dolarından yaklaşık 220 ABD dolarına düştü.

"Sadece... eski olanı tanımlamak ve nereye gitmesi gerektiğini belirlemek mi?" dedi.

"Ve S3 bunu otomatik olarak yapar," Leo onayladı. "Cron işi yok. Manuel bir aktarım yok. Unutmak yok."

**S3 Zeki Katmanlama: Kendini Organize Eden Sınıf**

Verilerinizi ne kadar sık erişeceğinizi bilmediğinizde ne olur?

**S3 Zeki Katmanlama**, her nesnenin erişim kalıplarını izler ve erişim katmanları arasında otomatik olarak hareket eder:

- **Sık Erişim Sınıfı**: Son zamanlarda erişilen nesneler için
- **Seyrek Erişim Sınıfı**: 30 gün boyunca erişilmeyen nesneler
- **Anında Erişim Sınıfı (Archive)**: 90 gün boyunca erişilmeyen nesneler
- **Erişim Sınıfı (Archive)**: 90-730 gün arası (isteğe bağlı) erişilmeyen nesneler
- **Derin Arşiv Erişim Sınıfı (Archive)**: 180-730+ gün arası erişilmeyen nesneler

S3 Zeki Katmanlama, nesne başına küçük bir izleme ücreti (1.000 nesne için 0,0025 ABD doları) tahsil eder, ancak Sık Erişim ve Seyrek Erişim katmanları için herhangi bir indirme ücreti yoktur.

Aşağıdaki durumlarda Zeki Katmanlamayı kullanın:

- Erişim kalıpları belirsiz veya zamanla değişir
- Hot ve cold veriler arasında karışık bir durumunuz var ve bunları kolayca sınıflandırmanız mümkün değil
- 128 KB'tan büyük nesneler (küçük nesneler, izleme ücretlerinden daha fazla tasarruf etmeden daha yüksek maliyetlere neden olur)

Aşağıdaki durumlarda açık depolama sınıflarını (yaşam döngüsü politikeleriyle birlikte) kullanın:

- Erişim kalıpları tahmin edilebilir
- Her nesne için izleme ücretlerini en aza indirmek istiyorsunuz
- Nesneler < 128 KB (küçük nesneler, daha fazla izleme ücreti tahsil eder)

**Paralel Yükleme: Büyük Nesneler İçin**

S3, tek bir yükleme için 5 GB'lık bir sınırlamaya sahiptir. Daha büyük nesneler için, **paralel yükleme** kullanmanız gerekir: nesneyi parçalara ayırın, her birini paralel olarak yükleyin ve S3 bunları birleştirir.

Faydaları:

- Daha hızlı yüklemeler (paralel)
- Başarısız yüklemeleri yeniden yükleme yeteneği (sadece başarısız olan parçaları yeniden yükleyin)
- 5 GB'tan büyük nesneler için gereklidir

Yaşam döngüsü kuralı ipucu: Eksik olan paralel yüklemeleri 7 gün sonra silmek için bir yaşam döngüsü kuralı ayarlayın. Bir yükleme yarım kalır ve düzeltilmezse, bu kısmi parçalar depolanır ve bir nesne olarak gösterilmeden ücretlendirilir —

Tom, bu ipucunu büyük ölçüde takdir etti.

**S3 Temsili: Verileri Bir Depodan Başka Bir Depoya Kopyalama**

S3, nesneleri bir depodan diğerine otomatik olarak temsil edebilir:

**Aynı Bölge Temsili (SRR)**: Aynı bölgede nesneleri kopyalayın. Uyumluluk için (farklı bir hesapta ayrı bir kopyu koruma), birden çok depodan günlükleri toplama veya üretim verilerinden test ortamları oluşturma için kullanılır.

**Farklı Bölge Temsili (CRR)**: Nesneleri farklı bir bölgeye kopyalayın. Felaket kurtarma için (bölgeler arasında veri yedekliliği), uyumluluk için (veriler belirli bir coğrafi konumda olmalıdır) ve küresel kullanıcılar için daha düşük gecikme süresi için kullanılır.

Temsil, bir yedekleme çözümü değildir — kaynak depodan bir nesne silinirse, aynı depodan da silinir (silme işareti temsilinin devre dışı bırakılması durumunda). AWS Backup veya nesne kilitleme ile birlikte versiyonlama için kullanın.

**S3 Nesne Kilitli: Uyumluluk için Kalıcı Olabilirlik**

Bazı düzenlemeler, verilerin **kalıcı** olması gerektiğini gerektirir — yazıldıktan sonra değiştirilemez veya silinemez belirli bir süre boyunca.

**S3 Nesne Kilitli**, Write Once, Read Many (WORM) depolama uygulamayı sağlar:

**Saklama dönemi**: Nesneler belirli bir süre boyunca silinemez veya üzerine yazılamaz.

**Yasal tutanak**: Nesneler, tutanak dönemi ne olursa olsun, yasal tutanak açıkça kaldırılana kadar silinemez.

S3 Nesne Kilitli'yi düzenli sektörler için kullanın: finansal kayıtlar (SEC Rule 17a-4), sağlık kayıtları (HIPAA), uyumluluk arşivleri.

## Güçlü Yönler ve Sınırlamalar

**Neden S3 depolama katmanları önemli**:

- Gerçekten erişilen şey için dayanıklılık veya kullanılabilirlik konusunda ödün vermeden önemli maliyet tasarrufu sağlar
- Yaşam döngüsü politikaları, tüm süreci otomatikleştirir — herhangi bir operasyonel yük getirmez
- S3 Zeki Katmanlama, erişim kalıplarını tahmin etme ihtiyacını ortadan kaldırır

**Nerede karmaşık hale geliyor**:

- Glacier sınıfları için minimum depolama süresi ücretleri uygulanır (Glacier Instant için 90 gün, Derin Arşiv için 180 gün) — erken silme, minimum ücreti tahsil eder
- Arşivlenmiş verileri sık erişmeniz durumunda indirme ücretleri sizi şaşırtabilir
- Yaşam döngüsü geçişleri zaman alır — kurallar tetiklendiğinde nesneler anında hareket etmez
- Zeki Katmanlama izleme ücretleri, milyonlarca küçük nesne içeren bir depoda birikebilir

## Özet

- S3, yedi depolama sınıfına sahiptir: Standart, Standart-IA, Akıllı Katmanlama, Tek Bölge-IA, Anında Erişimli Buzdolabı, Esnek Erişimli Buzdolabı ve Derin Arşivli Buzdolabı.
- **Yaşam Döngüsü Politikaları**, yaşa göre depolama sınıfları arasında geçişleri otomatikleştirir — bir kez tanımlayın, S3 bunu sonsuza kadar halleder.
- **S3 Akıllı Katmanlama**, gerçek erişim kalıplarına göre nesnelerin katmanlar arasında otomatik olarak hareket etmesini sağlar — öngörülemeyen iş yükleri için kullanın.
- **Çoklu Yükleme**, 5 GB'tan büyük nesneler için gereklidir ve 100 MB'tan büyük her şey için önerilir.
- **S3 Temsili Kopyalama** (SRR ve CRR), nesneleri kaplar ve bölgeler arasında kopyalar — DR, uyumluluk veya toplama için.
- **S3 Nesne Kilitli**, uyumluluk senaryoları için SORM depolamasını sağlar.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimari Tasarımı (Alan 4, Görev 4.1)*

- **Depolama Sınıfı Seçim Sinyalleri**:
  - "Sık Erişimli" → Standart
  - "Bir ayda erişilir, anında erişim gerektirir" → Standart-IA
  - "Saatler içinde erişim süresi tolere edilebilir, nadiren erişilir" → Esnek Erişimli Buzdolabı
  - "Uyumluluk gereksinimleri, 7+ yıl saklama, hiç erişilmez" → Derin Arşivli Buzdolabı
  - "Bilinmeyen veya değişen erişim kalıpları" → Akıllı Katmanlama
- **Yaşam Döngüsü Politikası Sınav Kalıpları**: "otomatik olarak depolama maliyetlerini veri yaşandıkça azaltır", "90 gün sonra arşivlenmeye geçiş" → yaşam döngüsü politikaları.
- **Akıllı Katmanlama İzleme Ücreti**: Nesne başına küçük bir ücret. Büyük sayıda küçük nesne için bu, tasarruflardan daha fazla olabilir. Sınav bu testi yapabilir.
- **CRR Gereksinimleri**: Hem kaynak hem de hedef kaplarda Sürümleme etkinleştirilmelidir. Kaynak ve hedef farklı bölgelerde olmalıdır.
- **S3 Nesne Kilitli**: "SORM", "kalıcı", "SEC 17a-4", "silinemez veya değiştirilemez" → Nesne Kilitli. Yönetim modu (admin'ler tarafından geçersiz kılınabilir). Uyumluluk modu (hiç kimse, hatta root tarafından geçersiz kılınamaz).
- **Buzdolabı Kurtarma**: Buzdolabındaki nesneler hemen kullanılabilir değildir. Erişim için S3 Standart'a "geri yükleyin"meniz gerekir. Geri yüklenen kopyası geçicidir (süre bilgisini ayarlarsınız). Orijinal Buzdolabında kalır.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

S3 Standart-IA ve S3 Anında Erişimli Buzdolabı arasındaki fark nedir? Her biri için uygun erişim kalıbı nedir?

*(İpucu: Verinin ne sıklıkta erişileceğini ve erişildiğinde ne kadar hızlı ihtiyaç duyulduğunu düşünün.)*

**Alıştırma 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, günlük 500 GB uygulama günlükleri oluşturur. Günlükler, hata ayıklama ve izleme için ilk 7 gün boyunca yoğun olarak sorgulanır. 7 gün sonra günlükler nadiren erişilir, ancak gerektiğinde 30 dakika içinde kullanılabilir olmalıdır. 1 yıl sonra günlükler uyumluluk için 7 yıl boyunca korunmalıdır, ancak hiç erişilmez. Şirket, gereksinimleri karşılayarak depolama maliyetlerini en aza indirmelidir.

Hangi S3 yaşam döngüsü politikası bu gereksinimleri en iyi şekilde karşılar?

A) S3 Standart'ta 7 gün boyunca saklayın; 7 gün sonra S3 Anında Erişimli Buzdolabına geçin; 365 gün sonra geçersiz kılın
B) S3 Standart'ta 7 gün boyunca saklayın; 7 gün sonra S3 Standart-IA'ya geçin; 365 gün sonra S3 Anında Erişimli Buzdolabına geçin
C) Tüm günlükleri ilk gün 1'den S3 Akıllı Katmanlama'ya saklayın
D) S3 Standart'ta 7 gün boyunca saklayın; 7 gün sonra S3 Anında Erişimli Buzdolabına geçin; 365 gün sonra S3 Derin Arşivli Buzdolabına geçin

**İpucu 1**: "30 dakika içinde kullanılabilir" hangi depolama sınıfını dışlar?

**İpucu 2**: Derin Arşiv 12 saatte geri yüklenir — 7-365 gün için "30 dakikalık kullanılabilirlik" gereksinimini karşılamaz.

**İpucu 3**: 365 gün sonra geri çağırma süresi önemli değildir (hiç erişilmez), bu nedenle en ucuz seçenek uygulanır.

**Cevap**: D

**Açıklama**: S3 Standart 7 gün, sık erişim için kullanılır. Anında Erişimli Buzdolabı, çok daha düşük maliyetle, standart erişimden önemli ölçüde daha ucuz olan milisaniyeli erişim için 7-365 gün boyunca çalışır. 365 gün sonra, hiç erişilmediği için, veriler hiçbir geri çağırma süresi gerektirmediği için en ucuz seçenek uygulanır.

**Neden A?** Anında Erişimli Buzdolabı 7 gün için çalışır, ancak Derin Arşiv 12 saatte geri yüklenir — 7-365 gün için "30 dakikalık kullanılabilirlik" gereksinimini karşılamaz.

**Neden B?** Standart-IA 7 gün için çalışır, ancak Anında Erişimli Buzdolabı çok daha ucuzdur. Standart-IA, nadiren erişilen veriler için anında erişim gerektirdiğinde daha uygundur — burada veriler 7 gün sonra hiç erişilmediğinden, Anında Erişimli Buzdolabı daha uygun maliyetlidir.

**Neden C?** Akıllı Katmanlama, nesne başına bir izleme ücreti ve büyük bir hacimde küçük nesneler için katmanlara geçişi Akıllı Katmanlama kuralları kadar agresif olmayabilir. Büyük bir günlük hacmi için, tahmin edilebilir bir erişim kalıbı için, açık yaşam döngüsü kuralları daha uygun maliyetlidir.

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimari Tasarımı — Görev 4.1*

**Alıştırma 3 — Mimari Zorluğu *(İsteğe bağlı)***

Nimbus, farklı özelliklere sahip üç tür S3 verisiyle çalışır:

- Restoran fotoğrafları: bir kez yüklenir, müşteriler tarafından çok kez erişilir, asla silinmez
- Sipariş fişleri: müşteriler tarafından ilk ay erişilir, vergi amaçları için 7 yıl boyunca korunur
- Analitik dışarı aktarmaları: günlük olarak üretilir, bir sonraki hafta analiz edilir, 2 yıl boyunca korunur

Design each için bir yaşam döngüsü politikası tasarlayın. Restoran fotoğrafları için Akıllı Katmanlama (Intelligent-Tiering) mantıklı olur mu? Sipariş fişleri için hangi depolama sınıfı 1 aylık ile 7 yıllık zaman aralığını kapsar? Analitik dışarı aktarmalar için, farklı ön ekler için farklı politikalar uygulamak üzere bir bütünü nasıl yapılandırırdınız?

*(Tek bir doğru cevabı yoktur. Amaç, gerçek dünya verileri için depolama katmanı seçimi konusunda pratik yapmaktır.)*

## Kredilerden Sonraki Sahne

Tom yaşam döngüsü politikalarını uyguladı.

S3 faturaları bir sonraki ayda 847$'dan 198$'a düştü.

Karşılaştırmayı bastı ve hiçbir şey söylemeden Maya'nın masasına koydu.

Maya baktı. Sonra tarihe baktı. Sonra Tom'a baktı.

"Üç hafta," dedi.

"Politikaları tasarlamak için bir öğleden sonra," dedi. "Onları uygulamak için bir saat. İlk tam faturalama döngüsünü görmek için üç hafta."

"S3 maliyetlerinde %2/3'ü azalma."

"Erişmediğimiz verilere yönelik."

Maya sayıları tekrar inceledi.

"Tom," dedi, "bizim kullandığımız her AWS hizmeti için bu incelemeyi yapmanı istiyorum. Depolama, hesaplama, ağ. İsrafı bul."

Zaten masasına geri dönmüştü.

"Hali hazırda geçen hafta başladım," dedi.

Sonraki bölümde: veritabanı katmanı kendi versiyonu bu konuşmaya sahiptir ve Aurora, Tom'un beklemediği hoşlanmayacağı cevaptır.
