# Bölüm 32: Planı Savunmak

Carlos, Well-Architected oturumundan birkaç hafta sonra geri dönmüştü. Bu sefer dizüstü bilgisayar çantasında kaldı; bunun yerine bir beyaz tahta kalemi aldı, odadaki herkesi selamladı, tahtanın yanında bir yer buldu ve kalemin kapağını açtı.

"Bana Nimbus'tan bahsedin," dedi. Sanki onu hiç duymamış gibi.

**Özet: İncelemeden Hesaplaşmaya**

Bölüm 31'deki Well-Architected incelemesi, üç yüksek riskli bulgu ve Maya'nın, ekibin verdiği kararlar ile *enine boyuna düşündüğü* kararlar arasında bir uçurum olduğuna dair giderek artan farkındalığını ortaya çıkarmıştı. Çerçeve onlara bu uçurum için bir sözcük dağarcığı vermişti. Veremediği şey, onu gerçek zamanlı kapatma pratiğiydi — bir özellik dağıtılmadan önce, sonra değil. Carlos'un burada olma nedeni buydu. Maya onu özellikle davet etmişti çünkü Nimbus önemli bir şey inşa etmek üzereydi ve ilk satır production kodu yazılmadan önce yapılandırılmış bir meydan okuma istiyordu.

İyi bir mimari inceleme, bir pilotun uçuş öncesi kontrol listesi gibidir. Uçak uçmaya tam hazır görünebilir — motorlar çalışıyor, yakıt dolu, yolcular binmiş. Ama kontrol listesi vardır çünkü deneyimli pilotlar, soruna en çok neden olması muhtemel şeylerin tam olarak, sorun çıkana kadar gayet iyi hisseden şeyler olduğunu bilir. Kontrol listesi, pilotun ne yaptığını bilmediği anlamına gelmez. Uzmanların bile yapılandırılmış süreci atladıklarında bir şeyleri kaçırdığını içselleştirdikleri anlamına gelir.

**Mimarın İlk Hamlesi**

Sonra olan şey ekibi şaşırttı.

Maya sistemi tanımlamaya başladı — EC2 örnekleri, Aurora, CloudFront, ElastiCache, menü için DynamoDB, özel alt ağlı VPC...

Carlos onu nazikçe durdurdu.

"İşle başlayın," dedi. "Teknolojiyle değil."

Durakladı. Sonra: "Nimbus bir restoran sipariş platformu. 287 restoran ortağımız var. Günde yaklaşık 4.200 sipariş işliyoruz. Ortalama sipariş değeri 34 $. Çeyrek bazında %18 büyüyoruz."

"Güzel. Nimbus'un yapması gereken en önemli şey nedir?"

"Siparişleri işlemek," dedi Leo.

"Spesifik olarak," diye üsteledi Carlos.

"Bir sipariş, verildikten sonraki beş saniye içinde restorana ulaşmalı," dedi Priya, "yoksa mutfak zamanlama penceresini kaçırır."

"Olmazsa ne olur?"

"Restoran bir hata yapar. Müşteri yanlış yemeği alır ya da çok bekler. Şikâyet eder. Bir restoran ortağı kaybederiz."

"Yani beş saniyelik SLA," dedi Carlos, "teknik bir hedef değil. Bir iş hayatta kalma gereksinimi."

Sessizlik.

"İşte bu," dedi, "mimari konuşmaların neden iş gereksinimleriyle başlaması gerektiğidir. Teknoloji, kısıtlamanın aşağı akışındadır."

**Mimari İnceleme Yapısı**

Gerçek bir mimari inceleme — önemli bir şey inşa etmeden önce ya da ölçeklendirip ölçeklendirmeyeceğinizi değerlendirirken yapılan tür — bir yapıya sahiptir.

Carlos bunu beyaz tahtaya yazdı:

**1. Kısıtlamaları anla**

Neyin doğru olması gerekiyor? Ne olamaz? ("Ne istiyoruz" değil. Pazarlık konusu olmayanlar nelerdir?)

**2. Bilinmeyenleri anla**

Neyi bilmiyoruz? Nerede varsayımlarda bulunuyoruz? Bu varsayımlar yanlışsa ne olur?

**3. Seçenekleri değerlendir**

Gerçekçi alternatifler nelerdir? Her birinin ödünleşimleri nelerdir?

**4. Arıza modlarını belirle**

Bu nasıl bozulur? Her arıza modu tetiklendiğinde olay dizisi nedir?

**5. İzlemeyi doğrula**

Bir şeyin ne zaman ters gittiğini nasıl bileceksiniz? Kullanıcılar size söylemeden önce?

**6. Runbook'u tanımla**

Bu bozulduğunda gece 3'te biri ne yapar?

Bu, mekanik olarak izlenecek bir kontrol listesi değildir. Bir düşünme çerçevesidir. Amaç, önemli soruların production'a girmeden *önce* sorulmasını sağlamaktır.

**İncelemeyi Yürütmek: Nimbus'un Yeni Özelliği**

Carlos özellikle davet edilmişti çünkü Nimbus yeni bir şey inşa etmek üzereydi.

**Özellik**: "Nimbus Instant" — 15 dakikalık teslimat garantisi. Bir ortak restoran, 15 dakikalık pencereyi haftada birden fazla kaçırırsa, Nimbus müşteriye otomatik olarak geri ödeme yapacaktı.

"Teknik gereksinimleri bana anlat," dedi Carlos.

Priya başladı. "Sipariş verilmesinden teslimata kadar gerçek zamanlı takibe ihtiyacımız var. Gerçek teslimat süresini 15 dakikalık SLA ile karşılaştırmalıyız. Geri ödemeleri otomatik tetiklemeliyiz."

"Takip verisi için gecikme gereksinimi nedir?"

"Neredeyse gerçek zamanlı. Müşteriler telefonlarında durum güncellemelerini görüyor."

