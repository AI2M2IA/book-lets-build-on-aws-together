# Kiambatisho C: Daftari la Dhana

Kila dhana muhimu iliyoanzishwa katika kitabu, inaoanishwa na sura yake, mfano uliotumika, na kikoa cha SAA-C03 inapoonekana.

Tumia hii kama faharisi ya kusomea: ukiwa na shaka kuhusu dhana kabla ya mtihani, ipate hapa na urudi sura yake kwa muktadha.

---

## A

**ACU (Aurora Capacity Unit)** — Kitengo cha kupima uwezo wa Aurora Serverless v2. Hupanua kiotomatiki. Sura ya 24. Kikoa cha 3.

**Tahadhari (CloudWatch Alarm)** — Sheria inayowaka kipimo kinapovuka kiwango cha mwisho, kuzindua arifa au kitendo cha kupanua kiotomatiki. Sura ya 7. Kikoa cha 2.

**ALB (Application Load Balancer)** — Kisambazaji cha mzigo cha Tabaka 7 kinachopitisha trafiki ya HTTP/HTTPS kulingana na sheria za njia na mwenyeji. Sura ya 7. Kikoa cha 2.

**AMI (Amazon Machine Image)** — Templeti iliyo na OS, programu, na usanidi kwa kipengele cha EC2. Sura ya 4. Kikoa cha 3.

**Mtazamo wa msanifu** — Kuuliza "kinachosimama kwanza ni nini, tunajuaje, na mtu anafanya nini saa 3 asubuhi?" badala ya "hii inafanya kazi vipi tu?" Sura za 32 na 34. Msalaba wa vikoa.

**Rekodi ya Uamuzi wa Usanifu (ADR)** — Hati fupi inayonasa uamuzi, mbadala zake, sababu yake, na kinachoweza kusababisha kuupitia upya. Sura ya 32. Msalaba wa vikoa.

**Mapitio ya usanifu** — Mchakato ulioandaliwa unaoshughulikia: vizuizi → yasiyojulikana → chaguo → hali za kushindwa → ufuatiliaji → vitabu vya maelekezo. Sura ya 32. Msalaba wa vikoa.

**Athena** — Huduma ya maswali ya SQL bila seva kwa data katika S3. Lipa kwa TB inayochunguzwa. Bora na miundo ya nguzo ya Parquet/ORC. Sura ya 26. Kikoa cha 3.

**Auto Scaling Group (ASG)** — Kikundi cha vipengele vya EC2 vinavyosimamiwa pamoja, kubadilisha kiotomatiki vipengele visivyo na afya na kupanua kulingana na mzigo. Sura ya 7. Vikoa vya 2 na 3.

**Availability Zone (AZ)** — Kituo kimoja au zaidi cha data kilichotengwa kimwili ndani ya mkoa, kilichounganishwa na viungo vya latency ndogo. Sura ya 2. Kikoa cha 2.

---

## B

**Ndoo (S3 Bucket)** — Chombo cha vitu vya S3. Ndoo zina majina ya kipekee ya kimataifa na huishi katika mkoa maalum. Sura ya 5. Kikoa cha 3.

**Sera ya ndoo** — Sera inayotegemea rasilimali iliyoambatishwa kwa ndoo ya S3 inayodhibiti ufikiaji kwa wasingi wa IAM na akaunti za nje. Sura ya 5. Kikoa cha 1.

---

## C

**Mchakato wa kashe-pembeni** — Programu inakagua kashe kwanza; ikipoteza, inauliza hifadhidata, kisha kuhifadhi matokeo kwenye kashe. Sura ya 10. Kikoa cha 3.

**Kiwango cha maombi ya kashe** — Asilimia ya maombi yanayohudumishwa kutoka kashe badala ya chanzo. Cha juu ni bora. Sura ya 13. Kikoa cha 3.

**CloudFront** — CDN ya AWS. Huhifadhi maudhui kwenye maeneo ya pembeni 400+ duniani kote. Hupunguza latency na gharama za uhamishaji wa data za chanzo. Sura ya 13. Vikoa vya 3 na 4.

