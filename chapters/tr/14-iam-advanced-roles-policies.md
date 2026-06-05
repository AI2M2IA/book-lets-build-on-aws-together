# Bölüm 14: Kim Ne Yapabilir?

Tom, erişim anahtılarını bir metin dosyasında açık bırakmış, yapıştırmaya hazırdı.

"Ne yapıyorsun?" Priya sordu.

"EC2 örneği, S3'ten yapılandırma dosyalarını okumalı. Anahtarları sunucu yapılandırmasına yerleştiriyorum."

Bir an ekranda baktı. "O dosyayı kapat."

"Sadece—"

"Eğer biri o sunucuya girerse," dedi, "o anahtıları elde eder. Ve bu anahtılar, IAM kullanıcısının izin verilen her şeye dokunabilir." Bu, S3'ten çok daha fazlası olabilir."

Tom dosyayı kapattı.

"Daha iyi bir yol var," dedi. "Sunucu kendi rolüne sahip olabilir. Bunu bir iş başlığı gibi düşünün - örneğin, kimliğe gerek yok çünkü sistem zaten ne olduğunu ve ne yapmasına izin verildiğini biliyor."

Tom şüpheci bir ifadeyle baktı. "Yani sunucu kendisini kimlik doğrulaması yapıyor mu?"

"Evet. Bir şifre olmadan. Bir anahtarın bir yapılandırma dosyasında olmaması olmadan. Git'e yanlışlıkla commit edilebilecek hiçbir şey olmadan."

Bu son kısım yer etti. Tom, iki hafta önce git geçmişinde bir veritabanı şifresini bulmuştu. Yeni bir tarayıcı sekmesi açtı.

**IAM'i Yeniden İnceleme: Tam Görüntü**

3. Bölüm IAM'i tanıtmıştı: kullanıcılar, gruplar, roller ve politikalar. Şimdi daha derinlere inme zamanı.

IAM politikaları, kaynaklarda izin verilen veya reddedilen eylemleri belirten JSON belgeleridir. Şöyle görünürler:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Bu politika, `nimbus-assets` adlı bucket'tan nesneleri okuma ve yazma yeteneği sağlar ve başka bir şey yapmaz. Silme, bucket listeleme veya başka bir S3 işlemi veya başka bir AWS hizmeti yapmaz.

İzinleri bu şekilde verme doğru yoldur: belirli eylemler, belirli kaynaklar.

**"Yöneticiden Erişim"in Sorunu**

AWS Yönetilen Politikaları gibi `AdministratorAccess`, hızlı bir başlangıç yapmanızı sağlamak için tasarlanmıştır. Üretim sistemlerini gerçek ekip üyeleriyle çalıştırmak için tasarlanmamıştır.

`AdministratorAccess`, her kaynağa her eylemi yapma yeteneği verir. Bu politika ile izinlere sahip bir ekip üyesi bir hata yaparsa – yanlışlıkla bir S3 bucket'ını siler, yanlış EC2 örneğini sonlandırır, güvenlik grubu kurallarını değiştirir – AWS bunu durduramaz. İzin verilmiştir.

Bir ekip üyesinin kimlik bilgileri tehlikeye düşürülürse (dolandırıcılık, çalınmış erişim anahtarı, çalınan bir dizüstü bilgisayar) saldırgan, AWS hesabınızdaki her şeye yönetici erişimi elde eder.

"Soo-Jin'in ne yapması gerekiyor?" Leo sordu.

"Soo-Jin'in neye ihtiyacı var?" Priya yanıtladı.

"API'yi dağıt. Günlükleri kontrol et. Başka bir şey yapma."

"O zaman şu şekilde erişebiliyor: kod pipeline'ına gönderme yeteneği, CloudWatch günlüklerine okuma erişimi ve başka bir şey yapma."

"Bu... çok spesifik."

"Evet, bu da önemli."

**IAM Rolleri: Hizmetler İçin Kimlikler**

3. Bölüm, EC2 örneklerinin kimlik bilgilerini depolamadan AWS hizmetlerine erişmek için rolleri nasıl kullanabileceğini tanıttı. Bunu somutlaştıralım.

