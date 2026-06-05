# Bölüm 8: Asla Hastayla Gelmeyeni Yönetici

Saat 3:00'ta uyarı geldi.

Veritabanı sunucusu bir güvenlik yaması gerektiriyordu – bu da yeniden başlatmayı gerektiren bir türdü.
Zafiyet gerçekti, yamayı mevcutti ve müşterileri aksatmadan uygulamak için pencere o anda, trafiğin düşük olduğu gece yarısıydı.

Priya tek başına uyanık olan kişiydi. Yamayı uyguladı, sunucuyu yeniden başlattı, uygulamamanın tekrar online gelmesiyle logları izledi ve saat 4:15'te yatağa girdi.

Sabah, ne olduğunu ekibe anlattı. Bir sessizlik oldu.

"Bu tekrar olacak," dedi Tom.

"Bu, yamayla her seferinde olacak," dedi Priya. "Ve yamalar her zaman olacak. Bunu yapmak için daha iyi bir yol olmalı."

Bir yolu vardı. Veritabanını kendileri yönetmeleri gerektiği fikrinden vazgeçmeleri gerekiyordu.

**Geleneksel Veritabanı Sorunu**

Bir veritabanını kendi EC2 örneğinizde kendiniz çalıştırırsanız, her şeyi siz yönetirsiniz.

Veritabanı yazılımını kurmak. Güvenli bir şekilde yapılandırmak. Güvenlik zafiyetleri bulunduğunda yamalamak. Yedeklemeler almak (çoğu ekip bunu yapana kadar çok geç olur). Yedeklemelerin gerçekten çalıştığını test etmek (çoğu ekip bunu yapana kadar çok geç olur). Disk alanı izlemek. Redundansı için replikasyon ayarlamak. Birincil sunucu çökerse yedekleme için geçişi yapılandırmak. Sorgu performansını ayarlamak. Yük altında bağlantıları yönetmek.

Hiçbiri uygulamanın bir parçası değildir. Hiçbir şey özellikler eklemez. Hepsi uzmanlık gerektirir.

Çoğu geliştirme ekibi veritabanı yöneticisi değildir. Bu, tahmin edilebilir bir kalıbı yaratır: Veritabanı kurulur, minimum yapılandırılır ve sonra bir şeyler çok felaket bir şekilde yanlış giderene kadar çoğunlukla unutulur.

"Bu da mı yaptık?" diye sordu Maya.

Leo'nun cevabı sessizlikti, bu da evet demektir.

**Amazon RDS: Yönetilen Veritabanı**

**Amazon RDS** – İlişkisel Veritabanı Hizmeti – ilişkisel bir veritabanını kendiniz yönetme yükünü ortadan kaldırarak sizin için yapar.

RDS ile, AWS şunları yönetir:

- Veritabanı motorunu kurmak ve yamalamak
- S3'te depolanan otomatik yedeklemeler (35 gün boyunca korunur)
- Birincil sunucu çökerse otomatik geçiş (bir yedek sunucu otomatik olarak devreye girer)
- İzleme ve metrikler
- Dinlenmiş ve aktarım halindeki şifreleme
- Etkinleştirildiğinde disk, ihtiyaç duyulduğunda büyüyen otomatik ölçeklendirme (eğer etkinleştirirseniz)

Siz yönetirsiniz:

- Veritabanı şemasını (tablolarınızın yapısı)
- Sorgularınızı ve uygulama mantığınızı
- Veritabanına kimlerin erişebileceğini
- Veritabanını çalıştıran örneği türünü
- Parametre ayarını (RDS mantıklı varsayılan değerler sağlar)

Analoji: Asla hastayla gelmeyen, yapılandırma hataları yapmayan, günlük yedeklemeler alan ve bir şeyler kırıldığında kendilerini düzelten bir veritabanı yöneticisini işe almak – ancak uygulamanın mantığını yazmayan.

**Desteklenen Motorlar**

RDS, aşağıdaki popüler veritabanı motorlarını destekler:

- **MySQL** – En yaygın açık kaynaklı ilişkisel veritabanı
- **PostgreSQL** – Güçlü, genişletilebilir, karmaşık iş yükleri için giderek daha popüler
- **MariaDB** – MySQL'in açık kaynaklı bir çakması, tam uyumlu
- **Oracle** – Büyük kuruluşlar tarafından kullanılan, eski gereksinimlere sahip
- **Microsoft SQL Server** – Windows yoğun ortamlar için
- **Amazon Aurora** – AWS'nin kendi MySQL/PostgreSQL uyumlu motoru, bulut için oluşturulmuş (24. Bölüm'de Aurora'yı derinlemesine ele alıyoruz)

Nimbus için, PostgreSQL seçildi. Leo'nun bildiği şeydi ve ilişkisel verileri iyi ele alıyordu. Uygulama için motor seçimi genellikle daha az önemlidır – RDS'nin operasyonel faydaları her durumda geçerlidir.

**Multi-AZ: Devralan Yedek Sunucu**

Bu özellik, güvenilirlik hesaplamasını tamamen değiştiriyor.

**Multi-AZ dağıtımı** – RDS, birincil sunucunun bulunduğu Farklı Erişilebilirlik Alanına (AZ) sahip bir yedek sunucuyu senkronize olarak sürdürür. Birincil sunucuya yazılan her işlem, işlem tamamlanmadan önce yedek sunucuya senkronize olarak çoğaltılır.

Birincil sunucu başarısız olduğunda – donanım arızası, AZ kesintisi, yazılım çökmesi – RDS, yedek sunucuyu otomatik olarak devralır. Veritabanı uç noktasının DNS kaydı güncellenir. Uygulamanız yeni birinciliğe bağlanır.

Devralma 60-120 saniyedir. Bu süre zarfında uygulamanız bağlantı hatalarıyla karşılaşacaktır. İyi yazılmış uygulamalar bu durumu zarif bir şekilde ele almalıdır (geri dönüşlerle birlikte bir gecikme ile).

Yedek sunucu, okuma replikası değildir. Okuma trafiğini hizmet vermez. Sadece birincilin devralmaya hazır olması için hazırdır.

Tom: "Multi-AZ'ın maliyeti ne kadar?"

Yaklaşık olarak tek bir örneğin iki katı – aslında iki veritabanı örneğini çalıştırmanız gerektiği için. Yedek sunucu, birincil örneğin maliyetine eşittir.

Tom: "Ve planlanmamış bir kesintinin maliyeti ne kadar?"

Sorunun cevabını kendisinin sorduğu soruyu yanıtladı ve Cuma akşamı zirvesi sırasında saat başına gelir tahminiyle sipariş geçmişini açtı.

Multi-AZ öğleden sonra etkinleştirildi.

**Otomatik Yedeklemeler ve Zaman Damgası Kurtarma**

RDS, günlük olarak otomatik yedeklemeler yapar. AWS, bu yedeklemeleri S3’te (RDS tarafından yönetilir — doğrudan S3 konsolunuzda görmezsiniz) depolar. Yedekleme tutma dönemi içindeki herhangi bir zamana veritabanınızı geri yükleyebilirsiniz.

Yedeklemeler, yapılandırılabilir **bakım penceresi** sırasında gerçekleşir — tipik olarak sabahın erken saatlerinde düşük trafikli bir dönem. Çoğu motor türü için yedeklemeler çalışma zamanı gerektirmez.

**Anlık kurtarma** en değerli özelliklerden biridir: tutma dönemi içindeki herhangi bir saniyeye geri yükleyebilirsiniz. Günlük görüntülerden ibaret değil — *herhangi bir saniye*. Bu, RDS’nin günlük yedeklemelerin yanı sıra işlem günlüklerini sürekli olarak kaydettiği için mümkündür.

Birisi yanlışlıkla 2:37’de `DELETE FROM orders WHERE 1=1` komutunu çalıştırırsa, geri yükleme yaparak 2:36’ya geri dönebilirsiniz.

Leo, bunu anladığında belirgin şekilde rahatlamıştı.

“Silmekten sonradaki şeyi kurtarabildi miyiz?” diye sordu.

