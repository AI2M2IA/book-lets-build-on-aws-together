# Bölüm 5: Bulutta Yaşayan Dosya Dolabı

Leo, sabah dokuzda EC2 örneğini temizlerken o klasörü buldu.

Ofis sessizdi. Maya henüz gelmemişti. Kahve hâlâ demleniyordu. Pencerenin dışında, erken işe
gidenler tek tük geçiyordu. Leo kulaklığını takmış ve dizinler arasında kaydırırken durdu.

Sekiz yüz dosya. Hepsi menü fotoğrafı. Hepsi tek bir makinede, yedeği olmadan.

Nimbus uygulamasının çalıştığı EC2 örneği, on iki dakikalık kesintiden bu yana bir kez
yükseltilmişti, ama fotoğraf depolama hiç taşınmamıştı. Her çıtır arepa, her ızgara somon
tabağı, her kusursuz tabaklanmış salata kâsesi — uyarı olmadan çökebileceğini çoktan
kanıtladıkları tek bir sanal makinede duruyordu.

Ve o makine bir gün yeniden başlatılır, yeniden boyutlandırılır ya da değiştirilirse?

Gitmiş.

"Müşteriler şimdiye kadar kaç fotoğraf yükledi?" diye sordu Maya, geldiğinde.

Leo döndü. "Yaklaşık sekiz yüz."

"Peki sunucuyu yeniden başlatırsak o sekiz yüz fotoğrafa ne olur?"

Leo'nun anlamlı duraklamalarından bir tanesi daha.

Bu bölüm, dosyaların bulutta gerçekte nereye ait olduğu hakkında.

**Dosyaları "Sunucuda" Saklamanın Sorunu**

Dosyaları doğrudan bir EC2 örneğinde — dosya sisteminin içinde — sakladığınızda, o dosyaları o
belirli makinenin yaşam döngüsüne bağlıyorsunuz.

Bu birkaç sorun yaratır:

**Doğası gereği geçici.** EC2 örnekleri durdurulabilir, sonlandırılabilir, değiştirilebilir.
Yerel diskleri kalıcı olacak şekilde tasarlanmamıştır. Geçici bir karalama alanıdır.

**Tek arıza noktası.** Örnek arızalanırsa, dosyalar onunla birlikte gider. Yedeklilik yok.
Yedek yok. Bir kötü sabah ve sekiz yüz menü fotoğrafı kaybolur.

**Örnekler arasında paylaşılamaz.** İkinci bir sunucu eklediğinizde (ki Bölüm 7'de
ekleyeceksiniz), ilk sunucunun diskinde saklanan dosyaları görmez. İki sunucu birbirinden
yalıtılmıştır. Bir fotoğraf yükleyen bir kullanıcı onu görebilir; farklı bir sunucuya çarpan
başka bir kullanıcı göremeyebilir.

**Ölçek yok.** EC2 disk alanı sınırlıdır. Onu doldurursanız, ya yüklemeleri kabul etmeyi
durdurursunuz ya da baskı altında depolamayı genişletmek için telaşa kapılırsınız.

Leo, birden fazla sunucuyla ne olacağını düşünmemişti. Bunu Priya'ya gelişigüzel söyledi.

"Dur — fotoğraf sorunu iki sunucuyla nasıl işler?" diye sordu Priya.

"Ne demek istiyorsun?"

"Bir yük dengeleyicinin arkasında Sunucu A ve Sunucu B varsa," dedi Priya, "ve bir müşteri bir
fotoğraf yüklerse — isteği Sunucu A'ya gider, değil mi? Yani fotoğraf Sunucu A'nın diskine
kaydedilir. Şimdi bir sonraki isteği Sunucu B'ye gidiyor. Sunucu B'de fotoğraf yok. Müşteri ne
görür?"

Leo ağzını açtı. Sonra kapattı.

"Bozuk bir görsel," dedi sonunda.

"Ya da bir 404 hatası," dedi Priya. "Ya da, uygulama onu yüklemeyi deneyip çökerse, bir hata
sayfası."

Yük dengeleyici planını beyaz tahtaya çizdi — ikinci bir sunucu eklemek zaten yol haritasındaydı.
Bu gerçekleştiği anda, her fotoğraf yüklemesi bir yazı tura olacaktı: Sunucu A'ya yükle,
muhtemelen Sunucu B'den sun, fotoğraf eksik, müşteri şaşkın.

"Neyin yanlış olduğunu çözmeden önce bir hafta hata ayıklamış olurduk," dedi Leo.

"Auto Scaling'i açtığımızda ve birden bire üç ya da dört sunucumuz olduğunda ne olacağını
düşündük mü?" diye sordu Priya. "Sürekli fotoğraf eksik olurdu."

Bu, birim testlerinde görünmeyen bir hata sınıfıdır. Yalnızca üretimde, yük altında, gerçek
trafik birden fazla sunucuya yayıldığında ortaya çıkar. Çözüm, dosyaları sunucularda saklamayı
tamamen bırakmaktır.

Daha iyi bir model var. AWS onu 2006'da inşa etti ve hâlâ dünyadaki en yaygın kullanılan bulut
hizmetlerinden biri.

**Çevrimiçi Yaşayan Sabit Disk**

İnternette yaşayan bir sabit disk hayal edin — ihtiyaç duyduğunuz kadar veriyi tutacak şekilde
ölçeklenen ve sizden yalnızca gerçekten kullandığınız kadar ücret alan biri. Onu hiç tahsis
etmezsiniz. Alanın tükenmesinden hiç endişe etmezsiniz. Bugün sekiz yüz fotoğraf, gelecek yıl
sekiz milyon koyarsanız, sizin tarafınızda fatura kaleminden başka hiçbir şey değişmez.

İşte AWS'nin sunduğu şey bu. Buna **Amazon S3** — Simple Storage Service — diyorlar.

S3, AWS'nin nesne depolama hizmetidir. Tam olarak bir dosya sistemi gibi değil, tam olarak bir
veritabanı gibi de değil. Dosyaları — nesne (object) denen — kova (bucket) denen adlandırılmış
kaplarda saklar. Model basittir ve o basitlik asıl meseledir.

