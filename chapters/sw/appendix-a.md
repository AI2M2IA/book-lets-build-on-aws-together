# Kiambatisho A: Rejea ya Haraka ya Huduma za AWS

Kila huduma iliyoshughulikiwa katika kitabu hiki, kwa mpangilio wa kuanzishwa. Tumia hii kama rejea ya kusoma na kutafuta haraka wakati wa maandalizi ya mtihani.

---

## Kompyuta

**EC2 — Elastic Compute Cloud** *(Sura ya 4)*

Mashine za kawaida katika wingu. Unachagua aina ya kipengele (CPU, kumbukumbu, uhifadhi), mfumo wa uendeshaji, na mkoa. Unalipa kwa saa (On-Demand), kwa kujitolea (Vipengele Vilivyohifadhiwa / Mipango ya Akiba), au kwa nafasi za uwezo wa ziada (Nafasi). Kiholela cha kimsingi cha kompyuta.

Dhana muhimu: AMI (Amazon Machine Image), aina za vipengele (familia za t3, m6g, r6g, c6g), jozi za funguo, wasifu wa vipengele, vikundi vya uwekaji.

Ishara ya mtihani: Hali inayohitaji kompyuta ya kudumu, ya hali, au ya muda mrefu — EC2 au ECS. Hali inayohitaji kompyuta ya muda mfupi, iliyozinduliwa na tukio, au ya gharama-sifuri-ya-usubiri — Lambda.

---

**Kupanua Kiotomatiki + Kisambazaji cha Mzigo cha Programu** *(Sura ya 7)*

Vikundi vya Kupanua Kiotomatiki (ASG) huongeza na kuondoa vipengele vya EC2 kulingana na mzigo. Visambazaji vya Mzigo vya Programu (ALB) husambaza trafiki katika vipengele na kupitishia kwa njia au mwenyeji. Pamoja wanaunda tabaka la kupanua kwa usawa.

Dhana muhimu: Templeti ya uzinduzi, sera za kupanua (kufuatilia lengo, hatua, ratiba), ukaguzi wa afya, vikundi lengwa vya ALB, sheria za msikilizaji, upitishaji wa uzito.

Ishara ya mtihani: "Shughulikia mzigo unaobadilika" au "upatikanaji wa juu katika AZ" → ASG + ALB.

---

**Lambda** *(Sura ya 20)*

Vitendo bila seva. Unaandika nambuli; AWS inakiendesha kwa kujibu matukio. Hakuna seva za kusimamia. Unalipa kwa kila uanzishaji na kwa kila millisekunde ya utekelezaji. Inapanua kiotomatiki hadi maelfu ya uanzishaji wa wakati mmoja.

Dhana muhimu: Vyanzo vya matukio (API Gateway, S3, SQS, EventBridge, Kinesis), jukumu la utekelezaji, vikwazo vya uanzishaji wa wakati mmoja, uanzishaji uliotengwa na uliotolewa wa utekelezaji wa wakati mmoja, kuanza baridi, Tabaka, muda wa juu wa dakika 15.

Ishara ya mtihani: "Bila seva," "unaoendelewa na matukio," "kazi za muda mfupi," "gharama sifuri ya usubiri" → Lambda.

---

**ECS — Elastic Container Service** *(Sura ya 21)*

Inaendesha vyombo vya Docker kwenye AWS. Aina mbili za uzinduzi: EC2 (unasimamia mwenyeji) na Fargate (AWS inasimamia mwenyeji). ECS inasimamia ufafanuzi wa kazi, huduma, ratiba la nguzo, na muunganiko na visambazaji vya mzigo na ugunduzi wa huduma.

Dhana muhimu: Ufafanuzi wa kazi, huduma ya ECS, Fargate dhidi ya aina ya uzinduzi ya EC2, ECR (usajili wa vyombo), jukumu la IAM la kazi, kupanua kiotomatiki kwa huduma.

Ishara ya mtihani: "Mzigo wa vyombo," "microservices," "Docker kwenye AWS" → ECS (kawaida Fargate kwa vyombo bila seva).

---

**EKS — Elastic Kubernetes Service** *(Sura ya 21)*

