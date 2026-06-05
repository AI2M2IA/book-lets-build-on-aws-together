# Bölüm 3: Kim Oldunuz, Aslında?

Leo dağıttı.

Terminal iki kelime döndürdü: Erişim Engellendi.

Tekrar denedi. Aynı sonuç. Üç haftadır Nimbus’ta çalışıyordu, ilk günü hesabına erişim verilmişti ve ortamasına hiç sorunsuz bir şekilde ortamasına aktarıyordu. Ancak bu üretim ortamıydı. Ve üretim, görünüşe göre farklıydı.

Maya, hata mesajının üzerine baktı. “Bunu kim verdi?”

Leo döndü. “Ne izni?”

“Üretim ortamına ortamasına izni. Bunu kim ayarladı?”

Leo AWS konsolunu açtı ve menüler arasında tıklamaya başladı. Kimse ayarlam hadn’t. Hiçbir politika, hiçbir rol, hiçbir açık izin yoktu. Ayrıca hiçbir açık reddetme de yoktu — sadece bir eksiklik vardı. Nimbus’taki kimse ne yapabileceğine dair kimin düşüneceğine dair oturmamıştı.

Bu sorun buydu.

**Şifrelerin Sorunu**

Şifreler, bilgisayar sistemleri için kötü bir modeldir.

Sadece her zaman zayıf olmadıkları için değil, çünkü ya bir şifreyi sahip olursunuz ya da sahip olmazsınız. Eğer sahipseniz, hesabın izin verdiği her şeyi yapabilirsiniz.

Bu, kişisel dizüstü bilgisayarlarında bir kullanıcı için uygundur. Bir şirketin bulut altyapısı için ise katastropik hale gelir.

Nimbus’un yönetmesi gerekenler nelerdir: web sunucusu, veritabanı, dosya depolama, ağ, faturalandırma uyarıları, kullanıcı hesapları. Her şey tek bir şifreyle —
veya hatta tek bir kimlik bilgisiyle korunursa, o kimlik bilgisiyle herkes her şeyi yapabilir.

Ve AWS’de “her şey” bir veritabanını silme yeteneğini ifade eder. 50.000 doları bulan faturalara neden olan hesaplarını kullanıcılara kripto para madenciliği yapmalarına izin veren sunucuları başlatır ve üç ay sonra yedek verileri yok eder.

Priya bu kavramı sakin, soyut terimlerle anlatmadı. Saldırganların 80.000 doları olan bir AWS faturası oluşturduğu, 24 saat içinde kripto para madenciliği yaptıkları ve üç ay sonra kapanan bir startup hikayesi olarak anlattı.

Oda sessizdi.

“O zaman alternatif nedir?” Tom sordu.

**Kavram: Kimlik ve Erişim Yönetimi**

Alternatif, herkese aynı anahtarı vermemek, her kişiye — ve her hizmete — ihtiyaç duydukları kesin erişimi vermektir. Daha fazla, daha az değil.

AWS’de bu sistem **IAM**: Kimlik ve Erişim Yönetimi olarak adlandırılır.

IAM’i, büyük bir ofis binasının anahtar kart sistemine benzetebiliriz.

Binanın onlarca katı vardır. Sunucu odası 12. katta, finans ofisi 8. katta, CEO’nun suitesi 20. katta. Her çalışanın bir anahtar kartı vardır, ancak her anahtar kartı yalnızca işleri için ihtiyaç duydukları kapıları açar. Öğrenci, sunucu odasına geçemez, muhasebeci yöneticiler için geceleri yönetim katına erişemez.

IAM aynı şekilde çalışır. Kimin var olduğunu (kimlikler), ne yapmaya izin verildiğini (izinler) ve bu izinleri politikalar aracılığıyla uygularsınız.

**IAM’in Temel Bileşenleri**

IAM dört temel kavramı içerir. Bunlar birbirinin üzerine inşa edilir.

**Kullanıcılar** bireysel kimliklerdir. Maya’nın bir IAM kullanıcısı vardır. Tom’un bir IAM kullanıcısı vardır.
Her kullanıcının kendi kimlik bilgileri vardır — ve yalnızca belirli ihtiyaçlarına göre verilmesi gereken izinleri yalnızca olmalıdır.

**Gruplar** kullanıcıların koleksiyonlarıdır. Maya, Tom, Priya ve Leo’yu bireysel olarak izinler ayarlamak yerine, “Geliştiriciler” grubunu oluşturur ve onları içine ekler. Beşinci bir kişi katılırsa, onları gruba ekler ve anında aynı haklara sahip olur.

