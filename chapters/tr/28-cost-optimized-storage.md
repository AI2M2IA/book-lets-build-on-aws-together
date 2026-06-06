# Bölüm 28: Depolama Faturası Sürprizi

Tabloda artık on altı sekme vardı. Tom onu ikinci bir pencerede açık tutuyordu, tıpkı bazı insanların bir alışveriş listesi tuttuğu gibi — her zaman görünür, her zaman birikiyor. EC2 için yeni bir satır ekledi (tamam, Tasarruf Planı taahhüt edildi) ve imlecini bir sonraki satıra taşıdı.

Depolama.

**Özet: EC2 Halledildi, Bir Kalem Kaldı**

Bölüm 27’deki compute fiyatlandırma çalışması EC2 stratejisini sabitlemişti: üç yıllık süreyle 0,45 dolar/saatlik bir Compute Tasarruf Planı, artı gece toplu işi için Spot — süre boyunca tahminen 42.500 dolar tasarruf. O iş bitmişti ve iyi yapılmıştı. Ama faturada bir satırdı. Tom, altı aylık Athena maliyet analizinden, faturanın birçok satırı olduğunu — ve her birinin aynı incelemeyi hak ettiğini — öğrenmişti. Sırada S3 vardı: 198 dolar/ay, Bölüm 23’teki yaşam döngüsü politikası değişikliklerinden sonra zaten 847 dolardan iyileştirilmişti. Ama gözüne çarpan sayı sayfada daha aşağıdaydı. EBS: 440 dolar/ay.

“Bu yüksek görünüyor,” dedi.

Leo, EBS birim listesini açtı. Instance’lara bağlı 47 EBS birimi vardı. Ve sonra herhangi bir instance’a bağlı olmayan 23 birim daha vardı.

“Bu 23 birim,” dedi Tom. “Bunlar ne?”

**Yetim Birim Denetimi**

Leo onları tek tek incelemeye başladı. Bu hızlı bir süreç değildi — birimler tek tip etiketlenmemişti, etiketler tutarsızdı ve bazıları o kadar uzun zaman önce oluşturulmuştu ki kimse bağlamı hatırlamıyordu. Tom bir sandalye çekip izledi.

Birim ebs-021a4c. 16 ay önce oluşturuldu. Etiket: “debug-prod-db-snapshot-restore.” Boyut: 200GB. Son bağlanma: hiç, ya da bağlanma geçmişi temizlenmiş.

“Onu hatırlıyorum,” dedi Leo. “Bir veritabanı sorgu sorunumuz vardı ve verileri kontrol etmek için bir snapshot’ı geri yükledim. Kontrol ettim, sorunu orada bulamadım ve birimi silmeyi unuttum.”

Birim ebs-07f38b. 11 ay önce oluşturuldu. Etiket: “load-test-temp.” Boyut: 400GB.

Leo bir an sessiz kaldı. “Sanırım o, Series Seed sunumundan önce yaptığımız yük testiydi. Zirve yükü simüle etmek için ekstra depolamalı ekstra instance’lar sağladık ve sonra... sonrasında hiçbirini sildiğimi sanmıyorum.”

“Onu zaten dağıtmıştım — ah,” dedi. “Yük testi geçiciydi. Birimler değildi.”

Birim ebs-0ab12c’den ebs-0ab134’e kadar. Sekiz ardışık birim, 9 ay önce oluşturuldu. Etiket: “k8s-experiment.” Her biri 100GB, toplam 800GB.

“O Kubernetes değerlendirmesiydi,” dedi Priya, Leo’nun omzunun üzerinden bakarak. “ECS’ye mi yoksa EKS’ye mi geçeceğimizi değerlendirmek için üç hafta harcadık. EKS ikinci sıradaydı. Deney kümesini söktük ama görünüşe göre kalıcı birimleri bıraktık.”

Tom bunu ayrı bir sekmede topluyordu. Birim birim, sayılar birikti:

- Debug geri yükleme birimleri: 4 birim × 200GB = 800GB
- Yük testi birimleri: 200 ile 400GB arasında altı birim — toplamda kabaca 1.200GB
- Kubernetes deney birimleri: 8 birim × 100GB = 800GB
- Çeşitli etiketsiz: 5 birim × çeşitli boyutlar = ~700GB

Toplam: 23 bağlı olmayan birim arasında yaklaşık 3.500GB.

“Bu ayda ne kadara mal oluyor?” diye sordu Tom. Cevap: gp3, 0,08 dolar/GB/ay. 3.500GB × 0,08 dolar = 280 dolar/ay.

En eski oluşturma tarihini kontrol etti. On altı ay. Hesap makinesini çıkardı.

“Bunlardan bazıları için on altı aydır ödeme yapıyoruz,” dedi. “Bazıları için dokuz. Hepsinin ortalaması muhtemelen on ay.” 23 birim, her biri ortalama 12 dolar/ay, ortalama 10 ay. Bu yaklaşık 2.760 dolardı. Daha büyük birimleri ekleyince hesap, toplamda kabaca 3.200 dolarlık israfa çıktı.

“Üç bin iki yüz dolar,” dedi Tom. “Kimsenin kullanmadığı birimlerden.”

“Ve kimse fark etmedi çünkü ücret düzinelerce kaleme yayılmış,” dedi Leo. “Bu tek bir 3.200 dolarlık ücret değil. Ayda 12 ya da 50 ya da 80 dolarlık 23 ücret, her biri tek başına herhangi bir alarmı tetiklemeyecek kadar küçük.”

Tom, 23 bağlı olmayan birimin hepsini sildi. Her birinin ihtiyaç duydukları veri içermediğini Leo ve Priya ile teyit etti — debug birimi o zamandan beri taşınmış bir veritabanından kalan eski veriydi, yük testi verisi alakasızdı, Kubernetes deney birimleri boştu. Silme on beş dakika sürdü. Ertesi ay, EBS faturası 440 dolardan 160 dolara düştü.

