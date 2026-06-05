# Bölüm 9: Masa Çok Büyüdüğinde

Menü tablosu 50.000 öğeye sahipti.

Bu, her biri günlük özel menüler, mevsimlik ürünler ve bölgesel varyasyonlara sahip 287 restorana yayılıyordu. Bazı öğeler modifikatörlere sahipti – boyut, baharat seviyesi, protein seçimi. Bazıları diğer öğelerle referanslanan kombinasyon anlaşmaları içeriyordu. Bazıları sadece hafta içi günlerinde, sadece öğle yemeğinde veya belirli şehirlerde görünebiliyordu.

Restoranın tam menüsünü geri getiren SQL sorgusu daha önce 200 milisaniyede yanıt veriyordu.

Şimdi ise dört saniye sürüyordu.

Dört saniye, birinin sipariş vermesi ve birinin uygulamayı kapatması arasındaki farktır. Leo sorgu planını incelemişti. Tom indeks yapılandırmasını incelemişti. Priya okuma replika sayısını artırmıştı. Hiçbir şey anlamlı bir fark yaratmamıştı.

Ve bu, odadaki havayı değiştirdi.

Bir sorun indeksleme, önbellekleme denemeleri ve bir ek replikadan sonra hayatta kaldığında, insanların çözümün akıllı olacağını varsayması durur.

Bazen çözüm, sistemin şeklin yanlış olmasıdır.

"Sorun," dedi Leo, "verinin şekli. SQL her şeyi satır ve sütunlarda istiyor. Menülerimizin sabit bir şekli yok."

Bu, daha uzun bir sohbete yol açtı.

**Tabloda Her Şeye Uyum Sağlama Sorunu**

İlişkisel veritabanlarının temel gerilimi, *yapılandırılmış* verileri *sabit* şekillerde depolamak üzere tasarlanmış olmalarıdır.

Her menü öğesinin aynı alanlara sahip olması — ad, fiyat, açıklama, kategori — SQL mükemmel olurdu. Temiz bir `menu_items` tablosu, her öğe için satırlar ve anlamlı sorgular içeren bir tablo olurdu.

Ama gerçek menüler böyle çalışmaz.

Bir öğe "baharat seviyesi" modifikatörüne sahip olabilir. Başka bir öğe "protein seçimi" olabilir. Üçüncüsü ise "aile yemeğini sipariş edin ve iki ana yemek, iki yan yemek ve bir içecek alırsınız" gibi iç içe geçmiş kombinasyonlara sahip olabilir. Verinin yapısı öğeye göre değişir.

SQL'de iki seçeneğiniz vardır:

**Seçenek 1**: Her olası modifikatör için bir sütun oluşturun. Bu, çoğu zaman boş olan çok geniş bir tablo üretir.

**Seçenek 2**: Modifikatörleri ayrı bir tabloya oluşturun ve onu menü öğeleri tablosuna birleştirin. Bu işe yarar, ancak karmaşık menüler birden çok birleştirme gerektirir ve 50.000 öğe ve yüksek okuma hacmi ile bu birleştirmeler pahalı hale gelir.

"Üçüncü bir seçenek var," dedi Priya, sessizce köşedeki bir dolapta belgeleri okuyan.

Yeni bir sekme açtı. "Verinin bir tabloda sığması gerekmiyor mu?"

**Veriyi Farklı Bir Şekilde Düşünmek**

İlişkisel veritabanları, verileri tabloların satırlarında depolar. Her satır, tablonun şemasına uymalıdır. Şema önceden belirlenir.

NoSQL veritabanları verileri farklı şekilde depolar. Yaygın bir yaklaşım *belge modeli*dir: her kayıt, genellikle JSON formatında kendi kendini içeren bir belge olarak saklanır ve aynı koleksiyondaki belgeler aynı alanlara sahip olmak zorunda değildir.

Bir belge modelinde bir menü öğesi şöyle görünebilir:

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

