# Bölüm 18: Şeyler Arızalandığında

Bu bölüm arızalara—planlanmış, karşılanmış ve sonuç olarak kaçınılmaz olarak kabul edilmiş—düşünce tarzını ele alıyor. Belki de kitabın en önemli bölümü.

Nimbus sorunsuz çalışıyordu. Güvenlik katmanları yerleştirilmişti. İzleme aktifti. Trafik artıyordu.

Sonra Leo, Cuma gecesi saat 11:23'te bir Slack bildirimi aldı.

"us-east-1 Erişilebilirlik Bölgesi us-east-1b — donanım arızası — azaltılmış hizmet."

AWS konsolunu açtı. us-east-1b'deki EC2 örnekleri durum kontrolleri başarısız olduğunu gösteriyordu. Auto Scaling Grubu sağlıksız örnekleri tespit etmiş ve yerlerine değiştiriyordu—us-east-1b'de.

Başarısız olan bölgede.

Yeni örnekler de başlamadı. Aynı donanım arızası bölgesindeydiler.

"Yük dengeleyici trafiği her iki bölgeye yönlendiriyor," dedi Leo kimseye. "Yaklaşık yarısı çalışmayan örneklere gidiyor."

Yarım saatlik azaltılmış hizmetten önce fark etti ve ASG'yi yalnızca us-east-1a'ya geçirdi.

"Bu, her şeyin tek bir bölgede olması nedeniyle oldu," dedi Priya ertesi sabah.

"Hayır," dedi Leo. "Örneklerim iki bölgede vardı. Sorun, başarısız bölgede yer değiştirme örneklerinin oluşturulmasıydı."

"Ve veritabanı?"

Leo durdu.

"RDS örneği Çoklu-Bölge," dedi. "Beklemede olanı us-east-1b'de. Bu da başarısız oldu. RDS, sağlıklı bölgeye geçiş yapmaya çalıştı, bu da başarısız oldu."

Yarım saatlik azaltılmış hizmet, 38 dakikaya ulaştı.

**Elektrik Şebekesi Analojisi**

Evinizin elektriğini nasıl aldığını düşünün. Elektrik, tek bir kabloyla bir jeneratörden gelmez. Bir ağ—jeneratörler, trafo merkezleri ve iletim hatları—birbirini destekleyen bir ağdan gelir. Bir trafo merkezi yangın görürse, diğerleri gücü etrafında yeniden yönlendirir. Bir şey fark etmezsiniz. Işıklar yanar.

AWS Erişilebilirlik Bölgeleri aynı şekilde çalışır. Her şeyin güvenmesi gereken tek bir dev veri merkezi yerine, AWS kaynaklarınızı birden fazla fiziksel olarak ayrı tesisin üzerine yayar. Bir tesis güç kaybı veya donanım arızası yaşarsa, diğerleri çalışmaya devam eder. Trafik otomatik olarak yeniden yönlendirilir. Uygulamanız çalışır—çünkü tek bir tel kesinlikle kesilmedi.

Çoklu Bölge, bir sonraki seviyedir: tamamen farklı bir şehirde yedek jeneratörlere sahip olmak gibi. Tüm yerel elektrik şebekesi çökerse, uzak şehir devreye girer. Daha karmaşık kurulur, ancak daha büyük bir felaket direnci sağlar.

**Arızanın Sözlüğü**

Dayanıklılığa tasarlanmadan önce, karşılanacak kelimelere ihtiyacınız vardır.

**Erişilebilirlik**: Bir sistemin ne kadar süreyle çalışır durumda olduğu oranı. "Dört dokuz" (99,99%) daha yılda 52 dakikadan az arıza süresi anlamına gelir. "Beş dokuz" (99,999%) yaklaşık yılda 5 dakikaya denk gelir.

**Geri Kazanma Süresi Hedefi (RTO)**: Sistem ne kadar süreye kadar çalışmayı durdurmadan iş sorunu yaratır? RTO'nuz 4 saatse, hizmetin geri kazanılması için 4 saatiniz vardır.

**Geri Kazanma Noktası Hedefi (RPO)**: Bir felaket durumunda ne kadar veri kaybedebilirsiniz? RPO'nuz 1 saatse, son bir saatteki her şeyin bir felaket durumunda kabul edilebilir şekilde 1 saat kaybına kadar gidebileceğinizi anlarsınız.

**Arıza Toleransı**: Bir bileşen arızalandığında çalışmaya devam etme yeteneği.

**Felaket Kurtarma (DR)**: Bir veri merkezi yangını, bölge genelinde bir kesinti veya yanlışlıkla büyük bir silme gibi bir felaketi geri kazanma süreci.

