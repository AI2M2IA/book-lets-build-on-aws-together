# Bölüm 25: Özel Otoyol

Bir anlığına ayağa kalkın. Ellerinizi silkeleyin.

Parmak uçlarınız ile ülkenin diğer ucundaki bir şey arasındaki mesafeyi hissedin. O mesafeyi kat etmesi, bir düzine taşıyıcı aktarımı arasından yolunu bulması ve çalışmaya devam edebilmeniz için geri dönmesi gereken bir mesaj göndermeyi hayal edin. Şimdi bunu saniyede binlerce kez yapmayı hayal edin.

Veri aktarımının gerçekte ne olduğu budur—fiziksel mesafe, fiziksel altyapı, fiziksel kısıtlamalar.

Veri taşıma hakkında konuşacağız. AWS içindeki hizmetler arasında değil, gerçek dünya ile AWS arasında—ofisiniz ile bulut altyapınız arasında, kıtalar arasında.

---

Veritabanı ölçeklenmiş ve depolama maliyetleri azaltılmışken, Tom ağ faturasına dönmüştü. Ama Leo'nun daha acil bir sorunu vardı—4 terabayt geçmiş sipariş verisini AWS'ye taşımak mevcut bağlantılarının sınırlarını ortaya çıkarıyordu.

---

Nimbus'un altyapı ekibi (şimdi dört mühendis) Seattle'da ortak bir ofisten çalışıyordu. Yönettikleri AWS altyapısına erişime ihtiyaçları vardı. Bazı işlemler VPC'deki kaynaklara bağlanmayı gerektiriyordu.

Şu anda, herkese açık alt ağdaki bastion ana bilgisayara erişmek için dizüstü bilgisayarlarında bir VPN kullanıyorlardı, sonra oradan kaynaklara SSH yapıyorlardı.

Çalışıyordu. Yavaştı. VPN bağlantısı herkese açık internet üzerinden yönlendiriliyordu: Seattle → birden fazla taşıyıcı atlaması → us-west-2. Gidiş-dönüşler tutarsızdı—saate bağlı olarak 30 ila 80 milisaniye—ve verim, ofis uplink'i ve herkese açık yolla sınırlıydı.

"Günlük SSH için bu kabul edilebilir," dedi Leo. "Ama analiz veritabanımızı taşımaya başlamak üzereyiz. 4 terabayt geçmiş sipariş verisi. Bu bağlantı üzerinden, göç haftalar sürecek."

"Daha iyi bir bağlantıya ihtiyacımız var," dedi Maya.

"Özel bir bağlantı," diye ekledi Priya. "Herkese açık internet üzerinden değil. Ve birisi veri aktarımı sırasında içeri girmeye çalışırsa? Herkese açık internet üzerinden 4TB sipariş geçmişi—şifrelenmiş bile olsa—bir hedef gibi hissettiriyor."

İşe gitmek gibi düşünün. Bir Site-to-Site VPN, herkese açık yollarda araba kullanmak gibidir: araba kapılarınızı kilitlersiniz (şifreleme), ama yine de şeritleri herkesle paylaşırsınız ve trafik sıkışıklıkları sizi öngörülemez şekilde yavaşlatır. Direct Connect, otoyolda özel bir şerit kiralamak gibidir—paylaşılan trafik yok, tutarlı hız ve daha yüksek bir aylık gişe ücreti. Çoğu gün herkese açık yol iyidir. Değerli kargoyla dolu bir kamyonu sıkı bir programda taşırken, özel şerit için ödersiniz.

Snow Family, çoğu insanın düşünmediği seçenektir: gerçek bir kargo uçağı kiralamak. Her zaman mevcut değildir. Küçük yükler için doğru değildir. Ama tam bir kamyon için, araba kullanmaktan daha hızlı gelir ve otoyol koşullarına hiç bağlı değildir. Fizik değişmedi—hâlâ aynı bitleri taşıyorsunuz—ama mekanizma temelde farklıdır.

**AWS Site-to-Site VPN: Hızlı Seçenek**

**AWS Site-to-Site VPN**, şirket içi ağınız ile VPC'niz arasında, herkese açık interneti aşan şifreli bir tünel oluşturur.

Kurulum:

1. VPC'nize bağlı bir Virtual Private Gateway (VGW) oluşturun
2. Şirket içi yönlendiricinizi temsil eden bir Customer Gateway oluşturun
3. Aralarında iki VPN tüneli (yedeklilik için) kurun

Trafik şifrelidir (AES-256). Herkese açık internet üzerinden gider, bu da gecikmenin internet koşullarına bağlı olduğu anlamına gelir. AWS yedeklilik için otomatik olarak iki tünel sağlar—bir tünelde sorun olursa, trafik diğerine kayar.

**Site-to-Site VPN'i ne zaman kullanmalı**:

- Hızlı kurulum (dakikalardan saatlere)
- Maliyet etkin (VPN bağlantısı başına 0,05 $/saat)
- Bant genişliği: tünel başına 1,25 Gbps'a kadar
- Kullanım durumu için kabul edilebilir internet gecikmesi

**Accelerated Site-to-Site VPN**, VPN trafiğini herkese açık internet yerine AWS'nin küresel ağı üzerinden yönlendirir—Global Accelerator'ın sağladığı aynı optimizasyon, VPN tünellerine uygulanmış. Gecikme standart VPN'den daha düşük ve daha tutarlıdır. Maliyet biraz daha yüksektir (Global Accelerator veri aktarım ücretleri uygulanır). VPN'in hızlı kurulumunu ve daha düşük maliyetini isteyen ama daha iyi gecikmeye ihtiyaç duyan ekipler için, Accelerated VPN, standart VPN ile Direct Connect arasındaki pratik orta yoldur.

Nimbus'un 4TB göçü için, maksimum 1,25 Gbps'te internet tabanlı VPN şu kadar sürer: 4TB / 1,25 Gbps ≈ minimum 7 saat, gerçek dünya ek yüküyle 12-20 saate yakın. Kabul edilebilir, ama herkese açık internet yolundaki sıkışıklık onu öngörülemez kılar.

Leo matematiği daha dikkatli yaptı, çünkü teorik hesaplama ile gerçek aktarım süresi deneyiminde bir kez bile eşleşmemişti.

**Teorik**: 4 TB = 4.096 GB = 32.768 Gb. 1 Gbps'te: 32.768 saniye ≈ 9,1 saat. 9 saate yuvarla.

**Gerçek**: Leo bir önceki hafta bir test aktarımı yapmıştı—Seattle ofisinden S3'e 50 GB. Ölçülen yukarı akış hızlarında (875 Mbps) teorik süre: 457 saniye. Gerçek süre: 724 saniye. Ek yük faktörü: 1,58.

875 Mbps yukarı akışta 4TB aktarıma uygulandığında: 32.768 Gb / 0,875 Gbps × 1,58 ek yük ≈ **59.200 saniye ≈ 16,4 saat**.

