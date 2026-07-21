# Bölüm 6: Peşinden Gelen Disk

Tom'un kırmızı bir kalemi ve Leo'yu tedirgin eden bir alışkanlığı vardı.

Her cumartesi sabahı, bir kahveyle oturur ve bir şey yazdırırdı. E-posta değil. Rapor değil.
Nimbus'un neler çalıştırdığının listesini yazdırır ve onu bir defter gibi, satır satır, elinde
kalemle okurdu. Bunu ikinci haftadan beri yapıyordu. Yazıcının ısınma sesi hafta sonunun bir
parçası olmuştu.

Leo buna "Tom'un yaptığı ve Leo'ya bir şeyi yanlış yapmış gibi hissettiren şey" diyordu.

O cumartesi, Tom bir şeyi daire içine aldı ve çıktıyı tek kelime etmeden Maya'nın masasına
bıraktı.

Maya onu pazartesi sabahı buldu. Bir daire. Kenarda bir not, üç kelime:

*Her şey. Tek makine.*

Fotoğraflar artık S3'te güvendeydi — o sorun çözülmüştü. Ama veritabanı hâlâ web sunucusuyla
aynı EC2 örneğindeydi. Sipariş geçmişi, müşteri kayıtları, iki aylık işlemler. Uygulama ve
altındaki her şey, tek bir sanal diski paylaşıyordu.

"Örnek çökerse veritabanına ne olur?" diye sordu Maya, çıktı elinde.

"O da çöker," dedi Leo.

"Peki ya veri?"

"Veritabanının onu nasıl sakladığına bağlı."

O "bağlı" sorunun ta kendisiydi.

**EC2 Örnekleri Veriyi Nasıl Saklar**

Bir EC2 örneği çalıştığında, işletim sistemi bir diskte bir yerde yaşar. O diske **root
birimi** denir. Varsayılan olarak, bu bir **EBS birimidir** — siz bunu düşünmeseniz bile.

Ama başka bir şey daha var: EC2 örneklerinin ayrıca **örnek deposu (instance store)**
depolaması da vardır.

Örnek deposu, sanal makinenizi çalıştıran altta yatan donanıma fiziksel olarak bağlı geçici
depolamadır. Son derece hızlıdır — AWS'deki neredeyse her başka depolama seçeneğinden daha
hızlı. Ama bir bedeli var.

Örnek deposu **geçicidir (ephemeral)**.

Örnek durduğunda ya da sonlandırıldığında, örnek deposu verisi gitmiştir. Kalıcı olarak. Geri
alınamaz. AWS sizi bu konuda pek yüksek sesle uyarmaz; ekipler bunu böyle keşfeder: veri
kaybederek.

Örnek deposu, önbellekler, geçici işleme dosyaları ve karalama alanı için uygundur. Önemsediğiniz
veri için asla.

**EBS: Kalıcı Disk**

EC2 örneğinize takabileceğiniz bir harici sabit disk hayal edin — çıkardığınızda kaybolmayan ve
gerekirse farklı bir makineye taşıyabileceğiniz biri. AWS buna **EBS**: Elastic Block Store
der.

EBS, EC2 örnekleri için kalıcı blok depolamadır.

Blok depolama, gerçek bir sabit disk gibi davranması demektir: işletim sisteminiz üzerinde dosya
sistemleri oluşturabilir, rastgele konumlarda rastgele baytları okuyup yazabilir, üzerinde
veritabanları çalıştırabilir ve onu tam olarak takılı bir disk gibi ele alabilir.

Temel özellikler:

**Kalıcı.** Örnek deposunun aksine, EBS birimleri örnek durdurmalarından, başlatmalarından ve
hatta örnek sonlandırılmasından (yapılandırmaya bağlı olarak) sağ çıkar. Veri, hiçbir örnek onu
kullanmasa bile birimde kalır.

Burada bir yapılandırma inceliği var: bir EC2 örneği oluşturduğunuzda, root biriminin
"Sonlandırmada Sil" (Delete on Termination) adlı bir ayarı vardır. Varsayılan olarak bu true'ya
ayarlanır — örnek sonlandırıldığında root birimi silinir. Eklediğiniz ek veri birimleri için,
varsayılan false'tur — örnek sonlandırıldıktan sonra kalıcı olurlar. Her iki ayarı da
değiştirebilirsiniz. Root biriminin örnek sonlandırılmasından sağ çıkmasını istiyorsanız (adli
analiz ya da veri kurtarma için), "Sonlandırmada Sil"i devre dışı bırakın. Veri birimlerinin
otomatik olarak temizlenmesini istiyorsanız, etkinleştirin.

**Takılabilir ve çıkarılabilir.** Bir EBS birimi bir örnekten çıkarılıp başka birine
takılabilir. Veri taşımanız ya da arızalı bir örnekten kurtulmanız gerekiyorsa, birimi çıkarıp
başka bir yere yeniden takabilirsiniz.

Çıkar-ve-yeniden-tak iş akışı, bir anlık görüntü geri yüklemesinden daha yavaştır ama birimin
tam durumunu korur — tüm işlenmemiş yazmalar, tüm önbelleğe alınmış veri, tam dosya sistemi
durumu. Bu, onu adli analiz (orijinal sistemi önyüklemeden birimi bir analiz örneğine takmak)
ve veri taşıma (anlık görüntü almadan bir veritabanı birimini daha büyük bir örneğe taşımak)
için yararlı kılar.

**Tek bağlantı (çoğunlukla).** Varsayılan olarak, bir EBS birimi her seferinde tam olarak bir
EC2 örneğine takılır. Tek bir örneğin birden fazla EBS birimi olabilir, ama tek bir EBS birimi
birden fazla örnek tarafından aynı anda bağlanamaz (tek istisnayla: sınırlı kullanım senaryoları
ve önemli kısıtlamaları olan EBS Multi-Attach).

EBS Multi-Attach, io1/io2 (Provisioned IOPS) birimlerinin aynı AZ'de birden fazla örneğe aynı
anda takılmasına izin verir. Bu, "paylaşılan depolama" sorununu çözüyormuş gibi geliyor, ama
ciddi kısıtlamalarla geliyor: takılı örneklerdeki uygulamaların eşzamanlı erişimi koordine
edebilmesi gerekir — paylaşılan dosya sistemi anlambilimi (kilit yönetimi, yazma sıralaması)
EBS tarafından sağlanmaz. Pratikte, EBS Multi-Attach, koordinasyonu kendisi yapan kümeli
veritabanı uygulamaları için kullanılır. Genel paylaşılan dosya erişimi için, EFS daha basit ve
daha uygundur.

EBS benzetmesi: tek bir dizüstü bilgisayara takılı harici bir sabit disk. Dizüstü bilgisayar
(EC2 örneği) ona okuyup yazabilir. İşiniz bittiğinde, onu çıkarıp farklı bir dizüstü
bilgisayara takabilirsiniz.

**EBS Birim Türleri**

Tüm EBS birimleri aynı değildir. AWS, farklı performans ve maliyet profilleriyle çeşitli türler
sunar.

**gp3 (Genel Amaçlı SSD)**: Çoğu iş yükü için varsayılan seçim. Performans ve fiyatın iyi
dengesi. Önyükleme birimleri, küçük veritabanları ve geliştirme ortamları için uygun.

gp3 varsayılan olmadan önce **gp2** vardı — ve onunla doğada hâlâ karşılaşacaksınız. gp2
birimleri IOPS performansını doğrudan birim boyutuna bağlar: gigabayt başına 3 IOPS, maksimum
16.000 IOPS'a kadar (ki bu 5.334 GB'lık bir birim gerektirir). Verim 250 MB/s ile sınırlıdır.
Bu bağlantı, gp2'de daha fazla IOPS almanın tek yolunun, fazladan alana ihtiyacınız olmasa bile
birimi büyütmek olduğu anlamına gelir. gp3 bu bağımlılığı kırdı: boyuttan bağımsız olarak 3.000
IOPS ve 125 MB/s ile başlar ve IOPS ile verimi daha düşük maliyetle bağımsız olarak
yapılandırmanıza izin verir. AWS yeni birimler için gp3'ü önerir, ama mevcut birçok iş yükü hâlâ
gp2'de çalıştığından, ikisini de bilmeniz gerekir.

