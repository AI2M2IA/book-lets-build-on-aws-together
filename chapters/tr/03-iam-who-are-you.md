# Bölüm 3: Sen Tam Olarak Kimsin?

Saat sabah dokuzu biraz geçmişti. Leo yediden beri masasındaydı, kahvesi klavyenin yanında
soğumuştu. Ofis sessizdi — Maya henüz gelmemişti, Tom telefondaydı. Dışarıda biri çim
biçiyordu.

Leo komutu bir kez daha yazdı.

Terminal iki kelime döndürdü: Erişim Engellendi.

Singapur krizi arkalarında kalmıştı. Bölge düzeltilmiş, sunucu us-west-2'de çalışıyordu ve
ekip kısa süreliğine kendini yetkin hissetti. O his, yeni sorun yüzeye çıkmadan önce yaklaşık
kırk sekiz saat sürdü: Leo üretime dağıtım yapamıyordu. Kimse onun izinlerini ayarlamamıştı.
Kimse kimsenin izinlerini ayarlamamıştı. AWS hesabı root düzeyinde ardına kadar açık, başka
her yerde ise kilitliydi ve kimse fark etmemişti çünkü kimse denememişti.

"Onu zaten dağıtmıştım — ay," diye mırıldandı Leo, terminalinde geri kaydırarak. Bir haftadır
üretim sandığı şeye dağıtım yapıyordu. Hazırlık (staging) ortamıydı. Gerçek üretim ortamına
hiç dokunulmamıştı.

Maya omzunun üzerinden hata mesajına baktı. "Bu izni sana kim verdi?"

Leo döndü. "Hangi izin?"

"Üretime dağıtım izni. Bunu kim ayarladı?"

Leo AWS konsolunu açtı ve menüler arasında tıklamaya başladı. Kimse ayarlamamıştı. Hiçbir
politika, hiçbir rol, hiçbir açık yetki yoktu. Açık bir reddetme de yoktu — sadece bir
yokluk. Nimbus'ta kimse hiç oturup kimin ne yapabileceğini düşünmemişti.

Sorun buydu.

**Şifrelerin Sorunu**

Şifreler, bilgisayar sistemleri için kötü bir modeldir.

Her zaman zayıf oldukları için değil. İkili (binary) oldukları için: şifreye ya sahipsinizdir
ya da değilsinizdir. Sahipseniz, hesabın yapmasına izin verilen her şeyi yapabilirsiniz.

Bu, kişisel dizüstü bilgisayarındaki tek bir kullanıcı için sorun değil. Bir şirketin bulut
altyapısı için felakettir.

Nimbus'un yönetmesi gerekenleri düşünün: web sunucusu, veritabanı, dosya depolama, ağ,
faturalandırma uyarıları, kullanıcı hesapları. Her şey tek bir şifreyle — ya da tek bir
kimlik bilgisi setiyle — korunuyorsa, o şifreyi ele geçiren herkes her şeyi ele geçirir.

Ve AWS'de "her şey", veritabanlarını silme yeteneği demektir. 50.000 dolarlık bir fatura
çıkaran sunucular başlatma. Her müşteri kaydını dışarı sızdırma. Yedek verileri yok etme.

Şifrelerin ikili doğasının ötesinde bir sorun daha var: şifreler statiktir. Otomatik olarak
süresi dolmaz. Sık sık hizmetler arasında yeniden kullanılırlar. Bir yere yazılırlar.
"şifreler PAYLAŞMAYIN" diye etiketlenmiş elektronik tablolarda saklanırlar. Yine de
paylaşılırlar, çünkü güvenlik mekanizması sürtünme olduğunda kolaylık güvenliği yener.

"Paylaşılan kimlik bilgileri" sorunu bir karakter kusuru değildir. Bir sistem sorunudur.
Birine bir sisteme geçici erişim vermenin tek yolu ona kalıcı şifreyi vermekse, insanlar
şifreleri paylaşır. Çözüm, geçici, kapsamlı erişimin varsayılan olduğu bir sistem inşa
etmektir — kahramanca çaba gerektiren bir geçici çözüm değil.

IAM'in yaptığı şey budur. Sadece "daha iyi şifreler" değil, erişimin bir karakter dizisini
kimin bildiğine göre değil, kimliğe ve politikaya göre tanımlandığı temelden farklı bir
model.

Priya bunu sakin, soyut terimlerle anlatmadı. Bir hikâye olarak anlattı.

**Dört Saatte 80.000 Dolara Mal Olan İhlal**

Bir girişimdeki bir geliştirici, herkese açık deposuna bir GitHub Actions dağıtım betiği
gönderdi. Betik, ortam değişkenleri olarak sabit kodlanmış AWS kimlik bilgileri içeriyordu —
bulut güvenliği inceleme raporlarında kendi kategorisine sahip olacak kadar yaygın bir hata.
Kimlik bilgileri, şirketin AWS hesabına tam yönetici erişimine sahipti, çünkü altı ay önce
biri IAM politikalarıyla uğraşmamak için onları öyle yapılandırmıştı.

Kimlik bilgileri dosyada, otomatik bir tarayıcı — bir güvenlik araştırmacısı değil, bir
saldırgan tarafından çalıştırılan — onları bulana kadar yaklaşık altı dakika kaldı.

Tarayıcı kimlik bilgilerini indeksledi, hesap izinlerini değerlendirdi ve birden fazla
bölgede GPU örnekleri başlatmaya başladı. GPU örnekleri pahalıdır. Ayrıca kripto para
madenciliği için de kullanışlıdır. İlk saat içinde, `us-east-1`, `eu-west-1` ve
`ap-southeast-1` genelinde kırk yedi `p3.8xlarge` örneği çalışıyordu.

