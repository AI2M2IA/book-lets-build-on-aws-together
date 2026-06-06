# Bölüm 24: Sizinle Birlikte Büyüyen Veritabanı

İki rafla ve bir kütüphaneciyle başlayan bir kütüphane hayal edin. Bu, bir süre için yeterliydi. Kütüphaneci her şeyin nerede olduğunu biliyordu. İsteklere hızlı yanıt veriliyordu. Sonra kütüphane büyüdü: on raf, yirmi, kırk. Aynı kütüphaneci, aynı masa, aynı kart kataloğu. Şimdi herhangi bir şey bulmak beklemeyi gerektiriyor. Kütüphaneci yavaş değil—sadece bir kişinin orijinal hızda hizmet verebileceğinden daha fazla kütüphane var.

Çözüm daha hızlı bir kütüphaneci değil. Farklı türde bir kütüphane.

---

S3 maliyet azaltmasından sonra, Tom incelemesine devam etti. Veritabanı katmanı farklı türde bir sorundu—yanlış depolama sınıfındaki boşta veri değil, altı aylık trafik büyümesinin yükü altında aktif olarak mücadele eden bir sistem.

---

Sayılar rahat değildi.

Nimbus RDS PostgreSQL çalıştırıyordu: Multi-AZ, db.r6g.large örneği. Ayda 340 dolar.

Leo CloudWatch metrik panosunu açtı. Sayıların bir kalıbı vardı.

**DatabaseConnections**: Cuma zirvesinde maksimum 200'ün 198'i. Doygunluktan iki bağlantı uzakta. 200'de, yeni bağlantı girişimleri "çok fazla bağlantı" hatasıyla başarısız olurdu—akşam yemeği sipariş eden müşterilere HTTP 500 olarak yüzeye çıkacak bir hata.

**CPUUtilization**: Cuma akşam yemeği yoğunluğu sırasında %89 zirve. Örnek sıçramaları yönetmek için tasarlanmıştı—bir db.r6g.large 2 vCPU ve 16 GB belleğe sahiptir—ama sürekli %89 CPU, veritabanının zirve saati daha gelmeden kapasitede olduğu anlamına geliyordu.

**ReadLatency**: 840 milisaniye P95. Altı ay önce 180ms'ydi. Bozulma kademeliydi—haftada 10 ila 20ms—felaket olana kadar görünmezdi. Tom'un incelemesinden önceki hafta, P99 gecikmesi tam bir saniyeyi geçmişti. Bir restoran menüsüne tıklayan müşteriler sayfanın yüklenmesi için bir saniyeden fazla bekliyordu.

**FreeStorageSpace**: Sağlanan depolamanın %18'i kaldı. Mevcut büyüme oranlarında, veritabanı yaklaşık 11 hafta içinde sağlanan depolamayı tüketirdi.

"Bunların her biri tek başına çözülebilir," dedi Leo, panoya bakarak. "Ama dördünü de aynı anda yaşıyoruz."

Bağlantı sayısı sıçraması, uygulamadaki bağlantı havuzlama sorunlarına işaret ediyordu—çok fazla ECS görevinin kendi veritabanı bağlantılarını açması. CPU sorunu pahalı sorgulara işaret ediyordu. Gecikme sorunu ve CPU sorunu neredeyse kesinlikle aynı sorundu: çok sık çalışan yavaş bir sorgu.

"Bekle—ama *neden* 198 bağlantıdayız?" diye sordu Maya. "Üç ECS görevimiz var. Nasıl neredeyse 200 veritabanı bağlantımız var?"

Her ECS görevi, varsayılan 5 bağlantı havuzu boyutu artı 10 taşma ile SQLAlchemy kullanıyordu. Üç görev × 15 potansiyel bağlantı = uygulamadan 45 bağlantı. Diğer 153'ü analiz Lambda fonksiyonlarından, arka plan iş işçilerinden, Glue ETL işinden, geliştirme ekibinin bastion ana bilgisayar aracılığıyla yerel bağlantılarından ve kodun eski bir sürümü tarafından açılmış ama düzgün kapatılmamış birkaç bağlantıdandı.

"Bağlantı sayısı sorunu," dedi Leo, "aslında bir veritabanı sorunu gibi görünen bir uygulama sorunu." Görev listesine PgBouncer (bir bağlantı havuzlayıcı) ekledi—ama acil darboğaz yavaş sorguydu.

Veritabanı CPU'su Cuma akşam yemeği yoğunluğu sırasında %89'a fırlıyordu. Okuma sorguları kuyruklanıyordu. P95 sorgu gecikmesi altı ayda ikiye katlanmıştı.

"Veritabanı darboğaz," dedi. "Trafik büyüdü. Veritabanı onunla ölçeklenmedi."

"Sadece örneği daha büyük yapabilir miyiz?" diye sordu Maya. "Bekle—ama *neden* tüm okumaları ve yazmaları ele alan tek bir veritabanımız var? Bunu neden baştan dağıtmadık?"

"Evet," dedi Leo. "Bu dikey ölçeklendirme. r6g.large'den r6g.xlarge'a geçeriz. Daha fazla CPU, daha fazla bellek. Daha pahalıya mal olur ve bize zaman kazandırır."

"Ama temel sorunu çözmez," dedi Priya. "Sonunda en büyük örneğe ulaşırız ve farklı bir yaklaşıma ihtiyacımız olur. Ve yanlışlıkla bir okuma replikasına bir yazma giderse ne olacağını düşündük mü? Replika onu reddeder ve sipariş sessizce başarısız olur."

"İki yaklaşım var," dedi Leo. "Okuma replikaları veya Aurora."

"Fark ne?"

"Bir kütüphane gibi düşünün," dedi Leo, bir kalem alarak. "Hem kitapları teslim alan hem de okuyucu sorularını yanıtlayan bir kütüphaneci. Kütüphane popüler olduğunda, bir kuyruk oluşur. Çözüm: daha fazla kütüphaneci işe al—ama yalnızca soruları yanıtlamak için. Teslim alma hâlâ orijinal masadan geçer."

"Bu bir okuma replikası," dedi Priya.

"Aynen. Aurora bir adım daha ileri gider—raf sisteminin kendisini yeniden tasarlar, böylece her kütüphaneci aynı rafları paylaşır ve her zaman aynı kitapları görür, gecikme olmadan. Güncellemelerin bir masadan diğerine sızmasını beklemek yok."

