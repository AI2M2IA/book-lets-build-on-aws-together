# Bölüm 33: Duruma Bağlı

Bu bölümden önce son bir nefes alın.

İmleç Maya'nın boş slaytında yanıp sönüyordu. Başlık: "Nimbus'ta Mimari." Onu sildi ve şunu yazdı: "Soru." Sonra odaya baktı ve slayta hiç ihtiyacı olmadığını fark etti.

**Özet: İncelemeden Sunuma**

Carlos ile yapılan mimari inceleme — artık altı ay ve birkaç yüz restoran lansmanı gerilerinde — ekibe bir yığın ADR ve kararlar hakkında, dağıtmadan önce daha temiz bir düşünme biçimi bırakmıştı. Maya yatırımcı sunumuna hazırlanırken, Carlos'un sorduğu her şeyin — ve kendisinin kendinden emin cevapladığı her şeyin — aynı temel mantığa dayandığını fark etti. Yatırımcılar nedenini soracaktı. Nimbus'u inşa ettiği iki yıl boyunca öğrenmişti ki cevap hiçbir zaman hizmet adı değildi. Cevap her zaman bir hizmeti doğru, diğerini yanlış kılan koşullar kümesiydi. Her mimari seçimi savunmasını isteyecek insanlarla dolu bir odaya girmek üzereydi. Hazırdı.

**Soru**

Neredeyse her mimari tartışmanın sonunda, biri eninde sonunda sorar: "Doğru cevap nedir?"

Ve tüm yazılım mühendisliğindeki en faydalı, en sinir bozucu, en dürüst ve en yanlış anlaşılan cevap şudur:

**Duruma bağlı.**

Soru cevaplanamaz olduğu için değil. Uzman kaçamak yaptığı için değil. Ama doğru cevap gerçekten, yapısal olarak, soruda olmayan bir bağlama bağlı olduğu için.

Bu bölüm "duruma bağlı"yı doğru şekilde söylemeyi öğrenmekle ilgilidir — ki bu da cümleyi tamamlayabilmek demektir.

"Ameliyat doğru tedavi mi?" diye sorulan bir doktoru düşünün. Kötü bir doktor hastayı muayene etmeden evet ya da hayır der. İyi bir doktor şöyle der: "Duruma bağlı — teşhise, hastanın yaşına, diğer rahatsızlıklarına ve beklersek ne olacağına." Cevap kaçamak değildir. Hassasiyettir. Tam bir cümleyle takip edilen "duruma bağlı", bir doktorun — ya da bir mimarın — söyleyebileceği en faydalı şeydir.

**Nimbus'un Sonu**

Başlangıçtan iki buçuk yıl sonra. Maya, Seattle'da bir konferans odasında, bir oda dolusu girişim sermayesi yatırımcısına sunum yapıyordu.

Nimbus büyümüştü: 947 restoran ortağı. Günlük 18.000 sipariş. Aylık 18 milyon $ GMV. Üç şehir aktif, iki tanesi daha açılıyor. İki saat dilimine yayılmış on dört mühendisten oluşan bir ekip.

Yatırımcıların soruları vardı. Onlardan biri — fonun teknik ortağı — öne eğildi.

"Hangi veritabanını kullanıyorsunuz?" diye sordu.

Maya tereddüt etmedi.

"Siparişler ve müşteri verisi için: Aurora PostgreSQL. Menü kataloğu için: DynamoDB. Oturum yönetimi ve önbellekleme için: ElastiCache Redis. Analitik için: S3 Parquet dosyaları üzerinde Athena, yüksek frekanslı pano sorguları için Redshift ile birlikte."

Başını salladı. "Siparişler için neden DynamoDB değil de Aurora?"

"Çünkü siparişlerin karmaşık ilişkisel yapısı var — menü öğelerine, müşteri hesaplarına, restoran adreslerine, ödeme yöntemlerine referans veriyorlar. Birden çok varlık arasında işlemsel tutarlılığa ihtiyacımız var. İlişkisel bir veritabanı bunun için doğru araç. DynamoDB'nin gücü, esnek şemayla yüksek verimli anahtar-değer erişimidir, ki bu da tam olarak menü kataloğunun erişim desenidir."

Bir şeyler yazdı. "Peki ya ölçeklendirme? Günde 18.000 sipariş dediniz. Bu ortalama dakikada yaklaşık 12. Zirve için nasıl tasarladınız?"

"Cuma akşam yoğunluğu ortalamanın yaklaşık 25 katı. ECS ve Aurora Serverless v2 ile yatay olarak ölçeklendiriyoruz, ki bu da ani yükü otomatik olarak işler. CloudFront statik içerik yükünü emer. API durumsuz, dolayısıyla yatay ölçeklendirme temiz."

"Peki ya Aurora Serverless v2 yeterince hızlı ölçeklenemezse?"

"Yük testi sonuçlarımız var. Aurora Serverless v2'nin ölçeklenme süresi 10 saniyenin altında. Ortalama cuma sıçramamızın rampası temelden 8 dakika sürüyor. Boşlukla rahatız."

Teknik ortak diğer yatırımcılara baktı. "Sistemini biliyor."

Daha fazla sorusu vardı.

"Dağıtım güvenliğini nasıl ele alıyorsunuz? 947 restoranda, kötü bir dağıtım 947 restoranın sipariş alamaması demek."

