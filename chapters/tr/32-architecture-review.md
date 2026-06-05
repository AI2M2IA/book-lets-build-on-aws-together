# Bölüm 32: Planı Koruma

Maya'nın 31. Bölümün sonunda sorduğu soru: “Mimari kararlar almak ve bir mimar gibi düşünmek arasındaki fark nedir?”

Yanıtına yardımcı olmak için bir davetli ağırlamıştı.

Adı Carlos’tu. 20 yıl boyunca mühendis olarak çalışmış, 7 yıl boyunca mühendislik yöneticisi olmuş, 3 yıl boyunca startup danışmanı olmuştu. Sistemlerin başarılı ve başarısız olma konusunda yeterli deneyime sahip, her iki durumda da sezgisel bir içgörüye sahip bir insandı.

Hiçbir şey getirmeden geldi: slayt yok, program yok. Sadece bir kara tahta kalemi ve bir soru.

“Nimbus hakkında ne düşünüyorsun?” dedi.

İyi bir mimari inceleme, bir pilotun ön hazırlık kontrol listesi gibi bir şeydir. Uçak mükemmel bir şekilde uçmaya hazır görünür — motorlar çalışıyor, yakıt dolu, yolcular biniş yaptı. Ancak kontrol listesi, sorunlara neden olabilecek en olası şeylerin tam olarak iyi görünmelerine rağmen, deneyimli pilotların yapılandırılmış bir süreçten kaçınırken bile eksiklikleri fark etme konusunda uzman oldukları için mevcuttur. Bu, pilotun ne yaptığını bilmediği anlamına gelmez. Bu, hatta uzmanların yapılandırılmış bir süreçten kaçınırken bile eksiklukları fark etme konusunda uzman oldukları için, hatta uzmanların bile dikkatli olmaları gerektiği anlamına gelir.

**Mimarların İlk Adımı**

Sonraki olaylar ekibin şaşkınlığıyla sonuçlandı.

Maya sistemi — EC2 örnekleri, Aurora, CloudFront, ElastiCache, menü için DynamoDB, özel alt ağlarla birlikte gelen VPC... tanımlamaya başladı.

Carlos onu nazikçe durdurdu.

“İşletmeye odaklanın,” dedi. “Teknolojiye değil.”

O duraksadı. Sonra: “Nimbus, 287 restoran ortağımız olan bir restoran sipariş platformudur. Günde yaklaşık 4.200 sipariş işliyoruz. Ortalama sipariş değeri 34 dolar. Çeyreklik olarak %18 oranında büyümekteyiz.”

“İyi. Nimbus’ın yapması gereken en önemli şey nedir?”

“Siparişleri işlemek,” dedi Leo.

“Özellikle,” diye ekledi Carlos.

“Bir siparişin yerleştirilmesinden sonraki beş saniyede restorana ulaşması gerekir, aksi takdirde mutfak zaman penceresini kaçırır,” dedi Priya, “veya müşteri şikayet eder. Partner restoranımızı kaybederiz.”

“Yani beş saniyelik SLA,” dedi Carlos, “bir teknik hedef değil. Bir iş hayatta kalma gereksinimidir.”

Sessizlik.

“Bu,” dedi, “mimari sohbetlerinin iş gereksinimleriyle başlaması gerektiğinin neden olduğunu gösteriyor. Teknoloji kısıtlamadan sonra gelir.”

**Mimari İnceleme Yapısı**

Gerçek bir mimari inceleme — önemli bir şey inşa etmeden önce veya ölçeklendirme konusunda değerlendirirken meydana gelen — bir yapıya sahiptir.

Carlos bunu kara tahtaya yazdı:

**1. Kısıtlamaları Anlayın**

Ne doğru olmalı? Ne olmamalı? (“Ne istiyoruz” değil. Bunlar müzakere edilemez olanlar nelerdir?)

**2. Bilmediğinizi Anlayın**

Ne bilmiyoruz? Hangi varsayımlarda bulunuyoruz? Bu varsayımlar yanlışsa ne olur?

**3. Seçenekleri Değerlendirin**

Gerçekçi alternatifler nelerdir? Her birinin avantajları ve dezavantajları nelerdir?

**4. Arıza Modlarını Belirleyin**

Bu nasıl başarısız olur? Her arıza modunun tetiklenmesiyle olay dizisi nedir?

