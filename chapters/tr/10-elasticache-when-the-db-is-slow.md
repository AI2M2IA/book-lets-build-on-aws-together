# Bölüm 10: Veritabanı Çok Yavaş Olduğunda

Sayfa yükleme metrikleri ekranda açıktı. Leo, hiçbir şey söylemeden yirmi dakika boyunca onlara bakıyordu.

Sayfa yüklemesi başına kırk yedi DynamoDB isteği. Yalnızca veriyi getirmek için yüz seksen sekiz milisaniye — tarayıcı tek bir piksel bile render etmeden önce.

Hesabı yapmıştı. Cuma akşamı on bin eşzamanlı kullanıcı, her biri gözat sayfasını dakikada yaklaşık bir kez yüklüyor: dakikada dört yüz yetmiş bin DynamoDB okuması. Maliyet gerçekti. Ama asıl sorun gecikmeydi. Nimbus gözat sayfasını açan bir kullanıcı, herhangi bir şey görünmeden önce neredeyse iki yüz milisaniye bekliyordu — ve bu hızlı bir bağlantıdaydı.

---

*Bir önceki hafta, DynamoDB şema yeniden tasarımı işe yaramıştı. Menü tablosu artık esnekti — herhangi bir restoran herhangi bir modifikatörü, herhangi bir kombo yapısını, herhangi bir mevsimlik varyasyonu ekleyebiliyordu. Tekil aramalardaki performans mükemmeldi. Ama sayfa başına kırk yedi ile çarpılan mükemmel tekil aramalar, yine de yavaş sayfalara çıkıyordu. DynamoDB sorunu çözülmüştü. Yerini yeni bir sorun almıştı.*

---

"Veritabanı istek başına dört milisaniyede yanıt veriyor," dedi Leo. "Bu aslında hızlı. DynamoDB işini yapıyor."

"O zaman sayfa neden yavaş?" diye sordu Maya.

"Çünkü onu sayfa yüklemesi başına kırk yedi kez çağırıyoruz," dedi Priya. "Sorun veritabanı değil. Sorun onunla çok fazla konuşmamız."

Tom öne eğildi. Bir problem maliyet sohbetine dönüşmek üzereyken takındığı ifadeye sahipti. "Yani çözüm onunla daha az konuşmak mı?"

"Onunla daha az konuş. Daha fazlasını hatırla."

---

**Yanlış İlk Deneme**

Leo'nun ilk içgüdüsü kullanıcı başına veriyi önbelleğe almaktı. Her kullanıcının bir oturumu vardı ve oturum onların profilini yüklüyordu: kayıtlı adresler, ödeme yöntemleri, sipariş geçmişi özeti. Belki bunu önbelleğe almak işleri hızlandırırdı.

Bunu uyguladı. Redis anahtar biçimi: `user:{userId}:profile`. TTL: on dakika.

Yük testini çalıştırdı. Sayfa yüklemesi altı milisaniye düştü.

"Bu pek bir şey değil," diye gözlemledi Tom.

"Değil," dedi Leo.

"Neden değil?"

Leo bir an grafiğe baktı. "Çünkü kullanıcı profili yalnızca bir istek. Hâlâ sayfa başına kırk altı DynamoDB çağrısı var. Ve bunlar menü çağrıları — gözat sayfasındaki restoran başına bir tane. Yanlış şeyi önbelleğe aldım."

Bu, önbelleklemede yaygın bir hatadır: darboğaz olmayan şeyi optimize etmek. Kullanıcı profili iki milisaniyede yükleniyordu. O kadar hızlı bir şeyi önbelleğe almak neredeyse hiçbir şey kazandırmadı. Menü verisi — kırk yedi kez getirilen, her biri dört milisaniye süren — asıl sorundu.

"Kullanıcı başına değil, menü başına önbelleğe almalısın," dedi Priya. "Restoran 047'nin menüsü, ona göz atan her kullanıcı için aynıdır. Önbelleğe almaya değer veri budur — binlerce istekte aynıdır."

Kullanıcı başına önbellekler, kullanıcıların pahalı kişiselleştirilmiş durumu olduğunda değerlidir. Varlık başına önbellekler (menüler, ürün katalogları, yapılandırma), aynı veri binlerce kullanıcıya sunulduğunda değerlidir. Kodu yazmadan önce hangi soruna sahip olduğunuzu bilin.

Leo önbellek anahtarlarını yeniden tasarladı: `menu:{restaurantId}`. Restoran başına bir önbellek girişi, o restorana göz atan her kullanıcı tarafından paylaşılır.

Yük testini tekrar çalıştırdı. Sayfa yüklemesi 188 milisaniyeden 12 milisaniyeye düştü. Aradıkları iyileşme buydu.

---

**Restoran Analojisi**

Bir restoranın mutfağını hayal edin. Bir garson günün spesiyallerini öğrenmesi gerektiğinde her seferinde arkaya yürür, şefe sorar ve masaya geri yürür.

İki garsonunuz ve üç masanız varsa bu gayet iyi çalışır.

Şimdi iki yüz garson ve bin masa hayal edin. Her biri aynı soru için arkaya yürüyor. Mutfak darboğaz haline gelir. Şef aynı soruyu saatte dört yüz kez yanıtlıyor.

Bariz çözüm: spesiyalleri restoranın önündeki bir tahtaya yazmak. Her garson tahtadan okur. Mutfak nefes alır. Spesiyaller değiştiğinde tahta güncellenir.

O tahta bir önbellektir.

Önbellek, yakın zamanda getirilen verinin hızlı, yerel bir deposudur. Aynı şeyi yavaş bir kaynaktan tekrar tekrar getirmek yerine, bir kez getirir ve yakınında tutarsınız.