S3'teki kilit kavram **nesne**dir.

Bir nesne herhangi bir dosyadır: bir fotoğraf, bir video, bir PDF, bir CSV, bir yedek, bir
günlük dosyası. S3 türü ya da yapısı umursamaz. Baytları saklar ve sorduğunuzda geri verir.

Nesneler **kovaların** içinde yaşar. Bir kova, üst düzey bir klasör gibidir — S3 içinde
nesnelerinizi tutan adlandırılmış bir kap. Her kovanın küresel olarak benzersiz bir adı vardır
(tüm AWS hesapları genelinde iki kova aynı adı paylaşamaz) ve belirli bir Bölge'de bulunur.

**S3 Nasıl Çalışır**

Bir kovaya bir nesne **yüklersiniz**. S3 ona bir **anahtar (key)** verir — esasen
`menus/restaurant-001/photo-arepa.jpg` gibi bir yol adı. O anahtar, nesneyi kova içinde
benzersiz biçimde tanımlar.

Nesneyi, kova adını ve anahtarı kullanarak **indirirsiniz** (ya da alırsınız).

Nesneleri herkese açık erişilebilir de yapabilirsiniz — yani URL'ye sahip herkes onları
indirebilir. Çoğu web sitesi görselleri böyle sunar: görseli S3'te sakla, herkese açık yap,
URL'yi HTML'ine göm.

Ya da nesneleri özel tutarsınız — yalnızca kimliği doğrulanmış isteklerce erişilebilir. Bu,
müşteri verileri, yedekler ve hassas her şey için doğru modeldir.

S3 bir dosya sistemi değildir. Gerçek klasörler yoktur. Bir anahtar adındaki `/` sadece bir
gelenektir — S3, tüm anahtarı düz bir dizge olarak ele alır. Ama klasör gibi görünür ve çoğu
araç onu klasör olarak sunar, bu yüzden pratikte bu ayrımı dert etmeyin.

S3'ün, açıklamadan belli olmayan ama pratikte önemli olan birkaç operasyonel özelliği var:

**Nesne değişmezliği**: S3 nesneleri yerinde düzenlenmez. Bir dosyayı güncellerseniz, aynı
anahtarla nesnenin yeni bir sürümünü yüklersiniz. S3 eski nesneyi yenisiyle değiştirir (ya da
sürüm oluşturma etkinse, ikisini de tutar). Bir satırı `UPDATE` ettiğiniz bir veritabanının
aksine, S3 nesneleri bir-kez-yaz, çok-oku'dur. Sık düzenlediğiniz metin dosyaları ve belgeler
için bu sorun değil — sadece yeni sürümü yükleyin. İçeriğin yalnızca bir kısmını güncellemek
istediğiniz çok büyük dosyalar için, S3'ün nesne modeli her seferinde tüm dosyayı yeniden
yüklemeniz anlamına gelir.

**Güçlü yazma-sonrası-okuma tutarlılığı**: Aralık 2020 itibarıyla, S3 tüm nesneler için güçlü
tutarlılık sağlar — yeni yazmalar, sonraki okumalara anında görünür. 2020'den önce, S3'ün bazı
işlemler için nihai tutarlılığı vardı; bu da bir nesne yazıp hemen okumaya çalışan uygulamalarda
ince hatalara neden oluyordu. Tutarlılık modeli iyileştirmesi bu hata sınıfını ortadan
kaldırdı.

**Nesne URL'leri**: Her S3 nesnesinin bir URL'si vardır. Herkese açık bir nesne için şuna
benzer: `https://bucket-name.s3.region.amazonaws.com/key/path`. Özel nesneler için, kimlik
doğrulama bilgisi içeren ve yapılandırılmış bir süre sonra geçerliliğini yitiren önceden
imzalanmış (pre-signed) URL'ler oluşturabilirsiniz. Uygulamalar ve tarayıcılar nesneleri her
iki URL biçimiyle de alır — özel bir protokol söz konusu değil.

**Oluşturulacak dizin yok**: S3'ün gerçek klasörleri olmadığından, dizin oluşturma işlemleri
yoktur. Yol önekini içeren bir anahtarla bir nesneyi yüklersiniz, hepsi bu. O önekle nesneler
var olduğunda "klasör" konsolda otomatik olarak belirir ve o önekteki tüm nesneler silindiğinde
otomatik olarak kaybolur.

**S3 Neden Sıradan Bir Sabit Diskten Farklı**

Üç şey, S3'ü bir EC2 örneğindeki dosya depolamadan temelden farklı kılar:

**Dayanıklılık (Durability).** AWS, S3'ü %99,999999999 (on bir dokuz) dayanıklılık için
tasarlar. Bu, on milyon nesne saklarsanız, donanım arızası nedeniyle her on bin yılda bir
nesne kaybetmeyi bekleyebileceğiniz anlamına gelir. Bunu, her nesnenin birden fazla kopyasını
en az üç Erişilebilirlik Bölgesi genelinde otomatik olarak saklayarak başarırlar.

Ama dayanıklılık donanım arızasına karşı korur — sizin yanlışlıkla bir şeyi silmenize karşı
değil. Sürüm oluşturma da onun içindir.

**Dayanıklılık** ile **kullanılabilirlik (availability)** arasında önemli bir ayrım var.
Dayanıklılık, verinizin hâlâ var olup olmadığıyla ilgilidir. Kullanılabilirlik, ona şu anda
erişip erişemeyeceğinizle ilgilidir. S3 Standard %99,999999999 dayanıklılık ve %99,99
kullanılabilirlik sunar. Dayanıklılık sayısı neredeyse anlaşılamayacak kadar yüksek; %99,99
kullanılabilirlik rakamı ise bir *tasarım hedefi* — yılda yaklaşık 52 dakika kullanılamazlık.
Sözleşmeye dayalı *SLA* aslında daha düşüktür (ayda %99,9) ve bunu kaçırmak size hizmet
kredileri kazandırır, çalışma süresi değil. Pratikte, S3 kullanılabilirliği her iki sayıdan da
çok daha yüksektir — ama dayanıklılığın ve kullanılabilirliğin ayrı garantiler olduğunu ve
tasarım hedeflerinin ile SLA'ların ayrı vaatler olduğunu anlamak değerlidir.

