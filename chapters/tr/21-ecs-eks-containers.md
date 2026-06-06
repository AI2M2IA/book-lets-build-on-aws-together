# Bölüm 21: Kod İçin Nakliye Konteynerleri

1956'dan önce, bir gemiye yük yüklemek yetenek gerektiren ve özel bir pazarlık işiydi. Her geminin farklı ambarları vardı. Her limanda farklı vinçler vardı. Her taşıyıcının neyin nereye gittiğini izlemek için farklı sistemleri vardı. Bir mal sandığı, hepsini farklı şekilde elleyen bir insan zinciri boyunca kamyondan iskeleye, gemiye, iskeleye, kamyona taşınırdı. Yükler kaybolurdu. Yükler hasar görürdü. Aynı mallar, iki kez gönderildiğinde, elleme her seferinde farklı olduğu için farklı durumda varırdı.

Birisi sonunda bunu açıkça sorduğunda cevap şuydu: konteyneri standartlaştırın. Sorunu her limanda çözmeyin. Onu bir kez, konteyner düzeyinde çözün. İçeriği değil, kutuyu gönderin.

Standartlaştırılmış nakliye konteyneri sadece nakliyeyi daha hızlı yapmadı. Nakliyeyi *öngörülebilir* kıldı. Şangay'daki bir konteynerin içeriği, Rotterdam'a vardığında tam olarak aynı durumdaydı—çünkü konteyner onları her aktarma noktasındaki değişkenlikten korudu.

Leo'nun sahip olduğu sorun tam olarak buydu. Nimbus API her "limanda" farklı şekilde "yükleniyordu": hazırlık (staging) üretimden farklı dağıtılıyordu, birinci örnek üçüncü örnekten farklı dağıtılıyordu ve altı haftalık belgelenmemiş değişiklikler filoyu öngörülemez kılmıştı.

Konteyner, Leo'yu daha hızlı bir geliştirici yapmayacaktı. Dağıtımları öngörülebilir kılacaktı.

---

Lambda göçü, küçük hizmetler için EC2 faturasını azaltmıştı. Ama temel API farklıydı—sürekli çalışıyordu, tüm sipariş trafiğini taşıyordu ve sekiz aydır yapılandırma geçmişi biriktiriyordu. Lambda boştalığı çözdü. Konteynerler tutarsızlığı çözecekti.

Temel API boşta değildi; Lambda'ya taşınamazdı. Ama farklı bir sorunu vardı: onu çalıştıran EC2 örnekleri birbirinden ayrışmıştı.

---

Leo "benim makinemde çalışıyor" demeyi yüksek sesle söylememeyi öğrenmişti. Bu bir savunma değildi—bir teşhisti. Ve bu seferki teşhis, altı hafta önce kimsenin belgelemediği, diğer iki örneğin almadığı bir kütüphane yaması almış olan ve şimdi yalnızca orada, o tek örnekte var olan, başka her yerde görünmez bir hataya neden olan üç numaralı üretim EC2 örneğiydi.

Bir önceki gece onu bulmak için üç saat harcamıştı.

"Her dağıtım yaptığımızda," dedi ertesi sabah, "birden fazla örnek arasında koordinasyon yapıyoruz. Yeni sürüm, farklı bağımlılıklar. Hazırlıkta çalışıyor, üretimde bozuluyor çünkü ortamlar ayrışmış."

"Çünkü birisi diğerlerini güncellemeden üç numaralı örnekte bir paket güncelledi," dedi Priya. Kötü niyetle değil.

"Belirli bir sürüme ihtiyacım vardı—"

"Biliyorum," dedi. "Ve şimdi üç numaralı örneğin bir ve iki numaralı örnekten farklı bir geçmişi var. Bu yapılandırma kaymasıdır (configuration drift). Olana kadar sessizdir."

"Gerçek çözüm ne?" diye sordu Maya.

"Sunucuları yapılandırdığınız kalıcı şeyler gibi görmeyi bırakın," dedi Priya. "Onları değiştirdiğiniz tek kullanımlık birimler gibi görmeye başlayın."

**Konteyner Nedir?**

"Bir nakliye konteyneri gibi düşünün," dedi Leo, bir kalem alarak. "Konteyner hangi gemide olduğunu umursamaz. Gemi konteynerde ne olduğunu umursamaz. Boyutlar ve kilitleme mekanizması üzerinde anlaştılar. Geri kalan her şey kutunun içinde."

Bir **konteyner**, uygulamanızı çalışması için ihtiyaç duyduğu her şeyle birlikte paketleyen hafif, taşınabilir bir birimdir: çalışma zamanı (Python 3.11, Node.js 20, Java 17), kütüphaneler ve bağımlılıklar, yapılandırma dosyaları ve uygulama kodunun kendisi.

Bir sanal makinenin (işletim sistemi çekirdeği dahil tüm bir bilgisayarı taklit eden) aksine, bir konteyner geri kalan her şeyi izole ederken ana işletim sistemi çekirdeğini paylaşır. Bu, konteynerleri başlatmayı hızlı (saniyeler, bazen milisaniyeler) ve küçük (gigabaytlar değil, megabaytlar) yapar.

En popüler konteyner teknolojisi **Docker**'dır. Bir Docker imajı taslaktır—uygulamanın ve ortamının bir anlık görüntüsü. Bir Docker konteyneri, o imajın çalışan bir örneğidir.

Temel özellik: **değişmezlik (immutability)**. Bugün oluşturulan bir imaj, Docker'ı destekleyen herhangi bir ana bilgisayarda aynı şekilde çalışır—bir dizüstü, bir EC2 örneği, farklı bir veri merkezindeki bir sunucu. Ortam içine gömülmüştür. Yapılandırma kayması imkânsızdır.

"Yani EC2 örneğinde ne yüklü olduğu konusunda endişelenmek yerine," dedi Leo, "her şeyi içeren bir imaj oluşturuyoruz. İmaj her yerde aynı şekilde çalışır."

"Ve onu yerel olarak test etmen gerekirse, aynı imajı çalıştırırsın," diye ekledi Priya. "Artık 'benim makinemde çalışıyor' yok."

**Docker İmajını Oluşturma ve ECR'ye Gönderme**

Herhangi bir orkestratör konteyneri yönetebilmeden önce, Leo onu oluşturmak ve ECS'nin çekebileceği bir yere saklamak zorundaydı.

