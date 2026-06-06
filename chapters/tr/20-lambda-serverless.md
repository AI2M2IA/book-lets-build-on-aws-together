# Bölüm 20: Serbest Çalışan Modeli

Sakin bir Çarşamba öğleden sonrasıydı. Priya bir kez olsun kulaklıklarını çıkarmıştı ve ofiste, herkesin konsantre olduğu ama kimsenin panik yapmadığı türden alçak bir uğultu vardı. Leo'nun bir ekranında bir maliyet panosu, diğerinde EC2 örnek listesi açıktı.

Çağrı üzerine çalışan bir serbest çalışanı (freelancer) düşünün. Dokuzdan beşe bir masada oturmazlar. Beklerler. Telefon çalar, işi yaparlar, bir fatura gönderirler, beklemeye geri dönerler. İş yok, maliyet yok. Bir istek patlaması, hepsini aynı anda ele alırlar. Yalnızca gerçekten çalışılan saatler için ödersiniz—müsait oldukları saatler için değil.

Bu bölümün konusu işte bu modeldir.

Burada akılda tutulması gereken bir incelik var. Geleneksel model şudur: bir çalışan işe al, 8 saat için öde, değişken çıktı al. Serbest çalışan modeli ise: yalnızca telefon çaldığında öde, tam olarak istenileni al. Öngörülebilir, sabit talebi olan bir şirket için, çalışan modeli daha verimlidir—telefonun sürekli çalacağını bilirsiniz, bu yüzden saatlik ödeme eşdeğerdir ve işe alma ve işten çıkarma ek yükü yoktur. Değişken, ani veya seyrek talebi olan bir şirket için, serbest çalışan modeli çarpıcı biçimde daha ucuzdur.

AWS bu modeli işlem (compute) için sunar—ve mantıklı olup olmadığı talep modelinize bağlıdır. İlk soru asla "bu model iyi mi?" değil, "iş yüküm gerçekte nasıl görünüyor?"dur.

Bir girişimden büyük çoğu iş yükü için: bir karışım. Bazı şeyler sürekli çalışır (API sunucusu, veritabanı). Bazı şeyler yalnızca tetiklendiğinde çalışır (olay işleme, rapor oluşturma, görüntü yeniden boyutlandırma). Serbest çalışan modeli ikinci kategori içindir—ve Nimbus, faturasının ne kadarının oraya ait olduğunu keşfetmek üzereydi.

---

SQS/SNS fan-out sipariş akışını ayrıştırmıştı, ama o kuyrukları tüketen işçiler hâlâ—gerçekte kaç e-posta gönderdiklerine bakılmaksızın—saatlik ücret alan EC2 örneklerinde çalışıyordu. Mimari doğruydu; maliyet modelinin hâlâ bir sızıntısı vardı.

Bunu ilk Priya fark etmişti.

"E-posta hizmeti," dedi. "Günde kaç e-posta gönderiyoruz?"

Leo metrikleri kontrol etti. "Günde ortalama 400. Cuma geceleri zirve yaklaşık 1.200."

"Peki e-posta hizmetini çalıştıran EC2 örneği—ne kadar süre çalışıyor?"

"Her zaman. 7/24."

"Sıfır e-posta gönderdiğimiz sabah 3'te bile mi?"

Sessizlik.

Leo, e-posta hizmeti EC2 örneği için CloudWatch CPU grafiğini açtı. Grafik 18 saatlik kesintisiz çalışma gösteriyordu. Cuma zirvesinde: CPU %38, e-posta patlamasını yönetiyor. Gece yarısından sonra: CPU %3'e düştü. Öğle siparişleri başlayana kadar orada kaldı.

18 saat boyunca aralıksız yüzde üç CPU. Örnek çalışıyordu. Fatura kesiyordu. Anlamlı hiçbir şey yapmıyordu.

"Orada hiçbir şey yapmadan oturan bir bilgisayar için ödeme yapıyoruz," dedi Leo.

"Günde kaç saat?"

Daha fazla sessizlik.

"Yaklaşık 18."

Tom şimdi çok dikkatliydi.

"Ve sadece e-posta hizmeti değil," diye ekledi Priya. "Restoran fotoğrafları için görüntü yeniden boyutlandırma hizmeti çoğu zaman %1 CPU'da çalışıyor. Yalnızca bir restoran yeni bir menü yüklediğinde fırlıyor. Bu da, ne kadar, restoran başına günde birkaç kez mi oluyor?"

"Evet," diye onayladı Leo.

"Geçici dosyaları silen gecelik temizleme işi—o sabah 2'de 4 dakika çalışıyor ve sonra 23 saat 56 dakika tamamen boşta oturuyor."

"O da evet."

Kalıp, Nimbus'un tüm küçük hizmetlerinde aynıydı: günde 24 saat için ödenen, bunun bir kesri için kullanılan işlem gücü.

---

**Sunucu Her Zaman Cevap Değildir**

EC2 örnekleri kalıcıdır. Birini başlatırsınız ve siz durdurana kadar çalışır—gerçek kullanıma bakılmaksızın, günde 24 saat, haftada 7 gün. Web sunucunuz için (her saatte trafiği yöneten), bu doğrudur. E-posta hizmeti için (e-posta patlamaları gönderen ve sonra saatlerce boşta olan), israftır.

Auto Scaling Grubu, yoğun olmayan saatlerde e-posta hizmetini tek bir örneğe indirebilir. Ama tek bir örnek hâlâ sürekli çalışır.

Tom faturaya bakarken sürekli geri döndüğü soru buydu: her hizmet o 18 saatlik %3 CPU sırasında aslında ne yapıyordu? Teknik olarak hiçbir şey değil—örnek bekliyordu, olayları kontrol ediyordu, durumunu koruyordu. Ama bir iş perspektifinden: hiçbir şey. Hizmet değer sunmuyordu. Fatura kesiyordu.

Çoğu zaman gerçekten boşta olan iş yükleri için, her zaman açık bir EC2 örneği, yalnızca hafta sonları ziyaret ettiğiniz bir daireye kira ödemektir. Daire sizindir; kira durmaz.

Serbest çalışan modeli bunu tamamen çözer. Kod mevcuttur. Sadece onu çalıştırmak için bir neden olana kadar çalışmaz. Boşta maliyet yok. Ayrılmış kapasite yok. Telefon başında bekleyen sunucu yok.

İşte **sunucusuz hesaplamanın (serverless computing)** öncülü budur.

**AWS Lambda: Sunucusuz Kod**

**AWS Lambda**, sunucuları temin etmeden veya yönetmeden olaylara yanıt olarak kod çalıştırmanıza olanak tanır. Bir fonksiyon yüklersiniz, onu neyin tetiklediğini belirtirsiniz ve Lambda, tetikleyici ateşlendiğinde onu çalıştırır.

Bir Lambda fonksiyonu:

