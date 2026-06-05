# Ekipman A: AWS Hizmetlerine Hızlı Bakış

Bu kitapta ele alınan her hizmet, tanıtıldıkları sırayla. Bu, bir çalışma referansı ve sınav hazırlığı sırasında hızlı bir bakış açısı olarak kullanın.

---

## Hesaplama

**EC2 — Esnek Hesaplama Bulutu** *(4. Bölüm)*

Bulutta sanal makineler. İstemci türünü (CPU, bellek, depolama), işletim sistemini ve bölgeyi seçersiniz. Bir saat (Talep Üzerinde) veya bir taahhüt (Rezervli Instance'lar / Tasarruf Planları) veya boş kapasite yuvası (Spot) için ödeme yaparsınız. Temel hesaplama temelidir.

Temel kavramlar: AMI (Amazon Makine Görüntüsü), istemci türleri (t3, m6g, r6g, c6g aileleri), anahtar çiftleri, istemci profilleri, yerleşim grupları.

Sınav işareti: Kalıcı, durum bilgili veya uzun süreli hesaplama gerektiğinde — EC2 veya ECS. Kısa süreli, olay tetiklemeli veya boş boşta çalışma maliyeti gerektiğinde — Lambda.

---

**Otomatik Ölçekleme + Uygulama Yük Dengeleyici** *(7. Bölüm)*

Otomatik Ölçekleme Grupları (ASG'ler), yük doğrultusunda EC2 istemcilerini ekler ve çıkarır. Uygulama Yük Dengeleyiciler (UYD'ler), trafiği istemciler arasında dağıtır ve yolu veya ana bilgisayarı kullanarak yönlendirir. Birlikte, yatay ölçekleme katmanını oluşturur.

Temel kavramlar: Başlangıç şablonu, ölçekleme politikaları (hedef izleme, adım, planlı), sağlık kontrolleri, UYD hedef grupları, dinleyici kuralları, ağırlıklı yönlendirme.

Sınav işareti: "Değişken yük" veya "yüksek kullanılabilirlik AZ'ler arasında" → ASG + UYD.

---

**Lambda** *(20. Bölüm)*

Sunucusuz fonksiyonlar. Kod yazarsınız, AWS bunu olaylara yanıt olarak çalıştırır. Yönetilmesi gereken sunucular yoktur. Bir çağrıya ve yürütme milisaniyeye göre ödeme yaparsınız. Binlerce eş zamanlı yürütme için otomatik olarak ölçeklenir.

Temel kavramlar: Olay kaynakları (API Gateway, S3, SQS, EventBridge, Kinesis), rol, eş zamanlılık sınırları, ayrılmış ve tahsis edilmiş eş zamanlılık, soğuk başlatma, Katmanlar, 15 dakikalık maksimum süre, 15 dakikalık maksimum süre.

Sınav işareti: "Sunucusuz", "olay odaklı", "kısa süreli görevler", "boşta çalışma maliyeti yok" → Lambda.

---

**ECS — Esnek Kapasite Hizmeti** *(21. Bölüm)*

AWS'de Docker kapaklarını çalıştırır. İki başlatma türü vardır: EC2 (ev sahibi yönetir) ve Fargate (AWS ev sahibi yönetir). ECS, görev tanımlarını, hizmetleri, küme planlamasını ve yük dengeleyiciler ve hizmet keşfi ile entegrasyonu yönetir.

Temel kavramlar: Görev tanımı, ECS hizmeti, Fargate vs. EC2 başlatma türü, ECR (kapak kaydı), görev IAM rolü, hizmet otomatik ölçekleme.

Sınav işareti: "Kapalı iş yükleri", "mikro hizmetler", "AWS'de Docker" → ECS (genellikle sunucusuz kapaklar için Fargate).

---

**EKS — Esnek Kubernetes Hizmeti** *(21. Bölüm)*

Yönetilen Kubernetes. AWS kontrol düzlemini çalıştırır; siz çalışan düğümleri (EC2 veya Fargate) çalıştırırsınız. EKS'yi, ekibin zaten Kubernetes'i kullandığı veya Kubernetes özelliklerine ihtiyaç duyan iş yükleri için kullanırsınız.

Sınav işareti: "Kubernetes", "mevcut K8s iş yüklerini taşımak gerekiyor" → EKS. "Sadece kapaklara ihtiyaç var, K8s karmaşıklığı yok" → ECS.

---

## Depolama

**S3 — Basit Depolama Hizmeti** *(5. Bölüm)*

Nesne depolama. Sınırsız kapasite, %99,999,99999% (on bir dokuz) dayanıklılık. Dosyaları kapaklarda nesneler olarak saklar. Kapakların bölgede yaşadığını. Nesneler 0 bayttan 5 TB'ye kadar olabilir.

Temel kavramlar: Kapak politikası, nesne ACL'si, sürümleme, statik web sitesi barındırma, imzalanmış URL'ler, çoklu yükleme, Transfer Hızlandırma, depolama sınıfları (Standart, Akıllı Katman, Standart-IA, Tek Bölge-IA, Buzhane Anında Erişim, Buzhane Esnek Erişim, Buzhane Derin Arşiv).

Sınav işareti: "Dosyaları ve verileri sakla ve al", "statik varlıklar", "yedeklemeler", "veri gölü" → S3. Doğru depolama sınıfı erişim sıklığına ve geri çağırma hızına bağlıdır.

---

**EBS — Esnek Blok Depolama** *(6. Bölüm)*

Tek bir EC2 örneğine bağlanan blok depolama. Bir hard drive'a benzer. Örneğe yaşam döngüsü bağımsız olarak kalır (ayırabilir ve yeniden bağlayabilirsiniz). En yaygın türler: gp3 (genel amaçlı SSD, varsayılan), io2 (veritabanları için tahsis edilmiş IOPS), st1 (sıralı okumalar için verim odaklı HDD, standart).

Temel kavramlar: Snaphot'lar (incremental, S3'te saklanır), şifreleme (KMS), Çoklu Bağlatma (io1/io2 yalnızca), IOPS ve verim tahsisleri.

