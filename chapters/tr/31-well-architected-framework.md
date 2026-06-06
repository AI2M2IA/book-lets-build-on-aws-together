# Bölüm 31: Bulut Mimarisi İçin İnşaat Denetçisi

Ayağa kalkın. Esneyin. İhtiyacınız varsa gerçek bir mola verin.

Bu bölüm öncekilerden farklı. 30 bölüm boyunca belirli hizmetler ve desenler hakkında bilgi biriktirdik. Şimdi geriye adım atıp bütüne bakıyoruz.

*İyi* bir bulut mimarisi gerçekte neye benzer? İnşa ettiğiniz şeyin gerçekten iyi tasarlanmış mı yoksa sadece işlevsel mi olduğunu değerlendirmenin sistematik bir yolu var mı?

Var. AWS buna Well-Architected Framework diyor.

**Özet: Sayıların Ardından Gelen Soru**

Üç aylık maliyet optimizasyonu, hepsini şaşırtan bir sayı üretmişti: yıllık 35.904 $ tasarruf, belirlenen ve çoğu uygulanan. EC2 Savings Plans, S3 yaşam döngüsü politikaları, depolama temizliği, kullanılmayan veritabanı replikaları, NAT Gateway uç noktaları — her biri ayrı bir keşif, ayrı bir düzeltme olmuştu. Ama o sürecin bir yerinde Maya farklı bir soru sormaya başlamıştı. "İsraf nerede?" değil, "bu en başta nasıl birikti?" Maliyet sorunları bir şeyin belirtileriydi. Well-Architected Framework, o şeyin ne olduğunu adlandırmak için bir sözcük dağarcığıydı.

Nimbus iki yıldır çalışıyordu. Ekip yüzlerce mimari karar vermişti — bazısı bilinçli, bazısı kazara, bazısı baskı altında. Sistem çalışıyordu. Ama Maya'nın bir sorusu vardı.

"Mimarimiz gerçekten *iyi* mi?" diye sordu. "Sadece işlevsel değil. İyi."

Kimse hemen cevap vermedi.

"Çünkü bir Well-Architected Review'dan söz edildiğini duyuyorum," diye devam etti. "AWS bunu müşterilerine sunuyor. Bazı yatırımcılarımız bahsetti. Bence bir tane yapmalıyız."

"Bu nedir?" diye sordu Leo.

"AWS'nin bulut mimarilerini değerlendirmek için kullandığı çerçeve," dedi Priya. "Altı sütun. Her biri için bir dizi soru ve en iyi uygulama. Mimarinizi hepsine karşı değerlendirip neyin eksik olduğunu belirliyorsunuz."

"Bina denetimi gibi," dedi Tom. "Binanın çalıştığını biliyorsun. Denetim, yönetmeliklere uygun olup olmadığını ve depremde neyin çökebileceğini söyler."

**Altı Sütun**

AWS Well-Architected Framework altı sütun etrafında düzenlenmiştir. Her sütunun bir dizi tasarım ilkesi, en iyi uygulaması ve mimarinizi değerlendirmek için soruları vardır.

**1. Operasyonel Mükemmellik**

*Odak*: İş değeri sunmak için sistemleri çalıştırmak ve izlemek, süreçleri ve prosedürleri sürekli iyileştirmek.

Temel alanlar:

- Değişiklikleri nasıl dağıtıyorsunuz? (CI/CD, kod olarak altyapı, otomatik dağıtımlar)
- Sistemi nasıl izliyor ve bir şeyin ne zaman ters gittiğini nasıl biliyorsunuz?
- Başarısızlıklardan nasıl öğreniyorsunuz? (post-mortem'ler, runbook'lar, suçlamasız kültür)
- Ölçekte değişiklikleri nasıl ele alıyorsunuz?

Nimbus değerlendirmesi:

- Mevcut: Otomatik dağıtımlı CI/CD veri hattı
- Mevcut: CloudWatch alarmları ve GuardDuty
- Mevcut: Üç aylık kaos mühendisliği testleri
- Uyarı: Post-mortem süreci resmileştirilmedi — olaylar araştırıldı ama öğrenilenler sistematik olarak belgelenmedi

**2. Güvenlik**

*Odak*: Risk değerlendirmesi ve azaltma stratejileri yoluyla bilgileri, sistemleri ve varlıkları korumak.

Temel alanlar:

- Kim neye, mümkün olan en az ayrıcalıkla erişebilir?
- Veriler beklemede ve aktarımda nasıl şifrelenir?
- Tehditleri nasıl tespit eder ve yanıt verirsiniz?
- Otomatik güvenlik kontrolleri var mı?

Nimbus değerlendirmesi:

