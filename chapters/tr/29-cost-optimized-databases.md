# Bölüm 29: Veritabanı Faturası

Tom’un depolama denetimi, 8.800 dolar değerinde bir israfı ortaya koymuştu. Veritabanı öğelerine yöneldi.

RDS Aurora: Aylık 647 dolar.
RDS PostgreSQL (okuma replikaları): Aylık 340 dolar.
ElastiCache: Aylık 183 dolar.

Toplam veritabanı katmanı: Aylık 1.170 dolar.

“Her birini anlamama izin verin, sonra herhangi bir şey kararlaştırmadan önce,” dedi. “Çünkü veritabanı, köşeleri keserek para tasarrufu yapmak için uygunsuz yer değildir.”

Bu akıllıca bir yaklaşım. Veri kaybına veya performans düşüşüne neden olan veritabanı yapılandırma hataları, tasarruf edilenlerden çok daha pahalıdır.

Bir veritabanını, bir arabanın motoruna benzetin. Daha ucuz yakıt, lastik basıncını ayarlama ve bagajdan gereksiz ağırlığı çıkarma yoluyla bir arabadan para tasarrufu yapabilirsiniz. Ancak, motorun bozulma riskini alarak yakıt tasarruflarından tasarruf etmeye çalışırsanız, motor bozulur ve bu da herhangi bir yakıt tasarrufunun maliyetinden çok daha pahalıdır. Tom’un yapacağı denetim, aynı mantığı izler: israfı şasi ve yakıt tankında arayın ve tam olarak ne yaptığınızı bilene kadar motoru değiştirmeyin.

**Veritabanı Yükünüzü Anlamak İlk Adım**

Veritabanı maliyet optimizasyonu, herhangi bir şey dokunmadan önce yükü anlamayı gerektirir.

Temel sorular:

- Ortalama ve zirve CPU kullanımı nedir?
- Okuma/yazma oranı nedir?
- Depolama büyüyor mu, istikrarda mı yoksa azalıyor mu?
- Okuma replikaları kullanılıyor mu?
- Instance yetersiz donanımlı mı (yavaşlamalara neden oluyor) yoksa aşırı donanımlı mı (boş kapasite için ödeme yapıyor mu)?

Tom, Aurora kümesi dahil olmak üzere üç veritabanı hizmeti için son 30 gün boyunca CloudWatch metriklerini çekti:

**Aurora kümesi**:

- Ortalama CPU: %18 (zirve: Cuma akşamları %67)
- Okuma/yazma oranı: 14:1 (okuma ağırlıklı)
- Depolama: 180 GB (aylık yaklaşık 5 GB artış)

**Okuma replikaları (RDS PostgreSQL, Aurora’dan ayrı)**:

- Bunlar, Aurora’ya geçmeden önce oluşturulmuş iki eski RDS okuma replikasıydı ve hala çalışıyordu.
- Her birine ortalama bağlantı sayısı: Günlükte 2. Ortalama CPU: %3.

“Bu replikalar neden hala çalışıyor?” diye sordu Tom.

Leo, örnekleme tarihlerini inceledi. “Aurora’ya geçiş sırasında oluşturuldu. Kullanılmadıklarını unutmuştuk.”

Bulut ortamlarında pahalı bir şeyin aylarca kullanılmadan çalışmaya devam etmesi, sık karşılaşılan bir durumdur.

Replikalar kapatıldı. Aylık tasarruf: 340 dolar.

**RDS Rezervli Instance’lar: Veritabanı Versiyonu**

EC2 gibi, RDS de taahhütlü kullanım için Rezervli Instance’lar sunar.

Aurora ile Serverless v2 için Rezervli Instance’lar doğrudan uygulanmaz — Serverless v2, ACU-saat başına dinamik olarak ölçeklenir ve ödeme yaparsınız. Ancak, sabit bir Aurora instance konfigürasyonu (Serverless değil) kullanıyorsanız, Rezervli Instance’lar %30-60 oranında tasarruf sağlayabilir.

Tom, yazıcı ve bir okuyucu olan provisioned instance’ları (Aurora) inceledi:

- Yazıcı instance: db.r6g.large, On-Demand = 0,26/saat = 190/ay
- Okuyucu instance: db.r6g.large, On-Demand = 0,26/saat = 190/ay

Her ikisi için 1 yıllık Rezervli Instance: her biri yaklaşık 108/ay. Toplam yıllık tasarruf: 984 dolar.

“Bekle,” dedi Leo. “Aurora Serverless v2’ye 24. Bölümde geçtik. Tom, provisioned instance’lar için neden On-Demand’i inceliyor?”

