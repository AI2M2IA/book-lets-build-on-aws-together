# Bölüm 29: Veritabanı Faturası

Tom, CloudWatch metriklerini yazdırdı. On dört sayfa. Sayıları okumaya kendine güvenmeden önce onları masasına yaydı. Sayfa ortasında sürprizler bulmaktansa her şeyi bir kerede görmek daha iyiydi.

Depolama denetimi 6.700 dolarlık biriken israf ortaya çıkarmıştı — kötü kararlardan değil, dikkatsizlikten. Bağlı olmayan birimler, eski snapshot'lar, kimsenin S3'e temizlemesini söylemediği sürüm geçmişleri, aylardır sessizce biriken tamamlanmamış multipart yüklemeler. Tom bunların hepsini düzeltmiş, otomatik temizlik kuralları uygulamış ve tablodaki bir sonraki sekmeye geçmişti. Veri katmanı, kalan en büyük bilinmeyendi: ilişkisel veritabanları, NoSQL tabloları, önbellek düğümleri, yedekleme depolaması ve haftalardır onu rahatsız eden bir kalem.

İnceleme altındaki veri katmanı kalemleri:

Aurora kümesi: 647 dolar/ay.
Eski RDS PostgreSQL okuma replikaları: 340 dolar/ay.
DynamoDB tabloları: 340 dolar/ay.
ElastiCache: 185 dolar/ay.
Aurora manuel snapshot'ları: 87 dolar/ay.

İnceleme altındaki toplam veri katmanı: 1.599 dolar/ay.

"Bir şeye karar vermeden önce her birini anlamama izin verin," dedi. "Çünkü veritabanı, köşeleri keserek para tasarrufu yapılacak yer değildir."

Bu akıllıcaydı. Veri kaybına veya performans düşüşüne neden olan veritabanı yanlış yapılandırması, tasarruflardan çok daha pahalıya mal olur.

Bir veritabanını bir arabanın motoru gibi düşünün. Daha ucuz yakıta geçerek, lastik basıncını ayarlayarak ve bagajdan gereksiz ağırlığı çıkararak bir arabadan para tasarrufu yapabilirsiniz. Ama bir yağ değişimini atlayarak para tasarrufu yapmaya çalışırsanız, motoru sıkıştırma riskini alırsınız — ve sıkışmış bir motor, herhangi bir yakıt tasarrufundan çok daha pahalıya mal olur. Tom'un yapmak üzere olduğu denetim aynı mantığı izler: bagajdaki ve yakıt deposundaki israfı bulun ve tam olarak ne yaptığınızı bilene kadar motora dokunmayın.

**Önce Veritabanı İş Yükünüzü Anlamak**

Veritabanlarında maliyet optimizasyonu, herhangi bir şeye dokunmadan önce iş yükünü anlamayı gerektirir. Tom bunu altı ay önceki bir ramak kaladan öğrenmişti: önce p95 sayılarına bakmadan, ortalama CPU kullanımına — %18 — dayanarak veritabanı instance boyutunu küçültmeye başlamıştı. Bir meslektaşı, CloudWatch metriklerini daha dikkatli kontrol etmesini istemişti. p95 CPU %61'di ve özellikle yoğun bir Cuma akşam yemeği telaşında %84'e ulaşmıştı.

"Ortalama, zirvede ne olduğunu söylemez," dedi Tom, Priya'ya anlatırken. "Ortalamaya göre doğru boyutlandırsaydım, Cuma geceleri kısıtlanırdık."

"Bu yüzden ortalamaya değil, p95'e bakarsın," dedi Priya. "Her zaman."

O ilke CPU'nun ötesine geçiyordu. Tom'un artık standart bir denetim öncesi kontrol listesi vardı:

- CPU: ortalama değil, p95
- Bellek: FreeableMemory (yüzde değil, mutlak bayt cinsinden) — limite ne kadar yakınız?
- Bağlantılar: son 30 günde DatabaseConnections maksimumu — bağlantı limitine ne kadar yaklaştık?
- Okuma/yazma oranı: Okuma replikalarının maliyetini hak edip etmediğini belirler
- Depolama büyüme oranı: Ayda kaç GB ekliyoruz?
- Replikasyon gecikmesi (replikalar için): Replika yetişiyor mu?

Temel sorular:

- Ortalama ve zirve CPU kullanımı nedir?
- Okuma/yazma oranı nedir?
- Depolama büyüyor mu, sabit mi, yoksa azalıyor mu?
- Okuma replikaları kullanılıyor mu?
- Instance yetersiz mi sağlanmış (yavaşlamalara neden oluyor) yoksa fazla mı sağlanmış (boş kapasite için ödeme yapılıyor)?

Tom, önceki 30 gün boyunca üç veritabanı hizmetinin de CloudWatch metriklerini çekti:

**Aurora kümesi**:

- Ortalama CPU: %18 (p95: %61; zirve: Cuma akşamları %84)
- FreeableMemory: mevcut 8GB'ın tutarlı olarak 4GB üzerinde. Endişe yok.
- Okuma/yazma oranı: 14:1 (okuma ağırlıklı)
- Depolama: 180GB (~5GB/ay büyüyor)
- DatabaseConnections maksimumu: mevcut 1.000'in 312'si. Rahat.