Kubernetes inayosimamiwa. AWS inaendesha ndege la udhibiti; unasimamia nodi za wafanyakazi (EC2 au Fargate). Tumia EKS timu yako ikiwa tayari inatumia Kubernetes au ina mzigo unaohitaji vipengele maalum vya Kubernetes.

Ishara ya mtihani: "Kubernetes," "haja ya kuhamia mzigo wa K8s uliopo" → EKS. "Unahitaji tu vyombo bila mzigo wa K8s" → ECS.

---

## Uhifadhi

**S3 — Simple Storage Service** *(Sura ya 5)*

Uhifadhi wa vitu. Uwezo usio na kikomo, kudumu kwa tisa-tisa kumi na moja (99.999999999%). Huhifadhi faili kama vitu katika ndoo. Ndoo huishi katika mkoa. Vitu vinaweza kuwa kati ya baiti 0 na TB 5.

Dhana muhimu: Sera ya ndoo, ACL ya kitu, upigaji toleo, uandishi wa tovuti thabiti, URL zilizotiwa saini, upakiaji wa sehemu nyingi, Uongezaji wa Uhamishaji, madarasa ya uhifadhi (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Ishara ya mtihani: "Hifadhi na rejesha faili," "mali thabiti," "nakala," "ziwa la data" → S3. Darasa sahihi la uhifadhi linategemea mzunguko wa ufikiaji na kasi ya urejeshaji.

---

**EBS — Elastic Block Store** *(Sura ya 6)*

Uhifadhi wa kuzuia uliounganishwa na kipengele kimoja cha EC2. Hufanya kazi kama diski ngumu. Hudumu kwa kujitegemea na mzunguko wa maisha wa kipengele (unaweza kuunganisha na kuunganisha tena). Aina za kawaida zaidi: gp3 (SSD ya jumla, chaguo-msingi), io2 (IOPS iliyotolewa kwa hifadhidata), st1 (HDD iliyoimarishwa kwa uendeshaji kwa kusomwa kwa mfululizo).

Dhana muhimu: Picha (za ziada, zilizohifadhiwa katika S3), usimbaji fiche (KMS), Unganisho-Nyingi (io1/io2 tu), utolewa wa IOPS na uendeshaji.

Ishara ya mtihani: "Uhifadhi wa kudumu kwa EC2," "uhifadhi wa hifadhidata," "inahitaji ufikiaji wa kuzuia wa latency ndogo" → EBS.

---

**EFS — Elastic File System** *(Sura ya 6)*

Mfumo wa faili za pamoja, unaoweza kufikiwa kutoka vipengele vingi vya EC2 wakati mmoja. Itifaki ya NFS. Inapanua kiotomatiki. Ghali zaidi kuliko EBS kwa GB. Madarasa mawili ya uhifadhi: Standard na Infrequent Access. Intelligent-Tiering huhamisha faili kiotomatiki.

Ishara ya mtihani: "Mfumo wa faili wa pamoja," "vipengele vingi vya EC2 vinahitaji faili zile zile," "NFS" → EFS.

---

**Madarasa ya Uhifadhi wa S3 na Sera za Mzunguko wa Maisha** *(Sura ya 23)*

S3 Intelligent-Tiering huhamisha kiotomatiki vitu kati ya tabaka za ufikiaji kulingana na mzunguko wa ufikiaji. Sera za mzunguko wa maisha hubadilisha vitu kati ya madarasa (Standard → Standard-IA → Glacier) kulingana na sheria za umri. Madarasa ya uhifadhi wa Glacier yana ucheleweshaji wa urejeshaji kuanzia dakika (Glacier Instant) hadi masaa 12 (Glacier Deep Archive).

Ishara ya mtihani: "Punguza gharama za uhifadhi kwa data inayopatikana mara chache" → sera za mzunguko wa maisha, Intelligent-Tiering, au Glacier.

---

## Hifadhidata

**RDS — Relational Database Service** *(Sura ya 8)*

Hifadhidata za uhusiano zinazosimamiwa. Injini zinazosaidiwa: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, na Aurora (injini ya umiliki wa AWS). AWS inashughulikia nakala, kupiga kiraka, kushindwa hama, na upokezaji. Unasimamia muundo wa mpango, maswali, na kupanga saizi kwa vipengele.

Dhana muhimu: Usambazaji wa Multi-AZ (kushindwa hama kwa kiotomatiki, upokezaji wa wakati mmoja), Nakala za Kusomwa (za ucheleweshaji, kwa kupanua kusomwa), nakala za kiotomatiki (uhifadhi wa siku 1-35), picha za mkono (zimehifadhiwa mpaka kufutwa), RDS Proxy (kuweka mkusanyiko wa miunganisho).

Ishara ya mtihani: "Hifadhidata ya uhusiano," "miamala ya ACID," "mzigo wa SQL uliopo" → RDS au Aurora.

---

**Aurora** *(Sura ya 24)*

Injini ya hifadhidata ya uhusiano ya AWS, inayooana na MySQL na PostgreSQL. Injini ya uhifadhi iliyosambazwa inayopokezea data katika AZ 3 katika nakala 6. Kwa kawaida mara 5 haraka zaidi kuliko MySQL. Aurora Serverless v2 hupanua uwezo kiotomatiki (hupimwa kwa ACU — Aurora Capacity Units).

Dhana muhimu: Nguzo ya Aurora (mwandishi + hadi sehemu za mwisho za wasomaji 15), Aurora Global Database (nakala za kusomwa za toka kanda hadi kanda zenye ucheleweshaji wa upokezaji wa < sekunde 1), Aurora Serverless v2.

Ishara ya mtihani: "Hifadhidata ya uhusiano ya utendaji wa juu," "inaoana na MySQL/PostgreSQL," "masomo ya kimataifa," "mzigo unaobadilika" → Aurora.

---

**DynamoDB** *(Sura ya 9)*

Hifadhidata ya NoSQL inayosimamiwa kikamilifu. Mfano wa thamani-muhimu na hati. Inapanua kwa uendeshaji wowote na utendaji wa millisekunde moja. Hali mbili za uwezo: wa hiari (lipa kwa ombi) na wa kutolewa (lipa kwa kitengo cha uwezo kwa saa, na Kupanua Kiotomatiki).

Dhana muhimu: Ufunguo wa sehemu (unahitajika), ufunguo wa kupanga (hiari), Faharisi ya Pili ya Kimataifa (GSI), Faharisi ya Pili ya Ndani (LSI), DynamoDB Streams (kunasa data ya mabadiliko), DynamoDB Accelerator (DAX) — kashe ya kwenye kumbukumbu, TTL (Muda wa Kuishi), miamala.

Ishara ya mtihani: "Ufikiaji wa kasi wa juu wa ufunguo," "mpango wa kubadilika," "NoSQL bila seva" → DynamoDB.

---

**ElastiCache** *(Sura ya 10)*

Kuhifadhi kwa kwenye kumbukumbu inayosimamiwa. Injini mbili: Redis (ya kudumu, pub/sub, uandishi wa Lua, miundo ya data) na Memcached (kashe safi, rahisi zaidi, nyuzi-nyingi). Tumia kupunguza mzigo wa hifadhidata na kuhudumia data inayosomwa mara kwa mara kwa microsekunde.

Dhana muhimu: Mchakato wa kashe-pembeni, mchakato wa kuandika-kupitia, sera za kufuta, TTL, hali ya nguzo (Redis), Multi-AZ yenye kushindwa hama kwa kiotomatiki.

Ishara ya mtihani: "Punguza mzigo wa hifadhidata," "latency ya kusomwa ya chini ya millisekunde," "usimamizi wa kikao," "ubao wa nguvu wa wakati halisi" → ElastiCache Redis.

---

## Mtandao

**VPC — Virtual Private Cloud** *(Sura ya 11)*

Mtandao uliotengwa ndani ya AWS. Unashuka katika AZ zote katika mkoa. Unabainisha nafasi ya anwani ya IP (bloku la CIDR), kuunda subnet (za umma au za kibinafsi), kusanidi meza za njia, na kudhibiti ufikiaji kupitia vikundi vya usalama na NACL.

Dhana muhimu: Subnet ya umma (njia kwenye Lango la Mtandao), subnet ya kibinafsi (njia kwenye NAT Gateway kwa njia za nje), Lango la Mtandao (inbound + outbound hadi mtandao), NAT Gateway (njia za nje tu kwa vipengele vya kibinafsi), Muunganisho wa VPC (unganisha VPC mbili), Sehemu za Mwisho za VPC (unganika kwa huduma za AWS bila mtandao).

Ishara ya mtihani: "Mtandao wa kibinafsi kwenye AWS," "tenga rasilimali kutoka mtandao," "dhibiti trafiki ya mtandao" → VPC.

---

**Vikundi vya Usalama na NACL** *(Sura ya 15)*

Vikundi vya usalama ni ngome za hali kwenye kiwango cha kipengele — sheria za kuruhusu tu, trafiki ya kurudi ni ya kiotomatiki. NACL (Orodha za Udhibiti wa Ufikiaji wa Mtandao) ni ngome zisizo na hali kwenye kiwango cha subnet — zinahitaji sheria za inbound na outbound, zinakaguliwa kwa mpangilio kwa nambari ya sheria.

Ishara ya mtihani: "Zuia IP maalum isifikie subnet" → sheria ya kukataa NACL. "Dhibiti trafiki hadi/kutoka kipengele" → kikundi cha usalama.

---

**Route 53** *(Sura ya 12)*

Huduma ya DNS na msajili wa kikoa wa AWS. Hupitishia trafiki ya mtandao kwa rasilimali za AWS na sehemu za mwisho za nje. Sera za upitishaji: Rahisi, Uzito, Kulingana na Latency, Kushindwa hama, Jiografia, Jijiografia, Jibu la Thamani-Nyingi.

Dhana muhimu: Kanda zilizowekwa (za umma na za kibinafsi), aina za rekodi (A, AAAA, CNAME, Alias), ukaguzi wa afya, Mtiririko wa Trafiki (kihariri cha sera kinachoonekana).

Ishara ya mtihani: "Upitishaji wa DNS," "kushindwa hama kati ya mikoa," "pitisha kulingana na latency au mahali" → Route 53 na sera sahihi ya upitishaji.

---

**CloudFront** *(Sura ya 13)*

Mtandao wa Utoaji wa Maudhui (CDN). Huhifadhi maudhui kwenye maeneo ya pembeni (400+ duniani kote). Hupunguza latency kwa watumiaji wa mwisho. Hupunguza gharama za uhamishaji wa chanzo kupitia kuhifadhi. Muunganiko na S3, EC2, ALB, na API Gateway kama vyanzo.

Dhana muhimu: Usambazaji, vyanzo, tabia (upitishaji wa kulingana na njia kwa vyanzo), TTL (udhibiti wa kashe), kutoa kashe batali, URL zilizotiwa saini na vidakuzi (udhibiti wa ufikiaji), Lambda@Edge na CloudFront Functions (endesha nambuli pembezoni), Shield ya Chanzo (punguza mzigo wa chanzo).

Ishara ya mtihani: "Latency ya chini ya kimataifa," "hifadhi maudhui thabiti," "punguza mzigo wa chanzo," "linda dhidi ya DDoS na Shield" → CloudFront.

---

**Direct Connect na VPN** *(Sura ya 25)*

AWS Direct Connect ni muunganisho wa mtandao wa kimwili uliowekwa kutoka kituo chako cha data cha eneo lako hadi AWS. Hupita kwenye mtandao wa umma. Kipimo data na latency thabiti zaidi. AWS Site-to-Site VPN ni handaki lililofichwa kwenye mtandao wa umma — haraka zaidi kusanidi, gharama ndogo, lakini utendaji unaobadilika.

Dhana muhimu: Kiolesura cha Kawaida (VIF), Direct Connect Gateway (unganika na mikoa mingi), Transit Gateway (topology ya mtandao wa hub-na-bonga), urejeshaji wa handaki la VPN.

Ishara ya mtihani: "Muunganisho wa kibinafsi uliowekwa kwa AWS" → Direct Connect. "Muunganisho uliofichwa, usanidi wa haraka" → VPN. "Unganisha VPC nyingi" → Transit Gateway.

---

**Sehemu za Mwisho za VPC** *(Sura ya 30)*

Unganisha rasilimali za kibinafsi kwa huduma za AWS bila kutumia mtandao wa umma au NAT Gateway. Sehemu za Mwisho za Lango: bure, zinapatikana kwa S3 na DynamoDB tu. Sehemu za Mwisho za Kiolesura (PrivateLink): bei kwa saa + kwa GB, zinapatikana kwa huduma nyingi za AWS.

Ishara ya mtihani: "EC2 katika subnet ya kibinafsi inaita S3/DynamoDB — punguza gharama za NAT Gateway" → Sehemu ya Mwisho ya Lango (bure). "Muunganisho wa kibinafsi kwa SQS, SSM, Secrets Manager kutoka subnet ya kibinafsi" → Sehemu ya Mwisho ya Kiolesura.

---

## Usalama na Utambulisho

**IAM — Identity and Access Management** *(Sura za 3 na 14)*

Hudhibiti ni nani anaweza kufanya nini katika akaunti yako ya AWS. Watumiaji (vitambulisho vya muda mrefu), Vikundi (watumiaji wanaoshiriki ruhusa), Majukumu (vitambulisho vya muda kwa huduma na ufikiaji wa toka akaunti hadi akaunti), Sera (hati za JSON zinazobainisha sheria za kuruhusu/kukataa).

Dhana muhimu: Msingi, Kitendo, Rasilimali, Hali, kukataa wazi > kuruhusu wazi > kukataa isiyo wazi, SCP (Sera ya Udhibiti wa Huduma katika AWS Organizations), Mpaka wa ruhusa, AssumeRole.

Ishara ya mtihani: IAM inahusika katika kila swali la usalama. Mchakato muhimu: huduma hutumia majukumu ya IAM (si watumiaji). Ufikiaji wa toka akaunti hadi akaunti hutumia kudhani jukumu. Upendeleo mdogo — toa tu kinachohitajika.

---

**KMS — Key Management Service** *(Sura ya 16)*

Huduma ya ufunguo wa usimbaji fiche inayosimamiwa. Huunda, kuhifadhi, na kudhibiti vifunguo vya kriptografia. Vifunguo vinavyosimamiwa na mteja (CMK) vinakuruhusu kufafanua mzunguko, matumizi, na sera za ufikiaji. Vifunguo vinavyosimamiwa na AWS husimamiwa kiotomatiki.

Dhana muhimu: Sera ya ufunguo (tofauti na sera ya IAM), Usimbaji fiche wa bahasha (data imefichwa na ufunguo wa data; ufunguo wa data umefichwa na CMK), Mzunguko wa ufunguo kiotomatiki, Vifunguo vya mkoa-nyingi, Ruzuku.

Ishara ya mtihani: "Ficha data wakati wa mapumziko," "vifunguo vya usimbaji fiche vinavyosimamiwa na mteja," "mzunguko wa ufunguo" → KMS.

---

**Secrets Manager** *(Sura ya 16)*

Huhifadhi na kuzungusha kiotomatiki maadili nyeti: vitambulisho vya hifadhidata, funguo za API, tokeni za OAuth. Muunganiko na RDS kwa mzunguko wa nywila kwa kiotomatiki. Programu hurejesha siri wakati wa utekelezaji kupitia API — usiandike vitambulisho kamwe.

Ishara ya mtihani: "Hifadhi na zungusha vitambulisho vya hifadhidata," "epuka siri zilizowekwa" → Secrets Manager. "Hifadhi maadili ya usanidi, si siri" → Parameter Store (SSM).

---

**AWS Shield** *(Sura ya 17)*

Ulinzi wa DDoS. Shield Standard ni wa kiotomatiki na bure — inalinda dhidi ya mashambulizi ya kawaida ya wingi na itifaki. Shield Advanced huongeza ulinzi wa kifedha, timu ya majibu ya DDoS masaa 24/7, na uonekani wa mashambulizi kwa kina.

Ishara ya mtihani: "Linda dhidi ya DDoS" → Shield Standard (kiotomatiki) au Shield Advanced (shirika, na SLA).

---

**WAF — Web Application Firewall** *(Sura ya 17)*

Huchuja trafiki ya HTTP/HTTPS kulingana na sheria: vizuizi vya IP, vikwazo vya kiwango, mifumo ya kuingizwa kwa SQL, mifumo ya XSS, vizuizi vya kijiografia, sheria za kawaida. Huambatishwa na CloudFront, ALB, API Gateway, au AppSync.

Ishara ya mtihani: "Zuia anwani maalum za IP," "zuia kuingizwa kwa SQL pembezoni," "punguza kiwango cha wito wa API" → WAF.

---

**GuardDuty** *(Sura ya 17)*

Huduma ya ugunduzi wa vitisho. Huchambua kumbukumbu za CloudTrail, Kumbukumbu za Mtiririko wa VPC, na kumbukumbu za DNS kwa kutumia ML na ujasusi wa vitisho. Hugundua shughuli za API zisizo za kawaida, mawasiliano na IP zinazojulikana kuwa mbaya, vitambulisho vilivyoathiriwa.

Ishara ya mtihani: "Gundua shughuli zisizo za kawaida," "tambua vitambulisho vya IAM vilivyoathiriwa," "ufuatiliaji wa vitisho unaoendelea" → GuardDuty.

---

## Ujumbe na Usindikaji wa Matukio

**SQS — Simple Queue Service** *(Sura ya 19)*

Foleni ya ujumbe inayosimamiwa. Wazalishaji hutuma ujumbe; walaji husoma na kuufuta. Hutenganisha huduma: mtumaji hahitaji kujua ikiwa mpokeaji anapatikana. Foleni za kawaida: utoaji wa angalau mara moja, mpangilio wa juhudi bora. Foleni za FIFO: usindikaji wa mara moja haswa, mpangilio mkali.

Dhana muhimu: Muda wa kutoweka (ujumbe unaofichwa kutoka walaji wengine wakati wa usindikaji), Foleni ya Barua Pepe Iliyokufa (DLQ) kwa ujumbe unaoshindwa mara kwa mara, Uhifadhi wa ujumbe (siku 4 za chaguo-msingi, hadi 14), Utafutaji mrefu (punguza majibu ya tupu).

Ishara ya mtihani: "Tenganisha huduma," "bafuni maombi wakati wa mabadiliko ya mzigo," "usindikaji wa nje" → SQS. "Mpangilio ni muhimu na mara moja haswa inahitajika" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Sura ya 19)*