İyi bir tespit. Lütfen doğru olalım: Nimbus’ın ana Aurora yazıcısı Serverless v2’yi kullanır. Okuyucu (okuma replikaları için) de Serverless v2’yi kullanır. Serverless v2 geleneksel Rezervli Instance’larla gelmez — ACU-saat başına ödeme yaparsınız.

Sabit Aurora instance’ları (Serverless değil) kullanan ekipler için Rezervli Instance’lar önemli tasarruflar sağlar. Serverless v2 iş yükleri için tasarruflar, hizmetin kendisinin otomatik ölçeklenmesinden gelir — kullanılmayan kapasite için ödeme yapmazsınız.

**DynamoDB: On-Demand vs Provisioned**

9. Bölümde, DynamoDB’nin iki kapasite modunu tanıtmıştık: on-demand ve provisioned.

Nimbus, Aurora’ya başladığı zamandan beri on-demand modunda çalışıyordu. Düşük trafikte bu doğruydu — on-demand, isteğe bağlı olarak daha pahalıdır ancak minimum bir ücret yoktur.

Şimdi 18 aydan fazla trafik verisiyle CloudWatch’ta desenleri görebiliyordu Tom.

Ortalama günlük birim okuma kapasitesi: 45.000
Ortalama günlük birim yazma kapasitesi: 12.000
Peak gün (Cuma): Bir DynamoDB isteği hacminin 25 katı olan ortalama yükün %180’i (ElastiCache yaklaşık %95’i okuma okuma isteklerini emer, bu nedenle DynamoDB yalnızca bir kısmını görür)

**On-demand fiyatlandırması**: 1 milyon yazma isteği başına 1,25 dolar, 1 milyon okuma isteği başına 0,25 dolar.
**Provisioned fiyatlandırması**: Bir saatte bir yazma kapasitesi birimi başına 0,00065 dolar, bir saatte bir okuma kapasitesi birimi başına 0,00013 dolar.

Tom, denge noktası hesaplamasını yaptı: provisioned kapasite, boş dönemlerde ön ödeme yapmadığınızda tutarlı kullanımınızla daha ucuz hale gelir.

18 aydan fazla veriye sahip günlük desenlerin tutarlı olduğunu gösteren verilerle, **DynamoDB Auto Scaling** ile provisioned kapasite doğru seçimdi:

- Minimum kapasiteyi ortalama yükün %60’ına ayarla
- Maksimum kapasiteyi ortalama yükün %250’sine ayarla (Cuma günkü zirveleri yönetir)
- Auto Scaling, bu aralıklar arasında provisioned kapasiteyi ayarlar

Aylık DynamoDB maliyeti: (on-demand) 340 dolardan (provisioned ile auto scaling) 230 dolara düştü. %32 azalma.

“Ama kapasiteyi aşarsanız, kullanılmayan kapasite için ödeme yaparız,” diye sordu Leo.

"Bu risk," Tom dedi. "Auto Scaling ile, minimum eşik değerini, darboğazları önleyecek kadar yüksek ayarlıyoruz ve AWS, bizim aramızda yönetiyor."

"Ve trafiğimiz önemli ölçüde değişirse ne olur?"

"O zaman sınırları ayarlarız. Bunu üç ayda bir gözden geçiririz."

**ElastiCache: Boyutlandırma ve Rezervasyonlu Kümeler**

ElastiCache faturalandırması: 183$/ay. Bir cache.r6g.large Redis örneği her AZ'de (iki düğüm, ana + replika).

CloudWatch metrikleri gösterdi:

- Ortalama bellek kullanımı: %34
- Tepe: %58

Örnek aşırı donanımlıydı. Yük için cache.r6g.medium daha uygun olurdu ve yeterli boşlukla.

r6g.large’dan (2 düğüm × 0,127/saat) r6g.medium’e (2 düğüm × 0,065/saat) geçirmek:

- Aylık tasarruf: 113$ → bekleyin.

Aslında hesaplama: large = 2 × 0,127 × 730 saat = 185$/ay. Medium = 2 × 0,065 × 730 = 95$/ay. Tasarruf: 90$/ay.

Tom, yük altında iki hafta boyunca staging ortamında medium örneği test etti. Bellek, limitin yakınında zirveye ulaştı (%71). Bu, onu rahatsız etti.

cache.r6g.large’ı denedi ancak Rezervasyonlu Kümeler (1 yıllık taahhüt) ile: On-Demand’den 185$’tan Rezervasyonlu 120$/aya düşüş. Tasarruf: 65$/ay, örnek türünü değiştirmediğinizde.

