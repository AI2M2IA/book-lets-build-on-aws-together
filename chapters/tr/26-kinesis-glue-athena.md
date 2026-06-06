# Bölüm 26: Her Şeyi Anlamlandırmak

Tom bir çıktıya bakıyordu.

İki sayfa sayıydı: sipariş sayıları, gelir toplamları, zaman damgaları, bölge kodları. Leo'dan Cuma'nın sipariş kalıpları hakkında mevcut her şeyi bir araya getirmesini istemişti. Leo üç farklı veri kaynağını—DynamoDB, CloudWatch günlükleri ve bir S3 analiz dışa aktarımı—birleştiren bir komut dosyası yazmak için bir saat harcamıştı ve ortaya çıkan buydu.

Sayılar hep oradaydı. Ona hiçbir şey söylemiyorlardı.

Cuma günü 847 sipariş verildiğini görebiliyordu. Ne zaman verildiklerini, hangi restoranların en yoğun olduğunu veya zirve saatin ne olduğunu söyleyemiyordu. O bilgi verideydi. Sadece görünmezdi.

---

Bölüm 25'teki tüm ağ optimizasyonu Nimbus'un altyapısını daha hızlı ve daha ucuz yapmıştı. Ama o altyapının ürettiği veri—DynamoDB'de, CloudWatch günlüklerinde, gecede bir kez çalışan S3 analiz dışa aktarımında—üç farklı yerde, üç farklı formatta, Tom'un gerçekten kullanabileceği hiçbir şeye bağlı olmadan oturuyordu.

Maya'nın sorusu bunu somutlaştırdı. "Cuma günleri en yoğun sipariş saatimiz nedir?"

Leo ona baktı. "Bu panomuzda yok."

"Ekleyebilir miyiz?"

"Veri DynamoDB'de. Ve CloudWatch günlüklerinde. Ve analiz dışa aktarım işinden S3'te." Leo durakladı. "Üç farklı yerde, üç farklı formatta."

Maya ekledi: "Ve analiz dışa aktarımı gecede yalnızca bir kez çalışıyor. Cuma verisini istiyorsanız, Cumartesi sabahına kadar beklemeniz gerekir."

Tom çıktıya baktı. "Yani veriye sahibiz. Sadece onu kullanamıyoruz."

Bu cümle modern analizin yarısını tanımlar.

---

**Beyaz Tahta**

Maya ofise erken geldi ve Leo geldiğinde beyaz tahtanın yarısını çoktan doldurmuştu.

İki sütunda yazılı yedi soru, hepsi iş soruları, hiçbiri mevcut panolardan yanıtlanamaz:

1. İlk 30 günde hangi restoranların en yüksek sipariş iptal oranı var?
2. Bir restoranın sipariş bildirimi alması ile onu onaylaması arasındaki ortalama süre nedir? Bu restorana ve haftanın gününe göre nasıl değişiyor?
3. Hangi şehirlerde müşterilerin aynı restorandan 14 gün içinde yeniden sipariş verme oranı en yüksek?
4. Siparişlerin yüzde kaçı uygulamanın ilk oturumunda vs dönüş oturumlarında veriliyor?
5. Hangi menü kategorileri restoran başına en yüksek geliri sağlıyor?
6. Restoran yanıt süresi ile müşteri yeniden sipariş oranı arasındaki korelasyon nedir?
7. Bir restoran ortağı sosyal medyada paylaşım yaptıktan önceki ve sonraki 48 saatte sipariş hacmi nasıl değişiyor?

"Bunlardan herhangi birini yanıtlayabilir miyiz?" diye sordu.

Leo listeye baktı. Mevcut panoya baktı—sipariş sayısı, gelir toplamı, aktif restoranlar.

"Bir numara," dedi yavaşça. "Kısmen. İptal kayıtlarımız var. Ama onları restoran katılım tarihlerine birleştirmemiz gerekir ve o farklı bir sistemde."

"İki numara?" diye sordu Tom.

"Bildirim zaman damgasını saklıyoruz. Onay zaman damgasını saklıyoruz. Farklı formatlarda farklı tablolardalar. Onları JOIN edip deltayı hesaplamamız gerekir."

"Yani veri var," dedi Maya.

"Veri var," diye onayladı Leo. "Sadece onun arasında sorgulamanın hiçbir yolu yok."

"Bekle—ama *neden* sadece veritabanını sorgulayamıyoruz?" diye sordu Maya. "PostgreSQL'imiz var. Tüm bu veriye sahibiz."

"Çünkü veri üç yerde," dedi Leo. "Sipariş olayları DynamoDB'de. Bildirim zaman damgaları CloudWatch günlüklerinde. Katılım tarihleri RDS PostgreSQL veritabanında. Ve bir kısmı—analiz dışa aktarımları—kimsenin hiçbir şeye birleştirmediği JSON dosyaları olarak S3'te."

Tom beyaz tahtaya baktı. "Bu veriyi 18 aydır üretiyoruz," dedi. "18 aydır kör uçuyoruz."

"Kör değil," dedi Maya. "Sadece miyop. Hemen önümüzde olanı görebiliyorduk. Kalıpları göremiyorduk."

Bu doğru çerçeveydi. Bireysel veri noktaları oradaydı. Onları bağlayacak sistem değildi.

**Üç Farklı Sorun**

Nimbus'un veri sorununun üç boyutu vardı:

**Gerçek zamanlı akış (streaming)**: Siparişler şu anda veriliyor. Sipariş hızının canlı bir panosunu görmek istiyorsunuz—dakikada kaç tane, bölgeye göre, restorana göre. Verinin geldiği gibi işlenmesi gerekir.

**Veri dönüşümü**: Veri çeşitli sistemlerden S3'te, farklı formatlarda (JSON, CSV, Parquet). Onu analiz edebilmeden önce, onu normalleştirmeniz gerekir—aynı şema, aynı format, temizlenmiş, referans veriyle birleştirilmiş.

**Geçici (ad-hoc) analiz**: Veri düzenlendikten sonra, onu önce bir veritabanına yüklemek zorunda kalmadan ona karşı SQL sorguları çalıştırmak istiyorsunuz. "Bana son 30 günde gelire göre en iyi 10 restoranı ver." Veriyi bir veritabanına yüklemeden.

Bunların her biri farklı bir sorundur. AWS'nin her biri için özel bir hizmeti vardır.

**Gerçek Zamanlı Akış: Veri İçin Bir Bant Yazıcı**

