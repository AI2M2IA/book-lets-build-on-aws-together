# Ek B: SAA-C03 Alan Haritası

AWS Solutions Architect Associate sınavı (SAA-C03) dört alana (domain) ayrılmıştır. Bu ek, kitaptaki her bölümü ilgili alan ve göreve eşler, böylece bölüm sırası yerine sınav alanına göre çalışabilirsiniz.

---

## Alanlara Genel Bakış

| Alan                                            | Ağırlık | Açıklama                                               |
|-------------------------------------------------|---------|--------------------------------------------------------|
| Alan 1: Güvenli Mimariler Tasarlama             | %30     | IAM, ağ güvenliği, veri koruma                         |
| Alan 2: Dayanıklı Mimariler Tasarlama           | %26     | Yüksek kullanılabilirlik, hata toleransı, felaket kurtarma |
| Alan 3: Yüksek Performanslı Mimariler Tasarlama | %24     | Hesaplama, depolama, veritabanı, ağ performansı        |
| Alan 4: Maliyet Optimize Edilmiş Mimariler Tasarlama | %20 | Fiyatlandırma modelleri, maliyet yönetimi, kaynak optimizasyonu |

---

## Alan 1: Güvenli Mimariler Tasarlama (%30)

**Görev 1.1 — AWS kaynaklarına güvenli erişim tasarlama**

Temel kavramlar: IAM kullanıcıları, grupları, rolleri, politikaları. En az ayrıcalık ilkesi. Hesaplar arası erişim. Hizmet rolleri. AWS Organizations'da SCP (Service Control Policies).

| Bölüm      | Konu                                                                          |
|------------|-------------------------------------------------------------------------------|
| Bölüm 3    | IAM temelleri: kullanıcılar, gruplar, roller, politikalar, politika değerlendirme |
| Bölüm 14   | İleri IAM: hizmetler için roller, permission boundary'ler, hesaplar arası roller |
| Bölüm 3    | Politika değerlendirme mantığı: açık reddetme > açık izin > örtük reddetme     |
| Bölüm 14   | AWS Organizations, SCP'ler, Control Tower, Account Factory                     |
| Bölüm 14   | Cognito: User Pool'lar (uygulama oturum açma, JWT'ler) ve Identity Pool'lar (geçici AWS kimlik bilgileri) |

Anahtar sınav kalıpları:

- "EC2'nin sabit kodlanmış kimlik bilgileri olmadan S3'e erişmesi gerekiyor" → EC2 örnek profiline (instance profile) eklenmiş S3 politikalı IAM rolü
- "Farklı hesapların kaynak paylaşması gerekiyor" → hesaplar arası güven politikalı (trust policy) IAM rolü
- "Bir OU'daki tüm IAM kullanıcılarının bir hizmete erişmesini engelle" → AWS Organizations'da SCP

---

**Görev 1.2 — Güvenli iş yükleri ve uygulamalar tasarlama**

Temel kavramlar: VPC tasarımı, security group'lar ve NACL'ler, ağ izolasyonu, DDoS koruması, WAF, GuardDuty.

| Bölüm      | Konu                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| Bölüm 11   | VPC tasarımı: genel/özel alt ağlar, NAT Gateway, Internet Gateway, yönlendirme tabloları    |
| Bölüm 15   | Security group'lar (durum bilgili, örnek düzeyi) ve NACL'ler (durum bilgisiz, alt ağ düzeyi) |
| Bölüm 17   | Shield (DDoS), WAF (uygulama güvenlik duvarı), GuardDuty (tehdit algılama), Inspector (CVE taraması) |
| Bölüm 17   | Macie: S3'te hassas veri keşfi (PII, kimlik bilgileri)                                      |
| Bölüm 25   | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

Anahtar sınav kalıpları:

- "Belirli bir IP'yi alt ağdan engelle" → NACL reddetme kuralı
- "HTTP'yi içeri al, HTTP yanıtını otomatik olarak dışarı izin ver" → Security group (durum bilgili)
- "Web uygulamasını SQL injection'dan koru" → SQL injection kurallı WAF
- "Ele geçirilmiş IAM kimlik bilgilerini algıla" → GuardDuty

---

