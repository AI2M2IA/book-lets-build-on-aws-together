# Kiambatisho B: Ramani ya Kikoa cha SAA-C03

Mtihani wa AWS Solutions Architect Associate (SAA-C03) umepangwa katika vikoa vinne. Kiambatisho hiki kinaoanisha kila sura katika kitabu na kikoa na kazi husika, ili uweze kusoma kwa eneo la mtihani badala ya mpangilio wa sura.

---

## Muhtasari wa Kikoa

| Kikoa                                               | Uzito | Maelezo                                                |
|-----------------------------------------------------|-------|--------------------------------------------------------|
| Kikoa cha 1: Buni Miundo Salama                     | 30%   | IAM, usalama wa mtandao, ulinzi wa data                |
| Kikoa cha 2: Buni Miundo Thabiti                    | 26%   | Upatikanaji wa juu, uvumilivu wa hitilafu, uokoaji wa maafa |
| Kikoa cha 3: Buni Miundo ya Utendaji wa Juu         | 24%   | Utendaji wa kompyuta, uhifadhi, hifadhidata, mtandao   |
| Kikoa cha 4: Buni Miundo Iliyoboreshwa kwa Gharama  | 20%   | Mifano ya bei, usimamizi wa gharama, uimarishaji wa rasilimali |

---

## Kikoa cha 1: Buni Miundo Salama (30%)

**Kazi ya 1.1 — Buni ufikiaji salama kwa rasilimali za AWS**

Dhana za msingi: Watumiaji wa IAM, vikundi, majukumu, sera. Kanuni ya upendeleo mdogo. Ufikiaji wa toka akaunti hadi akaunti. Majukumu ya huduma. SCP (Sera za Udhibiti wa Huduma) katika AWS Organizations.

| Sura       | Mada                                                                           |
|------------|--------------------------------------------------------------------------------|
| Sura ya 3  | Misingi ya IAM: watumiaji, vikundi, majukumu, sera, tathmini ya sera           |
| Sura ya 14 | IAM ya hali ya juu: majukumu kwa huduma, mipaka ya ruhusa, majukumu ya toka akaunti hadi akaunti |
| Sura ya 3  | Mantiki ya tathmini ya sera: kukataa wazi > kuruhusu wazi > kukataa isiyo wazi |
| Sura ya 14 | AWS Organizations na SCP                                                       |

Mifumo muhimu ya mtihani:

- "EC2 inahitaji kufikia S3 bila vitambulisho vilivyowekwa" → jukumu la IAM yenye sera ya S3 iliyoambatishwa kwa wasifu wa kipengele cha EC2
- "Akaunti tofauti zinahitaji kushiriki rasilimali" → jukumu la IAM yenye sera ya kuamini ya toka akaunti hadi akaunti
- "Zui watumiaji wote wa IAM katika OU kutoka kufikia huduma" → SCP katika AWS Organizations

---

**Kazi ya 1.2 — Buni mzigo na programu salama**

Dhana za msingi: Muundo wa VPC, vikundi vya usalama dhidi ya NACL, utengano wa mtandao, ulinzi wa DDoS, WAF, GuardDuty.

| Sura       | Mada                                                                                 |
|------------|--------------------------------------------------------------------------------------|
| Sura ya 11 | Muundo wa VPC: subnet za umma/kibinafsi, NAT Gateway, Lango la Mtandao, meza za njia |
| Sura ya 15 | Vikundi vya usalama (vya hali, kiwango cha kipengele) dhidi ya NACL (visivyo na hali, kiwango cha subnet) |
| Sura ya 17 | Shield (ulinzi wa DDoS), WAF (ngome ya programu), GuardDuty (ugunduzi wa vitisho) |
| Sura ya 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                    |

Mifumo muhimu ya mtihani:

- "Zuia IP maalum kutoka subnet" → sheria ya kukataa NACL
- "Ruhusu HTTP kuingia, ruhusu kiotomatiki majibu ya HTTP kutoka" → kikundi cha usalama (cha hali)
- "Linda programu ya wavuti dhidi ya kuingizwa kwa SQL" → WAF yenye sheria ya kuingizwa kwa SQL
- "Gundua vitambulisho vya IAM vilivyoathiriwa" → GuardDuty