“Dur — ama bunu *neden* böyle yapalım ki?” diye sordu Maya, Tom ona bulguyu anlattığında. “Bir instance’ı sonlandırdığında birimi silmek neden varsayılan değil?”

“Birime bağlı,” dedi Tom. “**Kök** birim varsayılan olarak silinir — onun için `DeleteOnTermination` true’dur. Ama bağladığınız herhangi bir **ek** veri birimi varsayılan olarak korunur. Varsayım, üzerlerindeki verilere ihtiyaç duyabileceğinizdir. Bu 23 yetim hepsi veri birimleriydi — bir debug oturumu veya bir yük testi için bağlanmış, sonra instance sonlandırıldığında geride bırakılmış.”

“Yani varsayılan, veri birimlerinde kazara veri kaybından sizi korur.”

“Ve dikkat etmiyorsanız size paraya mal olur. Bundan sonra: herhangi bir ek veri birimi, instance sonlandığında açıkça silinir — ya da bağlama zamanında `DeleteOnTermination` ayarlanır — birisi onları neden saklamaları gerektiğine dair belgelenmiş bir gerekçe sunmadıkça.”

“Birisi o gerekçeyi belgelemeyi unutursa ne olacağını düşündük mü?” diye sordu Priya. “Önemli bir şeyi silebiliriz.”

“Ödünleşim bu,” dedi Tom. “Şu anda ödünleşim diğer yönde — her şeyin saklanması gerektiğini varsayıyoruz ve saklanmaması gerektiğinde bunun bedelini ödüyoruz. ‘Bu birimi sakla’yı belgeleme disiplini, mevcut ‘her şeyi sessizce sakla’ varsayılanından daha az risklidir.”

**Depolama Maliyeti Denetimi**

Tom’un EBS keşfi daha geniş bir örüntünün belirtisiydi: depolama maliyetleri görünmez bir şekilde birikir. Compute’un aksine (47 sunucu çalışıyorsa fark edersiniz), depolama sessizce birikir.

Bir depolama birimi kiralaması gibi düşünün. Bir birim kiralamak kredi kartı ekstresinde aşikârdır. Ama bir proje için ikinci bir birim, sonra eski mobilyalar için üçüncü bir birim kiralarsanız ve içinde ne olduğunu kontrol etmek için bir daha hiç geri dönmezseniz — ücretler her ay sessizce gelmeye devam eder, neyi sakladığınızı unuttuktan çok sonra bile. Bulut depolaması aynı şekilde çalışır: baytlar orada durur, fatura gelir ve birisi sonunda kapıyı açıp onu artık kimsenin ihtiyaç duymadığı şeylerle dolu bulana kadar kimse sorgulamaz.

Kapsamlı bir depolama maliyeti denetimi şunlara bakar:

**S3**:

- Tüm bucket’lar için yaşam döngüsü politikaları mevcut mu?
- S3’te duran eski snapshot’lar (RDS, EBS) var mı?
- Belirsiz erişim örüntüleri olan bucket’lar için Intelligent-Tiering uygun mu?
- Hiç erişilmeyen birden fazla kopya oluşturan sürümlenmiş nesneler var mı?
- Sessizce biriken tamamlanmamış multipart yüklemeler var mı?

**EBS**:

- Herhangi bir birim bağlı değil mi (onu kullanan çalışan bir instance yok mu)?
- gp3 birimleri düzgün yapılandırılmış mı? (Varsayılan gp3 birimleri, ihtiyaç duyulmayan fazla sağlanmış işlem hacmine/IOPS’a sahip olabilir)
- Gereğinden eski snapshot’lar saklanıyor mu?

**RDS**:

- Otomatik yedekleme saklama süreleri uygun şekilde ayarlanmış mı? (Daha uzun = daha fazla depolama maliyeti)
- Eski instance’lardan kalan manuel snapshot’lar hâlâ duruyor mu?
- Veritabanı geçişlerinden kalan okuma replikaları hâlâ çalışıyor mu?

**EFS**:

- EFS birimi doğru depolama sınıfında mı? (Standard vs Infrequent Access)

**S3 Sürümleme: Gizli Maliyet**

Bölüm 5’te, S3 sürümlemenin bir nesnenin her önceki sürümünü sakladığından bahsetmiştik. Bu, güvenlik için mükemmeldir. Sürümler için yaşam döngüsü kurallarınız da yoksa, maliyetler için berbattır.

Bir bucket’ta sürümleme etkinleştirildiğinde, bir nesnenin üzerine her yazdığınızda eski sürüm saklanır. Zamanla:

- 1. Gün: Resim yüklendi (v1)
- 30. Gün: Resim güncellendi (v1 artık “noncurrent” bir sürüm, v2 güncel)
- 60. Gün: Resim tekrar güncellendi (v1 ve v2 noncurrent, v3 güncel)
- 365. Gün: v1, v2... v12 hepsi saklanıyor. Bir resmin 12 kopyası için ödeme yapıyorsunuz.

Sürümlemenin eski sürümleri neden otomatik olarak temizlemediğini merak ediyor olabilirsiniz. Cevap kasıtlıdır — AWS, verilerinizi otomatik olarak silmek istemez. Ama sonuç, S3’e onları ne kadar süre saklayacağını açıkça söyleyene kadar her sürümün birikmesidir. Çözüm: noncurrent sürümler için yaşam döngüsü kuralları.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom bu kuralları tüm sürümlenmiş bucket’lara uyguladı. Ertesi ay, S3 depolaması %18 azaldı.

**Tamamlanmamış Multipart Yüklemeler: Görünmez Birikim**

Çoğu mühendisin tamamen kaçırdığı daha incelikli bir S3 maliyeti var: tamamlanmamış multipart yüklemeler.

