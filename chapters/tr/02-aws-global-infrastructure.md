# Bölüm 2: Sunucunuz Dünyanın Neresinde?

Ayağa kalkın. Yakında bir pencere varsa ona doğru yürüyün.

Dışarı bakın. Ne görüyorsanız — binalar, ağaçlar, bir otopark, birinin arka bahçesi —
bunların hiçbiri verilerinizin yaşadığı yer değil. Verileriniz tamamen başka bir yerde
yaşıyor. Muhtemelen hiç gitmediğiniz bir yerde.

Bu bir sorun değil. Ama *nerede* olduğunu anlamak, şaşırtıcı sayıda şeyin yerine oturmasını
sağlar.

Beyaz tahta oturumundan sonra karar verilmişti: Nimbus AWS kullanacaktı. Cevap buluttu. Ama
"bulut"un belirli bir konumda belirli bir şey olduğu ortaya çıktı — ve Leo o konumu
istemeden seçmişti.

Ertesi sabah Maya, sunucunun Singapur'da olduğunu fark etti.

"Neden Singapur?" diye sordu.

"Varsayılan ayardı," dedi Leo.

Tom kahvesinden başını kaldırdı. "Tüm müşterilerimiz Batı Yakası'ndayken Singapur'da bir
sunucu çalıştırmanın maliyeti ne?"

Leo'nun cevabı yoktu.

Priya'nın zaten farklı bir endişesi vardı. "Ve o verinin hangi yargı bölgelerinden geçtiğini
kim bilebilir?"

Bu bölüm o kararı düzeltmek — ve neden önemli olduğunu anlamak — hakkında.

**"Bir Yer"in Sorunu**

AWS kullandığınızda, tek bir veri merkezi kullanmıyorsunuz. Bunlardan oluşan küresel bir ağ
kullanıyorsunuz. AWS'nin onlarca ülkede altyapısı var.

Bu sadece bir gerçek değil, bir özelliktir. Ama bu, bir seçim yapmanız gerektiği anlamına
gelir: altyapınızın *nerede* çalışmasını istiyorsunuz?

Seçim üç nedenle önemlidir:

**Performans.** Sunucularınız kullanıcılarınıza ne kadar yakınsa, yanıt o kadar hızlı olur.
Fizik pazarlık kabul etmez. Veri, fiber optik kablolar boyunca ışık hızının kabaca üçte
ikisiyle yol alır. Seattle'dan Singapur'a gidiş-dönüş, sadece geçişte kabaca 170 milisaniye
sürer — uygulamanız henüz hiçbir şey yapmadan önce. Aynı istek Seattle'dan Oregon'a
(`us-west-2`) kabaca 20 milisaniye sürer. Fark bir yuvarlama hatası değil. Müşterilerin
sayfaların anında açılmasını beklediği — ve tek bir sayfanın birkaç gidiş-dönüş tetiklediği
— bir restoran sipariş uygulaması için, gidiş-dönüş başına 170 ms temel gecikme, hızlı bir
ürünle hantal bir ürün arasındaki farktır.

Tom telefonunu çıkardı, Nimbus uygulamasını açtı ve bir restoran sayfasını yükledi. Bir
kronometre uygulamasıyla süre tuttu.

"Neredeyse üç saniye," dedi.

Leo, sunucu günlüklerindeki gecikme dökümüne baktı. Sadece Singapur'a gidiş-dönüş —
veritabanı sorgularıyla hiçbir ilgisi olmadan — istek başına kabaca 170 milisaniye ekliyordu
ve uygulama sayfa başına birden fazla gidiş-dönüş yapıyordu.

"Peki sunucuyu Oregon'a taşırsak?" diye sordu Tom.

"Yirmi milisaniye," dedi Leo. "Belki daha az."

"Bu aylık ne kadar tutar?"

Fiyat farkı yüzde birkaçtı. Sıfır değil, ama ana değişken de değil. O öğleden sonra sunucuyu
`us-west-2`'ye taşıdılar.

"İzleme aracını zaten Singapur örneğine dağıttım," dedi Leo, yarı kendine. "Ay." Durdu. "Onu
bunun yerine Oregon'da kuracağım."

**Uyumluluk.** Bazı sektörlerin verinin nerede saklanabileceğine dair yasaları vardır. ABD
sağlık verilerinin ülke içinde kalması gerekebilir. Finansal verilerin belirli bir bölge
içinde kalması gerekebilir. Yanlış Bölge'yi seçmek yasal sorunlar yaratabilir.

Priya bunu, kimse istemeden önce araştırmıştı.

"GDPR," dedi, ertesi sabahki ayaküstü toplantıda notlarından başını kaldırarak. "Nimbus
Avrupa Birliği'nde müşterilere hizmet verirse — tek bir müşteri bile — onlarla ilgili kişisel
verilerin AB içinde ya da eşdeğer koruma sağlayan bir ülkede kalması gerekebilir. Bu isteğe
bağlı değil. Bu yasa."

"Biz bir restoran sipariş uygulamasıyız," dedi Leo. "California'da."

"Şimdilik," dedi Priya. "On sekiz ay içinde Avrupa'ya açıldığımızda ve bir buçuk yıldır
Avrupalı müşteri verilerini Oregon'da sakladığımızı fark ettiğimizde ne olacağını düşündük
mü?"

Bir duraklama.

"O zaman düzeltiriz," dedi Leo.

"Geriye dönük veri ikamet ihlallerini düzeltemezsin," dedi Priya. "İhlal çoktan gerçekleşmiş
olur."

Dramatik davranmıyordu. GDPR cezaları yıllık küresel gelirin %4'üne kadar çıkar. ABD sağlık
sektöründeki HIPAA ihlalleri, ihlal kategorisi başına yılda 2 milyon doların üzerine
ulaşabilir. Bunlar varsayımsal değil — büyük kurumsal bulut kararlarının altyapı
yapılandırmasıyla değil, uyumluluk haritalamasıyla başlamasının nedeni de bunlar.

Nimbus için ani düzenleyici risk düşüktü: ABD'li müşteriler, sağlık verisi yok, finansal
hizmet yok. Ama büyümeyi amaçlayan bir işletme için Bölge seçmek, büyümeyi göz önünde
bulundurarak seçmek demektir.