Nimbus API'sini çalıştıran EC2 örneklerinizin şunları yapmasına ihtiyacı var:

- DynamoDB'den okuma (menü)
- DynamoDB'ye yazma (siparişler)
- S3'e nesneleri yerleştirme (fatura makbuzları, yüklemeler)
- CloudWatch'a günlükleri yazma
- Secrets Manager'dan sırları okuma

EC2 örneğine erişim anahtısı saklamanın (güvenlik çukurunun oluşturulması) güvenlik açısından bir kabus olduğu gibi, EC2 örneği için tam olarak bu izinlere sahip bir **IAM rolü** oluşturmak yerine bunu yapın.

EC2 örneği, otomatik olarak rolü devralır. AWS, örneğin meta veri hizmeti aracılığıyla geçici kimlik bilgilerini sağlar. Kimlik bilgilerinin otomatik olarak dönüştürülmesi sağlanır. Sızılan bir erişim anahtısı yoktur.

"Eğer birileri EC2 örneğine hacklese ne olur?" Leo sordu.

"Onlar, EC2 rolünün izinlerine göre hareket edebilirler," dedi Priya. "Bu da menüden okumak, siparişleri yazmak ve günlükleri göndermektir. S3 bucket'ını silemezler. EC2 örneklerini sonlandırmazlar. IAM'i dokunamazlar."

"Çünkü EC2 rolü bu izinlere sahip değildir."

"Tamamdır."

**Rol Devralımı: Hizmetler Diğer Hizmetler Tarafından Devralınır**

Roller şunlar tarafından devralınabilir:

- **AWS hizmetleri** (EC2, Lambda, ECS görevleri vb.)
- Kendi hesabınızdaki **IAM kullanıcıları** (rol yükseltme - daha fazla izinle bir rolü devralma görevi için)
- Diğer **AWS hesaplarındaki IAM kullanıcıları** (çapraz hesap erişimi - başka bir kuruluşun hesabınızda bir rolü devralması)
- **Dış kimlik sağlayıcıları** (Google, Active Directory, Okta - insan kullanıcılar için federasyon erişimi)

Bu son kalıp – **kimlik federasyonu** – büyük kuruluşların çalışanlarına AWS erişimi vermesini sağlar, her bir kişi için ayrı ayrı IAM kullanıcıları oluşturmak yerine. Şirketinizin Active Directory'si kimlik bilgilerinizdir. AWS'ye otururken, Active Directory'ye kimliğinizi doğrularsınız ve AWS size bir rol tanır.

**İzin Sınırları: Rollerin Ne Tanıyabileceğini Sınırlandırma**

İşte bir sorun: varsayılan olarak, IAM, bir kullanıcının şu anda sahip olduğu izinleri vermesini engellemez.

Soo-Jin'in `iam:CreatePolicy` ve `iam:AttachUserPolicy` izinlerine sahip olması durumunda, S3 yazma erişimi sağlayan bir politika oluşturabilir ve bunu kendisine bağlayabilir – mevcut politikaları yalnızca S3 okuma izine izin verse bile. Bu tür bir güvenlik açığı sınıfı, **izin yükseltmesi** olarak adlandırılır ve tam olarak izin sınırlarının varlığıyla ilgilidir.

Ancak, bir ekip liderine izin oluşturma yeteneği verirken, onları ne kadar yetkilendirebileceğinizi engellemeden bunu yapmayı nasıl sağlayabilirsiniz?

**İzin sınırları**, bir kimliğin asla verilen izinlerin maksimum sınırını ayarlar. Kimliğin ekli politikaları daha geniş olsa bile, izin sınırları tarafından sınırlandırılır.

Örneğin, bir ekip liderine bir rol oluşturma yeteneği veren bir politika verirsiniz. Ancak, "bu ekip lideri tarafından oluşturulan rollerin asla S3 silme erişimi olamayacağını" belirten bir izin sınırı eklersiniz. Ekip lideri S3 tam erişime sahip bir rol oluşturursa, sınır S3 silme etkisini engeller.

Bu, gelişmiş bir kavramdır, ancak sınavda görünür ve kuruluşların IAM yönetimini ölçekte nasıl yaptığını yansıtır.

