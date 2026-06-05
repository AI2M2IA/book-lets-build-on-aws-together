# Bölüm 5: Bulut Üzerindeki Dolap

Leo, Nimbus’un yüklenen menü fotoğraflarını doğrudan EC2 örneğine depoladığını fark etti.
Müşterilerin yüklediği her fotoğraf — çıtır çıtır arepa, ızgara somon tabağı, kusursuz hazırlanmış salata kasesi — tek bir sanal makinede yer alıyordu.

Ve eğer o makine bir gün yeniden başlatılır, boyutlandırılır veya değiştirilirse ne olur?

Kaybolur.

“Müşteriler şu ana kadar kaç fotoğraf yükledi?” Maya sordu.

Leo konsola baktı. “Yaklaşık sekiz yüz.”

“Ve bu sekiz yüz fotoğrafı sunucu yeniden başlatıldığında ne olur?”

Leo’nun anlamlı bir sessizliği daha.

Bu bölüm, bulutta dosyaların nerede saklanması gerektiğiyle ilgilidir.

**Sunucuda Dosyaları Saklamanın Sorunu**

Dosyaları bir EC2 örneğine — dosya sisteminin içindeki — doğrudan saklamak, bu makinenin yaşam döngüsüyle o dosyaları ilişkilendirir.

Bu, birkaç soruna yol açar:

**Doğası Gereği Geçici.** EC2 örnekleri durdurulabilir, sonlandırılabilir, değiştirilebilir. Yerel diskleri kalıcı olarak tasarlanmamıştır. Geçici bir yazma alanı gibidir.

**Tek Arıza Noktası.** Örnek başarısız olursa dosyalar da onunla birlikte gider. Hiçbir yedekleme yoktur. Bir sabah kötü bir durumda sekiz yüz menü fotoğrafı kaybolur.

**Örneklerden Paylaşılmaz.** Bir ikinci sunucu (7. Bölümde bunu yapacağınız gibi) eklendiğinde, ilk sunucunun diski üzerindeki dosyaları göremez. İki sunucu birbirinden izole edilir. Bir fotoğraf yükleyen bir kullanıcı fotoğrafı görebilir, ancak farklı bir sunucuya çarpan başka bir kullanıcı fotoğrafı göremez.

**Ölçeklenemez.** EC2 disk alanı sınırlıdır. Dolarsa ya yüklemeleri durdurursunuz ya da depolama alanını baskı altında genişletmeye çalışırsınız.

Daha iyi bir model var. AWS bunu 2006 yılında inşa etti ve dünyanın en yaygın kullanılan bulut hizmetlerinden biridir.

**Amazon S3: İnternette Yaşayan Dolap**

**Amazon S3** — Basit Depolama Hizmeti — AWS’nin nesne depolama hizmetidir.

İnternette yaşayan sonsuz bir hard disk gibi düşünebilirsiniz. Tek bir veri merkezinin kaybı, dosyalarınızı kaybetmenize neden olmaz çünkü veriler otomatik olarak birden fazla Erişilebilirlik Bölgesine yedeklenir.

S3’ün temel kavramı **nesnedir**.

Bir nesne herhangi bir dosya olabilir: bir fotoğraf, bir video, bir PDF, bir CSV, bir yedekleme, bir günlük dosyası. S3 dosyanın türü veya yapısıyla ilgilenmez. Sadece baytları depolar ve gerektiğinde geri verir.

Nesneler **torbalarda** yaşar. Bir torba, S3 içindeki bir ana dizindendir — bir nesneyi içeren adlandırılmış bir kaptır. Her torbanın benzersiz bir adı vardır (AWS hesapları arasında paylaşılmayan tüm AWS hesapları için) ve belirli bir Bölgede bulunur.

**S3 Nasıl Çalışır**

Model basit ve bu basitlik önemli.

Bir nesneyi bir torbaya **yükler**siniz. S3 ona bir **anahtar** verir — esasen `menüler/restoran-001/foto-arepa.jpg` gibi bir yol adı. Bu anahtar, torbada nesneyi benzersiz olarak tanımlar.

S3’ü kullanarak nesneyi **indirir** (veya geri getirirsiniz).

S3’ü anahtar ve torba adı kullanarak da yapabilirsiniz.

