# Bölüm 17: Gözcüler

Romanya IP'siyle ilgili olay sınırlanmıştı. Sırlar Secrets Manager'daydı. Kimlik bilgileri döndürülmüştü. Ağ kontrolleri sıkılaştırılmıştı.

Ama Priya, Bölüm 16'yı bitiren soruyu sormuştu: "CloudTrail'de olağandışı bir şey ortaya çıksaydı, bunu nasıl bilirdik?"

Dürüst cevap şuydu: muhtemelen bilemezlerdi.

---

*Kilitlenebilecek her şey kilitlenmişti. Sırlar Secrets Manager'daydı. Şifreleme anahtarları KMS'teydi. Ağ trafiği güvenlik grupları ve NACL'ler tarafından kontrol ediliyordu. Çevre savunmaları sağlamdı. Ama çevre savunmaları, bir saldırının nasıl göründüğünü gelmeden önce bildiğinizi varsayar. Priya'nın sorduğu soru farklıydı: gelmesini görmediğiniz saldırılar ne olacak?*

---

CloudTrail günde binlerce olay günlükler. Hiçbir insan hepsini okumaz. Priya her hafta elle kontrol ediyordu ama bu, bir şeyin salı günü olabileceği ve ertesi pazartesiye kadar fark edilemeyeceği anlamına geliyordu.

"Günlükleri bizim için izleyen bir şeye ihtiyacımız var," dedi.

Maya başını kaldırdı. "Otomatik olarak mı?"

"Otomatik olarak."

"Peki ya biri içeri girmeye çalışırsa?" diye devam etti Priya. "Sadece tehlikeye atılmış bir kimlik bilgisi değil — ya biri bir DDoS başlatırsa? Ya API uç noktalarımızı enjeksiyon açıkları için yoklamaya başlarlarsa? Ya zaten içerideyseler ve biz bilmiyorsak?"

"Bunlar üç farklı sorun," dedi Leo.

"Evet," dedi Priya. "Ve AWS'nin onları ele almak için üç farklı hizmeti var."

**Üç Tehdit Kategorisi**

Bir bulut uygulamasına karşı güvenlik tehditleri genellikle üç kategoriye ayrılır:

**Hacim saldırıları (DDoS)**: Bir saldırgan o kadar çok trafik gönderir ki uygulamanız meşru kullanıcılara yanıt veremez. Saldırı milyonlarca HTTP isteği veya sunucunuzun bağlantı tablosunu tüketmek için tasarlanmış bir TCP SYN paketi seli olabilir.

**Uygulama saldırıları (İstismarlar)**: Bir saldırgan, uygulamanızdaki zayıflıkları istismar etmek için özel olarak hazırlanmış istekler gönderir — SQL enjeksiyonu, siteler arası betik çalıştırma, bir ayrıştırıcıyı çökerten hatalı biçimlendirilmiş girdi.

**Davranışsal anomaliler (Keşif ve tehlikeye atılma)**: Olmaması gereken API çağrıları (biri sabah 3'te tüm kullanıcı veritabanınızı sorguluyor), olağandışı IAM etkinliği (kimlik bilgileri yeni bir ülkeden kullanılıyor) veya beklenmedik hedeflere ağ trafiği.

AWS'nin her biri için özel bir hizmeti vardır:

- **AWS Shield**: DDoS koruması
- **AWS WAF**: Uygulama katmanı koruması
- **Amazon GuardDuty**: Davranışsal tehdit tespiti

**AWS Shield: DDoS Emici**

**AWS Shield Standard**, tüm AWS müşterileri için ek ücret olmadan otomatik olarak etkinleştirilir. En yaygın katman 3 (ağ) ve katman 4 (taşıma) DDoS saldırılarına karşı korur — SYN selleri, UDP selleri, DNS yükseltme saldırıları.

CloudFront, Route 53 ve Elastic Load Balancing, AWS ağının kenarında durur. Bir DDoS saldırısı uygulamanızı hedeflediğinde, önce bu yönetilen hizmetlere çarpar. AWS'nin ağ altyapısı, saldırıyı EC2 örneklerinize ulaşmadan önce emer.

**AWS Shield Advanced**, premium katmandır (kuruluş başına ayda 3.000 dolar, bir yıllık taahhütle). Ayrı bir aboneliktir — herhangi bir AWS Destek planına *dahil değildir*. Şunları ekler:

- EC2, ELB, CloudFront, Global Accelerator ve Route 53 için koruma
- Neredeyse gerçek zamanlı saldırı bildirimleri
- AWS Shield Response Team'e (SRT) erişim — saldırılara yanıt vermenize yardımcı olabilecek güvenlik mühendisleri (SRT ile çalışmak ayrıca bir Business veya Enterprise Destek planı gerektirir)
- Maliyet koruması: bir saldırı faturanızı fırlatırsa, AWS artış maliyetlerini kredi olarak verir
- Katman 7'de (uygulama katmanı) gelişmiş DDoS tespiti ve hafifletme

"Bu ayda ne kadar maliyet çıkarıyor?" diye sordu Tom.

"Üç bin dolar," dedi Priya. "Kuruluş başına."

Tom bir an sessiz kaldı.

"Milyonlarca gelir işleyen işletmeler için, onları iki saat çökerten bir DDoS üç bin dolardan fazlaya mal olur," dedi Priya.

Tom sessizce hesabı yaptı.

"Standard ile başlayacağız," dedi sonunda.

---

**DDoS Olayı: Shield Eylem Halindeyken Nasıl Görünür**

Lansmanından sekiz ay sonra, Nimbus ilk gerçek DDoS saldırısını aldı.

Bir salı sabah 11:43'te başladı. Yük dengeleyici için CloudWatch panosu, gelen bağlantı isteklerinin doksan saniyeden kısa sürede normal dakikada 3.000'den dakikada 180.000'e fırladığını gösterdi. Kaynak IP'leri kırk ülkeye dağılmıştı ve gelen hacim saniyede yaklaşık elli gigabit zirve yaptı. Desen yanılmazdı: bir SYN seli başlatan bir botnet.

Leo CloudFront metriklerini ilk gördü. "İstek oranı altmış kat arttı. Yanıt süresi fırlıyor."

Priya CloudWatch metriklerini yan yana açtı: kenarda bağlantı denemeleri dikey tırmanıyor, gerçekten origin'e ulaşan istekler — düz. "Shield Standard onu yiyor," dedi. Uyarı yok, pano olayı yok, bildirim yok. Shield Standard sessizce çalışır: her zaman açıktır, ücretsizdir ve size **hiç saldırı görünürlüğü vermez** — olay konsolu yok, bildirim yok, DDoS yanıt ekibi yok. (O görünürlük — neredeyse gerçek zamanlı saldırı panoları ve uyarılar — tam olarak Shield *Advanced*'in sattığı şeydir.) Priya'nın saldırıyı görebileceği tek yol kendi CloudWatch metrikleriydi.

Shield Standard SYN selini otomatik olarak tespit etmiş ve ilk iki dakika içinde hafifletmeyi devreye sokmuştu. Saldırı trafiği CloudFront'un edge düğümlerinde küresel olarak emiliyordu — meşru içerik sunan aynı 750'den fazla varlık noktası saldırı hacmini de emiyordu.

