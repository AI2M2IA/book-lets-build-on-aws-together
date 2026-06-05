# Bölüm 15: Kapının Koruyucuları

İlk sürümden eski dağıtım anahtarı hala aktifti. Son haftada üç API çağrısı yapmıştı. Leo neyin sebep olduğunu bilmiyordu.

Priya VPC akış günlüklerini açtı — VPC'ye giren ve çıkan tüm bağlantıları gösteren ağ trafiği kayıtları.

"Salı saat 2:17'de," dedi, "yük dengeleyiciye giden bir dış bağlantı Romania'daki bir IP adresi üzerinden yapıldı."

"Bu bizim altyapımız değil," dedi Leo.

"Evet."

"Yani birisi EC2 örneğimizdeydi."

"Veya bir şey."

Onlar bunu izlediler: eski dağıtım anahtarı, EC2 örneğine küçük bir betiği yüklemek için kullanılmıştı. Betik, komşu sunuculardaki portları taramaya çalışmıştı. Çoğu tarama başarısız olmuştu.

"Güvenlik grupları onları engelledi," dedi Priya. "Saldırgan bir EC2 örneğine girdi. Yük dengeleyiciye izin veren güvenlik grupları nedeniyle diğerlerine ulaşamadı."

"Yani hasar sınırlıydı."

"Çünkü güvenlik gruplarımızı doğru şekilde yapılandırdığımız için." Eğer 5432 portunu hesaba ait diğer tüm EC2 örneklerine açık bırakmış olsaydık.

Leo bunu hayal etmek zorunda değildi. Orijinal kurulumda bu yapılandırmayı görmüştü.

**İki Katmanlı Ağ Güvenliği**

Bir VPC'de, ağ trafiğini kontrol etmek için iki farklı araçınız vardır:

**Güvenlik Grupları**: Tek tek kaynaklara (EC2 örnekleri, RDS veritabanları, yük dengeleyiciler, VPC'de çalışan Lambda fonksiyonları) bağlı olan sanal yangın duvarları. Bunlar kaynak düzeyinde çalışır.

**Ağ Erişim Kontrol Listeleri (NACL'ler)**: Alt ağlara bağlı olan güvenlik kuralları. Bunlar alt ağ sınırında — herhangi bir kaynağa ulaşmadan önce çalışır.

Her ikisini anlamak, **durum bilgisi olan vs. durum bilgisi olmayan** bu kritik farkı anlamayı gerektirir.

**Durum Bilgisi Olan: Güvenlik Grupları**

Bir güvenlik grubu **durum bilgisi olan**dır.

Belirli bir portta giriş trafiğine izin verdiğinizde, yanıt trafiğinin de otomatik olarak izin verildiği varsayılır, özel bir çıkış kuralı olmasa bile.

Çıkış trafiğine izin verdiğinizde, geri dönen trafik de otomatik olarak izin verilir.

Bir ofis binasındaki güvenlik görevlisini düşünün. Kimliğinizi içeri girmek için gösterirsiniz. Daha sonra daha geç çıkarsınız. Görevli tekrar kimliğinizi kontrol etmek zorunda değildir — sistem, siz içeri girmenizi ve çıkmanızı izin verdiğini bilir.

**Nimbus API EC2 örneği için Güvenlik Grubu Kuralları:**

- **Giriş — TCP 8080 — Yük Dengeleyici SG'den** → ALB'den API trafiğini kabul et
- **Giriş — TCP 22 — Bastion Host SG'den** → Bastion'dan yalnızca SSH
- **Çıkış — TCP 5432 — RDS SG'ye** → PostgreSQL'e bağlan
- **Çıkış — TCP 6379 — ElastiCache SG'ye** → Redis'e bağlan
- **Çıkış — TCP 443 — 0.0.0.0/0'a** → Dış API'lere HTTPS

Not: 8080 portu için özel bir çıkış kuralı yoktur. Giriş kuralı durum bilgisi olanıdır — yük dengeleyicinin API'ye verdiği yanıt trafiği otomatik olarak izin verilir.

Not: Güvenlik grubu kuralları, IP adresleri yerine *diğer güvenlik gruplarına* başvurur. "Yük dengeleyici güvenlik grubundan giriş kabul et" anlamına gelir "bu güvenlik grubuna bağlı herhangi bir kaynak'tan trafik kabul et". Bu, IP adreslerini izlemeye göre daha esnektir ve daha sürdürülebilirdir.

**Varsayılan Davranış:**

- Varsayılan olarak, tüm giriş trafiği reddedilir
- Varsayılan olarak, tüm çıkış trafiği izin verilir
- Tüm kurallar değerlendirilir (güvenlik grupları sıralı kurallara sahip değildir — tüm eşleşen kurallar uygulanır)
- Güvenlik grupları yalnızca **izin verebilir** — açıkça reddet kuralları oluşturamazsınız

**Durum Bilgisi Olmayan: Ağ Erişim Kontrol Listeleri (NACL'ler)**

Bir NACL **durum bilgisi olmayan**dır.

8080 portuna izin verdiğinizde, yalnızca giriş trafiği kapsar. Yanıt (geçici portlardaki çıkış trafiği) açıkça bir çıkış kuralıyla izin verilmelidir.

Bir metal dedektörünü düşünün. İçeri geçerken geçersiniz. Metal dedektörü sizin geçmenizi bilmez — dışarı geçerken de geçmeniz gerekir.

**NACL kuralları numaralandırılır ve sırayla değerlendirilir.** İlk eşleşen kural kazanır. Kural 100, Kural 200'e göre değerlendirilir. Kural 100 reddederse ve Kural 200 izin verse, trafik reddedilir.

NACL'ler açıkça **reddetmek** için kullanılabilir — güvenlik grupları gibi, yalnızca izin verebilirler. Bu, belirli IP aralıklarını engellemek için kullanışlı hale getirir.

**Varsayılan NACL Davranışı:**

- Varsayılan NACL (VPC'nizle birlikte oluşturulan) tüm giriş ve çıkış trafiğine izin verir
- Özel bir NACL varsayılan olarak tüm trafiği reddeder (izin vermek istediğiniz her şeyi açıkça tanımlamanız gerekir)

**Herkese Açık Alt Ağ için NACL:**

*Giriş Kuralları (numaralandırılmış sırada ilk eşleşen kural kazanır):*

- Kural 100: TCP 443, 0.0.0.0/0'dan → **İzin Ver** (HTTPS)
- Kural 110: TCP 80, 0.0.0.0/0'dan → **İzin Ver** (HTTP)
- Kural 120: TCP 1024–65535, 0.0.0.0/0'dan → **İzin Ver** (geçici dönüş portları)
- Kural \*: Tüm trafik → **Reddet**

*Çıkış Kuralları:*

- Kural 100: TCP 443, 0.0.0.0/0'a → **İzin Ver** (HTTPS)
- Kural 110: TCP 80, 0.0.0.0/0'a → **İzin Ver** (HTTP)
- Kural 120: TCP 1024–65535, 0.0.0.0/0'a → **İzin Ver** (geçici dönüş portları)
- Kural \*: Tüm trafik → **Reddet**

Rule 120 (1024-65535 portları) geçici yüksek numaralı portları — TCP yanıt trafiği için kullanılan geçici portları sağlar. Çünkü NACL'ler durumsuz olduğundan, bu çıkış yönlü veya sunucunun yanıtlarının geçmesine izin vermediğiniz sürece bunları açıkça izin vermeniz gerekir.

**Hangi Kullanılmalı?**

**Güvenlik Grupları**, erişim kontrolü için ana katmandır. Daha kolay yönetilirler, durumlu oldukları için (geçici portlar hakkında yanlışlıkla engellemeyi önlerler) ve diğer güvenlik gruplarına başvurmayı desteklerler.

**NACL'ler**, özellikle alt ağ düzeyinde kontroller için kullanılır:

- **Açıkça reddetme kuralları**: Bir alt ağın tümüne ulaşan belirli bir IP adresi veya aralığı engeller.
- **Acil engelleme**: Bir IP adresi aktif olarak bir kaynağa saldırıyorsa, tüm alt ağı engellemek için bir NACL reddetme kuralı ekleyin.

"Güvenlik grubu ince taneli kontrolü," dedi Maya, "ve NACL geniş bir tarama mı?"

"Güvenlik grupları bireysel kaynakları korur," dedi Priya. "NACL'ler tüm alt ağları korur. Bir ağınızdaki herhangi bir şeye bir IP adresini engellemek istiyorsanız NACL. Yük dengeleyicinin API sunucusuya erişmesine izin vermek istiyorsanız güvenlik grubu."

**Olay: Katmanlar Ne Yakaladı**

Romen IP saldırısına geri dönelim:

**Ne oldu**: Saldırgan, bir EC2 örneğine bir tarama betiğini yüklemek için kullanılabilen tehlikeye düşürülmüş dağıtım anahtarını kullandı. Betik diğer hizmetlere bağlanmaya çalıştı.

**Onu Durdurduğu Şey**:

- RDS güvenlik grubu yalnızca API EC2 güvenlik grubundan 5432 portuna giriş trafiğini izin veriyordu. Betik, tarama aracından veritabanına ulaşamadı — doğru güvenlik grubunu bağlamadı.
- ElastiCache güvenlik grubu yalnızca API EC2 güvenlik grubundan 6379 portuna giriş trafiğini izin veriyordu.
- Diğer EC2 örnekleri, bastion ana bilgisayar güvenlik grubundan SSH'ye erişime izin veriyordu.

**Onu Durdurmayan Şeyler**:

- EC2 örneğinin kuralları, paket indirmeleri için 0.0.0.0/0'a HTTPS'ye izin veriyordu. Betik, saldırgan sunucusuya çıkış bağlantıları yapmak için bunu kullandı.

Olaydan sonra Priya ekledi:

- Romen IP aralığını engelleyen bir NACL kuralı
- EC2 örnekleri için daha kısıtlayıcı bir çıkış kuralı (yalnızca bilinen iyi hedeflere izin veriliyordu)

## Güçlü Yönler ve Sınırlamalar

**Güvenlik Grupları**:

- Durumlu (geçici port sorunları yok)
- Diğer güvenlik gruplarına başvurabilir (IP adreslerinden daha esnek)
- Sadece izin kuralları — açıkça reddetme yok
- Kaynak düzeyinde çalışır — ayrıntılı

**NACL'ler**:

- Durumsuz (geçerli yönlerde hem giriş hem de çıkış için açık kurallar gerekir, geçici portlar dahil)
- Açıkça reddetme — kötü amaçlı IP adreslerini engellemek için kullanışlı
- Alt ağ düzeyinde çalışır — daha geniş bir tarama
- Sayısal kurallar en düşük sayıdan en yüksek sayıya doğru sıralanır — tahmin edilebilir ancak dikkatli yönetim gerekir

## Özet

- **Güvenlik Grupları**, bireysel kaynaklar için durumlu sanal güvenlik duvarlarıdır. Sadece izin kuralları vardır. Tüm kurallar değerlendirilir.
- **NACL'ler**, tüm alt ağlar için durumsuz güvenlik duvarlarıdır. İzin ve reddetme kuralları vardır. Kurallar sayısal sıraya göre değerlendirilir.
- **Durumlu** anlamına, yanıt trafiğinin otomatik olarak izin verildiği anlamına gelir. **Durumsuz** anlamına, her iki yönde de trafiği açıkça izin vermeniz gerektiği anlamına gelir.
- Güvenlik grupları, ana erişim kontrol katmanıdır. NACL'ler, alt ağ düzeyinde kontroller ve açık engelleme için ek bir katmandır.
- Bir NACL giriş trafiğine izin verirken, TCP yanıtının geçmesine izin vermek için 1024-65535 portlar için de çıkış izinleri vermeniz gerekir.
- Güvenlik grupları birbirine başvurabilir — yük dengeleyici güvenlik grubundan trafiğe izin vermek, IP adreslerini izlemekten daha sürdürülebilirdir.
- Varsayılan NACL vs özel NACL

## Sınav İpuçları

*SAA-C03 Alanı: Güvenli Mimari Tasarımı (Alan 1, Görev 1.2)*

- **Durumlu vs durumsuz**: Bu ayrım en çok test edilen kavramdır bu bölümde. Güvenlik grupları = durumlu = yanıt otomatik olarak izin verilir. NACL'ler = durumsuz = yanıt trafiğini açıkça izin vermeniz gerekir.
- **Güvenlik grubu kuralları**: Hiçbir açık reddetme yok. Birden fazla güvenlik grubu bir örneğe bağlıysa, tüm kuralların birleşimi uygulanır. Tüm eşleşen kurallar değerlendirilir.
- **NACL kuralı sırası**: Kurallar en düşük sayıdan en yüksek sayıya doğru numaralandırılır. Kural 100, Kural 200'den önce gelir. İlk eşleşen kazançtır. "\*" (yıldız) kuralı en alttadır ve varsayılan reddetmedir.
- **Geçici portlar**: NACL'nin giriş HTTP'yi (port 80) izin vermesine rağmen geçici portları izin vermemesi durumunda, kullanıcılar istek gönderebilir ancak yanıt alamazlar.
- **Güvenlik grubu referanslama**: Bir güvenlik grubundan (IP adresleri yerine) trafiğe izin verebilirsiniz. VPC içinde trafik için bu önerilen modeldir.
- **Varsayılan NACL vs özel NACL**: "Yeni bir NACL oluşturdu ve şimdi trafik engelleniyor" → izin kurallarını kontrol edin.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Bir geliştirici, port 443'e giriş için bir kural ekler. Ayrıca sunucunun yanıtına izin vermek için bir çıkış kuralı da eklemeli mi? Neden veya neden olmamalı?

Eğer bunun yerine bir NACL kuralı port 443'e izin verir, bir dışarıdan gelen kural eklemeye gerek var mıdır? Neden veya neden değil?

**Egzersiz 2 — Sınav Uygulaması**

*Senaryo*: Web uygulaması, kamu alt ağına yerleştirilmiş EC2 örneklerinde çalışan bir şirkete ait. Uygulama, internetten HTTPS trafiğine (port 443) izin veriyor. Kullanıcılar uygulamaya bağlanabiliyor ancak yanıt alamıyor; istekler takılıyor ve zaman aşımına uğruyor.

EC2 güvenlik grubu, TCP 443'ü 0.0.0.0/0'dan gelen trafiğe izin veren bir iç giden kurala sahip. Alt ağın NACL'si, TCP 443'ü 0.0.0.0/0'dan gelen trafiğe izin veren (kural 100) bir iç giden kurala ve TCP 443'ü 0.0.0.0/0'a giden (kural 100) bir dışarıdan gelen kurala sahip.

En olası sorun nedir?

A) Güvenlik grubu, TCP 443 için bir dışarıdan gelen kuralı eksikleştiriyor.
B) NACL, geçici portlara (1024-65535) izin veren bir dışarıdan gelen kuralı eksikleştiriyor.
C) Güvenlik grubu, geçici portlar için bir iç giden kuralı eksikleştiriyor.
D) EC2 örneklerinin Elastic IP adresleri yok.

