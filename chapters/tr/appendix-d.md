# Ek D: Tam Pratik Sınav (65 Soru)

Bu, tam uzunlukta bir SAA-C03 pratik sınavıdır: 65 soru, gerçek sınavın alan ağırlıklarını yansıtır — Güvenli Mimariler Tasarlama (Sorular 1–20, ~%30), Dayanıklı Mimariler Tasarlama (21–37, ~%26), Yüksek Performanslı Mimariler Tasarlama (38–53, ~%24) ve Maliyet Optimize Edilmiş Mimariler Tasarlama (54–65, ~%20).

**Nasıl çözülür:**

- **130 dakika** için bir zamanlayıcı kurun — gerçek sınavın süresi. Tempoyu çalışın: bu, soru başına iki dakika demektir.
- Yedi soru **"(İKİ tane seçin.)"** der — bunların beş seçeneği ve tam olarak iki doğru cevabı vardır, tıpkı gerçek sınavın çoklu-yanıt maddeleri gibi. Soruyu puanlamak için her ikisi de doğru olmalıdır.
- 65 sorunun tamamını bitirene kadar cevap anahtarına bakmayın. Gerçek sınavda uçuş sırasında geri bildirim yoktur ve belirsizliğe karşı toleransınızı eğitmek hazırlığın bir parçasıdır.
- Gerçek sınav, tanımlayamayacağınız 15 puanlanmayan deneysel soru içerir. Buradaki 65 sorunun tamamı "puanlanır". Geçme ölçütü: **47 veya daha fazla doğru (~%72)** sizi 720/1000 ölçeklenmiş geçme puanı aralığına yerleştirir. 47'nin altındaysanız, sınava kayıt olmadan önce zayıf alanlarınız için Ek B'de eşlenen bölümleri yeniden gözden geçirin.
- Kaçırdığınız her soru için — ve doğru yaptığınız ama tereddüt ettiğiniz her soru için — çeldirici analizini okuyun. Sınav, makul seçenekler *arasındaki farkları* test eder ve öğrenme tam da orada gizlidir.

---

## Bölüm 1 — Güvenli Mimariler Tasarlama (Sorular 1–20)

**Soru 1** *(Domain 1 — Task 1.1)*
Bir finansal hizmetler şirketi, tüm özellikleri etkinleştirilmiş AWS Organizations kullanır. Güvenlik ekibi, organizasyonun köküne (root) eu-west-1 dışındaki tüm AWS Region'larının kullanımını reddeden bir service control policy (SCP) ekledi. Bir denetim sırasında ekip, bir hesaptaki bir yöneticinin SCP'ye rağmen us-east-2'de hâlâ EC2 örnekleri başlatabildiğini keşfeder. Bu eylemin gerçekleşmesine büyük olasılıkla hangi hesap izin vermiştir?

A) İç içe (nested) bir organizational unit (OU) içindeki bir üye hesap, çünkü SCP'ler iç içe OU'lara yayılmaz
B) Yönetim hesabı (management account), çünkü SCP'ler yönetim hesabına uygulanmaz
C) IAM yönetici politikası açık bir Allow içeren bir üye hesap, çünkü bu, SCP'leri geçersiz kılar
D) SCP eklendikten sonra oluşturulan bir üye hesap, çünkü SCP'ler yalnızca ekleme anında var olan hesaplara uygulanır

**Soru 2** *(Domain 1 — Task 1.1)*
Bir girişim, geliştiricilerinin uygulamaları için IAM rolleri oluşturmasına izin vermek istiyor, ancak güvenlik ekibi geliştiricilerin kendi sahip olduklarından daha fazla izne sahip roller oluşturabileceğinden ve bunun ayrıcalık yükseltmeye (privilege escalation) yol açabileceğinden endişe ediyor. Güvenlik ekibi, geliştiricilerin self-servis rol oluşturmayı sürdürmesini istiyor. EN UYGUN çözüm nedir?

A) Geliştiricilerin rol oluşturma taleplerini, güvenlik ekibi tarafından incelenen bir bilet (ticketing) sistemi üzerinden göndermelerini zorunlu kılmak
B) Geliştiricilerin hesaplarına, iam:CreateRole eylemini tamamen reddeden bir SCP eklemek
C) Geliştiriciler tarafından oluşturulan tüm rollerin belirli bir permissions boundary içermesini, iam:CreateRole ve iam:AttachRolePolicy üzerinde bir IAM koşuluyla zorlanarak gerektirmek
D) AWS CloudTrail'i etkinleştirmek ve bir geliştirici her yeni IAM rolü oluşturduğunda uyarılar yapılandırmak

**Soru 3** *(Domain 1 — Task 1.1)*
Bir SaaS sağlayıcısı, otomatik maliyet analizi gerçekleştirmek için müşterilerinin AWS hesaplarındaki kaynaklara erişmesi gerekiyor. Müşteriler, SaaS sağlayıcısının hesabının üstlenebileceği (assume) bir IAM rolü oluşturur. Bir güvenlik danışmanı, bir müşterinin rol ARN'sini öğrenen üçüncü bir tarafın, SaaS sağlayıcısını kandırarak o müşterinin hesabına üçüncü tarafın adına erişmesini sağlayabileceği konusunda uyarır. Bu "confused deputy" (şaşkın vekil) riskini hangi mekanizma azaltır?

A) Hesaplar arası rolün güven politikasında (trust policy) çok faktörlü kimlik doğrulama (MFA) gerektirmek
B) SaaS sağlayıcısının, müşteri tarafından tanımlanan benzersiz bir ExternalId'yi sts:AssumeRole çağrısında geçirmesini ve bunun rolün güven politikasındaki bir koşulla doğrulanmasını gerektirmek
C) Rol ARN'sini SaaS sağlayıcısıyla paylaşmadan önce AWS KMS ile şifrelemek
D) Hesaplar arası rolü, erişim anahtarları her 90 günde bir döndürülen bir IAM kullanıcısıyla değiştirmek

**Soru 4** *(Domain 1 — Task 1.1)*
AWS Organizations'da 40 AWS hesabı olan bir şirket, çalışanlarının mevcut Microsoft Entra ID (Azure AD) kimlik bilgileriyle bir kez oturum açmasını ve tek bir portal üzerinden tüm AWS hesaplarına, izinler hesap bazında merkezi olarak atanmış şekilde erişmesini istiyor. EN AZ operasyonel ek yükle bu gereksinimleri hangi çözüm karşılar?

A) 40 hesabın her birinde IAM kullanıcıları oluşturmak ve parolaları Entra ID ile senkronize etmek
B) AWS IAM Identity Center'ı Entra ID'yi harici kimlik sağlayıcısı (identity provider) olarak yapılandırmak ve hesap bazında kullanıcılara ve gruplara permission set'ler atamak
C) Her hesapta Amazon Cognito user pool'ları dağıtmak ve bunları Entra ID'ye federe etmek
D) Her hesapta bir SAML kimlik sağlayıcısı oluşturmak ve hesap bazında IAM rollerini ve güven politikalarını elle yazmak

**Soru 5** *(Domain 1 — Task 1.1)*
Bir mobil oyun şirketi, oyuncuların bir e-posta adresi veya sosyal oturum açma ile kaydolduğu ve kimlik doğrulamadan sonra uygulamanın oyuncu ekran görüntülerini geçici AWS kimlik bilgileri kullanarak doğrudan bir Amazon S3 bucket'ına yüklemesi gereken bir uygulama oluşturuyor. Çözüm mimarı hangi hizmet kombinasyonunu önermelidir?

A) Kaydolma/oturum açma için bir Amazon Cognito user pool ve kimliği doğrulanmış token'ı geçici AWS kimlik bilgileriyle değiştirmek için bir Amazon Cognito identity pool
B) Kaydolma/oturum açma için bir Amazon Cognito identity pool ve geçici AWS kimlik bilgileri vermek için bir Amazon Cognito user pool
C) Kaydolma/oturum açma için AWS IAM Identity Center ve kimlik bilgileri için AWS STS GetSessionToken
D) Yalnızca bir Amazon Cognito user pool, çünkü user pool token'ları S3'e doğrudan erişim sağlar

**Soru 6** *(Domain 1 — Task 1.3)*
Bir sağlık şirketi, Amazon S3'teki verileri AWS tarafından yönetilen otomatik yıllık rotasyonu destekleyen bir anahtarla şifrelemeli, ancak yine de key policy'yi tanımlayabilmeli, anahtar kullanımının CloudTrail günlüğünü etkinleştirebilmeli ve gerekirse anahtarı devre dışı bırakabilmelidir. Hangi KMS anahtar tipi bu gereksinimleri karşılar?

A) Bir AWS managed key (aws/s3)
B) Otomatik rotasyon etkinleştirilmiş bir customer managed key
C) Bir AWS owned key
D) Otomatik rotasyon etkinleştirilmiş, içe aktarılmış anahtar materyali (BYOK) olan bir customer managed key

**Soru 7** *(Domain 1 — Task 1.3)*
Bir çözüm mimarı, KMS'nin yalnızca 4 KB'a kadar veriyi doğrudan şifreleyebildiği göz önüne alındığında, AWS KMS'nin bir uygulama tarafından saklanan 4 GB'lık bir dosyayı nasıl şifrelediğini açıklıyor. Hangi ifade zarf şifrelemeyi (envelope encryption) doğru biçimde tanımlar?

A) KMS, dosyayı 4 KB'lık parçalara böler ve her parçayı KMS anahtarıyla şifreler
B) Uygulama, KMS'den bir data key ister, dosyayı düz metin (plaintext) data key ile yerel olarak şifreler, ardından şifrelenmiş data key'i veriyle birlikte saklar ve düz metin data key'i atar
C) KMS, dosyayı KMS API üzerinden akış (stream) olarak geçirir ve onu KMS anahtarıyla sunucu tarafında şifreler
D) Uygulama, dosyayı sabit kodlanmış bir simetrik anahtarla şifreler ve KMS bütünlük için sonucu imzalar

**Soru 8** *(Domain 1 — Task 1.3)*
Bir şirket, bir Amazon RDS for PostgreSQL ana (master) parolasını saklar ve uygulama kesintisi olmadan her 30 günde bir otomatik olarak döndürülmesini ister. Uygulama uzun ömürlü veritabanı bağlantıları tuttuğundan, ekip yeni kimlik bilgisi etkinleştirilirken önceki kimlik bilgisinin geçerli kaldığı bir rotasyon stratejisi ister. Hangi çözüm bu gereksinimleri karşılar?

A) Aylık tetiklenen bir Lambda fonksiyonu ile AWS Systems Manager Parameter Store SecureString parametreleri
B) Single-user (tek kullanıcı) rotasyon stratejisi ile AWS Secrets Manager
C) İki veritabanı kullanıcısı arasında geçiş yaparak her zaman bir kimlik bilgisinin geçerli kalmasını sağlayan alternating-users (dönüşümlü kullanıcılar) rotasyon stratejisi ile AWS Secrets Manager
D) Veritabanı parolasına uygulanan AWS KMS otomatik anahtar rotasyonu

**Soru 9** *(Domain 1 — Task 1.3)*
Bir medya şirketi, ham videoyu Amazon S3'te saklar. Uyumluluk, şirketin kendi şifreleme anahtarlarını yönetip sağlamasını, AWS'nin bu anahtarları asla saklamamasını ve anahtarların her istekle birlikte sağlanmasını gerektirir. Hangi şifreleme seçeneği bu gereksinimleri karşılar?

A) SSE-S3
B) Customer managed key ile SSE-KMS
C) SSE-C
D) AWS managed key aws/s3 kullanan istemci tarafı (client-side) şifreleme

**Soru 10** *(Domain 1 — Task 1.3)*
Bir aracı kurum (broker-dealer), SEC Rule 17a-4'ü karşılamak için ticaret kayıtlarını Amazon S3'te yedi yıl boyunca, saklama süresi içinde — AWS hesabı root kullanıcısı dahil — hiç kimsenin nesneleri silmesini veya üzerine yazmasını önleyen bir şekilde saklamalıdır. Hangi yapılandırma bu gereksinimi karşılar?

