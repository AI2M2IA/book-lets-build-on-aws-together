# Ek C: Kavram Dizini

Kitapta tanıtılan her anahtar kavram; bölümüne, kullanılan benzetmeye ve göründüğü SAA-C03 alanına eşlenmiştir.

Bunu bir çalışma dizini olarak kullanın: sınavdan önce bir kavram konusunda kafanız karışıksa, burada bulun ve bağlam için bölümüne geri dönün.

---

## A

**ACM (AWS Certificate Manager)** — ALB, CloudFront ve API Gateway için ücretsiz genel TLS sertifikaları, DNS doğrulaması yoluyla otomatik yenileme ile. CloudFront sertifikaları us-east-1'de yaşamalıdır. Bölüm 16. Alan 1.

**ACU (Aurora Capacity Unit)** — Aurora Serverless v2 kapasitesinin ölçüm birimi. Otomatik olarak ölçeklenir ve desteklenen motor sürümlerinde, açık bağlantı tutulmadığında 0 ACU'ya otomatik duraklayabilir. Bölüm 24. Alan 3.

**Alarm (CloudWatch)** — Bir metrik bir eşiği aştığında tetiklenen, bir bildirim veya otomatik ölçekleme eylemi başlatan bir kural. Bölüm 7. Alan 2.

**ALB (Application Load Balancer)** — HTTP/HTTPS trafiğini yol ve host kurallarına göre yönlendiren Katman 7 yük dengeleyici. Bölüm 7. Alan 2.

**AMI (Amazon Machine Image)** — Bir EC2 örneği için işletim sistemini, yazılımı ve yapılandırmayı içeren bir şablon. Bölüm 4. Alan 3.

**Mimar zihniyeti** — Yalnızca "bu nasıl çalışır?" yerine "ilk önce ne bozulur, bunu nasıl anlarız ve sabah 3'te biri ne yapar?" diye sormak. Bölüm 32, Bölüm 34. Alanlar arası.

**Architecture Decision Record (ADR)** — Bir kararı, alternatiflerini, gerekçesini ve neyin yeniden değerlendirmeye yol açacağını yakalayan kısa bir belge. Bölüm 32. Alanlar arası.

**Mimari inceleme** — Şunları kapsayan yapılandırılmış bir süreç: kısıtlamalar → bilinmeyenler → seçenekler → arıza modları → izleme → runbook'lar. Bölüm 32. Alanlar arası.

**Athena** — S3'teki veriler için sunucusuz SQL sorgu hizmeti. Taranan TB başına ödeme. Parquet/ORC sütunlu formatlarıyla en iyisi. Bölüm 26. Alan 3.

**Auto Scaling Group (ASG)** — Birlikte yönetilen, sağlıksız örnekleri otomatik olarak değiştiren ve yüke göre ölçeklenen bir EC2 örnek grubu. Bölüm 7. Alan 2, 3.

**Availability Zone (AZ)** — Bir bölge içinde, düşük gecikmeli bağlantılarla bağlanan, fiziksel olarak ayrı bir veya daha fazla veri merkezi. Bölüm 2. Alan 2.

---

## B

**AWS Backup** — EBS, RDS, DynamoDB, EFS ve Storage Gateway genelinde merkezi, politika tabanlı yedekleme. Bölgeler arası ve hesaplar arası kopyaları destekler. Bölüm 18, 23. Alan 2.

**AWS Batch** — Docker konteynerleri için yönetilen toplu hesaplama. Bir job definition (ne çalıştırılacak), bir job queue (işlerin beklediği yer) ve bir compute environment'tan (EC2 veya Fargate, On-Demand veya Spot) oluşur. Lambda'nın 15 dakikalık sınırını aşan iş yükleri için. Bölüm 21. Alan 3.

**Bucket (S3)** — S3 nesneleri için bir kapsayıcı. Bucket'ların benzersiz küresel adları vardır ve belirli bir bölgede yaşarlar. Bölüm 5. Alan 3.

**Bucket policy** — IAM principal'ları ve harici hesaplar için erişimi kontrol eden, bir S3 bucket'ına eklenmiş kaynak tabanlı bir politika. Bölüm 5. Alan 1.

---

## C

**Cache-aside deseni** — Uygulama önce önbelleği kontrol eder; isabetsizlikte (miss) veritabanını sorgular, ardından sonucu önbellekte saklar. Bölüm 10. Alan 3.

**Önbellek isabet oranı (cache hit rate)** — İsteklerin kaynak yerine önbellekten sunulma yüzdesi. Yüksek daha iyidir. Bölüm 13. Alan 3.

**AWS Client VPN** — Yönetilen OpenVPN uç noktası. Bireysel cihazları (dizüstü bilgisayarlar, iş istasyonları) internet üzerinden bir VPC'ye bağlar. Active Directory, bir kimlik sağlayıcı ile SAML 2.0 federasyonu veya karşılıklı TLS yoluyla kimlik doğrulama. Split-tunnel ve full-tunnel modlarını destekler. Site-to-Site VPN (ağdan ağa) ile karşılaştırın. Bölüm 11. Alan 1.