11:52'ye kadar — saldırı başladıktan dokuz dakika sonra — Shield'ın hafifletmesi origin'deki istek oranını normale döndürmüştü. Saldırı hâlâ ağ düzeyinde devam ediyordu ama hafifletme onu ele alıyordu. Nimbus uygulaması boyunca kullanıcılara hizmet vermeye devam etti.

"Kullanıcılar fark etmedi mi?" diye sordu Leo, hata oranı metriğine bakarak.

"Hata oranı yaklaşık dört dakika boyunca yaklaşık yüzde iki arttı," dedi Priya. "Bazı kullanıcılar biraz daha yavaş bir yanıt aldı. Kesinti yok. Uygulama ayakta kaldı."

"Çünkü Shield seli kenarda emdi."

"Yük dengeleyicimize ulaşmadan önce. Elli gigabitlik SYN seli CloudFront'a çarptı. Trafik deseni tanınıp hafifletilene kadar, origin'imiz yalnızca normal istek hacmini görmüştü."

Saldırı kırk yedi dakika sürdü. 12:30'a kadar kenar metrikleri temel düzeye dönmüştü — Shield Standard'ın size verdiği tek "çözüldü" sinyali.

"Ve bu Shield Standard," dedi Tom. "Ücretsiz sürüm."

"Katman 3 ve 4 saldırıları. Standard bunlara karşı otomatik korur. Saldırı daha sofistike olsaydı — örneğin her isteğin meşru göründüğü bir katman 7 HTTP seli — Standard yeterli olmazdı. Bu, Shield Advanced artı WAF gerektirir."

Tom güvenlik yol haritasına "Katman 7 DDoS desenlerini izle" yazdı.

---

**AWS WAF: Uygulama Filtresi**

**AWS WAF (Web Application Firewall)**, HTTP düzeyinde çalışır — web isteklerinin içeriğini uygulamanıza ulaşmadan önce inceler.

WAF, **Web ACL'leri (Erişim Kontrol Listeleri)** ile yapılandırılır — neye izin verileceğini, neyin engelleneceğini veya sayılacağını tanımlayan kural setleri.

WAF şunlara eklenebilir:

- CloudFront dağıtımları (istekleri kenarda, küresel olarak incele)
- Application Load Balancer'lar (istekleri bölgesel düzeyde incele)
- API Gateway
- AWS AppSync

**WAF Yönetilen Kuralları**: AWS ve üçüncü taraf satıcılar önceden oluşturulmuş kural setleri yayınlar:

- **AWS Managed Rules - Core Rule Set**: Yardımcı kural gruplarıyla birlikte (SQL veritabanı, Bilinen Kötü Girdiler), OWASP Top 10 açıklarını kapsar (SQL enjeksiyonu, XSS, komut enjeksiyonu, yol geçişi vb.)
- **AWS Managed Rules - Known Bad Inputs**: Bilinen saldırı desenleriyle eşleşen istekleri engeller
- **AWS Managed Rules - Amazon IP Reputation List**: Botnet'ler ve tarayıcılarla ilişkili olduğu bilinen IP'leri engeller
- **AWS Managed Rules - Bot Control**: Bot trafiğini tanımlar ve yönetir

Özel kurallar da oluşturabilirsiniz:

- "'sqlmap' içeren bir User-Agent başlığı olan herhangi bir isteği engelle" (yaygın bir SQL enjeksiyon tarayıcısı)
- "Hız sınırı: IP başına 5 dakikada en fazla 1000 isteğe izin ver"
- "Herhangi bir parametre değerinde `<script>` içeren istekleri engelle"

Nimbus için pratik kurulum: Core Rule Set etkin CloudFront dağıtımında WAF. Bu, en yaygın saldırı desenlerini istekler EC2 örneklerine hiç ulaşmadan önce engeller.

Şunu merak ediyor olabilirsiniz: WAF bilinen saldırı desenlerini engelliyorsa, WAF'in bilmediği yeni bir saldırı deseni ortaya çıktığında ne olur? WAF yönetilen kural setleri yeni tehditler ortaya çıktıkça AWS ve üçüncü taraf satıcılar tarafından güncellenir — kuralları elle güncellemek zorunda değilsiniz. Ama WAF'in temelde bilinen desenlere tepkisel olduğu konusunda haklısınız. Yeni, özgün saldırı teknikleri henüz var olmayan bir kural tarafından engellenmez. İşte bu yüzden GuardDuty WAF'in yanında vardır: WAF ön kapıyı filtreler, GuardDuty evin içindeki olağandışı davranışı izler. Yeni bir saldırı türü WAF'ten geçebilir ama GuardDuty yine de neden olduğu anormal etkinliği işaretleyebilir — olağandışı API çağrıları, beklenmedik ağ hedefleri, temel çizgiyle eşleşmeyen erişim desenleri.

**WAF yanlış pozitiflere neden olursa ne olacağını düşündük mü?** diye sordu Priya. "Core Rule Set tarafından engellenen meşru bir kullanıcının isteği?"

"WAF'in bir 'Count' modu var," dedi Leo. "Engellemek yerine, sadece eşleşen istekleri sayar. Önce Count modunda çalıştırırsın, neyi engelleyeceğini gözden geçirirsin, yanlış pozitif olmadığını doğrularsın, sonra Block'a geçersin."

"Güzel," dedi Priya. "Count modunda başlıyoruz."

---

**Bir WAF Kuralı Oluşturma: Hız Sınırı Hikayesi**

WAF'i Count modunda etkinleştirdikten iki hafta sonra, Priya günlükleri gözden geçirdi. Core Rule Set bulguları temizdi — meşru trafikte yanlış pozitif yok, otomatik tarayıcılardan bir avuç engellenmiş SQL enjeksiyon denemesi.

Ama Core Rule Set'in işaretlemediği bir desen fark etti: bir IP adresi beş dakikada `/api/search`'e 847 istek yapmıştı. Her istek yapısal olarak geçerliydi. Ama beş dakikada 847 arama bir insan değildi.

"Fiyat kazıyıcı," dedi. "Birisi rekabetçi bir fiyat veritabanı oluşturmak için restoran aramamızı otomatik olarak sorguluyor."

"Umursuyor muyuz?" diye sordu Leo.

"Bilgi işlem kaynaklarımızı kullanıyor ve hizmet şartlarımıza aykırı," dedi Tom.

"Umursuyoruz," diye onayladı Priya.

Özel bir WAF hız tabanlı kuralı oluşturdu:

```
Kural adı: RateLimitSearchAPI
Kural türü: Hız tabanlı kural
Hız sınırı: IP adresi başına 100 istek
Değerlendirme penceresi: 5 dakika (yapılandırılabilir: 1, 2, 5 veya 10 dakika)
Kapsam daraltma ifadesi: URI yolu /api/search ile başlar
Eylem: Engelle
```

