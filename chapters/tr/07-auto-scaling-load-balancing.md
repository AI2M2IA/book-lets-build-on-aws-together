# Bölüm 7: Yoğun Olduğunda Büyüyen Restoran

Cuma akşamı saat 7:43'te hata oranı %12'ye yükseldi.

Tom bunun farkında ilk kişi oldu çünkü Tom her zaman ilk farkında olan kişidir. Bulut İzleyici (CloudWatch) paneline açtığı bir sekmesini, diğer insanların sosyal medyayı kontrol etme şeklini — refleksif, sürekli, tam olarak anlamadan — yenileyerek yenileyordu.

"Leo," dedi.

Leo zaten bakıyordu. Yanıt süreleri: artıyor. Bekleyen istekler: artıyor. Tek EC2 örneği — hatta onları geçen ay daha büyük olanı — %94 CPU'da.

"Müşterileri reddediyoruz," dedi Tom.

"Onları reddetmiyoruz," dedi Leo. "Sunucu bunu yapıyor."

"Bu aynı şey."

İşte öyleydi. Ve üç hafta boyunca her Cuma böyle olmuştu. Nimbus depolama krizi — veritabanı kendi diskinizdi, fotoğraflar S3'te yaşıyordu — ancak istikrarlı ve ölçeklenebilir tamamen farklı sorunlardı. Sistem çalışıyordu. Sadece büyümedi.

Takımın sistemlerinin değişken yükü otomatik olarak işlemesi gerekiyordu. En kötü senaryo için yeterli sayıda sunucu satın almak ve sakin zamanlarda para boşa harcamak zorunda kalmamalıydı. Trafik zirvesi olduğunda manuel olarak telaş etmemeliydi.

Bu için bir kalıp vardı. AWS, bunu uygulayan iki hizmete sahipti.

**Konsept: Yatay Ölçekleme**

Bir sistemin yükünü daha fazla işlemesi için iki yol vardı.

**Dikey ölçekleme** tek sunucuyu daha büyük yapmak anlamına gelir. Daha fazla CPU. Daha fazla RAM.
Bu, t3.micro'yu t3.large'a yükseltirken yapmıştık. Yardımcı olur.
Ama sınırlamaları var: ne kadar büyük olabileceğinizi sadece sınırlayabilir, örneğin yeniden başlatılması gerekir, ve hala tek bir arıza noktası vardır.

**Yatay ölçekleme** daha fazla sunucu eklemek anlamına gelir. Bir büyük sunucu yerine beş orta sunucu çalıştırmak. Trafik azaldığında iki çalıştırın. Bir zirve olduğunda on çalıştırın.

Yatay ölçeklemenin avantajları dikeyde yoktur:

- Tek bir arıza noktası yoktur. Bir sunucu ölürse, diğerleri hizmet vermeye devam eder.
- Kapasiteyi eklemek için yeniden başlatmaya gerek yoktur.
- Kullanılanlere ödeme yaparsınız — ihtiyacınız olduğunda sunucuları ekleyin, ihtiyacınız olmadığında kaldırın.
- Doğrusal ölçekleme: sunucu sayısı iki katına çıkarsa, yaklaşık olarak throughput'u da iki katına çıkarır.

İşin zor tarafı: birden fazla sunucunuz varsa, kullanıcıların hangi birine ulaşması gerektiğini nasıl bilirler?

**Uygulama Yük Dengeleyici: Bir Kapı, Birçok Oda**

**Uygulama Yük Dengeleyici** (ALB), uygulamanızın ön kapısıdır.