Bir `p3.8xlarge` saatte yaklaşık 12 dolara mal olur. Kırk yedi tanesi saatte 564 dolara mal
olur.

Girişimin faturalandırma uyarısı tetiklendiğinde — günde 1.000 dolara ayarlanmış, ki kimse
sıkılaştırmayı düşünmemişti — dört saat geçmişti. Fatura 2.200 dolara yaklaşıyor ve
tırmanıyordu.

Birisi ne olduğunu anlayıp kimlik bilgilerini iptal ettiğinde, fatura o birkaç saat için
3.400 dolara ulaşmıştı. Ama gerçek maliyet daha sonra geldi: denetim, saldırganın haftalardır,
sessizce, geceleri, kimsenin fark etmediği ikinci bir sızdırılmış kimlik bilgisi setini
kullanarak madencilik yaptığını ortaya çıkardı. Denetim tamamlandığında toplam zarar: 80.000
doların üzerinde.

"Ve kapandılar mı?" diye sordu Tom.

"Üç ay sonra," dedi Priya. "Yatırımcılar çekildi. İhlal açıklandı. Basın haberleri fon
toplamayı imkânsız kıldı."

Oda sessizleşti.

"Peki alternatif nedir?" diye sordu Tom.

**Kavram: Kimlik ve Erişim Yönetimi**

Alternatif, herkese aynı anahtarı vermediğiniz bir sistemdir.

Her katın farklı alanlara sahip olduğu ve her çalışanın yalnızca işi için ihtiyaç duyduğu
kapıları açan bir anahtar kartına sahip olduğu bir ofis binası hayal edin. Stajyerin anahtar
kartı üçüncü katta çalışır. Muhasebecinin anahtar kartı finans ofisini açar ama sunucu
odasını açmaz. Kimse, geçmek için bir nedeni olmayan bir kapıdan geçmez.

AWS'nin kullandığı model budur.

AWS bu sisteme **IAM**: Kimlik ve Erişim Yönetimi (Identity and Access Management) der.

IAM, tüm bulut hesabınız için anahtar kart sistemidir. Kimin var olduğunu (kimlikler), neye
izinli olduğunu (izinler) tanımlar ve bu izinleri politikalar aracılığıyla uygularsınız.
Binanın onlarca katı var. IAM, her kişinin yalnızca ihtiyaç duyduğu katlara
ulaşabilmesini sağlar.

Anahtar kart benzetmesi daha da uzar. İyi yönetilen bir binada, herhangi bir anda neye kimin
erişimi olduğunu bilirsiniz. Bir rapor yazdırabilirsiniz: işte her anahtar kartının erişim
hakları. İşte son 30 günde kimlerin sunucu odasında bulunduğu. İşte 90 gündür kullanılmamış
kartlar (işten çıkarılmış bir çalışanın devre dışı bırakılmamış kartının olası bir
göstergesi).

IAM aynı görünürlüğü sağlar. IAM aracılığıyla yapılan her eylem — her API çağrısı, her konsol
girişi, her izin verme — **AWS CloudTrail**'de günlüğe kaydedilir. Bir salı sabahının ikisinde
veritabanını kimin sildiğini bilmeniz gerekiyorsa, cevap CloudTrail'de. Bir denetçiye yalnızca
yetkili kullanıcıların üretim sistemlerine erişimi olduğunu göstermeniz gerekiyorsa,
CloudTrail kanıtı sağlar.

AWS CloudTrail, konsoldan okunabilen yönetim olaylarının 90 günlük geçmişini otomatik olarak
tutar. Ama güvenlik ekibiniz geçen çeyrekten bir şeyi denetlemesi gerektiğinde 90 günün pek
yeterli olmadığı bir gerçek. Kalıcı, uzun vadeli günlükleme — ve uyarılar — için bir **Trail**
oluşturmanız gerekir; bu, tüm olayları bir S3 kovasına yazar ve CloudWatch Logs'a akıtabilir.
Trail otomatik değildir; bir kez yapılandırdığınız ve sonra unuttuğunuz bir şeydir. Ona
ihtiyaç duyana kadar.

IAM'in erişim kontrolleri ile CloudTrail'in denetim günlükleme kombinasyonu, büyük
kuruluşların AWS hesaplarını ölçekte güvenle çalıştırmasını sağlayan şeydir: erişim IAM
tarafından tanımlanır ve uygulanır; o erişimin her kullanımı CloudTrail tarafından kaydedilir.

**Hastane Benzetmesi**

İşte bunu düşünmenin ikinci bir yolu — erişim hiyerarşisini daha sezgisel hâle getiren biri.

Bir hastane hayal edin. Sadece fiziksel binayı değil, insanların, rollerin ve verilerin
eksiksiz organizasyon yapısını.

**Resepsiyonist** hasta randevu programlarını ve sigorta bilgilerini görebilir. Hastaların
giriş ve çıkışını yapabilir. Tıbbi kayıtlara erişemez, reçeteleri değiştiremez, cerrahi
geçmişleri göremez.

**Hemşire** kendi servisindeki hastaların tıbbi kayıtlarına erişebilir. Doktorun emirlerine
göre ilaç uygulayabilir. İlaç reçete edemez. Ameliyatlara yetki veremez.

**Doktor** tıbbi kayıtları görüntüleyebilir ve değiştirebilir, reçete yazabilir ve testler
isteyebilir. Bordro sistemine erişemez. Belirli bir geçersiz kılma olmadan diğer doktorların
reçetelerini değiştiremez.