S3 büyük bir dosyayı yüklerken, onu parçalara böler ve her birini ayrı ayrı yükler. Bu, multipart yükleme mekanizmasıdır — birkaç yüz megabaytın üzerindeki dosyalar için tek bir büyük PUT’tan daha güvenilir. Ama bir yükleme başlar ve sonra yarıda başarısız olursa — bir ağ kesintisi, bir istemci çökmesi, bir uygulama hatası — zaten yüklenmiş parçalar S3’te kalır. Bucket’ınızda nesne olarak görünmezler. Hiçbir listede görünmezler. Ama saklanırlar ve standart S3 oranlarında bunlar için ücretlendirilirsiniz.

Tom bunu, S3 konsolundaki S3 Storage Lens panosunu etkinleştirip “incomplete multipart uploads”a göre sıralayarak buldu. Nimbus’un dört AWS hesabındaki bucket’larda sessizce duran 340GB tamamlanmamış multipart yükleme verisi vardı, bir kısmı bir yıldan eskiydi.

“Bu ayda ne kadara mal oluyor?” diye sordu Tom. 0,023 dolar/GB/ay × 340GB = 7,82 dolar/ay. Tek başına küçük. Ama bir yıldır kimse fark etmeden birikiyordu.

Çözüm: her bucket’a bir yaşam döngüsü kuralı ekle.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Yedi günden sonra, herhangi bir tamamlanmamış multipart yükleme otomatik olarak temizlenir. Bu, herhangi bir sürekli ilgi gerektirmeden süresiz çalışır.

“Bütün o şey tam bir yıl orada durmuş olsaydı — başarısız yüklemelere harcadığımız 94 dolar diyelim,” dedi Leo.

“Başarısız yüklemelere,” diye onayladı Tom. “Başarılı depolamaya bile değil. Altyapı israfının tanımı budur.”

**EBS: Doğru Boyutlandırma ve gp3 Yükseltmesi**

EBS birim fiyatlandırmasının iki bileşeni vardır:

1. Depolama (GB başına aylık)
2. Sağlanmış IOPS ve işlem hacmi (io1/io2’deyseniz veya fazladan gp3 performansı için ödeme yapıyorsanız)

**gp3 fırsatı**: Bölüm 6’da, gp3’ün mevcut varsayılan olduğunu ve gp2’den daha ucuz olduğunu belirtmiştik. Nimbus’un gp3 mevcut olmadan önce (Aralık 2020’de piyasaya sürüldü) oluşturulmuş birimleri varsa, bunlar hâlâ gp2 olabilir.

Geçiş basittir: birim türünü AWS konsolunda veya CLI ile gp2’den gp3’e değiştirin. Kesinti gerekmez. Dönüşüm sırasında birim kullanılabilir kalır. Performans özellikleri eşit veya daha iyidir — gp3, gp2’nin daha küçük birimler için tutarsız olabilen patlamalı modeline kıyasla 3.000 IOPS ve 125 MB/s temel işlem hacmi sağlar.

“Dur — ama bunu *neden* böyle yapalım ki?” diye sordu Maya. “gp3 daha ucuz ve en az gp2 kadar iyiyse, AWS neden herkesi otomatik olarak geçirmedi?”

“Çünkü AWS, müşteri altyapısında tek taraflı değişiklikler yapmaz,” dedi Tom. “Faydalı olanları bile. Değişiklik teorik olarak bazı iş yükleri için yan etkilere sahip olabilir. Müşterinin başlatması gerekir. Bu yüzden binlerce ekip, gp3 piyasaya sürüldükten yıllar sonra hâlâ gp2 fiyatları ödüyor, sadece kimse bakmaya gitmedi diye.”

Tom, gp3 geçişini bir Cumartesi sabahı yapmaya karar verdi — EC2 fiyatlandırma analizine uyguladığı aynı sabah disiplini. Sessiz zaman. Ayaküstü toplantı yok. Sadece AWS konsolu ve bir plan.

Üretim ortamında hâlâ gp2 olan 8 birim belirlemişti: dört API sunucusu kök birimi, arka plan işleyicilerine bağlı iki birim ve yeni dağıtımlar için gp3 geçişi standart uygulama haline gelmeden önce oluşturulmuş iki eski veri birimi. Hepsi birlikte 960 GB ediyordu.

Geçiş süreci, birim başına tek bir API çağrısıydı:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

`--iops 3000` ve `--throughput 125` parametreleri gp3’ün temel varsayılanlarıyla eşleşiyordu. gp2 için Tom önce CloudWatch metriklerini kontrol etmişti: her birimdeki ortalama IOPS 200 ile 800 arasındaydı. Hiçbiri, gp3’ün ücretsiz sağladığı 3.000 IOPS temelinden fazlasına ihtiyaç duymuyordu. İşlem hacmi de benzer şekilde rahattı — 125 MB/s varsayılanının çok içinde.

“Geçişten sonra bir birim daha fazla IOPS’a ihtiyaç duyarsa ne olur?” diye sordu Maya, Tom geçiş planını açıkladığında.

“Bir gp3 biriminde sağlanmış IOPS’ı istediğimiz zaman artırabiliriz,” dedi Tom. “Geçiş hiçbir şeyi kilitlemez. 3.000 IOPS’ta gp3’e geçer ve bunun yetersiz olduğunu fark edersek, daha fazlasını eklemek için birimi tekrar değiştiririz. Değişiklik canlıdır — kesinti yok, sökme yok.”

“Ve gp2 yerinde değiştirilemez mi?”

“gp2, yerinde gp3’e değiştirilebilir. Yapamayacağınız şey gp3’ten gp2’ye geri dönmektir — en azından kolay değil ve buna gerek de yok.”

Gerçek geçiş, ilk komuttan tüm 8 birim genelinde tamamlanmaya kadar 73 dakika sürdü. AWS, her birimi bağlıyken ve kullanımdayken değiştirdi. API sunucuları baştan sona trafik almaya devam etti. CloudWatch, dönüşüm sırasında G/Ç gecikmesinde hiçbir artış göstermedi — geçiş çalışan uygulama açısından tamamen şeffaftı.

