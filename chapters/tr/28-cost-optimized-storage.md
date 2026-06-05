# Bölüm 28: Depolama Faturaları Şaşkınlığı

Tom, EC2 için Tasarruf Planını sunmuştu. Faturanın bir sonraki satırı S3 idi: $198/ay (23. Bölümdeki yaşam döngüsü politikalarındaki değişikliklerden sonra $847'den düşmüştü).

Ardından EBS'i inceledi: $440/ay.

"Bu biraz yüksek," dedi.

Leo, EBS hacim listesini açtı. 47 adet hacim, örneklere bağlıydı. Ve sonra da 23 adet örneklere bağlı olmayan hacim vardı.

"Bu 23 hacim," dedi Tom. "Bunlar ne?"

Leo onları araştırdı. Hepsi ayrılmıştı – şu anda herhangi bir örnek tarafından kullanılmıyorlardı. Çoğu, hata ayıklama amaçlı oluşturulmuş özetlerden geliyordu. Bazıları, sonlandırılmış örneklerden geliyordu ancak hacimler silinmemişti.

"Okunmayan depolama için GB başına 0,10 dolar ödüyoruz," dedi Leo.

Tom toplamı inceledi: Bağlı olmayan 2,3 TB'lık hacimler.

"Hiç kullanmadığımız depolama için aylık 230 dolar," dedi Tom. "Bu ne kadar süredir devam ediyor?"

Leo, oluşturulma tarihlerini kontrol etti. En eski hacim 16 ay önceydi.

"Üç bin altı yüz sekmiş dolar," dedi Tom sessizce. "Kimse erişmediği depolama için üç bin altı yüz dolar harcadık."

Bağlı olmayan hacimleri silmedi. Bir sonraki ay, EBS faturası 210 dolara düştü.

**Depolama Maliyeti Denetimi**

Tom'un EBS keşfi, daha geniş bir örüntünün belirtisiydi: Depolama maliyetleri görünmez bir şekilde birikiyor. Hesaplama gücü (47 sunucunun çalışır durumda olması fark edilebilir) gibi, depolama sessizce birikiyor.

Bir depolama birimine kiralama gibi düşünün. Bir birim kiralamak kredi kartı açıklamasında açıkça görülebilir. Ancak, bir projeyle ikinci bir birim, ardından eski mobilyalar için üçüncü bir birim kiralarsanız ve asla içeriğine geri dönmezseniz, ücretler her ay, siz ne depoladığınızı bile unuttuktan sonra sessizce, ne olduğunu unutana kadar devam eder. Bulut depolaması aynı şekilde çalışır: baytlar orada oturur, fatura gelir ve kimse onları daha fazla ihtiyacı olmayan şeylerle dolu bir şekilde bulana kadar sorgulamaz.

Kapsamlı bir depolama maliyeti denetimi şunları içerir:

**S3:**

- Tüm kapaklarda yaşam döngüsü politikaları uygulanıyor mu?
- RDS, EBS gibi eski özetler S3'te mi oturuyor?
- Akıllı Katmanlama, belirsiz erişim desenlerine sahip kapaklarda uygun mu?
- Erişimini hiç almayan çoklu kopyalar oluşturmak için versiyonlama kullanılıyor mu?

**EBS:**

- Hiçbir hacim bağlı değil mi (çalışan bir örnek tarafından kullanılmıyor mu)?
- gp3 hacimleri doğru şekilde yapılandırılmış mı? (Varsayılan gp3 hacimleri ihtiyaç duymadığı için aşırı tahsisli bant genişliği/IOPS'ye sahip olabilir)
- Gereksiz yere eski özetler korunuyor mu?

**RDS:**

- Otomatik yedekleme tutma süreleri uygun şekilde ayarlanmış mı? (Daha uzun = daha yüksek depolama maliyeti)
- Eski örneklerden manuel özetler hala orada mı?
- Veritabanı göçlerinden gelen okuma replikaları hala çalışıyor mu?

**EFS:**

- EFS hacmi doğru depolama sınıfında mı? (Standart vs Nadiren Erişim)

**S3 Versiyonlama: Gizli Maliyet**

5. Bölümde S3 versiyonlamanın her önceki nesne sürümünü koruduğunu belirtmiştik. Bu, güvenlik için harika. Yaşam döngüsü kuralları için versiyonlama için de yoksa maliyetler için kötü.

Versiyonlama bir kapakta etkinleştirildiğinde, bir nesneyi her değiştirdiğinizde eski sürüm korunur. Zamanla:

- Gün 1: Resim yüklendi (v1)
- Gün 30: Resim güncellendi (v1 artık "noncurrent" sürüm, v2 mevcut sürüm)
- Gün 60: Resim tekrar güncellendi (v1 ve v2 noncurrent sürüm, v3 mevcut sürüm)
- Gün 365: v1, v2... v12 hepsi saklanır. Bir resim için 12 kopyayı ödüyorsunuz.

Çözüm: Noncurrent sürümler için yaşam döngüsü kuralları.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom, bu kuralları tüm sürümlemiş bucket'lara uyguladı. Bir sonraki ay, S3 depolama %18 oranında azaldı.

**EBS: Boyutlandırma ve gp3 Güncellemesi**

EBS hacim fiyatlandırması iki bileşene sahiptir:

1.  Depolama (GB başına ayda)
2.  Provisioned IOPS ve bant genişliği (io1/io2'deyseniz veya ek gp3 performansı için ödeme yapıyorsanız)

**gp3 fırsatı**: 6. Bölümde, gp3'ün mevcut varsayılan sürüm olduğunu ve gp2'den daha ucuz olduğunu belirtmiştik. Nimbus, gp3'ün kullanıma sunulduğu (Kasım 2020) Aralık ayından önce hacimler oluşturmuş olsaydı, bunlar hala gp2 olabilirlerdi.

Tom, 1.200 GB'lık toplam 12 gp2 hacmi buldu. Bu hacimlere gp3'e geçiş yapmak, hemen %20 tasarruf sağladı ve performansında herhangi bir düşüş olmadı.

**IOPS ve bant genişliği**: gp3 hacimleri, ek ücret ödemeden varsayılan olarak 3.000 IOPS ve 125 MB/s bant genişliğine sahiptir. Yükümlülüğünüzün ihtiyaç duyduğu kadar daha fazla kapasite sağlayabilirsiniz. Provisioned performansın gerçekten kullanılıp kullanılmadığını gözden geçirin.

Tom, 10.000 provisioned IOPS'li iki gp3 hacmi buldu. Bulut İzleme metriklerini kontrol etti: gerçek ortalama IOPS 1.200 idi. Provisioned IOPS'yi 4.000'e düşürdü (gerçek zirveye göre bir güvenlik marjı).

Aylık tasarruf: 68 ABD Doları.

**Anlık Görüntüleme yaşam döngüsü**: EBS anlık görüntüleri artımlıdır (her anlık görüntü, önceki anlık görüntüden sonraki değişiklikleri yalnızca depolar), ancak birikerek büyürler. Nimbus'ın erken dönemlerinden kalan eski anlık görüntüler hala mevcuttu. Tom, günlük anlık görüntülerden 30 gününü korudu ve diğerlerini silerek kurtardı.

**EFS: Depolama Katmanları**

Amazon EFS'nin kendi depolama katmanları vardır:

-   **EFS Standart**: Sık erişilen dosyalara yönelik. Daha yüksek maliyetli.
-   **EFS Nadiren Erişim (IA)**: 30 gün içinde erişilmeyen dosyalara yönelik. Standarta göre %92 daha ucuz.
-   **EFS Arşiv**: 90 gün içinde erişilmeyen dosyalara yönelik. IA'dan daha ucuz.

**EFS Akıllı Katmanlama**: Erişim kalıplarına göre depolama katmanları arasında dosyaları otomatik olarak taşır.

Tom, EFS hacmine Akıllı Katmanlamayı etkinleştirdi. Altı hafta sonra, %68'inin Nadiren Erişim'e taşınmıştı. EFS aylık maliyeti 89 ABD Dolarından 31 ABD Dolarına düştü.

**S3 Maliyet Dağılımı Etiketleri: Kimin Ne Harcadığını Bulma**

Nimbus büyüdükçe, birden fazla ekip S3'te veri depiliyor. Analitik ekibi kendi bucket'larını, mühendislik ekibi kendi bucket'larını ve restoran verileri ekibi kendi bucket'larını kullanıyordu.

Fatura sadece "S3: 198 ABD Doları" olarak gösteriliyordu. Ekip başına bir ayrım yoktu.

**Maliyet dağılımı etiketleri**, AWS kaynaklarına iş metadata'sı (ekip, proje, ortam) ile etiketlemenize ve AWS Maliyet İzleyici'de bu etiketlere göre maliyetleri görmenize olanak tanır.

Tom, tüm S3 bucket'larına etiketler ekledi:
```

```
Team: analytics
Environment: production
Project: nimbus-core

Efter en faturalama dönemi, he hedeflenen verileri görebiliyordu: "Analiz ekibinin veri gölü 74 ABD dolarıdır/ay. Mühendislik yedeklemeleri 43 ABD dolarıdır/ay. Restoran verileri 81 ABD dolarıdır/ay."

Şimdi her ekibe bütçe hakkında konuşabilirdi, sadece bir toplam sayıya bakmak yerine.

**AWS Maliyet Avcisi ve AWS Bütçeleri**

**AWS Maliyet Avcisi**: Tarihsel ve tahmin edilen maliyetleri hizmet, bölge, etiket ve kullanım türüne göre görselleştirir. Para nereye gittiğini anlamak için temeldir.

**AWS Bütçeleri**: Maliyetlerin (veya tahmin edilen maliyetlerin) bir eşiği aşması (veya aşması) durumunda uyarılar ayarlamanızı sağlar. Hizmet, bölge, etiket veya hesap tarafından bütçelenebilir.

Tom üç bütçe ayarladı:

1. Toplam aylık fatura: Bütçenin %90'ı kadar olan miktarda uyarı
2. EC2 Talep Üzerinde: Talep Üzerinde harcama 500 ABD dolarını aşarsa (Bir Tasarruf Planı boşluğuna işaret eder)
3. Veri aktarımı dışı: 200 ABD dolarında uyarı (veri aktarım maliyetleri beklenmedik şekilde artabilir)

Bütçeler, Slack kanalı aracılığıyla uyarılar gönderdi. Ekibin sınırlarına yaklaştığını, faturalarda keşfetmek yerine fark etmelerini sağladı.

**Mindakarlığın Maliyeti**

Tom bir elektronik tablo yaptı. Nimbus'un harcadığı şunları hesapladı:

- Bağlanmamış EBS hacimleri (16 ay): 3.680 ABD doları
- Eski S3 anlık görüntüleri (keşfedildi ve silindi): 890 ABD doları
- Gereksiz provisioned IOPS: 816 ABD doları
- gp2'den gp3'e geçiş tasarrufları (önce yapıldıysa tahmini, 18 ay): 2.160 ABD doları
- Geçerli olmayan S3 sürümleri birikiyor: 1.340 ABD doları

Belirlenen toplam boşa harama: 18 ayda yaklaşık 8.800 ABD doları.

"Sekiz bin sek yüz dolar," Maya dedi.

"Mindakarlık nedeniyle," Tom dedi. "Yanlış mimari kararları yapmaktan değil, temizlemeyi yapmamaktan kaynaklanıyor."

"Sistematik düzeltme nedir?"

"Düzenli denetimler," Priya dedi. "Ayda bir kez Maliyet Avcısı incelemeleri. AWS Güvenilir Danışman, bağlantısız hacimler ve boş kaynaklar hakkında otomatik olarak uyarılar verir. Bilinen boşa harama kalıplarının otomatik temizlenmesini otomatikleştirmek: Sürümleri N günün üzerinde silin, bağlantısız EBS hacimleri hakkında uyarı verin, eski S3 sürümlerini geçersiz kılın."

"Ve," Tom ekledi, "maliyet hijyenini dağıtım sürecine dahil edin. Bir mühendis bir EC2 örneğini sonlandırdığında, EBS hacmi varsayılan olarak silinmezse, açıkça çıkış yapabilirler."

## Güçlü Yönler ve Sınırlamalar

**Maliyet Optimizasyonu Disiplini**:

- Düzenli incelemeler, önemli hale gelmeden önce birikmiş boşa haramayı yakalar
- Etiketleme, hesap verebilirliği sağlar - ekipler kendi maliyetlerini görür
- Otomatik uyarılar, faturalama sürprizlerini önler
- Yaşam döngüsü politikaları ve boyutlandırma genellikle ayarlanıp unutulabilen tasarruflardır

**Karmaşıklıkta Olduğu Yer**:

- Birçok ekibin olduğu büyük bir hesapta boşa haramları belirlemek için merkezi araçlar gerekir
- Bazı boşa haramlar amaçlıdır (ekstra anlık görüntüleri "sadece şansınız olsun" olarak tutmak) - maliyet/risk dengesi bir yargıdır
- gp3 geçişi dikkatli doğrulama gerektirir (IOPS ve akış değerleri gp2'nin bazı kenar durumlarında farklı davranabileceği için değişebilir)
- Maliyet tahsis etiketleri, tüm ekipler arasında disiplin gerektirir - tutarsız etiketleme verileri eksik hale getirir

## Özet

- **Depolama maliyetleri görünmez bir şekilde birikir** - düzenli denetimler gereklidir.
- **Bağlantısız EBS hacimleri** yaygın bir boşa harama kaynağıdır. Silin (veya örnekler sona erdiğinde otomatik olarak silin)
- **EBS boyutlandırması**: gp2'yi gp3'e geçirin (tipik olarak %20 tasarruf sağlar). Fazla provisioned IOPS'yi kaldırın.
- **S3 sürüteleme maliyetleri**: Geçerli olmayan sürümler depolanır ve geçerli sürümler gibi aynı hızda ücretlendirilir. Sürüteleme havuzlarında sürüteleme tarihlerini geçersiz kılan yaşam döngüsü kuralları, sürüteleme maliyetlerini kontrol etmek için kritiktir.
- **EFS Akıllı Katmanlama**: Dosyaları daha düşük maliyetli katmanlara erişim sıklığına göre otomatik olarak taşır.
- **Maliyet Tahsis Etiketleri**: Ekip/proje/ortam metadata'sı ile kaynakları etiketleyerek maliyet görünürlüğünü ve hesap verebilirliğini sağlar.
- **AWS Bütçeleri**: Maliyetler eşikleri yaklaştığında proaktif uyarılar. Aylık faturalarda şaşırmayın.

## Sınav İpuçları

*SAA-C03 Alanı: Maliyet Optimizasyonlu Mimarileri Tasarla (Alan 4, Görev 4.1)*

- **Maliyet tahsis etiketleri**: Faturalama konsolunda kullanıcı tanımlı etiketleri etkinleştirin; ardından kaynakları etiketleyin. Maliyet Avcısı, etiketlere göre bölünmüş gösterimleri görüntüler. Sınav senaryosu: "en çok S3 maliyetini üreten departmanın hangisi olduğunu belirleyin" → maliyet tahsis etiketleri.
- **AWS Güvenilir Danışman**: Kullanılmayan EC2 örneklerini, bağlantısız EBS hacimlerini, boş yük dengeleyicileri ve diğer boşa haramları belirler. Temel kontroller ücretsizdir; tam kontroller İş/Kurumsal Desteği gerektirir.
- **EBS maliyet bileşenleri**: Depolama (her GB), provisioned IOPS (eğer io1/io2 veya ekstra gp3 ise), akış (eğer ekstra gp3 ise). Hangi bileşenlerin boyutlandırılabilmesi gerektiğini bilin.
- **S3 sürüteleme maliyetleri**: Geçerli olmayan sürümler depolanır ve geçerli sürümler gibi aynı hızda ücretlendirilir. Sürüteleme tarihlerini geçersiz kılan yaşam döngüsü kuralları, sürüteleme maliyetlerini kontrol etmek için kritiktir.
- **AWS Compute Optimizer**: EC2 kullanımını analiz eder ve uygun örnek türlerini önerir. Sınav işareti: "EC2 maliyetlerini doğru örnek türünü seçerek azaltın" → Compute Optimizer.
- **AWS Maliyet Anormallik Tespiti**: Olağan dışı harcama kalıplarını tespit etmek için ML'yi kullanır. Sınav işareti: "beklenmedik maliyet artışlarını otomatik olarak tespit edin" → Maliyet Anormallik Tespiti.

## Uygulamalar

**Uygulama 1 - Hatırlama**

## Açıklama: Bağımsız EBS Hacimlerinin Maliyet Oluşturmasının Nedenleri ve EC2 İstemcisi Kullanılmadığında Maliyetlerin Oluşması

Neden bağımsız EBS hacimleri hiçbir EC2 istemcisi tarafından kullanılmadığına rağmen maliyet oluşturuyor? Mühendislerin bu israfı önlemek için bir EC2 istemcisini sonlandırmadan önce izlemeleri gereken süreç nedir?

*(İpucu: EBS hacimleri fiziksel diske veri depolar ve diskin okunması para harcamaya neden olur, isterse.)*

**Egzersiz 2 — Sınav Uygulaması**

*Senaryo*: Bir şirketin AWS faturaları, yeni hizmetler eklenmeden önce 5.000 $'dan 9.000 $'a yükseldi. Mühendislik ekibi depolama maliyetlerinin sorun olduğunu düşünmektedir. Bu artışı en iyi şekilde belirlemek ve açıklamak için hangi AWS araçlarının kombinasyonu kullanılabilir?

A) AWS CloudTrail, API çağrılarını gözden geçirerek kaynakları kimin oluşturduğunu belirlemek için.
B) AWS Cost Explorer, hizmet bazlı maliyet analizi için ve AWS Trusted Advisor, kullanılmayan ve bağımsız kaynakları tespit etmek için.
C) Amazon CloudWatch, kaynak kullanımını izlemek ve maliyet uyarıları oluşturmak için.
D) AWS Config, tüm kaynakları ve uyumluluk durumlarını belirlemek için.

