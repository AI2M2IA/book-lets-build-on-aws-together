# Bölüm 23: Kendini Sıralayan Dosya Sistemi

Bir hukuk firması aktif dava dosyalarını masada tutar. Tamamlanan davalar bir dosya dolabına girer. Üç yıl önceki davalar bodrumdaki depolama kutularına girer. On yıl önceki davalar, kutu başına kuruşlara mal olan ama herhangi bir şeyi geri almanın iki gün sürdüğü tesis dışı bir arşiv tesisine girer.

Aynı bilgi, ne sıklıkta erişildiğine bağlı olarak farklı maliyetlerle saklanır.

---

İş akışı otomasyonu yerine oturmuş ve sipariş akışı sonunda kararlı hâle gelmişken, Tom maliyet incelemesine geri dönmüştü. S3 faturası, önceki çeyrekten beri aklının bir köşesinde duruyordu—kimsenin doğrudan bakmadan büyümeye devam eden o satır kalemlerinden biri. Sonunda bakacak zamanı vardı.

Leo'yu yanına çağırdı.

"S3'te 4,2 terabaytımız var," dedi Leo kontrol ettikten sonra.

"Neyin?"

"Restoran fotoğrafları. Sipariş fişleri. Analiz dışa aktarımları. 18 ay önceki yedek anlık görüntüleri."

"En son birisi 18 ay önceki bir yedeğe ne zaman erişti?"

Leo erişim günlüklerini kontrol etti.

"Geçen Ekim," dedi. "Bir kez. Yedek formatını doğrulamak için."

"Yani 18 aylık yedekler için tam S3 Standard fiyatlandırmasıyla ödeme yapıyoruz."

"Evet."

"Bu ayda ne kadara mal oluyor—Glacier vs Standard?" diye sordu Tom, zaten fiyatlandırma sayfasını açarak.

S3 Standard: GB başına ayda 0,023 dolar. S3 Glacier Instant Retrieval: GB başına ayda 0,004 dolar.

Tom matematiği yaptı.

"Bu faturayı önemli ölçüde azaltabiliriz," dedi, "sadece eski veriyi daha ucuz depolamaya taşıyarak."

"Neyin eski olduğunu bilmemiz gerekir," dedi Leo.

"S3 biliyor. Son erişim zamanını izliyor."

**S3 Depolama Sınıfları: Tüm Spektrum**

Bölüm 5, S3 Standard'ı birincil depolama sınıfı olarak tanıttı. S3'ün aslında her biri farklı erişim kalıpları için tasarlanmış sekiz depolama sınıfı vardır (sekizincisi, **S3 Express One Zone**, gecikmeye kritik iş yükleri için özelleşmiş tek-AZ bir sınıftır ve yüksek performans senaryoları dışında nadiren görünür):

**S3 Standard**: Sık erişilen veri için. Düşük gecikme (milisaniyeler). En yüksek maliyet. Minimum depolama süresi yok. Aktif veri için kullanın: mevcut menü fotoğrafları, bugünkü siparişler, son günlükler.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Ayda bir kezden az erişilen veri için. Standard ile aynı milisaniye geri alma, ama daha düşük depolama maliyeti + GB başına geri alma ücreti. 30 günlük minimum depolama süresi. Eriştiğinizde hemen ihtiyaç duyduğunuz ama nadiren eriştiğiniz veri için kullanın: eski sipariş fişleri, 6 aylık analiz dışa aktarımları.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: S3 Standard-IA ile aynı (30 günlük minimum dahil) ama yalnızca bir Erişilebilirlik Bölgesinde saklanır (üç yerine). Daha az dayanıklı (o AZ bir felaket yaşarsa, veri kaybolabilir), ama %20 daha ucuz. Kaybolursa yeniden oluşturulabilen veri için kullanın: küçük resim önbelleği, geçici işleme çıktıları.

**S3 Glacier Instant Retrieval**: Ara sıra ihtiyaç duyduğunuz arşivlenmiş veri. Milisaniye geri alma. Çok düşük depolama maliyeti, daha yüksek GB başına geri alma maliyeti. 90 günlük minimum depolama. Çeyrekte bir kez veya daha az erişilen veri için kullanın: çeyreklik uyumluluk raporları, 12 aylık yedek anlık görüntüleri.

**S3 Glacier Flexible Retrieval**: Derin arşiv, dakikalardan saatlere geri alınır. Glacier Instant Retrieval'dan daha düşük maliyet. Daha az aciliyeti olan arşiv verisi için kullanın.

**S3 Glacier Deep Archive**: En düşük maliyetli seçenek. 12 saatte geri alınır. 180 günlük minimum depolama. Düzenleyici uyumluluk için saklanması gereken ama asla erişilmesi beklenmeyen veri için kullanın: 7 yıllık vergi kayıtları, 10 yıllık denetim günlükleri.

Kalıp: erişim sıklığı azaldıkça, maliyet azalır ama geri alma süresi artar (ve geri alma başına maliyet artar). Erişim kalıbınıza uyan sınıfı seçin.

**S3 Yaşam Döngüsü Politikaları: Otomatik Dosyalama Sistemi**

Dosyaları depolama sınıfları arasında manuel olarak taşımak hataya açık ve zaman alıcıdır. S3 **yaşam döngüsü politikaları (lifecycle policies)**, tanımladığınız kurallara göre bunu otomatikleştirir.

Bir yaşam döngüsü kuralının iki bileşeni vardır:

**Filtre**: Kuralın hangi nesnelere uygulanacağı (tüm nesneler, belirli bir önekli nesneler, belirli etiketli nesneler).

**Eylemler**: Ne yapılacağı, kaç gün sonra.

Nimbus'un sipariş fişleri için örnek yaşam döngüsü politikası:

```
90 günden sonra S3 Standard-IA'ya geçir
365 günden sonra S3 Glacier Instant Retrieval'a geçir
540 günden sonra (18 ay) S3 Glacier Flexible Retrieval'a geçir
2555 günden sonra (7 yıl) S3 Glacier Deep Archive'a geçir
2920 günden sonra (8 yıl) sil
```

Bu tek politika şunları sağlar:

- Aktif fişler (< 90 gün): S3 Standard, hızlı erişim
- Yeni fişler (90-365 gün): Standard-IA, ucuz ama anında kullanılabilir
- Eski fişler (1 yıldan 18 aya): Glacier Instant, çok ucuz, ihtiyaç duyulduğunda milisaniyeler
- Tarihsel fişler (18 aydan 7 yıla): Glacier Flexible, daha da ucuz—geri alma milisaniyeler değil, saatler sürer
- Süresi dolmuş fişler (> 8 yıl): Otomatik olarak silinir

Bir tuzak planı neredeyse raydan çıkarıyordu. 2024 sonundan beri, yaşam döngüsü kuralları **varsayılan olarak 128 KB'den küçük nesneleri geçirmez**—ve Nimbus'un fişleri ortalama her biri 18 KB idi. Politikanın onları gerçekten taşımasını sağlamak için, Leo kuraldaki varsayılan minimum nesne boyutunu geçersiz kılmak zorunda kaldı (yaşam döngüsü filtreleri `ObjectSizeGreaterThan`/`ObjectSizeLessThan` ile boyuta göre de seçebilir). Varsayılan iyi bir nedenle var: arşiv sınıfları nesne başına ~40 KB meta veri ek yükü faturalandırır ve her geçiş bir istek ücretine mal olur, bu yüzden milyonlarca minik nesne için geçiş, tasarruf ettiğinden daha pahalıya mal olabilir. Leo fişler için matematiği yaptı—yedi yıllık saklamada, yine de karşılığını veriyordu.

Tom öngörülen tasarrufları gözden geçirdi: ayda 847 dolardan yaklaşık 220 dolara.

"Sadece... neyin eski olduğunu ve nereye gitmesi gerektiğini tanımlayarak mı?" dedi.

"Ve S3 onu otomatik olarak taşır," diye onayladı Leo. "Cron işi yok. Manuel göç yok. Unutma yok."

"Bekle—ama S3 *neden* bunu varsayılan olarak yapmıyor?" diye sordu Maya odanın diğer ucundan. "Neden bir politika tanımlamak zorundasınız ki?"

"Çünkü 'eski' her paket için farklıdır," dedi Leo. "Bir uyumluluk arşivi ve bir fotoğraf yüklemesi tamamen farklı saklama kuralları gerektirir. S3 hangisinin hangisi olduğunu tahmin edemez."

Şunu merak ediyor olabilirsiniz: yanlış veri Glacier'a taşınırsa ve ona acilen ihtiyacınız olursa ne olur? Bir geri alma ücreti öder ve beklersiniz—bu yüzden yaşam döngüsü kurallarınızı önce küçük, kritik olmayan bir pakette test etmeli ve üretim verisine yaymadan önce erişim günlüklerini doğrulamalısınız. 18 aylık yedekte bir geri alma hatası, müşteriye dönük bir olaydan çok daha az maliyetli olurdu, ama yine de önce test etmeye değer.

Verinizin erişim kalıbı öngörülebilirse (günlükler 30 günden sonra her zaman soğuktur), açık yaşam döngüsü kuralları kullanın—Intelligent-Tiering'in nesne başına izleme ücretinden daha maliyet verimlidirler. Erişim kalıplarınız zamanla değişiyorsa veya tahmin etmesi zorsa, Intelligent-Tiering kullanın—ama 128 KB'den küçük nesneleri basitçe yok saydığının farkında olun: izlenmezler, izleme ücreti alınmaz ve asla Frequent Access katmanından ayrılmazlar.

**S3 Intelligent-Tiering: Kendini Düzenleyen Sınıf**

Verinize ne sıklıkta erişeceğinizi bilmiyorsanız ne olur?

**S3 Intelligent-Tiering**, her nesne için erişim kalıplarını izler ve otomatik olarak onu erişim katmanları arasında taşır:

- **Frequent Access katmanı**: Son zamanlarda erişilen nesneler için
- **Infrequent Access katmanı**: 30 gündür erişilmeyen nesneler
- **Archive Instant Access katmanı**: 90 gündür erişilmeyen nesneler
- **Archive Access katmanı**: 90-730 gündür erişilmeyen nesneler (isteğe bağlı)
- **Deep Archive Access katmanı**: 180-730+ gündür erişilmeyen nesneler (isteğe bağlı)

S3 Intelligent-Tiering nesne başına aylık küçük bir izleme ücreti alır (1.000 nesne başına 0,0025 dolar), ama Frequent ve Infrequent katmanları için geri alma ücreti almaz.

Intelligent-Tiering'i şu durumda kullanın:

- Erişim kalıpları öngörülemez veya zamanla değişiyor
- Kolayca sınıflandıramadığınız sıcak ve soğuk veri karışımınız var
- 128KB'den büyük nesneleriniz var (daha küçük nesneler hiç izlenmez veya otomatik katmanlanmaz)