A) 7 yıllık saklama süresiyle governance modunda S3 Object Lock
B) Sürümleme etkinleştirilmiş bir bucket'ta, 7 yıllık saklama süresiyle compliance modunda S3 Object Lock
C) Tüm principal'lar için s3:DeleteObject'i reddeden bir S3 bucket policy
D) Nesneleri 7 yıl sonra sona erdiren (expire) bir yaşam döngüsü kuralı ile S3 Glacier Deep Archive

**Soru 11** *(Domain 1 — Task 1.2)*
Bir web uygulaması, bir Application Load Balancer arkasındaki EC2 örneklerinde çalışır. Bir ağ mühendisi, alt ağa (subnet) 0.0.0.0/0'dan gelen TCP 443 portuna izin veren bir network ACL kuralı ekler, ancak istemciler hâlâ HTTPS isteklerini tamamlayamaz. Güvenlik grupları doğru yapılandırılmıştır. EN OLASI neden nedir?

A) Network ACL durum bilgilidir (stateful) ve bir bağlantı izleme (connection-tracking) kuralı gerektirir
B) Network ACL'nin geçici (ephemeral) portlara (1024–65535) izin veren giden bir kuralı yok, bu yüzden NACL'ler durum bilgisiz (stateless) olduğundan dönüş trafiği engelleniyor
C) Güvenlik grubu da giden 443 portuna izin vermeli, çünkü güvenlik grupları durum bilgisizdir
D) Network ACL'ler 0.0.0.0/0'dan trafiğe izin veremez; belirli bir CIDR gereklidir

**Soru 12** *(Domain 1 — Task 1.2)*
Bir VPC'deki güvenlik grupları ve network ACL'ler hakkındaki hangi İKİ ifade doğrudur? (İKİ tane seçin.)

A) Güvenlik grupları durum bilgilidir (stateful), bu yüzden dönüş trafiği giden kurallardan bağımsız olarak otomatik olarak izinlidir
B) Network ACL'ler kuralları sayısal sırayla değerlendirir ve açık Deny kurallarını destekler
C) Güvenlik grupları hem Allow hem de Deny kurallarını destekler
D) Network ACL'ler bireysel elastic network interface'lere (ENI) eklenir
E) Güvenlik grubu kuralları sayısal sırayla değerlendirilir, ilk eşleşmede durulur

**Soru 13** *(Domain 1 — Task 1.2)*
CloudFront ve ALB üzerinde herkese açık bir uygulama çalıştıran bir e-ticaret şirketi, büyük ve sofistike DDoS saldırılarından endişe ediyor. Şirket, AWS Shield Response Team'e 7/24 erişim, saldırıların neden olduğu ölçekleme ücretlerine karşı maliyet koruması ve saldırı tanılama bilgisi istiyor. Hangi hizmeti kullanmalıdır?

A) Otomatik olarak ücretsiz etkinleştirilen AWS Shield Standard
B) AWS Shield Advanced
C) Hız tabanlı (rate-based) kurallarla AWS WAF
D) EC2 koruma planı ile Amazon GuardDuty

**Soru 14** *(Domain 1 — Task 1.2)*
Bir Application Load Balancer arkasındaki bir REST API, SQL injection denemeleri ve küçük bir IP adresi kümesinden gelen aşırı isteklerle saldırıya uğruyor. EN AZ geliştirme çabasıyla kötü amaçlı istek kalıplarını uygulamanın kenarında (edge) engelleyen çözüm hangisidir?

A) Her API işleyicisine girdi doğrulama kodu eklemek
B) AWS WAF'i, SQL injection yönetilen kural grubunu (managed rule group) ve hız tabanlı bir kuralı kullanarak ALB ile ilişkilendirmek
C) ALB üzerinde AWS Shield Standard'ı etkinleştirmek
D) ALB güvenlik grubunu, SQL anahtar kelimeleri içeren istekleri reddedecek şekilde yapılandırmak

**Soru 15** *(Domain 1 — Task 1.2)*
Bir şirket üç güvenlik ihtiyacını ele almak istiyor: (1) tehdit istihbaratı kullanarak ele geçirilmiş EC2 örneklerini ve anormal API etkinliğini sürekli tespit etmek, (2) S3 bucket'larında saklanan kişisel olarak tanımlanabilir bilgileri (PII) keşfetmek ve sınıflandırmak ve (3) EC2 örneklerini ve konteyner imajlarını yazılım güvenlik açıkları (CVE'ler) açısından taramak. AWS hizmetlerinin ihtiyaçlara hangi eşlemesi doğrudur?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Soru 16** *(Domain 1 — Task 1.2)*
Özel alt ağlardaki (private subnets) EC2 örneklerinde çalışan bir uygulama, Amazon S3'e nesne yüklemeli ve Amazon DynamoDB'yi çağırmalıdır. Kurumsal politika trafiğin herkese açık interneti geçmesini yasaklıyor ve ekip her iki hizmet için en düşük maliyetli seçeneği istiyor. Hangi çözüm bu gereksinimleri karşılar?

A) Genel bir alt ağda bir NAT gateway
B) S3 ve DynamoDB için, alt ağların yönlendirme tablolarında (route tables) referans verilen gateway VPC endpoint'leri
C) S3 ve DynamoDB için interface VPC endpoint'leri (AWS PrivateLink)
D) Kısıtlayıcı güvenlik grubu kurallarına sahip bir internet gateway

**Soru 17** *(Domain 1 — Task 1.3)*
Bir saldırganın savunmasız bir web uygulaması üzerinden bir EC2 örneğinin metadata servisinden IAM rolü kimlik bilgilerini aldığı bir server-side request forgery (SSRF) olayından sonra, bir güvenlik ekibi tüm örnekleri bu saldırı sınıfına karşı sertleştirmek istiyor. Ekip ne yapmalıdır?

A) Oturum token'ları gerektirerek IMDSv2'yi zorlamak (HttpTokens=required), böylece metadata istekleri basit SSRF isteklerinin edinemeyeceği, bir PUT ile alınan bir token gerektirir
B) Uygulamalar asla ihtiyaç duymadığı için tüm örneklerde örnek metadata servisini devre dışı bırakmak
C) Alt ağın network ACL'sinde 169.254.169.254'ü engellemek
D) Örnek rolünün kimlik bilgilerini örnekteki bir yapılandırma dosyasına taşımak

**Soru 18** *(Domain 1 — Task 1.3)*
Bir çözüm mimarı, yaklaşık 200 düz metin uygulama yapılandırma değeri (özellik bayrakları, ortam adları, endpoint URL'leri) ve 5 veritabanı parolası saklamalıdır. Parolalar otomatik rotasyon gerektirir; yapılandırma değerleri gerektirmez ve ekip maliyeti en aza indirmek ister. Hangi kombinasyon EN uygun maliyetlidir?

A) Her şeyi AWS Secrets Manager'da saklamak
B) Her şeyi AWS Systems Manager Parameter Store standard parametrelerinde saklamak
C) Yapılandırma değerlerini Parameter Store standard parametrelerinde (ücretsiz) ve parolaları rotasyon etkinleştirilmiş AWS Secrets Manager'da saklamak
D) Yapılandırma değerlerini S3'te ve parolaları yerleşik otomatik rotasyonlu Parameter Store SecureString parametrelerinde saklamak

**Soru 19** *(Domain 1 — Task 1.3)*
Bir şirket, S3 nesnelerini bir customer managed key kullanarak SSE-KMS ile şifreler. Aynı hesaptaki bir uygulama bu nesneleri saniyede binlerce kez okur ve ekip, KMS API çağrılarından kaynaklanan kısıtlama (throttling) ve maliyet endişeleri görüyor. SSE-KMS şifrelemesini korurken KMS istek trafiğini hangi değişiklik azaltır?

A) Bucket'ı, hiç anahtar kullanmayan SSE-S3'e geçirmek
B) S3 Bucket Keys'i etkinleştirmek, böylece S3, KMS'ye yapılan çağrıları azaltmak için kısa ömürlü bucket düzeyinde bir anahtar kullanır
C) Customer managed key üzerinde otomatik anahtar rotasyonunu devre dışı bırakmak
D) Customer managed key'i içe aktarılmış anahtar materyali ile değiştirmek

**Soru 20** *(Domain 1 — Task 1.1)*
IAM politika değerlendirmesi ve AWS Organizations hakkındaki hangi İKİ ifade doğrudur? (İKİ tane seçin.)

A) SCP'ler, üye hesaplardaki IAM kullanıcılarına ve rollerine izin verir
B) Uygulanabilir herhangi bir politikadaki açık bir Deny, her zaman herhangi bir Allow'u geçersiz kılar
C) Kaynak tabanlı (resource-based) politikalar, bir SCP olmadan hesaplar arası erişim veremez
D) Bir permissions boundary, kimlik tabanlı bir politikanın bir kullanıcıya veya role verebileceği maksimum izinleri belirler, ancak kendi başına hiçbir şey vermez
E) Hiçbir politika bir eylemden bahsetmiyorsa, eylem IAM kullanıcıları için varsayılan olarak izinlidir

---

## Bölüm 2 — Dayanıklı Mimariler Tasarlama (Sorular 21–37)

**Soru 21** *(Domain 2 — Task 2.2)*
Çevrimiçi bir perakendeci Amazon RDS for MySQL çalıştırır. Veritabanı, raporlama panolarından yoğun okuma trafiği yaşar ve şirket ayrıca veritabanının bir Availability Zone arızasından otomatik failover ve manuel müdahale olmadan kurtulmasını ister. Hangi kombinasyon HER İKİ gereksinimi de ele alır?

A) Yalnızca Multi-AZ dağıtımını etkinleştirmek; standby örneği raporlama okumalarına hizmet edebilir
B) Yalnızca read replica'lar oluşturmak; birincilin AZ'si arızalandığında bir replica otomatik olarak terfi ettirilir
C) Otomatik failover için Multi-AZ dağıtımını etkinleştirmek ve raporlama okumalarını boşaltmak için read replica'lar eklemek
D) Her iki iş yükünü de karşılamak için daha büyük bir single-AZ örnek sınıfına geçmek

**Soru 22** *(Domain 2 — Task 2.2)*
Bir şirket, Availability Zone'lar arasında RDS yüksek kullanılabilirliği ister, ancak hiçbir trafiğe hizmet etmeyen geleneksel bir Multi-AZ standby örneği için ödeme yapmaya itiraz eder. Hangi RDS dağıtım seçeneği otomatik failover sağlar VE standby kapasitesinin okuma trafiğine hizmet etmesine izin verir?

A) RDS Multi-AZ DB instance dağıtımı (bir standby)
B) Bir reader endpoint ile okunabilir iki standby örneği olan RDS Multi-AZ DB cluster dağıtımı
C) Bir Application Load Balancer ile üç AZ'de RDS read replica'lar
D) Otomatik yedeklemeli RDS Single-AZ

**Soru 23** *(Domain 2 — Task 2.2)*
Amazon Aurora üzerindeki global bir ödeme platformu, birincil Region kullanılamaz hale gelirse ikinci bir AWS Region'a failover yapmalıdır. Uyumluluk ekibi, Aurora Global Database'in Region'lar arasında sıfır veri kaybını (RPO = 0) garanti edip edemeyeceğini sorar. Çözüm mimarı onlara ne söylemelidir?

A) Evet — Aurora Global Database Region'lar arasında senkron olarak çoğaltır, bu yüzden RPO tam olarak 0'dır
B) Hayır — Aurora Global Database, tipik gecikmesi 1 saniyenin altında olan asenkron depolama tabanlı çoğaltma kullanır, bu yüzden Region'lar arası RPO sıfıra yakındır ancak asla tam olarak 0 garanti edilmez
C) Evet — ancak yalnızca ikincil Region'da write forwarding etkinleştirilmişse
D) Hayır — Aurora Global Database 5 dakikalık bir programla çoğaltır, bu da 5 dakikalık bir RPO verir

