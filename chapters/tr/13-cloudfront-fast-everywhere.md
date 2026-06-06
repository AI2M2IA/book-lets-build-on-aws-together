# Bölüm 13: Her Yerde Hızlı

Oregon'daki bir sunucudan Boston'daki bir telefona giden bir fotoğraf, kabaca 4.100 kilometre fiber optik kablo kat eder. Işık hızının üçte ikisinde, bu yaklaşık 25 milisaniyelik saf fiziktir — kaçınılmaz, pazarlık konusu olmayan, evrenin yasalarına işlenmiş.

Sonra gidiş-dönüşü ekleyin. Sonra işleme süresini ekleyin. Tarayıcı henüz render etmeye başlamadı ve 80 milisaniye çoktan gitti.

---

*`eatnimbus.com` canlıydı ve alan adı gerçekti. Kullanıcılar uygulamayı bulabiliyordu. Ama onu bulmak, ondan keyif almakla aynı şey değildi. Tom farklı şehirlerden gecikme ölçümleri çalıştırıyordu ve Doğu Yakası ile Güney Amerika'dan gelen sayılar iyi değildi. Alan adı sorunu çözülmüştü. Fizik sorunu çözülmemişti.*

---

`eatnimbus.com` canlıydı. Leo Doğu Yakası kullanıcılarından gecikme metriklerini kontrol etmişti: istek başına 80-100 milisaniye. Bu küçük gelebilir ama birikir.

Menüyü yükle: 90ms. Restoran listesini yükle: 80ms. Restoranın fotoğraflarını yükle: 200ms (resimler büyük). Bir kullanıcının sipariş verebilmesinden önceki toplam süre: iyi bir bağlantıda yarım saniyeden fazla.

"Sorun fizik," dedi Leo. "Sunucular Oregon'da. Büyüme Doğu Yakası'nda — ve São Paulo'da."

"O zaman sunucuları Doğu Yakası'na taşı," dedi Tom.

"Bu para tutar."

"Bu ayda ne kadar maliyet çıkarıyor?" diye sordu Tom.

"us-east-1'de altyapımızın tam bir kopyasını çalıştırmak mı? Muhtemelen mevcut maliyetlerimizin üç katı. Ve bu, tamamen yeni bir sorun yaratır: Batı Yakası veritabanı ile Doğu Yakası veritabanını senkronize tutmak."

Priya dizüstü bilgisayarından başını kaldırdı. "Ya da sunucuları taşımayız. *İçeriği* taşırız."

Maya başını kaldırdı. "Fark ne? İçerik bir sunucudaysa ve sunucu Oregon'daysa, içerik Oregon'dadır."

"Bir sayfanın sunduğu şeyin çoğu statiktir," dedi Priya. "Resimler, stil sayfaları, JavaScript dosyaları, yazı tipleri. Bunlar her kullanıcı için aynıdır. Veritabanından gelmezler. S3'te yaşarlar. Ve S3 nesneleri her yerden sunulabilir."

"Yani onları kullanıcılara daha yakın sunuculara mı kopyalıyoruz?"

"Bunu bizim için bir hizmetin yönetmesine izin veririz. Bir gerçeğin kaynağı. İhtiyaç duyulan her yerde kopyalar."

Tom fiyatlandırma sayfasını çoktan açmıştı. Priya açıklamayı bitirmeden hesaplıyordu.

**Önceden Stoklanmış Depo Analojisi**

Bulut şirketini değil, perakendeci Amazon'u hayal edin. Tek bir konumda her ürünün bulunduğu devasa bir depoları var. Her siparişi o tek depodan gönderseler, uzak şehirlerdeki müşteriler günlerce beklerdi.

Bunun yerine, Amazon'un büyük nüfus merkezlerinin yakınında lojistik merkezleri var. Bir ürün popülerse, o yerel depoları önceden stoklarlar. Seattle'daki bir müşteri bir kitap sipariş ettiğinde, ülkenin diğer ucundan değil — yerel lojistik merkezinden gönderilir.

Bu bir **İçerik Dağıtım Ağıdır (CDN)**: içeriğinizin kopyalarını kullanıcılarınıza yakın önbelleğe alan, coğrafi olarak dağıtılmış sunuculardan oluşan bir ağ.

Boston'daki bir kullanıcı ana sayfanızı istediğinde, CDN onu Boston'daki bir sunucudan sunar. Oregon'dan değil. İstek hiçbir zaman ülkeyi kat etmez.

**CloudFront ile Tanışın**

Amazon CloudFront, AWS'nin CDN'sidir. Dünyanın dört bir yanındaki şehirlerde konumlandırılmış önbellekleme sunucularından oluşan **edge konumları** küresel ağı aracılığıyla çalışır. Bu yazının yazıldığı sırada, 100'den fazla şehirde 750'den fazla varlık noktası var.

CloudFront'u yapılandırdığınızda, bir **origin** belirtirsiniz: gerçek içeriğinizin kaynağı. Origin'iniz şu olabilir:

- Bir S3 paketi (statik dosyalar: resimler, CSS, JavaScript, PDF'ler)
- Bir Application Load Balancer (uygulamanızdan dinamik içerik)
- Bir EC2 örneği
- İnternette herhangi bir yerdeki bir HTTP sunucusu

CloudFront origin'inizin önünde durur. İstekler en yakın edge konumuna gelir. Edge içeriği önbelleğe almışsa, hemen döndürür. Almamışsa (bir *önbellek ıskası*), origin'inizden getirir, önbelleğe alır ve döndürür.

**CloudFront Önbellekleme Nasıl Çalışır**

Herhangi bir içerik parçası için ilk istek her zaman bir önbellek ıskasıdır — origin'e gider. Sonraki her istek edge konumundaki önbelleğe çarpar.

Nimbus için, menü fotoğrafları mükemmel CloudFront adaylarıdır. Restoran fotoğrafları seyrek değişir (belki restoran profilini güncellediğinde). CloudFront ile:

1. Boston'daki kullanıcı `images.eatnimbus.com/restaurant-047/photo.jpg` ister
2. CloudFront Boston'daki edge konumunu kontrol eder — henüz önbelleğe alınmamış (önbellek ıskası)
3. CloudFront us-west-2'deki S3'ten getirir (~80ms)
4. CloudFront fotoğrafı Boston edge konumunda saklar
5. Boston'daki sonraki kullanıcı aynı fotoğrafı ister
6. CloudFront yerel edge önbelleğinden sunar (~5ms)

İlk istek için aynı 80ms cezası. Ama aynı şehirden bininci istek 5 milisaniyedir.

CloudFront'ta **Cache-Control başlıkları** ve **TTL ayarları**, içeriğin edge'de ne kadar süre önbellekte kalacağını belirler. Resim dosyaları saatler veya günlerce önbelleğe alınabilir. HTML sayfaları (daha sık değişen) dakikalar veya saniyeler önbelleğe alınabilir.

Şunu merak ediyor olabilirsiniz: bir CDN kullanmak yerine neden tüm uygulamayı birden çok bölgede barındırmıyoruz? Veri Oregon'daysa, neden tam bir kopyayı New York, Tokyo ve São Paulo'ya koymuyoruz? Koyabilirsiniz. Ama bu, birden çok veritabanını senkronize tutmak, bölgeler arası dağıtımları aynı anda yönetmek, bölgelerin anlaşamadığı bölünmüş beyin senaryolarını ele almak demektir. Bir CDN, statik ve yarı statik içerik için çok daha basit bir cevaptır: bir origin, edge'de birçok önbelleğe alınmış kopya. Çok bölgeli karmaşıklığı yalnızca kullanıcıya yakın gerçekten bilgi işlem veya veritabanı işlemleri gerektiğinde eklersiniz — çoğu içerik için edge önbellekleme yeterlidir.

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya. "Neden Oregon'da daha büyük bir ElastiCache kümesi eklemek yerine önbelleği edge'e koyalım?"

"Çünkü sorun hâlâ fizik," dedi Priya. "Oregon bir milisaniyede yanıt verse bile, o yanıt yine de Boston'a gitmek zorunda. Gidiş-dönüş süresi en az 70 milisaniye — ışık hızı sunucularımızın ne kadar hızlı olduğunu umursamaz. Edge önbellekleme cevabı soruya yaklaştırır."

**Dinamik İçerik: Önbelleklemeden Fazlası İçin CloudFront**

"Peki ya API yanıtlarımız?" diye sordu Leo. "Onlar dinamik — kullanıcı başına, istek başına değişirler. Bir sipariş geçmişi sayfasını önbelleğe alamazsınız."

Doğru. Ama CloudFront yine de dinamik içerikle yardımcı olur.

İçerik önbelleğe alınamasa bile, CloudFront isteği edge konumundan origin'e AWS'nin özel omurga ağı üzerinden yönlendirir — AWS altyapısını küresel olarak bağlayan yüksek hızlı fiber. Bu, trafiğin birden çok taşıyıcıdan sıçrayabileceği herkese açık internet üzerinden yönlendirmekten daha hızlı ve daha güvenilirdir.

Sonuç: dinamik istekler, herkese açık internet üzerinden doğrudan origin'e gitmekten CloudFront üzerinden hâlâ %20-40 daha hızlıdır. Önbellekleme yüzünden değil, ağ yolu yüzünden.

"Bu mantıklı değil," dedi Maya. "API yanıtı yine de Oregon'dan edge'e ve sonra Boston'a gitmek zorundaysa, bu Oregon'dan Boston'a doğrudan gitmekten nasıl daha hızlı?"

"İki neden," dedi Priya. "Birincisi, AWS'nin özel omurgası herkese açık internetten daha hızlı ve daha güvenilirdir. Herkese açık internet trafiği birden çok taşıyıcıdan geçer, her biri kendi gecikmesini ve değişkenliğini ekler. Omurga doğrudan, düşük gecikmeli fiberdir. İkincisi, SSL sonlandırması edge'de gerçekleşir. Kullanıcı en yakın CloudFront edge konumuna bir TLS bağlantısı kurar — el sıkışma hızlıdır. CloudFront sonra origin'e kalıcı, önceden kurulmuş bir bağlantı tutar. Bir uzun mesafeli bağlantı yerine iki kısa mesafeli bağlantı."

"Yani önbelleğe alınmamış içerik için bile, CloudFront bağlantı yükünden zaman tıraşlar," dedi Leo.

"Genellikle yüzde on ila kırk. Önbellekleme kadar dramatik değil. Ama gerçek."

Ek olarak, CloudFront şunları sağlar:

**SSL/TLS sonlandırması**: CloudFront HTTPS'i edge'de ele alır. Kullanıcı ile CloudFront arasındaki bağlantı şifrelidir. CloudFront origin'inize dahili olarak HTTP üzerinden (origin yükünü azaltarak) veya HTTPS üzerinden (uçtan uca şifreleme için) bağlanabilir.

**DDoS koruması**: CloudFront, AWS Shield Standard ile entegredir. Yüzlerce edge konumuna dağıtılmış trafik, saldırıların origin'inizi dövmek yerine edge'de emildiği anlamına gelir.

**Coğrafi kısıtlama**: Belirli ülkelerden erişimi engelleyin. Nimbus yalnızca belirli pazarlarda lisanslıysa, CloudFront bunu, istek hiçbir zaman sunucularınıza ulaşmadan edge'de uygulayabilir.

**Peki ya biri CDN üzerinden içeri girmeye çalışırsa?** diye sordu Priya. "Önbellek zehirlenmesi — ya birisi edge önbelleğine kötü içerik enjekte etmeyi başarırsa?"

"CloudFront'un önbellek anahtarı kontrolleri var," dedi Leo. "İki isteğin aynı önbelleğe alınmış yanıtı alıp almayacağını hangi özniteliklerin belirlediğini tam olarak tanımlarsınız. Başlıklar, sorgu dizeleri, çerezler. Bir saldırgan tam önbellek anahtarını eşleştirmeden farklı bir önbelleğe alınmış yanıt enjekte edemez."

"Ve Origin Access Control, S3 paketinin CloudFront üzerinden gelmeyen hiçbir şeyi sunmayacağı anlamına gelir," dedi Priya. "İki yerine bir saldırı yüzeyi."

**CloudFront Davranışları: İnce Taneli Önbellekleme Kuralları**

Bir CloudFront dağıtımı birden çok **davranışa** sahip olabilir — URL desenlerine dayalı yönlendirme kuralları.

Nimbus için:

- `/images/*` → Edge'de 7 gün önbelleğe al (fotoğraflar sık değişmez)
- `/static/*` → Edge'de 30 gün önbelleğe al (sürümlenmiş dosya adlarıyla CSS ve JavaScript)
- `/api/*` → Önbelleğe alma; doğrudan yük dengeleyiciye ilet
- `/*` → 5 dakika önbelleğe al (HTML sayfaları)

Bu, CloudFront'un akıllı olmasını sağlar: stabil olanı agresif önbelleğe al, dinamik olanı geçir.

Davranışlar en spesifikten en az spesifiğe doğru eşleştirilir. `/images/hero.jpg`, `/*` ile eşleşmeden önce `/images/*` ile eşleşir. En alttaki her şeyi yakalayan `/*` varsayılandır — daha spesifik bir desenle eşleşmeyen her şey için geçerlidir.

"Kimliği doğrulanmış ve doğrulanmamış kullanıcılar için farklı önbellekleme istersek?" diye sordu Priya. "Aynı URL, bir kullanıcının giriş yapıp yapmadığına bağlı olarak farklı içerik döndürebilir."

"O zaman oturum çerezini önbellek anahtarına dahil edersin," dedi Leo. "Ama bu, her giriş yapmış kullanıcının kendi önbellek girişini aldığı anlamına gelir. Kimliği doğrulanmış içerik için isabet oranın çöker."

"Bu yüzden kimliği doğrulanmış içeriği herkese açık içerikten URL düzeyinde ayırırsın," dedi Priya. "Kimlik doğrulama gerektiren her şey `/app/*`'a gider ve önbelleğe alınmaz. Herkese açık içerik `/browse/*`'a gider ve agresif önbelleğe alınır. Tek net sınır."

Ders: CloudFront, URL yapınız önbellekleme amacını yansıttığında en iyi çalışır. Tamamen herkese açık, statik veriye işaret eden URL'ler, kişiselleştirilmiş, dinamik veri döndüren URL'lerden farklı görünmelidir. CloudFront'a aynı görünürlerse, ya önbellek bozulur ya da yanlış içerik sunulur.

Leo bir hafta sonunda Nimbus URL şemasını yeniden yapılandırdı. Gözat uç noktaları `/browse/`'a taşındı. API uç noktaları `/api/`'ye taşındı. Kimliği doğrulanmış uygulama arayüzü `/app/`'a taşındı. Üç davranış, üç net önbellekleme politikası, sıfır belirsizlik.

"Biraz refactor," dedi.

"Doğru yapı," dedi Priya. "Sonunda ona ihtiyacın olacaktı."

**Origin Access Control: CloudFront ile S3'ü Güvene Almak**

S3 paketiniz yalnızca CloudFront üzerinden sunulması gereken (doğrudan değil) özel içerik barındırıyorsa, S3'ün CloudFront'tan gelmeyen istekleri reddettiğinden emin olmak için **Origin Access Control (OAC)** kullanabilirsiniz.

Bu şekilde:

- `d1234abcd.cloudfront.net/image.jpg` → Sunulur (CloudFront'un izni var)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Engellenir (doğrudan S3 erişimi reddedildi)

İçeriğinize yalnızca dağıtımınız üzerinden, önbellek kurallarınız ve güvenlik ayarlarınız uygulanmış olarak ulaşılabilir.

---

**Eski Fotoğraf Olayı**

Restoran 112 — Eastside'daki Kolombiya mekânı — bir perşembe sabahı desteğe e-posta gönderdi. Bir müşteri, sahibi iki gün önce yeni bir tane yüklemiş olmasına rağmen restoranın ana fotoğrafının hâlâ eski cepheyi gösterdiğinden şikayet etmişti.

Leo CloudFront dağıtım ayarlarını açtı.

`/images/*` davranışının yedi günlük bir TTL'si vardı. Restoran ortağı portalı iki gün önce yeni bir fotoğraf yüklemiş, aynı S3 anahtar yolundaki dosyanın yerini almıştı: `restaurant-112/hero.jpg`. Eski dosya S3'ten gitmişti. Ama CloudFront onu son yedi günde getirmiş olan her edge konumunda hâlâ önbellekten sunuyordu.

"İçeriği origin'de değiştirdik," dedi Leo. "Ama CloudFront bunu bilmiyor. Önbelleğe alınmış bir kopyası var ve yedi gün boyunca kontrol etmeyecek."

"Zaten dağıttım — ah." S3 dosyasını değiştirmenin CloudFront önbelleğini otomatik olarak yenileyeceğini varsaymıştı. Yenilemez. CloudFront'un bir S3 anahtarındaki içeriğin değiştiğini tespit edecek bir mekanizması yoktur — TTL dolana kadar önbelleğe aldığı her neyse onu sunar.

İki seçenek:

**Seçenek bir: Geçersizleştirme.** CloudFront'a `/images/restaurant-112/hero.jpg` için bir geçersizleştirme isteği gönder. CloudFront o yolu tüm edge konumlarında eski olarak işaretler. O yol için sonraki istek S3'ten taze içerik getirir. Maliyet: her ay ilk 1.000 geçersizleştirme yolu ücretsizdir; bunun ötesinde *yol başına* 0,005 dolar. Bir dosya için ücretsiz. Toplu bir güncelleme sırasında binlerce dosyayı geçersizleştirmek için maliyetler birikir.

**Seçenek iki: Sürümlenmiş dosya adları.** `hero.jpg` yerine dosyayı `hero-v2.jpg` olarak adlandır. Veritabanındaki referansı güncelle. CloudFront'un `hero-v2.jpg` için önbelleğe alınmış girişi yoktur — ilk istek onu S3'ten getirir ve kullanıcılar onu hemen görür. Eski `hero.jpg` önbellekte kalır ama artık hiçbir yerde referans verilmez. Yedi gün sonra doğal olarak süresi dolar.

"Kullanıcı tarafından yüklenen içerik için," dedi Priya, "sürümlenmiş adlar doğru desendir. Dosya adına bir hash veya zaman damgası ekle. Her yeni yükleme yeni bir önbellek girişidir. Geçersizleştirme maliyeti yok, eski içerik yok."

Leo ortak portalını güncelledi. Yeni yüklemeler artık `hero-{timestamp}.jpg` olarak saklanacaktı. Veritabanı kaydı yeni yolla güncellendi. Eski önbelleğe alınmış yol alakasızdı.

"Peki dağıtım durumu?" diye sordu Maya. "Uygulamanın yeni bir sürümünü gönderdiğimizde ve JavaScript değiştiğinde?"

"Aynı ilke," dedi Priya. "Webpack gibi derleme araçları hash'lenmiş dosya adları üretir: `app.a3b9c2d4.js`. Yeni bir sürüm dağıt ve hash değişir: `app.f7e1b3c5.js`. CloudFront her ikisini de önbellekten sunar — eski kullanıcılar eski dosyayı alır, yeni kullanıcılar yeni dosyayı alır. Geçersizleştirme yok, koordinasyon sorunu yok."

"HTML sayfası mevcut hash'e referans verir," dedi Leo. "Yani yeni kullanıcılar yeni JS hash'iyle yeni HTML alır ve CDN doğru dosyayı sunar."

"Standart uygulama," diye onayladı Priya.

---

**Gerçek Sayılarla Gecikme**

Tom üç şehirden gecikme ölçümleri çalıştırıyordu.

| Konum | CloudFront'suz | CloudFront ile | İyileşme |
|---|---|---|---|
| Seattle | 15ms | 12ms | %20 |
| New York | 80ms | 10ms | %88 |
| São Paulo | 290ms | 35ms | %88 |
| Tokyo | 260ms | 28ms | %89 |

"İyileşme, fizik sorununun en kötü olduğu yerde en büyük," diye gözlemledi Tom. "São Paulo'dan Oregon'a iki yüz milisaniyeden fazla. Bu, sadece konuşmaya başlamak için, saniyenin dörtte birinden fazla."

"Ve içerik ikinci kez São Paulo'ya hiç ulaşmaz," dedi Leo. "São Paulo'daki ilk kullanıcı Oregon'dan getirir ve onu yerel olarak önbelleğe alır. Ondan sonraki her kullanıcı otuz beş milisaniye alır."

"São Paulo'daki ilk kullanıcı maliyeti yer," dedi Tom. "Herkes faydalanır."

"CDN'ler böyle çalışır," dedi Priya. "İlk istek önbelleği doldurur. Ondan sonra her önbellek isabeti neredeyse ücretsizdir."

Küresel ürünler için ima önemlidir. CloudFront olmadan, Tokyo'da ana resminiz için 260 milisaniye bekleyen bir kullanıcı, fizik yüzünden bekliyor — fiber optik kablolar ve ışık hızı. CloudFront ile, o resmin bir kopyasını Tokyo'ya koyarsınız ve fizik sorunu esasen ortadan kalkar.

---

**Birden Çok Origin: ALB ve S3 Birlikte**

"Resimlerimiz S3'te ve API'miz yük dengeleyicide," dedi Maya. "İki CloudFront dağıtımına ihtiyacımız var mı?"

"Hayır," dedi Leo. "Bir dağıtım, birden çok origin."

Tek bir CloudFront dağıtımı farklı URL desenlerini farklı origin'lere yönlendirebilir. Bu çoklu origin desenidir:

```
eatnimbus.com/*         → Origin: us-west-2'de ALB (dinamik içerik)
eatnimbus.com/images/*  → Origin: S3 paketi (statik resimler)
eatnimbus.com/static/*  → Origin: S3 paketi (CSS, JS, yazı tipleri)
```

CloudFront davranışları spesifiklik sırasına göre değerlendirir. `/images/hero.jpg`'ye bir istek `/images/*` davranışıyla eşleşir ve S3'e gider. `/api/orders`'a bir istek her şeyi yakalayan `/*` ile eşleşir ve ALB'ye gider.

Fayda: bir alan adı, bir SSL sertifikası, bir CloudFront dağıtımı, birden çok arka uç. Kullanıcılar birleşik bir alan adı görür. Yönlendirme onlara görünmez.

Aynı zamanda garantili bir sınav gerçeği olan bir operasyonel detay: o SSL sertifikası AWS Certificate Manager'dan (ACM) gelir ve **CloudFront tarafından kullanılan bir sertifika `us-east-1`'de istenmeli veya içe aktarılmalıdır** — origin'lerinizin nerede yaşadığından bağımsız olarak. CloudFront, kontrol düzlemi us-east-1'de yaşayan küresel bir hizmettir; us-west-2'de duran bir sertifika dağıtımın açılır menüsünde görünmez. (ALB gibi bölgesel hizmetler için, sertifika ALB'nin kendi bölgesinde yaşar.)

"Ve ALB herkese açık değil mi?" diye sordu Priya.

"Yalnızca CloudFront ALB ile konuşur," dedi Leo. "ALB'nin güvenlik grubunu CloudFront'un yönetilen önek listesiyle kısıtlarız. İnternetten ALB'ye doğrudan bağlantılar engellenir."

"Yani uygulamaya ulaşmanın tek yolu CloudFront."

"Bu da WAF kurallarının, SSL sonlandırmanın ve DDoS korumasının bize ulaşmadan önce tüm trafiğe uygulanması demek."

---

**CloudFront Functions vs Lambda@Edge**

"Edge'de bir URL'yi yeniden yazmamız gerekirse ne yapacağımızı düşündük mü?" diye sordu Priya. "Veya her yanıta bir güvenlik başlığı eklemek?"

"Bunu uygulamada yapamaz mıyız?" diye sordu Leo.

"Yapabiliriz. Ama edge'de — CloudFront önbellekten sunmadan önce — gerçekleşirse, origin'e bir gidiş-dönüş tasarruf ederiz."

CloudFront edge'de kod çalıştırmak için iki mekanizmayı destekler:

**CloudFront Functions**, her edge konumunda çalışan hafif JavaScript işlevleridir. Milisaniye altı sürede çalışırlar, saniyede milyonlarca isteği ele alırlar ve basit dönüşümler için tasarlanmışlardır: URL yeniden yazma, başlık manipülasyonu, sorgu dizesi normalleştirme, basit yönlendirmeler. Görüntüleyen isteklerinde ve görüntüleyen yanıtlarında (kullanıcının bakış açısından önbellekten önce ve sonra) çalışabilirler. Ağ çağrıları yapamazlar. Maliyet: milyon çağrı başına 0,10 dolar.

**Lambda@Edge**, gerçek Lambda işlevlerini CloudFront'un bölgesel edge konumlarında çalıştırır (her pop'ta değil, küresel olarak düzinelerce büyük olanda). Lambda@Edge ağ çağrıları yapabilir, veritabanlarına erişebilir, dinamik yanıtlar üretebilir, karmaşık kimlik doğrulama mantığı yapabilir. Görüntüleyen isteklerinde, origin isteklerinde, origin yanıtlarında ve görüntüleyen yanıtlarında çalışır — istek yaşam döngüsünde size dört müdahale noktası verir. Maliyet: CloudFront Functions'tan daha yüksek, istek ve süreye göre faturalandırılır.

