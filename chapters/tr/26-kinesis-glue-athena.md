# Bölüm 26: Her Şeyi Anlamak

Veri hamdır: zaman damgaları, tıklamalar, olaylar, sayılar. Bilgi, verilerin organize edilmesi, işlenmesi ve bağlamlandırılmasıyla elde edilen şeydir. Bu iki arasındaki boşluk, bu bölümün hayatını yayan noktadır.

Ve büyüyen sistemlerde, bu boşluk hızla pahalı hale gelir.

Nimbus, muazzam miktarda veri üretiyordu. Her sipariş: kaydedildi. Her menü görünümü: günlüğe kaydedildi. Her restoran güncellemesi: yakalandı. Her müşteri etkileşimi: izlendi.

Tom bir soruyu sordu.

"Cuma günlerinde en yoğun sipariş saatimiz nedir?"

Leo ona baktı. "Bu, kontrol panelimizde yok."

"Ekleyebilir miyiz?"

"Veri DynamoDB'de. Ve CloudWatch günlüklerinde. Ve analitik dışa aktarma işi tarafından S3'te." Leo duraksadı. "Üç farklı yerde, üç farklı formatta."

Maya ekledi: "Analitik dışa aktarma yalnızca bir gece çalışır. Cuma verileri için, Cumartesi sabahına kadar beklemek zorunda kalırsınız."

Tom ekrana baktı. "Veriye sahibiz. Bunu kullanamıyoruz."

Bu cümle, modern analitiklerin yarısını tanımlıyor.

Bu, veri mühendisliği problemidir: Veriye sahipsiniz, ancak analiz etmek istediğiniz biçimde değildir.

**Üç Farklı Problem**

Nimbus'un veri problemi üç boyutta yaşandı:

**Gerçek Zamanlı Akış**: Siparişler şu anda yerleştiriliyor. Sipariş hızı hakkında canlı bir kontrol paneli görmek istiyorsunuz - dakika başına, bölge başına, restoran başına sayılar. Veri, geldiği anda işlenmelidir.

**Veri Dönüşümü**: Veri, çeşitli sistemlerden S3'te, farklı formatlarda (JSON, CSV, Parquet) bulunur. Analiz etmeden önce aynı şemaya, aynı formata, temizlenmiş ve referans verilerle birleştirilmiş olarak normalleştirmeniz gerekir.

**Hızlı Analiz**: Veriler organize olduktan sonra, veritabanına yüklemeden SQL sorguları çalıştırmak istiyorsunuz. "Son 30 gün içinde gelir açısından en iyi 10 restoranı bana verin." Verileri bir veritabanına yüklemeden.

Her biri ayrı bir problemdir. AWS, her biri için özel bir hizmete sahiptir:

- **Amazon Kinesis**: Gerçek zamanlı veri akışı
- **AWS Glue**: Veri dönüştürme ve kataloglama
- **Amazon Athena**: S3 üzerinde sunucusuz SQL sorguları

**Amazon Kinesis: Gerçek Zamanlı Gösterge Tablosu**

**Amazon Kinesis Data Streams** gerçek zamanlı veri akışı hizmetidir. Üreticiler, verileri akışa gönderir. Birden fazla tüketici, her biri kendi hızında akıştan okuyabilir.

Bir fiyat gösterge tablosu makinesini düşünün: Fiyatlar sürekli olarak yazdırılır, herkes şeridi okuyabilir ve şerit, herhangi bir bireysel okuyucunun yavaşlamasına izin vermez.

Nimbus için, bir sipariş yerleştirildiğinde, uygulama bir olay Kinesis akışına yayınlar: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Bu akışın tüketicileri:

- Canlı bir kontrol paneli (olayları geldikçe okur, metrikleri günceller)
- Bir dolandırıcılık tespiti Lambda (olağan dışı sipariş kalıpları arar)
- Kalıcı depolama için bir akış S3'e

**Kinesis Data Streams kavramları**:

- **Shard**: Kapasite biriminin temelidir. Bir shard, 1 MB/s yazma, 2 MB/s okuma işlemini işler.
- **Saklama dönemi**: Veri, akışta 24 saat (varsayılan) ile 7 gün arasında kalır.
- **Dizi numarası**: Her kaydın bir dizi numarası vardır. Tüketiciler, akışta konumlarını izler.