"Bazen daha küçük bir örneğe boyutlandırma yapmak performans sorunlarına yol açabilir," dedi. "Rezervasyonlu Kümeler, daha az riskle aynı tasarrufu sağlar."

**RDS Yedekleme Tutma Süresi: Depolama Ticareti**

RDS otomatik yedeklemeleri S3’te saklanır (depolama maliyeti, veritabanınızın boyutunun %100’üne kadar olduğunda ek ücret talep edilmez). Varsayılan tutma süresi 7 gündür.

Nimbus’un 180GB Aurora veritabanı için 7 günlük yedeklemeler uygundu - yedeklerden içinde bu pencerede kurtarma yapabildik.

Ancak Tom fark etti: aynı zamanda her önemli dağıtım için manuel anlık görüntüler de tutuyorlardı ve bunları sonsuza kadar saklıyorlardı.

23 manuel anlık görüntü, toplam 4,1TB anlık görüntü depolama alanı.
Maliyet: Aurora yedeklemeleri için 0,095$/GB/ay = 389$/ay manuel anlık görüntü depolama maliyeti.

Son 3 manuel anlık görüntüyü ortam (üretim, staging) için sakladılar. Diğerlerini silerek.
Tasarruf: 350$/ay.

"7 günlük otomatik yedeklemeler ve 3 manuel anlık görüntü ile aynı güvenlik hissini elde edebiliriz," dedi Leo.

"Güvenlik hissi için ödeme yapıyoruz," diye düzeltildi Tom tarafından. "Soru şudur: bu güvenlik hissi için ne kadar ödeme yapmalıyız?"

"Uygun bir felaket kurtarma planı ile," dedi Priya, "aynı güvenlik hissini 7 günlük otomatik yedeklemeler ve 3 manuel anlık görüntü ile alabilirsiniz."

"Katılıyorum. Şimdi."

**Veritabanı Optimizasyon Özeti**

| Hizmet                                           | Önce     | Son     | Aylık Tasarruf |
|---------------------------------------------------|------------|---------|----------------|
| RDS Okuma Replikaları (kullanılmıyor)              | 340$      | 0$      | 340$           |
| Aurora (Rezervasyonlu Instance’lar)               | 190$      | 120$    | 70$            |
| DynamoDB (On-Demand → Tahsisli + Otomatik Ölçekleme) | 340$      | 230$    | 110$           |
| ElastiCache (Rezervasyonlu Kümeler)                | 185$      | 120$    | 65$            |
| Aurora manuel anlık görüntüler                     | 389$      | 39$     | 350$           |
| **Toplam**                                         | **1.444$** | **509$** | **935$/ay**    |

Ayda 935$’lık bir veritabanı tasarrufu. Yıllık 11.220$.

Tom bu sayıyı depolama tasarrufu ($6.200/yıl) ve Savings Plan tasarrufu ($14.200/yıl) ile birleştirdi.

Toplam optimizasyon etkisi: Yıllık 31.620$.

"Bu sayı, üç junior mühendisin," dedi Maya.

"Veya bir senior," dedi Priya.

"Veya on iki ay boyunca yapılan deneyler," dedi Leo.

Hepsi üçü de doğruydu.

## Güçlü Yönler ve Sınırlamalar

**DynamoDB Tahsisli ile Otomatik Ölçekleme**:

- On-demand’e göre daha ucuz, tahmin edilebilir ve tutarlı iş yükleri için
- Otomatik Ölçekleme, kalıcı olarak aşırı donanımlandırmadan değişkenliğe uyum sağlar
- Kapasite sınırlarının uygun kalıp kalmadığını sağlamak için izleme gerektirir

**RDS Rezervasyonlu Instance’lar / ElastiCache Rezervasyonlu Kümeler**:

- İstikrarlı ve uzun süreli iş yükleri için önemli tasarruflar
- Kilimli taahhüt – ihtiyaçlarınız değişirse, kullanmayan kapasite için ödeme yapmış olursunuz
- RI Piyasası, satılamayan RDS RI’larını (satılabilir olmayan Convertible’ın aksine) satmanıza olanak tanır

**Genel İlke**:

- Her zaman kullanım oranlarını optimize etmeden önce anlayın
- Kullanılmayan kaynaklar (tarihi okuma replikaları gibi) en yüksek geri dönüşlü optimizasyondur
- Boyutlandırma, üretim ortamında uygulanmadan önce staging ortamında doğrulanmalıdır
- Rezervasyon fiyatlandırması, iş yükünün istikrarına güvenmeyi gerektirir

## Özet

