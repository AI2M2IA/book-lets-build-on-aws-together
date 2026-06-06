# Kiambatisho D: Mtihani Kamili wa Mazoezi (Maswali 65)

Huu ni mtihani kamili wa mazoezi wa SAA-C03: maswali 65, ukiakisi uzito wa vikoa wa mtihani halisi — Design Secure Architectures (Maswali 1–20, ~30%), Design Resilient Architectures (21–37, ~26%), Design High-Performing Architectures (38–53, ~24%), na Design Cost-Optimized Architectures (54–65, ~20%).

**Jinsi ya kuufanya:**

- Weka kipima muda kwa **dakika 130** — muda wa mtihani halisi. Fanya mazoezi ya kasi: hizo ni dakika mbili kwa swali.
- Maswali saba yanasema **"(Chagua MBILI.)"** — yana chaguo tano na majibu mawili sahihi haswa, kama vile vipengele vya majibu-mengi vya mtihani halisi. Yote mawili lazima yawe sahihi ili kupata alama ya swali.
- Usitazame ufunguo wa majibu hadi umalize yote 65. Kwenye mtihani halisi hakuna maoni katikati ya safari, na kuzoeza uvumilivu wako kwa kutokuwa na uhakika ni sehemu ya maandalizi.
- Mtihani halisi unajumuisha maswali 15 ya majaribio yasiyopimwa ambayo huwezi kuyatambua. Yote 65 hapa ni "yanayopimwa." Kiwango cha kufaulu: **47 au zaidi sahihi (~72%)** kinakuweka katika kiwango cha alama ya kufaulu iliyopimwa ya 720/1000. Chini ya 47, rudia sura zilizoramani katika Kiambatisho B kwa vikoa vyako dhaifu kabla ya kuandikisha mtihani.
- Kwa kila swali unalokosa — na kila swali unalolijibu vizuri lakini ukasita — soma uchambuzi wa vichanganyi. Mtihani unapima *tofauti* kati ya chaguo zinazokubalika, na hapo ndipo kujifunza kunaishi.

---

## Sehemu ya 1 — Design Secure Architectures (Maswali 1–20)

**Swali 1** *(Domain 1 — Task 1.1)*
Kampuni ya huduma za kifedha inatumia AWS Organizations ikiwa na vipengele vyote vimewezeshwa. Timu ya usalama iliambatisha service control policy (SCP) kwenye mzizi wa shirika inayokataa matumizi ya AWS Regions zote isipokuwa eu-west-1. Wakati wa ukaguzi, timu inagundua kuwa msimamizi katika akaunti moja bado aliweza kuzindua vipengele vya EC2 katika us-east-2 licha ya SCP. Ni akaunti gani inayowezekana zaidi iliruhusu kitendo hiki?

A) Akaunti mwanachama katika kitengo cha shirika kilichokitwa (OU), kwa sababu SCP haziendelei kwa OU zilizokitwa
B) Akaunti ya usimamizi, kwa sababu SCP hazitumiki kwa akaunti ya usimamizi
C) Akaunti mwanachama ambayo sera ya msimamizi wa IAM ina Allow ya wazi, ambayo inapindua SCP
D) Akaunti mwanachama iliyoundwa baada ya SCP kuambatishwa, kwa sababu SCP zinatumika kwa akaunti zilizokuwepo wakati wa kuambatisha pekee

**Swali 2** *(Domain 1 — Task 1.1)*
Startup inataka kuruhusu wasanidi wake kuunda majukumu ya IAM kwa programu zao, lakini timu ya usalama ina wasiwasi kuwa wasanidi wanaweza kuunda majukumu yenye ruhusa nyingi kuliko wasanidi wenyewe walivyo nazo, na kusababisha kupanda kwa upendeleo. Timu ya usalama inataka wasanidi waendelee kuwa na uundaji wa majukumu wa kujihudumia. Ni suluhu gani INAYOFAA ZAIDI?

A) Itake wasanidi kuwasilisha maombi ya uundaji wa majukumu kupitia mfumo wa tiketi unaopitiwa na timu ya usalama
B) Ambatisha SCP kwenye akaunti za wasanidi inayokataa kitendo cha iam:CreateRole kabisa
C) Itake kwamba majukumu yote yaliyoundwa na wasanidi yajumuishe permissions boundary maalum, iliyotekelezwa na condition ya IAM kwenye iam:CreateRole na iam:AttachRolePolicy
D) Wezesha AWS CloudTrail na sanidi tahadhari wakati wowote msanidi anaunda jukumu jipya la IAM

**Swali 3** *(Domain 1 — Task 1.1)*
Mtoa huduma wa SaaS anahitaji kufikia rasilimali katika akaunti za AWS za wateja wake ili kufanya uchambuzi wa gharama wa kiotomatiki. Wateja wanaunda jukumu la IAM ambalo akaunti ya mtoa huduma wa SaaS inaweza kulichukua. Mshauri wa usalama anaonya kuwa mtu wa tatu anayejua role ARN ya mteja anaweza kudanganya mtoa huduma wa SaaS kufikia akaunti ya mteja huyo kwa niaba ya mtu wa tatu. Ni utaratibu gani unaopunguza hatari hii ya "confused deputy"?

A) Itake uthibitishaji wa mambo mengi (MFA) kwenye trust policy ya jukumu la toka akaunti hadi akaunti
B) Itake mtoa huduma wa SaaS apitishe ExternalId ya kipekee, iliyofafanuliwa na mteja, katika wito wa sts:AssumeRole na kuthibitishwa na condition katika trust policy ya jukumu
C) Simba role ARN na AWS KMS kabla ya kuishiriki na mtoa huduma wa SaaS
D) Badilisha jukumu la toka akaunti hadi akaunti na mtumiaji wa IAM ambaye access keys zake zinazungushwa kila siku 90

**Swali 4** *(Domain 1 — Task 1.1)*
Kampuni yenye akaunti 40 za AWS katika AWS Organizations inataka wafanyakazi wake waingie mara moja kwa vitambulisho vyao vilivyopo vya Microsoft Entra ID (Azure AD) na kufikia akaunti zote za AWS kupitia portal moja, ikiwa na ruhusa zinazopewa kwa kati kwa kila akaunti. Ni suluhu gani inayotimiza mahitaji haya ikiwa na gharama ndogo zaidi ya uendeshaji?

A) Unda watumiaji wa IAM katika kila moja ya akaunti 40 na usawazishe manenosiri na Entra ID
B) Sanidi AWS IAM Identity Center ikiwa na Entra ID kama mtoa huduma wa utambulisho wa nje na upe permission sets kwa watumiaji na vikundi kwa kila akaunti
C) Peleka Amazon Cognito user pools katika kila akaunti na uziunganishe na Entra ID
D) Unda mtoa huduma wa utambulisho wa SAML katika kila akaunti na uandike majukumu na trust policies za IAM kwa kila akaunti kwa mkono

**Swali 5** *(Domain 1 — Task 1.1)*
Kampuni ya michezo ya simu inajenga programu ambapo wachezaji wanajiandikisha kwa anwani ya barua pepe au kuingia kwa kijamii, na baada ya uthibitishaji programu lazima ipakie picha za skrini za mchezaji moja kwa moja kwenye ndoo ya Amazon S3 kwa kutumia vitambulisho vya muda vya AWS. Ni mchanganyiko gani wa huduma ambao mhandisi wa suluhu apaswa kupendekeza?

A) Amazon Cognito user pool kwa kujiandikisha/kuingia, na Amazon Cognito identity pool ili kubadilishana tokeni iliyothibitishwa kwa vitambulisho vya muda vya AWS
B) Amazon Cognito identity pool kwa kujiandikisha/kuingia, na Amazon Cognito user pool ili kutoa vitambulisho vya muda vya AWS
C) AWS IAM Identity Center kwa kujiandikisha/kuingia, na AWS STS GetSessionToken kwa vitambulisho
D) Amazon Cognito user pool pekee, kwa sababu tokeni za user pool zinatoa ufikiaji wa moja kwa moja kwa S3

**Swali 6** *(Domain 1 — Task 1.3)*
Kampuni ya afya lazima isimbe data katika Amazon S3 kwa ufunguo unaounga mkono mzunguko wa kila mwaka wa kiotomatiki unaosimamiwa na AWS, huku bado ikiruhusu kampuni kufafanua key policy, kuwezesha uingiaji wa CloudTrail wa matumizi ya ufunguo, na kuzima ufunguo ikiwa inahitajika. Ni aina gani ya ufunguo wa KMS inayotimiza mahitaji haya?

A) AWS managed key (aws/s3)
B) Customer managed key ikiwa na mzunguko wa kiotomatiki uliowezeshwa
C) AWS owned key
D) Customer managed key yenye imported key material (BYOK) ikiwa na mzunguko wa kiotomatiki uliowezeshwa

**Swali 7** *(Domain 1 — Task 1.3)*
Mhandisi wa suluhu anaeleza jinsi AWS KMS inavyosimba faili ya 4 GB iliyohifadhiwa na programu, ikizingatiwa kuwa KMS inaweza kusimba moja kwa moja hadi 4 KB ya data pekee. Ni kauli gani inayoeleza kwa usahihi usimbaji wa bahasha?

A) KMS inagawanya faili katika vipande vya 4 KB na kusimba kila kipande na ufunguo wa KMS
B) Programu inaomba data key kutoka KMS, inasimba faili kwa ndani na plaintext data key, kisha inahifadhi data key iliyosimbwa pamoja na data na kutupa plaintext data key
C) KMS inatiririsha faili kupitia KMS API, ambayo inaisimba upande wa seva na ufunguo wa KMS
D) Programu inasimba faili na ufunguo wa symmetric uliowekwa moja kwa moja kwenye nambuli, na KMS inasaini matokeo kwa uadilifu

**Swali 8** *(Domain 1 — Task 1.3)*
Kampuni inahifadhi nenosiri kuu la Amazon RDS for PostgreSQL na inahitaji lizungushwe kiotomatiki kila siku 30 bila muda wa kutokufanya kazi wa programu. Programu inaweka miunganisho ya hifadhidata ya muda mrefu, hivyo timu inataka mkakati wa mzunguko ambapo vitambulisho vya awali vinabaki halali wakati vipya vinawashwa. Ni suluhu gani inayotimiza mahitaji haya?

A) Vigezo vya AWS Systems Manager Parameter Store SecureString ikiwa na kitendo cha Lambda kinachozinduliwa kila mwezi
B) AWS Secrets Manager ikiwa na mkakati wa mzunguko wa mtumiaji-mmoja
C) AWS Secrets Manager ikiwa na mkakati wa mzunguko wa watumiaji-wanaobadilishana, ambao unabadilisha kati ya watumiaji wawili wa hifadhidata ili kitambulisho kimoja kibaki halali daima
D) Mzunguko wa kiotomatiki wa funguo wa AWS KMS unaotumika kwa nenosiri la hifadhidata

**Swali 9** *(Domain 1 — Task 1.3)*
Kampuni ya vyombo vya habari inahifadhi video ghafi katika Amazon S3. Utii unahitaji kwamba kampuni isimamie na kutoa funguo zake za usimbaji, kwamba AWS kamwe isihifadhi funguo hizo, na kwamba funguo zitolewe kwa kila ombi. Ni chaguo gani la usimbaji linalotimiza mahitaji haya?

A) SSE-S3
B) SSE-KMS ikiwa na customer managed key
C) SSE-C
D) Usimbaji wa upande wa mteja kwa kutumia AWS managed key aws/s3

**Swali 10** *(Domain 1 — Task 1.3)*
Broker-dealer lazima ihifadhi rekodi za biashara katika Amazon S3 kwa miaka saba kwa njia inayozuia yeyote—ikiwa ni pamoja na AWS account root user—kufuta au kuandika upya vitu wakati wa kipindi cha uhifadhi, ili kutimiza SEC Rule 17a-4. Ni usanidi gani unaotimiza hitaji hili?

A) S3 Object Lock katika governance mode ikiwa na kipindi cha uhifadhi cha miaka 7
B) S3 Object Lock katika compliance mode ikiwa na kipindi cha uhifadhi cha miaka 7 kwenye ndoo iliyowezeshwa uwekaji matoleo
C) Sera ya ndoo ya S3 inayokataa s3:DeleteObject kwa principals zote
D) S3 Glacier Deep Archive ikiwa na sheria ya mzunguko wa maisha inayofuta vitu baada ya miaka 7

