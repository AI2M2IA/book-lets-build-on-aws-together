# Kiambatisho A: Rejea ya Haraka ya Huduma za AWS

Kila huduma iliyoshughulikiwa katika kitabu hiki, kwa mpangilio wa kuanzishwa. Tumia hii kama rejea ya kusoma na kutafuta haraka wakati wa maandalizi ya mtihani.

---

## Kompyuta

**EC2 — Elastic Compute Cloud** *(Sura ya 4)*

Mashine za kawaida katika wingu. Unachagua aina ya kipengele (CPU, kumbukumbu, uhifadhi), mfumo wa uendeshaji, na mkoa. Unalipa kwa saa (On-Demand), kwa kujitolea (Reserved Instances / Savings Plans), au kwa nafasi ya uwezo wa ziada (Spot). Kiholela cha kimsingi cha kompyuta.

Dhana muhimu: AMI (Amazon Machine Image), aina za vipengele (familia za t3, m6g, r6g, c6g), jozi za funguo, wasifu wa vipengele, vikundi vya uwekaji.

Ishara ya mtihani: Hali inayohitaji kompyuta ya kudumu, ya hali, au ya muda mrefu — EC2 au ECS. Hali inayohitaji kompyuta ya muda mfupi, iliyozinduliwa na tukio, au ya gharama-sifuri-ya-usubiri — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Sura ya 7)*

Auto Scaling Groups (ASG) huongeza na kuondoa vipengele vya EC2 kulingana na mzigo. Application Load Balancers (ALB) husambaza trafiki katika vipengele na kupitishia kwa njia au mwenyeji. Pamoja wanaunda tabaka la kupanua kwa usawa.

Dhana muhimu: Templeti ya uzinduzi, sera za kupanua (kufuatilia lengo, hatua, ratiba), ukaguzi wa afya, vikundi lengwa vya ALB, sheria za msikilizaji, upitishaji wa uzito.

Ishara ya mtihani: "Shughulikia mzigo unaobadilika" au "upatikanaji wa juu katika AZ" → ASG + ALB.

---

**Lambda** *(Sura ya 20)*

Vitendo bila seva. Unaandika nambuli; AWS inakiendesha kwa kujibu matukio. Hakuna seva za kusimamia. Unalipa kwa kila uanzishaji na kwa kila millisekunde ya utekelezaji. Inapanua kiotomatiki hadi maelfu ya utekelezaji wa wakati mmoja.

Dhana muhimu: Vyanzo vya matukio (API Gateway, S3, SQS, EventBridge, Kinesis), jukumu la utekelezaji, vikwazo vya uanzishaji wa wakati mmoja, uanzishaji uliotengwa na uliotolewa wa wakati mmoja, kuanza baridi, Layers, muda wa juu wa dakika 15.

Ishara ya mtihani: "Bila seva," "unaoendelewa na matukio," "kazi za muda mfupi," "gharama sifuri ya usubiri" → Lambda.

---

**ECS — Elastic Container Service** *(Sura ya 21)*

Inaendesha vyombo vya Docker kwenye AWS. Aina mbili za uzinduzi: EC2 (unasimamia mwenyeji) na Fargate (AWS inasimamia mwenyeji). ECS inasimamia ufafanuzi wa kazi, huduma, ratiba la nguzo, na muunganiko na visambazaji vya mzigo na ugunduzi wa huduma.

Dhana muhimu: Ufafanuzi wa kazi, huduma ya ECS, Fargate dhidi ya aina ya uzinduzi ya EC2, ECR (usajili wa vyombo), jukumu la IAM la kazi, kupanua kiotomatiki kwa huduma.

Ishara ya mtihani: "Mzigo wa vyombo," "microservices," "Docker kwenye AWS" → ECS (kawaida Fargate kwa vyombo bila seva).

---

**EKS — Elastic Kubernetes Service** *(Sura ya 21)*

Kubernetes inayosimamiwa. AWS inaendesha ndege la udhibiti; unaendesha nodi za wafanyakazi (EC2 au Fargate). Tumia EKS wakati timu yako tayari inatumia Kubernetes au ina mzigo unaohitaji vipengele maalum vya Kubernetes.

Ishara ya mtihani: "Kubernetes," "haja ya kuhamia mzigo wa K8s uliopo" → EKS. "Unahitaji tu vyombo bila mzigo wa K8s" → ECS.

---

**AWS Batch** *(Sura ya 21)*

Kompyuta ya bechi inayosimamiwa kwa vyombo vya Docker. Unafafanua kazi (picha ya Docker + amri), foleni ya kazi, na mazingira ya kompyuta (EC2 au Fargate). AWS Batch inatoa na kupanua kompyuta kiotomatiki, kisha inaisimamisha kazi inapomalizika. Inaunga mkono Spot Instances ili kupunguza gharama.

Dhana muhimu: Ufafanuzi wa kazi (kitu cha kuendesha), foleni ya kazi (mahali kazi zinasubiri), mazingira ya kompyuta (EC2 au Fargate, On-Demand au Spot), kazi za safu (kuendesha nakala nyingi sambamba za kazi ile ile).

Ishara ya mtihani: "Usindikaji wa bechi unaozidi muda wa dakika 15 wa Lambda," "kazi za kompyuta zenye mwisho kwenye vyombo," "mzigo wa HPC kwenye AWS" → AWS Batch.

---

**AWS Outposts** *(Sura ya 2)*

Rafu inayosimamiwa kikamilifu ya vifaa vya AWS iliyowekwa katika kituo chako cha data au kituo cha pamoja cha eneo. Inaendesha huduma, API, na zana zile zile za AWS kama wingu la umma (EC2, EBS, RDS, EKS, S3 kwenye Outposts) lakini kimwili katika eneo lako.

Dhana muhimu: API zile zile za AWS katika eneo lako, AWS inasimamia usakinishaji na uwekaji viraka, mteja anatoa nafasi ya rafu na umeme, Local Gateway (LGW) inaunganisha Outposts na mitandao ya ndani.

Ishara ya mtihani: "Endesha AWS katika kituo chako cha data," "ukaaji wa data unahitaji kompyuta kubaki ndani," "API za AWS bila utegemezi wa intaneti" → Outposts.

---

**AWS Wavelength** *(Sura ya 2)*

Miundombinu ya AWS iliyowekwa ndani ya mitandao ya watoa huduma za mawasiliano ya 5G. Wavelength Zones zinakaa kwenye ukingo wa mtandao wa 5G, zikiwezesha ucheleweshaji wa millisekunde za tarakimu moja kwa vifaa vya simu.

Dhana muhimu: Wavelength Zones ni viendelezi vya AWS Regions ndani ya mitandao ya mawasiliano, trafiki inabaki kwenye mtandao wa mtoa huduma kati ya kifaa na Wavelength Zone.

Ishara ya mtihani: "Ucheleweshaji wa millisekunde za tarakimu moja kwa watumiaji wa simu wa 5G," "AR/VR ya simu," "michezo ya wakati halisi kwenye simu," "telemetri ya magari ya kujiendesha" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Sura ya 25)*

