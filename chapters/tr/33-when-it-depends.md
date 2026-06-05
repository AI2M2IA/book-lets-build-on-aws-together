# Bölüm 33: Duruma Bağlı

Bu bölüme bir nefes daha al.

Kitabın sonuna gelmişsin. Bu hem bir son hem de bir başlangıç — son bölüm ve kendi başına mimari kararlar verme ilk günün.

Bu bölümün tek görevi, kimse yeterince açık bir şekilde anlatmayan şeyi seninle dürüst olmaktır.

**Soru**

Her mimari tartışmanın sonunda, biri genellikle sorar: "Doğru cevap nedir?"

Yazılım mühendisliğindeki en faydalı, en rahatsız edici, en dürüst ve en yanlış anlaşılan cevap şudur:

**Duruma Bağlı.**

Bu, sorunun yanıtlanamaz olduğu anlamına gelmiyor. Uzmanın kaçırdığı anlamına gelmiyor. Ancak doğru cevap, soruda yer almayan bağlamdaki gerçek bir duruma bağlıdır.

Bu bölüm, "duruma bağlı" doğru şekilde söylemeyi öğrenmekle ilgilidir — yani cümleyi tamamlayabilmeyi ifade etmektir.

Bir doktor'a "cerrahi doğru tedavi mi?" diye sorarsanız, kötü bir doktor hasta muayene etmeden evet veya hayır der. İyi bir doktor şöyle der: "Duruma bağlı — teşhise, hastanın yaşına, diğer koşullarına ve beklemeye ne kadar süre olduğumuza bağlı." Cevap kaçırdığı anlamına gelmez. Bu, hassasiyettir. "Duruma bağlı" ifadesiyle tamamlanmış bir cümle, bir doktor — veya bir mimar — söyleyebileceği en faydalı şeydir.

**Nimbus'un Sonu**

İkinci yılın başlangıcından sonra. Maya, Seattle'daki bir konferans odasında, bir yatırımcı fonundan oluşan bir odanın önünde sunum yapıyordu.

Nimbus büyümüştü: 947 restoran ortağı, 18.000 günlük sipariş, 2,1 milyon ABD Doları aylık GMV, üç şehir yaşadı, iki tanesi daha başlatılıyordu. Dörtten oluşan bir mühendis ekibi iki zaman diliminde.

Yatırımcıların soruları vardı. Onlardan biri — fonun teknik ortağı — öne doğru eğildi.

"Hangi veritabanını kullanıyorsunuz?" diye sordu.

Maya tereddüt etmedi.

"Siparişler ve müşteri verileri için: Aurora PostgreSQL. Menü kataloğu için: DynamoDB. Oturum yönetimi ve önbellekleme için: ElastiCache Redis. Analitik için: S3 Parquet dosyaları üzerinde Athena, yüksek frekanslı gösterge sorguları için Redshift."

O onayladı. "Siparişler ve müşteri verileri için neden Aurora ve DynamoDB değil?"

"Siparişler karmaşık bir ilişkisel yapıya sahiptir — menü öğeleri, müşteri hesapları, restoran adresleri, ödeme yöntemleri ile referans verirler. Birden çok varlık arasında tutarlı bir şekilde yazma ihtiyacımız var. İlişkisel bir veritabanı bu için doğru araçtır. DynamoDB'nin gücü, esnek şemaya sahip yüksek hacimli anahtar-değer erişimidir — bu da menü kataloğunun erişim modelidir."

O bir şeyler yazdı. "Ölçeklendirme konusunda ne yapıyorsunuz? 18.000 günlük siparişiniz var — bu yaklaşık 12 dakika ortalama. En yüksek hacim için nasıl plan yaptınız?"

"Cuma akşamı yoğun saatleri yaklaşık 25 kat ortalamadır. ECS ve Aurora Serverless v2 ile yatay olarak ölçeklendiriyoruz — bu, ani yükü otomatik olarak işler. CloudFront statik içerik yükünü emer. API durumsuz olduğundan, yatay ölçeklendirme temizdir."

"Eğer Aurora Serverless v2 yeterince hızlı ölçeklenemezse?"

"Yük test sonuçlarımız var. Aurora Serverless v2'nin ölçeklenme süresi 10 saniyeden daha kısadır. Cuma gecesi zirve rampası temelde 8 dakikadır. Temel değerden bir headroom'a sahibiz."