Farklı Şekiller. Aynı Koleksiyon. Sorun Yok.

"Yani, veritabanı bir dosya sistemi gibi, bir tablo gibi değil," dedi Maya.

"Tamamdır," dedi Priya. "Her belgeyi herhangi bir dolaba koyabilirsin. Belgeyi sabit bir boyuta uyması için kesmen gerekmiyor."

**DynamoDB'yi Tanışın**

Amazon DynamoDB, AWS'nin yönetilen NoSQL veritabanı hizmetidir. Verileri öğeler (satırlar değil) olarak saklar ve öğeler tablolar halinde toplanır (isimleme SQL'deki gibidir, ancak davranışı farklıdır).

Her DynamoDB tablosundaki her öğe, benzersiz olarak tanımlayan bir **anahtar-değer anahtarı** olmalıdır. Diğer her şey esnektir.

Anahtar-değer anahtarı iki biçimde olabilir:

**Sadece Bölüm Anahtarı:** Tüm öğeler için benzersiz olan tek bir özelliktir.

**Bölüm Anahtı + Sıralama Anahtarı (Karmaşık Anahtar-Değer Anahtarı):** İki özelliktir *birlikte* benzersiz bir kombinasyonu oluşturur. Aynı bölüm anahtarına sahip birden çok öğe, sıralama anahtarlarıyla farklılaştırılabilir. Bu, belirli bir restorandan tüm öğeleri verimli bir şekilde almanızı sağlar - DynamoDB tam olarak hangi bölümü aramanız gerektiğini bilir.

Nimbus menüsü için:

- Bölüm Anahtarı: `restaurantId`
- Sıralama Anahtarı: `itemId`

Bu, belirli bir restorandan tüm öğeleri verimli bir şekilde almanızı sağlar - DynamoDB tam olarak hangi bölümü aramanız gerektiğini bilir.

"Bölüm anahtarı neden bu şekilde adlandırılıyor?" Tom sordu.

**DynamoDB Verileri İçinde Nasıl Saklanır**

DynamoDB, muazzam boyutlara ölçeklemek için yatay olarak inşa edilmiştir. Bunu *bölümleme* yoluyla gerçekleştirir - bölüm anahtısına göre birçok fiziksel makineye veri bölünür.

Bir öğe yazıldığında, DynamoDB bölüm anahtarı değerini hash'ler ve o hash'i öğenin hangi fiziksel bölümü (ve dolayısıyla hangi sunucu) tarafından depolandığını belirlemek için kullanır. Bir öğe okunduğunda, DynamoDB aynı hesaplamayı yapar ve onu anında bulur.

Posta sistemi gibi düşünün. Her mektupta bir posta kodu varsa, posta servisi mektubu ait olduğu yere göre okumak yerine posta koduna göre sıralar. DynamoDB, bölüm anahtısı hash'ine göre sıralar.

Bu nedenle iyi bir bölüm anahtası seçmek önemlidir:

- İyi: Yüksek kardinalite, eşit olarak dağıtılmış değerler (`restaurantId` ile çok sayıda restoran)
- Kötü: Düşük kardinalite (`doğru/yanlış`, `kategori`) - çoğu veri birkaç bölüme düşer, bu da "sıcak noktalar" oluşturur.

Bir sıcak nokta, bir bölümün en çok trafiği alması anlamına gelir. Bu bölüm tıkanıklık yaratır. DynamoDB istekleri yavaşlatır. Kullanıcılar hatalarla karşılaşır.

"Eğer `available: true`'yi bölüm anahtarı olarak kullansaydım," dedi Leo yavaşça, "tüm mevcut öğeler aynı bölüme toplanırdı"

"Ve veritabanınız akşam yoğunluğunda eriyecekti," diye doğruladı Priya.

Leo yavaşça laptop'unu kapattı.

**Yüksek Ölçekte Okuma ve Yazma**

DynamoDB, saniyede milyonlarca isteği işleyebilir. Ancak kapasiteyi nasıl tahsis edeceğini bilmesi gerekir.

