# Bölüm 9: Tablo Büyüdüğünde

Nimbus'un ilk restoran ortağının mutfağı, sabahın onunda bile sarımsak ve sıcak ekmek kokuyordu. Maya bir demo için oradaydı; bir aşçının uygulamada parmağını kaydırarak bir değişikliği kaydedişini izliyordu — geçici olarak tükenen karides yerine balık. Kaydırma gerçekleşti. Menü güncellendi. Şehrin başka bir yerindeki bir müşteri değişikliği saniyeler içinde gördü.

Bu, sihir gibi gelmişti.

Ofise dönüldüğünde, sihir yavaşlamaya başlamıştı.

Menü tablosunda 50.000 öğe vardı.

Bu, 287 restorana yayılmıştı — ortak sayısı, yük dengeleyici günlerinin kırk yedisinden bir yıldan kısa sürede neredeyse üç yüze fırlamıştı — her birinin günlük spesiyalleri, mevsimlik ürünleri ve bölgesel varyasyonları vardı. Bazı öğelerin modifikatörleri vardı — boyut, baharat seviyesi, protein seçimi. Bazılarında başka öğelere atıfta bulunan kombo fırsatlar vardı. Bazıları menüde yalnızca hafta içi, yalnızca öğle yemeğinde veya yalnızca belirli şehirlerde görünüyordu.

Bir restoranın tam menüsünü getiren SQL sorgusu eskiden 200 milisaniyede yanıt veriyordu.

Şimdi ise dört saniye sürüyordu.

Dört saniye, birinin sipariş vermesiyle birinin uygulamayı kapatması arasındaki farktır. Leo sorgu planını çalıştırmıştı. Tom indeks yapılandırmasına bakmıştı. Priya okuma replikası sayısını artırmıştı. Hiçbiri anlamlı bir fark yaratmamıştı.

Ve bu, odadaki havayı değiştirdi.

---

**İlk Deneme: Daha Fazla İndeks**

Leo sorgu planını açmıştı. Dikkatlice baştan sona inceledi.

"Sorun şu birleştirme," dedi. "Bir restoranın menüsünü çektiğimizde, menu_items tablosunu modifiers tablosuyla, sonra combos tablosuyla, sonra availability_windows tablosuyla birleştiriyoruz. Dört tablo, üç birleştirme, elli bin satır."

Her tabloda `restaurantId` üzerine bir indeks ekledi. Sorguyu tekrar çalıştırdı. İki saniye. Daha iyi, ama yeterli değil.

Tom sorgu ipuçları hakkında bir şeyler okumuştu. Bir öğleden sonrasını ince ayar yaparak geçirdi. Bir nokta üç saniye. Hâlâ iyi değil.

"Ya denormalize edersek?" diye sordu Leo. "Modifikatörleri doğrudan menu_items tablosundaki bir JSON sütununda birleştirelim. Daha az birleştirme."

Denediler. Tam bir saniye. İlerleme gibi hissettirdi. Maya restoran ortaklarına hız sorununu çözdüklerini söyleyen bir mesaj gönderdi. O bir salı günüydü.

Perşembe günü sorgu yeniden 2,8 saniyeye çıkmıştı. Verileri büyümüştü. Daha fazla restoran katılmıştı. Restoran başına daha fazla öğe. Çözülmüş gibi hissettiren sorgu çözülmemişti.

"İndeks yaklaşımı bugünkü veriye ayak uyduruyor," dedi Priya. "Ama haftada kırk restoran ekliyoruz. Gelecek çeyreğe kadar öğe sayımız ikiye katlanacak. O zaman sorgu nasıl görünecek?"

"En az üç saniye," dedi Leo. "Muhtemelen beş."

"Yani kendimize birkaç hafta kazandırdık."

"Evet."

Bunu içlerine sindirdiler. Süresi dolan bir düzeltme aslında bir düzeltme değildir.

---

**İkinci Deneme: Okuma Replikaları**

Priya okuma replikası sayısını zaten bir kez artırmıştı. Tekrar denedi — şimdi iki okuma replikası vardı ve uygulama bunlar arasında yük dengelemesi yapıyordu. Teori sağlamdı: okuma trafiğini dağıt, her replika daha az iş yapsın.

Biraz yardımcı oldu. Tepe yükte 2,8 saniyeden 2,2 saniyeye düştü.

"Çünkü darboğaz okuma sayısı değil," dedi Tom, veritabanı metriklerine bakarak. "Sorgunun kendisi. Daha fazla replika, aynı yavaş sorguyu çalıştıran daha fazla sunucu demek. Sorgu hâlâ yavaş."

"Bu ayda ne kadar maliyet çıkarıyor?" diye ekledi, çünkü hep sorardı. "db.r5.large üzerinde iki ekstra okuma replikası — ayda yaklaşık 350 dolar. İki saniyelik bir iyileşme için."

Leo replika panelini kapattı.

"Yani daha fazla donanım kötü bir sorguyu düzeltmiyor," dedi Maya.

"Bir sorun indekslemeden, önbellekleme denemelerinden ve ekstra replikalardan sağ kurtulduğunda," dedi Leo yavaşça, "belki sorun yapılandırma değildir. Belki sorun sistemin şeklidir."

Bu, daha uzun bir sohbetin başlangıcıydı.

---

*Geçen hafta ekip nihayet RDS'yi kontrol altına almıştı. Multi-AZ yedek, otomatik yedeklemeler, raporlama sorgularını işleyen bir okuma replikası. Leo'yu geceleri uyandıran o DBA sorunu çözülmüştü. Yönetilen veritabanı katmanı stabildi. Ama stabil olmak hızlı olmak anlamına gelmiyordu ve şimdi sorun hızdı. Menü tablosu, daha fazla replikanın düzeltemeyeceği sınırlara çarpmaya başlamıştı. Verinin kendi şekli yanlıştı.*

---

**Her Şeyi Bir Tabloya Sığdırma Sorunu**

İlişkisel veritabanlarının temel gerilimi şudur: *yapılandırılmış* veriyi *sabit* şekillerde depolamak üzere tasarlanmışlardır.

Her menü öğesi aynı alanlara sahip olsaydı — ad, fiyat, açıklama, kategori — SQL mükemmel olurdu. Temiz bir `menu_items` tablonuz, her öğe için satırlarınız ve anlamlı sorgularınız olurdu.

Ama gerçek menüler böyle çalışmaz.

Bir öğenin "baharat seviyesi" modifikatörü olabilir. Bir başkasının "protein seçimi" olabilir. Üçüncüsünde iç içe geçmiş kombolar olabilir — "aile menüsünü sipariş edin, iki ana yemek, iki yan ürün ve bir içecek alın." Verinin yapısı *öğeden öğeye* değişir.

SQL'de iki seçeneğiniz vardır:

**Seçenek 1**: Olası her modifikatör için bir sütun oluşturun. Bu, çoğu sütunun çoğu zaman boş olduğu çok geniş bir tablo üretir.

**Seçenek 2**: Ayrı bir modifikatör tablosu oluşturun ve onu menü öğeleri tablosuyla birleştirin. Bu işe yarar, ama karmaşık menüler birden çok birleştirme gerektirir ve elli bin öğe ile yüksek okuma hacminde bu birleştirmeler pahalı hale gelir.

