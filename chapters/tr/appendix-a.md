# Ek A: AWS Hizmetleri Hızlı Başvuru

Bu kitapta ele alınan her hizmet, tanıtıldıkları sırayla. Bunu bir çalışma referansı ve sınav hazırlığı sırasında hızlı bir başvuru kaynağı olarak kullanın.

---

## Hesaplama (Compute)

**EC2 — Elastic Compute Cloud** *(Bölüm 4)*

Bulutta sanal makineler. Örnek tipini (CPU, bellek, depolama), işletim sistemini ve bölgeyi (region) siz seçersiniz. Saat başına (On-Demand), taahhüde göre (Reserved Instances / Savings Plans) veya boş kapasite yuvasına göre (Spot) ödeme yaparsınız. Temel hesaplama birimidir.

Anahtar kavramlar: AMI (Amazon Machine Image), örnek tipleri (t3, m6g, r6g, c6g aileleri), anahtar çiftleri (key pairs), örnek profilleri (instance profiles), yerleşim grupları (placement groups).

Sınav ipucu: Bir senaryo kalıcı, durum bilgili (stateful) veya uzun süreli hesaplama gerektirdiğinde — EC2 veya ECS. Bir senaryo kısa süreli, olay tetiklemeli veya boşta sıfır maliyetli hesaplama gerektirdiğinde — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Bölüm 7)*

Auto Scaling Group'lar (ASG'ler), yüke göre EC2 örnekleri ekler ve kaldırır. Application Load Balancer'lar (ALB'ler), trafiği örnekler arasında dağıtır ve yola (path) veya host'a göre yönlendirir. Birlikte yatay ölçekleme katmanını oluştururlar.

Anahtar kavramlar: Launch template, ölçekleme politikaları (hedef izleme, adım, planlı), sağlık kontrolleri (health checks), ALB hedef grupları, dinleyici kuralları (listener rules), ağırlıklı yönlendirme.

Sınav ipucu: "Değişken yükü karşıla" veya "AZ'ler arasında yüksek kullanılabilirlik" → ASG + ALB.

---

**Lambda** *(Bölüm 20)*

Sunucusuz fonksiyonlar. Kodu siz yazarsınız; AWS onu olaylara yanıt olarak çalıştırır. Yönetilecek sunucu yoktur. Çağrı başına ve yürütme milisaniyesi başına ödeme yaparsınız. Binlerce eş zamanlı yürütmeye otomatik olarak ölçeklenir.

Anahtar kavramlar: Olay kaynakları (API Gateway, S3, SQS, EventBridge, Kinesis), yürütme rolü (execution role), eş zamanlılık sınırları, ayrılmış (reserved) ve tedarik edilmiş (provisioned) eş zamanlılık, soğuk başlangıç (cold start), Layers, 15 dakikalık maksimum süre.

Sınav ipucu: "Sunucusuz", "olay odaklı", "kısa süreli görevler", "boşta maliyet yok" → Lambda.

---

**ECS — Elastic Container Service** *(Bölüm 21)*

AWS'de Docker konteynerleri çalıştırır. İki başlatma tipi: EC2 (host'u siz yönetirsiniz) ve Fargate (host'u AWS yönetir). ECS, görev tanımlarını (task definitions), servisleri, küme zamanlamasını ve yük dengeleyiciler ile servis keşfi (service discovery) entegrasyonunu yönetir.

Anahtar kavramlar: Task definition, ECS servisi, Fargate ve EC2 başlatma tipi, ECR (konteyner kayıt defteri), task IAM rolü, servis otomatik ölçeklemesi.

Sınav ipucu: "Konteynerli iş yükleri", "mikroservisler", "AWS'de Docker" → ECS (genellikle sunucusuz konteynerler için Fargate).

---

**EKS — Elastic Kubernetes Service** *(Bölüm 21)*

Yönetilen Kubernetes. AWS kontrol düzlemini (control plane) çalıştırır; worker node'ları (EC2 veya Fargate) siz çalıştırırsınız. Ekibiniz zaten Kubernetes kullanıyorsa veya Kubernetes'e özgü özellikler gerektiren iş yükleri varsa EKS kullanın.

Sınav ipucu: "Kubernetes", "mevcut K8s iş yüklerini taşıma ihtiyacı" → EKS. "Sadece K8s yükü olmadan konteyner gerekiyor" → ECS.

---

**AWS Batch** *(Bölüm 21)*

Docker konteynerleri için yönetilen toplu (batch) hesaplama. Bir iş (Docker imajı + komut), bir iş kuyruğu ve bir hesaplama ortamı (EC2 veya Fargate) tanımlarsınız. AWS Batch hesaplamayı otomatik olarak tedarik eder ve ölçekler, ardından iş bittiğinde sonlandırır. Maliyeti azaltmak için Spot Instance'ları destekler.

Anahtar kavramlar: Job definition (ne çalıştırılacak), job queue (işlerin beklediği yer), compute environment (EC2 veya Fargate, On-Demand veya Spot), array jobs (aynı işin birçok paralel kopyasını çalıştırma).

Sınav ipucu: "Lambda'nın 15 dakikalık zaman aşımını aşan toplu işleme", "konteynerler üzerinde sonlu hesaplama işleri", "AWS'de HPC iş yükleri" → AWS Batch.

---

**AWS Outposts** *(Bölüm 2)*

Kendi veri merkezinize veya ortak yerleşim (co-location) tesisinize kurulan, tamamen yönetilen bir AWS donanım rafı. Genel bulutla aynı AWS hizmetlerini, API'lerini ve araçlarını (EC2, EBS, RDS, EKS, Outposts üzerinde S3) çalıştırır ama fiziksel olarak şirket içindedir (on-premises).

Anahtar kavramlar: Şirket içinde aynı AWS API'leri, kurulumu ve yamayı AWS yönetir, raf alanı ve gücü müşteri sağlar, Local Gateway (LGW) Outposts'u şirket içi ağlara bağlar.

Sınav ipucu: "AWS'yi kendi veri merkezinizde çalıştır", "veri ikametgâhı (data residency) hesaplamanın şirket içinde kalmasını gerektiriyor", "internet bağımlılığı olmadan AWS API'leri" → Outposts.

---

**AWS Wavelength** *(Bölüm 2)*

5G telekomünikasyon sağlayıcılarının ağları içine dağıtılan AWS altyapısı. Wavelength Zone'ları 5G ağ kenarında yer alır ve mobil cihazlara tek haneli milisaniye gecikme süresi sağlar.

Anahtar kavramlar: Wavelength Zone'ları, telekom ağları içindeki AWS Region'larının uzantılarıdır; trafik, cihaz ile Wavelength Zone arasında operatör ağında kalır.

Sınav ipucu: "5G mobil kullanıcılara tek haneli milisaniye gecikme süresi", "mobil AR/VR", "mobilde gerçek zamanlı oyun", "otonom araç telemetrisi" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Bölüm 25)*