“‘Kesinti gerekmez’ aslında böyle görünüyor,” dedi Leo, Tom’un yakaladığı öncesi ve sonrası metriklerine bakarak. “‘Kesinti yok’un ‘kısa bir yeniden başlatma’ anlamına geldiğini varsaymıştım. Uygulamanın bakış açısından kelimenin tam anlamıyla hiçbir şeyin değişmemesi anlamına geliyor.”

Tasarruf: gp2, 0,10 dolar/GB/ay; gp3, 0,08 dolar/GB/ay. 960 GB’da: 96 dolar/ay’a karşı 76,80 dolar/ay. Aylık tasarruf: 19,20 dolar. Kendi başına dönüştürücü değil, ama temsil ettiği disiplin öyleydi. O noktadan itibaren oluşturulan her yeni birim varsayılan olarak gp3 kullandı. Tom’un o sabah yazdığı kurumsal kural: gp2 birimi yok. EBS birimi oluşturan herhangi bir mühendis, aksine belirli, belgelenmiş bir neden olmadıkça gp3 kullanmalı.

**IOPS ve işlem hacmi**: gp3 birimleri, ek ücret olmadan varsayılan olarak 3.000 IOPS ve 125 MB/s işlem hacmiyle gelir. İş yükünüz gerektiriyorsa daha fazla sağlayabilirsiniz. Sağlanmış performansın gerçekten kullanılıp kullanılmadığını gözden geçirin.

Aynı denetimde Tom, 10.000 sağlanmış IOPS’a sahip iki birim buldu — katılmadan önceden kalma eski bir ayar, o zamandan beri Aurora’ya geçmiş bir veritabanı için boyutlandırılmış. CloudWatch metriklerini kontrol etti: gerçek ortalama IOPS 1.200’dü. Sağlanmış IOPS’ı 4.000’e düşürdü (gerçek zirvenin üzerinde bir güvenlik marjı).

Aylık tasarruf: kimsenin kullanmadığı performans boşluğuna ödenen sağlanmış IOPS maliyetlerinde 68 dolar.

**Snapshot yaşam döngüsü**: EBS snapshot’ları artımlıdır (her snapshot yalnızca bir öncekinden bu yana yapılan değişiklikleri saklar), ama birikirler. Nimbus’un ilk günlerinden kalan eski snapshot’lar hâlâ vardı. Tom, 30 günlük günlük snapshot’ı sakladı ve gerisini sildi.

**EFS: Depolama Sınıfları ve Intelligent-Tiering Kararı**

Amazon EFS’nin kendi depolama sınıfları vardır:

- **EFS Standard**: Sık erişilen dosyalar için. Daha yüksek maliyet.
- **EFS Infrequent Access (IA)**: 30 gün erişilmeyen dosyalar için. Standard’dan %92 daha ucuz.
- **EFS Archive**: 90 gün erişilmeyen dosyalar için. IA’dan bile daha ucuz.

**EFS Intelligent-Tiering**: Erişim örüntülerine göre dosyaları depolama sınıfları arasında otomatik olarak taşır.

Tom, EFS biriminde Intelligent-Tiering’i etkinleştirdi. Altı hafta sonra, dosyaların %68’i Infrequent Access’e taşınmıştı. Aylık EFS maliyeti 89 dolardan 31 dolara düştü.

Ama Intelligent-Tiering ile manuel bir yaşam döngüsü kuralı arasındaki seçim önemsiz değildi. Tom bunu düşünmüştü.

“Dur — ama Intelligent-Tiering’i, sadece manuel bir yaşam döngüsü kuralı ayarlamak yerine *neden* yapalım ki?” diye sordu Maya. “30 günden eski dosyaların erişilmediğini biliyorsak, neden sadece kuralı ayarlayıp işi bitirmiyoruz?”

“Intelligent-Tiering geri gelen dosyaları halleder,” dedi Tom. “Dosyaları 30 gün sonra IA’ya taşımak için bir yaşam döngüsü kuralı ayarlarsam ve sonra biri altı aydır IA’da olan bir dosyaya erişirse, o IA’da kalır. Intelligent-Tiering ile, erişim yeniden başlarsa dosya otomatik olarak Standard’a geri taşınır. Çift yönlüdür.”

“Peki o zaman yaşam döngüsü kuralını ne zaman tercih edersin?”

“Erişim örüntüsünün tek yönlü olduğundan emin olduğunda. Arşiv logları — yazılırlar, eskirler, bir uyumluluk denetimi için bir kez erişilir ve sonra bir daha hiç. O örüntü için, 90 gün sonra Archive’a taşıyan bir yaşam döngüsü kuralı, Intelligent-Tiering’den daha ucuzdur çünkü izleme yükünü ödemiyorsunuz.”

“Bir izleme ücreti mi var?”

“S3 Intelligent-Tiering için evet, bu yüzden S3 yaşam döngüsü bölümünde küçük nesne ekonomisini ele almıştık. EFS için, karar çoğunlukla erişim örüntüsüyle ilgili: dosyalar tekrar sıcak olabilirse, Intelligent-Tiering daha güvenlidir. Yalnızca tek yönde eskiyorlarsa, Archive’a bir yaşam döngüsü kuralı daha ucuz ve daha basittir.”

**S3 Maliyet Tahsis Etiketleri: Kimin Ne Harcadığını Bulma**

Nimbus büyüdükçe, birden fazla ekip S3’te veri depoluyordu. Analitik ekibinin kendi bucket’ları vardı. Mühendislik ekibinin kendi bucket’ları vardı. Restoran verisi ekibinin kendi bucket’ları vardı.

Fatura sadece “S3: 198 dolar” gösteriyordu. Ekibe göre bir döküm yoktu.