**CloudFront** — AWS CDN. İçeriği dünya çapında 750+ kenar konumunda önbelleğe alır. Gecikmeyi ve kaynak veri transferi maliyetlerini azaltır. Bölüm 13. Alan 3, 4.

**CloudTrail** — Her AWS API çağrısını kaydeder: kim, ne, ne zaman, nereden. S3'te saklanır. Denetim ve olay araştırması için kullanılır. Alan 1.

**CloudWatch** — AWS kaynakları ve özel uygulamalar için metrikler, günlükler, alarmlar ve panolar. Kitap boyunca atıfta bulunulan. Tüm alanlar.

**Amazon Cognito** — Uygulamanızın son kullanıcıları için kimlik doğrulama: User Pool'lar yönetilen bir kullanıcı dizinidir (kaydolma, oturum açma, MFA, sosyal giriş, JWT'ler); Identity Pool'lar geçici AWS kimlik bilgileri verir. IAM mühendisleriniz içindir; Cognito müşterileriniz içindir. Bölüm 14. Alan 1.

**Soğuk başlangıç (cold start) (Lambda)** — Lambda yürütme ortamını başlatırken ilk çağrıda (veya hareketsizlikten sonra) gecikme. Ortadan kaldırmak için tedarik edilmiş eş zamanlılık kullanın. Bölüm 20. Alan 3.

**Compute Savings Plan** — Herhangi bir örnek tipine veya boyutuna uygulanan, saatlik EC2 harcamasının bir dolar miktarına taahhüt. Bölüm 27. Alan 4.

**Config (AWS)** — AWS kaynaklarındaki yapılandırma değişikliklerini zaman içinde izler ve uyumluluğu kurallara göre değerlendirir. Bölüm 31. Alan 1.

**AWS Control Tower** — Çok hesaplı yönetişimi otomatikleştirir: dakikalar içinde korkuluklarla bir landing zone (yönetim, log arşivi ve denetim hesapları) oluşturur — Organizations, CloudTrail ve Config'i elle bağlamanın hazır sürümü. Bölüm 14. Alan 1.

**AZ'ler arası veri transferi (cross-AZ)** — Bir bölge içindeki Availability Zone'lar arasındaki trafik. Her yönde 0,01 $/GB ücretlendirilir. Bölüm 30. Alan 4.

**Bölgeler arası çoğaltma (cross-region replication)** — Veriyi (S3 CRR, Aurora Global, DynamoDB Global Tables) farklı bir bölgeye kopyalama. Veri transferi ücretleri doğurur. Bölüm 18, 23, 30. Alan 2.

---

## D

**AWS DataSync** — Dosya paylaşımlarının (NFS/SMB) S3, EFS veya FSx'e ajan tabanlı geçişi ve senkronizasyonu. "Steroidli rsync, bir AWS konsolu ile." Bölüm 25. Alan 3.

**DAX (DynamoDB Accelerator)** — Özellikle DynamoDB için bellek içi önbellek. Mikrosaniye okuma gecikmesi. Bölüm 9. Alan 3.

**Dead Letter Queue (DLQ)** — İşlemesi tekrar tekrar başarısız olan mesajların gönderildiği bir kuyruk; kuyruk tıkanmasını önler. Bölüm 19. Alan 2.

**AWS DMS (Database Migration Service)** — Veritabanlarını minimum kesinti süresiyle AWS'ye taşır. Tam yükleme (full load, ilk kopya) artı CDC (Change Data Capture) geçiş sırasında kaynağı ve hedefi senkronize tutar. Homojen geçişler (aynı motor tipi): doğrudan DMS kullanın. Heterojen geçişler (farklı motor tipleri, ör. Oracle → Aurora PostgreSQL): önce SCT (Schema Conversion Tool), sonra DMS. Bölüm 8. Alan 3.

**Dedicated Host** — Yalnızca sizin kullanımınız için ayrılmış fiziksel bir EC2 sunucusu. Belirli yazılım lisansları için gereklidir. Bölüm 27. Alan 4.

**Derinlemesine savunma (defense in depth)** — Bir katmanın ele geçirilmesinin sistemi açığa çıkarmaması için birden fazla güvenlik kontrolünü (IAM + security group'lar + NACL'ler + WAF + GuardDuty) katmanlama. Bölüm 33. Alan 1.

**Direct Connect** — Şirket içi bir konumdan AWS'ye özel ayrılmış bir ağ bağlantısı. VPN'den daha tutarlı. Bölüm 25. Alan 3.

**DLQ** — Bkz. Dead Letter Queue.

**DynamoDB** — Herhangi bir ölçekte tek haneli milisaniye gecikmeli, tamamen yönetilen NoSQL veritabanı. Anahtar-değer ve belge modeli. Bölüm 9. Alan 3.