- Mevcut: En az ayrıcalıkla IAM (Bölüm 14'teki temizlikten sonra)
- Mevcut: Veri şifreleme için KMS, kimlik bilgileri için Secrets Manager
- Mevcut: GuardDuty, WAF, Shield Standard
- Mevcut: Özel alt ağlı VPC, güvenlik grupları
- Uyarı: EC2 örneklerinde güvenlik yamalaması tam otomatik değil (Priya aylar önce bunu işaretledi, henüz çözülmedi)

"Dur — ama *neden* öyle yapalım ki?" diye sordu Maya, güvenlik yamalaması açığı gündeme geldiğinde. "Dağıtımları otomatikleştirdik. Yedeklemeleri otomatikleştirdik. Yamalamayı neden manuel bıraktık?"

"Çünkü yamalama, kod dağıtmaktan farklı hissettiriyordu," dedi Priya. "Yamalamanın bir şeyi bozmasından endişeleniyorduk. Bu yüzden kontrolü korumak için onu manuel tuttuk."

"Ve manuel tutarak, onu tutarsız hale getirdik," dedi Maya. "Ki bu daha kötü."

"Evet," dedi Priya. "AWS Systems Manager Patch Manager bunu çözer. Bunu altı ay önce yapmalıydık."

**3. Güvenilirlik**

*Odak*: Bir sistemin amaçlanan işlevini doğru ve tutarlı bir şekilde yerine getirmesini ve arızalardan kurtulabilmesini sağlamak.

Temel alanlar:

- Sistem bileşen düzeyindeki arızaları nasıl ele alır?
- Bölgesel arızalardan nasıl kurtulur?
- Talep nasıl yönetilir?
- Sistem arıza için nasıl test edilir?

Nimbus değerlendirmesi:

- Mevcut: Tüm kritik bileşenler için Multi-AZ
- Mevcut: Otomatik yük devretmeli Aurora Serverless
- Mevcut: EC2 ve ECS için Auto Scaling
- Mevcut: Kaos mühendisliği testleri (üç aylık)
- Uyarı: Çok bölgeli dağıtım yok (sıcak yedek henüz uygulanmadı — gelecek çeyrek için planlandı)

**4. Performans Verimliliği**

*Odak*: BT ve bilgi işlem kaynaklarını verimli kullanmak.

Temel alanlar:

- İş yükü için doğru örnek türü ve veritabanı türü mü kullanılıyor?
- Ölçekleme doğru yapılandırılmış mı?
- Veri kullanıcılara en uygun konumdan mı sunuluyor?

Nimbus değerlendirmesi:

- Mevcut: Küresel içerik dağıtımı için CloudFront
- Mevcut: Veritabanı okuma hızlandırması için ElastiCache
- Mevcut: Aurora okuma replikaları
- Mevcut: Uygun iş yükleri için Lambda
- Uyarı: Bazı EC2 örnekleri ilk dağıtımdan beri hiç doğru boyutlandırılmadı

**5. Maliyet Optimizasyonu**

*Odak*: Gereksiz maliyetlerden kaçınmak.

Temel alanlar:

- Kaynaklar uygun şekilde boyutlandırılmış mı?
- Kullanılmayan kaynaklar devre dışı bırakılıyor mu?
- Uygun fiyatlandırma modelleri kullanılıyor mu?
- Harcama anormallikleri tespit ediliyor mu?

Nimbus değerlendirmesi:

- Mevcut: Savings Plans uygulandı (Bölüm 27)
- Mevcut: S3 yaşam döngüsü politikaları (Bölüm 23)
- Mevcut: DynamoDB Auto Scaling
- Mevcut: Uyarılı AWS Budgets
- Mevcut: Üç aylık maliyet incelemeleri

"Bu tam olarak ayda ne kadar tutuyor — henüz doğru boyutlandırmadığımız her şey?" diye sordu Tom. "Hiç değerlendirilmemiş EC2 örnekleri. Hâlâ birinci yılda sağladığımız boyutta olanlar."

"Bilmiyorum," dedi Leo. "Mesele de bu."

"İşte Performans Verimliliği açığı bu," dedi Priya. "Bildiğimiz şeyleri optimize ettik. Henüz bakmadığımız şeyler için bir sayımız yok."

**6. Sürdürülebilirlik**

*Odak*: Bulut iş yüklerini çalıştırmanın çevresel etkilerini en aza indirmek.

Temel alanlar:

- Kullanım maksimize ediliyor mu (boşta kaynaklardan kaçınmak)?
- Örnek türleri enerji verimliliği için mi seçiliyor?
- Veri yalnızca gerektiği kadar saklanıyor mu?

Nimbus değerlendirmesi:

- Mevcut: Sunucusuz/konteynerleştirilmiş iş yükleri için Lambda ve Fargate (özel EC2'den daha iyi kaynak verimliliği)
- Mevcut: S3 yaşam döngüsü politikaları (artık gerekmediğinde veriyi sil)
- Uyarı: Bazı Graviton tabanlı örnekler henüz benimsenmedi (AWS Graviton daha enerji verimli ve daha ucuzdur)

**Well-Architected İnceleme Süreci**

İnceleme, geçtiğiniz ya da kaldığınız bir test değildir. Altı sütun boyunca 60'tan fazla soruyla yönlendirilen, mimariniz hakkında yapılandırılmış bir konuşmadır.

Her soru bir en iyi uygulamayı belirler. Mimariniz onu izliyorsa, bu bir güçlü yöndür. İzlemiyorsa, bir "sorun"dur — risk düzeyine göre kategorize edilir (yüksek, orta, düşük).

Çıktı: önceliklendirilmiş bir iyileştirme önerileri listesi. Her şeyin hemen düzeltilmesi gerekmez. Çerçeve, her açığın ödünleşimlerini anlamanıza ve önce neyi ele alacağınıza karar vermenize yardımcı olur.

AWS'nin Well-Architected Tool'u (AWS konsolunda mevcut, ücretsiz) soru çerçevesini sağlar ve önerilerle bir rapor üretir.

Nimbus için Maya, altı sütunun tamamını kapsayan yarım günlük bir inceleme oturumu planladı — ve onu tek başına yürütmemeye karar verdi. Oturumun kendisi ve ürettiği bulgular listesi, bu bölümün gittiği yer.

**Lens: İncelemeyi Uzmanlaştırma**

Temel Well-Architected Framework teknolojiden bağımsızdır. AWS ayrıca **Lens'ler** de yayınlar — çerçevenin belirli kullanım durumları ya da sektörler için uzantıları:

- **Serverless Lens**: Lambda ağırlıklı mimariler için ek sorular
- **SaaS Lens**: Çok kiracılı SaaS uygulamaları için
- **Machine Learning Lens**: ML eğitimi ve çıkarım iş yükleri için
- **Financial Services Lens**: FinTech için düzenleyici ve uyumluluk soruları
- **Healthcare Lens**: HIPAA hususları

Şunu merak ediyor olabilirsiniz: lansmandan önce altı sütunun tamamına karşı tam Well-Architected incelemesini yürütmeniz gerekir mi? Hayır. Değer sorularda, puanda değil. Lansman öncesindeyseniz, durumunuza en alakalı iki sütunu seçin — Güvenlik ve Güvenilirlik neredeyse her zaman doğru başlangıç noktasıdır — ve yalnızca o soruları çözün. Gerçekten yapılan kısmi bir inceleme, mimari "hazır" olana kadar ertelenen eksiksiz bir incelemeden daha değerlidir.

Nimbus için SaaS Lens alakalıydı. Kiracı izolasyonu, onboarding otomasyonu ve kiracı başına maliyet tahsisi hakkında sorular ekledi — hepsi Nimbus'un aktif olarak geliştirdiği alanlar.

**Well-Architected İnceleme Oturumu: Carlos Kolaylaştırıyor**

Maya, bir AWS topluluk etkinliğinde tanıştığı ve onlarınki gibi ekipler için Well-Architected incelemeleri yürüten kıdemli bir mimar olan Carlos'u oturumu yönetmeye davet etmişti. Dizüstü bilgisayarında Well-Architected Tool açık ve tek bir not defteriyle geldi. Gündem yok. Sadece sorular.

"Ben soracağım, siz dürüstçe cevaplayacaksınız," dedi. "Dürüst cevap 'bilmiyoruz' ise, bunu söyleyin. Bu bir bulgudur."

Operasyonel Mükemmellik ile başladı.

"İlk beş olayınız için runbook'larınız var mı?"

Tom Leo'ya baktı. Leo tavana baktı.

"İki olay için runbook'umuz var," dedi Priya. "Veritabanı bağlantı limiti ihlali ve CloudFront origin zaman aşımı. Diğer üçü — yoğun zamanda EC2 örnek arızası, DynamoDB kısıtlaması ve Stripe webhook arızası — bunları anlık olarak hallediyoruz."

Carlos şunu yazdı: *OPS-1: İlk 5 olay için runbook'lar. Mevcut: 2/5. Açık: 3.*

"Mevcut runbook'ları bir tatbikatta en son ne zaman baştan sona çalıştırdınız?"

Sessizlik.

"Çalıştırmadık," dedi Priya. "Onları olaylardan sonra yazdık. Hâlâ doğru olup olmadıklarını hiç test etmedik."

*OPS-2: Runbook doğrulaması. Son test: asla.*

Carlos devam etti. Güvenlik.

"Şu anda kimde root hesabı erişimi var?"

"Root mu?" dedi Leo. "Sadece Maya'da. Ve sanırım hesabı kurduğumuzdan beri Tom'da hâlâ root kimlik bilgileri var — ama Bölüm 14'ten sonra onları döndürdük." Durakladı. "Tom, IAM temizliğinden sonra root'u döndürdük mü?"

Tom bir 1Password girdisini açtı. "Parolayı değiştirdik ve MFA ekledik. Ama root kimlik bilgileri hâlâ paylaşılan 1Password kasasında. O kasaya üç kişinin erişimi var: ben, Maya ve Leo."

"Yani üç kişinin root erişimi var," dedi Carlos. "AWS'nin yönlendirmesi, root'un yalnızca kısa, belgelenmiş bir görev listesi için kullanılması gerektiğidir — yaklaşık on hesap düzeyinde işlem, hepsi nadir ve çoğu yalnızca acil durum. Bu işlemlerden sonra root oturumu sonlandırılmalıdır. Root erişimi ayrı olarak kaydediliyor mu?"

"CloudTrail kaydediyor," dedi Priya.

"Root kullanıldığında bir uyarı var mı?"

Bir başka duraklama.

"Hayır," dedi Tom.

Carlos şunu yazdı: *SEC-1: Root hesabı erişim kontrolü. Mevcut: paylaşılan kasada 3 kullanıcı, kullanım uyarısı yok. Açık: Root kullanımı anında bir SNS uyarısı tetiklemelidir. Hedef: acil durum dışı 0 root oturumu.*

"Sıradaki: IAM izin değişikliklerini kim inceliyor? Yeni IAM rolleri ya da politika genişletmeleri için bir akran inceleme süreci var mı?"

"Priya inceliyor," dedi Leo. "O fiilen güvenlik denetçisi."

"Priya tatildeyken ne oluyor?"

Kimse cevap vermedi.

"Bu bir süreç açığı," dedi Carlos, yargılamadan. "Priya'nın yeteneğinde bir açık değil — süreç tasarımında bir açık. Tek bir kişinin müsaitliğine bağlı bir güvenlik incelemesi, güvenlik duruşunuzda tek bir arıza noktasıdır."

*SEC-2: IAM inceleme süreci. Mevcut: tek inceleyici, yedek yok. Açık: Bir yedek inceleyici tanımla ve inceleme kriterlerini belgele.*

Carlos Güvenilirlik'e döndü.

"Aurora Multi-AZ yük devretmesini yük altında test ettiniz mi?"

"Boştayken test ettik," dedi Tom. "Sistem sakinken yük devretme komutunu çalıştırdık ve replikanın 45 saniye içinde yükseltildiğini doğruladık."

"O sırada yük neydi?"

"Belki zirvenin %5'i."

"Yük devretme sırasında %80 zirve yükünde bağlantı havuzuna ne olur?"

Tom düşündü. "DNS uç noktası güncellenir. Yazar uç noktasını kullanan uygulamalar geçiş penceresi sırasında bağlantı hataları görür — tipik olarak 20-45 saniye. %5 yükte on aktif bağlantımız vardı. Zirvede 300 olurdu. Önünde RDS Proxy varken, proxy yeniden bağlanmayı yönetir."

"RDS Proxy, Multi-AZ yük devretmesi sırasında gerçekten şeffaf bir şekilde yeniden bağlanıyor mu?"

Tom Priya'ya baktı. "Sanırım. Ama test etmedim."

"Bu, 'evet'ten farklı bir cevap," dedi Carlos. "Yüksek kullanılabilirlik tasarımınızda test edilmemiş bir varsayım, bir bulgudur."

*REL-1: Yük altında Aurora Multi-AZ yük devretmesi. Test edildi: yalnızca boşta. Açık: RDS Proxy yerinde %70 zirve yükünde test et. Yük devretme penceresi sırasında bağlantı havuzu davranışını doğrula.*

"Yük devretme 45 yerine 90 saniye sürerse ne olur diye düşündün mü?" diye sordu Priya, Carlos yerine Tom'a hitap ederek. Zaten işi yapıyordu.

"90 saniyede, yeniden denenemeyecek istekler için uygulama zaman aşımlarımız olur," dedi Tom. "Sipariş verme akışında yeniden deneme mantığı var. Onay akışında — daha az. Akşam yoğunluğu sırasında 90 saniyelik bir yük devretme, bir kısım onayın başarısız olması, restoranların siparişi almaması, müşterinin geri ödeme alması anlamına gelir."

"İşte etki yarıçapı bu," dedi Carlos. "Güzel. Şimdi neye karşı koruduğunuzu ve onu nasıl ölçeceğinizi biliyorsunuz. Test hem yük devretme süresini hem de geçiş penceresi sırasındaki uygulama davranışını doğrulamalı."

Performans Verimliliği'ne geçti.

"EC2 örneklerinizi doğru boyutlandırıyor musunuz?"

"Maliyet incelemesi sırasında doğru boyutlandırdık," dedi Tom. "Savings Plans mevcut örnek türlerine taahhüt edildi."

"Compute Optimizer'ın önerilerine en son ne zaman baktınız?"

Tom onu açtı. AWS Compute Optimizer üç örneği potansiyel olarak fazla sağlanmış olarak işaretlemişti: iki c6g.medium arka plan işlemcisi ve bir t3.medium VPN sunucusu. VPN sunucusu önerisi bir t3.small'a küçültmekti. İşlemciler %82 güvenle "fazla sağlanmış" olarak işaretlenmişti.

"Bunu kurduğumuzdan beri buna bakmadık," diye kabul etti Tom.

"Compute Optimizer ne zamandır öneri üretiyor?"

Tom kontrol etti. "Altı hafta."

Carlos şunu yazdı: *PERF-1: Compute Optimizer ile EC2 doğru boyutlandırma. Mevcut: öneriler mevcut, incelenmedi. Açık: Compute Optimizer çıktısının aylık incelemesi; staging doğrulamasından sonra önerileri uygula.*

"Bir tane daha," dedi Carlos. "Bu, tüm sütunlar arası." Beyaz tahtaya yazdı:

*Olaysız olmak, iyi tasarlanmış olmakla aynı şey değildir.*

Bir süre orada bırakdı.

"Sisteminiz iki yıldır müşteriye dönük büyük bir kesinti olmadan çalışıyor," dedi. "Bu gerçekten iyi. Ama bunun size ne söylediğini — ve ne söylemediğini — fark etmenizi istiyorum."

"Bize şanslı olduğumuzu mu söylüyor?" diye önerdi Leo.

"Size, karşılaştığınız arıza modlarının, bugün sahip olduğunuz mimari göz önüne alındığında ele alma yeteneğiniz dahilinde olduğunu söyler. Mimarinin sağlam olduğunu söylemez. Henüz başarısız olmamış bir sistemin dayanıklı olduğu kanıtlanmamıştır. Yalnızca zayıflıklarını ortaya çıkaracak belirli koşullarla karşılaşmadığı kanıtlanmıştır."

"Yani başarısız olmamak, savunmasız olmamak demek değil," dedi Maya.

"Doğru. Well-Architected incelemesi geçmiş başarısızlıkların kanıtını aramıyor. Gelecekteki maruziyeti arıyor. Test edilmemiş yük devretme. Var olmayan runbook'lar. Çok geniş olan IAM rolü. Bunların hiçbiri henüz bir olaya neden olmadı. Hepsi olabilirdi."

"Yamalama açığının önemli olmasının nedeni bu," dedi Priya. "Yamalanmamış bir EC2 örneği üzerinden ihlal edilmedik. Bu, edilmeyeceğimiz anlamına gelmez."

"Aynen," dedi Carlos. "Zararın yokluğu, güvenliğin kanıtı değildir. Ele alınmamış bir güvenlik açığının varlığı, riskin kanıtıdır — riskin gerçekleşip gerçekleşmediğine bakılmaksızın."

Kalemin kapağını kapattı.

"İyi tasarlanmış bir sistemle şanslı bir sistem arasındaki fark budur."


**IAM Aşırı İzin Bulgusu**

Carlos, güvenlik sütunu incelemesi sırasında daha derin bir incelemeyi gerektiren ikinci bir bulgu işaretledi.

"Sipariş bildirimlerini yöneten Lambda fonksiyonunuz — hangi IAM izinlerine sahip?"

Leo yürütme rolünü açtı. Onu bulması olması gerekenden otuz saniye daha uzun sürdü — rol Nimbus'un başlangıcında oluşturulmuş ve genel bir adla adlandırılmıştı.

"S3 tam erişimi," dedi, bulduğunda.

Carlos bekledi.

"Hangi paket?" diye sordu.

"Tüm paketler," dedi Leo. Politikayı okudu. "`arn:aws:s3:::*`. Ona S3 tam erişimi verdik."

"Fonksiyon S3 ile gerçekte ne yapıyor?"

"Tek bir paketten restoran yapılandırması okuyor," dedi Leo. "`nimbus-restaurant-config` paketi. Özellikle `restaurants/{restaurant_id}/config.json` nesneleri. Onları okuyor. Hepsi bu."

"Yani fonksiyonun `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json` üzerinde `s3:GetObject`'e ihtiyacı var," dedi Carlos. "Sahip olduğu şey, hesaptaki her paket üzerinde tam S3 izinleri."

"Dahil," dedi Priya, "Aurora anlık görüntü paketi. CloudTrail günlükleri paketi. Müşteri sipariş geçmişi paketi."

"Bu Lambda fonksiyonu ele geçirilirse," dedi Carlos, "bir saldırgan hesaptaki her S3 paketine tam erişime sahip olur. Herhangi bir veriyi okuyabilir, yazabilir ya da silebilir."

"Onu zaten dağıtmıştım — ah," dedi Leo. Politikayı okuyordu. "Bunu iki yıl önce yazdım. Bildirim sistemini çalıştırmak için aceleydim. Henüz neye ihtiyacı olduğundan emin olmadığım için geniş erişim verdim. Ve onu daraltmak için hiç geri dönmedim."

"Bu, production sistemlerinde aşırı iznin en yaygın kaynağıdır," dedi Carlos, suçlamadan. "Kasıtlı ihmal değil — zaman baskısı altında alınan, hiç yeniden ele alınmayan bir kestirme."

Tom çoktan Lambda yürütme rollerinin tam listesine bakıyordu.

"Lambda fonksiyonlarımızdan kaçının aşırı geniş izinleri var?" diye sordu Maya.

Yirmi dakikalık incelemeden sonra cevap: 23 Lambda fonksiyonundan 7'sinin, belgelenmiş amacının gerektirdiğinden daha geniş izinleri vardı. En endişe verici olanı: ödeme onayı Lambda'sının tüm tablolarda `dynamodb:*` izni vardı. Yalnızca orders tablosunda `dynamodb:GetItem` ve `dynamodb:PutItem`'e ihtiyacı vardı.

"Yedisinin hepsini düzeltmek için üç saatlik iş," diye tahmin etti Priya. "En az ayrıcalık politikalarını yaz, ekle, geniş olanları kaldır."

"Bu şimdiye kadarki en yüksek riskli bulgu mu?" diye sordu Maya Carlos'a.

"Runbook açığıyla berabere," dedi. "IAM sorunu bir etki yarıçapı sorunu — bu fonksiyonlardan herhangi biri ele geçirilirse, saldırganın erişimi olması gerekenden çok daha büyük. Runbook sorunu bir kurtarma süresi sorunu — bir şey ters gittiğinde, test edilmiş bir prosedürü izlemek yerine doğaçlama yapıyorsunuz. İkisi de gerçekten yüksek risk."

Maya ikisini de takip belgesinde P1 olarak işaretledi.

"Peki ya birisi içeri girmeye çalışırsa?" dedi Priya. "Harici saldırganlar hakkında endişeleniyorduk. Ama aşırı izinli bir Lambda, dahili bir arızanın — yanlış yapılandırma, bağımlılık güvenlik açığı, tedarik zinciri saldırısı — aynı etki yarıçapına sahip olabileceği anlamına gelir."

"Derinlemesine savunma, her katmanın gerekli minimum erişime sahip olduğunu varsayar," dedi Carlos. "Bir katman ihtiyacından fazla erişime sahip olduğunda, derinlemesine savunma tasarlandığı gibi çalışmayı durdurur. Ele geçirilmiş bir katmanınız olur, ama o katmanın diğer üç katmanın anahtarları vardır."

Priya, IAM aşırı izin bulgusunu, bir haftalık bir teslim tarihiyle, birinci sütunda P1 olarak işaretledi.


**Bulguları Sıralama: P1, P2, P3**

Oturumun sonunda ekibin tahtada 14 bulgusu vardı. Carlos onlardan ayrılmadan önce önceliklendirmelerini istedi.

"Bu listedeki her bulgunun bir önceliği olmalı," dedi. "Her şey eşit derecede önemli değil. Şunlara göre önceliklendirin: bu başarısız olursa etki yarıçapı nedir? Başarısız olma olasılığı nedir? Düzeltmek ne kadar zor?"

14 bulgu:

1. İlk 5 olayın 3'ü için runbook yok (OPS)
2. Runbook'lar hiç test edilmedi (OPS)
3. Runbook'ların ötesinde resmi olay müdahale süreci yok (OPS)
4. Paylaşılan kasada root erişimi, kullanım uyarısı yok (SEC)
5. IAM inceleme sürecinde yedek inceleyici yok (SEC)
6. 7 Lambda fonksiyonu aşırı izinli (SEC) ← Leo'nun bildirim Lambda'sı
7. Birkaç güvenlik grubu kuralı gereğinden geniş (SEC)
8. Aurora yük devretmesi yük altında test edilmedi (REL)
9. Çok bölgeli DR planı uygulanmadı (REL)
10. Güvenlik yamalaması otomatikleştirilmedi (SEC)
11. EC2 doğru boyutlandırması lansmandan beri incelenmedi (PERF)
12. Graviton örnekleri benimsenmedi (SUST)
13. CloudFront önbellek TTL'leri ayarlanmadı (PERF)
14. Altyapının %40'ı IaC'de değil (OPS)

"Bariz olanlarla başlayın," dedi Carlos. "Yalnızca bir haftanız olsa hangi üçünü önce düzeltirdiniz?"

Maya hemen söyledi: "Root erişim uyarısı. Lambda aşırı izinleri. Güvenlik yamalaması otomasyonu."

"Neden?" diye sordu Carlos.

"Çünkü bu üçü, net bir etki yarıçapına sahip güvenlik açıkları. Diğerleri güvenilirlik ve operasyonel iyileştirmeler — önemli, ama onlarla yaşadık ve bir olaya neden olmadılar. Güvenlik açıkları, düzeltmediğimiz her gün sessizce katlanıyor."

Tom hafifçe katılmadı. "Lambda aşırı izinleri acil. Ama güvenlik yamalamasını Aurora yük devretme testiyle değiştirirdim. Multi-AZ kurulumumuzun yük altında doğru çalıştığını hiç doğrulamadık. Bir cuma akşam yoğunluğu sırasında başarısız olursa ve bunun için test edilmiş bir runbook'umuz yoksa, başımız belada."

"İkisi de P1 olabilir," dedi Priya. "Bir haftamız var. Beş iş günü. Lambda izinleri fonksiyon başına iki saatlik bir düzeltme. Root erişim uyarısı otuz dakikalık bir CloudWatch olay kuralı. Güvenlik yamalaması otomasyonu iki günlük Systems Manager kurulumu ve testi. Aurora yük devretme testi, salı günü gece 2'de planlanan yarım gün."

Carlos başını salladı. "Önceliklendirmenin doğru yolu bu. Yalnızca 'en önemli ne' değil, 'bu hafta gerçekte ne yapabiliriz ve hangi sırayla?'"

Nihai önceliklendirme:

**P1 (bu hafta)**:
- Lambda yürütme rolü en az ayrıcalık düzeltmesi (7 fonksiyon)
- Root hesabı CloudWatch uyarısı
- Yük altında Aurora Multi-AZ yük devretme testi (gelecek salı gece 2'ye planla)

**P2 (bu ay)**:
- Systems Manager ile güvenlik yamalaması otomasyonu
- İlk 3 olay için eksik runbook'lar
- Resmi olay müdahale süreci belgelendi
- %40 IaC göçü — hangi kaynaklar olduğunu belirle, göç planı oluştur

**P3 (bu çeyrek)**:
- Runbook doğrulama tatbikatı
- IAM inceleme süreci yedek inceleyici belgelendi
- Çok geniş güvenlik grubu kuralları sıkılaştırıldı
- Compute Optimizer ile EC2 doğru boyutlandırma incelemesi
- Graviton benimseme planı
- CloudFront TTL ayarı

"İşte sahipleri, teslim tarihleri ve öncelikleri olan on dört bulgu," dedi Maya. "Teknik borç konusunda hiç bu kadar düzenli olmadık."

"İncelemenin amacı bu," dedi Carlos. "Açıklar hakkında kötü hissetmenizi sağlamak için değil. Size, gerçekten uygulayabileceğiniz bir sözcük dağarcığı ve bir liste vermek için."


**İyi Tasarlanmış İle Sadece Çalışan Arasındaki Fark**

"Sistemimiz çalışıyor," dedi Leo incelemeden sonra. "Ama ne kadar çok şeyi 'yeterince iyi' yapıp devam ettiğimizi fark etmemiştim."

"Bu açıkları bırakmaya devam edersek ne olur diye düşündük mü?" diye sordu Priya. "Yamalama sorunu aylardır açık. Olay müdahale süreci yok. Bunlar küçük şeyler değil — bir cuma gecesi kesintisinin 20 dakikalık bir düzeltme mi yoksa dört saatlik bir felaket mi olacağını belirleyen şeyler."

"İşte bu yüzden incelemeyi yapıyoruz," dedi Maya.

"Bu normal," dedi Priya. "Zaman baskısı altında inşa etmek, pragmatik seçimler yapmanız demektir. Well-Architected incelemesi, onları yeniden ele almak için planlanmış zamandır."

"Bu açıkların bazıları geriye dönüp bakınca bariz görünüyor," diye devam etti. "Güvenlik yamalaması — onu otomatikleştirmediğimizi biliyordum. Sadece düzeltmeyi hiç önceliklendirmedim."

"Çünkü 'çalışıyor' ile 'iyi tasarlanmış' günlük olarak aynı hissettiriyor," dedi Maya. "Fark yalnızca bir şey ters gittiğinde görünür hale geliyor."

Bu, kıdemli bir mühendisin anladığı en önemli şeylerden biridir: olayların yokluğu, riskin yokluğu anlamına gelmez. Riskin henüz tetiklenmediği anlamına gelir.

**Kod Olarak Altyapı: Operasyonel Mükemmellik Sağlayıcısı**

Birden çok sütun boyunca tek bir tema: **Kod Olarak Altyapı (IaC)**.

Altyapınız konsol aracılığıyla manuel olarak yapılandırılmışsa, o zaman:

- DR senaryosunda yeniden oluşturmak yavaş ve hataya açıktır
- Değişiklikleri denetlemek imkânsızdır (kim neyi, ne zaman değiştirdi?)
- Kötü bir değişikliği geri almak manuel tersine çevirme gerektirir
- Ortamlar (dev/staging/production) arasında tutarlılık disiplin gerektirir

**AWS CloudFormation**, altyapıyı YAML/JSON şablonlarında tanımlamanıza olanak tanır. **AWS CDK (Cloud Development Kit)**, altyapıyı programlama dilleriyle (Python, TypeScript, Java) tanımlamanıza olanak tanır. **Terraform** popüler bir üçüncü taraf alternatiftir.

Nimbus, Terraform kullanarak kademeli olarak IaC'ye geçiyordu. Well-Architected incelemesi zamanında altyapılarının yaklaşık %60'ı kodda tanımlanmıştı. İnceleme %100'e ulaşmayı önerdi.

"Neden kalan %40?" diye sordu Leo.

"Kalan %40, kritik altyapımızın yaşadığı yer," dedi Priya. "Onu koddan yeniden oluşturamazsak, bölgesel bir felaketten güvenilir şekilde kurtulamayız."

Leo listeye baktı. "Kalan %40 — evet. Sorun olmaz, gelecek sprint'te göç ettiririz."

Priya bakışlarını ekrana sabitledi. "Bu kritik altyapı. Çok bölgeli yük devretme yapılandırması. IAM rol hiyerarşisi. Gece 3'te sıfırdan yeniden oluşturmak zorunda kalırsak, tam olarak doğru olduklarını bilmemiz gereken şeyler."

Leo bunu bir an düşündü.

"...Haklısın," dedi sessizce. "Zaten herkesin yazdığından sapmış manuel yapılandırmamız var. Onu sıfırdan yeniden oluşturmak zorunda kalsaydık, tahmin yürütürdük."

"İşte bu yüzden inceleme onu buldu," dedi Maya. "Suç atfetmek için değil. Önemli hale gelmeden önce düzeltmek için."

**Derinlemesine CloudFormation: AWS Yerel IaC Aracı**

Nimbus Terraform'u benimsemiş olsa da, Well-Architected incelemesi ekibin AWS CloudFormation'ı — CDK, SAM (sunucusuz uygulama modeli) ve Service Catalog gibi hizmetleri destekleyen yerel AWS IaC hizmetini — hiç tam olarak anlamadığını da ortaya çıkardı. Sınav özellikle CloudFormation'ı test eder ve birkaç AWS hizmeti onu anlamayı gerektirir.

Carlos'un oturumun başında adlandırdığı sorun somuttu: Leo ortamlar oluşturmak için konsolda manuel olarak tıklayıp duruyordu. Her seferinde 45 dakika sürüyordu ve staging ile production arasındaki herhangi bir tutarsızlık, bir şey bozulana kadar görünmezdi. Geçen yılki beş production olayından üçü, production'da staging ile eşleşmeyen bir yapılandırmadan kaynaklanmıştı — farklı güvenlik grubu kuralları, farklı ortam değişkenleri, farklı bir örnek türü.

"Konsol tek yönlü bir kapıdır," dedi Carlos. "İçeri girip bir şeyleri değiştirebilirsin, ama kolayca geri çıkıp tam olarak neyin değiştiğini göremez ya da dünün durumunu yeniden üretemezsin."

CloudFormation bunun cevabıdır. İşte nasıl çalışır:

**Şablon (Template)**: İstediğiniz AWS altyapısını bildiren bir YAML ya da JSON dosyası. Onu nasıl oluşturacağınıza dair talimatlar değil — neye benzemesi gerektiğine dair bir bildirim. "Şu CIDR aralıklarına sahip bir VPC, iki genel alt ağ, iki özel alt ağ, bir İnternet Ağ Geçidi ve şu rota tablolarını istiyorum." CloudFormation şablonu okur ve gerçek altyapıyı bildirimle eşleştirmeyi nasıl yapacağını çözer.

Bir şablonu bir ortam tarifi olarak düşünün. Tarif değişmez. Ondan oluşturulan her ortam aynıdır. Staging ve production aynı şablonu kullanır, farklı parametrelerle (farklı örnek boyutları, farklı alan adları). Yapısal kararlar — hangi alt ağların var olduğu, hangi güvenlik grupları, hangi IAM rolleri — aynıdır.

**Yığın (Stack)**: Bir şablonun dağıtılmış örneği. Leo `aws cloudformation deploy --template-file infrastructure.yaml` çalıştırdığında, CloudFormation bir Yığın oluşturur — şablonun tanımladığı gerçek AWS kaynaklarının adlandırılmış bir koleksiyonu. Yığın hangi kaynakları oluşturduğunu hatırlar ve onları bir birim olarak yönetir. Şablonu güncelleyin ve Yığını yeniden dağıtın: CloudFormation mevcut durum ile yeni şablon arasındaki farkı hesaplar ve yalnızca gereken değişiklikleri uygular. Yığını silin: CloudFormation oluşturduğu her kaynağı, doğru sırada, siz onları hatırlamak zorunda kalmadan söker.

"Yani Yığın dağıtımdır, şablon değil?" diye sordu Maya.

"Şablon tariftir. Yığın yemektir. Aynı tariften aynı yemeği istediğiniz kadar yapabilirsiniz. Her seferinde aynıdır."

**Değişiklik Kümesi (Change Set)**: Çalışan bir Yığına bir güncelleme uygulamadan önce bir Değişiklik Kümesi oluşturabilirsiniz — CloudFormation'ın ne yapacağının bir önizlemesi. Yeni bir kaynak mı ekliyorsun? Değişiklik Kümesi onu gösterir. Bir güvenlik grubunu mu değiştiriyorsun? Değişiklik Kümesi önce ve sonra durumunu gösterir. Bir RDS örneğini mi değiştiriyorsun? Değişiklik Kümesi, sen taahhüt etmeden önce bunu bir değiştirme — ki bu kesinti demektir — olarak işaretler.

"Uygulamadan önce farkı gör," dedi Priya. "Leo konsolda bir şeylere tıkladığında kaçırdığımız şey bu."

Nimbus için politika şu hale geldi: production'a yapılan tüm altyapı değişiklikleri bir Değişiklik Kümesi incelemesinden geçmeli. Doğrudan konsol düzenlemesi yok. Değişiklik Kümesi, altyapı için akran inceleme sürecidir.

**Sapma Tespiti (Drift Detection)**: Zamanla insanlar konsolda bir şeylere tıklar. Bir olay sırasında eklenen bir güvenlik grubu kuralı. Bir dağıtımın ortasında değiştirilen bir ortam değişkeni. Planlanan düzeltme çok uzun sürdüğünde manuel olarak yükseltilen bir örnek türü. CloudFormation buna **sapma (drift)** der — bir kaynağın gerçek durumu artık Yığının şablonunun söylediğiyle eşleşmediğinde.

CloudFormation'ın sapma tespiti, Yığının kaynaklarını tarar ve gerçek durum ile şablon tanımlı durum arasındaki farkları raporlar. Leo mevcut Nimbus yığınlarında sapma tespitini ilk kez çalıştırdığında, on bir sapmış kaynak buldu. Yedisi güvenlik grubu değişiklikleriydi. Üçü IAM politika değişiklikleriydi. Biri, altı ay önce yaşam döngüsü politikası doğrudan konsolda değiştirilen ve hiç şablona yansıtılmayan bir S3 paketiydi.

"Gerçek altyapı ile şablonun anlaşamadığı on bir kaynak," dedi Priya. "Staging ile production arasında bilmediğimiz on bir potansiyel tutarsızlık."

Leo hiçbir şey söylemedi. O değişikliklerden bazıları onundu.

Sonraki haftayı sapmış kaynakları şablonlarla uzlaştırarak geçirdi. Manuel değişikliklerin üçü hataydı — hiç uygulanmaması gereken yapılandırma. Geri kalanı, yalnızca hiç şablona geri taahhüt edilmemiş meşru değişikliklerdi.

**Well-Architected Framework İçin Neden Önemli**: Kod Olarak Altyapı, Operasyonel Mükemmellik (tekrarlanabilir dağıtımlar, sürüm kontrollü altyapı, her değişikliğin denetlenebilirliği), Güvenilirlik (bir Bölge başarısız olursa, ortamı hafızadan değil şablondan yeniden oluşturabilirsiniz) ve Güvenlik (IAM rolleri ve güvenlik grubu kuralları, sonradan konsolda keşfedilmek yerine kodda incelenir) kesişiminde yer alır. Bir "olsa iyi olur" değildir — çerçevenin tutarlı olarak önerdiği temel uygulamalardan biridir.

---

> **Sınav İpucu — CloudFormation**
>
> *SAA-C03 Alanı: Alanlar arası — Operasyonel Mükemmellik ve Güvenilirlik*
>
> - **CloudFormation = AWS'de bildirimsel IaC.** İstenen durumu bir şablonda bildirirsiniz; CloudFormation kaynakları oluşturur ve yönetir. Sınav sinyali: "tekrarlanabilir dağıtımlar", "kod olarak altyapı", "tutarlı ortamlar".
> - **Şablon** → **Yığın**: şablon bildirimdir; Yığın dağıtılan kaynaklardır. Bir Yığın bir birim olarak oluşturulabilir, güncellenebilir ya da silinebilir.
> - **Değişiklik Kümesi**: Çalışan bir Yığına bir güncelleme uygulamadan önce neyin değişeceğini önizleyin. "Uygulamadan önce farkı gör." Sınav sinyali: "dağıtmadan önce altyapı değişikliklerini incele" → Değişiklik Kümesi.
> - **Sapma Tespiti**: CloudFormation dışında manuel olarak değiştirilmiş kaynakları belirler. "Birisi konsolda bir şeye tıkladı" → Sapma Tespiti.
> - **DeletionPolicy özniteliği**: Yığını silindiğinde bir kaynağa ne olacağını kontrol eder. `Retain` — kaynak korunur (kaybetmek istemediğiniz veriye sahip S3 paketleri için faydalı). `Delete` — kaynak yok edilir (varsayılan). `Snapshot` — RDS ve bazı diğer hizmetler için, CloudFormation silmeden önce son bir anlık görüntü alır. Sınav sinyali: "yığın silindiğinde bir RDS veritabanının silinmesini önle" → `DeletionPolicy: Snapshot` ya da `DeletionPolicy: Retain`.
> - **CloudFormation StackSets**: Aynı Yığını tek bir işlemle birden çok AWS hesabı ve bölgede dağıtın. Sınav sinyali: "bir kuruluştaki tüm hesaplarda aynı altyapıyı dağıt".

**Varyasyon: Çerçeve Sizi Yanılttığında**

Bir Well-Architected incelemesinde her kutuyu işaretleseniz ama arıza kurtarmanızı staging'de doğrulamadıysanız, yüksek kullanılabilirlik mimariniz ilk gerçek olayda başarısız olacaktır — çünkü dayanıklılığın belgelenmesi, test edilmiş dayanıklılıkla aynı şey değildir. Çerçeve "Multi-AZ'niz var mı?" diye sorar, "yük devretmenin sizin özel yapılandırmanızda gerçekten doğru çalıştığını doğruladınız mı?" diye değil.

Çerçeveyi, sistemi iyileştirmek için bir düşünme aracı olarak değil de bir denetçiyi tatmin etmek için bir kontrol listesi olarak kullanırsanız, tam olarak anlamadığınız bir mimarinin doğru belgelerini üretirsiniz. Sorular, bulmayı beklemediğiniz açıkları ortaya çıkardıklarında en değerlidir.

## Güçlü Yönler ve Sınırlamalar

**Well-Architected Framework'ün iyi yaptığı şey**: Ekiplere mimari ödünleşimleri tartışmak için ortak bir sözcük dağarcığı verir — personel değişikliklerine ve satıcı konuşmalarına dayanan bir dil. Bir Well-Architected İncelemesi yürütmek, aksi takdirde görünmez olan risklerin açıkça kabul edilmesini zorlar: "Evet, burada tek bir arıza noktamız olduğunu biliyoruz; onu ortadan kaldırmanın maliyeti arızanın beklenen maliyetini aştığı için o ödünleşimi kabul ettik." Bu tür belgelenmiş, kasıtlı bir ödünleşim, iyi bir incelemenin çıktısıdır.

**Yapamayacağı şey**: Çerçeve tanımlayıcıdır, kuralcı değildir. İyi tasarlanmış sistemlerin özelliklerini tanımlar — onları nasıl inşa edeceğinizi söylemez. Bir Well-Architected İncelemesinde her kutuyu işaretlemek iyi bir mimariyi garanti etmez. Bir sistem yüksek kullanılabilir, operasyonel olarak mükemmel, maliyet optimize edilmiş olabilir ve yine de yanlış sorunu çözebilir. Çerçeve bir lenstir, bir plan değil. Onu doğru soruları ortaya çıkarmak için kullanın, onları cevaplamak için değil.

## Özet

Well-Architected incelemesi onlara 14 madde bıraktı — üçü acil dikkat gerektiriyordu, geri kalanı bir plan gerektiriyordu. Yüksek riskli bulgular tam olarak sürpriz değildi; ekibin bildiği ama henüz ulaşamadığı şeylerdi. İnceleme onlara o açıkları açıkça kabul etmenin, riske göre önceliklendirmenin ve bir zaman çizelgesine taahhüt etmenin yapılandırılmış bir yolunu verdi. Bu hesap verebilirlik, herhangi bir tek bulgudan daha çok, değerin kendisiydi.

- **AWS Well-Architected Framework**'ün altı sütunu vardır: Operasyonel Mükemmellik, Güvenlik, Güvenilirlik, Performans Verimliliği, Maliyet Optimizasyonu ve Sürdürülebilirlik.
- Her sütunun, yapılandırılmış bir soru kümesiyle değerlendirilen tasarım ilkeleri ve en iyi uygulamaları vardır.
- **Well-Architected Tool** (AWS konsolunda ücretsiz) incelemeyi yönlendirir ve bir rapor üretir.
- Çıktı, riske göre kategorize edilmiş önceliklendirilmiş bir mimari iyileştirmeler listesidir.
- **Kod Olarak Altyapı** bir sütunlar arası sağlayıcıdır — Operasyonel Mükemmellik, Güvenlik ve Güvenilirlik sütunları tarafından önerilir.

## Sınav İpuçları

*SAA-C03 Alanı: Alanlar arası — tüm alanlar*

- **Altı sütunu ve birincil odaklarını bilin**. Sınav bir senaryo tanımlar (örn. "ekip sistemlerinin AZ arızalarından kurtulabilmesini sağlamak istiyor") ve hangi sütuna girdiğini sorar (Güvenilirlik).
- **Sütun eşlemesi**:
  - "Değişiklikleri güvenilir şekilde dağıt, arızalardan öğren, izle" → Operasyonel Mükemmellik
  - "IAM, şifreleme, ağ kontrolleri, tehdit tespiti" → Güvenlik
  - "HA, yük devretme, ölçekleme, DR" → Güvenilirlik
  - "Doğru boyutlandırma, CDN, doğru teknoloji seçimi" → Performans Verimliliği
  - "Fiyatlandırma modelleri, kullanılmayan kaynaklar, maliyet görünürlüğü" → Maliyet Optimizasyonu
  - "Enerji verimliliği, kaynak kullanımı, veri yaşam döngüsü" → Sürdürülebilirlik
- **Kod Olarak Altyapı**: Tekrarlanabilirlik, denetlenebilirlik ve kurtarma için çerçeve tarafından önerilir. CloudFormation, CDK ve SAM AWS yerel IaC araçlarıdır.
- **Well-Architected Tool**: İnceleme sürecini yönlendiren AWS konsol aracı. Kullanımı ücretsiz. İyileştirme planları üretir.
- **AWS Trusted Advisor**: Well-Architected çerçevesine benzer ama otomatik — hesabınızı tarar ve maliyet, performans, güvenlik ve hata toleransı boyunca öneriler sunar. Örtüşme gerçektir: Trusted Advisor, çerçevenin manuel olarak değerlendirdiği şeylerin bir kısmını otomatikleştirir.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

AWS Well-Architected Framework'ün altı sütununu adlandırın ve her birinin birincil endişesini bir cümleyle tanımlayın.

*(Bunu hafızadan yapmaya çalışın. Zorlanırsanız, bu hangi sütunların daha fazla dikkat gerektirdiği hakkında faydalı bir bilgidir.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir mühendislik ekibi bir Well-Architected incelemesine hazırlanıyor. Uygulamaları EC2 üzerinde RDS Multi-AZ ile çalışıyor. Yakın zamanda şunları keşfettiler:

- Dağıtım süreçleri bazen EC2 örneklerini farklı kütüphane sürümleriyle bırakıyor (yapılandırma sapması)
- RDS yük devretmesi tetiklendiğinde otomatik uyarıları yok
- IAM kullanıcılarının hepsinde AdministratorAccess var
- Yedekleme geri yükleme süreçlerini 14 aydır test etmediler

Her sorunu EN alakalı Well-Architected sütunuyla eşleştirin.

A) Yapılandırma sapması: Operasyonel Mükemmellik; RDS yük devretme uyarısı yok: Güvenilirlik; AdministratorAccess: Güvenlik; Yedekleme geri yükleme testi yok: Güvenilirlik

B) Yapılandırma sapması: Güvenlik; RDS yük devretme uyarısı yok: Performans Verimliliği; AdministratorAccess: Operasyonel Mükemmellik; Yedekleme geri yükleme testi yok: Maliyet Optimizasyonu

C) Yapılandırma sapması: Güvenilirlik; RDS yük devretme uyarısı yok: Performans Verimliliği; AdministratorAccess: Güvenlik; Yedekleme geri yükleme testi yok: Operasyonel Mükemmellik

D) Yapılandırma sapması: Güvenlik; RDS yük devretme uyarısı yok: Güvenilirlik; AdministratorAccess: Maliyet Optimizasyonu; Yedekleme geri yükleme testi yok: Güvenlik

