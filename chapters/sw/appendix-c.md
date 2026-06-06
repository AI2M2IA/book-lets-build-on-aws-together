# Kiambatisho C: Daftari la Dhana

Kila dhana muhimu iliyoanzishwa katika kitabu hiki, ikioanishwa na sura yake, mfano uliotumika, na kikoa cha SAA-C03 ambapo inaonekana.

Tumia hii kama faharasa ya kusoma: ikiwa hauna uhakika kuhusu dhana kabla ya mtihani, ipate hapa na urudi kwenye sura yake kwa muktadha.

---

## A

**ACM (AWS Certificate Manager)** — Vyeti vya umma vya TLS bila malipo kwa ALB, CloudFront, na API Gateway, vikiwa na kurejesha kiotomatiki kupitia uthibitishaji wa DNS. Vyeti vya CloudFront lazima viishi katika us-east-1. Sura ya 16. Kikoa cha 1.

**ACU (Aurora Capacity Unit)** — Kitengo cha kupima uwezo wa Aurora Serverless v2. Inapanua kiotomatiki na, kwenye matoleo ya injini yanayoungwa mkono, inaweza kusimama-kiotomatiki hadi ACU 0 wakati hakuna miunganisho iliyoshikiliwa wazi. Sura ya 24. Kikoa cha 3.

**Alarm (CloudWatch)** — Sheria inayowaka wakati metriki inapovuka kizingiti, ikizindua arifa au kitendo cha kupanua kiotomatiki. Sura ya 7. Kikoa cha 2.

**ALB (Application Load Balancer)** — Kisambazaji cha mzigo cha Layer 7 kinachopitisha trafiki ya HTTP/HTTPS kulingana na sheria za njia na mwenyeji. Sura ya 7. Kikoa cha 2.

**AMI (Amazon Machine Image)** — Templeti inayobeba OS, programu, na usanidi kwa kipengele cha EC2. Sura ya 4. Kikoa cha 3.

**Mtazamo wa mhandisi** — Kuuliza "ni nini kinaharibika kwanza, tunajuaje, na mtu anafanya nini saa 3 asubuhi?" badala ya tu "hii inafanya kazije?" Sura ya 32, Sura ya 34. Vikoa mbalimbali.

**Architecture Decision Record (ADR)** — Hati fupi inayonasa uamuzi, mbadala wake, sababu yake, na kitu gani kingesababisha kuufikiria upya. Sura ya 32. Vikoa mbalimbali.

**Mapitio ya usanifu** — Mchakato uliopangwa unaofunika: vikwazo → yasiyojulikana → chaguzi → njia za hitilafu → ufuatiliaji → runbooks. Sura ya 32. Vikoa mbalimbali.

**Athena** — Huduma ya hoja za SQL bila seva kwa data katika S3. Lipa kwa TB iliyochanganuliwa. Bora zaidi na fomati za safu za Parquet/ORC. Sura ya 26. Kikoa cha 3.

**Auto Scaling Group (ASG)** — Kundi la vipengele vya EC2 vinavyosimamiwa pamoja, vikibadilisha kiotomatiki vipengele visivyo na afya na kupanua kulingana na mzigo. Sura ya 7. Kikoa cha 2, 3.

**Availability Zone (AZ)** — Kituo kimoja au zaidi cha data kilichotenganishwa kimwili ndani ya mkoa, kilichounganishwa na viungo vya ucheleweshaji mdogo. Sura ya 2. Kikoa cha 2.

---

## B

**AWS Backup** — Nakala rudufu za kati, zinazotegemea sera, katika EBS, RDS, DynamoDB, EFS, na Storage Gateway. Inaunga mkono nakala za toka mkoa hadi mkoa na za toka akaunti hadi akaunti. Sura ya 18, 23. Kikoa cha 2.

**AWS Batch** — Kompyuta ya bechi inayosimamiwa kwa vyombo vya Docker. Imeundwa na ufafanuzi wa kazi (kitu cha kuendesha), foleni ya kazi (mahali kazi zinasubiri), na mazingira ya kompyuta (EC2 au Fargate, On-Demand au Spot). Kwa mzigo unaozidi kikomo cha dakika 15 cha Lambda. Sura ya 21. Kikoa cha 3.

**Bucket (S3)** — Chombo cha vitu vya S3. Ndoo zina majina ya kipekee ya kimataifa na zinaishi katika mkoa maalum. Sura ya 5. Kikoa cha 3.

**Bucket policy** — Sera inayotegemea rasilimali iliyoambatishwa kwa ndoo ya S3 inayodhibiti ufikiaji kwa principals za IAM na akaunti za nje. Sura ya 5. Kikoa cha 1.

---

## C

**Mfumo wa cache-aside** — Programu inakagua cache kwanza; ikikosa, inahoji hifadhidata, kisha inahifadhi matokeo katika cache. Sura ya 10. Kikoa cha 3.

**Cache hit rate** — Asilimia ya maombi yanayohudumiwa kutoka cache badala ya chanzo. Juu ni bora zaidi. Sura ya 13. Kikoa cha 3.