**Swali 11** *(Domain 1 — Task 1.2)*
Programu ya wavuti inaendesha kwenye vipengele vya EC2 nyuma ya Application Load Balancer. Mhandisi wa mtandao anaongeza sheria ya network ACL kwenye subnet inayoruhusu kuingia kwa TCP port 443 kutoka 0.0.0.0/0, lakini wateja bado hawawezi kukamilisha maombi ya HTTPS. Security groups zimesanidiwa kwa usahihi. Ni nini sababu INAYOWEZEKANA ZAIDI?

A) Network ACL ni stateful na inahitaji sheria ya kufuatilia muunganisho
B) Network ACL haina sheria ya kutoka inayoruhusu ephemeral ports (1024–65535), hivyo trafiki ya kurudi imezuiwa kwa sababu NACL ni stateless
C) Security group lazima pia iruhusu kutoka kwa port 443, kwa sababu security groups ni stateless
D) Network ACL haziwezi kuruhusu trafiki kutoka 0.0.0.0/0; CIDR maalum inahitajika

**Swali 12** *(Domain 1 — Task 1.2)*
Ni kauli gani MBILI kuhusu security groups na network ACL katika VPC ni sahihi? (Chagua MBILI.)

A) Security groups ni stateful, hivyo trafiki ya kurudi inaruhusiwa kiotomatiki bila kujali sheria za kutoka
B) Network ACL zinatathmini sheria kwa mpangilio wa kinambari na zinaunga mkono sheria za Deny za wazi
C) Security groups zinaunga mkono sheria za Allow na Deny
D) Network ACL zinaambatishwa kwa elastic network interfaces binafsi
E) Sheria za security group zinatathminiwa kwa mpangilio wa kinambari, zikisimama kwenye mlinganisho wa kwanza

**Swali 13** *(Domain 1 — Task 1.2)*
Kampuni ya e-commerce inayoendesha programu inayokabili umma kwenye CloudFront na ALB ina wasiwasi kuhusu mashambulizi makubwa, ya kisasa ya DDoS. Kampuni inataka ufikiaji wa 24/7 wa AWS Shield Response Team, ulinzi wa gharama dhidi ya malipo ya kupanua yanayosababishwa na mashambulizi, na uchunguzi wa mashambulizi. Ni huduma gani itumie?

A) AWS Shield Standard, ambayo inawezeshwa kiotomatiki bila gharama
B) AWS Shield Advanced
C) AWS WAF ikiwa na sheria zinazotegemea kasi
D) Amazon GuardDuty ikiwa na mpango wa ulinzi wa EC2

**Swali 14** *(Domain 1 — Task 1.2)*
REST API nyuma ya Application Load Balancer inashambuliwa kwa majaribio ya SQL injection na maombi mengi kupita kiasi kutoka kwa seti ndogo ya anwani za IP. Ni suluhu gani inayozuia mifumo ya maombi mabaya kwenye ukingo wa programu ikiwa na juhudi ndogo zaidi ya usanidi?

A) Ongeza nambuli ya uthibitishaji wa ingizo kwa kila kishughulikiaji cha API
B) Unganisha AWS WAF na ALB, ukitumia kikundi cha sheria zinazosimamiwa za SQL injection na sheria inayotegemea kasi
C) Wezesha AWS Shield Standard kwenye ALB
D) Sanidi security group ya ALB kukataa maombi yanayobeba maneno muhimu ya SQL

**Swali 15** *(Domain 1 — Task 1.2)*
Kampuni inataka kushughulikia mahitaji matatu ya usalama: (1) kugundua kwa kuendelea vipengele vya EC2 vilivyovuja na shughuli za API zisizo za kawaida kwa kutumia akili ya vitisho, (2) kugundua na kuainisha taarifa za utambulisho binafsi (PII) zilizohifadhiwa katika ndoo za S3, na (3) kuchanganua vipengele vya EC2 na picha za vyombo kwa udhaifu wa programu (CVE). Ni uoanishaji gani wa huduma za AWS na mahitaji ni sahihi?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Swali 16** *(Domain 1 — Task 1.2)*
Programu inayoendesha kwenye vipengele vya EC2 katika subnet za faragha lazima ipakie vitu kwenye Amazon S3 na kuita Amazon DynamoDB. Sera ya kampuni inakataza trafiki kupita intaneti ya umma, na timu inataka chaguo la gharama ndogo zaidi kwa huduma zote mbili. Ni suluhu gani inayotimiza mahitaji haya?

A) NAT gateway katika subnet ya umma
B) Gateway VPC endpoints kwa S3 na DynamoDB, zinazorejelewa katika jedwali za njia za subnet
C) Interface VPC endpoints (AWS PrivateLink) kwa S3 na DynamoDB
D) Internet gateway ikiwa na sheria za security group zenye vikwazo

**Swali 17** *(Domain 1 — Task 1.3)*
Baada ya tukio la server-side request forgery (SSRF) ambapo mshambuliaji alipata vitambulisho vya jukumu la IAM kutoka kwa huduma ya metadata ya kipengele cha EC2 kupitia programu ya wavuti yenye udhaifu, timu ya usalama inataka kuimarisha vipengele vyote dhidi ya darasa hili la shambulizi. Timu ifanye nini?

A) Tekeleza IMDSv2 kwa kuhitaji session tokens (HttpTokens=required), ili maombi ya metadata yahitaji tokeni iliyopatikana kwa PUT ambayo maombi rahisi ya SSRF hayawezi kuipata
B) Zima huduma ya metadata ya kipengele kwenye vipengele vyote, kwani programu kamwe haziihitaji
C) Zuia 169.254.169.254 katika network ACL ya subnet
D) Hamisha vitambulisho vya jukumu la kipengele kuingia faili ya usanidi kwenye kipengele

**Swali 18** *(Domain 1 — Task 1.3)*
Mhandisi wa suluhu lazima ahifadhi takriban thamani 200 za usanidi wa programu za plaintext (feature flags, majina ya mazingira, endpoint URLs) na manenosiri 5 ya hifadhidata. Manenosiri yanahitaji mzunguko wa kiotomatiki; thamani za usanidi hazihitaji, na timu inataka kupunguza gharama. Ni mchanganyiko gani UNAOFAA ZAIDI kigharama?

A) Hifadhi kila kitu katika AWS Secrets Manager
B) Hifadhi kila kitu katika vigezo vya kawaida vya AWS Systems Manager Parameter Store
C) Hifadhi thamani za usanidi katika vigezo vya kawaida vya Parameter Store (bila gharama) na manenosiri katika AWS Secrets Manager ikiwa na mzunguko uliowezeshwa
D) Hifadhi thamani za usanidi katika S3 na manenosiri katika vigezo vya Parameter Store SecureString ikiwa na mzunguko wa kiotomatiki uliojengwa ndani

**Swali 19** *(Domain 1 — Task 1.3)*
Kampuni inasimba vitu vya S3 kwa SSE-KMS kwa kutumia customer managed key. Programu katika akaunti ile ile inasoma vitu hivi maelfu ya mara kwa sekunde, na timu inaona kupunguzwa kwa kasi na wasiwasi wa gharama kutoka kwa wito wa API wa KMS. Ni mabadiliko gani yanayopunguza trafiki ya maombi ya KMS huku ikiweka usimbaji wa SSE-KMS?

A) Badilisha ndoo kwenda SSE-S3, ambayo haitumii funguo
B) Wezesha S3 Bucket Keys, ili S3 itumie ufunguo wa kiwango cha ndoo wa muda mfupi kupunguza wito kwa KMS
C) Zima mzunguko wa kiotomatiki wa funguo kwenye customer managed key
D) Badilisha customer managed key na imported key material

**Swali 20** *(Domain 1 — Task 1.1)*
Ni kauli gani MBILI kuhusu tathmini ya sera ya IAM na AWS Organizations ni sahihi? (Chagua MBILI.)

A) SCP zinatoa ruhusa kwa watumiaji wa IAM na majukumu katika akaunti za wanachama
B) Deny ya wazi katika sera yoyote inayotumika daima inapindua Allow yoyote
C) Resource-based policies haziwezi kutoa ufikiaji wa toka akaunti hadi akaunti bila SCP
D) Permissions boundary inaweka ruhusa za juu ambazo identity-based policy inaweza kutoa kwa mtumiaji au jukumu, lakini haitoi chochote yenyewe
E) Ikiwa hakuna sera inayotaja kitendo, kitendo kinaruhusiwa kwa chaguo-msingi kwa watumiaji wa IAM

---

## Sehemu ya 2 — Design Resilient Architectures (Maswali 21–37)

**Swali 21** *(Domain 2 — Task 2.2)*
Muuzaji wa rejareja mtandaoni anaendesha Amazon RDS for MySQL. Hifadhidata inakumbwa na trafiki nzito ya usomaji kutoka dashibodi za ripoti, na kampuni pia inahitaji hifadhidata istahimili hitilafu ya Availability Zone ikiwa na kuhamia kiotomatiki na bila uingiliaji wa mkono. Ni mchanganyiko gani unaoshughulikia mahitaji YOTE MAWILI?

A) Wezesha uwekaji wa Multi-AZ pekee; kipengele cha standby kinaweza kuhudumia usomaji wa ripoti
B) Unda read replicas pekee; replica inapandishwa kiotomatiki wakati AZ ya kuu inashindwa
C) Wezesha uwekaji wa Multi-AZ kwa kuhamia kiotomatiki, na ongeza read replicas kupunguza usomaji wa ripoti
D) Hamia kwa darasa kubwa la kipengele la single-AZ kushughulikia mizigo yote miwili

**Swali 22** *(Domain 2 — Task 2.2)*
Kampuni inataka upatikanaji wa juu wa RDS katika Availability Zones, lakini inapinga kulipia kipengele cha jadi cha standby cha Multi-AZ ambacho hakihudumii trafiki yoyote. Ni chaguo gani la uwekaji wa RDS linalotoa kuhamia kiotomatiki NA kuruhusu uwezo wa standby kuhudumia trafiki ya usomaji?

A) Uwekaji wa RDS Multi-AZ DB instance (standby moja)
B) Uwekaji wa RDS Multi-AZ DB cluster, ambao una vipengele viwili vya standby vinavyoweza kusomwa ikiwa na reader endpoint
C) RDS read replicas katika AZ tatu ikiwa na Application Load Balancer
D) RDS Single-AZ ikiwa na nakala rudufu za kiotomatiki

**Swali 23** *(Domain 2 — Task 2.2)*
Jukwaa la malipo la kimataifa kwenye Amazon Aurora lazima lihamie kwa AWS Region ya pili kama Region ya kuu itakuwa haipatikani. Timu ya utii inauliza kama Aurora Global Database inaweza kuhakikisha upotezaji wa data sifuri (RPO = 0) katika Regions. Mhandisi wa suluhu awaambie nini?

A) Ndiyo — Aurora Global Database inanakili sambamba katika Regions, hivyo RPO ni sifuri haswa
B) Hapana — Aurora Global Database inatumia unakili asiyo sambamba unaotegemea uhifadhi ikiwa na ucheleweshaji wa kawaida chini ya sekunde 1, hivyo RPO ya toka Region hadi Region ni karibu sifuri lakini kamwe haijahakikishwa kuwa sifuri haswa
C) Ndiyo — lakini tu kama write forwarding imewezeshwa kwenye Region ya pili
D) Hapana — Aurora Global Database inanakili kwa ratiba ya dakika 5, ikitoa RPO ya dakika 5

**Swali 24** *(Domain 2 — Task 2.2)*
Mpango wa uokoaji wa maafa wa kampuni unasema: "Baada ya kukatika kwa Region, mfumo wa maagizo lazima uwe ukiendesha tena ndani ya saa 4, na si zaidi ya dakika 15 za miamala zinazoweza kupotea." Ni kauli gani inayoramani namba hizi kwa usahihi kwa metriki za DR?

A) RTO = dakika 15; RPO = saa 4
B) RTO = saa 4; RPO = dakika 15
C) MTBF = saa 4; MTTR = dakika 15
D) RPO = saa 4; SLA = dakika 15

