# Bölüm 27: İhtiyacınız Olanı Ödeme

Tom, fatura sekmesini açmadan önce kahve yaptı. Hep böyle yapardı — bazı raporlara sıcak bir şeyle yaklaşmak daha iyiydi. Pencerenin yanındaki koltuğa yerleşti, elinde kupa, dışarıda Cumartesi sabahı hâlâ sessizdi. Bildirim yok, ayaküstü toplantı yok. Sadece tablo ve sayılar.

Sekmeyi açtı.

**Özet: Athena’nın İçgörüsünden Faturaya**

Önceki bölümdeki Athena analitiği beklenmedik bir şey yapmıştı: Tom, maliyet ve kullanım raporlarını doğrudan S3’ten sorgulayarak sonunda yalnızca toplam bir AWS faturasını değil, her bir hizmetin gerçekte ne kadara mal olduğunun, altı ay boyunca hafta hafta dökümünü görebiliyordu. Ortaya çıkan tablo endişe verici ölçüde netti. EC2 en büyük tek kalemdi ve örüntü yanlış anlaşılamayacak kadar açıktı — ekip, tam zamanlı yaşadıkları bir otel için kapıdan girip ödenen fiyatları ödüyordu. Bu farkındalık, Tom’u bir Cumartesi sabahı, taze bir kupa kahveyle ve bir sonraki aylık fatura gelmeden önce her seçeneği anlama kararlılığıyla EC2 fiyatlandırma sayfasına yöneltti.

Tom, Nimbus’un başlamasından beri her ay AWS faturasını gözden geçiriyordu. İlk yıl boyunca, gördüğü şeyin yaklaşık %60’ını anlıyordu. Şimdi ise neredeyse her şeyi anlıyordu — EC2 bölümü neden hep fazla ödeme yapıyormuş gibi hissettiriyor, onun dışında. EC2 bölümü, hepsi saat başına fiyatlandırılan, hepsi toplamda aylık 2.340 dolar eden, çeşitli instance türlerindeki “On-Demand instance’ların” bir karışımıydı.

Birini aramadan önce, instance listesini tek başına gözden geçirerek bir saat harcadı — bir sonuca varmak için değil, test edebileceği varsayımlar oluşturmak için.

“api-prod” etiketli dört r6g.large instance gördü. Arka plan iş işleyicilerini çalıştıran iki c6g.medium instance gördü. Şirketin varlığının üçüncü ayından beri çalışan, “vpn-server” etiketli bir t3.medium gördü. Her gece saat 03.00’te ortaya çıkıp 07.00’den önce kaybolan, “analytics-batch” etiketli bir çift instance gördü.

Bir sütun varsayım yazdı:

- API sunucuları: tahmin edilebilir, her zaman çalışıyor.
- Arka plan işleyicileri: muhtemelen tahmin edilebilir.
- VPN sunucusu: her zaman çalışıyor, hiç değişmiyor.
- Toplu analitik: belki Spot’a uygun?

Sonra kenara şunu yazdı: *bir şeye karar vermeden önce her birini doğrula.*

Bu disiplin — “varsaydığım” ile “bildiğim” şeyi ayırma disiplini — Tom’un maliyet incelemelerini yararlı kılan şeydi. Diğerlerini aradı.

“Kapıdan giriş oranını ödemeye devam edebiliriz,” dedi Tom, diğerleri görüşmeye katıldığında. “Ama etmeyeceğiz.”

“Kapıdan giriş oranı mı?” diye sordu Leo.

“On-Demand fiyatlandırma,” dedi Tom. “İhtiyaç duyduğunuz sabah otel odası rezervasyonu yapmak gibi. Maksimum esneklik. Maksimum fiyat.”

“Peki alternatif ne?”

**Otel Benzetmesi**

Tom bir an düşündü. “Bazı insanların vardıkları sabah otel odası ayırttığını biliyorsun, değil mi? Şu anda biz öyleyiz. Daha iyi stratejiler var — altı ay önceden rezervasyon yapıp indirim al, son dakikada satılmamış bir odayı uygun bir fiyata kap, ya da bütün kata ihtiyacın varsa bütün katı kirala. Aynı otel, dört farklı fiyat.”

Leo ona baktı. “Peki bunların AWS karşılıkları ne?”

Tom EC2 fiyatlandırma sayfasını açtı. “Dört fiyatlandırma modeli var. Ve biz sadece birini kullanıyoruz.”

EC2 fiyatlandırması, otel oda rezervasyon stratejilerine şaşırtıcı derecede iyi uyuyor:

**On-Demand**: Rezervasyon yapmadan resepsiyona gidersiniz. Tam liste fiyatını ödersiniz ama istediğiniz zaman çıkış yapabilirsiniz. Tahmin edilemeyen konaklamalar için mükemmeldir.

**Rezervasyonlu Instance’lar/Tasarruf Planları**: Tüm yıl için önceden bir oda rezervasyonu yaparsınız. Kullanmaya taahhüt etmeniz karşılığında önemli bir indirim alırsınız — %30-72 arası.

**Spot Instance’lar**: Otelin yoğun indirimli güncel fiyatından satılmamış bir oda kaparsınız — pazarlık yok, otel ne kadar boş olduğuna göre fiyatı belirler. %90’a kadar indirim. Ama tam fiyatlı bir müşteri için odaya ihtiyaçları olursa otel iki dakika önceden haber vererek sizden çıkmanızı isteyebilir. (Yıllar önce Spot kapasitesi için *teklif* vermeniz gerekirdi; AWS teklif vermeyi 2017’de kaldırdı — artık sadece güncel Spot fiyatını ödüyorsunuz.)

**Özel Host’lar (Dedicated Hosts)**: Otelin tüm katını yalnızca kendiniz için kiralarsınız. Başka misafirlerle paylaşım yok. Önemli ölçüde daha pahalı. Yazılım lisanslama veya uyumluluk kuralları fiziksel bir host’un paylaşılmasını yasakladığında gereklidir.

Her modelin bir kullanım durumu var. Nimbus’un yaptığı hata: 7/24 çalışan ve tamamen tahmin edilebilir iş yükleri dahil her şey için On-Demand kullanmaktı.

**On-Demand Instance’lar: Maksimum Esneklik, Maksimum Maliyet**

**Ne zaman kullanılmalı**:

- Tahmin edilemeyen iş yükleri (öngöremediğiniz trafik zirveleri)
- Geliştirme ve test (sık sık başlatıp durdurma)
- Kısa vadeli iş yükleri (bir hafta için bir deney çalıştırma)
- İlk dağıtım (kullanım örüntülerinizi anlamadan önce)

