# Bölüm 25: Özel Yol

Bir an ayakta durun. Ellerinizi düzeltin.

Veri taşıma hakkında konuşacağız. AWS içindeki hizmetler arasında değil, AWS ile gerçek dünya arasında, sizin ofisiniz ve bulut altyapınız arasında, kıtalar arasında.

Nimbus’un altyapı ekibi (şu anda dört mühendis) Seattle’daki ortak bir ofiste çalışıyordu. Yönettiği AWS altyapısına erişime ihtiyaçları vardı. Bazı operasyonlar VPC’deki kaynaklara bağlanmayı gerektiriyordu.

Mevcut durumda, halka açık alt ağdaki bastion ana bilgisayarına laptop’larıyla VPN üzerinden erişiyor, ardından oradan kaynaklara SSH ile bağlanıyorlardı.

Çalışıyordu. Yavaştı. VPN bağlantısı halka açık internet üzerinden yönlendirilmekteydi: Seattle → kıta çapındaki fiber → birden fazla taşıyıcı geçişi → us-east-1. Her yolculuk 80+ milisaniyeydi.

“Günlük SSH için kabul edilebilir,” dedi Leo. “Ama analitik veritabanımızı taşımaya başlamak üzereyiz. 4 terabaytlık geçmiş sipariş verileri. Bu bağlantı üzerinden, geçiş haftalar sürecek.”

“Daha iyi bir bağlantiye ihtiyacımız var,” dedi Maya.

“Özel bir bağlantıya,” diye ekledi Priya. “Halka açık internet üzerinden değil.”

İşe gidip gelmek gibi düşünün. Site-to-Site VPN, halka açık yollara sürüş gibi: arabanızı kilitleyorsunuz (şifreleme), ancak herkesle paylaşılan şeritlerde yolculuk yapıyorsunuz ve trafik tahmin edilemeyen şekillerde yavaşlayabiliyor. Direct Connect, özel bir otoyol şeridine kiralama gibi — paylaşılan trafik yok, tutarlı hız ve daha yüksek aylık ücret. Çoğu gün halka açık yol yeterli. Değerli bir yükü sıkı bir zamanda özel bir yola taşırken, o ücreti ödersiniz.

**AWS Site-to-Site VPN: Hızlı Seçenek**

**AWS Site-to-Site VPN**, yerel ağınızı ve VPC’nizi halka açık internet üzerinden birbirine bağlayan şifreli bir tünel oluşturur.

Kurulum:

1. VPC’nize bağlı bir Sanal Özel Kapı (VGW) oluşturun
2. Yerel ağınızdaki bir Müşteri Anahtarı temsil eden bir Müşteri Anahtarı oluşturun
3. Aralarındaki iki VPN tünelini (yedeklilik için) kurun

Trafik şifrelenir (AES-256). Bu nedenle gecikme, internet koşullarına bağlıdır. AWS, bir tünelde sorun olması durumunda trafiği diğerine aktarmak için otomatik olarak iki tünel sağlar — bir tünelde sorun olması durumunda trafik diğerine aktarılır.

**Site-to-Site VPN’i Ne Zaman Kullanmalısınız**:

- Hızlı kurulum (dakikalar ila saatler)
- Maliyet etkin ($0.05/saat per VPN bağlantısı)
- Bant genişliği: her tünel için 1.25 Gbps’ye kadar
- Kullanım durumu için kabul edilebilir internet gecikmesi

Nimbus’un 4TB geçişi için, 1.25 Gbps maksimum internet tabanlı VPN, minimum 7 saat sürerdi, gerçek dünya yükü yaklaşık 12-20 saate yakın olurdu. Kabul edilebilir, ancak halka açık yol üzerindeki tıkanıklık nedeniyle tahmin edilemezdi.

“Diğer seçenek nedir?” Tom sordu.

**AWS Direct Connect: Özel Hat**

**AWS Direct Connect**, yerinizdeki (veya co-location tesisinizdeki) ve AWS arasındaki özel bir ağ bağlantısını kurar. Trafik hiç halka açık internetten geçmez.