"Ne kadar süre içinde?"

"Muhtemelen beş saniye."

"Muhtemelen mi?"

"Beş saniye içinde. Ürün gereksinimi bu."

"Güzel. O zaman olay akışı için Kinesis. Kinesis gecikirse arıza modu nedir?"

"Durum güncellemeleri müşteriye geç ulaşır."

"Bu kabul edilebilir mi?"

"10 saniye için mi? Muhtemelen. 60 saniye için mi? Hayır."

"Yani takip sisteminin SLA'sı nedir?"

Priya Leo'ya baktı. "Henüz bir tane yok."

Carlos tahtaya yazdı: *Bilinmeyen: takip SLA'sı.*

"Bu önemli," dedi. "Çünkü SLA, altyapı tasarımını belirler. SLA'nız 5 saniyeyse, 60 saniye olduğundan farklı bir çözüme ihtiyacınız var."

"Dur — ama *neden* öyle yapalım ki?" diye sordu Maya. "Gerçek zamanlı bir push yerine, uygulamanın birkaç saniyede bir kontrol ettiği bir yoklama mekanizması kullanmayalım mı?"

"Gecikme ve maliyet," dedi Carlos. "Ölçekte bir yoklama yaklaşımı — diyelim ki 10.000 aktif sipariş, her uygulama 5 saniyede bir yoklama yapıyor — saniyede 2.000 istek ya da dakikada 120.000 istek demektir. Kinesis üzerinden bir push modeli, güncellemeleri yalnızca durum değiştiğinde teslim eder. Daha az istek, daha düşük gecikme ve SLA taahhüdü bir olay günlüğünden denetlenmesi daha kolay. Yoklama küçük ölçekte işe yarar. Nimbus'un gittiği ölçekte, push doğru temel."

Leo, Carlos'un açıklaması boyunca sessizdi. Sonra: "Bunu WebSocket'lerle inşa edecektim."

Carlos ona baktı. "Anlat bakalım."

"Her sipariş bir WebSocket bağlantısı alır. İstemci, sipariş verildiğinde bağlanır. Sunucu durum değişikliklerini — onaylandı, hazırlanıyor, yolda, teslim edildi — gerçekleştikçe gönderir. Yoklama yok, düşük gecikme, basit model."

"WebSocket bağlantısını ne sürdürür?"

"Bir API Gateway WebSocket uç noktası. Lambda fonksiyonları bağlantı ve mesaj olaylarını işler. DynamoDB bağlantı kimliklerini saklar."

Carlos bunu tahtaya yazdı. "Peki istemcinin ağı 15 saniyeliğine kesildiğinde arıza modu nedir?"

"Bağlantı sonlandırılır. İstemci yeniden bağlanır ve mevcut durumu ister."

"Nereden?"

"Şeyden... DynamoDB'den okuyan Lambda işleyiciden."

"Yani hem bir push yolun hem de bir pull yolun var," dedi Carlos. "WebSocket push, mutlu yol. DynamoDB okuması, kurtarma yolu. Müşteri durumun bayatladığını fark etmeden önce bağlantının yeniden kurulduğundan nasıl emin oluyorsun?"

Leo düşündü. "İstemci bağlantı kopmasını algılar ve birkaç saniye içinde yeniden bağlanır. Yeniden bağlanma mantığı basit."

"Aynı anda 10.000 aktif siparişte — ki Nimbus oraya gidiyor — bu kaç eşzamanlı WebSocket bağlantısı eder?"

"10.000."

"API Gateway WebSocket'in hesap başına varsayılan kotası **saniyede 500 yeni bağlantıdır**," dedi Carlos. "Eşzamanlı bağlantılar değil — bağlantı *hızı*. 10.000 sabit bağlantı sorun değil. Sorun yeniden bağlanma fırtınası: bir ağ kesintisi aynı anda birkaç bin istemciyi düşürdüğünde ve hepsi aynı iki saniyede yeniden bağlandığında, hız kotasına çarparsın ve kullanıcılar en çok dikkat ederken yeniden bağlanmalar tam da o anda başarısız olmaya başlar. Artış isteyebilirsin, ama büyüdükçe yeniden ele alacağın bir kota. Ayrıca: API Gateway WebSocket, milyon bağlantı-dakikası başına 0,25 $, artı milyon mesaj başına 1,00 $ ücret alır. Günde 10.000 sipariş ve ortalama 40 dakikalık takip penceresiyle, bu günde yalnızca yaklaşık 400.000 bağlantı-dakikası — kuruşlar. Aynı anda 10.000 aktif siparişte, farklı bir ölçektir."

"Bu çok değil," dedi Leo.

"10.000 aktif siparişte değil," dedi Carlos. "O ölçekte, bağlantı-dakikası ve mesaj ücretleriyle ayda kabaca 150 $ diyelim. Buradaki maliyet WebSocket'lere karşı argüman değil. Yeniden bağlanma fırtınaları altındaki bağlantı hızı kotası ve bağlantı durumu yönetimi — onlar argüman."

"Yani WebSocket'ler ölçekte karmaşıklaşıyor," dedi Maya.

"Bunun için mimari kurarsan ölçekte yönetilebilir hale geliyorlar," dedi Carlos. "Yanlış değil — farklı bir ödünleşim kümesi. Şimdi sana yoklama alternatifini göstereyim."

İkinci seçeneği çizdi.

"Yoklama: istemci her 5 saniyede bir `/orders/{order_id}/status` adresine bir GET isteği gönderir. Arka uç DynamoDB'den okur. Mevcut durumu döndürür."

"Bu çok fazla istek," dedi Priya.

