# Bölüm 20: Bayilik Modeli

Sipariş bildirim fonksiyonu her sipariş için tam olarak bir kez çalıştı. Siparişler arasında hiçbir şey yapmadı. Salı günü 17 saat boyunca hiçbir sipariş gelmedi. Bu 17 saat boyunca fonksiyon hiçbir maliyet oluşturmadı. Hiçbir kuruş. Hiçbir sunucu boşta değildi, hiçbir örnek beklemiyordu, hiçbir ayrılmış kapasite kullanılmıyordu. Fonksiyon mevcuttu, sadece çalışmıyordu.

SNS/SQS fan-ı çalışıyordu. Analitik hizmet, bildirim hizmeti ve e-posta hizmeti her biri kendi SQS kuyruklarından tüketiyordu.

Ancak Priya bir şey fark etti.

"E-posta hizmeti," dedi. "Saat başına kaç e-posta gönderiyoruz?"

Leo metrikleri kontrol etti. "Ortalama 400. Cuma geceleri yaklaşık 1.200."

"Ve e-posta hizmetini çalıştıran EC2 örneği ne kadar süre çalışıyor?"

"Her zaman. 7/24."

"Saat 3'te e-posta göndermediğimizde bile?"

Sessizlik.

"Hiçbir şey yaparken oturan bir bilgisayar için ödeme yapıyoruz," dedi Leo.

"Kaç saat içinde?"

Daha fazla sessizlik.

"Yaklaşık 18."

Tom şimdi çok dikkatliydi.

**Sunucu Her Zaman Cevap Değil**

EC2 örnekleri kalıcıdır. Birini başlatırsınız ve kullanılıp kullanılmadığına bakılmaksızın 7/24 çalışır. Web sunucunuz için (tüm saatlerde trafiği yöneten), bu doğrudur. E-posta hizmeti için (e-posta gönderileri ve ardından saatlerce boşta kalan), bu israfçadır.

Otomatik Ölçekleme Grubu, boş saatlerde e-posta hizmetini tek bir örneğe ölçeklendirebilir. Ancak tek bir örnek sürekli olarak çalışır.

Çalışma kodu sadece iş yaparken çalışırsa ne olurdu?

Bu, **sunucusuz hesaplama**nın önermesiydi.

**AWS Lambda: Sunucular Olmadan Kod**

**AWS Lambda**, sunucuları kurmaya veya yönetmeye gerek kalmadan olaylara yanıt olarak kodu çalıştırmanıza olanak tanır. Bir fonksiyon yükler, hangi tetikleyicinin onu çalıştırmasını belirtir ve Lambda, tetikleyici ateşlendiğinde onu çalıştırır.

Bir Lambda fonksiyonu:

- Tutarlı bir durumuna sahip değildir (her çağrı bağımsızdır)
- Çalışma süresi en fazla 15 dakika olabilir
- 0'dan binlerce eş zamanlı çağrıya otomatik olarak ölçeklenir
- Çalıştığı zaman fatlandırılır (1 ms'lik yürütme, tahmini olarak, tahsis edilen GB'ye göre)

Hiçbir tetikleyici olmadığında Lambda hiçbir maliyet oluşturmaz. Tetikleyiciler ateşlendiğinde Lambda çalışır ve fatlandırılır. 10.000 tetikleyici aynı anda ateşlendiğinde Lambda 10.000 eş zamanlı çağrıyı çalıştırır. Ölçekleme otomatik ve neredeyse anıdır.

**Olay Tetikleyicileri: Lambda'yı Uyanlatan Şeyler**

Lambda fonksiyonları kendi başlarına çalışmaz - olaylara yanıt verir. Yaygın tetikleyiciler şunları içerir:

- **SQS kuyruğu**: Kuyruktan mesajları işler. Lambda, kuyruktan mesajları toplar ve fonksiyonu toplu mesajlarla çağırır.
- **API Gateway**: HTTP isteği gelir. API Gateway Lambda'yı tetikler. Lambda bir yanıt oluşturur.
- **S3 olayı**: Bir dosya S3'e yüklenir. Lambda bunu işler (bir görüntüyü yeniden boyutlandırır, bir CSV'yi ayrıştırır, bir belgeyi doğrular).
- **SNS**: Bir konu'ya bir mesaj yayınlanır. Lambda bilgilendirilir.
- **DynamoDB Akışları**: DynamoDB'deki bir kayıt değişir. Lambda değişikliği işler.
- **CloudWatch Etkinlikleri (EventBridge)**: Cron işi gibi, belirli bir zamanda planlanmış bir olay çalıştırılır.
- **ALB**: HTTP isteği yük denleyicideki bir sunucuya ulaşır. Lambda, belirli rotalar için işleyebilir.