**Kullanılabilirlik.** S3, bireysel bileşenler arızalandığında bile erişilebilir olacak şekilde
tasarlanmıştır. Tek bir sunucuya bağlanmıyorsunuz — arızaların etrafından dolaşan dağıtık bir
sisteme bağlanıyorsunuz.

**Ölçek.** S3, esasen sınırsız miktarda veri tutar. Tek bir kova trilyonlarca nesne tutabilir.
Amazon'un kendisi, kavraması zor bir ölçekte veri saklamak için S3'ü kullanır. Dünyadaki en
büyük S3 kovaları eksabaytlarca veri tutar — milyonlarca terabayt. Bu ölçeği siz yönetmezsiniz;
sadece nesneleri yüklersiniz ve S3 altta her şeyi halleder.

**Maliyet.** S3 Standard, bu yazının yazıldığı sırada GB başına ayda yaklaşık 0,023 dolara mal
olur. Nimbus'un her biri ortalama 2 MB olan sekiz yüz menü fotoğrafı için bu 1,6 GB depolama —
ayda yaklaşık 0,04 dolar. 800.000 fotoğrafta bile, depolama için ayda 37 dolara bakıyorsunuz.
Aynı depolamanın bir EBS biriminde maliyeti ayda yaklaşık 128 dolar olurdu; ve daha fazlasını
ekleyebilmeden önce genişletme gerektiren sabit bir tavanla. S3 otomatik olarak büyür ve
orantılı olarak ücretlendirir. EBS'nin sabit bir boyutu ve sabit bir maliyeti vardır.

**Sürüm Oluşturma: Geri Al Düğmesi**

İşte Maya'nın S3 konsolunu keşfederken bulduğu bir şey.

S3, **sürüm oluşturmayı (versioning)** destekler. Bir kovada sürüm oluşturmayı
etkinleştirdiğinizde, S3 her nesnenin her sürümünü saklar — önceki sürümler ve silinmiş
sürümler dâhil.

Bu, dosyalarınız için geri al düğmesidir.

Priya, güvenmeden önce onu test etmek istedi. Kovaya bir menü fotoğrafı yükledi, sonra yanlış
bir dosyayla yeni bir sürüm yükledi — otuz saniyede oluşturduğu tamamen siyah bir görsel.

S3 konsolunu açtı, "Sürümleri göster"e tıkladı ve ikisini de buldu: kötü sürüm (geçerli) ve
orijinal (önceki). Önceki sürümü, yeni geçerli sürüm olarak geri kopyalayarak geri yükledi.

"İşe yarıyor," dedi.

"Tüm o sürümleri tutmanın maliyeti ne?" diye sordu Tom.

Her sürümün depolaması için ödeme yaparsınız. Büyük dosyaların birçok sürümü varsa, birikir.
AWS'nin, belirli bir süre sonra eski sürümleri otomatik olarak silen **yaşam döngüsü
politikaları (lifecycle policies)** vardır — bunları, maliyet optimizasyonuna derinlemesine
girdiğimiz Bölüm 23'te ele alıyoruz.

"Yani sürüm oluşturmayı etkinleştiririz ama eski sürümleri otuz gün sonra silmek için bir yaşam
döngüsü kuralı belirleriz," dedi Priya. "Böylece her sürümü sonsuza kadar depolamak için ödeme
yapmadan bir kurtarma penceremiz olur."

Tom sayıyı yazdı. Otuz günlük sürümlerin depolama maliyeti kabul edilebilirdi.

**S3 Olay Bildirimleri: Bir Şeyler Yapan Dosyalar**

Leo menü fotoğraflarına farklı bir açıdan bakıyordu.

"Şu anda," dedi, "bir restoran bir fotoğraf yüklediğinde, orijinali tam çözünürlükte
saklıyoruz. Bazıları dört bine üç bin piksel. Bir müşteri menü sayfasını her telefonda
yüklediğinde, dört megabaytlık bir görsel sunuyoruz."

"Bunun bant genişliği maliyeti ne?" diye sordu Tom.

Leo faturadaki veri aktarım sayılarını açtı. Cevap "olması gerekenden fazla"ydı.

S3'ün **Olay Bildirimleri (Event Notifications)** denen bir özelliği var. Bir kovaya bir nesne
yüklendiğinde, S3 otomatik olarak başka bir hizmeti tetikleyebilir — Bölüm 20'de ele aldığımız
sunucusuz hesaplama hizmeti Lambda gibi. O tetikleyici, herhangi bir manuel müdahale olmadan
yüklemeye yanıt olarak kod çalıştırabilir.

Nimbus çözümü: ham fotoğraf kovasına her fotoğraf yüklendiğinde, bir S3 Olay Bildirimi bir
Lambda işlevini tetikler. Lambda işlevi orijinal fotoğrafı okur, 400 piksel genişliğinde bir
küçük resim oluşturur ve işlenmiş bir fotoğraf kovasına kaydeder. Müşteriye dönük uygulama,
orijinal yerine küçük resmi sunar.

Boru hattı:

1. Restoran, 4 MB orijinal fotoğrafı `nimbus-photos-raw/restaurant-001/arepa.jpg`'a yükler
2. S3 Olay Bildirimi tetikler
3. Lambda işlevi orijinali okur, 400x300 bir küçük resim oluşturur
4. Lambda küçük resmi `nimbus-photos-processed/restaurant-001/arepa.jpg`'a kaydeder
5. Müşteri menüyü yükler, uygulama 4 MB orijinal yerine 40 KB küçük resmi sunar

Sonuç: görsel bant genişliğinde %99 azalma. Daha hızlı sayfa yüklemeleri. Faturada daha küçük
bir veri aktarım satırı. Orijinaller ham kovada korunur, böylece Nimbus daha yüksek çözünürlüklü
sürümler oluşturmak isterse, kaynak materyal oradadır.

"Bu otomatik mi çalışıyor?" diye sordu Maya.

"Herkes bir fotoğraf yüklediğinde," dedi Leo. "Ona hiç dokunmuyoruz."

