# Bölüm 27: İhtiyacınız Olanı Ödeme

Tom, Nimbus’un başlamasından beri her ay AWS faturalarını gözden geçiriyordu. İlk yıl boyunca, gördüğü şeyin yaklaşık %60’ını anlıyordu. Şimdi ise neredeyse her şeyi anlıyordu - sadece EC2 bölümü hariç.

EC2 bölümü, saat başına fiyatlandırılan çeşitli instance türlerinde “On-Demand Instances”’ların bir karışımıydı ve toplamda aylık 2.340 dolar ediyorlardı.

“Bu instance’lara ihtiyacımız olduğunu biliyorum,” dedi Tom. “Ama neden tam olarak bu walk-in oranını ödelediğimizi anlamıyorum.”

“Walk-in oranı?” Leo sordu.

“On-Demand fiyatlandırma,” dedi Tom. “Bir otel odasını ihtiyacınız olduğunda sabah rezervasyon yapmaya benzer. Maksimum esneklik. Maksimum fiyat.”

“Peki alternatif nedir?”

Tom, EC2 fiyatlandırma sayfasını açtı.

“Dört fiyatlandırma modeli var,” dedi. “Ve sadece birini kullanıyoruz.”

**Otel Benzetmesi**

EC2 fiyatlandırması, otel oda rezervasyon stratejilerine şaşırtıcı derecede iyi uyuyor:

**On-Demand:** Önceden bir rezervasyon yapmadan resepsiyona gidip odanın tam fiyatını ödersiniz. İstediğiniz zaman çıkabilirsiniz. Tahmin edilemeyen seyahatler için mükemmeldir.

**Rezervasyonlu Instance’lar/Tasarruf Planları:** Yıl boyunca önceden rezervasyon yaparsınız. Kullanımınız için %30-72 oranında önemli bir indirim alırsınız.

**Spot Instance’lar:** Otel, o anki teklifine göre boş odalar için teklif verir. %90’a kadar indirim. Ancak, tam fiyatlı bir müşteriye ihtiyaçları olması durumunda iki dakikalık süre içinde odadan çıkarılmanız istenebilir.

**Özel Host’lar:** Otelde diğer misafirlerle paylaşmadan kendinize özel olarak tüm katı kiralamak. Çok daha pahalıdır. Yazılım lisanslama veya uyumluluk kuralları paylaşmayı önlediğinde gereklidir.

Her modelin bir kullanım durumu vardır. Nimbus’un yaptığı hata: 24 saat boyunca çalışan ve tamamen tahmin edilebilir olan iş yükleri için her şeye On-Demand kullanmaktı.

**On-Demand Instance’lar: Maksimum Esneklik, Maksimum Maliyet**

**Ne zaman kullanılmalı:**

- Tahmin edilemeyen iş yükleri (tahmin edilemeyen trafik zirveleri)
- Geliştirme ve test (sık sık başlatılır ve durdurulur)
- Kısa vadeli iş yükleri (bir hafta için bir deneyi çalıştırmak)
- İlk dağıtım (kullanım kalıplarınızı anlamadan önce)

**Ne zaman kullanılmamalı:**

- Bir yıldan fazla çalışması bilinen ve sabit bir yükü olan üretim iş yükleri
- Tahmin edilebilir bir temel yük her şeyden

Tom’un Nimbus’un On-Demand instance’ları:

- Web API sunucuları: 4 EC2 instance’ı, 18 ay boyunca 24/7 çalışıyor. *Tahmin edilebilir temel yük.*
- Veritabanı proxy’si (RDS Proxy): Sürekli çalışıyor. *Tahmin edilebilir temel yük.*
- VPN sunucusu: Sürekli çalışıyor. *Tahmin edilebilir temel yük.*
- Trafik zirveleri için ek API sunucuları: Tahmin edilemez. *On-Demand burada doğru.*

**Rezervasyonlu Instance’lar: Yıllık Taahhüt**

**Rezervasyonlu Instance’lar (RIs)**, belirli bir instance türünü belirli bir bölgede 1 veya 3 yıl için kullanmaya yönelik bir ödeme taahhüdüdür. Buna karşılık, AWS daha düşük saatlik bir oranla faturalandırır.

**İndirim Seviyeleri:**

