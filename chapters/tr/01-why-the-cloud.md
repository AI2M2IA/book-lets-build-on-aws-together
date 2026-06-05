# Bölüm 1: Kiralama Yerine Sahip Olmak Neden Daha İyi?

Tom, ertesigünden beri bu sorunun peşindeydi. Notuna yazmıştı, sonra silmişti, sonra tekrar yazmıştı.

Leo ve Priya ertesi sabah kahveleriyle birlikte geldi – ilgisiz bir konuda tartışıyorlardı – Tom o sırada whiteboard’da, üçüncü seçenek hala yerinde duruyordu, kimsenin ne anlama geldiğini bilmediği bir çizimle.

“Birbirine bir şey anlatmamı isteyen birini istiyorum,” dedi Tom, çevresine dönmeden. “Eğer bilgisayarları Amazon’dan kiralarsak, kendi bilgisayarlarımızı satın almak yerine – bu daha *ucuz* olur mu?”

Oda sessizleşti. Basit gibi görünen ama aslında öyle olmayan bir soru.

“Çünkü,” dedi Leo.

“Hayır,” dedi Tom. “Bu durumun neden daha ucuz olduğunu anlamak istiyorum. Sadece cevabı duymak istemiyorum.”

**Sunucuları Sahip Olmanın Açık Sorunu**

Bir restorant işletmeye karar verdiğinizi hayal edin. Nimbus gibi bir restorant değil, normal bir restorant.

İlk müşterinizin gelmeden önce masalar, sandalyeler, bir mutfak, bir ocak, tabaklar ve personel gibi her şeye ihtiyacınız olacak. Bunu ilk haftanız yavaş olsa bile, bir ay boyunca günde altı müşteriye hizmet verirken bile ihtiyacınız olacak.

Fiziksel sunucular aynı şekilde çalışır.

Nimbus, beklediği zirve için kendi sunucularını satın almak zorunda. En yoğun Cuma gecesi hayal edebilecekleri, bir yemek blogerinin arepaları hakkında bir gönderiyle on binlerce insanın aynı anda sipariş vermeye çalıştığı an.

Ama çoğu zaman bu kadar yoğun değildir. Çoğu zaman, bu sunucular orada oturur, elektrik tüketir, neredeyse hiçbir şey yapmaz.

“Kullanmadığımız kapasite için ödeme yapacağımız olurdu,” dedi Maya.

“Tamamdır,” dedi Tom, bu soruyu sorması beklenmedik bir durumdu.

**Kiralama Modeli**

Bulut bilişimin neyi farklı kıldığını burada öğreniyoruz.

AWS’i kullanırken, sunucular satın almazsınız. Hesaplama gücünü kiralamış olursunuz ve kullandığınız kadar ödersiniz. Bir restorant binasını kiralamaya benzetilebilir.

Şunu düşünün:

Beşyi kişi ağırlayabileceğiniz bir evi veya bu kadar sayıda kişinin masaları ve sandalyeleri için ihtiyacınız olan alanı kiralayabilirsiniz. Ya da Cumartesi günü saat dört için bir mekan kiralayabilir, ihtiyacınız olan alana ve zamana ödeyebilir ve parti bittikten sonra anahtarları iade edebilirsiniz.

Mekan hala ihtiyacınız olduğunda orada olur. Başka bir şey için ihtiyaç duyduğunuzda yeniden kullanılabilir. Bir bina yöneticisi tutmanıza gerek yoktur, yıl boyunca emlak vergisi ödemezsiniz.

Bu, bulut modelidir. AWS’nin “mekanları” vardır. İhtiyacınız olduğunda onlara gelip ulaşabilirsiniz.

**Ama Bekle – Daha Fazlası Var**

“Tamam,” dedi Leo, “ama benim mekanım yandıysa ne olur?”

İyi bir sezgi. Karanlık ama iyi bir sezgi.