Maya bu soruyu daha önce, dahili olarak almıştı. "Tüm davranış değişiklikleri için özellik bayrakları. Kodu sürekli dağıtıyoruz, ama yeni davranış kademeli olarak etkinleştirdiğimiz bayrakların ardında kilitli. Sipariş onay akışını değiştiren bir dağıtım, 24 saat boyunca restoranların %1'ine, sonra %10'a, sonra %50'ye, sonra %100'e yayılıyor — herhangi bir aşamada hata oranları eşiği aşarsa otomatik geri almayla."

"Tam bir yayılma ne kadar sürüyor?"

"Yüksek riskli bir değişiklik için üç gün. Düşük riskli için bir gün. Acil geri almalar dört dakikanın altında tamamlanıyor."

"P99 Stripe gecikmeniz nedir?"

Tom, Maya daha cevaplayamadan yanıtladı. "214 milisaniye."

"Bu yüksek," dedi yatırımcı.

"Restoranlara SLA'mız sipariş verilmesinden onaya kadar 5 saniyenin altı," dedi Tom. "Stripe çağrısı için 214ms, bu bütçenin %4,3'ü. Kalan süre Aurora yazma, SQS mesaj teslimi, restoran tableti push bildirimi. Boşluğumuz var."

"Peki ya Stripe'ta bir olay olursa?"

"Stripe'ın asenkron ödeme yakalamasını kullanıyoruz. Sipariş kabul edilir ve restoran hemen bilgilendirilir. Ödeme yakalama asenkron olarak gerçekleşir. Stripe yavaşsa, sipariş yine de gerçekleşir — yakalama yeniden dener. Stripe tamamen çökerse, yakalama denemesini üstel geri çekilmeyle kuyruğa alır ve nöbetçimizi uyarırız. 14 aydır Stripe için bir siparişi bekletmedik."

Yatırımcı bir şey yazdı. "Tek bir arıza noktanız var mı?"

Priya cevapladı. "Tek bir bölgedeki Aurora, tek bölgeli bir bağımlılık. AZ düzeyindeki arızalar için Multi-AZ'miz var ve zaten us-east-1'de çalışan bir Aurora Global Database okuyucumuz var. Tam bir bölgesel arıza, o okuyucuya yük devretmek anlamına gelir — ve onun etrafındaki otomatik bölgesel yük devretme, bu çeyrek inşa ettiğimiz şey. O zamana kadar, evet — bir us-west-2 bölgesel arızası Nimbus'u düşürür."

"Çok bölgeli yük devretmeyi neden henüz inşa etmediniz?"

"Çünkü altı ay öncesine kadar, onu doğru inşa etmenin mühendislik maliyeti, kesintinin iş riskini aşıyordu," dedi Priya. "İşletme bölgemizde 30 dakikadan uzun süren bir bölgesel AWS arızası hiç yaşamadık. 287 restoranda — ortalama 34 $ sipariş değerinde günde yaklaşık 4.200 sipariş — 2 saatlik bir bölgesel kesinti bize GMV'de yaklaşık 12.000 $'a mal oluyor. Doğru uygulanmış bir sıcak yedeğin mühendislik maliyeti 3 aylık kıdemli mühendis zamanı. Mevcut gelirimizde, matematik ertelemeyi destekliyordu."

"Peki şimdi?"

"947 restoran ve günlük 18.000 siparişte, aynı 2 saatlik kesinti GMV'de kabaca 51.000 $'a mal oluyor ve akşam servisi için bize bağımlı restoran ortaklarıyla önemli itibar zararı yaratıyor. Matematik değişti. Yük devretme projesi gelecek sprint başlıyor."

Yatırımcı odadaki diğer yatırımcılara baktı. "Risk profilini de biliyor."


**"Duruma Bağlı"nın Altındaki Dört Soru**

Bu soruların her birinin bir versiyonunu iki yıl boyunca, aynı soruyu dört farklı şekilde sorduğunu bilmeden sormuştu. Yatırımcı oturumu bunu netleştirmişti. Kendinden emin açıkladığı her seçim aynı dört eksene geri dönüyordu.

**1. Erişim deseni nedir?**

Veri nasıl yazılıyor ve okunuyor? Hangi frekansta? Kaç eşzamanlı kullanıcı tarafından? Hangi sırada? Hangi anahtarlarla?

Bu soru teknoloji seçimini en temel düzeyde belirler. DynamoDB'ye karşı Aurora'ya karşı Redshift'e karşı Athena — doğru cevap neredeyse tamamen erişim desenine bağlıdır.

**2. Ölçek nedir?**

Yalnızca şimdi değil — 12 ay içinde, 5 yıl içinde. Ölçek doğru cevabı değiştirir. Günde 100 istekte işe yarayan, 100 milyonda bozulur. 10 kullanıcıda aşırıya kaçan, 10.000'de gereklidir.

Ve ölçek yalnızca trafik değildir. Ekip büyüklüğüdür (mimari, sahip olduğunuz ekip tarafından sürdürülebilir olmalı). Veri hacmidir. Coğrafi erişimdir.

**3. Arıza sonucu nedir?**

Bu bozulursa ne olur? Bir kullanıcı yavaş bir sayfa mı görür? Bir sipariş mi başarısız olur? Para yanlış mı hareket eder? Birinin tıbbi kaydı mı erişilemez hale gelir?