**İpucu 1**: "Maliyet artışını belirle" → hizmet bazında maliyet dağılımını görselleştir.

**İpucu 2**: "Kullanılmayan ve bağımsız kaynaklar" → belirli bir araç bu kaynakları proaktif olarak tespit eder.

**İpucu 3**: CloudTrail günlükleri API çağrılarını kaydeder; Cost Explorer maliyet trendlerini gösterir. Maliyet analizi için hangisi daha faydalıdır?

**Cevap**: B

**Açıklama**: AWS Cost Explorer, hizmet, bölge ve kullanım türüne göre maliyet trendlerini göstererek hangi hizmetin artışı yönlendirdiğini belirlemek için mükemmeldir. AWS Trusted Advisor'ın maliyet optimizasyon kontrolleri, bağımsız EBS hacimleri, boşta EC2 örneklerini, yetersiz kullanılan yük dengeleyicileri ve diğer yaygın israf kaynaklarını tespit eder.

**Neden A?** CloudTrail, kaynakların kim tarafından oluşturulduğu ve ne zaman oluşturulduğu kaydını tutar, ancak maliyet trendlerini doğrudan göstermez veya israfı tespit etmez.

**Neden C?** CloudWatch, CPU, bellek gibi kaynak performansını izler — sağlama boyutlandırması için faydalıdır, ancak biriken depolama israfını tespit etmek için değildir.