Açık depolama sınıflarını (yaşam döngüsü politikalarıyla) şu durumda kullanın:

- Erişim kalıpları öngörülebilir
- Her nesnenin—küçükler dahil—gerçekten daha ucuz sınıflara taşınmasını istiyorsunuz
- Nesneler küçük (< 128KB)

Küçük dosya uyarısı vurgulanmayı hak ediyor. Nimbus'un S3'te 2,3 milyon sipariş fişi nesnesi vardı—her biri ortalama yaklaşık 18KB olan küçük bir JSON dosyasıydı. Tom önce fişler paketi için Intelligent-Tiering düşünmüştü, ta ki ince yazıyı okuyana kadar.

128KB'den küçük nesneler Intelligent-Tiering'de **izlenmez ve otomatik katmanlanmaz**. İzleme ücretini ödemezler (ayda 1.000 nesne başına 0,0025 dolar)—ama aynı zamanda asla taşınmazlar: sonsuza dek, Standard-eşdeğeri fiyatlarla, Frequent Access katmanında otururlar.

Yani 18KB'lik fişler için, Intelligent-Tiering Nimbus'a hiçbir ekstra maliyet getirmezdi—sadece hiçbir şey *yapmazdı*. 2,3 milyon soğuk fiş, Arşiv katmanları (0,00099 $/GB) ulaşılamaz dururken, süresiz olarak sıcak depolama fiyatları (0,023 $/GB) ödemeye devam ederdi.

"Yani Intelligent-Tiering büyük nesneler için tasarlanmış," dedi Maya.

"Veya erişim kalıbını gerçekten bilmediğiniz iş yükleri için," dedi Tom. "Fişlerin 90 gün boyunca sıcak ve sonrasında soğuk olduğunu bildiğimiz minik dosyaların olduğu bir paket için, açık bir yaşam döngüsü kuralı—daha önceki küçük nesne geçersiz kılmasıyla—onları gerçekten taşıyan tek şey."

Intelligent-Tiering mükemmel bir hizmettir. Sadece her paket için doğru araç değildir: 128KB eşiğinin altında zararsız ama yararsızdır ve yalnızca açık yaşam döngüsü kuralları (boyut geçersiz kılmasıyla) küçük nesneleri katmanlandırır.

**Veriyi Gerçekten Geri İstediğinizde: Bir Glacier Geri Alma Hikâyesi**

Yaşam döngüsü politikaları dağıtıldıktan üç ay sonra, Nimbus bir yasal bildirim aldı. Eski bir restoran ortağı bir sözleşme şartına itiraz ediyordu ve Nimbus'un avukatlarının o ortak için 18 aylık sipariş kayıtlarına ihtiyacı vardı—açılıştan sözleşme feshine kadar her şey.

"Peki birisi yasal keşif süreci aracılığıyla içeri girmeye çalışırsa?" dedi Priya. Şaka yapmıyordu. "Toplu veri dışa aktarımı talep eden avukatlar yaygın bir sosyal mühendislik vektörüdür. Herhangi bir veri deposunu açmadan önce talebin meşru olduğunu doğrulayın."

Talep meşruydu. Kayıtlar S3'te, üç depolama sınıfı arasındaydı: en son 90 gün Standard-IA'da, önceki yıl Glacier Instant Retrieval'da, geri kalanı Glacier Flexible Retrieval'da (yaşam döngüsü politikası 18 aydan eski veri için Flexible kullanmıştı).

Glacier Instant kayıtları hemen kullanılabilirdi. Leo restoran kimliğine göre filtreledi, eşleşen sipariş kayıtlarını belirlemek için bir Athena sorgusu çalıştırdı ve onları güvenli bir S3 konumuna dışa aktardı. Beş dakikalık iş.

Glacier Flexible kayıtları bir geri yükleme talebi gerektirdi:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **Standard katmanı**: 3-5 saat. Kayıtlar 7 gün boyunca S3 Standard'da geçici bir kopya olarak kullanılabilir olurdu, sonra otomatik olarak kaldırılırdı. Orijinal arşivlenmiş kopya Glacier'da kalır.