Bir bant yazıcı makinesi hayal edin—hisse senedi fiyatlarını sürekli bir kâğıt rulosuna yazdıran türden. Fiyatlar değiştikçe yazdırılıyordu. Mevcut fiyatı isteyen herkes bandı okuyabilirdi. Kimsenin başkasını beklemesine gerek yoktu; bant kaç kişinin okuduğuna bakılmaksızın yazdırmaya devam ediyordu.

İşte gerçek zamanlı veri akışının modeli budur. Üreticiler veriyi oldukça gönderir. Birden fazla tüketici akışı aynı anda okuyabilir, her biri kendi hızında, her biri tüm resmi alarak.

**Amazon Kinesis Data Streams**, Nimbus için o makinedir. Bir sipariş verildiğinde, uygulama bir Kinesis akışına bir olay yayınlar: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Bu akışın tüketicileri:

- Gerçek zamanlı bir pano (olayları geldiği gibi okur, metrikleri günceller)
- Bir dolandırıcılık tespiti Lambda'sı (olağandışı sipariş kalıplarını arar)
- Kalıcı depolama için S3'e bir akış

**Kinesis Data Streams kavramları**:

- **Shard**: Temel kapasite birimi. Bir shard 1 MB/s yazma, 2 MB/s okuma işler.
- **Saklama süresi**: Veri akışta 24 saat (varsayılan) kalır, Extended Data Retention ile **365 güne** (1 yıl) uzatılabilir.
- **Sıra numarası**: Her kaydın bir sıra numarası vardır. Tüketiciler akıştaki konumlarını izler.

**Amazon Data Firehose** (eski adıyla **Kinesis Data Firehose**): Akış üreticileri ile S3, Redshift ve OpenSearch gibi hedefler arasındaki yönetilen teslimat hizmeti. Veriyi otomatik olarak arabelleğe alır, sıkıştırır, dönüştürür ve teslim eder.

Nimbus için: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet formatı, sıkıştırılmış, tarihe göre bölümlenmiş).

"Onu zaten dağıttım—ah." Leo, önce yazma verimini hesaplamadan shard sayısını bire ayarlamıştı. Nimbus'un sipariş hacminde, bir shard iyiydi. Birisi tahmin ettiğini fark etmeden önce bunu doğruladı.

**Çevirmen: Ham Veriyi Anlamlandırmak**

S3'teki veri hamdır. Onu verimli bir şekilde analiz edebilmeden önce, neyin orada olduğunu keşfetmeniz, onu tutarlı bir formata dönüştürmeniz, farklı veri kümelerini birleştirmeniz ve kötü kayıtları ve eksik değerleri ele almanız gerekir.

Bu, özel bir çeviri katmanının işidir.

**AWS Glue**, tam yönetilen bir ETL (Extract, Transform, Load—Çıkar, Dönüştür, Yükle) hizmetidir. İki ana bileşeni vardır:

**Glue Data Catalog**: S3 verinizi tanımlayan bir meta veri deposu—hangi tabloların var olduğu, hangi sütunlara sahip oldukları, veri dosyalarının nerede olduğu. Veri gölünüz için bir kart kataloğu gibidir.

**Glue Crawlers**: S3'ü tarayan, şemayı çıkaran ve Data Catalog'u dolduran otomatik aracılar. S3 paketinizde bir crawler çalıştırın ve 10 dakika sonra tüm tablolarınızın bir kataloğuna sahip olun.

