# Bölüm 24: Büyüyenle Birlikte Büyüyen Veritabanı

Tom’un maliyet incelemesi, veritabanı katmanında beklenmedik bir şey bulmuştu.

Nimbus, RDS PostgreSQL’i kullanıyordu: Çoklu-Bölge, db.r6g.large örneği. 340$/ay.

“Bu biraz yüksek gibi,” dedi Tom. “Ama neye göre karşılaştırmam gerektiğini bilmiyorum.”

Leo, performans metriklerini çekti. Veritabanı CPU, Cuma akşamı yoğun saatlerde %85’e yükseliyordu. Okuma sorguları kuyruklanıyordu. P95 sorgu gecikmesi altı aydır ikiye katlanmıştı.

“Veritabanı darboğaz,” dedi. “Trafik arttı. Veritabanı buna göre ölçeklenemedi.”

“Sadece örneği daha büyük yapabilir miyiz?” diye sordu Maya.

“Evet,” dedi Leo. “Bu dikey ölçeklendirme. r6g.large’den r6g.xlarge’a geçiyoruz. Daha fazla CPU, daha fazla bellek. Daha pahalı olacak ve bize zaman kazandıracak.”

“Ama temel sorunu çözmüyor,” dedi Priya. “Sonunda en büyük örneğe ulaşacak ve farklı bir yaklaşım ihtiyacımız olacak.”

“İki yaklaşım var,” dedi Leo. “Okuma replikaları veya Aurora.”

“Bunlar arasındaki fark nedir?”

İyi bir soru. Bu bölümün geri kalanı bu cevabın cevabı.

Yoğun bir kütüphane düşünün, bir kütüphaneci hem kitapları içeriye giriyor hem de okuyucuların sorularını yanıtlıyor. Kütüphane popüler hale geldiğinde bir kuyruk oluşuyor. Çözüm: sadece soruları yanıtlayan daha fazla kütüphaneci işe alın – kitapların girişi orijinal masaya bağlı kalır. Bu okuma replikasıdır: okuma işlemlerini yöneten ek kapasite, tüm yazma işlemleri tek yetkili kaynağa gönderilir. Aurora ise raf sisteminin kendisini yeniden tasarlayarak her kütüphanecinin aynı raflarda olduğunu ve hiçbir gecikme olmadan aynı kitapları gördüğünü sağlar.

**Okuma Replikaları: Okuma Trafiğini Dağıtmak**

Çoğu web uygulaması, yazma işlemlerinden çok okuma işlemlerini yapar. Bir müşterinin menüyü görüntülemesi onlarca SELECT sorgusunu tetikler. Bir sipariş vermesi birkaç INSERT/UPDATE sorgusunu tetikler. Oran tipik olarak 10:1 veya daha yüksektir.

Bir **okuma replikası**, ana veritabanından tüm yazma işlemlerini alan ve bu yazma işlemlerini SELECT sorguları için sunan ek bir RDS örneğidir.

Nasıl çalışır:

1. Uygulama yazma (INSERT, UPDATE, DELETE) işlemlerini ana veritabanına gönderir.
2. Ana veritabanı bu değişiklikleri asenkron olarak okuma replikalarına çoğaltır.
3. Uygulama okuma (SELECT) işlemlerini okuma replikalarına dağıtır.
4. Okuma replikaları yükü paylaşır – her biri toplam okuma trafiğinin bir kısmını yönetir.

Sonuç: Ana veritabanı yalnızca yazma işlemlerini (ve isteğe bağlı olarak bazı okuma işlemlerini) yönetir. Okuma replikaları okuma yükünü yönetir. 10:1 bir okuma/yazma oranı için, bir okuma replikası eklemek yaklaşık olarak ana veritabanının toplam yükünü yarıya indirir.

**Önemli Sınırlama**: Çoğaltma **asenkron**dur. Çoğaltma gecikmesi vardır – tipik olarak milisaniyeler, ancak yük altında saniyeler olabilir. Bir replikadan yapılan okuma, ana veritabanındaki verilere biraz geride olabilir. Menüyü görüntüleme, sipariş geçmişini görüntüleme gibi çoğu okuma için bu kabul edilebilir. “Siparişim henüz tamamlandı mı?” – ana veritabanından okuyun.

**Okuma Replikaları: Detaylar**