- 1 yıl, Ön Ödeme Yok: On-Demand’e göre yaklaşık %30-40 indirim
- 1 yıl, Kısmi Ön Ödeme: Daha az ön ödeme yapıp daha az saat başına indirim (%35-45)
- 1 yıl, Tüm Ön Ödeme: En yüksek indirim (%40-50)
- 3 yıl, Tüm Ön Ödeme: En yüksek indirim, en yüksek taahhüt (%55-72)

**Standart vs. Dönüştürülebilir RIs:**

- **Standart:** Instance türü ve bölgeyle sabit kalır. İhtiyacınız olmadığında Rezervasyonlu Instance Piyasasında satılabilir.
- **Dönüştürülebilir:** Taahhüt süresi boyunca instance türü, işletim sistemi ve kiralanma türü değiştirilebilir. Standart’a göre daha az indirim (%72’ye maksimum %50).

Tom, 4 API sunucusu (r6g.large, saat başına 0,252 dolar On-Demand) için hesaplamayı yaptı:

- Yıllık On-Demand maliyeti: 0,252 × 24 × 365 × 4 = 8.820 dolar
- 1 yıl Tüm Ön Ödeme RI (1 instance): Önceden yaklaşık 1.600 dolar
- 4 instance: Önceden 6.400 dolar = **İlk yılda 2.420 dolar tasarruf**

“Sadece taahhüt ettiğimiz için 2.420 dolar tasarruf edebiliriz,” dedi Tom.

“Bir taahhüttür,” dedi Maya. “Instance türlerini değiştirmemiz gerekirse ne olur?”

“Eğer muhtemelen yaparsak Dönüştürülebilir RIs alabiliriz.”

“AWS daha iyi bir instance türü yayınlarsa ne olur?”

“RI’nin süresi dolduğunda kontrol ederiz. Yeni tür daha iyiyse, yeni bir RI satın alırız.”

**Tasarruf Planları: Esnek Taahhüt**

**Tasarruf Planları**, Rezervasyonlu Instance’lara göre daha yeni ve daha esnek bir alternatiftir. Instance türüne bir taahhüt yerine, saatlik harcama için bir *miktara* taahhüt edersiniz (dolar cinsinden).

**Hesaplama Tasarruf Planları:** Herhangi bir EC2 instance’ına uygulanır, ne tür olursa olsun, boyutu, bölgesi veya işletim sistemi. En esnektir. %66’ya kadar indirim.

**EC2 Instance Tasarruf Planları:** Bir instance ailesine (örneğin, “c6g instance’ları” gibi) belirli bir bölgede (örneğin, “us-east-1”) uygulanır. Hesaplama Tasarruf Planı’na göre daha kısıtlayıcıdır, ancak aynı maksimum indirim (%72) sunar.

**SageMaker Tasarruf Planları:** SageMaker ML eğitimi ve çıkarımına özeldir.

Nimbus için: API sunucuları için Hesaplama Tasarruf Planları. 1,50 dolar/saat EC2 harcamına taahhüt ettiler. Herhangi bir instance türü, herhangi bir boyut, herhangi bir bölge, herhangi bir işletim sistemi. Fleet’lerini ölçeklendirdiklerinde veya instance türlerini değiştirdiklerinde Tasarruf Planı hala geçerlidir.

"Bu, Rezervasyonlu Instance'lar için daha iyi," dedi Leo. "Hala instance türleriyle deneme yapıyoruz. Compute Tasarruf Planı, bizi özellikle r6g'ye bağlamadan bize iskonto sağlıyor."

**Spot Instance'lar: %90'lık İndirim**

**Spot Instance'lar**, AWS'nin boşta EC2 kapasitesini kullanır. AWS'nin kullanılmayan sunucuları olduğunda, bunları On-Demand fiyatının %60-90'ı altında kiralayabilirsiniz. AWS, kapasiteyi geri ihtiyaç duyduğunda (On-Demand veya Rezervasyonlu müşteriler için) size 2 dakikalık bir uyarı verir ve instance'ınızı sonlandırır.

Kesinti riski, tanımlayıcı bir özelliktir. Spot Instance'lar yalnızca aşağıdaki durumlarda uygundur:

- **Hata Toleranslı Yükler**: Bir instance ortasında bir görev sırasında sonlandırılırsa, görev herhangi bir şeyi bozmadan yeniden başlayabilir
- **Durumsuz İşleme**: Resim yeniden boyutlandırma, video kodlama, toplu analiz, ML eğitimi
- **Kısa Süreli Toplu İşler**: 2 dakikalık uyarı yeterlidir durumunu kaydetmek ve kontrol noktası oluşturmak için
- **Otomatik Ölçekleme Karışık Filolar**: Spot'u ASG'nizin çoğunluğu için kullanın ve On-Demand'i bir temel olarak kullanın

Nimbus için: Spot Instance'lar, her gece (bir günlük sipariş verilerini toplu raporlara dönüştüren) analitik işler için mantıklıydı. Bir Spot Instance ortasında bir iş sırasında sonlandırılırsa, iş başarısız olur, ancak yeni bir instance üzerinde yeniden başlar. S3'teki veriler güvenlidir.

"Spot'u gece işi için kullanmak, maliyetini 12 ABD Doları/gece'den 2 ABD Doları/gece'ye düşürdü," diye rapor etti Leo.

**Özel Sunucular: Uygunluk Seçeneği**

Bazı yazılım lisansları (Oracle, Windows Server bazı konfigürasyonlarda) her soket veya çekirdek başına fiyatlandırılır. Bu yazılımı paylaşılan bir sunucuda (EC2 için varsayılan) çalıştırıyorsanız, kullanmadığınız kapasite için ödeme yapabilirsiniz.

**Özel Sunucular**, tamamen sizin kullanımınız için fiziksel bir sunucuya erişmenizi sağlar. Mevcut her soket lisanslarınızı getirebilirsiniz. Başka bir AWS müşterisinin aynı donanımda çalışacak instance'ları yoktur.

Özel Sunucular, standart EC2'ye göre önemli ölçüde daha pahalıdır. Uygunluk ve lisanslama aracıdır, maliyet optimizasyon aracı değildir.

Nimbus'un lisanslama gereksinimleri için Özel Sunuculara ihtiyaç duyması gerekmiyordu. Çoğu yerleşik uygulama da böyle değildir.

**Karışık Bir Filo Oluşturma**

Olgun yaklaşım: birden fazla fiyatlandırma modeli birlikte kullanmaktır.

Nimbus'un API filosu için:

- **Temel Yük (4 instance, her zaman çalışır)**: Tasarruf Planı taahhüdü ile kaplı
- **Tahmin Edilebilir Tepe (iş saatlerinde 2 ek instance)**: Taahhüt tarafından kapsanıyorsa Tasarruf Planı ile, aksi takdirde On-Demand
- **Trafik Dalgalanması Aşırılığı**: Spot Instance'lar (API sunucuları durdurulabilen durumsuz olduğundan istekler sonlandırılan bir instance'da yeniden dağıtılabilir olduğundan kabul edilebilir)

Sonuç: her katmanında maliyeti optimize eden bir filo - tahmin edilebilir kısım için taahhütli fiyatlandırma, tahmin edilemeyen büyüme için On-Demand, kesinti kapasitesi için Spot.

## Güçlü Yönler ve Sınırlamalar

**On-Demand**: Hiçbir taahhüt yok. Tam fiyat. Tahmin edilemez veya kısa vadeli iş yükleri için kullanın.

**Rezervasyonlu Instance'lar**: %72'ye kadar indirim. Belirli bir instance türü/bölge/OS'ye kilitlenir. RI Piyasasında kullanılmayan kapasiteyi satar.

**Tasarruf Planları**: %66-72'ye kadar indirim. RI'lara göre daha esnektir (Compute Tasarruf Planları herhangi bir instance türüne uygulanır). Otomatik olarak eşleşen kullanımına uygulanır.

**Spot Instance'lar**: %90'a kadar indirim. 2 dakikalık kesinti riski. Yalnızca hata toleranslı, durumsuz, kesilebilir iş yükleri için kullanın.

**Özel Sunucular**: Tam fiziksel sunucu. En pahalı. Bazı lisanslama veya uygunluk senaryoları için gereklidir.

## Özet