Kapsam daraltma ifadesi önemlidir — hız sınırı yalnızca `/api/search`'e uygulanır. Diğer uç noktalara meşru API trafiği etkilenmez. Ve engellemenin nasıl çalıştığına dikkat edin: sabit bir "ceza" süresi yok — WAF her IP'nin istek oranını sürekli yeniden değerlendirir, oran sınırın üstünde kaldıkça onu engeller ve oran tekrar altına düştüğünde onu engellemekten çıkarır (genellikle saniyeler içinde).

Önce Count moduna ayarladı. 24 saat çalıştırdı. Kuralı tetikleyen tek IP kazıyıcıydı. Hiçbir meşru kullanıcı arama uç noktasına beş dakikada 12'den fazla istek göndermemişti.

Block moduna geçti. Kazıyıcının sonraki isteği bir 403 aldı. Farklı bir IP'ye geçti. Hız sınırı onu da yakaladı.

"Sonunda etrafından dolaşacaklar," dedi Leo. "Daha fazla IP'ye dağılacaklar."

"O noktada daha fazla altyapı kullanıyor, daha fazla ödüyor ve daha az veri alıyorlar," dedi Priya. "Onları tamamen durdurmamıza gerek yok. Onu değmeyecek kadar pahalı kılmamız gerekiyor."

"Bu ayda ne kadar maliyet çıkarıyor?" diye sordu Tom.

WAF fiyatlandırması Web ACL başına ay başına, kural başına ay başına ve milyon istek başınadır. Nimbus kurulumu için — CloudFront'ta bir Web ACL, beş kural — ay başına yaklaşık 15 dolar artı istek ücretleri.

Tom onu hemen onayladı.

---

**Amazon GuardDuty: Davranışsal Analist**

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya. "WAF saldırıları engelliyor ve Shield selleri emiyorsa, neden üçüncü bir hizmete ihtiyacımız var? GuardDuty aslında neyi izliyor?"

WAF ve Shield filtrelerdir — kötü trafiği uygulamanıza ulaşmadan önce yakalarlar. GuardDuty trafik geldikten sonra ne olduğunu izler. Altyapınızın ne yaptığına bakar: hangi IAM kimlik bilgileri kullanılıyor, örnekleriniz hangi alan adlarıyla iletişim kuruyor, sabah 3'te hangi API çağrıları gerçekleşiyor. Meşru görünen bir istekle ön kapıdan geçen bir saldırgan WAF tarafından durdurulmaz — ama GuardDuty aynı kimlik bilgisinin aniden Romanya'dan API çağrıları yaptığını fark eder.

GuardDuty, Shield ve WAF'ten temelde farklıdır. Saldırıları engellemez — **olağandışı davranışı tespit eder**.

GuardDuty, tehditleri tespit etmek için sürekli olarak birkaç etkinlik akışını analiz eder: **CloudTrail yönetim ve veri olayları** (API çağrıları ve eylemler), **VPC Akış Günlükleri** (ağ trafiği desenleri) ve **DNS sorgu günlükleri** (alan adı aramaları). Bunlar GuardDuty'nin her zaman güvendiği üç temel kaynaktır:

- **AWS CloudTrail günlükleri**: IAM değişiklikleri, API çağrıları, konsol girişleri
- **VPC Akış Günlükleri**: VPC'nizdeki ağ trafiği desenleri
- **DNS sorgu günlükleri**: örneklerinizin ne çözdüğü (bilinen kötü amaçlı yazılımlar genellikle belirli C2 alan adlarını çözer)

Ama GuardDuty bu üçünün ötesine önemli ölçüde genişledi. AWS isteğe bağlı eklentilere **koruma planları** der — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring ve Malware Protection — her biri ayrı ayrı etkinleştirilir. Hangisini etkinleştirdiğinize bağlı olarak, GuardDuty ayrıca şunları da analiz edebilir: **S3 veri olayları** (paketlerinize olağandışı erişim desenleri), **EKS denetim günlükleri ve çalışma zamanı etkinliği** (çalışan konteynerlerin içindeki kötü amaçlı davranış), **RDS giriş olayları** (anormal veritabanı giriş denemeleri), **Lambda ağ trafiği** (beklenmedik harici hedefleri çağıran işlevler), **ECS/EC2 çalışma zamanı davranışı** ve **kötü amaçlı yazılım için taranan EBS birimleri**. Sınav için, üç çekirdek kaynağı ezbere bilin; koruma planları belirli tehdit tespit bağlamlarıyla ilgili senaryolarda görünür — "RDS'e anormal giriş denemelerini tespit et" veya "çalışan bir konteynerin içindeki kötü amaçlı davranışı belirle" GuardDuty'nin isteğe bağlı koruma planlarını düşünme sinyalleridir.

Makine öğrenimi modelleri temel çizginizden sapan desenleri tanımlar. GuardDuty anomaliler tespit ettiğinde **bulgular** üretir — kategorize edilmiş uyarılar.

GuardDuty'nin tespit edebileceği örnekler:

- Tanınmayan bir IP adresinden (daha önce hiç kullanmadıkları bir ülkede) giriş yapan bir IAM kullanıcısı
- Bir Tor çıkış düğümünden yapılan API çağrıları
- Bilinen bir kripto para madenciliği havuzuyla iletişim kuran bir EC2 örneği
- Olağandışı yüksek API çağrı hacmi (kimlik bilgisi kötüye kullanımı veya tarama)
- Kötü amaçlı etkinlik için işaretlenmiş bir IP adresi tarafından erişilen bir S3 paketi
- Kötü amaçlı yazılım komut-ve-kontrol ile ilişkili olduğu bilinen bir alan adına giden trafik

"Romanya IP'sini yakalayacak olan buydu," dedi Leo sessizce.

"GuardDuty'yi etkin tutsaydık, EC2 örneğinin sabah 2'de tanınmayan harici bir IP'ye giden bağlantılar yaptığını işaretlerdi," diye onayladı Priya.

---

**Beş GuardDuty Bulgu Türü ve Ne Yapılacağı**

Priya en yaygın beş GuardDuty bulgusu için bir çalışma kitabı oluşturdu. Bir bulgu tetiklendiğinde, ekip ne anlama geldiğini ve ne yapılacağını hemen bilir.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Bir IAM kullanıcısı, bu hesap için daha önce görülmemiş bir IP adresinden veya önceki girişlerle tutarsız bir coğrafi konumdan AWS Konsoluna başarıyla giriş yaptı.

Yanıt: Kullanıcıyla girişi başlattığını doğrulayın. Başlatmadıysa — veya ulaşılamıyorsa — hemen: kullanıcının erişim anahtarını ve konsol parolasını devre dışı bırakın, aktif oturumları iptal edin ve o kullanıcının son 24 saatte yaptığı her şeyin CloudTrail denetimini başlatın. Bu bulgu genellikle kimlik bilgisi kötüye kullanımından önce gelir.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Bir EC2 örneği kripto para madenciliği havuzlarıyla ilişkili IP adreslerini veya alan adlarını sorguluyor. Bu neredeyse her zaman bir EC2 örneğinin tehlikeye atılması ve bir madencilik botu olarak kullanılmasının sonucudur.

Yanıt: Örneği hemen izole edin — güvenlik grubunu bastion ana bilgisayarınız hariç tüm gelen ve giden trafiği engelleyecek şekilde değiştirin. EBS biriminin adli bir anlık görüntüsünü alın. Sonra örneği sonlandırın ve temiz bir AMI'den bir yedek başlatın.