**Swali 25** *(Domain 2 — Task 2.2)*
Kampuni ya bima inahitaji mkakati wa DR kwa programu muhimu. Mahitaji: data lazima inakiliwe kwa kuendelea kwa DR Region; miundombinu ya msingi (hifadhidata, AMIs, stack ndogo) lazima tayari iwepo katika DR Region lakini kompyuta inapaswa kubaki imezimwa hadi maafa, kudhibiti gharama; RTO ya dakika kadhaa inakubalika. Ni mkakati gani wa DR unaolingana?

A) Backup and restore
B) Pilot light — vipengele vya msingi vimetolewa katika DR Region ikiwa na data inayonakiliwa moja kwa moja, lakini kompyuta imezimwa hadi kuhamia
C) Warm standby — nakala kamili iliyopunguzwa lakini inayoendesha daima ya mzigo
D) Multi-site active/active

**Swali 26** *(Domain 2 — Task 2.2)*
Ni kauli gani MBILI kuhusu mikakati ya uokoaji wa maafa ya AWS ni sahihi? (Chagua MBILI.)

A) Backup and restore inahitaji rasilimali zitolewe awali na ziendeshe katika Region ya uokoaji
B) Backup and restore inatoa RTO ya chini kabisa kati ya mikakati minne
C) Multi-site active/active inahudumia trafiki kutoka Regions nyingi kwa wakati mmoja na inatoa RTO karibu sifuri kwa gharama ya juu kabisa
D) Pilot light inaweka nakala ya uwezo kamili ya programu ikihudumia trafiki ya uzalishaji katika Region ya uokoaji
E) Warm standby inaweka nakala iliyopunguzwa lakini inayofanya kazi kikamilifu ya mzigo ikiendesha daima katika Region ya uokoaji

**Swali 27** *(Domain 2 — Task 2.1)*
Programu ya usindikaji wa picha inasoma ujumbe kutoka kwa Amazon SQS standard queue. Kusindika picha moja kunachukua hadi dakika 3, lakini visibility timeout ya foleni imewekwa kwa sekunde 30. Watumiaji wanaripoti kuwa baadhi ya picha zinasindikwa mara mbili au tatu. Ni nini sababu INAYOWEZEKANA ZAIDI na suluhisho?

A) Foleni ni FIFO; badilisha kwenda standard queue
B) Visibility timeout inaisha kabla ya usindikaji kumalizika, ikifanya ujumbe kuonekana kwa watumiaji wengine tena; ongeza visibility timeout zaidi ya muda wa usindikaji
C) Long polling imezimwa; wezesha ReceiveMessageWaitTime ya sekunde 20
D) Kipindi cha uhifadhi wa ujumbe ni kifupi mno; ongeza hadi siku 14

**Swali 28** *(Domain 2 — Task 2.1)*
Programu ya bili inatumia ujumbe kutoka kwa SQS queue. Mara kwa mara ujumbe uliopotoka unasababisha mtumiaji kushindwa mara kwa mara, na ujumbe unazunguka kwenye foleni milele, ukipoteza kompyuta. Mhandisi asanidi nini?

A) Dead-letter queue ikiwa na redrive policy ya maxReceiveCount, ili ujumbe unaoshindwa mara kwa mara uhamishwe kando kwa uchambuzi
B) Visibility timeout fupi ili ujumbe mbaya ujaribiwe upya haraka zaidi
C) Mpangilio wa FIFO, ambao unatupa kiotomatiki ujumbe uliopotoka
D) Kipindi cha uhifadhi wa ujumbe cha dakika 1 ili ujumbe mbaya uishe haraka

**Swali 29** *(Domain 2 — Task 2.1)*
Brokereji inasindika matukio ya biashara kwa kila akaunti ya mteja. Matukio kwa akaunti ile ile lazima yasindikwe kwa mpangilio mkali na mara moja haswa, lakini matukio kwa akaunti tofauti yanaweza kusindikwa sambamba kwa upitishaji. Ni suluhu gani inayotimiza mahitaji haya?

A) SQS standard queue ikiwa na thread moja ya mtumiaji
B) SQS FIFO queue inayotumia kitambulisho cha akaunti ya mteja kama MessageGroupId, ambayo inahifadhi mpangilio ndani ya kila kikundi huku ikiruhusu usambamba katika vikundi
C) SNS standard topic ikiwa na kuchuja ujumbe kwa kitambulisho cha akaunti
D) SQS FIFO queue ikiwa na MessageGroupId moja kwa wateja wote

**Swali 30** *(Domain 2 — Task 2.1)*
Agizo linapowekwa, jukwaa la e-commerce lazima lizindue kwa wakati mmoja michakato mitatu huru: utengenezaji wa ankara, utimilizaji wa ghala, na uingizaji wa uchambuzi. Kila mchakato lazima upokee kila tukio la agizo, ulibuffer kwa udumu, na uusindike kwa kasi yake. Ni usanifu gani unaotimiza mahitaji haya?

A) SQS queue moja ikiwa na watumiaji watatu wanaopiga poll foleni ile ile
B) SNS topic inayosambaza kwa foleni tatu za SQS, moja iliyojiandikisha kwa kila mchakato
C) Vitendo vitatu vya Lambda vinavyozinduliwa kwa mfuatano na Step Functions
D) SNS topic ikiwa na usajili tatu wa barua pepe

**Swali 31** *(Domain 2 — Task 2.1)*
Wakati wa flash sale, kitendo cha Lambda kinachozinduliwa na API Gateway kinaanza kurudisha hitilafu za 429 za kupunguzwa kwa kasi huku vitendo vingine muhimu vya Lambda katika akaunti ile ile pia vinaanza kupunguzwa kasi. Akaunti iko kwenye quota yake ya chaguo-msingi ya uanzishaji wa wakati mmoja. Ni kitendo gani kinacholinda vitendo muhimu kutoka kunyimwa na kitendo cha sale?

A) Ongeza timeout ya kitendo cha sale kutoka sekunde 3 hadi kiwango cha juu cha dakika 15
B) Sanidi reserved concurrency kwenye vitendo muhimu (na kwa hiari weka kikomo kwa kitendo cha sale), ukihakikisha uanzishaji wa wakati mmoja uliojitolea kutoka kwa bwawa la akaunti
C) Wezesha provisioned concurrency kwenye kitendo cha sale, ambayo inainua quota ya akaunti nzima
D) Hamisha vitendo muhimu kwa usanidi wa kumbukumbu wa 10 GB

**Swali 32** *(Domain 2 — Task 2.1)*
Kampuni ya vyombo vya habari ina mtiririko wa kuchapisha video wenye hatua inayosubiri hadi siku 2 kwa msimamizi wa kibinadamu kuidhinisha maudhui kupitia zana ya nje kabla ya kuendelea. Mtiririko lazima uweze kukaguliwa, uendeshe kwa siku, na uanze tena haswa palipositishwa mara msimamizi anapojibu. Ni suluhu gani inayofaa ZAIDI?

A) Express Step Functions workflow ikiwa na hali ya Wait
B) Standard Step Functions workflow ikitumia mfumo wa callback: task token (waitForTaskToken) inatumwa kwa mfumo wa udhibiti, na mtiririko unaanza tena wakati SendTaskSuccess inaitwa
C) Kitendo cha Lambda kinacholala hadi msimamizi anaidhinisha
D) Sheria ya EventBridge ikiwa na ucheleweshaji wa ratiba wa siku 2

**Swali 33** *(Domain 2 — Task 2.1)*
Kampuni inaendesha mtiririko wa uingizaji wa IoT wa kiasi kikubwa unaotekeleza takriban utekelezaji 90,000 mfupi wa mtiririko kwa sekunde, kila moja ikikamilika kwa chini ya sekunde 5. Semantiki za utekelezaji wa mara-moja-haswa hazihitajiki, lakini gharama lazima ipunguzwe. Kando, mtiririko wa upatanishi wa kifedha wa kila mwezi unaendesha kwa saa 12 na unahitaji utekelezaji wa mara-moja-haswa ikiwa na historia kamili ya utekelezaji. Ni aina gani za Step Functions workflow zitumike?

A) Express workflows kwa mtiririko wa IoT; Standard workflows kwa upatanishi
B) Standard workflows kwa zote mbili
C) Express workflows kwa zote mbili, kwani Express inaunga mkono hadi mwaka mmoja wa utekelezaji
D) Standard workflows kwa mtiririko wa IoT; Express workflows kwa upatanishi

**Swali 34** *(Domain 2 — Task 2.2)*
Kampuni inakaribisha programu yake kuu ya wavuti kwenye ALB katika us-east-1 na nakala ya uokoaji isiyo amilifu katika us-west-2. Kampuni inataka Route 53 itume trafiki yote kwa us-east-1 na kuelekeza kiotomatiki watumiaji kwa us-west-2 tu wakati endpoint ya kuu inakuwa haina afya. Ni usanidi gani wa Route 53 unaotimiza hitaji hili?

A) Weighted routing ikiwa na uzito wa 50/50
B) Failover routing ikiwa na ukaguzi wa afya kwenye rekodi ya kuu na seti ya rekodi ya us-west-2 ikiwekwa kama ya pili
C) Latency-based routing kati ya Regions mbili
D) Geolocation routing ikiwa na rekodi ya chaguo-msingi inayoelekeza kwa us-west-2

**Swali 35** *(Domain 2 — Task 2.2)*
Auto Scaling group inaendesha seva za wavuti za EC2 nyuma ya Application Load Balancer katika Availability Zones tatu. ALB inaweka alama baadhi ya vipengele kuwa havina afya kwa sababu mchakato wa seva ya wavuti unaanguka, lakini Auto Scaling group kamwe haivibadilishi kwa sababu vipengele vya EC2 vyenyewe bado vinapita status checks. Mhandisi wa suluhu abadilishe nini?

A) Wezesha ufuatiliaji wa kina wa CloudWatch kwenye vipengele
B) Sanidi Auto Scaling group kutumia ELB health checks pamoja na EC2 status checks, ili vipengele vinavyoshindwa afya ya lengo la ALB visitishwe na kubadilishwa
C) Ongeza kipindi cha neema cha ukaguzi wa afya cha ASG
D) Badilisha ALB kwenda Network Load Balancer

**Swali 36** *(Domain 2 — Task 2.1)*
Kampuni ya biashara inahitaji kisambazaji cha mzigo kwa itifaki maalum ya TCP ambayo lazima ishughulikie mamilioni ya maombi kwa sekunde ikiwa na ucheleweshaji wa chini kabisa na kuonyesha anwani ya IP tuli kwa kila Availability Zone. Ni kisambazaji gani cha mzigo kampuni ichague?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Swali 37** *(Domain 2 — Task 2.2)*
Ni kauli gani MBILI kuhusu kujenga uhifadhi thabiti kwenye AWS ni sahihi? (Chagua MBILI.)

A) S3 Cross-Region Replication inanakili kwa nyuma vitu vyote vilivyokuwepo kabla ya unakili kusanidiwa, bila kitendo cha ziada
B) Madaraja ya uhifadhi ya Amazon EFS Standard yanahifadhi data kwa uzazi katika Availability Zones nyingi na yanaweza kupachikwa kwa wakati mmoja na vipengele katika AZ tofauti
C) S3 Cross-Region Replication inahitaji uwekaji matoleo uwezeshwe kwenye ndoo za chanzo na za marudio
D) Volumes za Amazon EFS zinaweza kuambatishwa kwa kipengele kimoja tu cha EC2 kwa wakati, kama EBS
E) Kuwezesha uwekaji matoleo wa S3 kunanakili kiotomatiki vitu kwa Region nyingine

---

## Sehemu ya 3 — Design High-Performing Architectures (Maswali 38–53)

**Swali 38** *(Domain 3 — Task 3.1)*
Kampuni ya uchambuzi wa vyombo vya habari inaendesha hifadhidata ya PostgreSQL kwenye Amazon RDS kwa kutumia volume ya EBS ya gp3. Mzigo mpya wa ripoti unahitaji IOPS 50,000 endelevu ikiwa na ucheleweshaji chini ya millisekunde na hakikisho la kudumu la 99.999%. Volume lazima iunge mkono hili kwa uthabiti bila kupasuka. Ni aina gani ya volume ya EBS ambayo mhandisi wa suluhu apaswa kupendekeza?