"Üçüncü bir seçenek var," dedi köşede sessizce belge okumakta olan Priya.

Yeni bir sekme açtı. "Ya veri bir tabloya sığmak zorunda olmasaydı?"

**Veriyi Düşünmenin Farklı Bir Yolu**

İlişkisel veritabanları veriyi tablolardaki satırlar olarak depolar. Her satır tablonun şemasına uymak zorundadır. Şema önceden kararlaştırılır.

NoSQL veritabanları veriyi farklı şekilde depolar. Yaygın bir yaklaşım *belge modelidir*: her kayıt, kendi kendine yeten bir belge (genellikle JSON) olarak saklanır ve aynı koleksiyondaki belgelerin aynı alanlara sahip olması gerekmez.

Belge modelinde bir menü öğesi şöyle görünebilir:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Başka bir öğe tamamen farklı görünebilir:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Farklı şekiller. Aynı koleksiyon. Sorun yok.

"Yani veritabanı bir tablodan çok bir dosyalama sistemine benziyor," dedi Maya.

"Aynen," dedi Priya. "Herhangi bir belgeyi herhangi bir çekmeceye koyabilirsin. Belgeyi sabit bir boyuta sığsın diye kesmek zorunda değilsin."

**DynamoDB ile Tanışın**

Amazon DynamoDB, AWS'nin yönetilen NoSQL veritabanı hizmetidir. Veriyi öğeler olarak (satırlar değil) depolar ve öğeler tablolarda toplanır (isimlendirme SQL'e benzer, ama davranış farklıdır).

Bir DynamoDB tablosundaki her öğenin, onu benzersiz biçimde tanımlayan bir **birincil anahtarı** olmalıdır. Geri kalan her şey esnektir.

Birincil anahtar iki biçimden biri olabilir:

**Yalnızca bölüm anahtarı**: Tüm öğeler arasında benzersiz olması gereken tek bir özellik.

**Bölüm anahtarı + sıralama anahtarı (bileşik birincil anahtar)**: *Birlikte* benzersiz bir kombinasyon oluşturan iki özellik. Bu, sıralama anahtarlarına göre farklılaşan, aynı bölüm anahtarına sahip birden çok öğeye sahip olmanızı sağlar.

Nimbus'un menüsü için:

- Bölüm anahtarı: `restaurantId`
- Sıralama anahtarı: `itemId`

Bu, belirli bir restoranın tüm öğelerini verimli biçimde getirebileceğiniz anlamına gelir — DynamoDB hangi bölüme bakacağını tam olarak bilir.

"Neden buna bölüm anahtarı deniyor?" diye sordu Tom.

"Ya birisi içeri girmeye çalışırsa?" diye sordu Priya. "Bölüm anahtarı tahmin edilebilirse, biri tek bir bölüme yazma spam'i yaparak sıcak nokta durumunu kasten yaratabilir mi?"

"Evet," dedi Leo. "Bu aslında kötü tasarlanmış tablolar için bir hizmet engelleme vektörü. Bu da yüksek kardinaliteli anahtarlar seçmek için bir neden daha."

Priya bunu not aldı.

**DynamoDB Veriyi İçeride Nasıl Depolar**

DynamoDB, devasa boyutlara yatay olarak ölçeklenecek şekilde inşa edilmiştir. Bunu *bölümleme* yoluyla başarır — veri, bölüm anahtarına göre birçok fiziksel makineye bölünür.

Bir öğe yazdığınızda, DynamoDB bölüm anahtarı değerini hash'ler ve bu hash'i öğenin hangi fiziksel bölümde (ve dolayısıyla hangi sunucuda) depolanacağını belirlemek için kullanır. Bir öğe okuduğunuzda, DynamoDB onu anında bulmak için aynı hesaplamayı yapar.

Bunu bir posta sistemi gibi düşünün. Her zarfta bir posta kodu varsa, posta servisi her zarfı nereye ait olduğunu anlamak için okumaz — posta koduna göre ayırır. DynamoDB, bölüm anahtarı hash'ine göre ayırır.

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya. "Bölüm anahtarı seçimi neden bu kadar önemli? Herhangi bir şey seçemez miyiz?"

Bu doğru sorudur. Bölüm anahtarı, bir DynamoDB şemasındaki en önemli tasarım kararıdır. İşte nedeni:

Düşük kardinaliteli bir bölüm anahtarı seçerseniz — diyelim ki `available: true/false` ya da `category: "main/side/drink"` — verinizin çoğu aynı birkaç bölüme düşer. DynamoDB buna "sıcak bölüm" der. Tek bir sunucu trafiğin çoğunu işler. Aşırı yüklenir. DynamoDB istekleri kısıtlamaya başlar. Kullanıcılar hatalar görmeye başlar.

- **İyi**: Yüksek kardinalite, eşit dağılmış değerler (çok sayıda restoranla `restaurantId`)
- **Kötü**: Düşük kardinalite (`true/false`, `category`) — verinin çoğu birkaç bölüme düşer ve "sıcak noktalar" yaratır

"Yani `available: true`'yu bölüm anahtarı olarak kullansaydım," dedi Leo yavaşça, "tüm mevcut öğeler aynı bölümde birikirdi."

"Ve veritabanın akşam yoğunluğunda erirdi," diye onayladı Priya.

Leo dizüstü bilgisayarını yavaşça kapattı.

---

**Sıcak Bölüm Olayı**

Bunu hayal etmek zorunda kalmayacaklardı. Aylar sonra — DynamoDB'deki ikinci aylarında, kuralı henüz gerçekten özümsemeden önce — bunu zor yoldan öğreneceklerdi.

Ekip yeni bir özellik başlatmıştı: bir "Öne Çıkan Öğeler" rozeti. Restoran ortakları en fazla beş öğeyi öne çıkan olarak işaretleyebiliyordu. Özellik, her öğede bir `featured: true` özelliği saklıyordu.

Leo, tüm restoranlardaki tüm öne çıkan öğeleri sorgulamanın yararlı olacağını düşündü — ana sayfadaki bir "trend öğeler" widget'ı için. Bu sorguyu desteklemek için ikincil bir indeks oluşturmuştu. İndeks, bölüm anahtarı olarak `featured`'ı kullanıyordu.

"Sorun olmaz," demişti. "Kaç tane öne çıkan öğe olabilir ki?"

İki yüz kırk restorana yayılmış, yaklaşık bin iki yüz tane.

Ama "trend öğeler" widget'ı her sayfada yükleniyordu. Her sayfa yüklemesi, `featured` indeksine karşı bir sorgu tetikliyordu. Bin iki yüz öğenin hepsi iki bölümde yaşıyordu — `true` ve `false`. `true` bölümü her isabeti alıyordu.

Cuma akşamı yemek yoğunluğu. Sekiz bin eşzamanlı kullanıcı. Hepsi ana sayfayı yüklüyor.

DynamoDB hata oranı yüzde on sekize fırladı. Bazı kullanıcılar boş bir trend widget'ı aldı. Bazıları yükleme dönüşü gördü. Bazıları sipariş akışına sızan hatalar aldı.