İki kapasite modu vardır:

**Tahmin Edilebilir Kapasite:** İstediğiniz okuma ve yazma birimlerinin sayısını belirtirsiniz. DynamoDB bu kapasiteyi ayırır ve sizden daha fazla olduğunda trafiği yavaşlatır. Tahmin edilebilir maliyet, daha düşük istek başına fiyat.

**Talep Üzerinde Kapasite:** DynamoDB, gerçek trafiğinize göre otomatik olarak ölçeklenir. Düzenli kapasite planlama gerekmez. Daha yüksek istek başına maliyet ve daha basit operasyonel olarak, özellikle tablonun yakın zamanda sahip olduğu trafik desenlerinden çok daha hızlı bir şekilde artan ani zirveler, hızla yavaşlatılabilirler.

Nimbus menüsü, yazma işlemleri yerine okunur çok daha sık. Bir müşteri uygulamayı açar, menüyü inceler - bu çok sayıda okuma anlamına gelir. Bir restoran ortağı menüsünü haftada iki kez günceller - bu nadiren yazma anlamına gelir.

"Talep üzerinde şu anda mantıklı," dedi Tom. "Trafik desenlerimizi henüz bilmiyoruz. İstek başına daha fazla ödeme yapmak, tıkanıklığa neden olmak ve yavaşlatılmaktan daha iyidir."

İtirazkâr Altyapı Bilgisi. Tom'dan. Takım resmi olarak büyümüştü.

**Tutarlılık: Verileriniz Ne Kadar Taze?**

DynamoDB, verileri otomatik olarak birden çok kullanılabilir bölgeye çoğaltır. Bu, dayanıklılık için harika olsa da, aynı zamanda okuma tutarlılığı konusunda düşünmeniz gerektiğini de gösterir.

DynamoDB'den okuduğunuzda, aşağıdaki seçenekleri seçebilirsiniz:

**Sonradan Ulaşım Tutarlılığı Okuma:** Bu varsayılandır. Daha ucuzdur ve son yapılan yazıyla kısa bir süre gecikmeli bir sonuç olabilir.

**Güçlü Tutarlılık Okuma:** Bir tabloya veya yerel bir ikincil indekse okuduğunuzda, DynamoDB başarılı önceki yazılardan en son taahhüt edilmiş değeri döndürebilir. Bu daha yüksek okuma kapasitesi maliyetlidir ve küresel ikincil indekslere mevcut değildir.

Menü verileri için sonradan ulaşım tutarlılığı yeterlidir. Bir menü öğesinin bir mil saniye güncel olmaması önemli değildir.

Sipariş onay verileri - "bu sipariş mi yerleştirildi?" - için güçlü tutarlılık istiyorsunuz. Müşterinin siparişin kaydedildiği anda "tekrar deneyin" mesajını görmemelidir.

"Bu, banka hesabınızın uygulamanızda kontrol etmek ile bankaya doğrudan bir arama yapmak arasındaki fark gibidir. Uygulama 30 saniye geride olabilir. Telefon görüşmesi her zaman geçerlidir." dedi Maya.

**Sınırlandırmalar: DynamoDB Ne Yapamaz**

NoSQL, SQL'den kesinlikle daha iyi değildir. Farklı bir iş için farklı bir araçtır.

DynamoDB'nin verdiği tavizler:

**Esnek Sorgular**: SQL'de, herhangi bir sütuna göre filtreleme ve sıralama yapabilirsiniz. DynamoDB'de, yalnızca ana anahtara göre verimli bir şekilde sorgulama mümkündür. Rastgele alanlara göre sorgulama, tablodaki her öğeyi okuyan bir *tarama* (scan) gerektirir ki bu da ölçeklendiğinde pahalı ve yavaştır.

**Birleşimler (Joins)**: DynamoDB birleşimler (joins) yapmaz. İki tablodaki veriye ihtiyacınız varsa, uygulamanızın kodunda iki ayrı okuma yapmanız gerekir.

