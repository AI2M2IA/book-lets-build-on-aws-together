# Bölüm 6: Sana Takip Eden Disk

Tom, kırmızı bir kalem ve Leo'yu tedirgin eden bir alışkanlığa sahipti.

Her Cumartesi sabahı, Tom AWS konsol özetini yazdırır, çalışan örnekleri, depolama hacimlerini, takılı diskleri ve bunları satır satır incelerdi. Bunu iki hafta önce başlamıştı. Bunu "defter" olarak adlandırıyordu. Leo ise bunu "Tom'un Leo'yu yanlış hissettiren şey" olarak adlandırıyordu.

O Cumartesi günü, Tom bir şeyleri işaretledi ve çıktıyı Maya'nın masasına kelime etmeden bıraktı.

Maya Pazartesi sabahı buldu. Bir işaretleme. Bir not, üç kelime:

*Her şey. Bir makine.*

Web sunucusu. Veritabanı. Tüm müşteri kayıtları. İki ayınlık sipariş geçmişi. Hepsi tek bir EC2 örneği üzerinde çalışıyordu.

“Veritabanı, örnek çökerse ne olur?” Maya, elinde çıktıyı sorarak sordu.

“O da çöker,” dedi Leo.

“Ve veri?”

“Verinin nasıl saklandığına bağlı.”

O “bağımlı” sorun buydu.

**EC2 Örnekleri Veri Nasıl Saklar**

Bir EC2 örneği çalıştırıldığında, işletim sistemi bir diskin üzerinde yaşar. Bu disk
**kök hacmi** olarak adlandırılır. Varsayılan olarak, bu bir **EBS hacmi**dir — hatta düşünmediğiniz zaman bile.

Ama bir şey daha var: EC2 örnekleri aynı zamanda **örnek depolama** alanına da sahiptir.

Örnek depolama, sanal makinenizin altında çalışan donanım tarafından fiziksel olarak takılan geçici depolama alanıdır. Çok hızlıdır — AWS'deki diğer depolama seçeneklerinden çoğundan daha hızlıdır. Ancak bir takası vardır.

Örnek depolama **geçicidir**.

Örnek durur veya sonlandırılırsa, örnek depolama verisi kaybolur. Kalıcı olarak.
Yeniden kurtarılamaz. AWS bunu çok yüksek sesle uyarmaz, bu da ekiplerin fark etmesine neden olur: veri kaybettiğinde.

Örnek depolama, önbellekler, geçici işleme dosyaları ve çizim alanı için uygundur. Önemli gördüğünüz veriler için değildir.

**EBS: Kalıcı Disk**

**Amazon EBS** — Elastik Blok Depolama — EC2 örnekleri için kalıcı blok depolamasıdır.

Blok depolaması, gerçek bir sabit sürücü gibi davranır: işletim sistemi üzerinde dosyalar oluşturabilir, rastgele konumdaki herhangi bir baytı okuyabilir ve yazabilir, veritabanlarını üzerinde çalıştırabilir ve takılı bir disk gibi davranabilir.

Temel özellikleri:

**Kalıcı.** Örnek depolama gibi, EBS hacimleri örneklerin durdurulması, başlatılması ve hatta sonlandırılması durumunda hayatta kalır (konfigürasyona bağlı olarak). Bir örnek kullanmadığı zaman bile hacim üzerindeki veri kalır.

**Takılabilir ve sökülebilir.** Bir EBS hacmi bir örnekten sökülüp başka bir örneğe takılabilir. Verileri aktarmak veya başarısız bir örnekten kurtulmak için, hacmi söküp başka bir yere takabilirsiniz.

**Tek takılma (çoğunlukla).** Varsayılan olarak, bir EBS hacmi aynı anda yalnızca bir EC2 örneğine takılır. Bir örnek birden fazla EBS hacmine sahip olabilir, ancak tek bir EBS hacmi aynı anda birden fazla örnek tarafından monte edilemez (yalnızca bir istisna vardır: EBS Çoklu Takma, bu da sınırlı kullanım durumlarına ve önemli kısıtlamalara sahiptir).