- Kalıcı durumu yoktur (her çağrı bağımsızdır)
- Çağrı başına 15 dakikaya kadar çalışır
- 0'dan binlerce eş zamanlı çağrıya otomatik olarak ölçeklenir
- Yalnızca çalışırken faturalandırılır (yürütmenin her 1 ms'si için, yukarı yuvarlanır, tahsis edilen GB bellek başına)

Tetikleyici olmadığında, Lambda hiçbir maliyet oluşturmaz. Tetikleyiciler ateşlendiğinde, Lambda çalışır ve ücret alır. 10.000 tetikleyici aynı anda ateşlendiğinde, Lambda 10.000 eş zamanlı çağrı çalıştırır. Ölçeklendirme otomatik ve neredeyse anlıktır.

**Olay Tetikleyicileri: Lambda'yı Uyandıran Şey**

Lambda fonksiyonları kendi başlarına çalışmaz—olaylara yanıt verir. Yaygın tetikleyiciler şunları içerir:

- **SQS kuyruğu**: Bir kuyruktan mesajları işler. Lambda kuyruğu yoklar ve fonksiyonu mesaj gruplarıyla çağırır.
- **API Gateway**: Bir HTTP isteği gelir. API Gateway Lambda'yı tetikler. Lambda bir yanıt üretir.
- **S3 olayı**: Bir dosya S3'e yüklenir. Lambda onu işler (bir görüntüyü yeniden boyutlandırır, bir CSV ayrıştırır, bir belgeyi doğrular).
- **SNS**: Bir konuya bir mesaj yayınlanır. Lambda bilgilendirilir.
- **DynamoDB Streams**: DynamoDB'deki bir kayıt değişir. Lambda değişikliği işler.
- **CloudWatch Events (EventBridge)**: Zamanlanmış bir olay (bir cron işi gibi) tanımlanmış bir zamanda çalışır.
- **ALB**: Yük dengeleyiciye bir HTTP isteği gelir. Lambda belirli rotaları ele alabilir.

Nimbus için, e-posta hizmeti SQS kuyruğu tarafından tetiklenen bir Lambda fonksiyonu hâline geldi. Kuyruğa bir mesaj geldiğinde, Lambda mesaj içeriğiyle çağrılır, SES (Simple Email Service) aracılığıyla e-postayı gönderir ve çıkar.

Sıfır sunucu. Sıfır boşta zaman. Boştayken sıfır maliyet.

Lambda + SQS kalıbı içselleştirmeye değer: SQS kuyruğu, dayanıklılığı, yeniden deneme mantığını ve DLQ'yu halleder. Lambda işlemeyi halleder. SQS'nin ayrıştırma faydalarını, Lambda'nın sıfıra ölçeklenme ekonomisiyle elde edersiniz. Hiçbir hizmet diğerinin işini yapmaz. Temiz bir şekilde birleşirler.

"Kuyrukta hatalı biçimlendirilmiş bir mesajla ne olur?" diye sordu Priya. "Kötü girdi, Lambda'yı hesaptaki diğer fonksiyonları etkileyecek şekilde çökertebilir mi?"

Lambda çağrıları birbirinden izoledir. Çöken bir fonksiyon diğer fonksiyonları etkilemez. Hatalı biçimlendirilmiş bir mesajda işlenmeyen bir istisna atan bir Lambda: mesaj kuyruğa geri döner, yapılandırılan sınıra kadar yeniden denenir, sonra DLQ'ya taşınır. Lambda'nın kendisi bir sonraki mesaj için kullanılabilir kalır. Lambda işleyicisinin içindeki girdi doğrulaması hâlâ önemlidir—hatalı verileri işlemeye çalışmadan önce yakalamak için—ama tek bir kötü mesaj fonksiyonu çökertemez.

**Soğuk Başlatma Problemi**

Lambda fonksiyonları **yürütme ortamlarında (execution environments)** çalışır—küçük, izole konteynerler. Bir fonksiyon çağrıldığında:

1. AWS sıcak bir yürütme ortamının mevcut olup olmadığını kontrol eder (yakın zamanda bir çağrıyı ele almış olan)
2. Sıcaksa: fonksiyon hemen çalışır
3. Soğuksa: AWS yeni bir yürütme ortamı başlatır—kodunuzu indirir, çalışma zamanını başlatır, başlatma kodunuzu çalıştırır—sonra fonksiyonu çalıştırır

Bir **soğuk başlatma (cold start)**, çalışma zamanına (Java ve .NET, Python ve Node.js'den daha uzun soğuk başlatmalara sahiptir) ve kod paketinizin boyutuna bağlı olarak 100ms ile birkaç saniye arası gecikme ekler.

Şunu merak ediyor olabilirsiniz: Lambda her seferinde sıfırdan başlıyorsa, bu onu zaten çalışan bir sunucudan daha yavaş yapmaz mı? Evet—bazen. Soğuk başlatma problemi budur ve zamana duyarlı, kullanıcıya dönük API'ler için önemlidir. Kullanıcının zaten onayını aldığı arka plan işleri için hiç önemli değildir. Arka planda çalışan bir e-posta hizmetindeki 200ms'lik bir soğuk başlatma kimseye görünmez.

Asenkron işleme (e-posta gönderme, görüntü yeniden boyutlandırma) için, soğuk başlatmalar kullanıcılara görünmezdir.

Senkron API'ler (bir kullanıcının yanıt beklediği HTTP istekleri) için, soğuk başlatmalar ara sıra yavaş yanıtlara neden olabilir.

**Hafifletme yöntemleri**:

- **Provisioned concurrency (tahsisli eş zamanlılık)**: Belirli sayıda yürütme ortamını önceden ısıtın. Her zaman hazırdırlar. İstekleri işlemediklerinde bile bunun için ödersiniz.
- **Daha küçük paket boyutları**: Daha küçük kod daha hızlı başlatılır.
- **Isınma çağrıları**: Fonksiyonları sıcak tutmak için zamanlanmış pingler (yaygın ama zarif olmayan bir yaklaşım).
- **Doğru çalışma zamanını seçin**: Python ve Node.js, Java'dan daha hızlı soğuk başlatır.

**Gerçek Bir Soğuk Başlatma Araştırması**

Lambda göçünden iki hafta sonra, Leo bir restoran ortağından bir Slack mesajı aldı: "Sipariş onayı bazen 3 saniye sürüyor. Genellikle hızlı. Ne oluyor?"

Leo, Lambda fonksiyonu için CloudWatch metriklerini açtı. "Duration" grafiğinde bir kalıp görebiliyordu: 15-20 dakikadan uzun herhangi bir boşluktan sonraki ilk çağrı 2.800-3.200 milisaniyeye fırlıyordu. Sonraki çağrılar: 180-220 milisaniye.

Klasik soğuk başlatmalar.

3 saniyelik çağrılardan biri için X-Ray izini çekti. Zaman çizelgesi bunu açıkça gösterdi:

- Başlatma aşaması: 2.640ms (fonksiyon kodunu indirme, Node.js çalışma zamanını başlatma, modül düzeyinde başlatma kodunu çalıştırma)
- İşleyici fonksiyon yürütmesi: 290ms

Sorun başlatma aşamasıydı. Başlatma koduna baktı. Fonksiyon büyük bir SDK içe aktarıyor, bir veritabanı bağlantısı başlatıyor ve AWS Secrets Manager'dan yapılandırma yüklüyordu—hepsi başlangıçta.

"Bu başlatmanın bir kısmının yalnızca yürütme ortamı başına bir kez gerçekleşmesi gerekiyor," dedi Leo. "Ama her soğuk başlatmada gerçekleşiyor."

Lambda kodunu, veritabanı bağlantısını işleyici fonksiyonun dışında başlatacak şekilde yeniden yapılandırdı (böylece sıcak çağrılar arasında yeniden kullanılır) ve kullanılmayan SDK modüllerini kaldırarak paket boyutunu azalttı. Ayrıca tüm AWS SDK'sını paketlemekten, yalnızca ihtiyaç duyduğu belirli hizmetleri içe aktarmaya geçti.

Optimizasyondan sonra:

- Soğuk başlatma süresi: 1.100ms (hâlâ mevcut, ama daha az şiddetli)
- Sıcak çağrılar: 165ms

1,1 saniyelik soğuk başlatma hâlâ ara sıra oluyordu. E-posta hizmeti için (asenkron, kullanıcıya dönük gecikme görünmez), bu kabul edilebilirdi. Restoran bildirim Lambda'sı için (müşteriye dönük, bir tabletten sipariş edilen), Priya provisioned concurrency için ısrar etti: her zaman hazır iki önceden ısıtılmış ortam.

"Bu ayda ne kadara mal oluyor?" diye sordu Tom.

256MB'da iki provisioned concurrency ortamı: ayda yaklaşık 5,40 dolar. Gecikme sıçramaları durdu.

**Lambda Fiyatlandırması: Tom Neden Gülümsedi**

Lambda fiyatlandırmasının iki bileşeni vardır:

1. **İstek ücreti**: Milyon çağrı başına 0,20 dolar
2. **Süre ücreti**: GB-saniye başına 0,0000166667 dolar (tahsis edilen bellek × çalışma saniyesi)

Aylık ilk milyon istek ücretsizdir (her zaman, yalnızca ilk yılda değil).

"Bu ayda ne kadara mal oluyor?" diye sordu Tom, Leo hesap makinesini açamadan.

Tom e-posta hizmeti için matematiği kendisi yaptı:

- Her günün bir Cuma olduğunu varsayalım—en kötü durum: günde 1.200 e-posta × 30 gün = ayda 36.000 çağrı
- Her çağrı 256MB bellekte ~2 saniye sürer
- Süre: 36.000 × 2 × 0,25GB × 0,0000166667 $ = ayda 0,30 $
- İstekler: 36.000 << 1.000.000 (ücretsiz katman) = ayda 0,00 $

"Ve o 18.000 GB-saniye, her zaman ücretsiz olan 400.000 GB-saniyelik sürenin epeyce içinde," diye ekledi Tom. "Yani gerçek ücret sıfır olurdu. Ama ücretsiz katmanı bilerek göz ardı ediyorum—gerçek birim maliyeti bilmek istiyorum."

E-posta hizmeti için EC2 örneği: ayda 18 dolar.

"Onu zaten dağıttım—ah." Leo kendini durdurdu. E-posta hizmeti Lambda'sını DLQ yapılandırmasını bitirmeden önce üretime göndermişti. "Bana beş dakika ver."

Tom bir an sessiz kaldı. Sonra: "Bunu her şey için yapmalıyız."

**Lambda Neyde İyidir (ve Neyde Değildir)**

"Bekle—ama o zaman *neden* her şey için Lambda kullanmayalım?" diye sordu Maya. "Daha ucuz ve otomatik ölçekleniyorsa, işin püf noktası ne?"

"15 dakikalık sınır," dedi Leo. "Ve kullanıcıya dönük herhangi bir şey için soğuk başlatmalar. Ve durumsuzluk—çağrılar arasında bellekte hiçbir şey tutamazsınız."

İş yükünüz ani, olay odaklı ise ve 15 dakikadan kısa sürede tamamlanıyorsa, Lambda her zaman açık bir EC2 örneğinin bir kesrine mal olur—ama iş yükünüz 15 dakikalık sınıra yaklaşan veya onu aşan uzun süreli bir veri işleme işiyse, Lambda yanlış araçtır ve ECS, Batch veya EC2 tabanlı bir yaklaşıma ihtiyacınız olur.

Lambda şunlarda mükemmeldir:

- **Olay odaklı işleme**: Olaylara yanıt verme (dosya yüklemeleri, kuyruk mesajları, zamanlanmış görevler)
- **Kısa süreli görevler**: 15 dakikanın çok içinde tamamlanan işleme
- **Ani, öngörülemeyen trafik**: Lambda 0'dan binlere anında ölçeklenir—önceden temin etmeye gerek yok
- **Seyrek işlemler**: Her gün sabah 2'de çalışan bir rapor. Haftalık çalışan bir temizleme işi.
- **Tutkal (glue) kodu**: Hizmetler arasında veri taşıyan küçük fonksiyonlar

Şunu merak ediyor olabilirsiniz: aniden 10.000 olay aynı anda geldiğinde Lambda'nın ölçeklenmesine ne olur? Lambda'nın varsayılan eş zamanlılık sınırı hesap başına 1.000 eş zamanlı yürütmedir. 10.000 olay aynı anda gelirse, 1.000'e kadar çağrı hemen çalışır; geri kalanı SQS kuyruğunda bekler (SQS aracılığıyla tetiklenmişse) ve kapasite serbest kaldıkça işlenir. Bu genellikle kuyruk tabanlı işleme için sorun değildir. Gecikmeye duyarlı kullanım durumları için, Lambda'nın patlama sınırı (yeni eş zamanlı yürütmelerin eklendiği başlangıç hızı) ani sıçramalar sırasında kısa kısıtlamalara neden olabilir—provisioned concurrency, kapasiteyi önceden tahsis ederek bunu atlatır.

Nimbus'un e-posta hizmeti için mevcut ölçeklerinde, 1.000 eş zamanlı çağrı ihtiyaç duyacaklarından çok daha fazlasıydı. Ama ona ulaşmadan önce bilinmesi gereken doğru kısıtlamadır.

Lambda şunlarda zayıftır:

- **Uzun süreli süreçler**: 15 dakikalık sınır sert bir duvardır
- **Durum bilgisi olan uygulamalar**: Lambda fonksiyonları tasarım gereği durumsuzdur—her çağrı bağımsızdır
- **Yüksek verimli, düşük gecikmeli API'ler**: Soğuk başlatmalar gecikme sıçramalarına neden olabilir; provisioned concurrency bunu hafifletir ama maliyet ekler
- **Kalıcı bağlantılara ihtiyaç duyan uygulamalar**: Lambda kolayca uzun ömürlü bir veritabanı bağlantı havuzu sürdüremez (RDS Proxy gibi bağlantı havuzu araçları yardımcı olsa da)
- **Geleneksel web sunucuları**: Mümkün, ama doğal uyum değil

**15 Dakikalık Duvar: Lambda Yanlış Araç Olduğunda**

Göçten üç hafta sonra, Leo bir iş yükünü daha Lambda'ya taşımayı denedi: gecelik analiz rapor oluşturucusu. Veritabanından sipariş verilerini çekiyor, restoran meta verileriyle birleştiriyor, istatistikleri hesaplıyor ve bir PDF oluşturuyordu.

İlk gece, Lambda çağrısı bir zaman aşımı hatasıyla başarısız oldu.

"Rapor oluşturma 17 dakika sürdü," dedi Leo ertesi sabah.

"Lambda'nın maksimumu 15," dedi Priya.

"Evet. Bunu artık biliyorum."

Ortalama işleme süresini (8 dakika) kontrol etmiş ve Lambda'nın işe yarayacağını varsaymıştı. Kuyruğu kontrol etmemişti—veri hacminin daha yüksek olduğu ve sorgunun daha uzun sürdüğü geceleri. O gecelerde, 15 dakika yeterli değildi.

"Yani rapor sadece... oluşturulmuyor mu?" diye sordu Maya.

"Doğru. Hata bildirimi yok. Kısmi rapor yok. Sadece sessizlik."

"Onu zaten dağıttım—ah," dedi Leo.

Bu, Lambda'nın zarif olmayan bir şekilde başarısız olduğu belirli yollardan biriydi: bir zaman aşımı hiçbir çıktı, uygulamada hata mesajı üretmez, sadece bir CloudWatch hata günlüğü. Lambda zaman aşımı hatalarını özel olarak izlemiyorsanız, günlerce fark etmeyebilirsiniz.

Çözüm: rapor oluşturucusunu ECS Fargate'e taşımak—sunucuları yönetmeden konteynerler; sonraki bölüm—zaman sınırı yoktur. Lambda, ara sıra bile 15 dakikayı aşabilecek iş yükleri için yanlış araçtı. Ders "Lambda kötü" değildi. Ders "Lambda, kısıtlamalarına uyan iş yükleri için doğru araçtır—ve uymadıklarında şaşırtıcı arızaların kaynağıdır."

**RDS Proxy: Lambda İçin Bağlantı Havuzlama**

Lambda'nın durumsuz doğası belirli bir veritabanı sorunu yaratır.

Bir EC2 örneği RDS'ye bağlandığında, kalıcı bir bağlantı havuzu sürdürür. Uygulama havuzdaki bağlantıları yeniden kullanır. RDS, diyelim ki, 200 eş zamanlı bağlantıyı yönetebilir.

Lambda 500 eş zamanlı çağrıyı yönettiğinde, her çağrı kendi veritabanı bağlantısını açmaya çalışır. Bu 500 yeni bağlantı demektir—200 destekleyen bir veritabanını boğar.

**Amazon RDS Proxy**, Lambda fonksiyonları ile RDS arasında oturur, kalıcı bir bağlantı havuzu sürdürür ve Lambda'nın kısa ömürlü bağlantılarını onun üzerinden çoğullar (multiplex).

Şu yerine: Lambda çağrısı → yeni RDS bağlantısı (500 eş zamanlı çağrının her biri için)

RDS Proxy ile: Lambda çağrısı → RDS Proxy → 20 kalıcı RDS bağlantısı havuzu

"Proxy'nin RDS kimlik bilgilerine ihtiyacı var," dedi Priya. "Bunlar nerede yaşıyor? Onları saklıyor mu?"

RDS Proxy kimlik bilgilerini Secrets Manager'da saklar ve onları otomatik olarak döndürür. Lambda fonksiyonunun IAM rolü, ona proxy'ye erişim verir (IAM kimlik doğrulaması kullanarak), doğrudan RDS kimlik bilgilerine değil. Kimlik bilgileri Lambda koduna asla maruz kalmaz.

"Yani Lambda fonksiyonu IAM aracılığıyla kimlik doğrular," diye onayladı Leo, "ve proxy gerçek veritabanı kimlik bilgilerini halleder."

Nimbus'un sipariş işleme Lambda'sı için (sipariş doğrulama için RDS'yi sorgulayan), RDS Proxy yoğun Cuma trafiği sırasında bağlantı havuzu tükenmesini ortadan kaldırdı.

**Lambda Layers: Paylaşılan Bağımlılıklar**

E-posta hizmeti Lambda'sı, bildirim Lambda'sı ve rapor Lambda'sı, hepsi aynı dahili kütüphane kodunu paylaşıyordu: para birimini biçimlendirme, girdileri temizleme, standart biçimde günlükleme için yardımcı fonksiyonlar.

Lambda Layers olmadan, bu paylaşılan kodun her fonksiyonun dağıtım paketine paketlenmesi gerekiyordu. Üç fonksiyon, aynı 2MB kütüphanenin üç kopyası. Kütüphane güncellendiğinde, üç fonksiyonun da yeni dağıtımlara ihtiyacı vardı.

**Lambda Layers**, Lambda fonksiyonlarının çalışma zamanında referans verebileceği ayrı paketlerdir. Paylaşılan kütüphane bir katmana çıkarıldı. Üç fonksiyon katmana referans verdi. Paylaşılan kütüphanedeki güncellemeler, katman sürümünü güncellemek anlamına geliyordu—üç fonksiyonu da yeniden dağıtmak değil.

Ek fayda: daha küçük bireysel fonksiyon paketleri daha hızlı soğuk başlatmalar demektir.

"Katmanların değiştirmediği bir şey: yürütme rolü," dedi Priya. "Bir Lambda'nın çok geniş izinleri varsa, ele geçirilmiş bir fonksiyon hesaptaki her şeye erişebilir."

"EC2 rolleriyle aynı ilke," dedi Leo. "En az ayrıcalık. Her Lambda yalnızca gerçekten ihtiyaç duyduğu izinleri alır."

"Yani Lambda EC2'nin yerine geçmez," dedi Maya. "Farklı işler için farklı bir araçtır."

"Nimbus web API'si EC2 veya ECS'de kalır," diye onayladı Leo. "E-posta hizmeti, görüntü yeniden boyutlandırıcı, gecelik rapor oluşturucu, günlük temizleyici—bunlar Lambda'ya taşınır."

**Sunucusuz Felsefe**

Lambda daha geniş bir kavramın parçasıdır: **sunucusuz (serverless)**—hiçbir sunucu yönetmediğiniz, yalnızca kod yönettiğiniz uygulamalar inşa etmek.

Tamamen sunucusuz bir Nimbus yığını şöyle görünebilir:

- API Gateway + Lambda (web sunuculu EC2 yerine)
- DynamoDB (RDS yerine—aynı zamanda sunucusuz, sunucu yönetimi yok)
- S3 (statik varlıklar—doğası gereği sunucusuz)
- SNS + SQS (mesajlaşma—sunucusuz)
- Lambda (tüm arka plan işleme)

Cazibesi: kodu yazarsınız; AWS geri kalan her şeyi yönetir. Yamalama yok, ölçekleme yapılandırması yok, kapasite planlaması yok.

## Amazon API Gateway

Lambda tetikleyici listesi API Gateway'den kısaca bahsetti: HTTP isteği gelir, API Gateway Lambda'yı tetikler. Bu doğrudur, ama API Gateway'in gerçekte ne olduğunu hafife alır.

"Bekle—ama API Gateway'i *neden* Lambda'nın önüne koyalım?" diye sordu Maya. "Lambda doğrudan HTTP isteklerini alamaz mı?"

Lambda, bir fonksiyon URL'si aracılığıyla HTTP isteklerini alabilir—basit, doğrudan bir HTTPS uç noktası. Ama yönlendirmeyi, yetkilendirmeyi, kısıtlamayı, önbelleğe almayı veya istek dönüşümünü ele almaz. Bir üretim API'si için, bu endişeler arka ucunuzun Lambda veya EC2 olmasına bakılmaksızın vardır.

**Amazon API Gateway**, herhangi bir ölçekte API'ler oluşturmak, dağıtmak ve yönetmek için tam yönetilen bir hizmettir. Trafik yönetimini, yetkilendirmeyi, kısıtlamayı, önbelleğe almayı ve izlemeyi ele alır, böylece Lambda fonksiyonunuzun (veya EC2'nin veya herhangi bir HTTP arka ucunun) bunları kendisi uygulaması gerekmez.

**Üç API türü:**

**REST API** en zengin özellikli seçenektir. İstek ve yanıt dönüşümünü, yanıt önbelleğe almayı, API anahtarlarına bağlı kullanım planlarını ve tüm yetkilendirme türlerini destekler. API Gateway'den bahseden çoğu SAA-C03 sınav sorusu REST API'yi içerir.

**HTTP API** daha basit ve daha ucuzdur—REST API'den kabaca %70 daha az maliyet. Lambda arka uçları ve HTTP proxy'leri için tasarlanmıştır. OIDC ve OAuth 2.0 yetkilendirmesini destekler ama istek dönüşümünü veya önbelleğe almayı desteklemez. REST API'nin gelişmiş özelliklerine ihtiyacınız yoksa, HTTP API doğru seçimdir.

**WebSocket API**, kalıcı iki yönlü bağlantıları yönetir. API Gateway bağlantı yaşam döngüsünü yönetir ve mesaj içeriğine göre mesajları Lambda'ya yönlendirir. Lambda fonksiyonunun soket durumunu yönetmesine gerek yoktur—API Gateway bunu yapar.

**Yetkilendirme seçenekleri** (sınavın test ettikleri):

**Cognito User Pool yetkilendiricisi**, bir Cognito User Pool'dan bir JWT doğrular. Lambda gerekmez. API Gateway tokenı kendisi kontrol eder. Geçerliyse, istek geçer.

**Lambda yetkilendiricisi**, bir tokenı doğrulamak için kendi Lambda fonksiyonunuzu çalıştırır—özel bir JWT, üçüncü taraf bir kimlik sağlayıcısından bir OAuth tokenı, tescilli bir formatta bir API anahtarı. Lambda bir IAM politikası döndürür. Politika eylemi izin veriyorsa, istek devam eder.

**API anahtarı**, bir istek başlığında iletilen basit bir anahtardır. API anahtarları, kimlik doğrulama için değil, istemci başına hız sınırlama içindir. Onları bir güvenlik mekanizması olarak kullanmayın—gizli değiller, tanımlayıcılardır.

**Kısıtlama (throttling) ve kullanım planları:**

Varsayılan olarak, API Gateway hesap düzeyinde saniyede 10.000 isteğe izin verir (yumuşak bir sınır), 5.000'lik bir patlamayla. Bunu aşın ve istemciler bir `429 Too Many Requests` alır—arka ucunuz onu hissetmez bile. İstemci başına sınırlara ihtiyaç duyduğunuzda, bir kullanım planı oluşturursunuz: onu bir API anahtarına ekleyin, bir istek hızı ve günlük veya aylık kota belirleyin. Bir istemcinin patlamaları başka bir istemcinin tahsisini tüketmez.

Akılda tutulmaya değer iki sayı: maksimum yük **10 MB** ve varsayılan entegrasyon zaman aşımı **29 saniye**—arka ucunuz daha uzun sürerse, ağ geçidi vazgeçer. (2024'ten beri, o zaman aşımı bir kota artışı aracılığıyla Bölgesel ve özel REST API'ler için 29 saniyenin ötesine yükseltilebilir—ama sınavın beklediği hâlâ 29 saniyelik varsayılandır.) API Gateway uzun süreli işler için değil, istek/yanıt API'leri içindir; bunlar için işi SQS veya Step Functions'a verin ve hemen yanıt verin.

"Bu ayda ne kadara mal oluyor?" diye sordu Tom.

REST API için: milyon API çağrısı başına 3,50 dolar, artı GB veri aktarımı başına 0,09 dolar. Küçük-orta trafik için, esasen ücretsizdir. Yüksek hacimli API'ler için, HTTP API'nin daha düşük fiyat noktası anlamlı hâle gelir.

Leo daha önce yazdığı Lambda tetikleyici listesine işaret etti. "Yani API Gateway sadece Lambda'yı tetiklemenin bir yolu değil. Lambda'yı gerçek bir API gibi hissettiren şey."

"Lambda fonksiyonu iş mantığını ele alır," dedi Priya. "API Gateway önündeki her şeyi ele alır—yönlendirme, kimlik doğrulama, kısıtlama, izleme. Her biri bir şey yapar."

"Peki birisi API Gateway'i atlayarak Lambda'yı doğrudan çağırmaya çalışırsa?"

"Lambda yürütme politikası yalnızca API Gateway'den gelen çağrılara izin verir," dedi Priya. "Lambda'daki kaynak tabanlı politika diğer her şeyi reddeder."

Gerçeklik: sunucusuz kendi operasyonel karmaşıklığına sahiptir—dağıtık Lambda fonksiyonlarını ayıklamak, soğuk başlatmaları yönetmek, eş zamanlılık sınırlarını anlamak. Daha basit değil, sadece farklı.

"Bekle—ama sunucusuz neden 'daha basit değil'?" diye sordu Maya. "Tüm vaat, operasyonel yükü kaldırması."

"Bazı operasyonel yükü kaldırır," dedi Leo. "Altyapı temini, yamalama, ölçekleme yapılandırması—bunlar gider. Geriye kalan farklıdır: soğuk başlatma yönetimi, SSH ile bağlanamayacağınız fonksiyonlar arasında dağıtık izleme, eş zamanlılık sınırları, fonksiyon sürümlerini ve takma adlarını yönetme, Katman güncellemelerinin nasıl yayıldığını anlama, 15 dakikalık zaman aşımlarıyla zarif bir şekilde başa çıkma."

"Yani yük kayar," dedi Priya. "Altyapı operasyonlarından fonksiyon operasyonlarına."

"Evet. Birçok iş yükü için—özellikle olay odaklı, küçük, ani olanlar—bu daha iyi bir takastır. Mühendislerin etkileşime girmesi ve ayıklaması gereken uzun süreli bir uygulama sunucusu için, EC2 veya konteynerler çoğu zaman doğru seçim olmaya devam eder."

Şunu merak ediyor olabilirsiniz: sunucusuz gelecek mi ve eninde sonunda her şey Lambda'ya mı taşınmalı? Dürüst cevap, iş yüküne bağlı olduğudur. Sunucusuz, olay odaklı işlemeye hâkim oldu. HTTP API'lerinde önemli ilerlemeler kaydetti (API Gateway + Lambda aracılığıyla). Her zaman açık uygulama sunucularının, uzun süreli toplu işlemenin veya durum bilgisi olan hizmetlerin yerini almadı—ve muhtemelen almayacak, çünkü bu kullanım durumları Lambda'nın modelinden faydalanmaz. Doğru araç sorusu asla yok olmaz; sadece zamanla farklı seçeneklere uygulanır.

## Güçlü Yönler ve Sınırlamalar

**Lambda Neden Güçlüdür**:

- Gerçek kullanım başına ödeme—boştayken sıfır maliyet
- Yapılandırma olmadan otomatik ölçeklendirme
- Yamalanacak veya bakımı yapılacak sunucu yok
- Cömert ücretsiz katman (ayda 1 milyon istek, sonsuza dek ücretsiz)
- AWS'nin geri kalanıyla sıkı entegrasyon
- RDS Proxy ve Lambda Layers, en yaygın iki Lambda sorununu (bağlantı havuzlama ve kod paylaşımı) mimari değişiklikler gerektirmeden ele alır

**Karmaşıklaştığı Yer**:

- Soğuk başlatmalar gerçektir ve gecikmeye duyarlı iş yükleri için dikkatli ele almayı gerektirir
- 15 dakikalık yürütme sınırı uzun süreli görevleri hariç tutar
- Ayıklama daha zordur—SSH ile bağlanılacak kalıcı bir sunucu yok
- Durumsuz tasarım tüm durumu dışsallaştırmayı gerektirir (veritabanı, önbellek, S3)
- Eş zamanlılık sınırları (hesap başına varsayılan 1.000 eş zamanlı çağrı) ölçekte kısıtlayabilir
- VPC'ye bağlı Lambda fonksiyonlarının ek gecikme ve soğuk başlatma sorunları vardır

**SSH Olmadan Lambda İzleme**

Bir Lambda fonksiyonunda ilk kez bir şey bozulduğunda, Leo'nun içgüdüsü SSH ile bağlanıp sürece bakmaktı. SSH ile bağlanılacak bir süreç yok. Lambda'nın yürütme ortamları geçicidir ve erişilemezdir.

Lambda'yı ayıklamak farklı bir araç setini öğrenmeyi gerektirir:

**CloudWatch Logs**: Her Lambda çağrısı stdout/stderr'sini bir CloudWatch Log Grubuna yazar. Yapılandırılmış günlükleme (JSON formatı) bunları filtrelenebilir kılar. En yararlı alanlar: fonksiyon adı, çağrı kimliği, süre, hata türü ve özel korelasyon kimliğiniz.

**CloudWatch Metrics**: Lambda, Invocations, Duration, Errors, Throttles ve ConcurrentExecutions metriklerini otomatik olarak yayınlar. Errors ve Throttles üzerinde alarm kurmak, herhangi bir Lambda dağıtımının birinci günü olmalıdır.

**AWS X-Ray**: Lambda için dağıtık izleme. Küçük bir ek yük ekler (çağrı başına 2-5ms) ama fonksiyonun içinde zamanın nerede harcandığına dair bir alev grafiği (flame graph) verir. Soğuk başlatma analizi için gereklidir—X-Ray başlatma aşamasını işleyici aşamasından ayrı gösterir.

**Lambda Insights**: Lambda için gelişmiş izleme, CloudWatch Lambda Insights aracılığıyla kullanılabilir. Standart metriklere bellek kullanımı, CPU zamanı ve başlatma süresi ekler. Biraz daha fazla maliyetlidir ama üretim fonksiyonları için buna değer.

"Peki birisi yürütme ortamı aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "Lambda fonksiyonları izole konteynerlerde çalışır, ama bir bağımlılığın bir güvenlik açığı varsa, bir saldırgan Lambda'mızın içinde kod yürütme elde edebilir mi?"

Hafifletmeler: bağımlılıkları minimum ve güncel tutun (soğuk başlatma analizi Leo'yu zaten paket boyutlarını azaltmaya itmişti), paylaşılan kütüphaneleri sürümlemek için Lambda Layers kullanın ve Lambda yürütme rolüne gereken minimum izinleri verin. Fonksiyon yalnızca belirli bir S3 paketine yazabiliyor ve belirli bir DynamoDB tablosunu sorgulayabiliyorsa, ele geçirilmiş bir fonksiyonun patlama yarıçapı tam olarak bununla sınırlıdır.

"Lambda yürütme rolleri için en az ayrıcalık isteğe bağlı değildir," dedi Priya. "Bir şeyler ters gittiğinde hasarı sınırlayan şey budur."

Haklıydı. Ve çoğu güvenlik tavsiyesi gibi, aynı zamanda sadece iyi mühendislikti.

## Özet

Bölüm 19'daki SQS/SNS mimarisi, işi kabul etme ve onu işleme endişelerini ayırdı. Lambda bunu daha ileri götürür: işi işleme ve onu yapacak kapasite için ödeme yapma endişelerini ayırır.

- **AWS Lambda**, sunucuları yönetmeden olaylara yanıt olarak kod çalıştırır.
- **Kullanım başına ödeme**: çağrı başına ve yürütmenin her 1 ms'si başına (yukarı yuvarlanır) faturalandırılır. Boştayken sıfır maliyet.
- 0'dan binlerce eş zamanlı çağrıya otomatik olarak ölçeklenir.
- **Soğuk başlatmalar**: sıcak bir yürütme ortamı olmadığında başlatma gecikmesi. Provisioned concurrency veya hafif çalışma zamanlarıyla hafifletilir.
- **Lambda Layers**: birden fazla fonksiyonun referans verebileceği paylaşılan kod paketleri, yinelemeyi ve paket boyutunu azaltır.
- **RDS Proxy**: Lambda ile RDS arasında kalıcı bir veritabanı bağlantı havuzu sürdürerek Lambda'nın bağlantı tükenmesi sorununu çözer.
- **İzleme**: CloudWatch Logs, Metrics, X-Ray izleme ve Lambda Insights kullanın—SSH ile bağlanılacak sunucu yok.
- En iyisi: olay odaklı, kısa süreli, ani veya seyrek iş yükleri.
- İdeal değil: uzun süreli görevler (15 dakikalık sert sınır), durum bilgisi olan uygulamalar, provisioned concurrency olmadan yüksek verimli düşük gecikmeli API'ler.
- **Sunucusuz** bir tasarım felsefesidir—altyapıyı değil, kodu yönetirsiniz. Operasyonel karmaşıklık kayar, yok olmaz.

## Sınav İpuçları

*SAA-C03 Alanı: Dayanıklı Mimariler Tasarlama (Alan 2, Görev 2.1)*

- **Lambda + S3**: Klasik kalıp—S3'e yüklenen dosya, işleme için Lambda'yı tetikler (küçük resim oluşturma, virüs taraması, veri dönüştürme). Sunucu gerekmez.
- **Lambda + SQS**: Lambda SQS'yi yoklar ve grupları işler. SQS yeniden deneme/DLQ mekanizmasını sağlar. Lambda işlemeyi sağlar.
- **Lambda + API Gateway**: Sunucusuz HTTP API. API Gateway yönlendirme, kimlik doğrulama, kısıtlamayı ele alır. Lambda iş mantığını ele alır.
- **API Gateway türleri:** REST API = tam özellikler, istek dönüşümü, önbelleğe alma, kullanım planları. HTTP API = daha basit, daha ucuz, yalnızca OIDC/OAuth. WebSocket API = kalıcı çift yönlü bağlantılar. **Yetkilendirme:** Cognito yetkilendiricisi = Cognito JWT'yi yerel olarak doğrula. Lambda yetkilendiricisi = özel token doğrulama mantığı. API anahtarı = istemci başına hız sınırlama (kimlik doğrulama değil). Sınav tetikleyicisi: "sunucusuz REST API" → API Gateway + Lambda.
- **Soğuk başlatma sinyalleri**: "ilk istekte gecikme sıçramaları," "tutarsız yanıt süreleri" → soğuk başlatma. Çözüm: provisioned concurrency (para maliyetli), daha küçük paket, daha hafif çalışma zamanı.
- **Yürütme sınırları**: 15 dakika maksimum. 10GB maksimum bellek. Varsayılan olarak 512MB /tmp geçici depolama (10GB'a kadar yapılandırılabilir). Bu sınırlar sınav senaryolarında görünür.
- **Lambda zaman aşımı hataları sessizdir**: Bir Lambda fonksiyonu zaman aşımına uğrarsa, bir CloudWatch hatası üretir ama uygulama düzeyinde hata yanıtı üretmez. CloudWatch Lambda Timeout hatalarını açıkça izleyin. Leo'nun 17 dakikalık rapor oluşturucusu ilk gecesinde herhangi bir uygulama düzeyinde alarm olmadan böyle başarısız oldu.
- **VPC Lambda soğuk başlatmaları**: Bir VPC içindeki Lambda fonksiyonlarının ek soğuk başlatma gecikmesi vardır (ENI temini). AWS bunu Hyperplane ENI'lerle önemli ölçüde iyileştirdi, ama VPC Lambda soğuk başlatmaları hâlâ VPC olmayanlardan daha yavaştır. VPC kaynaklarına ihtiyaç duymayan Lambda fonksiyonları için VPC'den kaçının (yani RDS, ElastiCache veya diğer yalnızca VPC kaynaklarına bağlanmayan).
- **Lambda eş zamanlılığı**: Hesap başına varsayılan 1.000 eş zamanlı yürütme (artırılabilir). **Reserved concurrency (ayrılmış eş zamanlılık)**: bir fonksiyonun belirli sayıda yürütme almasını garanti et; diğer fonksiyonların onları tüketmesini önler. **Provisioned concurrency**: belirli sayıda yürütme ortamını önceden ısıt.
- **Olay kaynağı eşlemesi (event source mapping)**: SQS/DynamoDB Streams/Kinesis'i Lambda'ya bağlayan Lambda özelliği. Lambda kaynağı yoklar ve kayıtları gruplar.
- **Hesap sınırlarına ulaşma**: "uygulama ölçeklendikçe kısıtlanıyor / LimitExceeded" → sınırı **Service Quotas**'ta kontrol edin ve oradan bir artış talep edin (Lambda eş zamanlılığı gibi birçok kota ayarlanabilir; bazıları sert sınırlardır).
- **RDS Proxy**: Sınav sinyali: "Lambda fonksiyonları çok fazla veritabanı bağlantısına neden oluyor," "Lambda ile bağlantı havuzu tükenmesi." → RDS Proxy kalıcı bağlantıları sürdürür ve Lambda'nın kısa ömürlü bağlantılarını çoğullar.
- **Lambda Layers**: Sınav sinyali: "kodu birden fazla Lambda fonksiyonu arasında paylaş," "dağıtım paketi boyutunu azalt" → Lambda Layers.
- **Lambda + X-Ray**: Lambda için dağıtık izleme. Sınav senaryosu: "birden fazla Lambda fonksiyonu ve hizmet arasında istekleri izle" → Lambda'da X-Ray izlemeyi etkinleştir.
- **Lambda Destinations:** Asenkron Lambda çağrıları için, hem başarı hem de başarısızlık sonuçları için bir Destination (hedef) yapılandırabilirsiniz. Başarılı sonuçları SQS, SNS, EventBridge veya başka bir Lambda fonksiyonuna gönderin. Başarısızlıkları uyarı için SQS veya SNS'ye gönderin. Bu, asenkron çağrılar için DLQ'lara tercih edilen alternatiftir çünkü yalnızca başarısızlığı değil, hem başarı hem de başarısızlığı yakalar. Sınav sinyali: "başarılı Lambda sonuçlarını başka bir hizmete yönlendir" veya "asenkron Lambda'dan hem başarı hem başarısızlık sonuçlarını yakala" → Lambda Destinations. "Asenkron çağrı için yalnızca başarısız mesajları yakala" → DLQ hâlâ geçerlidir ama Destinations daha eksiksiz çözümdür.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Soğuk başlatma problemini açıklayın. Soğuk başlatmalar hangi tür uygulamada en sorunlu olurdu? Hangi türde kabul edilebilir olurdu?

*(İpucu: Gerçek zamanlı bir API'yi (kullanıcı yanıt bekliyor) asenkron bir arka plan işiyle (kullanıcı zaten onayını aldı ve başka şeyler yapıyor) karşılaştırın.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket tedarikçilerinden bir S3 paketi aracılığıyla ürün görüntüleri alıyor. Her görüntünün dört standart boyuta (küçük resim, küçük, orta, büyük) yeniden boyutlandırılması ve S3'e geri saklanması gerekiyor. Hacim öngörülemezdir—bazı günler 10 görüntü, bazı günler 100.000. İşleme görüntü başına 10 dakika içinde tamamlanmalı. Maliyet en aza indirilmeli.

Bu gereksinimleri EN İYİ hangi mimari karşılar?

A) S3 paketini uzun yoklamayla izleyen bir Auto Scaling Grubundaki EC2 örnekleri  
B) S3'te yeni görüntüleri her dakika kontrol eden bir cron işine sahip özel bir EC2 örneği  
C) S3 olaylarının kuyruğa yayınlandığı, bir SQS kuyruğu tarafından tetiklenen ECS Fargate görevleri  
D) Görüntüleri yeniden boyutlandıran ve sonuçları S3'te saklayan bir Lambda fonksiyonunu tetikleyen S3 olay bildirimi

**İpucu 1**: Öngörülemez hacim, sıfıra ölçeklenmeyi tercih eder. Hangi seçenek bunu yapar?

**İpucu 2**: Görüntü başına 10 dakika, Lambda'nın 15 dakikalık sınırı içindedir. Görüntü yeniden boyutlandırma işinin Lambda'nın kısıtlamalarına uyup uymadığını kontrol edin.

**İpucu 3**: 7/24 çalışan özel bir EC2 örneği pahalıdır ve ölçeklenmez.

**Cevap**: D

**Açıklama**: S3 olay bildirimleri, bir görüntü yüklendiğinde Lambda'yı tetikler. Lambda görüntüyü dört boyuta yeniden boyutlandırır ve sonuçları S3'te saklar. Lambda, öngörülemez hacmi önceden temin etmeden ele alarak 0'dan binlerce eş zamanlı çağrıya otomatik olarak ölçeklenir. Hiç görüntü işlenmediğinde sıfır maliyet.

**Neden A değil?** ASG'deki EC2 sıfıra ölçeklenmez—minimum bir örnek her zaman çalışır. S3'ü uzun yoklama yerel bir S3 olay mekanizması değildir. Ani iş yükleri için Lambda'dan daha yüksek maliyet.

**Neden B değil?** Özel bir EC2 örneği tek bir arıza noktasıdır, ölçeklenmez, 7/24 çalışır ve cron tabanlı bir yaklaşımın 60 saniyeye kadar tespit gecikmesi vardır.

**Neden C değil?** ECS Fargate işe yarar, ama daha karmaşıktır (konteyner yönetimi, ECR, görev tanımları gerektirir) ve Fargate görev başlatması on saniyelerden dakikalara kadar sürer—bir Lambda soğuk başlatmasından çok daha yavaş—bu da onu ani, olay odaklı iş için kötü bir uyum yapar. Bu kullanım durumu için Lambda daha basittir.

*SAA-C03 Alanı: Dayanıklı Mimariler Tasarlama — Görev 2.1*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus, önceki günün sipariş hacmine göre en iyi 10 restoranıyla sabah 5'te günlük bir rapor oluşturmak istiyor. Rapor DynamoDB verilerinden oluşturulur, PDF olarak biçimlendirilir, S3'te saklanır ve tüm restoran ortaklarına e-posta gönderilir.

Bunun için tam Lambda tabanlı hattı tasarlayın. Lambda'yı ne tetikler? PDF oluşturma 12 dakika sürerse ne olur? 5.000 restoran ortağı varsa ve hepsine e-posta göndermek zaman alırsa ne olur? Bir Lambda mı yoksa birden fazla mı kullanırdınız?

Ayrıca şunu düşünün: Lambda 14 dakika sonra zaman aşımına uğrarsa, 5.000 restoran e-postasından 4.500'ünü işlemiş olarak, ne olur? Lambda yeniden denendiğinde yinelenen e-postalar göndermekten nasıl kaçınırsınız? Bu Lambda'nın hangi IAM izinlerine ihtiyacı var ve gereken minimum küme nedir?

*(Tek bir doğru cevap yoktur. Amaç, Lambda'yı diğer hizmetlerle birleştirme pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Tom ayın sonunda faturayı inceledi.

E-posta hizmeti: EC2 faturasından gitmişti.
Görüntü yeniden boyutlandırma işi: gitmişti.
Gecelik temizleme görevi: gitmişti.
Günlük analiz raporu: gitmişti. (Rapor oluşturucu, 17 dakikalık zaman aşımı olayından sonra ECS Fargate'e taşınmıştı, ama Lambda işlem maliyeti sıfırdı çünkü artık farklı bir şekilde düzenleniyordu.)

Aylık toplam Lambda ücretleri: 5,47 dolar.

"Beş dolar," dedi Tom.

"Ve kırk yedi sent," diye yardımcı bir şekilde ekledi Leo.

Tom, bu hizmetlerin hepsinin EC2 örneklerinde olduğu önceki ayın faturasına baktı.

"Aynı iş yükleri için 187 dolar ödüyorduk."

"Lambda boşta zaman için ücret almaz," dedi Leo. "Ve bu hizmetlerin çoğu zamanın %90'ında boştaydı."

Tom CloudWatch grafiklerini bir kez daha açtı. E-posta hizmeti Lambda'sı 36.412 kez çağrılmıştı. Toplam süre: yaklaşık 18.200 GB-saniye. GB-saniye başına 0,0000166667 dolardan: 0,30 dolar—ve o bile nominaldı, çünkü 18.200 GB-saniye, her zaman ücretsiz olan 400.000 GB-saniyelik sürenin içinde rahatça oturuyordu. Gerçek satır kalemi sıfırdı.

"EC2 örneği ayda 18 dolardı," dedi Tom. "Otuz sent harcadık—ve bu, gerçek birim maliyeti bilelim diye ücretsiz katmanı göz ardı etmem. Fatura sıfır diyor."

"5,47 doların çoğu bildirim Lambda'sındaki provisioned concurrency'ydi—o, çalışsa da çalışmasa da fatura keser. Görüntü yeniden boyutlandırıcı, temizleme görevi ve geri kalanı ücretsiz katmanın içine sığar."

Tom uzun süre ekrana baktı.

"Sunucusuzun bir abartı sözcüğü olduğuna dair söylediğim her şeyi geri alıyorum," dedi.

"Bunu hiç söylemedin," dedi Leo.

"Çok yüksek sesle düşündüm."

Sonraki bölümde: herhangi bir sunucuyu ev gibi hissettiren nakliye konteyneri.