Yeniden barındırma (lift-and-shift) geçiş hizmeti. Bir ajan, kaynak sunucuların disklerini blok blok AWS'deki düşük maliyetli bir hazırlama (staging) alanına çoğaltır; talep üzerine test kopyaları başlatırsınız; geçişte (cutover) MGN, çoğaltılan sunucuları yerel EC2 örneklerine dönüştürür. Uygulama değişikliği gerekmez.

Anahtar kavramlar: Blok düzeyinde sürekli çoğaltma, hazırlama alanı, geçişten önce test başlatmaları, "7 R" geçiş stratejileri (MGN = rehost).

Sınav ipucu: "Yüzlerce VM'i kod değişikliği olmadan hızlıca taşı", "sunucuları EC2'ye lift-and-shift" → MGN. DataSync *dosyaları* taşır; DMS *veritabanlarını* taşır; MGN *bütün sunucuları* taşır.

---

## Depolama (Storage)

**S3 — Simple Storage Service** *(Bölüm 5)*

Nesne depolama. Sınırsız kapasite, %99,999999999 (on bir dokuz) dayanıklılık. Dosyaları bucket'larda nesneler olarak saklar. Bucket'lar bir bölgede yaşar. Nesneler 0 bayttan 5 TB'a kadar değişebilir.

Anahtar kavramlar: Bucket policy, nesne ACL'si, sürümleme (versioning), statik web sitesi barındırma, önceden imzalanmış URL'ler (presigned URLs), çok parçalı yükleme (multipart upload), Transfer Acceleration, depolama sınıfları (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, ayrıca tek AZ'li, gecikmeye duyarlı dizin-bucket iş yükleri için S3 Express One Zone).

Sınav ipucu: "Dosya sakla ve getir", "statik varlıklar", "yedekler", "veri gölü (data lake)" → S3. Doğru depolama sınıfı, erişim sıklığına ve getirme hızına bağlıdır.

---

**EBS — Elastic Block Store** *(Bölüm 6)*

Tek bir EC2 örneğine bağlı blok depolama. Bir sabit disk gibi davranır. Örnek yaşam döngüsünden bağımsız olarak kalıcı olur (ayırıp yeniden bağlayabilirsiniz). En yaygın tipler: gp3 (genel amaçlı SSD, varsayılan), io2 (veritabanları için tedarik edilmiş IOPS), st1 (sıralı okumalar için verim odaklı HDD).

Anahtar kavramlar: Anlık görüntüler (snapshots, artımlı, S3'te saklanır), şifreleme (KMS), Multi-Attach (yalnızca io1/io2), IOPS ve verim tedariki.

Sınav ipucu: "EC2 için kalıcı depolama", "veritabanı depolaması", "düşük gecikmeli blok erişimi gerektirir" → EBS.

---

**EFS — Elastic File System** *(Bölüm 6)*

Birden fazla EC2 örneğinden aynı anda erişilebilen paylaşımlı dosya sistemi. NFS protokolü. Otomatik olarak ölçeklenir. GB başına EBS'den daha pahalıdır. Depolama sınıfları arasında Standard, Infrequent Access ve Archive bulunur. Intelligent-Tiering dosyaları otomatik olarak taşır.

Sınav ipucu: "Paylaşımlı dosya sistemi", "birden fazla EC2 örneğinin aynı dosyalara ihtiyacı var", "NFS" → EFS.

---

**FSx Ailesi** *(Bölüm 6)*

Belirli teknolojiler için yönetilen dosya sunucuları. FSx for Windows File Server: SMB protokolü, NTFS, Active Directory entegrasyonu, Multi-AZ. FSx for Lustre: HPC/ML için paralel yüksek performanslı dosya sistemi, S3 nesnelerini dosya olarak sunar (lazy loading). FSx for NetApp ONTAP: çoklu protokol (NFS + SMB + iSCSI), anlık görüntüler, SnapMirror çoğaltma. FSx for OpenZFS: düşük gecikmeli NFS, anlık görüntüler ve yazılabilir klonlar.

Sınav ipucu: "SMB/Active Directory" → FSx for Windows. "S3 verisi üzerinde HPC/ML eğitimi" → FSx for Lustre. "Aynı veriye NFS ve SMB / NetApp geçişi" → FSx for ONTAP. "ZFS geçişi / anlık klonlar" → FSx for OpenZFS.

---

**S3 Depolama Sınıfları ve Yaşam Döngüsü Politikaları** *(Bölüm 23)*

S3 Intelligent-Tiering, nesneleri erişim sıklığına göre erişim katmanları arasında otomatik olarak taşır. Yaşam döngüsü politikaları, yaş kurallarına göre nesneleri sınıflar arasında geçirir (Standard → Standard-IA → Glacier). Glacier depolama sınıflarının getirme gecikmesi dakikalardan (Glacier Instant) 12 saate (Glacier Deep Archive) kadar değişir.

Sınav ipucu: "Seyrek erişilen veriler için depolama maliyetini azalt" → yaşam döngüsü politikaları, Intelligent-Tiering veya Glacier.

---

**AWS Storage Gateway** *(Bölüm 6)*

Şirket içi ortamları AWS depolamasına bağlayan hibrit depolama hizmeti. Verileri S3, S3 Glacier'da veya EBS anlık görüntüleri olarak saklarken, uygulamaların zaten anladığı protokoller üzerinden depolama sunar.

Anahtar kavramlar: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, önbellekli veya saklanan mod), Tape Gateway (sanal teyp kütüphanesi → Glacier).

Sınav ipucu: "Şirket içi uygulamanın kod değişikliği olmadan bulut depolamasına ihtiyacı var" → Storage Gateway. "Teyp yedeklemesinin yerini al" → Tape Gateway.

---

**AWS DataSync** *(Bölüm 25)*

Ajan tabanlı veri geçişi ve çoğaltma hizmeti. Hafif bir ajan, şirket içi dosya sunucularına NFS veya SMB üzerinden bağlanır ve paylaşımları S3, EFS veya FSx'e senkronize eder — yerleşik zamanlama, bant genişliği kısıtlaması ve bütünlük doğrulaması ile.

Anahtar kavramlar: DataSync ajanı (şirket içi VM veya EC2), NFS/SMB kaynakları, S3/EFS/FSx hedefleri, planlı artımlı transferler.

Sınav ipucu: "Şirket içi NAS'tan AWS'ye ağ üzerinden çok sayıda dosyayı taşı veya sürekli senkronize et" → DataSync.

---

**AWS Transfer Family** *(Bölüm 25)*

Depolama hedefi olarak S3 veya EFS ile desteklenen, tamamen yönetilen SFTP, FTPS ve FTP sunucusu. İstemciler mevcut SFTP yazılımlarıyla bağlanır; yüklenen dosyalar doğrudan bir bucket'a veya dosya sistemine düşer.

Anahtar kavramlar: Yönetilen uç nokta (isteğe bağlı statik IP ile), S3 veya EFS destekli depolama, harici iş ortakları için mevcut protokol uyumluluğu.

Sınav ipucu: "İş ortakları SFTP üzerinden yüklemeye devam etmeli ama dosyalar S3'e düşmeli" → Transfer Family.

---

**AWS Snow Family** *(Bölüm 25)*

Çevrimdışı, toplu veri geçişi için fiziksel veri transfer cihazları. Snowball Edge Storage Optimized: 80 TB kullanılabilir, sağlamlaştırılmış muhafaza, konumunuza gönderilir; veriyi yerel olarak yükler ve S3'e alınması için geri gönderirsiniz.

Anahtar kavramlar: Önce transfer hesabını yapın — ağ transferi yaklaşık bir hafta veya daha fazla sürecekse, fiziksel cihaz kazanır. *Eski not (2026)*: AWS aileyi emekliye ayırıyor — Snowmobile (2024) ve Snowcone (2024 sonu) kalktı ve Snow cihazları Kasım 2025'te yeni müşterilere kapatıldı (AWS artık DataSync ve Data Transfer Terminals'a yönlendiriyor). SAA-C03 soru bankası bundan önce hazırlandığı için sınav hâlâ Snowball'u cevap olarak bekliyor.