Mühendislerin yararlı bulduğu başka bir analoji daha var: kütüphanenin ayrılmış kitaplar rafı. Popüler bir kitap iade edildiğinde, kütüphaneci onun yakında tekrar isteneceğini bilir, bu yüzden onu raflara kaldırmak yerine ön masanın yanındaki ayrılmış kitaplar rafına koyar. Sonraki okuyucu tüm kütüphaneyi yürümek zorunda kalmaz — onu tam masada bulur. Ayrılmış kitaplar rafının sınırlı alanı vardır. Dolarsa, daha yenilerine yer açmak için eski kitaplar raflara geri taşınır. Bir önbellek aynı şekilde çalışır: sık erişilen veri önde kalır, seyrek erişilen veri yer açmak için tahliye edilir.

**Neden Sadece Bellek Kullanmıyoruz?**

"Menüyü sadece uygulamanın belleğinde saklayamaz mıyız?" diye sordu Leo.

Geçerli soru.

Saklayabilirsiniz. Tek sunuculu bir uygulama için bellek içi önbellekleme gayet iyi çalışır. Ama Nimbus bir yük dengeleyicinin arkasında, birden çok EC2 örneğinde çalışıyor. Bir örnek menüyü belleğinde önbelleğe alırsa, diğer örneklerde o veri yoktur. Her biri ayrı önbellekler tutar. Menü güncellendiğinde hepsini geçersiz kılmanız gerekir.

Bu, *önbellek tutarlılığı problemidir* — birden çok önbelleği tutarlı tutmak.

ElastiCache bunu, tüm örneklerinizin paylaştığı *merkezi* bir önbellek sağlayarak çözer. Her sunucunun kendi belleğine sahip olması yerine, her sunucu aynı önbellekten okur ve ona yazar. Bir güncelleme hepsine yayılır.

**ElastiCache ile Tanışın**

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya. "Neden tamamen yeni bir hizmet? Neden sadece daha fazla veritabanı kapasitesi eklemiyoruz?"

Güzel soru. Cevap şu: daha fazla veritabanı kapasitesi eklemek — daha büyük örnekler, daha fazla okuma replikası — temel sorunu çözmez. O kırk yedi sayfa yükleme isteğinin her biri, daha hızlı bir veritabanında bile hâlâ zaman ve para maliyeti çıkarır. Önbellek veritabanını daha hızlı yapmaz; veritabanına aynı sorunun çok daha seyrek sorulması demektir. Tekrar tekrar okunan ve seyrek değişen veri için — bir restoranın menüsü gibi — önbellek, veritabanının o soruyu sayfa yüklemesi başına kırk yedi kez yerine her beş dakikada bir kez yanıtlaması demektir.

Amazon ElastiCache, yönetilen bir önbellekleme hizmetidir. Popüler önbellekleme motorlarını — Redis ve Memcached — sunucuları yönetmek zorunda kalmadan çalıştırır.

**Redis**, ikisinden daha güçlü olanıdır. Karmaşık veri yapılarını (string'ler, listeler, kümeler, hash'ler, sıralı kümeler), kalıcılığı (veri yeniden başlatmalardan sağ çıkar), çoğaltmayı ve pub/sub mesajlaşmayı destekler. Redis önbelleklemeden fazlasını yapabilir — hafif bir veri deposu olarak işlev görebilir.

**Memcached**, daha basittir. Saf anahtar-değer önbellekleme, yatay olarak ölçeklenebilir, kalıcılık yok. Basit kullanım durumları için daha hızlı ama daha az özellik.

Nimbus için: Redis. Menü verisini (yapılandırılmış), oturum token'larını (anahtar-değer) önbelleğe almaları ve sonra "trend restoranlar" sıralamaları için sıralı kümeler istemeleri gerekiyordu.

**Önbellekleme Pratikte Nasıl Çalışır**

Temel önbellekleme deseni **cache-aside** olarak adlandırılır (tembel yükleme de denir):

1. Uygulamanın veriye ihtiyacı olur
2. Önce önbelleği kontrol eder
3. Bulunursa (*önbellek isabeti*): veriyi hemen döndürür
4. Bulunmazsa (*önbellek ıskası*): veritabanına gider, veriyi alır, önbelleğe kaydeder, döndürür