**Ne zaman kullanılmamalı**:

- Bir yıldan uzun çalışacağını bildiğiniz, sabit durumlu üretim iş yükleri
- Tahmin edilebilir bir temel yükü olan herhangi bir şey

**EC2 Hibernation: Durumu Kaybetmeden Duraklatma**

Yeterince dikkat çekmeyen bir maliyet optimizasyonu tekniği **EC2 Hibernation**’dır. Normal bir instance’ı durdurduğunuzda, RAM içeriği yok olur — bir sonraki başlatma soğuk bir başlangıçtır. İşletim sistemi açılır, uygulama başlatılır, veritabanı bağlantıları yeniden kurulur. Çoğu üretim web sunucusu için bu sorun değildir. Belirli iş yükleri için ise pahalıdır.

Bir instance’ı hazırda beklettiğinizde (hibernate), kapanmadan önce RAM içeriği EBS kök birimine kaydedilir. Bir sonraki başlatmada, instance tam olarak kaldığı yerden devam eder — süreçler çalışıyor, bağlantılar kurulmuş, uygulama durumu bozulmamış — soğuk bir başlangıcın alacağı sürenin çok küçük bir kısmında. Özellikle, durumu kaybetmeden gece boyunca duraklatmak istediğiniz uzun süreli analiz işleri veya açılması ve ortamını yapılandırması birkaç dakika süren geliştirme instance’ları için yararlıdır.

“Bir veri bilimi instance’ım var,” dedi Leo, çıktıya bakarak. “Açılması dokuz dakika sürüyor. Özel ortam, bir düzine Python paketi, önceden yüklenmiş bazı model ağırlıkları. Her gece durduruyorum ve her sabah yeniden başlatıyorum.”

“Yani her gün dokuz dakikanı onun açılmasını izleyerek geçiriyorsun,” dedi Tom.

“Evet.”

“Bu, haftada 45 dakika mühendislik zamanı, bir EC2 instance’ını beklemek için harcanıyor.”

“Evet.”

“Hazırda beklet.”

Hibernation ile Leo’nun instance’ı günün sonunda duraklatıldı, RAM’ini EBS kök birimine kaydetti ve ertesi sabah 90 saniyeden kısa sürede devam etti. Analiz oturumları tam olarak bıraktığı yerden devam etti.

Hibernation gereksinimleri: hibernation **başlatma sırasında etkinleştirilmeli** — zaten çalışan bir instance için açamazsınız (Leo, hibernation’ı elde etmek için veri bilimi kutusunu bir AMI’den yeniden başlatmak zorunda kaldı). Instance’ların RAM’i en fazla 150 GB olmalı (RAM içeriği EBS kök birimine sığmalı), kök birim hem işletim sistemini hem de RAM dökümünü tutacak kadar büyük olmalı ve kök birim şifrelenmiş olmalı (hibernation, bellekteki hassas verileri diske kaydeder). Bare-metal instance’lar ve 150 GB’tan fazla RAM’e sahip instance’lar hibernation’ı desteklemez. Bir sınır daha: bir instance en fazla **60 gün** hazırda bekleyebilir — bundan sonra başlatılmalı, durdurulmalı veya sonlandırılmalıdır; sonsuza dek uyuyamaz.

Tom, Nimbus’un On-Demand instance’larını belirledi:

- Web API sunucuları: 4 EC2 instance’ı, 18 aydır 7/24 çalışıyor. *Tahmin edilebilir temel yük.*
- VPN sunucusu: Her zaman çalışıyor. *Tahmin edilebilir temel yük.*
- Trafik zirveleri için ek API sunucuları: Tahmin edilemez. *On-Demand burada doğru.*

“Dur — ama zirve sunucuları *neden* On-Demand kalsın ki?” diye sordu Maya. “Her Cuma zirve yaşıyorsak, bu taahhüt etmeye yetecek kadar tahmin edilebilir değil mi?”

Tom düşündü. “Temel yük tahmin edilebilir. Zirve, zamanlama açısından tahmin edilebilir ama büyüklük açısından değil. Bazı Cuma geceleri normalin %30 üstünde; bazıları %150 üstünde. Altı instance için Rezervasyonlu kapasite alırsam ve bir zirve sadece iki ekstra gerektirirse, fazla taahhüt etmiş olurum. İki için alırsam ve zirve sekiz gerektirirse, eksik kalırım ve taşan kısım yine On-Demand çalışır. Özellikle ani kapasite için, On-Demand ya da Spot doğrudur — trafik tırmanmaya başladığında gerçek zamanlı olarak Rezervasyonlu Instance satın alamazsınız.”

“Ne zaman kullanılmamalı” listesinin önemli olmasının bir nedeni var: aynı instance’ları altı aydır çalıştırıyorsanız ve çalışmaya devam edeceklerini tahmin edebiliyorsanız, On-Demand’deki her ay, kalıcı olarak işgal ettiğiniz bir oda için kapıdan giriş oranını ödediğiniz bir aydır.

**Rezervasyonlu Instance’lar: Bir Yıllık Taahhüt**

**Rezervasyonlu Instance’lar (RI’lar)** bir faturalandırma taahhüdüdür — belirli bir bölgede belirli bir instance türünü 1 veya 3 yıl kullanmayı kabul edersiniz. Karşılığında AWS daha düşük bir saatlik oran uygular.

**İndirim seviyeleri**:

- 1 yıl, Ön Ödeme Yok: On-Demand’e göre ~%30-40 indirim
- 1 yıl, Kısmi Ön Ödeme: ~%35-45 indirim (bir kısmını şimdi ödeyin, saat başına daha az)
- 1 yıl, Tüm Ön Ödeme: ~%40-50 indirim (tüm yılı şimdi ödeyin)
- 3 yıl, Tüm Ön Ödeme: ~%55-72 indirim (maksimum indirim, maksimum taahhüt)

**Standart vs Dönüştürülebilir RI’lar**:

- **Standart**: Tam instance türüne ve bölgeye kilitlenir. Artık ihtiyaç duymuyorsanız Rezervasyonlu Instance Piyasası’nda satılabilir.
- **Dönüştürülebilir**: Taahhüt süresi boyunca instance türü, işletim sistemi ve kiralama türü değiştirilebilir. Standart’tan daha az indirim (~%72’ye karşı ~%66’ya kadar).