**3. Recon:EC2/PortProbeUnprotectedPort**

Bir EC2 örneğinin, bilinen tarayıcılar tarafından veya bir Tor çıkış düğümünden yoklanan internete açık bir portu var. GuardDuty akış günlüklerinde harici kaynaklardan erişilebilir görünen portları işaretler.

Yanıt: Güvenlik grubu kurallarını gözden geçirin. Port kasıtlı olarak açıksa, bir notla bulguyu çözüldü olarak işaretleyin. Kasıtlı değilse, portu hemen kapatın. O port üzerinden gerçekleşmiş olabilecek erişim için CloudTrail'i kontrol edin.

**4. Trojan:EC2/BlackholeTraffic**

Bir EC2 örneği, "kara delik" olarak tanımlanmış bir IP adresiyle — kötü amaçlı yazılım komut-ve-kontrol altyapısıyla ilişkili bir hedef — iletişim kurmaya çalışıyor. Bu IP'lere trafik, örneğin enfekte olduğunu ve eve telefon etmeye çalıştığını gösterir.

Yanıt: CryptoCurrency bulgularıyla aynı — izole et, anlık görüntü al, değiştir. Bu bulgu örnekte aktif kötü amaçlı yazılımı gösterir. Örneği yerinde temizlemeye çalışmayın; temiz bir AMI'den yeni bir tane oluşturun.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Birisi bir S3 paketinde Block Public Access ayarını devre dışı bıraktı. Bu, paketin herkese açık olduğu anlamına gelmez — kazara herkese açık maruziyeti önleyen güvenlik mekanizmasının o paket için kapatıldığı anlamına gelir. Bu genellikle kazara veya yanlış yapılandırılmış bir dağıtımın parçası olarak yapılır.

