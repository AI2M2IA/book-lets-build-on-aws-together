# Bölüm 10: Veritabanı Çok Yavaş Olduğunda

Sayfa yükleme metrikleri ekranda açılmıştı. Leo, on iki dakika boyunca bunları inceliyordu ama hiçbir şey söylemedi.

Sayfa yüklemesi başına 47 DynamoDB isteği. Veriyi elde etmek için sadece 188 milisaniye — tarayıcının tek bir piksel bile çizmeden önce.

Hesaplamıştı. Cuma akşamı yedi bin concurrent kullanıcı: dakikada 470 bin DynamoDB okuması. Maliyet gerçekti. Ama gecikme (latency) gerçek sorun buydu. Nimbus tarayıcı sayfasını açan bir kullanıcı, herhangi bir şeyin görünmeden önce neredeyse iki yüz yirmi milisaniye beklemiş — ve bu hızlı bir bağlantıda.

“Veritabanı, isteğe 4 milisaniyede yanıt veriyor,” dedi Leo. “Aslında bu hızlı. DynamoDB işini yapıyor.”

“O zaman sayfa neden yavaş?” diye sordu Maya.

“Çünkü onu sayfa yüklemesi başına 47 kez çağırıyoruz,” dedi Priya. “Sorun veritabanında değil. Sorun, onu çok fazla sorgulamamızda.”

Tom, bir sorunun maliyetli bir tartışmaya dönüşmesiyle elde ettiği bakışı yaptı. “Yani çözüm, onu daha az sorgulamak mı?”

“Daha az sorgula. Daha fazlasını hatırlat.”

**Restoran Analojisi**

Bir restoranda mutfağı hayal edin. Bir garsonun o günkü özel menüleri hakkında bilgi edinmesi gerektiğinde, arka tarafa yürür, şefi sorar ve tekrar masaya geri yürür.

İki garson ve üç masayla işler yolunda gider.

Şimdi iki yüz garson ve bin masayla. Onlardan hepsi arka tarafa aynı soru için yürürse. Mutfak tıkanıklık noktası haline gelir. Şef aynı soruyu saatte dört yüz yirmi kez yanıtlar.

Açık çözüm: özel menüleri restoranın önündeki tahtaya yazmak. Her garson tahtadan okur. Mutfak bir mola alır. Menüler değiştiğinde tahta güncellenir.

Bu tahta bir önbellektir (cache).

Bir önbellek, sık sık erişilen verilerin hızlı, yerel bir depolama alanıdır. Aynı şeyi yavaş bir kaynaktan tekrar tekrar almak yerine, bir kez alıp yakına saklarsınız.

**Neden Sadece Belleği Kullanmayalım?**

“Menüyü uygulamadaki belleğe sadece saklayamaz mıyız?” diye sordu Leo.

Geçerli bir soru.

Yapabilirsin. Tek bir sunucu uygulaması için, bellek önbelleği işe yarar. Ancak Nimbus, bir yük dengeleyici arkasında, birden fazla EC2 örneği üzerinden çalışır. Bir örnek menüyü belleğinde önbelleğe alırsa, diğer örnekler bu veriye sahip olmaz. Her biri ayrı ayrı önbellekler tutar. Menü güncellendiğinde, hepsini geçersiz kılmanız gerekir.

Bu, *önbellek tutarlılık problemi* — birden fazla önbelleğin tutarlı kalmasını sağlamaktır.

ElastiCache, tüm örneklerinizin paylaştığı merkezi bir önbellek sağlayarak bu sorunu çözer. Her sunucu, kendi belleğini kullanmak yerine aynı önbelleğe okur ve yazar. Bir güncelleme tümüne yayılır.

**Meet ElastiCache**

Amazon ElastiCache, popüler önbellekleme motorlarını — Redis ve Memcached — yönetme zahmetine girmeden sağlayan yönetilen bir önbellekleme hizmetidir.

**Redis**, ikisinden daha güçlü olanıdır. Karmaşık veri yapılarını (string'ler, listeler, kümeler, hash'ler, sıralı kümeler), tutarlılık (veri yeniden başlatmalarda dayanıklılık), çoğaltma ve pub/sub mesajlaşmasını destekler. Redis, önbellekleme kadar çok şey yapabilir — hafif bir veri deposu olarak da işlev görebilir.

**Memcached**, daha basittir. Temiz anahtar-değer önbelleklemesi, yatay olarak ölçeklenebilir, tutarlılık sağlamaz. Basit kullanım durumları için daha hızlıdır ancak daha az özelliğe sahiptir.

Nimbus için: Redis. Menü verilerini (yapılandırılmış), oturum token'larını (anahtar-değer), daha sonra "trend restoran" sıralamaları için sıralı kümeleri saklamaları gerekiyordu.