Huduma ya uhamiaji ya kupangisha upya (kuinua-na-kuhamisha). Wakala unanakili diski za seva chanzo block kwa block kuingia eneo la maandalizi la gharama nafuu katika AWS; unazindua nakala za majaribio unapohitaji; wakati wa kuhamia, MGN inabadilisha seva zilizonakiliwa kuwa vipengele vya asili vya EC2. Hakuna mabadiliko ya programu yanayohitajika.

Dhana muhimu: Unakili endelevu wa kiwango cha block, eneo la maandalizi, uzinduzi wa majaribio kabla ya kuhamia, mikakati ya uhamiaji ya "7 Rs" (MGN = kupangisha upya).

Ishara ya mtihani: "Hamisha mamia ya VM haraka bila mabadiliko ya nambuli," "inua-na-hamisha seva kuingia EC2" → MGN. DataSync inahamisha *faili*; DMS inahamisha *hifadhidata*; MGN inahamisha *seva nzima*.

---

## Uhifadhi

**S3 — Simple Storage Service** *(Sura ya 5)*

Uhifadhi wa vitu. Uwezo usio na kikomo, uimara wa 99.999999999% (tisa kumi na moja). Inahifadhi faili kama vitu katika ndoo. Ndoo zinaishi katika mkoa. Vitu vinaweza kuanzia baiti 0 hadi 5TB.

Dhana muhimu: Sera ya ndoo, ACL ya kitu, uwekaji matoleo, upataji wa tovuti tuli, presigned URLs, upakiaji wa sehemu nyingi, Transfer Acceleration, madaraja ya uhifadhi (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, pamoja na S3 Express One Zone kwa mzigo wa AZ moja, wenye ucheleweshaji muhimu wa ndoo za saraka).

Ishara ya mtihani: "Hifadhi na pata faili," "rasilimali tuli," "nakala rudufu," "ziwa la data" → S3. Daraja sahihi la uhifadhi linategemea mara ngapi data inafikiwa na kasi ya upataji.

---

**EBS — Elastic Block Store** *(Sura ya 6)*

Uhifadhi wa block ulioambatishwa kwa kipengele kimoja cha EC2. Hufanya kama diski ngumu. Hudumu kwa kujitegemea na mzunguko wa maisha wa kipengele (unaweza kuondoa na kuambatisha tena). Aina za kawaida zaidi: gp3 (SSD ya madhumuni ya jumla, chaguo-msingi), io2 (provisioned IOPS kwa hifadhidata), st1 (HDD iliyoboreshwa kwa upitishaji kwa usomaji wa mfululizo).

Dhana muhimu: Picha za papo hapo (za nyongeza, zilizohifadhiwa katika S3), usimbaji (KMS), Multi-Attach (io1/io2 pekee), utoaji wa IOPS na upitishaji.

Ishara ya mtihani: "Uhifadhi wa kudumu kwa EC2," "uhifadhi wa hifadhidata," "unahitaji ufikiaji wa block wa ucheleweshaji mdogo" → EBS.

---

**EFS — Elastic File System** *(Sura ya 6)*

Mfumo wa faili wa pamoja, unaofikiwa kutoka vipengele vingi vya EC2 kwa wakati mmoja. Itifaki ya NFS. Inapanua kiotomatiki. Ghali zaidi kuliko EBS kwa kila GB. Madaraja ya uhifadhi ni pamoja na Standard, Infrequent Access, na Archive. Intelligent-Tiering inahamisha faili kiotomatiki.

Ishara ya mtihani: "Mfumo wa faili wa pamoja," "vipengele vingi vya EC2 vinahitaji faili zile zile," "NFS" → EFS.

---

**Familia ya FSx** *(Sura ya 6)*

Seva za faili zinazosimamiwa kwa teknolojia zilizotajwa. FSx for Windows File Server: itifaki ya SMB, NTFS, muunganiko wa Active Directory, Multi-AZ. FSx for Lustre: mfumo wa faili wa utendaji wa juu sambamba kwa HPC/ML, unaonyesha vitu vya S3 kama faili (upakiaji wa upole). FSx for NetApp ONTAP: itifaki nyingi (NFS + SMB + iSCSI), picha za papo hapo, unakili wa SnapMirror. FSx for OpenZFS: NFS ya ucheleweshaji mdogo, picha za papo hapo za papo hapo na nakala zinazoweza kuandikwa.

Ishara ya mtihani: "SMB/Active Directory" → FSx for Windows. "Mafunzo ya HPC/ML kwenye data ya S3" → FSx for Lustre. "NFS na SMB kwa data ile ile / uhamiaji wa NetApp" → FSx for ONTAP. "Uhamiaji wa ZFS / nakala za papo hapo" → FSx for OpenZFS.

---

**Madaraja ya Uhifadhi ya S3 na Sera za Mzunguko wa Maisha** *(Sura ya 23)*

S3 Intelligent-Tiering inahamisha vitu kiotomatiki kati ya madaraja ya ufikiaji kulingana na mara ngapi vinafikiwa. Sera za mzunguko wa maisha zinahamisha vitu kati ya madaraja (Standard → Standard-IA → Glacier) kulingana na sheria za umri. Madaraja ya uhifadhi ya Glacier yana ucheleweshaji wa upataji unaoanzia dakika (Glacier Instant) hadi saa 12 (Glacier Deep Archive).

Ishara ya mtihani: "Punguza gharama za uhifadhi kwa data inayofikiwa mara chache" → sera za mzunguko wa maisha, Intelligent-Tiering, au Glacier.

---

**AWS Storage Gateway** *(Sura ya 6)*

Huduma ya uhifadhi mseto inayounganisha mazingira ya ndani na uhifadhi wa AWS. Inawasilisha uhifadhi kupitia itifaki ambazo programu tayari zinazielewa huku ikidumisha data katika S3, S3 Glacier, au kama picha za papo hapo za EBS.

Dhana muhimu: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, hali ya cached au stored), Tape Gateway (maktaba ya tepi ya kawaida → Glacier).

Ishara ya mtihani: "Programu ya ndani inahitaji uhifadhi wa wingu bila mabadiliko ya nambuli" → Storage Gateway. "Badilisha nakala rudufu ya tepi" → Tape Gateway.

---

**AWS DataSync** *(Sura ya 25)*

Huduma ya uhamiaji na unakili wa data inayotegemea wakala. Wakala mwepesi unaunganisha na seva za faili za ndani kupitia NFS au SMB na kusawazisha share kuingia S3, EFS, au FSx — pamoja na ratiba, kupunguza kasi ya bandwidth, na uhakiki wa uadilifu uliojengwa ndani.

Dhana muhimu: Wakala wa DataSync (VM ya ndani au EC2), vyanzo vya NFS/SMB, marudio ya S3/EFS/FSx, uhamishaji wa nyongeza wa ratiba.

Ishara ya mtihani: "Hamisha au sawazisha kwa kuendelea idadi kubwa ya faili kutoka NAS ya ndani kuingia AWS kupitia mtandao" → DataSync.

---

**AWS Transfer Family** *(Sura ya 25)*

Seva ya SFTP, FTPS, na FTP inayosimamiwa kikamilifu ikiwa na S3 au EFS kama marudio ya uhifadhi. Wateja wanaunganisha na programu yao iliyopo ya SFTP; faili zilizopakiwa zinatua moja kwa moja kwenye ndoo au mfumo wa faili.