Yanıt: Değişikliği kimin yaptığını araştırın (CloudTrail'de API çağrısı olacaktır). Devre dışı bırakılması gerektiğine dair belgelenmiş bir neden olmadıkça Block Public Access'i yeniden etkinleştirin. Bu bulgunun gelecekte oluşmasını önlemek için hesap düzeyinde Block Public Access ayarını etkinleştirmeyi düşünün.

"GuardDuty bulguları hakkında en önemli şey," dedi Priya, "uyarı olmamalarıdır — hipotezlerdir. Her bulgu 'bu desen anormal görünüyor' der. Doğrularsınız, araştırırsınız, yanıt verirsiniz. Bazıları yanlış pozitif olacak. Çoğu olmayacak."

"Nasıl önceliklendiriyoruz?" diye sordu Rafael.

"GuardDuty önem seviyeleri atar: Düşük, Orta, Yüksek. Yüksek önemli bulgular aynı gün yanıt gerektirir. Trojan ve kimlik bilgisi tehlikeye atılma bulguları her zaman Yüksektir. Port yoklama bulguları Orta veya Düşük olabilir. Yüksekle başla, aşağı doğru çalış."

---

"Maliyeti ne kadar?" diye sordu Tom.

GuardDuty fiyatlandırması analiz edilen günlük hacmine dayanır — CloudTrail olayları, VPC akış verisi, DNS sorguları. Küçük ila orta ölçekli bir uygulama için tipik olarak ayda 50-150 dolar. Ölçekte bile altyapı maliyetlerinin küçük bir kesridir.

Tom konsolu açtı ve onu etkinleştirdi.

"Sorun olmaz," dedi Leo. "Sadece izleme. Bir şeyi bozacak değil ya."

"Zaten dağıttım," diye ekledi Leo — ve sonra GuardDuty panosunu kontrol etti. "Ah. Sadece örnek bulgular. Gerçekleri biraz zaman alıyor."

"GuardDuty'nin normalin nasıl göründüğüne dair bir temel çizgi oluşturması için zamana ihtiyacı var," dedi Priya. "Birkaç gün ver. İlk gerçek bulgu gelecek — hep gelirler."

Bu konuda haklı çıktı. Ama ilk bulgu bu bölümün sonu için bir hikaye.

**Üç Hizmeti Birbirine Bağlamak**

Shield, WAF ve GuardDuty farklı katmanlarda çalışır ve birbirini tamamlar:

| Hizmet     | Katman                    | Şuna Karşı Korur                            | Eylem                              |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Ağ/Taşıma (L3/L4)         | DDoS selleri                                | Saldırıları emer/hafifletir        |
| AWS WAF    | Uygulama (L7)             | OWASP Top 10, botlar, kazıyıcılar           | İsteklere izin verir, engeller veya sayar |
| GuardDuty  | Davranışsal (tüm günlükler) | Anomaliler, tehlikeye atılmış kimlik bilgileri, kötü amaçlı yazılım | Tespit eder ve uyarır |

Shield seli durdurur. WAF suyu filtreler. GuardDuty olağandışı akış desenleri için tesisatı izler. Macie rezervuarlarda ne saklandığını denetler. Security Hub tüm panoların aynı anda görünür olduğu kontrol odasıdır.

Her birinin arıza modu neden hepsine ihtiyacınız olduğunu açıklar:

- 50 Gbps SYN seli bir web isteği değildir. WAF onu inceleyemez. GuardDuty ilişkili CloudTrail olaylarını fark edebilir. Shield onu durdurur.
- Tek bir SQL enjeksiyon isteği bir sel değildir. Shield onu görmezden gelir. GuardDuty HTTP isteklerinin içeriğini bilmez. WAF onu yakalar.
- Kendi kimlik bilgilerini kullanarak veriyi yavaşça sızdıran meşru bir AWS kullanıcısı — DDoS yok, enjeksiyon yok, geçerli HTTP — Shield ve WAF olağandışı bir şey görmez. GuardDuty kimlik bilgilerinin sabah 3'te yeni bir ülkeden kullanıldığını fark eder.
- Müşteri verisini yanlışlıkla herkese açık erişilebilir bir pakete yükleyen bir geliştirici hiç anormal davranış üretmez. GuardDuty'nin işaretleyecek hiçbir şeyi yoktur. Macie paketi tarar ve PII'yi bulur.

Her hizmetin bir kör noktası vardır. Kombinasyon o kör noktaları kapatır.

**CloudTrail: Temel**

Üç hizmet de günlüklere dayanır. **AWS CloudTrail**, AWS hesabınızdaki her API çağrısını yakalayan günlük hizmetidir — kim neyi, ne zaman, nereden, hangi sonuçla çağırdı.

CloudTrail konsolda 90 günlük geçmiş için varsayılan olarak etkindir. Günlükleri uzun süre saklamak için:

1. Bir S3 paketine yazan bir iz oluşturun
2. İsteğe bağlı olarak, gerçek zamanlı uyarı için CloudWatch Logs'a gönderin
3. Günlük dosyası doğrulamasını etkinleştirin (günlüklerin kurcalanıp kurcalanmadığını tespit etmek için)

GuardDuty, AWS Config, Security Hub ve IAM Access Analyzer hepsi CloudTrail'den okur. CloudTrail günlükleri olmadan, bu hizmetlerin analiz edecek hiçbir şeyi olmaz.

"Ya birisi CloudTrail'i devre dışı bırakmaya çalışırsa?" diye sordu Priya. "Bir saldırgan yönetici erişimi kazanırsa, ilk eylemi günlük kaydını devre dışı bırakmak olabilir — izlerini örtmek."

"Bölüm 14'teki SCP bunu önler," dedi Leo. "Bu hesaptaki hiç kimse CloudTrail'i devre dışı bırakamaz, yöneticiler bile."

"Ya bir şekilde yaptılarsa?"

"Security Hub bir bulgu üretirdi. CloudTrail yapılandırma değişikliklerinde SNS'e bir bildirim gönderir. Herhangi bir CloudTrail değişikliğinden iki dakika içinde bir uyarı alırız."

"Ve GuardDuty API çağrısını işaretlerdi," diye ekledi Rafael, "olağandışı bir IAM eylemi olarak — günlük kaydını devre dışı bırakmak normal bir operasyonel etkinlik değildir."

En kritik güvenlik eylemlerinden biri için birden çok tespit katmanı: günlükleri kurcalama. Bu bir kaza değildi. Priya onu kasıtlı olarak tasarlamıştı.

"Derinlemesine savunma izleme katmanına da uygulanır," dedi. "Sadece uygulama katmanına değil."

**Amazon Macie: S3'teki Hassas Veri**

"Birisi yanlışlıkla müşteri kredi kartı numaraları içeren bir dosyayı S3'e yüklerse ne olacağını düşündük mü?" diye sordu Priya. "Kötü niyetle değil — sadece hata ayıklama için veri dışa aktaran ve yanlış dosyayı yükleyen bir geliştirici?"

"Asla bilemezdik," dedi Leo.

"Aynen. Macie'miz olmadıkça."

**Amazon Macie**, S3'teki hassas veriyi otomatik olarak keşfetmek ve korumak için makine öğrenimi kullanan bir veri güvenliği hizmetidir. S3 paketlerini sürekli tarar ve şunları tanımlar:

- PII (Kişisel Olarak Tanımlanabilir Bilgi): adlar, e-posta adresleri, telefon numaraları, doğum tarihleri
- Finansal veri: kredi kartı numaraları, banka hesap numaraları
- Kimlik bilgileri: dosyalara gömülü parolalar, erişim anahtarları, özel anahtarlar
- Sağlık bilgisi: hasta kayıtları, teşhisler

Macie, hassas veriyi olmaması gereken yerlerde tespit ettiğinde — veya S3 paketleri aşırı izin verici erişim yapılandırmalarına sahip olduğunda — bulgular üretir.

"Bu GuardDuty ile aynı mı?" diye sordu Maya.

"Farklı amaç," dedi Priya. "GuardDuty davranışı izler — hangi eylemler yapılıyor, o eylemler anormal görünüyor mu. Macie veriyi izler — hangi içerik saklanıyor, o içerik hassas mı. GuardDuty olağandışı API çağrıları yapan bir EC2 örneğini işaretlerdi. Macie kredi kartı numaraları içeren bir S3 paketini işaretlerdi."

"Yani GuardDuty davranışsal analist," dedi Leo, "ve Macie veri denetçisi."

"Aynen. İkisine de ihtiyacın var. Meşru görünen bir API çağrısı aracılığıyla veriyi sızdıran bir saldırgan, olağandışı API deseni için GuardDuty tarafından işaretlenebilir. Ama bir çalışan 10.000 müşteri kaydı içeren bir dosyayı bir geliştirme paketine yüklerse, tespit edilecek anormal davranış yoktur — sadece yanlış yerde hassas veri. Macie onu yakalar."

Nimbus için, Macie'nin en hemen değeri `nimbus-debug-exports` paketindeydi — geliştiricilerin hata ayıklama için veri döktüğü bir paket. Macie müşteri adları ve teslimat adresleriyle sipariş geçmişleri içeren üç dosya buldu. Ödeme verisi değil ama şifrelenmemiş bir geliştirme paketinde olmaması gereken kişisel veri.

Dosyalar kaldırıldı. Bir politika eklendi: hata ayıklama paketi yalnızca sentetik test verisiyle sınırlandı. Gerçek müşteri verisi üretim dışındaki herhangi bir ortama dışa aktarmak için Priya'nın onayını gerektiriyordu.

"Bu ayda ne kadar maliyet çıkarıyor?" diye sordu Tom.

Macie, ay başına değerlendirilen S3 paketlerinin sayısına ve taranan veri hacmine göre ücret alır. Orta sayıda paketi olan bir startup için, ayda yaklaşık 10-50 dolar. İlk 30 gün ücretsiz.

Tom onu öğle yemeğinden önce etkinleştirdi.

---

**AWS Security Hub: Pano**

Birden çok AWS hesabı çalıştırıyorsanız veya güvenlik bulgularının birleştirilmiş bir görünümüne ihtiyacınız varsa, **AWS Security Hub** GuardDuty, Inspector (açık değerlendirmesi), Macie (veri gizliliği), Config ve Firewall Manager'dan bulguları tek bir panoda toplar.

Ayrıca yapılandırmanızı güvenlik en iyi uygulamalarına (AWS Foundational Security Best Practices standardı) ve CIS AWS Foundations Benchmark'a karşı kontrol eder.

Security Hub, "beş farklı konsol arasında geçiş yapmadan tüm güvenlik bulgularımı tek yerde nasıl görürüm?" sorusunun cevabıdır. GuardDuty bir bulgu ürettiğinde, GuardDuty'de ve Security Hub'da görünür. Macie bir S3 paketinde hassas veri bulduğunda, Macie'de ve Security Hub'da görünür. Bir Config kuralı bir yanlış yapılandırma tespit ettiğinde, Config'te ve Security Hub'da görünür.

Tek hesaplı bir ekip için, Security Hub marjinal değer ekler — kontrol edilecek başka bir konsol. Gücü ölçekte ortaya çıkar: üç hesap, on hesap, elli hesap. Tüm hesaplardan tüm bulgular bir yönetim hesabının Security Hub'ında toplanır. Bir ekip bir panoyu izler. Bir uyarı seti. Hesap-hesap günlük kontrolü yok.

Nimbus için: Security Hub henüz gerekli değildi. Üç hesaba (geliştirme, hazırlık, üretim) büyüdüklerinde, gerekli hale gelecekti.

"Şimdi kur," dedi Soo-Jin, üçüncü haftasında. "Etkinleştirmek on beş dakika sürer. Daha erken yapmış olmayı dilemek üç ay sürer."

Onu etkinleştirdiler.

**Amazon Inspector: Açık Değerlendirmesi**

Macie'yi etkinleştirdikten bir hafta sonra, Nimbus üretim filosunda çalışan OpenSSL sürümü için bir CVE yayınlandı. Priya öneriyi kahve eşliğinde okudu.

"Hangi örneklerimizin etkilendiğini bilmemiz gerekiyor," dedi.

"Manuel bir tarama çalıştırabilirim," dedi Leo.

"Dokuz örnek için, tabii. Doksan için mi? Konteynerler için mi?" Priya Inspector konsolunu açtı. "Inspector bunun içindir."

**Amazon Inspector**, otomatik bir açık değerlendirme hizmetidir. GuardDuty davranışı izlerken — altyapınızın şu anda ne yaptığını — Inspector istismar edilebilecek neyin mevcut olduğuna bakar.

- **EC2 örnekleri:** Inspector işletim sistemini ve kurulu paketleri NVD'ye (National Vulnerability Database) karşı tarar — bilinen CVE'lerin yetkili kataloğu. OpenSSL 1.1.1 çalıştırıyorsanız ve bir CVE o sürümü hedefliyorsa, Inspector onu işaretler.
- **ECR konteyner görüntüleri:** Inspector konteyner görüntülerini Elastic Container Registry'de dağıtılmadan önce tarar. Bir temel görüntüdeki açık bir paket, konteyner üretimde hiç çalışmadan önce bir bulgu olarak görünür.
- **Lambda işlev paketleri:** Inspector Lambda işlevlerinize paketlenmiş bağımlılıkları — Python paketleri, Node modülleri, Java bağımlılıkları — bilinen açıklar için analiz eder.

Tek seferlik bir taramadan kritik fark: Inspector **sürekli** çalışır. Sadece etkinleştirdiğinizde örneklerinizi bir kez kontrol edip temiz ilan etmez. Yeni bir CVE yayınlandığında, Inspector mevcut kaynaklarınızı yeni açığa karşı otomatik olarak yeniden değerlendirir. Bir EC2 örneği değiştiğinde — yeni paket kurulduğunda, AMI güncellendiğinde — Inspector onu yeniden tarar. Priya'nın EC2 filosu, taramasını istediği için değil, yaptığı şey bu olduğu için OpenSSL CVE'si için Inspector'ı etkinleştirdikten dakikalar içinde işaretlendi.

Bulgular önem dereceli: Kritik, Yüksek, Orta, Düşük, Bilgilendirici. GuardDuty ve Macie bulgularının yanında Security Hub'a akarlar. Bir pano. Üç mercek.

"Üç örnek etkilenmiş," dedi Leo, Inspector bulgularını okuyarak. "Diğer altısı yamalanmış bir sürümde."

"Bu üçünü bu hafta yamalayın," dedi Priya.

"Peki konteyner görüntüleri?"

Priya Inspector ECR bulgularına baktı. Konteyner kayıtlarındaki iki temel görüntünün bilinen açıkları vardı — o zamandan beri yamalanmış paketlerin eski sürümleri. Onları yeniden oluşturulmak üzere etiketledi.

"Önemli olan," dedi Priya, "bunu istismar edilmeden önce bulmamız. Sonra değil."

**Üç Mercek Modeli**

GuardDuty, Inspector ve Macie her biri farklı bir şeyi izler:

- **GuardDuty** davranışsaldır. Sorar: *şu anda yanlış görünen ne oluyor?* Beklenmedik konumlardan API çağrıları, komut-ve-kontrol sunucularıyla iletişim kuran EC2 örnekleri, olağandışı saatlerde kullanılan kimlik bilgileri. Aktif tehditleri ve anomalileri yakalar.
- **Inspector** yapısaldır. Sorar: *ortamımızda istismar edilebilecek ne mevcut?* Yamalanmamış paketler, açık bağımlılıklar, güncel olmayan çalışma zamanları. Saldırıları mümkün kılan koşulları yakalar.
- **Macie** veriyle ilgilidir. Sorar: *S3 paketlerimizde olmaması gereken hangi hassas bilgi duruyor?* PII, finansal kayıtlar, dosyalarda bırakılmış kimlik bilgileri. Hiç anormal davranış üretmeyen maruziyeti yakalar — sadece yanlış yerde veri.

Bilinen bir CVE içeren bir tehlikeye atılma üçünde de görünebilir: Inspector saldırıdan önce açığı işaretlerdi. GuardDuty saldırı sırasında anormal davranışı işaretlerdi. Macie S3'e indikten sonra sızdırılan veriyi işaretlerdi.

Üç farklı mercek, üç farklı zaman ufku, hiçbiri diğerlerinin yerine geçmez.

**AWS Network Firewall: Trafik İnceleyici**

Araç kutusu kapanmadan önce bir uzman daha söz edilmeyi hak ediyor. Güvenlik grupları ve NACL'ler (Bölüm 15) trafiği IP, port ve protokole göre filtreler — *kimin* *neyle* konuşabileceğini söyleyebilirler ama konuşmanın içine bakamazlar. **AWS Network Firewall**, VPC düzeyinde dağıttığınız yönetilen, durum bilgili bir güvenlik duvarıdır. Derin paket incelemesi yapar: alan adına göre filtreleme (giden yalnızca `*.eatnimbus.com` ve paket depolarınıza izin ver), saldırı imzalarıyla eşleşen trafiği engelleme (IDS/IPS, Suricata kurallarıyla uyumlu) ve port numarası uygun göründüğü için güvenlik gruplarının basitçe geçireceği akışları inceleme.

"Yani beyni olan bir güvenlik grubu," dedi Leo.

"Bir güvenlik duvarı satıcısından satın alacağınız cihaz," dedi Priya, "ama yönetilen, otomatik ölçeklenen ve VPC'ye giren ve çıkan tüm trafiğin onun üzerinden yönlendirilmesi için kendi alt ağında dağıtılmış."

Sınav sinyalleri: "trafiği alan adına veya yüke göre incele veya filtrele," "bir VPC için saldırı tespiti/önleme (IDS/IPS)" veya "giden trafik için merkezi çıkış filtreleme" → Network Firewall. Güvenlik grupları ve NACL'ler port ve IP'ye göre örnek düzeyinde ve alt ağ düzeyinde izin ver/reddet için cevaptır; Network Firewall, soru trafiğin *içinde* inceleme talep ettiğinde cevaptır. Ve soru WAF kurallarını, Shield Advanced'i, güvenlik gruplarını *ve* Network Firewall politikalarını birçok hesapta tutarlı biçimde nasıl yöneteceğinizi sorduğunda — bu **AWS Firewall Manager**'dır, üstündeki politika yönetim katmanı.

## Güçlü Yönler ve Sınırlamalar

**AWS Shield**:

- Standard: ücretsiz ve otomatik — kullanmamak için bir neden yok
- Advanced: yüksek profilli hedefler için mükemmel; küçük ekipler için pahalı
- Standard katman 3/4 saldırılarını (SYN selleri, UDP selleri, DNS yükseltme) otomatik emer
- Advanced katman 7 koruması, gerçek zamanlı bildirimler ve Shield Response Team ekler

**AWS WAF**:

- Yönetilen kural grupları kurulumu önemli ölçüde basitleştirir — birkaç tıklamayla OWASP Top 10 koruması
- Özel kurallar HTTP saldırı desenlerini anlamayı gerektirir
- Hız sınırlaması sıklıkla göz ardı edilen güçlü bir özelliktir — kazıyıcılara ve kaba kuvvete karşı etkili
- WAF güvenli uygulama kodunun yerine geçmez — derinlemesine savunma katmanıdır
- Count modunda başlayın, doğrulayın, sonra Block'a geçin

**GuardDuty**:

- Etkinleştirmek son derece kolay (birkaç tıklama, 30 günlük ücretsiz deneme)
- Bulgular insan incelemesi ve yanıtı gerektirir — GuardDuty tespit eder, düzeltmez
- Yanlış pozitifler olur — bazı meşru etkinlik ML modellerine anormal görünür
- Önem seviyeleri (Düşük/Orta/Yüksek) yanıtı önceliklendirmeye yardımcı olur
- Otomatik yanıt iş akışları için Security Hub, EventBridge ve Lambda ile entegre olur

**Amazon Inspector**:

- Sürekli, otomatik açık taraması — tek seferlik kontrol değil
- Yeni CVE'ler yayınlandığında veya kaynaklar değiştiğinde otomatik yeniden tarar
- EC2 örneklerini (işletim sistemi ve uygulama paketleri), ECR konteyner görüntülerini ve Lambda işlev paketlerini kapsar
- Bulgular Security Hub'a akar; önem dereceleri yamalamayı önceliklendirmeye yardımcı olur
- Saldırıları engellemez — saldırıları mümkün kılan koşulları yüzeye çıkarır

**Amazon Macie**:

- S3'teki hassas veriyi (PII, kimlik bilgileri, finansal veri) otomatik keşfeder
- Anormal davranış deseni olmayan veri maruziyetini yakalar — GuardDuty onu kaçırır
- 30 günlük ücretsiz deneme; sonrasında paket başına ay başına ödeme
- Birçok S3 paketi ve değişen hassasiyet seviyeleri olan ekipler için en değerli

**AWS Security Hub**:

- GuardDuty, Macie, Inspector, Config ve Firewall Manager'dan bulguları toplar
- Yapılandırmayı güvenlik kıyaslamalarına (CIS, NIST, PCI-DSS) karşı kontrol eder
- Çok hesaplı ölçekte en değerli
- Yalnızca bir hesabınız olsa bile erken etkinleştirin — bulgu geçmişi birikimlidir

## Özet

Beş hizmet, beş katman. Her biri farklı türde bir tehdidi ele alır — ve hiçbiri diğerlerinin yerine geçmez. Bir DDoS saldırısı WAF ve GuardDuty'yi atlar. Bir SQL enjeksiyon denemesi Shield'ı atlar. Yavaşça ve dikkatlice kullanılan tehlikeye atılmış bir kimlik bilgisi Shield ve WAF'i tamamen atlayabilir — ama GuardDuty anomaliyi görür. Müşteri PII'sini yanlışlıkla bir hata ayıklama S3 paketine yükleyen bir geliştirici üçünü de atlar — ama Macie onu yakalar.

- **AWS Shield Standard**: Ücretsiz, otomatik DDoS koruması katman 3/4'te. Her zaman açık. 50 Gbps SYN selini Nimbus yük dengeleyicisine ulaşmadan önce emdi.
- **AWS Shield Advanced**: SRT erişimi ve maliyet korumasıyla premium DDoS koruması. Kurumsal kullanım durumu.
- **AWS WAF**: Uygulama katmanı güvenlik duvarı. HTTP isteklerini incele ve filtrele. CloudFront, ALB veya API Gateway'e ekle. OWASP Top 10 koruması için Yönetilen Kural Gruplarını kullan. Kazıyıcı savunması için hız tabanlı kurallar.
- **Amazon GuardDuty**: Davranışsal tehdit tespiti. Çekirdek veri kaynakları: CloudTrail olayları, VPC Akış Günlükleri ve DNS günlükleri. İsteğe bağlı genişletilmiş korumalar S3 olayları, EKS/ECS çalışma zamanı izleme, RDS giriş olayları ve Lambda ağ etkinliği ekler. Anormal etkinlik için kategorize edilmiş bulgular üretir. Beş ana bulgu türü: UnauthorizedAccess (konsol girişi), CryptoCurrency (madencilik), Recon (port yoklama), Trojan (C2 trafiği), Policy (S3 yanlış yapılandırması).
- **Amazon Inspector**: Otomatik açık değerlendirmesi. EC2 örneklerini, ECR konteyner görüntülerini ve Lambda işlev paketlerini bilinen CVE'ler için tarar. Sürekli çalışır ve yeni açıklar yayınlandığında yeniden değerlendirir. Bulgular Security Hub'a akar.
- **Amazon Macie**: S3'te hassas veri keşfi. PII, kimlik bilgileri ve finansal veriyi tespit eder. Anormal davranış deseni olmayan maruziyeti yakalar.
- **AWS Security Hub**: Tüm güvenlik hizmetlerinden bulguları tek bir panoda toplar. Birden çok hesapta merkezi izlemeyi mümkün kılar.
- **CloudTrail**: Tüm AWS güvenlik günlük kaydının temeli. Uzun süreli saklama için S3'e yazan bir iz etkinleştirin. Her güvenlik hizmeti ondan okur.

## Sınav İpuçları

*SAA-C03 Alanı: Güvenli Mimariler Tasarlama (Alan 1, Görev 1.2)*

- **Shield Standard vs Advanced**: Standard ücretsiz ve otomatiktir. Advanced para tutar ve SRT, maliyet koruması ve daha iyi tespit ekler. Advanced için sınav sinyalleri: "büyük ölçekli DDoS," "saldırılar sırasında SLA garantisi," "DDoS ile ilgili maliyet artışlarına karşı finansal koruma."
- **WAF kullanım durumu sinyalleri**: "SQL enjeksiyonunu engelle," "siteler arası betik çalıştırmayı engelle," "API çağrılarını hız sınırla," "belirli user-agent'leri engelle," "OWASP Top 10 koruması" → WAF.
- **GuardDuty sinyalleri**: "olağandışı API etkinliğini tespit et," "tehlikeye atılmış kimlik bilgilerini belirle," "anormal EC2 ağ bağlantılarını işaretle," "tehdit istihbaratı" → GuardDuty.
- **WAF eki**: CloudFront'a (küresel), ALB'ye (bölgesel), API Gateway'e (bölgesel), AppSync'e eklenebilir.
- **GuardDuty veri kaynakları**: Üç çekirdek kaynak — CloudTrail olayları, VPC Akış Günlükleri, DNS günlükleri. Genişletilmiş isteğe bağlı kaynaklar S3 veri olaylarını, EKS denetim günlüklerini, RDS giriş olaylarını, Lambda ağ etkinliğini ve ECS çalışma zamanını içerir. Sınav belirli bir tespit senaryosuyla hangi veri kaynağının ilgili olduğunu sorabilir: "anormal RDS girişleri" → GuardDuty RDS Protection; "konteyner çalışma zamanı tehditleri" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs GuardDuty**: Bu yaygın bir sınav çeldiricisidir. **Macie** S3'teki hassas veriyi (PII, kimlik bilgileri, finansal veri) tespit etmek için ML kullanır. **GuardDuty** davranıştaki tehditleri ve anomalileri tespit eder. Macie içerikle ilgilidir. GuardDuty davranışla ilgilidir.
- **Inspector vs. GuardDuty vs. Macie:** Üç farklı mercek, hiçbiri diğerlerinin yerine geçmez. **Inspector** = açık taraması — EC2 örneklerinde, ECR'deki konteyner görüntülerinde ve Lambda işlev paketlerinde CVE'ler. Sürekli çalışır ve yeni CVE'ler yayınlandığında yeniden tarar. **GuardDuty** = davranışsal tehdit tespiti — şu anda anormal görünen ne oluyor. **Macie** = S3'te hassas veri keşfi — olmaması gereken PII, kimlik bilgileri ve finansal veri. Sınav tetikleyicisi: "EC2'de yamalanmamış açıkları belirle" veya "konteyner görüntülerini CVE'ler için tara" → Inspector. "Olağandışı API çağrılarını veya tehlikeye atılmış kimlik bilgilerini tespit et" → GuardDuty. "S3'te PII veya hassas veri bul" → Macie.
- **Security Hub**: Birden çok hizmet ve hesaptan güvenlik bulgularını toplar. Sınav senaryosu: "şirketin birden çok AWS hesabı var ve tüm güvenlik bulgularının tek bir görünümünü istiyor" → Security Hub.
- **WAF'te hız tabanlı kurallar**: Bir zaman penceresinde IP başına istekleri sınırlamak için kullanılır. Core Rule Set'ten (saldırı desenleriyle eşleşen) farklı. Sınav hız tabanlı kuralları "kaba kuvvet giriş denemelerini önle" veya "kazımayı hafiflet" için kullanır.
- **CloudTrail + GuardDuty + Security Hub**: Bu üçü birlikte AWS güvenlik gözlemlenebilirliğinin çekirdeğini oluşturur. Önce CloudTrail'i etkinleştirin (GuardDuty ve Security Hub ona bağlıdır), sonra GuardDuty, sonra bulguları toplamak için Security Hub.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

AWS WAF ile Amazon GuardDuty arasındaki farkı açıklayın. Her hizmet neye karşı korur ve her biri hangi katmanda çalışır?

*(İpucu: WAF'i gelen isteklerde bir filtre, GuardDuty'yi günlüklerinizi izleyen davranışsal bir analist olarak düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir perakende şirketinin web sitesi, ürün arama API'sine saatte milyonlarca istek gönderen bir botnet tarafından hedefleniyor. İstekler meşru görünüyor (geçerli User-Agent dizeleri, geçerli oturum çerezleri) ama satın almayla sonuçlanmıyor — ürün fiyatlarını kazıyorlar. Saldırı meşru müşterilerin yavaş yanıt süreleri yaşamasına neden oluyor.

Bu tehdidi EN İYİ hangi hizmet kombinasyonu ele alır?

A) Hız sınırlama kurallarıyla AWS WAF ve CloudFront  
B) AWS Shield Advanced ve CloudFront  
C) Amazon GuardDuty ve AWS Shield Standard  
D) Botnet'in IP aralıklarını engelleyen Network ACL'ler