**Aylık İşlemler (Transactions)**: DynamoDB, aylık işlemler (transactions) destekler, ancak ilişkisel veritabanları, çoklu varlık iş akışları, raporlama yoğun sistemler ve birleşim yoğun tasarımlar için daha doğal bir uyum sağlar.

**Tanıdıklık**: Yıllar boyunca SQL araçları, beceriler ve zihinsel modeller doğrudan aktarılmaz.

DynamoDB'nin Mükemmel Olduğu Alanlar:

- Anahtar-değer ve belge erişim desenleri
- Muazzam ölçek (her boyutta tek basamaklı milisaniyeli gecikme süresi)
- Sunucusuz, altyapı yönetimi yok
- Otomatik ölçekleme, çoklu bölge (AZ) replikasyonu, yedekleme
- Veri hacmi ne olursa olsun performansın tahmin edilebilir olması

"Kural şudur," dedi Maya, "DynamoDB'yi tam olarak veriye nasıl erişeceğinizi bildiğinizde kullanın. Bilmediğinizde SQL'i kullanın."

Priya başını salladı. "Erişim desenlerinizi öncelikle tasarlayın. Ardından, veritabanınızı seçin."

Bu, bir veritabanı sohbetinin üretebileceği en üst düzey şeylerden biridir.

**Ne Zaman Kullanılır**

| Durum                                             | Ulaşmak İçin               |
|-------------------------------------------------------|-------------------------|
| Yapılandırılmış veri, karmaşık sorgular, raporlama     | RDS (PostgreSQL, MySQL) |
| Esnek veri şekilleri, anahtara dayalı erişim, muazzam ölçek | DynamoDB                |
| Yazı yoğun, karmaşık ilişkiler                    | RDS                     |
| Okuma yoğun, tahmin edilebilir erişim desenleri       | DynamoDB                |
| Birleşimlere ve toplamlamalara ihtiyacınız varsa       | RDS                     |
| Milisaniyeli gecikme süresi milyonlarca req/s'de ihtiyacınız varsa | DynamoDB                |
| Çoklu varlıklar arasında aylık işlemler              | RDS (genellikle)           |
| Öngörülemeyen trafik patlamaları                   | DynamoDB on-demand      |

