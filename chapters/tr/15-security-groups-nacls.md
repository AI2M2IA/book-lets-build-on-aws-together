# Bölüm 15: Kapıdaki Korumalar

Priya bir salı sabahı VPC akış günlüklerini açıp okumaya başladığında ofis sessizdi. Pencerenin dışında şehir uyanıyordu. İçeride, ekran orada olmaması gereken bir şey gösteriyordu: bir EC2 örneğinden sabah 2:17'de Romanya'daki bir IP adresine giden bir bağlantı.

Nimbus'un ilk sürümünden eski dağıtım anahtarı hâlâ aktifti. Geçen hafta üç API çağrısı yapmıştı. Leo onları neyin yaptığını bilmiyordu.

---

*IAM revizyonu erişim anahtarlarını rollerle değiştirmişti. Her hizmetin artık tam olarak ihtiyaç duyduğu izinleri vardı. Ama o iş gerçekleşirken, daha eski bir sorun sessizce kötüleşiyordu: hizmetten çıkarılmış bir dağıtım hattından aktif bir kimlik bilgisi hâlâ canlıydı ve bir şey onu kullanmıştı. IAM katmanı güçlendirilmişti. Hasarı sınırlayabilecek ağ kontrolleri de aynı dikkati gerektiriyordu.*

---

Priya VPC akış günlüklerini açtı — VPC'ye giren ve çıkan her bağlantıyı gösteren ağ trafiği kayıtları.

"Salı sabah 2:17'de," dedi, "eski API'yi çalıştıran EC2 örneğinden Romanya'daki bir IP adresine giden bir bağlantı oldu."

"Bu bizim altyapımız değil," dedi Leo.

"Değil."

"Yani birisi EC2 örneğimizdeydi."

"Ya da bir şey."

Onu geriye doğru izlediler: eski dağıtım anahtarı, EC2 örneğine küçük bir komut dosyası yüklemek için kullanılmıştı. Komut dosyası komşu sunuculardaki portları taramaya çalışmıştı. Taramaların çoğu başarısız olmuştu.

"Zaten dağıttım — ah." Leo soruşturma tamamlanmadan önce güvenlik grubu kuralına bir düzeltme dağıtmıştı. Düzeltme doğruydu ama Priya akış günlüklerini okumayı bitirmeden yapmıştı. Priya duraklayıp değişikliğin beklenmedik hiçbir şeyi etkilemediğini doğrulamak zorunda kalmıştı.

"Bir dahaki sefere, değişiklik göndermeden önce soruşturmanın kapanmasını bekle," dedi.

"Güvenlik grupları onları engelledi," dedi Priya. "Saldırgan bir EC2 örneğine girdi. Diğerlerine ulaşamadılar çünkü güvenlik grupları yalnızca yük dengeleyiciden trafiğe izin veriyordu."

"Yani hasar sınırlandı."

"Çünkü güvenlik gruplarını doğru yapılandırmıştık. 5432 portunu hesaptaki herhangi bir EC2 örneğine açık bırakmış olsaydık hayal et."

Leo hayal etmek zorunda değildi. O yapılandırmayı orijinal kurulumda görmüştü.

"Bunun ne anlama geleceğini düşündük mü?" diye devam etti Priya. "Hesaptaki herhangi bir EC2 örneği — tehlikeye atılmış anahtarı olan dahil — doğrudan veritabanına bağlanabilirdi. Keyfi SQL çalıştırabilirdi. Her müşterinin sipariş geçmişini indirebilirdi. Tabloları silebilirdi."

"Bunun yerine her denediklerinde reddedildiler," dedi Leo.

"Evet. Çünkü veritabanı güvenlik grubu yalnızca API güvenlik grubundan bağlantı kabul eder. Hesaptaki herhangi bir EC2'den değil. Herhangi bir IP'den değil. Özellikle API güvenlik grubundan."

"O tek tasarım kararı," dedi Maya, "sınırlandırılmış bir olay ile tam bir veri ihlali arasındaki farktı."

"Güvenlik grubu tasarımı bir onay kutusu değildir," dedi Priya. "Sistemin gerçek güvenliğidir."

Rafael dinliyordu. "Doğru yapılandırmanın ne olduğunu nasıl öğreniyorsun? Kurallar ilk başta keyfi görünüyor."

"Her bileşenin ne yapması gerektiğini listeleyerek başlarsın," dedi Priya. "Yük dengeleyicinin her yerden HTTPS kabul etmesi gerekir. API sunucusunun yalnızca yük dengeleyiciden HTTP kabul etmesi gerekir. Veritabanının yalnızca API sunucusundan PostgreSQL kabul etmesi gerekir. Redis'in yalnızca API sunucusundan 6379 portunu kabul etmesi gerekir. Bu gereksinimler doğrudan gelen kurallara eşlenir. Diğer her şey varsayılan olarak reddedilir."

"Peki ya giden?"

"Giden, insanların tembelleştiği yerdir. Çoğu ekip gideni izin-ver-hepsi olarak bırakır. Bu, tehlikeye atılmış bir örneğin herhangi bir şeyi çağırabileceği anlamına gelir. Onu sıkılaştıracağız."

**İki Katmanlı Ağ Güvenliği**

Bir VPC'de, ağ trafiğini kontrol etmek için iki ayrı aracınız vardır:

**Güvenlik Grupları**: Tek tek kaynaklara (EC2 örnekleri, RDS veritabanları, yük dengeleyiciler, bir VPC'deki Lambda işlevleri) eklenen sanal güvenlik duvarları. Kaynak düzeyinde çalışırlar.

**Ağ ACL'leri (NACL'ler)**: Alt ağlara eklenen güvenlik duvarı kuralları. Alt ağ sınırında çalışırlar — trafik o alt ağdaki herhangi bir kaynağa ulaşmadan önce.

Her ikisini de anlamak, kritik bir farkı anlamayı gerektirir: **durum bilgili vs durumsuz**.

**Durum Bilgili: Güvenlik Grupları**

Bir güvenlik grubu **durum bilgilidir**.

Belirli bir portta gelen trafiğe izin verdiğinizde, yanıt trafiğinin dışarı çıkmasına otomatik olarak izin verilir, açık bir giden kuralı olmasa bile.

Bir hedefe giden trafiğe izin verdiğinizde, geri gelen yanıta otomatik olarak izin verilir.

Bir ofis binasındaki durum bilgili güvenlik görevlisini düşünün. Girmek için rozetinizi gösterirsiniz. Daha sonra dışarı çıkarsınız. Görevlinin çıkışta sizi tekrar kontrol etmesine gerek yoktur — sistem içeri alındığınızı bilir ve çıkmanıza izin verilir.

**Nimbus API EC2 örneği için Güvenlik Grubu Kuralları:**

- **Gelen — TCP 8080 — Yük Dengeleyici SG'den** → ALB'den API trafiğini kabul et
- **Gelen — TCP 22 — Bastion Ana Bilgisayar SG'den** → Yalnızca bastion'dan SSH
- **Giden — TCP 5432 — RDS SG'ye** → PostgreSQL'e bağlan
- **Giden — TCP 6379 — ElastiCache SG'ye** → Redis'e bağlan
- **Giden — TCP 443 — 0.0.0.0/0'a** → Harici API'lere HTTPS