Dhana muhimu: Endpoint inayosimamiwa (kwa hiari ikiwa na IP tuli), uhifadhi wa msingi wa S3 au EFS, upatanifu wa itifaki iliyopo kwa washirika wa nje.

Ishara ya mtihani: "Washirika lazima waendelee kupakia kupitia SFTP, lakini faili zinapaswa kutua katika S3" → Transfer Family.

---

**AWS Snow Family** *(Sura ya 25)*

Vifaa vya kimwili vya uhamishaji wa data kwa uhamiaji wa data wa wingi nje ya mtandao. Snowball Edge Storage Optimized: 80 TB inayotumika, kasha lililoimarishwa, linasafirishwa hadi eneo lako; unapakia data ndani na kulisafirisha tena kwa ajili ya kuingiza katika S3.

Dhana muhimu: Fanya hesabu ya uhamishaji kwanza — kama uhamishaji wa mtandao ungechukua takriban wiki moja au zaidi, kifaa cha kimwili kinashinda. *Maelezo ya urithi (2026)*: AWS imekuwa ikiondoa familia hii — Snowmobile (2024) na Snowcone (mwishoni mwa 2024) zimekwisha, na vifaa vya Snow vilifungwa kwa wateja wapya mnamo Novemba 2025 (AWS sasa inaelekeza kwa DataSync na Data Transfer Terminals). Benki ya maswali ya SAA-C03 inatangulia hili, hivyo mtihani bado unatarajia Snowball kama jibu.

Ishara ya mtihani: "Uhamiaji wa kiwango cha petabaiti," "bandwidth ndogo, wiki za muda wa uhamishaji" → Snow Family.

---

**AWS Backup** *(Sura ya 18 na 23)*

Huduma ya nakala rudufu iliyokuwa kati, inayotegemea sera, katika EBS, RDS, DynamoDB, EFS, na Storage Gateway. Mipango ya nakala rudufu inafafanua ratiba na uhifadhi; vault zinahifadhi pointi za uokoaji.

Dhana muhimu: Mipango ya nakala rudufu na vault, nakala za toka mkoa hadi mkoa na toka akaunti hadi akaunti, Vault Lock kwa kutobadilika.

Ishara ya mtihani: "Weka kati na ufanye kiotomatiki nakala rudufu katika huduma nyingi za AWS," "nakala za nakala rudufu za toka akaunti hadi akaunti kwa ulinzi dhidi ya ransomware/kuvuja kwa akaunti" → AWS Backup.

---

## Hifadhidata

**RDS — Relational Database Service** *(Sura ya 8)*

Hifadhidata za uhusiano zinazosimamiwa. Injini zinazoungwa mkono: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, na Aurora (injini ya umiliki ya AWS). AWS inashughulikia nakala rudufu, uwekaji viraka, kuhamia, na unakili. Wewe unasimamia muundo wa schema, hoja, na ukubwa wa kipengele.

Dhana muhimu: Uwekaji wa Multi-AZ (kuhamia kiotomatiki, unakili sambamba), Read Replicas (asiyo sambamba, kwa kupanua usomaji), nakala rudufu za kiotomatiki (uhifadhi wa siku 1-35), picha za papo hapo za mkono (zinazohifadhiwa hadi zifutwe), RDS Proxy (kuunganisha miunganisho).

Ishara ya mtihani: "Hifadhidata ya uhusiano," "miamala ya ACID," "mzigo uliopo wa SQL" → RDS au Aurora.

---

**Aurora** *(Sura ya 24)*

Injini ya hifadhidata ya uhusiano ya AWS, inayopatana na MySQL na PostgreSQL. Injini ya uhifadhi iliyosambaa inayonakili data katika AZ 3 katika nakala 6. Kawaida mara 5 haraka zaidi kuliko MySQL. Aurora Serverless v2 inapanua uwezo kiotomatiki (kinachopimwa kwa ACU — Aurora Capacity Units) na, kwenye matoleo ya injini yanayoungwa mkono, inaweza kusimama-kiotomatiki hadi ACU 0 wakati hakuna miunganisho iliyoshikiliwa wazi.

Dhana muhimu: Nguzo ya Aurora (mwandishi + hadi Aurora Replicas 15 nyuma ya endpoint moja ya msomaji), Aurora Global Database (read replicas za toka mkoa hadi mkoa zenye ucheleweshaji wa unakili wa < sekunde 1), Aurora Serverless v2, ACU, tabia ya kusimama-kiotomatiki/kuendelea.

Ishara ya mtihani: "Hifadhidata ya uhusiano ya utendaji wa juu," "inayopatana na MySQL/PostgreSQL," "usomaji wa kimataifa," "mzigo unaobadilika" → Aurora.

---

**DynamoDB** *(Sura ya 9)*

Hifadhidata ya NoSQL inayosimamiwa kikamilifu. Mfano wa ufunguo-thamani na hati. Inapanua hadi upitishaji wowote ikiwa na utendaji wa millisekunde za tarakimu moja. Hali mbili za uwezo: on-demand (lipa kwa ombi) na provisioned (lipa kwa kitengo cha uwezo kwa saa, ikiwa na Auto Scaling).

Dhana muhimu: Partition key (inahitajika), sort key (kwa hiari), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (unasaji wa data ya mabadiliko), DynamoDB Accelerator (DAX) — cache ya kumbukumbu, TTL (Time to Live), miamala.

Ishara ya mtihani: "Ufikiaji wa upitishaji wa juu unaotegemea ufunguo," "schema rahisi," "NoSQL bila seva" → DynamoDB.

---

**ElastiCache** *(Sura ya 10)*

Uchakatishaji wa kumbukumbu unaosimamiwa. Injini mbili: Redis (ya kudumu, pub/sub, uandishi wa Lua, miundo ya data) na Memcached (cache safi, rahisi zaidi, multi-threaded). Tumia kupunguza mzigo wa hifadhidata na kuhudumia data inayosomwa mara kwa mara kwa mikrosekunde.

Dhana muhimu: Mfumo wa cache-aside, mfumo wa write-through, sera za kuondoa, TTL, hali ya nguzo (Redis), Multi-AZ ikiwa na kuhamia kiotomatiki.

Ishara ya mtihani: "Punguza mzigo wa hifadhidata," "ucheleweshaji wa usomaji chini ya millisekunde," "usimamizi wa kipindi," "ubao wa wanaoongoza wa wakati halisi" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Sura ya 10)*

Hifadhidata kuu ya kumbukumbu ya kudumu, inayopatana na Redis. Tofauti na ElastiCache (ambayo ni cache ambapo upotezaji wa data unakubalika), MemoryDB inahifadhi logi ya miamala ya Multi-AZ na inahakikisha kudumu. Unaweza kutumia MemoryDB kama hifadhidata yako kuu — si tu cache mbele ya hifadhidata nyingine.

Dhana muhimu: Upatanifu wa API ya Redis, logi ya miamala ya Multi-AZ (hakikisho la kudumu), utendaji wa kumbukumbu, hifadhidata kuu (si tabaka la cache).

