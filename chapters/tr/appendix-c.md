# Ekipman D: Kavram Kayıtları

Her kitapta tanıtılan her anahtar kavram, bölümle eşleştirilmiş, kullanılan metafor ve SAA-C03 alanıyla yerleştirilmiş.

Bu, bir çalışma indeksi olarak kullanılır: sınava hazırlanırken bir kavramla kafanız karışırsa, burada bulun ve ilgili bölümdeki bağlam için geri dönün.

---

## A

**ACU (Aurora Capacity Birimi)** — Aurora Serverless v2 kapasitesi için ölçüm birimi. Otomatik olarak ölçeklenir. 24. Bölüm. Alan 3.

**Alarm (CloudWatch)** — Bir metriğin eşik değerini aşması durumunda tetiklenen bir kural, bildirim veya otomatik ölçekleme eylemini tetikler. 7. Bölüm. Alan 2.

**ALB (Uygulama Yük Dengeleyici)** — HTTP/HTTPS trafiğini yol boyunca ve ana bilgisayar kurallarına göre yönlendiren Katman 7 yük dengeleyici. 7. Bölüm. Alan 2.

**AMI (Amazon Makine Görüntüsü)** — EC2 örneği için işletim sistemi, yazılım ve yapılandırmasını içeren bir şablondur. 4. Bölüm. Alan 3.

**Mimari Zihniyet** — Sadece “bu nasıl çalışır?” diye sormak yerine “ilk ne kırılır, bunu nasıl biliriz ve saat 3’te birisi ne yapar?” diye sormak. 32. Bölüm, 34. Bölüm. Çoklu alan.

**Mimari Karar Kaydı (ADR)** — Bir kararın, alternatiflerinin, rasyonelinin ve yeniden gözden geçirilmesinin kaydedildiği kısa bir belgedir. 32. Bölüm. Çoklu alan.

**Mimari İnceleme** — Aşağıdaki hususları kapsayan yapılandırılmış bir süreç: kısıtlamalar → bilinmeyenler → seçenekler → arıza modları → izleme → çalışma kitapları. 32. Bölüm. Çoklu alan.

**Athena** — S3’teki verilere yönelik sunucusuz SQL sorgu hizmeti. TB başına ödeme yapılır. Parquet/ORC sütun formatlarıyla en iyi çalışır. 26. Bölüm. Alan 3.

**Otomatik Ölçekleme Grubu (ASG)** — EC2 örneklerinin yönetildiği bir gruptur, sağlıksız örnekleri otomatik olarak değiştirir ve yük tabanında ölçekler. 7. Bölüm. Alan 2, 3.

**Erişilebilirlik Bölgesi (AZ)** — Bölgedeki bir veya daha fazla fiziksel olarak ayrı veri merkezidir, düşük gecikmeli bağlantılarla birbirine bağlıdır. 2. Bölüm. Alan 2.

---

## B

**Kutu (S3)** — S3 nesneleri için bir container'dır. Kutu adları küresel olarak benzersizdir ve belirli bir bölgede yaşar. 5. Bölüm. Alan 3.

**Kutu Politikası** — S3 kutusuna uygulanan kaynak tabanlı bir politikadır, IAM ilkelerine ve harici hesaplara erişimi kontrol eder. 5. Bölüm. Alan 1.

---

## C

**Yan Kanal Deseni** — Uygulama önbellekleme öncelikle önbelleği kontrol eder; bir eşleşme durumunda veritabanına sorgular, ardından sonucu önbelleğe kaydeder. 10. Bölüm. Alan 3.

**Önbellek Vuruş Oranı** — Önbellekten sağlanan isteklerin, kaynağa kıyasla oranı. Daha yüksek daha iyidir. 13. Bölüm. Alan 3.

**CloudFront** — AWS CDN. 400’den fazla dünya çapındaki uç nokta konumunda içerik önbelleğe alır. Gecikmeyi azaltır ve kök veri aktarım maliyetlerini düşürür. 13. Bölüm. Alan 3, 4.

**CloudTrail** — AWS API çağrısını kim, ne, ne zaman, nereden kaydeder. S3’te saklanır. Denetim ve olay araştırması için kullanılır. Alan 1.

**CloudWatch** — AWS kaynakları ve özel uygulamalar için metrikler, günlükler, uyarılar ve panolar. Tüm alanlarda referans alınır.

