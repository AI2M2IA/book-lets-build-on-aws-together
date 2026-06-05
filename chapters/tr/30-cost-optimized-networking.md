# Bölüm 30: Gizli Maliyet

Depolama maliyetleri tek bir satırda görünür: “S3: 198 $”. Hesaplama maliyetleri tek bir satırda görünür: “EC2: 2.340 $”. Ağ maliyetleri on iki satır öğesiyle yayılır, örneğin “Çıkış Veri Transferi”, “NAT Geçidi İşleme”, “VPC Peiriği Veri Transferi” ve “CloudFront Veri Transferi”. Çoğu mühendis bunları bir kez toplar, bir an duraklar ve tekrar toplar.

Tom şöyle demişti: “Ağ maliyetleri. Bunlar sırada.”

Faturayı açtı. Veri transferi bölümünü buldu. Tüm satır öğelerini topladı.

AWS’de ağ maliyetleri, bir şehrin vapur sistemi gibidir: Şehre girmek ücretsizdir, ancak köprülerden herhangi birini internete doğru kullandığınızda para ödersiniz ve mahalleler arasında biraz da pahalıdır. Çoğu insan vergiden sonra ay sonu faturalarında ortaya çıkan vergileri fark edene kadar düşünmez, ancak tüm gün her gün bir tünelden geçiyorlardı, oysa tüm zaman boyunca ücretsiz bir yol vardı. Bu bölümün amacı her bir bahşiş gişesini anlamak ve hangilerinin ödenmeye değer olduğunu belirlemektir.

847 $/ay.

“Veri transferi için 847 $ harıyor muyuz?” diye sordu.

“Bu, S3 faturalarımızdan önceki kadar mı?” diye sordu Leo.

“Hâlâ ne kadar veri transferi yaptığımızı bilmiyordum.”

Maya’nın üstüne baktı. “Veri transferi nedir?”

“AWS’nin internete veri göndermek için ücretlendirdiği şeydir. AWS’ye veri gönderme (genellikle ücretsizdir). AWS’den internete veri gönderme (şarj edilir). Farklı bölgelerdeki hizmetler arasında veri gönderme (şarj edilir). Bir NAT Geçidi’nden geçen veri gönderme (VPC uç noktaları bazı tablolar için henüz ayarlanmamıştı).”

“Bunu parçalayabilir misin?”

Tom bunu yapabilirdi. Ve bulduğu şey, ekibin mimarileri hakkında ne düşündüğünü değiştirdi.

**AWS Veri Transferi İçin Nasıl Ücretlendirilir**

AWS’nin veri transferi fiyatlandırması asimetrik bir yapıya sahiptir:

**AWS’ye (giriş) Gelme**: Ücretsizdir. İstediğiniz kadar veri yükleyebilirsiniz.

**AWS’den İnternete (çıkış) Gitme**: Şarj edilir. İlk 100 GB/ay ücretsizdir. Bundan sonra:

- İlk 10 TB/ay için 0,09 $/GB
- Sonraki 40 TB için 0,085 $/GB
- Daha yüksek hacimlerde daha düşük

**Aynı Erişilebilirlik Bölgesinde**: Ücretsizdir. Aynı bölgede konuşan EC2 örnekleri birbirlerine hiçbir şey ücretlendirmemektedir.

**Aynı Bölgedeki Erişilebilirlik Bölgeleri Arasında**: Her yönde 0,01 $/GB. Küçük ama gerçek bir maliyet.

**Farklı Bölgeler Arasında**: 0,02-0,08 $/GB, bölgelere bağlı olarak değişir. Bölgesel çapraz trafik önemli ölçüde daha pahalıdır.

**NAT Geçidi**: İşlem başına 0,045 $/GB. Özel EC2 örneğinizin internete ulaşmak için NAT Geçidi üzerinden gönderdiği her byte ve geri dönen her byte ücretlendirilir.

**CloudFront**: Doğrudan AWS-internet’e göre daha düşük veri transfer oranları. İlk 10 TB için 0,085 $/GB (doğrudan veri transferinden biraz daha az). CloudFront’un kenar önbelleklemesi, kökenin daha az sıklıkla hizmet etmesine neden olduğu için toplam aktarım maliyetlerini sıklıkla azaltır.

**Tom’un Analizi**

Her satır öğesini kategorize ettikten sonra:

**İnternete Çıkış Verisi**: 214 $/ay

- Müşterilere yönelik API yanıtları
- Kenar konumları kökeninden veri alırken CloudFront önbelleği doldurulur

**NAT Geçidi İşleme**: 289 $/ay

- Dış API’lere (ödeme işlemcisi, e-posta hizmeti, harita verileri) çağrı yapan uygulama sunucuları
- VPC uç noktaları ayarlanmadan önce DynamoDB çağrıları NAT Geçidi üzerinden

**Aynı Bölgedeki Veri Transferi**: 178 $/ay

- Yükleyicinin bir AZ’de bulunduğu ve başka bir AZ’deki bir örneğe yönlendirdiği trafik

Bu bölüm, Tom’un bulduğu şeyin ekibin mimarileri hakkında ne düşündüğünü nasıl değiştirdiğini gösteriyor.

# Bazı Optimizasyonlar

Bazı kısımları optimize etmek mümkündü: uygulama, RDS ana veri tabanına (us-east-1a) yazmaya ve okuma replikasına (us-east-1b) okumaya yapılandırılmıştı. Her okuma sorgusu, AZ sınırlarını aşıyordu.

Okumalar için bir çözüm: uygulama, talep eden örneğin aynı AZ'deki bir okuma replikasına öncelik vermesi için yapılandırılmalıydı. Her AZ kendi okuma replikasına sahipti. Trafik yerel kalır.

Değişim maliyeti: daha fazla okuma replikası = daha fazla maliyet. Çapraz-AZ trafiği maliyeti 50 ABD doları/ay ve ek bir okuma replikası 190 ABD doları/ay ise, AZ'ye yerel optimizasyon ödeme yapmazdı.

Tom hesapladı: mevcut sorgu hacmiyle, çapraz-AZ trafiği 178 ABD dolarından sadece 31 ABD dolarıydı. Replikalar eklemek için değildi.

Diğer çapraz-AZ maliyetleri yük dengeleyicisi yönlendirmesi ve hizmetten hizmete iletişimdi — mevcut mimari düzeyinde büyük ölçüde kaçınılmazdı.

"Bu, maliyeti anlamanın, onu düzeltmeniz gerektiği anlamına gelmediği durumlardan biridir," dedi Tom.

"Çapraz-AZ trafiğini tamamen ortadan kaldırmak ne kadar maliyet olurdu?" diye sordu Maya.

"Her şeyi tek bir AZ'de barındırmak, Çoklu-AZ'nin amacını bozar. Bu, 31 ABD doları/ay tasarruf demektir, ancak yüksek kullanılabilirlik kaybedilir."

"O halde onu bırakıyoruz," dedi.

"Bırakıyoruz."

Bu, olgun maliyet sohbetidir: bazen bir şeyi ödeme, alternatifin daha yüksek bir risk olduğu için yaparız.

**CloudFront: Veri Transferi İndirimi**

İlginç bir gerçek: verileri CloudFront üzerinden sunmak, onları doğrudan EC2 veya S3'ten sunmaktan genellikle daha ucuzdur.

**EC2'den İnternete:** 0,09 ABD Doları/GB
**CloudFront'tan İnternete:** 0,085 ABD Doları/GB (biraz daha ucuz)

Ancak gerçek tasarruf, per GB oranında değil, CloudFront'ın verileri uç nokta konumlarında önbelleğe almasıdır. Aynı menü fotoğrafını 1.000 kullanıcı talep ederse:

- **CloudFront Olmadan:** 1.000 istek S3 köküne çarparak × fotoğraf boyutu × 0,09 ABD Doları/GB
- **CloudFront ile:** 1 istek S3'e çarparak (önbellek hatası) + 999 istek CloudFront uç nokta konumlarından sunulur

Nimbus'un %83 önbellek isabet oranına (13. Bölümden) sahip olması durumunda, %83'lük istekleri uç nokta konumlarından önbelleğe alır. Gerçek kök veri transferi, toplam isteklerin %17'siydi — %83'lük "dışarıya" trafiği uç noktada önbelleğe alınmıştı.

"CloudFront sadece performans için bir CDN değildir. Aynı zamanda veri transferi için bir maliyet optimizasyonudur," dedi Tom.

Leo düşünceli bir şekilde baktı. "Statik içerik teslimini CloudFront üzerinden tümleştirmeli, gecikmeye duyarlı olmayan varlıklar için bile."