Tüm geri almanın maliyeti: Standard katmanında geri alınan GB başına 0,01 dolar, 4,2 GB arşivlenmiş kayıt için. Yaklaşık dört sent. (Expedited katmanı—1 ila 5 dakika—GB başına 0,03 dolara mal olur, ama kullanılabilirliği Standard'ın olduğu gibi garanti edilmez.)

"Dört sent," dedi Maya, Leo geri bildirimde bulunduğunda. "18 aylık kayıt için."

"4,2GB'ı GB başına ayda 0,0036 dolardan bir buçuk yıl sakladık," dedi Leo. "Depolama maliyeti toplam yaklaşık yirmi yedi sentti. Geri alma maliyeti dörttü. 18 ay boyunca S3 Standard'da tutsaydık bir dolar yetmiş dörde karşılık."

"Ve önemli olan tek şey," dedi Priya, "onun Flexible Retrieval'da olduğunu hatırlamamız ve 3-5 saatlik beklemeyi planlamamızdı. Avukatlar buna 30 dakikada ihtiyaç duysaydı, bir sorunumuz olurdu."

Glacier hakkındaki önemli operasyonel ders budur: sadece bir maliyet kararı değil, bir geri alma SLA kararıdır. Veriyi Glacier Flexible veya Deep Archive'a arşivlemeden önce, ona ihtiyaç duyabilecek herkes için geri alma süresini belgeleyin. "Veri var" ve "onu 30 dakikada alabiliriz" iki farklı garantidir.

**Çok Parçalı Yükleme: Büyük Nesneler İçin**

S3'ün 5GB'lık tek yükleme sınırı vardır. Daha büyük nesneler için, **çok parçalı yükleme (multipart upload)** kullanmalısınız: nesneyi parçalara bölün, her birini paralel olarak yükleyin ve S3 onları birleştirir.

Faydaları:

- Daha hızlı yüklemeler (paralel)
- Başarısız yüklemeler devam ettirilebilir (yalnızca başarısız parçaları yeniden yükleyin)
- 5GB'den büyük nesneler için gerekli

Yaşam döngüsü kuralı ipucu: Tamamlanmamış çok parçalı yüklemeleri 7 gün sonra silmek için bir yaşam döngüsü kuralı ayarlayın. Bir yükleme yarıda başarısız olursa ve temizlenmezse, o kısmi parçalar saklanır ve ücretlendirilir—gösterilecek birleştirilmiş bir nesne olmadan.

Tom bu ipucunu son derece takdir etti.

Tüm Nimbus paketlerindeki tamamlanmamış çok parçalı yüklemeleri listelemek için AWS CLI komutunu çalıştırdı:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Çıktı beklediğinden daha uzundu. Onu bir sayaca aktardı.

340 tamamlanmamış yükleme. En eskisi 8 ay öncesindendi—Leo'nun restoran fotoğrafı yükleme akışı yük testi. Yük testi yüzlerce kısmi yükleme oluşturmuştu, hiçbiri tamamlanmamıştı (test onları tamamlamak için değil, sadece başlatma uç noktasını test etmek için tasarlanmıştı). 340 tamamlanmamış yükleme, S3'te oturuyor, her biri AWS'nin sakladığı ve ücretlendirdiği kısmi veriyi temsil ediyordu.

"Bu ayda ne kadara mal oluyor?" dedi Tom. Bilgi için sormuyordu. Yüksek sesle hesaplıyordu.

Tamamlanmamış parçaların toplam boyutu: 48 GB. 0,023 $/GB'den: ayda 1,10 $. Sekiz ay için: zaten harcanmış 8,80 $.

Mevcut büyüme oranında, temizlenmezse: süresiz olarak devam ediyor.

"Leo," dedi Tom.

"Onu zaten dağıttım—ah," dedi Leo, gelirken. "Yük testi. Kısmi yüklemeleri temizlemeyi unuttum."

"Sekiz ay önce."

"Yükleme hiç tamamlanmasa bile S3'ün parçaları sakladığını bilmiyordum."

"Onları saklıyor. Onlar için ücret alıyor. Ve sizi bu konuda uyaran bir pano yok. Sadece birikiyorlar."

Çözüm: tamamlanmamış çok parçalı yükleme parçalarını 7 gün sonra silmek için bir yaşam döngüsü kuralı.

```
Kural: Tamamlanmamış çok parçalı yükleme parçalarını sil
Önek: (tüm nesneler)
Eylem: 7 gün sonra tamamlanmamış çok parçalı yüklemeleri sil
```

Mevcut 340 yükleme manuel olarak temizlendi. Yaşam döngüsü kuralı, gelecekteki hiçbir yük testinin veya başarısız yüklemenin aynı şekilde birikmemesini sağlar. Sekiz aydır sessizce büyüyen ayda 1,10 dolar durdu—dolar olarak küçük, ama kalıp (görünmez, büyüyen, sınırsız) öldürülmeye değer kısımdı.

"Kural üç satır," dedi Tom. "Onu oluşturmada her pakete ayarlamalıydım." Paket oluşturma kontrol listesini güncelledi: her yeni S3 paketi varsayılan olarak bir çok parçalı yükleme temizleme kuralı alır.

**Üç Güvenlik Katmanı: Yan Yola Sapmadan Önce Hızlı Bir Özet**

"Peki birisi içeri girip denetim günlüklerini silmeye çalışırsa?" diye yeniden sordu Priya—bu sefer belirli bir tehdit modeli bağlamında. "Sadece yanlış yapılandırılmış bir yaşam döngüsü kuralı değil. Kötü niyetli bir içeriden kişi. Yazma erişimi olan ele geçirilmiş bir IAM anahtarı."

Ekibin cevapları zaten vardı—sadece onları bu pakete uygulamamışlardı. Üç katman, her biri kitapta daha önce ele alınmış, her biri farklı bir tehdit vektörünü ele alıyor:

**Sürümleme (Versioning)** (bölüm 5), silmeleri geri alınabilir kılar—bir DELETE bir silme işaretçisi olur ve önceki sürümler geri yüklenebilir kalır. Sipariş fişleri gibi tek-yazımlık veri için, depolama ek yükü minimaldir: nesne başına yalnızca tek bir sürüm vardır.

**S3 Object Lock** (bölüm 5), nesneleri gerçekten değişmez kılar—saklama süresi boyunca bir yönetici anahtarının bile silemeyeceği WORM depolama. 7 yıllık vergi saklama gereksinimleriyle fişler için, ekip Compliance modunu seçti: hiçbir yaşam döngüsü yanlış yapılandırması, hiçbir IAM hatası, hiçbir ele geçirilmiş kimlik bilgisi onları denetçi sormadan önce kaldıramaz. Ve Object Lock yaşam döngüsü geçişleriyle bir arada var olur—fişleri Glacier Deep Archive'a taşıyan bir kural hâlâ çalışır; veri ucuzlar ve değişmez kalır.

**CloudTrail S3 veri olayları** (bölüm 16-17), veriye ne olduğunu söyler: her GET, PUT, DELETE ve COPY, kimin, nereden ve ne zaman yaptığıyla günlüğe kaydedilir—GuardDuty'nin (bölüm 17) anormallikleri uyarmak için kullandığı ham malzeme.

"Kaza kurtarma için sürümleme. Uyumluluk değişmezliği için Object Lock. Adli analiz için CloudTrail," diye özetledi Priya. "Bunların her birini tek başına ele aldık. Bugünkü yeni karar, bu paket için üçünü de açmak."

**Bölgeler Arası Replikasyon: Felaket Kurtarma Olarak Sipariş Kayıtları**

Nimbus sipariş fişleri paketi us-west-2'deydi. Bu kasıtlıydı—us-west-2 uygulamanın çalıştığı yerdi. Ama "uygulama us-west-2'de" ve "tüm sipariş kayıtları yalnızca us-west-2'de" farklı risk profilleridir.

Nimbus'un us-east-1'de bir felaket kurtarma sitesini etkinleştirmesi gerekirse, sipariş kayıtlarının da orada olması gerekirdi. Bölgesel bir arızanın ortasında onları kopyalamak için beklemek bir kurtarma planı değildir.

Priya sipariş fişleri paketi için **Bölgeler Arası Replikasyon (Cross-Region Replication, CRR)** önerdi. Kural:

```
Kaynak: nimbus-order-receipts (us-west-2)
Hedef: nimbus-order-receipts-dr (us-east-1)
Replikasyon: Tüm nesneler
Hedefteki depolama sınıfı: S3 Standard-IA (daha ucuz — bu DR kopyası, nadiren erişilir)
```

Mekanik bölüm 5'ten tanıdıktı: yeni yazmaların asenkron replikasyonu (çoğu nesne 15 dakika içinde; garantili bir SLA, **S3 Replication Time Control** için ödeme gerektirir), her iki pakette de gerekli sürümleme, kaynak-oku/hedef-yaz iznine sahip bir IAM rolü. Yukarıdaki kuralda dikkat edilmeye değer detay: hedef, kaynaktan *farklı bir depolama sınıfı* kullanır—nadiren okunan ikinci bir Standard kopya için ödemek yerine DR kopyası için Standard-IA. Ve sürümleme önkoşulu hiçbir ekstra maliyete yol açmadı—kaza kurtarma için zaten sürümlemeyi etkinleştiriyorlardı. (CRR'nin kardeşi, **Aynı Bölge Replikasyonu (Same-Region Replication, SRR)**, nesneleri *aynı* bölgedeki paketler arasında kopyalar—ayrı bir hesapta bir uyumluluk kopyası, günlük toplama veya üretim verisinden tohumlanan test ortamları için yararlı.)