Sonuç, güvenilirliğe ne kadar yatırım yapacağınızı belirler. Yavaş bir menü sayfası nihai tutarlılığı garanti eder. Başarısız bir ödeme, senkron yazmaları ve açık onayı garanti eder.

**4. Maliyet kısıtlaması nedir?**

Yalnızca para değil — aynı zamanda operasyonel karmaşıklık (ki bu da başlı başına bir maliyet biçimidir). Üç ek hizmet gerektiren bir çözüm, daha basit olandan teknik olarak üstün olabilir ama dört kişilik bir ekiple sürdürmek için fazla pahalı olabilir.

"Dur — ama erişim deseni *neden* bu kadar önemli?" diye sormuştu Maya, iki yıl önce, Tom menü kataloğunu siparişler veritabanından ayırmayı ilk önerdiğinde. "Sonra optimize edemez miyiz?"

O soru, anlaşıldı ki cevabın başlangıcıydı. Bir ilişkisel şemayı, yeniden inşa etmeden anahtar-değer erişim desenleri için optimize edemezsiniz. Erişim deseni, sonradan uyarlanarak değil, tasarım zamanında bilinmeliydi. O zamandan beri verdiği her mimari karar aynı soruyla başlamıştı.

Şunu merak ediyor olabilirsiniz: "duruma bağlı" her zaman doğru cevapsa, bir kararı nasıl verirsiniz? Cevap şu ki, cümleyi tamamlamak sizi koşulları adlandırmaya zorlar ve onları adlandırdığınızda, hangi bilgiye ihtiyacınız olduğunu bilirsiniz. "Erişim desenine bağlı" şuna dönüşür: "git, erişim deseninin gerçekte ne olduğunu öğren." Dört soru kararlardan kaçınmanın bir yolu değildir — onları doğru bilgiyle vermenin bir yoludur.

**"Duruma Bağlı": Cümleyi Nasıl Tamamlarsınız**

"Duruma bağlı" demenin doğru yolu, onu hemen tamamlamaktır:

*"DynamoDB mi yoksa Aurora mı kullanmalıyız?"*

"Erişim desenine bağlı. Esnek şemayla yüksek verimli anahtar tabanlı aramalara ihtiyacınız varsa, DynamoDB. Karmaşık sorgularla ilişkili varlıklar arasında işlemsel tutarlılığa ihtiyacınız varsa, Aurora."

*"Lambda mı yoksa EC2 mi kullanmalıyız?"*

"İş yükü özelliklerine bağlı. Sıfır boşta maliyetin önemli olduğu olay güdümlü, kısa süreli, değişken iş yükleri için Lambda. Tahmin edilebilir performansın boşta maliyetten daha önemli olduğu kalıcı, durumlu ya da uzun süreli süreçler için EC2 ya da ECS."

*"Multi-AZ mi yoksa Multi-Region mı kullanmalıyız?"*

"RTO/RPO gereksinimlerinize ve tehdit modelinize bağlı. Multi-AZ, AZ arızalarına (en yaygın AWS arıza modu) karşı korur ve RDS için RPO ~0 ve RTO ~60 saniye sağlar. Multi-Region, bölgesel arızalara (nadir) karşı korur ve küresel olarak dağıtılmış kullanıcılara hizmet eder. Bölgesel bir felaketten dakika altı yük devretmeye ihtiyacınız varsa, Multi-Region. AZ dayanıklılığı yeterliyse, Multi-AZ çok daha basit ve daha ucuzdur."

"Duruma bağlı" cevabın sonu değildir. Gerçek cevabın başlangıcıdır.


*"Konteyner orkestrasyonu için EKS mi yoksa ECS mi kullanmalıyız?"*

Yatırımcı bunu, Maya bir sonraki slayta geçmeden önce sormuştu. Durakladı.

"Ekip büyüklüğüne, mevcut Kubernetes uzmanlığına ve Kubernetes'e özgü özelliklere ihtiyacınız olup olmadığına bağlı."

"Bunu aç," dedi.

"Kubernetes güçlü bir orkestrasyon platformu," dedi Maya. "Zengin bir ekosistemi var — Helm grafikleri, özel kaynak tanımları, çok kümeli federasyon, gelişmiş zamanlama politikaları. Kubernetes bilen, etrafında araçlar oluşturulmuş ve bu yetenekleri gerektiren bir ekibiniz varsa, EKS doğru seçim. Yönetilen bir kontrol düzlemi alırsınız, ama yine de ağ politikalarının, pod güvenliğinin, kaynak kotalarının ve geri kalanının Kubernetes karmaşıklığını yönetiyorsunuz."

"Peki ECS?"

"ECS daha basit. Kubernetes API'si yok. etcd yok. Pod ağ karmaşıklığı yok. Görevler, hizmetler ve kümeler tanımlarsınız. IAM, ek eklentiler gerektirmeden yerel olarak entegre olur. Zihinsel model önemli ölçüde daha küçük. Kubernetes'i zaten bilmeyen bir ekip için, ECS aylarca öğrenme eğrisini ortadan kaldırır."

"Nimbus hangisini kullanıyor?"

"ECS," dedi. "On sekiz ay önce EKS'yi değerlendirdik. Kubernetes deneyimi olan bir mühendisimiz vardı. Diğerlerinin bir production Kubernetes ortamında verimli olması 3 ila 4 ay gerekirdi. EKS'nin bize verecekleri özelliklere — çok kümeli yönetim, özel zamanlama — ihtiyacımız yoktu. Fargate ile ECS konteynerlerimizi çalıştırıyor. Ekip iki haftada verimli oldu."