- Bir ana RDS örneğine 5 okuma replikası yapılabilir.
- Okuma replikaları aynı bölgede veya farklı bir bölgede olabilir (çapraz bölge replikaları).
- Okuma replikaları kendilerine okuma replikaları (zincirleme) ekleyebilirler.
- Okuma replikaları ayrı uç noktalar – uygulamanız okuma işlemlerini replikaya yönlendirmelidir.
- Okuma replikaları tekli veritabanlarına yükseltilebilir (DR için kullanışlı).

Nimbus için Leo, bir okuma replikası ekledi. Uygulamayı şu şekilde güncelledi:

- Yazma işlemleri → ana uç nokta
- Menü görüntüleme, sipariş geçmişi → replika uç noktası

Ana veritabanındaki CPU, zirvede %85’ten %41’e düştü.

Tom maliyeti inceledi: Aynı örnek türündeki bir okuma replikası, ana veritabanına olan maliyetle aynıdır. 340$/ay’dan 680$/ay’a yükseldi.

“Okuma replikası ekleyerek yaklaşık olarak yükü yarıya indirdik,” dedi Tom.

“Evet. Ancak alternatif, daha büyük bir örnek türüne geçmek olurdu, bu da daha fazla maliyet anlamına gelirdi ve okuma yükünü dağıtmayacaktı.”

Tom hesapladı. Kararsız bir şekilde başını salladı.

“Aurora nedir?” diye sordu.

**Amazon Aurora: Veritabanı Motorunu Yeniden Düşünmek**

Aurora, AWS’nin kendi ticari ilişkilendirilebilir veritabanı motorudur ve MySQL ve PostgreSQL ile uyumludur. Bulut iş yükleri için, ilişkisel bir veritabanının depolama katmanının nasıl çalıştığını yeniden tasarlayarak, yerinden oluşturulmuş bir şekilde tasarlanmıştır.

Geleneksel bir RDS kurulumunda (MySQL, PostgreSQL), depolama ve hesaplama sıkı bir şekilde ilişkilidir. Veritabanı motoru verileri yönetir. Çoğaltma, ana veritabanından replikaya verileri kopyalar. Replikaya her yazma işlemi yeniden yapılmalıdır.

Aurora, depolama ve hesaplamayı ayırır. Üç kullanılabilirlik bölgesinde otomatik olarak çoğaltılan veriyle birlikte, veritabanı örneklerini (örnekleri) yöneten dağıtılmış, hataya dayanıklı bir depolama katmanı kullanır.

**Bu neyi değiştiriyor**:

**Okuma Replikaları**: Aurora replikaları veri çoğaltmasına ihtiyaç duymayan, zaten aynı depolama katmanını paylaşırlar. Bu, şu anlama gelir:

- 5 okuma replikası (normal RDS için)
- Okuma replikaları aynı bölgede veya farklı bir bölgede olabilir (çapraz bölge replikaları)
- Okuma replikaları kendilerine okuma replikaları (zincirleme) ekleyebilirler.
- Okuma replikaları ayrı uç noktalar – uygulamanız okuma işlemlerini replikaya yönlendirmelidir.

Tom, Nimbus için bir okuma replikası ekledi. Uygulamayı şu şekilde güncelledi:

- Yazma işlemleri → ana uç nokta
- Menü görüntüleme, sipariş geçmişi → replika uç noktası

**Arızalı Geçiş**: Replikalar paylaştığı depolama nedeniyle, geçiş çok daha hızlıdır — yükseltme veri aktarımını içermez, sadece yazma yönlendirmesini içerir.

**Depolama**: Aurora, depolama alanını 10 GB'lık artışlarla otomatik olarak ölçeklendirir, maksimum 128 TB'a kadar. Depolama alanını önceden ayarlamanız gerekmez.

**Performans**: Aurora, standart MySQL ve standart PostgreSQL için eşdeğer örnek türleri için 5 kat daha yüksek bir akış hızı iddia ediyor ve 3 kat daha yüksek.

**Aurora Fiyatlandırması: Tom Sorunu**

"Ne kadar maliyet ediyor?" Tom sordu.

Aurora fiyatlandırması, RDS'den farklıdır:

**Örnek Fiyatlandırması**: RDS örnek fiyatlandırmasına benzer şekilde türden.

**Depolama Fiyatlandırması**: GB başına ayda 0,10 ABD doları (depolanan her şey için ödeme yaparsınız, otomatik olarak ölçeklenir).

**I/O Fiyatlandırması**: Aurora, depolamaya (okuma/yazma) yapılan her I/O isteği için ücretlendirir. Yazma yoğun iş yükleri için önemli olabilir.