Analoji: EBS, dizüstü bilgisayarınıza takabileceğiniz bir harici sabit sürücü gibidir. (EC2 örneği) Laptop, hacmi okuyabilir ve yazabilir. Bittiğinde, onu çıkarıp başka bir dizüstü bilgisayara takabilirsiniz.

**EBS Hacmi Türleri**

Tüm EBS hacimleri aynı değildir. AWS, farklı performans ve maliyet profilleri sunan çeşitli türler sunar.

**gp3 (Genel Amaçlı SSD)**: Çoğu iş yükü için varsayılan seçimdir. İyi bir performans ve fiyat dengesi vardır. Başlatma hacimleri, küçük veritabanları ve geliştirme ortamları için uygundur.

**io2 (Yönlendirilen IOPS SSD)**: Yüksek performanslı bir seçenektir ve IOPS (saniye başına giriş/çıkış işlemleri) için ne kadar ihtiyacınız olduğunu belirtirsiniz ve AWS o performansı garanti eder. Büyük üretim veritabanları için uygundur.

**st1 (Trafik Odaklı HDD)**: Büyük sıralı okumalar ve yazmalar için optimize edilmiş manyetik depolama. SSD'lere göre daha ucuzdur, ancak rastgele IO için daha yavaştır. Veri depolama ve günlük işleme için iyidir.

**sc1 (Soğuk HDD)**: En ucuz EBS seçeneğidir. Nadiren erişilen veriler için. Zaman hassas herhangi bir şey için uygun değildir.

Sınav, tüm türleri ezberlemenizi gerektirmez. Bunun yerine, gereksinimleri doğru türle eşleştirme becerinizi test eder: IOPS gereksinimleri → io2. Maliyet duyarlı sıralı iş yükleri → st1. Genel web uygulamaları → gp3.

**EBS Snapshot'ları: Yedekleme**

Şirketlerin düzenli olarak yaptığı bir şey.