**5. İzleme Doğrulatın**

Bir şey yanlış olduğunda bunu nasıl bileceksiniz? Kullanıcılar size söylemeden önce mi?

**6. Çalışma Kitabını Tanımlayın**

Bu arızalandığında ne yapılır? 3 AM'de ne yapılır?

Bu, mekanik olarak takip edilmesi gereken bir kontrol listesi değildir. Bu, önemli soruların üretim ortamına girmeden önce sorulmasını sağlamayı amaçlayan bir düşünce çerçevesidir.

**İncelemeyi Çalıştırma: Nimbus’ın Yeni Özelliği**

Carlos’u özellikle Nimbus’ın yeni bir şey inşa etmeye hazırlanması nedeniyle davet etmişti.

**Özellik**: “Nimbus Instant” — 15 dakikalık teslimat garantisi. Bir ortak restoran, 15 dakikadan daha fazla süre içinde zaman penceresini bir hafta içinde bir kez aşarsa, Nimbus müşteriye otomatik olarak para iadesi yapardı.

“Bana teknik gereksinimleri anlat,” dedi Carlos.

Priya başladı. “Sipariş durumunu teslimat sırasında izleme ihtiyacımız var. Uygulama ortasında çökmesi durumunda, durumu olaylardan tek başına yeniden yapılandırabilir miyiz?”

“Olay akışı için gecikme gereksinimi nedir?”

“Yakın gerçek zamanlı. Müşteriler telefonlarında durum güncellemelerini görür.”

“Ne kadar içinde?”

“5 saniye muhtemelen.”

“Muhtemelen?”

“5 saniyede. Bu, ürün gereksinimidir.”

“İyi. Kinesis’i kullanalım. Kinesis gecikirse ne olur?”

“Durum güncellemeleri müşteriye ulaşmaz.”

“Bu kabul edilebilir mi?”

“10 saniye için mi? 60 saniye için değil.”

“Yani izleme sisteminin SLA’sı nedir?”

Priya Leo’ya baktı. “Henüz bir tane yok.”

Carlos tahtaya yazdı: *Belirsiz: izleme SLA.*

“Bu önemli,” dedi. “Çünkü SLA, altyapı tasarımını belirler. 5 saniyelik bir SLA’nız varsa, 60 saniyelik bir SLA’nız varsa farklı bir çözümünüz olur.”

**Mimarların Sorduğu Sorular**

Sonraki iki saat boyunca Carlos, ekibi incelemeye yönlendirdi. Bir dizi sorusu:

**Veri depolama konusunda:**

“Sipariş durumu, teslimat sırasında nasıl depolanır? Uygulama ortasında çökmesi durumunda kurtarma süreci nedir? Olaylardan tek başına durumu yeniden yapılandırabilir miyiz?”

**İade mekanizması konusunda:**

“İade işlemi otomatik olarak tetiklenir. İadenin iki kez verilmesini engelleyen nedir? Ödeme işlemcinin zamanın tükenmesi durumunda, iadenin kabul edildiğinden emin olamazsanız ne olur?”

**Teslimat Takibi Hakkında:**

“Kurye GPS verilerine güveniyorsunuz. GPS sinyali 90 saniye kaybedilirse ne olur? ‘GPS Kaybı’nı, ‘Teslimat Devam Ediyor’ durumunu ve ‘Teslimat Sorunu’nu nasıl ayırt edersiniz?”

**Arıza Yönetimi Hakkında:**

“İade hizmeti kapalıysa sipariş hala tamamlanacak mı? Müşteri yiyeceğini hala alacak mı? Bir kısmi sistem arızası sırasında kullanıcı deneyimi nasıl olur?”

**İzlenebilirlik Hakkında:**

“Mevcut 15 dakikalık SLA’nın 5 dakika içinde olan siparişlerin sayısını şu anda nasıl anlarsınız? Bu sayı yükselirse kim bilgilendirilir?”

Bu sorular, ekibin farkında olmadan yaptıkları varsayımları ortaya çıkardı.

“Çift iade problemini düşünmedik,” dedi Leo daha sonra. “Sadece ödeme API’sini arayacağız.”

“Yanlış değil,” dedi Priya. “Ama idempotensiye ihtiyacın var. İade işlemi, iki kez çağrıldığında güvenli olmalı.”