**DynamoDB Auto Scaling** — CloudWatch metriklerine göre provisioned okuma/yazma kapasitesini otomatik olarak ayarlar. Bölüm 29. Alan 4.

**DynamoDB Streams** — Bir DynamoDB tablosundaki tüm öğe değişikliklerinin zaman sıralı bir değişiklik günlüğü. Olay odaklı işleme için Lambda ile kullanılır. Bölüm 9. Alan 2.

---

## E

**EBS (Elastic Block Store)** — Tek bir EC2 örneğine bağlı blok depolama. Bağımsız olarak kalıcı olur. Tipler: gp3, io2, st1. Bölüm 6. Alan 3.

**EC2 (Elastic Compute Cloud)** — Bulutta sanal makineler. Bölüm 4. Alan 3.

**ECS (Elastic Container Service)** — Yönetilen konteyner orkestrasyonu. Fargate başlatma tipi sunucu yönetimini ortadan kaldırır. Bölüm 21. Alan 2, 3.

**EFS (Elastic File System)** — Birden fazla EC2 örneğinden erişilebilen paylaşımlı NFS dosya sistemi. Otomatik olarak ölçeklenir. Depolama sınıfları arasında Standard, Infrequent Access ve Archive bulunur, katmanlar arası otomatik hareket için Intelligent-Tiering ile. Bölüm 6. Alan 3.

**EKS (Elastic Kubernetes Service)** — AWS'de yönetilen Kubernetes kontrol düzlemi. Bölüm 21. Alan 3.

**Elastic Disaster Recovery (DRS)** — Sunucuların (şirket içi veya EC2) düşük maliyetli bir hazırlama alanına sürekli blok düzeyi çoğaltması, dakikalar içinde başlatılan kurtarma örnekleriyle — yönetilen bir pilot light. Bölüm 18. Alan 2.

**ElastiCache** — Yönetilen bellek içi önbellekleme. Redis (daha zengin özellikler) veya Memcached (daha basit). Bölüm 10. Alan 3.

**Elastic IP** — EC2 örneklerine tahsis edip yeniden ilişkilendirebileceğiniz statik bir genel IP adresi. Bölüm 11. Alan 3.

**Zarf şifreleme (envelope encryption)** — Verinin bir veri anahtarı (DEK) ile şifrelendiği ve DEK'nin bir ana anahtar (KMS'de CMK) ile şifrelendiği bir desen. Bölüm 16. Alan 1.

**EventBridge** — AWS hizmetlerinden, SaaS iş ortaklarından ve özel kaynaklardan gelen olayları hedeflere yönlendirmek için olay veri yolu. Planlı kuralları destekler. Bölüm 22. Alan 2.

**Açık reddetme (explicit deny)** — Hiçbir izin tarafından geçersiz kılınamayan bir IAM reddetme ifadesi. Tüm izinlere önceliklidir. Bölüm 3. Alan 1.

---

## F

**Failover yönlendirme (Route 53)** — Birincil endpoint sağlık kontrollerinde başarısız olduğunda trafiği ikincil bir uç noktaya yönlendirir. Bölüm 12. Alan 2.

**Fargate** — ECS ve EKS için sunucusuz hesaplama motoru. Yönetilecek EC2 örneği yok. Bölüm 21. Alan 3.

**Fan-out deseni** — Bir SNS konusu aynı mesajı aynı anda birden fazla SQS kuyruğuna teslim eder. Bölüm 19. Alan 2.

**FIFO queue (SQS)** — Tam olarak bir kez işleme, katı sıralama. Standard kuyruklardan daha düşük verim. Bölüm 19. Alan 2.

**Arıza modu (failure mode)** — Bir sistemin başarısız olabileceği belirli bir yol. Üretimden önce arıza modlarını belirlemek, mimari incelemenin özüdür. Bölüm 32. Alanlar arası.

---

## G

**Gateway Endpoint** — S3 ve DynamoDB için ücretsiz bir VPC endpoint tipi. Trafiği AWS özel ağı üzerinden yönlendirir, NAT Gateway ücretlerini ortadan kaldırır. Bölüm 30. Alan 4.

**Gateway Load Balancer (GWLB)** — Üçüncü taraf sanal ağ cihazlarını (güvenlik duvarları, IDS/IPS) trafik akışlarına satır içi eklemek için Katman 3 yük dengeleyici. Bölüm 7. Alan 1.

**Geolocation yönlendirme (Route 53)** — DNS sorgusu kaynağının coğrafi konumuna göre yönlendirir. Bölüm 12. Alan 3.

**Global Accelerator** — Trafiği Anycast yoluyla en yakın AWS kenarına yönlendirir, dinamik uygulamalar için gecikmeyi iyileştirir. Bölüm 25. Alan 3.

**Glue (AWS)** — Sunucusuz ETL. Glue Crawler'lar şemayı keşfeder; Glue Job'lar veriyi dönüştürür; Data Catalog meta verileri saklar. Bölüm 26. Alan 3.

