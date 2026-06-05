# Bölüm 31: Bulut Mimarisi İçin İnşaat Denetçisi

Ayaklarınızı kaldırın. Esnemek, ihtiyacınız varsa gerçek bir mola verin.

Bu bölüm önceki olanlardan farklıdır. 30 bölüm boyunca belirli hizmetler ve desenler hakkında bilgi edinmiştik. Şimdi geriye adım atıp tüm resmi görüyorsunuz.

*İyi* bir bulut mimarisi nasıl görünür? Bir mimarinin gerçekten iyi tasarlanıp olmasa da işe yarayıp yaramadığını sistematik bir şekilde değerlendirebilir miyiz?

Var. AWS bunu "İyi Tasarlanmış Çerçevesi" olarak adlandırıyor.

Nimbus iki yıldır çalışıyordu. Takım, bazıları bilinçli, bazıları şans eseri, bazıları baskı altında yüzlerce mimari karar vermişti. Sistem çalışıyordu. Ancak Maya bir soru sordu.

"Mimarimiz gerçekten *iyi* mi?" diye sordu. "Sadece işe yarayan bir şey olmak 말고, iyi."

Kimse hemen cevap vermedi.

"Çünkü İyi Tasarlanmış Bir İnceleme hakkında duyuyorum," diye devam etti. "AWS bunu müşterilere sunuyor. Bazı yatırımcılarımız tarafından bahsedildi. Bunu yapmamız gerektiğini düşünüyorum."

"Bu nedir?" Leo sordu.

"AWS'nin bulut mimarilerini değerlendirmek için kullandığı çerçeve," dedi Priya. "Altı temel. Her biri için bir dizi soru ve en iyi uygulamalar var. Mimarinizin hepsine karşı değerlendirilmesini ve eksik olanları belirlemesini sağlıyor."

"Bir bina denetimine benziyor," dedi Tom. "Binaların çalıştığını biliyorsunuz. Denetim, depremde başarısız olma potansiyelini belirlemenizi sağlıyor."

**Altı Temel**

AWS İyi Tasarlanmış Çerçevesi, altı temel üzerine kuruludur. Her temel, bir dizi tasarım ilkesi, en iyi uygulamalar ve mimarinizi değerlendirmek için sorular içerir.

**1. Operasyonel Mükemmellik**

*Odak*: İş değerini sağlayan ve süreçleri ve prosedürleri sürekli iyileştiren sistemleri çalıştırmayı ve izlemeyi içerir.

Temel alanlar:

- Değişiklikleri nasıl dağıtıyorsunuz? (CI/CD, altyapı kodu, otomatik dağıtımlar)
- Sistem hakkında ne zaman bir şey ters giderse, sistemi nasıl izliyorsunuz?
- Başarısızlıklardan nasıl öğreniyorsunuz? (sonuç raporları, çalışma kitapları, suçsuz kültür)
- Ölçekte değişiklikleri nasıl ele alıyorsunuz?

Nimbus değerlendirmesi:

- Mevcut: Otomatik dağıtımlarla CI/CD boru hattı
- Mevcut: CloudWatch uyarıları ve GuardDuty
- Mevcut: Çeyreklik kaos mühendisliği testleri
- Uyarı: Sonuç raporlama süreci resmileştirilmedi — olaylar incelendi ancak öğrenmeler sistematik olarak belgelenmedi

**2. Güvenlik**

*Odak*: Risk değerlendirmesi ve azaltma stratejileri yoluyla bilgi, sistemler ve varlıkları korumak.

Temel alanlar:

- Kim neye erişebilir ve en az ayrıcalıkla mı?
- Veriler dinlenme ve aktarım sırasında şifreleniyor mu?
- Tehditler nasıl tespit edilir ve bunlara nasıl yanıt verilir?
- Otomatik güvenlik kontrolleri var mı?

Nimbus değerlendirmesi:

- Mevcut: En az ayrıcalıkla (14. Bölüm'deki temizlikten sonra) IAM
- Mevcut: Veri şifrelemesi için KMS, kimlik bilgilerini için Secrets Manager
- Mevcut: GuardDuty, WAF, Shield Standard
- Mevcut: Özel alt ağlarla VPC, güvenlik grupları
- Uyarı: EC2 örneklerinde güvenlik yamalama tamamen otomatik değil (Priya aylardır bunu işaretlemişti, henüz çözülmedi)

**3. Güvenilirlik**

*Odak*: Bir sistemin amaçlandığı şekilde doğru ve tutarlı bir şekilde çalıştığının ve arızalara karşı başarısızlık durumunda kurtarma yeteneğine sahip olduğunun sağlanması.

Temel alanlar:

- Bir bileşende bir arıza nasıl ele alınır?
- Bölgesel arızalardan nasıl kurtulursunuz?
- Talep nasıl yönetilir?
- Bir arızanın test edilmesi nasıl yapılır?

Nimbus değerlendirmesi:

- Mevcut: Tüm kritik bileşenler için Çoklu Bölge
- Mevcut: Aurora Serverless ile otomatik geçiş
- Mevcut: Yük için Auto Scaling (EC2 ve ECS)
- Mevcut: Chaos mühendisliği testleri (çeyreklik)
- Uyarı: Çok bölge dağıtımı yok (sıcak yedek henüz uygulanmadı — önümüzdeki çeyrekte planlanıyor)

**4. Performans Verimliliği**

*Odak*: IT ve bilgi işlem kaynaklarını verimli bir şekilde kullanmak.

Temel alanlar:

- Yük için doğru örnek türü ve veritabanı türü kullanılıyor mu?
- Ölçekleme doğru şekilde yapılandırılmış mı?
- Kullanıcılar için veriler en uygun konumdan mı teslim ediliyor?

Nimbus değerlendirmesi:

- Mevcut: Küresel içerik teslimi için CloudFront
- Mevcut: Veritabanı okuma hızlandırması için ElastiCache
- Mevcut: Aurora okuma replikaları
- Mevcut: Uygun iş yükleri için Lambda
- Uyarı: Bazı EC2 örnekleri ilk dağıtımından beri yeniden boyutlandırılmamış

**5. Maliyet Optimizasyonu**

*Odak*: Gereksiz maliyetlerden kaçınmak.

Temel alanlar:

- Kaynaklar uygun şekilde boyutlandırılıyor mu?
- Kullanılmayan kaynaklar devre dışı bırakılıyor mu?
- Uygun fiyatlandırma modelleri kullanılıyor mu?
- Harcama anormallikleri tespit ediliyor mu?

Nimbus değerlendirmesi:

- Mevcut: Tasarruf Planları uygulanıyor (27. Bölüm)
- Mevcut: S3 yaşam döngüsü politikaları (23. Bölüm)
- Mevcut: DynamoDB Auto Scaling
- Mevcut: AWS Bütçeleri ile uyarılar
- Mevcut: Çeyreklik maliyet incelemeleri

**6. Sürdürülebilirlik**

*Odak*: Bulut iş yüklerinin çalışmasının çevresel etkilerini en aza indirmek.

Temel alanlar:

- Kullanım en üst düzeye çıkarılıyor mu (boş kaynaklar önleniyor mu)?
- Enerji verimli örnek türleri seçiliyor mu?
- Veriler yalnızca ihtiyaç duyulduğunda saklanıyor mu?

Nimbus değerlendirmesi:

- **Sunuluyum:** Lambda ve Fargate, sunless/konteynerleştirilmiş iş yükleri için (ayrı EC2'ye göre daha iyi kaynak verimliliği)
- **Sunuluyum:** S3 yaşam döngüsü politikaları (daha uzun süre ihtiyaç duyulmayan verileri silme)
- **Uyarı:** Bazı graviton tabanlı örneklemeler henüz benimsenmedi (AWS Graviton daha enerji verimli ve daha ucuz)

**İyi Yapılmış Mimari İnceleme Süreci**

İnceleme, geçip geçemeyeceğin bir test değildir. Bu, 60'tan fazla sorudan oluşan altı temel üzerine odaklanmış mimariniz hakkında yapılandırılmış bir konuşmadır.

Her soru, bir en iyi uygulamayı tanımlar. Mimariniz bunu takip ediyorsa, bu bir güçlü yanıdır. Yapmazsa, bu bir "sorun"dur - risk seviyesine göre kategorize edilir (yüksek, orta, düşük).

Çıktı: iyileştirme önerilerinin önceliklendirilmiş bir listesidir. Her şeyi hemen düzeltmesi gerekmez. Bu çerçeve, her boşluğun getirdiği ödünleri anlamanıza ve neyi önceliklendireceğinizi belirlemenize yardımcı olur.

AWS'nin İyi Yapılmış Mimari Aracı (AWS konsolunda ücretsiz olarak mevcut), soru çerçevesini sağlar ve önerilerle bir rapor üretir.

Nimbus için, Maya yarım günlük bir atölye düzenledi. Dört takım üyesi de her temel üzerinde birlikte inceledi. Sonunda, 12 "sorun" listelediler - üçü yüksek risk, beş tanesi orta risk, dört tanesi düşük risk.

**Yüksek Riskli Sorunlar:**

1. Çok bölgeye sahip olmayan bir afet kurtarma planı yok (güvenilirlik)
2. EC2 güvenlik yamalaması otomatikleştirilmedi (güvenlik)
3. Resmi bir olay yanıt süreci yok (operasyonel mükemmellik)

**Orta Riskli Sorunlar:**

5 öğe dahil: Graviton benimsenmemesi, bazı EC2 örneklemeleri doğru boyutlandırılmamış, veritabanı geçişi için resmi bir çalışma kitabı yok

**Düşük Riskli Sorunlar:**

4 öğe dahil: CloudFront önbellek hit oranı, ayarlanmış TTL'lerle daha yüksek olabilir, güvenlik grupları gereğinden fazla geniş

**Lens: İncelemeyi Uzmanlaştırma**

Temel İyi Yapılmış Mimari Çerçevesi, teknolojiden bağımsızdır. AWS ayrıca çerçeveyi belirli kullanım durumları veya endüstriler için uzantılar olarak yayınlayan **Lensler**'i yayınlar:

- **Sunless Lens:** Lambda'ya dayalı mimariler için ek sorular
- **SaaS Lens:** Çok kiracı SaaS uygulamaları için
- **Makine Öğrenimi Lens:** ML eğitimi ve çıkarım iş yükleri için
- **Finansal Hizmetler Lens:** FinTek için düzenleyici ve uyumluluk soruları
- **Sağlık Hizmetleri Lens:** HIPAA hususları

Nimbus için SaaS Lens'i alakalıydı. Kiralık alan yalıtımı, onboarding otomasyonu ve kiracı başına maliyet tahsisi konularına odaklanıyordu - hepsi Nimbus'un aktif olarak geliştirdiği alanlardı.

**İyi Tasarlanmış ve Sadece Çalışan Arasındaki Fark**

Leo, inceleme sonrası "Sistemimiz çalışıyor," dedi. "Ama bu kadar çok şeyi 'yeterince iyi' yaptığımızı ve onlara devam ettiğimizi fark etmemiştim."

"Normal," Priya dedi. "Zaman baskısı altında inşa etmek, pratik seçimler yapmanıza neden olur. İyi Yapılmış Mimari incelemesi, bunları gözden geçirmek için planlanmış zamandır."

"Bu boşlukların retrospektif olarak açık olduğunu gördüm," diye devam etti. "Güvenlik yamalaması - biz bunu otomatikleştirmediğimizi biliyorduk. Sadece düzeltmeyi önceliklendirmeyi unuttum."

"Çünkü 'çalışıyor' ve 'iyi tasarlanmış' aynı gün içinde hissettirir," dedi Maya. "Fark sadece bir şey yanlış giderdiğinde ortaya çıkar."

Bir kıdemli mühendis için bu, olayların olmaması anlamına gelmiyor ki riskin de olmaması anlamına geliyor. Risk henüz tetiklenmemiş demektir.

**İşletme Mükemmelliği İçin Altyapı Olarak Kod: Bir Enleyici**

Çok sayıda temel boyunca bir tema: **Altyapı Olarak Kod (IaC)**.

Altylarınız konsol aracılığıyla manuel olarak yapılandırılıyorsa, o zaman:

- DR senaryosunda yeniden oluşturmak yavaştır ve hataya eğilimlidir
- Değişiklikleri denetlemek imkansızdır (kim neyi değiştirdi ve ne zaman?)
- Kötü bir değişikliği geri almak manuel olarak geri alınmalıdır
- Dev/staging/production ortamları arasında tutarlılık, disiplin gerektirir

**AWS CloudFormation**, altyapıyı YAML/JSON şablonlarında tanımlamanıza olanak tanır. **AWS CDK (Cloud Development Kit)**, altyapıyı programlama dillerinde (Python, TypeScript, Java) tanımlamanıza olanak tanır. **Terraform**, popüler bir üçüncü taraf alternatiftir.

Nimbus, Terraform kullanarak IaC'ye yavaş yavaş geçiyordu. İyi Yapılmış Mimari incelemesi zamanına kadar, altyapılarının yaklaşık %60'ı kodda tanımlanmıştı. İnceleme, %100'e ulaşılması tavsiye edildi.

"Kalan %40 neden?" diye sordu Leo.

"Kalan %40, kritik altyapımızdır," dedi Priya. "Koddan yeniden oluşturamadığımızı, bir bölgesel felaket durumunda kurtarmak için yeniden oluşturamıyoruz."

## Güçlü Yönler ve Sınırlamalar

**İyi Yapılmış Mimari Çerçevesi İyi Başarır:** Takımlara, mimari ödünler hakkında ortak bir sözcük havuzu sağlamak, personel değişikliklerine ve satıcı sohbetlerine dayanmayan bir dil sağlar. İyi Yapılmış Mimari İncelemesi yürütmek, diğer zamanlarda görünmeyen risklerin açık bir şekilde kabul edilmesini zorlar: "Evet, tek bir arıza noktası olduğunu biliyoruz; başarının beklenen maliyetinden daha fazla olduğu için ortadan kaldırmayı ortadan kaldırmak için gereken maliyetin üstesinden gelene kadar bu ödünle kabul ettik." Bu tür belgelenmiş, amaçlı bir ödün, iyi bir incelemeden elde edilen bir çıktıdır.

**Ne Yapamaz**: Çerçeve, tanımlayıcı, önleyici değildir. İyi tasarlanmış sistemlerin özelliklerini tanımlar — size nasıl inşa edeceklerini söylemez. İyi Tasarım İncelemesindeki her kutuyu işaretlemek, iyi bir mimariyi garanti etmez. Bir sistem yüksek kullanılabilirlik, operasyonel mükemmellik, maliyet optimizasyonu ve yanlış sorunu çözebilir. Çerçeve, bir şablon değil, bir mercek gibidir. Doğru soruları ortaya çıkarmak için kullanın, cevaplamak için değil.

## Özeti

- **AWS İyi Tasarım Çerçevesi** altı sütundan oluşur: Operasyonel Mükemmellik, Güvenlik, Güvenilirlik, Performans Verimliliği, Maliyet Optimizasyonu ve Sürdürülebilirlik.
- Her sütun, yapılandırılmış bir soru seti aracılığıyla tasarım ilkelerini ve en iyi uygulamaları değerlendirir.
- **İyi Tasarım Aracı** (AWS konsolunda ücretsiz), incelemeyi yönlendirir ve bir rapor oluşturur.
- Çıktı, riske göre sınıflandırılmış mimari iyileştirme listelerinin önceliklendirilmiş bir listesidir.
- **Mercekler**, belirli alanlar için çerçeveyi uzmanlaştırır (sunucusuz, SaaS, sağlık, ML).
- **Altyapı olarak Kod**, bir sütun arasında bir aktarımdır — Operasyonel Mükemmellik, Güvenlik ve Güvenilirlik sütunları tarafından önerilir.
- İyi Tasarım incelemesi, geçme/kalma testi değildir. Yapılandırılmış bir iyileştirme sohbetidir.

## Sınav İpuçları

*SAA-C03 Alanı: Çoklu Alan*

- **Altı sütunu ve her birinin ana odağını bilin**. Sınav, bir senaryo (örn. "takım sistemlerinin AZ arızalarından kurtulabilmesini sağlamak istiyor") tanımlayacak ve hangi sütunun altında olduğunu soracaktır (Güvenilirlik).
- **Sütun eşlemesi**:
  - "Değişiklikleri güvenilir bir şekilde dağıt, hatalardan ders çıkar, izle" → Operasyonel Mükemmellik
  - "IAM, şifreleme, ağ kontrolleri, tehdit tespiti" → Güvenlik
  - "HA, geçiş, ölçekleme, DR" → Güvenilirlik
  - "Doğru boyutlandırma, CDN, doğru teknoloji seçimi" → Performans Verimliliği
  - "Fiyatlandırma modelleri, kullanılmayan kaynaklar, maliyet görünürlüğü" → Maliyet Optimizasyonu
  - "Enerji verimliliği, kaynak kullanımı, veri yaşam döngüsü" → Sürdürülebilirlik
- **Altyapı olarak Kod**: Tekrarlanabilirlik, denetlenebilirlik ve kurtarma için çerçeve tarafından önerilen AWS'nin yerel araçlarıdır. CloudFormation, CDK ve SAM AWS'nin yerel araçlarıdır.
- **İyi Tasarım Aracı**: İnceleme sürecini yönlendiren AWS konsol aracıdır. Kullanmak ücretsizdir. İyileştirme planları oluşturur.
- **AWS Güvenilir Danışman**: Çerçeve ile benzer, ancak otomatik olan — hesabınızı tarar ve maliyet, performans, güvenlik ve hata toleransı açısından önerilerde bulunur. Kesişim gerçekte mevcuttur: Güvenilir Danışman, çerçeve tarafından manuel olarak değerlendirilen bazı şeyleri otomatikleştirir.

## Uygulamalar

**Uygulama 1 — Hatırlama**

AWS İyi Tasarım Çerçevesinin altı sütununu adlandırın ve her birinin ana endişesini bir cümleyle tanımlayın.

*(Bu konuda hatırlamaya çalışın. Zorlanıyorsanız, hangi sütunların daha fazla dikkat gerektirdiğini bilmek faydalı olacaktır.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir mühendislik ekibi İyi Tasarım incelemesi için hazırlanıyor. Uygulamaları EC2 üzerinde ve RDS Çoklu-AT ile çalışıyor. Son zamanlarda şunları keşfettiler:

- Dağıtım süreci bazen EC2 örneklerinde farklı kütüphane sürümleri (konfigürasyon sapması) bırakıyor
- RDS geçişi tetiklendiğinde otomatik uyarıları yok
- IAM kullanıcıları tümü için AdministratorAccess'i kullanıyor
- Yedekleme geri yükleme süreçlerini 14 ay boyunca test etmediler

Her sorunu en alakalı İyi Tasarım sütunuyla eşleştirin.

A) Konfigürasyon sapması: Operasyonel Mükemmellik; RDS geçişi uyarıları yok: Güvenilirlik; AdministratorAccess: Güvenlik; Yedekleme geri yükleme testi yapılmadı: Güvenilirlik

B) Konfigürasyon sapması: Güvenlik; RDS geçişi uyarıları yok: Performans Verimliliği; AdministratorAccess: Operasyonel Mükemmellik; Yedekleme geri yükleme testi yapılmadı: Maliyet Optimizasyonu

C) Konfigürasyon sapması: Güvenilirlik; RDS geçişi uyarıları yok: Performans Verimliliği; AdministratorAccess: Güvenlik; Yedekleme geri yükleme testi yapılmadı: Operasyonel Mükemmellik