Bu beş kavram, bu bölümdeki her mimari kararını yönlendirmektedir.

**Çoklu-Bölge: Erişilebilirlik Bölgelerine Karşı Arızaları Aşmak**

Bir Erişilebilirlik Bölgesi (AZ), bir Bölge içinde fiziksel olarak ayrı bir veri merkezidir. AZ'ler bağımsız olarak tasarlanmıştır: ayrı güç kaynakları, ayrı soğutma, ayrı ağ altyapısı. Ancak, ağ gecikmesi 1-2 milisaniyedir.

**Çoklu-Bölge dağıtımları**, kaynaklarınızı bir Bölge içindeki iki veya daha fazla AZ'ye yayar. Bir AZ başarısız olursa:

- Yük dengeleyici, başarısız olan AZ'deki sağlıksız örnekleri yönlendirmeyi durdurur
- Auto Scaling Grubu örnekleri değiştirir—ancak sağlıklı AZ'ye
- RDS sağlıklı AZ'deki beklemeye geçiş yapar

Leo'nun hatası: Auto Scaling Grubu, AZ'leri dengelemek için örneklerin sayısını azaltmaya yapılandırılmamıştı. Başarısız olan AZ'ye örnekleri oluşturmaya yapılandırılmıştı. us-east-1b başarısız olduğunda, ASG başarısız olan AZ'ye örnek sayısını dengelemek için örnek oluşturmaya çalıştı.

Düzeltme: ASG'yi yalnızca sağlıklı AZ'lere başlatacak ve her zaman en az iki AZ'nin etkin olduğunu sağlayacak şekilde yapılandırın.

Daha derin ders: üretimde meydana gelmeden önce arıza senaryolarınızı test etmek.

**Arızaları Simüle Etme: Kaos Mühendisliği**

"Çoklu-Bölge kurulumumuzun gerçekten çalıştığını nasıl biliriz?" diye sordu Maya.

"Kaba kuvvetle şeyleri kırarız," dedi Leo.

Bu çılgınca sesli. Aslında, bir ekibin yapabileceği en sorumlu şeydir.

**Chaos Engineering** uygulaması, sisteminizin hataları nasıl ele aldığını doğrulamak için kasıtlı olarak hataları sisteme yerleştirme pratiğidir. Bir EC2 örneğini kasıtlı olarak sonlandırıyorsunuz. RDS örneğini manuel olarak geç geçiş yapıyorsunuz. Bir yük dengeleyicisine bir alt ağın engellenmesini sağlıyorsunuz.

Sistem, RTO (Yeniden Çalışma Zamanı) içinde otomatik olarak kurtarılıyorsa, tasarımınız işe yarar.

Eğer yoksayılıyorsa, kontrollü bir ortamda — gece yarısı üretim olayında değil, 2 AM'de meydana gelen bir olay sırasında — sisteminizin hataları nasıl ele aldığını öğrenmiş olursunuz.

Nimbus için: Leo, her arıza senaryosunu test etmek için bir çalıştırılabilir (belgelenmiş bir prosedür) hazırladı. Bir çeyrekte, bir bileşeni kasıtlı olarak arızalıyor ve kurtarma süresini ölçüyordu. Kurtarma süresi RTO'dan daha uzunsa, tasarımı düzeltiyorlardı.

**Çoklu Bölge: Bölgesel Arızaları Aşmak**

Çoğu AWS arızası, Bölgeler yerine Bölgeler İçindeki Alanlara (AZ) etki eder. Bölgesel arızalar nadirdir — ancak meydana gelirler.

Bir bölgesel arıza (veya her yerde çok düşük gecikme gerektiren küresel uygulamalar için) için **Çoklu Bölge** cevaptır: Uygulamanızı iki veya daha fazla AWS Bölgesinde dağıtın.

Çoklu Bölge, temel karmaşıklıklar getirir:

**Veri Yansıtması**: Veritabanlarınızın bölgeler arasında senkronize olması gerekir. us-east-1'de yazılan herhangi bir veri, eu-west-1'e sonunda ulaşmalıdır. "Sonunda" sorundur — gecikme süresi boyunca, bölgeler dünyayla biraz farklı şekillerde görürler.

**Aktif-Pasif vs Aktif-Aktif**:

- **Aktif-Pasif**: Bir bölge tüm trafiği hizmet verir. Diğer, sıcak bir yedekdir. Bir arıza durumunda, DNS trafiği yedekliye yönlendirir. Daha basittir, ancak yedekli boşta kalır ve pahalıdır.
- **Aktif-Aktif**: Her iki bölge de trafiği aynı anda hizmet verir. Daha karmaşıktır (çakışan yazma çakışmalarını çözmeyi gerektirir), ancak küresel olarak daha düşük gecikme süresi ve boş kaynaklar yoktur.