**io2 (Provisioned IOPS SSD)**: G/Ç yoğun iş yükleri için yüksek performanslı seçenek. Saniyede
kaç G/Ç işlemine (IOPS) ihtiyacınız olduğunu belirtirsiniz ve AWS o performansı garanti eder.
Büyük üretim veritabanları için uygun.

**st1 (Verim Optimize HDD)**: Büyük sıralı okuma ve yazmalar için optimize edilmiş manyetik
depolama. SSD'den daha düşük maliyet, ama rastgele G/Ç için daha yavaş. Veri ambarlama ve günlük
işleme için iyi.

**sc1 (Soğuk HDD)**: En ucuz EBS seçeneği. Seyrek erişilen veri için. Zamana duyarlı hiçbir şey
için uygun değil.

"io2, gp3'e kıyasla ne kadar daha pahalı?" diye sordu Tom, defterinden başını kaldırarak.

Leo fiyatlandırma sayfasını açtı. io2, gp3'e kıyasla GB başına yaklaşık %50–60 daha pahalıydı; buna ek olarak tahsis edilen IOPS başına ayrı bir ücret de vardı — ve yüksek performanslı bir birimdeki IOPS başına bu ücretler faturaya hâkim olan kalemdir. Tom farkı not etti. "Yani veritabanı performans garantisine gerçekten ihtiyaç duyana kadar gp3 kullanırız."

Sınav tüm türleri ezberlemenizi gerektirmez. Gereksinimleri doğru türle eşleştirme yeteneğinizi
test eder: IOPS gereksinimleri → io2. Maliyet duyarlı sıralı iş yükleri → st1. Genel web
uygulamaları → gp3.

**IOPS ve Verim: Ayrım Neden Önemli**

Tom EBS birim sorusuna ertesi salı, CloudWatch'ı kontrol ettikten sonra geri döndü.

"EBS panosunda iki metrik görüyorum," dedi. "IOPS ve verim. Bunlar farklı şeyler mi?"

Öyleler.

**IOPS** (Saniye Başına Giriş/Çıkış İşlemleri), diskin saniyede kaç okuma ya da yazma işlemini
kaldırabileceğini ölçer. Her işlem tipik olarak küçüktür — 4 KB ile 256 KB. Yüksek IOPS, birçok
küçük, rastgele okuma ve yazma yapan veritabanları için önemlidir: tek tek satırları getirmek,
kayıtları güncellemek, eşzamanlı sorguları işlemek.

**Verim** (MB/s cinsinden ölçülür), saniyede ne kadar veri hareket ettiğini ölçer. Yüksek
verim, sıralı iş yükleri için önemlidir: büyük günlük dosyalarını okumak, akış analitiği, büyük
veri kümelerini yüklemek.

Bir veritabanı tipik olarak yüksek IOPS ve düşük-orta verime ihtiyaç duyar. Büyük tabloları
tarayan bir veri ambarı yüksek verime ihtiyaç duyar ve orta IOPS ile yaşayabilir.

Tom, Nimbus veritabanının CloudWatch metriklerini izliyordu. IOPS akşam yemeği yoğunluğu
sırasında ani yükseliyordu — uygulama menü öğelerini ve sipariş verilerini getirirken kısa,
rastgele okumalar. Verim düşüktü. Kalıp, daha iyi verime değil, daha iyi IOPS'a ihtiyaç duyan
bir veritabanı iş yüküyle eşleşiyordu.

"Yani veritabanı yavaşlarsa," dedi Tom, "birimi yükseltmeden önce IOPS sınırlı mı verim sınırlı
mı olduğunu kontrol ederiz?"

"Doğru," dedi Priya. "gp3'ten io2'ye yükseltmek bir maliyetle IOPS ekler. Sorun verimse, o
yükseltme yardımcı olmaz. Önce metriği kontrol et."

Yanlış sorunu çözen pahalı depolama yükseltmelerinden tam olarak böyle kaçınırsınız.

**EBS Anlık Görüntüleri: Yedek**

İşte şirketleri düzenli olarak kurtaran bir şey.

Bir **EBS anlık görüntüsü (snapshot)**, bir EBS biriminin S3'te saklanan zaman noktası
yedeğidir (gerçi ona doğrudan S3 üzerinden değil, EBS arabirimi üzerinden erişirsiniz). Anlık
görüntüler artımlıdır: ilk anlık görüntü tüm birimi yakalar; sonraki anlık görüntüler yalnızca
bir öncekinden bu yana değişeni saklar.

Bir anlık görüntüden yeni bir EBS birimi oluşturabilirsiniz — bir veritabanı bozulması, kötü bir
dağıtım ya da kazara silme öncesindeki bir zaman noktasına geri yükleyerek.

Anlık görüntüleri otomatikleştirmelisiniz. AWS bu amaçla **Amazon Data Lifecycle Manager**
sağlar: bir politika tanımlayın (her 6 saatte bir anlık görüntü al, son 7 günü sakla) ve
otomatik olarak çalışır.

Priya, veritabanı daha üretime girmeden önce bunu kurmuştu.

Leo bunu düşünmemişti.

"Anlık görüntü işi sessizce başarısız olursa ne olacağını düşündük mü?" diye sordu Priya.
"Politika çalışıyor ama anlık görüntüler aslında geçerli değilse?"

O öğleden sonra geri yükleme sürecini test ettiler.

Priya'nın Nimbus üretim veritabanı için tam anlık görüntü yedekleme politikası, onu düzgünce
belgeleyecek vakti olunca:

- **Günlük anlık görüntüler**, 7 gün saklanır. Bunlar normal kurtarma senaryosunu kapsar: kötü
  bir dağıtım, kazara silme, bir hafta içinde keşfedilen bir bozulma olayı.
- **Haftalık anlık görüntüler** (her pazar sabahın ikisinde alınır), 30 gün saklanır. Bunlar,
  bir sorunun hemen tespit edilmediği senaryoyu kapsar — yalnızca haftalar sonra fark edilen
  ince bir veri bozulması.
- Haftada bir kez `us-east-1`'e bölgeler arası anlık görüntü kopyası, 30 gün saklanır. Bunlar,
  tüm `us-west-2` Bölgesi'nin kullanılamadığı ve Nimbus'un veritabanını başka bir yerde yeniden
  oluşturması gereken senaryoyu kapsar.

"Bu çok fazla anlık görüntü gibi görünüyor," dedi Leo.

"İlkten sonraki her artımlı anlık görüntü küçüktür," dedi Priya. "Yalnızca değişeni
saklıyorsun. Toplam depolama maliyeti mütevazıdır."

Tom çoktan fiyata bakmıştı. 50 GB'lık bir veritabanının 7 gün tutulan günlük anlık görüntüleri,
artı 30 gün saklanan haftalık anlık görüntüler — ayda yaklaşık 3 ila 5 dolar. Veritabanı bir
gün bozulursa, bunlara sahip olmamanın maliyeti ölçülemeyecek kadar yüksekti.

"Peki ya Fast Snapshot Restore?" diye sordu Leo. "Ayarlara bakarken o seçeneği gördüm."

**Fast Snapshot Restore** (FSR), geri yüklenen bir anlık görüntüyü ilk kez kullandığınızda
normalde oluşan G/Ç performans cezasını ortadan kaldıran bir EBS özelliğidir. FSR olmadan,
yeni geri yüklenen bir EBS birimi, veri S3'ten tembel biçimde yüklendikçe ilk birkaç dakika ya
da saat boyunca kötü performans gösterir — okumalar, henüz birime çekilmemiş veri için S3'e
gider. Belirli bir AZ'de bir anlık görüntüde FSR etkinleştirildiğinde, geri yüklenen birim
tam performans için anında hazırdır.

FSR ekstra ücretlidir — FSR'nin etkin olduğu anlık görüntü başına AZ başına saat başına
ödersiniz. Nimbus'un felaket kurtarma anlık görüntüleri için, ara sıra kullanım sürekli FSR
maliyetini haklı çıkarmıyordu. Acil durumda dakikalar içinde geri yüklenip işler hâle gelmesi
gereken bir üretim veritabanı anlık görüntüsü için, FSR buna değerdi.