Dockerfile'ı yazdı:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Anahtar satır: `FROM python:3.11-slim`. Python 3.9 değil. Python 3.10 değil. 3.11—ekibin üzerinde anlaştığı belirli sürüm, imaja gömülü. Bu imajı çalıştıran her örnek tam olarak Python 3.11 kullanacaktı. Ondalık modülünün yuvarlama davranışı her yerde aynı olacaktı.

İmajı yerel olarak oluşturdu: `docker build -t nimbus-api:1.0.0 .`

Derleme 4 dakika sürdü. Docker temel imajı çekti, bağımlılıkları yükledi, uygulama kodunu kopyaladı ve `nimbus-api:1.0.0` etiketli bir imaj üretti.

Onu yerel olarak çalıştırdı: `docker run -p 8000:8000 nimbus-api:1.0.0`

API başladı. Üretim sunucusuyla aynı bağlantı noktası, aynı davranış—çünkü ortam aynıydı.

Sonra onu ECR'ye gönderdi:

```bash
# Docker'ı ECR'ye kimlik doğrula
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# İmajı ECR için etiketle
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Gönder
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Gönderme 2 dakika sürdü. ECR imajı sakladı, hemen bir imaj taraması tetikledi ve 5 dakika içinde sonuçları bildirdi.

**Amazon ECS: Orkestratör**

Bir konteyner çalıştırmak basittir. Birden fazla ana bilgisayar arasında düzinelerce konteyner çalıştırmak, aralarında trafiği yönlendirmek, başarısız konteynerleri yeniden başlatmak, yeni sürümleri kesinti olmadan dağıtmak—bu bir **orkestratör** gerektirir.

**Amazon ECS (Elastic Container Service)**, AWS'nin yönetilen konteyner orkestrasyon hizmetidir. Şunları tanımlarsınız:

- **Görev tanımı (task definition)**: Hangi konteyner imajının çalıştırılacağı, ne kadar CPU ve bellek, hangi ortam değişkenleri, hangi bağlantı noktalarının açılacağı
- **Hizmet (service)**: Görevin kaç kopyasının çalıştırılacağı, arızaların ve dağıtımların nasıl ele alınacağı
- **Küme (cluster)**: Temel işlem altyapısı

ECS geri kalanını halleder: görevleri kullanılabilir kapasiteye yerleştirme, başarısız görevleri yeniden başlatma, dağıtımlar sırasında bağlantıları boşaltma, sağlıklı görevleri yük dengeleyiciye kaydetme.

Nimbus için, API manuel yönetilen dağıtımlara sahip EC2 örneklerinden ECS'ye taşındı. Her yeni dağıtım yeni bir Docker imajını **Amazon ECR (Elastic Container Registry)**'ye—AWS'nin yönetilen konteyner kayıt defteri—gönderdi ve ECS onu tüm görevler arasında sıfır kesintiyle yaydı.

**Fargate vs EC2 Başlatma Türü**

ECS konteynerleri iki modda çalıştırabilir:

**EC2 başlatma türü**: Temel EC2 örneklerini siz yönetirsiniz. Örnekleri yamalamaktan, doğru boyutlandırmaktan ve konteynerleriniz için yeterli kapasite olmasını sağlamaktan sorumlusunuz. Daha fazla kontrol, daha fazla sorumluluk.

**Fargate (konteynerler için sunucusuz işlem)**: AWS temel altyapıyı tamamen yönetir. Görev başına CPU ve bellek belirtirsiniz; Fargate doğru kapasiteyi otomatik olarak temin eder. Yönetilecek EC2 örneği yok. vCPU-saniye ve GB-saniye bellek başına ödersiniz.

Fargate "sunucusuz konteynerler" modelidir—sunucuları yönetmeden konteynerlerin ortam izolasyonunu elde edersiniz. Takas: temel örnek yapılandırması üzerinde daha az kontrol ve biraz daha yüksek birim başına maliyet.

"Bu ayda ne kadara mal oluyor?" diye sordu Tom, fiyatlandırma hesaplayıcısını açarak. "Fargate'e karşı EC2 başlatma türü—gerçek sayıları görmek istiyorum."

Leo'nun içgüdüsel tahmini—herkesin taşıdığı tahmin—Fargate'in daha pahalı olacağıydı. Sunucusuz kolaylık, premium fiyat. Belki EC2'nin yüzde yirmi veya otuz üzerinde olacağını tahmin etti.

"Gerçek sayıları çalıştır," dedi Tom, çünkü Tom buydu.

Nimbus API hizmeti, her biri 0,5 vCPU ve 1GB bellek gerektiren 3 görev, 7/24 çalışıyordu:

**Fargate**: 0,04048 $/vCPU-saat × 0,5 × 3 × 720 saat = CPU için ayda 43,72 $. 0,004445 $/GB-saat × 1 × 3 × 720 = bellek için ayda 9,60 $. Toplam: ayda 53,32 $.

**EC2 başlatma türü** (0,0416 $/saatten 3 × t3.medium): 0,0416 $ × 3 × 720 = ayda 89,86 $.

"Dur," dedi Tom. "Fargate daha mı ucuz?"

"Bu boyutta, evet," dedi Leo. "Fargate tam olarak tahsis ettiğiniz şey için ücret alır. EC2 örneklerinin ek yükü vardır—işletim sistemi ve ECS aracısı, konteynerleriniz başlamadan önce biraz CPU ve bellek tüketir. Bir t3.medium 2 vCPU ve 4GB verir, ama konteyner başına 0,5 vCPU ve 1GB kullanıyorsunuz. Geri kalanı boşa gidiyor."

"Ama EC2 başlatma türü, bir örneğe birden fazla görev paketlemenize izin verir."

"Evet. Daha büyük ölçeklerde, dikkatli kutu paketlemeyle (bin-packing), EC2 başlatma türü daha ucuz hâle gelir. Bizim ölçeğimizde—üç görev—Fargate kazanır."

Tom bunu not aldı.

Nimbus için: API hizmeti için Fargate. Konteynerler için EC2 örneklerini yönetmek istemiyorlardı.

Fargate ile konteynerleştirirseniz, tüm EC2 yönetim ek yükünü ortadan kaldırırsınız—ama GPU iş yükleri veya özelleşmiş ağ için önemli olan örnek türlerini özelleştirme yeteneğinden vazgeçersiniz. AWS-yerel basitliği için ECS'yi seçerseniz, sıkı IAM ve ALB entegrasyonu kazanırsınız—ama Kubernetes ekosisteminden kilitlenirsiniz, ki daha sonra çoklu bulut taşınabilirliğine ihtiyaç duyarsanız yeniden mimari gerektirir.

**Amazon EKS: Kubernetes'e İhtiyaç Duyduğunuzda**

**Kubernetes** açık kaynaklı bir konteyner orkestrasyon sistemidir—esasen konteynerleri ölçekte yönetmek için endüstri standardı. Güçlü, genişletilebilir ve karmaşık.

**Amazon EKS (Elastic Kubernetes Service)**, AWS'nin yönetilen Kubernetes hizmetidir. Kubernetes kontrol düzlemini (yönetim katmanı) sizin için çalıştırır, siz ise işçi düğümlerini yönetirsiniz (veya onlar için de Fargate kullanırsınız).

Şunu merak ediyor olabilirsiniz: Kubernetes endüstri standardıysa ve her iş ilanı ondan bahsediyorsa, neden sadece onu kullanmayalım? Çünkü "endüstri standardı," özel platform ekiplerine sahip büyük şirketlerin ne kullandığını tanımlar. Bir yemek sipariş uygulaması inşa eden altı kişilik bir ekip için, Kubernetes şu anda hiçbir pratik fayda olmadan operasyonel karmaşıklık ekler. Karmaşıklık gerçektir; fayda bu ölçekte teoriktir.

Kubernetes, çoğu ekibin ihtiyaç duymadığı bir karmaşıklık düzeyinde değer sağlar: dahili platformlar oluşturmak için özel kaynak tanımları, gelişmiş zamanlama kısıtlamaları, ince taneli dağıtım kontrolü için pod kesinti bütçeleri ve yüzlerce mikroservis arasında trafik yönetimi için hizmet ağı (service mesh) entegrasyonu. Bunlar gerçek yeteneklerdir. Aynı zamanda Nimbus boyutundaki bir girişimin asla kullanmayacağı yeteneklerdir.

Buradaki mühendislik ilkesine bazen YAGNI denir: You Aren't Gonna Need It (Buna İhtiyacın Olmayacak). ECS, Nimbus'a şu anda ihtiyaç duydukları her şeyi verir. EKS onlara ihtiyaç duyduklarından fazlasını, artı önemli bir öğrenme eğrisi ve operasyonel ek yük verir. "Daha sonra faydalı olur" şimdi karmaşıklık eklemek için iyi bir neden değildir.

EKS'yi ne zaman ECS'ye karşı kullanmalısınız?

**Şu durumda ECS kullanın**:

- Öncelikle AWS'desiniz ve daha basit, daha AWS-yerel bir deneyim istiyorsunuz
- Ekibinizin mevcut Kubernetes uzmanlığı yok
- Daha az operasyonel ek yük istiyorsunuz

**Şu durumda EKS kullanın**:

- Kubernetes'e özgü özelliklere ihtiyacınız var (Özel Kaynak Tanımları, Helm grafikleri, Kubernetes ekosistemi)
- Ekibiniz zaten Kubernetes biliyor
- Hibrit bir ortam çalıştırıyorsunuz (bazısı şirket içi, bazısı AWS'de) ve tutarlı bir orkestrasyon katmanı istiyorsunuz
- İş yükünüzün Kubernetes'in genişletilebilirliğine uyan gereksinimleri var

**Konteyner Ağı: Geçici IP'ler ve Hizmet Keşfi**

Konteynerlere geçerken ekipleri gafil avlayan bir şey: bir konteynerin IP adresi her yeniden başlatıldığında değişir.

EC2 dünyasında, örneklerin nispeten kararlı özel IP'leri vardı. Onları yapılandırma dosyalarına sabit kodlayabilirdiniz (yapmamanız gerekse de). Hizmetler birbirini IP ile tanırdı.

Konteyner dünyasında, ECS'deki her görev başladığında VPC alt ağından bir IP alır. Durduğunda ve yeni bir görev başladığında (bir dağıtımın veya yeniden başlatmanın parçası olarak), o yeni görev farklı bir IP alır.

"Bir hizmet `10.0.1.45`'i çağırmak için sabit kodlandığında ve o konteyner `10.0.1.82` ile değiştirildiğinde ne olur?" diye sordu Priya. "Çağıran hizmet hiçbir şeye ulaşmaya başlar."

İşte bu yüzden konteyner ortamlarında hizmet keşfi (service discovery) önemlidir. ECS + Application Load Balancer bunu otomatik olarak halleder: ALB'nin DNS adı kararlıdır; ECS sağlıklı görevleri hedef gruba kaydeder; ALB şu anda sağlıklı olan görevlere yönlendirir. Çağıran hizmet, bireysel konteyner IP'lerine değil, ALB DNS adına konuşur.

Dahili hizmetten hizmete iletişim için (kullanıcıya dönük olmayan), **AWS Cloud Map** hizmet keşfi sağlar: her ECS hizmeti Cloud Map'e kaydolur, bu da kararlı bir DNS adı sağlar. Sipariş hizmeti `http://notification.nimbus.local:8080`'i çağırır ve Cloud Map bunu bildirim hizmetinde şu anda sağlıklı olan görevlere çözer.