Priya birisi ona çarpmadan önce belirttiği bir tuzak: replikasyon **geriye dönük değildir**. Kuralı etkinleştirdiğinizde pakette zaten var olan nesneler replike edilmez—yalnızca yeni yazmalar. Ekipler tüm mevcut verilerinin hedefte görüneceğini bekleyerek CRR'yi etkinleştirir, sonra DR paketinin neredeyse boş olduğunu keşfeder. Önceden var olan nesneler için, **S3 Batch Replication** çalıştırırsınız, bu replikasyon kurallarını zaten orada olan nesnelere uygulayan ayrı bir işlemdir. Nimbus, DR paketini mevcut 0,8 TB fişle tohumlamak için onu bir kez çalıştırdı.

"Peki silme işaretçileri?" diye sordu Priya. "Birisi us-west-2'de bir fiş silerse, silme us-east-1'e replike olur mu?"

Varsayılan olarak hayır—mevcut replikasyon yapılandırmalarında (konsolun oluşturduğu V2 şeması), **silme işaretçileri replike edilmez**. Birisi us-west-2'de bir fiş siler ve us-east-1 kopyası hiçbir şey olmamış gibi onu sunmaya devam eder. DR paketinin silmeleri yansıtmasını *istiyorsanız*, silme işaretçisi replikasyonunu kuralda açıkça etkinleştirirsiniz (etiket filtreli kurallarda desteklenmez)—bu, eski materyalin hâlâ tanımladığı eski V1 şemasında varsayılandı. Her iki durumda da, yaşam döngüsü süre dolmaları silme işaretçilerini asla replike etmez.

Replikasyon yine de bir yedekleme çözümü *değildir*—zıt nedenlerle: kalıcı sürüm silmelerine veya kötü niyetli üzerine yazmaların aynaya replike olmasına karşı koruma sağlamaz ve saklama anlambilimi yoktur. Gerçek yedekleme için, sürümlemeyi Object Lock ile eşleştirin veya AWS Backup kullanın.

"Bu ayda ne kadara mal oluyor?" diye sordu Tom.

us-east-1'de S3 Standard-IA'da 0,8 TB için depolama: ayda 10,00 dolar. Artı replikasyon veri aktarımı (bölgeler arası aktarılan GB başına ücretlendirilir): mevcut yazma hacimlerinde minimal. Toplam ek maliyet: tüm sipariş kayıtlarının eksiksiz bir bölgeler arası kopyası için kabaca ayda 10-11 dolar.