Bu kalıp — depolama olaylarınca tetiklenen olay güdümlü işleme — modern bulut mimarisindeki en
yaygın ve güçlü kalıplardan biridir. Bölüm 20'de onu ayrıntılı olarak yeniden ele alıyoruz.

**Bölgeler Arası Çoğaltma: Tek Kopya Yetmediğinde**

Priya haftanın sonunda bir uyumluluk sorusu sordu.

"Nimbus AB'deki restoranlara hizmet vermek için genişlerse," dedi, "ve o restoranlar fotoğraf
yüklerse — o fotoğraflar `us-west-2` kovamızda mı saklanır?"

"Evet," dedi Leo.

"Peki GDPR'nin o verinin nerede saklandığı konusunda söyleyecek bir şeyi var mı?"

Var. GDPR'nin veri aktarım hükümleri, AB sakinleriyle ilgili kişisel verilerin AB içinde ya da
yeterli veri korumasına sahip bir yargı bölgesinde saklanmasını gerektirebileceği anlamına
gelir.

S3'ün buna cevabı **Bölgeler Arası Çoğaltma (Cross-Region Replication, CRR)**'dır. Bir kovada
CRR'yi etkinleştirdiğinizde, yüklenen her yeni nesne otomatik olarak başka bir Bölge'deki bir
kovaya çoğaltılır. Kaynak kovayı, hedef kovayı ve S3'e çoğaltmayı gerçekleştirme izni veren IAM
rolünü yapılandırırsınız.

AB genişlemesi gerçekleştiğinde plan şu: AB restoranlarının yüklediği fotoğraflar bir
`eu-west-1` kovasına gidecek ve CRR onları felaket kurtarma için `eu-central-1` (Frankfurt)
içindeki bir yedek kovaya çoğaltacak. AB verisi AB Bölgelerinde kalır.

"Bunun maliyeti ne olur?" diye sordu Tom.

Bölgeler arası veri aktarımı ve depolama maliyetleri geçerlidir — kabaca kaynak Bölge'den
hedefe GB başına aktarım ücreti, artı çoğaltılan kopyalar için depolama. Tom, Nimbus'un
öngörülen AB fotoğraf hacmi üzerinde matematiği yaptı ve kabul edilebilir olacağını belirledi.

"Peki ya biri çoğaltma boru hattına girmeye çalışırsa?" diye sordu Priya. "Çoğaltmayı
gerçekleştiren IAM rolü sıkıca kapsanmalı — yalnızca S3 çoğaltma eylemleri, yalnızca belirli
kovalarda."

Bu gereksinimi genişleme planına yazdı.

**Çok Parçalı Yükleme ve Tamamlanmamış Yükleme Sorunu**

Tom AWS faturasında beklenmedik bir kalem buldu.

"S3'te depolama için ödeme yapıyoruz," dedi, "ama miktar, sahip olduğumuz fotoğraf sayısından
beklediğimden daha yüksek."

Leo araştırdı. S3 Storage Lens raporunda bir kategori buldu: **tamamlanmamış çok parçalı
yüklemeler**.

S3, belirli bir boyuttan büyük bir dosya yüklediğinde, **çok parçalı yükleme (multipart
upload)** kullanır: dosya parçalara bölünür, her parça ayrı ayrı yüklenir ve sonra parçalar
nihai nesneye birleştirilir. Bu, büyük yüklemeleri daha güvenilir hâle getirir — bir parça
başarısız olursa, tüm dosyanın değil, yalnızca o parçanın yeniden denenmesi gerekir.

Ama bir çok parçalı yükleme başlatılıp sonra terk edilirse — kullanıcı tarayıcıyı kapattı, ağ
düştü, uygulama çöktü — kısmi parçalar S3'te kalır, depolama ücretleri biriktirir.
Tamamlanmış nesneler olarak görünmezler, ama depolama olarak faturalandırılırlar.

"Ne kadar?" diye sordu Tom.

"Ayda yaklaşık 12 dolar," dedi Leo. "Hiç tamamlanmamış kısmi yüklemelerden."

Çözüm: tamamlanmamış çok parçalı yüklemeleri yedi gün sonra otomatik olarak silen bir S3
**yaşam döngüsü kuralı (lifecycle rule)**. Bir haftada tamamlanmamış herhangi bir yükleme terk
edilir ve kısmi parçalar temizlenir.

Tom o öğleden sonra yaşam döngüsü kuralını ekledi. Aylık 12 dolarlık ücret birkaç gün içinde
kayboldu.

"Bu yılda 144 dolar," dedi Tom, elektronik tablosuna bakarak. "Hiçbir şey için."

"Çok parçalı yükleme kullanan bir yük testi kurmuştum," dedi Leo. "Ay." Bir duraklama. "Muhtemelen
çoğu o. Test bitince temizlemeyi unuttum."

Tom yine de yazdı.

**Erişim Kontrolü: Herkese Açık ve Özel**

Varsayılan olarak, S3'teki her şey özeldir. Yalnızca AWS hesabınız ona erişebilir.

Tek tek nesneleri herkese açık yapabilirsiniz — menü görsellerini web sitesi ziyaretçilerine
böyle sunarsınız. Ya da her şeyi özel tutup **önceden imzalanmış URL'ler (pre-signed URLs)**
oluşturabilirsiniz: birinin AWS kimlik bilgilerine ihtiyaç duymadan belirli bir nesneyi
indirmesine olanak tanıyan, süre sınırlı bağlantılar. Bir müşterinin faturasını 24 saatliğine
indirmesine izin vermek için mükemmel.

Priya bu konuda çok güçlü görüşlere sahipti.

"Peki ya biri yanlış yapılandırılmış bir kova üzerinden girmeye çalışırsa?" dedi. "İçindeki her
nesneyi tüm internete erişilebilir kılmaya bilinçli olarak karar vermediğiniz sürece, bir
kovayı asla tamamen herkese açık yapmayın. En yaygın S3 güvenlik hatası, hassas veri içeren bir
kovayı yanlışlıkla ifşa etmektir."

AWS'nin artık hesap düzeyinde uygulayabileceğiniz, kova bazında açıkça geçersiz kılmadığınız
sürece tüm kovaları özel olmaya zorlayan bir "Herkese Açık Erişimi Engelle" (Block Public
Access) ayarı var.

