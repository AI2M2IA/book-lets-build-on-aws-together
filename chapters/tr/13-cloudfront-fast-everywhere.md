# Bölüm 13: Her Yerde Hızlı

Bir fotoğraf, Virginia'daki bir sunucudan Seattle'daki bir telefona giderken yaklaşık 4.400 kilometre optik fiber kablo geçiyor. Işığın üçte iki hızında, bu yaklaşık 25 milisaniyeli saf fizik — kaçınılmaz, pazarlığa açık olmayan, evrenin yasalarına işlenmiş.

Ardından, tur-bırakma süresi ekleyin. Tarayıcı henüz içeriği render etmemişken 80 milisaniye geçmiş oluyor.

`eatnimbus.com` canlıydı. Leo, Batı Kıyısı kullanıcılarından gelen gecikme metriklerini kontrol etmişti: istek başına 80-100 milisaniye. Bu, küçük bir şey gibi durabilir, ancak birikerek etkili olur.

Menüyü yükleyin: 90ms. Restoran listesini yükleyin: 80ms. Restoranın fotoğraflarını yükleyin: 200ms (resimler büyük). Kullanıcının sipariş vermeden önceki toplam süre: iyi bir bağlantıda yarım saniyeden fazla.

“Fizik sorun,” dedi Leo. “Sunucular Virginia’da. Kullanıcılar Batı Kıyısında.”

“O zaman sunucuları Batı Kıyısına taşıyın,” dedi Tom.

“Bu para tutar.”

“Ne kadar?”

“Çok. Ve yeni bir sorun yaratır: Doğu Kıyısı veritabanını ve Batı Kıyısı veritabanını senkronize tutmak.”

Priya, dizüstü bilgisayarından uzaklaşmış bir şekilde baktı. “Ya sunucuları taşımayız. İçeriği taşıyalım.”

**Önceden Dolu Depo Analojisi**

Amazon perakendecisi, bulut şirketinden değil varsayalım. Her ürünün bulunduğu büyük bir depo var. Her ürünü o bir depodan gönderebilseler, uzak şehirlerdeki müşteriler günler hatta haftalar beklerdi.

Bunun yerine, Amazon, büyük şehirlerin yakınlarındaki tamamlayıcı merkezlerden satış yapar. Bir ürün popüler hale geldikçe, o yerel depolar önceden stoklanır. Seattle'dan bir kitap sipariş eden bir müşteri, o kitabı yerel tamamlayıcı merkezden değil, Virginia'dan değil gönderir.

Bu, **İçerik Dağıtım Ağı (CDN)**’dir: İçeriğinizi kullanıcılarınıza yakın dağıtılmış sunuculardan oluşan bir ağ.

Bir kullanıcı Seattle’dan ana sayfanızı istekte bulunursa, CDN’nin Seattle’daki bir sunucudan hizmet vermesi gerekir. Virginia’dan değil. İstek ülkenin içinden geçmez.

**CloudFront Tanışma**

Amazon CloudFront, AWS’nin CDN’sidir. Bu, dünyanın dört bir yanındaki şehirlerde konumlandırılmış önbellekleme sunucularından oluşan küresel bir ağ aracılığıyla çalışır. Şu anda, 90+ şehirde 500’den fazla ön uç konumu bulunmaktadır.

CloudFront’ı yapılandırırken, gerçek içeriğinizin kaynağını belirlemeniz gerekir:

- S3 bucket’ları (resimler, CSS, JavaScript, PDF’ler gibi statik dosyalar)
- Uygulama Yük Dengeleyici (uygulamanızdan dinamik içerik)
- EC2 instance’ları
- İnternetteki herhangi bir HTTP sunucusu

CloudFront, kaynağınızın önünde bulunur. İstekler en yakın ön uç konumundan gelir. Ön uçta önbelleğe alınmış içerik varsa, hemen döndürülür. Aksi takdirde (bir önbellek hatası), kaynağınızdan alınır, önbelleğe alınır ve döndürülür.