Sınav ipucu: "Petabayt ölçeğinde geçiş", "sınırlı bant genişliği, haftalarca transfer süresi" → Snow Family.

---

**AWS Backup** *(Bölüm 18 ve 23)*

EBS, RDS, DynamoDB, EFS ve Storage Gateway genelinde merkezi, politika tabanlı yedekleme hizmeti. Yedekleme planları (backup plans) zamanlamaları ve saklama sürelerini tanımlar; kasalar (vaults) kurtarma noktalarını saklar.

Anahtar kavramlar: Yedekleme planları ve kasalar, bölgeler arası ve hesaplar arası kopyalar, değişmezlik (immutability) için Vault Lock.

Sınav ipucu: "Birden fazla AWS hizmetinde yedeklemeleri merkezileştir ve otomatikleştir", "fidye yazılımı/hesap ele geçirme koruması için hesaplar arası yedek kopyalar" → AWS Backup.

---

## Veritabanları (Databases)

**RDS — Relational Database Service** *(Bölüm 8)*

Yönetilen ilişkisel veritabanları. Desteklenen motorlar: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server ve Aurora (AWS'nin tescilli motoru). AWS, yedeklemeleri, yamaları, yük devretmeyi (failover) ve çoğaltmayı yönetir. Şema tasarımını, sorguları ve örnek boyutlandırmasını siz yönetirsiniz.

Anahtar kavramlar: Multi-AZ dağıtımı (otomatik yük devretme, eş zamanlı çoğaltma), Read Replica'lar (eş zamanlı olmayan, okuma ölçeklemesi için), otomatik yedeklemeler (1-35 gün saklama), manuel anlık görüntüler (silinene kadar tutulur), RDS Proxy (bağlantı havuzlama).

Sınav ipucu: "İlişkisel veritabanı", "ACID işlemleri", "mevcut SQL iş yükü" → RDS veya Aurora.

---

**Aurora** *(Bölüm 24)*

AWS'nin ilişkisel veritabanı motoru, MySQL ve PostgreSQL ile uyumlu. Veriyi 3 AZ genelinde 6 kopyada çoğaltan dağıtık depolama motoru. Tipik olarak MySQL'den 5 kat daha hızlı. Aurora Serverless v2, kapasiteyi otomatik olarak ölçekler (ACU — Aurora Capacity Units cinsinden ölçülür) ve desteklenen motor sürümlerinde, açık bağlantı tutulmadığında 0 ACU'ya otomatik duraklayabilir (auto-pause).

Anahtar kavramlar: Aurora kümesi (writer + tek bir reader uç noktası arkasında 15'e kadar Aurora Replica), Aurora Global Database (1 saniyenin altında çoğaltma gecikmesiyle bölgeler arası okuma replikaları), Aurora Serverless v2, ACU'lar, otomatik duraklatma/devam ettirme davranışı.

Sınav ipucu: "Yüksek performanslı ilişkisel veritabanı", "MySQL/PostgreSQL uyumlu", "küresel okumalar", "değişken iş yükü" → Aurora.

---

**DynamoDB** *(Bölüm 9)*

Tamamen yönetilen NoSQL veritabanı. Anahtar-değer ve belge modeli. Tek haneli milisaniye performansıyla herhangi bir verime ölçeklenir. İki kapasite modu: on-demand (istek başına ödeme) ve provisioned (saat başına kapasite birimi başına ödeme, Auto Scaling ile).

Anahtar kavramlar: Partition key (gerekli), sort key (isteğe bağlı), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (değişiklik veri yakalama), DynamoDB Accelerator (DAX) — bellek içi önbellek, TTL (Time to Live), işlemler.

Sınav ipucu: "Yüksek verimli anahtar tabanlı erişim", "esnek şema", "sunucusuz NoSQL" → DynamoDB.

---

**ElastiCache** *(Bölüm 10)*

Yönetilen bellek içi önbellekleme. İki motor: Redis (kalıcı, pub/sub, Lua betikleme, veri yapıları) ve Memcached (saf önbellek, daha basit, çok iş parçacıklı). Veritabanı yükünü azaltmak ve sık okunan verileri mikrosaniyeler içinde sunmak için kullanın.

Anahtar kavramlar: Cache-aside deseni, write-through deseni, çıkarma (eviction) politikaları, TTL, cluster modu (Redis), otomatik yük devretmeli Multi-AZ.

Sınav ipucu: "Veritabanı yükünü azalt", "milisaniyenin altında okuma gecikmesi", "oturum yönetimi", "gerçek zamanlı lider tablosu" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Bölüm 10)*

Dayanıklı, Redis uyumlu, bellek içi birincil veritabanı. ElastiCache'ten (veri kaybının kabul edilebilir olduğu bir önbellek) farklı olarak, MemoryDB bir Multi-AZ işlem günlüğü saklar ve dayanıklılığı garanti eder. MemoryDB'yi birincil veritabanınız olarak kullanabilirsiniz — sadece başka bir veritabanının önünde bir önbellek olarak değil.

Anahtar kavramlar: Redis API uyumluluğu, Multi-AZ işlem günlüğü (dayanıklılık garantisi), bellek içi performans, birincil veritabanı (önbellek katmanı değil).

Sınav ipucu: "Redis uyumlu VE veri kaybı kabul edilemez", "dayanıklı bellek içi veritabanı" → MemoryDB. "Önbellek olarak Redis, veri kaybı kabul edilebilir" → ElastiCache Redis.

---

**Amaca Özel Veritabanları** *(Bölüm 9, 10 ve 24)*

Veri şeklini motora eşleştirin. DocumentDB: MongoDB uyumlu belgeler. Neptune: graf veritabanı (ilişkiler, geçişler — Gremlin/SPARQL). Keyspaces: Cassandra uyumlu geniş sütun. Timestream: zaman serisi (mevcut sunum: Timestream for InfluxDB). MemoryDB: dayanıklı, Redis uyumlu *birincil* veritabanı (ElastiCache = önbellek). QLDB ("değişmez kriptografik defter") 2025'te kullanımdan kaldırıldı — eski bir çeldirici olarak değerlendirin.

Sınav ipucu: "sosyal graf / öneriler / dolandırıcılık halkaları" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "Zaman içinde IoT telemetrisi" → Timestream.

---

**AWS DMS — Database Migration Service** *(Bölüm 8)*

Veritabanlarını minimum kesinti süresiyle AWS'ye taşır. Tam yükleme (full load, ilk kopya) artı CDC'yi (Change Data Capture) destekleyerek, geçiş devam ederken kaynağı ve hedefi senkronize tutar. Aynı motor tipleri arasında geçiş yaparken (MySQL → MySQL, PostgreSQL → PostgreSQL) DMS'yi doğrudan kullanın. Farklı motor tipleri arasında geçiş yaparken (Oracle → Aurora PostgreSQL), önce şemayı dönüştürmek için AWS Schema Conversion Tool (SCT) kullanın, ardından veri için DMS.

Anahtar kavramlar: Çoğaltma örneği (replication instance), kaynak ve hedef uç noktaları, tam yükleme + CDC, heterojen geçişler için SCT (Schema Conversion Tool).

Sınav ipucu: "Minimum kesinti süresiyle veritabanı taşı" → DMS. "Oracle'dan Aurora'ya" veya herhangi bir heterojen geçiş → SCT + DMS. "Aynı motor, aynı tip" → doğrudan DMS.

---

## Ağ (Networking)

**VPC — Virtual Private Cloud** *(Bölüm 11)*

AWS içinde izole edilmiş bir ağ. Bir bölgedeki tüm AZ'leri kapsar. IP adres alanını (CIDR bloğu) tanımlar, alt ağlar (subnet — genel veya özel) oluşturur, yönlendirme tablolarını yapılandırır ve erişimi güvenlik grupları (security groups) ve NACL'ler aracılığıyla kontrol edersiniz.

Anahtar kavramlar: Genel alt ağ (Internet Gateway'e yönlendirme), özel alt ağ (giden için NAT Gateway'e yönlendirme), Internet Gateway (internete gelen + giden), NAT Gateway (özel örnekler için yalnızca giden), VPC Peering (iki VPC'yi bağlama), VPC Endpoints (internet olmadan AWS hizmetlerine bağlanma).

Sınav ipucu: "AWS'de özel ağ", "kaynakları internetten izole et", "ağ trafiğini kontrol et" → VPC.

---

**Security Group'lar ve NACL'ler** *(Bölüm 15)*

Security group'lar örnek düzeyinde durum bilgili (stateful) güvenlik duvarlarıdır — yalnızca izin kuralları, dönüş trafiği otomatiktir. NACL'ler (Network Access Control Lists) alt ağ düzeyinde durum bilgisiz (stateless) güvenlik duvarlarıdır — hem gelen hem giden kuralları gerektirir, kural numarasına göre sırayla değerlendirilir.

Sınav ipucu: "Belirli bir IP'yi alt ağa erişmesini engelle" → NACL. "Bir örneğe gelen/giden trafiği kontrol et" → security group.

---

**Route 53** *(Bölüm 12)*

AWS'nin DNS hizmeti ve alan adı kaydedicisi. İnternet trafiğini AWS kaynaklarına ve harici uç noktalara yönlendirir. Yönlendirme politikaları: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

Anahtar kavramlar: Hosted zone'lar (genel ve özel), kayıt tipleri (A, AAAA, CNAME, Alias), sağlık kontrolleri, Traffic Flow (görsel politika düzenleyici — geoproximity'nin, Traffic Flow gerektirmeden, ayarlanabilir bir önyargı (bias) ile kayıtlarda doğrudan bir yönlendirme politikası olarak da kullanılabildiğini unutmayın).

Sınav ipucu: "DNS yönlendirmesi", "bölgeler arası yük devretme", "gecikmeye veya konuma göre yönlendirme" → uygun yönlendirme politikası ile Route 53.

---

**CloudFront** *(Bölüm 13)*

İçerik Dağıtım Ağı (CDN). İçeriği kenar konumlarında (dünya çapında 750+ varlık noktası) önbelleğe alır. Son kullanıcılar için gecikmeyi azaltır. Önbellekleme yoluyla kaynak transfer maliyetlerini azaltır. Kaynak olarak S3, EC2, ALB ve API Gateway ile entegre olur.

Anahtar kavramlar: Distribution, kaynaklar (origins), davranışlar (yola dayalı kaynak yönlendirme), TTL (önbellek kontrolü), önbellek geçersiz kılma (cache invalidation), imzalı URL'ler ve çerezler (erişim kontrolü), Lambda@Edge ve CloudFront Functions (kenarda kod çalıştırma), Origin Shield (kaynak yükünü azaltma).

Sınav ipucu: "Küresel düşük gecikme", "statik içeriği önbelleğe al", "kaynak yükünü azalt", "Shield ile DDoS'a karşı koru" → CloudFront.

---

**Direct Connect ve VPN** *(Bölüm 25)*

AWS Direct Connect, şirket içi veri merkezinizden AWS'ye özel bir fiziksel ağ bağlantısıdır. Genel interneti atlar. Daha tutarlı bant genişliği ve gecikme. AWS Site-to-Site VPN, genel internet üzerinden şifreli bir tüneldir — kurulumu daha hızlı, maliyeti daha düşük, ama performansı değişken.

Anahtar kavramlar: Virtual Interface (VIF), Direct Connect Gateway (birden fazla bölgeye bağlanma), Transit Gateway (hub-and-spoke ağ topolojisi), VPN tüneli yedekliliği.

Sınav ipucu: "AWS'ye özel ayrılmış bağlantı" → Direct Connect. "Şifreli bağlantı, daha hızlı kurulum" → VPN. "Birden fazla VPC'yi bağla" → Transit Gateway.

---

**VPC Endpoints** *(Bölüm 30)*

Genel interneti veya NAT Gateway'i kullanmadan özel kaynakları AWS hizmetlerine bağlar. Gateway Endpoint'ler: ücretsiz, yalnızca S3 ve DynamoDB için kullanılabilir. Interface Endpoint'ler (PrivateLink): saat başına + GB başına ücretlendirilir, çoğu AWS hizmeti için kullanılabilir.

Sınav ipucu: "Özel alt ağdaki EC2, S3/DynamoDB'yi çağırır — NAT Gateway maliyetlerini azalt" → Gateway Endpoint (ücretsiz). "Özel alt ağdan SQS, SSM, Secrets Manager'a özel bağlantı" → Interface Endpoint.

---

**AWS Client VPN** *(Bölüm 11)*

Bireysel cihazların (dizüstü bilgisayarlar, iş istasyonları) internet üzerinden bir VPC'ye güvenli bir şekilde bağlanmasını sağlayan yönetilen OpenVPN uç noktası. Kimlik doğrulama seçenekleri: Active Directory, bir kimlik sağlayıcı ile SAML 2.0 federasyonu veya karşılıklı TLS (sertifika tabanlı). Split-tunnel (yalnızca VPC'ye yönelik trafik tünelden geçer) ve full-tunnel (tüm trafik AWS üzerinden yönlendirilir) destekler.