**IAM Analizleyici: İzinleri Denetleme**

Priya, ekibin IAM kurulumunu iki gün boyunca inceledi. Aşağıdakileri buldu:

- Leo'nun kişisel kullanıcısı yönetici erişimine sahipti (keşfedildi)
- Bir Lambda fonksiyonu tüm S3 bucket'larına erişim iznini sağlıyordu (bir testten kalma)
- Bir hizmet rolü, artık var olmayan DynamoDB tablolarına yazma erişimi sağlıyordu.

Bu normaldir. IAM yapılandırmaları zamanla artakalan çöpü içerir.

**IAM Erişim Analizörü** AWS'in sunduğu bir hizmettir ve kaynakları (S3 depoları, IAM rolleri, KMS anahtarları, Lambda fonksiyonları) harici varlıklarla paylaşılıp paylaşılmadığını otomatik olarak belirler. Ayrıca, aşırı izinli politikaları da tespit eder.

Düzenli IAM denetimleri, operasyonlarınızın bir parçası olmalıdır. İzinler artar; onlar organik olarak genellikle küçülmez. Access Analyzer, görünmeyen şeyi görünür hale getirmenize yardımcı olur.

**Servis Kontrol Politikaları: Organizasyon Seviyesi Koridorlar**

AWS ortamınız birden fazla hesaba (genellikle büyük ekipler için yaygın bir model olan geliştirme hesabı, hazırlık hesabı, üretim hesabı) genişlediğinde, **AWS Organizasyonları** bunları merkezi bir hesapta yönetmenizi sağlar.