**Roller** bir hizmetin veya başka bir AWS hesabının *temsil ettiği* geçici kimliklerdir. Daha sonra 14. Bölümde derinlemesine inceleyeceğiz. Şimdi: Bir Kullanıcı kalıcı bir çalışan ise, bir Rol bir ziyaretçi pasifidir. Belirli bir süre veya amaç için belirli erişimi verir.

**Politikalar** gerçek izin kurallarıdır. Bir politika, “Bu politikanın sahibinin İZİN verileceği eylem X’i kaynağa gerçekleştirmesine izin verir” veya “REDDEDİLECEK eylem Z” şeklinde bir belgedir.

IAM değerlendirme modeli şöyledir: varsayılan olarak her şey reddedilir. İzinler açıkça verilmelidir. Bir politika, size bir şeyi yapmaya izin vermiyorsa, yapamazsınız.

**En Az Yetki İlkesi**

Bu, hem güvenlik hem de IAM için en önemli kavramdır.

**İnsanları ve sistemleri işlerini yapmak için ihtiyaç duydukları kadar erişim verin. Daha fazlası değil.**

Priya bunu “en az yetki ilkesi” olarak adlandırdı. Açık olduğu gibi görünür. Uygulamada, çoğu ekip bunu sürekli olarak ihlal eder — kötü niyetli olmadan, sadece kolaylık için.

“Leo’ya şeyleri daha hızlı dağıtmak için yönetici erişimi verebilir miyiz?”

Hayır.

“Her şeyi için kök hesabı kullanabilir miyiz?”

Kesinlikle hayır.

Kök hesabı, tüm AWS hesabınız için her şey yapabilen ana anahtardır. Aynı zamanda çok faktörlü kimlik doğrulama ayarlayabilir ve ardından günlük çalışmada tekrar kullanmaz.

Priya, öğleden sonra herkes için ayrı ayrı IAM kullanıcıları oluşturdu. Leo’ya geliştirme ortamına dağıtma izni verdi. Üretim, faturalandırma veya ağ değil. Sadece dağıtım.

“Bu kısıtlayıcı geliyor,” dedi Leo.

"Priya, bu bu doğru olduğunu biliyorsun," dedi.

**Yanlış Bir Şey Olduğunda Ne Olur**

Üç senaryo, artan şiddet derecesine göre:

**Senaryo 1:** Yönetici erişimi olan bir çalışan şirketten ayrılıyor. Hesapları devre dışı bırakılmıyor. Üç ay sonra hala erişime sahipler. Bu sürekli olarak oluyor.
IAM bunu çözüyor: kullanıcıyı devre dışı bırakın. Anında, her yerde.

**Senaryo 2:** Bir geliştiricinin dizüstü bilgisayarı tehlikeye atılıyor. Saldırgan, tam yönetici izinlerine sahip bir yapılandırma dosyasında depolanan AWS kimlik bilgilerini buluyor. Kimlik bilgileri geniş erişimle çalışırsa, saldırgan her şeyi yapabilir: kripto para madenciliği, veri hırsızlığı, yedekleme silme. En az ayrıcalık ilkesiyle: kimlik bilgileri yalnızca sınırlı kapsamları için çalışır. Etki alanı daraltılır.

**Senaryo 3:** Kötü yazılmış bir uygulama yanlışlıkla AWS kimlik bilgilerini günlüklerine açığa çıkarır. Bu kimlik bilgileri geniş erişimle çalışırsa, bu bir felaketktir. Sadece uygulamaya ihtiyaç duydukları belirli S3 havuzuna erişim varsa, açığa çıkış sınırlı ve kontrol altında olur.

Kalıp: Erişim minimum düzeyde olmalıdır. Her zaman. İnsanlarınızı güvensiz olarak düşündüğünüzü düşünmüyor, ancak bozulmuş kimlik bilgilerini kontrol edemeyeceğinizi düşünüyorsunuz.

**Çok Faktörlü Kimlik Doğrulama: İkinci Kilit**

Bölümü kapatmadan önce bir diğer kavramı ele alalım.

En az ayrıcalık ilkesiyle bile kimlik bilgileri çalılabilir. Şifreler tahmin edilebilir, kimlik avı saldırıları veya sızıntılarla sonuçlanabilir. IAM bunu MFA ile ele alır.

MFA, bilmeniz gereken bir şey (şifre) ve sahip olduğunuz bir şey (bir telefon, bir donanım anahtarı) gerektirir. Saldırgan şifrenizi çalırsa, aynı zamanda telefonunuzu da sağlamanız gerekmez.