Zihinsel model:

| Kullanım durumu | Araç |
|---|---|
| `/old-path`'i `/new-path`'e yeniden yaz | CloudFront Functions |
| `Strict-Transport-Security` başlığı ekle | CloudFront Functions |
| Önbellek aramasından önce sorgu dizelerini normalleştir | CloudFront Functions |
| A/B testi: görüntüleyen isteğinde bir test çerezi ata | CloudFront Functions |
| A/B testi: kullanıcıların %10'unu farklı bir origin'e yönlendir | Lambda@Edge (origin isteği — CloudFront Functions origin'i değiştiremez) |
| Bir JWT token'ı doğrula (kripto kütüphanesi gerektirir) | Lambda@Edge |
| Edge'de bir veritabanından kişiselleştirilmiş içerik getir | Lambda@Edge |
| Edge'de talep üzerine bir resim küçük resmi oluştur | Lambda@Edge |

Nimbus için: her yanıta güvenlik başlıkları eklemek için bir CloudFront Function kullandılar — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. İki düzine satır JavaScript. Milisaniye altı çalıştırma. Origin gidiş-dönüşü gerekmedi.

"Başlıkları bir kıdemsiz mühendise açıklamak," dedi Leo, "işlevi yazmaktan daha uzun sürerdi."

---

**Fiyat Sınıfları: Hangi Edge Konumlarını Seçmek**

"Bunun ölçekte ne kadar maliyet çıkardığını düşündük mü?" diye sordu Tom, CloudFront fiyatlandırma sayfasında gezinerek.

"Bu ayda ne kadar maliyet çıkarıyor?" burada teknik olarak iki soruydu. Birincisi: CloudFront ne ücretlendiriyor? İkincisi: dünyadaki her edge konumuna ihtiyacınız var mı?

CloudFront veri aktarımı fiyatlandırması bölgeye göre değişir. Kuzey Amerika ve Avrupa'daki edge konumlarından sunulan trafik en ucuzdur. Güney Amerika, Asya Pasifik, Avustralya ve Hindistan'dan trafik daha pahalıdır — çünkü altyapı orada daha pahalıdır.

AWS dağıtımınız için bir **fiyat sınıfı** seçmenize izin verir:

- **Price Class All**: Küresel olarak tüm edge konumlarını kullanır. Her yerde en iyi performans. Kuzey Amerika ve Avrupa dışındaki bölgeler için en yüksek veri aktarım maliyeti.
- **Price Class 200**: Çoğu edge konumunu kullanır (Kuzey Amerika, Avrupa, Asya, Orta Doğu, Afrika). En pahalı Güney Amerika ve bazı Okyanusya konumlarını hariç tutar.
- **Price Class 100**: Yalnızca Kuzey Amerika ve Avrupa edge konumlarını kullanır. En ucuz. São Paulo, Tokyo ve Sydney'deki kullanıcılar yine sunulur — ama en yakınlarından değil, Kuzey Amerika veya Avrupa edge'inden.

"Yani Price Class 100'ü seçersek," dedi Tom, "São Paulo'daki bir kullanıcı... Miami'den mi sunulur? New York'tan mı?"

"En yakın dahil edilen edge neredeyse oradan. Oregon'a doğrudan 230 milisaniye yerine belki 50 milisaniye," dedi Priya. "Hâlâ anlamlı bir iyileşme. Price Class All kadar iyi değil."

"Peki maliyet farkı?"

"Güney Amerika'dan veri çıkışı Kuzey Amerika'nın yaklaşık iki katı maliyettedir. Hâlâ trafik oluşturan bir startup için, Price Class 200 makul bir uzlaşmadır — Asya ve Avrupa'yı Price Class All'dan daha düşük maliyetle alırsınız ve kullanıcılarınızın çoğu kapsanır."

"200 ile başla," dedi Tom. "Her bölgeden gerçek trafik verimiz olduğunda, All'un buna değip değmediğine karar veririz."

Doğru fiyat sınıfı kullanıcılarınızın nerede olduğuna bağlıdır. Güney Amerika'da kullanıcınız yoksa, Güney Amerika edge konumları için ödeme yapmak saf maliyettir. Gelirinizin yüzde yirmisi Brezilya'dan geliyorsa, Price Class All'dan gelen performans iyileşmesi muhtemelen kendini amorti eder.

---

**Önbellek Anahtarı Tasarımı**

"İki farklı kullanıcı aynı URL'yi isteyip farklı içerik aldığında ne olacağını düşündük mü?" diye sordu Priya.

Leo bunu düşündü. "Kişiselleştirilmiş sayfalar."

"Veya dile özgü sayfalar. Veya mobil karşı masaüstü sürümleri. Veya çereze göre değişen sayfalar."

Varsayılan olarak, CloudFront yalnızca URL yolunu önbellek anahtarı olarak kullanır. `/browse`'a iki istek, kullanıcının dil tercihi, cihaz türü veya oturum çerezinden bağımsız olarak aynı önbelleğe alınmış yanıtı alır.

Uygulamanız sorgu dizelerine, başlıklara veya çerezlere göre farklı içerik sunuyorsa — ve CloudFront'un o varyasyonları ayrı ayrı önbelleğe almasını istiyorsanız — o öznitelikleri **önbellek anahtarına** dahil etmeniz gerekir.

Nimbus için:

- `/browse?city=miami`, `/browse?city=boston`'dan ayrı önbelleğe alınmalı — farklı restoran listeleri. Sorgu dizelerini önbellek anahtarına dahil et.
- Mobil kullanıcılar farklı bir düzen alabilir. Normalleştirilmiş bir cihaz türünü (`User-Agent` başlığından türetilmiş) önbellek anahtarına dahil et.
- `Accept-Language` başlığı sayfanın hangi dilde render edileceğini belirler. Onu önbellek anahtarına dahil et.

Yine de dikkatli olun. Eklediğiniz her önbellek anahtarı özniteliği daha fazla önbellek varyasyonu yaratır. Tüm `User-Agent` dizesini dahil ederseniz (tarayıcı sürümüne, işletim sistemi sürümüne ve yama düzeyine göre değişir), önbeleklemeyi etkin biçimde bozarsınız — her kullanıcının biraz farklı bir User-Agent'ı vardır, bu yüzden her istek bir önbellek ıskasıdır.

Disiplin: önbelleğe almadan önce normalleştir. "iPhone 15 Pro Safari 17.4.1"i "mobil"e indir. Kabul edilen tüm dilleri gerçekten desteklediğiniz iki veya üçüne indir. Yalnızca gerçekten yanıtı değiştireni dahil et.

"Önbellek anahtarınız ne kadar spesifikse," dedi Leo, "isabet oranınız o kadar kötü."

"Ve ne kadar genelse," dedi Priya, "yanlış içeriği yanlış kullanıcıya sunma olasılığınız o kadar yüksek."

"Yani önbellek anahtarı tasarımı, önbelleklemedeki diğer her şeyle aynı takas."

"Evet," dedi Priya. "Her zaman aynı takastır."

---

## CloudFront Cevap Olmadığında: Global Accelerator

Nimbus mobil uygulamasının Tom'un iki aydır sessizce izlediği bir özelliği vardı: gerçek zamanlı sipariş durumu. Bir müşteri sipariş verdiğinde, uygulama WebSocket aracılığıyla bağlı kalıyordu ve mutfağın sipariş yönetim ekranı gerçek zamanlı güncelleniyordu. Yenile düğmesi yok. Yoklama yok. Bir mutfak bir öğeyi hazır işaretlediği an güncellemeleri iten canlı bir bağlantı.

"Bu WebSocket kullanıyor," dedi Tom, bir sabah gecikme metriklerine bakarak. "São Paulo'daki kullanıcılardan, bağlantı kurulumu 340 milisaniye sürüyor. Bir şeyler ters."

"CloudFront WebSocket bağlantılarını önbelleğe almaz," dedi Leo. "Onları proxy'ler — origin'e geçirir. Önbellekleme faydası yok."

"Doğru. O zaman neden hâlâ yavaş?"

"Çünkü WebSocket hâlâ São Paulo'dan Oregon'daki sunucularımıza herkese açık internet üzerinden gidiyor," dedi Leo. "CloudFront yardımcı olur, çünkü TLS el sıkışmasını edge'de sonlandırır ve sonra origin'e AWS'nin omurgasını kullanır. Ama kalıcı bir WebSocket bağlantısı için, bu hâlâ uzun mesafeli bir bağlantı."

"Tam olarak bu sorun için bir hizmet var," dedi Priya.

**AWS Global Accelerator** bir CDN değildir. Hiçbir şey önbelleğe almaz. Edge konumlarından içerik sunmaz. Yaptığı şey, size tüm AWS edge konumlarından aynı anda küresel olarak duyurulan iki statik Anycast IP adresi vermek — ve sonra kullanıcılarınızın trafiğini herkese açık internet yerine AWS'nin özel omurgası üzerinden yönlendirmektir.

São Paulo'daki bir müşteri Nimbus uygulamasını açtığında, cihazı en yakın AWS edge konumuna (São Paulo'nun kendisinde olabilir) bağlanır. O edge konumundan, trafik Nimbus'un Oregon'daki sunucularına AWS'nin özel, izlenen, optimize edilmiş fiber ağı üzerinden gider — paketlerin öngörülemeyen taşıyıcılardan ve yönlendirme atlamalarından sıçradığı herkese açık internet üzerinden değil.