---

**Kazi ya 1.3 — Bainisha vidhibiti vya usalama vya data vinavyofaa**

Dhana za msingi: Usimbaji fiche wakati wa mapumziko na wakati wa usafirishaji, KMS, Secrets Manager, Parameter Store, usimbaji fiche wa upande wa seva wa S3.

| Sura       | Mada                                                                         |
|------------|------------------------------------------------------------------------------|
| Sura ya 16 | KMS: vifunguo vinavyosimamiwa na mteja, mzunguko wa ufunguo, usimbaji fiche wa bahasha |
| Sura ya 16 | Secrets Manager: mzunguko wa kiotomatiki wa vitambulisho, urejeshaji wa siri wakati wa utekelezaji |
| Sura ya 5  | Chaguo za usimbaji fiche za S3: SSE-S3, SSE-KMS, SSE-C                       |
| Sura ya 8  | Usimbaji fiche wa RDS wakati wa mapumziko (lazima uwezeshwe wakati wa uundaji) |

Mifumo muhimu ya mtihani:

- "Zungusha kiotomatiki vitambulisho vya hifadhidata" → Secrets Manager na muunganiko wa RDS
- "Dhibiti ni nani anaweza kutumia vifunguo vya usimbaji fiche katika akaunti" → sera ya ufunguo ya KMS
- "Hifadhi maadili ya usanidi yasiyo ya siri" → SSM Parameter Store (si Secrets Manager)
- "Ficha vitu vya S3 na vifunguo vinavyosimamiwa na kampuni" → SSE-KMS na CMK

---

## Kikoa cha 2: Buni Miundo Thabiti (26%)

**Kazi ya 2.1 — Buni usanifu unaopanua na ushaushirikiano**

Dhana za msingi: Kupanua Kiotomatiki, visambazaji vya mzigo, utenganishaji wa SQS/SNS, vichocheo vya tukio vya Lambda, ECS/EKS, Step Functions.

| Sura       | Mada                                                                     |
|------------|--------------------------------------------------------------------------|
| Sura ya 7  | Vikundi vya Kupanua Kiotomatiki, Kisambazaji cha Mzigo cha Programu, sera za kupanua |
| Sura ya 19 | SQS (utenganishaji na foleni), SNS (arifa za fan-out)                    |
| Sura ya 20 | Lambda: kompyuta bila seva, vichocheo vya matukio, uanzishaji wa wakati mmoja |
| Sura ya 21 | ECS na EKS: microservices zilizowekwa kwenye makopo                      |
| Sura ya 22 | Step Functions: uratibu wa mtiririko wa kazi                             |
| Sura ya 26 | Kinesis: utiririko wa data wa wakati halisi                              |

Mifumo muhimu ya mtihani:

- "Tenganisha usindikaji wa agizo kutoka sasisha ya orodha" → foleni ya SQS kati ya huduma
- "Arifu huduma nyingi agizo jipya linapowekwa" → mada ya SNS na wajiandikishaji wa SQS (fan-out)
- "Shughulikia kiotomatiki upakiaji wa S3" → arifa ya tukio ya S3 → Lambda
- "Endesha mtiririko wa kazi wa hatua nyingi wenye mantiki ya kujaribu tena" → Step Functions

---

**Kazi ya 2.2 — Buni usanifu wa upatikanaji wa juu na/au wa ustahimilivu wa hitilafu**

Dhana za msingi: Multi-AZ, Multi-Region, kushindwa hama kwa Route 53, nakala za kusomwa za RDS, Aurora Global Database, nakala na kurejesha.