Tom bunu şikâyet etmeden not aldı.

**S3 Storage Lens: Tam Resmi Görme**

Tom denetimini manuel yapmıştı—AWS konsolunu paket paket açma, nesneleri saymak için AWS CLI komutları çalıştırma, paket başına depolama maliyetleri için faturalandırma gezginini kontrol etme. O elektronik tabloyu oluşturmak öğleden sonrasının çoğunu almıştı.

**S3 Storage Lens**, o manuel süreci değiştiren AWS aracıdır. Tüm paketler, tüm hesaplar ve tüm bölgeler arasında S3 kullanımı ve etkinliğine kuruluş genelinde görünürlük sağlar—tek bir panoda.

Maliyet optimizasyonu için en önemli metrikler:

**Güncel olmayan sürüm baytları**: Eski sürümler tarafından ne kadar depolama tüketildiği (sürümleme etkinleştirildiğinde). Sürümleme güvenlik için gereklidir, ama bir belge sık güncellenirse, eski sürümler birikir. Güncel olmayan sürümleri 30 gün sonra süresi dolduran bir yaşam döngüsü kuralı, sürüm şişkinliğini önler.

**Tamamlanmamış çok parçalı yükleme baytları**: Tam olarak Leo'nun yük testiyle neden olduğu sorun, otomatik olarak yüzeye çıkarıldı. Storage Lens olmadan, Tom tamamlanmamış çok parçalı yüklemeleri aramayı bilmek zorundaydı. Storage Lens ile, panoda bir satır kalemi olarak görünürler.

**% 403 dönen istekler**: Herkese açık olması gereken bir pakette 403 (Yasaklı) yanıtlarında bir sıçrama, yanlış yapılandırılmış bir paket politikasını gösterebilir. Özel bir pakette bir sıçrama, bir tarama veya yoklama girişimini gösterebilir. Her iki durumda da, araştırmaya değer bir sinyaldir.

**Ortalama nesne boyutu**: Minik nesnelerden oluşan bir paket (ortalama 2KB), Intelligent-Tiering ekonomisi, istek maliyetleri ve Athena için sorgu performansı açısından büyük nesnelerden oluşan bir paketten (ortalama 50MB) farklı davranır.

S3 Storage Lens'in temel metrikleri kapsayan bir ücretsiz katmanı vardır. Gelişmiş metriklerin (istek istatistikleri, filtreleme için lens grupları) ayda milyon nesne başına ek bir maliyeti vardır—sağladığı tasarruflara göre küçük.

"Bunu neden baştan kullanmadık?" diye sordu Maya.

"Baştan 4,2 terabaytımız yoktu," dedi Tom. "Küçük ölçekte, bir elektronik tablo işe yarar. Bu ölçekte, ölçeğin kendisi araç için bir argüman hâline gelir."

Bu, Nimbus mimarisinde tekrar eden bir tema: belirli bir ölçek için doğru araç her zaman bir sonraki ölçek için doğru araç değildir. S3 Storage Lens, S3 kullanımınız bir öğleden sonra manuel olarak denetleyebileceğinizin ötesine büyür büyümez yapılandırmaya değer—ki bu kabaca sağladığı tasarrufların kazandırdığı zamanı anlamlı şekilde aşmaya başladığı zamandır.

## Güçlü Yönler ve Sınırlamalar

**S3 Depolama Katmanları Neden Önemlidir**:

- Gerçekten erişilen şey için dayanıklılık veya kullanılabilirlikten ödün vermeden önemli maliyet azaltma
- Yaşam döngüsü politikaları tüm süreci otomatikleştirir—operasyonel yük yok
- S3 Intelligent-Tiering erişim kalıplarını tahmin etme ihtiyacını ortadan kaldırır

**Karmaşıklaştığı Yer**:

- Glacier sınıflarına minimum depolama süresi ücretleri uygulanır (Glacier Instant için 90 gün, Deep Archive için 180 gün)—erken silmek yine de minimum ücrete neden olur
- Arşivlenmiş veriye sık erişirseniz geri alma ücretleri sizi şaşırtabilir
- Yaşam döngüsü geçişleri zaman alır—kural tetiklendikten sonra nesneler anında taşınmaz
- Intelligent-Tiering 128KB'nin altındaki nesneleri yok sayar—ücret yok, ama katmanlama da yok; ve minimum nesne boyutunu geçersiz kılmadıkça yaşam döngüsü kuralları onları varsayılan olarak atlar

## Özet

Bölüm 22'deki iş akışı otomasyonu, Nimbus'un istekleri nasıl işlediğini optimize etti. Bu bölüm, Nimbus'un sakladığı ama erişmediği veri için ne ödediğini optimize eder. İlke aynıdır: yanlış katman için ödeme yapmayı bırakın.