MFA, her IAM kullanıcısı için etkinleştirilmelidir. Kök hesabı için şart değildir.

Priya, herkes için kurulumu yapmayı öğleden sonra tamamladı.

Tom, bunun çok fazla direnç oluşturup oluşturmadığını sordu. Priya, ihlal hikayesini tekrar gösterdi.

Tom, MFA'yı hemen ayarladı.

## Güçlü Yönler ve Sınırlamalar

**IAM şu konularda doğru araçtır:** Her AWS kaynağına kimin ve neyin erişebileceğini kontrol etmek; kullanıcılar, hizmetler ve çapraz hesap sınırları genelinde en az ayrıcalık ilkesini uygulamak; CloudTrail entegrasyonu yoluyla her API çağrısının bir denetim kaydını oluşturmak; uzun süreli kimlik bilgilerini sistemler arasında paylaşma ihtiyacını ortadan kaldırmak.

**IAM'in zor olduğu yerler:** IAM politikaları, onlarca rol boyunca yüzlerce ifadeye dönüşebilir ve "Erişim Engeli" hatası için hangi politikanın etkili olduğunu anlamak, kulağa oldukça zor geliyor. En yaygın IAM hatası, çok az erişim vermemek değil, çok fazla erişim vermektir. "Sadece çalışmasını sağlamak için" oluşturulan aşırı izinli politikalar, geriye dönük olarak geri alınması zor olan güvenlik riskleri oluşturur. İzinleri minimum düzeyde yazın. Bir şey başarısız olduğunda yalnızca genişletin.

## Özet

- **IAM** (Kimlik ve Erişim Yönetimi), AWS'de neyin kim tarafından yapılacağını kontrol etmenin yolu.
- Temel yapı taşları şunlardır: **Kullanıcılar** (bireyler), **Gruplar** (kullanıcıların koleksiyonları), **Roller** (geçici kimlikler) ve **Politikalar** (izin kuralları).
- Varsayılan olarak, AWS'deki her şey engellenir. İzinler açıkça verilmelidir.
- En Az Ayrıcalık İlkesi, her kimliğe yalnızca ihtiyaç duyduğu erişimi vermeyi ifade eder. Daha fazla değil.
- **Kök hesap**, her şeyi yapabilir, hatta felaket yaratabilir. MFA ile kilitleyin ve mümkün olduğunca az kullanın.
- Her IAM kullanıcısı için **MFA**'yı etkinleştirin. Kök hesap için şart değildir.

## Sınav İpuçları

*SAA-C03 Alan 1 — Görev 1.1 (AWS kaynaklarına güvenli erişim)*

- Her şey varsayılan olarak engellenir. "İzin Ver" açıkça belirtilmelidir. Bir politika bir eylemi belirtmezse, eylem engellenir.
- **Açıkça Engelleme her zaman kazanır.** Bir zincirdeki herhangi bir politika bir eylemi engellerse, bu engeli zincirdeki başka bir "İzin Ver" tarafından geçersiz kılınamaz. Bu, birçok adayı şaşırtır.
- **Kök hesap ≠ IAM yöneticisi.** Kök hesap, IAM kimlik bilgilerinden ayrı bir kimliktir. Kök hesabı silemezsiniz — ve bunu yapmanız gerekir. "İzin Ver" ile kullanıldığında minimum düzeyde sınırlayın.
- **IAM küreseldir**, Bölgesel değildir. IAM kullanıcıları, grupları, roller ve politikaları tüm AWS hesabında, Bölge başına değil bulunur.
- **Roller, AWS hizmetlerine erişim için tercih edilen yoldur.** Bir EC2 örneği bir S3 havuzuna erişmesi gerekiyorsa, örneğe bir IAM Rolü eklersiniz — makineye kimlik bilgilerini depolamazsınız. Bu desen, sınavda sürekli olarak ortaya çıkar.

## Uygulama

**Uygulama 1 — Hatırlama**

Kendi kelimelerinizde: IAM Kullanıcısı, Grup ve Rol arasındaki fark nedir?
Her birini ne zaman kullanırsınız?

*(İpucu: Bir anahtar kartı inşa etme analojisini düşünün — hangisi kalıcı bir kart, hangisi bir departman gruplaması ve hangisi bir ziyaretçi vizesidir?)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir web uygulamasını EC2 örneklerinde çalıştıran bir şirket, S3 havuzundan dosyaları okuması gereken bir junior geliştirici, AWS kimlik bilgilerini uygulamadaki kodda doğrudan depolamayı öneriyor. Güvenlik ekibi bu öneriye itiraz ediyor.

En güvenli ve operasyonel çözüm nedir?