**Amazon Data Firehose** (eski adıyla **Kinesis Data Firehose**): Akış yapan üreticiler ve S3, Redshift ve OpenSearch gibi hedeflere veri teslim etme yönetilen hizmetidir. Verileri otomatik olarak tamponlar, sıkıştırır, dönüştürür ve teslim eder.

Nimbus için: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet formatında, tarihe göre bölümlenmiş, sıkıştırılmış)

**AWS Glue: Çevirmen**

S3'teki veri hamdır. Analiz etmek için verimli bir şekilde kullanmadan önce:

- Var olan şeyin ne olduğunu ve şemasını keşfedin (sütunlar, türler)
- Aynı formata dönüştürün
- Farklı veri kümelerini birleştirin
- Kötü kayıtları, şema değişikliklerini, eksik değerleri ele alın

**AWS Glue** tam olarak yönetilen bir ETL (Çıkar, Dönüştür, Yükle) hizmetidir. İki ana bileşeni vardır:

**Glue Veri Kataloğu**: S3 verilerinizin meta verilerini depolayan bir depodur - hangi tabloların olduğunu, hangi sütunlara sahip olduklarını, veri dosyalarının nerede olduğunu. Veri gölünüz için bir katalog gibi.

**Glue Tarayıcıları**: S3'ü tarayan, şema çıkarıp, Veri Kataloğuna popüle eden otomatik ajanlardır. S3'ünüzü tarayan bir tarayıcı çalıştırırsanız 10 dakika içinde tüm tablolarınızın bir kataloğuna sahip olursunuz.