**Görev 1.3 — Uygun veri güvenliği kontrollerini belirleme**

Temel kavramlar: Durağan ve aktarımda şifreleme, KMS, Secrets Manager, Parameter Store, S3 sunucu tarafı şifreleme.

| Bölüm      | Konu                                                                      |
|------------|--------------------------------------------------------------------------|
| Bölüm 16   | KMS: müşteri tarafından yönetilen anahtarlar, anahtar rotasyonu, zarf şifreleme |
| Bölüm 16   | Secrets Manager: otomatik kimlik bilgisi rotasyonu, çalışma zamanında gizli bilgi alma |
| Bölüm 16   | ACM (AWS Certificate Manager): ALB, CloudFront için SSL/TLS sertifikaları |
| Bölüm 5    | S3 şifreleme seçenekleri: SSE-S3, SSE-KMS, SSE-C                          |
| Bölüm 8    | RDS durağan şifreleme (oluşturma sırasında etkinleştirilmeli)            |

Anahtar sınav kalıpları:

- "Veritabanı kimlik bilgilerini otomatik döndür" → RDS entegrasyonlu Secrets Manager
- "Hesaplar arasında şifreleme anahtarlarını kimin kullanabileceğini kontrol et" → KMS key policy
- "Gizli olmayan yapılandırma değerlerini sakla" → SSM Parameter Store (Secrets Manager değil)
- "S3 nesnelerini şirket tarafından yönetilen anahtarlarla şifrele" → CMK ile SSE-KMS

---

## Alan 2: Dayanıklı Mimariler Tasarlama (%26)

**Görev 2.1 — Ölçeklenebilir ve gevşek bağlı mimariler tasarlama**

Temel kavramlar: Auto Scaling, yük dengeleyiciler, SQS/SNS ayrıştırma, Lambda olay tetikleyicileri, ECS/EKS, Step Functions.

| Bölüm      | Konu                                                              |
|------------|-------------------------------------------------------------------|
| Bölüm 7    | Auto Scaling Group'lar, Application Load Balancer, ölçekleme politikaları |
| Bölüm 19   | SQS (kuyruklarla ayrıştırma), SNS (fan-out bildirimleri)          |
| Bölüm 20   | Lambda: sunucusuz hesaplama, olay tetikleyicileri, eş zamanlılık  |
| Bölüm 20   | API Gateway: yönetilen REST/HTTP/WebSocket API'leri, tek başına veya + Lambda |
| Bölüm 21   | ECS ve EKS: konteynerli mikroservisler                            |
| Bölüm 22   | Step Functions: iş akışı orkestrasyonu                            |
| Bölüm 26   | Kinesis: gerçek zamanlı veri akışı                                |

Anahtar sınav kalıpları:

- "Sipariş işlemeyi envanter güncellemesinden ayrıştır" → hizmetler arasında SQS kuyruğu
- "Yeni bir sipariş verildiğinde birden fazla hizmeti bilgilendir" → SQS abonelikli SNS konusu (fan-out)
- "S3 yüklemelerini otomatik işle" → S3 olay bildirimi → Lambda
- "Yeniden deneme mantığıyla çok adımlı bir iş akışı çalıştır" → Step Functions

---

**Görev 2.2 — Yüksek kullanılabilir ve/veya hata toleranslı mimariler tasarlama**

Temel kavramlar: Multi-AZ, Multi-Region, Route 53 failover, RDS read replica'lar, Aurora Global Database, yedekle ve geri yükle.

| Bölüm      | Konu                                                                                         |
|------------|----------------------------------------------------------------------------------------------|
| Bölüm 2    | AWS küresel altyapısı: Region'lar, AZ'ler, kenar konumları                                   |
| Bölüm 7    | Birden fazla AZ'de ALB, ASG sağlıksız örnekleri değiştirir                                   |
| Bölüm 8    | RDS Multi-AZ: eş zamanlı çoğaltma, otomatik yük devretme                                     |
| Bölüm 12   | Route 53: failover yönlendirme, gecikme yönlendirme, sağlık kontrolleri                      |
| Bölüm 18   | Multi-AZ ve Multi-Region: RTO/RPO, DR stratejileri (pilot light, warm standby, active-active) |
| Bölüm 18   | AWS Backup (merkezi, hesaplar arası yedeklemeler), Elastic Disaster Recovery (yönetilen pilot light) |
| Bölüm 24   | Aurora Global Database: bölgeler arası read replica'lar, < 1 sn çoğaltma gecikmesi          |