Direct Connect, ağınızdan AWS Direct Connect konumuna fiber hattı olan fiziksel bir bağlantıdır. Fiziksel devreyi kurmak için bir telekom operatörüyle çalışırsınız. AWS, kendi tarafındaki portu sağlar.

**Faydaları**:

- Tutarlı, tahmin edilebilir gecikme (halka açık internet varyasyonları yok)
- 50 Mbps’den 100 Gbps’ye kadar hızlar
- İnternete göre daha düşük veri transfer maliyetleri (Direct Connect veri transfer oranları standart AWS veri çıkış oranlarından daha ucuzdur)
- Daha güvenli (özel devre, halka açık internet değil)

**Dezavantajları**:

- Kurulum haftalar ila aylardır (fiziksel altyapı tahsisi)
- VPN’den önemli ölçüde daha yüksek maliyetlidir ($0.025-0.30/saat per port, ayrıca telekom devresi maliyetleri — genellikle 500-1000+/ay minimum)
- Yerleşik yedeklilik yoktur (siz kendi yedek devrelerinizi kurarsınız)
- Coğrafi olarak dağıtılmış ofisler için uygun değildir, birden fazla devre gerektirir.

Nimbus için: Mevcut boyutları için Direct Connect aşırıydı. Ancak önemli veri transfer hacimleri veya özel ağ bağlantılarına uyum gereksinimleri olan işletmeler için Direct Connect, ödenir.

**Hosted Connections: Orta Yol**

Her kuruluş, 100 Gbps’lik özel bir fiber devresi taahhüt edemez. **Direct Connect Hosted Connections**, onaylı telekom operatörleri tarafından sağlanan ve sizlerin paylaştığı alt 1Gbps bağlantıları sunan Hosted Connections’ları sağlar.

Kurulum daha hızlıdır (günler ila haftalar, aylar değil) ve özel bir bağlantıya göre daha ucuzdur. Ticaret ortağı: paylaşılan kapasite, daha az tutarlı bir akış anlamına gelir.

Nimbus (büyüdükçe): bir ortağa 500 Mbps bağlantıyı sağlatmak, özel bağlantı için makul bir fiyat noktası sağlayacaktır.

**AWS Transit Gateway: VPC’ler için Hub-and-Spoke**

Nimbus büyüdükçe, üretim VPC’si, hazırlık VPC’si, analiz VPC’si, güvenlik araçları VPC’si gibi birden fazla VPC’ye sahip olurdu.

Dikkatli bir planlama olmaksızın, bu VPC’leri birbirine bağlamak, VPC’ler arasında tam bir ağ geçiş bağlantı bağlantı ağı gerektirir. 4 VPC için: 6 geçiş bağlantısı. 10 VPC için: 45 geçiş bağlantısı. 20 VPC için: 190 bağlantı. Bu ölçeklenemez.

**AWS Transit Gateway**, birden fazla VPC'yi ve yerel ağları birbirine bağlayan bir ağ merkezi (hub) olarak hizmet eder. Birbirlerine bağlantı kurmak için bir "mesh" (ağ) yerine, her VPC doğrudan Transit Gateway'e bağlanır. Transit Gateway, bu VPC'ler arasındaki trafiği yönlendirir.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Geçişli Yönlendirme**: VPC A ve VPC B ikisi de Transit Gateway'e bağlıysa, aralarındaki iletişimi — doğrudan bir eşleşmeye ihtiyaç duymadan — kurabilirler. Transit Gateway yönlendirmeyi yönetir. VPC eşleştirmesi (ki bu geçişli değildir) gibi, Transit Gateway merkezi-hub ve uç nokta topolojisini sağlar.

**Transit Gateway Maliyetleri**: VPC veya VPN/Doğrudan Bağlantı bağlantıları için yapılan her ekleme başına ve işlenen her GB veri için hesaplanır. Büyük ölçekte, basitliği hak edecektir.

**VPC Uç Noktaları: AWS Hizmetlerine Özel Erişim**

İçinde barınan bir EC2 örneği (özel bir alt ağda) S3 API'sini çağırdığında, bu trafik NAT Gateway'den (internet'e ulaşmak için, S3'ün halka açık uç noktasının bulunduğu yerde) geçerek yönlendirilir. NAT Gateway'in işleme maliyeti ödenir.