**Soğuk Başlangıç (Lambda)** — Lambda, yürütme ortamını başlatırken gecikme, Lambda’nın ilk çağrıda veya hareketsizliğin ardından çalışmasını başlatmasıdır. Provisioned concurrency kullanarak ortadan kaldırın. 20. Bölüm. Alan 3.

**Hesap Tasarrufu Planı** — EC2 harcaması için bir dolar tutarında bir taahhüt, herhangi bir örnek türü veya boyutu için geçerlidir. 27. Bölüm. Alan 4.

**Config (AWS)** — AWS kaynaklarındaki değişiklikleri zaman içinde izler ve kurallara göre uyumluluğu değerlendirir. 31. Bölüm. Alan 1.

**AZ Arası Veri Aktarımı** — Bölgedeki Erişilebilirlik Bölgeleri arasında trafik. Yönü her birine 0,01 $/GB ücretlendirilir. 30. Bölüm. Alan 4.

**Bölge Arası Yansıtma** — S3 CRR, Aurora Global, DynamoDB Global Tabloları gibi farklı bir bölgeye veri kopyalamak. Veri aktarım ücretleri oluşur. 18, 30. Bölüm. Alan 2.

---

## D

**DAX (DynamoDB Hızlandırıcı)** — DynamoDB için özel, bellek içi bir önbelleğe sahiptir. Mikro saniye okuma gecikmesi. 9. Bölüm. Alan 3.

**Başarısız Mesaj Kuyruğu (DLQ)** — İşleme başarısız olan mesajların tekrar gönderildiği bir kuyruktur, böylece kuyruk engellenmez. 19. Bölüm. Alan 2.

**Özel Sunucu** — Yazılım lisansları için özel olarak sizin kullanımınız için ayrılmış fiziksel bir EC2 sunucusudur. 27. Bölüm. Alan 4.

**Derin Savunma** — IAM + güvenlik grupları + NACL’ler + WAF + GuardDuty gibi çok katmanlı güvenlik kontrollerini uygulamak, bir katmanın ihlalinin sistemin güvenliğini tehlikeye atmamasını sağlar. 33. Bölüm. Alan 1.

**Doğrudan Bağlantı** — On-premises konumunuzdan AWS’ye doğrudan özel bir ağ bağlantısı. VPN’den daha tutarlıdır. 25. Bölüm. Alan 3.

**DLQ** — See Dead Letter Queue.

**DynamoDB** — Tek ondalık milisaniye gecikmesiyle herhangi bir ölçekte çalışan anahtar-değer ve belge modeliyle tam olarak yönetilen NoSQL veritabanıdır. 9. Bölüm. Alan 3.

**DynamoDB Otomatik Ölçekleme** — CloudWatch metriklerine göre provisioned okuma/yazma kapasitesini otomatik olarak ayarlar. 29. Bölüm. Alan 4.

**DynamoDB Akışları** — Bir DynamoDB tablosundaki tüm öğe değişikliklerinin zamanlı bir değişiklik günlüğü. Lambda ile olay odaklı işleme için kullanılır. 9. Bölüm. Alan 2.

**EC2 (Elastic Compute Cloud)** — Bulut ortamında sanal makineler. 4. Bölüm. Alan 3.

**ECS (Elastic Container Service)** — Yönetilen kapalı kutu orkestrasyonu. Fargate başlatma türü sunucu yönetimini ortadan kaldırır. 21. Bölüm. Alan 2, 3.

**EFS (Elastic File System)** — Birden çok EC2 örneğinden erişilebilen paylaşımlı NFS dosya sistemi. Otomatik olarak ölçeklenir. 6. Bölüm. Alan 3.

**EKS (Elastic Kubernetes Service)** — AWS üzerinde yönetilen Kubernetes kontrol düzlemi. 21. Bölüm. Alan 3.

**ElastiCache** — Yönetilen bellek içi önbellekleme. Redis (daha zengin özellikler) veya Memcached (daha basit). 10. Bölüm. Alan 3.

**Elastic IP** — EC2 örneklerine ilişkilendirilebilen ve yeniden ilişkilendirilebilen statik bir halka açık IP adresi. 11. Bölüm. Alan 3.

**Yığın şifrelemesi** — Verilerin, DEK (Veri Anahtarı) ile şifrelenmesi ve DEK'nin CMK (KMS'de Anahtar) ile şifrelenmesi ile veri kalıbı. 16. Bölüm. Alan 1.