Bir **EBS snapshot**'ı, S3'te depolanan (ancak EBS arayüzünden değil, doğrudan S3'ten erişilmez) bir EBS hacmi için zaman damgası yedeklemesidir. Snapshot'lar artımlıdır: İlk snapshot tam hacmi yakalar; sonraki snapshotler son snapshot'tan beri değişen ne kadar olursa olsun depolama yapar.

Bir snapshot'tan yeni bir EBS hacmi oluşturabilirsiniz — bir veritabanı bozulması, kötü bir dağıtım veya yanlışlıkla silinme öncesine geri dönerek kurtarma.

Snapshot'ları otomatikleştirmeniz gerekir. AWS bunu için **Amazon Veri Yaşam Döngüsü Yöneticisi**'ni sağlar: Bir snapshot her 6 saatte alın, son 7 gün sakla, ve bunu otomatik olarak çalıştırır.

Priya, bu sistemin bu şekilde kurulmuş olduğunu hatta veritabanının üretim ortamına geçmeden önce de kurulduğunu görmüştü.

Leo, bunu düşünmemişti.

**EFS: Paylaşımlı Dosya Dolabı**

EBS, tek bir örneğe bağlı bir disktir. Aynı dosyaları eş zamanlı olarak ihtiyaç duyan birden fazla örneğin olması durumunda ne olur?

Giriş **Amazon EFS** – Esnek Dosya Sistemi.

EFS, yönetilen bir ağ dosya sistemidir. Aynı EFS dosya sistemini aynı anda monte edip birden fazla EC2 örneği okuyabilir ve paylaşılan dosyalara yazabilir. Bu, EBS tarafından sağlanmayan temel bir özelliktir.

Bunu şöyle düşünebilirsiniz:

EBS, tek bir dizüstü bilgisayarın içine takılmış bir harici bir hard disk gibidir. O dizüstü bilgisayarın yalnızca tek birinde kullanılabileceği zamandır.

EFS, ofis içindeki bir dolap gibidir. Her ekip üyesi bir çekmecenin önüne geçebilir, bir dosya okuyabilir, bir şey geri koyabilir. Aynı depolama alanına eş zamanlı olarak erişen birden fazla kişi.

**Ne Zaman EFS'ye İhtiyacınız Var?**

- Birden fazla EC2 örneğinin dosyalara erişmesi gerektiğinde – içerik yönetim sistemleri, paylaşılan yapılandırma dosyaları, paylaşılan medya kütüphaneleri
- Tüm örneklerin aynı verilere erişmesi gereken yatay olarak ölçeklenmiş bir uygulamada
- Bir örneğin arızalarından sonra bile sağlayan kalıcı bir dosya sistemi gerektiğinde

**EFS vs. S3:** EFS, bir dosya sistemi (dizinler, dosyalar, izinler, kilitleme). S3, nesne depolamasıdır (yükleme, indirme, dosya sistemi semantiği yoktur). EFS, S3'ten çok daha pahalıdır. Tam olarak depolanıp alınmayan dosyalara kullanın. Uygulamalar tarafından standart dosya sistemi işlemlerinden okunan ve yazılan dosyalara EFS kullanın.

**Doğru Depolama Seçimini Yapmak**

Şimdi, AWS'de üç tür depolama türünü görmüşsünüzdür. Karar vermeyi netleştirelim.

| İhtiyaç                                  | Depolama Türü       |
|---------------------------------------|------------------|
| Veritabanı için hızlı, kalıcı disk     | EBS (gp3 veya io2) |
| Birden fazla sunucu için paylaşımlı dosyalar | EFS              |
| Dosyalar, yedeklemeler, görüntüler, büyük nesneler | S3               |
| Geçici hesaplama scratch alanı        | Instance Store   |
| Minimum maliyetle uzun süreli arşivler | S3 Glacier       |

Bu kararı doğru yapmak önemlidir. S3'ü EFS'ye ihtiyacınız olduğunda kullanmak operasyonel karmaşıklığı artırır. EBS'yi EFS'ye ihtiyacınız olduğunda kullanmak, ölçekleme yaparken arızalara neden olur. Instance store'u kalıcılık istediğinizde kullanmak, verilerinizi kaybeder.

Priya bu tabloyu duvara astı ve bir kopyasını da aldı.

"Depolama ihtiyacımızı her seferinde eklediğimizde," dedi, "buradan başlıyoruz."

## Güçlü Yönler ve Sınırlamalar

**EBS Güçlü Yönleri:**

- EC2 için hızlı, kalıcı blok depolama
- Noktadan noktaya yedekleme ve kurtarma için anlık görüntüler
- Farklı iş yükleri için birden fazla performans düzeyi
- Doğrudan desteklenen şifreleme

**EBS Sınırlamaları:**

- Tek bir örneğe bağlıdır (birkaç istisna dışında)
- EC2 örneği aynı bölgede (başka bir bölgeye kopyalamak için bir anlık görüntü oluşturmanız gerekir)
- Kullanılan depolama miktarını değil, tahsis edilen depolama için ödeme yaparsınız

**EFS Güçlü Yönleri:**

- Çoklu örnek için paylaşımlı dosya sistemi – yerel NFS protokolü
- Kapasiteyi önceden tahsis etmenize gerek kalmadan otomatik olarak ölçeklenir
- Bölge içinde birden fazla AZ'de erişilebilir

**EFS Sınırlamaları:**

- S3'ten GB başına daha pahalıdır
- Rastgele I/O için EBS'den daha yüksek gecikme süresi
- Tüm Bölgelerde mevcut değildir

## Özet

- **Instance store** geçici, ana makineye fiziksel olarak bağlı hızlı depolamadır. Veri, örnek durduğunda veya sonlandırıldığında kaybolur. Sadece scratch alanı için.
- **EBS** (Esnek Blok Depolama) tek bir EC2 örneği için kalıcı blok depolamasıdır. Örnekler durduğunda veri korunur. Farklı türler için (gp3 genel kullanım için, io2 yüksek IOPS gereksinimleri için) uygun bir hacim türü seçin.
- **EFS** (Esnek Dosya Sistemi) aynı anda birden fazla örneğin monte edebileceği paylaşımlı bir ağ dosya sistemidir. Birden fazla sunucunun aynı dosyalara erişmesi gerektiğinde kullanın.
- Depolama türünü ihtiyaca göre eşleştirin: veritabanı → EBS; paylaşımlı dosyalar → EFS; nesneler/yedeklemeler → S3; arşivler → S3 Glacier.

## Sınav İpuçları

*SAA-C03 Alan 3 — Görev 3.1 (depolama çözümleri)*

- **EBS hacimleri bir AZ'de yaşar.** Bir örneğin aynı AZ'de bulunan bir örneğe bağlanabilir. Farklı bir AZ'de bir EBS hacmini kullanmak için bir anlık görüntü oluşturun ve hedef bölgede geri yükleyin.
- **EBS anlık görüntüleri artımlıdır ve S3'te saklanır.** İlk anlık görüntü tamdır; sonraki anlık görüntüler yalnızca değişiklikleri depolar. Bölge çapında felaket kurtarma için anlık görüntüleri kopyalayabilirsiniz.
- **EFS çoklu AZ'dedir.** Aynı bölgedeki farklı AZ'lerde bulunan birden fazla örnek, aynı EFS dosya sistemini monte edebilir. Bu, EBS'den temel bir farklılıktır.
- Bir sınav senaryosunda "paylaşımlı içerikli bir web uygulaması" veya "aynı dosyalara erişen birden fazla örnek" ifadesi varsa, EFS'yi düşünün. "Sunucu depolama" veya "tek bir sunucu için kalıcı disk" ifadesi varsa, EBS'yi düşünün.
- Instance store verisi bir yeniden başlatmada dayanır, ancak bir durdurma veya sonlandırmada hayatta kalmaz. Bir soru, verilerin "örnek durdurulduğunda kaybolduğunu" tanımlarsa, instance store'un devreye girdiği anlamına gelir.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizde: EBS ve EFS arasındaki fark nedir? Hangi durumda birini diğerine tercih edersiniz?

*(İpucu: Bir örnekleme veya birden fazla örnekleme ihtiyacı olan depoya aynı anda erişebilir mi diye düşünün.)*

**Egzersiz 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, yük dengeleyici arkasındaki dört EC2 örneği üzerinden bir web uygulaması çalıştırıyor. Kullanıcılar profil fotoğraflarını yükleyebiliyor. Bu dört örneklemenin hepsi, yüklenmesinin hangi örnekleme tarafından gerçekleştirilmiş olsa bile, yüklenmeden hemen sonra herhangi bir kullanıcının fotoğrafını sunabilmeli. Takım, sürekli ve paylaşımlı dosya depolama gerektiriyor.

Hangi depolama çözümü onların gereksinimlerini en iyi şekilde karşılıyor?

A) Her EC2 örneğine bir gp3 EBS hacmini bağlayın ve dosyaları bir cron işi kullanarak senkronize edin.
B) Fotoğrafları doğrudan EC2 örneğinin örnekleme depolama alanına saklayın.
C) Amazon EFS'yi tüm dört EC2 örneğine eş zamanlı olarak monte edin.
D) Fotoğrafları S3'e saklayın ve uygulamadaki koddan doğrudan erişin.