**Glue Jobs**: Gerçek dönüşümü gerçekleştiren sunucusuz Spark/Python işleri. Dönüşüm mantığını yazarsınız (veya Glue'nun görsel ETL aracını kullanırsınız) ve Glue onu yönetilen altyapıda çalıştırır.

Nimbus için:

1. Glue Crawler S3'teki sipariş verisini tarar → Glue Data Catalog'da bir tablo tanımı oluşturur
2. Glue Job ham JSON sipariş olaylarını temiz, bölümlenmiş bir Parquet formatına dönüştürür
3. Dönüştürülen veri sorgu için optimize edilmiş bir düzende S3'e geri yazılır

**ETL Bozulduğunda: Şema Evrimi Sorunu**

Glue hattı ilk üç hafta temiz çalıştı. Sonra restoran ortağı #412 menü dışa aktarımına yeni bir alan ekledi: `allergen_tags`. Alan bir dize dizisiydi—`["gluten", "dairy", "nuts"]`—ve restoranın gecelik veri dışa aktarımında belirdi.

Glue işinin şeması katıydı. Sipariş JSON'unda belirli alanları beklemek için yazılmıştı. `allergen_tags` ile karşılaştığında—şemada olmayan bir alan—Glue işi başarısız oldu.

47 restorandan (hepsi ortak #412 ile aynı menü dışa aktarım formatını kullanan) altı saatlik sipariş verisi işlenmeden S3'te birikti. Dün geceki siparişleri sabaha kadar sorgulanabilir kılması gereken gecelik Glue çalıştırması bunun yerine 02:47'de durmuş ve CloudWatch'a bir arıza kaydı yazmıştı.

Tom bunu sabah 9'da bir Athena sorgusu çalıştırmaya çalıştığında ve önceki 12 saat için `0 rows returned` aldığında buldu.

"ETL kaynak veri değiştiği için mi bozuldu?" diye sordu Maya, Leo ne olduğunu açıkladığında.

"ETL, ETL'nin bir şema değişikliğini nasıl ele alacağını bilmediği için bozuldu," dedi Leo. "Tam olarak bu alanları bekleyen katı bir iş yazdık. Yeni bir alan belirdiğinde, paniğe kapıldı."

"Peki birisi bir şema değişikliği aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "Hattı çökertmek için kasıtlı olarak beklenmeyen alanlar gönderen kötü niyetli bir restoran ortağı?"

Soru düşünmeye değerdi. Beklenmeyen girdide çöken bir ETL hattı bir hizmet reddi (denial-of-service) vektörüdür: olağandışı bir veri formatı gönder, hattı çökert ve o restoran (ve formatı paylaşan diğer tüm restoranlar) işlemeyi durdurur.

Çözümün iki parçası vardı:

**Glue şema evrimi**: Glue'nun dinamik çerçevesi şema evrimini destekler—beklenen şemada olmayan alanlar arızaya neden olmak yerine geçirilir. İş komut dosyasında DataFrames yerine DynamicFrames kullanarak, ek seçeneklerde `mergeSchema` ayarlanmış olarak etkinleştirin. Yeni alanlar bir sonraki crawler çalıştırmasında şemaya otomatik olarak eklenir.

```python
# Önce (katı, yeni alanlarda bozulur)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Sonra (şema evrimi etkin)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Glue iş uyarısı**: Hat arızası Tom fark etmeden önce yaklaşık altı saat sessizdi. Glue iş çalışma durumunda (`FAILED`) bir CloudWatch alarmı nöbetçi mühendisi 5 dakika içinde uyarırdı. Alarm maliyeti: ayda on sent—fiilen ücretsiz (metriğin kendisi hiçbir şeye mal olmaz ve ilk on alarm ücretsiz katmana girer).

"Altı saatlik veri S3'te işlenmeden oturdu," dedi Leo, yetişmek için Glue işini manuel olarak yeniden çalıştırdıktan sonra. "Hiçbir şey kaybolmadı—ama analizler o kadar geride kaldı. Alarmımız olsaydı, gecikme 30 dakika olurdu."

Daha geniş ders: harici veri işleyen ETL hatlarının şema değişikliklerini zarif bir şekilde ele alması gerekir. Harici ortaklar—restoranlar, ödeme sağlayıcıları, teslimat hizmetleri—veri formatlarını değiştirecektir. Hat o değişikliklere karşı kırılgan olmamalıdır.

**Sorgu Katmanı: Doğrudan S3'te SQL**

Şimdi veri S3'te, Parquet formatında, tarihe göre bölümlenmişti. Son parça: onu önce bir veritabanına yüklemeden ona sorular sormanın bir yolu.

**Amazon Athena**, doğrudan S3 verisinde SQL sorguları çalıştıran sunucusuz, etkileşimli bir sorgu hizmetidir. Sağlanacak veritabanı yok, yüklenecek veri yok. Bir tablo tanımlarsınız (veya Glue Data Catalog'u kullanırsınız), SQL yazarsınız ve Athena sorguyu S3 dosyalarına karşı yürütür.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Athena fiyatlandırması bir sorgunun ne kadar veri taradığına dayanır. us-east-1, us-west-2 ve çoğu büyük bölgede, standart SQL sorguları taranan terabayt başına 5 dolara mal olur. Bölüm budama (partition pruning) ile Parquet formatı (sütunlu) kullanmak (`WHERE year='2024' AND month='09'`), Athena'nın yalnızca ihtiyaç duyduğu dosyaları taraması demektir, ki bu maliyeti dramatik şekilde azaltır.

"Bu sorguyu 30 günlük veri için çalıştırabiliriz," dedi Leo, "ve onu iyi saklarsak şaşırtıcı derecede az maliyetli olabilir."

"Nasıl bu kadar az maliyetli olabilir?" diye sordu Maya. "Terabaytlarca veri tarıyorsa, bu nasıl pahalı değil?"

Leo Parquet'i açıkladı. Satır tabanlı bir formatta (JSON, CSV), yirmi sütundan ikisini arayan bir sorgu yirmisini de okumak zorundadır. Parquet gibi sütunlu bir formatta, yalnızca ihtiyaç duyduğu ikisini okur. 50TB'lik bir veri kümesi için, iyi optimize edilmiş bir sorgu 200GB tarayabilir. 5 $/TB'den, bu bir dolardır.

"Peki birisi yanlışlıkla tüm tabloyu sorgularsa?" diye üsteledi Maya.

"İşte gerçek maliyet riski bu," dedi Leo.

Şunu merak ediyor olabilirsiniz: Athena taranan terabayt başına ücret alıyorsa, kötü yazılmış bir sorgu büyük, beklenmedik bir fatura üretebilir mi? Evet—ve bu gerçek üretim ortamlarında olur. 50TB'lik optimize edilmemiş bir tabloya karşı bir sorgu, tüm aylık S3 faturanızdan daha pahalıya mal olabilir. İşte bu yüzden Parquet formatı ve bölümleme isteğe bağlı optimizasyonlar değildir—maliyet kontrolleridir. Athena ayrıca tek bir sorgunun taramasına izin verilen veri miktarını sınırlayan iş grubu sorgu tarama sınırlarını destekler.

"Düşünebileceğimiz herhangi bir keyfi soru için mi?" diye sordu Tom.

"SQL'de ifade edebileceğimiz herhangi bir soru için, S3'te sakladığımız herhangi bir veriye karşı."

Tom Leo'nun dizüstü bilgisayarına oturdu ve ilk sorguyu yazdı:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

Sorgu 11 saniye çalıştı. Sonuç: 20 restoran, en hızlı ortalama onay süresine göre sıralanmış, yeniden sipariş oranlarıyla yan yana.

Tom çıktıya baktı.

En hızlı onaylayan restoranlar—siparişleri ortalama 3-4 dakika içinde kabul edip onaylayanlar—ortalama %41 yeniden sipariş oranına sahipti. En yavaş onaylayan restoranların (ortalama onay süresi 18-22 dakika) yeniden sipariş oranı %13 idi.

"Hızlı onaylayan restoranlar üç kat tekrar iş alıyor," dedi Tom.

"Bu büyük bir fark," dedi Maya. "Onay hızı yeniden sipariş oranını neden bu kadar etkilesin?"

"Çünkü müşteri bir sipariş verdi ve sonra orada oturup telefonunu izledi," dedi Leo. "Onay 3 dakikada gelirse, emin hissederler. 22 dakikada—veya hiç—gelirse, endişeli hissederler. Yemek iyi gelse bile, endişe ürün arızasıdır."

"Bu bir ürün içgörüsü," dedi Maya. "Sadece bir analiz içgörüsü değil. Restoranlara onay süresi kıyaslamalarını kategori ortalamasıyla karşılaştırarak göstermeliyiz."

Athena sorgusu 1,2 GB veri taramıştı (Parquet formatında, yıla ve aya göre bölümlenmiş iki aylık sipariş). Maliyet: 0,006 dolar.

Yarım sent. Nimbus'un restoran katılımını nasıl tasarlayacağını değiştiren bir iş içgörüsü için—başarı koçluğu için hangi restoranları önceliklendireceği, ortak SLA'larının bir parçası olarak hangi onay süresi hedeflerini belirleyeceği.

Tom, attıkları tüm verinin değerini yeniden hesaplayan birinin bakışına sahipti.

"Peki birisi sorgu katmanı aracılığıyla içeri girmeye çalışırsa?" diye sordu Priya. "Ya da sadece ham sipariş verisinden yanlışlıkla müşteri adreslerini dışa aktaran bir analist? Müşteri PII'si, sipariş geçmişleri, finansal kayıtlar—hangi tabloların görünür olduğunu bile kim kontrol ediyor?"

Soruyu bitirmeden önce, Leo operasyonel sorunu da fark etmişti: bir ekibin tek bir sorguda 500 dolarlık bir Athena faturası üreten felaket bir tam-tablo taraması çalıştırmasını nasıl durdurursunuz?

**Athena İş Grupları (Workgroups)** her iki sorunu da aynı anda çözer.

Bir iş grubu, Athena kullanıcılarını gruplandıran ve paylaşılan ayarlar uygulayan adlandırılmış bir yapılandırmadır: sorgu sonuç konumu, şifreleme ve—kritik olarak—sorgu başına veri tarama sınırları.

```
İş grubu: analytics-team
  Sorgu tarama sınırı: sorgu başına 10 GB
  Sınır aşıldığında eylem: Sorguyu iptal et

İş grubu: engineering-team
  Sorgu tarama sınırı: sorgu başına 100 GB
  Sınır aşıldığında eylem: Yalnızca uyar

İş grubu: finance-reports
  Sorgu tarama sınırı: sorgu başına 1 GB
  Sınır aşıldığında eylem: Sorguyu iptal et
```

`analytics-team` iş grubundaki bir analist, yanlışlıkla 50TB veri tarayıp 250 dolarlık bir Athena ücreti üretemez. Sorgu, 10GB taranan veriyi aşacağında iptal edilir. Analist bir hata mesajı görür ve bir bölüm filtresi eklemesi gerektiğini bilir.

İş grupları ayrıca ekip başına ayrı sonuç konumlarını uygular: mühendislik ekibinin sorgu sonuçları `s3://nimbus-query-results/engineering/`'e gider; finans ekibinin sonuçları `s3://nimbus-query-results/finance/`'e gider. Ekipler arası sorgu sonucu erişimi yok.

IAM hangi kullanıcıların hangi iş grubunu kullanabileceğini kontrol eder. Otomatik raporlar çalıştıran bir Lambda fonksiyonu `finance-reports` iş grubunu kullanır (sıkı sınırlı). Bir üretim sorununu ayıklayan bir mühendis `engineering-team` iş grubunu kullanır (daha geniş sınır, iptal değil uyar). Ham olaylar tablosuna (müşteri PII'si içeren) erişim, Glue Data Catalog tablosundaki bir IAM koşulu aracılığıyla `engineering-team` iş grubuyla sınırlandırılır.

"Bu sadece maliyet kontrolü değil," dedi Priya. "Bu erişim kontrolü. İş grupları uygulama noktasıdır."

Onun sorusunu tamamen yanıtladı. Erişim kontrolünü atlayan her veri hattı tartışması eninde sonunda bir uyumluluk olayı hâline gelir—ve burada, analiz ekibi yalnızca toplanmış sipariş tablolarını gördü, müşteri PII'li ham olaylar açık bir IAM yetkilendirmesinin arkasında kaldı. Glue Data Catalog sadece bir şema dizini değildi. Bir erişim kontrol sınırıydı.

"Bu ekstra iş değil," dedi Priya. "Bu tasarım."

**Veri Gölü Mimarisi**

Bu üç hizmet **veri gölü mimarisi (data lake architecture)** denilen şeye birleşir—tüm veriniz için merkezi bir S3 deposu, onu işlemek ve sorgulamak için araçlarla:

```
Uygulamalar (siparişler, menüler, olaylar)
    |
    | Gerçek zamanlı olaylar
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (ham)
                                                   |
                                                   | Glue Crawler şemayı keşfeder
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs dönüştürür
                                                   ↓
                                              S3 (temiz, Parquet, bölümlenmiş)
                                                   |
                                                   | SQL sorguları
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          İş Zekâsı Araçları
                                       (QuickSight, Tableau, vb.)
```

Ham veri her zaman korunur (orijinal S3 paketinde). Dönüştürülen veri Athena aracılığıyla sorgulanabilir. Yeni sorular her zaman ham veride yeni Glue işleri çalıştırarak yanıtlanabilir.

**Amazon Redshift: Athena Yeterli Olmadığında**

Bazı kullanım durumları için, Athena çok yavaş veya çok pahalıdır:

- Çok sayıda birleştirmeli çok karmaşık sorgular
- Aynı sorguyu günde binlerce kez çalıştıran panolar
- Yapılandırılmış veride makine öğrenimi
- BI araçları için saniyenin altı yanıt süresi gereksinimleri

**Amazon Redshift**, tam yönetilen bir veri ambarıdır: büyük, tekrarlanan analitik iş yükleri için tasarlanmış sütunlu bir analiz veritabanı. Veriyi S3'te yaşadığı yerde sorgulayan Athena'nın aksine, Redshift veriyi optimize edilmiş ambar depolamasına yükler ve karmaşık analizleri hızlandırmak için sorgu optimizasyonu, sıralama stratejileri ve dağıtım stratejileri kullanır.

Veri hacminiz küçükse ve sorgularınız seyrek çalışıyorsa (haftalık veya aylık), iyi düzenlenmiş S3 verisiyle Athena yeterli ve neredeyse ücretsizdir—ama aynı analitik panoları günde yüzlerce kez çalıştırıyorsanız, Redshift'in önceden optimize edilmiş sütunlu depolaması, veriyi önceden yüklemeyi gerektirmesine rağmen, daha hızlı ve sonuçta daha uygun maliyetli olur.

Redshift, maliyet (sağlanan kapasite) ve sorgulamadan önce veri yükleme gereksinimi pahasına karmaşık analiz sorguları için önemli ölçüde daha hızlıdır.

**Redshift Serverless**, kapasite planlama yükünü ortadan kaldırır—siz sorgularsınız, Redshift ölçeklenir. Maliyet, gerçekten kullanılan işlem kapasitesine dayanır, **RPU-saat** cinsinden ölçülür ve saniye başına faturalandırılır (etkinleştirme başına 60 saniyelik minimumla), artı GB-ay başına yönetilen depolama—ve ambar boşta otururken işlem için hiçbir şey ödenmez. (Sorgu başına fiyatlandırılan Athena'dır: taranan TB başına 5 dolar.)

Nimbus için mevcut ölçeklerinde: Athena yeterli. Beş katı veri hacminde ve BI araçları aynı panoları günde yüzlerce kez sorgularken, Redshift uygun maliyetli hâle gelirdi.

**Athena Yanlış Araç Olduğunda**

"Peki işin püf noktası ne?" diye sordu Maya. "Neden her şey için Athena kullanmayalım? Sunucusuz, sorgu başına ödeme, altyapı yok—kusursuz geliyor."

Athena'nın doğru cevap olmadığı durumlar:

**Yüksek frekanslı panolar**: Her 30 saniyede bir yenilenen ve dakikada 50 sorgu çalıştıran müşteriye dönük bir analiz panosu iyi bir Athena kullanım durumu değildir. Taranan 5 $/TB'den, o sorguların o frekansta uygun maliyetli olması için son derece iyi optimize edilmeleri gerekir. Saniyenin altı yanıt süresi gereksinimleri olan panolar için Redshift veya önceden toplanmış bir veritabanı (RDS bile) daha uygundur.

**Düşük gecikme gereksinimli operasyonel sorgular**: Bir müşteri hizmetleri temsilcisinin belirli bir siparişi 500ms altında araması gerekiyorsa, Athena araç değildir—bir DynamoDB araması veya bir RDS sorgusudur. Athena operasyonel gecikme için değil, analitik verim için optimize edilmiştir. Küçük bir veri kümesinde iyi ayarlanmış bir Athena sorgusu bile 1-3 saniye soğuk başlatma ek yüküne sahiptir.

**İşlemsel (transactional) sistemler**: Athena salt okunurdur. Athena'da kayıtları INSERT, UPDATE veya DELETE edemezsiniz (kendi karmaşıklıkları olan Lake Formation veya Iceberg tablo formatı gibi belirli entegrasyonlar dışında). Operasyonel yazma iş yükleri için, işlemsel bir veritabanı kullanın.

**Çok küçük, sık değişen veri kümeleri**: Veri kümeniz her dakika değişiyorsa ve yalnızca 1GB ise, onu RDS veya DynamoDB'ye yükleyip orada sorgulamak, bayat olabilecek S3 dosyalarına karşı Athena sorguları çalıştırmaktan daha basit ve daha hızlıdır. Athena S3 dosyalarını sorgu zamanı itibarıyla sorgular—dosyalar 2 dakika önce yazıldıysa, aldığınız tazelik budur.

Ortaya çıkan kalıp: Athena, S3 verisine karşı büyük ölçekli, seyrek, geçici analitik sorgular için mükemmeldir. Operasyonel, işlemsel veya saniyenin altı gecikme gerektiren herhangi bir şey için, uygun operasyonel veritabanını kullanın.

**Kinesis vs SQS: Kafa Karışıklığını Gidermek**

Bu, her veri mimarisi tartışmasında ortaya çıkan sorudur. Kinesis ve SQS'in ikisi de mesajlarla ilgilenir. Her birini ne zaman kullanırsınız?

Kafa karışıklığı yüzeysel benzerlikten gelir: ikisi de üreticilerden mesaj kabul eder. İkisi de o mesajları tüketicilere teslim eder. İkisi de yönetilen AWS hizmetleridir. Ama veri modelleri temelde farklıdır.

**SQS (Simple Queue Service)** bir görev kuyruğudur. Bir mesaj koyarsınız. Bir tüketici onu alır ve işler. İşleme tamamlandığında, mesaj silinir. On tüketiciniz varsa, her mesaj tam olarak birine gider. Mesaj tüketimden sonra gitmiştir.

**Kinesis Data Streams** bir günlüktür (log). Bir kayıt koyarsınız. Her tüketici her kaydı okur. Tüketici A hepsini okur. Tüketici B de hepsini okur, kendi hızında. Hiçbir tüketici kaydı silmez—saklama süresi dolana kadar akışta kalır. Herhangi bir zamanda üçüncü bir tüketici ekleyebilirsiniz ve akışın başından okuyabilir (saklama penceresi içinde).

"Gerçekten her tüketicinin her mesajı görmesini ne zaman istersiniz?" diye sordu Maya.

Cevap, Kinesis'in parladığı kullanım durumlarıdır:

**Gerçek zamanlı pano + dolandırıcılık tespiti + S3 arşivi**: Üçü de aynı sipariş olayları akışını aynı anda tüketir. SQS kullansaydınız, üç ayrı kuyruğa yayınlamanız gerekirdi—ve kim yayınlarsa üç tüketicinin de farkında olmalı. Kinesis ile, üretici bir kez yayınlar; herhangi bir sayıda tüketici bağımsız olarak okuyabilir.

**Yeniden oynatma (replay)**: Bir tüketici 2 saat başarısız olur (Lambda eş zamanlılık sınırına ulaşıldı, alt akış hizmeti çöktü). SQS ile, o mesajlar zaten silinmişti (veya tanımlı bir görünürlük zaman aşımına sahipti). Kinesis ile, tüketici son kontrol noktasından devam eder ve 2 saatlik kaçırılan kayıtları işler. Veri akışta saklandı (Extended Data Retention ile 365 güne kadar).

**Bir shard içinde sıra**: Aynı bölüm anahtarına sahip kayıtlar her zaman aynı shard'a gider, sırayı korur. `AMZN` sembolü için tüm işlemlerin sırayla işlenmesi gereken bir hisse senedi ticaret sistemi için, Kinesis bunu garanti eder. SQS FIFO grup başına sıralama sağlar ama daha düşük verimde (standart modda gruplandırmayla kuyruk başına saniyede 3.000 mesaja kadar—yüksek verim modu bunu on binlere yükseltir—vs Kinesis'in shard başına 1 MB/s veya 1.000 kayıt/s, ihtiyaç duyduğunuz kadar shard ile çarpılır).

Belirleyici soru: **Her mesajın tam olarak bir tüketici tarafından tüketilip sonra atılması mı gerekiyor?** → SQS. **Her mesajın birden fazla tüketici tarafından bağımsız olarak görülmesi mi gerekiyor veya yeniden oynatma yeteneğine mi ihtiyacınız var?** → Kinesis.

Nimbus'un gerçek zamanlı panosu için: Kinesis. Birden fazla tüketici (pano, dolandırıcılık tespiti, S3 arşivi) hepsi aynı akışı okuyor.

Nimbus'un sipariş işleme kuyruğu için (bir sipariş verildi → bir ECS görevi onu işler): SQS. Bir tüketici, yeniden oynatma gerekmez, fan-out gerekmez.

## Veriyi Görselleştirmek: Amazon QuickSight

Athena veriyi sorgular. Glue onu hazırlar. Ama bir noktada birinin bir grafik görmesi gerekir—ve konsolda SQL sorguları çalıştırarak değil.

"Bunun için gerçekten başka bir hizmete mi ihtiyacımız var?" diye sordu Maya. "Athena sonuçlarını sadece bir elektronik tabloya dışa aktaramaz mıyım?"

"Bir sorgu için, evet," dedi Tom. Bunu zaten denemiş birinin bakışına sahipti. "Tüm ekiple paylaşmak istediğiniz bir pano için, bu her sabah yeni bir elektronik tablo."

**Amazon QuickSight**, AWS'nin yönetilen iş zekâsı (BI) hizmetidir. Doğrudan Athena, S3, RDS, Redshift ve diğer kaynaklara bağlanır ve ayrı bir BI sunucusu olmadan panolar ve görselleştirmeler oluşturmanıza olanak tanır.

Temel özellikler:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight, her pano yüklemesinde Athena'yı yeniden sorgulamadan ölçekte saniyenin altı sorgu performansı için veri kümelerini bellek içi motoruna içe aktarabilir
- **ML Insights:** yerleşik anormallik tespiti ve tahmin—veri bilimi gerekmez
- **Gömülü panolar:** QuickSight panolarını bir URL aracılığıyla kendi web uygulamanıza gömebilirsiniz

Tom QuickSight'ı Athena veri kaynağına bağladı ve bir öğleden sonra içinde günlük siparişleri, restorana göre geliri ve dönüşüm hunisini gösteren çalışan bir panoya sahip oldu.

"Bu ayda ne kadara mal oluyor?" diye sordu—sonra başkası yapamadan kendi sorusunu yanıtladı. "QuickSight yazar başına ayda yaklaşık 24 dolar—panoları oluşturan kişiler—ve okuyucu başına ayda 3 dolar. Onu kullanacak dört kişimiz var."

"Yani ayda yaklaşık yüz dolar," dedi Maya.

"Aksi takdirde ayrı bir analiz sunucusu çalıştırmayı gerektirecek bir BI hizmeti için," dedi Priya. "Evet."

Tom panoyu yayınladı. Ertesi sabah, Athena sorguları çalıştırmak yerine, tüm ekip bir URL açtı.

> **Sınav İpucu — QuickSight**
>
> QuickSight, AWS'nin yönetilen BI ve görselleştirme hizmetidir. Athena, S3, Redshift, RDS'ye bağlanır. SPICE, tekrarlanan pano sorgularını hızlandıran bellek içi sorgu motorudur. Sınav tetikleyicisi: "AWS'de iş zekâsı panosu" veya "Athena/Redshift'ten veriyi görselleştir" → QuickSight.

## Gölü Yönetmek: AWS Lake Formation

Nimbus'un veri gölü büyüdükçe, veri erişimi bir yönetişim sorunu hâline geldi.

"Ham işlem günlüklerini kim sorgulayabilir?" diye sordu Priya, bir sonraki mimari incelemesinde. "Müşteri PII'sini kim görebilir? Finansal özet tablolarına kim erişebilir?"

"Mühendisliğin tam erişimi var," dedi Leo. "Analiz ekibinin toplanmış tablolara erişimi var. Finansın gelir tablolarına erişimi var."

"Nerede yapılandırılmış?"

Leo durakladı. "Birkaç farklı... yerde. S3 paket politikaları, IAM politikaları, Glue kataloğu izinleri."

"Üç ayrı sistem, hepsinin tutarlı olması gerekiyor," dedi Priya. "Yeni bir analist eklediğimizde ne olur? Veya belirli bir sütuna—diyelim müşteri telefon numaraları—analiz ekibinden erişimi kısıtlamaya karar verdiğimizde?"

O soru boşluğu ortaya çıkardı. S3 paket politikaları, IAM ve Glue Data Catalog arasında aynı anda ince taneli veri erişimini yönetmek kırılgandı.

**AWS Lake Formation**, veri gölünüz için erişim kontrolünü merkezileştiren yönetilen bir hizmettir. Paket politikalarını, IAM politikalarını ve Glue kataloğu izinlerini ayrı ayrı yönetmek yerine, Lake Formation verinizde sütun düzeyinde, satır düzeyinde ve tablo düzeyinde izinler vermek için tek bir yer sağlar.

Temel özellikler:

- S3 ve Glue Data Catalog'un üzerinde oturur—veri göçü gerekmez
- **İnce taneli erişim kontrolü:** belirli kullanıcılara veya rollere belirli tablolara, sütunlara veya hatta filtrelenmiş satırlara erişim verin—S3 verisinde veritabanı düzeyinde izinlerin eşdeğeri
- **Veri filtreleme:** bir kullanıcı Lake Formation tarafından yönetilen bir tabloyu Athena aracılığıyla sorguladığında, Lake Formation görmesine izin verilmeyen sütunları veya satırları otomatik olarak filtreler

Priya, Rafael sütun düzeyinde kuralları hazırlarken Lake Formation'ı üç izin katmanıyla kurdu: mühendislik rolü tüm tabloları ve tüm sütunları gördü. Analiz rolü toplanmış sipariş tablolarını gördü ama müşteri PII sütunlarını değil. Finans rolü müşteri tanımlayıcıları maskelenmiş gelir tablolarını gördü.

"Yani analist aynı Athena sorgusunu çalıştırır," diye onayladı Leo. "Ama Lake Formation onu yakalar ve görmeye yetkili olmadıkları sütunları çıkarır mı?"

"Doğru. Filtreleme otomatiktir. Analistin onun gerçekleştiğini bilmesine gerek yoktur—ve ham S3 dosyalarını doğrudan sorgulayarak bunu aşamazlar, çünkü Lake Formation erişimi katalog düzeyinde kontrol eder."

"Bu ekstra iş değil," dedi Priya. "Bu tasarım."

> **Sınav İpucu — Lake Formation**
>
> Lake Formation, S3 ve Glue Data Catalog üzerine inşa edilmiş bir veri gölü için erişim kontrolünü merkezileştirir. Tablo, sütun ve satır düzeyinde ince taneli izinleri destekler. Sınav tetikleyicisi: "bir S3 veri gölündeki belirli sütunlara erişimi kısıtla" veya "veri gölü yönetişimini merkezileştir" → Lake Formation. Ham IAM'den temel ayrım: Lake Formation, yalnızca IAM politikalarının ifade edemeyeceği sütun ve satır düzeyinde filtrelemeyi uygular.

## Güçlü Yönler ve Sınırlamalar

**Kinesis Data Streams**: Veriniz sürekli olarak geldiğinde ve sıra önemli olduğunda Kinesis kullanın—tıklama akışları, finansal işlemler, IoT telemetri. Kinesis bir shard içinde kayıt sırasını korur ve yapılandırılan saklama penceresi sırasında yeniden oynatmaya izin verir (varsayılan olarak 24 saat, Extended Data Retention ile 365 güne kadar), ki bu onu SQS'ten temelde farklı kılar. Takas operasyonel karmaşıklıktır: sağlanan modda, shard kapasitesini ve tüketici davranışını yönetirsiniz. Sıranın önemli olmadığı ve yeniden oynatmanın gerekmediği basit görev kuyrukları için, SQS daha basit seçimdir.

**AWS Glue**: Glue geleneksel bir ETL kümesinin altyapısını ortadan kaldırır. Dönüşüm mantığını yazarsınız; AWS Spark ortamını yönetir. Bu, dönüşümler karmaşık olduğunda veya veri hacimleri büyük olduğunda değerlidir. Sınırlama maliyet ve soğuk başlatmadır—Glue işleri birkaç dakikalık bir başlatma gecikmesine sahiptir, bu da onları gerçek zamanlıya yakın dönüşümler için uygunsuz kılar. Basit dosya formatı dönüşümleri için (CSV'den Parquet'e), Glue'nun ek yükü bir Lambda fonksiyonu veya hafif bir komut dosyasıyla karşılaştırıldığında buna değmeyebilir.

**Amazon Athena**: Athena, S3 verisini standart SQL ile ve yönetilecek altyapı olmadan sorgulamanıza olanak tanır. Kritik kısıt maliyettir: Athena taranan veri terabaytı başına ücret alır. Tüm şeyi tarayan 10 TB'lik bir tabloya karşı bir sorgu, 200 GB tarayan Parquet formatlı, bölümlenmiş bir tabloya karşı aynı sorgudan önemli ölçüde daha pahalıya mal olur. Üretimde Athena çalıştırmadan önce her zaman sütunlu formatlar (Parquet veya ORC) kullanın ve verinizi bölümleyin. Bu optimizasyonlar olmadan, Athena faturaları sizi şaşırtabilir.

## Özet

Bölüm 25'teki ağ çalışması Nimbus'un veri hattını mümkün kıldı. Bu bölüm o hattın ne için olduğudur: Nimbus'un ürettiği tüm veriyi gerçekten görünür ve eyleme geçirilebilir kılmak.

- **Amazon Kinesis**: Gerçek zamanlı veri akışı. Üreticiler kayıt yazar; tüketiciler kendi hızlarında okur. Amazon Data Firehose daha sonra akış verisini daha az operasyonel işle S3, Redshift ve diğer hedeflere teslim edebilir.
- **AWS Glue**: ETL ve veri kataloglama. Crawler'lar şemaları keşfeder; İşler veriyi dönüştürür; Data Catalog veriyi Athena ve diğer araçlar tarafından keşfedilebilir kılar.
- **Amazon Athena**: S3'te sunucusuz SQL. S3'teki herhangi bir veriyi standart SQL kullanarak sorgulayın. Taranan TB başına fiyatlandırılır—maliyeti en aza indirmek için Parquet ve bölümlemeyi kullanın.
- **Amazon Redshift**: Yüksek performanslı analiz için yönetilen veri ambarı. Veriyi yükleyin, tekrarlanan analitik sorgular için optimize edin ve ambar ölçeğinde hızlı sorgulayın.
- **Veri gölü kalıbı**: ham veri S3'e → Glue onu dönüştürür → Athena onu sorgular → BI araçları onu görselleştirir.
- **Glue şema evrimi**: Harici veri işleyen ETL hatları şema değişikliklerini zarif bir şekilde ele almalıdır. Yukarı akış verisi yeni alanlar eklediğinde hat arızalarından kaçınmak için `mergeSchema: true` ile DynamicFrames kullanın.
- **Athena İş Grupları**: ekip başına veri tarama sınırları ve sonuç konumları. Tek bir yapılandırmada maliyet kontrolü ve erişim kontrolü. Herhangi bir çok ekipli Athena dağıtımı için gereklidir.
- **Kinesis vs SQS**: Birden fazla tüketiciye fan-out ve yeniden oynatma yeteneği için Kinesis. Basit görev kuyrukları için SQS Standard; sıralı, yinelenenleri kaldırılmış görev işleme için SQS FIFO. Belirleyici soru: her tüketicinin her mesajı görmesi mi gerekiyor, yoksa her mesaj bir tüketiciye mi gidiyor?
- **Athena yanlış olduğunda**: yüksek frekanslı panolar (Redshift kullanın), operasyonel sorgular (RDS veya DynamoDB kullanın), çok küçük sık değişen veri kümeleri (sadece bir veritabanı kullanın).
- **Amazon QuickSight**: AWS'nin yönetilen BI hizmeti. Ayrı bir BI sunucusu çalıştırmadan panolar oluşturmak için Athena, S3, Redshift ve RDS'ye bağlanır. SPICE, tekrarlanan pano sorgularını hızlandıran bellek içi motordur.
- **AWS Lake Formation**: S3 + Glue Data Catalog üzerindeki veri gölleri için merkezi erişim kontrolü. Sütun düzeyinde, satır düzeyinde ve tablo düzeyinde izinlere olanak tanır—yalnızca IAM'in ifade edemeyeceği ince taneli veri yönetişimi.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.5)*

- **Kinesis vs SQS**: Kinesis = sıralı, gerçek zamanlı akış, birden fazla tüketici, saklama penceresi içinde yeniden oynatma (varsayılan 24 saat, 365 güne kadar). SQS = görev kuyruğu, her mesaj bir kez işlenir. "Aynı akışı aynı anda okuyan birden fazla tüketici" → Kinesis. "Mesaj başına bir işçi" → SQS.
- **Athena sınav sinyalleri**: "S3'te sunucusuz SQL," "S3 verisini bir veritabanına yüklemeden analiz et," "sorgu başına ödeme" → Athena.
- **Athena maliyet optimizasyonu**: Sütunlu format (Parquet veya ORC) + bölümleme taranan veriyi ve maliyeti dramatik şekilde azaltır. Sınav Athena maliyetlerinin nasıl azaltılacağını sorabilir.
- **Athena fiyatlandırması**: Taranan TB başına 5 dolar (us-east-1, us-west-2 ve çoğu büyük bölge). Maliyet döndürülen veriye değil, taranan veriye göre hesaplanır—üretim sorguları çalıştırmadan önce her zaman depolama formatını optimize edin.
- **Glue Crawler**: "S3 verisinin şemasını otomatik olarak keşfet" → Glue Crawler.
- **Amazon Data Firehose**: "Tüketicileri yönetmeden akış verisini otomatik olarak S3/Redshift/OpenSearch'e yükle" → Amazon Data Firehose. Eski materyaller hâlâ onu Kinesis Data Firehose olarak adlandırabilir.
- **Redshift vs Athena**: Sabit bir veri kümesinde yüksek frekanslı, karmaşık sorgular için Redshift (BI panoları). Sık değişen S3 verisinde geçici sorgular için Athena.
- **EMR (Elastic MapReduce)**: AWS tarafından yönetilen Hadoop/Spark kümeleri. Sınav "mevcut Hadoop/Spark iş yükleri" veya "özel veri işleme çerçeveleri" bahsedildiğinde bunu kullanır. Glue çoğu kullanım durumu için yönetilen alternatiftir.
- **QuickSight:** AWS yönetilen BI ve görselleştirme. Athena, S3, Redshift, RDS'ye bağlanır. SPICE = hızlı tekrarlanan sorgular için bellek içi motor. Sınav tetikleyicisi: "AWS'de iş zekâsı panosu" → QuickSight.
- **Lake Formation:** Bir veri gölü için merkezi erişim kontrolü (S3 + Glue Data Catalog). İnce taneli izinler: tablo, sütun ve satır düzeyi. Sınav tetikleyicisi: "S3 veri gölündeki belirli sütunlara erişimi kısıtla" veya "veri gölü yönetişimini merkezileştir" → Lake Formation.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Amazon Kinesis ile Amazon SQS arasındaki farkı açıklayın. Her birini ne zaman kullanırdınız?

*(İpucu: Aynı veriyi kaç tüketicinin okuyabileceğini, mesajların okunduktan sonra silinip silinmediğini ve sıranın önemli olup olmadığını düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir yolculuk paylaşım şirketi yolculuk verisini analiz etmek istiyor. Günde 1 milyon yolculuk tamamlanıyor. Yolculuk kayıtları S3'te JSON dosyaları olarak saklanıyor (her biri yaklaşık 2KB). Analiz ekibi "geçen hafta şehre göre ortalama yolculuk süresi" gibi geçici SQL sorguları çalıştırmak istiyor. Sorgular 2 dakikanın altında tamamlanmalı. Depolama maliyetleri en aza indirilmeli. Ekip haftada 20-30 sorgu çalıştıracak.

Bu gereksinimleri EN İYİ hangi mimari karşılar?

A) JSON'u tarihe ve şehre göre bölümlenmiş Parquet formatına dönüştürmek için AWS Glue kullanın; Amazon Athena ile sorgulayın  
B) Yolculuk verisini günlük olarak RDS PostgreSQL'e yükleyin; standart SQL kullanarak sorgulayın  
C) Yolculuk verisini Amazon Redshift'e teslim etmek için Amazon Data Firehose kullanın; Redshift ile sorgulayın  
D) Yolculuk verisini DynamoDB'ye yükleyin ve SQL sorguları için PartiQL kullanın