**Cerrah** ameliyathane sistemlerine erişebilir. Çoğu doktorun ihtiyaç duymadığı cerrahi
kayıtlar için belirli izinleri vardır.

**Temizlik personeli** kat planlarına ve oda programlarına erişebilir. Hiçbir hasta verisine
erişemez.

Hastanedeki her kişi işi için ihtiyaç duyduğu erişime sahiptir — ve yalnızca o kadarına.
Resepsiyonistin cerrahi erişimi yoktur. Temizlik personeli hasta kayıtlarını görmez. Ve
kritik olarak: bir temizlik personelinin anahtar kartı çalınırsa, saldırgan temizlik
programlarını ele geçirir. Hasta kayıtlarını ele geçirmez. İhlalin patlama yarıçapı, o anahtar
kartının erişebileceğiyle sınırlıdır.

IAM böyle çalışır. Her kimlik — her kullanıcı, her hizmet, her otomatik süreç — tam olarak
ihtiyaç duyduğu izinleri alır. Daha fazlasını değil.

Tom arkasına yaslandı. "Yani Leo hemşire, ben de muhasebeciyim."

"Bunun gibi bir şey," dedi Priya. "Ve ikiniz de cerrah değilsiniz."

"Cerrah kim?"

"Hiç kimse, günlük işlerde," dedi Priya. "Root hesabı cerrahtır. Sadece belirli, belgelenmiş
işlemler için ortaya çıkar."

**IAM'in Yapı Taşları**

IAM'in dört temel kavramı vardır. Birbirinin üzerine inşa edilirler.

**Kullanıcılar** bireysel kimliklerdir. Maya'nın bir IAM kullanıcısı var. Tom'un bir IAM
kullanıcısı var. Her kullanıcının kendi kimlik bilgileri vardır — ve yalnızca özellikle
ihtiyaç duyduğu izinlere sahip olmalıdır.

Bir IAM kullanıcısının iki tür kimlik bilgisi vardır: konsol erişimi için bir **şifre** (AWS
web arayüzüne giriş yapmak) ve CLI ya da SDK'lar aracılığıyla programatik erişim için
**erişim anahtarları** (bir anahtar kimliği ve gizli anahtar). Her zaman ikisine birden
ihtiyacınız yoktur. Yalnızca CLI kullanan bir geliştiricinin konsol şifresine ihtiyacı yoktur.
Yalnızca konsola ihtiyaç duyan teknik olmayan bir kullanıcının erişim anahtarlarına ihtiyacı
yoktur. Yalnızca gerekeni verin.

**Gruplar** kullanıcı koleksiyonlarıdır. Maya, Tom, Priya ve Leo için izinleri tek tek
ayarlamak yerine, geliştirici izinlerine sahip bir "Geliştiriciler" grubu oluşturur ve onları
ona eklersiniz. Beşinci bir kişi katıldığında, onu gruba eklersiniz ve anında doğru izinleri
miras alır.

Grupların pratik faydası bakım kolaylığıdır. "Geliştiriciler" grubunun yeni bir izne ihtiyacı
varsa — diyelim ki yeni bir S3 kovasına erişim — onu gruba bir kez eklersiniz ve tüm
geliştiriciler hemen ona sahip olur. Gruplar olmadan, her kullanıcıyı tek tek güncellerdiniz;
bu da tutarsızlık fırsatları yaratır ve insanları atlar.

**Roller**, bir şey tarafından — bir kişi, bir hizmet ya da başka bir AWS hesabı —
*üstlenilebilen* geçici kimliklerdir. Bölüm 14'te rollere derinlemesine gireceğiz. Şimdilik:
bir Kullanıcı kalıcı bir çalışansa, bir Rol bir ziyaretçi rozetidir. Belirli bir süre ya da
amaç için belirli erişim verir.

Bu bölüm için Rollerin en önemli kullanımı: EC2 örnekleri için IAM Rolleri. Bir EC2 örneğine
bir Rol eklediğinizde, o örnekte çalışan uygulama, Rol'ün izinlerini kullanarak — herhangi bir
yere depolanan statik kimlik bilgisi olmadan — AWS API çağrıları yapabilir. Kimlik bilgileri
geçicidir, AWS tarafından otomatik olarak döndürülür ve Rol'ün politikalarıyla kapsanır. Bu,
"yapılandırma dosyalarındaki kimlik bilgileri" sorununu tamamen ortadan kaldırır.

**Politikalar** asıl izin kurallarıdır. Bir politika (dahili olarak JSON ile yazılır, ama
biçimi ezberlemenize gerek yok) şunu söyleyen bir belgedir: "Bu politikanın sahibinin Y
kaynağında X eylemini gerçekleştirmesine İZİN VERİLİR." Ya da "Z eylemi REDDEDİLİR."

AWS, yaygın kullanım senaryoları için yüzlerce **yönetilen politika** — önceden yazılmış
politikalar — sağlar. `AmazonS3ReadOnlyAccess` tüm S3 kovalarına okuma erişimi verir.
`AmazonEC2FullAccess` tam EC2 kontrolü verir. Üretim kullanımı için, genellikle **müşteri
tarafından yönetilen politikaları** — kendiniz yazdığınız, uygulamanızın gerçekten ihtiyaç
duyduğu kaynaklara ve eylemlere tam olarak kapsanmış politikaları — istersiniz.

IAM değerlendirme modeli şudur: varsayılan olarak her şey reddedilir. İzinler açıkça
verilmelidir. Bir politika bir şeyi yapabileceğinizi söylemiyorsa, yapamazsınız.