"Bekle," Tom dedi. "I/O'yu ayrı olarak mı ödeyeceğiz?"

"Aurora Serverless v2 ve Aurora I/O-Optimize edilmiş bu fiyatlandırma modelini değiştirir," dedi Leo. "Aurora I/O-Optimize edilmiş herhangi bir I/O ücreti almaz ancak daha yüksek bir depolama ve örnek fiyatı vardır. I/O yoğun iş yükleri için daha iyidir."

Tom, durumu değerlendirdi. Nimbus, okuma yoğun bir iş yüküydü (menü sorgularının çoğu, az sayıda yazma) ve Aurora I/O-Optimize edilmiş daha pahalı olabilir. Standart Aurora fiyatlandırması uygun olabilir.

Bu, senior mühendisler tarafından yapılan gerçek bir maliyet kararıdır: İş yükünüzün I/O desenlerini bilmeniz gerekir.

**Aurora Serverless: Örnekleri Düşünmeden Ölçekleme**

**Aurora Serverless v2**, veritabanı yüküne göre otomatik olarak hesaplama kapasitesini ölçeklendiren bir konfigürasyondur. (db.r6g.large) gibi sabit bir örnek boyutu seçmek yerine, Aurora Kapasite Birimleri (ACU) cinsinden minimum ve maksimum kapasiteyi ayarlarsınız.

Aurora Serverless v2:

- Yük arttıkça saniyeler içinde ölçeklenir
- Yük durgun olduğunda neredeyse sıfıra iner
- Maliyet: 1 ACU-saat başına 0,12 ABD doları (depolama ve I/O ile birlikte)

Değişken trafikli iş yükleri için — Nimbus'ın Cuma geceleri zirveleri ve Pazartesi sabahları sakinliği gibi — Serverless v2, boş zamanlarda maliyetleri azaltır ve önceden tahsis etme ihtiyacını ortadan kaldırarak zirveleri kaldırır.

"Yani Cuma gecesi zirvesinde," dedi Leo, "Aurora otomatik olarak ölçeklenir. Pazar sabahı neredeyse hiç trafik olmadığında, minimuma iner."

"Ve sadece kullandığımız kapasite için ödeme yaparız," dedi Tom.

"Doğru."

Tom, tam olarak aradığı şeyi bulmuş gibi bir ifadeye sahipti.

**Aurora Global Database: Çok Bölgesel Okuma**

**Aurora Global Database**, Aurora'yı birden fazla AWS bölgesine yayar:

- **Birincil bölge** tüm yazıları işler
- **Maksimum beş ikincil bölge** tipik olarak <1 saniye replikasyon gecikmesiyle okuma yapar
- İkincil bölgeler, <1 dakika içinde birincil bölge olarak terfi edilebilir (ACD senaryoları için)

Nimbus'ın küresel genişlemesi için, bir Londra restoran ortağının EU okuma replikasından yerel menüsünü sorgulamasına Aurora Global Database izin verirken, tüm siparişler (yazmalar) ABD birincil bölgeye gönderilir.

**RDS vs Aurora: Hangi Birini Seçmeli?**

| Faktör            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Maliyet            | Küçük iş yükleri için daha düşük | Daha yüksek temel fiyat, ancak daha iyi ölçeklenir             |
| Uyumluluk         | Tam                          | MySQL/PostgreSQL uyumlu (az sayıda farklarla)           |
| Maksimum replikalar | 5                             | 15                                                         |
| Replika gecikmesi  | Saniyeler                    | Tipik olarak <100ms                                         |
| Depolama          | Sabit tahsis                  | Otomatik olarak 128TB'a kadar ölçeklenir                   |
| Geçiş süresi      | 60-120 saniye                | <30 saniye                                                |
| Serverless seçeneği| Sınırlı                       | Aurora Serverless v2                                       |
| En iyisi için      | İstikrarlı, tahmin edilebilir iş yükleri | Değişken trafik, yüksek okuma hacmi, hızlı geçiş ihtiyacı |

## Güçlü Yönler ve Sınırlamalar

**Aurora'nın güçlü yönleri**:

- Standart RDS'ye göre önemli ölçüde daha hızlı geçiş
- Minimum gecikmeyle 15 okuma replikası
- Otomatik ölçeklenebilir depolama
- Değişken iş yükleri için Serverless v2
- Çok bölgesel dağıtım için Global Database