Leo metrikleri çekti. "İndeks bölümü kısıtlanıyor," dedi. "Tek bir bölümdeki verim limitine çarpıyoruz."

"Nasıl?" diye sordu Priya.

"`featured` anahtarının yalnızca iki değeri var. Bin iki yüz öne çıkan öğenin hepsi aynı bölümde yaşıyor. Her ana sayfa yüklemesi o bölüme çarpıyor."

Trend widget'ını üç dakika içinde devre dışı bıraktılar. Hata oranı sıfıra düştü.

"Yani iki değerli bir bölüm anahtarı bizi cuma gecesi kısıtladı," dedi Tom.

"Evet," dedi Leo.

"Bu bize ne kadara mal oldu?"

"Sekiz bin kullanıcıda yaklaşık kırk dakika kötüleşmiş deneyim," dedi Priya. "Gelir etkisi, muhtemelen birkaç yüz sipariş."

Leo indeksi farklı bir tasarımla değiştirdi: `restaurantId`'yi bölüm anahtarı olarak kullanan, `featured_items` adlı özel bir DynamoDB tablosu ve bunu ana tablodan her on beş dakikada bir güncelleyen zamanlanmış bir Lambda — AWS'nin sizin için çalıştırdığı küçük bir kod parçası (Bölüm 20). Sorgu, ana tablodaki bir sıcak bölüm yerine küçük, izole bir tablo üzerinde bir tarama haline geldi.

"Önce erişim desenlerinizi tasarlayın," dedi Priya. "Sonra veri modelinizi seçin."

"Biliyorum," dedi Leo. "Artık biliyorum."

---

**Ölçekte Okuma ve Yazma**

DynamoDB saniyede milyonlarca isteği işleyebilir. Ama ne kadar kapasite tahsis edeceğini bilmesi gerekir.

İki kapasite modu vardır:

**Tahsis edilmiş kapasite**: Kaç okuma ve yazma birimi istediğinizi belirtirsiniz. DynamoDB bu kapasiteyi sizin için ayırır ve onu aşan trafiği kısıtlar. Öngörülebilir maliyet, istek başına daha düşük fiyat.

Birimlerin kesin tanımları vardır ve sınav bunları bilmenizi bekler: bir **Okuma Kapasite Birimi (RCU)**, en fazla 4 KB'lık bir öğenin saniyede bir güçlü tutarlı okumasıdır — ya da aynı boyutta iki nihai tutarlı okumadır. Bir **Yazma Kapasite Birimi (WCU)**, en fazla 1 KB'lık bir öğenin saniyede bir yazmasıdır. Daha büyük öğeler orantılı olarak daha fazla tüketir: 12 KB'lık bir öğeyi güçlü tutarlı okumak 3 RCU'ya mal olur; 3 KB'lık bir öğeyi yazmak 3 WCU'ya mal olur.

**Talep üzerine kapasite**: DynamoDB gerçek trafiğinizle otomatik olarak ölçeklenir. Rutin kapasite planlaması gerekmez. İstek başına daha yüksek maliyet ve operasyonel olarak çok daha basit, ancak bir tablonun son trafik desenini fazlasıyla aşan ani sıçramalar, çok hızlı yükselirlerse hâlâ kısıtlamaya neden olabilir.

Nimbus için menü, yazıldığından çok daha sık okunur. Bir müşteri uygulamayı açar, menüye göz atar — bu, birçok okumadır. Bir restoran ortağı menüsünü haftada iki kez günceller — bu, ara sıra yazmadır.

"Şimdilik talep üzerine mantıklı," dedi Tom. "Trafik desenlerimizi henüz bilmiyoruz. İstek başına daha fazla ödemek, yetersiz tahsis edip kısıtlanmaktan daha iyi."

İstemeye istemeye altyapı bilgeliği. Hem de Tom'dan. Ekip resmen büyümüştü.

"Bu ayda ne kadar maliyet çıkarıyor?" diye sordu Tom, fiyatlandırma hesaplayıcısını açarak.

"Mevcut okuma hacmimizde — günde yaklaşık kırk bin okuma — talep üzerine ayda yaklaşık on iki dolar," dedi Leo. "Tahsis edilmiş, doğru ayarlarsak, dörde daha yakın. Ama kapasiteyi elle ayarlamak ve yanlış tahmin edersek kısıtlanma riskini almak zorunda kalırız."

Tom her iki rakamı da not aldı. Rakamları hep not alırdı.

**Tutarlılık: Veriniz Ne Kadar Taze?**

DynamoDB veriyi birden çok Erişilebilirlik Bölgesine otomatik olarak çoğaltır. Bu, dayanıklılık için harikadır, ama aynı zamanda okuma tutarlılığı hakkında net düşünmeniz gerektiği anlamına gelir.

DynamoDB'den okuduğunuzda bir seçeneğiniz vardır:

**Nihai tutarlı okuma**: Bu varsayılandır. Daha ucuzdur ve sonuç, yakın zamanda tamamlanmış bir yazmanın kısa süre gerisinde kalabilir.

**Güçlü tutarlı okuma**: Bir tabloya veya yerel ikincil indekse karşı okumalarda DynamoDB, başarılı önceki yazmalardan en son taahhüt edilmiş değeri döndürebilir. Bu daha fazla okuma kapasitesine mal olur ve global ikincil indeksler için mevcut değildir.

Menü verisi için nihai tutarlılık iyidir. Bir milisaniye eskimiş bir menü öğesi önemli değildir.

Sipariş onay verisi için — "bu sipariş verildi mi?" — güçlü tutarlılık istersiniz. Siparişi yeni kaydedilmişken müşteri bir "tekrar deneyin" mesajı görmemeli.

"Bu, banka bakiyenizi uygulamadan kontrol etmekle bankayı doğrudan aramak arasındaki fark gibi," dedi Maya. "Uygulama otuz saniye geride olabilir. Telefon görüşmesi her zaman güncel."

Şunu merak ediyor olabilirsiniz: DynamoDB birden çok AZ'ye otomatik olarak çoğaltıyorsa, tutarlılık modu neden önemli olsun? İşte cevap: çoğaltma küçük ama sıfır olmayan bir süre alır — genellikle milisaniyeler. Nihai tutarlı bir okuma, henüz en son yazmayı almamış bir replikadan sunulabilir. Güçlü tutarlı bir okuma her zaman verinin birincil kopyasıyla iletişim kurar. Çoğu kullanım durumu için (menü öğeleri, ürün katalogları, kullanıcı profilleri) gecikme fark edilmezdir. Doğruluğun okuma anında önemli olduğu kullanım durumları için (ödeme onayı, stok müsaitliği) güçlü tutarlılık istersiniz.

**İkincil İndeksler: Birincil Anahtarın Ötesinde Sorgulama**

Veriye birincil anahtarın izin verdiğinden farklı bir şekilde erişmeniz gerekirse ne olur?

DynamoDB **ikincil indeksleri** destekler — aynı veriyi farklı özelliklerle sorgulamanızı sağlayan alternatif anahtarlar.

