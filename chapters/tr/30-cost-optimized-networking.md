# Bölüm 30: Gizli Maliyet

Tom'un toplantı odasında üç sütunlu bir beyaz tahtası vardı: hesaplama, depolama, ağ. İlk ikisi doldurulmuştu — sayılar, tarihler, tamamlanan optimizasyonların adları. Üçüncü sütuna bir şey yazmadan önce bir an tahtanın başında durdu. AWS faturasındaki ağ satırları, diğerlerinde olmayan bir şekilde sayfaya dağılmıştı. Her birinin farklı bir adı, farklı bir birimi, paranın neden gittiğine dair farklı bir gerekçesi vardı.

Kalemin kapağını açtı.

**Özet: Faturadaki Son Bilinmeyen**

Veritabanı denetimi, Tom'un üzerinde aktif olarak çalıştığı son büyük satır öğesini kapatmıştı — ayda 491 $ geri kazanıldı, yılda 5.892 $. EC2 Savings Plans, S3 yaşam döngüsü politikaları ve depolama temizliğini de ekleyince, üç aylık çalışmanın toplam yıllık tasarrufu 34.092 $ idi. Ancak Tom, veritabanına derinlemesine dalış sırasında, bir kategorinin neredeyse hiç incelenmediğini fark etmişti. Depolama maliyetleri tek bir satır olarak görünüyordu: "S3: 198 $." Hesaplama maliyetleri tek bir satır olarak görünüyordu: "EC2: 2.340 $" — Bölüm 27'deki Savings Plan indirimleri devreye girmeden önce. Ağ maliyetleri ise "Çıkış Veri Transferi", "NAT Gateway İşleme", "VPC Peering Veri Transferi" ve "CloudFront Veri Transferi" gibi adlarla bir düzine girdiye dağılmıştı. Bunları hiç toplayıp toplamına bakmamıştı. Bugünün işi buydu.

Tom faturayı açtı. Veri transferi bölümünü buldu. Tüm satır öğelerini topladı.

AWS'deki ağ maliyetleri bir şehrin geçiş ücreti sistemi gibidir: şehre girmek ücretsizdir, ama dışarı çıkmak için kullandığınız her tünel para tutar ve mahalleler arası gidip gelmek de biraz tutar. Çoğu insan ay sonunda fatura gelene ve aslında baştan beri ücretsiz bir yüzey yolu varken her gün tüneli kullandığını fark edene kadar geçiş ücretlerini düşünmez. Bu bölümün amacı her bir geçiş gişesini anlamak — ve hangilerine ödeme yapmaya değdiğine karar vermektir.

847 $/ay.

"Veri transferine ayda 847 $ harcıyoruz," dedi.

"Bu çok mu?" diye sordu Leo.

"S3 faturamız optimize edilmeden önce tam olarak ne kadarsa o kadar. Ve bu büyüklükte bir veri transferi faturamız olduğunu bile bilmiyordum."

Maya başını kaldırıp baktı. "Veri transferi tam olarak nedir?"

"AWS'nin baytları bir yerden bir yere taşımak için ücretlendirdiği şey. AWS'ye giren baytlar: genellikle ücretsiz. AWS'den internete çıkan baytlar: ücretli. Farklı bölgelerdeki hizmetler arasında giden baytlar: ücretli. Bir NAT Gateway'den geçen baytlar: ücretli."

"Bunu detaylandırabilir misin?"

Tom detaylandırabilirdi. Ama bu sefer fatura konsolunda durmadı. Tüm VPC'lerinde VPC Flow Logs'u etkinleştirdi ve bunları CloudWatch Logs Insights'a besledi. Bu, gerçek trafik akışlarını sorgulamasını sağladı — sadece dolar tutarlarını değil, hangi kaynakların nereye veri gönderdiğini ve ne kadar gönderdiğini.

Sorgunun çalışması iki dakika sürdü. Kısa süre sonra çekeceği bir başka günlük kaynağıyla birleştiğinde, çıktı harekete geçmek için yeterince spesifikti.

**Trafik Analizi: Faturayı Asıl Üreten Ne**

Hacme göre ilk beş trafik akışı, sırayla:

1. EC2 uygulama sunucuları → NAT Gateway → AWS hizmetleri (SSM, Secrets Manager, CloudWatch, SQS): aylık 3,9 TB
2. EC2 uygulama sunucuları → NAT Gateway → harici API'ler: aylık 1,3 TB
3. Aurora okuyucu uç noktası → EC2 uygulama sunucuları (AZ'ler arası): aylık 0,4 TB
4. Analitik veri hattı → us-east-1'deki S3 paketi (bölgeler arası): aylık 0,3 TB
5. CloudFront → S3 origin (önbellek kaçırmaları): aylık 0,2 TB

İlk dördü doğrudan Flow Logs'tan geldi. Beşincisi gelemezdi: VPC Flow Logs yalnızca VPC'lerinizdeki ağ arayüzlerinden geçen trafiği görür ve S3'ten veri çeken bir CloudFront önbellek kaçırması VPC'ye hiç dokunmaz — bu, CloudFront'un doğrudan S3 ile konuşmasıdır. O akış için Tom, CloudFront'un standart erişim günlüklerini çekti ve `x-edge-result-type` alanına göre filtreledi: `Miss` olarak işaretlenmiş her girdi, CloudFront'un origin'den çekmek zorunda kaldığı bir istektir ve baytları toplamak ona 0,2 TB'yi verdi. Tek fatura, iki enstrüman — her biri diğerinin gördüğüne kör.

"Dört numaralı akış," dedi Priya. "Analitik veri hattımız neden us-east-1'deki bir paketle konuşuyor?"

Leo'nun yüzünde Tom'un tanıdığı bir ifade vardı.

"Onu zaten dağıtmıştım — ah," dedi Leo. "Altı ay önce analitik veri hattımızın paralel olarak birden fazla bölgeye yayılıp yayılamayacağını test ediyordum. us-east-1'de bir test paketi oluşturdum, veri hattını ona yönlendirdim ve bir hafta çalıştırdım. Test bitti ama veri hattı yapılandırmasından us-east-1 hedefini kaldırmayı unuttum."

"Yani beş aydır," dedi Tom, "her analitik sonucunun bir kopyasını Virginia'daki bir pakete yazıyormuşuz."

"Bu ayda ne kadar tutuyor?" diye sordu Tom.

us-west-2'den us-east-1'e bölgeler arası transfer: 0,02 $/GB. Aylık 300 GB = transfer için ayda 6 $. Ayrıca us-east-1'deki yinelenen veri için S3 depolaması: 300 GB × 5 ay × 0,023 $/GB = depolanan veride 34,50 $.

"Çok büyük değil," dedi Leo.

"Aylık olarak çok büyük değil," dedi Tom. "Ama beş aydır çalışıyor ve kimse bilmiyordu. Bu kasıtsız bir maliyet. Soru 6 $'ın önemli olup olmadığı değil — her doların neden harcandığını bilip bilmediğimiz."

Leo us-east-1 test paketini sildi ve veri hattı yapılandırmasından hedefi kaldırdı.

Flow log çıktısındaki en eyleme dönük bulgu, bir numaralı akıştı: EC2 uygulama sunucularının NAT Gateway üzerinden AWS hizmetlerini çağırması.

Tom, CloudWatch Logs Insights sorgusu için belirli günlük girdilerini çekti, yalnızca AWS hizmet IP aralıklarına yönelik trafiği gösterecek şekilde filtreledi:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Çıktı beklemediği bir şey gösterdi: aylık yaklaşık 300 GB aynı bölge içi S3 trafiği — Leo'nun us-east-1 paketine giden bölgeler arası akıştan ayrı olarak — NAT Gateway üzerinden geçiyordu. Ama Tom aylar önce S3 Gateway Endpoint'lerini zaten yapılandırmıştı.

"Bir S3 Gateway Endpoint'imiz var," dedi Leo. "S3 trafiği neden hâlâ NAT üzerinden gidiyor?"

Tom rota tablosuna baktı. Gateway Endpoint yapılandırılmıştı — ama yalnızca uygulama VPC'si için. Analitik veri hattı, dokuz ay önce veri izolasyonu için oluşturulmuş ayrı bir VPC'de çalışıyordu. O VPC'nin S3 Gateway Endpoint'i yoktu. Analitik veri hattının EC2 örneklerinden gelen her S3 çağrısı, o VPC'nin NAT Gateway'i üzerinden yönlendiriliyordu.

"0,3 TB analitik veri hattı trafiği × 0,045 $/GB = ayda 13,50 $," dedi Tom. "Sadece ikinci VPC'deki eksik uç noktadan dolayı."

"Uç noktayı eklemek ne kadar tutar?" diye sordu Leo.

"Sıfır," dedi Tom. "S3 Gateway Endpoint'leri ücretsizdir. Bir rota tablosu girdisidir."

Gateway Endpoint'i analitik VPC'sine eklemek dört dakika sürecek ve aylık NAT Gateway ücretinden 13,50 $ kırpacaktı — küçük bir mutlak sayı, ama bulgu ilkeyle ilgiliydi. Bir VPC'ye bir maliyet kontrolü eklemişler ve ikinci VPC'yi oluşturduklarında bunu çoğaltmayı unutmuşlardı. Tutarlılık yalnızca bilgi değil, süreç gerektiriyordu.

Tom dağıtım kontrol listesine ekledi: yeni bir VPC oluştururken, herhangi bir iş yükü eklemeden önce S3 ve DynamoDB Gateway Endpoint'lerini ekle.

Flow log'lardan gelen ikinci spesifik bulgu daha pahalıydı. Sipariş bildirim sistemini çalıştıran Lambda fonksiyonlarından gelen trafik — restoran yapılandırma dosyalarını okumak için S3 erişimi — S3 uç noktası yerine NAT Gateway üzerinden gidiyordu. Lambda fonksiyonları VPC içinde çalışıyordu (RDS erişimi için) ve VPC'nin S3 uç noktası yalnızca uygulama alt ağındaki EC2 örnekleri için yapılandırılmıştı. Lambda alt ağındaki Lambda fonksiyonları NAT üzerinden yönlendiriliyordu.

"Dur — ama *neden* öyle yapalım ki?" diye sordu Maya. "Uç noktamız var. Lambda neden onu kullanmıyor?"

"VPC Gateway Endpoint'leri, rota tablolarına göre alt ağ başına uygulanır," dedi Tom. "Lambda fonksiyonları kendi rota tablolarına sahip kendi alt ağlarında. O rota tablosunda uç nokta rotası yoktu. Onu uygulama alt ağı için ekledim. Lambda alt ağını kaçırdım."

S3 uç nokta rotasını Lambda alt ağı rota tablosuna eklemek, ücretsiz olması gereken S3 çağrıları için ücretlendirilen NAT Gateway işleme ücretlerinde ayda 41 $ daha tasarruf sağlayacaktı.

Flow log analizi kendini amorti etmişti. Üç saatlik sorgu süresi, üç somut bulgu: unutulan analitik VPC uç noktası (ayda 13,50 $), Lambda alt ağı yönlendirme açığı (ayda 41 $) ve Interface Endpoint kararlarının temeli olan asıl büyük bulgu. Flow log analiziyle belirlenen toplam ek aylık tasarruf: ayda 54,50 $, analizin zaten ortaya çıkardığı Interface Endpoint'lerden gelen 78 $'ın üstüne. Bu iki küçük düzeltme bir sonraki sprint için backlog'a alındı; bu bölümün sonundaki tasarruf tablosu yalnızca devreye girenleri sayar.

"Ders şu ki VPC uç noktaları tek seferlik bir yapılandırma değildir," dedi Tom. "Her yeni VPC, her yeni alt ağ, her yeni iş yükü türü aynı kontrolü gerektirir. Özel bir alt ağdaki herhangi bir şey için varsayılan, NAT üzerinden yönlendirmektir. Kontrol şudur: bu iş yükü S3, DynamoDB ya da yüksek trafikli AWS hizmetlerinden herhangi birini çağırıyor mu? Eğer evetse, bir uç nokta rotası var mı?"

"Bu kontrolü otomatikleştirmeyi düşündük mü?" diye sordu Priya. "Özel bir alt ağ S3 uç nokta rotası olmadan oluşturulduğunda uyarı veren bir AWS Config kuralı?"

"Listede," dedi Tom. "Sahipsiz birim uyarısının hemen ardında."


Ve böylece Tom, analizi başlatan soruya cevabını bulmuştu. Ağ maliyetleri tek bir sorun değildi. Her birinin farklı bir çözümü olan beş farklı sorundu.

**AWS Veri Transferini Nasıl Ücretlendirir**

AWS'nin veri transferi fiyatlandırması asimetriktir:

**AWS'ye (giriş)**: Ücretsiz. İstediğiniz kadar veri yükleyebilirsiniz.

**AWS'den internete (çıkış)**: Ücretli. İlk 100 GB/ay ücretsizdir. Bundan sonra:

- İlk 10 TB/ay için 0,09 $/GB (ABD bölgeleri)
- Sonraki 40 TB için 0,085 $/GB
- Daha yüksek hacimlerde daha düşük

**Aynı Erişilebilirlik Bölgesi içinde**: Ücretsiz. Aynı AZ'de birbiriyle konuşan EC2 örnekleri hiçbir ücret ödemez.

**Erişilebilirlik Bölgeleri arasında (aynı bölge)**: Her yönde 0,01 $/GB. Küçük ama gerçek bir maliyet.

**Bölgeler arasında**: Bölgelere bağlı olarak 0,02-0,08 $/GB. Bölgeler arası trafik önemli ölçüde daha pahalıdır.

**NAT Gateway**: İşlenen her GB için 0,045 $. Özel EC2 örneğinizin internete ulaşmak için NAT Gateway üzerinden gönderdiği her bayt — ve geri gelen her bayt — ücretlendirilir.

**CloudFront**: Doğrudan AWS-internet'e göre daha düşük veri transferi oranları. İlk 10 TB için 0,085 $/GB (doğrudan çıkış veri transferinden biraz daha az). CloudFront, kenar önbelleklemesi origin'in daha az sıklıkta veri sunması anlamına geldiği için genellikle toplam transfer maliyetlerini azaltır.

**Tom'un Analizi**

Tom her bir satır öğesi için sırayla "Bu ayda ne kadar tutuyor?" diye sordu. Bunları elektronik tabloda ayrı bir sekmeye ekledi — aylık toplam değil, her kategoriyi ayrı ayrı. Toplam, faturanın hangi kısmının hangi tür maliyet olduğunu anlamaktan daha az faydalıydı.

Her satır öğesini kategorize ettikten sonra:

**İnternete çıkış verisi**: 214 $/ay

- Dünya genelindeki müşterilere API yanıtları
- CloudFront'u atlayarak hâlâ doğrudan S3'ten ve ALB'den istemcilere sunulan varlıklar (önbellek doldurmalarının kendisi — CloudFront'un bir AWS origin'inden veri çekmesi — ücretsizdir: AWS origin-to-CloudFront transferinden feragat eder)

**NAT Gateway işleme**: 289 $/ay

- Harici API'leri çağıran uygulama sunucuları (ödeme işlemcisi, e-posta hizmeti, harita verileri)
- NAT Gateway üzerinden giden DynamoDB çağrıları (bazı tablolar için VPC uç noktaları kurulmadan önce)

**AZ'ler arası veri transferi**: 178 $/ay

- Yük dengeleyiciden EC2 örneklerine (yük dengeleyici bir AZ'de, bazı örnekler başka bir AZ'de)
- Uygulama sunucusundan RDS okuma replikasına (farklı bir AZ'de)

**Bölgeler arası veri transferi**: 166 $/ay

- Aurora Global Database replikasyonu (birincil us-west-2'de, okuyucu us-east-1'de)
- Yedeklemeler için S3 Cross-Region Replication
- Leo'nun unutulan test veri hattı (bu toplamın 6 $'ı)

**NAT Gateway: En Büyük Sürpriz**

NAT Gateway işleme ücretlerindeki 289 $/ay en büyük öğeydi. Ve VPC Flow Log analizi bunu spesifik hale getirmişti: en büyük tüketici, NAT Gateway üzerinden AWS hizmet API'lerini (SSM, Secrets Manager, CloudWatch Logs) çağıran uygulama sunucularıydı.

Bölüm 11'de Tom, S3 ve DynamoDB için VPC Gateway Endpoint'lerini kurmuştu. Bunlar ücretsizdi. Ama diğer birkaç hizmet için Interface Endpoint'leri kurmayı kaçırmıştı:

- Yama yönetimi için Systems Manager (SSM)
- Kimlik bilgisi alımı için Secrets Manager
- Metrik ve günlük gönderimi için CloudWatch
- Mesaj çekme için SQS

Özel EC2 örneklerinden bu hizmetlere yapılan her çağrı NAT Gateway üzerinden gidiyordu. Her çağrı 0,045 $/GB ücretlendiriliyordu.

Zaten AWS'nin ağı içindeyken NAT Gateway üzerinden geçen trafik için AWS'nin neden ücret aldığını merak ediyor olabilirsiniz. Cevap, NAT Gateway'in kendisinin yönetilen bir hizmet olmasıdır — çalıştırmanın maliyeti vardır ve AWS bu maliyeti gigabayt başına yansıtır. VPC Endpoint'leri aradaki aracıyı ortadan kaldırır, faturayı azaltmalarının nedeni budur.

"Dur — ama *neden* öyle yapalım ki?" diye sordu Maya, Tom sayıları gösterdiğinde. "S3 ve DynamoDB için Gateway Endpoint'leri kurduk. SSM ve CloudWatch için neden aynısını yapmadık?"

"Gateway Endpoint'leri yalnızca S3 ve DynamoDB için kullanılabilir," dedi Tom. "Diğer her şey için — SSM, Secrets Manager, SQS — Interface Endpoint'lere ihtiyacın var. Ücretsiz değiller, ama ürettiğimiz hacimde NAT üzerinden yönlendirmekten daha ucuzlar."

Bu hizmetler için **Interface Endpoint'ler**: AZ başına saatte 0,01 $ + işlenen GB başına 0,01 $.

Nimbus'un hacminde, SSM Interface Endpoint'i ayda yaklaşık 25 $ tutacaktı (saatlik ücretler artı GB başına işleme) ve NAT Gateway ücretlerinde ayda yaklaşık 45 $ tasarruf sağlayacaktı (çünkü SSM, yama yönetimi ve parametre deposu çağrıları için önemli miktarda veri hacmi üretir).

Uç nokta maliyetleri ve tasarrufları hizmete ve hacme göre değişiyordu. Tom, dört yüksek trafikli hizmet için Interface Endpoint'leri kurmanın — her biri iki AZ, artı taşıyacakları 3,9 TB üzerindeki 0,01 $/GB işleme — toplam ayda yaklaşık 97 $ tutacağını ve NAT Gateway işlemede yaklaşık 176 $/ay tasarruf sağlayacağını hesapladı.

Net tasarruf: yalnızca uç nokta kurulumundan ayda 78 $.

"Peki ya birisi içeri girmeye çalışırsa?" dedi Priya, VPC uç noktası konuşması uygulamaya döndüğünde. "VPC uç noktası, trafiğin halka açık internete hiç dokunmaması demek — bu yalnızca maliyet değil, tehdit yüzeyinin azaltılması. Bunu yalnızca güvenlik faydası için bile yapmalıydık."

"Katılıyorum," dedi Tom. "Maliyet tasarrufları bir bonus."

Leo NAT üzerinden yönlendirilen hizmetlerin listesine baktı. "CloudWatch günlükleme uç noktalarını, onun için bir VPC uç noktası olup olmadığını kontrol etmeden kurmuş olabilirim," dedi. "Şimdilik sorun olmaz — ama evet, bu altı aydır NAT üzerinden gidiyor."

"O listede," dedi Tom. "CloudWatch düzelttiğimiz dördünden biri."

**PrivateLink Hesabı: Ne Zaman Mantıklı**

Mimariler büyüdükçe ortaya çıkan bu konuşmanın daha karmaşık bir versiyonu var: diğer AWS müşterileri tarafından barındırılan hizmetlere (ya da diğer VPC'lerdeki kendi hizmetlerinize) özel bağlantı sağlamak için AWS PrivateLink kullanmak.

PrivateLink Interface Endpoint'leri, AZ başına saatte 0,01 $ artı 0,01 $/GB tutar. Uç nokta üzerinden aylık 1 TB trafik üreten bir hizmet için:

- PrivateLink maliyeti: 0,01 $ × 2 AZ × 730 saat + 0,01 $ × 1.000 GB = 14,60 $ + 10 $ = ayda 24,60 $
- Aynı trafiği bunun yerine mevcut NAT Gateway üzerinden yönlendirmek: 0,045 $ × 1.000 GB = ayda 45 $ ek işleme ücreti

Karşılaştırma *artımlı*, çünkü NAT Gateway her iki durumda da kalıyor — internete giden trafiğin geri kalanına hâlâ hizmet ediyor, dolayısıyla bu tek hizmet bir uç noktaya taşındığında saatlik maliyeti (0,045 $ × 2 × 730 = 65,70 $) ortadan kalkmıyor. Bu trafik hacmi için PrivateLink yaklaşık 20 $/ay tasarruf sağlar. Başabaş noktası kabaca aylık 420 GB'dir — bunun altında, uç noktanın kendi saatlik maliyeti, NAT işlemeye göre GB başına tasarrufu aşar.

"Dur — ama *neden* sadece bir VPN ya da peering yerine PrivateLink kullanalım?" diye sordu Maya.

"VPC Peering daha basittir ve bölge içi transferler için ücretsizdir," dedi Tom. "Ama peering, VPC'ler arasında tam yönlendirilmiş bir bağlantı oluşturur — VPC A'daki herhangi bir şey potansiyel olarak VPC B'deki herhangi bir şeye ulaşabilir. PrivateLink daha cerrahidir. Uç nokta, tam bir ağ rotasını değil, belirli bir hizmeti açar. Güvenlik bilinci olan mimariler için bu spesifiklik önemlidir."

"Peki ya birisi peer'lanmış bir VPC'ye girmeye çalışırsa?" diye sordu Priya. "Tam peering, bir VPC'deki ele geçirilmiş bir örneğin peer'lanmış VPC'deki her örneğe bir rotası olması demektir."

"İşte bu, üçüncü taraf bir hizmete ya da ayrı bir ekibin sahip olduğu bir hizmete bağlanırken peering yerine PrivateLink lehine olan argüman," dedi Tom. "Güvenilen şirket içi VPC'ler için peering. Minimum maruziyetli bağlantı istediğin her şey için PrivateLink."

**AZ'ler Arası Trafik: Mimari Bir Soru**

AZ'ler arası veri transferindeki 178 $/ay daha çetrefilliydi.

Bir kısmı kaçınılmazdı: yük dengeleyici trafiği AZ'ler arasında dağıtır, dolayısıyla bazı istekler bir AZ'de başlar ve yük dengeleyici bunları başka bir AZ'deki bir örneğe iletir.

Bir kısmı optimize edilebilirdi: uygulama, RDS birincisine (us-west-2a'da) yazacak ve okuma replikasından (us-west-2b'de) okuyacak şekilde yapılandırılmıştı. Her okuma sorgusu AZ sınırlarını aşıyordu.

Okumalar için bir çözüm: uygulamayı, talep eden örnekle aynı AZ'deki bir okuma replikasını tercih edecek şekilde yapılandırmak. Her AZ kendi okuma replikasını alır. Trafik yerel kalır.

Ödünleşim: daha fazla okuma replikası = daha fazla maliyet. AZ'ler arası trafik maliyeti ayda 50 $ ve ek bir okuma replikası ayda 190 $ tutuyorsa, AZ'ye yerel optimizasyon işe yaramaz.

Tom hesapladı: mevcut sorgu hacimlerinde, AZ'ler arası trafik 178 $'ın yalnızca 31 $'ıydı. Bunun için replika eklemeye değmezdi.

Diğer AZ'ler arası maliyetler, yük dengeleyici yönlendirmesi ve hizmetler arası iletişimdi — mevcut mimari düzeyde büyük ölçüde kaçınılmaz.

"Bu, maliyeti anlamanın onu düzeltmen gerektiği anlamına gelmediği durumlardan biri," dedi Tom.

"AZ'ler arası trafiği tamamen ortadan kaldırmak ne kadar tutar?" diye sordu Maya.

"Her şeyi tek bir AZ'de tutmak Multi-AZ'nin amacını boşa çıkarır. Bu, yüksek kullanılabilirliği kaybetme pahasına ayda 31 $ tasarruf demek."

"Yani bırakıyoruz," dedi.

"Bırakıyoruz."

**S3 Select: Sorgularda Veri Transferini Azaltma**

Analitik veri hattını incelerken Tom, analitik ekibinin büyük S3 dosyalarını nasıl sorguladığına özgü bir başka optimizasyon buldu.

Desen: her sabah bir analitik işi, restorana özgü sipariş verilerini bellek içinde filtrelemek için S3'ten 500 MB'lık bir Parquet dosyası indiriyordu. Dosyanın kabaca %95'i indirildikten sonra atılıyordu.

**S3 Select**, tüm dosyayı uygulamanızda filtrelemek için indirmek yerine, bir S3 nesnesinden (CSV, JSON, Parquet) yalnızca ihtiyacınız olan satırları ve sütunları almanızı sağlar.

> **Önemli güncelleme**: 2024 ortasında AWS, S3 Select'i yeni müşterilere sunmayı durdurdu — mevcut kullanıcılar onu korur, ama yeni mimariler için bir çıkmaz sokaktır. Bu bölümün öğrettiği ilke (depolama katmanında filtrele, tüm dosyayı taşıma) zamandan bağımsızdır; bunun için modern araç **Amazon Athena**'dır (doğrudan S3 üzerinde SQL, S3 Select'in asla sahip olmadığı join'ler ve toplamalar dahil). Bir zamanlar diğer alternatif olan **S3 Object Lambda**, S3 Select'in ardından eski statüsüne geçti: 7 Kasım 2025 itibarıyla o da yeni müşterilere kapalı (mevcut iş yükleri çalışmaya devam ediyor). Güncel bir sınavda "S3 üzerinde veriyi yerinde sorgula" Athena'yı işaret eder. Aşağıdaki hikâye korunuyor çünkü *muhakeme* — önce ölç, filtreyi veriye taşı — asıl ders.

S3 Select olmadan:
```python
# 500 MB dosya indir, bellekte işle
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

S3 Select ile:
```python
# Önce S3 filtrelesin, yalnızca eşleşen satırları aktar (500 MB yerine ~2 MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select, S3'ten uygulamanıza taşınan veriyi azaltır. Seçici sorgular içeren büyük dosyalar için bu, veri hacminde 10-100 katlık bir azalma olabilir — ve analitik örneği paketle aynı bölgede çalıştığından, kazanç bir transfer faturası değildir (aynı bölge içi S3-to-EC2 transferi ücretsizdir): hemen attığınız veriyi indirmek ve filtrelemek için harcanan hesaplama, bellek ve zamandır.

Tom bunu analitik ekibine açtı. İlk başta direndiler.

"Pandas yazmayı zaten biliyoruz," dedi bir analist.

"Bu pandas'la ilgili değil," dedi Tom. "2 MB veri almak için 500 MB indirmenizle ilgili. İndirmenin kendisi ücretsiz — aynı bölge — ama örnek değil. Bunu her restoran için çalıştırıyorsunuz: 287 restoran, 287 sorgu, her gece 140 GB çekilip pandas'ta filtreleniyor. Analitik kutusunu iki saat meşgul tutan bu — ve bir xlarge olmasının nedeni de bu."

"Peki ya S3 Select?"

"S3 Select, taranan GB başına 0,002 $ ve döndürülen GB başına 0,0007 $ ücret alır — sorgu başına yaklaşık onda bir sent. Karşılığında örnek, her gece 140 GB yerine 600 MB alır, iş dakikalar içinde biter ve kutu bir boy küçülebilir."

"Bu ayda 450 $," dedi analist, örnek hesabını yaptıktan sonra — örneğin saatlik ücretinden ve uğraştığı saatlerden çıkarılmış kabataslak bir tahmin.

"İşte bu yüzden buradayım," dedi Tom. Gerçek sayı daha düşük çıkacaktı — Tom daha sonra gece işine atfedilebilir gerçek hesaplama harcamasını çektiğinde, 450 $ değil ayda 202 $ çıktı. Peçete hesabı sorunu bulur; ölçüm onu boyutlandırır.

Tom bunu, analitik ekibini konuşmaya dahil etmeden önce önce Leo'ya açtı. Leo'nun direneceğini biliyordu ve direnci oda düzeyinde bir tartışmaya dönüşmeden önce anlamak istiyordu.

"S3 Select, analitik veri hattı sorgularında ayda 180 $ tasarruf sağlar," dedi Tom.

"Bu her sorguyu yeniden yazmayı gerektirir," dedi Leo.

"Bu, veri erişim desenini 'indir ve filtrele'den 'S3 Select API üzerinden sorgula'ya değiştirmeyi gerektirir."

"Ki bu bir yeniden yazımdır."

"Bu, istemci kütüphanesi çağrılarında bir değişikliktir," dedi Tom. "Sorgu mantığı — filtreleme ifadeleri — aynı kalır. Değişen, filtrelemenin nerede gerçekleştiğidir. Şu anda: EC2. S3 Select ile: S3."

"S3 Select belgelerini okudum," dedi Leo. "Join yapamazsın. Temel SUM ve COUNT'tan daha karmaşık toplamalar yapamazsın. Bazı analitik sorgularımız bundan daha gelişmiş."

"Biliyorum," dedi Tom. "Bu yüzden S3 Select'i tüm sorgular için önermiyorum. Onu restorana özgü günlük özet sorguları için öneriyorum. Bu, restaurant_id'ye göre filtrelenen, iki sütun çeken 500 MB'lık Parquet dosyası. O sorgu saf bir filtrele-ve-projekte et işlemi. S3 Select tam olarak o durum için doğru araç."

Leo bir an sessiz kaldı. Söz konusu sorguyu açtı.

```python
# Şu an: 500 MB indir, bellekte filtrele
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"S3 Select versiyonu ne olurdu — select_object_content çağrısı mı?"

"Evet," dedi Tom. "read_parquet çağrısını, WHERE cümlesini S3'e iten bir select_object_content çağrısıyla değiştirirsin. Sonuç zaten filtrelenmiş olarak geri gelir. Tüm Parquet dosyası yerine eşleşen kayıtların bir akışını alırsın."

"Ve yanıtı farklı işlemem gerekirdi."

"Yanıt formatı varsayılan olarak CSV'dir. Onu bir DataFrame'e geri ayrıştırmak için küçük bir sarmalayıcıya ihtiyacın olur ya da mevcut ayrıştırma mantığını korumak istersen Parquet çıkış formatını kullanırsın."

Leo baktı. "Bu ne kadar iş?"

"Yarım gün," dedi Tom. "Gece toplu işindeki 287 restoran kimliğinin hepsinde iyice test etmek istersen belki bir gün."

"Ayda 180 $ için."

"Yılda 2.160 $," dedi Tom. "Ve yaklaşım ölçeklenir. 2.000 restoranda, aynı dosya boyutundaki aynı sorgu S3 Select olmadan daha da pahalıya mal olur. Bugün bir gün yatırım yaparak daha sonra çok daha büyük bir sorundan kaçınıyorsun."

Leo defteri kapattı. "S3 Select'in işe yaramadığı sorgular — toplama sorguları, restoranlar arası karşılaştırmalar — bunlar olduğu gibi mi kalıyor?"

"Onlar olduğu gibi kalıyor," diye onayladı Tom. "Analitik veri hattını yeniden yazmaya çalışmıyorum. 500 MB indirip 2 MB'ını kullanmayı durdurmaya çalışıyorum."

"Tamam," dedi Leo. "Bu hafta yaparım."

Yaptı. Uygulama altı saat sürdü. S3 Select çağrısını, mevcut read_parquet çağrısıyla aynı arayüze uyan bir yardımcı fonksiyonun içine sardı — gece toplu işindeki çağıran kodun hiç değişmesi gerekmedi. Yalnızca veri erişim katmanı değişti.

Ertesi ay, analitik veri hattının gece hesaplama faturası 202 $'dan 22 $'a düştü — iş, daha küçük bir örnekte saatler yerine dakikalar içinde bitiyordu. Ayda 180 $'lık tasarruf, altı saatlik mühendislik zamanına mal olmuştu. Yıllıklaştırıldığında, bu zaman yatırımına %1.800'lük bir getiriydi.

"Direndiğim kısım," dedi Leo, aylık incelemede, "yeniden yazımdı. Bir yeniden yazım değil, bir fonksiyon değişimi olduğu ortaya çıktı. Hayali bir sorunu çözüyormuşum."

"Bu not edilmeye değer," dedi Tom. "Bir optimizasyonu uygulayıp uygulamayacağını değerlendirirken, işin gerçekte ne olduğu konusunda spesifik ol. 'Sorguları yeniden yazmayı gerektirir' hayali versiyondu. 'Veri erişim fonksiyonunu değiştirmeyi gerektirir' gerçek versiyondu."


**"Kasıtlı ve Kasıtsız Maliyet"**

Üç haftalık ağ analizinin sonunda Tom, tam dökümü ekibe geri getirdi. Elektronik tablosunda yeni bir sütun vardı: her satır öğesi için evet ya da hayır içeren "Kasıtlı mı?"

"Artık kullandığım çerçeve bu," dedi. "Yalnızca 'ne kadar tutuyor' değil, 'bunu harcamaya biz mi karar verdik?'"

"Kasıtlı bir maliyet nedir?" diye sordu Maya.

"Aurora Global Database replikasyonu. Doğu Kıyısı'nda restoran ortaklarımız olduğu için us-east-1'e replikasyon yapmaya karar verdik. Bu, bölgeler arası replikasyonda ayda 120 $ — felaket kurtarma planlama günlerindeki kabataslak tahminin kabaca iki katı. O maliyeti belirli bir nedenle seçtik."

"Peki kasıtsız?"

"Leo'nun analitik veri hattının, bir test bittikten sonra beş ay boyunca us-east-1'e yazması. Kimse onu seçmedi. Kimse izlemediği için oluyordu."

"Peki AWS hizmet çağrıları için NAT Gateway ücretleri?"

"Arada bir yerde," dedi Tom. "SSM'yi NAT Gateway üzerinden yönlendirmeye açıkça karar vermedik — o varsayılandı. Daha ucuz bir seçenek olduğunu bilmiyorduk. Bu kasıtlı mı? Bir seçim yaptık, sadece ne seçtiğimizi bilmiyorduk."

"Bu en tehlikeli kategori," dedi Priya. "Yaptığını bilmediğin kararlar."

"İşte bu yüzden VPC Flow Logs analizi önemli," dedi Tom. "Görünmezi görünür kılıyor. Bir sınırı aşan her baytın artık izleyebileceğimiz bir hikâyesi var."

"Bunun yine sürüklenmesine izin verirsek ne olur diye düşündük mü?" diye sordu Priya. "Tek seferlik bir analiz yaptık. Altı ay içinde Leo bir yerlerde başka bir test paketi oluşturmuş olacak."

"Tam burada olacağım," dedi Leo. "Bir dahaki sefere eu-west-1'de yapacağım ki en azından GB başına daha pahalı olsun ve daha hızlı fark edesiniz."

"Aylık VPC Flow Log incelemesi," dedi Tom. "Onu üç aylık maliyet incelemesine ekleyeceğim. Yeni bir bölgeler arası akış ya da bir NAT Gateway sıçraması görürsek, bir sonraki faturadan önce onu izleriz."

**Varyasyon: Kabul Ettiğin Ödünleşim**

Her şeyi tek bir Erişilebilirlik Bölgesi'nde çalıştırarak AZ'ler arası trafiği ortadan kaldırırsanız, Nimbus'un mevcut hacminde ayda yaklaşık 31 $ tasarruf edersiniz — ama olay riskinde bundan çok daha değerli olan Multi-AZ yedekliliğini kaybedersiniz. Olgun maliyet konuşması her zaman tasarruf bulmakla ilgili değildir; bazen tam olarak ne için ödediğini anlamak ve buna değdiğine karar vermekle ilgilidir.

AZ'ler arası ücret, dayanıklılığın bedelidir. Bazı ağ maliyetleri verimsizlikler değil, mimari taahhütlerdir.

SAA-C03 bağlantısı: sınav sıklıkla bir "maliyet optimizasyonu"nun bir yedekliliği ortadan kaldıracağı senaryolar sunar. Doğru cevap genellikle yedekliliği korumak ve başka bir yerde optimize etmektir — israf ile güvenilirlik maliyeti arasındaki farkı bilin.

**CloudFront: Veri Transferi İndirimi**

İşte sezgilere aykırı bir gerçek: veriyi CloudFront üzerinden sunmak, doğrudan EC2 ya da S3'ten sunmaktan genellikle daha ucuzdur.

**Doğrudan EC2'den internete**: 0,09 $/GB
**CloudFront'tan internete**: 0,085 $/GB (biraz daha ucuz)

Ama asıl tasarruf GB başına oran değil — CloudFront'un veriyi kenar konumlarında önbelleğe almasıdır. 1.000 kullanıcı aynı menü fotoğrafını isterse:

- **CloudFront olmadan**: 1.000 istek doğrudan S3'ten internete çıkar × fotoğraf boyutu × 0,09 $/GB
- **CloudFront ile**: istemciler fotoğrafı kenardan CloudFront'un oranıyla (0,085 $/GB) alır ve önbellek doldurma — CloudFront'un 1 kaçırmada S3'ten veri çekmesi — **ücretsizdir** (AWS origin-to-CloudFront transferinden feragat eder; yalnızca origin GET isteklerini ödersiniz)

Nimbus için %83'lük bir önbellek isabet oranıyla (Bölüm 13'ten), isteklerin %83'ü origin'e hiç dokunmadı — daha az origin isteği, daha az origin yükü ve her bayt S3'ün internet oranı yerine kenar oranıyla faturalandırıldı.

"CloudFront yalnızca performans için bir CDN değildir," dedi Tom. "Aynı zamanda veri transferi için bir maliyet optimizasyonudur."

Leo düşünceli görünüyordu. "Tüm statik içerik teslimini, gecikmeye duyarlı olmayan varlıklar için bile CloudFront üzerinden taşımalıyız."

"Doğru. Kullanıcılar onu AWS'den indiriyorsa, CloudFront üzerinden gitmeli."

**Tam Ağ Optimizasyonu**

Üç haftalık analiz ve uygulamanın ardından:

| Maliyet Öğesi                              | Önce     | Sonra    | Aylık Tasarruf |
|--------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoint'ler)       | $289     | $211     | $78            |
| CloudFront optimizasyonu (daha fazla varlık taşı) | $214     | $147     | $67            |
| AZ'ler arası trafik (olduğu gibi kabul edildi) | $178     | $178     | $0             |
| Bölgeler arası trafik (Leo'nun test paketi) | $166     | $160     | $6             |
| **Toplam**                                 | **$847** | **$696** | **$151/ay**    |

Ayda 151 $, ağ tasarruflarında yılda 1.812 $. Hesaplama ve depolamaya kıyasla mütevazı, ama anlamlı.

Daha da önemlisi: Tom artık ağ faturasının her satırını anlıyordu. Her maliyeti açıklayabiliyordu ve hangisini optimize edeceğine, hangisini kabul edeceğine bilinçli olarak karar vermişti. Kasıtlı ve kasıtsız maliyet arasındaki ayrım artık açık ve belgelenmişti.

## Güçlü Yönler ve Sınırlamalar

**NAT Gateway maliyetleri**:

- NAT Gateway üzerinden geçen büyük veri hacimleri hızla birikir
- VPC Endpoint'leri bazı NAT maliyetlerini tamamen ortadan kaldırır
- Özel örneklerinizin hangi hizmetleri çağırdığını ve uç noktaların mevcut olup olmadığını gözden geçirin

**Maliyet için CloudFront**:

- Önbellek isabet oranı doğrudan maliyet tasarruflarını belirler
- Yüksek önbellek isabet oranı = daha az origin isteği ve daha az origin yükü, artı CloudFront'un daha ucuz izleyici tarafı oranıyla faturalandırılan daha fazla bayt (AWS origin'lerinden origin-to-CloudFront transferi hiç ücretlendirilmez)
- Tüm statik varlık teslimini CloudFront üzerinden taşıyın

**AZ'ler arası ödünleşimler**:

- AZ'ler arası trafiği ortadan kaldırmak genellikle tasarruftan daha pahalı olan mimari değişiklikler gerektirir
- Optimize etmeden önce dikkatlice hesaplayın

**S3 Select** (eski — 2024'ten beri yeni müşterilere kapalı; yerine Athena kullanın. S3 Object Lambda da artık eski — Kasım 2025 itibarıyla yeni müşterilere kapalı, mevcut iş yükleri etkilenmez):

- İlke geçerliliğini koruyor: büyük S3 nesnelerini indirmek yerine depolama katmanında filtreleyin — tasarruflar hesaplama süresinde, örnek boyutunda ve iş süresinde ortaya çıkar (aynı bölge içi S3 transferi zaten ücretsizdir)
- Tüm dosyaya ihtiyacınız olduğunda yardımcı olmaz

## Özet

Tom ağ analizini, beyaz tahtada bir sayı ve faturadaki son bilinmeyenin gerçekte ne olduğuna dair daha net bir anlayışla kapattı. Ağ maliyetlerindeki 847 $/ay bir beceriksizlik gizemi değildi — erişilebilirlik bölgelerine yayılan, küresel kullanıcılara hizmet veren ve veriyi bölgeler arasında replike eden dağıtık bir sistemin beklenen maliyetiydi. Çoğu ödemeye değerdi. Bir kısmı değildi. Asıl ilerleme, hangisinin hangisi olduğunu söyleyebilmekti.

- AWS, **çıkış verisi** (internet: ~0,09 $/GB), **AZ'ler arası trafik** (her yönde 0,01 $/GB), **bölgeler arası trafik** (0,02-0,08 $/GB) ve **NAT Gateway işleme** (0,045 $/GB) için ücret alır.
- **Giriş verisi** ücretsizdir. **Aynı AZ içi trafik** ücretsizdir.
- **VPC Flow Logs**, VPC'lerinizin içinde hangi spesifik trafik akışlarının her maliyet kategorisini ürettiğini ortaya çıkarır — hedefli optimizasyon için elzemdir. Bir VPC ağ arayüzünü hiç aşmayan akışlar (CloudFront'un bir S3 origin'inden veri çekmesi gibi) kendi enstrümanlarını gerektirir: CloudFront standart günlükleri ya da S3 sunucu erişim günlükleri.
- **VPC Gateway Endpoint'leri** (S3, DynamoDB): Ücretsiz. Bu hizmetler için NAT Gateway maliyetlerini ortadan kaldırır.
- **VPC Interface Endpoint'leri**: Saat başına artı GB başına fiyatlandırılır. Yüksek hacimli hizmetler için NAT Gateway'den daha ucuzdur.
- **CloudFront**, veriyi doğrudan EC2-internet'ten daha düşük oranlarda sunar ve önbellekleme yoluyla origin transfer hacmini önemli ölçüde azaltır.
- Kritik soru yalnızca "ne kadar" değil, "bu maliyet kasıtlı mı?"dır. Kasıtsız maliyetler — unutulan test veri hatları, NAT üzerinden varsayılan yönlendirme — gerçek tasarrufların saklandığı yerdir.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama (Alan 4, Görev 4.4)*

- **NAT Gateway ve VPC Endpoint'leri**: Sınav senaryosu: "Özel alt ağdaki EC2 sık sık S3/DynamoDB çağırıyor — NAT Gateway maliyetleri nasıl azaltılır?" → VPC Gateway Endpoint'leri (S3 ve DynamoDB için ücretsiz).
- **Veri transferi fiyatlandırma kuralları**:
  - AWS'ye: ücretsiz
  - Aynı AZ: ücretsiz
  - AZ'ler arası: ücretli
  - Bölgeler arası: ücretli (daha yüksek oran)
  - İnternet: ücretli (önemli oran)
- **Maliyet optimizasyonu olarak CloudFront**: "Küresel içerik dağıtımı için veri transferi maliyetlerini azaltın" → CloudFront. Önbellek katmanı origin isteklerini azaltır.
- **S3 Transfer Acceleration**: CloudFront kenar konumlarını kullanarak *S3'e* yüklemeleri hızlandırır. Standart S3'ten daha yüksek maliyet. Coğrafi olarak uzak konumlardan büyük dosyalar yükleyen müşteriler için kullanın.
- **Bölgeler arası replikasyon maliyetleri**: Veriyi bölgeler arasında replike etmek veri transferi ücretleri doğurur. S3 CRR için hem çıkış veri transferi oranını hem de S3 istek maliyetini ödersiniz.
- **PrivateLink (VPC Interface Endpoint'leri)**: AWS hizmetlerine ve diğer AWS müşterileri tarafından barındırılan hizmetlere özel bağlantı sağlar. NAT üzerinden gitmekten daha güvenlidir, yüksek hacimli hizmetler için genellikle daha ucuzdur. NAT Gateway işlemeye karşı başabaş noktası yaklaşık aylık 420 GB'dir (uç noktanın kendi AZ başına saatlik maliyeti sayılarak ve NAT Gateway'in diğer trafik için kaldığı varsayılarak).

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Bir VPC Gateway Endpoint ile bir VPC Interface Endpoint arasındaki farkı açıklayın. Her biri hangi AWS hizmetleri için kullanılabilir ve her birinin maliyeti nedir?

*(İpucu: Gateway Endpoint'leri ücretsizdir ama yalnızca S3 ve DynamoDB için çalışır. Interface Endpoint'leri saat başına ücretlendirilir ama çoğu diğer AWS hizmeti için çalışır.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirketin uygulaması özel alt ağlardaki EC2 örneklerinde çalışıyor. Örnekler Amazon SQS ve Amazon S3'e sık sık API çağrıları yapıyor. Şu anda tüm trafik bir NAT Gateway üzerinden çıkıyor. Ekip NAT Gateway maliyetlerini azaltmak istiyor. Veri güvenliği korunmalı — hiçbir trafik halka açık internetten geçmemeli.

Bu gereksinimleri minimum sürekli maliyetle EN İYİ karşılayan yaklaşım hangisidir?

A) SQS için bir Gateway Endpoint ve S3 için bir Gateway Endpoint oluşturun
B) Hem SQS hem de S3 için Interface Endpoint'ler oluşturun
C) SQS için bir Interface Endpoint ve S3 için bir Gateway Endpoint oluşturun
D) NAT Gateway'i kaldırın ve API çağrıları için doğrudan internet ağ geçidini kullanın

**İpucu 1**: Gateway Endpoint'leri yalnızca S3 ve DynamoDB için kullanılabilir.

**İpucu 2**: Interface Endpoint'leri SQS ve diğer birçok hizmet için kullanılabilir (ama ücretlidir).

**İpucu 3**: Özel alt ağ rota tablosundaki bir İnternet Ağ Geçidi onu bir genel alt ağ yapar — güvenlik gereksinimlerini ihlal eder.

**Cevap**: C

**Açıklama**: S3 bir Gateway Endpoint (ücretsiz) kullanır. SQS bir Interface Endpoint (ücretli) gerektirir. Bu kombinasyon her iki hizmet için NAT Gateway veri işleme maliyetlerini ortadan kaldırır. Tüm trafik AWS'nin özel ağında kalır — halka açık internetten geçiş yoktur.

**Neden A değil?** Gateway Endpoint'leri SQS için kullanılamaz. Yalnızca S3 ve DynamoDB'nin Gateway Endpoint'leri vardır.

**Neden B değil?** Bu işe yarasa da, S3 için (ücretsiz Gateway Endpoint yerine) bir Interface Endpoint kullanmak gereksiz saatlik ücretler doğurur. S3 ve DynamoDB için her zaman ücretsiz Gateway Endpoint'i kullanın.

**Neden D değil?** Özel alt ağdan İnternet Ağ Geçidi'ne bir rota eklemek onu bir genel alt ağ yapar. Özel alt ağlardaki EC2 örnekleri tipik olarak Elastic IP'lere sahip olmadığından, ek değişiklikler olmadan bir İnternet Ağ Geçidi üzerinden gerçekten yönlendirme yapamazlardı — ve bunu yapmak onları gelen internet trafiğine maruz bırakırdı.

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama — Görev 4.4*

**Alıştırma 3 — Mimari Meydan Okuma** *(İsteğe Bağlı)*

Nimbus'un Doğu Kıyısı kullanıcıları önemli miktarda trafik üretiyor. Uygulama onlara us-west-2'den (Oregon) hizmet veriyor. Şu anda:

- API yanıtları us-west-2 EC2 örneklerinden Doğu Kıyısı kullanıcılarına doğrudan gidiyor (~80 ms, 0,09 $/GB)
- Menü fotoğrafları S3 us-west-2'den Boston'daki CloudFront kenarı üzerinden gidiyor (önbelleklemeden sonra ~8 ms)

Ekip, API gecikmesini azaltmak için Doğu Kıyısı kullanıcıları için us-east-1'de (Kuzey Virginia) ikinci bir uygulama bölgesi eklemeyi düşünüyor.

Bu değişikliğin veri transferi maliyetlerini analiz edin. Çift bölgeli kurulum hangi yeni bölgeler arası veri transferi maliyetleri doğurur? Route 53 gecikme tabanlı yönlendirme toplam transfer maliyetlerini azaltır mı yoksa artırır mı? Hangi koşullar altında (trafik hacmi, gecikme hassasiyeti) çift bölgeli kurulum kendini amorti eder?

*(Tek bir doğru cevap yoktur. Amaç çok bölgeli maliyet-fayda analizini uygulamaktır.)*

## Jenerik Sonrası Sahne

Tom ağ analizini kapattı.

Toplam üç aylık optimizasyon projesinin etkisi:

- EC2 Savings Plans: -14.200 $/yıl
- S3 yaşam döngüsü politikaları: -7.800 $/yıl
- Depolama (S3 + EBS): -6.200 $/yıl
- Veritabanı katmanı: -5.892 $/yıl
- Ağ: -1.812 $/yıl
- **Toplam: -35.904 $/yıl**

Bunu toplantı odasındaki bir beyaz tahtaya yazdı.

Leo ona baktı. "Otuz beş bin."

"Ve küsuru," dedi Tom.

"Yılda."

"Yılda."

Priya hesap yaptı. "Bu, değer yaratmayan şeylere harcadığımız ayda 2.992 $ demek."

"Hepsi değil," diye düzeltti Tom. "Bir kısmı değer aldığımız ama fazla para ödediğimiz şeylerdi. Savings Plans — tam olarak aynı EC2 kapasitesini, sadece daha iyi bir fiyata alıyorduk."

Maya uzun süre beyaz tahtanın başında durdu.

"Nimbus'u başlattığımızda," dedi, "her dolar önemliydi. İlk EC2 örneğini bile zar zor karşılayabiliyorduk."

"Evet," dedi Tom.

"Ve bir yerlerde, doları o kadar dikkatle izlemeyi bıraktık."

"Büyüme bunu yapar," dedi Priya. "Odak optimize etmeye değil, inşa etmeye kayar."

"İkisi de önemli," dedi Maya. "İkisi de, her zaman. Bunu wiki'ye ekle. Ve maliyet için üç aylık bir inceleme ayarla."

Tom çoktan takvimini açıyordu.

Sonraki birkaç bölümde: bireysel hizmetlerden uzaklaşıp mimar gibi düşünmeye başlıyoruz.