**VPC Uç Noktaları**, kaynaklarınızın VPC'si ile AWS hizmetleri arasında özel olarak iletişim kurmasını sağlar — halka açık internet üzerinden geçmeden ve NAT Gateway'den.

İki türü vardır:

**Uç Nokta Eşlemeleri** (ücretsiz): S3 ve DynamoDB için. S3 veya DynamoDB trafiğini uç noktasına, NAT Gateway'e değil, bir rota ekleyerek yönlendirirsiniz. Oluşturmak ücretsizdir; kullanmak ücretsizdir.

**Arayüz Uç Noktaları** (ücretli): SQS, SNS, Secrets Manager, SSM vb. gibi diğer AWS hizmetleri için. Alt ağınızda bir ENI (Elastic Ağ Arabirimi) oluşturur. Hizmete bu özel IP üzerinden erişilir. Maliyet yaklaşık 0,01 ABD Doları/saat başına bir bölge (AZ) ve veri işleme ile ilgilidir.

Tom, bu ücretsiz olduklarını öğrendiği an, S3 ve DynamoDB için Uç Nokta Eşlemelerini hemen oluşturdu. NAT Gateway veri işleme ücreti %30 azaldı.

**AWS Global Accelerator: Kenarda Yönlendirme**

Nimbus, us-east-1 (Virginia) bölgesinde Batı Yakası kullanıcıları için hizmet verirken, gecikme süresi 80ms'ydi. Bu, sunucunun aşırı uzak olmasından değil, Seattle ve Virginia arasındaki halka açık internet yönlendirmesinin suboptimal olması ve birden fazla taşıyıcı ağı üzerinden atlaması yüzündendir.

**AWS Global Accelerator**, CloudFront'ın gücünü alan AWS'nin özel omurga ağını kullanarak kullanıcılar ve AWS uygulamaları arasında trafiği yönlendirir. Trafik, en yakın kenar konumuna girer ve uygulamanıza optimize edilmiş özel yol boyunca gider.

Nimbus için, Seattle'daki bir kullanıcı için:

- **Global Accelerator Yok**: Halkın internet taşıyıcıları üzerinden rota → ~80ms
- **Global Accelerator Var**: En yakın AWS kenar konumuna ulaşır → AWS omurga ağı üzerinden yolculuk yapar → us-east-1'e ulaşır → ~45ms

Global Accelerator içerik önbelleğe almaz (CloudFront bunu yapar). Bu, dinamik istekler için ağ yolunu optimize eder.

**Global Accelerator'ı CloudFront'tan Ne Zaman Kullanmalı?**

- CloudFront: Statik ve önbelleğe alınabilen içerik, CDN kullanımı
- Global Accelerator: Dinamik içerik, HTTP protokolleri (UDP, oyun, IoT) veya statik bir Anycast IP adresi gerektiğinde

## Güçlü Yönler ve Sınırlamalar

**Site-Site VPN**:

- Hızlı kurulum, düşük maliyet
- Halkın internet yolu nedeniyle değişken gecikme
- Sınırlı bant genişliği tavanı

**Doğrudan Bağlantı**:

- Tutarlı, özel, yüksek bant genişliği
- Yavaş kurulum, önemli devam eden maliyet
- Fiziksel devre tek bir arıza noktasıdır (fazlalık ekleyin)

**Transit Gateway**:

- Çoklu VPC bağlantısını önemli ölçüde basitleştirir
- Geçişli yönlendirme (VPC eşleştirmesi gibi değil)
- Birçok ekleme için maliyet artabilir

**VPC Uç Noktaları**:

- S3/DynamoDB için güvenlik ve maliyet avantajı (ücretsiz geçişli uç noktalar)
- NAT Gateway maliyetlerini AWS hizmetlerine yönelik trafik için ortadan kaldırır

**Global Accelerator**:

- Global kullanıcılar için dinamik uygulama gecikmesini iyileştirir
- Sabit Anycast IP'ler (CloudFront'ın dinamik IP'lerinden farklı)
- Ek maliyet (1 saat başına 0,025 ABD Doları/accelerator + veri aktarımı)