Nimbus için, e-posta hizmeti bir SQS kuyruğuna tetiklenen bir Lambda fonksiyonu oldu. Kuyruktaki bir mesaj geldiğinde, Lambda mesaj içeriği ile çağrılır, SES (Simple Email Service) aracılığıyla e-postayı gönderir ve çıkış yapar.

Hiçbir sunucu yok. Boşta olmadığında hiçbir zaman boşta zaman yok. Boşta olmadığında hiçbir maliyet yok.

**Soğuk Başlangıç Problemi**

Lambda fonksiyonları, küçük, izole kapılardan oluşan **yürütme ortamlarında** çalışır. Bir fonksiyon çağrıldığında:

1. AWS, bir yakın zamanda çağrılan bir ortamın mevcut olup olmadığını kontrol eder
2. Eğer varsa: fonksiyon hemen çalışır
3. Eğer değilse: AWS, kodunuzu indirir, çalışma zamanını başlatır, fonksiyonunuzun başlatma kodunu çalıştırır ve ardından fonksiyonu çalıştırır

Bir **soğuk başlangıç**, Java ve .NET gibi çalışma zamanları için Python ve Node.js'ye göre 100ms ila birkaç saniyelere kadar gecikmeye neden olabilir ve kod paketinizin boyutu da bir faktördür.

Asenkron işleme (e-posta gönderme, görüntü yeniden boyutlandırma) için soğuk başlangıçlar kullanıcılar tarafından fark edilmez.

Sıradışı API'ler (bir kullanıcı bir yanıt beklemesi gereken HTTP istekleri) için soğuk başlangıçlar, bazen yavaş yanıtlar neden olabilir.

**Düzeltmeler:**

- **Paylaşılan Eş Zamanlılık**: Bir önceden ısıtılmış belirli sayıda yürütme ortamı önceden hazırlanır. Bunlar, istekleri işlerken kullanılmadığında bile ödenir.
- **Daha küçük paket boyutları**: Daha küçük kod, daha hızlı başlatılır.
- **Sıcak başlatma çağrıları**: Fonksiyonları sıcak tutmak için planlanmış pinger'lar (bir yaklaşım ancak zararsız değil).
- **Doğru çalışma zamanını seçin**: Python ve Node.js soğuk başlangıç daha hızlıdır Java'ya göre.

**Lambda Fiyatlandırması: Tom'un Gülümsediği Sebebi**

Lambda fiyatlandırması iki bileşenden oluşur:

1. **İstek ücreti**: 1 milyon çağrıya 0,20 ABD doları
2. **Süre ücreti**: Tahsis edilen GB'ye göre saniye başına 0,0000166667 ABD doları (bellek tahsis × çalışma süresi)

İlk milyon istek aylık ücretsizdir (her zaman, sadece ilk yıl içinde değil).

Tom, e-posta hizmeti için hesapladı:

- 1.200 e-posta/gün × 30 gün = 36.000 çağrı (invokasyon) aylık
- Her çağrı yaklaşık 2 saniyede 256MB bellek kullanır
- Süre: 36.000 × 2 × 0,25GB × $0,0000166667 = $0,30/ay
- İstekler: 36.000 << 1.000.000 (ücretsiz katman) = $0,00/ay

E-posta hizmeti için EC2 örneği: $18/ay.

Tom bir an sessiz kaldı. Sonra: "Bunu her şey için yapmalıyız."

**Lambda'nın İyi Olduğu (ve İyi Olmadığı) Yerler**

Lambda, şunlar için mükemmeldir:

- **Olay odaklı işleme**: Dosya yüklemeleri, kuyruk mesajları, planlı görevler gibi olaylara yanıt verir
- **Kısa süreli görevler**: 15 dakikadan kısa sürede tamamlanabilen işlemler
- **Dalgalı, öngörülemeyen trafik**: Lambda, 0'dan binlere anında ölçeklenir — önceden yapılandırma gerekmez
- **Nadiren yapılan işlemler**: Her gün saat 2'de çalışan bir rapor. Haftalık bir temizleme görevi.
- **Glue kodu**: Verileri hizmetler arasında hareket ettiren küçük fonksiyonlar

Lambda, şunlar için iyi değildir:

- **Uzun süreli işlemler**: 15 dakikalık sınır kesin bir sınırdır
- **Durum bilgisi olan uygulamalar**: Lambda fonksiyonları tasarım gereği durum bilgisi taşımayanlardır — her çağrı bağımsızdır
- **Yüksek verim, düşük gecikmeli API'ler**: Soğuk başlatmalar gecikme dalgalanmalarına neden olabilir; önceden ayarlanmış eşzamanlılık bu durumu hafifletir ancak maliyeti artırır
- **Uzun süreli bağlantıları gerektiren uygulamalar**: Lambda, kolayca uzun ömürlü bir veritabanı bağlantı havuzu sürdüremez (ancak RDS Proxy gibi bağlantı havuzu araçları yardımcı olur)
- **Geleneksel web sunucuları**: Mümkün, ancak doğal bir uyum değildir

"Yani Lambda, EC2'nin yerini almaz," Maya dedi. "Farklı işler için farklı bir araçtır."

"Nimbus web API'si EC2 veya ECS'de kalır," Leo doğruladı. "E-posta hizmeti, görüntü yeniden boyutlandırıcısı, günlük temizleme aracı — bunlar Lambda'ya taşınır."

**Sunucusuz Felsefesi**

Lambda, Nimbus'un daha geniş bir kavramının parçasıdır: **sunucusuz** — sunucuları yönetmediğiniz, yalnızca kodu oluşturduğunuz uygulamalar oluşturmak.

Tamamen sunucusuz bir Nimbus yığını şöyle görünebilir:

- API Gateway + Lambda (EC2 ile bir web sunucusu yerine)
- DynamoDB (RDS yerine — aynı zamanda sunucusuz, sunucu yönetimi gerekmez)
- S3 (statik varlıklar — doğası gereği sunucusuz)
- SNS + SQS (mesajlaşma — sunucusuz)
- Lambda (tüm arka plan işleme)

Çekiciliği: Kodu yazarsınız, AWS her şeyi yönetir. Yama gerekmez, ölçekleme yapılandırması gerekmez, kapasite planlama gerekmez.

Gerçeklik: Sunucusuz, kendi operasyonel karmaşıklığına sahiptir — dağıtılmış Lambda fonksiyonlarını hata ayıklamak, soğuk başlatmaları yönetmek, eşzamanlılık sınırlarını anlamak. Daha basit değil, sadece farklıdır.

## Güçlü Yönler ve Sınırlamalar

**Neden Lambda Güçlüdür:**

- Gerçek zamanlı kullanım — boşta olmadığında maliyet yoktur
- Otomatik ölçekleme — yapılandırma gerekmez
- Yama gerektiren sunucular yoktur
- Cömert ücretsiz katman (aylık 1 milyon istek, sonsuza kadar ücretsiz)
- AWS'in geri kalanıyla sıkı entegrasyon

**Nerede Karmaşıklık Ortaya Çıkar:**

- Soğuk başlatmalar gerçek ve gecikmeye duyarlı iş yükleri için dikkatli bir şekilde ele alınmalıdır
- 15 dakikalık yürütme limiti uzun süreli görevler için bir sınırdır
- Hata ayıklama daha zordur — SSH'ye bağlanabileceğiniz kalıcı bir sunucu yoktur
- Durumsuz tasarım, tüm durumu harici hale getirmeyi gerektirir (veritabanı, önbellek, S3)
- Eşzamanlılık sınırları (varsayılan 1.000 eşzamanlı çağrı) ölçekte tıkanıklığa neden olabilir
- VPC'ye bağlı Lambda fonksiyonları ek gecikme ve soğuk başlatma sorunlarına sahiptir

## Özeti