Huduma ya pub/sub inayosimamiwa. Wachapishaji hutuma ujumbe kwa mada; wajiandikishaji wote hupokea nakala. Mchakato wa fan-out: ujumbe mmoja → walaji wengi. Itifaki: SQS, Lambda, HTTP/HTTPS, barua pepe, SMS, kusukuma kwa simu.

Dhana muhimu: Mada, ujiandikishaji, mchakato wa fan-out (SNS → foleni nyingi za SQS), uchujaji wa ujumbe (wajiandikishaji hupokea ujumbe unaofanana tu).

Ishara ya mtihani: "Tuma arifa kwa sehemu nyingi za mwisho wakati mmoja," "fan-out tukio moja kwa walaji wengi" → SNS. Mchakato wa kawaida: SNS + SQS kwa fan-out wa kudumu.

---

**EventBridge** *(Sura ya 22)*

Basi ya matukio kwa kujenga usanifu unaoendelewa na matukio. Hupitishia matukio kutoka huduma za AWS, washirika wa SaaS, na vyanzo vya kawaida hadi Lambda, SQS, SNS, Step Functions, na malengo mengine. Inasaidia sheria za ratiba (cron) na ulinganisho wa mifumo.

Ishara ya mtihani: "Pitishia matukio kutoka huduma za AWS hadi malengo," "panga vitendo vya Lambda," "uratibu unaoendelewa na matukio" → EventBridge.