## Özet

- **Site-Site VPN**: On-premises ve VPC arasında halkın interneti üzerinden şifreli bir tünel. Hızlı kurulum, daha düşük maliyet, değişken gecikme.
- **Doğrudan Bağlantı**: AWS'ye özel, tahmini fiber bağlantı. Tahmin edilebilir gecikme, daha yüksek bant genişliği, kurulum için haftalar, önemli maliyet.
- **Transit Gateway**: VPC ve on-premises bağlantısı için bir merkez. Geçişli yönlendirmeyi etkinleştirir. Yüzlerce bağlantıya ölçeklenebilir.
- **VPC Uç Noktaları**: NAT Gateway olmadan AWS hizmetlerine özel erişim. Geçişli uç noktalar (S3, DynamoDB) ücretsizdir.
- **Global Accelerator**: Global olarak daha düşük, daha tutarlı gecikme için AWS omurga ağı üzerinden dinamik trafiği yönlendirir.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla (Alan 3, Görev 3.4)*

- **VPN ve Direkt Bağlantı Sinyalleri**: VPN = "şifreli trafiği VPC'ye yönlendirme", "hızlı kurulum", "maliyet hassasiyetli". Direkt Bağlantı = "sabit düşük gecikme süresi", "büyük veri aktarımları", "özel bağlantı", "özel ağ gerektiren uyumluluk".
- **Transit Gateway vs VPC Peiriği**: Peiriği geçişli değildir (A→B→C, A→C'ye izin vermez). Transit Gateway geçişlidir. "Birçok VPC'nin birbirleriyle iletişim kurması gerekiyor" → Transit Gateway.
- **VPC Gateway Uç Noktaları**: Ücretsizdir. S3 ve DynamoDB yalnızca. Route tablosu değişikliği. Ek bir maliyet yoktur. Sınır senaryosu: "S3 erişiminden özel alt ağa veri aktarım maliyetlerini azaltma" → Gateway Uç Noktası.
- **Global Hızlandırıcı vs CloudFront**: Hızlandırıcı = dinamik içerik, HTTP dışı, statik IP, ağ optimizasyonu. CloudFront = önbellekleme, HTTP içeriği, CDN.
- **Direkt Bağlantı + VPN**: Bir Direkt Bağlantı bağlantısı başarısız olduğunda, trafiği yedeklemek için VPN'i kullanabilirsiniz. VPN tek başına daha pahalıdır, Direkt Bağlantı tek başına daha güvenilirdir.
- **Direkt Bağlantı Geçidi**: Bir Direkt Bağlantı devresini birden fazla bölgeye veya hesaba birden fazla VPC'ye bağlayın. Bu olmadan, bir Direkt Bağlantı devresi tek bir VGW'ye tek bir bölgede bağlanır.

## Uygulamalar

**Uygulama 1 — Hatırlama**

AWS Site-to-Site VPN ve AWS Direkt Bağlantı arasındaki farkı açıklayın. Her birini hangi senaryoda kullanırdınız?

*(İpucu: Kurulum süresi, maliyet, gecikme süresi tutarlılığı ve bant genişliği gereksinimlerini düşünün.)*

**Uygulama 2 — Sınır Uygulaması**

*Senaryo*: Bir finansal hizmetler şirketi, verilerini on-premise veri merkezinden AWS'ye aktarmak için 500 GB hassas finansal veriyi günlük olarak aktarır. Bağlantının tutarlı, tahmin edilebilir gecikme süresi olması ve halka açık internet üzerinden geçmemesi gerekir. Ayrıca, ana bağlantı başarısız olduğunda yedek bir bağlantıya ihtiyaçları vardır.

Bu gereksinimleri en iyi karşılayan mimari hangisidir?

A) BGP yönlendirmesi ve yedekleme için ikinci bir VPN ile Site-to-Site VPN
B) Direkt Bağlantı ile Site-to-Site VPN yedekleme olarak
C) Farklı internet sağlayıcıları üzerinden iki Site-to-Site VPN bağlantısı
D) Direkt Bağlantı Hosted Connection ile Direkt Bağlantı Geçidi

