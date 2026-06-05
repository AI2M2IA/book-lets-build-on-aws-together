# Bölüm 4: Başka Birinin Binasına Ait Bir Bilgisayar

Nimbus uygulaması, Tom’un dizüstü bilgisayarında çalışıyordu.

Bu, yatırımcılara bir demo göstermek için sorun değildi. Maya “başlat”a bastığında ve 200 restoranın ilk haftasında kaydolmasıyla sorun değildi. Tom’un dizüstü bilgisayarı artık gerçek siparişleri, gerçek menüleri ve gerçek müşterileri işliyor – Tom’un masasının altında, ofis Wi-Fi’si üzerinden çalışan, aynı zamanda bir ısıtıcı ve bir kahve makinesini besleyen bir güç kablosuna bağlıydı.

“Bir sunucuya ihtiyacımız var,” dedi Maya. “Gerçek bir tane. Diğerinin altında çalıştığı bir yerde değil.”

Tom, dizüstü bilgisayarını kontrol etti. Fan odanın diğer ucundan duyuluyordu.

İşte bu noktada, bir bilgisayar kiralamanın ne anlama geldiğini anlamaya başladılar.

**Hiç Açıklanmayan Soyutlama**

İşlemlerinin “bulutta çalışıyor” dediğinde, genellikle sanal bir makineye çalıştığını kastediyorlar – fiziksel olarak var olmayan, ancak her türlüyle aynı şekilde davranan bir bilgisayar.

İşte mekanizma.

Bir AWS veri merkezinde fiziksel bir sunucu, çok sayıda kaynağa sahiptir: CPU çekirdekleri, bellek, disk ve ağ bant genişliği. AWS, bu fiziksel sunucuyu yazılım olan **hipervizör** ile bölerek, hipervizör her bir sanal makineyi kendi ayrı CPU, belleği ve diski olan görünümünü oluşturmasına olanak tanır – ancak temel donanımı paylaşır.

Bu sanal makinelerin her biri, AWS tarafından **EC2 örneği** olarak adlandırılır.

EC2, Elastic Compute Cloud anlamına gelir. “Elastic” kısmı önemlidir ve bunu daha sonra ele alacağız. Şu anda, bir EC2 örneği, saatlik olarak kiralayabileceğiniz bir bilgisayardır. Bir işletim sistemi, bir ağ bağlantısı ve işlem gücüne sahiptir. Uygulamanızı fiziksel bir sunucu gibi çalıştırır.

Analoji: büyük bir binadaki bir daire kiralamak ile bir ev satın almak arasındaki fark.

Mülk sahibi (AWS), fiziksel yapıyı, tesisatı, elektrik sistemini, güvenliği korur. Siz bir birim alırsınız. İstediğiniz gibi mobilyala. Aylık (veya saatlik) ödersiniz. Daha fazla alan ihtiyacınız varsa, daha büyük bir birime taşırırsınız. Taşınmayı bıraktığınızda ödeme bırakırsınız.

**Özel Bir Örnek Seçme: Boyut Önemlidir**

Tüm EC2 örnekleri aynı değildir. AWS, performanslarını optimize etmek için onlar binlerce farklı türde örneği sunar.

**Genel amaçlı** (örn. `t3`, `m6i`): Dengeli CPU ve bellek. Çoğu web uygulaması için iyi bir varsayılan seçimdir.

**Hesaplama odaklı** (örn. `c7g`): Belleğe göre daha fazla CPU. Video kodlaması, bilimsel modelleme, toplu işleme için iyidir.

**Bellek odaklı** (örn. `r7i`): CPU’ya göre daha fazla bellek. Veritabanları, önbellekler, yerleşik analitik için iyidir.

**Depolama odaklı** (örn. `i3`): Çok hızlı yerel depolama. Çok hızlı disk I/O gerektiren veri yoğun iş yükleri için iyidir.

**Hızlandırılmış hesaplama** (örn. `p4`): GPU’lar eklenmiştir. Makine öğrenimi eğitimi ve grafik oluşturma için iyidir.