**Soru 24** *(Domain 2 — Task 2.2)*
Bir şirketin felaket kurtarma planı şöyle der: "Bölgesel bir kesintiden sonra, sipariş sistemi 4 saat içinde tekrar çalışıyor olmalı ve 15 dakikadan fazla işlem kaybedilmemeli." Hangi ifade bu sayıları DR metriklerine doğru biçimde eşler?

A) RTO = 15 dakika; RPO = 4 saat
B) RTO = 4 saat; RPO = 15 dakika
C) MTBF = 4 saat; MTTR = 15 dakika
D) RPO = 4 saat; SLA = 15 dakika

**Soru 25** *(Domain 2 — Task 2.2)*
Bir sigorta şirketi, kritik bir uygulama için bir DR stratejisine ihtiyaç duyar. Gereksinimler: veri sürekli olarak DR Region'a çoğaltılmalıdır; çekirdek altyapı (veritabanı, AMI'ler, minimal yığın) DR Region'da zaten var olmalı ancak maliyeti kontrol etmek için bir felakete kadar hesaplama kapalı kalmalıdır; onlarca dakikalık bir RTO kabul edilebilir. Hangi DR stratejisi uyuyor?

A) Backup and restore
B) Pilot light — çekirdek öğeler DR Region'da tedarik edilmiş ve veri canlı çoğaltılmış, ancak failover'a kadar hesaplama kapalı
C) Warm standby — iş yükünün küçültülmüş ancak her zaman çalışan tam bir kopyası
D) Multi-site active/active

**Soru 26** *(Domain 2 — Task 2.2)*
AWS felaket kurtarma stratejileri hakkındaki hangi İKİ ifade doğrudur? (İKİ tane seçin.)

A) Backup and restore, kaynakların kurtarma Region'ında önceden tedarik edilmiş ve çalışıyor olmasını gerektirir
B) Backup and restore, dört strateji arasında en düşük RTO'yu sunar
C) Multi-site active/active, birden fazla Region'dan trafiğe aynı anda hizmet eder ve en yüksek maliyetle sıfıra yakın bir RTO sunar
D) Pilot light, uygulamanın tam kapasiteli bir kopyasını kurtarma Region'ında üretim trafiğine hizmet ederek tutar
E) Warm standby, iş yükünün küçültülmüş ancak tamamen işlevsel bir kopyasını kurtarma Region'ında her zaman çalışır halde tutar

**Soru 27** *(Domain 2 — Task 2.1)*
Bir görüntü işleme uygulaması, bir Amazon SQS standard kuyruğundan mesajları okur. Bir görüntüyü işlemek 3 dakikaya kadar sürer, ancak kuyruğun görünürlük zaman aşımı (visibility timeout) 30 saniye olarak ayarlanmıştır. Kullanıcılar bazı görüntülerin iki veya üç kez işlendiğini bildiriyor. EN OLASI neden ve düzeltme nedir?

A) Kuyruk FIFO'dur; standard kuyruğa geçin
B) Görünürlük zaman aşımı, işleme bitmeden önce sona eriyor, mesajı diğer tüketicilere tekrar görünür kılıyor; görünürlük zaman aşımını işleme süresinin ötesine çıkarın
C) Long polling devre dışı; 20 saniyelik bir ReceiveMessageWaitTime etkinleştirin
D) Mesaj saklama süresi çok kısa; onu 14 güne çıkarın

**Soru 28** *(Domain 2 — Task 2.1)*
Bir faturalama uygulaması, bir SQS kuyruğundan mesajları tüketir. Bazen hatalı biçimlendirilmiş bir mesaj, tüketicinin tekrar tekrar başarısız olmasına neden olur ve mesaj kuyrukta sonsuza kadar döner, hesaplamayı boşa harcar. Mimar neyi yapılandırmalıdır?

A) maxReceiveCount redrive politikası olan bir dead-letter queue, böylece tekrar tekrar başarısız olan mesajlar analiz için kenara taşınır
B) Kötü mesajın daha hızlı yeniden denenmesi için daha kısa bir görünürlük zaman aşımı
C) Hatalı biçimlendirilmiş mesajları otomatik olarak atan FIFO sıralaması
D) Kötü mesajların hızlı sona ermesi için 1 dakikalık bir mesaj saklama süresi

**Soru 29** *(Domain 2 — Task 2.1)*
Bir aracı kurum, müşteri hesabı başına ticaret olaylarını işler. Aynı hesaba ait olaylar kesinlikle sıralı ve tam olarak bir kez işlenmelidir, ancak farklı hesaplara ait olaylar verim için paralel işlenebilir. Hangi çözüm bu gereksinimleri karşılar?

A) Tek tüketici iş parçacığı (consumer thread) olan bir SQS standard kuyruğu
B) Müşteri hesabı kimliğini MessageGroupId olarak kullanan bir SQS FIFO kuyruğu, bu her grup içinde sıralamayı korurken gruplar arasında paralelliğe izin verir
C) Hesap kimliğine göre mesaj filtrelemeli bir SNS standard topic'i
D) Tüm müşteriler için tek bir MessageGroupId olan bir SQS FIFO kuyruğu

**Soru 30** *(Domain 2 — Task 2.1)*
Bir sipariş verildiğinde, bir e-ticaret platformu aynı anda üç bağımsız süreci tetiklemelidir: fatura oluşturma, depo karşılama (fulfillment) ve analitik alımı. Her süreç her sipariş olayını almalı, onu dayanıklı şekilde tamponlamalı (buffer) ve kendi hızında işlemelidir. Hangi mimari bu gereksinimleri karşılar?

A) Aynı kuyruğu yoklayan (polling) üç tüketicisi olan bir SQS kuyruğu
B) Süreç başına bir tane abone olunan üç SQS kuyruğuna fan-out yapan bir SNS topic'i
C) Step Functions tarafından sıralı olarak çağrılan üç Lambda fonksiyonu
D) Üç e-posta aboneliği olan bir SNS topic'i

**Soru 31** *(Domain 2 — Task 2.1)*
Bir flash satış sırasında, API Gateway tarafından tetiklenen bir Lambda fonksiyonu 429 kısıtlama (throttling) hataları döndürmeye başlar ve aynı hesaptaki diğer kritik Lambda fonksiyonları da kısıtlanmaya başlar. Hesap, varsayılan eş zamanlılık kotasındadır. Kritik fonksiyonları satış fonksiyonu tarafından aç bırakılmaktan hangi eylem korur?

A) Satış fonksiyonunun zaman aşımını 3 saniyeden 15 dakikalık maksimuma çıkarmak
B) Kritik fonksiyonlarda reserved concurrency yapılandırmak (ve isteğe bağlı olarak satış fonksiyonunu sınırlamak), onlara hesap havuzundan ayrılmış eş zamanlılık garanti etmek
C) Satış fonksiyonunda, hesap genelindeki kotayı yükselten provisioned concurrency'yi etkinleştirmek
D) Kritik fonksiyonları 10 GB bellek yapılandırmasına taşımak

**Soru 32** *(Domain 2 — Task 2.1)*
Bir medya şirketi, devam etmeden önce içeriğin harici bir araç aracılığıyla bir insan moderatör tarafından onaylanmasını 2 güne kadar bekleyen bir adımı olan bir video yayınlama iş akışına sahiptir. İş akışı denetlenebilir olmalı, günlerce çalışmalı ve moderatör yanıt verdiğinde duraklatıldığı yerden tam olarak devam etmelidir. Hangi çözüm EN İYİ uyuyor?

A) Bir Wait state'i olan bir Express Step Functions iş akışı
B) Callback kalıbını kullanan bir Standard Step Functions iş akışı: moderasyon sistemine bir görev token'ı (waitForTaskToken) gönderilir ve SendTaskSuccess çağrıldığında iş akışı devam eder
C) Moderatör onaylayana kadar uyuyan bir Lambda fonksiyonu
D) 2 günlük planlanmış gecikmeli bir EventBridge kuralı

**Soru 33** *(Domain 2 — Task 2.1)*
Bir şirket, saniyede yaklaşık 90.000 kısa iş akışı yürütmesi gerçekleştiren ve her biri 5 saniyenin altında tamamlanan yüksek hacimli bir IoT alım boru hattı çalıştırır. Tam-bir-kez (exactly-once) yürütme semantiği gerekli değildir, ancak maliyet en aza indirilmelidir. Ayrıca, aylık bir finansal mutabakat (reconciliation) iş akışı 12 saat çalışır ve tam yürütme geçmişiyle tam-bir-kez yürütme gerektirir. Hangi Step Functions iş akışı tipleri kullanılmalıdır?

A) IoT boru hattı için Express iş akışları; mutabakat için Standard iş akışları
B) Her ikisi için Standard iş akışları
C) Express bir yıla kadar yürütmeyi desteklediği için her ikisi için Express iş akışları
D) IoT boru hattı için Standard iş akışları; mutabakat için Express iş akışları

**Soru 34** *(Domain 2 — Task 2.2)*
Bir şirket, birincil web uygulamasını us-east-1'deki bir ALB'de ve pasif bir kurtarma kopyasını us-west-2'de barındırır. Şirket, Route 53'ün tüm trafiği us-east-1'e göndermesini ve yalnızca birincil endpoint sağlıksız hale geldiğinde kullanıcıları otomatik olarak us-west-2'ye yönlendirmesini ister. Hangi Route 53 yapılandırması bu gereksinimi karşılar?

A) 50/50 ağırlıklarla weighted routing
B) Birincil kayıt üzerinde bir sağlık kontrolü ve ikincil olarak ayarlanmış us-west-2 kaydıyla failover routing
C) İki Region arasında latency-based routing
D) us-west-2'ye işaret eden bir varsayılan kayıtla geolocation routing

**Soru 35** *(Domain 2 — Task 2.2)*
Bir Auto Scaling group, üç Availability Zone'da bir Application Load Balancer arkasında EC2 web sunucuları çalıştırır. Web sunucu süreci çöktüğü için ALB bazı örnekleri sağlıksız olarak işaretler, ancak Auto Scaling group, EC2 örneklerinin kendileri hâlâ status check'leri geçtiği için onları asla değiştirmez. Çözüm mimarı neyi değiştirmelidir?

A) Örneklerde ayrıntılı CloudWatch izlemeyi etkinleştirmek
B) Auto Scaling group'u, EC2 status check'lerine ek olarak ELB sağlık kontrollerini kullanacak şekilde yapılandırmak, böylece ALB hedef sağlığında başarısız olan örnekler sonlandırılır ve değiştirilir
C) ASG sağlık kontrolü ek süresini (grace period) artırmak
D) ALB'yi bir Network Load Balancer'a geçirmek

**Soru 36** *(Domain 2 — Task 2.1)*
Bir ticaret firması, milyonlarca isteği saniyede ultra düşük gecikmeyle işlemesi ve Availability Zone başına statik bir IP adresi sunması gereken özel bir TCP protokolü için bir yük dengeleyiciye ihtiyaç duyar. Firma hangi yük dengeleyiciyi seçmelidir?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Soru 37** *(Domain 2 — Task 2.2)*
AWS'de dayanıklı depolama oluşturma hakkındaki hangi İKİ ifade doğrudur? (İKİ tane seçin.)

A) S3 Cross-Region Replication, çoğaltma yapılandırılmadan önce var olan tüm nesneleri ek bir eylem olmadan geriye dönük olarak kopyalar
B) Amazon EFS Standard depolama sınıfları, verileri birden fazla Availability Zone'da yedekli olarak saklar ve farklı AZ'lerdeki örnekler tarafından eş zamanlı olarak bağlanabilir (mount)
C) S3 Cross-Region Replication, hem kaynak hem de hedef bucket'larda sürümlemenin etkinleştirilmesini gerektirir
D) Amazon EFS volume'ları, EBS gibi aynı anda yalnızca bir EC2 örneğine bağlanabilir
E) S3 sürümlemeyi etkinleştirmek, nesneleri otomatik olarak başka bir Region'a çoğaltır

---

## Bölüm 3 — Yüksek Performanslı Mimariler Tasarlama (Sorular 38–53)

