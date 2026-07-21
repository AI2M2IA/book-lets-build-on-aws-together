# Bölüm 4: Başkasının Binasındaki Bir Bilgisayar

CPU grafiği fon müziğine dönüşmüştü.

Tom'un dizüstü bilgisayarı masasının köşesinde açık duruyordu, CloudWatch her dakika
yenileniyor, kullanım çizgisi bir şeylerin yoğun çalıştığı anlamına gelen bir eğimle
tırmanıyordu. Maya bunu üç gün önce fark etmiş ve kimseye söylememişti. Bunun yerine sipariş
kuyruğunu izliyordu.

IAM yerindeydi. Kimlik bilgileri düzgündü. Priya her şeyde MFA kurmuştu. Ekip, ilk kez,
biraz sorumlu davranıyormuş gibi hissetti. Ama sorumlu olmak, Maya'nın izlediği sorunu
çözmüyordu: sipariş panosundaki sayılar tırmanırken, CPU çizgisinin de onlarla birlikte
tırmanması.

Nimbus uygulaması, Leo'nun üzerine düşünmeden başlattığı örnekte çalışıyordu — kimsenin bir
Bölge'nin ne olduğunu bilmesinden önce "bir yerlere dağıttığı" örnek.

Bu, yatırımcılara bir demo göstermek için sorun değildi. Maya "başlat"a bastığında ve ilk
hafta iki yüz kayıt geldiğinde — her gün etkin biçimde sipariş alan kırk yedi restoran —
sorun oldu. Leo'nun doğaçlama örneği artık gerçek siparişleri, gerçek menüleri ve gerçek
müşterileri işliyordu — kazara seçilmiş, varsayılana göre boyutlandırılmış, AWS'i yazarken
öğrenen bir kişi tarafından yapılandırılmış bir makine.

"Bir sunucuya ihtiyacımız var," dedi Maya. "Gerçek bir tane. Birinin gerçekten bilerek
seçtiği bir tane."

Tom CPU grafiğine baktı. Çizgi odanın diğer ucundan görülebiliyordu.

İşte o zaman bir bilgisayar kiralamanın gerçekte ne anlama geldiğine bakmaya başladılar.

**Kimsenin Açıklamadığı Soyutlama**

İnsanlar uygulamalarının "bulutta çalıştığını" söylediğinde, genellikle bir sanal makinede
çalıştığını kastederler — fiziksel olarak özel donanım olarak var olmayan, ama her açıdan
öyleymiş gibi davranan bir bilgisayar.

İşte mekanizma.

Bir AWS veri merkezindeki fiziksel bir sunucunun çok sayıda kaynağı vardır: CPU çekirdekleri,
bellek, disk ve ağ bant genişliği. AWS, o fiziksel sunucuyu bir **hipervizör** denen yazılım
kullanarak böler — bir bina yöneticisi gibi davranan, fiziksel sunucunun kaynaklarını birden
fazla sanal kiracı arasında paylaştıran yazılım. Hipervizör, her biri kendi özel CPU'su,
belleği ve diski varmış gibi görünen — ama aslında altta yatan fiziksel donanımı paylaşan —
birden fazla sanal makine oluşturur.

Bunu, bir ev satın almak yerine büyük bir binada daire kiralamak gibi düşünün.

Bina sahibi (AWS) fiziksel yapıyı korur — tesisat, elektrik, güvenlik. Siz bir birim alırsınız.
İstediğiniz gibi döşersiniz. Aylık (ya da saatlik) ödersiniz. Daha fazla alana ihtiyaç
duyduğunuzda, daha büyük bir birime taşınırsınız. Taşınıp çıktığınızda, ödeme yapmayı
bırakırsınız.

Bu sanal makine kiralamalarının her biri, AWS'nin **EC2 örneği** dediği şeydir — Elastic
Compute Cloud.

EC2, Elastic Compute Cloud'un kısaltmasıdır. "Elastik" kısmı önemlidir ve ona geleceğiz.
Şimdilik: bir EC2 örneği, saatlik kiraladığınız bir bilgisayardır. Bir işletim sistemi, bir ağ
bağlantısı ve hesaplama gücü vardır. Uygulamanızı tıpkı fiziksel bir sunucunun yapacağı gibi
çalıştırır.

**Örneğinizi Seçmek: Boyut Önemlidir**

Tüm EC2 örnekleri aynı değildir. AWS, neye optimize edildiklerine göre ailelere ayrılmış
yüzlerce örnek türü sunar.

**Genel amaçlı** (örn. `t3`, `m6i`): Dengeli CPU ve bellek. Çoğu web uygulaması için iyi bir
varsayılan seçim. `t3` ailesi patlamalıdır (burstable) — düşük kullanım dönemlerinde CPU
kredileri biriktirir ve patlamalar sırasında harcar. Geliştirme ortamları ve değişken CPU
talebi olan iş yükleri için harika. `m6i` ailesi tutarlı, patlamasız performans sağlar —
sürekli CPU ihtiyacı olan üretim iş yükleri için daha iyi.

**Hesaplama optimize** (örn. `c7g`): Belleğe kıyasla daha fazla CPU. Video kodlama, bilimsel
modelleme, toplu işleme için iyi. `c7g`'deki "g" eki, örneğin AWS Graviton işlemcileri
kullandığı anlamına gelir — AWS'nin kendi geliştirdiği ARM tabanlı çipler, birçok iş yükü için
eşdeğer x86 örneklerinden daha iyi fiyat-performans sunar.

**Bellek optimize** (örn. `r7i`): CPU'ya kıyasla daha fazla bellek. Veritabanları,
önbellekleme, bellek içi analitik için iyi. Daha fazla veriyi RAM'de tutarak performansı
dramatik biçimde iyileşen bir veritabanı çalıştırıyorsanız, R ailesi doğru başlangıç
noktasıdır.

**Depolama optimize** (örn. `i3`): Yüksek hızlı yerel depolama. Çok hızlı disk G/Ç'sine
ihtiyaç duyan veri yoğun iş yükleri için iyi. Bu örneklerdeki yerel NVMe depolama EBS'den
önemli ölçüde daha hızlıdır — ama aynı zamanda geçicidir (ephemeral). Onu geçici veriler için
kullanın, kaybetmeyi göze alamayacağınız hiçbir şey için değil.