Anahtar sınav kalıpları:

- "Birincil RDS arızalanırsa otomatik yük devret" → RDS Multi-AZ (Read Replica değil)
- "Küresel olarak düşük gecikmeyle okuma sun" → Aurora Global Database
- "Birincil kullanılamazsa trafiği ikincil bölgeye yönlendir" → Failover yönlendirme + sağlık kontrollü Route 53
- "RTO 1 dakika, RPO 0" → Multi-AZ dağıtımı (Multi-Region değil)
- "RTO 15 dakika, bölgeler arası" → Pilot Light stratejisi

---

## Alan 3: Yüksek Performanslı Mimariler Tasarlama (%24)

**Görev 3.1 — Yüksek performanslı ve/veya ölçeklenebilir depolama çözümleri belirleme**

Temel kavramlar: S3 ve EBS ve EFS, depolama sınıfı seçimi, S3 Transfer Acceleration, multipart upload, varlıklar için CloudFront.

| Bölüm      | Konu                                                                   |
|------------|-------------------------------------------------------------------------|
| Bölüm 5    | S3: nesne depolama, depolama sınıfları, sürümleme, yaşam döngüsü        |
| Bölüm 6    | EBS: blok depolama tipleri (gp3, io2, st1), EFS: paylaşımlı dosya depolama |
| Bölüm 6    | Storage Gateway: hibrit şirket içinden S3'e köprü (File, Volume, Tape)   |
| Bölüm 23   | S3 depolama sınıfı geçişleri, Glacier getirme seçenekleri               |
| Bölüm 25   | DataSync (çevrimiçi dosya senkronizasyonu), Transfer Family (yönetilen SFTP→S3), Snow Family (çevrimdışı toplu transfer — eski: Kasım 2025'te yeni müşterilere kapatıldı; AWS artık DataSync ve Data Transfer Terminals'a yönlendiriyor), MGN (sunucu rehost) |
| Bölüm 28   | EBS doğru boyutlandırma, gp2→gp3 geçişi, anlık görüntü yönetimi          |

Anahtar sınav kalıpları:

- "Birden fazla EC2 örneğinden erişilebilen paylaşımlı dosya sistemi" → EFS (EBS değil; EBS tek bir örneğe bağlanır)
- "Veritabanı iş yükü için yüksek IOPS" → io2 EBS
- "90 gündür erişilmeyen dosyalar için maliyeti azalt" → S3 yaşam döngüsü politikası → Glacier
- "Uzak konumlardan büyük dosyaları daha hızlı yükle" → S3 Transfer Acceleration
- "Sınırlı bant genişliğinde haftalarca transfer" → SAA-C03 sınavı, Snow Family'nin 2025'te yeni müşterilere kapanmasına rağmen hâlâ Snowball'u bekliyor

---

**Görev 3.2 — Yüksek performanslı ve/veya ölçeklenebilir hesaplama çözümleri belirleme**

Temel kavramlar: EC2 örnek aileleri, Graviton işlemcileri, Auto Scaling, Lambda, Fargate, Spot Instances.

| Bölüm      | Konu                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Bölüm 4    | EC2 örnek tipleri: hesaplama odaklı (c), bellek odaklı (r), genel amaçlı (m, t)         |
| Bölüm 7    | Auto Scaling: web katmanları için yatay ölçekleme                                       |
| Bölüm 20   | Lambda: eş zamanlılık, tedarik edilmiş eş zamanlılık (tutarlı gecikme için)             |
| Bölüm 21   | ECS Fargate: sunucusuz konteynerler                                                     |
| Bölüm 21   | AWS Batch: Docker konteynerleri için yönetilen toplu hesaplama, Spot destekli           |
| Bölüm 27   | Hata toleranslı toplu iş yükleri için Spot Instances                                    |

Anahtar sınav kalıpları:

- "ML eğitimi iş yükü, maliyeti en aza indir, kesintiye uğrayabilir" → Spot Instances
- "Tutarlı 100 ms altı Lambda yanıtı" → Tedarik edilmiş eş zamanlılık (soğuk başlangıcı ortadan kaldırır)
- "Konteynerli mikroservis, altyapı yönetimi yok" → ECS Fargate

---

**Görev 3.3 — Yüksek performanslı veritabanı çözümleri belirleme**

Temel kavramlar: RDS ve DynamoDB ve Aurora ve Redshift ve ElastiCache, erişim kalıpları, read replica'lar, DAX.

| Bölüm      | Konu                                                              |
|------------|-------------------------------------------------------------------|
| Bölüm 8    | RDS: yönetilen ilişkisel veritabanları, ne zaman RDBMS kullanılır |
| Bölüm 9    | DynamoDB: NoSQL, partition key'ler, GSI, DAX (bellek içi önbellek) |
| Bölüm 10   | ElastiCache: Redis ve Memcached, önbellek stratejileri            |
| Bölüm 10   | MemoryDB for Redis: dayanıklı, Redis uyumlu birincil veritabanı    |
| Bölüm 24   | Aurora: performans, Serverless v2, read replica'lar, Global Database |
| Bölüm 29   | DynamoDB on-demand ve Auto Scaling ile provisioned kapasite       |

Anahtar sınav kalıpları:

- "Oturum deposu için mikrosaniye okumalar" → ElastiCache Redis veya DAX (DynamoDB arka uçluysa)
- "Esnek şemalı yüksek verimli anahtar-değer erişimi" → DynamoDB
- "Karmaşık birleştirmeler (joins) ve ACID işlemleri" → Aurora veya RDS
- "Petabaytlarca yapılandırılmış veri üzerinde analitik" → Redshift (detaylı ele alınmadı ama ipucu: "veri ambarı" → Redshift)

---

**Görev 3.4 — Yüksek performanslı ve/veya ölçeklenebilir ağ mimarileri belirleme**

Temel kavramlar: CloudFront, Global Accelerator, Direct Connect, VPN, yerleşim grupları, gelişmiş ağ (enhanced networking).

| Bölüm      | Konu                                                              |
|------------|-------------------------------------------------------------------|
| Bölüm 7    | NLB (Katman 4) ve GWLB (ağ cihazları için Gateway Load Balancer)  |
| Bölüm 11   | Client VPN: bireysel cihazdan VPC'ye şifreli erişim               |
| Bölüm 12   | Route 53: yönlendirme politikaları: gecikme tabanlı, geolocation, ağırlıklı |
| Bölüm 13   | CloudFront: CDN, kenar önbellekleme, Lambda@Edge                  |
| Bölüm 25   | AWS Global Accelerator: AWS omurgasına Anycast yönlendirme        |
| Bölüm 25   | Direct Connect: özel ayrılmış bağlantı                            |
| Bölüm 30   | VPC Endpoints: AWS hizmetlerine özel bağlantı                     |

Anahtar sınav kalıpları:

- "Dinamik API yanıtlarına erişen küresel kullanıcılar için gecikmeyi azalt" → Global Accelerator (CloudFront değil, ki o önbelleğe alınabilir içerik için en iyisidir)
- "Statik varlıklar için gecikmeyi küresel olarak azalt" → CloudFront
- "Şirket içinden AWS'ye tutarlı özel bağlantı" → Direct Connect
- "Dünya çapındaki müşterilerden S3 bucket'ınıza hızlı yükleme" → S3 Transfer Acceleration

---

**Görev 3.5 — Yüksek performanslı veri alımı ve dönüştürme çözümleri belirleme**

Temel kavramlar: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Bölüm      | Konu                                                               |
|------------|---------------------------------------------------------------------|
| Bölüm 26   | Kinesis Data Streams: gerçek zamanlı sıralı olay işleme            |
| Bölüm 26   | Amazon Data Firehose (eski adıyla Kinesis Data Firehose): S3, Redshift, OpenSearch'e yönetilen teslimat |
| Bölüm 26   | AWS Glue: sunucusuz ETL, Data Catalog, Crawler'lar                  |
| Bölüm 26   | Athena: S3'te sunucusuz SQL                                        |
| Bölüm 26   | QuickSight: yönetilen BI panoları, SPICE bellek içi motoru          |
| Bölüm 26   | Lake Formation: ince ayrıntılı veri gölü erişim kontrolü            |