**AWS Client VPN** — Endpoint ya OpenVPN inayosimamiwa. Inaunganisha vifaa binafsi (kompyuta za mkononi, vituo vya kazi) na VPC kupitia intaneti. Uthibitishaji kupitia Active Directory, ushirikiano wa SAML 2.0 na mtoa huduma wa utambulisho, au TLS ya pande zote. Inaunga mkono hali za split-tunnel na full-tunnel. Linganisha na Site-to-Site VPN (mtandao-kwa-mtandao). Sura ya 11. Kikoa cha 1.

**CloudFront** — CDN ya AWS. Inahifadhi maudhui katika edge locations zaidi ya 750 duniani kote. Inapunguza ucheleweshaji na gharama za uhamishaji wa data wa chanzo. Sura ya 13. Kikoa cha 3, 4.

**CloudTrail** — Inarekodi kila wito wa API wa AWS: nani, nini, lini, kutoka wapi. Inahifadhiwa katika S3. Inatumika kwa ukaguzi na uchunguzi wa matukio. Kikoa cha 1.

**CloudWatch** — Metriki, logi, alarms, na dashibodi kwa rasilimali za AWS na programu za kawaida. Inarejelewa katika kitabu chote. Vikoa vyote.

**Amazon Cognito** — Uthibitishaji kwa watumiaji wa mwisho wa programu yako: User Pools ni saraka ya watumiaji inayosimamiwa (kujiandikisha, kuingia, MFA, kuingia kwa kijamii, JWT); Identity Pools zinatoa vitambulisho vya muda vya AWS. IAM ni kwa wahandisi wako; Cognito ni kwa wateja wako. Sura ya 14. Kikoa cha 1.

**Cold start (Lambda)** — Ucheleweshaji kwenye uanzishaji wa kwanza (au baada ya kutofanya kazi) Lambda inapoanzisha mazingira ya utekelezaji. Tumia provisioned concurrency kuondoa. Sura ya 20. Kikoa cha 3.

**Compute Savings Plan** — Kujitolea kwa kiasi cha dola cha matumizi ya saa ya EC2, kinachotumika kwa aina au ukubwa wowote wa kipengele. Sura ya 27. Kikoa cha 4.

**Config (AWS)** — Inafuatilia mabadiliko ya usanidi wa rasilimali za AWS kwa muda na kutathmini utii dhidi ya sheria. Sura ya 31. Kikoa cha 1.

**AWS Control Tower** — Inafanya kiotomatiki utawala wa akaunti nyingi: inajenga landing zone (akaunti za usimamizi, kumbukumbu ya logi, na ukaguzi) yenye guardrails katika dakika — toleo la kutengeneza la kuunganisha Organizations, CloudTrail, na Config kwa mkono. Sura ya 14. Kikoa cha 1.

**Cross-AZ data transfer** — Trafiki kati ya Availability Zones ndani ya mkoa. Inatozwa kwa $0.01/GB kila mwelekeo. Sura ya 30. Kikoa cha 4.

**Cross-region replication** — Kunakili data (S3 CRR, Aurora Global, DynamoDB Global Tables) kwa mkoa tofauti. Inasababisha gharama za uhamishaji wa data. Sura ya 18, 23, 30. Kikoa cha 2.

---

## D

**AWS DataSync** — Uhamiaji na usawazishaji unaotegemea wakala wa share za faili (NFS/SMB) kuingia S3, EFS, au FSx. "rsync iliyoboreshwa, na console ya AWS." Sura ya 25. Kikoa cha 3.

**DAX (DynamoDB Accelerator)** — Cache ya kumbukumbu mahususi kwa DynamoDB. Ucheleweshaji wa usomaji wa mikrosekunde. Sura ya 9. Kikoa cha 3.

**Dead Letter Queue (DLQ)** — Foleni ambapo ujumbe unaoshindwa kusindikwa mara kwa mara unatumwa, ukizuia kuziba kwa foleni. Sura ya 19. Kikoa cha 2.

**AWS DMS (Database Migration Service)** — Inahamisha hifadhidata kuingia AWS ikiwa na muda mdogo wa kutokufanya kazi. Full load (nakala ya awali) pamoja na CDC (Change Data Capture) inaweka chanzo na lengo vikilingana wakati wa uhamiaji. Uhamiaji wa aina ile ile (injini ile ile): tumia DMS moja kwa moja. Uhamiaji wa aina tofauti (injini tofauti, k.m. Oracle → Aurora PostgreSQL): tumia SCT (Schema Conversion Tool) kwanza, kisha DMS. Sura ya 8. Kikoa cha 3.

**Dedicated Host** — Seva ya kimwili ya EC2 iliyohifadhiwa kwa matumizi yako pekee. Inahitajika kwa leseni fulani za programu. Sura ya 27. Kikoa cha 4.

**Defense in depth** — Kuweka tabaka za udhibiti wa usalama nyingi (IAM + security groups + NACL + WAF + GuardDuty) ili kuvuja kwa tabaka moja kusifichue mfumo. Sura ya 33. Kikoa cha 1.

**Direct Connect** — Muunganisho wa mtandao wa faragha uliojitolea kutoka eneo la ndani hadi AWS. Thabiti zaidi kuliko VPN. Sura ya 25. Kikoa cha 3.

**DLQ** — Ona Dead Letter Queue.

**DynamoDB** — Hifadhidata ya NoSQL inayosimamiwa kikamilifu yenye ucheleweshaji wa millisekunde za tarakimu moja kwa kiwango chochote. Mfano wa ufunguo-thamani na hati. Sura ya 9. Kikoa cha 3.