**İpucu 1**: İstekler HTTP düzeyindedir (uygulama katmanı). Hangi hizmet HTTP katmanında çalışır?

**İpucu 2**: Botnet'ler birçok farklı IP adresi kullanır — NACL düzeyinde belirli IP aralıklarını engellemek büyük botnet'lere karşı etkisizdir.

**İpucu 3**: IP adresine göre hız sınırlama, tamamen engelleyemeseniz bile kazımayı yavaşlatabilir.

**Cevap**: A

**Açıklama**: AWS WAF, IP adresi başına istekleri hız sınırlayarak herhangi bir tek kaynaktan yüksek hacimli kazımanın etkisini azaltabilir. CloudFront gelen trafiği AWS'nin kenar ağında dağıtarak hacmi emer ve origin'i korur. WAF kuralları ayrıca kazıma davranışını belirlemek için istek desenleriyle (aynı API uç noktasına hızlı ardışık istekler) eşleşebilir.

**Neden B değil?** Shield Advanced DDoS sellerine (katman 3/4) karşı korur. Senaryo Shield'ın incelemediği uygulama katmanı kazımayı (katman 7 HTTP istekleri) tanımlıyor.

**Neden C değil?** GuardDuty AWS hesabınızın davranışındaki anomalileri tespit eder — gelen HTTP isteklerini engellemez. Shield Standard uygulama katmanı saldırılarını ele almaz.