**CloudFront Önbelleğe Alma Nasıl Çalışır**

Herhangi bir içeriğin ilk isteği her zaman bir önbellek hatasıdır — kaynağa gider. Her sonraki istek ön uç konumundaki önbelleğe isabet eder.

Nimbus için, menü fotoğrafları mükemmel CloudFront adaylarıdır. Restoran fotoğrafları nadiren değişir (restoran profillerini güncellediğinde). CloudFront ile:

1. Seattle’dan bir kullanıcı `images.eatnimbus.com/restaurant-047/photo.jpg` isteği
2. CloudFront Seattle ön uç konumunu kontrol eder — henüz önbelleğe alınmamıştır (önbellek hatası)
3. CloudFront S3’ten us-east-1’den alınır (~80ms)
4. CloudFront, Seattle ön uç konumunda fotoğrafı önbelleğe alır
5. Aynı fotoğrafı Seattle’dan bir sonraki kullanıcı isteği
6. CloudFront, ön uç önbelleğinden hizmet verir (~5ms)

İlk isteğe 80ms ceza uygulanır. Aynı şehirdeki bininci isteğin 5 milisaniye.

**Cache-Control başlıkları** ve **TTL ayarları** CloudFront’ta önbelleğe alınmış içeriğin ne kadar süreyle önbelleğe alınacağını belirler. Resim dosyaları saatler veya günler boyunca önbelleğe alınabilir. HTML sayfaları (daha sık değişen) dakikalar veya saniyeler boyunca önbelleğe alınabilir.

**Dinamik İçerik: CloudFront Sadece Önbelleğe Alma Değil**

“Ancak API yanıtlarımız neler?” diye sordu Leo. “Bunlar dinamiktir — kullanıcı başına, isteğe göre değişir. Sipariş geçmişi sayfasını önbelleğe alamazsınız.”

Doğru. Ancak CloudFront yine de dinamik içeriklerle yardımcı olur.

İçerik önbelleğe alınamazsa bile, CloudFront isteği en yakın ön uç konumundan aracılığıyla AWS’nin yüksek hızlı fiber ağı üzerinden, yani AWS altyapısının küresel bağlantılarından gelen ağ yolu üzerinden origin’e yönlendirir. Bu, kamu interneti üzerinden yönlendirildikten sonra daha hızlı ve güvenilirdir, burada trafik birden fazla taşıyıcı aracılığıyla atılabilir.

Sonuç: dinamik istekler CloudFront üzerinden origin’e doğrudan gitmeden %20-40 daha hızlıdır. Önbelleğe alma yoluyla değil, ağ yolu sayesinde.

Ayrıca, CloudFront şunları sağlar:

**SSL/TLS sonlandırması**: CloudFront, ön uçta HTTPS’i işler. Kullanıcı ile CloudFront arasındaki bağlantı şifrelenir. CloudFront, isteği içsel olarak HTTP üzerinden origin’e (sonlu uç şifrelemesi için) veya HTTPS üzerinden (sonlu uç şifrelemesi için) bağlayabilir.

**Dağıtık Koruma (DDoS):** CloudFront, AWS Shield Standard ile entegre edilmiştir. Yüzlerce uç konumdan dağıtılmış trafik, saldırıları köken noktanızda değil, uçta emerek azaltır.

**Coğrafi Kısıtlama:** Belirli ülkelerden erişimi engelleyin. Nimbus’un yalnızca belirli pazarlarda lisanslı olması durumunda, CloudFront isteklerin asla sunucularınıza ulaşmadan uçta bunu zorlayabilir.

**CloudFront Davranışları: İnce Taneli Önbellekleme Kuralları**

Bir CloudFront dağıtımı, URL desenlerine göre yönlendirme kurallarına sahip birden fazla **davranışa** sahip olabilir.

Nimbus için:

- `/images/*` → Uçta 7 gün için önbelleğe alınır (fotoğraflar sık değişmez)
- `/static/*` → Uçta 30 gün için önbelleğe alınır (CSS ve JavaScript, sürüm numaralı dosyalarda)
- `/api/*` → Önbelleğe alınmaz, doğrudan yük denetleyicisine yönlendirilir
- `/*` → 5 dakika için önbelleğe alınır (HTML sayfaları)

Bu, CloudFront’un akıllı olmasını sağlar: istikrarlı olanları agresif olarak önbelleğe alır, dinamik olanları aktarır.

**Köken Erişimi Kontrolü: CloudFront ile S3’ü Güvenli Hale Getirme**

S3 bucket’ınızda yalnızca CloudFront üzerinden sunulması gereken özel içerik varsa, S3’ün CloudFront’tan gelmeyen istekleri reddettiğinden emin olmak için **Köken Erişimi Kontrolü (OAC)**’nu kullanabilirsiniz.

Bu şekilde:

- `d1234abcd.cloudfront.net/image.jpg` Hizmet Verilir (CloudFront’un izni var)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Engellenir (doğrudan S3 erişimi engellenir)

İçeriğiniz yalnızca dağıtımınız aracılığıyla, önbellekleme kurallarınız ve güvenlik ayarlarınız uygulandığında erişilebilir.

## Güçlü Yönler ve Sınırlamalar

**CloudFront’un Gücünün Nedenleri:**

- 90+ Şehirlerdeki Uç Konumlar — Çoğu kullanıcı içeriği 20ms’den uzağa alır
- İlk önbellekleme sonrasında statik içerik tek basamaklı milisaniyeler içinde sunulur
- Köken yükünü önemli ölçüde azaltır (tekrar eden trafik asla sunucularınıza ulaşmaz)
- AWS Shield, WAF ve Sertifika Yöneticisi ile entegre
- Kapasite planlama gerekmez — CloudFront otomatik olarak ölçeklenir

**Karmaşık Olduğu Yerler:**

- Önbelleğe alınmış içerik eski olabilir — önbellekleme iptali para (1.000 yol için 0,005 $) maliyetlidir
- Kökende doğru şekilde ayarlanması gereken Cache-Control başlıkları gerekir — hatalar eski içerik sağlar
- Dinamik içerik yönlendirme optimizasyonundan fayda görmez, ancak önbelleklemeden değil
- Önbellekleme davranışının (nerede önbelleğe alınır, ne kadar süreyle) anlaşılması, köken başlıkları, CloudFront TTL ayarları, davranış kuralları gibi birden çok katmanı anlamayı gerektirir
- CloudFront üzerinden veri çıkışı para maliyetlidir, ancak standart veri çıkışından daha azdır

## Özet

- Bir **CDN**, kullanıcılarınıza yakın uç konumlarında içeriğin kopyalarını önbelleğe alır — gecikmeyi ve köken yükünü azaltır.
- **CloudFront**, AWS’nin CDN’si olup, küresel olarak 500+ uç konumuna sahiptir.
- Önbellekleme hataları, içeriği köken (S3, ALB, EC2)’den getirir. Önbelleğe alınmış hit’ler, uçtan sunar — milisaniyeler, yüzlerce milisaniyeler değil.
- **Davranışlar**, farklı URL desenleri için farklı önbellekleme kurallarını ayarlamanıza olanak tanır.
- Dinamik içerik önbelleğe alınmaz, ancak CloudFront yine de özel bir ağ üzerinden performansı artırır.
- **Köken Erişimi Kontrolü**, doğrudan S3 erişimini kısıtlar — içerik yalnızca CloudFront aracılığıyla sunulur.
- Shield (DDoS), WAF (uygulama güvenlik duvarı) ve ACM (SSL sertifikaları) ile entegre.

## Sınav İpuçları

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarlamak (Alan 3, Görev 3.4)*