**EventBridge** — AWS hizmetleri, SaaS ortakları ve özel kaynaklardan gelen olayları hedefleyerek yönlendiren bir olay hattı. Zamanlanmış kurallarını destekler. 22. Bölüm. Alan 2.

**Açık reddetme** — Herhangi bir izin tarafından geçersiz kılınamayan bir IAM reddetme beyanı. Tüm izinlerin önünü geçer. 3. Bölüm. Alan 1.

---

## F

**Failover yönlendirme (Route 53)** — Primerin sağlık kontrolleri başarısız olduğunda ikincil uç noktaya trafiği yönlendirir. 12. Bölüm. Alan 2.

**Fargate** — ECS ve EKS için sunucusuz hesaplama motoru. Yönetilmesi gereken EC2 örnekleri yoktur. 21. Bölüm. Alan 3.

**Fan-out kalıbı** — Tek bir SNS konusu aynı mesajı eşzamanlı olarak birden çok SQS kuyruğuna iletir. 19. Bölüm. Alan 2.

**FIFO kuyruğu (SQS)** — Tam olarak bir kez işleme, sıkı sıralama. Standart kuyruklar için daha düşük verim. 19. Bölüm. Alan 2.

**Başarısızlık modu** — Bir sistemin başarısız olabileceği özel bir yol. Üretim öncesinde başarısızlık modlarını tanımlamak, mimari incelemenin temelidir. 32. Bölüm. Çapraz alan.

---

## G

**Gateway Ucu** — S3 ve DynamoDB için ücretsiz bir VPC ucu türüdür. Trafiği AWS özel ağından yönlendirerek NAT Gateway ücretlerinden kaçınır. 30. Bölüm. Alan 4.

**Coğrafi konum yönlendirme (Route 53)** — DNS sorgu kaynağının coğrafi konumuna göre yönlendirme. 12. Bölüm. Alan 3.

**Global Hızlandırıcı** — Herhangi bir gecikmeyi iyileştirmek için Anycast üzerinden AWS uç noktalarına trafiği yönlendirir. 25. Bölüm. Alan 3.

**Glue (AWS)** — Sunucusuz ETL. Glue Crawler şemaları keşfeder, Glue Jobs verileri dönüştürür, Data Catalog meta verileri depolar. 26. Bölüm. Alan 3.

**GSI (Global İkincil İndeks)** — Farklı bir bölüm anahtarı ve isteğe bağlı bir sıralama anahtarı ile bir DynamoDB tablosunda alternatif bir indeks. Esnek sorgu kalıplarını etkinleştirir. 9. Bölüm. Alan 3.

**GuardDuty** — CloudTrail, VPC Flow Logs ve DNS günlüklerini kullanarak olağandışı aktiviteyi tespit eden ML'yi kullanan tehdit tespiti hizmeti. 17. Bölüm. Alan 1.

---

## H

**Sağlık kontrolü (Route 53)** — Uç noktasının kullanılabilirliğini izler. Başarısız sağlık kontrolleri failover yönlendirmesini tetikler. 12. Bölüm. Alan 2.

**Sıcak bölüm (DynamoDB)** — Bir anahtar ile paylaşılan çok sayıda istek nedeniyle orantısız trafik alan bir bölüm. 9. Bölüm. Alan 3.

---

## I

**IAM (Kimlik ve Erişim Yönetimi)** — AWS hesapları için kimlik doğrulama ve yetkilendirme sağlar. Kullanıcılar, gruplar, roller, politikalar. 3., 14. Bölüm. Alan 1.

**IAM rolü** — Geçici kimlik bilgilerine sahip bir IAM kimliğidir, hizmetler, kullanıcılar veya diğer hesaplar tarafından varsayılandır. 3., 14. Bölüm. Alan 1.

**İddia edilemezlik** — Bir sistemin aynı sonucu üretme özelliğidir, bir kez çağrılırsa veya çok kez çağrılırsa. Dağıtılmış sistemler için kritik öneme sahiptir (ödeme iadeleri, ödeme işlemleri, sipariş işleme). 32. Bölüm. Çapraz alan.

**İddia edilemezlik anahtarı** — Tekrarlama önleme için kontrol edilen benzersiz bir tanımlayıcıdır. 32. Bölüm. Çapraz alan.