Ek yük birkaç kaynaktan geldi: bağlantı kurulumunda TCP yavaş başlangıç, yeniden iletim gerektiren paket kaybı (Seattle'dan us-west-2'ye herkese açık yol ortalama %0,2 paket kaybı yaşadı—küçük, ama milyonlarca paket üzerinde çarpımsal), her çok parçalı yükleme segmenti için HTTPS el sıkışma ek yükü ve S3'ün çok parçalı yüklemeleri birleştirme işlem süresi.

"On altı saat tek seferlik bir göç için iyidir," dedi Leo. "Asıl sorun, aktarımın 14. saatte kesintiye uğramasıdır."

S3 çok parçalı yükleme kesinti sorununu çözer: aktarım 14. saatte başarısız olursa, yalnızca mevcut parçanın yeniden yüklenmesi gerekir. Önceki parçalar S3'te saklanır ve aktarım devam edebilir. Ama çok parçalı yüklemeleri yönetmenin ek yükü toplam aktarım süresine yaklaşık %3 ekledi.

Nihai gerçek dünya tahmini: **1 Gbps internet üzerinden yaklaşık 9 saat teorik, yaklaşık 17 saat gerçek**—ofislerinin 875 Mbps ölçülen yukarı akış hızını, paket kaybı ek yükünü ve çok parçalı yükleme işlemesini hesaba katarak.

Leo bunu bir an düşündü. Sonra Snow Family fiyatlandırma sayfasına baktı.

"Diğer seçenek ne?" diye sordu Tom.

"Bekle—ama *neden* bir VPN'den fazlasına ihtiyacımız olsun?" diye sordu Maya. "4TB göçü tek seferlik bir olay."

"Değil," dedi Priya. "Veri AWS'de olduğunda, ekibin hâlâ ona günlük erişmesi gerekiyor. Ve VPN gecikmesi birikir."

**AWS Direct Connect: Özel Hat**

**AWS Direct Connect**, konumunuz (veya ortak yerleşim tesisiniz) ile AWS arasında özel, kişiye özel bir ağ bağlantısı kurar. Trafik herkese açık internete asla dokunmaz.

Direct Connect fiziksel bir bağlantıdır—ağınızdan bir AWS Direct Connect konumuna bir fiber hat. Fiziksel devreyi kurmak için bir telekom sağlayıcısıyla çalışırsınız. AWS kendi tarafındaki bağlantı noktasını sağlar.

**Faydaları**:

- Tutarlı, öngörülebilir gecikme (herkese açık internet değişkenliği yok)
- 50 Mbps'ten 100 Gbps'a hızlar (2024'ten beri seçili konumlarda yerel 400 Gbps özel bağlantı noktalarıyla)
- İnternetten daha düşük veri aktarım maliyetleri (Direct Connect veri aktarım oranları standart AWS veri aktarım çıkış oranlarından daha ucuz)
- Daha güvenli (özel devre, herkese açık internet değil)

**Takaslar**:

- Kurulum haftalardan aylara sürer (fiziksel altyapı sağlama)
- VPN'den önemli ölçüde daha yüksek maliyet
- Yerleşik yedeklilik yok (yedekli devreleri kendiniz kurarsınız)
- Birden fazla devre olmadan coğrafi olarak dağınık ofisler için uygun değil

Şunu merak ediyor olabilirsiniz: Direct Connect fiziksel bir fiber kabloysa, birisi yanlışlıkla onu keserse ne olur? Bu, tek bir devreyle tek arıza noktası sorunudur—bu yüzden üretim Direct Connect kurulumları coğrafi olarak ayrı yollarda yedekli devreler kullanır veya yedek olarak bir VPN tutar. Kablo kesilebilir; iş devam eder.

"Bu ayda ne kadara mal oluyor?" diye sordu Tom. Zaten araştırmıştı. "Özel bir 1Gbps bağlantı noktası ayda 216 dolar," dedi. "Artı bir telekomun 800 $/ay olarak teklif ettiği ofisimizden gelen devre."

"Yani toplam ayda yaklaşık bin dolar."

Nimbus için: Direct Connect mevcut boyutları için aşırıydı. Ama önemli veri aktarım hacimlerine veya özel ağ bağlantıları için uyumluluk gereksinimlerine sahip kuruluşlar için, Direct Connect kendini amorti eder.

**Hosted Connections: Orta Yol**

Her kuruluş 100 Gbps özel fiber devresine bağlanamaz. **Direct Connect Hosted Connections**, AWS Direct Connect Ortaklarının (onaylanmış telekomlar) diğer müşterilerle paylaştığınız 1Gbps altı bağlantılar sağlamasına olanak tanır.

Kurulum daha hızlıdır (aylar değil, günler ila haftalar) ve özel bir bağlantıdan daha az maliyetlidir. Takas: paylaşılan kapasite, daha az tutarlı verim demektir.

Nimbus için (büyüdükçe): bir ortak aracılığıyla barındırılan 500 Mbps bağlantısı, makul bir fiyat noktasında özel bağlantı sağlardı.

Sınav zamanı önemli olan pratik fark: Hosted Connections, bir AWS Ortağı tarafından sağlanan, 50 Mbps'ten 10 Gbps'a (bazı ortaklar 25 Gbps'a kadar sunar) hızlarda mevcuttur. Dedicated Connections doğrudan AWS'ye gider ve 1 Gbps, 10 Gbps ve 100 Gbps'te (artı seçili konumlarda 400 Gbps) mevcuttur. 1 Gbps'in altındaki hızlar için, bir Hosted Connection tek Direct Connect seçeneğidir—Dedicated Connections minimum 1 Gbps'ten başlar.

**AWS Transit Gateway: VPC'ler İçin Merkez-ve-Konuşmacı (Hub-and-Spoke)**

Nimbus büyüdükçe, birden fazla VPC biriktirirlerdi: üretim VPC'si, hazırlık VPC'si, analiz VPC'si, güvenlik araçları VPC'si.

Dikkatli planlama olmadan, bu VPC'leri bağlamak tam bir VPC eşleştirme (peering) örgüsü gerektirir. 4 VPC için: 6 eşleştirme bağlantısı. 10 VPC için: 45 eşleştirme bağlantısı. 20 VPC için: 190 bağlantı. Bu ölçeklenmez.

**AWS Transit Gateway**, birden fazla VPC'yi ve şirket içi ağları bağlayan bir ağ merkezidir. Bir eşleştirme bağlantıları örgüsü yerine, her VPC Transit Gateway'e bağlanır. Transit Gateway trafiği aralarında yönlendirir.

```
Şirket içi ──── Direct Connect ──┐
                                 │
Üretim VPC ─────────────────── Transit Gateway
Hazırlık VPC ─────────────────── Transit Gateway
Analiz VPC ──────────────────── Transit Gateway
Güvenlik VPC ─────────────────── Transit Gateway
```

**Geçişli yönlendirme (transitive routing)**: VPC A ve VPC B'nin ikisi de Transit Gateway'e bağlanırsa, doğrudan bir eşleştirme olmadan iletişim kurabilirler. Transit Gateway yönlendirmeyi halleder. VPC eşleştirmesinin (geçişli olmayan) aksine, Transit Gateway merkez-ve-konuşmacı topolojisine olanak tanır.

**Transit Gateway maliyetleri**: ek (VPC veya VPN/Direct Connect bağlantısı) başına artı işlenen GB başına ücretlendirilir. Ölçekte, bu basitliğe değer.

Nimbus için, Transit Gateway'in tetikleyici olayı dördüncü bir VPC eklemekti. Şunlara sahiptiler: üretim, hazırlık, analiz ve şimdi güvenlik araçları (güvenlik açığı taraması ve SOC2 uyumluluk izleme için üretimle aynı ağ segmentinde olmaması gereken bir VPC).

Transit Gateway olmadan, dört VPC'yi bağlamak altı eşleştirme bağlantısı gerektirir:
- Üretim ↔ Hazırlık
- Üretim ↔ Analiz
- Üretim ↔ Güvenlik
- Hazırlık ↔ Analiz
- Hazırlık ↔ Güvenlik
- Analiz ↔ Güvenlik

Altı eşleştirme bağlantısı, VPC başına altı yönlendirme tablosu girişi, gözden geçirilecek altı güvenlik grubu kuralı. Ve VPC eşleştirmesi geçişli değildir: Üretim ve Analiz eşleştirilmişse ve Analiz ve Güvenlik eşleştirilmişse, Üretim Analiz VPC'si aracılığıyla Güvenlik'e ulaşamaz. Üretim ↔ Güvenlik eşleştirmesine açıkça ihtiyacınız vardır.

Transit Gateway ile:

```
Üretim VPC   ──┐
Hazırlık VPC  ──┤──── Transit Gateway ────── Şirket içi (Direct Connect)
Analiz VPC    ──┤
Güvenlik VPC  ──┘
```

Dört ek. Yönetilecek bir yönlendirme tablosu. Geçişli yönlendirme: Üretim, doğrudan bir eşleştirme olmadan Transit Gateway aracılığıyla Güvenlik'e ulaşabilir.

"Peki birisi Transit Gateway aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "Dört VPC'nin hepsi bir Transit Gateway paylaşırsa, Hazırlık VPC'sindeki ele geçirilmiş bir kaynak Üretim'e ulaşabilir."

Transit Gateway **izolasyonlu yönlendirme tablolarını** destekler: hangi VPC'lerin Transit Gateway aracılığıyla iletişim kurmasına izin verildiğini ve hangilerinin izole olduğunu tanımlayabilirsiniz. Güvenlik araçları VPC'si diğerlerinin hepsine ulaşabilir (onları taraması gerekir). Hazırlık, Üretim'e ulaşamaz. Üretim, Analiz'e doğrudan ulaşamaz (Analiz veriyi belirli bir salt okunur uç nokta aracılığıyla sorgular).

"Bir Transit Gateway," dedi Priya, "gerçek erişim modelini ifade eden yönlendirme politikalarıyla. Neyin neye ulaştığını denetlemek için merkezi bir yolu olmayan altı eşleştirme bağlantısına karşı."

**VPC Endpoints: AWS Hizmetlerine Özel Erişim**

İnce bir maliyet ve güvenlik sorunu: EC2 örneğiniz (özel bir alt ağda) S3 API'sini çağırdığında, o trafik NAT Gateway aracılığıyla yönlendirilir (S3'ün herkese açık uç noktasının olduğu internete ulaşmak için). NAT Gateway işlemesi için ödersiniz.

**VPC Endpoints**, VPC'nizdeki kaynakların AWS hizmetleriyle herkese açık internet üzerinden geçmeden—ve NAT Gateway olmadan—özel olarak iletişim kurmasına olanak tanır.

İki tür:

**Gateway endpoint'leri** (ücretsiz): S3 ve DynamoDB için. Yönlendirme tablonuza S3 veya DynamoDB trafiğini NAT Gateway yerine uç noktaya yönlendiren bir rota eklersiniz. Oluşturmak ücretsiz; kullanmak ücretsiz.

**Interface endpoint'leri** (ücretli): Diğer AWS hizmetleri için (SQS, SNS, Secrets Manager, SSM, vb.). Alt ağınızda özel bir IP'ye sahip bir ENI (Elastic Network Interface) oluşturur. Hizmete trafik bu özel IP'yi kullanır. AZ başına ~0,01 $/saat artı veri işleme maliyetlidir.

Leo Gateway endpoint'lerini bir önceki hafta yönlendirme tablolarını güncellemeden zaten oluşturmuştu. "Onu zaten dağıttım—ah," dedi, yapılandırmayı kontrol ederek. "Rotalar güncellenmedi. Bunu düzelteyim."

Tom, ücretsiz olduklarını öğrendikten sonra S3 ve DynamoDB için hemen Gateway endpoint'leri oluşturdu. NAT Gateway veri işleme ücreti %65 düştü.

Nedeninin matematiği: Nimbus'un özel alt ağlardaki Lambda fonksiyonları ve ECS görevleri S3'e (yapılandırma dosyalarını okuma, günlük dışa aktarımlarını yazma) ve DynamoDB'ye (restoran verisini okuma, sipariş kayıtlarını yazma) sürekli istekler yapıyordu. Her istek, işlenen GB başına 0,045 dolar ücret alan NAT Gateway aracılığıyla yönlendiriliyordu.

Nimbus'un aylık NAT Gateway veri işlemesi: 533 GB. Maliyet: ayda 24 dolar. S3 ve DynamoDB Gateway Endpoint'leri ekledikten ve yönlendirme tablolarını güncelledikten sonra: S3 ve DynamoDB trafiği NAT Gateway'i tamamen atladı. Aylık NAT Gateway işlemesi 187 GB'a düştü—kalan trafik diğer hizmetlere (Secrets Manager, SES, harici webhook'lar) API çağrılarıydı. Maliyet: ayda 8,40 dolar.

Tasarruf: ayda 15,60 dolar, yılda 187 dolar, kurmak 10 dakika süren iki ücretsiz Gateway Endpoint yapılandırması için.

"Ücretsiz," dedi Tom, üçüncü kez.

"Gateway endpoint'leri oluşturmak ücretsiz ve kullanmak ücretsizdir," diye onayladı Leo. "Sadece bir güvenlik iyileştirmesi değiller—S3 ve DynamoDB trafiğini NAT Gateway yerine özel bir uç nokta aracılığıyla yönlendirmek, onu herkese açık internetten tamamen kaldırır."

"Peki birisi NAT Gateway trafiği aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "S3'e trafik NAT aracılığıyla giderse, internetten adreslenebilir. Gateway Endpoint aracılığıyla, özeldir."

Bu, maliyet tartışmasının bazen gölgelediği Gateway Endpoint'lerin ikincil faydasıdır. Bir VPC Gateway Endpoint aracılığıyla S3 ve DynamoDB'ye trafik AWS ağından asla ayrılmaz, herkese açık bir IP adresini asla aşmaz ve uç nokta politikası tarafından yönetilir (uç noktanın hangi S3 paketlerine veya DynamoDB tablolarına erişebileceğini kısıtlayabilen kaynak tabanlı bir politika). Müşteri verisi saklayan bir paketteki bir Gateway Endpoint ekstra bir katman ekler: yanlış yapılandırılmış bir paket politikasıyla bile, uç nokta politikası erişimi belirli VPC içinden kaynaklanan trafikle sınırlayabilir.

**AWS Global Accelerator: Kenarda (Edge) Yönlendirme**

Nimbus Doğu Kıyısı kullanıcılarına us-west-2'den (Oregon) hizmet ettiğinde, gecikme 80ms idi. Sunucu yasaklanacak kadar uzak olduğu için değil, Boston ile Oregon arasındaki herkese açık internet yönlendirmesi en uygun olmadığı, birden fazla taşıyıcı ağı arasında zıpladığı için.

**AWS Global Accelerator**, AWS'nin özel küresel omurgasını kullanır—trafiği herkese açık internet taşıyıcı atlamaları yerine AWS kontrollü yollar aracılığıyla uygulamanıza yönlendiren dağıtık bir kenar konumları ağı. Herkese açık internet yönlendirmesi yerine, trafik en yakın kenar konumunda AWS'nin ağına girer ve uygulamanıza optimize edilmiş özel yol üzerinden gider.

Nimbus için, Boston'daki bir kullanıcı şöyle yapardı:

- **Global Accelerator olmadan**: Herkese açık internet taşıyıcıları aracılığıyla yönlendir → ~80ms
- **Global Accelerator ile**: Boston'daki en yakın AWS kenarına ulaş → AWS omurgasında seyahat et → us-west-2'ye ulaş → ~60ms

Global Accelerator içeriği önbelleğe almaz (o CloudFront'tur). Dinamik istekler için ağ yolunu optimize eder.

Leo, Nimbus API için Global Accelerator'ı etkinleştirdikten sonra birkaç şehir arasında bir gecikme karşılaştırması yaptı:

| Şehir | Önce | Sonra | İyileştirme |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | %8 |
| Los Angeles, CA | 28ms | 22ms | %21 |
| Chicago, IL | 55ms | 40ms | %27 |
| New York, NY | 82ms | 61ms | %26 |
| Londra, UK | 145ms | 112ms | %23 |
| Tokyo, Japonya | 180ms | 95ms | %47 |
| Sydney, Avustralya | 210ms | 118ms | %44 |

İyileştirme coğrafi olarak uzak kullanıcılar için en dramatikti—Tokyo 180ms'den 95ms'ye, Sydney 210ms'den 118ms'ye. Seattle için (Oregon'daki us-west-2 veri merkezlerine yakın), iyileştirme daha küçüktü—optimize edilecek daha az herkese açık internet atlaması vardı.

"Bekle—ama Tokyo *neden* %47 iyileştirme alıyor?" diye sordu Maya. "Veri merkezi hâlâ us-west-2'deyse, gerçek kısıtlama ışık hızı değil mi?"

"Işık hızı taban," dedi Leo. "Gerçek kısıtlama herkese açık internet yönlendirmesi. Tokyo'dan us-west-2'ye trafik düzinelerce otonom sistemi geçer—farklı taşıyıcılar, farklı yönlendiriciler, farklı eşleştirme anlaşmaları. Her atlama gecikme ekler. Global Accelerator trafiği Tokyo kenar konumundan us-west-2'ye AWS'nin özel fiberi üzerinden yönlendirir, ki bunun daha kısa yolları ve daha iyi ayarlanmış yönlendirmesi var."

Tokyo'dan us-west-2'ye teorik minimum (fiber üzerinde ışık hızına dayalı, yaklaşık 15.500 km gidiş-dönüş): ~77ms. Global Accelerator ile 95ms o teorik minimuma yaklaşıyor. Onsuz 180ms, fizik yasalarını değil, herkese açık internet yönlendirmesinin verimsizliğini yansıtıyor.

Global Accelerator en yakın kenar konumuna yönlendiren iki statik **anycast IP adresi** sağlar. CloudFront'un (değişen dinamik IP adresleri kullanan) aksine, bu IP'ler kararlıdır—güvenlik duvarı izin listesine alma ve istemcilerin bağlanması için sabit bir IP gerektiren uygulamalar için yararlı.

**Global Accelerator vs CloudFront ne zaman kullanılmalı**:

- CloudFront: statik ve önbelleğe alınabilir içerik, CDN kullanım durumu
- Global Accelerator: dinamik içerik, HTTP olmayan protokoller (UDP, oyun, IoT) veya statik bir Anycast IP adresine ihtiyaç duyduğunuzda

## Sadece Trafiği Değil, Veriyi Taşımak: DataSync ve Transfer Family

Ağ mimarisi şekillenirken, Maya'nın üç yeni restoran zinciri katılım projesi aynı anda geldi. Her birinin bir veri göçü gereksinimi vardı—ve her gereksinim farklıydı.

İlk zincir, Pacific Table, 40 TB NFS dosya paylaşımını S3'e taşıması gerekiyordu. Mevcut dosya depolamaları şirket içiydi, Seattle merkezlerindeki dört dosya sunucusuna yayılmıştı. Leo bir göç planı yazmaya başladı.

İkinci zincir, Marisol Group, faturaları günlük olarak yerel bir SFTP sunucusuna yükleyen bir muhasebe ekibine sahipti. SFTP iş akışı 2015'ten beri çalışıyordu. Muhasebe personeli tek bir şey biliyordu: her sabah 09:00'da SFTP istemcilerini açıyor, faturalarını bırakıyor ve kapatıyorlardı. Kimse bunu değiştirmek istemiyordu. "Muhasebecileri WinSCP kullanıyor," dedi Maya. "Bu pazarlık konusu değil."

"Bunlar iki farklı araç," dedi Priya.

"Evet," dedi Leo. "Ama ikisi de var."

**AWS DataSync: Steroidli rsync, AWS Konsoluyla**

Pacific Table'ın 40 TB göçü için, zorluk bant genişliği değildi—Seattle ofisinin sağlam bir yukarı akış bağlantısı vardı. Zorluk orkestrasyondu: hangi dosyaların var olduğunu keşfetme, onları güvenilir şekilde aktarma, sağlama toplamlarını doğrulama, iş saatleri sırasında ofis ağını doyurmaktan kaçınmak için aktarımı zamanlama ve birkaç günlük sürekli işlem boyunca ilerlemeyi izleme.

**AWS DataSync**, aracı tabanlı bir veri göçü ve replikasyon hizmetidir. Şirket içi ortamınıza hafif bir DataSync aracısı yüklersiniz—VMware'de veya bir EC2 örneği olarak çalışan bir sanal makine. Aracı, NFS veya SMB üzerinden dosya sunucularınıza bağlanır, paylaşımlarınızı keşfeder ve onları AWS'deki bir hedefe senkronize eder: bir S3 paketi, bir EFS dosya sistemi veya bir FSx dosya sistemi.

Onu AWS konsoluyla steroidli rsync olarak düşünün. DataSync şunları halleder:

- **Keşif**: aracı kaynak paylaşımlarınızı otomatik olarak envanterler
- **Zamanlama**: aktarımlar tanımlı bir programda (iş saatleri dışında) veya sürekli çalışabilir
- **Doğrulama**: DataSync her iki uçta sağlama toplamlarını hesaplar ve sizi herhangi bir tutarsızlık konusunda uyarır
- **İzleme**: aktarım ilerlemesi, dosya sayıları, hata raporları ve bant genişliği kullanımı hepsi konsolda görünür
- **Aktarımda şifreleme**: tüm veri aktarım sırasında TLS kullanılarak şifrelenir

Pacific Table için, Leo DataSync aracısını Seattle ağlarındaki bir VM'ye yükledi, onu dört NFS paylaşımına yönlendirdi ve bir aktarım programı yapılandırdı: hafta içi 20:00 ile 06:00 arası, hafta sonu sürekli. Altı gün sonra, tüm 40 TB S3'e indi. Aktarımı DataSync'in yerleşik sağlama toplamı raporuyla doğruladı. Sıfır tutarsızlık.

"Peki devam eden replikasyon için?" diye sordu Maya. "Pacific Table göçten sonra hâlâ dosya ekleyecek."

"DataSync artımlı (incremental) aktarımları destekler," dedi Leo. "İlk senkronizasyondan sonra, yalnızca değişeni kopyalar. Onu bir replikasyon işi olarak gece çalıştırabiliriz."

**AWS Transfer Family: SFTP İş Akışınız, S3 Destekli**

Marisol Group'un muhasebe ekibi için, gereksinim farklıydı. Kimse SFTP'den uzaklaşmıyordu. Muhasebeciler WinSCP kullanmaya devam edecekti. Soru şuydu: o SFTP yüklemeleri nereye iniyor?

Şu anda, Marisol arka ofisindeki yerel bir Linux sunucusuna iniyorlardı. Dosyalar sonra muhasebe sistemlerine manuel olarak taşınıyordu. Yerel sunucu bakım, yedekleme ve onu yönetmek için SSH erişimi olan birini gerektiriyordu.

**AWS Transfer Family**, tam yönetilen bir SFTP, FTPS ve FTP sunucusudur—depolama hedefi olarak S3 veya EFS destekli. Bir Transfer Family uç noktası sağlarsınız (bir ana bilgisayar adı ve isteğe bağlı olarak statik bir IP adresi alır). İstemcileriniz mevcut SFTP yazılımlarını kullanarak ona bağlanır. Dosya yüklediklerinde, o dosyalar doğrudan bir S3 paketine iner.

Muhasebe ekibi hiçbir şeyi değiştirmez. Hâlâ her sabah 09:00'da WinSCP'yi açarlar. Hâlâ mevcut kimlik bilgileriyle bir SFTP sunucusuna bağlanırlar. Hâlâ faturalarını aynı klasöre bırakırlar. Fark onlara görünmezdir: sunucu tarafında, dosyalar artık yerel bir Linux sunucusu yerine doğrudan S3'e gider.

"Ve S3'ten, iş akışının geri kalanını otomatik olarak tetikleyebiliriz," dedi Priya. "Bir S3 olayı, faturayı işleyen ve muhasebe sistemine ekleyen bir Lambda fonksiyonunu tetikler. Manuel adım yok."

"Yani muhasebecilerin iş akışı değişmiyor," dedi Maya, "ama bizim tarafımızda, tüm şey otomatikleştirilmiş."

"Evet. Ve SFTP sunucusunun kendisi tam yönetilir—yamalama yok, yedekleme yok, bakımı yapılacak sunucu yok."

Tom fiyatlandırmayı zaten araştırmıştı. Transfer Family, uç nokta kullanılabilirliği saati başına artı aktarılan GB başına ücret alır. Marisol Group'un fatura hacmi için, aylık maliyet 30 doların epeyce altındaydı. Yerini aldığı yerel sunucuyu sürdürme maliyeti—donanım amortismanı, bakım için mühendislik zamanı, yedekleme yönetimi—önemli ölçüde daha fazlaydı.

---

> **Sınav İpucu — DataSync ve Transfer Family**
>
> *SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.1)*
>
> - **DataSync** = veriyi şirket içinden AWS'ye toplu taşıma (NFS veya SMB dosya paylaşımları → S3, EFS veya FSx). Sınav sinyalleri: "dosya paylaşımlarını taşı," "NFS verisini S3'e replike et," "şirket içinden AWS'ye veri aktarımı," "dosya verisinin devam eden replikasyonu." DataSync şirket içinde yüklü bir aracı kullanır; aracı keşif, zamanlama ve doğrulamayı halleder.
> - **Transfer Family** = istemci araçlarını değiştirmeden SFTP, FTPS veya FTP protokollerini kullanarak devam eden dosya aktarımı. Sınav sinyalleri: "mevcut SFTP iş akışı," "ortaklar SFTP aracılığıyla dosya yükler," "S3 destekli SFTP sunucusu," "SFTP'yi kaldır-ve-taşı," "dosya aktarım sürecini değiştiremez." Transfer Family, gereksinim veri hacmi değil SFTP uyumluluğu olduğunda cevaptır.
> - **Ayrım önemlidir**: DataSync toplu göç ve replikasyon içindir (aracı tabanlı, program odaklı, ağ optimize edilmiş). Transfer Family protokol uyumlu dosya aktarım hizmetleri içindir (uç nokta tabanlı, her zaman açık, istemci şeffaf). Farklı sorunları çözerler.
> - DataSync hedef olarak S3, EFS ve FSx'i destekler. Transfer Family depolama arka ucu olarak S3 ve EFS'i destekler.

---

**Sadece Dosyaları Değil, Sunucuları Taşımak: 7 R ve MGN**

Maya'nın hattındaki üçüncü zincirin sadece dosyaları değil—tüm sunucuları vardı: kimsenin taşımadan önce yeniden yazmak istemediği iki şirket içi makinede çalışan özel bir rezervasyon uygulaması. *Uygulamaları* taşımak kendi disiplinidir ve AWS çoğunlukla tanımanız gereken **yedi taşıma yolu** ("7 R") tanımlar:

- **Rehost** ("kaldır ve taşı"): sunucuları olduğu gibi taşı. En hızlı, en az değişiklik.
- **Replatform** ("kaldır, kurcala ve taşı"): yolda küçük yükseltmeler—kendi kendine yönetilen bir veritabanını RDS'e taşımak gibi.
- **Repurchase**: eski sistemi bırak, bunun yerine SaaS satın al.
- **Refactor**: bulut-yerel yeniden tasarla. En çok çaba, en çok kazanç.
- **Retire**: anlaşılan kimse kullanmamış. Sil onu.
- **Retain**: şimdilik olduğu yerde bırak.
- **Relocate**: hiçbir şeyi değiştirmeden hipervizör düzeyinde taşı.

Rehost durumu için, araç **AWS Application Migration Service (MGN)**: bir aracı kaynak sunucuların disklerini blok blok AWS'deki düşük maliyetli bir hazırlık alanına replike eder; istediğiniz zaman test kopyaları başlatırsınız; geçişte, MGN replike edilen sunucuları yerel EC2 örneklerine dönüştürür. Kaldır, taşı, bitti—yeniden faktörleme daha sonra, bulut zamanında gelebilir. (Portföy planlaması için arkadaşları, Application Discovery Service ve Migration Hub, 2025 sonunda yeni müşterilere kapandı—sınav bahsederse onların adlarını "envanter keşfi" ve "merkezi göç izleme" olarak bilin.)

---

**AWS Snow Family: Fiziksel Seçenek**

Hâlâ 4TB geçmiş veri kümesi ve 17 saatlik internet tahmini meselesi vardı. Onu hesapladıktan sonra, Leo Snow Family fiyatlandırma sayfasına bakmış ve kararı hemen vermişti.

Zamanın basitlikten daha önemli olduğu birkaç terabaytın üzerindeki göçler için, AWS konumunuza fiziksel depolama cihazları gönderir. Onları veriyle doldurursunuz. Onları geri gönderirsiniz. AWS veriyi doğrudan S3'e alır.

**Snowball Edge Storage Optimized**: 80 TB kullanılabilir kapasite, sertleştirilmiş muhafaza. Konumunuza 2-5 iş günü içinde gönderilir. Yerel arayüzü (NFS, S3 arayüzü) kullanarak veriyi yüklersiniz. Onu geri gönderirsiniz. AWS veriyi teslim aldıktan yaklaşık 1-3 iş günü sonra alır.

Nimbus'un 4TB göçü için, süreç:

1. AWS konsolu aracılığıyla bir Snowball Edge **sipariş et** (2 dakika sürer, 3 günde gönderilir)
2. Cihazı Seattle ofis ağına **bağla**; bir NFS bağlama noktası olarak sunulur
3. Cihazın S3 uyumlu arayüzünü kullanarak 4TB geçmiş sipariş verisini **kopyala**: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Kopya tamamlanır** yaklaşık 2 saatte (yerel ağ, internet yok)
5. Cihazı AWS'ye geri **gönder** (önceden ödenmiş etiket dahil)
6. AWS veriyi teslim aldıktan 72 saat içinde S3'e **alır**
7. **Doğrula**—S3 her aktarılan dosyayı ve sağlama toplamını gösteren bir iş tamamlama raporu sağlar

Toplam geçen süre: teslimat için 3 gün + kopyalamak için 2 saat + 1 gün gönderim + 2 gün alım = yaklaşık 7 takvim günü. Sürekli yaklaşık 17 saate karşı—ki bu kararlı, kesintisiz bir internet bağlantısı gerektirir, ofis uplink'ini gece boyunca ve bir iş gününün çoğu boyunca doyurur.

Maliyet: Snowball Edge cihaz kiralama 10 gün için 300 dolar. Gönderim (iki yönlü): yaklaşık 80 dolar. S3 veri aktarım girişi ücretsiz. Toplam göç maliyeti: **380 dolar**.

Yaklaşık 17 saat sürekli 875 Mbps internet kullanımıyla karşılaştırın: VPN tüneli ücretsizdi (0,05 $/saat ama tünel zaten çalışıyordu); S3 aktarım girişi ücretsizdi. "Ücretsiz" internet yolunun mühendislik zamanında (17 saatlik bir aktarımı izleme), riskte (yeniden başlatma gerektiren herhangi bir kesinti) ve fırsat maliyetinde (aktarım penceresi sırasında internet bağlantılarının doymuş olması) gerçek bir maliyeti vardı. Leo siparişi verdi. Nasıl sonuçlandığı bu bölümün kredilerden sonraki sahnesinde.

---

## Güçlü Yönler ve Sınırlamalar

**Site-to-Site VPN**:

- Hızlı kurulum, düşük maliyet
- Herkese açık internet yolu değişken gecikme demektir
- Sınırlı bant genişliği tavanı (tünel başına 1,25 Gbps)
- Accelerated VPN seçeneği biraz daha yüksek maliyetle gecikmeyi iyileştirir

**Direct Connect**:

- Tutarlı, özel, yüksek bant genişliği
- Kurulumu yavaş, önemli tekrarlayan maliyet
- Fiziksel devre tek arıza noktasıdır (yedeklilik ekleyin veya VPN yedeği tutun)
- Çıkış maliyet tasarruflarıyla başa baş noktası, fiyatlandırma senaryosuna bağlı olarak kabaca ayda 10-15 TB

**AWS Snow Family**:

- 1-2 TB üzerindeki tek seferlik göçler için, genellikle ağ aktarımından daha hızlı ve daha ucuz
- Göç sırasında internet bant genişliği tüketimi yok
- 10 günlük cihaz kiralama penceresi; önceden ödenmiş gönderim

**Transit Gateway**:

- Çoklu VPC bağlantısını dramatik şekilde basitleştirir
- Geçişli yönlendirme (VPC eşleştirmesinin aksine)
- İzolasyon yönlendirme tabloları ayrı eşleştirme bağlantıları olmadan segmentasyona izin verir
- Maliyet birçok ek için birikir

**VPC Endpoints**:

- S3/DynamoDB için güvenlik ve maliyet faydası (ücretsiz gateway endpoint'leri)
- AWS hizmet trafiği için NAT Gateway maliyetlerini ortadan kaldırır
- Uç nokta politikaları IAM ve paket politikalarının ötesinde ekstra bir erişim kontrol katmanı ekler
- Diğer hizmetler için interface endpoint'leri (Secrets Manager, SSM, SES) trafiği özel tutar ama AZ başına ~0,01 $/saat maliyetlidir

**Global Accelerator**:

- Küresel kullanıcılar için dinamik uygulama gecikmesini iyileştirir: uzak kullanıcılar için pratikte %33-47 iyileştirme
- Sabit Anycast IP'leri (CloudFront'un dinamik IP'lerinin aksine)—güvenlik duvarı izin listesine alma için yararlı
- HTTP olmayan protokoller (UDP, TCP)—CloudFront yalnızca HTTP/HTTPS
- Ek maliyet (hızlandırıcı başına 0,025 $/saat + veri aktarımı)

## Özet

Bölüm 24'teki Aurora çalışması, Nimbus'un kendi uygulamasına nasıl veri sunduğunu optimize etti. Bu bölüm, verinin dış dünya ile AWS arasında nasıl hareket ettiği—ve bu hareketi nasıl daha güvenilir, daha hızlı ve daha ucuz hâle getireceği—hakkındadır.

- **Site-to-Site VPN**: Şirket içi ve VPC arasında herkese açık internet üzerinden şifreli tünel. Hızlı kurulum, daha düşük maliyet, değişken gecikme. Yedeklilik için iki tünel. Tünel başına maksimum 1,25 Gbps.
- **Direct Connect**: AWS'ye özel, kişiye özel fiber bağlantı. Öngörülebilir gecikme, daha yüksek bant genişliği, kurulumu haftalar, önemli maliyet. Nimbus'un fiyatlandırma senaryosu için VPN'in çıkış tasarruflarıyla başa baş noktası yaklaşık ayda 13,5 TB.
- **AWS Snow Family**: Toplu veri göçü için fiziksel depolama cihazları. Çok-TB göçler için internet aktarımından daha hızlı. Nimbus'un 4TB göçü için toplam 380 dolar vs yaklaşık 17 saat ağ doygunluğu.
- **Transit Gateway**: VPC ve şirket içi bağlantı için merkez. Geçişli yönlendirmeye olanak tanır (VPC eşleştirmesinin aksine). Hangi VPC'lerin hangilerine ulaşabileceğini kontrol etmek için izolasyon yönlendirme tablolarını destekler. Yüzlerce bağlantıya ölçeklenir.
- **VPC Endpoints**: NAT Gateway olmadan AWS hizmetlerine özel erişim. Gateway endpoint'leri (S3, DynamoDB) ücretsizdir—S3 veya DynamoDB'ye erişen her VPC'ye ekleyin. Nimbus'a ayda 15,60 dolar tasarruf ettirdi ve S3/DynamoDB trafiğini NAT Gateway'den kaldırdı.
- **Global Accelerator**: Dinamik trafiği daha düşük, daha tutarlı küresel gecikme için AWS özel omurgası üzerinden yönlendirir. Statik Anycast IP'leri. Uzak kullanıcılar için %33-47 gecikme iyileştirmeleri (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms). CDN değil—önbelleğe almaz.
- **AWS DataSync**: Şirket içi NFS/SMB dosya verisini S3, EFS veya FSx'e taşıma ve replike etme için aracı tabanlı hizmet. Zamanlama, sağlama toplamı doğrulama, izleme halleder. Tek seferlik göçler ve dosya paylaşımlarının devam eden replikasyonu için kullanılır.
- **AWS Transfer Family**: S3 veya EFS destekli yönetilen SFTP, FTPS ve FTP sunucusu. Mevcut SFTP istemcilerinin iş akışlarını değiştirmeden dosyaları S3'e yüklemesine olanak tanır.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.4)*

- **VPN vs Direct Connect sinyalleri**: VPN = "VPC'ye trafiği şifrele," "hızlı kurulum," "maliyete duyarlı." Direct Connect = "tutarlı düşük gecikme," "büyük veri aktarımları," "özel bağlantı," "özel ağ gerektiren uyumluluk."
- **Transit Gateway vs VPC Peering**: Eşleştirme geçişli değildir (A→B→C, A→C'ye izin vermez). Transit Gateway geçişlidir. "İletişim kurması gereken birçok VPC" → Transit Gateway.
- **VPC Gateway Endpoints**: Ücretsiz. Yalnızca S3 ve DynamoDB. Yönlendirme tablosu değişikliği. Ekstra maliyet yok. Sınav senaryosu: "özel alt ağdan S3 erişimi için veri aktarım maliyetlerini azalt" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = dinamik içerik, HTTP olmayan, statik IP, ağ optimizasyonu. CloudFront = önbelleğe alma, HTTP içeriği, CDN.
- **Direct Connect + VPN**: Bir Direct Connect bağlantısı için yedek olarak bir VPN kullanabilirsiniz. Direct Connect devresi başarısız olursa, trafik VPN'e geçer. Yalnız VPN'den daha pahalı, yalnız Direct Connect'ten daha güvenilir.
- **Direct Connect Gateway**: Bir Direct Connect devresini birden fazla bölge veya hesap arasında birden fazla VPC'ye bağlayın. Onsuz, bir Direct Connect devresi bir bölgedeki bir VGW'ye bağlanır.
- **AWS Snow Family**: "Büyük veri göçü," "aktarım hızı çok yavaş," "petabayt ölçekli göç" → Snow Family. Snowball Edge = 80TB'a kadar. Önce aktarım matematiğini yapın: veriyi mevcut ağ üzerinden taşımak kabaca bir hafta veya daha fazla sürerse, cevap fiziksel bir cihazdır. *Gerçeklik kontrolü (2026)*: AWS aileyi emekliye ayırıyor—Snowmobile 2024'te geri çekildi, Snowcone 2024 sonunda durduruldu ve Kasım 2025 itibarıyla Snow cihazları artık yeni müşterilere sunulmuyor (AWS şimdi hızlı bağlantılar üzerinden DataSync'e ve kendi sürücülerinizi getirdiğiniz güvenli konumlar olan **Data Transfer Terminals**'a işaret ediyor). SAA-C03 soru bankası bunların hepsinden önce gelir, bu yüzden sınavda "haftalarca ağ aktarımı, sınırlı bant genişliği" hâlâ Snowball'a işaret eder.
- **Transit Gateway yönlendirme tabloları**: Transit Gateway ağ segmentasyonu için birden fazla yönlendirme tablosunu destekler. Sınav sinyali: Transit Gateway aracılığıyla paylaşılan bağlantıyla "üretim VPC'sini hazırlıktan izole et" → ayrı yönlendirme tabloları.
- **Global Accelerator sabit IP'leri**: CloudFront'un aksine, Global Accelerator iki statik Anycast IP sağlar. Sınav sinyali: "uygulamanın istemcilerin izin listesine alması için sabit bir IP adresine ihtiyacı var" veya "UDP trafiği" → Global Accelerator (CloudFront yalnızca HTTP/HTTPS).
- **AWS DataSync sinyalleri**: "NFS/SMB dosya paylaşımlarını S3/EFS/FSx'e taşı," "şirket içi dosya verisinin devam eden replikasyonu," "aracı tabanlı dosya göçü." DataSync protokol uyumlu SFTP aktarımı için değildir—toplu dosya paylaşımı göçü ve replikasyonu içindir.
- **AWS Transfer Family sinyalleri**: "mevcut SFTP iş akışı," "ortaklar veya müşteriler SFTP aracılığıyla dosya yükler," "istemci araçlarını değiştirmeden SFTP sunucusunu buluta kaldır," "S3 destekli SFTP/FTPS/FTP." Transfer Family bir veri göçü aracı değildir—yönetilen bir protokol uç noktasıdır. Ayrım: DataSync veriyi bir programda toplu taşır; Transfer Family devam eden dosya yüklemeleri için her zaman açık bir SFTP/FTP uç noktası sağlar.
- **MGN (Application Migration Service)**: "yüzlerce VM'yi hızlıca taşı, kod değişikliği yok," "sunucuları EC2'ye rehost / kaldır-ve-taşı" → MGN (blok düzeyinde replikasyon, test başlatmaları, yerel EC2 örneklerine geçiş). DataSync *dosyaları* taşır; DMS *veritabanlarını* taşır; MGN *tüm sunucuları* taşır.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

AWS Site-to-Site VPN ile AWS Direct Connect arasındaki farkı açıklayın. Hangi senaryoda her birini seçerdiniz?

*(İpucu: Kurulum süresini, maliyeti, gecikme tutarlılığını ve bant genişliği gereksinimlerini düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir finansal hizmetler şirketi, şirket içi veri merkezinden AWS'ye özel, şifreli, kişiye özel bir ağ bağlantısı gerektiriyor. Günlük 500GB hassas finansal veri aktarıyorlar. Bağlantının tutarlı, öngörülebilir gecikmesi olmalı ve herkese açık interneti aşmamalı. Ayrıca birincil başarısız olursa diye bir yedek bağlantıya ihtiyaçları var.

Bu gereksinimleri EN İYİ hangi mimari karşılar?

A) BGP yönlendirmeli bir Site-to-Site VPN ve yedeklilik için ikinci bir VPN  
B) Direct Connect Gateway'li bir Direct Connect Hosted Connection  
C) Farklı internet sağlayıcıları aracılığıyla iki Site-to-Site VPN bağlantısı  
D) Yedek olarak bir Site-to-Site VPN ile bir Direct Connect bağlantısı

**İpucu 1**: "Herkese açık interneti aşmamalı"—VPN trafiği herkese açık internet üzerinden gider (şifreli). Yalnızca Direct Connect özeldir.

**İpucu 2**: "Tutarlı, öngörülebilir gecikme"—herkese açık internet VPN performansı değişir. Direct Connect tutarlıdır.

**İpucu 3**: "Yedek bağlantı"—Direct Connect birincil olduğunda önerilen yaklaşım nedir?

**Cevap**: D

**Açıklama**: Direct Connect herkese açık interneti aşmayan özel, kişiye özel bir bağlantı sağlar—gizlilik ve gecikme gereksinimlerini karşılar. Yedek olarak bir Site-to-Site VPN yedeklilik sağlar: Direct Connect devresi başarısız olursa, trafik şifreli VPN'e geçer. Bu, Direct Connect için standart HA kalıbıdır.

**Neden A değil?** Site-to-Site VPN trafiği herkese açık interneti aşar, ki bu "herkese açık interneti aşmamalı" gereksinimini ihlal eder.

**Neden B değil?** Bir Hosted Connection bir Direct Connect bağlantısı sağlar ama B seçeneği bir yedek içermez. Yedeği olmayan tek Direct Connect tek bir arıza noktasıdır—fiziksel fiber kesilebilir.

**Neden C değil?** Farklı ISS'ler aracılığıyla iki VPN bağlantısı, şifreli olsa bile hâlâ herkese açık interneti aşar. Özel ağ gereksinimini karşılamaz.

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama — Görev 3.4*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus, Seattle, Berlin ve Singapur'da bölgesel mühendislik ekiplerine sahip olacak şekilde genişliyor. Her bölgesel ekibin şunlara erişmesi gerekiyor:

- Üretim VPC'si (ayıklama için salt okunur)
- Hazırlık VPC'si (test için tam erişim)
- Analiz VPC'si (raporlama için salt okunur)

Ağ bağlantısını tasarlayın. Transit Gateway kullanır mıydınız? Her bölgede Direct Connect mi yoksa Site-to-Site VPN mi? Üretim için salt okunur erişimi nasıl uygulardınız? (İpucu: bu hem bir ağ hem de bir IAM sorusudur.)

*(Tek bir doğru cevap yoktur. Amaç, çoklu bölge, çoklu ekip ağ tasarımı pratiği yapmaktır.)*

**Uzantı**: Berlin ekibi, üretim VPC'sine (us-west-2) VPN gecikmelerinin ortalama 160ms olduğunu bildiriyor. Hangi veri hacminde Accelerated Site-to-Site VPN veya bir Direct Connect Hosted Connection daha iyi seçenek hâline gelir? Bir Avrupa AWS Ortağından mevcut Direct Connect Hosted Connection fiyatlandırmasını araştırın. Tahmini veri hacminizde yalnızca gecikme iyileştirmesi maliyeti haklı çıkarır mıydı?

## Kredilerden Sonraki Sahne

Veri göçü 8 takvim gününde tamamlandı—Snowball Edge'in gelmesi için 3 gün, veriyi kopyalamak için 94 dakika, AWS'nin cihazı alması ve veriyi alması için 4 gün, sonra Snowball yoldayken biriken deltanın son senkronizasyonu. Tüm şey için uygulamalı süre: dört saatin altında.

O son adım önemliydi. Snowball Edge, 4TB veri kümesinin noktaya-zamanda bir anlık görüntüsünü kopyaladı. Yoldayken, üretim veritabanı çalışmaya devam etmişti—yeni siparişler veriliyor, yeni kayıtlar oluşturuluyordu. VPN üzerinden delta senkronizasyonu 12GB'di, 18 dakikada tamamlandı.

"Toplu aktarım Snowball'du," dedi Leo. "Senkronizasyon sadece sürdüğü 8 günden net-yeni veriydi."

"Onu zaten dağıttım—ah," dedi Leo, 94 dakika sonra Snowball Edge'de kopyanın tamamlanmasını izleyerek. "İş saatleri sırasında ofis ağını doyurmaktan kaçınmak için yerel kopyada bant genişliği kısıtlamasını ayarlamalıydım."

Kısıtlamayı ayarlamamıştı. Ofis interneti iyiydi—Snowball yerel bir ağ işlemiydi. Ama kopya 9 Gbps yerel verime yaklaştığında ağ anahtarı kısa süreliğine bir darboğaz hâline geldi.

"Mesele," dedi, kısıtlama ayarını düzelttikten sonra, "belirli bir veri hacminin üzerinde fiziksel postanın internetten daha hızlı olmasıdır."

"Bu ya bariz ya da sezgiye aykırı," dedi Maya, "nasıl düşündüğüne bağlı."

"Bir dahaki sefere," dedi Leo, "bir Direct Connect kurmalıyız."

Tom hesap makinesine uzanmadı—matematiği daha önce, Direct Connect ilk gündeme geldiğinde zaten yapmıştı: ayda yaklaşık bin dolar, bağlantı noktası artı devre.

"Şimdi yaptığımız iş için muhtemelen buna değmez. Ama ofisimiz ile AWS arasında ayda 10TB'den fazlasını taşımaya başlarsak, Direct Connect'teki veri aktarım tasarrufları maliyeti telafi ederdi."

"Yani veri aktarım hacmini izliyoruz," dedi Priya, "ve eşiği geçtiğinde yeniden değerlendiriyoruz."

"Bu maliyet bilinçli mimaridir," dedi Tom.

"Bu her zaman mesele oldu," dedi Maya.

Priya göçü odanın diğer ucundan izlemişti. "Bir dahaki sefere böyle bir şey yaptığımızda," dedi, "veri üretimde olmadan ve iş ona bağlı olmadan önce yapabilir miyiz? Canlı veriyi taşımak her zaman beklemedeki veriyi taşımaktan daha risklidir."

"İş çalışırken asla beklemede olmaz," dedi Leo.

"Biliyorum," dedi. "Mesele bu. Göçü ihtiyacın olmadan önce planla. Sonra değil."

Tom, herhangi bir zamanda bir göçü almaya hazır us-east-1'de ikinci bir altyapı setine sahip olmanın ne kadara mal olacağını zaten hesaplamıştı. Sayıyı şimdilik kendine sakladı. Kapatılacak daha acil bölümler vardı.

Sonraki bölümde: herhangi bir veritabanının makul olarak saklayabileceğinden fazla veriniz olduğunda ve hepsini anlamlandırmanız gerektiğinde ne olur.