**Glue İşleri**: Sunucusuz Spark/Python işleridir ve dönüşüm mantığını (veya Glue'nin görsel ETL aracını kullanırsanız) gerçekleştirir. Glue, mantığı çalıştırır ve yönetilen altyapıda çalıştırır.

Nimbus için:

1. Glue Tarayıcı, S3'teki sipariş verilerini tarar → Glue Veri Kataloğunda bir tablo tanımını oluşturur
2. Glue İş'i, ham JSON sipariş olaylarını temiz, bölümlenmiş Parquet formatına dönüştürür
3. Dönüştürülmüş veri, sorgu optimize edilmiş bir düzenle S3'e yazılır

**Amazon Athena: Kütüphaneci**

**Amazon Athena**, bulut tabanlı, etkileşimli sorgu hizmetidir. SQL sorgularını doğrudan S3 verileri üzerinde çalıştırır. Kurulacak bir veritabanınız yok, yüklemeniz gereken veri yok. Bir tablo (veya Glue Veri Kataloğu'nu kullanırsınız) tanımlar, SQL yazarsınız ve Athena, S3 dosyalarına karşı sorguyu çalıştırır.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Athena fiyatlandırması, sorgunun taradığı veri miktarına göre belirlenir. Birçok bölgede standart SQL sorguları terabayt başına 5 dolar ile başlar. Parquet formatını (sütun tabanlı) kullanarak ve bölümleme budaması (`WHERE year='2024' AND month='01'`) ile Athena yalnızca ihtiyaç duyduğu dosyaları tarar, bu da maliyeti önemli ölçüde azaltır.

"Bu sorguyu 30 gün değerindeki veriler için çalıştırabiliriz," dedi Leo, "ve eğer iyi saklarsak, maliyeti şaşırtıcı derecede düşük olabilir."

"Herhangi bir soruyu düşünsene?" diye sordu Tom.

"SQL'de ifade edebileceğimiz herhangi bir soru, S3'te sakladığımız herhangi bir veri üzerinde."

Tom, atılan tüm verilerin değerini yeniden hesaplayan bir bakış açısına sahipti.

**Veri Göleti Mimarisi**

Bu üç hizmet, **veri göleti mimarisi** olarak adlandırılan bir birime birleşir — tüm verileriniz için merkezi bir S3 deposu, bu verileri işlemek ve sorgulamak için araçlarla birlikte:

```
Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)
```

# Hamra Veri: Her Zaman Saklıdır (Orijinal S3 Depolama Alanında) - Dönüştürülmüş Veri, Athena ile Sorgulanabilir. Yeni sorular, ham veriler üzerinde yeni Glue işleri çalıştırılarak her zaman yanıtlanabilir.

**Amazon Redshift: Athena Yeterli Değilse**

Bazı kullanım durumlarında Athena çok yavaş veya çok pahalı olabilir:

- Çok karmaşık sorgular, birçok birleşimle
- Aynı sorguyu günde binlerce kez çalıştıran panolar
- Yapılandırılmış veriler üzerinde makine öğrenimi
- BI araçları için saniyen altında yanıt verme gereksinimleri

**Amazon Redshift** tam olarak yönetilen bir veri ambarıdır: büyük, tekrarlanan analitik iş yükleri için tasarlanmış, sütunlu bir analitik veritabanıdır. Athena gibi, verinin S3'teki bulunduğu yerde sorgulamak yerine, Redshift veriyi optimize edilmiş depo depolama alanına yükler ve karmaşık analitikleri hızlandırmak için sorgu optimizasyonu, sıralama stratejileri ve dağıtım stratejileri kullanır.

Redshift, karmaşık analitik sorgular için Athena'dan önemli ölçüde daha hızlıdır, ancak maliyet (tahminli kapasite) ve sorgu yapmadan önce veriyi yükleme gereksiniminin bedelidir.

**Redshift Serverless** kapasite planlama yükünü ortadan kaldırır - sorguladığınızda, Redshift ölçeklenir. Maliyet sorguya göre belirlenir.

Nimbus'un mevcut ölçeğinde: Athena yeterlidir. Veri hacmi beş katına çıktığında ve BI araçlarının aynı panoları günde yüzlerce kez sorgulaması durumunda, Redshift maliyet açısından daha uygun hale gelecektir.

## Güçlü Yönler ve Sınırlamalar

**Kinesis Data Streams**: Verileriniz sürekli olarak geldikçe ve sıranın önemli olduğu durumlarda (tıklama akışları, finansal işlemler, IoT telemetrisi) Kinesis'i kullanın; Kinesis, shard içindeki kayıt sırasını korur ve yapılandırılmış tutma penceresi sırasında yeniden oynatma olanağı sağlar, bu da onu SQS'den temel olarak farklı kılar. Ticari bir ödül, provisioned modda shard kapasitesini ve tüketici davranışını yönetme gereksinimidir. Basit görev kuyrukları için, sıranın önemli olmadığı ve yeniden oynatılmadığı durumlarda SQS daha basit bir seçimdir.

**AWS Glue**: Glue, geleneksel bir ETL kümesinin altyapısını ortadan kaldırır. Dönüşüm mantığını yazarsınız, AWS Spark ortamını yönetir. Dönüşümler karmaşık olduğunda veya veri hacimleri büyük olduğunda bu değerlidir. Sınırlama maliyet ve soğuk başlangıçtır - Glue işleri birkaç dakikalık bir başlangıç gecikmesine sahiptir, bu da yakın gerçek zamanlı dönüşümler için uygun değildir. Basit dosya biçimlerinden dönüşümler (CSV'yi Parquet'e dönüştürme) için Glue'nin yükü, Lambda fonksiyonu veya hafif bir betik ile karşılaştırılamayacak kadar yüksek olabilir.

**Amazon Athena**: Athena, standart SQL ve yönetmeniz gereken herhangi bir altyapı gerektirmeden S3 verilerini sorgulamanıza olanak tanır. Kritik bir kısıtlamadır maliyet: Athena, taranan her terabayt veri için ücretlendirilir. 10 TB'lık bir tabloyu tümünü taraması gereken aynı sorgu, aynı sorguyu 200 GB'ı tarayan ve Parquet formatında bölümlenmiş bir tablo üzerinde çalıştığında maliyetli olacaktır. Athena'yı üretimde kullanırken, bu optimizasyonları kullanın. Athena'nın faturalandırması sizi şaşırtabilir.

## Özet

- **Amazon Kinesis**: Gerçek zamanlı veri akışı. Üreticiler kayıtleri yazar, tüketiciler kendi hızlarında okur. Amazon Data Firehose, veri akışını S3, Redshift ve diğer hedeflere daha az operasyonel çaba ile iletmek için sağlayabilir.
- **AWS Glue**: ETL ve veri kataloglama. Crawler'lar şemaları keşfeder, Jobs veriyi dönüştürür, Data Catalog verinin Athena ve diğer araçlar tarafından bulunabilir olmasını sağlar.
- **Amazon Athena**: S3'teki Serverless SQL. Standart SQL kullanarak herhangi bir veriyi S3'te sorgulayın. Taranan her TB için ücretlendirilir - maliyeti en aza indirmek için Parquet ve bölümlendirme kullanın.
- **Amazon Redshift**: Yüksek performanslı analizler için yönetilen bir veri ambarıdır. Veriyi yükleyin, tekrarlanan analitik sorgular için optimize edin ve depo ölçeğinde hızlı bir şekilde sorgulayın.
- **Veri Gölü Deseni**: Ham veri -> S3 -> Glue onu dönüştürür -> Athena sorgular -> BI araçları görselleştirir.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarlamak (Alan 3, Görev 3.5)*

- **Kinesis ile SQS**: Kinesis = sıralı, gerçek zamanlı akış, çoklu tüketiciler, retansiyon penceresi içinde yeniden oynatma. SQS = görev kuyruğu, her mesaj bir kez işlenir. "Aynı akışın aynı anda birden fazla tüketici tarafından okunması" → Kinesis. "Her mesaj için bir işçi" → SQS.
- **Athena sınav sinyalleri**: "S3 üzerinde sunucusuz SQL", "S3 verilerini bir veritabanına yüklemeden analiz etme", "soru başına ödeme" → Athena.
- **Athena maliyet optimizasyonu**: Sütun formatı (Parquet veya ORC) + bölümleme, taranan veri miktarını ve maliyeti önemli ölçüde azaltır. Sınavda Athena maliyetlerini azaltma yöntemleri sorulabilir.
- **Glue Crawler**: "S3 verilerinin şemasını otomatik olarak keşfetme" → Glue Crawler.
- **Amazon Data Firehose**: "Akış verilerini S3/Redshift/OpenSearch'e tüketici yönetimi olmadan otomatik olarak yükleme" → Amazon Data Firehose. Eski materyaller hala Kinesis Data Firehose adını taşıyabilir.
- **Redshift ile Athena**: Redshift, sabit bir veri kümesi üzerinde yüksek frekanslı, karmaşık sorgular için kullanılır (BI panoları). Athena, sık sık değişen S3 verileri üzerinde atıl sorgular için kullanılır.
- **EMR (Elastic MapReduce)**: AWS tarafından yönetilen Hadoop/Spark kümeleri. Bu, "varolan Hadoop/Spark iş yükleri" veya "özel veri işleme çerçeveleri" belirtildiğinde kullanılır. Çoğu kullanım durumu için Glue, yönetilen alternatiftir.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Amazon Kinesis ve Amazon SQS arasındaki farkı açıklayın. Her ikisini ne zaman kullanırsınız?

*(İpucu: Aynı verilere kaç tüketici okuyabilir, mesajların okuma sonrasında silinip silinmeyeceği ve sıranın önemli olup olmadığı gibi konuları düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir paylaşım platformu şirketi, yolculuk verilerini analiz etmek istiyor. 1 milyon yolculuk günlük olarak tamamlanıyor. Yolculuk kayıtları, JSON dosyaları (yaklaşık 2KB) olarak S3'te saklanıyor. Analitik ekibi, "son haftanın ortalama yolculuk süresi şehir başına" gibi atıl SQL sorgularını çalıştırmak istiyor. Sorguların 2 dakikadan kısa sürede tamamlanması ve maliyetlerin en aza indirilmesi gerekiyor. Takım haftada 20-30 sorgu çalıştıracak.

Bu gereksinimleri en iyi karşılayan mimari hangisidir?

A) Yolculuk verilerini günlük olarak RDS PostgreSQL'e yükleyin ve standart SQL ile sorgulayın.
B) JSON'u Parquet formatına dönüştürerek, tarihi ve şehire göre bölümleyerek Glue ile dönüştürün ve Athena ile sorgulayın.
C) Yolculuk verilerini Amazon Data Firehose ile Redshift'e iletin ve Redshift ile sorgulayın.
D) Yolculuk verilerini DynamoDB'ye yükleyin ve PartiQL ile SQL sorgularını çalıştırın.