**Geçiş Süresi**: DNS değişikliklerinin yayılması zaman alır (TTL'ye bağlı olarak). Yayılma penceresi sırasında, bazı kullanıcılar başarısız bölgeye çarpar. Çok düşük RTO'lu bir tasarıma yönelik tasarlarken, yedekliyi önceden ısıtmak ve planlı geçişlerden önce TTL'yi azaltmak gerekir.

**Felaket Kurtarma Stratejileri: Bir Spektrum**

Dört yaygın DR stratejisi, en ucuzdan (en yavaş kurtarma süresine sahip) en pahalıya (en hızlı kurtarma süresine sahip) kadar sıralanmıştır:

**Yedekleme ve Geri Yükleme** (saatler RPO/RTO):

- Her şeyi farklı bir bölgeye S3'e yedekleyin
- Felaket durumunda: sıfırdan altyapıyı oluşturun, yedeklerden geri yükleyin
- Maliyet: çok düşüktür (sadece depolama için ödeme yapıyorsunuz)
- Kurtarma süresi: saatler

**Pilot Işık** (dakikalar ila 1 saat RPO/RTO):

- DR bölgesinde uygulamanın minimum bir sürümü çalışır (hızlıca artırılabilen "pilot ışık").
- Temel veriler çoğaltılır (DR bölgesindeki RDS okuma replikası)
- Felaket durumunda: DR bölgesini ölçeklendirin, okuma replikası ana replikaya yükseltin, DNS'i geçirin
- Maliyet: orta (küçük bir çalışma ayak izi için ödeme yapıyorsunuz)
- Kurtarma süresi: dakikalar

**Sıcak Yedek** (saniyeler ila dakikalar RPO/RTO):

- Tam uygulamanın DR bölgesinde azaltılmış kapasitede çalışan ölçeklendirilmiş bir sürümü çalıştırır.
- Tam olarak çalışır durumda ancak azaltılmış kapasitede
- Felaket durumunda: ölçeklendirin, DNS'i geçirin
- Maliyet: daha yüksek (tam ölçekte azaltılmış ölçekte tam bir yığın çalıştırılır)
- Kurtarma süresi: dakikalar

**Aktif-Aktif / Çoklu Site** (yaklaşık sıfır RPO/RTO):

- İki veya daha fazla bölgede tam kapasite, trafiği aynı anda hizmet verir
- Bir bölge başarısız olursa, trafik otomatik olarak diğerine yönlendirilir
- Maliyet: en yüksek (iki tam dağıtım tam ölçekte)
- Kurtarma süresi: saniyeler (DNS yayılımı)

Nimbus'ta bu aşamada: sıcak yedek. Çoklu bölgeye aktif-aktif'i kaldıramazlardı, ancak geri yükleme ve yedekleme, iş gereksinimleri için çok yavaştı.

**Amazon RDS: Çoklu-AZ vs Okuma Replikaları vs Çoklu-Bölge**

Bu üçü farklı ve sık sık karıştırılır:

| Özellik       | Çoklu-AZ                     | Okuma Replikası     | Çoklu-Bölge Okuma Replikası |
|---------------|------------------------------|------------------|---------------------------|
| Amaç         | Yüksek kullanılabilirlik (geçiş) | Okuma ölçeklendirme | Okuma ölçeklendirme + DR         |
| Veri senkronizasyonu | Senkron               | Asenkron     | Asenkron              |
| Geçiş        | Otomatik                    | Manuel promotion | Manuel promotion          |
| Okunabilir?     | Hayır (yedekli pasif)      | Evet              | Evet                       |
| Bölgesel?     | Hayır (aynı bölge)             | Evet (isteğe bağlı)   | Evet                       |
| İçin       | HA, RPO~0                    | Okuma yükü        | Felaket kurtarma         |

Temel nokta: Çoklu-AZ yedekli **senkron** — birincildeki her yazma, yedekliye yazma tamamlandığında doğrulanır. Bu, birincil başarısız olursa veri kaybını önler. RPO = 0.

Okuma replikaları **asenkron** — bir replikasyon gecikmesi vardır. Birincil başarısız olursa ve bir okuma replikası yükseltilirse, son birkaç saniye veya dakika yazıları kaybedilebilir. RPO > 0.

## Güçlü Yönler ve Sınırlamalar

**Çoklu-AZ**:

- Üretim iş yükleri için özendirici — tek bir bölge (AZ) tek bir arıza noktasıdır
- AWS hizmetleri tarafından iyi desteklenir (RDS, ElastiCache, EKS, ALB tüm Çoklu-Bölgeyi destekler)
- Nispeten düşük maliyetli bir yükü, sağladığı koruma ile karşılaştırıldığında
 
**Çoklu Bölge**:

- Doğru şekilde uygulaması karmaşıktır, özellikle veritabanları için
- Veri yerleşim/sermayeci gereksinimleri aslında onu gerektirebilir (AB kullanıcı verileri AB içinde kalmalıdır)
- Küresel kullanıcılar için gecikme faydaları yönlendirme yoluyla gelir, çoklu bölge yoluyla değil (CloudFront için statik içerik kullanın)
- Çoğu kuruluş aktif-aktif ihtiyacını duymaz, sıcak bekleyicisine yeterince yatırım yapmaz

## Özet

- **RTO** (Yeniden Başlatma Süresi Hedefi): ne kadar uzun süre kapalı kalabileceğinizi. **RPO** (Yeniden Başlatma Noktası Hedefi): ne kadar veri kaybedebileceğinizi.
- **Çoklu-Bölge** kaynakları Bir Bölge içindeki Erişilebilirlik Bölgeleri arasında dağıtır. Bir Bölge arızalarına karşı korur.
- **Çoklu Bölge** AWS Bölgelerinde birden fazla dağıtır. Bölgesel arızalara karşı korur ve daha düşük gecikme süresiyle küresel kullanıcılara hizmet verir (CloudFront için statik içerik kullanın)
- DR stratejileri (en ucuzdan en pahalıya): Yedekleme & Kurtarma → Sıcak Işın → Sıcak Bekleyicisi → Aktif-Aktif
- RDS Çoklu-Bölge yedekleme: senkron, otomatik geçiş, RPO = 0. Okuma replikaları: asenkron, manuel terfi, RPO > 0.
- Hataları üretimde meydana gelmeden önce kasıtlı olarak test edin (kaos mühendisliği)

## Sınav İpuçları

*SAA-C03 Alanı: Dayanıklı Mimarileri Tasarlayın (Alan 2, Görev 2.2)*

- **RTO vs RPO**: Sınavın, gereksinimleri ("organizasyon 1 saatten fazla çalışma süresini tolere edebilir ve veri kaybını kabul etmeyebilir") vermesini ve doğru DR stratejisini seçmenizi istemesini bekleyin. Eşleştirme: veri kaybı yok = senkron replikasyon = Çoklu-Bölge veya Aktif-Aktif. 1 saatlik çalışma süresi = yedekleme & kurtarma çok yavaştır; sıcak bekleyicisi işe yarayabilir.
- **Çoklu-Bölge RDS vs Okuma Replikaları**: Sınav, HA (Çoklu-Bölge) ile okuma ölçeklendirme (okuma replikaları) arasındaki farkı soracaktır. Çoklu-Bölge yedekleme okunaklı değildir. Okuma replikaları, DR için ana olarak manuel olarak terfi ettirilebilen ana olarak kullanılabilir.
- **Sıcak Işın vs Sıcak Bekleyicisi**: Sıcak Işın minimum altyapı çalıştırmayı içerir (yalnızca veri replikasyonu). Sıcak Bekleyicisi, ölçeklendirilmiş bir ancak çalışan bir uygulama çalıştırmayı içerir. Fark, ölçeklendirme hızında yatmaktadır.
- **Aurora Global Veritabanı**: Çoklu-Bölge aktif-pasif için Aurora'ya özgü bir özelliktir. Ana Bölge yazıları hizmet verir; ikincil Bölgeler <1 saniyelik bir gecikme ile okuma hizmeti verir. Bir arıza durumunda, ikincil <1 dakikada ana olarak terfi edilebilir. Sinyal: "Aurora, çoklu bölge, RTO < 1 dakika."
- **AWS Yedekleme**: EBS, RDS, DynamoDB, EFS, Storage Gateway için merkezi bir yedekleme hizmeti. Sınav, yedekleme & kurtarma senaryoları için kullanılır.
- **Route 53 Geçişi**: DR için DNS katmanı. Birincil sağlık kontrolü başarısız olur → Route 53 ikinciliye yönlendirir. Yayılma süresi bu nedenle anında değildir.

## Uygulamalar

**Uygulama 1 — Hatırlama**

RTO ve RPO arasındaki farkı açıklayın. Bir kuruluşun düşük bir RTO'ya (uzun süre çalışamaz) sahip olmasına rağmen yüksek bir RPO'ya (son zamanlardaki verileri kaybetmeyi kabul etmesine) sahip olmasının nedeni ne olabilir?

*(İpucu: Müşterilere hızlı bir şekilde hizmet vermenin, her işlemdeki verileri korumaktan daha önemli olduğu bir işi düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Hasta kayıt sistemini `us-east-1`'de çalışan bir sağlık şirketi. Düzenleyici gereksinimler, hasta verilerinin hiçbir şekilde kaybedilmemesini (RPO = 0) zorlar. Sistem, bir felaket durumunda kadar 30 dakikaya kadar çalışma süresini (RTO = 30 dakika) tolere edebilir. Maliyet bir husustur.

Bu gereksinimleri karşılayan EN İYİ mimari hangisidir?

A) S3'te `us-west-2`'de günlük otomatik yedeklemelerle çoklu-AZ'de RDS Çoklu-Bölge
B) S3'te `us-west-2`'de manuel terfi için yapılandırılmış okuma replikasıyla çoklu-AZ'de RDS Çoklu-Bölge
C) S3'te `us-west-2`'de yedeklemelerle çoklu-Bölge RDS
D) <1 saniyelik bir replikasyon gecikmesiyle ana bölgede Aurora Global Veritabanı ve ikincil bölgede