**Maliyet tahsis etiketleri**, AWS kaynaklarını iş meta verileriyle (ekip, proje, ortam) etiketlemenize ve sonra AWS Cost Explorer’da bu etiketlere göre dökülmüş maliyetleri görmenize olanak tanır.

Tom, tüm S3 bucket’larına etiketler ekledi:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Etiketlemeli bir faturalandırma döngüsünden sonra şunu görebiliyordu: “Analitik ekibinin veri gölü 74 dolar/ay. Mühendislik yedeklemeleri 43 dolar/ay. Restoran verisi 81 dolar/ay.”

Artık sadece bir toplam sayıya bakmak yerine her ekiple bütçe konuşmaları yapabilirdi.

**AWS Cost Explorer ve AWS Budgets**

**AWS Cost Explorer**: Geçmiş ve tahmini maliyetleri hizmete, bölgeye, etikete ve kullanım türüne göre görselleştirir. Paranın nereye gittiğini anlamak için elzemdir.

**AWS Budgets**: Maliyetler bir eşiği aştığında (veya aşması tahmin edildiğinde) uyarılar ayarlar. Hizmete, bölgeye, etikete veya hesaba göre bütçeleyebilirsiniz.

Tom üç bütçe kurdu:

1. Toplam aylık fatura: Bütçelenen miktarın %90’ında uyar
2. EC2 On-Demand: On-Demand harcaması 500 dolar/ayı aşarsa uyar (bir Tasarruf Planı boşluğuna işaret eder)
3. Dışarı veri aktarımı: 200 dolar/ayda uyar (veri aktarım maliyetleri beklenmedik şekilde fırlayabilir)

Budgets, uyarıları bir Slack kanalına gönderdi. Ekip, limitlere yaklaştıklarını aylık faturada keşfetmek yerine gördü.

**Her Satırın Fişi: Maliyet ve Kullanım Raporları**

Cost Explorer, Tom’un sorularının çoğunu yanıtladı. Sonra yanıtlayamadığı bir tanesine takıldı: “tam olarak hangi S3 bucket’ları, saat saat, geçen Salı’nın zirvesini yönlendirdi — ve hangi etiketler altında?”

Adli düzeydeki sorular için AWS, **Maliyet ve Kullanım Raporu’nu (CUR)** — artık **Data Exports** aracılığıyla sunuluyor — AWS’nin ürettiği en ayrıntılı faturalama verisini sağlar: her kalem, **kaynak başına, saat başına**, etiketlerle, sahip olduğunuz bir S3 bucket’ına teslim edilir. Bu bir pano değil; ham defterdir. Standart örüntü, onu Athena ile sorgulamak (sütunlu bir formatta gelir) veya panolar için QuickSight’a beslemektir.

Sınavda iş bölümü: **Cost Explorer** = konsoldaki interaktif görselleştirme ve tahminler. **Budgets** = eşiklerde uyarılar. **CUR/Data Exports** = kendi analiziniz için S3’e teslim edilen en granüler veri. Bir soru “özel analiz için kaynak düzeyinde, saatlik maliyet verisi” derse — bu, Cost Explorer değil, CUR’dur.

“Buna hiç bakmazsak ne olacağını düşündük mü?” diye sordu Priya. “İki günde 6.700 dolar bulduk. Hâlâ ne saklanıyor?”

“Düzenli denetimler,” diye devam etti. “Aylık Cost Explorer incelemeleri. AWS Trusted Advisor, bağlı olmayan birimleri ve boştaki kaynakları otomatik olarak işaretler. Bilinen israf örüntülerinin temizliğini otomatikleştir: N günden eski snapshot’ları sil, bağlı olmayan EBS birimleri için uyar, eski S3 sürümlerinin süresini doldur.”

**S3 Requester-Pays: Aktarım Maliyetini Kaydırma**

Depolama denetimi sırasında Tom, beklemediği bir durum buldu.

Nimbus’un restoran ortaklarının menü fotoğraf varlıklarını — sipariş platformunun müşterilere sunduğu işlenmiş, yeniden boyutlandırılmış görselleri — indirmeleri gerekiyordu. Menüsünü güncelleyen bir restoran için bu, 50 MB’tan (küçük bir güncelleme) 800 MB’a (tam bir mevsimsel yenileme) kadar görsel dosyası indirmek anlamına geliyordu. Şu anda Nimbus, her indirmede giden veri aktarım maliyetini ödüyordu: S3’ten ortağın konumuna 0,09 dolar/GB.

287 restoran ortağında, ayda ortalama bir menü yenilemesi ve ortalama 200 MB indirme ile hesap şuydu: 287 × 0,2GB × 0,09 dolar = 5,17 dolar/ay. Mevcut ölçekte önemli değil.

“2.000 restoranda ne olur?” diye sordu Tom.

“Aynı hesap,” dedi Maya. “Ayda yaklaşık 36 dolar.”

“Peki 10.000 restoranda ve ortaklar büyük mevsimsel varlık paketleri indiriyorsa — diyelim ki bayram menü güncellemeleri için 2 GB?”

Hesabı yaptı. 10.000 × 2GB × 0,09 dolar = ayda 1.800 dolar veri aktarımı, sadece ortakların ihtiyaç duydukları varlıkları indirmesi için.

“Bu gerçek bir sayı,” dedi Priya.

“O fatura, bir Series B kapatmaya çalıştığımız ayda ortaya çıkarsa ne olacağını düşündük mü?” diye devam etti Priya.

“S3 Requester-Pays,” dedi Tom.

S3’ün Requester-Pays adlı bir özelliği var: bir bucket’ta etkinleştirildiğinde, isteği yapan varlık — bucket sahibi değil — veri aktarımı ve istek maliyetlerini öder. Bucket sahibi hâlâ depolama için öder. Ama bucket’tan her indirme, isteği yapanın AWS hesabına faturalandırılır.