**DynamoDB Auto Scaling** — Inarekebisha kiotomatiki uwezo wa provisioned wa usomaji/uandishi kulingana na metriki za CloudWatch. Sura ya 29. Kikoa cha 4.

**DynamoDB Streams** — Logi ya mabadiliko yenye mpangilio wa wakati ya mabadiliko yote ya vitu katika jedwali la DynamoDB. Inatumika na Lambda kwa usindikaji unaoendelewa na matukio. Sura ya 9. Kikoa cha 2.

---

## E

**EBS (Elastic Block Store)** — Uhifadhi wa block ulioambatishwa kwa kipengele kimoja cha EC2. Hudumu kwa kujitegemea. Aina: gp3, io2, st1. Sura ya 6. Kikoa cha 3.

**EC2 (Elastic Compute Cloud)** — Mashine za kawaida katika wingu. Sura ya 4. Kikoa cha 3.

**ECS (Elastic Container Service)** — Uratibu wa vyombo unaosimamiwa. Aina ya uzinduzi ya Fargate inaondoa usimamizi wa seva. Sura ya 21. Kikoa cha 2, 3.

**EFS (Elastic File System)** — Mfumo wa faili wa NFS wa pamoja unaofikiwa kutoka vipengele vingi vya EC2. Inapanua kiotomatiki. Madaraja ya uhifadhi ni pamoja na Standard, Infrequent Access, na Archive, ikiwa na Intelligent-Tiering kwa uhamishaji wa kiotomatiki kati ya madaraja. Sura ya 6. Kikoa cha 3.

**EKS (Elastic Kubernetes Service)** — Ndege la udhibiti la Kubernetes linalosimamiwa kwenye AWS. Sura ya 21. Kikoa cha 3.

**Elastic Disaster Recovery (DRS)** — Unakili endelevu wa kiwango cha block wa seva (za ndani au EC2) kuingia eneo la maandalizi la gharama nafuu, ikiwa na vipengele vya uokoaji vinavyozinduliwa katika dakika — pilot light inayosimamiwa. Sura ya 18. Kikoa cha 2.

**ElastiCache** — Uchakatishaji wa kumbukumbu unaosimamiwa. Redis (vipengele tajiri zaidi) au Memcached (rahisi zaidi). Sura ya 10. Kikoa cha 3.

**Elastic IP** — Anwani ya IP ya umma tuli unayoweza kutenga na kuunganisha tena na vipengele vya EC2. Sura ya 11. Kikoa cha 3.

**Usimbaji wa bahasha** — Mfumo ambapo data inasimbwa na data key (DEK), na DEK inasimbwa na master key (CMK katika KMS). Sura ya 16. Kikoa cha 1.

**EventBridge** — Basi la matukio kwa kupitisha matukio kutoka huduma za AWS, washirika wa SaaS, na vyanzo vya kawaida kwa malengo. Inaunga mkono sheria za ratiba. Sura ya 22. Kikoa cha 2.

**Explicit deny** — Taarifa ya kukataa ya IAM ambayo haiwezi kupinduliwa na kuruhusu yoyote. Inachukua kipaumbele juu ya kuruhusu zote. Sura ya 3. Kikoa cha 1.

---

## F

**Failover routing (Route 53)** — Inapitisha trafiki kwa endpoint ya pili wakati ya kwanza inashindwa ukaguzi wa afya. Sura ya 12. Kikoa cha 2.

**Fargate** — Injini ya kompyuta bila seva kwa ECS na EKS. Hakuna vipengele vya EC2 vya kusimamia. Sura ya 21. Kikoa cha 3.

**Mfumo wa fan-out** — Topic moja ya SNS inatoa ujumbe ule ule kwa foleni nyingi za SQS kwa wakati mmoja. Sura ya 19. Kikoa cha 2.

**FIFO queue (SQS)** — Usindikaji wa mara-moja-tu, mpangilio mkali. Upitishaji wa chini kuliko standard queues. Sura ya 19. Kikoa cha 2.

**Njia ya hitilafu** — Njia maalum ambayo mfumo unaweza kushindwa. Kutambua njia za hitilafu kabla ya uzalishaji ndio kiini cha mapitio ya usanifu. Sura ya 32. Vikoa mbalimbali.

---

## G

**Gateway Endpoint** — Aina ya VPC endpoint ya bure kwa S3 na DynamoDB. Inapitisha trafiki kupitia mtandao wa faragha wa AWS, ikiondoa gharama za NAT Gateway. Sura ya 30. Kikoa cha 4.

**Gateway Load Balancer (GWLB)** — Kisambazaji cha mzigo cha Layer 3 kwa kuingiza vifaa vya mtandao vya kawaida vya wahusika wengine (ngome, IDS/IPS) ndani ya mtiririko wa trafiki. Sura ya 7. Kikoa cha 1.

**Geolocation routing (Route 53)** — Inapitisha kulingana na eneo la kijiografia la chanzo cha hoja ya DNS. Sura ya 12. Kikoa cha 3.

**Global Accelerator** — Inapitisha trafiki kwa edge ya AWS iliyo karibu zaidi kupitia Anycast, ikiboresha ucheleweshaji kwa programu za kibadiliko. Sura ya 25. Kikoa cha 3.