**Arayüz Ucu (PrivateLink)** — Çoğu AWS hizmeti için bir VPC ucu türüdür. Özel bir ağ üzerinden trafiği yönlendirerek internet veya NAT gerektirmez. 30. Bölüm. Alan 4.

**İnternet Geçidi (IGW)** — Halk açık alt ağlardaki örneklerin internet ile iletişim kurmasını sağlar. Alt ağın route tablosunun IGW'ye bir rota içermesi gerekir. 11. Bölüm. Alan 3.

**"Bağımlı"** — Mimari soruları yanıtlamak için dürüst cevabın her zaman tamamlanması gereken "Bağımlı" cevabıdır: "Erişim kalıbına / ölçeğe / başarısızlık sonucuna / maliyet kısıtlamasına bağlıdır." 33. Bölüm. Çapraz alan.

---

## K

**Kinesis Veri Hortumu** — S3, Redshift, OpenSearch'e veri teslimi için yönetilen bir akış teslimi. Tüketici yönetimi gerekmez. 26. Bölüm. Alan 3.

**Kinesis Veri Akışları** — Gerçek zamanlı, sıralı bir olay akışı. Dayanıklı, oynatılabiliyor. Şeritler cinsinden ölçülür. 26. Bölüm. Alan 3.

**KMS (Anahtar Yönetimi Hizmeti)** — Şifreleme için dinlenme durumunda anahtılar oluşturur, depolar ve kontrol eder. 16. Bölüm. Alan 1.

**Latensi Tabanlı Yönlendirme (Route 53)** — DNS sorgularını en düşük ölçülen gecikmeye sahip AWS bölgesine yönlendirir. 12. Bölüm. Alan 3.

**Başlangıç Şablonu** — Auto Scaling Grupları için EC2 örneği yapılandırmasını tanımlayan ve sürümlendirilen bir şablondur. 7. Bölüm. Alan 3.

**En Az İzin** — IAM en iyi uygulaması: yalnızca gerekli izinleri verin, daha fazla değil. 3. Bölüm. Alan 1.

**Yaşam Döngüsü Politikası (S3)** — Nesneleri daha ucuz depolama sınıflarına aktarmak veya yaşlarına göre silmek için otomatik olarak geçiş yapan kurallar. 23. Bölüm. Alan 4.

**LSI (Yerel İkincil İndeks)** — Aynı bölüm anahtarı ancak farklı bir sıralama anahtarı kullanan bir DynamoDB tablosu için alternatif bir dizindir. Tablo oluşturulurken oluşturulmalıdır. 9. Bölüm. Alan 3.

---

## M

**Memcached** — Basit, çok iş parçacıklı, bellek içi önbellekleme motoru. Hiçbir tutarlılık yok, veri yapıları yok. Redis'i yalnızca belirli bir çok iş parçacıklı gereksinimi olduğunda kullanın, özelliklerden ödün vererek. 10. Bölüm. Alan 3.

**Multi-AZ (RDS)** — Farklı bir AZ'de senkronize bir yedek replikadır ve otomatik geçiş sağlar. RPO ~0, RTO ~60 saniye. Yüksek kullanılabilirlik için, okuma ölçeklendirmesi için değildir. 8. Bölüm, 18. Bölüm. Alan 2.

**Multi-Region** — Uygulama bileşenlerini, coğrafi yedeklilik ve küresel performans için birden çok AWS bölgesine dağıtmak. Daha yüksek karmaşıklık ve maliyet. 18. Bölüm. Alan 2.

---

## N

**NACL (Ağ Erişimi Kontrol Listesi)** — Alt ağ düzeyinde, durumsuz bir güvenlik duvarı. Hem gelen hem de giden kurallar gerektirir. Kurallar sayısal sıraya göre değerlendirilir. 15. Bölüm. Alan 1.

**NAT Gateway** — Özel alt ağlardaki örneklerin internete giden bağlantılarını yapmasına izin verir. İşlemlediği her GB için 0,045 $/GB ücretlendirilir. 11. Bölüm, 30. Bölüm. Alan 4.

---

## O

**Nesne (S3)** — S3'te depolanan bir dosya. Anahtar (ad), değer (veri) ve meta veri içerir. Maksimum boyutu 5 TB'dir. 5. Bölüm. Alan 3.