Teknik ortak, diğer yatırımcılara baktı. "O sistemini anlıyor."

**"Duruma Bağlı" Altındaki Dört Soru**

Her mimari ödün, dört temel soruya indirgenebilir. Her soru her karar için eşit derecede önemli olmayabilir, ancak hepsi her zaman mevcuttur.

**1. Erişim Deseni Nedir?**

Veri nasıl yazılır ve okunur? Ne sıklıkla? Kaç eşzamanlı kullanıcı? Hangi sırada? Hangi anahtarlarla?

Bu soru, teknolojiyi seçmenin temel seviyesinde belirler. DynamoDB vs Aurora vs Redshift vs Athena — doğru cevap neredeyse tamamen erişim desene bağlıdır.

**2. Ölçek Nedir?**

Şu an değil, 12 ay sonra, 5 yıl sonra. Ölçek değişirse doğru cevap değişir. 100 istek/günte çalışırsa 100 milyonda bozulur. 10 kullanıcı için aşırı derecede olabilirken, 10.000'de gerekli olabilir.

Ve ölçek sadece trafik değil. Ekip büyüklüğü (mimari, sahip olduğunuz ekibe uygun şekilde sürdürülebilir olmalıdır) veri hacmi, coğrafi kapsamdır.

**3. Başarısızlık Sonucu Nedir?**

Bu başarısız olursa ne olur? Bir kullanıcı yavaş bir sayfa görür mü? Bir sipariş başarısız olur mu? Para yanlış bir şekilde hareket eder mi? Bir kişinin tıbbi kaydı erişilemez mi?

Sonuç, ne kadar güvenilirliğe yatırım yapacağımızı belirler. Bir menü kataloğu yavaş bir sayfa, sonuçta tutarsızlıktan sonra kullanılabilir olur. Bir ödeme başarısız olursa, senkron yazma ve açık doğrulama gerekir.

**4. Maliyet Kısıtlaması Nedir?**

Sadece para değil, aynı zamanda operasyonel karmaşıklık (ki bu da bir maliyet biçimidir). Üç ek hizmet gerektiren bir çözüm teknik olarak daha iyi olabilir, ancak dört kişilik bir ekibi sürdürebilecek kadar pahalı olabilir.

**"Duruma Bağlı": Cümleyi Tamamlamak**

"Duruma bağlı" doğru şekilde söylemek, bunu hemen tamamlayarak yapmaktır:

*"DynamoDB veya Aurora kullanmalıyız?"*

"Durum, erişim kalıbına bağlıdır. Yüksek verimlilikli anahtar tabanlı aramalar ve esnek şema gerekiyorsa, DynamoDB. İlişkili varlıklar arasında tutarlı bir bütünlük gerekiyorsa ve karmaşık sorgular varsa, Aurora."

*"Lambda veya EC2 kullanmalıyız?"*

"Durum, iş yükünün özelliklerine bağlıdır. Olay odaklı, kısa süreli ve değişken iş yüklerinde, boşta kalma maliyetinin etkili olması gerektiğinde Lambda. EC2 veya ECS, tahmin edilebilir performansın boşta maliyetten daha önemli olduğu, kalıcı, durumlu veya uzun süreli süreçler için."

*"Multi-AZ veya Multi-Region kullanmalıyız?"*

"Durum, RTO/RPO gereksinimlerinize ve tehdit modelinize bağlıdır. Multi-AZ, en yaygın AWS arızası modu olan AZ arızalarına karşı koruma sağlar ve RDS için yaklaşık 0’lık RPO ve 60 saniyelik RTO sağlar. Multi-Region, nadir görülen bölgesel arızalara karşı koruma sağlar ve küresel olarak dağıtılmış kullanıcılar için hizmet verir. Bölgesel bir felaket durumunda saniyenin altındaki bir geçiş gerektiğinde Multi-Region. AZ direnci yeterliyse, Multi-AZ çok daha basit ve ucuzdur."

"Durum" cevabının sonu değildir. Gerçek cevapların başlangıcıdır.

**Değişmeyen Kalıplar**