| Sura       | Mada                                                                                          |
|------------|-----------------------------------------------------------------------------------------------|
| Sura ya 2  | Miundombinu ya kimataifa ya AWS: Mikoa, AZ, maeneo ya pembeni                                 |
| Sura ya 7  | ALB katika AZ nyingi, ASG inabadilisha vipengele visivyo na afya                             |
| Sura ya 8  | RDS Multi-AZ: upokezaji wa wakati mmoja, kushindwa hama kwa kiotomatiki                      |
| Sura ya 12 | Route 53: upitishaji wa kushindwa hama, upitishaji wa kulingana na latency, ukaguzi wa afya  |
| Sura ya 18 | Multi-AZ dhidi ya Multi-Region: RTO/RPO, mikakati ya DR (mwanga wa rubani, nakala ya hifadhi ya joto, active-active) |
| Sura ya 24 | Aurora Global Database: nakala za kusomwa za toka kanda hadi kanda, ucheleweshaji wa upokezaji < sekunde 1 |

Mifumo muhimu ya mtihani:

- "Fanyika kushindwa hama kiotomatiki RDS ya msingi ikishindwa" → RDS Multi-AZ (si Nakala ya Kusomwa)
- "Hudumia masomo duniani kote na latency ndogo" → Aurora Global Database
- "Pita trafiki kwa mkoa wa sekondari msingi ukiwa hapatikani" → Route 53 yenye upitishaji wa kushindwa hama + ukaguzi wa afya
- "RTO ya dakika 1, RPO ya 0" → Usambazaji wa Multi-AZ (si Multi-Region)
- "RTO ya dakika 15, toka kanda hadi kanda" → mkakati wa Mwanga wa Rubani

---

## Kikoa cha 3: Buni Miundo ya Utendaji wa Juu (24%)

**Kazi ya 3.1 — Bainisha suluhisho za uhifadhi za utendaji wa juu na/au zinazopanua**

Dhana za msingi: S3 dhidi ya EBS dhidi ya EFS, uteuzi wa darasa la uhifadhi, Uongezaji wa Uhamishaji wa S3, upakiaji wa sehemu nyingi, CloudFront kwa mali.

| Sura       | Mada                                                                               |
|------------|------------------------------------------------------------------------------------|
| Sura ya 5  | S3: uhifadhi wa vitu, madarasa ya uhifadhi, upigaji toleo, mzunguko wa maisha      |
| Sura ya 6  | EBS: aina za uhifadhi wa kuzuia (gp3, io2, st1), EFS: uhifadhi wa faili za pamoja |
| Sura ya 23 | Mpito wa darasa la uhifadhi wa S3, chaguo za urejeshaji wa Glacier                 |
| Sura ya 28 | Kupanga saizi sahihi kwa EBS, uhamiaji wa gp2→gp3, usimamizi wa picha              |

Mifumo muhimu ya mtihani:

- "Mfumo wa faili wa pamoja unaoweza kufikiwa kutoka vipengele vingi vya EC2" → EFS (si EBS; EBS huambatishwa kwa kipengele kimoja)
- "IOPS za juu kwa mzigo wa hifadhidata" → io2 EBS
- "Punguza gharama kwa faili zisizofikiwa kwa siku 90" → sera ya mzunguko wa maisha ya S3 → Glacier
- "Pakia faili kubwa kutoka maeneo ya mbali haraka zaidi" → Uongezaji wa Uhamishaji wa S3

---

**Kazi ya 3.2 — Bainisha suluhisho za kompyuta za utendaji wa juu na/au zinazopanua**

Dhana za msingi: Familia za vipengele vya EC2, wasindikaji wa Graviton, Kupanua Kiotomatiki, Lambda, Fargate, Vipengele vya Nafasi.

| Sura       | Mada                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| Sura ya 4  | Aina za vipengele vya EC2: zinazoimarishwa kwa kompyuta (c), za kumbukumbu-zilizoimarishwa (r), za jumla (m, t) |
| Sura ya 7  | Kupanua Kiotomatiki: kupanua kwa usawa kwa tabaka za wavuti                               |
| Sura ya 20 | Lambda: uanzishaji wa wakati mmoja, uanzishaji uliotolewa wa utekelezaji wa wakati mmoja (kwa latency thabiti) |
| Sura ya 21 | ECS Fargate: vyombo bila seva                                                              |
| Sura ya 27 | Vipengele vya Nafasi kwa mzigo wa kundi wa ustahimilivu wa hitilafu                       |

Mifumo muhimu ya mtihani:

- "Mzigo wa mafunzo wa ML, punguza gharama, unaweza kukatizwa" → Vipengele vya Nafasi
- "Majibu ya Lambda thabiti ya chini ya millisekunde 100" → Uanzishaji uliotolewa wa utekelezaji wa wakati mmoja (unaondoa kuanza baridi)
- "Microservice iliyowekwa kwenye makopo, hakuna usimamizi wa miundombinu" → ECS Fargate

---

**Kazi ya 3.3 — Bainisha suluhisho za hifadhidata za utendaji wa juu**

Dhana za msingi: RDS dhidi ya DynamoDB dhidi ya Aurora dhidi ya Redshift dhidi ya ElastiCache, mifumo ya ufikiaji, nakala za kusomwa, DAX.

| Sura       | Mada                                                                               |
|------------|------------------------------------------------------------------------------------|
| Sura ya 8  | RDS: hifadhidata za uhusiano zinazosimamiwa, lini kutumia RDBMS                   |
| Sura ya 9  | DynamoDB: NoSQL, funguo za sehemu, GSI, DAX (kashe ya kwenye kumbukumbu)          |
| Sura ya 10 | ElastiCache: Redis dhidi ya Memcached, mikakati ya kashe                           |
| Sura ya 24 | Aurora: utendaji, Serverless v2, nakala za kusomwa, Global Database                |
| Sura ya 29 | DynamoDB wa hiari dhidi ya uwezo uliotolewa na Kupanua Kiotomatiki                 |

Mifumo muhimu ya mtihani:

- "Masomo ya microsekunde kwa duka la kikao" → ElastiCache Redis au DAX (ikiwa msingi wa DynamoDB)
- "Ufikiaji wa kasi wa juu wa ufunguo-thamani na mpango wa kubadilika" → DynamoDB
- "Michanganyiko ya ngumu na miamala ya ACID" → Aurora au RDS
- "Uchambuzi kwenye petabytes za data iliyoundwa" → Redshift (haifunikwi kwa kina lakini ishara: "ghala la data" → Redshift)

---

**Kazi ya 3.4 — Bainisha usanifu wa mtandao wa utendaji wa juu na/au unaopanua**

Dhana za msingi: CloudFront, Global Accelerator, Direct Connect, VPN, vikundi vya uwekaji, mtandao ulioimarishwa.

| Sura       | Mada                                                                             |
|------------|----------------------------------------------------------------------------------|
| Sura ya 12 | Route 53: sera za upitishaji: kulingana na latency, jiografia, uzito              |
| Sura ya 13 | CloudFront: CDN, kuhifadhi pembezoni, Lambda@Edge                                |
| Sura ya 25 | Direct Connect: muunganisho wa kibinafsi uliowekwa                               |
| Sura ya 25 | AWS Global Accelerator: upitishaji wa Anycast hadi pembeni ya AWS iliyo karibu   |
| Sura ya 30 | Sehemu za Mwisho za VPC: muunganisho wa kibinafsi kwa huduma za AWS              |

Mifumo muhimu ya mtihani:

- "Punguza latency kwa watumiaji wa kimataifa wanaopata majibu ya API ya nguvu" → Global Accelerator (si CloudFront, ambayo ni bora kwa maudhui yanayoweza kuhifadhiwa)
- "Punguza latency kwa mali thabiti duniani kote" → CloudFront
- "Muunganisho thabiti wa kibinafsi kwa AWS kutoka eneo la ndani" → Direct Connect
- "Upakiaji wa haraka kutoka wateja duniani kote kwenye ndoo yako ya S3" → Uongezaji wa Uhamishaji wa S3

---

**Kazi ya 3.5 — Bainisha suluhisho za uingizaji na mabadiliko ya data za utendaji wa juu**

Dhana za msingi: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Sura       | Mada                                                                                |
|------------|-------------------------------------------------------------------------------------|
| Sura ya 26 | Kinesis Data Streams: usindikaji wa tukio wa wakati halisi ulioandaliwa             |
| Sura ya 26 | Kinesis Data Firehose: utoaji unaosimamiwa kwa S3, Redshift, OpenSearch             |
| Sura ya 26 | AWS Glue: ETL bila seva, Katalogi ya Data, Watambazaji                              |
| Sura ya 26 | Athena: SQL bila seva kwenye S3                                                     |