**Hızlandırılmış hesaplama** (örn. `p4`): GPU'lar takılı. Makine öğrenimi eğitimi ve grafik
işleme için iyi. Bu örnekler pahalıdır — bir `p3.8xlarge` saatte 12 doların üzerinde tutar —
ama GPU paralelliğinden faydalanan iş yükleri için yerini tutacak bir şey yoktur.

Her ailenin boyutları vardır. Bir `t3.micro`nun 2 sanal CPU'su ve 1 GB belleği vardır. Bir
`t3.xlarge`ın 4 sanal CPU'su ve 16 GB'ı vardır. Bir `t3.2xlarge` yine ikiye katlar. Adlandırma
kalıbı tutarlıdır: ek `nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`,
`4xlarge`, `8xlarge` ve ötesi şeklinde gider.

Leo bir `t3.micro` seçmişti.

"Bir `t3.micro` kaç kullanıcı kaldırabilir?" diye sordu Tom. "Ve daha büyük olanı ne kadar
daha fazla tutar?"

"Uygulamaya bağlı," dedi Leo. "Ama muhtemelen görsel yükleme ve veritabanı sorguları çalıştıran
yüz eşzamanlı kullanıcıyı değil."

"Bu aylık ne kadar tutar?" diye sordu Tom, örnek türü karşılaştırma sayfasına bakarak.

Leo AWS fiyatlandırma sayfasını açtı. t3.micro aylık yaklaşık 8 dolardı. t3.small 17 dolardı.
t3.medium 33 dolardı. t3.large yaklaşık 60 dolardı. Yukarı çıktıkça fark hızla açılıyordu —
doğrusal değil, her boyut adımıyla kabaca ikiye katlanarak. Tom sayıları yazdı; her boyut
adımının belleği ikiye katladığını, ama ilginç bir şekilde CPU sayısını katlamadığını fark
etti. micro'dan large'a kadar her t3'ün aynı 2 vCPU'su vardı; sayı xlarge'a kadar artmıyordu.
Her adım belleği ikiye katladı; **CPU kredisi taban çizgisi** — örneğin, patlama kredilerini
tüketmeden sürekli kullanabileceği o vCPU'ların payı — da büyüdü, ancak her adımda değil.

Tom beyaz tahtaya "t3.micro" yazdı ve yanına üzgün bir surat çizdi.

**Doğru Boyutlandırma Konuşması**

t3.micro, cuma gecesi trafiği onu ezene kadar yaklaşık bir ay dayandı. Leo aceleyle yükseltme
yaptı — doğrudan bir t3.large'a, çünkü çok büyük olmanın küçük olmaktan daha güvenli olduğunu
düşünüyordu. t3.large'a geçişten iki hafta sonra, Tom bir şeyi işaretledi.

"CPU %9'da," dedi. "Ortalama. Son yedi günde."

Leo CloudWatch grafiğine baktı. Ortalama %9 CPU. Cuma akşam yemeği sırasında belki %35'lik
zirveler. Geri kalan zaman: zar zor kıpırdıyordu.

"Ayda 60 dolarlık bir sunucu çalıştırıyoruz," dedi Tom, "kapasitesinin %9'unda."

"Ama ya cuma zirveleri?" dedi Leo. "Manevra alanına ihtiyacımız var."

"Cuma zirveleri %35'e ulaşıyor," dedi Tom. "Bir t3.small aynı iki vCPU'ya sahip — daha küçük
olan kredi taban çizgisi, yaklaşık %20 sürekli. Biz ortalama %9'dayız. Bu, bütün gün, her gün
CPU kredisi biriktireceğimiz ve cuma geceleri birkaç saatliğine bunların bir kısmını
harcayacağımız anlamına gelir. `CPUCreditBalance` matematiğini kontrol ettim — bakiye hiçbir
zaman boşa yaklaşmıyor. Aylık 17 dolar. Manevra alanımız var."

Leo sayılara baktı. Grafiğe baktı. Aşırı kaynak ayırmış ve bunu bilen bir mühendisin
rahatsızlığını hissetti.

"Ama ya bir ani yükselme yaşarsak?" dedi.

"O zaman metrikler bize zarar vermeden önce söyler," dedi Priya. "Ve eninde sonunda Auto
Scaling kuracağız — tam olarak onun için var. Sistem otomatik olarak örnek ekleyebildiğinde,
ani yükselme için manuel kaynak ayırmana gerek kalmayacak."

t3.small'a küçülttüler. Aylık fatura 40 dolar düştü. Bir yıl boyunca bu 480 dolardı — hiç
yoktan iyiydi, özellikle bir girişim için. Tom bunu, bu noktayı vurgulamak için iki haftadır
bekleyen birinin sessiz tatminiyle elektronik tablosuna not etti.

Bu kalıbın bir adı var: **doğru boyutlandırma (right-sizing)**. Örnek boyutunu hayal edilen en
kötü duruma değil, gerçek iş yüküne eşlemek anlamına gelir. AWS Compute Optimizer ve CloudWatch
metrikleri gibi AWS araçları, doğru boyutlandırmayı bir tahmin değil, veriye dayalı bir karar
hâline getirir.

**AMI: Makinenizin Başlangıç Durumu**

Bir EC2 örneği başlatmadan önce, işletim sistemini ve başlangıç yapılandırmasını seçersiniz.
AWS'de buna **Amazon Machine Image** (AMI) denir.

Bir AMI bir şablondur. Şunları tanımlar:

- İşletim sistemi (Amazon Linux, Ubuntu, Windows Server vb.)
- Önceden yüklenmiş yazılım
- Başlangıç disk durumu

Bir AMI'den bir örnek başlattığınızda, AWS o şablonun yalnızca sizin için yeni bir kopyasını
oluşturur. Kendi AMI'lerinizi de oluşturabilirsiniz — bir sunucuyu tam olarak istediğiniz gibi
yapılandırırsanız, o durumu özel bir AMI olarak "kaydedebilir" ve onu kullanarak hızlıca
özdeş sunucular başlatabilirsiniz. Ölçekte tutarlı ortamları böyle dağıtırsınız.

Bir AMI'yi bir tarif gibi düşünün. Tarif yemeği tanımlar. Tarifi her izlediğinizde aynı yemeği
elde edersiniz. Yemeği kalıcı olarak değiştirmek isterseniz, tarifi güncellersiniz.