**Soru 38** *(Domain 3 — Task 3.1)*
Bir medya analitiği şirketi, bir gp3 EBS volume kullanarak Amazon RDS'te bir PostgreSQL veritabanı çalıştırır. Yeni bir raporlama iş yükü, alt milisaniye gecikmeyle sürekli 50.000 IOPS ve %99,999'luk bir dayanıklılık garantisi gerektirir. Volume bunu burst olmadan tutarlı şekilde desteklemelidir. Bir çözüm mimarı hangi EBS volume tipini önermelidir?

A) Maksimum IOPS ile tedarik edilmiş gp3
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) 16 TiB volume boyutuyla gp2

**Soru 39** *(Domain 3 — Task 3.1)*
Bir genomik araştırma firması, 500 EC2 örneğinden oluşan Linux tabanlı bir yüksek performanslı hesaplama (HPC) kümesi için paylaşılan dosya depolamasına ihtiyaç duyar. İş yükü, alt milisaniye gecikmeler ve yüzlerce GB/s toplam verim gerektirir ve girdi veri kümeleri Amazon S3'te hazırlanmıştır. Hangi depolama hizmeti bu gereksinimleri en iyi karşılar?

A) Max I/O performans modunda Amazon EFS
B) SSD depolamalı Amazon FSx for Windows File Server
C) S3 bucket'ına bağlı Amazon FSx for Lustre
D) Her örnekte Mountpoint aracılığıyla erişilen Amazon S3

**Soru 40** *(Domain 3 — Task 3.1)*
Bir şirket, SMB dosya paylaşımlarına ve Active Directory ile entegre erişim kontrol listelerine dayanan bir şirket içi Windows uygulamasını taşıyor. Uygulama, iki Availability Zone'daki EC2 Windows örneklerinde çalışacak ve mevcut NTFS izinlerini korumalıdır. Çözüm mimarı hangi AWS depolama hizmetini seçmelidir?

A) POSIX izinleriyle Amazon EFS
B) Multi-AZ dağıtım modunda Amazon FSx for Windows File Server
C) AD gruplarına eşlenmiş bucket policy'lerle Amazon S3
D) Kalıcı (persistent) depolamayla Amazon FSx for Lustre

**Soru 41** *(Domain 3 — Task 3.1)*
Singapur'daki bir video prodüksiyon şirketi, dünya çapındaki ofislerden us-east-1'deki bir S3 bucket'ına 40 GB'lık ham görüntü dosyaları yükler. Yüklemeler herkese açık internet üzerinden sık sık yarıda başarısız olur, bu da tam yeniden başlatmalara zorlar ve genel transfer süreleri yavaştır. Bir çözüm mimarı hangi eylem kombinasyonunu önermelidir? (İKİ tane seçin.)

A) Yazma verimini iyileştirmek için bucket'ı S3 One Zone-IA'ya dönüştürmek
B) Bucket'ın önüne her bölgede bir Application Load Balancer koymak
C) ap-southeast-1'deki bir bucket'a S3 Cross-Region Replication'ı etkinleştirmek
D) Bucket'ta S3 Transfer Acceleration'ı etkinleştirmek ve hızlandırılmış endpoint üzerinden yüklemek
E) Büyük dosyalar için multipart upload kullanmak

**Soru 42** *(Domain 3 — Task 3.1)*
Gerçek zamanlı bir teklif (bidding) platformu, geçici çalışma (scratch) verileri için kesinlikle en düşük depolama gecikmesine ihtiyaç duyan bir NoSQL iş yükünü EC2'de çalıştırır. Veri başlangıçta yeniden oluşturulur ve örnek durdurma veya sonlandırmadan sağ çıkması gerekmez. Hangi depolama seçeneği bu kullanım durumu için en yüksek performansı sağlar?

A) 64.000 tedarik edilmiş IOPS'li io2 EBS volume
B) Depolama optimize edilmiş bir örnekte instance store (NVMe SSD) volume'ları
C) General Purpose modunda Amazon EFS
D) Maksimum tedarik edilmiş verimli gp3 EBS volume

**Soru 43** *(Domain 3 — Task 3.3)*
Bir oyun şirketi, oyuncu oturum verilerini partition key'i `game_id` olan bir DynamoDB tablosunda saklar. Yalnızca 12 popüler oyun vardır ve tablo, genel tüketilen kapasite tedarik edilen kapasitenin çok altındayken birkaç partition'da kısıtlama (throttling) yaşar. Bir çözüm mimarı neyi önermelidir?

A) Tabloyu otomatik ölçeklemeli provisioned kapasiteye geçirmek
B) game_id ve player_id'nin bir bileşimi gibi yüksek kardinaliteli bir partition key kullanmak
C) player_id üzerinde bir local secondary index oluşturmak
D) Yazmaları partition'lara yaymak için DynamoDB Streams'i etkinleştirmek

**Soru 44** *(Domain 3 — Task 3.3)*
Bir e-ticaret sitesi, ürün kataloğu verilerini DynamoDB'de saklar. Okuma trafiği aşırı okuma ağırlıklıdır ve aynı öğeler günde milyonlarca kez istenir; ekip, uygulamanın DynamoDB API çağrılarını yeniden yazmadan mikrosaniye okuma gecikmesine ihtiyaç duyar. Çözüm mimarı neyi önermelidir?

A) Amazon ElastiCache for Redis dağıtmak ve uygulamayı önce önbelleği kontrol edecek şekilde değiştirmek
B) Tablonun önüne DynamoDB Accelerator (DAX) eklemek
C) Okumaları dağıtmak için bir global secondary index oluşturmak
D) İkinci bir bölgede DynamoDB Global Tables'ı etkinleştirmek

**Soru 45** *(Domain 3 — Task 3.3)*
Bir lojistik şirketinin üretimde bir DynamoDB tablosu vardır ve yeni bir sorgu kalıbına ihtiyaç duyar: sevkiyatları `carrier_id`'ye göre sorgulama ve `delivery_date`'e göre sıralama, yeni analitik sorgularının ana uygulamayı etkilememesi için kendi tedarik edilmiş verimine sahip olacak şekilde. Tablo zaten var ve canlı trafiğe sahip. Hangi çözüm bu gereksinimleri karşılar?

A) carrier_id'yi sort key olarak kullanan bir local secondary index oluşturmak
B) carrier_id'yi partition key ve delivery_date'i sort key olarak kullanan bir global secondary index oluşturmak
C) Tabloyu carrier_id ve delivery_date'in bileşik birincil anahtarıyla yeniden oluşturmak
D) Bir DynamoDB Stream'i etkinleştirmek ve stream'i carrier_id'ye göre sorgulamak

**Soru 46** *(Domain 3 — Task 3.3)*
Bir oturum yönetimi hizmeti, kullanıcı oturumlarını DynamoDB'de saklar. Oturumlar 24 saat sonra kullanışsız hale gelir ve ekip, süresi dolan öğelerin ek bir maliyet olmadan otomatik olarak kaldırılmasını ister. Çözüm mimarı neyi uygulamalıdır?

A) Tabloyu saatte bir tarayan ve eski öğeleri silen planlanmış bir Lambda fonksiyonu
B) Her öğede bir son kullanma zaman damgası özniteliğiyle DynamoDB Time to Live (TTL)
C) DynamoDB tablosunda bir yaşam döngüsü politikası
D) 24 saatten eski öğeleri düşürmek için bir filtreli DynamoDB Streams

**Soru 47** *(Domain 3 — Task 3.3)*
Bir sunucusuz uygulama, bir Amazon RDS for MySQL veritabanına bağlanan Lambda fonksiyonları kullanır. Trafik artışları sırasında yüzlerce eş zamanlı Lambda çağrısı, veritabanının bağlantı sınırını tüketerek hatalara neden olur. En az uygulama değişikliğiyle bunu hangi çözüm ele alır?

A) max_connections'ı yükseltmek için RDS örnek boyutunu artırmak
B) Lambda fonksiyonları ile veritabanı arasına Amazon RDS Proxy yerleştirmek
C) Veritabanını DynamoDB'ye taşımak
D) Lambda reserved concurrency'yi 10 olarak yapılandırmak

**Soru 48** *(Domain 3 — Task 3.3)*
Bir finansal haber sitesi Amazon Aurora MySQL kullanır. Okuma trafiği piyasa saatlerinde 20 kat artar ve birincil örnek, SELECT sorgularına hizmet ederken CPU'ya bağımlıdır (CPU-bound). Yazmalar mütevazıdır. Okumaları ölçeklemenin EN operasyonel olarak verimli yolu nedir?

A) Aurora Replica'lar eklemek ve okuma trafiğini otomatik ölçeklemeli küme reader endpoint'ine yönlendirmek
B) Bir Multi-AZ standby oluşturmak ve okumaları standby'a göndermek
C) Veritabanını birden fazla Aurora kümesine bölmek (shard)
D) Okumaları boşaltmak için Aurora Backtrack'i etkinleştirmek

**Soru 49** *(Domain 3 — Task 3.4)*
Çok oyunculu bir oyun şirketi, iki AWS Region'daki Network Load Balancer'larda UDP protokolünü kullanan gecikmeye duyarlı bir uygulama çalıştırır. Dünya çapındaki oyuncular, izin listesine alma (allow-listing) için statik IP adreslerine ve hızlı bölgesel failover'a ihtiyaç duyar. Çözüm mimarı hangi hizmeti seçmelidir?

A) İki özel origin'li Amazon CloudFront
B) Her iki bölgede endpoint group'ları olan AWS Global Accelerator
C) Latency-based routing'li Amazon Route 53
D) Cross-zone load balancing'li bir Application Load Balancer

**Soru 50** *(Domain 3 — Task 3.4)*
Bir yayın (streaming) şirketi, içerik lisanslama kurallarına uymak zorundadır: Almanya'daki kullanıcılar her zaman eu-central-1 dağıtımından, Fransa'daki kullanıcılar ise eu-west-3 dağıtımından, hangi endpoint daha düşük gecikme sunarsa sunsun, hizmet almalıdır. Hangi Route 53 yönlendirme politikası kullanılmalıdır?

A) Latency-based routing
B) Geolocation routing
C) eu-central-1 üzerinde pozitif bias'lı geoproximity routing
D) 50/50 ağırlıklarla weighted routing

**Soru 51** *(Domain 3 — Task 3.2)*
Bir çözüm mimarı, MPI kullanan ve 32 EC2 örneği arasında mümkün olan en düşük ağ gecikmesini ve en yüksek saniyedeki paket performansını gerektiren sıkı bağlı (tightly coupled) bir HPC iş yükü dağıtıyor. Hangi yerleşim stratejisi kullanılmalıdır?

A) Üç Availability Zone'a yayılan spread placement group
B) 7 partition'lı partition placement group
C) Tek bir Availability Zone'da cluster placement group
D) Örnekleri gelişmiş ağ (enhanced networking) ile ayrı alt ağlarda başlatmak

**Soru 52** *(Domain 3 — Task 3.5)*
Bir IoT şirketi, analitik için neredeyse gerçek zamanlı olarak Amazon S3'e teslim edilmesi gereken tıklama akışı (clickstream) verisi alır. Ekip; yazılacak tüketici uygulaması olmayan, shard yönetimi olmayan ve yerleşik kayıt tamponlaması (buffering) ile Parquet'e format dönüştürme içeren, tamamen yönetilen bir çözüm ister. Hangi hizmeti kullanmalıdırlar?

A) Bir Lambda tüketicisiyle Amazon Kinesis Data Streams
B) Bir S3 hedefiyle Amazon Data Firehose (eski adıyla Kinesis Data Firehose)
C) Bir EC2 yoklayıcı (poller) filosuyla Amazon SQS
D) Özel bir Kafka Connect sink ile Amazon MSK

**Soru 53** *(Domain 3 — Task 3.5)*
Bir şirket, uygulama günlüklerini Amazon S3'te sıkıştırılmış JSON dosyaları olarak saklar ve analistlerin sunucu tedarik etmeden veya veriyi bir veritabanına yüklemeden bunlara karşı ad hoc SQL sorguları çalıştırmasını ister. Şema otomatik olarak keşfedilip kataloglanmalıdır. Çözüm mimarı hangi kombinasyonu önermelidir?

