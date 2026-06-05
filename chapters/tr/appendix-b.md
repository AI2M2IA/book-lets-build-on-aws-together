# Ekipman B: SAA-C03 Alan Haritası

AWS Çözüm Mimarı Yardımcısı sınavı (SAA-C03), dört alana göre düzenlenmiştir. Bu ek, kitabın her bölümünün ilgili alana ve göreve eşleştirilmesini sağlayarak, bölüm sırasına göre değil, sınav alanına göre çalışmanıza olanak tanır.

---

## Alan Genel Bakışı

| Alan                                          | Ağırlık | Açıklama                                            |
|-----------------------------------------------|---------|--------------------------------------------------------|
| Alan 1: Güvenli Mimari Tasarımı                | %30    | IAM, ağ güvenliği, veri koruma                     |
| Alan 2: Dayanıklı Mimari Tasarımı             | %26    | Yüksek kullanılabilirlik, hata toleransı, felaket kurtarma |
| Alan 3: Yüksek Performanslı Mimari Tasarımı   | %24    | Hesaplama, depolama, veritabanı, ağ performansı        |
| Alan 4: Maliyet Optimizasyonlu Mimari Tasarımı | %20    | Fiyatlandırma modelleri, maliyet yönetimi, kaynak optimizasyonu |

---

## Alan 1: Güvenli Mimari Tasarımı (%30)

**Görev 1.1 — AWS kaynaklarına güvenli erişim tasarlayın**

Temel kavramlar: IAM kullanıcıları, grupları, roller, politikalar. En az ayrıcalık ilkesi. Hesaplar arası erişim. Hizmet rolleri. AWS Organizasyonlardaki Hizmet Kontrol Politikaları (SCP).

| Bölüm    | Konu                                                                        |
|------------|------------------------------------------------------------------------------|
| Bölüm 3  | IAM temelleri: kullanıcılar, gruplar, roller, politikalar, politika değerlendirmesi |
| Bölüm 14 | IAM gelişmiş: hizmetler için roller, izin sınırları, hesaplar arası roller |
| Bölüm 3  | Politika değerlendirme mantığı: açık reddet > açık izin > örtülü reddet      |
| Bölüm 14 | AWS Organizasyonları ve SCP'ler                                                   |

Temel sınav kalıpları:

- "EC2, S3'e hardkodlanmış kimlik bilgiler olmadan erişmesi gerekiyor" → S3 politikası ile EC2 örneği profiline takılan bir IAM rolü
- "Farklı hesaplar kaynakları paylaşmalı" → Hesaplar arası güvenilirlik politikası olan bir IAM rolü
- "Bir OU'daki tüm IAM kullanıcılarını bir hizmetten engellemek" → AWS Organizasyonlarındaki SCP'de bir SCP

---

**Görev 1.2 — Güvenli iş yükleri ve uygulamalar tasarlayın**

Temel kavramlar: VPC tasarımı, güvenlik grupları vs. NACL'ler, ağ yalıtımı, DDoS koruması, WAF, GuardDuty.

| Bölüm    | Konu                                                                              |
|------------|------------------------------------------------------------------------------------|
| Bölüm 11 | VPC tasarımı: halka açık/özel alt ağlar, NAT Gateway, İnternet Gateway, rota tabloları |
| Bölüm 15 | Güvenlik grupları (durum bilgili, örnek düzeyinde) vs. NACL'ler (durumsuz, alt ağ düzeyinde) |
| Bölüm 17 | Shield (DDoS koruması), WAF (uygulama güvenlik duvarı), GuardDuty (tehdit tespiti) |
| Bölüm 25 | Direct Connect, VPN, Transit Gateway, Özel Bağlantı                                  |

Temel sınav kalıpları:

- "Bir alt ağdan belirli bir IP adresini engelle" → NACL reddi kuralı
- "HTTP'yi içeriye, otomatik olarak HTTP yanıtını dışarıya izin ver" → Güvenlik grubu (durum bilgili)
- "SQL enjeksiyonuna karşı web uygulamasını koru" → WAF ile SQL enjeksiyonu kuralı
- "İstemci kimlik bilgilerini tespit et" → GuardDuty