**Talep Üzerinde Kapasite (DynamoDB)** — İstek başına ödeme modu. Önceden tahsis edilen kapasiteye göre daha pahalıdır, ancak kapasite planlama gerekmez. 29. Bölüm. Alan 4.

**Talep Üzerinde Örnekler (EC2)** — Hiçbir taahhüt olmadan saat başına ödeme. En fazla esneklik, en fazla fiyat. 27. Bölüm. Alan 4.

---

## P

**Bölüm Anahtarı (DynamoDB)** — Bir öğenin hangi bölüme depolandığını belirleyen anahtar bileşen. Düzgün dağıtım için yüksek kardinaliteli bir anahtar seçin. 9. Bölüm. Alan 3.

**İzin Sınırı** — Bir IAM kimliğinin sahip olabileceği maksimum izinleri belirleyen bir IAM politikası, diğer politikalar daha fazla izin verir olsa bile. 14. Bölüm. Alan 1.

**Yerleştirme Grubu** — Gecikmeyi (küme) en aza indirmek için EC2 örneklerinin fiziksel yerleşimini kontrol eder veya kullanılabilirliği en üst düzeye çıkarmak için yayar. 4. Bölüm. Alan 3.

**Özel Bağlantı** — Arayüz Noktaları üzerinden erişilebilen AWS tarafından barındırılan hizmetlere özel uç noktalar oluşturmak için kullanılan bir AWS hizmeti. 30. Bölüm. Alan 1.

**Lambda için Önceden Tahsis Edilmiş Eşzamanlılık** — Soğuk başlatma gecikmelerini ortadan kaldıran önceden başlatılmış yürütme ortamları. 20. Bölüm. Alan 3.

**DynamoDB için Önceden Tahsis Edilmiş Kapasite** — Saniye başına önceden tahsis edilen okuma ve yazma verimi, birim başına saniye olarak ölçülür. Tahmin edilebilir trafik için önceden tahsis edilen kapasiteye göre daha ucuzdur. 9. Bölüm, 29. Bölüm. Alan 4.

---

## R

**RDS (İlişkisel Veritabanı Hizmeti)** — Yönetilen ilişkisel veritabanı. Yedeklemeler, yamalamalar, geçiş sağlar. 8. Bölüm. Alan 3.

**RDS Proxy** — Lambda/uygulama ile RDS arasındaki bağlantı havuzunu yöneterek bağlantı tükenmesini önler. 8. Bölüm. Alan 3.

**RDS Kopyası (RDS)** — Veritabanı için okuma ölçeklendirmesi için asenkron bir kopyadır. Otomatik geçiş sağlamaz. 8. Bölüm, 24. Bölüm. Alan 3.

**Redis** — Önbellekleme, oturum yönetimi, gerçek zamanlı lider tahtaları, yayın/abone için kullanılan bellek içi veri yapısı depolama. 10. Bölüm. Alan 3.

**Örnek (EC2)** — Belirli bir tür örneği belirli bir bölgede 1 veya 3 yıl için bir indirim karşılığında bir taahhüt olarak kullanır. 27. Bölüm. Alan 4.

**Route 53** — AWS DNS hizmeti ve alan kaydı tutucusu. Çok sayıda yönlendirme politikası destekler. 12. Bölüm. Alan 2, 3.

**RPO (Yeniden Kazanma Noktası Hedefi)** — Maksimum kabul edilebilir veri kaybı, zamana göre ölçülür. "Ne kadar veri kaybedebiliriz?" 18. Bölüm. Alan 2.

**RTO (Yeniden Kazanma Zaman Hedefi)** — Bir arıza durumunda hizmetin geri kazanılması için maksimum kabul edilebilir süre. "Hangi kadar süredir kapalı kalabiliriz?" 18. Bölüm. Alan 2.

**Çalışma Kitabı** — Sistem işletimi için adım adım talimatlar, özellikle olay yanıtı için. "Saat 3'te ne yapılır?" 32. Bölüm. Çoklu Alan.

---

## S

**S3 Akıllı Katmanlama** — Erişim kalıplarına göre S3 nesnelerini otomatik olarak daha ucuz depolama sınıflarına taşır. Alma ücreti yoktur. 23. Bölüm. Alan 4.