Ishara ya mtihani: "Inayopatana na Redis NA upotezaji wa data haukubaliki," "hifadhidata ya kumbukumbu ya kudumu" → MemoryDB. "Redis kama cache, upotezaji wa data unakubalika" → ElastiCache Redis.

---

**Hifadhidata Zilizojengwa kwa Madhumuni** *(Sura ya 9, 10, na 24)*

Linganisha umbo la data na injini. DocumentDB: hati zinazopatana na MongoDB. Neptune: hifadhidata ya grafu (mahusiano, mipito — Gremlin/SPARQL). Keyspaces: safu-pana inayopatana na Cassandra. Timestream: mfululizo wa wakati (ofa ya sasa: Timestream for InfluxDB). MemoryDB: hifadhidata *kuu* ya kudumu inayopatana na Redis (dhidi ya ElastiCache = cache). QLDB ("leja isiyobadilika ya kifani") ilikomeshwa mnamo 2025 — ichukue kama kichanganyi cha urithi.

Ishara ya mtihani: "grafu ya kijamii / mapendekezo / pete za ulaghai" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "telemetri ya IoT kwa wakati" → Timestream.

---

**AWS DMS — Database Migration Service** *(Sura ya 8)*

Inahamisha hifadhidata kuingia AWS ikiwa na muda mdogo wa kutokufanya kazi. Inaunga mkono full load (nakala ya awali) pamoja na CDC (Change Data Capture) ili kuweka chanzo na lengo vikilingana wakati uhamiaji unaendelea. Unapohamia kati ya aina ya injini ile ile (MySQL → MySQL, PostgreSQL → PostgreSQL), tumia DMS moja kwa moja. Unapohamia kati ya aina tofauti za injini (Oracle → Aurora PostgreSQL), tumia AWS Schema Conversion Tool (SCT) kwanza kubadilisha schema, kisha DMS kwa data.

Dhana muhimu: Kipengele cha unakili, endpoint za chanzo na lengo, full load + CDC, SCT (Schema Conversion Tool) kwa uhamiaji wa aina tofauti.

Ishara ya mtihani: "Hamisha hifadhidata ikiwa na muda mdogo wa kutokufanya kazi" → DMS. "Oracle kuingia Aurora" au uhamiaji wowote wa aina tofauti → SCT + DMS. "Injini ile ile, aina ile ile" → DMS moja kwa moja.

---

## Mitandao

**VPC — Virtual Private Cloud** *(Sura ya 11)*

Mtandao uliotengwa ndani ya AWS. Unaenea katika AZ zote katika mkoa. Unafafanua nafasi ya anwani ya IP (block ya CIDR), unaunda subnet (za umma au za faragha), unasanidi jedwali za njia, na unadhibiti ufikiaji kupitia security groups na NACL.

Dhana muhimu: Subnet ya umma (njia kwa Internet Gateway), subnet ya faragha (njia kwa NAT Gateway kwa kutoka), Internet Gateway (kuingia + kutoka kwa intaneti), NAT Gateway (kutoka pekee kwa vipengele vya faragha), VPC Peering (kuunganisha VPC mbili), VPC Endpoints (kuunganisha na huduma za AWS bila intaneti).

Ishara ya mtihani: "Mtandao wa faragha kwenye AWS," "tenga rasilimali kutoka intaneti," "dhibiti trafiki ya mtandao" → VPC.

---

**Security Groups na NACL** *(Sura ya 15)*

Security groups ni ngome za stateful katika kiwango cha kipengele — sheria za kuruhusu pekee, trafiki ya kurudi ni kiotomatiki. NACL (Network Access Control Lists) ni ngome za stateless katika kiwango cha subnet — zinahitaji sheria za kuingia na za kutoka, zinazotathminiwa kwa mpangilio kwa namba ya sheria.

Ishara ya mtihani: "Zuia IP maalum kufikia subnet" → NACL. "Dhibiti trafiki kwenda/kutoka kipengele" → security group.

---

**Route 53** *(Sura ya 12)*

Huduma ya DNS na msajili wa kikoa ya AWS. Inapitisha trafiki ya intaneti kwa rasilimali za AWS na endpoint za nje. Sera za upitishaji: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

Dhana muhimu: Hosted zones (za umma na za faragha), aina za rekodi (A, AAAA, CNAME, Alias), ukaguzi wa afya, Traffic Flow (kihariri cha sera cha kuona — kumbuka kuwa geoproximity pia inapatikana kama sera ya upitishaji ya moja kwa moja kwenye rekodi, ikiwa na bias inayoweza kurekebishwa, bila kuhitaji Traffic Flow).

Ishara ya mtihani: "Upitishaji wa DNS," "kuhamia kati ya mikoa," "pitisha kulingana na ucheleweshaji au eneo" → Route 53 ikiwa na sera ya upitishaji inayofaa.

---

**CloudFront** *(Sura ya 13)*

Mtandao wa Kutoa Maudhui (CDN). Inahifadhi maudhui katika maeneo ya ukingo (zaidi ya pointi 750 za uwepo duniani kote). Inapunguza ucheleweshaji kwa watumiaji wa mwisho. Inapunguza gharama za uhamishaji wa chanzo kupitia uchakatishaji. Inajumuika na S3, EC2, ALB, na API Gateway kama vyanzo.

Dhana muhimu: Distribution, vyanzo, behaviors (upitishaji unaotegemea njia kwa vyanzo), TTL (udhibiti wa cache), kufuta cache, signed URLs na cookies (udhibiti wa ufikiaji), Lambda@Edge na CloudFront Functions (endesha nambuli kwenye ukingo), Origin Shield (punguza mzigo wa chanzo).

Ishara ya mtihani: "Ucheleweshaji mdogo wa kimataifa," "hifadhi maudhui tuli," "punguza mzigo wa chanzo," "linda dhidi ya DDoS na Shield" → CloudFront.

---

**Direct Connect na VPN** *(Sura ya 25)*

AWS Direct Connect ni muunganisho wa mtandao wa kimwili uliojitolea kutoka kituo chako cha data hadi AWS. Inapita intaneti ya umma. Bandwidth na ucheleweshaji thabiti zaidi. AWS Site-to-Site VPN ni handaki lililosimbwa juu ya intaneti ya umma — haraka zaidi kusanidi, gharama ndogo, lakini utendaji unaobadilika.

Dhana muhimu: Virtual Interface (VIF), Direct Connect Gateway (kuunganisha na mikoa mingi), Transit Gateway (topolojia ya mtandao ya kitovu-na-spoke), uzazi wa handaki la VPN.

Ishara ya mtihani: "Muunganisho wa faragha uliojitolea kwa AWS" → Direct Connect. "Muunganisho uliosimbwa, usanidi wa haraka" → VPN. "Unganisha VPC nyingi" → Transit Gateway.

---

**VPC Endpoints** *(Sura ya 30)*

Unganisha rasilimali za faragha na huduma za AWS bila kutumia intaneti ya umma au NAT Gateway. Gateway Endpoints: bila malipo, zinapatikana kwa S3 na DynamoDB pekee. Interface Endpoints (PrivateLink): zinatozwa kwa saa + kwa GB, zinapatikana kwa huduma nyingi za AWS.

