\newpage

*Telif Hakkı © 2026 AI(2)M(2)IA*

*Bu kitap ücretsizdir. Onu okumakta, kopyalamakta, çevirmekte, uyarlamakta ve paylaşmakta — herhangi bir dilde ve herhangi bir biçimde — ücretsiz olarak özgürsünüz; Creative Commons Atıf-GayriTicari-AynıLisanslaPaylaş 4.0 Uluslararası (CC BY-NC-SA 4.0) lisansı altında.*

*Açıkça: bu kitabı ya da ondan ürettiğiniz hiçbir şeyi satamazsınız ve ödeme duvarı ardına koyamazsınız — erişim her zaman ücretsiz kalmalıdır. Çalışmanız için gönüllü destek isteyebilirsiniz, ancak bu destek asla okumanın koşulu olamaz.*

*Örneğin: bu kitabı Esperanto'ya çevirip kendi sürümünüzü yayımlarsanız, okurları katkıda bulunmaya davet edebilirsiniz — ama herkes çevirinizi ödeme yapmadan okuyabilmelidir. Sıfırdan bir depo oluşturup bu içerik üzerine yeni bir çalışma kılavuzu kurarsanız, aynı kural geçerlidir: bağışlar evet; erişime fiyat hayır.*

*Yazar, kendi baskılarını satma hakkını saklı tutar — örneğin, satın alınması bir sonraki kitabı finanse etmeye yardımcı olan Amazon Kindle baskısı.*

*Bu kitabın ücretsiz tamamlayıcıları var. Kaynağı okuyun, çevirin veya depoda geliştirmeye yardım edin: https://github.com/AI2M2IA/book-lets-build-on-aws-together. Alıştırma uygulamasıyla (bir oyun) ücretsiz çalışın: https://ai2m2ia.github.io/book-lets-build-on-aws-together. Videoları izleyin: https://www.youtube.com/playlist?list=PL9jytbqPPUEgTdZvVIdHxtXahX8922oYN. Tam koşullar: LICENSE-CONTENT (kitap metni, CC BY-NC-SA 4.0) ve LICENSE (kod, AGPL-3.0).*

*Nimbus'un hikayesi ve karakterleri kurgusaldır. Yaşayan ya da ölü gerçek kişilerle ya da gerçek olaylarla herhangi bir benzerlik tamamen tesadüftür.*

*Bu kitapta açıklanan AWS hizmetleri, fiyatlandırma modelleri, en iyi uygulamalar ve sınav içeriği, yayın tarihi itibarıyla kamuya açık belgelere dayanmaktadır. Amazon Web Services, AWS ve ilgili markalar, Amazon.com, Inc. veya bağlı kuruluşlarının ticari markalarıdır. Bu kitap bağımsız bir eğitim kaynağıdır ve Amazon Web Services ile herhangi bir bağlantısı, onayı veya sponsorluğu bulunmamaktadır.*

*AWS fiyatlandırması ve hizmet özellikleri sık sık değişmektedir. Mimari veya finansal kararlar vermeden önce her zaman aws.amazon.com adresindeki güncel bilgileri doğrulayın.*

*AWS Solutions Architect Associate (SAA-C03) sınavı gerçek bir sertifikasyon sınavıdır. Kayıt için aws.amazon.com/certification adresini ziyaret edin.*

*Birinci Baskı, 2026*

*Amazon KDP aracılığıyla basılmış ve dağıtılmıştır*

---

\newpage

# Yöntem Hakkında Bir Not

Bu kitap, bu rafta yer alan her ciltte uygulanan uygulamayla uyumlu olarak, yapay zeka yardımıyla yazılmış ve AI(2)M(2)IA takma adıyla yayımlanmıştır.

Takip edeceğiniz müfredat — öncülü, karakterleri, Nimbus'un altyapısının bir restoran telefon hattından üretim düzeyinde bir AWS mimarisine uzanan şekli, ekibin baskı altında yaptığı dengeler ve ilk seferinde yanlış yaptıkları — bir insan yazar tarafından seçilmiş ve büyük bir dil modeliyle yapılan uzun bir işbirliği sürecinde hizmet hizmet aktarılmıştır. Kapak, aynı yönlendirme altında bir görsel oluşturma modelinin yardımıyla tasarlanmıştır. E-kitabın kendisi otomatik araçlarla hazırlanmıştır.