**İpucu 1**: Haftada 20-30 sorgu düşük frekanstır. Seyrek sorgulama için hangi hizmet en uygun maliyetlidir?

**İpucu 2**: Parquet formatı + bölümleme, Athena tarafından taranan veriyi—ve dolayısıyla maliyeti—dramatik şekilde azaltır.

**İpucu 3**: 1 milyon yolculuk × 2KB = günde ~2GB. Bir hafta boyunca, ~14GB. Athena için 5 $/TB'den, optimizasyon olmadan bile bu karşılanabilir.

**Cevap**: A

**Açıklama**: Glue, JSON'u Parquet'e (sütunlu format taranan veriyi dramatik şekilde azaltır) tarihe ve şehre göre bölümlenmiş (bölüm budama, "geçen hafta" sorgularının yalnızca 7 günlük bölümü taraması demek) olarak dönüştürür. Athena S3'ü doğrudan standart SQL ile sorgular. Haftada 20-30 sorgu için, sorgu başına ödemeli Athena, her zaman çalışan Redshift'e karşı son derece uygun maliyetlidir.

**Neden B değil?** Günde 2GB veriyi RDS'e yükleyip sonra sorgulamak, 7/24 çalışan bir veritabanı örneği gerektirir. Haftada 20-30 sorgu için, bu fazlasıyla aşırı mühendislik ve pahalıdır.