"Yani konteynerler birbirleriyle IP'ler aracılığıyla değil, DNS adları aracılığıyla mı konuşuyor?" diye onayladı Leo.

"Doğru. IP geçicidir. DNS adı sözleşmedir."

**Gizli Bilgi Enjeksiyonu: Ortam Değişkenlerinde Gizli Bilgi Yok**

Orijinal EC2 dağıtımının Priya'nın aylardır işaret ettiği bir sorunu vardı: gizli bilgiler (veritabanı parolası, API anahtarları, SES kimlik bilgileri) EC2 örneğindeki ortam değişkenlerinde saklanıyordu, bir dağıtım komut dosyasıyla ayarlanıyordu.

Ortam değişkenleri, örnekte çalışan herhangi bir süreç tarafından erişilebilir. Ayıklama araçlarında, bazı çökme raporlarında ve süreç listelerinde görünürler. Onları günlüğe kaydederseniz (bazı geliştirme araçları varsayılan olarak yapar) CloudWatch'ta da görünürler.

Konteynerler bunu otomatik olarak çözmez—gizli bilgileri ECS görev tanımında ortam değişkenleri olarak hâlâ iletebilirsiniz. Ve ECS görev tanımları AWS konsolunda saklanır, ECS erişimi olan herkese görünür.

Doğru kalıp: **AWS Secrets Manager + ECS görev tanımı entegrasyonu**.