**Okuma Replikaları: Okuma Trafiğini Dağıtma**

Çoğu web uygulaması veriyi yazdığından çok daha sık okur. Menüye göz atan bir müşteri düzinelerce SELECT sorgusu yapar. Bir sipariş vermek birkaç INSERT/UPDATE sorgusu yapar. Oran tipik olarak 10:1 veya daha yüksektir.

Bir **okuma replikası (read replica)**, birincilden tüm yazmaların bir kopyasını alan ve o yazmaları SELECT sorguları için kullanılabilir kılan ek bir RDS örneğidir.

Nasıl çalışır:

1. Uygulama yazmaları (INSERT, UPDATE, DELETE) birincil veritabanına gider
2. Birincil bu değişiklikleri okuma replikalarına asenkron olarak replike eder
3. Uygulama okumaları (SELECT) okuma replikaları arasında dağıtılır
4. Okuma replikaları yükü paylaşır—her biri toplam okuma trafiğinin bir kesrini ele alır

Sonuç: birincil veritabanı yalnızca yazmaları ele alır (ve isteğe bağlı olarak bazı okumaları). Okuma replikaları okuma yükünü ele alır. 10:1 okuma/yazma oranı için, bir okuma replikası eklemek birincilin toplam yükünü kabaca yarıya indirir.

**Önemli sınırlama**: Replikasyon **asenkrondur**. Replikasyon gecikmesi vardır—tipik olarak milisaniyeler, ama yük altında saniyeler olabilir. Bir replikadan okuma, birincilin biraz gerisinde olan veriyi görebilir. Çoğu okuma için (menüye göz atma, sipariş geçmişini görüntüleme), bu kabul edilebilir. "Siparişim az önce geçti mi?" için—birincilden okuyun.

**Okuma Replikaları: Ayrıntılar**

- Birincil RDS örneği başına 15 okuma replikasına kadar sahip olabilirsiniz (MySQL, PostgreSQL, MariaDB)
- Okuma replikaları aynı bölgede veya farklı bir bölgede olabilir (bölgeler arası replikalar)
- Okuma replikalarının kendileri okuma replikalarına sahip olabilir (zincirleme)
- Okuma replikaları ayrı uç noktalardır—uygulamanız okumaları replika uç noktasına yönlendirmelidir
- Okuma replikaları bağımsız veritabanlarına terfi ettirilebilir (DR için yararlı)

Nimbus için, Leo bir okuma replikası ekledi. "İyi olacak," dedi Priya, trafiği değiştirmeden önce uygulamanın okuma/yazma yönlendirme mantığını test edip etmediğini sorduğunda. Test etmemişti. Sonraki kırk dakikayı yazmaların okuma replikası uç noktasına gitmediğini doğrulayarak geçirdi.

Uygulamayı şu şekilde güncelledi:

- Yazma işlemleri → birincil uç nokta
- Menüye göz atma, sipariş geçmişi → replika uç noktası

Birincildeki CPU zirvede %89'dan %41'e düştü.

**Yazma Sonrası Okuma Tutarlılığı Sorunu**

Okuma replikası etkinleştirildikten üç gün sonra, bir destek talebi geldi. Bir restoran ortağı menüsünü güncellemişti—durdurulmuş bir öğeyi kaldırmış—ve sonra kaldırıldığını doğrulamak için aramıştı. Müşteri hizmetleri temsilcisi menüyü Nimbus arayüzünden açtı. Öğe hâlâ oradaydı.

Yirmi saniye sonra, gitmişti.

Asenkron replikasyon gecikmesi. Yazma (DELETE menü öğesi) birincile gitti. Müşteri hizmetleri temsilcisinin okuması, değişikliği henüz almamış olan replikaya gitti. Replika o anda 15 saniye geride kalmıştı—olağandışı değil, ama görünür.

"Peki birisi sonunda tutarlılık penceresinden içeri girmeye çalışırsa?" diye sordu Priya. "Ya da sadece—az önce silinmiş bir menü öğesi için bir sipariş verilirse ne olur? Müşteriyi ücretlendiririz ve restoranın öğesi olmaz."

Bu sadece bir UX rahatsızlığı değil, gerçek bir tutarlılık endişesiydi.

Çözüm: hangi okumaların tutarlılık gereksinimleri olduğunu belirleyin ve onları birincile yönlendirin.

**Replikaya gidebilen okumalar** (sonunda tutarlılık iyidir):
- Müşterinin bir restoranın menüsüne göz atması (1-2 saniye bayat fark edilmez)
- Sipariş geçmişi sorguları (bir dakika önceki sipariş geçmişini görüntüleyen bir kullanıcı)
- Analiz türü okumalar (bu haftanın en iyi restoranları)

**Birincile gitmesi gereken okumalar** (yazma sonrası okuma tutarlılığı gerekli):
- Bir yazmadan hemen sonra, uygulamanın yazmanın başarılı olduğunu doğrulaması gerektiğinde
- Sipariş verildikten hemen sonra sipariş durumu okumaları
- Restoran yönetim arayüzü tarafından tetiklenen menü okumaları (restoran az önce menüyü değiştirdi)

Uygulama veritabanı bağlantı katmanına bir yönlendirme ipucu ekledi: istek restoran yönetim panosundan geldiyse, birincile yönlendir. Bir müşterinin göz atmasından geldiyse, replikaya yönlendir. `X-Read-Consistency: strong` HTTP başlığı sinyal olarak hizmet etti.

"Çok zor değil," dedi Leo. "Sadece hangi okumaların onu gerektirdiğini bilmeniz gerekir."

"Ve belgelemek," dedi Priya. "Böylece yeni bir uç nokta ekleyen bir sonraki kişi hangi havuzu kullanacağını bilir."

"Bu ayda ne kadara mal oluyor?" diye sordu Tom. Bu, herhangi bir yeni hizmet için standart açılış sorusuydu.

Aynı örnek türünün bir okuma replikası, birincil ile aynı maliyetlidir. Ayda 340 dolardan 680 dolara.

"Yükü kabaca yarıya indirmek için maliyeti iki katına çıkardık," dedi Tom.

"Evet. Ama alternatif daha büyük bir örnek türüne geçmekti, ki bu da daha pahalıya mal olur ve okuma yükünü dağıtmazdı."