Ödünleşim erişimdir. Requester-Pays, isteği yapanların geçerli bir hesaba sahip AWS müşterileri olmasını gerektirir — bir Requester-Pays bucket’ına kimliği doğrulanmamış veya anonim erişim bir hata döndürür. Çeşitli teknik beceri seviyelerine sahip işletmeler olan Nimbus’un restoran ortakları için, kendi menü varlıklarını indirmek için bir AWS hesaplarının olmasını şart koşmak uygulanabilir bir model değildi.

“Doğrudan ortak erişimi için Requester-Pays yapamayız,” dedi Maya. “Ortaklarımızın çoğu fotoğraf indirmek için bir AWS hesabı kurmayacak.”

“Doğru,” dedi Tom. “Ama bunu B2B entegrasyonları için — teknik ekipleri ve AWS hesapları olan daha büyük zincirler için — kullanabiliriz. Köşedeki küçük restoran değil, ama bir mühendislik ekibi olan ve doğrudan API’mizle entegre olan 50 lokasyonlu hamburger zinciri. O segment için Requester-Pays mantıklı.”

“Peki gerisi için?”

“Onlara, önceden imzalanmış S3 URL’leri kullanan bir indirme portalı veririz. Aktarım hâlâ AWS üzerinden gider, maliyet hâlâ bizim — ama bu da ortak fiyatlandırmasına zaten dahil edilmiş. Requester-Pays seçeneği, daha büyük ortaklar için sözleşme görüşmelerine dahil edeceğimiz bir şey, bugün dağıtacağımız bir şey değil.”

Tom bunu tabloya “gelecekteki optimizasyonlar” altına ekledi: AWS hesapları olan kurumsal ortaklar için S3 Requester-Pays. %20 kurumsal müşterili 2.000 restoranda, aylık 2 GB indirmede: potansiyel olarak ortaklara kaydırılabilecek 72 dolar/ay. O ölçekte küçük, ama varlık paketleri büyüdükçe aynı örüntü anlamlı hale gelir. Ortak sayısı 1.000’i aştığında veya kurumsal ortaklar daha büyük mevsimsel paketler çekmeye başladığında gözden geçirin.

“Ders her zamanki gibi aynı,” dedi Tom. “Ölçekte olmadan önce maliyetin ölçekte ne olacağını bilin. Bugünkü 5 dolarlık sorun, üç yıl içinde 1.800 dolarlık sorundur. Bunun için şimdi tasarlamak hiçbir şeye mal olmaz.”

**Yönetişim: Otomatik-Sil vs Yalnızca-Uyar**

Otomasyon sorusu, en çok anlaşmazlık yaratan soruydu.

“Bağlı olmayan EBS birimlerini 14 gün sonra otomatik silmeli miyiz?” diye sordu Tom. “AWS Config kuralları onları işaretleyebilir. Lambda onları otomatik olarak silebilir.”

“Hayır,” dedi Priya hemen.

“Neden olmasın?”

“Çünkü otomatik silme, eninde sonunda bir nedenle bağlı olmayan bir şeyi sileceğimiz anlamına gelir. Belki biri bir birimi farklı bir instance’a taşımak için ayırdı ve bir değişiklik gözden geçirilirken 12 gündür duruyor. 14. günde otomatik silme o veriyi yok eder.”

“Yani yalnızca uyarı mı?” dedi Tom. “Bir bildirim alıyoruz ama otomatik olarak silmiyoruz.”

“Önce uyar,” dedi Priya. “Bir insanı kararı vermeye zorla. Uyarı şu: ‘Bu birim 14 gündür bağlı değil. İhtiyacın varsa `keep: true` olarak etiketle, yoksa bir sonraki incelemede silinmek üzere işaretlenecek.’ İnsan kararı sonra etiketin varlığı veya yokluğuyla belgelenir.”

“Bu daha yavaş,” dedi Leo.

“Daha yavaş ve veriyi yok etme olasılığı daha düşük,” dedi Priya. “İhmal yüzünden zaten 3.200 dolar kaybettik. Otomasyona hiç veri kaybetmedik. Hangisini sürdürmeyi tercih edeceğimi biliyorum.”

Tom bir melez çözüme vardı: 7 günde otomatik uyarı, gelecekteki uyarıları bastırmak için bir `keep: true` etiketi gerektir ve ekibin birlikte gözden geçirmesi için tüm etiketsiz-ve-bağlı-olmayan birimlerin haftalık bir raporunu çalıştır. Otomatik silme yok.

**Varyasyon: Temizlik Tasarruf Ettiğinden Fazlasına Mal Olduğunda**

Ekstra snapshot’ların güvenliğine ihtiyacınız varsa, onları saklayın — ama erişimi olmayan 90 günden eski her snapshot, yerini hak etmeli. Ödünleşim asimetriktir: ihtiyaç duyduğunuz bir snapshot’ı silmek bir olaya mal olur; ihtiyaç duymadığınız bir snapshot’ı saklamak yalnızca küçük bir aylık ücrete mal olur. Uyumluluğa duyarlı veriler için, eski snapshot’ları saklamanın maliyeti gerçektir ama genellikle bir denetçi sorduğunda onlara sahip olmamanın maliyetinden azdır. 14 ay önce çalışan bir testten kalan geliştirme snapshot’ları için, hesap diğer yöne gider.

Belirsiz erişim örüntüleri olan dosyalar için EFS Intelligent-Tiering’i etkinleştirirseniz, otomatik katmanlama para tasarrufu sağlar ve sürekli müdahale gerektirmez. Dosyalar tahmin edilebilir şekilde arşiv erişimine doğru eskiyorsa, doğrudan bir yaşam döngüsü kuralı daha basittir. Etkinleştirmeden önce ölçün.

SAA-C03 bağlantısı: Sınav, bir erişim sıklığı senaryosu verildiğinde S3 depolama sınıfları (Standard, IA, Glacier) arasında seçim yapıp yapamadığınızı test eder. Aynı mantık burada da geçerlidir — doğru sınıf, verilere ne sıklıkla erişildiğine bağlıdır.

