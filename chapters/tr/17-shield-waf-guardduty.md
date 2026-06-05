# Bölüm 17: Gözetçiler

Romanian IP olayının çözülmüş olması sağlanmıştı. Sırlar Secrets Manager’da saklanıyordu. Kimlikler güncelleniyordu. Ağ kontrolleri sıkılaştırılıyordu.

Ancak Priya, 16. Bölümün sonunda sorduğu soruyla devam etti: “Bir şey olağandışı ortaya çıkarsa, bunu nasıl bileceğiz?”

Dürüst cevap şuydu: muhtemelen öğrenmeyeceklerdi.

CloudTrail günlükleri, günde binlerce olay içeriyordu. Hiç kimse hepsini okumadı. Priya, her hafta manuel olarak kontrol yapıyordu, ancak bu, bir şeyin Salı günü olmasına ve bir sonraki Pazartesi’ye kadar fark edilmemesine neden olabilirdi.

“Log’ları bizim için izleyecek bir şeylere ihtiyacımız var,” dedi.

Maya başını kaldırdı. “Otomatik olarak mı?”

“Evet, otomatik olarak.”

Tom’un o günkü ikinci sorusu: “Bu ne kadar maliyetli?”

**Üç Tehdit Kategorisi**

Bulut uygulamalarına yönelik güvenlik tehditleri genellikle üç kategoriye ayrılırdı:

**Hacim Saldırıları (DDoS):** Saldırgan, uygulamanızın meşru kullanıcılarına yanıt veremeyeceği kadar çok trafik gönderir. Saldırı, milyonlarca HTTP isteği veya sunucunun bağlantı tablosunu tüketmek için tasarlanmış TCP SYN paketlerinin bir hortumu olabilir.

**Uygulama Saldırıları (İhlaller):** Saldırgan, uygulamanızdaki zayıflıkları istismar etmek için özel olarak hazırlanmış istekler gönderir - SQL enjeksiyonu, çapraz site betlaşması, ayrıştırıcının çökmesine neden olan kötü biçimlendirilmiş girişler.

**Davranışsal Anormallikler (Rehberlik ve İhlal):** Kullanıcı veritabanının tamamını 3 AM'de sorgulayan gibi olmaması gereken API çağrıları, yeni bir ülkeden kullanılan kimliklerin kullanımı gibi olağandışı IAM etkinliği veya beklenmedik hedeflere giden ağ trafiği.

AWS, her biri için özel bir hizmete sahiptir:

- **AWS Shield**: DDoS koruması
- **AWS WAF**: Uygulama katmanı koruması
- **Amazon GuardDuty**: Davranışsal tehdit tespiti

**AWS Shield: DDoS Emilici**

**AWS Shield Standard** tüm AWS müşterileri için otomatik olarak etkinleştirilir ve ek bir ücret talep edilmez. En yaygın düzey 3 (ağ) ve düzey 4 (taşıma) DDoS saldırılarını - SYN saldırıları, UDP saldırıları, DNS yükseltme saldırıları korur.

CloudFront, Route 53 ve Elastic Load Balancing, AWS ağının kenarında bulunur. Bir DDoS saldırısı uygulamanıza hedefledikten sonra, bu yönetilen hizmetlere çarpar. AWS’nin ağ altyapısı saldırının sizin EC2 örneklerinize ulaşmadan önce emilmesini sağlar.

**AWS Shield Advanced** premium katmandır ($3.000/ay kuruluş başına). Bu şunları ekler:

- EC2, ELB, CloudFront, Global Accelerator ve Route 53 için koruma
- Yakın gerçek zamanlı saldırı bildirimleri
- Saldırıları yanıtlamanıza yardımcı olabilen AWS Shield Yanıt Ekibi (SRT) - güvenlik mühendisleri
- Maliyet koruması: Bir saldırı faturanızda bir artışa neden olursa, AWS bu artış maliyetlerini telafi eder
- Katman 7’deki (uygulama katmanı) geliştirilmiş DDoS tespiti ve azaltma

“Bin üç yüz dolar bir ayda mı?” Tom dedi.

“Milyonlarca gelir elde eden işletmeler için iki saatlik bir DDoS, üç bin doları geçebilir,” dedi Priya.

Tom sessizce hesapladı.