- EC2 fiyatlandırması dört modelden oluşur: **On-Demand** (tam fiyat, hiçbir taahhüt yok), **Rezervasyonlu Instance'lar/Tasarruf Planları** (önemli bir indirim için taahhütlü harcama), **Spot** (kullanılmayan kapasite %60-90 indirimle, kesilebilir), **Özel Sunucular** (fiziksel sunucu özgünlüğü).
- **Tasarruf Planları**, RI'lara göre daha fazla esneklik için tercih edilmelidir.
- **Spot Instance'lar**, hata toleranslı, durumsuz iş yükleri gerektirir - toplu işler, ML eğitimi ve kesilebilir işleme için yalnızca.
- Optimal strateji, bir karışık filo kullanmaktır: temel için Tasarruf Planları, tahmin edilemeyen büyüme için On-Demand, kesinti kapasitesi için Spot.
- İş yüklerinin 3 aydan uzun süre istikrarlı bir şekilde çalıştığı zamanlarda fiyatlandırma modellerini gözden geçirin - bu, On-Demand'in boşa harcanmaya başladığı zamandır.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimarileri Tasarlama (Alan 4, Görev 4.2)*

- **Standart Tasarruf Planları vs Rezervli Instance'lar:** Standart Tasarruf Planları, Hesap Tasarruf Planları için herhangi bir EC2 örneğine uygulanabilen daha fazla esnekliğe sahiptir (uygulamaya göre). Rezervli Instance'lar, belirli bir örnek türüne kilitlenir. Senaryo testleri: "Maksimum esnekliği korurken indirimler almak istiyoruz" → Standart Tasarruf Planları. "3 yıl için tam olarak örnek türünü biliyoruz" → Maksimum indirim için Standart Rezervli Instance.
- **Spot sinyalleri:** "Maliyet hassasiyeti," "hata toleransı," "toplu işleme," "kesintilere dayanabilme," "durumsuz iş yükleri," "ML eğitimi" → Spot.
- **Spot kesinti yönetimi:** Spot instance'leri sonlandırmadan önce 2 dakikalık bir uyarı alır. Uygulamanız bu durumla zarif bir şekilde başa çıkmalıdır (durumun kaydedilmesi, bağlantıların kapatılması, temiz bir şekilde çıkış yapılması).
- **On-Demand vs Spot web sunucuları için:** Canlı kullanıcı trafiğini servis eden web sunucuları Spot kullanmamalıdır (kesinti nedeniyle başarısız istekler). Web katmanı için On-Demand veya Standart Tasarruf Planları kullanın.
- **EC2 Standart Tasarruf Planları vs Hesap Tasarruf Planları:** EC2 Standart Tasarruf Planları, belirli bir örnek ailesi ve bölgeye uygulanır (daha yüksek indirim). Hesap Tasarruf Planları, herhangi bir EC2 örneği, Lambda ve Fargate'e uygulanır (daha düşük maksimum indirim, daha fazla esneklik).
- **Rezervli Instance Piyasası:** Kullanılmayan Standart Rezervli Instance'lar, diğer AWS müşterilerine satılabilir. Dönüştürülebilir Rezervli Instance'lar satılamaz.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Spot Instance'lar ne zaman uygun ve ne zaman uygun değildir? Bir iş yükünü uygun hale getiren özellik nedir?

*(İpucu: Instance sonlandırıldığında 2 dakikalık uyarı ile ne olduğu düşünün. Hangi iş yükleri temiz bir şekilde kurtulur? Hangi iş yükleri kurtulmaz?)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo*: Bir medya şirketi, yüklenen videoları birden fazla formata dönüştüren bir video transkodlama boru hattı çalıştırır. Transkodlama işleri, videolar yüklenene her zaman (24/7 çalışma, değişken hacim) sürekli olarak çalışır. Her iş 5-30 dakika sürer. Bir transkodlama işi kesilirse, iş başlangıçtan yeniden başlatılabilir ve veri kaybı olmaz. Şirket maliyeti en aza indirmek istiyor.

Bu gereksinimleri karşılayan EN İYİ EC2 fiyatlandırma modeli hangisidir?

A) Otomatik Ölçekleme Grubu'nda On-Demand örnekleri
B) 1 Yıl, Tüm Ön Bilgitli Rezervli Instance'lar
C) Spot Instance'lar ile Otomatik Çeşitlendirme için Spot Fleete
D) Şirketin mevcut medya yazılım lisanslarıyla Özel Host'lar