**İpucu 1**: Gereksinim "dört örneklemenin hepsi herhangi bir fotoğrafı sunmalı". Dosyanın tüm örneklemelere anında görünür olması için hangi seçenekler mevcuttur?

**İpucu 2**: Örnekleme depolama alanı geçicidir. EBS, aynı anda birden fazla örneklemeye monte edilemez. Bu, seçenekleri daraltır.

**İpucu 3**: Hem C hem de D teorik olarak işe yarayabilir. Uygulamanın dosyalara dosya sistemi operatörleri (örneğin, bir CMS) kullanarak ve HTTP istekleri aracılığıyla fotoğraf erişimi gerektirdiği bir durumda, hangisi daha uygundur?

**Cevap**: D

**Açıklama**: Fotoğrafları S3'e saklamak ve URL'ler aracılığıyla hizmet vermek, web uygulaması için mimarolojik olarak doğru seçimdir. Yüklenen fotoğraflar, S3 URL'si aracılığıyla herhangi bir sunucudan (ve herhangi bir tarayıcıdan) anında erişilebilir. S3, kullanıcı yüklenen dosyaları ölçekte yüksek kullanılabilirlik ve yönetim yükü olmadan saklamak için tasarlanmıştır.

Not: C (EFS), uygulamanın dosya sistemi semantiği (örneğin, yerinde dosyaları değiştiren bir CMS) gerektirdiği takdirde teknik olarak işe yarar. Ancak, web üzerinden hizmet verilen kullanıcı yüklenen ikili dosyalar için S3, daha ucuz, daha ölçeklenebilir ve uygulamayı bir ara olarak çalıştırmadan doğrudan HTTP üzerinden dosyaları sunarak daha uygundur.