Her aile boyutu vardır. Bir `t3.micro` 2 sanal CPU ve 1 GB bellek içerir. Bir `t3.xlarge` 4 sanal CPU ve 16 GB bellek içerir. İş yükü için doğru boyutu seçin.

Leo, bir `t3.micro` seçmişti.

“Bir `t3.micro` kaç kullanıcıyı kaldırabilir?” diye sordu Tom.

“Uygulamaya bağlı,” dedi Leo. “Ama resim yüklemeleri ve veritabanı sorguları çalıştıran 100 eşzamanlı kullanıcı için değil.”

Tom, “t3.micro” yazdı ve yanına üzgün bir yüz çizdi.

**AMI: Makinenizin Başlangıç Durumu**

Bir EC2 örneğini başlatmadan önce, işletim sistemini ve başlangıç yapılandırmasını seçersiniz. AWS’de, bu bir **Amazon Makine Görüntüsü** (AMI) olarak adlandırılır.

Bir AMI bir şablondur. Aşağıdakileri tanımlar:

- İşletim sistemi (Amazon Linux, Ubuntu, Windows Server, vb.)
- Ön yüklenmiş yazılım
- Başlangıç disk durumu

Bir örneği bir AMI’den başlatırsanız, AWS, bu şablonun yeni bir kopyasını sizin için oluşturur. Ayrıca kendi AMI’lerinizi oluşturabilirsiniz - sunucuyu istediğiniz şekilde yapılandırdıysanız, durumu "kaydedebilir" ve aynı sunucuları hızlı bir şekilde kullanarak bu AMI’yi kullanabilirsiniz. Bu, tutarlı ortamları ölçekte uygulamak için kullanılır.

Bir AMI’yi bir tarif olarak düşünün. Tarif, yemeği tanımlar. Yemeği takip ettiğinizde aynı yemeği elde edersiniz. Yemeği kalıcı olarak değiştirmek istiyorsanız, tarifi güncelleyin.

**Anahtar Çiftler: Bir Sunucuya Erişmenin Doğru Yolu**

Son bölümde “Admin123” faciası mıydı?

Bir EC2 örneğine giriş yapmanın doğru yolu, **anahtar çifti** kullanmaktır.

Bir anahtar çifti, bir kriptografik çift: AWS sunucusunda depolanan bir halka anahtarı ve gizli anahtar (sizin tarafınızdan indirilip saklanan bir dosya). Giriş yapmak için, SSH'yi (güvenli bir protokol) özel anahtarınızla kullanırsınız. Bir şifre yok. Özel anahtarınızı kaybederseniz erişiminizi kaybedersiniz. SSH için "şifremi unuttum" yoktur.

Bu önemli çünkü anahtar çiftleri:

- Sizin benzersizinizdir
- Tahmin edilemez kriptografik bir şekilde
- AWS tarafından depolanmaz (siz özel anahtarı saklarsınız)
- İptal edilebilir (sunucudan anahtarı siler, yeni bir çift oluşturursunuz)

Priya, Nimbus sunucusunda anahtar tabanlı erişimi zaten kurmuştu. “Admin123” sunucusu devre dışı bırakılmıştı. Bu konuda kimse üzülmedi.

**Örnek Döngüsü: Sonsuza Kadar Değil**

Bu bölüm, AWS’e yeni başlayanlar için bir kitaptaki bölmedir.

Bu, birçok yeni başlayanın kaçırdığı bir şeydir.

EC2 örnekleri varsayılan olarak kalıcı değildir. Bir örneği durdurduğunuzda, işlem kaynağı serbest bırakılır. Tekrar başladığınızda, farklı fiziksel donanımda çalışabilir. Bir örneğin kendisinde depolanan herhangi bir veri (kök hacminin üzerinde) bir durdurma/başlatma döngüsünü ayırmaz — ancak halka açık IP adresi değişir.