**İpucu 1**: Güvenlik grupları durum bilgili — otomatik olarak yanıt trafiğini izin veriyor. NACL'ler durum bilgisi taşımayan — bunu yapmıyor.

**İpucu 2**: Bir tarayıcı, port 443'e bir web sunucusuna bağlandığında, sunucunun yanıtı rastgele bir geçici portta (1024-65535) değil, port 443 üzerinden geri dönüyor.

**İpucu 3**: NACL, 443'e yönelik bir dışarıdan gelen kurala sahip olmasına rağmen, yanıt 443 portuna gitmiyor.

**Cevap**: B

**Açıklama**: NACL durum bilgisi taşımıyor. Kullanıcılar sunucuya port 443'te bağlandığında, sunucunun TCP yanıtı, 1024-65535 aralığından rastgele seçilen bir geçici port üzerinden geri dönüyor. NACL dışarıdan gelen kuralı yalnızca port 443'ü izin veriyor, bu nedenle yanıt, varsayılan reddetme kuralı tarafından engelleniyor. Geçici portlara (1024-65535) izin veren bir NACL dışarıdan gelen kural eklemek bu sorunu çözebilir.

**Neden A?** Güvenlik grupları durum bilgili — yanıt trafiği herhangi bir dışarıdan gelen kurala bakılmaksızın otomatik olarak izin veriliyor. Güvenlik grubunda herhangi bir dışarıdan gelen kurala ihtiyaç yoktur.