**En Az Yetki İlkesi**

İnsanlara ve sistemlere yalnızca işlerini yapmak için ihtiyaç duydukları erişimi verin. Daha
fazlasını değil.

Priya buna "en az yetki ilkesi" dedi. Bariz gibi görünür. Pratikte, çoğu ekip bunu sürekli
ihlal eder — kötü niyetle değil, kolaylık için.

"Leo'ya işleri daha hızlı dağıtabilsin diye yönetici erişimi versek olmaz mı?"

Hayır.

"Her şey için root hesabını kullansak olmaz mı?"

Kesinlikle olmaz.

Root hesabı, tüm AWS hesabınızın ana anahtarıdır. Hesabın kendisini kapatmak dâhil her şeyi
yapabilir. Onu bir kez oluşturmalı, çok faktörlü kimlik doğrulamayı kurmalı ve sonra günlük iş
için bir daha asla kullanmamalısınız.

Root hesabı gerektiren tam olarak bir avuç görev vardır: hesap e-posta adresini değiştirmek,
başka türlü devredilmemiş faturalandırma bilgilerini görüntülemek, hesabı kapatmak ve AWS'nin
açıkça root'a kısıtladığı birkaç yönetimsel işlem daha. Başka her şey için — kullanıcılar
oluşturmak, altyapı dağıtmak, veritabanlarına erişmek — IAM kullanıcıları ve rolleri
kullanırsınız. Root hesabı bina yöneticisi içindir. Herkesin uygun anahtar kartları vardır.

Priya o öğleden sonra herkes için ayrı IAM kullanıcıları oluşturdu. Leo'ya geliştirme
ortamına dağıtım izinleri verdi. Üretime değil. Faturalandırmaya değil. Ağa değil. Sadece
dağıtıma.

"Bu kısıtlayıcı geliyor," dedi Leo.

"Doğru olduğunu böyle anlarsın," diye yanıtladı Priya.

Geliştirme-üretim sınırı, Priya'nın çizdiği ilk ve en önemli en-az-yetki çizgisiydi.
Geliştiricilerin geliştirmede hızlı hareket etmesi gerekiyordu: kaynaklar oluşturmak,
yapılandırmaları test etmek, hatalar yapmak. Ama üretim farklıydı. Üretim değişikliklerinin
kasıtlı, gözden geçirilmiş ve kontrollü bir süreçle yürütülmesi gerekiyordu. Bir geliştiriciye
doğrudan üretim erişimi vermek, ona geliştirme hızında üretim hataları yapma yeteneği vermekti.

Zamanla Priya, üretim erişiminin bir rol üstlenme süreciyle geçici olarak verildiği bir sistem
kurdu: üretimde bir değişiklik yapması gereken bir geliştirici erişimi talep ediyor, 4 saatlik
bir pencere için alıyor, değişikliği yapıyor ve erişim otomatik olarak sona eriyordu. Pencere
CloudTrail'de günlüğe kaydediliyordu. Erişim, süresi dolduktan sonra kullanılamıyordu. Üretim,
erişimi kalıcı olarak reddederek değil, erişimi zaman sınırlı ve denetlenebilir kılarak
korunuyordu.

Şunu merak ediyor olabilirsiniz: varsayılan olarak her şey reddediliyorsa, root hesabının
neden tam erişimi var? Root hesabı özeldir — IAM'i tamamen atlar. Onu kilit altına almanızın
nedeni tam olarak budur. AWS'deki diğer her eylem, eksik bir İzin Ver'in bir Reddet'le aynı
olduğu IAM'in değerlendirme zincirinden geçer.

**Patlama Yarıçapı: En Az Yetki Şirketleri Neden Kurtarır**

Güvenlik mühendislerinin kimlik bilgisi tehlikesini düşünmek için kullandığı bir kavram var:
**patlama yarıçapı**.

Patlama yarıçapı, bir saldırgan belirli bir kimlik bilgisini ele geçirirse yapabileceği azami
hasardır.

Bir AWS hesabının root kimlik bilgilerine sahip bir saldırganın sınırsız patlama yarıçapı
vardır. Her kaynağı silebilir, her bayt veriyi dışarı sızdırabilir, her Bölge'de GPU örnekleri
başlatabilir ve hesabı kapatabilir. Kimlik bilgisinin kendisi hiçbir sınır içermez.

Leo'nun IAM kimlik bilgilerine — geliştirme ortamına dağıtım yapmak ve bir S3 kovasından
okumakla kapsanmış — sahip bir saldırganın küçücük bir patlama yarıçapı vardır. Dev'e dağıtım
yapabilir. Bazı dosyaları okuyabilir. Üretime dokunamaz. Veritabanına erişemez.
Faturalandırmayı göremez. GPU örnekleri başlatamaz.

Önceki ihlal hikâyesinin büyük bir patlama yarıçapı vardı çünkü geliştiricinin kimlik
bilgileri yöneticiydi. Aynı kimlik bilgileri gerçek işine kapsanmış olsaydı — tek bir belirli
ortama dağıtım yapmak — hasar çok daha küçük olurdu. Saldırı yine de gerçekleşmiş olabilirdi.
Sonuç farklı olurdu.

İşte bu yüzden en az yetki sadece bir politika değildir. Bir mimaridir. Vermediğiniz her izin,
sahip olmadığınız patlama yarıçapıdır.

**Bunu Yanlış Yaptığınızda Ne Olur**

Üç senaryo, artan ciddiyet sırasıyla:

**Senaryo 1**: Yönetici erişimi olan bir çalışan şirketten ayrılır. Kimse hesabını devre dışı
bırakmaz. Üç ay sonra hâlâ erişimi vardır. Bu sürekli olur. IAM bunu çözer: kullanıcıyı devre
dışı bırakırsınız. Anında, her yerde.

Bu, en yaygın IAM arıza modudur ve tamamen önlenebilir. Çoğu kuruluşun fiziksel erişimi iptal
etmek için bir süreci vardır (bir rozet iade etmek, bir dizüstü iade etmek) ama IAM'i
gözden kaçırır. "IAM kullanıcısını devre dışı bırak" ve "tüm IAM gruplarından çıkar"ı içeren
işten ayrılma kontrol listesi karmaşık bir mühendislik sorunu değildir — süreç disiplinidir.
Bunu tutarlı yapan ekipler, eski bir çalışan hâlâ üretim veritabanına erişebildiğinde ne
olduğunu hiç öğrenmeyenlerdir.

**Senaryo 2**: Bir geliştiricinin dizüstü bilgisayarı ele geçirilir. Saldırgan, tam yönetici
izinlerine sahip bir yapılandırma dosyasında saklanan AWS kimlik bilgilerini bulur. Kimlik
bilgileri geniş erişime sahip olduğundan, saldırgan her şeyi yapabilir: kripto para
madenciliği yapmak, veri çalmak, yedekleri silmek. En az yetkiyle: kimlik bilgileri yalnızca
sınırlı kapsamlarında çalışır. Patlama yarıçapı sınırlanır.

Yapılandırma-dosyasındaki-kimlik-bilgileri kalıbı olması gerektiğinden daha yaygındır.
Geliştiriciler genellikle yerel geliştirme için AWS kimlik bilgilerini `~/.aws/credentials`
içinde saklar — ki sorun değil. Sorun, o kimlik bilgilerinin bir sandbox ortamına
kapsanmak yerine üretim düzeyinde erişime sahip olmasıdır. Geliştirme kimlik bilgileri bir
geliştirme ortamına kapsanmalıdır. Üretim erişimi, her zaman her dizüstüde bulunmak yerine,
üstlenmek için açık adımlar gerektirmelidir.

**Senaryo 3**: Kötü yazılmış bir uygulama, AWS kimlik bilgilerini yanlışlıkla günlüklerinde
açığa çıkarır. O kimlik bilgileri geniş erişime sahipse, felaket bir ihlaliniz olur. Dar
erişime sahiplerse — yalnızca uygulamanın ihtiyaç duyduğu belirli S3 kovasına — açığa çıkma
sınırlı ve kontrollü olur.

Günlüklerdeki-uygulama-kimlik-bilgileri senaryosu inceliklidir. Çoğu zaman, hata ayıklama kodu
tüm istek bağlamını — yetkilendirme başlıkları dâhil — günlüğe kaydettiğinde ya da bir hata
işleyici tüm ortam değişkenlerini (`AWS_ACCESS_KEY_ID` dâhil) bir günlük dosyasına
serileştirdiğinde olur. Buradaki güvence, statik kimlik bilgilerini uygulama ortamından
tamamen ortadan kaldıran EC2 için IAM Rolleri'dir. Statik kimlik bilgisi yoksa, günlüklerde
görünemezler.

Kalıp: erişim minimuma kapsanmalıdır. Her zaman. İnsanlarınıza güvenmediğiniz için değil, ele
geçirilmiş kimlik bilgilerine ne olacağını kontrol edemediğiniz için.

**Geniş Erişim Varsa Kolaylık Vardır Ama Açığa Çıkma Da Vardır**

Ekiplere ihtiyaç duyduklarından daha geniş erişim verme ayartması her zaman vardır —
dağıtımları hızlandırır, sürtünmeyi azaltır, akışı bozan "Erişim Engellendi" anlarından
kaçınır. Herkese yönetici erişimi verirseniz, dağıtımlar sorunsuz olur ve kimse engellenmez —
ama kimlik bilgileri sızdığında (ve sızar), saldırgan tam yönetici haklarını miras alır. Ele
geçirilmiş tek bir dizüstü, eksiksiz bir hesap ihlaline dönüşür. Önce minimum izni yazın.
Yalnızca bir şey başarısız olduğunda genişletin. Bu kural şirketleri kurtarır.

**Çok Faktörlü Kimlik Doğrulama: İkinci Kilit**

En az yetkiyle bile kimlik bilgileri çalınabilir. Şifreler tahmin edilebilir, oltalanabilir ya
da sızdırılabilir. IAM bunu **Çok Faktörlü Kimlik Doğrulama (MFA)** ile ele alır.

MFA, *bildiğiniz* bir şey (şifre) artı *sahip olduğunuz* bir şey (bir telefon, bir donanım
anahtarı) gerektirir. Bir saldırgan şifrenizi çalsa bile, telefonunuza da sahip olmadan giriş
yapamaz.

MFA, her IAM kullanıcısı için etkinleştirilmelidir. Root hesabı için pazarlık kabul etmez.

Priya öğleden sonrayı herkes için onu kurarak geçirdi. Pürüzsüz gitmedi.

Leo'nun kimlik doğrulayıcı uygulaması yanlış hesabı iki kez kaydetti. QR kodunu üç kez taraması
gerekti çünkü dizüstü bilgisayarındaki saat biraz senkron dışıydı, bu da zaman tabanlı
belirteçlerin başarısız olmasına neden oluyordu. Üçüncü denemede işe yaradı.

"Bunu uygulama olmadan yapmanın bir yolu var mı?" diye sordu Leo, telefonuna bakarak.