Onu etkinleştirin. Her zaman.

Bunun arkasındaki tarih: AWS hesap düzeyinde Herkese Açık Erişimi Engelle'yi eklemeden önce, en
yaygın S3 güvenlik olayı bir kovayı yanlışlıkla herkese açık yapmaktı. Bir geliştirici test
için bir kova oluşturuyor, kolaylık için "herkese açık" kutusunu işaretliyor, düşünmediği başka
klasörlerden birkaçı dâhil bazı dosyalar ekliyor ve sonra unutuyordu. Kova orada, herkese açık
biçimde, aylarca dururdu. Birkaç yüksek profilli vakada, "unutulan test kovası" müşteri verisi,
dahili belgeler ya da kimlik bilgileri içeriyordu.

Hesap düzeyinde Herkese Açık Erişimi Engelle, buna karşı bir güvencedir. Bir geliştirici bir
kovayı yanlışlıkla herkese açık olacak şekilde yapılandırsa bile, hesap düzeyindeki ayar onu
geçersiz kılar. Herhangi bir kova herkese açık olmadan önce hesap düzeyindeki ayarı açıkça devre
dışı bırakmanız gerekir — bu da kazaları önleyen kasıtlı bir yavaşlatıcı yaratır.

Nimbus'un hesap düzeyinde Herkese Açık Erişimi Engelle etkindi. Peki herkese açık erişilebilir
olması gereken menü görselleri nasıl sunulacaktı? Standart kalıp — Nimbus'un daha sonra, Bölüm
13'te benimseyeceği — kovanın önüne bir Origin Access Control politikasıyla CloudFront gibi bir
CDN koymaktır: CDN, özel bir S3 kovasından nesneleri alabilir, ama kimse kovaya doğrudan
erişemez. Bu kalıp, herkese açık bir kovadan daha güvenlidir ve CDN'in önbelleğe almasının S3
istek maliyetlerini azaltmasına olanak tanır.

"Dur — ama bunu neden öyle yapalım ki?" diye sordu Maya. "Görseller zaten herkese açık, o yüzden
kovanın herkese açık olması ne fark eder?"

"Çünkü herkese açık bir kova, herkesin içindekileri sıralayabileceği anlamına gelir," dedi
Priya. "Kovadaki tüm nesneleri listeleyebilirler. Önünde CloudFront ile, yalnızca uygulamada
ifşa ettiğimiz URL'leri görürler. Kovanın kendisi özel kalır."

Maya, saldırı yüzeylerine dair zihinsel modeline "sıralama (enumerate)" ekledi.

**S3 Depolama Sınıfları: Tüm Veri Eşit Değildir**

Tüm veriye eşit erişilmez.

En popüler menü fotoğraflarınız saniyede onlarca kez alınır. Üç yıl önceki günlüklerinize, eğer
hiç erişiliyorsa, belki yılda bir kez erişilir. S3 bunu tanır ve farklı performans ve maliyet
ödünleşimleriyle farklı **depolama sınıfları** sunar.

| Depolama Sınıfı          | Kullanım Senaryosu                              | Alma           | Maliyet                       |
|--------------------------|------------------------------------------------|----------------|-------------------------------|
| S3 Standard              | Sık erişilen veri                              | Anında         | GB başına daha yüksek         |
| S3 Standard-IA           | Seyrek erişim, hâlâ hızlı alma gerekir         | Anında         | GB başına daha düşük, alma ücreti |
| S3 Glacier Instant       | Ara sıra erişilen arşivler                     | Anında         | Çok daha düşük                |
| S3 Glacier Flexible      | Nadiren erişilen arşivler                      | Dakikalar-saatler | Çok düşük                  |
| S3 Glacier Deep Archive  | Uyumluluk arşivleri, neredeyse hiç erişilmez   | 12 saate kadar | En düşük                      |

Bunlara Bölüm 23'te derinlemesine giriyoruz. Şimdilik: kavram, nesneleri yaşlarına ve erişim
kalıplarına göre depolama sınıfları arasında otomatik olarak taşıyarak nadiren dokunduğunuz
veride önemli para tasarrufu yapabileceğinizdir.

Ayrıca **S3 Intelligent-Tiering** de var — gözlemlenen erişim kalıplarına göre nesneleri sık
erişim ve seyrek erişim katmanları arasında otomatik olarak taşıyan bir depolama sınıfı. Nesne
başına ayda küçük bir izleme ücreti ödersiniz ve S3 katmanlamayı otomatik olarak halleder. Bu,
hangi nesnelere sık erişileceğinden ve hangilerine erişilmeyeceğinden emin olmadığınızda
kullanışlıdır — hizmet kalıbı öğrenir ve buna göre optimize eder.

Tom'un yaklaşımı daha manueldi: "Her doların nereye gittiğini bilmek istiyorum." Açık yaşam
döngüsü kurallarını Intelligent-Tiering'e tercih etti, çünkü açık kurallar öngörülebilir ve
denetlenebilir. Nimbus'un S3 depolamasını altı ay işlettikten sonra, erişim kalıplarının net
bir resmine sahip oldu ve nesneleri 30 gün sonra Standard-IA'ya ve 180 gün sonra Glacier
Flexible Retrieval'a taşıyan yaşam döngüsü kuralları belirleyebildi.

İlk yılda yaşam döngüsü yönetiminden gelen toplam depolama tasarrufu: yaklaşık 340 dolar. Hayat
değiştirici değil, ama gerçek — ve kalıp, ciddi herhangi bir AWS hesabındaki onlarca kovada
tekrar eder.

"Bu neredeyse gidiş-dönüş bir uçuş," dedi Maya.

"İyi bir mühendislik uygulaması," dedi Tom. Onu elektronik tabloya koydu.

Depolama sınıfı seçiminde birçok ekibi yakalayan bir tuzak var: **minimum depolama süresi**. S3
Standard-IA'nın minimum 30 günlük depolama süresi vardır — bir nesneyi Standard-IA'da saklayıp
15 gün sonra silerseniz, yine 30 gün için ödersiniz. Glacier Flexible Retrieval'ın 90 günlük
minimumu vardır. Glacier Deep Archive'ın 180 günlük minimumu vardır.