“Standart ile başlayacağız,” dedi sonunda.

**AWS WAF: Uygulama Filtresi**

**AWS WAF (Web Application Firewall)** HTTP seviyesinde çalışır - web isteklerindeki içeriği uygulamanıza ulaşmadan önce inceler.

WAF, **Web ACL’leri (Erişim Kontrol Listeleri)** ile yapılandırılır - izin verilecek, engellenecek veya sayılacak tanımlar.

WAF şunlara bağlanabilir:

- CloudFront dağıtımları (kenar düzeyinde istekleri incelemek için küresel olarak)
- Uygulama Yük Dengeleyicileri (yerel düzeyde istekleri incelemek için)
- API Gateway
- AWS AppSync

**WAF Yönetilen Kuralları**: AWS ve üçüncü taraf sağlayıcılar önceden oluşturulmuş kural kümelerini yayınlar:

- **AWS Yönetilen Kurallar - Çekirdek Kural Seti**: OWASP En İyi 10 zayıflıklarını (SQL enjeksiyonu, XSS, komut enjeksiyonu, yol geçişi vb.) korur
- **AWS Yönetilen Kurallar - Bilinen Kötü Girişler**: Saldırı kalıplarına uyan istekleri engeller
- **AWS Yönetilen Kurallar - Amazon IP İtibar Listesi**: Bot ağları ve tarayıcılarla ilişkili IP’leri engeller
- **AWS Yönetilen Kurallar - Bot Kontrolü**: Bot trafiğini tanımlar ve yönetir

Kendi kurallarınızı da oluşturabilirsiniz:

- “Kullanıcı Etiketi başlığında ‘sqlmap’ içeren herhangi bir isteği engelle” (yaygın bir SQL enjeksiyon tarayıcısı)
- “İzin verilen IP başına 5 dakikada 1000 isteği aşmayın”
- “Parametre değerlerinde herhangi bir yerde `<script>` içeren istekleri engelle”

Nimbus için pratik kurulum: CloudFront dağıtımında Core Rule Set etkinleştirildiğinde WAF. Bu, en yaygın saldırı kalıplarını EC2 örneklerinize ulaşmadan önce engeller.

**Amazon GuardDuty: Davranışsal Analist**

GuardDuty, Shield ve WAF’dan temel olarak farklıdır. Saldırıları engellemez - **olağandışı davranışı tespit eder**.

GuardDuty sürekli olarak şunları analiz eder:

- **AWS CloudTrail günlükleri**: IAM değişiklikleri, API çağrıları, konsol oturum açmaları
- **VPC Flow Log’ları**: VPC’nizdeki ağ trafiği kalıpları
- **DNS sorgu günlükleri**: örnekleriniz tarafından çözülenler (bilinen kötü amaçlı yazılımlar genellikle belirli C2 alanlarını çözüme gönderir)

Makine öğrenimi modelleri, temelinizden sapmalar gösteren desenleri belirler. GuardDuty, anormallikleri tespit ettiğinde kategorize edilmiş uyarılar olan **bulguları** üretir.

GuardDuty'nin tespit edebileceği bazı örnekler:

- IAM kullanıcısının daha önce hiç kullanmadığı bir ülkedeki (bir ülkeyi hiç kullanmamış) bir IP adresinden oturum açması
- Tor çıkış düğümünden yapılan API çağrıları
- Bilinen bir kripto para madenciliği havuzuna bağlanabilen bir EC2 örneği
- Olağandışı yüksek API çağrı hacmi (yetki kötüye kullanımı veya tarama)
- S3 deposuna, kötü amaçlı faaliyetlerde bulunan IP adresleriyle erişilmesi
- Kötü amaçlı yazılım komut ve kontrol trafiğine bağlı olan bir alan adına yönelik dışarıya doğru trafik

"Bu, Romen IP'yi yakalamak için kullanılabilecek şey olurdu," dedi Leo sessizce.

"GuardDuty etkinleştirilmiş olsaydık, EC2 örneği 2 AM'de tanınmayan harici bir IP adresine yönelik dışarıya doğru bağlantılar yaparak uyarıyı tetikleyecekti," dedi Priya.

"Ne kadar maliyetli?"