**İpucu 1**: Haftada 20-30 sorgu, düşük frekanslı bir sorgulama senaryosudur. En uygun maliyetli hizmet hangisidir?

**İpucu 2**: Parquet formatı + bölümleme, Athena tarafından taranan veri miktarını önemli ölçüde azaltır — ve dolayısıyla maliyeti düşürür.

**İpucu 3**: 1 milyon yolculuk × 2KB = ~2GB/gün. Bir hafta için ~14GB. Athena için 1 TB başına 5$ fiyatlandırmasıyla, optimizasyon olmasa bile bu uygun fiyatlıdır.

**Cevap**: B

**Açıklama**: Glue, JSON'u Parquet (sütun formatı taranan veri miktarını önemli ölçüde azaltır) formatına dönüştürür ve tarihi ve şehire göre bölümleyerek ("son hafta" sorguları yalnızca 7 günlük bölümleri tarar). Athena, S3'ü standart SQL ile sorgular. Haftada 20-30 sorgu için, sürekli çalışan Redshift'in per-query fiyatlandırması, Athena'nın per-query fiyatlandırmasından çok daha pahalıdır.

**Neden A?** 2GB'lık veri günlük olarak RDS PostgreSQL'e yüklenir ve ardından sorgulanır. Bu, 20-30 sorgu haftada 7 gün boyunca çalıştırılacak bir veritabanı örneğinin sürekli olarak çalıştırılması anlamına gelir. 20-30 sorgu haftada için bu aşırı mühendislik ve maliyetlidir.