**S3 Seçimi** — SQL ifadeleri kullanarak S3 nesne içeriğinin bir alt kümesini alır, veri aktarımını azaltır. 30. Bölüm. Alan 4.

**Planlama Planı** — Saatlik harcamalar için bir dolar tutarında bir taahhüt karşılığında bir indirim elde eder. Rezervli Örüntüler kadar esnek değildir. 27. Bölüm. Alan 4.

**SCP (Hizmet Kontrol Politikası)** — Bir OU'daki hesaplara maksimum izinleri sınırlayan bir AWS Organizasyon politikası. 14. Bölüm. Alan 1.

**Secrets Manager** — Sırları depolar ve otomatik olarak şifre değiştirir (veritabanı parolaları, API anahtarları). Bölüm 16. Alan 1.

**Security group** — Bir örneğin düzeyinde durum bilgili sanal bir güvenlik duvarı. Yalnızca izin kuralları uygulanır, dönüş trafiği otomatik olur. Bölüm 15. Alan 1.

**Shard (Kinesis)** — Kinesis Data Akışları'ndaki akış birimidir: 1 MB/s yazma, 2 MB/s okuma. Bölüm 26. Alan 3.

**Shared Responsibility Model** — AWS, bulutun *güvenliğinden* sorumludur (altyapı); siz, bulutun *güvenliğinden* (veri, yapılandırma, erişim) sorumlusunuz. Bölüm 1. Alan 1.

**Shield** — DDoS koruması. Standart: ücretsiz, otomatik. Gelişmiş: ücretli, DRT desteği ve finansal koruma ile. Bölüm 17. Alan 1.

**SNS (Simple Notification Service)** — Yayın/abone mesajlaşma. Mesajları aynı anda tüm abonelere gönderir. Fan-out deseni. Bölüm 19. Alan 2.

**Sort key (DynamoDB)** — Birincil anahtarın isteğe bağlı ikinci bileşeni. Bölüm içinde aralık sorgularını etkinleştirir. Bölüm 9. Alan 3.

**Spot Instances** — EC2 örnekleri, 60-90% indirimle boş kapasiteyi kullanır. 2 dakikalık bir uyarı ile kesilebilir. Yalnızca hata toleranslı iş yükleri için. Bölüm 27. Alan 4.

**SQS (Simple Queue Service)** — Yönetilen mesaj kuyruğu. Üreticileri tüketicilerden ayırır. Standart (en az bir kez) ve FIFO (tam olarak bir kez) kuyruklar. Bölüm 19. Alan 2.

**Step Functions** — Sunucusuz iş akışı orkestrasyon hizmeti. AWS hizmetlerini koordine etmek için durum makineleri. Bölüm 22. Alan 2.

---

## T

**Target tracking scaling** — Hedef metriğin değerine (örneğin, %60 CPU kullanımı) uymak için kapasiteyi ayarlayan Auto Scaling politikası. Bölüm 7. Alan 2.

**Transit Gateway** — Birden çok VPC'yi ve merkezi bir geçit aracılığıyla on-premises ağları birleştiren bir hub-and-spoke ağ topolojisi. Bölüm 25. Alan 3.

**TTL (Time to Live)** — DynamoDB'nin bir öğeyi otomatik olarak silmesine neden olan bir zaman damgası. DNS'de de kullanılır (çözücüler tarafından bir kaydın ne kadar süreyle önbelleğe alınacağı) ve önbellekteki bir değerin ne kadar süreyle geçerli olduğu. Bölüm 9, 12. Alan 3.

---

## V

**VIF (Virtual Interface)** — AWS Direct Connect ile kullanılan mantıksal bağlantı. Kamu VIF'leri AWS kamu uç noktalara erişir; Özel VIF'ler VPC kaynaklarına erişir. Bölüm 25. Alan 3.

**Visibility timeout (SQS)** — Alınan bir mesajın diğer tüketiciler tarafından görülmeden önce ne kadar süreyle gizlendiği. Aynı mesajı gören diğer tüketiciler tarafından görülmeden önce işleme yapılmasına izin verir. Bölüm 19. Alan 2.

**VPC (Virtual Private Cloud)** — AWS'deki izole edilmiş sanal ağ. Alt ağlar, yönlendirme tabloları ve geçitler içerir. Bölüm 11. Alan 1.