"50 mühendiste doğru seçim bu mu?" diye sordu.

"Olmayabilir," dedi Maya. "İzole ad alanlarına, özel ağ politikalarına ve ekip kapsamlı kaynak kotalarına ihtiyaç duyan birden çok ürün ekibiyle 50 mühendiste — Kubernetes'in ad alanı modeli gerçekten değerli hale gelir. ECS'nin eşdeğer ad alanı izolasyonu yok. O ölçekte, Kubernetes öğrenme eğrisi çok daha büyük bir ekibe yayılır. 'Duruma bağlı' cevabı kayar."

"Hangi ekip büyüklüğünde bu kayma gerçekleşir?" diye sordu.

Bunu düşünmüştü. "Kullandığım kural: Kubernetes'in operasyonel ek yükü, ECS'nin sınırlamalarını aşmanın organizasyonel ek yükünden az olduğunda, geç. 14 kişilik bir ekip için ECS. Birden çok ürün dikeyine sahip 50 kişilik bir ekip için muhtemelen EKS. Sayı sabit değil — ne inşa ettiğinize ve kimin inşa ettiğine bağlı."

"Dur — ama *neden* öyle yapalım ki?" diye sordu Maya kendine, iki yıllık inşadan öğrendiği soruyu tekrarlayarak. "Neden sadece birini seçip ona bağlı kalmayalım?"

Çünkü organizasyon değiştikçe doğru cevap değişir. 4 kişilik bir ekip için verilen bir mimari karar, 40 kişilik bir ekip için mutlaka doğru değildir. Koşullar değişir. Cevap onlarla değişir.

"İşte mesele bu," dedi yatırımcıya. "Bugün doğru cevap ECS. Üç yıl içinde doğru cevap EKS olabilir. Koşullar gerektirdiğinde yeniden ele alacağız. ECS'yi neden seçtiğimizi belgeleyen bir ADR'miz var ve neyin yeniden değerlendirmeyi tetikleyeceğini açıkça listeliyor."

Yatırımcı bir not daha yazdı. "Bu, teknik bir kararı tutmanın olgun bir yolu."


**Varyasyon: "Duruma Bağlı" Sizi Başınıza Bela Açtığında**

Erişim deseni anahtar-değer aramalarını destekliyorsa ve DynamoDB'yi seçerseniz, ölçekte Aurora'dan daha iyi performans gösterirsiniz — ama üç varlık arasında JOIN sorguları gerektiren bir özellik eklerseniz, yanlış temeli inşa etmişsinizdir ve baskı altında göç etmeniz gerekir. "Duruma bağlı" cevabı yalnızca bağlı olduğunuz koşulları anlamanız kadar iyidir.

Mevcut ölçek ve mevcut erişim deseni için optimize ederseniz, bugün için doğru kararı verirsiniz — ama mimariniz uyum sağlamadan trafik bir yılda 50 kat büyürse, birinci gün için doğru karar 365. günün darboğazı olur. Dört soru yalnızca tasarım zamanında sorulmamalı, sistem büyüdükçe yeniden ele alınmalıdır.

**Değişmeyen Desenler**

Belirli teknoloji seçimleri evrilirken — yeni hizmetler çıkar, fiyatlar değişir, daha iyi alternatifler ortaya çıkar — bazı temel desenler onlarca yıldır kararlı kalmıştır:

**İlgilerin ayrılması**: Farklı şeyler yapan bileşenler bağımsız olmalıdır. Birindeki bir değişiklik diğerinde bir değişiklik gerektirmemeli. İşte bu yüzden doğrudan çağrılarla değil, SQS ile ayrıştırırsınız. İşte bu yüzden veritabanları için değil, nesneler için S3 kullanırsınız. İşte bu yüzden web katmanı ve veritabanı katmanı ayrıdır.

**Derinlemesine savunma**: Tek bir güvenlik kontrolü yeterli değildir. IAM'iniz, güvenlik gruplarınız, NACL'leriniz, WAF'ınız, GuardDuty'niz, Secrets Manager'ınız, KMS'niz var. Bir katman başarısız olursa, bir sonraki onu yakalar.

**Kullandığın kadar, kullandığında öde**: Bulutun temel ekonomik ilkesi. Lambda sıfıra ölçeklenir. Spot örnekler yedek kapasiteyi kullanır. S3 yaşam döngüsü politikaları soğuk veriyi daha ucuz depolamaya taşır. DynamoDB on-demand istek başına ücretlendirir. Tom iki yıl boyunca "Bu ayda ne kadar tutuyor?" diye on bin kez sormuştu. O soru — tutarlı sorulup titizlikle cevaplanan — yılda yaklaşık 36.000 $ tasarrufa dönüşmüştü. Desenler farklı; ilke aynı.

**En olası arıza için optimize et**: Önce Multi-AZ (AZ arızaları olur). İkinci olarak bölgeler arası DR (bölgesel arızalar daha nadirdir). Bölgeler arası karmaşıklıktan önce AZ içi yedeklilik (birden çok örnek). Felaket niteliğinde ama olası olmayan için değil, gerçekçi arıza için inşa et.