"Donanım anahtarları," dedi Priya. "USB'ye takılan fiziksel bir cihaz. Uygulamadan daha
güvenli. Daha pahalı."

"Ne kadar daha pahalı?"

"Anahtar başına yaklaşık 50 dolar. Birini kaybetme ihtimaline karşı iki tane istersin."

Tom defterine "geliştirici başına 100 dolar" yazdı.

"Onları satın alıyoruz," dedi Priya. "En azından root hesabı için."

Tom genel olarak çok fazla sürtünme olup olmadığını sordu. Priya ihlal hikâyesini yeniden
açtı.

Tom MFA'yı hemen kurdu.

"Peki ya bu geçişin ortasındayken biri içeri girmeye çalışırsa?" diye sordu Priya. "Herkes
MFA'yı etkinleştirmeden önce?"

Kimsenin iyi bir cevabı yoktu. Önce, herkesten önce root hesabı için MFA'yı kurdu.

**IAM Access Analyzer: İkinci Bir Çift Göz**

MFA kurulumu tamamlandıktan sonra Priya'nın ekibe gösterecek bir aracı daha vardı.

"Bu otomatik çalışır," dedi, yeni bir konsol sekmesi açarak.

**IAM Access Analyzer**, IAM politikalarınızı sürekli analiz eden ve hesabınızın dışındaki —
ya da beklediğinizin dışındaki — kaynaklara erişim veren her şeyi işaretleyen bir hizmettir.

İlk çalıştırmada bir şey buldu.

Leo'nun üç hafta önce "geçici" olarak kurup sonra unuttuğu bir S3 kovasının, herkese açık
okuma erişimine izin veren bir kova politikası vardı. Kova bazı test veri dosyaları
içeriyordu, hassas bir şey değil. Ama ayrıca Leo'nun `db-backups-staging` adını verdiği ve
içe aktarma sürecini test etmek için birkaç dışa aktarılmış SQL dosyasıyla doldurduğu bir
klasör de içeriyordu.

"Bu SQL dosyalarında hassas bir şey var mı?" diye sordu Priya.

Leo klasör adına baktı. Sonra içindeki dosyalara. Sonra tavana.

"Hazırlık veritabanını dışa aktardım," dedi. "İçinde erken üretim müşteri verisinin kopyaları
var."

Priya dizüstü bilgisayarını yavaşça kapattı.

Kova beş dakika içinde özel olarak ayarlandı. Access Analyzer, beklenmedik şekilde kaynakları
açan gelecekteki herhangi bir politika için izlemeye devam etti.

"Bunu bir çevre alarmı olarak düşün," dedi Priya. "Biri yanlışlıkla bir kapıyı her açık
bıraktığında, bize haber verir."

Şunu merak ediyor olabilirsiniz: IAM Access Analyzer, manuel politika incelemesinin yerini
alır mı? Hayır. Bir tespit aracıdır, bir önleme aracı değil. Size verilmiş olan erişim
hakkında bilgi verir — o erişimin kasıtlı olup olmadığını söyleyemez. "Bu politika doğru
muydu?" şeklindeki insan incelemesinin yine de gerçekleşmesi gerekir. Access Analyzer sadece
açık pencerelerin fark edilmeden kalmamasını sağlar.

## Güçlü Yönler ve Sınırlamalar

**IAM şunlar için doğru araçtır**:

- Her AWS kaynağına kimin ve neyin erişebileceğini kontrol etmek
- Kullanıcılar, hizmetler ve hesaplar arası sınırlar genelinde en az yetkiyi uygulamak
- Sistemler arasında uzun ömürlü kimlik bilgilerini paylaşma ihtiyacını ortadan kaldırmak
- Her IAM eylemi otomatik olarak günlüğe kaydedilir; bu size kimin ne zaman ne yaptığına dair
  bir denetim izi verir (Bölüm 14'te ele alınır)
- Hesaplar arası erişim: A Hesabı'ndaki bir IAM Rolü, B Hesabı'ndaki bir asıl tarafından
  üstlenilebilir; bu, kimlik bilgisi paylaşımı olmadan AWS hesapları arasında kaynakların
  kontrollü paylaşımına olanak tanır

**IAM'in zorlaştığı yer**: IAM politikaları onlarca rol genelinde yüzlerce ifadeye dönüşebilir
ve bir "Erişim Engellendi" hatasında hata ayıklamak, o politikalardan hangisinin etkili
olduğunu anlamayı gerektirir — kulağa geldiğinden daha zor bir görev. En yaygın IAM hatası
çok az erişim değil — çok fazla erişimdir. "Sadece çalışsın diye" oluşturulan aşırı izinli
politikalar, sonradan geri almanın acı verici olduğu güvenlik yükümlülüklerine dönüşür. Önce
minimum izni yazın. Yalnızca bir şey başarısız olduğunda genişletin.

IAM ile ölçekte pratik bir zorluk var: **politika yayılması (policy sprawl)**. Birkaç yıldır
AWS çalıştıran kuruluşların genellikle onlarca ya da yüzlerce özel politikası vardır;
bunların çoğu örtüşür, bazıları hiç kullanılmaz ve birkaçı, çelişkiler yalnızca uç durumlarda
önemli olduğundan kimsenin fark etmediği şekillerde birbiriyle çelişir. AWS, politikaları
denetlemek ve rasyonelleştirmek için **IAM Access Analyzer** (bu bölümde tanıttık) ve **IAM
politika simülasyonu** araçları sağlar. Ama en etkili strateji, politikaların birikmesine izin
verip sonradan onları çözmeye çalışmak yerine, baştan temiz politikalar oluşturmak ve düzenli
olarak denetlemektir.

Priya üç ayda bir IAM incelemesi kurdu: tüm rolleri ve politikaları listele, CloudTrail
günlükleri aracılığıyla hangilerinin aktif olarak kullanıldığını kontrol et, kaldırma ya da
kısıtlama için kullanılmayan kimlik bilgilerini ya da aşırı geniş politikaları işaretle.
İnceleme çeyrek başına iki saat sürdü ve ilk yılında üç politika sorunu yakaladı.

"Heyecan verici bir iş değil," dedi. "Ama erişim incelemeleri, birisi onları önce fark
etseydi felaket olacak şeyleri böyle bulursunuz."

## Özet

Admin123 şifresi belirtiydi. Hastalık, Nimbus'un hiçbir erişim kontrol stratejisinin
olmamasıydı — paylaşılan bir root kimlik bilgisi, rol yok, politika yok, denetim izi yok. IAM
sadece belirtiyi düzeltmez; ekibi, kaçındıkları bir soruyu yanıtlamaya zorlar: tam olarak
kimin ne yapmasına izin veriliyor? Bu sorunun cevabı, her güvenli AWS mimarisinin temelidir.

- **IAM** (Kimlik ve Erişim Yönetimi), AWS'de kimin ne yapabileceğini kontrol etme şeklinizdir.
  Temel yapı taşları şunlardır: **Kullanıcılar**, **Gruplar**, **Roller** ve **Politikalar**.
- Varsayılan olarak, AWS'deki her şey **reddedilir**. İzinler açıkça verilmelidir.
- **En Az Yetki İlkesi**, her kimliğe yalnızca ihtiyaç duyduğu erişimi vermek anlamına gelir —
  bir kimlik bilgisi ele geçirilirse **patlama yarıçapını** en aza indirmek.
- **Root hesabı** her şeyi yapabilir, felaket boyutunda şeyler dâhil. Onu MFA'nın arkasına
  kilitleyin ve mümkün olduğunca az kullanın.
- Her IAM kullanıcısı için **MFA**'yı etkinleştirin. Pazarlık kabul etmez — sınavda ve
  üretimde.

## Sınav İpuçları

*SAA-C03 Alan 1 — Görev 1.1 (AWS kaynaklarına güvenli erişim)*

- **Varsayılan olarak her şey reddedilir.** Açık bir "İzin Ver" gereklidir. Bir politika bir
  eylemden söz etmiyorsa, eylem reddedilir.
- **Açık Reddet her zaman kazanır.** Zincirdeki herhangi bir politika bir eylemi reddederse, bu
  reddetme zincirdeki başka bir yerdeki bir İzin Ver tarafından geçersiz kılınamaz. Bu, birçok
  adayı gafil avlar.
- **Root hesabı ≠ IAM yöneticisi.** Root hesabı, IAM'den ayrı bir kimlik bilgisidir. Root
  hesabını silemezsiniz. Ne zaman kullanıldığını kısıtlayabilirsiniz (ve kısıtlamalısınız).
- **IAM küreseldir**, Bölgesel değil. IAM kullanıcıları, grupları, rolleri ve politikaları,
  Bölge başına değil, tüm AWS hesabı genelinde var olur.
- **Roller, AWS hizmetlerine erişim vermenin tercih edilen yoludur.** Bir EC2 örneğinin S3'e
  erişmesi gerekiyorsa, örneğe bir IAM Rolü eklersiniz — makinede kimlik bilgisi saklamazsınız.
  Bu kalıp sınavda sürekli çıkar.
- **IAM Access Analyzer**, kaynaklar hesap dışından ya da kuruluş dışından erişilebilir
  olduğunda bulgular üretir. Bir sınav senaryosu S3 ya da KMS'ye istenmeyen dış erişimi tespit
  etmekten söz ettiğinde, cevap Access Analyzer'dır.
- **Root hesabı için MFA zorunludur**, AWS güvenlik en iyi uygulamaları bağlamında isteğe bağlı
  değil. Root hesabını güvene almakla ilgili sınav soruları her zaman doğru cevabın bir
  parçası olarak MFA'yı içerir.
- **İzin sınırları (permission boundaries)**, bir IAM kullanıcısının ya da rolünün
  politikaları daha fazlasını verse bile sahip olabileceği azami izinleri sınırlayan gelişmiş
  bir IAM özelliğidir (Bölüm 14'te ele alınır). "Yetki yükseltmeyi önleme" ya da "azami izin
  tavanı belirleme" ile ilgili sınav soruları izin sınırlarına işaret eder.
- **Hizmet Kontrol Politikaları (SCP'ler)**, bir AWS Organizasyonu'nun üye hesaplarında neyin
  yapılabileceğini kısıtlayan kuruluş düzeyindeki politikalardır. IAM düzeyinin üzerinde
  çalışırlar — bir hesap yöneticisi bile bir SCP tarafından belirlenen sınırları aşamaz. Bir
  sınav senaryosu çok hesaplı güvenlik yönetişimi içerdiğinde, SCP'leri düşünün.
- **CloudTrail**, tüm IAM API çağrılarını kaydeder. Bir sınav senaryosu "IAM politikalarında
  hangi kullanıcıların değişiklik yaptığını nasıl denetlerdiniz" diye sorduğunda, cevap
  CloudTrail'dir. Her IAM eylemi — bir kullanıcı oluşturmak, bir politika değiştirmek, bir rol
  üstlenmek — günlüğe kaydedilir. 90 günlük olay geçmişi otomatik ve ücretsizdir; uzun vadeli
  saklama ve uyarı için, günlükleri bir S3 kovasına teslim eden bir Trail oluşturmalısınız.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizle: Bir IAM Kullanıcısı, bir Grup ve bir Rol arasındaki fark nedir? Her
birini ne zaman kullanırsınız?

*(İpucu: Anahtar kart bina benzetmesini düşünün — hangisi kalıcı bir kart, hangisi bir
departman gruplaması ve hangisi bir ziyaretçi rozeti?)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket, bir S3 kovasından dosya okuması gereken EC2 örneklerinde bir web
uygulaması çalıştırıyor. Junior bir geliştirici, AWS erişim anahtarlarını doğrudan EC2
örneklerindeki uygulama koduna saklamayı öneriyor. Güvenlik ekibi itiraz ediyor.

EN güvenli ve operasyonel olarak uygun çözüm nedir?

A) Erişim anahtarlarını kod yerine EC2 örneğindeki ortam değişkenlerinde saklayın  
B) S3 okuma izinlerine sahip özel bir IAM kullanıcısı oluşturun ve kimlik bilgilerini
   geliştirme ekibiyle paylaşın  
C) Uygun S3 okuma izinlerine sahip bir IAM Rolü'nü doğrudan EC2 örneklerine ekleyin  
D) Uygulamaya tüm AWS kaynaklarına tam erişim vermek için root hesabı kimlik bilgilerini
   kullanın