Kullanıcılar yük denleyicisine bağlanır. Yük denleyicisi, gelen istekleri mevcut sunucularınızın kütlesi üzerinde dağıtır. Her kullanıcı bir adres görür (yük denleyicinin URL'si). Bu adrese istekler, çalışan sunucuların sayısına bağlı olarak dağıtılır.

Bunu, büyük bir restoranda resepsiyon görevlisinin kapıda dinleyip müşterileri mevcut masalara yönlendirdiği gibi düşünebilir. Görevli meşgul masaları ve boş olanları bilir. Müşteriler kaç masa olduğunu bilmeye gerek yoktur — sadece içeri girerler ve görevli dağıtımı halleder.

Bir ALB, bu şekilde web istekleri için çalışır. Gelen her HTTP isteğini alır ve rotasını, örneğin:

- Round-robin (her sunucu dönüşümlü olarak sırayla alır)
- En çok açık istek (en çok açık olan sunucuya bir sonraki istek gönderilir)
- Sağlık — yalnızca sağlıklı hedefler trafiği alır

**Sağlık Kontrolleri** çok önemlidir. ALB, her hedefe test istekleri gönderir.
Bir hedef doğru şekilde yanıt vermezse, ALB onu sağlıksız olarak işaretler ve ona trafik göndermez. Hedef iyileşirse, trafik yeniden başlar.

Bu otomatik. Sağlık kontrolü parametrelerini yapılandırırsınız; ALB bunları zorlar.

**Otomatik Ölçekleme: Daha Fazla Masa Açan Restoran**

Bir ALB trafiği mevcut sunucularınız arasında dağıtır. Ancak, daha fazlasına ihtiyaç duyduğunuzda sunucuları eklemez.

**Otomatik Ölçekleme** yapar.

Bir **Otomatik Ölçekleme Grubu** (ASG) yapılandırmasıdır:

- Her zaman çalışır durumda olması gereken minimum sayıda örnek
- İzin verilen maksimum örnek sayısı
- Ölçekleme dışa (örnekleri eklemek) veya ölçekleme içeri (onları kaldırmak) için koşullar

Bu koşullara **politika** denir. En yaygın tür:

**Hedef Takibi**: "Ortalama CPU kullanımını %70'de tutun." Ortalama CPU %70'yi aşarsa, AWS yeni örnekler başlatır. CPU düştüğünde örnekler sonlandırılır.

Bu otomatik. Kimse metrikleri izlemesi gerekmiyor. Kimse sunucuları manuel olarak başlatması gerekmiyor. Sistem, yükü gerçek zamanlı olarak tepki verir.

Sofia, Cuma gecesi yoğunluğunda sunucu sayısının 2'den 5'e, ardından yoğunluğun azaldığı 2'ye geriye dönüştüğünü ilk kez canlı olarak izlediğinde bunu söyledi.

"Bu," dedi, "gerçekten etkileyici."

Tom, maliyet grafiğini izliyordu. Yoğunluk sırasında fatura arttı ve yoğunluk azaldıktan sonra düştü. "Sadece kullandıklarımız için ödedik," dedi, aynı derecede etkilenmişti.

**ALB ve ASG'nin Birlikte Çalışması**

İki hizmet, birlikte kullanılmak üzere tasarlanmıştır.

Alb’ı önünüze yerleştirirsiniz. Alb, trafiği alacak **hedef gruplara** — sağlıklı durumdaki örneklerin bir koleksiyonuna yönlendirir. Auto Scaling Grubu (ASG) bu örnekleri yönetir: trafiği genişletirken ekler, trafiği daraltırken kaldırır.

Akış:

1. Trafik Alb’a gelir
2. Alb, sağlıklı hedeflere istekleri dağıtır
3. Hedeflerde CPU/yük yükselir
4. ASG, yük artışını algılar, yeni örnekler başlatır
5. Yeni örnekler sağlık kontrollerini geçerek Alb ile kayıt olur
6. Alb, onlara trafiği göndermeye başlar
7. Yük azalır, ASG fazla örnekleri sonlandırır
8. Alb, sonlandırılan örneklere trafiği göndermeyi bırakır

Bu, herhangi bir insan müdahalesi olmadan gerçekleşir.

**Başlangıç Şablonları: Yeni Örnekler İçin Tasarım**

ASG yeni bir örnek başlatırken, ne başlatması gerektiğini bilmesi gerekir. Bu, **Başlangıç Şablonu** ile tanımlanır — bir AMI, bir örnek türü, uygulanacak güvenlik grupları ve herhangi bir kullanıcı verileri (örnek başlatıldığında çalışan başlangıç betikleri).

Yaygın bir kalıp: Uygulamanızı özel bir AMI'ye (Bölüm 4'te açıklanmıştır) kurarsınız. ASG yeni bir örnek gerektiğinde, bu AMI'yi başlatır. Yeni örnek, uygulamanızın zaten kurulu olduğuyla başlatılır. Herhangi bir kurulum gerekli değildir.

Daha dinamik ortamlarda, başlatma sırasında en son kodunuzu çekip kuran **başlatma betikleri** de kullanabilirsiniz. Bu daha esnektir ancak başlatma süresi daha uzundur.

Doğru seçim, örneklerinizin ne kadar sürede başlatması gerektiği ve uygulamanızın ne kadar sıklıkla değiştiği ile ilgilidir.

**Sabitleme Oturumları: Bir Sakarca Sorun**