*(İpucu 1*: "Başlangıçtan yeniden başlatılabilir veri kaybı olmadan" - bu anahtar ifade, belirli bir fiyatlandırma modelini etkinleştirir.

*(İpucu 2*: "Maliyeti en aza indir" bir kesintiye tabi iş yükü için en yüksek indirim seçeneği anlamına gelir.

*(İpucu 3*: Spot Fleete birden çok örnek türünden ve AZ'lerden istekler yaparak kesinti olasılığını azaltır.

**Cevap**: C

**Açıklama**: Transkodlama işleri hata toleranslıdır - kesildiklerinde yeniden başlatılabilirler. Bu, Spot Instance'lar için uygun hale getirir, bu da On-Demand'e göre %60-90 indirim sunar. Spot Fleete, örnek türleri ve kullanılabilirlik bölgeleri arasında çeşitlilik sağlar, bu da toplu kesinti olasılığını azaltır.

**Neden A?** On-Demand, en yüksek maliyetli seçenektir. Sürekli çalışan, hata toleranslı bir iş yükü için bu boşa harcamadır.

**Neden B?** Rezervli Instance'lar %50-72'lik bir indirim sağlar ancak kesintiye tabi iş yükleri için %90'lık maksimum indirim potansiyeli sunmaz. Ayrıca, RI'lar istikrarlı, sürekli durum iş yükleri için tasarlanmıştır - Spot, kesintiye tabi toplu işleme için özel olarak tasarlanmıştır.

**Neden D?** Özel Host'lar, lisans uyumluluğu için kullanılır, maliyet optimizasyonu değildir. En pahalı seçenektir.

*SAA-C03 Alanı: Maliyeti Optimize Edilmiş Mimarileri Tasarla - Görev 4.2*

**Uygulama 3 — Mimari Zorluğu *(İsteğe Bağlı)***

Nimbus'un iş yükleri şunlardır:

1. API sunucuları: 6 örnek, 24/7 çalışır, 2 yıldır kararlı, r6g.large kullanır
2. Günlük analiz toplu işleri: 4 örnek, her gece 3 AM-6 AM'de çalışır, her zaman aynı örnek türü
3. Test ortamı: 2 örnek, mühendisler hafta içi 9 AM-6 PM'de kullanılır
4. Trafik ani akışı: 0-8 örnek, zirve saatlerde devreye girer, tamamen öngörülemez

Her iş yük türü için optimum fiyatlandırma stratejisini tasarlayın. İş yükleri 1 ve 2 için kapsama alanı oluşturacak Tasarruf Planı taahhüt miktarı nedir? İş yükü 3 için On-Demand'e göre daha akıllı bir strateji var mı?

*(Tek bir doğru cevap yoktur. Amaç, EC2 fiyatlandırma stratejisini uygulamaktır.)*

## Son Cekiş

Tom Tasarruf Planı satın alımını teslim etti.

Saatlik taahhüt miktarı: 5,76 dolar. Üç yıllık bir terim. Hesap Tasarruf Planları için esneklik.

Tahmini tasarruf: 42.500 dolar üç yılda.

Maya bu sayıyı okudu. "Yirmiş dört bin dolar."

"On-Demand için aynı örnekler için üç yılda."

"Bunu yapmak ne kadar sürdü?"

"Bir öğleden sonra analiz," dedi Tom. "Ve taahhüt yapma kararı."

"Üç yıl uzun bir zamandır," dedi Leo. "Eğer örnek türleri değişirse ne olur?"

"Hesap Tasarruf Planları herhangi bir EC2 örnek türüne uygulanabilir. Ve üç yılda, büyük olduğumuzda bu sohbet farklı bir şekilde görünecektir."

Leo bunun üzerine düşündü.

"Tasarruf Planları ne kadar süredir biliyor musun?" diye sordu.

"Başlangıçtan beri," Tom dedi. "Yükün istikrarlı olduğundan emin olmak için bekliyordum."

"On-Demand ödeme yaparak 18 ay boyunca beklemek."

"Evet." Tom konsolu kapattı. "Bazen, paradan tasarruf etmek için beklemek, en pahalı şey olabilir."

Sonraki bölümde: depolama maliyetleri için aynı disiplin uygulanacak, fatura için neyin sebep olduğunu belirleyen birkaç sürpriz olacak.