Tom, 4 API sunucusu için (r6g.large, On-Demand olarak yaklaşık 0,101 dolar/saat) hesabı yaptı:

- Yıllık On-Demand maliyeti: 0,101 × 24 × 365 × 4 ≈ 3.540 dolar
- 1 yıl Tüm Ön Ödeme RI (1 instance): ~520 dolar peşin (≈%41 indirim)
- 4 instance: ~2.080 dolar peşin = **ilk yılda yaklaşık 1.460 dolar tasarruf**

“Sadece taahhüt ederek ilk yılda neredeyse bin beş yüz dolar tasarruf edebiliriz,” dedi Tom. “Bu tam olarak ayda ne kadara mal oluyor — her rezervasyonlu instance, şu an ödediğimizle kıyaslandığında?”

“Yükü öne biniyor,” dedi Maya. “Tüm yılı peşin ödüyorsunuz.”

“Dur — ama instance türleri hâlâ gelişiyorsa *neden* Standart RI’ya taahhüt edelim ki?” diye sordu Maya. “Ya r6g gelecek yıl modası geçerse?”

“Değiştirmemiz gerekebileceğini düşünüyorsak Dönüştürülebilir RI alırız. Daha az indirim — %72 yerine ~%66’ya kadar — ama taahhüt süresi boyunca instance ailelerini değiştirme esnekliği.”

“Peki taahhüt ettikten sonra AWS daha iyi bir instance türü çıkarırsa?”

“RI’nin süresi dolduğunda kontrol ederiz. Yeni tür daha iyiyse, bir sonraki dönem için yeni bir RI satın alırız. Mevcut RI taahhüt edilen fiyatla süresini tamamlar.”

Tom, herkesin takip edebilmesi için başabaş karşılaştırmasını paylaşılan ekrana getirdi:

**Üç yönlü karşılaştırma: r6g.large, 4 instance, 12 ay**

| Seçenek | Yıllık Maliyet | Aylık Eşdeğer | Esneklik |
|---|---|---|---|
| On-Demand (0,101 $/saat × 4) | 3.540 $ | 295 $ | Tam |
| Compute Tasarruf Planı (~%34 indirim 1 yıl, 0,27 $/saat taahhüt) | 2.365 $ | 197 $ | Yüksek |
| Standart RI, 1 yıl Tüm Ön Ödeme (4 × 520 $) | 2.080 $ | 173 $ | Düşük |

“Dur,” dedi Leo. “RI, Tasarruf Planı’ndan daha mı ucuz?”

“Aynı dönemde, evet — esnekliğin bedeli bu,” dedi Tom. “Compute Tasarruf Planı *herhangi* bir instance türüne, boyutuna, bölgeye, hatta Fargate ve Lambda’ya uygulanır, dolayısıyla maksimum indirimi daha düşüktür — 3 yıllık dilimde %66’ya kadar. Standart RI veya EC2 Instance Tasarruf Planı sizi bir instance ailesine kilitler ve bu kilitlenme karşılığında %72’ye kadar indirimle ödeme yapar. Ne kadar çok özgürlük korursanız, AWS o kadar az indirim yapar.”

“3 yıllık RI’nin başabaşı ne?”

“3 yıl Tüm Ön Ödeme: instance başına yaklaşık 1.060 dolar, yani dördü için toplam 4.240 dolar — bu 36 ay satın alır. Aylık eşdeğer: 118 dolar, On-Demand’deki 295 dolara karşı. Ön ödeme, on dördüncü ay civarında kendini amorti eder; ondan sonra neredeyse iki yıl daha tasarruf bölgesindesiniz.”

“Yani dördüncü ayda farklı bir instance ailesine ihtiyacımız olduğuna karar verirsek,” dedi Priya, “yine de orijinal taahhüt için ödeme yapıyoruz.”

“Doğru. Standart RI’ları RI Piyasası’nda satabilirsiniz ama her zaman tam değerine değil. Dönüştürülebilir RI’lar takas edilebilir ama satılamaz. Tasarruf Planı’nın çoğu zaman daha güvenli seçim olmasının nedeni bu — aynı prensip, daha az kilitlenme.”

**Tasarruf Planları: Esnek Taahhüt**

**Tasarruf Planları**, Rezervasyonlu Instance’lara göre daha yeni ve daha esnek bir alternatiftir. Belirli bir instance türüne taahhüt etmek yerine, belirli bir *saatlik harcama miktarına* (dolar cinsinden) taahhüt edersiniz.

**Compute Tasarruf Planları**: Türü, boyutu, bölgesi veya işletim sistemi ne olursa olsun herhangi bir EC2 instance’ına uygulanır. En esnek olanıdır. %66’ya kadar indirim.

**EC2 Instance Tasarruf Planları**: Bir bölgedeki belirli bir instance ailesine uygulanır (örneğin, “us-west-2’deki c6g instance’ları”). Compute’tan daha kısıtlayıcıdır ama %72’ye kadar indirim (RI maksimumuyla aynı).

**SageMaker Tasarruf Planları**: SageMaker ML eğitimi ve çıkarımına özeldir.

Nimbus için: API sunucuları için Compute Tasarruf Planları. 0,45 dolar/saat compute harcamasına taahhüt ettiler. Herhangi bir instance türü, herhangi bir boyut — ve taahhüt ayrıca, sonrasında gelen şey için önemli olan Fargate ve Lambda’yı da kapsıyor. Filoyu büyüttüklerinde veya instance türlerini değiştirdiklerinde Tasarruf Planı hâlâ geçerlidir.

“Bu bizim için Rezervasyonlu Instance’lardan daha iyi,” dedi Leo. “Hâlâ instance türleriyle deney yapıyoruz. Compute Tasarruf Planı, bizi özellikle r6g’ye kilitlemeden indirimi veriyor.”

“0,45 dolar/saate taahhüt edip bazı aylarda yalnızca 0,36 dolar kullandığımızda ne olur?” diye sordu Maya.

“Ne olursa olsun 0,45 dolar ödersiniz,” dedi Tom. “Taahhüt koşulsuzdur. Tasarruf Planı, taahhüt edilen miktara kadar sahip olduğunuz kullanıma uygulanır. Bunun üstündeki her şey On-Demand oranlarıyla çalışır. Disiplin, taahhüdü her zaman ulaşacağınızdan emin olduğunuz bir seviyede belirlemektir.”

“Ve ortalamamıza taahhüt etmemeliyiz — tabanımıza taahhüt etmeliyiz,” dedi Priya.