- S3'ün sekiz depolama sınıfı vardır: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive—artı Express One Zone (özelleşmiş düşük gecikme, tek AZ).
- **Yaşam döngüsü politikaları** yaşa göre depolama sınıfları arasındaki geçişleri otomatikleştirir—bir kez tanımlayın, S3 onu sonsuza dek halleder.
- **S3 Intelligent-Tiering**, gerçek erişim kalıplarına göre nesneleri katmanlar arasında otomatik olarak taşır—128KB'den büyük nesnelerle öngörülemez iş yükleri için kullanın. Daha küçük nesneler izlenmez veya otomatik katmanlanmaz (ve izleme ücreti ödemez)—Frequent Access katmanında kalırlar.
- **Glacier geri alma**, Flexible ve Deep Archive katmanları için bir geri yükleme talebi gerektirir. Geri alma için bir SLA'sı olan herhangi bir veriyi arşivlemeden önce geri alma süresini (dakikalardan 12 saate) planlayın.
- **Tamamlanmamış çok parçalı yüklemeler** sessizce birikir ve depolama ücretlerine neden olur. Her pakete tamamlanmamış parçaları 7 gün sonra silmek için bir yaşam döngüsü kuralı ekleyin.
- **Üç güvenlik katmanı**: sürümleme (geri alınabilir silmeler), Object Lock (uyumluluk için değişmezlik), CloudTrail veri olayları (adli analiz ve anormallik tespiti).
- **Bölgeler Arası Replikasyon (CRR)**: sipariş kayıtlarını otomatik olarak bir DR bölgesine replike edin. Her iki pakette de sürümleme gerektirir. DR kopyasının bir ayna mı yoksa bir yedek mi olduğuna göre silme işaretçilerinin replike olup olmayacağını yapılandırın.
- **Çok parçalı yükleme**, 5GB'den büyük nesneler için gerekli ve 100MB'den büyük herhangi bir şey için önerilir.
- **S3 Object Lock**, uyumluluk senaryoları için WORM depolama sağlar—Governance modu yöneticiler tarafından geçersiz kılınabilir; Compliance modu kimse tarafından geçersiz kılınamaz.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama (Alan 4, Görev 4.1)*

- **Depolama sınıfı seçim sinyalleri**:
  - "Sık erişilen" → Standard
  - "Ayda bir kez erişilen, anında geri alma gerekli" → Standard-IA
  - "Saatlerce geri alma süresini tolere edebilir, nadiren erişilen" → Glacier Flexible Retrieval
  - "Düzenleyici uyumluluk, 7+ yıl saklama, asla erişilmeyen" → Glacier Deep Archive
  - "Bilinmeyen veya değişen erişim kalıpları" → Intelligent-Tiering
- **Yaşam döngüsü politikası sınav kalıpları**: "veri yaşlandıkça depolama maliyetlerini otomatik olarak azalt," "90 günden sonra arşive geçir" → yaşam döngüsü politikaları.
- **Intelligent-Tiering ve küçük nesneler**: 128KB'nin altındaki nesneler izlenmez, izleme ücreti ödemez ve asla otomatik katmanlanmaz—Frequent Access'te kalırlar. Yaşam döngüsü kuralları da varsayılan olarak 128KB altı nesneleri atlar (geçersiz kılınabilir). Sınav her iki gerçeği de test edebilir.
- **CRR gereksinimleri**: Sürümleme hem kaynak hem hedef pakette etkinleştirilmelidir. Kaynak ve hedef farklı bölgelerde olmalıdır.
- **S3 Object Lock**: "WORM," "değişmez," "SEC 17a-4," "silinemez veya değiştirilemez" → Object Lock. Governance modu (yöneticiler tarafından geçersiz kılınabilir). Compliance modu (kök dahil kimse tarafından geçersiz kılınamaz).
- **Glacier geri yükleme**: Glacier'daki nesneler hemen kullanılabilir değildir. Erişim için S3 Standard'a bir kopya "geri yüklemeniz" gerekir. Geri yüklenen kopya geçicidir (süreyi siz ayarlarsınız). Orijinal Glacier'da kalır.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

S3 Standard-IA ile S3 Glacier Instant Retrieval arasındaki farkı açıklayın. Hangi erişim kalıbı her birini uygun kılar?

*(İpucu: Veriye ne sıklıkta erişeceğinizi ve eriştiğinizde ona ne kadar hızlı ihtiyaç duyduğunuzu düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket günde 500GB uygulama günlüğü üretiyor. Günlükler ilk 7 gün boyunca yoğun sorgulanıyor (ayıklama ve izleme). 7 günden sonra, günlüklere nadiren erişilir ama gerekirse 30 dakika içinde kullanılabilir olmalı. 1 yıldan sonra, günlükler uyumluluk için saklanmalı ama asla erişilmez. Şirketin bu gereksinimleri karşılarken depolama maliyetlerini en aza indirmesi gerekiyor.

Bu gereksinimleri EN İYİ hangi S3 yaşam döngüsü politikası karşılar?

A) 7 gün S3 Standard'da sakla; 7 günden sonra S3 Glacier Deep Archive'a geçir; 365 günden sonra süresini doldur  
B) 7 gün S3 Standard'da sakla; 7 günden sonra S3 Standard-IA'ya geçir; 365 günden sonra S3 Glacier Flexible Retrieval'a geçir  
C) 1. günden itibaren tüm günlükleri S3 Intelligent-Tiering'de sakla  
D) 7 gün S3 Standard'da sakla; 7 günden sonra S3 Glacier Instant Retrieval'a geçir; 365 günden sonra S3 Glacier Deep Archive'a geçir

**İpucu 1**: "30 dakika içinde kullanılabilir" hangi depolama sınıfını eler?

**İpucu 2**: Deep Archive geri almak 12 saat sürer—7-365 günler için 30 dakika gereksinimini karşılamaz.

**İpucu 3**: 365 günden sonra, geri alma süresi önemli değil (asla erişilmiyor), bu yüzden en ucuz seçenek geçerlidir.

**Cevap**: D