**CloudTrail** — Huandika kila wito wa API wa AWS: nani, nini, lini, kutoka wapi. Imehifadhiwa katika S3. Hutumika kwa ukaguzi na uchunguzi wa matukio. Kikoa cha 1.

**CloudWatch** — Vipimo, kumbukumbu, tahadhari, na dashibodi kwa rasilimali za AWS na programu za kawaida. Rejelewa kote. Vikoa vyote.

**Kuanza baridi (Lambda)** — Ucheleweshaji kwenye uanzishaji wa kwanza (au baada ya kutokuwa na shughuli) Lambda ikianzisha mazingira ya utekelezaji. Tumia uanzishaji uliotolewa wa utekelezaji wa wakati mmoja kuuondoa. Sura ya 20. Kikoa cha 3.

**Mpango wa Akiba wa Kompyuta** — Kujitolea kwa kiasi cha matumizi ya kwa saa ya EC2, ukitumika kwa aina yoyote ya kipengele au ukubwa. Sura ya 27. Kikoa cha 4.

**Config (AWS)** — Hufuatilia mabadiliko ya usanidi wa rasilimali za AWS kwa wakati na kukadiria uzingatifu dhidi ya sheria. Sura ya 31. Kikoa cha 1.

**Uhamishaji wa data wa toka AZ hadi AZ** — Trafiki kati ya Availability Zones ndani ya mkoa. Inalipwa kwa $0.01/GB kwa kila upande. Sura ya 30. Kikoa cha 4.

**Upokezaji wa toka kanda hadi kanda** — Kunakili data (S3 CRR, Aurora Global, DynamoDB Global Tables) kwa mkoa tofauti. Husababisha ada za uhamishaji wa data. Sura za 18 na 30. Kikoa cha 2.

---

## D

**DAX (DynamoDB Accelerator)** — Kashe ya kwenye kumbukumbu maalum kwa DynamoDB. Latency ya kusomwa ya microsekunde. Sura ya 9. Kikoa cha 3.

**Foleni ya Barua Pepe Iliyokufa (DLQ)** — Foleni ambapo ujumbe unaoshindwa usindikaji mara kwa mara unaposasishwa, kuzuia kizuizi cha foleni. Sura ya 19. Kikoa cha 2.

**Mwenyeji Maalum** — Seva ya kimwili ya EC2 iliyohifadhiwa kwa matumizi yako peke yako. Inahitajika kwa leseni fulani za programu. Sura ya 27. Kikoa cha 4.

**Ulinzi wa kina** — Kuweka vidhibiti vingi vya usalama (IAM + vikundi vya usalama + NACL + WAF + GuardDuty) ili ukiukaji wa tabaka moja usifichua mfumo. Sura ya 33. Kikoa cha 1.

**Direct Connect** — Muunganisho wa mtandao wa kimwili uliowekwa kutoka eneo la ndani hadi AWS. Thabiti zaidi kuliko VPN. Sura ya 25. Kikoa cha 3.

**DLQ** — Ona Foleni ya Barua Pepe Iliyokufa.

**DynamoDB** — Hifadhidata ya NoSQL inayosimamiwa kikamilifu yenye latency ya millisekunde moja kwa kiwango chochote. Mfano wa thamani-muhimu na hati. Sura ya 9. Kikoa cha 3.

**DynamoDB Auto Scaling** — Hurekebisha kiotomatiki uwezo uliotolewa wa kusomwa/kuandika kulingana na vipimo vya CloudWatch. Sura ya 29. Kikoa cha 4.

**DynamoDB Streams** — Kumbukumbu ya mabadiliko yaliyoandaliwa kwa wakati ya mabadiliko yote ya kipengele katika jedwali la DynamoDB. Hutumika na Lambda kwa usindikaji unaoendelewa na matukio. Sura ya 9. Kikoa cha 2.

---

## E

**EBS (Elastic Block Store)** — Uhifadhi wa kuzuia uliounganishwa na kipengele kimoja cha EC2. Hudumu kwa kujitegemea. Aina: gp3, io2, st1. Sura ya 6. Kikoa cha 3.

**EC2 (Elastic Compute Cloud)** — Mashine za kawaida katika wingu. Sura ya 4. Kikoa cha 3.