S3’te nesneleri kamuya açık hale getirebilirsiniz — yani URL’sini bilen herkes bunları indirebilir. Bu, çoğu web sitesinin resimleri sunma şeklidir: resminizi S3’e saklayın, URL’sini halka açık hale getirin ve HTML’nizde bu URL’yi gömün.

Veya nesneleri özel tutabilirsiniz — yalnızca kimlik doğrulanan isteklerle erişilebilenler. Bu, müşteri verileri, yedeklemeler ve hassas olan her şey için doğru modeldir.

S3 bir dosya sistemi değildir. Gerçek klasörleri yoktur. Bir anahtar adındaki "/" sadece bir gelenektir — S3, tüm anahtarı düz bir dize olarak kabul eder. Ancak, çoğu araç bunu klasörler gibi sunar, bu nedenle bu ayrımı uygulamada endişelenmeyin.

**Neden S3, Bir Düzenli Hard Diskten Farklıdır**

Üç şey S3’ü bir EC2 örneğindeki dosya depolamasından temel olarak farklı kılar:

**Dayanıklılık.** AWS, S3 için 99,999,999,99% (on bir dokuz) dayanıklılık tasarlar. Yani on milyon nesne depoluyorsanız, donanım arızası nedeniyle on bin yılda bir nesnenizin kaybolmasını bekleyebilirsiniz. Bu, verilerinizi birden fazla Erişilebilirlik Bölgesine otomatik olarak kopyalayarak elde edilir.

**Erişilebilirlik.** S3, bireysel bileşenlerin başarısız olmasına rağmen erişilebilir olması için tasarlanmıştır. Tek bir sunucuya bağlanmak yerine, başarısızlıkları aşındıran dağıtılmış bir sisteme bağlanırsınız.

**Ölçeklenebilirlik.** S3, sonsuz miktarda veri tutar. Bir torba, trilyonlarca nesneyi barındırabilir. Amazon, anlaşılması zor ölçekte S3’ü kullanarak verileri depolar.

**Sürümleme: Geri Alma Butonu**

Maya’nın S3 konsolunu keşfederken bulduğu bir şey var.

S3, sürümleme özelliğini destekler. Bir torbanın sürümlemeyi etkinleştirdiğinizde, S3, her nesnenin her sürümünü — önceki sürümler ve silinen sürümler dahil — saklar.

Bu, dosyalarınız için bir geri alma butonu gibidir.

Yanlışlıkla eski bir menü fotoğrafını üzerine yazarsınız? Eski sürüm hala orada durur. Bir dosyayı yanlışlıkla siler misiniz? Geri alınabilir. Kötü amaçlı yazılımın tüm dosyalarınızı şifreli çöp ile üzerine yazması durumunda, sürümleme ile saldırıdan önce geri alınır.

“Bu sürümlerin maliyeti ne kadar?” Tom sordu.

You, depolama için her sürüm için ödeme yaparsınız. Büyük dosyaların çok sayıda sürümü varsa, bu birikerek artar. AWS, belirli bir süre sonra eski sürümleri otomatik olarak silen ** yaşam döngüsü politikaları** ile gelir – bu konuları 23. Bölümde maliyet optimizasyonu hakkında derinlemesine bilgi edinirken ele alacağız.

**Erişim Kontrolü: Kamuya Açık mı, Özel mi?**

Varsayılan olarak, S3’teki her şey özeldir. Sadece sizin AWS hesabınız bu verilere erişebilir.

Tek tek nesneleri kamuya açık hale getirebilirsiniz – bu, web sitesi ziyaretçilerine menü resimlerini sunmak için kullanabileceğiniz bir yöntemdir. Ya da her şeyi özel tutabilir ve ** önceden imzalanmış URL’ler** oluşturabilirsiniz: belirli bir nesneye erişimi, AWS kimlik bilgilerine ihtiyaç duymadan sınırlı bir süre için sağlayan bağlantılar. Bir müşterinin faturalarını 24 saat boyunca indirmesine izin vermek için mükemmeldir.

Priya, bu konuda çok güçlü fikirlere sahipti.