**Okuma replikaları (RDS PostgreSQL, Aurora'dan ayrı)**:

- Bunlar, Aurora geçişinden önce oluşturulmuş, hâlâ çalışan iki eski RDS okuma replikasıydı.
- Her birine ortalama bağlantı: günde 2. Ortalama CPU: %3.
- FreeableMemory: mevcut 8GB'ın 7,2GB'ı. Instance'lar neredeyse boştaydı.

"Bunlar neden hâlâ çalışıyor?" diye sordu Tom.

"Onları zaten dağıtmıştım — ah," dedi Leo. Instance oluşturma tarihlerine baktı. "Aurora geçişi sırasında yedek içindi. Onları hiç silmedim."

O an — pahalı bir şeyin aylarca kullanılmadan çalıştığı an — bulut ortamlarında tanıdık bir andır. Leo, replikaları bir güvenlik ağı olarak oluşturmuştu. Güvenlik ağına hiç ihtiyaç olmamıştı. Ama kimse şimdiye kadar soruyu sormamıştı.

"Bağlantı havuzu durumu ne?" diye sordu Priya, eğilerek. "Onları silmeden önce, herhangi bir uygulama bileşeni hâlâ oraya okuma yönlendiriyor mu?"

Tom bağlantı loglarını kontrol etti. Günde iki bağlantı, Priya'nın on dört ay önce yazdığı bir izleme betiğinden geliyordu — bilinen tüm veritabanı uç noktalarını yanıt verip vermediklerini doğrulamak için yokluyordu. Replikalar yalnızca sağlık denetleyicisi tarafından sorgulanıyordu, herhangi bir gerçek uygulama trafiği tarafından değil.

"Onları sil," dedi Maya.

Replikalar sonlandırıldı. Aylık tasarruf: 340 dolar.

**Bağlantı Havuzu Ramak Kalası**

Bağlantı metrikleri açıkken, Tom tüm veritabanı uç noktaları genelinde daha geniş bir kontrol yaptı. Bulduğu şey onu durdurdu.

Aurora yazıcı uç noktası 312'lik bir DatabaseConnections maksimumu gösterdi. Rahat. Ama okuyucu uç noktası farklı bir hikâye anlatıyordu.

"Okuyucu uç noktası üç ardışık Cuma gecesi 847 bağlantıya ulaştı," dedi Tom.

"Limit kaç?" diye sordu Priya.

"Mevcut instance sınıfımızın limiti 1.000. 847'ye ulaştık. Bu, limitin %85'i."

"Ve fark etmedik çünkü %90'a kadar alarm verilmiyordu?" diye sordu Maya.

"Hiç alarm verilmiyordu," dedi Tom. "Okuyucu uç noktası bağlantılarında CloudWatch alarmı yok. Bunu sadece ham metriklere baktığım için buldum."

1.000 bağlantıda, veritabanı yeni bağlantıları reddeder. O anda bir veritabanı bağlantısı edinmeye çalışan herhangi bir uygulama iş parçacığı bir istisna fırlatır. O istisna zarif bir şekilde ele alınmazsa, kullanıcı bir 500 hatası görür.

"Bir Cuma gecesi olayından otuz saniye uzaktaydık," dedi Leo. "Arka arkaya üç kez."

"O eşik aşıldığında ne olacağını düşündük mü?" diye sordu Priya.

"Restoran ortakları akşam yemeği telaşında başarısız siparişler görür," dedi Maya. "Bu teorik bir endişe değil."

Tom hemen bir CloudWatch alarmı kurdu: 750 bağlantıda (limitin %75'i) uyar, 900'de (%90) çağrı gönder. Ayrıca okuyucu uç noktası için RDS Proxy uyguladı — RDS Proxy, uygulama katmanından veritabanı bağlantılarını havuzlar ve yönetir, yani elli uygulama iş parçacığı on veritabanı bağlantısını paylaşabilir. Proxy, çoğullamayı halleder. Uygulama yoğun yük altında olsa bile veritabanı çok daha az bağlantı görür.

"Aurora Serverless v2 için RDS Proxy, ACU başına saatte 0,015 dolar fiyatlandırılır, proxy başına minimum 8 ACU ücretiyle," dedi Tom. "Ama bir bağlantı limiti ihlali bir Cuma gecesi tek bir kısmi kesintiye bile neden olursa, Nimbus'a itibar maliyeti büyüklük dereceleriyle daha yüksek olur."

"Bu ayda ne kadara mal oluyor?" diye sordu Tom kendi kendine, sayıyı hesaplayarak. Okuyucuları Serverless v2'de çalışıyor, dolayısıyla proxy 8 ACU minimumuna göre faturalandırılır: 0,015 × 8 × 730 = 87,60 dolar/ay. Bu, ödemekten memnun olduğu bir maliyetti.

Şunu merak ediyor olabilirsiniz: Serverless v2'nin otomatik ölçeklendirmesiyle zaten para tasarrufu yapıyorsak, neden sağlanmış katman için Rezervasyonlu Instance'larla uğraşalım? Cevap, Serverless v2'nin ölçeklendirmesinin bir maliyeti olmasıdır — planlasanız da planlamasanız da ACU-saat başına ödersiniz. Sabit Aurora yapılandırmaları çalıştıran ekipler için, RI taahhüdü değişken maliyeti tahmin edilebilir maliyete dönüştürür. Sağlanmış instance'lar (Serverless v2 değil) çalıştıran ekipler için, bu ayrım önemli ölçüde fark eder.

**RDS Rezervasyonlu Instance'lar: Sağlanmış Veritabanı Katmanları İçin**

EC2 gibi, RDS de taahhütlü kullanım için Rezervasyonlu Instance'lar sunar.

Sabit Aurora instance yapılandırmaları (Serverless v2 değil) kullanan ekipler için, Rezervasyonlu Instance'lar %30-60 tasarruf sağlayabilir. Sağlanmış RI yaklaşımı şöyle çalışır: saatlik orandaki önemli bir indirim karşılığında belirli bir instance türüne 1 veya 3 yıl taahhüt edersiniz.

Örnek olarak: On-Demand olarak 0,26 dolar/saatten bir db.r6g.large yazıcı instance'ı ayda 190 dolar eder. Aynısı için 1 yıllık bir Rezervasyonlu Instance bunu yaklaşık 108 dolar/aya düşürür — instance başına ayda 82 dolar, yani veritabanı instance'ı başına yılda yaklaşık 1.000 dolar tasarruf.

**Aurora Serverless v2 vs Standart RI — Başabaş**

Tom, kendi özel Aurora yapılandırmaları için sayıları hesapladı. Soru: Aurora Serverless v2'nin otomatik ölçeklendirmesi yeterli fayda sağlıyor muydu, yoksa Rezervasyonlu Instance taahhüdü olan sabit bir sağlanmış instance daha mı ucuz olurdu?

Serverless v2 fiyatlandırması: ACU-saat başına 0,12 dolar. Kümeleri 0,5 ACU (boşta) ile 16 ACU (zirve yükü) arasında ölçekleniyordu. Son 30 günde ortalama 4,2 ACU'ydu.

Aylık Serverless v2 maliyeti: yazıcı için 4,2 ACU × 0,12 dolar × 730 saat = 368 dolar/ay.

Karşılaştırın: 1 yıllık RI ile sabit bir db.r6g.xlarge (hafta içi p95 yükünü kaldıracak şekilde boyutlandırılmış, tahmini sağlanmış eşdeğerleri): 0,52 dolar/saat × 0,60 (RI indirimi) × 730 = 228 dolar/ay.

"RI daha ucuz," dedi Leo.

"Sabit bir yük için, evet," dedi Tom. "Ama dağılıma bak. Düşük trafik dönemimiz — Pazartesi'den Perşembe'ye, 02.00–07.00 — ortalama 0,8 ACU. Sabit bir sağlanmış instance'ta, o saatlerde kullandığımızın çok katı için ödeme yapardık, sadece boşta dururken."

"Ve Serverless v2 eşleşmek için aşağı mı ölçeklenir?"

"0,5 ACU'ya. Boşta maliyeti, zirve için boyutlandırılmış bir sağlanmış instance için ödeyeceğimizin küçük bir kısmı."

Başabaş hesabı: Serverless v2, zirve/temel oranınız yaklaşık 4:1'in üzerinde olduğunda daha ucuzdur. Cuma zirveleri 16 ACU ve Pazartesi sabahı minimumları 0,8 ACU olan Nimbus için — 20:1 oranı — Serverless v2 doğru seçimdi. Trafikleri daha tutarlı olsaydı (diyelim ki 8 ACU ± %20), sağlanmış bir RI daha ucuz olurdu.

"Bu sadece bu ay hangi sayının daha küçük olduğuyla ilgili değil," dedi Tom. "Hangi modelin büyümemizi doğru bir şekilde ele aldığıyla ilgili. Önümüzdeki çeyrekte %50 büyürsek, Serverless v2 sadece yukarı ölçeklenir. Bir sağlanmış RI yeniden boyutlandırma gerektirir ve geçiş sırasında kullanılmayan boşluk için ödeme yapardık."

Tom, ekibin sadece sonucu değil mantığı takip edebilmesi için yıl boyu karşılaştırmayı açıkça çıkardı.

**Ay ay Aurora maliyeti: Serverless v2 vs sağlanmış RI**

Sağlanmış seçenek: 1 yıllık Rezervasyonlu Instance ile bir db.r6g.xlarge. Maliyet: 0,52 dolar/saat On-Demand × 0,60 (RI indirimi) × 730 saat = 228 dolar/ay. Yükten bağımsız, sabit.

Serverless v2 seçeneği: 0,12 dolardan ACU-saat başına öde. Değişken, gerçek yükü takip eder.

Tom, CloudWatch'tan 30 günlük Aurora Serverless v2 ACU metriklerini çekti ve bir dağılım oluşturdu:

- 02.00–07.00, Pazartesi–Perşembe (düşük trafik): ortalama 0,8 ACU → 0,096 dolar/saat
- 07.00–11.00, hafta içi (orta): ortalama 3,2 ACU → 0,384 dolar/saat  
- 11.00–21.00, hafta içi (zirve iş saatleri): ortalama 5,8 ACU → 0,696 dolar/saat
- Cuma 18.00–22.00 (akşam yemeği telaşı): ortalama 14,1 ACU → 1,692 dolar/saat
- Cumartesi 12.00–20.00 (hafta sonu yoğun): ortalama 9,3 ACU → 1,116 dolar/saat
- Pazar (en hafif gün): ortalama 2,1 ACU → 0,252 dolar/saat

Tüm ay boyunca ağırlıklı ortalama: 4,2 ACU → 0,504 dolar/saat → 368 dolar/ay.

Sağlanmış bir RI'da: 228 dolar/ay. Serverless: 368 dolar/ay. Sağlanmış seçenek ayda 140 dolar tasarruf ediyordu.

"Bu apaçık görünüyor," dedi Leo. "Neden Serverless'ta kalıyoruz?"

"Çünkü 368 dolar ortalama," dedi Tom. "Cuma akşamlarına bak."

Cuma 18.00–22.00: ortalama 14,1 ACU. O dört saatlik pencere için, Serverless saatte 1,692 dolara mal oluyor. 228 dolar/aylık sağlanmış bir db.r6g.xlarge'ın 32 GiB belleği var — yaklaşık 16 ACU'ya eşdeğer. Serverless kümesi o pencere boyunca ortalama 14,1 ACU çalıştırıyor, xlarge'ın tavanına hiç boşluk bırakmadan dayanıyordu.

"Cuma zirvemiz için gerçek boşlukla boyutlandırılmış sağlanmış bir instance bir db.r6g.2xlarge olurdu," dedi Tom. "RI oranında, bu 1,04 dolar/saat × 0,60 = 0,624 dolar/saat. Aylık: 456 dolar/ay."

"Bu, 368 dolarlık Serverless ortalamasından fazla," dedi Maya.

"Doğru. Ve sağlanmış instance'ı hafta içi temeline göre boyutlandırsaydık — db.r6g.xlarge — Cuma geceleri bir sorun olurdu. Zirve yükünde, xlarge'ın tüm kapasitesine karşı 14 ACU eşdeğerine ulaşırdık. Bu, doygunluk."

"Yani zirve için önceden boyutlandırman gerekir," dedi Priya.

"Haftanın diğer 160 saatinde boşta kapasite için ödeme pahasına," dedi Tom. "Daha ucuz çıkan sağlanmış RI hesabı yalnızca zirve/temel oranınız düşük olduğunda işe yarar. Bizimki 20:1. Bu, tam olarak Serverless v2'nin tasarlandığı senaryo."

Sayıları yan yana gösterdi:

| Seçenek | Ortalama ay | Sakin gece (02.00) | Cuma telaşı (20.00) |
|---|---|---|---|
| Serverless v2 | 368 $ | 0,096 $/saat | 1,692 $/saat |
| Sağlanmış RI (r6g.xl) | 228 $ | 228 $/730saat = 0,312 $/saat | sınırlı — doygunluk riski |
| Sağlanmış RI (r6g.2xl) | 456 $ | 0,624 $/saat | rahat boşluk |

"Serverless seçeneği 368 dolar," dedi Tom. "Doğru boyutlandırılmış sağlanmış seçenek 456 dolar — ve bu, önümüzdeki çeyrekte trafik örüntülerimiz değiştiğinde sağlanmış instance'ı izleme ve manuel ölçeklendirmenin operasyonel maliyetini hesaba katmadan önce."

"Ve operasyonel maliyet," dedi Priya, "hiç de azımsanmayacak bir şey değil."

"Hayır. Serverless ile instance boyutlandırmayı düşünmek zorunda değiliz. Aurora halleder. Sağlanmış ile, her çeyrek mevcut instance sınıfının hâlâ trafiğimize uyup uymadığını yeniden değerlendirmem gerekir. Bu zaman açısından pahalı değil ama dikkat etmeyi bırakırsak yanlış gidebilecek bir şey."

"Onu yeniden boyutlandırmayı unutmadığımız sürece iyi olacak," dedi Leo, sonra kendini yakaladı. "Ki bu tam olarak iyi olmayacağı an."

"Aynen," dedi Tom.

Sonuç geçerliydi: ayda 368 dolara Serverless v2, Nimbus'un 20:1 zirve/temel oranı ve ekibinin operasyonel basitlik tercihi için doğru seçimdi. Sağlanmış RI yalnızca önemli ölçüde değişmeyen trafiğe sahip ekipler için cazipti — sağlanmış instance'ın nadiren boşta kaldığı 2:1 veya 3:1 oranı.

"Bizi sağlanmışa geçmeye ne iter?" diye sordu Maya.

"Trafik örüntümüz düzleşirse," dedi Tom. "Nimbus, düşük trafik temelinin de yüksek olduğu noktaya kadar büyürse — diyelim ki 02.00'de 0,8 yerine 8 ACU — oran 2:1'e düşer ve sağlanmış ekonomik olarak mantıklı hale gelir. Bu farklı bir iş sorunu. Sahip olmak isteyeceğimiz bir sorun."


Serverless v2'li Aurora için Rezervasyonlu Instance'lar doğrudan geçerli değildir — Serverless v2 dinamik olarak ölçeklenir ve siz ACU-saat başına ödersiniz. Bu, Nimbus'un mevcut yapılandırmasıdır: birincil Aurora yazıcısı ve okuyucusu ikisi de Serverless v2 kullanır. Nimbus için tasarruflar, Serverless v2'nin kendi otomatik ölçeklendirme doğasından gelir — trafik düşük olduğunda kullanılmayan kapasite için ödeme yapmazsınız.

Hâlâ sabit Aurora instance'ları çalıştıran ekipler, instance türü üç veya daha fazla ay boyunca kararlı kaldığında RI taahhüdünü değerlendirmelidir.

**DynamoDB: On-Demand vs Provisioned**

Bölüm 9'da, DynamoDB'nin iki kapasite modunu tanıttık: on-demand ve provisioned.

Nimbus, başından beri DynamoDB'yi on-demand modunda çalıştırıyordu. Düşük trafikte bu doğruydu — on-demand, istek başına daha pahalıdır ama minimum ücreti yoktur.

Şimdi, CloudWatch'ta 18 aylık trafik verisiyle, Tom örüntüleri görebiliyordu.

Ortalama okuma istekleri: saniyede 225 (günde yaklaşık 19,4 milyon)
Ortalama yazma istekleri: saniyede 60 (günde yaklaşık 5,2 milyon)
Zirve gün (Cuma): ortalama DynamoDB isteklerinin %180'i (ElastiCache okumaların ~%95'ini emer, dolayısıyla DynamoDB genel 25 kat sipariş hacmi zirvesinin yalnızca bir kısmını görür)

**On-demand fiyatlandırması**: milyon yazma isteği başına 1,25 dolar, milyon okuma isteği başına 0,25 dolar.
**Provisioned fiyatlandırması**: yazma kapasitesi birimi başına saatte 0,00065 dolar, okuma kapasitesi birimi başına saatte 0,00013 dolar.

Tom başabaş noktasını hesapladı: provisioned kapasite, boş dönemlerde on-demand primini ödemeyecek kadar tutarlı kullandığınızda daha ucuz hale gelir.

(Bu bölümdeki sayılar hakkında bir not: ekibin o zamanki faturasını yansıtırlar ve örnekleyicidir. 2024 sonunda, AWS DynamoDB on-demand fiyatlarını %50 düşürdü, bu da başabaşı önemli ölçüde kaydırdı — bugün, provisioned kapasite yalnızca kullanım tutarlı olarak yüksek olduğunda kazanır. Bu hesabı her zaman güncel fiyatlarla yeniden yapın.)

Tutarlı günlük örüntüler gösteren 18 aylık veriyle, **DynamoDB Auto Scaling** ile provisioned kapasite doğru seçimdi:

- Minimum kapasiteyi ortalama yükün %60'ına ayarla
- Maksimumu ortalamanın %250'sine ayarla (Cuma zirvelerini halleder)
- Auto Scaling, sağlanmış kapasiteyi bu sınırlar arasında ayarlar

Aylık DynamoDB maliyeti: 340 dolardan (on-demand) 230 dolara (otomatik ölçeklendirmeli provisioned) düştü. %32 azalma.

"Dur — ama bunu *neden* böyle yapalım ki?" diye sordu Maya. "Kendi trafik örüntülerimize güvenmediğimiz için başından beri on-demand'deyiz. Ne değişti?"

"On sekiz aylık veri," dedi Tom. "Artık örüntülerimizin nasıl göründüğünü biliyoruz — tutarlı hafta içi temeli, Cuma zirveleri, Pazar sakin dönemleri. Bilmediğimizde on-demand doğru karardı. Artık bildiğimize göre Auto Scaling'li provisioned doğru karar."

"Ama fazla sağlarsak," diye sordu Leo, "kullanılmayan kapasite için ödeme yaparız."

"Risk bu," dedi Tom. "Auto Scaling ile, minimumu kısıtlamayı önleyecek kadar yüksek ayarlarız ve AWS'nin aralığımız içinde yönetmesine izin veririz."

"Ve trafik örüntümüz önemli ölçüde değişirse?"

"O zaman sınırları ayarlarız. Bunu üç ayda bir gözden geçiririz."

**ElastiCache: Doğru Boyutlandırma ve İbretlik Hikâye**

ElastiCache faturası: 185 dolar/ay. Her AZ'de bir cache.r6g.large Redis instance'ı (iki düğüm, birincil + replika).

CloudWatch metrikleri gösterdi:

- Ortalama bellek kullanımı: %34
- Zirve: %44

Instance fazla sağlanmıştı. Bir cache.m6g.large — r6g.large'ın yarısı kadar bellek — yükü boşlukla kaldırabilirdi.

Ama burada Tom durakladı. Bir önbelleği agresif şekilde doğru boyutlandırdığında önceki bir şirkette ne olduğunu hatırladı — ve ekibe tüm hikâyeyi anlattı, çünkü kendinizi onun ortasında bulmadan önce anlatılması gereken türden bir hikâyeydi.

Önceki şirketinde — finansal raporlama için bir SaaS platformu — ElastiCache kümesi bir cache.r6g.large'dı. İki düğüm, birincil ve replika. Ortalama bellek kullanımı: %26. Gözlemlenen zirve: %37. Onu işaretleyen nöbetçi mühendis hesabı yapmıştı: bir cache.m6g.large, gözlemlenen zirvenin %25 üstünde boşlukla yükü kaldırırdı. Tasarruf: 60 dolar/ay — o şirketin bölgesinde ve o zamanki düğüm neslinde fiyatlandırma, bugün Nimbus'taki eşdeğer farktan daha küçük. Değişiklik bir Salı onaylandı.

Ertesi ay, bir Perşembe akşamı saat 23.47'de, ay sonu mutabakat toplu işi başladı.

Mutabakat toplu işi üç ayda bir çalışıyordu. Her aktif hesabın önceki üç ayına ait işlem kayıtlarını çekiyor, onları topluyor, vergileri hesaplıyor ve mutabakat kayıtları yazıyordu. Önbellek, ara toplama durumunu — toplu iş ilerledikçe her hesabın çalışan toplamını — saklamak için kullanılıyordu. cache.r6g.large bunu hep kaldırmıştı. Doğru boyutlandırma kararını verirken kimse özellikle mutabakat toplu işi metriklerine bakmamıştı, çünkü toplu iş üç ayda birdi ve gözlem penceresi dört haftaydı.

cache.m6g.large instance'ında, maxMemoryPolicy `allkeys-lru` olarak ayarlanmıştı — bellek dolduğunda, Redis yer açmak için en az kullanılan anahtarı çıkarırdı. Bu, genel bir önbellek için doğru politikadır. Ama mutabakat toplu işi için, önbellekteki her anahtara aktif olarak ihtiyaç vardı. Bellek, m6g.large instance'ının 6,38 GB'ının %84'ünde dolduğunda, Redis anahtarları çıkarmaya başladı. Her çıkarma bir önbellek ıskasıydı. Her önbellek ıskası, çıkarılan değeri ham işlem kayıtlarından yeniden hesaplamak için altta yatan PostgreSQL veritabanına bir sorgu gönderdi.

Veritabanı bağlantı havuzu, mutabakat toplu işi yükü için değil, sabit durumlu trafik için yapılandırılmıştı. Çıkarmalar başladıktan dört dakika içinde, veritabanının 847 aktif bağlantısı vardı. Bağlantı limiti 1.000'di. 9. dakikada, ilk uygulama iş parçacıkları "too many connections" hataları görmeye başladı. 12. dakikada, veritabanı bağlantı havuzunu paylaşan üç hizmet — mutabakat toplu işi, gerçek zamanlı raporlama hizmeti ve müşteriye dönük API — hepsi etkilendi.

Nöbetçi mühendis 23.59'da yükseltti. Olay incelemesi 00.08'de başladı.

İlk yanıt: mutabakat toplu işi işlevi için Lambda zaman aşımını artır (mutabakat toplu işi kısmen Lambda tabanlıydı). Bu yanlıştı. Sorun zaman aşımı değildi.

İkinci yanıt: mutabakat toplu işini paralelleştirmek için ikinci bir Lambda işlevi ekle. Bu da yanlış. Daha fazla paralellik, daha fazla eşzamanlı önbellek erişimi demekti, bu da daha hızlı çıkarmalar demekti, bu da durumu daha kötü hale getirdi.

Üçüncü yanıt: veritabanı baskısını azaltmak için mutabakat toplu işini küçült. Bu biraz yardımcı oldu ama kök nedeni ele almadı.

Dördüncü yanıt, 02.31'de: cache.r6g.large'ı geri yükle. Bellek baskısı hemen düştü. Çıkarmalar durdu. Veritabanı bağlantı havuzu temizlendi. Mutabakat toplu işi 04.17'de, dört saatten fazla gecikmeyle tamamlandı.

Olay toplamı: rapor erişmeye çalışan müşteriler için dört saatlik düşük API performansı. Bir tam mutabakat toplu işi gecikti. Mühendislik zamanı: beş mühendis arasında yaklaşık 22 saat. Tahmini doğrudan maliyet: 40.000 dolar.

Ayda 60 dolarlık tasarruf, tek bir olayda 40.000 dolara mal olmuştu.

"Hata, doğru boyutlandırma kararı değildi," dedi Tom. "Karar, mevcut veriye dayanarak savunulabilirdi. Hata, gözlem penceresiydi. Dört haftalık metrik ölçtük. Mutabakat toplu işi üç ayda birdi. Yanlış zaman dilimine bakıyorduk."

"Peki bundan nasıl kaçınırsın?" diye sordu Maya.

"Şunu sorarsın: bu önbelleğin desteklediği en yüksek riskli işlem nedir? Ve o işlemin özel metriklerini bulursun. Ortalama hafta değil. Yükün en yüksek olduğu o özel hafta — veya ay — veya çeyrek. Ve buna göre boyutlandırırsın."

"Ve işlem nadir olduğu için metrikleri bulamazsan?"

"Cevap bu," dedi Tom. "Belirli bir yüksek yük senaryosu için metrikleri bulamıyorsan, doğru yanıt henüz doğru boyutlandırma yapmamaktır. Bir sonraki oluşumu bekle, onu yoğun şekilde enstrümante et, sonra gözlemlediğine göre boyutlandır."

Nimbus ElastiCache kümesinin kendi yüksek riskli işlemi vardı: Cuma akşam yemeği telaşı. Tom o veriye sahipti — üç ardışık Cuma gecesi, r6g.large'da %44 bellek kullanımına ulaşmıştı; yaklaşık 5,7 GB canlı veri. cache.m6g.large'ın 6,38 GB'ında, aynı çalışma kümesi zaten %90 civarında oturur — ve sipariş işleme boru hattındaki bir şey daha fazla önbellek alanı kullanmak için değişirse — yeni bir özellik, farklı bir önbellekleme stratejisi — %90, çıkarma bölgesine dönüşür.

Yine de sayıları hesapladı. cache.r6g.large'dan cache.m6g.large'a geçmek: ayda 730 saat çalışan, 0,127 dolar/saatten iki düğüme karşı 0,090 dolar/saatten iki düğüm. Large: 185 dolar/ay. m6g çifti: 131 dolar/ay. Potansiyel tasarruf: 54 dolar/ay. cache.m6g.large instance'ı staging'de iki hafta yük altında test etti. Bellek %71'de zirve yaptı — limite, rahatsız olacak kadar yakın.

Sonra alternatifi fiyatlandırdı: cache.r6g.large'ı koru ama Rezervasyonlu Düğümler satın al (1 yıllık taahhüt). On-Demand 185 dolardan Rezervasyonlu 120 dolar/aya. Tasarruf: instance türünü değiştirmeden 65 dolar/ay.

"Aynı instance boyutunda Rezervasyonlu Düğümlerde tasarruf edeceğim 65 dolar/ay gerçek bir tasarruf," dedi Tom. "cache.m6g.large'a geçerek tasarruf edeceğim 54 dolar/ay, Cuma akşam yemeği telaşını riske atıyorsa sahte bir ekonomidir — ve üstelik o kadar da tasarruf ettirmiyor. Bazen daha küçük bir instance'a doğru boyutlandırma bir performans olayını riske atar — Rezervasyonlu Düğümler, hiçbir riske girmeden daha fazla tasarruf sağlar."

r6g.large için Rezervasyonlu Düğümleri satın aldı.

"Daha güvenli seçenek aynı zamanda daha fazla tasarruf sağladığında," dedi Tom, "bu bir ödünleşim bile değil."

**RDS Yedekleme Saklama: Depolama Ödünleşimi**

RDS otomatik yedeklemeleri S3'te saklanır (veritabanı boyutunuzun %100'üne kadar depolama için ek ücret olmadan). Varsayılan saklama 7 gündür.