**Yerel İkincil İndeks (LSI)**: Tabloyla aynı bölüm anahtarını ama farklı bir sıralama anahtarını kullanır. Tablo oluşturulurken tanımlanmalıdır ve sonradan eklenemez. Tablonun tahsis edilmiş kapasitesini paylaşır. LSI'lar bölümü paylaştığından, güçlü tutarlı okumaları destekler.

**Global İkincil İndeks (GSI)**: Kendi bölüm anahtarı ve sıralama anahtarına sahip tamamen ayrı bir indeks — tablonun birincil anahtarından farklı. Tablo var olduktan sonra eklenip kaldırılabilir, bu da esneklik sağlar. Tablodan ayrı, kendi tahsis edilmiş kapasite ayarlarına sahiptir.

Nimbus için: öğeleri fiyat aralığına göre sorgulamaları gerekirse, bir GSI bunu destekleyebilir — ama akılda tutulması gereken tek bir kuralla: bir bölüm anahtarı yalnızca *eşitlik* karşılaştırmalarını kabul eder, bu yüzden (aralık vermek istediğiniz) `price`, kategori veya `cuisineType#region` gibi bir gruplama özelliği GSI bölüm anahtarı olacak şekilde **sıralama anahtarı** olmalıdır. Bu, aşağıdaki örnekte tam olarak oluşturulan indekstir.

Bir LSI seçerseniz güçlü tutarlılık ve paylaşılan kapasite elde edersiniz, ama tablo oluşturulurken o tasarıma kilitlenirsiniz; bir GSI seçerseniz onu sonradan ekleme esnekliği ve bağımsız ölçekleme elde edersiniz, ama indekse karşı güçlü tutarlı okuma yapma yeteneğini kaybedersiniz.

---

**Bir GSI Sorgusu İncelemesi**

Priya somut bir örnek üzerinden ilerledi. Nimbus bir "mutfağa göre gözat" özelliğini desteklemek istiyordu: belirli bir mutfak türündeki tüm mevcut yemekleri tüm ortak restoranlarda göstermek.

Ana tabloda `restaurantId` bölüm anahtarı ve `itemId` sıralama anahtarıdır. "cuisineType = Colombian olan tüm öğeleri" verimli biçimde sorgulayamazsınız — bu, her bölümde bir tarama gerektirir.

Bir GSI oluşturdular:

- GSI bölüm anahtarı: `cuisineType#region` (örn. "Colombian#NYC", "Mexican#Chicago")
- GSI sıralama anahtarı: `price`

GSI, her öğenin bir projeksiyonunu — yalnızca gözat sayfası için gereken alanları — indeks deposuna kopyalar. Şimdi `cuisineType#region = "Colombian#NYC"` ile GSI'ya karşı yapılan bir sorgu, doğrudan indeksin o bölümüne gider.

"Neden sadece `cuisineType` kullanmıyoruz?" diye sordu Leo.

"Çünkü tek başına cuisineType düşük kardinaliteye sahip," dedi Priya. "Kolombiya, Meksika, Tayland — toplamda yirmi değer. Yine sıcak bölümler. Bölgeyi eklemek bize Colombian#NYC, Colombian#Chicago, Colombian#LA veriyor. Daha çok bölüm, daha iyi dağılım."

"Bu biraz hacky geliyor."

"Bu standart bir DynamoDB deseni. Buna bölüm anahtarı parçalama deniyor. Bazen araçla birlikte çalışmak zorundasın."

Koddaki GSI sorgusu şöyle görünüyordu:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Bu, New York City'deki, 10 ile 25 dolar arasında fiyatlanmış tüm Kolombiya yemeklerini, fiyata göre sıralanmış olarak, yaklaşık 4 milisaniyede döndürdü.

"Bu, eski SQL sorgusundan bin kat daha hızlı," dedi Leo.

"Çünkü yalnızca bir indeksin bir bölümüne dokunuyor," diye onayladı Priya. "Birleştirilmiş bir tablodaki her satırı taramıyor."

---

**DynamoDB Streams: Değişikliklere Tepki Vermek**

"Bir menü öğesi güncellendiğinde ne olacağını düşündük mü?" diye sordu Priya bir sabah. "Bir restoran ortağı bir fiyatı değiştiriyor. Arama indeksini güncellememiz gerekiyor. ElastiCache girişini geçersiz kılmamız gerekiyor" — sonraki bölümde tanışacağımız önbellekleme hizmeti — "ve değişikliği analitik hattımız için günlüğe kaydetmemiz gerekiyor."

"Bunların hepsini API işleyicide yapabiliriz," dedi Leo. "Yazma gerçekleştiğinde, tüm aşağı akış güncellemelerini tetikleriz."

"Peki biri başarısız olursa?"

"O zaman... tekrar deneriz."

"Ya EC2 örneği yazmadan sonra ama aşağı akış güncellemelerinden önce çökerse? Veri kaydedilmiş, ama değişiklikten kimsenin haberi yok."

Leo bunu düşündü.

"Güncellemenin garanti edilmesi gerekiyor," dedi. "Uygulama kodumuz yolun ortasında başarısız olsa bile."

İşte **DynamoDB Streams** bunu çözer.

DynamoDB Streams, bir DynamoDB tablosundaki her öğe değişikliğinin zaman sıralı bir günlüğünü yakalar. Her ekleme, güncelleme ve silme akışa bir olay olarak yazılır. Akış olayları 24 saat saklar.

Akışa bir Lambda işlevi ekleyebilirsiniz. Bir öğe her değiştiğinde, Lambda işlevi öğenin önceki ve sonraki durumuyla çağrılır. Lambda daha sonra şunları yapabilir:

- Bir arama indeksini güncellemek (OpenSearch)
- ElastiCache'te bir önbellek girişini geçersiz kılmak
- Başka bir sisteme bildirim göndermek
- Bir analitik hattını beslemek
- Değişikliği başka bir tabloya veya veritabanına çoğaltmak

Kritik fark: Streams, yazmayı aşağı akış etkilerinden ayırır. DynamoDB yazması, Lambda'nın başarılı olup olmamasından bağımsız olarak başarılı olur. Lambda başarısız olursa, DynamoDB onu tekrar dener. Uygulama yazmadan sonra çökerse, akış olayı hâlâ oradadır — işler düzeldiğinde Lambda onu işleyecektir.

"Yani DynamoDB'ye yazıyoruz," dedi Leo yavaşça, "ve biz çöksek bile DynamoDB aşağı akış işlemenin sonunda gerçekleşeceğini garanti ediyor."

"Aynen," dedi Priya. "Bu, tüm yan etkilerinizin çalışmasını ummakla, veritabanının bunları garanti etmesi arasındaki farktır."

Nimbus için menü tablosunda DynamoDB Streams'i, menü öğeleri değiştiğinde ElastiCache girişlerini geçersiz kılan bir Lambda'ya bağladılar. Önbellek, geçersizleştirmeyi yöneten herhangi bir uygulama kodu olmadan, otomatik olarak veritabanıyla tutarlı kaldı.

"Streams ne kadara mal oluyor?" diye sordu Tom.

"Akıştan okumak için ödeme yaparsınız — her Lambda çağrısı ondan okur. Bizim hacmimizde, muhtemelen ayda iki ila üç dolar."