**Optimize etmeden önce ölç**: Tom'un yaklaşımı — CloudWatch metriklerini çek, gerçek deseni anla, sonra kararlar ver — varsayımlara dayalı erken optimizasyondan daha değerlidir. Leo'nun gece toplu işleri konusundaki içgüdüsü — "Sorun olmaz" — kendini bırakmaya alıştırman gereken en önemli şeydi. Genellikle sorun olmaz, ta ki olmadığı o tek seferde, ve sen hiçbir şey ölçmemişsindir.


**Yanlış varsayılanların katlanan maliyeti.**

Tom'un listeye eklemek için bir deseni daha vardı, yalnızca üç aylık maliyet incelemesinden sonra belirlediği biri: varsayılanı değiştirmemenin maliyeti.

AWS hizmetleri kutudan çıktığı gibi güvenli ve işlevsel olacak şekilde tasarlanmıştır. Varsayılanlar her iş yükü için optimal olacak şekilde tasarlanmamıştır. gp2, gp3 Aralık 2020'de çıkana kadar varsayılan EBS birim türüydü. Bundan sonra, gp3 yeni birimler için varsayılan oldu — ama mevcut gp2 birimleri hiç dönüştürülmedi, çünkü AWS mevcut müşteri kaynaklarını açık eylem olmadan değiştirmez.

Maliyet etkisi: gp3'ten önce EBS birimleri oluşturan ve hiç göç denetimi yapmayan her ekip, yanlış karar verdikleri için değil, hiç karar vermedikleri için yıllarca GB başına %25 daha fazla ödedi. Varsayılan devam etti ve maliyet sessizce katlandı.

İşte bu yüzden "dur, ama neden öyle yapalım ki?" sorusu ekibin sorduğu en değerli şey haline gelmişti. Her zaman verilen bir kararı sorgulamakla ilgili değildi. Bazen bir karar-vermemeyi sorgulamakla ilgiliydi: incelenmeden kabul edilen bir varsayılan.

Desen genelleşir: AWS yeni bir seçenek çıkardığında varsayılanları yeniden ele al. gp2'den gp3'e. Trafik dengelendiğinde On-Demand DynamoDB'den Auto Scaling ile sağlanana. Erişim desenleri belirsizleştiğinde Standard S3'ten Intelligent-Tiering'e. Yeniden ele alma pahalı olmak zorunda değil — kategori başına bir öğleden sonra analiz, üç ayda bir. Ama atlanamaz. Varsayılanlar katlanır.

"Seçtiğimiz bir şeye harcadığımız her dolar kasıtlı bir maliyettir," dedi Tom aylık incelemede. "Sağladığımızdan beri bakmadığımız bir şeye harcadığımız her dolar, sorgulanması gereken potansiyel bir varsayılandır."

"Bunlardan kaç tane var?" diye sordu Maya.

"Altı ay öncesinden daha az," dedi. "Sıfırdan fazla."

Dürüst cevap buydu. Her zaman dürüst cevap buydu.


**Bu Kitabın Size Öğretemeyeceği Şey**

Sınırlar konusunda açık olalım.

Bu kitap size şunları öğretti:

- Her büyük AWS hizmetinin ne yaptığını
- Onları sezgisel kılan analojileri
- Alternatifler arasındaki ödünleşimleri
- SAA-C03 için ihtiyacınız olan sınav bilgisini
- Mimari kararlar hakkında düşünmek için bir çerçeve

Bu kitap size şunları öğretemez:

- **Production içgüdüsü**: Bunun gerçekleştiğini görmeden önce "bu yük altında garipleşecek" diyen içsel his. Bu, gerçek sistemleri işletmekten gelir.
- **Baskı altında teknik muhakeme**: Sistem çöktüğünde ve eksik bilgiye sahip olduğunuzda gece 3'te ne yapacağına karar vermek. Bu, olaylardan gelir.
- **Paydaş sezgisi**: Teknik maliyet çok yüksek olduğu için bir iş gereksinimine ne zaman karşı çıkacağını bilmek. Bu, hem teknik hem de iş tarafıyla deneyimden gelir.
- **Belirli bağlam için doğru soru**: Carlos doğru soruları sorabildi çünkü benzer sorunları onlarca kez görmüştü. Bu bilgi okunmaz, kazanılır.

Öğrenmeniz bitmedi. Daha yeni başladınız.

**Sınav Varış Noktası Değildir**

Bu kitabı AWS Solutions Architect Associate sınavına hazırlanmak için aldınız. Bu geçerli. SAA-C03 sertifikası gerçek, değerli ve kapılar açacak.

Ama sınav bilgiyi ve desen tanımayı test eder. Muhakemeyi test etmez. Operasyonel deneyimi test etmez. İnşa ettiğiniz mimari bir cuma gecesi 23:00'te çalışmayı durdurduğunda ne yapacağınızı test etmez.

Sertifika bir başlangıç kimlik bilgisidir. Sınavı geçtiğinizde, AWS hizmetlerinin nasıl çalıştığını ve nasıl birleştiğini bileceksiniz. Mimari hakkında düşünmek için bir çerçeveniz olacak. Henüz yapmış olmayacaksınız.

Sınavdan sonraki adım: gerçek bir şey inşa et. Dağıt. İşlet. Başarısız olmasını izle. Düzelt. Bir hizmette parayı bitir ve maliyeti başka bir yere taşı. Gecenin bir yarısı çağrılıp yetersiz bilgiyle bir karar ver.

Bu kitaptaki bilgi işte böyle muhakemeye dönüşür.

**Maya'nın Son Cevabı**