**Glue (AWS)** — ETL bila seva. Glue Crawlers zinagundua schema; Glue Jobs zinabadilisha data; Data Catalog inahifadhi metadata. Sura ya 26. Kikoa cha 3.

**GSI (Global Secondary Index)** — Index mbadala kwenye jedwali la DynamoDB ikiwa na partition key tofauti na sort key ya hiari. Inawezesha mifumo rahisi ya hoja. Sura ya 9. Kikoa cha 3.

**GuardDuty** — Huduma ya kugundua vitisho inayotumia ML kwenye CloudTrail, VPC Flow Logs, na logi za DNS kugundua shughuli zisizo za kawaida. Sura ya 17. Kikoa cha 1.

---

## H

**Health check (Route 53)** — Inafuatilia upatikanaji wa endpoint. Ukaguzi wa afya ulioshindwa unazindua failover routing. Sura ya 12. Kikoa cha 2.

**Hot partition (DynamoDB)** — Partition inayopokea trafiki isiyo sawia kwa sababu maombi mengi yanashiriki partition key ile ile. Sura ya 9. Kikoa cha 3.

---

## I

**IAM (Identity and Access Management)** — Inadhibiti uthibitishaji na uidhinishaji kwa akaunti za AWS. Watumiaji, vikundi, majukumu, sera. Sura ya 3, 14. Kikoa cha 1.

**IAM role** — Utambulisho wa IAM wenye vitambulisho vya muda, unaochukuliwa na huduma, watumiaji, au akaunti nyingine. Sura ya 3, 14. Kikoa cha 1.

**Idempotency** — Sifa ya operesheni inayozalisha matokeo yale yale ikiwa itaitwa mara moja au mara nyingi. Muhimu kwa mifumo iliyosambaa (marejesho, malipo, usindikaji wa agizo). Sura ya 32. Vikoa mbalimbali.

**Idempotency key** — Kitambulisho cha kipekee kwa operesheni, kinachokaguliwa kabla ya utekelezaji ili kuzuia usindikaji wa nakala. Sura ya 32. Vikoa mbalimbali.

**Interface Endpoint (PrivateLink)** — VPC endpoint kwa huduma nyingi za AWS. Inatozwa kwa saa + kwa GB. Inatoa muunganisho wa faragha bila intaneti au NAT. Sura ya 30. Kikoa cha 4.

**Internet Gateway (IGW)** — Inaruhusu vipengele katika subnet za umma kuwasiliana na intaneti. Inahitaji jedwali la njia la subnet kuwa na njia kwa IGW. Sura ya 11. Kikoa cha 3.

**"Inategemea"** — Jibu la kweli kwa maswali mengi ya usanifu, ambalo lazima daima likamilishwe: "Inategemea mfumo wa ufikiaji / kiwango / matokeo ya hitilafu / kikwazo cha gharama." Sura ya 33. Vikoa mbalimbali.

---

## K

**Kinesis Data Firehose** — Jina la zamani la Amazon Data Firehose: utoaji unaosimamiwa wa data ya utiririshaji kwa S3, Redshift, OpenSearch. Hakuna usimamizi wa mtumiaji. Maswali ya zamani ya mtihani yanaweza bado kutumia jina la zamani. Sura ya 26. Kikoa cha 3.

**Kinesis Data Streams** — Mtiririko wa matukio wenye mpangilio wa wakati halisi. Wa kudumu, unaoweza kurudiwa ndani ya dirisha la uhifadhi (saa 24 chaguo-msingi, hadi siku 365). Unapimwa kwa shards. Sura ya 26. Kikoa cha 3.

**KMS (Key Management Service)** — Inaunda, kuhifadhi, na kudhibiti funguo za kifani kwa usimbaji ikiwa imehifadhiwa. Sura ya 16. Kikoa cha 1.

---

## L

**Lambda** — Vitendo bila seva vinavyozinduliwa na matukio. Lipa kwa uanzishaji na kwa ms. Muda wa juu wa dakika 15. Sura ya 20. Kikoa cha 2, 3, 4.

**Lambda@Edge** — Vitendo vya Lambda vinavyoendesha kwenye edge locations za CloudFront, vikibadilisha maombi na majibu. Sura ya 13. Kikoa cha 3.

**AWS Lake Formation** — Tabaka la udhibiti wa ufikiaji wa ziwa la data lililounganishwa juu ya S3 na Glue Data Catalog. Inatoa ruhusa za kina katika kiwango cha jedwali, safuwima, na safu. Inarahisisha usanidi salama wa ziwa la data. Sura ya 26. Kikoa cha 3.

**Latency-based routing (Route 53)** — Inapitisha hoja za DNS kwa mkoa wa AWS wenye ucheleweshaji uliopimwa wa chini kabisa. Sura ya 12. Kikoa cha 3.

**Launch template** — Templeti yenye matoleo inayobainisha usanidi wa kipengele cha EC2 kwa Auto Scaling Groups. Sura ya 7. Kikoa cha 3.

**Least privilege** — Mbinu bora ya IAM: toa tu ruhusa zinazohitajika, si zaidi. Sura ya 3. Kikoa cha 1.