**Aurora'nın sınırlamaları**:

- Küçük, istikrarlı iş yükleri için daha yüksek maliyet
- Yazma yoğun iş yükleri için I/O fiyatlandırması önemli olabilir (I/O-Optimize edilmiş için bunu kullanın)
- Minor MySQL/PostgreSQL uyumluluk farklılıkları, kod değişiklikleri gerektirebilir
- Serverless v2 soğuk başlangıçlar (sıfırın yakınında) gecikme zirveleri neden olabilir

## Özet

- **Replikalar** okuma trafiğini ana sunucudan dağıtır. Asenkron replikasyon — çoğu okuma için hafif bir gecikme kabul edilebilir.
- **Aurora**, depolama katmanını yeniden tanımlar: dağıtık, replikalara yayılır, otomatik ölçekleme.
- Aurora aşağıdaki özellikleri sunar: 15 okuma replikası, <100ms replika gecikmesi, <30s geçiş, otomatik ölçekleme için kadar 128TB depolama.
- **Aurora Serverless v2**: yük bazında hesaplama kapasitesini otomatik olarak ölçeklendirir. Değişken trafik için uygundur.
- **Aurora Küresel Veritabanı**: bir bölgede ana sunucu, bir ila beş bölgede okuma replikaları.
- Daha küçük, kararlı ve tahmin edilebilir iş yükleri için RDS'yi seçin. Ölçeklenebilirlik, hızlı geçiş veya değişken trafik yönetimi gerektiğinde Aurora'yu seçin.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla (Alan 3, Görev 3.3)*

- **Aurora replikası vs RDS okuma replikası**: Aurora replikaları depolama paylaşır (neredeyse sıfır gecikme, <30s geçiş). RDS okuma replikaları verileri çoğaltır (gecikme mümkündür, geçiş için dakikalar).
- **Aurora Serverless v2**: "Veritabanı kapasitesini otomatik olarak ölçeklendirin", "öngörülemeyen veya dalgalanan veritabanı trafiği", "sıfıra ölçekleyin" → Aurora Serverless v2.
- **Aurora Küresel Veritabanı**: "çok bölge veritabanı", "düşük gecikmeyle AB bölgesinden okuma", "RTO < 1 dakika için bölgesel geçiş" → Aurora Küresel Veritabanı.
- **Geçiş zamanı**: Aurora < 30 saniye. RDS Çoklu-AZ 60-120 saniye. Her ikisini de bilin.
- **Aurora I/O-Optimize**: daha yüksek depolama ve örnek maliyeti, her I/O ücreti yoktur. I/O maliyetleri baskın olduğunda (yazma yoğun) kullanın. Standart Aurora: daha düşük depolama maliyeti, I/O başına ödeme. Okuma yoğun kullanım için kullanın.
- **Aurora Arka Plan**: belirli bir zamana geri dönen veritabanını, tam bir yedekten geri yüklemeden olmadan geri döndürür. MySQL uyumlu Aurora için yalnızca mevcuttur. Sınav işareti: "rastgele silinen veriler, tam bir yedekten geri yüklemeden hızlı bir şekilde kurtarmak gerekiyor."

## Uygulamalar

**Uygulama 1 — Hatırlama**

Aurora ve standart RDS okuma replikaları arasındaki fark nedir? Aurora'nın replikasyon gecikmesi neden genellikle daha düşüktür?

*(İpucu: Anahtar fark paylaşılan depolama ile veri replikasyonu arasındaki farktır. Her replikaya bir yazma geldiğinde ne yapması gerektiğini düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir sosyal medya platformunun MySQL veritabanı, artan trafik nedeniyle okuma gecikmesi nedeniyle yüksek yüklenmiştir. Uygulama okuma ağırlıklıdır (%95 okuma, %5 yazma). Ekip, yükte tutarlı okuma performansı, hatta zirve dönemlerde sağlamak istiyor. Minimum kesinti ile otomatik geçiş (RTO < 30 saniye hedefi) gerekiyor. Veri hacmi tahmin edilemez bir şekilde büyüyor.

Bu gereksinimleri en iyi karşılayan veri çözümü hangisidir?

A) RDS MySQL Çoklu-AZ beş okuma replikası ile
B) Aurora MySQL ile Aurora Replikaları ve Aurora Serverless v2
C) RDS MySQL ile daha büyük bir örnek türü (dikey ölçekleme)
D) DynamoDB ile DynamoDB DAX ile okuma önbelleklemesi