---

**Step Functions** *(Sura ya 22)*

Uratibu wa mtiririko wa kazi bila seva. Huratibu vitendo vya Lambda, kazi za ECS, DynamoDB, SNS, SQS, na huduma zingine kuwa mashine za hali zinazoonekana. Hushughulikia majaribio ya kujaribu tena, kushughulikia makosa, matawi ya sambamba, na hali za kusubiri.

Dhana muhimu: Mashine ya hali, aina za hali (Kazi, Subiri, Chaguo, Sambamba, Ramani, Pita, Fanya Kazi, Shindwa), Mtiririko wa Kazi wa Kawaida (mara moja haswa, wa muda mrefu) dhidi ya Mtiririko wa Kazi wa Express (angalau mara moja, kiwango kikubwa).

Ishara ya mtihani: "Andaa vitendo vingi vya Lambda," "mtiririko wa kazi wa muda mrefu wenye mantiki ya kujaribu tena," "hatua za idhini ya binadamu" → Step Functions.

---

**Kinesis** *(Sura ya 26)*

Utiririko wa data wa wakati halisi. Kinesis Data Streams: mkondo wa rekodi uliodumu, ulioandaliwa (kama kumbukumbu ya kujitolea iliyosambazwa). Walaji hushughulikia rekodi; data inahifadhiwa masaa 24 hadi siku 7. Kinesis Data Firehose: utoaji unaosimamiwa kikamilifu kwa S3, Redshift, OpenSearch, Splunk — hakuna usimamizi wa mlaji unaohitajika.