Yatırımcı toplantısının sonunda teknik ortağın bir sorusu daha vardı.

"Bugün şimdi bildiklerinizi bilerek baştan başlasaydınız, neyi farklı yapardınız?"

Maya bir an aldı.

"İlk günden kod olarak altyapıyla başlardım," dedi. "Leo ilk EC2 örneğini manuel olarak dağıttı. Her şeyi Terraform'a taşımak için altı ay harcadık. Bu, bize gerçek zamana mal olan altı aylık teknik borçtu."

"Başka?"

"Erken aşamada yönetilen hizmetler konusunda daha temkinli olurdum. Basit bir RDS veritabanı aylarca yeterli olacakken DynamoDB kullandık. DynamoDB erişim deseni tasarımı, henüz sahip olmadığımız deneyimli bir düşünce gerektiriyordu. Şemayı iki kez yeniden tasarladık."

"Yani erkenden daha basit daha mı iyi?"

"Daha basit *her zaman* daha iyi. Soru her zaman şu: gerçek sorunu çözen en basit şey nedir, beklenen gelecek sorunu değil? Henüz sahip olmadığımız sorunları çözmek için karmaşıklık ekledik. O karmaşıklığın bir kısmı kendi sorunlarına yol açtı."

Teknik ortak bunu yazdı.

"Son soru," dedi. "AWS üzerinde inşa etmekle ilgili, başladığınızda bilmediğiniz, bildiğiniz en önemli şey nedir?"

Maya iki yılı düşündü. Olayları. Maliyet incelemelerini. Well-Architected incelemesini. Baskı altında verilen ve dikkatle verilen mimari kararları. Doğru yaptıklarını ve yeniden yapmak zorunda kaldıklarını.

"Bulutun mimari sorunları çözmediğini," dedi. "Onları büyütür. Şirket içinde kötü bir karar size bir haftaya mal olabilir. Bulutta kötü bir karar, birisi fark edene kadar her ay, ölçekte size paraya mal olabilir."

Durakladı.

"Bulut iyi kararları ölçeklendirir. Kötüleri de."

O akşam Maya, Tom, Priya ve Leo'ya yatırımcı oturumundan bahsetti.

"Veritabanı seçimlerini sordu," dedi. "Hepsini."

"Bu ayda ne kadar tutuyor?" diye sordu Tom hemen, ki bu tam olarak yanlış soruydu ve aynı zamanda doğru olanı. "Maliyet modelini sordu mu?"

"Sordu. Savings Plans'ı, DynamoDB'nin sağlanana geçişini açıkladım. Başını salladı."

"Peki ya birisi içeri girmeye çalışırsa?" diye sordu Priya. "Güvenlik soruları geldi mi?"

"IAM, şifreleme, GuardDuty. Evet. Tatmin olmuş görünüyordu."

Leo sessizdi. "İyi gitmeyen kısımları sordu mu?"

"Neyi farklı yapacağımı sordu. Ona kod olarak altyapıyla başlamaktan ve erkenden yönetilen hizmetler konusunda daha temkinli olmaktan bahsettim."

"İki kez yeniden tasarladığımız DynamoDB şeması," dedi Leo. "Her zaman bunun benim üzerime olduğunu hissettim."

"Hepimizin üzerineydi," dedi Maya. "Mesele de bu."

**Kapanış**

Çok şey öğrendiniz. AWS hizmetleri. Ödünleşimler. Desenler.

Şimdi onunla bir şey yapın.

Bir şey inşa edin. Bilerek hatalar yapın. Post-mortem'leri okuyun (herkese açıklar — AWS, Cloudflare, GitHub, Stripe hepsi yayınlar). En zayıf olduğunuz şeylerde sizden daha iyi olan ekiplerle çalışın.

SAA-C03 sınavı materyali bilip bilmediğinizi test edecek. Kariyeriniz onu uygulayıp uygulayamayacağınızı test edecek.

İkisi de yapmaya değer. Hiçbiri nihai varış noktası değil.

Bu alanda nihai varış noktası yoktur. Yalnızca bir sonraki sorun, bir sonraki karar ve doğru bir sonraki soruyu sorma alışkanlığı vardır.

**Slayt Destesine Girmeyen Dersler**

Seattle'dan dönüş treninde Maya, Leo ve Priya'ya, yatırımcının doğrudan sormadığına memnun olduğu iki şeyden bahsetti — çünkü dürüst cevaplar her biri yirmi dakika sürerdi.

**Analitik veri hattı olayı.**

Sekiz ay önce, analitik veri hattı ana sipariş işleme servisine bağlanmıştı. Sipariş olayları, analitik veri hattının tükettiği aynı SQS kuyruğuna yazılıyordu. Bağlantı makul görünmüştü: analitiğin sipariş verisine ihtiyacı vardı, sipariş işleme sipariş verisi üretiyordu.

Bir çarşamba akşamı, analitik toplama Lambda'sındaki bir hata, onun kuyruktan tüketmeyi durdurmasına neden oldu. Kuyruk derinliği büyüdü. Sipariş işleme servisi onay mesajları için aynı SQS kuyruğunu paylaştığından, hem analitik veri hattı hem de sipariş onay yolu aynı anda yığılıyordu. Restoran ortakları onay gecikmeleri görmeye başladı. SQS kuyruğu mesaj saklama limitine yaklaşıyordu.