**Önbelleğin Nasıl Çalıştığı Uygulamada**

Temel önbellekleme deseni, "cache-aside" (veya "lazy loading") olarak adlandırılır:

1. Uygulama veriye ihtiyaç duyar
2. Önbelleği kontrol eder
3. Eğer bulunursa (*cache hit*): veriyi hemen döndürür
4. Eğer bulunamaz (*cache miss*): veritabanına gider, veriyi alır, önbelleğe kaydeder ve döndürür

Pseudocode'da:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

İlk istek her zaman veritabanına ulaşır. Her sonraki istek önbelleğe ulaşır. Bir önbellekle, Nimbus’un sayfa yükündeki 47 adet DynamoDB okuması bir veya iki önbellek aramasına dönüşür. Hızlı, ucuz ve ölçeklenebilir.

**TTL: Ne Kadar Süre Hatırlarsın?**

Her önbellek girdisine bir **Yaşam Süresi (TTL)** vardır: girdinin ne kadar süre sonra geçersiz hale geldiği ve bir sonraki istek veritabanına taze veriler için geri döndüğü süre.

Bu, önbelleklemede temel gerilimdir: tazelik ile performans.

- **Kısa TTL (saniye)**: Çok taze veriler, ancak çok sayıda önbellek tutarsızlığı. Önbellek pek yardımcı olmaz.
- **Uzun TTL (saat veya günler)**: Çok hızlı, ancak veriler eski olabilir. Müşteri dün akşamki menüyü görür.

Menü verileri için beş dakika makuldir. Menü her saniyede değişmez. Bir restoran menüsünü güncellediğinde müşteriler, menünün eski sürümünü kadar beş dakika boyunca görebilirler — kabul edilebilir.

Oturum belirteçleri (bu kullanıcı giriş yaptı mı?), daha kısa bir TTL daha mantıklı olur veya oturum değiştiğinde önbellek hemen güncellenir.

Finansal veriler (sipariş tutarları, ödeme kayıtları), önbelleğe alınmamalıdır — veya önbelleğe alınırsa, yazma üzerine hemen geçersiz kılınmalıdır.

“Sadece iki zor problem var bilgisayar biliminde,” dedi Leo, deneyimli bir şekilde söylediği gibi ustalıkla bir alıntı yaptı. “Önbellek geçersiz kılma ve şeyleri adlandırma.”

“Önbellek geçersiz kılma neden zor?” diye sordu Maya.

“Çünkü veri ne zaman gerçekten değişir? Menü bir restoran ortağı tarafından güncellendi mi? Yoksa bir cron işi mi çalıştı? Yoksa bir yönetici manuel olarak düzenledi mi? Veriyi değiştirebilecek her yer, önbelleğe bilgi vermeli.”

Bu nedenle, önbellekleme sohbeti, “yazma yolları nelerdir?” sorusuyla başlar, “Redis eklesek yeterli olur mu?” gibi bir soruyla değil.

**Önbellek Çıkarımı: Tahta Dolunca**

Özel panoların sınırlı bir alanı vardır. Dolunca, yer açmak için bir şeyi silmeniz gerekir.

Redis (ve önbelleklerin genel olarak) *çıkarma politikaları* vardır, bunlar bellek dolduğunda neyin kaldırılacağını belirler:

- **LRU (En Son Kullanılmayan)**: En uzun süre kullanılmayan öğeler kaldırılır.
- **LFU (En Sık Kullanılan)**: En az sıklıkla kullanılan öğeler kaldırılır.
- **allkeys-random**: Rastgele çıkarma. Basit, optimal değil.
- **noeviction**: Bellek dolduğunda bir hata döndürür (uygulama bu şekilde işlem görmelidir).

Çoğu web uygulaması için: LRU. Son zamanlarda bakmadığınız şeyler muhtemelen daha az ihtiyaç duyulur.

**ElastiCache for Redis: Yönetilen Bir Şey Alırsınız**

RDS gibi, ElastiCache açık kaynaklı bir aracı yönetilen iş yüküyle birlikte getirir:

- **Otomatik yedeklemeler**: Redis anlık görüntüleri düzenli aralıklarla
- **Çoklu-Bölge (AZ) replikasyonu**: Birincil düğüm + farklı AZ'lerde okuma replikaları
- **Otomatik geçiş**: Birincil Redis düğümü başarısız olursa, bir replika otomatik olarak yükseltilir
- **Küme modu**: Çok büyük önbellekler için birden çok düğümde yatay bölümleme
- **Şifreleme**: Uyumluluk için taşıma ve dinlenme sırasında şifreleme
- **VPC entegrasyonu**: Önbellek, halka açık olarak erişilemeyen özel ağınızda çalışır

Tom özellik listesini inceledi. “Ne kadar maliyet?” diye sordu.