Sık silinen ya da kısa ömürlü nesneler için, bu minimumlar IA ve Glacier sınıflarını
Standard'dan daha ucuz değil, daha pahalı hâle getirir. Daha ucuz bir depolama sınıfına
geçmeden önce, nesnelerin tasarrufların minimum süre cezalarını aşacak kadar orada gerçekten
yaşayacağını doğrulayın.

## Güçlü Yönler ve Sınırlamalar

**S3 neden mükemmel**:

- On bir dokuz dayanıklılık. Verileriniz S3'te neredeyse her başka sistemden daha güvende.
- Sınırsız ölçek. Depolamayı hiç tahsis etmeniz gerekmez — sadece büyür.
- Sağladığı şey için son derece ucuz (GB başına ayda bir kuruşun kesirleri).
- Neredeyse her diğer AWS hizmetiyle yerel entegrasyon.
- Statik web sitesi barındırmayı destekler — sunucu gerektirmeden eksiksiz bir statik web
  sitesini doğrudan S3'ten sunabilirsiniz.
- Olay güdümlü işleme: S3 Olay Bildirimleri, nesneler oluşturulduğunda ya da silindiğinde
  otomatik olarak Lambda, SQS ya da SNS'i tetikler; bu, yoklama ya da zamanlanmış işler olmadan
  güçlü işleme boru hatları sağlar.
- Uyumluluk veri ikameti ve felaket kurtarma için Bölgeler Arası Çoğaltma.

**S3'ün doğru seçim olmadığı yer**:

- S3 bir dosya sistemi değildir. Uygulamanızın bir sürücüyü bağlaması ve onu yerel bir disk gibi
  kullanması gerekiyorsa (dosyaları yerinde okumak, yazmak, değiştirmek), S3 yanlış araçtır.
  Bunun yerine EFS (Elastic File System, Bölüm 6) ya da EBS kullanın.
- S3'ün, yerel bir diskten gözle görülür biçimde daha yüksek gecikmesi vardır. Hızlı, rastgele
  erişimli G/Ç'ye ihtiyaç duyan veritabanları ya da uygulamalar için, blok depolama (EBS, Bölüm
  6) uygundur.
- S3'e veri aktarımı *içeri* bant genişliği ücretlerinden muaftır — ama tamamen ücretsiz değil:
  her yükleme bir PUT isteğidir ve S3 istek başına ücretlendirir. Milyonlarca küçük nesne
  yüklemek, depolamadan daha fazla istek ücretine mal olabilir. Veri aktarımı *dışarı* GB başına
  para tutar. İkisi de yaygın faturalandırma sürprizleridir — onları Bölüm 30'da ele alıyoruz.
- S3 bir veritabanı değildir. Nesneleri anahtara göre saklayıp alabilirsiniz, ama nesneleri
  içeriklerine göre sorgulayamaz, toplamalar çalıştıramaz ya da ilişkisel işlemler yapamazsınız.
  Saklanan verinin içeriğini sorgulamanız gerekiyorsa (sadece adına göre almak değil), bir
  veritabanına ya da S3 nesnelerini SQL kullanarak sorgulayabilen Athena (Bölüm 26) gibi bir
  hizmete ihtiyacınız var.
- Nesne sürüm oluşturma, biriken maliyetler depolar. Sürümlenmiş her nesnenin her önceki sürümü
  depolama olarak faturalandırılır. Eski sürümlerin süresini dolduran yaşam döngüsü kuralları
  isteğe bağlı değildir — sürüm oluşturma etkin herhangi bir kova için maliyet yönetimi
  stratejisinin bir parçasıdır.

**S3 Nesneleri Nasıl Şifrelenir**

"Peki ya biri içeri girmeye çalışırsa?" diye sordu Priya, tahmin edilebilir biçimde,
fotoğrafların yayına girdiği gün. "Bu nesneler bekleme hâlinde şifreli mi?"

Şifreliydiler — ve bunu anlamaya değer, çünkü S3 şifrelemesi sınavda en çok test edilen
konulardan biridir. S3'e yüklenen her nesne varsayılan olarak bekleme hâlinde şifrelenir. Soru,
*anahtarı kimin tuttuğu*dur:

**SSE-S3 (varsayılan)**: S3, her nesneyi AES-256 kullanarak, S3'ün kendisinin yönettiği
anahtarlarla şifreler. Hiçbir şey yapmazsınız, hiçbir şey yapılandırmazsınız, hiçbir şey
ödemezsiniz. Ocak 2023'ten bu yana, bu her kovada otomatiktir. Çoğu veri için yeterli.

**SSE-KMS**: S3, nesneleri bir KMS anahtarıyla şifreler — ya AWS tarafından yönetilen `aws/s3`
anahtarı ya da kontrol ettiğiniz müşteri tarafından yönetilen bir anahtar (Bölüm 16 KMS'i
derinlemesine ele alır). Kazandığınız: her anahtar kullanımının CloudTrail'de bir denetim izi,
anahtar politikası aracılığıyla kimin şifre çözebileceğini tam olarak kontrol etme yeteneği ve
anahtarı devre dışı bırakarak erişimi iptal etme yeteneği. Ödediğiniz: istek başına KMS API
ücretleri. Yüksek istek oranlarında, **S3 Bucket Keys**'i etkinleştirin — S3, KMS anahtarınızdan
kısa ömürlü bir kova düzeyinde anahtar türetir ve KMS API çağrılarını (ve maliyetini) %99'a
kadar keser.

**SSE-C**: Kendi şifreleme anahtarınızı *her istekle* sağlarsınız. AWS onu bellekte kullanır ve
asla saklamaz. Uyumluluk kuralları AWS'nin anahtarı asla tutmaması gerektiğini söyleyen
kuruluşlar için. Operasyonel olarak zorlayıcı — anahtarı kaybedin, veriyi kaybedin.

Sınav kalıbı: "anahtar kullanımının denetim iziyle şifreleme" ya da "kimin şifre çözebileceğini
kontrol et" → SSE-KMS. "Şirket kendi anahtarlarını yönetmeli ve AWS onları asla saklamamalı" →
SSE-C. "Yönetim yükü olmadan bekleme hâlinde şifreleme" → SSE-S3 (zaten açık).