"Doğru. Kullanıcılar AWS'den indiriyorsa, CloudFront üzerinden gitmelidir."

**S3 Select: Veri Transferini Sorgulardan Azaltma**

İnce bir optimizasyon: **S3 Select**, CSV, JSON, Parquet gibi bir S3 nesnesinden ihtiyacınız olan satırları ve sütunları, tüm dosyanın filtrelenmesini uygulamada yapmaktan daha az veriyle almayı sağlar.

S3 Select Olmadan:
```

```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

With S3 Select:

```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)

S3 Select, verilerinizi S3'ten uygulamanıza aktarmayı azaltır. Büyük dosyalar ve seçici sorgular için bu, veri hacmi üzerinde 10-100 katlık bir azalma – ve dolayısıyla maliyet tasarrufu anlamına gelir.

**Tam Ağ Optimizasyonu**

Üç hafta analiz ve uygulama sonrası:

| Maliyet Öğesi                               | Önceki   | Sonrası   | Aylık Tasarruf |
|--------------------------------------------|----------|----------|----------------|
| NAT Gateway (Arayüz Uç Noktaları)          | $289     | $211     | $78            |
| CloudFront optimizasyonu (daha fazla varlığı taşı) | $214     | $147     | $67            |
| Aynı Bölge içi trafik (kabul edildi)          | $178     | $178     | $0             |
| Farklı Bölge içi trafik (kabul edildi)      | $166     | $166     | $0             |
| **Toplam**                                  | **$847** | **$702** | **$145/ay** |

Aylık 145$, 1740$/yıl ağ optimizasyonu tasarrufu. Hesaplama ve depolama ile karşılaştırıldığında mütevazı, ancak anlamlı.

Daha da önemlisi: Tom, ağ faturalarının her satırını şimdi anlıyordu. Her maliyeti açıklayabiliyor ve hangilerini optimize etmesi gerektiğini ve hangilerini kabul etmesi gerektiğini bilinçli bir şekilde kararlaştırmıştı.

## Güçlü Yönler ve Sınırlamalar

**NAT Gateway maliyetleri**:

- Büyük veri hacimleri NAT Gateway üzerinden hızla birikiyor
- VPC Uç Noktaları bazı NAT maliyetlerini tamamen ortadan kaldırıyor
- Özel örneklerinizi hangi hizmetlere çağırdığını ve uç noktaların mevcut olup olmadığını gözden geçirin

**CloudFront maliyetleri için**:

- Önbellek isabet oranı doğrudan maliyet tasarruflarını etkiliyor
- Yüksek önbellek isabet oranı = daha düşük kaynak aktarımı + daha düşük toplam aktarım maliyeti
- Tüm statik varlık teslimini CloudFront üzerinden yapın

**Aynı Bölge içi ticaret**:

- Aynı Bölge içi trafiği ortadan kaldırmak genellikle daha fazla maliyetli olan değişiklikler gerektiren mimari değişiklikler gerektirir
- Optimizasyon yapmadan önce dikkatli bir şekilde hesaplayın

**S3 Select**:

- Büyük S3 nesneleri için seçici sorgular için önemli tasarruflar
- Tam dosyayı ihtiyacınız olduğunda yardımcı olmaz

Bir sonraki bölüm: Her mimari incelemesi başlaması gereken altı temel çerçeve.

## Özeti

- AWS, **çıktı verisi** (internet: ~$0.09/GB), **aynı bölge içi trafik** ($0.01/GB her iki yönde), **farklı bölge içi trafik** ($0.02-0.08/GB) ve **NAT Gateway işleme** ($0.045/GB) için ücretlendirir.
- **Giriş verisi** ücretsizdir. **Aynı bölge içi trafik** ücretsizdir.
- **VPC Gateway Uç Noktaları** (S3, DynamoDB): Ücretsiz. NAT Gateway maliyetlerini bu hizmetler için ortadan kaldırır.
- **VPC Arayüz Uç Noktaları**: Saat başına ve GB başına fiyatlandırılır. Yüksek hacimli hizmetler için NAT Gateway'den daha ucuzdur.
- **CloudFront** doğrudan EC2-internet ve önbellekleme yoluyla kaynak aktarım hacmini önemli ölçüde azaltarak, internetten veri aktarmanın oranlarından daha düşük oranlarda verileri sunar.
- **S3 Select** S3'ten veri aktarımını kaynakta filtreleyerek azaltır.
- Bazı ağ maliyetleri mimari ödünlemlerdir (aynı bölge içi, HA için) – bunları anlamanız gerekir, her zaman ortadan kaldırmamanız gerekir.

## Sınav İpuçları

*SAA-C03 Alan: Maliyet Optimizasyonlu Mimarileri Tasarlama (Alan 4, Görev 4.4)*

- **NAT Gateway vs VPC Uç Noktaları**: Sınav senaryosu: "Özel bir alt bölgeye sahip EC2, S3/DynamoDB'ye sık sık API çağrıları yapıyor – NAT Gateway maliyetlerini azaltmak için ne yapılmalı?" → VPC Gateway Uç Noktaları (S3 ve DynamoDB için ücretsiz).
- **Veri aktarım fiyatlandırma kuralları**:
  - AWS'ye: ücretsiz
  - Aynı bölge içi: ücretsiz
  - Farklı bölge içi: ücretli
  - İnternet: ücretli (önemli oran)
- **CloudFront maliyet optimizasyonu olarak**: "Küresel içerik dağıtımı için veri aktarım maliyetlerini azaltın" → CloudFront. Önbellek katmanı, kaynak isteklerini azaltır.
- **S3 Transfer Acceleration**: Büyük dosyaları *S3'e* CloudFront kenar konumları aracılığıyla yükleme hızlandırır. Standart S3'e göre daha yüksek maliyetlidir. Müşterilerin uzak coğrafi konumlardan büyük dosyaları yüklemesi gereken durumlarda kullanın.
- **Farklı bölge içi replikasyon maliyetleri**: Verilerin farklı bölgelere çoğaltılması veri aktarım ücretlerini içerir. S3 CRR için hem veri aktarım oranını hem de S3 istek maliyetini ödersiniz.
- **PrivateLink (VPC Arayüz Uç Noktaları)**: AWS hizmetlerine ve diğer AWS müşterilerinin barındırdığı hizmetlere özel bağlantı sağlar. NAT üzerinden gitmekten daha güvenlidir ve yüksek hacimli hizmetler için genellikle daha ucuzdur.

## Uygulamalar

**Uygulama 1 — Hatırlama**

VPC Gateway Uç Noktası ve VPC Arayüz Uç Noktası arasındaki farkı açıklayın. Her biri hangi AWS hizmetleri için mevcuttur ve her birinin maliyeti nedir?

*(İpucu: Gateway Uç Noktaları ücretsizdir ancak yalnızca S3 ve DynamoDB için çalışır. Arayüz Uç Noktaları saat başına fiyatlandırılır ancak çoğu diğer AWS hizmeti için çalışır.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Uygulaması özel alt bölgelere sahip EC2 örneklerine çalışır. Örnekler, Amazon SQS ve Amazon S3'e sık sık API çağrıları yapar. Tüm trafik şu anda bir NAT Gateway üzerinden terk edilmektedir. Takım NAT Gateway maliyetlerini azaltmak istiyor. Güvenlik, herhangi bir trafikin halka açık internet üzerinden geçmemesi gerektiğinden korunmalıdır.

Bu gereksinimleri karşılayan en iyi yaklaşım nedir?

A) S3 için bir Gateway Uç Noktası ve bir Gateway Uç Noktası oluşturun.
B) S3 için bir Arayüz Uç Noktası ve bir Gateway Uç Noktası oluşturun.
C) Hem SQS hem de S3 için Arayüz Uç Noktaları oluşturun.
D) NAT Gateway'i kaldırın ve API çağrıları için doğrudan İnternet Gateway'i kullanın.

**İpucu 1**: Gateway Uç Noktaları yalnızca S3 ve DynamoDB için mevcuttur.

**İpucu 2**: Arayüz Uç Noktaları SQS ve birçok diğer hizmet için mevcuttur (ancak ücretlidir).

**İpucu 3**: Özel alt ağdaki tablo rotası üzerinden İnternet Gateway'i kullanmak, alt ağı kamuya açık hale getirir — güvenlik gereksinimlerini ihlal eder.

**Cevap**: B

**Açıklama**: S3, bir Gateway Uç Noktası (ücretsiz) kullanır. SQS, bir Arayüz Uç Noktası (ücretli) gerektirir. Bu kombinasyon, her iki hizmet için NAT Gateway veri işleme maliyetlerini ortadan kaldırır. Tüm trafik AWS'nin özel ağında kalır — herhangi bir internet üzerinden geçiş olmaz.

**Neden A?** Gateway Uç Noktaları SQS için mevcut değildir. Sadece S3 ve DynamoDB Gateway Uç Noktaları kullanır.

**Neden C?** Bu işe yarasa da, S3 için bir Arayüz Uç Noktası (ücretsiz Gateway Uç Noktasının yerine) gereksiz saatlik ücretler doğurur. S3 ve DynamoDB için her zaman ücretsiz Gateway Uç Noktasını kullanın.

**Neden D?** Özel alt ağdaki tablo rotasına İnternet Gateway'i eklemek, alt ağı kamuya açık hale getirir. EC2 örnekleri genellikle özel alt ağlarda Elastic IP'lere sahip olmadığından, İnternet Gateway'i kullanmadan trafiği yönlendiremezler — ve bunu yapmak, giriş internet trafiğine maruz kalmalarına neden olur.

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimari Tasarımı — Görev 4.4*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus'un Batı Kıyısı kullanıcıları önemli miktarda trafik oluşturuyor. Uygulama, us-east-1 (Virginia) üzerinden Doğu Kıyısı kullanıcılarına hizmet veriyor. Şu anda:

- API yanıtları, us-east-1 EC2 örneklerinden Batı Kıyısı kullanıcılarına yaklaşık 80ms'de (0,09 ABD Doları/GB) doğrudan gider.
- Menü fotoğrafları, us-east-1'deki S3 üzerinden Seattle'daki CloudFront uç noktası üzerinden yaklaşık 8ms'de (cache'den sonra) gider.

Ekip, Batı Kıyısı kullanıcıları için us-west-2 (Oregon) bölgesinde ikinci bir uygulama bölgesi eklemeyi düşünmektedir ve API gecikmesini azaltmak için.

Bu değişiklik için veri aktarım maliyetlerini analiz edin. Çift bölge kurulumu hangi yeni çapraz bölge veri aktarım maliyetlerini gerektirir? Route 53 gecikmeye dayalı yönlendirme toplam aktarım maliyetlerini azaltır mı yoksa artırır mı? Trafik hacmi, gecikme hassasiyeti gibi koşullar altında çift bölge kurulumu ne zaman karlı olur?

*(Tek bir doğru cevap yoktur. Amaç, çok bölge maliyet-fayda analizini uygulamaktır.)*

## Kapanış Sahnesi

Tom ağ analizi sonlandı.

Toplam üç aylık optimizasyon projesi etkisi:

- EC2 Tasarruf Planları: Yıllık -14.200 ABD Doları
- Depolama (S3 + EBS): Yıllık -6.200 ABD Doları
- Veritabanı katmanı: Yıllık -11.220 ABD Doları
- Ağ: Yıllık -1.740 ABD Doları
- **Toplam: Yıllık -33.360 ABD Doları**

Toplantı odasında bir tahtaya yazdı.

Leo bununla baktı. "Üç puluh tiga ribu."

"Ve değişim," dedi Tom.

"Yıllık."

"Yıllık."

Priya hesapladı. "Bu, değer yaratmayan şeylere harcadığımız 2.780 ABD Doları civarındaydı."

"Tümünün değil," diye düzeltildi Tom. "Bazıları değer yarattığı şeydi, ancak çok fazla ödeniyordu. Tasarruf Planları — aynı EC2 kapasitesini, sadece daha iyi bir fiyata alıyorduk."

Maya uzun süre tahtanın önünde durdu.

"Nimbus'un başladığı zaman, her dolar sayıldı. İlk EC2 örneğini neredeyse karşılayamazdık," dedi.

"Evet," dedi Tom.

"Ve bir şekilde, dolarları o kadar dikkatli izlemeyi bıraktık."

"Büyüme bunu yapar," dedi Priya. "Odak, inşa etmeye, optimize etmeye kayar."

"İkisi de önemli," dedi Maya. "İkisi, her zaman. Bunu wiki'ye ekle. Ve maliyet için dört aylık bir inceleme ayarla."

Tom zaten takvimini açtı.

Sonraki bölümlerde, bireysel hizmetlerden uzaklaşıp mimar gibi düşünmeye başlayacağız.