Yük dengeleyicilerini ilk uygularken birçok ekibin takıldığı bir şey var.

Bazı web uygulamaları oturum verilerini — giriş durumu, alışveriş arabası içeriği — sunucunun kendisinde depolar (bellekte veya yerel diskte). Bu, tek bir sunucuyla sorunsuz çalışır.
Birden çok sunucuyla, sorun çıkarır.

Bir kullanıcı oturum açar. İstek Sunucu A'ya gider. Sunucu A oturumu depolar. Bir sonraki istek Sunucu B'ye gider. Sunucu B oturumu yoktur. Kullanıcı çıkmış görünür.

Bu, iki şekilde ele alınabilir:

**Sabitleme oturumları** (veya oturum sadeliği): Alb'in aynı kullanıcıya her zaman aynı sunucuya istek göndermesini yapılandırması gerekir. Bu, kısa vadeli bir çözümdür. Yük dengelemesini baltalar (bazı sunucular diğerlerinden daha fazla "sabitleme" kullanıcıya sahip olur) ve bir örneğin sonlandırılması durumunda sorunlara neden olur.

**Durumsuz uygulama tasarımı**: Oturum verilerini harici olarak depolar — bir veritabanında veya ElastiCache (Bölüm 10) gibi bir önbellekte. Her sunucu, harici depodan herhangi bir kullanıcının oturumunu yeniden oluşturabilir. Sunucular değiştirilemez hale gelir. Bu, yatay olarak ölçeklenebilir uygulamalar için doğru yaklaşımdır.

Priya bunu "çok sunuculu giderken yaptığınız en önemli mimari karar" olarak adlandırdı. Haklıydı. Bunu Bölüm 10'da tekrarlaşıyoruz.

**Yük Dengeleyicilerinin Türleri**

AWS, trafiğe uygun üç tür yük dengeleyici sunar:

**Uygulama Yük Dengeleyici (ALB)**: HTTP ve HTTPS trafiği. Katman 7 (HTTP'yi anlar). URL yoluna (`/api` bir gruba, `/static` başka bir gruba) veya ana başlıklarına veya sorgu parametrelerine göre yönlendirebilir. Bu, çoğu web uygulaması tarafından kullanılır.

**Ağ Yük Dengeleyici (NLB)**: TCP, UDP ve TLS trafiği. Katman 4 (HTTP'yi anlamaz). Milyonlarca istek/saniye, çok düşük gecikme süresi. Hangi hız veya HTTP ile uğraşmadığınızda ihtiyacınız olan şeydir.

**Kapı Yük Dengeleyici (GWLB)**: Üçüncü taraf sanal ağ cihazlarına (güvenlik duvarları, saldırı tespit sistemleri) trafiği yönlendirmek için kullanılır. Junior düzeyde nadiren ihtiyacınız olur.

Nimbus (ve çoğu web uygulaması için) için ALB doğru seçimdir.

## Güçlü ve Zayıf Yönler

**ALB + Otomatik Ölçekleme Güçlüdür**:

- Kesinti olmadan ölçekleme (örnekler eklenir/çıkarılır mevcut bağlantıları kesmeden)
- Otomatik geçiş (sağsız örnekler trafihten otomatik olarak kaldırılır)
- Maliyet verimliliği (çalışan örnekler için yalnızca ödeme yapın)
- Tek bir arıza noktası yoktur — birden çok örnek birden çok AZ'de

**Karmaşık Hale Geldiği Yerler**:

- Durumsuz uygulamalar özel işlem gerektirir (sabitleme oturumları veya harici durum)
- Ölçekleme dışa doğru zaman alır — trafik anında bir zirveye çıkarsa, yeni örneklerin hazır olmasını beklemek için bir gecikme olur. Bu, **planlı ölçekleme** (bilinen olaylardan önce ölçeklendirme) veya daha büyük bir minimum örnek sayısı ile azaltılabilir
- Daha fazla hareketli parça, daha fazla izlenmesi ve hata ayıklanması gerekir
- Bazı uygulamalar yatay olarak ölçeklenemez (veritabanları, belirli eski sistemler). Yatay ölçekleme, durumsuz katmanlar için en iyi şekilde çalışır.

## Özet

- **Yatay Ölçekleme** (daha fazla sunucu eklemek) dikey ölçeklemeye (bir sunucuyu daha büyük yapmak) tercih edilir çünkü tek arıza noktalarını ortadan kaldırır ve esnek maliyet sağlar.
- Bir **Uygulama Yük Dengeleyici (ALB)**, gelen HTTP/HTTPS trafiğini birden fazla EC2 hedefi arasında dağıtır. Sağlık kontrolleri yapar ve sağlıklı olan örneklere yönlendirir.
- Bir **Otomatik Ölçekleme Grubu (ASG)**, tanımlanmış ölçekleme politikalarına (örneğin, hedef CPU kullanımı) göre EC2 örneklerinin sayısını otomatik olarak ayarlar.
- ALB ve ASG birlikte çalışır: ASG filoyu yönetirken, ALB bu filoya trafik dağıtır.
- Durum bilgisi olan uygulamalar ya yapıcı oturumları (geçici bir çözüm) kullanmalı ya da durumu haricelleştirmeli (doğru uzun vadeli tasarım).
- HTTP trafiği için ALB kullanın. Ham TCP/UDP performansı için NLB kullanın.

## Sınav İpuçları

*SAA-C03 Alan 2 — Görev 2.1 (ölçeklenebilir mimariler) / Alan 3 — Görev 3.2*

- **ASG sağlık kontrolleri EC2'den veya ALB'den gelebilir.** EC2 sağlık kontrolleri yalnızca örneğin çalışıp çalışmadığını algılar. ALB sağlık kontrolleri, uygulamanın doğru şekilde yanıt verip vermediğini algılar. ALB sağlık kontrolleri daha kapsamlıdır ve web uygulamaları için tercih edilmelidir.
- **Hedef Takibi Ölçekleme en yaygın sınav cevabıdır** ölçekleme politikaları için. Basit ölçekleme (alarm yandığında N örneği eklemek) daha eski ve daha az uyarlanabilirdir.
- **Yatay ölçekleme hızlıdır; dikey ölçekleme yavaştır.** AWS, ölçekleme sırasında örnekleri kademeli olarak sonlandırır, böylece aktif bağlantıları bozmamak için — ALB'nin **kaydolma gecikmesi** ayarı tarafından kontrol edilen bir davranış.
- **Minimum örnek sayısı, dayanıklılık zeminidir.** Minimum = 1 ve o örnek başarırsa, uygulamanız ASG tepki vermeden önce kapanır. Minimum ≥ 2 ve AZ'ler arasında dağıtarak gerçek dayanıklılık sağlayın.
- **ALB, trafiği AZ'ler arasında otomatik olarak dağıtabilir.** Çapraz bölge yük dengelemesi etkinleştirildiğinde, her ALB düğümü kayıtlı tüm hedeflere eşit olarak istekleri dağıtır, bölgenin herhangi bir fark etmediğinden bağımsız olarak. Bu, AZ örneklerinin sayıları farklı olduğunda dengeli yük oluşturmak için önemlidir.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizde: Uygulama Yük Dengeleyici ve Otomatik Ölçekleme Grubu arasındaki fark nedir? Her biri hangi sorunu çözüyor ve neden genellikle birlikte kullanılırlar?

*(İpucu: Bir tanesi zaten var olan trafiği dağıtır; diğeri sahip olduğunuz kapasite miktarını ayarlar.)*

**Alıştırma 2 — Sınav Uygulaması**

*Senaryo*: Bir perakendecinin e-ticaret web sitesi, değişken trafik deneyimleridir: hafta içi düşük trafik, hafta sonları ve flash satış etkinlikleri sırasında büyük zirveler. Uygulamalarının zirve yükleri işlemesini sağlamak istiyor ancak sakin dönemlerde kullanılmayan kapasiteyi sürdürmek istemiyor. Uygulama, oturum verilerini sunucu belleğinde saklıyor.

Bu ölçeklenebilirlik gereksinimlerini en iyi şekilde karşılayan mimari değişiklik hangisidir?

A) En yüksek trafik sırasında işleyebilen çok büyük tek bir EC2 örneğine yükseltin
B) Bir ALB ile birden fazla EC2 örneğini ve oturum depolamasını ElastiCache'e dışarıdan aktararak, bir ASG ile dağıtın
C) Bir ALB ile birden fazla EC2 örneğini ve oturum oturumlarını etkinleştirilmiş sticky oturumlarla dağıtın
D) Beklenen her trafik zirvesi için önceden EC2 örneklerini manuel olarak ekleyin ve zirveler sona erdikten sonra bunları kapatın

**İpucu 1**: "Kullanılmayan kapasiteyi sürdürmemek" otomatik ölçekleme anlamına gelir, sabit büyük bir örnek veya manuel yönetim değil.

