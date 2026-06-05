# Bölüm 12: İnternet Seni Nasıl Bulur

Nimbus çalışıyordu. Yük dengeleyiciye halka açık bir IP adresi vardı. EC2 örneklerine özel bir IP adresi vardı. Veritabanları özel alt ağlarda kilitlenmişti. Priya, ağ diyagramını onaylayarak başını salladı.

Tom, yük dengeleyicinin URL'sini inceledi: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

"Müşteriler bununla tarayıcılarına giriyorlar mı?" diye sordu.

"AWS bunu otomatik olarak atar," dedi Maya.

"Ben bunu bir iş kartına koymayacağım."

"Ben de yapmayacağım."

Bir alan adı onlara ihtiyaçları vardı. `eatnimbus.com` adını bir alan adı kaydından satın aldılar. Şimdi o adı AWS altyapılarıyla bağlamaları gerekiyordu.

"İnternet, `eatnimbus.com`'un nimbus'a mı işaret ettiğini nasıl anlar?" diye sordu Leo.

İyi bir soru, Leo.

**Telefon Kaseti Analojisi**

Akıllı telefonlar önce yokken, her şehirde bir telefon kaseti vardı. "Mario's Pizza"na ulaşmak istiyorsanız, telefon numarasını ezberlemenize gerek yoktu — adını bulur, numarayı alıp arardınız.

İnternet kendi telefon kasetine sahiptir: **Alan Adı Sistemi (DNS)**.

DNS, insan tarafından okunabilir isimleri (örneğin, `eatnimbus.com`) makine tarafından okunabilir IP adreslerine (örneğin, `203.0.113.42`) çevirir. Bir web sitesine her ziyaretinizde, bilgisayarınız DNS'de alan adını arar ve bağlantı kurmak için IP adresini alır.

Sunucunuzun IP adresini değiştirdiğinizde, DNS kaydını güncelleyecek ve internet sizi yeni konumunuza bulacaktır.

**Route 53'ü Tanıyalım**

Amazon Route 53, AWS'nin yönetilen DNS hizmetidir. Route 53 adını port 53'ün standart DNS portu olduğu için verilmiştir. (Bazen AWS, şeyleri doğrudan adlandırır.)

Route 53 şunları yapar:

**Alan adı kaydı:** Route 53 üzerinden alan adlarını satın alabilirsiniz.

**DNS barındırma (etiket bölgeleri):** Alan adı için bir *etiket bölgesi* oluşturursunuz ve Route 53, dünyadaki sizi bulmak için hangi DNS kayıtlarını yönetir.

**Sağlık kontrolü:** Route 53 uç noktalarınızı izler ve sağlıksız olanlara trafiği yönlendirir.

**Trafik yönlendirme politikaları:** Route 53, basit DNS'ye göre çok sayıda yönlendirme stratejisini destekler — ağırlıklı, gecikmeye dayalı, coğrafi konum, yedekleme.

**DNS Kayıtları: Telefon Kasetindeki Girişler**

Bir DNS kaydı, bir ismi bir hedefe eşler. En yaygın türler:

**A kaydı:** Bir ismi bir IPv4 adresine eşler.
`eatnimbus.com → 203.0.113.42`

**AAAA kaydı:** Bir ismi bir IPv6 adresine eşler.

**CNAME kaydı:** Bir ismi başka bir isimle eşler (bir alias).
`www.eatnimbus.com → eatnimbus.com`

**MX kaydı:** Bir alan için e-postanın hangi sunucular tarafından işleneceğini belirtir.

**TXT kaydı:** Arbitrary metin depolar. Sıkça, alan adı doğrulama (alan adınızı kanıtlamak) ve e-posta kimlik doğrulaması (SPF, DKIM) için kullanılır.

Nimbus için ana kurulum:

- `eatnimbus.com →` yük dengeleyicinin IP adresine işaret eden bir A kaydı
- `www.eatnimbus.com →` `eatnimbus.com`'a işaret eden bir CNAME kaydı
- `api.eatnimbus.com →` API yük dengeleyicisini işaret eden bir A kaydı

"Bekle," dedi Tom. "Yük dengeleyicinin IP adresi değişebilir. AWS bunun dokümantasyonda olduğunu söyledi."

İyi bir tespit, Tom.

**Alias Kayıtları: AWS'nin Dinamik IP'ler İçin Çözümü**

