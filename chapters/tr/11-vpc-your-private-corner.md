# Bölüm 11: Bulutunuzun Özel Köşesi

Priya, üzerinde bir çizim olan bir kağıda tutunuyordu.

Çizim karmaşık değildi. "AWS" etiketli bir dikdörtgen ve dikdörtgenin içinde: EC2 örnekleri, bir RDS veritabanı, bir ElastiCache kümesi. Her şeyin diğer her şeyle bağlantılarını gösteren çizgiler. Ve dikdörtgenin dışında, tek bir etiket: "İnternet."

Masanın ortasına yerleştirdi.

"İşte sahip olduğumuz şey," dedi. "Veritabanımızın bir kamu IP adresi var. Önbellek katmanımız internetten erişilebilir. EC2 örneklerimiz tümü aynı düz ağ üzerinde."

"Bu iyi görünüyor," dedi Leo. "Güvenlik gruplarımız var."

"Sizin yapılandırdığınız güvenlik grupları," dedi Priya. "Gece. Başlangıç kurulumu sırasında."

Leo bir şey söylemedi.

"Yapılandırmayı eleştirmiyorum," dedi. "Sadece her şey düz bir kamu ağında yaşadığında, çalışan bir sistem ile internete erişebilen bir sistem arasındaki farkın tek bir yanlış yapılandırma olduğunun farkında olmamız gerektiğini söylüyorum."

Kırmızı bir kalem aldı ve veritabanını sarmalamak için bir daire çizdi.

"Bu internetten erişilememeli. Asla. Güvenlik grubu kuralı, sertleştirilmiş bir yapılandırma yoluyla değil. Yapısal olarak erişilemez olmalı."

"Ağ mimarisi hakkında konuşmamız gerekiyor," dedi Maya.

"Üç ay önce konuşmamız gerekiyordu," dedi Priya. "Ama şimdi de iyi."

Ekip haftaların ilk toplantısı için ilk kez bir tahtanın etrafında toplandı.

**Açık Park Yeri Sorunu**

Yirmi bin araçlık devasa bir kamu otoparkı hayal edin. Her araç istediği yere park edebilir. Bölgeler arasında hiçbir bariyer yok, hiçbir kapı yok, hiçbir ayrılmış bölüm yok.

Bu, açık bir ağdır. Her hizmet, diğer her hizmete ulaşabilir. Web sunucunuz veritabanınızla konuşabilir, veritabanınız internete ulaşabilir, önbellek katmanınız her yerden bağlantılar alabilir.

Her şeyin her şeyle konuşabildiği zaman, bir ihlal her şeyi etkiler.

"Yani biri otoparkta hırsızlık yaparsa," dedi Tom, "herhangi bir araca girebilir."

"Ve herhangi bir araçtan, her yere gidebilir," diye onayladı Priya. "Çitler, kilitli kapılar, bölgeler istiyoruz."

VPC, AWS'de bu bölgeleri oluşturmanın yolu.

**VPC Nedir?**

**Sanal Özel Bulut (VPC)**, kaynaklarınızın erişebileceği özel bir ağdır; kaynaklarınızın varsayılan olarak erişebileceği AWS bulutunun mantıksal olarak izole edilmiş bir bölümüdür.

Devasa kamu otoparkındaki bir özel, çitli avluya benziyor. Avlunuzun kendi kuralları vardır: kimin girebileceği, kimin çıkabileceği, bölümler arasındaki rotalar nelerdir.

Bir VPC oluşturduğunuzda, şunları tanımlarsınız:

**Bir CIDR bloğu:** Ağınızdaki kullanılabilir IP adreslerinin aralığı. Örneğin, `10.0.0.0/16` size 65.536 olası IP adresi verir (10.0.0.0 ila 10.0.255.255).

**Alt ağlar:** Her biri bir IP adresi aralığının bir bölümüne ve belirli bir Erişilebilirlik Bölgesine atanan VPC'nizin bölümleri.

**Yol tabloları:** Ağ trafiğinin nereye gideceğine dair kurallar.

**İnternet Geçidi:** VPC'nizi kamu internetine bağlayan bağlantı.

**Kamu ve Özel Alt Ağlar**

Tüm kaynaklar kamuya açık olmamalıdır.