Tom matematiği yaptı. İsteksizce başını salladı.

"Birincil arızalanırsa ne olur?" diye sordu Maya, Tom Aurora'ya geçemeden önce. "Okuma replikasına ne olur?"

Leo replika terfisini açıkladı.

**Birincil RDS örneği arızalanırsa**, AWS Multi-AZ yapılandırmasındaki beklemedeki replikaya otomatik olarak geçiş yapar (farklı türde bir replika—senkron bir bekleme, bir okuma replikası değil). Multi-AZ beklemesi yeni birincil olur. Okuma replikaları okumaları sunmaya devam eder, şimdi yeni birincilden replike ederler. Uygulamanın perspektifinden, birincil uç nokta DNS'i eski beklemeyi gösterecek şekilde değişir ve uygulama yeniden bağlanır.

Geçiş, RDS PostgreSQL için tipik olarak 60-120 saniye sürer. O pencere sırasında, yazmalar başarısız olur.

**Okuma replikası terfisi** ayrı bir işlemdir—ve ayrı bir senaryo. Bir okuma replikasını alıp bağımsız, yazılabilir bir veritabanı yapmak istiyorsanız (DR için, yeni bir bölgeye göç için veya birincil gittiği ve Multi-AZ geçişini beklemek yerine terfi ettirmeniz gerektiği için), bir okuma replikasını bağımsız bir birincile terfi ettirebilirsiniz. Terfi birkaç dakika sürer, sonrasında replika artık orijinal birincilden replike etmez—kendi veritabanıdır.

"us-west-2 birincili tamamen çökerse ne olacağını düşündük mü?" diye sordu Priya. "Sadece Multi-AZ beklemesine geçiş değil—tüm bölge."

"Bölge arızalanırsa," dedi Leo, "Multi-AZ beklemesi de us-west-2'de. İkisi birlikte arızalanır."

"Yani gerçek bir bölgesel DR senaryosu için," dedi Tom, "us-east-1'de terfi ettirebileceğimiz bir okuma replikasına ihtiyacımız olurdu."

"Evet. Bir bölgeler arası okuma replikası. Henüz bir tane yok."

"Bu ayda ne kadara mal oluyor?" diye sordu Tom. Cevabın bir karar içereceğini zaten biliyordu.

us-east-1'de bir db.r6g.large'in bölgeler arası okuma replikası: ayda 340 dolar (aynı örnek maliyeti). Artı replikasyon için bölgeler arası veri aktarımı: Nimbus'un yazma hacminde minimal. Toplam: bir DR replikası için yaklaşık ayda 350 dolar.

"Bu yılda 4.200 dolar," dedi Tom, "on yılda AWS bölgelerinin başına beş kezden az gelen bir senaryoya karşı koruma için."

"Ve bölgesel bir olay sırasında Nimbus'un 24 saat kapalı olmasının maliyeti?" diye sordu Priya.

Tom hesapladı. Yüksek sesle cevap vermedi. Ama DR birikim listesine "bölgeler arası okuma replikası" ekledi.

"Aurora nedir?" diye sordu.

**Amazon Aurora: Veritabanı Motorunu Yeniden Düşünmek**

Aurora, MySQL ve PostgreSQL ile uyumlu, AWS'nin tescilli ilişkisel veritabanı motorudur. Bulut iş yükleri için sıfırdan tasarlandı ve bir ilişkisel veritabanının depolama katmanının nasıl çalıştığını yeniden hayal etti.

Geleneksel bir RDS kurulumunda (MySQL, PostgreSQL), depolama ve işlem sıkı sıkıya bağlıdır. Veritabanı motoru veri dosyalarını yönetir. Replikasyon veriyi birincilden replikaya kopyalar. Replika her yazma işlemini yeniden yapmalıdır.

Bu, replikasyon hızında bir tavan yaratır: bir replika yazmaları yalnızca replikasyon günlüğünü işleyebildiği hızda uygulayabilir. Yazma ağırlıklı bir dönemde—toplu içe aktarma, bir flaş satış, bir toplu güncelleme—replika geride kalabilir. Replikasyon gecikmesi uygulamadaki bir kusur değildir; mimarinin bir sonucudur.

Priya, Leo okuma replikalarını önerdiğinde bunu hemen işaret etmişti. "Peki Cuma yoğunluğu sırasında replikasyon gecikmesi 30 saniyeye fırlarsa ne olacağını düşündük mü? Replika 30 saniye geride. Bir müşteri sipariş verir, mutfak zaman dilimi birincilde rezerve edilir, ama replikayı sorgulayan ikinci bir müşteri rezervasyonu görmez. İki sipariş, bir dilim."

"Bu bir envanter tutarlılığı sorunu," dedi Leo.

"Bu tam olarak bir envanter tutarlılığı sorunu," diye onayladı Priya. "Bu yüzden envanter okumaları—'bu öğe hâlâ mevcut mu?'—birincile gitmeli."

Aurora'nın mimarisi gecikmeyi doğrudan ele alır.

Aurora depolamayı işlemden ayırır. Veriyi üç Erişilebilirlik Bölgesi arasında altı kopya hâlinde otomatik olarak replike eden dağıtık, hata toleranslı bir depolama katmanı kullanır. İşlem katmanı (veritabanı örnekleri) bu depolama katmanının üzerinde oturur.

**Bunun değiştirdiği şeyler**:

**Okuma replikaları**: Aurora replikalarının veriyi replike etmesi gerekmez—zaten aynı depolama katmanını paylaşırlar. Bu şu anlama gelir:

- Depolama birimini paylaşan 15 Aurora Replikasına kadar (normal RDS de 15 okuma replikasına izin verir, ama her biri tam bir veri kopyasıdır)
- Replikasyon gecikmesi tipik olarak 100 milisaniyenin altındadır (yük altında RDS için saniyelere karşı)
- Replikalar 30 saniyenin altında birincile terfi ettirilebilir (dakikalara karşı)

**Geçiş**: Replikalar depolamayı paylaştığı için, geçiş çok daha hızlıdır—terfi veri aktarımı içermez, sadece yazmaları yeniden yönlendirir.