**GSI (Global Secondary Index)** — Farklı bir partition key ve isteğe bağlı bir sort key ile bir DynamoDB tablosunda alternatif bir dizin. Esnek sorgu kalıplarını mümkün kılar. Bölüm 9. Alan 3.

**GuardDuty** — Olağandışı etkinliği algılamak için CloudTrail, VPC Flow Logs ve DNS günlüklerinde ML kullanan tehdit algılama hizmeti. Bölüm 17. Alan 1.

---

## H

**Sağlık kontrolü (health check) (Route 53)** — Uç nokta kullanılabilirliğini izler. Başarısız sağlık kontrolleri failover yönlendirmeyi tetikler. Bölüm 12. Alan 2.

**Hot partition (DynamoDB)** — Birçok isteğin aynı partition key'i paylaşması nedeniyle orantısız trafik alan bir bölüm. Bölüm 9. Alan 3.

---

## I

**IAM (Identity and Access Management)** — AWS hesapları için kimlik doğrulama ve yetkilendirmeyi kontrol eder. Kullanıcılar, gruplar, roller, politikalar. Bölüm 3, 14. Alan 1.

**IAM rolü** — Hizmetler, kullanıcılar veya diğer hesaplar tarafından üstlenilen, geçici kimlik bilgilerine sahip bir IAM kimliği. Bölüm 3, 14. Alan 1.

**Idempotency (etkisizlik)** — Bir işlemin bir kez veya birçok kez çağrılsa da aynı sonucu üretme özelliği. Dağıtık sistemler için kritik (geri ödemeler, ödemeler, sipariş işleme). Bölüm 32. Alanlar arası.

**Idempotency anahtarı** — Bir işlem için benzersiz bir tanımlayıcı; yinelenen işlemeyi önlemek için yürütmeden önce kontrol edilir. Bölüm 32. Alanlar arası.

**Interface Endpoint (PrivateLink)** — Çoğu AWS hizmeti için bir VPC endpoint. Saat başına + GB başına ücretlendirilir. İnternet veya NAT olmadan özel bağlantı sağlar. Bölüm 30. Alan 4.

**Internet Gateway (IGW)** — Genel alt ağlardaki örneklerin internetle iletişim kurmasına olanak tanır. Alt ağın yönlendirme tablosunda IGW'ye bir yol olmasını gerektirir. Bölüm 11. Alan 3.

**"Duruma bağlı" ("It depends")** — Çoğu mimari sorunun her zaman tamamlanması gereken dürüst cevabı: "Erişim kalıbına / ölçeğe / arıza sonucuna / maliyet kısıtlamasına bağlı." Bölüm 33. Alanlar arası.

---

## K

**Kinesis Data Firehose** — Amazon Data Firehose'un eski adı: akış verilerinin S3, Redshift, OpenSearch'e yönetilen teslimatı. Tüketici yönetimi yok. Eski sınav soruları hâlâ eski adı kullanabilir. Bölüm 26. Alan 3.

**Kinesis Data Streams** — Gerçek zamanlı sıralı olay akışı. Dayanıklı, saklama penceresi içinde yeniden oynatılabilir (varsayılan 24 saat, 365 güne kadar). Shard'larla ölçülür. Bölüm 26. Alan 3.

**KMS (Key Management Service)** — Durağan şifreleme için kriptografik anahtarları oluşturur, saklar ve kontrol eder. Bölüm 16. Alan 1.

---

## L

**Lambda** — Olaylarla tetiklenen sunucusuz fonksiyonlar. Çağrı başına ve ms başına ödeme. Maksimum 15 dakikalık süre. Bölüm 20. Alan 2, 3, 4.

**Lambda@Edge** — CloudFront kenar konumlarında çalışan, istekleri ve yanıtları değiştiren Lambda fonksiyonları. Bölüm 13. Alan 3.

**AWS Lake Formation** — S3 ve Glue Data Catalog üzerine merkezi veri gölü erişim kontrol katmanı. Tablo, sütun ve satır düzeyinde ince ayrıntılı izinler sağlar. Güvenli veri gölü kurulumunu basitleştirir. Bölüm 26. Alan 3.

**Latency-based yönlendirme (Route 53)** — DNS sorgularını ölçülen en düşük gecikmeye sahip AWS bölgesine yönlendirir. Bölüm 12. Alan 3.

**Launch template** — Auto Scaling Group'lar için EC2 örnek yapılandırmasını belirten, sürümlenmiş bir şablon. Bölüm 7. Alan 3.

**En az ayrıcalık (least privilege)** — IAM en iyi uygulaması: yalnızca gereken izinleri ver, daha fazlasını değil. Bölüm 3. Alan 1.

**Yaşam döngüsü politikası (lifecycle policy) (S3)** — Nesneleri yaşa göre otomatik olarak daha ucuz depolama sınıflarına geçiren veya silen kurallar. Bölüm 23. Alan 4.