**ECS (Elastic Container Service)** — Uratibu wa vyombo unaosimamiwa. Aina ya uzinduzi ya Fargate inaondoa usimamizi wa seva. Sura ya 21. Vikoa vya 2 na 3.

**EFS (Elastic File System)** — Mfumo wa faili wa NFS unaoshirikiwa unaoweza kufikiwa kutoka vipengele vingi vya EC2. Hupanua kiotomatiki. Sura ya 6. Kikoa cha 3.

**EKS (Elastic Kubernetes Service)** — Ndege la udhibiti la Kubernetes linayosimamiwa kwenye AWS. Sura ya 21. Kikoa cha 3.

**ElastiCache** — Kuhifadhi kwa kwenye kumbukumbu kunakosimamiwa. Redis (vipengele vya utajiri) au Memcached (rahisi zaidi). Sura ya 10. Kikoa cha 3.

**IP ya Elastic** — Anwani ya IP ya umma thabiti unayoweza kugawa na kuunganisha upya na vipengele vya EC2. Sura ya 11. Kikoa cha 3.

**Usimbaji fiche wa bahasha** — Mchakato ambapo data imefichwa na ufunguo wa data (DEK), na DEK imefichwa na ufunguo wa msingi (CMK katika KMS). Sura ya 16. Kikoa cha 1.

**EventBridge** — Basi ya matukio kwa kupitishia matukio kutoka huduma za AWS, washirika wa SaaS, na vyanzo vya kawaida hadi malengo. Inasaidia sheria za ratiba. Sura ya 22. Kikoa cha 2.

**Kukataa wazi** — Kauli ya kukataa ya IAM isiyoweza kupitiwa na kuruhusu chochote. Inatangulia maruhusu yote. Sura ya 3. Kikoa cha 1.

---

## F

**Upitishaji wa kushindwa hama (Route 53)** — Hupitisha trafiki kwa sehemu ya mwisho ya sekondari sehemu ya mwisho ya msingi ikishindwa ukaguzi wa afya. Sura ya 12. Kikoa cha 2.

**Fargate** — Injini ya kompyuta bila seva kwa ECS na EKS. Hakuna vipengele vya EC2 vya kusimamia. Sura ya 21. Kikoa cha 3.

**Mchakato wa fan-out** — Mada moja ya SNS inatoa ujumbe ule ule kwa foleni nyingi za SQS wakati mmoja. Sura ya 19. Kikoa cha 2.

**Foleni ya FIFO (SQS)** — Usindikaji wa mara moja haswa, mpangilio mkali. Uendeshaji wa chini kuliko foleni za kawaida. Sura ya 19. Kikoa cha 2.

**Hali ya kushindwa** — Njia maalum mfumo unaweza kushindwa. Kutambua hali za kushindwa kabla ya uzalishaji ni msingi wa mapitio ya usanifu. Sura ya 32. Msalaba wa vikoa.

---

## G

**Sehemu ya Mwisho ya Lango** — Aina ya bure ya sehemu ya mwisho ya VPC kwa S3 na DynamoDB. Hupitisha trafiki kupitia mtandao wa kibinafsi wa AWS, kuondoa ada za NAT Gateway. Sura ya 30. Kikoa cha 4.

**Upitishaji wa Jiografia (Route 53)** — Hupitisha kulingana na mahali pa kijiografia pa asili ya swali la DNS. Sura ya 12. Kikoa cha 3.

**Global Accelerator** — Hupitisha trafiki hadi pembeni ya AWS iliyo karibu kupitia Anycast, kuboresha latency kwa programu za nguvu. Sura ya 25. Kikoa cha 3.

**Glue (AWS)** — ETL bila seva. Watambazaji wa Glue hugundua mpango; Kazi za Glue hubadilisha data; Katalogi ya Data huhifadhi metadata. Sura ya 26. Kikoa cha 3.

**GSI (Global Secondary Index)** — Faharisi mbadala kwenye jedwali la DynamoDB yenye ufunguo tofauti wa sehemu na ufunguo wa kupanga wa hiari. Inaruhusu mifumo ya maswali yenye kubadilika. Sura ya 9. Kikoa cha 3.