**Depolama**: Aurora depolamayı 10GB'lık artışlarla, 128 TiB'a kadar (son motor sürümlerinde 256 TiB) otomatik olarak ölçeklendirir. Depolamayı asla önceden sağlamazsınız.

**Performans**: Aurora, eşdeğer örnek türleri için standart MySQL'in 5 katı verim ve standart PostgreSQL'in 3 katı iddia eder.

Şunu merak ediyor olabilirsiniz: tüm replikalar aynı depolamayı paylaşıyorsa, o depolama tek bir arıza noktası hâline gelmez mi? Aurora'nın depolama katmanı veriyi üç Erişilebilirlik Bölgesinde altı kopya hâlinde otomatik olarak replike eder. Depolamanın kendisi herhangi bir tek RDS Multi-AZ kurulumundan daha dayanıklıdır—sıfır veri kaybıyla ve geçiş gerekmeden tüm bir AZ kaybından sağ çıkacak şekilde tasarlanmıştır.

İkinci yaygın bir soru: Aurora MySQL/PostgreSQL uyumluysa, RDS PostgreSQL'den Aurora PostgreSQL'e uygulama kodunu değiştirmeden geçebilir misiniz? Neredeyse. Aurora PostgreSQL uyumluluğu, Aurora'nın PostgreSQL kablo protokolünü uyguladığı ve PostgreSQL SQL sözdizimi ve özelliklerinin büyük çoğunluğunu desteklediği anlamına gelir. Çoğu uygulama sıfır kod değişikliğiyle göç eder. Uç durumlar: az sayıda PostgreSQL uzantısı Aurora'da mevcut değildir, bazı sistem kataloğu sorguları farklı değerler döndürür ve belirli yönetimsel işlemler farklıdır. Üretim göçleri için, yazmaları değiştirmeden önce paralel okuma trafiğiyle test edin.

Nimbus için, RDS PostgreSQL'den Aurora PostgreSQL'e göç bir öğleden sonra sürdü. Uygulama Aurora uç noktasına yönlendirildi. Menü sorgusu—Leo, Performance Insights'ın veritabanı yükünün en büyük tüketicisi olarak işaret ettiği dizini ekledikten sonra—620ms yerine 4ms'de çalıştı. Bağlantı havuzu artık 200'ün 198'ine ulaşmadı. P95 gecikmesi 28ms'ye düştü.

"Bu, uygulamanın aynı veritabanı motoru olduğunu düşündüğü," dedi Leo, "farklı bir veritabanı motoru."

"Peki ilginç kısmı?" diye sordu Maya.

"Hızlı veritabanı klonlama."

"Not edildi," dedi Sam sessizce odanın diğer ucundan, zaten yazıyordu. Sam, birkaç hafta önce veritabanı işinin bir kısmını Leo'nun tabağından almak için ekibe katılmış bir arka uç mühendisiydi. Kimse ne yaptığını sormadı.

**Aurora Fiyatlandırması: Tom Sorusu**

Aurora fiyatlandırması RDS'den farklıdır:

**Örnek fiyatlandırması**: Türe göre RDS örnek fiyatlandırmasına benzer.

**Depolama fiyatlandırması**: GB başına ayda 0,10 dolar (sakladığınız şey için ödersiniz, otomatik ölçeklenir).

**G/Ç fiyatlandırması**: Aurora G/Ç isteği başına (depolamaya okuma/yazma) ücret alır. Bu, yazma ağırlıklı iş yükleri için önemli olabilir.

"Bekle," dedi Tom. "G/Ç için ayrı mı ödüyoruz?"

"Aurora Serverless v2 ve Aurora I/O-Optimized bu fiyatlandırma modelini değiştirir," dedi Leo. "Aurora I/O-Optimized G/Ç ücreti almaz ama daha yüksek depolama ve örnek fiyatı alır. G/Ç ağırlıklı iş yükleri için daha iyi."

Tom takası inceledi. Okuma ağırlıklı (çok menü sorgusu, az yazma) olan Nimbus için, Aurora I/O-Optimized daha pahalıya mal olabilirdi. Standart Aurora fiyatlandırması uygun olabilirdi.

Yararlı bir kural: G/Ç ücretleriniz toplam Aurora faturanızın kabaca %25'ini aşıyorsa, I/O-Optimized muhtemelen daha ucuzdur. Nimbus'un okuma ağırlıklı iş yükü için, G/Ç ücretleri düşüktü—standart fiyatlandırma uygulanır. Bir olay günlükleme sistemi gibi yazma ağırlıklı bir iş yükü için, I/O-Optimized maliyetleri önemli ölçüde azaltabilir.

Bu, kıdemli mühendislerin verdiği gerçek bir maliyet kararıdır: doğru seçim yapmak için iş yükünüzün G/Ç kalıplarını bilmeniz gerekir.

İş yükünüz küçük, kararlı ve öngörülebilirse, RDS PostgreSQL daha basit ve anlamlı şekilde daha ucuzdur—ama trafiğiniz öngörülemezse, veri hacminiz önceden sağlayabileceğinizin ötesine büyüyorsa veya 30 saniyenin altında otomatik geçişe ihtiyacınız varsa, Aurora'nın paylaşılan depolama modeli daha yüksek temel maliyeti haklı çıkarır.

**Aurora Serverless: Örnekleri Düşünmeden Ölçeklendirme**

**Aurora Serverless v2**, işlem kapasitesini gerçek veritabanı yüküne göre otomatik olarak ölçeklendiren bir yapılandırmadır. Sabit bir örnek boyutu (db.r6g.large) seçmek yerine, Aurora Capacity Units (ACU) cinsinden minimum ve maksimum kapasite ayarlarsınız.

Aurora Serverless v2:

- Yük arttığında saniyeler içinde yukarı ölçeklenir
- Boşta dönemlerde aşağı ölçeklenir—ve 2024 sonundan beri, hiç bağlantı olmadığında 0 ACU'ya kadar otomatik duraklatabilir (devam ~15 saniye sürer; otomatik duraklatma RDS Proxy veya diğer bağlantı-tutan proxy'lerle çalışmaz)
- Maliyet: ACU-saat başına 0,12 dolar (artı depolama ve G/Ç)

Değişken trafiğe sahip iş yükleri için—Nimbus'un Cuma sıçramaları vs Pazartesi sabahı sessizliği—Serverless v2 yoğun olmayan dönemlerde maliyetleri azaltır ve zirveleri önceden sağlamadan ele alır.