Yanlış cevap her zaman "birini veya diğeri her zaman kullanmak"tır. Nimbus, hem RDS'yi (sipariş geçmişi ve finansal kayıtlar için, yapılandırılmış, ilişkisel, raporlama için) hem de DynamoDB'yi (esnek şema, yüksek okuma hacmi, restoran ID'ye göre erişim için) kullanıyordu.

## Güçlü Yönler ve Sınırlamalar

**Neden DynamoDB Güçlüdür**:

- Her ölçekte tek basamaklı milisaniyeli gecikme süresi
- Tamamen yönetilen — hiçbir bakım, hiçbir replikasyon kurulumu, hiçbir bakım penceresi yok
- Otomatik çoklu bölge (AZ) replikasyonu (dayanıklılık yerleşik)
- On-demand ölçekleme, hiçbir kapasite planlama yok
- Lambda, API Gateway, Akışlar ile yerel entegrasyon
- Nokta-zamanlı kurtarma (RDS'deki otomatik yedeklemeler gibi)
- DynamoDB Akışları — her değişikliği bir olay olarak yakalar (gerçek zamanlı işleme için kullanışlı)

**DynamoDB Nerede Karmaşık Hale Gelir**:

- Erişim desen tasarımı müzakere edilemez — hatalar düzeltmek pahalıdır
- Karmaşık sorgular ikinci indeksler gerektirir (maliyet ve karmaşıklığı artırır)
- Taramalar pahalıdır — üretimde kaçınılmalıdır
- "Öğe boyutu sınırı" 400KB'dır — büyük öğeler farklı depolama gerektirir
- Fiyatlandırma, okuma/yazma birimi maliyetlerini anlamıyorsanız sizi şaşırtabilir

## Özeti

- DynamoDB, AWS'nin yönetilen NoSQL veritabanı hizmetidir.
- Öğeler, sabit şema gerektirmeyen esnek belgeler olarak saklanır.
- Her öğe, bir bölüm anahtarıyla veya bir bölüm anahtarı + sıralama anahtarıyla birlikte bir anahtar-değer anahtarına sahip olmalıdır.
- Bölüm anahtısı, öğenin depolandığı fiziksel bölümü belirler. En iyi dağılım için seçin.
- **On-demand** kapasite otomatik olarak ölçeklenir; **tahminli** kapasite, trafiğiniz tahmin edilebilir olduğunda daha ucuzdur.
- **Sonraki** okumalar daha ucuz ve daha hızlıdır. **Güçlü** okumalar her zaman geçerlidir.
- DynamoDB, anahtara dayalı erişim konusunda muazzam ölçekte mükemmeldir. Ad hoc sorgular ve birleşimler konusunda zorlanır.
- İlişkisel verilere RDS'yi kullanın. Belge/anahtar-değer verileri için DynamoDB'yi kullanın. Durum çağırıyorsa her ikisini de kullanın.

## Sınav İpuçları

*SAA-C03 Alan: Yüksek Performanslı Mimarileri Tasarlamak (Alan 3, Görev 3.3)*

- Bölüm anahtar tanımlarını bilin: **yüksek kardinalite, eşit dağılım**. Sıcak bölümler sıkça sınav tuzaklarıdır.
- **Talep üzerine vs. tahsis edilmiş**: talep üzerine tahmin edilemeyen trafik için; tahsis edilmiş (Otomatik Ölçekleme ile) tahmin edilebilir iş yükleri için.
- **DynamoDB Akışları**: öğe düzeyindeki değişiklikleri gerçek zamanlı olarak yakalar. Yaygın sınav senaryosu: "Bir kayıt değiştiğinde bir Lambda fonksiyonunu tetikle."
- **Global Tablolar**: Çok Bölge, Çok Aktif Yansıma, küresel olarak dağıtılmış uygulamalar ve felaket kurtarma senaryoları için. Sınavlarda, iş yükünün birinden fazla bölgede yerel okuma ve yazma ihtiyaçları olduğunda bu, güçlü bir sinyaldir.
- **DAX (DynamoDB Hızlandırıcı)**: DynamoDB için bellek içi önbellekleme katmanı. Okuma gecikmesini milisaniyelerden mikro saniyeye düşürür. Sınav, RDS replikalarının yardımcı olamayacağı (DynamoDB'ye özgü bir önbellek olduğu için) durumlarda kullanılır.
- **Karmaşık anahtar-değer**: Bölüm anahtarı + sıralama anahtarı, bir bölümdaki esnek sorgular için izin verir. Örnek: iki tarih arasında bir müşterinin tüm siparişlerini alın — `customerId` bölüm anahtarıdır, `orderDate` sıralama anahtarıdır.
- Bölüm anahtarını kullanmayı bilmediğiniz zamanları bilin: karmaşık birleştirmeler, hobi raporlama, çoklu varlık işlemleri → RDS genellikle cevaptır.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Bölüm anahtarı ve sıralama anahtarı arasındaki farkı açıklayın. Her ikisini de ne zaman kullanırsınız?

*(İpucu: Nimbus menüsünü düşünün — restoranId'nin bölüm anahtarı ve itemId'nin sıralama anahtarı olması, bir restoranın menüsünü verimli bir şekilde almak için nasıl etkili olur?)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir oyun şirketi, oyuncu profillerini DynamoDB'de saklar. Her profil, kullanıcı adı, seviye, başarılar ve envanter gibi alanları içerir. Bazı oyuncuların 10 envanter öğesi vardır, diğerlerinin ise 5.000 özel yapılandırması vardır. Şirket, aktif oyun sırasında profil aramaları için tek basamaklı milisaniyelik okuma gecikmesi gerektirir.

Bu gereksinimi en iyi destekleyen tasarım yaklaşımı hangisidir?

A) RDS Aurora'ya okuma replikalarıyla her bölgede geçirin
B) `playerId` bölüm anahtarı ile DynamoDB'de saklayın ve tüm profili tek bir öğe olarak saklayın
C) `level` bölüm anahtarı ile gruplandırın, oyuncuları benzer beceri seviyelerine göre
D) RDS'ye ulaşmak için ElastiCache'i profil önünde kullanın