Dhana muhimu: Kipande (kitengo cha uendeshaji: kuandika Mbps 1, kusomwa Mbps 2), ufunguo wa sehemu (unabainisha ugawaji wa kipande), nambari ya mfululizo, alama za kukagua (KCL au Lambda), Firehose dhidi ya Streams.

Ishara ya mtihani: "Utiririko wa wakati halisi," "rekodi zilizoandaliwa," "rudia matukio" → Kinesis Data Streams. "Toa data ya utiririko kwa S3/Redshift bila kusimamia walaji" → Kinesis Firehose. Linganisha na SQS: Kinesis inahifadhi na kurudia; SQS inafuta inapotumiwa.

---

## Uchambuzi

**Athena** *(Sura ya 26)*

Maswali ya SQL bila seva kwenye data iliyohifadhiwa katika S3. Hakuna miundombinu ya kusimamia. Lipa kwa swali (kwa TB inayochunguzwa). Bora na miundo ya nguzo (Parquet, ORC) na data iliyoundwa.

Ishara ya mtihani: "Uliza data ya S3 kwa SQL," "uchambuzi wa hiari kwenye ziwa la data," "hakuna usimamizi wa miundombinu" → Athena.

---

**Glue** *(Sura ya 26)*

Huduma ya ETL (Toa, Badilisha, Pakia) bila seva. Watambazaji wa Glue hugundua data na kusasisha Katalogi ya Data ya Glue. Kazi za Glue huendesha ubadilishaji wa Spark au Python. Katalogi ya Data inaungana na Athena, Redshift Spectrum, na EMR.

