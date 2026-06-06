# Kiambatisho B: Ramani ya Kikoa cha SAA-C03

Mtihani wa AWS Solutions Architect Associate (SAA-C03) umepangwa katika vikoa vinne. Kiambatisho hiki kinaoanisha kila sura katika kitabu na kikoa na kazi husika, ili uweze kusoma kwa eneo la mtihani badala ya mpangilio wa sura.

---

## Muhtasari wa Kikoa

| Kikoa                                               | Uzito | Maelezo                                                |
|-----------------------------------------------------|-------|--------------------------------------------------------|
| Kikoa cha 1: Design Secure Architectures            | 30%   | IAM, usalama wa mtandao, ulinzi wa data                |
| Kikoa cha 2: Design Resilient Architectures         | 26%   | Upatikanaji wa juu, uvumilivu wa hitilafu, uokoaji wa maafa |
| Kikoa cha 3: Design High-Performing Architectures   | 24%   | Utendaji wa kompyuta, uhifadhi, hifadhidata, mtandao   |
| Kikoa cha 4: Design Cost-Optimized Architectures    | 20%   | Mifano ya bei, usimamizi wa gharama, uimarishaji wa rasilimali |

---

## Kikoa cha 1: Design Secure Architectures (30%)

**Kazi ya 1.1 — Buni ufikiaji salama kwa rasilimali za AWS**

Dhana za msingi: Watumiaji wa IAM, vikundi, majukumu, sera. Kanuni ya upendeleo mdogo. Ufikiaji wa toka akaunti hadi akaunti. Majukumu ya huduma. SCP (Service Control Policies) katika AWS Organizations.

| Sura       | Mada                                                                           |
|------------|--------------------------------------------------------------------------------|
| Sura ya 3  | Misingi ya IAM: watumiaji, vikundi, majukumu, sera, tathmini ya sera           |
| Sura ya 14 | IAM ya hali ya juu: majukumu kwa huduma, mipaka ya ruhusa, majukumu ya toka akaunti hadi akaunti |
| Sura ya 3  | Mantiki ya tathmini ya sera: kukataa wazi > kuruhusu wazi > kukataa isiyo wazi |
| Sura ya 14 | AWS Organizations, SCP, Control Tower, Account Factory                         |
| Sura ya 14 | Cognito: User Pools (kuingia kwa programu, JWT) na Identity Pools (vitambulisho vya muda vya AWS) |

Mifumo muhimu ya mtihani:

- "EC2 inahitaji kufikia S3 bila vitambulisho vilivyowekwa moja kwa moja kwenye nambuli" → jukumu la IAM yenye sera ya S3 iliyoambatishwa kwa wasifu wa kipengele cha EC2
- "Akaunti tofauti zinahitaji kushiriki rasilimali" → jukumu la IAM yenye sera ya kuamini ya toka akaunti hadi akaunti
- "Zuia watumiaji wote wa IAM katika OU kutoka kufikia huduma" → SCP katika AWS Organizations

---

**Kazi ya 1.2 — Buni mzigo na programu salama**

Dhana za msingi: Muundo wa VPC, security groups dhidi ya NACL, kutengwa kwa mtandao, ulinzi wa DDoS, WAF, GuardDuty.

| Sura       | Mada                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| Sura ya 11 | Muundo wa VPC: subnet za umma/faragha, NAT Gateway, Internet Gateway, jedwali za njia      |
| Sura ya 15 | Security groups (stateful, kiwango cha kipengele) dhidi ya NACL (stateless, kiwango cha subnet) |
| Sura ya 17 | Shield (DDoS), WAF (ngome ya programu), GuardDuty (kugundua vitisho), Inspector (uchanganuzi wa CVE) |
| Sura ya 17 | Macie: ugunduzi wa data nyeti katika S3 (PII, vitambulisho)                                |
| Sura ya 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                          |

Mifumo muhimu ya mtihani:

- "Zuia IP maalum kutoka subnet" → sheria ya kukataa ya NACL
- "Ruhusu HTTP kuingia, ruhusu kiotomatiki jibu la HTTP kutoka" → Security group (stateful)
- "Linda programu ya wavuti dhidi ya SQL injection" → WAF yenye sheria ya SQL injection
- "Gundua vitambulisho vya IAM vilivyovuja" → GuardDuty

---

**Kazi ya 1.3 — Amua udhibiti unaofaa wa usalama wa data**