“Aynen. Son altı aya bakın. En düşük haftayı bulun. O sayının %90’ına taahhüt edin. Sonra büyüdükçe üç ayda bir gözden geçirin.”

“Fazla taahhüt edersek ne olacağını düşündük mü?” diye devam etti Priya. “2 dolar/saatlik bir plan satın alıyoruz, sonra önümüzdeki çeyrekte optimize ediyoruz ve compute kullanımımız 1,50 dolara düşüyor.”

“0,50 dolar/saatlik fark israfa dönüşür,” dedi Tom. “Artık var olmayan kapasite için ödeme yapıyoruz. Taahhüdü çok yüksek belirlemenin riski bu. Üç aylık inceleme tam olarak bunu yakalamak için var — kullanımımız taahhüdün altına düştüyse, bir sonraki satın almanın daha küçük olması gerektiğini biliriz. Önemli bir nüans: bir *Compute* Tasarruf Planı sizi Fargate ve Lambda’ya kadar takip eder — EC2 iş yüklerini konteynerlere taşımak onu boşa düşürmez. Taahhüdü boşa düşüren şey, gerçekten daha az compute kullanmak ya da kullanmayı bıraktığınız bir instance ailesi için bir *EC2 Instance* Tasarruf Planı ya da RI tutmaktır.”

Şunu merak ediyor olabilirsiniz: neden her zaman karşılanabilir maksimum miktarda Tasarruf Planı satın alıp AWS’nin halletmesine izin vermiyoruz? Cevap, taahhüdün bir taban olması, bir tavan olmamasıdır. 5 dolar/saate taahhüt ederseniz ama yalnızca 3 dolar/saat kullanırsanız, 5 dolar/saat ödersiniz. Gerçek kullanımla eşleşmeyen her dolarlık taahhüt edilen harcama, boşa giden bir dolardır. Üç aylık inceleme isteğe bağlı değildir — Tasarruf Planı’nı bir aşırı taahhüt değil, bir optimizasyon olarak tutan şey budur.

**Spot Instance’lar: %90’lık İndirim**

**Spot Instance’lar**, AWS’nin boştaki EC2 kapasitesini kullanır. AWS’nin kullanılmayan sunucuları olduğunda, bunları On-Demand fiyatının %60-90 altında kiralayabilirsiniz. AWS kapasiteyi geri istediğinde (On-Demand veya Rezervasyonlu müşteriler için), size 2 dakikalık bir uyarı verir ve instance’ınızı sonlandırır.

Şunu merak ediyor olabilirsiniz: iki dakika önceden haber vererek yok olabilen instance’lar etrafında kim bir sistem tasarlar? Cevap: işi sıfırdan yeniden başlatılabilen herkes. Toplu işler, analitik, render boru hatları — bunların hiçbiri, işi başlatan belirli instance’ın işi bitiren instance olmasını gerektirmez. 2 dakikalık uyarı, bir kontrol noktası kaydetmek, bağlantıları boşaltmak ve temiz bir şekilde çıkmak için yeterlidir.

Kesinti riski, belirleyici özelliktir. Spot Instance’lar yalnızca şunlar için uygundur:

- **Hata toleranslı iş yükleri**: Bir instance görev ortasında sonlanırsa, görev hiçbir şeyi bozmadan yeniden başlayabilir
- **Durumsuz işleme**: Resim yeniden boyutlandırma, video kodlama, toplu analitik, ML eğitimi
- **Kısa ömürlü toplu işler**: 2 dakikalık uyarı, durumu kaydetmek ve kontrol noktası oluşturmak için yeterlidir
- **Auto Scaling karışık filolar**: ASG’nizin çoğunluğu için Spot’u, temel olarak On-Demand’le birlikte kullanın

Nimbus için: Spot Instance’lar, her gece çalışan toplu analitik işleri (günün sipariş verilerini toplu raporlara işleyen) için mantıklıydı. Bir Spot Instance iş ortasında sonlandırılırsa, iş başarısız olur ama yeni bir instance üzerinde baştan yeniden başlar. S3’teki veriler güvende.

Ama Leo bunu, ekip örüntüyü tam olarak anlamadan önce, zor yoldan öğrendi.

Üç ay önce, kontrol noktası mantığı kurmadan gece toplu işini Spot’a taşımıştı. İlk gece, Spot Instance sorunsuz çalıştı. İkinci gece, saat 04.47’de kesintiye uğradı — tamamlanması bir saat yirmi dakika süren bir işin kırk yedinci dakikasında. İş başarısız oldu. Önceki günün siparişlerine ait nihai rapor, restoran ortakları o sabah oturum açtıklarında eksikti.

“Onu zaten dağıtmıştım — ah,” demişti Leo, başarısız iş bildirimine bakarak. “İyi olacağını varsaymıştım. İlk gece iyiydi.”

“Ne oldu?” diye sormuştu Maya.

“Spot kesintisi. AWS kapasiteyi geri istedi, bize iki dakika verdi, instance sonlandı. İşin hiçbir kontrol noktası yoktu. Sabah 05.00’te yeni bir Spot Instance yeniden denemek için başlatıldığında, sıfırdan başladı. 06.40’ta bitti. Raporlar iki saat geç kaldı.”

Çözüm basitti: ara sonuçları her on beş dakikada bir S3’e yaz. Her kontrol noktası tam bir kısmi durumdu — yeni bir instance’ın son kontrol noktasını okuyup baştan yeniden başlamak yerine o noktadan devam etmesi için yeterli.

“Gece işi için Spot kullanmak, maliyetini gecede 12 dolardan gecede 2 dolara düşürdü,” diye raporladı Leo, düzeltme yapıldıktan sonra. “O bir kötü geceye rağmen, üç ay boyunca çalıştırmanın toplam maliyeti, iki haftalık On-Demand fiyatlandırmasından daha azdı.”

“İyi olacak,” diye ekledi Leo, “çalışma ortasında kesilse bile — değil mi?”

“Kontrol noktası mekanizması yerindeyken, evet,” dedi Tom. “Olmadan, hayır. Kesinti toleransı işin içine inşa edilmeli, varsayılmamalı.”

“Peki biri içeri girmeye çalışırsa?” diye sordu Priya. “Spot Instance paylaşılan donanımda. Kesilip yeni biri başlatılırsa, instance’lar arasında herhangi bir veri sızıntısı olur mu?”