A) COPY komutları ve planlanmış yenilemelerle Amazon Redshift
B) Data Catalog'u doldurmak için AWS Glue crawler'ları ve SQL sorguları için Amazon Athena
C) Uzun süreli çalışan bir Presto kümesiyle Amazon EMR
D) aws_s3 uzantısıyla Amazon RDS for PostgreSQL

---

## Bölüm 4 — Maliyet Optimize Edilmiş Mimariler Tasarlama (Sorular 54–65)

**Soru 54** *(Domain 4 — Task 4.2)*
Bir araştırma enstitüsü, EC2'de yaklaşık 90 dakika süren, ilerlemeyi her 5 dakikada bir Amazon S3'e kontrol noktası (checkpoint) olarak kaydeden ve herhangi bir zamanda son kontrol noktasından yeniden başlatılabilen gecelik toplu simülasyonlar çalıştırır. Enstitü mümkün olan en düşük hesaplama maliyetini ister. Çözüm mimarı hangi satın alma seçeneğini önermelidir?

A) Tek bir AZ'de On-Demand Instance'lar
B) 3 yıllık vadeyle Standard Reserved Instance'lar
C) Birden fazla örnek tipi ve AZ'de çeşitlendirilmiş bir Spot Fleet kullanan Spot Instance'lar
D) Toplu iş yükünün zirvesine göre boyutlandırılmış bir Compute Savings Plan

**Soru 55** *(Domain 4 — Task 4.2)*
Bir SaaS şirketinin istikrarlı bir temel hesaplama harcaması var, ancak modernleştikçe önümüzdeki üç yıl içinde iş yüklerini EC2, AWS Fargate ve AWS Lambda arasında taşımayı bekliyor. Üç hesaplama hizmetinin ve tüm bölgelerin tamamına otomatik olarak uygulanan taahhüt tabanlı bir indirim istiyor. Çözüm mimarı hangi seçeneği önermelidir?

A) EC2 Instance Savings Plan
B) Standard Reserved Instance'lar
C) Compute Savings Plan
D) Convertible Reserved Instance'lar

**Soru 56** *(Domain 4 — Task 4.2)*
Bir şirket, Amazon RDS ve Amazon EC2 için 3 yıllık Standard Reserved Instance'lar satın aldı. Bir yeniden mimari sonrasında, artık ne birine ne de diğerine ihtiyaç duyuyor. Finans ekibi, maliyetleri telafi etmek için hangi rezervasyonların satılabileceğini soruyor. Çözüm mimarı onlara ne söylemelidir?

A) Hem EC2 hem de RDS Reserved Instance'ları Reserved Instance Marketplace'te satılabilir
B) Yalnızca EC2 Reserved Instance'ları Reserved Instance Marketplace'te satılabilir; RDS RI'ları yeniden satılamaz
C) Yalnızca RDS Reserved Instance'ları satılabilir, çünkü veritabanı rezervasyonları devredilebilir
D) Hiçbiri satılamaz; Reserved Instance'lar tüm durumlarda iadesiz ve devredilemezdir

**Soru 57** *(Domain 4 — Task 4.2)*
Bir geliştirme ekibi, Amazon ECS üzerinde EC2 Spot kapasitesiyle konteynerli, hata toleranslı veri işleme çalıştırır. İşçilerin geri alımdan (reclamation) önce zarif şekilde boşaltma (drain) ve kontrol noktası kaydetme yapmasına ihtiyaçları var. AWS, bir Spot Instance kesintiye uğratılmadan önce ne kadar önceden uyarı sağlar?

A) Hiçbir uyarı sağlanmaz
B) 2 dakikalık bir kesinti bildirimi
C) 15 dakikalık bir kesinti bildirimi
D) 24 saatlik bir yeniden dengeleme (rebalance) penceresi

**Soru 58** *(Domain 4 — Task 4.1)*
Bir sağlık arşivi, nadiren erişilen ancak mahkeme celbi geldiğinde 5 dakika içinde alınabilmesi gereken uyumluluk kayıtlarını Amazon S3'te saklar. Kayıtlar 7 yıl tutulur ve depolama maliyeti en aza indirilmelidir. Hangi depolama sınıfı bu gereksinimleri karşılar?

A) Standard retrieval ile S3 Glacier Deep Archive
B) Gerektiğinde Expedited retrieval'larla S3 Glacier Flexible Retrieval
C) Bulk retrieval'larla S3 Glacier Flexible Retrieval
D) S3 Standard-IA

**Soru 59** *(Domain 4 — Task 4.1)*
Bir fotoğraf paylaşım girişimi, nadiren erişilen ve kolayca yeniden üretilebilen küçük resim (thumbnail) görüntüleri saklar. Ekip, en düşük maliyetli seyrek-erişim seçeneğini ister ve tek bir Availability Zone kaybının küçük resimleri orijinallerinden yeniden oluşturmayı gerektirebileceğini kabul eder. Hangi depolama sınıfı kullanılmalıdır?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Soru 60** *(Domain 4 — Task 4.1)*
Bir şirketin, erişim kalıpları bilinmeyen ve tahmin edilemez şekilde değişen milyonlarca nesneye sahip bir S3 bucket'ı vardır. Bir çözüm mimarı S3 Intelligent-Tiering'i değerlendiriyor. Intelligent-Tiering hakkındaki hangi İKİ ifade doğrudur? (İKİ tane seçin.)

A) İzlediği nesneler için küçük bir nesne başına izleme ve otomasyon ücreti alır
B) Bir nesne her Frequent Access katmanına geri taşındığında retrieval ücreti alır
C) 128 KB'tan küçük nesneler izlenmez veya otomatik katmanlanmaz ve Frequent Access katmanı oranıyla faturalandırılır
D) Nesneleri otomatik olarak ikinci bir bölgeye çoğaltır
E) Her nesne için 90 günlük minimum depolama süresi gerektirir

**Soru 61** *(Domain 4 — Task 4.1)*
Bir analitik ekibi, bir S3 veri gölü bucket'ına yapılan büyük multipart upload'ları sıklıkla iptal ediyor ve AWS Cost Explorer, bucket'ın görünür nesne sayısı sabit olmasına rağmen depolama ücretlerinin arttığını gösteriyor. EN uygun maliyetli düzeltme nedir?

A) Yetim (orphaned) parçaları izlemek için S3 Versioning'i etkinleştirmek
B) Belirli bir gün sayısından sonra tamamlanmamış multipart upload'ları iptal eden bir yaşam döngüsü kuralı eklemek
C) Bucket'ı S3 One Zone-IA'ya taşımak
D) Yüklemeleri daha hızlı bitirmek için S3 Transfer Acceleration'ı açmak

**Soru 62** *(Domain 4 — Task 4.1)*
Bir şirketin EC2 filosu, yalnızca temel IOPS elde etmek için büyük boyutlandırılmış yüzlerce gp2 EBS volume kullanır. Kullanım incelemeleri, IOPS'lerin gerekli olduğunu ancak kapasitenin çoğunun gerekli olmadığını gösteriyor. Çözüm mimarı, performansı kaybetmeden depolama maliyetini azaltmak için ne yapmalıdır?

A) Volume'ları io2'ye taşımak ve aynı IOPS'yi tedarik etmek
B) Volume'ları gp3'e taşımak, kapasiteyi doğru boyutlandırmak ve IOPS'yi bağımsız olarak tedarik etmek
C) Volume'ları st1 throughput-optimized HDD'ye dönüştürmek
D) Volume'ların günlük anlık görüntüsünü almak ve orijinalleri silmek

**Soru 63** *(Domain 4 — Task 4.4)*
Özel alt ağlardaki bir veri boru hattı, bir NAT gateway aracılığıyla aynı bölgedeki Amazon S3'e EC2 örneklerinden ayda 60 TB aktarır ve büyük veri işleme ücretleri oluşturur. EN uygun maliyetli değişiklik nedir?

A) NAT gateway'i büyük bir EC2 örneğindeki bir NAT instance ile değiştirmek
B) S3 için bir gateway VPC endpoint oluşturmak ve trafiği onun üzerinden yönlendirmek
C) S3 için bir interface VPC endpoint (PrivateLink) oluşturmak
D) EC2 örneklerini herkese açık IPv4 adresleriyle genel alt ağlara taşımak

**Soru 64** *(Domain 4 — Task 4.4)*
Bir girişimin aylık faturası, yalnızca VPC içindeki diğer AWS hizmetlerini çağıran düzinelerce EC2 örneğindeki kullanımdaki herkese açık IPv4 adresleri için beklenmedik ücretler gösterir. Finans ekibi ayrıca gelecek ayın genel harcaması bir eşiği aşmadan önce uyarılar istiyor. Çözüm mimarı hangi eylem kombinasyonunu almalıdır? (İKİ tane seçin.)

A) Her örnekte herkese açık IPv4'ü, bağlıyken her zaman ücretsiz olan Elastic IP'lerle değiştirmek
B) Herkese açık IPv4 adreslerini kaldırmak ve özel bağlantı (gerektiğinde VPC endpoint'leri/NAT) kullanmak, çünkü AWS kullanımdaki herkese açık IPv4 adreslerini ücretlendirir
C) Eşiğin üzerindeki harcamayı engellemek için AWS Compute Optimizer'ı kullanmak
D) Aylık harcamayı sınırlamak için AWS Shield Advanced'i etkinleştirmek
E) Bir uyarı eşiği ve e-posta bildirimiyle bir AWS Budgets maliyet bütçesi oluşturmak

**Soru 65** *(Domain 4 — Task 4.3)*
Bir geliştirme ortamı, geceleri ve hafta sonları boşta olan ancak geliştiriciler bağlandığında manuel müdahale veya örnek yeniden boyutlandırma olmadan otomatik olarak uyanması gereken bir Amazon Aurora PostgreSQL kümesi kullanır. Boştayken hesaplama için maliyet sıfıra yakın düşmelidir. Hangi çözüm bu gereksinimleri karşılar?

A) Boştayken otomatik duraklayacak (auto-pause) şekilde minimum 0 ACU kapasiteyle yapılandırılmış Aurora Serverless v2
B) Her gece planlanmış bir Lambda fonksiyonu tarafından durdurulan tedarik edilmiş (provisioned) bir Aurora kümesi
C) Headless ikincil kümesi olan bir Aurora global database
D) Geceleri içeri ölçeklenen (scaled in) iki reader örneğiyle tedarik edilmiş Aurora

---

## Cevap Anahtarı

### Bölüm 1 — Sorular 1–20

**1. Cevap: B** — SCP'ler organizasyonun yönetim hesabına asla uygulanmaz, bu yüzden onun principal'ları Region kısıtlamalarından etkilenmez. *Diğerleri neden değil:* A — SCP'ler iç içe OU'lar üzerinden miras yoluyla geçer; C — IAM Allow'ları üye hesaplarda bir SCP Deny'ı geçersiz kılamaz; D — SCP'ler, ekleme noktasının altındaki tüm mevcut ve gelecekteki hesaplara hemen uygulanır.

**2. Cevap: C** — Rol oluşturma eylemleri üzerinde bir koşul olarak zorlanan bir permissions boundary, geliştiricilerin oluşturduğu herhangi bir rolün maksimum izinlerini sınırlar, self-servisi korurken ayrıcalık yükseltmeyi önler. *Diğerleri neden değil:* A — manuel inceleme operasyonel ek yük ekler ve self-servisi kaldırır; B — iam:CreateRole'u reddetmek meşru iş akışını engeller; D — CloudTrail uyarıları önleyici değil, tespit edicidir.

**3. Cevap: B** — Güven politikasının koşulunda doğrulanan, müşteri tanımlı bir ExternalId, SaaS sağlayıcısının rolü yalnızca doğru müşteri adına üstlenmesini sağlar ve confused deputy problemini azaltır. *Diğerleri neden değil:* A — MFA otomatik hizmetten-hizmete üstlenme için pratik değildir ve vekil karışıklığını ele almaz; C — bir ARN'yi (gizli olmayan) şifrelemek hiçbir şey çözmez; D — uzun ömürlü IAM kullanıcı anahtarları rollerden daha az güvenlidir.