**LSI (Local Secondary Index)** — Aynı partition key'i ama farklı bir sort key'i kullanan, bir DynamoDB tablosunda alternatif bir dizin. Tablo oluşturma sırasında oluşturulmalıdır. Bölüm 9. Alan 3.

---

## M

**Amazon Macie** — S3'te hassas verilerin (PII) ML tabanlı keşfi ve maruziyet risklerinin işaretlenmesi. GuardDuty davranışı izler; Macie depolanan şeyi denetler. Bölüm 17. Alan 1.

**Memcached** — Basit, çok iş parçacıklı bellek içi önbellekleme motoru. Kalıcılık yok, veri yapıları yok. Özellikler pahasına özellikle çok iş parçacıklılığa ihtiyacınız olmadıkça Redis kullanın. Bölüm 10. Alan 3.

**Amazon MemoryDB for Redis** — Dayanıklı, Redis uyumlu, bellek içi birincil veritabanı. ElastiCache'ten farklı olarak, MemoryDB bir Multi-AZ işlem günlüğüne yazar ve veri dayanıklılığını garanti eder. Redis API uyumluluğu gerektiğinde VE veri kaybı kabul edilemez olduğunda kullanın. Bölüm 10. Alan 3.

**MGN (AWS Application Migration Service)** — Rehost/lift-and-shift: bütün sunucuların AWS'ye blok düzeyinde çoğaltılması, test başlatmaları, ardından yerel EC2 örneklerine geçiş. DataSync dosyaları taşır; DMS veritabanlarını taşır; MGN sunucuları taşır. Bölüm 25. Alan 3.

**Amazon MQ** — Standart protokolleri (AMQP, MQTT, STOMP) konuşan yönetilen ActiveMQ/RabbitMQ aracısı. Mevcut aracı iş yüklerinin kod değişikliği olmadan lift-and-shift'i için; sıfırdan mesajlaşma → SQS/SNS. Bölüm 19. Alan 2.

**Multi-AZ (RDS)** — Otomatik yük devretmeli, farklı bir AZ'de eş zamanlı yedek replika. RPO ~0, RTO ~60 saniye. Okuma ölçeklemesi için değil, yüksek kullanılabilirlik için. Bölüm 8, 18. Alan 2.

**Multi-Region** — Coğrafi yedeklilik ve küresel performans için uygulama bileşenlerini birden fazla AWS bölgesinde dağıtma. Daha yüksek karmaşıklık ve maliyet. Bölüm 18. Alan 2.

---

## N

**Network Load Balancer (NLB)** — Katman 4 (TCP/UDP/TLS) yük dengeleyici: saniyede milyonlarca istek, AZ başına statik IP, kaynak IP'yi korur. HTTP farkındalığı yok — bu ALB'nin işidir. Bölüm 7. Alan 3.

**NACL (Network Access Control List)** — Alt ağ düzeyinde durum bilgisiz güvenlik duvarı. Hem gelen hem giden kuralları gerektirir. Kurallar sayısal sırayla değerlendirilir. Bölüm 15. Alan 1.

**NAT Gateway** — Özel alt ağlardaki örneklerin internete giden bağlantılar kurmasına olanak tanır. İşlenen GB başına 0,045 $ ücretlendirir. Bölüm 11, 30. Alan 4.

---

## O

**Nesne (object) (S3)** — S3'te saklanan bir dosya. Anahtar (ad), değer (veri) ve meta veriden oluşur. Maksimum boyut 5 TB. Bölüm 5. Alan 3.

**On-Demand kapasite (DynamoDB)** — İstek başına ödeme modu. İstek başına provisioned'dan daha pahalı, ama kapasite planlaması gerekmez. Bölüm 29. Alan 4.

**On-Demand örnekler (EC2)** — Taahhüt olmadan saat başına ödeme. Maksimum esneklik, maksimum fiyat. Bölüm 27. Alan 4.

**AWS Outposts** — Bir müşterinin kendi veri merkezine veya ortak yerleşim tesisine kurulan, tamamen yönetilen bir AWS donanım rafı. Genel bulutla aynı AWS hizmetlerini, API'lerini ve araçlarını şirket içinde çalıştırır. AWS kurulumu ve yamayı yönetir; müşteri raf alanı ve güç sağlar. Veri ikametgâhı, düşük gecikmeli şirket içi iş yükleri veya bağlantısız senaryolar için. Bölüm 2. Alan 4.

---

## P

**Partition key (DynamoDB)** — Bir öğeyi hangi bölümün saklayacağını belirleyen birincil anahtar bileşeni. Eşit dağıtım için yüksek kardinaliteli bir anahtar seçin. Bölüm 9. Alan 3.

**Permission boundary** — Diğer politikalar daha fazlasını verse bile, bir IAM kimliğinin sahip olabileceği maksimum izinleri belirleyen bir IAM politikası. Bölüm 14. Alan 1.