Dhana za msingi: Usimbaji ikiwa imehifadhiwa na wakati wa usafiri, KMS, Secrets Manager, Parameter Store, usimbaji wa upande wa seva wa S3.

| Sura       | Mada                                                                    |
|------------|--------------------------------------------------------------------------|
| Sura ya 16 | KMS: customer-managed keys, mzunguko wa funguo, usimbaji wa bahasha     |
| Sura ya 16 | Secrets Manager: mzunguko wa kiotomatiki wa vitambulisho, upataji wa siri wakati wa uendeshaji |
| Sura ya 16 | ACM (AWS Certificate Manager): vyeti vya SSL/TLS kwa ALB, CloudFront    |
| Sura ya 5  | Chaguzi za usimbaji za S3: SSE-S3, SSE-KMS, SSE-C                       |
| Sura ya 8  | Usimbaji wa RDS ikiwa imehifadhiwa (lazima uwezeshwe wakati wa kuunda) |

Mifumo muhimu ya mtihani:

- "Zungusha vitambulisho vya hifadhidata kiotomatiki" → Secrets Manager ikiwa na muunganiko wa RDS
- "Dhibiti nani anaweza kutumia funguo za usimbaji katika akaunti" → key policy ya KMS
- "Hifadhi thamani za usanidi zisizo siri" → SSM Parameter Store (si Secrets Manager)
- "Simba vitu vya S3 na funguo zinazosimamiwa na kampuni" → SSE-KMS yenye CMK

---

## Kikoa cha 2: Design Resilient Architectures (26%)

**Kazi ya 2.1 — Buni miundo inayoweza kupanuka na iliyotenganishwa kwa ulegevu**

Dhana za msingi: Auto Scaling, visambazaji vya mzigo, utenganishaji wa SQS/SNS, vichocheo vya matukio vya Lambda, ECS/EKS, Step Functions.

| Sura       | Mada                                                              |
|------------|--------------------------------------------------------------------|
| Sura ya 7  | Auto Scaling Groups, Application Load Balancer, sera za kupanua    |
| Sura ya 19 | SQS (utenganishaji kwa foleni), SNS (arifa za fan-out)            |
| Sura ya 20 | Lambda: kompyuta bila seva, vichocheo vya matukio, uanzishaji wa wakati mmoja |
| Sura ya 20 | API Gateway: REST/HTTP/WebSocket API zinazosimamiwa, peke yake au + Lambda |
| Sura ya 21 | ECS na EKS: microservices za vyombo                                |
| Sura ya 22 | Step Functions: uratibu wa mtiririko wa kazi                       |
| Sura ya 26 | Kinesis: utiririshaji wa data wa wakati halisi                     |

Mifumo muhimu ya mtihani:

- "Tenganisha usindikaji wa agizo na usasishaji wa hesabu" → foleni ya SQS kati ya huduma
- "Arifu huduma nyingi agizo jipya linapowekwa" → topic ya SNS yenye usajili wa SQS (fan-out)
- "Sindika upakiaji wa S3 kiotomatiki" → arifa ya tukio la S3 → Lambda
- "Endesha mtiririko wa hatua nyingi wenye mantiki ya urejeshaji" → Step Functions

---

**Kazi ya 2.2 — Buni miundo yenye upatikanaji wa juu na/au inayovumilia hitilafu**

Dhana za msingi: Multi-AZ, Multi-Region, Route 53 failover, RDS read replicas, Aurora Global Database, backup and restore.

| Sura       | Mada                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| Sura ya 2  | Miundombinu ya kimataifa ya AWS: Regions, AZ, edge locations                                 |
| Sura ya 7  | ALB katika AZ nyingi, ASG inabadilisha vipengele visivyo na afya                             |
| Sura ya 8  | RDS Multi-AZ: unakili sambamba, kuhamia kiotomatiki                                          |
| Sura ya 12 | Route 53: failover routing, latency routing, ukaguzi wa afya                                 |
| Sura ya 18 | Multi-AZ dhidi ya Multi-Region: RTO/RPO, mikakati ya DR (pilot light, warm standby, active-active) |
| Sura ya 18 | AWS Backup (nakala rudufu za kati, za toka akaunti hadi akaunti), Elastic Disaster Recovery (pilot light inayosimamiwa) |
| Sura ya 24 | Aurora Global Database: read replicas za toka mkoa hadi mkoa, ucheleweshaji wa unakili < 1s |

