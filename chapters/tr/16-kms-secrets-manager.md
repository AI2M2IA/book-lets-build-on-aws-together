# Bölüm 16: Anahtarlar, Kilitler ve Gizli Veriler

Leo, kod geçmişini incelerken onu buldu. Bir veritabanı şifresi. Altı ay önce, artık Nimbus'ta çalışan olmayan biri tarafından, düz metin olarak commit edilmişti. Commit herkese açık. Şifre daha sonra değiştirilmişti – ama bunun kesin olmadığını bilmiyorlardı. Şifrenin dokunduğu her sistemi kontrol ettiler. Bu dört saat sürdü. O gün Nimbus, gizli verileri koda koymayı durdurmaya karar verdi.

**İki Sorun: Gizli Verileri Saklamak ve Verileri Şifrelemek**

Gizli bilgilere yönelik güvenlik, iki temel soruna sahiptir:

**İtibarları saklamak** (veritabanı şifreleri, API anahtarları, bağlantı dizeleri): Bunlar nerede yaşar? Kim erişebilir? Yenilerini yeniden dağıtmadan değiştirmek nasıl olur?

**Verileri şifrelemek** (müşteri bilgileri, ödeme kayıtları, PII): Birisi veritabanına veya S3 bucket'ına yetkisiz erişim elde ederse, veriyi okuyamayacağından emin olmak nasıl olur?

AWS, her soruna özel bir hizmete sahiptir:

- **AWS Secrets Manager**: İtibarları güvenli bir şekilde saklar ve yönetir
- **AWS KMS (Anahtar Yönetimi Hizmeti)**: Verileri şifrelemek ve şifalamak için şifreleme anahtarlarını yönetir

**AWS Secrets Manager: Artık Kodda Sabit İtibar Yok**

Secrets Manager, gizli bir depolama alanı olan güvenli bir depodur: veritabanı şifreleri, API anahtarları, OAuth jetonları, SSH anahtarları veya herhangi bir hassas bilgi.

Uygulamanızın bir şifreyi ortam değişkeninden veya yapılandırma dosyasından okuması yerine, uygulaması başlar (veya gerektiğinde) Secrets Manager API'sini çağırır ve gizli veriyi alır. Gizli veri asla diske dokunmaz. Kodda asla görünmez. Ortam değişkenlerinde veya yapılandırma dosyalarında bulunmaz.

İşte akışın nasıl göründüğü:

**Eski Yöntem**:

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

**Secrets Manager yolu**:

## Introduction to Secrets Manager

Secrets Manager, AWS'nin güvenli bir şekilde hassas verilerinizi (şifreler, API anahtarları, sertifikalar vb.) yönetmenize olanak tanıyan bir hizmettir. Bu, uygulamalarınızın ve altyapınızın güvenliğini artırmanıza yardımcı olur.

### What is Secrets Manager?

Secrets Manager, hassas verilerinizi güvenli bir şekilde saklamak, döndürmek ve yönetmek için bir hizmettir. Verilerinizi şifreleyerek ve erişim kontrolü uygulayarak, yetkisiz erişime karşı koruma sağlar.

### Key Features of Secrets Manager

*   **Secure Storage:** Hassas verilerinizi şifreleme ile güvenli bir şekilde saklar.
*   **Automatic Rotation:** Şifreler, API anahtarları ve sertifikalar gibi hassas verilerinizi otomatik olarak döndürür. Bu, güvenlik açıklarını azaltmaya yardımcı olur.
*   **Access Control:** Verilerinize kimlerin erişebileceğini kontrol etmenizi sağlar.
*   **Auditing:** Verilerinize kimin eriştiğini ve ne zaman eriştiğini izlemenizi sağlar.
*   **Integration with AWS Services:** AWS Lambda, Amazon EC2, Amazon ECS ve diğer AWS hizmetleriyle kolayca entegre olur.

### Getting Started with Secrets Manager

Secrets Manager'ı kullanmaya başlamak için aşağıdaki adımları izleyin:

1.  AWS Management Console'a gidin ve Secrets Manager'ı arayın.
2.  "Create a secret" (Bir sır oluştur) seçeneğini tıklayın.
3.  Sırınız için bir ad, tür ve şifreleme seçin.
4.  Sırınızı oluşturduktan sonra, erişim izinlerini yapılandırın.

### Example: Storing a Database Password