**Neden C?** Redshift, yüksek frekanslı sorgular için (günde yüzlerce veri kümesi üzerinde) uygundur. Haftada 20-30 sorgu için, sürekli çalışan Redshift örneği, Athena'nın per-query fiyatlandırmasından çok daha pahalıdır.

**Neden D?** DynamoDB, anahtar-değer/belge depolama alanıdır ve anahtara dayalı erişim için optimize edilmiştir, atıl analitik sorgular için değildir. PartiQL, DynamoDB üzerinde tanımlanmış değildir ve tarif edilen GRUPLAMA BY özetlemeleri desteklemez.

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla — Görev 3.5*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, siparişler için gerçek zamanlı dolandırıcılık tespiti sistemi oluşturmak istiyor. Sistem aşağıdaki özellikleri sağlamalıdır:

- Aynı hesaptan 60 saniyedeki 5'ten fazla siparişin tespiti
- 500$'ın üzerinde yeni hesaplardan (< 30 gün) gelen siparişlerin işaretlenmesi
- İşaretli siparişlerin insan inceleme kuyruğuna gönderilmesi

Mimariyi tasarlayın. Kinesis ne sağlıyor? Dolandırıcılık mantığı nerede çalışıyor? "Aynı hesap, 60 saniyelik pencere" nasıl ilişkilendiriliyor? İşaretli siparişlerin alındığı hizmet hangisidir?

*(Tek bir doğru cevap yoktur. Amaç, gerçek zamanlı akış mimarisi tasarımını uygulamaktır.)*

## Kredilerden Sonraki Sahne

Tom ilk Athena sorgusunu çalıştırdı.

"En çok gelir getiren 10 restoran son çeyrekte," dedi.

12 saniye sonra sonuçlar belirdi.

Onlara baktı.

"47. restoran ilk sırada," dedi. Bu, Maya'nın ailesinin restoranıydı — Nimbus'un başladığı yer.

"Elbette ki," dedi Maya. "Arepa bu kadar iyi."

Tom başka bir sorguyu çalıştırdı. Ve başka bir sorguyu. Her biri saniyeler içinde cevapladı, her biri fraksiyonel bir kuruşa mal oldu.

Bir saat sonra, Nimbus'un işinin tamamının bir resmini, daha önce hiç sahip olmadığı bir şekilde elde etti. Hangi restoran kategorileri en hızlı büyüdü. Hangi müşteri grupları en uzun süre sadakat gösterdi. Hangi menü öğeleri en çok tekrar siparişlere yol açtı.

"Neden daha önce bunu yapmadık?" diye sordu.

"Verilere sahibdik," dedi Leo. "Sadece onu kullanacak bir akış hattımız yoktu."

"Veri her zaman oradaydı," diye fısıldadı Maya. "Sadece görememiştik."

Bir sonraki bölümde: şimdi işi net bir şekilde gördükten sonra, onu çalıştıran altyapıyı nasıl daha verimli bir şekilde ödeyeceğimiz konusuna değinelim.