**İpucu 1**: Erişim deseni "belirli bir oyuncunun ID'sine göre arama"dır. Hangi anahtar bu için verimli olur?

**İpucu 2**: Bir seçenek, kötü bir sıcak bölüm oluşturur. Hangi özellik çok düşük kardinaliteye sahiptir?

**İpucu 3**: DynamoDB zaten tek basamaklı milisaniyelik gecikmeyi yerel olarak sağlar.

**Cevap**: B

**Açıklama**: `playerId`'yi bölüm anahtarı olarak kullanmak, verileri bölümler arasında eşit olarak dağıtır ve oyuncu ID'sine göre anında aramalar sağlar — tarif edilen erişim deseni. DynamoDB'nin esnek belge modeli, envanter boyutlarındaki değişiklikleri şemayı değiştirmeden ele alır.

**Neden A?** RDS Aurora'ya okuma replikaları eklemek karmaşıklığı artırır ve bu tür bir anahtar tabanlı profil araması için ilk seçim değildir.

**Neden C?** `level`'i bölüm anahtarı olarak kullanmak, şiddetli sıcak bölümler oluşturur — çoğu trafik, yeni oyuncuların (Seviye 1) veya en yüksek seviyelerin (aktif veteranlar) yanına gider, diğer bölümler boşta kalır.

**Neden D?** Soruda DynamoDB, değil RDS'dir. ElastiCache'i RDS önünde ek hizmetler olarak eklemek, DynamoDB tek başına sorunu çözdüğü için sorunludur.

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla — Görev 3.3*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, "favori" özelliği ekliyor: müşteriler favori menü öğelerini kaydedebilir ve tek bir dokunuşla yeniden sipariş edebilir.

Bu özellik için DynamoDB tablosunu tasarlayın. Bölüm anahtarı ne olurdu? Sıralama anahtarı kullanır mısınız? Öğenin yapısı nasıl olurdu?

Daha sonra düşünün: "Tüm müşteriler arasında en çok favorilenen 100 öğe"yi göstermek istiyorsanız, DynamoDB bunu verimli bir şekilde yanıtlayabilir mi? Cevabıysa, mimariye ne eklerdi?

*(Tek bir doğru cevap yoktur. Amaç, erişim desenleri için tasarlamayı uygulamaktır.)*

## Kredi Sonrası Sahne

Leo, menüyü haftanın sonuna kadar DynamoDB'ye taşımıştı. Okumalar hızlıydı. Şema esnekti. Restoran ortakları istediği herhangi bir değiştirici alanı ekleyebiliyordu.

Kendini iyi hissetti.

O zaman Priya, izleme panosuna baktı.

"Leo," dedi, "her sayfa yüklemesi 47 DynamoDB isteği yapıyor."

"Bir restoran başına," diye doğruladı Leo. "Çünkü müşteri 'tüm menüyü görüntüle' sayfasında."

"Ve her bir istek yaklaşık 4 milisaniyedir."

Leo hesapladı. 47 kere 4. "Bu... bir yüz yirmi sekste milisaniye sadece menü için. Yüklenirken."

"Her sayfa yüklemesi için."

"Her müşteri için."

O ekrana baktı.

"Bir önbelleğe ihtiyacımız var," dedi.

Sonraki bölüm: Nimbus'un uygulaması ve veritabanı arasındaki katman, yavaş sorguları hızlı hale getiren şeydir.