*(İpucu 1*: "Halka açık internet üzerinden geçmemesi gerekir" — VPN trafiği halka açık internet üzerinden geçer. Sadece Direkt Bağlantı özeldir.

*(İpucu 2*: "Tutarlı, tahmin edilebilir gecikme süresi" — halka açık internet VPN performansı değişir. Direkt Bağlantı tutarlıdır.

*(İpucu 3*: "Yedek bağlantı" — Direkt Bağlantı ana olduğunda hangi yaklaşım önerilir?

**Cevap**: B

**Açıklama**: Direkt Bağlantı, halka açık internet üzerinden geçmeyen özel, ayrılmış bir bağlantı sağlar — gizlilik ve gecikme süresi gereksinimlerini karşılarlar. Site-to-Site VPN yedeklemesi, Direkt Bağlantı devresinin başarısız olması durumunda trafiğin yedeklenmesini sağlar: bu, Direkt Bağlantı için standart bir HA (Yüksek Kullanılabilirlik) modelidir.

**A seçeneği neden uygun değildir?** Site-to-Site VPN trafiği halka açık internet üzerinden geçer, bu da "halka açık internet üzerinden geçmemesi gerekir" gereksinimini ihlal eder.

**C seçeneği neden uygun değildir?** Farklı ISP'ler üzerinden iki VPN bağlantısı hala halka açık internet üzerinden geçer, hatta şifrelenmiş olsa bile. Özel ağ gereksinimi karşılanmaz.

**D seçeneği neden uygun değildir?** Hosted Connection, Direkt Bağlantı bağlantısını sağlar ancak D seçeneği yedeklemeyi içermez. Tek bir Direkt Bağlantı, fiberin kesilmesi durumunda tek bir arızadır.

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla — Görev 3.4*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, Seattle, Berlin ve Singapur'da bölgesel mühendislik ekipleri kurmak için genişliyor. Her bölgesel ekip aşağıdaki kaynaklara erişime ihtiyaç duyar:

- Üretim VPC (hata ayıklama için yalnızca okuma)
- Aşama VPC (test için tam erişim)
- Analitik VPC (raporlama için yalnızca okuma)

Ağ bağlantısını tasarlayın. Transit Gateway kullanmalı mısınız? Her bölgede Direkt Bağlantı mı yoksa Site-to-Site VPN mi? Üretim için yalnızca okuma erişimini nasıl zorlarsınız? (İpucu: Bu hem bir ağ hem de IAM sorusudur.)

*(Tek bir doğru cevap yoktur. Amaç, çok bölge, çok ekip ağ tasarımı uygulamaktır.)*

## Ekran Sonrası Sahne

Veri aktarımı 14 saatte tamamlandı.

Yavaş halka açık internet yolu üzerinden değil — Leo, verilerin çoğunu AWS'ye gönderilen ve alınan fiziksel depolama cihazları (Snow Family) kullanarak aktardı, ardından kalan delta'yı VPN üzerinden senkronize etti.

"Bir dahaki sefere," dedi, "Direkt Bağlantı kurmalıyız."

Tom fiyatları inceledi.

"1 Gbps port için 216 dolar/ay," dedi. "Ayrıca ofisimizden bir telekomun 800 dolar/aylık bir fiyatı var."

"Yani yaklaşık bin dolar toplamda."

"Şu anki işimiz için, muhtemelen değmez. Ancak ayda 10 TB'tan fazla veri transfer etmeye başlarlarsa, Direkt Bağlantı'daki veri aktarım tasarrufu maliyeti karşılayacaktır."

"Veri transfer hacmini izliyoruz ve eşik aşıldığında yeniden gözden geçiriyoruz," dedi Priya.

"Bu maliyet bilincine sahip mimaridir," dedi Tom.

"Bu her zaman noktaydı," dedi Maya.

Bir sonraki bölümde: herhangi bir veritabanının makul bir şekilde saklayabileceği kadar fazla veri olduğunda ve onu anlamaya çalışmanız gerektiğinde neler olduğunu inceleyeceğiz.