Bir örneği *sonlandırdığınızda*, kaybolur. Ayrı depolama eklenmediği takdirde (6. Bölüm’de ele alıyoruz), örneğe bağlı herhangi bir veri kaybolur.

Bu “geçicilik”, aslında bir hata değildir. Sunucuları, bunları kullanıp atmayı sağlar. Yatay ölçeklemeyi mümkün kılar. Ancak, önemli verileri *örnek* üzerinde depolamamanız gerektiğinin de farkında olmalısınız.

O zaman veri nerede yaşar?

Ayrı depolama içinde. Bunu bir sonraki iki bölüm’de ele alacağız.

**“Esnek” Ne Anlama Gelir?**

EC2’nin “Elastic Compute Cloud” olduğu söyleniyor. Bu ne anlama geliyor?

İki şey:

**Yatay esneklik**: Bir örneğin boyutunu değiştirebilirsiniz. Örneği durdurun, `t3.micro`’dan `t3.xlarge`’a değiştirin, yeniden başlatın. Daha fazla CPU ve bellek, aynı uygulama, aynı kurulum.

**Dikey esneklik**: Daha fazla örnek ekleyebilirsiniz. Bir büyük sunucu yerine, trafiğin düşmesi durumunda bir yük dengeleyici arkasına on tane orta örnek çalıştırabilirsiniz. Trafik düştüğünde örnekleri kaldırıp ödeme yapmayı bırakın.

Her iki yaklaşım da “bir sunucu, çok fazla trafik” sorununu çözüyor. Farklı ödünleşimleri vardır, bunları 7. Bölüm’de Auto Scaling’i hikayeye eklediğimizde keşfedeceğiz.

Temel nokta: EC2 ile, işlem gücü, bir şeyleri *artırmanız* değil, *dönerek* ayarlamanızdır. Daha fazlasına ihtiyacınız var? Dayı artırın. Daha azına ihtiyacınız var? Dayı azaltın. Buna göre ödeme yapın.

## Güçlü Yönler ve Sınırlamalar

**EC2’nin Güçlü Olduğu Nedenler**:

- Tam kontrol. İşletim sistemini, yazılımı, yapılandırmayı siz seçersiniz. Kendi bilgisayarınızdır.
- Esnek boyutlandırma. Her kullanım durumu için yüzlerce örnek türü.
- Donanım yönetimi gerekmez. AWS fiziksel katmanı yönetir.
- Birim başına ödeme (çoğu örnek türü için). Örneği durdurursunuz, ödeme yapmayı bırakırsınız.
- Her şeyle çalışır. EC2, çoğu AWS hizmetinin üzerine inşa edildiği temeldir.

**Nerede Karmaşık Hale Gelir?**

- İşletim sistemini yamalamak ve güncellemek sizin sorumluluğunuzdadır. (Ortak Sorumluluk Modeli — bulutun sizin tarafınızdan olduğu kısım).
- EC2’yi ölçeklendirmek, örnek durumlarını, AMI’leri, güvenlik yamalarını ve potansiyel olarak binlerce makinede yaşam döngüsünü yönetmek anlamına gelir. Bu operasyonel bir yük oluşturur.
- EC2 her şey için doğru cevap değildir. Nadiren çalışan olay odaklı kod için Lambda (20. Bölüm), daha ucuz ve basittir. Kapasitör tabanlı iş yükleri için ECS ve EKS (21. Bölüm), daha iyi kaynak verimliliği sunar.
- Kullanılmayan örnekler hala para harcatmanıza neden olur. Bir örneği durdurursanız, işlem için ödeme yapmayı bırakırsınız — ancak depolama eklenirse, hala ödeme yaparsınız.

## Özet