"Yani Cuma sıçraması sırasında," dedi Leo, "Aurora otomatik olarak yukarı ölçeklenir. Neredeyse hiç trafiğimizin olmadığı Pazar sabahı, minimuma geri ölçeklenir."

"Ve yalnızca kullandığımız kapasite için ödüyoruz," dedi Tom.

"Doğru."

Aurora Serverless v2'de bir ay sonra, Leo önceki hafta için ACU (Aurora Capacity Unit) grafiğini açtı.

Grafik iki belirgin kalıp gösterdi. Hafta boyunca, veritabanı 2-4 ACU'da çalıştı—arka plan sorguları, ECS sağlık kontrolleri, Glue ETL işleri ve geliştirme testinin sessiz bir uğultusu. Cuma akşamı 18:00 ile 22:00 arasında, ACU sayısı tırmandı:

```
Cuma 18:00  → 6 ACU
Cuma 19:00  → 14 ACU
Cuma 19:45  → 26 ACU  (zirve — NFL başlama vuruşundan önce pizza siparişleri fırlar)
Cuma 20:30  → 18 ACU
Cuma 21:00  → 12 ACU
Cuma 22:30  → 4 ACU
Cumartesi 02:00 → 2 ACU  (minimum)
```

Ölçeklendirme neredeyse anlıktı—Aurora Serverless v2, 0,5 ACU'luk artışlarla ölçeklenir ve yeni bir RDS örneği sağlamak için gereken dakikalar yerine saniyeler içinde kapasite ekleyebilir.

"O Cuma zirvesi ne kadara mal oldu?" diye sordu Tom.

ACU-saat başına 0,12 dolardan: Cuma zirvesi ortalama 18 ACU'da 4 saatti → zirve dönemi için 8,64 dolar. Haftanın geri kalanı ortalama 3 ACU × 164 saat × 0,12 $ = 59,04 $. Hafta için toplam: 67,68 $.

Cuma zirvesini ele almak için eşdeğer sağlanan örnek (db.r6g.xlarge, 4 vCPU, 32 GB) 0,937 $/saat × 168 saat = **hafta için 157,42 $** olurdu—Cuma zirvesi gerçekleşse de gerçekleşmese de.

"Serverless v2 hafta için 67 dolar. Zirve için boyutlandırılmış sağlanan bir örnek 157 dolar," dedi Tom. "Bu %57'lik bir azalma."

"Cuma günü dört saat boyunca meşru olarak 26 ACU ve haftanın geri kalanında 2 ACU kullanan bir veritabanında," dedi Leo. "Veritabanınız tüm hafta tutarlı yüksek yükte çalışırsa, sağlanan bir örnek daha ucuzdur. Tasarruflar değişkenlikten gelir."

Tom yavaşça başını salladı. Bunu notlarındaki bir kalıba ekliyordu: bu çeyrekteki her tasarruf hikâyesinin aynı şekli vardı. İhtiyaç duyabileceğiniz şey için değil, kullandığınız şey için ödersiniz. S3 yaşam döngüsü politikaları yalnızca her nesnenin hak ettiği depolama sınıfı için ödedi. Lambda yalnızca çağrı zamanı için ödedi. Fargate yalnızca görev CPU'su ve belleği için ödedi. Aurora Serverless v2 yalnızca veritabanının gerçekten tükettiği ACU'lar için ödedi.

Tom, tam olarak aradıkları şeyi bulan birinin ifadesine sahipti.

**Kötü Bir Göçten Kurtulma: Klonlar, PITR ve Geri Al Düğmesi**

Aurora'ya geçtikten iki hafta sonra, Sam üretimde bir veritabanı göç komut dosyası çalıştırdı. Komut dosyasının `menu_items` tablosundan `legacy_menu_format` sütununu kaldırması gerekiyordu. Onu, dahil ettiğini düşündüğü WHERE yan tümcesi olmadan çalıştırdı.

Sonuç bir sütun kaldırmak değildi. `menu_items` tablosundan 40.000 satırı temizleyen bir DELETE ifadesiydi—yaklaşık 200 restoran değerinde menü verisi, gitti.

Uyarı 30 saniye içinde tetiklendi. Sipariş arızaları fırladı. Menü hizmeti 200 restoran için boş sonuçlar döndürmeye başladı.

"Bir WHERE yan tümcesi olması gerekiyordu," dedi Sam, konsola bakarak.

Geleneksel kurtarma yolu: en son otomatik yedek anlık görüntüsünden geri yükle. Otomatik yedekler her 24 saatte bir çalışır ve tam bir geri yükle-ve-değiştir 20-40 dakika sürerdi—bu sırada *tüm* restoranlar karanlık olurdu, sadece etkilenen 200'ü değil—ve yedekten beri verilen her sipariş kaybolurdu.

Leo bunu yapmadı. Standart RDS gibi, Aurora da **noktaya-zamanda kurtarma (point-in-time recovery, PITR)** için sürekli yedekler tutar—kümeyi yedek saklama penceresi içindeki herhangi bir saniyeye geri yükleyebilirsiniz, sadece son gecelik anlık görüntüye değil. Ve kritik olarak, geri yükleme *yeni* bir küme oluşturur; siz kurtarırken üretim ayakta kalır.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Zaman damgası: 15:42:00Z—Sam göç komut dosyasını çalıştırmadan dört dakika önce. Kurtarma kümesi devreye girerken, üretimin geri kalanı etkilenmeyen restoranlara hizmet etmeye devam etti. Kullanılabilir olduğunda, Leo etkilenen 200 restoran için `menu_items` satırlarını kurtarma kümesinden dışa aktardı ve onları üretime geri ekledi. Uyarıdan tamamen geri yüklenmiş menülere kadar toplam süre: 40 dakikadan biraz az—ve tüm veritabanını değiştirmek yerine satırları cerrahi olarak onardığı için, 15:42'den sonra verilen hiçbir sipariş kaybolmadı. Kurtarma kümesi sonradan silindi; amacına hizmet etmişti.

"Ne kaybettik?" diye sordu Maya.

Kısaca boş menülere karşı verilen altı sipariş ödeme aşamasında başarısız olmuştu—hepsi SQS kuyruğundaydı ve yeniden oynatılabilirdi. Hiçbir müşteri verisi kalıcı olarak kaybolmadı.