**Felaket dayanıklılığı.** Bir konumda elektrik kesintisi, deprem ya da ağ arızası olursa,
sisteminizin hayatta kalmasını istersiniz. Altyapıyı birden fazla konuma yaymak, yerel
felaketlere karşı kendinizi böyle korursunuz.

**AWS Altyapısını Nasıl Organize Eder**

AWS, küresel altyapısını iç içe geçmiş üç kavrama ayırır. Bunları, en büyükten en küçüğe
Rus iç içe geçen bebekleri gibi düşünün: açıldığında orta boy bir bebeği ortaya çıkaran
büyük bir bebek, o da açıldığında küçük olanı ortaya çıkarıyor. Her katman bir sonrakinin
içine yuvalanmış.

En dıştaki bebek, AWS'nin **Bölge** dediği şeydir. Bir Bölge'nin içinde bir
**Erişilebilirlik Bölgeleri** kümesi bulunur. Ve her ikisinden de bağımsız olarak, dünyanın
her yerine dağılmış hâlde **Kenar Konumları** vardır.

Her birini açalım.

**Bölgeler: Büyük Kutular**

Bir **Bölge**, AWS'nin bir veri merkezi kümesine sahip olduğu coğrafi bir alandır. Her Bölge
konumuna göre adlandırılır: `us-west-2` Oregon'dur, `us-east-1` Kuzey Virginia'dır,
`eu-west-1` İrlanda'dır, `ap-southeast-1` Singapur'dur — Leo'nun sunucusunun saklandığı yer.

Dünya genelinde neredeyse 40 Bölge vardır ve AWS düzenli olarak yenilerini ekler. AWS
genişledikçe liste büyümeye devam ediyor: Kuzey Amerika, Güney Amerika, Avrupa, Orta Doğu,
Asya Pasifik ve Afrika'da Bölgeler var. Her yeni Bölge tipik olarak açılmadan aylar önce
duyurulur, lansmanda en az üç Erişilebilirlik Bölgesi içerir ve tüm AWS hizmetlerinin orada
kullanıma sunulması birkaç yıl sürer.

Her Bölge tamamen bağımsızdır. `us-west-2`'deki veri, siz açıkça taşımadığınız sürece
`us-west-2`'de kalır. Bu, uyumluluk ve dayanıklılık için kritiktir — bir Bölge'deki büyük
bir kesinti otomatik olarak diğerlerini etkilemez. Kuzey Virginia'da elektrik şebekesini
bozan bir olay Oregon'u etkilemez. İrlanda'daki bir doğal afet Singapur'u etkilemez.
Bölgeler, fiziksel altyapı düzeyinde gerçekten birbirinden yalıtılmıştır.

Bu bağımsızlık o kadar tamdır ki, bir Bölge büyük bir kesinti yaşıyorsa, AWS yönetim konsolu
bile yavaş yüklenebilir — çünkü konsolun kendisi AWS altyapısında çalışır. Bunu bilmeye
değer: gerçek bir AWS olayı sırasında, ihtiyaç duyduğunuz izleme araçlarına tam da en çok
ihtiyaç duyduğunuz anda erişmekte zorlanabilirsiniz. Deneyimli ekiplerin kendi hizmetlerini
AWS'nin konsolundan bağımsız olarak izlemesinin nedenlerinden biri de budur.

"Yani Nimbus için `us-west-2`'yi mi seçmeliyiz?" diye sordu Tom.

Evet. Batı Yakası müşterilerini hedefleyen bir ABD işletmesi için, evet. Daha düşük gecikme
ve kullanıcılarınız daha hızlı yanıt alır.

"Singapur'dan ne kadar daha pahalı?" diye ekledi Tom.

Fiyat Bölge'ye göre değişir — genellikle yüzde birkaç. Doğru Bölge'nin performans ve
uyumluluk faydası, küçük fiyat farkına değer.

**Nimbus'un Az Kalsın Yanlış Yapacağı Bölge Seçimi Tartışması**

Ekip `us-west-2`'ye karar vermeden önce, `us-east-1`'in (Kuzey Virginia) daha mantıklı olup
olmadığına dair kısa bir tartışma yaşandı. O en eski Bölge, en büyüğü, AWS'nin yeni hizmetleri
ilk yayınladığı yer. Ayrıca çoğu fiyatlandırma sayfasında en ucuz Bölge. Tom bundan
hoşlandı.

"Ama kullanıcılarımız California, Oregon ve Washington'da," dedi Maya. "Sunucularımızı neden
ülkenin diğer ucunda çalıştıralım?"

"Daha ucuz," dedi Tom. "Ve daha çok hizmet mevcut."

"Dur — ama bunu *neden* öyle yapalım?" dedi Maya. "Kullanıcılarımız Batı Yakası'nda.
Sunucularımız Batı Yakası'nda olmalı. Fiyat farkı ne, yüzde altı mı? Yedi mi? Kaybedilen
müşterilerdeki fazladan gecikmeye, hesaplama faturalarında tasarruf edeceğimizden daha
fazla harcarız."

Haklıydı. Bir iş yükü için doğru Bölge, en çok önem taşıyan kullanıcılara en yakın
Bölge'dir — uyumluluk, hizmet kullanılabilirliği ya da fiyat farkı bu ödünleşimi haklı
çıkarmadıkça. Nimbus için bunların hiçbiri çıkarmıyordu.

Bu, küçük gibi hissettiren ama küçük olmayan bir karardır. "Varsayılan o" diye `us-east-1`'i
seçen ve sonra Batı Yakası kullanıcılarına Doğu Yakası'ndan hizmet veren ekipler, gerçek
performansı çöpe atıyor. AWS konsolu tarihsel nedenlerle `us-east-1`'i varsayar. Bu bir
tavsiye değildir.

**Erişilebilirlik Bölgeleri: Gerçek Yedeklilik**

İşin ilginçleştiği yer burası.