Sınav işareti: "EC2 için kalıcı depolama", "veritabanı depolama", "düşük gecikmeli blok erişimi gerekiyor" → EBS.

---

**EFS — Esnek Dosya Sistemi** *(6. Bölüm)*

Birden çok EC2 örneğinden aynı anda erişilebilen paylaşılan bir dosya sistemidir. NFS protokolü. Otomatik olarak ölçeklenir. EBS'ye göre GB başına daha pahalıdır. İki depolama sınıfı vardır: Standart ve Nadiren Erişim. Akıllı Katman, dosyaları erişim sıklığına göre otomatik olarak hareket eder.

Sınav işareti: "Paylaşılan bir dosya sistemi", "aynı dosyaya ihtiyaç duyan birden çok EC2 örneği", "NFS" → EFS.

---

**S3 Depolama Sınıfları ve Yaşam Döngüsü Politikaları** *(23. Bölüm)*

S3 Akıllı Katman, erişim sıklığına göre nesneleri otomatik olarak katmanlar arasında hareket ettirir. Yaşam döngüsü politikaları, yaş kurallarına göre nesneleri (Standart → Standart-IA → Buzhane) katmanlar arasında geçiş yapar. Buzhane depolama sınıfları, dakikalar (Buzhane Anında) ila 12 saat (Buzhane Derin Arşiv) aralığındaki geri çağırma gecikmelerine sahiptir.

Exam sinyali: "Azotlama maliyetlerini sık erişilmeyen verilere azaltın" → yaşam döngüsü politikaları, Akıllı Katmanlama veya Buzdolabına.

---

## Veritabanları

**RDS — İlişkisel Veritabanı Hizmeti** *(Bölüm 8)*