Belirli teknolojiler evrimleşirken – yeni hizmetler lansmanları, fiyatlandırma değişiklikleri, daha iyi alternatifler ortaya çıkışı – bazı temel kalıplar onlarca yıldır kararlı kalmıştır:

**İlgilerin Ayrılması**: Farklı şeyler yapan bileşenler bağımsız olmalıdır. Birinde değişiklik yapılması, diğerinde bir değişiklik gerektirmemelidir. Bu nedenle SQS ile bağlantı kurmak yerine doğrudan çağrılarla. Nesneler için S3 kullanmak yerine veritabanlarıyla. Web katmanı ve veritabanı katmanı ayrı olmalıdır.

**Derin Savunma**: Tek bir güvenlik kontrolü yeterli değildir. IAM, güvenlik grupları, NACL'ler, WAF, GuardDuty, Secrets Manager, KMS'yi kullanırsınız. Bir katman başarısız olursa, diğerleri yakalar.

**Kullandıkça Öde**’nin Temel Ekonomik İlkesi: Bulutun temel ekonomik prensibi. Lambda, boşta kalma maliyeti olmadığında sıfıra iner. Spot örnekleri, boş kapasiteyi kullanır. S3 yaşam döngüsü politikaları, soğuk verileri daha ucuz depolama alanına taşır. DynamoDB, isteğe bağlı olarak her istek için ücretlendirir. Kalıplar farklıdır; ilke aynıdır.

**En Olası Arızayı Optimize Edin**: Multi-AZ ilk (AZ arızaları meydana gelir), bölgesel DR ikinci (bölgelerdeki arızalar daha nadirdir), içinde AZ yedekliliği (birden fazla örnek) bölgesel karmaşıklığa öncülük eder. Gerçekçi arızayı, katastrofal ancak olası olmayan olanı inşa edin.

**Optimize Etmeden Önce Ölçün**: Tom’un yaklaşımı – CloudWatch metriklerini çekmek, gerçek kalıbı anlamak ve ardından kararlar almak – varsayımlara dayalı önceden optimizasyondan daha değerlidir.

**Bu Kitap Öğretmeyeceği Şeyler**

Şimdi doğrudan olalım.

Bu kitap size şunları öğretmiştir:

- Her büyük AWS hizmetinin ne yaptığı
- Onları sezgisel hale getiren benzetmeler
- Alternatifler arasındaki ödünleşimler
- SAA-C03 sınavı için gerekli bilgi
- Mimari kararlar hakkında düşünme çerçevesi

Bu kitap size şunları öğretmez:

- **Üretim İçgüdüsü**: Yük altında "bu garip olacak" hissini görmeden önce gerçekleşmeden önce. Bu, gerçek sistemleri işletme deneyiminden gelir.
- **Basınç Altında Teknik Karar Verme**: Sistem çöktüğünde ve eksik bilgiyle karşı karşıya olduğunuzda ne yapacağınızı belirlemek. Bu, deneyimden gelir.
- **Paydaş İçgüdüsü**: Teknik maliyetin çok yüksek olduğu bir iş gereksinimi konusunda geri adım atmak için hangi soruları soracağınızı bilmek. Bu, hem teknik hem de iş taraflarındaki deneyimden gelir.
- **Belirli Bağlam İçin Doğru Soru**: Carlos, benzer sorunları onlarca kez görmüş olduğu için doğru soruları sorabilirdi. Bu bilgi, okunarak elde edilmez.

Öğrenme yolculuğunuz henüz başlamadı. Sadece yeni başlıyorsunuz.

**Sınav, Hedef Değildir**

AWS Çözüm Mimarı Yardımcı Sınavı için hazırlanmak için bu kitabı aldınız. Bu doğrudur. SAA-C03 sertifikası gerçek, değerli ve kapılarınızı açacaktır.

Ancak sınav, bilgi ve kalıpları test eder. Yargıyı, operasyonel deneyimi veya mimariniz 11 PM'de bir Cuma gecesi durduğunda ne yapacağınızı test etmez.

Sertifika, bir başlangıç derecelendirmesidir. Sınavı geçtiğinizde, AWS hizmetlerinin nasıl çalıştığını ve nasıl birleştirildiğini bileceksiniz. Mimari hakkında düşünme çerçevesine sahip olmayacaksınız.