Herkese açık internet gecikme için tasarlanmamıştır. Dayanıklılık için tasarlanmıştır — paketler herhangi bir mevcut yolu alabilir. AWS'nin omurgası farklı tasarlanmıştır: doğrudan, düşük sıkışıklıklı ve AWS'nin operasyonel kontrolü altındadır.

Tom farkı kıyasladı.

| Yol | Gecikme (São Paulo'dan Oregon'a) |
|---|---|
| Herkese açık internet | 340ms |
| Global Accelerator üzerinden | 180ms |

%47'lik bir azalma. Önbelleklemeden değil — daha iyi bir ağ yolundan.

"O zaman neden her şey için CloudFront kullanmıyoruz?" diye sordu Maya. "CloudFront zaten dinamik içerik için AWS'nin omurgası üzerinden yönlendiriyor."

"CloudFront yalnızca HTTP ve HTTPS'tir," dedi Priya. "WebSocket'ler CloudFront ile çalışır ama yalnızca HTTP yükseltme yoluyla. Ve bazı protokollerimiz — örneğin IoT sensör verisi — saf TCP veya UDP'dir. CloudFront onları ele almaz. Global Accelerator protokolden bağımsızdır. TCP, UDP, WebSocket, ne olursa olsun. HTTP istekleri değil, paket taşır."