**İpucu 1**: Dağıtım sürecinde "yapılandırma sapması" → hangi sütun dağıtım uygulamalarını kapsar?

**İpucu 2**: Tüm kullanıcılar için "AdministratorAccess" → hangi sütun erişim kontrolünü kapsar?

**İpucu 3**: "Yedekleme geri yükleme test edilmedi" → hangi sütun kurtarma mekanizmalarınızı test etmeyi kapsar?

**Cevap**: A

**Açıklama**: Dağıtımlardaki yapılandırma sapması (tutarsız ortamlar) bir Operasyonel Mükemmellik sorunudur — güvenilir, tutarlı dağıtım uygulamalarıyla ilgilidir. RDS yük devretmesinde uyarı olmaması, HA mekanizmalarının ne zaman tetiklendiğini bilmediğiniz anlamına gelir — bir Güvenilirlik sorunu (sisteminizin sağlığını bilmek). Tüm kullanıcılar için AdministratorAccess en az ayrıcalığı ihlal eder — bir Güvenlik sorunu. Test edilmemiş yedekleme geri yükleme, Güvenilirlik mekanizmalarınızın (DR) doğrulanmadığı anlamına gelir.

**Neden B değil?** B, yapılandırma sapmasını Güvenliğe (tutarsız kütüphane sürümleri bir güvenlik tehdidi değil, bir dağıtım operasyonları sorunudur) ve AdministratorAccess'i Operasyonel Mükemmellik'e (erişim kontrolü bir operasyon süreci değil, bir Güvenlik kaygısıdır) yanlış atar.