**Neden C değil?** Redshift yüksek frekanslı sorgular (aynı veri kümesinde günde yüzlerce) için uygun maliyetlidir. Haftada 20-30 sorgu için, her zaman açık Redshift kümesi Athena'nın sorgu başına fiyatlandırmasından çok daha pahalıya mal olur.

**Neden D değil?** DynamoDB, geçici analitik sorgular için değil, anahtar tabanlı erişim için optimize edilmiş bir anahtar-değer/belge deposudur. DynamoDB'de PartiQL tarif edilen türden GROUP BY toplamalarını desteklemez.

*SAA-C03 Alanı: Yüksek Performanslı Mimariler Tasarlama — Görev 3.5*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus, siparişler için gerçek zamanlı bir dolandırıcılık tespit sistemi inşa etmek istiyor. Sistem şunları yapmalı:

- Aynı hesap tarafından 60 saniyede 5'ten fazla verilen siparişleri tespit et
- Yeni hesaplardan (< 30 günlük) 500 doların üzerindeki siparişleri işaretle
- İşaretlenen siparişleri bir insan inceleme kuyruğuna gönder

Mimariyi tasarlayın. Kinesis neyi sağlar? Dolandırıcılık mantığı nerede çalışır? "Aynı hesap, 60 saniyelik pencere"yi nasıl ilişkilendirirsiniz? İşaretlenen siparişleri hangi hizmet alır?