Sınavdan sonraki adım: Gerçek bir şey inşa edin. Dağıtın. Çalıştırın. Başarısız olmasına bakın. Bir hizmetin maliyetini başka bir yere taşıyın. Orta gece, bilgi eksikliğiyle karşı karşıya olduğunuzda sizi arayacaklar.

O zaman bilgi, yargıya dönüşür.

**Maya'nın Son Cevabı**

Yatırımcı toplantısının sonunda teknik ortak, bir soru daha sordu.

"Bugün yeniden başlarsaydınız, bildiğiniz şeylere göre ne farklı yapardınız?"

Maya bir an durdu.

"Altyapı kodunu ilk günden itibaren kullanmaya başlardım," dedi. "Leo, ilk EC2 örneğini manuel olarak dağıttı. Altı ay boyunca her şeyi Terraform'a taşımak için harcadık. Bu, gerçek zaman kaybı olan altı ayın teknik borcuydu."

"Başka ne var?"

"Erken dönemde yönetilen hizmetler konusunda daha muhafazakar olurdum. Basit bir RDS veritabanı yeterli olurken, aylarca DynamoDB kullandık. DynamoDB erişim modeli tasarımı, henüz sahip olmadığımız deneyimi gerektiriyordu. Şemayı iki kez yeniden tasarladık."

"Yani erken dönemde daha basit daha iyidir?"

"Daha basit her zaman daha iyidir *aslında*. Soru her zaman şudur: Gerçek sorunu çözen en basit şey nedir, gelecekteki beklenen sorunu değil? Gelecekte henüz karşılaşmadığımız sorunları çözmek için karmaşıklık ekledik. Bu karmaşıklığın kendisi de kendi sorunlarını yarattı."

Teknik ortak bunu yazdı.

"Son soru," dedi. "AWS'de inşa ederken bildiğiniz en önemli şey nedir, başlamadan önce bilmediğiniz şey?"

Maya, iki yılı düşündü. Olayları. Maliyet incelemelerini. Well-Architected incelemesini. Baskı altında yapılan ve dikkatli yapılan mimari kararları. Doğru yaptıkları ve yeniden yapmaları gerekenler.

"Bulutun mimari sorunları çözmediğini," dedi. "Onları artırır. Yerinde kötü bir karar bir hafta maliyete mal olabilir. Bulutta kötü bir karar, fark edilene kadar her ay, ölçekte para harcamaya neden olabilir."

Duraksadı.

"Bulut, iyi kararları da kötü kararları da ölçeklendirir."

**Kapanış**

Birçok şey öğrendiniz. AWS hizmetleri. Kararlar. Kalıplar.

Şimdi bunu yapın.

Bir şeyler inşa edin. Amacın için hata yapın. Post-mortem'ları okuyun (kamildir - AWS, Cloudflare, GitHub, Stripe hepsinin yayınladığı). Sizin için en zayıf olduğunuz şeylerde daha iyi ekiplerle çalışın.

SAA-C03 sınavı, materyali bildiğinizi test edecektir. Kariyeriniz, onu uygulayabildiğinizi test edecektir.

İkisi de yapmaya değerdir. Hiçbiri nihai hedef değildir.

Bu alanda nihai bir hedef yoktur. Sadece bir sonraki sorun, bir sonraki karar ve doğru bir sonraki soruyu sormanın alışkanlığı vardır.

Bol şans.

Bir sonraki bölümde: sistem inşa etmek artık bir görev değil, sorumluluk olduğunda neler değişir.

## Özet

- **"Bağımlı" cevabın sonu değildir, başlangıcıdır.** Cümlenin koşullarıyla tamamlanmasını her zaman sağlayın.
- Her mimari karar kalıbının dört sorusu: erişim modeli, ölçek, başarısızlık sonucu, maliyet kısıtlaması.
- Dayanıklı kalıp olan kalıplar: ilgi alanlarının ayrılması, savunma derinliği, kullandıklarınızdan ödeyin, olası başarısızlığa optimize edin, optimize etmeden önce ölçün.
- **Bulut kararları artırır** - iyi olanlar ve kötü olanlar. Yerinde kötü bir karar bir hafta maliyete mal olur; bulutta kötü bir karar, ölçekte aylık olarak, fark edilene kadar para harcamaya neden olabilir.
- SAA-C03 sertifikasyonu bilgi ve kalıp tanıma test eder. Bu bilgi, üretim deneyimiyle yargıya dönüşür.