Organizasyonlar içinde, **Servis Kontrol Politikaları (SCP'ler)** her hesaptaki tüm IAM varlığı üzerinde koridorlar uygular, hatta yöneticiler dahil.

Örnek SCP: "Geliştirme hesabındaki kimse, eu-west-1 bölgesinde EC2 örnekleri oluşturamaz."

Birinin geliştirme hesabındaki yöneticisi erişimi olsa bile, bu SCP'yi ihlal edemez. Kuruluş seviyesinde, hesap seviyesinden daha yüksekte uygulanır.

SCP'ler izin vermez — bunları kısıtlar. Bir hesabaki herhangi bir IAM varlığın sahip olabileceği maksimum izinlerin ne olduğunu tanımlar.

## Güçlü Yönler ve Sınırlamalar

**Neden IAM rolleri ve en az ayrıcalık önemli?**

- Kimlik bilgilerinin tehlikeye atılması durumunda etkileri sınırlar
- Saldırganların tam erişim elde etmek yerine çoklu sistemler üzerinden yükselmesini gerektirir
- Bir denetim izi sağlar — CloudTrail hangi rolün ne yaptığını kaydeder
- Erişim hakkında bilinçli kararlar vermeyi zorlar — "bu hizmetin aslında neye ihtiyacı var?"

**Nerede karmaşık hale geliyor?**

- AWS'in her hizmet için (ve her hizmetin onlarca eylemi var) eylem/kaynak modelini anlamak gerekir
- Aşırı kısıtlayıcı politikalar uygulamaları bozuyor — birden çok hizmette "erişim reddedildi" hatalarını gidermek zaman alır
- IAM değişiklikleri, genellikle saniyeler içinde, bazen daha uzun sürede yayılır — kafa karıştırıcı zamanlama sorunlarına neden olabilir
- Hesaplar arası roller, güven politikası yapılandırması konusunda dikkatli olmaya ihtiyaç duyar

## Özet

- Üretimde **yönetici erişimini** kullanmayın — kurulum için, operasyonlar için değildir.
- IAM politikaları **Etki**, **Eylem** ve **Kaynak**'ı belirtir — hepsi için özel olun.
- Politikaları **gruplara** (insanlar için) ve **rollerlere** (hizmetler için) ekleyin.
- EC2 örnekleri, Lambda fonksiyonları ve diğer AWS hizmetleri, erişim anahtarlarını depolamak yerine **IAM rollerini** kullanmalıdır.
- **Ayrıcalık sınırları**, herhangi bir kimliğin sahip olabileceği maksimum izinleri, eklenen politikalar ne olursa olsun, sınırlar.
- **SCP'ler** (Servis Kontrol Politikaları), hatta yöneticilerin geçersiz kılmasını önleyemeyeceği kuruluş çapında kısıtlamaları uygular.
- **IAM Erişim Analizörü**, aşırı izinli politikaları ve kaynaklara harici erişimi tespit eder.

## Sınav İpuçları

*SAA-C03 Alanı: Güvenli Mimari Tasarımı (Alan 1, Görev 1.1)*

- **EC2 için IAM rolleri**: EC2'nin S3, DynamoDB, Secrets Manager veya herhangi bir AWS hizmetine erişmesi gerektiğinde kullanılan kanonik cevap. Kimlik bilgilerini bir örneğe saklamayın.
- **Politika değerlendirme mantığı**: IAM, bir istekte izin vermeyi/reddetmeyi değerlendirirken, açık bir **Reddetme** her zaman bir İzni bile geçersiz kılar. Varsayılan değer Reddetmedir.
- **Ayrıcalık sınırları**: IAM yönetimini devralmak için kullanılır. Senaryo: "Geliştiricilerin Lambda fonksiyonları için roller oluşturmasına izin verin, ancak onların sahip olduklarına izin vermekten öte izin vermelerine izin vermeyin." → Ayrıcalık sınırları.
- **SCP'ler izin vermez**: Sadece kısıtlar. Bir SCP S3'ü izin verse bile, S3 reddedilir. Bir SCP S3'ü reddetse bile, S3 reddedilir.
- **Kaynak tabanlı politikalar**: S3, SQS, Lambda gibi bazı AWS hizmetleri kaynak tabanlı politikalarla gelir — kimlik yerine kaynağa eklenen izinler. Bunlar IAM politikeleri ile birlikte çalışır.
- **Hesaplar arası erişim**: Hesap A'daki bir IAM rolü, Hesap B'nin bunu devralmasına izin veren bir güven politikası ile. Hesap B'nin kullanıcısı/rolü, Hesap A'daki geçici kimlik bilgilerini almak için `sts:AssumeRole` komutunu kullanır.
- **IAM Kullanıcıları vs. Federasyon Erişimi**: Büyük kuruluşlar için, IAM Kimlik Merkezi veya doğrudan bir IdP ile federasyon yoluyla federasyon erişimi (IAM Kullanıcıları yerine), bireysel IAM Kullanıcılarından daha tercih edilir.

## Uygulama Örnekleri

**Uygulama 1 — Hatırlama**

Bir kullanıcının eklediği bir IAM politikası ve bir rolün bir EC2 örneği tarafından devralınması arasındaki fark nedir? Her ikisini ne zaman kullanırsınız?

*(İpucu: Kimlik bilgilerini düşünün — nerede yaşarlar ve kim onları döndürür?)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir Lambda fonksiyonu, bir S3 deposundan okumalı ve bir DynamoDB tablosuna yazmalıdır. Bir geliştirici, basitleştirmek için geliştirme sırasında, fonksiyona "Yöneticici Erişimi" ile bir rol veriyor. Üretim ortamına geçmeden önce güvenlik ekibi, en az ayrıcalık ilkesini takip etmek istiyor.

Aşağıdakilerden hangisi **en iyi** yaklaşımdır?

A) Yeni bir IAM kullanıcısı oluşturun, S3 okuma ve DynamoDB yazma izinleriyle; bir erişim anahtarı oluşturun; anahtarı Lambda ortam değişkenlerinde saklayın.
B) Lambda fonksiyonunun yürütme rolüne bir iç politika ekleyin, belirli bir kovuzu ve belirli bir tabloya `s3:GetObject` ve `dynamodb:PutItem` yeteneklerini verin.
C) `AdministratorAccess`'i koruyun, ancak tüm eylemleri S3 ve DynamoDB'ye izin veren bir SCP ekleyin.
D) S3 okuma ve DynamoDB yazma izinlerine sahip bir IAM grubu oluşturun ve Lambda fonksiyonunu gruba ekleyin.