GuardDuty fiyatlandırması, analiz edilen günlük hacmine dayanır: CloudTrail olayları, VPC akış verileri, DNS sorguları. Küçük ila orta ölçekli bir uygulama için tipik olarak 50-150 ABD doları/ay. Büyük ölçekte bile, yine de altyapı maliyetlerinin küçük bir kesimidir.

Tom konsolu açtı ve etkinleştirdi.

**Üç Hizmeti Bağlama**

Shield, WAF ve GuardDuty farklı katmanlarda çalışır ve birbirini tamamlar:

| Hizmet      | Katman                     | Karşı Karşıya Olduğu                        | Eylem                               |
|-------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield  | Ağ/Ulaşım (L3/L4)        | DDoS sellerleri                         | Emilerek/azaltılarak saldırıları önleme |
| AWS WAF     | Uygulama (L7)          | OWASP Top 10, botlar, tarayıcılar          | İstekleri izin ver, engelle veya say |
| GuardDuty   | Davranışsal (tüm günlükler) | Anormallikler, tehlike altında olan kimlikler, kötü amaçlı yazılım | Tespiti ve uyarı gönderme          |

Shield sellerleri durdurur. WAF suyu filtreler. GuardDuty, alışılmadık akış kalıpları için boru hattını izler.

**CloudTrail: Temel**

Tüm bu hizmetler günlüklere dayanır. **AWS CloudTrail**, AWS hesabınızdaki her API çağrısını yakalayan günlük hizmetidir – kimin neyi, ne zaman, nereden ve hangi sonuçla çağırdığı.

CloudTrail, konsolda 90 günlük bir geçmiş için varsayılan olarak etkinleştirilir. Günlükleri uzun vadede saklamak için:

1. S3 deposuna yazan bir iz oluşturun
2. Gerçek zamanlı uyarılar için isteğe bağlı olarak CloudWatch Logs'a gönderin
3. Günlük dosya doğrulamasını etkinleştirin (günlüklerin değiştirilip değiştirilmediğini tespit etmek için)

GuardDuty, AWS Config ve Security Hub, CloudTrail'den okur. CloudTrail günlükleri olmadan bu hizmetler hiçbir şey analiz edemez.

**AWS Security Hub: Gösterge Tablo**

Birden çok AWS hesabı çalıştırıyorsanız veya güvenlik bulgularını birleştirilmiş bir görünümde istiyorsanız, **AWS Security Hub**, GuardDuty, Inspector (zayıflık değerlendirmesi), Macie (veri gizliliği), Config ve Firewall Manager'dan bulguları tek bir gösterge tabloda toplar.

Ayrıca, AWS Temel Güvenlik En İyi Uygulamaları standardı ve CIS AWS Temeller Benchmark'u ile yapılandırmanızı kontrol eder.

Nimbus için: Security Hub henüz gerekli değildi. Üç hesaba (geliştirme, hazırlık, üretim) ulaştıklarında kullanışlı hale gelecekti.

## Güçlü Yönler ve Sınırlamalar

**AWS Shield**:

- Standart: ücretsiz ve otomatik — kullanmanız için bir nedeni yok
- Gelişmiş: yüksek profilli hedefler için mükemmel; küçük ekipler için pahalı

**AWS WAF**:

- Yönetilen kural grupları kurulumu önemli ölçüde basitleştirir
- Özel kurallar, HTTP saldırı kalıplarının anlaşılmasını gerektirir
- Hız sınırlaması, sık göz ardı edilen güçlü bir özelliktir
- WAF, güvenli uygulama kodunun bir yerini tutmaz — savunma-içinde bir katmandır

**GuardDuty**:

- Etkinleştirmek son derece kolaydır (birkaç tıklama)
- Bulgular insan incelemesi ve yanıtı gerektirir — GuardDuty tespit eder, düzeltmez
- Yanlış pozitifler meydana gelir — bazı meşru etkinlikler ML modelleri tarafından anomali olarak algılanır
- 30 günlük ücretsiz deneme — hemen etkinleştirmek için değerlidir

## Özet