"FSR'yi felaket kurtarma için gerçekten kullanacağımız haftalık anlık görüntüde etkinleştir,"
dedi Priya. "Saklama penceresindeki her günlük anlık görüntüde etkinleştirme."

Tom maliyet hesabını elektronik tablosuna ekledi.

**Felaket Kurtarma için Bölgeler Arası Anlık Görüntü Kopyası**

EBS anlık görüntüleri, oluşturuldukları Bölge'de yaşar. Tüm `us-west-2` Bölgesi çökerse,
`us-west-2`'deki anlık görüntülerinize erişilemez.

Çözüm: **bölgeler arası anlık görüntü kopyası**. Bir EBS anlık görüntüsünü başka bir Bölge'ye
kopyalayabilir, böylece birincil Bölge'niz kullanılamasa bile kullanılabilir bir yedeğe sahip
olabilirsiniz.

AWS Data Lifecycle Manager, bir anlık görüntü politikasının parçası olarak otomatik bölgeler
arası kopyayı destekler: `us-west-2`'de günlük bir anlık görüntü al, onu haftada bir
`us-east-1`'e otomatik olarak kopyala. Felaket olursa, `us-east-1`'de yeni bir EC2 örneği
başlatın, bölgeler arası anlık görüntüden geri yükleyin, DNS uç noktasını güncelleyin ve işlere
devam edin.

"Bu, veritabanı için felaket kurtarma planımız," dedi Priya, politika dokümantasyonunu ekibe
sunarak. "Tam bir çok-bölge mimarisi değil — bu şu anda ihtiyacımızdan fazla karmaşıklık. Ama
`us-west-2` tamamen çökerse, iki saat içinde `us-east-1`'de geri yükleyebiliriz."

"İki saat kesinti süresi," dedi Tom.

"Sonsuz kesinti süresine karşı," dedi Priya.

Tom ayrımı kabul etti.

**EBS Şifreleme: Neden Yerinde Şifreleyemeyeceğinizin Hikâyesi**

Nimbus üretim veritabanı altı haftadır çalışıyordu, Priya bir şeyi işaretlediğinde.

"EBS birimi şifreli değil," dedi.

"Onu şifreleyebilir miyiz?" diye sordu Leo.

"Evet. Ama yerinde değil."

İşte EBS şifrelemesiyle ilgili olay: mevcut, şifrelenmemiş bir EBS birimini doğrudan
şifreleyemezsiniz. Veri zaten düz metin olarak yazılmıştır. Onu şifrelemek için şunları
yapmalısınız:

1. Şifrelenmemiş birimin bir anlık görüntüsünü oluşturun
2. Anlık görüntüyü kopyalayın, kopyada şifrelemeyi etkinleştirin
3. Şifreli anlık görüntüden yeni bir şifreli EBS birimi oluşturun
4. Örneği durdurun
5. Eski şifrelenmemiş birimi çıkarın
6. Yeni şifreli birimi takın
7. Örneği başlatın ve her şeyin çalıştığını doğrulayın

Bu sürecin bir kesinti penceresi vardır — durdur, çıkar, tak, başlat dizisi. Küçük bir
veritabanı olan Nimbus için, pencere yaklaşık on beş dakikaydı. Yüzlerce GB'lık büyük bir üretim
veritabanı için, anlık görüntü ve kopyalama süreci daha uzun sürebilir, gerçi gerçek örnek
kesinti süresi yine sadece durdur/başlat döngüsüdür.

"Neden sadece bir düğmeye basamıyoruz?" diye sordu Leo.

"Çünkü diskteki mevcut veri şifrelenmemiş baytlardır," dedi Priya. "AWS onları her bloğu okuyup
yeniden yazmadan yeniden şifreleyemez — ki anlık görüntü kopyalama sürecinin yaptığı tam olarak
budur. Kaynak anlık görüntüdeki her bloğu okur, her birini şifreler ve yeni anlık görüntüye
yazar."

Leo süreci adım adım yürüttü. Yeni şifreli birim takıldı. Örnek tekrar çevrimiçi oldu.
Veritabanı şifreli bir birimde çalışıyordu.

"Yeni EBS birimleri varsayılan olarak şifreli oluşturulabilir," dedi Priya. "Hesap düzeyinde bir
ayar var. Her yeni birim otomatik olarak şifrelenir. Bunu birinci gün etkinleştirmeliydik."

Etkinleştirdi. O noktadan itibaren, Nimbus AWS hesabında oluşturulan her EBS birimi varsayılan
olarak şifreliydi — ekstra adım gerekmeden.

**EFS: Paylaşılan Dosya Dolabı**

EBS, tek bir örneğe takılı bir disktir. Ya birden fazla örneğin aynı dosyalara aynı anda
erişmesi gerekiyorsa?

İhtiyacınız olan, bir ofisin ortasındaki dosya dolabı gibi bir şeydir — herkes yanına
gidebilir, bir dosya çekebilir, geri koyabilir ve bir sonraki kişi değişikliği anında görür.
Birden fazla kişi, aynı anda, aynı depolamaya erişir.

AWS buna **EFS**: Elastic File System der.

EFS, yönetilen bir ağ dosya sistemidir. Birden fazla EC2 örneği aynı EFS dosya sistemini aynı
anda bağlayabilir ve paylaşılan dosyalara okuyup yazabilir. Bu, EBS'nin sağlamadığı temel
yetenektir.

Açıkça söylemek gerekirse:

EBS, tek bir dizüstü bilgisayara takılı harici bir sabit disktir. Her seferinde yalnızca o
dizüstü onu kullanabilir.

EFS, ofisin ortasındaki dosya dolabıdır. Herhangi bir ekip üyesi yanına gidebilir, bir çekmece
açabilir, bir dosya okuyabilir, bir şey geri koyabilir.

**EFS'ye ne zaman ihtiyacınız olur?**

- Birden fazla EC2 örneğinin dosyaları paylaşması gerektiğinde — içerik yönetim sistemleri,
  paylaşılan yapılandırma dosyaları, paylaşılan medya kitaplıkları
- Tüm örneklerin aynı veriye erişmesi gereken yatay ölçeklenmiş bir uygulamanız olduğunda
- Örnek arızalarından sağ çıkan kalıcı bir dosya sistemine ihtiyaç duyduğunuzda

EFS'ye NFS protokolü (özellikle NFSv4) kullanılarak ağ üzerinden erişilir. EFS bağlama hedefine
ağ bağlantısı olan herhangi bir EC2 örneği onu bağlayabilir — aynı Bölge içindeki farklı
AZ'lerdeki örnekler dâhil. Her AZ'de bağlama hedefleri yapılandırırsınız ve örnekler en uygun
performans için en yakın bağlama hedefine bağlanır.

Pratik sonuç: EFS, kutudan çıktığı gibi AZ'ler arasında çalışır. `us-west-2a` ve `us-west-2b`'de
ikisi de aynı EFS dosya sistemini bağlayan web sunucularınız varsa, `2a`'daki bir sunucu
tarafından yazılan bir dosya `2b`'deki bir sunucuya anında görünür. Bu, EBS'nin sağlayamadığı
paylaşılan dosya sistemi davranışıdır.

**EFS Performans Modları**

EFS'nin boyutlandırma için önemli iki verim modu vardır:

**Elastik Verim (Elastic Throughput)** (çoğu yeni dosya sistemi için varsayılan): EFS, gerçek
kullanıma göre verimi otomatik olarak yukarı ve aşağı ölçekler. Bir verim seviyesi tahsis
etmezsiniz. Kullandığınız kadar ödersiniz. Bu, verim ihtiyaçlarının dalgalandığı değişken iş
yükleri için doğru moddur — pazartesi sabahı trafiğinin cuma akşamı trafiğinden farklı olduğu
Nimbus gibi.

**Tahsis Edilmiş Verim (Provisioned Throughput)**: Saklanan veriden bağımsız olarak verim
seviyesini belirtirsiniz. İş yükünüz, saklanan veri hacminin Elastik modda sağlayacağını aşan
sürekli yüksek verime ihtiyaç duyduğunda kullanışlıdır. Ne kadar saklandığından bağımsız olarak
dakikada onlarca gigabayt okuyan bir derleme sistemi çalıştırıyorsanız, Tahsis Edilmiş Verim
uygundur.