**GuardDuty** — Huduma ya ugunduzi wa vitisho kwa kutumia ML kwenye CloudTrail, Kumbukumbu za Mtiririko wa VPC, na kumbukumbu za DNS kugundua shughuli zisizo za kawaida. Sura ya 17. Kikoa cha 1.

---

## H

**Ukaguzi wa afya (Route 53)** — Hufuatilia upatikanaji wa sehemu ya mwisho. Ukaguzi wa afya uliokataliwa huanzisha upitishaji wa kushindwa hama. Sura ya 12. Kikoa cha 2.

**Sehemu ya moto (DynamoDB)** — Sehemu inayopokea trafiki inayozidi kwa sababu maombi mengi yanashiriki ufunguo ule ule wa sehemu. Sura ya 9. Kikoa cha 3.

---

## I

**IAM (Identity and Access Management)** — Hudhibiti uthibitisho na idhini kwa akaunti za AWS. Watumiaji, vikundi, majukumu, sera. Sura za 3 na 14. Kikoa cha 1.

**Jukumu la IAM** — Utambulisho wa IAM yenye vitambulisho vya muda, vilivyodhaniwa na huduma, watumiaji, au akaunti nyingine. Sura za 3 na 14. Kikoa cha 1.

**Idempotency** — Mali ya shughuli inayozalisha matokeo yale yale iitwapo mara moja au mara nyingi. Muhimu kwa mifumo iliyosambazwa (malipo, marejesho, usindikaji wa agizo). Sura ya 32. Msalaba wa vikoa.

**Ufunguo wa idempotency** — Kitambulisho cha kipekee kwa shughuli, kilichoangaliwa kabla ya utekelezaji kuzuia usindikaji wa nakala. Sura ya 32. Msalaba wa vikoa.

**Sehemu ya Mwisho ya Kiolesura (PrivateLink)** — Sehemu ya mwisho ya VPC kwa huduma nyingi za AWS. Bei kwa saa + kwa GB. Hutoa muunganisho wa kibinafsi bila mtandao au NAT. Sura ya 30. Kikoa cha 4.

**Lango la Mtandao (IGW)** — Inaruhusu vipengele katika subnet za umma kuwasiliana na mtandao. Inahitaji jedwali la njia la subnet kuwa na njia hadi IGW. Sura ya 11. Kikoa cha 3.

**"Inategemea"** — Jibu la uaminifu kwa maswali mengi ya usanifu, ambalo lazima daima kukamilishwe: "Inategemea mchakato wa ufikiaji / kiwango / matokeo ya kushindwa / kizuizi cha gharama." Sura ya 33. Msalaba wa vikoa.

---

## K

**Kinesis Data Firehose** — Utoaji unaosimamiwa wa data ya utiririko kwa S3, Redshift, OpenSearch. Hakuna usimamizi wa mlaji. Sura ya 26. Kikoa cha 3.

**Kinesis Data Streams** — Mkondo wa tukio wa wakati halisi ulioandaliwa. Wa kudumu, unaorudiwa. Hupimwa kwa vipande. Sura ya 26. Kikoa cha 3.

**KMS (Key Management Service)** — Huunda, kuhifadhi, na kudhibiti vifunguo vya kriptografia kwa usimbaji fiche wakati wa mapumziko. Sura ya 16. Kikoa cha 1.

---

## L

**Lambda** — Vitendo bila seva vilivyozinduliwa na matukio. Lipa kwa uanzishaji na kwa millisekunde. Muda wa juu wa dakika 15. Sura ya 20. Vikoa vya 2, 3, 4.

**Lambda@Edge** — Vitendo vya Lambda vinavyofanya kazi kwenye maeneo ya pembeni ya CloudFront, kubadilisha maombi na majibu. Sura ya 13. Kikoa cha 3.

**Upitishaji wa kulingana na latency (Route 53)** — Hupitisha maswali ya DNS kwa mkoa wa AWS wenye latency iliyopimwa ya chini zaidi. Sura ya 12. Kikoa cha 3.

**Templeti ya uzinduzi** — Templeti yenye toleo inayobainisha usanidi wa kipengele cha EC2 kwa Vikundi vya Kupanua Kiotomatiki. Sura ya 7. Kikoa cha 3.