Anahtar kavramlar: Client VPN uç noktası, hedef ağ (VPC alt ağı ilişkilendirmesi), yetkilendirme kuralları, split-tunnel ve full-tunnel.

Sınav ipucu: "Uzaktan çalışan mühendislerin evden bir VPC'ye güvenli erişime ihtiyacı var", "bireysel cihazdan VPC'ye bağlantı" → Client VPN. Karşılaştırma: Site-to-Site VPN = ağdan ağa. Client VPN = cihazdan ağa.

---

**Network Load Balancer (NLB) ve Gateway Load Balancer (GWLB)** *(Bölüm 7)*

NLB, Katman 4'te (TCP/UDP/TLS) çalışır: HTTP incelemesi yok, yalnızca aşırı hızda paket yönlendirme — saniyede milyonlarca istek, AZ başına statik IP ve kaynak IP korumasıyla. GWLB, Katman 3'te çalışır ve tek bir amaç için vardır: üçüncü taraf sanal ağ cihazlarını (güvenlik duvarları, IDS/IPS, derin paket incelemesi) trafik akışlarına satır içi (inline) eklemek.

Anahtar kavramlar: NLB = Katman 4, statik IP'ler, ultra düşük gecikme, HTTP olmayan protokoller. GWLB = Katman 3, GENEVE kapsülleme, tek bir giriş noktası arkasında cihaz filoları. ALB = Katman 7 (yola/host'a göre yönlendirme).