“Hayır,” dedi Tom. “AWS, sonlandırmada instance depolamasını siler. O donanımı alan bir sonraki müşteri temiz bir sayfa görür. Ama bu iyi bir içgüdü — paylaşılan kapasite kullandığınız her seferinde izolasyon modelini doğrulamaya değer.”

**Spot Filo Çeşitlendirmesi**

Leo, kesilen toplu işten bir şey daha öğrenmişti: tek bir Spot Instance türü talep ettiğinizde, o AZ’deki o belirli türün kullanılabilirliğine bahis oynuyorsunuz demektir. us-west-2a’da c5.2xlarge için Spot kapasitesi tükenirse, işiniz bekler — ya da başarısız olur.

**Spot Fleet** bunu, tek bir talepte birden fazla instance türü ve AZ belirtmenize izin vererek çözer. AWS, filoyu en düşük fiyatta kullanılabilir kapasitesi olan kombinasyondan karşılar.

```
Spot Fleet talebi:
  Hedef kapasite: 4 birim
  Filo çeşitlendirmesi:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Tahsis stratejisi: diversified
```

Çeşitlendirilmiş bir filoda, bir instance türünde veya AZ’de bir kesinti, filonun yalnızca bir kısmını etkiler. Geri kalanı çalışmaya devam eder. Nimbus toplu işi için, tek bir büyük instance yerine dört instance’lık bir Spot Filo çalıştırmak, kısmi bir kesinti olsa bile işin bitmesine olanak tanıdı — daha yavaş, ama tam yeniden başlatma olmadan.

“Çeşitlendirilmiş filo aynı zamanda daha iyi fiyatlandırma da alma eğilimindedir,” dedi Tom. “AWS, filonuzdaki tüm türler arasından en düşük fiyatı verir. Bazı gecelerde c5a’yı c5’ten daha düşük bir fiyata alıyorsunuz çünkü kapasite o sırada oradaydı.”

“Tek bir instance türü kullanmaya kıyasla bu ayda ne kadara mal oluyor?” diye sordu Tom kendi kendine, yüksek sesle — alışkanlık artık tamamen refleks olmuştu. Sayıyı hesapladı. Karışık fiyatlandırmalı Spot Filo, tek türlü bir talepteki gecede 2,00 dolara karşı gecede ortalama 1,80 dolardı. Mutlak anlamda küçük bir fark, ama yalnızca güvenilirlik iyileştirmesi bile değişikliği haklı çıkarıyordu.

“Peki biri Spot Filo’ya girmeye çalışırsa?” diye sordu Priya.

“Her zamanki cevap,” dedi Tom. “Her instance diğerlerinden izole. Filo, onları otomatik olarak paylaşılan bir özel segmente koymaz. Güvenlik gruplarınız hâlâ her instance’a ayrı ayrı uygulanır.”

Kontrol noktası mekanizması, kesintileri yönetilebilir kılmıştı, ortadan kaldırmamıştı. İş hâlâ son kontrol noktasından yeniden başlıyordu ve yeniden başlama Spot fiyat artışları dönemiyle çakışırsa, yedek instance’ın kullanılabilir hale gelmesi 10 ila 20 dakika sürebiliyordu. Son kontrol noktasının zaten kapsadığı iş yeniden başlatmada atlanıyordu; o zamandan beri yapılan iş yeniden yapılıyordu. Toplam yeniden çalışma yükü: küçük, ama gerçek.

Spot Filo, kullanılabilirlik sorununu temiz bir şekilde çözdü. Üç AZ’de beş instance türü belirterek, Leo tam bir kapasite boşluğu olasılığını sıfıra yakın bir seviyeye indirdi. AWS’nin tahsis stratejisi — diversified — dört instance’lık filoyu havuzlara dağıttı, böylece tek bir havuzun kesintisi işi durduramazdı. Bir instance kesintiye uğradığında, kalan üçü işlemeye devam etti ve kontrol noktası, yedek instance’ın yalnızca kesilen instance’ın işlemekte olduğu işi devralması anlamına geldi. Baştan sona, iş bir daha asla 07.00 rapor son teslim tarihini kaçırmadı.

“Çeşitlendirme karmaşıklık olarak neye mal oldu?” diye sordu Maya, Leo bunu belgelediğinde.

“Spot Filo talebinde üç ekstra satır,” dedi Leo. “İşleme kodu, hangi instance türünde çalıştığını bilmiyor ya da umursamıyor. Karmaşıklık tamamen filo yapılandırmasında yaşıyor, uygulamada değil.”

İşte uygulamayı en baştan durumsuz olarak tasarlamanın avantajı buydu: ölçeklendirme ve hata toleransı kararları, kod kararları değil, altyapı kararları haline geldi.


**Özel Host’lar: Uyumluluk Seçeneği**

Bazı yazılım lisansları (Oracle, bazı yapılandırmalarda Windows Server) fiziksel soket veya çekirdek başına fiyatlandırılır. Bu yazılımı paylaşılan bir host’ta (EC2 için varsayılan) çalıştırırsanız, kullanmadığınız kapasite için ödeme yapıyor olabilirsiniz.

**Özel Host’lar**, tamamen sizin kullanımınız için fiziksel bir sunucuya erişim sağlar. Mevcut soket başına lisanslarınızı getirebilirsiniz. Başka hiçbir AWS müşterisinin instance’ı aynı donanımda çalışmaz.

Özel Host’lar, standart EC2’den önemli ölçüde daha pahalıdır. Bunlar bir uyumluluk ve lisanslama aracıdır, bir maliyet optimizasyonu aracı değil.

Nimbus’un Özel Host gerektirecek bir lisanslama gereksinimi yoktu. Çoğu bulutta doğan uygulamanın da yoktur.

**Varyasyon: Taahhüt Ters Teptiğinde**

İş yükünüz 12 ay boyunca tahmin edilebilir ve sabitse, Rezervasyonlu Instance’lar maksimum indirimi sağlar — ama instance türü ihtiyaçlarınız o dönemde önemli ölçüde değişebilirse, o kilitlenme size fiyat farkından daha değerli bir esneklik kaybettirir. Dönüştürülebilir RI’lar bunun bir kısmını çözer, ama düşürülmüş bir indirimle. Compute Tasarruf Planları bunun çoğunu çözer, Standart RI’lardan biraz daha düşük bir maksimum indirimle.

Hata toleranslı toplu işler için Spot Instance’lar kullanırsanız, %60-90 tasarruf sağlayabilirsiniz — ama aynı instance’lar canlı kullanıcı isteklerine hizmet ediyorsa, istek ortasında bir kesinti başarısız işlemler ve mutsuz müşteriler demektir. İş yükünün kesintiye tahammülü belirleyici değişkendir.