**Neden C değil?** C, AdministratorAccess'i doğru şekilde Güvenliğe yerleştirir ama yapılandırma sapmasını Güvenilirlik'e (dağıtım tutarlılığı Operasyonel Mükemmellik'tir) ve test edilmemiş yedekleme geri yüklemeyi Operasyonel Mükemmellik'e (kurtarma testi bir Güvenilirlik kaygısıdır — süreçlerinizin tutarlı olduğunu değil, sisteminizin kurtulabileceğini doğruluyorsunuz) yanlış atar.

**Neden D değil?** D, AdministratorAccess'i Maliyet Optimizasyonu'na (aşırı geniş izinlerin maliyetle ilgisi yoktur) ve test edilmemiş yedekleme geri yüklemeyi Güvenliğe (bir yedeği geri yükleyememek bir güvenlik açığı değil, bir Güvenilirlik başarısızlığıdır) atar.

*SAA-C03 Alanı: Alanlar arası*

**Alıştırma 3 — Mimari Meydan Okuma** *(İsteğe Bağlı)*

Bildiğiniz ya da inşa ettiğiniz bir uygulamanın mini bir Well-Architected incelemesini yürütün. Altı sütunun her biri için şunları yazın:

- Uygulamanın iyi yaptığı bir şey
- Uygulamanın iyileştirebileceği bir şey

Sonra iyileştirme maddelerinizi risk (bir olaya ya da israfa neden olma olasılığı en yüksek olan ne?) ve önceliğe (düzeltilirse en büyük etkiyi yaratacak olan ne?) göre sıralayın.

*(Bu alıştırma göründüğünden daha değerlidir. Mimariyi birden çok açıdan sistematik olarak değerlendirme pratiği, temel bir kıdemli mühendis becerisidir.)*

## Jenerik Sonrası Sahne

Well-Architected incelemesinden üç hafta sonra, ekip üç P1 düzeltmesini uygulamıştı — yedi Lambda rolü en az ayrıcalıklıydı, root kullanımı bir uyarı tetikliyordu ve Aurora yük devretmesi salı günü gece 2'de yük altında test edilmişti — ve P2 çalışması devam ediyordu.

EC2 yamalaması artık AWS Systems Manager Patch Manager aracılığıyla otomatikleştirilmişti. Bir olay müdahale süreci belgesi vardı (mükemmel değil, ama yazılmış ve paylaşılmıştı). Çok bölgeli sıcak yedek planı taslak haline getirilmiş ve gelecek çeyrek için uygulanması planlanmıştı.

Priya Well-Architected Tool raporunu inceledi. P1 bulguları kapatılmış ya da kanıtla atanmıştı. Orta ve düşük riskli maddeler, sahipleri ve tarihleriyle azalıyordu.

"Olduğumuzdan daha iyi durumdayız," dedi.

"Bu iyi mi?" diye sordu Leo.

"İlerleme," dedi. "Bir Well-Architected incelemesini bitirmezsiniz. İlerleme kaydedersiniz, sonra altı ayda bir tekrar incelersiniz."

Maya bir şey düşünüyordu.

"31 bölüm boyunca bireysel AWS hizmetlerini öğrendik," dedi. "Ve şimdi tüm sisteme bakmaya başlıyoruz. Mimarların düşünme şekli bu."

"Bir süredir mimarlar gibi düşünüyoruz," dedi Leo.

"Mimari kararlar veriyorduk," dedi Maya. "Bu farklı. Bir mimar gibi düşünmek, kararları verdikten *sonra* değil, vermeden *önce* değerlendirmek demektir."

"Fark nedir?" diye sordu Tom.

"Sonraki bölümde," dedi, "bunu cevaplamaya çalışıyoruz."

Sonraki bölümde: gerçek bir mimari incelemesinin ilk ilkelerden neye benzediği.