Sunucuları sahip olduğunuzda, *siz* onların çalışmasını sağlamaktan sorumlusunuz. Ofisteki sunucu, dikkatsiz bir meslektaş tarafından devrilirse, web siteniz kapalı olur. Bina elektrik kesilir, web siteniz kapalı olur. Bir sabit disk arızalanır – ve sabit diskler sonunda arızalanır – web siteniz kapalı olur.

AWS veri merkezleri işletir. Güçlü, profesyonel olarak yönetilen tesisler, yalnızca makinelerin çalışmasını sağlamak için işini sadece yapan mühendislerden oluşan ekiplerle.

Sadece hesaplama gücünü kiralamıyorsunuz, aynı zamanda güvenilirliği de kiralamış oluyorsunuz.

“Bunun maliyeti ne?” diye sordu Tom.

Bu, birçok bölümden sonra, Tom’un gözlerinin kararmadan önce.

**Bulut Üç Şeyi Farklı Yapar**

Bu konuyu somutlaştıralım. Kendi sunucularınızı çalıştırmaktan bir bulut sağlayıcı kullanmaya üç temel farkı listeleyelim.

**1. Kullandığınız kadar ödersiniz.**

Boşta oturan bir sunucu olmaz. Ön maliyet yoktur. Pazartesi sabahı sıfır siparişleri varsa, neredeyse hiçbir şey ödemezsiniz. Yeni Yıl’da çok yoğunsa, AWS otomatik olarak hazır olan kapasiteyi sağlar.

**2. Donanımı başkası sağlar.**

AWS, makinelerin bakımını yapar. Ağ kabloları, güç kaynakları, soğutma sistemleri. Nimbus bunu yapmak için kimseyi işe almaz. Uygulamalarına odaklanır, altyapının altında olanlara değil.

**3. İhtiyaç duyduğunuzda anında ölçeklenebilirsiniz.**

Bu, tam olarak anlamak için biraz zaman alan bir şeydir. Fiziksel sunucularda ölçeklendirmek, yeni donanım sipariş etmek, teslimat için haftalar beklemek, kurmak anlamına gelir. AWS’de ölçeklendirmek, bir düğmeye tıklamayı veya sistemi otomatik olarak yapmasını sağlamayı içerir. Ve artık ihtiyacınız olmadığında ölçekleme, ödeme durur.

Priya bu açıklamayı yaparken sessizdi. Bir sorusu vardı.

“Güvenliği ne olacak? Verilerin güvenliğini kim sağlar?”

Ve burada ilginç bir yer.

**Paylaşımlı Sorumluluk Modeli**

Bu, tüm AWS’de en önemli kavramlardan biridir. Anlaşıldığında basit olmasına rağmen, birçok kişi – hatta sınavda olanlar – tarafından karıştırılır.

AWS ve siz, güvenlikle ilgili sorumluluğun paylaşıldığı bir sorumluluktur. Ancak her taraf, farklı şeylerden sorumludur.

**AWS, bulutun güvenliğinden sorumludur.**

Fiziksel veri merkezleri. Donanım. Ağ altyapısı. Sanal makineleri çalıştıran hiperörterler. Birisi bir AWS veri merkezine girerse, bu Amazon'un sorundur.

**Bulutta siz güvenliğinizden sorumlusunuz.**

Verileriniz. Uygulamanız. Kullanıcı hesaplarınız ve bunlara erişebilenler. Seçtiğiniz yapılandırmalar. Birisi şifrenizi çalır ve AWS hesabınıza giriş yaparsa, bu sizin sorununuza bağlıdır.

Priya yavaşça başını salladı. "Yani onlar binayı koruyor, biz içerideki şeyi koruyoruz."

"Tamam," dedi Maya.

"Yani Leo bir port açarsa…"

"Hala bizim sorunumuz," Maya onayladı, Leo'ya bakarak.

Leo zaten dizüstü bilgisayarında bir şeyler yazıyordu ve dinlememek için kendini kandırıyordu.

## Güçlü Yönler ve Sınırlamalar