- **İlk denetimi yapın**: CloudWatch metriklerini herhangi bir veritabanı değişikliğinden önce alın.
- **Kullanılmayan kaynakları silin**: Gereksiz okuma replikaları, boşaltılmış veritabanları ve artık gerekli olmayan test örnekleri.
- **DynamoDB On-Demand vs. Ayarlanmış**: Tahmin edilemeyen trafik için On-Demand; Tutarlı desenler için Ayarlanmış + Otomatik Ölçekleme.
- **ElastiCache Rezervasyonlu Kümeler**: Redis/Memcached için EC2 Rezervasyonlu Örnekleri gibi. Kararlı iş yükleri için %30-50'lik tasarruf.
- **RDS görüntüsü yönetimi**: İhtiyacınız olan görüntülerden yalnızca birkaçını tutun. Manuel görüntüler silinene kadar sonsuza kadar saklanır.
- **Dikkatli boyutlandırın**: Veritabanı boyutlandırma, performans olaylarına neden olabilir. Stajda test edin, yük altında doğrulayın.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimari Tasarımı (Alan 4, Görev 4.3)*

- **DynamoDB fiyatlandırma modları**: On-Demand = isteğe bağlı başına ödeme (daha yüksek birim maliyeti, minimum yok). Ayarlanmış = saat başına birim kapasite başına ödeme (daha düşük birim maliyeti, kapasite tahsis etmeniz gerekir). **DynamoDB Otomatik Ölçekleme**, ayarlanmış kapasiteyi otomatik olarak ayarlar.
- **RDS Rezervasyonlu Örnekler**: Tüm RDS motor türleri için mevcuttur. Çoklu-A alan dağıtımları Rezervasyonlu Örnekleri kullanabilir (Çoklu-A'ya bağlı kalırsınız). 1 veya 3 yıllık terim.
- **ElastiCache Rezervasyonlu Kümeler**: EC2 Rezervasyonlu Örnekleri ile aynı taahhüt modelidir. Bir düğüm, bir küme değil, her düğüm için uygulanır.
- **RDS görüntüsü depolama**: Otomatik yedeklemeler, veritabanınızın boyutunun %100'üne kadar ücretsizdir. Manuel görüntüler, S3'te GB başına ayda ücretlendirilir. Sınav senaryosu: "RDS depolama maliyetlerini azaltın" → eski manuel görüntüler silin.
- **DynamoDB Rezervasyonlu Kapasite**: DynamoDB için de mevcuttur (1 veya 3 yıl için okuma/yazma kapasitesine bağlı kalırsınız, normal fiyatlandırmadan indirimli). Farklı olarak standart ayarlanmış — kapasiteyi ön ödemelisiniz.
- **Aurora Serverless v2 vs. Ayarlanmış**: Serverless v2, otomatik olarak ölçeklenir, değişken iş yükleri için idealdir. Rezervasyonlu Örneklerle ayarlanmış, kararlı, tahmin edilebilir iş yükleri için daha ucuzdur.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

DynamoDB On-Demand kapasitesini ayarlanmış kapasiteyle ve Otomatik Ölçekleme ile kullanmanız gerektiğinde ne zaman? Bu kararı vermeniz için hangi bilgileri almanız gerekir?

*(İpucu: "Tahmin edilebilir" teriminde trafik verileriyle ne anlama geldiğini düşünün ve On-Demand'in hangi riski ortadan kaldıracağını düşünün ki ayarlanmış riskli.)*

**Alıştırma 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, bir mobil oyunun liderlik tahtası için bir DynamoDB tablosu çalıştırıyor. Trafik, mevsimsel bir etkinlik sırasında (dörtte birde, normal trafiğin 10 katı) yoğunlaşır ancak diğer zamanlarda çok tutarlıdır. Etkinlik dışında şirket, performans sorunlarını korurken veritabanı maliyetlerini en aza indirmek ister.

Bu gereksinimleri en iyi karşılayan DynamoDB kapasite stratejisi hangisidir?

A) Mevsimsel zirveleri zorlamadan On-Demand kapasite
B) Mevsimsel zirvelerdeki seviyelerde kalacak şekilde ayarlanmış kapasite (her zaman 10x trafiğe ayarlanmış)
C) DynamoDB Otomatik Ölçekleme ile ayarlanmış kapasite, mevsimsel zirve için maksimum kapasite ayarlanmış
D) 3 yıl boyunca normal trafik seviyelerinde DynamoDB rezervli kapasite birimleri

**İpucu 1**: "Tutarlı trafik, bilinen mevsimsel zirveler dışında" — hangi mod bu her ikisi için de verimli çalışır?