Mifumo muhimu ya mtihani:

- "Shughulikia data ya utiririko wa kubonyeza kwa wakati halisi" → Kinesis Data Streams + Lambda au KDA
- "Toa data ya utiririko kwa S3 kwa uchambuzi wa baadaye" → Kinesis Firehose
- "Badilisha na katalogi data kutoka vyanzo vingi" → AWS Glue
- "Uliza data ya kihistoria iliyohifadhiwa katika S3 kwa SQL" → Athena

---

## Kikoa cha 4: Buni Miundo Iliyoboreshwa kwa Gharama (20%)

**Kazi ya 4.1 — Buni suluhisho za uhifadhi zilizoimarishwa kwa gharama**

| Sura       | Mada                                                                               |
|------------|------------------------------------------------------------------------------------|
| Sura ya 23 | Sera za mzunguko wa maisha za S3, mpito wa darasa la uhifadhi                      |
| Sura ya 28 | Kupanga saizi sahihi kwa EBS, uhamiaji wa gp2→gp3, sheria za mzunguko wa maisha za upigaji toleo wa S3 |
| Sura ya 28 | EFS Intelligent-Tiering, lebo za ugawaji wa gharama, AWS Budgets                   |

Mifumo muhimu ya mtihani:

- "Tambua timu inayozalisha gharama nyingi zaidi za S3" → lebo za ugawaji wa gharama + Cost Explorer
- "Punguza kiotomatiki gharama kwa vitu vinavyopatikana mara chache" → S3 Intelligent-Tiering
- "Tahadhari gharama ya kila mwezi ikizidi $10,000" → AWS Budgets

---

**Kazi ya 4.2 — Buni suluhisho za kompyuta zilizoimarishwa kwa gharama**

| Sura       | Mada                                                                                          |
|------------|-----------------------------------------------------------------------------------------------|
| Sura ya 27 | Bei za EC2: On-Demand, Vipengele Vilivyohifadhiwa, Mipango ya Akiba, Nafasi, Majeshi Maalum  |
| Sura ya 20 | Lambda: lipa kwa kila uanzishaji (gharama sifuri ya usubiri)                                  |

Mifumo muhimu ya mtihani:

- "Punguza gharama kwa mzigo thabiti wa uzalishaji" → Mipango ya Akiba (yenye kubadilika zaidi) au Vipengele Vilivyohifadhiwa
- "Punguza gharama kwa kazi za kundi zinazoweza kukatizwa" → Vipengele vya Nafasi
- "Usindikaji unaoendelewa na matukio na gharama sifuri ya usubiri" → Lambda

---

**Kazi ya 4.3 — Buni suluhisho za hifadhidata zilizoimarishwa kwa gharama**

| Sura       | Mada                                                                      |
|------------|---------------------------------------------------------------------------|
| Sura ya 29 | DynamoDB wa hiari dhidi ya uliotolewa + Kupanua Kiotomatiki               |
| Sura ya 29 | RDS na Vipengele Vilivyohifadhiwa/Nodi za ElastiCache                    |
| Sura ya 29 | Usimamizi wa picha za RDS                                                 |

Mifumo muhimu ya mtihani:

- "Trafiki ya DynamoDB isiyoweza kutabiriwa" → hali ya uwezo wa hiari
- "Trafiki thabiti ya DynamoDB yenye mabadiliko yanayojulikana" → Imetolewa + Kupanua Kiotomatiki
- "Punguza gharama za RDS kwa mzigo thabiti" → Vipengele Vilivyohifadhiwa (miaka 1- au 3-)

---

**Kazi ya 4.4 — Buni usanifu wa mtandao ulioboreshwa kwa gharama**

| Sura       | Mada                                                                                              |
|------------|---------------------------------------------------------------------------------------------------|
| Sura ya 30 | Bei za uhamishaji wa data: inbound (bure), toka AZ hadi AZ ($0.01/GB), toka kanda hadi kanda, mtandao ($0.09/GB) |
| Sura ya 30 | NAT Gateway ($0.045/GB) dhidi ya Sehemu za Mwisho za VPC (Lango: bure; Kiolesura: bei)          |
| Sura ya 30 | CloudFront kama kiboresha gharama cha uhamishaji wa data                                          |