AWS bir AMI pazarı sağlar — bazıları AWS tarafından bakımı yapılan (Amazon Linux 2, Amazon
Linux 2023), bazıları büyük Linux dağıtımları tarafından bakımı yapılan (Ubuntu, Red Hat,
SUSE) ve bazıları üçüncü taraf satıcılardan (önceden yapılandırılmış veritabanı sunucuları,
güvenlik cihazları, ticari yazılım). Çoğu web uygulaması için, AWS tarafından bakımı yapılan
bir Amazon Linux AMI ya da Ubuntu LTS AMI doğru başlangıç noktasıdır.

Nimbus için Leo, en son Amazon Linux 2023 tabanından başlayan ve Node.js çalışma zamanını,
uygulamanın sistem bağımlılıklarını ve uygulama süreci için önceden oluşturulmuş bir hizmet
dosyasını ekleyen özel bir AMI oluşturdu. Bu AMI'den başlatılan yeni örnekler, 90 saniyenin
altında trafik sunmaya başlıyordu — her şeyi sıfırdan yüklemek için UserData betikleri
kullanıldığındaki dört dakikalık önyükleme süresinden önemli ölçüde daha hızlı.

Bir ödünleşim var: özel AMI'lerin bakımının yapılması gerekir. Bir sistem bağımlılığını ya da
çalışma zamanı sürümünü her güncellediğinizde, AMI'yi yeniden oluşturmanız gerekir. AMI'lerinin
bayatlamasına izin veren ekipler, kendilerini güncel olmayan yazılımla çalışan örnekler
çalıştırırken bulur — bir güvenlik riski. Priya, "en son paketlerle AMI'yi yeniden oluştur"u
aylık mühendislik kontrol listesine koydu.

"AMI'leri depolamanın maliyeti ne?" diye sordu Tom.

AMI'ler EBS anlık görüntüleri olarak depolanır — AMI'nin boyutu için EBS anlık görüntü ücretini
(GB başına ayda yaklaşık 0,05 dolar) ödersiniz. Nimbus uygulama yığınıyla tipik bir Amazon
Linux AMI yaklaşık 4 GB'tı. GB başına 0,05 dolardan: AMI başına ayda 0,20 dolar. Geri alma
amacıyla beş geçmiş AMI tutmak: ayda 1 dolar. Anlamlı bir maliyet değil.

**UserData: Önyükleme Betiği**

Leo'nun, uygulama kodu her değiştiğinde yeni bir AMI oluşturmaktan kaçınmaya çalışırken
keşfettiği bir yapılandırma seçeneği daha var.

Bir EC2 örneği başlattığınızda, bir **UserData betiği** sağlayabilirsiniz — örnek ilk kez
başladığında otomatik olarak çalışan bir kabuk betiği. Örnek "hazır" sayılmadan önce, root
olarak çalışır.

Nimbus için UserData betiği şuna benziyordu:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Bu betik Node.js'i yükler, en son uygulama kodunu çeker, bağımlılıkları yükler ve uygulama
hizmetini başlatır. Temel AMI'den başlatılan her yeni örnek bu betiği çalıştırır ve
uygulamanın geçerli sürümü yüklü olarak — otomatik olarak — ayağa kalkar.

Bu yaklaşım, AMI'nin basit kalması (sadece temel bir işletim sistemi) ve uygulama kurulumunu
UserData'nın halletmesi anlamına gelir. Ödünleşim: UserData betiklerinin çalışması zaman alır.
Bir örneğin önyükleme yapıp hazır hâle gelmesi üç ila beş dakika sürebilir. Başlangıç süresinin
önemli olduğu uygulamalar için — yeni örneklerin hızlıca hazır olmasına ihtiyaç duyduğunuz
Auto Scaling için — uygulamayı özel bir AMI'ye önceden pişirmek önyükleme süresini önemli
ölçüde azaltır.

"İyi olur," dedi Leo, Priya önyükleme süresini sorduğunda.

"Önyükleme süresi ne?" diye sordu.

"Dört dakika."

"Ve o dört dakika boyunca örnek çalışıyor ama trafik sunmuyor mu?"

"Evet."

"Yani ani bir trafik yükselmesi sırasında, yeni örneklerin henüz yardımcı olmadığı dört
dakikamız olabilir mi?"

Leo UserData betiğine baktı. Özel bir AMI'nin nasıl oluşturulacağına bakmaya başladı.

**Anahtar Çiftleri: Bir Sunucuya Erişmenin Doğru Yolu**

Geçen bölümdeki "Admin123" felaketini hatırlıyor musunuz?

Bir EC2 örneğine giriş yapmanın doğru yolu bir **anahtar çifti** ile olur.

Bir anahtar çifti kriptografik bir çifttir: bir genel anahtar (AWS tarafından sunucuda
saklanır) ve bir özel anahtar (indirip gizli tuttuğunuz bir dosya). Giriş yapmak için, özel
anahtarınızla SSH'i — güvenli bir protokol — kullanırsınız. Şifre yoktur. Özel anahtarı
kaybederseniz, erişimi kaybedersiniz. SSH için "şifremi unuttum" diye bir şey yoktur.

Bu önemlidir çünkü anahtar çiftleri:

- Size özgüdür
- Kriptografik olarak tahmin edilmesi imkânsızdır
- AWS tarafından saklanmaz (özel anahtarı siz tutarsınız)
- İptal etmesi kolaydır (anahtarı sunucudan silin, yeni bir çift oluşturun)

Priya, Nimbus sunucusunda anahtar tabanlı erişimi çoktan kurmuştu. Admin123 sunucusu hizmetten
çıkarıldı. Kimse bunun için üzülmedi.

"Peki ya biri içeri girmeye çalışır ve aktarım hâlindeki bir anahtar çiftini ele geçirirse?"
diye sordu Priya. Cevabı çoktan çıkarmıştı: özel anahtar asla ağ üzerinden seyahat etmez. Onu
bir kez indirirsiniz. Onu yerel olarak tutarsınız. Makinenizden asla ayrılmaz.

**Anahtar Çiftini Kaybederseniz Ne Olur**

Leo bu soruyu üçüncü haftada sordu, anahtar çiftini henüz kaybetmemiş ama bunu düşünen birinin
belirli enerjisiyle.