Ishara ya mtihani: "EC2 katika subnet ya faragha inaita S3/DynamoDB — punguza gharama za NAT Gateway" → Gateway Endpoint (bila malipo). "Muunganisho wa faragha kwa SQS, SSM, Secrets Manager kutoka subnet ya faragha" → Interface Endpoint.

---

**AWS Client VPN** *(Sura ya 11)*

Endpoint ya OpenVPN inayosimamiwa inayoruhusu vifaa binafsi (kompyuta za mkononi, vituo vya kazi) kuunganisha kwa usalama na VPC kupitia intaneti. Chaguzi za uthibitishaji: Active Directory, ushirikiano wa SAML 2.0 na mtoa huduma wa utambulisho, au TLS ya pande zote (inayotegemea cheti). Inaunga mkono split-tunnel (trafiki inayoenda VPC pekee inapita handaki) na full-tunnel (trafiki yote inapita AWS).

Dhana muhimu: Client VPN endpoint, mtandao lengwa (uhusiano wa subnet ya VPC), sheria za ruhusa, split-tunnel dhidi ya full-tunnel.

Ishara ya mtihani: "Wahandisi wa mbali wanahitaji ufikiaji salama wa VPC kutoka nyumbani," "muunganisho wa kifaa binafsi kwa VPC" → Client VPN. Linganisha: Site-to-Site VPN = mtandao-kwa-mtandao. Client VPN = kifaa-kwa-mtandao.

---

**Network Load Balancer (NLB) na Gateway Load Balancer (GWLB)** *(Sura ya 7)*

NLB inafanya kazi katika Layer 4 (TCP/UDP/TLS): hakuna ukaguzi wa HTTP, ni upitishaji wa pakiti tu kwa kasi kubwa — mamilioni ya maombi kwa sekunde, ikiwa na IP tuli kwa kila AZ na uhifadhi wa IP chanzo. GWLB inafanya kazi katika Layer 3 na ipo kwa madhumuni moja: kuingiza vifaa vya mtandao vya kawaida vya wahusika wengine (ngome, IDS/IPS, ukaguzi wa kina wa pakiti) ndani ya mtiririko wa trafiki.

Dhana muhimu: NLB = Layer 4, IP tuli, ucheleweshaji wa chini kabisa, itifaki zisizo za HTTP. GWLB = Layer 3, ufungaji wa GENEVE, makundi ya vifaa nyuma ya pointi moja ya kuingia. ALB = Layer 7 (upitishaji wa njia/mwenyeji).

Ishara ya mtihani: "Mamilioni ya maombi ya TCP kwa sekunde," "IP tuli kwa kisambazaji cha mzigo," "hifadhi IP chanzo" → NLB. "Ingiza vifaa vya usalama vya wahusika wengine kwenye njia ya trafiki" → GWLB.

---

**AWS Global Accelerator** *(Sura ya 25)*

Inapitisha trafiki ya mtumiaji kuingia kwenye uti wa mgongo wa kimataifa wa faragha wa AWS katika eneo la ukingo lililo karibu zaidi, badala ya kupita intaneti ya umma. Inatoa anwani mbili tuli za Anycast IP zinazokabili ALB, NLB, au vipengele vya EC2 katika mikoa mmoja au zaidi. Inaboresha ucheleweshaji na uthabiti kwa trafiki ya *kibadiliko* (isiyoweza kuhifadhiwa kwenye cache).

Dhana muhimu: Anycast IP tuli, kuingia kwenye uti wa mgongo wa AWS kwenye ukingo, kuhamia kwa mkoa kunakotegemea ukaguzi wa afya katika sekunde, makundi ya endpoint yenye dial za trafiki.

Ishara ya mtihani: "Watumiaji wa kimataifa, trafiki ya kibadiliko/isiyo ya HTTP, IP tuli, kuhamia kwa mkoa kwa haraka" → Global Accelerator. "Maudhui yanayoweza kuhifadhiwa/tuli" → CloudFront badala yake.

---

## Usalama na Utambulisho

**IAM — Identity and Access Management** *(Sura ya 3 na 14)*

Inadhibiti nani anaweza kufanya nini katika akaunti yako ya AWS. Watumiaji (vitambulisho vya muda mrefu), Vikundi (watumiaji wanaoshiriki ruhusa), Majukumu (vitambulisho vya muda kwa huduma na ufikiaji wa toka akaunti hadi akaunti), Sera (hati za JSON zinazofafanua sheria za kuruhusu/kukataa).

Dhana muhimu: Principal, Action, Resource, Condition, kukataa wazi > kuruhusu wazi > kukataa isiyo wazi, SCP (Service Control Policy katika AWS Organizations), Permission boundary, AssumeRole.

Ishara ya mtihani: IAM inahusika katika kila swali la usalama. Mfumo muhimu: huduma zinatumia majukumu ya IAM (si watumiaji). Ufikiaji wa toka akaunti hadi akaunti unatumia uchukuaji wa jukumu. Upendeleo mdogo — toa tu kinachohitajika.

---

**KMS — Key Management Service** *(Sura ya 16)*

Huduma ya funguo za usimbaji inayosimamiwa. Inaunda, kuhifadhi, na kudhibiti funguo za kifani. Customer-managed keys (CMK) zinakuruhusu kufafanua sera za mzunguko, matumizi, na ufikiaji. AWS-managed keys zinasimamiwa kiotomatiki.

Dhana muhimu: Key policy (tofauti na sera ya IAM), Usimbaji wa bahasha (data inasimbwa na data key; data key inasimbwa na CMK), Mzunguko wa funguo wa kiotomatiki, Multi-region keys, Grants.

Ishara ya mtihani: "Simba data ikiwa imehifadhiwa," "funguo za usimbaji zinazosimamiwa na mteja," "mzunguko wa funguo" → KMS.

---

**Secrets Manager** *(Sura ya 16)*

Inahifadhi na kuzungusha kiotomatiki thamani nyeti: vitambulisho vya hifadhidata, funguo za API, tokeni za OAuth. Inajumuika na RDS kwa mzunguko wa nenosiri wa kiotomatiki. Programu zinapata siri wakati wa uendeshaji kupitia API — kamwe usisanidi vitambulisho moja kwa moja kwenye nambuli.

Ishara ya mtihani: "Hifadhi na uzungushe vitambulisho vya hifadhidata," "epuka siri zilizosanidiwa moja kwa moja kwenye nambuli" → Secrets Manager. "Hifadhi thamani za usanidi, si siri" → Parameter Store (SSM).

---

**AWS Shield** *(Sura ya 17)*

Ulinzi wa DDoS. Shield Standard ni wa kiotomatiki na bila malipo — inalinda dhidi ya mashambulizi ya kawaida ya kiwango na itifaki. Shield Advanced inaongeza ulinzi wa kifedha, timu ya kujibu DDoS ya 24/7, na uonekano wa kina wa shambulizi.

Ishara ya mtihani: "Linda dhidi ya DDoS" → Shield Standard (kiotomatiki) au Shield Advanced (kibiashara, ikiwa na SLA).

---

**WAF — Web Application Firewall** *(Sura ya 17)*

Inachuja trafiki ya HTTP/HTTPS kulingana na sheria: vizuizi vya IP, mipaka ya kasi, mifumo ya SQL injection, mifumo ya XSS, vizuizi vya kijiografia, sheria za kawaida. Inaambatishwa na CloudFront, ALB, API Gateway, au AppSync.