## Sınav İpuçları

*SAA-C03 Alan: Çoklu alan*

Bu bölüm, kitabın sınav içeriğini kapatmaktadır. Sınava oturmadan önce:

**En kendinden emin olmadığınız hizmetleri gözden geçirin:**

- Çoğu kişi için: Kinesis vs SQS (akış vs kuyruk ayrımı)
- VPC ağlama (yollar, alt ağlar, NAT Geçidi, İnternet Geçidi)
- IAM politikası değerlendirme mantığı (açık reddet > açık izin > örtülü reddet)
- Depolama sınıfı seçimi (altı S3 depolama sınıfını ve bunların trade-off'larını bilin)
- RDS vs Aurora vs DynamoDB için belirli kullanım durumları

**Sınavın tipik senaryo yapısını bilin:**

SAA-C03, bir iş gereksinimi ("şirket %99,99 kullanılabilirlik gerektiriyor") ve bunu karşılayan mimariyi belirlemenizi ister. Gereksinimi okuyun, ana kısıtlamayı belirleyin ve bunu karşılamayan seçenekleri ortadan atın.

**Yanlış cevapları tanımlama alıştırması yapın:**

Sınavda her yanlış cevap yanlış bir nedenden dolayı yanlıştır. Doğru cevapları ezberlemekten daha değerli olan şey, her yanlış cevabın neden yanlış olduğunu anlamaktır.

**Sınav kalıpları tanıma ödüllendirir:**

- "Decouple" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Global düşük gecikme süresi" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Uyumluluk/denetleme" → CloudTrail, Config, Security Hub, Macie
- "Maliyet optimizasyonu" → Spot Instances, Savings Plans, yaşam döngüsü politikaları, doğru boyutlandırma

**Hazırsınız**. Bu kitap her şeyi kapsayamadı - hiçbir şey kapsayamaz. Ancak, doğru cevabı bulmanıza yardımcı olacak prensipleri yeterince iyi anladığınız için.

## Alıştırmalar

**Son Alıştırma**

Bu bölümden sonra yapılandırılmış sınav soruları yoktur.

Bunun yerine: bir açık soru.

Bugün bildiğiniz şeyleri bilerek hangi sistemi inşa ederdiniz?

Yazın. Mimariyi çizin. Hizmetleri belirleyin. Yapacağınız trade-off'ları not edin. Arıza modlarını tahmin edin.

Sonra inşa edin.

Bu görevdir. Bir son teslim tarihi yoktur. Bir notunuz yoktur. Sadece iş vardır.

## Kapanış Sahnesi

Yatırım geldi.

A Serisi. 4 milyon dolar. Beş yeni şehir genişlemeye, mühendislik ekibini üç katına çıkarmaya ve Nimbus Instant'ı inşa etmeye yetecek kadar.

O akşam Maya, ailesinin restoranında, ilk restorandı. Nimbus'un başladığı, telefonun sürekli meşgul olduğu ve bu yüzden siparişlerin kaçırıldığı yer.

Arepa—her zamanki sipariş ettiği aynı yemeği sipariş etti.

Beklerken, dizüstü bilgisayarını açıp kitabın ilk bölümünü okudu.

*"Bir web sitesi nerede yaşar?"*

Cevabını bilmediğini hatırladı.

Gülümsedi.

Dizüstü bilgisayarını kapattı.

Yemek geldi.

Mükemmeldi.

*Okuduğun için teşekkürler.*

*AWS Solutions Architect Associate sınavı (SAA-C03), Pearson VUE test merkezlerinde ve uzaktan test sistemleri aracılığıyla online olarak mevcuttur. Kaydolarak aws.amazon.com/certification adresini ziyaret edin.*

*Nimbus'un hikayesi kurgusaldır. Bu kitabın AWS hizmetleri, fiyatlandırma modelleri ve en iyi uygulamaları gerçekçi olup, bunlar zamanla değişebilir. AWS, hizmetlerini sık sık günceller. Güncel fiyatlandırma ve hizmet yeteneklerini aws.amazon.com adresinden kontrol edin.*

*Başarılar dileriz.*