**İpucu 2**: "Maliyetleri en aza indirin" yansız dönemlerde, 10x'i sürekli olarak aşırı boyutlandırmanız gerekmez.

**İpucu 3**: DynamoDB Otomatik Ölçekleme, mevsimsel olay sırasında ölçeklenebilir ve olaydan sonra geri ölçeklenebilir.

**Cevap**: C

**Açıklama**: Otomatik Ölçekleme ile ayarlanmış kapasite, trafiğe göre tabloyu ölçeklendirir. Normal dönemlerde kapasite normal seviyelerde (düşük maliyetli) olur. Mevsimsel olay sırasında Otomatik Ölçekleme, trafik artışını algılar ve maksimum yapılandırılmış seviyeye ölçeklenir (10x zirveyi işler). Olayın ardından geri ölçeklenir. Normal dönemlerde On-Demand'den daha ucuzdur (On-Demand isteğe bağlı başına daha yüksek bir maliyetlidir) ve her zaman 10x'e ayarlanmaktan daha ucuzdur.

**Neden A?** On-Demand, zirveleri zorlar ancak normal, tahmin edilebilir trafik sırasında ayarlanmıştan daha yüksek birim maliyetlidir.

**Neden B?** 10x'e sürekli olarak ayarlanmış, yılın %75'inde kullanılmayan kapasitenin %75'ini ödemek anlamına gelir — kapasitenin hiç kullanılmaması sırasında kapasiteyi aşırı boyutlandırmanız gerekir.

**Neden D?** Rezervasyonlu kapasite birimleri, normal trafik seviyelerine bağlı kalmanızı sağlar. 10x mevsimsel olay sırasında, rezervli miktarın ötesinde zorlanırsınız veya On-Demand'i eklemeniz gerekir.

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimari Tasarımı — Görev 4.3*

**Alıştırma 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, yeni bir özellik olan bir restoran analitik panosunu değerlendirmektedir: gerçek zamanlı sipariş sayılarını, saat başına geliri ve müşteri demografik bilgilerini gösteren bir pano. Bu veriler yaklaşık olarak dakikada 200 kez sorgulanacaktır (bir analist her sayfa yenilemesinde, 10 analist ile). Bu veriler şu anda Athena'da (S3'te) bulunmaktadır. Panoyu Athena'da oluşturmalı mıyız, yoksa verileri bir veritabanına yüklemeli miyiz? Eğer bir veritabanı ise, hangisi (Aurora, DynamoDB, Redshift)?

Dikkate alın: sorgu sıklığı, veri tazelik gereksinimleri, sorgu karmaşıklığı (toplamlar, birleştirmeler) ve bu hacimde sorgu başına maliyet.

*(Tek bir doğru cevap yok. Amaç, analitik iş yükleri için veritabanı seçimi konusunda pratik yapmaktır.)*

## Kredilerden Sonraki Sahne

Tom, Maya'ya tam maliyet optimizasyonu özetini sundu.

Üç aylık bir çalışma. Yıllık 31.620 dolar tasarruf tespit edildi. 26.400 dolar değerinde değişiklikler zaten uygulandı.

"Kalan 5.220 dolar ne?" diye sordu Maya.

"Henüz kendime güvenmediğim optimizasyonlar," dedi Tom. "Aurora yapılandırması daha da küçültülebilir, ancak bir çeyrek daha veri beklemeden kesinleşmek istiyorum. Ayrıca tam olarak analiz etmediğim bir veri aktarım sorusu var."

"Ağ maliyetleri."

"Evet. O gelecek."

Maya sayıları inceledi. "Tom, bir şey anlamamı istiyorum. Bu optimizasyon — üç aydır üzerinde çalışıyorsun. Bu, rolünün önemli bir parçası."

"Yaklaşık %30."

"Ve 26.400 dolar tasarruf ettin. Yani optimizasyon, dört ay maaşın karşılığı kadar ödeniyor mu?"

Tom ona baktı. "Yaklaşık öyle."

"Ve her yıl sonra, bu saf tasarruf."

"Veya saf yeniden yatırım," dedi. "Aynı etki."

Maya başını salladı. "Bu, bana yaptırmak istediğim şey. Sadece depolama ve veritabanları konusunda değil, her şeyde. Maliyet optimizasyonunu rolünün sürekli bir fonksiyonu haline getirmek istiyorum."

Tom, işinin bu şekilde tanımlanmasını daha önce hiç duymamıştı. Hem doğru hem de tatmin edici buldu.

Bir sonraki bölümde: kalan son maliyet kategorisi — ve herkesi şaşırtan o.