D) Konfigürasyon sapması: Güvenlik; RDS geçişi uyarıları yok: Güvenilirlik; AdministratorAccess: Maliyet Optimizasyonu; Yedekleme geri yükleme testi yapılmadı: Güvenlik

**İpuçları 1**: "Konfigürasyon sapması" dağıtım sürecinde → hangi sütun dağıtım uygulamalarını kapsar?

**İpuçları 2**: "AdministratorAccess" tüm kullanıcılar için → hangi sütun erişim kontrolünü kapsar?

**İpuçları 3**: "Yedekleme geri yükleme testi yapılmadı" → hangi sütun kurtarma mekanizmalarınızı test etme konusunu kapsar?

**Cevap**: A

**Açıklama**: Dağıtım süreçlerindeki (tutarsız ortamlar) konfigürasyon sapması, Operasyonel Mükemmellik sorundur — güvenilir, tutarlı bir dağıtım uygulamasıdır. RDS geçişi uyarıları yok, bu nedenle HA mekanizmalarının tetiklendiğini bilmezsiniz — Güvenilirlik sorundur (sisteminizin sağlığını bilmek). Tüm kullanıcılar için AdministratorAccess, en az ayrıcalık ilkesini ihlal eder — Güvenlik sorundur. Test edilmemiş bir yedekleme geri yükleme, Güvenilirlik mekanizmalarınızın (DR) doğrulanmadığını gösterir.