**İpucu 1**: Kimlik bilgilerini örnekte herhangi bir yerde saklamanın sorunu, kimlik
bilgilerinin sızdırılabilmesidir. EC2 örneğine hiç kimlik bilgisi kullanmadan erişim vermenin
bir yolu var mı?

**İpucu 2**: AWS'nin, statik kimlik bilgilerine ihtiyaç duymadan hizmetlere izin
verilebildiği bir mekanizması var. O mekanizmanın adı nedir?

**İpucu 3**: IAM Rolleri EC2 örneklerine eklenebilir. Eklendiklerinde, örnek otomatik olarak
AWS tarafından döndürülen geçici kimlik bilgileri alır. Statik kimlik bilgisi gerekmez.

**Cevap**: C

**Açıklama**: Bir EC2 örneğine bir IAM Rolü eklemek doğru kalıptır. Örnek, EC2 meta veri
hizmeti aracılığıyla otomatik olarak geçici, döndürülen kimlik bilgileri alır. Sızdırılacak,
döndürülecek ya da yanlışlıkla bir depoya işlenecek uzun ömürlü kimlik bilgisi yoktur.

**Neden A değil?** Bir EC2 örneğindeki ortam değişkenleri yine de sızdırılabilir — uygulama
günlükleri, hata ayıklama uç noktaları aracılığıyla ya da örnek ele geçirilirse. Sorun
statik kimlik bilgileridir, konumları değil.

**Neden B değil?** Paylaşılan bir IAM kullanıcısı oluşturup kimlik bilgilerini bir ekibe
dağıtmak en az yetkiyi ihlal eder ve kimlik bilgisi döndürmeyi bir kâbusa çevirir. Bir kişi
ayrılırsa, paylaşılan kimlik bilgilerini değiştirmeden yalnızca onun erişimini kolayca iptal
edemezsiniz.

**Neden D değil?** Herhangi bir uygulama için root hesabı kimlik bilgilerini kullanmak ciddi
bir güvenlik ihlalidir. Root hesabının sınırsız erişimi vardır ve kimlik bilgileri asla hesap
sahibinin kontrolünden çıkmamalıdır.

*SAA-C03 Alan 1 — Görev 1.1 (IAM rolleri, en az yetki)*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus önümüzdeki ay üç yeni geliştirici işe alıyor. Her biri farklı erişim düzeylerine ihtiyaç
duyacak: biri veritabanı katmanında, biri uygulama sunucularında, biri ön uç statik
dosyalarında çalışıyor. Ayrıca kod dağıtması gereken bir CI/CD boru hattı da var.

Bu senaryo için bir IAM yapısı tasarlayın. Hangi kullanıcıları, grupları, rolleri ve
politikaları oluşturursunuz? Uygulanacak en önemli en-az-yetki sınırı ne olurdu?

*(Tek bir doğru cevap yoktur. Herhangi bir kimlik ele geçirilirse patlama yarıçapını en aza
indirmeyi düşünün.)*

## Jenerik Sonrası Sahne

Günün sonunda, her IAM kullanıcısının MFA'sı etkinleştirilmişti. Leo'nun hesabı geliştirici
düzeyinde erişime indirgenmişti: dev ortamına dağıtım yap, paylaşılan yapılandırma kovasından
oku, başka bir şey değil.

Bir kez, üretim veritabanına erişmeyi denemişti.

Erişim engellendi.

"Güvenilmek ama çok da fazla değil, hissi bu mu?" diye sordu.

"Tam olarak hissettiren bu," dedi Priya.

Ertesi sabah Tom erken geldi ve onu hemen ekibi çağırmaya iten bir şey buldu.

AWS konsolunda, web sitelerinin trafik aldığını görebiliyordu. Bekledikleri kadarından daha
fazla. Ve web sunucusu — Leo'nun orijinal sunucusu — kızgın çalışıyordu. Gerçekten kızgın.

"Yüz eşzamanlı kullanıcımız var," dedi Tom. "Ve tek bir sunucu."

Bir sonraki bölümde: ilk sunucu — başkasının veri merkezinde bir bilgisayar kiralamak.