Tom onu başka soru sormadan onayladı. İki doların ayda ne zaman değdiğini öğrenmişti.

**Takas: DynamoDB'nin Yapamadıkları**

NoSQL, SQL'den kesinlikle daha iyi değildir. Farklı bir iş için farklı bir araçtır.

DynamoDB'nin vazgeçtikleri:

**Esnek sorgular**: SQL'de herhangi bir sütuna göre filtreleyip sıralayabilirsiniz. DynamoDB'de yalnızca birincil anahtara göre verimli sorgu yapabilirsiniz. Keyfi alanlara göre sorgulama bir *tarama* gerektirir (tablodaki her öğeyi okumak), bu da ölçekte pahalı ve yavaştır.

**Birleştirmeler**: DynamoDB birleştirme yapmaz. İki tablodan veriye ihtiyacınız varsa, uygulama kodunuzda iki ayrı okuma yaparsınız.

**İşlemler**: DynamoDB işlemleri destekler, ama ilişkisel veritabanları birçok çok varlıklı iş akışı, raporlama yoğun sistem ve birleştirme yoğun tasarım için hâlâ daha doğal bir uyumdur.

**Tanıdıklık**: Onlarca yıllık SQL araçları, becerileri ve zihinsel modelleri doğrudan aktarılmaz.

DynamoDB'nin başarılı olduğu alanlar:

- Anahtar-değer ve belge erişim desenleri
- Devasa ölçek (her boyutta tek haneli milisaniye gecikme)
- Sunucusuz, altyapı yönetimi yok
- Otomatik ölçekleme, multi-AZ çoğaltma, yedeklemeler
- Veri hacminden bağımsız öngörülebilir performans

"Yani kural şu," dedi Maya, "veriye *tam olarak* nasıl erişeceğinizi bildiğinizde DynamoDB kullanın. Henüz bilmediğinizde SQL kullanın."

Priya başını salladı. "Önce erişim desenlerinizi tasarlayın. Sonra veritabanınızı seçin."

Bu, bir veritabanı sohbetinin üretebileceği en kıdemli şeylerden biridir.

---

**DynamoDB Yanlış Seçim Olduğunda**

Finansal raporlama modülünü üstlenmiş olan Tom'un bir sorusu vardı.

"Finansal raporlamayı geliştiriyoruz," dedi. "Restoran başına aylık gelir özetleri, vergi hesaplamaları, fatura geçmişi. Bunu da DynamoDB'ye koyabilir miyiz?"

Ekip birbirine baktı.

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya, Priya'dan önce.

Priya gülümsedi. Maya alışkanlığı kapıyordu.

"Sorguları bize anlat," dedi Priya Tom'a.

Spesifikasyonu açtı. "Şunlara ihtiyacımız var: restoran başına toplam gelir, haftaya göre gruplanmış. Tüm restoranlarda sipariş sayısına göre en iyi performans gösteren öğeler. Mutfak türüne göre dağıtılmış gelir. Şehre göre ortalama sipariş değeri. Ortak raporlaması için yıldan yıla karşılaştırma."

Leo listeyi okudu. "Bunların her biri bir toplama. Topla, grupla, ortala, karşılaştır."

"DynamoDB'nin toplama işlevleri yok," dedi Priya. "GROUP BY yok. SUM yok. AVG yok. 'Bu hafta restoran başına toplam gelir'i yanıtlamak için, haftanın her siparişini taramanız, hepsini uygulama belleğine çekmeniz ve kendiniz hesaplamanız gerekir."

"Bu kötü geliyor," dedi Tom.

"Bizim ölçeğimizde, bu her rapor isteği için belleğe çekilen onbinlerce kayıt demek. Yavaş ve pahalı olurdu. Ve her yeni rapor gereksinimi eklediğimizde, yeni tara-ve-hesapla kodu yazıyor olurduk."

"Peki ne kullanırız?"

"Finansal raporlama için mi? RDS. Düzgün indeksli PostgreSQL. Tarif ettiğin sorgular tam olarak SQL'in tasarlandığı şey. On satır SQL olurlardı. İki yüz satır DynamoDB tarama kodu olurlardı."

DynamoDB şu durumlarda yanlıştır:

- Erişim desenlerinizi önceden bilmiyorsanız (raporlama doğası gereği keşifseldir)
- Büyük veri kümeleri üzerinde toplamalara (SUM, GROUP BY, COUNT) ihtiyacınız varsa
- Verinizin karmaşık ilişkileri varsa ve birleştirmelere ihtiyacınız varsa
- Geçici sorgu esnekliğine ihtiyacınız varsa — henüz düşünmediğiniz soruları sormak için
- Verinizin anahtar-değere doğal olarak eşlenmeyen, temelde ilişkisel bir yapısı varsa

"Yani seçim 'yeni teknoloji daha iyidir' değil," dedi Maya.

"Seçim 'verinizin şekli nedir ve ona nasıl erişeceksiniz'," diye onayladı Priya. "DynamoDB menü için gerçekten daha iyi. Finansal raporlar için gerçekten daha kötü olurdu. Her iki ifade de aynı anda doğru."

Tom finansal raporlamayı PostgreSQL üzerine inşa etti. Yazdığı ilk GROUP BY sorgusu 80 milisaniyede döndü. Tek satır tarama kodu yazmak zorunda kalmadı.

---

**Hangisini Ne Zaman Kullanmalı**

| Durum                                                  | Şunu Tercih Edin        |
|-------------------------------------------------------|-------------------------|
| Yapılandırılmış veri, karmaşık sorgular, raporlama    | RDS (PostgreSQL, MySQL) |
| Esnek veri şekilleri, anahtar tabanlı erişim, devasa ölçek | DynamoDB           |
| Karmaşık ilişkilerle yazma yoğun                      | RDS                     |
| Öngörülebilir erişim desenleriyle okuma yoğun         | DynamoDB                |
| Birleştirme ve toplamalara ihtiyacınız var            | RDS                     |
| Saniyede milyonlarca istekte milisaniye gecikme       | DynamoDB                |
| Birden çok varlık arasında işlemler                   | RDS (genellikle)        |
| Sunucusuz / öngörülemeyen trafik sıçramaları          | DynamoDB talep üzerine  |
| Finansal raporlama, geçici analitik                   | RDS veya bir veri ambarı |
| Olay kaynaklama, değişiklik yakalama, gerçek zamanlı işleme | DynamoDB + Streams |