A) gp3 iliyotolewa na IOPS ya kiwango cha juu
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 ikiwa na ukubwa wa volume wa 16 TiB

**Swali 39** *(Domain 3 — Task 3.1)*
Kampuni ya utafiti wa jenomu inahitaji uhifadhi wa faili wa pamoja kwa nguzo ya kompyuta ya utendaji wa juu (HPC) inayotegemea Linux ya vipengele 500 vya EC2. Mzigo unahitaji ucheleweshaji chini ya millisekunde na mamia ya GB/s ya upitishaji wa jumla, na seti za data za ingizo zimewekwa katika Amazon S3. Ni huduma gani ya uhifadhi inayotimiza vizuri zaidi mahitaji haya?

A) Amazon EFS ikiwa na Max I/O performance mode
B) Amazon FSx for Windows File Server ikiwa na uhifadhi wa SSD
C) Amazon FSx for Lustre iliyounganishwa na ndoo ya S3
D) Amazon S3 inayofikiwa kupitia Mountpoint kwenye kila kipengele

**Swali 40** *(Domain 3 — Task 3.1)*
Kampuni inahamisha programu ya Windows ya ndani inayotegemea SMB file shares na orodha za udhibiti wa ufikiaji zilizounganishwa na Active Directory. Programu itaendesha kwenye vipengele vya EC2 Windows katika Availability Zones mbili na lazima iweke ruhusa zake zilizopo za NTFS. Ni huduma gani ya uhifadhi ya AWS ambayo mhandisi wa suluhu achague?

A) Amazon EFS ikiwa na ruhusa za POSIX
B) Amazon FSx for Windows File Server katika hali ya uwekaji wa Multi-AZ
C) Amazon S3 ikiwa na sera za ndoo zilizoramaniwa kwa vikundi vya AD
D) Amazon FSx for Lustre ikiwa na uhifadhi wa kudumu

**Swali 41** *(Domain 3 — Task 3.1)*
Kampuni ya utengenezaji wa video huko Singapore inapakia faili za picha ghafi za 40 GB kwenye ndoo ya S3 katika us-east-1 kutoka ofisi duniani kote. Upakiaji mara kwa mara unashindwa katikati kupitia intaneti ya umma, ukilazimisha kuanza upya kabisa, na nyakati za uhamishaji kwa ujumla ni za polepole. Ni mchanganyiko gani wa vitendo ambao mhandisi wa suluhu apaswa kupendekeza? (Chagua MBILI.)

A) Badilisha ndoo kwenda S3 One Zone-IA kuboresha upitishaji wa uandishi
B) Kabili ndoo na Application Load Balancer katika kila region
C) Wezesha S3 Cross-Region Replication kwa ndoo katika ap-southeast-1
D) Wezesha S3 Transfer Acceleration kwenye ndoo na upakie kupitia accelerated endpoint
E) Tumia multipart upload kwa faili kubwa

**Swali 42** *(Domain 3 — Task 3.1)*
Jukwaa la uzabuni wa wakati halisi linaendesha mzigo wa NoSQL kwenye EC2 unaohitaji ucheleweshaji wa chini kabisa wa uhifadhi kwa data ya muda ya scratch. Data inazalishwa upya wakati wa kuanza na haihitaji kuokoka kusimama au kusitishwa kwa kipengele. Ni chaguo gani la uhifadhi linalotoa utendaji wa juu zaidi kwa matumizi haya?

A) io2 EBS volume ikiwa na IOPS 64,000 iliyotolewa
B) Instance store (NVMe SSD) volumes kwenye kipengele kilichoboreshwa kwa uhifadhi
C) Amazon EFS katika General Purpose mode
D) gp3 EBS volume ikiwa na upitishaji wa kiwango cha juu uliotolewa

**Swali 43** *(Domain 3 — Task 3.3)*
Kampuni ya michezo inahifadhi data ya kipindi cha mchezaji katika jedwali la DynamoDB ikiwa na partition key `game_id`. Kuna michezo 12 maarufu tu, na jedwali linakumbwa na kupunguzwa kwa kasi kwenye partition chache huku uwezo uliotumiwa kwa ujumla uko chini sana ya uwezo uliotolewa. Mhandisi wa suluhu apendekeze nini?

A) Badilisha jedwali kwenda provisioned capacity ikiwa na auto scaling
B) Tumia partition key ya cardinality ya juu, kama vile mchanganyiko wa game_id na player_id
C) Unda local secondary index kwenye player_id
D) Wezesha DynamoDB Streams kueneza uandishi katika partition

**Swali 44** *(Domain 3 — Task 3.3)*
Tovuti ya e-commerce inahifadhi data ya katalogi ya bidhaa katika DynamoDB. Trafiki ya usomaji ni nzito sana ya usomaji ikiwa na vitu vile vile vinaombwa mamilioni ya mara kwa siku, na timu inahitaji ucheleweshaji wa usomaji wa mikrosekunde bila kuandika upya wito wa API wa DynamoDB wa programu. Mhandisi wa suluhu apendekeze nini?

A) Peleka Amazon ElastiCache for Redis na ubadilishe programu kukagua cache kwanza
B) Ongeza DynamoDB Accelerator (DAX) mbele ya jedwali
C) Unda global secondary index kusambaza usomaji
D) Wezesha DynamoDB Global Tables katika region ya pili

**Swali 45** *(Domain 3 — Task 3.3)*
Kampuni ya usafirishaji ina jedwali la DynamoDB katika uzalishaji linalohitaji mfumo mpya wa hoja: kuhoji usafirishaji kwa `carrier_id` na kupanga kwa `delivery_date`, ikiwa na upitishaji wake uliotolewa ili hoja mpya za uchambuzi zisiathiri programu kuu. Jedwali tayari lipo na lina trafiki ya moja kwa moja. Ni suluhu gani inayotimiza mahitaji haya?

A) Unda local secondary index ikiwa na carrier_id kama sort key
B) Unda global secondary index ikiwa na carrier_id kama partition key na delivery_date kama sort key
C) Unda upya jedwali ikiwa na composite primary key ya carrier_id na delivery_date
D) Wezesha DynamoDB Stream na uhoji stream kwa carrier_id

**Swali 46** *(Domain 3 — Task 3.3)*
Huduma ya usimamizi wa vipindi inahifadhi vipindi vya watumiaji katika DynamoDB. Vipindi vinakuwa visivyofaa baada ya saa 24, na timu inataka vitu vilivyoisha viondolewe kiotomatiki bila gharama ya ziada. Mhandisi wa suluhu atekeleze nini?

A) Kitendo cha Lambda cha ratiba kinachochanganua jedwali kila saa na kufuta vitu vya zamani
B) DynamoDB Time to Live (TTL) ikiwa na sifa ya alama ya wakati ya kuisha kwenye kila kitu
C) Sera ya mzunguko wa maisha kwenye jedwali la DynamoDB
D) DynamoDB Streams ikiwa na kichujio cha kuondoa vitu vya zaidi ya saa 24

**Swali 47** *(Domain 3 — Task 3.3)*
Programu bila seva inatumia vitendo vya Lambda vinavyounganisha na hifadhidata ya Amazon RDS for MySQL. Wakati wa vilele vya trafiki, mamia ya uanzishaji wa Lambda wa wakati mmoja yanachosha kikomo cha miunganisho cha hifadhidata, na kusababisha hitilafu. Ni suluhu gani inayoshughulikia hili ikiwa na mabadiliko madogo zaidi ya programu?

A) Ongeza ukubwa wa kipengele cha RDS kuinua max_connections
B) Weka Amazon RDS Proxy kati ya vitendo vya Lambda na hifadhidata
C) Hamisha hifadhidata kwenda DynamoDB
D) Sanidi reserved concurrency ya Lambda ya 10

**Swali 48** *(Domain 3 — Task 3.3)*
Tovuti ya habari za kifedha inatumia Amazon Aurora MySQL. Trafiki ya usomaji inapasuka mara 20 wakati wa saa za soko na kipengele cha kuu kimezuiwa na CPU kikihudumia hoja za SELECT. Uandishi ni wa kawaida. Ni njia gani INAYOFAA ZAIDI kiendeshaji ya kupanua usomaji?

A) Ongeza Aurora Replicas na uelekeze trafiki ya usomaji kwa cluster reader endpoint ikiwa na auto scaling
B) Unda Multi-AZ standby na utume usomaji kwa standby
C) Gawanya hifadhidata katika nguzo nyingi za Aurora
D) Wezesha Aurora Backtrack kupunguza usomaji

**Swali 49** *(Domain 3 — Task 3.4)*
Kampuni ya michezo ya wachezaji wengi inaendesha programu nyeti kwa ucheleweshaji kwa kutumia itifaki ya UDP kwenye Network Load Balancers katika AWS Regions mbili. Wachezaji duniani kote wanahitaji anwani za IP tuli kwa orodha-ruhusa na kuhamia kwa region kwa haraka. Ni huduma gani ambayo mhandisi wa suluhu achague?

A) Amazon CloudFront ikiwa na vyanzo viwili vya kawaida
B) AWS Global Accelerator ikiwa na endpoint groups katika regions zote mbili
C) Amazon Route 53 ikiwa na latency-based routing
D) Application Load Balancer ikiwa na cross-zone load balancing

**Swali 50** *(Domain 3 — Task 3.4)*
Kampuni ya utiririshaji lazima itimize sheria za leseni ya maudhui: watumiaji huko Ujerumani lazima daima wahudumiwe kutoka kwa uwekaji wa eu-central-1, na watumiaji huko Ufaransa kutoka kwa uwekaji wa eu-west-3, bila kujali endpoint ipi inatoa ucheleweshaji mdogo. Ni sera gani ya upitishaji ya Route 53 itumike?

A) Latency-based routing
B) Geolocation routing
C) Geoproximity routing ikiwa na bias chanya kwenye eu-central-1
D) Weighted routing ikiwa na uzito wa 50/50

**Swali 51** *(Domain 3 — Task 3.2)*
Mhandisi wa suluhu anapeleka mzigo wa HPC uliofungwa kwa nguvu unaotumia MPI na unaohitaji ucheleweshaji wa mtandao wa chini kabisa unaowezekana na utendaji wa juu zaidi wa pakiti-kwa-sekunde kati ya vipengele 32 vya EC2. Ni mkakati gani wa uwekaji utumike?

A) Spread placement group katika Availability Zones tatu
B) Partition placement group ikiwa na partition 7
C) Cluster placement group katika Availability Zone moja
D) Zindua vipengele katika subnet tofauti ikiwa na enhanced networking

**Swali 52** *(Domain 3 — Task 3.5)*
Kampuni ya IoT inaingiza data ya clickstream ambayo lazima itolewe kwa Amazon S3 karibu wakati halisi kwa uchambuzi. Timu inataka suluhu inayosimamiwa kikamilifu bila programu za watumiaji za kuandika, bila usimamizi wa shard, na ikiwa na ubufferishaji wa rekodi na ubadilishaji wa fomati kwenda Parquet uliojengwa ndani. Ni huduma gani watumie?

A) Amazon Kinesis Data Streams ikiwa na mtumiaji wa Lambda
B) Amazon Data Firehose (zamani Kinesis Data Firehose) ikiwa na marudio ya S3
C) Amazon SQS ikiwa na kundi la EC2 pollers
D) Amazon MSK ikiwa na Kafka Connect sink ya kawaida

**Swali 53** *(Domain 3 — Task 3.5)*
Kampuni inahifadhi logi za programu kama faili za JSON zilizobanwa katika Amazon S3 na inataka wachambuzi waendeshe hoja za SQL za papo hapo dhidi yake bila kutoa seva au kupakia data kuingia hifadhidata. Schema inapaswa kugunduliwa na kuorodheshwa kiotomatiki. Ni mchanganyiko gani ambao mhandisi wa suluhu apaswa kupendekeza?

A) Amazon Redshift ikiwa na amri za COPY na uburudishaji wa ratiba
B) AWS Glue crawlers kujaza Data Catalog na Amazon Athena kwa hoja za SQL
C) Amazon EMR ikiwa na nguzo ya Presto ya muda mrefu
D) Amazon RDS for PostgreSQL ikiwa na kiendelezi cha aws_s3

---

## Sehemu ya 4 — Design Cost-Optimized Architectures (Maswali 54–65)