**İpucu 1**: RPO = 0, veri kaybı yok demektir, bu da senkron veya yakın senkron replikasyon gerektirir.

**İpucu 2**: RTO = 30 dakika, manuel müdahale için zamanınız olduğunu gösterir. Tam otomatik milisaniye geçişi gerekmez.

**İpucu 3**: Çoklu-Bölge koruması (RPO = 0 bölgede) ve küresel kullanıcılara daha düşük gecikmeyle hizmet veren çoklu bölge yetenekleri sağlayan seçenek hangisidir?

**Cevap**: A

**Neden D?** Aurora Global Database işe yarar ancak RDS Multi-AZ'e kıyasla önemli ölçüde daha pahalıdır. Senaryo maliyetin bir endişe olduğunu belirtiyor ve Aurora premium fiyatlandırmasıdır.

*SAA-C03 Alanı: Dayanıklı Mimari Tasarımı — Görev 2.2*

**Egzersiz 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus, Seattle'daki büyük bir yemek festivali için sipariş hizmetleri sağlamak üzere seçildi. 72 saat boyunca, normal trafiğinin 50 katı kadar trafiye ve herhangi bir kesintiye tolerans göstermeme (festival organizatörünün sözleşmesi, etkinlik sırasında herhangi bir kesinti durumunda mali cezalar ödenmesini şart koşuyor) bekliyorlar.