"Özel anahtar dosyasını kaybedersem ne olur?"

"Örneğe SSH erişimini kaybedersin," dedi Priya.

"Kalıcı olarak mı?"

"Mutlaka değil. Ama kurtarma süreci tatsızdır."

Kurtarma süreci: örneği durdur, root EBS birimini ayır, erişiminin *olduğu* farklı bir örneğe
bağla, birimi bağla, bağlı birimdeki `authorized_keys` dosyasına yeni bir genel anahtar ekle,
ayır ve orijinal örneğe yeniden bağla, yeniden başlat.

Bu işe yarar. Otuz ila altmış dakika sürer ve dikkatli yürütme gerektirir. Yanlış bir adım ve
işleri daha kötü hâle getirebilirsiniz.

Alternatif, uygulamanız root biriminde kritik bir şey saklamıyorsa (çünkü bu kitaptaki tavsiyeyi
izleyip veriyi S3 ve EBS'de sakladığınız için): örneği sonlandırın ve AMI'den yeni bir tane
başlatın. Bunu yaparken yeni bir anahtar çifti oluşturun.

"Özel anahtarı güvenli bir yerde sakla," dedi Priya. "Ve asla bir EC2 örneğinde değil."

Leo, `AWS_keys` etiketli masaüstü klasörüne baktı. Sonra Priya'ya. Sonra klasörü şifreli parola
yöneticisine taşıdı.

**Güvenlik Grupları: Örneğinizin Güvenlik Duvarı**

Bir EC2 örneği başladığında, bir **güvenlik grubuna** ihtiyaç duyar — ona hangi ağ trafiğinin
ulaşabileceğini ve hangi trafiği dışarı gönderebileceğini kontrol eden sanal bir güvenlik
duvarı.

Bir güvenlik grubunun iki kural kümesi vardır: **gelen** (içeri gelen trafik) ve **giden**
(dışarı giden trafik).

Varsayılan olarak, yeni bir güvenlik grubu tüm gelen trafiği engeller ve tüm giden trafiğe izin
verir. Belirli kaynaklara belirli portları açmak için gelen kuralları eklersiniz.

Nimbus web sunucusu için Priya şunu yapılandırdı:

- `0.0.0.0/0`'dan (tüm internet) TCP port 443'e (HTTPS) izin ver
- `0.0.0.0/0`'dan (tüm internet) TCP port 80'e (HTTP, uygulamada 443'e yönlendirilir) izin ver
- Yalnızca ofis IP adresinden TCP port 22'ye (SSH) izin ver — internetten değil

"Dur — ama SSH'i neden yalnızca ofis IP'siyle kısıtlayalım ki?" diye sordu Maya.

"Çünkü SSH tüm internete açıksa," dedi Priya, "otomatik botlar günde yirmi dört saat kimlik
bilgisi kombinasyonları deneyerek port 22'ye saldıracak. Günlüklerimiz başarısız denemelerle
dolacak. Ve SSH arka plan programının kendisinde bir güvenlik açığı olursa, dünyadaki her
saldırgan onu sömürmeyi deneyebilir."

"Ama ya Leo evden giriş yapması gerekirse?"

"VPN," dedi Priya.

Leo'nun zaten kurulu bir VPN'i vardı. Bu soruyu daha önce sorulmuş birinin ifadesine sahipti.

Veritabanı hâlâ uygulamayla aynı makinede yaşıyordu — ama Priya, öyle olmayacağı gün için ayrı
bir güvenlik grubu hazırladı: veritabanı portu yalnızca web sunucusunun güvenlik grubundan
gelen trafiğe açık — internetten değil, SSH'ten değil (doğrudan DB erişimi için), başka hiçbir
yerden değil. Bu arada, paylaşılan örneğin güvenlik grubunun veritabanı portunu internete hiç
ifşa etmediğinden emin oldu. Veritabanı, ona ihtiyaç duyan uygulama dışında her şeye görünmez
olacaktı.

Veritabanına doğrudan ulaşmak için bir saldırganın önce web sunucusunu ele geçirmesi
gerekirdi. Bu ilk savunma katmanıydı.

"Peki ikinci katman?" diye sordu Tom.

"Veritabanı için IAM kimlik doğrulaması. Ve aktarımda şifreleme."

İkisini de kurulum kontrol listesine ekledi.

**EC2 Örnek Meta Verileri ve IMDSv2**

Giriş içeriğinde nadiren açıklansa da, pratikte önemli olan bir EC2 güvenlik parçası daha var.

Bir uygulama bir EC2 örneğinde çalıştığında, örnek hakkında bilgi almak için
`http://169.254.169.254/latest/meta-data/` adresindeki özel bir dahili uç noktayı
sorgulayabilir: örnek kimliği, Bölge'si, erişilebilirlik alanı ve — kritik olarak — bağlı
herhangi bir IAM Rolü ile ilişkili geçici IAM kimlik bilgileri.

EC2 örneğindeki uygulamanın sabit kodlanmış kimlik bilgileri olmadan AWS hizmetlerini böyle
çağırır. Meta veri hizmetine sorar: "Şu anda hangi kimlik bilgilerini kullanmalıyım?" Meta veri
hizmeti, süresi dolan ve otomatik olarak döndürülen geçici kimlik bilgilerini döndürür.

Güvenlik sorunu: bu meta veri hizmetinin eski sürümleri (IMDSv1), örnekteki herhangi bir
süreçten gelen herhangi bir isteğe yanıt verirdi. Bir uygulamada sunucu tarafı istek sahteciliği
(SSRF) güvenlik açığı varsa — bir saldırganın sunucuya kendi seçtiği bir URL'yi getirtebildiği
bir hata — saldırgan o güvenlik açığını
`http://169.254.169.254/latest/meta-data/iam/security-credentials/` adresini getirmek ve
örneğin IAM kimlik bilgilerini almak için kullanabilirdi.

Bu saldırı gerçek ihlallerde kullanılmıştır.

**IMDSv2** (Instance Metadata Service version 2), bunu meta veri hizmeti yanıt vermeden önce bir
oturum belirteci isteyerek düzeltir. Belirteç bir PUT isteği aracılığıyla elde edilir.
Tipik olarak GET istekleri kullanan SSRF saldırıları, PUT adımını tamamlayamaz — bu yüzden
belirteci alamazlar ve meta veri döndürülmez.

"IMDSv2'yi etkinleştirmeli miyiz?" diye sordu Leo.

"Artık yeni örnekler için varsayılan," dedi Priya. "Ama mevcut örnekler için, açıkça katılmanız
gerekir."

O öğleden sonra mevcut tüm Nimbus örneklerinde onu etkinleştirdi.

**Örnek Yaşam Döngüsü: Sonsuza Kadar Değil**

Bu, birçok yeni başlayanın gözden kaçırdığı bir şey.

EC2 örnekleri varsayılan olarak kalıcı değildir. Bir örneği durdurduğunuzda, hesaplama kaynağı
serbest bırakılır. Onu tekrar başlattığınızda, farklı fiziksel donanımda çalışabilir.
*Örneğin kendisinde* (root biriminde) saklanan herhangi bir veri, bir durdur/başlat döngüsünden
sağ çıkar — ama genel IP adresi değişir.

Bir örneği *sonlandırdığınızda*, o gitmiştir. Bağlı ayrı bir depolamanız yoksa (bunu Bölüm 6'da
ele alıyoruz), örnekteki herhangi bir veri kaybolur.

Bir EC2 örneğinin bulunabileceği dört durum:

**Beklemede (Pending)**: Örnek başlatılıyor. Donanım tahsis edilmiş ama önyükleme bitmemiş.

**Çalışıyor (Running)**: Örnek aktif ve erişilebilir. Onun için ödeme yapıyorsunuz. İlk önyüklemede, UserData betiğinin de çalıştığı an budur.

**Durduruluyor/Durduruldu (Stopping/Stopped)**: Örnek kapatılmış. EBS root birimi korunur.
Hesaplama için ödeme yapmıyorsunuz, ama bağlı EBS depolama için hâlâ ödüyorsunuz.

**Kapatılıyor/Sonlandırıldı (Shutting-down/Terminated)**: Örnek siliniyor. EBS birimlerini
kalıcı olacak şekilde yapılandırmadıysanız, verileri gitmiştir.

Bu "geçicilik" aslında bir hata değil, bir özelliktir. Sunucuları başlatabileceğiniz,
kullanabileceğiniz ve atabileceğiniz anlamına gelir. Yatay ölçeklemeyi mümkün kılar. Ama aynı
zamanda önemli veriyi asla EC2 örneğinin *kendisinde* saklamamanız gerektiği anlamına da gelir.

Peki o zaman veri nerede yaşar?

Ayrı depolamada. Buna sonraki iki bölümde geliyoruz.

Şunu merak ediyor olabilirsiniz: bir örnek her yeniden başladığında yeni bir IP adresi alıyorsa,
uygulamanız nasıl kararlı bir adres tutar? AWS'nin Elastic IP denen bir çözümü var — sahip
olduğunuz ve yeniden başlatmalardan sonra bile aynı kalan statik bir genel IP. Maliyet üzerine
bir not: Şubat 2024'ten bu yana, AWS her genel IPv4 adresi için küçük bir saatlik ücret alıyor
— Elastic IP'ler (bağlı olsun olmasın) ve örneklerdeki otomatik atanan genel IP'ler de dâhil.
Genel IPv4 artık ücretsiz değil; bu da örnekleri bir yük dengeleyicinin arkasında özel alt
ağlarda tutmak için bir neden daha.

Bir yük dengeleyicinin arkasındaki uygulamalar için — ki bu, herhangi bir üretim web uygulaması
için doğru mimaridir — Elastic IP'lere hiç ihtiyacınız yoktur. Kullanıcılar, yük
dengeleyicinin kararlı DNS adına bağlanır. Yük dengeleyici, VPC içindeki özel IP adresleri
aracılığıyla örneklere bağlanır. Örnekler gelip gidebilir, yeni IP'ler alabilir, ölçek
büyütüp küçültebilir — yük dengeleyici bunların hepsini şeffaf biçimde halleder. Elastic
IP'ler belirli kullanım senaryoları içindir: istemcilerin doğrudan IP ile bağlandığı bir
sunucu, kararlı bir adrese sahip bir bastion ana bilgisayarı, belirli bir nedenle bir yük
dengeleyicinin arkasında olmayan bir uygulama.

Leo başlangıçta Nimbus web sunucuları için Elastic IP'ler kullanmayı planladı. Priya, bir yük
dengeleyiciyle web sunucularının IP adreslerinin dış istemciler için alakasız olduğunu belirtti.
Yük dengeleyicinin kararlı DNS adı vardı. Arkasındaki örnekler tasarım gereği harcanabilirdi.

"Yani Elastic IP'ler kural için değil, istisna için," dedi Leo.

"Doğru," dedi Priya. "Ve birine uzandığını görürsen, mimarinin bunun yerine bir yük
dengeleyicisi olması gerekip gerekmediğini sor."

**"Elastik" Ne Demektir**

EC2'nin Elastic Compute Cloud'un kısaltması olduğunu söyledik. Peki onun elastik olan nesi?

İki şey:

**Dikey elastiklik**: Bir örneğin boyutunu değiştirebilirsiniz. Örneği durdurun,
`t3.micro`dan `t3.xlarge`a değiştirin, yeniden başlatın. Daha fazla CPU ve bellek, aynı
uygulama, aynı kurulum.

**Yatay elastiklik**: Daha fazla örnek ekleyebilirsiniz. Tek bir büyük sunucu yerine, bir yük
dengeleyicinin arkasında on orta sunucu çalıştırın. Trafik düştüğünde, örnekleri kaldırın ve
onlar için ödeme yapmayı bırakın.

Her iki yaklaşım da "tek sunucu, çok fazla trafik" sorununu çözer. Farklı ödünleşimleri vardır;
bunları Bölüm 7'de hikâyeye Auto Scaling eklediğimizde inceliyoruz.

Kilit içgörü: EC2 ile, hesaplama gücü *satın aldığınız* bir şey değil, *ayarladığınız* bir
şeydir. Daha fazlasına mı ihtiyacınız var? Düğmeyi yukarı çevirin. Daha azına mı? Aşağı çevirin.
Buna göre ödeyin.

Maya örnek türü tablosuna baktı. "Sunucuyu sadece daha büyük yapabiliyorsak, neden on orta
boyla uğraşalım?"

"Çünkü," dedi Leo, "tek bir büyük sunucu hâlâ tek bir sunucudur. Çökerse, her şey çöker. On
orta sunucu, biri arızalanabilir ve dokuzu çalışmaya devam eder demektir."

"Ve," diye ekledi Priya, "bir sunucuyu yeniden başlatmadan büyütemezsin. On küçük olan,
çalışanlara dokunmadan daha fazla ekleyebileceğin anlamına gelir."

Tom çoktan defterine "yeniden başlatma = kesinti süresi" yazmıştı.

## Güçlü Yönler ve Sınırlamalar

**EC2 neden güçlü**:

- Tam kontrol. İşletim sistemini, yazılımı, yapılandırmayı siz seçersiniz. O sizin
  bilgisayarınız.
- Esnek boyutlandırma. Her kullanım senaryosunda yüzlerce örnek türü.
- Yönetilecek donanım yok. AWS fiziksel katmanı halleder.
- Amazon Linux, Windows ve Ubuntu AMI'leri için 60 saniyelik bir minimumla saniye başına
  faturalandırma. (RHEL ve SUSE gibi bazı ticari Linux AMI'leri hâlâ saat başına faturalandırır
  — AMI'nin faturalandırma şartlarını kontrol edin.) Örneği durdurursunuz, ödeme yapmayı
  bırakırsınız.
- Her şeyle çalışır. EC2, diğer çoğu AWS hizmetinin üzerine inşa edildiği temeldir.
- Birden fazla fiyatlandırma modeli (On-Demand, Reserved, Spot), öngörülebilir veya esnek iş
  yükleri için önemli maliyet optimizasyonuna olanak tanır — Bölüm 27'de ayrıntılı olarak
  ele alınır.

**İşin karmaşıklaştığı yer**:

- İşletim sistemini yamalamaktan ve güncellemekten siz sorumlusunuz. (Paylaşılan Sorumluluk
  Modeli — bu, sizin olan "bulut içi" kısımdır.)
- İşletim sistemi yamalaması isteğe bağlı değildir. Yamalanmamış EC2 örnekleri, bulut
  ihlallerindeki en yaygın saldırı vektörlerinden biridir. AWS Systems Manager Patch Manager
  bunu otomatikleştirebilir — ama onu yapılandırmalı ve izlemelisiniz.
- EC2'yi ölçekte yönetmek, potansiyel olarak binlerce makine genelinde örnek durumunu,
  AMI'leri, güvenlik yamalarını ve yaşam döngüsünü yönetmek demektir. Bu operasyonel yüktür.
- EC2 her şey için doğru cevap değildir. Sık çalışmayan olay güdümlü kod için, Lambda
  (Bölüm 20) daha ucuz ve daha basittir. Konteynerleştirilmiş iş yükleri için, ECS ve EKS
  (Bölüm 21) daha iyi kaynak verimliliği sunar.
- Kullanılmayan örnekler hâlâ para tutar. Bir örneği durdurursanız, hesaplama için ödeme
  yapmayı bırakırsınız — ama bağlı depolamanız varsa, onun için hâlâ ödersiniz.

**EC2-ne-zaman-kullanılmamalı yargı kararı**: EC2 size azami kontrol verir — ama kontrolün bir
operasyonel maliyeti vardır. Çalıştırdığınız her EC2 örneği, yamalamanız, izlemeniz ve eninde
sonunda değiştirmeniz gereken bir şeydir. Sık çalışmayan uygulamalar için (Lambda daha ucuz),
onlarca ya da yüzlerce örneğe yatay ölçeklenmesi gereken uygulamalar için (konteynerler daha
verimli), ya da veritabanları ve diğer yönetilen iş yükleri için (RDS, ElastiCache), tamamen
yönetilen hizmetler, mütevazı bir maliyet primi karşılığında önemli operasyonel yükü ortadan
kaldırır. EC2, sağladığı kontrole ihtiyaç duyduğunuzda doğru seçimdir — varsayılan olarak değil.

Priya'nın bir kuralı vardı: "İhtiyacımız olanı yapan bir yönetilen hizmetten memnun olacaksak,
yönetilen hizmeti kullan. Yönetilen seçenek yoksa ya da uymuyorsa EC2 kullan."

Leo başlangıçta buna karşı çıktı. "Ama EC2 bize daha fazla seçenek verir."

"Seçenekler yüktür," dedi Priya. "Her seçeneğe ihtiyacımız yok. Güvenilir biçimde bakımı
yapılan doğru yapılandırmaya ihtiyacımız var."

**EC2 Yerleştirme Grupları: Örneklerin Nereye İndiğini Kontrol Etmek**

EC2, örneğinizin ne olduğu üzerinde kontrol verir — boyutu, işletim sistemi, yapılandırması.
Ayrıca, **yerleştirme grupları (placement groups)** denen bir özellik aracılığıyla fiziksel
olarak *nereye* indiği üzerinde de sınırlı kontrol verir.

Varsayılan olarak, AWS kullanılabilirliği en üst düzeye çıkarmak için örnekleri fiziksel donanım
genelinde yayar. Ama belirli iş yükleri için bu varsayılanı geçersiz kılmak istersiniz — ya
örnekleri birbirine yaklaştırmak ya da birbirinden uzak kalmalarını garanti etmek için.

Üç yerleştirme grubu türü:

**Cluster (Küme)**: Örnekleri tek bir Erişilebilirlik Bölgesi içinde, tipik olarak aynı
fiziksel rafta ya da bitişik donanımda birbirine yakın paketler. Sonuç, gruptaki örnekler
arasında en düşük ağ gecikmesi ve en yüksek ağ verimidir — örnekler arasında 10 Gbps ya da daha
yüksek ağ verimi (bunu, yerleştirme gruplarından bağımsız bir örnek başına ağ özelliği olan
Enhanced Networking/ENA ile karıştırmayın). Bu, HPC (yüksek performanslı hesaplama), büyük
ölçekli ML eğitim işleri ve örneklerin birbirine çok zaman harcayarak veri gönderdiği sıkı
bağlı paralel iş yükleri için seçimdir. Ödünleşim kullanılabilirliktir: altta yatan donanım
segmenti arızalanırsa, kümedeki tüm örnekler aynı anda etkilenebilir.

**Partition (Bölme)**: Örnekleri mantıksal bölmelere ayırır; her bölme kendi donanım kümesinde
oturur — ayrı raflar, ayrı güç, ayrı ağ switch'leri. Bir bölme içindeki örnekler birbiriyle
donanım paylaşır, ama bölmeler asla diğer bölmelerle donanım paylaşmaz. Bu tasarım, bir donanım
arızasının patlama yarıçapını sınırlar: bir rafın çökmesi bir bölmeyi etkiler ama diğerlerini
etkilemez. Bölme yerleştirme grupları, büyük dağıtık ve çoğaltılmış iş yükleri için inşa
edilmiştir — Apache Hadoop, Apache Cassandra, Apache Kafka — burada, raf düzeyindeki bir
arızanın tüm kümenizi çökertmeyeceği kadar yeterli arıza yalıtımı istersiniz.

**Spread (Yayma)**: Her örneği tamamen ayrı altta yatan donanıma yerleştirir. Örnekler
arasında azami yalıtım. Asla bir fiziksel ana bilgisayarı paylaşmaması gereken (çünkü tek bir
donanım arızası asla birden fazlasını çökertmemeli) beş kritik uygulama örneğiniz varsa, cevap
Spread'tir. Sınır: **Erişilebilirlik Bölgesi başına yerleştirme grubu başına 7 örnek**. Spread,
büyük filolar için değil, ortak konumlanmayı kaldıramayan az sayıda kritik örnek için
tasarlanmıştır.

"Yani Cluster hız için, Spread yalıtım için ve Partition hem biraz kümeleme hem biraz yalıtım
gerektiren dağıtık sistemler için mi?" diye sordu Maya.

"Yeterince yakın," dedi Priya. "Cluster: örnekler arasında düşük gecikme, tek büyük risk.
Spread: azami yalıtım, AZ başına yedi sıkı sınır. Partition: büyük dağıtık sistemler için
yapılandırılmış yalıtım — her örneğin hangi bölmeye gideceğini sen kontrol edersin."

Nimbus'un mevcut mimarisi için, bunların hiçbiri henüz geçerli değildi. Ama var olduklarını
bilmek, onlara ne zaman uzanılacağını bilmek demekti — ve daha acil olarak, "düğümler arası
düşük gecikmeye ihtiyaç duyan HPC iş yükleri" hakkındaki bir sınav sorusunun gerçekte ne
istediğini bilmek.

## Özet

Kazara başlatılan bir örnek, hiçbir zaman bir üretim sunucusu olamayacaktı. EC2'yi düzgünce
anlamak, sadece kapasite sorununu çözmekle kalmadı — neredeyse sonraki her bölümde çıkacak yeni
bir kavramlar dizisi tanıttı. Örnek türleri, AMI'ler, anahtar çiftleri, güvenlik grupları ve
doğru boyutlandırma EC2 ıvır zıvırı değildir; kitabın geri kalanının üzerine inşa edildiği
sözlüktür. Onları burada öğrenin ve diğer her şey daha anlamlı hâle gelir.

- Bir **EC2 örneği**, AWS'de kiraladığınız bir sanal makinedir. Örnek türleri kullanım
  senaryosuna göre organize edilir: genel amaçlı, hesaplama optimize, bellek optimize, depolama
  optimize. Doğru aileyi seçin ve hayal edilen en kötü duruma değil, gerçek iş yükü metriklerine
  göre doğru boyutlandırın.
- Bir **AMI** (Amazon Machine Image), örneğinizin işletim sistemi ve başlangıç yapılandırması
  için şablondur. Özel AMI'ler tutarlı, tekrarlanabilir dağıtımları mümkün kılar.
- **Anahtar çiftleri**, EC2 örneklerine erişmenin güvenli yoludur. **Güvenlik grupları**,
  örneğinizin güvenlik duvarıdır — SSH'i bilinen IP'lere kısıtlayın ve veritabanı portlarını
  yalnızca uygulamanın güvenlik grubuna kilitleyin.
- **IMDSv2**, örnek meta veri hizmetinden SSRF tabanlı kimlik bilgisi hırsızlığına karşı
  korunmak için tüm örneklerde etkinleştirilmelidir.
- EC2 örnekleri varsayılan olarak kalıcı değildir. Sonlandırılan örnekler yerel verilerini
  kaybeder — önemli veriyi örnek diskinde değil, S3 ya da EBS'de saklayın.

## Sınav İpuçları

*SAA-C03 Alan 3 — Görev 3.2 (yüksek performanslı hesaplama çözümleri)*

- **EC2 için Paylaşılan Sorumluluk**: İşletim sistemini yamalamaktan siz sorumlusunuz. AWS,
  fiziksel donanımın ve hipervizörün bakımını yapar. Bu sık test edilen bir ayrımdır.
- **Örnek aileleri senaryo soruları için önemlidir.** Bir senaryo yüksek bellek gereksinimlerinden
  (bellek içi önbellek, SAP HANA) söz ediyorsa, cevap muhtemelen bellek optimize bir örneği
  içerir. Toplu işleme ya da HPC'den söz ediyorsa, hesaplama optimize.
- **Durdurmak ≠ Sonlandırmak.** Bir örneği durdurmak onu korur (yeniden başlatabilirsiniz).
  Sonlandırmak onu siler. Sınav senaryoları bu ayrımı bilip bilmediğinizi test eder.
- **Genel IP yeniden başlatmada değişir.** Uygulamanız kararlı bir IP adresine ihtiyaç
  duyuyorsa, bir **Elastic IP** kullanın — hesabınızla ilişkili kalan statik bir genel IP.
  Şubat 2024'ten bu yana, AWS her genel IPv4 adresini saatlik faturalandırır — Elastic IP'ler
  (bağlı olsun olmasın) ve otomatik atanan genel IP'ler de dâhil.
- **On-Demand, Reserved ve Spot** fiyatlandırma modelleri Alan 4'te yoğun test edilir. Onları
  Bölüm 27'de ele alıyoruz. Şimdilik, On-Demand'in taahhütsüz, saniye başına ödeme anlamına
  geldiğini bilin.
- **Güvenlik grupları durum bilgisidir (stateful).** Bir portta gelen trafiğe izin verirseniz,
  dönüş trafiğine açık bir giden kuralı olmadan otomatik olarak izin verilir. NACL'ler (Bölüm
  15'te ele alınır) durum bilgisizdir (stateless) — hem gelen hem giden kurallar gerektirir.
- **Yerleştirme Grupları:** Cluster = örnekler arasında en düşük gecikme (HPC, ML eğitimi — ama
  grup için tek-arıza-noktası riski); Partition = bölme başına arıza yalıtımıyla dağıtık
  sistemler (Hadoop, Kafka, Cassandra); Spread = azami örnek yalıtımı, AZ başına en fazla 7.
  Sınav soru kalıbı: "düğümler arasında azami ağ verimine ihtiyaç duyan sıkı bağlı HPC iş yükü"
  → Cluster yerleştirme grubu.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Kendi kelimelerinizle: Bir EC2 örneği nedir? Bir AMI nedir? Aralarındaki ilişki nedir?

*(İpucu: Tarif benzetmesini düşünün — tarif ne, yemek ne?)*

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirket, yüksek trafikli bir web uygulaması dağıtıyor. Uygulama, CPU yoğun olan
karmaşık filtreleme mantığıyla ürün kataloğu aramalarını işliyor. Ekip, indirim etkinlikleri
sırasında önemli trafik yükselmeleri bekliyor. Doğru EC2 örnek türünü seçtiklerinden ve trafik
patlamalarına hazır olduklarından emin olmak istiyorlar.

Aşağıdaki seçim kombinasyonlarından HANGİSİ gereksinimlerini EN İYİ şekilde karşılar?

A) Tutarlı performans sağlamak için sabit sayıda bellek optimize örnek  
B) Trafik yükselmelerini kaldırmak için Auto Scaling ile hesaplama optimize örnekler  
C) Tek bir büyük örnek boyutuyla genel amaçlı örnekler  
D) Depolama optimize örnekler, çünkü ürün kataloğu hızlı disk erişimi gerektirir