**Neden D değil?** Büyük botnet'ler dağıtılmış kaynaklardan binlerce IP adresi kullanır. Belirli aralıkları engellemek, sofistike botnet'lere karşı başarısız olan bir köstebek-vurma yaklaşımıdır.

*SAA-C03 Alanı: Güvenli Mimariler Tasarlama — Görev 1.2*

**Alıştırma 3 — Mimari Mücadelesi** *(İsteğe Bağlı)*

Nimbus, kredi kartı verisini ele almaya hazırlanırken tehdit modelini değerlendiriyor. Bir PCI-DSS uyumluluk incelemesi şunları gerektiriyor:

- Ağ katmanı DDoS saldırılarına karşı koruma
- Bilinen web istismarları için uygulama katmanı filtreleme
- Tüm API çağrılarının kurcalamaya dayanıklı, uzun süreli bir depoya kaydedilmesi
- Ödeme hizmetine olağandışı erişim desenlerinin tespiti

Her gereksinimi belirli bir AWS hizmetine veya yapılandırmasına eşleyin. Shield Standard yeterli mi, yoksa PCI-DSS bağlamı Advanced'i mi öneriyor? WAF'i nereye eklersiniz?

*(Tek bir doğru cevap yoktur. Amaç, uyumluluk gereksinimlerini AWS hizmetlerine eşleme pratiği yapmaktır.)*