Yönetilen ilişkisel veritabanları. Desteklenen motorlar: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server ve Aurora (AWS'nin özel motoru). AWS, yedeklemeleri, yamaları, arıza toleransını ve replikasyonu yönetir. Şema tasarımı, sorgular ve örnekleme boyutlandırması üzerinde siz yönetirsiniz.

Temel kavramlar: Çoklu-Bölge dağıtımı (otomatik arıza toleransı, senkron replikasyon), Okuma Replikaları (geriye doğru, okuma ölçeklendirmesi için), otomatik yedeklemeler (1-35 gün tutma süresi), manuel anlık görüntüler (silinene kadar saklanır), RDS Proxy (bağlantı havuzu).

Exam sinyali: "İlişkisel veritabanı", "ACID işlemleri", "var olan SQL iş yükü" → RDS veya Aurora.

---

**Aurora** *(Bölüm 24)*

AWS'nin ilişkisel veritabanı motoru, MySQL ve PostgreSQL ile uyumludur. 6 kopyada 3 AZ'de dağıtılmış depolama motoru. Tipik olarak MySQL'den 5 kat daha hızlıdır. Aurora Serverless v2, kapasiteyi otomatik olarak ölçeklendirir (ACU'lar - Aurora Kapasite Birimleri ölçüsünde).

Temel kavramlar: Aurora kümesi (yazar + kadar 15 okuyucu uç noktası), Aurora Küresel Veritabanı (küresel okuma replikaları < 1 saniyelik gecikme ile), Aurora Serverless v2.

Exam sinyali: "Yüksek performanslı ilişkisel veritabanı", "MySQL/PostgreSQL ile uyumlu", "küresel okumalar", "değişken iş yükü" → Aurora.

---

**DynamoDB** *(Bölüm 9)*

Tamamen yönetilen NoSQL veritabanı. Ana-değer ve belge modeli. Tek bir milisaniyeli performansla herhangi bir işlem hacmine ölçeklenebilir. İki kapasite modu vardır: talep başına (talep başına ödeme) ve saat başına kapasite birimi başına ödeme (Auto Ölçeklendirme ile).

Temel kavramlar: Bölüm anahtarı (zorunlu), sıralama anahtarı (isteğe bağlı), Küresel İkincil İndeks (GSI), Yerel İkincil İndeks (LSI), DynamoDB Akışları (değişiklik verisi yakalama), DynamoDB Hızlandırıcı (DAX) - bellek içi önbellek, TTL (Yaşam Süresi), işlemler.

Exam sinyali: "Yüksek işlem hacmi anahtara dayalı erişim", "esnek şema", "sunucusuz NoSQL" → DynamoDB.

---

**ElastiCache** *(Bölüm 10)*

Yönetilen bellek içi önbellek. İki motor: Redis (sabit, pub/sub, Lua betiği, veri yapıları) ve Memcached (saf önbellek, daha basit, çoklu iş parçacıklı). Veritabanı yükünü azaltmak ve sıkça okunan verileri mikro saniyelerde sunmak için kullanın.

Temel kavramlar: Cache-aside deseni, yaz-atıl deseni, boşaltma politikaları, TTL, küme modu (Redis), Çoklu-Bölge otomatik arıza toleransı ile.

Exam sinyali: "Veritabanı yükünü azaltın", "alt milisaniyelik okuma gecikmesi", "oturum yönetimi", "gerçek zamanlı lider tahtası" → ElastiCache Redis.

---

## Ağlar

**VPC — Sanal Özel Bulut** *(Bölüm 11)*

AWS içinde izole bir ağ. Bölgedeki tüm AZ'leri kapsar. IP adres alanı (CIDR bloğu) tanımlarsınız, alt ağlar (kamuya açık veya özel) oluşturursunuz, rota tablolarını yapılandırır ve güvenlik grupları ve NACL'ler aracılığıyla erişimi kontrol edersiniz.

Temel kavramlar: Kamu alt ağı (internet yola bağlı), özel alt ağ (çıkış trafiği için NAT Geçidi'ne yol), İnternet Geçidi (giriş + çıkış internete), NAT Geçidi (özel örnekler için yalnızca çıkış), VPC Peering (iki VPC'yi birbirine bağlar), VPC Uç Noktaları (AWS hizmetlerine internet üzerinden gitmeden bağlanır).