- **AWS Shield Standart**: Ücretsiz, otomatik DDoS koruması katman 3/4'te. Her zaman açıktır.
- **AWS Shield Gelişmiş**: SRT erişimi ve maliyet koruması ile yüksek profilli saldırılara karşı koruma. Kurumsal kullanım durumu.
- **AWS WAF**: Uygulama katmanı güvenlik duvarı. HTTP isteklerini inceleyin ve filtreleyin. OWASP Top 10 koruması için Yönetilen Kural Gruplarını kullanın.
- **Amazon GuardDuty**: Davranışsal tehdit tespiti. CloudTrail, VPC Akış Günlükleri ve DNS Günlükleri analiz eder. Anormal aktivite için bulgular üretir.
- **CloudTrail**: Tüm AWS güvenlik günlüklerinin temeli. S3'e yazan bir iz oluşturun ve uzun vadeli saklama için kullanın.
- Bu hizmetler birbirini tamamlar: Shield ağ katmanında, WAF uygulama katmanında, GuardDuty davranışsal katmanında çalışır.

## Sınav İpuçları

*SAA-C03 Alan: Güvenli Mimari Tasarımı (Alan 1, Görev 1.2)*

- **Standart Kalkan vs. Gelişmiş Kalkan**: Standart ücretsizdir ve otomatik olarak çalışır. Gelişmiş kalkanın kullanımı ücretlidir ve SRT (Sözde Adresleme), maliyet koruması ve daha iyi tespitler ekler. Gelişmiş kalkan için sınav sinyalleri: "Büyük ölçekli bir DDoS saldırısı", "Saldırılar sırasında SLA garantisi", "DDoS'dan kaynaklanan maliyet artışlarına karşı finansal koruma".
- **WAF Kullanım Senaryosu Sinyalleri**: "SQL enjeksiyonlarını engelle", "Çapraz Site Bağlamında Yazılım Hatalarını engelle", "API çağrılarını hız sınırlandır", "Belirli kullanıcı ajitasyonlarını engelle", "OWASP En İyi 10 Koruması" → WAF.
- **GuardDuty Sinyalleri**: "Olağan dışı API aktivitesini tespit et", "Kimlik bilgilerini tespit et", "Anormal EC2 ağ bağlantılarını işaret et", "Tehdit istihbaratı" → GuardDuty.
- **WAF Bağlantısı**: CloudFront (küresel), ALB (yerel), API Gateway (yerel) ile bağlanabilir.
- **GuardDuty Veri Kaynakları**: CloudTrail yönetim olayları, CloudTrail S3 veri olayları, VPC Akış Günlükleri, DNS günlükleri. Bir tespit senaryosuna ilişkin ilgili veri kaynağı sorulabilir.
- **Macie**: Genellikle GuardDuty ile karıştırılır. **Macie**, S3'teki hassas verileri (PII, kimlik bilgileri, finansal veriler) tespit etmek için ML'yi kullanır. **GuardDuty**, AWS hesabınızdaki tehditleri ve davranışsal anormallikleri tespit eder. Farklı kullanım durumları.

## Uygulamalar

**Uygulama 1 — Hatırlama**

AWS WAF ve Amazon GuardDuty arasındaki farkı açıklayın. Her hizmet neyi korur ve her hizmet hangi katmanda çalışır?

*(İpucu: WAF'i gelen istekleri filtreleyen bir şey olarak düşünün ve GuardDuty'yi AWS'nizdeki davranışları izleyen bir analist olarak düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir perakende şirketinin web sitesi, ürün arama API'sine saatte milyonlarca istek gönderen bir botnet tarafından hedefleniyor. İstekler geçerli (geçerli Kullanıcı Ajitasyon dizeleri, geçerli oturum çerezleri) görünmektedir, ancak satın alma işlemleri sonuçlanmamaktadır - yalnızca ürün fiyatlarını taramaktadırlar. Saldırı, meşru müşterilerin yanıt sürelerini yavaşlatmaktadır.

Bu tehdide en iyi çözüm hangi hizmet kombinasyonudur?

A) AWS Shield Advanced ve CloudFront
B) AWS WAF ile hız sınırlama kuralları ve CloudFront
C) Amazon GuardDuty ve AWS Shield Standart
D) NACL'ler tarafından botnet'in IP aralıklarının engellenmesi

**İpucu 1**: İstekler HTTP katmanındadır (uygulama katmanı). Hangi hizmet bu katmanda çalışır?