“Bir kovuzu tamamen kamuya açık yapıp her nesnenin internetin tamamına erişilebilir olmasını kasıtlı olarak kararlaştırmadığınız sürece asla yapmayın,” dedi. “S3’teki en yaygın güvenlik hatası, hassas verileri içeren bir kovuzu yanlışlıkla açmaktır.”

AWS, hesaba göre “Kamuya Açık Erişimi Engelle” ayarını uygulamanıza olanak tanır, bu da tüm kovutların varsayılan olarak özel olmasını ve per-kovut bazlı olarak açık hale getirilmesini zorlar.

Bunu etkinleştirin. Her zaman.

**S3 Depolama Sınıfları: Tüm Veriler Aynı Şekilde Kullanılmaz**

Tüm veriler aynı şekilde erişilmez.

En popüler menü fotoğraflarınız saniyede onlarca kez alınır. Üç yıl önce oluşturduğunuz günlükleriniz belki yılda bir kez, hatta hiç erişilmez. S3 bunu fark eder ve farklı **depolama sınıfları** ile farklı performans ve maliyet dengeleri sunar.

| Depolama Sınıfı          | Kullanım Alanı                               | Erişim        | Maliyet                        |
|-------------------------|-----------------------------------------------|------------------|-----------------------------|
| S3 Standard             | Sık erişilen veriler                      | Hemen           | GB başına daha yüksek          |
| S3 Standard-IA          | Nadiren erişilir, yine de hızlı erişim gerekir | Hemen           | GB başına daha düşük, erişim ücreti |
| S3 Glacier Instant      | Nadiren erişilen arşivler                    | Hemen           | Çok düşük                    |
| S3 Glacier Flexible     | Çok nadiren erişilen arşivler                | Dakikalar-saatler | Çok düşük                    |
| S3 Glacier Deep Archive | Uyumluluk arşivleri, neredeyse hiç erişilmez | 12 saate kadar   | En düşük                      |

Bu konuları 23. Bölümde derinlemesine ele alacağız. Şimdilik: Bir nesnenin yaşını ve erişim kalıplarına göre otomatik olarak farklı depolama sınıflarına taşınabileceğini bilmek, nadiren kullandığınız veriler için önemli ölçüde para tasarrufu sağlayabilir.

## Güçlü Yönler ve Sınırlamalar

**Neden S3 Mükemmeldir:**

- On bir-dördü dayanıklılık. Verileriniz S3’te neredeyse her sistemden daha güvenlidir.
- Sonsuz ölçeklenebilirlik. Depolama alanını asla sağlamanız gerekmez – sadece büyür.
- Çok uygun maliyetli, sunduğu şeylere göre (GB başına ayda onca kuruş).
- AWS’nin neredeyse her diğer hizmetiyle yerel entegrasyon.
- Statik web sitesi barındırma için destek – bir S3’te tamamen statik bir web sitesini, sunucu gerektirmeden barındırabilirsiniz.

**S3 Nerede Yanlış Bir Seçimdir:**

- S3 bir dosya sistemi değildir. Uygulamanızın bir sürücüye monte etmesi ve dosyaları yerel diskte (okuma, yazma, değiştirme) kullanması gerekiyorsa, S3 doğru araç değildir. Bunun yerine EFS (Elastic File System, 6. Bölüm) veya EBS kullanın.
- S3, yerel bir diske göre daha yüksek bir gecikmeye sahiptir. Veritabanları veya uygulamalar için hızlı, rastgele erişim/yazma IO'ya ihtiyaç duyuyorsanız, blok depolama (EBS, 6. Bölüm) uygundur.
- S3’e büyük veri aktarımları ücretsizdir. Büyük veri aktarımları *çıkar* para karşılığında yapılır. Bu, yaygın bir faturalama sürprizidir – bunu 30. Bölümde ele alacağız.

## Özeti

- **Amazon S3**, dosyaları (nesneleri) adlandırılmış kaplarda (kovutlar) saklayan nesne depolama alanıdır.
- S3, her nesnenin en az üç Erişilebilirlik Bölgesinde kopyalanmasını otomatik olarak sağlayarak on bir-dördü dayanıklılık için tasarlanmıştır.
- EC2 örneklerine depolanmış dosyalar, o örneğin yaşam döngüsüne bağlıdır. Önemli dosyalar S3’te, sunucuda değil olmalıdır.
- **Sürümleme**, nesnelerin önceki sürümlerini korur – geri alma düğmenizdir.
- Varsayılan olarak, S3 özeldir. Hesabınızda “Kamuya Açık Erişimi Engelle”yi etkinleştirin.
- Farklı erişim kalıpları ve maliyetler için S3’te birden fazla **depolama sınıfı** bulunur. Nadiren erişilen sınıflar daha ucuzdur ancak erişim ücretleri alınır.