Her Bölge tek bir veri merkezi değildir. **Erişilebilirlik Bölgeleri** (ya da AZ'ler) denen,
birden fazla, fiziksel olarak ayrı veri merkezinden oluşan bir kümedir.

Oregon'un (`us-west-2`) dört Erişilebilirlik Bölgesi vardır: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Bunlar gerçek binalardır, anlamlı mesafelerle birbirinden
ayrılmıştır — birindeki bir yangının, selin ya da elektrik kesintisinin diğerlerini
etkilemeyeceği kadar uzakta, ama aralarındaki ağın son derece hızlı (tek haneli milisaniye
gecikme) olacağı kadar yakın.

"Anlamlı mesafe" ne kadar uzaktır? AWS kesin koordinatları yayınlamaz, ama bağımsız
araştırmacılar bir Bölge içindeki AZ'lerin tipik olarak onlarca mil ile ayrıldığını tahmin
ediyor — farklı elektrik şebekelerinde ve farklı fiber yollarda olacak kadar uzak, ama ışık
hızının senkron çoğaltma için sınırlayıcı bir etken hâline geleceği kadar da uzak değil.

Bu ayrım kasıtlı ve önemlidir. İki AZ aynı elektrik trafo merkezini paylaşsaydı, bir trafo
arızası her iki AZ'yi de aynı anda çökertirdi — yedekliliği ortadan kaldırırdı. Fiziksel
ayrım, ortak modlu arızaların (tüm bir coğrafi alanı etkileyen türden) öngörülebilir
riskler değil, gerçekten nadir olaylar olmasını sağlar.

Bu, AWS'i hiçbir tek veri merkezinin eşleşemeyeceği bir düzeyde güvenilir kılan mimaridir.

Priya öne eğildi. "Yani uygulamamızı iki Erişilebilirlik Bölgesi üzerinde çalıştırırsak ve
biri çökerse—"

"Diğeri çalışmaya devam eder," diye tamamladı Maya.

"Aynen."

Sessizce dinleyen Leo: "Ben her şeyi tek bir AZ'de dağıttım."

"Evet," dedi Priya. "Fark ettik."

Uygulamanızı birden fazla AZ'ye yaymak — **Çok-AZ dağıtımı** denir — AWS'deki en önemli
dayanıklılık kalıplarından biridir. Bölüm 18'de buna derinlemesine gireceğiz. Şimdilik
şunu anlayın: AZ'ler tam olarak bunu mümkün kılmak için vardır.

Bilmeye değer bir incelik: AZ adları (`us-west-2a`, `us-west-2b` vb.) AWS hesapları arasında
tutarlı değildir. Sizin hesabınızda `us-west-2a` olarak görünen, bir meslektaşınızın
hesabında `us-west-2a` olarak görünenden farklı bir fiziksel veri merkezi olabilir. AWS,
tüm müşterilerin "a"yı varsaydıklarında aynı fiziksel AZ'ye dağıtım yapmasını önlemek için
eşlemeyi rastgele yapar. Hangi fiziksel AZ'de olduğunuzu başka bir hesapla koordine etmeniz
gerekiyorsa (örneğin düşük gecikmeli hesaplar arası iletişim için), AWS AZ kimlikleri
sağlar — hesaplar arasında aynı fiziksel konuma eşlenen kararlı tanımlayıcılar. Adlandırılmış
AZ'ler (`2a`, `2b`) hesaba görelidir. AZ kimlikleri (`usw2-az1`, `usw2-az2`) fizikseldir.
Sınav bu ayrımı ara sıra test eder.

**Bir AZ Arızası Gerçekte Neye Benzer**

Bu soyut değil. Gerçek bir zaman çizelgesini adım adım anlatayım.

Bir salı günü saat 14.47. `us-west-2b`'ye güç sağlayan transformatörlerden birindeki bir
elektrik arızası, o veri merkezinde bir kesintiye neden olur. Olay öngörülmemiştir.

Nimbus tamamen `us-west-2b`'de çalışıyorsa:
- 14.47: EC2 örneği güç kaybeder. Veritabanı sunucusu güç kaybeder.
- 14.47: Nimbus uygulamasına gelen istekler bağlantı zaman aşımlarıyla başarısız olmaya
  başlar.
- 14.47: Tom'un izleme uyarıları tetiklenir.
- 14.50: Leo kurtarma sürecine başlar. `us-west-2a`'da yeni bir EC2 örneği başlatır.
- 15.05: Veritabanı, bir anlık görüntü geri yüklemesinden çevrimiçi olur.
- 15.12: Uygulama yeni veritabanı uç noktasını gösterecek şekilde yeniden yapılandırılır.
- 15.20: Nimbus tekrar trafik sunuyor.

Bu 33 dakikalık kesinti süresidir. Cuma akşam yemeği servisi sırasında, 33 dakika kayıp
siparişlerde binlerce dolara ve olay raporunda görünmeyen türden bir itibar zararına mal
olabilir.

Nimbus, düzgün Çok-AZ dağıtımıyla `us-west-2a` ve `us-west-2b` üzerinde çalışıyorsa:
- 14.47: `us-west-2b`'deki EC2 örneği güç kaybeder.
- 14.47: Application Load Balancer, sağlık kontrolleri aracılığıyla sağlıksız örneği tespit
  eder.
- 14.47: ALB, başarısız örneğe trafik yönlendirmeyi otomatik olarak durdurur.
- 14.47: Trafik `us-west-2a`'daki örneğe akmaya devam eder.
- 14.48: Auto Scaling Group bir yedek örnek başlatır.
- 14.55: Yedek, sağlık kontrollerini geçer ve filoya yeniden katılır.

Kesinti süresi: sıfır. Müşteri etkisi: sıfıra yakın. Tom'un izlemesi tetiklenir, ama Leo'nun
eylemi "her şeyi elle yeniden inşa et" değil, "izle ve kurtarmanın tamamlandığını onayla"dır.

Çok-AZ ile tek-AZ arasındaki fark budur. AZ sınırı, AWS'nin yedeklilik tasarımının
uygulamanızın dayanıklılığına dönüştüğü yerdir.

**Çok-AZ Güvenilirlik Matematiği**

AWS, her AZ'yi bağımsız olacak şekilde tasarlar — sadece fiziksel olarak değil, ayrı güç,
soğutma ve ağ iletişimiyle. Aynı Bölge'deki iki AZ'nin aynı anda arızalanma olasılığı, son
derece düşük olacak şekilde tasarlanmıştır.

Tek bir AZ'nin %99,9 kullanılabilirliği varsa (yılda yaklaşık 8,7 saat kesinti süresi), o
zaman arızaları bağımsız olaylar olarak ele alan iki-AZ'li bir mimarinin aynı arıza modu için
kabaca %99,9999 kullanılabilirliği vardır — AZ arızalarından yılda yaklaşık 31 saniye
kesinti süresi.

Pratikte, çoğu uygulama için sınırlayıcı etken AZ kullanılabilirliği değildir. Uygulama
kodu, dağıtım süreci ve veritabanıdır. Ama matematik, Çok-AZ'nin neden standart taban çizgisi
olduğunu gösterir: iki AZ üzerinde çalışmanın maliyeti mütevazıdır; kullanılabilirlik
iyileşmesi büyüktür.

**Kenar Konumları: Her Yerde Hız**

AZ'ler dayanıklılığı çözer. Ana Bölge'nizden uzak şehirlerdeki kullanıcılara içeriği hızlı
sunma sorununu çözmezler.

İşte **Kenar Konumları**.

Kenar Konumları küçük, hafif altyapı noktalarıdır — dünya genelinde 100'den fazla şehre
yayılmış 750'den fazla varlık noktası. Tam veri merkezleri değildir — uygulamanızı
çalıştıramazlar. *Yapabildikleri* şey, içeriği kullanıcılarınıza yakın önbelleğe almaktır.

Virginia'daki bir sunucuda depolanan bir menü görselini hayal edin. Tokyo'daki biri onu her
görmek istediğinde, istek Pasifik boyunca gidip geri döner. Kenar Konumları ile AWS, o
dosyanın bir kopyasını Tokyo'da saklayıp yerel olarak sunabilir — yüzlerce milisaniye yerine
milisaniyeler.

Bu, AWS'nin içerik dağıtım ağı olan CloudFront'un omurgasıdır. CloudFront'a Bölüm 13'te
gireceğiz. Şimdilik: Kenar Konumları, statik içerik için hızla ilgilidir.

Şunu merak ediyor olabilirsiniz: Kenar Konumları içeriği önbelleğe alıyorsa, verinizi kalıcı
olarak da saklıyorlar mı? Hayır. Kenar Konumları, içeriği daha hızlı sunmak için geçici
kopyalarını tutar — orijinal her zaman sizin Bölge'nizde yaşar. Önbellek süresi dolarsa ya
da içerik değişirse, Kenar Konumu kaynaktan yeni bir kopya alır.

Kenar Konumu ağı, Bölge ve AZ yapısından ayrıdır. Uygulamanızın *nerede çalıştığını*
düşündüğünüzde, Bölgeleri ve AZ'leri düşünürsünüz. İçeriğin kullanıcılarınıza *hızlıca*
nasıl ulaştığını düşündüğünüzde, Kenar Konumlarını ve CloudFront'u düşünürsünüz. Farklı
sorunları çözer ve farklı katmanlarda çalışırlar.

AWS'nin ayrıca **Bölgesel Kenar Önbellekleri** denen ilgili bir kavramı var — Bölge'niz ile
Kenar Konumları arasında bulunan daha büyük önbellek düğümleri. Bir şehirdeki bir Kenar
Konumunda bir dosyanın önbelleğe alınmış bir kopyası yoksa, ta Bölge'nize geri gitmek yerine
Bölgesel Kenar Önbelleğinden alır. Bu, kaynağınızdaki yükü azaltır ve daha az popüler içerik
için önbellek isabet oranlarını iyileştirir. Bölgesel Kenar Önbelleklerini doğrudan
yapılandırmazsınız — bunlar otomatik olarak çalışan CloudFront altyapısının bir parçasıdır.

Nimbus için pratik sonuç: ekip Bölüm 13'te CloudFront eklediğinde, her istekte Oregon'dan bir
müşterinin tarayıcısına yolculuk yapan menü görselleri, bunun yerine en yakın Kenar
Konumundan sunulacak — Teksas müşterileri için Dallas, Georgia müşterileri için Atlanta,
Illinois müşterileri için Chicago. Chicago'daki kullanıcı, menü görselini 2.000 mil yerine
300 mil ötedeki bir sunucudan alır. Fark ölçülebilir ve anlamlıdır.

**Önbelleğe Alınmış Kopyalar Hakkında Bir Uyarı**

Tüm hikâye Bölüm 13'e ait olsa da, şimdi işaretlemeye değer Kenar Konumları hakkında bir
ayrıntı var: önbelleğe alınmış bir kopya bir *kopyadır* ve kopyalar bayatlayabilir. Orijinal
Bölge'nizde değişirse, Kenar Konumu bir süre eski sürümü sunmaya devam edebilir. Ne kadar
süreyle ve bu konuda ne yapabileceğiniz, tam olarak bir CDN'nin size verdiği türden
kontrollerdir — ve Nimbus gerçekten CloudFront dağıttığında ekibin boğuşacağı şey de tam
olarak budur. Şimdilik sadece şunu taşıyın: içerik kullanıcıya yakın yaşayabilir ve "yakın"
bazen "biraz güncel değil" anlamına gelir.

**Bir Bölge Seçmek: Kıdemli Mühendisin Kontrol Listesi**

Nimbus bir gün Meksika ve Kolombiya'daki kullanıcılara hizmet vermek için genişlerse — bu
bölümün alıştırmalarında pratik edeceğimiz bir senaryo — Bölge kararı keyfi değildir.
Düşünce tarzı şöyle:

**1. Kullanıcılarınız nerede?**

Buradan başlayın. Kullanıcılarınızın çoğunluğuna en yakın Bölge'yi seçin. Gecikme, Bölge
seçiminin en doğrudan, en ölçülebilir etkisidir.

Bir kullanıcı ile bir sunucu arasındaki fiziksel mesafe, hafife alınması kolay bir şekilde
önemlidir. Singapur'a 170 ms'lik bir gidiş-dönüşe karşı Oregon'a 20 ms'lik bir gidiş-dönüş
soyut bir performans metriği değildir — anında hissettiren bir sayfa ile hantal hissettiren
bir sayfa arasındaki farktır. Ek radyo gecikmesi olan bir mobil cihazda, Singapur cezası daha
da artar. San Jose'deki bir kullanıcı için, başka herhangi bir etkeni düşünmeden önce bile
`us-west-2` (Oregon) doğru Bölge'dir.

**2. Uyumluluk gereksinimleri var mı?**

Sağlık, finans ve devlet iş yüklerinin genellikle katı veri ikamet kuralları vardır.
Seçmeden önce düzenleyici ortamınızı bilin. GDPR, AB sakinlerine ait kişisel verilerin yeterli
veri korumasına sahip yargı bölgelerinde — ya AB'nin kendisinde ya da yeterlilik kararına
sahip bir ülkede — saklanmasını gerektirir. HIPAA, ABD sağlık verileri için belgelenmiş
güvenceler gerektirir. Bunlar daha sonra yeniden ele alınacak isteğe bağlı değerlendirmeler
değildir.

Pratikte: düzenlemeye tabi herhangi bir iş yükü için bir Bölge seçmeden önce hukuk ekibinizle
konuşun. AWS, her Bölge için SOC 2, ISO 27001, PCI DSS ve HIPAA uygunluğu gibi sertifikalar
dâhil kapsamlı uyumluluk dokümantasyonu tutar. Ama sertifikalar size AWS'nin ne yaptığını
söyler; hukuk ekibiniz size bunun sizin belirli düzenleyici bağlamınız için yeterli olup
olmadığını söyler.

**3. Hangi hizmetlere ihtiyacınız var?**

Her AWS hizmeti her Bölge'de bulunmaz. Yeni hizmetler önce `us-east-1`'de yayınlanır. Belirli
bir hizmete ihtiyacınız varsa, hedef Bölge'nizin onu desteklediğini doğrulayın.

Bu kitaptaki hizmetler için bu daha az bir endişedir — tüm büyük hizmetler genel olarak
mevcuttur — ama daha yeni hizmetler, özel donanım (bazı GPU örnek türleri yalnızca belirli
Bölgelerde bulunur) ve AWS GovCloud (belirli düzenleyici gereksinimleri olan ABD devlet iş
yükleri için tasarlanmış ayrı bir Bölge) için önemlidir.

**4. Fiyat nedir?**

Bölgeler fiyat açısından değişir. `us-east-1` (Kuzey Virginia), ölçeği ve yaşı nedeniyle en
ucuz olma eğilimindedir. Güney Amerika biraz daha pahalıdır. Kesinleştirmeden önce AWS
fiyatlandırma sayfasını kontrol edin.

Fiyat farkı genellikle küçüktür — popüler Bölgeler arasında yüzde birkaç ile on. Nadiren
belirleyici etkendir. Ama binlerce örnek çalıştıran maliyet duyarlı bir iş yükü için, %5'lik
bir fiyat farkı bile zamanla birikir. Tom sayıyı kontrol eder ve hesaba katardı, tıpkı tüm
sayıları kontrol edip hesaba kattığı gibi.

**5. Çok-Bölge'ye ihtiyacınız var mı?**

Çoğu uygulama için, bir Bölge içinde birden fazla AZ yeterli dayanıklılıktır. Bir bölgesel
kesintinin bile kabul edilemez olduğu kritik uygulamalar için, çok-Bölge için tasarım
yaparsınız — ama bu önemli bir mimari taahhüttür. Bunu spekülatif olarak yapmayın.

"İkinci bir Bölge eklediğimizde kural ne?" diye sordu Leo.

"'Tüm bir AWS Bölgesi kullanılamaz hâle gelirse çalışır kalmalı' diyen belgelenmiş bir
gereksinimimiz olduğunda," dedi Priya. "'İyi olurdu' değil. Belirli bir gereksinim, belirli
bir iş gerekçesiyle, karmaşıklık ve maliyete karşı tarttığımız."

"Bu pratikte neye benziyor?"

"%99,99 çalışma süresi gerektiren bir SLA'lı müşteri sözleşmesi. Coğrafi yedeklilik için
düzenleyici bir zorunluluk. Gelir açısından gerçekten ölçebileceğimiz bir bölge kaybı
senaryosu. Sadece 'ya us-west-2 çökerse' değil."

Leo mevcut Nimbus mimarisine baktı. Hâlâ tek bir AZ'deydiler.

"Önce Çok-AZ," dedi.

"Önce Çok-AZ," diye doğruladı Priya.

**Kimsenin Konuşmadığı Sınırlama**

Bölgeler güçlüdür, ama önemli bir gerilim yaratırlar.

Birden fazla Bölge'de çalışmak gerçekten zordur.

Bölgeler arası veri çoğaltmanın gecikmesi vardır. İki Bölge'yi senkronize tutmak — Bölge
A'daki bir işlemin Bölge B'de anında görünür olması için — dağıtık sistemlerdeki en zor
sorunlardan biridir. AWS bunun için araçlar sağlar, ama para tutar ve operasyonel karmaşıklık
ekler.

Çoğu uygulama tek Bölge, birden fazla AZ ile başlamalı ve çok-Bölge'ye yalnızca açık bir
gereksinimleri olduğunda genişlemelidir: düzenleyici zorunluluklar, sıfıra yakın bölgesel
kesinti gerektiren sözleşmesel SLA'lar ya da gerçekten kıtalara yayılmış bir kullanıcı kitle.

Verileri bölgeler arası çoğaltmak maliyet ekler — bölgeler arası veri aktarımı, bir AWS
faturasındaki en çok hafife alınan kalemlerden biridir. Ayrıca operasyonel karmaşıklık ekler:
bölgeler arasında tutarlı olması gereken her yazma, gecikme ekler.

Gerçek uygulamaları etkileyen çoğu arıza bölgeler arası felaket değildir. Yanlış
yapılandırılmış bir güvenlik grubu ya da berbat bir dağıtım gibi bölge içi sorunlardır.
Dramatik "tüm bölge çöküyor" senaryosu, tam olarak nadir olduğu için manşetlere çıkar.
Çok-bölgeden önce çok-AZ'ye yatırım yapın. İş gerekçesi netleştiğinde çok-bölge ekleyin.

Buna somut sayılar koymak gerekirse: AWS'nin geçmişinde az sayıda önemli tek-bölge olayı
oldu. Tam bölgesel kesintiler gerçekten nadirdir. AZ düzeyindeki olaylar — bir bölge içindeki
bir veri merkezini etkileyen kısa kesintiler — daha az nadirdir ve tam olarak Çok-AZ
dağıtımının emmek için tasarlandığı şeydir. AZ olaylarının bölgesel olaylara kıyasla sıklığı
kabaca bir büyüklük mertebesi daha yüksektir. Mimari çabayı önce daha yaygın arıza moduna
harcamak rasyonel seçimdir.

Erken çok-Bölge mimarisi, junior mühendislerin kendilerine güven duymaya başladıklarında
yaptıkları en yaygın ve en pahalı hatalardan biridir.

Tom başını salladı. "Yani sadece yapabildiğimiz için çok-Bölge yapmıyoruz."

"İhtiyacımız olana kadar değil," dedi Maya. "Ve ihtiyacımız olduğunda anlayacağız."

"Nasıl anlayacağız?" diye sordu Leo.

"Mimari inceleme dokümanınızda 'bölgesel bir kesintiden sağ çıkmalı' diyen bir gereksinim
olduğunda," dedi Priya. "Daha Çok-AZ kurmadan önce tüm bir AZ çökerse ne olacağını düşündük
mü? Önce onu düzeltmeliyiz. O zamana kadar: çok-AZ."

Şunu merak ediyor olabilirsiniz: Çok-AZ dağıtımınızın ona ihtiyacınız olmadan önce gerçekten
çalıştığını nasıl doğrularsınız? Onu test edersiniz. AWS, **AWS Fault Injection Service
(FIS)** — eski adıyla Fault Injection Simulator — adında bir araç sağlar; bu araç,
çalışan mimarinize karşı AZ arızalarını, örnek sonlandırmalarını ve diğer arıza koşullarını
simüle edebilir — böylece davranışı gerçek bir olay sırasında keşfetmek yerine, sisteminizin
arıza koşulları altında nasıl davrandığını kontrollü bir şekilde gözlemleyebilirsiniz.
Dayanıklılık mimarinizi test etmek, onu inşa etmek kadar önemlidir. Priya, bunun hakkında
okuduktan hemen sonra "arıza enjeksiyon testi"ni üç aylık mimari inceleme takvimine koydu.

## AWS Size Geldiğinde: Outposts ve Wavelength

Bölgeler ve Erişilebilirlik Bölgeleri dünyayı kapsar — ama her sorun veriyi AWS'ye taşıyarak
çözülmez. Bazı iş yükleri yerinde kalmak zorundadır: milisaniyenin altında gecikmeye ihtiyaç
duyan üretim katı sistemleri, veri ikamet gereksinimleri olan sağlık uygulamaları, güvenilir
interneti olmayan mağazalardaki perakende satış noktası sistemleri. Bunlar için AWS,
altyapısını müşterinin konumuna uzatır.

"Dur — ya eninde sonunda bir hastane sistemiyle çalışırsak?" diye sordu Priya. "Hasta izleme
yazılımları tam anlamıyla bir bulut gidiş-dönüşünü kaldıramaz. Ve yasal olarak binadan
ayrılmasına izin verilmeyebilir."

Maya AWS dokümanlarını açtı. İki hizmet sürekli karşısına çıkıyordu.

**AWS Outposts**

Kendi veri merkezinize ya da co-location tesisinize kurulan, tamamen yönetilen bir AWS
donanım rafı. Outposts, AWS bulutuyla aynı AWS altyapısını, hizmetlerini, API'lerini ve
araçlarını çalıştırır — EC2, EBS, RDS, EKS, Outposts üzerinde S3 — ama fiziksel olarak sizin
binanızda.

Kullanım senaryoları: gecikmeye duyarlı üretim iş yükleri, verinin fiziksel olarak belirli
bir konumda kalması gereken veri ikamet gereksinimleri, AWS API'lerine ihtiyaç duyan ama genel
buluta bağlantı kesintilerini kaldıramayan uygulamalar.

Kilit nokta: Outposts hâlâ AWS tarafından yönetilir. AWS onu kurar, yamalar ve izler. Raf
alanı ve güç sizindir. API'ler ve araçlar genel bulutla aynıdır — aynı CloudFormation
şablonları, aynı IAM politikaları, aynı CLI komutları. Sınavdaki ayrım, operasyonel model
değil, fiziksel konumdur.

"Yani bu AWS, ama müşterimizin binasında," dedi Leo.

"Aynen," dedi Maya. "Aynı API'ler. Farklı posta kodu."

**AWS Wavelength**

Telekomünikasyon sağlayıcılarının 5G ağlarının içine dağıtılan AWS altyapısı. Wavelength
Bölgeleri, 5G ağlarının kenarında, mobil kullanıcılara fiziksel olarak yakın oturur ve mobil
uygulamalar için tek haneli milisaniye gecikme sağlar.

Kullanım senaryoları: gerçek zamanlı oyun, AR/VR, otonom araç telemetrisi, 5G kenarında
canlı video işleme.

"Bu bir hastane için değil," dedi Tom. "Bu, çok oyunculu mobil oyunların yeni neslini kuran
biri için."

"Ya da kendi kendine giden araba telemetrisi," dedi Priya. "Bir mobil cihazın bir sunucuyla
konuşması gereken ve 50 milisaniyenin çok yavaş olduğu her şey."

**Fark:** Outposts, AWS'i veri merkezinize getirir — sizin binanız, sizin rafınız, sizin
gücünüz. Wavelength, AWS'i telekom ağı kenarına getirir — 5G radyo altyapısıyla fiziksel
olarak ortak konumlandırılmış, özel ağınıza hiç dokunmayan mobil kullanıcılara yakın.

**AWS Local Zones**

Bu ailede üçüncü bir kardeş daha var — ve sınavda üçü arasında en sık test edileni o.
**Local Zones**, tam bir Bölge'si olmayan büyük metropol alanlarına dağıtılan AWS
altyapısıdır — Los Angeles, Houston, Miami, Lagos ve onlarca daha fazlası. Bir Local Zone,
bir ana Bölge'nin uzantısıdır: EC2, EBS ve diğer hizmetlerin bir alt kümesini *metropolün
kendisinde* çalıştırırsınız, o şehirdeki kullanıcılara tek haneli milisaniye gecikme
elde edersiniz, geri kalan her şey (ve tüm yönetim) ana Bölge'de kalır.

Ezberlenecek kalıp — üç "kenar hesaplama" kardeşi, üç tetikleyici:

- "**Belirli bir şehir/metropol alanındaki** son kullanıcılara tek haneli milisaniye gecikme"
  → **Local Zones**
- "**5G mobil cihazlar** için ultra düşük gecikme" → **Wavelength**
- "**Kendi veri merkezimizde** çalışan AWS hizmetleri / veri yerinde kalmalı" → **Outposts**

Üçünden hiçbiri tipik bir web uygulaması için cevap değildir. Hepsi SAA-C03 sınavında kalıp
eşleştirme tuzakları olarak çıkar: tetikleyici ifade önemlidir.

## Güçlü Yönler ve Sınırlamalar

**Çok-bölge ve çok-AZ tasarımını şu durumlarda kullanın**: uygulamanızın birden fazla
coğrafyada kullanıcıları var ve gecikme önemliyse; SLA'nız %99,99 veya daha yüksek
kullanılabilirlik gerektiriyorsa; düzenleyici gereksinimler belirli bölgelerde veri ikametini
zorunlu kılıyorsa; RTO'su bir saatin altında olan bir felaket kurtarmaya ihtiyacınız varsa.

**Ödünleşimler gerçektir**: Birden fazla Bölge'de çalışmak, bölgesel kesintilere karşı
yedeklilik verir — ama önemli maliyet ve karmaşıklıkla.

Bu bölümün önceki kısmındaki maliyet uyarısını hatırlayın: bölgeler arasında hareket eden
her bayt para tutar. Yazmaların tutarlı olması gereken aktif-aktif bir çok-bölge kurulumunda,
bu maliyeti sürekli ödüyorsunuz.

Operasyonel karmaşıklık da ölçeklenir. Bir bölgedeki bir olayda hata ayıklamak zordur.
Dağıtık, bölgeler arası bir olayda hata ayıklamak — aynı isteğin iki kıtadaki altyapıya
dokunduğu yerde — tamamen farklı türden bir zorluktur.

**Çoğu uygulama için doğru ilerleme**: Tek bir Bölge ve birden fazla AZ ile başlayın. Bu, size
gerçekten gerçekleşen arızalara karşı — AZ düzeyindeki kesintiler, donanım arızaları, güç
olayları — bir çok-bölge mimarisinin karmaşıklığının küçük bir kısmıyla dayanıklılık verir.
Belirli, belgelenmiş bir gereksinim gerekli kıldığında çok-bölge ekleyin. Daha önce değil.

Çok-bölgeye fazla erken atlayan ekiplerde yaygın kalıp: iki bölgeyi yönetmenin karmaşıklığı
kendi arıza modlarını getirir — veri senkronizasyon hataları, split-brain senaryoları,
tutarsız dağıtımlar. Arızaları önlemek için tasarlanan dayanıklılık mimarisinin kendisi,
bazen daha basit bir tasarımda var olmayacak yeni arıza kategorileri getirir.

Priya'nın "karmaşıklık bütçesi" dediği bir dokümanı vardı. Fikir şu: operasyonel karmaşıklık
ekleyen her mimari kararın bir maliyeti vardır ve kuruluşun o karmaşıklığı yönetmek için
sonlu bir kapasitesi vardır. Tek-bölge güvenilirliğinde ustalaşmadan önce karmaşıklık
bütçesini çok-bölge mimarisine harcamak kötü bir yatırımdır. Karmaşıklık, iyi felaket
kurtarma hikâyeleri yapanlara değil, gerçekten karşılaştığınız arıza modlarına gitmelidir.

"Tek bir bölgemiz, tek bir AZ'miz ve Leo'yu her çalıştırdığında tedirgin eden bir dağıtım
sürecimiz var," dedi Priya. "Doğru bir sonraki adım çok-bölge değil, çok-AZ."

Tom defterine "karmaşıklık bütçesi" yazdı. Bu ifadeyi sonraki iki yıl boyunca düzenli olarak
kullanacaktı.

## Özet

Leo'nun Singapur kazası yararlı bir ders olduğu ortaya çıktı — kalıcı zarar verdiği için
değil, ekibi genellikle atlanan bir şeyi anlamaya zorladığı için: altyapınızın nerede
çalıştığı kozmetik bir karar değildir. Fizik pazarlık kabul etmez. Gidiş-dönüş başına yüz
yetmiş milisaniye temel gecikme, hızlı bir ürünle hantal bir ürün arasındaki farktır ve
verinin nerede yaşadığına dair uyumluluk kuralları ne kadar hızlı taşındığınızı umursamaz.

- AWS, küresel altyapısını **Bölgeler**, **Erişilebilirlik Bölgeleri** ve **Kenar Konumları**
  olarak organize eder.
- Bir **Bölge**, coğrafi bir veri merkezi kümesidir. Her Bölge yalıtılmıştır — veri, siz
  açıkça taşımadıkça Bölge'de kalır.
- **Erişilebilirlik Bölgeleri**, bir Bölge içindeki fiziksel olarak ayrı veri merkezleridir,
  düşük gecikmeli ağ iletişimiyle bağlanmış. Birden fazla AZ'ye dağıtmak, yerel arızalardan
  sağ çıkmanın standart yoludur.
- Bölge'nizi kullanıcı konumuna, uyumluluk gereksinimlerine, hizmet kullanılabilirliğine ve
  fiyata göre seçin — bu sırayla.
- Çok-AZ, standart dayanıklılık taban çizgisidir. Çok-Bölge, belirli, belgelenmiş
  gereksinimleri olan kritik iş yükleri içindir — varsayılan bir başlangıç noktası değil.

## Sınav İpuçları

*SAA-C03 Alan 1 — Görev 1.1 / Alan 2 — Görev 2.2*

- **Bölgeler varsayılan olarak yalıtılmıştır.** Siz yapılandırmadıkça veri Bölgeler arasında
  çoğaltılmaz. Bu, veri egemenliği ve uyumluluk senaryoları için önemlidir.
- **AZ'ler çoğu soru için dayanıklılık birimidir.** Sınav bir veri merkezi arızasından nasıl
  sağ çıkılacağını sorduğunda, cevap bir Bölge içindeki birden fazla AZ'yi içerir.
- **Çok-Bölge, bölgesel kesinti dayanıklılığı içindir.** Senaryo "tüm bir AWS Bölgesi
  arızalansa bile çalışır kalmalı" diyorsa, cevap çok-Bölge mimarisini içerir.
- **Kenar Konumları ≠ AZ'ler.** Kenar Konumları içeriği önbelleğe alır — uygulama sunucunuzu
  çalıştıramazlar. Onları veri merkezleriyle karıştırmayın.
- Sınav, uyumluluk ile Bölge seçimi arasındaki ilişkiyi sık sık test eder. Bir senaryo veri
  ikamet gereksinimlerinden söz ediyorsa, Bölge seçimi cevabın bir parçasıdır.
- Sınavdaki **GDPR ve veri ikameti** senaryoları tipik olarak veriyi belirli bir Bölge içinde
  tutmaya ve bölgeler arası çoğaltmanın devre dışı bırakıldığından ya da kontrol edildiğinden
  emin olmaya işaret eder.
- **Outposts ve Wavelength ve Local Zones:** Outposts = veri merkezinizdeki AWS rafı (yerinde,
  veri ikameti, yerel gecikme). Wavelength = 5G ağ kenarındaki AWS (mobil kullanıcılar, ultra
  düşük gecikme). Local Zones = tam Bölge'si olmayan bir metropol alanındaki AWS hesaplaması.
  Sınav tetikleyicileri: "AWS'i kendi tesisinizde çalıştırın" → Outposts. "5G mobil
  kullanıcılar için ultra düşük gecikme" → Wavelength. "Belirli bir şehirdeki kullanıcılara
  tek haneli milisaniye gecikme" → Local Zones.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizle: Bir Bölge ile bir Erişilebilirlik Bölgesi arasındaki fark nedir?
Dayanıklı bir web uygulaması tasarlarken bu ayrım neden önemlidir?

*(İpucu: Her birinin koruduğu iki farklı arıza türünü düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir ABD sağlık şirketi, iç veri ikamet politikalarına uymak için tüm hasta
verilerini tek bir AWS Bölgesi içinde saklamak zorunda. Batı Yakası'nda yeni bir bulut
uygulaması tasarlıyorlar ve veriyi başka bir Bölge'ye taşımadan dayanıklılığı en üst düzeye
çıkarmak istiyorlar.

Hangi yapılandırma gereksinimlerini EN İYİ şekilde karşılar?

A) `us-east-1`'de dağıtın ve içeriği daha hızlı sunmak için Oregon'daki CloudFront Kenar
   Konumlarını kullanın  
B) Maliyetleri en aza indirmek için tek bir Erişilebilirlik Bölgesi'nde `us-west-2`'de
   dağıtın  