Dikkat edin: 8080 portu için açık giden kuralı yok. Gelen kural durum bilgilidir — yanıt trafiği (API'nin yük dengeleyiciye yanıtı) otomatik olarak izinlidir.

Ayrıca dikkat edin: güvenlik grubu kuralları, IP adreslerine değil, *diğer güvenlik gruplarına* referans verir. "Yük dengeleyici güvenlik grubundan gelene izin ver", "bu güvenlik grubu eklenmiş herhangi bir kaynaktan trafiğe izin ver" demektir. Bu, IP adreslerini izlemekten daha esnek ve sürdürülebilirdir.

**Varsayılan davranış:**

- Varsayılan olarak, tüm gelen trafik reddedilir
- Varsayılan olarak, tüm giden trafiğe izin verilir
- Tüm kurallar değerlendirilir (güvenlik gruplarının sıralı kuralları yoktur — tüm eşleşen kurallar uygulanır)
- Güvenlik grupları yalnızca trafiğe **izin verebilir** — açık ret kuralları oluşturamazsınız

**Durumsuz: Ağ ACL'leri**

Bir NACL **durumsuzdur**.

8080 portunda gelen trafiğe izin verdiğinizde, bu yalnızca geleni kapsar. Yanıt (geçici portlardaki giden trafik) bir giden kuralıyla açıkça izinli olmalıdır.

Bir metal dedektörünü düşünün. Girerken içinden geçersiniz. Metal dedektörü zaten geçtiğinizi bilmez — çıkışta tekrar geçmeniz gerekir.

**NACL kuralları numaralandırılır ve sırayla değerlendirilir.** Eşleşen ilk kural kazanır. Kural 100, kural 200'den önce değerlendirilir. Kural 100 trafiği reddeder ve kural 200 izin verirse, trafik reddedilir.

NACL'ler trafiği açıkça **reddedebilir** — yalnızca izin verebilen güvenlik gruplarının aksine. Bu, onları belirli IP aralıklarını engellemek için yararlı kılar.

**Varsayılan NACL davranışı:**

- Varsayılan NACL (VPC'nizle oluşturulan) tüm gelen ve giden trafiğe izin verir
- Özel bir NACL varsayılan olarak tüm trafiği reddeder (istediğiniz şeye açıkça izin vermeniz gerekir)

**Herkese açık alt ağ için NACL (basitleştirilmiş):**

*Gelen kurallar (sırayla değerlendirilir — ilk eşleşme kazanır):*

- Kural 100: TCP 443, 0.0.0.0/0'dan → **İzin Ver** (HTTPS)
- Kural 110: TCP 80, 0.0.0.0/0'dan → **İzin Ver** (HTTP)
- Kural 120: TCP 1024–65535, 0.0.0.0/0'dan → **İzin Ver** (geçici dönüş portları)
- Kural \*: Tüm trafik → **Reddet**

*Giden kurallar:*

- Kural 100: TCP 443, 0.0.0.0/0'a → **İzin Ver** (HTTPS)
- Kural 110: TCP 80, 0.0.0.0/0'a → **İzin Ver** (HTTP)
- Kural 120: TCP 1024–65535, 0.0.0.0/0'a → **İzin Ver** (geçici dönüş portları)
- Kural \*: Tüm trafik → **Reddet**

Kural 120 (1024-65535 portları) geçici portlara izin verir — TCP yanıt trafiği için kullanılan geçici yüksek numaralı portlar. NACL'ler durumsuz olduğundan, bunlara açıkça giden izin vermelisiniz, yoksa sunucunuzun yanıtları geçemez.

**Hangisini Ne Zaman Kullanmalı**

"Dur — ama bunu *neden* böyle yapalım?" diye sordu Maya. "Güvenlik grupları zaten çalışıyorsa neden iki ayrı araç — güvenlik grupları *ve* NACL'ler — olsun? Ekstra karmaşıklığın anlamı ne?"

Cevap, farklı düzeylerde çalışmaları ve farklı yeteneklere sahip olmalarıdır. Güvenlik grupları tek tek kaynakları korur ve yalnızca trafiğe izin verebilir. NACL'ler tüm alt ağları korur ve açıkça reddedebilir. Her ikisine sahip olmak, kaynak düzeyinde ince taneli izin kuralları ve alt ağ düzeyinde geniş ret kuralları uygulayabileceğiniz anlamına gelir — biri diğerine karışmadan.

Erişim kontrolünün birincil katmanı için **güvenlik gruplarını** kullanın. Yönetilmeleri daha kolaydır, durum bilgilidir (geçici portları unutmaktan kaynaklanan kazara engelleme olasılığı daha azdır) ve diğer güvenlik gruplarına referans vermeyi destekler.

Alt ağ düzeyinde kontroller için **NACL'leri** kullanın, özellikle:

- **Açık ret kuralları**: Belirli bir IP adresini veya aralığını tüm bir alt ağa ulaşmaktan engelle
- **Acil engelleme**: Bir IP aktif olarak saldırıyor — herhangi bir kaynağa ulaşmadan önce tüm alt ağı engellemek için bir NACL ret kuralı ekle

Şunu merak ediyor olabilirsiniz: güvenlik grupları durum bilgiliyse ve varsayılan olarak tüm geleni engelliyorsa, ne zaman gerçekten NACL'lere ihtiyaç duyarsınız? Güvenlik grupları çoğu durumu iyi ele alır. Ama yapamadıkları bir şey vardır: açıkça reddetmek. Bir güvenlik grubu yalnızca trafiğe izin verebilir — bir kural eşleşmezse, trafik varsayılan olarak reddedilir. "Bu belirli IP'yi engelle" diyen bir kural ekleyemezsiniz. Bunun için bir NACL'ye ihtiyacınız var: belirli bir adres aralığını alt ağdaki herhangi bir kaynağa ulaşmadan önce durduran numaralı bir ret kuralı. NACL'ler en çok acil müdahale (aktif bir saldırganı engelleme) ve tek tek kaynak yapılandırmasına bağlı olmaması gereken alt ağ düzeyindeki sınırları uygulamak için yararlıdır.

"Yani güvenlik grubu ince taneli kontrol," dedi Maya, "ve NACL geniş fırça darbesi mi?"

"Güvenlik grupları tek tek kaynakları korur," diye onayladı Priya. "NACL'ler tüm alt ağları korur. Bir IP'nin ağınızdaki herhangi bir şeye ulaşmasını engellemek istediğinizde, NACL. Yalnızca yük dengeleyicinin API sunucusuna ulaşmasına izin vermek istediğinizde, güvenlik grubu."

"Saldırgan farklı bir IP ile geri dönerse ne olacağını düşündük mü?" dedi Priya. "NACL bir aralığı engeller. Onlar başka birine geçer."

"GuardDuty bunun içindir," dedi Leo. "Davranışsal tespit. Aynı komut dosyası yeni bir IP'den çalışırsa, trafik deseni aynı görünür."

"Ona geleceğiz," dedi Priya. "Önce ilk şeyler."

"Bütün bunlar ayda ne kadar maliyet çıkarıyor?" diye sordu Tom.

Güvenlik grupları ve NACL'lerin kendileri ücretsizdir. AWS güvenlik gruplarının sayısı, kuralların sayısı veya NACL girişlerinin sayısı için ücret almaz. Maliyet düşüncesi dolaylıdır: daha sıkı giden güvenlik grubu kuralları NAT Geçidi üzerinden daha az trafik yönlendirebilir ve veri işleme ücretlerini azaltabilir.

"Yani güvenlik kontrolleri ücretsiz," dedi Rafael. "Maliyet, onları destekleyen altyapı."

"Doğru. Yüksek erişilebilirlik için NAT Geçitleri. Aksi takdirde NAT üzerinden geçecek hizmetler için Interface VPC Uç Noktaları. Bunların maliyetleri vardır. Güvenlik grubu kurallarının kendileri yoktur."

**Bir Araya Getirmek: Katmanlı Savunma**

Olaydan sonra, Priya Nimbus savunma katmanlarını beyaz tahtaya çizdi:

```
İnternet
  ↓
CloudFront + Shield (DDoS emilimi)
  ↓
WAF (uygulama katmanı filtreleme)
  ↓
İnternet Geçidi
  ↓
Herkese açık alt ağda NACL (alt ağ düzeyi kuralları, acil engelleme)
  ↓
ALB Güvenlik Grubu (her yerden HTTPS)
  ↓
Özel uygulama alt ağında NACL
  ↓
EC2 API Güvenlik Grubu (yalnızca ALB SG'den 8080 portu)
  ↓
Özel veri alt ağında NACL
  ↓
RDS Güvenlik Grubu (yalnızca API SG'den 5432 portu)
```

"Her katman bir öncekinin başarısız olabileceğini varsayar," dedi. "Veritabanı, ağ katmanının saldırganı durdurduğuna güvenmez. EC2 örneği, ALB'nin saldırganı durdurduğuna güvenmez. Her katman kendi kurallarını bağımsız olarak uygular."

"Derinlemesine savunma," dedi Maya.

"Derinlemesine savunma. Bir katmandan geçen bir saldırgan hâlâ sonraki katmanla karşı karşıyadır. Hiçbir tek yanlış yapılandırma felaket değildir. Bir katman başarısız olur ve diğerleri tutar."

Leo diyagrama baktı. Saldırgan bir EC2 örneğini tehlikeye atmıştı. Kimlik bilgileri katmanından geçmişlerdi. Ama sonraki her katman tutmuştu.

Derinlemesine savunmanın pratikte göründüğü şey buydu.

**Olay: Katmanların Yakaladığı Şey**

Romanya IP saldırısına geri dönelim:

**Ne oldu**: Saldırgan, tehlikeye atılmış dağıtım anahtarını bir EC2 örneğine bir tarama komut dosyası yüklemek için kullandı. Komut dosyası diğer hizmetlere bağlanmaya çalıştı.

**Onları ne durdurdu**:

- RDS güvenlik grubu yalnızca API EC2 güvenlik grubundan 5432 portunda gelene izin veriyordu. Komut dosyası bir tarama aracından veritabanına ulaşamadı — doğru güvenlik grubunu eklemiyordu.
- ElastiCache güvenlik grubu yalnızca API EC2 güvenlik grubundan 6379 portunda gelene izin veriyordu.
- Diğer EC2 örnekleri yalnızca bastion ana bilgisayar güvenlik grubundan SSH'ye izin veriyordu.

**Onları ne durdurmadı**:

- EC2 örneğinin giden kuralları 0.0.0.0/0'a HTTPS'ye izin veriyordu (paket indirmeleri için gerekli). Komut dosyası saldırganın sunucusuna giden bağlantılar yapmak için bunu kullandı.

Olaydan sonra Priya ekledi:

- Romanya IP aralığını engelleyen bir NACL kuralı
- EC2 örneklerinde daha kısıtlayıcı bir giden kuralı (yalnızca belirli bilinen iyi hedeflere izin verildi)
- Her örnekte **IMDSv2'nin zorunlu kılındığının** (`HttpTokens=required`) bir kontrolü — komut dosyası örneğin *üzerinde* çalışmıştı, bu da meta veri hizmetini örnek rolünün geçici kimlik bilgileri için sorgulayabileceği anlamına geliyordu. IMDSv2 Bölüm 4'te etkinleştirilmişti; Priya her yerde hâlâ gerekli olduğunu doğruladı, çünkü kod yürütmeye sahip bir saldırgan artı IMDSv1, çalınmış AWS kimlik bilgilerine eşittir.

---

**Akış Günlüklerini Okumak: Priya Ne Gördü**

Soruşturma VPC akış günlükleriyle başladı. Priya CloudWatch Logs Insights'ı açtı ve son 48 saat için akış günlüğü grubuna karşı bir sorgu çalıştırdı:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` tehlikeye atılmış EC2 örneğiydi. REJECT filtresi engellenen bağlantı denemelerini gösterdi.

Sonuçlar:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Diğer EC2 örneği — SSH engellendi
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Başka bir EC2 — SSH engellendi
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — güvenlik grubu tarafından engellendi
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # RDS replikası — engellendi
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — engellendi
```

Tarama her dahili hizmete çarpmıştı. Her deneme reddedilmişti. Güvenlik grubu tasarımı tutmuştu.

Ama bir de giden ACCEPT girişi vardı:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bayt
```

Bu veri sızıntısı denemesiydi — HTTPS üzerinden Romanya IP'sine gönderilen 2,8 kilobayt. Güvenlik grubu meşru paket indirmeleri için HTTPS gidene izin veriyordu. Saldırgan o kuralı kullanmıştı.

"Güvenlik grupları yanal hareketi durdurdu," dedi Priya, ekibe günlükleri anlatarak. "Ama giden kural çok izin vericiydi. Herhangi bir hedefe HTTPS'ye izin verdik. HTTPS'yi yalnızca bilinen AWS uç noktalarına — CloudWatch, Secrets Manager, S3 — ve paket deposu CDN'lerine izin vermeliyiz."

Güncellenmiş güvenlik grubu giden kurallarını gösterdi:

```
TCP 443 → pl-63a5400a (AWS S3 gateway uç noktası önek listesi)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (AWS paket depoları — zamanla daralır)
```

"Bu, genel HTTPS giden kuralını ortadan kaldırır. Giden HTTPS artık yalnızca bilinen iyi hedeflere gider."

"Üçüncü taraf API'leri çağıran Lambda işlevleri ne olacak?" diye sordu Leo.

"Onlar kendi özel giden kuralı olan NAT Geçidi üzerinden geçer," dedi Priya. "Lambda EC2 güvenlik grubunu kullanmaz. Farklı ağ arayüzü, farklı kural seti."

---

**Durumsuz Hata Ayıklama Hikayesi**

Olaydan iki hafta sonra, hâlâ ilk ayında olan Rafael, yeni bir veri hattı kurmaya yardım ediyordu. Bu, bir VPC'deki, EC2'de çalışan bir dahili API'yi çağırması gereken bir Lambda işlevini içeriyordu.

Lambda işlevi zaman aşımına uğradı. Her çağrı zaman aşımına uğradı.

Rafael güvenlik gruplarını kontrol etti. Lambda güvenlik grubunun EC2 güvenlik grubuna TCP 8080 için bir giden kuralı vardı. EC2 güvenlik grubunun Lambda güvenlik grubundan TCP 8080 için bir gelen kuralı vardı. Kurallar doğru görünüyordu.

Leo'ya döndü. "Güvenlik grupları iyi görünüyor. Neden zaman aşımına uğruyor?"

Leo alt ağ yapılandırmasına baktı. Lambda işlevi özel bir alt ağdaydı. Alt ağın, Priya'nın güvenlik sertleştirmesi sırasında uyguladığı özel bir NACL'si vardı.

NACL giden kurallarına baktı:

```
Kural 100: TCP 443  → 0.0.0.0/0  ALLOW
Kural 110: TCP 5432 → 10.0.20.0/24 ALLOW
Kural *:   Tümü     → 0.0.0.0/0  DENY
```

"NACL HTTPS gidene ve PostgreSQL gidene izin veriyor," dedi Leo. "TCP 8080 gidene izin vermiyor."

"Güvenlik grubu izin veriyor," dedi Rafael.

"NACL vermiyor. Ve NACL durumsuz. Lambda işlevinin güvenlik grubu giden bağlantıya izin verse bile, alt ağ sınırındaki NACL yine giden trafiği değerlendirir. NACL, Lambda'nın çağrısını alt ağdan ayrılmadan önce engelliyor."

"Ama NACL'ye TCP 8080 giden için ALLOW eklersem—"

"Geçici portlar için de gelen ALLOW eklemen gerekir," dedi Leo. "EC2 örneğinden gelen yanıt 1024 ile 65535 arasında rastgele bir portta geri gelir. NACL'nin gelen kuralları bunlara izin vermezse, yanıt dönüş yolunda engellenir."

Rafael NACL'yi güncelledi:

```
Kural 100:  TCP 443       → 0.0.0.0/0      ALLOW  (giden)
Kural 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (EC2 alt ağına giden)
Kural 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (DB alt ağına giden)
Kural *:    Tümü          → 0.0.0.0/0      DENY
```

Ve gelen tarafında:

```
Kural 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (EC2'den dönüş trafiği)
Kural *:    Tümü                               DENY
```

Lambda işlevi hemen bağlandı.

"İşte bu yüzden insanlar NACL'lerden nefret eder," dedi Rafael.

"İşte bu yüzden onları anlaman gerekir," dedi Priya. "Yarattıkları hatalar, tam olarak önlemek için tasarlandıkları hatalardır — beklenmedik trafik akışları. Durumsuz modeli anlamak, bir bağlantı gizemli biçimde başarısız olduğunda tam olarak nereye bakacağını söyler."

"Güvenlik grubu durum bilgili — dönüş trafiği otomatik. NACL durumsuz — dönüş trafiği açık kurallar gerektirir," diye tekrarladı Rafael.

"Düşünme şeklinin bir parçası olana kadar söyle," dedi Priya.

---

**NACL Acil Engelleme: /24 Kuralı**

Saldırganın kaynak IP aralığını belirledikten sonra, Priya'nın yanıtı anındaydı: bir NACL ret kuralı ekle.

Ama yalnızca tek IP'yi engellemedi. Saldırganın çalıştığı tüm `/24`'ü — 256 adresli alt ağı — engelledi.

"Neden tüm /24?" diye sordu Leo.

"Çünkü tek tek IP engelleme kaybeden bir oyun. Saldırganlar bir aralık içinde birden çok IP kullanır, biri engellendiğinde aralarında dönerler. /24'ü engellemek bunu zorlaştırır — farklı bir adres bloğuna geçmeleri gerekir, bu da onlara zaman ve çaba kaybettirir."

NACL kuralı:

```
Kural 90:  185.220.101.0/24'ten TÜMÜ → DENY
```

Kural 90, herhangi bir izin kuralından (100'den başlayan) önce değerlendirilir. Herhangi bir izin kuralı değerlendirilmeden önce tüm aralık engellenir.

"Ve bu alt ağdaki her kaynağa uygulanır mı?" diye sordu Leo.

"Her kaynağa. NACL'nin amacı budur — trafik herhangi bir tek tek kaynağın güvenlik grubuna ulaşmadan önce uygulanır. Kural 90'da bir NACL reddi, paketin güvenlik grubu değerlendirmesine hiç ulaşmaması demektir."

"Bunu bir güvenlik grubuyla yapabilir miydik?"

"Hayır. Güvenlik grupları yalnızca trafiğe izin verebilir. Ret kuralı yoktur. Belirli bir IP'nin bir alt ağdaki herhangi bir kaynağa ulaşmasını engellemek istiyorsanız, NACL tek seçenektir."

Bu, NACL ret kurallarının birincil kullanım durumudur: aktif saldırılara acil müdahale. Güvenlik grubu birincil kontrol mekanizmasıdır. NACL acil frendir.

---

**Güvenlik Grubu Tasarım Desenleri: ID'ye Göre Referans**

"EC2 örneklerimiz değiştirildiğinde ne olacağını düşündük mü?" diye sordu Priya. "Auto Scaling eski örnekleri sonlandırır ve yenilerini başlatır. Yeni örnekler yeni özel IP adresleri alır."

"Güvenlik grubu kuralları IP adreslerine referans verirse," dedi Leo yavaşça, "bir örnek her değiştirildiğinde kuralları güncellememiz gerekir."

"Aynen. Bu yüzden VPC içi trafik için güvenlik grubu kurallarında IP adreslerine referans vermezsiniz."

Güvenlik grupları IP adresleri yerine diğer güvenlik gruplarına referans verebilir. Bir kural "yük dengeleyici güvenlik grubundan gelene izin ver" dediğinde, "yük dengeleyici güvenlik grubu eklenmiş herhangi bir kaynaktan trafiğe izin ver" demektir. Auto Scaling her biri yeni bir IP ile bin yeni örnek başlatabilir ve kural geçerli kalır.

Nimbus güvenlik grubu yapısı:

```
nimbus-alb-sg (Yük Dengeleyici)
  - Gelen: 0.0.0.0/0'dan TCP 443
  - Gelen: 0.0.0.0/0'dan TCP 80

nimbus-api-sg (EC2 API örnekleri)
  - Gelen: nimbus-alb-sg'den TCP 8080
  - Gelen: nimbus-bastion-sg'den TCP 22
  - Giden: nimbus-rds-sg'ye TCP 5432
  - Giden: nimbus-redis-sg'ye TCP 6379

nimbus-rds-sg (RDS)
  - Gelen: nimbus-api-sg'den TCP 5432

nimbus-redis-sg (ElastiCache)
  - Gelen: nimbus-api-sg'den TCP 6379

nimbus-bastion-sg (Bastion Ana Bilgisayar)
  - Gelen: <ofis VPN IP'sinden> TCP 22
```

Dahili trafik için IP adresi yok. Yalnızca güvenlik grubu ID'leri. Bir örnek değiştirildiğinde, güvenlik grubu üyeliği otomatik olarak yeni örneğe aktarılır.

"Peki planladığımız mikroservisler için?" diye sordu Rafael. "Sonunda bir düzine hizmetimiz olacak. Her biri bazılarıyla konuşmalı ama hepsiyle değil."

"Her hizmet kendi güvenlik grubunu alır," dedi Priya. "A Hizmetinin güvenlik grubu, A Hizmetinin çağırmasına izin verilen her hizmetin gelen kurallarında referans verilir. İletişim kurmaması gereken hizmetler birbirlerinin güvenlik gruplarına referans vermez."

Bu, mikroservisler için **hub-and-spoke güvenlik grubu desenidir**. Paylaşılan bir veritabanı güvenlik grubunun beş farklı hizmet güvenlik grubundan gelen kuralları vardır. Altıncı bir hizmetin veritabanı erişimine ihtiyacı varsa, güvenlik grubunu veritabanının gelen kuralına eklersiniz. Erişim kaldırılmalıysa, referansı kaldırırsınız. IP yönetimi yok. Hizmetten çıkarılmış sunuculara işaret eden eski kurallar yok.

"Güvenlik grubu kimliktir," dedi Priya. "IP adresi zamanlamanın bir kazasıdır."

---

**En Az Ayrıcalıklı Güvenlik Duvarı: Disiplin**

"Giden kurallar için doğru duruşun ne olduğunu düşündük mü?" diye sordu Priya olay sonrası incelemede.

Çoğu ekip EC2 güvenlik grubu giden kurallarını varsayılanda bırakır: tüm gidene izin ver. Bu kullanışlıdır — uygulama herhangi bir şeyi çağırabilir — ama en az ayrıcalık değildir.

Priya'nın ilkesi: giden kurallar gelen kurallar kadar spesifik olmalıdır.

Sertleştirmeden sonra Nimbus API güvenlik grubu giden kuralları:

```
TCP 5432 → nimbus-rds-sg       (RDS'ye PostgreSQL)
TCP 6379 → nimbus-redis-sg     (ElastiCache'e Redis)
TCP 443  → s3.amazonaws.com önek listesi    (S3 gateway uç noktası)
TCP 443  → secretsmanager uç noktası        (Secrets Manager)
TCP 443  → logs uç noktası                  (CloudWatch Logs)
```

"Tüm gidene izin ver" yok. Her hedef adlandırılmış.

"Bu çok fazla bakım," dedi Leo.

"İzin-ver-hepsinden daha fazla bakım," diye kabul etti Priya. "Bir veri ihlalinden daha az temizlik. EC2 örneğini tehlikeye atan saldırgan, giden kurallar açık olsaydı daha fazla veri sızdırabilirdi. HTTPS-her-yere kuralını kullandılar çünkü oradaydı."

"Ve belirli giden kurallarla, tehlikeye atılmış bir örnek bile yalnızca onaylanmış hedeflere veri gönderebilir."

"Aynen. Güvenlik grubu yalnızca ilk savunma hattı değil, son sınırlama hattı olur."

---

## Güçlü Yönler ve Sınırlamalar

**Güvenlik Grupları**:

- Durum bilgili (geçici port baş ağrıları yok)
- Diğer güvenlik gruplarına referans verebilir (IP'lerden daha esnek)
- Yalnızca izin kuralları — açık ret yok
- Kaynak düzeyinde çalışır — granüler
- Kurallar hemen uygulanır — sıralama yok, öncelik yok
- Bir kaynağa birden çok güvenlik grubu eklenebilir — hepsinin kuralları birleştirilir

**NACL'ler**:

- Durumsuz (geçici portlar dahil her iki yön için açık kurallar gerektirir)
- Açıkça reddedebilir — bilinen kötü IP'leri engellemek için yararlı
- Alt ağ düzeyinde çalışır — daha geniş fırça darbesi
- Numaralı kurallar sırayla değerlendirilir — öngörülebilir ama dikkatli yönetim gerektirir
- Trafik alt ağdaki herhangi bir kaynağa ulaşmadan önce uygulanır — ilk savunma hattı
- Tüm bir alt ağda acil IP engelleme için etkili

**Her aracın nereye uyduğu**:

Varsayılan olarak her şey için güvenlik gruplarını kullanın. Açık ret kurallarına ihtiyacınız olduğunda NACL'ler ekleyin — bir IP aralığını engelleme, tek tek kaynak yapılandırmasından bağımsız olarak alt ağ düzeyinde bir portu engelleme veya bir veri alt ağının belirli bir kaynaktan asla trafik alamayacağını uygulama. NACL'ler güvenlik gruplarının yerine geçmez; güvenlik gruplarının yalnızca izin verme tasarımının yetersiz olduğu durumlar için bir ektir.

## Özet

Romanya IP olayı, zaten yerinde olan güvenlik kontrolleri tarafından sınırlanmıştı — şansla değil, tasarımla. Güvenlik grupları VPC içinde yanal hareketi önlemişti. Olaydan sonra, NACL'ler saldırganın IP aralığını alt ağ sınırında açıkça engelleme yeteneği ekledi. VPC akış günlükleri saldırıyı görünür kıldı. İki araç, iki katman, iki farklı iş — ne olduğunu kanıtlamak için günlük kaydıyla.

- **Güvenlik Grupları**, tek tek kaynaklar için durum bilgili sanal güvenlik duvarlarıdır. Yalnızca izin kuralları. Tüm kurallar aynı anda değerlendirilir.
- **NACL'ler**, tüm alt ağlar için durumsuz güvenlik duvarlarıdır. İzin ve ret kuralları. Kurallar numara sırasına göre değerlendirilir — ilk eşleşme kazanır.
- **Durum bilgili**, yanıt trafiğine otomatik olarak izin verildiği anlamına gelir. **Durumsuz**, geçici dönüş portları dahil her iki yönde trafiğe açıkça izin vermeniz gerektiği anlamına gelir.
- Güvenlik grupları birincil erişim kontrol katmanınızdır. NACL'ler alt ağ düzeyi geçersizleştirmedir — özellikle acil engelleme için.
- Bir NACL gelen trafiğe izin verdiğinde, TCP yanıtının geçmesi için giden geçici portlara da (1024-65535) izin vermelisiniz.
- VPC içi trafik için IP adresine değil, **güvenlik gruplarına ID'ye göre referans verin**. Auto Scaling örnekleri değiştirir; güvenlik grubu üyeliği otomatik olarak aktarılır.
- EC2 örneklerinde **belirli giden kurallar**, tehlikeye atılmış bir örneğin ne yapabileceğini sınırlar — en az ayrıcalıklı güvenlik duvarı.
- Güvenlik gruplarının ve NACL'lerin gerçekte ne yaptığını görmek için akış günlüklerini kullanın. Kurallar teoridir. Günlükler kanıttır.

## Sınav İpuçları

*SAA-C03 Alanı: Güvenli Mimariler Tasarlama (Alan 1, Görev 1.2)*

- **Durum bilgili vs durumsuz**: Bu ayrım bu bölümdeki en çok test edilen kavramdır. Güvenlik grupları = durum bilgili = yanıt otomatik olarak izinli. NACL'ler = durumsuz = yanıt trafiğine açıkça izin vermelisiniz.
- **Güvenlik grubu kuralları**: Açık ret yok. Bir örneğe birden çok güvenlik grubu eklendiğinde, tüm kuralların birleşimi uygulanır. Tüm eşleşen kurallar aynı anda değerlendirilir.
- **NACL kural sırası**: Kurallar en düşük numaradan en yükseğe değerlendirilir. 100, 200'den önce. İlk eşleşme kazanır. En alttaki `*` (yıldız) kuralı örtük rettir. Kural 90'da bir ret kuralı eklemek, 100'deki herhangi bir izin kuralından önce engeller.
- **Geçici portlar**: Klasik NACL hatası, 1024-65535 portlarında gidene izin vermeyi unutmaktır. NACL'niz gelen HTTP'ye (port 80) izin verir ama giden geçici portlara izin vermezse, kullanıcılar istek gönderebilir ama asla yanıt alamaz. Bu en yaygın NACL sınav senaryosudur.
- **Güvenlik grubu referanslama**: Başka bir güvenlik grubundan (yalnızca bir IP değil) trafiğe izin verebilirsiniz. Bu, VPC içi trafik için önerilen desendir. Sınav, EC2 erişimini kısıtlamak için doğru cevap olarak sık sık "ALB güvenlik grubundan gelene izin ver"i kullanır.
- **Varsayılan NACL vs özel NACL**: Varsayılan NACL tüm trafiğe izin verir. Özel bir NACL (oluşturduğunuz) varsayılan olarak tüm trafiği reddeder. Sınav senaryosu: "yeni bir NACL oluşturdu ve şimdi trafik engellendi" → eksik izin kurallarını kontrol et.
- **Saldırganın IP'sini engelleme**: Güvenlik grupları belirli IP'leri engelleyemez (yalnızca izin). NACL'ler belirli bir IP'yi veya CIDR'yi açıkça reddedebilir. Sınav senaryosu: "belirli bir IP'nin alt ağdaki herhangi bir kaynağa ulaşmasını engelle" → NACL ret kuralı.
- **Bağlantı arızalarını ayıklama**: Sırayı kontrol et: kaynaktaki güvenlik grubu (giden) → hedefteki güvenlik grubu (gelen) → kaynak alt ağdaki NACL (giden + geçici portlar) → hedef alt ağdaki NACL (gelen). Çoğu sınav bağlantı arızası, eksik bir NACL giden kuralından veya eksik geçici port izninden kaynaklanır.
- **Birden çok alt ağ ve NACL'ler**: Bir NACL onunla ilişkili tüm alt ağlara uygulanır. Bir alt ağ yalnızca bir NACL ile ilişkilendirilebilir. Sınav, belirli bir alt ağın trafiği etkilendiğinde hangi NACL'nin güncelleneceğini sorabilir.

## Alıştırmalar

**Alıştırma 1 — Hatırlama**

Bir geliştirici bir güvenlik grubuna port 443'te trafiğe izin veren bir gelen kuralı ekler. Sunucunun yanıtına izin vermek için bir giden kuralı da eklemesi gerekir mi? Neden veya neden değil?

Bunun yerine bir NACL'ye port 443'te trafiğe izin veren bir gelen kuralı eklerse, bir giden kuralı eklemesi gerekir mi? Neden veya neden değil?

**İpucu**: Bölümün analojilerini düşünün — her biri sizi içeri aldığını hatırlayan güvenlik görevlisi mi, yoksa çıkışta tekrar geçmeniz gereken metal dedektörü mü?

**Alıştırma 2 — SAA-C03 Senaryosu**

*Senaryo*: Bir şirketin herkese açık bir alt ağda EC2 örneklerinde çalışan bir web uygulaması var. Uygulama internetten HTTPS trafiği (port 443) kabul eder. Kullanıcılar uygulamaya bağlanabildiklerini ama yanıt alamadıklarını bildiriyor — istekler takılıyor ve zaman aşımına uğruyor.

EC2 güvenlik grubunun 0.0.0.0/0'dan TCP 443'e izin veren bir gelen kuralı var. Alt ağın NACL'sinin 0.0.0.0/0'dan TCP 443'e izin veren bir gelen kuralı (kural 100) ve 0.0.0.0/0'a TCP 443'e izin veren bir giden kuralı (kural 100) var.

Sorunun EN OLASI nedeni nedir?

A) Güvenlik grubunda TCP 443 için bir giden kuralı eksik  
B) EC2 örneklerinin Elastic IP adresleri yok  
C) Güvenlik grubunda geçici portlar için bir gelen kuralı eksik  
D) NACL'de geçici portlara (1024-65535) izin veren bir giden kuralı eksik