---

**Görev 1.3 — Uygun veri güvenliği kontrollerini belirleyin**

Temel kavramlar: Dinlenme ve iletimde şifreleme, KMS, Secrets Manager, Parametre Deposu, S3 sunucu tarafında şifreleme.

| Bölüm    | Konu                                                                    |
|------------|--------------------------------------------------------------------------|
| Bölüm 16 | KMS: müşteri yönetilen anahtarlar, anahtar döndürme, zarf şifrelemesi            |
| Bölüm 16 | Secrets Manager: otomatik kimlik bilgisi döndürme, çalışma zamanında sır erişimi |
| Bölüm 5  | S3 şifreleme seçenekleri: SSE-S3, SSE-KMS, SSE-C                            |
| Bölüm 8  | RDS dinlenme şifrelemesi (oluşturulurken etkinleştirilmelidir)                     |

Temel sınav kalıpları:

- "Veritabanı kimlik bilgilerini otomatik olarak döndür" → Secrets Manager ile RDS entegrasyonu
- "Anahtarları hesaplar arasında kontrol et" → KMS anahtar politikası
- "Sır olmayan yapılandırma değerlerini sakla" → SSM Parametre Deposu (Secrets Manager değil)
- "S3 nesnelerini şirket yönetilen anahtarlarla şifrele" → SSE-KMS ile CMK

---

## Alan 2: Dayanıklı Mimari Tasarımı (26%)

**Görev 2.1 — Ölçeklenebilir ve gevşek bağlı mimariler tasarlayın**

Temel kavramlar: Otomatik Ölçekleme, yük dengeleyiciler, SQS/SNS ayrımı, Lambda olay tetikleyicileri, ECS/EKS, Step Functions.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 7  | Otomasör Grupları (ASG), Uygulama Yük Dengeleyici (ALB), ölçekleme politikaları |
| Chapter 19 | SQS (servisler arası ayrılma kuyrukları), SNS (fan-out bildirimleri)        |
| Chapter 20 | Lambda: sunucusuz hesaplama, olay tetikleyicileri, eşzamanlılık          |
| Chapter 21 | ECS ve EKS: kapalı mikroservisler                                  |
| Chapter 22 | Step Functions: iş akışı orkestrasyonu                               |
| Chapter 26 | Kinesis: gerçek zamanlı veri akışı                                  |

---

**Görev 2.2 — Yüksek Erişilebilirlik ve/veya Toleranslı Mimariler Tasarlayın**

Temel kavramlar: Çoklu Bölge (AZ), Çoklu Bölge, Route 53 geçişi, RDS okuma replikaları, Aurora Küresel Veritabanı, yedekleme ve kurtarma.

| Chapter    | Topic                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Chapter 2  | AWS küresel altyapısı: Bölgeler, AZ'ler, kenar konumları                                      |
| Chapter 7  | ALB birden fazla AZ'de, ASG sağlıksız örnekleri değiştirir                                    |
| Chapter 8  | RDS Çoklu-AZ: senkron replikasyon, otomatik geçiş                                    |
| Chapter 12 | Route 53: geçiş yönlendirme, gecikme yönlendirme, sağlık kontrolleri                                   |
| Chapter 18 | Çoklu-AZ vs. Çoklu-Bölge: RTO/RPO, afet kurtarma stratejileri (pilot ışık, sıcak bekleme, aktif-aktif) |
| Chapter 24 | Aurora Küresel Veritabanı: bölge arası okuma replikaları, < 1s replikasyon gecikmesi                     |

---

## Alan 3: Yüksek Performanslı Mimarileri Tasarlayın (24%)

**Görev 3.1 — Yüksek Performanslı ve/veya Ölçeklenebilir Depolama Çözümleri Belirleyin**