Yanlış cevap her zaman "her zaman birini veya diğerini kullan"dır. Nimbus sonunda her ikisini de kullandı: sipariş geçmişi ve finansal kayıtlar için RDS (yapılandırılmış, ilişkisel, raporlama gerektirir), menü için DynamoDB (esnek şema, yüksek okuma hacmi, restoran ID'ye göre erişim).

## Doğru İş Yükü İçin Doğru Veritabanı

Altı ay ileri sarın — DynamoDB geçişi iyice oturduktan çok sonra — ve Nimbus'un panosunda üç yeni proje vardı. Maya bir salı sabahı ekibi bunlar üzerinden geçirdi.

"Birincisi: bir öneri motoru. Müşterilere geçmişlerine ve benzer zevklere sahip insanların sipariş ettiklerine dayanarak sipariş etmeleri muhtemel yemekleri göstermek istiyoruz. İkincisi: daha zengin içeriği desteklemek için menü verisini taşıyoruz — JSON'da tam menü belgeleri, restoran başına farklı yapı, esnek şema. Üçüncüsü: Barato satın alımını kapatmak üzereyiz ve onların veri ekibi müşteri davranış verisi için bir Cassandra kümesi çalıştırıyor. Bunu hatlarını yeniden yazmadan AWS'ye getirmek istiyorlar."

Üç proje. Üç çok farklı veri gereksinimi. Hiçbiri bariz DynamoDB uyumu değildi.

"Bunların hepsi farklı veritabanları gerektiriyor," dedi Priya.

"DynamoDB'miz var," dedi Leo.

"Doğru aracı seçme hakkımız var," dedi Priya.

**Amazon DocumentDB: İş Yükünüz MongoDB Konuştuğunda**

İkinci proje — esnek, restoran başına şemalarla zengin JSON menü belgeleri — bir belge veritabanını tanımlıyordu. Nimbus menü için zaten DynamoDB'nin esnek şemasını kullanıyordu, ama ekip daha sofistike menü özellikleri inşa ettikçe (iç içe modifikatörler, zaman tabanlı fiyatlandırma, karmaşık kombo yapıları), DynamoDB sorgu modeli sınırlarını gösteriyordu. Ekip daha zengin belge sorguları istiyordu: iç içe bir modifikatörün belirli bir seçeneği içerdiği tüm menü öğelerini bulmak, JSON yapısının içindeki keyfi alanlara göre filtrelemek.

"Bu bir belge veritabanı deseni," dedi Priya. "MongoDB."

"MongoDB'yi EC2'de çalıştırabiliriz," diye önerdi Leo.

"Ya da DocumentDB kullanabiliriz," dedi Priya.

**Amazon DocumentDB**, MongoDB uyumlu, yönetilen bir belge veritabanıdır. Veriyi esnek şemalarla JSON benzeri belgeler olarak depolar — aynı koleksiyondaki farklı belgeler farklı alanlara sahip olabilir. DocumentDB, MongoDB'nin sorgu dilini, API'lerini ve sürücülerini destekler. İş yükünüz şu anda MongoDB üzerinde çalışıyorsa, DocumentDB aynı dili konuşur. Geçiş yolu, bir uygulamayı yeniden yazmak değil, bir bağlantı dizesini taşımaktır.

DocumentDB tamamen yönetilendir: yama yok, otomatik yedeklemeler, Multi-AZ yüksek erişilebilirlik, okuma replikaları ve veriniz büyüdükçe otomatik olarak büyüyen depolama.

"Yani menüyü DocumentDB'ye taşıyoruz," dedi Leo. "Ve MongoDB sözdiziminde zaten sahip olduğumuz sorgular öylece çalışıyor mu?"

"Ufak uyumluluk testiyle, evet," diye onayladı Priya. "DocumentDB, MongoDB'nin sorgu API'sinin çoğunu destekler. Tam kapsama varsaymadan önce uyumluluk matrisini kontrol et, ama belge sorguları ve toplamalar için bu basit."

DocumentDB için sınav sinyali basittir: **"MongoDB uyumlu"** ya da **"belge deposu."** Bir senaryo MongoDB'den veya belge odaklı veriden bahsediyorsa, DocumentDB yönetilen AWS cevabıdır.

**Amazon Neptune: İlişkilerin Veri Olduğu Durumda**

Öneri motoru daha zor bir problemdi.

Soru "bu müşteri ne sipariş etti?" değildi — bu basit bir DynamoDB aramasıydı. Soru şuydu: "bu müşteriye benzer zevk profillerine sahip hangi müşteriler var ve bu müşterilerin beğendiği ama bu müşterinin henüz denemediği hangi yemekler var?"

Bu bir grafik problemidir. Veri modeli, bir satır tablosu veya bir belge koleksiyonu değildir. Bir ilişkiler ağıdır: yemeklere bağlı müşteriler (sipariş edilmiş, değerlendirilmiş, görüntülenmiş), restoranlara ve mutfak türlerine bağlı yemekler, mahallelere ve şehirlere bağlı restoranlar. Öneri, veri noktalarında değildir — aralarındaki yollardadır.

"Bir grafik veritabanına ihtiyacımız var," dedi Priya.

**Amazon Neptune**, tamamen yönetilen bir grafik veritabanıdır. İki grafik modelini destekler: **özellik grafiği** (Gremlin gezinme diliyle sorgulanır) ve **RDF** (SPARQL ile sorgulanır). Mevcut grafik yığınınıza veya ekip tercihinize göre seçim yaparsınız; her ikisi de aynı Neptune altyapısında çalışır.

Grafik veritabanları, veri noktaları arasındaki ilişkilerin verinin kendisi kadar önemli olduğu iş yükleri için özel olarak inşa edilmiştir: sosyal ağlar (kim kime bağlı), öneri motorları (benzer kullanıcılar neyi beğendi), dolandırıcılık tespiti (hangi işlemler hesaplar arasında şüpheli desenler paylaşıyor) ve bilgi grafikleri (kavramlar nasıl ilişkili).

Nimbus'un öneri motoru için: müşteriler ve yemekler Neptune'da düğümler oldu. Sipariş olayları kenarlar oldu. Bir Gremlin gezinmesi, tek bir sorguda, benzer sipariş geçmişlerine sahip müşterilerin yüksek puan verdiği tüm yemekleri, bağlantının gücüne göre sıralanmış olarak bulabilir — ilişkisel bir veritabanında gereken karmaşık JOIN zincirleri olmadan ya da DynamoDB'de gerekecek birden çok gidiş-dönüş sorgusu olmadan.

Neptune için sınav sinyali: **"sosyal ağ," "öneri motoru," "bilgi grafiği," "dolandırıcılık tespiti"** ya da **"grafik gezinme."** Bir senaryo bağlantıların verinin kendisi kadar önemli olduğu veriyi tanımlıyorsa, Neptune cevaptır.

**Amazon Keyspaces: Operasyon Olmadan Cassandra**

Barato satın alımı tabloya bir Cassandra kümesi getirdi. Cassandra geniş sütunlu bir NoSQL veritabanıdır — çok yüksek yazma verimi ve yatay ölçeklenebilirlik için tasarlanmıştır, yaygın olarak zaman serisi verisi, kullanıcı etkinlik günlükleri ve IoT telemetrisi için kullanılır. Barato veri ekibi onu müşteri davranışını izlemek için kullanıyordu: hangi öğeler görüntülendi, hangileri sepete eklendi, hangileri terk edildi.

Cassandra'yı AWS'ye taşımanın iki seçeneği vardı: EC2'de çalıştırmak (kümeyi yönetmenin, yükseltmelerin, ölçeklemenin operasyonel yükü) ya da yönetilen seçeneği kullanmak.

"Amazon Keyspaces," dedi Priya.

**Amazon Keyspaces**, sunucusuz, Cassandra uyumlu, yönetilen bir veritabanıdır. Cassandra Query Language'i (CQL) destekler — Barato'nun hatlarının zaten kullandığı aynı sorgu dili. MongoDB için DocumentDB gibi, Keyspaces de yönetilen yoldur: uygulama kodunu olduğu gibi tutun, onu kendi kendine yönetilen küme yerine bir Keyspaces uç noktasına yönlendirin ve altyapıyı AWS'ye bırakın.

Keyspaces trafikle otomatik olarak ölçeklenir, kapasite planlaması gerektirmez ve sunucusuzdur — gerçekten gerçekleştirdiğiniz okuma ve yazmalar için ödeme yaparsınız. Barato davranış izleme verisi için bu doğru modeldi: son derece değişken hacim (akşam yoğunluğuna karşı sabah 3), geniş sütunlu şema, yüksek yazma verimi.

Sınav sinyali: **"Cassandra uyumlu," "geniş sütunlu," "CQL"** ya da **"Cassandra iş yükü."**

**Doğru Veritabanını Seçmek: Bir Referans Tablosu**

Hikayenin bu noktasında, Nimbus'un veritabanı manzarası yedinci bölümdeki haline hiç benzemiyordu. Her iş yükü için doğru araç:

| Tetikleyici İfade | Veritabanı |
|---|---|
| "MongoDB uyumlu" ya da "belge deposu" | DocumentDB |
| "Grafik ilişkileri," "sosyal ağ," "öneri motoru" | Neptune |
| "Cassandra uyumlu" ya da "geniş sütunlu" | Keyspaces |
| "Her ölçekte anahtar-değer," "tek haneli milisaniye gecikme" | DynamoDB |
| "İlişkisel + sunucusuz," "otomatik ölçeklenen SQL" | Aurora Serverless |
| "Yapılandırılmış veri, karmaşık sorgular, raporlama" | RDS (PostgreSQL, MySQL) |

"Bu büyümeye devam edecek mi?" diye sordu Leo, listeye bakarak.

"Evet," dedi Maya. "Çünkü farklı problemlerin farklı şekilleri var. Ve yanlış şekli kullanmak sana ya performans, ya geliştirici zamanı ya da her ikisini birden mal eder."

"Doğru soru 'hangi veritabanını kullanmalıyız' değil," diye ekledi Priya. "'Verimizin şekli ne ve ona nasıl erişeceğiz?' Veritabanı cevaptan çıkar."

Bu, iki yılda veritabanları hakkında söylediği en önemli şeydi.

## Güçlü Yönler ve Sınırlamalar

**DynamoDB neden güçlüdür**:

- Her ölçekte tek haneli milisaniye gecikme
- Tamamen yönetilen — yama yok, çoğaltma kurulumu yok, bakım pencereleri yok
- Otomatik multi-AZ çoğaltma (dayanıklılık yerleşik)
- Talep üzerine ölçekleme, sıfır kapasite planlaması demek
- Lambda, API Gateway, Streams ile yerel entegrasyon
- Belirli bir noktaya kurtarma (RDS otomatik yedeklemelerine benzer)
- DynamoDB Streams — her değişikliği bir olay olarak yakalar (gerçek zamanlı işleme için kullanışlı)

**DynamoDB nerede karmaşıklaşır**:

- Erişim deseni tasarımı pazarlık konusu değildir — hatalar geri almak için maliyetlidir
- Karmaşık sorgular ikincil indeksler gerektirir (maliyet ve karmaşıklık ekler)
- Taramalar pahalıdır — üretimde onlardan kaçının
- "Öğe boyutu sınırı" 400KB'dır — büyük öğeler farklı depolama gerektirir
- Okuma/yazma birim maliyetlerini anlamazsanız fiyatlandırma sizi şaşırtabilir
- Sıcak bölümler sessiz katillerdir — kısıtlama başlayana kadar hata yoktur

## Özet

Şema yeniden tasarımı iki gün ve bolca beyaz tahta alanı almıştı. Bir NoSQL veritabanı seçmek yalnızca teknik bir karar değildir — veri hakkında düşünme şeklinizi tamamen değiştirir. Ama sonuç, yavaşlamadan herhangi bir boyuta büyüyebilen bir menü tablosuydu. Aynı derecede önemli olan: ekip DynamoDB'nin sınırlarının nerede olduğunu ve problem şekil değiştirdiğinde hangi özel veritabanlarına başvuracağını öğrendi.

- DynamoDB, AWS'nin yönetilen NoSQL veritabanı hizmetidir. Öğeler esnek belgelerdir — sabit şema yok. Her öğenin bir **birincil anahtarı** olmalıdır: tek başına bir bölüm anahtarı ya da bir bölüm anahtarı + sıralama anahtarı. Eşit dağılım için bölüm anahtarını seçin — sıcak bölümler kısıtlamaya neden olur.
- **Talep üzerine** kapasite otomatik ölçeklenir; **tahsis edilmiş** kapasite öngörülebilir trafik için daha ucuzdur. **Nihai tutarlı** okumalar daha ucuzdur; **güçlü tutarlı** okumalar her zaman günceldir ama GSI'larda mevcut değildir.
- **DynamoDB Streams** öğe düzeyindeki değişiklikleri gerçek zamanlı yakalar — önbellek geçersizleştirmeyi, arama indeksi güncellemelerini ve analitik hatlarını yönlendirmek için kullanın.
- DynamoDB raporlama, karmaşık birleştirmeler ve geçici sorgular için yanlış seçimdir — bunlar için RDS kullanın.
- **DocumentDB** (MongoDB uyumlu), **Neptune** (grafik veritabanı) ve **Keyspaces** (Cassandra uyumlu), DynamoDB'nin anahtar-değer modeline uymayan iş yükleri için AWS yönetilen alternatifleridir.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.3)*

- Bölüm anahtarı kurallarını bilin: **yüksek kardinalite, eşit dağılım**. Sıcak bölümler yaygın bir sınav tuzağıdır.
- **Talep üzerine vs tahsis edilmiş**: öngörülemeyen trafik için talep üzerine; öngörülebilir iş yükleri için tahsis edilmiş (Auto Scaling ile).
- **DynamoDB Streams**: öğe düzeyindeki değişiklikleri gerçek zamanlı yakalar. Yaygın sınav senaryosu: "bir kayıt değiştiğinde bir Lambda işlevini tetikle."
- **Global Tables**: küresel olarak dağıtılmış uygulamalar ve felaket kurtarma senaryoları için çoklu Bölge, çoklu aktif çoğaltma. Sınavda, iş yükü birden fazla Bölgede yerel okuma ve yazmalara ihtiyaç duyduğunda bu güçlü bir sinyaldir.
- **DynamoDB TTL (Time to Live)**: öğelere bir son kullanma zaman damgası özelliği ayarlayın, DynamoDB onları süre dolduktan sonra otomatik olarak siler — **ücretsiz**, hiç yazma kapasitesi tüketmeden. Sınav tetikleyicisi: "oturum verisi/geçici öğeler N saat sonra en düşük maliyetle otomatik olarak kaldırılmalı" → TTL, asla zamanlanmış bir Lambda taraması değil. Süresi dolan öğeler arşivleme için DynamoDB Streams'e de akabilir.
- **DAX (DynamoDB Accelerator)**: DynamoDB için bellek içi önbellekleme katmanı. Okuma gecikmesini milisaniyelerden mikrosaniyelere düşürür. Sınav bunu, RDS okuma replikalarının yardımcı olmayacağı durumlarda kullanır (çünkü bu DynamoDB'ye özgü bir önbellektir).
- **Bileşik birincil anahtar**: bölüm anahtarı + sıralama anahtarı, bir bölüm içinde esnek sorgulara izin verir. Örnek: bir müşterinin iki tarih arasındaki tüm siparişlerini getir — `customerId` bölüm anahtarıdır, `orderDate` sıralama anahtarıdır.
- **GSI vs LSI**: GSI tablo oluşturulduktan sonra eklenebilir; LSI eklenemez. LSI güçlü tutarlı okumaları destekler; GSI desteklemez. LSI tablo kapasitesini paylaşır; GSI'nın kendi kapasitesi vardır.
- DynamoDB'yi NE ZAMAN kullanmamanız gerektiğini bilin: karmaşık birleştirmeler, geçici raporlama, çok varlıklı işlemler → genellikle cevap RDS'dir.
- **Özel amaçlı veritabanı seçimi** — sınav sıklıkla bir senaryo sunar ve hangi veritabanının uyduğunu sorar. Bunu hızlı referansınız olarak kullanın: "MongoDB uyumlu" → DocumentDB. "Grafik/sosyal ağ/öneri motoru/bilgi grafiği" → Neptune. "Cassandra uyumlu/geniş sütunlu" → Keyspaces. "Her ölçekte anahtar-değer/milisaniye gecikme" → DynamoDB. "İlişkisel/karmaşık sorgular/raporlama" → RDS veya Aurora.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Bir bölüm anahtarı ile bir sıralama anahtarı arasındaki farkı açıklayın. Her ikisini ne zaman kullanırsınız?

*(İpucu: Nimbus menüsünü düşünün — restaurantId'yi bölüm anahtarı ve itemId'yi sıralama anahtarı yapmak, bir restoranın tam menüsünü getirmeyi neden verimli kılar?)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Küresel bir oyun şirketi oyuncu profillerini DynamoDB'de saklar. Her profil kullanıcı adı, seviye, başarımlar ve envanter gibi alanlar içerir. Bazı oyuncuların 10 envanter öğesi vardır; diğerlerinin birkaç yüz — profiller şekilce değişir ama her biri rahatça DynamoDB'nin 400KB öğe boyutu sınırının altında kalır. Şirket, aktif oyun sırasında profil aramaları için tek haneli milisaniye okuma gecikmesine ihtiyaç duyar.

Bu gereksinimi EN İYİ hangi tasarım yaklaşımı destekler?

A) `playerId`'yi bölüm anahtarı olarak kullanarak DynamoDB kullanın ve tüm profili tek bir öğe olarak saklayın  
B) Her bölgede okuma replikalarıyla RDS Aurora'ya geçin  
C) Benzer beceriye sahip oyuncuları gruplamak için `level`'i bölüm anahtarı olarak kullanarak DynamoDB kullanın  
D) Milisaniye altı gecikme elde etmek için RDS'nin önünde ElastiCache kullanın