A) EC2 örneğine kod yerine erişim anahtarlarını ortam değişkenlerinde saklayın.
B) S3 okuma izinlerine sahip özel bir IAM kullanıcısı oluşturun ve kimlik bilgilerini geliştirme ekibiyle paylaşın.
C) EC2 örneklerine uygun S3 okuma izinlerine sahip bir IAM Rolü ekleyin.
D) Uygulamaya tüm AWS kaynaklarına tam erişim sağlamak için kök hesap kimlik bilgilerini kullanın.

**İpucu 1**: Bir örneğe her yerde kimlik bilgisi saklamanın sorunu, kimlik bilgilerinin sızdırılabilir olmasıdır. Kimlik bilgisi kullanmadan EC2 örneğine erişmenin bir yolu var mıdır?

**İpucu 2**: AWS, statik kimlik bilgisi gerektirmeden hizmetlere izin verme mekanizmasına sahiptir. Bu mekanizmanın adı nedir?

**İpucu 3**: IAM Roller'leri EC2 örneklerine eklenebilir. Eklendiğinde, örnek otomatik olarak AWS tarafından döndürülen geçici kimlik bilgilerini alır. Statik kimlik bilgisi gerekmez.

**Cevap**: C

**Açıklama**: Bir EC2 örneğine bir IAM Rolü eklemek doğru kalıptır. Örnek, EC2 meta veri hizmetinden otomatik olarak geçici, döndürülen kimlik bilgilerini alır. Sızdırılması, döndürülmesi veya yanlışlıkla bir depoya commit edilmesi gereken uzun ömürlü kimlik bilgisi yoktur.

**Neden A?** EC2 örneğine ortam değişkenlerinde saklanan statik kimlik bilgileri hala sızdırılabilir — uygulama günlükleri, hata ayıklama uç noktaları veya örnek tehlikeye atıldığında. Statik kimlik bilgileri sorun değildir, konumlarıdır.

**Neden B?** Geliştirme ekibine dağıtılan paylaşılan bir IAM kullanıcısı oluşturmak ve kimlik bilgilerini paylaşmak en az ayrıcalık ilkesini ihlal eder ve kimlik bilgisi döndürme bir kabus olur. Bir kişi ayrılırsa, yalnızca erişimlerini değiştirmek yerine yalnızca paylaşılan kimlik bilgilerini değiştirmek zor olur.

**Neden D?** Herhangi bir uygulamaya kök hesap kimlik bilgilerini kullanmak, ciddi bir güvenlik ihlalidir. Kök hesap sınırsız erişime sahiptir ve kimlik bilgileri asla hesap sahibinin kontrolünden çıkmamalıdır.

*SAA-C03 Alan 1 — Görev 1.1 (IAM rollerleri, en az ayrıcalık)*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe bağlı)*

Nimbus, önümüzdeki ay üç yeni geliştiriciyi karşılıyor. Her biri farklı erişim düzeylerine ihtiyaç duyacak: biri veritabanı katmanında, biri uygulama sunucularında, biri ön uç statik dosyalarında çalışacak. Ayrıca kod dağıtımı için bir CI/CD boru hattı da gerekiyor.

Bu senaryo için bir IAM yapısı tasarlayın. Hangi kullanıcılar, gruplar, roller ve politikalar oluştururdunuz? En önemli en az ayrıcalık sınırı nedir?

*(Tek bir doğru cevap yoktur. Bir kimliğin herhangi biri tehlikeye atıldığında patlama yarıçapını en aza indirmeyi düşünün.)*

## Kredilere Ait Sahne

Günün sonunda, her IAM kullanıcısının MFA etkinleştirildiği görülmüştü. Leo'nun hesabı geliştirici düzeyinde erişimle azaltılmıştı: dev ortamına dağıtın, paylaşılan yapılandırma havuzundan okuyun, başka bir şey yapmayın.

Verimliliğini test etmek için bir kez üretim veritabanına erişmeye çalışmıştı.

Erişim reddedildi.

"Bu, güvende olmak ama çok fazla olmamak hissi mi?" diye sordu.

"Tam olarak o hissi," dedi Priya.

Tom ertesi sabah erken geldi ve web sitelerinin beklentilerin üzerinde trafik aldığını gördü. Ve Leo'nun orijinal olan web sunucusu gerçekten çok sıcak çalışıyordu. Gerçekten çok sıcak.

"100 eşzamanlı kullanıcı var," dedi Tom. "Ve tek bir sunucu."

Sonraki bölümde: ilk sunucu — başkasına ait bir veri merkezinde bir bilgisayar kiralayan.