Mifumo muhimu ya mtihani:

- "EC2 katika subnet ya kibinafsi inaita S3 — ondoa gharama za NAT Gateway" → Sehemu ya Mwisho ya Lango ya S3 (bure)
- "EC2 katika subnet ya kibinafsi inaita SQS — punguza gharama za NAT Gateway" → Sehemu ya Mwisho ya Kiolesura ya SQS
- "Punguza gharama za uhamishaji wa data kwa utoaji wa maudhui wa kimataifa" → CloudFront (kuhifadhi hupunguza maombi ya chanzo)

---

## Mada za Msalaba wa Vikoa

Mada fulani zinaonekana katika vikoa vingi:

| Mada                                | Vikoa   | Sura         |
|-------------------------------------|---------|--------------|
| Mfumo wa Ujenzi Bora                | Zote    | 31           |
| Mapitio ya usanifu na ADR           | Zote    | 32           |
| Kusababu kwa uwiano ("inategemea") | Zote | 33           |
| Muundo wa Multi-AZ                  | 2, 3    | 7, 8, 18, 24 |
| Ufuatiliaji na uonekani             | 1, 2    | Kote         |
| CloudFront                          | 3, 4    | 13, 30       |

---

## Orodha ya Kukaguliwa Kabla ya Mtihani

Kabla ya kufanya SAA-C03:

**Maeneo ya uzito mkubwa (yanayoweza zaidi kuonekana)**

- [ ] Mantiki ya tathmini ya sera ya IAM (kukataa wazi → kuruhusu wazi → kukataa isiyo wazi)
- [ ] Vipengele vya VPC: subnet, meza za njia, IGW, NAT Gateway, vikundi vya usalama, NACL
- [ ] Madarasa ya uhifadhi wa S3 na lini kutumia kila moja
- [ ] RDS Multi-AZ dhidi ya Nakala ya Kusomwa (kushindwa hama dhidi ya kupanua kusomwa)
- [ ] SQS dhidi ya SNS dhidi ya EventBridge (vuta dhidi ya sukuma dhidi ya upitishaji wa matukio)
- [ ] Mifano ya bei ya EC2: Nafasi kwa mzigo wa ustahimilivu wa hitilafu, Mipango ya Akiba kwa mzigo uliojitolea
- [ ] Vichocheo na uanzishaji wa wakati mmoja wa Lambda
- [ ] DynamoDB dhidi ya Aurora dhidi ya Redshift (mchakato wa ufikiaji unabainisha chaguo)
- [ ] CloudFront: CDN kwa maudhui thabiti, Global Accelerator kwa nguvu

**Mitego ya kawaida**

- [ ] EBS huambatishwa kwa kipengele KIMOJA; EFS inashirikiwa
- [ ] Nakala za Kusomwa za RDS ni kwa kupanua kusomwa, SI kushindwa hama kwa kiotomatiki (hiyo ni Multi-AZ)
- [ ] NACL hazina hali (zinahitaji sheria zote za inbound na outbound)
- [ ] Sehemu za Mwisho za Lango ni bure na kwa S3 na DynamoDB tu
- [ ] Kinesis inahifadhi na kurudia; SQS inafuta inapotumiwa
- [ ] "Tenganisha" haimaanishi daima SQS — fan-out ya SNS na EventBridge pia ni mifumo ya utenganishaji
- [ ] Shield Standard ni bure na wa kiotomatiki; Advanced ni ombi la kulipa

**Muundo wa mtihani**

- Maswali 65, dakika 130 (saa 2 na dakika 10)
- Chaguo moja (jibu moja sahihi) na majibu mengi (chagua N sahihi)
- Alama ya kupita: 720 kati ya 1000
- Maswali yasiyopigwa alama yamejumuishwa; hauwezi kujua ni yapi
- Simamia muda: ~dakika 2 kwa swali; piga bendera yenye shida na urudi