**Upendeleo mdogo** — Mbinu bora ya IAM: toa ruhusa zinazohitajika tu, si zaidi. Sura ya 3. Kikoa cha 1.

**Sera ya mzunguko wa maisha (S3)** — Sheria zinazohamia kiotomatiki vitu kwa madarasa ya uhifadhi bei nafuu au kuvifuta kulingana na umri. Sura ya 23. Kikoa cha 4.

**LSI (Local Secondary Index)** — Faharisi mbadala kwenye jedwali la DynamoDB kwa kutumia ufunguo ule ule wa sehemu lakini ufunguo tofauti wa kupanga. Lazima uundwe wakati wa uundaji wa jedwali. Sura ya 9. Kikoa cha 3.

---

## M

**Memcached** — Injini ya kuhifadhi kwenye kumbukumbu rahisi, yenye nyuzi-nyingi. Hakuna kudumu, hakuna miundo ya data. Tumia Redis isipokuwa unahitaji hasa nyuzi-nyingi kwa bei ya vipengele. Sura ya 10. Kikoa cha 3.

**Multi-AZ (RDS)** — Nakala ya hifadhi ya wakati mmoja katika AZ tofauti yenye kushindwa hama kwa kiotomatiki. RPO ~0, RTO ~sekunde 60. Kwa upatikanaji wa juu, si kupanua kusomwa. Sura za 8 na 18. Kikoa cha 2.

**Multi-Region** — Kupeleka vipengele vya programu katika mikoa mingi ya AWS kwa upungufu wa kijiografia na utendaji wa kimataifa. Ugumu na gharama ya juu zaidi. Sura ya 18. Kikoa cha 2.

---

## N

**NACL (Network Access Control List)** — Ngome isiyo na hali kwenye kiwango cha subnet. Inahitaji sheria zote za inbound na outbound. Sheria zinakadiria kwa mpangilio wa nambari. Sura ya 15. Kikoa cha 1.

**NAT Gateway** — Inaruhusu vipengele katika subnet za kibinafsi kufanya miunganisho ya nje kwa mtandao. Inalipwa kwa $0.045/GB iliyoshughulikiwa. Sura za 11 na 30. Kikoa cha 4.

---

## O

**Kitu (S3)** — Faili iliyohifadhiwa katika S3. Ina funguo (jina), thamani (data), na metadata. Ukubwa wa juu TB 5. Sura ya 5. Kikoa cha 3.

**Uwezo wa hiari (DynamoDB)** — Hali ya kulipa kwa ombi. Bei ya juu zaidi kwa ombi kuliko iliyotolewa, lakini hakuna upangaji wa uwezo unaohitajika. Sura ya 29. Kikoa cha 4.

**Vipengele vya On-Demand (EC2)** — Lipa kwa saa bila kujitolea. Kubadilika kwa juu, bei ya juu zaidi. Sura ya 27. Kikoa cha 4.

---

## P

**Ufunguo wa sehemu (DynamoDB)** — Sehemu ya msingi ya ufunguo inayobainisha sehemu gani huhifadhi kipengele. Chagua ufunguo wenye hali nyingi kwa usambazaji sawa. Sura ya 9. Kikoa cha 3.

**Mpaka wa ruhusa** — Sera ya IAM inayoweka ruhusa za juu zaidi ambazo utambulisho wa IAM unaweza kuwa nazo, hata sera nyingine zikitoa zaidi. Sura ya 14. Kikoa cha 1.

**Kikundi cha uwekaji** — Hudhibiti uwekaji wa kimwili wa vipengele vya EC2 kupunguza latency (nguzo) au kuimarisha upatikanaji (kusambaza). Sura ya 4. Kikoa cha 3.

**PrivateLink** — Huduma ya AWS ya kuunda sehemu za mwisho za kibinafsi kwa huduma zinazohifadhiwa katika AWS, zinazopatikana kupitia Sehemu za Mwisho za Kiolesura. Sura ya 30. Kikoa cha 1.

**Uanzishaji uliotolewa wa utekelezaji wa wakati mmoja (Lambda)** — Mazingira ya utekelezaji yaliyoanzishwa mapema yanayoondoa ucheleweshaji wa kuanza baridi. Sura ya 20. Kikoa cha 3.