"Ve **hızlı veritabanı klonlama** burada devreye giriyor," dedi Leo, sonradan ekibi bir araya getirerek. Aurora, veritabanı boyutundan bağımsız olarak, kopyala-yaz (copy-on-write) kullanarak dakikalar içinde bir kümenin **klonunu** oluşturabilir: klon orijinalin depolama katmanını paylaşır ve yalnızca yeni veya değişen sayfalar ek alan tüketir. Mevcut üretim veritabanının bir klonu ucuz, hızlı ve tamamen izoledir—klona yazmalar üretime asla dokunmaz.

"Bu da," dedi Priya, Sam'e bakarak, "göç komut dosyasının üretimde çalışmadan önce üretim verisinin bir klonuna karşı test edilmesi demek. Yeni kural bu."

Sam başını salladı. Onu zaten bir yapışkan nota yazmıştı.

Bu resme bir araç daha ait. Aurora MySQL—Aurora PostgreSQL değil—**Aurora Backtrack**'e sahiptir: kümeyi belirli bir noktaya, yeni bir kümeye geri yüklemeden, *yerinde* geri saran bir özellik. Nimbus'un kümesi Aurora MySQL olsaydı, Leo onu üç dakikadan kısa sürede 15:42'ye geri sarabilirdi—tüm kümeyi geri sarmak, silmeden sonra yazılan birkaç meşru siparişi de geri alırdı, ki cerrahi PITR yaklaşımı onları korudu.

"Peki birisi Backtrack—veya noktaya-zamanda geri yükleme—kullanarak içeri girmeye çalışırsa?" diye sordu Priya. "Bir saldırgan denetim günlüklerini veya uyumluluk verisini geri sarabilir mi?"

Backtrack `rds:BacktrackDBCluster` API izni gerektirir ve geri yüklemeler `rds:RestoreDBClusterToPointInTime` gerektirir—normal veritabanı işlemlerinden ayrı IAM eylemleri. Standart uygulama rollerinin bu izinleri yoktur. Yalnızca operasyon ekibi, açıkça izin veren IAM politikasıyla, bunları kullanabilirdi. Bunu IAM izinleri inceleme kontrol listesine ekledi.

Önemli uyarılar: Aurora Backtrack yalnızca Aurora MySQL uyumlu kümeler için kullanılabilir, PostgreSQL için değil. Backtrack penceresi küme oluşturmada yapılandırılır (1 saatten 72 saate, backtrack penceresinin her saati için ücret alınır). Ve Backtrack tüm kümeyi etkiler—bir tabloyu veya bir satır kümesini Backtrack edemezsiniz. Cerrahi satır düzeyinde kurtarma için—her iki motorda da—Leo'nun kullandığı geçici-kümeye-PITR yaklaşımı araçtır.

**Aurora Global Database: Çoklu Bölge Okumaları**

**Aurora Global Database**, Aurora'yı birden fazla AWS bölgesine genişletir:

- **Bir birincil bölge** tüm yazmaları ele alır
- **Beş ikincil bölgeye kadar** tipik olarak <1 saniye replikasyon gecikmesiyle okumalara hizmet eder
- İkincil bölgeler 1 dakikanın altında birincile terfi ettirilebilir (DR senaryoları için)

Nimbus'un küresel genişlemesi için, Aurora Global Database, Londra'daki bir restoran ortağının yerel menüsünü AB okuma replikasından sorgulamasına izin verirken, tüm siparişler (yazmalar) hâlâ ABD birincilinden geçer.

**RDS vs Aurora: Her Birini Ne Zaman Seçmeli**

| Faktör            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Maliyet           | Küçük iş yükleri için daha düşük | Daha yüksek taban, ama daha iyi ölçeklenir              |
| Uyumluluk         | Tam                           | MySQL/PostgreSQL uyumlu (küçük farklarla)                  |
| Maks replika      | 15 (her biri tam veri kopyası) | 15 (paylaşılan depolama birimi)                           |
| Replika gecikmesi | Saniyeler olabilir            | Genellikle <100ms                                         |
| Depolama          | Sabit sağlama                 | 128 TiB'a otomatik ölçeklenir (son sürümlerde 256 TiB)    |
| Geçiş süresi      | 60-120 saniye                 | <30 saniye                                                |
| Sunucusuz seçeneği | Sınırlı                      | Aurora Serverless v2                                       |
| En iyisi          | Kararlı, öngörülebilir iş yükleri | Değişken trafik, yüksek okuma hacmi, hızlı geçiş ihtiyacı |

**İlişkiselin Ötesinde: Amaca Yönelik Aile**

Bölüm 9 DocumentDB'yi (MongoDB uyumlu belgeler), Neptune'ü (graf ilişkileri) ve Keyspaces'i (Cassandra uyumlu geniş sütun) tanıttı ve bölüm 10 MemoryDB'yi (dayanıklı Redis uyumlu birincil veritabanı) tanıttı. İki isim daha aileyi tamamlar—onlarda derinliğe ihtiyacınız yok, sadece hangi veri şeklinin hangi motora işaret ettiğini tanıma yeteneğine, çünkü sürekli cevap seçenekleri olarak görünürler:

- **Amazon Timestream**: **zaman serisi** verisi—sensör okumaları, metrikler, telemetri. Sınav sinyali: "zaman içinde IoT ölçümleri." (Gerçek dünyada mevcut teklif Timestream for InfluxDB'dir; orijinal "LiveAnalytics" çeşidi 2025'te yeni müşterilere kapandı.)
- **Amazon QLDB**: onunla eski sorularda hâlâ "değişmez, kriptografik olarak doğrulanabilir defter" olarak karşılaşabilirsiniz. AWS QLDB'yi 2025'te durdurdu (bunun yerine Aurora PostgreSQL öneriyor)—onu bir yapı taşı değil, eski bir dikkat dağıtıcı olarak ele alın.

Bir beyaz tahtaya yazmaya değer kural: **ilişkisel satırlar → RDS/Aurora; ölçekte anahtar-değer → DynamoDB; belgeler → DocumentDB; ilişkiler → Neptune; zaman → Timestream; Cassandra → Keyspaces; dayanıklı Redis → MemoryDB.** Şekli eşleştirin ve soru kendini yanıtlar.