Hiçbir araç mükemmel değildir. Dürüst olalım, her ikisini de bilmemiz gerekir.

**Bulutun harika yanı:**

- Ön maliyetli donanım yoktur
- Kullandıklarınız için ödeme yaparsınız
- İhtiyaç duyduğunuzda anında ölçeklenebilir
- Yüzlerce yönetilen hizmete erişim (veritabanları, kuyruklar, makine öğrenimi ve daha fazlası)
  - kendiniz inşa etmenize veya bakım yapmanıza gerek kalmadan

**Karmaşık hale gelen yerler:**

- Maliyetler dikkatli olmadığınızda öngörülemez olabilir (Tom'un gelecekteki kabusu)
- AWS bölgesinde bir kesinti olduğunda altyapınız için üçüncü bir tarafa bağımlısınız
- Bir öğrenme eğrisi vardır. AWS'de yüzlerce hizmet vardır. Hangi hizmeti kullanmanız gerektiğini bilmek deneyim gerektirir veya bu kitap gibi bir kitap.
- Bulut dışına veri göndermek pahalıdır. Büyük miktarda veriyi AWS'den çıkarmak para harcatır. (Bunu 30. Bölüm'de tekrar ele alacağız.)

"Yani kontrolü konfor için veriyoruz," dedi Tom.

"Ve ön maliyeti devam eden maliyet için veriyoruz," Maya ekledi.

"Ve başkasının sorununu kendi sorunumuza çeviriyoruz, güvenlik açısından," dedi Priya.

"Ama aynı zamanda Leo'nun kırık sunucusunu Amazon'un hiç bozulmayan sunucusuyla değiştiriyoruz," dedi Leo, tüm zamanı dinlemiş gibi görünüyordu.

Tamamen haklıydı.

## Özet

- Bulut, sahip olduğunuzdan kiraladığınız işlem gücüdür.
- AWS, dünyanın en büyük bulut sağlayıcısıdır.
- Temel fayda, kullanacağınız kadar ödeme yapma ölçeklenebilirliğidir: yalnızca kullandığınız kadar ödeme yaparsınız ve gerektiğinde yukarı veya aşağı ölçekleyebilirsiniz.
- AWS, fiziksel altyapıyı yönetir, siz uygulamanızı, verilerinizi ve yapılandırmalarınızı yönetirsiniz. Bu bölünme "Ortak Sorumluluk Modeli" olarak adlandırılır.
- Bulut her zaman daha ucuz veya daha basit değildir - ancak fiziksel sunuculara kıyasla başlamanıza olan engelleri ortadan kaldırır ve ölçeklenebilirliği mümkün kılar.

## Sınav İpuçları

*SAA-C03 Alanı: Çoklu Alan — Bulut Kavramları Temelleri*

- Ortak Sorumluluk Modeli, sınavda düzenli olarak görünür. Unutmayın: AWS, donanım, veri merkezleri ve küresel ağın güvenliğinden sorumludur. Veri, kimlikler ve uygulama yapılandırmanızın güvenliğinden siz sorumlusunuz.
- **Kilit Nuans**: Bölünme, hizmet türüne bağlı olarak değişir. EC2 (kontrol ettiğiniz sanal bir makine için), *siz* işletim sistemini yamalarsınız. RDS (AWS tarafından yönetilen bir veritabanı için), AWS veritabanı motorunu yamalar. Bir hizmetin ne kadar "yönetilen" olduğu, sorumluluğun ne kadar AWS'ye geçtiğini belirler. Sınav senaryoları bir olayı tanımlayacak ve kimin sorumlu olduğunu soracaktır - her zaman "bu hizmet ne kadar yönetiliyor?" diye sorun.
- Bulutun *faydaları* hakkında sorular, CapEx vs. OpEx'i test eder. Ön saha donanımı sermaye harcamasıdır (CapEx - bir kez satın alınır, zaman içinde değer kaybedilir). Bulut, işletme harcamasıdır (OpEx - aylık ödeme). AWS, maliyetleri CapEx'ten OpEx'e kaydırır.