C) Bölgeler arası veri çoğaltmayla `us-west-2` ve `us-east-1` dâhil birden fazla Bölge'de
   dağıtın  
D) Birden fazla Erişilebilirlik Bölgesi üzerinde `us-west-2`'de (Oregon) dağıtın

**İpucu 1**: Politika, verinin tek bir Bölge'de kalması gerektiği anlamına gelir. Hangi
seçenekler veriyi başka bir Bölge'ye taşır?

**İpucu 2**: Veriyi `us-west-2`'de tutan seçenekler arasında hangisi en fazla dayanıklılığı
sağlar?

**İpucu 3**: Tek bir Bölge içindeki birden fazla AZ, Bölge sınırlarını geçmeden dayanıklılık
sağlar.

**Cevap**: D

**Açıklama**: `us-west-2` tüm veriyi tek bir Bölge'de tutarak politika gereksinimini
karşılar. O Bölge içinde birden fazla AZ'ye dağıtmak, veriyi başka bir Bölge'ye taşımadan
veri merkezi arızalarına karşı koruma sağlar. Bu, uyumluluk ile dayanıklılığın doğru
dengesidir.

**Neden A değil?** A seçeneği Batı Yakası kullanıcılarından uzak olan `us-east-1`'de dağıtır
— ve CloudFront, hasta-bitişik içeriği seçilen Bölge dışındaki Kenar Konumlarında önbelleğe
alarak ikamet politikasını ihlal eder.