**Neden C?** Geçici portlar, dışarıdan gelen yanıt trafiği için kullanılır, iç giden. Kullanıcıların gelen bağlantısı port 443 üzerinden gelir, bu zaten izin verilir.

**Neden D?** Elastic IP adresleri, örneklerin halka açık IP'lere sahip olup olmamasına değil, kurulmuş bağlantıların yanıt alıp almamasına etki eder.

*SAA-C03 Alanı: Güvenli Mimari Tasarımı — Görev 1.2*

**Egzersiz 3 — Mimari Zorluk** *(İsteğe Bağlı)*

Romanya IP saldırısından sonra Priya, iki ek kontrol uygulamak istiyor:

1. 185.0.0.0/8 IP aralığının herhangi bir kaynağa ulaşmasını engellemek.
2. Veritabanının özel alt ağı, bir güvenlik grubunun yanlış yapılandırılması durumunda bile internetle asla iletişim kurmaması.

Her gereksinim için hangi araçları kullanırdınız ve bunları nasıl yapılandırırdınız? Güvenlik gruplarını her ikisi için kullanabilir miydiniz? NACL'leri her ikisi için kullanabilir miydiniz?

*(Tek bir doğru cevap yoktur. Amaç, hangi soruna hangi aracın uyarlandığını anlamaktır.)*

## Kredi Sahnesi

Olay kontrol altına alındı. Zararlı dağıtım anahtarı devre dışı bırakıldı. Romanya IP aralığı NACL'de engellendi. Eski betik EC2 örneğinden kaldırıldı.

Priya bir olay raporu yazdı. Ekibe paylaştı.

Raporun son cümlesi: "Kök neden: devre dışı bırakılmış bir dağıtım boru hattından gelen aktif bir kimlik bilgisi asla döndürülmedi veya geri çağırılmadı. Öneri: otomatik kimlik bilgisi döndürme ve tüm IAM kimlik bilgilerinin düzenli olarak denetlenmesi."

Leo bunu üç kez okudu.

"Bunu döndürmeliydim," dedi.

"Evet," dedi Priya.

"Bu tekrar olmasını nasıl sağlayabiliriz?"

"Otomasyon," dedi. "Ve onları izleyen şeyleri."

Sonraki bölüm: Nimbus'un sırlarının bulunduğu kilit kutu — ve çalınan anahtarları etkisiz hale getiren döndürme.