**Neden B?** B, yapılandırma kaymalarını Güvenliğe (tutarsız kütüphane sürümleri bir dağıtım operasyonları sorunudur, bir güvenlik tehdidi değil) atıyor ve YöneticİEriErişi'ni Operasyonel Mükemmellik'e (erişim kontrolü bir Güvenlik meselesidir, bir operasyon süreci değil) atıyor.

**Neden C?** C, YöneticİEriErişi'ni Güvenliğe doğru yerleştiriyor ancak yapılandırma kaymalarını Güvenilirlik'e (dağıtım tutarlılığı Operasyonel Mükemmellik) atıyor ve test edilmemiş yedek geri yüklemeyi Operasyonel Mükemmellik'e (geri dönüş testleri Güvenilirlik meselesidir - sisteminizin kurtarabileceğini doğruluyorsunuz, süreçlerinizin tutarlı olduğunu değil) atıyor.

**Neden D?** D, YöneticİEriErişi'ni Mali Optimizasyon'a atıyor (aşırı geniş izinler maliyetle hiçbir ilgisi yok) ve test edilmemiş yedek geri yüklemeyi Güvenliğe (bir yedekten kurtarılamamak bir Güvenilirlik başarısızlığıdır, bir güvenlik açığı değil) atıyor.

*SAA-C03 Alanı: Çoklu Alan*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Bildiğiniz veya oluşturduğunuz bir uygulama için mini bir İyi Mimari incelemesi yapın. Altı temel için şunları yazın:

- Uygulamanın iyi yaptığı bir şey
- Uygulamanın iyileştirilebilecek bir şey

Daha sonra iyileştirme öğelerinizi risk (bir olaydan ne kadar olasıdır veya ne kadar boşa harcarlar?) ve önceliğe (düzeltilirse en büyük etkiyi yaratacak ne olur?) açısından sıralayın.

*(Bu egzersiz, görünüşte olduğu kadar değerli olabilir. Mimariyi birden fazla açıdan sistematik olarak değerlendirme pratiği, bir kıdemli mühendisin temel bir becerisidir.)*

**Kredilerden Sonraki Sahne**

İyi Mimari incelemesinden üç hafta sonra, ekip en yüksek riskli üç düzeltmeyi uygulamıştı.

EC2 yamalaması, AWS Sistem Yöneticisi Yama Yöneticisi aracılığıyla otomatikleştirildi. Bir olay yanıtı süreci dokümanı vardı (mükemmel değil, yazılmış ve paylaşılmış). Çoklu bölge sıcak yedek planı taslandı ve bir sonraki çeyrek için uygulanması planlandı.

Priya, İyi Mimari Aracı raporunu gözden geçirdi. Yüksek riskli sayım: 0. Orta riskli: 3. Düşük riskli: 4.

"Daha iyi durumda olduğumuzdan emin olabiliriz," dedi.

"Bu iyi mi?" Leo sordu.

"İlerlemedir," dedi. "Bir İyi Mimari incelemesi bitirmezsiniz. İlerleme yaparsınız, sonra altı ayda tekrar incelemiş olursunuz."

Maya bir şey düşünüyordu.

"Bunu 31 bölüm boyunca ayrı ayrı AWS hizmetlerini öğrendik," dedi. "Ve şimdi tüm sisteme bakıyoruz. Bu, mimarların düşündüğü gibidir."

"Mimarlar gibi düşünüyoruz," dedi Leo.

"Mimari kararlar alıyoruz," dedi Maya. "Bu farklıdır. Bir mimar gibi düşünmek, kararların yapıldığı *sonra*, değil, önce değerlendirmektir."

"Fark nedir?" Tom sordu.

"Bir sonraki bölüm'de," dedi, "bu cevabı vermeye çalışacağız."

Bir sonraki bölümde: gerçek bir mimari incelemesinin nasıl görüneceği, ilk ilkelerden.