- **CloudFront + S3**: Statik web sitelerini küresel olarak sunmak için klasik bir sınav deseni. S3 bucket köken olarak, CloudFront CDN olarak ve doğrudan S3 erişimini önlemek için Köken Erişimi Kontrolü olarak kullanılır.
- **Uç Konumlar vs Bölgeler vs ATS:** Uç konumlar daha sayıdır ve yalnızca önbellekleme/CDN amaçları için vardır. ATS’ler (bilgisayar çalıştırmanızın olduğu yerler) değildir.
- **Önbellekleme İptali**: `/images/*` önbellekleme iptali oluşturarak CloudFront’un taze içerik almasını zorlar. Para maliyetlidir — sınav, daha uygun maliyetli alternatif olan sürüm numaralı URL’leri (`image-v2.jpg` gibi) sorabilir, bu da önbellekten doğal olarak atlatır.
- **TTL Kontrolü**: Kökende `Cache-Control: max-age=3600` ayarlanarak 1 saatlik bir TTL ayarlanır. CloudFront bu başlıkları uygular.
- **CloudFront Fonksiyonları vs Lambda@Edge**: CloudFront Fonksiyonları, uçta hafif istek/yanıt manipülasyonu için çalışır (milisaniyeler içinde). Lambda@Edge, daha ağır işleme için uç konumlarında Lambda kodunuzu çalıştırır. Sınav, kullanım durumunun karmaşıklığına göre bunları ayırır.
- **İmzalanmış URL’ler ve İmzalanmış Cookie’ler**: CloudFront aracılığıyla içeriğe kimin erişebileceğini kontrol eder. İmzalanmış URL’ler, belirli dosyalar için erişim sağlar; imzalanmış cookie’ler, birden çok dosya için erişim sağlar. Sınav, “ödüllü abone içeriği” için bu kullanır.

## Uygulama Alıştırmaları

**Uygulama 1 — Hatırlama**

CloudFront önbellekleme hit’i ve önbellekleme hatası arasındaki farkı açıklayın. Her durumda ne olur?

*(İpucu: İçeriğin nereden geldiğini ve iki durumda yanıt süresinin farklı olduğunu düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir yazılım şirketi, müşterilerine dünya genelinde dağıtmak için (~2GB'lık) büyük kurulum dosyalarını bir S3 bucket'tan aktarıyor. Asya'daki müşteriler için indirme hızları yavaş. Takım, S3 bucket'ı birden fazla bölgeye çoğaltmadan performansı iyileştirmek istiyor. Ayrıca, yalnızca ödeme yapan müşterilerin kurulum dosyalarını indirebilmelerini sağlamaları gerekiyor.

Hangi çözüm bu gereksinimleri en iyi karşılar?

A) Bucket'ta S3 Transfer Acceleration'ı etkinleştirin ve ödeme yapan müşteriler için ön imzalı URL'ler oluşturun
B) S3 bucket'ını kaynağı olarak kullanan CloudFront ile, Origin Erişimi Kontrol'ü etkinleştirin ve ödeme yapan müşteriler için CloudFront imzalı URL'ler kullanın
C) Her AWS bölgesinde bir S3 bucket'ı oluşturun ve müşterileri en yakın bucket'a yönlendirmek için Route 53 coğrafi konum yönlendirmesini kullanın
D) Her bölgede bir Uygulama Yük Dengeleyici ile EC2 örnekleri kullanarak kurulum dosyalarını sunun

**İpuçları 1**: Gereklilik, bucket'ı çoğaltmadan küresel performansı artırmaktır. Hangi seçenek birden fazla bucket gerektirmez?

**İpuçları 2**: CloudFront'ta içerik erişimini kontrol eden hangi hizmettir?

**İpuçları 3**: S3 Transfer Acceleration, S3'a uzun mesafeli yüklemeler için optimize edilmiştir *içine*. S3'ten son kullanıcılar küresel olarak içerik dağıtmak için, CloudFront doğru araçtır.

**Cevap**: B