Üçüncü bir mod daha var, **Patlamalı Verim (Bursting Throughput)**, ki bu orijinal EFS
davranışıdır ve Elastik kullanıma sunulmadan önce oluşturulan dosya sistemleri için hâlâ
varsayılandır. Patlamalı modda, verim ne kadar veri sakladığınızla ölçeklenir: GB başına 50
KB/s'lik bir taban çizgisi alırsınız, artı taban çizgisinin altındayken biriken ve daha yüksek
verime ihtiyacınız olduğunda harcanabilen patlama kredileri (daha küçük dosya sistemleri için
100 MB/s'ye kadar, ya da daha büyükleri için taban çizgisinin bir katına kadar). Dosya
sisteminin anlamlı patlama kredileri kazanacak kadar büyük olduğu, öngörülemeyen ya da ani
erişim kalıpları olan iş yükleri için doğru seçimdir. Dosya sisteminiz küçük ve erişim kalıbınız
aniyse, kredilerinizi hızlıca tüketebilirsiniz — nerede durduğunuzu bilmek için
`BurstCreditBalance` CloudWatch metriğini izleyin.

Tom'un sorusu hemen geldi: "Elastik daha mı pahalı?"

"Kullanım kalıbına bağlı," dedi Leo. "Elastik ile, gerçekten tükettiğin verim için ödersin.
Tahsis Edilmiş ile, kullanmasan bile belirttiğin verim için ödersin."

"Yani değişken iş yükleri için, Elastik genellikle daha ucuz," dedi Tom.

"Genellikle," dedi Priya. "Karar vermeden önce CloudWatch'ta gerçek verim kalıplarını kontrol
et."

EFS'nin ayrıca iki performans modu vardır: **Genel Amaçlı (General Purpose)** (düşük gecikme,
çoğu iş yükü için uygun, varsayılan) ve **Max I/O** (biraz daha yüksek gecikme pahasına yüksek
düzeyde paralelleştirilmiş iş yükleri için daha yüksek verim). Genel Amaçlı, kullanım
senaryolarının büyük çoğunluğunu kaldırır. Max I/O, binlerce eşzamanlı dosya sistemi işlemi
yapması gereken uygulamalar için tasarlanmıştı — büyük ölçekli medya işleme boru hatları, birçok
paralel okuyuculu bilimsel hesaplama iş akışları.

**EFS ve S3:** EFS bir dosya sistemidir (klasörler, dosyalar, izinler, kilitleme). S3 nesne
depolamadır (yükle, indir, dosya sistemi anlambilimi yok). EFS, S3'ten çok daha pahalıdır — EFS
Standard için GB başına ayda kabaca 0,30 dolara karşı S3 Standard için GB başına ayda 0,023
dolar. Bütün olarak saklanan ve alınan dosyalar için S3 kullanın. Uygulamaların standart dosya
sistemi işlemleri aracılığıyla aktif olarak okuyup yazdığı dosyalar için EFS kullanın.

**EBS Varsa Tek Örnek, Ama EFS Varsa Çoğu**

EBS/EFS kararı tek bir soruya iner: bu depolamaya aynı anda kaç örneğin erişmesi gerekir?

EBS üzerinde yatay ölçeklenmiş bir uygulama kurarsanız, her örneğin kendi diski olur — ama bir
kullanıcı A örneğine bir dosya yüklediğinde, B örneği onu göremez. Bu, veritabanları için sorun
değil (her DB'nin kendi diski var), ama paylaşılan içerik için bozuk. Paylaşılan erişime
ihtiyacınız varsa, cevap EFS'tir — ama EFS, S3'ten GB başına daha pahalıdır ve rastgele G/Ç için
EBS'den daha yüksek gecikmeye sahiptir. Doğru seçim tamamen uygulamanızın veriyle ne yaptığına
bağlıdır.

**Doğru Depolamayı Seçmek**

Şimdiye kadar AWS'de üç tür depolama gördünüz. Kararı netleştirelim.

| İhtiyaç                                  | Depolama Türü    |
|------------------------------------------|------------------|
| Veritabanı kalıcı, hızlı disk gerektirir | EBS (gp3 ya da io2) |
| Birden fazla sunucu paylaşılan dosya gerektirir | EFS         |
| Dosyalar, yedekler, görseller, büyük nesneler | S3          |
| Geçici hesaplama karalama alanı          | Örnek Deposu     |
| Minimum maliyetle uzun vadeli arşivler   | S3 Glacier       |

Şunu merak ediyor olabilirsiniz: EFS birden fazla örneğin dosya paylaşmasına izin veriyorsa,
neden onu her şey için kullanmıyoruz? Çünkü EFS, S3'ten GB başına önemli ölçüde daha pahalıdır
ve rastgele G/Ç için yerel EBS'den daha yüksek gecikmeye sahiptir. Paylaşılan dosya sistemi
erişimi için doğru araçtır — genel dosya depolama ya da veritabanı depolama için değil.

Bu kararı doğru yapmak önemlidir. EFS'ye ihtiyaç duyduğunuz yerde S3 kullanmak operasyonel
karmaşıklık ekler. EFS'ye ihtiyaç duyduğunuz yerde EBS kullanmak, ölçeklediğinizde arızalara
neden olur. Kalıcılığa ihtiyaç duyduğunuz yerde örnek deposu kullanmak veri kaybeder.

Priya bu tabloyu yazdırdı ve duvara yapıştırdı.

"Ne zaman bir depolama gereksinimi eklesek," dedi, "buradan başlarız."

Kararı somutlaştırmak için birkaç gerçek senaryoyu inceleyelim:

**Senaryo A**: Bir makine öğrenimi eğitim işi bir GPU EC2 örneğinde çalışıyor ve 200 GB'lık bir
veri kümesini okuması gerekiyor. İş günde bir kez çalışıyor ve iki saat sürüyor. Veri kümesi
birden fazla araştırma ekibi tarafından paylaşılıyor.

Karar: S3. Veri kümesi büyük, iş başına bir kez okunur ve paylaşılır. S3 ucuz, dayanıklı ve
herhangi bir EC2 örneğinden ya da herhangi bir ekibin hesabından erişilebilir. GPU örneği onu
S3 API aracılığıyla okur. Burada bir dosya sistemine gerek yok.

**Senaryo B**: Bir WordPress sitesi, bir yük dengeleyicinin arkasında dört EC2 örneğinde
çalışıyor. WordPress eklenti dosyalarını, tema dosyalarını ve kullanıcı yüklemelerini
sunucudaki bir dizinde saklıyor. Dört örneğin de aynı dosyalara okuyup yazması gerekiyor.

Karar: EFS. WordPress dosya sistemi anlambilimi kullanır — dizinler oluşturur, dosyalar yazar,
yola göre dosya okur. S3, WordPress eklenti ekosistemini yeniden yazmayı gerektirir. EFS,
WordPress'in yerel olarak çalıştığı standart bir NFS dosya sistemi olarak bağlanır.

**Senaryo C**: Bir PostgreSQL veritabanı bir EC2 örneğinde çalışıyor. Sorgu yürütme ve dizin
aramaları için hızlı rastgele G/Ç'ye ihtiyaç duyuyor.

Karar: EBS (gp3 ya da io2). Veritabanları, küçük, rastgele okuma ve yazmalar için düşük
gecikmeli blok depolamaya ihtiyaç duyar. S3 çok yavaştır ve dosya sistemi anlambilimini
desteklemez. EFS, rastgele G/Ç için EBS'den daha yüksek gecikmeye sahiptir.

Kalıp: dosyalar için varsayılan S3'tür. Belirli bir örnek için blok depolamaya ihtiyaç
duyduğunuzda EBS ekleyin. Birden fazla örneğin bir dosya sistemini paylaşması gerektiğinde EFS
ekleyin. Örnek deposu yalnızca geçici karalama alanı için.

## EFS Yetmediğinde: Amazon FSx

Bir sonraki depolama dersi bir kesinti ya da beyaz tahta tartışması olarak gelmedi. Bir satış
sözleşmesi olarak geldi — Maya'nın portal yayına girdiğinden beri kovaladığı türden, kapatması
tam bir çeyrek demo ve takip görüşmesi alan türden. Restoran işletmecisi portalı yayına
girdikten üç ay sonra, Nimbus ilk çok-konumlu müşterisini imzaladı: Copper Kettle, orta batıda
bir düzine konumda faaliyet gösteren, aile sahipli bir grup. Maya anlaşmayı yürütmüştü. Tom
finansal modeli kurmuştu. Leo, mürekkep kurumadan teknik entegrasyonu planlamaya başlamıştı.

Sonra Copper Kettle'ın BT ekibinin altyapı notlarını okudu.

"Dosya sunucuları Windows," dedi. "Her şey Windows. Mutfak yönetim yazılımları, İK
sistemleri, planlama araçları — hepsi Windows dosya sunucularındaki paylaşılan sürücülere
yazıyor. SMB protokolü. Active Directory kimlik doğrulaması."

"Onları EFS'ye taşıyabilir miyiz?" diye sordu Maya.

Leo başını salladı. "EFS NFS kullanır. Onların uygulamaları SMB konuşur. Bunlar farklı
protokoller. Copper Kettle yazılımı NFS'in ne olduğunu bilmiyor. Onu öylece bir EFS bağlamasına
yönlendiremezsin."

"Yani EFS kullanamayız."

"Bunun için değil. Farklı bir hizmet var."

**FSx for Windows File Server: EFS, Ama Windows İçin**

**Amazon FSx for Windows File Server**, tamamen yönetilen, Windows yerel paylaşılan bir dosya
sistemidir. SMB (Server Message Block) protokolünü destekler — Windows sunucularının, Windows
uygulamalarının ve yerinde Windows dosya paylaşımlarının onlarca yıldır kullandığı aynı
protokol. Active Directory ile entegre olur, Windows ACL'lerini (dosya düzeyinde izinler)
destekler ve Windows uygulamalarının gerçekten bağımlı olduğu Windows'a özgü özellikleri
destekler.

Onu EFS gibi düşünün, ama Windows için — Active Directory ortamınızın zaten beklediği tüm
Windows'a özgü özelliklerle. Copper Kettle mutfak yönetim yazılımı, yerinde dosya sunucularına
bağlandığı gibi tam olarak ona bağlanırdı. Uygulama değişmez. Protokol değişmez. Veri sadece
Chicago'da bir bodrumdaki sunucu yerine yönetilen bir AWS hizmetinde yaşar.

Copper Kettle taşıması için: Leo bir FSx for Windows File Server dosya sistemi tahsis etti,
onu Copper Kettle Active Directory'ye bağladı (AWS Managed Microsoft AD aracılığıyla AWS'ye
genişletilmiş) ve mevcut sürücü harflerini eşledi. Mutfak yazılımı dosya paylaşımlarını tam
olarak beklediği yerde buldu.