Ishara ya mtihani: "Zuia anwani maalum za IP," "zuia SQL injection kwenye ukingo," "weka mpaka wa kasi wa wito wa API" → WAF.

---

**GuardDuty** *(Sura ya 17)*

Huduma ya kugundua vitisho. Inachambua logi za CloudTrail, VPC Flow Logs, na logi za DNS kwa kutumia ML na akili ya vitisho. Inagundua shughuli za API zisizo za kawaida, mawasiliano na IP mbaya zinazojulikana, vitambulisho vilivyovuja.

Ishara ya mtihani: "Gundua shughuli zisizo za kawaida," "tambua vitambulisho vya IAM vilivyovuja," "ufuatiliaji endelevu wa vitisho" → GuardDuty.

---

**Amazon Inspector** *(Sura ya 17)*

Huduma ya tathmini ya kiotomatiki ya udhaifu. Inachanganua kwa kuendelea vipengele vya EC2, picha za vyombo vya Amazon ECR, na vitendo vya Lambda kwa udhaifu wa programu (CVE) na uwazi wa mtandao usiokusudiwa. Matokeo yanatumwa kwa AWS Security Hub kwa usimamizi wa kati.

Dhana muhimu: Uchanganuzi wa CVE, tathmini endelevu (si ya mara moja), ufunikaji wa EC2 + ECR + Lambda, muunganiko wa Security Hub.

Ishara ya mtihani: "Changanua kiotomatiki EC2 kwa udhaifu unaojulikana," "uchanganuzi wa CVE kwa picha za vyombo," "tathmini endelevu ya udhaifu" → Inspector.

---

**Amazon Cognito** *(Sura ya 14)*

Uthibitishaji unaosimamiwa kwa watumiaji wa mwisho wa programu yako — saraka ya watumiaji ambayo huhitaji kuijenga. User Pools zinashughulikia kujiandikisha, kuingia, MFA, kuweka upya nenosiri, na watoa huduma wa utambulisho wa kijamii (Google, Facebook, mtoa huduma yeyote wa OIDC), zikitoa JWT ambazo programu yako inathibitisha. Identity Pools zinabadilishana tokeni hizo kwa vitambulisho vya muda vya AWS.

Dhana muhimu: User Pool (uthibitishaji, JWT) dhidi ya Identity Pool (vitambulisho vya muda vya AWS), hosted UI, ushirikiano wa kijamii/OIDC/SAML, Cognito authorizer ya API Gateway.

Ishara ya mtihani: "Programu inahitaji kujiandikisha/kuingia kwa mtumiaji," "kuingia kwa kijamii," "wape watumiaji wa programu ya simu ufikiaji wa muda kwa rasilimali za AWS" → Cognito. Linganisha: IAM ni kwa wahandisi na huduma zako; Cognito ni kwa wateja wako.

---

**AWS Certificate Manager (ACM)** *(Sura ya 16)*

Inatoa vyeti vya umma vya TLS/SSL bila malipo kwa huduma zinazosimamiwa na AWS (ALB, CloudFront, API Gateway) na inashughulikia mzunguko mzima wa maisha — hakuna kalenda ya kurejesha, hakuna ushughulikiaji wa ufunguo wa faragha. Inajirejesha kiotomatiki kupitia uthibitishaji wa DNS.

Dhana muhimu: Uthibitishaji wa DNS dhidi ya barua pepe, kujirejesha kiotomatiki, vyeti vya CloudFront lazima viwe katika us-east-1, vyeti vya umma vya bure haviwezi kusafirishwa (chaguo la kulipia linaloweza kusafirishwa lipo tangu 2025).

Ishara ya mtihani: "HTTPS kwenye kisambazaji cha mzigo au CDN," "kurejesha kiotomatiki kwa cheti" → ACM.

---

**Amazon Macie** *(Sura ya 17)*

Ugunduzi wa data nyeti kwa S3. Inatumia kujifunza kwa mashine na ulinganishaji wa mifumo kupata PII (majina, namba za kadi, vitambulisho) katika ndoo na kuashiria hatari za ufikiaji kama uwazi wa umma. Inakamilisha GuardDuty: GuardDuty inaangalia tabia; Macie inakagua kile kilichohifadhiwa.

Dhana muhimu: Vitambuzi vya data vinavyosimamiwa (mifumo ya PII), wigo wa S3-pekee, matokeo kwa Security Hub/EventBridge.

Ishara ya mtihani: "Gundua PII katika S3," "tambua uwazi wa data nyeti" → Macie.

---

**AWS Control Tower** *(Sura ya 14)*

Inafanya kiotomatiki usanidi na utawala wa mazingira ya akaunti nyingi. Inaunda landing zone — akaunti za usimamizi, kumbukumbu ya logi, na ukaguzi zilizounganishwa awali na Organizations, CloudTrail, Config, na guardrails — katika dakika badala ya siku za uunganishaji wa mkono.

Dhana muhimu: Landing zone, guardrails (za kuzuia = SCP, za kugundua = sheria za Config), Account Factory kwa akaunti mpya zilizosanifishwa.

Ishara ya mtihani: "Sanidi na tawala mazingira mapya ya akaunti nyingi na mbinu bora kiotomatiki" → Control Tower. Linganisha: Organizations ni block ya msingi ghafi; Control Tower ni mkusanyiko wa kiotomatiki.

---

## Ujumbe na Usindikaji wa Matukio

**SQS — Simple Queue Service** *(Sura ya 19)*

Foleni ya ujumbe inayosimamiwa. Watayarishaji wanatuma ujumbe; watumiaji wanasoma na kuufuta. Inatenganisha huduma: mtumaji hahitaji kujua kama mpokeaji yupo. Standard queues: utoaji wa angalau-mara-moja, mpangilio wa juhudi bora. FIFO queues: usindikaji wa mara-moja-tu, mpangilio mkali.

Dhana muhimu: Visibility timeout (ujumbe umefichwa kutoka kwa watumiaji wengine wakati wa usindikaji), Dead Letter Queue (DLQ) kwa ujumbe unaoshindwa mara kwa mara, Uhifadhi wa ujumbe (siku 4 chaguo-msingi, hadi 14), Long polling (punguza majibu matupu), Mzigo wa juu wa 256KB kwa chaguo-msingi (unaoweza kuinuliwa hadi 1 MiB tangu 2025; kwa mizigo mikubwa zaidi, Extended Client Library inahifadhi mwili katika S3).

Ishara ya mtihani: "Tenganisha huduma," "buffer maombi wakati wa msongo wa mzigo," "usindikaji wa async" → SQS. "Mpangilio ni muhimu na mara-moja-tu inahitajika" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Sura ya 19)*

Huduma ya pub/sub inayosimamiwa. Wachapishaji wanatuma ujumbe kwa topic; wajitokezaji wote wanapokea nakala. Mfumo wa fan-out: ujumbe mmoja → watumiaji wengi. Itifaki: SQS, Lambda, HTTP/HTTPS, barua pepe, SMS, msukumo wa simu.