Nimbus'un 180GB Aurora veritabanı için 7 günlük yedekleme uygundu — testlerde o pencere içinde yedekten geri yükleyebilmişlerdi.

Ama Tom fark etti: ayrıca her önemli dağıtımdan kalan manuel snapshot'ları da süresiz olarak tutuyorlardı.

23 manuel snapshot, toplam 4,1TB snapshot depolaması.
Maliyet: Aurora yedekleme depolaması için 0,021 dolar/GB/ay = manuel snapshot depolamasında ayda yaklaşık 87 dolar.

Ortam başına (üretim, staging) son 3 manuel snapshot'ı tuttular. Gerisini sildiler — yaklaşık 1,1TB saklandı.
Tasarruf: 64 dolar/ay.

"Hiç kullanmadığımız sigorta için ayda 64 dolar ödüyorduk," dedi Leo.

"Gönül rahatlığı için ödüyorduk," diye düzeltti Tom. "Soru şu: ayda 64 dolar değerinde ne kadar gönül rahatlığı?"

"Uygun bir felaket kurtarma planıyla," dedi Priya, "aynı gönül rahatlığını 7 günlük otomatik yedekleme ve 3 manuel snapshot'tan elde edebilirsin."

"Katılıyorum. Artık."

**Varyasyon: Provisioned Ters Teptiğinde**