Sınav ipucu: "Saniyede milyonlarca TCP isteği", "yük dengeleyici için statik IP", "kaynak IP'yi koru" → NLB. "Üçüncü taraf güvenlik cihazlarını trafik yoluna ekle" → GWLB.

---

**AWS Global Accelerator** *(Bölüm 25)*

Kullanıcı trafiğini, genel internetten geçmek yerine en yakın kenar konumunda AWS'nin özel küresel omurgasına yönlendirir. Bir veya daha fazla bölgedeki ALB'lerinizin, NLB'lerinizin veya EC2 örneklerinizin önünde duran iki statik Anycast IP adresi sağlar. *Dinamik* (önbelleğe alınamayan) trafik için gecikmeyi ve tutarlılığı iyileştirir.

Anahtar kavramlar: Statik Anycast IP'ler, AWS omurgasına kenar girişi, sağlık kontrolü tabanlı bölgesel yük devretme (saniyeler içinde), trafik kadranlı (traffic dials) uç nokta grupları.

Sınav ipucu: "Küresel kullanıcılar, dinamik/HTTP olmayan trafik, statik IP, hızlı bölgesel yük devretme" → Global Accelerator. "Önbelleğe alınabilir/statik içerik" → bunun yerine CloudFront.

---

## Güvenlik ve Kimlik (Security and Identity)

**IAM — Identity and Access Management** *(Bölüm 3 ve 14)*

AWS hesabınızda kimin neyi yapabileceğini kontrol eder. Kullanıcılar (uzun vadeli kimlik bilgileri), Gruplar (izinleri paylaşan kullanıcılar), Roller (hizmetler ve hesaplar arası erişim için geçici kimlik bilgileri), Politikalar (izin/reddet kurallarını tanımlayan JSON belgeleri).