Anahtar sınav kalıpları:

- "Clickstream verisini gerçek zamanlı işle" → Kinesis Data Streams + Lambda veya Managed Service for Apache Flink (eski adıyla Kinesis Data Analytics)
- "Akış verisini sonradan analiz için S3'e teslim et" → Amazon Data Firehose
- "Birden fazla kaynaktan veriyi dönüştür ve katalogla" → AWS Glue
- "S3'te saklanan geçmiş veriyi SQL ile sorgula" → Athena

---

## Alan 4: Maliyet Optimize Edilmiş Mimariler Tasarlama (%20)

**Görev 4.1 — Maliyet optimize edilmiş depolama çözümleri tasarlama**

| Bölüm      | Konu                                                              |
|------------|-------------------------------------------------------------------|
| Bölüm 23   | S3 yaşam döngüsü politikaları, depolama sınıfı geçişleri           |
| Bölüm 28   | EBS doğru boyutlandırma, gp2→gp3 geçişi, S3 sürümleme yaşam döngüsü kuralları |
| Bölüm 28   | EFS Intelligent-Tiering, maliyet tahsis etiketleri, AWS Budgets    |

Anahtar sınav kalıpları:

- "Hangi ekibin en çok S3 maliyeti ürettiğini belirle" → Maliyet tahsis etiketleri + Cost Explorer
- "Seyrek erişilen nesneler için maliyetleri otomatik azalt" → S3 Intelligent-Tiering
- "Aylık maliyetler 10.000 $'ı aştığında uyar" → AWS Budgets

---

**Görev 4.2 — Maliyet optimize edilmiş hesaplama çözümleri tasarlama**

| Bölüm      | Konu                                                                            |
|------------|----------------------------------------------------------------------------------|
| Bölüm 2    | Outposts: şirket içi AWS rafı (sermaye maliyeti ve bulut opex dengesi)           |
| Bölüm 2    | Wavelength: 5G kenar hesaplama (telekom iş birliği, gecikme odaklı yerleşim)      |
| Bölüm 27   | EC2 fiyatlandırması: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Bölüm 20   | Lambda: çağrı başına ödeme (sıfır boşta maliyet)                                 |

Anahtar sınav kalıpları:

- "Sabit durumlu üretim iş yükleri için maliyeti azalt" → Savings Plans (daha esnek) veya Reserved Instances
- "Kesintiye uğrayabilen toplu işler için maliyeti en aza indir" → Spot Instances
- "Sıfır boşta maliyetle olay odaklı işleme" → Lambda

---

**Görev 4.3 — Maliyet optimize edilmiş veritabanı çözümleri tasarlama**

| Bölüm      | Konu                                              |
|------------|---------------------------------------------------|
| Bölüm 29   | DynamoDB on-demand ve provisioned + Auto Scaling  |
| Bölüm 29   | RDS ve ElastiCache Reserved Instances/Nodes       |
| Bölüm 29   | RDS anlık görüntü yönetimi                         |

Anahtar sınav kalıpları:

- "Öngörülemeyen DynamoDB trafiği" → On-demand kapasite modu
- "Bilinen tepe noktalarıyla tutarlı DynamoDB trafiği" → Provisioned + Auto Scaling
- "Kararlı iş yükü için RDS maliyetlerini azalt" → Reserved Instances (1 veya 3 yıl)

---

**Görev 4.4 — Maliyet optimize edilmiş ağ mimarileri tasarlama**

| Bölüm      | Konu                                                                                          |
|------------|-----------------------------------------------------------------------------------------------|
| Bölüm 30   | Veri transferi fiyatlandırması: gelen (ücretsiz), AZ'ler arası (0,01 $/GB), bölgeler arası, internet (0,09 $/GB) |
| Bölüm 30   | NAT Gateway (0,045 $/GB) ve VPC Endpoints (Gateway: ücretsiz; Interface: ücretli)             |
| Bölüm 30   | Veri transferi maliyet optimize edici olarak CloudFront                                       |