"10.000 aktif sipariş × 5 saniyede 1 yoklama = saniyede 2.000 istek. API'nizin 2.000 RPS'yi işlemesi gerekir. DynamoDB otomatik ölçeklenir. API Gateway yükü işler. Maliyet: 2.000 RPS × 3.600 saniye × 24 saat × 30 gün = ayda 5,18 milyar istek. API Gateway REST API fiyatlandırması: milyon istek başına 3,50 $ = ayda 18.130 $."

Oda sessizdi.

"Bu, ölçekte uygulanabilir bir seçenek değil," dedi Tom.

"Doğru," dedi Carlos. "5 saniye aralıkla yoklama, en basit uygulama ve ölçekte en pahalı olanıdır. Ayrıca durum değişikliklerine değil, aktif bağlantılara orantılı yük üretir. Bir sipariş 20 dakika 'hazırlanıyor' durumunda kalırsa, yoklama hepsi aynı durumu döndüren 240 istek üretir. Bu israftır."

"Peki Kinesis?" diye sordu Maya.

"Kinesis, durum değişikliği başına bir olay üretir. Bir sipariş onayı: bir olay. Mutfak kabulü: bir olay. Sürücü teslim alma: bir olay. Teslimat: bir olay. Her sipariş başına dört olay, her durumun ne kadar sürdüğünden bağımsız. Tüketici — arka ucunuz — Kinesis akışından okur ve güncellemeyi seçtiğiniz teslim mekanizması aracılığıyla istemciye gönderir."

"Ama istemcinin yine de push'u alacak bir yola ihtiyacı var," dedi Leo.

"Evet. Son aşama teslimi için Server-Sent Events, bir uzun yoklama uç noktası ya da WebSocket'ler kullanabilirsin. Kinesis, arka ucunuz için güvenilir, sıralı, yeniden oynatılabilir olay akışını yönetir. İstemci teslim mekanizması ayrı bir karar. Temel avantaj: Kinesis, olay kaynağını tüketiciden ayırır. Teslimat takip sistemi, geri ödeme sistemi, restoran bildirim sistemi ve müşteri durum ekranı, hepsi aynı Kinesis akışından bağımsız olarak tüketir."

"Yani WebSocket yerine Kinesis değil," dedi Maya. "Kinesis artı daha hafif bir istemci teslim mekanizması."

"Aynen. Ödünleşim analizi:"

Yazdı:

| Seçenek | Gecikme | Maliyet (500 / 10K aktif sipariş) | Karmaşıklık |
|---|---|---|---|
| Yalnızca WebSocket | ~50ms | ayda $8 / $150 | Orta |
| Yoklama (5sn) | 0–5sn | ayda $906 / $18.130 | Düşük |
| Kinesis + SSE | ~200ms | ayda $8 / $75 | Orta-yüksek |

"Yoklama seçeneği maliyetle elenir," dedi Carlos. "WebSocket'ler uygulanabilir ama ölçekte bağlantı yönetimi gerektirir. Kinesis artı Server-Sent Events biraz daha yüksek gecikmeli ve maliyette benzer — sana kazandırdığı şey, geri ödeme sistemi için ihtiyaç duyduğun dayanıklı, yeniden oynatılabilir olay günlüğü ve ayrıştırılmış tüketiciler."

"Dur — ama *neden* öyle yapalım ki?" diye sordu Maya. "WebSocket'lerin gecikmesi daha düşükse, Kinesis artı SSE'den daha yüksek gecikmeyi neden kabul edelim?"

"Bir teslimat durumu güncellemesini izleyen bir müşteri için 200ms'ye karşı 50ms algılanabilir mi?" diye sordu Carlos.

"Hayır," dedi.

"O zaman gecikme farkı algı eşiğinin altında. On bin aktif siparişte maliyet farkı mütevazı — ayda 75 $'a karşı 150 $. Mimari fark asıl argüman: Kinesis sana dayanıklı, yeniden oynatılabilir bir olay günlüğü verir — geri ödeme denetim izi için ihtiyacın olacak — ve takip tüketicilerini ayrıştırır. WebSocket'ler bu ayrıştırmayı sonradan yeniden inşa etmeni gerektirir."

Leo tabloya baktı. "WebSocket versiyonunu neredeyse dağıtıyorduk."

"İşe yarardı," dedi Carlos. "Anlaşılması gereken önemli şey bu. WebSocket'ler işe yarardı. Mimaride soru nadiren 'bu işe yarar mı?'dır. Soru şu: 'büyüdükçe bunun maliyeti nedir ve sonra neyi yeniden inşa etmek zorunda kalırız?'"


**Mimarların Sorduğu Sorular**

Sonraki iki saat boyunca Carlos ekibe incelemede rehberlik etti. Sorularından bir seçki:

**Veri depolama hakkında**:

"Sipariş durumu, yerine getirme sırasında nerede saklanıyor? Uygulama teslimatın ortasında çökerse, kurtarma süreci nedir? Durumu yalnızca olaylardan yeniden oluşturabilir misin?"

**Geri ödeme mekanizması hakkında**:

"Geri ödeme otomatik tetikleniyor. Bir geri ödemenin iki kez yapılmasını ne engeller? Ödeme işlemcisi zaman aşımına uğrarsa ve geri ödemenin kabul edilip edilmediğinden emin değilsen ne olur?"

**Teslimat takibi hakkında**:

"Kurye GPS verisine güveniyorsun. GPS sinyali 90 saniye boyunca kaybolursa ne olur? 'GPS kayboldu'yu, 'teslimat devam ediyor'dan ve 'teslimat sorunu'ndan nasıl ayırt edersin?"

**Arıza işleme hakkında**:

"Geri ödeme servisi çökerse, sipariş yine de gerçekleşir mi? Müşteri yine de yemeğini alır mı? Kısmi bir sistem arızası sırasında kullanıcı deneyimi nedir?"

**Gözlemlenebilirlik hakkında**:

"Şu anda kaç siparişin 15 dakikalık SLA'nın 5 dakika içinde olduğunu nasıl biliyorsun? O sayı sıçrarsa, kim bilgilendirilir?"

Her soru, ekibin farkında olmadan yaptığı bir varsayımı ortaya çıkardı.

"Onu zaten dağıtmıştım — ah," dedi Leo. "Geri ödeme uç noktası. Sadece ödeme API'sini doğrudan çağıracaktım. Onu iki kez çağırmayı düşünmemiştik." Durakladı. "Yani ilk çağrı başarılı olur ama onayımız aktarımda kaybolursa, tekrar çağırırız ve müşteri iki geri ödeme alır."

"Ödeme API'si ilk çağrıyı kabul eder ama onayımız aktarımda kaybolursa ne olur diye düşündük mü?" diye sordu Priya.

"Bu idempotency," dedi Carlos.

"Bir idempotency anahtarı — geri ödeme denemesi başına benzersiz bir kimlik, ödeme API'sini çağırmadan önce bir veritabanında saklanır," dedi Priya. "Aynı anahtarla iki kez çağırırsak, ödeme API'si ikinci çağrıyı yok sayar."

"Bu da demek oluyor ki," diye ekledi Carlos, "geri ödeme işlemleri için yalnızca bir kuyrukta bir olay değil, kalıcı bir durum deposuna ihtiyacın var."


"Tartıştığımız izleme," dedi Carlos, "tamamen altyapı izlemesi. CPU. Bağlantı sayısı. Kinesis gecikmesi. Bunlar önemli — ama Nimbus Instant'ın çalışıp çalışmadığını söyleyen izleme değil."

"Çalıştığını bize söyleyen izleme nedir?" diye sordu Maya.

"Restoran başına P95 onay süresi. 95'inci yüzdebirlikte, sipariş verilmesinden restoran onayına kadar ne kadar sürüyor — her restoran ortağı için ayrı ayrı ölçülen?"

"O metriğimiz yok," dedi Priya.

"İşte açık bu," dedi Carlos. "Mükemmel altyapın olabilir — her alarmda CloudWatch yeşil — ve yine de tablet yazılımında bir hata olduğu için üç haftadır onay gecikmesi bozulan bir restoran ortağın olabilir. Altyapı sorunsuz. İş SLA'sı ihlal ediliyor. Ve restoran şikâyet etmek için arayana kadar bilmeyeceksin."

"Bunu nasıl yakalarız?" diye sordu Leo.

"Bir sipariş onayı alındığında her seferinde özel bir CloudWatch metriği yayınla ya da analitik veri hattına gönder. Sipariş verilmesini zaman damgala. Onayı zaman damgala. Farkı hesapla. `restaurant_id` ile etiketleyerek yayınla. Son 7 gün boyunca restorana göre p95 onay süresini gösteren bir CloudWatch panosu oluştur."

"Ve bozulduğunda alarm ver?" diye sordu Tom.

"Belirli bir restoran için p95, 5 ardışık dakikadan fazla 90 saniyeyi aştığında alarm ver," dedi Carlos. "Bu, şikâyet bekleme yanıtı değil, proaktif bir iletişimi hak eden bir anomali."

"Altyapı izleme ile ürünü izleme arasındaki fark bu," dedi Priya.

"Aynen," dedi Carlos. "Altyapı izleme, sistemlerinin sağlıklı olup olmadığını söyler. İş düzeyi izleme, müşterilerinin onlara söz verdiğin şeyi deneyimleyip deneyimlemediğini söyler. İkisine de ihtiyacın var. Çoğu ekipte sadece birincisi var."

Maya bunu ADR ekine ekledi: altyapı sağlık metriklerine ek olarak restoran başına p95 onay süresini takip et. Alarm eşikleri, restoran başarı ekibiyle istişare içinde ürün ekibi tarafından tanımlanacak.

"Burası aynı zamanda maliyet izlemesiyle iş izlemesinin kesiştiği yer," dedi Tom. "Cuma akşamları bir kısım restoran için onay gecikmemiz sıçrıyorsa, kök neden, o restoranların Kinesis'teki parçalarına çarpan bir Lambda soğuk başlangıcı olabilir. İş metriği belirtiyi ortaya çıkarır. Altyapı metrikleri nedeni ortaya çıkarır."

"Ve çözüm daha fazla altyapı olmayabilir," dedi Carlos. "Belirli Lambda fonksiyonunda sağlanan eşzamanlılık olabilir. Ya da parça yeniden dengeleme olabilir. Ya da restoranın onay uç noktasında bir hata olabilir. Her iki gözlemlenebilirlik katmanına sahip olmadan hangisi olduğunu bilemezsin."

"Altyapıyı düzeltirsek ve iş metriği yine de iyileşmezse ne olur diye düşündük mü?" diye sordu Priya.

"O zaman kök neden altyapıda değildir," dedi Carlos. "Ki bu değerli bir bilgi. İş metriği olmadan, başka bir yerde yaşayan bir sorun için altyapı iyileştirmelerinin peşinden koşuyor olurdun."


"İzlenen 500 eşzamanlı teslimatımız olduğunda bu ayda ne kadar tutuyor?" diye sordu Tom. "Durum deposu, Kinesis akışı, olayları işleyen Lambda fonksiyonları?"

Carlos başını salladı. "Şu anda sorulacak doğru soru bu, tasarlarken, inşa ettikten sonra değil."

Bu, yapılandırılmış bir incelemede ortaya çıkan ve sadece inşa ederken genellikle ortaya çıkmayan türden bir mimari ayrıntıdır.

**Mimari Karar Kaydı**

İncelemeden sonra Carlos, ekibin kararlarını **Mimari Karar Kayıtları'nda (ADR'ler)** belgelemesini önerdi — şunları yakalayan kısa belgeler:

- **Hangi karar verildi**
- **Hangi alternatifler değerlendirildi**
- **Bu karar neden verildi (o zamanki bağlam ve kısıtlamalar)**
- **Ödünleşimler nelerdir**
- **Bu kararı yeniden ele almamıza ne neden olur**

Şunu merak ediyor olabilirsiniz: ADR'lerin resmi belgeler olması gerekir mi? Hayır. Ekibinizin çalıştığı yer orasıysa, bir ADR bir Slack başlığındaki bir paragraf olabilir. Format önemsizdir. Ne karar verdiğinizi ve nedenini — devam etmeden önce — yazma eylemi, kurumsal hafızayı yaratan şeydir.

"ADR'ler gelecekteki kendiniz içindir," dedi Carlos. "18 ay sonra bir mimari parçasına bakacak ve neden o şekilde yapıldığını merak edeceksiniz. Bir ADR'niz varsa, bağlamı anlayacaksınız. Yoksa, ya ona dokunmaktan korktuğunuz için onu olduğu gibi bırakacaksınız ya da neden o şekilde yapıldığını anlamadığınız için onu değiştireceksiniz."

Leo o öğleden sonra ilk ADR'yi yazdı: teslimat takip olayları için Kinesis kullanma kararı, bağlam, değerlendirilen alternatifler (SQS, EventBridge, yoklama) ve ödünleşimlerle birlikte.

Carlos, Leo'nun taslağını hazırladığı ADR'ye baktı. Onu otuz saniyede okudu. Sonra şöyle dedi: "Ekibe ADR-007'nin neye benzediğini göster."

Leo onu yansıttı.

---

**ADR-007: Teslimat Takip Olayı Altyapısı**

**Tarih**: 2025-03-14
**Durum**: Kabul Edildi
**Yazar**: Leo (Carlos, Priya incelemesiyle)

---

**Sorun**

Nimbus Instant, gerçek zamanlı teslimat durumu takibi gerektirir. Siparişler durumlarını güncellemeli (onaylandı → hazırlanıyor → yolda → teslim edildi) ve bu güncellemeleri durum değişikliğinden sonraki 5 saniye içinde müşterinin mobil uygulamasına yansıtmalıdır. Geri ödeme sistemi de SLA uyumluluğunu belirlemek için teslimat olaylarının denetlenebilir, yeniden oynatılabilir bir günlüğüne ihtiyaç duyar.

---

**Değerlendirilen Seçenekler**

**Seçenek 1: API Gateway WebSocket + DynamoDB durumu**
- İstemci sipariş başına bir WebSocket bağlantısı sürdürür
- Arka uç durum değişikliklerini açık bağlantı üzerinden gönderir
- Yeniden bağlanmada istemci mevcut durumu DynamoDB'den çeker
- Ölçekte tahmini maliyet (eşzamanlı 10K aktif sipariş): ~ayda 150 $
- Zayıflık: Ölçekte bağlantı limiti yönetimi; denetim için yerleşik yeniden oynatma yok

**Seçenek 2: İstemci yoklaması (5 saniye aralık)**
- İstemci her 5 saniyede bir `/orders/{order_id}/status` adresini yoklar
- Arka uç her yoklamada DynamoDB'den okur
- En basit uygulama
- Ölçekte tahmini maliyet (eşzamanlı 10K aktif sipariş): ayda 18.130 $
- Maliyet nedeniyle elendi

**Seçenek 3: Kinesis Data Streams + Server-Sent Events**
- Teslimat durumu değişiklikleri, verim sınırına göre boyutlandırılan bir Kinesis akışına yayınlanır: bir parça saniyede 1 MB ya da saniyede 1.000 kayıt alır. 10K aktif siparişte (sipariş başına ~4 durum değişikliği olayı, küçük JSON yükleri), zirve yazma hızı saniyede ~40-50 olay — tek bir parçanın kapasitesi. Bölüm dağılımı ve tüketici boşluğu için 3 parça sağlayın.
- SSE uç noktası, sipariş bölümüne atanan Kinesis parçasına abone olur
- İstemci SSE olaylarını alır; standart EventSource API'sini kullanarak yeniden bağlanır
- Ölçekte tahmini maliyet (eşzamanlı 10K aktif sipariş): ~ayda 75 $
- Dayanıklı, yeniden oynatılabilir olay günlüğü sağlar; tüm tüketicileri ayrıştırır

---

**Karar**

Seçenek 3: Kinesis Data Streams + SSE.

Gerekçe: maliyet avantajı ölçekte önemli; Kinesis olay günlüğü, ayrı bir denetim izi uygulaması olmadan geri ödeme denetim gereksinimini karşılar; SSE yeniden bağlanma işleme, ölçekte WebSocket bağlantı yönetiminden daha basit.

---

**Sonuçlar**

- *Olumlu*: Geri ödeme sistemi, restoran bildirim sistemi ve müşteri uygulaması, hepsi aynı Kinesis akışından bağımsız olarak tüketir. Üreticiyi değiştirmeden yeni tüketiciler eklenebilir.
- *Olumlu*: Olaylar 7 güne kadar yeniden oynatılabilir (yapılandırdığımız genişletilmiş saklama; Kinesis ek maliyetle 365 güne kadar destekler). Geri ödeme işleme Lambda'sı başarısız olursa, kaçırılan olayları yeniden oynatabilir.
- *Olumsuz*: SSE gecikmesi (~200ms), WebSocket gecikmesinden (~50ms) daha yüksek. Kabul edilebilir çünkü bu fark, durum güncellemeleri için müşteri algı eşiğinin altında.
- *Olumsuz*: Kinesis sağlanan fiyatlandırması parça saatleriyle ölçeklenir ve genişletilmiş saklama, parça başına maliyeti kabaca ikiye katlar. Verim boşluğu büyük (bir parça saniyede 1.000 kayıt alır), ama tüketici sayısı ve tüketici başına okuma yükü kabaca 50K günlük aktif siparişi geçtikçe, parça sayısı — ve bir yeniden parçalama/tüketici yayma stratejisi — yeniden ele alınmalı.