Trafik örüntünüz tutarlı ve tahmin edilebilirse, Auto Scaling'li provisioned kapasite on-demand'e göre %30 tasarruf sağlar. Ama yeni bir özellik piyasaya çıkar ve yazma hacminiz bir gecede 5 kat fırlarsa, Auto Scaling yetişmeden kısıtlanırsınız — Auto Scaling gözlemlenen trafiğe tepki verir, bu da bir gecikme olduğu anlamına gelir. Büyük bir özellik lansmanını çevreleyen haftalar için on-demand modunu korumak makul bir ödünleşimdir: biraz daha yüksek maliyet, trafik örüntülerinin gerçek zamanlı değiştiğini izlediğiniz bir dönemde kısıtlanma riski yok.

Kullanılmayan okuma replikalarını ortadan kaldırırsanız (Nimbus'un eski PostgreSQL replikaları gibi), tasarruflar anında ve net olur — ödünleşim yoktur, çünkü replikalar hiçbir değer sağlamıyordu. Ama trafiğin yalnızca %2'sini ele alan bir okuma replikasını ortadan kaldırmaya hevesleniyorsanız, o %2'nin bir zirve sırasında gidecek yeri olmadığında birincilde ne olacağını kontrol edin. Bazı okuma replikaları mevcut yük için değil, boşluk için vardır.

Sınavda, aynı mantık geçerlidir: sabit temelli iş yükü, rezervasyonlu kapasiteye işaret eder; ani artış ve boşta kalma, on-demand veya Serverless'a işaret eder.

**Veritabanı Optimizasyon Özeti**

| Hizmet                                           | Önce     | Sonra    | Aylık Tasarruf |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (analizden sonra Serverless v2 korundu)    | 647 $       | 647 $     | 0 $ (doğru model) |
| RDS Okuma Replikaları (kullanılmıyor)             | 340 $       | 0 $       | 340 $           |
| DynamoDB (On-Demand -> Provisioned + Auto Scaling) | 340 $       | 230 $     | 110 $           |
| ElastiCache (Rezervasyonlu Düğümler)              | 185 $       | 120 $     | 65 $            |
| Aurora manuel snapshot'lar                        | 87 $        | 23 $      | 64 $            |
| RDS Proxy (bağlantı güvenliği)                    | 0 $         | 88 $      | -88 $           |
| **Toplam**                                         | **1.599 $** | **1.108 $** | **491 $/ay** |

Ayda 491 dolarlık veritabanı tasarrufu. Yılda 5.892 dolar.

Tom bu sayıyı depolama temizliğinin (6.200 dolar/yıl), Bölüm 23'teki S3 yaşam döngüsü politikalarının (7.800 dolar/yıl) ve Tasarruf Planı tasarruflarının (14.200 dolar/yıl) yanına koydu.

Bugüne kadarki toplam optimizasyon etkisi: 34.092 dolar/yıl.

"Bu gerçek bir pist," dedi Maya.

"Ya da birkaç ciddi deney," dedi Priya.

"Ya da on iki aylık deney," dedi Leo.

Üçü de doğruydu.

## Güçlü Yönler ve Sınırlamalar

**Auto Scaling'li DynamoDB Provisioned**:

- Tahmin edilebilir, tutarlı iş yükleri için on-demand'den daha ucuz
- Auto Scaling, kalıcı olarak fazla sağlamadan değişkenliği halleder
- Kapasite sınırlarının uygun kalmasını sağlamak için izleme gerektirir

**RDS Rezervasyonlu Instance'lar / ElastiCache Rezervasyonlu Düğümler**:

- Kararlı, uzun süreli iş yükleri için önemli tasarruflar
- Kilitli taahhüt — ihtiyaçlarınız değişirse, kullanılmayan kapasite için ödeme yapmış olursunuz
- EC2 Standart RI'ların aksine, RDS RI'ları Rezervasyonlu Instance Piyasası'nda yeniden satılamaz — Piyasa yalnızca EC2'ye özeldir. Kullanılmayan bir RDS RI batık maliyettir, bu da boyutlandırma kararını daha önemli kılar

**Genel ilke**:

- Optimize etmeden önce her zaman kullanımı anlayın — ortalama değil, p95 kullanın
- Kullanılmayan kaynaklar (eski okuma replikaları gibi) en yüksek getirili optimizasyondur
- Doğru boyutlandırma, üretime uygulamadan önce staging'de doğrulamayı ve standart bir gözlem penceresinde görünmeyebilecek mevsimsel iş yükü örüntülerini kontrol etmeyi gerektirir
- Rezervasyonlu fiyatlandırma, iş yükü kararlılığına güven gerektirir

## Özet

Veritabanı denetimi, motora hiç dokunmadan 491 dolarlık aylık açığı kapattı — tasarruflar bagajdan geldi: boşta replikalar, unutulmuş snapshot'lar ve Nimbus'un büyüdüğü trafik örüntüleri için fiyatlandırılmış kapasite. Tom'un disiplini her kalemde geçerli kaldı: önce iş yükünü anla, sonra optimize et. Tek yeni gider, RDS Proxy, Cuma gecesi bağlantı sayılarının gerektirdiğini söylediği bir sigortaydı.

- **Önce denetle**: Herhangi bir veritabanı değişikliği yapmadan önce CloudWatch metriklerini çekin. Ortalamalar değil, p95 gecikme ve p95 CPU kullanın. FreeableMemory ve bağlantı maksimumlarını kontrol edin.
- **Kullanılmayan kaynakları silin**: Okuma replikaları, boştaki veritabanları ve artık gerekmeyen test instance'ları.
- **Bağlantı havuzunuzu izleyin**: DatabaseConnections'ta limitin %75'i ve %90'ında alarmlar kurun. Bağlantı çoğullaması için RDS Proxy'yi değerlendirin.
- **DynamoDB On-Demand vs Provisioned**: Tahmin edilemeyen trafik için On-Demand; tutarlı örüntüler için Provisioned + Auto Scaling.
- **ElastiCache doğru boyutlandırma**: Mevsimsel zirveler dahil gerçekçi zirve yükleri altında staging'de test edin. Agresif küçültme risk taşıdığında, Rezervasyonlu Düğümler aynı instance boyutunda tasarruf sunar.
- **RDS snapshot yönetimi**: Yalnızca ihtiyacınız olan snapshot'ları tutun. Manuel snapshot'lar silinmedikçe süresiz saklanır.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama (Alan 4, Görev 4.3)*

- **DynamoDB fiyatlandırma modları**: On-Demand = istek başına ödeme (daha yüksek birim maliyet, minimum yok). Provisioned = saat başına kapasite birimi başına ödeme (daha düşük birim maliyet, kapasite tahsis etmelisiniz). **DynamoDB Auto Scaling**, sağlanmış kapasiteyi otomatik ayarlar.
- **RDS Rezervasyonlu Instance'lar**: Tüm RDS motor türleri için mevcuttur. Multi-AZ dağıtımları Rezervasyonlu Instance kullanabilir (Multi-AZ'ye taahhüt edersiniz). 1 veya 3 yıllık süre.
- **ElastiCache Rezervasyonlu Düğümler**: EC2 Rezervasyonlu Instance'larla aynı taahhüt modeli. Küme başına değil, düğüm başına uygulanır.
- **RDS snapshot depolaması**: Otomatik yedeklemeler veritabanı boyutunun %100'üne kadar ücretsizdir. Manuel snapshot'lar S3'te GB başına aylık ücretlendirilir. Sınav senaryosu: "RDS depolama maliyetlerini azalt" → eski manuel snapshot'ları sil.
- **DynamoDB rezervasyonlu kapasite**: DynamoDB için de mevcuttur (1 veya 3 yıl boyunca belirli bir okuma/yazma kapasitesine indirimle taahhüt). Standart provisioned'dan farklı — bir bölgedeki tüm DynamoDB tablolarınız genelinde kapasite için ön ödeme yaparsınız.
- **Aurora Serverless v2 vs provisioned**: Serverless v2 otomatik ölçeklenir, değişken iş yükleri için idealdir. Rezervasyonlu Instance'lı provisioned, kararlı, tahmin edilebilir iş yükleri için daha ucuzdur.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