Mifumo muhimu ya mtihani:

- "Hamia kiotomatiki kama RDS kuu ikishindwa" → RDS Multi-AZ (si Read Replica)
- "Hudumia usomaji kimataifa kwa ucheleweshaji mdogo" → Aurora Global Database
- "Pitisha trafiki kwa mkoa wa pili kama wa kwanza haupatikani" → Route 53 yenye Failover routing + ukaguzi wa afya
- "RTO ya dakika 1, RPO ya 0" → uwekaji wa Multi-AZ (si Multi-Region)
- "RTO ya dakika 15, toka mkoa hadi mkoa" → mkakati wa Pilot Light

---

## Kikoa cha 3: Design High-Performing Architectures (24%)

**Kazi ya 3.1 — Amua suluhu za uhifadhi za utendaji wa juu na/au zinazoweza kupanuka**

Dhana za msingi: S3 dhidi ya EBS dhidi ya EFS, uteuzi wa daraja la uhifadhi, S3 Transfer Acceleration, upakiaji wa sehemu nyingi, CloudFront kwa rasilimali.

| Sura       | Mada                                                                   |
|------------|-------------------------------------------------------------------------|
| Sura ya 5  | S3: uhifadhi wa vitu, madaraja ya uhifadhi, uwekaji matoleo, mzunguko wa maisha |
| Sura ya 6  | EBS: aina za uhifadhi wa block (gp3, io2, st1), EFS: uhifadhi wa faili wa pamoja |
| Sura ya 6  | Storage Gateway: daraja mseto la ndani hadi S3 (File, Volume, Tape)   |
| Sura ya 23 | Mabadiliko ya daraja la uhifadhi la S3, chaguzi za upataji za Glacier |
| Sura ya 25 | DataSync (usawazishaji wa faili mtandaoni), Transfer Family (SFTP→S3 inayosimamiwa), Snow Family (uhamishaji wa wingi nje ya mtandao — urithi: ilifungwa kwa wateja wapya mnamo Novemba 2025; AWS sasa inaelekeza kwa DataSync na Data Transfer Terminals), MGN (upangishaji upya wa seva) |
| Sura ya 28 | Right-sizing ya EBS, uhamiaji wa gp2→gp3, usimamizi wa picha za papo hapo |

Mifumo muhimu ya mtihani:

- "Mfumo wa faili wa pamoja unaofikiwa kutoka vipengele vingi vya EC2" → EFS (si EBS; EBS inaambatishwa kwa kipengele kimoja)
- "IOPS ya juu kwa mzigo wa hifadhidata" → io2 EBS
- "Punguza gharama kwa faili zisizofikiwa kwa siku 90" → sera ya mzunguko wa maisha ya S3 → Glacier
- "Pakia faili kubwa kutoka maeneo ya mbali haraka" → S3 Transfer Acceleration
- "Wiki za uhamishaji juu ya bandwidth ndogo" → mtihani wa SAA-C03 bado unatarajia Snowball, licha ya kufungwa kwa Snow Family kwa wateja wapya mnamo 2025

---

**Kazi ya 3.2 — Amua suluhu za kompyuta za utendaji wa juu na/au zinazoweza kupanuka**

Dhana za msingi: Familia za vipengele vya EC2, vichakataji vya Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| Sura       | Mada                                                                                   |
|------------|-----------------------------------------------------------------------------------------|
| Sura ya 4  | Aina za vipengele vya EC2: zilizoboreshwa kwa kompyuta (c), kwa kumbukumbu (r), madhumuni ya jumla (m, t) |
| Sura ya 7  | Auto Scaling: kupanua kwa usawa kwa tabaka za wavuti                                    |
| Sura ya 20 | Lambda: uanzishaji wa wakati mmoja, provisioned concurrency (kwa ucheleweshaji thabiti) |
| Sura ya 21 | ECS Fargate: vyombo bila seva                                                           |
| Sura ya 21 | AWS Batch: kompyuta ya bechi inayosimamiwa kwa vyombo vya Docker, inayotegemea Spot    |
| Sura ya 27 | Spot Instances kwa mzigo wa bechi unaovumilia hitilafu                                  |

Mifumo muhimu ya mtihani:

- "Mzigo wa mafunzo ya ML, punguza gharama, unaweza kukatizwa" → Spot Instances
- "Jibu thabiti la Lambda chini ya 100ms" → Provisioned concurrency (inaondoa kuanza baridi)
- "Microservice ya vyombo, hakuna usimamizi wa miundombinu" → ECS Fargate

---

**Kazi ya 3.3 — Amua suluhu za hifadhidata za utendaji wa juu**

Dhana za msingi: RDS dhidi ya DynamoDB dhidi ya Aurora dhidi ya Redshift dhidi ya ElastiCache, mifumo ya ufikiaji, read replicas, DAX.

| Sura       | Mada                                                              |
|------------|--------------------------------------------------------------------|
| Sura ya 8  | RDS: hifadhidata za uhusiano zinazosimamiwa, wakati wa kutumia RDBMS |
| Sura ya 9  | DynamoDB: NoSQL, partition keys, GSI, DAX (cache ya kumbukumbu)   |
| Sura ya 10 | ElastiCache: Redis dhidi ya Memcached, mikakati ya cache          |
| Sura ya 10 | MemoryDB for Redis: hifadhidata kuu ya kudumu inayopatana na Redis |
| Sura ya 24 | Aurora: utendaji, Serverless v2, read replicas, Global Database   |
| Sura ya 29 | DynamoDB on-demand dhidi ya provisioned capacity na Auto Scaling  |

Mifumo muhimu ya mtihani:

- "Usomaji wa mikrosekunde kwa duka la kipindi" → ElastiCache Redis au DAX (kama backend ni DynamoDB)
- "Ufikiaji wa ufunguo-thamani wa upitishaji wa juu na schema rahisi" → DynamoDB
- "Joins changamano na miamala ya ACID" → Aurora au RDS
- "Uchambuzi wa petabaiti za data iliyopangwa" → Redshift (haijashughulikiwa kwa kina lakini ishara: "data warehouse" → Redshift)

---

**Kazi ya 3.4 — Amua miundo ya mtandao ya utendaji wa juu na/au inayoweza kupanuka**

Dhana za msingi: CloudFront, Global Accelerator, Direct Connect, VPN, placement groups, enhanced networking.

| Sura       | Mada                                                              |
|------------|--------------------------------------------------------------------|
| Sura ya 7  | NLB (Layer 4) na GWLB (Gateway Load Balancer kwa vifaa vya mtandao) |
| Sura ya 11 | Client VPN: ufikiaji uliosimbwa wa kifaa binafsi kwa VPC          |
| Sura ya 12 | Route 53: sera za upitishaji: latency-based, geolocation, weighted |
| Sura ya 13 | CloudFront: CDN, uchakatishaji wa ukingo, Lambda@Edge             |
| Sura ya 25 | AWS Global Accelerator: upitishaji wa Anycast kwenye uti wa mgongo wa AWS |
| Sura ya 25 | Direct Connect: muunganisho wa faragha uliojitolea               |
| Sura ya 30 | VPC Endpoints: muunganisho wa faragha kwa huduma za AWS           |

Mifumo muhimu ya mtihani:

- "Punguza ucheleweshaji kwa watumiaji wa kimataifa wanaofikia majibu ya API ya kibadiliko" → Global Accelerator (si CloudFront, ambayo ni bora kwa maudhui yanayoweza kuhifadhiwa)
- "Punguza ucheleweshaji kwa rasilimali tuli kimataifa" → CloudFront
- "Muunganisho wa faragha thabiti kwa AWS kutoka eneo la ndani" → Direct Connect
- "Upakiaji wa haraka kutoka kwa wateja duniani kote kuingia ndoo yako ya S3" → S3 Transfer Acceleration

---

**Kazi ya 3.5 — Amua suluhu za uingizaji na ubadilishaji wa data za utendaji wa juu**

Dhana za msingi: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Sura       | Mada                                                               |
|------------|---------------------------------------------------------------------|
| Sura ya 26 | Kinesis Data Streams: usindikaji wa matukio wenye mpangilio wa wakati halisi |
| Sura ya 26 | Amazon Data Firehose (zamani Kinesis Data Firehose): utoaji unaosimamiwa kwa S3, Redshift, OpenSearch |
| Sura ya 26 | AWS Glue: ETL bila seva, Data Catalog, Crawlers                    |
| Sura ya 26 | Athena: SQL bila seva kwenye S3                                    |
| Sura ya 26 | QuickSight: dashibodi za BI zinazosimamiwa, injini ya kumbukumbu ya SPICE |
| Sura ya 26 | Lake Formation: udhibiti wa ufikiaji wa kina wa ziwa la data       |