**Uwezo uliotolewa (DynamoDB)** — Uendeshaji wa kusomwa/kuandika uliotengwa mapema, hupimwa kwa vitengo vya uwezo kwa sekunde. Bei nafuu zaidi kuliko hiari kwa trafiki inayoweza kutabiriwa. Sura za 9 na 29. Kikoa cha 4.

---

## R

**RDS (Relational Database Service)** — Hifadhidata ya uhusiano inayosimamiwa. Hushughulikia nakala, kupiga kiraka, kushindwa hama. Sura ya 8. Kikoa cha 3.

**RDS Proxy** — Husimamia bwawa la miunganisho kati ya Lambda/programu na RDS, kuzuia mwisho wa miunganisho. Sura ya 8. Kikoa cha 3.

**Nakala ya Kusomwa (RDS)** — Nakala ya ucheleweshaji ya hifadhidata kwa kupanua kusomwa. Haitoi kushindwa hama kwa kiotomatiki. Sura za 8 na 24. Kikoa cha 3.

**Redis** — Duka la miundo ya data ya kwenye kumbukumbu linalotumika kwa kuhifadhi, usimamizi wa kikao, ubao wa nguvu wa wakati halisi, pub/sub. Sura ya 10. Kikoa cha 3.

**Kipengele Kilichohifadhiwa (EC2)** — Kujitolea kutumia aina maalum ya kipengele katika mkoa maalum kwa miaka 1 au 3 kwa kubadilishana na punguzo. Sura ya 27. Kikoa cha 4.

**Route 53** — Huduma ya DNS na msajili wa kikoa wa AWS. Inasaidia sera nyingi za upitishaji. Sura ya 12. Vikoa vya 2 na 3.

**RPO (Recovery Point Objective)** — Upotezaji wa juu unaokubaliwa wa data hupimwa kwa wakati. "Tunaweza kupoteza data ngapi?" Sura ya 18. Kikoa cha 2.

**RTO (Recovery Time Objective)** — Wakati wa juu unaokubaliwa wa kurejesha huduma baada ya kushindwa. "Tunaweza kuwa chini kwa muda gani?" Sura ya 18. Kikoa cha 2.

**Kitabu cha maelekezo** — Maelekezo ya hatua kwa hatua ya kuendesha mfumo, hasa kwa majibu ya matukio. "Mtu anafanya nini saa 3 asubuhi?" Sura ya 32. Msalaba wa vikoa.

---

## S

**S3 Intelligent-Tiering** — Huhamisha kiotomatiki vitu vya S3 kati ya tabaka za ufikiaji kulingana na mifumo ya ufikiaji. Hakuna ada ya urejeshaji. Sura ya 23. Kikoa cha 4.

**S3 Select** — Hurejesha sehemu ya maudhui ya kitu cha S3 kwa kutumia maelezo ya SQL, kupunguza uhamishaji wa data. Sura ya 30. Kikoa cha 4.

**Mpango wa Akiba** — Mfano wa bei wa kubadilika unaojitolea kwa kiasi cha matumizi ya kwa saa kwa kubadilishana na punguzo. Yenye kubadilika zaidi kuliko Vipengele Vilivyohifadhiwa. Sura ya 27. Kikoa cha 4.

**SCP (Service Control Policy)** — Sera ya AWS Organizations inayozuia ruhusa za juu zaidi zinazopatikana kwa akaunti katika OU. Sura ya 14. Kikoa cha 1.

**Secrets Manager** — Huhifadhi na kuzungusha kiotomatiki siri (nywila za hifadhidata, funguo za API). Sura ya 16. Kikoa cha 1.

**Kikundi cha usalama** — Ngome ya kawaida ya kawaida kwenye kiwango cha kipengele. Sheria za kuruhusu tu; trafiki ya kurudi ni ya kiotomatiki. Sura ya 15. Kikoa cha 1.

**Kipande (Kinesis)** — Kitengo cha kimsingi cha uendeshaji katika Kinesis Data Streams: kuandika Mbps 1, kusomwa Mbps 2. Sura ya 26. Kikoa cha 3.