**İpucu 1**: Güvenlik grupları durum bilgili — yanıtlara otomatik olarak izin verirler. NACL'ler durumsuz — vermezler.

**İpucu 2**: Bir tarayıcı port 443'te bir web sunucusuna bağlandığında, sunucunun yanıtı port 443'te değil, rastgele bir geçici portta (1024-65535) geri gider.

**İpucu 3**: NACL'nin 443 için bir giden kuralı var ama yanıt 443 portuna gitmiyor.

**Cevap**: D

**Açıklama**: NACL durumsuzdur. Kullanıcılar sunucuya port 443'te bağlandığında, sunucunun TCP yanıtı bir geçici portta (1024-65535'ten rastgele seçilen) geri gider. NACL giden kuralı yalnızca port 443'e izin verir, bu yüzden yanıt varsayılan ret kuralı tarafından engellenir. TCP 1024-65535'e izin veren bir giden NACL kuralı eklemek bunu çözer.

**Neden A değil?** Güvenlik grupları durum bilgilidir — yanıt trafiğine giden kurallardan bağımsız olarak otomatik izin verilir. Giden güvenlik grubu kuralı gerekmez.

**Neden B değil?** Elastic IP'ler örneklerin herkese açık IP'leri olup olmadığını etkiler, kurulmuş bağlantıların yanıt alıp alamayacağını değil.