**4. Cevap: B** — IAM Identity Center, Entra ID ile bir kez federe olur ve tek bir erişim portalı aracılığıyla tüm organizasyon hesaplarında permission set'leri merkezi olarak atar. *Diğerleri neden değil:* A — hesap başına IAM kullanıcıları tam da kaçınılması gereken ek yüktür; C — Cognito uygulama (müşteri) kimlikleri içindir, AWS hesaplarına iş gücü erişimi için değil; D — hesap başına manuel SAML kurulumu işe yarar ama çok daha yüksek operasyonel ek yüke sahiptir.

**5. Cevap: A** — User pool'lar kimlik doğrulamayı (e-posta/sosyal oturum açma) yönetir; identity pool'lar elde edilen token'ları, S3'e erişmek için IAM rolleriyle kapsamlanmış geçici AWS kimlik bilgileriyle değiştirir. *Diğerleri neden değil:* B — iki hizmetin amaçlarını tersine çevirir; C — IAM Identity Center iş gücü kullanıcıları içindir, uygulama müşterileri için değil; D — user pool token'ları (JWT'ler) kendi başlarına AWS hizmet erişimi vermez.

**6. Cevap: B** — Bir customer managed key, key policy, kullanım günlüğü ve devre dışı bırakma üzerinde tam kontrol verir ve otomatik rotasyonu destekler (varsayılan olarak yıllık). *Diğerleri neden değil:* A — AWS managed key'ler key policy'yi düzenlemenize veya anahtarı devre dışı bırakmanıza izin vermez; C — AWS owned key'ler müşteriye tamamen görünmezdir; D — içe aktarılmış (BYOK) anahtar materyali otomatik rotasyonu desteklemez.

**7. Cevap: B** — Zarf şifreleme: KMS bir data key üretir; veri, atılan düz metin data key ile yerel olarak şifrelenir, bu sırada data key'in KMS ile şifrelenmiş kopyası şifreli metinle birlikte saklanır. *Diğerleri neden değil:* A ve C — KMS büyük yükleri asla doğrudan veya akış yoluyla şifrelemez; D — sabit kodlanmış anahtarlar bir anti-kalıptır ve zarf şifreleme değildir.

**8. Cevap: C** — Secrets Manager'ın alternating-users stratejisi iki kimlik bilgisini tutar ve onları sırayla döndürür, böylece önceki kimlik bilgisini kullanan mevcut bağlantılar rotasyon sırasında çalışmaya devam eder. *Diğerleri neden değil:* A — Parameter Store'un yerleşik rotasyonu yoktur; her şeyi kendiniz oluşturursunuz; B — single-user rotasyon eski parolayı hemen geçersiz kılar, bağlantı arızalarını riske atar; D — KMS rotasyonu şifreleme anahtar materyalini döndürür, veritabanı parolalarını değil.

**9. Cevap: C** — SSE-C, müşterinin şifreleme anahtarını her istekle birlikte sağlamasına izin verir; AWS onu işlem için bellekte kullanır ve asla saklamaz. *Diğerleri neden değil:* A — SSE-S3 anahtarları tamamen AWS tarafından yönetilir; B — SSE-KMS anahtarları AWS KMS'te saklanır; D — aws/s3 bir AWS tarafından yönetilen KMS anahtarıdır ve hiç istemci tarafı değildir.

**10. Cevap: B** — Object Lock compliance modu, saklama süresi dolana kadar root dahil herhangi bir kullanıcı tarafından silme veya üzerine yazmayı önler ve Object Lock sürümleme gerektirir. *Diğerleri neden değil:* A — governance modu, s3:BypassGovernanceRetention'a sahip kullanıcılar tarafından atlanabilir; C — bir bucket policy root kullanıcı tarafından değiştirilebilir veya kaldırılabilir; D — yaşam döngüsü süresi dolması, süre içinde silmeyi önlemez.

**11. Cevap: B** — NACL'ler durum bilgisizdir (stateless), bu yüzden istemcilerin geçici kaynak portlarına giden yanıt trafiğine açıkça giden olarak izin verilmelidir. *Diğerleri neden değil:* A — NACL'ler durum bilgisizdir, durum bilgili değil; C — güvenlik grupları durum bilgilidir, bu yüzden dönüş trafiği otomatiktir; D — 0.0.0.0/0 NACL kurallarında tamamen geçerlidir.