“RDS öncesi? Hayır,” dedi Priya. “RDS sonrası? Evet.”

**Yedekli Kopyalar: Okuma Trafiğini Ölçeklendirme**

Multi-AZ, kullanılabilirliği ilgilidir. **Yedekli kopyalar** ise performansı ilgilidir.

Bir yedekli kopya, ana veritabanınızın asenkron bir kopyasıdır ve okuma sorgularını hizmet verebilir. Çoğu RDS motoru için (Aurora için daha fazla) 5 adet yedekli kopya oluşturabilirsiniz.

Uygulama, okuma sorgularını kopyaya ve yazma sorgularını ana veritabanına göndermek üzere değiştirilir. Bu, yükü dağıtır: ana veritabanı yazma ve karmaşık işlemler gerçekleştirirken, kopyalar okuma işlemlerini gerçekleştirir.

Temel özellikler:

- **Asenkron** replikasyon — ana ve kopyalar arasında küçük bir gecikme (lag) olabilir. Bir kaydı yazarsanız ve hemen kopyadan okursanız, hemen görünmeyebilir.
- Yedekli kopyalar aynı Bölgede veya farklı bir Bölgede bulunabilir (çapraz Bölge yedekli kopyalar gecikmeye neden olur ancak coğrafi dağıtımı etkinleştirir).
- Bir felaket senaryosunda yedekli kopyalar bağımsız veritabanlarına yükseltilebilir.

Nimbus için: menü aramaları okuma işlemleri. Sipariş geçmişi okuma işlemleri. Trafiğin büyük çoğunluğu okuma trafiğidir. Bir yedekli kopya ekleyip okuma işlemlerini ona yönlendirerek ana veritabanı yükünü önemli ölçüde azaltır.

Okuma kopyalarını 24. Bölümde (Aurora’yı ele alırken) daha ayrıntılı olarak ele alıyoruz.

**RDS Parametre Grupları ve Seçenek Grupları**

Sınavda sıkça karşılaşılan iki yapılandırma mekanizması:

**Parametre grupları** veritabanı motoru ayarlarını kontrol eder — maksimum bağlantı sayısı, sorgu önbellek boyutu, zaman aşımı değerleri gibi. RDS, çoğu durumda işe yarayan varsayılan bir parametre grubu oluşturur. Özel ayar yapmak istediğinizde özel parametre grupları oluşturursunuz.

**Seçenek grupları** bazı motorlar için ek özelliklerin etkinleştirilmesine olanak tanır — Oracle’ın yerel ağ şifrelemesi veya SQL Server’ın şeffaf veri şifrelemesi gibi. Çoğu açık kaynaklı motor dağıtımı için özel seçenek grupları gerekmez.

Bu ayarları ezberlemenize gerek yoktur. Veritabanı motorunun davranışını özelleştirmek için var olduklarını bilin.

## Güçlü Yönler ve Sınırlamalar

**RDS neden mükemmeldir**:

- Veritabanı yazılımının yönetim yükünü ortadan kaldırır
- Otomatik yedeklemeler ve anlık kurtarma
- Multi-AZ için otomatik geçiş (failover) ile minimum RTO
- Okuma kopyaları ile okuma trafiğini ölçeklendirme
- Dinlenme halindeyken ve iletim halindeyken yerleşik şifreleme
- Tüm büyük ilişkisel veritabanı motorları desteklenir

**RDS’nin sınırları nerede**:

- Temel işletim sistemine erişemezsiniz. Veritabanınızın gerektirdiği işletim sistemi düzeyinde erişim gerekiyorsa, kendi EC2 tabanlı veritabanınızı çalıştırmanız gerekebilir.
- RDS sunucusuz değildir (bazı istisnalar vardır — Aurora Sunucusuz mevcuttur ve 24. Bölümde ele alınır). Boşta olmasına rağmen çalışan bir örneği için ödeme yaparsınız.
- RDS, büyük ölçekli yazma yoğun ilişkisel iş yükleri için sonunda farklı bir mimariye ihtiyaç duyabileceğiniz devasa ölçekleme için tasarlanmamıştır.
- İlişkisiz (NoSQL) veri desenleri için DynamoDB (9. Bölüm) daha uygundur.