**Lifecycle policy (S3)** — Sheria zinazohamisha kiotomatiki vitu kwa madaraja ya uhifadhi nafuu au kuvifuta kulingana na umri. Sura ya 23. Kikoa cha 4.

**LSI (Local Secondary Index)** — Index mbadala kwenye jedwali la DynamoDB inayotumia partition key ile ile lakini sort key tofauti. Lazima iundwe wakati wa kuunda jedwali. Sura ya 9. Kikoa cha 3.

---

## M

**Amazon Macie** — Ugunduzi unaotegemea ML wa data nyeti (PII) katika S3 na kuashiria hatari za uwazi. GuardDuty inaangalia tabia; Macie inakagua kile kilichohifadhiwa. Sura ya 17. Kikoa cha 1.

**Memcached** — Injini ya uchakatishaji wa kumbukumbu rahisi, multi-threaded. Hakuna kudumu, hakuna miundo ya data. Tumia Redis isipokuwa unahitaji mahususi multi-threading kwa gharama ya vipengele. Sura ya 10. Kikoa cha 3.

**Amazon MemoryDB for Redis** — Hifadhidata kuu ya kumbukumbu ya kudumu, inayopatana na Redis. Tofauti na ElastiCache, MemoryDB inaandika kwa logi ya miamala ya Multi-AZ, ikihakikisha kudumu kwa data. Tumia wakati upatanifu wa API ya Redis unahitajika NA upotezaji wa data haukubaliki. Sura ya 10. Kikoa cha 3.

**MGN (AWS Application Migration Service)** — Kupangisha upya/kuinua-na-kuhamisha: unakili wa kiwango cha block wa seva nzima kuingia AWS, uzinduzi wa majaribio, kisha kuhamia kwa vipengele vya asili vya EC2. DataSync inahamisha faili; DMS inahamisha hifadhidata; MGN inahamisha seva. Sura ya 25. Kikoa cha 3.

**Amazon MQ** — Broker inayosimamiwa ya ActiveMQ/RabbitMQ inayozungumza itifaki za kawaida (AMQP, MQTT, STOMP). Kwa kuinua-na-kuhamisha mzigo wa broker uliopo bila mabadiliko ya nambuli; ujumbe wa greenfield → SQS/SNS. Sura ya 19. Kikoa cha 2.

**Multi-AZ (RDS)** — Nakala ya standby sambamba katika AZ tofauti ikiwa na kuhamia kiotomatiki. RPO ~0, RTO ~sekunde 60. Kwa upatikanaji wa juu, si kupanua usomaji. Sura ya 8, 18. Kikoa cha 2.

**Multi-Region** — Kupeleka vipengele vya programu katika mikoa mingi ya AWS kwa uzazi wa kijiografia na utendaji wa kimataifa. Ugumu na gharama za juu zaidi. Sura ya 18. Kikoa cha 2.

---

## N

**Network Load Balancer (NLB)** — Kisambazaji cha mzigo cha Layer 4 (TCP/UDP/TLS): mamilioni ya maombi kwa sekunde, IP tuli kwa kila AZ, inahifadhi IP chanzo. Hakuna ufahamu wa HTTP — hiyo ni kazi ya ALB. Sura ya 7. Kikoa cha 3.

**NACL (Network Access Control List)** — Ngome ya stateless katika kiwango cha subnet. Inahitaji sheria za kuingia na za kutoka. Sheria zinatathminiwa kwa mpangilio wa kinambari. Sura ya 15. Kikoa cha 1.

**NAT Gateway** — Inaruhusu vipengele katika subnet za faragha kufanya miunganisho ya kutoka kwa intaneti. Inatozwa $0.045/GB iliyochakatwa. Sura ya 11, 30. Kikoa cha 4.

---

## O

**Object (S3)** — Faili iliyohifadhiwa katika S3. Imeundwa na key (jina), value (data), na metadata. Ukubwa wa juu 5TB. Sura ya 5. Kikoa cha 3.

**On-Demand capacity (DynamoDB)** — Hali ya lipa kwa ombi. Ghali zaidi kwa ombi kuliko provisioned, lakini hakuna upangaji wa uwezo unaohitajika. Sura ya 29. Kikoa cha 4.

**On-Demand instances (EC2)** — Lipa kwa saa bila kujitolea. Unyumbufu wa juu, bei ya juu. Sura ya 27. Kikoa cha 4.

**AWS Outposts** — Rafu inayosimamiwa kikamilifu ya vifaa vya AWS iliyowekwa katika kituo cha data cha mteja au kituo cha pamoja cha eneo. Inaendesha huduma, API, na zana zile zile za AWS kama wingu la umma katika eneo lako. AWS inasimamia usakinishaji na uwekaji viraka; mteja anatoa nafasi ya rafu na umeme. Kwa ukaaji wa data, mzigo wa ndani wa ucheleweshaji mdogo, au senario zilizotenganishwa. Sura ya 2. Kikoa cha 4.

---

## P

**Partition key (DynamoDB)** — Kipengele cha ufunguo wa msingi kinachoamua ni partition gani inahifadhi kitu. Chagua ufunguo wa cardinality ya juu kwa usambazaji sawa. Sura ya 9. Kikoa cha 3.

**Permission boundary** — Sera ya IAM inayoweka ruhusa za juu ambazo utambulisho wa IAM unaweza kuwa nazo, hata kama sera nyingine zinatoa zaidi. Sura ya 14. Kikoa cha 1.