Mifumo muhimu ya mtihani:

- "Sindika data ya click-stream kwa wakati halisi" → Kinesis Data Streams + Lambda au Managed Service for Apache Flink (zamani Kinesis Data Analytics)
- "Toa data ya utiririshaji kwa S3 kwa uchambuzi wa baadaye" → Amazon Data Firehose
- "Badilisha na orodhesha data kutoka vyanzo vingi" → AWS Glue
- "Hoji data ya kihistoria iliyohifadhiwa katika S3 na SQL" → Athena

---

## Kikoa cha 4: Design Cost-Optimized Architectures (20%)

**Kazi ya 4.1 — Buni suluhu za uhifadhi zilizoboreshwa kwa gharama**

| Sura       | Mada                                                              |
|------------|--------------------------------------------------------------------|
| Sura ya 23 | Sera za mzunguko wa maisha za S3, mabadiliko ya daraja la uhifadhi |
| Sura ya 28 | Right-sizing ya EBS, uhamiaji wa gp2→gp3, sheria za mzunguko wa maisha za uwekaji matoleo wa S3 |
| Sura ya 28 | EFS Intelligent-Tiering, cost allocation tags, AWS Budgets         |

Mifumo muhimu ya mtihani:

- "Tambua timu inayozalisha gharama nyingi zaidi za S3" → cost allocation tags + Cost Explorer
- "Punguza gharama kwa vitu vinavyofikiwa mara chache kiotomatiki" → S3 Intelligent-Tiering
- "Arifu wakati gharama za kila mwezi zinazidi $10,000" → AWS Budgets

---

**Kazi ya 4.2 — Buni suluhu za kompyuta zilizoboreshwa kwa gharama**

| Sura       | Mada                                                                            |
|------------|----------------------------------------------------------------------------------|
| Sura ya 2  | Outposts: rafu ya AWS ya ndani (gharama ya mtaji dhidi ya maelewano ya opex ya wingu) |
| Sura ya 2  | Wavelength: kompyuta ya ukingo wa 5G (ushirikiano wa mawasiliano, uwekaji unaotegemea ucheleweshaji) |
| Sura ya 27 | Bei ya EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Sura ya 20 | Lambda: lipa kwa uanzishaji (gharama sifuri ya usubiri)                          |

Mifumo muhimu ya mtihani:

- "Punguza gharama kwa mzigo wa uzalishaji wa hali thabiti" → Savings Plans (rahisi zaidi) au Reserved Instances
- "Punguza gharama kwa kazi za bechi zinazoweza kukatizwa" → Spot Instances
- "Usindikaji unaoendelewa na matukio wenye gharama sifuri ya usubiri" → Lambda

---

**Kazi ya 4.3 — Buni suluhu za hifadhidata zilizoboreshwa kwa gharama**

| Sura       | Mada                                              |
|------------|---------------------------------------------------|
| Sura ya 29 | DynamoDB on-demand dhidi ya provisioned + Auto Scaling |
| Sura ya 29 | RDS na ElastiCache Reserved Instances/Nodes       |
| Sura ya 29 | Usimamizi wa picha za papo hapo za RDS            |

Mifumo muhimu ya mtihani:

- "Trafiki ya DynamoDB isiyotabirika" → hali ya on-demand capacity
- "Trafiki thabiti ya DynamoDB yenye vilele vinavyojulikana" → Provisioned + Auto Scaling
- "Punguza gharama za RDS kwa mzigo thabiti" → Reserved Instances (mwaka 1 au 3)

---

**Kazi ya 4.4 — Buni miundo ya mtandao iliyoboreshwa kwa gharama**

| Sura       | Mada                                                                                         |
|------------|-----------------------------------------------------------------------------------------------|
| Sura ya 30 | Bei ya uhamishaji wa data: kuingia (bila malipo), toka AZ hadi AZ ($0.01/GB), toka mkoa hadi mkoa, intaneti ($0.09/GB) |
| Sura ya 30 | NAT Gateway ($0.045/GB) dhidi ya VPC Endpoints (Gateway: bila malipo; Interface: inatozwa)   |
| Sura ya 30 | CloudFront kama kiboreshaji cha gharama ya uhamishaji wa data                                 |

Mifumo muhimu ya mtihani:

- "EC2 katika subnet ya faragha inaita S3 — ondoa gharama za NAT Gateway" → S3 Gateway Endpoint (bila malipo)
- "EC2 katika subnet ya faragha inaita SQS — punguza gharama za NAT Gateway" → SQS Interface Endpoint
- "Punguza gharama za uhamishaji wa data kwa utoaji wa maudhui wa kimataifa" → CloudFront (uchakatishaji unapunguza maombi ya chanzo)

---

## Mada za Vikoa Mbalimbali

Baadhi ya mada zinaonekana katika vikoa vingi:

| Mada                               | Vikoa   | Sura         |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | Vyote   | 31           |
| Mapitio ya usanifu na ADR          | Vyote   | 32           |
| Hoja ya maelewano ("inategemea")   | Vyote   | 33           |
| Muundo wa Multi-AZ                  | 2, 3    | 7, 8, 18, 24 |
| Ufuatiliaji na uangalizi           | 1, 2    | Katika kitabu chote |
| CloudFront                         | 3, 4    | 13, 30       |

---

## Orodha ya Ukaguzi ya Kabla ya Mtihani

Kabla ya kukaa SAA-C03:

**Maeneo yenye uzito mkubwa (yana uwezekano mkubwa wa kuonekana)**

- [ ] Mantiki ya tathmini ya sera ya IAM (kukataa wazi → kuruhusu wazi → kukataa isiyo wazi)
- [ ] Vipengele vya VPC: subnet, jedwali za njia, IGW, NAT Gateway, security groups, NACL
- [ ] Madaraja ya uhifadhi ya S3 na wakati wa kutumia kila moja
- [ ] RDS Multi-AZ dhidi ya Read Replica (kuhamia dhidi ya kupanua usomaji)
- [ ] SQS dhidi ya SNS dhidi ya EventBridge (kuvuta dhidi ya kusukuma dhidi ya kupitisha matukio)
- [ ] Mifano ya bei ya EC2: Spot kwa unaovumilia hitilafu, Savings Plans kwa mzigo uliojitolewa
- [ ] Vichocheo na uanzishaji wa wakati mmoja wa Lambda
- [ ] DynamoDB dhidi ya Aurora dhidi ya Redshift (mfumo wa ufikiaji huamua chaguo)
- [ ] CloudFront: CDN kwa tuli, Global Accelerator kwa kibadiliko

**Mitego ya kawaida**

- [ ] EBS inaambatishwa kwa kipengele KIMOJA; EFS ni ya pamoja
- [ ] RDS Read Replicas ni kwa kupanua usomaji, SI kuhamia kiotomatiki (hilo ni Multi-AZ)
- [ ] NACL ni stateless (zinahitaji sheria za kuingia na za kutoka)
- [ ] Gateway Endpoints ni za bure na za S3 na DynamoDB pekee
- [ ] Kinesis inahifadhi na kurudia; SQS inafuta wakati wa matumizi
- [ ] "Tenganisha" haimaanishi kila wakati SQS — SNS fan-out na EventBridge pia ni mifumo ya kutenganisha
- [ ] Shield Standard ni ya bure na ya kiotomatiki; Advanced ni usajili wa kulipia
- [ ] ElastiCache dhidi ya MemoryDB: ElastiCache = cache (upotezaji wa data ni sawa). MemoryDB = hifadhidata kuu ya kudumu.
- [ ] Client VPN dhidi ya Site-to-Site VPN: Client VPN = vifaa binafsi. Site-to-Site = mtandao-kwa-mtandao.
- [ ] Outposts dhidi ya Wavelength: Outposts = rafu ya AWS ya ndani. Wavelength = ukingo wa 5G.
- [ ] DMS: aina ile ile = DMS moja kwa moja. Aina tofauti = SCT kwanza, kisha DMS.
- [ ] DataSync inahamisha *faili*; DMS inahamisha *hifadhidata*; MGN inahamisha *seva nzima*.

**Muundo wa mtihani**

- Maswali 65, dakika 130 (saa 2 dakika 10)
- Chaguo nyingi (jibu moja sahihi) na majibu mengi (chagua N sahihi)
- Alama ya kufaulu: 720 kati ya 1000
- Maswali yasiyopimwa yamejumuishwa; huwezi kujua ni yapi
- Simamia muda: ~dakika 2 kwa swali; weka alama magumu na urudi