**İpucu 1**: Erişim deseni "belirli bir oyuncuyu ID'ye göre arama"dır. Hangi anahtar bunu verimli kılar?

**İpucu 2**: Bir seçenek berbat bir sıcak bölüm yaratır. Hangi özelliğin kardinalitesi çok düşüktür?

**İpucu 3**: DynamoDB zaten yerel olarak tek haneli milisaniye gecikme sunar.

**Cevap**: A

**Açıklama**: `playerId`'yi bölüm anahtarı olarak kullanmak, veriyi bölümler arasında eşit olarak dağıtır ve oyuncu ID'ye göre anında aramaları mümkün kılar — tam olarak tarif edilen erişim deseni. DynamoDB'nin esnek belge modeli, değişen envanter boyutlarını şema değişiklikleri olmadan ele alır.

**Neden B değil?** Okuma replikalarıyla RDS Aurora karmaşıklık ekler ve oyun ölçeğinde bu tür anahtar tabanlı profil araması için yine de doğal ilk tercih değildir.

**Neden C değil?** `level`'i bölüm anahtarı olarak kullanmak ciddi sıcak bölümler yaratır — trafiğin çoğu seviye 1'e (yeni oyuncular) veya maksimum seviyeye (aktif veteranlar) gider, diğer bölümleri boş bırakır.