## Sınav İpuçları

*SAA-C03 Alan 3 – Görev 3.1 (yüksek performanslı depolama çözümleri)*

- **S3, nesne depolama, blok depolama değil.** Bir sınav senaryosunda birden fazla sunucunun bağlayabileceği bir dosya sistemi gerektiğinde, o zaman EFS'dir. Tek bir EC2 örneği için bir disk gerektiğinde, o zaman EBS'dir. Dosyaları, yedeklemeleri, görüntüleri veya HTTP üzerinden erişilen verileri depolamak gerektiğinde, o zaman S3'tür.
- **On Bir Dokuz Dayanıklılık** (Eleven-nines durability) anlamına gelir S3, verileri otomatik olarak birden çok AZ'ye çoğaltır. Bunu yapılandırmanız gerekmez - varsayılan durumdadır.
- **S3 Bölgeseldir**, ancak küresel olarak erişilebilir. Kaplar belirli bir Bölgede bulunur, ancak erişilebilmeleri her yerden mümkündür.
- **Ön Yazılmış URL'ler** (Pre-signed URLs), özel nesnelere sınırlı bir süre erişimini sağlar. Yaygın bir kalıptır: uygulamanız 15 dakika geçerli olan bir ön yazılmış URL oluşturur, bunu kullanıcıya verir, kullanıcı doğrudan S3'ten dosyayı indirir.
- **S3 Standart-IA** (S3 Standard-IA) minimum depolama süresi ücretini (30 gün) içerir. Verilerinizi hızla silmeyi planladığınız veriler için kullanmayın. Sınav, depolama sınıfları arasındaki ödünleşimleri test eder.
- **Depolama Sınıfı Karar Ağacı**: *Sık Erişimli* → S3 Standart; *Hızlı Erişimli ancak hızlı geri çağırma gerektiren* → S3 Standart-IA; *Nadiren Erişimli Arşiv* → S3 Glacier Instant Retrieval; *Neredeyse Hiç Erişimli Arşiv* → S3 Glacier Flexible Retrieval; *Uyumluluk Arşivi, Neredeyse Hiç Erişimli Değil* → S3 Glacier Deep Archive. Bir senaryo "maliyet optimizasyonu" ve "nadiren erişim" ifadesini içerdiğinde, Standart-IA genellikle cevaptır. "Uyumluluk" veya "yedi yıllık tutma süresi" ifadesini içeren bir senaryo söz konusu olduğunda, Glacier Deep Archive'i düşünün.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Kendi kelimelerinizde: S3 nesnesi nedir? S3 kovuğu nedir? Dosyaları S3'te depolamak, onları bir EC2 örneğinin yerel diskinizde depolamaktan daha iyi neden daha iyidir?

*(İpucu: Bir EC2 örneği sonlandırıldığında dosyalar ne olur? S3 bunu nasıl yapar?)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir medya şirketi belgesel videoları üretir. Orijinal 4K görüntülerini (üretim sırasında sık erişilen), düzenlenmiş son kesimleri (dağıtım için aylık erişilen) ve uyumluluk amaçları için en fazla yılda bir kez erişilen masterleri depolamalıdırlar. Her katman için depolama maliyetlerini en aza indirmek istiyorlar ve erişim gereksinimlerini karşılacaklar.

Hangi depolama stratejisi ihtiyaçlarını en iyi şekilde karşılar?

A) Tüm içeriği tutarlı performans ve basitlik için S3 Standart'ta saklayın.
B) Orijinal görüntüleri S3 Standart'ta, son kesimleri S3 Standart-IA'da ve arşivleri S3 Glacier Deep Archive'de saklayın.
C) En hızlı erişim için tüm içeriği EC2 örneği depolama alanına saklayın.
D) Tüm içeriği en düşük olası depolama maliyetini sağlamak için S3 Glacier Deep Archive'de saklayın.