Exam sinyali: "AWS içinde özel bir ağ", "kaynakları internetten izole edin", "ağ trafiğini kontrol edin" → VPC.

---

**Güvenlik Grupları ve NACL'ler** *(Bölüm 15)*

Güvenlik grupları, örnek düzeyinde durum bilgili güvenlik duvarlarıdır - yalnızca izin kuralları, otomatik olarak geri dönüş trafiği vardır. NACL'ler (Ağ Erişimi Kontrol Listeleri), alt ağ düzeyinde durum bilgisi olmayan güvenlik duvarlarıdır - hem giriş hem de çıkış kuralları gerekir, kuralların numarasına göre sıralanır.

Exam sinyali: "Bir alt ağa belirli bir IP adresinin erişimini engelle" → NACL. "Bir örneğe/alt ağa yönelik trafiği kontrol et" → güvenlik grubu.

---

**Route 53** *(Bölüm 12)*

AWS'nin DNS hizmeti ve alan kaydı. İnternet trafiğini AWS kaynaklarına ve dış uç noktalara yönlendirir. Yönlendirme politikaları: Basit, Ağırlıklı, Gecikme tabanlı, Arıza Toleransı, Coğrafi, Coğrafi Yakınlık, Çok Değerli Cevap.

Temel kavramlar: Hosted bölgeleri (kamuya açık ve özel), kayıt türleri (A, AAAA, CNAME, Alias), sağlık kontrolleri, Trafik Akışı (görsel politika düzenleyici).

Exam sinyali: "DNS yönlendirme", "bölge aralarında arıza toleransı", "latence veya konuma göre yönlendirme" → Route 53 uygun yönlendirme politikasının kullanılmasıyla.

---

**CloudFront** *(Bölüm 13)*

İçerik Dağıtım Ağı (CDN). İçeriği uç noktadaki (400+ dünya çapında) önbelleğe alır. Son kullanıcılar için gecikmeyi azaltır. S3, EC2, ALB, API Gateway gibi kaynaklardan gelen veri transfer maliyetlerini azaltır.

Temel kavramlar: Dağıtım, kaynaklar, davranışlar (kaynaklara yol tabanlı yönlendirme), TTL (önbellek kontrolü), önbellek güncellemeleri, imzalı URL'ler ve çerezler (erişim kontrolü), Lambda@Edge ve CloudFront İşlevleri (uç noktada kod yürütme), Kaynak Kalkanı (kaynak yükünü azaltma).

Exam sinyali: "Küresel düşük gecikme", "statik içeriği önbelleğe al", "kaynak yükünü azalt", "Shield ile DDoS'yi koru" → CloudFront.

---

**Doğrudan Bağlantı ve VPN** *(Bölüm 25)*

AWS Direct Connect, bulut üzerinde, on-premises veritabanlarınıza AWS’e bağlamak için kullanılan özel bir fiziksel ağ bağlantısıdır. Kamu internetini kullanmaz. Daha tutarlı bant genişliği ve gecikme sağlar. AWS Site-to-Site VPN, kamu interneti üzerinden şifreli bir tüneldir — daha hızlı kurulum ve daha düşük maliyetli olmasına rağmen değişken performans gösterebilir.

Temel kavramlar: Sanal Arayüz (VIF), Direct Connect Gateway (birden fazla bölgeye bağlanmak için), Transit Gateway (hub-and-spoke ağ topolojisi), VPN tüneli yedekliliği.

Soru işareti: “Özel, özel bir bağlantı AWS’e” → Direct Connect. “Şifreli bağlantı, daha hızlı kurulum” → VPN. “Birden fazla VPC’ye bağlanmak” → Transit Gateway.

---

**VPC Uç Noktaları** *(30. Bölüm)*

Özel kaynakları kamu interneti veya NAT Gateway’i kullanmadan AWS hizmetlerine bağlamak için kullanılır. Gateway Uç Noktaları: ücretsizdir ve yalnızca S3 ve DynamoDB için mevcuttur. Arayüz Uç Noktaları (PrivateLink): saat başına + GB başına ücretlendirilir ve çoğu AWS hizmeti için mevcuttur.