*(Tek bir doğru cevap yoktur. Amaç, gerçek zamanlı akış mimarisi tasarımı pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Tom ilk Athena sorgusunu çalıştırdı.

"Geçen çeyrek gelire göre en iyi 10 restoran," dedi.

12 saniye sonra, sonuçlar belirdi.

Onlara baktı.

"Restoran 47 birinciydi," dedi. Maya'nın aile restoranıydı—Nimbus'un başladığı yer.

"Tabii ki öyleydi," dedi Maya. "Arepa o kadar güzel."

Tom başka bir sorgu çalıştırdı. Ve bir başkası. "Bu ayda ne kadara mal oluyor?" diye sordu Tom, Leo bir şey söyleyemeden. Leo sorgu tarama geçmişini kontrol etti. Üç sorgu, toplam taranan veri: 1,2GB. Maliyet: bir sentten az.

Bir saat sonra, Tom Nimbus'un işinin daha önce hiç sahip olmadığı şekilde tam bir resmine sahipti. Hangi restoran kategorilerinin en hızlı büyüdüğü. Hangi müşteri gruplarının en uzun süre kaldığı. Hangi menü öğelerinin en çok tekrar siparişi sağladığı.

"Bunu neden daha önce inşa etmedik?" diye sordu.

"Veriye sahiptik," dedi Leo. "Sadece onu kullanacak hatta sahip değildik."

"Veri her zaman oradaydı," dedi Maya sessizce. "Sadece onu göremiyorduk."

Sonraki bölümde: artık işi net görebildiğimize göre, onu çalıştıran altyapı için nasıl daha verimli ödeme yapacağımız hakkında konuşalım.