## Özet

- **Amazon RDS**, yönetilen bir ilişkisel veritabanı hizmetidir. AWS, yedekleme, geçiş ve depolama yönetimini ele alır. Şema, sorgular ve uygulama mantığı sizin sorumluluğunuzdadır.
- **Multi-AZ** dağıtımı, farklı bir AZ’de senkron bir yedekli standby oluşturur. Ana veritabanı başarısız olursa otomatik geçiş 60-120 saniye içinde gerçekleşir.
- **Otomatik yedeklemeler** ve **anlık kurtarma**, tutma dönemi içindeki herhangi bir saniyeye geri yükleme yapmanıza olanak tanır.
- **Okuma kopyaları**, ana veritabanının asenkron bir kopyasıdır ve okuma trafiğini hizmet verebilir, ana veritabanının yükünü azaltır. Replikasyon gecikmesi, biraz geride olabileceklerini gösterebilir.
- İlişkisel bir veritabanı ile yönetilen operasyonlara ihtiyacınız varsa RDS’yi seçin. Aurora’yı (24. Bölüm) daha yüksek performans veya sunucusuz seçenekler için kullanın.

## Sınav İpuçları

*SAA-C03 Alan 3 — Görev 3.3 (veritabanı çözümleri)*

- **Çoklu-AZ, yüksek kullanılabilirlik için tasarlanmıştır, performans için değil.** Bekleme sunucusu okuma trafiğine hizmet etmez. Okuma replikaları performans için kullanılır. Bu ayrım sık sık test edilir.
- **Çoklu-AZ failover otomatik gerçekleşir.** Ne zaman veya nasıl olacağını yapılandırmanız gerekmez. RDS, ana sunucuyu izler ve otomatik olarak failover'ı tetikler.
- **Replikasyon gecikmesi önemlidir.** Okuma replikaları ana sunucuya biraz geride olabilir. Uygulamanızın yazmaya yakın veri okuması gerekiyorsa, veriyi replikadan değil ana sunucudan okuması gerekir. Buna "yaz-ok uyumluluğu" denir.
- **Otomatik yedeklemeler 0–35 gün boyunca korunur.** Koruma ayarını 0'a ayarlamak otomatik yedeklemeleri devre dışı bırakır. Manuel anlık görüntüler, onları silene kadar sonsuza kadar korunur.
- **RDS depolama otomatik ölçeklendirmesi** disk dolu çıkışları önler. Etkinleştirin. Sadece yukarı ölçeklenir, asla aşağı ölçeklenmez. Sınav, bu simetriyi bildiğinizden emin olmayı test edebilir.

## Egzersizler

**Egzersiz 1 — Hatırlama**

Kendi kelimelerinizde: Çoklu-AZ ve RDS'deki okuma replikaları arasındaki fark nedir?
Her biri hangi sorunu çözüyor?

*(İpucu: Birini arıza durumunda kullanılabilirliğe korur; diğeri yoğun okuma yük altında performansı artırır. Farklı sorunları çözer ve birlikte kullanılabilir.)*

**Egzersiz 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, RDS üzerinde çalışan bir PostgreSQL üretim veritabanı çalıştırıyor. Veritabanı, gün boyunca çalışan raporlama sorgularından dolayı yüksek okuma trafiği yaşıyor. Ekip, bir arıza senaryosunda bile birkaç dakikadan fazla kesinti yaşamak istemiyor. Ekip, raporlama iş yüklerinden ana veritabanına olan etkiyi en aza indirmek istiyor.

Hangi RDS özelliklerinin kombinasyonu hem bu iki endişeyi en iyi şekilde ele alır?

A) Çoklu-AZ etkinleştirin ve tüm sorguları yedek sunucu örneğine çalıştırın
B) Çoklu-AZ'ı failover koruması için etkinleştirin ve raporlama sorguları için bir okuma replikası oluşturun
C) Birden fazla okuma replikası oluşturun ve maliyeti azaltmak için Çoklu-AZ'ı devre dışı bırakın
D) Daha sık manuel anlık görüntüler alın ve ana sunucu arızalarsa onlardan geri yükleyin