Web sunucunuzun internetten trafik alabilmesi gerekir - kullanıcıların tarayıcıları onunla iletişim kurabilmelidir.

Veritabanınızın asla internetten trafik almaması gerekir - yalnızca web sunucunuzun onunla iletişim kurabilmesi gerekir.

Bu, alt ağlara gelir.

Bir **kamu alt ağı**, bir İnternet Geçidine bağlıdır ve kamu IP adreslerine sahip kaynaklara sahip olabilir. Trafik internete ve internetten gelebilir.

Bir **özel alt ağ**, doğrudan bir internet bağlantısına sahip değildir. Özel alt ağdaki kaynaklar, VPC içindeki diğer kaynaklarla iletişim kuramaz (özellikle dış çıkış rotalarını ayarlamadığınız sürece). Özel alt ağlarda kamu IP adresleri yoktur.

Nimbus için tasarım açık hale geldi:

```
Internet
    |
Internet Gateway
    |
Public Subnet (AZ-a)     Public Subnet (AZ-b)
  [Load Balancer]          [Load Balancer]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [EC2 Instances]           [EC2 Instances]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [RDS Primary]             [RDS Standby]
  [ElastiCache]             [ElastiCache]
```

The load balancer, public-yüzeyli — internet’den trafik alması gerekiyor. EC2 örnekleri, özel — yalnızca load balancer’dan gelen trafiği alıyor. Veritabanları özel — yalnızca EC2 örneklerinden gelen trafiği alıyor.

“Bunu yapmak için,” Tom dedi, “birisi load balancer’dan geçmeli, ardından EC2 örneğinden ve ardından veritabanı güvenlik grubundan geçmeli mi?”

“Üç katman,” Priya doğruladı. “Derin savunma.”

**NAT Geçidi: Hala Şeyleri İndirebilen Özel Alt Ağlar**

Özel alt ağlar internete erişemez. Ancak bazen ihtiyaç duyarlar. EC2 örneğinizin yazılım güncellemesini indirmesi gerekiyor. Uygulamanız harici bir API’ye başvurması gerekiyor.

Bu, **NAT Geçidi** (Ağ Adresi Çevirisi) ile oluyor.

NAT Geçidi, bir kamu alt ağında bulunur. Özel alt ağlardaki kaynaklar, internete iletmek için NAT Geçidine dış seyrfettik trafiği gönderir, ancak internet bu bağlantıları başlatamaz.

Bir dönen kapı gibi. Çıkış yapabilirsiniz. Dışarıdan kimse giremez.

“NAT Geçidi ne kadar maliyetli?” Tom sordu.

Sorunun kimsenin şaşırması pek mümkün değildi.

NAT Geçidi fiyatlandırması iki bileşene sahiptir: her NAT Geçidi için saatlik ücret ve veri işleme ücreti (GB başına). Bu, beklenmedik bir şekilde artabilir (30. Bölümde ayrıntılı olarak ele alınır). Şu anda: ihtiyacınız olan kadar NAT Geçidi kullanmayın ve büyük miktarda dış seyrfettik verinin fatura hesabınıza yansıyabileceğini unutmayın.

**Yönlendirme Tabloları: Trafiğin Yolu Bulması**

Her alt ağın bir **yönlendirme tablosu** vardır ve trafiğin nereye gitmesi gerektiğini söyler.

Tipik bir kamu alt ağ yönlendirme tablosu şuna benzer:

| Hedef | Hedef                      |
|-------------|-----------------------------|
| 10.0.0.0/16 | yerel                       |
| 0.0.0.0/0   | igw-xxxx (İnternet Geçidi) |

İlk kural: herhangi bir IP adresine yönelik trafik yerel kalır. İkinci kural: tüm diğer trafik (`0.0.0.0/0` "her şey" anlamına gelir) İnternet Geçidine gider.

Bir özel alt ağ yönlendirme tablosu:

| Hedef | Hedef                 |
|-------------|------------------------|
| 10.0.0.0/16 | yerel                  |
| 0.0.0.0/0   | nat-xxxx (NAT Geçidi) |

Özel alt ağ trafiği yerel kalır veya NAT Geçidi üzerinden çıkış yapar. İnternet Geçidine doğrudan bir rota yoktur.