## Güçlü Yönler ve Sınırlamalar

**Aurora güçlü yönleri**:

- Standart RDS'den önemli ölçüde daha hızlı geçiş
- Minimal gecikmeyle 15 okuma replikasına kadar
- Otomatik ölçeklenen depolama
- Değişken iş yükleri için Serverless v2
- Çoklu bölge dağıtımı için Global Database

**Aurora sınırlamaları**:

- Küçük, kararlı iş yükleri için daha yüksek maliyet
- G/Ç fiyatlandırması yazma ağırlıklı iş yükleri için önemli olabilir (bunun için I/O-Optimized kullanın)
- Küçük MySQL/PostgreSQL uyumluluk farkları kod değişiklikleri gerektirebilir
- Serverless v2'nin otomatik duraklatmadan devamı (~15 saniye) ve hızlı yukarı ölçeklenmesi gecikme sıçramalarına neden olabilir

## Özet

Bölüm 23'teki S3 yaşam döngüsü çalışması, veriyi doğru depolama katmanına taşıyarak maliyetleri azalttı. Aurora bunun eşdeğerini işlem için yapar: zirve yükü için sağlayıp her zaman onun için ödemek yerine, Serverless v2 talebe uyacak şekilde ölçeklenir.

- **Okuma replikaları** okuma trafiğini birincilden dağıtır. Asenkron replikasyon—çoğu okuma için hafif gecikme kabul edilebilir. Yazma tutarlılığı gerektiren okumaları (yazma sonrası hemen okumalar, yönetici arayüzü okumaları) replikaya değil, birincile yönlendirin.
- **Aurora** depolama katmanını yeniden hayal eder: dağıtık, replikalar arasında paylaşılan, otomatik ölçeklenen.
- Aurora şunları sunar: 15 okuma replikası, <100ms replika gecikmesi, <30s geçiş, 128 TiB'a (son sürümlerde 256 TiB) otomatik ölçeklenen depolama.
- **Performance Insights**: nasıl ölçekleneceğine karar vermeden önce veritabanı yüküne neden olan belirli SQL sorgularını belirleyin. Eksik bir dizin, daha büyük bir örnek ihtiyacını ortadan kaldırabilir.
- **CloudWatch veritabanı metrikleri**: DatabaseConnections (doygunluğa yakın, uygulama bağlantı havuzlamasının bozuk olduğu anlamına gelir), CPUUtilization (sürekli yüksek CPU pahalı sorgular demektir), ReadLatency (zamanla bozulma genellikle eksik dizinli büyüyen bir tablodur).
- **Aurora Serverless v2**: işlemi 0,5 ACU'luk artışlarla otomatik ölçeklendirir. ACU-saat başına ücretlendirilir. Zirve ile yoğun olmayan dönem arasında yüksek değişkenliği olan iş yükleri için sağlanan örneklerden önemli ölçüde daha ucuz.
- **Noktaya-zamanda kurtarma (PITR)**: bir Aurora kümesini yedek saklama penceresi içindeki herhangi bir saniyeye geri yükleyin—*yeni* bir kümeye, böylece siz kayıp satırları cerrahi olarak geri kopyalarken üretim ayakta kalır.
- **Hızlı veritabanı klonlama**: boyuttan bağımsız olarak dakikalar içinde bir kümenin kopyala-yaz klonu. Ucuz, izole—göçleri üretimde çalışmadan önce üretim verisine karşı test etmek için kullanın.
- **Aurora Backtrack** (yalnızca MySQL uyumlu—PostgreSQL değil): kümeyi bir yedekten geri yüklemeden yerinde bir zaman noktasına geri sarın. 72 saate kadar pencereler için kullanılabilir. `rds:BacktrackDBCluster` IAM iznini gerektirir—operasyon ekibiyle sınırlandırın.
- **Aurora Global Database**: bir bölgede birincil, beş bölgeye kadar okuma replikaları.
- **Okuma replikası terfisi**: bölgeler arası okuma replikaları bölgesel DR için bağımsız birincillere terfi ettirilebilir. DR faydasını ikinci bir tam örnek çalıştırma maliyetiyle dengeleyin.
- Daha küçük, kararlı, öngörülebilir iş yükleri için RDS seçin. Ölçeğe, hızlı geçişe veya değişken trafik işlemeye ihtiyacınız olduğunda Aurora seçin.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.3)*