**İpucu 1**: İki gereksinim şöyledir: (1) arıza durumunda kullanılabilirlik, (2) okuma yük altında performans. Hangi özellikler hangi gereksinimi ele alır?

**İpucu 2**: Çoklu-AZ otomatik failover sağlar. Yedek sunucu okuma trafiğine hizmet etmez. Bu nedenle Çoklu-AZ tek başına okuma sorununu çözmez.

**İpucu 3**: Okuma replikaları okuma trafiğine hizmet eder. Çoklu-AZ failover sağlar. Her ikisine de ihtiyacınız var.

**Cevap**: B

**Açıklama**: Çoklu-AZ, farklı bir AZ'de yedek sunucuyu otomatik failover'ı sağlar — bu kullanılabilirlik gereksinimiyle ilgilidir. Okuma replikası, raporlama sorgularının ana veritabanını etkilemeden çalışmasına olanak tanır — bu performans gereksinimiyle ilgilidir. Her iki özellik de aynı anda kullanılabilir.

**Neden A?** Çoklu-AZ yedek sunucusu okuma trafiğine hizmet etmez. Sadece failover için tasarlanmıştır. Bunu doğrudan sorgulamaya desteklenmez.

**Neden C?** Okuma replikaları okuma performansına yardımcı olur ancak otomatik failover sağlamaz. Ana sunucu arızalarsa bir okuma replikası yükseltmeniz gerekir — bu zaman alır ve otomatik değildir.

**Neden D?** Manuel anlık görüntüler, veritabanının tam bir kopyasını geri yükler — çok daha uzun bir işlem (büyük veritabanları için saatler) . Bu, "birkaç dakikalık kesinti" gereksinimi karşılamaz.

*SAA-C03 Alan 3 — Görev 3.3*

**Egzersiz 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus, mevcut kendi yönettiği PostgreSQL veritabanlarını (EC2 örneğinde çalışıyor) RDS PostgreSQL'e taşımayı planlıyor. Taşınma, ideal olarak 15 dakikadan az sürede gerçekleşmelidir. Veritabanı 200 GB'tır.

Ne yaklaşımını önerirsiniz? Taşınma sırasında hangi AWS hizmetleri yardımcı olabilir? Kesmeden önce hangi riskleri test ederdiniz?

*(Tek bir doğru cevap yoktur. AWS Database Migration Service, mantıksal replikasyon ve kesmeden önce veri tutarsızlığının riskini düşünün.)*

## Kredi Sonrası Sahne

Gün sonunda, Nimbus, Leo bir yedekleme ve geri yükleme yaklaşımını kullanarak Multi-AZ etkinleştirilmiş RDS PostgreSQL'e taşımıştı. Taşınma çoğu öğleden sonra tamamlanmıştı. Tom, RDS örneğinin maliyetinin EC2 veritabanından iki katı olduğunu gördü.

"Otomatik yedeklemeler?" Maya sordu.

"Biraz daha maliyetli."

"Failover'ı alacağımız da var mı?"

Tom, bunun bir fiyatını belirleyemedi. Bunu bir soru olarak yazdı.

Üç gün sonra, veritabanı sağlıklıydı. Sorgu süreleri biraz azaldı ancak yeterli olmadı. Menü hala yavaş yükleniyordu. Yirmi iki bin öğe. Bir sorgu tüm öğeleri her seferinde geri döndürüyordu.

"Sorun, veritabanı motorunda değil. Sorun, veri modelinde." dedi Priya.

Durdu.

"Bazı bu veriler hiç ilişkisel değil. Menü öğeleri, restoran profilleri, teslimat bölgeleri — bu veriler değişken şekillerde. SQL, bizimle savaşıyor."

Leo zaten bir şeyler araştırıyordu.

"Menü için farklı bir tür veritabanı kullanalım mı?" dedi.

Bir sonraki bölümde: aynı anda milyonlarca insanın sipariş vermesi durumunda bile yavaşlamayan, veritabanı.