**Güvenlik Grupları vs NACL'ler (Önizleme)**

VPC içinde, kaynak düzeyinde trafiği kontrol etmek için iki araçınız vardır:

**Güvenlik Grupları** (15. Bölümde ayrıntılı olarak ele alınır), bireysel kaynaklar için sanal güvenlik duvarları olarak işlev görür — bir EC2 örneği, bir RDS örneği, bir yük dengeleyici. Durum bilgisiyle birlikte gelirler: trafik izin veriliyorsa, yanıt trafik de otomatik olarak izin verilir.

**Ağ Erişim Kontrol Listeleri (NACL'ler)** alt ağ düzeyinde çalışır ve *durum bilgisiyle çalışmaz*. Hem gelen hem de giden trafiğin ayrı ayrı izin verilmesi gerekir.

Çoğu kullanım durumu için Güvenlik Grupları yeterlidir. NACL'ler, alt ağ düzeyinde kontroller gerektiğinde ek bir katman sağlar — örneğin, belirli bir IP aralığının asla bir alt ağa ulaşmasını engellemek.

“Örnek düzeyinde güvenlik grupları,” Leo, tahtada yazdı. “Alt ağ düzeyinde NACL'ler.”

“Ve port 22’yi 0.0.0.0/0’a asla açık bırakmayın,” Priya, Leo’ya bakarak ekledi.

“Bir zaman oldu,” Leo dedi.

“Her zaman tam olarak bir zaman olur,” Priya dedi, “ama değil.”

**VPC Peering: Özel Ağları Bağlama**

Nimbus birden çok VPC’ye nasıl büyüyecek? (Bu oluyor. Takımlar büyüyor, hizmetler ayrı hesaplara yalıtılıyor.)

**VPC Peering**, iki VPC’nin aynı ağdaki gibi özel olarak iletişim kurmasını sağlar. Trafik AWS’nin özel ağından geçmez.

Önemli sınırlar:

- VPC peiriing geçişli değildir. VPC A, VPC B ile peiriing yapıyorsa ve VPC B, VPC C ile peiriing yapıyorsa, A ve C arasında iletişim kuramaz — bu durumda A-C arasında doğrudan bir peiriing eklemeniz gerekir.
- Peiriing alt ağ blokları arasında örtüşemez.

Daha büyük mimarilerde çok sayıda VPC için, **AWS Transit Gateway** (25. Bölümde ele alınır) geçişli yönlendirme sağlamak için tam bir peiriing bağlantısı ağına ihtiyaç duymadan.

## Güçlü Yönler ve Sınırlamalar

**Neden VPC Tasarımı Önemlidir**:

- Ağ yalıtımı, derin savunma — bir katmanı ihlal etmek her şeyi tehlikeye atmaz.
- Özel alt ağlar saldırı yüzeyini önemli ölçüde azaltır.
- Yönlendirme tabloları ve güvenlik grupları, trafiğin akışları üzerinde hassas kontrol sağlar.
- VPC’ler, Direct Connect, VPN, Transit Gateway gibi her AWS ağ hizmetiyle entegre olur.

**Karmaşık Olduğu Yerler**:

- VPC tasarımı, önceden planlama gerektirir — CIDR blokları daha sonra değiştirilmesi zor olabilir.
- Çok sayıda küçük VPC, peiriing karmaşıklığı yaratır (n-kare problemi).
- VPC’lerdeki ağ sorunlarını gidermek, yönlendirme tabloları, güvenlik grupları, NACL’ler ve alt ağ bağlantıları hakkındaki anlayışınızı aynı anda anlamayı gerektirir.
- NAT Geçidi maliyetleri ölçeklendiğinde şaşırtıcı olabilir (GB başına veri işleme ücretleri).

## Özet

- **VPC** (Uygulamalı İzole Özel Ağ) — AWS’de, duvarları olan kendi alanınızdır.
- **Alt Ağlar** (Alt Ağlar), Availability Bölgesi içinde VPC’nizi bölmenizi sağlar. Kamu alt ağları İnternet Geçidi ile bağlantı kurar; özel alt ağlar bunu yapmaz.
- İnternet erişimi olan kaynakları (Yük Dengeleyiciler) kamu alt ağlara yerleştirin. Her şeyi (EC2, veritabanları, önbellekler) özel alt ağlara yerleştirin.
- **Yol Tabloları** (Yol Tabloları), trafiğin nereye akacağını kontrol eder. Her alt ağda bir tane bulunur.
- **NAT Geçidi** (Kamu Alt Ağda), özel kaynakların internete çıkış bağlantılarını kabul etmeden başlatabilmesini sağlar.
- **VPC Bağlantısı** (VPC Bağlantısı), iki VPC’yi özel olarak birbirine bağlar. Geçişli değildir — büyük ölçekli bağlantı için Transit Geçidi kullanın.
- **Güvenlik Grupları** (Güvenlik Grupları), bireysel kaynakları (durum bilgisi olan) korur. **Alt Ağ Güvenlik Duvarları** (Alt Ağ Güvenlik Duvarları), tüm alt ağları (durumsuz) korur.

## Sınav İpuçları

*SAA-C03 Alanı: Güvenli Mimari Tasarımı (Alan 1, Görev 1.2)*

- **Kamu vs Özel Alt Ağ**: Fark, yol tablosundadır. Kamu alt ağda İnternet Geçidine bir rota bulunur. Özel alt ağda bulunmaz.
- **NAT Geçidi Yerleşimi**: Her zaman *kamuya* ait alt ağda. Özel alt ağ kaynakları, dışarıya giden trafiği ona yönlendirir.
- **NAT’in Yüksek Erişilebilirliği**: Her AZ’de bir NAT Geçidi oluşturun. AZ-a ve AZ-b’deki örnekler NAT Geçidine yönlendiriliyorsa, AZ-a’nın başarısızlığı AZ-b’nin internet erişimini de etkiler.
- **VPC Bağlantısı Geçişli Değildir**: Sınav, üç VPC’yi tanımlayacak ve bunların ortasından birbirine bağlanıp bağlanamayacağını soracaktır — cevap, doğrudan bağlantı veya Transit Geçidi olmadan hayır olacaktır.
- **CIDR Kesişimi**: Bağlantılı VPC’ler aynı CIDR bloklarını kullanamaz. Klasik sınav tuzağı.
- **Bastion Sunucusu (Zıplama Kutusu)**: Özel bir EC2 örneğine SSH ile bağlanmak için kamu alt ağda bir bastion sunucusuna ihtiyacınız vardır. Bastion, yalnızca kamu IP’ye sahip olan tek makinedir; özel örnekler yalnızca bastion’un güvenlik grubundan SSH trafiğine izin verir.
- **VPC Uç Noktaları**: Özel kaynakların S3, DynamoDB gibi AWS hizmetlerine NAT Geçidi aracılığıyla gitmeden erişmesini sağlar. İki türü vardır: **Uç Nokta Geçidi Uç Noktaları** (S3, DynamoDB — ücretsiz) ve **Arayüz Uç Noktaları** (diğer hizmetler — saat başına fiyatlandırılır artı veri).

## Uygulama Alıştırmaları

**Uygulama 1 — Hatırlama**

Bir veritabanının özel bir alt ağda neden bulunması gerektiğini açıklayın. Bu, hangi özel tehdidi ortadan kaldırır?

*(İpucu: Birinin kamu internetine sahip bir veritabanı ile bir veritabanı yalnızca VPC içinden erişilebilen bir veritabanı arasında ne yapabileceğini ve ne yapamayacağını ne olur?)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, AWS’de üç katmanlı bir web uygulaması tasarlamaktadır. Web katmanı (ALB + EC2) internet trafiğini kabul etmelidir. Uygulama katmanı (EC2) yalnızca web katmanından trafiği almalıdır. Veritabanı katmanı (RDS) yalnızca uygulama katmanından trafiği almalıdır. Uygulama katmanı EC2 örnekleri internetten yazılım paketlerini indirmelidir. Çözüm, yüksek kullanılabilirlik gerektirir.

Bu gereksinimleri en iyi karşılayan mimari hangisidir?

A) Tüm katmanlar kamu alt ağlarda; güvenlik grupları katmanlar arasında trafiği kısıtlar
B) Web katmanı kamu alt ağlarda; uygulama ve veritabanı katmanları özel alt ağlarda; bir NAT Geçidi kamu alt ağda
C) Web katmanı kamu alt ağlarda; uygulama ve veritabanı katmanları özel alt ağlarda; bir NAT Geçidi AZ başına bir tane
D) Tüm katmanlar özel alt ağlarda; bir İnternet Geçidi tüm katmanlara çift yönlü internet erişimi sağlar