**Bu kararı yeniden ele almamıza ne neden olur**: Sipariş hacmi, Kinesis parça maliyetlerinin yeni ölçekte WebSocket maliyetlerini aştığı yere büyürse ya da 200ms SSE gecikmesi bir ürün farklılaşma sorunu haline gelirse.

---

"Son satır," dedi Maya. "İşte düşünmediğim buydu."

"Yeniden ele almanın tetikleyicisi," dedi Carlos. "Her kararın, yanlış hale geldiği koşullar vardır. Onları yazmak, ortaya çıktıklarında onları tanıyacağın anlamına gelir."

"Onları bir post-mortem'de keşfetmek yerine," dedi Priya.

"Bunun yerine, evet."

Tom maliyet sonucunu okuyordu. "Yeniden parçalama ve yayma stratejisi — bizde henüz yok."

"50K günlük aktif siparişe kadar ona ihtiyacın yok," dedi Carlos. "Mevcut 287 restoran ve günlük 4.200 siparişle, önemli bir boşluğun var. ADR, ne zaman alakalı hale gelmeden önce değil, acil hale gelmeden önce neyi inşa edeceğini söyler."

Leo not alıyordu. "ADR iki şey yapıyor," dedi. "Ne karar verdiğimizi belgeliyor. Ve durum değişirse sonra neye karar vermemiz gerekeceğini belgeliyor."

"İşte bir ADR'yi on sekiz ay boyunca faydalı kılan şey bu," dedi Carlos. "Kararın kendisi değil — kararlar bayatlar. Muhakeme. Muhakeme, karar hâlâ yürürlükteyken bile kararın yeniden ele alınması gerekip gerekmediğini söyler."


**Mimarı Mimar Yapan Şey**

Oturumun sonunda Maya Carlos'a asıl soruyu sordu: "Mimari kararlar vermekle bir mimar gibi düşünmek arasındaki fark nedir?"

Düşündü.

"Bir mimar, kıdemli bir mühendisten daha fazla teknoloji bilmez," dedi. "İyi bir mimar muhtemelen en yeni çerçevelerin biraz daha azını bilir. Ama bir mimarın farklı bir varsayılan soru kümesi vardır."

"Ne demek istiyorsun?"

"Yeni bir özelliğe bakan kıdemli bir mühendis olduğunda, ilk soruların genellikle şunlardır: 'Ne inşa ederiz? Nasıl çalışır? Bunun için en iyi kütüphane hangisi?' Bir mimar aynı özelliğe baktığında, ilk sorular şunlardır: 'Bu hangi sorunu çözüyor? Trafik ikiye katlandığında ilk ne bozulur? Ne zaman bozulduğunu nasıl biliriz? Ödeme işlemcisi yavaş olduğunda kullanıcı ne deneyimler?'"

"Mimar, sistem hakkında stres altında soru sorar," dedi Leo.

"Ve her arızanın iş sonucu hakkında," diye ekledi Priya.

"Ve," dedi Tom, "bu ölçeklendiğinde faturaya ne olduğu hakkında."

Carlos başını salladı. "Hepiniz bunu zaten yapıyorsunuz. Bölüm 1'den beri yapıyorsunuz. Kıdemli bir mühendisle bir mimar arasındaki fark bir sertifika ya da unvan değil. Bir sonraki soruyu sorma alışkanlığı — henüz düşünmediğin şeyi ortaya çıkaran soru."

**Varyasyon: Bir Mimari İnceleme Riski Kaldırmak Yerine Eklediğinde**

İncelemeniz bir öğrenme süreci yerine bir onay kapısı olarak ele alınırsa, ekipler gecikmeden kaçınmak için tasarım seçimlerini gizlemeye başlar — ve arıza modları yine de var olur, sadece belgesiz. Kaliteyi iyileştirmeden gönderimi yavaşlatan bir mimari inceleme, hiç inceleme olmamasından beterdir.

Geri ödeme servisi için idempotency sorunu, gerekli bir keşif yerine özellik lansmanına beklenmedik bir gecikme olarak ele alınsaydı, Leo orijinal uç noktayı gönderirdi, çift geri ödeme eninde sonunda gerçekleşirdi ve ekip bunu öfkeli bir müşteriden öğrenirdi. İnceleme sorunu, onu düzeltmenin bir geri alma değil, bir gün maliyetinde olduğu bir noktada ortaya çıkarır.

İncelemenin değeri, ekibin onun tasarımı değiştirmesine izin vermeye ne kadar istekli olduğuyla orantılıdır.

## Güçlü Yönler ve Sınırlamalar

**Mimari incelemeler**:

- Arıza modlarını production'a girmeden önce yakalar
- Genellikle siloya kapatılmış bilgiye sahip ekip üyeleri arasında ortak bir anlayış yaratır
- Yıllarca getiri sağlayan belgeler (ADR'ler) üretir
- Karar vermeyi faydalı şekillerde yavaşlatır — incelemesiz "hızlı hareket et", "hızlı hareket et ve görmediğin duvara çarp"tır

**Nerede karmaşık hale gelirler**:

- Doğru soruları sorabilecek kadar yetenekli birini gerektirir — inceleme yalnızca inceleyici kadar iyidir
- Bir konuşma yerine bir onay kutusu olarak ele alınırsa bürokratik hale gelebilir
- Bazı mimari kararlar gerçekten tam bir inceleme gerektirmez — hangilerinin gerektirdiğini bilmek başlı başına mimari bir beceridir
- Çıktı (ADR'ler, diyagramlar, karar günlükleri), sistem geliştikçe sürdürülmelidir

## Özet

Carlos ile inceleme iki saat sürmüş ve üç ADR, özellik inşa edilmeden önce çözülecek altı bilinmeyenin bir listesi ve lansmandan sonra geriye dönük uyarlanması acılı olacak bir mimari değişiklik (idempotency durum deposu) üretmişti. Uçuş öncesi kontrol listesi metaforu baştan sona geçerliydi: felaket niteliğinde bir şey keşfedilmemişti, ama daha sonra soruna neden olacak birkaç şey, hâlâ düzeltilmesi kolayken yakalanmış ve belgelenmişti.

- Mimari incelemeler **teknolojiyle değil, iş gereksinimleriyle** başlar.
- İnceleme yapısı: kısıtlamalar → bilinmeyenler → seçenekler → arıza modları → izleme → runbook'lar.
- Mimarlar şunu sorar: İlk ne bozulur? Bozulduğunu nasıl biliriz? Arıza sırasında kullanıcı deneyimi nedir? Ölçekte maliyet nedir?
- **Mimari Karar Kayıtları (ADR'ler)**, ne karar verildiğini, nedenini ve yeniden değerlendirmeye neyin yol açacağını yakalar.
- Bir mimar gibi düşünmek bir alışkanlıktır: bir sonraki soruyu sormak, özellikle arıza modları, iş sonucu ve ölçek ekonomisi hakkında.

## Sınav İpuçları

*SAA-C03 Alanı: Alanlar arası — mimari muhakeme*

Bu bölüm belirli sınav konularından çok, sınavın test ettiği zihniyetle ilgilidir.

- **SAA-C03 senaryoları** neredeyse her zaman önce bir iş kısıtlamasını tanımlar ("şirket 1 saatten fazla kesintiyi karşılayamaz") ve onu karşılayan mimariyi seçmenizi ister. İş kısıtlamalarını teknik gereksinimlere çevirme pratiği yapın.
- **Arıza modu düşüncesi**: Birçok sınav sorusu bir sistemi tanımlar ve bir bileşen başarısız olduğunda ne olduğunu sorar. Karşılaştığınız mimariler için "ilk ne bozulur?" diye sormaya alışın.
- **Ödünleşim düşüncesi**: Sınavın nadiren "mükemmel" bir cevabı vardır. Bir dizi kısıtlama göz önüne alındığında *en iyi* cevabı ister. "Bu seçenek, farklı gereksinimler altında başka bir seçenek daha iyi olsa da, bu belirli gereksinimler göz önüne alındığında doğrudur" ifadesiyle rahat olun.
- **Mimari Karar Kayıtları**: Bir AWS hizmeti değil, ama Well-Architected Framework'ün Operasyonel Mükemmellik sütununu yansıtan bir en iyi uygulamadır.
- **Gerçek zamanlı olay akışı için Kinesis**: Bölümün Nimbus Instant özelliği, teslimat olay akışı için Kinesis kullanır. Sınav sinyali: "sıralı işlemeyle gerçek zamanlı olay alımı" → Kinesis Data Streams. "Bileşenleri ayrıştır, en az bir kez teslim" → SQS. Her birine ne zaman başvuracağını bilmek tekrar eden bir sınav desenidir.
- **Test edilebilir bir desen olarak idempotency**: SAA-C03 sıklıkla dağıtık sistemlerde idempotency'yi test eder. Temel desen: harici bir sistemi çağırmadan önce benzersiz bir idempotency anahtarı oluştur; anahtarı ve sonucu kalıcı hale getir; yeniden denemede, yeniden çalıştırmadan önce mevcut anahtarı kontrol et. Bulunursa, yeniden çalıştırmadan önceden saklanan sonucu döndür. Bu, bir ağ zaman aşımından sonra yeniden denemeler olduğunda çift ücretlendirmeleri, çift göndermeleri ve yinelenen durum değişikliklerini önler. Sınav sinyali: "bir servis çağrısı yeniden denendiğinde yinelenen işlemleri önle" ya da "ödeme olaylarının tam olarak bir kez işlenmesini sağla" → koşullu yazma ile DynamoDB'de saklanan idempotency anahtarı.
- **Server-Sent Events ve WebSocket karşılaştırması**: SSE tek yönlüdür (sunucudan istemciye), standart HTTP kullanır ve EventSource API'si aracılığıyla otomatik olarak yeniden bağlanır. WebSocket'ler çift yönlüdür, bağlantı yönetimi gerektirir ve istemcinin de sunucuya veri göndermesi gerektiğinde uygundur. Teslimat durumu güncellemeleri için (yalnızca sunucudan istemciye), SSE ölçekte WebSocket'lerden daha basit ve daha ucuzdur.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Carlos mimari inceleme sırasında altı türde soru sordu. Bölüme bakmadan altı alanı yeniden oluşturabilir misiniz?

*(İpucu: "Mimari İnceleme Yapısı" bölümünde listelenmişlerdir. Onları hafızadan hatırlamaya çalışın — hatırlama girişiminde bulunma eylemi (başarısız olsanız bile) uzun vadeli akılda tutmayı güçlendirir.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket çevrimiçi reklamcılık için gerçek zamanlı bir teklif yönetimi sistemi inşa ediyor. Teklifler 100 milisaniye içinde değerlendirilmeli ve yanıtlanmalıdır. Sistem zirvede saniyede 1 milyon teklif işler. Teklif sistemi çökerse, şirket reklam geliri kaybeder. Şirketin veritabanı ekibi 10 okuma replikasıyla RDS Aurora kullanmayı öneriyor. Çözüm mimarı, ikincil özelliklerini incelemeden önce önerinin temelde uygulanabilir olup olmadığını değerlendirmelidir.

Mimar İLK olarak hangi kaygıyı dile getirmelidir?

A) 10 Aurora okuma replikasının maliyeti bütçe için çok yüksek
B) Aurora okuma replikalarının tutarlılık sorunlarına neden olabilecek replikasyon gecikmesi var
C) Aurora'nın tipik 1-5ms sorgu gecikmesi 100ms yanıt SLA'sını karşılamayabilir
D) RDS Aurora, bu gecikme gereksiniminde saniyede 1 milyon istek işlem hacimlerini desteklemez