Dhana muhimu: Topic, subscription, mfumo wa fan-out (SNS → foleni nyingi za SQS), kuchuja ujumbe (wajitokezaji wanapokea ujumbe unaolingana pekee).

Ishara ya mtihani: "Tuma arifa kwa endpoint nyingi kwa wakati mmoja," "sambaza tukio moja kwa watumiaji wengi" → SNS. Mfumo wa kawaida: SNS + SQS kwa fan-out ya kudumu.

---

**EventBridge** *(Sura ya 22)*

Basi la matukio kwa kujenga miundo inayoendelewa na matukio. Inapitisha matukio kutoka huduma za AWS, washirika wa SaaS, na vyanzo vya kawaida kwa Lambda, SQS, SNS, Step Functions, na malengo mengine. Inaunga mkono sheria za ratiba (cron) na ulinganishaji wa mifumo.

Ishara ya mtihani: "Pitisha matukio kutoka huduma za AWS kwa malengo," "panga ratiba ya vitendo vya Lambda," "uratibu unaoendelewa na matukio" → EventBridge.

---

**Step Functions** *(Sura ya 22)*

Uratibu wa mtiririko wa kazi bila seva. Inaratibu vitendo vya Lambda, kazi za ECS, DynamoDB, SNS, SQS, na huduma nyingine kuwa mashine za hali za kuona. Inashughulikia urejeshaji, ushughulikiaji wa hitilafu, matawi sambamba, na hali za kusubiri.