**Açıklama**: CloudFront, kurulum dosyalarını ilk indirme işleminden sonra küresel olarak uç noktalar konumlarında depolar. Aynı bölgedeki kullanıcılar tarafından saatler içinde yayınlandıktan sonra aynı videoyu izleyen binlerce kullanıcı için, uç noktadan gelen indirmeler, S3'ten Pasifik'i geçmekten çok daha hızlıdır. Origin Erişimi Kontrol'ü, S3 bucket'ının CloudFront aracılığıyla yalnızca erişilebilir olmasını sağlar. İmzalı URL'ler, ödeme yapan müşterilere erişimi sınırlar.

**Neden A?** S3 Transfer Acceleration, S3'e *içine* uzun mesafeli yüklemeler için optimize edilmiştir - küresel bir kitleye *S3'ten* içerik dağıtmak için değil. Bunun için CloudFront doğru araçtır. Ön imzalı URL'ler erişimi kontrol eder, ancak küresel performansı artırmaz.

**Neden C?** S3 bucket'ını bölge başına oluşturmak işe yarar, ancak birden fazla bucket'ı önlemek gerektiği gereksinimiyle çelişir. Ayrıca, bucket'lar arasında bir senkronizasyon stratejisi gerektirir.

**Neden D?** Her bölgede bir yük dengeleyici arkasında EC2 örnekleri kullanmak, CloudFront'a ve birden fazla bölgede sunucuları yönetme ihtiyacına kıyasla önemli ölçüde daha pahalıdır.

*SAA-C03 Alanı: Yüksek Performanslı Mimarileri Tasarla - Görev 3.4*

**Egzersiz 3 — Mimari Zorluğu** *(İsteğe Bağlı)*

Nimbus, kısa yemek tarif videolarını restoran ortaklarından eklemek istiyor. Videolar 50-500MB arasında olabilir. Videoların yayınlandıktan sonra saatler içinde aynı şehri ziyaret eden binlerce kullanıcı tarafından izleneceğini bekliyorlar.

Depolama ve teslimat mimarisini tasarlayın. S3 ve CloudFront kullanır mıyız? İlk isteği (soğuk başlatma) en aza indirmek için nasıl ele alırız? Yayınlandıktan sonra değişmeyen bir video için hangi önbellek TTL'yi ayarlamalıyız?

*(Tek bir doğru cevap yoktur. Amaç, CDN tasarım kararları uygulamaktır.)*

## Kredilerden Sonraki Sahne

Priya, yayınlandıktan sonra CloudFront metriklerini izledi.

Önbellek çarpma oranı: %83.

"Bu ne anlama geliyor?" Tom sordu.

"Bu, içeriğin, ilk indirmeden sonra onlara en yakın uç nokta konumundan gelen 83 kullanıcıya ulaştığı anlamına geliyor, us-east-1'den değil."

"Ve diğer %17'si?"

"İlk istekler. O uç nokta konumunda henüz önbelleğe alınmamış içerik."

Tom metrikleri baktı. "Yani, CloudFront uç nokta düğümlerinden yaklaşık bir milyon isteği günde karşılıyoruz. Ve bunların sadece 170.000'i aslında sunucularımıza ulaşıyor."

"Evet."

"Yani, CloudFront yokken sunucularımız bir milyon isteği 140-160 milisaniyede işletecekti."

Tom geri oturdu. Maya'nın tanıdığı bir bakışa sahip olduğunu fark etti - gerçek zamanlı olarak maliyeti yeniden hesaplayan bakış.

"Bu buna değer," dedi.

Maya zaten laptop'ında. "Platform ekibinden Soo-Jin ve Rafael — güvenlik konusunda uzmanlaşmıştı. Onları ilk günlerine başlamadan önce IAM'de eğitmek istiyorum."

"İleri düzey IAM?" Leo sordu.

"Roller, politikalar, çapraz hesap erişimi. Gerçek şey."

Sonraki bölümde: bir sistem bölümünün diğerine güvenli bir şekilde konuşmasına izin veren ince taneli izinler.