**İhmalin Maliyeti**

Tom bir tablo oluşturdu. Nimbus’un şunlara ne kadar harcadığını hesapladı:

- Bağlı olmayan EBS birimleri (16 ay): 3.200 dolar
- Eski S3 snapshot’ları (keşfedilip silindi): 890 dolar
- Gereksiz sağlanmış IOPS: 816 dolar
- gp2’den gp3’e geçiş tasarrufları (daha erken yapılsaydı, öngörülen): 18 ayda 346 dolar
- Biriken noncurrent S3 sürümleri: 1.340 dolar
- Tamamlanmamış multipart yüklemeler: 94 dolar

Belirlenen toplam israf: 18 ayda yaklaşık 6.700 dolar.

“Altı bin yedi yüz dolar,” dedi Maya.

“İhmalden,” dedi Tom. “Yanlış mimari kararlar vermekten değil. Temizlik yapmamaktan.”

“Sistematik çözüm ne?”

“Ve,” diye ekledi Tom, “maliyet hijyenini dağıtım sürecinin bir parçası yap. Bir mühendis bir EC2 instance’ını sonlandırdığında, açıkça vazgeçmedikçe EBS birimi otomatik olarak silinir.”

## Güçlü Yönler ve Sınırlamalar

**Maliyet optimizasyonu disiplini**:

- Düzenli incelemeler, önemli hale gelmeden önce biriken israfı yakalar
- Etiketleme hesap verebilirliği sağlar — ekipler kendi maliyetlerini görür
- Otomatik uyarılar faturalama sürprizlerini önler
- Yaşam döngüsü politikaları ve doğru boyutlandırma genellikle ayarla-ve-unut tasarruflarıdır

**Karmaşık hale geldiği yer**:

- Birçok ekibin olduğu büyük bir hesapta israfı belirlemek merkezi araçlar gerektirir
- Bazı israflar kasıtlıdır (ekstra snapshot’ları “her ihtimale karşı” saklamak) — maliyet/risk ödünleşimi bir muhakeme meselesidir
- gp3 geçişi dikkatli doğrulama gerektirir (IOPS ve işlem hacmi varsayılanları bazı uç durumlarda gp2 davranışından farklı olabilir)
- Maliyet tahsis etiketleri tüm ekipler arasında disiplin gerektirir — tutarsız etiketleme veriyi eksik kılar
- Otomatik silme otomasyonu depolama için tehlikelidir — birimler ve snapshot’lar için uyar-ve-gözden-geçir daha güvenlidir

## Özet

Depolama denetimi iki gün sürmüştü. Ortaya çıkardığı israf — 18 aylık görünmez birikimde 6.700 dolar — bir karar verme başarısızlığından çok bir dikkat başarısızlığıydı. Hiçbir şey bilerek yanlış yapılandırılmamıştı. Snapshot’lar, bağlı olmayan birimler, biriken sürüm geçmişi, tamamlanmamış multipart yüklemeler: her biri o zaman mantıklıydı ve sadece bir daha hiç ziyaret edilmedi. Ders, belirli AWS hizmetleriyle ilgili değildi. Bakma alışkanlığını oluşturmakla ilgiliydi.

- **Depolama maliyetleri görünmez bir şekilde birikir** — düzenli denetimler elzemdir.
- **Bağlı olmayan EBS birimleri** yaygın bir israf kaynağıdır. Onları silin (veya instance’lar sonlandığında silmeyi otomatikleştirin).
- **EBS doğru boyutlandırma**: gp2’yi gp3’e geçirin (tipik olarak %20 tasarruf). Fazla sağlanmış IOPS’ı kaldırın.
- **S3 sürümleme**: Sınırsız sürüm geçmişi için ödeme yapmamak adına noncurrent sürümler için yaşam döngüsü kuralları etkinleştirin.
- **Tamamlanmamış multipart yüklemeler**: Her bucket’a bir `AbortIncompleteMultipartUpload` yaşam döngüsü kuralı ekleyin. Bu sıklıkla gözden kaçar ve sessizce birikir.
- **EFS Intelligent-Tiering**: Erişim sıklığına göre dosyaları daha düşük maliyetli katmanlara otomatik olarak taşır. Tahmin edilebilir erişim örüntüleri için manuel yaşam döngüsü kuralları daha ucuz olabilir.
- **Yönetişim**: Bağlı olmayan birimler için 7-14 gün sonra uyarın; bastırmak için açık etiketleme gerektirin. Depolama kaynakları için otomatik silmeden kaçının.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama (Alan 4, Görev 4.1)*

- **Maliyet tahsis etiketleri**: Faturalama konsolunda maliyet tahsisi için Kullanıcı Tanımlı Etiketleri etkinleştirin; sonra kaynakları etiketleyin. Cost Explorer, etikete göre dökümler gösterir. Sınav senaryosu: “en çok S3 maliyetini hangi departmanın oluşturduğunu belirle” → maliyet tahsis etiketleri.
- **AWS Trusted Advisor**: Yetersiz kullanılan EC2 instance’larını, bağlı olmayan EBS birimlerini, boştaki yük dengeleyicileri ve diğer israfları belirler. Temel kontroller ücretsiz; tam kontroller Business/Enterprise Support gerektirir.
- **EBS maliyet bileşenleri**: Depolama (GB başına), sağlanmış IOPS (io1/io2 veya fazladan gp3 ise), işlem hacmi (fazladan gp3 ise). Hangi bileşenlerin doğru boyutlandırılabileceğini bilin.
- **S3 sürümleme maliyetleri**: Noncurrent sürümler saklanır ve güncel sürümlerle aynı oranda ücretlendirilir. Noncurrent sürümlerin süresini dolduran yaşam döngüsü kuralları, sürümlenmiş bucket’larda maliyet kontrolü için kritiktir.
- **AWS Compute Optimizer**: EC2 kullanımını analiz eder ve doğru boyutlandırılmış instance türleri önerir. Sınav sinyali: “doğru instance türünü seçerek EC2 maliyetlerini azalt” → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Olağandışı harcama örüntülerini tespit etmek için ML kullanır. Sınav sinyali: “beklenmedik maliyet artışlarını otomatik olarak tespit et” → Cost Anomaly Detection.
- **Maliyet araçları dizilimi**: interaktif grafikler/tahminler → Cost Explorer. Eşik uyarıları → Budgets. “Özel analiz için (Athena/QuickSight) S3’e teslim edilen en granüler, kaynak düzeyinde/saatlik faturalama verisi” → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: “büyük bir S3 veri kümesini paylaş; tüketiciler kendi indirme maliyetlerini ödesin” → S3 Requester Pays (sahip yalnızca depolama ödemeye devam eder; isteği yapanlar bir AWS hesabıyla kimlik doğrulamalı).

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Bağlı olmayan EBS birimlerinin, hiçbir EC2 instance’ı onları kullanmamasına rağmen neden maliyet oluşturduğunu açıklayın. Mühendisler bu israfı önlemek için bir EC2 instance’ını sonlandırırken hangi süreci izlemeli?