**Neden D?** AWS Config, kaynak yapılandırmalarını ve uyumluluğu izler, ancak bir maliyet analizi aracı değildir.

*SAA-C03 Alanı: Maliyeti Optimizleştirilmiş Mimarileri Tasarla — Görev 4.1*

**Egzersiz 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Nimbus'un S3 faturaları, "yedekler" adlı bir bucket için 340$/aydır. Bucket, versioning etkinleştirilmiş ve aşağıdaki verileri içerir:

- Günlük veritabanı anlık görüntüleri (politika için 7 gün yeterlidir)
- Haftalık tam yedeklemeler (3 ay boyunca saklanır)
- Çeyreklik arşivler (vergi uyumluluğu için 7 yıl saklanır)

Bu bucket için yaşam döngüsü politikası tasarlayın ve bu gereksinimleri karşılarken maliyeti en aza indirin. Her tür veriye hangi depolama sınıfı kullanılmalıdır? Sürümleme, eski sürümlerin birikmesini önlemek için nasıl ele alınmalıdır?

*(Tek bir doğru cevap yoktur. Amaç, yaşam döngüsü politikası tasarımını uygulamaktır.)*

## Ekran Sonrası Sahnesi

Tom, maliyet denetim bulgularını ekibe yayınladı.

Tespit edilen israf: 18 ayda 8.800$.
Uygulanmış değişikliklerden elde edilecek beklenen yıllık tasarruf: 6.200$.

Sonra en alt satıra şu satırı ekledi: "Bu, Savings Plans'tan (14.200$/yıl) veya S3 yaşam döngüsü politikalarından (7.800$/yıl) elde edilen tasarrufları içermiyor." Birleşik yıllık optimizasyon etkisi yaklaşık olarak 28.200$'dır.

Maya bunu iki kez okudu.

"Yani neredeyse bir genç mühendis maaşının değeri," dedi.

"İsrafda," Tom onayladı.

"Veya," Leo dedi, "bu optimizasyonların daha erken yapılması, o genç mühendisin finansmanını sağlayacaktı."

Tom ona baktı.

"Bu düşünmenin doğru yolu," dedi. "Maliyet optimizasyonu kesmekle ilgili değildir. Değer yarattığı için ödenmemesiyle ilgilidir."

Maya, belgeyi şirketin wiki'sına yapıştırdı.

Bir sonraki bölüm: Veritabanı katmanı aynı şekilde ele alınacak ve Tom, aslında yatırım yapmadığı tek yerin keşfedileceği.