**Swali 54** *(Domain 4 — Task 4.2)*
Taasisi ya utafiti inaendesha simulizi za bechi za usiku kwenye EC2 zinazochukua takriban dakika 90, zinazohifadhi checkpoint ya maendeleo kwa Amazon S3 kila dakika 5, na zinaweza kuanzishwa upya kutoka checkpoint ya mwisho wakati wowote. Taasisi inataka gharama ya kompyuta ya chini kabisa inayowezekana. Ni chaguo gani la ununuzi ambalo mhandisi wa suluhu apaswa kupendekeza?

A) On-Demand Instances katika AZ moja
B) Standard Reserved Instances ikiwa na muda wa miaka 3
C) Spot Instances zinazotumia Spot Fleet iliyotofautishwa katika aina nyingi za vipengele na AZ
D) Compute Savings Plan iliyopimwa kwa kilele cha mzigo wa bechi

**Swali 55** *(Domain 4 — Task 4.2)*
Kampuni ya SaaS ina matumizi ya kompyuta ya msingi thabiti lakini inatarajia kuhamisha mizigo kati ya EC2, AWS Fargate, na AWS Lambda kwa miaka mitatu ijayo inapoboresha. Inataka punguzo linalotegemea kujitolea ambalo linatumika kiotomatiki katika huduma zote tatu za kompyuta na regions zote. Ni chaguo gani ambalo mhandisi wa suluhu apaswa kupendekeza?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Swali 56** *(Domain 4 — Task 4.2)*
Kampuni ilinunua Standard Reserved Instances za miaka 3 kwa Amazon RDS na kwa Amazon EC2. Baada ya kujengwa upya, haihitaji tena uhifadhi wowote. Timu ya fedha inauliza ni uhifadhi gani unaweza kuuzwa ili kurejesha gharama. Mhandisi wa suluhu awaambie nini?

A) EC2 na RDS Reserved Instances zote zinaweza kuuzwa kwenye Reserved Instance Marketplace
B) EC2 Reserved Instances pekee zinaweza kuuzwa kwenye Reserved Instance Marketplace; RDS RIs haziwezi kuuzwa tena
C) RDS Reserved Instances pekee zinaweza kuuzwa, kwa sababu uhifadhi wa hifadhidata unaweza kuhamishwa
D) Hakuna inayoweza kuuzwa; Reserved Instances hazirudishwi pesa na haziwezi kuhamishwa katika visa vyote

**Swali 57** *(Domain 4 — Task 4.2)*
Timu ya wasanidi inaendesha usindikaji wa data unaovumilia hitilafu wa vyombo kwenye Amazon ECS ikiwa na uwezo wa EC2 Spot. Wanahitaji wafanyakazi watiririke kwa upole na kuhifadhi checkpoint kabla ya kurejeshwa. AWS inatoa onyo la mapema kiasi gani kabla ya Spot Instance kukatizwa?

A) Hakuna onyo linalotolewa
B) Taarifa ya kukatizwa ya dakika 2
C) Taarifa ya kukatizwa ya dakika 15
D) Dirisha la kurekebisha la saa 24

**Swali 58** *(Domain 4 — Task 4.1)*
Kumbukumbu ya afya inahifadhi rekodi za utii katika Amazon S3 ambazo zinafikiwa mara chache lakini, zinapoitishwa kortini, lazima ziweze kupatikana ndani ya dakika 5. Rekodi zinawekwa kwa miaka 7 na gharama ya uhifadhi lazima ipunguzwe. Ni daraja gani la uhifadhi linalotimiza mahitaji haya?

A) S3 Glacier Deep Archive ikiwa na Standard retrieval
B) S3 Glacier Flexible Retrieval ikiwa na Expedited retrievals zinapohitajika
C) S3 Glacier Flexible Retrieval ikiwa na Bulk retrievals
D) S3 Standard-IA

**Swali 59** *(Domain 4 — Task 4.1)*
Startup ya kushiriki picha inahifadhi picha za thumbnail zinazoweza kuzalishwa upya kwa urahisi ambazo zinafikiwa mara chache. Timu inataka chaguo la gharama ndogo zaidi la ufikiaji-mara-chache na inakubali kwamba upotezaji wa Availability Zone moja unaweza kuhitaji kuzalisha upya thumbnails kutoka kwa asili. Ni daraja gani la uhifadhi litumike?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Swali 60** *(Domain 4 — Task 4.1)*
Kampuni ina ndoo ya S3 yenye mamilioni ya vitu ambavyo mifumo yao ya ufikiaji haijulikani na inabadilika bila kutabirika. Mhandisi wa suluhu anatathmini S3 Intelligent-Tiering. Ni kauli gani MBILI kuhusu Intelligent-Tiering ni sahihi? (Chagua MBILI.)

A) Inatoza ada ndogo ya ufuatiliaji na otomatiki kwa kila kitu kwa vitu inavyofuatilia
B) Inatoza ada za upataji kila wakati kitu kinaporejea kwa Frequent Access tier
C) Vitu vidogo kuliko 128 KB havifuatiliwi au kuwekwa daraja kiotomatiki na vinatozwa kwa kiwango cha Frequent Access tier
D) Inanakili vitu kwa region ya pili kiotomatiki
E) Inahitaji muda wa chini wa uhifadhi wa siku 90 kwa kila kitu

**Swali 61** *(Domain 4 — Task 4.1)*
Timu ya uchambuzi mara kwa mara inakatiza upakiaji mkubwa wa multipart kwa ndoo ya ziwa la data ya S3, na AWS Cost Explorer inaonyesha malipo ya uhifadhi yanaongezeka licha ya idadi ya vitu vinavyoonekana vya ndoo kuwa tambarare. Ni suluhisho gani INAYOFAA ZAIDI kigharama?

A) Wezesha S3 Versioning kufuatilia sehemu zilizoachwa
B) Ongeza sheria ya mzunguko wa maisha inayokatiza upakiaji wa multipart usiokamilika baada ya idadi maalum ya siku
C) Hamisha ndoo kwenda S3 One Zone-IA
D) Washa S3 Transfer Acceleration kumaliza upakiaji haraka zaidi

**Swali 62** *(Domain 4 — Task 4.1)*
Kundi la EC2 la kampuni linatumia mamia ya volumes za EBS za gp2 zilizopimwa kubwa kwa lengo tu la kupata IOPS ya msingi. Mapitio ya matumizi yanaonyesha IOPS inahitajika lakini sehemu kubwa ya uwezo haihitajiki. Mhandisi wa suluhu afanye nini kupunguza gharama ya uhifadhi bila kupoteza utendaji?

A) Hamisha volumes kwenda io2 na utoe IOPS ile ile
B) Hamisha volumes kwenda gp3, sahihisha ukubwa wa uwezo, na utoe IOPS kwa kujitegemea
C) Geuza volumes kuwa st1 throughput-optimized HDD
D) Piga picha za papo hapo za volumes kila siku na ufute za asili

**Swali 63** *(Domain 4 — Task 4.4)*
Mtiririko wa data katika subnet za faragha unahamisha 60 TB kwa mwezi kutoka kwa vipengele vya EC2 kwenda Amazon S3 katika region ile ile kupitia NAT gateway, ukizalisha malipo makubwa ya usindikaji wa data. Ni mabadiliko gani INAYOFAA ZAIDI kigharama?

A) Badilisha NAT gateway na NAT instance kwenye kipengele kikubwa cha EC2
B) Unda gateway VPC endpoint kwa S3 na uelekeze trafiki kupitia hilo
C) Unda interface VPC endpoint (PrivateLink) kwa S3
D) Hamisha vipengele vya EC2 kwa subnet za umma ikiwa na anwani za public IPv4

**Swali 64** *(Domain 4 — Task 4.4)*
Bili ya kila mwezi ya startup inaonyesha malipo yasiyotarajiwa kwa anwani za public IPv4 zinazotumiwa katika makumi ya vipengele vya EC2 ambavyo vinaita tu huduma nyingine za AWS ndani ya VPC. Timu ya fedha pia inataka tahadhari kabla matumizi ya jumla ya mwezi ujao kuzidi kizingiti. Ni mchanganyiko gani wa vitendo ambao mhandisi wa suluhu apaswa kuchukua? (Chagua MBILI.)

A) Badilisha public IPv4 na Elastic IPs kwenye kila kipengele, ambazo ni za bure daima zinapoambatishwa
B) Ondoa anwani za public IPv4 na utumie muunganisho wa faragha (VPC endpoints/NAT kama inavyohitajika), kwa kuwa AWS inatoza kwa anwani za public IPv4 zinazotumiwa
C) Tumia AWS Compute Optimizer kuzuia matumizi juu ya kizingiti
D) Wezesha AWS Shield Advanced kuweka kikomo cha matumizi ya kila mwezi
E) Unda AWS Budgets cost budget ikiwa na kizingiti cha tahadhari na arifa ya barua pepe

**Swali 65** *(Domain 4 — Task 4.3)*
Mazingira ya usanidi yanatumia nguzo ya Amazon Aurora PostgreSQL ambayo haitumiki usiku na wikendi lakini lazima iamke kiotomatiki wakati wasanidi wanaunganisha, bila uingiliaji wa mkono au kubadilisha ukubwa wa kipengele. Gharama inapaswa kushuka karibu sifuri kwa kompyuta wakati haitumiki. Ni suluhu gani inayotimiza mahitaji haya?

A) Aurora Serverless v2 iliyosanidiwa na uwezo wa chini wa ACU 0 ili isimame kiotomatiki inapokuwa haitumiki
B) Nguzo ya Aurora iliyotolewa iliyosimamishwa na kitendo cha Lambda cha ratiba kila usiku
C) Aurora global database ikiwa na nguzo ya pili isiyo na kichwa
D) Aurora iliyotolewa ikiwa na vipengele viwili vya msomaji vilivyopunguzwa usiku

---

## Ufunguo wa Majibu

### Sehemu ya 1 — Maswali 1–20

**1. Jibu: B** — SCP kamwe hazitumiki kwa akaunti ya usimamizi ya shirika, hivyo principals zake hazitathiriwi na vikwazo vya Region. *Kwa nini si nyingine:* A — SCP zinarithi kupitia OU zilizokitwa; C — Allow za IAM haziwezi kupindua SCP Deny katika akaunti za wanachama; D — SCP zinatumika mara moja kwa akaunti zote za sasa na za baadaye chini ya pointi ya kuambatisha.

**2. Jibu: C** — Permissions boundary iliyotekelezwa kama condition kwenye vitendo vya uundaji wa jukumu inaweka kikomo cha ruhusa za juu za jukumu lolote wasanidi wanaloliunda, ikizuia kupanda kwa upendeleo huku ikihifadhi kujihudumia. *Kwa nini si nyingine:* A — mapitio ya mkono yanaongeza gharama ya uendeshaji na yanaondoa kujihudumia; B — kukataa iam:CreateRole kunazuia mtiririko halali; D — tahadhari za CloudTrail ni za kugundua, si za kuzuia.

**3. Jibu: B** — ExternalId iliyofafanuliwa na mteja iliyothibitishwa katika condition ya trust policy inahakikisha mtoa huduma wa SaaS anachukua jukumu kwa niaba ya mteja sahihi pekee, ikipunguza tatizo la confused deputy. *Kwa nini si nyingine:* A — MFA haifai kwa uchukuaji wa kiotomatiki wa huduma-kwa-huduma na haishughulikii mkanganyiko wa deputy; C — kusimba ARN (ambayo si siri) hakutatui chochote; D — funguo za mtumiaji wa IAM za muda mrefu si salama kuliko majukumu.

**4. Jibu: B** — IAM Identity Center inaunganisha mara moja na Entra ID na inapeana kwa kati permission sets katika akaunti zote za shirika kupitia portal moja ya ufikiaji. *Kwa nini si nyingine:* A — watumiaji wa IAM kwa kila akaunti ni gharama haswa ya kuepuka; C — Cognito ni kwa utambulisho wa programu (wateja), si ufikiaji wa wafanyakazi kwa akaunti za AWS; D — usanidi wa SAML wa mkono kwa kila akaunti unafanya kazi lakini una gharama ya juu zaidi ya uendeshaji.