Yük dengeleyiciler, CloudFront dağıtımları ve S3 web siteleri, statik IP adresleri yerine DNS isimlerini kullanır. Alt IP'ler değişebilir.

Bir CNAME'yi bir yük dengeleyicinin DNS ismine işaret oluşturursanız — ancak CNAME'leri kök alan adları (`eatnimbus.com`'u "www" olmadan) için kullanmanız mümkün değildir çünkü DNS standartları nedeniyle.

Route 53, bu sorunu **Alias kayıtları** ile çözer — AWS'ye özgü bir DNS uzantısıdır. Bir Alias kaydı, bir ismi doğrudan bir AWS kaynağına (yük dengeleyici, CloudFront dağıtımı, S3 web sitesi) eşler ve Route 53, dinamik IP çözümünü otomatik olarak yönetir. Alias kayıtları kök alan adında kullanılabilir. Ve dış hizmetlere yapılan Alias kayıtları sorgularına aksine, AWS kaynaklarına yapılan Alias kayıtları sorguları ücretsizdir.

"Yani `eatnimbus.com`'u bir Alias kaydıyla yük dengeleyicisine işaret ediyoruz," diye doğruladı Leo.

"Ve Route 53, yük dengeleyicinin herhangi bir anda kullandığı IP adresini yönetiyor," diye ekledi Priya.

"Ücretsiz olarak," dedi Tom, aniden çok ilgilenmişti.

**Yönlendirme Politikaları: "Nerede Bulunuyor?"'dan Daha Fazlası**

Bu noktada Route 53 ilginç hale gelir. DNS sadece bir arama hizmeti değildir — aynı zamanda bir trafik yönetimi aracı olabilir.

**Basit yönlendirme:** Bir kayıt, bir hedef. Standart DNS.

**Ağırlıklı yönlendirme:** Ağırlıkla birden fazla hedefe trafiği bölün. Bir geçişi yeni sunucuya %90 ile, eski sunucuya %10 ile yaparken ayarlamalar yapın ve yeni sunucunun güvenli olduğundan emin olana kadar ayarlamalar yapın, ardından 100'e geçin.

**Gecikmeye dayalı yönlendirme:** Kullanıcılara en düşük gecikmeye sahip AWS bölgesine yönlendirilir. Seattle'daki bir kullanıcı, `us-west-2`'ye yönlendirilir. Tokyo'daki bir kullanıcı, `ap-northeast-1`'e yönlendirilir. Aynı alan adı, farklı hedefler.

**Coğrafi konum tabanlı yönlendirme:** Kullanıcının coğrafi konumuna göre yönlendirilir. Avrupa'daki tüm kullanıcılar `eu-west-1`'e yönlendirilir. Kuzey Amerika'daki tüm kullanıcılar `us-east-1`'e yönlendirilir. Veri egemenliği (AB'ye ait verilerin AB bölgelerinde tutulması) veya içerik özelleştirme (dil, para birimi) için kullanışlıdır.

**Yedekleme Yönlendirmesi**: Birincil ve ikincil uç nokta belirleyin. Birincil başarısız olursa Route 53'ün sağlık kontrolü, trafiği otomatik olarak ikinciliye yönlendirir. Bu, felaket kurtarma için DNS katmanıdır.

**Çoklu Değerli Yanıt Yönlendirmesi**: Bir sorgu için sağlıklı IP adreslerinden en fazla sekizi döndürerek müşteriye seçme imkanı tanır. Birden fazla sunucu arasında trafiği dağıtmak için basit bir alternatif, yük denetleyicisine benzer.

"Yani Route 53 sadece bir telefon sözlüğü değil," dedi Maya. "Çağrıları, aradığınız yerden belirleyebilen akıllı bir telefon sözlüğüdür."

"Ve numara sağlıksızsa sizi keser," diye ekledi Priya.

**Sağlık Kontrolleri: Başarısızlıkla Yönlendirme**

Route 53, uç noktalarınızı sağlık kontrolleriyle izleyebilir. Bir uç nokta başarısız olursa Route 53 şunları yapabilir:

- DNS yanıtlarından kaldırır (orada trafik göndermeyi durdurur)
- Bir yedek uç noktaya geçişi tetikler
- CloudWatch üzerinden bir uyarı gönderir

Sağlık kontrolleri, DNS yönlendirmesi ile uygulamanın gerçek sağlığı arasındaki bağlantıdır. Bir yedekleme yapılandırmasında: Route 53, ana uç noktayı her 30 saniyede bir izler. Üç ardışık kontrol başarısız olursa Route 53, ikincil uç noktanın adresini döndürmeye başlar.

Bu anında gerçekleşmez — DNS yayılım süresi vardır. Route 53 bir DNS kaydını değiştirdiğinde, dünyanın dört bir yanındaki DNS çözümleyicilerinin değişikliği benimsemesi saniyelerden dakikalara kadar değişebilir, TTL ayarlarının ayarlanmasına bağlı olarak.

**TTL: DNS Önbelleği**

DNS yanıtları, router'ınızda, ISP'nizde, tarayıcınızda birden çok düzeyde önbelleğe alınır. Bir DNS kaydının **TTL (Yaşam Süresi)**, yanıtın ne kadar süreyle hatırlanacağını önbellekte kontrol etmeden önce söyler.

Yüksek TTL (1 saat veya daha fazla): Daha az DNS sorgusu, Route 53'te daha az yük, ancak değişiklikler yayılmakta daha uzun sürer.

Düşük TTL (60 saniye veya daha az): Değişiklikler hızla yayılır, ancak daha fazla DNS sorgusu gerekir.

Planlı bir geçişten (bir sunucuya işaret eden DNS'yi güncellemeden önce) geçmeden önce TTL'nizi geçişten bir gün önce 60 saniyeye düşürün. Sonra değişikliği yaptığınızda yaklaşık bir dakikada yayılır. Geçişten sonra normal değere yükseltin.

"Eğer geçiş sırasında ve öncesinde düşürmezsek," dedi Leo yavaşça, "eski TTL, bazı kullanıcıların bir saat boyunca eski sunucuyu göreceği anlamına gelir."

"Tamamdır," dedi Priya. "DNS geçişleri, geçiş sırasında değil, önceden planlanmalıdır."

## Güçlü Yönler ve Sınırlamalar

**Route 53 doğru seçimdir**: alan adlarını tamamen AWS içinde kaydetmek ve yönetmek; gecikme süresi, coğrafi konum veya birden çok uç noktaya göre ağırlıklı dağıtım temelinde trafiği yönlendirmek; bölgeler arasında veya birincil ile felaket kurtarma uç noktası arasında sağlık kontrolü tabanlı geçişler; DNS'yi diğer AWS hizmetleriyle alias kayıtları aracılığıyla entegre etmek.

**Route 53'ün ne zaman doğru olmadığı**: Route 53 bir DNS hizmetidir, bir yük denetleyicisi değildir. Birden fazla sunucuya veya konteynerlere bölgedeki bir şekilde trafik dağıtmanız gerekiyorsa, bir Application Load Balancer kullanmanız gerekir — Route 53, bir yük denetleyicisi gibi bağlantı düzeyinde ağırlıklı round-robin'i yapamaz. Bölgesel çapta gecikme tabanlı yönlendirme, kullanıcılarınızın gerçekten küresel olarak dağılmış olması ve milisaniyeler uygulamanız için önemli olması durumunda yalnızca maliyet ve operasyonel karmaşıklık yaratır. Çoğu tek bölge uygulaması için bir A kaydını bir ALB'ye işaretlemek Route 53 yapılandırmanızın tümü olacaktır.

## Özeti

- **DNS**, alan adlarını IP adreslerine çevirir — internetin telefon sözlüğü.
- **Route 53**, AWS'nin yönetilen DNS hizmetidir: alan kaydı, DNS barındırması, sağlık kontrolleri ve yönlendirme politikaları.
- **A kayıtları**, isimleri IPv4 adreslerine eşler. **CNAME kayıtları**, isimleri diğer isimlere eşler. **Alias kayıtları**, isimleri AWS kaynaklarına eşler (yük denetleyicileri, CloudFront, S3).
- Alias kayıtlarını (CNAME'ler değil), kök alan adları ve dinamik IP'lere sahip kaynaklar için kullanın.
- Yönlendirme politikaları, basit DNS'den daha fazlasını içerir: **ağırlıklı** (trafik bölünmesi), **gecikme tabanlı** (performans), **coğrafi konum** (veri egemenliği), **geçiş** (felaket kurtarma).
- **Sağlık kontrolleri**, uç noktaları izler ve sağlıksız hedefleri DNS yanıtlarından kaldırır.
- Geçişlerden önce TTL değişikliklerini planlayın — geçişten önce TTL'yi düşürün, böylece değişiklikler hızla yayılır.

## Sınav İpuçları

*SAA-C03 Alan: Yüksek Performanslı Mimarileri Tasarlama (Alan 3, Görev 3.4)*

- **Alias Kayıtları vs CNAME Kayıtları**: Alias kayıtları kök alan adı üzerinde kullanılabilir; CNAME kayıtları kullanamaz. AWS kaynaklarına yönelik Alias kayıtları ücretsizdir; CNAME DNS sorguları ücretlendirilir. Bir sınavda kök bir alan adını bir yük denleyicisine eşleme sorulduğunda → Alias kaydı.
- **Yönlendirme Politikası Kullanım Durumları** (sık karşılaşılan sınav senaryoları):
  - "Yeni bir sürüm trafiğine kademeli olarak geçiş" → Ağırlıklandırılmış yönlendirme
  - "Kullanıcıları en yakın AWS bölgesine yönlendirin" → Gecikme tabanlı yönlendirme
  - "AB kullanıcı verilerini AB bölgelerinde tutun" → Coğrafi konum tabanlı yönlendirme
  - "Birincisi kullanılamaz olduğunda otomatik DNS geçişi" → Sağlık kontrolleriyle geçiş yönlendirme
- **Route 53 Sağlık Kontrolleri**: HTTP/HTTPS/TCP uç noktalarını kontrol edebilir ve CloudWatch uyarılarını tetikleyebilir. Sınavlarda bu, felaket kurtarma senaryolarında kullanılır.
- **TTL ve Yayılım**: TTL'nin DNS çözümleyicilerin bir kaydı ne kadar süreyle önbelleğe alacağını kontrol ettiğini bilin. Kısa TTL = daha hızlı değişiklikler. Sınav senaryosu: "Takım DNS'i güncelledi ancak kullanıcılar eski sunucuya ulaşmaya devam ediyor" → TTL çok yüksek.
- **Özel Barındırılan Bölgeler**: Route 53, yalnızca bir VPC içinde çözünen DNS kayıtları oluşturabilir. Sınav, iç hizmet keşfi için kullanılır (örneğin, `database.internal` adresini özel bir RDS uç noktasına çözmek).
- Route 53 **küreseldir** — bir bölgede dağıtılmaz. Barındırılan bölgeleri oluştururken bölge seçimi gerekmez.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Bir CNAME kaydının ve bir Alias kaydının farkını açıklayın. Her birini ne zaman kullanırsınız?

*(İpucu: CNAME'nin kök alan adlarında olan kısıtlamalarını ve Alias kayıtlarının dinamik AWS kaynaklarıyla nasıl davrandığını göz önünde bulundurun.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir medya şirketi, `us-east-1` (ana) ve `eu-west-1` (ikincil) olmak üzere iki AWS bölgesinden bir web sitesi işletiyor. Takım, ana bölge kullanılamaz hale gelirse trafiği otomatik olarak `eu-west-1`'e yönlendirmek istiyor. Şirket ayrıca bu geçiş mekanizmasının doğru şekilde çalıştığını doğrulamak için gerçekte herhangi bir sunucuyu kapatmadan yapmak istiyor.

Hangi Route 53 yapılandırması bu gereksinimleri en iyi şekilde karşılar?

A) 100% ağırlıkta `us-east-1` ve 0% ağırlıkta `eu-west-1` ile ağırlıklandırılmış yönlendirme
B) Hem uç noktalar için sağlık kontrolleriyle gecikme tabanlı yönlendirme
C) Birincil uç noktaya bir sağlık kontrolü ve ikincil kaydın `eu-west-1`'e işaret ettiği geçiş yönlendirme
D) Kuzey Amerika'yı `us-east-1`'e ve Avrupa'yı `eu-west-1`'e yönlendiren coğrafi konum tabanlı yönlendirme

**İpucu 1**: Gereklilik, birincisi kullanılamaz olduğunda otomatik geçiştir. Tam olarak bu kullanım durumu için tasarlanmış yönlendirme politikası hangisidir?

**İpucu 2**: "Birincisini kapatmadan testi yap" — sağlık kontrolleri manuel olarak "sağsız" olarak ayarlanabilir.

**İpucu 3**: Gecikme tabanlı yönlendirme, hızı optimize eder, geçişi değil.

**Cevap**: C

**Açıklama**: Bu kullanım durumu için tasarlanmış yönlendirme politikası tam olarak bu kullanım durumudur. Birincil kayıt `us-east-1`'e bir sağlık kontrolü ile işaretlenir. İkincil kayıt `eu-west-1`'e işaret eder. Sağlık kontrolü başarısız olursa, Route 53 ikinci kaydı otomatik olarak sunar. Sağlık kontrolleri, birincisi kesintiye uğratmadan test etmek için manuel olarak başarısız olarak ayarlanabilir.

**A'nın neden çalışmadığını mı merak ediyorsunuz?** 100%/0% ağırlıkta ağırlıklandırılmış yönlendirme, aslında statiktir — otomatik olarak başarısız olduğunda geçiş yapmaz.

**B'nin neden çalışmadığını mı merak ediyorsunuz?** Gecikme tabanlı yönlendirme, her kullanıcı için en hızlı uç noktayı seçer. Sağlıksız bir `us-east-1`'e sağlama trafiğini sağlık kontrolü başarısız olduğunda yine de yönlendirmeyecektir — yine de hız avantajı varsa.

**D'nin neden çalışmadığını mı merak ediyorsunuz?** Coğrafi konum tabanlı yönlendirme, kullanıcı konumuna göre, sağlık durumuna göre değil yönlendirir. Avrupa kullanıcıları `us-east-1` sağlıklı olsa bile `eu-west-1`'e takılı kalır ve Kuzey Amerika kullanıcıları `us-east-1` kullanılamaz hale gelirse `eu-west-1`'e geçiş yapmaz.

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla — Görev 3.4*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, uluslararası pazarlara açılıyor. `eatnimbus.com` web sitesinin, kullanıcılar için Batı Yakası, Doğu Yakası ve Avustralya'daki kullanıcılar için hızlı yüklenmesini sağlamalıdır. Ayrıca, Avrupa kullanıcılarının siparişlerinin Avrupa bölgelerinde sunucularda işlenmesi bir yasal gerekliliğidir.

Route 53 yönlendirme stratejisini hem bu gereksinimleri karşılayacak şekilde tasarlayın. Hangi yönlendirme politikası veya politikaların bir kombinasyonunu kullanırdınız? Her bölgede hangi altyapıya ihtiyacınız olurdu?

*(Tek bir doğru cevap yoktur. Amaç, çok bölge yönlendirme tasarımını uygulamaktır.)*

## Kredi Sonrası Sahne

`eatnimbus.com` canlıydı.

Sofia, tarayıcısına web sitesini yazdı ve Nimbus sipariş sayfası yükendi. Kendi ailesinin restoranından bir arepa sipariş etti, akışı test etmek için. Sipariş alındı. Mutfak onu aldı.

Ona geri döndü.

Leo zaten Route 53 sağlık kontrolü günlüklerini okuyordu. "Yanıt süresi us-east-1'den 47 milisaniyedir."

"Bu hızlı mı?" diye sordu Sofia.

"DNS için mi? Evet."

"Ama Seattle'daki bir kullanıcı için mi?"

Leo grafik üzerindeki gecikme grafiğine baktı. "Yaklaşık 80 milisaniyedir."

Sofia o konuda düşündü. "Eğer çoğu müşterimizin Batı Yakasında yaşıyorsa ve sunucularımız Virginia'da ise..."

Leo, "Bu, Avrupa'daki kullanıcılar için sunucuları Avrupa'da tutmamız gerektiği anlamına gelir." diye ekledi.

"Her istek Seattle'den Virginia'ya ve geri gider," dedi Leo odaya karşı. "Işık hızı. Fizik kurallarını yenemezsin."

"Yani Seattle'e daha yakın sunuculara ihtiyacımız var."

"Veya Seattle'e daha yakın, onların adına içerik sunan bir şeyler."

Bu düşünce havada asılı kaldı.

Bir sonraki bölümde: Nimbus'ın içeriğini her kullanıcıya, her yerde bir milisaniyede yakalayan depolar.
