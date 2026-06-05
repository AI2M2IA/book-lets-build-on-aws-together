# Bölüm 21: Kod İçin Taşıyıcılar

“Eğer makinemde çalışıyorsa.”

Leo, bu sözü yüksek sesle söylememeyi öğrenmişti. Bu bir savunma değildi — bir teşhis idi. Ve bu teşhis o sırada üç numaralı üretim EC2 örneğiydi, ki bu örnek altı hafta önce kimse belgelememişti, diğer iki örnekte de bulunmayan bir kütüphane yaması almıştı ve şimdi yalnızca orada, o bir örnekte var olan bir sorunu yaratıyordu, başka hiçbir yerde görünmeyen.

Geç saatte üç saat geçirmişti, bu sorunu takip etmeye çalışırken.

“Her seferinde dağıttığımızda,” dedi ertesi sabah, “birden fazla örnekte koordineli çalışırız. Yeni bir sürüm, farklı bağımlılıklar. Stajda çalışır, üretimde bozulur çünkü ortamlar farklılaşır.”

“Bir paket örneği üçte birinin güncellenmesi nedeniyle,” dedi Priya, nazikçe.

“Ben—” dedi,

“Biliyorum,” dedi, “Ve şimdi örnek üç, örnek bir ve iki ile farklı bir tarihe sahip. Bu yapılandırma kaymasıdır. Sessizdir, ancak değildir.”

Lambda, Nimbus’un daha küçük hizmetleri için boşta sunucu sorununu düzeltmişti. Ancak tüm sipariş trafiğini taşıyan temel API yine EC2 üzerindeydi. Ve EC2 örnekleri, işlevler gibi, tarih tutmazdı.

“Gerçek çözüm nedir?” diye sordu Maya.

“Sunucuları kalıcı şeyler gibi davranmayı bırakın,” dedi Priya. “Onları kullanılacak birimler gibi davranmaya başlayın.”

Bu konuyu açıklayan en kesin analoji olduğu için neredeyse her yazılım açıklamasına yerleştirilir. 1956’da ortaya çıkmış ve yazılımdan hiçbir ilgisi yoktur. Bir çözümün ne olduğunu soran birine “farklı taşıyıcılarda malları güvenilir bir şekilde taşımak için çözüm nedir?” sorusuna yanıt, şuydu: Standartlaştırın konteyneri. Kutu, sadece içeriği değil, de gönderilsin.

**Bir Konteyner Nedir?**

Bir **konteyner**, uygulamanızı çalıştırmak için ihtiyaç duyduğu her şeyi içeren hafif, taşınabilir bir birimdir: çalışma zamanı (Python 3.11, Node.js 20, Java 17), kütüphaneler ve bağımlılıklar, yapılandırma dosyaları ve uygulama kodu.

Bir sanal makine (ki tüm bilgisayarın işletim sistemi çekirdeği dahil olmak üzere taklit eder), bir konteyner, ana bilgisayar işletim sistemi çekirdeğini paylaşırken her şeyi izole eder. Bu, konteynerlerin başlamasının hızlı (saniyeler, bazen milisaniyeler) ve küçük (megabaytlar, gigabaytlar değil) olmasını sağlar.

En popüler konteyner teknolojisi **Docker**’dır. Bir Docker imajı, uygulamanın ve ortamının bir şablonu — bir anıdır. Bir Docker konteyneri, bu imajın çalışan bir örneğidir.

Temel özellik: **irredibility (değiştirilemezlik)**. Bugün oluşturulan bir imaj, Docker’ı destekleyen herhangi bir ana bilgisayarda aynı şekilde çalışacaktır — bir dizüstü bilgisayar, bir EC2 örneği, farklı bir veri merkezi içindeki bir sunucu. Ortam yerleştirilmiştir. Yapılandırma kayması imkansızdır.

“Yani EC2 örneğinde ne yüklendiğinden endişelenmek yerine,” dedi Leo, “her yerde aynı şekilde çalışan her şeyi içeren bir imaj oluşturuyoruz.”

“Ve aynı imajı çalıştırman gerekir,” diye ekledi Priya. “‘Eğer makinemde çalışıyorsa’ diye söylemeyeceğiz.”