Temel kavramlar: S3 vs. EBS vs. EFS, depolama sınıfı seçimi, S3 Transfer Hızlandırma, çoklu yükleme, CloudFront için varlıklar.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| Chapter 5  | S3: nesne depolama, depolama sınıfları, sürümleme, yaşam döngüsü         |
| Chapter 6  | EBS: blok depolama türleri (gp3, io2, st1), EFS: paylaşımlı dosya depolama |
| Chapter 23 | S3 depolama sınıfı geçişleri, Glacier kurtarma seçenekleri            |
| Chapter 28 | EBS boyutlandırma, gp2→gp3 göçü, anlık görüntü yönetimi           |

---

**Görev 3.2 — Yüksek Performanslı ve/veya Ölçeklenebilir Hesaplama Çözümleri Belirleyin**

Temel kavramlar: EC2 örnek aileleri, Graviton işlemciler, Otomasör Grupları, Lambda, Fargate, Spot Örnekleri.

| Chapter    | Topic                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Chapter 4  | EC2 örnek türleri: hesaplama odaklı (c), bellek odaklı (r), genel amaçlı (m, t) |
| Chapter 7  | Otomasör Grupları: web katmanları için yatay ölçekleme                                          |
| Chapter 20 | Lambda: eşzamanlılık, tutarlı eşzamanlılık (sabit gecikme için)                   |
| Chapter 21 | ECS Fargate: sunucusuz kapalı uygulamalar                                                      |
| Chapter 27 | Spot Örnekleri için toleranslı toplu iş yükleri                                       |

---

**Görev 3.3 — Yüksek Performanslı Veritabanı Çözümleri Belirleyin**

Temel kavramlar: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, erişim kalıpları, okuma replikaları, DAX.

| Chapter    | Topic                                                              |
|------------|--------------------------------------------------------------------|
| 8. Bölüm    | RDS: yönetilen ilişkisel veritabanları, RDBMS kullanımında ne zaman kullanılır |
| 9. Bölüm    | DynamoDB: NoSQL, bölüm anahtarları, GSI, DAX (bellek içi önbellek)        |
| 10. Bölüm   | ElastiCache: Redis ile Memcached karşılaştırması, önbellekleme stratejileri |
| 24. Bölüm   | Aurora: performans, Sunucusuz v2, okuma replikaları, Küresel Veritabanı |
| 29. Bölüm   | DynamoDB talep üzerine vs. otomatik ölçeklendirme ile tahsis edilmiş kapasite |

---

**Görev 3.4 — Yüksek performanslı ve/veya ölçeklenebilir ağ mimarilerini belirleyin**

Temel kavramlar: CloudFront, Global Accelerator, Direct Connect, VPN, yerleşim grupları, geliştirilmiş ağlar.

| Bölüm      | Konu                                                              |
|------------|------------------------------------------------------------------|
| 12. Bölüm   | Route 53: yönlendirme politikaları: gecikmeye dayalı, coğrafi konum, ağırlıklı |
| 13. Bölüm   | CloudFront: CDN, kenar önbellekleme, Lambda@Edge                       |
| 25. Bölüm   | Direct Connect: özel, özel bağlantı                               |
| 25. Bölüm   | AWS Global Accelerator: en yakın AWS uç noktasına anycast yönlendirmesi |
| 30. Bölüm   | VPC Uç Noktaları: AWS hizmetlerine özel bağlantı                    |

Temel sınav kalıpları:

- "Dinamik API yanıtlarına erişen küresel kullanıcılar için gecikmeyi azaltın" → Global Accelerator (CloudFront, önbelleğe alınabilen içerik için en iyisidir)
- "Global olarak statik varlıklar için gecikmeyi azaltın" → CloudFront
- "On-premises'ten AWS'ye tutarlı özel bağlantı" → Direct Connect
- "S3 bucket'ınıza dünya çapındaki müşterilerden hızlı yükleme" → S3 Transfer Acceleration

---

**Görev 3.5 — Yüksek performanslı veri girişi ve dönüşüm çözümlerini belirleyin**

Temel kavramlar: Kinesis Data Akışları, Kinesis Firehose, Glue, Athena, EMR.