Daha incelikli bir yanlış seçim durumu var: bir Tasarruf Planı’nı aşırı taahhüt etmek. Compute kullanımınız geçen çeyrekte ortalama 3,00 dolar/saat olduğu için 3,00 dolar/saatlik bir Compute Tasarruf Planı satın alırsanız, sonra bu çeyrekte hizmetlerinizi optimize ederseniz (toplam kullanımı 1,80 dolar/saate düşürerek), ne olursa olsun taahhüt edilen 3,00 dolar/saati ödersiniz. 1,20 dolar/saatlik fark israftır. (EC2 iş yüklerini Fargate veya Lambda’ya taşımanın bir Compute Tasarruf Planı’nı boşa düşürmeyeceğini unutmayın — her üçünü de kapsar. Boşa düşme riskleri, gerçek kullanım azalması ya da EC2 Instance Tasarruf Planları ve RI’larla aile kilitlenmesidir.) Taban stratejisinin önemli olmasının nedeni bu: ortalamanıza değil, minimumunuza taahhüt edin. Ve üç ayda bir gözden geçirin.

Kural: emin olduğunuz şeye taahhüt edin. Emin olmadığınız için On-Demand kullanın. Yalnızca sert bir durmadan sağ çıkabilecek şey için Spot kullanın.

**Karışık Bir Filo Oluşturma**

Olgun yaklaşım: birden fazla fiyatlandırma modelini birlikte kullanmak.

Nimbus’un API filosu için:

- **Temel yük (4 instance, her zaman çalışıyor)**: Tasarruf Planı taahhüdüyle kapsanır
- **Tahmin edilebilir zirve (iş saatlerinde 2 ek instance)**: Taahhüt onları kapsıyorsa Tasarruf Planı ile, aksi takdirde On-Demand
- **Trafik zirvesi taşması**: Spot Instance’lar (API sunucuları durumsuz olduğu için kabul edilebilir — bir instance sonlanırsa istekler yeniden dağıtılır)

Sonuç: her katmanda maliyeti optimize eden bir filo — tahmin edilebilir kısım için taahhütlü fiyatlandırma, tahmin edilemeyen büyüme için On-Demand, ani kapasite için Spot.

**Tasarruf Planı Kullanımını İzleme**

Bir Tasarruf Planı satın almak işin sonu değildir. Tekrarlayan bir yükümlülüğün başlangıcıdır: taahhüdün hak edilip edilmediğini bilmek.

Tom, her çeyreğin ilk Pazartesi’si için bir takvim hatırlatması ayarladı: Tasarruf Planı kullanım incelemesi. Araç AWS Cost Explorer’dı. Özellikle, “Reservations and Savings Plans” altındaki “Savings Plans” sekmesi, önemsediği üç sayıyı gösteriyordu:

- **Kullanım oranı (Utilization rate)**: Taahhüt edilen harcamanın yüzde kaçı gerçekten uygun kullanımla eşleşti? %100’ün altındaki bir sayı, kullanılmayan bir taahhüt için ödeme yaptığı anlamına geliyordu.
- **Kapsama oranı (Coverage rate)**: Uygun EC2 kullanımının yüzde kaçı, On-Demand oranlarında çalışmak yerine Tasarruf Planı tarafından kapsanıyordu? %80’in altındaki bir sayı, daha büyük bir taahhüdün yakalayacağı kapsanmamış kullanım olduğu anlamına geliyordu.
- **On-Demand harcaması**: Herhangi bir Tasarruf Planı tarafından kapsanmayan EC2 harcaması bölümü. Bu büyüyorsa, ya Tasarruf Planı yetersiz boyutlandırılmıştı ya da taahhüdün kapsamı dışında yeni iş yükleri eklenmişti.

İlk üç aylık incelemede, sayılar şöyle görünüyordu:

- Kullanım: %97. Taahhüt edilen harcamanın yüzde üçü eşleşmeden gidiyordu — 330 dolar/aylık bir taahhütte ayda 9,90 dolar. Bu kabul edilebilirdi; taahhüdün, kasıtlı olan gerçek taban kullanımının biraz üstünde belirlendiği anlamına geliyordu.
- Kapsama: %84. Uygun EC2 kullanımının yüzde on altısı On-Demand çalışıyordu. Bu, ani kapasiteydi — trafik zirveleri sırasında devreye giren ve taahhütle kapsanmayan taşma instance’ları.
- On-Demand EC2 harcaması: 147 dolar/ay. Spot Instance’lar (Tasarruf Planları tarafından kapsanmaz, ayrı fiyatlandırılır) geri kalanın çoğunu oluşturuyordu.

“%97 kullanım sağlıklı,” dedi Tom. “Aşırı taahhütte bulunmadığımız anlamına geliyor. Bu %80 olsaydı, fazla satın aldığımızı bilirdim.”

“Peki %84 kapsama?” diye sordu Maya.

“O da iyi. On-Demand olan %16, ani kapasite — zirve sırasında saatlerce çalışan, bütün gün değil. Bunları kapsamak için önemli ölçüde daha fazla Tasarruf Planı taahhüdü satın almamız gerekir ve bunu haklı çıkarmayabilirler.” Hesabı yaptı: kapsanmayan On-Demand instance’lar, instance başına 0,101 dolar/saatten ayda belki 40 saat çalışıyordu. Bunları bir Tasarruf Planı’yla kapsamak, zamanın %90’ında eksik kullanacağımız bir taahhüt gerektirirdi. Onları On-Demand bırakmak daha iyi.

Altı ay sonraki ikinci üç aylık incelemede, bir metrik değişmişti: On-Demand EC2 harcaması ayda 290 dolara çıkmıştı. Nimbus Instant özelliği piyasaya sürülmüştü ve Tom fark etmeden birkaç yeni arka plan hizmeti instance’ı eklenmişti.

“Bu üç instance,” dedi Tom, Cost Explorer dökümünü işaret ederek. “Üç aydır On-Demand çalışıyorlar. Çalışmaya devam edeceklerse, onları Tasarruf Planı taahhüdüne eklemeliyiz.”

Üç aylık inceleme bunu yakalamıştı. İnceleme olmasaydı, o üç instance süresiz olarak kapıdan giriş oranlarında çalışmaya devam ederdi.

“Taahhüdü nasıl ayarlıyorsun?” diye sordu Priya.