**İpucu 1**: İş yükü "CPU yoğun" olarak tarif ediliyor. Hangi örnek ailesi CPU için optimize
edilmiştir?

**İpucu 2**: Senaryo "indirim etkinlikleri sırasında trafik yükselmelerinden" söz ediyor. Sabit
sayıda örnek, değişken trafiği verimli biçimde kaldıramaz. Hangi AWS özelliği bunu halleder?

**İpucu 3**: Hesaplama optimize örnekler CPU ağır işi kaldırır. Auto Scaling, talebe göre örnek
ekler ve kaldırır. Birlikte her iki gereksinimi de yanıtlarlar.

**Cevap**: B

**Açıklama**: Hesaplama optimize örnekler (`c` ailesi gibi), CPU yoğun iş yükleri için dolar
başına daha fazla CPU sağlar. Auto Scaling, örnek sayısını yüke göre otomatik ayarlar —
indirim etkinlikleri sırasında örnek ekleyerek, trafik normale döndüğünde kaldırarak. Bu
kombinasyon hem performansı hem maliyeti optimize eder.

**Neden A değil?** Bellek optimize örnekler, büyük miktarda RAM'e ihtiyaç duyan iş yükleri
(veritabanları, bellek içi önbellekler) için tasarlanmıştır. Bu CPU sınırlı bir iş yüküdür. Ve
sabit örnek sayıları ya aşırı kaynak ayırma (israf) ya da yetersiz kaynak ayırma (arıza)
demektir.