Festival penceresi için özel olarak DR stratejisi tasarlayın. Bu 72 saat boyunca aktif-aktif geçmek isterdiniz mi? Başarısız geçişi ön test nasıl yapardınız? RTO'nuz ne olurdu ve bunu etkinliğe başlamadan önce nasıl doğrulardınız?

*(Tek bir doğru cevabı yoktur. Amaç, belirli SLA gereksinimleri için DR'yi tasarlama pratiği yapmaktır.)*

## Kredilerden Sonraki Sahne

Leo, kaos mühendisliği çalışmasını hazırladı.

Her çeyrekte, planlı bakım penceresi sırasında ekip:

1. us-east-1a'daki bir EC2 örneğini sonlandırır ve ASG'nin doğru şekilde değiştirdiğini izlerdi
2. Manuel olarak RDS Multi-AZ başarısız geçişini başlatıp uygulamanın 60 saniye içinde yeniden bağlandığını doğrularlardı
3. us-east-1b'deki bir başarısızlık simülasyonunu ASG'nin kullanılabilir bölgelerini ayarlayarak gerçekleştirirlerdi
4. RDS örneğine bir haftalık eski bir yedeği yeni bir RDS örneğine geri yükler ve verilerin doğru göründüğünü doğrularlardı

İlk çalıştalarında, adım 2 4 dakika 17 saniye sürdü.

"Restoran ortaklarımıza olan RTO taahhüdümüz 5 dakikadır," dedi Tom.

"Yani geçtik. Neredeyse."

"Başarısız geçiş 5 dakikadan uzun sürerse ne olurdu gerçek bir olayda?"

Maya cevapladı: "SLA'yı ihlal ederiz. Sözleşmelerde mali bir ceza bulunmaktadır."

Leo, ekranda 4:17'ye baktı.

"O zaman daha hızlı yapmalıyız," dedi. Ve Aurora belgelerini okumaya başladı.

Sonraki bölümde: Nimbus'un her parçası kendi hızında çalışabilmesini sağlayan bilet makinesi.