“Mevcut olanın üzerine yeni, ek bir Tasarruf Planı satın alıyorsun,” dedi Tom. “Tasarruf Planları üst üste eklenir. Yeni temel yük için 0,10 dolar/saatlik bir Compute Tasarruf Planı eklerdim. Mevcut 0,45 dolar/saatlik plan, üç yıllık süresi bitene kadar devam eder. Yeni plan kendi üç yıllık süresini başlatır.”

“Yani iki örtüşen Tasarruf Planımız olur.”

“Evet. Var olan uygun kullanıma bağımsız olarak uygulanırlar. AWS, onları en faydalıdan en az faydalıya doğru sırayla eşleştirir.”

“Gelecek yıl bu arka plan hizmetlerinden birini satarsak ne olacağını düşündük mü?” diye sordu Priya. “Üç yıl boyunca 0,55 dolar/saate taahhüt ettik.”

“Üç yıllık sürenin riski bu,” dedi Tom. “Bu yüzden yeni taahhüt daha küçük — yeni iş yüklerinin ortalamasına değil, tabanına taahhüt ediyorum. Bir hizmeti devre dışı bırakırsak ve kullanım düşerse, kalan hizmetler yine de taahhüt edilen tüm miktarı tüketmeli.”

Üç aylık inceleme disiplini gösterişli değildi. Cost Explorer’da on beş dakikaydı, üç sayı kontrol edildi, bir karar verildi ya da ertelendi. Ama üç yıl boyunca, bu disiplin, %90+ kullanım sağlayan bir Tasarruf Planı — gerçek tasarruf — ile altyapı etrafında geliştikçe kısmi israfa kayan bir plan arasındaki farktı.

## Güçlü Yönler ve Sınırlamalar

**On-Demand**: Taahhüt yok. Tam fiyat. Tahmin edilemeyen veya kısa vadeli iş yükleri için kullanın.

**Rezervasyonlu Instance’lar**: %72’ye kadar indirim. Belirli bir instance türüne/bölgeye/işletim sistemine kilitlenir. Kullanılmayan kapasiteyi RI Piyasası’nda satın.

**Tasarruf Planları**: %66-72’ye kadar indirim. RI’lardan daha esnek (Compute Tasarruf Planları herhangi bir instance türüne uygulanır). Eşleşen kullanıma otomatik uygulama.

**Spot Instance’lar**: %90’a kadar indirim. 2 dakikalık kesinti riski. Yalnızca hata toleranslı, durumsuz, kesintiye uğrayabilen iş yükleri için.

**Özel Host’lar**: Tam fiziksel sunucu. En pahalı. Belirli lisanslama veya uyumluluk senaryoları için gereklidir.

## Özet

Tom, Cumartesi’nin geri kalanını her Nimbus iş yükünü ideal fiyatlandırma modeline eşleyerek geçirdi — temel yükü Tasarruf Planları’na, gece toplu işlerini Spot’a, tahmin edilemeyen taşmayı On-Demand’e. Bu egzersiz, kapıdan giriş oranını ödenen üç ayı kasıtlı bir stratejiye dönüştürdü. Bir kez hesaplandığında, sayıları görmezden gelmek zordu.

- EC2 fiyatlandırmasının dört modeli vardır: **On-Demand** (tam fiyat, taahhüt yok), **Rezervasyonlu Instance’lar/Tasarruf Planları** (önemli indirim için taahhütlü harcama), **Spot** (boştaki kapasite %60-90 indirimle, kesintiye uğrayabilir), **Özel Host’lar** (fiziksel sunucu özelliği).
- **Tasarruf Planları**, esneklik için genellikle Rezervasyonlu Instance’lara tercih edilir.
- **Spot Instance’lar**, hata toleranslı, durumsuz iş yükleri gerektirir — yalnızca toplu işler, ML eğitimi ve kesintiye uğrayabilen işleme için.
- **Dayanıklı depolamaya (S3) kontrol noktası kaydetme**, Spot tabanlı toplu işler için gereklidir — kesintiye uğrayan işler sıfırdan değil, son kontrol noktasından devam etmelidir.
- **Spot Filo çeşitlendirmesi**, birden fazla instance türü ve AZ arasında kesinti riskini azaltır ve genellikle daha iyi fiyatlandırma sağlar.
- Optimal strateji bir **karışık filodur**: temel için Tasarruf Planları, tahmin edilemeyen büyüme için On-Demand, kesintiye uğrayabilen toplu iş için Spot.
- İş yükleri 3+ aydır istikrarlı çalışıyorsa fiyatlandırma modellerini gözden geçirin — On-Demand’in israf olmaya başladığı zaman budur.
- **Tasarruf Planı taahhütlerini üç ayda bir gözden geçirin** — ortalamanıza değil, tabanınıza taahhüt edin ve kullanım örüntüleri değiştikçe ayarlayın.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama (Alan 4, Görev 4.2)*

- **Tasarruf Planları vs Rezervasyonlu Instance’lar**: Tasarruf Planları daha esnektir (Compute Tasarruf Planları herhangi bir EC2 instance’ına uygulanır). Rezervasyonlu Instance’lar belirli bir instance türüne kilitlenir. Sınav senaryoları: “indirim alırken maksimum esnekliğe ihtiyaç var” → Tasarruf Planları. “3 yıl boyunca tam instance türünü biliyoruz” → maksimum indirim için Standart RI.
- **Spot sinyalleri**: “maliyete duyarlı,” “hata toleranslı,” “toplu işleme,” “kesintileri kaldırabilir,” “durumsuz iş yükleri,” “ML eğitimi” → Spot.
- **Spot kesinti yönetimi**: Spot instance’lar sonlandırılmadan önce 2 dakikalık bir uyarı alır. Uygulamanız bununla zarif bir şekilde başa çıkmalıdır (durumu kaydet, bağlantıları boşalt, temiz bir şekilde çık).
- **Web sunucuları için On-Demand vs Spot**: Canlı kullanıcı trafiğine hizmet eden web sunucuları Spot KULLANMAMALIDIR (kesinti başarısız isteklere neden olur). Web katmanı için On-Demand veya Tasarruf Planları kullanın.
- **EC2 Tasarruf Planları vs Compute Tasarruf Planları**: EC2 Tasarruf Planları belirli bir instance ailesine ve bölgeye uygulanır (daha yüksek indirim). Compute Tasarruf Planları herhangi bir EC2 instance’ına, Lambda’ya ve Fargate’e uygulanır (daha düşük maksimum indirim, daha esnek).
- **RI Piyasası**: Kullanılmayan Standart Rezervasyonlu Instance’lar diğer AWS müşterilerine satılabilir. Dönüştürülebilir RI’lar satılamaz.
- **Hibernation:** Durdurmada RAM içeriğini EBS kök birimine kaydeder; başlatmada geri yükler. Instance, tüm süreçleri ve durumu bozulmadan, soğuk bir başlangıçtan daha hızlı devam eder. Instance durumu oturumlar arasında korunmalıysa kullanın. Gerektirir: başlatmada etkinleştirilmiş (var olan bir instance’a eklenemez), RAM ≤ 150 GB, şifreli EBS kök birimi, bare-metal instance’lar için kullanılamaz; en fazla 60 gün hazırda bekleme. Sınav sinyali: “bellek içi durum korunarak instance’ı hızla devam ettir” veya “geliştirme instance’ı başlatması çok uzun sürüyor” → Hibernation.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Spot Instance’ların ne zaman uygun ve ne zaman uygun olmadığını açıklayın. Bir iş yükünü Spot’a uygun kılan özellik nedir?