Soru işareti: “EC2, özel bir alt ağdan S3/DynamoDB’ye çağrılır — NAT Gateway maliyetlerini azaltır” → Gateway Uç Noktası (ücretsiz). “SQS, SSM, Secrets Manager’dan özel bir alt ağa özel bağlantı” → Arayüz Uç Noktası.

---

**Güvenlik ve Kimlik**

**IAM — Kimlik ve Erişim Yönetimi** *(3 ve 14. Bölümler)*

AWS hesabınızda kimin ne yapabileceğini kontrol eder. Kullanıcılar (uzun vadeli kimlik bilgileri), Gruplar (izinleri paylaşan kullanıcılar), Roller (hizmetler ve çapraz hesap erişimi için geçici kimlik bilgileri), Politikalar (izin/yasaklama kurallarını tanımlayan JSON belgeleri).

Temel kavramlar: İlke, Eylem, Kaynak, Koşul, açık reddetme > açık izin > örtülü reddetme, SCP (AWS Organizasyonlarında Hizmet Kontrol Politikası), İzin Sınırı, Rolü Al.

Soru işareti: IAM, her güvenlik sorusunda yer alır. Anahtar desen: hizmetler IAM rollerini kullanır (kullanıcılar değil). Çapraz hesap erişimi rol ataması kullanır. En az ayrıcalık — yalnızca gerekli olanı verin.

---

**KMS — Anahtar Yönetimi Hizmeti** *(16. Bölüm)*

Yönetilen şifreleme anahtarı hizmetidir. Şifreleme anahtarları oluşturur, depolar ve kontrol eder. Müşteriye ait anahtarlar (CMK’lar), dönüşüm, kullanım ve erişim politikalarını tanımlamanıza olanak tanır. AWS tarafından yönetilen anahtarlar otomatik olarak yönetilir.

Temel kavramlar: Anahtar politikası (IAM politikası ayrıntısı), Envelop Şifrelemesi (veri bir veri anahtarıyla şifrelenir; veri anahtarı CMK ile şifrelenir), Otomatik anahtar dönüşümü, Çok bölge anahtarları, İzinler.

Soru işareti: “Veriyi dinlenme halinde şifreleyin”, “müşteriye ait şifreleme anahtarları”, “anahtar dönüşümü” → KMS.

---

**Secrets Manager** *(16. Bölüm)*

Hassas değerleri depolar ve otomatik olarak döndürür: veritabanı kimlik bilgilerini, API anahtarlarını, OAuth jetonlarını. RDS için otomatik şifreleme dönüşümünü entegre eder. Uygulamalar, kimlik bilgilerini çalışma zamanında API aracılığıyla alır — kimlik bilgilerini kodlamaz.

Soru işareti: “Veritabanı kimlik bilgilerini saklayın ve döndürün”, “kodlamadan kimlik bilgilerini saklamayın” → Secrets Manager. “Yapılandırma değerlerini, sırları değil” → Parameter Store (SSM).

---

**AWS Shield** *(17. Bölüm)*

DDoS koruması. Shield Standard otomatik ve ücretsizdir — yaygın hacimsel ve protokol saldırılarına karşı koruma sağlar. Shield Advanced, maliyetli koruma, 24/7 DDoS yanıt ekibi ve ayrıntılı saldırı görünürlüğü ekler.

Soru işareti: “DDoS’tan korunun” → Shield Standard (otomatik) veya Shield Advanced (kurumsal, SLA ile).

---

**WAF — Web Uygulaması Güven Duvarı** *(17. Bölüm)*

HTTP/HTTPS trafiğini kurallara göre filtreler: IP blokları, hız sınırları, SQL enjeksiyonu desenleri, XSS desenleri, coğrafi kısıtlamalar, özel kurallar. CloudFront, ALB, API Gateway veya AppSync ile ilişkilendirilebilir.

Soru işareti: “Belirli IP adreslerini engelleyin”, “SQL enjeksiyonunu kenarlarda engelleyin”, “API çağrılarını hızla sınırlayın” → WAF.

---

**GuardDuty** *(17. Bölüm)*