**Placement group** — Inadhibiti uwekaji wa kimwili wa vipengele vya EC2 kupunguza ucheleweshaji (cluster) au kuongeza upatikanaji (spread). Sura ya 4. Kikoa cha 3.

**PrivateLink** — Huduma ya AWS kwa kuunda endpoint za faragha kwa huduma zinazohifadhiwa katika AWS, zinazofikiwa kupitia Interface Endpoints. Sura ya 30. Kikoa cha 1.

**Provisioned concurrency (Lambda)** — Mazingira ya utekelezaji yaliyoanzishwa awali yanayoondoa ucheleweshaji wa kuanza baridi. Sura ya 20. Kikoa cha 3.

**Provisioned capacity (DynamoDB)** — Upitishaji wa usomaji na uandishi uliotengwa awali, unaopimwa kwa vitengo vya uwezo kwa sekunde. Nafuu zaidi kuliko on-demand kwa trafiki inayotabirika. Sura ya 9, 29. Kikoa cha 4.

---

## Q

**Amazon QuickSight** — Huduma ya akili ya biashara na uonyeshaji wa data inayosimamiwa. Inatumia SPICE (Super-fast, Parallel, In-memory Calculation Engine) kuhifadhi data kwa uonyeshaji wa haraka wa dashibodi. Inaunganisha na Athena, S3, Redshift, RDS, na vyanzo vingine vya data vya AWS. Hakuna seva ya BI ya kusimamia. Sura ya 26. Kikoa cha 3.

---

## R

**RDS (Relational Database Service)** — Hifadhidata ya uhusiano inayosimamiwa. Inashughulikia nakala rudufu, uwekaji viraka, kuhamia. Sura ya 8. Kikoa cha 3.

**RDS Proxy** — Inasimamia bwawa la miunganisho kati ya Lambda/programu na RDS, ikizuia kuisha kwa miunganisho. Sura ya 8. Kikoa cha 3.

**Read Replica (RDS)** — Nakala asiyo sambamba ya hifadhidata kwa kupanua usomaji. HAITOI kuhamia kiotomatiki. Sura ya 8, 24. Kikoa cha 3.

**Redis** — Duka la miundo ya data ya kumbukumbu linalotumika kwa uchakatishaji, usimamizi wa kipindi, mibao ya wanaoongoza ya wakati halisi, pub/sub. Sura ya 10. Kikoa cha 3.

**Reserved Instance (EC2)** — Kujitolea kutumia aina maalum ya kipengele katika mkoa maalum kwa mwaka 1 au 3 kwa kubadilishana na punguzo. Sura ya 27. Kikoa cha 4.

**Route 53** — Huduma ya DNS na msajili wa kikoa ya AWS. Inaunga mkono sera nyingi za upitishaji. Sura ya 12. Kikoa cha 2, 3.

**RPO (Recovery Point Objective)** — Upotezaji wa juu unaokubalika wa data unaopimwa kwa wakati. "Tunaweza kumudu kupoteza data kiasi gani?" Sura ya 18. Kikoa cha 2.

**RTO (Recovery Time Objective)** — Muda wa juu unaokubalika wa kurejesha huduma baada ya hitilafu. "Tunaweza kuwa chini kwa muda gani?" Sura ya 18. Kikoa cha 2.

**Runbook** — Maagizo ya hatua kwa hatua ya kuendesha mfumo, mahususi kwa kujibu matukio. "Mtu anafanya nini saa 3 asubuhi?" Sura ya 32. Vikoa mbalimbali.

---

## S

**S3 Intelligent-Tiering** — Inahamisha kiotomatiki vitu vya S3 kati ya madaraja ya ufikiaji kulingana na mifumo ya ufikiaji. Hakuna ada ya upataji. Sura ya 23. Kikoa cha 4.

**S3 Select** — Inapata sehemu ndogo ya maudhui ya kitu cha S3 kwa kutumia maneno ya SQL, ikipunguza uhamishaji wa data. Urithi: haipatikani kwa wateja wapya tangu katikati ya 2024 — Athena sasa ni njia kuu ya kuchuja na kuhoji data katika S3. S3 Object Lambda, ambayo zamani ilikuwa mbadala uliopendekezwa, yenyewe ni urithi (ilifungwa kwa wateja wapya mnamo Novemba 2025; mzigo uliopo unaendelea kufanya kazi). Sura ya 30. Kikoa cha 4.

**Savings Plan** — Mfano wa bei rahisi unaojitolea kwa kiasi cha dola cha matumizi ya saa kwa kubadilishana na punguzo. Rahisi zaidi kuliko Reserved Instances. Sura ya 27. Kikoa cha 4.

**SCP (Service Control Policy)** — Sera ya AWS Organizations inayozuia ruhusa za juu zinazopatikana kwa akaunti katika OU. Sura ya 14. Kikoa cha 1.

**Secrets Manager** — Inahifadhi na kuzungusha kiotomatiki siri (manenosiri ya hifadhidata, funguo za API). Sura ya 16. Kikoa cha 1.

**Security group** — Ngome ya kawaida ya stateful katika kiwango cha kipengele. Sheria za kuruhusu pekee; trafiki ya kurudi ni kiotomatiki. Sura ya 15. Kikoa cha 1.