- Bir **EC2 örneği**, AWS’de kiraladığınız bir sanal makinedir. İşletim sistemi, ağ erişimi ve işlem kaynakları vardır.
- Örnek türleri kullanım durumu olarak düzenlenir: genel amaçlı, hesaplama optimize edilmiş, bellek optimize edilmiş, depolama optimize edilmiş, hızlandırılmış hesaplama. Doğru aileyi ve boyutu iş yükünüz için seçin.
- Bir **AMI** (Amazon Makine Görüntüsü), örneğinizin işletim sistemi ve başlangıç yapılandırması için şablonudur. Özel AMI’ler, tutarlı, tekrarlanabilir dağıtımlar sağlar.
- **Anahtar çiftleri**, EC2 örneklerine güvenli bir şekilde erişmenin yolu. Parola yok.
- EC2 örnekleri varsayılan olarak kalıcı değildir. Sonlandırılan örnekler verilerini kaybeder. Önemli verileri ayrı depolama hizmetlerinde saklayın.
- “Esnek” olmak, işlem gücünü yukarı ve aşağı ölçekleme anlamına gelir — hem dikey (daha büyük örnekler) hem de yatay (daha fazla örnek).

## Sınav İpuçları

*SAA-C03 Alan 3 — Görev 3.2 (yüksek performanslı hesaplama çözümleri)*

- **EC2 için Ortak Sorumluluk**: İşletim sistemini yamalamanız gerekir. AWS fiziksel donanımı ve hipervizörü korur. Bu sık test edilen bir ayrılıktır.
- **Örnek aileleri, senaryo sorularında önemlidir**. Bir senaryo yüksek bellek gereksinimlerini (bellek önbelleği, SAP HANA) belirtiyorsa, yanıt muhtemelen bellek optimize edilmiş bir örnek anlamına gelir. Yüksek hacimli işleme veya HPC’yi belirtiyorsa, hesaplama optimize edilmiş.
- **Durdurmak ≠ Sonlandırmak**. Bir örneği durdurmak, onu korur (yeniden başlatabilirsiniz). Sonlandırmak siler. Sınav senaryoları, bu ayrımı bildiğinizden emin olduğunuzu test eder.
- **Halka açık IP, yeniden başlatıldığında değişir**. Uygulamanızın kararlı bir IP adresi gerekiyorsa, bir Elastic IP — hesabınızla ilişkilendirilen ve kalıcı kalan halka açık bir IP — kullanın. Kullanmadığınız takdirde para ödersiniz.
- **Talep Üzerinde, Rezervasyon ve Spot** fiyatlandırma modelleri yoğun olarak test edilir. Bunu 27. Bölüm’de ele alıyoruz. Şimdilik, Talep Üzerinde, ödeme ikinci başına olduğu anlamına gelir ve hiçbir taahhüt yoktur.

## Uygulama

**Uygulama 1 — Hatırlama**

Kendi kelimelerinizde: Bir EC2 örneği nedir? Bir AMI nedir? Aralarındaki ilişki nedir?

*(İpucu: Bir tarif örneği analoğu — ne bir tarif, ne de yeme?)*

**Egzersiz 2 — Sınav Uygulaması**

*Senaryo*: Bir şirket, yüksek trafikli bir web uygulamasını devreye sokuyor. Uygulama, karmaşık filtreleme mantığıyla CPU yoğun ürün katalog aramalarını işliyor. Takım, satış etkinlikleri sırasında önemli trafik artışlarını bekliyor. Doğru EC2 örneği türünü seçmelerini ve trafik ani yükselmelerine hazırlanmalarını sağlamak istiyor.

Hangi seçim kombinasyonu onların gereksinimlerini en iyi şekilde karşılıyor?

A) Tutarlı performans için sabit sayıda bellek optimizasyonlu örnekler
B) Trafik ani yükselmelerini yönetmek için Auto Scaling ile birlikte compute optimizasyonlu örnekler
C) Tek bir büyük örnek boyutu ile genel amaçlı örnekler
D) Ürün kataloğunun hızlı disk erişimi gerektirmesi nedeniyle depolama optimizasyonlu örnekler

**İpuçları 1**: Yük, "CPU yoğun" olarak tanımlanıyor. Hangi örnek ailesi CPU için optimize edilmiştir?