Tehdit tespiti hizmeti. CloudTrail günlüklerini, VPC Flow Loglarını ve DNS günlüklerini ML ve tehdit istihbaratı kullanarak analiz eder. Olağan API aktivitesini, bilinen kötü amaçlı IP’lere iletişimini, tehlike altında olan kimlik bilgilerini tespit eder.

Soru işareti: “Olağan dışı aktiviteyi tespit edin”, “tehlike altında olan IAM kimlik bilgilerini belirleyin”, “sürekli tehdit izleme” → GuardDuty.

---

## Mesajlaşma ve Olay İşleme

**SQS — Basit Kuyruk Hizmeti** *(19. Bölüm)*

Yönetilen mesaj kuyruğu. Üreticiler mesajlar gönderir; tüketiciler mesajları okur ve siler. Hizmetleri ayırır: gönderen, alıcının mevcut olup olmadığını bilmek zorunda değildir. Standart kuyruklar: en az bir kez teslimat, en iyi çaba ile sıralama. FIFO kuyruklar: tam bir kez işleme, sıkı sıralama.

Temel kavramlar: Görünürlük zaman aşımı (mesaj diğer tüketiciler tarafından işleme sırasında gizlenir), Başarısız olan mesajlar için Ölüm Haritası Kuyruğu (DLQ), Mesaj tutulumu (varsayılan olarak 4 gün, maksimum 14 gün), Uzun polling (boş yanıtları azaltır).

Soru işareti: “Hizmetleri ayırın”, “yükte sıçramaları tamponlayın”, “asenkron işleme” → SQS. “Sıra önemli ve tam bir kez gereklidir” → SQS FIFO.

---

**SNS — Basit Bildirim Hizmeti** *(19. Bölüm)*

Yönetilen yayın/abone hizmeti. Yayıncılar bir konuya mesaj gönderir; tüm aboneler bir kopyasını alır. Fan-out deseni: bir mesaj → birçok tüketici. Protokoller: SQS, Lambda, HTTP/HTTPS, e-posta, SMS, mobil push.

Anahtar Kavramlar: Konu, abonelik, fan-out deseni (SNS → birden çok SQS kuyruğuna), mesaj filtreleme (abonentler yalnızca eşleşen mesajları alır).

Sorgu İşareti: “Birden çok uç noktaya aynı anda bildirim gönderin”, “tek bir olayı birden çok tüketiciye fan-out yapın” → SNS. Yaygın desen: SNS + SQS dayanıklı fan-out için.

---

**EventBridge** *(22. Bölüm)*

Olay aracı, olay odaklı mimariler oluşturmak için kullanılır. AWS hizmetlerinden, SaaS ortaklarından ve özel kaynaklardan gelen olayları Lambda, SQS, SNS, Step Functions ve diğer hedeflere yönlendirir. Zamanlanmış kurallar (cron) ve desen eşleştirme destekler.

Sorgu İşareti: “AWS hizmetlerinden olayları hedeflere yönlendirin”, “Lambda fonksiyonlarını planlayın”, “olay odaklı orkestrasyon” → EventBridge.

---

**Step Functions** *(22. Bölüm)*

Sunucusuz iş akışı orkestrasyonu. Lambda fonksiyonlarını, ECS görevlerini, DynamoDB, SNS, SQS ve diğer hizmetleri görsel durum makinelerine koordine eder. Yeniden denemeler, hata yönetimi, paralel dallar ve bekleme durumlarını işler.

Anahtar Kavramlar: Durum makinesi, durum türleri (Görev, Bekleme, Seçim, Paralel, Harita, Geç, Başar, Başarısız), Standart İş Akışları (kesin-bir-kez) vs. Express İş Akışları (en az bir kez, yüksek hacimli).

Sorgu İşareti: “Birden çok Lambda fonksiyonunu orkestre edin”, “yeniden deneme mantığıyla uzun süreli iş akışları”, “insan onay adımları” → Step Functions.

---

**Kinesis** *(26. Bölüm)*