**Neden C değil?** Geçici portlar giden yanıt trafiği içindir, gelen değil. Kullanıcılardan gelen bağlantı zaten izinli olan port 443'te gelir.

*SAA-C03 Alanı: Güvenli Mimariler Tasarlama — Görev 1.2*

**Alıştırma 3 — Mimari Mücadelesi** *(İsteğe Bağlı)*

Romanya IP saldırısından sonra, Priya iki ek kontrol uygulamak istiyor:

1. Tüm 185.0.0.0/8 IP aralığının herkese açık alt ağdaki herhangi bir kaynağa ulaşmasını engelle
2. Veritabanını içeren özel alt ağın, biri bir güvenlik grubunu yanlış yapılandırsa bile asla internetle iletişim kuramamasını sağla

Her gereksinim için hangi araçları kullanırdınız ve bunları nasıl yapılandırırdınız? İkisi için de güvenlik grupları kullanabilir miydiniz? İkisi için de NACL'ler kullanabilir miydiniz?

*(Tek bir doğru cevap yoktur. Amaç, hangi aracın hangi soruna uyduğunu anlamaktır.)*

## Jenerik Sonrası Sahne

Olay sınırlandı. Tehlikeye atılmış dağıtım anahtarı devre dışı bırakıldı. Romanya IP aralığı NACL'de engellendi. Eski komut dosyası EC2 örneğinden kaldırıldı.

Priya bir olay raporu yazdı. Ekiple paylaştı.

Raporun son satırı: "Kök neden: hizmetten çıkarılmış bir dağıtım hattından aktif bir kimlik bilgisi asla döndürülmedi veya iptal edilmedi. Öneri: otomatik kimlik bilgisi döndürme ve tüm IAM kimlik bilgilerinin düzenli denetimi."

Leo bunu üç kez okudu.

"O anahtarı döndürmeliydim," dedi.

"Evet," dedi Priya.

"Bunun tekrar olmamasını nasıl sağlarız?"

"Otomasyon," dedi. "Ve gözcüleri gözleyen bir şey."

Sonraki bölümde: Nimbus'un sırlarını sakladığı kilit kutu — ve çalınan anahtarları işe yaramaz kılan döndürme.