**İpucu 1**: Birincil kısıtlama, saniyede 1 milyon istekte 100ms toplam yanıt süresidir. Bu kaygılardan hangisi, geçerliyse, diğer üçü nasıl ele alınırsa alınsın öneriyi uygulanamaz hale getirir?

**İpucu 2**: Aurora sorgu gecikmesi tipik olarak 1-5ms'dir. Veritabanı sorgusu için 1-5ms, ağ, uygulama mantığı ve serileştirme için 95-99ms bırakır. 100ms kısıtlaması risk altında mı?

**İpucu 3**: Aurora yüksek IOPS işleyebilir, ama saniyede 1 milyon istek olağanüstü bir hızdır. Bu ölçekte mimariye ne olur?

**Cevap**: D

**Açıklama**: Aurora yüksek performanslı olsa da, 100ms toplam yanıt süresinde saniyede 1 milyon istek aşırı bir gereksinimdir — önerinin var olup olamayacağını belirleyen mimari engelleyicidir. Mimar önce Aurora'nın (ya da herhangi bir ilişkisel veritabanının) bu ölçekte ve gecikmede birincil arama sistemi olarak hizmet edip edemeyeceğini sorgulamalıdır. Bunun gibi sistemler tipik olarak tam SQL semantiğine sahip ilişkisel veritabanları değil, bellek içi veri depoları (Redis) ya da özelleşmiş düşük gecikmeli veritabanları kullanır. 100ms SLA'sı yalnızca Aurora sorguları için elde edilebilir, ama 1M RPS ve 100ms toplam SLA kombinasyonu tipik Aurora verim özelliklerini aşar. "İLK", iyileştirmeden önce uygulanabilirlik anlamına gelir: motor yükü sürdüremiyorsa, öneriyle ilgili diğer her kaygı geçersizdir.

**Neden A değil?** Maliyet geçerli bir kaygıdır, ama ilk kaygı, mimarinin belirtilen gereksinimlerde teknik olarak uygulanabilir olup olmadığı olmalıdır.

**Neden B değil?** Replikasyon gecikmesi, önerinin gerçek ama *ikincil* bir özelliğidir — mimari uygulanabilir hale geldiğinde ayarladığınız bir özellik. Aurora replika gecikmesi tipik olarak <100ms'dir ve çoğu kullanım durumu için kabul edilebilir; onu önce dile getirmek, ilk etapta gereken verimi sürdüremeyen bir sistemin tutarlılık davranışını tartışmak anlamına gelir. Uygulanabilirlik sorusu (D) onu kapsar.

**Neden C değil?** Aurora'nın 1-5ms gecikmesi, veritabanı sorgusu kısmı için 100ms SLA'sının çok içindedir. Bu birincil kaygı değildir.

*SAA-C03 Alanı: Alanlar arası — sistem tasarımı*

**Alıştırma 3 — Mimari Meydan Okuma** *(İsteğe Bağlı)*

Mimari inceleme yapısını gerçek ya da varsayımsal bir sisteme uygulayın:

Bir startup gerçek zamanlı çok oyunculu bir bilgi yarışması oyunu inşa etmek istiyor. Oyuncular oyun odalarına katılır (her birinde en fazla 10 oyuncu). Her tur 15 saniye boyunca bir soru gösterir; tüm oyuncular aynı anda cevaplar. Skorlar her sorudan sonra anında hesaplanır. Oyunlar 10 tur sürer. Zirve kullanım: 50.000 eşzamanlı oyun.

Altı adımlı incelemeyi baştan sona uygulayın:

1. Pazarlık konusu olmayan kısıtlamalar nelerdir?
2. Bilinmeyenler ve varsayımlar nelerdir?
3. Gerçekçi teknoloji seçenekleri nelerdir?
4. Arıza modları nelerdir?
5. Ne zaman bozulduğunu nasıl bileceksiniz?
6. Gece 3 runbook'u neye benzer?

*(Tek bir doğru cevap yoktur. Amaç, inceleme yapısını bir düşünme aracı olarak uygulamaktır.)*

## Jenerik Sonrası Sahne

Carlos ofisten saat 18:00'de ayrıldı.

Ekip sonrasında bir süre oturdu, özel bir şey yapmadan.

"O iki saatte, herhangi bir bireysel AWS hizmeti bölümünden daha fazla şey öğrendiğimi hissediyorum," dedi Leo.

"Çünkü o bölümler araçlarla ilgiliydi," dedi Maya. "Bu, muhakemeyle ilgiliydi."

"Muhakeme öğretilebilir mi?" diye sordu.

"Evet," dedi Priya. "Ama okuyarak değil. Pratik yaparak. Kararlar vererek, neyin bozulduğunu görerek, nedenini düşünerek."

"Deneyim yoluyla," dedi Tom.

"Yapılandırılmış deneyim yoluyla," diye düzeltti Priya. "Yansıma olmadan deneyim muhakeme oluşturmaz. Sonradan soruları sorman gerekir."

Maya beyaz tahtaya baktı. İnceleme notları hâlâ oradaydı — kısıtlamalar, bilinmeyenler, arıza modları, izleme soruları. İki beyaz tahtayı doldurmuştu.

"Bu ADR'ye girmeli," dedi.

Leo çoktan yazıyordu.

Son bölümde: hiçbir aracın ya da çerçevenin size veremeyeceği tek şey — ve "duruma göre değişir"in yazılım mimarisindeki en dürüst ve en güçlü cevap olmasının nedeni.