**Mfano wa Jukumu la Pamoja** — AWS ina jukumu la usalama *wa* wingu (miundombinu); wewe una jukumu la usalama *katika* wingu (data, usanidi, ufikiaji). Sura ya 1. Kikoa cha 1.

**Shield** — Ulinzi wa DDoS. Standard: bure, wa kiotomatiki. Advanced: wa kulipa, na msaada wa DRT na ulinzi wa kifedha. Sura ya 17. Kikoa cha 1.

**SNS (Simple Notification Service)** — Ujumbe wa pub/sub. Husukuma ujumbe kwa wajiandikishaji wote wakati mmoja. Mchakato wa fan-out. Sura ya 19. Kikoa cha 2.

**Ufunguo wa kupanga (DynamoDB)** — Sehemu ya pili ya hiari ya ufunguo wa msingi. Inaruhusu maswali ya mwelekeo ndani ya sehemu. Sura ya 9. Kikoa cha 3.

**Vipengele vya Nafasi** — Vipengele vya EC2 vinavyotumia uwezo wa ziada kwa punguzo la 60-90%. Vinaweza kukatizwa na notisi ya dakika 2. Kwa mzigo wa ustahimilivu wa hitilafu tu. Sura ya 27. Kikoa cha 4.

**SQS (Simple Queue Service)** — Foleni ya ujumbe inayosimamiwa. Hutenganisha wazalishaji kutoka walaji. Foleni za Kawaida (angalau mara moja) na za FIFO (mara moja haswa). Sura ya 19. Kikoa cha 2.

**Step Functions** — Huduma ya uratibu wa mtiririko wa kazi bila seva. Mashine za hali za kuratibu huduma za AWS. Sura ya 22. Kikoa cha 2.

---

## T

**Kupanua kwa ufuatiliaji wa lengo** — Sera ya Kupanua Kiotomatiki inayorekebisha uwezo kudumisha thamani ya lengo ya kipimo (mfano, matumizi ya CPU ya 60%). Sura ya 7. Kikoa cha 2.

**Transit Gateway** — Topology ya mtandao wa hub-na-bonga inayounganisha VPC nyingi na mitandao ya eneo la ndani kupitia lango kuu. Sura ya 25. Kikoa cha 3.

**TTL (Time to Live)** — Alama ya wakati baada ya DynamoDB kufuta kiotomatiki kipengele. Pia hutumika katika DNS (muda gani wasuluhishi huhifadhi rekodi) na kuhifadhi (muda gani thamani iliyohifadhiwa ni sahihi). Sura za 9 na 12. Kikoa cha 3.

---

## V

**VIF (Virtual Interface)** — Muunganisho wa kimantiki uliotumiwa na AWS Direct Connect. VIF ya umma inafikia sehemu za mwisho za umma za AWS; VIF ya Kibinafsi inafikia rasilimali za VPC. Sura ya 25. Kikoa cha 3.

**Muda wa kutoweka (SQS)** — Kipindi ambacho ujumbe uliopo unaficha kutoka walaji wengine. Inaruhusu usindikaji bila walaji wengine kuona ujumbe ule ule. Sura ya 19. Kikoa cha 2.

**VPC (Virtual Private Cloud)** — Mtandao wa kawaida uliotengwa katika AWS. Una subnet, meza za njia, na malango. Sura ya 11. Kikoa cha 1.

**Sehemu ya Mwisho ya VPC** — Huunganisha rasilimali za VPC kwa huduma za AWS kupitia mtandao wa kibinafsi wa AWS. Lango (bure, S3/DynamoDB) na Kiolesura (bei, huduma nyingi zingine). Sura ya 30. Vikoa vya 1 na 4.

**Kumbukumbu za Mtiririko wa VPC** — Hukamata taarifa kuhusu trafiki ya IP kwenda na kutoka kiolesura cha mtandao katika VPC. Hutumika na GuardDuty na kwa utatuzi wa mtandao. Sura ya 17. Kikoa cha 1.

**Muunganisho wa VPC** — Muunganisho wa mtandao kati ya VPC mbili unaruhusu trafiki kupita kati yake kwa kutumia anwani za IP za kibinafsi. Sura ya 11. Kikoa cha 3.