**Açıklama**: 7 gün S3 Standard sık erişimi ele alır. Glacier Instant Retrieval, 7-365 günler için milisaniye erişim sağlar—Standard-IA'dan önemli ölçüde daha düşük maliyetle 30 dakika gereksinimini karşılar. 365 günden sonra, Glacier Deep Archive asla erişilmeyen veri için en ucuz seçenektir.

**Neden A değil?** Glacier Deep Archive geri almak 12 saat sürer—7-365 günler için "30 dakika kullanılabilirlik" gereksinimini karşılamaz.

**Neden B değil?** Standard-IA burada ilk durak bile olamaz: S3, bir yaşam döngüsü kuralının onları Standard-IA veya One Zone-IA'ya geçirebilmesi için nesnelerin Standard'da 30 gün yaşlanmasını gerektirir—bu yüzden "7 günden sonra Standard-IA" geçersiz bir kuraldır. (30 günlük kural Glacier sınıflarına uygulanmaz, ki D'nin işe yaramasının tam nedeni budur.) Ve bunu bir kenara bıraksak bile, Glacier Instant Retrieval, 7. günden sonra nadiren erişilen veri için önemli ölçüde daha ucuzdur.

**Neden C değil?** Intelligent-Tiering'in nesne başına bir izleme ücreti vardır ve günlükleri açık yaşam döngüsü kuralları kadar agresif şekilde arşiv katmanlarına taşımayabilir. Öngörülebilir erişim kalıbına sahip büyük hacimli günlükler için, açık yaşam döngüsü kuralları daha maliyet verimlidir.

*SAA-C03 Alanı: Maliyet Optimize Edilmiş Mimariler Tasarlama — Görev 4.1*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus'un farklı özelliklere sahip üç tür S3 verisi var:

- Restoran fotoğrafları: bir kez yüklenir, müşteriler tarafından birçok kez erişilir, asla silinmez
- Sipariş fişleri: ilk ay müşteriler tarafından erişilir, vergi amaçları için 7 yıl tutulur
- Analiz dışa aktarımları: günlük oluşturulur, sonraki hafta analiz edilir, 2 yıl tutulur

Her biri için bir yaşam döngüsü politikası tasarlayın. Restoran fotoğrafları için Intelligent-Tiering mantıklı olur mu? Sipariş fişleri için, 1 ay ile 7 yıl arasındaki pencereyi hangi depolama sınıfı kapsar? Analiz dışa aktarımları için, farklı öneklere farklı politikalar uygulamak için paketi nasıl yapılandırırsınız?

*(Tek bir doğru cevap yoktur. Amaç, gerçek dünya verisi için depolama katmanı seçimi pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Tom yaşam döngüsü politikalarını uyguladı.

Leo ilk kuralı yapılandırmaya yardım etmişti. "İyi olacak," demişti. "Minimum depolama süresi yalnızca erken silersek geçerlidir—ve hiçbir şey silmiyoruz." Yarı yolda Glacier minimum süre gereksinimlerini kontrol etti. "Aslında, şunu tekrar okuyayım."

Farklı bir pakette—geçici analiz hazırlık dışa aktarımları—neredeyse Glacier Instant Retrieval'a 30 günlük bir geçişi 60 günlük bir süre dolma kuralıyla birleştirmişti. Glacier Instant için minimum depolama süresi 90 gündür: o nesneler 30. günde Glacier'a girer ve 60. günde silinirdi ve S3 her biri için yine de tam 90 günü faturalandırırdı—artık var olmayan depolama için arşiv fiyatları ödüyor. O paket için Glacier geçişini tamamen düşürdü; 60. günde silinen veri asla 90 günlük bir minimumu amorti edecek kadar uzun yaşamaz. Fişler politikası tasarlandığı gibi güvenliydi: 90 günde Standard-IA'ya, 365 günde Glacier Instant Retrieval'a, 540 günde Glacier Flexible Retrieval'a, 2.555 günde Glacier Deep Archive'a geçiş.

Ayrıca çok parçalı yükleme temizleme kuralını her pakete ayarladı. Daha fazla terk edilmiş yükleme olduğu için değil—yoktu—ama olacağı için. Yük testleri olur. Dağıtımlar yarıda başarısız olur. Kural, manuel temizlemeyi hatırlamak için gereken hafızadan daha ucuzdu.

S3 faturası sonraki ay 847 dolardan 198 dolara düştü.

Karşılaştırmayı yazdırdı ve hiçbir şey söylemeden Maya'nın masasına koydu.

Maya ona baktı. Sonra tarihe. Sonra Tom'a.

"Üç hafta," dedi.

"Politikaları tasarlamak için bir öğleden sonra," dedi. "Onları uygulamak için bir saat. İlk tam faturalandırma döngüsünü görmek için üç hafta."

"S3 maliyetlerinde dörtte üç azalma."

"Erişmediğimiz veri için."

"Peki bölgeler arası replikasyon?" diye sordu Leo.

"Ayda on dolar daha," dedi Tom. "İkinci bir bölgede her sipariş fişinin eksiksiz bir kopyası için."

"Bu yaptığımız en ucuz felaket kurtarma kararı."

Maya sayılara tekrar baktı.

"Tom," dedi, "bu incelemeyi kullandığımız her AWS hizmeti için yapmanı istiyorum. Depolama, işlem, ağ. İsrafı bul."

Zaten masasına dönmüştü.

"Geçen hafta başladım," dedi.

Sonraki bölümde: veritabanı katmanının bu konuşmanın kendi versiyonu var ve Aurora, Tom'un beğenmeyi beklemediği cevap.