Priya'nın güvenlik belgelerinde not ettiği başka bir fark vardı.

"Global Accelerator bize iki statik Anycast IP verir," dedi. "O IP'ler asla değişmez. Bu, onları güvenlik politikamıza ekleyebileceğimiz, ortak beyaz listelerine ekleyebileceğimiz, güvenlik duvarı kurallarına ekleyebileceğimiz anlamına gelir. CloudFront'un IP adresleri zamanla değişir — AWS tarafından yönetilirler ve sabit değildirler."

"Peki yük devretme?" diye sordu Leo.

"Anında," dedi Priya. "us-west-2 uygulamamızda bir sorun olursa, Global Accelerator trafiği 30 saniyenin altında us-east-1'deki bir yedeğe kaydırabilir — kullanıcıların bağlandığı IP adresini değiştirmeden. Route 53 üzerinden DNS yük devretme TTL'ye bağlı olarak 60-300 saniye alır. Global Accelerator daha hızlı."

**CloudFront vs. Global Accelerator — zihinsel model:**

CloudFront teslimatı önbellekleyerek iyileştirir. HTTP/HTTPS için inşa edilmiştir ve fayda, içerik kullanıcılara yakın önbelleğe alınabildiğinde en büyüktür — statik dosyalar, resimler, JavaScript. İçerik önbelleğe alınamadığında, CloudFront yine omurga yönlendirmesi yoluyla yardımcı olur ama iyileşme daha küçüktür.