Anahtar kavramlar: Principal, Action, Resource, Condition, açık reddetme > açık izin > örtük reddetme, SCP (AWS Organizations'da Service Control Policy), Permission boundary, AssumeRole.

Sınav ipucu: IAM, her güvenlik sorusuna dahildir. Anahtar desen: hizmetler IAM rolleri kullanır (kullanıcı değil). Hesaplar arası erişim rol üstlenme (role assumption) kullanır. En az ayrıcalık — yalnızca gerekeni ver.

---

**KMS — Key Management Service** *(Bölüm 16)*

Yönetilen şifreleme anahtarı hizmeti. Kriptografik anahtarları oluşturur, saklar ve kontrol eder. Müşteri tarafından yönetilen anahtarlar (CMK'ler), rotasyon, kullanım ve erişim politikalarını tanımlamanıza olanak tanır. AWS tarafından yönetilen anahtarlar otomatik olarak yönetilir.

Anahtar kavramlar: Key policy (IAM politikasından ayrı), Zarf şifreleme (envelope encryption, veri bir veri anahtarı ile şifrelenir; veri anahtarı CMK ile şifrelenir), Otomatik anahtar rotasyonu, Çok bölgeli anahtarlar, Grants.

Sınav ipucu: "Veriyi durağan halde şifrele", "müşteri tarafından yönetilen şifreleme anahtarları", "anahtar rotasyonu" → KMS.

---

**Secrets Manager** *(Bölüm 16)*

Hassas değerleri saklar ve otomatik olarak döndürür: veritabanı kimlik bilgileri, API anahtarları, OAuth token'ları. Otomatik parola rotasyonu için RDS ile entegre olur. Uygulamalar gizli bilgileri çalışma zamanında API aracılığıyla alır — kimlik bilgilerini asla sabit kodlamayın (hardcode).

Sınav ipucu: "Veritabanı kimlik bilgilerini sakla ve döndür", "sabit kodlanmış gizli bilgilerden kaçın" → Secrets Manager. "Yapılandırma değerlerini sakla, gizli bilgi değil" → Parameter Store (SSM).

---

**AWS Shield** *(Bölüm 17)*

DDoS koruması. Shield Standard otomatik ve ücretsizdir — yaygın hacimsel ve protokol saldırılarına karşı korur. Shield Advanced finansal koruma, 7/24 DDoS müdahale ekibi ve ayrıntılı saldırı görünürlüğü ekler.

Sınav ipucu: "DDoS'a karşı koru" → Shield Standard (otomatik) veya Shield Advanced (kurumsal, SLA ile).

---

**WAF — Web Application Firewall** *(Bölüm 17)*

HTTP/HTTPS trafiğini kurallara göre filtreler: IP blokları, hız sınırları, SQL injection kalıpları, XSS kalıpları, coğrafi kısıtlamalar, özel kurallar. CloudFront, ALB, API Gateway veya AppSync'e bağlanır.

Sınav ipucu: "Belirli IP adreslerini engelle", "kenarda SQL injection'ı önle", "API çağrılarını hız sınırla" → WAF.

---

**GuardDuty** *(Bölüm 17)*

Tehdit algılama hizmeti. ML ve tehdit istihbaratı kullanarak CloudTrail günlüklerini, VPC Flow Logs'u ve DNS günlüklerini analiz eder. Olağandışı API etkinliğini, bilinen kötü amaçlı IP'lerle iletişimi, ele geçirilmiş kimlik bilgilerini algılar.

Sınav ipucu: "Olağandışı etkinliği algıla", "ele geçirilmiş IAM kimlik bilgilerini belirle", "sürekli tehdit izleme" → GuardDuty.

---

**Amazon Inspector** *(Bölüm 17)*

Otomatik güvenlik açığı değerlendirme hizmeti. EC2 örneklerini, Amazon ECR konteyner imajlarını ve Lambda fonksiyonlarını yazılım güvenlik açıkları (CVE'ler) ve istenmeyen ağ maruziyeti için sürekli olarak tarar. Bulgular, merkezi yönetim için AWS Security Hub'a gönderilir.

Anahtar kavramlar: CVE taraması, sürekli (tek seferlik değil) değerlendirme, EC2 + ECR + Lambda kapsamı, Security Hub entegrasyonu.

Sınav ipucu: "EC2'yi bilinen güvenlik açıkları için otomatik tara", "konteyner imajları için CVE taraması", "sürekli güvenlik açığı değerlendirmesi" → Inspector.

---

**Amazon Cognito** *(Bölüm 14)*

Uygulamanızın son kullanıcıları için yönetilen kimlik doğrulama — kendiniz oluşturmak zorunda olmadığınız bir kullanıcı dizini. User Pool'lar kaydolma, oturum açma, MFA, parola sıfırlama ve sosyal kimlik sağlayıcılarını (Google, Facebook, herhangi bir OIDC sağlayıcısı) yönetir ve uygulamanızın doğruladığı JWT'ler verir. Identity Pool'lar bu token'ları geçici AWS kimlik bilgileriyle değiştirir.

Anahtar kavramlar: User Pool (kimlik doğrulama, JWT'ler) ve Identity Pool (geçici AWS kimlik bilgileri), barındırılan UI, sosyal/OIDC/SAML federasyonu, API Gateway Cognito authorizer.

Sınav ipucu: "Uygulamanın kullanıcı kaydı/oturum açmaya ihtiyacı var", "sosyal giriş", "mobil uygulama kullanıcılarına AWS kaynaklarına geçici erişim ver" → Cognito. Karşılaştırma: IAM mühendisleriniz ve hizmetleriniz içindir; Cognito müşterileriniz içindir.

---

**AWS Certificate Manager (ACM)** *(Bölüm 16)*

AWS tarafından yönetilen hizmetler (ALB, CloudFront, API Gateway) için ücretsiz genel TLS/SSL sertifikaları tedarik eder ve tüm yaşam döngüsünü yönetir — yenileme takvimi yok, özel anahtar yönetimi yok. DNS doğrulaması yoluyla otomatik yeniler.

Anahtar kavramlar: DNS ve e-posta doğrulaması, otomatik yenileme, CloudFront sertifikaları us-east-1'de olmalıdır, ücretsiz genel sertifikalar dışa aktarılamaz (2025'ten beri ücretli, dışa aktarılabilir bir seçenek mevcuttur).

Sınav ipucu: "Yük dengeleyici veya CDN üzerinde HTTPS", "otomatik sertifika yenileme" → ACM.

---

**Amazon Macie** *(Bölüm 17)*

S3 için hassas veri keşfi. Bucket'larda PII (isimler, kart numaraları, kimlik bilgileri) bulmak için makine öğrenimi ve kalıp eşleştirme kullanır ve genel maruziyet gibi erişim risklerini işaretler. GuardDuty'yi tamamlar: GuardDuty davranışı izler; Macie depolanan şeyi denetler.

Anahtar kavramlar: Yönetilen veri tanımlayıcıları (PII kalıpları), yalnızca S3 kapsamı, bulgular Security Hub/EventBridge'e.

Sınav ipucu: "S3'te PII keşfet", "hassas veri maruziyetini belirle" → Macie.

---

**AWS Control Tower** *(Bölüm 14)*

Çok hesaplı bir ortamın kurulumunu ve yönetişimini otomatikleştirir. Bir landing zone oluşturur — Organizations, CloudTrail, Config ve korkuluklarla (guardrails) önceden bağlanmış yönetim, log arşivi ve denetim hesapları — günlerce manuel bağlantı yerine dakikalar içinde.

Anahtar kavramlar: Landing zone, korkuluklar (önleyici = SCP'ler, tespit edici = Config kuralları), standartlaştırılmış yeni hesaplar için Account Factory.

Sınav ipucu: "En iyi uygulamalarla yeni bir çok hesaplı ortamı otomatik olarak kur ve yönet" → Control Tower. Karşılaştırma: Organizations ham yapı taşıdır; Control Tower otomatik montajdır.

---

## Mesajlaşma ve Olay İşleme (Messaging and Event Processing)

**SQS — Simple Queue Service** *(Bölüm 19)*

Yönetilen mesaj kuyruğu. Üreticiler mesaj gönderir; tüketiciler okur ve siler. Hizmetleri ayrıştırır (decouple): gönderici, alıcının uygun olup olmadığını bilmek zorunda değildir. Standard kuyruklar: en az bir kez teslimat, en iyi çaba sıralaması. FIFO kuyruklar: tam olarak bir kez işleme, katı sıralama.

Anahtar kavramlar: Görünürlük zaman aşımı (visibility timeout, işlenirken mesaj diğer tüketicilerden gizlenir), tekrar tekrar başarısız olan mesajlar için Dead Letter Queue (DLQ), Mesaj saklama (varsayılan 4 gün, 14 güne kadar), Long polling (boş yanıtları azaltır), Maksimum yük varsayılan 256 KB (2025'ten beri 1 MiB'a yükseltilebilir; daha büyük yükler için Extended Client Library gövdeyi S3'te saklar).

Sınav ipucu: "Hizmetleri ayrıştır", "yük artışları sırasında istekleri tampona al", "asenkron işleme" → SQS. "Sıralama önemli ve tam olarak bir kez gerekli" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Bölüm 19)*

Yönetilen pub/sub hizmeti. Yayıncılar bir konuya (topic) mesaj gönderir; tüm aboneler bir kopya alır. Fan-out deseni: bir mesaj → birçok tüketici. Protokoller: SQS, Lambda, HTTP/HTTPS, e-posta, SMS, mobil push.

Anahtar kavramlar: Topic, abonelik, fan-out deseni (SNS → birden fazla SQS kuyruğu), mesaj filtreleme (aboneler yalnızca eşleşen mesajları alır).

Sınav ipucu: "Aynı anda birden fazla uç noktaya bildirim gönder", "tek bir olayı birden fazla tüketiciye fan-out yap" → SNS. Yaygın desen: dayanıklı fan-out için SNS + SQS.

---

**EventBridge** *(Bölüm 22)*

Olay odaklı mimariler oluşturmak için olay veri yolu (event bus). AWS hizmetlerinden, SaaS iş ortaklarından ve özel kaynaklardan gelen olayları Lambda, SQS, SNS, Step Functions ve diğer hedeflere yönlendirir. Planlı kuralları (cron) ve kalıp eşleştirmeyi destekler.

Sınav ipucu: "AWS hizmetlerinden hedeflere olay yönlendir", "Lambda fonksiyonlarını planla", "olay odaklı orkestrasyon" → EventBridge.

---

**Step Functions** *(Bölüm 22)*

Sunucusuz iş akışı orkestrasyonu. Lambda fonksiyonlarını, ECS görevlerini, DynamoDB'yi, SNS'i, SQS'i ve diğer hizmetleri görsel durum makinelerinde (state machines) koordine eder. Yeniden denemeleri, hata işlemeyi, paralel dalları ve bekleme durumlarını yönetir.

Anahtar kavramlar: State machine, durum tipleri (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (tam olarak bir kez, uzun süreli) ve Express Workflows: Asenkron (en az bir kez, yüksek hacim — görevleri idempotent olacak şekilde tasarlayın) ve Senkron (en fazla bir kez, sonucu bir API çağrısı gibi doğrudan döndürür).

Sınav ipucu: "Birden fazla Lambda fonksiyonunu orkestre et", "yeniden deneme mantığıyla uzun süreli iş akışları", "insan onayı adımları" → Step Functions.

---

**Kinesis** *(Bölüm 26)*

Gerçek zamanlı veri akışı. Kinesis Data Streams: dayanıklı, sıralı kayıt akışı (dağıtık bir commit günlüğü gibi). Tüketiciler kayıtları işler; veriler 24 saat (varsayılan) ile 365 gün (Extended Data Retention ile) arasında saklanır. Amazon Data Firehose (eski adıyla Kinesis Data Firehose): S3, Redshift, OpenSearch, Splunk'a tamamen yönetilen teslimat — tüketici yönetimi gerekmez.

Anahtar kavramlar: Shard (verim birimi: 1 MB/sn yazma, 2 MB/sn okuma), partition key (shard atamasını belirler), sıra numarası, checkpointing (KCL veya Lambda), Firehose ve Streams.

Sınav ipucu: "Gerçek zamanlı akış", "sıralı kayıtlar", "olayları yeniden oynat" → Kinesis Data Streams. "Akış verilerini tüketici yönetmeden S3/Redshift'e teslim et" → Amazon Data Firehose (eski sorular "Kinesis Data Firehose" diyebilir). "Akış verisi üzerinde SQL" → Amazon Managed Service for Apache Flink (eski adıyla Kinesis Data Analytics). SQS ile karşılaştırma: Kinesis saklar ve yeniden oynatır; SQS tüketimde siler.

---

**Amazon MQ** *(Bölüm 19)*

Apache ActiveMQ ve RabbitMQ'yu destekleyen yönetilen mesaj aracısı hizmeti. Endüstri standardı mesajlaşma protokollerini destekler: AMQP, STOMP, MQTT, OpenWire ve WebSocket. Birincil kullanım durumu, şirket içi mesaj aracısı iş yüklerinin lift-and-shift geçişidir — zaten ActiveMQ veya RabbitMQ kullanan uygulamalar kod değişikliği olmadan bağlanabilir.

Anahtar kavramlar: ActiveMQ ve RabbitMQ motor seçimi, protokol desteği (AMQP/STOMP/MQTT), HA için tek örnekli veya etkin/yedek (active/standby) aracı yapılandırması.

Sınav ipucu: "Şirket içi ActiveMQ veya RabbitMQ'yu uygulama kodunu değiştirmeden AWS'ye taşı" → Amazon MQ. "Sıfırdan AWS-yerel mesajlaşma" → SQS veya SNS (daha basit, daha ölçeklenebilir).

---

## Analitik (Analytics)

**Athena** *(Bölüm 26)*

S3'te saklanan veriler üzerinde sunucusuz SQL sorguları. Yönetilecek altyapı yok. Sorgu başına ödeme (taranan TB başına). Sütunlu formatlar (Parquet, ORC) ve bölümlenmiş verilerle en iyisi.

Sınav ipucu: "S3 verisini SQL ile sorgula", "veri gölü üzerinde anlık analitik", "altyapı yönetimi yok" → Athena.

---

**Glue** *(Bölüm 26)*

Sunucusuz ETL (Extract, Transform, Load) hizmeti. Glue Crawler'lar veriyi keşfeder ve Glue Data Catalog'u günceller. Glue Job'lar Spark veya Python dönüşümleri çalıştırır. Data Catalog, Athena, Redshift Spectrum ve EMR ile entegre olur.

Sınav ipucu: "Analitik için veriyi dönüştür ve yükle", "S3 verisinin şemasını keşfet", "ETL boru hattı" → Glue.

---

**Amazon QuickSight** *(Bölüm 26)*

Yönetilen iş zekası ve veri görselleştirme hizmeti. İçe aktarılan veriyi hızlı pano oluşturma için önbelleğe alan bellek içi bir motor olan SPICE'ı (Super-fast, Parallel, In-memory Calculation Engine) kullanır. Athena, S3, Redshift, RDS ve diğer AWS veri kaynaklarına bağlanır. Yönetilecek BI sunucusu yok.

Anahtar kavramlar: SPICE (bellek içi motor), veri kümeleri, analizler, panolar, ML Insights (anomali algılama, tahmin), satır düzeyi ve sütun düzeyi güvenlik.

Sınav ipucu: "Sunucu yönetmeden AWS'de BI panosu", "Athena veya Redshift'ten veriyi görselleştir" → QuickSight.

---

**AWS Lake Formation** *(Bölüm 26)*

S3 ve Glue Data Catalog üzerine merkezi veri gölü erişim kontrol katmanı. Tablo, sütun ve satır düzeyinde ince ayrıntılı izinler sağlar — tek başına S3 bucket politikalarından daha ayrıntılı. Güvenli bir veri gölü kurmayı basitleştirir: Lake Formation izin modelini yönetir; Glue kataloğu yönetir; S3 veriyi tutar.

Anahtar kavramlar: Veri gölü izinleri (tablo/sütun/satır düzeyi), Glue Data Catalog entegrasyonu, öznitelik tabanlı erişim kontrolü için LF-tag'leri, Athena ve Redshift Spectrum sorguları için merkezi izin verme/geri alma.

Sınav ipucu: "Veri gölünde ince ayrıntılı erişim kontrolü", "S3 verisinde sütun düzeyi veya satır düzeyi güvenlik" → Lake Formation.

---

## Yüksek Kullanılabilirlik ve Felaket Kurtarma (High Availability and Disaster Recovery)

**Multi-AZ ve Multi-Region** *(Bölüm 18)*

Multi-AZ: otomatik yük devretme için bir bölge içinde eş zamanlı çoğaltma (RDS Multi-AZ, AZ'ler arası yük dengeleyici). RDS için RPO ~0, RTO ~60 sn. Multi-Region: coğrafi yedeklilik ve küresel kullanıcılar için daha düşük gecikme için eş zamanlı olmayan çoğaltma.

Anahtar kavramlar: RTO (Recovery Time Objective — kurtarma ne kadar sürer), RPO (Recovery Point Objective — ne kadar veri kaybedilebilir). Pilot Light, Warm Standby, Active-Active DR stratejileri.

Sınav ipucu: AZ düzeyindeki arızalar (Multi-AZ ele alır) ile bölgesel arızalar (Multi-Region ele alır) arasında ayrım yapın. Maliyet ve karmaşıklık Multi-Region ile önemli ölçüde artar.

---

**AWS Elastic Disaster Recovery (DRS)** *(Bölüm 18)*

Sunucular için yönetilen felaket kurtarma (şirket içi veya EC2). Kaynak sunucuları sürekli olarak blok blok düşük maliyetli bir hazırlama alanına çoğaltır ve gerektiğinde dakikalar içinde tam kurtarma örnekleri başlatır — yönetilen bir pilot light: yedekle-ve-geri yükle fiyatlarına yakın, warm-standby'a yakın kurtarma süreleri.

Anahtar kavramlar: Sürekli blok düzeyi çoğaltma, düşük maliyetli hazırlama alanı, talep üzerine kurtarma başlatma, zamanda noktaya (point-in-time) kurtarma.

Sınav ipucu: "Yönetilen bir DR hizmetiyle sunucu tabanlı iş yükleri için kesinti süresini ve veri kaybını en aza indir", "kendin oluşturmadan pilot light" → DRS.

---

## Maliyet Optimizasyonu (Cost Optimization)

**EC2 Fiyatlandırma Modelleri** *(Bölüm 27)*

On-Demand: tam fiyat, taahhüt yok. Reserved Instances (1 veya 3 yıl): belirli örnek tipi için %30-72 indirim. Savings Plans (Compute veya EC2 Instance): esneklik için taahhüt edilen saatlik harcama. Spot: kesintiye uğrayabilen iş yükleri için %60-90 indirim.

Sınav ipucu: "Öngörülebilir iş yükü için maliyeti en aza indir" → Savings Plans veya Reserved Instances. "Hata toleranslı toplu işleme" → Spot. "Öngörülemeyen veya kısa vadeli" → On-Demand.

---

**Veri Transferi Fiyatlandırması** *(Bölüm 30)*

AWS'ye gelen: ücretsiz. Aynı AZ: ücretsiz. AZ'ler arası: her yönde 0,01 $/GB. Bölgeler arası: 0,02-0,08 $/GB. İnternet (giden): ~0,09 $/GB. NAT Gateway işleme: 0,045 $/GB. CloudFront veri transferi, doğrudan EC2'den internete göre daha ucuzdur ve önbellekleme toplam hacmi azaltır.

Sınav ipucu: "Özel alt ağdan S3/DynamoDB için veri transfer maliyetlerini azalt" → Gateway Endpoint'ler (ücretsiz). "Diğer hizmetler için NAT Gateway maliyetlerini azalt" → Interface Endpoint'ler.

---

## Gözlemlenebilirlik (Observability)

**CloudWatch** *(kitap boyunca atıfta bulunulan)*

İzleme ve gözlemlenebilirlik. CloudWatch Metrics: AWS hizmetlerinden ve özel uygulamalardan sayısal zaman serisi verileri. CloudWatch Logs: günlük verilerini toplama, arama ve analiz etme. CloudWatch Alarms: metrik eşiklerine göre bildirimleri veya otomatik ölçeklemeyi tetikleme. CloudWatch Dashboards: metrikleri görselleştirme.

Anahtar kavramlar: Metrik boyutları, saklama süreleri, log grupları ve log akışları, metrik filtreleri, CloudWatch Agent (EC2'den OS düzeyi metrikler ve günlükler için), Container Insights.

---

**CloudTrail** *(kitap boyunca atıfta bulunulan)*

AWS hesabınızda yapılan her API çağrısını kaydeder: kim yaptı, nereden, ne zaman ve yanıt neydi. Çok bölgeli iz (trail), günlükleri S3'te süresiz olarak saklar. Güvenlik denetimi, uyumluluk ve olay araştırması için kullanılır.

Sınav ipucu: "O kaynağı kim sildi?" "Tüm API etkinliğini denetle" → CloudTrail.

---

**X-Ray** *(Bölüm 20)*

Dağıtık izleme (distributed tracing): bireysel istekleri hizmetler arasında takip eder (izler → segmentler → alt segmentler), her atlama için gecikme ve hata oranlarıyla bir hizmet haritası oluşturur. Örnekleme (sampling) yükü düşük tutar; ek açıklamalar (annotations) izleri aranabilir yapar. Aktif izleme, Lambda ve API Gateway aşamalarında açılır.

Sınav ipucu: "İstekleri mikroservisler arasında izle", "hizmetler arasındaki darboğazı bul" → X-Ray (CloudWatch değil, CloudTrail değil).

---

**AWS Config** *(Bölüm 31'de atıfta bulunulan)*

Kaynak yapılandırma değişikliklerini zaman içinde izler. Kaynakları uyumluluk kurallarına göre değerlendirir. Her kaynak için her yapılandırma değişikliğinin geçmişini kaydeder. Düzeltme (remediation) için Systems Manager ile entegre olur.

Sınav ipucu: "Bu kaynak güvenlik politikamıza uygun mu?" "Bu kaynağın yapılandırması geçen hafta nasıldı?" → AWS Config.

---

## Well-Architected

**Altı Sütun** *(Bölüm 31)*

| Sütun                       | Temel soru                                | Anahtar hizmetler                                 |
|-----------------------------|-------------------------------------------|---------------------------------------------------|
| Operational Excellence      | İyi çalışıyor muyuz?                       | CloudWatch, CloudTrail, SSM, Config               |
| Security                    | Korunuyor muyuz?                          | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability                 | Arızadan kurtarıyor muyuz?                | Multi-AZ, Route 53 failover, yedekle/geri yükle, SQS |
| Performance Efficiency      | Doğru kaynakları mı kullanıyoruz?         | Doğru boyutlandırma, Auto Scaling, CloudFront, Kinesis |
| Cost Optimization           | Akıllıca mı harcıyoruz?                   | Savings Plans, Spot, S3 yaşam döngüsü, VPC Endpoints |
| Sustainability              | Çevresel etkiyi en aza indiriyor muyuz?   | Doğru boyutlandırma, Graviton, verimli depolama katmanları |

AWS Well-Architected Tool: mimarinizi altı sütuna göre değerlendirir. Her sütunun sorularının ardındaki mantığı anlamak için sınavdan önce kullanın.