Secrets Manager'ı kullanarak bir veritabanı şifresini nasıl saklayacağınızın bir örneği:

1.  Secrets Manager'da yeni bir sır oluşturun.
2.  Sırınız için bir ad (örneğin, `database-password`) ve tür (örneğin, `string`) seçin.
3.  Sırınızı oluşturduktan sonra, şifreyi güvenli bir şekilde saklayın.
4.  Uygulamanızda şifreyi Secrets Manager'dan alıp kullanabilirsiniz.

### Using the AWS CLI with Secrets Manager

Secrets Manager'ı AWS CLI ile de kullanabilirsiniz. İşte bazı yaygın CLI komutları:

*   `aws secretsmanager create-secret`: Yeni bir sır oluşturur.
*   `aws secretsmanager get-secret-value`: Bir sırın değerini alır.
*   `aws secretsmanager delete-secret`: Bir sır siler.

```

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']

The EC2 instance needs an IAM role with permission to call `secretsmanager:GetSecretValue` for that specific secret. No other service can read it. The secret is never in the code.

**Automatic Rotation: The Real Gücü**

The greatest feature of Secrets Manager isn't storing secrets — it’s rotating them automatically.

Here's the scenario: every 30 days, Secrets Manager generates a new database password, updates it in RDS, updates the stored secret, and your application retrieves the new password the next time it needs it. No manual intervention. No deployment. No “I need to remember to rotate this.”

The rotation is implemented as a Lambda function. AWS provides templates for RDS databases (MySQL, PostgreSQL, Aurora). You can customize the function for any credential type.

Tom had a soru sorusu about cost. (Of course he did.)

Secrets Manager charges per secret per month plus per API call. For a small number of database passwords and API keys, the cost is dollars per month — negligible compared to the cost of an incident.

“The compromise last week,” Priya said, “what would it have cost to investigate and remediate?”

Tom was quiet for a moment. “Including my time, your time, Leo’s weekend... couple thousand dollars.”

“Secrets Manager would have caught the static key before it was exploited. And it would have rotated it automatically.”

Tom pulled up the pricing page.

**AWS KMS: The Lock Factory**

AWS KMS (Key Management Service) manages **kriptografik anahtarlar** — the secret values used to encrypt and decrypt data.

The analogy: KMS is like a lockbox company that holds the master key. Your data (the contents of the box) is encrypted. Only someone with permission to use the KMS key can decrypt it. KMS logs every use of every key in CloudTrail.

**Müşteri Anahtar Anahtarları (CMKs)** — now called KMS anahtarları — come in two types:

**AWS yönetilen anahtarlar**: AWS creates and manages the key automatically for services like S3, EBS, RDS. You don't control the key directly, but you can see it's being used. Free.

**Müşteri yönetilen anahtarlar**: You create the key in KMS and control every aspect of it: who can use it, when it rotates, who can administer it. You can enable automatic annual rotation. Cost: $1/month per key plus per-API-call charges.

**KMS ile AWS Hizmetlerinde Şifreleme**

Çoğu AWS hizmeti, şifreleme için KMS ile entegre olur:

**S3**: Bir kutu için "KMS ile sunucu tarafında şifreleme"yi etkinleştirin. Her nesne, KMS anahtarıyla dinlenme sırasında şifrelenir. Bir nesneyi okumak, hem S3 kutusu hem de KMS anahtarına erişim izni gerektirir.

**RDS**: Oluşturma sırasında şifrelemeyi etkinleştirin. Veritabanı depolama, yedeklemeler ve anlık görüntüler, tümü KMS anahtarıyla şifrelenir. Not: bir şifreleme, şifrelenmemiş bir RDS örneğine etkinleştirilemez — bir anlık görüntü oluşturmanız, anlık görüntüyü şifrelenmiş bir şekilde kopyalamanız ve ardından geri yüklemeniz gerekir.

**EBS**: KMS ile hacimleri şifreleyin. Şifrelenmiş anlık görüntülerden oluşturulan yeni hacimler otomatik olarak şifrelenir.

**DynamoDB**: KMS ile dinlenme sırasında tablo için varsayılan olarak şifreleme etkinleştirilir.

**ElastiCache Redis**: Hassas önbelleğe alınmış veriler için KMS ile dinlenme sırasında şifreleme.

Prensip: Veriler dinlenme sırasında (diske kaydedilirken) ve iletim sırasında (bir ağ üzerinden hareket ederken) şifrelenmelidir. KMS, dinlenme sırasında şifrelemeyi yönetir. TLS/SSL (AWS hizmetleri tarafından otomatik olarak sağlanır) iletim sırasında şifrelemeyi sağlar.

**Envelop Şifrelemesi: KMS Nasıl Çalışır**

Bu ayrıntı, KMS davranışını ve sınav sorularını anlamanıza yardımcı olur.

KMS, çoğu durumda verilerinizi doğrudan şifrelemez. **Envelop şifrelemesini** kullanır:

1. KMS, bir **veri anahtarı** (benzersiz simetrik anahtar) oluşturur
2. Hizmet, veri anahtarını kullanarak verilerinizi yerel olarak şifreler (simetrik şifreleme hızlıdır)
3. Hizmet, KMS'den veri anahtarını şifrelemek ister (kullanılan KMS anahtarınızla)
4. Hem şifreli veri hem de şifreli veri anahtarı saklanır
5. Gerçek verileriniz asla hizmette kalmaz — yalnızca veri anahtarı KMS'ye şifreleme/şifre çözme için gider
6. Verileri okurken:

1. Hizmet, KMS'den veri anahtarını şifrelemeyi ister
2. KMS, izinleri kontrol eder, veri anahtarını şifreler, geri verir
3. Hizmet, şifreli veri anahtarı kullanarak verilerinizi yerel olarak şifreler

Bu, KMS'nin çok büyük verileri KMS API'si üzerinden tümünü göndermeden işleyebileceği anlamına gelir. Sadece küçük anahtarlar KMS'ye gider. CloudTrail, her şifreleme ve şifre çözme işlemi için her KMS API çağrısını kaydeder — her şifreleme ve şifre çözme işlemi.

**Secrets Manager vs Parameter Store**

AWS ayrıca, yapılandırma değerlerini (sadece sırların değil) depolayan **Sistem Yöneticisi Parameter Store**'u da sunar. Parameter Store, standart parametreler için ücretsizdir. Aynı zamanda KMS ile şifrelenmiş parametreleri de depolayabilir.

Sıcak rotasyon için: Secrets Manager.

Yapılandırma değerleri ve hassas olmayan parametreler için: Parameter Store (ücretsiz tier çok cömert).

Uygulama yapılandırması (port numaraları, özellik bayrakları, ortam özel ayarları) için: Parameter Store.

## Güçlü Yönler ve Sınırlamalar

**AWS Secrets Manager**:

- Kodsuz değişiklikleri gerektirmeyen gizli sırların otomatik döndürmesi
- Her gizli sır için ayrıntılı IAM erişim kontrolü
- Sürümleme (döndürme sırasında önceki sürümü erişin)
- CloudTrail aracılığıyla denetim
- Maliyet: ~0,40/gizli sır/ay + API çağrıları

**AWS KMS**:

- Tam denetim izliğine sahip merkezi anahtar yönetimi
- Müşterilerin yönettiği anahtarlar için yıllık anahtarın otomatik döndürmesi
- Anahtar politikaları (kaynak tabanlı politikalar) + IAM politikaları ile her anahtar için ayrıntılı IAM izinleri
- Bir HSM'de asla bulunmayan anahtarlar — anahtarlar asla HSM'de bulunmaz
- Maliyet: 1/ay anahtarı + 0,03/10.000 API çağrısı

**Bu karmaşık hale geldiğinde**:

- KMS anahtar politikaları, IAM politikalarıyla ayrı olarak değerlendirilir — hata ayıklamak karmaşık olabilir
- Dinlenme sırasında şifreleme planlanmalıdır — mevcut şifrelenmemiş bir RDS örneğini yerinde şifrelemek mümkün değildir
- KMS'de anahtar silme 7-30 günlük bir bekleme süresi (bir güvenlik mekanizması — kaybedilen anahtarlar kayıp veriye yol açar)
- Secrets Manager maliyetleri, büyük ölçekte sırların ve API çağrıların sayısı ile ölçeklenir

## Özeti

- Kimlik bilgilerini asla kodda, ortam değişkenlerinde veya sürüm kontrolüne bağlı yapılandırma dosyalarında yerleştirmeyin.
- **Secrets Manager**, kimlik bilgilerini güvenli bir şekilde saklar ve bunları otomatik olarak döndürür. Uygulamalar, API üzerinden sırları alır.
- **KMS**, şifreleme anahtarlarını yönetir. Çoğu AWS hizmeti, dinlenme sırasında şifreleme için KMS ile entegre olur.
- **Dinlenme sırasında şifreleme** (diske yazılan veriler), AWS veya siz tarafından yönetilen KMS anahtarları kullanılarak şifrelenir. **İletimde şifreleme** TLS kullanır.
- **Uyku şifrelemesi**: KMS, veriyi doğrudan şifrelemez, bunun yerine küçük bir veri anahtarını şifreler. Hizmet, yerel bir veri anahtarıyla veriyi şifreler.
- **Müşteri yönetilen KMS anahtarları**: döndürme, erişim ve denetim üzerinde tam kontrol. **AWS yönetilen anahtarlar**: otomatik, yapılandırmaya gerek yoktur.
- **Parameter Store**, hassas olmayan yapılandırma değerleri için Secrets Manager'in daha hafif bir alternatifi.

## Sınav İpuçları

*SAA-C03 Alanı: Güvenli Mimari Tasarımı (Alan 1, Görev 1.3)*

- **Secrets Manager vs SSM Parameter Store**: Otomatik döndürme gerektiğinde kimlik bilgilerini saklamak için Secrets Manager ve genel yapılandırma için Parameter Store. Sınav, döndürme gereksinimini ve maliyet hassasiyetini ayırır.
- **KMS anahtar politikaları**: Bir KMS anahtarı, kaynak tabanlı bir politika olan kendi anahtar politikasını sahiptir. IAM politikaları tek başına bir KMS anahtarına erişim sağlamaz — anahtar politikası bunu açıkça izin vermelidir.
- **RDS'yi Şifreleme**: Mevcut şifrelenmemiş bir RDS örneğinde şifreleme etkinleştirmek mümkün değildir. Süreç: bir yedeği alın → şifreli bir yedekle kopyalayın → şifreli yedekten geri yükleyin → yeni örneğe trafiği yönlendirin
- **EBS şifrelemesi**: Şifreli hacimler yeni oluşturulabilir. Şifreli hacimlerin yedeği her zaman şifrelenir. Şifrelenmemiş hacimler doğrudan şifrelenemez — yedeği alın + kopyalayın + geri yükleyin.
- **CloudTrail + KMS**: Her KMS API çağrısı CloudTrail'de kaydedilir. Bu, önemli bir uyumluluk özelliğidir.
- **Çok Bölgesel KMS anahtarları**: Şifreli veriler olmadan çapraz bölge API çağrıları yapmadan şifre çözme için anahtar materyalini birden çok bölgeye çoğaltın. Sınav, bu çok bölge kurtarma için kullanılır.
- **KMS vs CloudHSM**: KMS çok kiracıdır (AWS tarafından yönetilir). CloudHSM yalnızca siz kontrol edebilirsiniz. Sinyal: "FIPS 140-2 Seviye 3", "bağlı HSM", "müşteri yönetilen kriptografik işlemler" → CloudHSM.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Uyku şifrelemesinin kavramını açıklayın. KMS, uygulamanızın verisini doğrudan şifrelemek yerine küçük bir veri anahtarını neden şifreler?

*(İpucu: 1 GB'lık veriyi şifrelemek ve 1 GB'ı uzak bir KMS hizmetine göndermekle ilgili performans etkilerini düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Hassas müşteri verilerini bir RDS MySQL veritabanında depolayan bir finansal hizmetler şirketi vardır. Yeni bir uyumluluk gereksinimi, tüm verilerin dinlenme sırasında şifrelenmesini zorlar. Tüm şifreleme anahtarı kullanımı denetlenebilir olmalıdır. Şifreleme anahtarları AWS tarafından yönetilmemelidir. Veritabanı altı ay önce şifreleme etkinleştirilmeden oluşturulmuştur. Hangi eylem seti dört gereksinimi en iyi şekilde karşılar?

A) Mevcut veritabanında şifreleme etkinleştirin; bir müşteri yönetilen KMS anahtarı oluşturun; 90 günlük döndürme ile Secrets Manager'ı yapılandırın
B) Mevcut veritabanının bir yedeğini alın; bir müşteri yönetilen KMS anahtarı kullanarak yedeği şifreleyin; şifreli yedeğinden geri yükleyin; 90 günlük döndürme ile Secrets Manager'ı yapılandırın
C) Bir AWS yönetilen anahtarı ile yeni şifreli bir RDS örneği oluşturun; eski örneğe verileri taşıyın; 90 günlük döndürme ile Secrets Manager'ı yapılandırın
D) Mevcut veritabanında AWS yönetilen bir anahtarı kullanarak dinlenme sırasında şifreleme etkinleştirin; 90 günlük döndürme ile Secrets Manager'ı yapılandırın

**İpucu 1**: Mevcut şifrelenmemiş bir RDS örneğinde şifreleme etkinleştirmek mümkün değildir.

**İpucu 2**: "Müşteri yönetilen" anahtarlar, AWS tarafından yönetilen anahtarlar anlamına gelir.

**İpucu 3**: Yedekleme kopyalama süreci, şifreli RDS'ye aktarım için standart yoldur.

**Cevap**: B

**Açıklama**: RDS şifrelemesi, mevcut bir örneğe uygulanamaz. Standart yaklaşım şöyledir: mevcut örneği yansıtın → müşteri yönetilen bir KMS anahtarıyla şifreli etkinleştirilmiş bir yansıtma oluşturun (gereksinim 1, 2 ve 3'ü karşılar) → şifreli yansıtmadan geri yükleyin. Müşteri yönetilen KMS anahtarları, CloudTrail'de tüm kullanımı otomatik olarak kaydeder (denetleme) ve şifreleme anahtarlarını sizin kontrolünüzde tutar. Secrets Manager, otomatik 90 günlük şifre rotasyonunu yönetir (gereksinim 4'ü karşılar).

**Neden A?** Mevcut şifrelenmemiş bir RDS örneğine yerinde şifreleme etkinleştirilemez.

**Neden C?** AWS yönetilen anahtarlar, "müşteri tarafından kontrol edilen" gereksinimini karşılamaz (gereksinim 3).

**Neden D?** A ile aynı sorun (yerinde etkinleştirilemez) artı AWS yönetilen anahtar gereksinim 3'ü karşılamaz.

*SAA-C03 Alanı: Güvenli Mimari Tasarımı — Görev 1.3*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus'un aşağıdaki hassas verileri saklaması gerekir:

- Üretim RDS örneği için veritabanı şifresi
- Ödeme işleme için Stripe API gizli anahtarı
- Müşteri sipariş geçmişini DynamoDB'de şifrelemek için kullanılan simetrik bir şifreleme anahtarı
- Restoranlara özel yapılandırma değerleri (API uç noktaları, özellik bayrakları - hassas değil)

Her biri için hangi AWS hizmetini veya yaklaşımı kullanırdınız? Her biri için hangi rotasyon stratejisini uygulamak isterdiniz?

*(Tek bir doğru cevap yoktur. Amaç, güvenlik araçlarını kullanım durumlarına eşleştirme pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Sırların taşınmıştı.

Şifreler: Secrets Manager, her 30 günde bir döndürülür.

API anahtarları: Secrets Manager, ödeme sağlayıcının API'sini arayan bir Lambda ile yeni bir anahtar oluşturarak yeni anahtarları döndüren bir rotasyon Lambda ile.

Müşteri sipariş verileri: müşteri yönetilen bir KMS anahtarıyla şifrelenir.

Eski kimlik bilgilerini devre dışı bırakıldı. Eski yapılandırma dosyaları silindi. Eski GitHub Actions sırları kaldırıldı.

"Şimdi denetlenebilir hale geldik," dedi Priya.

"Denetlenebilir hale ne demek?" dedi Maya.

"Eğer bir uyumluluk denetçisi bize hiçbir kimliğin kodumuza gömülü olmadığını veya altyapımızda açığa çıkarılmadığını kanıtlamamızı istiyorsa, bize gösterebilirdik: Her sır Secrets Manager'da, her şifreleme anahtarı KMS'de, her erişim CloudTrail'de kaydedilir."

"CloudTrail günlüklerini son birisi kontrol ettiğinde ne zaman oldu?"

Bir duraklama.

"Ben onları her hafta kontrol ediyorum," dedi Priya.

"Ve bir şeyin alışılmadık ortaya çıkması durumunda bunu nasıl bilecektiniz?"

"O," dedi Priya, dizüstü bilgisini kapatarak, "bir sonraki konuşmadır."

Bir sonraki bölümde: Nimbus ve internet arasında duran savunma katmanları.