**12. Cevap: A, B** — Güvenlik grupları durum bilgilidir (dönüş trafiği otomatik izinli) ve NACL'ler numaralandırılmış kuralları sırayla işler ve Deny'ı destekler. *Diğerleri neden değil:* C — güvenlik grupları yalnızca Allow kurallarını destekler; D — NACL'ler ENI'lere değil alt ağlara eklenir (güvenlik grupları ENI'lere eklenir); E — güvenlik grubu kuralları sıralama olmadan birlikte değerlendirilir.

**13. Cevap: B** — Shield Advanced, CloudFront ve ALB gibi korunan kaynaklar için Shield Response Team, DDoS maliyet koruması ve saldırı görünürlüğü/tanılaması sağlar. *Diğerleri neden değil:* A — Shield Standard otomatiktir ancak SRT erişimi veya maliyet koruması içermez; C — WAF, tüm gereksinim setini değil, katman-7 istek kalıplarını ele alır; D — GuardDuty DDoS koruması değil, tehdit tespitidir.

**14. Cevap: B** — ALB üzerinde SQLi yönetilen kural grubu artı bir hız tabanlı kuralla AWS WAF, her iki saldırı kalıbını da uygulama kodu değişikliği olmadan engeller. *Diğerleri neden değil:* A — yüksek geliştirme çabası; C — Shield Standard L3/L4 sellerini kapsar, SQL injection'ı değil; D — güvenlik grupları istek içeriğini inceleyemez.

**15. Cevap: B** — GuardDuty = günlüklerden ve tehdit istihbaratından tehdit tespiti; Macie = S3'te hassas veri (PII) keşfi; Inspector = EC2, ECR imajları ve Lambda'nın güvenlik açığı (CVE) taraması. *Diğerleri neden değil:* A, C, D — her biri hizmet-amaç eşlemelerinden en az ikisini karıştırır.

**16. Cevap: B** — Gateway endpoint'ler tam olarak S3 ve DynamoDB için vardır, trafiği AWS ağında tutar ve saatlik veya veri işleme ücreti yoktur. *Diğerleri neden değil:* A — NAT gateway herkese açık IP alanı üzerinden yönlendirir ve saat başına/GB başına maliyetlidir; C — interface endpoint'ler saatlik ve veri ücretleri getirir, bu yüzden en düşük maliyet değildir; D — bir internet gateway trafiği herkese açık internet üzerinden gönderir.

**17. Cevap: A** — IMDSv2, tipik SSRF vektörlerinin gerçekleştiremeyeceği bir PUT isteği aracılığıyla alınan bir oturum token'ı gerektirir; HttpTokens=required'ı zorlamak IMDSv1 kimlik bilgisi hırsızlığını engeller. *Diğerleri neden değil:* B — birçok ajan ve SDK meşru olarak IMDS'ye ihtiyaç duyar; C — NACL'ler bir örnek ile kendi metadata endpoint'i arasındaki link-local trafiği etkilemez; D — dosyalardaki statik kimlik bilgileri rol kimlik bilgilerinden çok daha kötüdür.

**18. Cevap: C** — Standard Parameter Store parametreleri ücretsizdir ve düz metin yapılandırma için uygundur; Secrets Manager yalnızca 5 parola için yerleşik rotasyon ekler ve maliyeti en aza indirir. *Diğerleri neden değil:* A — 200 düz yapılandırma değeri için Secrets Manager'ın gizli başına fiyatlandırmasını ödemek savurgandır; B — Parameter Store tek başına parolalar için yerel rotasyona sahip değildir; D — Parameter Store'un yerleşik otomatik rotasyonu yoktur, bu yüzden bu seçenek var olmayan bir yeteneği belirtir.

**19. Cevap: B** — S3 Bucket Keys, S3'ün KMS anahtarından zaman sınırlı bir bucket düzeyinde data key üretmesine izin verir ve SSE-KMS kalırken nesne başına KMS isteklerini (ve maliyeti) önemli ölçüde azaltır. *Diğerleri neden değil:* A — SSE-S3 KMS gereksinimini terk eder; C — rotasyon sıklığı istek başına API hacmini etkilemez; D — içe aktarılmış anahtar materyali istek sayılarını değiştirmez.

**20. Cevap: B, D** — Açık Deny politika değerlendirmesinde her zaman herhangi bir Allow'u yener ve permissions boundary'ler yalnızca izinleri sınırlar (asla vermez). *Diğerleri neden değil:* A — SCP'ler mevcut izinleri sınırlayan korkuluklardır (guardrails); hiçbir şey vermezler; C — kaynak tabanlı politikalar tek başlarına rutin olarak hesaplar arası erişim verir; E — bir eylem hiçbir şey tarafından izin verilmediğinde IAM örtük reddetmeye (implicit deny) varsayılan olur.

### Bölüm 2 — Sorular 21–37

**21. Cevap: C** — Multi-AZ, AZ arızası için otomatik failover sağlar; read replica'lar raporlama okuma trafiğini emer — iki farklı problem için iki özellik. *Diğerleri neden değil:* A — geleneksel bir Multi-AZ standby okumalara hizmet edemez; B — replica terfisi manueldir (veya betiklenir) ve replica'lar tek başına otomatik HA failover'ı sağlamaz; D — daha büyük bir single-AZ örnek, AZ dayanıklılığı konusunda her iki gereksinimde de başarısız olur.

**22. Cevap: B** — Bir Multi-AZ DB cluster dağıtımı, üç AZ'de bir writer ve okunabilir iki standby ile bir reader endpoint çalıştırır, böylece standby kapasitesi hâlâ hızlı otomatik failover'ı desteklerken okumalara hizmet eder. *Diğerleri neden değil:* A — bir instance dağıtımındaki tek standby hiçbir trafiğe hizmet etmez; C — read replica'lar yönetilen otomatik failover sağlamaz ve RDS veritabanları ALB üzerinden yük dengelenmez; D — Single-AZ'nin hiç failover'ı yoktur.

**23. Cevap: B** — Aurora Global Database çoğaltması, tipik alt saniye gecikmeyle depolama katmanında asenkrondur, bu yüzden Region'lar arası RPO sıfıra yakındır ancak asla tam olarak 0 garanti edilemez. *Diğerleri neden değil:* A — çoğaltma Region'lar arasında senkron değildir; C — write forwarding yazmaları birincile yönlendirir; çoğaltma semantiğini değiştirmez; D — çoğaltma gecikmesi tipik olarak bir saniyenin altındadır, 5 dakikalık bir program değil.

**24. Cevap: B** — Recovery Time Objective, tolere edilebilir maksimum kesinti süresidir (4 saat); Recovery Point Objective, tolere edilebilir maksimum veri kaybı penceresidir (15 dakika). *Diğerleri neden değil:* A — tanımları tersine çevirir; C — MTBF/MTTR güvenilirlik istatistikleridir, DR hedefleri değil; D — SLA bir sözleşmesel taahhüttür, bir veri kaybı metriği değil.

**25. Cevap: B** — Pilot light, veriyi sürekli çoğaltılmış ve çekirdek kaynakları tedarik edilmiş ancak kapalı tutar, düşük maliyetle onlarca dakikalık bir RTO verir — tam bir eşleşme. *Diğerleri neden değil:* A — backup and restore'un canlı çoğaltması yoktur ve çok daha uzun bir RTO'su vardır; C — warm standby yığını çalışır halde tutar, gereğinden fazla maliyetlidir; D — active/active en pahalısıdır ve gereksinimi çok aşar.

**26. Cevap: C, E** — Warm standby küçültülmüş, her zaman çalışan tam bir kopyadır; multi-site active/active birden fazla Region'dan en yüksek maliyetle sıfıra yakın RTO ile hizmet eder. *Diğerleri neden değil:* A — backup and restore kaynakları önceden çalıştırmamakla tanımlanır; B — backup and restore en yüksek (en kötü) RTO'ya sahiptir; D — pilot light tedarik edilmiş-ama-kapalıdır, trafiğe hizmet eden tam kapasite değil.

**27. Cevap: B** — 30 saniyelik görünürlük zaman aşımı işleme sırasında sona erdiğinde, mesaj yeniden görünür ve başka bir tüketici onu tekrar işler; görünürlük zaman aşımını maksimum işleme süresinden daha uzun ayarlayın (örneğin en iyi uygulama olarak 6 kat). *Diğerleri neden değil:* A — FIFO ve standard arasındaki fark neden değildir; C — long polling boş-alma verimliliğini etkiler, kopyaları değil; D — saklama süresi mesajların ne kadar süre kalacağını yönetir, yeniden teslimi değil.

**28. Cevap: A** — maxReceiveCount'lu bir redrive politikası, tekrar tekrar başarısız olan ("zehirli hap") mesajları çevrimdışı analiz için bir dead-letter queue'ya taşır ve sonsuz yeniden deneme döngüsünü durdurur. *Diğerleri neden değil:* B — daha kısa bir görünürlük zaman aşımı döngüyü daha hızlı döndürür; C — FIFO hatalı biçimlendirilmiş mesajları atmaz; D — 1 dakikalık bir saklama geçerli mesajların da süresini doldurur.

**29. Cevap: B** — FIFO kuyrukları bir MessageGroupId içinde tam-bir-kez işleme ve kesin sıralama garanti eder; hesap kimliğini grup kimliği olarak kullanmak, hesaplar arası paralellikle hesap başına sıralama verir (ve yüksek verimli FIFO modu daha da ölçeklenebilir). *Diğerleri neden değil:* A — standard kuyruklar sıra veya tam-bir-kez garanti edemez; C — SNS bu kalıp için sıralama veya tam-bir-kez işleme garantisi sağlamaz; D — tek bir grup kimliği her şeyi seri hale getirir, verimi yok eder.

**30. Cevap: B** — SNS'ten SQS'e fan-out, her olayı her kuyruğa teslim eder, burada her tüketici dayanıklı tamponlama ve bağımsız işleme hızı alır. *Diğerleri neden değil:* A — bir kuyrukta üç tüketici mesajları böler; her mesaj yalnızca bir tüketiciye gider; C — sıralı çağırma, tamponlamayla bağımsız paralel işleme değildir; D — e-posta abonelikleri insanlara teslim eder, dayanıklı uygulama tamponlarına değil.

**31. Cevap: B** — Reserved concurrency, kritik fonksiyonlar için ayrılmış eş zamanlılık ayırır (ve satış fonksiyonunu sınırlamak onun etki yarıçapını sınırlar) ve bir fonksiyonun paylaşılan hesap havuzunu tüketmesini önler. *Diğerleri neden değil:* A — daha uzun bir zaman aşımı eş zamanlılık yuvalarını daha uzun tutar, kısıtlamayı kötüleştirir; C — provisioned concurrency ortamları önceden ısıtır ancak hesap eş zamanlılık kotasını yükseltmez; D — bellek boyutu eş zamanlılık sınırlarını etkilemez.

**32. Cevap: B** — Standard iş akışları bir yıla kadar çalışır ve waitForTaskToken callback kalıbı, SendTaskSuccess/SendTaskFailure token'ı geri döndürene kadar yürütmeyi sıfır hesaplama maliyetiyle duraklatır. *Diğerleri neden değil:* A — Express iş akışları en fazla 5 dakikada sona erer; C — Lambda en fazla 15 dakika çalışabilir ve uyumak para harcar; D — EventBridge programları olayları tetikleyebilir ama iş akışı durumunu duraklatıp devam ettiremez.

**33. Cevap: A** — Express iş akışları çok yüksek hızlı, kısa süreli, en-az-bir-kez (at-least-once) yürütmeler için daha düşük maliyetle yapılmıştır; Standard iş akışları mutabakat işi için tam-bir-kez semantiği, bir yıla kadar süre ve tam yürütme geçmişi sağlar. *Diğerleri neden değil:* B — Standard bu kullanım durumu için saniyede 90.000 başlangıcı ekonomik olarak sürdüremez; C — Express en fazla 5 dakikadır ve en-az-bir-kez'dir, 12 saatlik tam-bir-kez işinde başarısız olur; D — ters atamalar her iki iş yükünde de başarısız olur.

**34. Cevap: B** — Failover routing, sağlık kontrolü geçtiği sürece tüm trafiği birincile gönderir, ardından başarısız olduğunda otomatik olarak ikincil kayıtla yanıt verir. *Diğerleri neden değil:* A — 50/50 weighted, trafiğin yarısını her zaman pasif kopyaya gönderir; C — latency-based routing trafiği performansa göre böler, active/passive amacına göre değil; D — geolocation kullanıcı konumuna göre yönlendirir, endpoint sağlığına dayalı failover ile ilgisizdir.

**35. Cevap: B** — ELB sağlık kontrolü tipini eklemek, ASG'nin ALB hedef-sağlığı arızalarını sağlıksız olarak ele almasını sağlar, böylece çökmüş-uygulamalı örnekler EC2 status check'leri geçse bile sonlandırılır ve değiştirilir. *Diğerleri neden değil:* A — ayrıntılı izleme yalnızca metrik ayrıntı düzeyini değiştirir; C — grace period sağlık değerlendirmesini geciktirir, ihtiyaç duyulanın tersi; D — yük dengeleyici tipi sorun değil.

**36. Cevap: B** — Network Load Balancer katman 4'te (TCP/UDP) çalışır, milyonlarca isteği saniyede ultra düşük gecikmeyle işler ve AZ başına statik (veya Elastic) bir IP destekler. *Diğerleri neden değil:* A — ALB katman 7'dir (HTTP/HTTPS) ve doğal olarak statik IP sunmaz; C — Gateway Load Balancer inline sanal cihazlar dağıtmak içindir; D — Classic Load Balancer eskidir ve hiçbir gereksinimi karşılamaz.

**37. Cevap: B, C** — CRR her iki bucket'ta da sürümlemenin etkinleştirilmesini gerektirir ve EFS Standard sınıfları AZ'ler arasında eş zamanlı bağlanabilen bölgesel (multi-AZ) dosya sistemleridir. *Diğerleri neden değil:* A — CRR yalnızca yapılandırmadan sonraki yeni nesneleri çoğaltır, mevcut olanlar için S3 Batch Replication çalıştırmadığınız sürece; D — EFS tek bağlantılı EBS'nin aksine binlerce eş zamanlı NFS istemcisini destekler; E — sürümleme çoğaltma için bir ön koşuldur ama kendisi hiçbir şeyi çoğaltmaz.

### Bölüm 3 — Sorular 38–53

**38. Cevap: B** — io2 Block Express 256.000'e kadar IOPS, alt milisaniye gecikme ve %99,999 dayanıklılık sunar ve üç gereksinimin tamamını karşılar. *Diğerleri neden değil:* A — gp3 artık IOPS sayısına ulaşabilir (üst sınırı 2025'in sonlarında 80.000'e yükseltildi), ancak diğer iki gereksinimde başarısız olur: dayanıklılık %99,8–%99,9'dur (soru %99,999 ister) ve gecikmesi tek haneli milisaniyedir, garantili alt milisaniye değil; üçünü de karşılayan tek tip B'dir; C — st1 HDD tabanlıdır ve IOPS yoğun veritabanları için uygun değildir; D — gp2 en fazla 16.000 IOPS'tedir ve burst sürekli bir garanti değildir.

**39. Cevap: C** — FSx for Lustre, alt milisaniye gecikme, yüzlerce GB/s verim ve yerel S3 entegrasyonuyla (lazy-loading ve dışa aktarma) HPC için özel olarak yapılmıştır. *Diğerleri neden değil:* A — EFS, Lustre'ın HPC verim/gecikme profilini karşılayamaz; B — FSx for Windows SMB/Windows iş yüklerini hedefler, Linux HPC'yi değil; D — Mountpoint for S3 paylaşılan POSIX dosya sistemi semantiği veya gereken gecikmeyi sunmaz.

**40. Cevap: B** — FSx for Windows File Server SMB'yi, Active Directory entegrasyonunu ve NTFS ACL'lerini doğal olarak destekler ve Multi-AZ modu iki-AZ gereksinimini kapsar. *Diğerleri neden değil:* A — EFS NFS/POSIX'tir ve NTFS izinlerini korumaz; C — S3 bir SMB dosya paylaşımı değil, nesne depolamadır; D — Lustre, SMB/AD desteği olmayan bir Linux HPC dosya sistemidir.

**41. Cevap: D, E** — Transfer Acceleration, uzun mesafeli transferleri hızlandırmak için yüklemeleri AWS edge/backbone ağı üzerinden yönlendirir ve multipart upload transferleri paralelleştirir ve başarısız olan parçaların tüm 40 GB dosyayı yeniden başlatmadan yeniden denenmesine izin verir. *Diğerleri neden değil:* A — One Zone-IA yedekliliği değiştirir, yükleme performansını değil; B — yüklemeler için S3'ün önüne bir ALB koyamazsınız; C — CRR yüklemeden sonra çoğaltır ve alıma yardımcı olmaz.

**42. Cevap: B** — Instance store NVMe SSD'ler fiziksel olarak host'a bağlıdır ve yeniden oluşturulabilen geçici veri için en düşük gecikmeyi sunar. *Diğerleri neden değil:* A ve D — EBS ağ üzerinden geçer ve gecikme ekler; C — EFS her ikisinden de daha yüksek gecikmeye sahip bir ağ dosya sistemidir.

**43. Cevap: B** — Düşük genel kullanımla sıcak partition'larda kısıtlama, klasik düşük kardinaliteli partition key problemidir; yüksek kardinaliteli bir anahtar (örneğin game_id#player_id) trafiği eşit şekilde dağıtır. *Diğerleri neden değil:* A — kapasite modu değişiklikleri sıcak partition'ları düzeltmez; C — bir LSI aynı partition key'i ve aynı sıcak partition'ları paylaşır; D — Streams değişiklikleri yakalar, yazmaları yeniden dağıtmaz.

**44. Cevap: B** — DAX, DynamoDB uyumlu, API-şeffaf bir bellek içi önbellektir ve minimal kod değişikliğiyle mikrosaniye okumalar sunar. *Diğerleri neden değil:* A — ElastiCache önbelleği yönetmek için uygulama yeniden yazımları gerektirir; C — bir GSI sıcak öğeleri önbelleğe almaz veya mikrosaniye gecikme vermez; D — Global Tables çok bölgeli erişimi ele alır, tek öğe okuma gecikmesini değil.

**45. Cevap: B** — Bir GSI mevcut bir tabloya herhangi bir zamanda eklenebilir, yeni bir partition/sort key kombinasyonunu destekler ve temel tablodan izole edilmiş kendi tedarik edilmiş verimine sahiptir. *Diğerleri neden değil:* A — LSI'lar yalnızca tablo oluşturma sırasında oluşturulabilir, tablonun partition key'ini paylaşır ve tablo verimini paylaşır; C — tabloyu yeniden oluşturmak yıkıcı ve gereksizdir; D — Streams değişiklik yakalama içindir, ad hoc sorgular için değil.

**46. Cevap: B** — DynamoDB TTL, süresi dolan öğeleri ek maliyet olmadan arka planda otomatik olarak siler. *Diğerleri neden değil:* A — planlanmış taramalar okuma/yazma kapasitesi tüketir ve para harcar; C — yaşam döngüsü politikaları bir S3/EFS kavramıdır, DynamoDB değil; D — Streams olayları aşağı akışta filtreler ama öğeleri tablodan silmez.

**47. Cevap: B** — RDS Proxy bağlantıları havuzlar ve çoğullar (multiplex), yalnızca bir bağlantı dizesi değişikliğiyle binlerce Lambda çağrısının küçük bir veritabanı bağlantısı kümesini paylaşmasına izin verir. *Diğerleri neden değil:* A — boyut büyütme maliyetlidir ve yalnızca sınırı erteler; C — bir veritabanı geçişi büyük bir uygulama değişikliğidir; D — Lambda'yı 10'a kısıtlamak bağlantı yönetimini çözmek yerine verimi felç eder.

**48. Cevap: A** — Reader endpoint arkasındaki Aurora Replica'lar (15'e kadar) replica otomatik ölçeklemesiyle minimal operasyonel işle okuma trafiğini boşaltır. *Diğerleri neden değil:* B — Aurora pasif standby modeli kullanmaz; klasik RDS terimlerindeki standby'lar trafiğe hizmet etmez; C — sharding bir okuma ölçekleme problemi için yüksek operasyonel ek yüktür; D — Backtrack veritabanını zamanda geri sarar, okumalara hizmet etmez.