**VPC Endpoint** — VPC kaynaklarını AWS özel ağ üzerinden AWS özel ağ uç noktalarına bağlar. Geçit (ücretsiz, S3/DynamoDB) ve Arayüz (fiyatlı, diğer çoğu hizmet). Bölüm 30. Alan 1, 4.

**VPC Flow Logs** — Bir VPC'deki ağ arayüzlerine giden ve ondan giden IP trafiği hakkında bilgi toplar. GuardDuty tarafından kullanılır ve ağ sorun giderme için kullanılır. Bölüm 17. Alan 1.

**VPC Peering** — İki VPC'yi birbirine bağlayan bir ağ bağlantısı, trafiğin özel IP adresleri üzerinden rotalanmasına izin verir. Bölüm 11. Alan 3.

---

## W

**WAF (Web Application Firewall)** — IP blokları, SQL enjeksiyonları, hız sınırları gibi kuralları kullanarak HTTP/HTTPS trafiğini filtreler. CloudFront, ALB veya API Gateway'e bağlanır. Bölüm 17. Alan 1.

**Well-Architected Framework** — AWS'nin altı sütunlu değerlendirme çerçevesi: Operasyonel Mükemmellik, Güvenlik, Güvenilirlik, Performans Verimliliği, Maliyet Optimizasyonu, Sürdürülebilirlik. Bölüm 31. Çoklu alan.

**Weighted routing (Route 53)** — DNS sorgularını ağırlığa göre uç noktalara dağıtır. Mavi-yeşil dağıtımlar ve A/B testi için kullanılır. Bölüm 12. Alan 3.

**Write-through caching** — Veritabanı güncellendiğinde önbelleğe yazılır. Veriler her zaman tutarlıdır ancak birçok öğe önbelleğe alınabilir ve asla yeniden okunmayabilir. Bölüm 10. Alan 3.

---

## SAA-C03 Quick Pattern Reference

| Eğer sınav diyor...                           | Düşün...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Hizmetleri ayırıklaştır"                       | SQS, SNS, EventBridge                        |
| "Birden fazla tüketiciye yay"                  | SNS + SQS abonelikleri                      |
| "Gerçek zamanlı, sıralı olaylar"                | Kinesis Data Streams                         |
| "Sunucusuz"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Küresel düşük gecikme süresi (dinamik)"       | Global Accelerator                           |
| "Küresel düşük gecikme süresi (statik/gezinmiş)" | CloudFront                                   |
| "DDoS koruması"                              | Shield (Standart: ücretsiz; Gelişmiş: ödeme) |
| "Kenarda SQL enjeksiyonunu bloke et"            | WAF                                          |
| "Bağlantılı kimlik bilgilerini tespit et"        | GuardDuty                                    |
| "API aktivitesini denetle"                    | CloudTrail                                   |
| "Veritabanı kimlik bilgilerini döndür"          | Secrets Manager                              |
| "Müşterilerin yönettiği anahtarlarla veriyi şifrele" | KMS ile CMK                                 |
| "Yapılandırma değerlerini sakla"                | SSM Parameter Store                          |
| "Yüksek IOPS veritabanı depolama"               | io2 EBS                                      |
| "EC2 için paylaşımlı dosya sistemi"            | EFS                                          |
| "SQL ile S3 verilerini sorgula"                | Athena                                       |
| "Analitik için ETL boru hattı"                | AWS Glue                                     |
| "Akış verilerini S3'e teslim et"               | Kinesis Firehose                             |
| "Hatalara karşı dayanıklı toplu işler, maliyeti en aza indir" | Spot Instances                               |
| "Taahhütlü, istikrarlı üretim iş yükü"          | Savings Plans                                |
| "Özel alt ağ → S3 NAT olmadan"                | S3 Gateway Endpoint                          |
| "Özel alt ağ → SQS NAT olmadan"               | SQS Interface Endpoint                       |
| "RDS için çoklu bölge"                         | Otomatik failover (okuma ölçeklendirmesi değil) |
| "RDS için okuma replikası"                     | Okuma ölçeklendirmesi (otomatik failover değil) |
| "Veri kurtarma süresi < 1 dakika, bölge içinde" | Çoklu Bölge                                  |
| "Bölge çapında kurtarma, dakika RTO"          | Pilot Işık veya Ilık Beklenti                 |
| "Aktif-Aktif, sıfır RTO"                      | Çoklu Bölge Aktif-Aktif (en karmaşık)    |