**Placement group (yerleşim grubu)** — Gecikmeyi en aza indirmek (cluster) veya kullanılabilirliği en üst düzeye çıkarmak (spread) için EC2 örneklerinin fiziksel yerleşimini kontrol eder. Bölüm 4. Alan 3.

**PrivateLink** — AWS'de barındırılan hizmetlere özel uç noktalar oluşturmak için AWS hizmeti, Interface Endpoint'ler aracılığıyla erişilebilir. Bölüm 30. Alan 1.

**Tedarik edilmiş eş zamanlılık (provisioned concurrency) (Lambda)** — Soğuk başlangıç gecikmelerini ortadan kaldıran önceden başlatılmış yürütme ortamları. Bölüm 20. Alan 3.

**Provisioned kapasite (DynamoDB)** — Saniyede kapasite birimi cinsinden ölçülen, önceden tahsis edilmiş okuma ve yazma verimi. Öngörülebilir trafik için on-demand'den daha ucuz. Bölüm 9, 29. Alan 4.

---

## Q

**Amazon QuickSight** — Yönetilen iş zekası ve veri görselleştirme hizmeti. Hızlı pano oluşturma için veriyi önbelleğe almak üzere SPICE'ı (Super-fast, Parallel, In-memory Calculation Engine) kullanır. Athena, S3, Redshift, RDS ve diğer AWS veri kaynaklarına bağlanır. Yönetilecek BI sunucusu yok. Bölüm 26. Alan 3.

---

## R

**RDS (Relational Database Service)** — Yönetilen ilişkisel veritabanı. Yedeklemeleri, yamaları, yük devretmeyi yönetir. Bölüm 8. Alan 3.

**RDS Proxy** — Lambda/uygulama ile RDS arasında bir bağlantı havuzu yönetir, bağlantı tükenmesini önler. Bölüm 8. Alan 3.

**Read Replica (RDS)** — Okuma ölçeklemesi için veritabanının eş zamanlı olmayan kopyası. Otomatik yük devretme SAĞLAMAZ. Bölüm 8, 24. Alan 3.

**Redis** — Önbellekleme, oturum yönetimi, gerçek zamanlı lider tabloları, pub/sub için kullanılan bellek içi veri yapısı deposu. Bölüm 10. Alan 3.

**Reserved Instance (EC2)** — İndirim karşılığında belirli bir bölgede belirli bir örnek tipini 1 veya 3 yıl kullanma taahhüdü. Bölüm 27. Alan 4.

**Route 53** — AWS DNS hizmeti ve alan adı kaydedicisi. Birden fazla yönlendirme politikasını destekler. Bölüm 12. Alan 2, 3.

**RPO (Recovery Point Objective)** — Zaman cinsinden ölçülen, kabul edilebilir maksimum veri kaybı. "Ne kadar veri kaybetmeyi göze alabiliriz?" Bölüm 18. Alan 2.

**RTO (Recovery Time Objective)** — Bir arızadan sonra hizmeti geri yüklemek için kabul edilebilir maksimum süre. "Ne kadar süre kapalı kalabiliriz?" Bölüm 18. Alan 2.

**Runbook** — Bir sistemi işletmek için, özellikle olay müdahalesi için adım adım talimatlar. "Sabah 3'te biri ne yapar?" Bölüm 32. Alanlar arası.

---

## S

**S3 Intelligent-Tiering** — S3 nesnelerini erişim kalıplarına göre erişim katmanları arasında otomatik olarak taşır. Getirme ücreti yok. Bölüm 23. Alan 4.

**S3 Select** — SQL ifadeleri kullanarak bir S3 nesnesi içeriğinin bir alt kümesini getirir, veri transferini azaltır. Eski: 2024 ortasından beri yeni müşterilere kullanılamaz — Athena artık S3'teki veriyi filtreleme ve sorgulamanın birincil yolu. Bir zamanlar önerilen alternatif olan S3 Object Lambda da artık eskidir (Kasım 2025'te yeni müşterilere kapatıldı; mevcut iş yükleri çalışmaya devam eder). Bölüm 30. Alan 4.

**Savings Plan** — İndirim karşılığında saatlik harcamanın bir dolar miktarına taahhüt eden esnek bir fiyatlandırma modeli. Reserved Instances'tan daha esnek. Bölüm 27. Alan 4.

**SCP (Service Control Policy)** — Bir OU'daki hesaplar için kullanılabilir maksimum izinleri kısıtlayan AWS Organizations politikası. Bölüm 14. Alan 1.

**Secrets Manager** — Gizli bilgileri (veritabanı parolaları, API anahtarları) saklar ve otomatik olarak döndürür. Bölüm 16. Alan 1.

**Security group** — Örnek düzeyinde durum bilgili bir sanal güvenlik duvarı. Yalnızca izin kuralları; dönüş trafiği otomatiktir. Bölüm 15. Alan 1.