"Bu aylık ne kadar tutar?" diye sordu Tom.

Leo çoktan bakmıştı. FSx for Windows, ayda GB depolama başına fiyatlandırılır — EFS'den daha
pahalı, S3'ten önemli ölçüde daha pahalı, ama bir düzine konumda Windows dosya sunucularının
bakımını yapmaktan çok daha ucuz. Tom sayıyı itiraz etmeden yazdı.

**FSx for Lustre: ML İşiniz Yüzlerce GPU'yu Beslemesi Gerektiğinde**

Bu arada, Leo bir yan tarafta bir öneri motoru prototipi yapmaya başlamıştı — bir müşterinin
geçmiş davranışlarına ve benzer müşterilerin neyi sipariş ettiğine göre hangi yemekleri sipariş
edeceğini tahmin etmek. Eğitim verisi hâlâ küçüktü, ama deney onu ciddi ML ekiplerinin
modellerini nasıl beslediğine dair bir tavşan deliğine yöneltti: her çalışmada S3'ten yüzlerce
gigabayt okuyan eğitim işleri.

"Vaka çalışmalarında sürekli karşıma çıkan kalıp," diye rapor etti bir sonraki ekip öğle
yemeğinde, "G/Ç'de darboğaza giren eğitim işleri. Pahalı GPU'lar zamanın %40'ında boşta, bir
sonraki veri yığınını bekliyor."

Bu, paylaşılan dosya depolamadan farklı bir sorun. Bir yüksek performanslı hesaplama (HPC)
sorunu: hepsi aynı veri kümesinden çok yüksek verimle, aynı anda veri okuması gereken yüzlerce
işlem biriminiz olduğunda.

**Amazon FSx for Lustre**, Lustre paralel dosya sisteminin tamamen yönetilen bir uygulamasıdır.
Lustre tam olarak bu senaryo için tasarlanmıştır — birçok eşzamanlı istemci genelinde, son
derece yüksek verimde paralel okumalar. S3 ile yerel olarak entegre olur: FSx for Lustre'ı bir
S3 kovasına yönlendirirsiniz ve o veriyi Lustre dosya sistemi aracılığıyla otomatik olarak
kullanılabilir kılar. Eğitim işi yerel bir bağlama noktasından okur; FSx, perde arkasında
veriyi S3'ten akıtır.

ML eğitim işiniz veriyi aynı anda yüzlerce GPU'ya beslemesi gerektiğinde, FSx for Lustre
araçtır. Aynısı finansal modelleme, genomik iş yükleri ve video işleme için de geçerlidir —
darboğazın depolama kapasitesi değil, paralel G/Ç verimi olduğu her iş yükü.

Leo'nun yer imine eklediği vaka çalışması hikâyeyi iki sayıyla anlatıyordu: eğitim işini FSx
for Lustre'a taşıdıktan sonra, GPU kullanımı %60'tan %94'e tırmandı ve altı saat süren eğitim
çalışması üç buçuk saatte tamamlandı. Nimbus'un uzun süre o tür beygir gücüne ihtiyacı
olmayacaktı — ama Leo kalıbı, öneri motoru büyüdüğü gün için bir kenara not etti.

**Diğer FSx Seçenekleri**

AWS ayrıca **FSx for NetApp ONTAP** da sunar — yerinde zaten NetApp depolaması çalıştıran ve
çok protokollü erişim isteyen (aynı dosya sisteminden NFS, SMB ve iSCSI) kuruluşlar için — ve
dosya sistemi düzeyinde anlık görüntüler ve klonlar gibi ZFS'e özgü özelliklere ihtiyaç duyan
iş yükleri için **FSx for OpenZFS**. İkisi de belirli mevcut altyapısı ya da gereksinimleri
olan kuruluşlar için özelleşmiş araçlardır.

Çoğu ekip için, karar dört FSx çeşidi ile EFS arasındadır. Soru her zaman aynıdır: iş yükü
hangi protokolü konuşuyor ve hangi performans özelliklerine ihtiyaç duyuyor?

---