“DynamoDB okumalarımızı değiştirdiğimiz kadar az,” dedi Leo. “Ben sayımları yaptım.”

Tom’un şüpheci ifadesi ilgiye dönüştü. Bu bir ilerleme idi.

## Güçlü Yönler ve Sınırlamalar

**Neden önbellekleme güçlüdür:**

- Veritabanı yükünü önemli ölçüde azaltır (daha az sorgu, daha düşük maliyetler)
- Önbellek tutması için milisaniyeler süren yanıt süreleri
- Veritabanınızı trafik zirvelerinden korur
- Redis, basit bir anahtar-değer deposu olmaktan daha zengin veri yapılarını destekler

**Nerede önbellekleme karmaşık hale gelir:**

- Önbellek geçersiz kılma gerçekten zor — bozuk veriler hatalara neden olur
- İşletim karmaşıklığını artırır (gözden geçirmeniz gereken başka bir hizmet, başka bir arıza noktası)
- Soğuk başlangıç sorunu: Yeni dağıtırsanız önbellek boş — veritabanı tam yükü alır
- Önbellek orucu: Birçok giriş aynı anda geçersiz hale geldiğinde, tüm istekler veritabanına aynı anda ulaşır
- ElastiCache düğümleri ücretsiz değildir — boşta olduklarında bile ödenir

**ElastiCache vs DynamoDB DAX**:

DynamoDB verilerini önbelleğe aldığınızda, AWS **DAX (DynamoDB Accelerator)** adlı özel bir önbelleği sunar — DynamoDB için tasarlanmış bir önbellektir. DAX, aynı API'yi kullanarak önbelleklemenizi sağlar, DynamoDB okuma gecikmesini mikro saniyeye indirir ve önbellek geçersiz kılmayı otomatik olarak ele alır.

Bottleneck'unuz DynamoDB okumalarıysa DAX'i kullanın. Genel amaçlı bir önbelleğe ihtiyacınız varsa ElastiCache'i kullanın.

## Özet

- Bir önbellek, son olarak alınmış verilerin hızlı bir depolama alanıdır — bir kez sorarsınız, cevabı hatırlarsınız.
- ElastiCache, Redis ve Memcached’i destekleyen AWS’nin yönetilen önbellek hizmetidir.
- **Redis**, daha karmaşık veri yapıları, tutarlılık, yayın/abone özelliği gibi daha zengindir. **Memcached**, daha basittir (saf anahtar-değer, yatay olarak ölçeklenebilir).
- **Yanıt önbelleği** (gecikmeli yükleme) deseni: önbelleği kontrol edin, eşleşme durumunda veritabanına geri dönün.
- **TTL** (geçerlilik süresi), verilerin önbellekte ne kadar süreyle kalacağını kontrol eder. Kısa TTL = taze, çok sayıda eşleşme. Uzun TTL = hızlı, potansiyel olarak eski.
- Önbellek güncellemeleri zorludur. Bir önbelleğe eklemeden önce tüm yazma yollarını bilin.
- ElastiCache, replikasyon, arıza toleransı, yedekleme ve şifreleme işlemlerini yönetir — önbellek tasarımına odaklanırsınız.
- **DAX**, DynamoDB’e özel önbellektir. ElastiCache genel amaçlıdır.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimari Tasarımı (Alan 3, Görev 3.3)*

- **Redis vs Memcached sınavında**: Redis = tutarlılık, replikasyon, karmaşık yapılar, yayın/abone. Memcached = basit anahtar-değer, saf yatay ölçekleme. "Verilerinizi kaybetmemeniz gerekiyor" ifadesi yerleştirildiğinde, cevap Redis’tir (diske yazılır).
- **ElastiCache kullanım senaryoları**: "Veritabanı bir darboğazdır", "okuma yoğun bir iş yüküdür", "gecikmeyi azaltır", "oturum depolama" — hepsi ElastiCache’i gösterir.
- **DAX işareti**: "DynamoDB okuma gecikmesini azaltın" veya "DynamoDB okumaları çok yavaştır" → DAX, ElastiCache değildir.
- **Oturum yönetimi**: Kullanıcı oturum verilerini depolamak için ElastiCache Redis, kanonik cevaptır. Durumsuz uygulama + Redis oturum depolama = tutarlı oturumlarla yatay ölçekleme.
- **Yaz-geçir vs yanıt önbelleği**: Yanıt önbelleği (gecikmeli yükleme) en yaygın cevaptır. Yaz-geçir, her yazma işleminde önbelleği günceller — asla eski değildir, ancak daha fazla yazma işlemi vardır. Sınavda bunları ayırt edebilir.
- **Önbellek boşaltma politikaları**: LRU (en son kullanılan) en yaygın sınav cevabıdır genel web iş yükleri için.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Kendi kelimelerinizde: Önbellek güncellemeleri nedir ve neden bu kadar zordur?