**5. Jibu: A** — User pools zinashughulikia uthibitishaji (kuingia kwa barua pepe/kijamii); identity pools zinabadilishana tokeni zinazotokana kwa vitambulisho vya muda vya AWS vilivyopimwa na majukumu ya IAM kufikia S3. *Kwa nini si nyingine:* B — inageuza madhumuni ya huduma mbili; C — IAM Identity Center ni kwa watumiaji wa wafanyakazi, si wateja wa programu; D — tokeni za user pool (JWT) hazitoi ufikiaji wa huduma za AWS zenyewe.

**6. Jibu: B** — Customer managed key inatoa udhibiti kamili wa key policy, uingiaji wa matumizi, na kuzima, na inaunga mkono mzunguko wa kiotomatiki (kila mwaka kwa chaguo-msingi). *Kwa nini si nyingine:* A — AWS managed keys hazikuruhusu kuhariri key policy au kuzima ufunguo; C — AWS owned keys hazionekani kwa mteja kabisa; D — imported (BYOK) key material haiungi mkono mzunguko wa kiotomatiki.

**7. Jibu: B** — Usimbaji wa bahasha: KMS inazalisha data key; data inasimbwa kwa ndani na plaintext data key, ambayo inatupwa, huku nakala iliyosimbwa na KMS ya data key inahifadhiwa na ciphertext. *Kwa nini si nyingine:* A na C — KMS kamwe haisimbi mizigo mikubwa moja kwa moja au kwa kutiririsha; D — funguo zilizowekwa moja kwa moja kwenye nambuli ni mfumo mbaya na si usimbaji wa bahasha.

**8. Jibu: C** — Mkakati wa watumiaji-wanaobadilishana wa Secrets Manager unadumisha vitambulisho viwili na kuvizungusha kwa zamu, hivyo miunganisho iliyopo inayotumia kitambulisho cha awali inaendelea kufanya kazi wakati wa mzunguko. *Kwa nini si nyingine:* A — Parameter Store haina mzunguko uliojengwa ndani; ungejenga yote mwenyewe; B — mzunguko wa mtumiaji-mmoja unabatilisha nenosiri la zamani mara moja, ukihatarisha kushindwa kwa muunganisho; D — mzunguko wa KMS unazungusha key material ya usimbaji, si manenosiri ya hifadhidata.

**9. Jibu: C** — SSE-C inamruhusu mteja kutoa ufunguo wa usimbaji kwa kila ombi; AWS inautumia katika kumbukumbu kwa operesheni na kamwe haihifadhi. *Kwa nini si nyingine:* A — funguo za SSE-S3 zinasimamiwa kikamilifu na AWS; B — funguo za SSE-KMS zimehifadhiwa katika AWS KMS; D — aws/s3 ni AWS-managed KMS key na si ya upande wa mteja kabisa.

**10. Jibu: B** — Object Lock compliance mode inazuia kufuta au kuandika upya na mtumiaji yeyote, ikiwa ni pamoja na root, hadi uhifadhi uishe, na Object Lock inahitaji uwekaji matoleo. *Kwa nini si nyingine:* A — governance mode inaweza kupitwa na watumiaji wenye s3:BypassGovernanceRetention; C — sera ya ndoo inaweza kubadilishwa au kuondolewa na root user; D — kuisha kwa mzunguko wa maisha hakuzuii kufuta wakati wa kipindi.

**11. Jibu: B** — NACL ni stateless, hivyo trafiki ya jibu kwa ephemeral source ports za wateja lazima iruhusiwe wazi kutoka. *Kwa nini si nyingine:* A — NACL ni stateless, si stateful; C — security groups ni stateful, hivyo trafiki ya kurudi ni kiotomatiki; D — 0.0.0.0/0 ni halali kabisa katika sheria za NACL.

**12. Jibu: A, B** — Security groups ni stateful (trafiki ya kurudi inaruhusiwa kiotomatiki), na NACL zinashughulikia sheria zenye namba kwa mpangilio na zinaunga mkono Deny. *Kwa nini si nyingine:* C — security groups zinaunga mkono sheria za Allow pekee; D — NACL zinaambatishwa kwa subnet, si ENIs (security groups zinaambatishwa kwa ENIs); E — sheria za security group zinatathminiwa zote pamoja bila mpangilio.

**13. Jibu: B** — Shield Advanced inatoa Shield Response Team, ulinzi wa gharama wa DDoS, na uonekano/uchunguzi wa mashambulizi kwa rasilimali zilizolindwa kama CloudFront na ALB. *Kwa nini si nyingine:* A — Shield Standard ni kiotomatiki lakini haijumuishi ufikiaji wa SRT au ulinzi wa gharama; C — WAF inashughulikia mifumo ya maombi ya layer-7, si seti kamili ya mahitaji; D — GuardDuty ni kugundua vitisho, si ulinzi wa DDoS.

**14. Jibu: B** — AWS WAF kwenye ALB ikiwa na kikundi cha sheria zinazosimamiwa za SQLi pamoja na sheria inayotegemea kasi inazuia mifumo yote miwili ya shambulizi bila mabadiliko ya nambuli ya programu. *Kwa nini si nyingine:* A — juhudi ya juu ya usanidi; C — Shield Standard inafunika mafuriko ya L3/L4, si SQL injection; D — security groups haziwezi kukagua maudhui ya ombi.

**15. Jibu: B** — GuardDuty = kugundua vitisho kutoka kwa logi na akili ya vitisho; Macie = ugunduzi wa data nyeti (PII) katika S3; Inspector = uchanganuzi wa udhaifu (CVE) wa EC2, picha za ECR, na Lambda. *Kwa nini si nyingine:* A, C, D — kila moja inachanganya angalau mioanisho miwili ya huduma-kwa-madhumuni.

**16. Jibu: B** — Gateway endpoints zipo kwa S3 na DynamoDB haswa, zinaweka trafiki kwenye mtandao wa AWS, na hazina malipo ya saa au usindikaji wa data. *Kwa nini si nyingine:* A — NAT gateway inapitisha kupitia nafasi ya IP ya umma na inatoza kwa saa/kwa GB; C — interface endpoints zinasababisha malipo ya saa na data, hivyo si gharama ndogo zaidi; D — internet gateway inatuma trafiki kupitia intaneti ya umma.

**17. Jibu: A** — IMDSv2 inahitaji session token iliyopatikana kupitia ombi la PUT, ambalo vekta za kawaida za SSRF haziwezi kufanya; kutekeleza HttpTokens=required kunazuia wizi wa vitambulisho wa IMDSv1. *Kwa nini si nyingine:* B — wakala na SDK nyingi zinahitaji IMDS kihalali; C — NACL haziathiri trafiki ya link-local kati ya kipengele na endpoint yake ya metadata; D — vitambulisho tuli katika faili ni mbaya zaidi kuliko vitambulisho vya jukumu.

**18. Jibu: C** — Vigezo vya kawaida vya Parameter Store ni vya bure na vinafaa kwa usanidi wa plaintext; Secrets Manager inaongeza mzunguko uliojengwa ndani kwa manenosiri 5 pekee, ikipunguza gharama. *Kwa nini si nyingine:* A — kulipia bei ya kwa-siri ya Secrets Manager kwa thamani 200 za usanidi wa plain ni upotevu; B — Parameter Store pekee haina mzunguko wa asili kwa manenosiri; D — Parameter Store haina mzunguko wa kiotomatiki uliojengwa ndani, hivyo chaguo hili linadai uwezo usiokuwepo.

**19. Jibu: B** — S3 Bucket Keys zinaruhusu S3 kuzalisha data key ya kiwango cha ndoo yenye muda mdogo kutoka kwa KMS key, ikipunguza kwa kiasi kikubwa maombi ya KMS kwa kila kitu (na gharama) huku ikibaki SSE-KMS. *Kwa nini si nyingine:* A — SSE-S3 inaacha hitaji la KMS; C — masafa ya mzunguko hayaathiri kiasi cha API kwa kila ombi; D — imported key material haibadilishi idadi ya maombi.

**20. Jibu: B, D** — Deny ya wazi daima inashinda Allow yoyote katika tathmini ya sera, na permissions boundaries zinaweka kikomo (kamwe hazitoi) ruhusa. *Kwa nini si nyingine:* A — SCP ni guardrails zinazoweka kikomo cha ruhusa zinazopatikana; hazitoi chochote; C — resource-based policies mara kwa mara zinatoa ufikiaji wa toka akaunti hadi akaunti zenyewe; E — IAM inakuwa chaguo-msingi kwa kukataa isiyo wazi wakati hakuna kinachoruhusu kitendo.

### Sehemu ya 2 — Maswali 21–37

**21. Jibu: C** — Multi-AZ inatoa kuhamia kiotomatiki kwa hitilafu ya AZ; read replicas zinachukua trafiki ya usomaji wa ripoti — vipengele viwili kwa matatizo mawili tofauti. *Kwa nini si nyingine:* A — standby ya jadi ya Multi-AZ haiwezi kuhudumia usomaji; B — kupandisha replica ni kwa mkono (au kwa script) na replicas pekee hazitoi kuhamia kiotomatiki kwa HA; D — kipengele kikubwa cha single-AZ kinashindwa mahitaji yote mawili ya uthabiti wa AZ.

**22. Jibu: B** — Uwekaji wa Multi-AZ DB cluster unaendesha mwandishi mmoja na standby mbili zinazoweza kusomwa katika AZ tatu, ikiwa na reader endpoint, hivyo uwezo wa standby unahudumia usomaji huku bado ukiunga mkono kuhamia kiotomatiki kwa haraka. *Kwa nini si nyingine:* A — standby moja katika uwekaji wa instance haihudumii trafiki yoyote; C — read replicas hazitoi kuhamia kiotomatiki kunakosimamiwa na hifadhidata za RDS hazisambazwi mzigo kupitia ALB; D — Single-AZ haina kuhamia kabisa.

**23. Jibu: B** — Unakili wa Aurora Global Database ni asiyo sambamba katika tabaka la uhifadhi ikiwa na ucheleweshaji wa kawaida chini ya sekunde, hivyo RPO ya toka Region hadi Region ni karibu sifuri lakini kamwe haiwezi kuhakikishwa kuwa sifuri haswa. *Kwa nini si nyingine:* A — unakili si sambamba katika Regions; C — write forwarding inapitisha uandishi kwa kuu; haibadilishi semantiki za unakili; D — ucheleweshaji wa unakili kwa kawaida ni chini ya sekunde, si ratiba ya dakika 5.

**24. Jibu: B** — Recovery Time Objective ni muda wa juu unaovumilika wa kutokufanya kazi (saa 4); Recovery Point Objective ni dirisha la juu linalovumilika la upotezaji wa data (dakika 15). *Kwa nini si nyingine:* A — inageuza fasili; C — MTBF/MTTR ni takwimu za kuaminika, si malengo ya DR; D — SLA ni ahadi ya kimkataba, si metriki ya upotezaji wa data.

**25. Jibu: B** — Pilot light inaweka data ikinakiliwa kwa kuendelea na rasilimali za msingi zimetolewa lakini zimezimwa, ikitoa RTO ya dakika kadhaa kwa gharama ndogo — mlinganisho haswa. *Kwa nini si nyingine:* A — backup and restore haina unakili wa moja kwa moja na RTO ndefu zaidi; C — warm standby inaweka stack ikiendesha, ikigharimu zaidi ya inavyohitajika; D — active/active ni ya gharama kubwa zaidi na inazidi hitaji kwa mbali.

**26. Jibu: C, E** — Warm standby ni nakala kamili iliyopunguzwa inayoendesha daima; multi-site active/active inahudumia kutoka Regions nyingi ikiwa na RTO karibu sifuri kwa gharama ya juu zaidi. *Kwa nini si nyingine:* A — backup and restore inafafanuliwa na kutoendesha rasilimali awali; B — backup and restore ina RTO ya juu zaidi (mbaya zaidi); D — pilot light imetolewa-lakini-imezimwa, si uwezo kamili unaohudumia trafiki.

**27. Jibu: B** — Wakati visibility timeout ya sekunde 30 inapoisha katikati ya usindikaji, ujumbe unaonekana tena na mtumiaji mwingine anauusindika tena; weka visibility timeout ndefu kuliko muda wa juu wa usindikaji (k.m. mara 6 kama mbinu bora). *Kwa nini si nyingine:* A — FIFO dhidi ya standard si sababu; C — long polling inaathiri ufanisi wa upokeaji-tupu, si nakala; D — kipindi cha uhifadhi kinatawala muda ujumbe unadumu, si urejeshaji.