**Shard (Kinesis)** — Kinesis Data Streams'teki temel verim birimi: 1 MB/sn yazma, 2 MB/sn okuma. Bölüm 26. Alan 3.

**Paylaşılan Sorumluluk Modeli (Shared Responsibility Model)** — AWS, bulutun *kendisinin* güvenliğinden (altyapı) sorumludur; siz bulutun *içindeki* güvenlikten (veri, yapılandırma, erişim) sorumlusunuz. Bölüm 1. Alan 1.

**Shield** — DDoS koruması. Standard: ücretsiz, otomatik. Advanced: ücretli, DRT desteği ve finansal koruma ile. Bölüm 17. Alan 1.

**Snow Family** — Çevrimdışı toplu veri transferi için fiziksel cihazlar (Snowball Edge: 80 TB) — otoyolda araba sürmek yerine bir kargo uçağı kiralamak. Eski (2026): Snowmobile ve Snowcone kullanımdan kaldırıldı; Snow cihazları Kasım 2025'te yeni müşterilere kapatıldı (AWS, DataSync ve Data Transfer Terminals'a yönlendiriyor), ama SAA-C03 sınavı "haftalarca transfer, sınırlı bant genişliği" için hâlâ Snowball'u bekliyor. Bölüm 25. Alan 3.

**SNS (Simple Notification Service)** — Pub/sub mesajlaşma. Mesajları tüm abonelere aynı anda iter. Fan-out deseni. Bölüm 19. Alan 2.

**Sort key (DynamoDB)** — Birincil anahtarın isteğe bağlı ikinci bileşeni. Bir bölüm içinde aralık sorgularını mümkün kılar. Bölüm 9. Alan 3.

**Spot Instances** — Boş kapasiteyi %60-90 indirimle kullanan EC2 örnekleri. 2 dakikalık uyarıyla kesintiye uğrayabilir. Yalnızca hata toleranslı iş yükleri için. Bölüm 27. Alan 4.

**SQS (Simple Queue Service)** — Yönetilen mesaj kuyruğu. Üreticileri tüketicilerden ayrıştırır. Standard (en az bir kez) ve FIFO (tam olarak bir kez) kuyruklar. Bölüm 19. Alan 2.

**Step Functions** — Sunucusuz iş akışı orkestrasyon hizmeti. AWS hizmetlerini koordine etmek için durum makineleri. Bölüm 22. Alan 2.

**AWS Storage Gateway** — Şirket içi ve bulut depolama arasındaki köprü: verileri S3, Glacier veya EBS anlık görüntülerinde saklarken yerel olarak NFS/SMB (File), iSCSI (Volume) veya sanal teyp (Tape) arabirimleri sunar. Bölüm 6. Alan 3.

---

## T

**Target tracking ölçekleme** — Hedef bir metrik değerini (ör. %60 CPU kullanımı) korumak için kapasiteyi ayarlayan Auto Scaling politikası. Bölüm 7. Alan 2.

**AWS Transfer Family** — S3 veya EFS ile desteklenen yönetilen SFTP/FTPS/FTP uç noktası. İş ortakları mevcut SFTP istemcilerini tutar; dosyalar doğrudan bucket'ınıza düşer. Bölüm 25. Alan 3.

**Transit Gateway** — Birden fazla VPC'yi ve şirket içi ağları merkezi bir ağ geçidi aracılığıyla bağlayan hub-and-spoke ağ topolojisi. Bölüm 25. Alan 3.

**TTL (Time to Live)** — DynamoDB'nin bir öğeyi otomatik olarak sildiği bir zaman damgası. Ayrıca DNS'te (çözümleyicilerin bir kaydı ne kadar süre önbelleğe aldığı) ve önbelleklemede (önbelleğe alınmış bir değerin ne kadar süre geçerli olduğu) kullanılır. Bölüm 9, 12. Alan 3.

---

## V

**VIF (Virtual Interface)** — AWS Direct Connect ile kullanılan mantıksal bağlantı. Public VIF, AWS genel uç noktalarına erişir; Private VIF, VPC kaynaklarına erişir. Bölüm 25. Alan 3.

**Görünürlük zaman aşımı (visibility timeout) (SQS)** — Alınan bir mesajın diğer tüketicilerden gizlendiği süre. Diğer tüketicilerin aynı mesajı görmesi olmadan işlemeye izin verir. Bölüm 19. Alan 2.

**VPC (Virtual Private Cloud)** — AWS'de izole edilmiş bir sanal ağ. Alt ağları, yönlendirme tablolarını ve ağ geçitlerini içerir. Bölüm 11. Alan 1.

**VPC Endpoint** — VPC kaynaklarını AWS özel ağı aracılığıyla AWS hizmetlerine bağlar. Gateway (ücretsiz, S3/DynamoDB) ve Interface (ücretli, çoğu diğer hizmet). Bölüm 30. Alan 1, 4.

**VPC Flow Logs** — Bir VPC'deki ağ arabirimlerine giden ve gelen IP trafiği hakkında bilgi yakalar. GuardDuty tarafından ve ağ sorun giderme için kullanılır. Bölüm 17. Alan 1.