| Bölüm      | Konu                                                               |
|------------|---------------------------------------------------------------------|
| 26. Bölüm   | Kinesis Data Akışları: sıralı, olay bazlı gerçek zamanlı işleme          |
| 26. Bölüm   | Kinesis Data Firehose: S3, Redshift, OpenSearch'e yönetilen teslimat |
| 26. Bölüm   | AWS Glue: sunucusuz ETL, Veri Kataloğu, Tarayıcılar                   |
| 26. Bölüm   | Athena: S3 üzerinde sunucusuz SQL                                      |

Temel sınav kalıpları:

- "Tıklama akış verilerini gerçek zamanlı olarak işle" → Kinesis Data Akışları + Lambda veya KDA
- "Akış verilerini daha sonra analiz için S3'e teslim et" → Kinesis Firehose
- "Birden çok kaynaktan verileri dönüştür ve katalogla" → AWS Glue
- "S3'te depolanan geçmiş verileri SQL ile sorgula" → Athena

---

## Alan 4: Maliyet Optimizasyonlu Mimarileri Tasarlayın (20%)

**Görev 4.1 — Maliyet Optimizasyonlu Depolama Çözümleri Tasarlayın**

| Bölüm      | Konu                                                              |
|------------|--------------------------------------------------------------------|
| 23. Bölüm   | S3 yaşam döngüsü politikaları, depolama sınıfı geçişleri                |
| 28. Bölüm   | EBS boyutlandırması, gp2->gp3 göçü, S3 sürümleme yaşam döngüsü kuralları |
| 28. Bölüm   | EFS Akıllı Katmanlama, maliyet tahsis etiketleri, AWS Bütçeleri        |

Temel sınav kalıpları:

- "S3 maliyetlerini en çok üreten ekibi belirle" → Maliyet tahsis etiketleri + Maliyet İzleyicisi
- "Nadiren erişilen nesneler için maliyetleri otomatik olarak azalt" → S3 Akıllı Katmanlama
- "Aylık maliyetlerin 10.000$'ı aştığında uyarı al" → AWS Bütçeleri

---

**Görev 4.2 — Maliyet Optimizasyonlu Hesaplama Çözümleri Tasarlayın**

| Bölüm      | Konu                                                                            |
|------------|----------------------------------------------------------------------------------|
| 27. Bölüm   | EC2 fiyatlandırması: Talep Üzerinde, Rezervasyonlu, Tasarruf Planları, Spot, Özel Hostlar |
| 20. Bölüm   | Lambda: çağırmaya göre ödeme (boşta bekleme maliyeti yok)                               |

Temel sınav kalıpları:

- "Sabit üretim iş yükleri için maliyeti azalt" → Tasarruf Planları (daha esnek) veya Rezervasyonlu
- "Kesilebilir toplu işleri en aza indirin" → Spot Instances
- "Boşta bekleme maliyeti olmayan olay odaklı işleme" → Lambda

---

**Görev 4.3 — Maliyet Optimizasyonlu Veritabanı Çözümleri Tasarlayın**

| Bölüm      | Konu                                             |
|------------|---------------------------------------------------|
| 29. Bölüm   | DynamoDB talep üzerine vs. tahsis edilmiş + Otomatik Ölçeklendirme |
| 29. Bölüm   | RDS ve ElastiCache Rezervasyonlu Instance/Knotları      |
| 29. Bölüm   | RDS anlık görüntü yönetimi                           |

Temel sınav kalıpları:

- "Öngörülemeyen DynamoDB trafiği" → On-Demand Kapasite Modu
- "Tutarlı DynamoDB trafiği bilinen zirvelerle" → Tahmin Edilmiş + Otomatik Ölçekleme
- "RDS maliyetlerini istikrarlı bir iş yükü için azaltın" → Rezervasyonlu Turlar (1 veya 3 yıl)

---

**Görev 4.4 — Maliyet Optimizasyonlu Ağ Mimarileri Tasarlayın**