**Neden A?** Cron işi kullanarak dosyaları senkronize etmek, yarış koşulları ve tutarsızlık sorunları yaratır. Yüklemeler ve bir sonraki senkronizasyon arasında dosyalar diğer örneklemelerde eksik olurdu.

**Neden B?** Örnekleme depolama alanı, örnekleme durdurulduğunda veya sonlandırıldığında veri kaybolduğunda kaybolur. Fotoğraflar kaybolurdu.

**Neden C?** EFS, uygulamanın dosya sistemi semantiği (örneğin, bir CMS) gerektirdiği takdirde doğru cevaptır. Ancak, web üzerinden hizmet verilen kullanıcı yüklenen fotoğraflar için S3, daha basit, daha ucuz ve daha uygundur.

*SAA-C03 Alan 3 — Görev 3.1*

**Egzersiz 3 — Mimari Zorluk** *(İsteğe bağlı)*

Nimbus, yeni bir özellik ekliyor: restoran sahipleri, menülerini yükleyebilir ve bunlar daha sonra işlenir ve veritabanına nüfuz eder. PDF işleme görevi, aşağıdaki adımları gerçekleştirmek için EC2 örneklerinden oluşan bir filo üzerinde çalışır: (a) yüklenen PDF'yi okuyun, (b) geçici işleme dosyalarını yazın, (c) ayrıştırılmış çıktıyı yazın.

Bu üç adım için hangi depolama hizmetlerini kullanırdınız ve neden?

*(Tek bir doğru cevap yoktur. Depolama türünü her adımın özelliklerine uyacak şekilde eşleştirmeye odaklanın.)*

**Ekran Sonrası Sahne**

Nimbus, depolamayı düzgün bir şekilde ayırdı. Veritabanı, otomatik önbellekleme ile bir EBS hacmi ile geldi. Menü fotoğrafları S3'e taşındı. EC2 örneği sonunda nefes alabilirdi.

Leo, bir yük testi çalıştırdı. Site, iki yüz eşzamanlı kullanıcıyı bozmadan başardı.

Tom, fatura ile ilgilendi. EBS hacmi aylık 8 dolar ekliyordu. Bunu not etti.

"Bu faturaa şeyler ekliyorum," dedi. "Dengeleme ne zaman gerçekleşir?"

"Kesintiler durduğunda," dedi Maya. "Her kesinti, önleme maliyetinden daha pahalıdır."

Tom ikna olmuş gibi görünmedi. Zamanla olacak.

Üç gün sonra, platformda bir restoran sahibi sipariş vermeye çalıştı ve bir hata aldı. Maya, günlükleri kontrol etti.

Veritabanı mevcuttu. Uygulama çalışıyordu. Ancak yirmi eşzamanlı kullanıcı hepsi aynı anda menüyü okumaya çalışıyor ve her biri veritabanına erişiyor ve her bir istek bir veritabanı sorgusuna karşılık geliyor.

"Her sayfa yüklemesi bir veritabanı sorgusudur," dedi Leo. "Her biri tek tek."

Priya zaten bir şeyler arıyordu.

Bir sonraki bölümde, daha fazla müşteri sunucu tarafından işlenemeyecek kadar çok sayıda gelirse ne olur?