> **Sınav İpucu — Amazon FSx**
>
> *SAA-C03 Alan: Yüksek Performanslı Mimariler Tasarlama (Alan 3, Görev 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + Windows iş yükleri**. Sınav sinyalleri:
>   "Windows dosya sunucusu," "SMB protokolü," "Active Directory entegrasyonu," "Windows
>   uygulamalarını lift-and-shift." Bu ifadelerden herhangi birini gördüğünüzde, cevap FSx for
>   Windows'tur.
> - **FSx for Lustre = HPC + ML eğitimi + paralel G/Ç + S3 entegrasyonu**. Sınav sinyalleri:
>   "makine öğrenimi eğitimi," "yüksek performanslı hesaplama," "HPC," "paralel dosya sistemi,"
>   "G/Ç yoğun iş yükleri," "GPU kümesi," "dosya sistemini S3 ile entegre et." Bu ifadeleri
>   gördüğünüzde, cevap FSx for Lustre'dır.
> - **EFS, ikisinin de yerini tutmaz.** EFS, Linux iş yükleri için NFS'tir. SMB konuşmaz.
>   Paralel yüksek performanslı bir dosya sistemi değildir. FSx gerektiğinde EFS kullanmak,
>   uygulamanın çalışmaması (Windows) ya da G/Ç darboğazına girmesi (HPC) anlamına gelir.
> - **FSx for NetApp ONTAP ve FSx for OpenZFS** daha az çıkar, ama sinyaller belirgindir.
>   "Mevcut NetApp/ONTAP depolamasını taşı," "çok protokollü erişim (NFS + SMB + iSCSI)" ya da
>   "SnapMirror" → FSx for NetApp ONTAP. "ZFS," "anında anlık görüntüler/klonlarla NFS" ya da
>   "yerinde bir ZFS dosya sunucusunu taşı" → FSx for OpenZFS.
> - Hızlı başvuru: "SMB ya da Windows dosya sunucusu" → FSx for Windows. "Makine öğrenimi
>   eğitimi ya da yüksek performanslı hesaplama" → FSx for Lustre. "NetApp/çok protokollü" →
>   FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## Buluta Köprü: AWS Storage Gateway

Nimbus'un şimdiye kadarki en büyük müşteri adayı — üç eyalette yirmi konumu olan Meridian
Kitchen adlı bölgesel bir zincir — `aws s3 cp` ile çözülemeyecek bir sorunla geldi.

Meridian'ın yerinde dosya sunucularında yaşayan yıllarca operasyonel verisi vardı. Tarifler,
faturalar, mutfak video görüntüleri, tedarikçi sözleşmeleri. Birkaç gigabayt değil. Terabaytlar.
Ve bu veriyi üreten ve tüketen yazılım — mutfak yönetim sistemleri, faturalama platformları, İK
araçları — hepsi NFS ya da SMB kullanarak yerel dosya paylaşımlarına yazıyordu. O uygulamaları
yeniden yazmak mümkün değildi. Tüm veriyi bir gecede taşımak da mümkün değildi.

"Peki, tek bir uygulamayı değiştirmelerini istemeden," diye sordu Maya, "verilerini AWS'ye almaya
nasıl başlarız?"

"Tam olarak bunun için bir hizmet var," dedi Priya. "Veri merkezlerinde bir VM olarak çalışır,
mevcut yazılımlarına normal bir dosya sunucusu ya da depolama cihazı gibi görünür ve perde
arkasında her şeyi sessizce AWS'de saklar."

O hizmet **AWS Storage Gateway**'dir: yerinde ortamları AWS depolamaya bağlayan hibrit bir
depolama hizmeti. Depolamayı, uygulamalarınıza zaten anladıkları protokolleri kullanarak sunar,
veriyi aslında S3, S3 Glacier ya da EBS anlık görüntüleri olarak kalıcılaştırırken.

Üç gateway türü var, her biri farklı bir yerinde sorunu çözüyor.

**File Gateway**, yerinde uygulamalara bir NFS ya da SMB arabirimi sunar. Gateway'e yazılan
dosyalar S3'te nesne olarak saklanır — ama uygulama bunu bilmez. Bir dosya sistemi görür. Sık
erişilen dosyalar düşük gecikmeli okumalar için yerel olarak önbelleğe alınır; geri kalanı
S3'te yaşar. Meridian'ın ihtiyaç duyduğu buydu: mutfak yönetim yazılımı bir dosya paylaşımı
gibi görünen şeye yazar ve veri, Nimbus'un onu analiz edebileceği, yedekleyebileceği ve
arayabileceği S3'te son bulur.

"Dur — ama bunu neden öyle yapalım ki?" diye sordu Maya. "Neden yazılımı doğrudan S3'e
yönlendirmiyoruz?"

Çünkü NFS ve SMB, S3 değil. Mutfak yazılımı S3'ün API'sini konuşmaz. Dosya yolları açar. Bir
dizine bayt yazar. File Gateway, uygulama hiçbir şeyin değiştiğini bilmeden bunu S3 nesne
işlemlerine çevirir.

**Volume Gateway**, yerinde sunuculara iSCSI blok depolama birimleri sunar — fiziksel bir sabit
diskin ya da SAN cihazının sunacağı aynı arabirim. İki modu vardır: *stored volumes* (depolanan
birimler) birincil veriyi S3'e EBS anlık görüntüleri olarak eşzamansız yedeklerle yerinde tutar
(bulut yedeği de isteyen yerinde-öncelikli iş yükleri için) ve *cached volumes* (önbelleğe
alınmış birimler) birincil veriyi S3'te tutar, sık erişilen veriyi yerinde önbelleğe alır (S3'ü
birincil depolama olarak ele almaya hazır kuruluşlar için).

**Tape Gateway**, Veeam, Veritas ya da NetBackup gibi yedekleme yazılımlarına sanal bir teyp
kitaplığı (VTL) sunar. Yedekleme yazılımı, fiziksel teyp kartuşları gibi görünen şeye yazar. O
sanal teypler S3'te saklanır ve S3 Glacier'a arşivlenebilir. Yedekleme yazılımı değişmez.
Fiziksel teyp robotları ve rafları ortadan kalkar.

"Meridian'ın yedekleme ekibi Veeam çalıştırıyor," dedi Leo. "Gerçek fiziksel teypleri var.
Saha dışı depolama, rotasyon programları, hepsi var."

"Tape Gateway fiziksel teyplerin yerini alır," dedi Priya. "Aynı Veeam yapılandırması. Aynı
yedekleme işleri. Teypler sadece bir raf yerine S3'te yaşar."

Tom saha dışı teyp depolamanın maliyetine baktı. O sekmeyi yorum yapmadan kapattı ve taşıma
planını onayladı.

---

> **Sınav İpucu — AWS Storage Gateway**
>
> *SAA-C03 Alan: Yüksek Performanslı Mimariler Tasarlama (Alan 3)*
>
> - **File Gateway = NFS/SMB → S3.** Yerinde uygulamaların yazdığı dosyalar S3 nesnelerine
>   dönüşür. Sık erişilen dosyalar yerel olarak önbelleğe alınır. Sınav tetikleyicisi: "yerinde
>   uygulama, kod değişikliği olmadan dosyaları S3'te saklaması gerekir."
> - **Volume Gateway = iSCSI blok depolama → S3 anlık görüntüleri.** Stored modu: birincil veri
>   yerinde, S3'e EBS anlık görüntüleri olarak yedeklenir. Cached modu: birincil veri S3'te,
>   sık erişilen bloklar yerel olarak önbelleğe alınır. Sınav tetikleyicisi: "yerinde sunucu,
>   bulut destekli blok depolamaya ihtiyaç duyar."
> - **Tape Gateway = VTL → S3/Glacier.** Yedekleme yazılımı sanal teyplere yazar; teypler S3'te
>   saklanır ya da Glacier'a arşivlenir. Sınav tetikleyicisi: "yedekleme yazılımını değiştirmeden
>   fiziksel teyp yedekleme altyapısının yerini al."
> - **Temel sınav kalıbı:** "yerinde uygulama, kod değişikliği olmadan bulut depolamaya ihtiyaç
>   duyar" → Storage Gateway. "Teyp yedeklemenin yerini al" → özellikle Tape Gateway.

---

## Güçlü Yönler ve Sınırlamalar

**EBS güçlü yönleri**:

- EC2 için kalıcı, hızlı blok depolama
- Zaman noktası yedekleme ve kurtarma için anlık görüntüler
- Farklı iş yükleri için birden fazla performans katmanı
- Bekleme hâlinde şifreleme yerel olarak desteklenir — hesap düzeyinde şifrelemeyi varsayılan
  olarak etkinleştirin

**EBS sınırlamaları**:

- Her seferinde bir örneğe takılı (küçük istisnalarla)
- EC2 örneğiyle aynı AZ'de (başka bir AZ'ye kopyalamak bir anlık görüntü gerektirir)
- Sadece kullandığınız için değil, tahsis edilen depolama için ödersiniz
- Mevcut şifrelenmemiş bir birimi şifrelemek, bir bakım penceresiyle bir
  anlık-görüntü-kopyala-geri-yükle döngüsü gerektirir

**EFS güçlü yönleri**:

- Çok örnekli paylaşılan dosya sistemi — yerel NFS protokolü
- Otomatik olarak ölçeklenir, kapasite tahsis etmezsiniz
- Bir Bölge içinde AZ'ler arası erişilebilir
- Elastik Verim modu iş yüküne otomatik olarak uyum sağlar

**EFS sınırlamaları**:

- GB başına S3'ten daha pahalı
- Rastgele G/Ç için EBS'den daha yüksek gecikme
- Tüm Bölgelerde mevcut değil

## Veriyi Toplu Taşımak: DataSync ve Snow Ailesi