Okuduğunuz şey, korunan şeydir.

Bu sayfalarda, yardımsız bir yazarlık iddiası yoktur; makinenin tek başına yazar olduğuna dair bir iddia da yoktur. Eser, tıpkı tarif ettiği altyapı gibi, birbirine bağımlı katmanlarla ayakta durmaktadır.

---

\newpage

*Bir tarayıcı açan, bir komut yazan ve bir şeylerin çalışmasını sağlayan herkese —
ve bir tarayıcı açan, bir komut yazan ve
çalışmayandan öğrenen herkese.*

---

\newpage

# Önsöz

Muhtemelen daha önce AWS öğrenmeye çalıştınız.

Belki belgeleri açtınız ve on dakika sonra, IAM'ın ne işe yaradığını bile anlamadan IAM politika sözdizimini incelediğinizi fark ettiniz.

Belki bir video kursu bitirdiniz ve bir web sitesinin aslında nerede yaşadığını hâlâ açıklayamadığınızı fark ettiniz.

Belki bir sınav rehberinin altını çizdiniz, hizmet adlarını ezberlediniz ve ardından bir senaryo sizi akşam yemeği yoğunluğunda bir veritabanı arızasında ne yapacağınızı sorduğunda ilk kez donup kaldınız.

Bu sizin hatanız değil.

Bulut bilişim genellikle böyle öğretilir: önce bir katalog, sonra bir sistem.

Bu kitap farklı çalışır.

**AWS'yi çalışmayacaksınız. Onu kullanacaksınız.**

Telefon hattı meşgul olduğu ve web sitesi olmadığı için sipariş kaybeden bir restoran ile başlıyoruz.

Oradan, Maya, Tom, Priya ve Leo'yu, Nimbus'un altyapısını bir seferde bir karar alarak oluştururken takip edeceksiniz. Bir sertifikasyon müfredatının tercih edeceği düzenli sırayla değil, gerçek sistemlerin gerektirdiği dağınık sırayla.

Sonunda Nimbus, günde 18.000 sipariş işliyor olacak: birden fazla Erişilebilirlik Alanı'nda çalışıyor, arızalardan otomatik olarak kurtarıyor, bir içerik dağıtım ağı aracılığıyla Batı Kıyısı kullanıcılarına milisaniyeler içinde hizmet veriyor, her siparişi gerçek zamanlı bir analitik boru hattından geçiriyor ve altyapı işle birlikte büyürken maliyetleri kontrol altında tutuyor.

Bu kitaptaki her AWS hizmeti, gerekli hale geldiği anda ortaya çıkar. Müfredatın talep ettiği için değil. Sistemin talep ettiği için.

**Bu kitap kimler için** Eğer belgelerden ziyade sorunlar üzerinden daha iyi öğreniyorsanız, bu kitap sizin için yazılmıştır. AWS Solutions Architect Associate sertifikasyonu (SAA-C03) için hazırlanıyorsanız, bu kitap da sizin içindir: her sınav alanı ele alınmış ve her bölüm Sınav İpuçları ve SAA-C03 tarzı pratik sorularla sona ermektedir. Zaten mühendislik alanında çalışıyorsanız ve mimari kararların *neden* işe yaradığını, hizmetlerin adları ne olursa olsun, anlamak istiyorsanız, bu mantığı her sayfada bulacaksınız.

**Burada ne bulamazsınız** Bir kısayol. Bu bir ezber rehberi değildir. Ezber rehberinden daha uzundur çünkü anlamak, ezberlemekten daha uzun sürer ve gerçek anlaşılırlık bir sonraki rolünüze, bir sonraki sisteminize ve hiç kimsenin düzgünce belgelemediği üretim olayına aktarılan şeydir.

**Bu kitap nasıl okunur** İlk okuyuşunuzda bir roman gibi okuyun. Ekip gerçek sorunlarla karşılaşıp gerçek dengeler yaparken altyapının kendini ortaya koymasına izin verin. Her bölümün sonunda durun ve Sınav İpuçları ile egzersizleri etkin biçimde kullanın: cevapları kapatın, senaryoyu kendiniz düşünün ve ardından ne olduğunu kontrol edin.

Bitirdiğinizde, Nimbus üretimde olacak. AWS anlayışınız da öyle.

Başlayalım.