## Jenerik Sonrası Sahne

GuardDuty etkinleştirildi.

Kırk sekiz saat sonra ilk bulgusunu üretti: *"EC2 Örneği i-0abc123 bilinen bir Tor çıkış düğümüyle iletişim kuruyor."*

Leo örnek ID'sine baktı.

"Bu dahili izleme örneği," dedi. "Ağ tanılaması çalıştırmak için kurduğum o."

"Tor çıkış düğümleriyle iletişim kurması gerekiyor mu?"

"Hayır." Durakladı. "Neden kursun?"

Örneği açtı. Birisi ona bir araç kurmuştu — meşru bir açık kaynak ağ tarayıcısı ki, ortaya çıktığı üzere, anonimleştirilmiş veri toplama için Tor altyapısıyla da iletişim kuruyordu.

"Yani araç eve telefon ediyordu," dedi Priya.

"Benim bilgim olmadan," diye onayladı Leo.

"Bu bir tedarik zinciri riski. Yetkilendirmediğin şeyler yapan bir bağımlılık."

Leo aracı kaldırdı. Kurulumdan önce her üçüncü taraf aracı gözden geçirmek için bir süreç kurdu.

"Şimdi bu paranoya düzeyinde miyiz?" diye sordu Maya.

"Evet," dedi Priya.

"Her zaman bu düzeyde olmalı mıydık?" diye sordu Maya.

"Yine evet," dedi Priya.

Sonraki bölümde: Oregon'daki veri merkezi yok olduğunda ne olur — ve Nimbus neden çalışmaya devam eder.