**İpucu 2**: Oturum sorunu, çoklu örnek dağıtımlarında bir sorundur. Hangi seçenekler bu sorunu ele alır?

**İpucu 3**: Seçenek C, sticky oturumları kullanır — bu bir düzeltme değil, bir çözümdür. Hangi seçenek hem ölçekleme hem de oturum depolama sorununu doğru şekilde ele alır?

**Cevap**: B

**Açıklama**: ALB ile ASG, otomatik, elastik ölçekleme sağlar — örnekler zirvelerde eklenir ve sakin dönemlerde çıkarılır. Oturum depolamasını ElastiCache'e (dış bir önbellek) taşımak, uygulamayı durumsal hale getirir: herhangi bir kullanıcı için herhangi bir örneğin işleyebileceği, ALB'nin trafiği özgürce dağıtabileceği bir uygulama. Bu, mimari olarak doğru çözümdür.

**Neden A?** Bir büyük örnek, ne kadar büyük olursa olsun, yine de tek bir arıza noktasıdır. Ayrıca sakin dönemlerde çoğu kapasitesi boşta olduğunda para boşa harcamak anlamına gelir.

**Neden C?** Sticky oturumlar, bir kullanıcıyı aynı örneğe yönlendirir, bu kısmen oturum sorununu hafifletir ancak yük dengelemesini baltalar. O örnek başarırsa (ölçekleme sırasında veya bir arıza durumunda), kullanıcı yine de oturumunu kaybeder.

**Neden D?** Manuel ölçekleme, trafik zirvelerini doğru bir şekilde tahmin etmeyi ve önceden harekete geçmeyi gerektirir. Yavaş, hataya açık ve zahmetlidir. Otomatik Ölçekleme bunu otomatik olarak ele alır.

*SAA-C03 Alan 2 — Görev 2.1 / Alan 3 — Görev 3.2*

**Alıştırma 3 — Mimari Zorluğu *(İsteğe bağlı)***

Sofia, Maya ve Tom, bir promosyon ekibiyle birlikte çalışıyor. Nimbus, önümüzdeki Cumartesi günü saat 18:00'de tüm siparişlerde %50 indirim sunacak. Ekip, bu zirvenin aniden ve tam 4 saat süreceğini bekliyor.

Auto Scaling sonunda tepki verecek, ancak bir gecikme olacak. Bu bilinen ani yükseliği nasıl tasarlarsınız? Reaktif ve proaktif ölçekleme arasındaki fark nedir ve her biri ne zaman mantıklı olur?

*(Tek bir doğru cevap yok. Planlı ölçekleme eylemleri, ön ısıtma ve her yaklaşımın maliyet etkilerini düşünün.)*

## Kredili Sahne

Auto Scaling ve ALB'yi dağıttıktan sonraki ilk Cuma günü, ekip birlikte metrikleri izledi.

19:15: İki örnek çalışıyor. Normal yük.
19:45: Yük yükseliyor. Auto Scaling iki ek örnek başlatıyor.
20:00: Dört örnek zirveyi karşılıyor. Yanıt süreleri istikrarlı.
21:30: Yük düşüyor. Auto Scaling iki örnek sonlandırıyor.
21:45: Tekrar iki örnekle geri dönüyor.

Web sitesi hiç düşmedi. Bir kere bile.

Leo, olası bir hatayı kaçırmış gibi metrikler sayfasını üç kez güncelledi.

"Hiç bozulmayan bir şey beklemiyordum, değil mi?" dedi.

"Evet," dedi Priya.

Tom faturala bakıyordu. Maliyet trafiğe neredeyse mükemmel bir şekilde uyum sağlamıştı. "Kullandığımız kadar ödedik," dedi. "Daha fazla, daha az değil."

Gerçekten şaşırmış gibi görünüyordu.

Maya ertesi sabah hata günlüklerinde yeni bir sorun buldu. Bir kesinti değil - daha da kötü.

"Veritabanımız," dedi, "ortalama olarak sekiz saniye sorgu süresi veriyor."

Sekiz saniye. Bir restoran sipariş uygulaması için.

"Herkes menüyü yüklediğinde, veritabanındaki tüm öğeleri kullanarak sayfayı oluşturuyoruz," dedi Leo. "Ve şimdi otuz yedi restoranımız var."

Tom soruyu sordu: "Toplam kaç menü öğesi var?"

Leo sorguyu çalıştırdı.

"Yaklaşık yirmi iki bin."

Sessizlik.

Sonraki bölümde: bir DBA gerektirmeyen veritabanı – sadece bir kredi kartı.