“Bir idempotens key – aynı iade denemesi için benzersiz bir ID, ödeme API’sini çağırmadan önce veritabanında saklanır. Aynı anahtarla iki kez çağırırsak, ödeme API ikinci çağrıyı atlar.”

“Yani,” Carlos ekledi, “ödeme işlemlerinde bir tutarlı durum depolama ihtiyacınız var, sadece bir kuyrukta bir olay değil.”

Bu, yapılandırılmış bir incelemede ortaya çıkan mimari ayrıntılardan biridir - ve sadece inşa ederken ortaya çıkmaz.

**Mimari Karar Kaydı (ADR)**

İnceleme sonrası Carlos, ekibin kararlarını **Mimari Karar Kayıtları (ADR)**’larda beltelemelerini önerdi — kısa belgelerle:

- **Hangi karar alındı**
- **Hangi alternatifler göz önünde bulunduruldu**
- **Bu kararın neden alınması (zamanın ve kısıtlamaların bağlamı)**
- **Bu kararın ne gibi sonuçları var**
- **Bu kararın ne zaman gözden geçirilmesi gerektiğini belirleyecek ne olur**

“ADR’lar sizin gelecekteki kendinize yöneliktir,” dedi Carlos. “18 ay sonra, bir mimariyi görerek neden o şekilde yapıldığını merak edeceksiniz. Eğer bir ADR’niz varsa, bağlamı anlayacaksınız. Yoksa, onu değiştireceksiniz (neden yapıldığını anlamadığınız için).”

Leo, öğleden sonra ilk ADR’yi yazdı: Kurye olayları için Kinesis’in kullanım kararını, göz önünde bulundurulan alternatifleri (SQS, EventBridge, sorgulama), ve sonuçlarını belirterek.

**Bir Mimari Tasarımcı Olmak**

O sırada Maya, Carlos’a orijinal soruyu sordu: “Mimari kararlar almak ve bir mimari tasarımcı gibi düşünmek arasındaki fark nedir?”

O düşündü.

“Bir mimari, bir kıdemli mühendisin sahip olduğu kadar çok teknolojiyi bilmez,” dedi. “İyi bir mimari, en son çerçevelerden biraz daha az bilgi sahibi olabilir. Ancak bir mimari, farklı varsayımlı soru kümesine sahiptir.”

“Ne demek istediğinizi?”

“Yeni bir özellik üzerinde çalışan bir kıdemli mühendis için ilk sorularınız genellikle şunlardır: ‘Ne inşa etmeliyiz? Nasıl çalışır? Bu için en iyi kütüphane hangisidir?’ Bir mimari için aynı özelliği ele alırken ilk sorularınız şunlardır: ‘Bu özellik neyi çözüyor? Trafik iki katına çıktığında ne kırılıyor? Sistem bozulduğunda nasıl anlarız? Ödeme işlemcinin yavaş olması durumunda kullanıcı deneyimi nasıl olur?’”

“Mimari, sistemin stres altında nasıl olduğunu sorar,” dedi Leo.

“Ve her arızanın iş sonuçlarını,” Priya ekledi.

“Ve,” Tom dedi, “bu ölçeklendirildiğinde fatura ne olur?”

Carlos başını salladı. “Hepiniz zaten bunu yapıyorsunuz. Bunu ilk bölümden beri yapıyorsunuz. Bir mühendisin veya unvanın mimari olmasını belirleyen şey değildir. Bir mimari, bir sonraki soruyu sormaya daha yatkındır - henüz düşünmediğiniz şeyi ortaya çıkaran soru.”

**Güçlü Yönler ve Sınırlamalar**

**Mimari İncelemeleri:**

- Üretimde ortaya çıkmadan önce arıza modlarını yakalar
- Genellikle farklı bilgi sahibi olan ekip üyeleri arasında ortak bir anlayış yaratır
- (ADR’lar, diyagramlar, karar günlükleri) yıllarca fayda sağlayacak belgeler üretir
- “Hızlı ilerle”yi faydalı bir şekilde yavaşlatır — bir inceleme yapmadan “hızlı ilerle ve duvara tokatla”

**Nerede Karmaşık Hale Gelir:**