Storage Gateway, yerinde uygulamaları bulut depolamaya *sürekli bağlı* tutar. Ama sınavda — ve
eninde sonunda gerçek projelerde — sürekli iki başka taşıma senaryosu çıkar:

**AWS DataSync**, *çevrimiçi toplu aktarım* içindir: büyük veri kümelerini, yerinde NFS/SMB
dosya sunucuları (ya da diğer bulutlar) ile S3, EFS ya da FSx arasında ağ üzerinden taşımak —
bir kez ya da bir programa göre. Paralelleştirme, bütünlük doğrulaması, yeniden denemeler ve
bant genişliği kısıtlamayı halleder ve elle yazılmış rsync tarzı betiklerden kabaca 10 kat daha
hızlıdır. Sınav tetikleyicisi: "yerinde bir NFS sunucusundan Amazon EFS/S3'e milyonlarca
dosyayı taşı/aktar" → DataSync. (Onu, *süregelen hibrit erişim* için olan Storage Gateway ile
ya da *veritabanlarını* taşıyan DMS ile karıştırmayın.)

**AWS Snow Ailesi**, ağ darboğaz olduğunda içindir. 100 TB'ı 100 Mbps'lik bir hat üzerinden
taşımak üç aydan fazla sürer; bir kamyon daha hızlıdır. **Snowball Edge**, AWS'nin size
gönderdiği sağlamlaştırılmış bir cihazdır — yerel olarak ~80 TB'a kadar yükleyin, geri
gönderin, AWS onu S3'e içe aktarsın. **Snowcone**, kenar konumları için küçük taşınabilir
sürümdü (~8–14 TB) — 2024 sonunda durduruldu, gerçi eski sınav sorularında hâlâ görünebilir
(Bölüm 25'teki gerçeklik kontrolüne bakın). Sınav matematik tetikleyicisi: soru gövdesi size
bir veri kümesi boyutu ve ince ya da güvenilmez bir bağlantı verip en hızlı/en pratik taşımayı
sorduğunda, aktarım süresini hesaplayın — haftalar ya da aylarsa, cevap Snow Ailesi'dir.

> **Sınav İpucu — AWS Backup**
>
> Bu bölümü birbirine bağlayan bir hizmet daha: **AWS Backup**, tek bir yedekleme planıyla EBS,
> EFS, RDS, DynamoDB, FSx ve Storage Gateway genelinde yedeklemeleri merkezileştirir ve
> otomatikleştirir — programlar, saklama, bölgeler arası ve hesaplar arası kopyalar ve
> değişmezlik için Backup Vault Lock. Sınav tetikleyicisi: "birden fazla AWS hizmeti/hesabı
> genelinde yedeklemeleri merkezi olarak yönet" → AWS Backup, hizmet başına betikler değil.


## Özet

Tom'un kırmızı kalemi gerçek sorunu daire içine aldı: tek bir makinede çok fazla şey.
Depolamayı EC2 örneğinden ayırmak sadece kapasiteyle ilgili değildir — her katmanın bağımsız
olarak yönetilebilmesi, ölçeklenebilmesi ve güvene alınabilmesi için ilgileri ayırmakla
ilgilidir. Doğru depolama seçimi dört soruya bağlıdır: depolamaya ne ihtiyaç duyuyor, aynı anda
kaç şeyin ona ihtiyacı var, ne kadar yaşıyor ve nasıl erişiliyor? Bu dört soru tutarlı biçimde
doğru cevaba götürür.

- **EBS** (Elastic Block Store), tek bir EC2 örneği için kalıcı blok depolamadır. Örnek
  durdurmalarından sağ çıkar ve yedekleme için anlık görüntü alınabilir. Genel iş yükleri için
  gp3, yüksek IOPS gereksinimleri için io2 kullanın. Örnek deposu geçici ve hızlıdır ama örnek
  sonlandırıldığında kaybolur.
- **EFS** (Elastic File System), birden fazla örneğin aynı anda bağlayabileceği paylaşılan bir
  ağ dosya sistemidir. EFS bir Bölge içindeki AZ'lere yayılır; EBS tek bir AZ ile sınırlıdır.
- Depolama türünü gereksinime eşleyin: tek EC2 veritabanı → EBS; sunucular arasında paylaşılan
  dosyalar → EFS; nesneler, medya, yedekler → S3; arşivler → S3 Glacier.
- Mevcut bir EBS birimini şifrelemek şunu gerektirir: anlık görüntü → şifreli kopya → yeni birim
  → değiştir. Yeni birimler için bundan kaçınmak adına hesap düzeyinde şifrelemeyi varsayılan
  olarak etkinleştirin.
- **EBS "Sonlandırmada Sil"**: root birimleri örnek sonlandırmada silmeyi varsayar; veri
  birimleri kalıcı olmayı varsayar. Örnek yaşam döngüsü politikalarını tasarlarken her iki
  ayarı da gözden geçirin.

## Sınav İpuçları

*SAA-C03 Alan 3 — Görev 3.1 (depolama çözümleri)*

- **EBS birimleri bir AZ'de yaşar.** Yalnızca aynı AZ'deki bir örneğe takılabilirler. Bir EBS
  birimini farklı bir AZ'de kullanmak için, bir anlık görüntü oluşturur ve hedef AZ'de geri
  yüklersiniz.
- **EBS anlık görüntüleri artımlıdır ve S3'te saklanır.** İlk anlık görüntü tamdır; sonrakiler
  yalnızca değişiklikleri saklar. Felaket kurtarma için anlık görüntüleri diğer Bölgelere
  kopyalayabilirsiniz.
- **EFS AZ'ler arasıdır.** Aynı Bölge içindeki farklı AZ'lerdeki birden fazla örnek aynı EFS
  dosya sistemini bağlayabilir. Bu, EBS'den temel bir ayırt edicidir.
- **Bir sınav senaryosu "paylaşılan içerikli web uygulaması" ya da "aynı dosyalara erişen birden
  fazla örnek" dediğinde, EFS düşünün.** "Veritabanı depolaması" ya da "bir sunucu için kalıcı
  disk" dediğinde, EBS düşünün.
- **Örnek deposu verisi bir yeniden başlatmadan sağ çıkar ama bir durdurmadan ya da
  sonlandırmadan değil.** Bir soru, "örnek durdurulduktan sonra kaybolan" veriyi tarif edebilir
  — orada örnek deposu devrededir.
- **gp3 ve io2**: gp3 genel kullanım için varsayılandır; io2, garantili IOPS'a ihtiyaç duyan
  iş yükleri içindir (büyük veritabanları, kritik görev sistemleri). "IOPS gereksinimleri" ya da
  "tutarlı düşük gecikmeli veritabanı performansı" tarif eden sınav senaryoları io2'ye işaret
  eder.
- **gp2 ve gp3:** gp2 IOPS boyuta bağlıdır (3 IOPS/GB, 5.334 GB'ta maks 16.000 IOPS); gp3 IOPS
  boyuttan bağımsızdır (3.000 taban, Eylül 2025'ten beri 80.000'e kadar yapılandırılabilir —
  eski materyal, ve muhtemelen sınav soru bankası, hâlâ önceki 16.000 sınırını varsayar). Sınav
  soru kalıbı: bir iş yükü, depolamayı artırmadan daha fazla IOPS'a ihtiyaç duyar — cevap gp3
  ya da io2'dir, gp2 değil.
- **EBS için bekleme hâlinde şifreleme**: Mevcut şifrelenmemiş bir birimi yerinde
  şifreleyemezsiniz — anlık görüntü almalı, şifreli kopyalamalı, geri yüklemelisiniz. Yanlışlıkla
  şifrelenmemiş birimler oluşturmaktan kaçınmak için hesap düzeyinde şifreleme varsayılanlarını
  etkinleştirin. Şifreleme, KMS anahtarları kullanarak AES-256'dır.
- **Fast Snapshot Restore**, yeni geri yüklenen birimlerdeki performans cezasını ortadan
  kaldırır ama anlık görüntü başına AZ başına para tutar. Birimleri "anında tam performansta"
  geri yükleme hakkındaki sınav soruları FSR'ye işaret eder.
- **EFS performans modları**: Genel Amaçlı (düşük gecikme, çoğu iş yükü için uygun) ve Max I/O
  (yüksek düzeyde paralelleştirilmiş iş yükleri için daha yüksek verim).
- **EFS verim modları — üç seçenek:** Patlamalı (verim depolama boyutuyla ölçeklenir, patlama
  kredileri kullanır — ani iş yükleri için iyi), Elastik (otomatik ölçeklenir, kullandıkça öde —
  öngörülemeyen iş yükleri için iyi), Tahsis Edilmiş (depolamadan bağımsız sabit verim — tutarlı
  yüksek verim ihtiyaçları için iyi). Sınav, verimi tahsis etmek ile elastik olarak ölçeklenmeye
  bırakmak ya da patlama kredilerine güvenmek arasında ne zaman karar vereceğinizi bilip
  bilmediğinizi test eder.
- **Bölgeler arası anlık görüntü kopyası**: EBS anlık görüntüleri felaket kurtarma için diğer
  Bölgelere kopyalanabilir. Kopyalanan anlık görüntü bağımsızdır ve geri yükleme sırasında veri
  aktarım maliyeti eklemez — yalnızca kopyalama işleminin kendisi sırasında.
- **Storage Gateway türleri:** File Gateway = NFS/SMB → S3 (dosyalar nesneye dönüşür). Volume
  Gateway = iSCSI blok depolama → S3 anlık görüntüleri (stored: birincil yerinde; cached:
  birincil S3'te). Tape Gateway = VTL → S3/Glacier (fiziksel teyplerin yerini alır). Sınav
  tetikleyicisi: "yerinde uygulama kod değişikliği olmadan bulut depolamaya ihtiyaç duyar" →
  Storage Gateway. "Teyp yedeklemenin yerini al" → Tape Gateway.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizle: EBS ile EFS arasındaki fark nedir? Birini diğerine ne zaman tercih
edersiniz?

*(İpucu: Depolamaya aynı anda tek bir örneğin mi yoksa birden fazla örneğin mi erişmesi
gerektiğini düşünün.)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket, bir yük dengeleyicinin arkasında dört EC2 örneği genelinde bir web
uygulaması çalıştırıyor. Kullanıcılar profil fotoğrafları yükleyebiliyor. Herhangi bir
fotoğrafın, onu hangi örnek işlerse işlesin, yüklemeden hemen sonra kullanıcılarca
görüntülenebilir olması gerekiyor. Fotoğraflar tarayıcılara HTTP üzerinden sunuluyor, asla
yerinde değiştirilmiyor ve ekip en az operasyonel yükle EN uygun maliyetli, ölçeklenebilir
çözümü istiyor.

Hangi depolama çözümü gereksinimlerini EN İYİ şekilde karşılar?

A) Her EC2 örneğine bir EBS gp3 birimi takın ve dosyaları aralarında bir cron işi kullanarak
   senkronize edin  
B) Fotoğrafları doğrudan EC2 örneğinin örnek deposunda saklayın  
C) Dört EC2 örneğinin tümünde aynı anda bağlanan Amazon EFS kullanın  
D) Fotoğrafları S3'te saklayın ve onlara doğrudan uygulama kodundan erişin