**İpucu 1**: "RTO < 30 saniye" — hangi hizmet bu gereksinimi karşılıyor? Her seçeneğin geçiş zamanlamasını kontrol edin.

**İpucu 2**: "Yükte tutarlı okuma performansı" — hangi hizmetin replikaları neredeyse sıfır gecikmeye sahipken potansiyel saniye gecikmeye sahip?

**İpucu 3**: "Tahmin edilemez bir şekilde büyüyen veri hacmi" — hangi hizmet depolama alanını otomatik olarak ölçeklendirir?

**Cevap**: B

**Açıklama**: Aurora MySQL ile Aurora Replikaları, neredeyse sıfır replikasyon gecikmesi (milyonlarca, saniye değil) ile tutarlı okuma performansı sağlar. Aurora Serverless v2, yük sırasında aşırı önbellekleme yapmadan hesaplama kapasitesini otomatik olarak ölçeklendirir. Aurora, veri büyüdükçe depolama alanını otomatik olarak ölçeklendirir. Aurora geçişi (replikayı yükseltme) 30 saniyeden daha kısa sürede tamamlanır — RTO gereksinimi karşılar.

**Neden A?** RDS Çoklu-AZ geçişi 60-120 saniye sürer — RTO < 30 saniyeyi karşılamaz. Standart RDS okuma replika gecikmesi, yük altında saniyelerle ulaşabilir — "tutarlı" okuma performansı garanti etmek daha zordur.

**Neden C?** Dikey ölçekleme (daha büyük bir örnek türü) kapasiteyi artırır ancak okuma yükünü dağıtmaz. Veritabanı, okuma için tek bir arıza noktasıdır.

**Neden D?** DynamoDB NoSQL'dir — MySQL'den DynamoDB'ye geçiş, veri modelini ve sorgu sorularını yeniden yapılandırmayı gerektirir, bu da bu performans iyileştirme görevinin kapsamı dışındadır.

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla — Görev 3.3*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, restoran ortaklarının Batı Kıyısındaki, Almanya'daki ve Avustralya'daki verilerini hızla görmesini sağlamak istiyor, çapraz bölge gecikmesi olmadan. Ancak tüm yazılar, tutarlılığı korumak için tek bir ABD-Doğu ana sunucuya gitmelidir.

Aurora kullanarak bir veritabanı mimarisi tasarlayın. Küresel Veritabanı nasıl yapılandırılmalıdır? ABD-Doğu ana sunucu çökmüşse ne olur? Promosyon sürecini nasıl yönetirsiniz?

*(Tek bir doğru cevap yoktur. Amaç, çok bölge veritabanı tasarımı konusunda pratik yapmaktır.)*

## Son Notlar

Leo, Serverless v2 ile Aurora'ya geçti.

Cuma zirvesi geçti ve CPU 60'ı aştı. Sorgu gecikmesi tutarlı kaldı. Aurora, yükü otomatik olarak ölçeklendirmek için kapasiteyi artırdı ve ardından yoğunluktan sonra geri düştü.

"Cuma günü bu ne kadar maliyeti oluşturdu, geçen Cuma'ya göre?" Tom Pazartesi sabahı sordu.

Leo, fatura keşifçisini açtı. "Cuma, saatlik 0,89 dolarla zirveye ulaştı. Cumartesi sabahı ise saatlik 0,11 dolar oldu."

Tom bir şey söylemedi.

"Eski kurulum, yükten bağımsız olarak saatlik 0,47 dolar sabit bir fiyat," diye ekledi Leo.

"Yani, zirve sırasında ödediğimiz miktar, daha öncekinden daha fazlaydı," dedi Tom.

"Evet. Ancak, düşük yoğunlukta önemli ölçüde daha az ödedik. Hafta boyunca net maliyet daha düşük."

Tom hesapladı. Sonra başını salladı.

"Burada bir ders var," dedi. "Doğru soru 'bu daha ucuz mu?' değil, 'bu, gerçek kullanım modelimiz için daha ucuz mu?'"

O sırada odanın diğer ucundan Priya, "Bu, kıdemli bir mühendisin sezgisidir," dedi.

Tom, bu şekilde tanımlanmaktan hafifçe endişelenmiş görünüyordu.

Bir sonraki bölümde: Ağınız darboğaz olduğunda ve özel bir otoyolun ücreti haklı çıkarıp çıkaramayacağını öğrenin.