Ishara ya mtihani: "Badilisha na pakia data kwa uchambuzi," "gundua mpango wa data ya S3," "mzunguko wa ETL" → Glue.

---

## Upatikanaji wa Juu na Uokoaji wa Maafa

**Multi-AZ na Multi-Region** *(Sura ya 18)*

Multi-AZ: upokezaji wa wakati mmoja ndani ya mkoa kwa kushindwa hama kwa kiotomatiki (RDS Multi-AZ, kisambazaji cha mzigo katika AZ). RPO ~0, RTO ~sekunde 60 kwa RDS. Multi-Region: upokezaji wa ucheleweshaji kwa upungufu wa kijiografia na latency ya chini kwa watumiaji wa kimataifa.

Dhana muhimu: RTO (Lengo la Wakati wa Uokoaji — muda wa kurejesha), RPO (Lengo la Wakati wa Uokoaji wa Data — kiasi cha data ambacho kinaweza kupotea). Mkakati wa Mwanga wa Rubani, Nakala ya Hifadhi ya Joto, Active-Active ya DR.

Ishara ya mtihani: Tofautisha kati ya kushindwa kwa kiwango cha AZ (Multi-AZ inashughulikia) dhidi ya kushindwa kwa mkoa (Multi-Region inashughulikia). Ugumu na gharama huongezeka kwa kiasi kikubwa na Multi-Region.