**Amazon ECS: Orkestratör**

Bir konteynerin çalıştırılması basit. Birkaç konteyneri birden fazla ana bilgisayarda çalıştırmak, trafiği arasında yönlendirmek, başarısız konteynerleri yeniden başlatmak, yeni sürümleri kesintisiz bir şekilde dağıtmak — bunun için bir orkestratör gerekir.

**Amazon ECS (Elastic Container Service)**, AWS’nin yönetilen konteyner orkestrasyon hizmetidir. Tanımlamanız gerekenler:

- **Görev tanımı**: Çalıştırılacak konteyner imajı, kullanılan CPU ve bellek, ortam değişkenleri, açılacak portlar
- **Hizmet**: Görevlerin sayısı, başarısızlık ve dağıtımlar için nasıl ele alınır
- **Küme**: Yürütme altyapısı

ECS, geri kalanını halleder: görevleri mevcut kapasitede yerleştirir, başarısız görevleri yeniden başlatır, dağıtımlar sırasında bağlantıları keser, sağlıklı görevleri yük dengeleyicide kaydeder.

Nimbus için API, manuel yönetimli dağıtımlar ile EC2 örneklerinde bulunan API’den değişti. Her yeni dağıtım, yeni bir Docker imajını **Amazon ECR (Elastic Container Registry)**’e (AWS’nin yönetilen konteyner kayıt alanı) gönderdi ve ECS, kesintisiz bir şekilde dağıtımını gerçekleştirdi.

**Fargate vs EC2 Başlangıç Tipi**

ECS, konteynerleri iki modda çalıştırabilir:

**EC2 başlangıç tipi**: Temel EC2 örneklerini yönetirsiniz. Örnekleri yamalamanızı, boyutlandırmanızı ve konteynerleriniz için yeterli kapasiteyi sağlamanızı sağlamalısınız. Daha fazla kontrol, daha fazla sorumluluk.

**Fargate (Konteynerler için sunucu katmanı olmayan hesaplama)**: Temel altyapıyı AWS tamamen yönetir. CPU ve her görev için bellek miktarını belirtirsiniz; Fargate, doğru kapasiteyi otomatik olarak sağlar. Yönetilmesi gereken hiçbir EC2 örneği yoktur. Birim başına vCPU-saniye ve GB-saniye cinsinden ödeme yaparsınız.

Fargate, konteynerlerin sunucu katmanı olmadan ortam izolasyonunu elde ettiğiniz “sunucu katmanı olmayan konteynerler” modelidir — sunucuları yönetmeden ortam izolasyonunu elde edersiniz. Ticaret: temel örnek yapılandırması üzerinde daha az kontrol ve biraz daha yüksek birim başına maliyet.

For Nimbus: Fargate için API hizmeti. EC2 örneklerini yönetmek istemiyorlardı.

**Amazon EKS: Kubernetes'e İhtiyacınız Olduğunda**

**Kubernetes** açık kaynaklı bir kap container orkestrasyon sistemi — esasen ölçekte kap container'ları yönetmek için endüstri standardı. Güçlü, genişletilebilir ve karmaşık.

**Amazon EKS (Elastic Kubernetes Hizmeti)**, AWS'nin yönetilen Kubernetes hizmetidir. Kubernetes kontrol düzlemini (yönetim katmanı) sizin için çalıştırırken, worker düğümlerini (veya bunları da kullanarak Fargate) siz yönetirsiniz.

Ne zaman EKS'i ECS'ye karşı kullanmalıyız?

**ECS'yi kullanın** eğer:

- Öncelikle AWS üzerindeyseniz ve daha basit, daha AWS'ye özgü bir deneyim istiyorsanız
- Ekibinizde mevcut Kubernetes uzmanlığı yoksa
- Daha az operasyonel yük anlamına geliyor

**EKS'i kullanın** eğer:

- Kubernetes'e özgü özelliklere ihtiyacınız varsa (Özel Kaynak Tanımları, Helm şemaları, Kubernetes ekosistemi)
- Ekibiniz Kubernetes'i zaten biliyor
- Bazı iş yükleri yerinde ve bazıları AWS'de olacak bir hibrit ortamda çalışıyorsanız ve tutarlı bir orkestrasyon katmanı istiyorsanız
- İş yükünüz Kubernetes'in genişletilebilirliğine uyan gereksinimlere sahipse