**İpuçku 1**: Lambda fonksiyonları erişim anahtarları kullanmaz, yürütme rolleri kullanır. Hangi seçenek bu kuralı uygular?

**İpuçku 2**: En az ayrıcalık, belirli kaynaklara yönelik belirli eylemleri ifade eder, geniş politikalar değil.

**İpuçku 3**: IAM grupları kullanıcıları, Lambda fonksiyonlarını içermez.

**Cevap**: B

**Açıklama**: Lambda yürütme rolü, fonksiyonun ihtiyaç duyduğu belirli izinlere sahip olmalıdır. Kovuzu (S3 kovuzu ARN'si) ve DynamoDB tablosunu (DynamoDB tablo ARN'si) hedef alan belirli eylemlere (`s3:GetObject`) ve belirli kaynaklara sahip olan inline politikaları en az ayrıcalık uygulamasıdır.

**Neden A?** Erişim anahtarlarının Lambda ortam değişkenlerinde saklanması, anahtarların Lambda konsoluna erişen veya yürütme bağlamı aracılığıyla okunabilmesi nedeniyle bir güvenlik antipatternidir. Lambda fonksiyonları, IAM'den geçici kimlik bilgilerini içeren yürütme rolleriyle çalışır.

**Neden C?** SCP'ler Organizasyon/hesap düzeyinde uygulanır ve fonksiyon başına izin kontrolü olarak işlev görmez. `AdministratorAccess` ile SCP kullanmak yanlış katmandır.

**Neden D?** Lambda fonksiyonları IAM gruplarına eklenebilir değildir. Gruplar yalnızca IAM kullanıcıları içindir.

*SAA-C03 Alanı: Güvenli Mimari Tasarımı - Görev 1.1*

**Görev 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus, üç ekibe büyüdü: çekirdek API ekibi, restoran ortak portal ekibi ve analiz ekibi. Her ekibin beş geliştiricisi ve paylaşılan bir AWS hesabına dağıtılıyor.

Aşağıdaki gereksinimleri karşılayan bir IAM yapısı tasarlayın:

- Her ekibin yalnızca kendi hizmetlerine erişmesini sağlayın
- Analiz ekibinin üretim veritabanlarına yazmasını önleyin
- Her ekibin hizmetleri için rol oluşturmasına izin verin, ancak kendi izinlerini yükseltmelerine izin vermeyin
- Platform ekibi tarafından yönetilebilen tüm hizmetlere erişebilen bir yönetici grubu sağlayın

Hangi IAM yapılarını kullanırdınız? İzin sınırları nerede uygulanırdı?

*(Tek bir doğru cevap yoktur. Amaç, çok ekli IAM tasarımı uygulamaktır.)*

## Kredilerden Sonraki Sahne

Leo, bir hafta sonu IAM'i yeniden yapılandırdı.

Pazartesi günü, her hizmetin ihtiyaç duyduğu izinlere sahip bir role sahip olduğu görüldü. Soo-Jin ve Rafael, gerçek iş fonksiyonlarına uygun grup üyeliğine sahipti. Leo kendisi, işini yapmasına izin veren ve daha fazlasını vermeyen, kendisi tarafından tasarlanan bir role erişim anahtarlarına sahip değildi.

Beklediğinden daha uzun sürdü.

Priya, Pazartesi sabahı çalışmalarını gözden geçirdi. Politika belgelerini dikkatlice okudu.

"Bu iyi," dedi.

"Teşekkürler," dedi Leo, JSON'a yenik düştüğünün rahatlığıyla.

"Bir şey bıraktın."

Leo gerginleşti.

"İlk sürümden eski dağıtım anahtarı. Bir GitHub Actions gizliğinde."

"Bu devre dışı bırakıldı."

Priya bir şeyler yazdı. "Devre dışı bırakıldı mı?"

Bir mola.

"Devre dışı bırakacağım," dedi Leo.

"Bulut İzleme, bunu geçen hafta üç API çağrısı yaptı."

Daha uzun bir mola.

"Birisi kullanıyordu," dedi Leo. "Ben araştıracağım."

Sonraki bölümde: yüzleri hatırlayan bir güvenlik görevlisi ve yalnızca rozetleri okuyan bir kapı.