---

## Uimarishaji wa Gharama

**Mifano ya Bei ya EC2** *(Sura ya 27)*

On-Demand: bei kamili, hakuna kujitolea. Vipengele Vilivyohifadhiwa (miaka 1 au 3): punguzo la 30-72% kwa aina maalum ya kipengele. Mipango ya Akiba (Kompyuta au Kipengele cha EC2): matumizi ya kwa saa yaliyojitolea kwa kubadilika. Nafasi: 60-90% chini kwa mzigo unaoweza kukatizwa.

Ishara ya mtihani: "Punguza gharama kwa mzigo unaoweza kutabiriwa" → Mipango ya Akiba au Vipengele Vilivyohifadhiwa. "Usindikaji wa kundi wa ustahimilivu wa hitilafu" → Nafasi. "Isiyoweza kutabiriwa au ya muda mfupi" → On-Demand.

---

**Bei za Uhamishaji wa Data** *(Sura ya 30)*

Inbound hadi AWS: bure. AZ ile ile: bure. Toka AZ hadi AZ: $0.01/GB kwa kila upande. Toka kanda hadi kanda: $0.02-0.08/GB. Mtandao (outbound): ~$0.09/GB. Usindikaji wa NAT Gateway: $0.045/GB. Uhamishaji wa data wa CloudFront ni bei nafuu zaidi kuliko moja kwa moja EC2-hadi-mtandao, na kuhifadhi hupunguza kiwango cha jumla.