**S3 Object Lock: Bir Kez Yaz, Çok Oku**

Bazı verilerin silinmesinin *imkânsız* olması gerekir — politikayla korunan değil, yapısal
olarak değişmez. Finansal işlem kayıtları, denetim günlükleri, yasal kanıtlar. **S3 Object
Lock**, nesneleri bir saklama süresi boyunca, yöneticiler tarafından bile silinemez ve
değiştirilemez kılar. Sürüm oluşturma gerektirir ve sınavın karşılaştırmayı sevdiği iki modda
gelir: **yönetişim modu (governance mode)** (özel bir izne sahip kullanıcılar yine de kilidi
atlayabilir) ve **uyumluluk modu (compliance mode)** (kimse saklamayı kısaltamaz ya da nesneyi
silemez — root kullanıcı bile — süre dolana kadar). "WORM depolama" ya da "SEC Kuralı 17a-4"
gibi düzenleyici ifadeler, uyumluluk modunda Object Lock için sınav tetikleyicileridir.

**S3 Transfer Acceleration: Uzaktan Hızlı Yüklemeler**

Kullanıcılar dünyanın diğer ucundan bir kovaya büyük dosyalar yüklediğinde, yavaş kısım kovanın
bölgesine giden uzun genel internet yoludur. **S3 Transfer Acceleration**, kovaya yüklemeleri
en yakın AWS kenar konumuna yönlendiren ve sonra onları AWS'nin özel omurgası üzerinden kovaya
taşıyan özel bir uç nokta verir. Sınav tetikleyicisi: "dünyanın dört bir yanındaki kullanıcılar
merkezi bir kovaya büyük dosyalar yüklüyor; yüklemeler yavaş" → Transfer Acceleration (genellikle
çok parçalı yüklemeyle eşleştirilir). Yönü not edin: Transfer Acceleration, veriyi S3'e *içeri*
almakla ilgilidir; CloudFront, veriyi *dışarı* sunmakla ilgilidir.

Şimdi bilmeye değer bir depolama sınıfı daha: **S3 One Zone-IA** — Standard-IA gibi ama tek bir
Erişilebilirlik Bölgesi'nde saklanan, yaklaşık %20 daha ucuz, o AZ kaybolursa yeniden
oluşturabileceğiniz seyrek erişilen veriler için (küçük resimler, yeniden oluşturulabilir
raporlar). Standart bir sınav şaşırtmacasıdır; Bölüm 23 tüm depolama sınıfı yelpazesini ele
alır.


## Özet

Tek bir örnekte sekiz yüz fotoğraf sorundu. S3 onu çözdü — ama S3, dosya saklayacak bir yerden
fazlasıdır. Kendi erişim modeli, depolama sınıfları, yaşam döngüsü politikaları ve olay sistemi
olan dayanıklı, ölçeklenebilir, küresel erişilebilir bir nesne deposudur. S3'ün neyde iyi
olduğunu ve neyde bilerek olmadığını anlamak, ekibin bundan sonra vereceği her depolama
kararını şekillendirir.

- **Amazon S3** nesne depolamadır — adlandırılmış kaplardaki (kovalar) dosyalar (nesneler). On
  bir dokuz dayanıklılık için kopyaları en az üç Erişilebilirlik Bölgesi genelinde saklar. S3
  bir dosya sistemi değildir: paylaşılan bağlamalar için EFS, tek örnekli blok depolama için
  EBS kullanın.
- EC2 örneklerinde saklanan dosyalar o örneğin yaşam döngüsüne bağlıdır; bu da trafik birden
  fazla sunucuya yayıldığında fotoğraf-eksik hatalarına neden olur. S3 bunu herhangi bir
  örnekten bağımsız olarak çözer.
- **Sürüm oluşturma**, önceki nesne sürümlerini korur. **Yaşam döngüsü kuralları**, depolama
  sınıfları arasındaki geçişleri otomatikleştirir ve aksi takdirde sessiz faturalandırma
  ücretleri biriktirecek tamamlanmamış çok parçalı yüklemeleri temizler.
- Varsayılan olarak, S3 özeldir. Hesap düzeyinde "Herkese Açık Erişimi Engelle"yi etkinleştirin.
  Kovaları doğrudan herkese açık yapmak yerine, herkese açık nesneleri Origin Access Control ile
  CloudFront üzerinden sunun.
- S3 depolama sınıfları, maliyeti erişim sıklığına eşlemenizi sağlar — ama kısa ömürlü nesneleri
  Seyrek Erişim ya da Glacier katmanlarına geçirmeden önce minimum depolama süresi ücretlerine
  dikkat edin.

## Sınav İpuçları

*SAA-C03 Alan 3 — Görev 3.1 (yüksek performanslı depolama çözümleri)*

- **S3 nesne depolamadır, blok depolama değil.** Bir sınav senaryosu birden fazla sunucunun
  bağlayabileceği bir dosya sistemine ihtiyaç duyduğunda, o EFS'tir. Tek bir EC2 örneği için bir
  disk gerektirdiğinde, o EBS'tir. Dosyaları, yedekleri, görselleri ya da HTTP üzerinden
  erişilen veriyi saklaması gerektiğinde — o S3'tür.
- **On bir dokuz dayanıklılık**, S3'ün veriyi otomatik olarak birden fazla AZ genelinde
  çoğalttığı anlamına gelir. Bunu yapılandırmazsınız — varsayılandır.
- **S3 Bölgeseldir**, ama küresel olarak erişilebilir. Kovalar belirli bir Bölge'de bulunur, ama
  onlara her yerden erişebilirsiniz.
- **Önceden imzalanmış URL'ler**, özel nesnelere süre sınırlı erişime izin verir. Yaygın kalıp:
  uygulamanız 15 dakika geçerli önceden imzalanmış bir URL oluşturur, onu kullanıcıya verir,
  kullanıcı dosyayı doğrudan S3'ten indirir.
- **S3 Standard-IA'nın** bir minimum depolama süresi ücreti vardır (30 gün). Onu hızla
  sileceğiniz veri için kullanmayın. Sınav, depolama sınıfları arasındaki ödünleşimleri bilip
  bilmediğinizi test eder.