Sözde kodda:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # 5 dakika önbelleğe al
return menuData
```

İlk istek her zaman veritabanına çarpar. Sonraki her istek önbelleğe çarpar. Bir önbellekle, Nimbus'un sayfa yüklemesi başına kırk yedi DynamoDB okuması bir veya iki önbellek aramasına dönüşür. Hızlı, ucuz ve ölçeklenebilir.

**TTL: Ne Kadar Süre Hatırlıyorsunuz?**

Her önbellek girişinin bir **Yaşam Süresi (TTL)** vardır: girişin süresinin dolduğu ve bir sonraki isteğin taze veri için veritabanına geri döndüğü süre.

Bu, önbelleklemenin temel gerilimidir: tazelik mi performans mı.

- **Kısa TTL (saniyeler)**: Çok taze veri ama çok sayıda önbellek ıskası. Önbellek pek yardımcı olmaz.
- **Uzun TTL (saatler veya günler)**: Çok hızlı ama veri eskiyebilir. Müşteri dünün menüsünü görür.

Menü verisi için beş dakika makuldür. Menü her saniye değişmez. Bir restoran menüsünü güncellerse, müşteriler eski sürümü beş dakikaya kadar görebilir — kabul edilebilir.

Oturum token'ları için (bu kullanıcı giriş yaptı mı?) daha kısa TTL mantıklıdır ya da oturum değiştiğinde önbelleği hemen güncellersiniz.

Finansal veri için (sipariş tutarları, ödeme kayıtları) onu önbelleğe almayın — ya da alırsanız, yazma anında hemen geçersiz kılın.

Şunu merak ediyor olabilirsiniz: tamamen yeni bir önbellek katmanı tanıtmak yerine neden sadece daha fazla veritabanı kapasitesi eklemiyoruz? Daha fazla replika, daha büyük bir örnek — neden o değil? Cevap şu: ek veritabanı kapasitesi eşzamanlı istekleri işleme yeteneğinizi çoğaltır ama istek sayısını azaltmaz. On bin kullanıcının her biri sayfa yüklemesi başına kırk yedi okuma tetikliyorsa, ikinci bir okuma replikası eklemek sadece her replikanın kırk yedi bin yerine yirmi üç bin istek işlemesi demektir — toplam iş küçülmez. Önbellek gereksiz işi tamamen ortadan kaldırır: o on bin kullanıcı aynı önbelleğe alınmış sonucu paylaşır.

"Bilgisayar biliminde yalnızca iki zor problem vardır," diye alıntı yaptı Leo, daha önce söylemiş birinin tecrübeli edasıyla. "Önbellek geçersizleştirme ve şeyleri adlandırma."

"Önbellek geçersizleştirme neden zor?" diye sordu Maya.

"Çünkü veri *gerçekten* ne zaman değişir? Menü bir restoran ortağı onu güncellediği için mi değişti? Yoksa bir cron işi çalıştığı için mi? Yoksa bir yönetici onu elle düzenlediği için mi? Veriyi değiştirebilen her yer, önbelleğe haber vermeyi bilmek zorunda."

Bu yüzden kıdemli mühendisler bir önbellekleme sohbetine "Redis ekleyelim" yerine "yazma yolları neler?" diye başlar.

---

**Önbellek Geçersizleştirme Hikayesi**

Önbellek geçersizleştirmenin ne kadar zor olduğunu, bir restoran ortağı ilk kez şikayet ettiğinde öğrendiler.

Restoran 112 — Eastside'da bir Kolombiya mekânı — perşembe öğleden sonra fiyatlarını güncellemişti. Arepayı 8 dolardan 9 dolara çıkarmışlardı. Yirmi dakika sonra Nimbus desteğini aradılar.

"Menümüz hâlâ eski fiyatı gösteriyor," dedi sahibi. "Müşteriler 8 dolardan sipariş veriyor. Şimdi o fiyatı kabul etmek zorundayız."

Priya hatayı izlerken Tom kaybı hesapladı. O yirmi dakikada verilen her sipariş 8 dolar ücretlendirmişti. Restoran 9 dolar istemişti. Nimbus farkı üstlenmek zorunda kalacaktı.

Beş dakikalık TTL çoktan dolmuş olmalıydı. Yirmi dakika geçmişti. Priya kodu çekti.

Önbellek anahtarı `menu:restaurant-112` idi. 300 saniyelik bir TTL ile ayarlanmıştı. En son ne zaman yazıldığını kontrol etti.

"14:03'te ayarlanmış," dedi. "Yirmi iki dakika önce."

"Ama TTL beş dakika," dedi Leo.

"TTL, ilk önbelleğe alındığı andan itibaren beş dakika. Ama önbelleğe çarpan her istek TTL'yi yeniliyordu. Önbellek girişi gelen isteklerle her birkaç saniyede bir dokunuluyordu ve TTL sıfırlanıyordu."

"Yani hiç dolmadı."

"Bu uygulamada dolmadı. TTL'yi her önbellek okumasında ayarlıyorduk. Kayan pencere. Giriş, herhangi biri ona çarptığı sürece canlı kaldı."

Düzeltme: yalnızca yazma anında ayarlanan, okumada asla uzatılmayan sabit bir TTL kullanmak. Giriş, kaç kez okunduğundan bağımsız olarak, saklandıktan tam beş dakika sonra dolar. Restoran menüsünü güncellediğinde, eski giriş beş dakika içinde dolar ve bir sonraki istek taze veri getirir.

"Peki bir restoranın fiyatları güncellediği ve bunu hemen yansıtmamız gereken durumlar için?" diye sordu Tom.

"Aktif geçersizleştirme," dedi Priya. "Restoran ortağı portalı bir güncelleme gönderdiğinde, API döndürmeden önce `cache.delete('menu:restaurant-112')` çağırır. Sonraki istek hemen taze veri getirir."

"Ama bu, portalın önbellek hakkında bilgi sahibi olmasını gerektirir."

"Veritabanına giden her yazma yolunun önbellek hakkında bilgi sahibi olması gerekir. Leo'nun daha önce söylediği buydu. Şimdi onu yaşadık."

"Zaten dağıttım — ah." Leo geçersizleştirmeyi portalda uygulamış ama yönetici düzenleme arayüzünü unutmuştu. İki hafta sonra, bir yönetici dahili pano üzerinden bir menü güncellemiş ve eski fiyat beş dakika önbellekte kalmıştı. Aynı olayın daha küçük bir versiyonu.

Bir DynamoDB Streams işleyici eklediler — önceki bölümden — bu, hangi sistemin yazmayı tetiklediğinden bağımsız olarak bir menü öğesi her değiştiğinde önbelleği otomatik olarak geçersiz kılıyordu. Bir işleyici, tüm yazma yolları kapsandı.

---

**Önbellek Tahliyesi: Tahta Dolduğunda**

Spesiyal tahtasının sınırlı alanı vardır. Dolduğunda, yer açmak için bir şeyi silmeniz gerekir.

Redis'in (ve genel olarak önbelleklerin) bellek dolduğunda neyin kaldırılacağını belirleyen *tahliye politikaları* vardır:

- **LRU (En Az Yakın Zamanda Kullanılan)**: En uzun süredir erişilmeyen öğeleri kaldır.
- **LFU (En Az Sık Kullanılan)**: En az sıklıkta erişilen öğeleri kaldır.
- **allkeys-random**: Rastgele tahliye. Basit, optimal değil.
- **noeviction**: Bellek dolduğunda bir hata döndür (uygulama bunu ele almalıdır).

Çoğu web uygulaması için: LRU. Yakın zamanda bakmadığınız şeyler muhtemelen daha az gereklidir.

---

**Önbellek İzdihamı Problemi**

"Tüm önbellek bir anda boşalırsa ne olacağını düşündük mü?" diye sordu Priya.

"Bu ne zaman olur?" dedi Leo.

"Yeni bir ElastiCache kümesi dağıttığınızda. Büyük bir giriş grubundaki TTL aynı anda dolduğunda. Bir hata düzeltmesinden sonra yenilemeyi zorlamak için önbelleği temizlediğinizde."

Leo bunu düşündü. "Önbellek boşsa, her istek veritabanına gider. Hepsi bir anda. Birkaç saniye boyunca veritabanı her eşzamanlı kullanıcının tam yükünü işler."

"Önünde önbellek olmadan."

"Bu canımızı yakardı." Leo veritabanı kapasite ayarlarına baktı. "Kesinlikle kısıtlanırdık."

Buna **önbellek izdihamı** denir (gürleyen sürü de denir). Birçok önbellek girişi aynı anda dolduğunda olur — çoğu zaman hepsi bir dağıtım veya soğuk başlangıç sırasında aynı anda oluşturulduğu için — ve önbellek ıskalarının ani dalgası veritabanına aynı anda çarptığında.

Hafifletme stratejileri:

**TTL'de jitter**: Her menü girişini tam 300 saniyeye ayarlamak yerine, rastgele varyasyon ekleyin: 270 ila 330 saniye. Girişler hafifçe farklı zamanlarda dolar, önbellek ıskası dalgasını aynı anda çarpmak yerine bir dakikaya yayar.

**Olasılıksal erken sona erme**: Bir giriş dolmadan önce, isteklerin küçük bir yüzdesi onu proaktif olarak yeniler. Bu, girişleri eskimeden önce taze tutar ve sona ermenin hiç bir ıskaya dönüşmesini önler.

**İstek birleştirme (mutex/kilit)**: Bir önbellek ıskası oluştuğunda, veritabanına çarpmadan önce bir kilit alın. Aynı anahtar için diğer eşzamanlı istekler, ilk isteğin tamamlanmasını ve önbelleği yeniden doldurmasını bekler, sonra önbellekten okur. Yüksek eşzamanlılıkta bile önbellek ıskası başına yalnızca bir veritabanı isteği yapılır.

Nimbus için TTL jitter uyguladılar. Basit, etkili, ek karmaşıklık yok.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"İki satır kod," dedi Leo. "Dağıtımlar sırasında potansiyel bir veritabanı kesintisini önlemek için."

"Çoğu güvenilirlik iyileştirmesi böyledir," dedi Priya. "Uygulaması ucuz, onlara ihtiyacın olduğunu öğrenmesi pahalı."

---

**Redis Veri Yapıları: Anahtar-Değerden Fazlası**

Nimbus "trend restoranlar" özelliğini eklediğinde, Leo başlangıçta sıralamayı düz bir JSON listesi olarak sakladı: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

İşe yaradı ama güncellemek zahmetliydi. Yeni bir restoran eklemek veya bir puanı güncellemek için tüm listeyi okumak, onu uygulama kodunda değiştirmek ve hepsini geri yazmak zorundaydı. Analitik hattından gelen eşzamanlı yazmalar altında, yarış koşulları puanların üzerine yazılmasına neden oldu.

Priya onu Redis sıralı kümelerine yönlendirdi.

Redis'teki bir **sıralı küme**, üyeleri ilişkili sayısal puanlarla saklar. Üyeler puana göre otomatik olarak sıralanır. İşlemler atomiktir — eşzamanlı güncellemelerden yarış koşulu yok.

```
# Bir restoranın puanını ekle/güncelle
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Puana göre en iyi 10 restoranı al (en yüksek önce)
ZREVRANGE trending:global 0 9 WITHSCORES