**İpucu 1**: "Yüksek kullanılabilirlik" tek bir arıza noktası anlamına gelir. NAT Geçidinin AZ’si başarısız olduğunda hangi örnekler internet erişimini kaybeder?

**İpucu 2**: NAT Geçidinin AZ’si başarısız olduğunda hangi örnekler internet erişimini kaybeder?

**İpucu 3**: Gereksinimi dikkatlice okuyun — uygulama katmanı *çıkış* internet erişimine ihtiyaç duyar, *giriş* erişimine değil.

**Cevap**: C

**Açıklama**: Web katmanı kamu alt ağlarda internet erişimi için ALB aracılığıyla sağlar. Uygulama ve veritabanı katmanları özel alt ağlarda, internete doğrudan erişmelerini önler. AZ başına bir NAT Geçidi (her kamu alt ağda bir tane) özel alt ağ örnekleri için yüksek kullanılabilirlik çıkış internet erişimi sağlar — bir AZ başarısız olduğunda, diğer AZ’deki NAT Geçidi trafiği hizmetine devam eder.

**A) Yanlış çünkü** kamu alt ağlarda tüm katmanlar internete doğrudan erişim sağlar, bu da katmanlı güvenlik modelinin amacını baltalar.

**B) Yanlış çünkü** AZ başına bir NAT Geçidi tek bir arıza noktasıdır. Bu AZ’deki NAT Geçidinin başarısız olması tüm özel örneklerin çıkış internet erişimini kaybedecektir.