Ishara ya mtihani: "Punguza gharama za uhamishaji wa data kwa S3/DynamoDB kutoka subnet ya kibinafsi" → Sehemu za Mwisho za Lango (bure). "Punguza gharama za NAT Gateway kwa huduma zingine" → Sehemu za Mwisho za Kiolesura.

---

## Uonekani

**CloudWatch** *(rejelewa katika sura zote)*

Ufuatiliaji na uonekani. Vipimo vya CloudWatch: data ya mfululizo wa nambari kutoka huduma za AWS na programu za kawaida. Kumbukumbu za CloudWatch: kusanya, kutafuta, na kuchanganua data ya kumbukumbu. Tahadhari za CloudWatch: zindua arifa au kupanua kiotomatiki kulingana na viwango vya vipimo. Dashibodi za CloudWatch: ona vipimo.

Dhana muhimu: Vipimo vya kipimo, vipindi vya uhifadhi, vikundi vya kumbukumbu na mikondo ya kumbukumbu, vichujio vya vipimo, Wakala wa CloudWatch (kwa vipimo vya kiwango cha OS na kumbukumbu kutoka EC2), Maarifa ya Chombo.

---

**CloudTrail** *(rejelewa katika sura zote)*

Huandika kila wito wa API uliofanywa katika akaunti yako ya AWS: ni nani aliifanya, kutoka wapi, lini, na jibu lilikuwa nini. Njia ya mikoa-nyingi huhifadhi kumbukumbu katika S3 bila kikomo. Hutumika kwa ukaguzi wa usalama, uzingatifu, na uchunguzi wa matukio.

Ishara ya mtihani: "Ni nani alifuta rasilimali hiyo?" "Kagua shughuli zote za API" → CloudTrail.

---

**AWS Config** *(rejelewa katika Sura ya 31)*

Hufuatilia mabadiliko ya usanidi wa rasilimali za AWS kwa wakati. Hukadiria rasilimali dhidi ya sheria za uzingatifu. Hurekodi historia ya kila mabadiliko ya usanidi kwa kila rasilimali. Muunganiko na Systems Manager kwa urekebishaji.

Ishara ya mtihani: "Je, rasilimali hii inalingana na sera yetu ya usalama?" "Usanidi wa rasilimali hii ulionekana vipi wiki iliyopita?" → AWS Config.

---

## Ujenzi Bora

**Nguzo Sita** *(Sura ya 31)*

| Nguzo                     | Swali la Msingi                         | Huduma Muhimu                                      |
|---------------------------|-----------------------------------------|----------------------------------------------------|
| Ubora wa Uendeshaji       | Je, tunafanya kazi vizuri?              | CloudWatch, CloudTrail, SSM, Config                |
| Usalama                   | Je, tuna ulinzi?                        | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager  |
| Uaminifu                  | Je, tunarejesha kutoka kushindwa?       | Multi-AZ, kushindwa hama kwa Route 53, nakala/kurejesha, SQS |
| Ufanisi wa Utendaji       | Je, tunatumia rasilimali sahihi?        | Kupanga saizi sahihi, Kupanua Kiotomatiki, CloudFront, Kinesis |
| Uimarishaji wa Gharama    | Je, tunatumia pesa kwa busara?          | Mipango ya Akiba, Nafasi, mzunguko wa maisha wa S3, Sehemu za Mwisho za VPC |
| Uendelevu                 | Je, tunapunguza athari ya mazingira?    | Kupanga saizi sahihi, Graviton, tabaka za uhifadhi bora |

Zana ya Ujenzi Bora ya AWS: hukadiria usanifu wako dhidi ya nguzo sita. Itumie kabla ya mtihani kuelewa sababu nyuma ya maswali ya kila nguzo.