**Neden C değil?** Genel amaçlı örnekler denge için bir miktar CPU verimliliğinden taviz verir.
Bilinen bir CPU yoğun iş yükü için, hesaplama optimize daha uygundur. Ve tek bir büyük örnek
tek bir arıza noktasıdır.

**Neden D değil?** Darboğaz CPU'dur, disk G/Ç'si değil. Depolama optimize örnekler, yerel
depolamaya çok yüksek verime ihtiyaç duyan iş yükleri için tasarlanmıştır.

*SAA-C03 Alan 3 — Görev 3.2*

**Alıştırma 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus şu anda tüm uygulama için tek bir `t3.micro` EC2 örneği çalıştırıyor. Ekibin karar
vermesi gerekiyor: daha büyük bir örneğe (`t3.2xlarge`) yükseltmek mi, yoksa bir yük
dengeleyicinin arkasına daha fazla `t3.micro` örneği eklemek mi?

Ödünleşimleri tek tek ele alın. Her yaklaşımın avantajları nelerdir? Karar vermek için hangi
soruları sorardınız? (İpucu: tek arıza noktalarını, maliyeti, dağıtım karmaşıklığını ve bakım
sırasında ne olduğunu düşünün.)

*(Tek bir doğru cevap yoktur. Bu, dikey ve yatay ölçekleme arasında akıl yürütmekle ilgilidir.)*