Anahtar sınav kalıpları:

- "Özel alt ağdaki EC2, S3'ü çağırır — NAT Gateway maliyetlerini ortadan kaldır" → S3 Gateway Endpoint (ücretsiz)
- "Özel alt ağdaki EC2, SQS'i çağırır — NAT Gateway maliyetlerini azalt" → SQS Interface Endpoint
- "Küresel içerik dağıtımı için veri transfer maliyetlerini azalt" → CloudFront (önbellekleme kaynak isteklerini azaltır)

---

## Alanlar Arası Konular

Bazı konular birden fazla alanda görünür:

| Konu                               | Alanlar | Bölümler     |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | Tümü    | 31           |
| Mimari incelemeler ve ADR'ler      | Tümü    | 32           |
| Dengeleme akıl yürütmesi ("duruma bağlı") | Tümü | 33         |
| Multi-AZ tasarımı                  | 2, 3    | 7, 8, 18, 24 |
| İzleme ve gözlemlenebilirlik       | 1, 2    | Kitap boyunca |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Sınav Öncesi Kontrol Listesi

SAA-C03'e girmeden önce:

**Yüksek ağırlıklı alanlar (görünme olasılığı en yüksek)**

- [ ] IAM politika değerlendirme mantığı (açık reddetme → açık izin → örtük reddetme)
- [ ] VPC bileşenleri: alt ağlar, yönlendirme tabloları, IGW, NAT Gateway, security group'lar, NACL'ler
- [ ] S3 depolama sınıfları ve her birinin ne zaman kullanılacağı
- [ ] RDS Multi-AZ ve Read Replica (yük devretme ve okuma ölçeklemesi)
- [ ] SQS ve SNS ve EventBridge (çekme ve itme ve olay yönlendirme)
- [ ] EC2 fiyatlandırma modelleri: hata toleranslı için Spot, taahhütlü iş yükleri için Savings Plans
- [ ] Lambda tetikleyicileri ve eş zamanlılık
- [ ] DynamoDB ve Aurora ve Redshift (erişim kalıbı seçimi belirler)
- [ ] CloudFront: statik için CDN, dinamik için Global Accelerator

**Yaygın tuzaklar**

- [ ] EBS BİR örneğe bağlanır; EFS paylaşımlıdır
- [ ] RDS Read Replica'lar okuma ölçeklemesi içindir, otomatik yük devretme DEĞİL (bu Multi-AZ'dir)
- [ ] NACL'ler durum bilgisizdir (hem gelen hem giden kural gerektirir)
- [ ] Gateway Endpoint'ler ücretsizdir ve yalnızca S3 ve DynamoDB içindir
- [ ] Kinesis saklar ve yeniden oynatır; SQS tüketimde siler
- [ ] "Ayrıştırma" her zaman SQS anlamına gelmez — SNS fan-out ve EventBridge de ayrıştırma kalıplarıdır
- [ ] Shield Standard ücretsiz ve otomatiktir; Advanced ücretli bir aboneliktir
- [ ] ElastiCache ve MemoryDB: ElastiCache = önbellek (veri kaybı sorun değil). MemoryDB = dayanıklı birincil veritabanı.
- [ ] Client VPN ve Site-to-Site VPN: Client VPN = bireysel cihazlar. Site-to-Site = ağdan ağa.
- [ ] Outposts ve Wavelength: Outposts = şirket içi AWS rafı. Wavelength = 5G kenarı.
- [ ] DMS: homojen = doğrudan DMS. Heterojen = önce SCT, sonra DMS.
- [ ] DataSync *dosyaları* taşır; DMS *veritabanlarını* taşır; MGN *bütün sunucuları* taşır.

**Sınav yapısı**

- 65 soru, 130 dakika (2 saat 10 dakika)
- Çoktan seçmeli (bir doğru) ve çoklu yanıt (N doğru seçin)
- Geçme puanı: 1000 üzerinden 720
- Puanlanmayan sorular gömülüdür; hangileri olduğunu söyleyemezsiniz
- Zamanı yönet: soru başına ~2 dakika; zor olanları işaretleyin ve geri dönün