- Doğru soruları sorabilen yeterince yetenekli bir kişi gerektirir — inceleme, gözden geçiren kişinin kalitesine bağlıdır
- Bir kontrol kutusu olarak ele alındığında bürokratik hale gelebilir
- Bazı mimari kararlar tam bir inceleme gerektirmez — hangilerinin yapması gerektiğini bilmek de mimari bir beceridir
- (ADR’lar, diyagramlar, karar günlükleri) çıktısı, sistemin evrimiyle birlikte korunmalıdır

Sonraki bölümde: yazılım mühendisliğinde en faydalı, en sinir bozucu ve en dürüst cevap olacaktır.

## Özet

- **Mimari gözden geçirme** işlemleri, **iş gereksinimleriyle başlar, teknolojiden değil.**
- **Gözden geçirme yapısı:** Kısıtlamalar → Bilinmeyenler → Seçenekler → Başarısızlık modları → İzleme → Çalışma kitapları.
- Mimarlar şunu sorar: Ne ilk kırılır? Bunu bozulduğunu nasıl anlarız? Başarısızlık sırasında kullanıcı deneyimi nedir? Ölçekte maliyet nedir?
- **Mimari Karar Kayıtları (ADR'lar)**, ne kararlaştırıldığını, nedenini ve yeniden gözden geçirme nedenini yakalar.
- Bir mimar gibi düşünmek bir alışkanlıktır: Bir sonraki soru sormak, özellikle başarısızlık modları, iş sonucu ve ölçek ekonomisi hakkında.
- Karar vermek ve bir mimar olmak arasındaki fark, varsayılan soru kümesidir: Mimarlar varsayılan olarak sistem düzeyinde ve başarısızlık sorularına odaklanır, sadece uygulama sorularına değil.

## Sınav İpuçları

*SAA-C03 Alanı: Çoklu alan — mimari akıl yürütme*

Bu bölüm, sınavın test ettiği zihniyetten daha azdır, belirli sınav konularından.

- **SAA-C03 senaryoları** neredeyse her zaman bir iş kısıtlamasıyla başlar ("şirket, 1 saatten fazla bekleme süresini kaldıramaz") ve size bu kısıtlamaya uyan mimariyi seçmenizi ister. İş kısıtlamalarını teknik gereksinimlere çevirme pratiği yapın.
- **Başarısızlık modu düşüncesi:** Birçok sınav sorusu bir sistemi tanımlar ve bir bileşen başarırsa ne olur sorar. "Ne ilk kırılır?" diye sormayı için pratiğe geçin. Karşılaştığınız mimariler için.
- **Fiyatlandırma düşüncesi:** Sınavın "mükemmel" bir cevabı yoktur. Bir dizi kısıtlamaya göre *en iyi* cevabı istemektedir. Belirli gereksinimlere göre başka bir seçenek daha iyi olsa bile, bu seçenek doğru olduğunda.
- **Yeniden çalışabilirlik:** Çift iade sorunu gerçek dağıtılmış sistem zorluğudur. Benzersiz her işlem için kullanılan yeniden çalışabilirlik anahtarları standart çözümdür. Bu kalıbı bilin.
- **Mimari Karar Kayıtları:** AWS hizmeti değildir, ancak İyi Yapılmış Çerçeve'nin Operasyonel Mükemmeliyet sütununu yansıtan bir en iyi uygulamadır.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Mimari gözden geçirme sırasında Carlos altı türde soru sordu. Onları bakmadan yeniden yapılandırabilir misiniz?

*(İpucu: Bunlar "Mimari Gözden Geçirme Yapısı" bölümünde listelenmiştir. Onları belleğinizden hatırlamaya çalışın — başarısız olsanız bile başarısızlık denemesi (hatta) uzun vadeli tutmayı güçlendirir.)*

**Alıştırma 2 — Sınav Pratiği**

*Senaryo:* Online reklamcılık için gerçek zamanlı bir teklif yönetimi sistemi oluşturuluyor. Teklifler 100 milisaniyede değerlendirilmeli ve yanıtlanmalıdır. Sistem, zirvede 1 milyon teklifi saniyede işliyor. Teklif sistemi çökerse, şirket reklam gelirlerini kaybeder. Şirketin veritabanı ekibi, 10 okuma replikasıyla Aurora RDS kullanmayı öneriyor. Mimari çözüm, bu teklifi değerlendirmeli ve değerlendirmeli.

Mimari çözüm için ilk olarak hangi endişeyi gündeme getirmeli?

A) 10 Aurora okuma replikasının maliyeti, bütçeye çok yüksek.
B) Aurora okuma replikaları, tutarsızlık sorunlarına neden olabilecek replikasyon gecikmesine sahiptir.
C) Aurora'nun tipik sorgu gecikmesi 1-5ms'dir ve bu da 100ms'lik SLA'yı karşılamayabilir.
D) RDS Aurora, 1 milyon istek/saniye hızında bu gecikme gereksinimini karşılamak için işlem hacmini desteklemez.