**İpucu 2**: Botnet'ler çok sayıda farklı IP adresini kullanır - NACL düzeyinde belirli IP aralıklarını engellemek büyük botnetlere karşı etkili değildir.

**İpucu 3**: IP adresi başına hız sınırlaması, engellemenin tamamen başarılı olmasa bile tarama etkisini azaltabilir.

**Cevap**: B

**Açıklama**: AWS WAF, IP adresi başına istek hızını sınırlayarak yüksek hacimli taramaların herhangi bir tek kaynaktan kaynaklanması durumunda etkisini azaltır. CloudFront, gelen trafiği AWS'nin kenar ağının dağıtımı aracılığıyla emerek hacmi emer ve kökeni korur. WAF kuralları ayrıca aynı API uç noktasına ardışık isteklerin hızına göre (yüksek hacimli tarama davranışı) eşleşebilir.

**Neden A?** Shield Advanced, DDoS akımlarını korur (katman 3/4). Senaryo, uygulama katmanında taramayı (katman 7 HTTP istekleri) ele almaktadır, Shield bunu incelemez.

**Neden C?** GuardDuty, AWS hesabınızdaki davranışsal anormallikleri tespit eder - gelen HTTP isteklerini engellemez. Shield Standart, uygulama katmanı saldırılarını ele almaz.

**Neden D?** Büyük botnet'ler, dağıtılmış kaynaklardan binlerce IP adresini kullanır. Belirli aralıkları engellemek, sofistike botnetlere karşı başarısız olan bir "sopa-salyangozu" yaklaşımıdır.

*SAA-C03 Alanı: Güvenli Mimari Tasarımı — Görev 1.2*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, kredi kartı verilerini ele geçirme konusunda tehdit modelini değerlendiriyor. Bir PCI-DSS incelemesi gerektiriyor:

- Ağ katmanında DDoS saldırılarına karşı koruma
- Bilinen web açıkları için uygulama katmanında filtreleme
- Tüm API çağrılarını, değiştirilmeye karşı dayanıklı, uzun ömürlü bir depoda kaydetme
- Ödeme hizmetine erişim kalıplarındaki olağandışı aktiviteleri tespit etme

Her gereksinimi belirli bir AWS hizmeti veya yapılandırmayla eşleştirin. Shield Standart yeterli midir, yoksa PCI-DSS bağlamı daha gelişmiş bir şey önermiyor mu? WAF'i nereye bağlarsınız?

*(Tek bir doğru cevap yoktur. Amaç, uyumluluk gereksinimlerini AWS hizmetlerine eşleştirme pratiği yapmaktır.)*

## Kredilere Veda Sahnesi

GuardDuty etkinleştirildi.

Kırk sekiz saat sonra, ilk bulgusunu üretti: *"i-0abc123 EC2 örneği, bilinen bir Tor çıkış düğümüne iletişim kuruyor."*

Leo, örnek kimliğini inceledi.

"Bu, ağ tanıdıcılarını çalıştırmamın yaptığı iç denetim örneğidir," dedi. "Aynı zamanda anonim veri toplama için de çalışan meşru bir açık kaynaklı ağ tarayıcısını kurdum."

"Bu düğüme iletişim kurması gerekiyor mu?"

"Hayır." Bir an duraksadı. "Neden?"

Örnekteki bilgileri çekti. Bir kişi tarafından kurulu olan bir araç vardı - bu araç, aynı zamanda Tor altyapısıyla iletişim kuruyordu - ancak bu, gizli veri toplama için yapılıyordu.

"Yani araç evine çağrı yapıyordu," dedi Priya.

"Yetkisiz yaptıkları halde," diye doğruladı Leo.

"Bu, bir tedarik zinciri riski. Yetkilendirmeden yaptıkları bir bağımlılıktır."

Leo aracı kaldırdı. Her üçüncü taraf aracı kurulumdan önce inceleme süreci ayarladı.

"Şimdi bu kadar paranoya seviyesindeyiz mi?" Maya sordu.

"Evet," dedi Priya.

"Bu, hep bu seviyede olmalı mıydın?" Maya sordu.

"Da, evet," dedi Priya.

Bir sonraki bölümde: Virginia'daki veri merkezi yok olduğunda — ve Nimbus'un neden hala çalıştığını öğreniyoruz.