DynamoDB on-demand kapasitesini ne zaman, Auto Scaling'li provisioned kapasiteye karşı kullanmanız gerektiğini açıklayın. Bu kararı vermek için hangi bilgiye ihtiyacınız var?

*(İpucu: Trafik verisi açısından "tahmin edilebilir"in ne anlama geldiğini ve on-demand'in, provisioned'ın getirdiği hangi riski ortadan kaldırdığını düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket, bir mobil oyunun lider tablosu için bir DynamoDB tablosu çalıştırıyor. Trafik yıl boyunca çok tutarlı, aylar öncesinden planlanan mevsimsel bir etkinlik hariç (çeyrek başına bir hafta, oyuncular ilk gün boyunca katıldıkça normal trafiğin 10 katına ulaşıyor). Şirketin önceliği, uzun, tahmin edilebilir sabit durum dönemlerinde veritabanı maliyetlerini en aza indirirken bilinen etkinlik haftaları boyunca performansı korumak.

Bu gereksinimleri EN İYİ karşılayan DynamoDB kapasite stratejisi hangisidir?

A) Mevsimsel zirveleri kısıtlanmadan kaldırmak için on-demand kapasite  
B) Zirve mevsimsel seviyelerde ayarlanmış provisioned kapasite (her zaman 10 kat trafik için sağlanmış)  
C) DynamoDB Auto Scaling'li provisioned kapasite, mevsimsel zirve için ayarlanmış maksimum kapasiteyle  
D) Normal trafik seviyelerinde 3 yıl boyunca DynamoDB rezervasyonlu kapasite birimleri