| Bölüm    | Konu                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Bölüm 30 | Veri aktarım ücretleri: giriş (ücretsiz), aynı bölge içi ($0,01/GB), farklı bölgeler arası, internet ($0,09/GB) |
| Bölüm 30 | NAT Geçidi ($0,045/GB) vs. VPC Uç Noktaları (Geçidi: ücretsiz; Arayüz: fiyatlandırılmış)                  |
| Bölüm 30 | İçerik Dağıtım Maliyetlerini Optimize Eden CloudFront                                                    |

Temel sınav kalıpları:

- "Özel alt ağdaki EC2, S3'e çağrı yapar — NAT Geçidi maliyetlerini ortadan kaldırın" → S3 Geçidi Uç Noktası (ücretsiz)
- "Özel alt ağdaki EC2, SQS'ye çağrı yapar — NAT Geçidi maliyetlerini azaltın" → SQS Uç Noktası
- "Küresel içerik dağıtımı için veri aktarım maliyetlerini azaltın" → CloudFront (kaynak isteklerini azaltan önbellekleme)

---

## Çoklu Alan Konuları

Bazı konular birden fazla alanda görünür:

| Konu                              | Alanlar | Bölümler     |
|------------------------------------|---------|--------------|
| İyi Yapılmış Mimari Çerçevesi         | Tüm     | 31           |
| Mimari İncelemeleri ve ADR'ler      | Tüm     | 32           |
| Karar Verme Mantığı ("it depends") | Tüm     | 33           |
| Çoklu Bölge Tasarımı                | 2, 3    | 7, 8, 18, 24 |
| İzleme ve Gözetim                | 1, 2    | Tüm Bölümler   |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Sınav Öncesi Kontrol Listesi

SAA-C03'e oturmadan önce:

**Yüksek Ağırlıklı Alanlar (En Çok Görünecek)**

- [ ] IAM politika mantığı değerlendirmesi (açık reddetme → açık izin → örtülü reddetme)
- [ ] VPC bileşenleri: alt ağlar, yönlendirme tabloları, IGW, NAT Geçidi, güvenlik grupları, NACL'ler
- [ ] S3 depolama sınıfları ve her birini ne zaman kullanacağınız
- [ ] RDS Çoklu Bölge vs. Okuma Taklidi (failover vs. okuma ölçeklendirme)
- [ ] SQS vs. SNS vs. EventBridge (çekme vs. itme vs. olay yönlendirme)
- [ ] EC2 fiyatlandırma modelleri: Spot arıza toleranslı iş yükleri için, Tasarruf Planları taahhütlü iş yükleri için
- [ ] Lambda tetikleyicileri ve işlevler (konum)
- [ ] DynamoDB vs. Aurora vs. Redshift (erişim modeli seçiminizi belirler)
- [ ] CloudFront: statik içerik için CDN, dinamik içerik için Global Accelerator

**Ortak Tuzaklar**

- [ ] EBS bir örneğe bağlanır; EFS paylaşılır
- [ ] RDS Okuma Taklidi okuma ölçeklendirme için, otomatik failover değildir (bu Çoklu Bölge'dir)
- [ ] NACL'ler durumsuzdur (hem giriş hem de çıkış kuralları gerekir)
- [ ] Geçidi Uç Noktaları ücretsizdir ve yalnızca S3 ve DynamoDB için kullanılır
- [ ] Kinesis tutar ve oynatır; SQS tüketim üzerine silinir
- [ ] "Çoğalt" her zaman SQS'yi ifade etmez — SNS fan-out ve EventBridge de çoğaltma kalıplarıdır
- [ ] Shield Standart ücretsiz ve otomatik; Advanced ücretli bir abonelik

**Sınav Yapısı**

- 65 soru, 130 dakika (2 saat 10 dakika)
- Çoktan seçmeli (tek doğru) ve çoktan seçmeli (doğru N sayıda seçin)
- Geçme puanı: 720'den 1000'e
- Değerlendirilmemiş sorular gömülüdür, hangilerinin olduğunu bilemezsiniz
- Zamanı yönetin: ~2 dakika/soru; zor olanları işaretleyin ve geri dönün