Veritabanı parolasını görev tanımında saklamak yerine:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS, gizli bilgiyi görev başlatma zamanında Secrets Manager'dan alır ve onu konteynere bir ortam değişkeni olarak enjekte eder. Gizli bilgi değeri görev tanımında asla saklanmaz—yalnızca Secrets Manager gizli bilgisinin ARN'si. Konteyner değeri çalışma zamanında alır. Secrets Manager değeri görev tanımını değiştirmeden döndürebilir.

"Peki birisi görev tanımını okursa?" diye sordu Priya. "Secrets Manager ARN'sini görürler, ama değeri değil."

"Ve doğru IAM izinleri olmadan," diye onayladı Leo, "değeri Secrets Manager'dan da alamazlar."

"Tasarım bu," dedi Priya. "Görevin yürütme rolünün o belirli gizli bilgiyi okuma izni var. Başka hiçbir şey. Görev tanımını ele geçirmek size bir parola değil, bir ARN verir."

"Hangisini kullanmalıyız?" diye sordu Maya. "Ve neden Kubernetes değil? Her iş tanımında var. Her konferans konuşmasında."

"ECS," dedi Priya hemen. "Kubernetes uzmanlığımız yok. ECS ihtiyacımız olan her şeyi yapıyor. Şu anda Kubernetes eklemek, hiçbir pratik fayda olmadan operasyonel karmaşıklık eklemek olur."

Son şirketinde Kubernetes kümeleri çalıştırmış olan Soo-Jin başını salladı. "O çağrı cihazını taşıdım. İhtiyaç duyana kadar onu istemezsiniz."

"ECS'yi aşarsak daha sonra her zaman EKS'ye geçebiliriz," diye ekledi Leo.

Bu doğru bir kıdemli cevaptır: mevcut ihtiyaçlarınıza uyan daha basit aracı seçin.

**ECR: İmajlarınızı Güvene Alma**

"Peki birisi savunmasız bir temel imaj aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "Birisi bilinen bir CVE'ye sahip eski bir imaj kapıp onu uygulama konteynerinde bir dayanak noktası elde etmek için kullanırsa?"

Üretimde herhangi bir konteyner dağıtmadan önce sorulması gereken doğru soruydu.

**Amazon ECR (Elastic Container Registry)**, Docker imajlarınızı saklar ve onları dağıtımdan önce bilinen güvenlik açıkları için tarayabilir. ECR imaj taraması, imajı bilinen CVE'ler (Common Vulnerabilities and Exposures) veritabanına karşı kontrol eder ve sorunları önem derecesine göre işaretler.

Priya'nın yazdığı politika: KRİTİK önem dereceli bir CVE'ye sahip hiçbir imaj üretime dağıtılmayacaktı. CI/CD hattı, ECS hizmetini güncellemeden önce tarama sonuçlarını kontrol edecekti. Kritik bir güvenlik açığı bulunursa, hat başarısız olacak ve ekibi uyaracaktı.

"Bu paranoya değil," dedi Priya. "Bu sadece dağıtmadan önce bir kontrole sahip olmak."

**Konteynerler Dağıtımları Nasıl Değiştirir**

Konteynerlerden önce, Nimbus API'sinin yeni bir sürümünü dağıtmak şu anlama geliyordu:

1. Her EC2 örneğine SSH yap
2. Git'ten en son kodu çek
3. Bağımlılıkları yükle/güncelle
4. Uygulama sürecini yeniden başlat
5. Sağlığı doğrula
6. Bir sonraki örneğe geç

Bu hataya açık ve yavaştı. Koordinasyon gerektiriyordu. 4 numaralı örnekte adım 3 başarısız olursa, bazı örnekler eski sürümü çalıştırırken bazılarının yeni sürümü çalıştıramadığı karışık bir dağıtımınız olurdu.

ECS ve konteynerlerle:

1. Yeni bir Docker imajı oluştur (CI/CD hattında otomatikleştirilmiş)
2. ECR'ye gönder
3. ECS hizmetini yeni imaj sürümünü kullanacak şekilde güncelle

ECS sıralı (rolling) dağıtımı halleder: yeni imajla yeni görevler başlatır, onların sağlıklı olmasını bekler, sonra eski görevleri durdurur. Sıfır kesintili dağıtım, otomatik.

Yeni sürüm sağlık kontrollerinde başarısız olursa, ECS dağıtımı durdurur ve eski sürüm trafiğe hizmet etmeye devam eder.

**Dağıtımın Minimum Yapılandırması: Sağlık Kontrolleri**

Konteyner dağıtımlarının tüm güvenliği, sağlık kontrollerinin gerçekten çalışmasına bağlıdır.

ECS iki tür sağlık kontrolü kullanır:

**Konteyner düzeyinde sağlık kontrolü**: Dockerfile'da veya görev tanımında tanımlanır. Uygulamanın yanıt verdiğini doğrulamak için konteynerin içinde çalışır.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**ALB hedef grubu sağlık kontrolü**: Yük dengeleyici periyodik olarak bir sağlık uç noktasına HTTP istekleri gönderir. Sağlık kontrolünde başarısız olan görevler hedef gruptan kaldırılır.

Hiçbir sağlık kontrolü düzgün yapılandırılmazsa, ECS her görevi sağlıklı sayar—ve bozuk bir imajı durdurmadan dağıtır. Bu en yaygın konteyner dağıtım hatasıdır.

"Sağlık kontrolü uç noktası dahili bilgi sızdırabilir mi?" diye sordu Priya.

`/health`'teki sağlık kontrolü uç noktası yalnızca şunu döndürüyordu: `{"status": "ok"}`. Sürüm numarası yok, bağımlılık durumları yok, dahili yapılandırma yok. Sağlık yanıtındaki herhangi bir bilgi, uygulamayı haritalandıran birine yararlı olabilir. Sağlık uç noktalarını minimum tutun.

Ayrıntılı dahili sağlık durumu için (veritabanı bağlantısı, bağımlılık kontrolleri), ayrı bir kimlik doğrulamalı `/health/detail` uç noktası kullanın—yalnızca VPC içinden erişilebilir.

**Yapılandırılmış Günlükleme: Çalışan Bir Konteynere Açılan Tek Pencere**

EC2'de, bir şey ters gider ve SSH ile bağlanırsınız. Günlük dosyasını izlersiniz (tail). Süreç tablosuna bakarsınız. Disk kullanımını kontrol edersiniz. Etrafı kurcalarsınız.

Bir konteynerde SSH yoktur. Konteyner geçicidir—kümede herhangi bir ana bilgisayarda çalışıyor olabilir ve sağlık kontrollerinde başarısız olursa ECS onu uyarı vermeden değiştirir. Siz SSH ile bağlanmayı düşündüğünüzde, incelemek istediğiniz konteyner artık var olmayabilir.