---

## W

**WAF (Web Application Firewall)** — Huchuja trafiki ya HTTP/HTTPS kwa kutumia sheria (vizuizi vya IP, SQL injection, vikwazo vya kiwango). Huambatishwa na CloudFront, ALB, au API Gateway. Sura ya 17. Kikoa cha 1.

**Mfumo wa Ujenzi Bora** — Mfumo wa nguzo sita wa tathmini wa AWS: Ubora wa Uendeshaji, Usalama, Uaminifu, Ufanisi wa Utendaji, Uimarishaji wa Gharama, na Uendelevu. Sura ya 31. Msalaba wa vikoa.

**Upitishaji wa uzito (Route 53)** — Husambaza maswali ya DNS katika sehemu za mwisho kwa uzito. Hutumika kwa usambazaji wa bluu/kijani na majaribio ya A/B. Sura ya 12. Kikoa cha 3.

**Kuhifadhi kwa kuandika-kupitia** — Husasisha kashe kila wakati hifadhidata inasasishwa. Data daima ni thabiti lakini kashe inaweza kushikilia vipengele vingi ambavyo havisomwi tena. Sura ya 10. Kikoa cha 3.

---

## Rejea ya Haraka ya Mifumo ya SAA-C03

| Mtihani ukisema...                               | Fikiria...                                     |
|--------------------------------------------------|------------------------------------------------|
| "Tenganisha huduma"                              | SQS, SNS, EventBridge                          |
| "Fan-out kwa walaji wengi"                       | Wajiandikishaji wa SNS + SQS                   |
| "Matukio ya wakati halisi yaliyoandaliwa"        | Kinesis Data Streams                           |
| "Bila seva"                                      | Lambda, DynamoDB, Aurora Serverless, Fargate   |
| "Latency ya chini ya kimataifa (nguvu)"          | Global Accelerator                             |
| "Latency ya chini ya kimataifa (thabiti/iliyohifadhiwa)" | CloudFront                            |
| "Ulinzi wa DDoS"                                 | Shield (Standard: bure; Advanced: wa kulipa)   |
| "Zuia SQL injection pembezoni"                   | WAF                                            |
| "Gundua vitambulisho vilivyoathiriwa"            | GuardDuty                                      |
| "Kagua shughuli za API"                          | CloudTrail                                     |
| "Zungusha vitambulisho vya hifadhidata"          | Secrets Manager                                |
| "Ficha data wakati wa mapumziko, vifunguo vinavyosimamiwa na mteja" | KMS yenye CMK             |
| "Hifadhi maadili ya usanidi"                     | SSM Parameter Store                            |
| "Uhifadhi wa IOPS wa juu"                        | io2 EBS                                        |
| "Mfumo wa faili wa pamoja kwa EC2"               | EFS                                            |
| "Uliza data ya S3 kwa SQL"                       | Athena                                         |
| "Mzunguko wa ETL kwa uchambuzi"                  | AWS Glue                                       |
| "Toa data ya utiririko kwa S3"                   | Kinesis Firehose                               |
| "Kazi za kundi za ustahimilivu wa hitilafu, punguza gharama" | Vipengele vya Nafasi          |
| "Mzigo thabiti uliojitolea wa uzalishaji"        | Mipango ya Akiba                               |
| "Subnet ya kibinafsi → S3 bila NAT"              | Sehemu ya Mwisho ya Lango ya S3                |
| "Subnet ya kibinafsi → SQS bila NAT"             | Sehemu ya Mwisho ya Kiolesura ya SQS           |
| "Multi-AZ kwa RDS"                               | Kushindwa hama kwa kiotomatiki (si kupanua kusomwa) |
| "Nakala ya Kusomwa kwa RDS"                      | Kupanua kusomwa (si kushindwa hama kwa kiotomatiki) |
| "Muda wa uokoaji < dakika 1, toka AZ hadi AZ"   | Multi-AZ                                       |
| "Uokoaji katika mikoa, RTO ya dakika"            | Mwanga wa Rubani au Nakala ya Hifadhi ya Joto  |
| "Active-Active, RTO sifuri"                      | Multi-Region Active-Active (ngumu zaidi)       |