"Bunu kullanacağımızı seçmeliyiz?" diye sordu Maya.

"ECS," dedi Priya hemen. "Bizim Kubernetes uzmanlığımız yok. ECS'nin ihtiyacımız olan her şeyi yapıyor. Şu anda Kubernetes eklemek, pratik bir fayda sağlamadan operasyonel karmaşıklığı artırmaktır."

"Daha sonra EKS'ye geçebiliriz," diye ekledi Leo.

Bu, doğru bir kıdemli cevabıdır: Mevcut ihtiyaçlarınıza uyan daha basit aracı seçin.

**Kap Container'ları Dağıtım Liderliği Değiştiriyor**

Önceki kap container'ları dönemlerinde, Nimbus API'nin yeni bir sürümünü dağıtmak şu anlama geliyordu:

1. Her EC2 örneğine SSH yapın
2. Git'ten en son kodu çekin
3. Bağımlılıkları yükleyin/güncelleyin
4. Uygulama sürecini yeniden başlatın
5. Sağlık durumunu doğrulayın
6. Bir sonraki örneğe geçin

Bu, hataya açık ve yavaştı. Koordinasyon gerektiriyordu. Adım 3'ün 4. örneğe başarısız olması durumunda, bazı örnekler eski sürümü çalıştırırken bazıları yeni sürümü çalıştıramadı.

ECS ve kap container'ları ile:

1. Yeni bir Docker imajı oluşturun (CI/CD boru hattında otomatikleştirilir)
2. ECR'ye yükleyin
3. ECS hizmetini yeni imaj sürümünü kullanacak şekilde güncelleyin

ECS, yeni imajla görevlerin sağlıklı hale gelmesini bekleyerek yeni imaja sahip görevlerin başlatılmasını, sağlıklı hale gelmelerini ve eski görevlerin durdurulmasını yönetir. Kesintisiz dağıtım, otomatikleştirilmiştir.

Eğer yeni sürüm sağlık kontrollerini geçersiz kılıyorsa, ECS dağıtımı durdurur ve eski sürüm trafiği hizmetine devam eder.

## Güçlü ve Zayıf Yönler

**Kap Container'ları:**

- Ortam tutarsızlığı ("makinemde çalışıyor") sorununu ortadan kaldırır
- Hızlı, güvenilir dağıtımlar sağlar
- Sabit — aynı imaj her yerde aynı şekilde çalışır
- Verimli — sanal makinelerden daha hafiftir, daha hızlı başlatılır

**ECS:**

- Kubernetes için daha basittir AWS odaklı iş yükleri için
- AWS entegrasyonu (IAM, ALB, CloudWatch, Secrets Manager)
- Fargate seçeneği EC2 yönetimi tamamen ortadan kaldırır

**EKS:**

- Tam Kubernetes uyumluluğu — tüm ekosistemi kullanın
- Hibrit ortamlar veya Kubernetes uzmanlığı olan ekipler için daha iyidir
- ECS'ye göre daha fazla kurulum ve işletme karmaşıklığı

**Karmaşıklık Ortaya Çıkıyor:**

- Kap container'ları imajları oluşturulmalı ve versiyonlanmalı — bir CI/CD boru hattı gerektirir
- Kap container'larını hata ayıklamak geleneksel süreçlerdeki hata ayıklamadan farklı araçlar gerektirir
- Durumlu kap container'ları (veritabanları kap container'larında) dikkatli kalıcı depolama yapılandırması gerektirir
- Kap container'ları (hizmetten hizmete iletişim) kap container'ları ağlama kavramlarını anlamayı gerektirir

## Özeti