**İpucu 1**: Ana kısıtlamanın 100ms toplam yanıt süresi 1 milyon istek/saniyede olmasıdır. Bu kısıtlamayı tehdit eden hangi endişeyi doğrudan karşılar?

**İpucu 2**: Aurora sorgu gecikmesi tipik olarak 1-5ms'dir. 1-5ms'lik veritabanı sorgusu 95-99ms'lik ağ, uygulama mantığı ve seri hale getirme için bırakır. 100ms kısıtlaması risk altında mı?

**İpucu 3**: Aurora yüksek IOPS'yi işleyebilir, ancak 1 milyon istek/saniyede bu, olağanüstü bir hızdır. Bu ölçekte mimari ne olur?

**Cevap**: D

**Açıklama**: Aurora yüksek performanslı olsa da, 1 milyon istek/saniyede 100ms toplam yanıt süresi, aşırı bir gereksinimdir. Bu gereksinimleri karşılayan bir ilişki için, ilişkisel veritabanları (SQL söz dizimi ile) bu tür bir hızda ana arama sistemi olarak hizmet edemez. 1M RPS ve 100ms toplam SLA, tipik Aurora verim özelliklerinden daha fazladır.

**Çapraz alan — Sistem Tasarımı**

**Alıştırma 3 — Mimari Zorluğu *(İsteğe bağlı)*

Mimari gözden geçirme yapısını gerçek veya varsayımsal bir sistem için uygulayın:

Bir startup, gerçek zamanlı çok oyunculu bir bilgi yarışması oyunu oluşturmak istiyor. Oyuncular oyun odalarına katılıyor (her birinde en fazla 10 oyuncu olabilir). Her tur, 15 saniye boyunca bir soru gösterir; tüm oyuncular aynı anda cevap verir. Skorlar her sorunun ardından anında hesaplanır. Oyunlar 10 tur sürer. En yüksek kullanım: 50.000 eş zamanlı oyun.

Aşağıdaki altı adımlı incelemeyi uygulayın:

1.  Nelere kesin olarak uymak zorundasınız?
2.  Bilinmeyenler ve varsayımlar nelerdir?
3.  Gerçekçi teknoloji seçenekleri nelerdir?
4.  Başarısızlık modları nelerdir?
5.  Zayıflamayı ne zaman anlayacaksınız?
6.  3 AM çalıştırılabilir kılavuzu nasıl görünür?

*(Tek bir doğru cevap yoktur. Amaç, bu düşünce aracını uygulamak için inceleme yapısını pratikleştirmektir.)*

## Kredili Sahne

Carlos, saat 18:00'de ofisten ayrıldı.

Takım, daha sonra biraz oturdu, özel olarak bir şey yapmadan.

"Bu iki saat içinde, herhangi bir AWS hizmeti bölümünden daha fazla şey öğrendiğimi hissediyorum," dedi Leo.

"Çünkü bu bölümler araçlar hakkında," dedi Maya. "Burada yargı yürütülüyordu."

"Yargı öğretilebilir mi?" diye sordu.

"Evet," dedi Priya. "Ama okumakla değil, pratikle, kararlar alarak, neyin kırıldığını görerek, nedenini düşünerek."

"Deneyim yoluyla," dedi Tom.

"Yapılandırılmış deneyim yoluyla," diye düzeltti Priya. "Yansıma olmadan deneyim, yargı oluşturmaz. Sonrasında soruları sormanız gerekir."

Maya, tahtaya baktı. Notlar hala oradaydı - kısıtlamalar, bilinmeyenler, başarısızlık modları, izleme soruları. İki tahtayı dolduruyordu.

"Bunları ADR'ye girmeli," dedi.

Leo zaten yazıyordu.

Son bölümdeki: bir araç veya çerçeve size veremeyeceği tek bir şey – ve “duruma göre” cevabının yazılım mimarisi için en dürüst ve güçlü yanıt olduğu neden.