"Düzeltmeyi zaten dağıttım," demişti Leo o gece saat 23:00'te — ve sonra durdu. Analitik hatasının düzeltmesi, kuyruğu temizleyecek bir Lambda yeniden dağıtımı gerektirecekti, ama kuyruktaki sipariş onay mesajlarının hâlâ görünürlük zaman aşımları içinde olup olmadığını kontrol etmemişti. Zaman aşımı dolmuşsa, Lambda onları yeniden işleyecek ve restoran ortakları yinelenen sipariş onayları alacaktı.

Olay üç saat sürmüş ve iki geri alma gerektirmişti.

Mimari ders basitti: analitik ve operasyonel işleme asla aynı kuyruğu paylaşmamalı. Farklı performans özellikleri, farklı arıza modları ve başarısız olduklarında farklı sonuçları vardır. Onları bağlamak, daha düşük öncelikli yoldaki bir arızanın daha yüksek öncelikli yolu bozabileceği anlamına geliyordu.

Olaydan sonra, Nimbus veri hatlarını tamamen ayırdı. Sipariş olayları özel bir operasyonel kuyruğa gitti. Ayrı bir EventBridge kuralı olayları yalnızca analitiğe özel bir kuyruğa kopyaladı. İki veri hattının, olay kaynağı dışında paylaşılan altyapısı yoktu. Analitik Lambda'sının bir sonraki hatasında — ve oldu, iki ay sonra — sessizce başarısız oldu, analitik kuyruğu yığıldı, sabah raporları geç kaldı ve sipariş onay yolu tamamen etkilenmedi.

"İlgilerin ayrılması," demişti Priya, ikinci analitik Lambda hatasından sonra. "Kod düzeyinde olduğu gibi altyapı düzeyinde de aynı ilke. Farklı şekilde başarısız olan iki şey aynı arıza alanını paylaşmamalı."

**Erken soyutlama.**

Series A'dan üç ay önce, Leo genel bir restoran yapılandırma servisi inşa etmeyi önermişti. Nimbus'un o sırada üç tür restorana özgü yapılandırması vardı: menü ayarları, teslimat bölgesi parametreleri ve bildirim tercihleri. Genel bir yapılandırma servisi, Leo'nun savunduğuna göre, her seferinde yeni depolama ve alma mantığı inşa etmeden yeni yapılandırma türleri eklemelerini sağlardı.

Ekip onu inşa etti. Veri modelini tasarlamak için iki hafta. Servisi uygulamak için bir hafta. Mevcut üç yapılandırma türünü ona göç ettirmek için bir hafta daha. Toplam dört hafta.

Genel yapılandırma servisini inşa etmeyi bitirdiklerinde... üç yapılandırma türleri vardı. Daha önce sahip oldukları aynı üç. Genel servis hiçbir yeni yetenek eklemedi; yalnızca mevcut yeteneği anlaşılması daha zor hale getirdi. Servisi "genel" kılan anahtar-değer şeması, aynı zamanda onun üstüne bir şema kayıt defteri inşa etmeden doğrulama ya da tür kısıtlamaları eklemeyi imkânsız hale getirdi.

"Bir kütüphane için bir çerçeve inşa ettik," dedi Tom, Leo'ya yatırımcı hikâyesini anlatırken.

"Bu ne demek?" diye sordu Leo.

"Üç kitabımız vardı. Onları organize etmek için bir kütüphane yönetim sistemi inşa ettik. Üç kitabı sadece bir rafa koymak daha iyi olurdu."

Yapılandırma servisi sekiz ay sonra sessizce kullanımdan kaldırıldı, ekip dört mühendisin, onun bir DynamoDB tablosunun etrafında ince bir sarmalayıcı olduğunu keşfetmeden önce nasıl çalıştığını öğrenmek için önemsiz olmayan bir zaman harcadığı kadar büyüdüğünde. İki günde, yapılandırma türü başına türlü şemalarla doğrudan DynamoDB erişimine geri göç ettiler.

"İnşa etmek için dört hafta," dedi Tom. "Geri almak için iki gün. Artı her yeni mühendise onu açıklamanın süregelen maliyeti."

"Doğru karar neydi?" diye sordu Priya.

"Yapılandırma servisini, ondan fazla yapılandırma türün olduğunda ve desen açıkça kararlıyken inşa et," dedi Tom. "Üç tane varken ve gelecekteki ihtiyaçlar hakkında spekülasyon yaparken değil. Soyutlama erkendi. Tasarlandığı ihtiyaçlar gerçekleşmedi."

"Sorun alanını anlamadan önce soyutlamalar inşa edersek ne olur diye düşündük mü?" diye sordu Priya.

"Onu az önce tarif ettik," dedi Tom. "Çözdüğü sorundan daha pahalıya mal olan bir soyutlamayı sürdürmek için zaman harcarsın."

Maya bunu mimari karşıt desenlerin zihinsel modeline ekledi: üç kullanım durumu için inşa edilen genel servis. Bağlanmış veri hattı. Yetersiz bir gözlem penceresinde verilen doğru boyutlandırma kararı. Her biri, mevcut bilgiyle, o anda, yerel olarak mantıklı bir karardı. Her biri yalnızca sonradan görünür hale gelen şekillerde yanlış çıktı.

"Kağıt üzerinde sorunsuz görünenler," dedi Priya'ya, "sana en pahalıya mal olanlardır."