**Shard (Kinesis)** — Kitengo cha msingi cha upitishaji katika Kinesis Data Streams: 1 MB/s kuandika, 2 MB/s kusoma. Sura ya 26. Kikoa cha 3.

**Shared Responsibility Model** — AWS inawajibika kwa usalama *wa* wingu (miundombinu); wewe unawajibika kwa usalama *ndani ya* wingu (data, usanidi, ufikiaji). Sura ya 1. Kikoa cha 1.

**Shield** — Ulinzi wa DDoS. Standard: bila malipo, kiotomatiki. Advanced: kulipia, ikiwa na msaada wa DRT na ulinzi wa kifedha. Sura ya 17. Kikoa cha 1.

**Snow Family** — Vifaa vya kimwili kwa uhamishaji wa data wa wingi nje ya mtandao (Snowball Edge: 80 TB) — kukodisha ndege ya mizigo badala ya kuendesha barabarani. Urithi (2026): Snowmobile na Snowcone zimekomeshwa; vifaa vya Snow vilifungwa kwa wateja wapya mnamo Novemba 2025 (AWS inaelekeza kwa DataSync na Data Transfer Terminals), lakini mtihani wa SAA-C03 bado unatarajia Snowball kwa "wiki za uhamishaji, bandwidth ndogo." Sura ya 25. Kikoa cha 3.

**SNS (Simple Notification Service)** — Ujumbe wa pub/sub. Inasukuma ujumbe kwa wajitokezaji wote kwa wakati mmoja. Mfumo wa fan-out. Sura ya 19. Kikoa cha 2.

**Sort key (DynamoDB)** — Kipengele cha pili cha hiari cha ufunguo wa msingi. Inawezesha hoja za masafa ndani ya partition. Sura ya 9. Kikoa cha 3.

**Spot Instances** — Vipengele vya EC2 vinavyotumia uwezo wa ziada kwa punguzo la 60-90%. Vinaweza kukatizwa na taarifa ya dakika 2. Kwa mzigo unaovumilia hitilafu pekee. Sura ya 27. Kikoa cha 4.

**SQS (Simple Queue Service)** — Foleni ya ujumbe inayosimamiwa. Inatenganisha watayarishaji na watumiaji. Standard (angalau-mara-moja) na FIFO (mara-moja-tu) queues. Sura ya 19. Kikoa cha 2.

**Step Functions** — Huduma ya uratibu wa mtiririko wa kazi bila seva. Mashine za hali kwa kuratibu huduma za AWS. Sura ya 22. Kikoa cha 2.

**AWS Storage Gateway** — Daraja kati ya uhifadhi wa ndani na wa wingu: inawasilisha miingiliano ya NFS/SMB (File), iSCSI (Volume), au tepi ya kawaida (Tape) kwa ndani huku ikidumisha data katika S3, Glacier, au picha za papo hapo za EBS. Sura ya 6. Kikoa cha 3.

---

## T

**Target tracking scaling** — Sera ya Auto Scaling inayorekebisha uwezo kudumisha thamani lengwa ya metriki (k.m. matumizi ya CPU ya 60%). Sura ya 7. Kikoa cha 2.

**AWS Transfer Family** — Endpoint ya SFTP/FTPS/FTP inayosimamiwa ikiwa na S3 au EFS. Washirika wanaweka wateja wao waliopo wa SFTP; faili zinatua moja kwa moja katika ndoo yako. Sura ya 25. Kikoa cha 3.

**Transit Gateway** — Topolojia ya mtandao ya kitovu-na-spoke inayounganisha VPC nyingi na mitandao ya ndani kupitia gateway ya kati. Sura ya 25. Kikoa cha 3.

**TTL (Time to Live)** — Alama ya wakati ambayo baada yake DynamoDB inafuta kiotomatiki kitu. Pia inatumika katika DNS (muda gani resolvers zinahifadhi rekodi) na uchakatishaji (muda gani thamani iliyohifadhiwa ni halali). Sura ya 9, 12. Kikoa cha 3.

---

## V

**VIF (Virtual Interface)** — Muunganisho wa kimantiki unaotumika na AWS Direct Connect. Public VIF inafikia endpoint za umma za AWS; Private VIF inafikia rasilimali za VPC. Sura ya 25. Kikoa cha 3.

**Visibility timeout (SQS)** — Kipindi ambacho ujumbe uliopokewa umefichwa kutoka kwa watumiaji wengine. Inaruhusu usindikaji bila watumiaji wengine kuona ujumbe ule ule. Sura ya 19. Kikoa cha 2.

**VPC (Virtual Private Cloud)** — Mtandao wa kawaida uliotengwa katika AWS. Una subnet, jedwali za njia, na gateways. Sura ya 11. Kikoa cha 1.

**VPC Endpoint** — Inaunganisha rasilimali za VPC na huduma za AWS kupitia mtandao wa faragha wa AWS. Gateway (bila malipo, S3/DynamoDB) na Interface (inatozwa, huduma nyingine nyingi). Sura ya 30. Kikoa cha 1, 4.

**VPC Flow Logs** — Inanasa taarifa kuhusu trafiki ya IP inayoenda kwa na kutoka kwa miingiliano ya mtandao katika VPC. Inatumika na GuardDuty na kwa utatuzi wa matatizo ya mtandao. Sura ya 17. Kikoa cha 1.