- **AWS Lambda** sunucuları yönetmeden olaylara yanıt olarak kodu yürütür.
- Kullanım başına ödeme: çağrı başına ve 1 ms yürütme başına faturalandırılır. Boşta olmadığında maliyet yoktur.
- 0'dan binlere kadar binlerce eşzamanlı çağrıya otomatik olarak ölçeklenir.
- **Soğuk başlatmalar**: Sıcak bir yürütme ortamı olmadığında başlatma gecikmesidir. Hafif runtimes veya önceden ayarlanmış eşzamanlılık ile hafifletilebilir.
- En iyi için: Olay odaklı, kısa süreli, dalgalı veya nadiren yapılan iş yükleri.
- İdeal değildir: Uzun süreli görevler, durum bilgisi olan uygulamalar, önceden ayarlanmış eşzamanlılık olmadan yüksek verim, düşük gecikmeli API'ler.
- **Sunucusuz** bir tasarım felsefesidir — sunucu altyapısını yönetmezsiniz, yalnızca kodu.

## Sınav İpuçları

*SAA-C03 Alan: Dayanıklı Mimarileri Tasarlamak (Alan 2, Görev 2.1)*

- **Lambda + S3**: Klasik örüntü — dosya S3'e yüklenince Lambda işleme için tetiklenir (başlık oluşturma, virüs taraması, veri dönüştürme). Sunucu gerekli değil.
- **Lambda + SQS**: Lambda, SQS'yi sorgular ve toplu işlemler gerçekleştirir. SQS, geri alma/DLQ mekanizmasını sağlar. Lambda, işleme sağlar.
- **Lambda + API Gateway**: Sunucusuz HTTP API'si. API Gateway, yönlendirme, kimlik doğrulama, sınırlama işlemlerini yönetir. Lambda, iş mantığını yönetir.
- **Soğuk başlatma sinyalleri**: "İlk istekte gecikme sıçramaları", "tutarlı yanıt süreleri" → soğuk başlatma. Çözüm: tahsisli eşzamanlılık (para maliyeti), daha küçük paket, daha hafif çalışma zamanı.
- **Yürütme sınırları**: 15 dakika maksimum. 10 GB maksimum bellek. Varsayılan olarak 512 MB /tmp geçici depolama (10 GB'a kadar yapılandırılabilir). Bu sınırlar sınav senaryolarında görünür.
- **Lambda eşzamanlılığı**: Varsayılan 1.000 eşzamanlı yürütme (hesaba göre artırılabilir). **Rezervli eşzamanlılık**: bir fonksiyonun belirli sayıda yürütmeye güvence altına alınması; diğer fonksiyonların bunları tüketmesini önler. **Tahsisli eşzamanlılık**: yürütme ortamlarının önceden ısıtılması.
- **Olay kaynağı eşleme**: Lambda'yı SQS/DynamoDB Akışları/Kinesis'e bağlayan Lambda özelliği. Lambda, kaynağı sorgular ve kayıtları toplar.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Soğuk başlatma sorununu açıklayın. Soğuk başlatmaların en çok hangi tür uygulamalarda sorun teşkil edeceğini, hangilerde kabul edilebilir olduğunu açıklayın.

*(İpucu: Gerçek zamanlı bir API'yi (kullanıcının bir yanıt beklemesi) asenkron bir arka plan işinden (kullanıcının zaten onayını almış olması ve başka şeyler yapması) karşılaştırın).*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Şirket, tedarikçilerden S3 havuzuna ürün görüntülerini alıyor. Her görüntü, dört standart boyuta (başlık, küçük, orta, büyük) yeniden boyutlandırılmalı ve sonuçlar S3'e geri döndürülmeli. Hacim öngörülemez — bazen 10 görüntü, bazen 100.000 — işleme 10 dakika içinde tamamlanmalıdır. Maliyet en aza indirilmelidir.

Bu gereksinimleri en iyi karşılayan mimari hangisidir?

A) Uzun süreli arama ile S3 havuzunu izleyen Auto Scaling Grubu'nda EC2 örnekleri
B) S3 olay bildirimi, görüntüleri yeniden boyutlandırıp sonuçları S3'e depolayan bir Lambda fonksiyonunu tetikleyen
C) S3 olayları kuyruğa yayınlayan ve Fargate görevlerini tetikleyen ECS görevleri, kuyrukta
D) Yeni görüntüleri her dakika kontrol eden bir EC2 örneği ile özel bir EC2 örneği ve cron işi