*(İpucu: Instance 2 dakikalık uyarıyla sonlandırıldığında ne olduğunu düşünün. Hangi iş yükleri temiz bir şekilde kurtulur? Hangileri kurtulmaz?)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir medya şirketi, yüklenen videoları birden fazla formata dönüştüren bir video transkodlama boru hattı çalıştırıyor. Transkodlama işleri, videolar yüklendiğinde sürekli çalışır (7/24 çalışma, değişken hacim). Her iş 5-30 dakika sürer. Bir transkodlama işi kesintiye uğrarsa, iş veri kaybı olmadan baştan yeniden başlatılabilir. Şirket maliyeti en aza indirmek istiyor.

Bu gereksinimleri EN İYİ karşılayan EC2 fiyatlandırma modeli hangisidir?

A) Auto Scaling Grubu içinde On-Demand instance’lar  
B) Rezervasyonlu Instance’lar (1 yıl, Tüm Ön Ödeme)  
C) Otomatik instance çeşitlendirmesi için Spot Fleet ile Spot Instance’lar  
D) Şirketin mevcut medya yazılımı lisanslarıyla Özel Host’lar

**İpucu 1**: “Veri kaybı olmadan baştan yeniden başlatılabilir” — bu, belirli bir fiyatlandırma modelini mümkün kılan anahtar ifadedir.

**İpucu 2**: Kesintiye uğrayabilen bir iş yüküyle “maliyeti en aza indir”, maksimum indirim seçeneğine işaret eder.

**İpucu 3**: Spot Fleet, birden fazla instance türünden ve AZ’den instance talep ederek kesinti olasılığını azaltır.

**Cevap**: C

**Açıklama**: Transkodlama işleri hata toleranslıdır — kesintiye uğrarlarsa yeniden başlatılabilirler. Bu, onları On-Demand’e göre %60-90 indirim sunan Spot Instance’lar için ideal kılar. Spot Fleet, instance türleri ve Kullanılabilirlik Bölgeleri arasında çeşitlendirme yaparak toplu kesinti olasılığını azaltır.

**Neden A değil?** On-Demand en yüksek maliyetli seçenektir. Sürekli çalışan, hata toleranslı bir iş yükü için bu israftır.

**Neden B değil?** Rezervasyonlu Instance’lar %50-72 indirim sağlar ama hata toleranslı iş yükleri için Spot’un potansiyel %90 indirimini sunmaz. Ayrıca, RI’lar tahmin edilebilir, sabit durumlu iş yükleri içindir — Spot, özellikle kesintiye uğrayabilen toplu işleme içindir.

**Neden D değil?** Özel Host’lar lisans uyumluluğu içindir, maliyet optimizasyonu için değil. En pahalı seçenektir.

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama — Görev 4.2*

**Alıştırma 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus’un altyapısında şu iş yükleri var:

1. API sunucuları: 6 instance, 7/24 çalışıyor, 2 yıldır kararlı, r6g.large kullanıyor
2. Gece analitik toplu işleri: 4 instance, her gece 03.00-06.00 çalışıyor, her zaman aynı instance türü
3. Test ortamı: 2 instance, mühendisler tarafından hafta içi 09.00-18.00 kullanılıyor
4. Trafik zirvesi taşması: 0-8 instance, zirve saatlerinde devreye giriyor, tamamen tahmin edilemez

Her iş yükü türü için optimal fiyatlandırma stratejisini tasarlayın. 1 ve 2 numaralı iş yüklerini kapsayacak Tasarruf Planı taahhüt miktarı ne olurdu? 3 numaralı iş yükü için On-Demand’den daha akıllı bir strateji var mı?

*(Tek bir doğru cevap yoktur. Amaç, EC2 fiyatlandırma stratejisi pratiği yapmaktır.)*

## Jenerik Sonrası Sahne

Tom, Tasarruf Planı satın alımını gönderdi.

0,45 dolar/saat taahhüt. Üç yıllık süre. Esneklik için Compute Tasarruf Planları.

Gece toplu işi için Spot filosuyla birleştiğinde, tahmini tasarruf: üç yılda 42.500 dolar — yılda 14.000 doların biraz üzerinde.

Maya sayıyı okudu. “Kırk iki bin dolar.”

“Üç yıl boyunca her şeyi On-Demand çalıştırmaya kıyasla.”

“Bunu yapmak neye mal oldu?”

“Bir öğleden sonralık analiz,” dedi Tom. “Ve taahhüt etme kararı.”

“Üç yıl uzun bir süre,” dedi Leo. “Ya instance türlerini değiştirirsek?”

“Compute Tasarruf Planları herhangi bir EC2 instance türüne uygulanır. Ve üç yıl içinde, zaten bu konuşmanın farklı göründüğü kadar büyük olacağız.”

Leo bunu düşündü.

“Tasarruf Planları’nı ne zamandır biliyorsun?” diye sordu.

“Başından beri,” dedi Tom. “İş yükünün taahhüt etmeye yetecek kadar kararlı olmasını bekliyordum.”

“On sekiz ay On-Demand ödeyerek beklemek.”

“Evet.” Tom konsolu kapattı. “Bazen yaptığınız en pahalı şey, para tasarrufu için beklemektir.”

Bir sonraki bölümde: aynı disiplin depolama maliyetlerine uygulanıyor, faturayı neyin yönlendirdiğine dair birkaç sürprizle.