**49. Cevap: B** — Global Accelerator iki statik anycast IP sağlar, UDP'yi destekler, birden fazla bölgede NLB'lerin önünde durur ve AWS backbone üzerinden saniyeler içinde failover yapar. *Diğerleri neden değil:* A — CloudFront HTTP/HTTPS içeriğine hizmet eder, keyfi UDP'ye değil ve istemciye dönük statik IP'leri yoktur; C — Route 53 latency routing failover için DNS TTL'lerine bağlıdır ve statik IP sağlamaz; D — bir ALB bölgeseldir ve yalnızca HTTP'dir.

**50. Cevap: B** — Geolocation routing, DNS sorgularını kullanıcının ülkesine göre yanıtlar ve lisanslama uyumluluğu için Almanya→eu-central-1 ve Fransa→eu-west-3'ü deterministik olarak zorlar. *Diğerleri neden değil:* A — latency routing en hızlı endpoint'i seçer, bu da lisanslama kuralını ihlal edebilir; C — geoproximity bias sınırları mesafeye göre kaydırır ama kesin ülke eşlemesini garanti etmez; D — weighted routing ağırlığa göre rastgele dağıtır, konumu yok sayar.

**51. Cevap: C** — Bir cluster placement group, örnekleri en düşük gecikme ve en yüksek saniyedeki paket için tek bir AZ'de birbirine yakın paketler, sıkı bağlı MPI iş yükleri için idealdir. *Diğerleri neden değil:* A — spread group'lar örnekleri ayrı donanıma ayırır, gecikmeyi artırır ve AZ başına 7 ile sınırlıdır; B — partition group'lar dağıtık veri sistemleri için hata alanlarını izole eder, düşük gecikmeli MPI için değil; D — ayrı alt ağlar örnekleri birlikte konumlandırmak için hiçbir şey yapmaz.

**52. Cevap: B** — Amazon Data Firehose tamamen yönetilir, hiçbir tüketici veya shard yönetimi gerektirmez, kayıtları tamponlar ve S3'e teslim etmeden önce JSON'ı Parquet'e dönüştürebilir. *Diğerleri neden değil:* A — Kinesis Data Streams tüketici yazmayı/yönetmeyi gerektirir; C — SQS artı EC2 yoklayıcıları oluşturulacak ve çalıştırılacak özel altyapıdır; D — MSK Kafka kümeleri ve konnektörlerini yönetmeyi gerektirir.

**53. Cevap: B** — Glue crawler'ları şemayı Data Catalog'a çıkarır ve Athena, S3 dosyalarına karşı doğrudan sunucusuz SQL çalıştırır. *Diğerleri neden değil:* A — Redshift küme tedariki ve veri yükleme gerektirir; C — EMR uzun süreli çalışan bir kümeyi yönetmek demektir; D — RDS verinin bir veritabanı sunucusuna yüklenmesini gerektirir.

### Bölüm 4 — Sorular 54–65

**54. Cevap: C** — Kontrol noktası alan, yeniden başlatılabilir toplu işler ideal Spot iş yüküdür ve örnek tipleri/AZ'ler arasında çeşitlendirilmiş bir Spot Fleet, ~%90'a varan tasarrufla kesinti etkisini en aza indirir. *Diğerleri neden değil:* A — On-Demand burada hiçbir fayda olmadan indirimden vazgeçer; B ve D — taahhütler Spot'tan daha küçük indirimler verir ve kesintiye uygun bir iş için harcamayı kilitler.

**55. Cevap: C** — Compute Savings Plan'lar EC2 (herhangi bir aile/bölge), Fargate ve Lambda genelinde otomatik olarak uygulanır ve modernleştirme yoluna uyar. *Diğerleri neden değil:* A — EC2 Instance Savings Plan'lar bir bölgedeki bir örnek ailesine kilitlidir ve Fargate/Lambda'yı hariç tutar; B ve D — Reserved Instance'lar yalnızca EC2'yi kapsar ve Fargate veya Lambda'ya uygulanmaz.

**56. Cevap: B** — Yalnızca EC2 Standard Reserved Instance'lar Reserved Instance Marketplace'te listelenebilir; RDS (ve diğer hizmet) RI'ları yeniden satılamaz. *Diğerleri neden değil:* A ve C — RDS RI'ları marketplace'e uygun değildir; D — EC2 Standard RI'ları aslında marketplace'te satılabilir.

**57. Cevap: B** — AWS, örneği geri almadan iki dakika önce bir Spot kesinti bildirimi teslim eder ve boşaltma ile kontrol noktası kaydetme için zaman verir. *Diğerleri neden değil:* A — bir uyarı sağlanır; C ve D — 15 dakika ve 24 saat Spot kesinti pencereleri değildir (yeniden dengeleme önerileri daha erken gelebilir ama garantili sabit bir pencere değildir).

**58. Cevap: B** — Glacier Flexible Retrieval, düşük arşiv depolama maliyeti ve veriyi 1–5 dakikada (yaklaşık 0,03 $/GB) döndüren Expedited retrieval'lar sunar ve 5 dakikalık gereksinimi karşılar. *Diğerleri neden değil:* A — Deep Archive'in en hızlı retrieval'ı ~12 saattir; C — Bulk retrieval'lar 5–12 saat sürer; D — Standard-IA anında getirir ama 7 yıllık nadiren erişilen depolama için çok daha pahalıdır.

**59. Cevap: B** — One Zone-IA, Standard-IA'dan ~%20 daha az maliyetlidir ve tek AZ'li dayanıklılık ödünü yeniden üretilebilir küçük resimler için kabul edilebilirdir. *Diğerleri neden değil:* A — Standard-IA, verinin ihtiyaç duymadığı yedeklilik için daha pahalıya mal olur; C — Intelligent-Tiering izleme ücretleri ekler ve bilinen-seyrek erişim için maliyeti en aza indirmez; D — Glacier Instant Retrieval'ın 90 günlük minimumu ve bu kalıp için farklı bir retrieval maliyet profili vardır.

**60. Cevap: A, C** — Intelligent-Tiering küçük bir nesne başına izleme/otomasyon ücreti alır ve 128 KB'tan küçük nesneler saklanır ama izlenmez veya katmanlanmaz (Frequent Access oranlarıyla faturalandırılır). *Diğerleri neden değil:* B — Intelligent-Tiering'in otomatik katmanları arasında retrieval ücreti yoktur; D — asla bölgeler arası çoğaltma yapmaz; E — sınıftaki her nesne için 90 günlük minimum yoktur.

**61. Cevap: B** — Tamamlanmamış multipart upload parçaları depolama olarak faturalandırılır ama nesne olarak görünmez; AbortIncompleteMultipartUpload'lı bir yaşam döngüsü kuralı onları otomatik olarak siler. *Diğerleri neden değil:* A — sürümleme depolamayı artırır, parçaları temizlemez; C — depolama sınıfını değiştirmek yetim parçaları kaldırmaz; D — Transfer Acceleration transferleri hızlandırır ama zaten terk edilmiş yüklemeleri temizlemez.

**62. Cevap: B** — gp3, IOPS/verimi boyuttan ayırır ve gp2'den GB başına ~%20 daha az maliyetlidir, böylece gereken IOPS korunurken kapasite doğru boyutlandırılabilir; geçiş çevrimiçi bir ModifyVolume işlemidir. *Diğerleri neden değil:* A — io2 daha pahalıdır, daha ucuz değil; C — st1 gereken IOPS'yi sunamaz; D — volume'ları silmek canlı veriyi yok eder.

**63. Cevap: B** — S3 için bir gateway VPC endpoint ücretsizdir ve aynı bölgedeki S3 trafiği için NAT gateway veri işleme ücretlerini ortadan kaldırır. *Diğerleri neden değil:* A — bir NAT instance hâlâ EC2 ve operasyonel maliyetler getirir; C — interface endpoint'ler saat başına ve GB başına faturalandırır, ücretsiz gateway endpoint'ten daha fazla maliyetlidir; D — genel alt ağlar herkese açık IPv4 ücretleri ekler ve güvenliği zayıflatır.

**64. Cevap: B, E** — AWS kullanımdaki her herkese açık IPv4 adresini ücretlendirir, bu yüzden gereksiz olanları kaldırmak maliyeti azaltır ve AWS Budgets, tahmini/gerçek harcamada proaktif eşik uyarıları sağlar. *Diğerleri neden değil:* A — Elastic IP'ler bağlıyken bile herkese açık IPv4 ücreti kapsamında faturalandırılır; C — Compute Optimizer doğru boyutlandırma önerir ama harcama eşiklerini engelleyemez veya uyaramaz; D — Shield Advanced maliyet ekleyen bir DDoS hizmetidir.

**65. Cevap: A** — Aurora Serverless v2, 0 ACU'ya ölçeklemeyi destekler (auto-pause, 2024'ün sonlarından beri kullanılabilir) ve bağlantıda otomatik olarak devam eder, manuel adım olmadan boştayken hesaplama maliyetini ortadan kaldırır. Bilmeye değer nüanslar: auto-pause yakın tarihli motor sürümleri gerektirir (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); bir duraklamadan sonraki ilk bağlantının devam etmesi ~15 saniye sürer (24+ saat duraklatıldıktan sonra daha uzun); hesaplama duraklatılmışken depolama faturalandırılmaya devam eder; ve bağlantıları açık tutan herhangi bir şey — bir RDS Proxy, bir keep-alive sağlık kontrolü — duraklamayı tamamen önler. *Diğerleri neden değil:* B — durdurulmuş tedarik edilmiş bir küme, geliştiriciler bağlandığında otomatik olarak uyanmaz (ve 7 gün sonra yeniden başlar); C — headless global database ikincilleri DR'ı ele alır, boşta maliyeti değil; D — içeri ölçeklenen reader'lar yine de writer örneğini çalışır ve faturalandırılır bırakır.

---

## Puanlama Kılavuzu

| Puan | Sonucun Yorumu |
|---|---|
| 55–65 | Sınava hazır. Sınavı planlayın. Yalnızca kaçırdığınız soruları gözden geçirin. |
| 47–54 | Geçme aralığında, ancak marj ince. Her kaçırmanın ardındaki bölümleri yeniden okuyun (alan etiketlerini kullanın), bir hafta içinde tekrar girin. |
| 38–46 | Temel var; boşluklar kalıyor. Tekrar girmeden önce zayıf alanlarınız için Ek B'nin alan haritasını baştan sona çalışın. |
| 38'in altında | En zayıf iki alanınız için bölümleri baştan sona yeniden okuyun, bölüm egzersizlerini tekrar yapın, ardından bu sınava tekrar girin. |

Kaçırmalarınızı *alana göre* izleyin (her soru etiketlenmiştir). Tek bir alanda yoğunlaşan düşük bir puan, odaklanmış bir çalışma problemidir; eşit şekilde yayılmış aynı puan ise bir tempo veya soru-okuma problemidir — yavaşlayın ve her sorunun gövdesinin gerçekte ne gerektirdiğinin altını çizin (HA ile DR, maliyet ile performans, "EN uygun maliyetli" ile "EN AZ operasyonel ek yük").