*(İpucu 1*: Öngörülemez hacim, sıfır ölçeklenmeye öncelik verir. Hangi seçenek bu?

*(İpucu 2*: 10 dakika bir görüntü için, Lambda'nın 15 dakikalık sınırının içinde olup olmadığını kontrol edin. Görüntü yeniden boyutatma çalışmasının Lambda'nın kısıtlamalarına uyup uymadığını kontrol edin.

*(İpucu 3*: 7/24 çalışan özel bir EC2 örneği pahalıdır ve ölçeklenmez ve cron tabanlı bir yaklaşım, 60 saniyelik bir tespit gecikmesine sahiptir.

**Cevap**: B

**Açıklama**: S3 olay bildirimleri, bir görüntünün yüklenmesiyle tetiklenir. Lambda, görüntüyü dört boyuta yeniden boyututar ve sonuçları S3'e depolar. Lambda, öngörülebilir hacim için binlerce eşzamanlı çağrıyı otomatik olarak 0'dan ölçeklendirir, önceden tahsis edilmeden. Hiç görüntü işlenmediğinde maliyet yoktur.

**Neden A?** EC2, ASG'de uzun süreli arama ile izlenmez — minimum bir örnek her zaman çalışır. S3 olay bildirimi, S3'ün yerel bir olay mekanizması değildir. Yüksek maliyet, ani hacimlerde Lambda'dan daha fazladır.

**Neden C?** ECS Fargate çalışır, ancak daha karmaşıktır (konteyner yönetimi, ECR, görev tanımları) ve ani hacimlerde Lambda'dan biraz daha yüksek soğuk başlatma gecikmesine sahiptir. Bu kullanım durumu için Lambda daha basittir.

**Neden D?** 7/24 çalışan özel bir EC2 örneği, tek bir arıza noktasıdır, ölçeklenmez, 7/24 çalışır ve cron tabanlı bir yaklaşım, 60 saniyelik bir tespit gecikmesine sahiptir.

**SAA-C03 Alanı: Dayanıklı Mimarileri Tasarla — Görev 2.1**

**Uygulama 3 — Mimari Ziyaret** *(İsteğe bağlı)*

Nimbus, önceki günün en çok sipariş hacmine göre en iyi 10 restoranı oluşturmak için saat 5'te günlük bir rapor oluşturmak istiyor. Rapor, DynamoDB verilerinden oluşturulur, PDF olarak biçimlendirilir, S3'e depolanır ve tüm restoran ortaklarına e-posta gönderilir.

Bu için tam Lambda tabanlı bir boru hattını tasarlayın. Hangi olay Lambda'yı tetikler? PDF oluşturma 12 dakika sürerse ne olur? 5.000 restoran ortağı varsa ve hepsine e-posta gönderme zaman alırsa ne olur? Tek bir Lambda kullanır mı yoksa birden mi kullanırsınız?

*(Tek bir doğru cevap yoktur. Amaç, Lambda'yı diğer hizmetlerle birleştirme pratiğidir.)*

## Kredilerden Sonraki Sahne

Tom, ayın sonunda faturalamayı gözden geçirdi.

E-posta hizmeti: EC2 faturalamasından ortadan kayboldu.
Görüntü yeniden boyutatma işi: ortadan kayboldu.
Günlük temizleme görevi: ortadan kayboldu.
Günlük analiz raporu: ortadan kayboldu.

Toplam Lambda ücreti o ay: 4,23 ABD doları.

"Dört dolar," dedi Tom.

"Ve yirmi üç sent," Leo yardımseverce ekledi.

Tom, o ayın faturalamasında bu hizmetlerin tümü EC2 örneklerinde çalışırken, o zamanlar 187 ABD doları ödediğini gördü.

"Lambda, boşta kaldığında ücret almaz," dedi Leo. "Ve bu hizmetlerin çoğu, işlem yapmadığı zamanın %90'ını oluşturuyordu."

Tom uzun süre ekrana baktı.

"Sunucusuz bir sözcüğün abartılı olduğunu kabul ediyorum," dedi.

Bir sonraki bölümde: her sunucuyu ev hissettiren taşıyıcı.