# Bir restoranın puanını atomik olarak artır
ZINCRBY trending:global 50 "NIMBUS-047"
```

Analitik Lambda, bir sipariş her verildiğinde `ZINCRBY` çağırarak restoranın puanını artırdı. Ana sayfa, en iyi onu almak için `ZREVRANGE` çağırdı. Kilit yok, yarış koşulu yok, oku-değiştir-yaz döngüsü yok.

Redis, basit anahtar-değerin ötesinde başka birkaç veri yapısını destekler:

**Listeler**: Sıralı diziler. Öne veya arkaya it. Kuyruklar, son etkinlik akışları, günlük akışları için kullanın.

**Kümeler**: Yinelenenler olmadan sırasız koleksiyonlar. Birleşim, kesişim, fark işlemleri. "Hangi kullanıcılar bu bildirimi gördü?" veya "bu kategoride hangi restoranlar var?" için kullanın.

**Hash'ler**: Bir anahtar içindeki adlandırılmış alanlar. Tüm nesneyi yeniden yazmadan tek tek alanları güncellemek istediğiniz yapılandırılmış nesneler için kullanın.

**HyperLogLog**: Olasılıksal kardinalite tahmini. Her ziyaretçi ID'sini saklamadan bir sayfaya gelen benzersiz ziyaretçileri sayın. Kompakt ve hızlı.

**Pub/Sub**: Kanallara mesaj yayınlayın; aboneler onları gerçek zamanlı alır. Hizmetler arasında hafif gerçek zamanlı bildirimler için kullanın.

"Redis sadece bir önbellek değil," dedi Leo. "Bir veri yapısı sunucusu."

"Onun resmi açıklaması bu," dedi Priya.

"Sadece süslü bir sözlük sanıyordum."

"Öyle başladı."

---

**Write-Through: Diğer Önbellekleme Deseni**

Cache-aside (tembel yükleme) en yaygın desendir. Ama bilmeye değer ikinci bir tane var: **write-through**.

Write-through önbelleklemede, uygulamanız veritabanına her yazdığında, aynı zamanda önbelleğe de hemen yazar.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

Avantajı: önbellek her zaman günceldir. Bir yazma ile TTL sona ermesi arasında eski veri yoktur.

Dezavantajı: her yazma iki yere gider. Ve önbelleği asla okunmayabilecek veriyle doldurursunuz. On restoran menülerini günceller ama yalnızca ikisi sonraki beş dakikada önemli trafik alırsa, dolmadan önce kullanılmayacak sekiz önbellek için write-through işi yapmış olursunuz.

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya. "Her güncellemede önbelleğe yazarsak, öncekinden daha fazla iş yapıyoruz. Bu nasıl daha iyi?"

"Her zaman daha iyi değil," dedi Priya. "Write-through, bir yazmadan sonra hiçbir eski veri penceresine tolerans gösteremediğinizde mantıklıdır. Cache-aside, her yazmada fazladan iş yapmamak karşılığında bir TTL'ye kadar eskimeyi kabul eder."

Nimbus için: cache-aside doğru seçimdi. Menüler yazıldığından çok daha sık okunuyordu. Beş dakikalık eski pencere kabul edilebilirdi. Her fiyat güncellemesinin hemen yansıtılması gereken bir finansal ticaret sistemi için write-through daha uygun olurdu.

Karar iki soruya iner: yazma-okuma oranınız nedir ve bir yazmadan sonra eski okumalara ne kadar toleranslısınız?


---

**ElastiCache for Redis: Yönetilen Olarak Ne Elde Edersiniz**

RDS gibi, ElastiCache de açık kaynaklı bir aracı alır ve operasyonel işi ele alır:

- **Otomatik yedeklemeler**: Bir programa göre Redis anlık görüntüleri
- **Multi-AZ çoğaltma**: Birincil düğüm + farklı AZ'lerde okuma replikaları
- **Otomatik geçiş**: Birincil Redis düğümü başarısız olursa, bir replika otomatik olarak yükseltilir
- **Küme modu**: Çok büyük önbellekler için birden çok düğüm arasında yatay parçalama
- **Şifreleme**: Uyumluluk için aktarım sırasında ve beklemede şifreleme
- **VPC entegrasyonu**: Önbellek, herkese açık olarak erişilemeyen özel ağınızda çalışır

"Bu ayda ne kadar maliyet çıkarıyor?" diye sordu Tom.

"Değiştirdiğimiz DynamoDB okumalarından daha az," dedi Leo. "Ayda yaklaşık iki yüz dolar."

Leo fiyatlandırma sayfasını açtı. Hesabı zaten yapmıştı ama Tom'a baştan sona anlattı.

Bir `cache.t3.micro` — en küçük düğüm — ayda yaklaşık 12 dolardı. 0,5 GB belleği vardı. Birkaç yüz önbellek anahtarı olan küçük bir uygulama için yeterli.

Bir `cache.r6g.large` — Nimbus'un trafiğine uygun katman — 13 GB belleğe sahipti ve ayda yaklaşık 140 dolara çalışıyordu. Karşılaştırma için, Nimbus önbelleklemeden önce DynamoDB okumalarına ayda kabaca 400 dolar harcıyordu. Önbelleklemeden sonra, o okumalar yaklaşık yüzde 89 düşmüştü. Hesap, DynamoDB okumalarında ayda kabaca 356 dolar tasarruf, eksi ElastiCache'e harcanan 140 dolar çıktı — ayda yaklaşık 216 dolar net tasarruf.

Tom'un ifadesi şüpheciden memnuna döndü. "Ölçeklendirmeden önce rakamları düzgünce çalıştır ama bu tutuyor." Not aldı.

"Peki ya biri içeri girmeye çalışırsa?" dedi Priya. "Önbellekte oturum token'ları olabilir. Kullanıcı verisi. Redis örneğinde kimlik doğrulama token'larına ve herkese açık erişim olmamasına ihtiyacımız var."

"Özel alt ağda olacak," dedi Leo.

"Güzel. Ama 'sorun olmaz' bir güvenlik duruşu değildir," dedi. "Kimlik doğrulama token'ı. Aktarımda şifreleme. Yalnızca VPC."

Leo başını salladı. Haklıydı.

---

**Önbelleği İzlemek**

"Önbellek doğru çalışmadığında ne olacağını düşündük mü?" diye sordu Priya, Redis dağıtımından bir hafta sonra. "Sadece tamamen başarısız olmak değil — çalışıyor ama kötü. Yüksek ıska oranı. Yüksek tahliye oranı. Gecikme tırmanıyor."

"Sayfa yükleme süreleri arttığında fark ederim," dedi Leo.

"Ki o noktaya kadar veritabanı zaten zorlanıyor," dedi.

ElastiCache, metrikleri CloudWatch üzerinden açığa çıkarır. En önemli olanlar:

**CacheHitRate**: Bir sonuç döndüren önbellek okumalarının yüzdesi. Olgun bir önbellek için ideal olarak yüzde 80'in üzerinde. Düşen bir isabet oranı, en çok erişilen verinizin önbellekte olmadığını işaret eder — ya TTL'ler çok kısa, ya önbellek çok küçük ya da erişim desenleriniz değişti.

**CacheMisses**: Önbellek ıskalarının mutlak sayısı. Burada ani bir sıçrama, önbelleğin yardımcı olmadığı ve veritabanının tam yükü aldığı anlamına gelir.

**Evictions**: Yenilerine yer açmak için tahliye edilen önbellek öğelerinin sayısı. Yüksek tahliye oranları, önbelleğinizin çalışma kümeniz için çok küçük olduğu anlamına gelir. Daha fazla belleğe veya daha seçici bir önbellekleme stratejisine ihtiyacınız var.

**CurrConnections**: Redis'e mevcut istemci bağlantıları. Çok fazla bağlantı Redis'in bağlantı limitini tüketebilir. Uygulamalar, her istekte yeni bir bağlantı açmaktan kaçınmak için bağlantı havuzu kullanmalıdır.

**ReplicationLag**: Okuma replikasının birincilden ne kadar geride olduğu. Bu büyürse, replika okumaları eski veri döndürebilir.

Leo iki CloudWatch alarmı kurdu. Birincisi: önbellek isabet oranı on beş ardışık dakika boyunca yüzde 70'in altına düşerse uyar — bu, veritabanı hissetmeden önce araştırmaya değer bir sorunu işaret ederdi. İkincisi: tahliye oranı dakikada 100 tahliyeyi aşarsa uyar — bu, önbelleğin yetersiz boyutlandırıldığını işaret ederdi.

"İki alarm," dedi Priya, yapılandırmayı gözden geçirerek. "Bu iyi bir başlangıç."

"Bir de pano ekledim," dedi Leo. "İsabet oranı, ıska oranı, tahliyeler, gecikme. Hepsi tek yerde görünür."

"Bu, sayfanın yavaşlamasını beklemekten daha iyi."

"Hayli daha iyi," diye onayladı Leo.


---

**ElastiCache vs DAX: DynamoDB İçin Hangi Önbellek?**

"DynamoDB verisini önbelleğe alıyorsak," diye sordu Maya, "neden ElastiCache yerine DAX kullanmıyoruz? Belgelerde gördüm."

Güzel soru.

**DAX (DynamoDB Accelerator)**, DynamoDB için özel olarak inşa edilmiş bir bellek içi önbellektir. DynamoDB API çağrılarını istemci düzeyinde yakalar — uygulama kodunuz DAX ile aynı DynamoDB SDK'sını kullanarak konuşur. Önbellek ıskaları otomatik olarak DynamoDB'den getirilir. Önbellek isabetleri mikrosaniyelerde döner. Veri değiştiğinde geçersizleştirme otomatik olarak ele alınır.

**ElastiCache**, genel amaçlı bir önbellektir. Önbellek anahtarlarını, TTL mantığını, geçersizleştirmeyi — hepsini siz yönetirsiniz. Daha fazla kontrol, daha fazla sorumluluk.

Hangisini ne zaman kullanmalı:

| Senaryo | Öneri |
|---|---|
| DynamoDB okumalarını önbelleğe alıyorsunuz ve sıfır uygulama değişikliği istiyorsunuz | DAX |
| DynamoDB okumalarında mikrosaniye gecikmesine ihtiyacınız var | DAX |
| Birden çok kaynaktan önbelleğe alıyorsunuz (DynamoDB + RDS + harici API'ler) | ElastiCache |
| Redis veri yapılarına ihtiyacınız var (sıralı kümeler, pub/sub, HyperLogLog) | ElastiCache |
| İnce taneli TTL kontrolüne ve özel geçersizleştirme mantığına ihtiyacınız var | ElastiCache |
| Oturum depolamaya, hız sınırlamaya veya dağıtık kilitlere ihtiyacınız var | ElastiCache |

Nimbus için: ElastiCache'i seçtiler çünkü birden çok kaynaktan veri önbelleğe alıyorlardı — menüler için DynamoDB, sipariş geçmişi özetleri için RDS, restoran puanları için harici API'ler. DAX yalnızca DynamoDB ile çalışır. Ve trend sıralamaları için Redis sıralı kümelerine ihtiyaçları vardı.

"Saf bir DynamoDB önbellekleme problemi olsaydı," dedi Priya, "DAX daha basit cevap olurdu. Tek hizmet, otomatik geçersizleştirme, aynı API. Ama birden fazla veri kaynağımız var."

"Yani DynamoDB-only olduğunuzda DAX daha basit," diye özetledi Maya. "Tüm araç kutusuna ihtiyacınız olduğunda ElastiCache."

"Takas bu."

### Önbellek Verisi Kaybedilemediğinde: Amazon MemoryDB

"Redis'i neden biri birincil veritabanı olarak kullansın ki?" diye sordu Maya. "Bu bir önbellek değil mi?"

İşte tam doğru soru.

ElastiCache for Redis bir önbellektir — hızlı, bellek içi ve tasarım gereği, gerçeğin kaynağı değil. Bir ElastiCache düğümü başarısız olursa, yeniden başlatmada önbellek boştur. Uygulamalar onu veritabanından yeniden ısıtır. Bu, bir önbellek için sorun değil.

Ama bazı kullanım durumları Redis'i bir önbellek olarak değil, birincil veri deposu olarak ele alır — yeniden başlatmalardan sağ çıkması gereken oturum durumu, kaybedilemeyecek gerçek zamanlı bir lider tablosu, bir AZ arızası boyunca devam etmesi gereken bir alışveriş sepeti. Bu kullanım durumları için, ElastiCache'in nihai dayanıklılığı bir risktir.

**Amazon MemoryDB for Redis**, tamamen yönetilen, Redis uyumlu, dayanıklı bir bellek içi veritabanıdır. ElastiCache'in aksine, MemoryDB her yazmayı onaylanmadan önce dayanıklı yapan, birden çok AZ'de saklanan dağıtık bir işlem günlüğü kullanır. Veri düğüm arızalarından sağ çıkar — daha yavaş bir veritabanından yeniden oynatıldığı için değil, asla yalnızca tek bir yerde olmadığı için.

Temel ayrım:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| Rol | Önbellek katmanı | Birincil veritabanı |
| Dayanıklılık | Arızada garanti edilmez | Multi-AZ işlem günlüğü |
| Gecikme | Mikrosaniye okuma ve yazma | Mikrosaniye okuma, tek haneli milisaniye yazma |

Her ikisi de aynı Redis komutlarını ve veri yapılarını destekler. API aynıdır. Dayanıklılık garantisi değildir.

Nimbus için: ekip restoran başına gerçek zamanlı sipariş sayılarını bir Redis sıralı kümesi olarak saklamak istiyor — ve bunun veritabanından yeniden tohumlama olmadan bir AZ arızasından sağ çıkması gerekiyor. O gereksinim — Redis uyumlu *ve* dayanıklı — MemoryDB için tam sinyaldir.

"Yani bir arızadan sonra onu yeniden ısıtmak zorunda değil miyiz?" diye sordu Leo.

"Mesele bu," dedi Priya. "Düğüm başarısız olur ve geri gelirse, veri oradadır. İşlem günlüğü onu tuttu."

Leo bir an fiyatlandırma sayfasına baktı. "ElastiCache'ten daha pahalı."

"Güvenilmeye değer her şey öyledir," dedi Priya.

## Güçlü Yönler ve Sınırlamalar

**Önbellekleme neden güçlüdür**:

- Veritabanı yükünü çarpıcı biçimde azaltır (daha az sorgu, daha düşük maliyet)
- Önbellek isabetleri için milisaniye altı yanıt süreleri
- Veritabanınızı trafik sıçramalarından korur
- Redis, basit bir anahtar-değer deposundan daha zengin veri yapılarını destekler
- Önbellek izdihamı hafifletme (TTL jitter, birleştirme) soğuk başlangıç dalgalarına karşı korur

**Önbellekleme nerede karmaşıklaşır**:

- Önbellek geçersizleştirme gerçekten zordur — eski veri hatalara neden olur
- Operasyonel karmaşıklık ekler (izlenecek başka bir hizmet, başka bir arıza noktası)
- Soğuk başlangıç problemi: taze dağıttığınızda önbellek boştur — veritabanı tam yükü alır
- Önbellek izdihamı: birçok giriş bir anda dolarsa, tüm istekler veritabanına aynı anda çarpar
- ElastiCache düğümleri ücretsiz değildir — boştayken bile onlar için ödeme yaparsınız

**ElastiCache vs DynamoDB DAX**:

Özellikle DynamoDB verisini önbelleğe alıyorsanız, AWS **DAX (DynamoDB Accelerator)** sunar — DynamoDB için özel olarak inşa edilmiş bir bellek içi önbellek. DAX, uygulama kodunuza şeffaftır (aynı API), DynamoDB okuma gecikmesini mikrosaniyelere düşürür ve önbellek geçersizleştirmeyi otomatik olarak ele alır.

Darboğazınız DynamoDB okumaları olduğunda ve sıfır değişiklikli önbellekleme istediğinizde DAX kullanın. Herhangi bir veri kaynağı için genel amaçlı bir önbelleğe ihtiyacınız olduğunda veya Redis veri yapılarına ihtiyacınız olduğunda ElastiCache kullanın.

## Özet

Kırk yedi veritabanı çağrısı bir önbellek aramasına dönüştü. Sayfa 188 milisaniyeden 12'ye indi. Bir önbellekleme katmanı eklemek, büyüyen bir uygulamanın yapabileceği en yüksek kaldıraçlı değişikliklerden biridir — ama yalnızca önbellek "bu veri ne zaman değişir?" sorusuna net cevaplarla, düşünülerek tasarlandığında.

- Önbellek, yakın zamanda getirilen verinin hızlı bir deposudur — bir kez sorarsınız, cevabı hatırlarsınız. ElastiCache, AWS'nin yönetilen önbellekleme hizmetidir ve **Redis**'i (kalıcılık, karmaşık veri yapıları, pub/sub) ve **Memcached**'i (saf anahtar-değer, yatay ölçekleme) destekler.
- **Cache-aside deseni** (tembel yükleme): önce önbelleği kontrol et, ıskada veritabanına düş. **TTL**, verinin ne kadar süre önbellekte kaldığını kontrol eder — kısa TTL daha taze veri ve daha çok ıska demektir; uzun TTL daha hızlı yanıtlar ve olası eskime demektir.
- Doğru şeyi önbelleğe alın: her oturuma özgü kullanıcı başına veri değil, birçok kullanıcı arasında paylaşılan varlık başına veri. Önbellek izdihamı, birçok giriş aynı anda dolduğunda oluşur — TTL jitter ile hafifletin.
- **DAX**, yalnızca DynamoDB önbelleklemesi için doğru seçimdir. **ElastiCache**, çok kaynaklı önbellekleme ve Redis veri yapıları için daha esnektir.
- Önbelleklemenin en zor kısmı geçersizleştirmedir: verinin ne zaman değiştiğini bilmek ve önbelleği ona yazan tüm kod yollarında güncellemek. Bir önbellek, ancak geçersizleştirme stratejisi kadar güvenilirdir.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.3)*

- **Sınavda Redis vs Memcached**: Redis = kalıcılık, çoğaltma, karmaşık yapılar, pub/sub. Memcached = basit anahtar-değer, saf yatay ölçekleme. Senaryo "önbelleğe alınan veriyi kaybedemezsiniz" derse, cevap Redis'tir (diske kalıcılaştırır).
- **ElastiCache kullanım durumu sinyalleri**: "veritabanı bir darboğaz," "okuma yoğun iş yükü," "gecikmeyi azalt," "oturum deposu" — hepsi ElastiCache'i gösterir.
- **DAX sinyali**: "DynamoDB okuma gecikmesini azalt" veya "DynamoDB okumaları çok yavaş" → ElastiCache değil, DAX.
- **Oturum yönetimi**: ElastiCache Redis, kullanıcı oturum verisini saklamak için kanonik cevaptır. Durumsuz uygulama + Redis oturum deposu = tutarlı oturumlarla yatay ölçekleme.
- **Write-through vs cache-aside**: Cache-aside (tembel yükleme) en yaygınıdır. Write-through, her yazmada önbelleği günceller — asla eski değil, ama daha fazla yazma işlemi. Sınav bunları ayırt edebilir.
- **Önbellek tahliye politikaları**: LRU (en az yakın zamanda kullanılan), genel web iş yükleri için en yaygın sınav cevabıdır.
- **ElastiCache vs. MemoryDB:** ElastiCache = önbellek katmanı, hızlı, arızada veri kaybı kabul edilebilir. MemoryDB = dayanıklı bellek içi birincil veritabanı, Redis uyumlu, multi-AZ işlem günlüğü. Sınav tetikleyicisi: "Redis uyumlu VE dayanıklı" veya "Redis'te birincil veri deposu" → ElastiCache değil, MemoryDB.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizle: önbellek geçersizleştirme nedir ve neden zordur?

*(İpucu: Nimbus'ta menü verisinin güncellenebileceği tüm yerleri düşünün — restoran ortağı portalı, bir yönetici aracı, bir cron işi. Bu yolların her birinin önbellek hakkında bilgi sahibi olması gerekir.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir video akış platformu milyonlarca kullanıcıya hizmet veriyor. Mevcut filmlerin kataloğu seyrek değişiyor (her gece güncelleniyor). Her kullanıcı isteği kataloğu sorguladığından, uygulama yüksek veritabanı CPU kullanımı yaşıyor. Ekip, katalog verisini güncellemelerden sonraki bir saat içinde doğru tutarken veritabanı yükünü azaltmak istiyor.

Bu gereksinimleri EN İYİ hangi çözüm karşılar?

A) Yükü dağıtmak için RDS veritabanına okuma replikaları ekleyin  
B) Kataloğu talep üzerine kapasiteyle DynamoDB'ye taşıyın  
C) Katalog verisi için 1 saatlik TTL ile ElastiCache for Redis kullanın  
D) Daha fazla eşzamanlı sorguyu işlemek için RDS örnek boyutunu artırın

**İpucu 1**: Veri okuma yoğun ve seyrek değişiyor. Bunun için hangi desen idealdir?

**İpucu 2**: "Bir saat içinde doğru" doğrudan belirli bir önbellek yapılandırma parametresine çevrilir.

**İpucu 3**: Amaç, sadece daha fazlasını işlemek değil, veritabanı yükünü azaltmaktır.

**Cevap**: C

**Açıklama**: Bir saatlik TTL ile ElastiCache, anahtar başına ilk istekten sonra katalog verisini önbelleğe alır. Sonraki istekler veritabanına dokunmadan önbellekten döner. Gecelik güncelleme çalıştığında, girişler bir saat içinde dolar ve bir sonraki istekte taze veri yüklenir.

**Neden A değil?** Okuma replikaları, okuma trafiğini daha fazla veritabanı düğümüne dağıtır ama toplam sorgu sayısını azaltmaz. Okumaları ölçeklemek için yararlıdır, sık tekrarlanan sorgulardan kaynaklanan veritabanı yükünü azaltmak için değil.

**Neden B değil?** DynamoDB'ye taşımak temel sorunu çözmez — katalog verisi yine her kullanıcı isteğinde veritabanından (DynamoDB) getirilir.

**Neden D değil?** Örneği ölçeklendirmek daha fazla eşzamanlı sorguyu işler ama sorgu sayısını azaltmaz. Temel verimsizlik kalır.

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama — Görev 3.3*

**Alıştırma 3 — Mimari Mücadelesi** *(İsteğe Bağlı)*

Nimbus bir "trend restoranlar" özelliği eklemek istiyor: son 24 saatte sipariş hacmine göre en iyi 10 restoranın sıralı bir listesi, her 15 dakikada bir güncellenir.

Bunu ElastiCache Redis ile nasıl uygularsınız? Sıralama için hangi Redis veri yapısını kullanırsınız? Önbellek TTL'niz ne olurdu ve önbelleği tam olarak ne zaman güncellerdiniz?

Ayrıca şunu düşünün: ElastiCache düğümü çökerse ne olur? Özellik bozulur mu? Bu arızayı çevreleyecek şekilde nasıl tasarlardınız?

*(Tek bir doğru cevap yoktur. Amaç, önbellek tasarımı ve arıza düşüncesi pratiği yapmaktır.)*

## Jenerik Sonrası Sahne

"Zaten dağıttım — ah." Leo, Redis entegrasyonunu bağlantı havuzu ayarlarını güncellemeden önce üretime göndermişti. Yük altında, uygulama çok fazla Redis bağlantısı açıyordu. Geri almak ve doğru yapılandırmayla tekrar dağıtmak zorunda kalmıştı.

Leo menü için Redis önbelleklemesi ekledi. Sayfa yükleme süresi 188 milisaniyeden 12 milisaniyeye düştü.

Kırk yedi DynamoDB çağrısı bir Redis aramasına dönüştü. Çağrı 0,8 milisaniyeydi.

Bunu pazartesi standup'ında duyurdu.

"İyi iş," dedi Priya, dizüstü bilgisayarından bakmadan.

"Teşekkürler," dedi Leo.

"En son Redis kimlik doğrulama token'ını ne zaman döndürdün?"

Leo notlarına baktı. "Sanırım hiç ayarlamadım."

"Yani önbellek kimlik doğrulamasız."

"VPC'nin içinde."

"Tehlikeye atılan diğer her şey gibi." Sonunda başını kaldırdı. "Leo'nun dizüstü bilgisayarı enfekte olursa ve biri VPC'ye geçerse, önbelleğinin bir parolası yok."

Leo ona baktı.

"Kimlik doğrulama token'ını ayarlayacağım," dedi.

Sonraki bölümde: Nimbus'un sahip olduklarını internetin geri kalanından ayıran özel ağ.