- **Depolama sınıfı karar ağacı**: *sık erişilen* → S3 Standard; *seyrek erişilen ama hızlı alma
  gerekir* → S3 Standard-IA; *ara sıra erişilen arşiv* → S3 Glacier Instant Retrieval; *nadiren
  erişilen arşiv* → S3 Glacier Flexible Retrieval; *uyumluluk arşivi, neredeyse hiç erişilmez* →
  S3 Glacier Deep Archive.
- **Bölgeler Arası Çoğaltma**, hem kaynak hem hedef kovalarda sürüm oluşturmanın etkin olmasını
  gerektirir. Felaket kurtarma ya da veri egemenliği hakkındaki sınav soruları çoğu zaman CRR'yi
  içerir.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizle: Bir S3 nesnesi nedir? Bir S3 kovası nedir? Dosyaları S3'te saklamak neden
bir EC2 örneğinin yerel diskinde saklamaktan daha iyidir?

*(İpucu: Örnek sonlandırılırsa bir EC2 örneğindeki dosyalara ne olacağını düşünün. S3 farklı
olarak ne yapar?)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir medya şirketi belgesel videoları üretiyor. Orijinal 4K görüntüleri (üretim
sırasında sık erişilen), düzenlenmiş nihai kesimleri (dağıtım için aylık erişilen) ve arşiv
ana kopyalarını (süresiz tutulan ama uyumluluk amacıyla en fazla yılda bir erişilen) saklamaları
gerekiyor. Her katmanın erişim gereksinimlerini karşılarken depolama maliyetlerini en aza
indirmek istiyorlar.

Hangi depolama stratejisi gereksinimlerini EN İYİ şekilde karşılar?

A) Orijinal görüntüleri S3 Standard'da, nihai kesimleri S3 Standard-IA'da ve arşivleri S3
   Glacier Deep Archive'da saklayın  
B) Tutarlı performans ve basitlik için tüm içeriği S3 Standard'da saklayın  
C) En hızlı erişim için tüm içeriği EC2 örnek depolamasında saklayın  
D) Maliyetleri en aza indirmek için tüm içeriği S3 Glacier Deep Archive'da saklayın

**İpucu 1**: Farklı dosyaların farklı erişim kalıpları vardır. S3, farklı erişim sıklıkları için
farklı depolama sınıfları sunar. Hangi sınıf "sık erişilen" ile eşleşir?

**İpucu 2**: "En fazla yılda bir" erişilen arşivlerin anında almaya ihtiyacı yoktur. Hangi
depolama sınıfı minimum maliyetle uzun vadeli arşivleme için tasarlanmıştır?

**İpucu 3**: Her katmanın erişim sıklığını uygun depolama sınıfına eşleyin. Sık erişilen =
Standard. Aylık = Standard-IA. Yılda bir = Glacier Deep Archive.

**Cevap**: A

**Açıklama**: Bu strateji, her veri katmanını uygun S3 depolama sınıfına doğru biçimde eşler.
Sık erişilen orijinal görüntüler, alma ücreti olmadan anında erişim için Standard'da kalır.
Aylık erişilen nihai kesimler Standard-IA'ya gider (daha düşük depolama maliyeti, makul alma
ücreti). Yılda bir erişilen arşivler, mümkün olan en düşük depolama maliyeti için Glacier Deep
Archive'a gider.

**Neden B değil?** Her şeyi Standard'da saklamak basittir ama pahalıdır.

**Neden C değil?** EC2 örnek depolaması geçicidir ve uzun vadeli medya depolama için uygun
değildir. Örnek sonlandırılırsa, tüm içerik kaybolur.

**Neden D değil?** Glacier Deep Archive'ın alma süreleri 12 saate kadar çıkar. Sık erişilen
üretim görüntülerini orada saklamak üretim işini imkânsız hâle getirir.

*SAA-C03 Alan 3 — Görev 3.1 / Alan 4 — Görev 4.1*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus, müşteri tarafından yüklenen sipariş fotoğraflarını S3'te saklıyor. Bir veri koruma
düzenlemesi, müşteri fotoğraflarının 7 yıl saklanması ama ondan sonra silinebilmesi gerektiğini
şart koşuyor. Ekip ayrıca önceki yıllardan eski fotoğrafları saklamanın maliyetini en aza
indirmek istiyor.

Bu gereksinim için bir S3 depolama stratejisi tasarlayın. Hangi depolama sınıflarını
kullanırdınız ve aralarında ne zaman geçiş yapardınız? Silme gereksinimi konusunda ne
yapardınız?

*(İpucu: Yaşam döngüsü politikalarını düşünün. Tek bir doğru cevap yoktur — maliyete karşı alma
süresi ödünleşimlerini akıl yürüterek çözün.)*

## Jenerik Sonrası Sahne

Leo o öğleden sonra menü fotoğraflarını S3'e taşıdı. Sekiz yüz nesne, üç Erişilebilirlik
Bölgesi genelinde güvenle saklandı, sürüm oluşturma etkinleştirildi.

"Şimdi aslında öncekinden daha güvendeler," dedi, biraz tatminle.

"S3'te her zaman daha güvendeydiler," dedi Priya. "Sadece sorunu kurana kadar düzeltmeyi
bekledik."

Leo bunu kabul etti.

Ertesi sabah Tom bir çıktıyla geldi. AWS faturası, kırmızı kalemle açıklamalar eklenmiş.

"Bir veritabanı sorunumuz var," dedi. "Sipariş veritabanımızı web sunucusuyla aynı EC2
örneğinde çalıştırıyoruz. Ve menü veritabanımızı. Ve müşteri kayıtlarımızı."

Durdu.

"Her şey aynı makinede. Tek bir makine. Tüm verimiz."

Maya çıktıya baktı. Sonra Tom'a. Sonra tavana.

"Peki ya o makine bozulursa?"

Tom kırmızı kalem açıklamasını işaret etti.

Bir sonraki bölümde: kiraladığınız bir sabit disk ile tüm ofisin paylaştığı bir dosya dolabı
arasındaki fark.