**28. Jibu: A** — Redrive policy ikiwa na maxReceiveCount inahamisha ujumbe unaoshindwa mara kwa mara ("poison pill") kwa dead-letter queue kwa uchambuzi wa nje ya mtandao, ikisimamisha kitanzi cha urejeshaji usio na mwisho. *Kwa nini si nyingine:* B — visibility timeout fupi inafanya kitanzi kuzunguka haraka zaidi; C — FIFO haitupi ujumbe uliopotoka; D — uhifadhi wa dakika 1 ungeisha pia ujumbe halali.

**29. Jibu: B** — FIFO queues zinahakikisha usindikaji wa mara-moja-haswa na mpangilio mkali ndani ya MessageGroupId; kutumia kitambulisho cha akaunti kama group ID kunatoa mpangilio kwa kila akaunti ikiwa na usambamba katika akaunti (na hali ya FIFO ya upitishaji wa juu inaweza kupanua zaidi). *Kwa nini si nyingine:* A — standard queues haziwezi kuhakikisha mpangilio au mara-moja-haswa; C — SNS haitoi hakikisho la mpangilio au usindikaji wa mara-moja-haswa kwa mfumo huu; D — group ID moja inafanya kila kitu kuwa cha mfuatano, ikiharibu upitishaji.

**30. Jibu: B** — Fan-out ya SNS-kwa-SQS inatoa kila tukio kwa kila foleni, ambapo kila mtumiaji anapata ubufferishaji wa kudumu na kasi huru ya usindikaji. *Kwa nini si nyingine:* A — watumiaji watatu kwenye foleni moja wanagawanya ujumbe; kila ujumbe unaenda kwa mtumiaji mmoja tu; C — uanzishaji wa mfuatano si usindikaji wa sambamba huru wenye ubufferishaji; D — usajili wa barua pepe unatoa kwa wanadamu, si buffers za programu za kudumu.

**31. Jibu: B** — Reserved concurrency inachonga uanzishaji wa wakati mmoja uliojitolea kwa vitendo muhimu (na kuweka kikomo kwa kitendo cha sale kunaweka mipaka ya eneo lake la mlipuko), ikizuia kitendo kimoja kuchosha bwawa la pamoja la akaunti. *Kwa nini si nyingine:* A — timeout ndefu inashikilia nafasi za uanzishaji wa wakati mmoja kwa muda mrefu, ikifanya kupunguzwa kwa kasi kuwa mbaya zaidi; C — provisioned concurrency inawasha mazingira awali lakini haiinui quota ya uanzishaji wa wakati mmoja ya akaunti; D — ukubwa wa kumbukumbu hauathiri vikomo vya uanzishaji wa wakati mmoja.

**32. Jibu: B** — Standard workflows zinaendesha hadi mwaka mmoja na mfumo wa callback wa waitForTaskToken unasimamisha utekelezaji bila gharama ya kompyuta hadi SendTaskSuccess/SendTaskFailure inarudisha tokeni. *Kwa nini si nyingine:* A — Express workflows zinafika kikomo cha dakika 5; C — Lambda inaweza kuendesha kwa muda wa juu wa dakika 15 na kulala ni upotevu wa pesa; D — ratiba za EventBridge zinaweza kuzindua matukio lakini haziwezi kusimamisha na kuanza tena hali ya mtiririko.

**33. Jibu: A** — Express workflows zimejengwa kwa utekelezaji wa kasi ya juu sana, wa muda mfupi, wa angalau-mara-moja kwa gharama ndogo; Standard workflows zinatoa semantiki za mara-moja-haswa, muda hadi mwaka mmoja, na historia kamili ya utekelezaji kwa kazi ya upatanishi. *Kwa nini si nyingine:* B — Standard haiwezi kudumisha kiuchumi mwanzo 90,000/sekunde kwa matumizi haya; C — Express inafika kikomo cha dakika 5 na ni angalau-mara-moja, ikishindwa kazi ya saa 12 ya mara-moja-haswa; D — mioanisho iliyogeuzwa inashindwa mizigo yote miwili.

**34. Jibu: B** — Failover routing inatuma trafiki yote kwa kuu wakati ukaguzi wake wa afya unapita, kisha inajibu kiotomatiki na rekodi ya pili inaposhindwa. *Kwa nini si nyingine:* A — weighted 50/50 inatuma nusu ya trafiki kwa nakala isiyo amilifu wakati wote; C — latency-based routing inagawanya trafiki kwa utendaji, si dhamira ya amilifu/isiyo amilifu; D — geolocation inapitisha kwa eneo la mtumiaji, isiyohusiana na kuhamia kunakotegemea afya ya endpoint.

**35. Jibu: B** — Kuongeza aina ya ukaguzi wa afya wa ELB kunafanya ASG kuchukulia kushindwa kwa afya ya lengo la ALB kama hakuna afya, hivyo vipengele vyenye programu iliyoanguka vinasitishwa na kubadilishwa hata kama EC2 status checks zinapita. *Kwa nini si nyingine:* A — ufuatiliaji wa kina unabadilisha ugranulariti wa metriki pekee; C — kipindi cha neema kinachelewesha tathmini ya afya, kinyume cha kinachohitajika; D — aina ya kisambazaji cha mzigo si tatizo.

**36. Jibu: B** — Network Load Balancer inafanya kazi katika layer 4 (TCP/UDP), inashughulikia mamilioni ya maombi kwa sekunde ikiwa na ucheleweshaji wa chini kabisa, na inaunga mkono IP tuli (au Elastic) kwa kila AZ. *Kwa nini si nyingine:* A — ALB ni layer 7 (HTTP/HTTPS) na haitoi IP tuli kiasili; C — Gateway Load Balancer ni kwa kupeleka vifaa vya kawaida vya inline; D — Classic Load Balancer ni urithi na haitimizi hitaji lolote.

**37. Jibu: B, C** — CRR inahitaji uwekaji matoleo uwezeshwe kwenye ndoo zote mbili, na madaraja ya EFS Standard ni mifumo ya faili ya kimkoa (multi-AZ) inayoweza kupachikwa kwa wakati mmoja katika AZ. *Kwa nini si nyingine:* A — CRR inanakili vitu vipya pekee baada ya usanidi isipokuwa uendeshe S3 Batch Replication kwa vilivyopo; D — EFS inaunga mkono maelfu ya wateja wa NFS wa wakati mmoja, tofauti na single-attach EBS; E — uwekaji matoleo ni sharti la unakili lakini wenyewe haunakili chochote.

### Sehemu ya 3 — Maswali 38–53

**38. Jibu: B** — io2 Block Express inatoa hadi IOPS 256,000, ucheleweshaji chini ya millisekunde, na kudumu kwa 99.999%, ikitimiza mahitaji yote matatu. *Kwa nini si nyingine:* A — gp3 sasa inaweza kufikia namba ya IOPS (kikomo chake kiliinuliwa hadi 80,000 mwishoni mwa 2025), lakini inashindwa mahitaji mengine mawili: kudumu ni 99.8–99.9% (swali linadai 99.999%) na ucheleweshaji wake ni millisekunde za tarakimu moja, si chini ya millisekunde uliyohakikishwa; B ndiyo aina pekee inayotimiza yote matatu; C — st1 inategemea HDD na haifai kwa hifadhidata za IOPS-kubwa; D — gp2 inafika kikomo cha IOPS 16,000 na kupasuka si hakikisho endelevu.

**39. Jibu: C** — FSx for Lustre imejengwa kwa madhumuni ya HPC ikiwa na ucheleweshaji chini ya millisekunde, mamia ya GB/s ya upitishaji, na muunganiko wa asili wa S3 (lazy-loading na kusafirisha). *Kwa nini si nyingine:* A — EFS haiwezi kulingana na wasifu wa upitishaji/ucheleweshaji wa HPC wa Lustre; B — FSx for Windows inalenga mizigo ya SMB/Windows, si HPC ya Linux; D — Mountpoint for S3 haitoi semantiki za mfumo wa faili wa POSIX wa pamoja au ucheleweshaji unaohitajika.

**40. Jibu: B** — FSx for Windows File Server inaunga mkono kiasili SMB, muunganiko wa Active Directory, na NTFS ACLs, na hali ya Multi-AZ inafunika hitaji la AZ mbili. *Kwa nini si nyingine:* A — EFS ni NFS/POSIX na haiweki ruhusa za NTFS; C — S3 ni uhifadhi wa vitu, si SMB file share; D — Lustre ni mfumo wa faili wa HPC wa Linux bila msaada wa SMB/AD.

**41. Jibu: D, E** — Transfer Acceleration inapitisha upakiaji kupitia mtandao wa edge/uti wa mgongo wa AWS kuharakisha uhamishaji wa umbali mrefu, na multipart upload inafanya uhamishaji sambamba na inaruhusu sehemu zilizoshindwa kujaribiwa upya bila kuanza upya faili nzima ya 40 GB. *Kwa nini si nyingine:* A — One Zone-IA inabadilisha uzazi, si utendaji wa upakiaji; B — huwezi kuweka ALB mbele ya S3 kwa upakiaji; C — CRR inanakili baada ya upakiaji na haisaidii uingizaji.

**42. Jibu: B** — Instance store NVMe SSDs zimeambatishwa kimwili na mwenyeji, zikitoa ucheleweshaji wa chini kabisa kwa data ya muda inayoweza kuzalishwa upya. *Kwa nini si nyingine:* A na D — EBS inapita mtandao na inaongeza ucheleweshaji; C — EFS ni mfumo wa faili wa mtandao wenye ucheleweshaji wa juu kuliko zote mbili.