**İpuçları 2**: Senaryo, "satış etkinlikleri sırasında trafik ani yükselmelerinden" bahsediyor. Sabit sayıda örnek, değişken trafik için verimli bir şekilde çalışmayacaktır. Hangi AWS özelliği bu konuda yardımcı olur?

**İpuçları 3**: Compute optimizasyonlu örnekler, CPU yoğun iş yüklerini işler. Auto Scaling, talebe göre örneklerin sayısını artırır ve azaltır. Birlikte, her iki gereksinimi de karşılıyor.

**Cevap**: B

**Açıklama**: Compute optimizasyonlu örnekler (örneğin, `c` ailesi), CPU yoğun iş yükleri için CPU başına dolar cinsinden daha fazla CPU sağlar. Auto Scaling, yük doğrultusunda örnek sayısını otomatik olarak ayarlar - satış etkinlikleri sırasında örnek ekler, trafik normal haline döndüğünde örnekleri kaldırır. Bu kombinasyon, hem performansı hem de maliyeti optimize eder.

**Neden A?** Bellek optimizasyonlu örnekler, büyük miktarda RAM (veritabanları, önbelleğe alınmış veriler) gerektiren iş yükleri için tasarlanmıştır. Bu, bir CPU bağımlı iş yüküdür. Sabit örnek sayıları ise aşırı tedarik (kullanılmayan kaynak) veya yetersiz tedarik (başarısızlık) anlamına gelir.

**Neden C?** Genel amaçlı örnekler, CPU verimliliğinden biraz ödün vererek denge sağlar. Bilinen bir CPU yoğun iş yükü için, compute optimizasyonlu daha uygundur. Ayrıca, tek bir büyük örnek, tek bir arıza noktasıdır.

**Neden D?** Bottleneck CPU, disk I/O değildir. Depolama optimizasyonlu örnekler, yerel depolama için çok yüksek verim gerektiren iş yükleri için tasarlanmıştır.

*SAA-C03 Alan 3 — Görev 3.2*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus, uygulamanın tamamı için tek bir `t3.micro` EC2 örneği üzerinde çalışıyor. Takım, daha büyük bir örnek (`t3.2xlarge`) geçiş yapmak veya bir yük dengeleyici arkasına daha fazla `t3.micro` örneği eklemek konusunda karar vermelidir.

Artıları ve eksileri gözden geçirin. Her yaklaşının avantajları nelerdir? Karar vermek için hangi soruları sorardınız? (İpucu: tek arıza noktaları, maliyet, dağıtım karmaşıklığı ve bakım sırasında neler olduğu hakkında düşünün.)

(Tek doğru cevap yoktur. Bu, dikey ölçekleme ve yatay ölçekleme arasındaki farkı anlamayı içerir.)

**Ekran Sonrası Sahnesi**

Leo, öğleden sonra sunucuyu yeniden boyutattı. `t3.micro`'dan `t3.large`'a geçti. CPU %30'a düştü. Sayfalar bir saniyeden daha kısa sürede yüklendi.

Tom, yeni örneğin saat başına maliyetinin dört katı olduğunu AWS faturalamasının gerçek zamanlı olarak güncellenmesini izledi. Bir not aldı.

Maya, ekranda başka bir şeye bakıyordu.

"Leo," dedi. "Sen sunucuyu yeniden boyutatırken, web sitesi on iki dakika boyunca kapalı kaldı."

Leo yukarı baktı.

"İki yüz adet karşılanmamış sipariş kuyruğumuz vardı."

Ekrandı, ardından tavana baktı. Sonra tekrar ekrana baktı.

"Resimlerimiz için bir şeye ihtiyacımız var," dedi. "Şu anda, yüklenen menü fotoğrafları doğrudan sunucuda kaydediliyor. Örneği yeniden boyutlandırır veya sunucuyu yeniden başlatırız, bunları kaybeder miyiz?"

Priya zaten cevabı biliyordu.

Bir sonraki bölüm: bir sabit sürücüye işaret edemediğinde dosyaların nerede saklandığı.