**İpucu 1**: "Planlanmış, bilinen mevsimsel zirve hariç çok tutarlı trafik" — hangi mod her ikisini de verimli ele alır? (On-demand'in gücü *tahmin edilemeyen* trafiktir; bu trafik tahmin edilebilir.)

**İpucu 2**: Zirve dışında "maliyetleri en aza indir", her zaman 10 kat için fazla sağlayamayacağınız anlamına gelir.

**İpucu 3**: DynamoDB Auto Scaling, mevsimsel etkinlik için yukarı ölçeklenebilir ve sonrasında geri aşağı ölçeklenebilir.

**Cevap**: C

**Açıklama**: Auto Scaling'li provisioned kapasite, tabloyu gerçek trafiğe göre ölçeklendirir. Normal dönemlerde kapasite normal seviyelerdedir (düşük maliyet). Tarihleri önceden bilinen ve trafiği ilk gün boyunca kademeli olarak artan mevsimsel etkinlik sırasında, Auto Scaling artışı yapılandırılan maksimum seviyeye kadar takip eder (10 kat zirveyi halleder) ve ekip ayrıca ekstra boşluk olarak planlanan başlangıçtan önce minimumu da yükseltebilir. Etkinlikten sonra kapasite geri aşağı ölçeklenir. Bu, yılı domine eden sabit durum boyunca on-demand'den daha ucuzdur (on-demand istek başına daha pahalıdır) ve her zaman 10 kat için sağlamaktan daha ucuzdur.

**Neden A değil?** On-demand zirveleri kısıtlanmadan halleder, ama gücü *tahmin edilemeyen* trafiktir. Burada trafik çok tutarlı ve zirve planlanmış ve kademeli — sabit durum olan yılın ~%92'si için on-demand istek başına primini ödemek, normal dönemlerde maliyetleri en aza indirme önceliğiyle çelişir.

**Neden B değil?** Kalıcı olarak 10 kat sağlamak, sağlanan kapasitenin ~%90'ının yılın ~%92'sinde kullanılmadan durması anlamına gelir — hiç kullanılmayan kapasite için ödeme yapmak.

**Neden D değil?** Rezervasyonlu kapasite birimleri sizi normal trafik seviyelerine kilitler. 10 kat mevsimsel etkinlik sırasında, rezervasyonlu miktarın ötesinde kısıtlanırsınız ya da üstüne on-demand eklemeniz gerekir.

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama — Görev 4.3*

**Alıştırma 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus yeni bir özelliği değerlendiriyor: gerçek zamanlı sipariş sayılarını, saat başına geliri ve müşteri demografisini gösteren bir restoran analitik panosu. Bu veri, bir veritabanını dakikada yaklaşık 200 kez sorgular (analist başına her sayfa yenilemesinde bir sorgu, 10 analistle).

Şu anda analitik verisi Athena'da (S3). Panoyu Athena üzerine mi inşa etmeliler, yoksa veriyi bir veritabanına mı yüklemeliler? Bir veritabanıysa, hangisi (Aurora, DynamoDB, Redshift)?

Şunları göz önünde bulundurun: sorgu sıklığı, veri tazeliği gereksinimleri, sorgu karmaşıklığı (toplulaştırmalar, birleştirmeler) ve bu hacimde sorgu başına maliyet.

*(Tek bir doğru cevap yoktur. Amaç, analitik iş yükleri için veritabanı seçimi pratiği yapmaktır.)*

## Jenerik Sonrası Sahne

Tom, tam maliyet optimizasyonu özetini Maya'ya sundu.

Üç aylık çalışma. Belirlenen yıllık 34.092 dolar tasarruf, çoğu zaten uygulanmış.

"Kalan ne?" diye sordu Maya.

"Henüz emin olmadığım optimizasyonlar," dedi Tom. "Aurora yapılandırması belki daha da doğru boyutlandırılabilir ama taahhüt etmeden önce bir çeyrek daha veri istiyorum. Ve henüz tam olarak analiz etmediğim bir veri aktarımı sorusu var."

"Ağ maliyetleri."

"Evet. Sırada o var."

Maya sayılara baktı. "Tom, bir şey anlamak istiyorum. Bu optimizasyon — üç aydır üzerinde çalışıyorsun. Bu, zamanının önemli bir kısmı."

"Kabaca %30."

"Ve yılda yaklaşık 34.000 dolar buldun. Yani optimizasyon kendini — ne, birkaç aylık maaşında mı amorti ediyor?"

Tom ona baktı. "Aşağı yukarı."

"Ve ondan sonraki her yıl, saf tasarruf."

"Ya da saf yeniden yatırım," dedi. "Aynı etki."

Maya başını salladı. "Yapmanı istediğim şey bu. Sadece depolama ve veritabanlarında değil — her şeyde. Maliyet optimizasyonunu rolünün sürekli bir işlevi haline getir."

Tom işinin daha önce hiç bu şekilde tanımlandığını duymamıştı. Hem doğru hem de tatmin edici buldu.

Bir sonraki bölümde: kalan son maliyet kategorisi — ve neredeyse herkesi şaşırtan kategori.