**43. Jibu: B** — Kupunguzwa kwa kasi kwenye hot partitions ikiwa na matumizi ya jumla ya chini ni tatizo la kawaida la partition key ya cardinality ya chini; ufunguo wa cardinality ya juu (k.m. game_id#player_id) unasambaza trafiki kwa usawa. *Kwa nini si nyingine:* A — mabadiliko ya hali ya uwezo hayarekebishi hot partitions; C — LSI inashiriki partition key ile ile na hot partitions zile zile; D — Streams zinanasa mabadiliko, hazisambazi uandishi.

**44. Jibu: B** — DAX ni cache ya kumbukumbu inayopatana na DynamoDB, ya wazi-kwa-API inayotoa usomaji wa mikrosekunde ikiwa na mabadiliko madogo ya nambuli. *Kwa nini si nyingine:* A — ElastiCache inahitaji kuandika upya programu kusimamia cache; C — GSI haihifadhi vitu vya moto au kutoa ucheleweshaji wa mikrosekunde; D — Global Tables zinashughulikia ufikiaji wa multi-region, si ucheleweshaji wa usomaji wa kitu kimoja.

**45. Jibu: B** — GSI inaweza kuongezwa kwa jedwali lililopo wakati wowote, inaunga mkono mchanganyiko mpya wa partition/sort key, na ina upitishaji wake uliotolewa uliotengwa na jedwali la msingi. *Kwa nini si nyingine:* A — LSIs zinaweza kuundwa tu wakati wa kuunda jedwali, zinashiriki partition key ya jedwali, na zinashiriki upitishaji wa jedwali; C — kuunda upya jedwali ni kuvuruga na si lazima; D — Streams ni kwa unasaji wa mabadiliko, si hoja za papo hapo.

**46. Jibu: B** — DynamoDB TTL inafuta vitu vilivyoisha kiotomatiki nyuma bila gharama ya ziada. *Kwa nini si nyingine:* A — uchanganuzi wa ratiba unatumia uwezo wa usomaji/uandishi na unagharimu pesa; C — sera za mzunguko wa maisha ni dhana ya S3/EFS, si DynamoDB; D — Streams zinachuja matukio chini ya mkondo lakini hazifuti vitu kutoka kwa jedwali.

**47. Jibu: B** — RDS Proxy inakusanya na kufanya multiplex miunganisho, ikiruhusu maelfu ya uanzishaji wa Lambda kushiriki seti ndogo ya miunganisho ya hifadhidata ikiwa na mabadiliko ya connection-string pekee. *Kwa nini si nyingine:* A — kuongeza ukubwa ni gharama na kunaahirisha tu kikomo; C — uhamiaji wa hifadhidata ni mabadiliko makubwa ya programu; D — kupunguza Lambda hadi 10 kunalemaza upitishaji badala ya kutatua usimamizi wa miunganisho.

**48. Jibu: A** — Aurora Replicas (hadi 15) nyuma ya reader endpoint ikiwa na replica auto scaling zinapunguza trafiki ya usomaji ikiwa na kazi ndogo ya uendeshaji. *Kwa nini si nyingine:* B — Aurora haitumii mfano wa standby isiyo amilifu; standbys katika maneno ya kawaida ya RDS hazihudumii trafiki; C — kugawanya ni gharama ya juu ya uendeshaji kwa tatizo la kupanua usomaji; D — Backtrack inarudisha hifadhidata nyuma kwa wakati, haihudumii usomaji.

**49. Jibu: B** — Global Accelerator inatoa anycast IP mbili tuli, inaunga mkono UDP, inakabili NLBs katika regions nyingi, na inahamia kwa sekunde kupitia uti wa mgongo wa AWS. *Kwa nini si nyingine:* A — CloudFront inahudumia maudhui ya HTTP/HTTPS, si UDP yoyote, na haina IP tuli zinazokabili mteja; C — Route 53 latency routing inategemea DNS TTLs kwa kuhamia na haitoi IP tuli; D — ALB ni ya kimkoa na ya HTTP-pekee.

**50. Jibu: B** — Geolocation routing inajibu hoja za DNS kulingana na nchi ya mtumiaji, ikitekeleza Ujerumani→eu-central-1 na Ufaransa→eu-west-3 kwa uhakika kwa utii wa leseni. *Kwa nini si nyingine:* A — latency routing inachagua endpoint ya haraka zaidi, ambayo inaweza kukiuka sheria ya leseni; C — geoproximity bias inahamisha mipaka kwa umbali lakini haihakikishi uoanishaji mkali wa nchi; D — weighted routing inasambaza kwa nasibu kwa uzito, ikipuuza eneo.

**51. Jibu: C** — Cluster placement group inapakia vipengele karibu pamoja katika AZ moja kwa ucheleweshaji wa chini kabisa na pakiti-kwa-sekunde za juu zaidi, bora kwa mizigo ya MPI iliyofungwa kwa nguvu. *Kwa nini si nyingine:* A — spread groups zinatenganisha vipengele kwa vifaa tofauti, zikiongeza ucheleweshaji, na zinaweka kikomo cha 7 kwa kila AZ; B — partition groups zinatenga fault domains kwa mifumo ya data iliyosambaa, si MPI ya ucheleweshaji mdogo; D — subnet tofauti hazifanyi chochote kuweka pamoja vipengele.

**52. Jibu: B** — Amazon Data Firehose inasimamiwa kikamilifu, haihitaji watumiaji au usimamizi wa shard, inabuffer rekodi, na inaweza kubadilisha JSON kwenda Parquet kabla ya kutoa kwa S3. *Kwa nini si nyingine:* A — Kinesis Data Streams inahitaji kuandika/kusimamia watumiaji; C — SQS pamoja na EC2 pollers ni miundombinu ya kawaida ya kujenga na kuendesha; D — MSK inahitaji kusimamia nguzo za Kafka na connectors.

**53. Jibu: B** — Glue crawlers zinatambua schema kuingia Data Catalog na Athena inaendesha SQL bila seva moja kwa moja dhidi ya faili za S3. *Kwa nini si nyingine:* A — Redshift inahitaji kutoa nguzo na kupakia data; C — EMR inamaanisha kusimamia nguzo ya muda mrefu; D — RDS ingehitaji kupakia data kuingia seva ya hifadhidata.

### Sehemu ya 4 — Maswali 54–65

**54. Jibu: C** — Kazi za bechi zenye checkpoint, zinazoweza kuanzishwa upya ndizo mzigo bora wa Spot, na Spot Fleet iliyotofautishwa katika aina za vipengele/AZ inapunguza athari ya kukatizwa kwa akiba hadi ~90%. *Kwa nini si nyingine:* A — On-Demand inaacha punguzo bila faida hapa; B na D — kujitolea kunatoa punguzo dogo kuliko Spot na kunafunga matumizi kwa kazi inayofaa kukatizwa.

**55. Jibu: C** — Compute Savings Plans zinatumika kiotomatiki katika EC2 (familia/region yoyote), Fargate, na Lambda, zikifaa njia ya kuboresha. *Kwa nini si nyingine:* A — EC2 Instance Savings Plans zimefungwa kwa familia ya kipengele katika region na zinaachilia Fargate/Lambda; B na D — Reserved Instances zinafunika EC2 pekee na hazitumiki kwa Fargate au Lambda.

**56. Jibu: B** — EC2 Standard Reserved Instances pekee zinaweza kuorodheshwa kwenye Reserved Instance Marketplace; RDS (na huduma nyingine) RIs haziwezi kuuzwa tena. *Kwa nini si nyingine:* A na C — RDS RIs hazistahili marketplace; D — EC2 Standard RIs kwa kweli zinaweza kuuzwa kwenye marketplace.

**57. Jibu: B** — AWS inatoa taarifa ya kukatizwa ya Spot dakika mbili kabla ya kurejesha kipengele, ikitoa muda wa kutiririka na kuhifadhi checkpoint. *Kwa nini si nyingine:* A — onyo linatolewa; C na D — dakika 15 na saa 24 si madirisha ya kukatizwa ya Spot (rebalance recommendations zinaweza kufika mapema lakini si dirisha la kudumu lililohakikishwa).

**58. Jibu: B** — Glacier Flexible Retrieval inatoa gharama ya chini ya uhifadhi wa kumbukumbu na Expedited retrievals zinazorudisha data katika dakika 1–5 (takriban $0.03/GB), zikitimiza hitaji la dakika 5. *Kwa nini si nyingine:* A — upataji wa haraka zaidi wa Deep Archive ni ~saa 12; C — Bulk retrievals zinachukua saa 5–12; D — Standard-IA inapata papo hapo lakini inagharimu zaidi sana kwa uhifadhi wa miaka 7 unaofikiwa mara chache.

**59. Jibu: B** — One Zone-IA inagharimu ~20% chini kuliko Standard-IA na maelewano ya kudumu ya single-AZ yanakubalika kwa thumbnails zinazoweza kuzalishwa upya. *Kwa nini si nyingine:* A — Standard-IA inagharimu zaidi kwa uzazi ambao data hauhitaji; C — Intelligent-Tiering inaongeza ada za ufuatiliaji na haipunguzi gharama kwa ufikiaji-mara-chache unaojulikana; D — Glacier Instant Retrieval ina kikomo cha siku 90 na wasifu tofauti wa gharama ya upataji kwa mfumo huu.

**60. Jibu: A, C** — Intelligent-Tiering inatoza ada ndogo ya ufuatiliaji/otomatiki kwa kila kitu, na vitu chini ya 128 KB vinahifadhiwa lakini havifuatiliwi au kuwekwa daraja (vinatozwa kwa viwango vya Frequent Access). *Kwa nini si nyingine:* B — Intelligent-Tiering haina ada za upataji kati ya madaraja yake ya kiotomatiki; D — kamwe hainakili toka region hadi region; E — hakuna kikomo cha siku 90 kwa kila kitu katika daraja hili.

**61. Jibu: B** — Sehemu za upakiaji wa multipart usiokamilika zinatozwa kama uhifadhi lakini hazionekani kama vitu; sheria ya mzunguko wa maisha ikiwa na AbortIncompleteMultipartUpload inazifuta kiotomatiki. *Kwa nini si nyingine:* A — uwekaji matoleo ungeongeza uhifadhi, si kusafisha sehemu; C — kubadilisha daraja la uhifadhi hakuondoi sehemu zilizoachwa; D — Transfer Acceleration inaharakisha uhamishaji lakini haisafishi upakiaji uliokwisha kuachwa.

**62. Jibu: B** — gp3 inatenganisha IOPS/upitishaji kutoka kwa ukubwa na inagharimu ~20% chini kwa GB kuliko gp2, hivyo uwezo unaweza kusahihishwa ukubwa huku ukiweka IOPS inayohitajika; uhamiaji ni operesheni ya ModifyVolume mtandaoni. *Kwa nini si nyingine:* A — io2 ni ghali zaidi, si chini; C — st1 haiwezi kutoa IOPS inayohitajika; D — kufuta volumes kunaharibu data ya moja kwa moja.

**63. Jibu: B** — Gateway VPC endpoint kwa S3 ni ya bure na inaondoa malipo ya usindikaji wa data ya NAT gateway kwa trafiki ya S3 ya region ile ile. *Kwa nini si nyingine:* A — NAT instance bado inasababisha gharama za EC2 na uendeshaji; C — interface endpoints zinatoza kwa saa na kwa GB, zikigharimu zaidi ya gateway endpoint ya bure; D — subnet za umma zinaongeza malipo ya public IPv4 na kudhoofisha usalama.

**64. Jibu: B, E** — AWS inatoza kwa kila anwani ya public IPv4 inayotumiwa, hivyo kuondoa zisizohitajika kunapunguza gharama, na AWS Budgets inatoa tahadhari za kizingiti za awali kwa matumizi ya utabiri/halisi. *Kwa nini si nyingine:* A — Elastic IPs pia zinatozwa chini ya malipo ya public IPv4 hata zikiambatishwa; C — Compute Optimizer inapendekeza kusahihisha ukubwa lakini haiwezi kuzuia au kutoa tahadhari kwa vizingiti vya matumizi; D — Shield Advanced ni huduma ya DDoS inayoongeza gharama.

**65. Jibu: A** — Aurora Serverless v2 inaunga mkono kupanua hadi ACU 0 (kusimama-kiotomatiki, inapatikana tangu mwishoni mwa 2024) na inaanza tena kiotomatiki kwenye muunganisho, ikiondoa gharama ya kompyuta wakati haitumiki bila hatua za mkono. Nuances zinazofaa kujua: kusimama-kiotomatiki kunahitaji matoleo ya hivi karibuni ya injini (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); muunganisho wa kwanza baada ya kusimama unachukua ~sekunde 15 kuanza tena (zaidi baada ya saa 24+ kusimama); uhifadhi unaendelea kutozwa wakati kompyuta imesimama; na chochote kinachoshikilia miunganisho wazi — RDS Proxy, ukaguzi wa afya wa keep-alive — kinazuia kusimama kabisa. *Kwa nini si nyingine:* B — nguzo iliyotolewa iliyosimamishwa haiamki kiotomatiki wakati wasanidi wanaunganisha (na inaanza upya baada ya siku 7); C — secondaries za headless za global database zinashughulikia DR, si gharama ya kutotumika; D — readers zilizopunguzwa bado zinaacha kipengele cha mwandishi kikiendesha na kutozwa.

---

## Mwongozo wa Alama

| Alama | Tafsiri ya matokeo |
|---|---|
| 55–65 | Tayari kwa mtihani. Andikisha mtihani. Pitia tu maswali uliyokosa. |
| 47–54 | Katika kiwango cha kufaulu, lakini ukingo ni mwembamba. Soma tena sura nyuma ya kila kosa (tumia tagi za kikoa), rudia baada ya wiki moja. |
| 38–46 | Msingi upo; mapungufu yanabaki. Pitia ramani ya kikoa ya Kiambatisho B kwa vikoa vyako dhaifu kabla ya kurudia. |
| Chini ya 38 | Soma tena sura kwa vikoa vyako viwili dhaifu zaidi mwanzo hadi mwisho, fanya tena mazoezi yao ya sura, kisha urudie mtihani huu. |

Fuatilia makosa yako *kwa kikoa* (kila swali lina tagi). Alama ya chini iliyojikita katika kikoa kimoja ni tatizo la kusoma lililojikita; alama ile ile iliyosambaa kwa usawa ni tatizo la kasi au kusoma swali — punguza mwendo na pigia mstari kile kila swali linachohitaji haswa (HA dhidi ya DR, gharama dhidi ya utendaji, "INAYOFAA ZAIDI kigharama" dhidi ya "gharama NDOGO ZAIDI ya uendeshaji").