**VPC Peering** — Muunganisho wa mtandao kati ya VPC mbili unaowezesha trafiki kupita kati yao kwa kutumia anwani za IP za faragha. Sura ya 11. Kikoa cha 3.

---

## W

**WAF (Web Application Firewall)** — Inachuja trafiki ya HTTP/HTTPS kwa kutumia sheria (vizuizi vya IP, SQL injection, mipaka ya kasi). Inaambatishwa na CloudFront, ALB, au API Gateway. Sura ya 17. Kikoa cha 1.

**AWS Wavelength** — Miundombinu ya AWS iliyowekwa ndani ya mitandao ya watoa huduma za mawasiliano ya 5G kwenye ukingo wa redio. Inawezesha ucheleweshaji wa millisekunde za tarakimu moja kwa vifaa vya simu. Kwa AR/VR ya simu, michezo ya wakati halisi, telemetri ya magari ya kujiendesha, na video ya moja kwa moja kwenye ukingo wa 5G. Wavelength Zones ni viendelezi vya AWS Regions ndani ya mitandao ya mawasiliano. Sura ya 2. Kikoa cha 3.

**Well-Architected Framework** — Mfumo wa tathmini wa nguzo sita wa AWS: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Sura ya 31. Vikoa mbalimbali.

**Weighted routing (Route 53)** — Inasambaza hoja za DNS katika endpoint kwa uzito. Inatumika kwa upelekaji wa blue-green na upimaji wa A/B. Sura ya 12. Kikoa cha 3.

**Write-through caching** — Inasasisha cache kila wakati hifadhidata inaposasishwa. Data daima inalingana lakini cache inaweza kushikilia vitu vingi ambavyo havisomwi tena. Sura ya 10. Kikoa cha 3.

---

## Rejea ya Haraka ya Mifumo ya SAA-C03

| Kama mtihani unasema...                       | Fikiri...                                    |
|-----------------------------------------------|----------------------------------------------|
| "Tenganisha huduma"                           | SQS, SNS, EventBridge                        |
| "Fan-out kwa watumiaji wengi"                 | SNS + usajili wa SQS                         |
| "Matukio yenye mpangilio ya wakati halisi"    | Kinesis Data Streams                         |
| "Bila seva"                                   | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Ucheleweshaji mdogo wa kimataifa (kibadiliko)" | Global Accelerator                         |
| "Ucheleweshaji mdogo wa kimataifa (tuli/iliyohifadhiwa)" | CloudFront                        |
| "Ulinzi wa DDoS"                              | Shield (Standard: bila malipo; Advanced: kulipia) |
| "Zuia SQL injection kwenye ukingo"            | WAF                                          |
| "Gundua vitambulisho vilivyovuja"             | GuardDuty                                    |
| "Kagua shughuli za API"                       | CloudTrail                                   |
| "Zungusha vitambulisho vya hifadhidata"       | Secrets Manager                              |
| "Simba data ikiwa imehifadhiwa, funguo zinazosimamiwa na mteja" | KMS yenye CMK             |
| "Hifadhi thamani za usanidi"                  | SSM Parameter Store                          |
| "Uhifadhi wa hifadhidata wa IOPS ya juu"      | io2 EBS                                      |
| "Mfumo wa faili wa pamoja kwa EC2"            | EFS                                          |
| "Hoji data ya S3 na SQL"                      | Athena                                       |
| "Mfumo wa ETL kwa uchambuzi"                  | AWS Glue                                     |
| "Toa data ya utiririshaji kwa S3"             | Amazon Data Firehose                         |
| "Kazi za bechi zinazovumilia hitilafu, punguza gharama" | Spot Instances                     |
| "Mzigo wa uzalishaji thabiti uliojitolewa"    | Savings Plans                                |
| "Subnet ya faragha → S3 bila NAT"             | S3 Gateway Endpoint                          |
| "Subnet ya faragha → SQS bila NAT"            | SQS Interface Endpoint                       |
| "Multi-AZ kwa RDS"                            | Kuhamia kiotomatiki (si kupanua usomaji)     |
| "Read Replica kwa RDS"                        | Kupanua usomaji (si kuhamia kiotomatiki)     |
| "Muda wa uokoaji wa dakika 1–2, toka AZ hadi AZ" | Multi-AZ (RDS failover: sekunde 60–120)   |
| "Uokoaji katika mikoa, RTO ya dakika"         | Pilot Light au Warm Standby                  |
| "Active-Active, RTO sifuri"                   | Multi-Region Active-Active (changamano zaidi) |
| "Usindikaji wa bechi unaozidi muda wa Lambda" | AWS Batch                                    |
| "Inayopatana na Redis NA ya kudumu"           | MemoryDB for Redis                           |
| "Wahandisi wa mbali kufikia VPC kutoka nyumbani" | Client VPN                                |
| "Hamisha hifadhidata ikiwa na muda mdogo wa kutokufanya kazi" | DMS (+ SCT kwa aina tofauti) |
| "Dashibodi ya BI kwenye AWS"                  | QuickSight                                   |
| "Endesha AWS katika kituo chako cha data"     | Outposts                                     |
| "Kompyuta ya ukingo wa simu wa 5G"            | Wavelength                                   |