- "Esneklik" - otomatik olarak yukarı ve aşağı ölçekleme yeteneği - temel bir bulut faydasını temsil eder. "Ölçeklenebilirlik" ile "esneklik" terimleri sınavda birlikte görülebilir. Esneklik, talebe bağlı olarak otomatik, iki yönde ölçekleme anlamına gelir. Ölçeklenebilirlik, sistemin *büyüyebileceği* anlamına gelir, ancak otomatik olarak küçülebileceği anlamına gelmez.

**İpuçları 1**: Fiziksel olarak AWS'nin kontrol ettiği şey ile siz kontrol ettiğiniz şeyleri düşünün.

**İpuçları 2**: AWS veri merkezlerini işletiyor. Onları içinde nereye koyacağınızı ve uygulamanızı nasıl yapılandıracağınızı siz seçiyorsunuz.

**İpuçları 3**: Bu bölümde sorumlulukların bu bölümdeki belirli bir adıyla tanımladık.

**Cevap**: C

**Açıklama**: AWS Paylaşımlı Sorumluluk Modeli, güvenliği iki alanda ayırır.
AWS, veri merkezleri, donanım ve ağlar gibi fiziksel altyapıyı güvence altına alır.
Müşteri, üzerine yaptıkları her şeyi güvence altına alır: verileri, erişim kontrolleri, uygulama yapılandırmaları ve ağ ayarları.

**Neden A?** AWS, müşteri uygulamaları için tam sorumluluk üstlenmez. Bir şeyi yapılandırdığınız anda, o yapılandırmayı siz yönetmelisiniz.

**Neden B?** Müşteriler fiziksel veri merkezi güvenliğini sağlamaktan sorumlu değildir – bu, AWS kullanmanın tam olarak bir avantajıdır.

**Neden D?** Paylaşımlı Sorumluluk Modeli, müzakere edilmiş bir anlaşma değil, sabit bir çerçevedir.

*SAA-C03 Alanı: Çoklu Alan – Bulut kavramları / Paylaşımlı Sorumluluk*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Bir arkadaşınız yeni bir uygulama başlatıyor ve sizden tavsiye istiyor. Fiziksel iki sunucu (bir uygulama için, bir veritabanı için) satın almak veya bulut sağlayıcı kullanmak arasında karar vermeli. Tahmini trafiği 10-100 kullanıcı arasında ancak üç ay sonra gerçekleşecek bir lansman etkinliği sırasında 10.000 kullanıcı getirebilir.

Kararları değerlendirin. Hangi seçeneği önerirsiniz ve bunun ana nedeni nedir? Seçiminizi yaparken neyi feda edersiniz?

*(Tek bir doğru cevap yoktur. Amaç, kararları değerlendirme pratiği yapmaktır.)*

**Kredilerden Sonraki Sahne**

Üç gün sonra, Nimbus bir AWS hesabına sahip olmuştu.

Leo, kişisel e-posta adresi, borç almak zorunda kaldığı Tom'dan aldığı bir kredi kartı ve geriye dönüp baktığında biraz endişe verici olan bir heyecanla saat 23:00'de onu oluşturmuştu.

"EC2 adında bir şey buldum," dedi ertesi sabah, dizüstü bilgisayarının ekranını göstererek. "Bir bilgisayar kiraladığınız gibi. Sanırım bir tane başlattım."

"Senin de *dediğin* mi?" Priya sordu.

"Benim için dediğim," diye yanıtladı. "Sadece nereye gittiğini bilmiyorum."

Maya ekranın yanına eğildi ve baktı.

"Leo," dedi. "Neden 'Bölge: ap-southeast-1' diyor?"

"Bu ne anlama geliyor?"

Sonraki bölümde: AWS'nin coğrafyası – sunucuların aslında nerede olduğu ve bunun neden önemli olduğu.