**Neden B değil?** Tek bir AZ'nin dayanıklılığı yoktur. O AZ bir kesinti yaşarsa, uygulama
tamamen başarısız olur.

**Neden C değil?** `us-east-1`'e çoğaltmak hasta verilerini Doğu Yakası'na taşır, doğrudan
tek-Bölge gereksinimini ihlal eder.

*SAA-C03 Alan 1 — Görev 1.1 (küresel altyapı, veri egemenliği)*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus, Meksika ve Kolombiya'daki müşterilere hizmet vermek için genişliyor. Şu anda her şey
`us-west-2`'de çalışıyor. Ekip tartışıyor: ikinci bir `us-east-1` Bölge'si mi eklemeliler,
yoksa birden fazla AZ'li tek-Bölge'de mi kalmalılar?

Karar vermeden önce hangi soruları sorardınız? İkinci bir Bölge eklemenin ana maliyetleri ve
riskleri nelerdir? Bir tane *eklememenin* ana maliyeti nedir?

*(Tek bir doğru cevap yoktur. Çok-Bölge ödünleşim mantığını pratik edin.)*

## Jenerik Sonrası Sahne

Leo Singapur sorununu düzeltti. Nimbus `us-west-2`'ye taşındı. Gecikme düştü. Tom'un tek
takip sorusu — "bu faturamızı değiştirdi mi?" — biraz daha yüksek bir sayıyla yanıtlandı; bunu
gözle görülür bir isteksizlikle kabul etti.

Bu, bir sonraki soruna kadar iki gün sürdü.

Leo, ayaküstü toplantıya, Maya'nın tanımayı öğrendiği ifadeyle geldi: geri alamayacağı bir
şey yapmış birinin bakışı.

"Yani," dedi dikkatlice. "Sunucuyu kurdum. Ve giriş yapmak için bir yola ihtiyacım vardı.
Bu yüzden bir kullanıcı adı oluşturdum."

"Ve?" diye sordu Priya.

"'Admin'."

Sessizlik.

"Peki şifre?"

Daha uzun bir sessizlik.

"'Admin123'."

Priya ayağa kalktı.

Bir sonraki bölümde: Nimbus'un neye kimin dokunabileceğini nasıl kontrol ettiği — ve bunu
yanlış yaptıklarında ne olduğu.