- **Aurora replikası vs RDS okuma replikası**: Aurora replikaları depolamayı paylaşır (sıfıra yakın gecikme, <30s geçiş). RDS okuma replikaları veriyi replike eder (gecikme mümkün, geçiş için dakikalar).
- **Aurora Serverless v2**: "veritabanı kapasitesini otomatik ölçeklendir," "öngörülemez veya ani veritabanı trafiği" → Aurora Serverless v2. Dikkat: tarihsel olarak yalnızca Serverless **v1** sıfıra ölçekleniyordu; v2'nin minimumu 2024 sonuna kadar 0,5 ACU'ydu, sonra v2 0 ACU'ya otomatik duraklatma kazandı. Eski sınav soruları hâlâ v2'nin sıfıra ölçeklenemeyeceğini varsayabilir.
- **Aurora Global Database**: "çoklu bölge veritabanı," "ABD birincilinden düşük gecikmeyle AB'den oku," "bölgesel geçiş için RTO < 1 dakika" → Aurora Global Database.
- **Geçiş zamanlaması**: Aurora < 30 saniye. RDS Multi-AZ 60-120 saniye. İkisini de bilin.
- **Veri şekline göre amaca yönelik veritabanları**: "sosyal graf / öneriler / dolandırıcılık halkaları" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "zaman serisi / IoT telemetri" → Timestream. "Redis uyumlu *birincil* veritabanı (dayanıklı)" → MemoryDB (vs ElastiCache = önbellek). "Değişmez kriptografik defter" → eski sorularda QLDB (2025'te durduruldu).
- **Aurora I/O-Optimized**: Daha yüksek depolama ve örnek maliyeti, G/Ç başına ücret yok. G/Ç maliyetleri baskın olduğunda (yazma ağırlıklı) kullanın. Standart Aurora: daha düşük depolama maliyeti, G/Ç başına ödeyin. Okuma ağırlıklı için kullanın.
- **Aurora Backtrack**: Veritabanını bir yedek anlık görüntüsünden geri yüklemeden belirli bir zaman noktasına yerinde geri sarın. Yalnızca MySQL uyumlu Aurora için kullanılabilir—Aurora PostgreSQL için, cevap noktaya-zamanda geri yükleme (yeni bir kümeye) veya hızlı bir klondur. Sınav sinyali: "yanlışlıkla silinen veri, tam bir yedek geri yüklemeden hızlıca kurtarmak gerekiyor" + MySQL → Backtrack.
- **Aurora hızlı veritabanı klonlama**: veritabanı boyutundan bağımsız olarak dakikalar içinde kopyala-yaz klon. Sınav sinyali: "üretim verisinin bir kopyasına karşı hızlı ve ucuz test et" → klon, anlık görüntü-geri yükleme değil.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Aurora ile standart RDS okuma replikaları arasındaki farkı açıklayın. Aurora'nın replikasyon gecikmesi neden tipik olarak daha düşüktür?

*(İpucu: Temel fark paylaşılan depolama vs veri replikasyonudur. Bir yazma geldiğinde her replikanın ne yapması gerektiğini düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir sosyal medya platformunun MySQL veritabanı, artan trafik nedeniyle yüksek okuma gecikmesi yaşıyor. Uygulama okuma ağırlıklıdır (%95 okuma, %5 yazma). Ekibin trafik sıçramaları sırasında bile okuma gecikmesinin tutarlı olmasına ihtiyacı var. Minimal kesintiyle otomatik geçişe ihtiyaçları var (hedef RTO < 30 saniye). Veri hacmi öngörülemez şekilde büyüyor.

Bu gereksinimleri EN İYİ hangi veritabanı çözümü karşılar?

A) Beş okuma replikalı RDS MySQL Multi-AZ  
B) Aurora Replikaları ve Aurora Serverless v2 ile Aurora MySQL  
C) Daha büyük bir örnek türüyle RDS MySQL (dikey ölçeklendirme)  
D) Okuma önbelleğe alma için DynamoDB DAX ile DynamoDB

**İpucu 1**: "RTO < 30 saniye"—hangi hizmet bunu başarır? Her seçeneğin geçiş zamanlamasını kontrol edin.

**İpucu 2**: "Sıçramalar sırasında tutarlı okuma gecikmesi"—hangi hizmetin replikaları sıfıra yakın gecikmeye karşı potansiyel saniyeler gecikmeye sahip?

**İpucu 3**: "Öngörülemez şekilde büyüyen veri hacmi"—hangi hizmet depolamayı otomatik ölçeklendirir?

**Cevap**: B

**Açıklama**: Aurora Replikaları ile Aurora MySQL, yük altında tutarlı okuma performansı için sıfıra yakın replikasyon gecikmesi (saniyeler değil, milisaniyeler) sağlar. Aurora Serverless v2, aşırı sağlama olmadan trafik sıçramaları sırasında işlemi otomatik ölçeklendirir. Aurora depolaması veri büyüdükçe otomatik ölçeklenir. Aurora geçişi (bir replikanın terfisi) 30 saniyenin altında tamamlanır—RTO gereksinimini karşılar.

**Neden A değil?** RDS Multi-AZ geçişi 60-120 saniye sürer—RTO < 30 saniyeyi karşılamaz. Standart RDS okuma replikası gecikmesi yük altında saniyelere ulaşabilir—"tutarlı" okuma gecikmesini garanti etmek daha zordur.

**Neden C değil?** Dikey ölçeklendirme (daha büyük örnek) kapasiteyi artırır ama okuma yükünü dağıtmaz. Veritabanı okumalar için tek bir arıza noktası olarak kalır.

**Neden D değil?** DynamoDB NoSQL'dir—MySQL'den DynamoDB'ye göç, veri modelini ve uygulama sorgularını yeniden mimari yapmayı gerektirir, ki bu bu performans iyileştirme görevinin kapsamının çok ötesindedir.

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama — Görev 3.3*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus küresel bir genişleme tasarlıyor. Doğu Kıyısı'ndaki, Almanya'daki ve Avustralya'daki restoran ortaklarının kendi sipariş verilerini bölgeler arası gecikme olmadan hızlıca görmesini istiyorlar. Ancak tutarlılığı korumak için tüm yazmalar tek us-west-2 birincilinden geçmeli.

Aurora kullanarak veritabanı mimarisini tasarlayın. Global Database'i nasıl yapılandırırdınız—örneğin, us-east-1, eu-central-1 ve ap-southeast-2'de ikincil kümeler? us-west-2 birincili çökerse ne olur? Terfi sürecini nasıl ele alırdınız?

*(Tek bir doğru cevap yoktur. Amaç, çoklu bölge veritabanı tasarımı pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Leo Serverless v2 ile Aurora'ya göç etti.

Cuma sıçraması geldi ve gitti. CPU asla %60'ı geçmedi. Sorgu gecikmesi tutarlı kaldı. Aurora yükü ele almak için otomatik olarak yukarı ölçeklenmiş, sonra yoğunluktan sonra geri aşağı ölçeklenmişti.

"Bu geçen Cuma'ya kıyasla ne kadara mal oldu?" diye sordu Tom Pazartesi sabahı.

Leo faturalandırma gezginini açtı. "Cuma akşam zirvesi boyunca ortalama yaklaşık 2,16 $/saatti. Cumartesi sabahı 0,24 $/saatti."

Tom hiçbir şey söylemedi.

"Eski kurulum yükten bağımsız sabit 0,47 $/saatti," diye ekledi Leo.

"Yani sıçrama sırasında öncekinden daha fazla ödedik," dedi Tom.

"Evet. Ama yoğun olmayan dönemde önemli ölçüde daha az. Hafta boyunca net maliyet daha düşük."

Tom hesapladı. Sonra başını salladı.

"Burada bir ders var," dedi. "Doğru soru 'bu daha ucuz mu?' değil. 'Bu, gerçek kullanım kalıbımız için daha ucuz mu?'"

"Bu," dedi Priya odanın diğer ucundan, "bir kıdemli mühendisin içgüdüsüdür."

Tom bu şekilde tanımlanmaktan biraz endişeli görünüyordu.

Sonraki bölümde: ağınız darboğaz olduğunda ve neden özel bir otoyolun gişe parasına değebileceği.