Global Accelerator teslimatı yönlendirerek iyileştirir. Hiçbir içerik taşımaz. Hiçbir şey önbelleğe almaz. Fayda her pakete uygulanır — önbelleğe alınmış ya da değil, HTTP ya da değil, statik ya da dinamik. İki statik IP küresel olarak çalışır. Yük devretme neredeyse anındadır. CloudFront'un yeterli olmadığı kullanım durumları — gerçek zamanlı WebSocket'ler, UDP tabanlı protokoller, HTTP olmayan trafik, sabit IP'ler gerektiren küresel uygulamalar — Global Accelerator'ın doğru araç olduğu yerdir.

Tom, gerçek zamanlı sipariş durumu özelliği için Nimbus mobil uygulamasını Global Accelerator uç noktasına bağlanacak şekilde güncelledi. São Paulo'da WebSocket bağlantı kurulumu 340ms'den 180ms'ye düştü. Mutfak güncellemeleri hâlâ anında hissettirdi — çünkü artık, Kuzey Amerika dışındaki kullanıcılar için, gerçekten öyleydiler.

## Güçlü Yönler ve Sınırlamalar

**CloudFront neden güçlüdür**:

- 100'den fazla şehirde 750'den fazla varlık noktası — çoğu kullanıcı içeriği <20ms uzaktan alır
- Statik içerik ilk önbellekten sonra tek haneli milisaniyelerde sunulur
- Origin yükünü önemli ölçüde azaltır (tekrar eden trafik sunucularınıza hiç ulaşmaz)
- AWS Shield, WAF ve Certificate Manager ile entegre
- Kapasite planlaması gerekmez — CloudFront otomatik ölçeklenir
- Çoklu origin dağıtımları farklı yolları bir alan adından farklı arka uçlara yönlendirir
- CloudFront Functions hafif edge mantığını milisaniye altı gecikmeyle ele alır

**Nerede karmaşıklaşır**:

- Önbelleğe alınmış içerik eski olabilir — önbelleği geçersiz kılmak para tutar (her ay ilk 1.000 ücretsiz yoldan sonra yol başına 0,005 dolar). Bunun yerine sürümlenmiş dosya adları kullanın.
- Cache-Control başlıkları origin'de doğru ayarlanmalıdır — hatalar eski içeriğe neden olur
- Dinamik içerik yönlendirme optimizasyonundan yararlanır ama önbelleklemeden değil
- Önbellek davranışında hata ayıklamak (ne nerede, ne kadar süre önbelleğe alınmış) birden çok katmanı anlamayı gerektirir: origin başlıkları, CloudFront TTL ayarları, davranış kuralları
- CloudFront üzerinden veri çıkışı para tutar, standart veri aktarımından az olsa da
- Önbellek anahtarı tasarımı dikkatli düşünme gerektirir — çok spesifik önbeleklemeyi bozar, çok genel yanlış içerik sunar

## Özet

CloudFront fiziği değiştirmedi. Işık hâlâ aynı hızda gider. Ama cevabın nerede yaşadığını değiştirdi — ve çoğu kullanıcı için cevap artık birkaç yüz milisaniye yerine birkaç milisaniye uzaktaydı. Dağıtımdan sonra önbellek isabet oranı: %83. Bu, her milyon istekten 830.000'inin origin sunucularına hiç ulaşmadığı anlamına geliyordu. São Paulo'daki kullanıcılar 290 milisaniyeden 35 milisaniyeye geçti. Tokyo'daki kullanıcılar 260'tan 28'e.

- Bir **CDN**, içeriğinizin kopyalarını kullanıcılarınıza yakın edge konumlarında önbelleğe alır — gecikmeyi ve origin yükünü azaltır.
- **CloudFront**, AWS'nin CDN'sidir, küresel olarak 750'den fazla varlık noktasıyla.
- Önbellek ıskaları **origin**'den (S3, ALB, EC2) getirir. Önbellek isabetleri edge'den sunar — yüzlerce milisaniye değil, milisaniyeler.
- **Davranışlar** farklı URL desenleri için farklı önbellekleme kuralları ayarlamanıza izin verir. Bir dağıtım `/images/*`'ı S3'ten ve `/*`'ı bir ALB'den sunabilir.
- Dinamik içerik önbelleğe alınmaz ama CloudFront yine AWS'nin özel omurga ağı üzerinden performansı iyileştirir.
- Geçersizleştirmeler yerine sürümlenmiş dosya adları kullanarak (örn. `hero-v2.jpg`) **eski içerikten kaçının** — daha ucuz ve daha güvenilir.
- **CloudFront Functions** hafif edge mantığını (başlık manipülasyonu, URL yeniden yazma) milisaniye altı hızda ele alır. **Lambda@Edge** ağ çağrıları gerektiren daha ağır işlemeyi ele alır.
- **Fiyat sınıfları** hangi edge konumlarının trafiğinizi sunacağını — ve dolayısıyla veri aktarım maliyetinizi — kontrol etmenize izin verir.
- **Önbellek anahtarı tasarımı** hangi istek özniteliklerinin ayrı önbelleğe alınmış varyasyonlar yaratacağını belirler. Daha spesifik anahtarlar = daha düşük isabet oranı. Daha az spesifik = yanlış içerik sunma riski.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.4)*

- **CloudFront + S3**: Statik web sitelerini küresel olarak sunmak için klasik sınav deseni. Origin olarak S3 paketi, CDN olarak CloudFront, doğrudan S3 erişimini önlemek için Origin Access Control.
- **Edge konumları vs Bölgeler vs AZ'ler**: Edge konumları daha çoktur ve yalnızca önbellekleme/CDN amaçları için vardır. AZ'lerle (bilgi işleminizi çalıştıran) aynı değildir.
- **Önbellek geçersizleştirme**: CloudFront'u taze içerik getirmeye zorlamak için bir `/images/*` geçersizleştirmesi oluşturur. Para tutar — sınav uygun maliyetli alternatifi sorabilir: sürümlenmiş URL'ler (`image.jpg` yerine `image-v2.jpg`), bunlar önbelleği doğal olarak atlar.
- **TTL kontrolü**: Origin'de `Cache-Control: max-age=3600` 1 saatlik bir önbellek TTL'si ayarlar. CloudFront bu başlıklara uyar. Minimum TTL, maksimum TTL ve varsayılan TTL dağıtım davranışında da ayarlanabilir.
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions hafif istek/yanıt manipülasyonu için edge'de çalışır (milisaniye altı). Lambda@Edge daha ağır işleme için Lambda kodunuzu bölgesel edge konumlarında çalıştırır. Sınav onları kullanım durumu karmaşıklığına göre ayırır. CloudFront Functions ağ çağrıları yapamaz; Lambda@Edge yapabilir.
- **İmzalı URL'ler ve İmzalı Çerezler**: CloudFront üzerinden içeriğe kimin erişebileceğini kontrol eder. İmzalı URL'ler belirli dosyalara erişim verir; imzalı çerezler birden çok dosyaya erişim verir. Sınav bunları "ücretli abone içeriği" için kullanır.
- **Fiyat Sınıfı**: Sınav küresel bir kitle ile Kuzey Amerika/Avrupa kitlesi için hangi fiyat sınıfının seçileceğini sorabilir. Price Class All = en iyi performans, en yüksek maliyet. Price Class 100 = yalnızca Kuzey Amerika ve Avrupa, en düşük maliyet.
- **Önbellek anahtarı**: Varsayılan önbellek anahtarı URL'dir. Önbellek anahtarına sorgu dizeleri, başlıklar veya çerezler eklemek ayrı önbelleğe alınmış varyasyonlar yaratır — ama önbellek ıska oranını artırır. Sınav içeriğin bir sorgu parametresine göre değiştiği bir senaryo sunup önbeleklemenin nasıl yapılandırılacağını sorabilir.
- **Origin yük devretme**: CloudFront, birincil ve ikincil origin'i olan bir origin grubunu destekler. Birincil origin bir 5xx hatası döndürürse, CloudFront otomatik olarak ikincil ile yeniden dener. Route 53 yük devretmesinden farklıdır — bu, tek bir CloudFront dağıtımı içindedir.
- **Çoklu origin davranışları**: Tek bir dağıtım `/images/*`'ı S3'e ve `/*`'ı bir ALB'ye yönlendirebilir. Sınav bunu "iki dağıtım olmadan bir alan adından statik ve dinamik içerik nasıl sunulur" olarak sunabilir.
- **CloudFront vs. Global Accelerator:** CloudFront = HTTP/HTTPS CDN, içeriği edge konumlarında önbelleğe alır, origin yükünü azaltır, statik ve önbelleğe alınabilir içerik için en iyisi. Global Accelerator = herhangi bir TCP/UDP protokolü, hiçbir şey önbelleğe almaz, trafiği AWS'nin özel omurgası üzerinden yönlendirir, 2 statik Anycast IP sağlar, neredeyse anında bölgesel yük devretmeyi destekler. Sınav tetikleyicisi: "HTTP olmayan trafik için gecikmeyi iyileştir" veya "küresel bir uygulama için statik IP" veya "küresel kullanıcılar için WebSocket performansı" veya "DNS'ten daha hızlı bölgesel yük devretme" → Global Accelerator. "Statik dosyaları düşük gecikmeyle küresel olarak sun" → CloudFront.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Bir CloudFront önbellek isabeti ile önbellek ıskası arasındaki farkı açıklayın. Her durumda ne olur?