Dhana muhimu: Mashine ya hali, aina za hali (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (mara-moja-tu, za muda mrefu) dhidi ya Express Workflows: Asynchronous (angalau-mara-moja, kiasi kikubwa — buni kazi ziwe za idempotent) na Synchronous (zaidi-mara-moja, inarudisha matokeo moja kwa moja kama wito wa API).

Ishara ya mtihani: "Ratibu vitendo vingi vya Lambda," "mtiririko wa kazi wa muda mrefu wenye mantiki ya urejeshaji," "hatua za idhini ya kibinadamu" → Step Functions.

---

**Kinesis** *(Sura ya 26)*

Utiririshaji wa data wa wakati halisi. Kinesis Data Streams: mtiririko wa rekodi wa kudumu, wenye mpangilio (kama logi ya commit iliyosambaa). Watumiaji wanasindika rekodi; data inahifadhiwa saa 24 (chaguo-msingi) hadi siku 365 (ikiwa na Extended Data Retention). Amazon Data Firehose (zamani Kinesis Data Firehose): utoaji unaosimamiwa kikamilifu kwa S3, Redshift, OpenSearch, Splunk — hakuna usimamizi wa mtumiaji unaohitajika.

Dhana muhimu: Shard (kitengo cha upitishaji: 1MB/s kuandika, 2MB/s kusoma), partition key (huamua ugawaji wa shard), namba ya mfuatano, checkpointing (KCL au Lambda), Firehose dhidi ya Streams.

Ishara ya mtihani: "Utiririshaji wa wakati halisi," "rekodi zenye mpangilio," "rudia matukio" → Kinesis Data Streams. "Toa data ya utiririshaji kwa S3/Redshift bila kusimamia watumiaji" → Amazon Data Firehose (maswali ya zamani yanaweza kusema "Kinesis Data Firehose"). "SQL kwenye data ya utiririshaji" → Amazon Managed Service for Apache Flink (zamani Kinesis Data Analytics). Linganisha na SQS: Kinesis inahifadhi na kurudia; SQS inafuta wakati wa matumizi.

---

**Amazon MQ** *(Sura ya 19)*

Huduma ya broker ya ujumbe inayosimamiwa inayounga mkono Apache ActiveMQ na RabbitMQ. Inaunga mkono itifaki za ujumbe za kiwango cha sekta: AMQP, STOMP, MQTT, OpenWire, na WebSocket. Matumizi makuu ni uhamiaji wa kuinua-na-kuhamisha wa mzigo wa broker ya ujumbe ya ndani — programu ambazo tayari zinatumia ActiveMQ au RabbitMQ zinaweza kuunganisha bila mabadiliko ya nambuli.

Dhana muhimu: Chaguo la injini ya ActiveMQ dhidi ya RabbitMQ, msaada wa itifaki (AMQP/STOMP/MQTT), usanidi wa broker wa kipengele kimoja au wa active/standby kwa HA.

Ishara ya mtihani: "Hamisha ActiveMQ au RabbitMQ ya ndani kuingia AWS bila kubadilisha nambuli ya programu" → Amazon MQ. "Ujumbe wa asili wa AWS wa greenfield" → SQS au SNS (rahisi zaidi, unaopanua zaidi).

---

## Uchambuzi

**Athena** *(Sura ya 26)*

Hoja za SQL bila seva kwenye data iliyohifadhiwa katika S3. Hakuna miundombinu ya kusimamia. Lipa kwa hoja (kwa TB iliyochanganuliwa). Bora zaidi na fomati za safu (Parquet, ORC) na data iliyogawanywa.

Ishara ya mtihani: "Hoji data ya S3 na SQL," "uchambuzi wa papo hapo kwenye ziwa la data," "hakuna usimamizi wa miundombinu" → Athena.

---

**Glue** *(Sura ya 26)*

Huduma ya ETL (Extract, Transform, Load) bila seva. Glue Crawlers zinagundua data na kusasisha Glue Data Catalog. Glue Jobs zinaendesha mabadiliko ya Spark au Python. Data Catalog inajumuika na Athena, Redshift Spectrum, na EMR.

Ishara ya mtihani: "Badilisha na pakia data kwa uchambuzi," "gundua schema ya data ya S3," "mfumo wa ETL" → Glue.

---

**Amazon QuickSight** *(Sura ya 26)*

Huduma ya akili ya biashara na uonyeshaji wa data inayosimamiwa. Inatumia SPICE (Super-fast, Parallel, In-memory Calculation Engine), injini ya kumbukumbu inayohifadhi data iliyoletwa kwa uonyeshaji wa haraka wa dashibodi. Inaunganisha na Athena, S3, Redshift, RDS, na vyanzo vingine vya data vya AWS. Hakuna seva ya BI ya kusimamia.

Dhana muhimu: SPICE (injini ya kumbukumbu), seti za data, uchambuzi, dashibodi, ML Insights (kugundua hitilafu, utabiri), usalama wa kiwango cha safu na kiwango cha safuwima.

Ishara ya mtihani: "Dashibodi ya BI kwenye AWS bila kusimamia seva," "onyesha data kutoka Athena au Redshift" → QuickSight.

---

**AWS Lake Formation** *(Sura ya 26)*

Tabaka la udhibiti wa ufikiaji wa ziwa la data lililounganishwa juu ya S3 na Glue Data Catalog. Inatoa ruhusa za kina katika kiwango cha jedwali, safuwima, na safu — za kina zaidi kuliko sera za ndoo za S3 pekee. Inarahisisha kusanidi ziwa salama la data: Lake Formation inashughulikia mfano wa ruhusa; Glue inashughulikia katalogi; S3 inashikilia data.

Dhana muhimu: Ruhusa za ziwa la data (kiwango cha jedwali/safuwima/safu), muunganiko wa Glue Data Catalog, LF-tags kwa udhibiti wa ufikiaji unaotegemea sifa, kutoa/kufuta kwa kati kwa hoja za Athena na Redshift Spectrum.

Ishara ya mtihani: "Udhibiti wa ufikiaji wa kina kwenye ziwa la data," "usalama wa kiwango cha safuwima au safu kwenye data ya S3" → Lake Formation.

---

## Upatikanaji wa Juu na Uokoaji wa Maafa

**Multi-AZ na Multi-Region** *(Sura ya 18)*

Multi-AZ: unakili sambamba ndani ya mkoa kwa kuhamia kiotomatiki (RDS Multi-AZ, kisambazaji cha mzigo katika AZ). RPO ~0, RTO ~60s kwa RDS. Multi-Region: unakili asiyo sambamba kwa uzazi wa kijiografia na ucheleweshaji mdogo kwa watumiaji wa kimataifa.

Dhana muhimu: RTO (Recovery Time Objective — muda gani wa kupona), RPO (Recovery Point Objective — kiasi gani cha data kinaweza kupotea). Mikakati ya Pilot Light, Warm Standby, Active-Active DR.

Ishara ya mtihani: Tofautisha kati ya hitilafu za kiwango cha AZ (Multi-AZ inashughulikia) dhidi ya hitilafu za mkoa (Multi-Region inashughulikia). Gharama na ugumu vinaongezeka kwa kiasi kikubwa na Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(Sura ya 18)*

Uokoaji wa maafa unaosimamiwa kwa seva (za ndani au EC2). Inanakili kwa kuendelea seva chanzo block kwa block kuingia eneo la maandalizi la gharama nafuu na kuzindua vipengele kamili vya uokoaji katika dakika inapohitajika — pilot light inayosimamiwa: nyakati za uokoaji za karibu-warm-standby kwa bei za karibu na backup-and-restore.

Dhana muhimu: Unakili endelevu wa kiwango cha block, eneo la maandalizi la gharama nafuu, uzinduzi wa uokoaji wa kwa-haja, uokoaji wa pointi-katika-wakati.

Ishara ya mtihani: "Punguza muda wa kutokufanya kazi na upotezaji wa data kwa mzigo unaotegemea seva ikiwa na huduma ya DR inayosimamiwa," "pilot light bila kuijenga mwenyewe" → DRS.

---

## Uimarishaji wa Gharama

**Mifano ya Bei ya EC2** *(Sura ya 27)*

On-Demand: bei kamili, bila kujitolea. Reserved Instances (mwaka 1 au 3): punguzo la 30-72% kwa aina maalum ya kipengele. Savings Plans (Compute au EC2 Instance): matumizi ya saa yaliyojitolewa kwa unyumbufu. Spot: punguzo la 60-90% kwa mzigo unaoweza kukatizwa.

Ishara ya mtihani: "Punguza gharama kwa mzigo unaotabirika" → Savings Plans au Reserved Instances. "Usindikaji wa bechi unaovumilia hitilafu" → Spot. "Usiotabirika au wa muda mfupi" → On-Demand.

---

**Bei ya Uhamishaji wa Data** *(Sura ya 30)*

Kuingia AWS: bila malipo. AZ ile ile: bila malipo. Toka AZ hadi AZ: $0.01/GB kila mwelekeo. Toka mkoa hadi mkoa: $0.02-0.08/GB. Intaneti (kutoka): ~$0.09/GB. Usindikaji wa NAT Gateway: $0.045/GB. Uhamishaji wa data wa CloudFront ni nafuu zaidi kuliko EC2-kwa-intaneti moja kwa moja, na uchakatishaji unapunguza kiasi cha jumla.

Ishara ya mtihani: "Punguza gharama za uhamishaji wa data kwa S3/DynamoDB kutoka subnet ya faragha" → Gateway Endpoints (bila malipo). "Punguza gharama za NAT Gateway kwa huduma nyingine" → Interface Endpoints.

---

## Uangalizi

**CloudWatch** *(inarejelewa katika kitabu chote)*

Ufuatiliaji na uangalizi. CloudWatch Metrics: data ya mfululizo wa wakati ya kinambari kutoka huduma za AWS na programu za kawaida. CloudWatch Logs: kusanya, tafuta, na kuchambua data ya logi. CloudWatch Alarms: zindua arifa au kupanua kiotomatiki kulingana na vizingiti vya metriki. CloudWatch Dashboards: onyesha metriki.

Dhana muhimu: Vipimo vya metriki, vipindi vya uhifadhi, vikundi vya logi na mitiririko ya logi, vichujio vya metriki, CloudWatch Agent (kwa metriki za kiwango cha OS na logi kutoka EC2), Container Insights.

---

**CloudTrail** *(inarejelewa katika kitabu chote)*

Inarekodi kila wito wa API uliofanywa katika akaunti yako ya AWS: nani aliufanya, kutoka wapi, lini, na jibu lilikuwa nini. Trail ya mikoa mingi inahifadhi logi katika S3 bila mwisho. Inatumika kwa ukaguzi wa usalama, utii, na uchunguzi wa matukio.

Ishara ya mtihani: "Nani alifuta rasilimali hiyo?" "Kagua shughuli zote za API" → CloudTrail.

---

**X-Ray** *(Sura ya 20)*

Ufuatiliaji uliosambaa: inafuata maombi binafsi katika huduma (traces → segments → subsegments), inajenga ramani ya huduma yenye viwango vya ucheleweshaji na hitilafu kwa kila hatua. Sampling inaweka gharama ya ziada chini; annotations zinafanya traces zitafutike. Active tracing inawashwa kwenye hatua za Lambda na API Gateway.

Ishara ya mtihani: "Fuata maombi katika microservices," "tafuta kizuizi kati ya huduma" → X-Ray (si CloudWatch, si CloudTrail).

---

**AWS Config** *(inarejelewa katika Sura ya 31)*

Inafuatilia mabadiliko ya usanidi wa rasilimali kwa muda. Inatathmini rasilimali dhidi ya sheria za utii. Inarekodi historia ya kila mabadiliko ya usanidi kwa kila rasilimali. Inajumuika na Systems Manager kwa urekebishaji.

Ishara ya mtihani: "Je, rasilimali hii inazingatia sera yetu ya usalama?" "Usanidi wa rasilimali hii ulionekanaje wiki iliyopita?" → AWS Config.

---

## Well-Architected

**Nguzo Sita** *(Sura ya 31)*

| Nguzo                  | Swali la msingi                           | Huduma muhimu                                     |
|------------------------|-------------------------------------------|---------------------------------------------------|
| Operational Excellence | Je, tunaendesha vizuri?                   | CloudWatch, CloudTrail, SSM, Config               |
| Security               | Je, tumelindwa?                           | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability            | Je, tunapona kutoka kwa hitilafu?         | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Performance Efficiency | Je, tunatumia rasilimali sahihi?          | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization      | Je, tunatumia pesa kwa busara?            | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Sustainability         | Je, tunapunguza athari za mazingira?      | Right-sizing, Graviton, madaraja ya uhifadhi yenye ufanisi |

AWS Well-Architected Tool: inatathmini usanifu wako dhidi ya nguzo sita. Tumia kabla ya mtihani ili kuelewa hoja nyuma ya maswali ya kila nguzo.