Günlükler konteynerleştirilmiş ortamlarda bir ayıklama kolaylığı değildir. Bir şeyin olduğuna dair tek kanıttırlar.

"Peki bir konteyner sessizce başarısız olursa ve hiç günlüğümüz yoksa?" diye sordu Priya konteyner mimarisi incelemesi sırasında. "Bir görev kod 1 ile çıkabilir ve günlükler sonlanmadan önce yakalanmadıysa nedenini asla bilemeyebiliriz."

Bu varsayımsal değildir. İlk konteyner dağıtımlarında, tutarlı bir şekilde olur.

Doğru kalıp: her konteyneri, `awslogs` günlük sürücüsünü kullanarak yapılandırılmış günlükleri **Amazon CloudWatch Logs**'a gönderecek şekilde yapılandırın. ECS göndermeyi otomatik olarak halleder—yüklenecek günlük aracısı yok, sidecar konteyner gerekmez.

Görev tanımında:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Konteynerin içinde stdout veya stderr'e yazılan her satır yakalanır ve görev kimliğine göre düzenlenmiş `/ecs/nimbus-api` günlük grubuna gönderilir. ECS her görev için yeni bir günlük akışı oluşturur, böylece başarısız olan belirli konteynerin günlüklerini bulabilirsiniz—değiştirildikten sonra bile.

Görev yürütme rolünün CloudWatch Logs'a yazma izni gerekir. Onsuz, günlük sürücüsü sessizce başarısız olur ve tüm günlük çıktısı kaybolur.