*(İpucu: İçeriğin nereden geldiğini ve yanıt süresinin iki durum arasında nasıl farklılaştığını düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir yazılım şirketi büyük kurulum dosyalarını (her biri ~2GB) bir S3 paketinden dünya çapındaki müşterilere dağıtıyor. Asya'daki müşteriler için indirme hızları yavaş. Ekip, S3 paketini birden çok bölgeye çoğaltmadan performansı iyileştirmek istiyor. Ayrıca yalnızca ödeme yapan müşterilerin kurulumları indirebilmesini sağlamaları gerekiyor.

Bu gereksinimleri EN İYİ hangi çözüm karşılar?

A) Pakette S3 Transfer Acceleration'ı etkinleştirin ve ödeme yapan müşteriler için ön imzalı URL'ler oluşturun  
B) Origin olarak S3 paketiyle CloudFront kullanın, Origin Access Control'ü etkinleştirin ve ödeme yapan müşteriler için CloudFront İmzalı URL'leri kullanın  
C) Her AWS bölgesinde bir S3 paketi oluşturun ve müşterileri en yakın pakete yönlendirmek için Route 53 coğrafi konum yönlendirmesi kullanın  
D) Her bölgede kurulum dosyalarını sunan EC2 örnekleriyle bir Application Load Balancer kullanın

**İpucu 1**: Gereksinim, paketi çoğaltmadan küresel performansı iyileştirmek. Hangi seçenek birden çok paket gerektirmez?

**İpucu 2**: CloudFront üzerinden sunulan içeriğe kimin erişebileceğini özellikle hangi hizmet kontrol eder?

**İpucu 3**: S3 Transfer Acceleration, S3'e uzun mesafeli yüklemeler için optimize edilmiştir. İçeriği S3'ten son kullanıcılara küresel olarak teslim etmek için CloudFront doğru araçtır.

**Cevap**: B

**Açıklama**: CloudFront, kurulum dosyalarını ilk indirmeden sonra küresel olarak edge konumlarında önbelleğe alır. Aynı bölgeden sonraki indirmeler edge'den gelir — us-west-2'deki S3'ten Pasifik'i kat etmekten çok daha hızlı. Origin Access Control, S3 paketinin yalnızca CloudFront üzerinden erişilebilir olmasını sağlar. İmzalı URL'ler erişimi ödeme yapan müşterilerle sınırlar.

**Neden A değil?** S3 Transfer Acceleration, S3'e uzun mesafeli yüklemeler için optimize edilmiştir — içeriği S3'ten küresel bir kitleye dağıtmak için değil. Bunun için CloudFront doğru araçtır. Ön imzalı URL'ler erişimi kontrol eder ama küresel performansı iyileştirmez.

**Neden C değil?** Bölge başına bir S3 paketi oluşturmak performans için işe yarar ama çoğaltmadan kaçınma gereksinimiyle çelişir. Ayrıca paketler arasında bir veri senkronizasyon stratejisi gerektirir.

**Neden D değil?** Her bölgede bir yük dengeleyicinin arkasındaki EC2 örnekleri CloudFront'tan önemli ölçüde daha pahalıdır ve birden çok bölgede sunucu yönetmeyi gerektirir.

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama — Görev 3.4*

**Alıştırma 3 — Mimari Mücadelesi** *(İsteğe Bağlı)*

Nimbus video içeriği eklemek istiyor — restoran ortaklarından kısa yemek pişirme eğitimi videoları. Videolar 50-500MB olabilir. Aynı videonun, yayınlandıktan sonraki saatler içinde aynı şehirdeki binlerce kullanıcı tarafından izleneceğini bekliyorlar.

Depolama ve teslimat mimarisini tasarlayın. S3 ve CloudFront kullanır mısınız? Video önbelleğe alınmadan önceki gecikmeyi en aza indirmek için ilk isteği (soğuk başlangıç) nasıl ele alırsınız? Yayınlandıktan sonra değişmeyecek bir video için hangi önbellek TTL'sini ayarlardınız?

*(Tek bir doğru cevap yoktur. Amaç, CDN tasarım kararları pratiği yapmaktır.)*

## Jenerik Sonrası Sahne

"Zaten dağıttım — ah." Leo CloudFront dağıtımını yanlış origin'e işaret etmişti — üretim paketinin yerine geliştirme S3 paketine. Yaklaşık dört dakika boyunca, bazı Batı Yakası kullanıcıları uygulamanın eski bir sürümünü görmüştü. Origin ayarlarını düzeltmiş, önbelleği geçersiz kılmış ve sessizce olay günlüğünü güncellemişti.

Priya dağıtımdan sonra CloudFront metriklerini izledi.

Önbellek isabet oranı: %83.

"Bu ne anlama geliyor?" diye sordu Tom.

"Kullanıcılarımızın %83'ünün içeriği us-west-2'den değil, kendilerine yakın bir edge konumundan aldığı anlamına geliyor."

"Peki diğer %17?"

"İlk kez yapılan istekler. O edge konumunda henüz önbelleğe alınmamış içerik."

Tom metriklere baktı. "Yani CloudFront edge düğümlerinden günde neredeyse bir milyon istek sunuyoruz. Ve bunların yalnızca 170.000'i aslında sunucularımıza çarpıyor."

"Evet."

"Yani CloudFront'umuz olmasaydı, sunucularımız bir milyon isteği işliyor olurdu."

"Küresel kullanıcılar için her biri 140-160 milisaniyede."

Tom arkasına yaslandı. Maya'nın tanıdığı bir bakışı vardı — gerçek zamanlı olarak maliyeti yeniden hesaplayan birinin bakışı.

"Buna değer," dedi.

Maya çoktan dizüstü bilgisayarındaydı. "Önümüzdeki hafta iki yeni mühendis bize katılıyor. Soo-Jin, son şirketinde platform ekibinden ve Rafael — güvenlik konusunda uzmanlaştı. İlk günlerinden önce onları IAM konusunda eğitmek istiyorum."

"İleri düzey IAM?" diye sordu Leo.

"Roller, politikalar, hesaplar arası erişim. Gerçek şeyler."

Sonraki bölümde: sistemin bir parçasının diğeriyle güvenli biçimde konuşmasını sağlayan ince taneli izinler.