**Neden D değil?** Soru DynamoDB'yi tanımlıyor, RDS'yi değil. RDS'nin önüne ElastiCache eklemek, DynamoDB tek başına sorunu çözerken iki yeni hizmet getirir.

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama — Görev 3.3*

**Alıştırma 3 — Mimari Mücadelesi** *(İsteğe Bağlı)*

Nimbus bir "favoriler" özelliği ekliyor: müşteriler favori menü öğelerini kaydedebilir ve onları tek dokunuşla yeniden sipariş edebilir.

Bu özellik için DynamoDB tablosunu tasarlayın. Bölüm anahtarı ne olurdu? Bir sıralama anahtarı kullanır mıydınız? Öğe yapısı nasıl görünürdü?

Sonra şunu düşünün: "tüm müşteriler arasında en çok favorilenen 100 öğe"yi göstermeniz gerekirse ne olur? DynamoDB bunu verimli biçimde yanıtlayabilir mi? Yanıtlayamazsa, mimariye ne eklerdiniz?

*(Tek bir doğru cevap yoktur. Amaç, erişim desenlerine göre tasarlamayı uygulamaktır.)*

## Jenerik Sonrası Sahne

"Zaten dağıttım — ah." Leo, menü geçişini perşembe gecesi kimseye söylemeden DynamoDB'ye çalıştırmıştı. İşe yaradı. Okumalar hızlıydı. Şema esnekti. Restoran ortakları istedikleri herhangi bir modifikatör alanını ekleyebiliyordu. Ama izleme panolarını güncellemeyi unutmuştu ve Priya cuma sabahı veritabanı metriklerinin neden düz çizgiye döndüğünü merak ederek yirmi dakika geçirmişti.

Yine de kendini iyi hissediyordu.

Sonra panoları geri yüklenen Priya, metriklere baktı.

"Leo," dedi, "her sayfa yüklemesi kırk yedi DynamoDB isteği yapıyor."

"Gösterilen restoran başına bir tane," diye onayladı Leo. "Gözat sayfası, müşterinin konumuna en yakın kırk yedi restoranı yüklüyor."

"Ve bu isteklerin her biri yaklaşık dört milisaniye sürüyor."

Leo hesabı yaptı. Kırk yedi çarpı dört. "Bu... sadece menü için yüz seksen sekiz milisaniye. Render etmeden önce."

"Her sayfa yüklemesinde."

"Her müşteri için."

Ekrana baktı.

"Bir önbelleğe ihtiyacımız var," dedi.

Sonraki bölümde: Nimbus'un uygulaması ile veritabanı arasındaki, yavaş sorguları hızlı yapan katman.