**Yapılandırılmış günlükler vs düz metin**: Düz metin günlükleri ("Sipariş 7741 verildi") grep gerektirir. Yapılandırılmış JSON günlükleri (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`), SQL'e benzeyen bir sözdizimi kullanarak CloudWatch Logs Insights ile sorgulanabilir:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

O sorgu doğrudan günlük grubuna karşı çalışır. Veritabanı yok. Veri hattı yok. ETL işi yok. Cevap saniyeler içinde oradadır.

Bu, bölüm 26'da inşa edeceğimiz analiz veri gölünün yerini almaz. Operasyonel soruları yanıtlar—"son 30 dakikada 47 numaralı restorandan kaç sipariş?"—bir Athena sorgusu çalıştıracak zamanınız olmadığında, bir olayın ortasında.

**CloudWatch Container Insights**

**Container Insights**, ECS kümesi, hizmeti ve görevi başına konteyner düzeyinde metrikleri—CPU, bellek, ağ G/Ç, depolama G/Ç—toplayan ve birleştiren bir CloudWatch özelliğidir. EC2 düzeyinde metrikler (ana bilgisayar nasıl?) yerine, görev düzeyinde metrikler (bu belirli ECS hizmeti nasıl?) görürsünüz.

Onu ECS kümesinde tek bir ayarla etkinleştirin:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Etkinleştirdikten sonra:

- Hizmet başına bir pano görürsünüz: görev sayısı, CPU kullanımı, bellek kullanımı
- Görev düzeyinde CPU üzerinde alarm verebilirsiniz (çok daha kör bir sinyal olan EC2 ana bilgisayar CPU'su yerine)
- Bellek sıçramalarını günlük olaylarıyla ilişkilendirebilirsiniz—görev belleği 14:22'de %95'e tırmandı; günlükler tam olarak 14:21'de 47 numaralı restoranın menü içe aktarımından gelen isteklerde bir sıçrama gösteriyor

"Bu ayda ne kadara mal oluyor?" diye sordu Tom.

Container Insights, oluşturduğu özel metrikler ve günlük depolama için ücret alır. Nimbus'un ölçeğinde (üç hizmet, her biri 3-6 görev), bu yaklaşık ayda 12 dolardı—görev düzeyinde operasyonel görünürlük için makul bir takas.

Leo onu gün içinde etkinleştirdi.

Bir görev ilk kez bir sağlık kontrolünde başarısız olup ECS tarafından değiştirildiğinde, Container Insights panosu olayı otomatik olarak yakaladı: görev kimliği, başlangıç zamanı, başarısızlık zamanı, çıkış kodu. O görev için CloudWatch günlük akışı, sonlanmadan önceki çıktının son 40 satırını korudu—yeni bir restoran ortağından gelen hatalı biçimlendirilmiş bir menü JSON'unun tetiklediği yakalanmamış bir istisnayı gösteren.

Container Insights ve yapılandırılmış günlükleme olmadan: hata oranlarında gizemli bir sıçrama, başarısız görevi artık çalıştırmayan bir ana bilgisayara SSH gerektiren bir araştırma, 45 dakikalık tahmin yürütme.

Onlarla: CloudWatch panosunda bir günlük akışı bağlantısı, tam istisna, restoran kimliği, sorunlu alan—beş dakikadan kısa sürede.

"SSH yok," dedi Leo, olay sonrası incelemeyi gözden geçirerek. "Araştırmak için kesinti yok. Günlükler işi yaptı."

"Günlükler ancak işi yapar," dedi Priya, "onları yakalanacak şekilde yapılandırdıysanız."


**Konteynerler Yanlış Seçim Olduğunda**

"Bekle—ama *neden* her şeyi konteynerleştirmeyelim?" diye sordu Maya. "Beni az önce konteynerlerin tüm yapılandırma kayması sorunlarını çözdüğüne ikna ettin. Neden her bir hizmeti bir konteyner olarak çalıştırmayalım?"

Bu, Lambda hakkında sorduğu aynı soruydu. Cevap benzerdi.

Konteynerler operasyonel gereksinimler ekler: bir konteyner kayıt defterine (ECR), imajları oluşturan ve gönderen bir CI/CD hattına, bir orkestratöre (ECS), örnek düzeyinde değil görev düzeyinde görünürlük için yapılandırılmış izlemeye ve Docker ile imaj sürümlemeyi anlayan bir ekibe ihtiyacınız var.

EC2'de zaten iyi çalışan, kararlı ve yapılandırma kaymasından muzdarip olmayan bir hizmet için, onu konteynerleştirmenin maliyeti faydayı aşabilir.

Konteynerlerin yanlış seçim olduğu belirli durumlar:

**Konteyner mobilitesi için inşa edilmemiş durum bilgisi olan hizmetler**: Konteynerlerdeki veritabanları dikkatli kalıcı birim yönetimi gerektirir. Veritabanlarını konteynerlerde çalıştıran çoğu ekip, bu karmaşıklıkla karşılaştıktan sonra eninde sonunda onları yönetilen hizmetlere (RDS, ElastiCache) geri taşır.

**Özelleşmiş donanım gereksinimleri olan hizmetler**: GPU iş yükleri, belirli ağ arabirimi yapılandırmaları veya FPGA tabanlı işleme, belirli donanıma sahip EC2 örnekleri gerektirir. Konteynerler bunu değiştirmez—hâlâ EC2 başlatma türünü, sadece üstünde konteynerlerle kullanırsınız ve konteyner soyutlaması fayda olmadan karmaşıklık ekler.

**Çok basit komut dosyaları ve işler**: Haftada bir kez çalışan ve hiç bağımlılık kayması sorunu olmayan 40 satırlık bir Python komut dosyası. Bunun için Docker, ECR, ECS görev tanımları ve bir CI/CD hattı eklemek orantısızdır. Lambda daha basittir. Düz bir EC2 cron işi daha da basit olabilir.

"İlke," dedi Leo, "her zamanki gibi: aracı soruna uydurun. Konteynerler yapılandırma kaymasını ve dağıtım tutarlılığını çözer. Bu soruna sahip değilseniz, konteynerlere ihtiyacınız yoktur."

## AWS Batch: Büyük Ölçekli İşler İçin Konteynerler

ECS ve EKS uzun süreli hizmetler için tasarlanmıştır—sürekli çalışan, istek kabul eden ve trafikle ölçeklenen uygulamalar. Ama bazı iş yükleri farklıdır: belirli bir süre çalışırlar, tanımlı bir veri kümesini işlerler, sonra dururlar. Yüzlerce restoran için ay sonu faturaları oluşturma. Bir makine öğrenimi eğitim işi çalıştırma. Gecelik bir analiz dışa aktarımını işleme.

Bu iş yükleri için bir hizmet istemezsiniz—bir iş istersiniz.

**AWS Batch**, herhangi bir ölçekte toplu (batch) hesaplama işleri çalıştıran tam yönetilen bir hizmettir. İşinizi bir Docker konteyneri olarak tanımlarsınız (ECS'nin kullandığı aynı konteyner formatı) ve Batch geri kalanını halleder: EC2 veya Fargate işlem gücü temin etme, işleri kuyruklara zamanlama, işler geldiğinde kapasiteyi artırma ve bittiğinde sıfıra geri çekme.

Temel kavramlar:

- **İş tanımı (job definition):** Docker konteyneri, kaynak gereksinimleri (vCPU, bellek) ve çalıştırılacak komut
- **İş kuyruğu (job queue):** gönderilen işlerin çalışmadan önce beklediği yer; her kuyruk bir veya daha fazla işlem ortamıyla ilişkilendirilir
- **İşlem ortamı (compute environment):** temel EC2 veya Fargate kapasitesi. %90'a kadar maliyet tasarrufu için Spot Instance'lar kullanabilir—Batch kesintileri ve yeniden denemeleri otomatik olarak halleder

"Bekle—ama *neden* sadece bir ECS görevi çalıştırmak yerine Batch kullanalım?" diye sordu Maya.

"Çünkü bir ECS hizmeti her zaman açıktır," dedi Leo. "İstekleri bekler. Bir Batch işi çalışır, biter ve Batch işlem gücünü sıfıra geri çeker. Çalıştırmalar arasında hiçbir şey ödemezsiniz."

Tom fiyatlandırma sayfasından başını kaldırdı. "Ya Spot Instance'lar?"

"Batch Spot'ta çalışabilir. Bir Spot Instance iş ortasında geri alınırsa, Batch otomatik olarak yeniden dener. 45 dakikalık bir fatura işi için bu sorun değil."

**ECS/EKS'ye karşı:** ECS/EKS hizmetler çalıştırır—her zaman açık, istek odaklı. Batch işler çalıştırır—sonlu süre, veri odaklı, boştayken sıfıra ölçeklenir.

**Lambda'ya karşı:** Lambda'nın 15 dakikalık zaman aşımı vardır. Batch işleri saatlerce veya günlerce çalışabilir.

Nimbus bağlamı: gecelik fatura oluşturma işi yüzlerce restoran ortağı için 45 dakika sürer. Lambda 15 dakikada zaman aşımına uğrar. Her zaman açık bir ECS hizmeti günde 23 saat para harcar. Batch işi Spot Instance'larda çalıştırır, 38 dakikada bitirir, 1,20 dolara mal olur ve kapanır.

"Bu, eski komut dosyasının bitmesini beklerken aldığım kahveden daha ucuz," dedi Leo.

"Ve yönetilecek EC2 yok," diye ekledi Priya. "Batch onu temin eder, çalıştırır, sonlandırır."

## Güçlü Yönler ve Sınırlamalar

**Konteynerler**:

- Ortam tutarsızlığını ("benim makinemde çalışıyor") ortadan kaldırır
- Hızlı, güvenilir dağıtımlara olanak tanır
- Değişmez—aynı imaj her yerde aynı şekilde çalışır
- Verimli—sanal makinelerden daha hafif, daha hızlı başlatma

**ECS**:

- AWS-merkezli iş yükleri için Kubernetes'ten daha basit
- Sıkı AWS entegrasyonu (IAM, ALB, CloudWatch, Secrets Manager)
- Fargate seçeneği EC2 yönetimini tamamen kaldırır

**EKS**:

- Tam Kubernetes uyumluluğu—tüm ekosistemi kullanın
- Hibrit ortamlar veya Kubernetes uzmanlığı olan ekipler için daha iyi
- Kurulumu ve işletmesi ECS'den daha karmaşık

**Karmaşıklaştığı Yer**:

- Konteyner imajları oluşturulmalı ve sürümlenmeli—bir CI/CD hattı gerektirir
- Konteynerleri ayıklamak, geleneksel süreçleri ayıklamaktan farklı araçlar gerektirir
- Durum bilgisi olan konteynerler (konteynerlerdeki veritabanları) dikkatli kalıcı depolama yapılandırması gerektirir
- Konteynerler arası ağ (hizmetten hizmete iletişim) konteyner ağı kavramlarını anlamayı gerektirir

## Özet

Lambda boşta işlemi ücretsiz yaptı. Konteynerler dağıtımı belirleyici (deterministik) yaptı. Birlikte, büyüyen mühendislik ekipleri için operasyonel acının en yaygın iki nedenini çözdüler.

- **Konteynerler** uygulama kodunu, çalışma zamanını ve bağımlılıkları birlikte paketler—her yerde aynı şekilde çalışır.
- **Docker** standart konteyner teknolojisidir. İmajlar taslaktır; konteynerler çalışan örneklerdir.
- **ECR (Elastic Container Registry)**, AWS'nin yönetilen Docker kayıt defteridir—imajlarınızı burada saklayın, sürümleyin ve tarayın. CVE'leri dağıtımdan önce yakalamak için imaj taramasını etkinleştirin.
- **ECS (Elastic Container Service)** konteynerleri orkestre eder. Görevleri ve hizmetleri tanımlarsınız; ECS yerleştirmeyi ve yaşam döngüsünü yönetir.
- **Fargate** konteynerler için sunucusuz işlemdir—yönetilecek EC2 örneği yok. EC2 ek yükünün ortadan kaldırılması nedeniyle küçük ölçeklerde genellikle EC2 başlatma türünden daha ucuz. Dikkatli görev kutu paketlemeyle daha büyük ölçeklerde, EC2 başlatma türü daha uygun maliyetli hâle gelebilir.
- **EKS (Elastic Kubernetes Service)** yönetilen Kubernetes'tir—Kubernetes özelliklerine veya uyumluluğuna ihtiyaç duyan ekipler için.
- **Secrets Manager entegrasyonu**: gizli bilgileri görev tanımı aracılığıyla başlatma zamanında konteynerlere enjekte edin—gizli bilgi değerlerini ortam değişkenlerinde veya görev tanımlarında doğrudan saklamayın.
- **Hizmet keşfi**: konteyner IP'leri geçicidir. Kararlı hizmet adreslemesi için ALB DNS adlarını veya Cloud Map'i kullanın.
- AWS'de basitlik için ECS'yi seçin; Kubernetes ekosistemi uyumluluğu için EKS'yi seçin.

## Sınav İpuçları

*SAA-C03 Alanı: Dayanıklı Mimariler Tasarlama (Alan 2, Görev 2.1)*

- **ECS vs EKS sinyalleri**: "Kubernetes," "Helm," "mevcut Kubernetes uzmanlığı" veya "çoklu bulut konteyner orkestrasyonu"ndan bahseden sınav senaryoları → EKS. Geri kalan her şey → ECS.
- **Fargate vs EC2 başlatma türü**: "Konteynerler için EC2 örneklerini yönetmek istemiyorum," "sunucusuz konteynerler," "altyapı yönetimi yok" → Fargate. "Belirli örnek türlerine ihtiyaç var," "GPU iş yükleri," "ince taneli örnek kontrolü" → EC2 başlatma türü.
- **Görev rolü vs görev yürütme rolü**—gerçek bir sınav ayırt edicisi. **Görev yürütme rolü (task execution role)**, görevin adına ECS *aracısı* tarafından, kodunuzdan önce ve etrafında kullanılır: imajı ECR'den çekme, gizli bilgileri Secrets Manager'dan alma, günlükleri CloudWatch'a yazma. **Görev rolü (task role)**, *konteynerin içindeki uygulama kodunuzun* AWS hizmetlerini çağırmak için kullandığıdır: S3'ten okuma, DynamoDB'ye yazma—EC2 örnek rolleri gibi, ama görev başına, böylece her görevin farklı izinleri olabilir. "Konteynerin S3'ten okuması gerekir" → **görev rolü** (görev tanımına eklenir). "Görev imajını çekemiyor / gizli bilgisini alamıyor" → **yürütme rolünün** izinleri eksiktir.
- **Fargate Spot**: hata toleranslı konteynerleri yedek kapasitede ~%70'e kadar indirimle, iki dakikalık bir kesinti uyarısıyla çalıştırın—Fargate'in EC2 Spot eşdeğeri, kapasite sağlayıcıları aracılığıyla yapılandırılır. Sınav tetikleyicisi: "kesintiye dayanıklı konteynerleri örnekleri yönetmeden en düşük maliyetle çalıştır" → Fargate Spot.
- **ECR imaj taraması**: ECR, konteyner imajlarını bilinen güvenlik açıkları (CVE'ler) için tarayabilir. Sınav sinyali: "güvenlik açıkları için konteynerleri tara" → ECR imaj taraması.
- **Mavi/yeşil dağıtımlar**: ECS, CodeDeploy entegrasyonu aracılığıyla mavi/yeşil dağıtımları destekler. Otomatik geri almayla sıfır kesintili dağıtım. Sınav kalıbı: "otomatik geri almayla kesintisiz dağıt" → ECS + CodeDeploy mavi/yeşil.
- **Secrets Manager entegrasyonu**: Sınav sinyali: "değerleri görev tanımlarında saklamadan gizli bilgileri konteynerlere enjekte et" → görev tanımında bir Secrets Manager ARN'sine referans veren `secrets` alanını kullanın. Görev yürütme rolünün `secretsmanager:GetSecretValue` iznine ihtiyacı vardır.
- **ECS Service Auto Scaling**: Görev sayısını CPU, bellek veya özel CloudWatch metriklerine göre ölçeklendirin. Trafiği doğru sayıda çalışan göreve yönlendirmek için ALB ile çalışır.
- **AWS Batch:** Docker konteynerleri için yönetilen toplu işlem. İş kuyruğu → işlem ortamı (EC2 veya Fargate, Spot'u destekler). Şu durumda kullanın: Lambda zaman aşımı çok kısa, sonlu işler için ECS hizmeti israftır. Sınav tetikleyicisi: "büyük ölçekli toplu işleme" veya "saatlerce çalışan iş" → AWS Batch.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Bir Docker imajı ile bir Docker konteyneri arasındaki farkı açıklayın. ECS ile ECR arasındaki farkı açıklayın.

*(İpucu: İmaj, pişmiş bir yemeğe göre bir tarif neyse, konteynere göre odur. ECR imajları saklar; ECS onları çalıştırır.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirketin şu anda manuel olarak yönetilen EC2 örneklerinde çalışan bir mikroservis uygulaması var. Ekip tutarsız dağıtımlarla mücadele ediyor—farklı EC2 örneklerinin farklı kütüphane sürümleri var, bu da yeniden üretilmesi zor hatalara neden oluyor. Temel sunucuları yönetmenin operasyonel ek yükünü en aza indirirken dağıtımları standartlaştırmak istiyorlar. Ekibin Kubernetes deneyimi yok.

Bu gereksinimleri EN İYİ hangi çözüm karşılar?

A) Uygulamayı Docker ile konteynerleştirin; Fargate başlatma türüyle Amazon ECS kullanın  
B) Örnekleri tutarlı tutmak için AWS Systems Manager Patch Manager ile EC2'de dağıtın  
C) Uygulamayı Docker ile konteynerleştirin; kendi yönetilen düğüm gruplarıyla Amazon EKS kullanın  
D) Dağıtımları ve örnek yapılandırmasını otomatik olarak yönetmek için AWS Elastic Beanstalk kullanın

**İpucu 1**: Konteynerler "tutarsız ortam" sorununu doğrudan çözer. Hangi seçenekler konteyner kullanır?

**İpucu 2**: "Sunucuları yönetmenin operasyonel ek yükünü en aza indir" → Fargate (EC2 yönetimi yok) vs kendi yönetilen düğümler (hâlâ EC2 yönetirsiniz).

**İpucu 3**: "Kubernetes deneyimi yok" → EKS, ECS'den daha fazla operasyonel karmaşıklıktır.

**Cevap**: A

**Açıklama**: Docker ile konteynerleştirme, her dağıtımın aynı bağımlılıklarla aynı imajı kullanmasını sağlar—yapılandırma kaymasını ortadan kaldırır. Fargate ile ECS, yönetilecek EC2 örneği olmaması demektir. Ekip sunucu bakımına değil, uygulama koduna ve konteyner tanımlarına odaklanır. ECS (EKS değil), Kubernetes deneyimi olmayan ekipler için uygundur.

**Neden B değil?** Patch Manager EC2 örneklerini güncel tutar ama uygulamalar arasındaki kütüphane sürümü tutarsızlığını çözmez. Temel sorun (farklı örneklerde farklı kod ortamları) devam eder.

**Neden C değil?** Kendi yönetilen düğüm gruplarıyla EKS, EC2 örneklerini yönetmeyi *ve* Kubernetes öğrenmeyi gerektirir. Hiçbiri gereksinimlerle uyuşmaz.

**Neden D değil?** Elastic Beanstalk EC2'de uygulama dağıtımını yönetir ama konteyner kullanılmadıkça temel ortam tutarsızlığını çözmez. Beanstalk varsayılan olarak Docker imajları kullanmaz (yapılandırılabilse de).

*SAA-C03 Alanı: Dayanıklı Mimariler Tasarlama — Görev 2.1*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus tekil (monolitik) API'yi üç mikroservise bölüyor: sipariş hizmeti, menü hizmeti ve bildirim hizmeti. Her hizmetin farklı ölçeklendirme gereksinimleri var (sipariş hizmeti trafikle ölçeklenir; menü hizmeti çoğunlukla salt okunur ve kararlıdır; bildirim hizmetinin ani patlamaları vardır).

Bu üç hizmet için ECS mimarisini tasarlayın. Hizmetten hizmete iletişimi nasıl ele alırdınız? Bir ECS kümesi mi yoksa üç mü kullanırdınız? Her hizmet için Auto Scaling'i nasıl farklı yapılandırırdınız?

Şunu düşünün: menü hizmeti okuma ağırlıklı ve 60 saniye bayat veri sunabilir—önüne önbellek ekler miydiniz? Bildirim hizmeti Cuma akşamları yoğun şekilde patlama-ölçeklenir—Fargate Min kapasitesini 1, Max'ı 20'ye ayarlar mıydınız? Bir ölçek küçültme olayı sırasında uçuştaki bildirimlere ne olur?

*(Tek bir doğru cevap yoktur. Amaç, ECS üzerinde mikroservis mimarisi pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

İlk konteyner dağıtımı kusursuzdu.

API'nin yeni sürümü: sıfır kesinti. ECS onu yaydı, sağlık kontrolleri geçti, eski görevler boşaldı, yeni görevler devraldı. Leo konsoldaki görev durumunu inanmazlığa yakın bir şeyle izledi.

"Sadece çalıştı," dedi.

"Geçen hafta, üç numaralı örnekte başarısız olmadan önce manuel SSH dağıtımı hakkında aynı şeyi söyledin," dedi Priya.

"Onu zaten dağıttım—ah." Leo durakladı. "İmaj sürümünü etiketlemeden dağıttım. Bunu düzelteyim."

"Mesele bu," dedi Priya. "İmaj sürümleme, neyin çalıştığını nasıl izlediğinizdir."

"Şu anda üretimde hangi sürümün olduğunu nasıl biliyorsun?" diye sordu Maya.

Leo ECS konsolunu açtı. Çalışan görevin altında imaj listelenmişti: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Sürüm 1.0.3. 14:22 UTC'de oluşturuldu. 14:31 UTC'de dağıtıldı.

"Eski EC2 kurulumunda," dedi Leo, "her bağımlılığın hangi sürümünün yüklü olduğunu görmek için bir örneğe SSH yapmak ve `pip show` çalıştırmak zorunda kalırdım. Ve diğer örneklerde farklı olabilirdi."

"Ya şimdi?"

"İmajdaki etiket bana tam olarak neyin çalıştığını söylüyor. ECR tarama geçmişi onun taranıp taranmadığını söylüyor. ECS dağıtım geçmişi ne zaman dağıtıldığını ve önceki sürümün ne olduğunu söylüyor."

"SSH yok. Kesinti yok. 'Yeniden başlamasını bekle' yok."

"İmaj dağıtım yapıtıdır (artifact)," dedi Priya. "Ortam değişmezdir. Dağıtım süreci bildirimseldir (declarative). Yazılım böyle gönderilmelidir."

Leo bir an daha konsola baktı.

"Üç yıl EC2 dağıtımlarını koordine ettim," dedi. "SSH komut dosyalarını koordine ettim. Dağıtım çalışma kitapları yazdım."

"Bir sorun çözüyordun," dedi Priya, "konteynerlerin tasarım gereği çözdüğü bir sorunu."

Bundan sonra bir şey söylemedi. Ama ertesi sabah, başka hiç kimsenin üç yıl boyunca çözmeye çalışmak zorunda kalmaması için konteyner derleme süreci hakkında dokümantasyon yazmaya başladı.

Üç numaralı örnek hatası, altı haftalık belgelenmemiş kayma ve henüz yakalamadıkları onun gibi sorunlar—hepsinin tek bir kök nedeni vardı. Kötü niyetli bir aktör değil. Donanım arızası değil. Sadece tek kullanımlık bir birim yerine kalıcı bir demirbaş gibi muamele görmüş bir sunucu.

Konteyner buna cevaptı. Yeni ve ilginç olduğu için değil. Soruyu sormayı imkânsız kıldığı için.

Sonraki bölümde: kendini çalıştıran—ve nerede durduğunu hatırlayan—akış şeması.