**VPC Peering** — Trafiğin özel IP adresleri kullanarak aralarında yönlenmesini sağlayan, iki VPC arasında bir ağ bağlantısı. Bölüm 11. Alan 3.

---

## W

**WAF (Web Application Firewall)** — HTTP/HTTPS trafiğini kurallar kullanarak filtreler (IP blokları, SQL injection, hız sınırları). CloudFront, ALB veya API Gateway'e bağlanır. Bölüm 17. Alan 1.

**AWS Wavelength** — 5G telekomünikasyon sağlayıcılarının ağları içine radyo kenarında dağıtılan AWS altyapısı. Mobil cihazlara tek haneli milisaniye gecikme süresi sağlar. Mobil AR/VR, gerçek zamanlı oyun, otonom araç telemetrisi ve 5G kenarında canlı video için. Wavelength Zone'ları, telekom ağları içindeki AWS Region'larının uzantılarıdır. Bölüm 2. Alan 3.

**Well-Architected Framework** — AWS'nin altı sütunlu değerlendirme çerçevesi: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Bölüm 31. Alanlar arası.

**Weighted yönlendirme (Route 53)** — DNS sorgularını ağırlığa göre uç noktalar arasında dağıtır. Blue-green dağıtımları ve A/B testi için kullanılır. Bölüm 12. Alan 3.

**Write-through önbellekleme** — Veritabanı her güncellendiğinde önbelleği günceller. Veri her zaman tutarlıdır ama önbellek hiç yeniden okunmayan birçok öğe tutabilir. Bölüm 10. Alan 3.

---

## SAA-C03 Hızlı Kalıp Başvurusu

| Sınav şunu derse...                           | Şunu düşün...                                |
|-----------------------------------------------|----------------------------------------------|
| "Hizmetleri ayrıştır"                         | SQS, SNS, EventBridge                        |
| "Birden fazla tüketiciye fan-out"             | SNS + SQS abonelikleri                       |
| "Gerçek zamanlı sıralı olaylar"               | Kinesis Data Streams                         |
| "Sunucusuz"                                   | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Küresel düşük gecikme (dinamik)"             | Global Accelerator                           |
| "Küresel düşük gecikme (statik/önbellekli)"   | CloudFront                                   |
| "DDoS koruması"                               | Shield (Standard: ücretsiz; Advanced: ücretli) |
| "Kenarda SQL injection engelle"               | WAF                                          |
| "Ele geçirilmiş kimlik bilgilerini algıla"    | GuardDuty                                    |
| "API etkinliğini denetle"                     | CloudTrail                                   |
| "Veritabanı kimlik bilgilerini döndür"        | Secrets Manager                              |
| "Veriyi durağan halde şifrele, müşteri yönetimli anahtarlar" | CMK ile KMS                   |
| "Yapılandırma değerlerini sakla"              | SSM Parameter Store                          |
| "Yüksek IOPS veritabanı depolaması"           | io2 EBS                                      |
| "EC2 için paylaşımlı dosya sistemi"           | EFS                                          |
| "S3 verisini SQL ile sorgula"                 | Athena                                       |
| "Analitik için ETL boru hattı"                | AWS Glue                                     |
| "Akış verisini S3'e teslim et"                | Amazon Data Firehose                         |
| "Hata toleranslı toplu işler, maliyeti en aza indir" | Spot Instances                        |
| "Taahhütlü, kararlı üretim iş yükü"           | Savings Plans                                |
| "Özel alt ağ → NAT olmadan S3"                | S3 Gateway Endpoint                          |
| "Özel alt ağ → NAT olmadan SQS"               | SQS Interface Endpoint                       |
| "RDS için Multi-AZ"                           | Otomatik yük devretme (okuma ölçeklemesi değil) |
| "RDS için Read Replica"                       | Okuma ölçeklemesi (otomatik yük devretme değil) |
| "1-2 dakika kurtarma süresi, AZ'ler arası"    | Multi-AZ (RDS failover: 60-120 saniye)       |
| "Bölgeler arası kurtarma, dakikalar RTO"      | Pilot Light veya Warm Standby                |
| "Active-Active, sıfır RTO"                    | Multi-Region Active-Active (en karmaşık)     |
| "Lambda zaman aşımının ötesinde toplu işleme" | AWS Batch                                    |
| "Redis uyumlu VE dayanıklı"                   | MemoryDB for Redis                           |
| "Uzaktan çalışan mühendisler evden VPC'ye erişir" | Client VPN                               |
| "Minimum kesinti süresiyle veritabanı taşı"   | DMS (+ heterojen için SCT)                   |
| "AWS'de BI panosu"                            | QuickSight                                   |
| "AWS'yi kendi veri merkezinizde çalıştır"     | Outposts                                     |
| "5G mobil kenar hesaplama"                    | Wavelength                                   |