- **Kap Container'ları**, uygulama kodunu, çalışma zamanını ve bağımlılıkları birlikte paketler — her yerde aynı şekilde çalışır.
- **Docker**, standart kap container teknolojisidir. İmajler şemaları; kap container'ları çalışan örneklere karşılık gelir.
- **ECR (Elastic Container Registry)**, AWS'nin yönetilen Docker kayıt defteridir — imajlerinizi burada saklayın ve versiyonlayın.
- **ECS (Elastic Container Service)**, kap container'larını orkestre eder. Görevleri ve hizmetleri tanımlarsınız; ECS yerleştirme ve yaşam döngüsü yönetimi yapar.
- **Fargate**, kap container'ları için sunucusuz hesaplamadır — EC2 örneklerini yönetmenize gerek yoktur.
- **EKS (Elastic Kubernetes Hizmeti)**, yönetilen Kubernetes — Kubernetes özelliklerine veya uyumluluğuna ihtiyaç duyan ekipler için.
- Basitlik için ECS'yi seçin AWS'de; Kubernetes ekosistemi uyumluluğu için EKS'yi seçin.

## Sınav İpuçları

*SAA-C03 Alan: Dirençli Mimarileri Tasarlayın (Alan 2, Görev 2.1)*

- **ECS ile EKS sinyalleri**: “Kubernetes”, “Helm”, “varolan Kubernetes uzmanlığı” veya “çoklu bulut konteyner orkestrasyonu” ifadelerini içeren sınav senaryoları → EKS. Her şeyin geri kalanı → ECS.
- **Fargate ile EC2 başlatma türü**: “Konteynerler için EC2 örneklerini yönetmek istemiyorum”, “sunucusuz konteynerler”, “alt yapı yönetimi yok” → Fargate. “Belirli örnek türlerine ihtiyaç duyuyoruz”, “GPU iş yükleri”, “örnek kontrolünde ince taneli” → EC2 başlatma türü.
- **ECS görev rolleri**: EC2 örnekleri gibi, ECS görevlerinin de IAM rolleri vardır. Her görev farklı izinlere sahip olabilir. Sınav senaryosu: “konteyner S3’ten okumalıdır” → görev tanımına bir IAM rolü ekleyin.
- **ECR görüntü taraması**: ECR, bilinen güvenlik açıklarını (CVE’ler) içeren konteyner görüntülerini tarayabilir. Sınav sinyali: “güvenlik açıkları için konteynerleri tarayın” → ECR görüntü taraması.
- **Mavi/yeşil dağıtımlar**: ECS, CodeDeploy entegrasyonu aracılığıyla mavi/yeşil dağıtımları destekler. Sıfır kesinti dağıtımı ve otomatik geri alma. Sınav deseni: “kesinti olmadan dağıtın ve otomatik geri almayı kullanın” → ECS + CodeDeploy mavi/yeşil.
- **ECS Hizmet Otomatik Ölçeklendirme**: Görev sayısını CPU, bellek veya CloudWatch’tan özel metrikler temelinde ölçeklendirin. Trafiği doğru sayıda çalışan görevlere yönlendirmek için ALB ile çalışır.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Docker imajı ve Docker konteynerinin farkını açıklayın. ECS ve ECR arasındaki farkı açıklayın.

*(İpucu: İmaj, pişirilmiş bir yemek için bir tarif ise, konteyner o yemeğin kendisidir. ECR imajları depolar; ECS bunları çalıştırır.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, manuel olarak yönetilen EC2 örneklerinde çalışan bir mikroservis uygulamasına sahiptir. Takım, tutarsız dağıtımlar konusunda mücadele ediyor — farklı EC2 örneklerinde farklı kütüphane sürümleri nedeniyle zorlu, yeniden üretilemeyen hatalar ortaya çıkıyor. Temel sunucuların yönetiminde operasyonel yükü en aza indirmek istiyorlar. Kubernetes deneyimleri yok.

Bu gereksinimleri en iyi karşılayan çözüm hangisidir?

A) AWS Systems Manager Patch Manager ile tutarlı tutmak için EC2 üzerinde dağıtın.
B) Uygulamayı Docker ile paketleyin; Amazon ECS ile Fargate başlatma türünü kullanın.
C) Uygulamayı Docker ile paketleyin; Amazon EKS ile kendi yönetilen düğüm gruplarını kullanın.
D) Dağıtımları ve örnek yapılandırmasını otomatik olarak yönetmek için AWS Elastic Beanstalk'ı kullanın.