**İpucu 1**: Gereksinim "dört örneğin de herhangi bir fotoğrafı sunması gerekir." Hangi
seçenekler bir dosyayı tüm örneklere anında görünür kılar?

**İpucu 2**: Örnek deposu geçicidir. EBS birden fazla örneğe aynı anda bağlanamaz. Bu seçenekleri
daraltır.

**İpucu 3**: Hem C hem D teorik olarak çalışabilir. Uygulamanın fotoğraflara dosya sistemi
işlemleri aracılığıyla mı yoksa HTTP istekleri aracılığıyla mı erişmesi gereken bir durum için
hangisi daha uygundur?

**Cevap**: D

**Açıklama**: Fotoğrafları S3'te saklamak ve onları URL aracılığıyla sunmak, bir web uygulaması
için mimari olarak doğru seçimdir. Yüklenen fotoğraflar, S3'ün URL'si aracılığıyla herhangi bir
sunucudan (ve herhangi bir tarayıcıdan) anında erişilebilir. S3 tam olarak bu kullanım senaryosu
için tasarlanmıştır: kullanıcı tarafından yüklenen dosyaları ölçekte, yüksek kullanılabilirlikle
ve sıfır yönetim yüküyle saklamak.

Not: C (EFS) teknik olarak çalışırdı, ama S3, web uygulamalarında kullanıcı tarafından yüklenen
ikili dosyalar için tercih edilen kalıptır çünkü daha ucuz, daha ölçeklenebilir ve uygulama bir
proxy görevi görmeden dosyaları doğrudan HTTP üzerinden sunar.

**Neden A değil?** Dosyaları bir cron işi aracılığıyla senkronize etmek yarış koşulları ve
tutarlılık sorunları yaratır. Yüklemeler ile bir sonraki senkronizasyon arasında, dosyalar diğer
örneklerde eksik olurdu.

**Neden B değil?** Örnek deposu verisi, örnek durdurulduğunda ya da sonlandırıldığında kaybolur.
Fotoğraflar kaybolurdu.

**Neden C değil?** EFS, soru dosya sistemi anlambilimi talep ettiğinde (örneğin, dosyaları
yerinde değiştiren bir CMS) doğru cevaptır. Web üzerinden sunulan, kullanıcı tarafından yüklenen
fotoğraflar için S3 daha basit, daha ucuz ve daha uygundur.

**Sınav anahtar kelime uyarısı**: gerçek sınavda, soru gövdesini harfiyen okuyun. "Paylaşılan
**dosya** depolama," "dosya sistemi," "NFS" ya da "POSIX" diyorsa, anahtarlanmış cevap
**EFS**'tir — belirtilen gereksinimi mimari zevkle geçersiz kılmayın. Bu senaryo S3'e
anahtarlanır çünkü bir dosya sistemi değil, HTTP üzerinden uygun maliyetli nesne teslimatı
ister.

*SAA-C03 Alan 3 — Görev 3.1*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus yeni bir özellik ekliyor: restoran sahipleri, sonra ayrıştırılıp Nimbus veritabanını
doldurmak için kullanılan PDF menüleri yükleyebiliyor. PDF işleme işi, şunları yapması gereken
bir EC2 örnekleri filosunda çalışıyor: (a) yüklenen PDF'i oku, (b) geçici işleme dosyaları yaz,
(c) ayrıştırılan çıktıyı yaz.

Bu üç adımın her biri için hangi depolama hizmetlerini kullanırdınız ve neden?

*(Tek bir doğru cevap yoktur. Depolama türünü her adımın özelliklerine eşlemeye odaklanın.)*

## Jenerik Sonrası Sahne

O öğleden sonra, Nimbus depolamalarını düzgünce ayırdı. Veritabanı, otomatik anlık görüntüler ve
şifreleme etkinleştirilmiş kendi EBS birimini aldı. Menü fotoğrafları S3'e taşındı. EC2 örneği
sonunda nefes alacak yer buldu.

Leo bir yük testi çalıştırdı. Site, hiç terlemeden iki yüz eşzamanlı kullanıcıyı kaldırdı.

"Buradan iyi olacak," dedi, grafiklerin pürüzsüzce platoya ulaşmasını izleyerek.

Tom faturaya baktı. EBS birimi aylık 8 dolar ekliyordu. Onu yazdı.

"Bu faturaya sürekli bir şeyler ekliyorum," dedi. "Ne zaman dengelenecek?"

"Kesinti yaşamayı bıraktığımızda," dedi Maya. "Her kesinti, önlemeden daha pahalıdır."

Tom ikna olmuş görünmüyordu. Eninde sonunda olacaktı.

Üç gün sonra, platformdaki bir restoran sahibi bir sipariş vermeye çalıştı ve bir hata aldı.
Maya günlükleri kontrol etti.

Veritabanı oradaydı. Uygulama çalışıyordu. Ama yirmi eşzamanlı kullanıcı aynı anda menüyü
okumaya çalışıyordu ve her biri veritabanına çarpıyordu.

"Her sayfa yüklemesi bir veritabanı sorgusu," dedi Leo. "Her biri."

Priya çoktan bir şey aratıyordu.

Bir sonraki bölümde: sunucunun kaldırabileceğinden daha fazla müşteri geldiğinde ne olur.