**D) Yanlış çünkü** bir İnternet Geçidi çift yönlü bağlantı sağlar — İnternet Geçidine bir rota olan özel alt ağlar, etkili bir şekilde kamu alt ağlardır.

*SAA-C03 Alanı: Güvenli Mimari Tasarımı — Görev 1.2*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus büyüyor. Mühendislik ekibi, Nimbus ana uygulamasını ayrı bir hesapta ve VPC’de tutarken, "menü hizmeti" için ayrı bir hesap ve VPC oluşturmak istiyor.

How would you connect these two VPCs so the main application can query the menu service? Hangi kısıtlamaları göz önünde bulundurmanız gerekir? Nimbus'un on ayrı mikroservis VPC'si varsa bunun yerine ne kullanırdınız?

*(Tek bir doğru cevap yoktur. Amaç, çoklu VPC ağ tasarımı pratik yapmaktır.)*

## Kredilerden Sonraki Sahne

Priya ağın tasarımını yeniden düzenledi.

Üç gün sonra, her kaynak doğru yerinde yerleştirilmişti. EC2 örnekleri özel alt ağlarda, yük dengeleyiciler ise kamu alt ağlarında. RDS ve ElastiCache yalnızca uygulama katmanından erişilebiliyordu. En az gerekli portlara sahip güvenlik grupları kullanılıyordu.

Leo, veritabanına doğrudan SSH ile bağlanmaya çalıştı bir şey kontrol etmek için. Başarısız oldu, bağlantı zaman aşımına uğradı.

"İyi," dedi Priya.

"Sadece bir şeyi kontrol etmem gerekiyordu," dedi Leo.

"Ne?"

"İndeksin doğru şekilde ayarlanıp ayarlanmadığını."

Priya laptop'unu açtı. "Bastion ana bilgisayarı üzerinden, uygulama örneği aracılığıyla doğru veritabanı kimlik bilgilerini Secrets Manager'dan alarak kontrol edebilirim."

"Bu dört atış."

"Doğru." Bir şeyler yazdı. "İndeks ayarlandı. Görüşteyim."

Leo bir an ekranda baktı.

"Bunu öğreneceğim," dedi.

"Zaten öğreniyorsun," dedi. "Sadece güvenlik kontrolleri hakkında şikayet etmeye çalıştın, yokluklarını şikayet etmek yerine."

Sonraki bölümde: internetin Nimbus'u nasıl bulduğu – görünmez alan adı makinelerinin mekanizması.