**İpucu 1**: Konteynerler, “tutarsız ortam” sorununu doğrudan çözer. Hangi seçenekler konteynerleri kullanır?

**İpucu 2**: “Alt yapı yönetimi için operasyonel yükü en aza indirin” → Fargate (EC2 yönetimi yok) vs kendi yönetilen düğümler (yine düğümleri yönetirsiniz).

**İpucu 3**: “Kubernetes deneyimi yok” → EKS, ECS’den daha fazla operasyonel karmaşıklıktır.

**Cevap**: B

**Açıklama**: Docker ile paketleme, aynı imajı aynı bağımlılıklarla kullanarak her dağıtımın aynı ortamı sağlamasını sağlar — yapılandırma kaymasını ortadan kaldırır. ECS ile Fargate, EC2 örneklerini yönetme ihtiyacını ortadan kaldırır. Takım, uygulama koduna ve konteyner tanımlarına odaklanır, sunucu bakımı değil. ECS (EKS değil), Kubernetes deneyimi olmayan ekipler için uygundur.

**Neden A?** Patch Manager, EC2 örneklerini güncel tutar, ancak uygulama sürücü tutarsızlığı sorunu çözmez. Temel sorun (farklı kod ortamları farklı örneklerde) hala mevcuttur.

**Neden C?** EKS ile kendi yönetilen düğüm gruplarını kullanmak, EC2 örneklerini yönetme ve Kubernetes’i öğrenme gereksinimini içerir. Her ikisi de gereksinimleri karşılamaz.

**Neden D?** Beanstalk, EC2 üzerinde uygulama dağıtımını yönetir, ancak konteynerler kullanılırdıysa temel ortam tutarsızlığı çözmez. Beanstalk varsayılan olarak Docker imajlarını kullanmaz (ancak yapılandırılabilir).

*SAA-C03 Alanı: Dayanıklı Mimarileri Tasarla — Görev 2.1*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, API’yi üç mikroservise bölüyor: sipariş servisi, menü servisi ve bildirim servisi. Her servis farklı ölçekleme gereksinimlerine sahiptir (sipariş servisi trafiğe göre ölçeklenir; menü servisi çoğunlukla okuma-sadece ve kararlıdır; bildirim servisi ani patlamalara sahiptir).

Bu üç servis için ECS mimarisini tasarlayın. Servisler arasındaki iletişimi nasıl ele alırsınız? Tek bir ECS kümesi mi kullanırsınız, yoksa üç mü? Her servis için Otomatik Ölçeklendirmeyi nasıl yapılandırırsınız?

*(Tek doğru cevap yoktur. Amaç, ECS üzerinde mikroservis mimarisi uygulamaktır.)*

## Kredi Sonrası Sahne

İlk konteyner dağıtımı kusursuzdu.

API’nin yeni sürümü: kesinti yok. ECS bunu dağıttı, sağlık kontrolleri geçti, eski görevler boşaltıldı, yeni görevler başladı. Leo konsoldan görev durumunu neredeyse inanamaz bir şekilde izledi.

“Sadece çalıştı,” dedi.

“Bu noktadır,” Priya dedi.

“SSH yok. Kesinti yok. ‘Bekle, yeniden başlatılana kadar’ yok.”

“İmaj, dağıtım aracıdır,” dedi. “Ortam kalıcıdır. Dağıtım süreci açıklayıcıdır. Yazılım bu şekilde gönderilmelidir.”

Leo konsolu bir an daha baktı.

"Üç yıl boyunca EC2 dağıtımlarını koordine ettiğini söyledi," dedi. "SSH betiklerini koordine etti. Dağıtım kılavuzları yazdı."

"Sen bir sorun çözüyordun," dedi Priya, "ve konteynerler bu konuda tasarruflarıyla çözüyor."

O, o andan sonra bir şey söylemedi. Ancak ertesi sabah, konteyner oluşturma sürecine dair dokümantasyon yazmaya başladı, böylece kimsenin üç yıl boyunca bu konuda uğraşmasına gerek kalmazdı.

Bir sonraki bölümde: kendiliğinden çalışan şema – ve durduğunda nerede olduğunu hatırlayan.