Gerçek zamanlı veri akışı. Kinesis Data Akışları: kayıtların dayanıklı, sıralı akışı (dağıtılmış bir commit log'u gibi). Tüketiciler kayıtları işler, veri 24 saat ile 7 güne kadar saklanır. Kinesis Data Firehose: S3, Redshift, OpenSearch, Splunk'a tam olarak yönetilen teslimat – tüketici yönetimi gerekmez.

Anahtar Kavramlar: Şerit (geçiş birimi: 1MB/s yazma, 2MB/s okuma), anahtar bölüm (şerit atama belirler), dizi numarası, kontrol noktası (KCL veya Lambda), Firehose vs. Akışlar.

Sorgu İşareti: “Gerçek zamanlı akış”, “sıralı kayıtlar”, “olayları yeniden oynatma” → Kinesis Data Akışları. “Akış verilerini S3/Redshift’e tüketici yönetimi olmadan teslim edin” → Kinesis Firehose. SQS ile karşılaştırma: Kinesis saklar ve oynatır; SQS tüketim üzerine siler.

---

## Analitik

**Athena** *(26. Bölüm)*

S3’te depolanan veriler üzerinde sunucusuz SQL sorguları. Altyapıyı yönetmenize gerek yok. Sorgu başına ödeme (taranan GB başına). Parquet, ORC gibi sütun formatları ve bölümlendirilmiş verilerle en iyi çalışır.

Sorgu İşareti: “S3 verilerini SQL ile sorgulayın”, “veri gölünde atıl analiz”, “altyapı yönetimi gerekmiyor” → Athena.

---

**Glue** *(26. Bölüm)*

Sunucusuz ETL (Çıkar, Dönüştür, Yükle) hizmeti. Glue Crawler’lar verileri keşfeder ve Glue Veri Kataloğunu günceller. Glue İşleri Spark veya Python dönüşümlerini çalıştırır. Veri Kataloğu, Athena, Redshift Spectrum ve EMR ile entegre olur.

Sorgu İşareti: “Analiz için verileri dönüştürün ve yükleyin”, “S3 verilerinin şemasını keşfedin”, “ETL boru hattı” → Glue.

---

## Yüksek Kullanılabilirlik ve Felaket Kurtarma

**Çoklu Bölge ve Çoklu Bölge** *(18. Bölüm)*

Çoklu Bölge: bölge içinde senkron replikasyon, otomatik geçiş için (RDS Çoklu Bölge, bölge içinde yük denleyiciler). RPO ~0, RTO ~60s için RDS. Çoklu Bölge: coğrafi yedeklilik için asenkron replikasyon ve küresel kullanıcılar için daha düşük gecikme süresi.

Anahtar Kavramlar: RTO (Kurtarma Süresi Hedefi — kurtarılabilecek süre), RPO (Kurtarma Noktası Hedefi — ne kadar veri kaybedilebilir). Pilot Işık, Ilık Bekleme, Aktif-Aktif DR stratejileri.

Sorgu İşareti: Çoklu Bölge düzeyindeki arıza durumlarını (Çoklu Bölge tarafından ele alınır) vs. bölgesel arıza durumlarını (Çoklu Bölge tarafından ele alınır) ayırt edin. Çoklu Bölge ile maliyet ve karmaşıklık önemli ölçüde artar.

---

## Maliyet Optimizasyonu

**EC2 Fiyatlandırma Modelleri** *(27. Bölüm)*

Talep Üzerinde: tam fiyat, herhangi bir taahhüt yok. Rezervasyonlu Tesisler (1 veya 3 yıl): belirli bir örnekleme türü için %30-72’lik indirim. Hesaplama veya EC2 Örnekleme Planları: esneklik için saatlik taahhüt harcaması. Spot: kesintiye uğrayabilen iş yükleri için %60-90’lık indirim.

Sorgu İşareti: “Tahmin edilebilir bir iş yükü için maliyeti en aza indirin” → Rezervasyonlu Tesisler veya Hesaplama Planları. “Hatalara dayanıklı toplu işleme” → Spot. “Tahmin edilemez veya kısa vadeli” → Talep Üzerinde.

---

**Veri Transferi Fiyatlandırması** *(30. Bölüm)*

AWS’ye Gelen: ücretsiz. Aynı Bölge: ücretsiz. Aynı Bölge içinde: $0.01/GB her iki yönde. Farklı Bölgeler: $0.02-0.08/GB. İnternet (gidiş): ~$0.09/GB. NAT Gateway işleme: $0.045/GB. CloudFront veri transferi, doğrudan EC2-internet’e göre daha ucuzdur ve önbelleğe alma toplam hacmi azaltır.

Sorgu İşareti: “S3/DynamoDB’den özel bir alt ağa veri transfer maliyetlerini azaltın” → Arayüz Uç Noktaları (ücretsiz). “Diğer hizmetler için NAT Gateway maliyetlerini azaltın” → Arayüz Uç Noktaları.

---

## İzlenebilirlik

**CloudWatch** *(tümünde referans gösterilir)*

İzleme ve izlenebilirlik. CloudWatch Metrikleri: AWS hizmetlerinden ve özel uygulamalardan gelen sayısal zaman serisi verileri. CloudWatch Günlükleri: log verilerini toplar, arar ve analiz eder. CloudWatch Alarmları: metrik eşiklerine göre bildirimleri tetikler veya ölçeklemeyi otomatikleştirir. CloudWatch Panoları: metrikleri görselleştirir.

Anahtar Kavramlar: Metrik boyutları, tutma süreleri, log grupları ve log akışları, metrik filtreleri, CloudWatch Agent (OS düzeyinde metrikler ve EC2’den log’lar için), Kapı Odası Görüntüleme.

---

**CloudTrail** *(Bütün Bölümlerde Referans Verilir)*

AWS hesabınızdaki her API çağrısını kaydeder: kim tarafından yapıldı, nereden yapıldı, ne zaman yapıldı ve yanıt neydi. Çoklu bölge izleme yolu (Multi-region trail), logları S3'te sonsuza kadar saklar. Güvenlik denetimi, uyumluluk ve olay araştırması için kullanılır.

Sınav işareti: "O kaynağı kim sildi?" "Tüm API aktivitesini inceleyin" → CloudTrail.

---

**AWS Config** *(31. Bölümde Referans Verilir)*

Kaynak yapılandırma değişikliklerini zaman içinde takip eder. Kaynakları uyumluluk kurallarına göre değerlendirir. Her kaynak için her yapılandırma değişikliğinin geçmişini kaydeder. Sistem Yöneticisi ile entegre olur ve düzeltme sağlar.

Sınav işareti: "Bu kaynak, güvenlik politikamızla uyumlu mu?" "Bu kaynağın yapılandırması geçen hafta nasıl görünüyordu?" → AWS Config.

---

## İyi Tasarlanmış (Well-Architected)

**Alt Temeller** *(31. Bölüm)*

| Temel     | Temel soru                       | Temel hizmetler                               |
|----------|------------------------------------|-----------------------------------------------|
| Operasyonel Mükemmellik | İşlemlerimiz iyi sürüyor mu?       | CloudWatch, CloudTrail, SSM, Config          |
| Güvenlik   | Korunuyor muyuz?                   | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Güvenilirlik | Başarısızlık durumunda kurtuluyor muyuz? | Çoklu Bölge, Route 53 failover, yedekleme/geri yükleme, SQS |
| Performans Verimliliği | Doğru kaynakları kullanıyor muyuz? | Boyutlandırma, Otomatik Ölçekleme, CloudFront, Kinesis |
| Maliyet Optimizasyonu | Akıllıca harcıyor muyuz?        | Tasarruf Planları, Spot, S3 yaşam döngüsü, VPC Uç Noktaları |
| Sürdürülebilirlik | Çevresel etkiyi azaltıyor muyuz? | Boyutlandırma, Graviton, verimli depolama katmanları |

AWS İyi Tasarlanmış Aracı: Tasarımınızı alt temeller karşı karşıya olduğu şekilde değerlendirir. Sınavdan önce her bir temelin sorularının arkasındaki mantığı anlamak için kullanın.