"Çünkü onları yeniden ele almazsın," dedi Priya. "Tasarıma bakarsın, tutarlıdır, mantık geçerlidir ve devam edersin. Arıza modu, sistem kâğıt versiyonunun hiç modellemediği bir yük ya da stres altında olana kadar görünmezdir."

"İşte bu yüzden mimari inceleme önemli," dedi Maya. "İnceleyici daha çok bildiği için değil. Sormayı düşünmediğin soruyu soracağı için."


## Özet

Yatırımcı toplantısı iyi geçmişti. Maya her hizmetin fiyatlandırma yapısını ezberlediği için değil, Nimbus'un verdiği her seçim için *neden*'i cevaplayabildiği için. Verdiği "duruma bağlı" cevapları kesin, koşullu ve iki yıl boyunca çeşitli biçimlerde sorduğu aynı dört soruya dayalıydı.

- **"Duruma bağlı" cevabın başlangıcıdır**, sonu değil. Cümleyi her zaman bağlı olduğu koşullarla tamamlayın.
- Her mimari ödünleşimin altındaki dört soru: erişim deseni, ölçek, arıza sonucu, maliyet kısıtlaması.
- Kalıcı olan desenler: ilgilerin ayrılması, derinlemesine savunma, kullandığın kadar öde, olası arıza için optimize et, optimize etmeden önce ölç.
- **Bulut kararları büyütür** — iyileri de kötüleri de. Şirket içinde kötü bir karar bir haftaya mal olur; bulutta kötü bir karar ölçekte aylık olarak katlanır.
- SAA-C03 sertifikası bilgiyi ve desen tanımayı test eder. Production deneyimi o bilgiyi muhakemeye dönüştürür.

## Sınav İpuçları

*SAA-C03 Alanı: Alanlar arası — tüm alanlar*

Bu bölüm bu kitabın sınav içeriğini kapatıyor. Sınava oturmadan önce:

**En az emin olduğunuz hizmetleri gözden geçirin**:

- Çoğu insan için: Kinesis'e karşı SQS (akış ile kuyruk ayrımı)
- VPC ağ oluşturma (rota tabloları, alt ağlar, NAT Gateway, İnternet Ağ Geçidi)
- IAM politika değerlendirme mantığı (açık reddetme > açık izin > örtük reddetme)
- Depolama sınıfı seçimi (sekiz S3 depolama sınıfının hepsini ve ödünleşimlerini bilin)
- Belirli kullanım durumları için RDS'e karşı Aurora'ya karşı DynamoDB

**Sınavın tipik senaryo yapısını bilin**:

SAA-C03 bir iş gereksinimi sunar ("şirketin %99,99 kullanılabilirliğe ihtiyacı var") ve onu karşılayan mimariyi belirlemenizi ister. Her zaman gereksinimi okuyun, kilit kısıtlamayı belirleyin ve onu karşılamayan seçenekleri eleyin.

**Çeldirici belirleme alıştırması yapın**:

Sınavdaki her yanlış cevap belirli bir nedenden dolayı yanlıştır. Her yanlış cevabın *neden* yanlış olduğunu belirlemeyi öğrenmek, doğru cevapları ezberlemekten daha değerlidir.

**Sınav desen tanımayı ödüllendirir**:

- "Ayrıştır" → SQS/SNS
- "Sunucusuz" → Lambda, DynamoDB, Aurora Serverless
- "Küresel düşük gecikme" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Uyumluluk/denetim" → CloudTrail, Config, Security Hub, Macie
- "Maliyet optimizasyonu" → Spot Instances, Savings Plans, yaşam döngüsü politikaları, doğru boyutlandırma

**Hazırsınız**. Bu kitap her şeyi kapsadığı için değil — hiçbir şey kapsamaz. Ama ilkeleri yeterince iyi anladığınız için, tam senaryoyu hemen tanımasanız bile cevaba muhakeme yürütebilirsiniz.

## Alıştırmalar

**Son Alıştırma**

Bu bölümden sonra yapılandırılmış sınav sorusu yok.

Bunun yerine: tek bir açık soru.

Bildiğiniz şeyleri bilerek bugün hangi sistemi inşa ederdiniz?

Yazın. Mimariyi taslak halinde çizin. Hizmetleri belirleyin. Yapacağınız ödünleşimleri ve nedenini not edin. Arıza modlarını öngörün.

Sonra onu inşa edin.

Görev bu. Teslim tarihi yok. Not yok. Sadece iş var.

## Jenerik Sonrası Sahne

Yatırım geldi.

Series A. 4 milyon $. Beş yeni şehre genişlemeye, mühendislik ekibini üçe katlamaya ve Nimbus Instant'ı inşa etmeye yetecek kadar.

O akşam Maya ailesinin restoranındaydı. Orijinal olanda. Nimbus'un başladığı yerde, telefon hep meşgul olduğu için sipariş kaybettiklerini fark ettiğinde.

Arepa sipariş etti — her zaman sipariş ettiği aynı yemek.

Beklerken, dizüstü bilgisayarını açtı ve bu kitabın ilk bölümünü okudu.

*"Bir web sitesi nerede yaşar?"*

Cevabı bilmediğini hatırladı.

Gülümsedi.

Dizüstü bilgisayarını kapattı.

Yemek geldi.

Mükemmeldi.

Sonraki bölümde: iş artık sistemi inşa etmek değil — ondan sorumlu olmak olduğunda ne değişir.