**İpucu 1**: Farklı dosyaların farklı erişim desenleri vardır. S3, farklı erişim sıklıklarına göre farklı depolama sınıfları sunar. Hangi sınıf "sık erişilen" için uygundur?

**İpucu 2**: Yıllık en fazla bir kez erişilen arşivler, anında geri çağırmaya ihtiyaç duymaz. En düşük maliyetli depolama için tasarlanmış hangi depolama sınıfıdır?

**İpucu 3**: Her katmanın erişim sıklığını uygun depolama sınıfıyla eşleştirin. Sık erişilen = Standart. Aylık = Standart-IA. Yıllık = Glacier Deep Archive.

**Cevap**: B

**Açıklama**: Bu strateji, her veri katmanını uygun S3 depolama sınıfıyla doğru şekilde eşleştirir. Sık erişilen orijinal görüntü, anında erişim için Standart'ta kalır ve geri çağırma ücreti ödenmez. Aylık erişilen son kesimler, daha düşük depolama maliyetli ve uygun geri çağırma ücretli Standart-IA'ya gider. Yıllık olarak en fazla bir kez erişilen arşivler, en düşük olası depolama maliyetini sağlamak için Glacier Deep Archive'e gider.

**A'nın neden yanlış?** Her şeyi Standart'ta saklamak basit olmasına rağmen pahalıdır. Nadiren erişilen arşiv içeriği için yüksek fiyatlı fiyatlandırmayı ödersiniz.

**C'nin neden yanlış?** EC2 örneği depolama, geçicidir ve uzun süreli medya depolama için uygun değildir. Bir örnek sonlandırılırsa, tüm içerik kaybolur.

**D'nin neden yanlış?** Glacier Deep Archive'in geri çağırma süreleri 12 saate kadar olabilir. Sık erişilen üretim görüntülerini orada tutmak, üretim çalışmalarını imkansız hale getirirdi.

*SAA-C03 Alan 3 — Görev 3.1 / Alan 4 — Görev 4.1*

**Uygulama 3 — Mimari Ziyaret** *(İsteğe Bağlı)*

Nimbus, müşteri yüklediği sipariş fotoğraflarını S3'te saklar. Bir veri koruma düzenlemesi, müşteri fotoğraflarının 7 yıl boyunca saklanmasını gerektirir ancak bu süre sonra silinebilir. Ekip, eski fotoğrafların maliyetini en aza indirmek istiyor.

Bu gereksinimi karşılayan bir S3 depolama stratejisi tasarlayın. Hangi depolama sınıflarını kullanırdınız ve aralarındaki geçişleri ne zaman yapardınız? Silme gereksinimini nasıl ele geçirirdiniz?

*(İpucu: Yaşam Döngüsü Politikaları düşünün. Tek bir doğru cevap yoktur - maliyet ile geri çağırma süresi arasındaki ödünleşimleri düşünün.)*

## Krediler Sonunda

Leo, öğleden sonra menü fotoğraflarını S3'e taşıdı, üç Erişilebilirlik Bölgesinde güvenli bir şekilde depolanmış 800 nesne, sürümleme etkinleştirildi.

"Aslında, önce yapmamız gereken şey buymuş," dedi, bir miktar memnuniyetle.

"Onlar her zaman S3'te daha güvenliydi," Priya dedi. "Sadece sorunu çözene kadar bekledik."

Leo bununla anlaştı.

Ertesi sabah, Tom bir çıktı ile geldi. Kırmızı kalemle not edilmiş AWS faturası.

"Bir veri tabanı sorunumuz var," dedi. "Sipariş veri tabanımızı web sunucusuyla aynı EC2 örneğinde çalıştırıyoruz. Menü veri tabanımız ve müşteri kayıtlarımız da dahil."

Duraksadı.

"Her şey aynı makinede. Tek bir makine. Tüm verilerimiz."

Maya çıktıyı inceledi. Sonra Tom'a baktı. Sonra tavana.

"Ve o makine arızalanırsa?"

Tom, kırmızı kalem notuna işaret etti.

Bir sonraki bölüm: kiraya kiraladığınız bir sabit diskin ve ofisinizin tamamının paylaştığı bir dosya dolabının farkı.