*(İpucu: Nimbus’daki menü verilerinin güncellenebileceği tüm yerleri düşünün — restoran ortağı portalı, bir yönetici aracı, bir cron işi. Her biri önbelleği bilmelidir.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Milyonlarca kullanıcıya hizmet veren bir video akışı platformu, mevcut film kataloğunun nadiren değiştiği (her gece güncellenir). Uygulama, katalog verilerini her kullanıcı isteğiyle sorguladığından, CPU kullanımı nedeniyle yoğunlaşmaktadır. Takım, katalog verilerinin güncellemelerden bir saat içinde doğru kalmasını sağlayarak gecikmeyi azaltmayı amaçlamaktadır.

Bu gereksinimleri en iyi karşılayan çözüm nedir?

A) RDS veritabanının yükü dağıtmak için okuma replikalarını ekleyin.
B) Katalogu, on-demand kapasiteyle DynamoDB’e taşıyın.
C) Katalog verilerini 1 saatlik bir TTL ile ElastiCache için Redis kullanarak kullanın.
D) Daha fazla eş zamanlı sorguyu işlemek için RDS örneğinin boyutunu artırın.

**İpucu 1**: Veri okuma yoğun ve nadiren değişiyor. Bu için hangi desen idealdir?

**İpucu 2**: "Bir saat içinde doğru kalmak" doğrudan bir önbellek parametresine çevrilir.

**İpucu 3**: Amaç, yükü sadece daha fazla işlemek değil, azaltmaktır.

**Cevap**: C

**Açıklama**: Katalog verileri, anahtarı ilk isteği her zaman bir anahtar için ElastiCache ile eşleştiğinde, bir saatlik TTL ile önbelleğe alınır. Günlük güncelleme çalıştığında, kayıtlar bir saat içinde geçersiz hale gelir ve taze veriler bir sonraki istekle yüklenir.

**Neden A?** Okuma replikaları, daha fazla veritabanı düğümüne dağıtılan okuma trafiğini dağıtır, ancak toplam sorgu sayısını azaltmaz. Okuma yükünü çözmek yerine, sık sık yinelenen sorgular için ideal değildir.

**Neden B?** Katalogu DynamoDB’e taşımak temel sorunu çözmez — katalog verileri yine DynamoDB (DynamoDB) üzerinden kullanıcı isteğiyle alınacaktır.

**Neden D?** Örneği ölçeklendirmek daha fazla eş zamanlı sorguyu işler, ancak sorgu sayısını azaltmaz. Temel verimsizlik kalır.

*SAA-C03 Alanı: Yüksek Performanslı Mimari Tasarımı — Görev 3.3*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, "trend restoranlar" özelliği eklemeyi istiyor: son 24 saatte sipariş hacmine göre en iyi 10 restoranın sıralı listesi, her 15 dakikada bir güncellenir.

ElastiCache Redis ile bunu nasıl uygularsınız? Sıralama için hangi Redis veri yapısını kullanırsınız? Önbellek TTL'niz ne olurdu ve önbellek ne zaman güncellenirdi?

Ayrıca, ElastiCache düğmesinin düşmesi durumunda ne olur? Özellik bozulur mu? Başarısızlık durumunu nasıl tasarlarsınız?

*(Tek bir doğru cevap yoktur. Amaç, önbellek tasarımı ve başarısızlık düşünme pratiğidir.)*

## Krediler Sonrası Sahne

Leo, menüyü önbelleğe aldı. Sayfa yükleme süresi 188 milisaniyeden 12 milisaniyeye düştü.

Otuz yedi DynamoDB çağrısı, 0,8 milisaniyeli bir Redis aramasına dönüştü.

Bu, Pazartesi standup'ında duyuruldu.

"İyi iş," dedi Priya, laptop'undan bakmadan.

"Good work," dedi Priya, laptop'undan bakmadan.

"Good work," dedi Priya, laptop'undan bakmadan.

"Teşekkürler," dedi Leo.

"Son olarak Redis kimlik doğrulama token'ını ne zaman döndürdün?"

Leo notlarına baktı. "Sanmıyorum ki bir tane ayarlamış olayım."

"Yani önbellek yetkisiz erişime açık."

"İçinde VPC içinde."

"Ve diğer her şey de aynı şekilde tehlike altında." Sonunda başını kaldırdı. "Eğer Leo'nun dizüstü bilgisayarı enfekte olursa ve biri VPC'ye geçiş yaparsa, önbelleğin bir parolası yok."

Leo'nun ona baktığını gördü.

"Kimlik doğrulama token'ını ayarlayacağım," dedi.

Bir sonraki bölümde: Nimbus'un sahip olduğu şeyleri internetin geri kalanından ayıran özel ağ.