*(İpucu: EBS birimleri verileri fiziksel diskte saklar ve o disk, okunup okunmadığına bakılmaksızın paraya mal olur.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirketin AWS faturası altı ayda 5.000 dolardan 9.000 dolar/aya yükseldi, ama yeni hizmetler eklemediler. Mühendislik ekibi sorunun depolama maliyetleri olduğundan şüpheleniyor. Maliyet artışını belirlemek ve açıklamak için AWS araçlarının hangi kombinasyonu EN İYİ olur?

A) Kaynakları kimin oluşturduğunu belirlemek için API çağrılarını gözden geçirmek üzere AWS CloudTrail  
B) Hizmet düzeyinde maliyet dökümü için AWS Cost Explorer ve boştaki ve bağlı olmayan kaynak tespiti için AWS Trusted Advisor  
C) Kaynak kullanımını izlemek ve maliyet alarmları oluşturmak için Amazon CloudWatch  
D) Tüm kaynakları ve uyumluluk durumlarını belirlemek için AWS Config

**İpucu 1**: “Maliyet artışını belirle” → hizmete göre maliyet dökümünü görselleştir.

**İpucu 2**: “Boştaki ve bağlı olmayan kaynaklar” → belirli bir araç bunları proaktif olarak belirler.

**İpucu 3**: CloudTrail API çağrılarını loglar; Cost Explorer maliyet eğilimlerini gösterir. Maliyet analizi için hangisi daha yararlı?

**Cevap**: B

**Açıklama**: AWS Cost Explorer, hizmete, bölgeye ve kullanım türüne göre dökülmüş maliyet eğilimlerini gösterir — hangi hizmetin artışı yönlendirdiğini belirlemek için mükemmel. AWS Trusted Advisor’ın maliyet optimizasyonu kontrolleri, bağlı olmayan EBS birimlerini, boştaki EC2 instance’larını, yetersiz kullanılan yük dengeleyicileri ve diğer yaygın israf kaynaklarını belirler.

**Neden A değil?** CloudTrail, kaynakları kimin ne zaman oluşturduğunu loglar ama doğrudan maliyet eğilimlerini göstermez veya israfı belirlemez.

**Neden C değil?** CloudWatch, kaynak performansını (CPU, bellek) izler — doğru boyutlandırma için yararlı ama biriken depolama israfını belirlemek için değil.

**Neden D değil?** AWS Config, kaynak yapılandırmalarını ve uyumluluğu izler ama bir maliyet analizi aracı değildir.

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama — Görev 4.1*

**Alıştırma 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus’un S3 faturası, “backups” etiketli bir bucket için 340 dolar/ay gösteriyor. Bucket’ta sürümleme etkin ve şunları içeriyor:

- Günlük veritabanı snapshot’ları (politikaları için 7 gün yeterli)
- Haftalık tam yedeklemeler (3 ay saklanır)
- Üç aylık arşivler (vergi uyumluluğu için 7 yıl saklanır)

Bu bucket için, saklama gereksinimlerini karşılarken maliyeti en aza indiren bir yaşam döngüsü politikası tasarlayın. Her veri türü hangi depolama sınıfını kullanmalı? Eski sürümlerin birikmesini önlemek için sürümlemeyi nasıl ele alırsınız?

*(Tek bir doğru cevap yoktur. Amaç, yaşam döngüsü politikası tasarımı pratiği yapmaktır.)*

## Jenerik Sonrası Sahne

Tom, maliyet denetimi bulgularını ekibe yayınladı.

Belirlenen israf: 18 ayda 6.700 dolar.
Uygulanan değişikliklerden beklenen yıllık tasarruf: 6.200 dolar.

Sonra en alta bir satır ekledi: “Bu, Tasarruf Planları’ndan (14.200 dolar/yıl) veya S3 yaşam döngüsü politikalarından (7.800 dolar/yıl) elde edilen tasarrufları içermiyor. Birleşik yıllık optimizasyon etkisi: yaklaşık 28.200 dolar.”

Maya bunu iki kez okudu.

“Bu neredeyse bir junior mühendis maaşı,” dedi.

“İsraf olarak,” diye onayladı Tom.

“Ya da,” dedi Leo, “bu optimizasyonları daha erken yapmanın o junior mühendisi finanse edeceğinin kanıtı.”

Tom ona baktı.

“Bu konuyu düşünmenin doğru yolu,” dedi. “Maliyet optimizasyonu kesintiyle ilgili değildir. Değer yaratmayan şeyler için ödeme yapmamakla ilgilidir.”

Maya, belgeyi şirket wiki’sine sabitledi.

Bir sonraki bölümde: veritabanı katmanı aynı muameleyi görüyor ve Tom, aslında yetersiz yatırım yaptığı tek yeri keşfediyor.