## Jenerik Sonrası Sahne

Leo öğleden sonrayı küçültmeyi yürüterek geçirdi. Tom'un CloudWatch'tan topladığı doğru
boyutlandırma verilerini kullanarak `t3.large`tan bir `t3.small`a indi. CPU normal yük sırasında
yaklaşık %12'de oturdu. Sayfalar bir saniyenin altında yüklendi.

Tom AWS faturasının gerçek zamanlı güncellenmesini izledi. t3.small, orijinal micro'dan saatte
hâlâ kabaca iki kat daha pahalıydı — ama fazla ödedikleri t3.large'ın üçte biri. Bir not aldı:
*önceki t3.large'a kıyasla aylık 40 dolar tasarruf. Doğru karar.*

Maya ekranında başka bir şeye bakıyordu.

"Leo," dedi. "Sen örneği yeniden boyutlandırırken, web sitesi on iki dakika boyunca çöktü."

Leo başını kaldırdı.

"İki yüz karşılanmamış sipariş kuyruğumuz vardı."

Ekrana baktı. Sonra tavana. Sonra tekrar ekrana.

"Görsellerimiz için bir şeye ihtiyacımız var," dedi, konuyu hafifçe değiştirerek. "Şu anda,
yüklenen menü fotoğrafları doğrudan sunucuya kaydediliyor. Örneği yeniden boyutlandırır ya da
yeniden başlatırsak, onları kaybeder miyiz?"

Priya cevabı çoktan biliyordu.

Bir sonraki bölümde: işaret edilecek bir sabit disk olmadığında dosyaların nerede yaşadığı.
